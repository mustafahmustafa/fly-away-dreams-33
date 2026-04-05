import { useSiteConfig } from "@/hooks/useSiteConfig";

interface FeaturesConfig {
  section_label: string;
  section_title: string;
  items: { icon: string; title: string; desc: string }[];
}

const FeaturesSection = () => {
  const { data: config } = useSiteConfig<FeaturesConfig>("features");
  const c = config ?? { section_label: "Why choose us", section_title: "Built for modern travellers", items: [] };

  return (
    <section className="py-20 px-5 md:px-10 bg-midnight-soft">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-end justify-between mb-9">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">{c.section_label}</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight">{c.section_title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {c.items.map((f) => (
            <div key={f.title} className="bg-foreground/[0.03] border border-foreground/[0.07] rounded-[22px] p-7 px-6 transition-all duration-300 hover:bg-primary/[0.06] hover:border-primary/25 hover:-translate-y-0.5">
              <div className="w-11 h-11 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center text-xl mb-[18px]">{f.icon}</div>
              <div className="font-display text-[17px] font-bold text-foreground mb-2 tracking-tight">{f.title}</div>
              <p className="text-sm font-light text-foreground/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
