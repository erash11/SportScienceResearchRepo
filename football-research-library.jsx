const GITHUB_URL = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/papers.json";
const SUBMIT_FORM_URL = "https://docs.google.com/forms/d/1CTuXolDntwAXIkASta7_0rP1PtjCCC5xAWvtt1n1pAI/viewform";
const PAPERS_PER_PAGE = 50;

import React, { useState, useEffect } from "react";


const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

export default function FootballResearchLibrary() {
  const [papers, setPapers] = useState([]);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [loadComplete, setLoadComplete] = useState(false);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortCol, setSortCol] = useState("year");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(GITHUB_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setPapers(await res.json());
      } catch (e) {
        setFetchFailed(true);
      }
      setLoadComplete(true);
    })();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, yearFilter]);

  const extractTitle = (citation) => {
    if (!citation) return "";
    // APA format: "Authors (Year). Title. Journal."
    const yearParen = citation.match(/\(\d{4}\)\.\s*/);
    if (yearParen) {
      const after = citation.slice(yearParen.index + yearParen[0].length);
      const end = after.search(/[.?!]\s/);
      return end === -1 ? after.trimEnd().replace(/[.?!]$/, "") : after.slice(0, end);
    }
    // Standard format: "Authors. Title. Journal." — title may end in . ? or !
    const firstDot = citation.indexOf(". ");
    if (firstDot === -1) return citation.trimEnd().replace(/[.?!]$/, "");
    const rest = citation.slice(firstDot + 2);
    const end = rest.search(/[.?!]\s/);
    return end === -1 ? rest.trimEnd().replace(/[.?!]$/, "") : rest.slice(0, end);
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
    const headers = ["Citation","DOI","Year","Abstract","TL;DR","Methods","Findings","Limitations","Practical Implications","Football Athlete Development","Return to Play"];
    const esc = v => `"${String(v||"").replace(/"/g,'""')}"`;
    const rows = [headers.join(","), ...filtered.map(p => cols.map(c => esc(p[c])).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Baylor_FB_Research_Library_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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

  if (!loadComplete) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5", fontFamily: "'DM Sans',sans-serif" }}>
      <p style={{ color: "#555", fontSize: 15 }}>Loading research library...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a" }}>

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
          ⚠️ Could not load library data from GitHub. Check your connection or try refreshing.
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
        <button onClick={exportCSV} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: "#C62828", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Export CSV</button>
        <a href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 16px", borderRadius: 6, background: "#003A2B", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}>
          + Submit a Paper
        </a>
      </div>

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
                      <td style={{ ...td, fontWeight: 600, color: "#1a1a1a" }}>{extractTitle(p.citation)}</td>
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
                        {p.driveUrl && (
                          <div style={{ marginTop: 6 }} onClick={e => e.stopPropagation()}>
                            <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#1565C0", textDecoration: "none", fontWeight: 600 }}>Open →</a>
                          </div>
                        )}
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
