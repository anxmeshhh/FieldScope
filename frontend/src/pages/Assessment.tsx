import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle, Zap } from "lucide-react";

const steps = [
  { id: "domain",   title: "Choose Your Industry",  desc: "Select the primary domain you operate or plan to enter" },
  { id: "basics",   title: "Business Basics",        desc: "Tell us about your current business situation" },
  { id: "team",     title: "Team & Experience",      desc: "Your team size and key skill set" },
  { id: "location", title: "Location & Market",      desc: "Where do you operate in India?" },
];

const API = "http://localhost:8000";
const domains = [
  "Digital Marketing", "Construction & Real Estate",
  "D2C E-Commerce",    "HealthTech",
  "FinTech",           "AgriTech",
  "EdTech",            "SaaS / Software",
];
const skillOptions = ["SEO","Paid Ads","Content","Design","Video","Analytics","Automation","Sales"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .as-wrap {
    padding: 36px 40px 64px;
    font-family: 'DM Sans', sans-serif;
    color: #F0F0F0;
    background: #080808;
    min-height: 100%;
  }

  /* ── PAGE HEADER ── */
  .as-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 28px;
    border-bottom: 1px solid #1A1A1A;
    position: relative;
  }

  .as-header::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.2), transparent);
  }

  .as-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #E85D04; margin-bottom: 12px;
  }

  .as-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #E85D04; box-shadow: 0 0 8px #E85D04;
    animation: blink 2s infinite;
  }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .as-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; line-height: 0.92; color: #F0F0F0; letter-spacing: 0.02em;
    margin-bottom: 8px;
  }

  .as-title span { color: #E85D04; }

  .as-subtitle { font-size: 13px; color: #444; font-weight: 300; }

  /* ── PROGRESS ── */
  .as-progress { margin-bottom: 24px; }

  .as-progress-meta {
    display: flex; justify-content: space-between;
    font-size: 10px; color: #2A2A2A; margin-bottom: 10px;
    letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700;
  }

  .as-progress-meta span:last-child { color: #E85D04; }

  .as-step-bars { display: flex; gap: 4px; margin-bottom: 8px; }

  .as-step-bar {
    flex: 1; height: 3px; border-radius: 2px; background: #141414; transition: background 0.3s;
  }

  .as-step-bar.done { background: #5A2001; }

  .as-step-bar.active { background: #1A1A1A; position: relative; overflow: hidden; }

  .as-step-bar.active::after {
    content: '';
    position: absolute; inset: 0; border-radius: 2px;
    background: linear-gradient(90deg, #7A2E01, #E85D04);
    animation: bar-in 0.4s ease forwards;
  }

  @keyframes bar-in { from { width: 0; } to { width: 100%; } }

  .as-step-names { display: flex; gap: 4px; }

  .as-step-name {
    flex: 1; font-size: 9px; text-align: center;
    letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; transition: color 0.2s;
  }

  /* ── TWO-COL LAYOUT ── */
  .as-body {
    display: grid; grid-template-columns: 1fr 300px;
    gap: 16px; align-items: start;
  }

  /* ── STEP CARD ── */
  .as-card {
    background: #0F0F0F; border: 1px solid #1A1A1A;
    border-radius: 4px; padding: 32px;
    position: relative; overflow: hidden; transition: border-color 0.25s;
  }

  .as-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #E85D04 40%, #FF6B1A 60%, transparent);
  }

  .as-card-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; color: #F0F0F0; letter-spacing: 0.02em; line-height: 1; margin-bottom: 4px;
  }

  .as-card-desc { font-size: 12px; color: #2A2A2A; margin-bottom: 28px; }

  /* ── DOMAIN GRID ── */
  .as-domain-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .as-domain-btn {
    padding: 14px 16px;
    background: #111; border: 1px solid #1A1A1A;
    border-radius: 4px; font-size: 13px; font-weight: 500; color: #444;
    cursor: pointer; text-align: left;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    position: relative; overflow: hidden;
  }

  .as-domain-btn::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: #E85D04; transform: scaleX(0); transform-origin: left; transition: transform 0.28s;
  }

  .as-domain-btn:hover {
    border-color: rgba(232,93,4,0.25); color: #F0F0F0;
    background: rgba(232,93,4,0.04); transform: translateY(-1px);
  }

  .as-domain-btn:hover::after { transform: scaleX(1); }

  .as-domain-btn.sel {
    background: rgba(232,93,4,0.09); border-color: rgba(232,93,4,0.4); color: #E85D04;
    box-shadow: 0 0 16px rgba(232,93,4,0.1);
  }

  .as-domain-btn.sel::after { transform: scaleX(1); }

  /* ── FIELDS ── */
  .as-fields { display: flex; flex-direction: column; gap: 18px; }

  .as-label {
    display: block; font-size: 10px; font-weight: 700; color: #2A2A2A;
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px;
  }

  .as-input {
    width: 100%; padding: 13px 16px;
    background: #111; border: 1px solid #1A1A1A;
    border-radius: 4px; color: #F0F0F0;
    font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .as-input::placeholder { color: #222; }

  .as-input:focus {
    border-color: rgba(232,93,4,0.4); box-shadow: 0 0 0 3px rgba(232,93,4,0.06);
  }

  /* ── SIZE GRID ── */
  .as-size-grid {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 22px;
  }

  .as-size-btn {
    padding: 14px 8px; text-align: center;
    background: #111; border: 1px solid #1A1A1A;
    border-radius: 4px; font-size: 14px; font-weight: 600; color: #444;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }

  .as-size-btn:hover { border-color: rgba(232,93,4,0.3); color: #F0F0F0; }

  .as-size-btn.sel {
    background: rgba(232,93,4,0.09); border-color: rgba(232,93,4,0.4); color: #E85D04;
    box-shadow: 0 0 16px rgba(232,93,4,0.12);
  }

  /* ── SKILL PILLS ── */
  .as-pills { display: flex; flex-wrap: wrap; gap: 8px; }

  .as-pill {
    padding: 9px 16px;
    background: #111; border: 1px solid #1A1A1A;
    border-radius: 4px; font-size: 12px; font-weight: 500; color: #444;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.18s;
  }

  .as-pill:hover { border-color: rgba(232,93,4,0.3); color: #F0F0F0; }

  .as-pill.sel {
    background: rgba(232,93,4,0.09); border-color: rgba(232,93,4,0.4); color: #E85D04;
    box-shadow: 0 0 12px rgba(232,93,4,0.1);
  }

  /* ── CITY CARDS ── */
  .as-city-grid { display: flex; flex-direction: column; gap: 10px; }

  .as-city-btn {
    padding: 18px 20px; text-align: left;
    background: #111; border: 1px solid #1A1A1A;
    border-radius: 4px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s; position: relative; overflow: hidden;
  }

  .as-city-btn::before {
    content: '';
    position: absolute; left: 0; top: 15%; bottom: 15%;
    width: 2px; border-radius: 2px; background: #E85D04;
    transform: scaleY(0); transition: transform 0.25s;
  }

  .as-city-btn:hover { border-color: rgba(232,93,4,0.25); padding-left: 24px; }
  .as-city-btn:hover::before { transform: scaleY(1); }

  .as-city-btn.sel {
    background: rgba(232,93,4,0.07); border-color: rgba(232,93,4,0.35);
    padding-left: 24px; box-shadow: 0 0 16px rgba(232,93,4,0.1);
  }

  .as-city-btn.sel::before { transform: scaleY(1); }

  .as-city-name {
    font-size: 14px; font-weight: 600; color: #666; margin-bottom: 3px; transition: color 0.2s;
  }

  .as-city-btn.sel .as-city-name, .as-city-btn:hover .as-city-name { color: #E85D04; }

  .as-city-sub { font-size: 11px; color: #2A2A2A; line-height: 1.4; }

  /* ── RIGHT PANEL ── */
  .as-right { display: flex; flex-direction: column; gap: 12px; }

  .as-summary-card {
    background: #0F0F0F; border: 1px solid #1A1A1A;
    border-radius: 4px; padding: 22px; position: relative; overflow: hidden;
  }

  .as-summary-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.3), transparent);
  }

  .as-summary-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; color: #F0F0F0; letter-spacing: 0.06em; margin-bottom: 16px;
  }

  .as-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; border-bottom: 1px solid #111;
  }

  .as-summary-row:last-child { border-bottom: none; }

  .as-summary-key {
    font-size: 10px; color: #2A2A2A; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700;
  }

  .as-summary-val {
    font-size: 12px; font-weight: 600; color: #333; text-align: right;
    max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .as-summary-val.filled { color: #E85D04; }

  .as-steps-card {
    background: #0F0F0F; border: 1px solid #1A1A1A; border-radius: 4px; padding: 22px;
  }

  .as-steps-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; color: #F0F0F0; letter-spacing: 0.06em; margin-bottom: 16px;
  }

  .as-step-item {
    display: flex; align-items: center; gap: 12px;
    padding: 9px 0; border-bottom: 1px solid #111;
  }

  .as-step-item:last-child { border-bottom: none; }

  .as-step-num {
    width: 22px; height: 22px; border-radius: 4px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 12px;
  }

  .as-step-num.done { background: rgba(232,93,4,0.15); color: #E85D04; border: 1px solid rgba(232,93,4,0.3); }
  .as-step-num.active { background: rgba(232,93,4,0.2); color: #E85D04; border: 1px solid rgba(232,93,4,0.5); box-shadow: 0 0 10px rgba(232,93,4,0.2); }
  .as-step-num.pending { background: #141414; color: #2A2A2A; border: 1px solid #1A1A1A; }

  .as-step-info-label { font-size: 12px; font-weight: 500; }

  /* ── NAV ── */
  .as-nav {
    display: flex; justify-content: space-between; align-items: center; margin-top: 16px;
  }

  .as-back {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 22px; background: transparent; color: #2A2A2A;
    border: 1px solid #1A1A1A; border-radius: 40px;
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
  }

  .as-back:hover:not(:disabled) { border-color: #333; color: #666; }
  .as-back:disabled { opacity: 0.3; cursor: not-allowed; }

  .as-next {
    display: flex; align-items: center; gap: 8px;
    padding: 13px 32px; background: #E85D04; color: #fff;
    border: none; border-radius: 40px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.22s; box-shadow: 0 0 28px rgba(232,93,4,0.3);
    position: relative; overflow: hidden;
  }

  .as-next::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
    opacity: 0; transition: opacity 0.2s;
  }

  .as-next:hover:not(:disabled) {
    background: #FF6B1A; box-shadow: 0 0 44px rgba(232,93,4,0.5); transform: translateY(-2px);
  }

  .as-next:hover::before { opacity: 1; }
  .as-next:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── DONE ── */
  .as-done {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; min-height: 80vh; padding: 48px 32px;
  }

  .as-done-ring {
    width: 90px; height: 90px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.08); border: 1px solid rgba(232,93,4,0.3);
    box-shadow: 0 0 40px rgba(232,93,4,0.2), inset 0 0 20px rgba(232,93,4,0.06);
    margin-bottom: 28px; animation: ring-pop 0.4s ease;
  }

  @keyframes ring-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .as-done-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; line-height: 0.92; color: #F0F0F0; letter-spacing: 0.02em; margin-bottom: 8px;
  }

  .as-done-title span { color: #E85D04; }
  .as-done-sub { font-size: 14px; color: #444; font-weight: 300; margin-bottom: 36px; }

  .as-result-box {
    background: #0F0F0F; border: 1px solid #1A1A1A;
    border-radius: 4px; padding: 28px 40px;
    margin-bottom: 32px; min-width: 280px; position: relative; overflow: hidden;
  }

  .as-result-box::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #E85D04, transparent);
  }

  .as-result-label {
    font-size: 10px; font-weight: 700; color: #E85D04;
    letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px;
  }

  .as-result-level {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px; color: #F0F0F0; letter-spacing: 0.04em; line-height: 1; margin-bottom: 8px;
  }

  .as-result-meta { font-size: 13px; color: #444; }
  .as-result-meta span { color: #E85D04; font-weight: 600; }

  .as-conf-track { height: 3px; background: #141414; border-radius: 2px; margin-top: 16px; overflow: hidden; }

  .as-conf-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #7A2E01, #E85D04, #FF6B1A);
    animation: conf-in 1s 0.3s ease both;
  }

  @keyframes conf-in { from { width: 0; } }

  .as-done-btns { display: flex; gap: 12px; }

  .as-done-primary {
    padding: 14px 28px; background: #E85D04; color: #fff;
    border: none; border-radius: 40px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.22s;
    box-shadow: 0 0 28px rgba(232,93,4,0.3);
  }

  .as-done-primary:hover { background: #FF6B1A; box-shadow: 0 0 44px rgba(232,93,4,0.5); transform: translateY(-2px); }

  .as-done-secondary {
    padding: 14px 24px; background: transparent; color: #444;
    border: 1px solid #1A1A1A; border-radius: 40px;
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }

  .as-done-secondary:hover { border-color: #333; color: #888; }

  @media (max-width: 900px) { .as-body { grid-template-columns: 1fr; } .as-right { display: none; } }
  @media (max-width: 640px) {
    .as-wrap { padding: 20px 16px 40px; }
    .as-title { font-size: 40px; }
    .as-domain-grid { grid-template-columns: 1fr; }
    .as-size-grid { grid-template-columns: repeat(2,1fr); }
    .as-done-btns { flex-direction: column; }
  }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
`;

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ level: string; confidence: number; domain: string } | null>(null);
  const [form, setForm] = useState({
  domain: "", capital: "", revenue: "", clients: "",
  years_experience: "",
  teamSize: "", skills: [] as string[], tier: "",
});
  const navigate = useNavigate();

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleNext = async () => {
    if (step < steps.length - 1) { setStep((s) => s + 1); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/assessment/submit/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); setDone(true); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const summaryRows = [
  { key: "Industry",    val: form.domain },
  { key: "Capital",     val: form.capital          ? `₹${form.capital}`          : "" },
  { key: "Revenue",     val: form.revenue          ? `₹${form.revenue}`          : "" },
  { key: "Experience",  val: form.years_experience ? `${form.years_experience}y` : "" },
  { key: "Team",        val: form.teamSize },
  { key: "Skills",      val: form.skills.length    ? `${form.skills.length} selected` : "" },
  { key: "Location",    val: form.tier },
];

  if (done) return (
    <>
      <style>{css}</style>
      <div className="as-wrap">
        <div className="as-done">
          <div className="as-done-ring"><CheckCircle size={40} color="#E85D04" /></div>
          <div className="as-done-title">Assessment <span>Complete!</span></div>
          <div className="as-done-sub">AI has analyzed your inputs — here are your results</div>
          <div className="as-result-box">
            <div className="as-result-label">Your Business Level</div>
            <div className="as-result-level">{result?.level ?? "Intermediate"}</div>
            <div className="as-result-meta">
              <span>{result?.domain}</span> · Confidence: <span>{result?.confidence ?? 87}%</span>
            </div>
            <div className="as-conf-track">
              <div className="as-conf-fill" style={{ width: `${result?.confidence ?? 87}%` }} />
            </div>
          </div>
          <div className="as-done-btns">
            <button className="as-done-primary" onClick={() => navigate("/recommendations")}>
              See My Recommendations →
            </button>
            <button className="as-done-secondary" onClick={() => navigate("/roadmap")}>
              View Roadmap
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="as-wrap">

        {/* HEADER */}
        <div className="as-header">
          <div>
            <div className="as-eyebrow">
              <div className="as-eyebrow-dot" /> Module 03 · Phase 1
            </div>
            <div className="as-title">Capability <span>Assessment</span></div>
            <div className="as-subtitle">Answer {steps.length} quick questions — AI determines your exact business level</div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="as-progress">
          <div className="as-progress-meta">
            <span>Step {step + 1} of {steps.length} — {steps[step].title}</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="as-step-bars">
            {steps.map((s, i) => (
              <div key={s.id} className={`as-step-bar ${i < step ? "done" : i === step ? "active" : ""}`} />
            ))}
          </div>
          <div className="as-step-names">
            {steps.map((s, i) => (
              <div key={s.id} className="as-step-name"
                style={{ color: i === step ? "#E85D04" : i < step ? "#3A3A3A" : "#1E1E1E" }}>
                {s.id.charAt(0).toUpperCase() + s.id.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* BODY: left form + right summary */}
        <div className="as-body">

          <div className="as-card">
            <div className="as-card-title">{steps[step].title}</div>
            <div className="as-card-desc">{steps[step].desc}</div>

            {step === 0 && (
              <div className="as-domain-grid">
                {domains.map((d) => (
                  <button key={d} className={`as-domain-btn ${form.domain === d ? "sel" : ""}`}
                    onClick={() => update("domain", d)}>{d}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
  <div className="as-fields">
    {[
      { label: "Monthly Capital / Cash Flow (₹)", key: "capital",          ph: "e.g. 2,00,000" },
      { label: "Monthly Revenue (₹)",             key: "revenue",          ph: "e.g. 1,50,000" },
      { label: "Number of Active Clients",        key: "clients",          ph: "e.g. 5"        },
      { label: "Years in Business",               key: "years_experience", ph: "e.g. 2"        },
    ].map((f) => (
      <div key={f.key}>
        <label className="as-label">{f.label}</label>
        <input className="as-input" placeholder={f.ph}
          value={form[f.key as keyof typeof form] as string}
          onChange={(e) => update(f.key, e.target.value)} />
      </div>
    ))}
  </div>
)}

            {step === 2 && (
              <>
                <label className="as-label">Team Size</label>
                <div className="as-size-grid">
                  {["Solo","2–5","6–15","15+"].map((s) => (
                    <button key={s} className={`as-size-btn ${form.teamSize === s ? "sel" : ""}`}
                      onClick={() => update("teamSize", s)}>{s}</button>
                  ))}
                </div>
                <div style={{ marginBottom: 22 }} />
                <label className="as-label">Key Skills</label>
                <div className="as-pills">
                  {skillOptions.map((s) => (
                    <button key={s} className={`as-pill ${form.skills.includes(s) ? "sel" : ""}`}
                      onClick={() => setForm((f) => ({
                        ...f,
                        skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
                      }))}>{s}</button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="as-city-grid">
                {[
                  { val: "metro", label: "Metro City",   sub: "Mumbai, Delhi, Bangalore, Chennai" },
                  { val: "tier2", label: "Tier-2 City",  sub: "Pune, Surat, Jaipur, Coimbatore" },
                  { val: "rural", label: "Rural / Town", sub: "Sub-district & rural markets" },
                ].map((o) => (
                  <button key={o.val} className={`as-city-btn ${form.tier === o.val ? "sel" : ""}`}
                    onClick={() => update("tier", o.val)}>
                    <div className="as-city-name">{o.label}</div>
                    <div className="as-city-sub">{o.sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="as-right">
            <div className="as-summary-card">
              <div className="as-summary-title">Your Answers</div>
              {summaryRows.map((r) => (
                <div key={r.key} className="as-summary-row">
                  <span className="as-summary-key">{r.key}</span>
                  <span className={`as-summary-val ${r.val ? "filled" : ""}`}>{r.val || "—"}</span>
                </div>
              ))}
            </div>

            <div className="as-steps-card">
              <div className="as-steps-title">All Steps</div>
              {steps.map((s, i) => (
                <div key={s.id} className="as-step-item">
                  <div className={`as-step-num ${i < step ? "done" : i === step ? "active" : "pending"}`}>
                    {i < step ? <CheckCircle size={11} color="#E85D04" /> : i + 1}
                  </div>
                  <div className="as-step-info-label"
                    style={{ color: i === step ? "#E85D04" : i < step ? "#555" : "#2A2A2A" }}>
                    {s.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NAV */}
        <div className="as-nav">
          <button className="as-back" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft size={14} /> Back
          </button>
          <button className="as-next" onClick={handleNext} disabled={loading}>
            {loading
              ? <><Loader2 size={14} className="spin" /> Analyzing…</>
              : step === steps.length - 1
              ? <>Submit & Analyze <ChevronRight size={14} /></>
              : <>Next <ChevronRight size={14} /></>
            }
          </button>
        </div>

      </div>
    </>
  );
}