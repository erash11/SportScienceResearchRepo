---
id: 265
year: 2023
doi: 10.1080/00031305.2023.2242442
---

# Nguyen Q, Yurko R, Matthews GJ. Here Comes the STRAIN: Analyzing Defensive Pass Rush in American Football with Player Tracking Data. The American Statistician. 2023. DOI: 10.1080/00031305.2023.2242442

## TLDR
STRAIN is a tracking-data metric that quantifies how much pressure a defensive pass rusher is exerting at every moment of a play, based on how fast they are closing in on the quarterback relative to their current distance. It is more stable and more predictive of future pressure events than traditional box-score statistics (sacks, hits, hurries). Edge rushers generate more STRAIN than interior linemen. Top-ranked players by STRAIN (e.g., Myles Garrett, T.J. Watt, Aaron Donald) align closely with expert rankings, validating the metric.

## Abstract
This paper introduces STRAIN, a novel continuous-time metric for evaluating NFL defensive pass rushers using Next Gen Stats player tracking data. Inspired by the concept of strain rate in materials science, STRAIN is computed as the negative velocity of a pass rusher toward the quarterback divided by their current distance from the quarterback. Applied to the first eight weeks of the 2021 NFL regular season (8,557 passing plays, 122 games), the metric provides a continuous measure of defensive pressure on every frame of every play. A multilevel model controls for pass rusher position, blocking matchup, defensive team, offensive team, and play context to estimate each pass rusher's individual contribution.

## Methods
Player tracking data from the NFL Big Data Bowl 2023 (Next Gen Stats, 10 Hz RFID): 8,557 passing plays across the first 8 weeks of the 2021 NFL regular season. STRAIN defined as −v(t)/s(t), where s(t) = distance between pass rusher and QB at frame t, and v(t) = rate of change of that distance. Average STRAIN computed across all frames per play and per player. A multilevel model (lme4, R) included random intercepts for individual pass rushers, pass blockers, defensive teams, and offensive teams, plus fixed effects for number of blockers, yards to go, current down, current yardline, pass rusher position, and blocker position. Bootstrapping (resampling drives) provided uncertainty estimates for random effects. Data from Pro Football Focus (PFF) used to identify pass rush roles and blocking matchups.

## Findings
STRAIN correlates moderately with pressure rate (r = 0.6255) over the 8-game sample. STRAIN from the first 4 weeks predicts pressure rate in the last 4 weeks more strongly (r = 0.3217) than prior pressure rate itself (r = 0.0965). Week-to-week stability is high (r = 0.8545 across the 8-week window). Edge rushers (OLBs and DEs) generate substantially more STRAIN than interior rushers (DTs and NTs). Players tend to generate higher STRAIN on plays ending in sacks > hits > hurries > no outcome. The multilevel model shows STRAIN decreases by 0.7366 per additional blocker. Pass rusher explains the most variance of any grouping factor (ICC = 0.0365), followed by offensive team (0.0143), defensive team (0.0098), and blocker (0.0134). Top-ranked pass rushers: DE — Myles Garrett; OLB — T.J. Watt; DT — Aaron Donald; NT — Vita Vea.

## Limitations
Model accounts only for the nearest blocker, not all blockers simultaneously. Nested structure enforces positive dependence between pass rushers on the same team, which may inflate some rankings (e.g., Takkarist McKinley benefiting from playing alongside Myles Garrett). Study period limited to 8 weeks of one NFL season. Temporal modeling of full STRAIN trajectories not yet implemented. Offensive pass blockers not individually evaluated.

## Practical Implications
STRAIN provides a richer, continuous evaluation of pass rusher effectiveness than sacks or pressures alone, enabling coaching staffs to identify high-impact players even on plays that don't end in recorded outcomes. The metric can be visualized in real time for in-game adjustments and is a more reliable predictor of future performance than traditional statistics. Defensive coordinators can use STRAIN to optimize pass rush rotations and identify which matchups generate the most pressure.

## Athlete Development Notes
Provides a quantitative framework for evaluating defensive linemen and linebackers on passing plays beyond traditional box-score outcomes. Edge rushers consistently generate more STRAIN than interior players, which has implications for position-specific training priorities. STRAIN-based player development can target closing speed and pursuit angles to the quarterback as key physical performance qualities for pass rushers.

## Return to Play Notes
Not directly applicable to return-to-play contexts. However, STRAIN could theoretically be used post-injury to assess whether a returning pass rusher is generating pressure at pre-injury levels, serving as a performance-based functional benchmark before full competitive clearance.
