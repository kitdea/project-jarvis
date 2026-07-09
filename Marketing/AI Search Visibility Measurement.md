---
title: AI Search Visibility Measurement
type: framework
source: "Search Engine Land, \"How to measure prompt-level visibility in AI search\", Casey Nifong, published 2026-07-06 (https://searchengineland.com/measure-prompt-level-visibility-ai-search-481577)"
---

# AI Search Visibility Measurement

⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]

## The shift
AI search (ChatGPT, Google AI Mode, etc.) doesn't have "rankings" — the same prompt can return different results depending on conversation history, location, personalization, follow-ups, model version, and time. Visibility is now **probabilistic, not deterministic**. The right question isn't "do we rank?" but "how often are we included across the conversations that matter?"

## 5-step measurement framework
1. **Accept there's no "position 1"** — stop trying to recreate traditional SEO rank reports inside AI answers.
2. **Build a prompt library, not a keyword list** — organize by search intent (discovery, comparison, evaluation, validation, objections, alternatives, implementation); track 200-500 prompts rather than ~10 keywords.
3. **Use prompt clusters, not individual questions** — group by category/industry/feature; one prompt rarely tells you anything, patterns across clusters do.
4. **Mix synthetic prompts with real user questions** — synthetic prompts (generated from keyword research) give repeatable benchmarking; real prompts (sales calls, support conversations, on-site search, community discussions) are richer but harder to source. Libraries should evolve as customer language changes.
5. **Measure multi-turn conversations** — a brand may not appear in the opening prompt but show up by the third turn as the conversation narrows; single-shot testing misses this.

## Metrics that matter
- **Inclusion rate** — % of tracked prompts where the brand appears (the single most important metric if you only track one). Segment by buying stage, product category, industry, geography, AI model.
- **Position within the response** — first recommendation vs. buried mention vs. comparison-table placement; prominence still matters even without formal rankings.
- **Brand framing** — *how* the brand is described (e.g. "widely considered an enterprise leader" vs. "best suited for smaller teams"), not just whether it's mentioned.
- **Sentiment / confidence** — the conviction behind a mention ("generally considered the strongest option" vs. "may be worth considering"), not just positive/negative.
- **Competitive share of voice** — how often competitors appear alongside or instead of you; distinguishes category-wide shifts (e.g. a model update dropping everyone) from brand-specific problems.

## A practical dashboard (4 categories)
- **Visibility:** inclusion rate, competitive share of voice, prompt coverage, model coverage
- **Response quality:** position, brand framing, sentiment, message consistency
- **Technical signals:** citation frequency, content retrieval success, entity consistency, freshness
- **Business outcomes:** AI referral traffic, assisted conversions, branded search lift, direct traffic trends, AI-influenced pipeline

## What you still can't reliably track
No platform sees every AI conversation, every citation shown to every user, or how personalization changed a given response. Be skeptical of any vendor claiming full visibility into AI conversations — ask exactly how they're collecting that data. The goal is a repeatable, consistent measurement baseline over time, not perfect attribution.

## Relevance to Shumaker Roofing
Not yet actioned — this is a new measurement category, not an existing channel. Two things make it worth tracking going forward:
- [[Marketing/CallRail Call Audit (June 2026)|CallRail Call Audit (June 2026)]] already found 70% of June call volume came from branded/direct search — AI search visibility (particularly brand framing and inclusion rate for "roofing company near me"-style prompts) is a plausible adjacent channel worth a baseline read, especially since it requires no Jarvis connector access to start (independent of the Google Ads developer-token blocker).
- No prompt library, tooling, or baseline has been established yet — this note captures the framework only. Building an actual Shumaker Roofing prompt library (discovery/comparison/evaluation prompts for local roofing) is an open follow-up, not yet started.

---
⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]
