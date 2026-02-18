import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const benchData = [
  { percentile: "Top 10%", revenue: 85, clients: 40, team: 18 },
  { percentile: "Top 25%", revenue: 55, clients: 25, team: 10 },
  { percentile: "You", revenue: 38, clients: 8, team: 3 },
  { percentile: "Median", revenue: 28, clients: 12, team: 5 },
  { percentile: "Bottom 25%", revenue: 12, clients: 4, team: 1 },
];

export default function PeerBenchmarking() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "hsl(var(--cyan))" }}>Module 12 — Phase 3</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>Peer Benchmarking</h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Anonymous comparison with businesses at your level — where do you stand?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Your Percentile", val: "Top 34%", color: "var(--cyan)" },
          { label: "Revenue vs Peers", val: "+12%", color: "var(--green)" },
          { label: "Growth Velocity", val: "Above Average", color: "var(--purple)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5 text-center" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="font-syne font-black text-2xl" style={{ color: `hsl(${s.color})` }}>{s.val}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <h3 className="font-syne font-bold text-base mb-6" style={{ color: "hsl(var(--foreground))" }}>Revenue vs Peers (₹L/year)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={benchData} barSize={32}>
            <XAxis dataKey="percentile" tick={{ fill: "hsl(215,18%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "hsl(218,46%,7%)", border: "1px solid hsl(218,28%,13%)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="Revenue (₹L)"
              fill="hsl(194,100%,43%)"
              label={{ position: "top", fill: "hsl(215,18%,50%)", fontSize: 10, formatter: (v: number) => `₹${v}L` }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
