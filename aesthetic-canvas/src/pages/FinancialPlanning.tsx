import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const projections = [
  { month: "Now", revenue: 18, expenses: 12, profit: 6 },
  { month: "3M", revenue: 24, expenses: 15, profit: 9 },
  { month: "6M", revenue: 32, expenses: 18, profit: 14 },
  { month: "12M", revenue: 55, expenses: 28, profit: 27 },
  { month: "18M", revenue: 80, expenses: 38, profit: 42 },
  { month: "24M", revenue: 120, expenses: 55, profit: 65 },
];

export default function FinancialPlanning() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "hsl(var(--cyan))" }}>Module 14 — Phase 4</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>Financial Planning</h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Revenue projections, cost templates & profitability modeling for your growth path</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Current MRR", val: "₹1.5L", color: "var(--cyan)" },
          { label: "Target MRR (12M)", val: "₹4.6L", color: "var(--green)" },
          { label: "Current Margin", val: "33%", color: "var(--purple)" },
          { label: "Runway", val: "6 months", color: "var(--orange)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="font-syne font-black text-xl" style={{ color: `hsl(${s.color})` }}>{s.val}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <h3 className="font-syne font-bold text-base mb-6" style={{ color: "hsl(var(--foreground))" }}>24-Month Financial Projection (₹ Lakhs)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={projections}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(194,100%,43%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(194,100%,43%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158,84%,40%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(158,84%,40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "hsl(215,18%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "hsl(218,46%,7%)", border: "1px solid hsl(218,28%,13%)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `₹${v}L`} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(194,100%,43%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
            <Area type="monotone" dataKey="profit" stroke="hsl(158,84%,40%)" fill="url(#profGrad)" strokeWidth={2} name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
