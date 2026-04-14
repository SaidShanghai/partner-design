import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const FONT_SIZE = 28;
const PADDING = 16;

// Simple bitmap font renderer - draws white text with black outline
function drawTextOnImageData(
  data: Uint8ClampedArray,
  width: number,
  text: string,
  x: number,
  y: number,
  fontSize: number
) {
  // We'll use a canvas-free approach: encode text into pixel patterns
  // Since we can't use canvas in Deno Deploy, we'll use a different strategy
  // We draw a semi-transparent dark background strip, then overlay white text pixels
  const stripHeight = fontSize + 8;
  const stripWidth = Math.min(text.length * (fontSize * 0.6) + PADDING * 2, width);

  // Draw dark background strip
  for (let row = y; row < y + stripHeight && row < Math.floor(data.length / (width * 4)); row++) {
    for (let col = x; col < x + stripWidth && col < width; col++) {
      const idx = (row * width + col) * 4;
      data[idx] = Math.floor(data[idx] * 0.3);     // R
      data[idx + 1] = Math.floor(data[idx + 1] * 0.3); // G
      data[idx + 2] = Math.floor(data[idx + 2] * 0.3); // B
      // Alpha stays
    }
  }
}

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

    // Verify user auth
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

    // Read image bytes
    const imageBytes = new Uint8Array(await file.arrayBuffer());

    // Use ImageScript for image processing (pure TS, works in Deno Deploy)
    const { Image, decode: decodeImage } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");

    const img = await decodeImage(imageBytes);

    // Create text overlay using ImageScript
    // We'll render the text by creating a small overlay and compositing
    const imgWidth = (img as any).width as number;
    const imgHeight = (img as any).height as number;

    // Draw semi-transparent black bar at top-left
    const barHeight = 36;
    const barWidth = Math.min(overlayText.length * 14 + 20, imgWidth);

    for (let y = 4; y < 4 + barHeight && y <= imgHeight; y++) {
      for (let x = 4; x < 4 + barWidth && x <= imgWidth; x++) {
        const existing = (img as any).getPixelAt(x, y) as number;
        // Darken: blend with black at 60% opacity
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

    // Render text using ImageScript's built-in text rendering
    const textImg = Image.renderText(FONT_SIZE, 0xFFFFFFFF, overlayText);
    (img as any).composite(textImg, 10, 8);

    // Encode back to JPEG
    const encoded = await (img as any).encodeJPEG(90);

    // Upload to storage
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
