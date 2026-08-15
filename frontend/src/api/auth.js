import apiClient from "./client";
export const login = (credentials) => apiClient.post("/auth/login", credentials);
export const logout = () => apiClient.post("/auth/logout");
export const getMe = () => apiClient.get("/auth/me");
