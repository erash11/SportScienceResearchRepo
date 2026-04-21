---
id: 237
year: 2025
doi: 10.1038/s41598-025-85993-1
---

# Nguyen, Q., Jiang, R., Ellingwood, M., & Yurko, R. (2025). Fractional tackles: leveraging player tracking data for within-play tackling evaluation in American football. Scientific Reports, 15, 2148. https://doi.org/10.1038/s41598-025-85993-1

## TLDR
Fractional tackles is a new, data-driven defensive metric derived from NFL player tracking data that overcomes the binary limitations of traditional tackle counts. By measuring how much each defender contributes to slowing the ball-carrier's forward velocity during contact, the metric credits defenders who are not officially recorded as tacklers—especially defensive linemen who consistently disrupt plays but rarely receive statistical recognition. The metric shows strong correlation with traditional tackles (r=0.93) but greater stability across time and more measurable information for players without conventional box-score statistics.

## Abstract
Traditional tackling statistics in American football (solo tackles, assists, combined tackles) are discrete, manually recorded outcomes that undercount defensive contributions—particularly for linemen—and overstate the contributions credited to a single tackler. Using NFL Next Gen Stats player tracking data from the 2024 Big Data Bowl (weeks 1-9 of the 2022 NFL season, 5,539 run plays by running backs), this paper introduces fractional tackles: a continuous, model-free metric that credits defenders for slowing the ball-carrier's forward motion toward the end zone during contact windows within a play. The metric identifies contact windows (consecutive frames where a defender is within 1.5 yards of the ball-carrier), assigns a value to each window based on velocity reduction, and distributes credit across all involved defenders proportionally by frame and player count.

## Methods
NFL Big Data Bowl 2024 tracking data used (10 Hz, 22 players + ball tracked per play); 5,539 run plays by running backs from weeks 1-9 of the 2022 NFL regular season. Contact windows defined as consecutive frames where a defender is within 1.5 yards of the ball-carrier (threshold covering ~95% of tackle distances in the data). Contact window value = (starting velocity - ending velocity) / peak pre-contact velocity, with adjustments for post-contact velocity recovery. Window value distributed equally across frames; frame value distributed equally across defenders in contact. Fractional tackles summed per defender per window and aggregated across plays. Stability assessed by correlating first-4-week vs. last-5-week totals. Compared to traditional combined tackles (total tackles + assists/2).

## Findings
7,453 contact windows identified across 5,539 plays; average window length 1.28 seconds. Top fractional tackles leaders were dominated by linebackers (ILBs, OLBs) but defensive linemen showed notably higher average fractional tackles per play than their traditional tackle counts suggest. Fractional tackles correlated strongly with traditional combined tackles (r=0.93, 95% CI: 0.92–0.94) but were systematically lower, indicating conventional statistics overstate single-defender credit. Fractional tackles demonstrated greater stability (predictability of future from past performance) than combined tackles: overall r=0.69 vs. 0.59 across the season, with especially stronger within-position stability for linebackers (0.73 vs. 0.64). The metric credits 19,691 unique players across the study period, more than double the 7,720 with at least one recorded tackle.

## Limitations
Analysis limited to run plays by running backs (weeks 1-9 of one season), limiting generalizability to pass plays, other ball-carrier types, and full seasons. Contact windows are empirically defined from 2D tracking data; true physical contact cannot be confirmed without pose estimation. Credit attribution assumes equal distribution across defenders per frame, which simplifies actual contribution weighting. Ball-carrier velocity recovery between windows not fully credited to subsequent defenders. Framework is player-agnostic in contact window definition and does not account for player-specific traits (e.g., arm length) that affect contact radius.

## Practical Implications
Fractional tackles provides coaching and analytics staffs with a more granular, objective view of defensive contribution than traditional tackle counts. Defensive linemen—a position group historically underserved by box-score statistics—can now be evaluated on measurable stopping contribution per play. The metric can inform game planning (identifying defenders most effective at halting specific ball-carriers), contract negotiations, and draft evaluation. Because it is model-free and derived from publicly available tracking data, it can be implemented in any data pipeline with access to player positioning.

## Athlete Development Notes
For developing defensive players, fractional tackles offers a more informative feedback loop than binary tackle/no-tackle designations. Linemen and interior defenders who routinely reduce ball-carrier momentum but are not credited with official tackles can have their contributions quantified, supporting more accurate development assessments and reducing positional evaluation bias toward high-tackle-count positions like linebackers and safeties.

## Return to Play Notes
Not directly applicable to return-to-play contexts. However, the framework's ability to quantify within-play physical engagement could theoretically be adapted to monitor a returning player's on-field contribution and physical activity levels during gradual reintegration, providing objective data on participation intensity beyond simple snap count or playing time metrics.
