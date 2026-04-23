import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type UserWithRole = {
  id: string;
  email: string;
  role: string | null;
  created_at: string;
};

type SuccessBody = { users: UserWithRole[] };
type ErrorBody  = { error: string };

function json(body: SuccessBody | ErrorBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  // 1. Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 2. Vérifier l'identité du caller via l'endpoint auth directement
  // (contourne le bug ES256 de supabase-js)
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Authorization": authHeader,
      "apikey": serviceKey,
    },
  });

  if (!userRes.ok) {
    return json({ error: "Invalid or expired token" }, 401);
  }

  const caller = await userRes.json();
  if (!caller?.id) {
    return json({ error: "Invalid user" }, 401);
  }

  // 3. Vérifier que le caller est superadmin
  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: roleRow, error: roleErr } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "superadmin")
    .maybeSingle();

  if (roleErr || !roleRow) {
    return json({ error: "Forbidden: superadmin role required" }, 403);
  }

  // 4a. Récupérer tous les users via Admin API
  const { data: usersData, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) {
    return json({ error: "Failed to list users" }, 500);
  }

  // 4b. Récupérer tous les rôles
  const { data: rolesData, error: rolesErr } = await adminClient
    .from("user_roles")
    .select("user_id, role");

  if (rolesErr) {
    return json({ error: "Failed to fetch roles" }, 500);
  }

  // 4c. Joindre en mémoire par user_id
  const roleMap = new Map<string, string>();
  for (const r of (rolesData ?? [])) {
    const row = r as { user_id: string; role: string };
    roleMap.set(row.user_id, row.role);
  }

  const users: UserWithRole[] = usersData.users
    .map((u) => ({
      id:         u.id,
      email:      u.email ?? "",
      role:       roleMap.get(u.id) ?? null,
      created_at: u.created_at,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return json({ users });
});
