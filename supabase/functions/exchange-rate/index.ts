import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().slice(0, 10);

    // 1) Check if we have a cached average that is less than 7 days old
    const { data: recentRates } = await supabase
      .from("exchange_rates")
      .select("date, rate_cny_eur")
      .order("date", { ascending: false })
      .limit(7);

    // Find the most recent entry to see if it's from today (meaning we already fetched today's rate)
    const latestEntry = recentRates?.[0];
    const alreadyFetchedToday = latestEntry?.date === today;

    // Check if the oldest entry in our 7-day window is recent enough (< 7 days old)
    // If we have 7 entries and the oldest is within 7 days, the average is still valid
    if (recentRates && recentRates.length > 0) {
      const oldestDate = new Date(recentRates[recentRates.length - 1].date);
      const now = new Date();
      const daysSinceOldest = (now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24);

      // If we already fetched today AND the cached window is still within 7 days, return cached average
      if (alreadyFetchedToday && daysSinceOldest <= 7) {
        const avg = recentRates.reduce((sum: number, r: any) => sum + Number(r.rate_cny_eur), 0) / recentRates.length;
        const roundedAvg = Number(avg.toFixed(4));
        return new Response(
          JSON.stringify({ rate: roundedAvg, date: today, source: "cache", days: recentRates.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2) Fetch today's rate from API (if not already fetched today)
    if (!alreadyFetchedToday) {
      const apiResp = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!apiResp.ok) throw new Error("Exchange rate API unavailable");

      const apiData = await apiResp.json();
      const rateCnyEur = apiData.rates?.CNY;
      if (!rateCnyEur) throw new Error("CNY rate not found in API response");

      // Store today's rate
      await supabase.from("exchange_rates").upsert(
        { date: today, rate_cny_eur: rateCnyEur },
        { onConflict: "date" }
      );
    }

    // 3) Re-fetch last 7 entries and compute average
    const { data: allRates } = await supabase
      .from("exchange_rates")
      .select("date, rate_cny_eur")
      .order("date", { ascending: false })
      .limit(7);

    const rates = allRates || [];
    const avg = rates.reduce((sum: number, r: any) => sum + Number(r.rate_cny_eur), 0) / (rates.length || 1);
    const roundedAvg = Number(avg.toFixed(4));

    return new Response(
      JSON.stringify({ rate: roundedAvg, date: today, source: "api", days: rates.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
