import { useState, useCallback, useRef } from "react";
import { startSearch, getResults, getBookingLink, type SearchResults, type Ticket, type FlightLeg, type Airline, type Agent } from "@/lib/flightSearchApi";

interface UseFlightSearchReturn {
  loading: boolean;
  searching: boolean;
  progress: number;
  tickets: Ticket[];
  flightLegs: FlightLeg[];
  airlines: Record<string, Airline>;
  agents: Record<string, Agent>;
  error: string | null;
  search: (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    tripClass: string;
  }) => Promise<void>;
  bookTicket: (proposalId: string) => Promise<void>;
}

export function useFlightSearch(): UseFlightSearchReturn {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [flightLegs, setFlightLegs] = useState<FlightLeg[]>([]);
  const [airlines, setAirlines] = useState<Record<string, Airline>>({});
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [error, setError] = useState<string | null>(null);

  const searchMeta = useRef<{ searchId: string; resultsUrl: string } | null>(null);

  const search = useCallback(async (params: Parameters<UseFlightSearchReturn["search"]>[0]) => {
    setLoading(true);
    setSearching(true);
    setProgress(0);
    setTickets([]);
    setFlightLegs([]);
    setAirlines({});
    setAgents({});
    setError(null);

    try {
      const { search_id, results_url } = await startSearch(params);
      searchMeta.current = { searchId: search_id, resultsUrl: results_url };
      setLoading(false);

      // The API returns flight_legs as a flat array per response.
      // Tickets reference legs by index into the CUMULATIVE array across all poll responses.
      // We must track the global offset so ticket indexes remain valid.
      let globalLegs: FlightLeg[] = [];
      let allTickets: Ticket[] = [];
      let allAirlines: Record<string, Airline> = {};
      let allAgents: Record<string, Agent> = {};
      let lastTimestamp = 0;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        attempts++;
        setProgress(Math.min(90, (attempts / maxAttempts) * 100));

        await new Promise((r) => setTimeout(r, 2000));

        try {
          const data = await getResults(search_id, results_url, lastTimestamp);

          if (data.noNewResults) continue;

          // Append new flight legs — maintain index alignment
          if (data.flight_legs && data.flight_legs.length > 0) {
            globalLegs = [...globalLegs, ...data.flight_legs];
            setFlightLegs(globalLegs);
          }

          // Append new tickets (they reference the cumulative flight_legs array)
          if (data.tickets && data.tickets.length > 0) {
            const existingIds = new Set(allTickets.map((t) => t.id));
            const newTickets = data.tickets.filter((t) => !existingIds.has(t.id));
            allTickets = [...allTickets, ...newTickets];
            setTickets(allTickets);
          }

          if (data.airlines) {
            allAirlines = { ...allAirlines, ...data.airlines };
            setAirlines(allAirlines);
          }
          if (data.agents) {
            allAgents = { ...allAgents, ...data.agents };
            setAgents(allAgents);
          }
          if (data.last_update_timestamp) lastTimestamp = data.last_update_timestamp;

          if (data.is_over) {
            setProgress(100);
            setSearching(false);
            return;
          }
        } catch (err) {
          console.warn("Poll error (retrying):", err);
        }
      }

      setSearching(false);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setLoading(false);
      setSearching(false);
    }
  }, []);

  const bookTicket = useCallback(async (proposalId: string) => {
    if (!searchMeta.current) return;
    try {
      const data = await getBookingLink(
        searchMeta.current.searchId,
        searchMeta.current.resultsUrl,
        proposalId
      );
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Booking link error:", err);
    }
  }, []);

  return { loading, searching, progress, tickets, flightLegs, airlines, agents, error, search, bookTicket };
}
