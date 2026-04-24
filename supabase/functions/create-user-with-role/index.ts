import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// superadmin est intentionnellement absent : la création de superadmins
// se fait uniquement via SQL sur le Dashboard Supabase.
const ALLOWED_ROLES = ["team", "backoffice", "admin"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

type SuccessBody = { success: true; user_id: string; email: string; role: AllowedRole };
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

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // 1. Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, 401);
  }

  // 2. Parse + validate body
  let email: string, password: string, role: AllowedRole;
  try {
    const raw = await req.json() as Record<string, unknown>;
    if (
      typeof raw.email    !== "string" ||
      typeof raw.password !== "string" ||
      typeof raw.role     !== "string"
    ) {
      return json({ error: "Missing required fields: email, password, role" }, 400);
    }
    if (!(ALLOWED_ROLES as ReadonlyArray<string>).includes(raw.role)) {
      return json({ error: `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}` }, 400);
    }
    if (raw.password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }
    email    = raw.email;
    password = raw.password;
    role     = raw.role as AllowedRole;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Un seul client admin (service role) pour tout : valider le JWT + opérations DB
  const adminClient = createClient(supabaseUrl, serviceKey);

  // 3. Vérifier l'identité du caller via l'endpoint auth directement
  // (contourne le bug ES256 de supabase-js : adminClient.auth.getUser(jwt) ne supporte pas ES256)
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

  // 5. Créer le user via Admin API (email_confirm: true → pas d'email de vérification)
  const { data: newUserData, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    const isConflict = createErr.message.toLowerCase().includes("already");
    return json({ error: createErr.message }, isConflict ? 409 : 400);
  }

  const newUser = newUserData.user;

  // 6a. Un trigger AFTER INSERT sur auth.users (assign_superadmin_on_signup)
  // peut déjà avoir assigné un rôle à ce user (cas backoffice@asialinkltd.com).
  // On vérifie avant d'insérer pour éviter une violation UNIQUE(user_id, role)
  // ET pour éviter de créer une 2e row avec un rôle différent.
  const { data: existingRole, error: existingErr } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", newUser.id)
    .limit(1)
    .maybeSingle();

  if (existingErr) {
    console.error("[create-user-with-role] existing role lookup failed:", existingErr);
    await adminClient.auth.admin.deleteUser(newUser.id);
    return json({ error: "Failed to check existing role — user creation rolled back" }, 500);
  }

  // 6b. Si le trigger a déjà assigné un rôle, on le respecte et on le retourne.
  // Le frontend affichera le vrai rôle dans la carte "Compte créé".
  if (existingRole) {
    return json({
      success: true,
      user_id:  newUser.id,
      email:    newUser.email!,
      role:     existingRole.role as AllowedRole,
    });
  }

  // 6c. Sinon, insert normal du rôle demandé.
  const { error: insertErr } = await adminClient
    .from("user_roles")
    .insert({ user_id: newUser.id, role });

  if (insertErr) {
    console.error("[create-user-with-role] role insert failed:", insertErr);
    // Rollback : supprimer le user si l'insertion du rôle échoue
    await adminClient.auth.admin.deleteUser(newUser.id);
    return json({ error: "Failed to assign role — user creation rolled back" }, 500);
  }

  return json({ success: true, user_id: newUser.id, email: newUser.email!, role });
});
