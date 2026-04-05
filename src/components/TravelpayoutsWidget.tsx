import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://www.travelpayouts.com/widgets/aviasales.js";

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
