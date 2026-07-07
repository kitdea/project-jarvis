---
title: "A Google Ads targeting tactic that cut invalid clicks by 50%"
source: "https://searchengineland.com/google-ads-targeting-tactic-cut-invalid-clicks-481490"
author:
  - "[[John Horn]]"
published: 2026-07-02
created: 2026-07-07
description: "After Google said it had already filtered suspicious activity, this unexpected approach restored campaign profitability."
tags:
  - "clippings"
---
## After Google said it had already filtered suspicious activity, this unexpected approach restored campaign profitability.

Advertisers are estimated to lose [$172 billion](https://fraudblocker.com/wp-content/uploads/2023/09/Ad-Fraud-Whitepaper_Juniper-Research.pdf) a year due to ad fraud by 2028.

The problem is especially common in industries with high competition and CPCs. One of our clients operated in just such an industry, where high invalid click activity was tanking campaign performance.

By adjusting Google Ads targeting, we reduced invalid-click activity by 50% and restored profitable performance.

## Case study: How we cut invalid clicks by 50%

Our client sold book editing and ghostwriting services. The search terms that triggered our ads were relevant and high intent. Yet the traffic wasn’t converting at anywhere near a profitable rate.

We quickly identified signs of click fraud, including:

- Google reporting a 60% to 80% invalid click rate.
- Microsoft Clarity recordings showing bot-like behavior from Google Ads traffic.
- 80%+ click-through rates across numerous search terms, with some exceeding 100%.
- Far fewer sessions in GA4 and other analytics tools than the number of clicks Google Ads reported.

We tried third-party click fraud tools but saw no measurable performance improvement.

Next, we filed an investigation with Google. Google agreed there was suspicious activity but said it had caught it all and hadn’t charged for it.

![Image 11](https://searchengineland.com/wp-content/seloads/2026/07/image-11.png)

We were confident Google wasn’t filtering out all the invalid activity, so we took matters into our own hands.

We added 540 Google-defined audiences set to “Targeting” to our Google Search campaigns.

The invalid click rate immediately dropped by 50%, and the conversion rate increased to profitable levels.

We’ll explain why we tested this approach and why we believe it worked.

First, let’s review what invalid clicks are and the standard ways advertisers combat them.

[

See exactly how your competitors win.

Uncover the keywords, ads, landing pages, and strategies driving your competitors’ paid search success—and find your next opportunity to outperform them.

](https://www.semrush.com/analytics/traffic/paid-search?utm_campaign=ic_sel_0101ppc&utm_source=searchengineland.com&utm_medium=overlay&onboarding=off)

## What click fraud and ‘invalid clicks’ actually are

Google defines [invalid clicks](https://support.google.com/google-ads/answer/42995?hl=en) as:

- “Clicks on ads that aren’t the result of genuine user interest, including intentionally fraudulent traffic and accidental or duplicate clicks.”

This includes [actual fraud](https://searchengineland.com/click-fraud-google-ads-470656) from competitors clicking your ads, as well as accidental double-taps.

Google doesn’t charge advertisers for clicks it deems invalid. Google also credits advertisers for clicks it initially charged for if it later determines those clicks were invalid.

## Why the usual defenses sometimes fall short

Google’s detection system catches a lot of invalid click activity, but as our example shows, it’s not perfect.

Because of this, an entire industry of third-party tools tries to block fraud-prone IP addresses before they cost you.

Unfortunately, fraudsters know how these tools work and often cycle through IP addresses using VPNs to stay one step ahead of the monitoring software.

A tool may identify suspicious activity from an IP address and block that address from seeing Google ads in the future. But if the fraudster uses a new IP address each time, blocking previous addresses does nothing.

These tools are also limited because Google allows a maximum of 500 IP address exclusions per campaign.

---

## The tactic: Add audiences set to ‘Targeting’

We thought about what might distinguish fraudulent traffic from legitimate traffic. What came to mind was Google’s [predefined audiences](https://searchengineland.com/audience-targeting-google-ads-search-campaigns-463000). Google creates hundreds of audiences based on user demographics, search behavior, and browsing behavior.

For example, if you’re researching private jet companies and Rolex watches, Google might classify you as a luxury shopper and place you in that audience.

We hypothesized that fraudsters cycling through IP addresses aren’t always taking the time to build normal-looking online profiles that fit into Google’s predefined audiences.

So we added most of the available audiences to our Search campaigns.

We didn’t limit ourselves to audiences specifically related to the people we were targeting. Instead, we used the audiences as a filter for users who fit Google’s audience signals.

**Important:** We chose the setting “Targeting,” not “Observation.”

When you choose *Targeting*, Google limits your ads to people who trigger your keywords and belong to the selected audiences.

If you choose *Observation*, Google reports how users in those audiences engage with your ads compared with people outside those audiences, but it can still show your ads to anyone who triggers your keywords.

We only recommend this for accounts with high invalid click rates.

There are potential downsides to this approach, such as unintentionally blocking legitimate users who don’t fit within Google’s pre-defined audiences.

## How to test this in your own account

In a Search campaign, select *Audiences > Edit audience segments > Targeting > Browse.* Select the audiences you want to add and click *Save.*

![Image 12](https://searchengineland.com/wp-content/seloads/2026/07/image-12.png)

## Common questions about fighting click fraud

### Will Google refund clicks it identifies as invalid?

If Google identifies a click as invalid when it occurs, you won’t be charged for that click. If Google identifies a click as invalid after the fact, you’ll receive a credit toward future advertising.

### How do I see how many invalid clicks I’m getting?

The “ [Invalid activity credit](https://searchengineland.com/google-spotlights-invalid-click-credits-with-new-ads-help-documentation-479273) ” report in Report Editor in the Google Ads UI provides the most detailed reporting.

- **Invalid clicks:** Clicks you weren’t charged for.
- **Credited clicks:** Clicks you were originally charged for but later credited back.

![Image 10](https://searchengineland.com/wp-content/seloads/2026/07/image-10.png)

You can also add the Invalid clicks and Invalid click rate columns at the campaign level, but not at the ad group or keyword level.

### What’s a normal invalid click rate?

A February [study](https://fraudblocker.com/data/invalid-click-rate-benchmarks-for-google-ads) identified an 11.4% invalid click rate across 43,700 accounts.

Industry matters. While the average invalid click rate for StubGroup’s clients is very similar to the study’s findings, we’ve seen clients in competitive industries with invalid click rates above 40%.

### Should I file an investigation with Google?

If you have reason to believe Google is charging you for invalid clicks, it may be worth filing an investigation [here](https://support.google.com/google-ads/contact/click_quality).

[

Own the conversation before your competitors.

See where your brand appears, where it doesn’t, and exactly how to win more visibility across search, AI, local, social, and every channel that matters.

](https://www.semrush.com/?utm_campaign=ic_sel_0102default&utm_source=searchengineland.com&utm_medium=overlay&onboarding=off)

## Why this approach worked best

Using Google’s predefined audiences as a filter cut this account’s reported invalid click rate in half and blocked activity that Google had claimed it was already catching. That turned failing campaigns into profitable ones.