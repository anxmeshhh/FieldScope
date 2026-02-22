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
      { to: "/roadmap",         icon: Map,             label: "Growth Roadmap",         phase: 1 },
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

const phaseStyle: Record<number, { color: string; badge: string }> = {
  1: { color: "#E85D04", badge: "rgba(232,93,4,0.15)" },
  2: { color: "#FF9A3C", badge: "rgba(255,154,60,0.12)" },
  3: { color: "#FFC56A", badge: "rgba(255,197,106,0.12)" },
  4: { color: "#FFE0AA", badge: "rgba(255,224,170,0.10)" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  .al-root {
    display: flex; height: 100vh; overflow: hidden;
    background: #0A0A0A;
    font-family: 'DM Sans', sans-serif;
    color: #F0F0F0;
    -webkit-font-smoothing: antialiased;
  }

  /* ── SIDEBAR ── */
  .al-sidebar {
    display: flex; flex-direction: column;
    background: #0D0D0D;
    border-right: 1px solid #2A2A2A;
    height: 100vh;
    transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
  }

  .al-sidebar::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #E85D04, transparent);
    z-index: 10;
  }

  /* ── LOGO ── */
  .al-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 22px 18px 20px;
    border-bottom: 1px solid #2A2A2A;
    flex-shrink: 0; overflow: hidden;
  }

  .al-logo-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(232,93,4,0.15);
    border: 1px solid rgba(232,93,4,0.4);
    box-shadow: 0 0 20px rgba(232,93,4,0.25);
    flex-shrink: 0; transition: box-shadow 0.2s;
  }
  .al-logo:hover .al-logo-icon { box-shadow: 0 0 32px rgba(232,93,4,0.5); }

  .al-logo-text { overflow: hidden; }

  .al-logo-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 19px; letter-spacing: 0.1em; color: #F0F0F0;
    white-space: nowrap; line-height: 1;
  }
  .al-logo-name span { color: #E85D04; }

  .al-logo-sub {
    font-size: 10px; color: #666; letter-spacing: 0.08em;
    text-transform: uppercase; font-weight: 600; margin-top: 2px;
  }

  /* ── NAV ── */
  .al-nav {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 16px 10px;
    scrollbar-width: none;
  }
  .al-nav::-webkit-scrollbar { display: none; }

  .al-nav-section { margin-bottom: 24px; }

  .al-section-label {
    font-size: 9px; font-weight: 800; letter-spacing: 0.18em;
    text-transform: uppercase; color: #555;
    padding: 0 10px; margin-bottom: 8px;
    white-space: nowrap; overflow: hidden;
  }

  .al-nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 9px 12px; border-radius: 4px;
    font-size: 13px; font-weight: 500;
    color: #A0A0A0;
    cursor: pointer; border: 1px solid transparent;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s; text-align: left; width: 100%;
    position: relative; white-space: nowrap; overflow: hidden;
    text-decoration: none; margin-bottom: 2px;
  }

  .al-nav-item:hover {
    color: #E0E0E0;
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.06);
  }

  .al-nav-item.active-nav {
    color: #E85D04 !important;
    background: rgba(232,93,4,0.12) !important;
    border-color: rgba(232,93,4,0.25) !important;
  }

  .al-nav-item.active-nav::before {
    content: '';
    position: absolute; left: 0; top: 18%; bottom: 18%;
    width: 2px; border-radius: 0 2px 2px 0;
    background: #E85D04;
    box-shadow: 0 0 8px rgba(232,93,4,0.7);
  }

  .al-nav-icon { flex-shrink: 0; }
  .al-nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

  .al-phase-badge {
    font-size: 9px; font-weight: 800; letter-spacing: 0.06em;
    padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
  }

  /* ── COLLAPSE BTN ── */
  .al-collapse-btn {
    position: absolute; top: 68px; right: -10px; z-index: 20;
    width: 20px; height: 20px; border-radius: 50%;
    background: #1A1A1A; border: 1px solid #333;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #777;
    transition: all 0.2s;
    box-shadow: 2px 0 8px rgba(0,0,0,0.5);
  }
  .al-collapse-btn:hover { background: #222; color: #E85D04; border-color: rgba(232,93,4,0.4); }

  /* ── SIDEBAR FOOTER ── */
  .al-sidebar-footer {
    border-top: 1px solid #2A2A2A;
    padding: 12px 10px; flex-shrink: 0;
  }

  .al-footer-btn {
    display: flex; align-items: center; gap: 11px;
    padding: 9px 12px; border-radius: 4px;
    font-size: 13px; font-weight: 500; color: #777;
    cursor: pointer; border: none; background: transparent;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s; width: 100%; text-align: left;
    white-space: nowrap; overflow: hidden; margin-bottom: 2px;
  }
  .al-footer-btn:hover { color: #D0D0D0; background: rgba(255,255,255,0.04); }

  .al-user-strip {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px 8px; overflow: hidden;
  }

  .al-user-avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #E85D04, #7A2E01);
    font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: #fff;
    box-shadow: 0 0 14px rgba(232,93,4,0.35);
  }

  .al-user-name {
    font-size: 13px; font-weight: 600; color: #C0C0C0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── RIGHT PANEL ── */
  .al-right { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

  /* ── TOPBAR ── */
  .al-topbar {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 28px;
    background: rgba(13,13,13,0.95);
    border-bottom: 1px solid #222;
    backdrop-filter: blur(20px);
    flex-shrink: 0; position: relative; z-index: 50;
  }

  .al-topbar::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,93,4,0.25), transparent);
  }

  .al-search {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px;
    background: #141414; border: 1px solid #2A2A2A;
    border-radius: 40px; flex: 1; max-width: 380px;
    font-size: 13px; color: #666;
    font-family: 'DM Sans', sans-serif; cursor: text;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .al-search:hover { border-color: #3A3A3A; box-shadow: 0 0 0 3px rgba(232,93,4,0.05); }

  .al-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }

  .al-notif-btn {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: #141414; border: 1px solid #2A2A2A;
    color: #777; cursor: pointer;
    transition: all 0.2s; position: relative;
  }
  .al-notif-btn:hover { border-color: rgba(232,93,4,0.4); color: #E85D04; background: rgba(232,93,4,0.08); }

  .al-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px; border-radius: 50%;
    background: #E85D04; box-shadow: 0 0 8px #E85D04;
    animation: notif-pulse 2s infinite;
  }

  @keyframes notif-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  .al-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 14px 6px 6px;
    background: #141414; border: 1px solid #2A2A2A;
    border-radius: 40px; cursor: pointer; transition: all 0.2s;
  }
  .al-user-chip:hover { border-color: rgba(232,93,4,0.35); background: rgba(232,93,4,0.06); }

  .al-chip-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #E85D04, #7A2E01);
    font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: #fff;
    box-shadow: 0 0 12px rgba(232,93,4,0.3);
  }

  .al-chip-name { font-size: 13px; font-weight: 600; color: #C8C8C8; }

  /* ── MOBILE ── */
  .al-mobile-menu-btn {
    display: none; width: 36px; height: 36px; border-radius: 8px;
    align-items: center; justify-content: center;
    background: #141414; border: 1px solid #2A2A2A;
    color: #888; cursor: pointer; transition: all 0.2s;
  }
  .al-mobile-menu-btn:hover { color: #E85D04; border-color: rgba(232,93,4,0.4); }

  .al-mobile-overlay {
    position: fixed; inset: 0; z-index: 90;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
  }

  .al-mobile-sidebar {
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
    width: 260px; display: flex; flex-direction: column;
    background: #0D0D0D; border-right: 1px solid #2A2A2A;
    animation: slide-in 0.22s ease;
  }

  @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }

  .al-main {
    flex: 1; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: #2A2A2A transparent;
  }
  .al-main::-webkit-scrollbar { width: 4px; }
  .al-main::-webkit-scrollbar-track { background: transparent; }
  .al-main::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }

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
      {/* Logo */}
      <div className="al-logo">
        <div className="al-logo-icon">
          <Zap size={15} color="#E85D04" />
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
                        style={{ color: isActive ? ps.color : "#777" }}
                      />
                      {!collapsed && (
                        <span
                          className="al-nav-label"
                          style={{ color: isActive ? ps.color : "#B0B0B0" }}
                        >
                          {item.label}
                        </span>
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
          <Settings size={14} style={{ color: "#777", flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button className="al-footer-btn" onClick={() => navigate("/")}>
          <LogOut size={14} style={{ color: "#777", flexShrink: 0 }} />
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
        <aside className="al-sidebar" style={{ width: collapsed ? 60 : 228 }}>
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
              <Search size={13} color="#555" />
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