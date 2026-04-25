import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Loader2, CheckCircle } from "lucide-react";
import { User } from "../App";

const API = "http://localhost:8000";

interface Props { onLogin: (user: User) => void; }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');

  :root {
    --blue:       #1558F6;
    --blue-dark:  #0D3FBF;
    --blue-light: #4A7FFF;
    --cyan:       #00C2FF;
    --indigo:     #3B4CF8;
    --bg:         #F0F4FF;
    --surface:    #FFFFFF;
    --border:     #D4DCFF;
    --border2:    #C2CCFF;
    --text:       #0A1440;
    --muted:      #5870B0;
    --muted2:     #8090C0;
    --hero-bg:    #0C1A6E;
  }

  .su-wrap {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .su-wrap { grid-template-columns: 1fr; }
    .su-left { display: none; }
  }

  /* ── LEFT PANEL ── */
  .su-left {
    position: relative;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 56px;
    overflow: hidden;
    background: var(--hero-bg);
  }

  /* Dot grid */
  .su-left::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(ellipse 80% 80% at 40% 30%, black 20%, transparent 80%);
  }

  .su-left-blob1 {
    position: absolute; z-index: 0;
    top: -15%; right: -10%;
    width: 70%; height: 70%;
    border-radius: 50%;
    background: radial-gradient(circle,
      rgba(0,194,255,0.18) 0%,
      rgba(21,88,246,0.1) 40%,
      transparent 70%
    );
    filter: blur(40px);
    animation: blob-float 12s ease-in-out infinite;
  }

  .su-left-blob2 {
    position: absolute; z-index: 0;
    bottom: 5%; left: 10%;
    width: 55%; height: 55%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,76,248,0.22) 0%, transparent 65%);
    filter: blur(48px);
    animation: blob-float 16s ease-in-out infinite reverse;
  }

  .su-left-streak {
    position: absolute; z-index: 1;
    top: 0; right: 28%;
    width: 1px; height: 60%;
    background: linear-gradient(to bottom, transparent, rgba(0,194,255,0.55), transparent);
    transform: rotate(12deg) translateX(100px);
    animation: streak-glow 5s ease-in-out infinite;
  }

  @keyframes blob-float {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(2%, 3%) scale(1.04); }
    66% { transform: translate(-2%, 1%) scale(0.97); }
  }

  @keyframes streak-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.9; }
  }

  .su-left-fade {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 1;
    height: 180px;
    background: linear-gradient(to top, rgba(8,14,55,0.95) 0%, transparent 100%);
    pointer-events: none;
  }

  .su-left-content { position: relative; z-index: 2; }

  .su-left-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 14px 5px 6px;
    background: rgba(0,194,255,0.1);
    border: 1px solid rgba(0,194,255,0.3);
    border-radius: 100px;
    font-size: 11px; font-weight: 600;
    color: rgba(200,235,255,0.9);
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 28px;
  }

  .su-badge-live {
    display: flex; align-items: center; gap: 4px;
    background: var(--cyan);
    color: #002040; font-size: 9px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 8px; border-radius: 100px;
  }

  .su-badge-live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #003060;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  .su-left-h {
    font-family: 'Syne', sans-serif;
    font-size: clamp(44px, 4.5vw, 68px);
    line-height: 0.92;
    color: #FFFFFF;
    margin-bottom: 22px;
    letter-spacing: -0.02em;
    font-weight: 800;
  }

  .su-left-h .accent {
    background: linear-gradient(135deg, var(--cyan) 0%, #74AAFF 50%, #A78BFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .su-left-p {
    font-size: 14px; color: rgba(160,195,255,0.6);
    line-height: 1.75; font-weight: 400;
    max-width: 320px;
    margin-bottom: 32px;
    border-left: 2px solid rgba(0,194,255,0.25);
    padding-left: 16px;
  }

  .su-checklist {
    display: flex; flex-direction: column; gap: 12px;
    margin-bottom: 40px;
  }

  .su-check-item {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: rgba(180,210,255,0.7);
    font-weight: 400;
  }

  .su-check-icon {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,194,255,0.12);
    border: 1px solid rgba(0,194,255,0.25);
    flex-shrink: 0;
  }

  .su-stats {
    display: flex; gap: 36px;
    padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .su-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 30px; font-weight: 800;
    background: linear-gradient(135deg, var(--cyan), #74AAFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .su-stat-label {
    font-size: 10px; color: rgba(120,160,220,0.5);
    margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;
  }

  /* ── RIGHT PANEL ── */
  .su-right {
    display: flex; align-items: center; justify-content: center;
    padding: 40px;
    background: var(--surface);
    position: relative;
    border-left: 1px solid var(--border);
    overflow-y: auto;
  }

  .su-right::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--blue), var(--cyan), var(--indigo));
  }

  .su-right::after {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(21,88,246,0.05) 0%, transparent 65%);
    pointer-events: none;
  }

  .su-form-wrap {
    width: 100%; max-width: 380px; position: relative; z-index: 1;
    padding: 20px 0;
  }

  .su-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }

  .su-logo-icon {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: var(--blue);
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(21,88,246,0.4);
    transition: all 0.3s;
  }

  .su-logo-icon:hover {
    transform: rotate(-8deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(21,88,246,0.55);
  }

  .su-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; color: var(--text);
  }

  .su-logo-text span { color: var(--blue); }

  .su-heading {
    font-family: 'Syne', sans-serif;
    font-size: 40px; line-height: 0.94;
    color: var(--text); letter-spacing: -0.02em;
    font-weight: 800; margin-bottom: 8px;
  }

  .su-heading span {
    background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .su-subtext {
    font-size: 14px; color: var(--muted); font-weight: 400;
    margin-bottom: 28px;
  }

  .su-field { margin-bottom: 16px; }

  .su-label {
    display: block;
    font-size: 11px; font-weight: 700;
    color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 7px;
  }

  .su-input {
    width: 100%; padding: 13px 16px;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none;
  }

  .su-input::placeholder { color: var(--muted2); }

  .su-input:focus {
    border-color: var(--blue);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(21,88,246,0.1);
  }

  .su-error {
    font-size: 11px; color: #D93025;
    margin-top: 5px; font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }

  .su-global-error {
    font-size: 12px; color: #D93025;
    text-align: center; margin-top: 8px;
    background: rgba(217,48,37,0.06);
    border: 1px solid rgba(217,48,37,0.15);
    border-radius: 6px; padding: 8px 12px;
  }

  .su-btn {
    width: 100%; margin-top: 20px; padding: 15px;
    background: var(--blue); color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    border: none; border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(21,88,246,0.35);
    position: relative; overflow: hidden;
  }

  .su-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    opacity: 0; transition: opacity 0.25s;
  }

  .su-btn:hover:not(:disabled) {
    background: var(--blue-dark);
    box-shadow: 0 8px 32px rgba(21,88,246,0.5);
    transform: translateY(-1px);
  }

  .su-btn:hover:not(:disabled)::before { opacity: 1; }
  .su-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .su-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .su-divider-line { flex: 1; height: 1px; background: var(--border); }
  .su-divider-text { font-size: 11px; color: var(--muted2); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }

  .su-footer { text-align: center; font-size: 13px; color: var(--muted); }
  .su-footer a { color: var(--blue); font-weight: 700; text-decoration: none; transition: color 0.2s; }
  .su-footer a:hover { color: var(--blue-dark); }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
