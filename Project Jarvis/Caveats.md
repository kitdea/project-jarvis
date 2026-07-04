---
title: Caveats
type: summary
source: "Project Jarvis PDF, p.8"
---

# Caveats

⬅ Back to [[Project Jarvis - Agentic OS]]

- **Source quality:** Google Ads, GHL, AccuLynx, CallRail, Slack, Anthropic, and Replit facts are drawn from official/primary documentation (several confirmed verbatim against vendor docs). Framework-comparison and hosting claims (e.g., LangGraph "100M+ runs/month," Mac-vs-VPS break-even ranges, Vapi per-minute pricing) come from vendor blogs and should be treated as **directional, not audited**.
- **Pricing and rate limits drift.** All dollar figures and limits (CallRail tiers, GHL 100/10s, AccuLynx 10/s) were current as of mid-2026; **re-verify against live docs before committing budget**.
- **AccuLynx field-level depth is unverified for Shumaker's specific account.** The endpoint catalog is confirmed public, but actual data exposure depends on Shumaker's AccuLynx plan tier and whether custom workflows are enabled (some milestone/status fields require "custom workflows" turned on). See [[AccuLynx]].
- **The read-only phase intentionally excludes** all operations/production/scheduling per scope; any future write capability (e.g., updating a lead) would require re-running this entire guardrail analysis. See [[Security and Guardrails]].
- **Hermes Agent's self-improving memory** is attractive for the channel layer but its always-accumulating memory is an injection surface; do not let it write business-logic memory unsupervised in a finance-adjacent system. See [[Layer 2 - Agentic Harness]].

---
⬅ Back to [[Project Jarvis - Agentic OS]]
