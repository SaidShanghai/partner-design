import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GoogleSignInButton from "@/components/GoogleSignInButton";

type AuthMode = "login" | "signup" | "forgot";

const Login = () => {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (role === null) return; // Role not yet loaded
    if (role === "superadmin") navigate("/superadmin");
    else if (role === "admin") navigate("/backoffice");
    else if (role === "backoffice") navigate("/backoffice");
    else if (role === "team") navigate("/team");
    else navigate("/");
  }, [user, loading, role, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : error.message,
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      const msg = error.message.includes("weak")
        ? "Ce mot de passe est trop courant. Veuillez en choisir un autre."
        : error.message;
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } else {
      toast({
        title: "Compte créé",
        description: "Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception.",
      });
      setMode("login");
    }

    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Email envoyé",
        description: "Consultez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      setMode("login");
    }

    setSubmitting(false);
  };

  const titles: Record<AuthMode, string> = {
    login: "Connexion",
    signup: "Créer un compte",
    forgot: "Mot de passe oublié",
  };

  const subtitles: Record<AuthMode, string> = {
    login: "Connectez-vous pour accéder à votre espace",
    signup: "Inscrivez-vous pour commencer",
    forgot: "Entrez votre email pour réinitialiser votre mot de passe",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {titles[mode]}
              </h1>
              <p className="text-muted-foreground text-sm">
                {subtitles[mode]}
              </p>
            </div>

            {/* Google button - visible on login & signup */}
            {mode !== "forgot" && (
              <>
                <GoogleSignInButton
                  label={mode === "login" ? "Se connecter avec Google" : "S'inscrire avec Google"}
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">ou</span>
                  </div>
                </div>
              </>
            )}

            {/* Email/Password form */}
            <form
              onSubmit={
                mode === "login" ? handleEmailLogin
                : mode === "signup" ? handleEmailSignup
                : handleForgotPassword
              }
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
                {submitting
                  ? "Chargement..."
                  : mode === "login"
                  ? "Se connecter"
                  : mode === "signup"
                  ? "Créer mon compte"
                  : "Envoyer le lien"}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center text-sm space-y-2">
              {mode === "login" && (
                <>
                  <button
                    onClick={() => setMode("forgot")}
                    className="text-primary hover:underline block w-full"
                  >
                    Mot de passe oublié ?
                  </button>
                  <p className="text-muted-foreground">
                    Pas encore de compte ?{" "}
                    <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                      S'inscrire
                    </button>
                  </p>
                </>
              )}
              {mode === "signup" && (
                <p className="text-muted-foreground">
                  Déjà un compte ?{" "}
                  <button onClick={() => setMode("login")} className="text-primary hover:underline">
                    Se connecter
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Retour à la connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Login;
