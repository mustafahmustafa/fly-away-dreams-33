const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MARKER = "716584";
const API_BASE = "https://tickets-api.travelpayouts.com";

function extractValues(obj: unknown): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== "object") return [String(obj)];
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => extractValues(item));
  }
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  return sorted.flatMap((key) => extractValues((obj as Record<string, unknown>)[key]));
}

async function md5(text: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("md5").update(text).digest("hex");
}

async function generateSignature(token: string, params: Record<string, unknown>): Promise<string> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(params).sort()) {
    sorted[key] = params[key];
  }
  const values = extractValues(sorted);
  const signString = [token, ...values].join(":");
  return md5(signString);
}

function getUserIp(req: Request): string {
  // Try standard proxy headers for the real user IP
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first && !first.startsWith("127.") && first !== "::1") return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && !realIp.startsWith("127.") && realIp !== "::1") return realIp;
  // Fallback to a public IP (not localhost, as the API prohibits it)
  return "185.199.108.1";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const TOKEN = Deno.env.get("TRAVELPAYOUTS_API_TOKEN");
  if (!TOKEN) {
    return new Response(JSON.stringify({ error: "API token not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const userIp = getUserIp(req);

    if (action === "start" && req.method === "POST") {
      const body = await req.json();
      const { origin, destination, departDate, returnDate, adults = 1, children = 0, infants = 0, tripClass = "Y" } = body;

      if (!origin || !destination || !departDate) {
        return new Response(JSON.stringify({ error: "origin, destination, and departDate are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const directions = [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), date: departDate }];
      if (returnDate) {
        directions.push({ origin: destination.toUpperCase(), destination: origin.toUpperCase(), date: returnDate });
      }

      const searchBody: Record<string, unknown> = {
        currency_code: "USD",
        locale: "en",
        marker: MARKER,
        market_code: "US",
        search_params: {
          directions,
          passengers: { adults, children, infants },
          trip_class: tripClass,
        },
      };

      const signature = await generateSignature(TOKEN, searchBody);
      searchBody.signature = signature;

      console.log("Starting search:", JSON.stringify({ origin, destination, departDate, returnDate, userIp }));

      const response = await fetch(`${API_BASE}/search/affiliate/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-host": "skyvoyai.com",
          "x-user-ip": userIp,
          "x-signature": signature,
          "x-affiliate-user-id": TOKEN,
        },
        body: JSON.stringify(searchBody),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Search start failed:", JSON.stringify(data));
        return new Response(JSON.stringify({ error: "Search start failed", details: data }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Search started:", data.search_id, "results_url:", data.results_url);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "results" && req.method === "POST") {
      const body = await req.json();
      const { searchId, resultsUrl, lastUpdateTimestamp = 0 } = body;

      if (!searchId || !resultsUrl) {
        return new Response(JSON.stringify({ error: "searchId and resultsUrl are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(`${resultsUrl}/search/affiliate/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-affiliate-user-id": TOKEN,
        },
        body: JSON.stringify({
          search_id: searchId,
          last_update_timestamp: lastUpdateTimestamp,
        }),
      });

      if (response.status === 304) {
        return new Response(JSON.stringify({ noNewResults: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "click" && req.method === "POST") {
      const body = await req.json();
      const { searchId, resultsUrl, proposalId } = body;

      if (!searchId || !resultsUrl || !proposalId) {
        return new Response(JSON.stringify({ error: "searchId, resultsUrl, and proposalId are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(`${resultsUrl}/searches/${searchId}/clicks/${proposalId}`, {
        method: "GET",
        headers: {
          "x-affiliate-user-id": TOKEN,
          marker: MARKER,
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use ?action=start|results|click" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
