import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle, XCircle, AlertTriangle, ArrowRight,
  Loader2, Zap, TrendingUp, Target, Map,
} from "lucide-react";

const API = "http://localhost:8000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── PAGE ── */
  .rec {
    min-height: 100vh;
    padding: 44px 48px 80px;
    font-family: 'DM Sans', sans-serif;
    color: #1E293B;
    background: #F8FAFC;
    position: relative;
  }
  .rec::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .rec::after {
    content: ''; position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
    width: 800px; height: 500px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .rec > * { position: relative; z-index: 1; }

  /* ── ANIMATIONS ── */
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes bar-in   { from{width:0} }
  @keyframes fade-up  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes pop      { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }

  .spin { animation: spin 1s linear infinite; }

  /* ── HEADER ── */
  .rec-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 36px; padding-bottom: 28px;
    border-bottom: 1px solid #E2E8F0;
    position: relative;
    animation: fade-up 0.4s ease both;
  }
  .rec-header::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent);
  }

  .rec-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
    text-transform: uppercase; color: #2563EB; margin-bottom: 12px;
  }
  .rec-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #2563EB; box-shadow: 0 0 10px rgba(37,99,235,0.6);
    animation: blink 2s infinite;
  }

  .rec-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px; line-height: 0.9; letter-spacing: 0.02em;
    color: #0F172A; margin-bottom: 8px;
  }
  .rec-title em { color: #2563EB; font-style: normal; }
  .rec-subtitle { font-size: 13px; color: #64748B; line-height: 1.6; max-width: 480px; }

  .rec-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .rec-logo-icon {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    border-radius: 8px; box-shadow: 0 0 18px rgba(37,99,235,0.12);
  }
  .rec-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 0.1em; color: #0F172A;
  }
  .rec-logo-text em { color: #2563EB; font-style: normal; }

  /* ── BANNER ── */
  .rec-banner {
    display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 32px;
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    margin-bottom: 32px; position: relative; overflow: hidden;
    animation: fade-up 0.4s 0.05s ease both;
  }
  .rec-banner::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #93C5FD, #2563EB 45%, #1E3A8A 75%, transparent);
  }
  .rec-banner::after {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 65%);
    pointer-events: none;
  }

  .rec-banner-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.16em;
    text-transform: uppercase; color: #2563EB; margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .rec-banner-label::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; max-width: 80px; }

  .rec-banner-level {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px; color: #0F172A; letter-spacing: 0.02em; line-height: 1;
    margin-bottom: 6px;
  }
  .rec-banner-domain { font-size: 12px; color: #64748B; font-family: 'DM Mono'; }

  .rec-banner-stats {
    display: flex; align-items: center; gap: 24px; position: relative; z-index: 1; flex-shrink: 0;
  }

  .rec-score-block { text-align: center; }
  .rec-score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 58px; color: #2563EB; line-height: 1; letter-spacing: 0.04em;
  }
  .rec-score-denom { font-family: 'DM Mono'; font-size: 14px; color: #94A3B8; }
  .rec-score-sub {
    font-size: 9px; color: #64748B; letter-spacing: 0.1em;
    text-transform: uppercase; margin: 4px 0 6px; font-weight: 600;
  }
  .rec-score-bar-wrap { height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; }
  .rec-score-bar {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #60A5FA, #2563EB, #1D4ED8);
    animation: bar-in 1s 0.4s ease both;
  }

  .rec-divider { width: 1px; height: 60px; background: #E2E8F0; }

  .rec-tier-badge {
    padding: 10px 20px; border-radius: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    background: #EFF6FF; color: #2563EB;
    border: 1px solid #BFDBFE;
    box-shadow: 0 0 18px rgba(37,99,235,0.08);
    white-space: nowrap; font-family: 'DM Mono';
  }

  /* ── SECTION ── */
  .rec-section { margin-bottom: 36px; animation: fade-up 0.4s ease both; }
  .rec-section:nth-child(3) { animation-delay: 0.1s; }
  .rec-section:nth-child(4) { animation-delay: 0.17s; }
  .rec-section:nth-child(5) { animation-delay: 0.24s; }

  .rec-section-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .rec-section-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rec-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: 0.06em; line-height: 1; color: #0F172A;
  }
  .rec-section-badge {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 10px; border-radius: 3px; border: 1px solid;
  }
  .rec-section-count {
    margin-left: auto; font-family: 'DM Mono'; font-size: 11px; color: #64748B; font-weight: 500;
  }

  /* ── CARD GRID ── */
  .rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .rec-card {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 8px; padding: 22px;
    position: relative; overflow: hidden;
    transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
    animation: pop 0.35s ease both; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .rec-card:hover {
    border-color: #93C5FD;
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(37,99,235,0.08);
  }
  .rec-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, #2563EB, transparent);
    transform: scaleX(0); transform-origin: center; transition: transform 0.3s;
  }
  .rec-card:hover::before { transform: scaleX(1); }
  .rec-card-left-bar {
    position: absolute; left: 0; top: 12%; bottom: 12%;
    width: 3px; border-radius: 3px;
    transform: scaleY(0); transform-origin: top; transition: transform 0.25s;
  }
  .rec-card:hover .rec-card-left-bar { transform: scaleY(1); }

  .rec-card-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 12px; gap: 10px;
  }
  .rec-card-num {
    font-family: 'DM Mono'; font-size: 10px; color: #94A3B8; font-weight: 600;
    flex-shrink: 0; margin-top: 3px;
  }
  .rec-card-title { font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.4; flex: 1; }

  .rec-priority-badge {
    font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 3px; border: 1px solid;
    white-space: nowrap; flex-shrink: 0; font-family: 'DM Mono';
  }

  .rec-card-action { font-size: 13px; color: #475569; line-height: 1.65; margin-bottom: 14px; }

  .rec-card-footer {
    padding-top: 12px; border-top: 1px solid #E2E8F0;
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .rec-card-impact { font-size: 11px; color: #64748B; }
  .rec-card-impact strong { color: #2563EB; font-weight: 600; }
  .rec-card-arrow {
    width: 24px; height: 24px; border-radius: 50%;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: translateX(-4px); transition: all 0.2s; flex-shrink: 0;
  }
  .rec-card:hover .rec-card-arrow { opacity: 1; transform: translateX(0); }

  /* ── CAUTION CARD ── */
  .rec-caution-card {
    background: #FFFFFF;
    border: 1px solid #FEF08A;
    border-radius: 8px; padding: 22px;
    position: relative; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
    animation: pop 0.35s ease both;
  }
  .rec-caution-card:hover {
    border-color: #FDE047; transform: translateY(-3px); box-shadow: 0 12px 24px rgba(250,204,21,0.1);
  }
  .rec-caution-bar {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: #EAB308;
    transform: scaleY(0); transform-origin: top; transition: transform 0.25s;
  }
  .rec-caution-card:hover .rec-caution-bar { transform: scaleY(1); }
  .rec-caution-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .rec-caution-icon {
    width: 26px; height: 26px; border-radius: 6px;
    background: #FEF9C3; border: 1px solid #FEF08A;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rec-caution-title { font-size: 14px; font-weight: 700; color: #0F172A; }
  .rec-caution-note  { font-size: 12px; color: #475569; line-height: 1.6; }

  /* ── AVOID LIST ── */
  .rec-avoid-list {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .rec-avoid-row {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 22px; border-bottom: 1px solid #E2E8F0;
    transition: background 0.18s, padding-left 0.18s;
    cursor: default;
  }
  .rec-avoid-row:last-child { border-bottom: none; }
  .rec-avoid-row:hover { background: #FEF2F2; padding-left: 28px; }
  .rec-avoid-icon {
    width: 28px; height: 28px; border-radius: 7px;
    background: #FEE2E2; border: 1px solid #FECACA;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rec-avoid-title  { font-size: 13px; font-weight: 600; color: #0F172A; margin-bottom: 3px; }
  .rec-avoid-reason { font-size: 11px; color: #64748B; font-family: 'DM Mono'; }
  .rec-avoid-badge {
    margin-left: auto; font-size: 8px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 3px 8px; border-radius: 3px;
    background: #FEE2E2; color: #DC2626;
    border: 1px solid #FECACA; flex-shrink: 0; font-family: 'DM Mono';
  }

  /* ── QUICK ACTIONS BAR ── */
  .rec-quick-bar {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    margin-bottom: 32px;
    animation: fade-up 0.4s 0.08s ease both;
  }
  .rec-quick-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; background: #FFFFFF;
    border: 1px solid #E2E8F0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .rec-quick-item::after {
    content: ''; position: absolute; bottom: 0; left: 8%; right: 8%; height: 2px;
    background: #2563EB; transform: scaleX(0); transition: transform 0.22s;
  }
  .rec-quick-item:hover::after { transform: scaleX(1); }
  .rec-quick-item:hover { border-color: #93C5FD; background: #F8FAFC; box-shadow: 0 6px 12px rgba(37,99,235,0.06); }
  .rec-quick-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rec-quick-label { font-size: 12px; font-weight: 600; color: #0F172A; }
  .rec-quick-sub   { font-size: 10px; color: #64748B; margin-top: 2px; font-family: 'DM Mono'; font-weight: 500; }

  /* ── CTA ── */
  .rec-cta { display: flex; gap: 10px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
  .rec-cta-primary {
    display: flex; align-items: center; gap: 9px;
    padding: 14px 32px; background: #2563EB; color: #fff;
    border: none; border-radius: 8px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.22s; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }
  .rec-cta-primary:hover { background: #1D4ED8; box-shadow: 0 6px 16px rgba(37,99,235,0.35); transform: translateY(-2px); }
  .rec-cta-secondary {
    display: flex; align-items: center; gap: 8px;
    padding: 14px 24px; background: #FFFFFF; color: #475569;
    border: 1px solid #CBD5E1; border-radius: 8px;
    font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }
  .rec-cta-secondary:hover { border-color: #93C5FD; color: #2563EB; background: #F8FAFC; }

  /* ── LOADING ── */
  .rec-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 70vh; gap: 18px;
  }
  .rec-loading-ring {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    box-shadow: 0 0 40px rgba(37,99,235,0.12);
  }
  .rec-loading-bar { width: 160px; height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; }
  .rec-loading-fill {
    height: 100%; width: 40%; background: linear-gradient(90deg, #60A5FA, #2563EB);
    animation: ls 1.4s ease-in-out infinite; border-radius: 2px;
  }
  @keyframes ls { 0%{transform:translateX(-100%)} 100%{transform:translateX(280%)} }
  .rec-loading-text {
    font-family: 'DM Mono'; font-size: 11px; color: #64748B; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
  }

  /* ── ERROR ── */
  .rec-error { text-align: center; padding: 80px 32px; }
  .rec-error-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px; color: #0F172A; margin-bottom: 10px; letter-spacing: 0.04em;
  }
  .rec-error-sub { font-size: 13px; color: #64748B; line-height: 1.65; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .rec            { padding: 24px 16px 56px; }
    .rec-title      { font-size: 44px; }
    .rec-grid       { grid-template-columns: 1fr; }
    .rec-quick-bar  { grid-template-columns: 1fr; }
    .rec-banner     { grid-template-columns: 1fr; }
    .rec-banner-stats { flex-wrap: wrap; }
    .rec-header     { flex-direction: column; gap: 16px; }
    .rec-cta        { flex-direction: column; }
  }
`;

const FALLBACK_CAN = [
  { title: "SEO & Content Marketing",    action: "Create a monthly content calendar targeting high-intent local keywords. Publish 8–12 pieces/month to build domain authority within 90 days.", priority: "high",   impact: "₹15K–₹40K/mo potential" },
  { title: "Social Media Management",   action: "Offer weekly content packages to 3–5 SME clients in your city. Standardise delivery with Notion or Trello boards.",                        priority: "high",   impact: "₹10K–₹25K/mo potential" },
  { title: "Email Marketing Campaigns", action: "Build templated drip sequences and sell as a fixed-fee retainer. Use Mailchimp or Brevo to start — zero infra cost.",                    priority: "high",   impact: "₹8K–₹20K/mo potential"  },
  { title: "Google Ads Management",     action: "Start with ₹5K test budgets, prove ROI within 30 days before scaling. Target 3–5x ROAS as the benchmark to upsell.",                    priority: "medium", impact: "₹20K–₹60K/mo potential" },
];
const FALLBACK_TRY = [
  { title: "Performance Marketing",     note: "Negotiate clear ROI SLAs with clients before committing to revenue-share models." },
  { title: "Brand Strategy",            note: "Bring in a senior consultant for your first 2–3 brand projects to avoid scope creep." },
];
const FALLBACK_AVOID = [
  { title: "Enterprise Retainers (₹5L+/mo)",  reason: "Operational capacity not ready at current team size" },
  { title: "Multi-country Campaigns",          reason: "Compliance & cross-border coordination gaps remain" },
  { title: "IPO / Listed Company Clients",     reason: "SLA breach risk carries severe reputational damage" },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");
  const q = histId ? `?id=${histId}` : "";
  const nav = (p: string) => navigate(histId ? `${p}?history=${histId}` : p);
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<any>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`${API}/recommendations/${q}`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const priorityStyle = (p: string) => {
    if (p === "high")   return { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", barColor: "#2563EB" };
    if (p === "medium") return { bg: "#FEF9C3", color: "#CA8A04", border: "#FEF08A", barColor: "#EAB308" };
    return                     { bg: "#DCFCE7", color: "#16A34A", border: "#BBF7D0", barColor: "#22C55E" };
  };

  const aiRecs: any[]  = Array.isArray(data?.recommendations) && data.recommendations.length ? data.recommendations : [];
  const useFallback    = aiRecs.length === 0;
  const canOffer       = useFallback ? FALLBACK_CAN : aiRecs.filter((r: any) => r.priority === "high" || r.priority === "medium");
  const tryWith        = useFallback ? FALLBACK_TRY : aiRecs.filter((r: any) => r.priority === "medium" || r.priority === "low");

  return (
    <>
      <style>{css}</style>
      <div className="rec">

        {/* HEADER */}
        <div className="rec-header">
          <div>
            <div className="rec-eyebrow">
              <div className="rec-eyebrow-dot" /> Module 04 · AI Powered Recommendations
            </div>
            <div className="rec-title">AI <em>Recommendations</em></div>
            <div className="rec-subtitle">
              Personalised growth actions derived from your capability score — ranked by potential impact for your business.
            </div>
          </div>
          <div className="rec-logo">
            <div className="rec-logo-icon"><Zap size={15} color="#E85D04" /></div>
            <div className="rec-logo-text">Field<em>Scope</em></div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rec-loading">
            <div className="rec-loading-ring">
              <Loader2 size={28} color="#E85D04" className="spin" />
            </div>
            <div className="rec-loading-bar"><div className="rec-loading-fill" /></div>
            <div className="rec-loading-text">Generating with Groq LLaMA-3.3</div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rec-error">
            <div className="rec-error-title">Could Not Load</div>
            <div className="rec-error-sub">
              {error}<br />Complete your assessment first, then return here.
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && !error && (
          <>
            {/* BANNER */}
            <div className="rec-banner">
              <div>
                <div className="rec-banner-label">Your Market Positioning</div>
                <div className="rec-banner-level">{data?.level ?? "Intermediate"}</div>
                <div className="rec-banner-domain">{data?.domain ?? "Digital Marketing"}</div>
              </div>
              <div className="rec-banner-stats">
                <div className="rec-score-block">
                  <div className="rec-score-num">
                    {data?.score ?? 72}
                    <span className="rec-score-denom">/100</span>
                  </div>
                  <div className="rec-score-sub">Capability Score</div>
                  <div className="rec-score-bar-wrap" style={{ width: 100 }}>
                    <div className="rec-score-bar" style={{ width: `${data?.score ?? 72}%` }} />
                  </div>
                </div>
                <div className="rec-divider" />
                <div className="rec-tier-badge">{data?.tier_label ?? "Metro Ready"}</div>
              </div>
            </div>

            {/* QUICK NAV */}
            <div className="rec-quick-bar">
              {[
                { icon: TrendingUp, label: "Dashboard",  sub: "Live overview",   path: "/dashboard"       },
                { icon: Map,        label: "Roadmap",    sub: "4-week plan",     path: "/roadmap"          },
                { icon: Target,     label: "Industries", sub: "Matched for you", path: "/explore"          },
              ].map(qItem => (
                <div key={qItem.label} className="rec-quick-item" onClick={() => nav(qItem.path)}>
                  <div className="rec-quick-icon"><qItem.icon size={14} color="#E85D04" /></div>
                  <div>
                    <div className="rec-quick-label">{qItem.label}</div>
                    <div className="rec-quick-sub">{qItem.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CAN OFFER */}
            <div className="rec-section">
              <div className="rec-section-head">
                <div className="rec-section-icon" style={{ background: "rgba(72,199,116,0.1)", border: "1px solid rgba(72,199,116,0.2)" }}>
                  <CheckCircle size={14} color="#48C774" />
                </div>
                <div className="rec-section-title" style={{ color: "#48C774" }}>Services You CAN Offer</div>
                <span className="rec-section-badge" style={{ background: "rgba(72,199,116,0.08)", color: "#48C774", borderColor: "rgba(72,199,116,0.2)" }}>
                  Safe & Profitable
                </span>
                <span className="rec-section-count">{canOffer.length} actions</span>
              </div>
              <div className="rec-grid">
                {canOffer.map((item: any, i: number) => {
                  const ps = priorityStyle(item.priority ?? "high");
                  return (
                    <div className="rec-card" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="rec-card-left-bar" style={{ background: ps.barColor }} />
                      <div className="rec-card-top">
                        <span className="rec-card-num">0{i + 1}</span>
                        <div className="rec-card-title">{item.title}</div>
                        <span className="rec-priority-badge" style={{ background: ps.bg, color: ps.color, borderColor: ps.border }}>
                          {item.priority ?? "High"}
                        </span>
                      </div>
                      <div className="rec-card-action">{item.action}</div>
                      {item.impact && (
                        <div className="rec-card-footer">
                          <div className="rec-card-impact">Impact: <strong>{item.impact}</strong></div>
                          <div className="rec-card-arrow"><ArrowRight size={10} color="#E85D04" /></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRY WITH CAUTION */}
            <div className="rec-section">
              <div className="rec-section-head">
                <div className="rec-section-icon" style={{ background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.18)" }}>
                  <AlertTriangle size={14} color="#FFC800" />
                </div>
                <div className="rec-section-title" style={{ color: "#FFC800" }}>Try With Caution</div>
                <span className="rec-section-count">{(tryWith.length || FALLBACK_TRY.length)} actions</span>
              </div>
              <div className="rec-grid">
                {(tryWith.length ? tryWith : FALLBACK_TRY).map((item: any, i: number) => (
                  <div className="rec-caution-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="rec-caution-bar" />
                    <div className="rec-caution-header">
                      <div className="rec-caution-icon"><AlertTriangle size={12} color="#FFC800" /></div>
                      <div className="rec-caution-title">{item.title}</div>
                    </div>
                    <div className="rec-caution-note">{item.note ?? item.action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AVOID */}
            <div className="rec-section">
              <div className="rec-section-head">
                <div className="rec-section-icon" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.18)" }}>
                  <XCircle size={14} color="#FF4444" />
                </div>
                <div className="rec-section-title" style={{ color: "#FF4444" }}>Avoid Right Now</div>
                <span className="rec-section-count">{FALLBACK_AVOID.length} items</span>
              </div>
              <div className="rec-avoid-list">
                {FALLBACK_AVOID.map((item, i) => (
                  <div className="rec-avoid-row" key={i}>
                    <div className="rec-avoid-icon"><XCircle size={12} color="#FF4444" /></div>
                    <div style={{ flex: 1 }}>
                      <div className="rec-avoid-title">{item.title}</div>
                      <div className="rec-avoid-reason">{item.reason}</div>
                    </div>
                    <div className="rec-avoid-badge">Risk</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rec-cta">
              <button className="rec-cta-primary" onClick={() => nav("/roadmap")}>
                <Map size={14} /> Generate My Growth Roadmap <ArrowRight size={14} />
              </button>
              <button className="rec-cta-secondary" onClick={() => navigate("/dashboard")}>
                <TrendingUp size={14} /> Back to Dashboard
              </button>
            </div>
          </>
        )}

      </div>
    </>
  );
}