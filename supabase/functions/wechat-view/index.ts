import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supplierCode = url.searchParams.get("code");

  if (!supplierCode) {
    return new Response(
      JSON.stringify({ error: "Code manquant" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up the QR code
  const { data: qr, error } = await supabase
    .from("wechat_qrcodes")
    .select("*")
    .eq("supplier_code", supplierCode)
    .single();

  if (error || !qr) {
    return new Response(
      JSON.stringify({ error: "Ce lien a expiré ou n'existe pas" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check expiry
  if (new Date(qr.expires_at) < new Date()) {
    // Clean up expired
    await supabase.storage.from("wechat-qrcodes").remove([qr.image_path]);
    await supabase.from("wechat_qrcodes").delete().eq("id", qr.id);
    return new Response(
      JSON.stringify({ error: "Ce lien a expiré ou n'existe pas" }),
      { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Generate signed URL (30 seconds)
  const { data: signedData, error: signErr } = await supabase.storage
    .from("wechat-qrcodes")
    .createSignedUrl(qr.image_path, 30);

  if (signErr || !signedData?.signedUrl) {
    return new Response(
      JSON.stringify({ error: "Erreur lors de la génération du lien" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      url: signedData.signedUrl,
      expires_at: qr.expires_at,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
