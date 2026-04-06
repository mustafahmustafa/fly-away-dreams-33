import { useState, useEffect } from "react";

export interface PriceDay {
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  number_of_changes: number;
  value: number;
  found_at: string;
  distance: number;
  actual: boolean;
  trip_class: number;
}

export function usePriceCalendar(origin: string, destination: string, month?: string) {
  const [prices, setPrices] = useState<PriceDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) {
      setPrices([]);
      return;
    }

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ origin, destination });
        if (month) params.set("month", month);

        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-calendar?${params}`;
        const resp = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const data = await resp.json();
        if (data.success && data.data?.length) {
          setPrices(data.data);
        } else {
          setPrices([]);
        }
      } catch (err) {
        console.warn("Failed to fetch price calendar:", err);
        setError("Could not load prices");
        setPrices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [origin, destination, month]);

  return { prices, loading, error };
}
