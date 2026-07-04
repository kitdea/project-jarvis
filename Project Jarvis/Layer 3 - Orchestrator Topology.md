---
title: "Layer 3 — Orchestrator & Sub-Agent Topography"
type: layer
source: "Project Jarvis PDF, p.3"
---

# Layer 3 — Orchestrator & Sub-Agent Topography

⬅ Back to [[Project Jarvis - Agentic OS]]

## Topology: Hub-and-spoke
Jarvis (orchestrator) owns query parsing, routing, and synthesis; sub-agents own a single domain and a single credential set.

- **Orchestrator (Jarvis)** — parses the natural-language query, decomposes it into per-domain sub-questions, dispatches to sub-agents in parallel (`Task` tool), then synthesizes a single answer. **Holds no platform credentials itself.**
- **Sub-Agent A — Marketing**: [[Google Ads API]] (campaign/PMax performance, ROAS), [[GoHighLevel v2]] (funnel stages, lead attribution), [[CallRail v3]] (source/medium/GCLID first-touch). Tools: `mcp__googleads__*`, `mcp__ghl__*`, `mcp__callrail__*` (read-scoped).
- **Sub-Agent B — Sales**: [[AccuLynx]] (pipeline milestones, per-rep sales-owner data, financial totals), [[CallRail v3]] (lead qualification / `lead_status`, call handling). Tools: `mcp__acculynx__*`, `mcp__callrail__*` (read-scoped).
- **Sub-Agent C — Reporting**: read-only [[PostgreSQL Reporting]] ROI dashboard. Tools: `mcp__postgres__query` only.

## 2-agent vs 3-agent recommendation
**Start combined Marketing+Sales (one agent) + a separate Reporting agent.**

**Rationale:** the marketing and sales domains share the attribution spine — a GCLID from Google Ads becomes a CallRail call, becomes a GHL opportunity, becomes an AccuLynx job — so a single agent that holds both contexts answers cross-funnel questions ("which campaigns produce qualified AccuLynx jobs?") without an extra orchestration hop.

The Reporting/SQL agent is split out immediately because it has the **highest blast radius** (raw DB access) and the most distinct guardrail profile.

**Promote to the full 3-agent split when:**
(a) the combined agent's tool list exceeds ~20–25 tools and routing accuracy degrades, or
(b) Marketing and Sales develop genuinely independent escalation/alerting cadences.

See [[Implementation Roadmap]] Phase 4 for when this trigger fires, and [[Routing Example]] for a worked dispatch.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
