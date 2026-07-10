---
title: AccuLynx
type: connector
source: "Project Jarvis PDF, pp.3-4"
---

# AccuLynx — the flagged "dealbreaker," investigated thoroughly

⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]

## Verdict
**Not a dealbreaker.** AccuLynx has a documented public REST API v2.

## Base URL / auth
`https://api.acculynx.com/api/v2`, `Authorization: Bearer <API_KEY>`. Keys are generated in the AccuLynx API settings by a company administrator; **each company location requires its own key**.

## Read endpoints relevant to the Sales sub-agent
(all confirmed in the public OpenAPI/`llms.txt` index)
- `GET /jobs` (filterable by date range, milestone, sort) and `GET /jobs/search`
- `GET /jobs/{id}/milestones` and milestone history
- `GET /jobs/{id}/financials` (supports worksheet + amendments)
- `GET /jobs/{id}/invoices`
- `GET /jobs/{id}/payments`
- `GET /jobs/{id}/payments-overview` (high-level financial overview)
- `GET /jobs/{id}/sales-owner` (the rep on a job) and `GET /jobs/{id}/representatives`
- `GET /users` (status-filterable list of reps)
- active lead sources, trade/work types, custom fields

## Webhooks
A full webhook subscription API exists (topics include `job-milestone-changed`, `approvedjobvaluechanged`, `invoiceupdated`) — preferred over polling for change-driven updates. See [[Implementation Roadmap]] Phase 4.

## Rate limits (confirmed verbatim from AccuLynx docs)
> "Every application is subject to an IP-based concurrent request limit of 30 requests per second. If a single IP is making more than 30 requests per second, new requests will be denied and return an HTTP 429 status code"

— then **10 requests/sec per API key**. Higher limits require applying through the **AccuLynx Partner Program**.

## REAL blockers to flag aggressively
1. **Zero developer support** — AccuLynx states verbatim: *"We do not support our APIs in the same way we support our AccuLynx Pro, Elite, or mobile apps. We do not coach or teach people how to use our APIs, nor do we explain how to use different tools to connect to our APIs."* You are on your own, with only a Contact Us form for troubleshooting.
2. **Per-location keys** mean a multi-location Shumaker footprint multiplies key management.
3. **Keys are write-capable** — AccuLynx warns *"Your API Key can be used by anyone to expose or manipulate your company data"* — there is no read-only key scope, so read-only must be enforced in the MCP tool layer by only implementing GET tools. See [[Security and Guardrails]].
4. AccuLynx published **no detailed pagination/back-pressure guidance** beyond the above — implement exponential backoff with jitter.

## Credential status
A per-location API key has been issued and is stored locally in `.env.local` (`ACCULYNX_API_KEY`, gitignored — never committed). **Smoke-tested 2026-07-10 via the MCP tool layer below and found invalid: `list_users` returned `401 API Key is invalid or deactivated`.** GHL and CallRail's equivalent keys both passed the same smoke test the same day — this appears isolated to the AccuLynx key, not a wiring problem. Needs a fresh key from AccuLynx (or reactivation) before this connector is usable; flag as blocking until resolved.

## MCP tool layer (built 2026-07-10)
A local stdio MCP server now exists at `mcp-servers/acculynx-mcp-server` (Node/TypeScript, `@modelcontextprotocol/sdk`), exposing 9 read-only tools: `list_jobs`, `search_jobs`, `get_job_milestones`, `get_job_financials`, `get_job_invoices`, `get_job_payments`, `get_job_payments_overview`, `get_job_sales_owner`, `get_job_representatives`, `list_users` — one GET tool per endpoint in the "Read endpoints" section above, minus lead sources/trade types/custom fields (paths unconfirmed, see [[Caveats]]). Per the blocker above, only GET endpoints are implemented — enforced at this tool layer, not by the key itself. Wired into Claude Code (`claude mcp add`) and committed to the vault's git repo as of 2026-07-10 — but see the credential status above, the tools are reachable and correctly built, they just can't authenticate yet.

## Open question
Field-level depth is unverified for Shumaker's specific account — see [[Caveats]].

---
⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]
