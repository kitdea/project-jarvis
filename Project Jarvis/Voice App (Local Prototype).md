---
title: "Voice App (Local Prototype)"
type: note
source: "n/a — built this session, not derived from the Project Jarvis PDF"
---

# Voice App (Local Prototype)

⬅ Back to [[Project Jarvis - Agentic OS]]

**Status: retired (2026-08-13).** Operator confirmed a working Jarvis already
exists elsewhere, so this prototype is no longer needed going forward. It
served its purpose — de-risking the Layer 5 voice architecture before VPS
infra existed — and that knowledge is captured below; it's not being evolved
further or promoted to production. The `voice-app/` directory has been
removed from the vault; this note is kept as a reference only. See
[[Layer 5 - Communication Channels]] and [[Phase 0 Progress Tracker]] for the
retirement record.

## What it was
`voice-app/` (vault root, sibling to `mcp-servers/`) was a local Electron
desktop app for talking to a scoped slice of Jarvis by chat or voice, built
to test the experience on this machine before the VPS exists. It embedded the
[[Layer 2 - Agentic Harness|Claude Agent SDK]] directly rather than going
through Claude Code, with a chat log, text input, and a mic button (Web
Speech API for STT, `speechSynthesis` for TTS) — no external voice vendor
needed for this local pass.

## Scope: Marketing, Strategy, and Info only
Only two MCP servers are ever registered with the Agent SDK session:
[[GoHighLevel v2|ghl-mcp-server]] and [[CallRail v3|callrail-mcp-server]].
[[AccuLynx]] (sales pipeline) and any Postgres/reporting/infra tool are
never wired in — not merely instructed against, but structurally
unreachable. A dedicated `voice-app/system-prompt.md` persona backs this up
by declining sales-pipeline, reporting, or infra questions even in general
conversation. This mirrors the "tool restriction + scoped prompt"
belt-and-suspenders approach the operator asked for.

## Relationship to Layer 5 / Phase 5
The [[Implementation Roadmap]] scopes voice as **Phase 5**, attached only
after the VPS-hosted orchestrator and Marketing+Sales agent are live (see
[[Layer 5 - Communication Channels]]'s "Voice (future bolt-on)" section,
which recommends Vapi+ElevenLabs at the transport edge). While VPS
provisioning was on hold pending budget approval (parked per operator
instruction as of 2026-07-22 — see [[Phase 0 Progress Tracker]]), this app
served as a **local rehearsal**: same reasoning core (Claude Agent SDK)
and same restricted-tool-set pattern the real Phase 2/5 system would use,
run on this machine instead of a server, using free built-in browser
STT/TTS instead of a paid voice vendor. As of 2026-08-13 it's retired
rather than promoted — a working Jarvis exists elsewhere, so the VPS
unblock no longer matters for this prototype's path forward.

## Known limitations
- Single-user, no auth — a local prototype, not a production deployment.
- Secrets are read from each MCP server's own gitignored `.env` files
  (already in place from the 2026-07-10/2026-07-24 smoke tests), not a
  managed secrets store.
- No persistent conversation memory across turns yet — each request is a
  fresh Agent SDK query.
- Was not run end-to-end in a real desktop environment before retirement;
  setup/run steps lived in `voice-app/README.md`, now removed with the
  rest of the directory.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
