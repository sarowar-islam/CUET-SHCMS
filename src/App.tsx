import { useState, useEffect } from "react";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import StudentDashboard from "./views/StudentDashboard";
import StaffDashboard from "./views/StaffDashboard";
import AdminConsole from "./views/AdminConsole";
import { authService } from "./services/api";
import type { Role } from "./types";

type Screen = "landing" | "login" | "app";

export default function App() {
  const [user, setUser] = useState<{
    userId: string;
    username: string;
    role: Role;
    name: string;
    email: string;
    room?: string;
    department?: string;
    phone?: string;
    active: boolean;
  } | null>(null);
  const [screen, setScreen] = useState<Screen>("landing");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setUser(storedUser);
      setScreen("app");
    }
    setChecking(false);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    authService.clearAuth();
    setUser(null);
    setScreen("landing");
  };

  const handleLogin = (userData: {
    userId: string;
    username: string;
    role: Role;
    name: string;
    email: string;
    room?: string;
    department?: string;
    phone?: string;
    active: boolean;
  }) => {
    setUser(userData);
    setScreen("app");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F1B2D" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(14,124,123,0.3)", borderTopColor: "#0E7C7B" }}
          />
          <p className="text-xs" style={{ color: "#4A6480", fontFamily: "var(--font-mono)" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (screen === "landing") {
    return <LandingPage onSignIn={() => setScreen("login")} />;
  }

  if (screen === "login") {
    return <Login onLogin={handleLogin} onBack={() => setScreen("landing")} />;
  }

  if (!user) {
    setScreen("landing");
    return null;
  }

  if (user.role === "student") return <StudentDashboard user={user} onLogout={handleLogout} />;
  if (user.role === "staff") return <StaffDashboard user={user} onLogout={handleLogout} />;
  return <AdminConsole user={user} onLogout={handleLogout} />;
}