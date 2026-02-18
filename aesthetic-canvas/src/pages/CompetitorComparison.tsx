import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const dimensions = [
  { axis: "Team", you: 72, competitor: 90 },
  { axis: "Capital", you: 55, competitor: 95 },
  { axis: "Tools", you: 65, competitor: 88 },
  { axis: "Network", you: 45, competitor: 80 },
  { axis: "Portfolio", you: 70, competitor: 92 },
  { axis: "Pricing", you: 80, competitor: 70 },
];

const gaps = [
  { area: "Team Strength", you: "3 people", enterprise: "20+ people", gap: "Critical", action: "Hire 2 specialists in next 6 months" },
  { area: "Capital Reserve", you: "₹2L", enterprise: "₹50L+", gap: "High", action: "Build runway through client retainers" },
  { area: "Tool Stack", you: "Basic (Canva, Buffer)", enterprise: "Advanced (Adobe, Salesforce)", gap: "Medium", action: "Invest ₹15K/mo in tools" },
  { area: "Client Portfolio", you: "8 clients", enterprise: "100+ clients", gap: "High", action: "Focus on 3 enterprise case studies" },
  { area: "Pricing Power", you: "Competitive (lower)", enterprise: "Premium", gap: "Low", action: "Raise rates by 20% after portfolio" },
];

const gapColors: Record<string, React.CSSProperties> = {
  Critical: { background: "hsl(var(--red) / 0.12)", color: "hsl(var(--red))" },
  High: { background: "hsl(var(--orange) / 0.12)", color: "hsl(var(--orange))" },
  Medium: { background: "hsl(var(--yellow) / 0.12)", color: "hsl(var(--yellow))" },
  Low: { background: "hsl(var(--green) / 0.12)", color: "hsl(var(--green))" },
};

export default function CompetitorComparison() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 09 — Phase 2</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Competitor Comparison
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          "What do ₹10Cr companies have that I don't?" — Level-to-level gap analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-base mb-6" style={{ color: "hsl(var(--foreground))" }}>
            You vs Enterprise (Radar)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={dimensions}>
              <PolarGrid stroke="hsl(218,28%,13%)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(215,18%,50%)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "hsl(218,46%,7%)", border: "1px solid hsl(218,28%,13%)", borderRadius: 8, fontSize: 11 }}
              />
              <Radar name="You" dataKey="you" stroke="hsl(194,100%,43%)" fill="hsl(194,100%,43%)" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Enterprise" dataKey="competitor" stroke="hsl(263,68%,58%)" fill="hsl(263,68%,58%)" fillOpacity={0.1} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 justify-center mt-2">
            {[{ label: "You", color: "var(--cyan)" }, { label: "Enterprise", color: "var(--purple)" }].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-xs"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: `hsl(${l.color})` }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Summary scores */}
        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-base mb-6" style={{ color: "hsl(var(--foreground))" }}>
            Dimension Scores
          </h3>
          <div className="space-y-4">
            {dimensions.map((d) => (
              <div key={d.axis}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{d.axis}</span>
                  <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>
                    {d.you} / {d.competitor}
                  </span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--navy-600))" }}>
                  <div className="absolute left-0 top-0 h-full rounded-full opacity-40"
                    style={{ width: `${d.competitor}%`, background: "hsl(var(--purple))" }} />
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${d.you}%`, background: "hsl(var(--cyan))" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gap table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="px-6 py-4 border-b" style={{ background: "hsl(var(--navy-700))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            Gap Analysis Table
          </h3>
        </div>
        {gaps.map((row, i) => (
          <div key={row.area}
            className={`grid grid-cols-[1fr_100px_100px_80px_1fr] gap-4 px-6 py-4 items-start text-sm border-t`}
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="font-medium" style={{ color: "hsl(var(--foreground))" }}>{row.area}</div>
            <div style={{ color: "hsl(var(--cyan))" }}>{row.you}</div>
            <div style={{ color: "hsl(var(--purple))" }}>{row.enterprise}</div>
            <div><span className="text-xs px-2 py-0.5 rounded-full font-bold" style={gapColors[row.gap]}>{row.gap}</span></div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>→ {row.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
