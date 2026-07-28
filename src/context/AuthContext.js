import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("gospelTubeUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signIn = (credentials) => {
    const nextUser = {
      name: credentials.name,
      email: credentials.email,
    };
    setUser(nextUser);
    localStorage.setItem("gospelTubeUser", JSON.stringify(nextUser));
  };

  const signOut = () => {
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
