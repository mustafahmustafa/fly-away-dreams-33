import { useEffect, useState } from "react";

const WIDGET_URL = "https://tpscr.com/content?currency=aed&trs=515371&shmarker=716584&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%230057FF&color_button=%230057FF&color_icons=%2300D4FF&dark=%23FFFFFF&light=%230A1228&secondary=%23050A1A&special=%23ba255255&color_focused=%233D7FFF&border_radius=0&no_labels=&plain=true&promo_id=7879&campaign_id=100";
const RESIZE_MESSAGE_TYPE = "travelpayouts-widget:resize";
const MIN_WIDGET_HEIGHT = 420;
const MAX_WIDGET_HEIGHT = 960;

const iframeMarkup = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: ${MIN_WIDGET_HEIGHT}px;
        background: transparent;
        overflow: hidden;
      }
      body {
        display: block;
      }
      #tp-widget-shell {
        width: 100%;
        min-height: ${MIN_WIDGET_HEIGHT}px;
      }
    </style>
  </head>
  <body>
    <div id="tp-widget-shell">
      <script>
        (function () {
          var messageType = "${RESIZE_MESSAGE_TYPE}";

          var sendHeight = function () {
            var height = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight,
              document.documentElement.offsetHeight,
              document.body.offsetHeight,
              document.documentElement.clientHeight,
              document.body.clientHeight
            );

            parent.postMessage({ type: messageType, height: height + 12 }, "*");
          };

          var queueHeight = function () {
            window.requestAnimationFrame(sendHeight);
          };

          window.addEventListener("load", function () {
            queueHeight();
            window.setTimeout(queueHeight, 250);
            window.setTimeout(queueHeight, 1000);
            window.setTimeout(queueHeight, 2500);
          });

          new MutationObserver(queueHeight).observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
          });

          if ("ResizeObserver" in window) {
            var resizeObserver = new ResizeObserver(queueHeight);
            resizeObserver.observe(document.documentElement);
            resizeObserver.observe(document.body);
          }
        })();
      </script>
      <script async src="${WIDGET_URL}" charset="utf-8"></script>
    </div>
  </body>
</html>`;

const TravelpayoutsWidget = () => {
  const [height, setHeight] = useState(MIN_WIDGET_HEIGHT);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
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
        srcDoc={iframeMarkup}
        className="block w-full border-0 bg-transparent"
        style={{ height }}
        loading="eager"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default TravelpayoutsWidget;
