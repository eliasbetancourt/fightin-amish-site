// TODO: Connect to GA4 Data API to pull real data
//
// This is the password-protected sponsor analytics report at /report.
// All metrics below are PLACEHOLDER values that mirror the shape of the data
// the GA4 Data API will return once it's wired up (see Google Analytics Data
// API v1 — runReport). Replace the constants in this file with live API calls
// and keep the same field names so the UI requires no changes.

import { useState, useMemo, useEffect } from "react";

// Fire a GA4 custom event. Safe no-op if gtag hasn't loaded.
const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Brand palette — mirrors the gold/black Fightin' Amish styling from App.jsx.
const COLORS = {
  gold: "#C5A55A",
  goldLight: "#D4BC7C",
  goldPale: "#F5EDD5",
  goldDark: "#8B7338",
  black: "#1A1A1A",
  blackSoft: "#2A2A2A",
  cream: "#FAF6EC",
  creamDark: "#EDE5D0",
  white: "#FFFFFF",
};

// Gate password. Hardcoded for now per spec — move to an auth check later.
const REPORT_PASSWORD = "fightinamish2027";

// ---- Placeholder data (TODO: replace with GA4 Data API responses) ----------
const SUMMARY = {
  visitors: 4820,
  pageViews: 7540,
  sponsorSectionViews: 2310,
  sponsorClicks: 412,
  formSubmissions: 38,
};

const TRAFFIC_SOURCES = [
  { source: "Direct", sessions: 1540, share: 32 },
  { source: "Organic Search", sessions: 1205, share: 25 },
  { source: "Social", sessions: 1108, share: 23 },
  { source: "Referral", sessions: 627, share: 13 },
  { source: "Email", sessions: 340, share: 7 },
];

const SPONSOR_ROWS = [
  { name: "Country Lane Gazebos", impressions: 2310, clicks: 268 },
  { name: "Barn Burner Tools", impressions: 2310, clicks: 144 },
];
// ----------------------------------------------------------------------------

const fmt = (n) => n.toLocaleString();
const ctr = (clicks, impressions) =>
  impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

