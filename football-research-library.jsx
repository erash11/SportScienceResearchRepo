// Baylor Athletics Health & Performance Evidence Library.
// The legacy filename is retained while the public product identity broadens.
// Legacy records are normalized at the data-loading seam before the UI uses them.

const GITHUB_URL = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/papers.json";
const SUBMIT_FORM_URL = "https://docs.google.com/forms/d/1CTuXolDntwAXIkASta7_0rP1PtjCCC5xAWvtt1n1pAI/viewform";
const PAPERS_PER_PAGE = 50;

// Easy-to-tune display knobs (were Tweaks panel controls in the design file).
const HERO_TITLE_SIZE = "clamp(38px, 5vw, 60px)";
const HERO_TITLE_LETTER_SPACING = "0.01em";
const HERO_TITLE_LINE_HEIGHT = 0.98;
const COLUMN_HEADER_SIZE = 13;       // px

import React, { useState, useEffect } from "react";
import paperTaxonomy from "./paper-taxonomy.json";
import { TAXONOMY, normalizePaper } from "./evidence-taxonomy.mjs";

// Vite serves /public at the configured base path (/SportScienceResearchRepo/).
const BASE = import.meta.env.BASE_URL;
const TAXONOMY_BY_ID = new Map(paperTaxonomy.records.map((record) => [String(record.id), record]));

const EMPTY_FILTERS = {
  domains: [],
  audiences: [],
  sports: [],
  populations: [],
  studyDesigns: [],
};

