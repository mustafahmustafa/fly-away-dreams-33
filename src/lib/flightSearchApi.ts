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

async function callEdgeFunction(action: string, body: Record<string, unknown>) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-search?action=${action}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok && resp.status !== 304) {
    const text = await resp.text();
    throw new Error(`API ${action} failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

export async function startSearch(params: SearchParams) {
  return callEdgeFunction("start", {
    origin: params.origin,
    destination: params.destination,
    departDate: params.departDate,
    returnDate: params.returnDate,
    adults: params.adults,
    children: params.children,
    infants: params.infants,
    tripClass: params.tripClass,
  }) as Promise<{ search_id: string; results_url: string }>;
}

export async function getResults(searchId: string, resultsUrl: string, lastUpdateTimestamp: number) {
  return callEdgeFunction("results", {
    searchId,
    resultsUrl: resultsUrl.startsWith("http") ? resultsUrl : `https://${resultsUrl}`,
    lastUpdateTimestamp,
  }) as Promise<SearchResults & { noNewResults?: boolean }>;
}

export async function getBookingLink(searchId: string, resultsUrl: string, proposalId: string) {
  return callEdgeFunction("click", {
    searchId,
    resultsUrl: resultsUrl.startsWith("http") ? resultsUrl : `https://${resultsUrl}`,
    proposalId,
  }) as Promise<{ url: string }>;
}
