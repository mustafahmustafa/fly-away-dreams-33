import { useState, useEffect, useCallback } from "react";

export interface HotelResult {
  id: number;
  name: string;
  city: string;
  country: string;
  stars: number;
  priceFrom: number;
  image: string;
  lat: number;
  lon: number;
}

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-search`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useHotelSearch() {
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchHotels = useCallback(async (params: {
    query?: string;
    city?: string;
    minStars?: number;
    maxPrice?: number;
  }) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ action: "search" });
      if (params.query) qs.set("query", params.query);
      if (params.city) qs.set("city", params.city);
      if (params.minStars) qs.set("minStars", String(params.minStars));
      if (params.maxPrice) qs.set("maxPrice", String(params.maxPrice));

      const resp = await fetch(`${BASE}?${qs.toString()}`, {
        headers: { apikey: API_KEY },
      });
      const data = await resp.json();
      setHotels(data.hotels || []);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotels, loading, searchHotels };
}

export function usePopularHotels() {
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const resp = await fetch(`${BASE}?action=popular`, {
          headers: { apikey: API_KEY },
        });
        const data = await resp.json();
        setHotels(data.hotels || []);
      } catch {
        console.warn("Failed to fetch popular hotels");
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return { hotels, loading };
}

export function useHotelCities() {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const resp = await fetch(`${BASE}?action=cities`, {
          headers: { apikey: API_KEY },
        });
        const data = await resp.json();
        setCities(data.cities || []);
      } catch {
        console.warn("Failed to fetch cities");
      }
    };
    fetchCities();
  }, []);

  return { cities };
}
