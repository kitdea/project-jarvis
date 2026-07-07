---
title: Phase 0 Progress Tracker
type: tracker
source: "n/a — living note, tracks execution of [[Implementation Roadmap]] Phase 0"
---

# Phase 0 Progress Tracker

⬅ Back to [[Project Jarvis - Agentic OS]]

> Tracks real-world execution status against the infra items in [[Implementation Roadmap]] Phase 0, now running on the compressed timeline in [[Accelerated Launch Plan (2-Week Sprint)]] (go-live target 2026-07-15). Update the checkboxes and dates as items move — this note is the "reality" layer on top of the plan.

## Checklist

- [ ] **Submit Google Ads developer-token application** — longest external dependency on the critical path. [[Google Ads API]] / [[Recommendations]] #3 flagged applying "week 1"; [[Caveats]] notes an early-2026 review backlog. *Status as of 2026-07-01: confirmed NOT YET SUBMITTED. Per [[Accelerated Launch Plan (2-Week Sprint)]], submit today — Google Ads is descoped from the day-1 launch and will fast-follow once the token clears.* **Still open as of 2026-07-03** — the Supermetrics connection below is a stopgap for ad hoc reporting, not a substitute for this application; don't let it reduce urgency on submitting.
- [ ] **Provision the VPS** (Hetzner/DigitalOcean) — see [[Layer 1 - Host Infrastructure]]. **ON HOLD as of 2026-07-07** — pending budget/cost approval. Not a provider-choice or sequencing question; provisioning simply doesn't start until approval lands.
- [ ] **Harden the VPS** — non-root user, firewall, Tailscale, disk encryption. *Blocked behind the VPS hold above.*
- [ ] **Install the Claude Agent SDK runtime** — see [[Layer 2 - Agentic Harness]]. *Blocked behind the VPS hold above.*
- [x] **Stand up a private git repo for Skills/knowledge files** — decided **separate** from this vault's repo (`kitdea/project-jarvis`), since Skills/knowledge files are runtime agent assets, not wiki/planning content. Created locally at `~/Documents/project-jarvis-skills` (`skills/`, `knowledge/` dirs) with an initial commit; no GitHub remote yet by choice — push later once ready. See [[Layer 6 - Skills and Knowledge Injection]].
- [ ] **Create a secrets vault** (env vars or managed secrets store — never hardcode credentials). *Interim stopgap, updated 2026-07-07: the CallRail API key now lives in a git-ignored `.env` in the `project-jarvis-skills` repo (moved there from this vault, since that's where the runtime/test code that uses it actually lives) — never committed, single copy. This is dev-machine-only, not the production secrets store this checklist item is ultimately tracking; that still depends on the VPS.*

## Re-verify (per [[Caveats]])
Pricing/rate-limit figures were "current as of mid-2026" — that window is now. Before budgeting, re-check:
- [ ] CallRail tier pricing ([[CallRail v3]])
- [ ] GoHighLevel rate limits ([[GoHighLevel v2]])
- [ ] AccuLynx rate limits + Partner Program status ([[AccuLynx]])

## Log
| Date | Update |
|---|---|
| 2026-07-01 | Note created. No Phase 0 items confirmed started yet — flagged by vault analysis. |
| 2026-07-01 | Go-live target set: 2026-07-15 (2-week sprint). Google Ads token confirmed not yet submitted — descoped from day-1 launch per [[Accelerated Launch Plan (2-Week Sprint)]]; submit today to start the fast-follow clock. |
| 2026-07-03 | Connected Google Ads to this Claude session via Supermetrics MCP (Shumaker Roofing account, ID `8531416360`) — live ad hoc reporting now possible. See [[Google Ads API]] "Interim option" section. Developer-token application status unchanged — still not submitted. |
| 2026-07-05 | Decided Skills/knowledge repo is separate from this vault. Created locally at `~/Documents/project-jarvis-skills`, no remote yet. Remaining Phase 0 items (Google Ads token, VPS provisioning/hardening, Agent SDK install, secrets vault, rate-limit re-verification) are still open — they require real-world accounts/access an AI session can't complete unattended. |
| 2026-07-07 | VPS provisioning put **on hold pending budget/cost approval**. This lands on the Week 1 checkpoint day in [[Accelerated Launch Plan (2-Week Sprint)]], which expected the VPS hardened by today — the Infra workstream hasn't started at all and is now behind schedule, which also blocks the downstream Agent SDK install and secrets-vault items. Go-live target (2026-07-15) is at risk if approval doesn't land soon. |
| 2026-07-07 | Received the CallRail API key. Added `.gitignore` to this vault (it had none) and initially stored the key in a git-ignored `.env` at the vault root — never committed, not pushed to `origin`. |
| 2026-07-07 | Per the "test locally before committing to VPS" decision: moved the CallRail key to `project-jarvis-skills/.env` (git-ignored there too) and added `scripts/test-callrail-auth.sh`, a smoke test hitting `GET /v3/a.json`. **Result: auth succeeded** — confirmed live against the Shumaker Roofing CallRail account (`numeric_id 241552663`). See [[CallRail v3]] "Live account" section. Script is uncommitted in that repo pending your review. |

---
⬅ Back to [[Project Jarvis - Agentic OS]]
