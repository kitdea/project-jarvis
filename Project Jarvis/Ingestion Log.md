---
title: Ingestion Log
type: log
source: "n/a — living log of raw-source ingestion events, per the LLM Wiki pattern (see Clippings/How I Built a Second Brain That Maintains Itself.md)"
---

# Ingestion Log

⬅ Back to [[Project Jarvis - Agentic OS]]

> Tracks every time a raw source in `Clippings/` gets read and cross-checked against the wiki, plus any other new-information event (e.g. a live tool/data connection) that changes what a wiki page should say. Raw sources are immutable — the AI reads them but never edits them; this log is where the AI's work on them gets recorded.

## Log

| Date | Source | Action | Result |
|---|---|---|---|
| 2026-07-03 | `Clippings/How I Built a Second Brain That Maintains Itself.md` | Read in full (surfaced via editor selection). Explains Karpathy's "LLM Wiki" pattern: raw sources → AI-maintained wiki → schema, as an alternative to RAG. | Reframed an earlier misread of "apply Karpathy's approach" (had been read as "train an LLM from scratch"). Triggered the rest of this session's work: verifying the wiki against its source and formalizing the pattern in `CLAUDE.md`. |
| 2026-07-03 | `Clippings/Project Jarvis_ Multi-Agent AI Architecture for Shumaker Roofing.pdf` (the original source PDF, previously cited but not present in the vault — added same day) | Full ingestion: read all 8 pages, cross-checked against all 18 existing [[Project Jarvis - Agentic OS\|Project Jarvis]] wiki pages line by line for accuracy, drift, and citation correctness. | **17 of 18 pages verified accurate with correct page-range citations, zero contradictions found.** One citation fix applied: [[Recommendations]]'s frontmatter cited only "p.7," but its "Thresholds that change the plan" section draws from the top of page 8 — corrected to "pp.7-8." No content errors found anywhere. |
| 2026-07-03 | `Clippings/Karpathy - LLM Knowledge Bases (X thread).md` (Karpathy's original tweet; auto-saved by the web clipper with a ~250-char filename that broke git — renamed) | Read in full. Confirms `raw/` is Karpathy's own naming convention, and describes the ingest/Q&A/lint loop in his own words. | Directly informed the "Second-brain / wiki maintenance pattern" section added to `CLAUDE.md`, and the new `ingest-source` / `lint-wiki` skills. |
| 2026-07-03 | Live tool connection (not a `Clippings/` file): Supermetrics MCP connector, Google Ads data source, authenticated to the Shumaker Roofing ad account (`8531416360`) | Discovered Google Ads was available via this session's existing Supermetrics connector, confirmed authentication after the user connected it, confirmed the correct account was attached. | Updated [[Google Ads API]] with a new "Interim option: Supermetrics" section and [[Phase 0 Progress Tracker]] to record that live ad hoc Google Ads reporting is now possible — explicitly noted this does **not** reduce urgency on the still-unsubmitted developer token application. |
| 2026-07-07 | Live pull (not a `Clippings/` file): CallRail v3 API, `GET /calls.json`, Shumaker Roofing account, June 2026 (370 calls) | Aggregate-only audit via `scripts/callrail-monthly-audit.py` (`project-jarvis-skills` repo) — no raw customer data written to the vault. | Created [[Marketing/CallRail Call Audit (June 2026)]], the first note in the new `Marketing/` folder. Updated [[CallRail v3]] to flag that `lead_status` and `value` — documented as the primary lead-qualification/revenue fields — are 0% populated in the live account; surfaced as an open decision, not resolved. |
| 2026-07-07 | `Clippings/A Google Ads targeting tactic that cut invalid clicks by 50%.md` (Search Engine Land, John Horn, 2026-07-02) | Read in full. Checked against existing Project Jarvis notes for prior mentions of invalid clicks/click fraud — none found; genuinely new concept. | Created [[Marketing/Invalid Click Mitigation - Audience Targeting Tactic]]. Cross-linked to [[Google Ads API]] and [[Phase 0 Progress Tracker]] (currently moot pending the Google Ads developer token, but actionable directly in the Google Ads UI regardless of Jarvis connector status). |
| 2026-07-07 | `Clippings/How competitors target your branded traffic with Google Ads.md` (Search Engine Land, Dii Pooler, 2026-07-02) | Read in full. Checked against existing notes — no prior coverage of DKI/comparison-page/brand-modifier competitor tactics; genuinely new concept. | Created [[Marketing/Defending Branded Search from Competitor Google Ads Tactics]]. Cross-linked to the CallRail audit's finding that 70% of June calls came from the branded/direct source — this is the traffic these tactics target. |
| 2026-07-08 | `Clippings/How to measure prompt-level visibility in AI search.md` (Search Engine Land, Casey Nifong, 2026-07-06) | Backfilled — clipped 2026-07-07 but never ingested; graphify's semantic pass had already surfaced fragments into the graph (a thin, weakly-linked "AI Search Visibility Framework" community) with no corresponding wiki page. Read in full. Checked against existing notes — no prior coverage of AI/prompt-level search visibility measurement; genuinely new concept. | Created [[Marketing/AI Search Visibility Measurement]] (5-step framework: prompt library over keywords, prompt clusters, synthetic+real prompts, multi-turn tracking; metrics: inclusion rate, position, brand framing, sentiment, competitive share of voice). Linked from [[Marketing/Marketing - Overview|Marketing — Overview]] under a new "Measurement frameworks" section. Flagged as not yet actioned — no Shumaker Roofing prompt library or baseline exists yet. |

## How this log is used
Standard ingestion workflow (what should happen on every future entry) now lives in `CLAUDE.md` under "Second-brain / wiki maintenance pattern," and is invokable via the `ingest-source` skill — this file doesn't duplicate those rules, just records outcomes.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
