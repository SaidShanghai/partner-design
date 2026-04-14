import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find all expired QR codes
  const { data: expired, error } = await supabase
    .from("wechat_qrcodes")
    .select("id, image_path")
    .lt("expires_at", new Date().toISOString());

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!expired || expired.length === 0) {
    return new Response(
      JSON.stringify({ deleted: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Delete files from storage
  const paths = expired.map((q) => q.image_path);
  await supabase.storage.from("wechat-qrcodes").remove(paths);

  // Delete rows
  const ids = expired.map((q) => q.id);
  await supabase.from("wechat_qrcodes").delete().in("id", ids);

  return new Response(
    JSON.stringify({ deleted: expired.length }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
