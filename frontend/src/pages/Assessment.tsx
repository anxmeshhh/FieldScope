import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronLeft, Loader2, CheckCircle, Zap,
  Target, Map, Lightbulb, Building2, TrendingUp, AlertCircle,
  ArrowRight,
} from "lucide-react";

const API = "http://localhost:8000";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DOMAINS = [
  { val: "Digital Marketing",          emoji: "📱", hint: "SEO, ads, social, content"     },
  { val: "Construction & Real Estate", emoji: "🏗️", hint: "Build, develop, lease"          },
  { val: "D2C E-Commerce",             emoji: "📦", hint: "Direct-to-consumer products"    },
  { val: "HealthTech",                 emoji: "🏥", hint: "Health services & platforms"    },
  { val: "FinTech",                    emoji: "💳", hint: "Payments, lending, wealth"      },
  { val: "AgriTech",                   emoji: "🌾", hint: "Farm tech & supply chain"       },
  { val: "EdTech",                     emoji: "🎓", hint: "Learning & skill platforms"     },
  { val: "SaaS / Software",            emoji: "💻", hint: "B2B software & tools"           },
];

const DOMAIN_SKILLS: Record<string, {val: string, emoji: string}[]> = {
  "Digital Marketing": [
    { val: "SEO/SEM",      emoji: "🔍" },
    { val: "Paid Ads",     emoji: "📣" },
    { val: "Content",      emoji: "✍️" },
    { val: "Analytics",    emoji: "📊" },
    { val: "Social Media", emoji: "📱" },
    { val: "Automation",   emoji: "⚙️" },
  ],
  "Construction & Real Estate": [
    { val: "Project Mgmt", emoji: "🏗️" },
    { val: "B2B Sales",    emoji: "🤝" },
    { val: "Procurement",  emoji: "📦" },
    { val: "Compliance",   emoji: "📋" },
    { val: "AutoCAD/BIM",  emoji: "📐" },
    { val: "Finance",      emoji: "💰" },
  ],
  "D2C E-Commerce": [
    { val: "Supply Chain", emoji: "📦" },
    { val: "Performance Ads",emoji: "📈" },
    { val: "Brand Design", emoji: "🎨" },
    { val: "Shopify/Web",  emoji: "💻" },
    { val: "Customer Success",emoji:"💬" },
    { val: "Influencer",   emoji: "🤳" },
  ],
  "HealthTech": [
    { val: "HIPAA/Compl.", emoji: "🛡️" },
    { val: "EHR/EMR Integr.", emoji: "🏥" },
    { val: "Med Device R&D", emoji: "🔬" },
    { val: "B2B Healthcare", emoji: "🤝" },
    { val: "Telemedicine", emoji: "📱" },
    { val: "Data Security",emoji: "🔒" },
  ],
  "FinTech": [
    { val: "Risk Modeling", emoji: "📊" },
    { val: "Payment Gateways",emoji:"💳" },
    { val: "Blockchain/Web3",emoji: "⛓️" },
    { val: "Compliance/KYC",emoji: "📋" },
    { val: "App Sec",       emoji: "🔒" },
    { val: "Wealth Mgmt",   emoji: "💰" },
  ],
  "AgriTech": [
    { val: "Supply Chain", emoji: "🚚" },
    { val: "IoT / Sensors", emoji: "📡" },
    { val: "Market Access", emoji: "🤝" },
    { val: "Agronomy",      emoji: "🌱" },
    { val: "Gov Grants",    emoji: "📜" },
    { val: "Climate Data",  emoji: "🌦️" },
  ],
  "EdTech": [
    { val: "Curriculum Des.",emoji:"📚" },
    { val: "LMS Admin",    emoji: "💻" },
    { val: "B2C Acquisition",emoji:"🎯" },
    { val: "Student Success",emoji:"🎓" },
    { val: "Video Prod.",  emoji: "🎬" },
    { val: "Gamification", emoji: "🎮" },
  ],
  "SaaS / Software": [
    { val: "Cloud Arch.",  emoji: "☁️" },
    { val: "DevOps / CI-CD",emoji:"⚙️" },
    { val: "Agile/Scrum",  emoji: "🔄" },
    { val: "B2B Enterprise",emoji:"🏢" },
    { val: "Product Mgmt", emoji: "📋" },
    { val: "Data Science", emoji: "🧠" },
  ]
};

const DEFAULT_SKILLS = [
  { val: "Analytics",  emoji: "📊" },
  { val: "Automation", emoji: "⚙️" },
  { val: "Sales",      emoji: "🤝" },
  { val: "Design",     emoji: "🎨" },
  { val: "Marketing",  emoji: "📣" },
  { val: "Content",    emoji: "✍️" },
];

const TEAM_SIZES = [
  { val: "Solo", sub: "Just you"   },
  { val: "2–5",  sub: "Small team" },
  { val: "6–15", sub: "Mid team"   },
  { val: "15+",  sub: "Large"      },
];

