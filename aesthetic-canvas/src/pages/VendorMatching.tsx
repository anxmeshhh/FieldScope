export default function VendorMatching() {
  const vendors = [
    { name: "SEMrush", category: "SEO Tool", fit: 95, price: "₹8,500/mo", badge: "Top Match" },
    { name: "HubSpot CRM", category: "CRM", fit: 88, price: "₹6,000/mo", badge: "Recommended" },
    { name: "Canva Pro", category: "Design", fit: 92, price: "₹4,000/mo", badge: "Top Match" },
    { name: "Zoho Suite", category: "Business Ops", fit: 80, price: "₹3,500/mo", badge: "Good Fit" },
    { name: "Razorpay", category: "Payments", fit: 98, price: "2% per txn", badge: "Top Match" },
    { name: "Freshdesk", category: "Support", fit: 75, price: "₹2,000/mo", badge: "Good Fit" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "hsl(var(--cyan))" }}>Module 11 — Phase 3</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>Vendor & Partner Matching</h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>AI-matched tools, service providers & partners for your business level</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vendors.map((v) => (
          <div key={v.name} className="rounded-2xl border p-5 card-hover" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-syne font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>{v.name}</h3>
                <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{v.category}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: "hsl(var(--cyan) / 0.12)", color: "hsl(var(--cyan))" }}>{v.badge}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Fit Score</span>
                <span className="font-bold" style={{ color: "hsl(var(--green))" }}>{v.fit}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--navy-600))" }}>
                <div className="h-full rounded-full" style={{ width: `${v.fit}%`, background: "hsl(var(--green))" }} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-syne font-bold" style={{ color: "hsl(var(--cyan))" }}>{v.price}</span>
              <button className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
