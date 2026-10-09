# Batches 19-26 review (2026-10-09)

Full-text screening and synthesis of all 96 shortlist candidates. Claude Haiku 5.5 drafted each record from the PDF text (`docs/haiku-calibration/drafting-instructions-v2.md`), and Claude Opus 5.5 then audited every claim against the source text and corrected it in place (`verification-instructions.md`). Every verification note is stored in each screening record's `workflow` field.

| | Count |
|---|---|
| INCLUDE, published as IDs 744-823 | 80 |
| EXCLUDE | 12 |
| DEGRADED (no DOI printed in the PDF) | 4 |
| Corrected by the claim audit | 79 |
| High-priority spot checks | 41 |

Also in this change:
- Corrections to published records 540 (findings contradicted by the paper's Table 6) and 467 (miscounted studies). Both were found by the Haiku calibration judges and confirmed against the source text.
- `build-pilot-shortlist.mjs` and `audit-pilot-shortlist.mjs`: the Athlete Wellbeing title pool is exhausted (6 of 12 candidates), so short domains are now recorded in `domainShortfalls` instead of failing the build. Diversity floors are capped at the signals the remaining pool actually contains (`poolSignalAvailability`). The reservation for underrepresented-population signals rose from 2 to 3 per domain. The next queue has 90 candidates.

## Your calls (judgment-dependent decisions)

- **Q28** (EXCLUDE): Suggestions from the field for return to sports   participation following ACL reconstruction - American Footba. Clinical commentary (level 5). The auditor changed it to EXCLUDE; the record is kept so you can reinstate it as a clinical review.
- **Q50** (INCLUDE, ID 786): Characterizing hydration practices in healthy young recreationally active adults - Is there utility in first m. Hydration validation study in recreationally active adults. The drafter excluded it and the auditor included it, citing consistency with Q53.
- **Q09** (EXCLUDE): Stem cell injections in knee      osteoarthritis- a systematic review of the literature. BJSM review of stem-cell injections in knee osteoarthritis that contains no athlete data. EXCLUDE as out of scope; reinstate if regenerative-injection questions count.
- **Q02** (EXCLUDE): Should I stay or should I go pro - Early NFL draft entry by NCAA FBS underclassmen. Economics of NFL early draft entry. EXCLUDE as out of scope.
- **Q76** (EXCLUDE): TeamWellX - Leveraging genetic algorithms to optimize team health and well-being toward sustainable game devel. Software for building NFL rosters from Madden video-game ratings. EXCLUDE as out of scope.
- **Q85** (INCLUDE, ID 815): Statistical analysis and machine learning in college football - Insights from offensive efficiency, yards per . Team-level analytics book chapter with little athlete relevance. Currently INCLUDE.
- **Q90** (INCLUDE, ID 819): Optimizing NFL Draft Selections with Machine Learning Classification. Machine-learning study of the NFL draft with no health content. Currently INCLUDE under Monitoring & Technology.

## Wrong PDF on disk (EXCLUDE: identity mismatch; the correct paper is needed)

- Q20: Return to match running performance after a hamstring injury in elite football - A single-centre retrospective
- Q70: Determinants of anxiety in elite athletes- a systematic review and meta-analysis
- Q74: Athlete mental health and wellbeing during the transition into elite sport - Strategies to prepare the system
- Q92: Concurrent Validity and Reliability of Sprinting Force–Velocity Profile Assessed With GPS Devices in Elite Ath

## DEGRADED: the DOI is not printed in the PDF (look it up and upgrade)

- Q01: The Role of Speed, Change of Direction, and Momentum by Position and Starting Status in Division 1 Collegiate 
- Q18: Incidence of acute hamstring injuries in soccer - A systematic review of 13 studies involving more than 3800 a
- Q87: Validity of GPS technology to measure maximum velocity sprinting in elite sprinters
- Q93: A Review of the Validity and Reliability of Accelerometer-Based Metrics From Upper Back–Mounted GNSS Player Tr

## High-priority spot checks

Clinically sensitive topics, substantive corrections, or remaining concerns. Check each one against the PDF.

- **ID 749** (Q08, INCLUDE) The test-retest reliability of force plate-derived parameters of the countermovement push-up as a power assess
  - Audit changes: synthesisCaution: 'only peak and mean force were reliable here' was wrong -> flight time, PF, MF and impulse had 'moderate to high reliability (CV = 1.7%-6.9%, ICC = .96-.98)'; only RFD was 'outside acceptable standards'.; findings/practicalImplications: impulse described as reliable by ICC/CV but with SDD 26.1%; vague 'use impulse changes only after larger changes are confirmed' replaced with the
  - Concern: Table 1 values do not reconcile with the stated SEM and SDD formulas (e.g., mean force SEM 1.7 N vs SDD 50.3 N; flight time SDD 0.0), so the SDD percentages may be unreliable; a reviewer should decide whether to cite them.
- **ID -** (Q09, EXCLUDE) Stem cell injections in knee      osteoarthritis- a systematic review of the literature
  - Concern: Borderline relevance call. The review is published in BJSM by sports medicine authors, funded partly by the Dutch National Olympic Committee, and frames knee osteoarthritis as common in retired elite athletes, but every included trial enrolled general knee osteoarthritis patients (mean ages about 38
- **ID 753** (Q13, INCLUDE) Review of media representation of sport concussion and implications for youth sports
  - Audit changes: paper.limitations: added the internal inconsistency ('retirement/retired athlete in 50%' in Discussion vs '9/20 articles' in Results); populations: added Collegiate (a full section summarizes collegiate athlete reporting studies)
  - Concern: Concussion topic. The record relies on secondary citations for all knowledge and reporting percentages; only the 20-article term counts are the authors' own data.
- **ID 754** (Q14, INCLUDE) Targeting Rule Implementation Decreases Neck Injuries in High School Football - A National Injury Surveillance
  - Audit changes: evidenceSummary/paper.abstract: 'other mechanisms unchanged' omitted that unspecified-mechanism injuries (67% of cases) also fell significantly -> added ('Not specified mechanisms ... statistically significant (P=0.002) decrease ... from 3,546 to 2,265'); paper.findings: added the pre-existing decade-long decline (coefficient -0.0121, P=0.0003) and the 2019 rebound; clarified setting split applies
  - Concern: Cervical spine injury surveillance. Study design 'Other' kept for an NEISS before-after surveillance comparison; an operator may prefer Cross-sectional Study. Sex is 98.8% male with 1.2% female, tagged Male Athletes only.
- **ID -** (Q18, DEGRADED) Incidence of acute hamstring injuries in soccer - A systematic review of 13 studies involving more than 3800 a
  - Audit changes: screeningLimitations: referred to a "pooled range" although no pooling was done -> "reported range" ("Quantitative analysis was precluded ... we conducted a descriptive synthesis")
  - Concern: Text is the accepted manuscript with no printed DOI or publication year (copyright line reads ${year}); operator should verify JOSPT DOI and year externally. The Conclusions and Key Points say hamstring injuries were 5% to 13% of all injuries, while Results and Table 3 say 5% to 15%; the record uses
- **ID 760** (Q22, INCLUDE) Early vs delayed lengthening exercises for acute hamstring injury in male athletes - A randomized controlled c
  - Audit changes: practicalImplications: stated early lengthening can be started "without increasing reinjury risk" and should not be expected to shorten return meaningfully -> similar reinjury rates with few events and wide CIs, and a possible benefit not ruled out given underpowering ("OR=0.94, 95% CI 0.18 to 5.0"; "potentially underpowered for a firm conclusion"); limitations: added missing reinjury follow-up ("
  - Concern: Return-to-sport rehabilitation timing paper; reviewer should confirm the softened safety wording matches the authors' claim that early introduction "is as safe as a delayed introduction".
- **ID 761** (Q24, INCLUDE) What is the evidence for and   validity of return to sport testing after ACL reconstruction surgery - A   syst
  - Audit changes: paper.limitations: age range "12 to 59" not the authors' statement -> "age limits typically ranged from 14 to 50 years"; added the knee-injury RR CI inconsistency (Results "RR = 0.28 (95% CI 0.04-0.94), p = 0.09" vs Discussion "from 93% reduction in risk to 21% increase in risk"); paper.tldr: causal "It lowers graft rupture risk" -> "Passing was associated with lower graft rupture risk" (pooled ob
  - Concern: Return-to-play clearance topic. The findings field reproduces the printed knee-injury CI (0.04 to 0.94), which conflicts with p = 0.09 and the Discussion; a reviewer may wish to check the original Fig. 4.
- **ID 763** (Q26, INCLUDE) Return to play after shoulder                                 instability in National Football League         
  - Audit changes: populations: sex tag missing -> added Male Athletes ('if he was drafted to the NFL'); practicalImplications: 'Staff should expect a reduction in games played per season after injury' -> reduction stated as not different from matched controls ('no differences in games, seasons, or Pro Bowl selections after RTP', Table III)
  - Concern: Authors use causal language ('Surgical stabilization ... decreases the chances of a second instability event') for a nonrandomized comparison; the record frames it as an association.
- **ID -** (Q28, EXCLUDE) Suggestions from the field for return to sports   participation following ACL reconstruction - American Footba
  - Audit changes: decision: INCLUDE -> EXCLUDE (b); the article is headed '[ clinical commentary ]', 'LEVEL OF EVIDENCE: Therapy, level 5', with recommendations framed as 'we feel' and 'Based on clinical experience', and no structured evidence review; VERIFY rules state commentaries are not eligible; findings: FMS criterion incomplete -> 'score of 14 or higher, without asymmetries or pain'; added knee function ques
  - Concern: Borderline: the piece reads like a practice-guidance clinical review with 38 references. Operator should confirm whether JOSPT clinical commentaries are treated as excluded commentaries or as eligible clinical reviews.
- **ID 765** (Q29, INCLUDE) Platelet-Poor Plasma for the Treatment of Acute Hamstring Muscle Injuries in Collegiate Football Athletes - A 
  - Audit changes: practicalImplications: 'may consider PPP ... as a candidate treatment, given the short return times' overstated an uncontrolled series -> framed as an early signal that does not justify adoption ('Future high-level, comparative studies are needed'); evidenceSummary: added 34.6 days post-injury and grading method ('29.4 days post-PPP injection and 34.6 days postinjury')
  - Concern: Injection treatment with no control group; check that practical wording stays non-promotional.
- **ID 766** (Q30, INCLUDE) Multiple Concussions Increase Odds   and Rate of Lower Extremity Injury in National Collegiate Athletic   Asso
  - Audit changes: findings: 'the foot was the most common site of excess injury' misdescribed Table 2 (knee and thigh were more common in all groups) -> foot injuries more frequent in the multiple-concussion group ('Foot 23 4 1 .001'); findings: added that 1-year results were similar and 90-day results were not significant, and SC vs NC did not differ (Table 3)
  - Concern: Concussion topic. Group membership depends on sustaining a later concussion, which links group to time in sport; causality cannot be inferred.
- **ID 768** (Q32, INCLUDE) Pain-free vs pain-threshold rehabilitation following acture hamstring strain injury - A randomized controlled 
  - Audit changes: findings/evidenceSummary: 'BFLH fascicle length was greater in the pain-threshold group by 0.91 cm' -> the change from baseline to 2-month follow-up was greater ('The difference in BFLH fascicle length from the initial clinical assessment to 2-month follow-up was significantly greater ... by an average of 0.91 cm'); added no difference at RTP clearance (95% CI -0.29, 0.78); findings: added that 0/
  - Concern: Return-to-play clearance and reinjury topic; three of four reinjuries occurred within 2 months of clearance, and the authors question the clearance criteria.
- **ID 770** (Q34, INCLUDE) MRI findings prior to return to play as predictors of reinjury in professional athletes - A novel decision-mak
  - Audit changes: citation: only 5 authors listed before et al. -> 6 authors per house rule (added Yanguas X); limitations: added that the authors describe it as a pilot study ('In this pilot study of professional athletes')
- **ID 772** (Q36, INCLUDE) Return-to-Play for Elite Athletes With Genetic Heart Diseases Predisposing to Sudden Cardiac Death
  - Audit changes: evidenceSummary/findings: '69 (91%) of those who could return' -> 69 of 76 (91%) of the whole cohort ('69 of 76 (91%) athletes elected to RTP and were supported by their sports organization'); findings: '8 had ICDs placed for secondary prevention and continued to play' and 'Over 200 athlete-years' reworded to what the text reports (24 played with an ICD, 8 secondary prevention)
  - Concern: Clinically sensitive cardiac return-to-play paper. Follow-up duration is internally inconsistent (200 athlete-years vs mean 7 years), so event rates per athlete-year cannot be trusted. Several authors report industry consulting (none involved in the study per the disclosure).
- **ID 773** (Q37, INCLUDE) Heart rate variability in concussed college athletes - Follow-up study and biological sex differences
  - Audit changes: evidenceSummary/methods: 'retested within 72 hours' -> mean 3.5 days, two athletes after more than a month ('the first post-concussion assessment was 3.46 (SD: 2.35) days after'); evidenceSummary/methods: HRV was mandatory only for football and basketball, optional for others ('The HRV test was optional for lower-risk sports athletes')
  - Concern: Concussion paper. Sex-specific HRV findings rest on 1 to 2 girls per time point; the paper's conclusion that HRV disruptions follow concussion is stronger than the null RMSSD, VLF and HF time effects support.
- **ID 774** (Q38, INCLUDE) Short term effects of two different recovery strategies on muscle contractile properties in healthy active men
  - Audit changes: limitations: said results at P = .008 failed the P < .01 threshold -> only P = .015 fails; P = .008 (HWI vs rest at 45 min) meets it ('P values < 0.01 were considered statistically significant'); findings: added comparisons with passive rest (HWI higher only at 45 min, P = .008; CWI lower at 15 min, P = .005)
  - Concern: Analysis treated a 28-person cross-over as 84 independent observations, which may overstate significance.
- **ID 777** (Q41, INCLUDE) Immediate Effects of Overnight Long-Haul Travel on Physical and Cognitive Performance and Sleep in Professiona
  - Audit changes: sports: Mixed / General Sport -> Rugby (professional rugby union players); paper.findings: claimed Part I sleep on first arrival night was still below home -> not significantly different (Table 2: HOME 421, AWAY 1 490 min); added P = .002 for day 1 RSI and P = .017 for mental fatigue
- **ID 783** (Q47, INCLUDE) Counteracting mental fatigue for athletes - A systematic review of the interventions
  - Audit changes: evidenceSummary, paper.findings, tldr: tDCS 'improved in four of its five studies' -> three of five; Moreira et al. found no shooting effect ('p = 0.651') in addition to the 800 m swim null result; paper.limitations: replaced generic notes with the internal discussion/results conflict on tDCS and noted person-fit was a level comparison, not a manipulated intervention
  - Concern: The paper reports 316 participants with 279 female and 37 male, while Table 2 sums to about 335 with a male majority; the record reports both.
- **ID 784** (Q48, INCLUDE) Dry Needling in Sports and Sport Recovery - A Systematic Review with an Evidence Gap Map
  - Audit changes: paper.limitations: removed attribution of the three-database limit to the authors (not in their limitations section); added that tabulated pain changes are mostly within-group pre to post, and that the review reads lower pressure pain thresholds as pain relief; paper.practicalImplications: removed 'delivered by qualified practitioners' (not stated in the review)
  - Concern: The review interprets reduced pressure pain thresholds (e.g., Benito-de-Pedro 2.63 to 1.94; Walsh 4.3 to 10.7% reductions) as pain improvement, and Table 4 labels a 'significant' difference with p > 0.05. A reviewer should confirm how the pain evidence is summarized. Adverse events included syncope 
- **ID 786** (Q50, INCLUDE) Characterizing hydration practices in healthy young recreationally active adults - Is there utility in first m
  - Audit changes: decision: EXCLUDE (c) not relevant -> INCLUDE. The paper is a hydration-monitoring validation study in a sport nutrition journal whose stated purpose is detecting underhydration 'prior to competition/training'; a non-athlete sample limits generalisability but does not make it irrelevant under rule (c), consistent with Q53 (15 non-athlete men) being included; all taxonomy, summary and paper fields:
  - Concern: Relevance call is a judgement: the sample is non-athletes who exercised under 2.5 h/week and the operator may prefer to keep EXCLUDE (c). Key AUC/sensitivity/specificity values for most FMU comparisons are only in Figures 2 and 3, which did not extract; only the >80% statement and +LR 5.9 are quoted
- **ID 787** (Q51, INCLUDE) Role of sports psychology and sports nutrition in return to play from musculoskeletal injuries in professional
  - Audit changes: paper.citation: three authors then et al. -> first six authors then et al., per house rule; journal abbreviated; paper.limitations: 'employed by a sports nutrition company' -> 'employees of the Gatorade Sports Science Institute, a division of PepsiCo' (disclosure statement); added that Figure 1 timelines are 'estimations only based on FC Barcelona data and clinical experience'
  - Concern: Return-to-play framework paper; doses (creatine loading, 5 g fish oil, collagen 15-20 g) are author suggestions, not tested in injured players.
- **ID 794** (Q59, INCLUDE) The paradoxical effect of creatine monohydrate on muscle damage markers - A systematic review and meta-analysi
  - Audit changes: screeningLimitations/limitations: 'Most participants were untrained or recreationally active' was wrong -> Table 1 shows about 13 of 23 studies in trained or athlete samples (e.g. 'M, ironman triathletes', 'Elite rowers', 'M, trained athletes') alongside sedentary and older samples; tldr/practicalImplications: 'reduce markers for a day or two' -> acute reduction was significant only at 48-90 h ('s
  - Concern: Source labels some pairwise comparisons inconsistently; the chronic-training subgroup rests on few studies.
- **ID 795** (Q60, INCLUDE) Dietary inorganic nitrate as an ergogenic aid - An expert consensus derived via the modified Delphi technique
  - Audit changes: practicalImplications: 'Staff should not expect benefit in highly trained athletes above about 60 ml/kg/min' overstated a non-consensus point -> the panel reached no consensus for that group; authors say effects 'appear to be diminished in highly trained individuals'; athleteDev: 'the panel did not support benefit' -> panel reached no consensus; authors judge effects diminished
- **ID 796** (Q61, INCLUDE) Repetitive Head Impacts in Youth    Football- Description and Relationship to White Matter Structure
  - Audit changes: practicalImplications: implied practice contact was riskier -> per-session rates were equal ('1.5 head impacts per game and 1.5 head impacts per practice'); practice share reflects 31 practices vs 7 games; practicalImplications: added caution that the Shockbox high-g share (15.8% at 80 g or more) was far higher than prior youth studies (2.3% and 0.3%)
  - Concern: Youth head-impact imaging study; correlation came from multiple ROIs and impact metrics without reported multiplicity correction.
- **ID 797** (Q62, INCLUDE) Static and Dynamic Cognitive Performance in Youth and Collegiate Athletes With Concussion
  - Audit changes: populations: sex stated (51% and 40% female) -> added Male Athletes and Female Athletes; findings: added that overall accuracy did not differ while walking (Table 2: 90.5% vs 94.4%, P = 0.15) or standing (P = 0.11)
  - Concern: Concussion assessment paper; per-task accuracy differences are borderline and unadjusted across forms.
- **ID 798** (Q63, INCLUDE) Smooth Pursuit Velocity After a Season of Repetitive Head Impacts in American Football Players
  - Audit changes: methods: added that dose groups were assigned after the season by 50th-percentile split ('Players above the 50% percentile in total impacts, PLA, and PAA in each season were considered high-dose'); tldr: 'pre-existing differences are a likely explanation' -> attributed to authors' speculation ('possibly due to prior contact sport history')
  - Concern: Source reports inconsistent mean differences and P values between abstract, Table and Figure 3 caption; head-impact brain-health topic.
- **ID 800** (Q66, INCLUDE) Sleep Architecture Immediately After a Sport-Related Concussion Sustained During a Professional Rugby Union Ma
  - Concern: The journal header labels the article 'BRIEF REVIEW' although the content is a single-player retrospective case study; classified as Case Report / Case Series. Concussion topic.
- **ID 801** (Q67, INCLUDE) Validity of research based on publicly obtained data in sports medicine - A quantitative assessment of concuss
  - Audit changes: paper.rtp and paper.limitations: said diagnostic details were 'rarely' reported -> none were ('No manuscript meeting the inclusion criteria provided any specific detail as to how concussions were diagnosed'); screeningLimitations and paper.limitations: added period mismatch (PODS seasons mostly 2012-2015 compared with NFL annual averages from 2015-2019; 'the average number of concussions per year 
  - Concern: Capture-rate denominators come from a different time window than most included studies; reviewer may want to confirm framing. Concussion topic.
- **ID 802** (Q68, INCLUDE) Does reducing the height of the tackle through law change in elite men's rugby union reduce the incidence of c
  - Audit changes: paper.practicalImplications: garbled claim 'tacklers may be at greater risk when they are concussed under the new rule' -> tacklers had higher concussion incidence and propensity ('in tacklers both concussion incidence and propensity increased significantly'); paper.athleteDev: said the law change altered the number of tackles and game events -> fewer events per game came from lower ball-in-play t
  - Concern: With the two outlier rounds removed the overall concussion RR was 0.92 (0.55 to 1.52); the tackler-specific increase rests on small counts. Concussion topic.
- **ID 803** (Q69, INCLUDE) The importance of language in describing concussions - A qualitative analysis
  - Audit changes: paper.findings: ORs below 1 were described as 'higher odds' for the maximum group without explaining the reference -> stated that maximum severity is the reference and lower ORs mean lower odds in minimum/moderate groups ('with "severe" concussion severity as the default level'); added CIs; paper.practicalImplications: framed brain-language advice as following from an association, not a demonstrat
  - Concern: Most of the 94 participants were coaches, parents and educators rather than athletes, and the sex split applies to all participants; population tags are approximate. Concussion topic.
- **ID 804** (Q71, INCLUDE) Neurocognitive Deficits Associated                        With ADHD in Athletes- A Systematic Review
  - Audit changes: evidenceSummary and paper.findings: 'higher concussion risk' -> more frequent prior concussion history, since the supporting studies were mostly cross-sectional history comparisons and the authors state this 'raises the question of causality'; evidenceSummary: age description corrected to mean about 15 years ('Mean reported age of participants was 15 years (range, 15-19 years)')
  - Concern: Clinically sensitive (concussion testing and stimulant medication). Stimulant evidence is conflicting across four studies; the abstract's 'no evidence' statement differs from Iverson et al reporting higher concussion history with medication.
- **ID 805** (Q72, INCLUDE) Role of advanced neuroimaging,      fluid biomarkers and genetic testing in the assessment of sport-related   
  - Audit changes: paper.findings: implied that all 76 neuroimaging studies reported significant effects -> significant effects were shown by each modality, with varying directions and some null results ('opposite patterns or null results have been reported'); added modality counts and non-discriminating biomarkers; populations: added Male Athletes and Female Athletes (included studies list M and M/F samples)
  - Concern: Clinically sensitive (concussion diagnosis and return to play). Evidence is current only to December 2016.
- **ID 807** (Q75, INCLUDE) Reciprocal relationships between sleep quality, mental health and the quality of life in elite athletes - A pi
  - Audit changes: paper.practicalImplications: listed 'evening caffeine' and 'screen use in bed' as linked habits, but the survey measured daily caffeine/soda counts and total daily screen minutes -> soda intake, later bedtimes and longer daily screen time ("screen duration: t = 1.98, ß = 0.14"; "soda beverages: t = 2.37, ß = 0.17"); paper.limitations: 'mostly Tunisian' -> entirely Tunisian sample; heat effect attr
  - Concern: Internal inconsistencies in the source: data were collected in September 2022 but the ethics approval is dated 01/03/2024; the Results text says 60% had SOL of 30 min or longer while Table 1 shows 16.1%; mean age 20.1 +/- 0.64 years is implausible for a range of 18 to 37.
- **ID 810** (Q79, INCLUDE) Mental health in elite athletes - A systematic review of suicidal behavior as compared to the general populati
  - Audit changes: paper.tldr/findings: presented male sex, non-white race and older age as consistent risk factors -> noted mixed results (Fig. 2; race: "three found no significant difference between races and two found white athletes to have reduced" rates; age: one study younger, two older, one age 30-50); paper.practicalImplications: flagged-factor list now caveated as resting on few or conflicting studies; inju
  - Concern: Clinically sensitive topic (suicide). The source's abstract lists 'athletic level' both as a risk factor to watch and as showing limited effect; the record reflects the body text.
- **ID 812** (Q82, INCLUDE) Management of mental health emergencies in elite athletes- a narrative review
  - Audit changes: evidenceSummary/methods: 'IOC consensus meeting input' as a method was not stated -> methods describe supplementary search by all authors plus non-sporting literature; IOC meeting appears only in acknowledgements; limitations: 'unpublished service records reported in a single sentence' -> 'unpublished IOC/Cognacity data'
  - Concern: Clinically sensitive (suicidality, pharmacological sedation). Medication content is guideline extrapolation, not sport evidence; the record correctly avoids naming drug doses.
- **ID 816** (Q86, INCLUDE) Is extensive cardiopulmonary screening useful in athletes with previous asymptomatic or mild SARS-CoV-2 infect
  - Audit changes: findings: said FVC, FEV1, PEF, MVV 'and their percentages' all fell significantly -> FVC percent predicted was not significant (Table 4, p = 0.18); evidenceSummary: 'only significant change was a fall in spirometry' omitted the significant rise in resting HR (53 to 65 bpm, p < 0.05)
  - Concern: Clinically sensitive cardiac return-to-training content from one small cohort of male professional soccer players; recommendations (CMR, rest until troponin normalises) are author opinion based on a single case.
- **ID -** (Q87, DEGRADED) Validity of GPS technology to measure maximum velocity sprinting in elite sprinters
  - Audit changes: screeningLimitations/limitations: claimed the bias sign was 'opposite to the stated overestimation' -> sign is consistent with radar minus GPS (raw: radar 11.81 vs GPS 10.41 gives +1.40; GAM: radar 10.22 vs GPS 10.33 gives -0.11); limitations: added that the column labelled '95% LOA' reports bias with 95% CI, not true limits of agreement (Table 1)
  - Concern: DOI not printed in the text; operator should verify externally before upgrading from DEGRADED.
- **ID 817** (Q88, INCLUDE) On the predictive validity of the National Football League combine - Does it forecast future success
  - Audit changes: evidenceSummary/tldr/practicalImplications: ACL reconstruction stated as linked to shorter careers -> career-length study found 'isolated ACL reconstruction did not reduce a player's mean length of career', while meniscectomy and combined surgery did; other ACL studies linked it to worse draft pick, fewer games and lower snap percentage; rtp: added the Keller vs Provencher conflict ('no signs of d
  - Concern: Section 3.5.3 and section 3.6.4 of the review describe ACL effects on career length inconsistently; staff should read the primary studies before using injury history in decisions.
- **ID 818** (Q89, INCLUDE) Predicting severity of head collision events in elite soccer using preinjury data - A machine learning approac
  - Audit changes: tldr: implied head-to-head contact was linked to severity overall -> head-to-head plus knee-to-head was significant only in the male dataset ('not significant in the mixed dataset (P = 0.1113)'); methods: 'Two trained reviewers coded' -> 12 trained reviewers, two independently analyzing each match ('collected by 12 trained independent reviewers... Two reviewers independently analyzed match footage
  - Concern: Concussion-related paper; severity is a video-sign proxy, not diagnosis. Practical fields correctly avoid presenting the model as a screening tool.
- **ID 820** (Q91, INCLUDE) Prospective validation of 2B-Cool - Integrating wearables and individualized predictive analytics to reduce he
  - Audit changes: findings: horizon reported as abstract's 35 min -> results value 36 min ('effective prediction horizon of 36 min'); added that specificity (81%, 77%) and 39.20 C sensitivity (87%) missed the preset criterion ('we set the acceptance criteria for sensitivity and specificity to >90%'); limitations/screeningLimitations: added authors' caveat on stop-and-go sport ('it is not clear how the system would 
  - Concern: Heat illness monitoring is clinically sensitive; sample is fit young adults in a military-style protocol, and population tag 'Healthy Athletes' is approximate.
- **ID 822** (Q95, INCLUDE) Measurement properties of upper extremity physical performance tests in athletes - A systematic review
  - Audit changes: synthesisCaution: 'the review finds only reliability evidence' for CKCUEST and shot-put -> CKCUEST validity insufficient (r = 0.55 to 0.59) and shot-put validity sufficient but low quality ('strong and positive correlations (r = 0.73 to 0.83)... QoE was low'); findings: added CKCUEST insufficient validity and shot-put sufficient validity results from Table 3
