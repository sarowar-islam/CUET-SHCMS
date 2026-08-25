import { useState, useMemo } from "react";
import type {
  User,
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  UrgencyLevel,
} from "../dummy";
import {
  COMPLAINTS,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "../dummy";
import Sidebar from "../components/Sidebar";
import { StatusBadge, UrgencyBadge } from "../components/StatusBadge";
import Chatbot from "../components/Chatbot";

type Tab = "dashboard" | "submit" | "my_complaints";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "submit",
    label: "New Complaint",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "my_complaints",
    label: "My Complaints",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

const CATEGORIES: ComplaintCategory[] = [
  "electrical",
  "plumbing",
  "furniture",
  "cleanliness",
  "security",
  "internet",
  "others",
];
const URGENCIES: UrgencyLevel[] = ["low", "medium", "high", "critical"];

interface ComplaintFormData {
  title: string;
  room: string;
  description: string;
  category: ComplaintCategory;
  urgency: UrgencyLevel;
}

interface Props {
  user: User;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showChatbot, setShowChatbot] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);

  // My complaints
  const myComplaints = useMemo(
    () => complaints.filter((c) => c.studentId === user.id),
    [complaints, user.id]
  );

  // Dashboard filters
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | "">("");
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | "">("");
  const [filterDate, setFilterDate] = useState("");

  const filteredComplaints = useMemo(() => {
    return myComplaints.filter((c) => {
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterCategory && c.category !== filterCategory) return false;
      if (filterDate && !c.submittedAt.startsWith(filterDate)) return false;
      return true;
    });
  }, [myComplaints, filterStatus, filterCategory, filterDate]);

  // Submit form
  const [form, setForm] = useState<ComplaintFormData>({
    title: "",
    room: user.room ?? "",
    description: "",
    category: "electrical",
    urgency: "medium",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleFormChange = (field: keyof ComplaintFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChatbotFill = (data: { title: string; description: string; category: ComplaintCategory; urgency: UrgencyLevel }) => {
    setForm((prev) => ({
      ...prev,
      title: data.title,
      description: data.description,
      category: data.category,
      urgency: data.urgency,
    }));
    setTab("submit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newComplaint: Complaint = {
        id: `CMP-${String(complaints.length + 1).padStart(3, "0")}`,
        studentId: user.id,
        studentName: user.name,
        room: form.room,
        title: form.title,
        description: form.description,
        category: form.category,
        urgency: form.urgency,
        status: "pending",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updates: [],
      };
      setComplaints((prev) => [...prev, newComplaint]);
      setSubmitting(false);
      setSubmitted(true);
      setForm({ title: "", room: user.room ?? "", description: "", category: "electrical", urgency: "medium" });
      setTimeout(() => {
        setSubmitted(false);
        setTab("my_complaints");
      }, 2000);
    }, 700);
  };

  const stats = {
    total: myComplaints.length,
    pending: myComplaints.filter((c) => c.status === "pending").length,
    in_progress: myComplaints.filter((c) => c.status === "in_progress").length,
    resolved: myComplaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F4F5F7" }}>
      <Sidebar
        user={user}
        activeTab={tab}
        onTabChange={(t) => setTab(t as Tab)}
        navItems={NAV_ITEMS}
        onLogout={onLogout}
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Topbar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b"
          style={{ backgroundColor: "#fff", borderColor: "var(--border)" }}
        >
          <div>
            <h1
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              {tab === "dashboard" && "Dashboard"}
              {tab === "submit" && "New Complaint"}
              {tab === "my_complaints" && "My Complaints"}
            </h1>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              {user.name} · Room {user.room}
            </p>
          </div>
          <button
            onClick={() => setShowChatbot(true)}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            AI Assistant
          </button>
        </header>

        <div className="flex-1 p-8">
          {/* === DASHBOARD === */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total", value: stats.total, color: "#1A3A5C" },
                  { label: "Pending", value: stats.pending, color: "#D97706" },
                  { label: "In Progress", value: stats.in_progress, color: "#2563EB" },
                  { label: "Resolved", value: stats.resolved, color: "#059669" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-5"
                    style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
                  >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-2"
                      style={{ color: "#6B7280", fontFamily: "var(--font-mono)" }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: s.color, fontFamily: "var(--font-display)" }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div
                className="rounded-lg p-4 flex flex-wrap gap-3 items-end"
                style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
              >
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#374151", fontFamily: "var(--font-display)" }}
                  >
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ComplaintStatus | "")}
                    className="px-3 py-1.5 rounded text-sm border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)" }}
                  >
                    <option value="">All statuses</option>
                    {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#374151", fontFamily: "var(--font-display)" }}
                  >
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as ComplaintCategory | "")}
                    className="px-3 py-1.5 rounded text-sm border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)" }}
                  >
                    <option value="">All categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#374151", fontFamily: "var(--font-display)" }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-1.5 rounded text-sm border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)" }}
                  />
                </div>
                <button
                  onClick={() => { setFilterStatus(""); setFilterCategory(""); setFilterDate(""); }}
                  className="px-3 py-1.5 rounded text-sm border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "#6B7280" }}
                >
                  Clear
                </button>
              </div>

              {/* Complaint cards */}
              <div className="space-y-3">
                {filteredComplaints.length === 0 ? (
                  <div
                    className="rounded-lg py-12 text-center"
                    style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
                  >
                    <p className="text-sm" style={{ color: "#6B7280" }}>
                      No complaints match your filters.
                    </p>
                  </div>
                ) : (
                  filteredComplaints.map((c) => (
                    <ComplaintCard key={c.id} complaint={c} onClick={() => setSelectedComplaint(c)} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* === SUBMIT === */}
          {tab === "submit" && (
            <div className="max-w-2xl">
              <div
                className="rounded-lg p-8"
                style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: "#111827" }}
                  >
                    Submit a Complaint
                  </h2>
                  <button
                    onClick={() => setShowChatbot(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--border)", color: "#0E7C7B" }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Use AI Assistant
                  </button>
                </div>

                {submitted && (
                  <div
                    className="mb-6 px-4 py-3 rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46" }}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      Complaint submitted successfully! Redirecting…
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Auto-populated */}
                  <div className="grid grid-cols-2 gap-4">
                    <ReadonlyField label="Student Name" value={user.name} />
                    <ReadonlyField label="Student ID" value={user.id} mono />
                  </div>

                  <FormField label="Complaint Title" required>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      required
                      placeholder="e.g. Fan switch not working"
                      className="field-input"
                      style={fieldStyle}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Room Number" required>
                      <input
                        type="text"
                        value={form.room}
                        onChange={(e) => handleFormChange("room", e.target.value)}
                        required
                        placeholder="e.g. A-204"
                        style={{ ...fieldStyle, fontFamily: "var(--font-mono)" }}
                      />
                    </FormField>
                    <FormField label="Category" required>
                      <select
                        value={form.category}
                        onChange={(e) => handleFormChange("category", e.target.value)}
                        style={fieldStyle}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Urgency Level" required>
                    <div className="flex gap-2 flex-wrap">
                      {URGENCIES.map((u) => {
                        const urgencyColor: Record<UrgencyLevel, string> = {
                          low: "#6B7280",
                          medium: "#D97706",
                          high: "#DC2626",
                          critical: "#7C3AED",
                        };
                        const isSelected = form.urgency === u;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => handleFormChange("urgency", u)}
                            className="px-3 py-1.5 rounded text-xs font-medium border transition-all capitalize"
                            style={{
                              borderColor: isSelected ? urgencyColor[u] : "var(--border)",
                              backgroundColor: isSelected ? urgencyColor[u] + "15" : "transparent",
                              color: isSelected ? urgencyColor[u] : "#6B7280",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {u}
                          </button>
                        );
                      })}
                    </div>
                  </FormField>

                  <FormField label="Detailed Description" required>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      required
                      rows={5}
                      placeholder="Describe the issue in detail, including when it started and how it affects you…"
                      style={{ ...fieldStyle, resize: "vertical" }}
                    />
                  </FormField>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting || submitted}
                      className="px-6 py-2.5 rounded text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
                    >
                      {submitting ? "Submitting…" : "Submit Complaint"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ title: "", room: user.room ?? "", description: "", category: "electrical", urgency: "medium" })}
                      className="px-6 py-2.5 rounded text-sm font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "var(--border)", color: "#6B7280" }}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* === MY COMPLAINTS === */}
          {tab === "my_complaints" && (
            <div className="space-y-3">
              {myComplaints.length === 0 ? (
                <div
                  className="rounded-lg py-16 text-center"
                  style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
                >
                  <p className="text-sm mb-3" style={{ color: "#6B7280" }}>
                    You have not submitted any complaints yet.
                  </p>
                  <button
                    onClick={() => setTab("submit")}
                    className="px-4 py-2 rounded text-sm font-medium text-white"
                    style={{ backgroundColor: "#0E7C7B" }}
                  >
                    Submit your first complaint
                  </button>
                </div>
              ) : (
                myComplaints.map((c) => (
                  <ComplaintCard key={c.id} complaint={c} onClick={() => setSelectedComplaint(c)} />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Chatbot */}
      {showChatbot && (
        <Chatbot onFillForm={handleChatbotFill} onClose={() => setShowChatbot(false)} />
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      )}
    </div>
  );
}

function ComplaintCard({ complaint: c, onClick }: { complaint: Complaint; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg p-5 transition-shadow hover:shadow-md"
      style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}
            >
              {c.id}
            </span>
            <span className="text-xs" style={{ color: "#D1D5DB" }}>·</span>
            <span className="text-xs" style={{ color: "#6B7280", fontFamily: "var(--font-mono)" }}>
              Room {c.room}
            </span>
          </div>
          <h3
            className="text-sm font-semibold mb-1 truncate"
            style={{ fontFamily: "var(--font-display)", color: "#111827" }}
          >
            {c.title}
          </h3>
          <p className="text-xs line-clamp-1" style={{ color: "#6B7280" }}>
            {c.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={c.status} />
          <UrgencyBadge urgency={c.urgency} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: "#F4F5F7",
            color: "#6B7280",
            fontFamily: "var(--font-mono)",
          }}
        >
          {CATEGORY_LABELS[c.category]}
        </span>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          {new Date(c.submittedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}

function ComplaintDetailModal({ complaint: c, onClose }: { complaint: Complaint; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)", backgroundColor: "#fff" }}
        >
          <div>
            <p
              className="text-xs mb-0.5"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}
            >
              {c.id}
            </p>
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              {c.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex gap-3 flex-wrap">
            <StatusBadge status={c.status} />
            <UrgencyBadge urgency={c.urgency} />
            <span
              className="text-xs px-2 py-0.5 rounded border"
              style={{ borderColor: "var(--border)", color: "#6B7280", fontFamily: "var(--font-mono)" }}
            >
              {CATEGORY_LABELS[c.category]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Room</p>
              <p style={{ fontFamily: "var(--font-mono)", color: "#111827" }}>{c.room}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Submitted</p>
              <p style={{ fontFamily: "var(--font-mono)", color: "#111827" }}>
                {new Date(c.submittedAt).toLocaleString("en-IN")}
              </p>
            </div>
            {c.assignedTo && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Assigned to</p>
                <p style={{ color: "#111827" }}>{c.assignedTo}</p>
              </div>
            )}
          </div>

          <div>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-display)" }}
            >
              Description
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#374151", fontFamily: "var(--font-body)" }}
            >
              {c.description}
            </p>
          </div>

          {c.updates.length > 0 && (
            <div>
              <p
                className="text-xs font-medium mb-3"
                style={{ color: "#9CA3AF", fontFamily: "var(--font-display)" }}
              >
                Progress Updates
              </p>
              <div className="space-y-3">
                {c.updates.map((u) => (
                  <div
                    key={u.id}
                    className="pl-3 border-l-2"
                    style={{ borderColor: "#0E7C7B" }}
                  >
                    <p
                      className="text-xs mb-1"
                      style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}
                    >
                      {u.byName} · {new Date(u.timestamp).toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm" style={{ color: "#374151" }}>
                      {u.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid var(--border)",
  backgroundColor: "#fff",
  fontSize: "14px",
  fontFamily: "var(--font-body)",
  color: "#111827",
  outline: "none",
};

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "#374151", fontFamily: "var(--font-display)" }}
      >
        {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ReadonlyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "#374151", fontFamily: "var(--font-display)" }}
      >
        {label}
      </label>
      <div
        className="px-3 py-2 rounded text-sm"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "#F4F5F7",
          color: "#6B7280",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
