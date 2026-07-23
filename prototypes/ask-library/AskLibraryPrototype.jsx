import { useEffect, useRef, useState } from "react";

const EMPTY_FORM = {
  question: "",
  population: "",
  sport: "",
  phase: "",
  outcome: "",
  constraints: "",
};

const DEMO_FORM = {
  question: "How should we structure training and recovery between two competitions inside 96 hours?",
  population: "Collegiate starters and high-minute players",
  sport: "Team sport",
  phase: "Between competitions (<96 hours)",
  outcome: "Preserve readiness without losing tactical preparation",
  constraints: "Travel after the first competition; one field session available",
};

const SOURCES = [
  {
    id: "448",
    year: 2021,
    citation:
      "Julian R, Page RM, Harper LD. The effect of fixture congestion on performance during professional male soccer match-play: A systematic critical review with meta-analysis. Sports Medicine. 2021;51(2):255–273.",
    doi: "10.1007/s40279-020-01359-9",
    url: "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/The%20effect%20of%20fixture%20congestion%20on%20performance%20during%20professional%20male%20soccer%20match%20play%20-%20A%20systematic%20critical%20review%20with%20meta-analysis.pdf",
    supports:
      "Total match distance was generally maintained during congestion, while other physical and tactical outcomes were inconsistent.",
  },
  {
    id: "455",
    year: 2021,
    citation:
      "Simmons R, Doma K, Sinclair W, Connor J, Leicht A. Acute effects of training loads on muscle damage markers and performance in semi-elite and elite athletes: A systematic review and meta-analysis. Sports Medicine. 2021;51(10):2181–2207.",
    doi: "10.1007/s40279-021-01486-x",
    url: "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/Acute%20effects%20of%20training%20loads%20on%20muscle%20damage%20markers%20and%20performance%20in%20semi-elite%20and%20elite%20athletes%20-%20A%20systematic%20review%20and%20meta-analysis.pdf",
    supports:
      "Muscle-damage and performance responses varied across settings; one biomarker should not function as an individual readiness diagnosis.",
  },
  {
    id: "457",
    year: 2019,
    citation:
      "Roberts SSH, Teo WP, Warmington SA. Effects of training and competition on the sleep of elite athletes: A systematic review and meta-analysis. British Journal of Sports Medicine. 2019;53(8):513–522.",
    doi: "10.1136/bjsports-2018-099322",
    url: "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/Effects%20of%20training%20and%20competition%20on%20the%20sleep%20of%20elite%20athletes-%20a%20systematic%20review%20and%C2%A0meta-analysis.pdf",
    supports:
      "Competition, early training, abrupt load increases, and difficult travel timing were recurring schedule-level sleep risks.",
  },
];

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
        <span className="prototype-flag">Interaction prototype</span>
        <span className="private-label">
          <LockIcon /> Staff workspace
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

function IntakeScreen({ form, setField, onUseDemo, onStart, error }) {
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

      <div className="intake-ledger">
        <section className="question-sheet" aria-labelledby="question-heading">
          <div className="sheet-heading">
            <div>
              <span className="sheet-index">01</span>
              <h2 id="question-heading">What decision are you facing?</h2>
            </div>
            <button className="text-action" type="button" onClick={onUseDemo}>
              Use congested-week example
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

          <div className="intake-submit-row">
            <div className="privacy-note">
              <LockIcon />
              <span>Private to you unless you deliberately share or submit the brief for review.</span>
            </div>
            <button className="primary-action" type="button" onClick={onStart}>
              Build decision brief <ArrowIcon />
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
              <strong>549</strong>
              <span>published sources</span>
            </div>
            <div>
              <strong>142</strong>
              <span>full-text reviewed</span>
            </div>
          </div>
          <p className="contract-footnote">Prototype counts reflect the July 22, 2026 repository audit.</p>
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

function ConfidenceRationale() {
  return (
    <div className="confidence-grid">
      <div>
        <span>Source review</span>
        <strong>3 full-text-reviewed records</strong>
      </div>
      <div>
        <span>Directness</span>
        <strong>One congestion review; two broader recovery reviews</strong>
      </div>
      <div>
        <span>Consistency</span>
        <strong>Aligned on context; no universal dose rule</strong>
      </div>
      <div>
        <span>Transferability</span>
        <strong>Professional and elite cohorts, not Baylor-specific</strong>
      </div>
    </div>
  );
}

function SourceCard({ source, index }) {
  return (
    <article className="source-card">
      <div className="source-number">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <div className="source-meta">
          Library ID {source.id} · {source.year} · Full-text reviewed
        </div>
        <h3>{source.citation}</h3>
        <p><strong>Supports:</strong> {source.supports}</p>
        <div className="source-links">
          <a href={source.url} target="_blank" rel="noreferrer">Open original source ↗</a>
          <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noreferrer">DOI ↗</a>
        </div>
      </div>
    </article>
  );
}

function ControlledShareDialog({ onClose, createdDate }) {
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
          <div className="share-status">On-Demand · Not Expert-Reviewed</div>
          <strong>Competition congestion: between-match training and recovery</strong>
          <span>Created {createdDate} · Moderate confidence · 3 supporting sources</span>
        </div>
        <p>
          A real controlled share would require Baylor authentication and retain the question, Decision Context, confidence rationale, citations, and current version.
        </p>
        <button className="primary-action full" type="button" onClick={onClose}>Close preview</button>
      </section>
    </div>
  );
}

