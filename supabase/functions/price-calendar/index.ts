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

    const apiUrl = new URL("https://api.travelpayouts.com/v2/prices/month-matrix");
    apiUrl.searchParams.set("origin", origin);
    apiUrl.searchParams.set("destination", destination);
    apiUrl.searchParams.set("currency", "aed");
    apiUrl.searchParams.set("show_to_affiliates", "true");
    apiUrl.searchParams.set("token", TOKEN);
    apiUrl.searchParams.set("one_way", "true");
    apiUrl.searchParams.set("limit", "31");
    if (month) {
      apiUrl.searchParams.set("month", month);
    }

    const resp = await fetch(apiUrl.toString(), {
      headers: { "Accept-Encoding": "gzip, deflate" },
    });
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
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
