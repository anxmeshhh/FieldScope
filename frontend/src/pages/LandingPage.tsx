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

const marqueeItems = [
  "Industry Intelligence", "AI Assessment", "Growth Roadmap",
  "Risk Radar", "Market Trends", "Revenue Mapping",
  "Capability Scores", "Business Levels", "₹50L+ Potential",
];

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');

  :root {
    --blue:        #1558F6;
    --blue-dark:   #0D3FBF;
    --blue-light:  #4A7FFF;
    --cyan:        #00C2FF;
    --cyan-dim:    rgba(0,194,255,0.15);
    --indigo:      #3B4CF8;

    --bg:          #F0F4FF;
    --bg2:         #E6ECFF;
    --surface:     #FFFFFF;
    --surface2:    #F7F9FF;
    --border:      #D4DCFF;
    --border2:     #C2CCFF;

    --text:        #0A1440;
    --text2:       #2040A0;
    --muted:       #5870B0;
    --muted2:      #8090C0;

    --hero-bg:     #0C1A6E;
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    cursor: none;
    overflow-x: hidden;
  }

  /* ─── CURSOR ─── */
  #cursor-dot {
    position: fixed; z-index: 9999;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--cyan);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: width 0.15s, height 0.15s;
    box-shadow: 0 0 10px var(--cyan), 0 0 22px rgba(0,194,255,0.6);
  }

  #cursor-ring {
    position: fixed; z-index: 9998;
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid rgba(21,88,246,0.5);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: width 0.2s, height 0.2s, border-color 0.2s;
  }

  body:has(button:hover) #cursor-dot,
  body:has(a:hover) #cursor-dot { width: 12px; height: 12px; }
  body:has(button:hover) #cursor-ring,
  body:has(a:hover) #cursor-ring { width: 48px; height: 48px; border-color: var(--blue); }

  /* ─── NAV ─── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 56px; height: 66px;
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 0 rgba(21,88,246,0.08), 0 4px 24px rgba(21,88,246,0.06);
  }

  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 19px; font-weight: 800; letter-spacing: 0.01em;
    color: var(--text);
  }

  .nav-logo-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: var(--blue);
    box-shadow: 0 4px 12px rgba(21,88,246,0.35);
    transition: all 0.3s;
  }

  .nav-logo:hover .nav-logo-icon {
    transform: rotate(-8deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(21,88,246,0.5);
  }

  .nav-links { display: flex; align-items: center; gap: 32px; }

  .nav-link {
    font-size: 14px; font-weight: 500;
    color: var(--muted);
    background: none; border: none; cursor: none;
    transition: color 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative; padding: 4px 0;
  }

  .nav-link::after {
    content: ''; position: absolute; bottom: -1px; left: 0;
    width: 0; height: 2px;
    background: var(--blue); border-radius: 2px;
    transition: width 0.25s;
  }

  .nav-link:hover { color: var(--blue); }
  .nav-link:hover::after { width: 100%; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 22px;
    background: var(--blue);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    border: none; border-radius: 8px; cursor: none;
    transition: all 0.25s;
    box-shadow: 0 4px 16px rgba(21,88,246,0.35);
  }

  .btn-primary:hover {
    background: var(--blue-dark);
    box-shadow: 0 8px 28px rgba(21,88,246,0.5);
    transform: translateY(-1px);
  }

  /* ─── HERO ─── */
  .hero {
    min-height: 100vh;
    display: flex; align-items: flex-end;
    padding: 130px 56px 0;
    position: relative; overflow: hidden;
    background: var(--hero-bg);
  }

  .hero-bg-grad {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 90% 70% at 10% 0%, #1A3BAA 0%, transparent 55%),
      radial-gradient(ellipse 60% 60% at 95% 10%, #0a2080 0%, transparent 55%),
      radial-gradient(ellipse 70% 80% at 50% 100%, #050E40 0%, transparent 60%),
      #0C1A6E;
  }

  .hero-blob-1 {
    position: absolute; z-index: 1;
    top: -10%; right: 5%;
    width: 55vw; height: 55vw;
    border-radius: 50%;
    background: radial-gradient(circle,
      rgba(0,194,255,0.18) 0%,
      rgba(21,88,246,0.12) 40%,
      transparent 70%
    );
    filter: blur(32px);
    animation: blob-float 12s ease-in-out infinite;
  }

  .hero-blob-2 {
    position: absolute; z-index: 1;
    bottom: 0; left: 30%;
    width: 40vw; height: 40vw;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,76,248,0.25) 0%, transparent 65%);
    filter: blur(40px);
    animation: blob-float 16s ease-in-out infinite reverse;
  }

  @keyframes blob-float {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(2%, 3%) scale(1.05); }
    66% { transform: translate(-2%, 1%) scale(0.97); }
  }

  .hero-dots {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
    background-size: 36px 36px;
    mask-image: radial-gradient(ellipse 70% 80% at 60% 30%, black 20%, transparent 80%);
  }

  .hero-fade {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
    height: 220px;
    background: linear-gradient(to top, var(--bg) 0%, transparent 100%);
  }

  .hero-streak {
    position: absolute; z-index: 2;
    top: 0; right: 20%;
    width: 1px; height: 55%;
    background: linear-gradient(to bottom, transparent, rgba(0,194,255,0.6), transparent);
    transform: rotate(15deg) translateX(200px);
    animation: streak-glow 4s ease-in-out infinite;
  }

  .hero-streak-2 {
    position: absolute; z-index: 2;
    top: 10%; right: 35%;
    width: 1px; height: 40%;
    background: linear-gradient(to bottom, transparent, rgba(21,88,246,0.4), transparent);
    transform: rotate(15deg) translateX(120px);
    animation: streak-glow 6s 1s ease-in-out infinite;
  }

  @keyframes streak-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .hero-content { position: relative; z-index: 4; max-width: 1240px; width: 100%; padding-bottom: 100px; }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 6px 14px 6px 6px;
    background: rgba(0,194,255,0.1);
    border: 1px solid rgba(0,194,255,0.3);
    border-radius: 100px;
    font-size: 12px; font-weight: 600;
    color: rgba(200,235,255,0.9);
    letter-spacing: 0.06em;
    margin-bottom: 40px;
    animation: badge-in 0.7s ease both;
    backdrop-filter: blur(8px);
  }

  .badge-live {
    display: flex; align-items: center; gap: 5px;
    background: var(--cyan);
    color: #002040; font-size: 10px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 100px;
  }

  .badge-live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #003060;
    animation: live-pulse 1.5s ease-in-out infinite;
  }

  @keyframes live-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes badge-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-eyebrow {
    font-size: 16px; font-weight: 400; font-style: italic;
    color: rgba(180,210,255,0.55);
    margin-bottom: 10px;
    animation: fade-up 0.7s 0.1s ease both;
  }

  .hero-h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(76px, 10.5vw, 148px);
    line-height: 0.88; letter-spacing: -0.02em;
    color: #FFFFFF; font-weight: 800;
    animation: fade-up 0.7s 0.2s ease both;
  }

  .hero-h1 .accent {
    background: linear-gradient(135deg, var(--cyan) 0%, #74AAFF 50%, #A78BFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
  }

  .hero-h1 .accent::after {
    content: '';
    position: absolute; bottom: 4px; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--cyan), #74AAFF, var(--cyan));
    background-size: 200% 100%;
    border-radius: 2px;
    animation: underline-shimmer 2.5s linear infinite;
  }

  @keyframes underline-shimmer {
    0% { background-position: 0% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-bottom {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-top: 52px; gap: 48px;
    animation: fade-up 0.7s 0.32s ease both;
  }

  .hero-desc {
    max-width: 400px; font-size: 16px; line-height: 1.8;
    color: rgba(180,210,255,0.65); font-weight: 400;
    border-left: 2px solid rgba(0,194,255,0.3); padding-left: 20px;
  }

  .hero-desc strong { color: rgba(220,235,255,0.95); font-weight: 600; }

  .hero-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

  .btn-hero-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px;
    background: linear-gradient(135deg, var(--cyan) 0%, #74AAFF 100%);
    color: #001040;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 800;
    border: none; border-radius: 8px; cursor: none;
    transition: all 0.25s;
    box-shadow: 0 4px 24px rgba(0,194,255,0.45), 0 0 0 1px rgba(0,194,255,0.3);
  }

  .btn-hero-primary:hover {
    box-shadow: 0 8px 36px rgba(0,194,255,0.65), 0 0 0 1px rgba(0,194,255,0.5);
    transform: translateY(-2px);
    filter: brightness(1.05);
  }

  .btn-hero-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 13px 24px;
    background: rgba(255,255,255,0.06);
    color: rgba(200,225,255,0.85);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px; cursor: none;
    transition: all 0.25s;
    backdrop-filter: blur(8px);
  }

  .btn-hero-ghost:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(0,194,255,0.4);
    color: #fff;
    transform: translateY(-1px);
  }

  /* ─── STATS BAR ─── */
  .stats-bar {
    display: flex; align-items: stretch;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 4px 24px rgba(21,88,246,0.07);
    position: relative;
  }

  .stats-bar::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--blue) 0%, var(--cyan) 50%, var(--indigo) 100%);
  }

  .stats-bar-label {
    padding: 28px 56px;
    font-size: 11px; font-weight: 700;
    color: var(--muted2); letter-spacing: 0.12em; text-transform: uppercase;
    border-right: 1px solid var(--border);
    white-space: nowrap; flex-shrink: 0;
    display: flex; align-items: center;
  }

  .stats-items { display: flex; flex: 1; }

  .stat-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 28px 16px;
    border-right: 1px solid var(--border);
    position: relative; overflow: hidden;
    transition: background 0.3s;
    cursor: default;
  }

  .stat-item:last-child { border-right: none; }

  .stat-item::after {
    content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 0; height: 3px;
    background: linear-gradient(90deg, var(--blue), var(--cyan));
    border-radius: 2px 2px 0 0;
    transition: width 0.35s;
  }

  .stat-item:hover { background: var(--surface2); }
  .stat-item:hover::after { width: 60%; }

  .stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 38px; line-height: 1; font-weight: 800;
    color: var(--text); transition: color 0.2s;
  }

  .stat-val span { color: var(--blue); }
  .stat-item:hover .stat-val { color: var(--blue); }

  .stat-label {
    font-size: 10px; color: var(--muted2); margin-top: 6px;
    letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
  }

  /* ─── MARQUEE ─── */
  .marquee-section {
    background: var(--blue);
    padding: 14px 0; overflow: hidden;
  }

  .marquee-track {
    display: flex;
    animation: marquee 22s linear infinite;
    width: max-content;
  }

  .marquee-item {
    display: flex; align-items: center; gap: 14px;
    padding: 4px 44px;
    border-right: 1px solid rgba(255,255,255,0.15);
    white-space: nowrap;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    color: rgba(255,255,255,0.75);
    letter-spacing: 0.14em; text-transform: uppercase;
  }

  .marquee-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
  }

  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* ─── FEATURES ─── */
  .features-section {
    padding: 110px 56px;
    max-width: 1300px; margin: 0 auto;
  }

  .section-tag {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
    background: rgba(21,88,246,0.08);
    border: 1px solid rgba(21,88,246,0.18);
    padding: 5px 14px; border-radius: 100px;
  }

  .section-tag-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--blue);
  }

  .section-tag-text {
    font-size: 11px; font-weight: 700;
    color: var(--blue); letter-spacing: 0.12em; text-transform: uppercase;
  }

  .section-h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(44px, 5.5vw, 80px);
    color: var(--text); line-height: 0.94; letter-spacing: -0.02em;
    font-weight: 800; margin-bottom: 64px;
  }

  .section-h2 span {
    background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .feature-card {
    background: var(--surface);
    padding: 36px 30px 32px;
    cursor: none;
    position: relative; overflow: hidden;
    border-radius: 12px;
    border: 1px solid var(--border);
    transition: all 0.3s;
    box-shadow: 0 2px 12px rgba(21,88,246,0.05);
  }

  .feature-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--blue) 0%, var(--cyan) 100%);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px 12px 0 0;
  }

  .feature-card::after {
    content: '';
    position: absolute; inset: 0; border-radius: 12px;
    background: radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(21,88,246,0.05), transparent 60%);
    opacity: 0; transition: opacity 0.4s;
    pointer-events: none;
  }

  .feature-card:hover::before { transform: scaleX(1); }
  .feature-card:hover::after { opacity: 1; }

  .feature-card:hover {
    border-color: rgba(21,88,246,0.3);
    box-shadow: 0 8px 32px rgba(21,88,246,0.12), 0 0 0 1px rgba(21,88,246,0.1);
    transform: translateY(-3px);
  }

  .feature-phase {
    position: absolute; top: 18px; right: 18px;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--muted2);
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 3px 9px; border-radius: 100px;
    transition: all 0.2s;
  }

  .feature-card:hover .feature-phase {
    color: var(--blue);
    background: rgba(21,88,246,0.06);
    border-color: rgba(21,88,246,0.25);
  }

  .feature-num {
    font-family: 'Syne', sans-serif;
    font-size: 11px; letter-spacing: 0.14em;
    color: var(--border2); margin-bottom: 20px;
    font-weight: 700; transition: color 0.25s;
  }

  .feature-num span { color: var(--blue-light); }
  .feature-card:hover .feature-num { color: var(--blue-light); }

  .feature-icon {
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(21,88,246,0.1) 0%, rgba(0,194,255,0.1) 100%);
    border: 1px solid rgba(21,88,246,0.18);
    border-radius: 12px;
    margin-bottom: 18px;
    transition: all 0.3s;
  }

  .feature-card:hover .feature-icon {
    background: linear-gradient(135deg, rgba(21,88,246,0.18) 0%, rgba(0,194,255,0.18) 100%);
    border-color: rgba(21,88,246,0.4);
    box-shadow: 0 4px 20px rgba(21,88,246,0.2);
    transform: scale(1.08) rotate(-3deg);
  }

  .feature-title {
    font-family: 'Syne', sans-serif;
    font-size: 21px; color: var(--text); line-height: 1.1;
    margin-bottom: 10px; letter-spacing: -0.01em; font-weight: 700;
    transition: color 0.2s;
  }

  .feature-card:hover .feature-title { color: var(--blue-dark); }

  .feature-desc { font-size: 13.5px; color: var(--muted); line-height: 1.75; }

  .feature-arrow {
    position: absolute; bottom: 22px; right: 24px;
    opacity: 0; transform: translate(-4px, 4px);
    transition: all 0.25s; color: var(--blue);
  }

  .feature-card:hover .feature-arrow { opacity: 1; transform: translate(0, 0); }

  /* ─── CTA ─── */
  .cta-section {
    padding: 80px 56px 110px;
    display: flex; justify-content: center;
  }

  .cta-box {
    background: var(--blue);
    border-radius: 20px;
    padding: 72px 80px;
    max-width: 1060px; width: 100%;
    display: flex; align-items: center;
    justify-content: space-between; gap: 60px;
    position: relative; overflow: hidden;
    box-shadow: 0 24px 80px rgba(21,88,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
  }

  .cta-blob-1 {
    position: absolute; top: -40%; left: -10%; z-index: 0;
    width: 60%; height: 180%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,194,255,0.25) 0%, transparent 65%);
    pointer-events: none;
  }

  .cta-blob-2 {
    position: absolute; bottom: -60%; right: -5%; z-index: 0;
    width: 55%; height: 170%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100,60,255,0.3) 0%, transparent 60%);
    pointer-events: none;
  }

  .cta-dots {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse 50% 80% at 80% 50%, black 0%, transparent 80%);
  }

  .cta-left { position: relative; z-index: 1; }

  .cta-h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 4vw, 58px);
    line-height: 0.96; color: #fff; letter-spacing: -0.02em; font-weight: 800;
  }

  .cta-h2 span {
    color: transparent;
    -webkit-text-stroke: 2px rgba(255,255,255,0.6);
  }

  .cta-sub {
    font-size: 15px; color: rgba(220,235,255,0.75); margin-top: 18px;
    font-weight: 400; line-height: 1.7; max-width: 340px;
  }

  .cta-right { flex-shrink: 0; position: relative; z-index: 1; }

  .cta-btn-wrap { position: relative; display: inline-block; }

  .cta-ring {
    position: absolute; inset: -10px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.2);
    animation: ring-pulse 2.5s ease-in-out infinite;
  }

  .cta-ring-2 {
    position: absolute; inset: -20px; border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.1);
    animation: ring-pulse 2.5s 0.5s ease-in-out infinite;
  }

  @keyframes ring-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; transform: scale(1.03); }
  }

  .cta-btn-large {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 36px;
    background: #fff;
    color: var(--blue-dark);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 800;
    border: none; border-radius: 10px; cursor: none;
    transition: all 0.25s;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  }

  .cta-btn-large:hover {
    background: #f0f6ff;
    box-shadow: 0 12px 44px rgba(0,0,0,0.3);
    transform: translateY(-2px);
  }

  /* ─── FOOTER ─── */
  .footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 28px 56px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .footer-logo {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    color: var(--text);
  }

  .footer-logo span { color: var(--blue); }

  .footer-copy { font-size: 12px; color: var(--muted2); }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 1024px) {
    .features-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .nav { padding: 0 20px; }
    .hero { padding: 110px 24px 0; }
    .hero-h1 { font-size: 62px; }
    .hero-bottom { flex-direction: column; align-items: flex-start; gap: 28px; }
    .stats-bar { flex-direction: column; }
    .stats-bar-label { border-right: none; border-bottom: 1px solid var(--border); }
    .stats-items { flex-wrap: wrap; width: 100%; }
    .stat-item { flex: 1 1 50%; border-bottom: 1px solid var(--border); }
    .features-section { padding: 70px 20px; }
    .features-grid { grid-template-columns: 1fr; gap: 14px; }
    .cta-section { padding: 60px 20px 80px; }
    .cta-box { flex-direction: column; padding: 44px 28px; gap: 36px; border-radius: 14px; }
    .footer { padding: 24px 20px; flex-direction: column; gap: 10px; text-align: center; }
  }

  /* ─── SCROLL REVEAL ─── */
  .reveal {
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }

  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.08s; }
  .reveal-delay-2 { transition-delay: 0.16s; }
  .reveal-delay-3 { transition-delay: 0.24s; }
