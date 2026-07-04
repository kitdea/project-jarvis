---
title: "Multi-Agent Routing Strategy (worked example)"
type: example
source: "Project Jarvis PDF, pp.5-6"
---

# Multi-Agent Routing Strategy (worked example)

⬅ Back to [[Project Jarvis - Agentic OS]]

> **Query:** "How is Victor's pipeline looking compared to our Google Ads spend this week?"

1. **Channel → Orchestrator.** Slack Bolt (Socket Mode) receives the message, verifies the signing secret, strips/escapes the raw text, and hands a structured request to Jarvis. See [[Layer 5 - Communication Channels]].

2. **Query parsing & decomposition.** Jarvis identifies two domains (Sales: "Victor's pipeline"; Marketing: "Google Ads spend") and one time window ("this week" → resolves to an explicit ISO date range). It resolves "Victor" against the AccuLynx `GET /users` list to a user GUID (and confirms one match to avoid ambiguity).

3. **Parallel dispatch (`Task` tool).**
   - **Sales sub-agent** calls `mcp__acculynx__get_jobs` filtered by `salesOwner=<Victor-GUID>`, date range, and milestone, then `get_payments_overview`/`get_financials` to total open vs. won pipeline value. Read-only GET tools only. See [[AccuLynx]].
   - **Marketing sub-agent** calls `mcp__googleads__search` with a GAQL query (`SELECT campaign.name, metrics.cost_micros, metrics.conversions_value FROM campaign WHERE segments.date DURING ...`), converts `cost_micros ÷ 1e6`. See [[Google Ads API]].

4. **Sub-Agents → Data sources.** Each MCP server injects its own credential (AccuLynx Bearer key; Google Ads OAuth access token, refreshing if expired), enforces the read-scope, applies backoff on 429s, and returns structured JSON to its sub-agent.

5. **Synthesis.** Sub-agents return compact summaries to Jarvis, which reconciles the time windows, computes the comparison (e.g., pipeline value created vs. ad spend → a blended ROAS proxy using the canonical formula from `kpi-definitions.md`), and writes one Slack-formatted answer with the underlying numbers and their sources. See [[Layer 6 - Skills and Knowledge Injection]].

6. **Channel ← Orchestrator.** Jarvis posts the synthesized answer back to the Slack thread.

This example demonstrates the [[Layer 3 - Orchestrator Topology|hub-and-spoke topology]] end-to-end.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
