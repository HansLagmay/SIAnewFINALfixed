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

const readSession = (role: User['role']): Session | null => {
  const sessionStr = localStorage.getItem(getKeyForRole(role));
  if (!sessionStr) return null;
  try {
    const session: Session = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(getKeyForRole(role));
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    localStorage.removeItem(getKeyForRole(role));
    return null;
  }
};

const readLegacySession = (): Session | null => {
  const sessionStr = localStorage.getItem('session');
  if (!sessionStr) return null;
  try {
    const session: Session = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('session');
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    localStorage.removeItem('session');
    return null;
  }
};

const rolesForPath = (): User['role'][] => {
  const role = getRoleFromPath();
  if (role === 'superadmin') return ['superadmin', 'admin'];
  if (role === 'admin') return ['admin'];
  if (role === 'agent') return ['agent'];
  return [];
};

export const setSession = (user: User, token: string): void => {
  const session: Session = {
    user,
    token,
    expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
  };
  localStorage.setItem(getKeyForRole(user.role), JSON.stringify(session));
};

export const getSession = (role?: User['role']): Session | null => {
  if (role) {
    return readSession(role);
  }
  const candidates = rolesForPath();
  for (const r of candidates) {
    const session = readSession(r);
    if (session) return session;
  }
  const legacy = readLegacySession();
  if (legacy) {
    localStorage.setItem(getKeyForRole(legacy.user.role), JSON.stringify(legacy));
    localStorage.removeItem('session');
    return legacy;
  }
  return null;
};

export const getSessionForRoles = (roles: User['role'][]): Session | null => {
  for (const r of roles) {
    const session = readSession(r);
    if (session) return session;
  }
  const legacy = readLegacySession();
  if (legacy && roles.includes(legacy.user.role)) {
    localStorage.setItem(getKeyForRole(legacy.user.role), JSON.stringify(legacy));
    localStorage.removeItem('session');
    return legacy;
  }
  return null;
};

export const clearSession = (role?: User['role']): void => {
  const resolvedRole = role || rolesForPath()[0] || null;
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
