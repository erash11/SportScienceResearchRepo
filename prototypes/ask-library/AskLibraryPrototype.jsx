import { useEffect, useRef, useState } from "react";
import demoBrief from "../../docs/ask-library-pilot/examples/brief.example.json";
import {
  createBriefFeedback,
  createBriefRequest,
  prepareBriefForDelivery,
  validateBriefFeedback,
} from "../../ask-library/pilot-core.mjs";

const EMPTY_FORM = {
  question: "",
  population: "",
  sport: "",
  phase: "",
  outcome: "",
  constraints: "",
  deidentifiedAttestation: false,
};

const DEMO_FORM = {
  question: "How should we structure training and recovery between two competitions inside 96 hours?",
  population: "Collegiate starters and high-minute players",
  sport: "Team sport",
  phase: "Between competitions (<96 hours)",
  outcome: "Preserve readiness without losing tactical preparation",
  constraints: "Travel after the first competition; one field session available",
  deidentifiedAttestation: true,
};

const EMPTY_FEEDBACK = {
  participantId: "",
  useful: null,
  decisionEffect: "",
  decisionNote: "",
  directionClarity: null,
  confidenceCalibration: "",
  missingOrMisapplied: "",
  timeToUnderstanding: "",
  closeoutCompleted: false,
  wouldReuse: null,
  questionTypes: "",
  largestFriction: "",
  deidentifiedAttestation: false,
};

const DECISION_EFFECT_OPTIONS = [
  ["informed", "Informed"],
  ["confirmed", "Confirmed"],
  ["changed", "Changed"],
  ["not-yet", "Not yet"],
  ["no-effect", "No effect"],
];

const CONFIDENCE_OPTIONS = [
  ["too-cautious", "Too cautious"],
  ["about-right", "About right"],
  ["too-confident", "Too confident"],
];

const TIME_OPTIONS = [
  ["under-2", "Under 2 min"],
  ["2-to-5", "2–5 min"],
  ["over-5", "Over 5 min"],
];

function downloadJson(filename, value) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <rect x="4" y="8" width="12" height="9" rx="1" />
      <path d="M7 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function BrandHeader({ hasBrief, onNewQuestion }) {
  return (
    <header className="brand-header">
      <a className="brand-lockup" href="#top" aria-label="Ask the Library home">
        <span className="brand-mark">
          <img src="/assets/bu-mark-white.png" alt="" />
        </span>
        <span>
          <strong>Baylor Athletics</strong>
          <small>Health &amp; Performance Evidence</small>
        </span>
      </a>
      <div className="workspace-meta">
        <span className="prototype-flag">Concierge pilot</span>
        <span className="private-label">
          <LockIcon /> Local operator preview
        </span>
        {hasBrief && (
          <button className="header-action" type="button" onClick={onNewQuestion}>
            New question
          </button>
        )}
      </div>
    </header>
  );
}

