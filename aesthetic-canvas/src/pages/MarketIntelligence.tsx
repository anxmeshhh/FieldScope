import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const trendData = [
  { month: "Aug", ai: 12, seo: 28, social: 22 },
  { month: "Sep", ai: 18, seo: 30, social: 25 },
  { month: "Oct", ai: 25, seo: 27, social: 28 },
  { month: "Nov", ai: 32, seo: 26, social: 24 },
  { month: "Dec", ai: 40, seo: 24, social: 26 },
  { month: "Jan", ai: 52, seo: 22, social: 29 },
];

const pricingData = [
  { service: "SEO (Basic)", beginner: 8000, intermediate: 25000, enterprise: 80000 },
  { service: "Paid Ads", beginner: 5000, intermediate: 30000, enterprise: 150000 },
  { service: "Social Media", beginner: 6000, intermediate: 20000, enterprise: 60000 },
  { service: "Brand Strategy", beginner: 0, intermediate: 50000, enterprise: 250000 },
];

const heatmapData = [
  { city: "Mumbai", demand: 95, competition: "High", opportunity: "Medium" },
  { city: "Delhi NCR", demand: 90, competition: "High", opportunity: "Medium" },
  { city: "Bangalore", demand: 88, competition: "High", opportunity: "High" },
  { city: "Pune", demand: 72, competition: "Medium", opportunity: "High" },
  { city: "Ahmedabad", demand: 65, competition: "Low", opportunity: "Very High" },
  { city: "Jaipur", demand: 55, competition: "Low", opportunity: "Very High" },
  { city: "Surat", demand: 58, competition: "Low", opportunity: "High" },
  { city: "Hyderabad", demand: 78, competition: "Medium", opportunity: "High" },
];

const tooltipStyle = {
  contentStyle: { background: "hsl(218,46%,7%)", border: "1px solid hsl(218,28%,13%)", borderRadius: 8, fontSize: 11 },
  labelStyle: { color: "hsl(210,35%,94%)" },
};

export default function MarketIntelligence() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 07 — Phase 2</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Market Intelligence
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Live market trends, demand heatmaps, and pricing benchmarks for Digital Marketing
        </p>
      </div>

      {/* Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>
            Service Demand Trends
          </h3>
          <p className="text-xs mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Monthly demand index (India)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" tick={{ fill: "hsl(215,18%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="ai" stroke="hsl(263,68%,58%)" strokeWidth={2} dot={false} name="AI Services" />
              <Line type="monotone" dataKey="seo" stroke="hsl(194,100%,43%)" strokeWidth={2} dot={false} name="SEO" />
              <Line type="monotone" dataKey="social" stroke="hsl(22,100%,60%)" strokeWidth={2} dot={false} name="Social Media" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[{ label: "AI Services", color: "var(--purple)" }, { label: "SEO", color: "var(--cyan)" }, { label: "Social", color: "var(--orange)" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: `hsl(${l.color})` }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-syne font-bold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>
            Pricing Benchmarks (₹/month)
          </h3>
          <p className="text-xs mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>By business level</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pricingData} barSize={12}>
              <XAxis dataKey="service" tick={{ fill: "hsl(215,18%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tooltipStyle} formatter={(val: number) => `₹${(val/1000).toFixed(0)}K`} />
              <Bar dataKey="beginner" fill="hsl(194,100%,43%)" radius={[4, 4, 0, 0]} name="Beginner" />
              <Bar dataKey="intermediate" fill="hsl(263,68%,58%)" radius={[4, 4, 0, 0]} name="Intermediate" />
              <Bar dataKey="enterprise" fill="hsl(22,100%,60%)" radius={[4, 4, 0, 0]} name="Enterprise" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <h3 className="font-syne font-bold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>
          Demand Heatmap — India Cities
        </h3>
        <p className="text-xs mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
          Demand index, competition level & opportunity score for Digital Marketing
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["City", "Demand Index", "Competition", "Opportunity", "Your Edge"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-bold tracking-wider uppercase"
                    style={{ color: "hsl(var(--muted-foreground))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, i) => (
                <tr key={row.city} className="border-t" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "hsl(var(--foreground))" }}>{row.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full max-w-[80px]" style={{ background: "hsl(var(--navy-600))" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${row.demand}%`,
                          background: row.demand > 80 ? "hsl(var(--green))" : row.demand > 65 ? "hsl(var(--cyan))" : "hsl(var(--orange))",
                        }} />
                      </div>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{row.demand}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: row.competition === "High" ? "hsl(var(--red) / 0.12)" : row.competition === "Medium" ? "hsl(var(--orange) / 0.12)" : "hsl(var(--green) / 0.12)",
                        color: row.competition === "High" ? "hsl(var(--red))" : row.competition === "Medium" ? "hsl(var(--orange))" : "hsl(var(--green))",
                      }}>
                      {row.competition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: row.opportunity.includes("Very") ? "hsl(var(--cyan) / 0.12)" : "hsl(var(--purple) / 0.12)",
                        color: row.opportunity.includes("Very") ? "hsl(var(--cyan))" : "hsl(var(--purple))",
                      }}>
                      {row.opportunity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {row.competition === "Low" ? "🔥 Strong opportunity" : row.competition === "Medium" ? "⚡ Good fit" : "💪 Needs differentiation"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
