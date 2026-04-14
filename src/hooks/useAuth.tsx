import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "superadmin" | "admin" | "team" | "none" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  role: AppRole;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string): Promise<AppRole> => {
    // Check roles in priority order
    for (const r of ["superadmin", "admin", "team"] as const) {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: r,
      });
      if (!error && data) return r;
    }
    return "none";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      const userRole = await fetchRole(nextUser.id);

      if (!isMounted) return;

      setRole(userRole);
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
  }, [fetchRole]);

  const signOut = async () => {
    setLoading(true);
    setUser(null);
    setSession(null);
    setRole(null);

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

  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
