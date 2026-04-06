import { useDealsData } from "@/hooks/useDealsData";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Plane, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DealsConfig {
  section_label: string;
  section_title: string;
  view_all_text: string;
}

// City gradient backgrounds for visual appeal
const CITY_GRADIENTS: Record<string, string> = {
  London: "linear-gradient(160deg, #2c3e50 0%, #4a4a4a 50%, #7f8c8d 100%)",
  Paris: "linear-gradient(160deg, #2c2c54 0%, #706fd3 50%, #f8c291 100%)",
  Istanbul: "linear-gradient(160deg, #b33939 0%, #cd6133 50%, #e58e26 100%)",
  Bangkok: "linear-gradient(160deg, #1e3c72 0%, #2a5298 50%, #e8b04b 100%)",
  Cairo: "linear-gradient(160deg, #b8860b 0%, #d4a017 40%, #c19a3e 100%)",
  Maldives: "linear-gradient(160deg, #006994 0%, #00b4d8 50%, #48cae4 100%)",
  Mumbai: "linear-gradient(160deg, #e65100 0%, #ff8f00 50%, #ffc107 100%)",
  "Kuala Lumpur": "linear-gradient(160deg, #1a237e 0%, #283593 50%, #42a5f5 100%)",
};

const DEFAULT_GRADIENT = "linear-gradient(160deg, #1a3a5c 0%, #2d6a9f 40%, #c8a96e 100%)";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

const DealsSection = () => {
  const { data: config } = useSiteConfig<DealsConfig>("deals");
  const c = config ?? { section_label: "Limited offers", section_title: "Hot deals this week", view_all_text: "View all deals →" };
  const { deals, origin, loading } = useDealsData();

  const buildBookingUrl = (link: string) => {
    if (!link) return "#";
    return `https://www.aviasales.com${link}`;
  };

  return (
    <section className="py-20 px-5 md:px-10 bg-midnight-soft">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-end justify-between mb-9">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">{c.section_label}</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight">
              {c.section_title}
            </h2>
            {origin && (
              <p className="text-xs text-foreground/40 mt-1">Departing from {origin}</p>
            )}
          </div>
          <a href="#" className="text-[13px] font-medium text-sky-light no-underline border-b border-sky-light/30 pb-px transition-colors hover:border-sky-light whitespace-nowrap mb-1">
            {c.view_all_text}
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-foreground/[0.03] border border-foreground/[0.07] rounded-[22px] overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                </div>
              ))
            : deals.slice(0, 4).map((deal) => (
                <a
                  key={`${deal.destination}-${deal.departure_at}`}
                  href={buildBookingUrl(deal.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-foreground/[0.03] border border-foreground/[0.07] rounded-[22px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.06] no-underline"
                >
                  <div className="h-40 relative overflow-hidden">
                    <div
                      className="w-full h-full transition-transform duration-400 group-hover:scale-105"
                      style={{ background: CITY_GRADIENTS[deal.city] || DEFAULT_GRADIENT }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(5,10,26,0.85) 100%)" }}
                    />
                    {/* Airline logo */}
                    <div className="absolute top-3 right-3">
                      <img
                        src={`https://pics.avs.io/60/30/${deal.airline}.png`}
                        alt={deal.airline}
                        className="opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    {/* Direct badge */}
                    {deal.transfers === 0 && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-0.5">
                        Direct
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3.5 font-display text-[17px] font-bold text-foreground">
                      {deal.city}
                    </div>
                  </div>
                  <div className="p-3.5 px-4">
                    <div className="text-xs text-foreground/45 mb-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        {deal.transfers === 0 ? "Direct flight" : `${deal.transfers} stop${deal.transfers > 1 ? "s" : ""}`}
                      </span>
                      <span className="opacity-30">·</span>
                      {deal.duration > 0 && (
                        <>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(deal.duration)}
                          </span>
                          <span className="opacity-30">·</span>
                        </>
                      )}
                      <span>{formatDate(deal.departure_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-foreground/35 mb-0.5">From</div>
                        <div className="font-display text-[22px] font-extrabold text-foreground">
                          AED {deal.price.toLocaleString()}{" "}
                          <span className="text-[13px] font-normal text-foreground/40">/ person</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full text-[13px] font-medium px-4 py-2 transition-colors group-hover:bg-sky-light">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
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
