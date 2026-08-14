import { createContext, useContext, useState } from "react";
import { login as loginRequest } from "../api/auth";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("arham-session") || "null"));
  const login = async (credentials) => { const result = await loginRequest(credentials); localStorage.setItem("arham-session", JSON.stringify(result)); setSession(result); };
  const logout = () => { localStorage.removeItem("arham-session"); setSession(null); };
  return <AuthContext.Provider value={{ session, user: session?.user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
