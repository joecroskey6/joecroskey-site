import Link from "next/link";

const sections = [
  {
    href: "/fun/cigarettes",
    label: "chinese cigarettes",
    description: "pack art, pricing, and regional brands across mainland China.",
    accent: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #c0392b 100%)",
    shadow: "rgba(238, 90, 36, 0.3)",
  },
  {
    href: "/fun/cocktails",
    label: "cocktails",
    description: "A gallery of classic and contemporary cocktails — glass types, garnishes, and names.",
    accent: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 50%, #4834d4 100%)",
    shadow: "rgba(108, 92, 231, 0.3)",
  },
];

export default function FunPage() {
  return (
    <div className="px-6 max-w-[1800px] mx-auto pb-12">
      <div className="mt-6 mb-10">
        <div className="glass-card inline-block px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">fun stuff</h1>
          <p className="text-sm text-muted mt-1">
            other archives worth browsing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="group">
            <div className="glass-card p-5 h-full">
              <div
                className="w-10 h-10 rounded-full mb-4 flex-shrink-0"
                style={{
                  background: s.accent,
                  boxShadow: `0 4px 16px ${s.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                }}
              />
              <h2 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                {s.label}
              </h2>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
