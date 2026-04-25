import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HistorySelector from "../components/HistorySelector";
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

  .rm { min-height: 100vh; padding: 40px 44px 80px; font-family: 'DM Sans', sans-serif; color: #1E293B; background: #F8FAFC; position: relative; }
  .rm::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px); background-size: 48px 48px; }
  .rm::after { content: ''; position: fixed; top: -20%; left: 50%; transform: translateX(-50%); width: 800px; height: 500px; border-radius: 50%; background: radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%); pointer-events: none; z-index: 0; }
  .rm > * { position: relative; z-index: 1; }

  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes fade-up  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bar-in   { from{width:0} }
  @keyframes strike   { from{width:0} to{width:100%} }
  @keyframes pop      { 0%{transform:scale(0.6);opacity:0} 65%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
  @keyframes glow-g   { 0%,100%{box-shadow:0 0 10px rgba(16,185,129,0.25)} 50%{box-shadow:0 0 24px rgba(16,185,129,0.55)} }
  @keyframes unlock-in{ from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ls       { 0%{transform:translateX(-100%)} 100%{transform:translateX(280%)} }
  .spin { animation: spin 1s linear infinite; }

  /* HEADER */
  .rm-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E2E8F0; position: relative; animation: fade-up 0.4s ease both; }
  .rm-header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent); }
  .rm-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #2563EB; margin-bottom: 12px; }
  .rm-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563EB; box-shadow: 0 0 10px #2563EB; animation: blink 2s infinite; }
  .rm-title { font-family: 'Bebas Neue', sans-serif; font-size: 54px; line-height: 0.9; letter-spacing: 0.02em; color: #0F172A; margin-bottom: 8px; }
  .rm-title em { color: #2563EB; font-style: normal; }
  .rm-subtitle { font-size: 13px; color: #64748B; line-height: 1.6; max-width: 480px; }
  .rm-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .rm-logo-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; box-shadow: 0 0 18px rgba(37,99,235,0.12); }
  .rm-logo-text { font-family: 'Bebas Neue'; font-size: 22px; letter-spacing: 0.1em; color: #0F172A; }
  .rm-logo-text em { color: #2563EB; font-style: normal; }

  /* BANNER */
  .rm-banner { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 28px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 20px; position: relative; overflow: hidden; animation: fade-up 0.4s 0.05s ease both; }
  .rm-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #93C5FD, #2563EB 45%, #1E3A8A 75%, transparent); }
  .rm-banner-left { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
  .rm-banner-item { display: flex; flex-direction: column; gap: 3px; }
  .rm-banner-key { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #64748B; }
  .rm-banner-val { font-family: 'Bebas Neue'; font-size: 20px; color: #0F172A; letter-spacing: 0.04em; line-height: 1; }
  .rm-banner-val.orange { color: #2563EB; }
  .rm-banner-divider { width: 1px; height: 32px; background: #E2E8F0; flex-shrink: 0; }
  .rm-banner-right { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
  .rm-score-num { font-family: 'Bebas Neue'; font-size: 52px; color: #2563EB; line-height: 1; letter-spacing: 0.04em; }
  .rm-score-denom { font-family: 'DM Mono'; font-size: 14px; color: #94A3B8; }
  .rm-score-sub { font-size: 9px; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 3px; }
  .rm-score-bar-wrap { height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; margin-top: 5px; }
  .rm-score-bar { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #60A5FA, #2563EB, #1D4ED8); animation: bar-in 1s 0.3s ease both; }
  .rm-level-badge { padding: 9px 18px; border-radius: 4px; font-family: 'DM Mono'; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; white-space: nowrap; }

  /* QUICK NAV */
  .rm-quick-bar { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; animation: fade-up 0.4s 0.08s ease both; }
  .rm-quick-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
  .rm-quick-item::after { content: ''; position: absolute; bottom: 0; left: 8%; right: 8%; height: 2px; background: #2563EB; transform: scaleX(0); transition: transform 0.22s; }
  .rm-quick-item:hover::after, .rm-quick-item.active::after { transform: scaleX(1); }
  .rm-quick-item:hover { border-color: #BFDBFE; background: #F8FAFC; box-shadow: 0 4px 12px rgba(37,99,235,0.05); }
  .rm-quick-item.active { border-color: #2563EB; background: #EFF6FF; cursor: default; }
  .rm-quick-icon { width: 30px; height: 30px; border-radius: 7px; background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rm-quick-label { font-size: 12px; font-weight: 600; color: #0F172A; }
  .rm-quick-sub   { font-size: 9px; color: #64748B; font-family: 'DM Mono'; margin-top: 1px; }

  /* PROGRESS */
  .rm-progress-wrap { margin-bottom: 20px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 24px; animation: fade-up 0.4s 0.1s ease both; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .rm-prog-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .rm-prog-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #64748B; }
  .rm-prog-count { font-family: 'Bebas Neue'; font-size: 20px; color: #2563EB; letter-spacing: 0.04em; }
  .rm-prog-track { height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-bottom: 12px; }
  .rm-prog-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #60A5FA, #2563EB, #10B981); transition: width 0.6s cubic-bezier(0.4,0,0.2,1); animation: bar-in 0.8s 0.2s ease both; }
  .rm-week-dots { display: flex; gap: 8px; }
  .rm-week-dot { flex: 1; height: 6px; border-radius: 3px; transition: background 0.3s; cursor: pointer; }

  /* PATH */
  .rm-path { display: grid; grid-template-columns: 192px 1fr; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; animation: fade-up 0.4s 0.12s ease both; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

  /* WEEK COL */
  .rm-weeks-col { border-right: 1px solid #E2E8F0; position: relative; background: #F8FAFC; }
  .rm-weeks-col::before { content: ''; position: absolute; right: -1px; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, rgba(37,99,235,0.15), transparent); }
  .rm-week-btn { display: flex; align-items: center; gap: 12px; padding: 16px 20px; cursor: pointer; width: 100%; background: transparent; border: none; border-bottom: 1px solid #E2E8F0; text-align: left; font-family: 'DM Sans'; position: relative; transition: background 0.18s; }
  .rm-week-btn:last-child { border-bottom: none; }
  .rm-week-btn:hover { background: rgba(37,99,235,0.03); }
  .rm-week-btn.active { background: #FFFFFF; border-right: 1px solid #FFFFFF; margin-right: -1px; }
  .rm-week-btn.active::after { content: ''; position: absolute; left: 0; top: 16%; bottom: 16%; width: 3px; border-radius: 0 2px 2px 0; background: #2563EB; box-shadow: 0 0 10px rgba(37,99,235,0.2); }
  .rm-week-circle { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono'; font-size: 12px; transition: all 0.2s; }
  .rm-week-circle.done   { background: #D1FAE5; border: 1px solid #34D399; color: #10B981; animation: glow-g 2.5s infinite; }
  .rm-week-circle.active { background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; box-shadow: 0 0 12px rgba(37,99,235,0.1); }
  .rm-week-circle.locked { background: #F1F5F9; border: 1px solid #E2E8F0; color: #94A3B8; }
  .rm-week-meta { overflow: hidden; }
  .rm-week-status { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .week-done   .rm-week-status { color: #10B981; }
  .week-active .rm-week-status { color: #2563EB; }
  .week-locked .rm-week-status { color: #64748B; }
  .rm-week-name { font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .week-done   .rm-week-name { color: #64748B; }
  .week-active .rm-week-name { color: #0F172A; }
  .week-locked .rm-week-name { color: #94A3B8; }

  /* CONTENT */
  .rm-content-col { padding: 32px 36px; background: #FFFFFF; }
  .rm-content-head { margin-bottom: 24px; }
  .rm-content-week-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #2563EB; margin-bottom: 10px; }
  .rm-content-title { font-family: 'Bebas Neue'; font-size: 36px; color: #0F172A; letter-spacing: 0.02em; line-height: 1; margin-bottom: 8px; }
  .rm-content-focus { font-size: 14px; color: #475569; line-height: 1.6; }

  /* TASKS */
  .rm-tasks-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .rm-tasks-label { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #0F172A; }
  .rm-tasks-count { font-family: 'DM Mono'; font-size: 11px; color: #2563EB; }

  .rm-task { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFFFFF; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
  .rm-task::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #2563EB; transform: scaleY(0); transform-origin: top; transition: transform 0.22s; }
  .rm-task:hover { border-color: #BFDBFE; background: #F8FAFC; box-shadow: 0 4px 12px rgba(37,99,235,0.05); }
  .rm-task:hover::before { transform: scaleY(1); }
  .rm-task.task-done { background: #F0FDF4; border-color: #A7F3D0; }
  .rm-task.task-done::before { background: #10B981; transform: scaleY(1); }
  .rm-task.saving { opacity: 0.6; pointer-events: none; }
  .rm-task-check { flex-shrink: 0; margin-top: 2px; }
  .rm-task.task-done .rm-task-check { animation: pop 0.3s ease both; }
  .rm-task-num { font-family: 'DM Mono'; font-size: 11px; color: #64748B; flex-shrink: 0; margin-top: 3px; font-weight: 600; }
  .rm-task.task-done .rm-task-num { color: #10B981; }
  .rm-task-text { font-size: 14px; line-height: 1.6; font-weight: 500; position: relative; display: inline; }
  .rm-task:not(.task-done) .rm-task-text { color: #334155; }
  .rm-task.task-done .rm-task-text { color: #64748B; }
  .rm-task.task-done .rm-task-text::after { content: ''; position: absolute; left: 0; top: 50%; height: 2px; background: rgba(16,185,129,0.45); animation: strike 0.35s ease both; width: 100%; }
  .rm-task-done-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #10B981; margin-top: 6px; opacity: 0; transition: opacity 0.2s; }
  .rm-task.task-done .rm-task-done-label { opacity: 1; }

  /* GOAL */
  .rm-goal { margin-top: 24px; padding: 20px 24px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; display: flex; align-items: flex-start; gap: 12px; position: relative; overflow: hidden; }
  .rm-goal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(37,99,235,0.25), transparent); }
  .rm-goal-label { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #2563EB; margin-bottom: 6px; }
  .rm-goal-text { font-size: 14px; color: #1E293B; line-height: 1.6; font-weight: 500; }

  /* UNLOCK */
  .rm-unlock { margin-top: 24px; padding: 24px 28px; background: #F0FDF4; border: 1px solid #A7F3D0; border-radius: 8px; animation: unlock-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(16,185,129,0.05); }
  .rm-unlock::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.35), transparent); }
  .rm-unlock-top { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .rm-unlock-icon { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #D1FAE5; border: 1px solid #6EE7B7; animation: glow-g 2s infinite; }
  .rm-unlock-title { font-family: 'Bebas Neue'; font-size: 26px; color: #059669; letter-spacing: 0.04em; line-height: 1; margin-bottom: 4px; }
  .rm-unlock-sub { font-size: 13px; color: #475569; }
  .rm-unlock-next { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
  .rm-unlock-next:hover { border-color: #BFDBFE; background: #F8FAFC; box-shadow: 0 4px 12px rgba(37,99,235,0.05); }
  .rm-unlock-next-label { font-size: 13px; font-weight: 600; color: #2563EB; flex: 1; }
  .rm-unlock-next-sub   { font-size: 11px; color: #64748B; margin-top: 2px; }

  /* ALL DONE */
  .rm-all-done { margin-top: 24px; padding: 48px 40px; text-align: center; background: #F0FDF4; border: 1px solid #A7F3D0; border-radius: 12px; animation: unlock-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both; box-shadow: 0 4px 12px rgba(16,185,129,0.05); }
  .rm-ad-trophy { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; background: #D1FAE5; border: 1px solid #6EE7B7; box-shadow: 0 0 36px rgba(16,185,129,0.2); animation: pop 0.5s ease both; }
  .rm-ad-title { font-family: 'Bebas Neue'; font-size: 52px; color: #059669; letter-spacing: 0.04em; margin-bottom: 12px; line-height: 1; }
  .rm-ad-sub { font-size: 15px; color: #475569; line-height: 1.65; margin-bottom: 32px; max-width: 400px; margin-left: auto; margin-right: auto; }
  .rm-ad-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .rm-ad-primary { display: flex; align-items: center; gap: 8px; padding: 14px 32px; background: #2563EB; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'DM Sans'; cursor: pointer; transition: all 0.22s; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
  .rm-ad-primary:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37,99,235,0.35); }
  .rm-ad-secondary { display: flex; align-items: center; gap: 8px; padding: 14px 28px; background: #FFFFFF; color: #64748B; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: 'DM Sans'; cursor: pointer; transition: all 0.2s; }
  .rm-ad-secondary:hover { border-color: #94A3B8; color: #0F172A; background: #F8FAFC; }

  /* SAVE TOAST */
  .rm-save-toast { position: fixed; bottom: 32px; right: 32px; z-index: 100; display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 12px; color: #64748B; font-family: 'DM Mono'; transition: all 0.3s; opacity: 0; transform: translateY(12px); pointer-events: none; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
  .rm-save-toast.visible { opacity: 1; transform: translateY(0); }
  .rm-save-toast.saved   { border-color: #34D399; color: #10B981; background: #F0FDF4; }

  /* LOADING / ERROR */
  .rm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; gap: 20px; }
  .rm-loading-ring { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #EFF6FF; border: 1px solid #BFDBFE; box-shadow: 0 4px 20px rgba(37,99,235,0.1); }
  .rm-loading-bar { width: 180px; height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; }
  .rm-loading-fill { height: 100%; width: 40%; background: linear-gradient(90deg, #60A5FA, #2563EB); animation: ls 1.4s ease-in-out infinite; }
  .rm-loading-text { font-family: 'DM Mono'; font-size: 12px; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; }
  
  .rm-error { text-align: center; padding: 100px 32px; }
  .rm-error-title { font-family: 'Bebas Neue'; font-size: 48px; color: #0F172A; margin-bottom: 12px; letter-spacing: 0.02em; }
  .rm-error-sub { font-size: 15px; color: #64748B; line-height: 1.65; }

  @media (max-width: 900px) {
    .rm { padding: 24px 16px 56px; }
    .rm-title { font-size: 44px; }
    .rm-quick-bar { grid-template-columns: repeat(2,1fr); }
    .rm-banner { grid-template-columns: 1fr; }
    .rm-path { grid-template-columns: 1fr; }
    .rm-weeks-col { border-right: none; border-bottom: 1px solid #E2E8F0; display: flex; overflow-x: auto; }
    .rm-weeks-col::before { display: none; }
    .rm-week-btn { border-bottom: none; border-right: 1px solid #E2E8F0; flex-shrink: 0; width: 140px; }
    .rm-week-btn.active { border-right: 1px solid transparent; border-bottom: 1px solid #FFFFFF; margin-bottom: -1px; }
    .rm-week-btn.active::after { right: auto; bottom: 0; top: auto; left: 16%; right: 16%; width: auto; height: 3px; border-radius: 2px 2px 0 0; }
    .rm-content-col { padding: 24px 20px; }
    .rm-ad-ctas { flex-direction: column; }
  }
`;

function scoreColor(s: number) {
  if (s >= 70) return "#2563EB";
  if (s >= 40) return "#60A5FA";
  return "#94A3B8";
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
    setLoading(true);
    setProgress({});
    setData(null);
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
  }, [q]);

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
  }, [progress, q]);

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
      <div className="rm-loading-ring"><Loader2 size={28} color="#2563EB" className="spin" /></div>
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
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <HistorySelector />
          <div className="rm-logo">
            <div className="rm-logo-icon"><Zap size={15} color="#2563EB" /></div>
            <div className="rm-logo-text">Field<em>Scope</em></div>
          </div>
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