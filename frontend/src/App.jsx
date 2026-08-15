import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
export default function App() { const { session, loading } = useAuth(); if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-300">Loading secure session…</div>; return session ? <DashboardPage/> : <LoginPage/>; }
