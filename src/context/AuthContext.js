import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ? { name: data.session.user.user_metadata?.display_name || data.session.user.email, email: data.session.user.email, id: data.session.user.id } : null));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ? { name: session.user.user_metadata?.display_name || session.user.email, email: session.user.email, id: session.user.id } : null));
      return () => listener.subscription.unsubscribe();
    }
    const savedUser = localStorage.getItem("gospelTubeUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signIn = async (credentials) => {
    if (isSupabaseConfigured) {
      let result = await supabase.auth.signInWithPassword({ email: credentials.email, password: credentials.password });
      if (result.error) {
        result = await supabase.auth.signUp({ email: credentials.email, password: credentials.password, options: { data: { display_name: credentials.name } } });
      }
      if (result.error) throw result.error;
      return result.data;
    }
    const nextUser = {
      name: credentials.name,
      email: credentials.email,
    };
    setUser(nextUser);
    localStorage.setItem("gospelTubeUser", JSON.stringify(nextUser));
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
      return;
    }
    setUser(null);
    localStorage.removeItem("gospelTubeUser");
  };

  const value = useMemo(() => ({ user, signIn, signOut }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
