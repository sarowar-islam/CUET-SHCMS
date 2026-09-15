// Types matching backend entities

export type Role = "student" | "staff" | "admin";

export interface User {
  id: string;
  userId: string;
  username: string;
  name: string;
  role: Role;
  email: string;
  room?: string;
  department?: string;
  phone?: string;
  active: boolean;
}

export interface ManagedUser {
  userId: string;
  username: string;
  role: Role;
  name: string;
  email: string;
  room?: string;
  department?: string;
  phone?: string;
  active: boolean;
  joinedDate?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  name: string;
  role: string;
  email: string;
  room?: string;
  department?: string;
  phone?: string;
  active: boolean;
}

export type ComplaintStatus = "pending" | "in_progress" | "resolved" | "rejected";
export type ComplaintCategory = "electrical" | "plumbing" | "furniture" | "cleanliness" | "security" | "internet" | "others";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  assignedTo?: string;
  submittedAt: string;
  updatedAt: string;
  updates: ComplaintUpdate[];
}

export interface ComplaintUpdate {
  id: string;
  message: string;
  by: string;
  byName: string;
  timestamp: string;
}

export interface SystemConfig {
  hallName: string;
  totalRooms: number;
  wardenName: string;
  contactEmail: string;
  notificationsEnabled: boolean;
  autoAssign: boolean;
  maxComplaintsPerDay: number;
}

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  furniture: "Furniture",
  cleanliness: "Cleanliness",
  security: "Security",
  internet: "Internet / Network",
  others: "Others",
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};