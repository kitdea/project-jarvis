---
title: TL;DR and Key Findings
type: summary
source: "Project Jarvis PDF, p.1"
---

# TL;DR and Key Findings

⬅ Back to [[Project Jarvis - Agentic OS]]

## TL;DR
Build it as **Claude Agent SDK** (orchestrator + subagents) running on a **cloud VPS** (Hetzner/DigitalOcean), connecting to every platform through **read-scoped MCP servers**. This gives the lowest-friction path to a 24/7, auditable, hub-and-spoke system. The Mac Mini is only justified if iMessage delivery or local browser/screen automation is a hard requirement.

The AccuLynx "dealbreaker" is **FALSE**. AccuLynx publishes a documented public REST API v2 (`https://api.acculynx.com/api/v2`, Bearer API-key auth) with read endpoints for Jobs, Milestones, Financials, Invoices, Payments, Sales Owner, and Users — everything the Sales sub-agent needs. The real constraints are per-location API keys, a 10 req/sec/key rate limit, and write-capable keys that must be locked down. See [[AccuLynx]].

Start with a **2-agent split** (combined Marketing+Sales + a separate Reporting/SQL agent), not 3. See [[Layer 3 - Orchestrator Topology]].

## Key Findings
1. **Connector feasibility is far better than the brief assumed.** All five target systems expose usable developer APIs. AccuLynx has a full OpenAPI-documented v2 with an `llms.txt` index built for AI agents. Google Ads, GoHighLevel v2, and CallRail v3 are all mature, well-documented REST APIs. → [[Layer 4 - Connectors Overview]]
2. **Authentication is heterogeneous and must be abstracted.** OAuth2 three-legged flows with 24-hour token rotation (Google Ads, GHL v2) alongside static Bearer/API-key auth (AccuLynx, CallRail). This argues strongly for wrapping each platform in its own MCP server that owns credential lifecycle.
3. **Read-only is enforceable but not free.** Several APIs issue keys that are write-capable by default. There is no read-only key scope, so read-only must be enforced at the database role, the tool-allowlist, and the prompt-guardrail layers — defense in depth. → [[Security and Guardrails]]
4. **The Claude Agent SDK natively implements the hub-and-spoke topology** via subagents with isolated context windows, per-subagent `allowedTools`, and the `mcp__<server>__<tool>` permission pattern — eliminating most custom orchestration glue code. → [[Layer 2 - Agentic Harness]]
5. **Voice is a bolt-on, not a foundation.** Keep Jarvis's reasoning core channel-agnostic and add voice later via Vapi (orchestration) + ElevenLabs (TTS), or Pipecat if self-hosting. → [[Layer 5 - Communication Channels]]

---
⬅ Back to [[Project Jarvis - Agentic OS]]
