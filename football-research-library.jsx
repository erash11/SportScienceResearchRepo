const GITHUB_URL = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/papers.json";
const PENDING_KEY = "fb-research-lib-pending-v1";
const OLD_KEY = "fb-research-lib-v2";
const SCHEMA_FIELDS = ["id","year","citation","doi","driveUrl","abstract","tldr","methods","findings","limitations","practicalImplications","athleteDev","rtp"];
const PAPERS_PER_PAGE = 50;

import React, { useState, useEffect, useCallback, useRef } from "react";


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
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    citation:"",doi:"",driveUrl:"",year:"2025",abstract:"",tldr:"",
    methods:"",findings:"",limitations:"",practicalImplications:"",athleteDev:"",rtp:""
  });

  const papersRef = useRef(papers);
  useEffect(() => { papersRef.current = papers; }, [papers]);

  useEffect(() => {
    (async () => {
      // ── Step 1: Fetch from GitHub ────────────────────────────────────────
      let ghPapers = [];
      let failed = false;
      try {
        const res = await fetch(GITHUB_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        ghPapers = await res.json();
      } catch (e) {
        failed = true;
      }
      setFetchFailed(failed);

      // ── Step 2: Migrate old storage key if present ───────────────────────
      try {
        const oldR = await window.storage.get(OLD_KEY, true);
        if (oldR?.value) {
          const oldArr = JSON.parse(oldR.value);
          if (Array.isArray(oldArr) && oldArr.length > 0) {
            // Read existing pending (may already have entries from prior partial migration)
            const pendR = await window.storage.get(PENDING_KEY, true);
            const existingPending = (pendR?.value ? JSON.parse(pendR.value) : null) || [];
            // Merge: existing pending takes precedence (dedup by id)
            const existingIds = new Set(existingPending.map(p => p.id));
            const fromOld = oldArr.filter(p => !existingIds.has(p.id));
            const migrated = [...existingPending, ...fromOld];
            try {
              await window.storage.set(PENDING_KEY, JSON.stringify(migrated), true);
              await window.storage.set(OLD_KEY, "[]", true); // sentinel: migration complete
            } catch (e) {
              // write failed — leave OLD_KEY untouched so next load retries
            }
          }
        }
      } catch (e) {}

      // ── Step 3: Load pending queue ───────────────────────────────────────
      let pending = [];
      try {
        const pendR = await window.storage.get(PENDING_KEY, true);
        if (pendR?.value) {
          const parsed = JSON.parse(pendR.value);
          if (Array.isArray(parsed)) pending = parsed;
        }
      } catch (e) {}

      // ── Step 4: Dedup pending against GitHub (only if fetch succeeded) ───
      // NEVER dedup against an empty array from a failed fetch — that would
      // permanently remove legitimately pending papers.
      if (!failed) {
        const ghIds = new Set(ghPapers.map(p => p.id));
        const clean = pending.filter(p => !ghIds.has(p.id));
        if (clean.length !== pending.length) {
          pending = clean;
          try {
            await window.storage.set(PENDING_KEY, JSON.stringify(pending), true);
          } catch (e) {}
        }
      }

      // ── Step 5: Merge and set state ──────────────────────────────────────
      const tagged = [
        ...ghPapers.map(p => ({ ...p, source: "github" })),
        ...pending.map(p => ({ ...p, source: "pending" })),
      ];
      setPapers(tagged);
      setPendingPapers(pending);
      setLoadComplete(true);
    })();
  }, []);

  const savePending = useCallback(async (newPending) => {
    // Read from ref to avoid stale closure when called before re-render
    const ghPapers = papersRef.current.filter(p => p.source === "github");
    const taggedPending = newPending.map(p => ({ ...p, source: "pending" }));
    setPendingPapers(newPending);
    setPapers([...ghPapers, ...taggedPending]);
    // Throws on failure — callers must handle the error
    await window.storage.set(PENDING_KEY, JSON.stringify(newPending), true);
  }, []); // no papers dependency — papersRef always has the latest value

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { setCurrentPage(1); }, [search, yearFilter]);

  const extractTitle = (citation) => {
    if (!citation) return "";
    const firstDot = citation.indexOf(". ");
    if (firstDot === -1) return "";
    const rest = citation.slice(firstDot + 2);
    const secondDot = rest.indexOf(". ");
    return secondDot === -1 ? rest : rest.slice(0, secondDot);
  };

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
    if (sortCol === "title") return extractTitle(a.citation).localeCompare(extractTitle(b.citation)) * dir;
    return (a[sortCol]||"").localeCompare(b[sortCol]||"") * dir;
  });

  const totalPages = Math.ceil(filtered.length / PAPERS_PER_PAGE);
  const startIndex = (currentPage - 1) * PAPERS_PER_PAGE;
  const pagedPapers = filtered.slice(startIndex, startIndex + PAPERS_PER_PAGE);

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
    setFormError(null);
    const np = { ...uploadForm, id: Date.now().toString(), year: Number(uploadForm.year) };
    const newPending = [np, ...pendingPapers];
    try {
      await savePending(newPending);
      setUploadForm({ citation:"",doi:"",driveUrl:"",year:"2025",abstract:"",tldr:"",
        methods:"",findings:"",limitations:"",practicalImplications:"",athleteDev:"",rtp:"" });
      setShowUpload(false);
      flash("Paper added to the library!");
    } catch (err) {
      setFormError("Could not save paper. Storage may be unavailable — please try again or contact Eric.");
    }
  };

  const downloadPapersJson = () => {
    // Output must conform exactly to 12-field schema: no source field, no extras
    const clean = papers.map(p => {
      const obj = {};
      SCHEMA_FIELDS.forEach(f => { obj[f] = p[f] !== undefined ? p[f] : ""; });
      return obj;
    });
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "papers.json";
    a.click();
    flash("papers.json downloaded — commit it to GitHub to make it permanent!");
  };

  const getPaginationPages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity: 0.35, marginLeft: 4, fontSize: 11 }}>⇅</span>;
    return <span style={{ marginLeft: 4, fontSize: 11 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Compact table: only 4 columns — detail visible on row expand
  const COLS = [
    { key: "title",    label: "Paper Title", w: 340 },
    { key: "year",     label: "Year",        w: 68  },
    { key: "tldr",     label: "TL;DR",       w: 420 },
    { key: "citation", label: "Authors",     w: 220 },
  ];

  const th = { padding: "11px 14px", textAlign: "left", fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.18)", position: "sticky", top: 0, zIndex: 2, background: "#1565C0" };
  const td = { padding: "13px 14px", fontSize: 12.5, lineHeight: 1.65, color: "#2a2a2a", borderRight: "1px solid #EDE9E3", verticalAlign: "top", borderBottom: "1px solid #EDE9E3" };
  const inp = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 5, border: "1px solid #d0ccc5", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 4 };

  if (!loadComplete) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5", fontFamily: "'DM Sans',sans-serif" }}>
      <p style={{ color: "#555", fontSize: 15 }}>Loading research library...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a" }}>
      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000, background: "#003A2B", color: "#fff", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #003A2B 0%, #00563F 35%, #1B7A5A 100%)", padding: "32px 24px 28px", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏈</div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, margin: 0, lineHeight: 1.2 }}>Football Sport Science<br/>Research</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 12, fontWeight: 300 }}>Comprehensive analysis of {papers.length} research sources on performance, injuries, training, recovery, and athlete development</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>Curated by: Baylor Applied Performance</p>
        </div>
      </div>

      {/* Fetch failure banner */}
      {fetchFailed && (
        <div style={{ background: "#FFF8E1", borderBottom: "2px solid #F9A825", padding: "12px 24px", textAlign: "center", fontSize: 13, color: "#795548" }}>
          ⚠️ Could not load library data from GitHub. Showing locally submitted papers only. Check your connection or try refreshing.
        </div>
      )}

      {/* Controls */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, methods, findings..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 6, border: "1px solid #d0ccc5", background: "#fff", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a", outline: "none" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>Year:</span>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid #d0ccc5", background: "#fff", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={exportCSV} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: "#C62828", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>📋 Export to CSV</button>
        <button onClick={() => { setShowUpload(!showUpload); setFormError(null); }} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: showUpload ? "#555" : "#003A2B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          {showUpload ? "✕ Cancel" : "+ Add Paper"}
        </button>
        {pendingPapers.length > 0 && (
          <button onClick={() => setShowPendingPanel(true)}
            style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: "#E65100", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            ⏳ {pendingPapers.length} Pending
          </button>
        )}
      </div>

      {/* Upload */}
      {showUpload && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 16px" }}>
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
            {formError && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#C62828", background: "#FFEBEE", padding: "8px 12px", borderRadius: 4 }}>
                {formError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Panel */}
      {showPendingPanel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 60 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, maxWidth: 620, width: "90%", maxHeight: "70vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, margin: "0 0 4px" }}>📋 Pending Papers</h3>
            <p style={{ fontSize: 13, color: "#777", margin: "0 0 16px" }}>
              {pendingPapers.length} paper{pendingPapers.length !== 1 ? "s" : ""} waiting to be committed to GitHub.
              {fetchFailed && <span style={{ color: "#C62828", marginLeft: 6 }}>GitHub unavailable — download disabled.</span>}
            </p>
            {pendingPapers.map(p => (
              <div key={p.id} style={{ background: "#FFF8E1", border: "1px solid #F9A825", borderLeft: "4px solid #F9A825", borderRadius: 6, padding: "10px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{p.citation}</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>ID: {p.id}</div>
                </div>
                <button
                  onClick={async () => {
                    const updated = pendingPapers.filter(x => x.id !== p.id);
                    try { await savePending(updated); flash("Removed from pending queue."); }
                    catch (e) { flash("Could not remove paper — please try again."); }
                  }}
                  style={{ marginLeft: 12, color: "#C62828", background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, flexShrink: 0, padding: 0 }}>×</button>
              </div>
            ))}
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={downloadPapersJson}
                disabled={fetchFailed || !loadComplete}
                title={fetchFailed ? "Cannot generate complete papers.json — GitHub data unavailable. Resolve the connection issue first." : "Download a complete papers.json ready to commit to GitHub"}
                style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: (fetchFailed || !loadComplete) ? "#ccc" : "#1565C0", color: "#fff", fontSize: 13, fontWeight: 600, cursor: (fetchFailed || !loadComplete) ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                📥 Download papers.json for GitHub
              </button>
              <button onClick={() => setShowPendingPanel(false)}
                style={{ padding: "9px 16px", borderRadius: 6, border: "1px solid #d0ccc5", background: "#fff", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Close
              </button>
            </div>
            <p style={{ marginTop: 12, fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>
              After downloading: open github.com/Erash11/baylor-sport-science-library, open papers.json, replace file contents, and commit. The pending papers will be automatically removed from this queue on next load.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #d0ccc5", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820, background: "#fff" }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 40, cursor: "default", textAlign: "center" }}>#</th>
                {COLS.map(c => <th key={c.key} onClick={() => toggleSort(c.key)} style={{ ...th, width: c.w, minWidth: c.w }}>{c.label}<SortIcon col={c.key} /></th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={COLS.length+1} style={{ padding: 40, textAlign: "center", color: "#999" }}>No papers match your search.</td></tr>
              ) : pagedPapers.map((p, i) => {
                const bg = i%2===0 ? "#fff" : "#FAF7F2";
                const isExpanded = expandedRows.has(p.id);
                const expandBg = i%2===0 ? "#EEF4FF" : "#E8F0FE";
                return (
                  <React.Fragment key={p.id}>
                    <tr onClick={() => toggleRow(p.id)} style={{ background: bg, cursor: "pointer" }}>
                      <td style={{ ...td, textAlign: "center", fontWeight: 700, color: "#1565C0", fontSize: 14, width: 40 }}>
                        <span style={{ display: "block", fontSize: 9, color: isExpanded ? "#1565C0" : "#bbb", marginBottom: 1 }}>{isExpanded ? "▲" : "▼"}</span>
                        {startIndex + i + 1}
                      </td>
                      {/* Title */}
                      <td style={{ ...td, fontWeight: 600, color: "#1a1a1a" }}>
                        {extractTitle(p.citation)}
                        {p.source === "pending" && (
                          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: "#E65100", background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 10, padding: "1px 7px", marginLeft: 6, verticalAlign: "middle" }}>⏳ PENDING</span>
                        )}
                      </td>
                      {/* Year */}
                      <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>
                        <span style={{ background: "#E3F2FD", color: "#1565C0", padding: "3px 9px", borderRadius: 4, fontSize: 13 }}>{p.year}</span>
                      </td>
                      {/* TL;DR */}
                      <td style={{ ...td, color: "#444" }}>{p.tldr}</td>
                      {/* Authors */}
                      <td style={{ ...td, fontSize: 11.5, color: "#555" }}>
                        <div style={{ lineHeight: 1.5 }}>{p.citation}</div>
                        {p.doi && <div style={{ color: "#1565C0", marginTop: 3 }}>DOI: {p.doi}</div>}
                        <div style={{ marginTop: 6, display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                          {p.driveUrl && <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#1565C0", textDecoration: "none", fontWeight: 600 }}>Open →</a>}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (p.source === "github") return;
                              const updated = pendingPapers.filter(x => x.id !== p.id);
                              try { await savePending(updated); flash("Removed."); }
                              catch (err) { flash("Could not remove paper."); }
                            }}
                            disabled={p.source === "github"}
                            title={p.source === "github" ? "Committed papers can only be removed by editing papers.json on GitHub" : "Remove this pending paper"}
                            style={{ fontSize: 10, color: p.source === "github" ? "#ccc" : "#C62828", background: "none", border: "none", cursor: p.source === "github" ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: 0 }}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: expandBg }}>
                        <td style={{ padding: 0, borderBottom: "2px solid #BBDEFB" }} />
                        <td colSpan={4} style={{ padding: "16px 20px 20px", borderBottom: "2px solid #BBDEFB" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 24px" }}>
                            {[
                              { label: "Abstract",                  val: p.abstract              },
                              { label: "Methods",                   val: p.methods               },
                              { label: "Findings",                  val: p.findings              },
                              { label: "Limitations",               val: p.limitations           },
                              { label: "Practical Implications",    val: p.practicalImplications },
                              { label: "Football Athlete Dev",      val: p.athleteDev            },
                              { label: "Return to Play",            val: p.rtp                   },
                            ].map(({ label, val }) => val ? (
                              <div key={label}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#1565C0", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
                                <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "#2a2a2a" }}>{val}</div>
                              </div>
                            ) : null)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: "1px solid #d0ccc5", background: "#fff" }}>
              <span style={{ fontSize: 13, color: "#666" }}>
                {search || yearFilter !== "all"
                  ? `${filtered.length} match${filtered.length !== 1 ? "es" : ""} · Showing ${startIndex + 1}–${Math.min(startIndex + PAPERS_PER_PAGE, filtered.length)}`
                  : `Showing ${startIndex + 1}–${Math.min(startIndex + PAPERS_PER_PAGE, filtered.length)} of ${filtered.length} papers`}
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "5px 11px", borderRadius: 4, border: "1px solid #d0ccc5", background: currentPage === 1 ? "#f5f5f5" : "#fff", color: currentPage === 1 ? "#bbb" : "#333", cursor: currentPage === 1 ? "default" : "pointer", fontSize: 13 }}>
                  ← Prev
                </button>
                {getPaginationPages(currentPage, totalPages).map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#888", fontSize: 13 }}>…</span>
                  ) : (
                    <button key={item} onClick={() => setCurrentPage(item)}
                      style={{ padding: "5px 10px", borderRadius: 4, border: "1px solid", borderColor: item === currentPage ? "#1565C0" : "#d0ccc5", background: item === currentPage ? "#1565C0" : "#fff", color: item === currentPage ? "#fff" : "#333", cursor: "pointer", fontSize: 13, minWidth: 32 }}>
                      {item}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "5px 11px", borderRadius: 4, border: "1px solid #d0ccc5", background: currentPage === totalPages ? "#f5f5f5" : "#fff", color: currentPage === totalPages ? "#bbb" : "#333", cursor: currentPage === totalPages ? "default" : "pointer", fontSize: 13 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
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
