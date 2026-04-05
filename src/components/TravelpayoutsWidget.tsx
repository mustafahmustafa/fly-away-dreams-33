import { useEffect, useRef } from "react";

const TravelpayoutsWidget = () => {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    // Check if script already exists
    if (document.querySelector('script[src*="tpscr.com"]')) {
      loaded.current = true;
      return;
    }
    loaded.current = true;
    const script = document.createElement("script");
    script.async = true;
    script.type = "module";
    script.src = "https://tpscr.com/wl_web/main.js?wl_id=15918";
    document.head.appendChild(script);
  }, []);

  return null;
};

export default TravelpayoutsWidget;
