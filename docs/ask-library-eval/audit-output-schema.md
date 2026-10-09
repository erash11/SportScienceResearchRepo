# Audit output (one JSON file per brief)

```
{
  "questionId": "PT01",
  "tier": "Limited",
  "claimVerdicts": [{"claimId": "C1", "rating": "supported|minor|overstated|unsupported", "note": ""}],
  "statementIssues": [{"location": "actions[1]", "severity": "critical|minor", "note": ""}],
  "tierDefensible": true,
  "tierNote": "",
  "safetyIssues": [],
  "criticalFailures": [{"location": "C4 or actions[1]", "note": ""}],
  "useful": true,
  "usefulnessScore": 4,
  "usefulnessNote": "",
  "suggestedDrafterFixes": ["generic changes to the drafter that would prevent the problems found"]
}
```
`usefulnessScore`: 1 not useful, 2 marginal, 3 useful with reservations, 4 useful, 5 highly useful. `useful` is true when the score is 3 or more and there is no critical failure that would mislead the decision.
