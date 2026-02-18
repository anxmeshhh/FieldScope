import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, TrendingUp, Users, DollarSign } from "lucide-react";

const industries = [
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    emoji: "📱",
    description: "SEO, Social Media, PPC, Content Marketing, Email Campaigns",
    marketSize: "₹32,000 Cr",
    growth: "+28% YoY",
    levels: ["Freelancer", "Agency", "Enterprise"],
    tags: ["High Growth", "Low Capital", "Remote Friendly"],
    color: "var(--cyan)",
  },
  {
    slug: "construction",
    name: "Construction & Real Estate",
    emoji: "🏗️",
    description: "Residential, Commercial, Infrastructure, Interior Design",
    marketSize: "₹14,00,000 Cr",
    growth: "+12% YoY",
    levels: ["Contractor", "Developer", "Conglomerate"],
    tags: ["Capital Intensive", "High Revenue", "Tier-1 Focus"],
    color: "var(--orange)",
  },
  {
    slug: "d2c-ecommerce",
    name: "D2C E-Commerce",
    emoji: "📦",
    description: "Direct-to-consumer brands, logistics, fulfilment, Shopify stores",
    marketSize: "₹55,000 Cr",
    growth: "+45% YoY",
    levels: ["Seller", "Brand", "National Brand"],
    tags: ["Fastest Growing", "Supply Chain", "Marketing Heavy"],
    color: "var(--purple)",
  },
  {
    slug: "healthtech",
    name: "HealthTech",
    emoji: "🏥",
    description: "Telemedicine, health records, wellness apps, diagnostics",
    marketSize: "₹48,000 Cr",
    growth: "+35% YoY",
    levels: ["Clinic", "Chain", "Platform"],
    tags: ["Regulated", "High Impact", "Tier-2 Opportunity"],
    color: "var(--green)",
    comingSoon: true,
  },
  {
    slug: "fintech",
    name: "FinTech",
    emoji: "💰",
    description: "Payments, lending, insurance, wealth management",
    marketSize: "₹2,60,000 Cr",
    growth: "+40% YoY",
    levels: ["NBFC", "Neo-Bank", "Platform"],
    tags: ["RBI Regulated", "High Barriers", "Scale Fast"],
    color: "var(--blue)",
    comingSoon: true,
  },
  {
    slug: "agritech",
    name: "AgriTech",
    emoji: "🌾",
    description: "Precision farming, supply chain, market linkage, agri-inputs",
    marketSize: "₹70,000 Cr",
    growth: "+22% YoY",
    levels: ["Village", "District", "National"],
    tags: ["Rural Focus", "Government Schemes", "B2B2C"],
    color: "var(--yellow)",
    comingSoon: true,
  },
];

export default function IndustryExplorer() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = industries.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-up space-y-8">
      {/* Header */}
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 01 — Phase 1</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Industry Explorer
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Browse industries, understand market opportunities, and see full level breakdowns
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <Search size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
        <input
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "hsl(var(--foreground))" }}
          placeholder="Search industries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((ind) => (
          <div
            key={ind.slug}
            className={`relative rounded-2xl border p-6 transition-all duration-250 group ${ind.comingSoon ? "opacity-60" : "card-hover cursor-pointer"}`}
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
            onClick={() => !ind.comingSoon && navigate(`/explore/${ind.slug}`)}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
              style={{ background: `hsl(${ind.color})` }}
            />

            {ind.comingSoon && (
              <span
                className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "hsl(var(--navy-600))", color: "hsl(var(--muted-foreground))" }}
              >
                Coming Soon
              </span>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className="text-3xl">{ind.emoji}</div>
              <div className="flex-1">
                <h3 className="font-syne font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>
                  {ind.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {ind.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className="rounded-lg p-3 border"
                style={{ background: "hsl(var(--navy-700))", borderColor: "hsl(var(--border))" }}
              >
                <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Market Size</div>
                <div className="font-syne font-bold text-sm" style={{ color: `hsl(${ind.color})` }}>
                  {ind.marketSize}
                </div>
              </div>
              <div
                className="rounded-lg p-3 border"
                style={{ background: "hsl(var(--navy-700))", borderColor: "hsl(var(--border))" }}
              >
                <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Growth</div>
                <div className="font-syne font-bold text-sm" style={{ color: "hsl(var(--green))" }}>
                  {ind.growth}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              {ind.levels.map((l) => (
                <span
                  key={l}
                  className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                  style={{ borderColor: `hsl(${ind.color} / 0.3)`, color: `hsl(${ind.color})`, background: `hsl(${ind.color} / 0.08)` }}
                >
                  {l}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {ind.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "hsl(var(--navy-600))", color: "hsl(var(--muted-foreground))" }}
                >
                  {t}
                </span>
              ))}
            </div>

            {!ind.comingSoon && (
              <div className="mt-4 flex items-center gap-1 text-xs font-medium"
                style={{ color: `hsl(${ind.color})` }}>
                Explore industry <ChevronRight size={12} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
