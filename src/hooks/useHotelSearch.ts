import { useState, useEffect, useCallback } from "react";

export interface HotelResult {
  hotelId: number;
  hotelName: string;
  stars: number;
  priceFrom: number;
  priceAvg: number;
  locationId: number;
  location: {
    country: string;
    name: string;
    state: string | null;
    geo: { lat: number; lon: number };
  };
  city?: string;
}

export interface LocationResult {
  id: string;
  cityName: string;
  fullName: string;
  countryCode: string;
  countryName: string;
  hotelsCount: string;
  location: { lat: string; lon: string };
}

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-search`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useHotelLookup() {
  const [results, setResults] = useState<{ locations: LocationResult[]; hotels: any[] }>({ locations: [], hotels: [] });
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults({ locations: [], hotels: [] });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${BASE}?action=lookup&query=${encodeURIComponent(query)}&lang=en&lookFor=city&limit=5`, {
        headers: { apikey: API_KEY },
      });
      const data = await resp.json();
      setResults({
        locations: data?.results?.locations || [],
        hotels: data?.results?.hotels || [],
      });
    } catch {
      setResults({ locations: [], hotels: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}

export function useHotelSearch() {
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = useCallback(async (params: {
    location?: string;
    locationId?: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ action: "cache", currency: "AED", limit: "15" });
      if (params.locationId) qs.set("locationId", params.locationId);
      else if (params.location) qs.set("location", params.location);
      if (params.checkIn) qs.set("checkIn", params.checkIn);
      if (params.checkOut) qs.set("checkOut", params.checkOut);
      if (params.adults) qs.set("adults", String(params.adults));

      const resp = await fetch(`${BASE}?${qs.toString()}`, {
        headers: { apikey: API_KEY },
      });
      const data = await resp.json();
      setHotels(data.hotels || []);
    } catch {
      setError("Failed to fetch hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotels, loading, error, searchHotels };
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
