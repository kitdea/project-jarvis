---
title: GoHighLevel v2
type: connector
source: "Project Jarvis PDF, p.4"
---

# GoHighLevel (GHL) v2

⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]

## Summary
Mature, public API. Used by the **Marketing sub-agent** for funnel stages and lead attribution — see [[Layer 3 - Orchestrator Topology]].

- **Auth:** OAuth2 (Authorization Code) or Private Integration Token; access token expires ~24h, refresh token ~1yr
- **Key read endpoints:** Opportunities/pipelines (funnel stages), Contacts (lead attribution), Conversations
- **Rate limits:** 100 req/10s burst; 200,000/day per app per location
- **Known roadblocks:**
  - **V1 end-of-support 31-Dec-2025** — must use v2
  - OAuth advanced features are gated to the Agency Pro plan
  - `companies.readonly` scope is available — use it to enforce read-only at the auth layer (see [[Security and Guardrails]])

## MCP tool layer (built 2026-07-10)
A local stdio MCP server now exists at `mcp-servers/ghl-mcp-server` (Node/TypeScript, `@modelcontextprotocol/sdk`), exposing 6 read-only tools: `list_contacts`, `get_contact`, `list_opportunities`, `get_pipeline_stages`, `list_conversations`, `get_conversation_messages`. Auth is a Private Integration Token scoped to `contacts.readonly`, `opportunities.readonly`, `conversations.readonly` (stored in `mcp-servers/ghl-mcp-server/.env`, gitignored) rather than the `companies.readonly` scope mentioned above — that scope isn't needed since no tool here touches company records. Not yet wired into Claude Code and not yet committed to the vault's git repo.

---
⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]
