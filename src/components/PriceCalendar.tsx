import { useState, useMemo } from "react";
import { usePriceCalendar } from "@/hooks/usePriceCalendar";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import { ChevronLeft, ChevronRight, Plane, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from "date-fns";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PriceCalendar = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStr = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const { prices, loading } = usePriceCalendar(origin, destination, monthStr);

  // Build a map of date -> cheapest price
  const priceMap = useMemo(() => {
    const map: Record<string, { value: number; changes: number }> = {};
    for (const p of prices) {
      const existing = map[p.depart_date];
      if (!existing || p.value < existing.value) {
        map[p.depart_date] = { value: p.value, changes: p.number_of_changes };
      }
    }
    return map;
  }, [prices]);

  // Find min/max for color scale
  const allValues = Object.values(priceMap).map((p) => p.value);
  const minPrice = allValues.length ? Math.min(...allValues) : 0;
  const maxPrice = allValues.length ? Math.max(...allValues) : 0;

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday = 0, Sunday = 6 (ISO)
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  const getPriceColor = (value: number) => {
    if (allValues.length <= 1) return "bg-primary/20 text-primary";
    const ratio = maxPrice === minPrice ? 0 : (value - minPrice) / (maxPrice - minPrice);
    if (ratio <= 0.33) return "bg-emerald-500/20 text-emerald-400";
    if (ratio <= 0.66) return "bg-amber-500/20 text-amber-400";
    return "bg-red-500/20 text-red-400";
  };

  const buildSearchLink = (dateStr: string) => {
    if (!origin || !destination) return "#";
    const d = dateStr.replace(/-/g, "");
    const day = d.slice(6, 8);
    const month = d.slice(4, 6);
    return `https://aviasales.tpx.lu/xAVufDUr?shmarker=515371&search_url=${encodeURIComponent(`/search/${origin}${day}${month}${destination}1`)}`;
  };

  const hasData = origin && destination;

  return (
    <section className="py-20 px-5 md:px-10 bg-background">
      <div className="max-w-[1160px] mx-auto">
        <div className="mb-9">
          <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">Explore prices</div>
          <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight">
            Price calendar
          </h2>
          <p className="text-sm text-foreground/50 mt-1">Find the cheapest day to fly — powered by real search data</p>
        </div>

        {/* Route selector */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <AirportAutocomplete
              label="From"
              value={origin}
              onChange={setOrigin}
              placeholder="City or airport"
            />
          </div>
          <div className="flex-1">
            <AirportAutocomplete
              label="To"
              value={destination}
              onChange={setDestination}
              placeholder="City or airport"
            />
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            disabled={isSameMonth(currentMonth, new Date())}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <h3 className="font-display text-lg font-bold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Calendar grid */}
        {!hasData ? (
          <div className="text-center py-16 text-foreground/40">
            <Plane className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Select origin and destination to see prices</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-foreground/40 mt-2">Loading prices…</p>
          </div>
        ) : allValues.length === 0 ? (
          <div className="text-center py-16 text-foreground/40">
            <Plane className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No price data available for this month</p>
            <p className="text-xs mt-1 text-foreground/30">Try a different month or a more popular route (e.g. DXB → LHR)</p>
          </div>
        ) : (
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold text-foreground/40 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {daysInMonth.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const priceData = priceMap[dateStr];
                const isPast = day < new Date(new Date().toDateString());

                return (
                  <a
                    key={dateStr}
                    href={priceData ? buildSearchLink(dateStr) : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      relative rounded-xl p-2 min-h-[72px] flex flex-col items-center justify-center transition-all duration-200 no-underline
                      ${isPast ? "opacity-30 pointer-events-none" : ""}
                      ${priceData
                        ? `${getPriceColor(priceData.value)} cursor-pointer hover:scale-105 hover:shadow-lg`
                        : "bg-foreground/[0.03] border border-foreground/[0.05]"
                      }
                      ${priceData && priceData.value === minPrice && !isPast ? "ring-2 ring-emerald-400/50" : ""}
                    `}
                  >
                    <span className="text-[11px] text-foreground/50 font-medium">
                      {format(day, "d")}
                    </span>
                    {priceData ? (
                      <span className="text-[13px] font-bold mt-0.5">
                        {priceData.value.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-foreground/20 mt-0.5">—</span>
                    )}
                    {priceData?.changes === 0 && !isPast && (
                      <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5 text-emerald-400">
                        Direct
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Legend */}
            {allValues.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-foreground/50">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500/20 inline-block" /> Cheapest
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-500/20 inline-block" /> Average
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500/20 inline-block" /> Priciest
                </span>
                <span className="text-foreground/30">• Prices in AED</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PriceCalendar;
