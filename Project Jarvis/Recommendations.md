---
title: Recommendations
type: summary
source: "Project Jarvis PDF, pp.7-8"
---

# Recommendations

⬅ Back to [[Project Jarvis - Agentic OS]]

1. **Adopt Claude Agent SDK on a Hetzner/DigitalOcean VPS now**; defer the Mac Mini unless iMessage delivery is a hard requirement from the principals. See [[Layer 1 - Host Infrastructure]], [[Layer 2 - Agentic Harness]].
2. **Kill the "AccuLynx is impossible" assumption** — it has a documented read API. Apply for an AccuLynx Partner Program slot early to raise rate limits and get a (limited) support channel. See [[AccuLynx]].
3. **Apply for the Google Ads developer token in week 1** — Google's official review target is ~2 business days, but an acknowledged early-2026 backlog can stretch it to weeks; this is the longest external dependency on the critical path. See [[Google Ads API]].
4. **Ship the read-only Postgres Reporting agent as the MVP** (Phase 1) — lowest risk, immediate value, proves the guardrail stack before any other system is touched. See [[Implementation Roadmap]], [[PostgreSQL Reporting]].
5. **Build every connector as a GET-only MCP server** — this is the cheapest, most reliable way to enforce read-only across heterogeneous APIs. See [[Security and Guardrails]].
6. **Budget for CallRail's API usage tier** ($80/mo Premium up to 12,000 calls, or $200/mo Platinum up to 300,000) and Premium Conversation Intelligence if you want transcript/sentiment/lead-score signals. See [[CallRail v3]].
7. **Standardize the "qualified lead" definition** in one Markdown file referenced identically by the Marketing and Sales agents so the two never report divergent numbers. See [[Layer 6 - Skills and Knowledge Injection]].

## Thresholds that change the plan
- Move off Replit the moment you need persistent OS-level browser drivers.
- Split to 3 agents when the combined agent exceeds ~20–25 tools or routing accuracy drops.
- Switch the harness to LangGraph if you require model-agnosticism or strict deterministic/auditable cyclic workflows.
- Introduce the Mac Mini only when iMessage or local screen automation becomes mandatory.

## Findings from live validation (2026-07-10, GHL + CallRail only, no AccuLynx/Google Ads)
A manual cross-connector join (CallRail high-scoring calls ↔ GHL opportunities, week of 07-03–07-10) confirmed the Marketing+Sales agent's core value proposition works end-to-end today on just these two connectors. It also surfaced two gaps not in the original PDF:

8. **GHL's `list_opportunities` has no server-side date-range filter and returns unbounded payloads.** A single call against Shumaker's live account (1,107 total opportunities) returned 296K characters and had to be paginated/filtered client-side by `createdAt`. A production sub-agent will hit this same ceiling on any location with real pipeline volume — needs either a narrower default `limit`, client-side date filtering in the [[GoHighLevel v2]] MCP tool layer, or a summarization step before results reach the orchestrator's context. Same risk applies to CallRail's `list_calls` at scale, though its `startDate`/`endDate` params at least let you narrow server-side.
9. **Only ~19% (8 of 43) of this week's high-scoring CallRail calls (`lead_score` ≥ 50) had a matching GHL opportunity by phone number.** This is live evidence for Recommendation #7, not a new problem — the two systems' notions of "qualified" visibly diverge in production data, either from real drop-off between call and booking or from a join gap the phone-number match can't see (name-only entries, alternate numbers, manual bookings). Worth a quick manual audit of a sample of the unmatched 35 before treating the standardized definition file as sufficient — if the gap is a join/data problem rather than a definition problem, the shared file won't fix it alone.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
