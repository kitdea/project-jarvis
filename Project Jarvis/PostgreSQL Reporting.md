---
title: PostgreSQL Reporting
type: connector
source: "Project Jarvis PDF, p.5"
---

# PostgreSQL — secure read-only text-to-SQL

⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]

## Summary
Backs the **Reporting sub-agent** — see [[Layer 3 - Orchestrator Topology]]. This connector carries the **highest blast radius** of the five (raw DB access), so it is isolated from day one and shipped first as the MVP ([[Implementation Roadmap]] Phase 1).

- **Auth:** DB role credentials
- **Key read endpoints:** Read-only `SELECT` on ROI dashboard
- **Rate limits:** DB-configured
- **Known roadblock:** Text-to-SQL injection/write risk

## Implementation
Map the ROI dashboard DB into the Reporting agent through a **Postgres MCP server** that exposes a **single read-only `query` tool**, backed by a database role created with `GRANT SELECT` only (no `INSERT`/`UPDATE`/`DELETE`/`DDL`), ideally pointed at a **read replica**.

Full guardrail stack: [[Security and Guardrails]] — database layer, tool layer, prompt layer.

---
⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]