const TIERS = [
  { val: "metro", label: "Metro City",   sub: "Mumbai · Delhi · Bangalore · Chennai", pts: 5,   emoji: "🏙️" },
  { val: "tier2", label: "Tier-2 City",  sub: "Pune · Surat · Jaipur · Coimbatore",  pts: 3,   emoji: "🏢" },
  { val: "rural", label: "Rural / Town", sub: "Sub-district & rural markets",         pts: 1.5, emoji: "🏡" },
];

const STEPS = [
  { id: "domain",   title: "Choose Your Domain",  desc: "The industry you operate or plan to enter",  feeds: "Powers domain matching across all AI modules"        },
  { id: "basics",   title: "Business Numbers",     desc: "Capital, revenue, clients & experience",     feeds: "Budget score (30 pts) + Client score (20 pts)"       },
  { id: "team",     title: "Team & Skills",         desc: "Your team composition and key capabilities", feeds: "Team score (20 pts) + Skill score (10 pts)"          },
  { id: "location", title: "Location & Market",    desc: "Where you operate across India",             feeds: "Location score (5 pts) + regional industry matching" },
];

const UNLOCKED_MODULES = [
  { label: "Recommendations", sub: "AI-ranked actions", icon: Lightbulb, path: "/recommendations" },
  { label: "Roadmap",         sub: "4-week plan",       icon: Map,        path: "/roadmap"          },
  { label: "Industries",      sub: "Matched for you",   icon: Building2,  path: "/explore"          },
  { label: "Dashboard",       sub: "Live overview",     icon: TrendingUp, path: "/dashboard"        },
];

// ─────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────
function parseNum(s: string) {
  return parseInt((s || "0").replace(/[^0-9]/g, ""), 10) || 0;
}

function previewScore(form: FormState) {
  const capital = parseNum(form.capital);
  const revenue = parseNum(form.revenue);
  const clients = parseInt(form.clients || "0", 10);
  const years   = parseInt(form.years_experience || "0", 10);
  const teamMap: Record<string, number> = { "Solo": 3, "2–5": 8, "6–15": 14, "15+": 20 };
  const tierMap: Record<string, number> = { metro: 5, tier2: 3, rural: 1.5 };
  const skillW:  Record<string, number> = { analytics: 10, automation: 10, seo: 8, "paid ads": 8, sales: 8, design: 7, content: 6, video: 6 };

  const budget = Math.min(
    Math.log10(capital + 1) / Math.log10(5_000_000) * 15 +
    Math.log10(revenue + 1) / Math.log10(5_000_000) * 15, 30,
  );
  const team   = teamMap[form.teamSize] ?? 0;
  const client = clients >= 50 ? 20 : clients >= 20 ? 15 : clients >= 5 ? 10 : clients >= 1 ? 5 : 0;
  const exp    = years >= 7 ? 15 : years >= 4 ? 11 : years >= 2 ? 7 : years >= 1 ? 3 : 0;
  const skill  = Math.min(form.skills.length * 3.5, 10);
  const loc    = tierMap[form.tier] ?? 0;
  const total  = Math.min(Math.round(budget + team + client + exp + skill + loc), 100);

  return {
    total,
    breakdown: [
      { label: "Budget",     score: Math.round(budget), max: 30 },
      { label: "Team",       score: team,                max: 20 },
      { label: "Clients",    score: client,              max: 20 },
      { label: "Experience", score: exp,                 max: 15 },
      { label: "Skills",     score: Math.round(skill),  max: 10 },
      { label: "Location",   score: Math.round(loc),    max: 5  },
    ],
  };
}

function classifyLevel(score: number) {
  if (score >= 70) return { label: "Enterprise",   color: "#FF8C42" };
  if (score >= 40) return { label: "Intermediate", color: "#E85D04" };
  return               { label: "Beginner",        color: "#C45203" };
}

