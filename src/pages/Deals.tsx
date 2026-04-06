import { useState, useMemo } from "react";
import { useDealsData, Deal } from "@/hooks/useDealsData";
import { Plane, Clock, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getCityImageUrl(iataCode: string): string {
  return `https://img.avs.io/explore/cities/${iataCode}?rs:fill:960:720`;
}

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

type SortOption = "price-asc" | "price-desc" | "duration-asc" | "date-asc";
type StopsFilter = "all" | "direct" | "1stop" | "2plus";

const Deals = () => {
  const { deals, origin, loading } = useDealsData();
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>("all");
  const [maxPrice, setMaxPrice] = useState<number[]>([0]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const priceRange = useMemo(() => {
    if (!deals.length) return { min: 0, max: 10000 };
    const prices = deals.map((d) => d.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [deals]);

  const currentMax = maxPrice[0] === 0 ? priceRange.max : maxPrice[0];

  const airlines = useMemo(() => {
    const set = new Set(deals.map((d) => d.airline));
    return Array.from(set).sort();
  }, [deals]);

  const filtered = useMemo(() => {
    let result = [...deals];

    // Stops
    if (stopsFilter === "direct") result = result.filter((d) => d.transfers === 0);
    else if (stopsFilter === "1stop") result = result.filter((d) => d.transfers === 1);
    else if (stopsFilter === "2plus") result = result.filter((d) => d.transfers >= 2);

    // Price
    if (maxPrice[0] > 0) result = result.filter((d) => d.price <= maxPrice[0]);

    // Airlines
    if (selectedAirlines.length > 0) result = result.filter((d) => selectedAirlines.includes(d.airline));

    // Sort
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "duration-asc": result.sort((a, b) => a.duration - b.duration); break;
      case "date-asc": result.sort((a, b) => new Date(a.departure_at).getTime() - new Date(b.departure_at).getTime()); break;
    }
    return result;
  }, [deals, stopsFilter, maxPrice, selectedAirlines, sortBy]);

  const toggleAirline = (code: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code]
    );
  };

  const clearFilters = () => {
    setStopsFilter("all");
    setMaxPrice([0]);
    setSelectedAirlines([]);
  };

  const hasActiveFilters = stopsFilter !== "all" || maxPrice[0] > 0 || selectedAirlines.length > 0;

  const buildBookingUrl = (link: string) => {
    if (!link) return "#";
    return `https://www.aviasales.com${link}`;
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-5 md:px-10">
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">
            All destinations
          </div>
          <h1 className="font-display text-[36px] md:text-[42px] font-extrabold text-foreground tracking-[-1px] leading-tight">
            Flight Deals
          </h1>
          {origin && (
            <p className="text-sm text-foreground/40 mt-1">Departing from {origin}</p>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                !
              </Badge>
            )}
          </Button>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[180px] h-9 text-sm bg-card border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Cheapest first</SelectItem>
              <SelectItem value="price-desc">Most expensive</SelectItem>
              <SelectItem value="duration-asc">Shortest flight</SelectItem>
              <SelectItem value="date-asc">Earliest departure</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-foreground/50 gap-1">
              <X className="w-3.5 h-3.5" /> Clear filters
            </Button>
          )}

          <span className="ml-auto text-sm text-foreground/40">
            {loading ? "Loading..." : `${filtered.length} deal${filtered.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stops */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3 block">
                Stops
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  ["all", "Any"],
                  ["direct", "Direct"],
                  ["1stop", "1 Stop"],
                  ["2plus", "2+ Stops"],
                ] as [StopsFilter, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setStopsFilter(val)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      stopsFilter === val
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-foreground/60 border-foreground/10 hover:border-foreground/25"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3 block">
                Max Price: AED {currentMax.toLocaleString()}
              </label>
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={50}
                value={[currentMax]}
                onValueChange={setMaxPrice}
                className="mt-2"
              />
              <div className="flex justify-between text-[10px] text-foreground/30 mt-1">
                <span>AED {priceRange.min.toLocaleString()}</span>
                <span>AED {priceRange.max.toLocaleString()}</span>
              </div>
            </div>

            {/* Airlines */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3 block">
                Airlines
              </label>
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                {airlines.map((code) => (
                  <button
                    key={code}
                    onClick={() => toggleAirline(code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selectedAirlines.includes(code)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-foreground/60 border-foreground/10 hover:border-foreground/25"
                    }`}
                  >
                    <img
                      src={`https://pics.avs.io/36/18/${code}.png`}
                      alt={code}
                      className="h-3"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-[22px] overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                </div>
              ))
            : filtered.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-foreground/40 text-lg">No deals match your filters</p>
                  <Button variant="ghost" onClick={clearFilters} className="mt-3 text-primary">
                    Clear filters
                  </Button>
                </div>
              )
            : filtered.map((deal) => (
                <a
                  key={`${deal.destination}-${deal.departure_at}`}
                  href={buildBookingUrl(deal.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-card border border-border rounded-[22px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.06] no-underline"
                >
                  <div className="h-40 relative overflow-hidden">
                    <img
                      src={getCityImageUrl(deal.destination)}
                      alt={deal.city}
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(5,10,26,0.85) 100%)" }}
                    />
                    <div className="absolute top-3 right-3">
                      <img
                        src={`https://pics.avs.io/60/30/${deal.airline}.png`}
                        alt={deal.airline}
                        className="opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
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
    </main>
  );
};

export default Deals;
