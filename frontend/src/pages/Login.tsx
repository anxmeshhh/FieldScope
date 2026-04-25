import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
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

  .lg-wrap {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .lg-wrap { grid-template-columns: 1fr; }
    .lg-left { display: none; }
  }

  /* ── LEFT PANEL ── */
  .lg-left {
    position: relative;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 56px;
    overflow: hidden;
    background: var(--hero-bg);
  }

  /* Dot grid */
  .lg-left::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(ellipse 80% 80% at 40% 30%, black 20%, transparent 80%);
  }

  /* Cyan blob */
  .lg-left-blob1 {
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

  /* Indigo blob */
  .lg-left-blob2 {
    position: absolute; z-index: 0;
    bottom: 5%; left: 10%;
    width: 55%; height: 55%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,76,248,0.22) 0%, transparent 65%);
    filter: blur(48px);
    animation: blob-float 16s ease-in-out infinite reverse;
  }

  /* Light streak */
  .lg-left-streak {
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

  /* Bottom fade to bg */
  .lg-left-fade {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 1;
    height: 180px;
    background: linear-gradient(to top, rgba(8,14,55,0.95) 0%, transparent 100%);
    pointer-events: none;
  }

  .lg-left-content { position: relative; z-index: 2; }

  .lg-left-badge {
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

  .lg-badge-live {
    display: flex; align-items: center; gap: 4px;
    background: var(--cyan);
    color: #002040; font-size: 9px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 8px; border-radius: 100px;
  }

  .lg-badge-live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #003060;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  .lg-left-h {
    font-family: 'Syne', sans-serif;
    font-size: clamp(44px, 4.5vw, 68px);
    line-height: 0.92;
    color: #FFFFFF;
    margin-bottom: 22px;
    letter-spacing: -0.02em;
    font-weight: 800;
  }

  .lg-left-h .accent {
    background: linear-gradient(135deg, var(--cyan) 0%, #74AAFF 50%, #A78BFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lg-left-p {
    font-size: 14px; color: rgba(160,195,255,0.6);
    line-height: 1.75; font-weight: 400;
    max-width: 320px;
    margin-bottom: 40px;
    border-left: 2px solid rgba(0,194,255,0.25);
    padding-left: 16px;
  }

  .lg-stats {
    display: flex; gap: 36px;
    padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .lg-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 30px; font-weight: 800;
    background: linear-gradient(135deg, var(--cyan), #74AAFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .lg-stat-label {
    font-size: 10px; color: rgba(120,160,220,0.5);
    margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;
  }

  /* ── RIGHT PANEL ── */
  .lg-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px;
    background: var(--surface);
    position: relative;
    border-left: 1px solid var(--border);
  }

  /* Top gradient bar */
  .lg-right::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--blue), var(--cyan), var(--indigo));
  }

  /* Subtle bg tint top-right */
  .lg-right::after {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(21,88,246,0.05) 0%, transparent 65%);
    pointer-events: none;
  }

  .lg-form-wrap {
    width: 100%; max-width: 380px; position: relative; z-index: 1;
  }

  /* Logo */
  .lg-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 44px;
  }

  .lg-logo-icon {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: var(--blue);
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(21,88,246,0.4);
    transition: all 0.3s;
  }

  .lg-logo-icon:hover {
    transform: rotate(-8deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(21,88,246,0.55);
  }

  .lg-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; color: var(--text);
  }

  .lg-logo-text span { color: var(--blue); }

  /* Heading */
  .lg-heading {
    font-family: 'Syne', sans-serif;
    font-size: 42px; line-height: 0.94;
    color: var(--text); letter-spacing: -0.02em;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .lg-heading span {
    background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lg-subtext {
    font-size: 14px; color: var(--muted); font-weight: 400;
    margin-bottom: 36px;
  }

  /* Fields */
  .lg-field { margin-bottom: 18px; }

  .lg-label {
    display: block;
    font-size: 11px; font-weight: 700;
    color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 8px;
  }

  .lg-input {
    width: 100%; padding: 13px 16px;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .lg-input::placeholder { color: var(--muted2); }

  .lg-input:focus {
    border-color: var(--blue);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(21,88,246,0.1);
  }

  .lg-error {
    font-size: 12px; color: #D93025;
    margin-top: 12px; text-align: center;
    background: rgba(217,48,37,0.06);
    border: 1px solid rgba(217,48,37,0.15);
    border-radius: 6px; padding: 8px 12px;
  }

  /* Forgot */
  .lg-forgot {
    display: block; text-align: right;
    font-size: 12px; color: var(--muted2);
    margin-top: -8px; margin-bottom: 28px;
    text-decoration: none;
    transition: color 0.2s;
    font-weight: 500;
  }

  .lg-forgot:hover { color: var(--blue); }

  /* Submit */
  .lg-btn {
    width: 100%; padding: 15px;
    background: var(--blue);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    letter-spacing: 0.02em;
    border: none; border-radius: 8px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(21,88,246,0.35);
    position: relative; overflow: hidden;
  }

  .lg-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    opacity: 0; transition: opacity 0.25s;
  }

  .lg-btn:hover:not(:disabled) {
    background: var(--blue-dark);
    box-shadow: 0 8px 32px rgba(21,88,246,0.5);
    transform: translateY(-1px);
  }

  .lg-btn:hover:not(:disabled)::before { opacity: 1; }
  .lg-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Divider */
  .lg-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 28px 0;
  }

  .lg-divider-line { flex: 1; height: 1px; background: var(--border); }
  .lg-divider-text { font-size: 11px; color: var(--muted2); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }

  /* Footer */
  .lg-footer {
    text-align: center; font-size: 13px; color: var(--muted);
  }

  .lg-footer a {
    color: var(--blue); font-weight: 700;
    text-decoration: none; transition: color 0.2s;
  }

  .lg-footer a:hover { color: var(--blue-dark); }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
`;

export default function Login({ onLogin }: Props) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials"); return; }
      onLogin({ id: data.id, name: data.name, email: data.email ?? form.email });
      navigate(data.has_assessment ? "/dashboard" : "/assessment");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="lg-wrap">

        {/* LEFT: Brand panel */}
        <div className="lg-left">
          <div className="lg-left-blob1" />
          <div className="lg-left-blob2" />
          <div className="lg-left-streak" />
          <div className="lg-left-fade" />

          <div className="lg-left-content">
            <div className="lg-left-badge">
              <span className="lg-badge-live">
                <span className="lg-badge-live-dot" />
                Live
              </span>
              India's AI Business Platform
            </div>

            <h1 className="lg-left-h">
              Know What<br />You Can<br /><span className="accent">Build.</span>
            </h1>

            <p className="lg-left-p">
              FieldScope maps your industry, assesses your capabilities with AI, and delivers a personalized growth strategy — built for Indian businesses.
            </p>

            <div className="lg-stats">
              {[
                { val: "15+", label: "Industries" },
                { val: "16", label: "AI Features" },
                { val: "₹50L+", label: "Revenue Mapped" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="lg-stat-val">{s.val}</div>
                  <div className="lg-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Form panel */}
        <div className="lg-right">
          <div className="lg-form-wrap">

            <div className="lg-logo">
              <div className="lg-logo-icon">
                <Zap size={15} color="#fff" />
              </div>
              <div className="lg-logo-text">Field<span>Scope</span></div>
            </div>

            <div className="lg-heading">
              Welcome<br /><span>Back.</span>
            </div>
            <div className="lg-subtext">Sign in to your FieldScope account</div>

            <div className="lg-field">
              <label className="lg-label">Email</label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="lg-input"
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="lg-input"
              />
            </div>

            <a href="#" className="lg-forgot">Forgot password?</a>

            {error && <div className="lg-error">{error}</div>}

            <button className="lg-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><Loader2 size={14} className="spin" /> Signing in…</>
                : "Sign In →"
              }
            </button>

            <div className="lg-divider">
              <div className="lg-divider-line" />
              <div className="lg-divider-text">or</div>
              <div className="lg-divider-line" />
            </div>

            <div className="lg-footer">
              Don't have an account?{" "}
              <Link to="/signup">Sign up free</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}