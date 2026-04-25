import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Clock } from "lucide-react";

const API = "http://localhost:8000";

interface HistItem {
  id: number;
  domain: string;
  created_at: string;
}

export default function HistorySelector({ dark = false }: { dark?: boolean }) {
  const [history, setHistory] = useState<HistItem[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentId = searchParams.get("history") || "";

  useEffect(() => {
    fetch(`${API}/assessments/history/`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.history) setHistory(d.history);
      })
      .catch(() => {});
  }, []);

  if (history.length === 0) return null;

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: 8, 
      background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", 
      padding: "6px 12px", 
      borderRadius: 4, 
      border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)" 
    }}>
      <Clock size={12} color={dark ? "#aaa" : "#555"} />
      <select
        value={currentId}
        onChange={e => {
          const val = e.target.value;
          if (val) {
            navigate(`${location.pathname}?history=${val}`);
          } else {
            navigate(location.pathname);
          }
        }}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 12,
          color: dark ? "#E0E0E0" : "#333",
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <option value="" style={{ color: "#333", background: "#fff" }}>Latest Assessment</option>
        {history.map(h => (
          <option key={h.id} value={h.id.toString()} style={{ color: "#333", background: "#fff" }}>
            {h.domain} ({new Date(h.created_at).toLocaleDateString()})
          </option>
        ))}
      </select>
    </div>
  );
}
