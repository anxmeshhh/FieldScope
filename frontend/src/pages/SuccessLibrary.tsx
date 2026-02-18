const stories = [
  {
    title: "From Freelancer to ₹1Cr Agency in 18 Months",
    industry: "Digital Marketing",
    level: "Beginner → Intermediate",
    duration: "18 months",
    key: "Specialized in SaaS SEO niche",
    lessons: ["Niched down early", "Hired a sales person at 6-month mark", "Moved to retainer model"],
    emoji: "🚀",
    color: "var(--cyan)",
  },
  {
    title: "Construction Company Scaled to ₹10Cr",
    industry: "Construction",
    level: "Contractor → Developer",
    duration: "3 years",
    key: "Focused on affordable housing in Tier-2",
    lessons: ["Entered underserved markets", "Government scheme partnerships", "Built subcontractor network"],
    emoji: "🏗️",
    color: "var(--orange)",
  },
  {
    title: "D2C Brand: ₹0 to ₹2Cr in First Year",
    industry: "D2C E-Commerce",
    level: "Seller → Brand",
    duration: "12 months",
    key: "Community-first GTM on Instagram",
    lessons: ["Built audience before product", "Focused on one SKU initially", "Leveraged influencer seeding"],
    emoji: "📦",
    color: "var(--purple)",
  },
  {
    title: "AgriTech Pivot: Failed App → Profitable B2B",
    industry: "AgriTech",
    level: "Startup → Platform",
    duration: "8 months",
    key: "Switched from B2C to B2B2C model",
    lessons: ["Pivoted based on user interviews", "Partnered with FPOs", "Focused on integration not UI"],
    emoji: "🌾",
    color: "var(--green)",
  },
];

export default function SuccessLibrary() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "hsl(var(--cyan))" }}>Module 10 — Phase 3</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>
          Success Path Library
        </h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Real case studies, common growth trajectories & pivot stories — anonymized
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stories.map((s) => (
          <div key={s.title}
            className="rounded-2xl border p-6 card-hover relative overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
              style={{ background: `hsl(${s.color})` }} />
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <h3 className="font-syne font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>
                  {s.title}
                </h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: `hsl(${s.color} / 0.1)`, color: `hsl(${s.color})` }}>
                    {s.industry}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "hsl(var(--navy-600))", color: "hsl(var(--muted-foreground))" }}>
                    {s.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-4 px-3 py-2 rounded-lg text-xs"
              style={{ background: "hsl(var(--navy-700))", color: "hsl(var(--muted-foreground))" }}>
              <span style={{ color: `hsl(${s.color})` }}>Key:</span> {s.key}
            </div>
            <div>
              <div className="text-xs font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>Key Lessons</div>
              <ul className="space-y-1.5">
                {s.lessons.map((l) => (
                  <li key={l} className="flex items-center gap-2 text-xs"
                    style={{ color: "hsl(var(--muted-foreground))" }}>
                    <span style={{ color: `hsl(${s.color})` }}>→</span> {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
