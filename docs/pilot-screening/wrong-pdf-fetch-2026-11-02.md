# Wrong-PDF fetch, 2026-11-02

Eric approved the replacement of the wrong PDFs in `docs/needs-eric.md` section 1. Open-access sources only (Unpaywall, Europe PMC, PMC open-data bucket). Each download was checked: `%PDF` header and the filename's title found in the first 3 pages via `pdftotext`. Old files moved (not deleted) to `SourcePapers/_wrong_2026-11-02/`. `prepare.py` and screening were not run.

Result: 14 of 24 replaced, 10 still need Eric.

## Files

| Filename | DOI | Source URL | Replaced | Reason if no |
|---|---|---|---|---|
| Metabolic power in team and racquet sports - A systematic review with best-evidence synthesis.pdf | 10.1186/s40798-022-00525-9 | https://pmc-oa-opendata.s3.amazonaws.com/PMC9596658.1/PMC9596658.1.pdf | yes | |
| A randomized trial of healthy weight gain in athletic individuals.pdf | 10.1249/mss.0000000000003427 | none usable | no | No OA copy (Unpaywall none, not in Europe PMC); MSSE paywalled |
| The relationship between isometric and dynamic strength following resistance training - A systematic review, meta-analysis, and level of agreement.pdf | 10.1123/ijspp.2023-0066 | none usable | no | Unpaywall lists journals.humankinetics.com (returns non-PDF to curl) and ro.ecu.edu.au repository page (no direct file link found) |
| Vibration therapy - A clinical commentary.pdf | 10.26603/001c.36964 | https://pmc-oa-opendata.s3.amazonaws.com/PMC9528696.1/PMC9528696.1.pdf | yes | |
| Clinical outcome following concussion among college athletes with a history of prior concussion - A systematic review.pdf | 10.1186/s40798-022-00528-6 | https://pmc-oa-opendata.s3.amazonaws.com/PMC9617993.1/PMC9617993.1.pdf | yes | |
| Short-term change on physical capacities of football players within few days before ACL-injury - A retrospective case-control study.pdf | 10.1186/s13102-025-01518-3 | https://pmc-oa-opendata.s3.amazonaws.com/PMC12874991.1/PMC12874991.1.pdf | yes | |
| High Rate of Return to Sport for Athletes Undergoing Articular Cartilage Restoration Procedures for the Knee - A Systematic Review of Contemporary Studies.pdf | 10.1177/03635465241280975 | none usable | no | No OA copy (AJSM, paywalled) |
| Return to match running performance after a hamstring injury in elite football - A single-centre retrospective cohort study.pdf | 10.1136/bmjsem-2021-001240 | https://pmc-oa-opendata.s3.amazonaws.com/PMC8883270.1/PMC8883270.1.pdf | yes | |
| Determinants of anxiety in elite athletes- a systematic review and meta-analysis.pdf | 10.1136/bjsports-2019-100620 | https://pmc-oa-opendata.s3.amazonaws.com/PMC6579501.1/PMC6579501.1.pdf | yes | |
| Athlete mental health and wellbeing during the transition into elite sport - Strategies to prepare the system.pdf | 10.1186/s40798-024-00690-z | https://pmc-oa-opendata.s3.amazonaws.com/PMC10924853.1/PMC10924853.1.pdf | yes | |
| Concurrent Validity and Reliability of Sprinting Force–Velocity Profile Assessed With GPS Devices in Elite Athletes.pdf | 10.1123/ijspp.2021-0339 | none usable | no | Only OA copy is HAL (insep.hal.science), which serves a bot check to curl; browser download by hand |
| Does Mathematical Coupling Matter   to the Acute to Chronic Workload Ratio- A Case Study From Elite Sport.pdf | 10.1123/ijspp.2018-0874 | none usable | no | No OA copy (IJSPP, paywalled) |
| Dynamic loading assessment at the fifth metatarsal in elite athletes with a history of Jones fracture.pdf | 10.1177/2325967116s00123 | https://pmc-oa-opendata.s3.amazonaws.com/PMC4968287.1/PMC4968287.1.pdf | yes | |
| Early Warning of Suspected Doping   from Biological Passport Based on Multivariate Trends.pdf | 10.1055/a-1019-7774 | none usable | no | No OA copy (Thieme, paywalled) |
| Higher cardiovascular risk factor burden associated with cumulative concussion history and age-related differences.pdf | 10.1097/htr.0000000000001140 | https://pmc-oa-opendata.s3.amazonaws.com/PMC13334483.2/PMC13334483.2.pdf | yes | |
| Integrated performance support- facilitating effective and collaborative performance teams.pdf | 10.1136/bjsports-2017-097646 | none usable | no | No OA copy (BJSM 2018, paywalled) |
| Muscle activation differences during eccentric hamstring exercises.pdf | 10.1177/1941738120938649 | none usable | no | PMC8167351 is an author manuscript outside the PMC open-data bucket; PMC and Europe PMC render block curl; browser download by hand |
| Potential health risks of foodborne performance-enhancing drugs in competitive sports.pdf | 10.1016/j.heliyon.2023.e21104 | https://pmc-oa-opendata.s3.amazonaws.com/PMC10616320.1/PMC10616320.1.pdf | yes | |
| Predicting noncontact injuries of professional football players using machine learning.pdf | 10.1371/journal.pone.0315481 | https://pmc-oa-opendata.s3.amazonaws.com/PMC11694968.1/PMC11694968.1.pdf | yes | |
| Quadriceps Morphology 6- to 60-Months After Anterior Cruciate Ligament Tear.pdf | 10.1111/sms.70109 | https://pmc-oa-opendata.s3.amazonaws.com/PMC12275009.1/PMC12275009.1.pdf | yes | |
| Single leg power output and between      limbs imbalances in team sport players - Unilateral vs bilateral   combined    resistance training.pdf | 10.1123/ijspp.2015-0743 | none usable | no | No OA copy (IJSPP 2016, paywalled) |
| Summary of the 2024 Professionals in Nutrition for Exercise and Sport “10 Questions -10 Experts” Session—Hot Topics for the Paris Olympic Games.pdf | 10.1123/ijsnem.2024-0167 | none usable | no | No OA copy (IJSNEM, paywalled) |
| Tackle and ball carrier demands of rugby league - A seven-year league-wide study including over 1,000,000 tackle events.pdf | 10.1016/j.jsams.2022.07.002 | https://eprints.leedsbeckett.ac.uk/id/eprint/8860/3/TackleAndBallCarrierDemandsOfRugbyLeagueASevenyearLeaguewideStudyIncludingOver1000000TackleEventsAM-RENNIE.pdf | yes | |
| The acute demands of repeated sprint training on physiological, neuromuscular, perceptual and performance outcomes in team sport athletes - A sy.pdf | 10.1007/s40279-023-01853-w | https://pmc-oa-opendata.s3.amazonaws.com/PMC10356687.1/PMC10356687.1.pdf | yes | |

