import { useState, useMemo } from "react";
import { type Ticket, type FlightLeg, type Airline, type Agent } from "@/lib/flightSearchApi";
import { Plane, Clock, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FlightFilters, { type FilterState } from "./FlightFilters";

interface FlightResultsProps {
  tickets: Ticket[];
  flightLegs: FlightLeg[];
  airlines: Record<string, Airline>;
  agents: Record<string, Agent>;
  searching: boolean;
  progress: number;
  error: string | null;
  onBook: (proposalId: string) => void;
}

function safeString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.en === "string") return obj.en;
    if (obj.en && typeof obj.en === "object") {
      const inner = obj.en as Record<string, unknown>;
      if (typeof inner.default === "string") return inner.default;
    }
    const first = Object.values(obj).find((v) => typeof v === "string");
    if (first) return first as string;
  }
  return "";
}

function formatTime(dateTime: string) {
  if (!dateTime) return "--:--";
  const d = new Date(dateTime);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(dateTime: string) {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(departTs: number, arriveTs: number) {
  const diff = arriveTs - departTs;
  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  return `${hours}h ${mins}m`;
}

const FlightResults = ({ tickets, flightLegs, airlines, agents, searching, progress, error, onBook }: FlightResultsProps) => {
  const [filters, setFilters] = useState<FilterState>({ maxPrice: null, stops: [], airlines: [], sortBy: "price" });

  // Helper to get metadata for the OUTBOUND segment only (segment 0)
  const getTicketMeta = (ticket: Ticket) => {
    const bestProposal = ticket.proposals[0];
    const outboundFlightIndexes = ticket.segments[0]?.flights || [];
    const outboundLegs = outboundFlightIndexes.map((i) => flightLegs[i]).filter(Boolean);
    const firstLeg = outboundLegs[0];
    const lastLeg = outboundLegs[outboundLegs.length - 1];
    const stops = outboundLegs.length - 1;
    const carrierCode = firstLeg?.operating_carrier_designator?.airline_id || "";
    const price = bestProposal?.price?.amount ?? Infinity;
    const duration = firstLeg && lastLeg ? lastLeg.arrival_unix_timestamp - firstLeg.departure_unix_timestamp : Infinity;
    return { bestProposal, outboundLegs, firstLeg, lastLeg, stops, carrierCode, price, duration };
  };

  // Compute filter options from all tickets
  const { priceRange, availableStops, availableAirlines } = useMemo(() => {
    let minP = Infinity, maxP = 0;
    const stopsSet = new Set<number>();
    const airlinesMap = new Map<string, string>();

    tickets.forEach((t) => {
      const meta = getTicketMeta(t);
      if (meta.price < Infinity) { minP = Math.min(minP, meta.price); maxP = Math.max(maxP, meta.price); }
      stopsSet.add(meta.stops);
      if (meta.carrierCode) {
        const a = airlines[meta.carrierCode];
        airlinesMap.set(meta.carrierCode, safeString(a?.name) || meta.carrierCode);
      }
    });

    return {
      priceRange: [Math.floor(minP === Infinity ? 0 : minP), Math.ceil(maxP || 1000)] as [number, number],
      availableStops: [...stopsSet].sort(),
      availableAirlines: [...airlinesMap].map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [tickets, flightLegs, airlines]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = tickets.filter((t) => {
      const meta = getTicketMeta(t);
      if (!meta.bestProposal || !meta.firstLeg || !meta.lastLeg) return false;
      if (filters.maxPrice !== null && meta.price > filters.maxPrice) return false;
      if (filters.stops.length > 0 && !filters.stops.includes(meta.stops)) return false;
      if (filters.airlines.length > 0 && !filters.airlines.includes(meta.carrierCode)) return false;
      return true;
    });

    list.sort((a, b) => {
      const ma = getTicketMeta(a), mb = getTicketMeta(b);
      if (filters.sortBy === "price") return ma.price - mb.price;
      if (filters.sortBy === "duration") return ma.duration - mb.duration;
      return (ma.firstLeg?.departure_unix_timestamp ?? 0) - (mb.firstLeg?.departure_unix_timestamp ?? 0);
    });

    return list;
  }, [tickets, flightLegs, filters]);

  if (error) {
    return (
      <div className="mt-8 text-center py-10 bg-destructive/10 border border-destructive/20 rounded-xl">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (searching && tickets.length === 0) {
    return (
      <div className="mt-8 text-center py-16">
        <div className="animate-bounce mb-4">
          <Plane className="w-10 h-10 text-primary mx-auto" />
        </div>
        <p className="text-foreground/60 mb-4">Searching flights across 500+ airlines...</p>
        <div className="max-w-xs mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
        <p className="text-foreground/40 text-sm mt-2">{Math.round(progress)}% complete</p>
      </div>
    );
  }

  if (!searching && tickets.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      {searching && (
        <div className="flex items-center gap-3 mb-4">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-foreground/40 whitespace-nowrap">
            {tickets.length} results found...
          </span>
        </div>
      )}

      <FlightFilters
        filters={filters}
        onChange={setFilters}
        priceRange={priceRange}
        availableStops={availableStops}
        availableAirlines={availableAirlines}
      />

      <p className="text-sm text-foreground/50 mb-4">
        {filtered.length} of {tickets.length} flight{tickets.length !== 1 ? "s" : ""}
      </p>

      {filtered.slice(0, 20).map((ticket) => {
        const bestProposal = ticket.proposals[0];
        if (!bestProposal) return null;

        // Use outbound segment only for display
        const outboundFlightIndexes = ticket.segments[0]?.flights || [];
        const outboundLegs = outboundFlightIndexes.map((i) => flightLegs[i]).filter(Boolean);

        const firstLeg = outboundLegs[0];
        const lastLeg = outboundLegs[outboundLegs.length - 1];
        if (!firstLeg || !lastLeg) return null;

        const stops = outboundLegs.length - 1;
        const carrierCode = firstLeg.operating_carrier_designator?.airline_id || "";
        const airline = airlines[carrierCode];
        const agent = agents[String(bestProposal.agent_id)];

        // Check if there's a return segment
        const hasReturn = ticket.segments.length > 1;
        const returnFlightIndexes = hasReturn ? (ticket.segments[1]?.flights || []) : [];
        const returnLegs = returnFlightIndexes.map((i) => flightLegs[i]).filter(Boolean);
        const returnFirstLeg = returnLegs[0];
        const returnLastLeg = returnLegs[returnLegs.length - 1];

        return (
          <div
            key={ticket.id}
            className="flex flex-col md:flex-row items-stretch bg-secondary/30 border border-foreground/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
          >
            {/* Flight info */}
            <div className="flex-1 p-4 md:p-5 space-y-3">
              {/* Outbound */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <img
                    src={`https://img.wway.io/pics/root/${carrierCode}@png?exar=1&rs=fit:40:40`}
                    alt={safeString(airline?.name) || carrierCode}
                    className="w-10 h-10 rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{safeString(airline?.name) || carrierCode}</p>
                    <p className="text-xs text-foreground/40">
                      {firstLeg.operating_carrier_designator?.airline_id}
                      {firstLeg.operating_carrier_designator?.number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{formatTime(firstLeg.local_departure_date_time)}</p>
                    <p className="text-xs text-foreground/40">{firstLeg.origin}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-2">
                    <p className="text-[10px] text-foreground/40 mb-1">
                      {formatDuration(firstLeg.departure_unix_timestamp, lastLeg.arrival_unix_timestamp)}
                    </p>
                    <div className="w-full flex items-center gap-1">
                      <div className="h-px flex-1 bg-foreground/20" />
                      {stops > 0 ? (
                        <span className="text-[10px] text-accent font-medium px-1.5 py-0.5 bg-accent/10 rounded-full">
                          {stops} stop{stops > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[10px] text-primary font-medium px-1.5 py-0.5 bg-primary/10 rounded-full">
                          Direct
                        </span>
                      )}
                      <div className="h-px flex-1 bg-foreground/20" />
                    </div>
                    <p className="text-[10px] text-foreground/30 mt-1">{formatDate(firstLeg.local_departure_date_time)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{formatTime(lastLeg.local_arrival_date_time)}</p>
                    <p className="text-xs text-foreground/40">{lastLeg.destination}</p>
                  </div>
                </div>
              </div>

              {/* Return segment */}
              {hasReturn && returnFirstLeg && returnLastLeg && (
                <>
                  <div className="h-px bg-foreground/5" />
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-10 h-10 flex items-center justify-center text-xs text-foreground/40">↩</div>
                      <div>
                        <p className="text-xs text-foreground/50">Return</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{formatTime(returnFirstLeg.local_departure_date_time)}</p>
                        <p className="text-xs text-foreground/40">{returnFirstLeg.origin}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-2">
                        <p className="text-[10px] text-foreground/40 mb-1">
                          {formatDuration(returnFirstLeg.departure_unix_timestamp, returnLastLeg.arrival_unix_timestamp)}
                        </p>
                        <div className="w-full flex items-center gap-1">
                          <div className="h-px flex-1 bg-foreground/20" />
                          {returnLegs.length - 1 > 0 ? (
                            <span className="text-[10px] text-accent font-medium px-1.5 py-0.5 bg-accent/10 rounded-full">
                              {returnLegs.length - 1} stop{returnLegs.length - 1 > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-[10px] text-primary font-medium px-1.5 py-0.5 bg-primary/10 rounded-full">
                              Direct
                            </span>
                          )}
                          <div className="h-px flex-1 bg-foreground/20" />
                        </div>
                        <p className="text-[10px] text-foreground/30 mt-1">{formatDate(returnFirstLeg.local_departure_date_time)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{formatTime(returnLastLeg.local_arrival_date_time)}</p>
                        <p className="text-xs text-foreground/40">{returnLastLeg.destination}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Price & book */}
            <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 md:border-l border-t md:border-t-0 border-foreground/10 bg-secondary/20 min-w-[160px]">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-foreground">
                  ${bestProposal.price?.amount?.toLocaleString() || "—"}
                </p>
              {agent && (
                  <p className="text-[10px] text-foreground/40 mt-0.5">via {safeString(agent.label) || agent.gate_name}</p>
                )}
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={() => onBook(bestProposal.id)}
              >
                Book now
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FlightResults;
