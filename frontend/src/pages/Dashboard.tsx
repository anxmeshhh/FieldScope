import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Target, ArrowRight, Zap, AlertTriangle,
  CheckCircle, Clock, BarChart2, MessageSquare, Activity, ShieldAlert,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 2.1 }, { month: "Feb", revenue: 2.8 },
  { month: "Mar", revenue: 3.2 }, { month: "Apr", revenue: 2.9 },
  { month: "May", revenue: 4.1 }, { month: "Jun", revenue: 5.0 },
];

const capabilityData = [
  { name: "Team", score: 72 },
  { name: "Capital", score: 55 },
  { name: "Skills", score: 80 },
  { name: "Network", score: 45 },
  { name: "Tools", score: 65 },
];

const recentActivity = [
  { action: "Assessment completed", detail: "Overall score: 72/100", time: "2h ago", type: "success" },
  { action: "Roadmap generated for Q2", detail: "6-month plan ready", time: "5h ago", type: "info" },
  { action: "Risk: Cash flow warning", detail: "Review recommended", time: "1d ago", type: "warn" },
  { action: "Market trend detected", detail: "AI services +34% this month", time: "2d ago", type: "info" },
];

interface DashboardData {
  name: string;
  assessment: {
    domain: string; ai_level: string; confidence: number;
    team_size: string; capital: string; revenue: string; clients: string;
  } | null;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

  .db-wrap {
    padding: 36px 40px 64px;
    font-family: 'DM Sans', sans-serif;
    color: #F0F0F0;
    background: #080808;
    min-height: 100%;
  }

