export type Role = "student" | "staff" | "admin";

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
  email: string;
  room?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  joinedDate: string;
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

export const USERS: User[] = [
  {
    id: "2204107",
    username: "2204107",
    password: "student",
    role: "student",
    name: "Arjun Mehta",
    email: "arjun.mehta@university.edu",
    room: "A-204",
    phone: "+91 98765 43210",
    joinedDate: "2022-08-01",
    active: true,
  },
  {
    id: "2204048",
    username: "2204048",
    password: "student",
    role: "student",
    name: "Priya Sharma",
    email: "priya.sharma@university.edu",
    room: "B-112",
    phone: "+91 98765 11223",
    joinedDate: "2022-08-01",
    active: true,
  },
  {
    id: "2203091",
    username: "2203091",
    password: "student",
    role: "student",
    name: "Rohan Verma",
    email: "rohan.verma@university.edu",
    room: "C-305",
    phone: "+91 91234 56789",
    joinedDate: "2021-08-01",
    active: true,
  },
  {
    id: "2205062",
    username: "2205062",
    password: "student",
    role: "student",
    name: "Kavya Nair",
    email: "kavya.nair@university.edu",
    room: "A-108",
    phone: "+91 87654 32109",
    joinedDate: "2023-08-01",
    active: true,
  },
  {
    id: "2201033",
    username: "2201033",
    password: "student",
    role: "student",
    name: "Siddharth Rao",
    email: "siddharth.rao@university.edu",
    room: "D-210",
    phone: "+91 99887 76654",
    joinedDate: "2020-08-01",
    active: false,
  },
  {
    id: "staff1",
    username: "staff1",
    password: "staff1",
    role: "staff",
    name: "Ramesh Kumar",
    email: "ramesh.kumar@university.edu",
    department: "Electrical & Maintenance",
    phone: "+91 94455 66778",
    joinedDate: "2019-03-15",
    active: true,
  },
  {
    id: "staff2",
    username: "staff2",
    password: "staff2",
    role: "staff",
    name: "Sunita Pillai",
    email: "sunita.pillai@university.edu",
    department: "Plumbing & Civil",
    phone: "+91 93344 55667",
    joinedDate: "2020-06-01",
    active: true,
  },
  {
    id: "staff3",
    username: "staff3",
    password: "staff3",
    role: "staff",
    name: "Mohan Das",
    email: "mohan.das@university.edu",
    department: "Security & General",
    phone: "+91 92233 44556",
    joinedDate: "2018-11-20",
    active: true,
  },
  {
    id: "admin",
    username: "admin",
    password: "admin",
    role: "admin",
    name: "Dr. Anita Krishnan",
    email: "admin@university.edu",
    department: "Hall Administration",
    phone: "+91 98001 23456",
    joinedDate: "2015-07-01",
    active: true,
  },
];

