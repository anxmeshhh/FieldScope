import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ArrowRight, Zap, Brain, TrendingUp, Shield, Target, Star, ChevronRight } from "lucide-react";

const features = [
  { icon: Zap, title: "Industry Explorer", desc: "Browse 15+ industries with full level breakdowns", phase: 1, num: "01" },
  { icon: Target, title: "Capability Assessment", desc: "AI evaluates your current business level accurately", phase: 1, num: "02" },
  { icon: Brain, title: "AI Recommendations", desc: "Know exactly what to offer, try, or avoid", phase: 1, num: "03" },
  { icon: TrendingUp, title: "Growth Roadmap", desc: "6/12/24-month personalized AI-generated plan", phase: 1, num: "04" },
  { icon: Shield, title: "Risk Radar", desc: "AI-powered warnings before you make costly mistakes", phase: 2, num: "05" },
  { icon: Star, title: "Market Intelligence", desc: "Live trends, heatmaps & pricing benchmarks", phase: 2, num: "06" },
];

const stats = [
  { val: "15+", label: "Industries" },
  { val: "3", label: "Business Levels" },
  { val: "16", label: "AI Features" },
  { val: "₹50L+", label: "Revenue Mapped" },
];

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

  :root {
    --orange: #E85D04;
    --orange-bright: #FF6B1A;
    --orange-dim: rgba(232,93,4,0.12);
    --bg: #080808;
    --card: #0F0F0F;
    --card2: #141414;
    --border: #1C1C1C;
    --text: #F2F2F2;
    --muted: #555;
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    cursor: none;
    overflow-x: hidden;
  }

  /* ─── CUSTOM CURSOR ─── */
  #cursor-dot {
    position: fixed; z-index: 9999;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--orange);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: width 0.15s, height 0.15s, opacity 0.15s;
    box-shadow: 0 0 12px var(--orange), 0 0 24px rgba(232,93,4,0.4);
  }

  #cursor-ring {
    position: fixed; z-index: 9998;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid rgba(232,93,4,0.4);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: transform 0.08s linear, width 0.2s, height 0.2s, border-color 0.2s;
  }

  body:has(button:hover) #cursor-dot,
  body:has(a:hover) #cursor-dot { width: 14px; height: 14px; }

  body:has(button:hover) #cursor-ring,
  body:has(a:hover) #cursor-ring {
    width: 56px; height: 56px;
    border-color: rgba(232,93,4,0.7);
  }

  /* ─── NAV ─── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 56px;
    background: rgba(8,8,8,0.7);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(28,28,28,0.8);
    transition: padding 0.3s;
  }

  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 0.1em;
    color: var(--text);
  }

  .nav-logo-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.12);
    border: 1px solid rgba(232,93,4,0.25);
    box-shadow: 0 0 20px rgba(232,93,4,0.2);
    transition: box-shadow 0.3s;
  }

  .nav-logo:hover .nav-logo-icon {
    box-shadow: 0 0 30px rgba(232,93,4,0.45);
  }

  .nav-links { display: flex; align-items: center; gap: 36px; }

  .nav-link {
    font-size: 13px; font-weight: 400; letter-spacing: 0.04em;
    color: var(--muted);
    background: none; border: none; cursor: none;
    transition: color 0.2s;
    position: relative;
    font-family: 'DM Sans', sans-serif;
    padding: 4px 0;
  }

  .nav-link::after {
    content: '';
    position: absolute; bottom: -2px; left: 0;
    width: 0; height: 1px;
    background: var(--orange);
    transition: width 0.25s;
  }

  .nav-link:hover { color: var(--text); }
  .nav-link:hover::after { width: 100%; }

  .btn-orange {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 24px;
    background: var(--orange);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
    border: none; border-radius: 40px; cursor: none;
    transition: all 0.25s;
    box-shadow: 0 0 24px rgba(232,93,4,0.3);
    position: relative; overflow: hidden;
  }

  .btn-orange::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0; transition: opacity 0.25s;
  }

  .btn-orange:hover {
    background: var(--orange-bright);
    box-shadow: 0 0 40px rgba(232,93,4,0.55), 0 8px 32px rgba(232,93,4,0.3);
    transform: translateY(-1px);
  }

  .btn-orange:hover::before { opacity: 1; }

  /* ─── HERO ─── */
  .hero {
    min-height: 100vh;
    display: flex; align-items: flex-end;
    padding: 140px 56px 90px;
    position: relative; overflow: hidden;
  }

  /* Main gradient bloom */
  .hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background: #080808;
  }

  .hero-bloom-1 {
    position: absolute; z-index: 0;
    top: -10%; left: -5%;
    width: 70vw; height: 70vh;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(200,60,0,0.35) 0%, rgba(140,30,0,0.15) 40%, transparent 70%);
    filter: blur(40px);
    animation: bloom-breathe 8s ease-in-out infinite;
  }

  .hero-bloom-2 {
    position: absolute; z-index: 0;
    top: 10%; right: -10%;
    width: 40vw; height: 50vh;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(100,20,0,0.2) 0%, transparent 70%);
    filter: blur(60px);
    animation: bloom-breathe 12s ease-in-out infinite reverse;
  }

  @keyframes bloom-breathe {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 1; }
    50% { transform: scale(1.08) translate(2%, 2%); opacity: 0.8; }
  }

  /* Diagonal stripe texture */
  .hero-texture {
    position: absolute; inset: 0; z-index: 1;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(232,93,4,0.015) 40px,
      rgba(232,93,4,0.015) 41px
    );
  }

  /* Noise overlay */
  .hero-noise {
    position: absolute; inset: 0; z-index: 2;
    opacity: 0.35; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* Scan lines */
  .hero-scanlines {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
  }

  .hero-overlay {
    position: absolute; bottom: 0; left: 0; right: 0; height: 55%; z-index: 3;
    background: linear-gradient(to top, var(--bg) 0%, rgba(8,8,8,0.6) 60%, transparent 100%);
  }

  .hero-content { position: relative; z-index: 4; max-width: 1240px; width: 100%; }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 18px;
    background: rgba(232,93,4,0.1);
    border: 1px solid rgba(232,93,4,0.35);
    border-radius: 40px;
    font-size: 11px; font-weight: 700;
    color: var(--orange-bright);
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 36px;
    animation: badge-in 0.8s ease both;
    backdrop-filter: blur(8px);
  }

  @keyframes badge-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-tag-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--orange);
    box-shadow: 0 0 8px var(--orange);
    animation: pulse-dot 2s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px var(--orange); }
    50% { opacity: 0.6; transform: scale(0.7); box-shadow: 0 0 4px var(--orange); }
  }

  .hero-eyebrow {
    font-size: 20px; font-weight: 300; font-style: italic;
    color: rgba(242,242,242,0.45);
    margin-bottom: 10px;
    animation: fade-up 0.8s 0.1s ease both;
  }

  .hero-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(80px, 11vw, 150px);
    line-height: 0.88; letter-spacing: 0.01em;
    color: var(--text);
    animation: fade-up 0.8s 0.2s ease both;
    position: relative;
  }

  .hero-h1 .orange { color: var(--orange); position: relative; }

  /* Underline shimmer on orange word */
  .hero-h1 .orange::after {
    content: '';
    position: absolute; bottom: 6px; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--orange), var(--orange-bright), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-bottom {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-top: 48px; gap: 48px;
    animation: fade-up 0.8s 0.35s ease both;
  }

  .hero-desc {
    max-width: 400px; font-size: 15px; line-height: 1.8;
    color: rgba(242,242,242,0.5); font-weight: 300;
  }

  .hero-desc strong { color: rgba(242,242,242,0.9); font-weight: 600; }

  .hero-actions { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px;
    background: rgba(255,255,255,0.03);
    color: rgba(242,242,242,0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 40px; cursor: none;
    transition: all 0.25s;
    backdrop-filter: blur(8px);
  }

  .btn-ghost:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.2);
    color: var(--text);
    transform: translateY(-1px);
  }

  /* ─── STATS BAR ─── */
  .stats-bar {
    display: flex; align-items: center; gap: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    position: relative; overflow: hidden;
  }

  .stats-bar::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.4), transparent);
  }

  .stats-bar-label {
    padding: 28px 56px;
    font-size: 11px; font-weight: 600;
    color: #333; letter-spacing: 0.1em; text-transform: uppercase;
    border-right: 1px solid var(--border);
    white-space: nowrap; flex-shrink: 0;
  }

  .stats-items { display: flex; flex: 1; }

  .stat-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 24px 16px;
    border-right: 1px solid var(--border);
    position: relative; overflow: hidden;
    transition: background 0.3s;
    cursor: default;
  }

  .stat-item:last-child { border-right: none; }

  .stat-item::before {
    content: '';
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 0; height: 2px;
    background: var(--orange);
    transition: width 0.35s;
  }

  .stat-item:hover { background: rgba(232,93,4,0.04); }
  .stat-item:hover::before { width: 80%; }

  .stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 38px; line-height: 1; color: var(--text);
    transition: color 0.2s;
  }

  .stat-val span { color: var(--orange); }
  .stat-item:hover .stat-val { color: var(--orange-bright); }

  .stat-label {
    font-size: 10px; color: #333; margin-top: 5px;
    letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
  }

  /* ─── FEATURES ─── */
  .features-section {
    padding: 120px 56px;
    max-width: 1300px; margin: 0 auto;
  }

  .section-eyebrow {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 16px;
  }

  .section-eyebrow-line {
    width: 32px; height: 1px;
    background: var(--orange);
  }

  .section-eyebrow-text {
    font-size: 11px; font-weight: 700;
    color: var(--orange); letter-spacing: 0.14em; text-transform: uppercase;
  }

  .section-h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 6vw, 84px);
    color: var(--text); line-height: 0.92; letter-spacing: 0.02em;
    margin-bottom: 72px;
  }

  .section-h2 span { color: var(--orange); }

  /* Features grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--border);
    position: relative;
  }

  .feature-card {
    background: var(--card);
    padding: 40px 36px;
    cursor: none;
    position: relative; overflow: hidden;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    transition: background 0.3s;
  }

  .feature-card:nth-child(3n) { border-right: none; }
  .feature-card:nth-child(4),
  .feature-card:nth-child(5),
  .feature-card:nth-child(6) { border-bottom: none; }

  /* Card spotlight effect on hover */
  .feature-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(232,93,4,0.07), transparent 60%);
    opacity: 0; transition: opacity 0.4s;
    pointer-events: none;
  }

  .feature-card:hover::before { opacity: 1; }

  /* Top border reveal */
  .feature-card::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--orange), transparent);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .feature-card:hover::after { transform: scaleX(1); }
  .feature-card:hover { background: var(--card2); }

  .feature-phase {
    position: absolute; top: 20px; right: 20px;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #2A2A2A;
    background: #141414;
    border: 1px solid #1C1C1C;
    padding: 3px 9px; border-radius: 20px;
    transition: color 0.2s, border-color 0.2s;
  }

  .feature-card:hover .feature-phase {
    color: rgba(232,93,4,0.6);
    border-color: rgba(232,93,4,0.2);
  }

  .feature-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 12px; letter-spacing: 0.14em;
    color: #2A2A2A; margin-bottom: 28px;
    transition: color 0.25s;
  }

  .feature-num span { color: rgba(232,93,4,0.5); }
  .feature-card:hover .feature-num { color: rgba(232,93,4,0.7); }

  .feature-icon {
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.08);
    border: 1px solid rgba(232,93,4,0.15);
    border-radius: 14px;
    margin-bottom: 24px;
    transition: all 0.3s;
    position: relative;
  }

  .feature-icon::after {
    content: '';
    position: absolute; inset: -4px; border-radius: 18px;
    background: radial-gradient(circle, rgba(232,93,4,0.15), transparent);
    opacity: 0; transition: opacity 0.3s;
  }

  .feature-card:hover .feature-icon {
    background: rgba(232,93,4,0.15);
    border-color: rgba(232,93,4,0.35);
    box-shadow: 0 0 24px rgba(232,93,4,0.2);
    transform: scale(1.05);
  }

  .feature-card:hover .feature-icon::after { opacity: 1; }

  .feature-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; color: var(--text); line-height: 1;
    margin-bottom: 12px; letter-spacing: 0.02em;
    transition: color 0.2s;
  }

  .feature-card:hover .feature-title { color: #fff; }

  .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.7; font-weight: 300; }

  /* Arrow that appears on hover */
  .feature-arrow {
    position: absolute; bottom: 24px; right: 28px;
    opacity: 0; transform: translate(-8px, 8px);
    transition: all 0.3s;
    color: var(--orange);
  }

  .feature-card:hover .feature-arrow { opacity: 1; transform: translate(0, 0); }

  /* ─── MARQUEE ─── */
  .marquee-section {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 20px 0; overflow: hidden;
    position: relative;
  }

  .marquee-track {
    display: flex; gap: 0;
    animation: marquee 20s linear infinite;
    width: max-content;
  }

  .marquee-item {
    display: flex; align-items: center; gap: 16px;
    padding: 8px 48px;
    border-right: 1px solid var(--border);
    white-space: nowrap;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px; letter-spacing: 0.12em;
    color: #2A2A2A;
  }

  .marquee-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--orange);
    box-shadow: 0 0 6px var(--orange);
  }

  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* ─── CTA ─── */
  .cta-section {
    padding: 100px 56px;
    display: flex; justify-content: center;
  }

  .cta-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 80px 72px;
    max-width: 960px; width: 100%;
    display: flex; align-items: center;
    justify-content: space-between; gap: 60px;
    position: relative; overflow: hidden;
  }

  /* Left accent */
  .cta-box::before {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 3px; height: 100%;
    background: linear-gradient(to bottom, transparent, var(--orange), transparent);
  }

  /* Background glow */
  .cta-box::after {
    content: '';
    position: absolute; top: 50%; left: -10%;
    transform: translateY(-50%);
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,93,4,0.08), transparent 70%);
    pointer-events: none;
  }

  .cta-left { position: relative; z-index: 1; }

  .cta-h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 5vw, 68px);
    line-height: 0.92; color: var(--text); letter-spacing: 0.02em;
  }

  .cta-h2 span { color: var(--orange); }

  .cta-h2-sub {
    font-size: 14px; color: #333; margin-top: 16px;
    font-weight: 300; line-height: 1.6; max-width: 300px;
  }

  .cta-right { flex-shrink: 0; position: relative; z-index: 1; }

  /* Pulsing ring around CTA button */
  .cta-btn-wrap { position: relative; display: inline-block; }

  .cta-btn-ring {
    position: absolute; inset: -8px; border-radius: 50px;
    border: 1px solid rgba(232,93,4,0.25);
    animation: ring-pulse 2.5s ease-in-out infinite;
  }

  .cta-btn-ring-2 {
    position: absolute; inset: -16px; border-radius: 56px;
    border: 1px solid rgba(232,93,4,0.12);
    animation: ring-pulse 2.5s 0.4s ease-in-out infinite;
  }

  @keyframes ring-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.04); }
  }

  .cta-btn-large {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 18px 40px;
    background: var(--orange);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: 0.04em;
    border: none; border-radius: 50px; cursor: none;
    transition: all 0.25s;
    box-shadow: 0 0 40px rgba(232,93,4,0.35);
    position: relative; overflow: hidden;
  }

  .cta-btn-large::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0; transition: opacity 0.25s;
  }

  .cta-btn-large:hover {
    background: var(--orange-bright);
    box-shadow: 0 0 60px rgba(232,93,4,0.6), 0 12px 40px rgba(232,93,4,0.35);
    transform: translateY(-2px);
  }

  .cta-btn-large:hover::before { opacity: 1; }

  /* ─── FOOTER ─── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 28px 56px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative;
  }

  .footer::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.3), transparent);
  }

  .footer-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 0.1em; color: var(--text);
  }

  .footer-logo span { color: var(--orange); }

  .footer-copy { font-size: 11px; color: #2A2A2A; letter-spacing: 0.04em; }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 1024px) {
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .feature-card:nth-child(3n) { border-right: 1px solid var(--border); }
    .feature-card:nth-child(2n) { border-right: none; }
    .feature-card:nth-child(5),
    .feature-card:nth-child(6) { border-bottom: none; }
    .feature-card:nth-child(4) { border-bottom: 1px solid var(--border); }
  }

  @media (max-width: 768px) {
    .nav { padding: 16px 24px; }
    .hero { padding: 110px 24px 70px; }
    .hero-h1 { font-size: 72px; }
    .hero-bottom { flex-direction: column; align-items: flex-start; gap: 28px; }
    .stats-bar { flex-direction: column; }
    .stats-bar-label { border-right: none; border-bottom: 1px solid var(--border); width: 100%; }
    .stats-items { flex-wrap: wrap; width: 100%; }
    .stat-item { flex: 1 1 50%; border-bottom: 1px solid var(--border); }
    .features-section { padding: 70px 24px; }
    .features-grid { grid-template-columns: 1fr; }
    .feature-card { border-right: none !important; }
    .feature-card:last-child { border-bottom: none; }
    .cta-section { padding: 60px 24px; }
    .cta-box { flex-direction: column; padding: 48px 32px; gap: 40px; }
    .footer { padding: 24px; flex-direction: column; gap: 12px; text-align: center; }
  }

  /* ─── SCROLL REVEAL ─── */
  .reveal {
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .reveal.visible { opacity: 1; transform: translateY(0); }

  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
`;

const marqueeItems = [
  "Industry Intelligence", "AI Assessment", "Growth Roadmap",
  "Risk Radar", "Market Trends", "Revenue Mapping",
  "Capability Scores", "Business Levels", "₹50L+ Potential",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      if (cursorDot.current) {
        cursorDot.current.style.left = x + "px";
        cursorDot.current.style.top = y + "px";
      }
      // Smooth ring follow
      const dx = x - ringPos.current.x;
      const dy = y - ringPos.current.y;
      ringPos.current.x += dx * 0.12;
      ringPos.current.y += dy * 0.12;
    };

    const raf = () => {
      if (cursorRing.current) {
        cursorRing.current.style.left = ringPos.current.x + "px";
        cursorRing.current.style.top = ringPos.current.y + "px";
      }
      requestAnimationFrame(raf);
    };

    window.addEventListener("mousemove", onMove);
    requestAnimationFrame(raf);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Card spotlight effect
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".feature-card");
    const onMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    };
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => onMouseMove(e as MouseEvent, card));
    });
    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", (e) => onMouseMove(e as MouseEvent, card));
      });
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{style}</style>

      {/* Custom cursor */}
      <div id="cursor-dot" ref={cursorDot} />
      <div id="cursor-ring" ref={cursorRing} />

      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <Zap size={14} color="#E85D04" />
            </div>
            &nbsp;FieldScope
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/explore")}>Explore</button>
            <button className="nav-link" onClick={() => navigate("/login")}>Sign In</button>
            <button className="btn-orange" onClick={() => navigate("/signup")}>
              Get Started <ArrowRight size={13} />
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-bloom-1" />
          <div className="hero-bloom-2" />
          <div className="hero-texture" />
          <div className="hero-noise" />
          <div className="hero-scanlines" />
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-tag-dot" />
              India's First AI Business Intelligence Platform
            </div>

            <div className="hero-eyebrow">Hey, you're a</div>
            <h1 className="hero-h1">
              Business<br />
              <span className="orange">Builder.</span>
            </h1>

            <div className="hero-bottom">
              <p className="hero-desc">
                <strong>Know what you can build. Know how to grow.</strong><br />
                FieldScope maps your industry, assesses your capabilities with AI, and delivers a personalized growth strategy — built for Indian businesses.
              </p>
              <div className="hero-actions">
                <button className="btn-orange" onClick={() => navigate("/signup")}>
                  Free Assessment <ArrowRight size={14} />
                </button>
                <button className="btn-ghost" onClick={() => navigate("/explore")}>
                  Explore <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <div className="stats-bar reveal">
          <div className="stats-bar-label">Trusted by Indian Entrepreneurs</div>
          <div className="stats-items">
            {stats.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-val"><span>{s.val}</span></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MARQUEE */}
        <div className="marquee-section">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={i} className="marquee-item">
                <div className="marquee-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="features-section">
          <div className="section-eyebrow reveal">
            <div className="section-eyebrow-line" />
            <div className="section-eyebrow-text">Platform Modules</div>
          </div>
          <h2 className="section-h2 reveal reveal-delay-1">
            Everything You Need<br />
            to <span>Grow.</span>
          </h2>

          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}
                onClick={() => navigate("/signup")}
              >
                <div className="feature-phase">Phase {f.phase}</div>
                <div className="feature-num"><span>#</span>{f.num}</div>
                <div className="feature-icon">
                  <f.icon size={20} color="#E85D04" />
                </div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-arrow">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-box reveal">
            <div className="cta-left">
              <h2 className="cta-h2">
                Ready to discover<br />
                your <span>business</span><br />
                potential?
              </h2>
              <p className="cta-h2-sub">
                Join thousands of Indian entrepreneurs who know exactly where they stand — and where they're headed.
              </p>
            </div>
            <div className="cta-right">
              <div className="cta-btn-wrap">
                <div className="cta-btn-ring" />
                <div className="cta-btn-ring-2" />
                <button className="cta-btn-large" onClick={() => navigate("/signup")}>
                  Take Free Assessment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">Field<span>Scope</span></div>
          <div className="footer-copy">"Know What You Can Build. Know How to Grow." · v1.0</div>
        </footer>

      </div>
    </>
  );
}