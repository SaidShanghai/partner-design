import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SuccessBody = { success: true; user_id: string };
type ErrorBody   = { error: string };

function json(body: SuccessBody | ErrorBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // 1. Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, 401);
  }

  // 2. Parse + validate body
  let user_id: string;
  try {
    const raw = await req.json() as Record<string, unknown>;
    if (typeof raw.user_id !== "string" || !UUID_RE.test(raw.user_id)) {
      return json({ error: "Invalid user_id (expected UUID)" }, 400);
    }
    user_id = raw.user_id;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const adminClient = createClient(supabaseUrl, serviceKey);

  // 3. Vérifier l'identité du caller via l'endpoint auth directement
  // (contourne le bug ES256 de supabase-js)
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Authorization": authHeader,
      "apikey":        serviceKey,
    },
  });

  if (!userRes.ok) {
    return json({ error: "Invalid or expired token" }, 401);
  }

  const caller = await userRes.json();
  if (!caller?.id) {
    return json({ error: "Invalid user" }, 401);
  }

  // 4. Vérifier que le caller est superadmin
  const { data: roleRow, error: roleErr } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "superadmin")
    .maybeSingle();

  if (roleErr || !roleRow) {
    return json({ error: "Forbidden: superadmin role required" }, 403);
  }

  // 5. Garde-fou self-delete : le superadmin ne peut pas se supprimer
  // lui-même via cette route.
  if (caller.id === user_id) {
    return json({ error: "Cannot delete your own account via this endpoint" }, 403);
  }

  // 6. Delete via Admin API
  // Cascade : auth.users ON DELETE cascade sur user_roles, profiles,
  // cart_items, shipping_addresses (voir migrations 20260408162753 +
  // 20260410054407). Les tables CRM (orders, invoices, customers)
  // ne sont PAS cascadées et restent intactes.
  const { error: deleteErr } = await adminClient.auth.admin.deleteUser(user_id);

  if (deleteErr) {
    console.error("[delete-user] deleteUser failed:", deleteErr);
    const status = deleteErr.status === 404 ? 404 : 400;
    return json({ error: deleteErr.message || "Failed to delete user" }, status);
  }

  return json({ success: true, user_id });
});
