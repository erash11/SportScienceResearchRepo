---
id: 236
year: 2022
doi: 10.1080/24733938.2022.2095006
---

# Hecksteden, A., Schmartz, G. P., Egyptien, Y., aus der Fünten, K., Keller, A., & Meyer, T. (2022). Forecasting football injuries by combining screening, monitoring and machine learning. Science and Medicine in Football. https://doi.org/10.1080/24733938.2022.2095006

## TLDR
Combining periodic fitness screening data with daily monitoring data in a gradient-boosted machine learning model produces better injury forecasting accuracy than monitoring alone in professional football. The model's ROC-AUC of ~0.62 on a holdout test set indicates fair but not clinically sufficient discrimination. Key predictors included pain during the Football Injury Movement Screen (SIMS_pain), match day exposure, and post-RTP vulnerability windows. Prospective external validation is required before practical deployment, but the integration of screening and monitoring data represents a methodologically sound step toward actionable injury risk tools.

## Abstract
Injury risk management in football requires identifying players and circumstances associated with elevated injury likelihood. Prior work has typically applied either screening (time-stable characteristics) or monitoring (volatile daily factors) data separately, limiting predictive scope. This prospective observational cohort study developed and validated a machine learning injury forecasting model integrating both data types in 88 male professional football (soccer) players from 4 German 3rd and 4th division teams during the 2019/2020 season. Gradient boosting with ROSE upsampling within player-level leave-one-out cross-validation was used to predict acute, non-contact, time-loss injuries on a daily basis. The integrated model achieved a cross-validated ROC-AUC of 0.61 and a holdout test set AUC of 0.62, outperforming comparator models using monitoring data alone.

## Methods
Prospective observational cohort study; 88 male professional football players from 4 teams (German 3rd/4th division), 2019/2020 season (June 2019 to March 2020, truncated at COVID-19 shutdown). Data collected: basic player info, periodic screening (endurance capacity, 30m sprint, body composition, SIMS movement screen), daily monitoring (session RPE training load, subjective recovery/stress scale), exposure type (match vs. training), and injury recording per Fuller consensus. Gradient boosting (R) with ROSE upsampling integrated into player-level LOOCV. 11 explanatory variables preselected a priori. Holdout test set = 25% of players, stratified by injury history. Ancillary analyses probed leaky folds, upsampling effects, and round-robin robustness.

## Findings
51 criterion injuries (acute, non-contact, time-loss) in 88 players over the study period. Main model cross-validated ROC-AUC = 0.61 [0.60–0.62]; holdout test set AUC = 0.62 [0.49–0.76]. Comparator models (monitoring only: AUC 0.56 on test set; monitoring + basic info: 0.52 on test set) were inferior, supporting value of integrating screening data. Top predictors: SIMS_pain, match day, post-RTP period, striker position, team-average sessionRPE. Leaky-folds analysis confirmed that ignoring hierarchical data structure inflates cross-validation AUC to 0.88—highlighting a major methodological risk in prior published injury ML models. Approximately 50% of criterion injuries concentrated in the 12.5% of time-points with highest predicted risk.

## Limitations
Small absolute number of criterion injuries (n=51) limits model stability; substantial variability in round-robin repetitions confirms lack of robustness. Single season data from one country's lower professional divisions limits generalizability. COVID-19 truncated the study period. Model miscalibration (overestimation of injury risk) due to upsampling. No prospective temporal validation attempted. Feature engineering and modeling choices must be adapted for each club's specific data collection infrastructure.

## Practical Implications
Integrating periodic fitness screening with daily monitoring data via machine learning offers a methodologically sound framework for injury risk stratification in professional football. Programs already collecting both data types can leverage this approach without additional testing burden. However, current accuracy (~0.62 AUC) is insufficient for high-stakes clinical decisions (e.g., mandatory rest); the model's value lies in flagging elevated-risk periods to prompt clinical conversations, not in replacing human judgment. Prioritizing vigilance during match days, post-RTP windows, and in players with movement screen pain findings is supported by the feature importance results.

## Athlete Development Notes
The framework is relevant for development programs collecting screening and wellness data. Movement screen pain (SIMS_pain) and match day exposure were among the top injury risk signals, suggesting that even in younger developmental players, systematic integration of physical screening with daily load data could improve injury surveillance. Programs should invest in standardized data collection infrastructure to enable future ML-based risk tools as sample sizes accumulate.

## Return to Play Notes
The post-RTP vulnerability window was identified as one of the most important predictors of subsequent injury in this model. Specifically, a 4-week period following return to full availability carried elevated risk. This empirically supports conservative monitoring protocols in the month after RTP, with heightened attention to training load, subjective recovery, and movement quality during this window.
