---
title: "Layer 2 — Agentic Harness & Core Framework"
type: layer
source: "Project Jarvis PDF, pp.2-3"
---

# Layer 2 — Agentic Harness & Core Framework

⬅ Back to [[Project Jarvis - Agentic OS]]

## Framework Comparison

| Framework | Persistent memory | Vector/knowledge injection | Inter-agent loops | Fit for Jarvis |
|---|---|---|---|---|
| **Claude Agent SDK** (Claude Code SDK mode) + MCP | Session persistence + resume/forkSession; CLAUDE.md project memory; automatic context compaction | Skills (progressive disclosure) + MCP-exposed vector stores | First-class subagents with isolated context, per-agent tools/permissions, Task tool delegation | **Top pick** — native hub-and-spoke, native MCP, least glue code |
| **LangGraph** | Best-in-class durable checkpointing; resumable graphs; survives process crashes | BYO vector store via LangChain | Explicit cyclic state graph; `interrupt()` for human-in-loop | **Strong runner-up** — choose if you need auditable, deterministic cyclic workflows or model-agnosticism |
| **CrewAI** | Role-based memory + RAG; weaker logging | Built-in RAG | Intuitive role/crew delegation but sequential process model struggles with cycles | Good for rapid prototype; migrate out for complex state |
| **AutoGen** | Conversation history; needs custom persistence | BYO | Conversational/group-chat actor model | Best for agent-debate use cases; overkill here |
| **Hermes Agent** (Nous Research) | Three-layer memory (episodic/semantic/procedural); SQLite FTS5 recall; auto-generates SKILL.md; 20 messaging channels | Markdown memory files + pluggable vector providers (Mem0, Supermemory) | Single-gateway multi-channel; emerging sub-agent support | Compelling for the **channel layer** (natively bridges Slack/iMessage/Telegram with persistent cross-platform memory) but CLI-first, MIT, and its self-improving-memory surface is a prompt-injection risk for a system touching financial data |

## Recommendation
**Claude Agent SDK** as the harness, because the orchestrator→sub-agent topology in [[Layer 3 - Orchestrator Topology]] maps 1:1 onto its subagent model, and every connector in [[Layer 4 - Connectors Overview]] plugs in as an MCP server with a wildcard `allowedTools` scope.

**Trade-off to accept:** the SDK locks you to Claude models and runs by spawning a CLI subprocess (a deployment nuance, not a blocker).

**Fallback:** if model-agnosticism or strict deterministic auditability becomes a hard requirement, switch to **LangGraph**.

**Hermes:** best considered as an optional channel-gateway shell, not the reasoning core — see the warning in [[Caveats]] about its self-improving memory.

## Prompting the model underneath the harness
Choosing Claude Agent SDK as the harness is separate from how the underlying model gets prompted. See [[Fable 5 Prompting Patterns]] for effort calibration, the progress-verification and proactivity-constraint patterns, and the sub-agent delegation pattern — all directly applicable to how the Jarvis orchestrator and its sub-agents should be prompted once this harness gets built.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
