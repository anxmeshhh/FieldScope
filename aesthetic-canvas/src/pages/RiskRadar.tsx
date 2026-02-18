import { AlertTriangle, Shield, DollarSign, Scale, TrendingDown, CheckCircle } from "lucide-react";

const risks = [
  {
    category: "Legal & Compliance",
    icon: Scale,
    color: "var(--red)",
    severity: "High",
    risks: [
      { title: "GST Registration Required", desc: "Revenue >₹20L mandates GST. You're at risk.", action: "Register for GST immediately" },
      { title: "GDPR-like Consent Needed", desc: "Client data must have consent forms", action: "Use a consent management platform" },
    ],
  },
  {
    category: "Cash Flow Danger",
    icon: DollarSign,
    color: "var(--orange)",
    severity: "High",
    risks: [
      { title: "90-day payment cycles", desc: "3 of your clients have 90-day cycles. Danger zone.", action: "Negotiate to 30–45 day cycles" },
      { title: "No emergency fund", desc: "Recommended: 3 months of expenses in reserve", action: "Build ₹3L–5L buffer fund" },
    ],
  },
  {
    category: "Operational Risk",
    icon: Shield,
    color: "var(--yellow)",
    severity: "Medium",
    risks: [
      { title: "Single point of failure", desc: "You handle all client communication alone", action: "Hire an account manager" },
      { title: "No service contracts", desc: "Verbal agreements increase scope creep risk", action: "Implement formal SOW for all clients" },
    ],
  },
  {
    category: "Market Saturation",
    icon: TrendingDown,
    color: "var(--purple)",
    severity: "Medium",
    risks: [
      { title: "SEO market getting crowded in Metro", desc: "42% more agencies entered in 2024", action: "Specialize in a vertical (e.g., SaaS SEO)" },
    ],
  },
];

const severityStyle: Record<string, React.CSSProperties> = {
  High: { background: "hsl(var(--red) / 0.12)", color: "hsl(var(--red))" },
  Medium: { background: "hsl(var(--orange) / 0.12)", color: "hsl(var(--orange))" },
  Low: { background: "hsl(var(--green) / 0.12)", color: "hsl(var(--green))" },
};

export default function RiskRadar() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 08 — Phase 2 · AI Powered</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Risk Radar
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          AI-powered business risk detection — before they become costly mistakes
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "High Risks", val: "2", color: "var(--red)" },
          { label: "Medium Risks", val: "2", color: "var(--orange)" },
          { label: "Resolved", val: "5", color: "var(--green)" },
          { label: "Risk Score", val: "62/100", color: "var(--yellow)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="font-syne font-black text-2xl" style={{ color: `hsl(${s.color})` }}>{s.val}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Risk cards */}
      <div className="space-y-5">
        {risks.map((cat) => (
          <div key={cat.category} className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "hsl(var(--border))" }}>
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{
                background: `hsl(${cat.color} / 0.06)`,
                borderColor: `hsl(${cat.color} / 0.2)`,
              }}
            >
              <div className="flex items-center gap-3">
                <cat.icon size={16} style={{ color: `hsl(${cat.color})` }} />
                <h3 className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                  {cat.category}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={severityStyle[cat.severity]}>
                {cat.severity} Severity
              </span>
            </div>
            <div className="divide-y" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              {cat.risks.map((r) => (
                <div key={r.title} className="px-6 py-4 flex items-start gap-4">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: `hsl(${cat.color})` }} />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-0.5" style={{ color: "hsl(var(--foreground))" }}>
                      {r.title}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{r.desc}</div>
                    <div className="flex items-center gap-2 text-xs"
                      style={{ color: "hsl(var(--green))" }}>
                      <CheckCircle size={11} /> {r.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
