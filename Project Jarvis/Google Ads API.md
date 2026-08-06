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
- **Known roadblock (still open as of 2026-07-24):** Developer token requires Google approval (Basic→Standard) before it can hit production accounts at production quota. Token is currently at **Explorer Access** (confirmed via API Center screenshot, see below) — this tier does not clear the roadblock. Cost is still reported in micros (÷1e6 to get dollars).

## Critical path: developer token approval — still open, tier corrected 2026-07-24
Google's official targets are roughly **two business days** for a Basic Access review and up to **~10 business days** for Standard Access. As of early 2026, Google acknowledged a backlog and longer review times on developer-token applications.

**Correction:** this note briefly stated "Standard Access confirmed" earlier on 2026-07-24, based on an unverified operator report. A screenshot of the actual Google Ads API Center (Admin → API Center) shows the token's **Access level: Explorer Access** — not Standard. Explorer Access is Google's current-generation equivalent of the old "Test Access" tier and does not grant production-account/production-quota access. Treat the developer-token roadblock as **still open**; see "Developer token access level" below for the corrected, screenshot-sourced status.

## Worked usage
See [[Routing Example]] for a GAQL query against campaign cost/conversion data used in a real Marketing-vs-Sales comparison.

## OAuth Client ID received (2026-07-10)
*(Source: credential handoff via this Claude/Obsidian session, not from the Project Jarvis PDF.)*

The OAuth 2.0 **Client ID** for the Google Ads API connector has been received and stored in `project-jarvis-skills/.env` (git-ignored, never in this vault) as `GOOGLE_ADS_CLIENT_ID` — same pattern as the CallRail key in [[CallRail v3]]. This is a distinct credential from the **developer token**, which is present but at Explorer Access only (not yet Basic/Standard) — see "Developer token access level" below; the client ID alone does not unblock production API access.

## Interim option: Supermetrics (connected 2026-07-03)
*(Source: live discovery via the Supermetrics MCP connector available in this Claude session, 2026-07-03 — not from the Project Jarvis PDF.)*

Independent of the developer-token application above, **live Google Ads data is already accessible right now** through a Supermetrics connector active in this Claude/Obsidian session:
- Authenticated against the **Shumaker Roofing** ad account (account ID `8531416360`), connected via `francismarrosales@gmail.com`.
- Lets Claude pull real campaign spend, conversions, ROAS, etc. into chat/notes on request — no developer token, no custom MCP server, no waiting on Google's review.

**This is still not a substitute for the production Jarvis connector described above.** Supermetrics is tied to this personal Claude session/account, not a credential-scoped MCP server the Jarvis orchestrator can call under the read-only tool-allowlist enforcement described in [[Security and Guardrails]]. Treat it as the stand-in for ad hoc reporting/analysis while the developer token remains below production access level (see below).

## Developer token access level: Explorer Access, not yet Basic/Standard (corrected 2026-07-24)
*(Source: screenshot of the live Google Ads API Center — Admin → API Center, account "SRC Ads" 862-825-5035 — provided by the operator 2026-07-24. Supersedes an earlier same-day note in this section that incorrectly stated "Standard Access confirmed" based on an unverified operator report.)*

The `GOOGLE_ADS_DEVELOPER_TOKEN` value present in this repo's `.env.local` (git-ignored, never committed to this vault) matches the token shown in the API Center screenshot (`QYJr2xcro6xm9QWNMnVFMg`), confirming it's the right credential. However, the screenshot's **Access level field reads "Explorer Access"** — Google's current tier naming, roughly equivalent to the legacy "Test Access" tier this note previously described, and **not** Basic or Standard. Explorer Access does not unlock production-account/production-quota use.

**This does not resolve the [[Phase 0 Progress Tracker]] developer-token checklist item.** To reach production access, request an upgrade from Explorer/Test to Basic Access from the same API Center page, then Standard once Basic clears — see "Critical path" above for expected review timelines. Also visible in the screenshot: API contact `tyler@shumakerroofing.com`, company "Shumaker Roofing," intended use "tracking leads" — useful if the upgrade application needs this detail confirmed or resubmitted.

## Local Services Ads folding into Google Ads via Performance Max (announced 2026-07-20)
*(Source: Search Engine Land, "Local Services Ads come to Google Ads via Performance Max," Anu Adegbola, published 2026-07-20 — https://searchengineland.com/local-services-ads-come-to-google-ads-via-performance-max-482692. Clipping was short/partial as saved; treat specifics below as preliminary.)*

Google is retiring the standalone Local Services Ads (LSA) dashboard and moving LSA management into the main Google Ads interface, via a new Performance Max campaign type built for pay-per-lead local service businesses. Phased rollout begins **August 2026**. The new campaign type reportedly retains LSA's core characteristics (e.g. pay-per-lead, Google Business Profile sync) but runs through standard Google Ads infrastructure.

**Why this matters for the Jarvis connector, if Shumaker runs LSAs:** LSAs have historically required a *separate* Local Services Ads API, not the `GoogleAdsService`/GAQL surface this connector note otherwise describes. If LSA campaigns genuinely move into standard Google Ads PMax campaigns, that could mean LSA lead/spend data becomes queryable through the same `GoogleAdsService.SearchStream` GAQL surface already planned for this connector — no second API/connector needed. The source clipping didn't capture full technical/API details of the migration, so still flag for follow-up once the August 2026 rollout details are clearer.

**Confirmed 2026-08-05: Shumaker does run LSAs.** A live campaign pull via Supermetrics (account `8531416360`) found **only one `ENABLED` campaign on the entire account** — `LocalServicesCampaign:SystemGenerated:0005d4fa4fe38d5f`, $342.86/day. Every Search/PMax campaign with actual ad copy is currently `PAUSED`. LSA is presently Shumaker's *only* live paid-search channel, which raises the practical importance of this PMax-merger migration beyond "worth watching" — see [[Marketing/MOCA Ad Creative Evaluation Framework]] for the first real creative evaluation pass against the paused Search inventory.

---
⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]
