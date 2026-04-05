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

      // Poll for results
      let lastTimestamp = 0;
      let attempts = 0;
      const maxAttempts = 30;

      const poll = async () => {
        while (attempts < maxAttempts) {
          attempts++;
          setProgress(Math.min(90, (attempts / maxAttempts) * 100));

          await new Promise((r) => setTimeout(r, 2000));

          try {
            const data = await getResults(search_id, results_url, lastTimestamp);

            if (data.noNewResults) continue;

            if (data.flight_legs) {
              setFlightLegs((prev) => {
                const existing = new Set(prev.map((l) => l.signature));
                const newLegs = data.flight_legs.filter((l) => !existing.has(l.signature));
                return [...prev, ...newLegs];
              });
            }

            if (data.tickets) {
              setTickets((prev) => {
                const existing = new Set(prev.map((t) => t.id));
                const newTickets = data.tickets.filter((t) => !existing.has(t.id));
                return [...prev, ...newTickets];
              });
            }

            if (data.airlines) setAirlines((prev) => ({ ...prev, ...data.airlines }));
            if (data.agents) setAgents((prev) => ({ ...prev, ...data.agents }));
            if (data.last_update_timestamp) lastTimestamp = data.last_update_timestamp;

            if (data.is_over) {
              setProgress(100);
              setSearching(false);
              return;
            }
          } catch {
            // continue polling on transient errors
          }
        }

        setSearching(false);
        setProgress(100);
      };

      await poll();
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
