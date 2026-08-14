import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
export default function App() { const { session } = useAuth(); return session ? <DashboardPage/> : <LoginPage/>; }
