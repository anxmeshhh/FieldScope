import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Loader2, CheckCircle } from "lucide-react";
import { User } from "../App";

const API = "http://localhost:8000";

interface Props { onLogin: (user: User) => void; }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .su-wrap {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'DM Sans', sans-serif;
    background: #0A0A0A;
    color: #F0F0F0;
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
    padding: 48px;
    overflow: hidden;
    background: #0D0D0D;
  }

  .su-left::before {
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

  .su-left::after {
    content: '';
    position: absolute;
    top: 15%; left: 25%;
    width: 520px; height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,93,4,0.25) 0%, rgba(180,50,0,0.1) 40%, transparent 70%);
    pointer-events: none;
  }

  .su-left-content { position: relative; z-index: 2; }

  .su-left-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px;
    background: rgba(232,93,4,0.1);
    border: 1px solid rgba(232,93,4,0.25);
    border-radius: 40px;
    font-size: 11px; font-weight: 600;
    color: #E85D04; letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 24px;
  }

  .su-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #E85D04; box-shadow: 0 0 8px #E85D04;
    animation: blink 2s infinite;
  }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .su-left-h {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 5vw, 72px);
    line-height: 0.95; letter-spacing: 0.02em;
    color: #F0F0F0; margin-bottom: 20px;
  }

  .su-left-h span { color: #E85D04; }

  .su-left-p {
    font-size: 14px; color: #555;
    line-height: 1.7; font-weight: 300;
    max-width: 320px; margin-bottom: 28px;
  }

  .su-checklist { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }

  .su-check-item {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: #666;
  }

  .su-stats {
    display: flex; gap: 32px;
    padding-top: 24px;
    border-top: 1px solid #1A1A1A;
  }

  .su-stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px; color: #E85D04; line-height: 1;
  }

  .su-stat-label {
    font-size: 11px; color: #3A3A3A;
    margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em;
  }

  /* ── RIGHT PANEL ── */
  .su-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px;
    background: #0C0C0C;
    position: relative;
  }

  .su-right::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,93,4,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .su-form-wrap { width: 100%; max-width: 380px; position: relative; z-index: 1; }

  .su-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }

  .su-logo-icon {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.1);
    border: 1px solid rgba(232,93,4,0.2);
    border-radius: 8px;
    box-shadow: 0 0 16px rgba(232,93,4,0.15);
  }

  .su-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 0.1em; color: #F0F0F0;
  }

  .su-logo-text span { color: #E85D04; }

  .su-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px; line-height: 0.95; letter-spacing: 0.02em;
    color: #F0F0F0; margin-bottom: 6px;
  }

  .su-heading span { color: #E85D04; }

  .su-subtext { font-size: 13px; color: #444; font-weight: 300; margin-bottom: 28px; }

  .su-field { margin-bottom: 14px; }

  .su-label {
    display: block;
    font-size: 11px; font-weight: 600;
    color: #444; letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 7px;
  }

  .su-input {
    width: 100%; padding: 13px 16px;
    background: #111;
    border: 1px solid #1E1E1E;
    border-radius: 4px;
    color: #F0F0F0;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }

  .su-input::placeholder { color: #2E2E2E; }

  .su-input:focus {
    border-color: rgba(232,93,4,0.45);
    box-shadow: 0 0 0 3px rgba(232,93,4,0.06);
  }

  .su-error { font-size: 12px; color: #E85D04; margin-top: 5px; }
  .su-global-error { font-size: 12px; color: #E85D04; text-align: center; margin-top: 8px; }

  .su-btn {
    width: 100%; margin-top: 20px; padding: 15px;
    background: #E85D04; color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: 0.04em;
    border: none; border-radius: 4px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 0 28px rgba(232,93,4,0.3);
  }

  .su-btn:hover:not(:disabled) {
    background: #FF6B1A;
    box-shadow: 0 0 40px rgba(232,93,4,0.5);
    transform: translateY(-1px);
  }

  .su-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .su-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
  .su-divider-line { flex: 1; height: 1px; background: #1A1A1A; }
  .su-divider-text { font-size: 11px; color: #2A2A2A; letter-spacing: 0.06em; text-transform: uppercase; }

  .su-footer { text-align: center; font-size: 13px; color: #333; }
  .su-footer a { color: #E85D04; font-weight: 600; text-decoration: none; transition: color 0.2s; }
  .su-footer a:hover { color: #FF6B1A; }
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
          <div className="su-left-content">
            <div className="su-left-badge">
              <div className="su-badge-dot" />
              Free to get started
            </div>
            <h1 className="su-left-h">
              Start Your<br />Business<br /><span>Journey.</span>
            </h1>
            <p className="su-left-p">
              Join thousands of Indian entrepreneurs who know exactly where they stand — and where they're headed.
            </p>
            <div className="su-checklist">
              {perks.map((p) => (
                <div key={p} className="su-check-item">
                  <CheckCircle size={14} color="#E85D04" style={{ flexShrink: 0 }} />
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
                <Zap size={15} color="#E85D04" />
              </div>
              <div className="su-logo-text">Field<span>Scope</span></div>
            </div>

            <div className="su-heading">Create your<br /><span>Account.</span></div>
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
                {errors[f.key] && <div className="su-error">{errors[f.key]}</div>}
              </div>
            ))}

            {globalError && <div className="su-global-error">{globalError}</div>}

            <button className="su-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</>
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