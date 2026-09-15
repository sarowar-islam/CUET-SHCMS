import { useState, useMemo, useEffect } from "react";
import type {
  User,
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  SystemConfig,
} from "../dummy";
import AIAnalysis from "./AIAnalysis";
import {
  COMPLAINTS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  SYSTEM_CONFIG,
} from "../dummy";
import Sidebar from "../components/Sidebar";
import { StatusBadge, UrgencyBadge } from "../components/StatusBadge";
import { userService, type ManagedUserInput } from "../services/api";

type Tab =
  | "overview"
  | "complaints"
  | "students"
  | "staff"
  | "settings"
  | "analysis";

function toDashboardUser(user: {
  userId: string;
  username: string;
  role: string;
  name: string;
  email: string;
  room?: string;
  department?: string;
  phone?: string;
  active: boolean;
  joinedDate?: string;
}): User {
  return {
    id: user.userId,
    username: user.username,
    password: "",
    role: user.role.toLowerCase() as User["role"],
    name: user.name,
    email: user.email,
    room: user.room,
    department: user.department,
    phone: user.phone,
    joinedDate: user.joinedDate ?? "",
    active: user.active,
  };
}

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: "students",
    label: "Students",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "staff",
    label: "Staff",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "analysis",
    label: "AI Analysis",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface Props {
  user: User;
  onLogout: () => void;
}

