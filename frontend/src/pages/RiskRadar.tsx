import { useState, useEffect } from "react";
import { AlertTriangle, Shield, DollarSign, Scale, TrendingDown, CheckCircle, SlidersHorizontal, RefreshCw, Database, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import HistorySelector from "../components/HistorySelector";

type Risk = { title: string; desc: string; action: string };
type Category = { category: string; severity: "High" | "Medium" | "Low"; risks: Risk[] };
type RiskData = {
  is_aggregated?: boolean;
  summary: { highRisks: number; mediumRisks: number; resolved: number; score: number };
  categories: Category[];
};

const API = "http://localhost:8000";

const severityStyle: Record<string, React.CSSProperties> = {
  High: { background: "#FEE2E2", color: "#EF4444" },
  Medium: { background: "#FEF3C7", color: "#F59E0B" },
  Low: { background: "#D1FAE5", color: "#10B981" },
};

const categoryIcons: Record<string, any> = {
  "Legal & Compliance": Scale,
  "Cash Flow Danger": DollarSign,
  "Operational Risk": Shield,
  "Market Saturation": TrendingDown,
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .rr-wrap { padding: 36px 40px 80px; font-family: 'DM Sans', sans-serif; color: #1E293B; background: #F8FAFC; min-height: 100%; }
  @media (max-width: 640px) { .rr-wrap { padding: 24px 20px 60px; } }

  .rr-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .rr-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2563EB; margin-bottom: 8px; }
  .rr-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: #0F172A; letter-spacing: 0.02em; line-height: 1; margin-bottom: 8px; }
  .rr-subtitle { font-size: 14px; color: #64748B; font-weight: 500; }

  .rr-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
  @media (max-width: 1024px) { .rr-grid { grid-template-columns: 1fr; } }

  .rr-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 768px) { .rr-summary-grid { grid-template-columns: repeat(2, 1fr); } }

  .rr-summary-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
  .rr-summary-val { font-family: 'Bebas Neue', sans-serif; font-size: 36px; line-height: 1; margin-bottom: 4px; }
  .rr-summary-label { font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

  .rr-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; }
  .rr-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #0F172A; letter-spacing: 0.04em; margin: 0; display: flex; align-items: center; gap: 10px; }
  .rr-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #E2E8F0; }

  .rr-control-group { margin-bottom: 20px; }
  .rr-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
  .rr-input { width: 100%; -webkit-appearance: none; height: 6px; background: #E2E8F0; border-radius: 4px; outline: none; }
  .rr-input::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #2563EB; cursor: pointer; transition: transform 0.1s; }
  .rr-input::-webkit-slider-thumb:hover { transform: scale(1.2); }

  .rr-btn { width: 100%; padding: 12px; background: #2563EB; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
  .rr-btn:hover { background: #1D4ED8; }
  .rr-btn:disabled { background: #94A3B8; cursor: not-allowed; }

  .rr-btn-sec { background: #F1F5F9; color: #0F172A; }
  .rr-btn-sec:hover { background: #E2E8F0; }

  .rr-risk-row { padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: flex-start; gap: 16px; }
  .rr-risk-row:last-child { border-bottom: none; }
  .rr-risk-title { font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
  .rr-risk-desc { font-size: 13px; color: #64748B; margin-bottom: 12px; line-height: 1.5; }
  .rr-risk-action { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #10B981; font-weight: 600; background: #D1FAE5; padding: 6px 12px; border-radius: 6px; }

  .rr-badge { font-size: 11px; padding: 4px 10px; border-radius: 40px; font-weight: 600; display: inline-block; }

  .rr-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; text-align: center; padding: 40px; }
  .rr-loading-ring { width: 48px; height: 48px; border-radius: 50%; border: 3px solid #E2E8F0; border-top-color: #2563EB; animation: spin 1s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .rr-progress-bar { height: 6px; background: #E2E8F0; border-radius: 4px; margin-bottom: 16px; overflow: hidden; }
  .rr-progress-fill { height: 100%; background: #10B981; transition: width 0.3s ease; }
`;

export default function RiskRadar() {
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");

  const [revenue, setRevenue] = useState(500000);
  const [teamSize, setTeamSize] = useState(5);
  const [clients, setClients] = useState(10);

  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [simulations, setSimulations] = useState<RiskData[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [aggregating, setAggregating] = useState(false);
  
  const [error, setError] = useState("");
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  const loadInitial = async () => {
    setLoading(true);
    setError("");
    setSimulations([]);
    try {
      const res = await fetch(`${API}/risk-radar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: histId, initial: true }),
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        if (json.is_aggregated) {
          setData(json);
          setHasSavedProfile(true);
        } else {
          setData(null);
          setHasSavedProfile(false);
        }
      } else {
        setError(json.error || "Failed to load risk radar.");
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [histId]);

  const runSimulation = async () => {
    setSimulating(true);
    setError("");
    try {
      const res = await fetch(`${API}/risk-radar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: histId, revenue, team_size: teamSize, clients }),
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        const newSims = [...simulations, json];
        setSimulations(newSims);
        setData(json);
        
        if (newSims.length === 5) {
          await aggregateSimulations(newSims);
        }
      } else {
        setError(json.error || "Simulation failed.");
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setSimulating(false);
    }
  };

  const aggregateSimulations = async (sims: RiskData[]) => {
    setAggregating(true);
    try {
      const res = await fetch(`${API}/save-risk-profile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: histId, simulations: sims }),
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.aggregated);
        setHasSavedProfile(true);
      } else {
        setError(json.error || "Failed to aggregate.");
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setAggregating(false);
    }
  };

  if (loading) return (
    <><style>{css}</style>
    <div className="rr-wrap">
      <div className="rr-loading">
        <div className="rr-loading-ring" />
        <div className="rr-title" style={{ fontSize: 24, marginBottom: 0 }}>Scanning Database...</div>
        <div className="rr-subtitle">Checking for saved master risk profiles.</div>
      </div>
    </div></>
  );

  if (error && !data) return (
    <><style>{css}</style>
    <div className="rr-wrap">
      <div className="rr-loading">
        <div className="rr-title" style={{ fontSize: 24, marginBottom: 0, color: "#EF4444" }}>Error</div>
        <div className="rr-subtitle">{error}</div>
      </div>
    </div></>
  );

  const isAggregated = data?.is_aggregated;

  return (
    <>
      <style>{css}</style>
      <div className="rr-wrap">
        <div className="rr-header-row">
          <div>
            <div className="rr-eyebrow">Module 08 — Phase 2</div>
            <h1 className="rr-title">Live Risk Radar</h1>
            <p className="rr-subtitle">
              {isAggregated 
                ? "Your aggregated Master Risk Profile, generated from 5 unique scale simulations."
                : "Simulate business scaling 5 times to generate a robust Master Risk Profile."}
            </p>
          </div>
          <HistorySelector />
        </div>

        <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
          {isAggregated ? (
            <button className="rr-btn rr-btn-sec" style={{ width: "auto" }} onClick={() => { setData(null); setSimulations([]); }}>
              <Plus size={16} /> Start New Simulation
            </button>
          ) : (
            hasSavedProfile && (
              <button className="rr-btn rr-btn-sec" style={{ width: "auto" }} onClick={loadInitial}>
                <Database size={16} /> Restore Saved Profile
              </button>
            )
          )}
        </div>

        <div className={isAggregated ? "" : "rr-grid"}>
          {!isAggregated && (
            <div className="rr-card" style={{ alignSelf: "start", padding: "24px", marginBottom: 0 }}>
              <h3 className="rr-card-title" style={{ marginBottom: "16px" }}>
                <SlidersHorizontal size={18} color="#2563EB" /> Scale Simulation
              </h3>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                  <span>Progress</span>
                  <span style={{ color: "#10B981" }}>{simulations.length} / 5</span>
                </div>
                <div className="rr-progress-bar">
                  <div className="rr-progress-fill" style={{ width: `${(simulations.length / 5) * 100}%` }} />
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>Adjust values and run simulation. We require 5 distinct simulations to build a reliable risk profile.</p>
              
              <div className="rr-control-group">
                <div className="rr-label">
                  <span>Annual Revenue (₹)</span>
                  <span style={{ color: "#2563EB" }}>₹{(revenue / 100000).toFixed(1)}L</span>
                </div>
                <input type="range" min={100000} max={50000000} step={100000} value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} className="rr-input" />
              </div>

              <div className="rr-control-group">
                <div className="rr-label">
                  <span>Team Size</span>
                  <span style={{ color: "#2563EB" }}>{teamSize} members</span>
                </div>
                <input type="range" min={1} max={100} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className="rr-input" />
              </div>

              <div className="rr-control-group">
                <div className="rr-label">
                  <span>Active Clients</span>
                  <span style={{ color: "#2563EB" }}>{clients}</span>
                </div>
                <input type="range" min={1} max={500} value={clients} onChange={(e) => setClients(Number(e.target.value))} className="rr-input" />
              </div>

              <button className="rr-btn" onClick={runSimulation} disabled={simulating || aggregating || simulations.length >= 5}>
                {simulating ? <RefreshCw size={16} className="animate-spin" /> : "Run Simulation"}
              </button>
              {error && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</div>}
            </div>
          )}

          <div>
            {aggregating ? (
              <div className="rr-card rr-loading">
                <div className="rr-loading-ring" style={{ borderColor: "#10B981", borderTopColor: "transparent" }} />
                <div className="rr-title" style={{ fontSize: 24, marginBottom: 0, color: "#10B981" }}>Aggregating 5 Simulations...</div>
                <div className="rr-subtitle">Building your permanent Master Risk Profile.</div>
              </div>
            ) : !data && simulations.length === 0 ? (
              <div className="rr-card rr-loading" style={{ minHeight: "300px" }}>
                <Shield size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
                <div className="rr-title" style={{ fontSize: 24, marginBottom: 0 }}>No Data Yet</div>
                <div className="rr-subtitle">Adjust the sliders and run your first simulation to begin.</div>
              </div>
            ) : data ? (
              <div style={{ opacity: simulating ? 0.5 : 1, transition: "opacity 0.2s" }}>
                {isAggregated && (
                  <div style={{ background: "#D1FAE5", color: "#065F46", padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                    <CheckCircle size={16} /> Data persistently loaded from database.
                  </div>
                )}
                <div className="rr-summary-grid">
                  {[
                    { label: "High Risks", val: data.summary.highRisks, color: "#EF4444" },
                    { label: "Medium Risks", val: data.summary.mediumRisks, color: "#F59E0B" },
                    { label: "Resolved", val: data.summary.resolved, color: "#10B981" },
                    { label: "Risk Score", val: `${data.summary.score}/100`, color: "#2563EB" },
                  ].map((s) => (
                    <div key={s.label} className="rr-summary-card">
                      <div className="rr-summary-val" style={{ color: s.color }}>{s.val}</div>
                      <div className="rr-summary-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={isAggregated ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" } : {}}>
                  {data.categories.map((cat, idx) => {
                    if (!cat.risks || cat.risks.length === 0) return null;
                    const Icon = categoryIcons[cat.category] || Shield;
                    const isHigh = cat.severity === "High";
                    const colorHex = isHigh ? "#EF4444" : cat.severity === "Medium" ? "#F59E0B" : "#10B981";
                    const bgHex = isHigh ? "#FEE2E2" : cat.severity === "Medium" ? "#FEF3C7" : "#D1FAE5";

                    return (
                      <div key={idx} className="rr-card" style={{ marginBottom: isAggregated ? 0 : 20 }}>
                        <div className="rr-card-header" style={{ background: bgHex }}>
                          <h3 className="rr-card-title">
                            <Icon size={20} color={colorHex} />
                            {cat.category}
                          </h3>
                          <span className="rr-badge" style={severityStyle[cat.severity]}>{cat.severity} Severity</span>
                        </div>
                        <div>
                          {cat.risks.map((r, i) => (
                            <div key={i} className="rr-risk-row">
                              <AlertTriangle size={16} color={colorHex} style={{ marginTop: 2, flexShrink: 0 }} />
                              <div>
                                <div className="rr-risk-title">{r.title}</div>
                                <div className="rr-risk-desc">{r.desc}</div>
                                <div className="rr-risk-action">
                                  <CheckCircle size={14} /> {r.action}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
