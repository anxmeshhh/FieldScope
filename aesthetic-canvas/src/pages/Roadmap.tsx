import { useState } from "react";
import { CheckCircle, Lock } from "lucide-react";

const roadmapData = {
  "6m": [
    { title: "Master Core SEO", type: "skill", done: true },
    { title: "Onboard 3 retainer clients", type: "client", done: true },
    { title: "Invest in SEMrush & HubSpot", type: "tool", done: false },
    { title: "Get Google Ads Certified", type: "cert", done: false },
    { title: "Build case study portfolio", type: "milestone", done: false },
    { title: "Reach ₹3L/month revenue", type: "revenue", done: false },
  ],
  "12m": [
    { title: "Hire 2 junior content writers", type: "hire", done: false },
    { title: "Launch performance marketing offering", type: "service", done: false },
    { title: "Establish SLA contracts", type: "ops", done: false },
    { title: "Reach ₹8L/month revenue", type: "revenue", done: false },
    { title: "Get HubSpot Partner status", type: "cert", done: false },
  ],
  "24m": [
    { title: "Build 10-person agency team", type: "hire", done: false },
    { title: "Open Tier-2 city satellite office", type: "ops", done: false },
    { title: "Launch proprietary analytics tool", type: "tool", done: false },
    { title: "Reach ₹25L/month revenue", type: "revenue", done: false },
    { title: "Establish enterprise client pipeline", type: "client", done: false },
  ],
};

const typeColors: Record<string, string> = {
  skill: "var(--cyan)", client: "var(--purple)", tool: "var(--blue)",
  cert: "var(--yellow)", milestone: "var(--green)", revenue: "var(--orange)",
  hire: "var(--pink)", service: "var(--cyan)", ops: "var(--teal)",
};

const typeLabels: Record<string, string> = {
  skill: "Skill", client: "Client", tool: "Tool",
  cert: "Certification", milestone: "Milestone", revenue: "Revenue Target",
  hire: "Hiring", service: "Service Launch", ops: "Operations",
};

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState<"6m" | "12m" | "24m">("6m");

  const tabs = [
    { key: "6m", label: "6 Months", sub: "Stabilize" },
    { key: "12m", label: "12 Months", sub: "Scale" },
    { key: "24m", label: "24 Months", sub: "Enterprise" },
  ] as const;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 05 — Phase 1 · AI Generated</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Personalized Growth Roadmap
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Your step-by-step AI-generated plan to grow from Intermediate to Enterprise level
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="py-4 rounded-2xl border text-center transition-all"
            style={{
              background: activeTab === t.key ? "hsl(var(--cyan) / 0.1)" : "hsl(var(--card))",
              borderColor: activeTab === t.key ? "hsl(var(--cyan) / 0.4)" : "hsl(var(--border))",
            }}
          >
            <div className="font-syne font-black text-lg"
              style={{ color: activeTab === t.key ? "hsl(var(--cyan))" : "hsl(var(--foreground))" }}>
              {t.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{t.sub}</div>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        <div
          className="absolute left-3 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, hsl(var(--cyan)), hsl(var(--purple)), hsl(var(--green)))" }}
        />
        <div className="space-y-4">
          {roadmapData[activeTab].map((item, i) => (
            <div key={i} className="relative flex items-start gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}>
              {/* Dot */}
              <div
                className="absolute left-[-18px] w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-2.5"
                style={{
                  background: item.done ? `hsl(${typeColors[item.type]})` : "hsl(var(--navy-800))",
                  borderColor: `hsl(${typeColors[item.type]})`,
                }}
              >
                {item.done && <CheckCircle size={8} color="white" />}
              </div>

              <div
                className="flex-1 rounded-xl border p-4 card-hover"
                style={{
                  background: "hsl(var(--card))",
                  borderColor: item.done ? `hsl(${typeColors[item.type]} / 0.3)` : "hsl(var(--border))",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: `hsl(${typeColors[item.type]} / 0.12)`,
                        color: `hsl(${typeColors[item.type]})`,
                      }}
                    >
                      {typeLabels[item.type]}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: item.done ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                        textDecoration: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                  {item.done && (
                    <CheckCircle size={14} className="shrink-0" style={{ color: "hsl(var(--green))" }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export CTA */}
      <div
        className="rounded-2xl border p-6 flex items-center justify-between"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div>
          <h3 className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            Export Your Roadmap
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Download as PDF or share with your team
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "hsl(var(--cyan) / 0.12)", color: "hsl(var(--cyan))", border: "1px solid hsl(var(--cyan) / 0.3)" }}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
