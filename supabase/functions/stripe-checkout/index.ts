import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    // Fetch cart items with product info
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity_meters, unit_price, products(name)")
      .eq("user_id", userId);

    if (cartError) {
      return new Response(JSON.stringify({ error: cartError.message }), { status: 400, headers: corsHeaders });
    }

    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Panier vide" }), { status: 400, headers: corsHeaders });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe non configuré" }), { status: 500, headers: corsHeaders });
    }

    const stripe = new Stripe(stripeKey);

    const { returnUrl } = await req.json();

    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.products?.name || "Tissu",
          metadata: { product_id: item.product_id },
        },
        unit_amount: Math.round(item.unit_price * 100), // price per meter in cents
      },
      quantity: Math.round(item.quantity_meters * 100), // quantity in centimeters (Stripe needs integers)
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${returnUrl || "https://partner-design.lovable.app"}/panier?success=true`,
      cancel_url: `${returnUrl || "https://partner-design.lovable.app"}/panier?canceled=true`,
      metadata: { user_id: userId },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
