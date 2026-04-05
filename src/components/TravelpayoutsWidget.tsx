import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://tpscr.com/content?currency=usd&trs=515371&shmarker=716584&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%230057FF&color_button=%230057FF&color_icons=%2300D4FF&dark=%23FFFFFF&light=%230A1228&secondary=%23050A1A&special=%23ba2552&color_focused=%233D7FFF&border_radius=0&plain=true&promo_id=7879&campaign_id=100";

const TravelpayoutsWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.charset = "utf-8";
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.125rem] border border-foreground/10 bg-secondary/30 shadow-[var(--shadow-sky-lg)] backdrop-blur-sm min-h-[420px]">
      <div ref={containerRef} id="tp-widget-root" />
    </div>
  );
};

export default TravelpayoutsWidget;
