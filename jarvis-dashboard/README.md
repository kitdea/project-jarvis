# jarvis-dashboard

**Status: retired (2026-08-13).** Operator confirmed the working Jarvis is
`server.py` + `viewer/` at the vault root, not this app — this directory
went untouched between the two most recent commits and was never picked
back up after `voice-app` (the prototype this was meant to replace) was
retired. Left in place as reference only; not being evolved further. See
`Project Jarvis/Layer 5 - Communication Channels.md` ("Local prototype #2")
and `Project Jarvis/Phase 0 Progress Tracker.md`.

Browser-based local dashboard for Project Jarvis — Step 1 of the rebuild
that replaces the `voice-app` Electron prototype (see
`Project Jarvis/Voice App (Local Prototype).md`). Same reasoning core
(Claude Agent SDK) and same restricted MCP tool set, now served as a
`localhost` web page instead of a desktop window, over WebSocket so future
phases (live knowledge graph, tool-call events, scheduled brief cards) have
a channel to push updates on.

## Scope: Marketing, Strategy, and Info only
Same as `voice-app`: only `mcp-servers/ghl-mcp-server` and
`mcp-servers/callrail-mcp-server` are ever registered with the Agent SDK
session. AccuLynx and any Postgres/reporting/infra tool are not wired in.

**Step 2 (done):** `server.js` now sets an explicit `tools` allow-list on
the Agent SDK's *built-in* toolset — only `WebSearch` and `WebFetch` are
available (for live marketing-trend lookups); `Bash`, `Write`, `Edit`, and
`NotebookEdit` are additionally named in `disallowedTools` as a
belt-and-suspenders block. This closes the gap `voice-app` had (and this
app briefly had in Step 1): previously the SDK's full built-in toolset —
including `Bash`, which can reach anything on the machine — was implicitly
available regardless of the MCP-server scoping. Now the "sales/infra/vault
unreachable" claim is enforced at both layers: MCP registration (no
AccuLynx/Postgres servers wired in) and the built-in tool allow-list (no
Bash/Write/Edit at all).

## Setup

Both MCP servers need their own `.env` with real credentials (same files
`voice-app` already uses):

- `mcp-servers/ghl-mcp-server/.env`
- `mcp-servers/callrail-mcp-server/.env`

```bash
cd jarvis-dashboard
npm install
npm start
```

Then open `http://localhost:8720` (override with `JARVIS_PORT=xxxx npm start`).

## Using it

- Type in the input box and hit Send, or click 🎤 to start hands-free voice
  mode — it listens, sends what you said, speaks the reply, then
  automatically starts listening again. Click 🎤 again to stop.
- The center orb shows Jarvis's state: idle / listening / thinking /
  speaking.
- "New chat" clears the conversation and drops the Agent SDK session, so the
  next message starts fresh instead of carrying prior context.
- The right-hand panel is a placeholder for the knowledge graph, added in a
  later phase.

## Known limitations (same as voice-app, still true here)
- No auth/login — single-user local app.
- Secrets are read from each MCP server's own gitignored `.env`.
- Voice is free browser STT/TTS, not ElevenLabs (deferred per operator
  decision).
