---
id: 171
year: 2024
doi: 10.3390/s24134383
---

# Ellens S, Carey DL, Gastin PB, Varley MC. Effect of Data-Processing Methods on Acceleration Summary Metrics of GNSS Devices in Elite Australian Football. Sensors. 2024;24:4383. DOI: 10.3390/s24134383

## TLDR
The same GNSS device produced dramatically different acceleration summary metrics depending on how the data were processed — manufacturer software reported up to 184 times less distance and 89 times fewer high-intensity efforts than raw data. These are not small rounding differences; they represent fundamentally different pictures of athlete workload. Any football performance staff using GPS/GNSS wearables must understand which processing pipeline their software uses and must not compare metrics across different software versions or platforms without accounting for this effect. Establishing internal normative data with a consistent processing method is essential.

## Abstract
This study measured differences in commonly used GNSS acceleration summary metrics (number of efforts and distance in medium/high-intensity zones) under three data processing protocols — raw, custom-processed (4th-order Butterworth filter at 2 Hz), and manufacturer-processed — using data from 38 elite Australian Football League players across 14 matches during the 2019 season. Linear mixed models were used to compare the effect of processing method on acceleration and deceleration metrics.

## Methods
38 elite male AFL players from one team were tracked with a 10-Hz GNSS device (Catapult Vector S7) during 14 matches in 2019. Three processing methods were compared: (I) raw (central difference on unsmoothed Doppler-shift speed data), (II) custom-processed (4th-order zero-lag Butterworth filter at 2 Hz cutoff, then central difference), and (III) manufacturer-processed (Catapult Openfield v2.7.1 default settings). Metrics analyzed: number of acceleration/deceleration efforts and distance covered in medium (±2 m/s²) and high (±3 m/s²) intensity zones. Linear mixed models with random effects for player and game were used. Sample size: 262 player files.

## Findings
Manufacturer-processed data had lowest reported distance and efforts; raw data had highest. For high-acceleration zone distance, raw exceeded manufacturer by 1373 m on average (p<0.001); custom exceeded manufacturer by 413 m (p<0.001). For high-acceleration zone efforts, raw reported 89.7x more efforts than manufacturer (p<0.001); custom reported 55.7x more (p<0.001). Raw data exceeded custom processing by 1.61x for high-acceleration efforts (p<0.001). Medium-intensity zone differences were also highly significant across all comparisons (all p<0.001). Within each processing method, medium-zone distance generally exceeded high-zone distance except in raw data.

## Limitations
Data were collected from only one GNSS device type (Catapult Vector S7) and one manufacturer software version (Openfield 2.7.1), limiting generalizability to other devices and platforms. Only one AFL team was studied. The study used GNSS-derived acceleration rather than accelerometer-derived acceleration, which may differ. Future research should include local positioning systems and optical tracking systems to allow cross-system comparison.

## Practical Implications
Football performance staff using GPS/GNSS tracking technology must be aware that processing method profoundly alters acceleration summary metrics. Comparing data across software updates, different devices, or different teams using different platforms is scientifically invalid without accounting for processing differences. Staff should document their processing pipeline, maintain consistency over time, and develop internal normative databases rather than relying on cross-study or cross-platform benchmarks. When selecting thresholds for training load monitoring, practitioners should validate that their chosen method adequately captures the acceleration demands of their specific sport.

## Athlete Development Notes
Acceleration and deceleration metrics derived from GNSS devices are widely used to quantify training load and competition demands in football. However, this study demonstrates that the metric values themselves are artefacts of processing methodology as much as actual player movement. Athlete development staff should build load monitoring systems using a consistent, documented processing pipeline and should educate themselves on whether their device's manufacturer software uses strong smoothing (which dramatically underestimates high-intensity efforts). Custom processing on raw data may provide a more accurate representation of true acceleration demands.

## Return to Play Notes
When tracking an athlete's return to play using GNSS-derived acceleration metrics, any change in device firmware, software version, or processing pipeline will invalidate direct comparisons to pre-injury baselines. RTP protocols that use acceleration load thresholds (e.g., number of high-intensity efforts) must be established and monitored using a consistent processing method throughout the rehabilitation period. Staff should be cautious about setting RTP thresholds based on published literature if the processing methods differ from those used in-house.
