import { useEffect, useState } from "react";

const IFRAME_SRC = "/travelpayouts-widget.html";
const RESIZE_MESSAGE_TYPE = "travelpayouts-widget:resize";
const MIN_WIDGET_HEIGHT = 420;
const MAX_WIDGET_HEIGHT = 960;

const TravelpayoutsWidget = () => {
  const [height, setHeight] = useState(MIN_WIDGET_HEIGHT);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== "object" || data.type !== RESIZE_MESSAGE_TYPE) {
        return;
      }

      const nextHeight = Number(data.height);
      if (!Number.isFinite(nextHeight)) {
        return;
      }

      const safeHeight = Math.max(
        MIN_WIDGET_HEIGHT,
        Math.min(Math.ceil(nextHeight), MAX_WIDGET_HEIGHT),
      );

      setHeight((currentHeight) =>
        currentHeight === safeHeight ? currentHeight : safeHeight,
      );
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.125rem] border border-foreground/10 bg-secondary/30 shadow-[var(--shadow-sky-lg)] backdrop-blur-sm">
      <iframe
        title="SkyVoyAI flights and hotels search"
        src={IFRAME_SRC}
        className="block w-full border-0 bg-transparent"
        style={{ height }}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default TravelpayoutsWidget;
