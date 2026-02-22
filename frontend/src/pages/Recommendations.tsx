import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Loader2, Zap } from "lucide-react";

const API = "http://localhost:8000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .rec-wrap {
    min-height: 100vh;
    padding: 40px 48px 72px;
    font-family: 'DM Sans', sans-serif;
    color: #F0F0F0;
    background: #0A0A0A;
  }

  /* ── HEADER ── */
  .rec-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 28px;
    border-bottom: 1px solid #1A1A1A;
    position: relative;
  }
  .rec-header::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.3), transparent);
  }

  .rec-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #E85D04; margin-bottom: 12px;
  }
  .rec-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #E85D04; box-shadow: 0 0 8px #E85D04;
    animation: blink 2s infinite;
  }

  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes bar-in  { from{width:0} }
  @keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .rec-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; line-height: 0.92; letter-spacing: 0.02em;
    color: #F0F0F0; margin-bottom: 6px;
  }
  .rec-title span { color: #E85D04; }
  .rec-subtitle { font-size: 13px; color: #444; font-weight: 300; }

  /* logo top-right */
  .rec-logo { display: flex; align-items: center; gap: 10px; }
  .rec-logo-icon {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.1); border: 1px solid rgba(232,93,4,0.2);
    border-radius: 8px; box-shadow: 0 0 16px rgba(232,93,4,0.15);
  }
  .rec-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 0.1em; color: #F0F0F0;
  }
  .rec-logo-text span { color: #E85D04; }

  /* ── POSITIONING BANNER ── */
  .rec-banner {
    background: #0D0D0D;
    border: 1px solid rgba(232,93,4,0.25);
    border-radius: 4px; padding: 28px 32px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 40px; gap: 24px; flex-wrap: wrap;
    position: relative; overflow: hidden;
    animation: fade-up 0.4s ease both;
  }
  .rec-banner::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #E85D04 40%, #FF6B1A 60%, transparent);
  }
  .rec-banner::after {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,93,4,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .rec-banner-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #E85D04; margin-bottom: 8px;
  }
  .rec-banner-level {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px; color: #F0F0F0; letter-spacing: 0.03em; line-height: 1;
  }
  .rec-banner-domain { font-size: 13px; color: #666; margin-top: 6px; }

  .rec-banner-right { display: flex; align-items: center; gap: 28px; position: relative; z-index: 1; }

  .rec-score-block { text-align: center; }
  .rec-score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px; color: #E85D04; line-height: 1;
  }
  .rec-score-sub { font-size: 10px; color: #333; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
  .rec-score-bar-wrap { height: 3px; background: #1A1A1A; border-radius: 2px; overflow: hidden; }
  .rec-score-bar {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #7A2E01, #E85D04, #FF6B1A);
    animation: bar-in 1s 0.3s ease both;
  }

  .rec-tier-badge {
    padding: 10px 20px; border-radius: 40px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    background: rgba(232,93,4,0.1); color: #E85D04;
    border: 1px solid rgba(232,93,4,0.25);
    box-shadow: 0 0 20px rgba(232,93,4,0.1);
    white-space: nowrap;
  }

  /* ── SECTIONS ── */
  .rec-section { margin-bottom: 40px; animation: fade-up 0.4s ease both; }

  .rec-section-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
  }
  .rec-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: 0.06em;
  }
  .rec-section-badge {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 4px 12px; border-radius: 40px;
  }

  /* ── CARDS ── */
  .rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .rec-card {
    background: #0D0D0D; border: 1px solid #1E1E1E;
    border-radius: 4px; padding: 22px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .rec-card:hover {
    border-color: rgba(232,93,4,0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .rec-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #E85D04, transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .rec-card:hover::before { opacity: 1; }

  .rec-card-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 12px; gap: 8px;
  }
  .rec-card-title { font-size: 14px; font-weight: 700; color: #E8E8E8; line-height: 1.4; }

  .rec-priority-badge {
    font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 40px; white-space: nowrap; flex-shrink: 0;
  }

  .rec-card-action { font-size: 13px; color: #A0A0A0; line-height: 1.6; margin-bottom: 12px; }

  .rec-card-impact {
    padding-top: 12px; border-top: 1px solid #1A1A1A;
    font-size: 11px; color: #555;
  }
  .rec-card-impact strong { color: #E85D04; font-weight: 600; }

  /* ── CAUTION CARDS ── */
  .rec-caution-card {
    background: #0D0D0D;
    border: 1px solid rgba(255,200,0,0.15);
    border-radius: 4px; padding: 22px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }
  .rec-caution-card::before {
    content: '';
    position: absolute; left: 0; top: 10%; bottom: 10%;
    width: 2px; border-radius: 2px; background: #FFC800;
    transform: scaleY(0); transform-origin: top; transition: transform 0.25s;
  }
  .rec-caution-card:hover { border-color: rgba(255,200,0,0.3); transform: translateY(-2px); }
  .rec-caution-card:hover::before { transform: scaleY(1); }

  .rec-caution-title { font-size: 14px; font-weight: 700; color: #E8E8E8; margin-bottom: 8px; }
  .rec-caution-note  { font-size: 13px; color: #888; line-height: 1.5; }

  /* ── AVOID LIST ── */
  .rec-avoid-list {
    background: #0D0D0D; border: 1px solid #1E1E1E;
    border-radius: 4px; overflow: hidden;
  }
  .rec-avoid-row {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 22px; border-bottom: 1px solid #141414;
    transition: background 0.2s;
  }
  .rec-avoid-row:last-child { border-bottom: none; }
  .rec-avoid-row:hover { background: rgba(255,60,60,0.03); }
  .rec-avoid-title  { font-size: 14px; font-weight: 600; color: #D0D0D0; margin-bottom: 3px; }
  .rec-avoid-reason { font-size: 12px; color: #555; }

  /* ── STATES ── */
  .rec-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 60vh; gap: 16px;
  }
  .rec-loading-ring {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.08); border: 1px solid rgba(232,93,4,0.2);
    box-shadow: 0 0 32px rgba(232,93,4,0.15);
  }
  .rec-loading-text { font-size: 13px; color: #444; }
  .rec-error { text-align: center; padding: 80px 32px; }
  .rec-error-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px; color: #2A2A2A; margin-bottom: 10px; letter-spacing: 0.04em;
  }
  .rec-error-sub { font-size: 13px; color: #444; }

  /* ── CTA ── */
  .rec-cta { display: flex; justify-content: center; padding-top: 16px; }
  .rec-cta-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 15px 38px; background: #E85D04; color: #fff;
    border: none; border-radius: 40px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.22s; box-shadow: 0 0 28px rgba(232,93,4,0.35);
    position: relative; overflow: hidden;
  }
  .rec-cta-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .rec-cta-btn:hover { background: #FF6B1A; box-shadow: 0 0 44px rgba(232,93,4,0.55); transform: translateY(-2px); }
  .rec-cta-btn:hover::before { opacity: 1; }

  .spin { animation: spin 1s linear infinite; }

  @media (max-width: 700px) {
    .rec-wrap  { padding: 20px 16px 48px; }
    .rec-grid  { grid-template-columns: 1fr; }
    .rec-title { font-size: 38px; }
    .rec-banner { flex-direction: column; align-items: flex-start; }
    .rec-banner-right { flex-wrap: wrap; }
  }
`;

const FALLBACK_CAN = [
  { title: "SEO & Content Marketing",    action: "Create a monthly content calendar targeting high-intent local keywords.", priority: "high",   impact: "₹15K–₹40K/mo potential" },
  { title: "Social Media Management",   action: "Offer weekly content packages to 3–5 SME clients in your city.",         priority: "high",   impact: "₹10K–₹25K/mo potential" },
  { title: "Email Marketing Campaigns", action: "Build templated drip sequences and sell as a fixed-fee retainer.",        priority: "high",   impact: "₹8K–₹20K/mo potential"  },
  { title: "Google Ads Management",     action: "Start with ₹5K test budgets, prove ROI before scaling.",                 priority: "high",   impact: "₹20K–₹60K/mo potential" },
];
const FALLBACK_TRY = [
  { title: "Performance Marketing", note: "Ensure clear ROI SLA with clients before committing." },
  { title: "Brand Strategy",        note: "Engage a senior consultant for your first 2–3 projects." },
];
const FALLBACK_AVOID = [
  { title: "Enterprise Retainers (₹5L+/mo)",  reason: "Operational capacity not ready yet." },
  { title: "Multi-country Campaigns",          reason: "Compliance & coordination gaps remain." },
  { title: "IPO / Listed Company Clients",     reason: "SLA breach risk — reputational damage." },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<any>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`${API}/recommendations/`, { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const priorityStyle = (p: string) => {
    if (p === "high")   return { bg: "rgba(232,93,4,0.13)",   color: "#E85D04", border: "rgba(232,93,4,0.25)"   };
    if (p === "medium") return { bg: "rgba(255,200,0,0.10)",  color: "#FFC800", border: "rgba(255,200,0,0.2)"   };
    return                     { bg: "rgba(72,199,116,0.10)", color: "#48C774", border: "rgba(72,199,116,0.2)"  };
  };

  const aiRecs: any[]  = Array.isArray(data?.recommendations) && data.recommendations.length ? data.recommendations : [];
  const useFallback    = aiRecs.length === 0;
  const canOffer       = useFallback ? FALLBACK_CAN : aiRecs.filter((r) => r.priority === "high");
  const tryWith        = useFallback ? FALLBACK_TRY : aiRecs.filter((r) => r.priority === "medium");

  return (
    <>
      <style>{css}</style>
      <div className="rec-wrap">

        {/* HEADER */}
        <div className="rec-header">
          <div>
            <div className="rec-eyebrow">
              <div className="rec-eyebrow-dot" />
              Module 04 — Phase 1 · AI Powered
            </div>
            <div className="rec-title">AI <span>Recommendations</span></div>
            <div className="rec-subtitle">Based on your capability assessment — personalised growth actions for your business</div>
          </div>
          <div className="rec-logo">
            <div className="rec-logo-icon"><Zap size={15} color="#E85D04" /></div>
            <div className="rec-logo-text">Field<span>Scope</span></div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rec-loading">
            <div className="rec-loading-ring">
              <Loader2 size={28} color="#E85D04" className="spin" />
            </div>
            <div className="rec-loading-text">Fetching your AI recommendations…</div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rec-error">
            <div className="rec-error-title">Could Not Load</div>
            <div className="rec-error-sub">{error} — Complete your assessment first, then return here.</div>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && (
          <>
            {/* POSITIONING BANNER */}
            <div className="rec-banner">
              <div>
                <div className="rec-banner-label">Your Market Positioning</div>
                <div className="rec-banner-level">{data?.level ?? "Intermediate"}</div>
                <div className="rec-banner-domain">{data?.domain ?? "Digital Marketing"}</div>
              </div>
              <div className="rec-banner-right">
                <div className="rec-score-block">
                  <div className="rec-score-num">{data?.score ?? 72}</div>
                  <div className="rec-score-sub">/ 100 Score</div>
                  <div className="rec-score-bar-wrap">
                    <div className="rec-score-bar" style={{ width: `${data?.score ?? 72}%` }} />
                  </div>
                </div>
                <div className="rec-tier-badge">{data?.tier_label ?? "Metro Ready"}</div>
              </div>
            </div>

            {/* CAN OFFER */}
            <div className="rec-section">
              <div className="rec-section-head">
                <CheckCircle size={20} color="#48C774" />
                <div className="rec-section-title" style={{ color: "#48C774" }}>Services You CAN Offer</div>
                <span className="rec-section-badge"
                  style={{ background: "rgba(72,199,116,0.1)", color: "#48C774", border: "1px solid rgba(72,199,116,0.2)" }}>
                  Safe & Profitable
                </span>
              </div>
              <div className="rec-grid">
                {canOffer.map((item: any, i: number) => {
                  const ps = priorityStyle(item.priority ?? "high");
                  return (
                    <div className="rec-card" key={i}>
                      <div className="rec-card-top">
                        <div className="rec-card-title">{item.title}</div>
                        <span className="rec-priority-badge"
                          style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                          {item.priority ?? "High"} Priority
                        </span>
                      </div>
                      <div className="rec-card-action">{item.action}</div>
                      {item.impact && (
                        <div className="rec-card-impact">Impact: <strong>{item.impact}</strong></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRY WITH CAUTION */}
            <div className="rec-section">
              <div className="rec-section-head">
                <AlertTriangle size={20} color="#FFC800" />
                <div className="rec-section-title" style={{ color: "#FFC800" }}>Services to TRY (with Caution)</div>
              </div>
              <div className="rec-grid">
                {(tryWith.length ? tryWith : FALLBACK_TRY).map((item: any, i: number) => (
                  <div className="rec-caution-card" key={i}>
                    <div className="rec-caution-title">{item.title}</div>
                    <div className="rec-caution-note">⚠️ {item.note ?? item.action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AVOID */}
            <div className="rec-section">
              <div className="rec-section-head">
                <XCircle size={20} color="#FF4444" />
                <div className="rec-section-title" style={{ color: "#FF4444" }}>Services to AVOID Right Now</div>
              </div>
              <div className="rec-avoid-list">
                {FALLBACK_AVOID.map((item, i) => (
                  <div className="rec-avoid-row" key={i}>
                    <XCircle size={14} color="#FF4444" style={{ flexShrink: 0 }} />
                    <div>
                      <div className="rec-avoid-title">{item.title}</div>
                      <div className="rec-avoid-reason">{item.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rec-cta">
              <button className="rec-cta-btn" onClick={() => navigate("/roadmap")}>
                Generate My Growth Roadmap <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

      </div>
    </>
  );
}