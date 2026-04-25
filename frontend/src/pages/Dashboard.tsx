import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TrendingUp, Target, ArrowRight, Zap,
  CheckCircle, Map, Layers, ChevronRight,
  Sparkles, Building2, Activity, X, Eye, Shield, Scale, DollarSign, TrendingDown
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const API = "http://localhost:8000";

interface Assessment {
  domain: string;
  business_level: string;
  capability_score: number;
  confidence: number;
  team_size: number;
  capital: number;
  revenue: number;
  clients: number;
}

interface DashboardData {
  name: string;
  assessment: Assessment | null;
}

interface HistoryEntry {
  id: number;
  domain: string;
  business_level: string;
  capability_score: number;
  confidence: number;
  created_at: string;
  has_risk_profile?: boolean;
  has_competitor_profile?: boolean;
}

interface Rec {
  title: string;
  action: string;
  priority: "high" | "medium" | "low";
  impact: string;
}

interface RoadmapWeek {
  week: number;
  title: string;
  focus: string;
  tasks: string[];
  goal: string;
}

interface Industry {
  slug: string;
  name: string;
  emoji: string;
  growth: string;
  color: string;
  tags: string[];
}

// ─── FONT: Manrope (clean, geometric, dashboard-native) + IBM Plex Mono (data)
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  :root {
    --blue:        #1256F3;
    --blue-dark:   #0B3EC2;
    --blue-mid:    #2E6AF6;
    --blue-light:  #5A8EFF;
    --blue-xlight: #93B4FF;
    --cyan:        #00B8F0;
    --cyan-dim:    rgba(0,184,240,0.12);
    --indigo:      #3845F5;

    --green:  #0BAE6E;
    --amber:  #E8960A;
    --red:    #E03E3E;

    --bg:       #ECF0FE;
    --bg2:      #E2E8FC;
    --surface:  #FFFFFF;
    --surface2: #F4F7FF;
    --surface3: #EBF0FF;
    --border:   #C8D4F8;
    --border2:  #B4C2F2;
    --divider:  #DCE4FB;

    --text:    #05103A;
    --text2:   #162680;
    --muted:   #4058A0;
    --muted2:  #6E82C0;
    --muted3:  #A0B0D8;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .db {
    padding: 36px 40px 80px;
    font-family: 'Manrope', sans-serif;
    color: var(--text);
    background: var(--bg);
    min-height: 100%;
    position: relative;
  }

  /* Subtle dot grid */
  .db::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(circle, rgba(18,86,243,0.045) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Ambient blue glow top-right */
  .db::after {
    content: '';
    position: fixed; z-index: 0;
    top: -25%; right: -15%;
    width: 60vw; height: 60vw; border-radius: 50%;
    background: radial-gradient(circle, rgba(18,86,243,0.055) 0%, transparent 65%);
    pointer-events: none;
  }

  .db > * { position: relative; z-index: 1; }

  /* ─── HEADER ─── */
  .db-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px; padding-bottom: 24px;
    border-bottom: 1px solid var(--divider);
    gap: 24px;
  }

  .db-head-left { min-width: 0; flex: 1; }

  .db-date {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--muted2);
    margin-bottom: 12px;
  }

  .db-date-pip {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
    animation: pip-pulse 2.4s ease-in-out infinite;
  }

  @keyframes pip-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.65)} }

  .db-greeting {
    font-family: 'Manrope', sans-serif;
    font-size: 38px; line-height: 1.1; letter-spacing: -0.03em;
    font-weight: 800; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%;
  }

  .db-greeting em {
    font-style: normal;
    background: linear-gradient(110deg, var(--blue) 0%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .db-tagline {
    font-size: 13.5px; color: var(--muted2); margin-top: 8px;
    font-weight: 500; letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }

  .db-tagline-sep {
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--border2); display: inline-block;
  }

  .db-assess-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px;
    background: var(--blue); color: #fff;
    font-family: 'Manrope', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.01em;
    border: none; border-radius: 10px; cursor: pointer;
    transition: all 0.22s; flex-shrink: 0; align-self: flex-start;
    box-shadow: 0 4px 18px rgba(18,86,243,0.32);
    margin-top: 4px;
  }

  .db-assess-btn:hover {
    background: var(--blue-dark);
    box-shadow: 0 8px 28px rgba(18,86,243,0.48);
    transform: translateY(-1px);
  }

  /* ─── RIBBON ─── */
  .db-ribbon {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .db-rib-cell {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px 16px;
    position: relative; overflow: hidden;
    transition: all 0.22s; cursor: default;
    min-width: 0;
  }

  .db-rib-cell::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--blue), var(--cyan));
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s ease;
    border-radius: 0 0 12px 12px;
  }

  .db-rib-cell:hover {
    border-color: rgba(18,86,243,0.28);
    box-shadow: 0 4px 20px rgba(18,86,243,0.09);
    transform: translateY(-2px);
  }

  .db-rib-cell:hover::after { transform: scaleX(1); }

  .db-rib-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.13em; text-transform: uppercase;
    color: var(--muted3); margin-bottom: 8px;
    white-space: nowrap;
  }

  .db-rib-val {
    font-family: 'Manrope', sans-serif;
    font-size: 21px; font-weight: 800; letter-spacing: -0.02em;
    color: var(--blue); line-height: 1.1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .db-rib-val.neutral { color: var(--text); }

  /* ─── JOURNEY ─── */
  .db-journey {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 2px 16px rgba(18,86,243,0.06);
    position: relative;
  }

  /* Gradient top strip */
  .db-journey::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 2;
    background: linear-gradient(90deg, var(--blue) 0%, var(--cyan) 50%, var(--indigo) 100%);
  }

  .db-journey-inner {
    display: flex; align-items: stretch;
  }

  .db-journey-step {
    flex: 1; padding: 20px 22px 18px;
    border-right: 1px solid var(--divider);
    cursor: default; transition: background 0.18s;
    position: relative;
  }

  .db-journey-step:last-child { border-right: none; }

  .db-journey-step.step-done { cursor: pointer; }
  .db-journey-step.step-done:hover { background: var(--surface2); }
  .db-journey-step.step-active { background: rgba(18,86,243,0.025); }
  .db-journey-step.step-pending { opacity: 0.55; }

  /* Chevron connector */
  .db-journey-step::after {
    content: '›';
    position: absolute; right: -9px; top: 50%;
    transform: translateY(-50%);
    font-size: 18px; line-height: 1; z-index: 3;
    color: var(--border2);
  }

  .db-journey-step:last-child::after { display: none; }
  .db-journey-step.step-done::after { color: var(--blue-light); }
  .db-journey-step.step-active::after { color: var(--blue); }

  .db-step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px; font-weight: 600;
    border: 1.5px solid var(--border2); color: var(--muted3);
    margin-bottom: 8px; transition: all 0.2s;
  }

  .step-done .db-step-num {
    background: rgba(18,86,243,0.1);
    border-color: rgba(18,86,243,0.4); color: var(--blue);
  }

  .step-active .db-step-num {
    background: var(--blue); border-color: var(--blue);
    color: #fff; box-shadow: 0 0 10px rgba(18,86,243,0.4);
  }

  .db-step-title {
    font-size: 13px; font-weight: 700; letter-spacing: -0.01em;
    color: var(--muted); margin-bottom: 3px;
  }

  .step-done .db-step-title { color: var(--text); }
  .step-active .db-step-title { color: var(--blue-dark); }

  .db-step-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 500; color: var(--muted3);
  }

  .step-done .db-step-val { color: var(--blue-mid); }

  .db-step-detail { font-size: 11px; color: var(--muted3); margin-top: 3px; line-height: 1.4; }

  .db-step-status {
    margin-top: 8px; font-size: 10px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    display: flex; align-items: center; gap: 5px;
  }

  .status-done  { color: var(--green); }
  .status-active { color: var(--blue); }
  .status-pending { color: var(--muted3); }

  /* ─── MAIN GRID ─── */
  .db-main {
    display: grid;
    grid-template-columns: 1fr 1fr 290px;
    gap: 16px; margin-bottom: 16px;
  }

  /* ─── CARD ─── */
  .db-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 24px;
    position: relative; overflow: hidden;
    transition: border-color 0.22s, box-shadow 0.22s;
    box-shadow: 0 2px 12px rgba(18,86,243,0.05);
  }

  .db-card:hover {
    border-color: rgba(18,86,243,0.22);
    box-shadow: 0 6px 28px rgba(18,86,243,0.09);
  }

  .db-card-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--blue), var(--cyan));
    border-radius: 14px 14px 0 0;
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.38s ease;
  }

  .db-card:hover .db-card-strip { transform: scaleX(1); }

  .db-card-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 20px; gap: 12px;
  }

  .db-card-title {
    font-size: 15px; font-weight: 700; letter-spacing: -0.02em;
    color: var(--text); line-height: 1.2;
  }

  .db-card-sub { font-size: 12px; color: var(--muted2); margin-top: 3px; font-weight: 500; }

  /* ─── PILL ─── */
  .db-pill {
    font-size: 10px; font-weight: 700;
    padding: 4px 10px; border-radius: 100px;
    background: rgba(18,86,243,0.08); color: var(--blue);
    border: 1px solid rgba(18,86,243,0.18);
    letter-spacing: 0.03em; white-space: nowrap; flex-shrink: 0;
  }

  .db-pill.green { background: rgba(11,174,110,0.08); color: var(--green); border-color: rgba(11,174,110,0.2); }
  .db-pill.amber { background: rgba(232,150,10,0.08); color: var(--amber); border-color: rgba(232,150,10,0.2); }

  /* ─── SCORE ARC ─── */
  .db-score-arc-wrap {
    display: flex; align-items: center; gap: 24px; margin-bottom: 22px;
  }

  .db-arc-svg-wrap { position: relative; width: 104px; height: 104px; flex-shrink: 0; }

  .db-arc-label {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }

  .db-arc-num {
    font-family: 'Manrope', sans-serif;
    font-size: 26px; font-weight: 800; letter-spacing: -0.03em;
    color: var(--blue); line-height: 1;
  }

  .db-arc-denom { font-size: 11px; color: var(--muted3); font-weight: 600; margin-top: 1px; }

  .db-score-meta { flex: 1; min-width: 0; }

  .db-score-level {
    font-size: 22px; font-weight: 800; letter-spacing: -0.025em;
    color: var(--text); margin-bottom: 4px; line-height: 1.1;
  }

  .db-score-domain { font-size: 13px; color: var(--blue); font-weight: 700; margin-bottom: 10px; }
  .db-score-conf { font-size: 12px; color: var(--muted2); font-weight: 500; }
  .db-score-conf strong { color: var(--text2); font-weight: 700; }

  .db-meta-chips { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }

  .db-meta-chip {
    font-size: 11px; font-weight: 600; color: var(--muted);
    background: var(--surface3); border: 1px solid var(--border);
    border-radius: 8px; padding: 5px 11px;
  }

  .db-meta-chip strong { color: var(--text2); font-weight: 700; }

  /* Breakdown bars */
  .db-breakdown { display: flex; flex-direction: column; gap: 10px; }

  .db-bd-row { display: flex; align-items: center; gap: 12px; }

  .db-bd-label {
    font-size: 11px; font-weight: 600; color: var(--muted);
    width: 56px; flex-shrink: 0; letter-spacing: 0.01em;
  }

  .db-bd-track {
    flex: 1; height: 6px;
    background: var(--surface3); border: 1px solid var(--divider);
    border-radius: 4px; overflow: hidden;
  }

  .db-bd-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, var(--blue-light), var(--blue));
    transition: width 1.4s cubic-bezier(0.4,0,0.2,1);
  }

  .db-bd-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 500; color: var(--muted2);
    width: 28px; text-align: right;
  }

  /* ─── ROADMAP ─── */
  .db-rm-week {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 13px 14px; border-radius: 10px; margin-bottom: 8px;
    background: var(--surface2); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }

  .db-rm-week::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(to bottom, var(--blue), var(--cyan));
    transform: scaleY(0); transform-origin: top; transition: transform 0.25s;
    border-radius: 3px 0 0 3px;
  }

  .db-rm-week:last-of-type { margin-bottom: 0; }

  .db-rm-week:hover {
    border-color: rgba(18,86,243,0.28);
    background: var(--surface);
    box-shadow: 0 2px 14px rgba(18,86,243,0.07);
  }

  .db-rm-week:hover::before { transform: scaleY(1); }

  .db-rm-week.rm-active {
    background: rgba(18,86,243,0.04);
    border-color: rgba(18,86,243,0.22);
  }

  .db-rm-week.rm-active::before { transform: scaleY(1); }

  .db-rm-num {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600;
    border: 1.5px solid; transition: all 0.2s;
  }

  .db-rm-body { flex: 1; min-width: 0; }

  .db-rm-title {
    font-size: 13px; font-weight: 700; letter-spacing: -0.01em;
    color: var(--text); line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .db-rm-focus { font-size: 11px; color: var(--muted2); margin-top: 2px; font-weight: 500; }

  .db-rm-tasks {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; font-weight: 500;
    color: var(--blue); margin-top: 5px;
  }

  .db-rm-view-btn {
    width: 100%; margin-top: 12px; padding: 10px;
    background: transparent; border: 1.5px solid var(--border2);
    border-radius: 10px; color: var(--muted);
    font-size: 12px; font-weight: 700;
    font-family: 'Manrope', sans-serif; cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }

  .db-rm-view-btn:hover {
    border-color: var(--blue); color: var(--blue);
    background: rgba(18,86,243,0.04);
  }

  /* ─── AI MODULES ─── */
  .db-ai-module {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 13px; border-radius: 10px; margin-bottom: 7px;
    background: var(--surface2); border: 1px solid var(--border);
    transition: all 0.2s; cursor: default;
  }

  .db-ai-module:last-child { margin-bottom: 0; }

  .db-ai-module.ai-ready { cursor: pointer; }

  .db-ai-module.ai-ready:hover {
    border-color: rgba(18,86,243,0.28);
    background: var(--surface);
    box-shadow: 0 2px 12px rgba(18,86,243,0.07);
  }

  .db-ai-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ai-cached  { background: var(--green); box-shadow: 0 0 7px rgba(11,174,110,0.55); }
  .ai-pending { background: var(--border2); }
  .ai-loading { background: var(--blue); animation: ai-blink 1.2s infinite; }

  @keyframes ai-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .db-ai-name { font-size: 12px; font-weight: 700; color: var(--text); flex: 1; letter-spacing: -0.01em; }
  .db-ai-module.ai-pending .db-ai-name { color: var(--muted2); }

  .db-ai-status { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 500; }
  .ai-status-cached  { color: var(--green); }
  .ai-status-pending { color: var(--muted3); }
  .ai-status-loading { color: var(--blue); }

  /* ─── DATA SOURCE BADGE ─── */
  .db-data-src {
    margin-top: 13px; padding: 11px 13px;
    background: rgba(18,86,243,0.04);
    border: 1px solid rgba(18,86,243,0.11);
    border-radius: 10px;
  }

  .db-data-src-label {
    font-size: 9px; font-weight: 800; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--muted3); margin-bottom: 4px;
  }

  .db-data-src-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 500; color: var(--muted);
  }

  .db-data-src-flow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 600; color: var(--blue); margin-top: 3px;
  }

  /* ─── QUICK NAV ─── */
  .db-qnav {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; margin-bottom: 7px;
    background: var(--surface2); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.2s;
  }

  /* ─── MODAL ─── */
  .db-modal-overlay {
    position: fixed; inset: 0; background: rgba(5,16,58,0.4);
    backdrop-filter: blur(8px); z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: modal-fade 0.2s ease-out;
  }

  .db-modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh;
    overflow-y: auto; box-shadow: 0 12px 48px rgba(5,16,58,0.15);
    position: relative; animation: modal-slide 0.3s cubic-bezier(0.16,1,0.3,1);
  }

  .db-modal-head {
    padding: 20px 24px; border-bottom: 1px solid var(--divider);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: rgba(255,255,255,0.9);
    backdrop-filter: blur(12px); z-index: 10;
  }

  .db-modal-title { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); display: flex; align-items: center; gap: 10px; }
  .db-modal-close { background: transparent; border: none; color: var(--muted); cursor: pointer; transition: color 0.2s; display: flex; }
  .db-modal-close:hover { color: var(--red); }
  .db-modal-body { padding: 24px; }

  @keyframes modal-fade { from{opacity:0} to{opacity:1} }
  @keyframes modal-slide { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }

  .db-view-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; background: rgba(18,86,243,0.06);
    color: var(--blue); font-size: 11px; font-weight: 700;
    border: 1px solid rgba(18,86,243,0.15); border-radius: 6px;
    cursor: pointer; transition: all 0.2s;
  }
  .db-view-btn:hover { background: var(--blue); color: #fff; }

  .db-qnav:last-child { margin-bottom: 0; }

  .db-qnav:hover {
    border-color: rgba(18,86,243,0.28);
    background: var(--surface);
    transform: translateX(2px);
    box-shadow: 0 2px 12px rgba(18,86,243,0.07);
  }

  .db-qnav-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: rgba(18,86,243,0.08); border: 1px solid rgba(18,86,243,0.14);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }

  .db-qnav:hover .db-qnav-icon {
    background: rgba(18,86,243,0.14); border-color: rgba(18,86,243,0.35);
  }

  .db-qnav-label { font-size: 13px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
  .db-qnav-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 500; color: var(--muted2); margin-top: 1px; }

  /* ─── BOTTOM GRID ─── */
  .db-bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* ─── REVENUE STAT CHIPS ─── */
  .db-rev-chips { display: flex; gap: 10px; margin-top: 14px; }

  .db-rev-chip {
    flex: 1; background: var(--surface3); border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 12px;
  }

  .db-rev-chip-label {
    font-size: 9px; font-weight: 800; letter-spacing: 0.13em;
    text-transform: uppercase; color: var(--muted3); margin-bottom: 4px;
  }

  .db-rev-chip-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px; font-weight: 600; color: var(--blue); letter-spacing: -0.01em;
  }

  /* ─── RECOMMENDATIONS ─── */
  .db-rec {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 13px 0; border-bottom: 1px solid var(--divider);
  }

  .db-rec:last-child { border-bottom: none; padding-bottom: 0; }
  .db-rec:first-child { padding-top: 0; }

  .db-rec-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

  .db-rec-title {
    font-size: 13px; font-weight: 700; letter-spacing: -0.01em;
    color: var(--text); line-height: 1.4; margin-bottom: 3px;
  }

  .db-rec-action { font-size: 12px; color: var(--muted); line-height: 1.6; font-weight: 500; }

  .db-rec-impact {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; font-weight: 500; color: var(--muted2); margin-top: 4px;
  }

  .db-rec-priority {
    font-size: 9px; font-weight: 800; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 3px 8px;
    border-radius: 100px; flex-shrink: 0; margin-top: 2px; border: 1px solid;
  }

  /* ─── INDUSTRIES ─── */
  .db-ind {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 13px; border-radius: 10px; margin-bottom: 8px;
    background: var(--surface2); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.2s;
  }

  .db-ind:last-child { margin-bottom: 0; }

  .db-ind:hover {
    border-color: rgba(18,86,243,0.28);
    background: var(--surface);
    transform: translateX(3px);
    box-shadow: 0 2px 12px rgba(18,86,243,0.07);
  }

  .db-ind-emoji { font-size: 22px; flex-shrink: 0; }
  .db-ind-name { font-size: 13px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
  .db-ind-growth { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 500; color: var(--green); margin-top: 2px; }

  .db-ind-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 4px; }

  .db-ind-tag {
    font-size: 9px; font-weight: 700; letter-spacing: 0.05em;
    color: var(--muted2); background: var(--surface3);
    padding: 2px 8px; border-radius: 100px; border: 1px solid var(--border);
  }

  .db-ind-arrow { color: var(--border2); margin-left: auto; flex-shrink: 0; transition: color 0.18s; }
  .db-ind:hover .db-ind-arrow { color: var(--blue); }

  .db-explore-more {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 11px; padding: 10px 13px; border-radius: 10px;
    background: rgba(18,86,243,0.05); border: 1px solid rgba(18,86,243,0.13);
    cursor: pointer; transition: all 0.2s;
  }

  .db-explore-more:hover { background: rgba(18,86,243,0.09); border-color: rgba(18,86,243,0.26); }
  .db-explore-more span { font-size: 12px; font-weight: 700; color: var(--blue); }

  /* ─── SPINNER ─── */
  .db-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 2.5px solid var(--border);
    border-top-color: var(--blue);
    animation: spin 0.85s linear infinite;
  }

  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* ─── LOADING ─── */
  .db-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 80vh; gap: 16px;
  }

  .db-loading-box {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(18,86,243,0.09); border: 1px solid rgba(18,86,243,0.2);
    display: flex; align-items: center; justify-content: center;
    animation: loading-pulse 1.5s ease-in-out infinite;
  }

  @keyframes loading-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.94)} }

  .db-loading-label {
    font-size: 16px; font-weight: 700; color: var(--muted);
    letter-spacing: -0.01em;
  }

  .db-loading-bar { width: 200px; height: 3px; background: var(--border); border-radius: 3px; overflow: hidden; }

  .db-loading-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--blue), var(--cyan));
    animation: db-ls 1.4s ease-in-out infinite; border-radius: 3px;
  }

  @keyframes db-ls { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }

  /* ─── EMPTY ─── */
  .db-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 20px; gap: 10px; text-align: center;
  }

  .db-empty-icon {
    width: 46px; height: 46px; border-radius: 13px;
    background: var(--surface3); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
  }

  .db-empty-title { font-size: 16px; font-weight: 700; color: var(--muted); letter-spacing: -0.01em; }
  .db-empty-sub { font-size: 12px; color: var(--muted2); max-width: 200px; line-height: 1.6; font-weight: 500; }

  .db-empty-btn {
    margin-top: 6px; padding: 10px 22px;
    background: var(--blue); color: #fff;
    border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700;
    font-family: 'Manrope', sans-serif; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(18,86,243,0.3);
  }

  .db-empty-btn:hover {
    background: var(--blue-dark);
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(18,86,243,0.42);
  }

  /* ─── RECHARTS ─── */
  .recharts-tooltip-wrapper { outline: none !important; }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 1200px) {
    .db-main { grid-template-columns: 1fr 1fr; }
    .db-bottom { grid-template-columns: 1fr 1fr; }
    .db-ribbon { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 820px) {
    .db { padding: 20px 18px 60px; }
    .db-main { grid-template-columns: 1fr; }
    .db-bottom { grid-template-columns: 1fr; }
    .db-ribbon { grid-template-columns: repeat(2, 1fr); }
    .db-journey-inner { flex-direction: column; }
    .db-journey-step::after { display: none; }
    .db-greeting { font-size: 28px; }
    .db-head { flex-direction: column; align-items: flex-start; gap: 14px; }
  }

  /* ─── HISTORY TABLE ─── */
  .db-history-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .db-history-table th {
    text-align: left; padding: 12px 16px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted3);
    border-bottom: 1px solid var(--divider);
  }
  .db-history-table td {
    padding: 16px; border-bottom: 1px solid var(--divider);
    font-size: 13px; font-weight: 600; color: var(--text);
  }
  .db-history-table tr:last-child td { border-bottom: none; }
  .db-history-table tr:hover td { background: rgba(18,86,243,0.02); }
  .db-history-date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--muted2); }
  .db-history-score { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700; color: var(--blue); }
