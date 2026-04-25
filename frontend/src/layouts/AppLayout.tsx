import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Compass, ClipboardCheck, Lightbulb,
  Map, MessageSquare, BarChart3, ShieldAlert, GitCompare,
  BookOpen, Store, Users2, DollarSign, UserCog,
  ChevronLeft, ChevronRight, Bell, Search, Settings, LogOut,
  Zap, Menu, X,
} from "lucide-react";

const API = "http://localhost:8000";

const navSections = [
  {
    label: "Core",
    items: [
      { to: "/dashboard",       icon: LayoutDashboard, label: "Dashboard",             phase: 1 },
      { to: "/explore",         icon: Compass,         label: "Industry Explorer",     phase: 1 },
      { to: "/assessment",      icon: ClipboardCheck,  label: "Capability Assessment", phase: 1 },
      { to: "/recommendations", icon: Lightbulb,       label: "AI Recommendations",    phase: 1 },
      { to: "/roadmap",         icon: Map,             label: "Growth Roadmap",        phase: 1 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/chat",    icon: MessageSquare, label: "AI Business Advisor", phase: 2 },
      { to: "/market",  icon: BarChart3,     label: "Market Intelligence", phase: 2 },
      { to: "/risk",    icon: ShieldAlert,   label: "Risk Radar",          phase: 2 },
      { to: "/compare", icon: GitCompare,    label: "Competitor Compare",  phase: 2 },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/success-library", icon: BookOpen, label: "Success Library",   phase: 3 },
      { to: "/vendors",         icon: Store,    label: "Vendor Matching",   phase: 3 },
      { to: "/benchmarking",    icon: Users2,   label: "Peer Benchmarking", phase: 3 },
    ],
  },
  {
    label: "Enterprise",
    items: [
      { to: "/team",      icon: UserCog,    label: "Team Assessment",    phase: 4 },
      { to: "/financial", icon: DollarSign, label: "Financial Planning", phase: 4 },
    ],
  },
];

const phaseStyle: Record<number, { color: string; badge: string; iconColor: string }> = {
  1: { color: "#1256F3", badge: "rgba(18,86,243,0.12)",  iconColor: "#1256F3" },
  2: { color: "#3845F5", badge: "rgba(56,69,245,0.12)",  iconColor: "#3845F5" },
  3: { color: "#00B8F0", badge: "rgba(0,184,240,0.12)",  iconColor: "#00B8F0" },
  4: { color: "#5A8EFF", badge: "rgba(90,142,255,0.12)", iconColor: "#5A8EFF" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  :root {
    --blue:       #1256F3;
    --blue-dark:  #0B3EC2;
    --blue-mid:   #2E6AF6;
    --blue-light: #5A8EFF;
    --cyan:       #00B8F0;
    --indigo:     #3845F5;

    --bg:         #ECF0FE;
    --surface:    #FFFFFF;
    --surface2:   #F4F7FF;
    --surface3:   #EBF0FF;
    --border:     #C8D4F8;
    --border2:    #B4C2F2;
    --divider:    #DCE4FB;

    --sidebar-bg:      #0C1A6E;
    --sidebar-border:  rgba(255,255,255,0.07);
    --sidebar-text:    rgba(200,220,255,0.88);
    --sidebar-muted:   rgba(110,150,215,0.55);

    --text:   #05103A;
    --text2:  #162680;
    --muted:  #4058A0;
    --muted2: #6E82C0;
    --muted3: #A0B0D8;
  }

  * { box-sizing: border-box; }

  .al-root {
    display: flex; height: 100vh; overflow: hidden;
    background: var(--bg);
    font-family: 'Manrope', sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  /* ─── SIDEBAR ─── */
  .al-sidebar {
    display: flex; flex-direction: column;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    height: 100vh;
    transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
  }

  /* Dot grid texture */
  .al-sidebar::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse 80% 60% at 30% 20%, black 10%, transparent 70%);
  }

  /* Cyan blob */
  .al-sidebar-blob {
    position: absolute; z-index: 0;
    top: -10%; right: -20%;
    width: 80%; height: 50%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,184,240,0.13) 0%, transparent 65%);
    filter: blur(36px);
    pointer-events: none;
  }

  /* Top 3-colour bar */
  .al-sidebar-topbar {
    position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 10;
    background: linear-gradient(90deg, var(--blue), var(--cyan), var(--indigo));
  }

  /* ─── LOGO ─── */
  .al-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 22px 18px 20px;
    border-bottom: 1px solid var(--sidebar-border);
    flex-shrink: 0; overflow: hidden;
    position: relative; z-index: 1;
  }

  .al-logo-icon {
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: var(--blue);
    box-shadow: 0 4px 16px rgba(18,86,243,0.55);
    flex-shrink: 0; transition: all 0.25s;
  }

  .al-logo:hover .al-logo-icon {
    transform: rotate(-8deg) scale(1.08);
    box-shadow: 0 6px 22px rgba(18,86,243,0.75);
  }

  .al-logo-text { overflow: hidden; }

  .al-logo-name {
    font-family: 'Manrope', sans-serif;
    font-size: 17px; font-weight: 800; letter-spacing: -0.01em;
    color: #fff; white-space: nowrap; line-height: 1;
  }

  .al-logo-name span { color: var(--cyan); }

  .al-logo-sub {
    font-size: 10px; color: var(--sidebar-muted);
    letter-spacing: 0.12em; text-transform: uppercase;
    font-weight: 600; margin-top: 3px; white-space: nowrap;
    font-family: 'IBM Plex Mono', monospace;
  }

  /* ─── NAV ─── */
  .al-nav {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 16px 10px;
    scrollbar-width: none;
    position: relative; z-index: 1;
  }

  .al-nav::-webkit-scrollbar { display: none; }

  .al-nav-section { margin-bottom: 24px; }

  .al-section-label {
    font-size: 9px; font-weight: 800; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--sidebar-muted);
    padding: 0 10px; margin-bottom: 7px;
    white-space: nowrap; overflow: hidden;
    font-family: 'IBM Plex Mono', monospace;
  }

  .al-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    color: var(--sidebar-text);
    cursor: pointer; border: 1px solid transparent;
    background: transparent;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s; text-align: left; width: 100%;
    position: relative; white-space: nowrap; overflow: hidden;
    text-decoration: none; margin-bottom: 2px;
    letter-spacing: -0.01em;
  }

  .al-nav-item:hover {
    color: #fff;
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.08);
  }

  .al-nav-item.active-nav {
    color: #fff !important;
    background: rgba(18,86,243,0.32) !important;
    border-color: rgba(18,86,243,0.48) !important;
    box-shadow: 0 2px 14px rgba(18,86,243,0.22);
  }

  /* Active left bar */
  .al-nav-item.active-nav::before {
    content: '';
    position: absolute; left: 0; top: 18%; bottom: 18%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(to bottom, var(--blue), var(--cyan));
    box-shadow: 0 0 8px rgba(0,184,240,0.65);
  }

  .al-nav-icon { flex-shrink: 0; transition: transform 0.2s; }
  .al-nav-item:hover .al-nav-icon { transform: scale(1.1); }
  .al-nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

  .al-phase-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px; font-weight: 600; letter-spacing: 0.05em;
    padding: 2px 7px; border-radius: 100px; flex-shrink: 0;
  }

  /* ─── COLLAPSE BTN ─── */
  .al-collapse-btn {
    position: absolute; top: 68px; right: -10px; z-index: 20;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted2);
    transition: all 0.2s;
    box-shadow: 2px 0 10px rgba(18,86,243,0.15);
  }

  .al-collapse-btn:hover {
    background: var(--blue);
    border-color: var(--blue);
    color: #fff;
    box-shadow: 2px 0 14px rgba(18,86,243,0.45);
  }

  /* ─── SIDEBAR FOOTER ─── */
  .al-sidebar-footer {
    border-top: 1px solid var(--sidebar-border);
    padding: 12px 10px;
    flex-shrink: 0;
    position: relative; z-index: 1;
  }

  .al-footer-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    color: var(--sidebar-muted);
    cursor: pointer; border: none; background: transparent;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s; width: 100%; text-align: left;
    white-space: nowrap; overflow: hidden; margin-bottom: 2px;
    letter-spacing: -0.01em;
  }

  .al-footer-btn:hover {
    color: rgba(220,235,255,0.9);
    background: rgba(255,255,255,0.07);
  }

  .al-user-strip {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px 12px; overflow: hidden;
  }

  .al-user-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--blue), var(--cyan));
    font-family: 'Manrope', sans-serif;
    font-size: 14px; font-weight: 800;
    color: #fff;
    box-shadow: 0 0 14px rgba(18,86,243,0.55);
    letter-spacing: -0.01em;
  }

  .al-user-name {
    font-size: 13px; font-weight: 700;
    color: rgba(220,235,255,0.92);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    letter-spacing: -0.01em;
  }

  /* ─── RIGHT PANEL ─── */
  .al-right { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

  /* ─── TOPBAR ─── */
  .al-topbar {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 32px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0; position: relative; z-index: 50;
    box-shadow: 0 2px 14px rgba(18,86,243,0.06);
  }

  /* Gradient accent bottom */
  .al-topbar::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--blue) 0%, var(--cyan) 38%, transparent 65%);
    opacity: 0.3;
  }

  .al-search {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 18px;
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 100px; flex: 1; max-width: 400px;
    font-size: 13px; font-weight: 500; color: var(--muted2);
    font-family: 'Manrope', sans-serif; cursor: text;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .al-search:hover {
    border-color: rgba(18,86,243,0.3);
    box-shadow: 0 0 0 3px rgba(18,86,243,0.06);
  }

  .al-topbar-right {
    margin-left: auto;
    display: flex; align-items: center; gap: 10px;
  }

  .al-notif-btn {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface2); border: 1.5px solid var(--border);
    color: var(--muted2); cursor: pointer;
    transition: all 0.2s; position: relative;
  }

  .al-notif-btn:hover {
    border-color: rgba(18,86,243,0.38);
    color: var(--blue);
    background: rgba(18,86,243,0.06);
    box-shadow: 0 2px 12px rgba(18,86,243,0.12);
  }

  .al-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
    animation: notif-pulse 2s ease-in-out infinite;
  }

  @keyframes notif-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.45; transform: scale(0.65); }
  }

  .al-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 14px 5px 5px;
    background: var(--surface2); border: 1.5px solid var(--border);
    border-radius: 100px; cursor: pointer; transition: all 0.2s;
  }

  .al-user-chip:hover {
    border-color: rgba(18,86,243,0.32);
    background: rgba(18,86,243,0.04);
    box-shadow: 0 2px 10px rgba(18,86,243,0.08);
  }

  .al-chip-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--blue), var(--cyan));
    font-family: 'Manrope', sans-serif;
    font-size: 12px; font-weight: 800;
    color: #fff;
    box-shadow: 0 0 10px rgba(18,86,243,0.38);
  }

  .al-chip-name {
    font-size: 13px; font-weight: 700;
    color: var(--text2); letter-spacing: -0.01em;
  }

  /* ─── MOBILE ─── */
  .al-mobile-menu-btn {
    display: none; width: 36px; height: 36px; border-radius: 9px;
    align-items: center; justify-content: center;
    background: var(--surface2); border: 1.5px solid var(--border);
    color: var(--muted); cursor: pointer; transition: all 0.2s;
  }

  .al-mobile-menu-btn:hover {
    color: var(--blue);
    border-color: rgba(18,86,243,0.38);
    background: rgba(18,86,243,0.05);
  }

  .al-mobile-overlay {
    position: fixed; inset: 0; z-index: 90;
    background: rgba(5,16,58,0.62); backdrop-filter: blur(6px);
  }

  .al-mobile-sidebar {
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
    width: 264px; display: flex; flex-direction: column;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    animation: slide-in 0.22s ease;
  }

  @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }

  /* ─── MAIN SCROLL ─── */
  .al-main {
    flex: 1; overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .al-main::-webkit-scrollbar { width: 4px; }
  .al-main::-webkit-scrollbar-track { background: transparent; }
  .al-main::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  @media (max-width: 768px) {
    .al-sidebar { display: none; }
    .al-mobile-menu-btn { display: flex; }
    .al-topbar { padding: 12px 16px; }
  }
`;

export default function AppLayout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser]             = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/me/`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUser({ name: d.name, email: d.email ?? "" }); });
  }, []);

  const initials    = user?.name?.charAt(0).toUpperCase() ?? "U";
  const displayName = user?.name ?? "User";

  const SidebarInner = ({ onNav }: { onNav?: () => void }) => (
    <>
      <div className="al-sidebar-topbar" />
      <div className="al-sidebar-blob" />

      {/* Logo */}
      <div className="al-logo">
        <div className="al-logo-icon">
          <Zap size={15} color="#fff" />
        </div>
        {!collapsed && (
          <div className="al-logo-text">
            <div className="al-logo-name">Field<span>Scope</span></div>
            <div className="al-logo-sub">Business Intelligence</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="al-nav">
        {navSections.map((section) => (
          <div key={section.label} className="al-nav-section">
            {!collapsed && <div className="al-section-label">{section.label}</div>}
            {section.items.map((item) => {
              const ps = phaseStyle[item.phase];
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNav}
                  className={({ isActive }) => `al-nav-item${isActive ? " active-nav" : ""}`}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={15}
                        className="al-nav-icon"
                        style={{ color: isActive ? "#fff" : ps.iconColor, opacity: isActive ? 1 : 0.72 }}
                      />
                      {!collapsed && (
                        <span className="al-nav-label">{item.label}</span>
                      )}
                      {!collapsed && (
                        <span
                          className="al-phase-badge"
                          style={{ background: ps.badge, color: ps.color }}
                        >
                          P{item.phase}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="al-sidebar-footer">
        {!collapsed && (
          <div className="al-user-strip">
            <div className="al-user-avatar">{initials}</div>
            <div className="al-user-name">{displayName}</div>
          </div>
        )}
        <button className="al-footer-btn" onClick={() => {}}>
          <Settings size={14} style={{ flexShrink: 0, opacity: 0.65 }} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button className="al-footer-btn" onClick={() => navigate("/")}>
          <LogOut size={14} style={{ flexShrink: 0, opacity: 0.65 }} />
          {!collapsed && <span>Back to Home</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="al-root">

        {/* Desktop Sidebar */}
        <aside className="al-sidebar" style={{ width: collapsed ? 60 : 232 }}>
          <SidebarInner />
          <button
            className="al-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
          </button>
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <>
            <div className="al-mobile-overlay" onClick={() => setMobileOpen(false)} />
            <aside className="al-mobile-sidebar">
              <SidebarInner onNav={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        {/* Right Panel */}
        <div className="al-right">
          <header className="al-topbar">
            <button className="al-mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div className="al-search">
              <Search size={13} color="#6E82C0" />
              <span>Search modules, domains…</span>
            </div>

            <div className="al-topbar-right">
              <button className="al-notif-btn">
                <Bell size={15} />
                <div className="al-notif-dot" />
              </button>

              <div className="al-user-chip">
                <div className="al-chip-avatar">{initials}</div>
                <span className="al-chip-name">{displayName}</span>
              </div>
            </div>
          </header>

          <main className="al-main">
            <Outlet />
          </main>
        </div>

      </div>
    </>
  );
}