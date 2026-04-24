import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type OtpType = "signup" | "magiclink" | "recovery" | "invite" | "email_change";

const ALLOWED_TYPES: OtpType[] = [
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
];

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase peut livrer le token de 3 façons :
    //  1. Query ?token_hash=…&type=…  (email template custom OTP)
    //  2. Hash #access_token=…&type=…  (implicit flow, client auto-parse)
    //  3. Hash #error=…&error_description=…  (échec côté Supabase)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") ?? hash.get("error");
    if (hashError) {
      toast({
        title: "Vérification échouée",
        description: hashError,
        variant: "destructive",
      });
      navigate("/connexion", { replace: true });
      return;
    }

    // Si le hash contient un access_token, le client Supabase l'a déjà parsé
    // automatiquement (detectSessionInUrl: true). On lit la session établie.
    if (hash.get("access_token")) {
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          toast({
            title: "Email confirmé",
            description: "Votre compte est maintenant actif.",
          });
          navigate("/", { replace: true });
        } else {
          toast({
            title: "Vérification échouée",
            description: "Session introuvable après confirmation.",
            variant: "destructive",
          });
          navigate("/connexion", { replace: true });
        }
      });
      return;
    }

    const tokenHash = searchParams.get("token_hash");
    const rawType = searchParams.get("type");

    // Guard: missing params OR unknown type → prevents the
    // "Verify requires a verification type" error from Supabase.
    if (!tokenHash || !rawType || !ALLOWED_TYPES.includes(rawType as OtpType)) {
      toast({
        title: "Lien invalide",
        description: "Le lien de confirmation est incomplet ou expiré.",
        variant: "destructive",
      });
      navigate("/connexion", { replace: true });
      return;
    }

    const type = rawType as OtpType;

    (async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        toast({
          title: "Vérification échouée",
          description: error.message || "Le lien est invalide ou a expiré.",
          variant: "destructive",
        });
        navigate("/connexion", { replace: true });
        return;
      }

      if (type === "recovery") {
        navigate("/reset-password", { replace: true });
        return;
      }

      toast({
        title: "Email confirmé",
        description: "Votre compte est maintenant actif.",
      });
      navigate("/", { replace: true });
    })();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      Vérification en cours...
    </div>
  );
};

export default AuthConfirm;
