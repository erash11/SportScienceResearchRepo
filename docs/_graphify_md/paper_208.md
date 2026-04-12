---
id: 208
year: 2025
doi: 10.1109/INFOTEH64129.2025.10959239
---

# Krupić M, Čaušević A, Breščić L, Altoka Z, Bandžović N. Exploratory Data Analysis of NFL Player Performance and Impact of Age on Speed and Acceleration. Proceedings of the 24th International Symposium INFOTEH-JAHORINA. 2025. doi:10.1109/INFOTEH64129.2025.10959239.

## TLDR
Analysis of NFL Next Gen Stats tracking data confirms a general trend of declining speed and acceleration with age, but the relationship is far from linear. Significant individual variability—especially among older players who maintain exceptional physical conditioning—makes age alone a poor predictor of speed and acceleration. The 28–31 age range represents the largest cohort of active NFL players. These findings underscore the need for individualized rather than age-based performance evaluations in professional football.

## Abstract
This study used exploratory data analysis (EDA) to examine the relationship between age and speed and acceleration in NFL players using the NFL Big Data Bowl 2023 dataset (Next Gen Stats tracking data from the first 8 weeks of the 2022 season). Data were preprocessed using Python libraries (pandas, NumPy, seaborn, matplotlib), with player ages extracted and data normalized using mean speed and acceleration values. Two analytical approaches were used: (1) individual age-year grouping and (2) four-year age band grouping (24–27, 28–31, 32–35, 36–39, 40+). Results showed a general decline in speed and acceleration with age, but with notable outliers in older age groups—particularly at age 46, which showed acceleration values exceeding some younger players. The 28–31 age group had the largest player representation. The study concludes that individual variability significantly complicates age-related performance predictions in the NFL.

## Methods
Exploratory data analysis using the NFL Big Data Bowl 2023 dataset (Kaggle), which includes Next Gen Stats tracking data from 12 CSV files covering 8 game weeks of the 2022 NFL season plus games, players, plays, and scouting files. Player age was extracted from date-of-birth data. Weekly tracking files were merged into one dataframe; records with missing player IDs were removed. Mean speed (yards/second) and acceleration (yards/second²) were computed per player and normalized by the mean. Two grouping approaches were compared: single-year age groups and 4-year age bands. Visualizations created using seaborn (violin plots, heatmaps, bar charts) and matplotlib. Python libraries: pandas, NumPy, seaborn, matplotlib.

## Findings
General trend of declining speed and acceleration with increasing age was observed across most age groups. However, significant outliers were present at ages 32 and 46, where acceleration values exceeded those of younger players. The 28–31 age band contained the most active NFL players; the 32–35 band had the fewest, attributed to retirement of non-starters. At age 46, acceleration notably surpassed that of some players aged 32, potentially reflecting superior conditioning and technique rather than raw physical capacity. Four-year age banding reduced outlier influence and provided a cleaner signal of age-related decline.

## Limitations
The dataset is limited to 8 weeks of the 2022 season and represents only players active at that time, introducing survivor bias. Extreme age outliers (e.g., age 46) likely represent only one or very few individuals, distorting group-level statistics. No control for player position, which affects typical speed and acceleration demands. No longitudinal tracking of the same players across years. Normalization used mean values only; distributional characteristics within positions or roles are not examined. Study is descriptive/exploratory with no inferential statistics.

## Practical Implications
Age alone is a poor criterion for evaluating or predicting NFL player speed and acceleration. Individual assessment using tracking data provides a more accurate picture of athletic capability than age-based assumptions. Scouts and performance staff should use Next Gen Stats or equivalent player tracking data to benchmark speed and acceleration against position-specific and age-relative norms, rather than relying on chronological age cutoffs.

## Athlete Development Notes
Player tracking datasets like NFL Next Gen Stats offer powerful tools for monitoring speed and acceleration trajectories across careers. For athlete development purposes, understanding that individual conditioning and technique can maintain or elevate performance metrics into older ages supports long-term investment in physical development. Athletes who reach their mid-to-late career with maintained speed and acceleration likely reflect superior lifestyle habits, recovery practices, and training history.

## Return to Play Notes
While this study does not address injury or RTP directly, the finding that speed and acceleration can be maintained into older ages with proper conditioning has indirect RTP relevance. Post-injury RTP benchmarks for speed and acceleration should be individualized and compared against each athlete's personal baseline tracking data rather than population age norms. The availability of high-resolution tracking data creates opportunities for more objective RTP clearance criteria in professional football.
