---
title: CallRail v3
type: connector
source: "Project Jarvis PDF, pp.4-5"
---

# CallRail v3

⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]

## Summary
Mature, public API. Used by **both** the Marketing sub-agent (source/medium/GCLID first-touch) and the Sales sub-agent (lead qualification/call handling) — see [[Layer 3 - Orchestrator Topology]].

- **Auth:** `Authorization: Token token="<API_KEY>"`
- **Key read endpoints:** `/calls.json` with `lead_status`, `value`, `tags`, `keywords`; Premium Conversation Intelligence (CI) adds `transcription`, `sentiment`, `lead_score`
- **Rate limits:** 1,000/hr, 10,000/day (general)
- **Known roadblocks:** Paid API usage tiers (see below); transcripts require Premium CI plan; 25-month data retention

## Lead-qualification specifics (Sales sub-agent)
- **`lead_status`** — values `good_lead`, `not_a_lead`, `previously_marked_good_lead`, or `null`; also usable as a filter/sort key. This is the **primary lead-qualification signal** *as documented — but see "Live audit" below: it's 0% populated in the actual Shumaker Roofing account as of July 2026.*
- **`value` / `formatted_value`** — monetary value assigned to a call. *Also 0% populated live — see "Live audit" below.*
- **`tags`, `keywords`** (paid-source search terms), **`milestones.qualified`** object ("the last source before a customer becomes scored as a qualified lead"), **`person_id`** (lead identity across calls).
- **Premium Conversation Intelligence** add-on unlocks `transcription`, `conversational_transcript`, `sentiment`, `call_summary`, `call_highlights`, `lead_score` (AI grade "very poor"→"very good") and `lead_score_explanation`.
- **Most qualification fields are NOT in the default response** — they must be explicitly requested via the `fields=` query parameter.

## Live account (confirmed 2026-07-07)
*(Source: local smoke test against the live CallRail v3 API, not the Project Jarvis PDF.)*

API key authenticated successfully via `GET /v3/a.json` (lists accounts visible to a key — no account_id needed up front). Account: **Shumaker Roofing**, `id ACCfeaac83d5b6747a19296411223ea9240`, `numeric_id 241552663`. Test script: `scripts/test-callrail-auth.sh` in the `project-jarvis-skills` repo; key itself lives only in that repo's git-ignored `.env`, never in this vault.

## Live audit (June 2026 calls, run 2026-07-07)
*(Source: [[Marketing/CallRail Call Audit (June 2026)|CallRail Call Audit (June 2026)]] in the new `Marketing/` folder — full breakdown there, not from the Project Jarvis PDF.)*

Audited 370 calls (88% answered). Two documented fields above are **not actually used** in the live account: `lead_status` and `value` are both unset on 100% of calls. The real qualification signals present in the data are `tags` (Schedule requested/booked, ~24% of calls) and Premium CI's `lead_score` (populated on 69% of calls, avg 39.6/100). This is an open decision, not yet resolved — see the audit note for detail.

## API pricing tiers
(CallRail charges for API usage, confirmed from CallRail Help Center, updated June 2, 2026)

| Tier | Volume | Cost |
|---|---|---|
| Free | 0–1,500 API calls/mo | No charge |
| Premium | 1,501–12,000/mo | $80 USD/mo |
| Platinum | 12,001–300,000/mo | $200 USD/mo |

Calls made through CallRail's native Google/Meta/HubSpot integrations do **not** count toward usage. This is a real recurring cost to budget — see [[Recommendations]] #6.

---
⬅ Back to [[Layer 4 - Connectors Overview]] · [[Project Jarvis - Agentic OS]]
