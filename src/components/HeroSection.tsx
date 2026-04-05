import { useEffect, useRef } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface HeroConfig {
  badge: string;
  title_line1: string;
  title_line2: string;
  title_highlight: string;
  subtitle: string;
  stats: { num: string; label: string }[];
}

const WIDGET_SCRIPT_SRC =
  "https://tpscr.com/content?currency=aed&trs=515371&shmarker=716584&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%230057FF&color_button=%230057FF&color_icons=%2300D4FF&dark=%23FFFFFF&light=%230A1228&secondary=%23050A1A&special=%23ba255255&color_focused=%233D7FFF&border_radius=0&no_labels=&plain=true&promo_id=7879&campaign_id=100";

const HeroSection = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { data: config } = useSiteConfig<HeroConfig>("hero");

  useEffect(() => {
    if (!widgetRef.current) return;
    // Avoid duplicate scripts
    if (widgetRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.charset = "utf-8";
    widgetRef.current.appendChild(script);
  }, []);

  const c = config ?? {
    badge: "AI-Powered Travel Booking",
    title_line1: "Your journey starts",
    title_line2: "with",
    title_highlight: "smarter search",
    subtitle: "Flights and hotels across 1M+ destinations. Real-time prices, instant booking, powered by AI.",
    stats: [
      { num: "1M+", label: "Hotels worldwide" },
      { num: "500+", label: "Airlines" },
      { num: "195", label: "Countries" },
      { num: "4.9★", label: "Customer rating" },
    ],
  };

  return (
    <section className="min-h-screen bg-midnight flex flex-col items-center justify-center px-5 md:px-10 pt-[120px] pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 900px 600px at 50% 40%, rgba(0,87,255,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 80% 20%, rgba(0,212,255,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 400px 300px at 20% 70%, rgba(0,87,255,0.10) 0%, transparent 60%)
          `
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 75%)',
        }}
      />

      <div className="animate-fade-up inline-flex items-center gap-[7px] bg-accent/10 border border-accent/25 rounded-pill px-3.5 py-1.5 text-xs font-medium text-accent tracking-wider mb-7 relative z-10">
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-dot" />
        {c.badge}
      </div>

      <h1 className="animate-fade-up-1 font-display text-[clamp(44px,7vw,82px)] font-extrabold text-foreground text-center leading-[1.05] tracking-[-2px] max-w-[900px] mb-5 relative z-10">
        {c.title_line1}<br />
        {c.title_line2} <span className="bg-gradient-to-r from-sky-light to-accent bg-clip-text text-transparent">{c.title_highlight}</span>
      </h1>

      <p className="animate-fade-up-2 text-lg font-light text-foreground/55 text-center max-w-[520px] leading-relaxed mb-12 relative z-10">
        {c.subtitle}
      </p>

      {/* Travelpayouts booking widget */}
      <div ref={widgetRef} className="animate-fade-up-3 w-full max-w-[860px] mx-auto relative z-10" />

      <div className="animate-fade-up-4 flex gap-10 mt-11 relative z-10 flex-wrap justify-center">
        {c.stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-10">
            {i > 0 && <div className="w-px h-10 bg-foreground/10 -ml-10" />}
            <div className="text-center">
              <div className="font-display text-[26px] font-extrabold text-foreground leading-none mb-1">{stat.num}</div>
              <div className="text-xs text-foreground/40 tracking-wide">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
