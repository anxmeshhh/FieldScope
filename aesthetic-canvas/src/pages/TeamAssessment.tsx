const team = [
  { name: "Rohan Mehta", role: "SEO Lead", skills: ["Technical SEO", "Link Building"], score: 82, gap: "Low" },
  { name: "Priya Sharma", role: "Content Writer", skills: ["Blog Writing", "Copywriting"], score: 75, gap: "Medium" },
  { name: "Arjun Shah", role: "Founder / Strategy", skills: ["Paid Ads", "Client Management", "Analytics"], score: 90, gap: "Low" },
];

export default function TeamAssessment() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up space-y-8">
      <div>
        <div className="font-syne text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "hsl(var(--cyan))" }}>Module 13 — Phase 4</div>
        <h1 className="font-syne font-black text-3xl" style={{ color: "hsl(var(--foreground))" }}>Team Assessment</h1>
        <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Evaluate your entire team's capabilities, skill gaps & hiring recommendations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Team Score", val: "82/100", color: "var(--cyan)" },
          { label: "Skill Gaps", val: "4 Critical", color: "var(--orange)" },
          { label: "Hiring Priority", val: "Designer", color: "var(--purple)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5 text-center" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="font-syne font-black text-2xl" style={{ color: `hsl(${s.color})` }}>{s.val}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {team.map((member) => (
          <div key={member.name} className="rounded-2xl border p-6 card-hover" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-syne font-bold text-base"
                  style={{ background: "hsl(var(--cyan) / 0.12)", color: "hsl(var(--cyan))" }}>
                  {member.name[0]}
                </div>
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>{member.name}</div>
                  <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{member.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: member.gap === "Low" ? "hsl(var(--green) / 0.12)" : "hsl(var(--orange) / 0.12)",
                    color: member.gap === "Low" ? "hsl(var(--green))" : "hsl(var(--orange))",
                  }}>
                  {member.gap} Gap
                </span>
                <div className="font-syne font-black text-lg" style={{ color: "hsl(var(--cyan))" }}>{member.score}</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--navy-600))" }}>
                <div className="h-full rounded-full" style={{ width: `${member.score}%`, background: "hsl(var(--cyan))" }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((s) => (
                <span key={s} className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: "hsl(var(--navy-700))", color: "hsl(var(--muted-foreground))" }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
