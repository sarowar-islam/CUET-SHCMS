import { useState, useEffect } from "react";
import type { User } from "./dummy";
import { USERS, getCookie, deleteCookie } from "./dummy";
import Login from "./views/Login";
import StudentDashboard from "./views/StudentDashboard";
import StaffDashboard from "./views/StaffDashboard";
import AdminConsole from "./views/AdminConsole";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getCookie("hall_session");
    if (session) {
      try {
        const { id } = JSON.parse(session);
        const found = USERS.find((u) => u.id === id && u.active);
        if (found) setUser(found);
      } catch {
        deleteCookie("hall_session");
      }
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    deleteCookie("hall_session");
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F5F7" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#0E7C7B", borderTopColor: "transparent" }}
          />
          <p className="text-xs" style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.role === "student") {
    return <StudentDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === "staff") {
    return <StaffDashboard user={user} onLogout={handleLogout} />;
  }

  return <AdminConsole user={user} onLogout={handleLogout} />;
}
