---
title: MOCA Ad Creative Evaluation Framework
type: framework
source: "Search Engine Land, \"How to evaluate Google Ads creative before testing it\", Amy Hebdon, published 2026-07-20 (https://searchengineland.com/evaluate-google-ads-creative-before-testing-482621)"
---

# MOCA Ad Creative Evaluation Framework

⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]

## The core idea
"Let the data decide" lets mediocre ad creative into testing by default, and nobody can explain afterward why an ad won or lost. MOCA is a pre-test quality filter — a way to apply and defend creative judgment *before* an ad enters a Google Ads test, not a replacement for testing itself. A high MOCA score doesn't guarantee a winning ad; it means the ad is worth testing.

## The four pillars
1. **Magnetic** — does the ad qualify the click before the visit happens? Good ads are *selectively* attractive: they attract the right buyer and actively repel the wrong one (an "anti-audience"), since every unqualified click burns budget that's never coming back. Ask: does your target audience want what's offered, and would your anti-audience self-select out before clicking?
2. **Obvious** — could someone with zero context understand the offer instantly, with no decoding? Fails here fall into two patterns: the "mystery ad" (cryptic image/headline, unclear offer) and the "information dump" (too much detail crammed in, still unclear). Note the apparent paradox with Magnetic: an ad can narrow its audience *and* be universally clear — the viewer doesn't need to want the offer, just to instantly recognize what category it belongs to and self-sort accordingly.
3. **Congruent** — does the ad meet the user where they actually are? This is broader than message-match (ad reflects the landing page); the more important half is matching the *offer* to *user intent* — not jumping straight to "buy now" in a top-of-funnel prospecting ad ("don't ask for marriage on the first date").
4. **Actionable** — is it obvious what happens after the click, and is there a reason to act now rather than later? The strongest ads read almost like a single CTA; urgency/exclusivity strengthens this further.

## Practical application
A free scoring matrix exists for this (referenced in the source article) — score each candidate ad against the four pillars before it enters testing. Deliberately does not auto-score creative; the exercise itself is meant to build the evaluator's own creative judgment, not outsource it.

## Relevance to Shumaker Roofing
<<<<<<< HEAD

### First MOCA pass run (2026-08-05)
*(Source: live pull via the Supermetrics MCP connector, Google Ads account `8531416360` — not the Project Jarvis PDF.)*

**Account-level finding before any creative review:** of 25 campaigns on the account, **only one is currently `ENABLED`** — a system-generated Local Services Ads campaign ($342.86/day). Every Search and Performance Max campaign, including all the ones with real headline/description copy, is `PAUSED`. This confirms (per [[Google Ads API]]'s "Local Services Ads folding into Google Ads via Performance Max" section) that Shumaker does run LSAs — previously unconfirmed — and that LSA is presently the *only* live paid-search channel. The MOCA pass below is against the most complete recent paused Search campaign, since that's the real basis for whatever gets reactivated once the developer-token access-level blocker clears.

**Campaign evaluated:** "Search | Forms & Calls | Frederick & Montgomery | 07102025" — 3 ad groups (Repair | Low Competition, Contractors and Cost, Rejuvenation), ~15 headlines / 4 descriptions each.

- **Magnetic — mixed.** Repair ("Stop Leaks Before They Spread," "Emergency Roof Fix Near You") and Rejuvenation ("Don't Replace. Rejuvenate.," "Extend Roof Life, Save $$$") both qualify the click well — someone not wanting a full replacement self-selects into Rejuvenation, someone without an active leak self-selects out of Repair. **Contractors and Cost is weak here** — "Frederick's Top Contractor," "Local Experts. Fast Service" are generic positioning that doesn't distinguish the right buyer from a random visitor.
- **Obvious — the single biggest, most fixable finding.** The *same ~6 generic trust headlines* — "Trusted by Generations," "Your Roof. Done Right First.," "Local Experts. Fast Service," "Protect Your Roof Investment," "Roofing Backed by Warranty," "Trusted 78 Years in Roofing" — are **copy-pasted verbatim across all three ad groups**, regardless of whether the searcher is dealing with a leak, comparing contractors, or considering rejuvenation vs. replacement. That's roughly 40% of the headline inventory per group adding no concrete offer and diluting the otherwise-good group-specific targeting sitting right next to it.
- **Congruent — mostly strong, one real gap.** Repair → books directly to `/appointment-calendar-book-now/`. Rejuvenation → a dedicated `/roof-rejuvenation-in-frederick-md/` page. Both match intent well. **Contractors and Cost → the generic homepage**, the weakest landing match of the three; someone clicking "compare contractors" copy doesn't land on anything contractor-comparison-specific.
- **Actionable — decent but no urgency lever used.** "Get Your Free Inspection" and "Quick Help for Roof Damage" are clear CTAs, but nothing uses time-based urgency a roofing company can credibly claim (storm season, winter prep, spring inspection window) — every CTA is evergreen.

**Two concrete, scoped next actions** (not a full rewrite): (1) replace the ~6 duplicated generic headlines per ad group with group-specific variants, matching the quality bar the other ~9 headlines in each group already hit; (2) give "Contractors and Cost" a dedicated landing page instead of the homepage, matching what Repair and Rejuvenation already have.

**Also worth flagging to whoever owns the Google Ads connector build:** pulling full ad-level detail for a single campaign returned a **573,812-character response** that exceeded this session's tool output limit and had to be redirected to a file and queried with `jq`. This is the same unbounded-payload risk already documented for GHL's `list_opportunities` in [[Project Jarvis/Recommendations.md]] #8 — worth designing the eventual Google Ads MCP connector with the same narrower-default-fields/pagination discipline from the start, not discovering it live in production.

Still not yet paired with [[Marketing/Defending Branded Search from Competitor Google Ads Tactics]] or [[Marketing/Invalid Click Mitigation - Audience Targeting Tactic]] in practice — those remain unactioned.
=======
Not yet actioned — no MOCA pass has been run against Shumaker's current or draft Google Ads creative. Directly usable once [[Google Ads API]] access is live (developer token still pending per [[Phase 0 Progress Tracker]]), but doesn't require API access to start — it's a manual creative-review framework applicable to any ad copy today, independent of the connector-build timeline. Worth pairing with [[Marketing/Defending Branded Search from Competitor Google Ads Tactics]] and [[Marketing/Invalid Click Mitigation - Audience Targeting Tactic]] — both are about *who* sees Shumaker's ads; MOCA is about whether the creative itself, once seen, earns a qualified click.
>>>>>>> f2df9e5cc78ead8298c33df0ec2fcfa420eca855

---
⬅ Back to [[Marketing/Marketing - Overview|Marketing — Overview]] · [[Project Jarvis - Agentic OS]]
