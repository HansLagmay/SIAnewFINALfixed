import type { User } from '../types';

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

const SESSION_KEYS: Record<User['role'], string> = {
  admin: 'session_admin',
  agent: 'session_agent',
  superadmin: 'session_superadmin'
};

const getRoleFromPath = (): User['role'] | null => {
  const p = typeof window !== 'undefined' ? window.location.pathname : '';
  if (p.startsWith('/agent')) return 'agent';
  if (p.startsWith('/admin') || p.startsWith('/database')) return 'admin';
  if (p.startsWith('/superadmin')) return 'superadmin';
  return null;
};

const getKeyForRole = (role: User['role']): string => SESSION_KEYS[role];

export const setSession = (user: User, token: string): void => {
  const session: Session = {
    user,
    token,
    expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
  };
  localStorage.setItem(getKeyForRole(user.role), JSON.stringify(session));
};

export const getSession = (role?: User['role']): Session | null => {
  const resolvedRole = role || getRoleFromPath();
  const key = resolvedRole ? getKeyForRole(resolvedRole) : null;
  const sessionStr = key ? localStorage.getItem(key) : null;
  if (!sessionStr) return null;
  
  try {
    const session: Session = JSON.parse(sessionStr);
    
    if (Date.now() > session.expiresAt) {
      clearSession(resolvedRole || undefined);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    clearSession(resolvedRole || undefined);
    return null;
  }
};

export const clearSession = (role?: User['role']): void => {
  const resolvedRole = role || getRoleFromPath();
  if (resolvedRole) {
    localStorage.removeItem(getKeyForRole(resolvedRole));
  } else {
    // Fallback: clear all known sessions
    Object.values(SESSION_KEYS).forEach(k => localStorage.removeItem(k));
  }
  localStorage.removeItem('user');
};

export const isSessionValid = (role?: User['role']): boolean => {
  return getSession(role) !== null;
};

export const getToken = (role?: User['role']): string | null => {
  const session = getSession(role);
  return session ? session.token : null;
};

export const getUser = (role?: User['role']): Session['user'] | null => {
  const session = getSession(role);
  return session ? session.user : null;
};
