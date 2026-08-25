import type { ComplaintStatus, UrgencyLevel } from "../dummy";

const statusStyles: Record<ComplaintStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<ComplaintStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const urgencyStyles: Record<UrgencyLevel, string> = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-orange-50 text-orange-600 border-orange-200",
  high: "bg-red-50 text-red-600 border-red-200",
  critical: "bg-red-600 text-white border-red-700",
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mono ${statusStyles[status]}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {statusLabels[status]}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${urgencyStyles[urgency]}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {urgencyLabels[urgency]}
    </span>
  );
}
