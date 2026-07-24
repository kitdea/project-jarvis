---
title: Action Items
type: tracker
source: "n/a — living note, derived from open blockers in Phase 0 Progress Tracker"
---

# Action Items

⬅ Back to [[Project Jarvis - Agentic OS]]

> Concrete, ownable next-actions blocking the 2026-07-15 go-live ([[GOALS]]). Each item below has a single next-action, not a phase's worth of work — see [[Phase 0 Progress Tracker]] for the full status log and [[Accelerated Launch Plan (2-Week Sprint)]] for the plan these blockers sit inside. Check items off here as they close; the Progress Tracker log is still the place to record what happened.

## Open

### 1. Get VPS budget approved
- **Status:** Blocked — on hold since 2026-07-07, no owner action taken yet. **Deferred by operator instruction (2026-07-22): don't chase or re-flag this — the operator will report back once it's resolved.** Lint/status passes should treat this as intentionally parked, not silently stale, until then.
- **Why it matters:** This is the critical-path item for go-live. It directly blocks three other Phase 0 items: hardening the VPS, installing the Claude Agent SDK runtime, and standing up the production secrets vault (see [[Phase 0 Progress Tracker]]). None of that work can start until this clears.
- **Next action:** Get budget/cost sign-off for a Hetzner or DigitalOcean VPS (~$6–80/mo per [[Layer 1 - Host Infrastructure]]). This is a decision for whoever approves spend at Shumaker Roofing — not something resolvable in this vault. **On hold per operator — no further chasing until they report back.**
- **Deadline pressure:** *(Stale as of 2026-07-22 — the 2026-07-15 target has passed and the "5 remaining days" framing below is no longer accurate. Left unedited pending the operator's update rather than guessing at a new date.)* Every day this sits open eats directly into the 5 remaining days before 2026-07-15. Per the Accelerated Launch Plan, Infra was supposed to be hardened by the end of Week 1 (2026-07-07) — it hasn't started, so the plan is already behind schedule on this item.
- **Done when:** VPS provisioned → unblocks [[Phase 0 Progress Tracker]] items "Harden the VPS," "Install the Claude Agent SDK runtime," and "Create a secrets vault."

### 2. Get a working AccuLynx API key
- **Status:** Blocked — issued key smoke-tested as `401 API Key is invalid or deactivated` on 2026-07-10 against the live [[AccuLynx]] MCP tool layer. GHL and CallRail's equivalent keys both passed the same test the same day, so this is isolated to AccuLynx, not a config or tooling problem on our end.
- **Why it matters:** Blocks any real use of the AccuLynx connector — the Sales sub-agent's pipeline/milestone/financial data source. The combined Marketing+Sales agent can still launch on GoHighLevel + CallRail alone, but Sales-side attribution (job status, milestones, sales-owner data) stays unavailable until this is fixed.
- **Next action:** Contact AccuLynx (via their Contact Us form — [[AccuLynx]] notes there's no real developer support channel) to get the existing key reactivated or reissue a fresh one. Confirm it's generated for the correct company location, since AccuLynx keys are per-location.
- **Deadline pressure:** Lower than the VPS item — go-live can ship without AccuLynx per the "Cut from day 1" descope precedent already set for Google Ads, but full Sales attribution stays incomplete until resolved.
- **Done when:** A fresh/reactivated key smoke-tests successfully via `list_users` or another read endpoint in the AccuLynx MCP tool layer.

## Done
*(none yet)*

---
⬅ Back to [[Project Jarvis - Agentic OS]]
