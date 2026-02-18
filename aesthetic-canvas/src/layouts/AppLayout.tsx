import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Compass, ClipboardCheck, Lightbulb,
  Map, MessageSquare, BarChart3, ShieldAlert, GitCompare,
  BookOpen, Store, Users2, DollarSign, UserCog,
  ChevronLeft, ChevronRight, Bell, Search, Settings, LogOut,
  Zap, Menu, X
} from "lucide-react";

const navSections = [
  {
    label: "Core",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", phase: 1 },
      { to: "/explore", icon: Compass, label: "Industry Explorer", phase: 1 },
      { to: "/assessment", icon: ClipboardCheck, label: "Capability Assessment", phase: 1 },
      { to: "/recommendations", icon: Lightbulb, label: "AI Recommendations", phase: 1 },
      { to: "/roadmap", icon: Map, label: "Growth Roadmap", phase: 1 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/chat", icon: MessageSquare, label: "AI Business Advisor", phase: 2 },
      { to: "/market", icon: BarChart3, label: "Market Intelligence", phase: 2 },
      { to: "/risk", icon: ShieldAlert, label: "Risk Radar", phase: 2 },
      { to: "/compare", icon: GitCompare, label: "Competitor Compare", phase: 2 },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/success-library", icon: BookOpen, label: "Success Library", phase: 3 },
      { to: "/vendors", icon: Store, label: "Vendor Matching", phase: 3 },
      { to: "/benchmarking", icon: Users2, label: "Peer Benchmarking", phase: 3 },
    ],
  },
  {
    label: "Enterprise",
    items: [
      { to: "/team", icon: UserCog, label: "Team Assessment", phase: 4 },
      { to: "/financial", icon: DollarSign, label: "Financial Planning", phase: 4 },
    ],
  },
];

const phaseColors: Record<number, string> = {
  1: "hsl(var(--cyan))",
  2: "hsl(var(--purple))",
  3: "hsl(var(--orange))",
  4: "hsl(var(--green))",
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "hsl(var(--cyan) / 0.15)", border: "1px solid hsl(var(--cyan) / 0.3)" }}
        >
          <Zap size={16} style={{ color: "hsl(var(--cyan))" }} />
        </div>
        {!collapsed && (
          <div>
            <div className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
              FieldScope
            </div>
            <div className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              Business Intelligence
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div
                className="px-2 mb-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative ${
                      isActive ? "nav-active" : "nav-inactive"
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? "hsl(var(--cyan) / 0.1)" : "transparent",
                    color: isActive ? "hsl(var(--cyan))" : "hsl(var(--muted-foreground))",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: phaseColors[item.phase] }}
                        />
                      )}
                      <item.icon
                        size={16}
                        className="shrink-0"
                        style={{ color: isActive ? phaseColors[item.phase] : "hsl(var(--muted-foreground))" }}
                      />
                      {!collapsed && (
                        <span className="truncate font-medium">{item.label}</span>
                      )}
                      {!collapsed && (
                        <span
                          className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{
                            background: `${phaseColors[item.phase]}18`,
                            color: phaseColors[item.phase],
                          }}
                        >
                          P{item.phase}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="p-3 border-t space-y-1"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "hsl(var(--muted-foreground))" }}
          onClick={() => {}}
        >
          <Settings size={15} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "hsl(var(--muted-foreground))" }}
          onClick={() => navigate("/")}
        >
          <LogOut size={15} />
          {!collapsed && <span>Back to Home</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col transition-all duration-300 border-r shrink-0"
        style={{
          width: collapsed ? 64 : 240,
          background: "hsl(var(--sidebar-background))",
          borderColor: "hsl(var(--sidebar-border))",
        }}
      >
        <SidebarContent />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 flex items-center justify-center w-5 h-5 rounded-full border transition-all"
          style={{
            top: "72px",
            left: collapsed ? 52 : 228,
            background: "hsl(var(--sidebar-background))",
            borderColor: "hsl(var(--sidebar-border))",
            color: "hsl(var(--muted-foreground))",
            zIndex: 10,
          }}
        >
          {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "hsl(var(--navy-950) / 0.7)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col md:hidden border-r"
            style={{
              background: "hsl(var(--sidebar-background))",
              borderColor: "hsl(var(--sidebar-border))",
            }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b shrink-0"
          style={{
            background: "hsl(var(--navy-800) / 0.6)",
            borderColor: "hsl(var(--border))",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: "hsl(var(--muted-foreground))" }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-lg border text-sm"
            style={{
              background: "hsl(var(--navy-700))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            <Search size={14} />
            <span>Search modules, domains…</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              className="relative p-2 rounded-lg border transition-all"
              style={{
                background: "hsl(var(--navy-700))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              <Bell size={16} />
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse-glow"
                style={{ background: "hsl(var(--cyan))" }}
              />
            </button>

            {/* User avatar */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer"
              style={{
                background: "hsl(var(--navy-700))",
                borderColor: "hsl(var(--border))",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "hsl(var(--cyan) / 0.15)", color: "hsl(var(--cyan))" }}
              >
                A
              </div>
              <span className="hidden sm:block font-medium" style={{ color: "hsl(var(--foreground))" }}>
                Arjun Shah
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
