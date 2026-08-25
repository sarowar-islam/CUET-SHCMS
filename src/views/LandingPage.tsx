import { useState, useEffect, useRef } from "react";

interface Props {
  onSignIn: () => void;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const STATS = [
  { value: "240", label: "Residential Rooms" },
  { value: "98%", label: "Issues Resolved" },
  { value: "1.8d", label: "Avg. Resolution" },
  { value: "24/7", label: "System Uptime" },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    title: "One-tap Complaint Filing",
    desc: "Submit a complaint in under 60 seconds. Auto-populate your profile, choose category and urgency, and get a tracking ID instantly.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "AI Chatbot Assistant",
    desc: "Describe your problem conversationally — \"My fan switch isn't working\" — and the AI assistant auto-fills the entire complaint form for you.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-time Status Tracking",
    desc: "Know exactly where your complaint stands — pending, assigned, in-progress, or resolved — with timestamped progress updates from staff.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    title: "AI-powered Analytics",
    desc: "Admins get intelligent breakdowns — hotspot blocks, peak complaint categories, resolution rate trends, and predictive maintenance alerts.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Role-based Portals",
    desc: "Separate, purpose-built interfaces for students, maintenance staff, and administrators — no clutter, just the tools each role needs.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Secure Session Management",
    desc: "Cookie-based authenticated sessions with role-scoped access control ensure your data is protected and only visible to authorised users.",
  },
];

