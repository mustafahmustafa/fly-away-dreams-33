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

  // Sort tickets by cheapest proposal price
  const sorted = [...tickets].sort((a, b) => {
    const priceA = a.proposals[0]?.price?.amount ?? Infinity;
    const priceB = b.proposals[0]?.price?.amount ?? Infinity;
    return priceA - priceB;
  });

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

      {!searching && (
        <p className="text-sm text-foreground/50 mb-4">
          {tickets.length} flight{tickets.length !== 1 ? "s" : ""} found
        </p>
      )}

      {sorted.slice(0, 20).map((ticket) => {
        const bestProposal = ticket.proposals[0];
        if (!bestProposal) return null;

        // Get all flight legs for this ticket
        const allFlightIndexes = ticket.segments.flatMap((s) => s.flights);
        const legs = allFlightIndexes.map((i) => flightLegs[i]).filter(Boolean);

        const firstLeg = legs[0];
        const lastLeg = legs[legs.length - 1];
        if (!firstLeg || !lastLeg) return null;

        const stops = legs.length - 1;
        const carrierCode = firstLeg.operating_carrier_designator?.airline_id || "";
        const airline = airlines[carrierCode];
        const agent = agents[String(bestProposal.agent_id)];

        return (
          <div
            key={ticket.id}
            className="flex flex-col md:flex-row items-stretch bg-secondary/30 border border-foreground/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
          >
            {/* Flight info */}
            <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Airline */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <img
                  src={`https://img.wway.io/pics/root/${carrierCode}@png?exar=1&rs=fit:40:40`}
                  alt={safeString(airline?.name) || carrierCode}
                  className="w-10 h-10 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{safeString(airline?.name) || carrierCode}</p>
                  <p className="text-xs text-foreground/40">
                    {firstLeg.operating_carrier_designator?.airline_id}
                    {firstLeg.operating_carrier_designator?.number}
                  </p>
                </div>
              </div>

              {/* Times */}
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">
                    {formatTime(firstLeg.local_departure_date_time)}
                  </p>
                  <p className="text-xs text-foreground/40">{firstLeg.origin}</p>
                </div>

                <div className="flex-1 flex flex-col items-center px-2">
                  <p className="text-[10px] text-foreground/40 mb-1">
                    {formatDuration(firstLeg.departure_unix_timestamp, lastLeg.arrival_unix_timestamp)}
                  </p>
                  <div className="w-full flex items-center gap-1">
                    <div className="h-px flex-1 bg-foreground/20" />
                    {stops > 0 && (
                      <span className="text-[10px] text-accent font-medium px-1.5 py-0.5 bg-accent/10 rounded-full">
                        {stops} stop{stops > 1 ? "s" : ""}
                      </span>
                    )}
                    {stops === 0 && (
                      <span className="text-[10px] text-green-400 font-medium px-1.5 py-0.5 bg-green-400/10 rounded-full">
                        Direct
                      </span>
                    )}
                    <div className="h-px flex-1 bg-foreground/20" />
                  </div>
                  <p className="text-[10px] text-foreground/30 mt-1">
                    {formatDate(firstLeg.local_departure_date_time)}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">
                    {formatTime(lastLeg.local_arrival_date_time)}
                  </p>
                  <p className="text-xs text-foreground/40">{lastLeg.destination}</p>
                </div>
              </div>
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
