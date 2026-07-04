---
title: Security & Guardrail Protocol
type: security
source: "Project Jarvis PDF, pp.6-7"
---

# Security & Guardrail Protocol

⬅ Back to [[Project Jarvis - Agentic OS]]

## Enforcing read-only (defense in depth — never rely on the prompt alone)
1. **Database layer:** dedicated Postgres role with only `GRANT SELECT`; no `INSERT`/`UPDATE`/`DELETE`/`DDL`; point at a read replica; set `statement_timeout` and a row-limit; consider query rewriting to restrict accessible tables/columns. See [[PostgreSQL Reporting]].
2. **Tool layer:** MCP servers for AccuLynx/GHL/Google Ads/CallRail implement only GET/read tools — write endpoints are simply never coded, so the model cannot call them regardless of what it "decides." Use the SDK `allowedTools` allowlist (e.g., `mcp__acculynx__get_*`) rather than broad permissions; prefer explicit allowlists over `bypassPermissions`.
3. **Prompt layer:** system-prompt instruction that the agent is strictly analytical/read-only, reinforced by an LLM-as-judge or deterministic input screen.

## Credential masking & secrets
- Store all keys/tokens in a secrets vault or env vars injected at runtime; never in the repo or in CLAUDE.md. Add `.env` to `.gitignore`.
- Each MCP server owns exactly one platform's credential; the orchestrator holds none. This limits blast radius if any single sub-agent context is compromised. See [[Layer 3 - Orchestrator Topology]].
- Rotate OAuth refresh tokens; handle Google Ads / GHL 24-hour access-token expiry automatically; store the AccuLynx per-location keys encrypted at rest.
- Never echo credentials or full DB connection strings into model context or logs.

## Preventing prompt injection from corrupting API payloads
- **Separate control from data:** treat all retrieved content (call transcripts, CRM notes, lead names) as untrusted data, never as instructions. Structured/parameterized tool calls (analogous to SQL prepared statements) keep model-generated query parameters from being interpreted as commands.
- **Input screening + output validation:** validate/normalize user input (length, encoding) before it reaches the orchestrator; validate every model-proposed tool argument against a schema before execution. Published research on MCP-schema "contract" engines reports blocking ~98% of unsafe queries (e.g., write attempts in a read-only context) at ~8–13 ms overhead per tool call — negligible against LLM generation time.
- **Defense in depth:** assume injection will eventually succeed and rely on least-privilege tool scopes and read-only roles to bound the damage — a compromised read-only agent can only read non-destructive data. Optionally layer a guardrail model (Llama Guard / NeMo Guardrails), remembering the guardrail LLM is itself injectable and is one layer, not the whole defense.
- **Audit everything:** log every tool call (who/what/when/which params) for after-the-fact review.

---
⬅ Back to [[Project Jarvis - Agentic OS]]
