import { useState, useEffect } from "react";
import type { User } from "./dummy";
import { USERS, getCookie, deleteCookie } from "./dummy";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import StudentDashboard from "./views/StudentDashboard";
import StaffDashboard from "./views/StaffDashboard";
import AdminConsole from "./views/AdminConsole";

type Screen = "landing" | "login" | "app";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("landing");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getCookie("hall_session");
    if (session) {
      try {
        const { id } = JSON.parse(session);
        const found = USERS.find((u) => u.id === id && u.active);
        if (found) {
          setUser(found);
          setScreen("app");
        }
      } catch {
        deleteCookie("hall_session");
      }
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    deleteCookie("hall_session");
    setUser(null);
    setScreen("landing");
  };

  const handleLogin = (u: User) => {
    setUser(u);
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