export const COMPLAINTS: Complaint[] = [
  {
    id: "CMP-001",
    studentId: "2204107",
    studentName: "Arjun Mehta",
    room: "A-204",
    title: "Fan switch not working",
    description:
      "The ceiling fan switch in my room has stopped working completely. The fan does not respond when the switch is toggled. This is causing severe discomfort especially during night hours.",
    category: "electrical",
    urgency: "high",
    status: "in_progress",
    assignedTo: "staff1",
    submittedAt: "2026-08-20T09:15:00Z",
    updatedAt: "2026-08-21T11:30:00Z",
    updates: [
      {
        id: "UPD-001",
        message: "Complaint received and assigned to Ramesh Kumar for inspection.",
        by: "admin",
        byName: "Dr. Anita Krishnan",
        timestamp: "2026-08-20T10:00:00Z",
      },
      {
        id: "UPD-002",
        message: "Inspected the room. Faulty switch identified. Replacement part ordered. Will be fixed by tomorrow.",
        by: "staff1",
        byName: "Ramesh Kumar",
        timestamp: "2026-08-21T11:30:00Z",
      },
    ],
  },
  {
    id: "CMP-002",
    studentId: "2204107",
    studentName: "Arjun Mehta",
    room: "A-204",
    title: "Water leakage from washroom tap",
    description:
      "The hot water tap in the attached washroom is leaking continuously. Water is pooling on the floor and this is creating a slipping hazard.",
    category: "plumbing",
    urgency: "critical",
    status: "resolved",
    assignedTo: "staff2",
    submittedAt: "2026-08-10T14:00:00Z",
    updatedAt: "2026-08-12T16:00:00Z",
    updates: [
      {
        id: "UPD-003",
        message: "Plumber visited and replaced the tap washer. Issue resolved.",
        by: "staff2",
        byName: "Sunita Pillai",
        timestamp: "2026-08-12T16:00:00Z",
      },
    ],
  },
  {
    id: "CMP-003",
    studentId: "2204048",
    studentName: "Priya Sharma",
    room: "B-112",
    title: "Broken study chair",
    description:
      "The study chair's backrest is broken and wobbles dangerously. Using it poses a risk of injury. Requesting replacement urgently.",
    category: "furniture",
    urgency: "medium",
    status: "pending",
    submittedAt: "2026-08-23T08:30:00Z",
    updatedAt: "2026-08-23T08:30:00Z",
    updates: [],
  },
  {
    id: "CMP-004",
    studentId: "2204048",
    studentName: "Priya Sharma",
    room: "B-112",
    title: "Wi-Fi not working in room",
    description:
      "There has been no internet connectivity in my room for the past 3 days. The Wi-Fi access point on the B-wing corridor shows connected but there is no actual internet access.",
    category: "internet",
    urgency: "high",
    status: "in_progress",
    assignedTo: "staff3",
    submittedAt: "2026-08-19T20:00:00Z",
    updatedAt: "2026-08-22T10:15:00Z",
    updates: [
      {
        id: "UPD-004",
        message: "Networking team notified. Will check the B-wing access point.",
        by: "staff3",
        byName: "Mohan Das",
        timestamp: "2026-08-22T10:15:00Z",
      },
    ],
  },
  {
    id: "CMP-005",
    studentId: "2203091",
    studentName: "Rohan Verma",
    room: "C-305",
    title: "Common bathroom not cleaned",
    description:
      "The common bathroom on the 3rd floor of C block has not been cleaned for over 4 days. There is a foul odour and the floor is visibly dirty.",
    category: "cleanliness",
    urgency: "high",
    status: "resolved",
    assignedTo: "staff3",
    submittedAt: "2026-08-15T07:45:00Z",
    updatedAt: "2026-08-15T14:30:00Z",
    updates: [
      {
        id: "UPD-005",
        message: "Housekeeping team deployed. Bathroom cleaned and sanitised.",
        by: "staff3",
        byName: "Mohan Das",
        timestamp: "2026-08-15T14:30:00Z",
      },
    ],
  },
  {
    id: "CMP-006",
    studentId: "2205062",
    studentName: "Kavya Nair",
    room: "A-108",
    title: "Main gate security not present at night",
    description:
      "On multiple occasions between 11 PM and 2 AM, the security guard at the main gate was found absent. This is a major safety concern for residents.",
    category: "security",
    urgency: "critical",
    status: "in_progress",
    assignedTo: "staff3",
    submittedAt: "2026-08-22T23:10:00Z",
    updatedAt: "2026-08-23T09:00:00Z",
    updates: [
      {
        id: "UPD-006",
        message: "Issue escalated to the security supervisor. Night shift roster reviewed.",
        by: "admin",
        byName: "Dr. Anita Krishnan",
        timestamp: "2026-08-23T09:00:00Z",
      },
    ],
  },
  {
    id: "CMP-007",
    studentId: "2204107",
    studentName: "Arjun Mehta",
    room: "A-204",
    title: "Power socket not working",
    description:
      "The 5-pin power socket near the study table is dead. No power output detected. All other sockets in the room are working fine.",
    category: "electrical",
    urgency: "medium",
    status: "pending",
    submittedAt: "2026-08-24T17:30:00Z",
    updatedAt: "2026-08-24T17:30:00Z",
    updates: [],
  },
  {
    id: "CMP-008",
    studentId: "2203091",
    studentName: "Rohan Verma",
    room: "C-305",
    title: "Room door lock jammed",
    description:
      "The door lock of my room is jammed and doesn't lock properly from inside. This is a safety and privacy concern.",
    category: "others",
    urgency: "high",
    status: "rejected",
    submittedAt: "2026-08-18T13:00:00Z",
    updatedAt: "2026-08-19T09:00:00Z",
    updates: [
      {
        id: "UPD-007",
        message:
          "After inspection, the lock was found to be manually tampered. Student is advised to not tamper with fixtures. Complaint rejected. Please contact the warden directly.",
        by: "staff1",
        byName: "Ramesh Kumar",
        timestamp: "2026-08-19T09:00:00Z",
      },
    ],
  },
];

export const SYSTEM_CONFIG: SystemConfig = {
  hallName: "Kaveri Hall of Residence",
  totalRooms: 240,
  wardenName: "Dr. Anita Krishnan",
  contactEmail: "kaveri.hall@university.edu",
  notificationsEnabled: true,
  autoAssign: false,
  maxComplaintsPerDay: 5,
};

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

// Cookie helpers
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function authenticate(username: string, password: string): User | null {
  return USERS.find((u) => u.username === username && u.password === password && u.active) ?? null;
}
