# Baylor Athletics Health & Performance Evidence

Shared language for curating health and performance evidence and translating it into practical decision support for Baylor Athletics staff.

## Language

**Evidence Library**:
A curated collection of source-grounded evidence resources approved for staff discovery and synthesis.
_Avoid_: Paper archive, research database

**Evidence Library Publication Candidate**:
A source-verified synthesis proposed for admission to the Evidence Library. It requires accountable review,
duplicate and taxonomy checks, and stable-ID assignment before publication.
_Avoid_: Published paper, submission, automatic import

**Ask the Library**:
The decision-support experience that converts a staff question into a structured Decision Brief grounded in the Evidence Library.
_Avoid_: Chatbot, answer engine

**Decision Brief**:
A structured, source-grounded synthesis that states the bottom line, applicability, evidence confidence, limitations, practical options and guardrails, and supporting sources. It informs staff judgment rather than making the final decision.
_Avoid_: Definitive answer, prescription

**Brief Revision**:
A new version of a Decision Brief created after its requester changes the Practical Question or Decision Context. It preserves the prior version rather than extending an open-ended chat transcript or silently rewriting the brief.
_Avoid_: Follow-up chat, in-place overwrite

**Operational View**:
The concise default presentation of a Decision Brief, designed for approximately two minutes of reading and focused on direction, confidence, action, guardrails, and critical caveats. Research detail remains available through expandable evidence sections.
_Avoid_: Abstract, full research report

**Library-Grounded**:
A claim or conclusion supported only by evidence resources in the Evidence Library, with the supporting sources made traceable.
_Avoid_: Generally research-backed, AI-generated

**Source-Grounded Claim**:
A substantive statement supported by the original text of an Evidence Library source. Existing summaries and taxonomy may locate the source but cannot serve as the claim's sole support.
_Avoid_: Summary-grounded claim, unsupported citation

**Coverage Gap**:
An explicit finding that the Evidence Library does not contain enough relevant evidence to support a Decision Brief. It does not mean that an intervention is ineffective or that no external evidence exists.
_Avoid_: No evidence, negative finding

**Public Evidence Library**:
The publicly accessible discovery surface for browsing, searching, and reading the Evidence Library.
_Avoid_: Staff portal, Ask the Library

**Ask the Library Workspace**:
The authenticated, Baylor-staff-only decision-support surface where practical questions become Decision Briefs.
_Avoid_: Public chatbot, public search

**Decision Context**:
The de-identified situational factors needed to judge whether evidence applies, such as sport, population, training or rehabilitation phase, injury category, intended outcome, and operational constraints. It excludes names, medical records, clinical notes, and other identifying athlete data.
_Avoid_: Athlete profile, patient record

**Decision-Critical Context**:
A Decision Context factor whose absence could materially change evidence selection or a Recommended Direction. Its absence may trigger one optional clarifying question; if skipped, the brief states its assumption and adjusts applicability or confidence when needed.
_Avoid_: Required questionnaire, intake interrogation

**Practical Question**:
A plain-language question about a decision facing Baylor Athletics staff, optionally accompanied by Decision Context.
_Avoid_: Prompt, search query

**Guided Intake**:
The default way to submit a Practical Question by pairing it with optional structured Decision Context while keeping unnecessary fields skippable.
_Avoid_: Empty chat box, case submission

**Evidence Confidence**:
A Decision-Context-specific tier of Higher, Moderate, or Limited describing how strongly the Evidence Library supports a Decision Brief's bottom line. The tier includes a visible rationale and is not a numerical score; inadequate evidence is a Coverage Gap instead.
_Avoid_: Confidence score, certainty

**Evidence Tension**:
A material disagreement among relevant sources that must be explained rather than averaged into artificial consensus. Context-resolved tension may support a conditional direction, while unresolved tension limits confidence and prevents a preferred direction.
_Avoid_: Noise, consensus average

**Recommended Direction**:
The evidence-supported preferred course presented in a Decision Brief when Evidence Confidence is Higher or Moderate. It remains conditional on the stated Decision Context and does not replace staff authority.
_Avoid_: Prescription, final decision

**On-Demand Brief**:
A Decision Brief produced immediately for a Practical Question and clearly identified as not yet expert-reviewed. It is private to the requester unless deliberately submitted for review.
_Avoid_: Approved guidance, Baylor policy

**Review Candidate**:
An On-Demand Brief that its requester has deliberately submitted for possible promotion to a Reviewed Brief.
_Avoid_: Shared draft, published brief

**Controlled Share**:
A deliberate staff-to-staff link or export of an On-Demand Brief that permanently preserves its review status, creation date, Decision Context, Evidence Confidence, and citations. It neither makes the brief public nor promotes it to Reviewed status.
_Avoid_: Publication, anonymous public link

**Domain Reviewer**:
The named Baylor subject-matter owner who confirms a Review Candidate's interpretation, applicability, and practical language before promotion. Automated gates, rather than the reviewer, perform mechanical source and citation checks.
_Avoid_: Approval committee, second sign-off

**Reviewed Brief**:
A Decision Brief evaluated by an accountable Baylor subject-matter owner and retained as reusable organizational knowledge. Reviewed status does not by itself make the brief Baylor policy.
_Avoid_: On-demand answer, institutional policy

**Reuse Match**:
A Reviewed Brief whose Practical Question and Decision Context are sufficiently similar to a new request that it should be offered before generating another brief.
_Avoid_: Duplicate answer, keyword match

**Refresh Due**:
A status applied to a Reviewed Brief when 12 months have passed since review or newly added, directly relevant evidence could materially change it. The existing version remains readable with a warning until a new version is reviewed.
_Avoid_: Expired, silently updated

**Use Signal**:
Lightweight staff feedback indicating whether a Decision Brief was useful or influenced a decision, with an optional comment or review submission. It is improvement data, not an athlete outcome or proof that the direction was effective.
_Avoid_: Outcome measure, validation evidence, staff performance metric

**Decision Utility**:
The degree to which staff judge a Decision Brief useful for informing or confirming a real decision and worth using again. It is the primary product outcome, not proof of an athlete-performance or health effect.
_Avoid_: Engagement, clinical effectiveness

**Evidence Integrity**:
The degree to which a Decision Brief's substantive claims, confidence rationale, and citations remain traceable to and faithful to the original supporting sources.
_Avoid_: Citation count, source popularity

**Minimum Viable Pilot**:
A two-week evaluation in which three staff from at least two functional disciplines submit nine real Practical Questions. It warrants expansion only when all nine briefs are audited, no unresolved critical Evidence Integrity failure remains, at least seven briefs are useful, at least two participants would reuse the tool, and at least one brief informs or confirms a real decision; it does not validate department-wide deployment.
_Avoid_: Internal alpha, deployment validation

**Concierge Pilot**:
An operator-mediated implementation of the Minimum Viable Pilot in which staff submit real de-identified Practical Questions and receive the approved Decision Brief experience, while retrieval, synthesis, and claim auditing remain explicitly human-operated. It tests Decision Utility and Evidence Integrity before authenticated self-service infrastructure is built.
_Avoid_: Production workspace, automated pilot, staff portal
