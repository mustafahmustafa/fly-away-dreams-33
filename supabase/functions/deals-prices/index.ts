const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOKEN = Deno.env.get("TRAVELPAYOUTS_API_TOKEN") ?? "";

// Popular destinations from various origins – mix of leisure & business
const DEFAULT_ROUTES = [
  { origin: "DXB", destination: "LHR", city: "London" },
  { origin: "DXB", destination: "PAR", city: "Paris" },
  { origin: "DXB", destination: "IST", city: "Istanbul" },
  { origin: "DXB", destination: "BKK", city: "Bangkok" },
  { origin: "DXB", destination: "CAI", city: "Cairo" },
  { origin: "DXB", destination: "MLE", city: "Maldives" },
  { origin: "DXB", destination: "BOM", city: "Mumbai" },
  { origin: "DXB", destination: "KUL", city: "Kuala Lumpur" },
];

function getUserIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "8.8.8.8"
  );
}

async function detectOrigin(ip: string): Promise<string> {
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=city,countryCode,lat,lon`);
    if (resp.ok) {
      const geo = await resp.json();
      // Map common countries to their main hub airports
      const countryHubs: Record<string, string> = {
        AE: "DXB", SA: "RUH", KW: "KWI", BH: "BAH", OM: "MCT", QA: "DOH",
        EG: "CAI", LB: "BEY", JO: "AMM", IQ: "BGW", IN: "DEL", PK: "KHI",
        US: "NYC", GB: "LON", DE: "BER", FR: "PAR", IT: "ROM", ES: "MAD",
        TR: "IST", RU: "MOW", CN: "PEK", JP: "TYO", KR: "SEL", TH: "BKK",
        MY: "KUL", SG: "SIN", AU: "SYD", BR: "SAO", MX: "MEX",
      };
      return countryHubs[geo.countryCode] || "DXB";
    }
  } catch (e) {
    console.warn("IP geo lookup failed:", e);
  }
  return "DXB";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!TOKEN) {
      return new Response(JSON.stringify({ error: "API token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIp = getUserIp(req);
    const origin = await detectOrigin(userIp);

    // Build routes from detected origin, filtering out self-routes
    const routes = DEFAULT_ROUTES
      .map((r) => ({ ...r, origin }))
      .filter((r) => r.origin !== r.destination);

    // Fetch prices for each route in parallel
    const results = await Promise.allSettled(
      routes.slice(0, 8).map(async (route) => {
        const url = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
        url.searchParams.set("origin", route.origin);
        url.searchParams.set("destination", route.destination);
        url.searchParams.set("currency", "aed");
        url.searchParams.set("direct", "false");
        url.searchParams.set("sorting", "price");
        url.searchParams.set("limit", "1");
        url.searchParams.set("one_way", "true");
        url.searchParams.set("unique", "false");
        url.searchParams.set("token", TOKEN);

        const resp = await fetch(url.toString(), {
          headers: { "Accept-Encoding": "gzip, deflate" },
        });
        const data = await resp.json();

        if (!data.success || !data.data?.length) return null;

        const ticket = data.data[0];
        return {
          city: route.city,
          origin: ticket.origin,
          destination: ticket.destination,
          origin_airport: ticket.origin_airport,
          destination_airport: ticket.destination_airport,
          price: ticket.price,
          currency: "AED",
          airline: ticket.airline,
          flight_number: ticket.flight_number,
          departure_at: ticket.departure_at,
          return_at: ticket.return_at,
          transfers: ticket.transfers,
          duration: ticket.duration_to || ticket.duration,
          link: ticket.link,
        };
      })
    );

    const deals = results
      .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof Promise.resolve>>>> =>
        r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);

    return new Response(JSON.stringify({ success: true, origin, deals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Deals prices error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
