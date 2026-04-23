import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, ShieldCheck, Copy, Check, Users } from "lucide-react";
import { toast } from "sonner";

type AllowedRole = "team" | "backoffice" | "admin";

const ROLE_OPTIONS: AllowedRole[] = ["team", "backoffice", "admin"];

const ROLE_BADGE: Record<string, string> = {
  superadmin: "bg-purple-500/10 text-purple-600",
  admin:      "bg-blue-500/10 text-blue-600",
  backoffice: "bg-orange-500/10 text-orange-600",
  team:       "bg-emerald-500/10 text-emerald-600",
};

type SuccessInfo = { email: string; password: string; role: AllowedRole };

type UserWithRole = {
  id: string;
  email: string;
  role: string | null;
  created_at: string;
};

type EdgeResponse =
  | { success: true; user_id: string; email: string; role: AllowedRole }
  | { error: string }
  | { message: string };

type ListResponse =
  | { users: UserWithRole[] }
  | { error: string }
  | { message: string };

const SuperadminRoles = () => {
  const navigate = useNavigate();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [role, setRole]               = useState<AllowedRole>("team");
  const [submitting, setSubmitting]   = useState(false);
  const [created, setCreated]         = useState<SuccessInfo | null>(null);
  const [copied, setCopied]           = useState(false);
  const [users, setUsers]             = useState<UserWithRole[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const getHeaders = async (): Promise<Record<string, string> | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return null;
    return {
      "Authorization": `Bearer ${token}`,
      "apikey":        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    };
  };

  const fetchUsers = async () => {
    setLoadingList(true);
    console.log("🔍 [fetchUsers] START");
    try {
      const headers = await getHeaders();
      console.log("🔍 [fetchUsers] headers:", headers ? "OK" : "NULL");
      if (!headers) {
        toast.error("fetchUsers: pas de session");
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const url = `${supabaseUrl}/functions/v1/list-users-with-roles`;
      console.log("🔍 [fetchUsers] URL:", url);

      const response = await fetch(url, { method: "GET", headers });
      console.log("🔍 [fetchUsers] status:", response.status);

      const text = await response.text();
      console.log("🔍 [fetchUsers] body:", text);

      if (!response.ok) {
        toast.error(`List users error ${response.status}: ${text}`);
        return;
      }

      const result = JSON.parse(text) as ListResponse;
      if ("users" in result) {
        console.log("🔍 [fetchUsers] got users:", result.users.length);
        setUsers(result.users);
      } else {
        toast.error("Réponse inattendue: " + text);
      }
    } catch (err) {
      console.error("🔴 [fetchUsers] catch:", err);
      toast.error("fetchUsers crash: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setSubmitting(true);
    try {
      const headers = await getHeaders();
      if (!headers) {
        toast.error("Session expirée, reconnectez-vous");
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-user-with-role`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password, role }),
        }
      );

      const result = await response.json() as EdgeResponse;

      if (!response.ok || "error" in result || "message" in result) {
        const raw = result as Record<string, unknown>;
        const msg =
          (typeof raw.error   === "string" ? raw.error   : null) ??
          (typeof raw.message === "string" ? raw.message : null) ??
          `Erreur ${response.status}`;
        toast.error(msg);
        return;
      }

      toast.success(`Compte créé pour ${trimmedEmail} (${role})`);
      setCreated({ email: trimmedEmail, password, role });
      setEmail("");
      setPassword("");
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/superadmin")}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Créer un compte utilisateur</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-4 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="prenom@domaine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Mot de passe</label>
            <PasswordInput
              placeholder="6 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AllowedRole)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Création en cours..." : "Créer le compte"}
          </Button>
        </form>

        {/* Success card */}
        {created && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Compte créé avec succès</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Email</span>
                <span className="font-medium text-foreground text-right truncate">{created.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Mot de passe</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                    {created.password}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copier le mot de passe"
                  >
                    {copied
                      ? <Check className="w-4 h-4 text-emerald-600" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Rôle</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[created.role]}`}>
                  {created.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User list */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Utilisateurs</h2>
            </div>
            {!loadingList && (
              <span className="text-xs text-muted-foreground">{users.length}</span>
            )}
          </div>

          {loadingList ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 animate-pulse">
                  <div className="h-4 bg-muted rounded w-44" />
                  <div className="h-5 bg-muted rounded-full w-16" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun utilisateur</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground truncate">{u.email}</span>
                  {u.role ? (
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[u.role] ?? "bg-muted text-muted-foreground"}`}>
                      {u.role}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      —
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default SuperadminRoles;
