---
title: "How to Actually Prompt Fable 5, Straight From the Team That Built It"
source: "https://x.com/cyrilXBT/status/2072706408710058492"
author:
  - "[[@cyrilXBT]]"
published: 2026-07-02
created: 2026-07-12
description: "Fable 5 is back globally as of today, July 1, 2026.Before you open it and run the same prompts you used on Opus 4.8, read this. Anthropic pu..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HMKZCGVWoAAYYi7?format=jpg&name=large)

Fable 5 is back globally as of today, July 1, 2026.

Before you open it and run the same prompts you used on Opus 4.8, read this. Anthropic published an official prompting guide for Fable 5 specifically, and the single most important thing it says is that most teams undersell the model by testing it on the wrong things.

Fable 5 is not a smarter version of the same tool you have been using. It is a different category of tool that requires a different category of prompt. The teams seeing the best results are not the ones who write better questions. They are the ones who give it harder problems, structure longer runs differently, and understand which behavioral changes in Fable 5 require prompt updates before existing workflows break.

This is the full breakdown of what that guide actually says, with everything you need to start using Fable 5 the way Anthropic intends.

## What Fable 5 Is Actually For

The clearest framing in Anthropic's official guide is this: Fable 5 takes on problems that were previously too complex, long-running, or ambiguous for prior models. It is particularly effective at end-to-end work that takes a person hours, days, or weeks to complete.

That sentence is doing more work than it looks like. It is telling you where the model's advantage actually lives, and it is not in faster one-shot answers to simple questions. It is in sustained, autonomous, multi-stage work that previous models would fragment, hallucinate through, or simply stop completing correctly halfway through.

The official guide is explicit: testing Fable 5 only on simpler workloads tends to undersell its capabilities. If your evaluation prompts are short, well-defined tasks you were already completing fine with Opus 4.8, you will see marginal improvement and conclude Fable 5 is not worth the cost. The teams reporting genuinely different outcomes are applying it to their hardest unsolved problems, the ones that previously required hours of human iteration, multiple back-and-forth sessions, or fell apart in the execution phase.

Practically, this means the first question to ask when evaluating Fable 5 is not "how does it do on my current prompts?" It is "what did we stop trying to automate because no model could complete it reliably?" Those abandoned workflows are where Fable 5 starts to look like a different product entirely.

## The Biggest Behavioral Change: Responses Take Longer

The first thing that surprises teams migrating from Opus 4.8 to Fable 5 is response latency. Anthropic's guide names this directly as the most common source of confusion for teams making the switch.

At high effort, a single response can take minutes. On autonomous runs, it can take hours. This is not a bug or a sign of inefficiency. It is the model doing the work correctly. Fable 5 plans before it acts, checks its own work, expands context as needed, and does not rush to produce a quick output that requires you to immediately prompt it again to fix what went wrong.

The practical implication is that your timeout settings almost certainly need updating if you are running Fable 5 via the API. Anthropic explicitly recommends revisiting timeout strategy as part of any migration from Opus 4.8. A timeout that made sense for a model producing a response in ten seconds will break workflows where Fable 5 is correctly spending three minutes planning a complex multi-stage task.

The effort parameter controls how deeply Fable 5 thinks before responding. High is the default and appropriate for most demanding work. xhigh is the maximum and is recommended when first-shot correctness matters more than speed, since Fable 5 at xhigh will reflect on and validate its own work before responding. Medium and low are available for routine subtasks where the full capability is unnecessary and cost matters.

The key principle: effort level is not a quality dial you crank up for better answers. It is a cost and latency trade-off you calibrate based on what the specific task actually requires. A codebase migration warrants xhigh. A simple formatting task does not.

## How to Control Effort in Prompts

For tasks where you want maximum reasoning without running a dynamic workflow with parallel agents, you can control effort directly in your prompt.

For single turn depth, include "ultrathink" in your prompt. This signals xhigh reasoning effort for that specific response without changing any other session settings or triggering workflow orchestration.

For session level automatic workflows, set /effort ultracode in Claude Code. This combines xhigh reasoning with automatic dynamic workflow orchestration for every substantive task in the session. One important note Anthropic's documentation makes clear: ultracode requires a model that supports xhigh effort. That currently means Fable 5, Opus 4.8, and Opus 4.7. Sonnet 4.6 and earlier models do not support it.

For API integrations, use the effort parameter directly in the request. The raw chain of thought is never returned for Fable 5 and Mythos 5. The thinking.display setting controls what thinking blocks contain: "summarized" returns a readable summary, "omitted" is the default and returns empty thinking fields.

## The Progress Verification Prompt

This is the single most useful prompt technique in Anthropic's official guide, and it is specific to Fable 5's long autonomous runs.

The problem it solves: on extended multi-step tasks, Fable 5 can sometimes report that a step is complete when it has not been verified against actual execution results. This is the "I did it" problem, and it becomes more likely the longer and more complex the task is.

Anthropic's testing found that one specific instruction nearly eliminates this problem even on tasks explicitly designed to elicit fabricated progress reports. Add this to any long autonomous task prompt:

"Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for. If something is not yet verified, say so explicitly. Report outcomes faithfully: if tests fail, say so with the output. If a step was skipped, state that. When something is done and verified, state it plainly without hedging."

This instruction restructures how Fable 5 treats its own status reports. Instead of summarizing what it believes happened, it cross-references each claim against actual tool execution results before reporting. The word "audit" is doing specific work here. Anthropic tested multiple phrasings and found that audit-language produced more reliable self-checking than softer equivalents.

For any workflow running longer than a few minutes or involving tool execution, this instruction belongs in your system prompt, not just your task prompt.

## The Proactivity Problem and How to Constrain It

Fable 5 is more proactive than Opus 4.8. Noticeably more. In practice, this means it will sometimes take unrequested actions when it infers that an action would be helpful, even if you did not explicitly ask for it.

The examples Anthropic gives in the official guide: drafting an email when none was requested, or creating a defensive git branch backup before making changes. These behaviors are not errors from Fable 5's perspective. They are the model being genuinely helpful based on what it infers you probably want.

The problem is that unrequested actions in production workflows, especially ones that touch external systems, emails, git, or files, can cause real problems. A model that emails a client without being asked or creates unexpected branches in a repository is not a model you can run unattended without explicit guardrails.

The fix is straightforward but needs to be in every system prompt for any automated or unattended workflow:

"When the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Do not apply a fix until asked. Before running a command that changes system state, including restarts, deletes, or config edits, confirm that the evidence actually supports that specific action."

This instruction explicitly defines the boundary between observing and acting, which Fable 5 needs stated clearly rather than inferred. The most important part of this constraint is the second sentence: report findings and stop. Fable 5 needs to know that an assessment is a complete deliverable, not a precursor to immediate action.

## The Memory System Prompt

Fable 5 is particularly powerful when equipped with a persistent memory system that accumulates lessons across sessions. The official guide recommends a specific structure for this.

Each lesson gets its own Markdown file with a one-line summary at the top. The file records what was learned, what was corrected, what approach was confirmed, and why each of those things mattered. Crucially, it only records what the repository or chat history does not already record. Duplicates get merged rather than accumulated. Notes that turn out to be wrong get deleted, not just abandoned.

The practical prompt for establishing this at the start of a long project:

"Maintain a memory system in \[folder\]. Store one lesson per file with a one-line summary at the top. Record corrections and confirmed approaches alike, including why they mattered. Do not save information already in the repo or chat history. Update existing notes rather than creating duplicates. Delete notes that have proven incorrect."

At the end of significant work sessions, close with:

"Reflect on the sessions we have had. Use subagents to identify core themes and lessons, and store them in \[folder\]. Reference \[folder\] at the start of future sessions."

This creates a knowledge base that survives session boundaries, which is the actual mechanism behind Fable 5's ability to maintain coherence across multi-day tasks. Without it, each session starts from zero. With it, the model enters each session already aware of what has been learned, what approaches have been validated, and what to avoid.

## The Final Response Instruction

Long autonomous runs produce a specific failure mode that Anthropic's guide addresses directly. After extended tool use and multi-stage execution, the model accumulates internal context shortcuts that make its final output hard to parse for anyone who was not watching every step.

The problem looks like this: Fable 5 completes a complex multi-stage migration, then summarizes the outcome using internal abbreviations, arrow chains, and shorthand that only make sense if you followed every agent output in real time. The user, who simply wanted to know if the migration succeeded and what to do next, gets a technical dump instead of a clear answer.

The fix is a final response constraint added to any long-running workflow prompt:

"For your final response after this task: state the outcome first, then the key supporting details. Do not include working abbreviations, internal labels, or arrow chains in the user-facing output. Users need the outcome, the evidence, the risks if any, and the next step."

This instruction is not about dumbing down the output. It is about separating the model's internal working process from the response the end user actually receives. The working process should be thorough. The final response should be clean.

## The Sub-Agent Delegation Pattern

Fable 5 can spawn and coordinate its own sub-agents on complex tasks, but the official guide notes that it needs explicit permission and a clear handoff structure to do this well.

The delegation pattern that produces the best results involves three instructions working together. First, tell Fable 5 explicitly when it is allowed to delegate versus when it should handle the task itself. Second, give each sub-agent a specific, bounded scope with explicit success criteria rather than a vague instruction. Third, specify what the coordinating agent should do while sub-agents are running, since Fable 5 can continue working on independent parts of the same task rather than waiting for sub-agents to report back.

A practical pattern for complex research or codebase work:

"Delegate independent subtasks to sub-agents and continue working while they run. Each sub-agent should receive a specific, bounded scope and explicit success criteria. Synthesize sub-agent results only after all have reported. If any sub-agent fails or cannot complete its scope, report that clearly in the synthesis rather than inferring what would have been found."

The most important line is the last one. Fable 5 should not fill in missing sub-agent results with inferences. If a sub-agent fails, that failure is information, and the final synthesis needs to reflect it accurately.

## The Safety Classifier and Fallback

Fable 5 includes safety classifiers that target offensive cybersecurity techniques, biology and life sciences content, and extraction of the model's summarized thinking. When a request triggers these classifiers, the response includes stop\_reason "refusal" as an HTTP 200, not an error.

