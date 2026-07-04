---
title: Accelerated Launch Plan (2-Week Sprint)
type: plan
source: "n/a — derived from Implementation Roadmap, compressed to the 2026-07-15 go-live target set in GOALS.md"
---

# Accelerated Launch Plan (2-Week Sprint)

⬅ Back to [[Project Jarvis - Agentic OS]]

> The original [[Implementation Roadmap]] paces Phase 0→2 (full 2-agent system) at ~7 weeks. The operator's target is **go-live 2026-07-15** (14 days from plan date 2026-07-01). This note is the compressed, parallelized version of that plan — what ships day 1, what's deliberately cut, and what follows fast after.

## The one hard external dependency
**Google Ads developer token was not yet submitted as of 2026-07-01.** Google's official review target is ~2 business days but [[Caveats]] flags a known early-2026 backlog stretching to weeks — and that's *after* submission, before any connector work even starts. **Action: submit today, regardless of the rest of this plan.** Given the timing, Google Ads is being treated as **out of day-1 scope** — see "Cut from day 1" below.

## Week 1 (Jul 1 – Jul 7): Foundations + build, run in parallel, not sequentially
The original roadmap sequences Phase 0 → Phase 1 → Phase 2. To hit 2 weeks, these run **in parallel workstreams** instead:

| Workstream | Days | What |
|---|---|---|
| **Infra** | 1–3 | Provision VPS ([[Layer 1 - Host Infrastructure]]), harden (non-root, firewall, Tailscale, disk encryption), install Claude Agent SDK runtime, create secrets vault. |
| **Reporting agent** | 1–5 | Build [[PostgreSQL Reporting\|Postgres MCP server]] (single read-only `query` tool, `GRANT SELECT`-only role, read replica) — can be developed against a dev DB before the VPS is ready. Wire Slack Bolt (Socket Mode). Ship single-agent Jarvis answering ROI dashboard questions. |
| **Marketing+Sales connectors** | 3–7 | Build GET-only MCP servers for [[GoHighLevel v2]], [[AccuLynx]], [[CallRail v3]] — none of these depend on the Google Ads token, so they start immediately. |
| **External dependency** | Day 0 | Submit Google Ads developer token application (see above). No further Google Ads work until it clears. |

**End of Week 1 checkpoint:** Reporting agent answering real questions in Slack; VPS hardened; 3 of 4 Marketing+Sales connectors built.

## Week 2 (Jul 8 – Jul 15): Combined agent live + baseline hardening only
| Days | What |
|---|---|
| 8–10 | Stand up the combined Marketing+Sales sub-agent on GoHighLevel + AccuLynx + CallRail (Google Ads deferred). Author the minimal [[Layer 6 - Skills and Knowledge Injection\|Layer 6]] artifact: **one shared "qualified lead" definition file** ([[Recommendations]] #7) — cheap, high-value, prevents the two agents reporting divergent numbers. |
| 10–12 | **Baseline security only** (not the full Phase 3 stack): confirm every connector is GET-only by construction, confirm the DB role is SELECT-only, basic per-tool audit logging, rate-limit/backoff handling for AccuLynx (10 req/s/key) and GHL (100 req/10s) — these limits bite immediately in production, so they're not deferrable. |
| 12–14 | End-to-end test: the [[Routing Example]] query, attribution across whatever connectors are live. Fix what breaks. |
| **15** | **Go live**: Reporting agent + Marketing+Sales agent (3 of 4 connectors). |

## Cut from day 1 (deliberate descope, not forgotten)
- **Google Ads connector** — fast-follows the moment the developer token clears. Attribution stories that need GCLID→job linkage are incomplete until then.
- **Full Phase 3 hardening** — persistent memory, two-tier vector retrieval, the full prompt-injection guardrail stack beyond the GET-only/read-only baseline, comprehensive load testing.
- **Webhook ingestion** (event-driven vs. polling) — Phase 4 item, not needed for correctness at launch.
- **95%+ / 20-question benchmark rigor** from the original Phase 1 success criteria — launch with a smaller smoke test instead; run the full benchmark post-launch.
- **3-agent topology split** — only triggered when tool count/routing accuracy degrades (see [[Recommendations]] thresholds); not relevant at launch scale.
- **Voice** ([[Layer 5 - Communication Channels]]) — already Phase 5 / optional / later in the original plan.

## Risk this plan accepts — needs your explicit sign-off
- **Reduced hardening window.** The Reporting agent touches real financial/ROI data — [[Caveats]] separately warns this system is "finance-adjacent." The baseline guardrails (read-only DB role, GET-only tools) ship day 1 and are non-negotiable; what's cut is the *defense-in-depth* layer (Phase 3), not the core read-only enforcement.
- **Lighter test coverage** at go-live than the original roadmap's benchmark.
- **Google Ads gap** means Marketing attribution is partial for however long the token review takes — could be days, could be weeks per the Caveats backlog warning.

## Tracking
Day-to-day infra checklist lives in [[Phase 0 Progress Tracker]] — update it as items land.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
