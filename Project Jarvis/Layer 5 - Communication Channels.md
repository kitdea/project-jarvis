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

---
⬅ Back to [[Project Jarvis - Agentic OS]]
