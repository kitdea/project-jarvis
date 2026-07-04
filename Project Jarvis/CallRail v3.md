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
- **`lead_status`** — values `good_lead`, `not_a_lead`, `previously_marked_good_lead`, or `null`; also usable as a filter/sort key. This is the **primary lead-qualification signal**.
- **`value` / `formatted_value`** — monetary value assigned to a call.
- **`tags`, `keywords`** (paid-source search terms), **`milestones.qualified`** object ("the last source before a customer becomes scored as a qualified lead"), **`person_id`** (lead identity across calls).
- **Premium Conversation Intelligence** add-on unlocks `transcription`, `conversational_transcript`, `sentiment`, `call_summary`, `call_highlights`, `lead_score` (AI grade "very poor"→"very good") and `lead_score_explanation`.
- **Most qualification fields are NOT in the default response** — they must be explicitly requested via the `fields=` query parameter.

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
