import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ChevronRight, RefreshCw, Sparkles, MapPin,
  TrendingUp, Target, ArrowUpRight, Filter, X,
  BarChart2, Clock, Zap, AlertCircle,
} from "lucide-react";

const API = "http://localhost:8000";

interface Industry {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  marketSize: string;
  growth: string;
  levels: string[];
  tags: string[];
  color: string;
  whyForYou?: string;
  comingSoon?: boolean;
}

interface AssessmentSnap {
  domain: string;
  business_level: string;
  capability_score: number;
  tier: string;
  skills: string[];
}

type SortKey = "default" | "growth" | "name";

// ─── parse growth string like "+28% YoY" → number
function parseGrowth(g: string): number {
  const m = g?.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .ie {
    padding: 32px 36px 72px;
    font-family: 'DM Sans', sans-serif;
    color: #1A1F2C; background: #F8FAFC; min-height: 100%;
    position: relative;
  }

  /* grid bg */
  .ie::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px);
    background-size: 52px 52px;
  }
  .ie > * { position: relative; z-index: 1; }

  /* ── HEADER ── */
  .ie-head {
    padding-bottom: 24px; margin-bottom: 24px;
    border-bottom: 1px solid #E2E8F0; position: relative;
  }
  .ie-head::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent);
  }
  .ie-head-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }

  .ie-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #2563EB; margin-bottom: 10px;
  }
  .ie-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #2563EB; box-shadow: 0 0 8px #2563EB;
    animation: blink 2s infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .ie-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px; line-height: 0.92; letter-spacing: 0.02em; margin-bottom: 6px;
    color: #0F172A;
  }
  .ie-title em { color: #2563EB; font-style: normal; }
  .ie-subtitle { font-size: 13px; color: #64748B; font-weight: 400; letter-spacing: 0.02em; }

  .ie-badges { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .ie-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 40px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
  }
  .ie-badge-personal { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; }
  .ie-badge-global   { background: #F1F5F9; border: 1px solid #E2E8F0; color: #475569; }
  .ie-badge-count    { background: #FFFFFF; border: 1px solid #E2E8F0; color: #64748B; font-family: 'DM Mono'; }

  /* header right */
  .ie-head-right { display: flex; align-items: flex-start; gap: 8px; flex-shrink: 0; }

  .ie-refresh {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; background: #FFFFFF; border: 1px solid #CBD5E1;
    border-radius: 6px; color: #475569; font-size: 11px; font-weight: 600;
    font-family: 'DM Sans'; letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .ie-refresh:hover { border-color: #93C5FD; color: #2563EB; box-shadow: 0 2px 4px rgba(37,99,235,0.1); }
  .ie-refresh:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .ie-spin { animation: spin 1s linear infinite; }

  /* ── PROFILE CONTEXT STRIP ── */
  .ie-profile-strip {
    display: flex; align-items: center; gap: 0;
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px;
    overflow: hidden; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  }
  .ie-profile-cell {
    flex: 1; padding: 14px 16px; border-right: 1px solid #F1F5F9;
    position: relative;
  }
  .ie-profile-cell:last-child { border-right: none; }
  .ie-profile-cell-label {
    font-size: 9px; color: #94A3B8; letter-spacing: 0.12em; text-transform: uppercase;
    font-weight: 700; margin-bottom: 4px;
  }
  .ie-profile-cell-val {
    font-family: 'DM Mono'; font-size: 12px; color: #334155; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; font-weight: 500;
  }
  .ie-profile-cell-val.orange { color: #2563EB; font-weight: 600; }

  .ie-profile-assess-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 14px 20px; background: #2563EB; color: #fff; border: none;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    font-family: 'DM Sans'; cursor: pointer; transition: all 0.2s;
    flex-shrink: 0; align-self: stretch;
  }
  .ie-profile-assess-btn:hover { background: #1D4ED8; }

  /* ── CONTROLS BAR ── */
  .ie-controls {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px; flex-wrap: wrap;
  }

  .ie-search {
    flex: 1; min-width: 220px;
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px; background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 8px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .ie-search:focus-within {
    border-color: #93C5FD; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }
  .ie-search input {
    flex: 1; background: transparent; border: none; outline: none;
    font-size: 13px; color: #1E293B; font-family: 'DM Sans';
  }
  .ie-search input::placeholder { color: #94A3B8; }
  .ie-search-clear { cursor: pointer; color: #94A3B8; transition: color 0.15s; }
  .ie-search-clear:hover { color: #EF4444; }

  .ie-sort {
    display: flex; align-items: center; gap: 0;
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px;
    overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .ie-sort-btn {
    padding: 11px 16px; background: transparent; border: none; border-right: 1px solid #F1F5F9;
    color: #64748B; font-size: 12px; font-weight: 600; font-family: 'DM Sans';
    cursor: pointer; transition: all 0.18s; white-space: nowrap;
  }
  .ie-sort-btn:last-child { border-right: none; }
  .ie-sort-btn.active { background: #EFF6FF; color: #1D4ED8; font-weight: 700; }
  .ie-sort-btn:hover:not(.active) { color: #334155; background: #F8FAFC; }

  /* ── TAG FILTER BAR ── */
  .ie-tag-bar {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 24px; flex-wrap: wrap;
  }
  .ie-tag-bar-label {
    font-size: 10px; color: #64748B; letter-spacing: 0.12em; text-transform: uppercase;
    font-weight: 700; margin-right: 4px; flex-shrink: 0;
  }
  .ie-tag-filter {
    padding: 6px 12px; border-radius: 6px;
    font-size: 11px; font-weight: 600;
    background: #FFFFFF; border: 1px solid #E2E8F0; color: #475569;
    cursor: pointer; transition: all 0.18s; font-family: 'DM Sans';
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .ie-tag-filter:hover { border-color: #93C5FD; color: #2563EB; }
  .ie-tag-filter.active {
    background: #2563EB; border-color: #2563EB; color: #FFFFFF;
    box-shadow: 0 2px 6px rgba(37,99,235,0.25);
  }
  .ie-tag-clear {
    padding: 6px 12px; border-radius: 6px; margin-left: 4px;
    font-size: 11px; font-weight: 600; 
    background: transparent; border: 1px solid transparent; color: #64748B;
    cursor: pointer; transition: all 0.18s; font-family: 'DM Sans';
    display: flex; align-items: center; gap: 4px;
  }
  .ie-tag-clear:hover { color: #EF4444; background: #FEF2F2; }

  /* ── RESULTS META ── */
  .ie-results-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .ie-results-count { font-size: 12px; color: #64748B; font-family: 'DM Sans'; font-weight: 500; }
  .ie-results-count span { color: #2563EB; font-weight: 700; }
  .ie-gen-time { font-size: 11px; color: #94A3B8; font-family: 'DM Mono'; }

  /* ── GRID ── */
  .ie-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  @media (max-width: 1100px) { .ie-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px)  { .ie-grid { grid-template-columns: 1fr; } }

  /* ── CARD ── */
  @keyframes card-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ie-card {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;
    padding: 24px; position: relative; overflow: hidden;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    animation: card-in 0.35s ease both;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  }
  .ie-card.coming { opacity: 0.5; cursor: default; pointer-events: none; }
  .ie-card:not(.coming):hover {
    border-color: #93C5FD;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(37,99,235,0.15);
  }

  /* top color bar */
  .ie-card-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }

  /* rank badge (top-left corner) */
  .ie-rank {
    position: absolute; top: 14px; right: 14px;
    font-family: 'DM Mono'; font-size: 10px; color: #64748B;
    letter-spacing: 0.05em; font-weight: 600;
    background: #F1F5F9; padding: 4px 8px; border-radius: 4px;
  }
  .ie-rank.top { color: #1D4ED8; background: #EFF6FF; border: 1px solid #BFDBFE; }

  /* ── CARD TOP ── */
  .ie-card-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
  .ie-emoji { font-size: 32px; line-height: 1; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
  .ie-card-name {
    font-family: 'Bebas Neue'; font-size: 22px; letter-spacing: 0.02em;
    color: #0F172A; line-height: 1.1; margin-bottom: 6px;
  }
  .ie-card-desc { font-size: 11px; color: #64748B; line-height: 1.5; font-weight: 400; }

  /* ── WHY FOR YOU ── */
  .ie-why {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 10px 12px; border-radius: 6px; margin-bottom: 16px;
    background: #F0F9FF; border: 1px solid #BAE6FD;
    font-size: 11px; color: #0369A1; line-height: 1.5; font-weight: 500;
  }
  .ie-why-icon { flex-shrink: 0; margin-top: 2px; color: #0284C7; }

  /* ── STATS ROW ── */
  .ie-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .ie-stat {
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px;
    position: relative; overflow: hidden; transition: border-color 0.2s;
  }
  .ie-stat::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: var(--stat-color, #2563EB); transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ie-card:hover .ie-stat { border-color: #CBD5E1; }
  .ie-card:hover .ie-stat::after { transform: scaleX(1); }
  .ie-stat-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #64748B; margin-bottom: 4px;
  }
  .ie-stat-val { font-family: 'Bebas Neue'; font-size: 17px; letter-spacing: 0.03em; }

  /* ── LEVELS ── */
  .ie-levels { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .ie-level {
    font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 4px;
    border: 1px solid; letter-spacing: 0.02em;
  }

  /* ── TAGS ── */
  .ie-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
  .ie-tag {
    font-size: 9px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
    padding: 4px 8px; border-radius: 4px;
    background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;
    cursor: pointer; transition: all 0.15s;
  }
  .ie-tag:hover { border-color: #93C5FD; color: #2563EB; background: #EFF6FF; }
  .ie-tag.tag-active { background: #2563EB; color: #FFFFFF; border-color: #2563EB; }

  /* ── CTA ROW ── */
  .ie-cta-row {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid #F1F5F9;
  }
  .ie-cta-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    display: flex; align-items: center; gap: 5px; transition: transform 0.2s;
  }
  .ie-card:hover .ie-cta-label { transform: translateX(2px); }
  .ie-roadmap-hint {
    font-size: 10px; color: #94A3B8; display: flex; align-items: center; gap: 4px;
    font-weight: 500;
  }
  .ie-card:hover .ie-roadmap-hint { color: #64748B; }

  /* ── SKELETON ── */
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .ie-skeleton {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;
    min-height: 280px; overflow: hidden; position: relative;
    animation: card-in 0.3s ease both;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  }
  .ie-skeleton-bar  { height: 3px; background: #F1F5F9; }
  .ie-skeleton-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
  .ie-skel {
    border-radius: 4px; background: #F1F5F9;
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  /* ── GENERATING STATE ── */
  .ie-gen-state {
    grid-column: 1/-1; display: flex; flex-direction: column;
    align-items: center; padding: 72px 20px; gap: 16px; text-align: center;
    background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); margin-top: 20px;
  }
  .ie-gen-ring {
    width: 64px; height: 64px; border-radius: 50%;
    border: 3px solid #EFF6FF; border-top-color: #2563EB;
    animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
  .ie-gen-title { font-family: 'Bebas Neue'; font-size: 32px; color: #0F172A; letter-spacing: 0.02em; }
  .ie-gen-sub { font-size: 14px; color: #64748B; max-width: 360px; line-height: 1.6; }

  /* Flow steps inside generating */
  .ie-gen-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; background: #F8FAFC; padding: 16px 24px; border-radius: 8px; border: 1px solid #F1F5F9; }
  .ie-gen-step {
    display: flex; align-items: center; gap: 10px;
    font-size: 12px; color: #94A3B8; font-family: 'DM Mono'; font-weight: 500;
  }
  .ie-gen-step.done { color: #2563EB; }
  .ie-gen-step-dot { width: 6px; height: 6px; border-radius: 50%; background: #CBD5E1; flex-shrink: 0; transition: all 0.3s; }
  .ie-gen-step.done .ie-gen-step-dot { background: #2563EB; box-shadow: 0 0 8px rgba(37,99,235,0.4); }

  /* ── EMPTY ── */
  .ie-empty {
    grid-column: 1/-1; display: flex; flex-direction: column;
    align-items: center; padding: 64px 20px; gap: 14px; text-align: center;
    background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0;
  }
  .ie-empty-icon { font-size: 42px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
  .ie-empty-title { font-family: 'Bebas Neue'; font-size: 28px; color: #0F172A; letter-spacing: 0.04em; }
  .ie-empty-sub { font-size: 13px; color: #64748B; max-width: 300px; line-height: 1.6; }
  .ie-empty-btn {
    margin-top: 8px; padding: 12px 28px; background: #2563EB; color: #fff;
    border: none; border-radius: 6px; font-size: 13px; font-weight: 600;
    font-family: 'DM Sans'; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);
  }
  .ie-empty-btn:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 6px 8px -1px rgba(37,99,235,0.3); }

  /* ── NO RESULTS ── */
  .ie-no-results {
    grid-column: 1/-1; text-align: center; padding: 56px 20px;
    font-size: 14px; color: #64748B; background: #FFFFFF; border-radius: 12px; border: 1px dashed #CBD5E1;
  }
  .ie-no-results strong { display: block; font-family: 'Bebas Neue'; font-size: 24px; color: #0F172A; margin-bottom: 8px; letter-spacing: 0.04em; }

  /* ── ERROR ── */
  .ie-error {
    grid-column: 1/-1; text-align: center; padding: 56px 20px;
    background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px;
  }
  .ie-error-title { font-family: 'Bebas Neue'; font-size: 26px; color: #DC2626; letter-spacing: 0.04em; margin-bottom: 8px; }
  .ie-error-sub { font-size: 13px; color: #991B1B; font-weight: 500; }

  /* ── RESPONSIVE ── */
  @media (max-width: 720px) {
    .ie { padding: 24px 16px 56px; }
    .ie-title { font-size: 40px; }
    .ie-head-row { flex-direction: column; }
    .ie-profile-strip { flex-wrap: wrap; }
    .ie-profile-cell { min-width: 50%; }
  }
`;

// ── PROFILE STRIP ─────────────────────────────────────────────────────────────
function ProfileStrip({
  snap, onAssess,
}: {
  snap: AssessmentSnap | null;
  onAssess: () => void;
}) {
  if (!snap) return (
    <div className="ie-profile-strip">
      <div className="ie-profile-cell" style={{ flex: 3 }}>
        <div className="ie-profile-cell-label">Assessment</div>
        <div className="ie-profile-cell-val" style={{ color: "#3A3A3A" }}>No assessment yet — results below are generic</div>
      </div>
      <button className="ie-profile-assess-btn" onClick={onAssess}>
        <Zap size={11} /> Take Assessment
      </button>
    </div>
  );

  return (
    <div className="ie-profile-strip">
      {[
        { label: "Domain",   val: snap.domain,           orange: true  },
        { label: "Level",    val: snap.business_level,   orange: true  },
        { label: "Score",    val: `${snap.capability_score}/100`, orange: true },
        { label: "Location", val: snap.tier?.toUpperCase() ?? "—", orange: false },
        { label: "Skills",   val: snap.skills?.slice(0, 2).join(", ") || "—", orange: false },
      ].map(c => (
        <div key={c.label} className="ie-profile-cell">
          <div className="ie-profile-cell-label">{c.label}</div>
          <div className={`ie-profile-cell-val${c.orange ? " orange" : ""}`}>{c.val}</div>
        </div>
      ))}
      <button className="ie-profile-assess-btn" onClick={onAssess} title="Retake to refresh results">
        <RefreshCw size={10} /> Retake
      </button>
    </div>
  );
}

// ── SKELETON CARD ─────────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="ie-skeleton" style={{ animationDelay: `${delay}s` }}>
      <div className="ie-skeleton-bar" />
      <div className="ie-skeleton-body">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <div className="ie-skel" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="ie-skel" style={{ height: 14, width: "60%", marginBottom: 6 }} />
            <div className="ie-skel" style={{ height: 9, width: "80%" }} />
          </div>
        </div>
        <div className="ie-skel" style={{ height: 36, borderRadius: 3 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div className="ie-skel" style={{ height: 42 }} />
          <div className="ie-skel" style={{ height: 42 }} />
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[60, 45, 70].map((w, i) => (
            <div key={i} className="ie-skel" style={{ height: 18, width: w }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[50, 55, 45].map((w, i) => (
            <div key={i} className="ie-skel" style={{ height: 14, width: w }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── INDUSTRY CARD ─────────────────────────────────────────────────────────────
function IndustryCard({
  ind, rank, personalized, activeTag, onTagClick, onNavigate,
}: {
  ind: Industry;
  rank: number;
  personalized: boolean;
  activeTag: string;
  onTagClick: (t: string) => void;
  onNavigate: (slug: string) => void;
}) {
  const isTop = rank <= 3;
  const growth = parseGrowth(ind.growth);

  return (
    <div
      className={`ie-card${ind.comingSoon ? " coming" : ""}`}
      style={{ animationDelay: `${rank * 0.04}s` }}
      onClick={() => !ind.comingSoon && onNavigate(ind.slug)}
    >
      {/* color bar */}
      <div className="ie-card-bar" style={{ background: ind.color }} />

      {/* rank */}
      <div className={`ie-rank${isTop ? " top" : ""}`}>
        {isTop ? `#${rank} Best Fit` : `#${rank}`}
      </div>

      {/* top */}
      <div className="ie-card-top">
        <div className="ie-emoji">{ind.emoji}</div>
        <div style={{ flex: 1, paddingRight: 48 }}>
          <div className="ie-card-name">{ind.name}</div>
          <div className="ie-card-desc">{ind.description}</div>
        </div>
      </div>

      {/* why for you */}
      {ind.whyForYou && personalized && (
        <div className="ie-why">
          <Sparkles size={10} className="ie-why-icon" />
          <span>{ind.whyForYou}</span>
        </div>
      )}

      {/* stats */}
      <div className="ie-stats">
        <div className="ie-stat" style={{ "--stat-color": ind.color } as any}>
          <div className="ie-stat-label">Market Size</div>
          <div className="ie-stat-val" style={{ color: ind.color }}>{ind.marketSize}</div>
        </div>
        <div className="ie-stat" style={{ "--stat-color": "#22C55E" } as any}>
          <div className="ie-stat-label">YoY Growth</div>
          <div className="ie-stat-val" style={{ color: growth >= 20 ? "#22C55E" : growth >= 10 ? "#88C070" : "#888" }}>
            {ind.growth}
          </div>
        </div>
      </div>

      {/* levels */}
      <div className="ie-levels">
        {ind.levels.map(l => (
          <span key={l} className="ie-level" style={{
            color: ind.color, borderColor: `${ind.color}44`, background: `${ind.color}10`,
          }}>
            {l}
          </span>
        ))}
      </div>

      {/* tags — clicking filters */}
      <div className="ie-tags">
        {ind.tags.map(t => (
          <span
            key={t}
            className={`ie-tag${activeTag === t ? " tag-active" : ""}`}
            onClick={e => { e.stopPropagation(); onTagClick(t); }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* cta */}
      {!ind.comingSoon && (
        <div className="ie-cta-row">
          <div className="ie-cta-label" style={{ color: ind.color }}>
            Deep Dive <ArrowUpRight size={11} />
          </div>
          <div className="ie-roadmap-hint">
            <BarChart2 size={9} /> Roadmap ready
          </div>
        </div>
      )}
      {ind.comingSoon && (
        <div style={{ fontSize: 9, color: "#2A2A2A", letterSpacing: "0.1em", textTransform: "uppercase", paddingTop: 10 }}>
          Coming Soon
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function IndustryExplorer() {
  const navigate = useNavigate();

  const [industries,   setIndustries]   = useState<Industry[]>([]);
  const [snap,         setSnap]         = useState<AssessmentSnap | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [generating,   setGenerating]   = useState(false);
  const [personalized, setPersonalized] = useState(false);
  const [error,        setError]        = useState("");
  const [refreshing,   setRefreshing]   = useState(false);
  const [genStep,      setGenStep]      = useState(0); // 0–3 for step animation
  const [generatedAt,  setGeneratedAt]  = useState<string>("");

  const [query,     setQuery]     = useState("");
  const [sortKey,   setSortKey]   = useState<SortKey>("default");
  const [activeTag, setActiveTag] = useState("");

  // ── fetch assessment snapshot for profile strip
  useEffect(() => {
    fetch(`${API}/dashboard/data/`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.assessment) {
          setSnap({
            domain:           d.assessment.domain,
            business_level:   d.assessment.business_level,
            capability_score: d.assessment.capability_score,
            tier:             d.assessment.tier ?? "metro",
            skills:           Array.isArray(d.assessment.skills) ? d.assessment.skills : [],
          });
        }
      })
      .catch(() => {});
  }, []);

  // ── animate gen steps while generating
  useEffect(() => {
    if (!generating) { setGenStep(0); return; }
    const steps = [800, 1800, 3200];
    const timers = steps.map((ms, i) =>
      setTimeout(() => setGenStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [generating]);

  const fetchIndustries = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        setIndustries([]);
        setGeneratedAt("");
        await fetch(`${API}/industries/refresh/`, { credentials: "include" });
      }

      const res  = await fetch(`${API}/industries/personalized/`, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Failed to load."); return; }

      setPersonalized(data.personalized);

      if (data.generating) {
        setGenerating(true);
        setIndustries([]);
      } else {
        setGenerating(false);
        setIndustries(data.industries ?? []);
        setGeneratedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchIndustries(); }, []);

  // poll while generating
  useEffect(() => {
    if (!generating) return;
    const t = setTimeout(() => fetchIndustries(), 6000);
    return () => clearTimeout(t);
  }, [generating, industries]);

  // ── all unique tags across loaded industries
  const allTags = useMemo(() => {
    const set = new Set<string>();
    industries.forEach(ind => ind.tags?.forEach(t => set.add(t)));
    return Array.from(set).slice(0, 12);
  }, [industries]);

  // ── filtered + sorted
  const filtered = useMemo(() => {
    let list = industries.filter(ind => {
      const q = query.toLowerCase();
      const matchesQ = !q
        || ind.name.toLowerCase().includes(q)
        || ind.description.toLowerCase().includes(q)
        || ind.tags.some(t => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || ind.tags.includes(activeTag);
      return matchesQ && matchesTag;
    });

    if (sortKey === "growth") {
      list = [...list].sort((a, b) => parseGrowth(b.growth) - parseGrowth(a.growth));
    } else if (sortKey === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    // "default" = AI order (as returned)

    return list;
  }, [industries, query, activeTag, sortKey]);

  const hasFilters = !!query || !!activeTag || sortKey !== "default";

  return (
    <>
      <style>{css}</style>
      <div className="ie">

        {/* ── HEADER ── */}
        <div className="ie-head">
          <div className="ie-head-row">
            <div>
              <div className="ie-eyebrow">
                <div className="ie-eyebrow-dot" />
                Module 01 · Phase 1 · Discovery
              </div>
              <div className="ie-title">Industry <em>Explorer</em></div>
              <div className="ie-subtitle">
                {personalized
                  ? "AI-ranked industries matched to your domain, skills, capital & location"
                  : "Top Indian industries — take your assessment for a personalised ranking"}
              </div>
              <div className="ie-badges">
                {!loading && (
                  <div className={`ie-badge ${personalized ? "ie-badge-personal" : "ie-badge-global"}`}>
                    {personalized
                      ? <><Sparkles size={10} /> Personalised for you</>
                      : <><MapPin size={10} /> Global trending</>}
                  </div>
                )}
                {!loading && industries.length > 0 && (
                  <div className="ie-badge ie-badge-count">
                    {filtered.length} / {industries.length} industries
                  </div>
                )}
                {generatedAt && (
                  <div className="ie-badge ie-badge-count">
                    <Clock size={9} /> {generatedAt}
                  </div>
                )}
              </div>
            </div>

            <div className="ie-head-right">
              <button
                className="ie-refresh"
                onClick={() => fetchIndustries(true)}
                disabled={refreshing || loading || generating}
                title="Regenerate with Groq"
              >
                <RefreshCw size={11} className={refreshing ? "ie-spin" : ""} />
                {refreshing ? "Refreshing…" : "Regenerate"}
              </button>
            </div>
          </div>
        </div>

        {/* ── PROFILE CONTEXT STRIP ── */}
        <ProfileStrip snap={snap} onAssess={() => navigate("/assessment")} />

        {/* ── CONTROLS ── */}
        {industries.length > 0 && (
          <>
            <div className="ie-controls">
              {/* search */}
              <div className="ie-search">
                <Search size={13} color="#444" />
                <input
                  placeholder="Search by name, description or tag…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <div className="ie-search-clear" onClick={() => setQuery("")}>
                    <X size={12} />
                  </div>
                )}
              </div>

              {/* sort */}
              <div className="ie-sort">
                <div style={{ padding: "10px 12px", borderRight: "1px solid #141414", display: "flex", alignItems: "center", gap: 5 }}>
                  <Filter size={10} color="#333" />
                  <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>Sort</span>
                </div>
                {(["default", "growth", "name"] as SortKey[]).map(k => (
                  <button
                    key={k}
                    className={`ie-sort-btn${sortKey === k ? " active" : ""}`}
                    onClick={() => setSortKey(k)}
                  >
                    {k === "default" ? "Best Fit" : k === "growth" ? "Growth ↓" : "A–Z"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TAG FILTERS ── */}
            {allTags.length > 0 && (
              <div className="ie-tag-bar">
                <span className="ie-tag-bar-label">Filter</span>
                {allTags.map(t => (
                  <button
                    key={t}
                    className={`ie-tag-filter${activeTag === t ? " active" : ""}`}
                    onClick={() => setActiveTag(activeTag === t ? "" : t)}
                  >
                    {t}
                  </button>
                ))}
                {activeTag && (
                  <button className="ie-tag-clear" onClick={() => setActiveTag("")}>
                    <X size={9} /> Clear
                  </button>
                )}
              </div>
            )}

            {/* results meta */}
            <div className="ie-results-meta">
              <div className="ie-results-count">
                Showing <span>{filtered.length}</span> of <span>{industries.length}</span> industries
                {hasFilters && " (filtered)"}
              </div>
              {personalized && snap && (
                <div className="ie-gen-time">
                  Ranked for {snap.domain} · {snap.business_level}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── GRID ── */}
        <div className="ie-grid">

          {/* Error */}
          {error && (
            <div className="ie-error">
              <div className="ie-error-title">Error</div>
              <div className="ie-error-sub">{error}</div>
            </div>
          )}

          {/* Skeletons */}
          {loading && !error && Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 0.06} />
          ))}

          {/* Generating */}
          {!loading && generating && (
            <div className="ie-gen-state">
              <div className="ie-gen-ring" />
              <div className="ie-gen-title">Curating Your Industries…</div>
              <div className="ie-gen-sub">
                Groq is analysing your assessment profile and mapping the best-fit
                industries to your domain, location, skills and capital.
              </div>
              <div className="ie-gen-steps">
                {[
                  "Reading assessment profile",
                  "Mapping domain adjacencies",
                  "Scoring by capital & skill fit",
                  "Ranking & writing insights",
                ].map((s, i) => (
                  <div key={i} className={`ie-gen-step${genStep > i ? " done" : ""}`}>
                    <div className="ie-gen-step-dot" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No assessment */}
          {!loading && !generating && !error && !personalized && industries.length === 0 && (
            <div className="ie-empty">
              <div className="ie-empty-icon">🎯</div>
              <div className="ie-empty-title">No Assessment Yet</div>
              <div className="ie-empty-sub">
                Your assessment tells us your domain, skills, capital and location —
                we use all of it to rank industries specifically for you.
              </div>
              <button className="ie-empty-btn" onClick={() => navigate("/assessment")}>
                Take Assessment →
              </button>
            </div>
          )}

          {/* No results after filter */}
          {!loading && !generating && !error && industries.length > 0 && filtered.length === 0 && (
            <div className="ie-no-results">
              <strong>No Match</strong>
              No industries match "{query || activeTag}" — try a different filter.
            </div>
          )}

          {/* Cards */}
          {!loading && !generating && filtered.map((ind, i) => (
            <IndustryCard
              key={ind.slug}
              ind={ind}
              rank={i + 1}
              personalized={personalized}
              activeTag={activeTag}
              onTagClick={t => setActiveTag(activeTag === t ? "" : t)}
              onNavigate={slug => navigate(`/explore/${slug}`)}
            />
          ))}

        </div>
      </div>
    </>
  );
}