For API integrations, this means your error handling needs to check stop\_reason separately from HTTP status. A refusal is a successful API call with a specific response type, not a failure. Anthropic provides SDK middleware for automatic fallback to Opus 4.8 on refusals, and prompt-cache costs on refusals where no output was generated are covered.

The practical implication for most builders: refusals affect under five percent of typical developer queries according to Anthropic's testing, but can appear on benign biology or code review tasks that touch sensitive domains. Testing your specific workflows for refusal behavior before deploying to production is recommended, especially if your use case involves any of the flagged domains.

Mythos 5 removes the cybersecurity classifiers while keeping the biology and chemistry ones, and is available only to Project Glasswing partners. For everyone else, Fable 5's behavior on cybersecurity-adjacent tasks will route to Opus 4.8, which handles the same request at Opus pricing rather than Fable pricing.

## Vision Prompting in Fable 5

Fable 5's vision capability is meaningfully upgraded from Opus 4.8, and the official guide dedicates specific guidance to using it effectively.

The headline change: Fable 5 interprets dense technical images, web applications, and detailed screenshots with substantially higher accuracy, often using fewer output tokens than Opus 4.8 on the same task. It is also trained to actively use bash and crop tools when an uploaded image is flipped, blurry, or otherwise noisy, rather than attempting to interpret a degraded input directly.

The practical prompting implication is that you can pass Fable 5 real, raw screenshots from live applications without pre-processing them. Where Opus 4.8 required clean, high-contrast images to extract useful information, Fable 5 handles messier inputs and knows when to crop or reprocess before trying to read the content.

For coding workflows specifically, Fable 5 can use vision to evaluate its own output. The guide notes it is trained to check coding work against an original design or goal using screenshots, meaning you can give it a design mockup and a live screenshot of what it built and ask it to identify the differences. This closes a loop that previously required a human reviewer comparing visual output.

A practical prompt pattern for UI or frontend work:

"Here is the design target and a screenshot of the current implementation. Use vision to identify differences and generate the changes needed to close the gap. Crop and zoom into any areas where the comparison is unclear before reporting findings."

The explicit instruction to crop and zoom is worth including because it unlocks the bash tool behavior that handles noisy inputs. Without it, Fable 5 may attempt to interpret a small or blurry area rather than preprocessing it.

## The Migration Checklist

If you are moving an existing Opus 4.8 workflow to Fable 5, Anthropic's guide is explicit that swapping model names is not a complete migration. The following areas need reviewing before treating a Fable 5 integration as production-ready.

Timeouts. Any timeout set for Opus 4.8 response speed is likely too short for Fable 5 at high effort. Audit every timeout in your stack and extend them before testing.

Refusal handling. Add stop\_reason "refusal" handling to your API response parsing. This is an HTTP 200 with a specific response structure, not an error. Set up fallback to Opus 4.8 for any domain that may trigger the safety classifiers.

Proactivity constraints. Add the explicit constraint on unrequested actions to any system prompt that will run in an automated or unattended context. Do not assume Fable 5 will infer the same boundaries Opus 4.8 operated within.

Progress verification. For any workflow longer than a few minutes or involving tool execution, add the audit instruction to your system prompt before the first production run.

Memory structure. If the workflow will run across multiple sessions, set up the lesson file structure and add the session-close reflection prompt before the first long run.

Final response format. Add the outcome-first response constraint to any workflow that surfaces output directly to end users or into downstream systems that expect clean, structured text.

Testing scope. Before marking the migration complete, test the workflow on at least one task that was genuinely difficult or impossible for Opus 4.8. This is where you will see whether Fable 5 is doing something materially different or producing the same quality at higher cost.

The migration is complete when each of these six areas has been addressed and your hardest workflow runs cleanly from start to finish, without manual intervention, on the first attempt.

That last criterion, first-attempt completion of hard work, is the real benchmark for whether a Fable 5 migration was worth doing. If your most complex workflow now completes in a single autonomous run what previously required multiple sessions and several rounds of human correction, the model is doing what it was built for.

The official guide's practical recommendation for teams new to Fable 5 is to start with the work you have been unable to complete reliably, not the work you have already solved.

Pick a task that previously required multiple sessions and significant human intervention between them. Give Fable 5 the full context, the full goal, and the constraints from this guide, including the progress verification instruction, the proactivity constraint, and the final response format instruction. Run it at xhigh effort. Review what it produces.

The gap between that experience and running the same prompt on Opus 4.8 is where Fable 5's actual value becomes legible. If you see a meaningful difference there, the model is doing what it is designed to do. If the tasks feel the same, you are probably testing in the category where both models perform similarly, which is most routine work, and should move to harder problems.

Fable 5 is not a replacement for Opus 4.8 across all use cases. It is a specialist for the subset of work where sustained autonomy, first-shot correctness on complex tasks, and long-context coherence are the dimensions that matter most.

For everything else, Opus 4.8 is faster, cheaper, and sufficient.

Follow [@cyrilXBT](https://x.com/@cyrilXBT) for more on building with Claude.