function BriefScreen({ form, onRefine }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewState, setReviewState] = useState("idle");
  const [useful, setUseful] = useState("");
  const [influence, setInfluence] = useState("");
  const createdDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const contextItems = [form.population, form.sport, form.phase, form.outcome, form.constraints].filter(Boolean);

  return (
    <main id="top" className="brief-page">
      <section className="brief-masthead">
        <div>
          <div className="section-kicker">On-Demand Brief / Not Expert-Reviewed</div>
          <h1>{form.question}</h1>
          <div className="context-line">
            {contextItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="brief-actions">
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
            <strong>On-demand</strong>
            <small>{createdDate}</small>
          </div>
          <nav>
            <a href="#decision">Decision</a>
            <a href="#action">Action</a>
            <a href="#boundaries">Boundaries</a>
            <a href="#evidence">Evidence</a>
          </nav>
          <div className="prototype-note">Example content drawn from published records 448, 455, and 457.</div>
        </aside>

        <article className="decision-brief">
          <div className="evidence-spine" aria-hidden="true" />

          <section id="decision" className="brief-section decision-section">
            <div className="brief-section-label">Decision</div>
            <div className="confidence-lockup">
              <div className="confidence-tier">
                <span>Evidence confidence</span>
                <strong>Moderate</strong>
              </div>
              <p>
                Direct congestion evidence is concentrated in professional male soccer, while the recovery evidence spans heterogeneous elite cohorts.
              </p>
            </div>

            <h2>Bottom line</h2>
            <p className="bottom-line">
              Use a recovery-priority between-match plan that protects sleep opportunity, removes nonessential load, and individualizes exposure. Stable match distance or one readiness marker does not establish complete recovery.
            </p>

            <div className="direction-block">
              <span>Recommended Direction</span>
              <p>
                Preserve only the tactical and physical work needed for the next competition. Separate athletes by recent exposure and current response, protect the available sleep window, and make the final training choice from multiple signals rather than a universal threshold.
              </p>
            </div>
          </section>

          <section id="action" className="brief-section">
            <div className="brief-section-label">Act</div>
            <h2>Put it into the week</h2>
            <div className="action-ledger">
              <div>
                <span>01</span>
                <h3>Separate exposure groups</h3>
                <p>Distinguish high-minute, low-minute, and returning athletes before assigning recovery, maintenance, or top-up work.</p>
              </div>
              <div>
                <span>02</span>
                <h3>Protect sleep opportunity</h3>
                <p>Avoid unnecessarily early work, account for travel timing, and keep required preparation focused enough to preserve recovery time.</p>
              </div>
              <div>
                <span>03</span>
                <h3>Triangulate readiness</h3>
                <p>Read recent exposure, athlete report, symptoms, and a standardized within-athlete performance measure together. Do not let one biomarker make the decision.</p>
              </div>
            </div>

            <h3 className="subsection-title">Monitoring considerations</h3>
            <div className="monitoring-table" role="table" aria-label="Monitoring considerations">
              <div role="row"><strong role="cell">Exposure</strong><span role="cell">Minutes, high-intensity actions, travel, and position demands</span></div>
              <div role="row"><strong role="cell">Recovery</strong><span role="cell">Sleep opportunity, soreness, wellness, and daytime function</span></div>
              <div role="row"><strong role="cell">Performance</strong><span role="cell">A stable within-athlete measure interpreted against normal variability</span></div>
              <div role="row"><strong role="cell">Escalate discussion</strong><span role="cell">When multiple signals deteriorate or sport function is meaningfully reduced</span></div>
            </div>
          </section>

          <section id="boundaries" className="brief-section">
            <div className="brief-section-label">Boundaries</div>
            <div className="boundary-grid">
              <div>
                <h2>Where the evidence disagrees</h2>
                <p>
                  Pooled total distance was generally maintained during fixture congestion, but other physical outputs were equivocal and tactical evidence was sparse. Maintained distance should not be treated as proof of full recovery.
                </p>
              </div>
              <div className="caution-box">
                <span>Guardrails</span>
                <ul>
                  <li>No universal congestion or readiness threshold is supported.</li>
                  <li>Returning athletes may tolerate repeated exposure differently.</li>
                  <li>Clinical concerns remain with the appropriate licensed professional.</li>
                </ul>
              </div>
            </div>

            <details className="evidence-details" open>
              <summary>Why this is Moderate confidence</summary>
              <ConfidenceRationale />
            </details>

            <details className="evidence-details">
              <summary>What could change this direction</summary>
              <ul className="detail-list">
                <li>A different competition density, travel schedule, or environmental load</li>
                <li>An athlete in a return-to-participation progression</li>
                <li>Direct collegiate, female-athlete, or sport-specific evidence</li>
                <li>Meaningful deterioration across symptoms, function, and repeated measures</li>
              </ul>
            </details>
          </section>

          <section id="evidence" className="brief-section sources-section">
            <div className="brief-section-label">Evidence</div>
            <div className="sources-heading">
              <div>
                <h2>Supporting sources</h2>
                <p>Every source below is already published and full-text reviewed in the Evidence Library.</p>
              </div>
              <span>3 sources</span>
            </div>
            <div className="source-list">
              {SOURCES.map((source, index) => <SourceCard key={source.id} source={source} index={index} />)}
            </div>
          </section>

          <section className="feedback-section" aria-labelledby="feedback-heading">
            <div>
              <div className="brief-section-label">Use signal</div>
              <h2 id="feedback-heading">Did this help the decision?</h2>
              <p>Prototype responses remain in this browser session and are not stored.</p>
            </div>
            <div className="feedback-controls">
              <fieldset>
                <legend>Was this useful?</legend>
                {[
                  ["yes", "Yes"],
                  ["no", "No"],
                ].map(([value, label]) => (
                  <button key={value} className={useful === value ? "selected" : ""} type="button" onClick={() => setUseful(value)}>{label}</button>
                ))}
              </fieldset>
              <fieldset>
                <legend>Did this influence a decision?</legend>
                {[
                  ["yes", "Yes"],
                  ["not-yet", "Not yet"],
                  ["no", "No"],
                ].map(([value, label]) => (
                  <button key={value} className={influence === value ? "selected" : ""} type="button" onClick={() => setInfluence(value)}>{label}</button>
                ))}
              </fieldset>
            </div>
          </section>
        </article>
      </div>

      {shareOpen && <ControlledShareDialog onClose={() => setShareOpen(false)} createdDate={createdDate} />}
    </main>
  );
}

