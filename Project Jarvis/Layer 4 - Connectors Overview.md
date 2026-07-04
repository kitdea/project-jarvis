---
title: "Layer 4 — Connectors & API Feasibility"
type: layer
source: "Project Jarvis PDF, pp.3-5"
---

# Layer 4 — Connectors & API Feasibility (CRITICAL)

⬅ Back to [[Project Jarvis - Agentic OS]]

## Feasibility Matrix

| Platform | API openness | Auth | Key read endpoints | Rate limits | Known roadblocks |
|---|---|---|---|---|---|
| [[Google Ads API]] | Mature, fully public (v24+) | OAuth2 (3-legged or service account) + developer token | `GoogleAdsService.SearchStream` w/ GAQL: `campaign`, `metrics.cost_micros`, `metrics.conversions_value` (ROAS), PMax via `asset_group` | 10k ops/batch; access-level quotas (Basic = 15,000 ops/day) | Developer token requires Google approval (Basic→Standard); token cannot hit production accounts until approved; cost in micros (÷1e6) |
| [[GoHighLevel v2]] | Mature, public | OAuth2 (Authorization Code) or Private Integration Token; access token expires ~24h, refresh token ~1yr | Opportunities/pipelines (funnel stages), Contacts (lead attribution), Conversations | 100 req/10s burst; 200,000/day per app per location | V1 end-of-support 31-Dec-2025 — must use v2; OAuth advanced features gated to Agency Pro plan; `companies.readonly` scope available |
| [[AccuLynx]] | Public REST v2 (documented) | Bearer API key (per location) | Jobs, Milestones, Financials, Invoices, Payments, Sales Owner, Users | 30 req/s per IP; 10 req/s per key | No dev support; per-location keys; keys are write-capable (no read-only scope); partner program for higher limits |
| [[CallRail v3]] | Mature, public | `Authorization: Token token="<API_KEY>"` | `/calls.json` w/ `lead_status`, `value`, `tags`, `keywords`; Premium CI adds `transcription`, `sentiment`, `lead_score` | 1,000/hr, 10,000/day (general) | Paid API usage tiers; transcripts require Premium Conversation Intelligence plan; 25-month data retention |
| [[PostgreSQL Reporting]] | N/A (direct) | DB role credentials | Read-only `SELECT` on ROI dashboard | DB-configured | Text-to-SQL injection/write risk — see [[Security and Guardrails]] |

## Note on Google Ads token approval (corrected critical-path estimate)
Google's official targets are roughly **two business days** for a Basic Access review and up to **~10 business days** for Standard Access. As of early 2026, Google acknowledged a backlog and longer review times. **Plan for two business days as the optimistic case but weeks in practice** — this is the single longest external dependency on the build, so submit the application before anything else.

## Connector detail pages
- [[AccuLynx]]
- [[Google Ads API]]
- [[GoHighLevel v2]]
- [[CallRail v3]]
- [[PostgreSQL Reporting]]

---
⬅ Back to [[Project Jarvis - Agentic OS]]
