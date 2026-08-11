#!/usr/bin/env python3
"""Persistent Piper TTS worker: reads request lines on stdin, writes WAV to stdout.

Run by server.py as a long-lived subprocess under the Piper venv's interpreter,
because `piper` is installed in a pipx venv and is not importable from the
system python that runs server.py. Keeping one process alive is the whole point:
loading the ONNX model costs ~1.6s, while synthesis once warm is ~0.55s. A
fresh `piper` CLI call per answer would pay the load cost every single time.

Protocol, one exchange per line, chosen so a partial read can never be mistaken
for audio:

    stdin   {"text": "..."}\n
    stdout  {"ok": true, "bytes": N}\n  followed by exactly N bytes of WAV
            {"ok": false, "error": "..."}\n  with no payload

Framing every response with an explicit byte count lets the reader block for
precisely that many bytes, so a slow pipe yields a short read to retry rather
than a truncated WAV the browser would reject.
"""

import io
import json
import sys
import wave


def main():
    if len(sys.argv) < 2:
        sys.stderr.write("usage: piper_worker.py MODEL.onnx [length_scale]\n")
        return 2

    model = sys.argv[1]
    length_scale = float(sys.argv[2]) if len(sys.argv) > 2 else None

    try:
        from piper import PiperVoice, SynthesisConfig
    except ImportError as exc:
        sys.stderr.write("piper not importable: %s\n" % exc)
        return 3

    try:
        voice = PiperVoice.load(model)
    except Exception as exc:                      # noqa: BLE001 - report and exit
        sys.stderr.write("could not load %s: %s\n" % (model, exc))
        return 4

    # length_scale stretches phoneme duration: >1 is slower. A touch slower than
    # default reads as measured rather than rushed, which is what a butler wants.
    syn_config = None
    if length_scale is not None:
        try:
            syn_config = SynthesisConfig(length_scale=length_scale)
        except TypeError:
            syn_config = None

    # Tell the parent the model is up, so it can stop waiting and start serving.
    sys.stderr.write("ready\n")
    sys.stderr.flush()

    out = sys.stdout.buffer
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            text = (json.loads(line).get("text") or "").strip()
        except ValueError:
            text = ""
        if not text:
            out.write(b'{"ok": false, "error": "empty text"}\n')
            out.flush()
            continue

        try:
            buf = io.BytesIO()
            with wave.open(buf, "wb") as handle:
                if syn_config is not None:
                    voice.synthesize_wav(text, handle, syn_config=syn_config)
                else:
                    voice.synthesize_wav(text, handle)
            payload = buf.getvalue()
        except Exception as exc:                  # noqa: BLE001 - keep serving
            out.write(json.dumps({"ok": False, "error": str(exc)}).encode("utf-8"))
            out.write(b"\n")
            out.flush()
            continue

        out.write(json.dumps({"ok": True, "bytes": len(payload)}).encode("utf-8"))
        out.write(b"\n")
        out.write(payload)
        out.flush()

    return 0


if __name__ == "__main__":
    sys.exit(main())
