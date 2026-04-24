import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SuccessBody = { success: true; user_id: string; email: string };
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
  let new_password: string;
  try {
    const raw = await req.json() as Record<string, unknown>;
    if (typeof raw.user_id !== "string" || !UUID_RE.test(raw.user_id)) {
      return json({ error: "Invalid user_id (expected UUID)" }, 400);
    }
    if (typeof raw.new_password !== "string" || raw.new_password.length < 8) {
      return json({ error: "new_password must be a string of at least 8 characters" }, 400);
    }
    user_id      = raw.user_id;
    new_password = raw.new_password;
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

  // 5. Garde-fou self-reset : le superadmin ne peut pas reset son propre
  // mot de passe via cette route. Pour ça, passer par le flow natif
  // "forgot password" de Supabase Auth.
  if (caller.id === user_id) {
    return json({ error: "Cannot reset your own password via this endpoint" }, 403);
  }

  // 6. Reset via Admin API
  const { data: updatedData, error: updateErr } = await adminClient.auth.admin.updateUserById(
    user_id,
    { password: new_password },
  );

  if (updateErr) {
    console.error("[reset-user-password] updateUserById failed:", updateErr);
    const status = updateErr.status === 404 ? 404 : 400;
    return json({ error: updateErr.message || "Failed to reset password" }, status);
  }

  const updated = updatedData?.user;
  if (!updated) {
    return json({ error: "User not found after update" }, 500);
  }

  return json({ success: true, user_id: updated.id, email: updated.email ?? "" });
});
