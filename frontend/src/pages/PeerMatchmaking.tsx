import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Link as LinkIcon, Target, ChevronRight, Activity } from "lucide-react";
import HistorySelector from "../components/HistorySelector";

const API = "http://localhost:8000";

interface Peer {
  name: string;
  domain: string;
  synergy: string;
  reason: string;
  strategy: string;
}

export default function PeerMatchmaking() {
  const [params] = useSearchParams();
  const histId = params.get("history") || "";

  const [peers, setPeers] = useState<Peer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);

  const loadData = (append = false) => {
    let url = `${API}/peer-matchmaking/`;
    if (histId) url += `?id=${histId}`;
    if (append) url += (histId ? `&append=true` : `?append=true`);

    setLoading(true);
    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.peers) {
          setPeers(data.peers);
          if (!append) setCached(data.cached);
        } else if (!append) {
          setPeers(null);
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
        .pm-container { padding: 40px; max-width: 1200px; margin: 0 auto; animation: fade-in 0.4s ease-out; }
        .pm-header { margin-bottom: 32px; }
        .pm-title { font-size: 28px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 12px; margin-bottom: 8px; letter-spacing: -0.02em; }
        .pm-sub { font-size: 15px; color: var(--muted); }
        .pm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
        .pm-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.3s; position: relative; overflow: hidden; }
        .pm-card:hover { border-color: rgba(18,86,243,0.3); box-shadow: 0 12px 32px rgba(18,86,243,0.08); transform: translateY(-4px); }
        .pm-bg-circle { position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(18,86,243,0.05) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        
        .pm-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .pm-domain { font-size: 11px; font-weight: 800; color: var(--blue); text-transform: uppercase; letter-spacing: 0.05em; background: rgba(18,86,243,0.1); padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; }
        .pm-name { font-size: 20px; font-weight: 800; color: var(--text); }
        .pm-synergy { text-align: right; }
        .pm-syn-val { font-size: 24px; font-weight: 800; color: var(--green); line-height: 1; }
        .pm-syn-lbl { font-size: 10px; font-weight: 700; color: var(--muted2); text-transform: uppercase; margin-top: 4px; }
        
        .pm-divider { height: 1px; background: var(--divider); margin: 20px 0; }
        
        .pm-section { margin-bottom: 16px; }
        .pm-label { font-size: 11px; font-weight: 700; color: var(--muted2); text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .pm-text { font-size: 14px; color: var(--text); line-height: 1.5; font-weight: 500; }
        
        .pm-strategy { background: rgba(18,86,243,0.03); border: 1px dashed rgba(18,86,243,0.3); padding: 16px; border-radius: 12px; }
        
        .pm-load-more { display: block; margin: 40px auto 0; padding: 12px 24px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border); color: var(--blue); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(18,86,243,0.05); }
        .pm-load-more:hover:not(:disabled) { border-color: var(--blue); background: rgba(18,86,243,0.05); }
        .pm-load-more:disabled { opacity: 0.6; cursor: not-allowed; }
        
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div className="pm-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div className="pm-header">
            <div className="pm-title"><Users size={28} color="var(--blue)" /> Peer Synergy Network</div>
            <div className="pm-sub">Complementary businesses in your area for cross-promotion and partnership.</div>
          </div>
          <HistorySelector />
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div className="db-spinner" style={{ margin: "0 auto" }} />
            <div style={{ marginTop: 16, color: "var(--muted)", fontWeight: 600 }}>{cached ? "Loading Network..." : "Discovering Peers..."}</div>
          </div>
        ) : peers ? (
          <>
            <div className="pm-grid">
            {peers.map((peer, i) => (
              <div key={i} className="pm-card" style={{ animationDelay: `${(i % 4) * 0.1}s` }}>
                <div className="pm-bg-circle" />
                <div className="pm-top">
                  <div>
                    <div className="pm-domain">{peer.domain}</div>
                    <div className="pm-name">{peer.name}</div>
                  </div>
                  <div className="pm-synergy">
                    <div className="pm-syn-val">{peer.synergy}</div>
                    <div className="pm-syn-lbl">Synergy Score</div>
                  </div>
                </div>
                
                <div className="pm-section">
                  <div className="pm-label"><LinkIcon size={12} color="var(--muted)" /> Why Connect</div>
                  <div className="pm-text">{peer.reason}</div>
                </div>
                
                <div className="pm-strategy">
                  <div className="pm-label" style={{ color: "var(--blue)" }}><Target size={12} /> Co-Marketing Strategy</div>
                  <div className="pm-text" style={{ fontSize: 13 }}>{peer.strategy}</div>
                </div>
              </div>
            ))}
            </div>
            
            <button className="pm-load-more" onClick={() => loadData(true)} disabled={loading}>
              {loading ? "Discovering..." : "Load More Peers"}
            </button>
          </>
        ) : (
          <div className="db-empty">
            <Users size={24} color="var(--muted)" />
            <div className="db-empty-title">No Peers Found</div>
            <div className="db-empty-sub">Take an assessment to generate your networking opportunities.</div>
          </div>
        )}
      </div>
    </>
  );
}
