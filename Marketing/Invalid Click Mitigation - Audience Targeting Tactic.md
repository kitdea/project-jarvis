---
title: Invalid Click Mitigation - Audience Targeting Tactic
type: tactic
source: "Search Engine Land, \"A Google Ads targeting tactic that cut invalid clicks by 50%\", John Horn, published 2026-07-02 (https://searchengineland.com/google-ads-targeting-tactic-cut-invalid-clicks-481490)"
---

# Invalid Click Mitigation - Audience Targeting Tactic

⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]] · See also [[Marketing/CallRail Call Audit (June 2026)|CallRail Call Audit (June 2026)]] · [[Google Ads API]]

## The tactic
Add most/all of Google's predefined audiences to a Search campaign, set to **"Targeting"** (not "Observation"). Targeting restricts ads to users who both trigger the keyword *and* fall into a selected audience; Observation only reports on audience behavior without restricting delivery.

**Why it works:** fraudulent/bot traffic cycling through IPs and VPNs typically doesn't build the kind of normal browsing history that lands a user in Google's demographic/interest audiences. Filtering on "belongs to any real-person-shaped audience" screens out a lot of that traffic even though it doesn't target any audience specifically.

**Case study result:** one advertiser (competitive/high-CPC industry) cut invalid-click rate by 50% and restored campaign profitability, after Google's own fraud filtering and third-party click-fraud tools (IP blocklists) both failed to fix it.

## Why the usual defenses fall short
- Google's own invalid-click detection catches a lot, but not everything — advertiser filed an investigation and Google confirmed some invalid activity but said it had already filtered/credited for it, while the advertiser's own data (60-80% invalid click rate reported, bot-like session recordings, GA4 session counts far below Ads click counts) suggested otherwise.
- Third-party IP-blocklist tools are defeated by fraudsters rotating IPs/VPNs, and Google caps IP exclusions at 500 per campaign anyway.

## Caveats
- Only recommended for accounts with an already-high invalid click rate — indiscriminately restricting to predefined audiences risks excluding legitimate users who don't fit Google's audience signals.
- Benchmark: ~11.4% average invalid click rate across 43,700 accounts (Feb 2026 study); competitive industries can run 40%+.

## Relevance to Shumaker Roofing
Roofing is a high-CPC, locally competitive service vertical — exactly the profile this tactic targets. Currently moot: Google Ads is descoped from day-1 Jarvis launch pending the developer token (see [[Phase 0 Progress Tracker]]), but worth applying to the Shumaker Roofing Google Ads account directly (via the Google Ads UI, independent of the Jarvis connector) once/if invalid-click rates look high — check via the "Invalid activity credit" report in Report Editor.

---
⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]
