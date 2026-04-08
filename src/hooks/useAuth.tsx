import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) {
      console.error("Erreur lors de la vérification du rôle admin", error);
      return false;
    }

    return !!data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const admin = await checkAdmin(nextUser.id);

      if (!isMounted) return;

      setIsAdmin(admin);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAuthState(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void syncAuthState(currentSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signOut = async () => {
    setLoading(true);
    setUser(null);
    setSession(null);
    setIsAdmin(false);

    try {
      await supabase.auth.signOut();
    } finally {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => window.localStorage.removeItem(key));

      setLoading(false);
      window.location.replace("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