`;

const perks = [
  "Free AI capability assessment",
  "Personalized 6/12/24-month roadmap",
  "Risk radar & market intelligence",
];

export default function Signup({ onLogin }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setGlobalError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setGlobalError(data.error || "Signup failed"); return; }
      onLogin({ id: data.id, name: data.name, email: data.email ?? form.email });
      navigate("/assessment");
    } catch {
      setGlobalError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name", key: "name", type: "text", placeholder: "Ravi Kumar" },
    { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
    { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="su-wrap">

        {/* LEFT: Brand panel */}
        <div className="su-left">
          <div className="su-left-blob1" />
          <div className="su-left-blob2" />
          <div className="su-left-streak" />
          <div className="su-left-fade" />

          <div className="su-left-content">
            <div className="su-left-badge">
              <span className="su-badge-live">
                <span className="su-badge-live-dot" />
                Free
              </span>
              Free to get started
            </div>

            <h1 className="su-left-h">
              Start Your<br />Business<br /><span className="accent">Journey.</span>
            </h1>

            <p className="su-left-p">
              Join thousands of Indian entrepreneurs who know exactly where they stand — and where they're headed.
            </p>

            <div className="su-checklist">
              {perks.map((p) => (
                <div key={p} className="su-check-item">
                  <div className="su-check-icon">
                    <CheckCircle size={12} color="#00C2FF" />
                  </div>
                  <span>{p}</span>
                </div>
              ))}
            </div>

            <div className="su-stats">
              {[
                { val: "15+", label: "Industries" },
                { val: "16", label: "AI Features" },
                { val: "₹50L+", label: "Revenue Mapped" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="su-stat-val">{s.val}</div>
                  <div className="su-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Form panel */}
        <div className="su-right">
          <div className="su-form-wrap">

            <div className="su-logo">
              <div className="su-logo-icon">
                <Zap size={15} color="#fff" />
              </div>
              <div className="su-logo-text">Field<span>Scope</span></div>
            </div>

            <div className="su-heading">
              Create your<br /><span>Account.</span>
            </div>
            <div className="su-subtext">Start your free business assessment today</div>

            {fields.map((f) => (
              <div key={f.key} className="su-field">
                <label className="su-label">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="su-input"
                />
                {errors[f.key] && <div className="su-error">· {errors[f.key]}</div>}
              </div>
            ))}

            {globalError && <div className="su-global-error">{globalError}</div>}

            <button className="su-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><Loader2 size={14} className="spin" /> Creating account…</>
                : "Create Account →"
              }
            </button>

            <div className="su-divider">
              <div className="su-divider-line" />
              <div className="su-divider-text">or</div>
              <div className="su-divider-line" />
            </div>

            <div className="su-footer">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}