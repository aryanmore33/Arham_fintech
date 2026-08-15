import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as loginRequest, logout as logoutRequest } from "../api/auth";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => { getMe().then((result) => setSession({ user: result.data })).catch(() => setSession(null)).finally(() => setLoading(false)); }, []);
  const login = async (credentials) => { const result = await loginRequest(credentials); setSession(result); };
  const logout = async () => { await logoutRequest(); setSession(null); };
  return <AuthContext.Provider value={{ session, user: session?.user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
