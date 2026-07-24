---
title: "Layer 6 — Skills, Vector Stores & Knowledge Injection"
type: layer
source: "Project Jarvis PDF, p.5"
---

# Layer 6 — Skills, Vector Stores & Knowledge Injection

⬅ Back to [[Project Jarvis - Agentic OS]]

## Goal
Sub-agents must never hallucinate business logic (pricing, the definition of a "qualified lead," company terminology).

## Approach
Author business logic as **Markdown "Skills" / knowledge files**, version-controlled in git. One file per concept:
- `qualified-lead-definition.md`
- `pricing-structure.md`
- `glossary.md`
- `kpi-definitions.md` (e.g., exact ROAS/CAC formulas)
- `pipeline-milestone-map.md` (mapping AccuLynx milestones → revenue stages)

## Two-tier retrieval
(mirrors how Hermes and Claude Skills work — see [[Layer 2 - Agentic Harness]])

1. **Always-on core memory** — small, authoritative definitions (what counts as a qualified lead; the canonical KPI formulas) injected into the system prompt at session start so there is zero retrieval latency and zero chance of a miss.
2. **On-demand vector retrieval** — larger corpora (full price books, historical SOPs) embedded into a vector DB (pgvector in the same Postgres, or a dedicated store) and exposed as an MCP retrieval tool the agent queries only when needed.

## Anti-hallucination patterns
1. Inject definitions, never let the model infer them.
2. Require sub-agents to **cite the source file/field** for any business-logic claim.
3. For any metric (ROAS, CAC, "qualified lead count"), the agent must **compute** from retrieved raw figures + the canonical formula file, not estimate.
4. Keep the **"qualified lead" definition identical** across the Marketing agent (CallRail `lead_status`/GHL stage) and Sales agent (AccuLynx milestone) so the two never diverge. See [[Recommendations]] #7.

## Related: general-purpose reliability prompting
The anti-hallucination patterns above are about business-logic claims specifically. See [[Fable 5 Prompting Patterns]] for the equivalent discipline applied to *progress* claims (the "audit each claim against a tool result" pattern) and for a persistent cross-session memory-file pattern that mirrors this vault's own second-brain design.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
