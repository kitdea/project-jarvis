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
- [ ] **Provision the VPS** (Hetzner/DigitalOcean) — see [[Layer 1 - Host Infrastructure]].
- [ ] **Harden the VPS** — non-root user, firewall, Tailscale, disk encryption.
- [ ] **Install the Claude Agent SDK runtime** — see [[Layer 2 - Agentic Harness]].
- [ ] **Stand up a private git repo for Skills/knowledge files** (separate from this vault's own repo, or same — decide and note here).
- [ ] **Create a secrets vault** (env vars or managed secrets store — never hardcode credentials).

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

---
⬅ Back to [[Project Jarvis - Agentic OS]]
