const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HotelEntry {
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

// Curated popular hotels data across key destinations
const POPULAR_HOTELS: HotelEntry[] = [
  { id: 1, name: "Atlantis, The Palm", city: "Dubai", country: "UAE", stars: 5, priceFrom: 1250, image: "dubai-atlantis", lat: 25.1304, lon: 55.1172 },
  { id: 2, name: "Burj Al Arab Jumeirah", city: "Dubai", country: "UAE", stars: 5, priceFrom: 4500, image: "dubai-burj", lat: 25.1412, lon: 55.1853 },
  { id: 3, name: "JW Marriott Marquis", city: "Dubai", country: "UAE", stars: 5, priceFrom: 650, image: "dubai-jw", lat: 25.1885, lon: 55.2638 },
  { id: 4, name: "Armani Hotel Dubai", city: "Dubai", country: "UAE", stars: 5, priceFrom: 1800, image: "dubai-armani", lat: 25.1972, lon: 55.2744 },
  { id: 5, name: "The Ritz London", city: "London", country: "UK", stars: 5, priceFrom: 2200, image: "london-ritz", lat: 51.5074, lon: -0.1416 },
  { id: 6, name: "The Savoy", city: "London", country: "UK", stars: 5, priceFrom: 1800, image: "london-savoy", lat: 51.5101, lon: -0.1205 },
  { id: 7, name: "Shangri-La The Shard", city: "London", country: "UK", stars: 5, priceFrom: 1500, image: "london-shard", lat: 51.5045, lon: -0.0865 },
  { id: 8, name: "Hôtel Plaza Athénée", city: "Paris", country: "France", stars: 5, priceFrom: 3200, image: "paris-plaza", lat: 48.8664, lon: 2.3043 },
  { id: 9, name: "Le Meurice", city: "Paris", country: "France", stars: 5, priceFrom: 2800, image: "paris-meurice", lat: 48.8653, lon: 2.3282 },
  { id: 10, name: "Four Seasons George V", city: "Paris", country: "France", stars: 5, priceFrom: 3500, image: "paris-george", lat: 48.8694, lon: 2.3009 },
  { id: 11, name: "Mandarin Oriental Bangkok", city: "Bangkok", country: "Thailand", stars: 5, priceFrom: 450, image: "bangkok-mandarin", lat: 13.7235, lon: 100.5146 },
  { id: 12, name: "The Peninsula Bangkok", city: "Bangkok", country: "Thailand", stars: 5, priceFrom: 380, image: "bangkok-peninsula", lat: 13.7218, lon: 100.5098 },
  { id: 13, name: "Raffles Istanbul", city: "Istanbul", country: "Turkey", stars: 5, priceFrom: 550, image: "istanbul-raffles", lat: 41.0792, lon: 29.0115 },
  { id: 14, name: "Four Seasons Bosphorus", city: "Istanbul", country: "Turkey", stars: 5, priceFrom: 850, image: "istanbul-four", lat: 41.0456, lon: 29.0336 },
  { id: 15, name: "Aman Tokyo", city: "Tokyo", country: "Japan", stars: 5, priceFrom: 2500, image: "tokyo-aman", lat: 35.6859, lon: 139.7638 },
  { id: 16, name: "The Peninsula Tokyo", city: "Tokyo", country: "Japan", stars: 5, priceFrom: 1800, image: "tokyo-peninsula", lat: 35.6762, lon: 139.7633 },
  { id: 17, name: "Marina Bay Sands", city: "Singapore", country: "Singapore", stars: 5, priceFrom: 700, image: "singapore-mbs", lat: 1.2834, lon: 103.8607 },
  { id: 18, name: "Waldorf Astoria DIFC", city: "Dubai", country: "UAE", stars: 5, priceFrom: 900, image: "dubai-waldorf", lat: 25.2115, lon: 55.2802 },
  { id: 19, name: "Address Downtown", city: "Dubai", country: "UAE", stars: 5, priceFrom: 750, image: "dubai-address", lat: 25.1933, lon: 55.2788 },
  { id: 20, name: "Caesars Palace", city: "Dubai", country: "UAE", stars: 5, priceFrom: 850, image: "dubai-caesars", lat: 25.1178, lon: 55.1389 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "popular";

    if (action === "search") {
      const query = (url.searchParams.get("query") || "").toLowerCase();
      const city = (url.searchParams.get("city") || "").toLowerCase();
      const minStars = parseInt(url.searchParams.get("minStars") || "0");
      const maxPrice = parseInt(url.searchParams.get("maxPrice") || "999999");

      let results = [...POPULAR_HOTELS];

      if (query) {
        results = results.filter(h =>
          h.name.toLowerCase().includes(query) ||
          h.city.toLowerCase().includes(query) ||
          h.country.toLowerCase().includes(query)
        );
      }
      if (city) {
        results = results.filter(h => h.city.toLowerCase() === city);
      }
      if (minStars > 0) {
        results = results.filter(h => h.stars >= minStars);
      }
      results = results.filter(h => h.priceFrom <= maxPrice);

      return new Response(JSON.stringify({ hotels: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "popular") {
      // Return a mix of destinations
      const shuffled = [...POPULAR_HOTELS].sort(() => Math.random() - 0.5);
      return new Response(JSON.stringify({ hotels: shuffled.slice(0, 12) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cities") {
      const cities = [...new Set(POPULAR_HOTELS.map(h => h.city))];
      return new Response(JSON.stringify({ cities }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("hotel-search error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
