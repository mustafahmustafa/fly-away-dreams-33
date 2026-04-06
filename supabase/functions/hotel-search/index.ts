const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOTELLOOK_BASE = "http://engine.hotellook.com/api/v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("TRAVELPAYOUTS_API_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "API token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "lookup";

    if (action === "lookup") {
      const query = url.searchParams.get("query") || "";
      const lang = url.searchParams.get("lang") || "en";
      const lookFor = url.searchParams.get("lookFor") || "both";
      const limit = url.searchParams.get("limit") || "10";

      if (!query) {
        return new Response(JSON.stringify({ error: "query is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const lookupUrl = `${HOTELLOOK_BASE}/lookup.json?query=${encodeURIComponent(query)}&lang=${lang}&lookFor=${lookFor}&limit=${limit}&token=${token}`;
      const resp = await fetch(lookupUrl);
      const data = await resp.json();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cache") {
      const location = url.searchParams.get("location") || "";
      const locationId = url.searchParams.get("locationId") || "";
      const checkIn = url.searchParams.get("checkIn") || "";
      const checkOut = url.searchParams.get("checkOut") || "";
      const adults = url.searchParams.get("adults") || "2";
      const currency = url.searchParams.get("currency") || "AED";
      const limit = url.searchParams.get("limit") || "15";

      if (!location && !locationId) {
        return new Response(JSON.stringify({ error: "location or locationId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let cacheUrl = `${HOTELLOOK_BASE}/cache.json?currency=${currency}&adults=${adults}&limit=${limit}&token=${token}`;
      if (locationId) cacheUrl += `&locationId=${locationId}`;
      else if (location) cacheUrl += `&location=${encodeURIComponent(location)}`;
      if (checkIn) cacheUrl += `&checkIn=${checkIn}`;
      if (checkOut) cacheUrl += `&checkOut=${checkOut}`;

      // Get user IP for better results
      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                        req.headers.get("x-real-ip") || "";
      if (clientIp) cacheUrl += `&customerIp=${clientIp}`;

      const resp = await fetch(cacheUrl);
      const data = await resp.json();

      // Normalize: API returns either array or single object
      const hotels = Array.isArray(data) ? data : [data];

      return new Response(JSON.stringify({ hotels: hotels.filter(h => h && h.hotelId) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Popular destinations for recommendations (no search needed)
    if (action === "popular") {
      // Use IP-based detection to find user location, then get popular hotels nearby
      const clientIp = req.headersParams?.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
      
      // Get popular hotels for major cities
      const cities = ["Dubai", "London", "Paris", "Istanbul", "Bangkok", "New York"];
      const today = new Date();
      const checkIn = new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10);
      const checkOut = new Date(today.getTime() + 17 * 86400000).toISOString().slice(0, 10);
      
      const results = await Promise.allSettled(
        cities.map(async (city) => {
          const cacheUrl = `${HOTELLOOK_BASE}/cache.json?location=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}&currency=AED&limit=2&token=${token}`;
          const resp = await fetch(cacheUrl);
          const data = await resp.json();
          const hotels = Array.isArray(data) ? data : [data];
          return hotels.filter(h => h && h.hotelId).map(h => ({ ...h, city }));
        })
      );

      const allHotels = results
        .filter(r => r.status === "fulfilled")
        .flatMap(r => (r as PromiseFulfilledResult<any[]>).value);

      return new Response(JSON.stringify({ hotels: allHotels }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: lookup, cache, popular" }), {
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
