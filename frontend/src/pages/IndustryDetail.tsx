import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const levelData = {
  beginner: {
    label: "Beginner / Freelancer",
    color: "var(--cyan)",
    revenue: "₹2L – ₹10L",
    team: "1–3 people",
    capital: "₹50K – ₹2L",
    services: ["Basic SEO Audit", "Social Media Posts", "Blog Writing", "Google My Business Setup"],
    tools: ["Canva", "Buffer", "Google Analytics", "Mailchimp"],
    clients: ["Local Shops", "Solo Entrepreneurs", "Startups"],
    avoid: ["High-ticket retainer clients", "Performance-based deals", "International clients"],
  },
  intermediate: {
    label: "Intermediate / Agency",
    color: "var(--purple)",
    revenue: "₹10L – ₹1Cr",
    team: "4–15 people",
    capital: "₹5L – ₹20L",
    services: ["Full SEO Campaigns", "Paid Ads (Meta/Google)", "Email Automation", "Brand Strategy"],
    tools: ["SEMrush", "HubSpot", "Zapier", "Figma", "Hotjar"],
    clients: ["SMEs", "Regional Brands", "Funded Startups"],
    avoid: ["Enterprise-level SLAs", "Multi-country campaigns", "IPO companies"],
  },
  enterprise: {
    label: "Enterprise",
    color: "var(--green)",
    revenue: "₹1Cr+",
    team: "15+ people",
    capital: "₹50L+",
    services: ["360° Marketing Strategy", "Media Buying at Scale", "Omnichannel Integration", "AI-driven Personalization"],
    tools: ["Salesforce", "Adobe Experience Cloud", "Custom Analytics", "DMP Platforms"],
    clients: ["Listed Companies", "Enterprise Brands", "Government Bodies"],
    avoid: [],
  },
};

export default function IndustryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState<"beginner" | "intermediate" | "enterprise">("beginner");

  const level = levelData[activeLevel];

  const industryName: Record<string, string> = {
    "digital-marketing": "Digital Marketing",
    "construction": "Construction & Real Estate",
    "d2c-ecommerce": "D2C E-Commerce",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-up space-y-8">
      <button onClick={() => navigate("/explore")}
        className="flex items-center gap-2 text-sm transition-all"
        style={{ color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft size={14} /> Back to Explorer
      </button>

      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Industry Breakdown</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          {industryName[slug ?? ""] ?? "Industry"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Full level-by-level breakdown — from beginner to enterprise
        </p>
      </div>

      {/* Level tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: "hsl(var(--navy-700))" }}>
        {(["beginner", "intermediate", "enterprise"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setActiveLevel(l)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: activeLevel === l ? "hsl(var(--card))" : "transparent",
              color: activeLevel === l ? `hsl(${levelData[l].color})` : "hsl(var(--muted-foreground))",
              boxShadow: activeLevel === l ? "0 2px 8px hsl(var(--navy-950) / 0.5)" : "none",
            }}
          >
            {levelData[l].label}
          </button>
        ))}
      </div>

      {/* Level content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Annual Revenue", val: level.revenue },
          { label: "Team Size", val: level.team },
          { label: "Capital Required", val: level.capital },
          { label: "Complexity", val: activeLevel === "beginner" ? "Low" : activeLevel === "intermediate" ? "Medium" : "High" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
            <div className="font-syne font-bold text-lg" style={{ color: `hsl(${level.color})` }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-sm mb-4 flex items-center gap-2"
            style={{ color: "hsl(var(--green))" }}>
            <CheckCircle size={14} /> Services You Can Offer
          </h3>
          <ul className="space-y-2">
            {level.services.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--green))" }} />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-sm mb-4 flex items-center gap-2"
            style={{ color: "hsl(var(--cyan))" }}>
            Tools & Technology
          </h3>
          <ul className="space-y-2">
            {level.tools.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--cyan))" }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-sm mb-4 flex items-center gap-2"
            style={{ color: "hsl(var(--orange))" }}>
            <XCircle size={14} /> Services to Avoid
          </h3>
          {level.avoid.length === 0 ? (
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              At enterprise level you can take on virtually any project.
            </p>
          ) : (
            <ul className="space-y-2">
              {level.avoid.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm"
                  style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--orange))" }} />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => navigate("/assessment")}
          className="px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105"
          style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}>
          Assess My Capability for This Industry →
        </button>
      </div>
    </div>
  );
}

// Need useState
import { useState } from "react";
