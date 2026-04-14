import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().slice(0, 10);

    // Check cache in DB
    const { data: cached } = await supabase
      .from("exchange_rates")
      .select("rate_cny_eur")
      .eq("date", today)
      .maybeSingle();

    if (cached) {
      return new Response(
        JSON.stringify({ rate: cached.rate_cny_eur, date: today, source: "cache" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from API
    const apiResp = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (!apiResp.ok) throw new Error("Exchange rate API unavailable");

    const apiData = await apiResp.json();
    const rateCnyEur = apiData.rates?.CNY;
    if (!rateCnyEur) throw new Error("CNY rate not found in API response");

    // Cache in DB
    await supabase.from("exchange_rates").upsert(
      { date: today, rate_cny_eur: rateCnyEur },
      { onConflict: "date" }
    );

    return new Response(
      JSON.stringify({ rate: rateCnyEur, date: today, source: "api" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