`;

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

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".feature-card");
    const onMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width * 100) + "%");
      card.style.setProperty("--my", ((e.clientY - rect.top) / rect.height * 100) + "%");
    };
    cards.forEach((card) => card.addEventListener("mousemove", (e) => onMouseMove(e as MouseEvent, card)));
    return () => cards.forEach((card) => card.removeEventListener("mousemove", (e) => onMouseMove(e as MouseEvent, card)));
  }, []);

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
      <div id="cursor-dot" ref={cursorDot} />
      <div id="cursor-ring" ref={cursorRing} />

      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <Zap size={15} color="#fff" />
            </div>
            &nbsp;FieldScope
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/explore")}>Explore</button>
            <button className="nav-link" onClick={() => navigate("/login")}>Sign In</button>
            <button className="btn-primary" onClick={() => navigate("/signup")}>
              Get Started <ArrowRight size={13} />
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg-grad" />
          <div className="hero-blob-1" />
          <div className="hero-blob-2" />
          <div className="hero-dots" />
          <div className="hero-streak" />
          <div className="hero-streak-2" />
          <div className="hero-fade" />

          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-live">
                <span className="badge-live-dot" />
                Live
              </span>
              India's First AI Business Intelligence Platform
            </div>

            <div className="hero-eyebrow">Hey, you're a</div>
            <h1 className="hero-h1">
              Business<br />
              <span className="accent">Builder.</span>
            </h1>

            <div className="hero-bottom">
              <p className="hero-desc">
                <strong>Know what you can build. Know how to grow.</strong><br />
                FieldScope maps your industry, assesses your capabilities with AI, and delivers a personalized growth strategy — built for Indian businesses.
              </p>
              <div className="hero-actions">
                <button className="btn-hero-primary" onClick={() => navigate("/signup")}>
                  Free Assessment <ArrowRight size={15} />
                </button>
                <button className="btn-hero-ghost" onClick={() => navigate("/explore")}>
                  Explore <ChevronRight size={14} />
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
          <div className="section-tag reveal">
            <div className="section-tag-dot" />
            <div className="section-tag-text">Platform Modules</div>
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
                  <f.icon size={20} color="#1558F6" />
                </div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-arrow"><ArrowRight size={15} /></div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-box reveal">
            <div className="cta-blob-1" />
            <div className="cta-blob-2" />
            <div className="cta-dots" />
            <div className="cta-left">
              <h2 className="cta-h2">
                Ready to discover<br />
                your <span>business</span><br />
                potential?
              </h2>
              <p className="cta-sub">
                Join thousands of Indian entrepreneurs who know exactly where they stand — and where they're headed.
              </p>
            </div>
            <div className="cta-right">
              <div className="cta-btn-wrap">
                <div className="cta-ring" />
                <div className="cta-ring-2" />
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