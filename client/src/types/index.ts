// User types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'superadmin';
  name: string;
  phone?: string;
  createdAt: string;
}

// Property types
export interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  features: string[];
  status: 'available' | 'sold' | 'pending';
  imageUrl: string;
  createdAt: string;
  updatedAt?: string;
}

// Inquiry types
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle?: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

// Calendar Event types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  agentId: string;
  inquiryId?: string;
  type: 'viewing' | 'meeting' | 'other';
  createdAt: string;
  updatedAt?: string;
}

// Activity Log types
export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

// Agent creation types
export interface NewAgent {
  email: string;
  password: string;
  name: string;
  phone: string;
  employmentData: EmploymentData;
  createdBy?: string;
}

export interface EmploymentData {
  position: string;
  department: string;
  startDate: string;
  salary?: number;
  benefits?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}
