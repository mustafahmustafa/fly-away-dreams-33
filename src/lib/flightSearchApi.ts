import { supabase } from "@/integrations/supabase/client";

interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  tripClass: string;
}

export interface FlightLeg {
  origin: string;
  destination: string;
  departure_unix_timestamp: number;
  arrival_unix_timestamp: number;
  local_departure_date_time: string;
  local_arrival_date_time: string;
  operating_carrier_designator: { airline_id: string; number: string };
  equipment?: { name?: string };
  signature: string;
}

export interface Ticket {
  id: string;
  segments: {
    flights: number[];
    transfers?: { duration?: number }[];
  }[];
  proposals: {
    id: string;
    agent_id: number;
    price: { currency: string; amount: number };
    price_per_person?: { currency: string; amount: number };
    flight_terms?: Record<string, { baggage?: { count?: number; total_weight?: number }; handbags?: { count?: number } }>;
  }[];
  signature: string;
}

export interface Airline {
  iata: string;
  name: string | { en?: string; [key: string]: string | undefined };
  is_lowcost?: boolean;
}

export interface Agent {
  id: number;
  gate_name: string;
  label: string | { en?: { default?: string } };
}

export interface SearchResults {
  flight_legs: FlightLeg[];
  tickets: Ticket[];
  airlines: Record<string, Airline>;
  agents: Record<string, Agent>;
  is_over: boolean;
  last_update_timestamp: number;
}

export async function startSearch(params: SearchParams) {
  const { data, error } = await supabase.functions.invoke("flight-search", {
    body: {
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      tripClass: params.tripClass,
      userIp: "8.8.8.8",
      host: "skyvoyai.com",
    },
    headers: { "x-action": "start" },
  });

  // supabase.functions.invoke doesn't support query params, use manual fetch
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-search?action=start`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      tripClass: params.tripClass,
      userIp: "8.8.8.8",
      host: "skyvoyai.com",
    }),
  });

  if (!resp.ok) throw new Error(`Search start failed: ${resp.status}`);
  return resp.json() as Promise<{ search_id: string; results_url: string }>;
}

export async function getResults(searchId: string, resultsUrl: string, lastUpdateTimestamp: number) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-search?action=results`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      searchId,
      resultsUrl: `https://${resultsUrl}`,
      lastUpdateTimestamp,
    }),
  });

  if (!resp.ok && resp.status !== 304) throw new Error(`Results fetch failed: ${resp.status}`);
  return resp.json() as Promise<SearchResults & { noNewResults?: boolean }>;
}

export async function getBookingLink(searchId: string, resultsUrl: string, proposalId: string) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-search?action=click`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      searchId,
      resultsUrl: `https://${resultsUrl}`,
      proposalId,
    }),
  });

  if (!resp.ok) throw new Error(`Click failed: ${resp.status}`);
  return resp.json() as Promise<{ url: string }>;
}
