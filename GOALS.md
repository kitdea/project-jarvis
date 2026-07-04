# Goals

_Last updated: 2026-07-01_

## Who I am
Operator of **Shumaker Roofing Company**. Building out an AI agent system ([[Project Jarvis/Project Jarvis - Agentic OS|Project Jarvis]]) to run Marketing, Sales & Reporting, with plans to scale into a broader agent roster across the business.

## Primary goal — Project Jarvis go-live
**Target: system live by 2026-07-15 (two weeks from today).**

Success = the full 2-agent system running in production:
- Marketing+Sales combined agent (AccuLynx, Google Ads, GoHighLevel, CallRail)
- Isolated Reporting agent (Postgres, read-only)

> [[Project Jarvis/Implementation Roadmap|Implementation Roadmap]] paces this at ~7 weeks (Phase 0 through Phase 2) under its original plan. Resolved: see [[Project Jarvis/Accelerated Launch Plan (2-Week Sprint)|Accelerated Launch Plan (2-Week Sprint)]] for the compressed, parallelized plan — day-1 scope is the Reporting agent + Marketing+Sales agent on GoHighLevel/AccuLynx/CallRail. **Google Ads is descoped from day-1** (developer token wasn't submitted as of 2026-07-01, and won't clear review in time) and fast-follows once the token is approved.

Track execution against this in [[Project Jarvis/Phase 0 Progress Tracker|Phase 0 Progress Tracker]].

## Next horizon — expand beyond the first 2 agents
Plan to add **5+ more projects/sub-agents** on top of the Jarvis architecture, including:
- SEO agent
- Content writer agent
- QA agent
- Keyword researcher agent

This pushes past the original Marketing+Sales/Reporting scope in [[Project Jarvis/Layer 3 - Orchestrator Topology|Layer 3 - Orchestrator Topology]]. Note the existing threshold rule from [[Project Jarvis/Recommendations|Recommendations]]: *"Split to 3 agents when the combined agent exceeds ~20–25 tools or routing accuracy drops."* Adding 5+ new sub-agents will likely cross that threshold fast — worth designing the expanded topology deliberately rather than bolting agents on ad hoc. Candidate for a dedicated note once the first 2-agent system is live and stable.

## Open questions to revisit
- What's the priority order for the 5+ new sub-agents (SEO / content / QA / keyword research)?
- Does the expanded roster need its own orchestrator topology, or does it slot under the existing Jarvis hub-and-spoke?