  /* ── HEADER ── */
  .db-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 28px;
    border-bottom: 1px solid #1A1A1A;
    position: relative;
  }

  .db-header::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.2), transparent);
  }

  .db-date-label {
    font-size: 11px; color: #2A2A2A; letter-spacing: 0.12em;
    text-transform: uppercase; font-weight: 700; margin-bottom: 10px;
  }

  .db-greeting {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; line-height: 0.92; color: #F0F0F0; letter-spacing: 0.02em;
  }

  .db-greeting span { color: #E85D04; }

  .db-subtitle {
    font-size: 13px; color: #444; font-weight: 300;
    margin-top: 10px; letter-spacing: 0.02em;
  }

  .db-run-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px;
    background: #E85D04; color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
    border: none; border-radius: 40px; cursor: pointer;
    transition: all 0.22s;
    box-shadow: 0 0 28px rgba(232,93,4,0.32);
    position: relative; overflow: hidden; flex-shrink: 0;
    margin-top: 4px;
  }

  .db-run-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
    opacity: 0; transition: opacity 0.22s;
  }

  .db-run-btn:hover {
    background: #FF6B1A;
    box-shadow: 0 0 44px rgba(232,93,4,0.55);
    transform: translateY(-2px);
  }

  .db-run-btn:hover::before { opacity: 1; }

  /* ── MINI METRICS ── */
  .db-mini-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: #1A1A1A;
    border: 1px solid #1A1A1A; border-radius: 4px;
    overflow: hidden; margin-bottom: 16px;
  }

  .db-mini {
    background: #0F0F0F; padding: 18px 20px;
    transition: background 0.2s; cursor: default;
    position: relative;
  }

  .db-mini::after {
    content: '';
    position: absolute; bottom: 0; left: 16px; right: 16px;
    height: 1px; background: #E85D04;
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s;
  }

  .db-mini:hover { background: #111; }
  .db-mini:hover::after { transform: scaleX(1); }

  .db-mini-label {
    font-size: 10px; color: #2A2A2A; letter-spacing: 0.12em;
    text-transform: uppercase; font-weight: 700; margin-bottom: 8px;
  }

  .db-mini-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; color: #E85D04; line-height: 1; letter-spacing: 0.04em;
  }

  /* ── KPI GRID ── */
  .db-kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 16px;
  }

  .db-kpi {
    background: #0F0F0F;
    border: 1px solid #1A1A1A;
    border-radius: 4px; padding: 22px 20px;
    position: relative; overflow: hidden; cursor: default;
    transition: border-color 0.25s, transform 0.2s, background 0.25s;
  }

  .db-kpi::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--ac);
    opacity: 0.55; transition: opacity 0.25s;
  }

  .db-kpi::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 10% 0%, rgba(232,93,4,0.07), transparent 55%);
    opacity: 0; transition: opacity 0.3s;
  }

  .db-kpi:hover {
    border-color: rgba(232,93,4,0.2);
    background: #111;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }

  .db-kpi:hover::before { opacity: 1; }
  .db-kpi:hover::after { opacity: 1; }

  .db-kpi-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; position: relative; z-index: 1;
  }

  .db-kpi-label {
    font-size: 10px; color: #333; letter-spacing: 0.12em;
    text-transform: uppercase; font-weight: 700;
  }

  .db-kpi-icon {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.07);
    border: 1px solid rgba(232,93,4,0.14);
    border-radius: 8px; transition: all 0.22s;
  }

  .db-kpi:hover .db-kpi-icon {
    background: rgba(232,93,4,0.14);
    border-color: rgba(232,93,4,0.3);
    box-shadow: 0 0 14px rgba(232,93,4,0.2);
  }

  .db-kpi-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 38px; line-height: 1;
    color: var(--ac);
    margin-bottom: 5px; position: relative; z-index: 1;
    transition: letter-spacing 0.2s;
  }

  .db-kpi:hover .db-kpi-val { letter-spacing: 0.06em; }

  .db-kpi-sub { font-size: 11px; color: #2A2A2A; position: relative; z-index: 1; }

  /* ── TWO-COL ── */
  .db-two-col {
    display: grid; grid-template-columns: 1fr 300px;
    gap: 16px; margin-bottom: 16px;
  }

  /* ── CARD ── */
  .db-card {
    background: #0F0F0F;
    border: 1px solid #1A1A1A;
    border-radius: 4px; padding: 26px;
    position: relative; overflow: hidden;
    transition: border-color 0.25s;
  }

  .db-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.5), transparent);
    transform: scaleX(0); transition: transform 0.45s;
  }

  .db-card:hover { border-color: #252525; }
  .db-card:hover::before { transform: scaleX(1); }

  .db-card-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 20px;
  }

  .db-card-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; color: #F0F0F0; letter-spacing: 0.03em; line-height: 1;
  }

  .db-card-sub { font-size: 11px; color: #2A2A2A; margin-top: 4px; letter-spacing: 0.04em; }

  .db-pill {
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
    padding: 5px 13px; border-radius: 20px;
    background: rgba(232,93,4,0.1); color: #E85D04;
    border: 1px solid rgba(232,93,4,0.2); white-space: nowrap;
  }

  /* ── CAPABILITY BARS ── */
  .db-cap { margin-bottom: 18px; }
  .db-cap:last-of-type { margin-bottom: 0; }

  .db-cap-meta {
    display: flex; justify-content: space-between;
    margin-bottom: 8px;
  }

  .db-cap-name { font-size: 12px; font-weight: 500; color: #444; letter-spacing: 0.04em; }

  .db-cap-pct {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px; color: #888; letter-spacing: 0.08em;
  }

  .db-cap-track {
    height: 4px; border-radius: 3px; background: #141414;
  }

  .db-cap-fill {
    height: 100%; border-radius: 3px; position: relative;
    transition: width 1.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .db-cap-fill::after {
    content: '';
    position: absolute; right: -2px; top: 50%;
    transform: translateY(-50%);
    width: 10px; height: 10px; border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 12px 4px currentColor;
  }

  .db-retake {
    width: 100%; margin-top: 20px; padding: 11px;
    background: transparent; border: 1px solid #222;
    border-radius: 4px; color: #333; font-size: 12px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.06em; font-weight: 600;
    text-transform: uppercase;
  }

  .db-retake:hover { border-color: #E85D04; color: #E85D04; }

  /* ── BOTTOM TWO COL ── */
  .db-bottom {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* ── QUICK ACTIONS ── */
  .db-actions {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-top: 4px;
  }

  .db-act-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 15px 14px;
    background: #141414; border: 1px solid #1A1A1A;
    border-radius: 4px; color: #444;
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    text-align: left; transition: all 0.22s;
    position: relative; overflow: hidden;
  }

  .db-act-btn::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: #E85D04;
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s;
  }

  .db-act-btn:hover {
    background: rgba(232,93,4,0.05);
    border-color: rgba(232,93,4,0.22);
    color: #F0F0F0;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  }

  .db-act-btn:hover::after { transform: scaleX(1); }

  .db-act-icon {
    width: 32px; height: 32px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.07);
    border: 1px solid rgba(232,93,4,0.12);
    border-radius: 8px; transition: all 0.2s;
  }

  .db-act-btn:hover .db-act-icon {
    background: rgba(232,93,4,0.14);
    border-color: rgba(232,93,4,0.28);
    box-shadow: 0 0 14px rgba(232,93,4,0.2);
  }

  .db-act-label { flex: 1; }

  .db-act-arrow {
    color: #E85D04; opacity: 0;
    transform: translateX(-8px); transition: all 0.2s;
  }

  .db-act-btn:hover .db-act-arrow { opacity: 1; transform: translateX(0); }

  /* ── ACTIVITY ── */
  .db-act-list { margin-top: 4px; }

  .db-act-item {
    display: flex; align-items: flex-start; gap: 13px;
    padding: 13px 0;
    border-bottom: 1px solid #111;
    transition: padding-left 0.2s;
    position: relative;
  }

  .db-act-item:last-child { border-bottom: none; padding-bottom: 0; }
  .db-act-item:hover { padding-left: 6px; }

  .db-act-item::before {
    content: '';
    position: absolute; left: -26px; top: 22%; bottom: 22%;
    width: 2px; background: #E85D04; border-radius: 2px;
    transform: scaleY(0); transition: transform 0.2s;
  }

  .db-act-item:hover::before { transform: scaleY(1); }

  .db-act-item-icon {
    width: 32px; height: 32px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; transition: box-shadow 0.2s;
  }

  .db-act-item:hover .db-act-item-icon { box-shadow: 0 0 14px rgba(232,93,4,0.2); }

  .db-act-body { flex: 1; min-width: 0; }
  .db-act-title { font-size: 13px; font-weight: 500; color: #C8C8C8; line-height: 1.3; }
  .db-act-detail { font-size: 11px; color: #333; margin-top: 2px; }

  .db-act-time {
    display: flex; align-items: center; gap: 4px;
    font-size: 10px; color: #222; margin-top: 5px; letter-spacing: 0.04em;
  }

  /* ── LOADING ── */
  .db-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 80vh; gap: 16px;
    font-family: 'Bebas Neue', sans-serif;
  }

  .db-loading-txt { font-size: 18px; color: #2A2A2A; letter-spacing: 0.16em; }

  .db-loading-bar {
    width: 180px; height: 2px; background: #161616;
    border-radius: 2px; overflow: hidden;
  }

  .db-loading-fill {
    height: 100%; width: 50%; background: #E85D04;
    border-radius: 2px;
    animation: ls 1.4s ease-in-out infinite;
  }

  @keyframes ls {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(260%); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .db-wrap { padding: 28px 24px 48px; }
    .db-two-col { grid-template-columns: 1fr; }
    .db-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .db-mini-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .db-wrap { padding: 20px 16px 40px; }
    .db-greeting { font-size: 40px; }
    .db-kpi-grid { grid-template-columns: 1fr 1fr; }
    .db-bottom { grid-template-columns: 1fr; }
    .db-header { flex-direction: column; gap: 16px; }
  }

  .recharts-tooltip-wrapper { outline: none; }
`;

function getBarColor(score: number) {
  if (score >= 70) return "#E85D04";
  if (score >= 50) return "#B84A03";
  return "#7A3002";
}

const quickActions = [
  { icon: TrendingUp, label: "View Roadmap", path: "/roadmap" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: Activity, label: "Market Trends", path: "/market" },
  { icon: ShieldAlert, label: "Risk Check", path: "/risk" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [barsVisible, setBarsVisible] = useState(false);
  const capRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/data/", { credentials: "include" })
      .then((r) => { if (r.status === 401) { navigate("/login"); return null; } return r.json(); })
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!capRef.current) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setBarsVisible(true); },
      { threshold: 0.2 }
    );
    ob.observe(capRef.current);
    return () => ob.disconnect();
  }, [loading]);

  const level = data?.assessment?.ai_level ?? "—";
  const domain = data?.assessment?.domain ?? "—";
  const name = data?.name ?? "there";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="db-loading">
          <div className="db-loading-txt">Loading Intelligence…</div>
          <div className="db-loading-bar"><div className="db-loading-fill" /></div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="db-wrap">

        {/* HEADER */}
        <div className="db-header">
          <div>
            <div className="db-date-label">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="db-greeting">{greeting()}, <span>{name}</span></div>
            <div className="db-subtitle">Business intelligence snapshot · Here's where you stand today</div>
          </div>
          <button className="db-run-btn" onClick={() => navigate("/assessment")}>
            <Zap size={14} /> Run Assessment
          </button>
        </div>

        {/* MINI METRICS */}
        <div className="db-mini-grid">
          {[
            { label: "Active Domain", val: domain === "—" ? "N/A" : domain },
            { label: "Business Level", val: level },
            { label: "Confidence", val: data?.assessment ? `${data.assessment.confidence ?? 82}%` : "—" },
            { label: "Active Clients", val: data?.assessment?.clients ?? "—" },
          ].map((m) => (
            <div key={m.label} className="db-mini">
              <div className="db-mini-label">{m.label}</div>
              <div className="db-mini-val">{m.val}</div>
            </div>
          ))}
        </div>

        {/* KPI CARDS */}
        <div className="db-kpi-grid">
          {[
            { label: "Capability Score", val: data?.assessment ? "72/100" : "—", sub: "+8 pts from last month", ac: "#E85D04", icon: Target },
            { label: "Est. Revenue", val: data?.assessment?.revenue ? `₹${data.assessment.revenue}` : "—", sub: "Monthly estimate", ac: "#C45203", icon: TrendingUp },
            { label: "Team Size", val: data?.assessment?.team_size ?? "—", sub: "Current headcount", ac: "#9E3A02", icon: BarChart2 },
            { label: "Open Risks", val: "3", sub: "Review recommended", ac: "#7A2E01", icon: AlertTriangle },
          ].map((kpi) => (
            <div key={kpi.label} className="db-kpi" style={{ "--ac": kpi.ac } as any}>
              <div className="db-kpi-row">
                <div className="db-kpi-label">{kpi.label}</div>
                <div className="db-kpi-icon"><kpi.icon size={13} color={kpi.ac} /></div>
              </div>
              <div className="db-kpi-val">{kpi.val}</div>
              <div className="db-kpi-sub">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* CHART + CAPABILITY */}
        <div className="db-two-col">
          {/* Chart */}
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Revenue Trajectory</div>
                <div className="db-card-sub">Estimated monthly · ₹ Lakhs</div>
              </div>
              <div className="db-pill">↑ 22% MoM</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E85D04" stopOpacity={0.5} />
                    <stop offset="55%" stopColor="#E85D04" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#E85D04" stopOpacity={0} />
                  </linearGradient>
                  <filter id="lg">
                    <feGaussianBlur stdDeviation="2.5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="month"
                  tick={{ fill: "#2A2A2A", fontSize: 10, fontFamily: "DM Sans" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#0F0F0F", border: "1px solid #1A1A1A", borderRadius: 4, fontSize: 12, fontFamily: "DM Sans" }}
                  labelStyle={{ color: "#444" }} itemStyle={{ color: "#E85D04" }}
                  cursor={{ stroke: "#E85D04", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.3 }}
                />
                <Area type="monotone" dataKey="revenue"
                  stroke="#E85D04" strokeWidth={2}
                  fill="url(#rg)" filter="url(#lg)" dot={false}
                  activeDot={{ r: 5, fill: "#E85D04", stroke: "#080808", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Capability */}
          <div className="db-card" ref={capRef}>
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Capability Scores</div>
                <div className="db-card-sub">By dimension</div>
              </div>
            </div>
            {capabilityData.map((d) => (
              <div key={d.name} className="db-cap">
                <div className="db-cap-meta">
                  <span className="db-cap-name">{d.name}</span>
                  <span className="db-cap-pct">{d.score}</span>
                </div>
                <div className="db-cap-track">
                  <div
                    className="db-cap-fill"
                    style={{
                      width: barsVisible ? `${d.score}%` : "0%",
                      background: `linear-gradient(90deg, ${getBarColor(d.score)}55, ${getBarColor(d.score)})`,
                      color: getBarColor(d.score),
                    }}
                  />
                </div>
              </div>
            ))}
            <button className="db-retake" onClick={() => navigate("/assessment")}>
              Retake Assessment →
            </button>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="db-bottom">
          {/* Quick Actions */}
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Quick Actions</div>
                <div className="db-card-sub">Jump to a module</div>
              </div>
            </div>
            <div className="db-actions">
              {quickActions.map((a) => (
                <button key={a.label} className="db-act-btn" onClick={() => navigate(a.path)}>
                  <div className="db-act-icon"><a.icon size={14} color="#E85D04" /></div>
                  <span className="db-act-label">{a.label}</span>
                  <ArrowRight size={12} className="db-act-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Recent Activity</div>
                <div className="db-card-sub">Latest intelligence updates</div>
              </div>
            </div>
            <div className="db-act-list">
              {recentActivity.map((a, i) => (
                <div key={i} className="db-act-item">
                  <div
                    className="db-act-item-icon"
                    style={{
                      background: a.type === "warn" ? "rgba(232,93,4,0.13)"
                        : a.type === "success" ? "rgba(232,93,4,0.09)"
                        : "rgba(232,93,4,0.06)",
                    }}
                  >
                    {a.type === "success" && <CheckCircle size={14} color="#E85D04" />}
                    {a.type === "warn" && <AlertTriangle size={14} color="#C45203" />}
                    {a.type === "info" && <Zap size={14} color="#7A3002" />}
                  </div>
                  <div className="db-act-body">
                    <div className="db-act-title">{a.action}</div>
                    <div className="db-act-detail">{a.detail}</div>
                    <div className="db-act-time"><Clock size={9} /> {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}