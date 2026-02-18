import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle } from "lucide-react";

const steps = [
  { id: "domain", title: "Choose Your Industry", desc: "Select the primary domain you operate or plan to enter" },
  { id: "basics", title: "Business Basics", desc: "Tell us about your current business situation" },
  { id: "team", title: "Team & Experience", desc: "Your team size and experience level" },
  { id: "location", title: "Location & Market", desc: "Where do you operate?" },
];
const API = "http://localhost:8000";
const domains = ["Digital Marketing", "Construction & Real Estate", "D2C E-Commerce", "HealthTech", "FinTech", "AgriTech"];
const skillOptions = ["SEO", "Paid Ads", "Content", "Design", "Video", "Analytics", "Automation", "Sales"];

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ level: string; confidence: number; domain: string } | null>(null);
  const [form, setForm] = useState({
    domain: "",
    capital: "",
    revenue: "",
    clients: "",
    teamSize: "",
    skills: [] as string[],
    tier: "",
  });
  const navigate = useNavigate();

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch(`${API}/assessment/submit/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(form),
});
        const data = await res.json();
        if (res.ok) {
          setResult(data);
          setDone(true);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (done) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "hsl(var(--green) / 0.15)", border: "2px solid hsl(var(--green))" }}>
          <CheckCircle size={36} style={{ color: "hsl(var(--green))" }} />
        </div>
        <h2 className="font-syne font-black text-3xl mb-2" style={{ color: "hsl(var(--foreground))" }}>
          Assessment Complete!
        </h2>
        <p className="text-base mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          AI has analyzed your inputs
        </p>
        <div
          className="mt-4 mb-8 px-6 py-4 rounded-2xl border text-center"
          style={{ background: "hsl(var(--cyan) / 0.08)", borderColor: "hsl(var(--cyan) / 0.3)" }}
        >
          <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "hsl(var(--cyan))" }}>
            Your Level
          </div>
          <div className="font-syne font-black text-3xl gradient-text-cyan">
            {result?.level ?? "Intermediate"}
          </div>
          <div className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {result?.domain} · Confidence: {result?.confidence ?? 87}%
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/recommendations")}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}>
            See My Recommendations →
          </button>
          <button onClick={() => navigate("/roadmap")}
            className="px-6 py-3 rounded-xl font-medium border transition-all"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
            View Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 03 — Phase 1</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Capability Assessment
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Answer {steps.length} quick questions — AI will determine your exact business level
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          <span>Step {step + 1} of {steps.length}</span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--navy-600))" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "hsl(var(--cyan))" }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-2xl border p-8" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <h2 className="font-syne font-bold text-xl mb-1" style={{ color: "hsl(var(--foreground))" }}>
          {steps[step].title}
        </h2>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
          {steps[step].desc}
        </p>

        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {domains.map((d) => (
              <button key={d} onClick={() => update("domain", d)}
                className="py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all"
                style={{
                  background: form.domain === d ? "hsl(var(--cyan) / 0.1)" : "hsl(var(--navy-700))",
                  borderColor: form.domain === d ? "hsl(var(--cyan) / 0.5)" : "hsl(var(--border))",
                  color: form.domain === d ? "hsl(var(--cyan))" : "hsl(var(--muted-foreground))",
                }}>
                {d}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {[
              { label: "Current monthly capital / cash flow (₹)", key: "capital", placeholder: "e.g. 2,00,000" },
              { label: "Monthly revenue (₹)", key: "revenue", placeholder: "e.g. 1,50,000" },
              { label: "Number of active clients", key: "clients", placeholder: "e.g. 5" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>
                  {f.label}
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: "hsl(var(--navy-700))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: "hsl(var(--foreground))" }}>
                Team size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["Solo", "2–5", "6–15", "15+"].map((s) => (
                  <button key={s} onClick={() => update("teamSize", s)}
                    className="py-3 rounded-xl border text-sm font-medium transition-all"
                    style={{
                      background: form.teamSize === s ? "hsl(var(--cyan) / 0.1)" : "hsl(var(--navy-700))",
                      borderColor: form.teamSize === s ? "hsl(var(--cyan) / 0.5)" : "hsl(var(--border))",
                      color: form.teamSize === s ? "hsl(var(--cyan))" : "hsl(var(--muted-foreground))",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: "hsl(var(--foreground))" }}>
                Key skills (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((s) => (
                  <button key={s}
                    onClick={() => setForm((f) => ({
                      ...f,
                      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
                    }))}
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                    style={{
                      background: form.skills.includes(s) ? "hsl(var(--cyan) / 0.12)" : "hsl(var(--navy-700))",
                      borderColor: form.skills.includes(s) ? "hsl(var(--cyan) / 0.5)" : "hsl(var(--border))",
                      color: form.skills.includes(s) ? "hsl(var(--cyan))" : "hsl(var(--muted-foreground))",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: "hsl(var(--foreground))" }}>
                City type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: "metro", label: "Metro City", sub: "Mumbai, Delhi, Bangalore" },
                  { val: "tier2", label: "Tier-2 City", sub: "Pune, Surat, Jaipur" },
                  { val: "rural", label: "Rural / Town", sub: "Sub-district level" },
                ].map((o) => (
                  <button key={o.val} onClick={() => update("tier", o.val)}
                    className="py-3 px-3 rounded-xl border text-left transition-all"
                    style={{
                      background: form.tier === o.val ? "hsl(var(--cyan) / 0.1)" : "hsl(var(--navy-700))",
                      borderColor: form.tier === o.val ? "hsl(var(--cyan) / 0.5)" : "hsl(var(--border))",
                    }}>
                    <div className="text-sm font-medium"
                      style={{ color: form.tier === o.val ? "hsl(var(--cyan))" : "hsl(var(--foreground))" }}>
                      {o.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-40"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          <ChevronLeft size={14} /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-70"
          style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
          ) : step === steps.length - 1 ? (
            <>Submit & Analyze <ChevronRight size={14} /></>
          ) : (
            <>Next <ChevronRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}