function ContextField({ id, label, value, onChange, placeholder, children }) {
  return (
    <label className="context-field" htmlFor={id}>
      <span>{label}</span>
      {children || (
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function IntakeScreen({
  form,
  setField,
  onUseDemo,
  onStart,
  error,
  privacyError,
  isDemo,
  onOpenBrief,
  importErrors,
}) {
  return (
    <main id="top" className="intake-page">
      <section className="intake-intro" aria-labelledby="intake-title">
        <div className="section-kicker">Ask the Library / Staff decision support</div>
        <h1 id="intake-title">
          Ask a decision.
          <span>Trace the evidence.</span>
        </h1>
        <p>
          Turn a practical health or performance question into a source-grounded brief built for the next staff conversation.
        </p>
      </section>

      <ol className="pilot-flow" aria-label="How the pilot works">
        <li>
          <span>1</span>
          <div>
            <strong>Staff asks</strong>
            <small>Enter one de-identified question.</small>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>Codex prepares</strong>
            <small>The pilot lead gives Codex the saved question file.</small>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Staff reviews</strong>
            <small>Read the finished answer and rate whether it helped.</small>
          </div>
        </li>
      </ol>

      <div className="intake-ledger">
        <section className="question-sheet" aria-labelledby="question-heading">
          <div className="sheet-heading">
            <div>
              <span className="sheet-index">01</span>
              <h2 id="question-heading">What decision are you facing?</h2>
            </div>
            <button className="text-action" type="button" onClick={onUseDemo}>
              Load practice example
            </button>
          </div>

          <label className="question-field" htmlFor="practical-question">
            <span>Practical question</span>
            <textarea
              id="practical-question"
              value={form.question}
              onChange={(event) => setField("question", event.target.value)}
              placeholder="Example: How should we modify training when competition turnaround is short?"
              rows="4"
              aria-describedby={error ? "question-error" : undefined}
            />
          </label>
          {error && (
            <p className="field-error" id="question-error" role="alert">
              Add the practical question you want the library to address.
            </p>
          )}

          <div className="context-heading">
            <span className="sheet-index">02</span>
            <div>
              <h2>Add context that could change the answer</h2>
              <p>Optional. Do not enter athlete names, medical records, or clinical notes.</p>
            </div>
          </div>

          <div className="context-grid">
            <ContextField
              id="population"
              label="Population"
              value={form.population}
              onChange={(value) => setField("population", value)}
              placeholder="Collegiate starters"
            />
            <ContextField
              id="sport"
              label="Sport or setting"
              value={form.sport}
              onChange={(value) => setField("sport", value)}
              placeholder="Team sport"
            />
            <ContextField id="phase" label="Phase" value={form.phase} onChange={() => {}}>
              <select id="phase" value={form.phase} onChange={(event) => setField("phase", event.target.value)}>
                <option value="">Select if relevant</option>
                <option>Between competitions (&lt;96 hours)</option>
                <option>Standard training week</option>
                <option>Return to full participation</option>
                <option>Off-season development</option>
              </select>
            </ContextField>
            <ContextField
              id="outcome"
              label="Intended outcome"
              value={form.outcome}
              onChange={(value) => setField("outcome", value)}
              placeholder="Preserve readiness"
            />
            <ContextField
              id="constraints"
              label="Operational constraints"
              value={form.constraints}
              onChange={(value) => setField("constraints", value)}
              placeholder="Travel, staffing, time, equipment"
            />
          </div>

          <label className={`privacy-attestation ${privacyError ? "has-error" : ""}`} htmlFor="deidentified-attestation">
            <input
              id="deidentified-attestation"
              type="checkbox"
              checked={form.deidentifiedAttestation}
              onChange={(event) => setField("deidentifiedAttestation", event.target.checked)}
              aria-describedby={privacyError ? "privacy-error" : undefined}
            />
            <span>
              I confirm this request contains no athlete names, medical records, clinical notes, or other identifying information.
            </span>
          </label>
          {privacyError && (
            <p className="field-error" id="privacy-error" role="alert">
              Confirm the request is de-identified before creating the pilot packet.
            </p>
          )}

          <div className="intake-submit-row">
            <div className="privacy-note">
              <LockIcon />
              <span>This downloads a small question file. Nothing is sent yet.</span>
            </div>
            <button className="primary-action" type="button" onClick={onStart}>
              {isDemo ? "Open practice answer" : "Save question for Codex"} <ArrowIcon />
            </button>
          </div>
        </section>

        <aside className="evidence-contract" aria-labelledby="contract-heading">
          <div>
            <span className="sheet-index light">Evidence contract</span>
            <h2 id="contract-heading">The library shows its work.</h2>
          </div>
          <ol>
            <li>
              <strong>Library only</strong>
              <span>No silent web or model-knowledge supplementation.</span>
            </li>
            <li>
              <strong>Original sources</strong>
              <span>Substantive claims must trace back to source text.</span>
            </li>
            <li>
              <strong>Honest uncertainty</strong>
              <span>Confidence, disagreement, and coverage gaps stay visible.</span>
            </li>
          </ol>
          <div className="library-pulse" aria-label="Current evidence library coverage">
            <div>
              <strong>600</strong>
              <span>published sources</span>
            </div>
            <div>
              <strong>193</strong>
              <span>full-text reviewed</span>
            </div>
          </div>
          <p className="contract-footnote">Prototype counts reflect the July 29, 2026 repository audit.</p>
          <div className="brief-docket">
            <span className="sheet-index light">Finished answer</span>
            <h3>Open Codex&apos;s finished answer</h3>
            <p>After Codex returns a finished brief file, choose it here. Do not choose the question file.</p>
            <label className="docket-action">
              Choose finished answer file
              <input type="file" accept="application/json,.json" onChange={onOpenBrief} />
            </label>
            {importErrors.length > 0 && (
              <div className="docket-errors" role="alert">
                <strong>Brief not opened</strong>
                <ul>
                  {importErrors.slice(0, 4).map((message) => <li key={message}>{message}</li>)}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function ClarificationScreen({ form, onChoose, onBack }) {
  const choices = [
    "Between competitions (<96 hours)",
    "Standard training week",
    "Return to full participation",
  ];

  return (
    <main id="top" className="focus-page">
      <section className="clarification-sheet" aria-labelledby="clarification-title">
        <button className="back-action" type="button" onClick={onBack}>
          ← Back to question
        </button>
        <div className="section-kicker">One detail could change the evidence</div>
        <h1 id="clarification-title">Which phase matters most?</h1>
        <blockquote>{form.question}</blockquote>
        <div className="clarification-options">
          {choices.map((choice) => (
            <button key={choice} type="button" onClick={() => onChoose(choice)}>
              <span>{choice}</span>
              <ArrowIcon />
            </button>
          ))}
        </div>
        <button className="skip-action" type="button" onClick={() => onChoose("Not specified")}>
          Continue without specifying a phase
        </button>
        <p className="clarification-note">This is the only clarification Ask the Library will request.</p>
      </section>
    </main>
  );
}

function RequestReadyScreen({ request, onDownload, onNewQuestion }) {
  return (
    <main id="top" className="focus-page">
      <section className="request-ready-sheet" aria-labelledby="request-ready-title">
        <div className="section-kicker">Question saved</div>
        <h1 id="request-ready-title">Now give this file to Codex.</h1>
        <p className="request-ready-intro">
          A file named <strong>{request.requestId}.json</strong> is in your Downloads folder. Attach that file to a Codex task. Codex will create the finished answer file.
        </p>

        <div className="request-receipt">
          <span>Request ID</span>
          <strong>{request.requestId}</strong>
          <small>{request.practicalQuestion}</small>
        </div>

        <ol className="request-next-steps">
          <li>Find the <strong>ATL-R-…json</strong> file in Downloads.</li>
          <li>Attach it to Codex using the saved pilot instructions.</li>
          <li>Return here and choose Codex&apos;s finished answer file.</li>
        </ol>

        <div className="request-ready-actions">
          <button className="primary-action" type="button" onClick={onDownload}>
            Download question file again <ArrowIcon />
          </button>
          <button className="back-action" type="button" onClick={onNewQuestion}>
            Enter another question
          </button>
        </div>
        <p className="clarification-note">
          Leave the prototype open. You do not need to restart it for the next question.
        </p>
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main id="top" className="focus-page" aria-live="polite">
      <section className="loading-sheet">
        <div className="loading-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="section-kicker">Interaction simulation</div>
        <h1>Building the evidence trace</h1>
        <ul>
          <li>Matching the Practical Question to library sources</li>
          <li>Checking claims against original source records</li>
          <li>Drafting the two-minute Operational View</li>
        </ul>
        <div className="loading-line"><span /></div>
      </section>
    </main>
  );
}

function ConfidenceRationale({ confidence, sourceCount }) {
  const dimensions = confidence.dimensions ?? {};
  const items = [
    ["Source review", dimensions.sourceReview || `${sourceCount} full-text-reviewed record${sourceCount === 1 ? "" : "s"}`],
    ["Directness", dimensions.directness],
    ["Consistency", dimensions.consistency],
    ["Transferability", dimensions.transferability],
  ].filter(([, value]) => value);

  return (
    <div className="confidence-grid">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function SourceCard({ source, index }) {
  const supports = source.claims.map((claim) => claim.text);

  return (
    <article className="source-card">
      <div className="source-number">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <div className="source-meta">
          Library ID {source.libraryId} · {source.year} · Full-text reviewed
        </div>
        <h3>{source.citation}</h3>
        {supports.length > 0 && (
          <p><strong>Supports:</strong> {supports.join(" ")}</p>
        )}
        {source.claims.length > 0 && (
          <details className="source-excerpts">
            <summary>View source-grounded excerpts</summary>
            {source.claims.flatMap((claim) => (
              claim.evidence.map((evidence) => (
                <blockquote key={`${claim.id}-${evidence.page}-${evidence.excerpt}`}>
                  “{evidence.excerpt}” <cite>PDF page {evidence.page}</cite>
                </blockquote>
              ))
            ))}
          </details>
        )}
        <div className="source-links">
          <a href={source.url} target="_blank" rel="noreferrer">Open original source ↗</a>
          {source.doiUrl && <a href={source.doiUrl} target="_blank" rel="noreferrer">DOI ↗</a>}
        </div>
      </div>
    </article>
  );
}

function ControlledShareDialog({ onClose, createdDate, brief }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="Close controlled-share preview" onClick={onClose}>×</button>
        <div className="section-kicker">Controlled-share preview</div>
        <h2 id="share-title">The status travels with the brief.</h2>
        <div className="share-preview">
          <div className="share-status">{brief.status} · {brief.reviewStatus}</div>
          <strong>{brief.practicalQuestion}</strong>
          <span>
            Created {createdDate} · {brief.evidenceConfidence.tier} confidence · {brief.sourceCount} supporting source{brief.sourceCount === 1 ? "" : "s"}
          </span>
        </div>
        <p>
          A real controlled share would require Baylor authentication and retain the question, Decision Context, confidence rationale, citations, and current version.
        </p>
        <button className="primary-action full" type="button" onClick={onClose}>Close preview</button>
      </section>
    </div>
  );
}

function ChoiceField({ legend, value, options, onChange }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="choice-row">
        {options.map(([optionValue, label]) => (
          <button
            key={String(optionValue)}
            className={value === optionValue ? "selected" : ""}
            type="button"
            aria-pressed={value === optionValue}
            onClick={() => onChange(optionValue)}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function FeedbackPanel({ brief }) {
  const [draft, setDraft] = useState(EMPTY_FEEDBACK);
  const [feedbackErrors, setFeedbackErrors] = useState([]);
  const [exported, setExported] = useState(false);

  const setFeedback = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFeedbackErrors([]);
    setExported(false);
  };

  const exportFeedback = () => {
    const feedback = createBriefFeedback(brief, draft);
    const validation = validateBriefFeedback(feedback);
    if (!validation.valid) {
      setFeedbackErrors(validation.errors);
      setExported(false);
      return;
    }

    downloadJson(
      `${brief.briefId}-${feedback.participantId}-feedback.json`,
      feedback,
    );
    setFeedbackErrors([]);
    setExported(true);
  };

  const decisionDetailRequired = ["informed", "confirmed", "changed"].includes(
    draft.decisionEffect,
  );

  return (
    <section className="feedback-section" aria-labelledby="feedback-heading">
      <div className="feedback-intro">
        <div className="brief-section-label">Use signal</div>
        <h2 id="feedback-heading">Did this help the decision?</h2>
        <p>
          Your responses are not sent or stored. Download the anonymous feedback file and return it to the pilot operator.
        </p>
      </div>

      <div className="feedback-form">
        <label className="feedback-text-field compact" htmlFor="participant-id">
          <span>Anonymous pilot ID</span>
          <input
            id="participant-id"
            value={draft.participantId}
            onChange={(event) => setFeedback("participantId", event.target.value.toUpperCase())}
            placeholder="P01"
            maxLength="3"
          />
        </label>

        <ChoiceField
          legend="Was this useful?"
          value={draft.useful}
          options={[[true, "Yes"], [false, "No"]]}
          onChange={(value) => setFeedback("useful", value)}
        />

        <ChoiceField
          legend="What effect did it have?"
          value={draft.decisionEffect}
          options={DECISION_EFFECT_OPTIONS}
          onChange={(value) => setFeedback("decisionEffect", value)}
        />

        <label className="feedback-text-field" htmlFor="decision-note">
          <span>
            What decision or next action did it affect?
            {decisionDetailRequired ? " Required for this response." : " Optional."}
          </span>
          <textarea
            id="decision-note"
            value={draft.decisionNote}
            onChange={(event) => setFeedback("decisionNote", event.target.value)}
            placeholder="One de-identified sentence"
            rows="3"
            required={decisionDetailRequired}
          />
        </label>

        <ChoiceField
          legend="Was the direction clear enough to act on? 1 = not clear, 5 = very clear"
          value={draft.directionClarity}
          options={[1, 2, 3, 4, 5].map((value) => [value, String(value)])}
          onChange={(value) => setFeedback("directionClarity", value)}
        />

        <ChoiceField
          legend="Was the confidence appropriately calibrated?"
          value={draft.confidenceCalibration}
          options={CONFIDENCE_OPTIONS}
          onChange={(value) => setFeedback("confidenceCalibration", value)}
        />

        <ChoiceField
          legend="How long did it take to reach a usable understanding?"
          value={draft.timeToUnderstanding}
          options={TIME_OPTIONS}
          onChange={(value) => setFeedback("timeToUnderstanding", value)}
        />

        <label className="feedback-text-field" htmlFor="missing-feedback">
          <span>What was missing, misapplied, or unnecessarily complicated? Optional.</span>
          <textarea
            id="missing-feedback"
            value={draft.missingOrMisapplied}
            onChange={(event) => setFeedback("missingOrMisapplied", event.target.value)}
            placeholder="Nothing material, or describe the issue"
            rows="3"
          />
        </label>

        <details className="participant-closeout">
          <summary>Complete after your third brief</summary>
          <label className="closeout-toggle" htmlFor="closeout-completed">
            <input
              id="closeout-completed"
              type="checkbox"
              checked={draft.closeoutCompleted}
              onChange={(event) => setFeedback("closeoutCompleted", event.target.checked)}
            />
            <span>This is my third pilot brief.</span>
          </label>

          {draft.closeoutCompleted && (
            <div className="closeout-fields">
              <ChoiceField
                legend="Would you use Ask the Library again?"
                value={draft.wouldReuse}
                options={[[true, "Yes"], [false, "No"]]}
                onChange={(value) => setFeedback("wouldReuse", value)}
              />
              <label className="feedback-text-field" htmlFor="question-types">
                <span>What types of questions would you use it for?</span>
                <textarea
                  id="question-types"
                  value={draft.questionTypes}
                  onChange={(event) => setFeedback("questionTypes", event.target.value)}
                  rows="3"
                />
              </label>
              <label className="feedback-text-field" htmlFor="largest-friction">
                <span>What created the most friction or mistrust?</span>
                <textarea
                  id="largest-friction"
                  value={draft.largestFriction}
                  onChange={(event) => setFeedback("largestFriction", event.target.value)}
                  rows="3"
                />
              </label>
            </div>
          )}
        </details>

        <label className="feedback-attestation" htmlFor="feedback-attestation">
          <input
            id="feedback-attestation"
            type="checkbox"
            checked={draft.deidentifiedAttestation}
            onChange={(event) => setFeedback("deidentifiedAttestation", event.target.checked)}
          />
          <span>I confirm this feedback contains no identifying athlete information.</span>
        </label>

        {feedbackErrors.length > 0 && (
          <div className="feedback-errors" role="alert">
            <strong>Complete these items before downloading feedback:</strong>
            <ul>
              {feedbackErrors.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </div>
        )}

        <div className="feedback-export-row">
          <button className="primary-action" type="button" onClick={exportFeedback}>
            Download feedback <ArrowIcon />
          </button>
          {exported && <span role="status">Feedback file downloaded ✓</span>}
        </div>
      </div>
    </section>
  );
}

function BriefScreen({ sourceBrief, isImported, onRefine }) {
  const delivery = prepareBriefForDelivery(sourceBrief);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewState, setReviewState] = useState("idle");
  const brief = delivery.brief;
  const createdDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(brief?.createdAt ?? Date.now()));

  if (!delivery.valid) {
    return (
      <main id="top" className="focus-page">
        <section className="request-ready-sheet">
          <div className="section-kicker">Brief delivery stopped</div>
          <h1>This brief did not pass validation.</h1>
          <ul className="detail-list">
            {delivery.errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main id="top" className="brief-page">
      <section className="brief-masthead">
        <div>
          <div className="section-kicker">{brief.status} Brief / {brief.reviewStatus}</div>
          <h1>{brief.practicalQuestion}</h1>
          <div className="context-line">
            {brief.contextItems.map((item) => (
              <span key={item.field} title={item.label}>{item.value}</span>
            ))}
          </div>
        </div>
        <div className={`brief-actions ${isImported ? "delivery-actions" : ""}`}>
          {isImported ? (
            <>
              <button type="button" onClick={() => window.print()}>Print / Save PDF</button>
              <button type="button" onClick={() => downloadJson(`${brief.briefId}.json`, sourceBrief)}>
                Download brief JSON
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onRefine}>Refine question</button>
              <button type="button" onClick={() => setShareOpen(true)}>Preview controlled share</button>
              <button
                className={reviewState === "submitted" ? "submitted" : ""}
                type="button"
                onClick={() => setReviewState("submitted")}
                disabled={reviewState === "submitted"}
              >
                {reviewState === "submitted" ? "Submitted for review ✓" : "Submit for review"}
              </button>
            </>
          )}
        </div>
      </section>

      {reviewState === "submitted" && (
        <div className="review-notice" role="status">
          This prototype brief is now shown as a Review Candidate. No real request was sent.
        </div>
      )}

      <div className="brief-shell">
        <aside className="brief-rail" aria-label="Decision Brief contents">
          <div className="brief-stamp">
            <span>Status</span>
            <strong>{brief.status}</strong>
            <small>{createdDate} · v{brief.version}</small>
          </div>
          <nav>
            <a href="#decision">Decision</a>
            <a href="#action">Action</a>
            <a href="#boundaries">Boundaries</a>
            <a href="#evidence">Evidence</a>
          </nav>
          <div className="prototype-note">
            {isImported
              ? `Pilot brief ${brief.briefId}. Feedback remains local until downloaded.`
              : `Example content drawn from published records ${brief.sources.map((source) => source.libraryId).join(", ")}.`}
          </div>
        </aside>

        <article className="decision-brief">
          <div className="evidence-spine" aria-hidden="true" />

          <section id="decision" className="brief-section decision-section">
            <div className="brief-section-label">Decision</div>
            <div className="confidence-lockup">
              <div className="confidence-tier">
                <span>Evidence confidence</span>
                <strong>{brief.evidenceConfidence.tier}</strong>
              </div>
              <p>{brief.evidenceConfidence.rationale}</p>
            </div>

            <h2>Bottom line</h2>
            <p className="bottom-line">{brief.bottomLine.text}</p>

            <div className={`direction-block ${brief.isCoverageGap ? "coverage-gap" : ""}`}>
              <span>{brief.hasRecommendedDirection ? "Recommended Direction" : "Decision boundary"}</span>
              <p>
                {brief.hasRecommendedDirection
                  ? brief.recommendedDirection.text
                  : brief.isCoverageGap
                    ? "No direction is offered because the Evidence Library does not contain enough relevant source-grounded evidence."
                    : "No preferred direction is offered at Limited confidence. Use the options and guardrails below to support staff judgment."}
              </p>
            </div>
          </section>

          {(brief.actions.length > 0 || brief.monitoring.length > 0) && (
            <section id="action" className="brief-section">
              <div className="brief-section-label">Act</div>
              <h2>Put it into the week</h2>
              {brief.actions.length > 0 && (
                <div className="action-ledger">
                  {brief.actions.map((action, index) => (
                    <div key={`${index}-${action.text}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h3>{action.title || `Action ${index + 1}`}</h3>
                      <p>{action.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {brief.monitoring.length > 0 && (
                <>
                  <h3 className="subsection-title">Monitoring considerations</h3>
                  <div className="monitoring-table" role="table" aria-label="Monitoring considerations">
                    {brief.monitoring.map((item, index) => (
                      <div role="row" key={`${index}-${item.text}`}>
                        <strong role="cell">{item.label || `Signal ${index + 1}`}</strong>
                        <span role="cell">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          <section id="boundaries" className="brief-section">
            <div className="brief-section-label">Boundaries</div>
            <div className="boundary-grid">
              <div>
                <h2>{brief.evidenceTension ? "Where the evidence disagrees" : "Critical limitation"}</h2>
                <p>
                  {brief.evidenceTension?.text
                    || brief.limitations[0]?.text
                    || "No material Evidence Tension was recorded for this brief."}
                </p>
              </div>
              <div className="caution-box">
                <span>Guardrails</span>
                <ul>
                  {(brief.guardrails.length > 0 ? brief.guardrails : brief.limitations)
                    .map((item) => <li key={item.text}>{item.text}</li>)}
                </ul>
              </div>
            </div>

            <details className="evidence-details" open>
              <summary>Why this is {brief.evidenceConfidence.tier} confidence</summary>
              <p className="confidence-explanation">{brief.evidenceConfidence.rationale}</p>
              <ConfidenceRationale
                confidence={brief.evidenceConfidence}
                sourceCount={brief.sourceCount}
              />
            </details>

            {brief.limitations.length > 0 && (
              <details className="evidence-details">
                <summary>Critical limitations</summary>
                <ul className="detail-list">
                  {brief.limitations.map((item) => <li key={item.text}>{item.text}</li>)}
                </ul>
              </details>
            )}

            {brief.whatCouldChange.length > 0 && (
              <details className="evidence-details">
                <summary>What could change this direction</summary>
                <ul className="detail-list">
                  {brief.whatCouldChange.map((item) => <li key={item.text}>{item.text}</li>)}
                </ul>
              </details>
            )}
          </section>

          <section id="evidence" className="brief-section sources-section">
            <div className="brief-section-label">Evidence</div>
            <div className="sources-heading">
              <div>
                <h2>{brief.sourceCount > 0 ? "Supporting sources" : "Coverage gap"}</h2>
                <p>
                  {brief.sourceCount > 0
                    ? "Every supporting source below is published and full-text reviewed in the Evidence Library."
                    : "No source was used to support a recommendation for this Decision Context."}
                </p>
              </div>
              <span>{brief.sourceCount} source{brief.sourceCount === 1 ? "" : "s"}</span>
            </div>
            {brief.sourceCount > 0 && (
              <div className="source-list">
                {brief.sources.map((source, index) => (
                  <SourceCard key={source.libraryId} source={source} index={index} />
                ))}
              </div>
            )}
          </section>

          <FeedbackPanel key={brief.briefId} brief={brief} />
        </article>
      </div>

      {shareOpen && (
        <ControlledShareDialog
          onClose={() => setShareOpen(false)}
          createdDate={createdDate}
          brief={brief}
        />
      )}
    </main>
  );
}

export default function AskLibraryPrototype() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [screen, setScreen] = useState("intake");
  const [error, setError] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [requestPacket, setRequestPacket] = useState(null);
  const [activeBrief, setActiveBrief] = useState(null);
  const [briefOrigin, setBriefOrigin] = useState("");
  const [importErrors, setImportErrors] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "question" && value.trim()) setError(false);
    if (field === "deidentifiedAttestation" && value) setPrivacyError(false);
  };

  const generateBrief = (phase = form.phase) => {
    setForm((current) => ({ ...current, phase }));
    setActiveBrief(demoBrief);
    setBriefOrigin("demo");
    setScreen("loading");
    timerRef.current = window.setTimeout(() => setScreen("brief"), 1200);
  };

  const openBriefFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const delivery = prepareBriefForDelivery(parsed);
      if (!delivery.valid) {
        setImportErrors(delivery.errors);
        return;
      }

      setActiveBrief(parsed);
      setBriefOrigin("imported");
      setImportErrors([]);
      setScreen("brief");
    } catch (fileError) {
      setImportErrors([
        fileError instanceof SyntaxError
          ? "The selected file is not valid JSON."
          : "The selected brief could not be read.",
      ]);
    } finally {
      event.target.value = "";
    }
  };

  const completePilotAction = (phase = form.phase) => {
    const completedForm = { ...form, phase };
    setForm(completedForm);

    if (completedForm.question.trim() === DEMO_FORM.question) {
      generateBrief(phase);
      return;
    }

    const packet = createBriefRequest(completedForm);
    setRequestPacket(packet);
    downloadJson(`${packet.requestId}.json`, packet);
    setScreen("request");
  };

  const startPilotAction = () => {
    if (!form.question.trim()) {
      setError(true);
      document.getElementById("practical-question")?.focus();
      return;
    }
    if (!form.deidentifiedAttestation) {
      setPrivacyError(true);
      document.getElementById("deidentified-attestation")?.focus();
      return;
    }
    if (!form.phase) {
      setScreen("clarify");
      return;
    }
    completePilotAction();
  };

  const newQuestion = () => {
    window.clearTimeout(timerRef.current);
    setForm(EMPTY_FORM);
    setError(false);
    setPrivacyError(false);
    setRequestPacket(null);
    setActiveBrief(null);
    setBriefOrigin("");
    setImportErrors([]);
    setScreen("intake");
  };

  const refineQuestion = () => {
    setScreen("intake");
  };

  return (
    <div className="prototype-app">
      <BrandHeader hasBrief={screen === "brief" || screen === "request"} onNewQuestion={newQuestion} />
      {screen === "intake" && (
        <IntakeScreen
          form={form}
          setField={setField}
          onUseDemo={() => {
            setForm(DEMO_FORM);
            setError(false);
            setPrivacyError(false);
            setImportErrors([]);
          }}
          onStart={startPilotAction}
          error={error}
          privacyError={privacyError}
          isDemo={form.question.trim() === DEMO_FORM.question}
          onOpenBrief={openBriefFile}
          importErrors={importErrors}
        />
      )}
      {screen === "clarify" && (
        <ClarificationScreen form={form} onChoose={completePilotAction} onBack={() => setScreen("intake")} />
      )}
      {screen === "loading" && <LoadingScreen />}
      {screen === "brief" && activeBrief && (
        <BriefScreen
          sourceBrief={activeBrief}
          isImported={briefOrigin === "imported"}
          onRefine={refineQuestion}
        />
      )}
      {screen === "request" && requestPacket && (
        <RequestReadyScreen
          request={requestPacket}
          onDownload={() => downloadJson(`${requestPacket.requestId}.json`, requestPacket)}
          onNewQuestion={newQuestion}
        />
      )}
      <footer className="prototype-footer">
        <span>Ask the Library concierge-pilot prototype</span>
        <span>No authentication · No AI request · Local files only</span>
      </footer>
    </div>
  );
}
