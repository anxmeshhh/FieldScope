import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Map, MapPin, Briefcase, Star, Handshake, ChevronRight, CheckCircle } from "lucide-react";
import HistorySelector from "../components/HistorySelector";

const API = "http://localhost:8000";

interface Vendor {
  name: string;
  type: string;
  match_score: number;
  estimated_cost: string;
  time_to_integrate: string;
  distance: string;
  probability: string;
  benefit: string;
  action: string;
}

export default function VendorMatchmaking() {
  const [params] = useSearchParams();
  const histId = params.get("history") || "";

  const [vendors, setVendors] = useState<Vendor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const loadData = (append = false) => {
    let url = `${API}/vendor-matchmaking/`;
    if (histId) url += `?id=${histId}`;
    if (append) url += (histId ? `&append=true` : `?append=true`);

    setLoading(true);
    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.vendors) {
          setVendors(data.vendors);
          if (!append) setCached(data.cached);
          if (!append && data.vendors.length > 0) setSelectedVendor(data.vendors[0]);
        } else if (!append) {
          setVendors(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(false);
  }, [histId]);

  return (
    <>
      <style>{`
        .vm-container { display: flex; height: calc(100vh - 64px); }
        .vm-sidebar { width: 400px; border-right: 1px solid var(--border); background: var(--surface); display: flex; flex-direction: column; }
        .vm-header { padding: 24px; border-bottom: 1px solid var(--border); }
        .vm-title { font-size: 22px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .vm-sub { font-size: 13px; color: var(--muted); line-height: 1.4; }
        .vm-list { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        
        .vm-card { padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: #fff; cursor: pointer; transition: all 0.2s; position: relative; }
        .vm-card:hover { border-color: rgba(18,86,243,0.3); background: var(--surface2); }
        .vm-card.active { border-color: var(--blue); background: rgba(18,86,243,0.03); box-shadow: 0 4px 16px rgba(18,86,243,0.08); }
        .vm-card-type { font-size: 10px; font-weight: 700; color: var(--blue); text-transform: uppercase; margin-bottom: 4px; }
        .vm-card-name { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .vm-card-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--muted); font-weight: 600; }
        .vm-meta-item { display: flex; align-items: center; gap: 4px; }
        .vm-score { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; background: var(--green); box-shadow: 0 4px 10px rgba(11,174,110,0.3); }
        
        .vm-load-more { margin-top: 10px; padding: 12px; border-radius: 8px; background: transparent; border: 1px dashed var(--border); color: var(--blue); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-align: center; }
        .vm-load-more:hover:not(:disabled) { border-color: var(--blue); background: rgba(18,86,243,0.03); }
        .vm-load-more:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .vm-main { flex: 1; background: var(--surface2); position: relative; display: flex; flex-direction: column; }
        .vm-map-bg { position: absolute; inset: 0; background-image: radial-gradient(var(--border2) 1px, transparent 0); background-size: 24px 24px; opacity: 0.5; }
        .vm-details { position: absolute; bottom: 40px; left: 40px; right: 40px; background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 32px; box-shadow: 0 24px 64px rgba(5,16,58,0.1); z-index: 10; animation: slide-up 0.4s cubic-bezier(0.16,1,0.3,1); }
        
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="vm-container">
        <div className="vm-sidebar">
          <div className="vm-header">
            <div className="vm-title"><Map size={24} color="var(--blue)" /> Vendor Radar</div>
            <div className="vm-sub">Optimal B2B partners tailored to your domain and capital.</div>
            <div style={{ marginTop: 16 }}><HistorySelector /></div>
          </div>
          
          <div className="vm-list">
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div className="db-spinner" style={{ margin: "0 auto" }} />
                <div style={{ marginTop: 12, fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Scouting vendors...</div>
              </div>
            ) : vendors ? (
              <>
                {vendors.map((v, i) => (
                  <div key={i} className={`vm-card ${selectedVendor === v ? "active" : ""}`} onClick={() => setSelectedVendor(v)}>
                    <div className="vm-score">{v.match_score}</div>
                    <div className="vm-card-type">{v.type}</div>
                    <div className="vm-card-name">{v.name}</div>
                    <div className="vm-card-meta">
                      <span className="vm-meta-item"><MapPin size={12} /> {v.distance}</span>
                      <span className="vm-meta-item" style={{color: "var(--blue)"}}> {v.probability} Prob.</span>
                    </div>
                  </div>
                ))}
                <button className="vm-load-more" onClick={() => loadData(true)} disabled={loading}>
                  {loading ? "Scouting..." : "Load More Vendors"}
                </button>
              </>
            ) : (
              <div className="db-empty" style={{ border: "none" }}>No vendors found.</div>
            )}
          </div>
        </div>
        
        <div className="vm-main">
          <div className="vm-map-bg" />
          
          {selectedVendor && (
            <div className="vm-details">
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(18,86,243,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Briefcase size={32} color="var(--blue)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", marginBottom: 4 }}>{selectedVendor.type}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{selectedVendor.name}</div>
                  
                  <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    <div className="db-pill green" style={{ fontSize: 12 }}>Match: {selectedVendor.match_score}/100</div>
                    <div className="db-pill amber" style={{ fontSize: 12 }}>{selectedVendor.estimated_cost}</div>
                    <div className="db-pill" style={{ fontSize: 12 }}><MapPin size={12} /> {selectedVendor.distance}</div>
                    <div className="db-pill" style={{ fontSize: 12 }}>{selectedVendor.time_to_integrate} setup</div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", marginBottom: 6 }}>Why Partner</div>
                    <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, fontWeight: 500 }}>{selectedVendor.benefit}</div>
                  </div>

                  <div style={{ background: "rgba(11,174,110,0.05)", border: "1px solid rgba(11,174,110,0.2)", padding: 16, borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <CheckCircle size={18} color="var(--green)" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", marginBottom: 4 }}>Next Action Step</div>
                      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{selectedVendor.action}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
