import { useState, useMemo } from "react";
import type { Complaint, ComplaintCategory, ComplaintStatus, User } from "../dummy";
import { COMPLAINTS, CATEGORY_LABELS, STATUS_LABELS, USERS } from "../dummy";
import Sidebar from "../components/Sidebar";
import { StatusBadge, UrgencyBadge } from "../components/StatusBadge";

type Tab = "dashboard" | "assigned";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "All Complaints",
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
    id: "assigned",
    label: "My Assignments",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const STATUSES: ComplaintStatus[] = ["pending", "in_progress", "resolved", "rejected"];
const CATEGORIES: ComplaintCategory[] = [
  "electrical",
  "plumbing",
  "furniture",
  "cleanliness",
  "security",
  "internet",
  "others",
];

interface Props {
  user: User;
  onLogout: () => void;
}

export default function StaffDashboard({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | "">("");
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | "">("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const displayed = useMemo(() => {
    let list = tab === "assigned"
      ? complaints.filter((c) => c.assignedTo === user.id)
      : complaints;
    if (filterCategory) list = list.filter((c) => c.category === filterCategory);
    if (filterStatus) list = list.filter((c) => c.status === filterStatus);
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [complaints, tab, user.id, filterCategory, filterStatus]);

  const stats = {
    all: complaints.length,
    assigned: complaints.filter((c) => c.assignedTo === user.id).length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const handleUpdateComplaint = (id: string, updates: Partial<Complaint>) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    if (selectedComplaint?.id === id) {
      setSelectedComplaint((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F4F5F7" }}>
      <Sidebar
        user={user}
        activeTab={tab}
        onTabChange={(t) => setTab(t as Tab)}
        navItems={NAV_ITEMS}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 border-b"
          style={{ backgroundColor: "#fff", borderColor: "var(--border)" }}
        >
          <div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-2 inline-flex items-center justify-center rounded p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open navigation"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              {tab === "dashboard" ? "All Complaints" : "My Assignments"}
            </h1>
            <p className="text-xs hidden sm:block" style={{ color: "#6B7280" }}>
              {user.name} · {user.department}
            </p>
          </div>
          <div
            className="text-xs px-3 py-1 rounded"
            style={{
              backgroundColor: "#ECFDF5",
              color: "#065F46",
              fontFamily: "var(--font-mono)",
              border: "1px solid #6EE7B7",
            }}
          >
            Staff Portal
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Total", value: stats.all, color: "#1A3A5C" },
              { label: "Assigned to me", value: stats.assigned, color: "#0E7C7B" },
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
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ComplaintCategory | "")}
                className="px-3 py-1.5 rounded text-sm border outline-none"
                style={{ borderColor: "var(--border)" }}
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
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ComplaintStatus | "")}
                className="px-3 py-1.5 rounded text-sm border outline-none"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setFilterCategory(""); setFilterStatus(""); }}
              className="px-3 py-1.5 rounded text-sm border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--border)", color: "#6B7280" }}
            >
              Clear
            </button>
            <span
              className="ml-auto text-xs"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}
            >
              {displayed.length} complaint{displayed.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div
            className="rounded-lg overflow-x-auto"
            style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
          >
            <table className="min-w-[760px] w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#F4F5F7", borderBottom: "1px solid var(--border)" }}>
                  {["ID", "Student / Room", "Title", "Category", "Urgency", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#6B7280", fontFamily: "var(--font-mono)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: "#9CA3AF" }}>
                      No complaints match the current filters.
                    </td>
                  </tr>
                ) : (
                  displayed.map((c, i) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-gray-50 cursor-pointer"
                      style={{ borderBottom: i < displayed.length - 1 ? "1px solid var(--border)" : undefined }}
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <td
                        className="px-4 py-3"
                        style={{ fontFamily: "var(--font-mono)", color: "#9CA3AF", fontSize: "12px" }}
                      >
                        {c.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs" style={{ color: "#111827" }}>
                          {c.studentName}
                        </p>
                        <p style={{ color: "#9CA3AF", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                          Room {c.room}
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="truncate text-xs font-medium" style={{ color: "#111827" }}>
                          {c.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs"
                          style={{ color: "#6B7280", fontFamily: "var(--font-mono)" }}
                        >
                          {CATEGORY_LABELS[c.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <UrgencyBadge urgency={c.urgency} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}
                      >
                        {new Date(c.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleUpdateComplaint(c.id, {
                              status: e.target.value as ComplaintStatus,
                              assignedTo: c.assignedTo ?? user.id,
                            })
                          }
                          className="text-xs px-2 py-1 rounded border outline-none"
                          style={{ borderColor: "var(--border)", fontFamily: "var(--font-mono)" }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail + Update Modal */}
      {selectedComplaint && (
        <StaffUpdateModal
          complaint={selectedComplaint}
          staffUser={user}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={(id, updates) => handleUpdateComplaint(id, updates)}
        />
      )}
    </div>
  );
}

function StaffUpdateModal({
  complaint: c,
  staffUser,
  onClose,
  onUpdate,
}: {
  complaint: Complaint;
  staffUser: User;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Complaint>) => void;
}) {
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(c.status);
  const [updateMsg, setUpdateMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!updateMsg.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const newUpdate = {
        id: `UPD-${Date.now()}`,
        message: updateMsg.trim(),
        by: staffUser.id,
        byName: staffUser.name,
        timestamp: new Date().toISOString(),
      };
      onUpdate(c.id, {
        status: newStatus,
        assignedTo: staffUser.id,
        updates: [...c.updates, newUpdate],
      });
      setSaving(false);
      onClose();
    }, 600);
  };

  const student = USERS.find((u) => u.id === c.studentId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={c.status} />
            <UrgencyBadge urgency={c.urgency} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Student</p>
              <p style={{ color: "#111827" }}>{c.studentName}</p>
              <p style={{ color: "#6B7280", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                {student?.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Room</p>
              <p style={{ fontFamily: "var(--font-mono)", color: "#111827" }}>{c.room}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>Description</p>
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{c.description}</p>
          </div>

          {c.updates.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-3" style={{ color: "#9CA3AF" }}>Updates</p>
              <div className="space-y-3">
                {c.updates.map((u) => (
                  <div key={u.id} className="pl-3 border-l-2" style={{ borderColor: "#0E7C7B" }}>
                    <p className="text-xs mb-1" style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}>
                      {u.byName} · {new Date(u.timestamp).toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm" style={{ color: "#374151" }}>{u.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update form */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{ backgroundColor: "#F4F5F7", border: "1px solid var(--border)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#374151", fontFamily: "var(--font-display)" }}
            >
              Add Progress Update
            </p>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
                Update Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 rounded text-sm border outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "#fff" }}
              >
                {(["pending", "in_progress", "resolved", "rejected"] as ComplaintStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
                Update Message
              </label>
              <textarea
                value={updateMsg}
                onChange={(e) => setUpdateMsg(e.target.value)}
                rows={3}
                placeholder="Describe progress, findings, or resolution…"
                className="w-full px-3 py-2 rounded text-sm border outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "#fff", resize: "vertical" }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!updateMsg.trim() || saving}
              className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0E7C7B", fontFamily: "var(--font-display)" }}
            >
              {saving ? "Saving…" : "Save Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
