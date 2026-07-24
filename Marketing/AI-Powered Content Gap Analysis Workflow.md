---
title: AI-Powered Content Gap Analysis Workflow
type: framework
source: "Search Engine Land, \"How to build an AI-powered content gap analysis workflow\", Sara Vicioso, published 2026-07-08 (https://searchengineland.com/build-ai-powered-content-gap-analysis-workflow-481781)"
---

# AI-Powered Content Gap Analysis Workflow

⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]

## The core idea
Finding keyword gaps isn't the hard part — SEO tools surface them easily. The hard part is turning thousands of keywords spread across multiple reports into a prioritized roadmap. This workflow combines three data sources with an AI layer (Claude, optionally via MCP) to do that prioritization: **Semrush** for competitive gaps, **Google Search Console** for first-party validation, **Google Analytics** for business context.

Two ways to run it: export reports manually and upload them, or (if the platforms are MCP-connected) let Claude pull the data directly. The analysis steps are identical either way.

## 6-step process
1. **Choose the right competitors** — start from Semrush's Organic Competitors report (finds domains competing for the same keywords, not just known brand rivals), then narrow to 3-5 sites that actually match the target business/audience. Explicitly filter out marketplaces (Amazon), community sites (Reddit/Quora), reference sites (Wikipedia), directories, and non-competing publishers — these skew the analysis with unrealistic "opportunities." Sanity-check the final list with stakeholders, since sales/product teams may flag newer or strategically important competitors that don't surface in tool data.
2. **Gather and prepare data** — pull Semrush's Keyword Gap report (three buckets: competitors rank, we don't / we rank lower than competitors / we rank, competitors don't), validate against GSC (queries with high impressions but average position 8-20 signal "almost there" topics — often higher priority than net-new pages), and add GA engagement/conversion context. Clean the data before analysis: dedupe, strip branded/competitor terms, remove out-of-scope queries and mismatched search intent.
3. **Ask Claude to find the story** — the common mistake is asking AI to "cluster these keywords," which produces keyword-similarity clusters with no strategic value. Instead, feed Claude full business context (products, audience, goals, constraints) and ask it to think like an SEO strategist: group by search intent, funnel stage, business relevance, existing authority (GSC), engagement (GA4), content format, and internal-linking opportunity. Output should be topic clusters with a recommendation each, classified as **quick wins** (refresh/expand existing pages), **new content opportunities**, or **authority plays** (larger, multi-piece investments) — plus mandatory human review before accepting any cluster.
4. **Score and prioritize** — score each cluster on business relevance, existing authority, search demand, ranking difficulty, and estimated effort (e.g. 5-point scale each), then have Claude calculate and explain an overall priority score. Volume shouldn't dominate the model — a topic that converts beats a high-volume topic that doesn't.
5. **Turn priorities into page-level recommendations** — for each high-priority opportunity, generate: why it was selected, primary keyword cluster, current rankings/impressions, supporting GSC/competitor evidence, recommended changes, estimated effort, expected impact, priority level. Connected (MCP) data lets Claude validate against URL-level Search Console data before recommending work — catching inflated impression counts or mislabeled URLs that would otherwise waste team hours.
6. **Measure whether the gap is closing** — track target-query impressions/position/clicks in GSC post-publish, cross-check against GA engagement/conversion (rankings improving without engagement/conversion improving signals another optimization pass is needed), and (if MCP-connected) ask Claude to summarize performance changes over time. Repeat the whole workflow quarterly, or more often in fast-moving verticals — this is not a one-time exercise.

## Prompt template
The article includes a full reusable prompt (business-context block + 6 tasks: identify gaps, validate opportunities, create topic clusters, prioritize, recommend next steps, deliver results as executive summary + scored table + page-level recs + 30/60/90-day roadmap). It explicitly asks Claude to flag and explain any conflicts between Semrush/GSC/GA data rather than silently picking one, and to self-validate its own recommendations against Search Console/Analytics data before presenting them. See the source clipping for the full prompt text: [[Clippings/How to build an AI-powered content gap analysis workflow]].

## Relevance to Shumaker Roofing
Not yet actioned — no Shumaker-specific competitor list, keyword gap pull, or roadmap exists yet. Two things make it worth prioritizing:
- Directly matches the **SEO agent / content writer agent / keyword researcher agent** candidates listed in [[GOALS]]'s "Next horizon" section — this workflow is a ready-made process template for whichever of those sub-agents gets built first, and doesn't require any Project Jarvis connector (AccuLynx/GHL/CallRail/Google Ads) to start.
- Requires a Semrush connection (this session has one available via MCP, separate from the Jarvis architecture's connector stack) plus GSC/GA access for Shumaker Roofing's site — neither confirmed connected/available as of this note. That's the actual next step before this workflow can run for real, not a tooling gap in the workflow itself.

Also relevant to [[Project Jarvis/Layer 6 - Skills and Knowledge Injection]] as a concrete example of a multi-source-context prompt template that could become a reusable Skill once a content/SEO sub-agent exists.

---
⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]
