---
title: Step-by-Step Implementation Roadmap
type: roadmap
source: "Project Jarvis PDF, p.6"
---

# Step-by-Step Implementation Roadmap

⬅ Back to [[Project Jarvis - Agentic OS]]

## Phase 0 — Foundations (week 1)
Provision the VPS; harden (non-root user, firewall, Tailscale, disk encryption); install the Claude Agent SDK runtime; stand up a private git repo for Skills/knowledge files; create a secrets vault (env vars or a managed secrets store — never hardcode). **Submit the Google Ads developer-token application on day one** (longest external dependency). See [[Layer 1 - Host Infrastructure]], [[Google Ads API]].

## Phase 1 — Read-only Reporting MVP (weeks 2–3)
Build the [[PostgreSQL Reporting|Postgres MCP server]] with one read-only query tool against a `GRANT SELECT`-only role on a read replica. Wire Slack Bolt in Socket Mode. Ship a single-agent Jarvis that answers questions against the ROI dashboard only. **This is the smallest safe, useful product.**

**Success benchmark:** 95%+ correct answers on a 20-question revenue-target test set with zero write attempts reaching the DB.

## Phase 2 — Marketing+Sales combined agent (weeks 4–7)
Build MCP servers for [[Google Ads API]] (after securing the approved developer token), [[GoHighLevel v2]], [[AccuLynx]], and [[CallRail v3]] — each exposing GET/read tools only. Add the combined Marketing+Sales sub-agent. Author the [[Layer 6 - Skills and Knowledge Injection|Layer 6 knowledge files]].

**Success benchmark:** the [[Routing Example|worked-example query]] returns correct, sourced numbers; cross-funnel attribution (GCLID→job) resolves end-to-end.

## Phase 3 — Hardening & memory (weeks 8–9)
Add persistent memory, the two-tier vector retrieval, prompt-injection guardrails ([[Security and Guardrails]]), per-tool audit logging, and rate-limit/backoff handling. Load-test against AccuLynx (10 req/s/key) and GHL (100 req/10s) limits.

## Phase 4 — Scale the topology (as triggers fire)
Split Marketing and Sales into separate sub-agents when the combined tool list or routing accuracy degrades — see [[Layer 3 - Orchestrator Topology]]. Add webhook ingestion (AccuLynx milestone/invoice topics, GHL events, CallRail post-call) to move from polling to event-driven freshness.

## Phase 5 — Voice (optional, later)
Attach Vapi+ElevenLabs at the transport edge; reuse the identical orchestrator/sub-agent core. See [[Layer 5 - Communication Channels]].

---
⬅ Back to [[Project Jarvis - Agentic OS]]
