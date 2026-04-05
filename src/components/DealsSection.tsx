import { useSiteConfig } from "@/hooks/useSiteConfig";

interface DealsConfig {
  section_label: string;
  section_title: string;
  view_all_text: string;
  items: { city: string; discount: string; flight: string; nights: string; price: string; gradient: string }[];
}

const DealsSection = () => {
  const { data: config } = useSiteConfig<DealsConfig>("deals");
  const c = config ?? { section_label: "Limited offers", section_title: "Hot deals this week", view_all_text: "View all deals →", items: [] };

  return (
    <section className="py-20 px-5 md:px-10 bg-midnight-soft">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-end justify-between mb-9">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">{c.section_label}</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight">{c.section_title}</h2>
          </div>
          <a href="#" className="text-[13px] font-medium text-sky-light no-underline border-b border-sky-light/30 pb-px transition-colors hover:border-sky-light whitespace-nowrap mb-1">
            {c.view_all_text}
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.items.map((deal) => (
            <a key={deal.city} href="#" className="group block bg-foreground/[0.03] border border-foreground/[0.07] rounded-[22px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.06] no-underline">
              <div className="h-40 relative overflow-hidden">
                <div className="w-full h-full transition-transform duration-400 group-hover:scale-105" style={{ background: deal.gradient }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(5,10,26,0.85) 100%)' }} />
                <div className="absolute top-3 left-3 bg-gold text-midnight text-[10px] font-bold tracking-wider uppercase rounded-pill px-2.5 py-0.5">{deal.discount}</div>
                <div className="absolute bottom-3 left-3.5 font-display text-[17px] font-bold text-foreground">{deal.city}</div>
              </div>
              <div className="p-3.5 px-4">
                <div className="text-xs text-foreground/45 mb-2.5 flex items-center gap-1.5">
                  <span>{deal.flight}</span>
                  <span className="opacity-30">·</span>
                  <span>{deal.nights}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-foreground/35 mb-0.5">From</div>
                    <div className="font-display text-[22px] font-extrabold text-foreground">
                      {deal.price} <span className="text-[13px] font-normal text-foreground/40">/ person</span>
                    </div>
                  </div>
                  <button className="bg-primary text-foreground border-none rounded-pill font-body text-[13px] font-medium px-4 py-2 cursor-pointer transition-colors hover:bg-sky-light">Book now</button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