Note: the DOIs were matched by Crossref title search (similarity 0.89 to 1.0; the lowest is the "sy" truncated filename for the repeated-sprint review, 10.1007/s40279-023-01853-w).

## DOI re-check

`10.26603/ijspt20200326` resolves: doi.org redirects (302) to the IJSPT journal page (spts.org, v15n2), and Crossref returns "Criteria-based return to sprinting progression following lower extremity injury", International Journal of Sports Physical Therapy, April 2020. It matches the expected title. Confirmed.

## Eric must still get by hand (10)

- A randomized trial of healthy weight gain in athletic individuals.pdf (10.1249/mss.0000000000003427): No OA copy (Unpaywall none, not in Europe PMC); MSSE paywalled
- The relationship between isometric and dynamic strength following resistance training - A systematic review, meta-analysis, and level of agreement.pdf (10.1123/ijspp.2023-0066): Unpaywall lists journals.humankinetics.com (returns non-PDF to curl) and ro.ecu.edu.au repository page (no direct file link found)
- High Rate of Return to Sport for Athletes Undergoing Articular Cartilage Restoration Procedures for the Knee - A Systematic Review of Contemporary Studies.pdf (10.1177/03635465241280975): No OA copy (AJSM, paywalled)
- Concurrent Validity and Reliability of Sprinting Force–Velocity Profile Assessed With GPS Devices in Elite Athletes.pdf (10.1123/ijspp.2021-0339): Only OA copy is HAL (insep.hal.science), which serves a bot check to curl; browser download by hand
- Does Mathematical Coupling Matter   to the Acute to Chronic Workload Ratio- A Case Study From Elite Sport.pdf (10.1123/ijspp.2018-0874): No OA copy (IJSPP, paywalled)
- Early Warning of Suspected Doping   from Biological Passport Based on Multivariate Trends.pdf (10.1055/a-1019-7774): No OA copy (Thieme, paywalled)
- Integrated performance support- facilitating effective and collaborative performance teams.pdf (10.1136/bjsports-2017-097646): No OA copy (BJSM 2018, paywalled)
- Muscle activation differences during eccentric hamstring exercises.pdf (10.1177/1941738120938649): PMC8167351 is an author manuscript outside the PMC open-data bucket; PMC and Europe PMC render block curl; browser download by hand
- Single leg power output and between      limbs imbalances in team sport players - Unilateral vs bilateral   combined    resistance training.pdf (10.1123/ijspp.2015-0743): No OA copy (IJSPP 2016, paywalled)
- Summary of the 2024 Professionals in Nutrition for Exercise and Sport “10 Questions -10 Experts” Session—Hot Topics for the Paris Olympic Games.pdf (10.1123/ijsnem.2024-0167): No OA copy (IJSNEM, paywalled)
