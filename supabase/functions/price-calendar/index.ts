const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOKEN = Deno.env.get("TRAVELPAYOUTS_API_TOKEN") ?? "";

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

    const url = new URL(req.url);
    const origin = url.searchParams.get("origin");
    const destination = url.searchParams.get("destination");
    const month = url.searchParams.get("month"); // YYYY-MM-DD format

    if (!origin || !destination) {
      return new Response(JSON.stringify({ error: "origin and destination are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract YYYY-MM from the month param for prices_for_dates
    const monthYYYYMM = month ? month.slice(0, 7) : undefined;

    // Try month-matrix first
    const matrixUrl = new URL("https://api.travelpayouts.com/v2/prices/month-matrix");
    matrixUrl.searchParams.set("origin", origin);
    matrixUrl.searchParams.set("destination", destination);
    matrixUrl.searchParams.set("currency", "aed");
    matrixUrl.searchParams.set("show_to_affiliates", "true");
    matrixUrl.searchParams.set("token", TOKEN);
    matrixUrl.searchParams.set("one_way", "true");
    matrixUrl.searchParams.set("limit", "31");
    if (month) matrixUrl.searchParams.set("month", month);

    // Also try prices_for_dates as fallback (broader coverage)
    const datesUrl = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
    datesUrl.searchParams.set("origin", origin);
    datesUrl.searchParams.set("destination", destination);
    datesUrl.searchParams.set("currency", "aed");
    datesUrl.searchParams.set("token", TOKEN);
    datesUrl.searchParams.set("one_way", "true");
    datesUrl.searchParams.set("sorting", "price");
    datesUrl.searchParams.set("direct", "false");
    datesUrl.searchParams.set("limit", "31");
    if (monthYYYYMM) datesUrl.searchParams.set("departure_at", monthYYYYMM);

    const headers = { "Accept-Encoding": "gzip, deflate" };

    const [matrixResp, datesResp] = await Promise.all([
      fetch(matrixUrl.toString(), { headers }),
      fetch(datesUrl.toString(), { headers }),
    ]);

    const matrixData = await matrixResp.json();
    const datesData = await datesResp.json();

    // Merge: use month-matrix data, then fill gaps from prices_for_dates
    const priceMap: Record<string, any> = {};

    // Add month-matrix entries
    if (matrixData.success !== false && matrixData.data?.length) {
      for (const item of matrixData.data) {
        priceMap[item.depart_date] = {
          origin: item.origin,
          destination: item.destination,
          depart_date: item.depart_date,
          return_date: item.return_date || "",
          number_of_changes: item.number_of_changes,
          value: item.value,
          found_at: item.found_at,
          distance: item.distance,
          actual: item.actual,
          trip_class: item.trip_class,
        };
      }
    }

    // Fill gaps from prices_for_dates
    if (datesData.success && datesData.data?.length) {
      for (const item of datesData.data) {
        const depDate = item.departure_at?.slice(0, 10);
        if (depDate && !priceMap[depDate]) {
          priceMap[depDate] = {
            origin: item.origin,
            destination: item.destination,
            depart_date: depDate,
            return_date: item.return_at?.slice(0, 10) || "",
            number_of_changes: item.transfers,
            value: item.price,
            found_at: "",
            distance: 0,
            actual: true,
            trip_class: 0,
          };
        }
      }
    }

    const mergedData = Object.values(priceMap);

    return new Response(JSON.stringify({ success: true, currency: "aed", data: mergedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Price calendar error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
