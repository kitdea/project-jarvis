---
title: Fable 5 Prompting Patterns
type: reference
source: "X/Twitter thread (@cyrilXBT), \"How to Actually Prompt Fable 5, Straight From the Team That Built It\", published 2026-07-02, summarizing Anthropic's official Fable 5 prompting guide (https://x.com/cyrilXBT/status/2072706408710058492)"
---

# Fable 5 Prompting Patterns

⬅ Back to [[Project Jarvis - Agentic OS]]

> Operational prompting guidance for **Fable 5**, the current Anthropic model generation (successor to Opus 4.8, back globally as of 2026-07-01). This isn't Shumaker-specific — it's engineering guidance for *how* to prompt the model underneath the [[Layer 2 - Agentic Harness|Claude Agent SDK harness]] that Project Jarvis is being built on, so it's filed as its own note rather than folded into Layer 2's framework-comparison content.

## What Fable 5 is actually for
Not a faster version of prior models — a different category, suited to sustained, autonomous, multi-stage work that previously fragmented or hallucinated partway through. Anthropic's guide warns that testing it only on short, already-solved tasks undersells it; the signal shows up on problems previously too complex/long-running to automate at all. Relevant framing for Jarvis: the orchestrator↔sub-agent tasks worth building first are the ones Marketing/Sales staff currently do by hand across multiple tools (see [[Routing Example]]), not simple single-tool lookups.

## Effort parameter (low/medium/high/xhigh)
Controls depth of reasoning before responding — a cost/latency dial, not a quality dial to max out by default. High is the default for demanding work; xhigh (or "ultrathink" inline in a prompt) is for first-shot-correctness-critical tasks; medium/low suit routine subtasks. **Response latency changes accordingly** — minutes per response at high effort, potentially hours on autonomous runs — so any API integration needs timeout settings re-tuned, not left at defaults tuned for faster prior models.

## Progress verification prompt (anti-fabrication)
The single most load-bearing pattern for long autonomous runs: without it, a model can report a step "done" without having verified it against actual tool output (the "I did it" problem), and this gets more likely the longer/more complex the task. Fix — add to any long-running system prompt:
> "Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for. If something is not yet verified, say so explicitly. Report outcomes faithfully: if tests fail, say so with the output. If a step was skipped, state that. When something is done and verified, state it plainly without hedging."

**Directly relevant to Jarvis's anti-hallucination requirements** in [[Layer 6 - Skills and Knowledge Injection]] — that note already requires sub-agents to cite source files for business-logic claims; this is the same discipline applied to *progress* claims, not just business-logic claims.

## Proactivity constraint
Fable 5 is more proactive than prior models — it will sometimes take unrequested actions it infers would help (drafting an email, creating a defensive git branch) even when not asked. Fine in a supervised chat session; a real risk for any Jarvis sub-agent that touches GHL/AccuLynx/CallRail/Postgres unattended. Constraint to add to any automated/unattended system prompt:
> "When the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Do not apply a fix until asked. Before running a command that changes system state, including restarts, deletes, or config edits, confirm that the evidence actually supports that specific action."

Directly reinforces the **read-only enforcement** already required in [[Security and Guardrails]] — this is the prompt-level backstop behind the tool-allowlist/GET-only MCP server enforcement described there, not a substitute for it.

## Memory system prompt (persistent, cross-session)
Recommended structure: one Markdown file per lesson, one-line summary at top, records what was learned/corrected/confirmed and why — but only what isn't already recorded elsewhere; duplicates get merged, wrong notes get deleted rather than left to rot. Setup prompt:
> "Maintain a memory system in [folder]. Store one lesson per file with a one-line summary at the top. Record corrections and confirmed approaches alike, including why they mattered. Do not save information already in the repo or chat history. Update existing notes rather than creating duplicates. Delete notes that have proven incorrect."

**This is structurally the same pattern this vault already runs** — see [[Clippings/Karpathy - LLM Wiki (Gist)]] and the "Second-brain / wiki maintenance pattern" in `CLAUDE.md`: read once, integrate into existing pages, flag contradictions, log the event. Confirms the wiki's own design is aligned with Anthropic's own recommended practice for Fable 5, not just Karpathy's independent framing.

## Final response instruction (outcome-first)
After long tool-heavy runs, a model can default to summarizing in internal shorthand (abbreviations, arrow chains) that only make sense to someone who watched every step. Fix:
> "For your final response after this task: state the outcome first, then the key supporting details. Do not include working abbreviations, internal labels, or arrow chains in the user-facing output. Users need the outcome, the evidence, the risks if any, and the next step."

## Sub-agent delegation pattern
Three components for good results when Fable 5 delegates to its own sub-agents: (1) explicit permission for when to delegate vs. handle directly, (2) a specific bounded scope + success criteria per sub-agent (not a vague instruction), (3) explicit handling of partial/failed sub-agent results — failures should be reported as information, never papered over with an inferred guess at what a failed sub-agent would have found. **Directly applicable to [[Layer 3 - Orchestrator Topology]]'s hub-and-spoke design** — the Jarvis orchestrator delegating to the Marketing+Sales and Reporting sub-agents should follow this same bounded-scope-plus-explicit-failure-reporting pattern.

## Safety classifier / refusal handling
Refusals return `stop_reason: "refusal"` as an **HTTP 200**, not an error — API integrations must check `stop_reason` separately from HTTP status, since a refusal is a successful call with a specific response type. Affects under 5% of typical queries per Anthropic's testing, but can surface on benign tasks touching flagged domains (offensive cybersecurity, biology/life sciences). Worth a specific test pass once Jarvis's connectors are live, given financial/pipeline data isn't a flagged domain but worth confirming no false-positive refusals occur on routine reporting queries.

## Migration checklist (if adapting prior prompts/workflows to Fable 5)
Per the source guide, six areas to review before treating any migration as complete: timeouts, refusal handling, proactivity constraints, progress verification, memory structure, final response format — plus testing on at least one task that was genuinely difficult for the prior model, since that's where the difference actually shows up (routine tasks look the same on both).

## Relevance to Shumaker Roofing / Project Jarvis
Not yet actioned as concrete prompt text anywhere in this vault's own Skills/knowledge repo (`project-jarvis-skills`, per [[Phase 0 Progress Tracker]]). Worth folding the **progress verification**, **proactivity constraint**, and **sub-agent delegation** patterns into the Jarvis orchestrator's system prompt once [[Layer 2 - Agentic Harness]]'s Claude Agent SDK build actually starts — these are general-purpose reliability patterns, not Shumaker-specific business logic, so they belong in the harness/orchestrator prompt layer rather than the Layer 6 Skills files.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
