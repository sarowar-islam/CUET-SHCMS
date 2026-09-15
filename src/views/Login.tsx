import { useState } from "react";
import { authService } from "../services/api";
import type { Role } from "../types";

interface LoginProps {
  onLogin: (user: {
    userId: string;
    username: string;
    role: Role;
    name: string;
    email: string;
    room?: string;
    department?: string;
    phone?: string;
    active: boolean;
  }) => void;
  onBack?: () => void;
}

export default function Login({ onLogin, onBack }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username: username.trim(), password });

      // Save token and user
      authService.saveToken(response.token);
      authService.saveUser(response);

      onLogin({
        userId: response.userId,
        username: response.username,
        role: response.role as Role,
        name: response.name,
        email: response.email,
        room: response.room,
        department: response.department,
        phone: response.phone,
        active: response.active,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage || "Invalid credentials or account inactive. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F4F5F7" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ backgroundColor: "#0F1B2D", color: "#E5EAF2" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <img
              src="/images/logo.png"
              alt="CUET Smart Hall logo"
              className="w-11 h-11 rounded object-cover shrink-0"
            />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Kabi Kazi Nazrul Islam Hall of Residence
              </p>
              <p className="text-xs" style={{ color: "#6B8099" }}>
                Chittagong University of Engineering and Technology
              </p>
            </div>
          </div>

          <h1
            className="text-3xl font-bold leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#E5EAF2" }}
          >
            Smart Complaint
            <br />
            Management System
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#8DA0B8" }}>
            Submit, track, and resolve hall maintenance issues quickly and
            transparently. Your comfort is our priority.
          </p>
        </div>

        {/* Quick login hints */}
        <div className="space-y-3">
          <p
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#4A6480", fontFamily: "var(--font-mono)" }}
          >
            Quick access
          </p>
          {[
            { label: "Student", user: "2204107", pass: "student" },
            { label: "Staff", user: "staff1", pass: "staff1" },
            { label: "Admin", user: "admin", pass: "admin" },
          ].map((hint) => (
            <button
              key={hint.label}
              onClick={() => {
                setUsername(hint.user);
                setPassword(hint.pass);
              }}
              className="w-full text-left px-4 py-3 rounded text-sm transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#A0B4C8",
                fontFamily: "var(--font-body)",
              }}
            >
              <span className="font-medium text-white">{hint.label}</span>
              <span
                className="ml-2"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "#4A6480",
                }}
              >
                {hint.user} / {hint.pass}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <img
            src="/images/logo.png"
            alt="CUET Smart Hall logo"
            className="w-20 h-20 rounded-lg object-cover mx-auto mb-6 lg:hidden"
          />
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs mb-8 transition-colors hover:opacity-70"
              style={{ color: "#6B7280", fontFamily: "var(--font-body)" }}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to home
            </button>
          )}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              Sign in
            </h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Use your student ID or staff credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#374151", fontFamily: "var(--font-display)" }}
              >
                Username / Student ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 2204107 or admin"
                required
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "#fff",
                  fontFamily: "var(--font-mono)",
                  color: "#111827",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0E7C7B")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#374151", fontFamily: "var(--font-display)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "#fff",
                  fontFamily: "var(--font-mono)",
                  color: "#111827",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0E7C7B")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div
                className="px-3 py-2.5 rounded text-xs"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  fontFamily: "var(--font-body)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{
                backgroundColor: "#0E7C7B",
                fontFamily: "var(--font-display)",
                marginTop: "8px",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Mobile hints */}
          <div className="mt-8 lg:hidden">
            <p
              className="text-xs font-medium mb-3"
              style={{ color: "#6B7280" }}
            >
              Demo credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Student", user: "2204107", pass: "student" },
                { label: "Staff", user: "staff1", pass: "staff1" },
                { label: "Admin", user: "admin", pass: "admin" },
              ].map((h) => (
                <button
                  key={h.label}
                  onClick={() => {
                    setUsername(h.user);
                    setPassword(h.pass);
                  }}
                  className="px-2 py-2 rounded text-xs border text-center"
                  style={{ borderColor: "var(--border)", color: "#374151" }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}