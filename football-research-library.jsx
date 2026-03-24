const GITHUB_URL = "https://raw.githubusercontent.com/Erash11/baylor-sport-science-library/main/papers.json";
const PENDING_KEY = "fb-research-lib-pending-v1";
const OLD_KEY = "fb-research-lib-v2";
const SCHEMA_FIELDS = ["id","year","citation","doi","driveUrl","abstract","tldr","methods","findings","limitations","practicalImplications","athleteDev","rtp"];

import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_PAPERS = [
  {
    id: "1", year: 2025,
    citation: "Baylor Applied Sport Science. DEXA Data in Football Analytics: The Gridiron Blueprint.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1gxa6u7lbla3P7c_g26kQUl_K8t3YBLkbCBXtL5vEo8c/edit",
    abstract: "This framework transforms DEXA scanning from a simple body composition snapshot into a longitudinal predictive model for collegiate football. By engineering novel metrics from serial scans across 100+ football athletes over multiple seasons, it establishes positional body composition fingerprints, quantifies the metabolic cost of a football season through lean mass changes, and introduces composite scores for developmental potential and injury resilience. Key innovations include the Developmental Headroom metric, Core-to-Limb Armor Ratio, and In-Season Catabolic Cost tracking.",
    tldr: "DEXA data becomes a predictive engine when you track rate of change over time instead of just snapshots. First-year lean mass trajectory predicts starter status better than any baseline measurement. The In-Season Catabolic Cost and Core-to-Limb Armor Ratio are new KPIs your nutrition and S&C staff should be tracking.",
    methods: "Longitudinal DEXA analysis across multiple seasons; positional cohort modeling; novel metric engineering (Developmental Headroom, Catabolic Cost, Core-to-Limb Armor Ratio, Developmental Potential Score); statistical modeling of body composition trajectories vs. performance outcomes.",
    findings: "Rate of lean mass change in the first year is a stronger predictor of eventual starter status than any baseline body composition measurement. Bone mineral density declines serve as early markers of systemic overtraining. Visceral adipose tissue spikes during injury rehabilitation create an inflammatory environment that slows healing. Position-specific body composition fingerprints provide actionable benchmarks for recruiting evaluation.",
    limitations: "Internal research document based on a single program's data; positional fingerprints may not generalize across offensive/defensive schemes; DEXA availability and cost limit widespread adoption; longitudinal tracking requires multi-year commitment before predictive models stabilize.",
    practicalImplications: "Track each athlete's rate of lean mass change during their first year as a primary developmental KPI. Calculate In-Season Catabolic Cost (lean mass lost during the competitive season) as a performance indicator for nutrition and S&C staff. Monitor VAT during injury rehab periods. Use the Core-to-Limb Armor Ratio rather than total body mass when evaluating lineman readiness.",
    athleteDev: "Use Developmental Potential Score during recruiting evaluations to project a player's physical ceiling. Stop telling linemen to just 'get bigger' and start targeting core and hip density. Build positional body composition fingerprints as benchmarks for incoming players.",
    rtp: "Monitor VAT spikes during injury rehab as they create inflammatory conditions that slow healing. Track bone mineral density trends as early warning signals for systemic overtraining. Use bilateral DEXA asymmetry flags to identify compensation patterns before they become secondary injuries."
  },
  {
    id: "2", year: 2025,
    citation: "Baylor Applied Sport Science. An Evidence-Based Physical Evaluation Framework for Incoming Collegiate American Football Athletes.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1Q99FyXYrk_hV1P78NrVRw1zpF7Zcc4aGEO3qsbgWQ7E/edit",
    abstract: "A comprehensive seven-pillar physical evaluation framework for incoming football athletes (recruits and transfers) using force plates, markerless motion capture, DEXA, and groin strength testing. It synthesizes the evidence on CMJ, IMTP, drop jumps, hip adductor/abductor ratios, and movement screening to replace outdated testing batteries with validated, technology-driven assessments covering Maximal Strength, Explosive Power, Reactive Strength, Movement Efficiency, Body Composition, Musculoskeletal Integrity, and Static Movement Quality.",
    tldr: "Replace your outdated combine-style testing with a seven-pillar evaluation using force plates, markerless motion capture, and DEXA. The groin adductor strength threshold of <465 N is a validated red flag for injury risk. Single-leg CMJ asymmetry and hip adductor/abductor ratios provide more actionable data than any pro agility time ever will.",
    methods: "Literature synthesis of force plate (CMJ, IMTP, drop jump), markerless motion capture (sprint and COD kinematics), DEXA body composition, and groin strength testing protocols; framework development integrating seven assessment domains.",
    findings: "CMJ and IMTP provide reliable, valid measures of explosive power and maximal strength with strong test-retest reliability. Groin adductor strength below 465 N is a validated threshold for elevated injury risk. Single-leg CMJ asymmetry indexes detect bilateral deficits that traditional testing misses. Markerless motion capture during sprints and COD provides movement quality data without lab constraints.",
    limitations: "Framework requires significant technology investment (force plates, markerless motion capture, DEXA); normative data is program-specific and requires calibration period; transfer portal athletes may have limited baseline data; single assessment point captures state not trait.",
    practicalImplications: "Build incoming player evaluation around seven pillars: Maximal Strength (IMTP), Explosive Power (CMJ), Reactive Strength (Drop Jump), Movement Efficiency (markerless motion capture), Body Composition (DEXA), Musculoskeletal Integrity (groin strength + single-leg CMJ asymmetry), and Static Movement Quality (overhead squat via motion capture). Prioritize groin strength screening for all incoming players.",
    athleteDev: "Use the seven-pillar profile to create individualized development plans for each incoming athlete. Identify the weakest pillar and prioritize it in offseason programming. Track pillar scores longitudinally to quantify physical development across a career.",
    rtp: "Use the incoming evaluation as the pre-injury baseline for all RTP decisions. Groin adductor strength <465 N at any point should trigger a modified training plan. Single-leg CMJ asymmetry >15% post-injury should delay full clearance regardless of other tests."
  },
  {
    id: "3", year: 2025,
    citation: "Baylor Applied Sport Science. SpeedSig: From Practitioner's Problem to Validated Product (Review of Weber et al.).",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1awkRNvPwhBtM1mmnLGm0aD7CGwqKjOl9d3lSozHY3TA/edit",
    abstract: "A research deep dive into SpeedSig, an Australian SaaS analytics platform that repurposes existing Catapult or STATSports GPS hardware (repositioned from thoracic to lumbar spine via custom belt) to generate biomechanical 'Speed Signatures.' The review covers peer-reviewed validation studies showing 'Good' validity (ICC 0.83) for ground contact time against force plates and 'Excellent' field reliability (ICC 0.91-0.92).",
    tldr: "SpeedSig turns your existing GPS hardware into a biomechanics tool by repositioning it to the lumbar spine. Its ground contact time metric is validated against force plates (ICC 0.83) with excellent field reliability (ICC 0.91-0.92). No new hardware purchase required. The real value is in rehab and RTP: objective, on-field biomechanical data showing whether an athlete is truly moving like their healthy self.",
    methods: "Review of peer-reviewed validation studies; ICC analysis for concurrent validity against force plates; test-retest reliability assessment in field conditions; biomechanical signal processing from lumbar-mounted IMU data.",
    findings: "Ground contact time validity rated 'Good' (ICC 0.83) against force plates. Field reliability rated 'Excellent' (ICC 0.91-0.92). Lumbar placement enables 3D profiling of spine, pelvis, and legs independently during running. Software generates individualized 'Speed Signatures' that can be compared pre/post injury for objective RTP assessment.",
    limitations: "Validation studies primarily on straight-line running; limited peer-reviewed data on multidirectional movements; requires custom lumbar belt (proprietary); algorithm details are proprietary; still emerging technology with a small but growing evidence base.",
    practicalImplications: "Move one GPS unit from the thoracic mount to a custom lumbar belt during warm-ups to generate biomechanical data. Use ground contact time, stiffness, and efficiency metrics to track movement quality during rehab progressions. Compare post-injury Speed Signatures to healthy baselines for objective RTP clearance.",
    athleteDev: "Establish healthy Speed Signatures for each athlete during preseason as a baseline for longitudinal monitoring. Use asymmetry and efficiency metrics to identify movement pattern changes that may indicate fatigue accumulation or developing compensation strategies.",
    rtp: "This is SpeedSig's primary value. When an athlete passes strength tests but something still 'looks off,' SpeedSig quantifies what the coaching staff is seeing. Compare post-injury Speed Signatures to the athlete's healthy baseline to verify they are truly moving the way they need to on the field."
  },
  {
    id: "4", year: 2025,
    citation: "Baylor Applied Sport Science. The NIRS-Enhanced Return-to-Play Framework: MOXY Monitor for Football RTP.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1XBVEmXgZUTtte581qQC-4n5ZEzvMJ_h_EkYyfAY9sqs/edit",
    abstract: "A four-phase RTP framework using MOXY near-infrared spectroscopy (NIRS) sensors to objectively track local muscle oxygen saturation (SmO2) and total hemoglobin (THb) during rehabilitation. Provides a non-invasive, real-time window into muscle metabolism. Phase 1 covers early rehab bilateral monitoring, Phase 2 adds loaded movement patterns, Phase 3 introduces sport-specific conditioning, and Phase 4 validates full-contact readiness against pre-injury baselines.",
    tldr: "Put a MOXY sensor on the same muscle of both legs during rehab. The uninjured leg is your real-time control. If the injured quad only desaturates 5% during a leg extension while the healthy side drops 20%, the athlete is offloading even if they say it 'feels fine.' SmO2 reoxygenation time between efforts is your primary metric for between-play recovery capacity.",
    methods: "Four-phase protocol design using bilateral MOXY NIRS monitoring; SmO2 and THb signal analysis during therapeutic exercises; reoxygenation rate calculations; pre-injury vs. post-injury NIRS signature comparison framework.",
    findings: "Bilateral NIRS monitoring during early rehab reveals offloading patterns invisible to visual observation. SmO2 desaturation magnitude reflects true muscular work capacity, not just force production. Reoxygenation time between efforts directly correlates with between-play recovery capacity. Sport-specific drill NIRS signatures can be compared to pre-injury baselines.",
    limitations: "MOXY sensors are relatively new to team sport settings; limited normative data for football-specific exercises; sensor placement and skin pigmentation can affect signal quality; requires pre-injury baseline data; cost per unit may limit bilateral monitoring across a full roster.",
    practicalImplications: "Implement bilateral MOXY monitoring from Phase 1 of rehab. Use SmO2 desaturation magnitude (not just force output) to assess true muscular engagement. Track reoxygenation time as the primary metric for between-play recovery capacity. Compare sport-specific drill NIRS signatures to pre-injury baselines before clearing for full contact.",
    athleteDev: "Establish healthy NIRS profiles during preseason testing. Use SmO2 response patterns during conditioning to identify athletes with poor local muscular endurance who may benefit from targeted aerobic development work at the tissue level.",
    rtp: "The core use case. Bilateral NIRS monitoring catches compensation and offloading patterns that strength tests miss. An athlete who produces adequate force but does so through altered metabolic strategies is not truly ready. Do not clear based on strength alone."
  },
  {
    id: "5", year: 2025,
    citation: "Baylor Applied Sport Science. S2 Cognition in College Football.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1C-PQweNLIWK4cI2YGt7SyAAyktivcxa7yGO0Sska1Qo/edit",
    abstract: "Analysis of S2 Cognition's nine-domain cognitive assessment platform for collegiate football applications. S2 measures perception speed, tracking capacity, decision complexity, impulse control, and five other game-speed cognitive skills. Peer-reviewed research shows football players demonstrate measurable cognitive advantages over non-athletes. For QBs, S2 overall score explains 28.7% of career passer rating variance (vs. Wonderlic at 0.01%). For WRs, Search Efficiency and Impulse Control account for 72.2% of drop rate variance.",
    tldr: "S2 Cognition quantifies the 'intangibles' coaches talk about. The QB overall score explains 28.7% of passer rating variance, making the Wonderlic's 0.01% look irrelevant. For receivers, Search Efficiency and Impulse Control predict 72.2% of drop rate variance. Use it as a tie-breaker in recruiting and as a diagnostic tool for player development.",
    methods: "Review of S2 Cognition validation studies; regression analysis of cognitive scores vs. on-field performance metrics (passer rating, drop rate); position-specific cognitive profiling; comparison to Wonderlic.",
    findings: "S2 overall score explains 28.7% of career passer rating variance for QBs. Wonderlic explains only 0.01%. WR Search Efficiency and Impulse Control predict 72.2% of drop rate variance. Collegiate football players show cognitive advantages over non-athletes. Position-specific cognitive profiles emerge with meaningful differences.",
    limitations: "S2 is a proprietary commercial product; independent replication is limited; sample sizes in published validation studies are moderate; cognitive profiles may interact with scheme complexity; cost per assessment limits roster-wide deployment.",
    practicalImplications: "Use S2 as a tie-breaker in recruiting, not standalone. When a receiver keeps dropping balls in traffic, check his Search Efficiency score. If low, design drills with deliberate visual clutter rather than saying 'focus harder.' Use cognitive profiles for scheme-fit analysis.",
    athleteDev: "Design position-specific cognitive development drills based on S2 profiles. If QBs score low on Decision Complexity, simplify read progressions or lean into RPO concepts. Build 'chaos catching' drills for WRs with low Search Efficiency scores.",
    rtp: "Post-concussion S2 reassessment provides an objective cognitive baseline comparison beyond standard ImPACT testing. Domain-specific declines from pre-injury baseline can inform targeted cognitive rehabilitation activities."
  },
  {
    id: "6", year: 2025,
    citation: "Baylor Applied Sport Science. Wearable Resistance Training Program Review: Exogen for Football.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1M8YxaAGKFp5-ALTgP1_3qYjl6erQ4GA7ErLVxEsAskI/edit",
    abstract: "Review of wearable resistance (WR) technology, specifically Exogen, for speed and COD training in elite football. WR applied to the limbs at 1-5% body mass provides highly specific overload for sprint and COD work. Distal (shank) placement creates greater rotational inertia than proximal (thigh), specifically overloading the deceleration/braking phase of cutting. 8-week warm-up integration improved 10m and 20m sprint times by ~2% without impairing subsequent training quality.",
    tldr: "Exogen calf sleeves integrated into warm-ups 2-3x/week at 1-5% body mass improve sprint times by about 2% over 8 weeks without hurting session quality. Start proximal (near knee) at 200g for weeks 1-3, then go distal (near ankle) at 400-600g in weeks 5-8. Use contrast sets: one loaded rep, then one unloaded at max intent. This is your in-season speed 'microdosing' strategy.",
    methods: "Literature review of wearable resistance research; RCT data from 8-week warm-up integration protocols; biomechanical analysis of proximal vs. distal load placement; effect size calculations for sprint and COD improvements.",
    findings: "8-week warm-up integration improved 10m and 20m sprint times by ~2%. Distal placement specifically overloads the deceleration/braking phase. WR at 1-5% body mass does not impair subsequent training quality. Contrast sets produce acute post-activation potentiation. 180-degree COD showed greatest responsiveness.",
    limitations: "Most WR research conducted in soccer and rugby, not American football specifically; long-term (>8 week) retention unclear; optimal loading may vary by position and body mass; limited injury risk data; athlete compliance with placement matters.",
    practicalImplications: "Integrate Exogen calf sleeves into RAMP warm-ups 2-3 days/week. Progressive loading: proximal at 200g (weeks 1-3), distal at 400-600g (weeks 5-8). Use contrast sets for acute potentiation. In-season compatible strategy that builds speed without gym fatigue.",
    athleteDev: "Use WR as a 'speed microdosing' tool during in-season when gym-based power training volume is reduced. Prioritize 180-degree COD work for DBs and WRs. Build position-specific WR warm-up templates.",
    rtp: "Introduce WR progressively during late-stage RTP as a movement quality challenge. If an athlete compensates under added rotational inertia, they are not ready for full-speed demands. Use as a stress test for movement quality in the final RTP phase."
  },
  {
    id: "7", year: 2025,
    citation: "Baylor Applied Sport Science. L5-S1 Rehab Protocol: Criterion-Based RTP for Post-Microdiscectomy DL.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1BNys-bC7E0SS2S6nX502BMu-SNXp6np1dtGVpgrWmxE/edit",
    abstract: "A detailed, two-phase rehab protocol for an elite DL with persistent S1 myotomal weakness after lumbar microdiscectomy. Phase I uses NMES + BFR training for neural drive and atrophy with spine-sparing loads. Phase II integrates unilateral resistance training (trap bar DL, single-leg RDLs), criterion-based plyometric progression, and position-specific 'get-off' retraining. RTP clearance requires a multi-domain scorecard: isokinetic strength >90% LSI, functional hops, 3D motion analysis, and I-PRRS >60.",
    tldr: "The biggest risk after disc surgery isn't re-herniation. It's secondary injuries from compensation caused by S1 weakness. A pain-free athlete is not a ready athlete. Use NMES + voluntary contractions to restore neural drive first, then BFR at 20-30% 1RM for hypertrophy without spinal load. Use trap bar DL for all post-op athletes. Never clear on time alone. Use the RTP scorecard.",
    methods: "Case-study protocol design; two-phase progressive rehab; NMES + BFR integration; criterion-based milestones; multi-domain RTP scorecard (isokinetic LSI, functional hops, 3D motion analysis, I-PRRS).",
    findings: "NMES + voluntary contraction restores neural drive faster than voluntary training alone. BFR at 20-30% 1RM produces hypertrophic adaptations without spinal compressive loads. Trap bar DL reduces spinal flexion vs. conventional. Multi-domain scorecard (>90% LSI, hop symmetry, 3D clearance, I-PRRS >60) provides comprehensive readiness assessment.",
    limitations: "Single case study limits generalizability; optimal NMES parameters for S1 myotome not well established; BFR cuff placement near surgical site needs careful consideration; I-PRRS has limited football-specific validation.",
    practicalImplications: "Pair NMES with voluntary contractions in Phase I for all neural drive deficits post-spine surgery. BFR at 20-30% 1RM during early strength phases. Trap bar DL replaces conventional for all post-disc athletes. Multi-domain RTP scorecard is mandatory. Never use time-based clearance.",
    athleteDev: "Development plans after spine surgery must account for neural drive deficit as a rate limiter. Progressive overload timelines will be longer than for musculotendinous injuries. Communicate adjusted expectations clearly to coaching staff.",
    rtp: "Full scorecard: isokinetic >90% LSI, functional hop symmetry, 3D motion analysis showing no compensatory patterns, I-PRRS >60. The biggest clinical mistake is clearing a pain-free athlete who still has measurable S1 weakness. Secondary injuries from compensation are the real threat."
  },
  {
    id: "8", year: 2025,
    citation: "Baylor Applied Sport Science. The Gridiron Blueprint: Actionable Summary for Coaches and Sports Dietitians.",
    doi: "",
    driveUrl: "https://docs.google.com/document/d/1iJ4UV-XxeLrYuB3jQEZlaVobHseVkUFgR3NsD1swr2w/edit",
    abstract: "A coach and dietitian-friendly summary of the full Gridiron Blueprint research. Distills key analytics into three actionable tools: Data-Driven Positional Fingerprints, the Developmental Potential Score (DPS), and the Injury Resilience Dashboard. Rate of change beats baseline measurements for predicting success. In-Season Catabolic Cost is a staff KPI. Declining bone density is an early warning for systemic overtraining.",
    tldr: "Hand this document to your coaches and dietitians. It translates complex body composition analytics into three tools they can use immediately. Biggest coaching takeaway: stop telling linemen to 'get bigger' and start targeting core and hip density. Biggest nutrition takeaway: track VAT during injury rehab because visceral fat spikes create inflammation that slows healing.",
    methods: "Knowledge translation document synthesizing longitudinal DEXA research into practitioner-friendly frameworks; three applied tools (Positional Fingerprints, Developmental Potential Score, Injury Resilience Dashboard).",
    findings: "Rate of change outperforms static baselines for predicting development. In-Season Catabolic Cost varies significantly by position and nutritional support quality. Core-to-Limb Armor Ratio is more meaningful than total mass for lineman readiness. Declining bone mineral density precedes other markers of systemic overtraining.",
    limitations: "Based on single program's research; tools require DEXA access and longitudinal data; positional fingerprints need program-specific calibration; DPS has not been independently validated.",
    practicalImplications: "Distribute to coaching and nutrition staff as an executive summary. Use three tools immediately. Make In-Season Catabolic Cost a nutrition staff KPI. Stop using total body mass as a lineman readiness metric.",
    athleteDev: "Use DPS during recruiting to project physical ceiling. Build positional fingerprints as benchmarks. Track first-year rate of lean mass change as the primary developmental metric.",
    rtp: "The Injury Resilience Dashboard integrates body composition signals (asymmetry, bone density, VAT) into a single view for medical and performance staff. VAT monitoring during rehab should be standard protocol."
  }
];