const ROLES = [
  {
    role: "Student",
    color: "#1A3A5C",
    bg: "#EEF4FF",
    border: "#BFDBFE",
    points: [
      "Submit complaints with auto-filled profile details",
      "Voice or type issues — AI fills the form",
      "Track status with live progress updates",
      "Filter complaint history by date, category, or status",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    role: "Staff",
    color: "#065F46",
    bg: "#F0FDF4",
    border: "#6EE7B7",
    points: [
      "View and filter all hall complaints by category",
      "Update complaint status and provide progress notes",
      "Accept assignments and manage personal workload",
      "Communicate resolution directly through the portal",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    role: "Administrator",
    color: "#4C1D95",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    points: [
      "Full visibility over all complaints and users",
      "Assign complaints to staff and override statuses",
      "Manage student and staff accounts",
      "Configure hall settings and view AI analytics",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const HOW = [
  {
    step: "01",
    title: "Sign in with your ID",
    desc: "Students use their enrolment ID. Staff and admins use their portal credentials. Role is detected automatically.",
  },
  {
    step: "02",
    title: "Describe your issue",
    desc: "Type naturally or use the AI chatbot. The system classifies category, sets urgency, and prepares the complaint form.",
  },
  {
    step: "03",
    title: "Submit and track",
    desc: "Your complaint gets a unique ID. Follow its journey in real time — from assignment through resolution — on your dashboard.",
  },
  {
    step: "04",
    title: "Get it resolved",
    desc: "Staff update progress directly in the portal. You see every note and status change the moment it happens.",
  },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage({ onSignIn }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: "#F4F5F7", color: "#111827", fontFamily: "var(--font-body)" }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #D1D9E6" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
            >
              KH
            </div>
            <div>
              <p
                className="text-sm font-semibold leading-none"
                style={{ fontFamily: "var(--font-display)", color: "#111827" }}
              >
                Kaveri Hall
              </p>
              <p className="text-xs leading-none mt-0.5" style={{ color: "#9CA3AF" }}>
                Complaint Portal
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Roles"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm transition-colors hover:text-teal-600"
                style={{ color: "#6B7280", fontFamily: "var(--font-body)" }}
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            onClick={onSignIn}
            className="px-5 py-2 rounded text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center pt-16 overflow-hidden"
        style={{ backgroundColor: "#0F1B2D" }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(14,124,123,0.2) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{
                backgroundColor: "rgba(14,124,123,0.15)",
                border: "1px solid rgba(14,124,123,0.35)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#0E7C7B" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "#5EEAD4", fontFamily: "var(--font-mono)" }}
              >
                University of Technology · Kaveri Hall of Residence
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)", color: "#E5EAF2" }}
            >
              Smarter Hall.
              <br />
              <span style={{ color: "#0D9488" }}>Faster Fixes.</span>
            </h1>
            <p
              className="text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: "#8DA0B8", fontFamily: "var(--font-body)" }}
            >
              The Smart Hall Complaint Management System lets students file maintenance issues in seconds, gives staff a clear action board, and gives admins AI-powered insights — all in one place.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
              >
                Get Started
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#8DA0B8",
                  fontFamily: "var(--font-display)",
                }}
              >
                See how it works
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="px-6 py-5"
                  style={{ backgroundColor: "rgba(15,27,45,0.6)" }}
                >
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "#0D9488" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs" style={{ color: "#6B8099" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs" style={{ color: "#4A6480", fontFamily: "var(--font-mono)" }}>
            scroll
          </span>
          <div
            className="w-px h-8 animate-pulse"
            style={{ backgroundColor: "rgba(14,124,123,0.5)" }}
          />
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <Section>
          <div className="mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#0E7C7B", fontFamily: "var(--font-mono)" }}
            >
              Features
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              Everything you need to manage hall issues
            </h2>
            <p className="text-base max-w-xl" style={{ color: "#6B7280" }}>
              Built around three roles, designed to eliminate the back-and-forth of manual complaint tracking.
            </p>
          </div>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <Section key={f.title}>
              <div
                className="rounded-xl p-6 h-full transition-shadow hover:shadow-lg"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--border)",
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#F0FDFA", color: "#0E7C7B" }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "#111827" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                  {f.desc}
                </p>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24"
        style={{ backgroundColor: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <Section>
            <div className="mb-14">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#0E7C7B", fontFamily: "var(--font-mono)" }}
              >
                How it Works
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#111827" }}
              >
                From issue spotted to issue solved
              </h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map((h, i) => (
              <Section key={h.step}>
                <div className="relative" style={{ transitionDelay: `${i * 80}ms` }}>
                  {/* Connector line */}
                  {i < HOW.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-5 left-full w-full h-px z-0"
                      style={{ backgroundColor: "#D1D9E6", marginLeft: "24px", width: "calc(100% - 48px)" }}
                    />
                  )}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-4 relative z-10"
                    style={{ backgroundColor: "#0F1B2D" }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#0D9488", fontFamily: "var(--font-mono)" }}
                    >
                      {h.step}
                    </span>
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ fontFamily: "var(--font-display)", color: "#111827" }}
                  >
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                    {h.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ───────────────────────────────────────────── */}
      <section id="roles" className="py-24 max-w-6xl mx-auto px-6">
        <Section>
          <div className="mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#0E7C7B", fontFamily: "var(--font-mono)" }}
            >
              Roles
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              One system, three purpose-built views
            </h2>
          </div>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ROLES.map((r, i) => (
            <Section key={r.role}>
              <div
                className="rounded-xl p-7 h-full"
                style={{
                  backgroundColor: r.bg,
                  border: `1px solid ${r.border}`,
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: r.color, color: "#fff" }}
                >
                  {r.icon}
                </div>
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)", color: r.color }}
                >
                  {r.role}
                </h3>
                <ul className="space-y-2.5">
                  {r.points.map((pt) => (
                    <li key={pt} className="flex gap-2.5 text-sm">
                      <svg
                        className="w-4 h-4 shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={r.color}
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: "#374151" }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ── CHATBOT CALLOUT ─────────────────────────────────── */}
      <section
        className="py-20"
        style={{ backgroundColor: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <Section>
            <div
              className="rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
              style={{ backgroundColor: "#0F1B2D" }}
            >
              {/* Left text */}
              <div className="px-10 py-12">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6"
                  style={{ backgroundColor: "rgba(14,124,123,0.2)", border: "1px solid rgba(14,124,123,0.35)" }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: "#5EEAD4", fontFamily: "var(--font-mono)" }}>
                    AI Chatbot
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)", color: "#E5EAF2" }}
                >
                  Just say what's wrong.
                  <br />
                  We'll handle the rest.
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "#8DA0B8" }}>
                  No complicated forms. Tell the AI assistant your issue in plain language and it automatically identifies the category, sets the urgency level, and pre-fills your complaint — ready to submit in one click.
                </p>
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
                >
                  Try it now
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              {/* Right — mock chatbot preview */}
              <div className="relative flex items-center justify-center p-8 lg:p-10">
                <div
                  className="w-full max-w-xs rounded-xl overflow-hidden shadow-2xl"
                  style={{ backgroundColor: "#fff" }}
                >
                  {/* Chat header */}
                  <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "#0F1B2D" }}>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#0E7C7B" }}
                    >
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                      Hall Assistant
                    </p>
                  </div>
                  {/* Chat messages */}
                  <div className="p-4 space-y-3" style={{ backgroundColor: "#F4F5F7" }}>
                    <ChatBubble from="bot" text="Hi! Describe your issue and I'll file the complaint for you." />
                    <ChatBubble from="user" text="My fan switch is not working" />
                    <ChatBubble from="bot" text="Got it — Electrical · High urgency. Shall I fill the form?" />
                    <div className="flex gap-2 pl-1">
                      <span
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: "#0E7C7B" }}
                      >
                        Yes, fill form
                      </span>
                      <span
                        className="px-3 py-1 rounded text-xs font-medium border"
                        style={{ borderColor: "#D1D9E6", color: "#6B7280" }}
                      >
                        Rephrase
                      </span>
                    </div>
                  </div>
                  {/* Input */}
                  <div className="px-3 py-3 border-t flex gap-2" style={{ borderColor: "#D1D9E6" }}>
                    <div
                      className="flex-1 px-3 py-2 rounded text-xs"
                      style={{ backgroundColor: "#F4F5F7", color: "#9CA3AF" }}
                    >
                      Type your issue…
                    </div>
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: "#0E7C7B" }}
                    >
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <Section>
          <div className="text-center max-w-xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              Ready to file a complaint?
            </h2>
            <p className="text-base mb-8" style={{ color: "#6B7280" }}>
              Sign in with your student ID or staff credentials and get started in under 30 seconds.
            </p>
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
            >
              Sign In to the Portal
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <p className="mt-4 text-xs" style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}>
              Students · Staff · Administrators — all roles supported
            </p>
          </div>
        </Section>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer
        className="py-10"
        style={{
          backgroundColor: "#0F1B2D",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
            >
              KH
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "#E5EAF2" }}>
                Kaveri Hall of Residence
              </p>
              <p className="text-xs" style={{ color: "#4A6480" }}>
                University of Technology
              </p>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: "#4A6480", fontFamily: "var(--font-mono)" }}>
            Smart Complaint Management System · Internal Use Only
          </p>
          <button
            onClick={onSignIn}
            className="text-xs font-medium px-4 py-2 rounded transition-colors hover:bg-white/5"
            style={{ color: "#5EEAD4", border: "1px solid rgba(14,124,123,0.3)" }}
          >
            Sign In →
          </button>
        </div>
      </footer>
    </div>
  );
}

function ChatBubble({ from, text }: { from: "bot" | "user"; text: string }) {
  return (
    <div className={`flex ${from === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed"
        style={{
          backgroundColor: from === "user" ? "#0E7C7B" : "#fff",
          color: from === "user" ? "#fff" : "#111827",
        }}
      >
        {text}
      </div>
    </div>
  );
}
