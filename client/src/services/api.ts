import axios from 'axios';
import type {
  Property,
  Inquiry,
  User,
  CalendarEvent,
  ActivityLog,
  LoginCredentials,
  LoginResponse,
  NewAgent
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Properties API
export const propertiesAPI = {
  getAll: () => api.get<Property[]>('/properties'),
  getById: (id: string) => api.get<Property>(`/properties/${id}`),
  create: (property: Partial<Property>) => api.post<Property>('/properties', property),
  update: (id: string, property: Partial<Property>) => api.put<Property>(`/properties/${id}`, property),
  delete: (id: string, user?: string) => api.delete(`/properties/${id}`, { params: { user } }),
};

// Inquiries API
export const inquiriesAPI = {
  getAll: () => api.get<Inquiry[]>('/inquiries'),
  getById: (id: string) => api.get<Inquiry>(`/inquiries/${id}`),
  create: (inquiry: Partial<Inquiry>) => api.post<Inquiry>('/inquiries', inquiry),
  update: (id: string, inquiry: Partial<Inquiry>) => api.put<Inquiry>(`/inquiries/${id}`, inquiry),
  delete: (id: string, user?: string) => api.delete(`/inquiries/${id}`, { params: { user } }),
};

// Users API
export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getAgents: () => api.get<User[]>('/users/agents'),
  create: (agent: NewAgent) => api.post<User>('/users', agent),
  delete: (id: string, user?: string) => api.delete(`/users/${id}`, { params: { user } }),
};

// Calendar API
export const calendarAPI = {
  getAll: () => api.get<CalendarEvent[]>('/calendar'),
  getByAgent: (agentId: string) => api.get<CalendarEvent[]>(`/calendar/agent/${agentId}`),
  create: (event: Partial<CalendarEvent>) => api.post<CalendarEvent>('/calendar', event),
  update: (id: string, event: Partial<CalendarEvent>) => api.put<CalendarEvent>(`/calendar/${id}`, event),
  delete: (id: string, user?: string) => api.delete(`/calendar/${id}`, { params: { user } }),
};

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => api.post<LoginResponse>('/login', credentials),
};

// Activity Log API
export const activityLogAPI = {
  getAll: (page?: number, limit?: number) => 
    api.get<{ logs: ActivityLog[]; total: number; page: number; totalPages: number }>(
      '/activity-log',
      { params: { page, limit } }
    ),
};

export default api;
