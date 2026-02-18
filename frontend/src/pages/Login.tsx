import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { User } from "../App";

const API = "http://localhost:8000";

interface Props { onLogin: (user: User) => void; }

export default function Login({ onLogin }: Props) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onLogin({ id: data.id, name: data.name, email: data.email ?? form.email });
      navigate(data.has_assessment ? "/dashboard" : "/assessment");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(var(--cyan) / 0.15)", border: "1px solid hsl(var(--cyan) / 0.3)" }}>
            <Zap size={16} style={{ color: "hsl(var(--cyan))" }} />
          </div>
          <span className="font-syne font-black text-lg" style={{ color: "hsl(var(--foreground))" }}>FieldScope</span>
        </div>

        <div className="rounded-2xl border p-8"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h1 className="font-syne font-black text-2xl mb-1" style={{ color: "hsl(var(--foreground))" }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>Sign in to your FieldScope account</p>

          <div className="space-y-4">
            {[
              { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
              { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: "hsl(var(--navy-700))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                />
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-center" style={{ color: "hsl(var(--orange))" }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold" style={{ color: "hsl(var(--cyan))" }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}