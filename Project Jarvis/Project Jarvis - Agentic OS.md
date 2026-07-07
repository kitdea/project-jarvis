---
title: Project Jarvis — Agentic OS
type: hub
source: "Project Jarvis_ Multi-Agent AI Architecture for Shumaker Roofing.pdf"
---

# Project Jarvis — Agentic OS

> Central index for the multi-agent AI architecture proposed for **Shumaker Roofing Co.** (Marketing, Sales & Reporting). Every note below links back here. Click through for full detail + sources.

## TL;DR
Build it as **[[Layer 2 - Agentic Harness|Claude Agent SDK]]** (orchestrator + subagents) running on a **[[Layer 1 - Host Infrastructure|cloud VPS]]** (Hetzner/DigitalOcean), connecting to every platform through **read-scoped MCP servers**. The AccuLynx "dealbreaker" is **false** — see [[AccuLynx]]. Start with a **2-agent split** ([[Layer 3 - Orchestrator Topology|Marketing+Sales combined + isolated Reporting agent]]).

→ Full breakdown: [[TLDR and Key Findings]]

---

## The Six Layers

| Layer | Note | One-line summary |
|---|---|---|
| 1 | [[Layer 1 - Host Infrastructure]] | VPS (Hetzner/DigitalOcean) recommended; Mac Mini only if iMessage/local automation is required |
| 2 | [[Layer 2 - Agentic Harness]] | Claude Agent SDK is the top pick over LangGraph, CrewAI, AutoGen, Hermes |
| 3 | [[Layer 3 - Orchestrator Topology]] | Hub-and-spoke: Jarvis orchestrator + Marketing+Sales agent + Reporting agent |
| 4 | [[Layer 4 - Connectors Overview]] | Feasibility of AccuLynx, Google Ads, GoHighLevel, CallRail, PostgreSQL |
| 5 | [[Layer 5 - Communication Channels]] | Slack (primary, Bolt/Socket Mode), iMessage (optional), Voice (future) |
| 6 | [[Layer 6 - Skills and Knowledge Injection]] | Markdown "Skills" + two-tier retrieval to prevent business-logic hallucination |

## Connectors (Layer 4 detail)
- [[AccuLynx]] — sales pipeline, milestones, financials (the flagged "dealbreaker" — debunked)
- [[Google Ads API]] — campaign/PMax performance, ROAS (longest external dependency: developer token approval)
- [[GoHighLevel v2]] — funnel stages, lead attribution
- [[CallRail v3]] — call tracking, lead qualification, paid API tiers
- [[PostgreSQL Reporting]] — read-only ROI dashboard, highest blast radius

## Execution
- [[Routing Example]] — worked example: "How is Victor's pipeline looking vs. Google Ads spend this week?"
- [[Implementation Roadmap]] — Phase 0 through Phase 5 (original 7-week pace)
- [[Accelerated Launch Plan (2-Week Sprint)]] — compressed plan for the 2026-07-15 go-live target: what ships day 1, what's cut, what fast-follows
- [[Phase 0 Progress Tracker]] — living checklist tracking real-world execution against Phase 0
- [[Ingestion Log]] — record of raw-source ingestion/verification passes against this wiki
- [[Security and Guardrails]] — defense-in-depth for read-only enforcement, credentials, prompt injection
- [[Recommendations]] — the 7 top-line action items
- [[Caveats]] — source quality, drift risk, unverified assumptions

## Other wikis in this vault
- [[Marketing/Marketing - Overview|Marketing — Overview]] — channel audits and competitive/tactical playbooks for Shumaker Roofing's marketing operations. Separate second-brain wiki from this one; feeds the Marketing sub-agent described above but isn't architecture-planning content itself.

---
*Source: "Project Jarvis: A Production-Ready Multi-Agent AI Architecture for Shumaker Roofing Co. (Marketing, Sales & Reporting)" PDF, pp. 1–8.*
