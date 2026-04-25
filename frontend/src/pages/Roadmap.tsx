import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle, Circle, Loader2, Zap, Flag,
  ChevronRight, Trophy, Flame, TrendingUp,
  Lightbulb, Building2, Target, Map,
} from "lucide-react";

const API = "http://localhost:8000";

interface Week { week: number; title: string; focus: string; tasks: string[]; goal: string; }
interface RoadmapData { roadmap: Week[]; domain: string; level: string; cached: boolean; }
type Progress = Record<string, number[]>;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rm { min-height: 100vh; padding: 40px 44px 80px; font-family: 'DM Sans', sans-serif; color: #F0F0F0; background: #080808; position: relative; }
  .rm::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(232,93,4,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,93,4,0.025) 1px, transparent 1px); background-size: 48px 48px; }
  .rm > * { position: relative; z-index: 1; }

  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes fade-up  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bar-in   { from{width:0} }
  @keyframes strike   { from{width:0} to{width:100%} }
  @keyframes pop      { 0%{transform:scale(0.6);opacity:0} 65%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
  @keyframes glow-g   { 0%,100%{box-shadow:0 0 10px rgba(72,199,116,0.25)} 50%{box-shadow:0 0 24px rgba(72,199,116,0.55)} }
  @keyframes unlock-in{ from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ls       { 0%{transform:translateX(-100%)} 100%{transform:translateX(280%)} }
  .spin { animation: spin 1s linear infinite; }

  /* HEADER */
  .rm-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #161616; position: relative; animation: fade-up 0.4s ease both; }
  .rm-header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(232,93,4,0.25), transparent); }
  .rm-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #E85D04; margin-bottom: 12px; }
  .rm-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #E85D04; box-shadow: 0 0 10px #E85D04; animation: blink 2s infinite; }
  .rm-title { font-family: 'Bebas Neue', sans-serif; font-size: 54px; line-height: 0.9; letter-spacing: 0.02em; color: #F5F5F5; margin-bottom: 8px; }
  .rm-title em { color: #E85D04; font-style: normal; }
  .rm-subtitle { font-size: 13px; color: #555; line-height: 1.6; max-width: 480px; }
  .rm-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .rm-logo-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(232,93,4,0.1); border: 1px solid rgba(232,93,4,0.22); border-radius: 8px; }
  .rm-logo-text { font-family: 'Bebas Neue'; font-size: 22px; letter-spacing: 0.1em; color: #F0F0F0; }
  .rm-logo-text em { color: #E85D04; font-style: normal; }

  /* BANNER */
  .rm-banner { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 28px; background: #0D0D0D; border: 1px solid #1C1C1C; border-radius: 4px; padding: 24px 28px; margin-bottom: 20px; position: relative; overflow: hidden; animation: fade-up 0.4s 0.05s ease both; }
  .rm-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #5A1E00, #E85D04 45%, #FF8C42 75%, transparent); }
  .rm-banner-left { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
  .rm-banner-item { display: flex; flex-direction: column; gap: 3px; }
  .rm-banner-key { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #333; }
  .rm-banner-val { font-family: 'Bebas Neue'; font-size: 20px; color: #F0F0F0; letter-spacing: 0.04em; line-height: 1; }
  .rm-banner-val.orange { color: #E85D04; }
  .rm-banner-divider { width: 1px; height: 32px; background: #1E1E1E; flex-shrink: 0; }
  .rm-banner-right { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
  .rm-score-num { font-family: 'Bebas Neue'; font-size: 52px; color: #E85D04; line-height: 1; letter-spacing: 0.04em; }
  .rm-score-denom { font-family: 'DM Mono'; font-size: 14px; color: #2A2A2A; }
  .rm-score-sub { font-size: 9px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 3px; }
  .rm-score-bar-wrap { height: 3px; background: #181818; border-radius: 2px; overflow: hidden; margin-top: 5px; }
  .rm-score-bar { height: 100%; border-radius: 2px; animation: bar-in 1s 0.3s ease both; }
  .rm-level-badge { padding: 9px 18px; border-radius: 4px; font-family: 'DM Mono'; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(232,93,4,0.08); color: #E85D04; border: 1px solid rgba(232,93,4,0.22); white-space: nowrap; }

  /* QUICK NAV */
  .rm-quick-bar { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; animation: fade-up 0.4s 0.08s ease both; }
  .rm-quick-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #0D0D0D; border: 1px solid #1C1C1C; border-radius: 4px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
  .rm-quick-item::after { content: ''; position: absolute; bottom: 0; left: 8%; right: 8%; height: 1px; background: #E85D04; transform: scaleX(0); transition: transform 0.22s; }
  .rm-quick-item:hover::after, .rm-quick-item.active::after { transform: scaleX(1); }
  .rm-quick-item:hover { border-color: rgba(232,93,4,0.25); background: rgba(232,93,4,0.04); }
  .rm-quick-item.active { border-color: rgba(232,93,4,0.3); background: rgba(232,93,4,0.06); cursor: default; }
  .rm-quick-icon { width: 30px; height: 30px; border-radius: 7px; background: rgba(232,93,4,0.08); border: 1px solid rgba(232,93,4,0.14); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rm-quick-label { font-size: 12px; font-weight: 600; color: #C0C0C0; }
  .rm-quick-sub   { font-size: 9px; color: #444; font-family: 'DM Mono'; margin-top: 1px; }

  /* PROGRESS */
  .rm-progress-wrap { margin-bottom: 20px; background: #0D0D0D; border: 1px solid #1C1C1C; border-radius: 4px; padding: 18px 24px; animation: fade-up 0.4s 0.1s ease both; }
  .rm-prog-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .rm-prog-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #444; }
  .rm-prog-count { font-family: 'Bebas Neue'; font-size: 20px; color: #E85D04; letter-spacing: 0.04em; }
  .rm-prog-track { height: 5px; background: #141414; border-radius: 3px; overflow: hidden; margin-bottom: 12px; }
  .rm-prog-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #7A2E01, #E85D04, #48C774); transition: width 0.6s cubic-bezier(0.4,0,0.2,1); animation: bar-in 0.8s 0.2s ease both; }
  .rm-week-dots { display: flex; gap: 8px; }
  .rm-week-dot { flex: 1; height: 4px; border-radius: 2px; transition: background 0.3s; cursor: pointer; }

  /* PATH */
  .rm-path { display: grid; grid-template-columns: 192px 1fr; background: #0D0D0D; border: 1px solid #1C1C1C; border-radius: 4px; overflow: hidden; animation: fade-up 0.4s 0.12s ease both; }

  /* WEEK COL */
  .rm-weeks-col { border-right: 1px solid #161616; position: relative; }
  .rm-weeks-col::before { content: ''; position: absolute; right: -1px; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, rgba(232,93,4,0.35), rgba(232,93,4,0.03)); }
  .rm-week-btn { display: flex; align-items: center; gap: 12px; padding: 16px 20px; cursor: pointer; width: 100%; background: transparent; border: none; border-bottom: 1px solid #0F0F0F; text-align: left; font-family: 'DM Sans'; position: relative; transition: background 0.18s; }
  .rm-week-btn:last-child { border-bottom: none; }
  .rm-week-btn:hover { background: rgba(255,255,255,0.012); }
  .rm-week-btn.active { background: rgba(232,93,4,0.055); }
  .rm-week-btn.active::after { content: ''; position: absolute; right: -1px; top: 16%; bottom: 16%; width: 2px; border-radius: 2px 0 0 2px; background: #E85D04; box-shadow: 0 0 10px rgba(232,93,4,0.5); }
  .rm-week-circle { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono'; font-size: 12px; transition: all 0.2s; }
  .rm-week-circle.done   { background: rgba(72,199,116,0.1); border: 1px solid rgba(72,199,116,0.38); color: #48C774; animation: glow-g 2.5s infinite; }
  .rm-week-circle.active { background: rgba(232,93,4,0.1); border: 1px solid rgba(232,93,4,0.38); color: #E85D04; box-shadow: 0 0 12px rgba(232,93,4,0.22); }
  .rm-week-circle.locked { background: #0F0F0F; border: 1px solid #1A1A1A; color: #2A2A2A; }
  .rm-week-meta { overflow: hidden; }
  .rm-week-status { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .week-done   .rm-week-status { color: #48C774; }
  .week-active .rm-week-status { color: #E85D04; }
  .week-locked .rm-week-status { color: #222; }
  .rm-week-name { font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .week-done   .rm-week-name { color: #555; }
  .week-active .rm-week-name { color: #D0D0D0; }
  .week-locked .rm-week-name { color: #2A2A2A; }

  /* CONTENT */
  .rm-content-col { padding: 28px 32px; }
  .rm-content-head { margin-bottom: 22px; }
  .rm-content-week-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #E85D04; margin-bottom: 10px; }
  .rm-content-title { font-family: 'Bebas Neue'; font-size: 32px; color: #F5F5F5; letter-spacing: 0.02em; line-height: 1; margin-bottom: 6px; }
  .rm-content-focus { font-size: 13px; color: #666; line-height: 1.6; }

  /* TASKS */
  .rm-tasks-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .rm-tasks-label { font-size: 9px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #2A2A2A; }
  .rm-tasks-count { font-family: 'DM Mono'; font-size: 11px; color: #E85D04; }

  .rm-task { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 4px; border: 1px solid #141414; background: #0A0A0A; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
  .rm-task::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #E85D04; transform: scaleY(0); transform-origin: top; transition: transform 0.22s; }
  .rm-task:hover { border-color: rgba(232,93,4,0.2); background: rgba(232,93,4,0.022); }
  .rm-task:hover::before { transform: scaleY(1); }
  .rm-task.task-done { background: rgba(72,199,116,0.035); border-color: rgba(72,199,116,0.16); }
  .rm-task.task-done::before { background: #48C774; transform: scaleY(1); }
  .rm-task.saving { opacity: 0.6; pointer-events: none; }
  .rm-task-check { flex-shrink: 0; margin-top: 2px; }
  .rm-task.task-done .rm-task-check { animation: pop 0.3s ease both; }
  .rm-task-num { font-family: 'DM Mono'; font-size: 10px; color: #222; flex-shrink: 0; margin-top: 3px; }
  .rm-task.task-done .rm-task-num { color: #48C774; }
  .rm-task-text { font-size: 13px; line-height: 1.6; font-weight: 500; position: relative; display: inline; }
  .rm-task:not(.task-done) .rm-task-text { color: #C0C0C0; }
  .rm-task.task-done .rm-task-text { color: #444; }
  .rm-task.task-done .rm-task-text::after { content: ''; position: absolute; left: 0; top: 50%; height: 1px; background: rgba(72,199,116,0.45); animation: strike 0.35s ease both; width: 100%; }
  .rm-task-done-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #48C774; margin-top: 4px; opacity: 0; transition: opacity 0.2s; }
  .rm-task.task-done .rm-task-done-label { opacity: 1; }

  /* GOAL */
  .rm-goal { margin-top: 18px; padding: 16px 18px; background: rgba(232,93,4,0.05); border: 1px solid rgba(232,93,4,0.18); border-radius: 4px; display: flex; align-items: flex-start; gap: 12px; position: relative; overflow: hidden; }
  .rm-goal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(232,93,4,0.35), transparent); }
  .rm-goal-label { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #E85D04; margin-bottom: 5px; }
  .rm-goal-text { font-size: 13px; color: #C0C0C0; line-height: 1.6; }

  /* UNLOCK */
  .rm-unlock { margin-top: 20px; padding: 22px 24px; background: rgba(72,199,116,0.05); border: 1px solid rgba(72,199,116,0.2); border-radius: 4px; animation: unlock-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both; position: relative; overflow: hidden; }
  .rm-unlock::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(72,199,116,0.45), transparent); }
  .rm-unlock-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .rm-unlock-icon { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(72,199,116,0.1); border: 1px solid rgba(72,199,116,0.28); animation: glow-g 2s infinite; }
  .rm-unlock-title { font-family: 'Bebas Neue'; font-size: 22px; color: #48C774; letter-spacing: 0.04em; line-height: 1; margin-bottom: 2px; }
  .rm-unlock-sub { font-size: 11px; color: #555; }
  .rm-unlock-next { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(232,93,4,0.07); border: 1px solid rgba(232,93,4,0.18); border-radius: 4px; cursor: pointer; transition: all 0.2s; }
  .rm-unlock-next:hover { background: rgba(232,93,4,0.13); border-color: rgba(232,93,4,0.32); }
  .rm-unlock-next-label { font-size: 12px; font-weight: 600; color: #E85D04; flex: 1; }
  .rm-unlock-next-sub   { font-size: 10px; color: #666; margin-top: 2px; }

  /* ALL DONE */
  .rm-all-done { margin-top: 20px; padding: 36px 32px; text-align: center; background: rgba(72,199,116,0.04); border: 1px solid rgba(72,199,116,0.16); border-radius: 4px; animation: unlock-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .rm-ad-trophy { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background: rgba(72,199,116,0.1); border: 1px solid rgba(72,199,116,0.28); box-shadow: 0 0 36px rgba(72,199,116,0.18); animation: pop 0.5s ease both; }
  .rm-ad-title { font-family: 'Bebas Neue'; font-size: 48px; color: #48C774; letter-spacing: 0.04em; margin-bottom: 8px; }
  .rm-ad-sub { font-size: 13px; color: #666; line-height: 1.65; margin-bottom: 28px; max-width: 360px; margin-left: auto; margin-right: auto; }
  .rm-ad-ctas { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .rm-ad-primary { display: flex; align-items: center; gap: 8px; padding: 13px 28px; background: #E85D04; color: #fff; border: none; border-radius: 4px; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'DM Sans'; cursor: pointer; transition: all 0.22s; box-shadow: 0 0 24px rgba(232,93,4,0.32); }
  .rm-ad-primary:hover { background: #FF6B1A; transform: translateY(-2px); box-shadow: 0 0 44px rgba(232,93,4,0.55); }
  .rm-ad-secondary { display: flex; align-items: center; gap: 8px; padding: 13px 22px; background: transparent; color: #888; border: 1px solid #222; border-radius: 4px; font-size: 13px; font-weight: 600; font-family: 'DM Sans'; cursor: pointer; transition: all 0.2s; }
  .rm-ad-secondary:hover { border-color: rgba(232,93,4,0.3); color: #E85D04; }

  /* SAVE TOAST */
  .rm-save-toast { position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #0D0D0D; border: 1px solid #1C1C1C; border-radius: 4px; font-size: 11px; color: #555; font-family: 'DM Mono'; transition: all 0.3s; opacity: 0; transform: translateY(8px); pointer-events: none; }
  .rm-save-toast.visible { opacity: 1; transform: translateY(0); }
  .rm-save-toast.saved   { border-color: rgba(72,199,116,0.3); color: #48C774; }

  /* LOADING / ERROR */
  .rm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; gap: 18px; }
  .rm-loading-ring { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(232,93,4,0.07); border: 1px solid rgba(232,93,4,0.18); }
  .rm-loading-bar { width: 160px; height: 2px; background: #141414; border-radius: 1px; overflow: hidden; }
  .rm-loading-fill { height: 100%; width: 40%; background: linear-gradient(90deg, #7A2E01, #E85D04); animation: ls 1.4s ease-in-out infinite; }
  .rm-loading-text { font-family: 'DM Mono'; font-size: 11px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; }
  .rm-error { text-align: center; padding: 80px 32px; }
  .rm-error-title { font-family: 'Bebas Neue'; font-size: 40px; color: #2A2A2A; margin-bottom: 10px; }
  .rm-error-sub { font-size: 13px; color: #444; line-height: 1.65; }

  @media (max-width: 900px) {
    .rm { padding: 24px 16px 56px; }
    .rm-title { font-size: 44px; }
    .rm-quick-bar { grid-template-columns: repeat(2,1fr); }
    .rm-banner { grid-template-columns: 1fr; }
    .rm-path { grid-template-columns: 1fr; }
    .rm-weeks-col { border-right: none; border-bottom: 1px solid #161616; display: flex; overflow-x: auto; }
    .rm-weeks-col::before { display: none; }
    .rm-week-btn { border-bottom: none; border-right: 1px solid #0F0F0F; flex-shrink: 0; width: 130px; }
    .rm-week-btn.active::after { right: auto; bottom: -1px; top: auto; left: 8%; right: 8%; width: auto; height: 2px; }
    .rm-content-col { padding: 22px 18px; }
    .rm-ad-ctas { flex-direction: column; }
  }
`;

function scoreColor(s: number) {
  if (s >= 70) return "#E85D04";
  if (s >= 40) return "#B84A03";
  return "#7A2E01";
}

export default function Roadmap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");
  const q = histId ? `?id=${histId}` : "";
  const nav = (p: string) => navigate(histId ? `${p}?history=${histId}` : p);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState<string | null>(null);
  const [saveFlash,  setSaveFlash]  = useState<"saving" | "saved" | null>(null);
  const [data,       setData]       = useState<RoadmapData | null>(null);
  const [score,      setScore]      = useState(0);
  const [error,      setError]      = useState("");
  const [activeWeek, setActiveWeek] = useState(0);
  const [progress,   setProgress]   = useState<Progress>({});

  useEffect(() => {
    Promise.all([
      fetch(`${API}/roadmap/generate/${q}`, { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/roadmap/tasks/${q}`,    { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/dashboard/data/${q}`,   { credentials: "include" }).then(r => r.json()),
    ])
      .then(([rm, prog, dash]) => {
        // ── Roadmap data ──
        if (rm.roadmap) {
          setData(rm);
        } else {
          setError(rm.error ?? "Failed to load roadmap.");
        }

        // ── FIX: Convert [{week_index, task_index}] → {"0": [1,2], "1": [0]} ──
        if (Array.isArray(prog.progress)) {
          const converted: Progress = {};
          for (const item of prog.progress) {
            const key = String(item.week_index);
            if (!converted[key]) converted[key] = [];
            if (!converted[key].includes(item.task_index)) {
              converted[key].push(item.task_index);
            }
          }
          setProgress(converted);
        }

        // ── Score from dashboard ──
        if (dash.assessment?.capability_score) {
          setScore(dash.assessment.capability_score);
        }
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, []);

  const weeks: Week[] = data?.roadmap ?? [];

  const toggleTask = useCallback(async (weekIdx: number, taskIdx: number) => {
    const key    = `${weekIdx}-${taskIdx}`;
    const wKey   = String(weekIdx);
    const current    = progress[wKey] ?? [];
    const isNowDone  = !current.includes(taskIdx);

    // Optimistic update
    setProgress(prev => {
      const arr = prev[wKey] ?? [];
      return {
        ...prev,
        [wKey]: isNowDone
          ? [...arr, taskIdx]
          : arr.filter(i => i !== taskIdx),
      };
    });
    setSaving(key);
    setSaveFlash("saving");

    try {
      await fetch(`${API}/roadmap/tasks/save/${q}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_index: weekIdx, task_index: taskIdx, completed: isNowDone }),
      });
      setSaveFlash("saved");
      setTimeout(() => setSaveFlash(null), 1600);
    } catch {
      // Rollback on failure
      setProgress(prev => {
        const arr = prev[wKey] ?? [];
        return {
          ...prev,
          [wKey]: isNowDone
            ? arr.filter(i => i !== taskIdx)
            : [...arr, taskIdx],
        };
      });
      setSaveFlash(null);
    } finally {
      setSaving(null);
    }
  }, [progress]);

  const isWeekDone = (idx: number) => {
    const w = weeks[idx];
    if (!w?.tasks?.length) return false;
    return (progress[String(idx)]?.length ?? 0) >= w.tasks.length;
  };

  const totalTasks   = weeks.reduce((s, w) => s + (w.tasks?.length ?? 0), 0);
  const doneTasks    = Object.values(progress).reduce((s, arr) => s + arr.length, 0);
  const overallPct   = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const allDone      = weeks.length > 0 && weeks.every((_, i) => isWeekDone(i));
  const current      = weeks[activeWeek] ?? null;
  const currentDone  = progress[String(activeWeek)]?.length ?? 0;
  const currentTotal = current?.tasks?.length ?? 0;
  const weekComplete = currentTotal > 0 && currentDone >= currentTotal;
  const nextWeek     = weeks[activeWeek + 1] ?? null;

  if (loading) return (
    <><style>{css}</style>
    <div className="rm-loading">
      <div className="rm-loading-ring"><Loader2 size={28} color="#E85D04" className="spin" /></div>
      <div className="rm-loading-bar"><div className="rm-loading-fill" /></div>
      <div className="rm-loading-text">Building your growth path…</div>
    </div></>
  );

  if (error) return (
    <><style>{css}</style>
    <div className="rm-error">
      <div className="rm-error-title">Could Not Load</div>
      <div className="rm-error-sub">{error}<br />Complete your assessment first, then return here.</div>
    </div></>
  );

  return (
    <><style>{css}</style>
    <div className="rm">

      {/* HEADER */}
      <div className="rm-header">
        <div>
          <div className="rm-eyebrow"><div className="rm-eyebrow-dot" /> Module 05 · AI Generated Roadmap</div>
          <div className="rm-title">Growth <em>Roadmap</em></div>
          <div className="rm-subtitle">Mark tasks done — progress saves automatically. Clear every week to advance.</div>
        </div>
        <div className="rm-logo">
          <div className="rm-logo-icon"><Zap size={15} color="#E85D04" /></div>
          <div className="rm-logo-text">Field<em>Scope</em></div>
        </div>
      </div>

      {/* SCORE BANNER */}
      <div className="rm-banner">
        <div className="rm-banner-left">
          {[
            { key: "Industry", val: data?.domain ?? "—",            orange: false },
            { key: "Level",    val: data?.level  ?? "—",            orange: true  },
            { key: "Duration", val: `${weeks.length} Weeks`,        orange: false },
            { key: "Progress", val: `${doneTasks} / ${totalTasks}`, orange: true  },
          ].map((item, i) => (
            <div key={item.key} style={{ display: "contents" }}>
              {i > 0 && <div className="rm-banner-divider" />}
              <div className="rm-banner-item">
                <div className="rm-banner-key">{item.key}</div>
                <div className={`rm-banner-val${item.orange ? " orange" : ""}`}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rm-banner-right">
          <div>
            <div className="rm-score-num">
              {score > 0 ? score : "—"}
              <span className="rm-score-denom">/100</span>
            </div>
            <div className="rm-score-sub">Capability Score</div>
            <div className="rm-score-bar-wrap" style={{ width: 100 }}>
              <div
                className="rm-score-bar"
                style={{
                  width: `${score}%`,
                  background: `linear-gradient(90deg, #7A2E01, ${scoreColor(score)})`,
                }}
              />
            </div>
          </div>
          <div className="rm-level-badge">{data?.level ?? "—"}</div>
        </div>
      </div>

      {/* QUICK NAV */}
      <div className="rm-quick-bar">
        {[
          { icon: TrendingUp, label: "Dashboard",       sub: "Live overview",   path: "/dashboard",       active: false },
          { icon: Map,        label: "Roadmap",          sub: "You are here",    path: "/roadmap",         active: true  },
          { icon: Lightbulb,  label: "Recommendations",  sub: "AI growth tips",  path: "/recommendations", active: false },
          { icon: Building2,  label: "Industries",       sub: "Matched for you", path: "/explore",         active: false },
        ].map(qItem => (
          <div
            key={qItem.label}
            className={`rm-quick-item${qItem.active ? " active" : ""}`}
            onClick={() => !qItem.active && nav(qItem.path)}
          >
            <div className="rm-quick-icon"><qItem.icon size={14} color="#E85D04" /></div>
            <div>
              <div className="rm-quick-label">{qItem.label}</div>
              <div className="rm-quick-sub">{qItem.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* OVERALL PROGRESS BAR */}
      <div className="rm-progress-wrap">
        <div className="rm-prog-top">
          <div className="rm-prog-label">Overall Roadmap Progress</div>
          <div className="rm-prog-count">{overallPct}% · {doneTasks}/{totalTasks} Tasks</div>
        </div>
        <div className="rm-prog-track">
          <div className="rm-prog-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="rm-week-dots">
          {weeks.map((w, i) => (
            <div
              key={i}
              className="rm-week-dot"
              onClick={() => setActiveWeek(i)}
              style={{
                background: isWeekDone(i) ? "#48C774" : i === activeWeek ? "#E85D04" : "#1A1A1A",
              }}
              title={`Week ${i + 1} — ${w.title}`}
            />
          ))}
        </div>
      </div>

      {/* MAIN PATH */}
      <div className="rm-path">

        {/* WEEK LIST */}
        <div className="rm-weeks-col">
          {weeks.map((w, i) => {
            const done   = isWeekDone(i);
            const active = i === activeWeek;
            const cls    = done ? "week-done" : active ? "week-active" : "week-locked";
            return (
              <button
                key={i}
                className={`rm-week-btn ${cls}${active ? " active" : ""}`}
                onClick={() => setActiveWeek(i)}
              >
                <div className={`rm-week-circle ${done ? "done" : active ? "active" : "locked"}`}>
                  {done
                    ? <CheckCircle size={14} color="#48C774" />
                    : active
                      ? <Flame size={12} color="#E85D04" />
                      : <span>{i + 1}</span>}
                </div>
                <div className="rm-week-meta">
                  <div className="rm-week-status">
                    {done ? "Cleared ✓" : active ? "Current" : `Week ${i + 1}`}
                  </div>
                  <div className="rm-week-name">{w.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CONTENT PANEL */}
        {current && (
          <div className="rm-content-col">
            <div className="rm-content-head">
              <div className="rm-content-week-tag">
                <Flame size={11} color="#E85D04" />
                Week {current.week ?? activeWeek + 1} of {weeks.length} · {isWeekDone(activeWeek) ? "Cleared ✓" : "In Progress"}
              </div>
              <div className="rm-content-title">{current.title}</div>
              <div className="rm-content-focus">{current.focus}</div>
            </div>

            <div className="rm-tasks-header">
              <div className="rm-tasks-label">Tasks to Complete</div>
              <div className="rm-tasks-count">{currentDone}/{currentTotal} done</div>
            </div>

            {current.tasks?.map((task: string, i: number) => {
              const done    = (progress[String(activeWeek)] ?? []).includes(i);
              const saveKey = `${activeWeek}-${i}`;
              return (
                <div
                  key={i}
                  className={`rm-task${done ? " task-done" : ""}${saving === saveKey ? " saving" : ""}`}
                  onClick={() => toggleTask(activeWeek, i)}
                >
                  <div className="rm-task-check">
                    {saving === saveKey
                      ? <Loader2 size={15} color="#E85D04" className="spin" />
                      : done
                        ? <CheckCircle size={15} color="#48C774" />
                        : <Circle size={15} color="#2A2A2A" />}
                  </div>
                  <span className="rm-task-num">0{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div className="rm-task-text">{task}</div>
                    <div className="rm-task-done-label">✓ Done & Saved</div>
                  </div>
                </div>
              );
            })}

            {/* WEEK GOAL */}
            {!weekComplete && current.goal && (
              <div className="rm-goal">
                <Flag size={15} color="#E85D04" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="rm-goal-label">Week Goal</div>
                  <div className="rm-goal-text">{current.goal}</div>
                </div>
              </div>
            )}

            {/* WEEK COMPLETE — UNLOCK NEXT */}
            {weekComplete && !allDone && (
              <div className="rm-unlock">
                <div className="rm-unlock-top">
                  <div className="rm-unlock-icon"><CheckCircle size={22} color="#48C774" /></div>
                  <div>
                    <div className="rm-unlock-title">Week {activeWeek + 1} Cleared!</div>
                    <div className="rm-unlock-sub">{current.goal}</div>
                  </div>
                </div>
                {nextWeek && (
                  <div className="rm-unlock-next" onClick={() => setActiveWeek(activeWeek + 1)}>
                    <div className="rm-quick-icon"><Target size={12} color="#E85D04" /></div>
                    <div style={{ flex: 1 }}>
                      <div className="rm-unlock-next-label">
                        Unlock Week {activeWeek + 2} → {nextWeek.title}
                      </div>
                      <div className="rm-unlock-next-sub">{nextWeek.focus}</div>
                    </div>
                    <ChevronRight size={14} color="#E85D04" />
                  </div>
                )}
              </div>
            )}

            {/* ALL DONE */}
            {allDone && (
              <div className="rm-all-done">
                <div className="rm-ad-trophy"><Trophy size={30} color="#48C774" /></div>
                <div className="rm-ad-title">Roadmap Complete!</div>
                <div className="rm-ad-sub">
                  All {totalTasks} tasks cleared across {weeks.length} weeks. Your next growth phase is ready.
                </div>
                <div className="rm-ad-ctas">
                  <button className="rm-ad-primary" onClick={() => nav("/recommendations")}>
                    <Lightbulb size={14} /> See Recommendations <ChevronRight size={14} />
                  </button>
                  <button className="rm-ad-secondary" onClick={() => nav("/explore")}>
                    <Building2 size={14} /> Industries
                  </button>
                  <button className="rm-ad-secondary" onClick={() => nav("/dashboard")}>
                    <TrendingUp size={14} /> Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SAVE TOAST */}
      <div className={`rm-save-toast${saveFlash ? " visible" : ""}${saveFlash === "saved" ? " saved" : ""}`}>
        {saveFlash === "saving"
          ? <><Loader2 size={11} className="spin" /> Saving…</>
          : <><CheckCircle size={11} /> Saved to server</>}
      </div>

    </div></>
  );
}