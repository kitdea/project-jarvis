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

## How this log is used
Standard ingestion workflow (what should happen on every future entry) now lives in `CLAUDE.md` under "Second-brain / wiki maintenance pattern," and is invokable via the `ingest-source` skill — this file doesn't duplicate those rules, just records outcomes.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
