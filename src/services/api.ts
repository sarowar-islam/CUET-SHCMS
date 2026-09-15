import api from "../utils/api";
import type { LoginRequest, LoginResponse, User, Complaint, SystemConfig } from "../types";
import type { Role } from "../types";

// Auth Service
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
  },

  saveToken: (token: string): void => {
    localStorage.setItem("auth_token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  saveUser: (user: LoginResponse): void => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser: (): LoginResponse | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  clearAuth: (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },

  getStoredUser: (): { userId: string; username: string; role: Role; name: string; email: string; room?: string; department?: string; phone?: string; active: boolean } | null => {
    const user = authService.getUser();
    if (user) {
      return {
        userId: user.userId,
        username: user.username,
        role: user.role as Role,
        name: user.name,
        email: user.email,
        room: user.room,
        department: user.department,
        phone: user.phone,
        active: user.active,
      };
    }
    return null;
  },
};

// Complaint Service
export const complaintService = {
  getAll: async (): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>("/complaints");
    return response.data;
  },

  getById: async (id: number | string): Promise<Complaint> => {
    const response = await api.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>(`/complaints/student/${studentId}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>(`/complaints/status/${status}`);
    return response.data;
  },

  getPending: async (): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>("/complaints/pending");
    return response.data;
  },

  getByAssignedTo: async (assignedTo: string): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>(`/complaints/assigned/${assignedTo}`);
    return response.data;
  },

  create: async (complaint: Partial<Complaint>): Promise<Complaint> => {
    const response = await api.post<Complaint>("/complaints", complaint);
    return response.data;
  },

  update: async (id: number, updates: Partial<Complaint>): Promise<Complaint> => {
    const response = await api.put<Complaint>(`/complaints/${id}`, updates);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Complaint> => {
    const response = await api.patch<Complaint>(`/complaints/${id}/status`, { status });
    return response.data;
  },

  assign: async (id: number, assignedTo: string): Promise<Complaint> => {
    const response = await api.patch<Complaint>(`/complaints/${id}/assign`, { assignedTo });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/complaints/${id}`);
  },
};

// Config Service
export const configService = {
  get: async (): Promise<SystemConfig> => {
    const response = await api.get<SystemConfig>("/config");
    return response.data;
  },

  update: async (config: SystemConfig): Promise<SystemConfig> => {
    const response = await api.put<SystemConfig>("/config", config);
    return response.data;
  },
};