---
title: "Layer 5 — Communication Channels"
type: layer
source: "Project Jarvis PDF, p.5"
---

# Layer 5 — Communication Channels

⬅ Back to [[Project Jarvis - Agentic OS]]

## Slack (primary)
Use **Bolt** (official SDK; JS/Python/Java). Run in **Socket Mode** so the agent needs no public inbound URL (ideal on a hardened VPS — see [[Layer 1 - Host Infrastructure]]) — requires an app-level token (`xapp-`) with `connections.write` plus the bot token (`xoxb-`). Verify the Slack signing secret on every request. Apply least-privilege scopes.

## iMessage (secondary, optional)
Requires macOS. The robust path is **BlueBubbles Server** (runs on the Mac, exposes a REST API with reactions/edits/media; needs Full Disk Access + a Firebase project for push). **This is the single strongest reason to introduce a Mac Mini** — see [[Layer 1 - Host Infrastructure]]. Note Apple ToS risk around automated messaging.

## Voice (future bolt-on)
Keep Jarvis's reasoning core **channel-agnostic** so voice attaches at the transport edge, not the brain.

Recommended later stack:
- **Vapi** for full-pipeline orchestration (STT↔LLM↔TTS, barge-in, sub-second latency over WebRTC) with **ElevenLabs** as the TTS voice, or
- **Pipecat** (open-source, WebSocket/WebRTC transports, Twilio serializer for telephony) if self-hosting the pipeline.

Vapi's BYO-model approach lets Jarvis remain the LLM brain while Vapi manages the audio plumbing. Budget **~$0.23–0.33/min all-in** for a BYOK Vapi stack. See [[Implementation Roadmap]] Phase 5.

## Local prototype: `voice-app` / "Jarvis Lite" (built 2026-07-24, retired 2026-08-13)
*(Source: this vault's own `voice-app/` directory, not the Project Jarvis PDF.)*

**Status: retired.** Operator confirmed 2026-08-13 that a working Jarvis already exists and this prototype is no longer needed going forward. It served its purpose — de-risking the Layer 5 architecture before VPS infra existed — and that knowledge is captured below; it's not being evolved further or promoted to production. Left in place as a reference, not actively maintained.

A working local rehearsal of the voice bolt-on existed here, ahead of the VPS/Vapi production build above. It's an Electron desktop app (`voice-app/main.js` + `renderer/`) that talks to a **scoped slice of Jarvis by chat or voice — Marketing/Strategy/Info only**, via the Claude Agent SDK running locally.

**How voice actually works in it:**
- **Speech-in:** the browser's built-in `webkitSpeechRecognition` (Web Speech API) — no separate STT service or key. Note this isn't fully offline: Chromium sends the audio to Google's recognition servers under the hood, so it needs internet even though no STT credential is configured anywhere.
- **Speech-out:** the OS's built-in `speechSynthesis` — every reply is read aloud automatically, no setup needed.
- **Scope enforcement:** only `mcp-servers/ghl-mcp-server` and `mcp-servers/callrail-mcp-server` are ever registered with the Agent SDK session — AccuLynx and any reporting/infra server are physically unreachable, not just discouraged, plus `system-prompt.md` instructs it to decline out-of-scope questions.

**Bug found and fixed (2026-08-05):** `main.js` originally left `permissionMode` at the SDK default (`'default'`, which prompts for interactive tool-use approval), but the renderer has no UI to answer that prompt — a real GHL/CallRail question would have silently stalled. Fixed by setting `permissionMode: 'bypassPermissions'` (+ required `allowDangerouslySkipPermissions: true`). Safe specifically because read-only enforcement already lives one layer down, at the connector level (GET-only tools only) — the bypass doesn't grant anything new. Verified live post-fix: real data returned (10 GHL pipelines, 102 CallRail calls).

**Relationship to the production plan above:** this is explicitly the local rehearsal for the Vapi/ElevenLabs bolt-on — same core pattern (Agent SDK + restricted MCP tool set + scoped system prompt), running on a dev machine instead of the VPS. Known limitations: no auth/login (single-user only), secrets read from each MCP server's own gitignored `.env` rather than a managed store, and no persistent conversation memory across turns (each request is a fresh Agent SDK query). See `voice-app/README.md` for setup/run instructions.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
