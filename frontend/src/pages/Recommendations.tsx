import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";

const canOffer = [
  { service: "SEO & Content Marketing", risk: "Low", revenue: "₹15K–₹40K/mo", reason: "Matches your skill set and capital" },
  { service: "Social Media Management", risk: "Low", revenue: "₹10K–₹25K/mo", reason: "Strong fit for your team size" },
  { service: "Email Marketing Campaigns", risk: "Low", revenue: "₹8K–₹20K/mo", reason: "Low overhead, scalable" },
  { service: "Google Ads Management", risk: "Medium", revenue: "₹20K–₹60K/mo", reason: "Requires performance guarantees" },
];

const tryWith = [
  { service: "Performance Marketing", risk: "Medium", note: "Ensure clear ROI SLA with clients" },
  { service: "Brand Strategy Projects", risk: "Medium", note: "Engage a senior consultant for first 3 projects" },
];

const mustAvoid = [
  { service: "Enterprise-level Retainers (₹5L+/mo)", reason: "Operational capacity not ready" },
  { service: "Multi-country Campaigns", reason: "Compliance & coordination gaps" },
  { service: "IPO/Listed Company clients", reason: "Risk of SLA breach — reputational damage" },
];

const positioning = {
  level: "Intermediate",
  domain: "Digital Marketing",
  score: 72,
  segment: "SME & Funded Startups",
  tier: "Metro City Ready",
};

export default function Recommendations() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 04 — Phase 1 · AI Powered</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          AI Recommendations
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Based on your capability assessment — what to offer, what to try, and what to avoid
        </p>
      </div>

      {/* Positioning */}
      <div
        className="rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
        style={{
          background: "linear-gradient(135deg, hsl(var(--cyan) / 0.08), hsl(var(--card)))",
          borderColor: "hsl(var(--cyan) / 0.25)",
        }}
      >
        <div className="flex-1">
          <div className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "hsl(var(--cyan))" }}>Your Market Positioning</div>
          <div className="font-syne font-black text-2xl gradient-text-cyan">{positioning.level}</div>
          <div className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            {positioning.domain} · {positioning.segment}
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="font-syne font-black text-3xl" style={{ color: "hsl(var(--cyan))" }}>
              {positioning.score}
            </div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>/ 100 Score</div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "hsl(var(--green) / 0.12)", color: "hsl(var(--green))" }}
          >
            {positioning.tier}
          </div>
        </div>
      </div>

      {/* CAN OFFER */}
      <div>
        <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"
          style={{ color: "hsl(var(--green))" }}>
          <CheckCircle size={18} /> Services You CAN Offer
          <span className="text-xs font-normal ml-2 px-2 py-0.5 rounded-full"
            style={{ background: "hsl(var(--green) / 0.12)", color: "hsl(var(--green))" }}>
            Safe & Profitable
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canOffer.map((item) => (
            <div key={item.service} className="rounded-xl border p-5 card-hover"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                  {item.service}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: item.risk === "Low" ? "hsl(var(--green) / 0.12)" : "hsl(var(--orange) / 0.12)",
                    color: item.risk === "Low" ? "hsl(var(--green))" : "hsl(var(--orange))",
                  }}>
                  {item.risk} Risk
                </span>
              </div>
              <div className="font-syne font-bold text-base mb-1" style={{ color: "hsl(var(--cyan))" }}>
                {item.revenue}
              </div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{item.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TRY */}
      <div>
        <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"
          style={{ color: "hsl(var(--orange))" }}>
          <AlertTriangle size={18} /> Services to TRY (with Caution)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tryWith.map((item) => (
            <div key={item.service} className="rounded-xl border p-5"
              style={{
                background: "hsl(var(--orange) / 0.06)",
                borderColor: "hsl(var(--orange) / 0.2)",
              }}>
              <h3 className="font-syne font-bold text-sm mb-2" style={{ color: "hsl(var(--foreground))" }}>
                {item.service}
              </h3>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>⚠️ {item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AVOID */}
      <div>
        <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"
          style={{ color: "hsl(var(--red))" }}>
          <XCircle size={18} /> Services to AVOID Right Now
        </h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          {mustAvoid.map((item, i) => (
            <div key={item.service} className={`flex items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t" : ""}`}
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <XCircle size={14} className="shrink-0" style={{ color: "hsl(var(--red))" }} />
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{item.service}</div>
                <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{item.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => navigate("/roadmap")}
          className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
          style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}>
          Generate My Growth Roadmap <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