const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

export default function FootballResearchLibrary() {
  const [papers, setPapers] = useState([]);          // merged: github + pending (with runtime source tags)
  const [pendingPapers, setPendingPapers] = useState([]); // pending subset only (no source tag)
  const [fetchFailed, setFetchFailed] = useState(false);
  const [loadComplete, setLoadComplete] = useState(false);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortCol, setSortCol] = useState("year");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [showPendingPanel, setShowPendingPanel] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    citation:"",doi:"",driveUrl:"",year:"2025",abstract:"",tldr:"",
    methods:"",findings:"",limitations:"",practicalImplications:"",athleteDev:"",rtp:""
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("fb-research-lib-v2", true);
        if (r?.value) { const s = JSON.parse(r.value); if (s.length > 0) { setPapers(s); setLoadComplete(true); return; } }
      } catch (e) {}
      setPapers(DEFAULT_PAPERS);
      try { await window.storage.set("fb-research-lib-v2", JSON.stringify(DEFAULT_PAPERS), true); } catch (e) {}
      setLoadComplete(true);
    })();
  }, []);

  const save = useCallback(async (u) => {
    setPapers(u);
    try { await window.storage.set("fb-research-lib-v2", JSON.stringify(u), true); } catch (e) {}
  }, []);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);

  const filtered = papers.filter(p => {
    if (yearFilter !== "all" && p.year !== Number(yearFilter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [p.citation,p.abstract,p.tldr,p.findings,p.practicalImplications,p.athleteDev,p.rtp,p.methods,p.doi]
      .some(f => f && f.toLowerCase().includes(q));
  }).sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortCol === "year") return (a.year - b.year) * dir;
    return (a[sortCol]||"").localeCompare(b[sortCol]||"") * dir;
  });

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const cols = ["citation","doi","year","abstract","tldr","methods","findings","limitations","practicalImplications","athleteDev","rtp"];
    const headers = ["Citation & DOI","DOI","Year","Summarized Abstract","TL;DR","Methods Used","Findings","Limitations","Practical Implications","Football Athlete Development","Football Return to Play"];
    const esc = v => `"${String(v||"").replace(/"/g,'""')}"`;
    const rows = [headers.join(","), ...filtered.map(p => cols.map(c => esc(p[c])).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Baylor_FB_Research_Library_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); flash("CSV exported!");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const np = { ...uploadForm, id: Date.now().toString(), year: Number(uploadForm.year) };
    await save([np, ...papers]);
    setUploadForm({citation:"",doi:"",driveUrl:"",year:"2025",abstract:"",tldr:"",methods:"",findings:"",limitations:"",practicalImplications:"",athleteDev:"",rtp:""});
    setShowUpload(false); flash("Paper added to the library!");
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity: 0.35, marginLeft: 4, fontSize: 11 }}>⇅</span>;
    return <span style={{ marginLeft: 4, fontSize: 11 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const COLS = [
    { key: "citation", label: "Citation & DOI", w: 240 },
    { key: "year", label: "Year", w: 72 },
    { key: "abstract", label: "Summarized Abstract", w: 300 },
    { key: "tldr", label: "TL;DR", w: 270 },
    { key: "methods", label: "Methods Used", w: 250 },
    { key: "findings", label: "Findings", w: 270 },
    { key: "limitations", label: "Limitations", w: 250 },
    { key: "practicalImplications", label: "Practical Implications", w: 270 },
    { key: "athleteDev", label: "Football Athlete Development", w: 270 },
    { key: "rtp", label: "Football Return to Play", w: 270 },
  ];

  const th = { padding: "11px 14px", textAlign: "left", fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.18)", position: "sticky", top: 0, zIndex: 2, background: "#1565C0" };
  const td = { padding: "13px 14px", fontSize: 12.5, lineHeight: 1.65, color: "#2a2a2a", borderRight: "1px solid #EDE9E3", verticalAlign: "top", borderBottom: "1px solid #EDE9E3" };
  const inp = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 5, border: "1px solid #d0ccc5", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 4 };

  if (!loadComplete) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5", fontFamily: "'DM Sans',sans-serif" }}><p>Loading research library...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a" }}>
      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000, background: "#003A2B", color: "#fff", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #003A2B 0%, #00563F 35%, #1B7A5A 100%)", padding: "44px 24px 36px", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏈</div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, margin: 0, lineHeight: 1.2 }}>Football Sport Science<br/>Research</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 12, fontWeight: 300 }}>Comprehensive analysis of {papers.length} research sources on performance, injuries, training, recovery, and athlete development</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>Curated by: Baylor Applied Performance</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, methods, findings..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 6, border: "1px solid #d0ccc5", background: "#fff", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a", outline: "none" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>Year:</span>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid #d0ccc5", background: "#fff", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={exportCSV} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: "#C62828", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>📋 Export to CSV</button>
        <button onClick={() => setShowUpload(!showUpload)} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: showUpload ? "#555" : "#003A2B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          {showUpload ? "✕ Cancel" : "+ Add Paper"}
        </button>
      </div>

      {/* Upload */}
      {showUpload && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #d0ccc5", borderRadius: 10, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, margin: "0 0 16px" }}>Add a New Research Paper</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{k:"citation",l:"Citation *",span:true,req:true},{k:"doi",l:"DOI"},{k:"year",l:"Year *",req:true},{k:"driveUrl",l:"Google Drive / URL Link",span:true}].map(f =>
                <div key={f.k} style={{ gridColumn: f.span?"1/-1":"auto" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>{f.l}</label>
                  <input value={uploadForm[f.k]} onChange={e => setUploadForm(p=>({...p,[f.k]:e.target.value}))} required={f.req} style={inp} />
                </div>
              )}
              {[{k:"abstract",l:"Summarized Abstract *",req:true},{k:"tldr",l:"TL;DR *",req:true},{k:"methods",l:"Methods Used"},{k:"findings",l:"Findings"},{k:"limitations",l:"Limitations"},{k:"practicalImplications",l:"Practical Implications *",req:true},{k:"athleteDev",l:"Football Athlete Development"},{k:"rtp",l:"Football Return to Play"}].map(f =>
                <div key={f.k} style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>{f.l}</label>
                  <textarea value={uploadForm[f.k]} onChange={e => setUploadForm(p=>({...p,[f.k]:e.target.value}))} required={f.req} rows={2} style={{ ...inp, resize: "vertical" }} />
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button onClick={handleUpload} style={{ padding: "9px 20px", borderRadius: 6, border: "none", background: "#003A2B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Save to Library</button>
              <button onClick={() => setShowUpload(false)} style={{ padding: "9px 20px", borderRadius: 6, border: "1px solid #d0ccc5", background: "#fff", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #d0ccc5", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 2500, background: "#fff" }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 40, cursor: "default", textAlign: "center" }}>#</th>
                {COLS.map(c => <th key={c.key} onClick={() => toggleSort(c.key)} style={{ ...th, width: c.w, minWidth: c.w }}>{c.label}<SortIcon col={c.key} /></th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={COLS.length+1} style={{ padding: 40, textAlign: "center", color: "#999" }}>No papers match your search.</td></tr>
              ) : filtered.map((p, i) => {
                const bg = i%2===0 ? "#fff" : "#FAF7F2";
                const bgAlt = i%2===0 ? "#FAFAFA" : "#F5F2EC";
                return (
                  <tr key={p.id} style={{ background: bg }}>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700, color: "#1565C0", fontSize: 14 }}>{i+1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, lineHeight: 1.45, marginBottom: 4 }}>{p.citation}</div>
                      {p.doi && <div style={{ fontSize: 11, color: "#1565C0" }}>DOI: {p.doi}</div>}
                      <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                        {p.driveUrl && <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#1565C0", textDecoration: "none", fontWeight: 600 }}>Open →</a>}
                        <button onClick={() => { save(papers.filter(x=>x.id!==p.id)); flash("Removed."); }} style={{ fontSize: 10, color: "#C62828", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: 0 }}>Remove</button>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700 }}><span style={{ background: "#E3F2FD", color: "#1565C0", padding: "3px 9px", borderRadius: 4, fontSize: 13 }}>{p.year}</span></td>
                    <td style={td}>{p.abstract}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{p.tldr}</td>
                    <td style={td}>{p.methods}</td>
                    <td style={td}>{p.findings}</td>
                    <td style={td}>{p.limitations}</td>
                    <td style={td}>{p.practicalImplications}</td>
                    <td style={{ ...td, background: bgAlt }}>{p.athleteDev}</td>
                    <td style={{ ...td, background: bgAlt }}>{p.rtp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#aaa" }}>Baylor Athletics · Applied Performance · Shared storage enabled for all staff</p>
      </div>

      <style>{`
        input:focus,textarea:focus,select:focus{border-color:#1565C0!important;outline:none;box-shadow:0 0 0 2px rgba(21,101,192,0.1)}
        ::-webkit-scrollbar{height:8px;width:6px}
        ::-webkit-scrollbar-track{background:#f0ede7}
        ::-webkit-scrollbar-thumb{background:#c0bbb3;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#999}
      `}</style>
    </div>
  );
}