export default function AdminConsole({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(SYSTEM_CONFIG);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | "">(
    "",
  );
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | "">("");
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    userService.getAll()
      .then((loadedUsers) => setUsers(loadedUsers.map(toDashboardUser)))
      .catch(() => setUserError("Unable to load users. Please try again."))
      .finally(() => setUserLoading(false));
  }, []);

  const students = users.filter((u) => u.role === "student");
  const staffList = users.filter((u) => u.role === "staff");
  const staffMap = Object.fromEntries(staffList.map((s) => [s.id, s.name]));

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (filterCategory && c.category !== filterCategory) return false;
        if (filterStatus && c.status !== filterStatus) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
  }, [complaints, filterCategory, filterStatus]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of complaints) {
      map[c.category] = (map[c.category] ?? 0) + 1;
    }
    return map;
  }, [complaints]);

  const handleToggleUser = async (user: User) => {
    try {
      const updated = await userService.setActive(user.id, !user.active);
      setUsers((prev) => prev.map((item) => item.id === user.id ? toDashboardUser(updated) : item));
    } catch {
      setUserError("Unable to update this account.");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;
    try {
      await userService.remove(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch {
      setUserError("Unable to delete this account.");
    }
  };

  const handleSaveUser = async (form: ManagedUserInput) => {
    try {
      const saved = editingUser
        ? await userService.update(editingUser.id, form)
        : await userService.create(form);
      setUsers((prev) => editingUser
        ? prev.map((item) => item.id === editingUser.id ? toDashboardUser(saved) : item)
        : [...prev, toDashboardUser(saved)]);
      setUserFormOpen(false);
      setEditingUser(null);
      setUserError("");
    } catch (error) {
      const message = error as { response?: { data?: { error?: string } } };
      setUserError(message.response?.data?.error ?? "Unable to save this account.");
      throw error;
    }
  };

  const handleAssign = (complaintId: string, staffId: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              assignedTo: staffId,
              status: "in_progress",
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
    if (selectedComplaint?.id === complaintId) {
      setSelectedComplaint((prev) =>
        prev ? { ...prev, assignedTo: staffId, status: "in_progress" } : null,
      );
    }
  };

  const handleConfigSave = () => {
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const overviewStats = [
    { label: "Total Complaints", value: complaints.length, color: "#1A3A5C" },
    {
      label: "Pending",
      value: complaints.filter((c) => c.status === "pending").length,
      color: "#D97706",
    },
    {
      label: "In Progress",
      value: complaints.filter((c) => c.status === "in_progress").length,
      color: "#2563EB",
    },
    {
      label: "Resolved",
      value: complaints.filter((c) => c.status === "resolved").length,
      color: "#059669",
    },
    {
      label: "Rejected",
      value: complaints.filter((c) => c.status === "rejected").length,
      color: "#DC2626",
    },
    {
      label: "Active Students",
      value: students.filter((s) => s.active).length,
      color: "#7C3AED",
    },
  ];

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
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "#111827" }}
            >
              {NAV_ITEMS.find((n) => n.id === tab)?.label ?? "Admin Console"}
            </h1>
            <p className="text-xs hidden sm:block" style={{ color: "#6B7280" }}>
              {user.name} · {config.hallName}
            </p>
          </div>
          <div
            className="text-xs px-3 py-1 rounded"
            style={{
              backgroundColor: "#F3E8FF",
              color: "#6D28D9",
              fontFamily: "var(--font-mono)",
              border: "1px solid #DDD6FE",
            }}
          >
            Admin Console
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setTab("students"); setEditingUser(null); setUserFormOpen(true); }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: "#0E7C7B" }}
            >
              <span aria-hidden="true">+</span><span className="hidden sm:inline">Add Student</span><span className="sm:hidden">Student</span>
            </button>
            <button
              onClick={() => { setTab("staff"); setEditingUser(null); setUserFormOpen(true); }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded text-xs font-semibold"
              style={{ backgroundColor: "#E8EDF4", color: "#1A3A5C" }}
            >
              <span aria-hidden="true">+</span><span className="hidden sm:inline">Add Staff</span><span className="sm:hidden">Staff</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {userError && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
              {userError}
            </div>
          )}
          {/* ===== OVERVIEW ===== */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {overviewStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-5"
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-2"
                      style={{
                        color: "#6B7280",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{
                        color: s.color,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#111827",
                  }}
                >
                  Complaints by Category
                </h3>
                <div className="space-y-3">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                    const count = categoryBreakdown[key] ?? 0;
                    const pct = complaints.length
                      ? Math.round((count / complaints.length) * 100)
                      : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span
                            style={{
                              color: "#374151",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              color: "#9CA3AF",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          className="w-full rounded-full h-1.5"
                          style={{ backgroundColor: "#EEF0F4" }}
                        >
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: "#0E7C7B",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent complaints */}
              <div
                className="rounded-lg overflow-x-auto"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="px-5 py-3 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "#111827",
                    }}
                  >
                    Recent Complaints
                  </h3>
                </div>
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F4F5F7" }}>
                      {[
                        "ID",
                        "Student",
                        "Title",
                        "Category",
                        "Status",
                        "Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{
                            color: "#6B7280",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints
                      .slice(-5)
                      .reverse()
                      .map((c, i) => (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          style={{ borderTop: "1px solid var(--border)" }}
                          onClick={() => {
                            setSelectedComplaint(c);
                            setTab("complaints");
                          }}
                        >
                          <td
                            className="px-4 py-2.5 text-xs"
                            style={{
                              color: "#9CA3AF",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {c.id}
                          </td>
                          <td
                            className="px-4 py-2.5 text-xs font-medium"
                            style={{ color: "#111827" }}
                          >
                            {c.studentName}
                          </td>
                          <td
                            className="px-4 py-2.5 text-xs truncate max-w-[160px]"
                            style={{ color: "#374151" }}
                          >
                            {c.title}
                          </td>
                          <td
                            className="px-4 py-2.5 text-xs"
                            style={{
                              color: "#6B7280",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {CATEGORY_LABELS[c.category]}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td
                            className="px-4 py-2.5 text-xs"
                            style={{
                              color: "#9CA3AF",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {new Date(c.submittedAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== COMPLAINTS ===== */}
          {tab === "complaints" && (
            <>
              <div
                className="rounded-lg p-4 flex flex-wrap gap-3 items-end"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{
                      color: "#374151",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) =>
                      setFilterCategory(
                        e.target.value as ComplaintCategory | "",
                      )
                    }
                    className="px-3 py-1.5 rounded text-sm border outline-none"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="">All categories</option>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{
                      color: "#374151",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as ComplaintStatus | "")
                    }
                    className="px-3 py-1.5 rounded text-sm border outline-none"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="">All statuses</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setFilterCategory("");
                    setFilterStatus("");
                  }}
                  className="px-3 py-1.5 rounded text-sm border hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "#6B7280" }}
                >
                  Clear
                </button>
                <span
                  className="ml-auto text-xs"
                  style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}
                >
                  {filteredComplaints.length} record
                  {filteredComplaints.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div
                className="rounded-lg overflow-x-auto"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F4F5F7" }}>
                      {[
                        "ID",
                        "Student / Room",
                        "Title",
                        "Category",
                        "Urgency",
                        "Status",
                        "Assigned To",
                        "Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{
                            color: "#6B7280",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-sm"
                          style={{ color: "#9CA3AF" }}
                        >
                          No complaints match filters.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c, i) => (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          style={{ borderTop: "1px solid var(--border)" }}
                          onClick={() => setSelectedComplaint(c)}
                        >
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              color: "#9CA3AF",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {c.id}
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className="text-xs font-medium"
                              style={{ color: "#111827" }}
                            >
                              {c.studentName}
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: "#9CA3AF",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              Room {c.room}
                            </p>
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <p
                              className="text-xs truncate"
                              style={{ color: "#374151" }}
                            >
                              {c.title}
                            </p>
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              color: "#6B7280",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {CATEGORY_LABELS[c.category]}
                          </td>
                          <td className="px-4 py-3">
                            <UrgencyBadge urgency={c.urgency} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#6B7280" }}
                          >
                            {c.assignedTo ? (
                              (staffMap[c.assignedTo] ?? c.assignedTo)
                            ) : (
                              <span style={{ color: "#D1D5DB" }}>
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              color: "#9CA3AF",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {new Date(c.submittedAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== STUDENTS ===== */}
          {tab === "students" && (
            <div
              className="rounded-lg overflow-x-auto"
              style={{
                backgroundColor: "#fff",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="px-5 py-3 border-b flex items-center justify-between gap-3"
                style={{ borderColor: "var(--border)" }}
              >
                <h3
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#111827",
                  }}
                >
                  Registered Students ({students.length})
                </h3>
                <button
                  onClick={() => { setEditingUser(null); setUserFormOpen(true); }}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: "#0E7C7B" }}
                >
                  + Add Student
                </button>
              </div>
              <table className="min-w-[720px] w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#F4F5F7" }}>
                    {[
                      "Student ID",
                      "Name",
                      "Email",
                      "Room",
                      "Phone",
                      "Joined",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: "#6B7280",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#111827",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {s.id}
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-medium"
                        style={{ color: "#111827" }}
                      >
                        {s.name}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {s.email}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "#6B7280",
                        }}
                      >
                        {s.room}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {s.phone}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#9CA3AF",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {new Date(s.joinedDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: s.active ? "#ECFDF5" : "#FEF2F2",
                            color: s.active ? "#065F46" : "#B91C1C",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleUser(s)}
                          className="text-xs px-3 py-1 rounded border transition-colors hover:bg-gray-100"
                          style={{
                            borderColor: "var(--border)",
                            color: s.active ? "#DC2626" : "#059669",
                          }}
                        >
                          {s.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => { setEditingUser(s); setUserFormOpen(true); }}
                          className="ml-2 text-xs px-3 py-1 rounded border"
                          style={{ borderColor: "var(--border)", color: "#1A3A5C" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(s)}
                          className="ml-2 text-xs px-3 py-1 rounded border"
                          style={{ borderColor: "#FECACA", color: "#B91C1C" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== STAFF ===== */}
          {tab === "staff" && (
            <div
              className="rounded-lg overflow-x-auto"
              style={{
                backgroundColor: "#fff",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="px-5 py-3 border-b flex items-center justify-between gap-3"
                style={{ borderColor: "var(--border)" }}
              >
                <h3
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#111827",
                  }}
                >
                  Hall Staff ({staffList.length})
                </h3>
                <button
                  onClick={() => { setEditingUser(null); setUserFormOpen(true); }}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: "#0E7C7B" }}
                >
                  + Add Staff
                </button>
              </div>
              <table className="min-w-[720px] w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#F4F5F7" }}>
                    {[
                      "Staff ID",
                      "Name",
                      "Department",
                      "Email",
                      "Phone",
                      "Joined",
                      "Assigned",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: "#6B7280",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => {
                    const assignedCount = complaints.filter(
                      (c) => c.assignedTo === s.id,
                    ).length;
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50"
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#111827",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {s.id}
                        </td>
                        <td
                          className="px-4 py-3 text-xs font-medium"
                          style={{ color: "#111827" }}
                        >
                          {s.name}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#6B7280" }}
                        >
                          {s.department}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#6B7280" }}
                        >
                          {s.email}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#6B7280" }}
                        >
                          {s.phone}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#9CA3AF",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {new Date(s.joinedDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-medium"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "#0E7C7B",
                            }}
                          >
                            {assignedCount} complaint
                            {assignedCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleUser(s)}
                            className="text-xs px-3 py-1 rounded border transition-colors hover:bg-gray-100"
                            style={{
                              borderColor: "var(--border)",
                              color: s.active ? "#DC2626" : "#059669",
                            }}
                          >
                            {s.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => { setEditingUser(s); setUserFormOpen(true); }}
                            className="ml-2 text-xs px-3 py-1 rounded border"
                            style={{ borderColor: "var(--border)", color: "#1A3A5C" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(s)}
                            className="ml-2 text-xs px-3 py-1 rounded border"
                            style={{ borderColor: "#FECACA", color: "#B91C1C" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== AI ANALYSIS ===== */}
          {tab === "analysis" && <AIAnalysis complaints={complaints} />}

          {/* ===== SETTINGS ===== */}
          {tab === "settings" && (
            <div className="max-w-xl">
              <div
                className="rounded-lg p-8 space-y-6"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--border)",
                }}
              >
                <h2
                  className="text-base font-semibold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#111827",
                  }}
                >
                  System Configuration
                </h2>

                {configSaved && (
                  <div
                    className="px-4 py-3 rounded-lg flex items-center gap-2"
                    style={{
                      backgroundColor: "#ECFDF5",
                      border: "1px solid #6EE7B7",
                      color: "#065F46",
                    }}
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">
                      Configuration saved successfully.
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    {
                      label: "Hall Name",
                      key: "hallName" as keyof SystemConfig,
                    },
                    {
                      label: "Warden Name",
                      key: "wardenName" as keyof SystemConfig,
                    },
                    {
                      label: "Contact Email",
                      key: "contactEmail" as keyof SystemConfig,
                    },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label
                        className="block text-xs font-medium mb-1.5"
                        style={{
                          color: "#374151",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {label}
                      </label>
                      <input
                        type="text"
                        value={config[key] as string}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded text-sm border outline-none"
                        style={{
                          borderColor: "var(--border)",
                          fontFamily: "var(--font-body)",
                          color: "#111827",
                        }}
                      />
                    </div>
                  ))}

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{
                        color: "#374151",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Total Rooms
                    </label>
                    <input
                      type="number"
                      value={config.totalRooms}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          totalRooms: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 rounded text-sm border outline-none"
                      style={{
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-mono)",
                        color: "#111827",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{
                        color: "#374151",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Max Complaints Per Day (per student)
                    </label>
                    <input
                      type="number"
                      value={config.maxComplaintsPerDay}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          maxComplaintsPerDay: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3 py-2 rounded text-sm border outline-none"
                      style={{
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-mono)",
                        color: "#111827",
                      }}
                    />
                  </div>

                  {[
                    {
                      label: "Enable Email Notifications",
                      key: "notificationsEnabled" as keyof SystemConfig,
                    },
                    {
                      label: "Auto-assign Complaints",
                      key: "autoAssign" as keyof SystemConfig,
                    },
                  ].map(({ label, key }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2"
                    >
                      <span
                        className="text-sm"
                        style={{
                          color: "#374151",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {label}
                      </span>
                      <button
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200"
                        style={{
                          backgroundColor: config[key] ? "#0E7C7B" : "#D1D5DB",
                        }}
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                          style={{
                            margin: "2px",
                            transform: config[key]
                              ? "translateX(16px)"
                              : "translateX(0)",
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConfigSave}
                  className="px-6 py-2.5 rounded text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "#0E7C7B",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Admin complaint detail + assign modal */}
      {selectedComplaint && (
        <AdminComplaintModal
          complaint={selectedComplaint}
          staffList={staffList}
          onClose={() => setSelectedComplaint(null)}
          onAssign={handleAssign}
          onStatusChange={(id, status) => {
            setComplaints((prev) =>
              prev.map((c) =>
                c.id === id
                  ? { ...c, status, updatedAt: new Date().toISOString() }
                  : c,
              ),
            );
            setSelectedComplaint((prev) => (prev ? { ...prev, status } : null));
          }}
        />
      )}
      {userFormOpen && (
        <UserFormModal
          user={editingUser}
          defaultRole={tab === "staff" ? "staff" : "student"}
          onClose={() => { setUserFormOpen(false); setEditingUser(null); }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  defaultRole,
  onClose,
  onSave,
}: {
  user: User | null;
  defaultRole: "student" | "staff";
  onClose: () => void;
  onSave: (form: ManagedUserInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ManagedUserInput>({
    userId: user?.id ?? "",
    username: user?.username ?? "",
    password: "",
    role: user?.role === "staff" ? "staff" : defaultRole,
    name: user?.name ?? "",
    email: user?.email ?? "",
    room: user?.room ?? "",
    department: user?.department ?? "",
    phone: user?.phone ?? "",
    active: user?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof ManagedUserInput, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, role: form.role as "student" | "staff" | "admin" });
    } catch {
      setError("Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <form className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6 space-y-4" style={{ backgroundColor: "#fff" }} onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "#111827", fontFamily: "var(--font-display)" }}>
            {user ? "Edit account" : `Add ${defaultRole}`}
          </h2>
          <button type="button" onClick={onClose} className="text-xl" style={{ color: "#6B7280" }} aria-label="Close">×</button>
        </div>
        {error && <p className="px-3 py-2 rounded text-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="User ID" value={form.userId} disabled={Boolean(user)} onChange={(value) => update("userId", value)} required />
          <Field label="Username" value={form.username} onChange={(value) => update("username", value)} required />
          <Field label="Full name" value={form.name} onChange={(value) => update("name", value)} required />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
          <Field label={user ? "New password (optional)" : "Password"} type="password" value={form.password ?? ""} onChange={(value) => update("password", value)} required={!user} />
          <Field label="Phone" value={form.phone ?? ""} onChange={(value) => update("phone", value)} />
          <Field label="Room" value={form.room ?? ""} onChange={(value) => update("room", value)} />
          <Field label="Department" value={form.department ?? ""} onChange={(value) => update("department", value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm border" style={{ borderColor: "var(--border)", color: "#374151" }}>Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "#0E7C7B" }}>{saving ? "Saving..." : "Save account"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false, required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="text-xs font-medium" style={{ color: "#374151" }}>
      {label}
      <input type={type} value={value} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full px-3 py-2 rounded text-sm border outline-none disabled:bg-gray-100" style={{ borderColor: "var(--border)", color: "#111827" }} />
    </label>
  );
}

function AdminComplaintModal({
  complaint: c,
  staffList,
  onClose,
  onAssign,
  onStatusChange,
}: {
  complaint: Complaint;
  staffList: User[];
  onClose: () => void;
  onAssign: (complaintId: string, staffId: string) => void;
  onStatusChange: (id: string, status: ComplaintStatus) => void;
}) {
  const [assignTo, setAssignTo] = useState(c.assignedTo ?? "");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(c.status);

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
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#9CA3AF" }}
              >
                Student
              </p>
              <p style={{ color: "#111827" }}>{c.studentName}</p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#9CA3AF" }}
              >
                Room
              </p>
              <p style={{ fontFamily: "var(--font-mono)", color: "#111827" }}>
                {c.room}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#9CA3AF" }}
              >
                Category
              </p>
              <p style={{ color: "#111827" }}>{CATEGORY_LABELS[c.category]}</p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#9CA3AF" }}
              >
                Submitted
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#111827",
                  fontSize: "12px",
                }}
              >
                {new Date(c.submittedAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "#9CA3AF" }}
            >
              Description
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
              {c.description}
            </p>
          </div>

          {c.updates.length > 0 && (
            <div>
              <p
                className="text-xs font-medium mb-3"
                style={{ color: "#9CA3AF" }}
              >
                Updates
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
                      style={{
                        color: "#9CA3AF",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {u.byName} ·{" "}
                      {new Date(u.timestamp).toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm" style={{ color: "#374151" }}>
                      {u.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin controls */}
          <div
            className="rounded-lg p-4 space-y-4"
            style={{
              backgroundColor: "#F4F5F7",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#374151", fontFamily: "var(--font-display)" }}
            >
              Admin Controls
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#374151" }}
                >
                  Assign to Staff
                </label>
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm border outline-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#374151" }}
                >
                  Update Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as ComplaintStatus)
                  }
                  className="w-full px-3 py-2 rounded text-sm border outline-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "#fff",
                  }}
                >
                  {(
                    [
                      "pending",
                      "in_progress",
                      "resolved",
                      "rejected",
                    ] as ComplaintStatus[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (assignTo) onAssign(c.id, assignTo);
                  onStatusChange(c.id, newStatus);
                  onClose();
                }}
                className="px-4 py-2 rounded text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#1A3A5C",
                  fontFamily: "var(--font-display)",
                }}
              >
                Apply Changes
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm border transition-colors hover:bg-gray-50"
                style={{ borderColor: "var(--border)", color: "#6B7280" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
