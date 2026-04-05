import { useSiteConfig } from "@/hooks/useSiteConfig";

interface HowItWorksConfig {
  section_label: string;
  section_title: string;
  items: { num: number; title: string; desc: string }[];
}

const HowItWorks = () => {
  const { data: config } = useSiteConfig<HowItWorksConfig>("how_it_works");
  const c = config ?? { section_label: "Simple process", section_title: "Book in 3 easy steps", items: [] };

  return (
    <section className="py-20 px-5 md:px-10 bg-midnight">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-end justify-between mb-9">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">{c.section_label}</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight">{c.section_title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 max-w-[1000px] mx-auto relative">
          <div className="hidden lg:block absolute top-[26px] left-[10%] right-[10%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,87,255,0.3), transparent)' }} />
          {c.items.map((step) => (
            <div key={step.num} className="p-6 text-center relative">
              <div className="w-[52px] h-[52px] bg-midnight border-[1.5px] border-primary/40 rounded-full flex items-center justify-center font-display text-lg font-extrabold text-sky-light mx-auto mb-[18px] relative z-10">{step.num}</div>
              <div className="font-display text-base font-bold text-foreground mb-2">{step.title}</div>
              <p className="text-[13px] font-light text-foreground/45 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
