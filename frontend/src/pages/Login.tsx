import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { User } from "../App";

const API = "http://localhost:8000";

interface Props { onLogin: (user: User) => void; }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .lg-wrap {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'DM Sans', sans-serif;
    background: #0A0A0A;
    color: #F0F0F0;
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
    padding: 48px;
    overflow: hidden;
    background: #0D0D0D;
  }

  /* Diagonal stripe texture like PeerFund */
  .lg-left::before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 18px,
      rgba(232,93,4,0.04) 18px,
      rgba(232,93,4,0.04) 19px
    );
  }

  /* Central radial orange glow like Neurova */
  .lg-left::after {
    content: '';
    position: absolute;
    top: 20%; left: 30%;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,93,4,0.28) 0%, rgba(180,50,0,0.12) 40%, transparent 70%);
    pointer-events: none;
  }

  .lg-left-content { position: relative; z-index: 2; }

  .lg-left-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px;
    background: rgba(232,93,4,0.1);
    border: 1px solid rgba(232,93,4,0.25);
    border-radius: 40px;
    font-size: 11px; font-weight: 600;
    color: #E85D04; letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 24px;
  }

  .lg-left-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #E85D04;
    box-shadow: 0 0 8px #E85D04;
    animation: blink 2s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }

  .lg-left-h {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 5vw, 72px);
    line-height: 0.95;
    color: #F0F0F0;
    margin-bottom: 20px;
    letter-spacing: 0.02em;
  }

  .lg-left-h span { color: #E85D04; }

  .lg-left-p {
    font-size: 14px; color: #555;
    line-height: 1.7; font-weight: 300;
    max-width: 320px;
    margin-bottom: 36px;
  }

  .lg-stats {
    display: flex; gap: 32px;
    padding-top: 24px;
    border-top: 1px solid #1A1A1A;
  }

  .lg-stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px; color: #E85D04;
    line-height: 1;
  }

  .lg-stat-label { font-size: 11px; color: #3A3A3A; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── RIGHT PANEL ── */
  .lg-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px;
    background: #0C0C0C;
    position: relative;
  }

  /* Subtle top-right glow */
  .lg-right::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,93,4,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .lg-form-wrap { width: 100%; max-width: 380px; position: relative; z-index: 1; }

  /* Logo */
  .lg-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 40px;
  }

  .lg-logo-icon {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.1);
    border: 1px solid rgba(232,93,4,0.2);
    border-radius: 8px;
    box-shadow: 0 0 16px rgba(232,93,4,0.15);
  }

  .lg-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 0.1em; color: #F0F0F0;
  }

  .lg-logo-text span { color: #E85D04; }

  /* Heading */
  .lg-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px; line-height: 0.95;
    color: #F0F0F0; letter-spacing: 0.02em;
    margin-bottom: 6px;
  }

  .lg-heading span { color: #E85D04; }

  .lg-subtext { font-size: 13px; color: #444; font-weight: 300; margin-bottom: 32px; }

  /* Fields */
  .lg-field { margin-bottom: 16px; }

  .lg-label {
    display: block;
    font-size: 11px; font-weight: 600;
    color: #444; letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 8px;
  }

  .lg-input {
    width: 100%; padding: 13px 16px;
    background: #111;
    border: 1px solid #1E1E1E;
    border-radius: 4px;
    color: #F0F0F0;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .lg-input::placeholder { color: #2E2E2E; }

  .lg-input:focus {
    border-color: rgba(232,93,4,0.45);
    box-shadow: 0 0 0 3px rgba(232,93,4,0.06);
  }

  .lg-error { font-size: 12px; color: #E85D04; margin-top: 12px; text-align: center; }

  /* Forgot */
  .lg-forgot {
    display: block; text-align: right;
    font-size: 11px; color: #333;
    margin-top: -8px; margin-bottom: 24px;
    text-decoration: none;
    transition: color 0.2s;
  }

  .lg-forgot:hover { color: #E85D04; }

  /* Submit */
  .lg-btn {
    width: 100%; padding: 15px;
    background: #E85D04;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.04em;
    border: none; border-radius: 4px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 0 28px rgba(232,93,4,0.3);
  }

  .lg-btn:hover:not(:disabled) {
    background: #FF6B1A;
    box-shadow: 0 0 40px rgba(232,93,4,0.5);
    transform: translateY(-1px);
  }

  .lg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Divider */
  .lg-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0;
  }

  .lg-divider-line { flex: 1; height: 1px; background: #1A1A1A; }
  .lg-divider-text { font-size: 11px; color: #2A2A2A; letter-spacing: 0.06em; text-transform: uppercase; }

  /* Footer */
  .lg-footer {
    text-align: center; font-size: 13px; color: #333;
  }

  .lg-footer a {
    color: #E85D04; font-weight: 600;
    text-decoration: none; transition: color 0.2s;
  }

  .lg-footer a:hover { color: #FF6B1A; }

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
          <div className="lg-left-content">
            <div className="lg-left-badge">
              <div className="lg-left-badge-dot" />
              India's AI Business Platform
            </div>
            <h1 className="lg-left-h">
              Know What<br />You Can<br /><span>Build.</span>
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
                <Zap size={15} color="#E85D04" />
              </div>
              <div className="lg-logo-text">Field<span>Scope</span></div>
            </div>

            <div className="lg-heading">Welcome<br /><span>Back.</span></div>
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