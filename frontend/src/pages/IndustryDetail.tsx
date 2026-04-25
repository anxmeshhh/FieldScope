import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Sparkles, TrendingUp, Building2, DollarSign } from "lucide-react";

const API = "http://localhost:8000";

interface Level {
  name: string;
  description: string;
  capitalNeeded: string;
  timeToReach: string;
  keyMilestone: string;
}

interface Player {
  name: string;
  type: string;
  note: string;
}

interface RevenueTier {
  level: string;
  monthly: string;
  annual: string;
}

interface IndustryDetail {
  name: string;
  tagline: string;
  overview: string;
  marketSize: string;
  growth: string;
  levels: Level[];
  topPlayers: Player[];
  revenuePotential: RevenueTier[];
  forYou: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .id-wrap {
    padding: 36px 40px 80px;
    font-family: 'DM Sans', sans-serif;
    color: #1E293B;
    background: #F8FAFC;
    min-height: 100%;
  }

  @media (max-width: 640px) { .id-wrap { padding: 20px 16px 60px; } }

  /* ── NAV ── */
  .id-nav {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }

  .id-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; border: 1px solid #CBD5E1;
    border-radius: 40px; padding: 9px 18px;
    color: #64748B; font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.04em;
  }

  .id-back:hover { border-color: #93C5FD; color: #2563EB; background: #EFF6FF; }

  .id-refresh {
    display: inline-flex; align-items: center; gap: 7px;
    background: transparent; border: 1px solid #CBD5E1;
    border-radius: 40px; padding: 9px 18px;
    color: #64748B; font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }

  .id-refresh:hover { border-color: #93C5FD; color: #2563EB; background: #EFF6FF; }
  .id-refresh:disabled { opacity: 0.35; cursor: not-allowed; }

  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .id-spin { animation: spin 1s linear infinite; }

  /* ── HERO ── */
  .id-hero {
    padding-bottom: 28px; margin-bottom: 28px;
    border-bottom: 1px solid #E2E8F0; position: relative;
  }

  .id-hero::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.25), transparent);
  }

  .id-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #2563EB; margin-bottom: 12px;
  }

  .id-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #2563EB; box-shadow: 0 0 8px #2563EB;
    animation: blink 2s infinite;
  }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .id-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; line-height: 0.92; color: #0F172A;
    letter-spacing: 0.02em; margin-bottom: 8px;
  }

  .id-title span { color: #2563EB; }
  .id-tagline { font-size: 13px; color: #64748B; font-weight: 500; margin-bottom: 20px; }

  .id-hero-stats { display: flex; gap: 10px; flex-wrap: wrap; }

  .id-hero-stat {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 6px; padding: 10px 16px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .id-hero-stat-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #64748B; margin-bottom: 3px;
  }

  .id-hero-stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 0.04em; color: #0F172A;
  }

  /* ── FOR YOU ── */
  .id-foryou {
    background: #EFF6FF; border: 1px solid #BFDBFE;
    border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;
    display: flex; gap: 12px; align-items: flex-start;
    position: relative; overflow: hidden;
  }

  .id-foryou::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #2563EB, transparent);
  }

  .id-foryou-icon {
    width: 30px; height: 30px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: #DBEAFE; border: 1px solid #93C5FD; border-radius: 8px; color: #2563EB;
  }

  .id-foryou-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #2563EB; margin-bottom: 4px;
  }

  .id-foryou-text { font-size: 13px; color: #334155; line-height: 1.6; font-weight: 500; }

  /* ── SECTION CARD ── */
  .id-card {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 12px; padding: 24px; margin-bottom: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  }

  .id-section-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  }

  .id-section-icon {
    width: 30px; height: 30px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; color: #2563EB;
  }

  .id-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; color: #0F172A; letter-spacing: 0.04em;
  }

  .id-overview-text { font-size: 14px; color: #475569; line-height: 1.8; }

  /* ── LEVEL TABS ── */
  .id-tabs {
    display: flex; gap: 4px;
    background: #F1F5F9; border: 1px solid #E2E8F0;
    border-radius: 6px; padding: 5px; margin-bottom: 16px;
  }

  .id-tab {
    flex: 1; padding: 10px 8px; text-align: center;
    background: transparent; border: 1px solid transparent; border-radius: 4px;
    font-size: 13px; font-weight: 600; color: #64748B;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }

  .id-tab.active {
    background: #FFFFFF; color: #2563EB;
    border-color: #E2E8F0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  /* ── LEVEL STATS ROW ── */
  .id-level-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;
  }

  @media (max-width: 640px) { .id-level-stats { grid-template-columns: 1fr 1fr; } }

  .id-level-stat {
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px;
  }

  .id-level-stat-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #64748B; margin-bottom: 4px;
  }

  .id-level-stat-val {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #2563EB; letter-spacing: 0.04em;
  }

  /* ── LEVEL DETAIL CARD ── */
  .id-level-card {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 8px; padding: 24px; margin-bottom: 16px;
    position: relative; overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }

  .id-level-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, #2563EB 40%, #60A5FA 60%, transparent);
  }

  .id-level-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; color: #2563EB; letter-spacing: 0.06em; margin-bottom: 6px;
  }

  .id-level-desc { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px; font-weight: 500; }

  .id-level-milestone {
    font-size: 13px; color: #475569; padding-left: 12px;
    border-left: 3px solid #93C5FD; line-height: 1.5; font-weight: 500; background: #F8FAFC; padding: 10px 12px; border-radius: 0 6px 6px 0;
  }

  /* ── BOTTOM TWO COL ── */
  .id-two-col {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }

  @media (max-width: 860px) { .id-two-col { grid-template-columns: 1fr; } }

  .id-two-col .id-card { margin-bottom: 0; }

  /* Players */
  .id-player {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 12px 0; border-bottom: 1px solid #E2E8F0;
  }

  .id-player:last-child { border-bottom: none; padding-bottom: 0; }
  .id-player:first-child { padding-top: 0; }

  .id-player-avatar {
    width: 36px; height: 36px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: #2563EB;
  }

  .id-player-name { font-size: 14px; font-weight: 600; color: #0F172A; margin-bottom: 2px; }

  .id-player-type {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #64748B; margin-bottom: 4px;
  }

  .id-player-note { font-size: 12px; color: #475569; line-height: 1.5; }

  /* Revenue */
  .id-rev-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid #E2E8F0;
  }

  .id-rev-item:last-child { border-bottom: none; padding-bottom: 0; }
  .id-rev-item:first-child { padding-top: 0; }

  .id-rev-level {
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #64748B; letter-spacing: 0.06em;
  }

  .id-rev-monthly {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; color: #2563EB; letter-spacing: 0.04em; line-height: 1; text-align: right;
  }

  .id-rev-annual { font-size: 12px; color: #64748B; margin-top: 4px; text-align: right; font-weight: 500; }

  /* ── CTA ── */
  .id-assess-btn {
    display: block; width: fit-content; margin: 32px auto 0;
    padding: 14px 36px; background: #2563EB; color: #fff;
    border: none; border-radius: 40px;
    font-size: 14px; font-weight: 700; letter-spacing: 0.05em;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.22s; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }

  .id-assess-btn:hover {
    background: #1D4ED8; transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37,99,235,0.35);
  }

  /* ── LOADING ── */
  .id-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 70vh; gap: 16px; text-align: center;
  }

  .id-loading-ring {
    width: 64px; height: 64px; border-radius: 50%;
    border: 3px solid #E2E8F0; border-top-color: #2563EB;
    animation: spin 1s linear infinite;
  }

  .id-loading-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; color: #0F172A; letter-spacing: 0.04em;
  }

  .id-loading-sub { font-size: 14px; color: #64748B; max-width: 320px; line-height: 1.6; }
`;

export default function IndustryDetail() {
  const { slug }    = useParams<{ slug: string }>();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");
  const q = histId ? `?id=${histId}` : "";
  const [detail, setDetail]           = useState<IndustryDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState("");
  const [activeLevel, setActiveLevel] = useState(0);

  const fetchDetail = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        await fetch(`${API}/industries/${slug}/refresh/${q}`, { credentials: "include" });
      }
      const res  = await fetch(`${API}/industries/${slug}/${q}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) { setDetail(data.detail); setActiveLevel(0); }
      else setError(data.error || "Failed to load industry.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [slug, q]);

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="id-wrap">
        <div className="id-loading">
          <div className="id-loading-ring" />
          <div className="id-loading-title">Analyzing Industry…</div>
          <div className="id-loading-sub">
            AI is generating a personalized breakdown for your profile. Takes ~10 seconds.
          </div>
        </div>
      </div>
    </>
  );

  if (error || !detail) return (
    <>
      <style>{css}</style>
      <div className="id-wrap">
        <div className="id-loading">
          <div className="id-loading-title" style={{ color: "#2563EB" }}>Error</div>
          <div className="id-loading-sub">{error || "Something went wrong."}</div>
          <button
            style={{ marginTop: 8, padding: "10px 24px", background: "#2563EB", border: "none", borderRadius: 40, color: "#fff", fontFamily: "DM Sans", fontWeight: 700, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >← Go Back</button>
        </div>
      </div>
    </>
  );

  const words        = detail.name.trim().split(" ");
  const firstName    = words.slice(0, -1).join(" ");
  const lastName     = words[words.length - 1];
  const currentLevel   = detail.levels?.[activeLevel];
  const currentRevenue = detail.revenuePotential?.[activeLevel];

  return (
    <>
      <style>{css}</style>
      <div className="id-wrap">

        {/* Nav */}
        <div className="id-nav">
          <button className="id-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={13} /> Back to Explorer
          </button>
          <button className="id-refresh" onClick={() => fetchDetail(true)} disabled={refreshing}>
            <RefreshCw size={12} className={refreshing ? "id-spin" : ""} />
            {refreshing ? "Refreshing…" : "Regenerate"}
          </button>
        </div>

        {/* Hero */}
        <div className="id-hero">
          <div className="id-eyebrow">
            <div className="id-eyebrow-dot" /> Industry Deep Dive
          </div>
          <div className="id-title">{firstName} <span>{lastName}</span></div>
          <div className="id-tagline">{detail.tagline}</div>
          <div className="id-hero-stats">
            <div className="id-hero-stat">
              <div className="id-hero-stat-label">Market Size</div>
              <div className="id-hero-stat-val" style={{ color: "#E85D04" }}>{detail.marketSize}</div>
            </div>
            <div className="id-hero-stat">
              <div className="id-hero-stat-label">Growth</div>
              <div className="id-hero-stat-val" style={{ color: "#22C55E" }}>{detail.growth}</div>
            </div>
            <div className="id-hero-stat">
              <div className="id-hero-stat-label">Levels</div>
              <div className="id-hero-stat-val" style={{ color: "#888" }}>{detail.levels?.length ?? 3} Tiers</div>
            </div>
            <div className="id-hero-stat">
              <div className="id-hero-stat-label">Top Players</div>
              <div className="id-hero-stat-val" style={{ color: "#888" }}>{detail.topPlayers?.length ?? 5} Listed</div>
            </div>
          </div>
        </div>

        {/* Why For You */}
        {detail.forYou && (
          <div className="id-foryou">
            <div className="id-foryou-icon"><Sparkles size={13} color="#E85D04" /></div>
            <div>
              <div className="id-foryou-label">Why This Fits You</div>
              <div className="id-foryou-text">{detail.forYou}</div>
            </div>
          </div>
        )}

        {/* Overview */}
        <div className="id-card">
          <div className="id-section-head">
            <div className="id-section-icon"><TrendingUp size={13} color="#E85D04" /></div>
            <div className="id-section-title">Market Overview</div>
          </div>
          <div className="id-overview-text">{detail.overview}</div>
        </div>

        {/* Level Tabs */}
        {detail.levels?.length > 0 && (
          <>
            <div className="id-tabs">
              {detail.levels.map((l, i) => (
                <button
                  key={i}
                  className={`id-tab ${activeLevel === i ? "active" : ""}`}
                  onClick={() => setActiveLevel(i)}
                >
                  {l.name}
                </button>
              ))}
            </div>

            <div className="id-level-stats">
              {currentLevel && (
                <>
                  <div className="id-level-stat">
                    <div className="id-level-stat-label">Capital Needed</div>
                    <div className="id-level-stat-val">{currentLevel.capitalNeeded}</div>
                  </div>
                  <div className="id-level-stat">
                    <div className="id-level-stat-label">Time to Reach</div>
                    <div className="id-level-stat-val">{currentLevel.timeToReach}</div>
                  </div>
                </>
              )}
              {currentRevenue && (
                <div className="id-level-stat">
                  <div className="id-level-stat-label">Monthly Revenue</div>
                  <div className="id-level-stat-val">{currentRevenue.monthly}</div>
                </div>
              )}
            </div>

            {currentLevel && (
              <div className="id-level-card">
                <div className="id-level-name">{currentLevel.name}</div>
                <div className="id-level-desc">{currentLevel.description}</div>
                <div className="id-level-milestone">{currentLevel.keyMilestone}</div>
              </div>
            )}
          </>
        )}

        {/* Players + Revenue */}
        <div className="id-two-col">
          <div className="id-card">
            <div className="id-section-head">
              <div className="id-section-icon"><Building2 size={13} color="#E85D04" /></div>
              <div className="id-section-title">Top Players in India</div>
            </div>
            {detail.topPlayers?.map((p, i) => (
              <div key={i} className="id-player">
                <div className="id-player-avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="id-player-name">{p.name}</div>
                  <div className="id-player-type">{p.type}</div>
                  <div className="id-player-note">{p.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="id-card">
            <div className="id-section-head">
              <div className="id-section-icon"><DollarSign size={13} color="#E85D04" /></div>
              <div className="id-section-title">Revenue Potential</div>
            </div>
            {detail.revenuePotential?.map((r, i) => (
              <div key={i} className="id-rev-item">
                <div className="id-rev-level">{r.level}</div>
                <div>
                  <div className="id-rev-monthly">{r.monthly}</div>
                  <div className="id-rev-annual">{r.annual} / year</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="id-assess-btn" onClick={() => navigate("/assessment")}>
          Assess My Capability for This Industry →
        </button>

      </div>
    </>
  );
}