import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FONT_SIZE = 28;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const supplierCode = formData.get("supplier_code") as string;

    if (!file || !supplierCode) {
      return new Response(JSON.stringify({ error: "file and supplier_code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get next daily counter atomically
    const { data: counterVal, error: counterErr } = await supabaseAdmin.rpc("next_photo_number");
    if (counterErr) throw counterErr;

    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const nnn = String(counterVal).padStart(3, "0");
    const overlayText = `${supplierCode}_${yy}${mm}${dd}_${nnn}`;
    const filename = `${overlayText}.jpg`;

    const imageBytes = new Uint8Array(await file.arrayBuffer());

    const { Image, decode: decodeImage } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");

    // Load a font for text rendering
    const fontUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf";
    const fontResp = await fetch(fontUrl);
    const fontData = new Uint8Array(await fontResp.arrayBuffer());

    const img = await decodeImage(imageBytes);
    const imgWidth = (img as any).width as number;
    const imgHeight = (img as any).height as number;

    // Draw semi-transparent black bar at top-left
    const barHeight = 36;
    const barWidth = Math.min(overlayText.length * 14 + 20, imgWidth);

    for (let y = 4; y < 4 + barHeight && y <= imgHeight; y++) {
      for (let x = 4; x < 4 + barWidth && x <= imgWidth; x++) {
        const existing = (img as any).getPixelAt(x, y) as number;
        const r = ((existing >> 24) & 0xFF);
        const g = ((existing >> 16) & 0xFF);
        const b = ((existing >> 8) & 0xFF);
        const a = existing & 0xFF;
        const newR = Math.floor(r * 0.3);
        const newG = Math.floor(g * 0.3);
        const newB = Math.floor(b * 0.3);
        (img as any).setPixelAt(x, y, ((newR & 0xFF) << 24) | ((newG & 0xFF) << 16) | ((newB & 0xFF) << 8) | (a & 0xFF));
      }
    }

    // Render text with loaded font
    const textImg = Image.renderText(fontData, FONT_SIZE, overlayText, 0xFFFFFFFF);
    (img as any).composite(textImg, 10, 8);

    const encoded = await (img as any).encodeJPEG(90);

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("product-images")
      .upload(`team/${filename}`, encoded, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(`team/${filename}`);

    return new Response(
      JSON.stringify({
        image_url: urlData.publicUrl,
        overlay_code: overlayText,
        filename,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("burn-overlay error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