function validate(step: number, form: FormState): string {
  if (step === 0 && !form.domain)        return "Please select an industry domain to continue.";
  if (step === 1) {
    if (!form.capital)                   return "Monthly capital is required for scoring.";
    if (!form.revenue)                   return "Monthly revenue is required for scoring.";
    if (!form.clients)                   return "Number of active clients is required.";
    if (!form.years_experience)          return "Years in business is required.";
  }
  if (step === 2 && !form.teamSize)      return "Please select your team size.";
  if (step === 2 && !form.skills.length) return "Select at least one skill.";
  if (step === 3 && !form.tier)          return "Please select your location tier.";
  return "";
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface FormState {
  domain: string; capital: string; revenue: string;
  clients: string; years_experience: string;
  teamSize: string; skills: string[]; tier: string;
}
interface Result {
  level: string; confidence: number; domain: string;
  score: number; breakdown: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* PAGE */
  .as { min-height: 100vh; background: #F8FAFC; font-family: 'DM Sans', sans-serif; color: #1E293B; position: relative; }
  .as::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .as::after {
    content: ''; position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
    width: 700px; height: 500px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .as-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 48px 24px 80px; }

  /* HEADER */
  .as-head { margin-bottom: 40px; }
  .as-eyebrow {
    display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #2563EB;
  }
  .as-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563EB; box-shadow: 0 0 10px rgba(37,99,235,0.6); animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .as-title { font-family: 'Bebas Neue'; font-size: 56px; line-height: 0.9; letter-spacing: 0.02em; margin-bottom: 10px; color: #0F172A; }
  .as-title em { color: #2563EB; font-style: normal; }
  .as-subtitle { font-size: 14px; color: #64748B; font-weight: 400; line-height: 1.65; max-width: 500px; }

  /* STEP TRACK */
  .as-track {
    display: flex; align-items: flex-start; gap: 0;
    margin-bottom: 6px; padding: 22px 28px;
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;
    position: relative; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .as-track::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent);
  }
  .as-track-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; position: relative; }
  .as-track-step:not(:last-child)::after {
    content: ''; position: absolute; top: 13px; left: calc(50% + 16px); right: calc(-50% + 16px);
    height: 2px; background: #E2E8F0; transition: background 0.4s;
  }
  .as-track-step.done:not(:last-child)::after { background: #93C5FD; }

  .as-track-bubble {
    width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue'; font-size: 14px; transition: all 0.3s; position: relative; z-index: 1; flex-shrink: 0;
  }
  .as-track-bubble.pending { background: #F8FAFC; border: 1px solid #CBD5E1; color: #94A3B8; }
  .as-track-bubble.active  { background: #2563EB; color: #fff; box-shadow: 0 0 0 5px #DBEAFE, 0 0 20px rgba(37,99,235,0.25); border: none; }
  .as-track-bubble.done    { background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; }

  .as-track-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; transition: color 0.3s; }
  .as-track-label.pending { color: #94A3B8; }
  .as-track-label.active  { color: #2563EB; }
  .as-track-label.done    { color: #64748B; }

  /* PROGRESS BAR */
  .as-progress-bar { height: 4px; background: #E2E8F0; border-radius: 2px; margin-bottom: 28px; overflow: hidden; }
  .as-progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #60A5FA, #2563EB, #1D4ED8); transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }

  /* FORM CARD */
  .as-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .as-card-edge { height: 3px; background: linear-gradient(90deg, #93C5FD, #2563EB 45%, #1E3A8A 75%, transparent); }
  .as-card-body { padding: 40px 48px; }

  .as-card-step-num {
    font-family: 'DM Mono'; font-size: 10px; color: #2563EB; letter-spacing: 0.12em; text-transform: uppercase;
    margin-bottom: 10px; display: flex; align-items: center; gap: 10px; font-weight: 600;
  }
  .as-card-step-num::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }

  .as-card-title { font-family: 'Bebas Neue'; font-size: 34px; letter-spacing: 0.02em; line-height: 1; margin-bottom: 6px; color: #0F172A; }
  .as-card-desc  { font-size: 13px; color: #64748B; line-height: 1.55; margin-bottom: 8px; }
  .as-card-feeds {
    display: inline-flex; align-items: center; gap: 6px; margin-bottom: 28px;
    font-size: 10px; color: #2563EB; letter-spacing: 0.08em; font-weight: 600;
    background: #EFF6FF; border: 1px solid #BFDBFE; padding: 4px 10px; border-radius: 6px;
  }

  /* ERROR */
  .as-error {
    display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-radius: 8px; margin-bottom: 22px;
    background: #FEF2F2; border: 1px solid #FECACA; font-size: 13px; color: #DC2626; font-weight: 500;
  }

  /* DOMAIN GRID */
  .as-domain-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .as-domain-btn {
    display: flex; align-items: center; gap: 14px; padding: 20px 22px;
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;
    cursor: pointer; text-align: left; font-family: 'DM Sans'; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    position: relative; overflow: hidden;
  }
  .as-domain-btn::before {
    content: ''; position: absolute; left: 0; top: 12%; bottom: 12%;
    width: 3px; border-radius: 3px; background: #2563EB;
    transform: scaleY(0); transition: transform 0.22s ease;
  }
  .as-domain-btn:hover::before, .as-domain-btn.sel::before { transform: scaleY(1); }
  .as-domain-btn:hover { border-color: #93C5FD; background: #FFFFFF; transform: translateX(2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .as-domain-btn.sel   { background: #EFF6FF; border-color: #2563EB; transform: translateX(2px); box-shadow: 0 0 0 1px #2563EB; }

  .as-domain-emoji { font-size: 24px; flex-shrink: 0; line-height: 1; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.05)); }
  .as-domain-name  { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 2px; transition: color 0.2s; }
  .as-domain-btn:hover .as-domain-name { color: #0F172A; }
  .as-domain-btn.sel   .as-domain-name { color: #1D4ED8; }
  .as-domain-hint  { font-size: 11px; color: #64748B; line-height: 1.4; }
  .as-domain-btn:hover .as-domain-hint { color: #475569; }
  .as-domain-btn.sel   .as-domain-hint { color: #1E3A8A; }

  .as-domain-check {
    margin-left: auto; flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
    background: #2563EB; display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(0.3); transition: opacity 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .as-domain-btn.sel .as-domain-check { opacity: 1; transform: scale(1); }

  /* LABELS + INPUTS */
  .as-label { display: block; font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  .as-hint  { font-size: 11px; color: #64748B; margin-top: 6px; line-height: 1.5; }

  .as-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .as-field-row:last-child { margin-bottom: 0; }

  .as-input-wrap { position: relative; }
  .as-input-prefix { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-family: 'DM Mono'; font-size: 15px; color: #64748B; pointer-events: none; }
  .as-input {
    width: 100%; padding: 16px 20px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 10px;
    color: #0F172A; font-size: 15px; font-family: 'DM Mono'; outline: none; transition: all 0.25s; font-weight: 500;
  }
  .as-input.pfx { padding-left: 36px; }
  .as-input::placeholder { color: #94A3B8; font-weight: 400; }
  .as-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px #DBEAFE; }
  .as-input.err { border-color: #EF4444; }

  /* TEAM SIZE */
  .as-size-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 36px; }
  .as-size-btn {
    padding: 22px 10px; text-align: center; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 10px; cursor: pointer; font-family: 'DM Sans'; transition: all 0.25s; position: relative; overflow: hidden;
  }
  .as-size-btn::after {
    content: ''; position: absolute; bottom: 0; left: 8%; right: 8%; height: 3px;
    background: #2563EB; border-radius: 3px 3px 0 0; transform: scaleY(0); transform-origin: bottom; transition: transform 0.22s;
  }
  .as-size-btn:hover::after, .as-size-btn.sel::after { transform: scaleY(1); }
  .as-size-btn:hover { border-color: #93C5FD; background: #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .as-size-btn.sel   { background: #EFF6FF; border-color: #2563EB; }
  .as-size-val { font-family: 'Bebas Neue'; font-size: 26px; letter-spacing: 0.04em; color: #475569; transition: color 0.2s; }
  .as-size-btn:hover .as-size-val { color: #0F172A; }
  .as-size-btn.sel   .as-size-val { color: #1D4ED8; }
  .as-size-sub { font-size: 11px; color: #64748B; margin-top: 4px; font-weight: 500; }
  .as-size-btn.sel .as-size-sub { color: #1E3A8A; }

  /* SKILLS */
  .as-skills { display: flex; flex-wrap: wrap; gap: 12px; }
  .as-skill {
    display: flex; align-items: center; gap: 10px; padding: 12px 20px;
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;
    font-size: 14px; font-weight: 500; color: #475569;
    cursor: pointer; font-family: 'DM Sans'; transition: all 0.2s;
  }
  .as-skill:hover { border-color: #93C5FD; color: #0F172A; background: #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
  .as-skill.sel   { background: #EFF6FF; border-color: #2563EB; color: #1D4ED8; }
  .as-skill-emoji { font-size: 16px; }

  /* TIERS */
  .as-tier-grid { display: flex; flex-direction: column; gap: 12px; }
  .as-tier-btn {
    display: flex; align-items: center; justify-content: space-between; padding: 18px 20px;
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;
    cursor: pointer; font-family: 'DM Sans'; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .as-tier-btn::before {
    content: ''; position: absolute; left: 0; top: 10%; bottom: 10%;
    width: 3px; border-radius: 3px; background: #2563EB; transform: scaleY(0); transition: transform 0.22s;
  }
  .as-tier-btn:hover::before, .as-tier-btn.sel::before { transform: scaleY(1); }
  .as-tier-btn:hover { border-color: #93C5FD; background: #FFFFFF; padding-left: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .as-tier-btn.sel   { border-color: #2563EB; background: #EFF6FF; padding-left: 24px; }
  .as-tier-name { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 4px; transition: color 0.2s; }
  .as-tier-btn:hover .as-tier-name, .as-tier-btn.sel .as-tier-name { color: #1D4ED8; }
  .as-tier-sub  { font-size: 12px; color: #64748B; line-height: 1.4; }
  .as-tier-btn.sel .as-tier-sub { color: #1E3A8A; }
  .as-tier-pts  { font-family: 'DM Mono'; font-size: 12px; color: #64748B; flex-shrink: 0; margin-left: 16px; font-weight: 500; }
  .as-tier-btn.sel .as-tier-pts { color: #2563EB; font-weight: 600; }

  /* SCORE STRIP */
  .as-score-strip {
    display: grid; grid-template-columns: 130px 1fr; gap: 24px; align-items: center;
    padding: 24px 28px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;
    margin-bottom: 16px; position: relative; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }
  .as-score-strip::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.2), transparent);
  }
  .as-score-strip-label {
    position: absolute; top: 12px; right: 16px;
    font-size: 9px; color: #64748B; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; font-family: 'DM Mono';
  }
  .as-score-big-col { text-align: center; }
  .as-score-num { font-family: 'Bebas Neue'; font-size: 64px; line-height: 1; letter-spacing: 0.04em; transition: color 0.4s; }
  .as-score-denom { font-family: 'DM Mono'; font-size: 16px; color: #94A3B8; margin-left: 2px; }
  .as-score-lvl { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 6px; transition: color 0.4s; }

  .as-score-bars { display: flex; flex-direction: column; gap: 10px; }
  .as-score-row { display: flex; align-items: center; gap: 12px; }
  .as-score-row-label { font-size: 11px; color: #64748B; font-weight: 500; width: 74px; flex-shrink: 0; }
  .as-score-track { flex: 1; height: 4px; background: #E2E8F0; border-radius: 2px; }
  .as-score-fill  { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #60A5FA, #2563EB); transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
  .as-score-val   { font-family: 'DM Mono'; font-size: 10px; color: #475569; font-weight: 500; width: 36px; text-align: right; }

  /* NAV */
  .as-nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }
  .as-back {
    display: flex; align-items: center; gap: 8px; padding: 12px 24px;
    background: transparent; border: 1px solid #CBD5E1; border-radius: 8px;
    color: #475569; font-size: 13px; font-weight: 600; font-family: 'DM Sans'; cursor: pointer; transition: all 0.2s;
  }
  .as-back:hover:not(:disabled) { border-color: #94A3B8; color: #0F172A; background: #F8FAFC; }
  .as-back:disabled { opacity: 0.4; cursor: not-allowed; }
  .as-nav-right { display: flex; align-items: center; gap: 16px; }
  .as-nav-pct { font-family: 'DM Mono'; font-size: 12px; color: #64748B; font-weight: 500; }
  .as-next {
    display: flex; align-items: center; gap: 8px; padding: 14px 32px;
    background: #2563EB; color: #fff; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    font-family: 'DM Sans'; cursor: pointer; transition: all 0.22s;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }
  .as-next:hover:not(:disabled) { background: #1D4ED8; box-shadow: 0 6px 16px rgba(37,99,235,0.35); transform: translateY(-1px); }
  .as-next:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  /* ── DONE SCREEN ── */
  @keyframes pop      { from{transform:scale(0.5);opacity:0} 65%{transform:scale(1.08)} to{transform:scale(1);opacity:1} }
  @keyframes fade-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bar-grow { from{width:0} }
  @keyframes glow-pulse { 0%,100%{box-shadow:0 0 32px rgba(37,99,235,0.15)} 50%{box-shadow:0 0 64px rgba(37,99,235,0.3)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { animation: spin 1s linear infinite; }

  .as-done { max-width: 680px; margin: 0 auto; padding: 56px 0 80px; display: flex; flex-direction: column; gap: 32px; }

  /* hero */
  .as-done-hero { text-align: center; animation: fade-up 0.5s ease both; }
  .as-done-ring {
    width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 24px;
    display: flex; align-items: center; justify-content: center;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    animation: pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both, glow-pulse 3s 1s infinite;
  }
  .as-done-title { font-family: 'Bebas Neue'; font-size: 64px; line-height: 0.9; letter-spacing: 0.02em; margin-bottom: 12px; color: #0F172A; }
  .as-done-title em { color: #2563EB; font-style: normal; }
  .as-done-tagline { font-size: 15px; color: #64748B; line-height: 1.65; max-width: 480px; margin: 0 auto; }

  /* score card */
  .as-done-score-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; animation: fade-up 0.5s 0.15s ease both; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
  .as-done-score-bar  { height: 4px; background: linear-gradient(90deg, #93C5FD, #2563EB 50%, #1E3A8A); }
  .as-done-score-body { padding: 36px; display: grid; grid-template-columns: 160px 1fr; gap: 40px; align-items: start; }

  .as-done-score-left { text-align: center; }
  .as-done-circle {
    width: 140px; height: 140px; border-radius: 50%; margin: 0 auto 16px;
    border: 1px solid #E2E8F0; position: relative;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: radial-gradient(circle, #F8FAFC 0%, transparent 65%);
  }
  .as-done-circle::before {
    content: ''; position: absolute; inset: 8px; border-radius: 50%; border: 2px dashed #CBD5E1;
  }
  .as-done-circle-n { font-family: 'Bebas Neue'; font-size: 56px; line-height: 1; letter-spacing: 0.04em; }
  .as-done-circle-d { font-family: 'DM Mono'; font-size: 14px; color: #94A3B8; }
  .as-done-level     { font-family: 'Bebas Neue'; font-size: 22px; letter-spacing: 0.1em; margin-bottom: 6px; }
  .as-done-domain    { font-size: 12px; color: #64748B; font-family: 'DM Mono'; font-weight: 500; }

  /* breakdown */
  .as-done-breakdown { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .as-done-bd-row { display: flex; align-items: center; gap: 14px; }
  .as-done-bd-label { font-size: 12px; color: #475569; font-weight: 600; width: 85px; flex-shrink: 0; }
  .as-done-bd-track { flex: 1; height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; }
  .as-done-bd-fill  { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #60A5FA, #2563EB); animation: bar-grow 0.8s ease both; }
  .as-done-bd-val   { font-family: 'DM Mono'; font-size: 12px; color: #64748B; font-weight: 500; width: 40px; text-align: right; }

  .as-done-conf-row { display: flex; align-items: center; gap: 14px; padding-top: 18px; border-top: 1px solid #E2E8F0; }
  .as-done-conf-lbl { font-size: 11px; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; flex-shrink: 0; }
  .as-done-conf-track { flex: 1; height: 5px; background: #E2E8F0; border-radius: 3px; overflow: hidden; }
  .as-done-conf-fill  { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #34D399, #10B981, #059669); animation: bar-grow 1s 0.3s ease both; }
  .as-done-conf-val   { font-family: 'DM Mono'; font-size: 13px; color: #10B981; font-weight: 600; flex-shrink: 0; }

  /* modules */
  .as-done-modules { animation: fade-up 0.5s 0.25s ease both; }
  .as-done-mod-hd {
    font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.14em; text-transform: uppercase;
    margin-bottom: 16px; display: flex; align-items: center; gap: 12px;
  }
  .as-done-mod-hd::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }
  .as-done-mod-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .as-done-mod {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px;
    padding: 20px 14px; text-align: center; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .as-done-mod::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, #2563EB, transparent); }
  .as-done-mod:hover { border-color: #93C5FD; background: #F8FAFC; transform: translateY(-4px); box-shadow: 0 10px 20px rgba(37,99,235,0.1); }
  .as-done-mod-icon { width: 42px; height: 42px; border-radius: 10px; margin: 0 auto 12px; background: #EFF6FF; border: 1px solid #BFDBFE; display: flex; align-items: center; justify-content: center; }
  .as-done-mod-name { font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
  .as-done-mod-sub  { font-size: 11px; color: #64748B; font-weight: 500; }
  .as-done-mod-status { display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 10px; font-size: 10px; color: #10B981; font-family: 'DM Mono'; letter-spacing: 0.06em; font-weight: 600; }
  .as-done-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px rgba(16,185,129,0.5); animation: blink 1.4s infinite; }

  /* CTAs */
  .as-done-ctas { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; animation: fade-up 0.5s 0.35s ease both; }
  .as-done-primary {
    display: flex; align-items: center; gap: 8px; padding: 14px 32px;
    background: #2563EB; color: #fff; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    font-family: 'DM Sans'; cursor: pointer; transition: all 0.22s; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }
  .as-done-primary:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(37,99,235,0.35); }
  .as-done-secondary {
    display: flex; align-items: center; gap: 8px; padding: 14px 24px;
    background: #FFFFFF; color: #475569; border: 1px solid #CBD5E1; border-radius: 8px;
    font-size: 14px; font-weight: 600; font-family: 'DM Sans'; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .as-done-secondary:hover { border-color: #93C5FD; color: #2563EB; background: #F8FAFC; }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .as-inner { padding: 28px 16px 56px; }
    .as-title { font-size: 44px; }
    .as-card-body { padding: 22px; }
    .as-domain-grid { grid-template-columns: 1fr; }
    .as-field-row { grid-template-columns: 1fr; }
    .as-size-grid { grid-template-columns: repeat(2,1fr); }
    .as-score-strip { grid-template-columns: 1fr; }
    .as-done-score-body { grid-template-columns: 1fr; }
    .as-done-mod-grid { grid-template-columns: repeat(2,1fr); }
    .as-done-ctas { flex-direction: column; }
    .as-track { padding: 16px 12px; }
  }
`;

// ─────────────────────────────────────────────────────────────
// SCORE STRIP
// ─────────────────────────────────────────────────────────────
function ScoreStrip({ form }: { form: FormState }) {
  const hasAny = !!(form.domain || form.capital || form.teamSize || form.tier);
  const { total, breakdown } = previewScore(form);
  const { label, color } = classifyLevel(total);

  return (
    <div className="as-score-strip">
      <div className="as-score-strip-label">Live Score Preview</div>
      <div className="as-score-big-col">
        <div className="as-score-num" style={{ color: hasAny ? color : "#222" }}>
          {hasAny ? total : "—"}<span className="as-score-denom">/100</span>
        </div>
        <div className="as-score-lvl" style={{ color: hasAny ? color : "#2A2A2A" }}>
          {hasAny ? label : "pending"}
        </div>
      </div>
      <div className="as-score-bars">
        {breakdown.map((b, i) => (
          <div key={b.label} className="as-score-row">
            <div className="as-score-row-label">{b.label}</div>
            <div className="as-score-track">
              <div className="as-score-fill" style={{ width: `${(b.score / b.max) * 100}%`, transitionDelay: `${i * 0.05}s` }} />
            </div>
            <div className="as-score-val">{b.score}<span style={{ color: "#2E2E2E" }}>/{b.max}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DONE SCREEN
// ─────────────────────────────────────────────────────────────
function DoneScreen({ result, navigate }: { result: Result; navigate: (p: string) => void }) {
  const { label, color } = classifyLevel(result.score ?? 0);
  const bdMax: Record<string, number> = { budget: 30, team: 20, clients: 20, experience: 15, skills: 10, location: 5 };
  const bd = result.breakdown ?? {};

  return (
    <div className="as-done">

      {/* HERO */}
      <div className="as-done-hero">
        <div className="as-done-ring">
          <CheckCircle size={40} color="#E85D04" strokeWidth={1.5} />
        </div>
        <div className="as-done-title">Assessment <em>Complete</em></div>
        <div className="as-done-tagline">
          Your business profile is live. All AI modules are generating in parallel — personalised results ready in under 30 seconds.
        </div>
      </div>

      {/* SCORE CARD */}
      <div className="as-done-score-card">
        <div className="as-done-score-bar" />
        <div className="as-done-score-body">

          {/* Circle + level */}
          <div className="as-done-score-left">
            <div className="as-done-circle">
              <div className="as-done-circle-n" style={{ color }}>
                {result.score ?? "—"}
              </div>
              <div className="as-done-circle-d">/100</div>
            </div>
            <div className="as-done-level" style={{ color }}>{result.level ?? label}</div>
            <div className="as-done-domain">{result.domain}</div>
          </div>

          {/* Bars */}
          <div className="as-done-right">
            <div className="as-done-breakdown">
              {Object.entries(bd).map(([key, val], i) => {
                const max = bdMax[key] ?? 10;
                return (
                  <div key={key} className="as-done-bd-row">
                    <div className="as-done-bd-label" style={{ textTransform: "capitalize" }}>{key}</div>
                    <div className="as-done-bd-track">
                      <div className="as-done-bd-fill" style={{ width: `${Math.round((val / max) * 100)}%`, animationDelay: `${0.1 + i * 0.07}s` }} />
                    </div>
                    <div className="as-done-bd-val">{val}<span style={{ color: "#333" }}>/{max}</span></div>
                  </div>
                );
              })}
            </div>
            <div className="as-done-conf-row">
              <div className="as-done-conf-lbl">Confidence</div>
              <div className="as-done-conf-track">
                <div className="as-done-conf-fill" style={{ width: `${result.confidence ?? 80}%` }} />
              </div>
              <div className="as-done-conf-val">{result.confidence ?? 80}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULES */}
      <div className="as-done-modules">
        <div className="as-done-mod-hd">Modules Now Active</div>
        <div className="as-done-mod-grid">
          {UNLOCKED_MODULES.map((m, i) => (
            <div key={m.label} className="as-done-mod" style={{ animationDelay: `${0.3 + i * 0.07}s` }} onClick={() => navigate(m.path)}>
              <div className="as-done-mod-icon"><m.icon size={15} color="#E85D04" strokeWidth={1.5} /></div>
              <div className="as-done-mod-name">{m.label}</div>
              <div className="as-done-mod-sub">{m.sub}</div>
              <div className="as-done-mod-status"><div className="as-done-status-dot" /> generating</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAS */}
      <div className="as-done-ctas">
        <button className="as-done-primary" onClick={() => navigate("/recommendations")}>
          <Lightbulb size={14} /> See Recommendations <ArrowRight size={14} />
        </button>
        <button className="as-done-secondary" onClick={() => navigate("/roadmap")}><Map size={14} /> Roadmap</button>
        <button className="as-done-secondary" onClick={() => navigate("/explore")}><Building2 size={14} /> Industries</button>
        <button className="as-done-secondary" onClick={() => navigate("/dashboard")}><TrendingUp size={14} /> Dashboard</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function Assessment() {
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [result,  setResult]  = useState<Result | null>(null);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState<FormState>({
    domain: "", capital: "", revenue: "", clients: "",
    years_experience: "", teamSize: "", skills: [], tier: "",
  });

  const update = useCallback((key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setError("");
  }, []);

  const toggleSkill = useCallback((s: string) => {
    setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
    setError("");
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Enter" && !loading) handleNext(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [step, form, loading]);

  const handleNext = async () => {
    const err = validate(step, form);
    if (err) { setError(err); return; }
    setError("");
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/assessment/submit/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          ...form,
          capital:          parseNum(form.capital),
          revenue:          parseNum(form.revenue),
          clients:          parseInt(form.clients || "0", 10),
          years_experience: parseInt(form.years_experience || "0", 10),
        }),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); setDone(true); }
      else setError(data.error || "Submission failed. Please try again.");
    } catch { setError("Could not reach server. Check your connection."); }
    finally { setLoading(false); }
  };

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  if (done && result) return (
    <><style>{css}</style><div className="as"><div className="as-inner"><DoneScreen result={result} navigate={navigate} /></div></div></>
  );

  return (
    <>
      <style>{css}</style>
      <div className="as">
        <div className="as-inner">

          {/* HEADER */}
          <div className="as-head">
            <div className="as-eyebrow"><div className="as-eyebrow-dot" /> Module 03 · Capability Assessment</div>
            <div className="as-title">Know Your <em>Level</em></div>
            <div className="as-subtitle">
              4 steps. AI scores your business across 6 dimensions and unlocks personalised roadmaps, recommendations and matched industries.
            </div>
          </div>

          {/* TRACK */}
          <div className="as-track">
            {STEPS.map((s, i) => {
              const st = i < step ? "done" : i === step ? "active" : "pending";
              return (
                <div key={s.id} className={`as-track-step ${st}`}>
                  <div className={`as-track-bubble ${st}`}>
                    {i < step ? <CheckCircle size={13} strokeWidth={2.5} /> : i + 1}
                  </div>
                  <div className={`as-track-label ${st}`}>{s.id}</div>
                </div>
              );
            })}
          </div>

          {/* PROGRESS BAR */}
          <div className="as-progress-bar">
            <div className="as-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* FORM CARD */}
          <div className="as-card">
            <div className="as-card-edge" />
            <div className="as-card-body">
              <div className="as-card-step-num">Step {step + 1} of {STEPS.length}</div>
              <div className="as-card-title">{STEPS[step].title}</div>
              <div className="as-card-desc">{STEPS[step].desc}</div>
              <div className="as-card-feeds"><Zap size={10} /> {STEPS[step].feeds}</div>

              {error && <div className="as-error"><AlertCircle size={14} /> {error}</div>}

              {/* STEP 0 */}
              {step === 0 && (
                <div className="as-domain-grid">
                  {DOMAINS.map(d => (
                    <button key={d.val} className={`as-domain-btn${form.domain === d.val ? " sel" : ""}`} onClick={() => update("domain", d.val)}>
                      <div className="as-domain-emoji">{d.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div className="as-domain-name">{d.val}</div>
                        <div className="as-domain-hint">{d.hint}</div>
                      </div>
                      <div className="as-domain-check"><CheckCircle size={10} color="#fff" strokeWidth={3} /></div>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="as-field-row">
                    {[
                      { label: "Monthly Capital / Cash Flow", key: "capital", prefix: "₹", ph: "2,00,000" },
                      { label: "Monthly Revenue",             key: "revenue", prefix: "₹", ph: "1,50,000" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="as-label">{f.label}</label>
                        <div className="as-input-wrap">
                          <span className="as-input-prefix">{f.prefix}</span>
                          <input className={`as-input pfx${error && !form[f.key as keyof FormState] ? " err" : ""}`}
                            placeholder={f.ph} value={form[f.key as keyof FormState] as string}
                            onChange={e => update(f.key, e.target.value.replace(/[^0-9]/g, ""))} />
                        </div>
                        <div className="as-hint">Enter in ₹ — e.g. 200000 for ₹2 lakh</div>
                      </div>
                    ))}
                  </div>
                  <div className="as-field-row">
                    {[
                      { label: "Active Clients",    key: "clients",          prefix: "#", ph: "e.g. 5" },
                      { label: "Years in Business", key: "years_experience", prefix: "Y", ph: "e.g. 2" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="as-label">{f.label}</label>
                        <div className="as-input-wrap">
                          <span className="as-input-prefix">{f.prefix}</span>
                          <input className={`as-input pfx${error && !form[f.key as keyof FormState] ? " err" : ""}`}
                            placeholder={f.ph} value={form[f.key as keyof FormState] as string}
                            onChange={e => update(f.key, e.target.value.replace(/[^0-9]/g, ""))} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <label className="as-label">Team Size</label>
                  <div className="as-size-grid">
                    {TEAM_SIZES.map(s => (
                      <button key={s.val} className={`as-size-btn${form.teamSize === s.val ? " sel" : ""}`} onClick={() => update("teamSize", s.val)}>
                        <div className="as-size-val">{s.val}</div>
                        <div className="as-size-sub">{s.sub}</div>
                      </button>
                    ))}
                  </div>
                  <label className="as-label" style={{ marginTop: 4 }}>
                    Key Skills
                    {form.skills.length > 0 && (
                      <span style={{ color: "#E85D04", marginLeft: 10, fontFamily: "DM Mono", fontSize: 12 }}>
                        {form.skills.length} selected
                      </span>
                    )}
                  </label>
                  <div className="as-skills">
                    {(DOMAIN_SKILLS[form.domain] || DEFAULT_SKILLS).map(s => (
                      <button key={s.val} className={`as-skill${form.skills.includes(s.val) ? " sel" : ""}`} onClick={() => toggleSkill(s.val)}>
                        <span className="as-skill-emoji">{s.emoji}</span>{s.val}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="as-tier-grid">
                  {TIERS.map(t => (
                    <button key={t.val} className={`as-tier-btn${form.tier === t.val ? " sel" : ""}`} onClick={() => update("tier", t.val)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontSize: 24, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.05))" }}>{t.emoji}</div>
                        <div>
                          <div className="as-tier-name">{t.label}</div>
                          <div className="as-tier-sub">{t.sub}</div>
                        </div>
                      </div>
                      <div className="as-tier-pts">+{t.pts} pts</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SCORE STRIP */}
          <ScoreStrip form={form} />

          {/* NAV */}
          <div className="as-nav">
            <button className="as-back" onClick={() => { setStep(s => Math.max(0, s - 1)); setError(""); }} disabled={step === 0}>
              <ChevronLeft size={14} /> Back
            </button>
            <div className="as-nav-right">
              <span className="as-nav-pct">{pct}% complete</span>
              <button className="as-next" onClick={handleNext} disabled={loading}>
                {loading ? <><Loader2 size={14} className="spin" /> Analyzing…</>
                  : step === STEPS.length - 1 ? <>Submit & Unlock <Zap size={14} /></>
                  : <>Next <ChevronRight size={14} /></>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}