function FilterGroup({ label, options, selected, onToggle }) {
  return (
    <details name="evidence-taxonomy-filter" style={{ position: "relative" }}>
      <summary style={{ listStyle: "none", cursor: "pointer", padding: "9px 12px", minWidth: 142, border: "1px solid #D2D3D3", borderRadius: 4, background: selected.length ? "#E4F0E9" : "#fff", color: "#24362E", fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", userSelect: "none" }}>
        {label}{selected.length ? ` (${selected.length})` : ""} ▾
      </summary>
      <div style={{ position: "absolute", zIndex: 12, top: "calc(100% + 5px)", left: 0, width: 250, maxHeight: 310, overflowY: "auto", padding: 8, border: "1px solid #C7CECA", borderRadius: 6, background: "#fff", boxShadow: "0 8px 24px rgba(11,42,31,0.16)" }}>
        {options.map((option) => (
          <label key={option} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 8px", borderRadius: 4, cursor: "pointer", fontSize: 13, lineHeight: 1.25, color: "#2A3631" }}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} style={{ marginTop: 1, accentColor: "#154734" }} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

// Self-host the Baylor brand fonts (replaces the old DM Google Fonts link).
if (typeof document !== "undefined" && !document.getElementById("baylor-fonts")) {
  const st = document.createElement("style");
  st.id = "baylor-fonts";
  st.textContent = `
@font-face{font-family:"Baylor Bears";src:url(${BASE}fonts/Baylor-Bears-Font.otf) format("opentype");font-weight:400 900;font-display:swap;}
@font-face{font-family:"DIN Pro";src:url(${BASE}fonts/DIN_Pro_Light.otf) format("opentype");font-weight:300;font-display:swap;}
@font-face{font-family:"DIN Pro";src:url(${BASE}fonts/DIN_Pro.otf) format("opentype");font-weight:400;font-display:swap;}
@font-face{font-family:"DIN Pro";src:url(${BASE}fonts/DIN_Pro_Medium.otf) format("opentype");font-weight:500;font-display:swap;}
@font-face{font-family:"DIN Pro Condensed";src:url(${BASE}fonts/DIN_Pro_Cond_Medium.otf) format("opentype");font-weight:500;font-display:swap;}
@font-face{font-family:"DIN Pro Condensed";src:url(${BASE}fonts/DIN_Pro_Cond_Bold.otf) format("opentype");font-weight:700;font-display:swap;}
`;
  document.head.appendChild(st);
}

export default function HealthPerformanceEvidenceLibrary() {
  const [papers, setPapers] = useState([]);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [loadComplete, setLoadComplete] = useState(false);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortCol, setSortCol] = useState("year");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(GITHUB_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const records = await res.json();
        setPapers(records.map((record) => normalizePaper(record, TAXONOMY_BY_ID.get(String(record.id)))));
      } catch (e) {
        setFetchFailed(true);
      }
      setLoadComplete(true);
    })();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, yearFilter, filters]);

  const extractTitle = (citation) => {
    if (!citation) return "";
    const yearParen = citation.match(/\(\d{4}\)\.\s*/);
    if (yearParen) {
      const after = citation.slice(yearParen.index + yearParen[0].length);
      const end = after.search(/[.?!]\s/);
      return end === -1 ? after.trimEnd().replace(/[.?!]$/, "") : after.slice(0, end);
    }
    const firstDot = citation.indexOf(". ");
    if (firstDot === -1) return citation.trimEnd().replace(/[.?!]$/, "");
    const rest = citation.slice(firstDot + 2);
    const end = rest.search(/[.?!]\s/);
    return end === -1 ? rest.trimEnd().replace(/[.?!]$/, "") : rest.slice(0, end);
  };

  const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
  const hasActiveFilters = yearFilter !== "all" || Object.values(filters).some((values) => values.length);

  const toggleFilter = (dimension, value) => {
    setFilters((current) => ({
      ...current,
      [dimension]: current[dimension].includes(value)
        ? current[dimension].filter((item) => item !== value)
        : [...current[dimension], value],
    }));
  };

  const clearFilters = () => {
    setYearFilter("all");
    setFilters({ ...EMPTY_FILTERS });
    if (typeof document !== "undefined") {
      document.querySelectorAll('details[name="evidence-taxonomy-filter"][open]').forEach((details) => details.removeAttribute("open"));
    }
  };

  const matchesSelected = (selected, values) => !selected.length || selected.some((value) => values.includes(value));

  const filtered = papers.filter(p => {
    if (yearFilter !== "all" && p.year !== Number(yearFilter)) return false;
    if (!matchesSelected(filters.domains, p.context.domains)) return false;
    if (!matchesSelected(filters.audiences, p.context.audiences)) return false;
    if (!matchesSelected(filters.sports, p.context.sports)) return false;
    if (!matchesSelected(filters.populations, p.context.populations)) return false;
    if (filters.studyDesigns.length && !filters.studyDesigns.includes(p.context.studyDesign)) return false;
    if (!search) return true;
    return p.searchText.includes(search.toLowerCase());
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
    const columns = [
      ["Citation", (p) => p.citation],
      ["DOI", (p) => p.doi],
      ["Year", (p) => p.year],
      ["Abstract", (p) => p.evidence.abstract],
      ["TL;DR", (p) => p.evidence.summary],
      ["Methods", (p) => p.evidence.methods],
      ["Findings", (p) => p.evidence.findings],
      ["Limitations", (p) => p.evidence.limitations],
      ["Practical Implications", (p) => p.translation.practicalImplications],
      ["Performance Application", (p) => p.translation.applications.performance],
      ["Return to Sport Application", (p) => p.translation.applications.returnToSport],
      ["Domains", (p) => p.context.domains.join(" | ")],
      ["Audiences", (p) => p.context.audiences.join(" | ")],
      ["Sport Contexts", (p) => p.context.sports.join(" | ")],
      ["Populations", (p) => p.context.populations.join(" | ")],
      ["Study Design", (p) => p.context.studyDesign],
      ["Taxonomy Status", (p) => p.curation.taxonomySource],
    ];
    const esc = v => `"${String(v||"").replace(/"/g,'""')}"`;
    const rows = [columns.map(([header]) => header).join(","), ...filtered.map(p => columns.map(([, getValue]) => esc(getValue(p))).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Baylor_Health_Performance_Evidence_Library_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getPaginationPages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity: 0.4, marginLeft: 5, fontSize: 11 }}>⇅</span>;
    return <span style={{ marginLeft: 5, fontSize: 11, color: "#FFB81C" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const COLS = [
    { key: "title",    label: "Paper Title", w: 340 },
    { key: "year",     label: "Year",        w: 72  },
    { key: "tldr",     label: "TL;DR",       w: 420 },
    { key: "citation", label: "Authors",     w: 220 },
  ];

  // Baylor green table header.
  const th = { padding: "13px 14px", textAlign: "left", fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: COLUMN_HEADER_SIZE, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.16)", position: "sticky", top: 0, zIndex: 2, background: "#154734" };
  const td = { padding: "13px 14px", fontSize: 13, lineHeight: 1.6, color: "#23302A", borderRight: "1px solid #EAE8E2", verticalAlign: "top", borderBottom: "1px solid #EAE8E2" };

  if (!loadComplete) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F3EF", fontFamily: "'DIN Pro',sans-serif" }}>
      <p style={{ color: "#707372", fontSize: 15 }}>Loading evidence library…</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F4F3EF", fontFamily: "'DIN Pro','Helvetica Neue',Arial,sans-serif", color: "#14231C" }}>

      {/* Gold top rule */}
      <div style={{ height: 4, background: "#FFB81C" }} />

      {/* Brand bar */}
      <div style={{ background: "#0B2A1F", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <img src={`${BASE}assets/bu-mark-white.png`} alt="Baylor BU mark" style={{ height: 30, width: "auto", display: "block" }} />
          <span style={{ fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.13em", color: "#fff", textTransform: "uppercase" }}>Baylor Athletics</span>
        </div>
        <span style={{ fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: "0.18em", color: "#FFB81C", textTransform: "uppercase" }}>Health &amp; Performance</span>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", background: "#154734", color: "#fff", padding: "46px 24px 42px", borderBottom: "4px solid #FFB81C" }}>
        <img src={`${BASE}assets/baylor-bear-mark-gold-transparent.png`} alt="" aria-hidden="true" style={{ position: "absolute", right: -40, top: "50%", transform: "translateY(-50%)", height: 280, width: "auto", opacity: 0.10, pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFB81C", marginBottom: 14 }}>Baylor Athletics</div>
          <h1 style={{ fontFamily: "'Baylor Bears','Arial Narrow',sans-serif", fontSize: HERO_TITLE_SIZE, lineHeight: HERO_TITLE_LINE_HEIGHT, letterSpacing: HERO_TITLE_LETTER_SPACING, margin: 0, textTransform: "uppercase", fontWeight: 700 }}>Health &amp; Performance<br/>Evidence Library</h1>
          <p style={{ fontFamily: "'DIN Pro',sans-serif", fontSize: 16, fontWeight: 300, lineHeight: 1.5, color: "rgba(255,255,255,0.82)", margin: "18px auto 0", maxWidth: 680 }}>Practical analysis of {papers.length} evidence sources spanning health, performance, injury, rehabilitation, training, recovery, and athlete development.</p>
          <p style={{ fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: 14 }}>Curated for Baylor Athletics Health &amp; Performance staff</p>
        </div>
      </div>

      {/* Fetch failure banner */}
      {fetchFailed && (
        <div style={{ background: "#FFF1C9", borderBottom: "2px solid #E0A414", padding: "13px 24px", textAlign: "center", fontSize: 13.5, color: "#7A5A12", fontWeight: 500 }}>
          Could not load library data from GitHub. Check your connection or try refreshing.
        </div>
      )}

      {/* Search, export, and controlled taxonomy filters */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 18px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search evidence, applications, or taxonomy…"
            style={{ flex: 1, minWidth: 220, padding: "10px 15px", borderRadius: 4, border: "1px solid #D2D3D3", background: "#fff", fontSize: 14, fontFamily: "'DIN Pro',sans-serif", color: "#14231C", outline: "none" }} />
          <span style={{ fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4E5150" }}>Year</span>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 4, border: "1px solid #D2D3D3", background: "#fff", fontSize: 14, fontFamily: "'DIN Pro',sans-serif" }}>
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportCSV} style={{ padding: "10px 18px", borderRadius: 999, border: "none", background: "#FFB81C", color: "#154734", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif" }}>Export CSV</button>
          <a href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", borderRadius: 999, background: "#154734", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", textDecoration: "none" }}>
            + Submit a Paper
          </a>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
          <FilterGroup label="Domain" options={TAXONOMY.domains} selected={filters.domains} onToggle={(value) => toggleFilter("domains", value)} />
          <FilterGroup label="Audience" options={TAXONOMY.audiences} selected={filters.audiences} onToggle={(value) => toggleFilter("audiences", value)} />
          <FilterGroup label="Sport" options={TAXONOMY.sports} selected={filters.sports} onToggle={(value) => toggleFilter("sports", value)} />
          <FilterGroup label="Population" options={TAXONOMY.populations} selected={filters.populations} onToggle={(value) => toggleFilter("populations", value)} />
          <FilterGroup label="Study Design" options={TAXONOMY.studyDesigns} selected={filters.studyDesigns} onToggle={(value) => toggleFilter("studyDesigns", value)} />
          {hasActiveFilters && <button onClick={clearFilters} style={{ padding: "9px 12px", border: "none", background: "transparent", color: "#154734", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Clear filters</button>}
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#154734" }}>{filtered.length} of {papers.length} sources</span>
          <span style={{ fontSize: 11.5, color: "#6E7772" }}>Legacy taxonomy is rules-based and pending staff review.</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #D2D3D3", boxShadow: "0 2px 12px rgba(11,42,31,0.06)", background: "#fff" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820, background: "#fff" }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 44, cursor: "default", textAlign: "center" }}>#</th>
                {COLS.map(c => <th key={c.key} onClick={() => toggleSort(c.key)} style={{ ...th, width: c.w, minWidth: c.w }}>{c.label}<SortIcon col={c.key} /></th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={COLS.length+1} style={{ padding: 48, textAlign: "center", color: "#8E9190" }}>No papers match your search and filters.</td></tr>
              ) : pagedPapers.map((p, i) => {
                const bg = i%2===0 ? "#fff" : "#F7F5F1";
                const isExpanded = expandedRows.has(p.id);
                const expandBg = i%2===0 ? "#EFF5F1" : "#E7F0EA";
                return (
                  <React.Fragment key={p.id}>
                    <tr onClick={() => toggleRow(p.id)} style={{ background: bg, cursor: "pointer" }}>
                      <td style={{ ...td, textAlign: "center", fontWeight: 700, color: "#154734", fontSize: 14, width: 44 }}>
                        <span style={{ display: "block", fontSize: 9, color: isExpanded ? "#154734" : "#C0C4C1", marginBottom: 1 }}>{isExpanded ? "▲" : "▼"}</span>
                        {startIndex + i + 1}
                      </td>
                      <td style={{ ...td, fontWeight: 600, color: "#14231C" }}>{extractTitle(p.citation)}</td>
                      <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>
                        <span style={{ background: "#E4F0E9", color: "#154734", padding: "3px 10px", borderRadius: 4, fontSize: 13, fontWeight: 700 }}>{p.year}</span>
                      </td>
                      <td style={{ ...td, color: "#3A4A42" }}>{p.evidence.summary}</td>
                      <td style={{ ...td, fontSize: 11.5, color: "#4E5150" }}>
                        <div style={{ lineHeight: 1.5 }}>{p.citation}</div>
                        {p.doi && <div style={{ color: "#154734", marginTop: 3, fontWeight: 500 }}>DOI: {p.doi}</div>}
                        {p.sourceUrl && (
                          <div style={{ marginTop: 6 }} onClick={e => e.stopPropagation()}>
                            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: "#154734", textDecoration: "none", fontWeight: 700, letterSpacing: "0.03em" }}>Open →</a>
                          </div>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: expandBg }}>
                        <td style={{ padding: 0, borderBottom: "2px solid #FFB81C" }} />
                        <td colSpan={4} style={{ padding: "18px 20px 22px", borderBottom: "2px solid #FFB81C" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                            {[
                              { label: "Domains",                    val: p.context.domains.join(", ")                    },
                              { label: "Audiences",                  val: p.context.audiences.join(", ")                  },
                              { label: "Sport / Population",         val: [...p.context.sports, ...p.context.populations].join(", ") },
                              { label: "Study Design",               val: p.context.studyDesign                             },
                              { label: "Abstract",                   val: p.evidence.abstract                               },
                              { label: "Methods",                    val: p.evidence.methods                                },
                              { label: "Findings",                   val: p.evidence.findings                               },
                              { label: "Limitations",                val: p.evidence.limitations                            },
                              { label: "Practical Implications",     val: p.translation.practicalImplications               },
                              { label: "Performance Application",    val: p.translation.applications.performance            },
                              { label: "Return to Sport Application", val: p.translation.applications.returnToSport          },
                            ].map(({ label, val }) => val ? (
                              <div key={label} style={{ background: "#fff", border: "1px solid #D8E2DC", borderRadius: 6, padding: "12px 15px 14px", boxShadow: "0 1px 2px rgba(11,42,31,0.04)" }}>
                                <div style={{ fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: 11, fontWeight: 700, color: "#154734", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingBottom: 7, borderBottom: "1px solid #ECEFEA" }}>{label}</div>
                                <div style={{ fontSize: 13.5, lineHeight: 1.72, color: "#2A3631" }}>{val}</div>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: "1px solid #D2D3D3", background: "#fff", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#4E5150" }}>
                {search || hasActiveFilters
                  ? `${filtered.length} match${filtered.length !== 1 ? "es" : ""} · Showing ${startIndex + 1}–${Math.min(startIndex + PAPERS_PER_PAGE, filtered.length)}`
                  : `Showing ${startIndex + 1}–${Math.min(startIndex + PAPERS_PER_PAGE, filtered.length)} of ${filtered.length} papers`}
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #D2D3D3", background: currentPage === 1 ? "#F3F4F3" : "#fff", color: currentPage === 1 ? "#B2B4B3" : "#33403A", cursor: currentPage === 1 ? "default" : "pointer", fontSize: 13 }}>
                  ← Prev
                </button>
                {getPaginationPages(currentPage, totalPages).map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9FA3A1", fontSize: 13 }}>…</span>
                  ) : (
                    <button key={item} onClick={() => setCurrentPage(item)}
                      style={{ padding: "6px 11px", borderRadius: 4, border: "1px solid", borderColor: item === currentPage ? "#154734" : "#D2D3D3", background: item === currentPage ? "#154734" : "#fff", color: item === currentPage ? "#fff" : "#33403A", cursor: "pointer", fontSize: 13, fontWeight: item === currentPage ? 700 : 400, minWidth: 32 }}>
                      {item}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #D2D3D3", background: currentPage === totalPages ? "#F3F4F3" : "#fff", color: currentPage === totalPages ? "#B2B4B3" : "#33403A", cursor: currentPage === totalPages ? "default" : "pointer", fontSize: 13 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
        <p style={{ marginTop: 20, textAlign: "center", fontFamily: "'DIN Pro Condensed','DIN Pro',sans-serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9FA3A1" }}>Baylor Athletics · Health &amp; Performance · Shared evidence for all staff</p>
      </div>

      <style>{`
        input:focus,textarea:focus,select:focus{border-color:#154734!important;outline:none;box-shadow:0 0 0 3px rgba(21,71,52,0.13)}
        ::-webkit-scrollbar{height:9px;width:7px}
        ::-webkit-scrollbar-track{background:#E9ECE9}
        ::-webkit-scrollbar-thumb{background:#9FB3A8;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#154734}
      `}</style>
    </div>
  );
}
