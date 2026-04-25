import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSearchParams } from "react-router-dom";
import HistorySelector from "../components/HistorySelector";
import { SlidersHorizontal, RefreshCw, CheckCircle, Save } from "lucide-react";

type Dimension = { axis: string; you: number; competitor: number };
type Gap = { area: string; you: string; enterprise: string; gap: "Critical" | "High" | "Medium" | "Low"; action: string };

type SimResult = {
  is_aggregated?: boolean;
  comp_name?: string;
  comp_scale?: string;
  dimensions: Dimension[];
  gaps: Gap[];
};

const gapColors: Record<string, React.CSSProperties> = {
  Critical: { background: "#FEE2E2", color: "#EF4444" },
  High: { background: "#FEF3C7", color: "#F59E0B" },
  Medium: { background: "#FEF08A", color: "#EAB308" },
  Low: { background: "#D1FAE5", color: "#10B981" },
};

const tooltipStyle = {
  contentStyle: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  labelStyle: { color: "#0F172A", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#475569" }
};

const API = "http://localhost:8000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .cc-wrap { padding: 36px 40px 80px; font-family: 'DM Sans', sans-serif; color: #1E293B; background: #F8FAFC; min-height: 100%; }
  @media (max-width: 640px) { .cc-wrap { padding: 24px 20px 60px; } }

  .cc-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .cc-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2563EB; margin-bottom: 8px; }
  .cc-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: #0F172A; letter-spacing: 0.02em; line-height: 1; margin-bottom: 8px; }
  .cc-subtitle { font-size: 14px; color: #64748B; font-weight: 500; }

  .cc-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
  @media (max-width: 1024px) { .cc-grid { grid-template-columns: 1fr; } }

  .cc-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
  .cc-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #0F172A; letter-spacing: 0.04em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

  .cc-control-group { margin-bottom: 20px; }
  .cc-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
  .cc-input { width: 100%; -webkit-appearance: none; height: 6px; background: #E2E8F0; border-radius: 4px; outline: none; }
  .cc-input::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #2563EB; cursor: pointer; transition: transform 0.1s; }
  .cc-input::-webkit-slider-thumb:hover { transform: scale(1.2); }
  
  .cc-text-input { width: 100%; padding: 10px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
  .cc-text-input:focus { border-color: #2563EB; }

  .cc-btn { width: 100%; padding: 12px; background: #2563EB; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
  .cc-btn:hover { background: #1D4ED8; }
  .cc-btn:disabled { background: #94A3B8; cursor: not-allowed; }
  
  .cc-btn-sec { background: #F1F5F9; color: #0F172A; }
  .cc-btn-sec:hover { background: #E2E8F0; }

  .cc-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; text-align: center; }
  .cc-loading-ring { width: 48px; height: 48px; border-radius: 50%; border: 3px solid #E2E8F0; border-top-color: #2563EB; animation: spin 1s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .cc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .cc-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; }
  .cc-table td { padding: 14px 16px; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-weight: 500; }
  .cc-badge { font-size: 11px; padding: 4px 10px; border-radius: 40px; font-weight: 600; display: inline-block; }
`;

export default function CompetitorComparison() {
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");

  const [capital, setCapital] = useState(100000);
  const [teamSize, setTeamSize] = useState(5);
  const [clients, setClients] = useState(10);
  const [compName, setCompName] = useState("Enterprise Leader");
  const [compScale, setCompScale] = useState("Enterprise");
  
  const [data, setData] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadInitial = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/simulate-competitor/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: histId, initial: true }),
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        if (json.is_aggregated) {
          setData(json);
        } else {
          setData(null);
        }
      } else {
        setError(json.error || "Failed to check profile.");
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
      const payload: any = { 
        id: histId,
        capital,
        team_size: teamSize,
        clients,
        comp_name: compName,
        comp_scale: compScale
      };
      
      const res = await fetch(`${API}/simulate-competitor/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || "Failed to run simulation.");
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setSimulating(false);
    }
  };

  const saveProfile = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const savedData = { ...data, is_aggregated: true };
      const res = await fetch(`${API}/save-competitor-profile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: histId, profile: savedData }),
        credentials: "include"
      });
      if (res.ok) {
        setData(savedData);
      } else {
        alert("Failed to save profile.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <><style>{css}</style>
    <div className="cc-wrap">
      <div className="cc-loading">
        <div className="cc-loading-ring" />
        <div className="cc-title" style={{ fontSize: 24, marginBottom: 0 }}>Scanning Database...</div>
        <div className="cc-subtitle">Checking for saved competitor comparisons.</div>
      </div>
    </div></>
  );

  if (error && !data) return (
    <><style>{css}</style>
    <div className="cc-wrap">
      <div className="cc-loading">
        <div className="cc-title" style={{ fontSize: 24, marginBottom: 0, color: "#EF4444" }}>Error</div>
        <div className="cc-subtitle">{error}</div>
      </div>
    </div></>
  );

  const isAggregated = data?.is_aggregated;
  const targetName = data?.comp_name || "Enterprise";

  return (
    <>
      <style>{css}</style>
      <div className="cc-wrap">
        <div className="cc-header-row">
          <div>
            <div className="cc-eyebrow">Module 09 — Phase 2</div>
            <h1 className="cc-title">Competitor Comparison</h1>
            <p className="cc-subtitle">Target specific competitors and simulate how adjusting your scale impacts your market standing.</p>
          </div>
          <HistorySelector />
        </div>

        <div className={isAggregated ? "" : "cc-grid"}>
          {/* Controls */}
          {!isAggregated && (
            <div className="cc-card" style={{ alignSelf: "start" }}>
              <h3 className="cc-card-title"><SlidersHorizontal size={18} color="#2563EB" /> Targeted Simulation</h3>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>Define your target rival and simulate your capabilities.</p>
              
              <div className="cc-control-group">
                <div className="cc-label"><span>Target Competitor Name</span></div>
                <input type="text" value={compName} onChange={(e) => setCompName(e.target.value)} className="cc-text-input" placeholder="e.g. Ogilvy, Local Firm X" />
              </div>

              <div className="cc-control-group">
                <div className="cc-label"><span>Competitor Scale</span></div>
                <select value={compScale} onChange={(e) => setCompScale(e.target.value)} className="cc-text-input">
                  <option value="Local">Local Boutique</option>
                  <option value="Regional">Regional Agency</option>
                  <option value="Enterprise">Enterprise Leader</option>
                  <option value="Global">Global Conglomerate</option>
                </select>
              </div>
              
              <div style={{ height: 1, background: "#E2E8F0", margin: "24px 0" }} />
              
              <div className="cc-control-group">
                <div className="cc-label">
                  <span>Your Sim. Capital (₹)</span>
                  <span style={{ color: "#2563EB" }}>₹{(capital / 100000).toFixed(1)}L</span>
                </div>
                <input type="range" min={10000} max={2000000} step={10000} value={capital} onChange={(e) => setCapital(Number(e.target.value))} className="cc-input" />
              </div>

              <div className="cc-control-group">
                <div className="cc-label">
                  <span>Your Sim. Team Size</span>
                  <span style={{ color: "#2563EB" }}>{teamSize} members</span>
                </div>
                <input type="range" min={1} max={50} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className="cc-input" />
              </div>

              <div className="cc-control-group">
                <div className="cc-label">
                  <span>Your Sim. Clients</span>
                  <span style={{ color: "#2563EB" }}>{clients}</span>
                </div>
                <input type="range" min={1} max={100} value={clients} onChange={(e) => setClients(Number(e.target.value))} className="cc-input" />
              </div>

              <button className="cc-btn" onClick={runSimulation} disabled={simulating}>
                {simulating ? <RefreshCw size={16} className="animate-spin" /> : "Run Comparison"}
              </button>
              
              {data && !isAggregated && (
                <button className="cc-btn cc-btn-sec" onClick={saveProfile} disabled={saving} style={{ marginTop: 12 }}>
                  {saving ? "Saving..." : <><Save size={16} /> Save as Persistent Profile</>}
                </button>
              )}
            </div>
          )}

          {/* Results */}
          <div>
            {!data && !simulating ? (
              <div className="cc-card cc-loading" style={{ minHeight: "300px" }}>
                <SlidersHorizontal size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
                <div className="cc-title" style={{ fontSize: 24, marginBottom: 0 }}>Awaiting Inputs</div>
                <div className="cc-subtitle">Define your rival and set your simulation factors to begin.</div>
              </div>
            ) : simulating && !data ? (
              <div className="cc-card cc-loading">
                <div className="cc-loading-ring" />
                <div className="cc-title" style={{ fontSize: 24, marginBottom: 0 }}>Evaluating Standing...</div>
              </div>
            ) : data ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {isAggregated && (
                  <div style={{ background: "#D1FAE5", color: "#065F46", padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={16} /> Data persistently loaded from database.
                  </div>
                )}
                
                <div className="cc-card" style={{ display: "flex", flexDirection: "column", opacity: simulating ? 0.5 : 1, transition: "opacity 0.2s" }}>
                  <h3 className="cc-card-title">You vs {targetName} (Radar)</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={data.dimensions}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }} />
                      <Tooltip {...tooltipStyle} />
                      <Radar name="Simulated You" dataKey="you" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name={targetName} dataKey="competitor" stroke="#64748B" fill="#64748B" fillOpacity={0.05} strokeWidth={2} strokeDasharray="3 3" />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563EB" }} />Simulated You</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px dashed #64748B" }} />{targetName}</div>
                  </div>
                </div>

                <div className="cc-card" style={{ padding: 0, overflow: "hidden", opacity: simulating ? 0.5 : 1, transition: "opacity 0.2s" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
                    <h3 className="cc-card-title" style={{ margin: 0 }}>Targeted Gap Analysis</h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="cc-table">
                      <thead>
                        <tr>
                          <th>Area</th>
                          <th>Simulated You</th>
                          <th>{targetName}</th>
                          <th>Gap Risk</th>
                          <th>Next Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.gaps.map((row, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{row.area}</td>
                            <td style={{ color: "#2563EB" }}>{row.you}</td>
                            <td style={{ color: "#64748B" }}>{row.enterprise}</td>
                            <td><span className="cc-badge" style={gapColors[row.gap]}>{row.gap}</span></td>
                            <td style={{ color: "#64748B", fontSize: 12 }}>→ {row.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
