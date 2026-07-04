---
title: "Layer 1 — Host Infrastructure"
type: layer
source: "Project Jarvis PDF, pp.1-2"
---

# Layer 1 — Host Infrastructure

⬅ Back to [[Project Jarvis - Agentic OS]]

## Options

| Option                               | Strengths                                                                                                                                                                                                                                         | Weaknesses                                                                                                                                                                                     | Verdict                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Cloud VPS (Hetzner/DigitalOcean)** | No hardware dependency; trivial remote access (SSH/CLI/WebSockets); snapshots + instant resize; systemd auto-restart on reboot; DigitalOcean has the largest app marketplace and one-click agent images; ~$6–80/mo                                | No native macOS/iMessage; you manage OS hardening                                                                                                                                              | **Recommended primary host** for a read-only, API-driven marketing/sales/reporting agent that never needs a local GUI |
| **Dedicated Mac Mini (M4)**          | Only path to native iMessage (via BlueBubbles REST bridge) and local screen/browser automation that needs a real WindowServer; unified-memory efficiency for any local LLM fallback; ~$599 once + ~$15/yr power; break-even vs VPS in 8–20 months | CapEx; home-network/ISP single point of failure; macOS updates force reboots; headless requires an HDMI dummy plug to keep WindowServer alive                                                  | Recommended **only if** iMessage or local browser/screen automation is mandatory                                      |
| **Replit (Reserved VM)**             | Fastest to prototype; integrated secrets; "Background worker" deploy type for non-HTTP agents                                                                                                                                                     | Reserved VM is the only tier that is genuinely always-on (Autoscale sleeps; Scheduled Deployments cap at 11h); costs creep with compute/bandwidth; least control over OS-level browser drivers | **Prototype/MVP only**, migrate off for production                                                                    |

## Recommendation
Host the production orchestrator on a **Hetzner or DigitalOcean VPS** (4–8 GB RAM is ample for an API-orchestration agent calling a hosted frontier model). Reserve a Mac Mini exclusively for an iMessage bridge if the principals insist on texting Jarvis from their iPhones — and even then, run the bridge on the Mac while keeping the brain on the VPS, accepting the documented downside of split state across two machines.

## 24/7 reliability checklist (any host)
1. Run the agent under **systemd** (Linux) or **launchd with `KeepAlive:true`** (macOS) for sub-5-second crash restart.
2. Mount **persistent storage** so memory/session state survives reboots.
3. **Disable all sleep.**
4. Use **Tailscale** for zero-config encrypted remote admin.

## Threshold that changes the plan
Move off Replit the moment you need persistent OS-level browser drivers. Introduce the Mac Mini only when iMessage or local screen automation becomes mandatory. See [[Caveats]].

---
Related: [[Layer 5 - Communication Channels]] (iMessage tradeoff), [[Layer 2 - Agentic Harness]]
⬅ Back to [[Project Jarvis - Agentic OS]]
