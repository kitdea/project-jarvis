# voice-app — Jarvis Lite (local prototype)

A local Electron desktop app for talking to a scoped slice of Project
Jarvis by chat or voice — **Marketing, Strategy, and Info only**. No sales
pipeline (AccuLynx), reporting (Postgres), or infra tools are wired in.

This is the local rehearsal for [[Layer 5 - Communication Channels]]'s
Phase 5 voice bolt-on, run against this machine instead of the VPS (which is
still on hold pending budget approval — see `Phase 0 Progress Tracker.md`).
Once that unblocks, the same pattern (Agent SDK core + restricted MCP tool
set + scoped system prompt) promotes to the real Marketing+Sales agent with
Vapi/ElevenLabs at the transport edge.

## What's wired in
- `mcp-servers/ghl-mcp-server` (GoHighLevel — contacts, opportunities, conversations)
- `mcp-servers/callrail-mcp-server` (CallRail — calls, tags, companies, form submissions)
- Nothing else. AccuLynx and any reporting/infra tool are intentionally excluded.

Scope is enforced two ways: only the above MCP servers are ever registered
with the Agent SDK session (so out-of-scope tools are physically
unreachable), and `system-prompt.md` instructs the assistant to decline
sales/reporting/infra questions even when just talking generally.

## Setup

Both MCP servers must already be built (they already are, as of the last
Phase 0 smoke test) and have their own `.env` with real credentials:

- `mcp-servers/ghl-mcp-server/.env` — `GHL_PRIVATE_TOKEN`, `GHL_LOCATION_ID`
- `mcp-servers/callrail-mcp-server/.env` — `CALLRAIL_API_KEY`, `CALLRAIL_ACCOUNT_ID`

If either is missing, see that server's own README for how to build/configure it.

```bash
cd voice-app
npm install
npm start
```

This installs Electron and the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`)
locally to `voice-app/` and launches the app window.

## Using it

- Type in the input box and hit Send, or click the mic button (🎤) and speak —
  transcription uses the browser's built-in Web Speech API, no external STT
  service needed for this local pass.
- Replies are shown as chat bubbles and read aloud via the OS's built-in
  text-to-speech (`speechSynthesis`). ElevenLabs stays a Phase-5-on-VPS
  upgrade, not part of this local prototype.
- Ask something in scope (e.g. "what are our open GHL opportunities?") and it
  will call the real GHL/CallRail tools. Ask about sales pipeline, reporting,
  or infra and it will decline and point you at the full Jarvis system.

## Known limitations (local prototype, not production)
- No auth/login — this is a single-user local app.
- Secrets are read from each MCP server's own gitignored `.env`, not a
  managed secrets store — fine for local use, not for VPS deployment.
- Each request starts a fresh Agent SDK query — no persistent conversation
  memory across turns yet.
