import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading } = useAuth();
  const [sessionReady, setSessionReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Step 1: wait for Supabase to exchange the OAuth code for a session.
  useEffect(() => {
    let cancelled = false;

    const errorParam =
      new URLSearchParams(window.location.search).get("error") ??
      new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error");

    if (errorParam) {
      toast({
        title: "Connexion Google échouée",
        description: "Merci de réessayer.",
        variant: "destructive",
      });
      navigate("/connexion", { replace: true });
      return;
    }

    (async () => {
      // detectSessionInUrl=true handles the exchange automatically; poll briefly.
      for (let i = 0; i < 20; i++) {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) break;
        if (data.session) {
          setSessionReady(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!cancelled) setFailed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, toast]);

  // Step 2: once the session is ready AND the role is resolved, redirect.
  useEffect(() => {
    if (failed) {
      toast({
        title: "Session introuvable",
        description: "Impossible de finaliser la connexion Google.",
        variant: "destructive",
      });
      navigate("/connexion", { replace: true });
      return;
    }

    if (!sessionReady || loading || role === null) return;

    if (role === "superadmin") navigate("/superadmin", { replace: true });
    else if (role === "admin" || role === "backoffice") navigate("/backoffice", { replace: true });
    else if (role === "team") navigate("/team", { replace: true });
    else navigate("/", { replace: true });
  }, [sessionReady, failed, loading, role, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
      Connexion en cours...
    </div>
  );
};

export default AuthCallback;