`;

// ─── HELPERS ───
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function fmtScore(s: number | undefined | null): string {
  if (s == null || isNaN(s)) return "—";
  return String(Math.round(s));
}

function fmtPct(s: number | undefined | null): string {
  if (s == null || isNaN(s)) return "—";
  return `${Math.round(s)}%`;
}

function fmtLakh(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return "—";
  return `₹${(n / 100000).toFixed(1)}L`;
}

function priorityStyle(p: string) {
  if (p === "high")   return { dot: "#1256F3", bg: "rgba(18,86,243,0.08)",  color: "#1256F3", border: "rgba(18,86,243,0.2)" };
  if (p === "medium") return { dot: "#E8960A", bg: "rgba(232,150,10,0.08)", color: "#E8960A", border: "rgba(232,150,10,0.22)" };
  return               { dot: "#6E82C0",       bg: "rgba(110,130,192,0.08)",color: "#6E82C0", border: "rgba(110,130,192,0.2)" };
}

function ScoreArc({ score }: { score: number }) {
  const r = 43, cx = 52, cy = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={104} height={104} viewBox="0 0 104 104">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#DCE4FB" strokeWidth={7} />
      <defs>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1256F3" />
          <stop offset="100%" stopColor="#00B8F0" />
        </linearGradient>
      </defs>
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="url(#sg)" strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 52 52)"
        style={{ filter: "drop-shadow(0 0 7px rgba(18,86,243,0.38))" }}
      />
    </svg>
  );
}

// ─── MAIN ───
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");
  const q = histId ? `?id=${histId}` : "";
  const nav = (p: string) => navigate(histId ? `${p}?history=${histId}` : p);

  const [data,          setData]          = useState<DashboardData | null>(null);
  const [recs,          setRecs]          = useState<Rec[] | null>(null);
  const [roadmap,       setRoadmap]       = useState<RoadmapWeek[] | null>(null);
  const [industries,    setIndustries]    = useState<Industry[] | null>(null);
  const [history,       setHistory]       = useState<HistoryEntry[]>([]);
  const [recsStatus,    setRecsStatus]    = useState<"loading"|"cached"|"fresh"|"none">("loading");
  const [roadmapStatus, setRoadmapStatus] = useState<"loading"|"cached"|"fresh"|"none">("loading");
  const [indStatus, setIndStatus] = useState<"none"|"loading"|"generating"|"cached"|"fresh">("none");

  // Modal State
  const [activeModal, setActiveModal] = useState<"risk" | "competitor" | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const openModal = async (type: "risk" | "competitor", id: number) => {
    setActiveModal(type);
    setModalLoading(true);
    setModalData(null);
    try {
      const endpoint = type === "risk" ? "risk-radar" : "simulate-competitor";
      const res = await fetch(`${API}/${endpoint}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, initial: true }),
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) setModalData(json);
    } catch (e) {
      console.error(e);
    }
    setModalLoading(false);
  };
  const [loading,       setLoading]       = useState(true);
  const [barsVis,       setBarsVis]       = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/dashboard/data/${q}`, { credentials: "include" })
      .then(r => { if (r.status === 401) { navigate("/login"); return null; } return r.json(); })
      .then(d => { if (d) setData(d); })
      .finally(() => setLoading(false));

    fetch(`${API}/assessments/history/`, { credentials: "include" })
      .then(r => r.json())
      .then(h => { if (h.history) setHistory(h.history); })
      .catch(() => {});

    fetch(`${API}/recommendations/${q}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.recommendations) { setRecs(d.recommendations.slice(0, 3)); setRecsStatus(d.cached ? "cached" : "fresh"); }
        else setRecsStatus("none");
      }).catch(() => setRecsStatus("none"));

    fetch(`${API}/roadmap/generate/${q}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.roadmap) { setRoadmap(d.roadmap); setRoadmapStatus(d.cached ? "cached" : "fresh"); }
        else setRoadmapStatus("none");
      }).catch(() => setRoadmapStatus("none"));

    fetch(`${API}/industries/personalized/${q}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.generating) { setIndStatus("generating"); return; }
        if (d.industries?.length) { setIndustries(d.industries.slice(0, 4)); setIndStatus(d.cached ? "cached" : "fresh"); }
        else setIndStatus("none");
      }).catch(() => setIndStatus("none"));
  }, [q]);

  useEffect(() => {
    if (!scoreRef.current) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsVis(true); }, { threshold: 0.2 });
    ob.observe(scoreRef.current);
    return () => ob.disconnect();
  }, [loading]);

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="db-loading">
        <div className="db-loading-box"><Zap size={22} color="#1256F3" /></div>
        <div className="db-loading-label">Loading intelligence…</div>
        <div className="db-loading-bar"><div className="db-loading-fill" /></div>
      </div>
    </>
  );

  const a      = data?.assessment;
  const name   = data?.name ?? "there";
  const score  = a?.capability_score ?? 0;
  const level  = a?.business_level ?? "—";
  const domain = a?.domain ?? "—";

  const journeySteps = [
    { num:"01", title:"Signup",          val: name !== "there" ? name : "—",                          status: "done"    as const, detail:"Account active",                     path:null },
    { num:"02", title:"Assessment",      val: a ? `${fmtScore(score)}/100` : "Pending",               status: a ? "done" as const : "active" as const, detail: a ? `${level} · ${domain}` : "Take your first assessment", path:"/assessment" },
    { num:"03", title:"AI Roadmap",      val: roadmap ? `${roadmap.length} weeks` : "Pending",        status: roadmap ? "done" as const : (a ? "active" as const : "pending" as const), detail: roadmap ? `${roadmap.reduce((s,w)=>s+(w.tasks?.length??0),0)} tasks` : "From assessment", path:"/roadmap" },
    { num:"04", title:"Recommendations", val: recs ? `${recs.length} actions` : "Pending",            status: recs ? "done" as const : (a ? "active" as const : "pending" as const), detail: recs ? `${recs.filter(r=>r.priority==="high").length} high priority` : "AI-curated", path:"/recommendations" },
    { num:"05", title:"Industries",      val: industries ? `${industries.length} matched` : (indStatus==="generating"?"Generating…":"Pending"), status: industries ? "done" as const : (a ? "active" as const : "pending" as const), detail: industries ? "Personalized to profile" : "Discover markets", path:"/explore" },
  ];

  const chartBase = (a?.revenue && !isNaN(a.revenue)) ? a.revenue / 100000 : 2;
  const chartData = [
    { m:"M-5", v: +(chartBase*0.60).toFixed(1) },
    { m:"M-4", v: +(chartBase*0.72).toFixed(1) },
    { m:"M-3", v: +(chartBase*0.85).toFixed(1) },
    { m:"M-2", v: +(chartBase*0.95).toFixed(1) },
    { m:"M-1", v: +(chartBase*1.08).toFixed(1) },
    { m:"Now",  v: +chartBase.toFixed(1) },
  ];

  const breakdown = [
    { label:"Budget",  score: a ? Math.min(Math.round((a.capital/500000)*100),100) : 0 },
    { label:"Team",    score: a ? Math.min(a.team_size*6,100) : 0 },
    { label:"Clients", score: a ? Math.min(a.clients*4,100) : 0 },
    { label:"Revenue", score: a ? Math.min(Math.round((a.revenue/500000)*100),100) : 0 },
    { label:"Conf.",   score: a?.confidence ?? 0 },
  ];

  const aiModules = [
    { name:"Recommendations", status:recsStatus,   path:"/recommendations" },
    { name:"Growth Roadmap",  status:roadmapStatus, path:"/roadmap" },
    { name:"Industry Match",  status:indStatus,     path:"/explore" },
  ];

  const dotClass  = (s:string) => s==="cached"||s==="fresh" ? "ai-cached" : s==="loading"||s==="generating" ? "ai-loading" : "ai-pending";
  const statTxt   = (s:string) => s==="cached" ? "cached" : s==="fresh" ? "generated" : s==="loading"||s==="generating" ? "generating…" : "pending";
  const statClass = (s:string) => s==="cached"||s==="fresh" ? "ai-status-cached" : s==="loading"||s==="generating" ? "ai-status-loading" : "ai-status-pending";

  return (
    <>
      <style>{css}</style>
      <div className="db">

        {/* HEADER */}
        <div className="db-head">
          <div className="db-head-left">
            <div className="db-date">
              <div className="db-date-pip" />
              {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </div>
            <div className="db-greeting">{greeting()}, <em>{name}</em></div>
            <div className="db-tagline">
              {a ? (
                <>
                  <span>{domain}</span>
                  <span className="db-tagline-sep" />
                  <span>{level}</span>
                  <span className="db-tagline-sep" />
                  <span>{fmtLakh(a.revenue)} monthly revenue</span>
                </>
              ) : "Complete your assessment to activate the intelligence layer"}
            </div>
          </div>
          <button className="db-assess-btn" onClick={() => navigate("/assessment")}>
            <Zap size={13} /> {a ? "Retake Assessment" : "Start Assessment"}
          </button>
        </div>

        {/* RIBBON */}
        <div className="db-ribbon">
          {[
            { label:"Domain",         val: domain === "—" ? "N/A" : domain, neutral:false },
            { label:"Level",          val: level,                            neutral:false },
            { label:"Capability",     val: a ? `${fmtScore(score)}/100` : "—", neutral:false },
            { label:"Confidence",     val: a ? fmtPct(a.confidence) : "—",  neutral:false },
            { label:"Active Clients", val: a ? String(a.clients) : "—",     neutral:true },
          ].map(c => (
            <div key={c.label} className="db-rib-cell">
              <div className="db-rib-label">{c.label}</div>
              <div className={`db-rib-val${c.neutral ? " neutral" : ""}`}>{c.val}</div>
            </div>
          ))}
        </div>

        {/* JOURNEY */}
        <div className="db-journey">
          <div className="db-journey-inner">
            {journeySteps.map(step => (
              <div
                key={step.num}
                className={`db-journey-step step-${step.status}`}
                onClick={() => step.path && step.status !== "pending" && nav(step.path)}
              >
                <div className="db-step-num">{step.num}</div>
                <div className="db-step-title">{step.title}</div>
                <div className="db-step-val">{step.val}</div>
                <div className="db-step-detail">{step.detail}</div>
                <div className={`db-step-status status-${step.status}`}>
                  {step.status === "done" ? "✓ Complete" : step.status === "active" ? "● Active" : "○ Locked"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="db-main">

          {/* Capability Profile */}
          <div className="db-card" ref={scoreRef}>
            <div className="db-card-strip" />
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Capability Profile</div>
                <div className="db-card-sub">Scored across 5 dimensions</div>
              </div>
              {a && <div className="db-pill">{level}</div>}
            </div>

            {!a ? (
              <div className="db-empty">
                <div className="db-empty-icon"><Target size={20} color="#6E82C0" /></div>
                <div className="db-empty-title">No Assessment Yet</div>
                <div className="db-empty-sub">Run an assessment to unlock your capability score.</div>
                <button className="db-empty-btn" onClick={() => navigate("/assessment")}>Start Now →</button>
              </div>
            ) : (
              <>
                <div className="db-score-arc-wrap">
                  <div className="db-arc-svg-wrap">
                    <ScoreArc score={score} />
                    <div className="db-arc-label">
                      <div className="db-arc-num">{fmtScore(score)}</div>
                      <div className="db-arc-denom">/100</div>
                    </div>
                  </div>
                  <div className="db-score-meta">
                    <div className="db-score-level">{level}</div>
                    <div className="db-score-domain">{domain}</div>
                    <div className="db-score-conf">Confidence: <strong>{fmtPct(a.confidence)}</strong></div>
                    <div className="db-meta-chips">
                      <div className="db-meta-chip">Team: <strong>{a.team_size}</strong></div>
                      <div className="db-meta-chip">Clients: <strong>{a.clients}</strong></div>
                    </div>
                  </div>
                </div>
                <div className="db-breakdown">
                  {breakdown.map((bd, i) => (
                    <div key={bd.label} className="db-bd-row">
                      <div className="db-bd-label">{bd.label}</div>
                      <div className="db-bd-track">
                        <div
                          className="db-bd-fill"
                          style={{ width: barsVis ? `${bd.score}%` : "0%", transitionDelay: `${i*0.1}s` }}
                        />
                      </div>
                      <div className="db-bd-val">{bd.score}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Growth Roadmap */}
          <div className="db-card">
            <div className="db-card-strip" />
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Growth Roadmap</div>
                <div className="db-card-sub">{roadmap ? `${roadmap.length}-week AI plan` : "AI-generated plan"}</div>
              </div>
              {roadmapStatus === "cached"  && <div className="db-pill green">Cached</div>}
              {roadmapStatus === "loading" && <div className="db-pill amber">Generating…</div>}
            </div>

            {!roadmap && roadmapStatus === "none" ? (
              <div className="db-empty">
                <div className="db-empty-icon"><Map size={20} color="#6E82C0" /></div>
                <div className="db-empty-title">No Roadmap Yet</div>
                <div className="db-empty-sub">Complete assessment to generate your growth roadmap.</div>
                <button className="db-empty-btn" onClick={() => navigate("/assessment")}>Take Assessment →</button>
              </div>
            ) : !roadmap ? (
              <div className="db-empty">
                <div className="db-spinner" />
                <div className="db-empty-sub" style={{ marginTop:10 }}>Building your roadmap…</div>
              </div>
            ) : (
              <>
                {roadmap.map((week, i) => (
                  <div
                    key={week.week}
                    className={`db-rm-week${i===0 ? " rm-active" : ""}`}
                    onClick={() => nav("/roadmap")}
                  >
                    <div
                      className="db-rm-num"
                      style={{
                        background: i===0 ? "rgba(18,86,243,0.1)" : "var(--surface3)",
                        borderColor: i===0 ? "rgba(18,86,243,0.35)" : "var(--border)",
                        color: i===0 ? "#1256F3" : "#6E82C0",
                      }}
                    >
                      {week.week}
                    </div>
                    <div className="db-rm-body">
                      <div className="db-rm-title">{week.title}</div>
                      <div className="db-rm-focus">{week.focus}</div>
                      <div className="db-rm-tasks">{week.tasks?.length ?? 0} tasks</div>
                    </div>
                    <ChevronRight size={13} color="#B4C2F2" style={{ flexShrink:0, marginTop:6 }} />
                  </div>
                ))}
                <button className="db-rm-view-btn" onClick={() => nav("/roadmap")}>
                  <Map size={13} /> Open Full Roadmap
                </button>
              </>
            )}
          </div>

          {/* Right Col */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* AI Modules */}
            <div className="db-card">
              <div className="db-card-strip" />
              <div className="db-card-head" style={{ marginBottom:16 }}>
                <div>
                  <div className="db-card-title">AI Modules</div>
                  <div className="db-card-sub">Groq LLaMA-3.3-70b</div>
                </div>
                <Sparkles size={15} color="#1256F3" />
              </div>
              {aiModules.map(m => (
                <div
                  key={m.name}
                  className={`db-ai-module${m.status==="cached"||m.status==="fresh" ? " ai-ready" : ""}`}
                  onClick={() => (m.status==="cached"||m.status==="fresh") && nav(m.path)}
                >
                  <div className={`db-ai-dot ${dotClass(m.status)}`} />
                  <div className="db-ai-name">{m.name}</div>
                  <div className={`db-ai-status ${statClass(m.status)}`}>{statTxt(m.status)}</div>
                  {(m.status==="cached"||m.status==="fresh") && <ChevronRight size={11} color="#B4C2F2" />}
                </div>
              ))}
              {a && (
                <div className="db-data-src">
                  <div className="db-data-src-label">Data Source</div>
                  <div className="db-data-src-val">Assessment · {domain} · {level}</div>
                  <div className="db-data-src-flow">→ feeding all 3 modules</div>
                </div>
              )}
            </div>

            {/* Quick Nav */}
            <div className="db-card" style={{ flex:1 }}>
              <div className="db-card-strip" />
              <div className="db-card-head" style={{ marginBottom:16 }}>
                <div>
                  <div className="db-card-title">Quick Nav</div>
                  <div className="db-card-sub">Jump to module</div>
                </div>
              </div>
              {[
                { icon:Target,     label:"Assessment",  sub: a ? `Score: ${fmtScore(score)}` : "Not done",          path:"/assessment" },
                { icon:Map,        label:"Roadmap",     sub: roadmap ? `${roadmap.length}wk plan` : "Pending",       path:"/roadmap" },
                { icon:Layers,     label:"Industries",  sub: industries ? `${industries.length} matched` : "Pending", path:"/explore" },
                { icon:TrendingUp, label:"Recs",        sub: recs ? `${recs.length} actions` : "Pending",            path:"/recommendations" },
              ].map(navItem => (
                <div key={navItem.label} className="db-qnav" onClick={() => nav(navItem.path)}>
                  <div className="db-qnav-icon">
                    <navItem.icon size={13} color="#1256F3" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="db-qnav-label">{navItem.label}</div>
                    <div className="db-qnav-sub">{navItem.sub}</div>
                  </div>
                  <ArrowRight size={12} color="#B4C2F2" />
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="db-bottom">

          {/* Revenue Chart */}
          <div className="db-card">
            <div className="db-card-strip" />
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Revenue Trend</div>
                <div className="db-card-sub">{a ? `${fmtLakh(a.revenue)} base · ₹ Lakhs` : "Estimated · ₹ Lakhs"}</div>
              </div>
              <div className="db-pill">↑ est.</div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top:6, right:0, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1256F3" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#1256F3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="m"
                  tick={{ fill:"#A0B0D8", fontSize:10, fontFamily:"IBM Plex Mono" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background:"#fff", border:"1px solid #C8D4F8", borderRadius:10, fontSize:11, fontFamily:"IBM Plex Mono", boxShadow:"0 4px 18px rgba(18,86,243,0.1)" }}
                  labelStyle={{ color:"#6E82C0" }} itemStyle={{ color:"#1256F3" }}
                  cursor={{ stroke:"#1256F3", strokeWidth:1, strokeDasharray:"3 3", strokeOpacity:0.35 }}
                />
                <Area type="monotone" dataKey="v" stroke="#1256F3" strokeWidth={2}
                  fill="url(#rg)" dot={false}
                  activeDot={{ r:4, fill:"#1256F3", stroke:"#fff", strokeWidth:2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            {a && (
              <div className="db-rev-chips">
                {[
                  { label:"Capital", val:fmtLakh(a.capital) },
                  { label:"Revenue", val:fmtLakh(a.revenue) },
                  { label:"Team",    val:String(a.team_size) },
                ].map(s => (
                  <div key={s.label} className="db-rev-chip">
                    <div className="db-rev-chip-label">{s.label}</div>
                    <div className="db-rev-chip-val">{s.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="db-card">
            <div className="db-card-strip" />
            <div className="db-card-head">
              <div>
                <div className="db-card-title">AI Recommendations</div>
                <div className="db-card-sub">Top 3 · from assessment</div>
              </div>
              {recs && (
                <button
                  onClick={() => nav("/recommendations")}
                  style={{ background:"transparent", border:"none", color:"#1256F3", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4, fontFamily:"Manrope, sans-serif" }}
                >
                  All <ChevronRight size={12} />
                </button>
              )}
            </div>

            {recsStatus === "loading" && (
              <div className="db-empty"><div className="db-spinner" />
                <div className="db-empty-sub" style={{ marginTop:10 }}>Generating with Groq…</div>
              </div>
            )}

            {recsStatus === "none" && (
              <div className="db-empty">
                <div className="db-empty-icon"><Sparkles size={20} color="#6E82C0" /></div>
                <div className="db-empty-title">Not Generated</div>
                <div className="db-empty-sub">Assessment needed to generate AI recommendations.</div>
                <button className="db-empty-btn" onClick={() => navigate("/assessment")}>Assess Now →</button>
              </div>
            )}

            {recs && recs.map((rec, i) => {
              const ps = priorityStyle(rec.priority);
              return (
                <div key={i} className="db-rec">
                  <div className="db-rec-dot" style={{ background:ps.dot }} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:3 }}>
                      <div className="db-rec-title">{rec.title}</div>
                      <div className="db-rec-priority" style={{ background:ps.bg, color:ps.color, borderColor:ps.border }}>{rec.priority}</div>
                    </div>
                    <div className="db-rec-action">{rec.action}</div>
                    <div className="db-rec-impact">Impact: {rec.impact}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Industries */}
          <div className="db-card">
            <div className="db-card-strip" />
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Industry Matches</div>
                <div className="db-card-sub">{indStatus==="generating" ? "AI personalizing…" : "Curated for your profile"}</div>
              </div>
              {industries && (
                <button
                  onClick={() => nav("/explore")}
                  style={{ background:"transparent", border:"none", color:"#1256F3", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4, fontFamily:"Manrope, sans-serif" }}
                >
                  All <ChevronRight size={12} />
                </button>
              )}
            </div>

            {(indStatus==="generating"||indStatus==="loading") && (
              <div className="db-empty"><div className="db-spinner" />
                <div className="db-empty-sub" style={{ marginTop:10 }}>Personalizing with Groq…</div>
              </div>
            )}

            {(indStatus==="none" || (!industries && indStatus!=="generating" && indStatus!=="loading")) && (
              <div className="db-empty">
                <div className="db-empty-icon"><Building2 size={20} color="#6E82C0" /></div>
                <div className="db-empty-title">No Matches Yet</div>
                <div className="db-empty-sub">Assessment needed to match industries.</div>
                <button className="db-empty-btn" onClick={() => navigate("/assessment")}>Assess Now →</button>
              </div>
            )}

            {industries && industries.map(ind => (
              <div key={ind.slug} className="db-ind" onClick={() => nav(`/explore/${ind.slug}`)}>
                <div className="db-ind-emoji">{ind.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="db-ind-name">{ind.name}</div>
                  <div className="db-ind-growth">{ind.growth}</div>
                  <div className="db-ind-tags">
                    {ind.tags.slice(0,2).map(t => <span key={t} className="db-ind-tag">{t}</span>)}
                  </div>
                </div>
                <ChevronRight size={13} className="db-ind-arrow" />
              </div>
            ))}

            {industries && (
              <div className="db-explore-more" onClick={() => nav("/explore")}>
                <span>Explore all industries</span>
                <Building2 size={13} color="#1256F3" />
              </div>
            )}
          </div>

        </div>

        {/* HISTORY PANEL */}
        {history.length > 0 && (
          <div className="db-card" style={{ marginTop: 16 }}>
            <div className="db-card-strip" />
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Assessment History</div>
                <div className="db-card-sub">Progression timeline of your diagnostics</div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="db-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Domain</th>
                    <th>Level</th>
                    <th>Score</th>
                    <th>Confidence</th>
                    <th style={{ textAlign: "center" }}>Risk Radar</th>
                    <th style={{ textAlign: "center" }}>Comp. Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} onClick={() => navigate(`?history=${h.id}`)} style={{ cursor: "pointer" }}>
                      <td className="db-history-date">
                        {h.id.toString() === histId && <span style={{color:"#1256F3", marginRight:6}}>▶</span>}
                        {new Date(h.created_at).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>{h.domain}</td>
                      <td>
                        <span className={`db-pill ${h.business_level === "Enterprise" ? "green" : h.business_level === "Intermediate" ? "amber" : ""}`} style={{ fontSize: 10, padding: "3px 8px" }}>
                          {h.business_level}
                        </span>
                      </td>
                      <td className="db-history-score">{h.capability_score}<span style={{ color:"var(--muted3)", fontSize: 10 }}>/100</span></td>
                      <td className="db-history-date">{h.confidence}%</td>
                      <td style={{ textAlign: "center" }}>
                        {h.has_risk_profile ? (
                          <button className="db-view-btn" onClick={(e) => { e.stopPropagation(); openModal("risk", h.id); }}>
                            <Eye size={12} /> View
                          </button>
                        ) : <span style={{ color: "var(--muted3)" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {h.has_competitor_profile ? (
                          <button className="db-view-btn" onClick={(e) => { e.stopPropagation(); openModal("competitor", h.id); }}>
                            <Eye size={12} /> View
                          </button>
                        ) : <span style={{ color: "var(--muted3)" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL PORTAL */}
        {activeModal && (
          <div className="db-modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="db-modal" onClick={e => e.stopPropagation()}>
              <div className="db-modal-head">
                <div className="db-modal-title">
                  {activeModal === "risk" ? <><Shield size={20} color="var(--red)" /> Master Risk Profile</> : <><Target size={20} color="var(--blue)" /> Target Competitor Profile</>}
                </div>
                <button className="db-modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              <div className="db-modal-body">
                {modalLoading ? (
                  <div className="db-empty"><div className="db-spinner" /><div style={{marginTop: 10, color:"var(--muted)"}}>Loading cached data...</div></div>
                ) : modalData ? (
                  activeModal === "risk" ? (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                        {[
                          { label: "High", val: modalData.summary?.highRisks, color: "var(--red)" },
                          { label: "Med", val: modalData.summary?.mediumRisks, color: "var(--amber)" },
                          { label: "Resolved", val: modalData.summary?.resolved, color: "var(--green)" },
                          { label: "Score", val: modalData.summary?.score, color: "var(--blue)" },
                        ].map(s => (
                          <div key={s.label} style={{ background: "var(--surface2)", border: "1px solid var(--border)", padding: 12, borderRadius: 8, textAlign: "center" }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted2)" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {modalData.categories?.map((cat: any, i: number) => {
                          if (!cat.risks || cat.risks.length === 0) return null;
                          const bg = cat.severity === "High" ? "rgba(224,62,62,0.1)" : cat.severity === "Medium" ? "rgba(232,150,10,0.1)" : "rgba(11,174,110,0.1)";
                          const color = cat.severity === "High" ? "var(--red)" : cat.severity === "Medium" ? "var(--amber)" : "var(--green)";
                          return (
                            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                              <div style={{ background: bg, padding: "10px 16px", fontWeight: 700, fontSize: 13, color: color, display: "flex", justifyContent: "space-between" }}>
                                <span>{cat.category}</span>
                                <span>{cat.severity}</span>
                              </div>
                              <div style={{ padding: 16 }}>
                                {cat.risks.map((r: any, j: number) => (
                                  <div key={j} style={{ marginBottom: j === cat.risks.length-1 ? 0 : 12, borderBottom: j === cat.risks.length-1 ? "none" : "1px solid var(--divider)", paddingBottom: j === cat.risks.length-1 ? 0 : 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{r.title}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{r.desc}</div>
                                    <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, background: "rgba(11,174,110,0.1)", display: "inline-block", padding: "4px 8px", borderRadius: 4 }}>✓ {r.action}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 24 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase" }}>Target</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{modalData.comp_name || "Enterprise"}</div>
                          <div className="db-pill" style={{ marginTop: 4 }}>{modalData.comp_scale || "Enterprise"} Scale</div>
                        </div>
                      </div>
                      <div style={{ background: "var(--surface2)", borderRadius: 12, border: "1px solid var(--border)", padding: 16, marginBottom: 24 }}>
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={modalData.dimensions}>
                            <PolarGrid stroke="var(--border2)" />
                            <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted2)", fontSize: 11, fontWeight: 600 }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                            <Radar name="Simulated You" dataKey="you" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={2} />
                            <Radar name="Competitor" dataKey="competitor" stroke="var(--muted2)" fill="var(--muted2)" fillOpacity={0.05} strokeWidth={2} strokeDasharray="3 3" />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)" }}>— You</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)" }}>- - Competitor</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {modalData.gaps?.map((g: any, i: number) => (
                          <div key={i} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 80, fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{g.area}</div>
                            <div style={{ flex: 1, fontSize: 11, color: "var(--muted)" }}>
                              <div style={{ marginBottom: 4 }}><strong style={{color:"var(--blue)"}}>You:</strong> {g.you}</div>
                              <div><strong style={{color:"var(--text)"}}>Them:</strong> {g.enterprise}</div>
                            </div>
                            <div style={{ width: 60, textAlign: "center" }}>
                              <span className={`db-pill ${g.gap === "Critical" ? "amber" : "green"}`} style={{ background: g.gap === "Critical" ? "rgba(224,62,62,0.1)" : "", color: g.gap === "Critical" ? "var(--red)" : "", borderColor: g.gap === "Critical" ? "var(--red)" : "" }}>{g.gap}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="db-empty">Failed to load data.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}