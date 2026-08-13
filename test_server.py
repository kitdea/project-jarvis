#!/usr/bin/env python3
"""Smoke tests for server.py: auth, rate limiting, and the /chat, /remember,
/speak contract. Boots the real server.py as a subprocess against a throwaway
fixture directory (own config.json, viewer/, .env, and a stub `claude` CLI on
PATH) so these exercise actual request handling, not mocks.

Standard library only, matching server.py itself. Run with:
    python3 test_server.py
"""

import http.client
import json
import os
import shutil
import socket
import stat
import subprocess
import sys
import tempfile
import time
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SERVER_PY = os.path.join(HERE, "server.py")

TOKEN = "test-secret-token"


def free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


class JarvisServerFixture:
    """Stages a throwaway vault dir with a stub `claude` CLI and boots
    server.py as a real subprocess against it."""

    def __init__(self, token=TOKEN, rate_limit_max=None):
        self.token = token
        self.rate_limit_max = rate_limit_max
        self.tmp = tempfile.mkdtemp(prefix="jarvis-test-")
        self.port = free_port()
        self.proc = None

    def _write_stub_claude(self):
        bin_dir = os.path.join(self.tmp, "bin")
        os.makedirs(bin_dir, exist_ok=True)
        stub_path = os.path.join(bin_dir, "claude-stub")
        with open(stub_path, "w", encoding="utf-8") as f:
            f.write(
                "#!/usr/bin/env python3\n"
                "import sys\n"
                "sys.stdin.read()\n"
                'print("stub answer")\n'
            )
        st = os.stat(stub_path)
        os.chmod(stub_path, st.st_mode | stat.S_IEXEC)
        return stub_path

    def __enter__(self):
        viewer = os.path.join(self.tmp, "viewer")
        os.makedirs(viewer, exist_ok=True)
        with open(os.path.join(viewer, "index.html"), "w", encoding="utf-8") as f:
            f.write("<html><head></head><body>test</body></html>")
        with open(os.path.join(viewer, "graph-data.js"), "w", encoding="utf-8") as f:
            f.write(
                "const GRAPH = {\"nodes\": [{\"id\": 0, \"label\": \"Test Note\", "
                "\"folder\": \"Project Jarvis\", \"path\": \"Test Note.md\", "
                "\"excerpt\": \"a note about roofing agents\"}]};\n"
            )

        stub_claude = self._write_stub_claude()
        config = {
            "backend": "claude-cli",
            "model": "stub-model",
            "claude_cli": {"command": stub_claude, "timeout_seconds": 30},
            "mcp": {"servers": {}},
            "retrieval": {"top_k": 6, "title_weight": 3.0, "note_chars": 1800,
                          "capture_links": 3},
            "tts": {"enabled": False},
            "history": {"max_turns": 6, "max_sessions": 50},
        }
        with open(os.path.join(self.tmp, "config.json"), "w", encoding="utf-8") as f:
            json.dump(config, f)

        if self.token:
            with open(os.path.join(self.tmp, ".env"), "w", encoding="utf-8") as f:
                f.write("JARVIS_TOKEN=%s\n" % self.token)

        server_copy = os.path.join(self.tmp, "server.py")
        shutil.copyfile(SERVER_PY, server_copy)
        if self.rate_limit_max is not None:
            self._patch_rate_limit(server_copy)

        self.proc = subprocess.Popen(
            [sys.executable, server_copy, "-p", str(self.port)],
            cwd=self.tmp,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        self._wait_for_server()
        return self

    def _patch_rate_limit(self, server_copy):
        with open(server_copy, "r", encoding="utf-8") as f:
            src = f.read()
        src = src.replace(
            "RATE_LIMIT_MAX = 30",
            "RATE_LIMIT_MAX = %d" % self.rate_limit_max,
            1,
        )
        with open(server_copy, "w", encoding="utf-8") as f:
            f.write(src)

    def _wait_for_server(self, timeout=10):
        deadline = time.time() + timeout
        while time.time() < deadline:
            if self.proc.poll() is not None:
                out = self.proc.stdout.read()
                raise RuntimeError("server exited early:\n%s" % out)
            try:
                conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=1)
                conn.request("GET", "/")
                conn.getresponse().read()
                conn.close()
                return
            except (ConnectionRefusedError, socket.timeout, OSError):
                time.sleep(0.1)
        raise RuntimeError("server did not start within %ds" % timeout)

    def __exit__(self, *exc):
        if self.proc:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait()
            if self.proc.stdout:
                self.proc.stdout.close()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def request(self, method, path, body=None, token=None, headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        hdrs = dict(headers or {})
        data = None
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            hdrs["Content-Type"] = "application/json"
        if token:
            hdrs["X-Jarvis-Token"] = token
        conn.request(method, path, body=data, headers=hdrs)
        resp = conn.getresponse()
        raw = resp.read()
        conn.close()
        try:
            parsed = json.loads(raw) if raw else None
        except ValueError:
            parsed = None
        return resp.status, parsed, raw


class AuthTests(unittest.TestCase):
    def test_chat_without_token_is_401(self):
        with JarvisServerFixture() as srv:
            status, payload, _ = srv.request("POST", "/chat", {"question": "hi"})
            self.assertEqual(status, 401)
            self.assertIn("error", payload)

    def test_chat_with_wrong_token_is_401(self):
        with JarvisServerFixture() as srv:
            status, payload, _ = srv.request(
                "POST", "/chat", {"question": "hi"}, token="wrong-token")
            self.assertEqual(status, 401)

    def test_chat_with_correct_token_is_200(self):
        with JarvisServerFixture() as srv:
            status, payload, _ = srv.request(
                "POST", "/chat", {"question": "hi"}, token=TOKEN)
            self.assertEqual(status, 200)
            self.assertEqual(payload["answer"], "stub answer")
            self.assertIn("session_id", payload)

    def test_no_token_configured_leaves_gate_open(self):
        with JarvisServerFixture(token=None) as srv:
            status, payload, _ = srv.request("POST", "/chat", {"question": "hi"})
            self.assertEqual(status, 200)

    def test_remember_and_speak_also_gated(self):
        with JarvisServerFixture() as srv:
            status, _, _ = srv.request("POST", "/remember", {"text": "buy milk"})
            self.assertEqual(status, 401)
            status, _, _ = srv.request("POST", "/speak", {"text": "hi"})
            self.assertEqual(status, 401)


class RateLimitTests(unittest.TestCase):
    def test_requests_over_limit_get_429(self):
        with JarvisServerFixture(rate_limit_max=3) as srv:
            statuses = []
            for _ in range(5):
                status, _, _ = srv.request(
                    "POST", "/chat", {"question": "hi"}, token=TOKEN)
                statuses.append(status)
            self.assertEqual(statuses[:3], [200, 200, 200])
            self.assertIn(429, statuses[3:])

    def test_rate_limit_denial_bypasses_auth_check_order(self):
        # Even a request that would also fail auth should surface as 429 once
        # the limit is blown, since the limiter is checked after auth in
        # do_POST — this pins that ordering.
        with JarvisServerFixture(rate_limit_max=1) as srv:
            srv.request("POST", "/chat", {"question": "hi"}, token=TOKEN)
            status, payload, _ = srv.request(
                "POST", "/chat", {"question": "hi"}, token=TOKEN)
            self.assertEqual(status, 429)


class ChatEndpointTests(unittest.TestCase):
    def test_empty_question_is_400(self):
        with JarvisServerFixture() as srv:
            status, payload, _ = srv.request(
                "POST", "/chat", {"question": "   "}, token=TOKEN)
            self.assertEqual(status, 400)

    def test_missing_body_is_400(self):
        with JarvisServerFixture() as srv:
            conn = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
            conn.request("POST", "/chat", body=b"", headers={
                "X-Jarvis-Token": TOKEN, "Content-Type": "application/json"})
            resp = conn.getresponse()
            self.assertEqual(resp.status, 400)
            conn.close()

    def test_session_id_persists_across_calls(self):
        with JarvisServerFixture() as srv:
            _, first, _ = srv.request(
                "POST", "/chat", {"question": "hi"}, token=TOKEN)
            sid = first["session_id"]
            _, second, _ = srv.request(
                "POST", "/chat", {"question": "again", "session_id": sid},
                token=TOKEN)
            self.assertEqual(second["session_id"], sid)

    def test_unknown_route_is_404(self):
        with JarvisServerFixture() as srv:
            status, _, _ = srv.request(
                "POST", "/nope", {"question": "hi"}, token=TOKEN)
            self.assertEqual(status, 404)


class RememberEndpointTests(unittest.TestCase):
    def test_empty_text_is_400(self):
        with JarvisServerFixture() as srv:
            status, _, _ = srv.request(
                "POST", "/remember", {"text": ""}, token=TOKEN)
            self.assertEqual(status, 400)

    def test_valid_capture_returns_note_and_writes_file(self):
        with JarvisServerFixture() as srv:
            status, payload, _ = srv.request(
                "POST", "/remember", {"text": "the roof warranty is 30 years"},
                token=TOKEN)
            self.assertEqual(status, 200)
            captures = os.path.join(srv.tmp, "captures")
            self.assertTrue(os.path.isdir(captures))
            self.assertTrue(os.listdir(captures))


class SpeakEndpointTests(unittest.TestCase):
    def test_speak_503_when_tts_disabled(self):
        with JarvisServerFixture() as srv:
            status, payload, _ = srv.request(
                "POST", "/speak", {"text": "hello"}, token=TOKEN)
            self.assertEqual(status, 503)

    def test_speak_empty_text_is_400(self):
        with JarvisServerFixture() as srv:
            status, _, _ = srv.request(
                "POST", "/speak", {"text": ""}, token=TOKEN)
            self.assertEqual(status, 400)


class StaticServingTests(unittest.TestCase):
    def test_index_serves_with_token_stamped(self):
        with JarvisServerFixture() as srv:
            status, _, raw = srv.request("GET", "/")
            self.assertEqual(status, 200)
            self.assertIn(TOKEN.encode(), raw)

    def test_get_on_gated_route_not_routed_as_post(self):
        with JarvisServerFixture() as srv:
            conn = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
            conn.request("GET", "/chat")
            resp = conn.getresponse()
            resp.read()
            conn.close()
            self.assertNotEqual(resp.status, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)
