import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function LoginPage() {
  const { login } = useAuth(); const [email, setEmail] = useState("manager@arham.com"), [password, setPassword] = useState("password123"), [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); try { setError(""); await login({ email, password }); } catch (err) { setError(err.message); } };
  return <main className="grid min-h-screen place-items-center bg-slate-950 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"><p className="text-sm font-bold tracking-widest text-cyan-600">ARHAM FINTECH</p><h1 className="mt-2 text-2xl font-bold">Incentives Portal</h1><p className="mt-2 text-sm text-slate-500">Sign in with your manager or employee account.</p><input className="mt-6 w-full rounded-lg border p-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"/><input className="mt-3 w-full rounded-lg border p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<button className="mt-5 w-full rounded-lg bg-slate-900 py-3 font-bold text-white">Sign in</button></form></main>;
}
