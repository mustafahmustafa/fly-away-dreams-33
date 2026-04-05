const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MARKER = "716584";
const API_BASE = "https://tickets-api.travelpayouts.com";

// Recursively extract values from sorted keys for MD5 signature
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
  // Sort top-level keys, extract all values recursively
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(params).sort()) {
    sorted[key] = params[key];
  }
  const values = extractValues(sorted);
  const signString = [token, ...values].join(":");
  return md5(signString);
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

    if (action === "start" && req.method === "POST") {
      const body = await req.json();
      const { origin, destination, departDate, returnDate, adults = 1, children = 0, infants = 0, tripClass = "Y", userIp, host } = body;

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

      const response = await fetch(`${API_BASE}/search/affiliate/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-host": host || "skyvoyai.com",
          "x-user-ip": userIp || "1.1.1.1",
          "x-signature": signature,
          "x-affiliate-user-id": TOKEN,
        },
        body: JSON.stringify(searchBody),
      });

      const data = await response.json();
      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Search start failed", details: data }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
