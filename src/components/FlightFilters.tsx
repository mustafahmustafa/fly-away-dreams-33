import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterState {
  maxPrice: number | null;
  stops: number[];        // e.g. [0], [0,1], [0,1,2]
  airlines: string[];     // carrier codes
  sortBy: "price" | "duration" | "departure";
}

interface FlightFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceRange: [number, number];
  availableStops: number[];
  availableAirlines: { code: string; name: string }[];
}

const FlightFilters = ({ filters, onChange, priceRange, availableStops, availableAirlines }: FlightFiltersProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleStop = (s: number) => {
    const next = filters.stops.includes(s)
      ? filters.stops.filter((v) => v !== s)
      : [...filters.stops, s];
    onChange({ ...filters, stops: next });
  };

  const toggleAirline = (code: string) => {
    const next = filters.airlines.includes(code)
      ? filters.airlines.filter((v) => v !== code)
      : [...filters.airlines, code];
    onChange({ ...filters, airlines: next });
  };

  const clearAll = () => {
    onChange({ maxPrice: null, stops: [], airlines: [], sortBy: "price" });
  };

  const hasActiveFilters = filters.maxPrice !== null || filters.stops.length > 0 || filters.airlines.length > 0;

  return (
    <div className="mb-4">
      {/* Sort + filter toggle row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort buttons */}
        <div className="flex rounded-lg overflow-hidden border border-foreground/10 text-xs">
          {([
            ["price", "Cheapest"],
            ["duration", "Fastest"],
            ["departure", "Earliest"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...filters, sortBy: key })}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filters.sortBy === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground/60 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs gap-1.5 border-foreground/10"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              {(filters.stops.length > 0 ? 1 : 0) + (filters.airlines.length > 0 ? 1 : 0) + (filters.maxPrice !== null ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-foreground/40 hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-3 p-4 rounded-xl border border-foreground/10 bg-secondary/20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price */}
          <div>
            <p className="text-xs font-medium text-foreground/60 mb-3">Max Price</p>
            <Slider
              min={priceRange[0]}
              max={priceRange[1]}
              step={10}
              value={[filters.maxPrice ?? priceRange[1]]}
              onValueChange={([v]) => onChange({ ...filters, maxPrice: v >= priceRange[1] ? null : v })}
              className="mb-2"
            />
            <p className="text-xs text-foreground/40">
              {filters.maxPrice !== null ? `Up to $${filters.maxPrice.toLocaleString()}` : "Any price"}
            </p>
          </div>

          {/* Stops */}
          <div>
            <p className="text-xs font-medium text-foreground/60 mb-3">Stops</p>
            <div className="space-y-2">
              {availableStops.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.stops.includes(s)}
                    onCheckedChange={() => toggleStop(s)}
                  />
                  <span className="text-sm text-foreground/80">
                    {s === 0 ? "Direct" : `${s} stop${s > 1 ? "s" : ""}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Airlines */}
          {availableAirlines.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground/60 mb-3">Airlines</p>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {availableAirlines.slice(0, 15).map((a) => (
                  <label key={a.code} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.airlines.includes(a.code)}
                      onCheckedChange={() => toggleAirline(a.code)}
                    />
                    <span className="text-sm text-foreground/80 truncate">{a.name || a.code}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightFilters;
