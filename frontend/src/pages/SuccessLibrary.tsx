import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, TrendingUp, Target, Award, Sparkles, ChevronRight } from "lucide-react";
import HistorySelector from "../components/HistorySelector";

const API = "http://localhost:8000";

interface CaseStudy {
  title: string;
  company: string;
  roi: string;
  time_to_value: string;
  capital_required: string;
  challenge: string;
  strategy: string;
}

export default function SuccessLibrary() {
  const [params] = useSearchParams();
  const histId = params.get("history") || "";

  const [library, setLibrary] = useState<CaseStudy[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);

  const loadData = (append = false) => {
    let url = `${API}/success-library/`;
    if (histId) url += `?id=${histId}`;
    if (append) url += (histId ? `&append=true` : `?append=true`);

    setLoading(true);
    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.library) {
          setLibrary(data.library);
          if (!append) setCached(data.cached);
        } else if (!append) {
          setLibrary(null);
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
        .sl-container { padding: 40px; max-width: 1200px; margin: 0 auto; animation: fade-in 0.4s ease-out; }
        .sl-header { margin-bottom: 32px; }
        .sl-title { font-size: 28px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 12px; margin-bottom: 8px; letter-spacing: -0.02em; }
        .sl-sub { font-size: 15px; color: var(--muted); }
        .sl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; }
        .sl-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); position: relative; }
        .sl-card:hover { transform: translateY(-4px); border-color: rgba(18,86,243,0.3); box-shadow: 0 12px 32px rgba(18,86,243,0.08); }
        .sl-card-img { height: 140px; background: linear-gradient(135deg, rgba(18,86,243,0.1) 0%, rgba(18,86,243,0.02) 100%); border-bottom: 1px solid var(--divider); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .sl-card-img::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(18,86,243,0.1), transparent 60%); }
        .sl-card-content { padding: 24px; }
        .sl-company { font-size: 12px; font-weight: 700; color: var(--blue); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .sl-card-title { font-size: 18px; font-weight: 800; color: var(--text); line-height: 1.3; margin-bottom: 16px; }
        
        .sl-metrics { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .sl-metric { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; background: var(--surface2); border: 1px solid var(--border); color: var(--text); }
        .sl-metric.green { background: rgba(11,174,110,0.08); border-color: rgba(11,174,110,0.2); color: var(--green); }
        .sl-metric.amber { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: var(--amber); }
        
        .sl-section { margin-bottom: 12px; }
        .sl-label { font-size: 11px; font-weight: 700; color: var(--muted2); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
        .sl-text { font-size: 13px; color: var(--muted); line-height: 1.5; font-weight: 500; }
        
        .sl-load-more { display: block; margin: 40px auto 0; padding: 12px 24px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border); color: var(--blue); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(18,86,243,0.05); }
        .sl-load-more:hover:not(:disabled) { border-color: var(--blue); background: rgba(18,86,243,0.05); }
        .sl-load-more:disabled { opacity: 0.6; cursor: not-allowed; }
        
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div className="sl-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div className="sl-header">
            <div className="sl-title"><BookOpen size={28} color="var(--blue)" /> Success Library</div>
            <div className="sl-sub">Real-world case studies tailored to your domain and scale.</div>
          </div>
          <HistorySelector />
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div className="db-spinner" style={{ margin: "0 auto" }} />
            <div style={{ marginTop: 16, color: "var(--muted)", fontWeight: 600 }}>{cached ? "Loading Library..." : "Generating Case Studies..."}</div>
          </div>
        ) : library ? (
          <>
            <div className="sl-grid">
            {library.map((study, i) => (
              <div key={i} className="sl-card" style={{ animationDelay: `${(i % 4) * 0.1}s` }}>
                <div className="sl-card-content">
                  <div className="sl-company">{study.company}</div>
                  <div className="sl-card-title">{study.title}</div>
                  
                  <div className="sl-metrics">
                    <div className="sl-metric green"><TrendingUp size={12} /> {study.roi} ROI</div>
                    <div className="sl-metric amber"><Target size={12} /> {study.time_to_value}</div>
                    <div className="sl-metric"><Award size={12} /> {study.capital_required} Cap.</div>
                  </div>
                  
                  <div className="sl-section">
                    <div className="sl-label">Challenge</div>
                    <div className="sl-text">{study.challenge}</div>
                  </div>
                  
                  <div className="sl-section">
                    <div className="sl-label" style={{color: "var(--blue)"}}>Strategy</div>
                    <div className="sl-text" style={{color: "var(--text)"}}>{study.strategy}</div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            
            <button className="sl-load-more" onClick={() => loadData(true)} disabled={loading}>
              {loading ? "Generating..." : "Load More Strategies"}
            </button>
          </>
        ) : (
          <div className="db-empty">
            <BookOpen size={24} color="var(--muted)" />
            <div className="db-empty-title">No Case Studies Found</div>
            <div className="db-empty-sub">Take an assessment to generate your personalized success library.</div>
          </div>
        )}
      </div>
    </>
  );
}
