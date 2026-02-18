import { useNavigate } from "react-router-dom";
import { TrendingUp, Target, Brain, ArrowRight, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 2.1 }, { month: "Feb", revenue: 2.8 },
  { month: "Mar", revenue: 3.2 }, { month: "Apr", revenue: 2.9 },
  { month: "May", revenue: 4.1 }, { month: "Jun", revenue: 5.0 },
];

const capabilityData = [
  { name: "Team", score: 72 }, { name: "Capital", score: 55 },
  { name: "Skills", score: 80 }, { name: "Network", score: 45 },
  { name: "Tools", score: 65 },
];

const recentActivity = [
  { action: "Assessment completed", time: "2h ago", type: "success" },
  { action: "Roadmap generated for Q2", time: "5h ago", type: "info" },
  { action: "Risk: Cash flow warning detected", time: "1d ago", type: "warn" },
  { action: "New market trend: AI services +34%", time: "2d ago", type: "info" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-syne font-black text-2xl md:text-3xl" style={{ color: "hsl(var(--foreground))" }}>
            Good morning, Arjun 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Here's your business intelligence snapshot for today
          </p>
        </div>
        <button
          onClick={() => navigate("/assessment")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}
        >
          <Zap size={14} /> Run Assessment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Capability Score", val: "72/100", sub: "+8 from last month", color: "var(--cyan)", icon: Target },
          { label: "Business Level", val: "Intermediate", sub: "Digital Marketing", color: "var(--purple)", icon: TrendingUp },
          { label: "Revenue (Est.)", val: "₹18.5L", sub: "Annual potential", color: "var(--green)", icon: TrendingUp },
          { label: "Open Risks", val: "3 Alerts", sub: "Review recommended", color: "var(--orange)", icon: AlertTriangle },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border p-5 card-hover"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{kpi.label}</span>
              <kpi.icon size={14} style={{ color: `hsl(${kpi.color})` }} />
            </div>
            <div className="font-syne font-black text-xl" style={{ color: `hsl(${kpi.color})` }}>
              {kpi.val}
            </div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-syne font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>
                Revenue Trajectory
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                Estimated monthly in ₹ Lakhs
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "hsl(var(--green) / 0.12)", color: "hsl(var(--green))" }}>
              ↑ 22% MoM
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(194,100%,43%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(194,100%,43%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "hsl(215,18%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(218,46%,7%)", border: "1px solid hsl(218,28%,13%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(210,35%,94%)" }}
                itemStyle={{ color: "hsl(194,100%,43%)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(194,100%,43%)" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Capability radar */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <h3 className="font-syne font-bold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>
            Capability Scores
          </h3>
          <p className="text-xs mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>By dimension</p>
          <div className="space-y-3">
            {capabilityData.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{d.name}</span>
                  <span style={{ color: "hsl(var(--foreground))" }}>{d.score}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--navy-600))" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${d.score}%`,
                      background: d.score >= 70 ? "hsl(var(--green))" : d.score >= 50 ? "hsl(var(--cyan))" : "hsl(var(--orange))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/assessment")}
            className="w-full mt-5 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
          >
            Retake Assessment →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <h3 className="font-syne font-bold text-base mb-5" style={{ color: "hsl(var(--foreground))" }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Roadmap", path: "/roadmap", color: "var(--cyan)" },
              { label: "AI Chat", path: "/chat", color: "var(--purple)" },
              { label: "Market Trends", path: "/market", color: "var(--blue)" },
              { label: "Risk Check", path: "/risk", color: "var(--orange)" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all card-hover"
                style={{
                  background: `hsl(${a.color} / 0.08)`,
                  borderColor: `hsl(${a.color} / 0.25)`,
                  color: `hsl(${a.color})`,
                }}
              >
                <ArrowRight size={14} /> {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <h3 className="font-syne font-bold text-base mb-5" style={{ color: "hsl(var(--foreground))" }}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                {a.type === "success" && <CheckCircle size={14} style={{ color: "hsl(var(--green))", marginTop: 2 }} />}
                {a.type === "warn" && <AlertTriangle size={14} style={{ color: "hsl(var(--orange))", marginTop: 2 }} />}
                {a.type === "info" && <Zap size={14} style={{ color: "hsl(var(--cyan))", marginTop: 2 }} />}
                <div className="flex-1">
                  <div className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{a.action}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Clock size={10} /> {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