export default function AskLibraryPrototype() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [screen, setScreen] = useState("intake");
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "question" && value.trim()) setError(false);
  };

  const generateBrief = (phase = form.phase) => {
    setForm((current) => ({ ...current, phase }));
    setScreen("loading");
    timerRef.current = window.setTimeout(() => setScreen("brief"), 1200);
  };

  const startBrief = () => {
    if (!form.question.trim()) {
      setError(true);
      document.getElementById("practical-question")?.focus();
      return;
    }
    if (!form.phase) {
      setScreen("clarify");
      return;
    }
    generateBrief();
  };

  const newQuestion = () => {
    window.clearTimeout(timerRef.current);
    setForm(EMPTY_FORM);
    setError(false);
    setScreen("intake");
  };

  const refineQuestion = () => {
    setScreen("intake");
  };

  return (
    <div className="prototype-app">
      <BrandHeader hasBrief={screen === "brief"} onNewQuestion={newQuestion} />
      {screen === "intake" && (
        <IntakeScreen
          form={form}
          setField={setField}
          onUseDemo={() => {
            setForm(DEMO_FORM);
            setError(false);
          }}
          onStart={startBrief}
          error={error}
        />
      )}
      {screen === "clarify" && (
        <ClarificationScreen form={form} onChoose={generateBrief} onBack={() => setScreen("intake")} />
      )}
      {screen === "loading" && <LoadingScreen />}
      {screen === "brief" && <BriefScreen form={form} onRefine={refineQuestion} />}
      <footer className="prototype-footer">
        <span>Ask the Library interaction prototype</span>
        <span>No authentication · No AI request · No data stored</span>
      </footer>
    </div>
  );
}
