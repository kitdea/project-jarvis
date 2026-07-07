---
title: CallRail Call Audit (June 2026)
type: audit
source: "Live pull via CallRail v3 API (GET /v3/a/{account}/calls.json), run 2026-07-07 — not from the Project Jarvis PDF"
---

# CallRail Call Audit (June 2026)

⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]

> First note in the `Marketing/` folder — the start of a second-brain wiki for Shumaker Roofing's marketing operations, separate from the `Project Jarvis/` architecture notes. See [[CallRail v3]] for the connector this data came from.

## Method
Pulled all calls for the Shumaker Roofing CallRail account (`numeric_id 241552663`) for 2026-06-01 through 2026-06-30 via `scripts/callrail-monthly-audit.py` in the `project-jarvis-skills` repo. The script computes aggregate stats only — no raw call records (customer names, phone numbers, recordings, transcripts) are written to disk or to this note.

## Headline numbers
| Metric | Result |
|---|---|
| Total calls | 370 |
| Answered | 326 (88%) |
| Avg. answered call length | 167s (~2:47) |

## Source mix
"Shumaker" (direct/branded) 259 (70%) · Google Ads 55 (15%) · Outbound 37 (10%) · Direct 5 · Google My Business 5 · Google Organic 5 · Website-calls-only 3 · Google Local Services Ads 1

Medium field has case-inconsistency noise ("direct" vs "Direct", "Organic" appearing as its own bucket) — clean this up before building attribution logic on top of it.

## Scheduling signal (tags)
Schedule requested: 44 · Schedule booked: 43 — combined ~24% of calls hit one of these. Currently the closest thing to a real conversion signal in this data.

## Lead score (Premium Conversation Intelligence)
Populated on 256/370 calls (69%). Average score **39.6/100**, skewing weak:
- <60 (weak): 159
- 60–79 (good): 74
- ≥80 (great): 23

## Gaps found (flagged, not yet resolved)
1. **`lead_status` is unset on all 370 calls (100%).** [[CallRail v3]] documents this as the Sales sub-agent's primary lead-qualification signal, but it isn't being populated in practice. Needs a decision: start manually tagging it, or design qualification logic around what's actually populated (`tags` + `lead_score`) instead.
2. **`value` is unset on all 370 calls (100%).** No revenue is being attributed through CallRail — anything assuming CallRail-sourced revenue numbers (e.g. in [[Recommendations]]) isn't backed by real data yet.

---
⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]
