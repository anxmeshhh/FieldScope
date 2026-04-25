import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useSearchParams } from "react-router-dom";
import HistorySelector from "../components/HistorySelector";
import { Loader2 } from "lucide-react";

type TrendData = { month: string; core_service: number; secondary_service: number; emerging_service: number };
type PricingData = { service: string; beginner: number; intermediate: number; enterprise: number };
type HeatmapData = { city: string; demand: number; competition: string; opportunity: string };

type MarketData = {
  trendData: TrendData[];
  pricingData: PricingData[];
  heatmapData: HeatmapData[];
};

const tooltipStyle = {
  contentStyle: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  labelStyle: { color: "#0F172A", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#475569" }
};

const API = "http://localhost:8000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .mi-wrap {
    padding: 36px 40px 80px;
    font-family: 'DM Sans', sans-serif;
    color: #1E293B;
    background: #F8FAFC;
    min-height: 100%;
  }

  @media (max-width: 640px) { .mi-wrap { padding: 24px 20px 60px; } }

  .mi-header-row {
    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;
  }

  .mi-eyebrow {
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: #2563EB; margin-bottom: 8px;
  }

  .mi-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: #0F172A;
    letter-spacing: 0.02em; line-height: 1; margin-bottom: 8px;
  }

  .mi-subtitle { font-size: 14px; color: #64748B; font-weight: 500; }

  .mi-card {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 24px;
  }

  .mi-card-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #0F172A;
    letter-spacing: 0.04em; margin-bottom: 4px;
  }

  .mi-card-sub { font-size: 12px; color: #64748B; margin-bottom: 24px; font-weight: 500; }

  .mi-legend {
    display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap;
  }

  .mi-legend-item {
    display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; font-weight: 500;
  }

  .mi-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

  .mi-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .mi-table th {
    text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0;
  }
  .mi-table td {
    padding: 14px 16px; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-weight: 500;
  }
  .mi-table tr:last-child td { border-bottom: none; }

  .mi-badge {
    font-size: 11px; padding: 4px 10px; border-radius: 40px; font-weight: 600; display: inline-block;
  }

  .mi-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 50vh; gap: 16px; text-align: center;
  }

  .mi-loading-ring {
    width: 64px; height: 64px; border-radius: 50%;
    border: 3px solid #E2E8F0; border-top-color: #2563EB;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

export default function MarketIntelligence() {
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");
  
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError("");
      try {
        const url = histId ? `${API}/market-intelligence/?id=${histId}` : `${API}/market-intelligence/`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          setError(json.error || "Failed to load market intelligence.");
        }
      } catch (e) {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, [histId]);

  if (loading) return (
    <><style>{css}</style>
    <div className="mi-wrap">
      <div className="mi-loading">
        <div className="mi-loading-ring" />
        <div className="mi-title" style={{ fontSize: 24, marginBottom: 0 }}>Gathering Live Market Data…</div>
        <div className="mi-subtitle">Analyzing trends, pricing, and regional demand for your profile.</div>
      </div>
    </div></>
  );

  if (error || !data) return (
    <><style>{css}</style>
    <div className="mi-wrap">
      <div className="mi-loading">
        <div className="mi-title" style={{ fontSize: 24, marginBottom: 0, color: "#2563EB" }}>Error</div>
        <div className="mi-subtitle">{error || "Something went wrong."}</div>
      </div>
    </div></>
  );

  return (
    <>
      <style>{css}</style>
      <div className="mi-wrap">
        <div className="mi-header-row">
          <div>
            <div className="mi-eyebrow">Module 07 — Phase 2</div>
            <h1 className="mi-title">Market Intelligence</h1>
            <p className="mi-subtitle">Live market trends, demand heatmaps, and pricing benchmarks tailored to your profile.</p>
          </div>
          <HistorySelector />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "24px" }}>
          {/* Trend Chart */}
          <div className="mi-card" style={{ marginBottom: 0 }}>
            <h3 className="mi-card-title">Service Demand Trends</h3>
            <p className="mi-card-sub">Monthly demand index (India)</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.trendData}>
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="core_service" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: "#2563EB" }} name="Core Service" />
                <Line type="monotone" dataKey="secondary_service" stroke="#10B981" strokeWidth={3} dot={{ r: 3, fill: "#10B981" }} name="Secondary" />
                <Line type="monotone" dataKey="emerging_service" stroke="#F59E0B" strokeWidth={3} dot={{ r: 3, fill: "#F59E0B" }} name="Emerging" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mi-legend">
              <div className="mi-legend-item"><div className="mi-legend-dot" style={{ background: "#2563EB" }} />Core Service</div>
              <div className="mi-legend-item"><div className="mi-legend-dot" style={{ background: "#10B981" }} />Secondary</div>
              <div className="mi-legend-item"><div className="mi-legend-dot" style={{ background: "#F59E0B" }} />Emerging</div>
            </div>
          </div>

          {/* Pricing Chart */}
          <div className="mi-card" style={{ marginBottom: 0 }}>
            <h3 className="mi-card-title">Pricing Benchmarks (₹/month)</h3>
            <p className="mi-card-sub">By business level</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.pricingData} barSize={16}>
                <XAxis dataKey="service" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip {...tooltipStyle} formatter={(val: number) => `₹${(val/1000).toFixed(0)}K`} />
                <Bar dataKey="beginner" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Beginner" />
                <Bar dataKey="intermediate" fill="#60A5FA" radius={[4, 4, 0, 0]} name="Intermediate" />
                <Bar dataKey="enterprise" fill="#2563EB" radius={[4, 4, 0, 0]} name="Enterprise" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mi-legend">
              <div className="mi-legend-item"><div className="mi-legend-dot" style={{ background: "#94A3B8" }} />Beginner</div>
              <div className="mi-legend-item"><div className="mi-legend-dot" style={{ background: "#60A5FA" }} />Intermediate</div>
              <div className="mi-legend-item"><div className="mi-legend-dot" style={{ background: "#2563EB" }} />Enterprise</div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="mi-card">
          <h3 className="mi-card-title">Demand Heatmap — India Cities</h3>
          <p className="mi-card-sub">Demand index, competition level & opportunity score</p>
          <div style={{ overflowX: "auto" }}>
            <table className="mi-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Demand Index</th>
                  <th>Competition</th>
                  <th>Opportunity</th>
                  <th>Your Edge</th>
                </tr>
              </thead>
              <tbody>
                {data.heatmapData.map((row) => (
                  <tr key={row.city}>
                    <td>{row.city}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#E2E8F0", borderRadius: "10px", maxWidth: "100px" }}>
                          <div style={{
                            height: "100%", borderRadius: "10px", width: `${row.demand}%`,
                            background: row.demand > 80 ? "#10B981" : row.demand > 60 ? "#2563EB" : "#F59E0B"
                          }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "#64748B" }}>{row.demand}</span>
                      </div>
                    </td>
                    <td>
                      <span className="mi-badge" style={{
                        background: row.competition === "High" ? "#FEE2E2" : row.competition === "Medium" ? "#FEF3C7" : "#D1FAE5",
                        color: row.competition === "High" ? "#EF4444" : row.competition === "Medium" ? "#F59E0B" : "#10B981",
                      }}>
                        {row.competition}
                      </span>
                    </td>
                    <td>
                      <span className="mi-badge" style={{
                        background: row.opportunity.includes("Very") ? "#DBEAFE" : "#F3E8FF",
                        color: row.opportunity.includes("Very") ? "#2563EB" : "#9333EA",
                      }}>
                        {row.opportunity}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#64748B" }}>
                      {row.competition === "Low" ? "🔥 Strong opportunity" : row.competition === "Medium" ? "⚡ Good fit" : "💪 Needs differentiation"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
