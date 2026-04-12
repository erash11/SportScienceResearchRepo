---
id: 232
year: 2024
doi: 10.1123/ijspp.2024-0077
---

# Schuth, G., Szigeti, G., Dobreff, G., Pašić, A., Gabbett, T., Szilas, A., & Pavlik, G. (2024). Football movement profile-based creatine kinase prediction performs similarly to GPS derived machine learning models in National team soccer players. International Journal of Sports Physiology and Performance. https://doi.org/10.1123/ijspp.2024-0077

## TLDR
Six FMP parameters (standing, walking, medium running, high running, medium dynamic, high dynamic durations) can predict next-day CK with accuracy comparable to GPS and inertial sensor-derived machine learning models in national-team soccer players. Because FMP is based on inertial sensors rather than GPS satellites, it works indoors and in large stadiums and allows live monitoring during training and matches. General population-level models outperform individualized models when large datasets are available.

## Abstract
This study compared GPS/IMA-derived and Football Movement Profile (FMP)-derived machine learning models for predicting next-day creatine kinase (CK) in national-team soccer players, and compared general versus individualized prediction models. A total of 444 national-team male soccer players (U15 to senior) were monitored during 2019–2022 with 10-Hz GPS units, and morning CK was measured from whole blood, yielding 8,570 data points. Machine learning models were built using GPS+IMA, FMP, or combined parameters. The FMP model (R2 = .60, RMSE = 144.6 U/L) performed similarly to GPS (R2 = .62, RMSE = 141.2 U/L) and the combination (R2 = .62, RMSE = 140.3 U/L). General models outperformed individualized models (R2 = .57 vs .37 on average).

## Methods
Observational study (2019–2022) in 444 elite male national-team soccer players (U15 to senior; age 19.2 ± 4.7 years). GPS (10 Hz, Catapult S7/G7) and capillary blood CK (morning fasted, Reflotron Plus and Tascom SimplexTas 101) were collected across 4 training camp schedule types. Machine learning models (linear regression, ridge, lasso, gradient boosting, random forest) were built using GPS+IMA, FMP, or combined parameters to predict absolute next-day CK. Walk-forward cross-validation (6-fold, time-ordered) was used. Individualized models were built for 161 players with ≥20 data points. SHAP values characterized feature importance.

## Findings
FMP-only model: R2 = .60, MAE = 88.2 U/L, RMSE = 144.6 U/L, MAPE = 0.346. GPS-only: R2 = .62, MAE = 85.6 U/L, RMSE = 141.1 U/L. GPS+FMP combined: R2 = .62, MAE = 85.3 U/L, RMSE = 140.3 U/L. Differences between the three input sets were negligible. Actual CK was the top predictor (SHAP). FMP dynamic duration metrics (medium-high, high) were the most important FMP features. General models outperformed individualized models in 73% of cases (R2 .57–.62 vs .37). Players with >70 data points showed improved individual model performance but still did not surpass general model accuracy.

## Limitations
Wide age range (14–33 years) may introduce biological maturity confounds, though most U15 players were post-peak height velocity. CK measurement systems changed mid-study; a correction equation was developed and validated. Individual nutrition between standardized meals could not be fully controlled. Recovery protocols (ice bath, contrast bath) were standardized but may have influenced CK kinetics. Time between last session and morning CK draw could not be precisely controlled.

## Practical Implications
Practitioners can use FMP-based monitoring (6 simple categories) as a practical alternative to GPS for predicting next-day muscle damage when GPS is unavailable (indoors, large stadiums). Live FMP monitoring enables immediate feedback to coaches, allowing real-time load adjustments. General population models with large datasets are more reliable than individualized models for most players, though individualized models may be worth pursuing if >70 matched data points per player are available.

## Athlete Development Notes
FMP-based CK prediction can assist national team staff in managing training load during congested camp schedules across all age groups (U15 to senior). Identifying players at elevated CK risk based on their movement profile enables proactive periodization and reduced injury exposure during developmental national team programs.

## Return to Play Notes
CK prediction models can inform post-match recovery protocols and return-to-train decisions in congested national team schedules. By predicting next-day muscle damage from match or training load data, staff can identify players who may not tolerate full training intensity on subsequent days, supporting structured RTP progressions following muscle damage events.
