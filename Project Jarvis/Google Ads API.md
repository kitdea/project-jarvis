---
title: Google Ads API
type: connector
source: "Project Jarvis PDF, pp.4,7"
---

# Google Ads API

⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]

## Summary
Mature, fully public API (v24+). Used by the **Marketing sub-agent** — see [[Layer 3 - Orchestrator Topology]].

- **Auth:** OAuth2 (3-legged or service account) + developer token
- **Key read endpoints:** `GoogleAdsService.SearchStream` with GAQL: `campaign`, `metrics.cost_micros`, `metrics.conversions_value` (ROAS), PMax via `asset_group`
- **Rate limits:** 10k ops/batch; access-level quotas (Basic = 15,000 ops/day)
- **Known roadblock:** Developer token requires Google approval (Basic→Standard); token cannot hit production accounts until approved; cost is reported in micros (÷1e6 to get dollars)

## Critical path: developer token approval
Google's official targets are roughly **two business days** for a Basic Access review and up to **~10 business days** for Standard Access. As of early 2026, Google acknowledged a backlog and longer review times on developer-token applications.

**Plan for two business days as the optimistic case but weeks in practice** — this is the single longest external dependency on the entire build. **Submit the application on day one** ([[Implementation Roadmap]] Phase 0).

## Worked usage
See [[Routing Example]] for a GAQL query against campaign cost/conversion data used in a real Marketing-vs-Sales comparison.

## OAuth Client ID received (2026-07-10)
*(Source: credential handoff via this Claude/Obsidian session, not from the Project Jarvis PDF.)*

The OAuth 2.0 **Client ID** for the Google Ads API connector has been received and stored in `project-jarvis-skills/.env` (git-ignored, never in this vault) as `GOOGLE_ADS_CLIENT_ID` — same pattern as the CallRail key in [[CallRail v3]]. This is a distinct credential from the **developer token**, which is still pending Google's review per [[Phase 0 Progress Tracker]]; the client ID alone does not unblock production API access.

## Interim option: Supermetrics (connected 2026-07-03)
*(Source: live discovery via the Supermetrics MCP connector available in this Claude session, 2026-07-03 — not from the Project Jarvis PDF.)*

Independent of the developer-token application above, **live Google Ads data is already accessible right now** through a Supermetrics connector active in this Claude/Obsidian session:
- Authenticated against the **Shumaker Roofing** ad account (account ID `8531416360`), connected via `francismarrosales@gmail.com`.
- Lets Claude pull real campaign spend, conversions, ROAS, etc. into chat/notes on request — no developer token, no custom MCP server, no waiting on Google's review.

**This is not a substitute for the production Jarvis connector described above.** Supermetrics is tied to this personal Claude session/account, not a credential-scoped MCP server the Jarvis orchestrator can call under the read-only tool-allowlist enforcement described in [[Security and Guardrails]]. Treat it as a stand-in for ad hoc reporting/analysis while the real developer token application (still open per [[Phase 0 Progress Tracker]]) works through Google's review.

## Local Services Ads folding into Google Ads via Performance Max (announced 2026-07-20)
*(Source: Search Engine Land, "Local Services Ads come to Google Ads via Performance Max," Anu Adegbola, published 2026-07-20 — https://searchengineland.com/local-services-ads-come-to-google-ads-via-performance-max-482692. Clipping was short/partial as saved; treat specifics below as preliminary.)*

Google is retiring the standalone Local Services Ads (LSA) dashboard and moving LSA management into the main Google Ads interface, via a new Performance Max campaign type built for pay-per-lead local service businesses. Phased rollout begins **August 2026**. The new campaign type reportedly retains LSA's core characteristics (e.g. pay-per-lead, Google Business Profile sync) but runs through standard Google Ads infrastructure.

**Why this matters for the Jarvis connector, if Shumaker runs LSAs:** LSAs have historically required a *separate* Local Services Ads API, not the `GoogleAdsService`/GAQL surface this connector note otherwise describes. If LSA campaigns genuinely move into standard Google Ads PMax campaigns, that could mean LSA lead/spend data becomes queryable through the same `GoogleAdsService.SearchStream` GAQL surface already planned for this connector — no second API/connector needed. **Not yet confirmed or actioned:** unclear whether Shumaker Roofing currently runs LSAs at all, and the source clipping didn't capture full technical/API details of the migration. Flag for follow-up once the August 2026 rollout details are clearer, and confirm with the operator whether Shumaker has an active LSA account.

---
⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]
