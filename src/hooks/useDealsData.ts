import { useState, useEffect } from "react";

export interface Deal {
  city: string;
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  currency: string;
  airline: string;
  flight_number: string;
  departure_at: string;
  transfers: number;
  duration: number;
  link: string;
}

export function useDealsData() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [origin, setOrigin] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deals-prices`;
        const resp = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
        const data = await resp.json();
        if (data.deals?.length) {
          setDeals(data.deals);
          setOrigin(data.origin || "");
        }
      } catch (err) {
        console.warn("Failed to fetch deals:", err);
        setError("Could not load deals");
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return { deals, origin, loading, error };
}
