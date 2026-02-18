import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Brain, TrendingUp, Shield, Target, Star, ChevronRight } from "lucide-react";

const features = [
  { icon: Zap, title: "Industry Explorer", desc: "Browse 15+ industries with full level breakdowns", phase: 1, color: "var(--cyan)" },
  { icon: Target, title: "Capability Assessment", desc: "AI evaluates your current business level accurately", phase: 1, color: "var(--cyan)" },
  { icon: Brain, title: "AI Recommendations", desc: "Know exactly what to offer, try, or avoid", phase: 1, color: "var(--purple)" },
  { icon: TrendingUp, title: "Growth Roadmap", desc: "6/12/24-month personalized AI-generated plan", phase: 1, color: "var(--green)" },
  { icon: Shield, title: "Risk Radar", desc: "AI-powered warnings before you make costly mistakes", phase: 2, color: "var(--orange)" },
  { icon: Star, title: "Market Intelligence", desc: "Live trends, heatmaps & pricing benchmarks", phase: 2, color: "var(--blue)" },
];

const stats = [
  { val: "15+", label: "Industries" },
  { val: "3", label: "Business Levels" },
  { val: "16", label: "AI Features" },
  { val: "₹50L+", label: "Revenue Potential Mapped" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{
          background: "hsl(var(--navy-900) / 0.9)",
          borderColor: "hsl(var(--border))",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(var(--cyan) / 0.15)", border: "1px solid hsl(var(--cyan) / 0.3)" }}
          >
            <Zap size={14} style={{ color: "hsl(var(--cyan))" }} />
          </div>
          <span className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            FieldScope
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "hsl(var(--cyan))",
              color: "hsl(var(--navy-900))",
            }}
          >
            Enter App <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--cyan) / 0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--purple) / 0.06) 0%, transparent 70%)" }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cyan)) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }} />

        <div className="relative max-w-4xl mx-auto animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8"
            style={{
              background: "hsl(var(--cyan) / 0.08)",
              borderColor: "hsl(var(--cyan) / 0.3)",
              color: "hsl(var(--cyan))",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "hsl(var(--cyan))" }} />
            India's First AI-Powered Business Intelligence Platform
          </div>

          <h1 className="font-syne font-black text-5xl md:text-7xl mb-6 leading-tight">
            <span style={{ color: "hsl(var(--foreground))" }}>Know What You</span>
            <br />
            <span className="gradient-text-cyan">Can Build.</span>
            <br />
            <span style={{ color: "hsl(var(--foreground))" }}>Know How to</span>{" "}
            <span className="gradient-text-cyan">Grow.</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            FieldScope maps your entire industry from beginner to enterprise level, assesses your capabilities
            with AI, and delivers a personalized growth strategy — built specifically for Indian businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105"
              style={{
                background: "hsl(var(--cyan))",
                color: "hsl(var(--navy-900))",
                boxShadow: "0 0 40px hsl(var(--cyan) / 0.3)",
              }}
            >
              Start Free Assessment <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base border transition-all hover:border-cyan-brand"
              style={{
                background: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              Explore Industries <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full mx-auto animate-fade-up stagger-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-syne text-3xl font-black gradient-text-cyan">{s.val}</div>
              <div className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="font-syne text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: "hsl(var(--cyan))" }}>Platform Modules</div>
          <h2 className="font-syne font-black text-4xl" style={{ color: "hsl(var(--foreground))" }}>
            Everything you need to grow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border p-6 card-hover group cursor-pointer"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
              onClick={() => navigate("/dashboard")}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `hsl(${f.color} / 0.12)` }}
              >
                <f.icon size={20} style={{ color: `hsl(${f.color})` }} />
              </div>
              <div
                className="text-[10px] font-bold tracking-wider uppercase mb-1.5"
                style={{ color: `hsl(${f.color})` }}
              >
                Phase {f.phase}
              </div>
              <h3 className="font-syne font-bold text-base mb-2" style={{ color: "hsl(var(--foreground))" }}>
                {f.title}
              </h3>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div
          className="max-w-2xl mx-auto rounded-2xl border p-12"
          style={{
            background: "linear-gradient(135deg, hsl(var(--cyan) / 0.08), hsl(var(--card)))",
            borderColor: "hsl(var(--cyan) / 0.2)",
          }}
        >
          <h2 className="font-syne font-black text-3xl mb-4" style={{ color: "hsl(var(--foreground))" }}>
            Ready to discover your business potential?
          </h2>
          <p className="mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            Join thousands of Indian entrepreneurs who know exactly where they stand and where they're headed.
          </p>
          <button
            onClick={() => navigate("/assessment")}
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105"
            style={{
              background: "hsl(var(--cyan))",
              color: "hsl(var(--navy-900))",
            }}
          >
            Take Free Assessment →
          </button>
        </div>
      </section>

      <footer className="border-t py-8 text-center" style={{ borderColor: "hsl(var(--border))" }}>
        <p className="text-sm font-syne font-bold gradient-text-cyan">FieldScope</p>
        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          "Know What You Can Build. Know How to Grow." · v1.0
        </p>
      </footer>
    </div>
  );
}