// Default date range: trailing 30 days ending today (YYYY-MM-DD for <input>).
function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Wrap a CSV field in quotes when it contains a comma, quote, or newline.
function csvCell(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function PasswordGate({ onSubmit }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === REPORT_PASSWORD) {
      onSubmit();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div
      className="report-noprint"
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 30%, rgba(197,165,90,0.12) 0%, transparent 60%), ${COLORS.black}`,
        padding: "24px", fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: COLORS.blackSoft, borderRadius: 16, padding: "40px 32px",
          border: `1px solid rgba(197,165,90,0.25)`, width: "100%", maxWidth: 380,
          textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <img
          src="/android-chrome-192x192.png"
          alt="Fightin' Amish logo"
          style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 20 }}
        />
        <h1 style={{
          color: COLORS.gold, fontSize: 20, fontWeight: 800, margin: "0 0 6px",
          fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.03em",
        }}>
          Sponsor Report
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 24px" }}>
          Enter the password to view analytics.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(""); }}
          placeholder="Password"
          aria-label="Report password"
          autoFocus
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: 16,
            border: `1px solid ${error ? "#B00020" : "rgba(197,165,90,0.3)"}`,
            background: COLORS.black, color: COLORS.white, outline: "none",
            boxSizing: "border-box", minHeight: 44, marginBottom: error ? 8 : 16,
          }}
        />
        {error && (
          <div role="alert" style={{ color: "#ff6b6b", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%", padding: "13px", borderRadius: 8, border: "none",
            background: COLORS.gold, color: COLORS.black, fontWeight: 700,
            fontSize: 15, cursor: "pointer", letterSpacing: "0.03em", minHeight: 44,
          }}
        >
          View report
        </button>
      </form>
    </div>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div
      className="report-card"
      style={{
        background: COLORS.white, borderRadius: 12, padding: "22px 20px",
        border: `1px solid ${COLORS.creamDark}`,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontSize: 30, fontWeight: 800, color: COLORS.black,
        fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1,
      }}>
        {fmt(value)}
      </div>
      <div style={{
        fontSize: 12, color: COLORS.goldDark, textTransform: "uppercase",
        letterSpacing: "0.08em", fontWeight: 700, marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  );
}

function Dashboard() {
  const [startDate, setStartDate] = useState(isoDaysAgo(30));
  const [endDate, setEndDate] = useState(isoDaysAgo(0));

  // Fire a page_view only for authenticated report views. The Dashboard mounts
  // exclusively after the correct password is entered, so this never fires on
  // the password gate or for failed login attempts.
  useEffect(() => {
    trackEvent('page_view', {
      page_title: 'Sponsor Report',
      page_path: '/report',
      page_location: window.location.href,
    });
  }, []);

  const summaryCards = [
    { label: "Total Visitors", value: SUMMARY.visitors, icon: "👥" },
    { label: "Total Page Views", value: SUMMARY.pageViews, icon: "📄" },
    { label: "Sponsor Section Views", value: SUMMARY.sponsorSectionViews, icon: "👀" },
    { label: "Sponsor Clicks", value: SUMMARY.sponsorClicks, icon: "🖱️" },
    { label: "Form Submissions", value: SUMMARY.formSubmissions, icon: "✉️" },
  ];

  const dateLabel = useMemo(
    () => `${startDate} → ${endDate}`,
    [startDate, endDate]
  );

  const handleExportPDF = () => window.print();

  const handleExportCSV = () => {
    const rows = [];
    rows.push(["The Fightin' Amish — Sponsor Report"]);
    rows.push(["Date range", `${startDate} to ${endDate}`]);
    rows.push([]);
    rows.push(["Summary metric", "Value"]);
    summaryCards.forEach((c) => rows.push([c.label, c.value]));
    rows.push([]);
    rows.push(["Traffic source", "Sessions", "Share %"]);
    TRAFFIC_SOURCES.forEach((t) => rows.push([t.source, t.sessions, t.share]));
    rows.push([]);
    rows.push(["Sponsor", "Impressions", "Clicks", "Click-Through Rate %"]);
    SPONSOR_ROWS.forEach((s) =>
      rows.push([s.name, s.impressions, s.clicks, ctr(s.clicks, s.impressions)])
    );

    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fightin-amish-report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sectionTitle = {
    fontSize: 13, color: COLORS.goldDark, letterSpacing: "0.12em",
    textTransform: "uppercase", fontWeight: 700, marginBottom: 16,
  };
  const inputStyle = {
    padding: "10px 12px", borderRadius: 8, fontSize: 14,
    border: `1px solid ${COLORS.creamDark}`, background: COLORS.white,
    color: COLORS.black, outline: "none", minHeight: 40,
  };
  const btnStyle = (primary) => ({
    padding: "11px 22px", borderRadius: 8, border: primary ? "none" : `1px solid ${COLORS.gold}`,
    background: primary ? COLORS.gold : "transparent",
    color: primary ? COLORS.black : COLORS.goldDark, fontWeight: 700, fontSize: 14,
    cursor: "pointer", letterSpacing: "0.02em", minHeight: 44,
  });
  const th = {
    textAlign: "left", padding: "12px 16px", fontSize: 12, color: COLORS.goldDark,
    textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700,
    borderBottom: `2px solid ${COLORS.gold}`,
  };
  const td = {
    padding: "14px 16px", fontSize: 14, color: COLORS.black,
    borderBottom: `1px solid ${COLORS.creamDark}`,
  };

  return (
    <div
      className="report-root"
      style={{
        minHeight: "100vh", background: COLORS.cream,
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "32px 20px 64px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Branded header — kept in print output */}
        <div
          className="report-header"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            paddingBottom: 20, borderBottom: `2px solid ${COLORS.gold}`, marginBottom: 24,
          }}
        >
          <img
            src="/android-chrome-192x192.png"
            alt="Fightin' Amish logo"
            style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div>
            <div style={{
              color: COLORS.black, fontWeight: 800, fontSize: 20, letterSpacing: "0.03em",
              fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1,
            }}>
              THE FIGHTIN' AMISH
            </div>
            <div style={{
              color: COLORS.goldDark, fontSize: 13, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2,
            }}>
              Sponsor Analytics Report
            </div>
          </div>
        </div>

        {/* Toolbar: export buttons + date range (hidden when printing) */}
        <div
          className="report-noprint"
          style={{
            display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end",
            justifyContent: "space-between", marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
            <div>
              <label htmlFor="startDate" style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.goldDark, marginBottom: 6 }}>
                Start date
              </label>
              <input id="startDate" type="date" value={startDate} max={endDate}
                onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="endDate" style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.goldDark, marginBottom: 6 }}>
                End date
              </label>
              <input id="endDate" type="date" value={endDate} min={startDate}
                onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={handleExportPDF} style={btnStyle(true)}>
              Export PDF
            </button>
            <button type="button" onClick={handleExportCSV} style={btnStyle(false)}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Date range label — visible on screen and in print */}
        <div style={{ fontSize: 13, color: "rgba(26,26,26,0.55)", marginBottom: 24 }}>
          Reporting period: <strong style={{ color: COLORS.black }}>{dateLabel}</strong>
        </div>

        {/* Summary cards */}
        <div style={{ marginBottom: 40 }}>
          <div style={sectionTitle}>Overview</div>
          <div
            className="report-summary-grid"
            style={{
              display: "grid", gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            }}
          >
            {summaryCards.map((c) => (
              <SummaryCard key={c.label} {...c} />
            ))}
          </div>
        </div>

        {/* Traffic sources */}
        <div className="report-card" style={{
          background: COLORS.white, borderRadius: 12, padding: "24px 24px 12px",
          border: `1px solid ${COLORS.creamDark}`, marginBottom: 40,
        }}>
          <div style={sectionTitle}>Traffic sources</div>
          {TRAFFIC_SOURCES.map((t) => (
            <div key={t.source} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: COLORS.black, fontWeight: 600 }}>{t.source}</span>
                <span style={{ color: "rgba(26,26,26,0.55)" }}>
                  {fmt(t.sessions)} sessions · {t.share}%
                </span>
              </div>
              <div style={{ background: COLORS.creamDark, borderRadius: 8, height: 10, overflow: "hidden" }}>
                <div style={{
                  width: `${t.share}%`, height: "100%", borderRadius: 8,
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Per-sponsor breakdown */}
        <div className="report-card" style={{
          background: COLORS.white, borderRadius: 12, padding: "24px",
          border: `1px solid ${COLORS.creamDark}`, marginBottom: 32, overflowX: "auto",
        }}>
          <div style={sectionTitle}>Per-sponsor breakdown</div>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <th style={th}>Sponsor Name</th>
                <th style={{ ...th, textAlign: "right" }}>Impressions</th>
                <th style={{ ...th, textAlign: "right" }}>Clicks</th>
                <th style={{ ...th, textAlign: "right" }}>Click-Through Rate</th>
              </tr>
            </thead>
            <tbody>
              {SPONSOR_ROWS.map((s) => (
                <tr key={s.name}>
                  <td style={{ ...td, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ ...td, textAlign: "right" }}>{fmt(s.impressions)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{fmt(s.clicks)}</td>
                  <td style={{ ...td, textAlign: "right", color: COLORS.goldDark, fontWeight: 700 }}>
                    {ctr(s.clicks, s.impressions)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 12, color: "rgba(26,26,26,0.4)", textAlign: "center" }}>
          Placeholder data shown. Live figures pending GA4 Data API integration.
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [authed, setAuthed] = useState(false);

  return (
    <>
      {/* Print stylesheet: hide the toolbar / password gate / interactive
          controls, and lay the report out cleanly on A4/Letter paper. */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: #fff !important; }
          .report-noprint { display: none !important; }
          .report-root { padding: 0 !important; background: #fff !important; }
          .report-header { page-break-after: avoid; }
          .report-card { break-inside: avoid; page-break-inside: avoid; }
          .report-summary-grid { grid-template-columns: repeat(5, 1fr) !important; }
        }
      `}</style>
      {authed ? <Dashboard /> : <PasswordGate onSubmit={() => setAuthed(true)} />}
    </>
  );
}
