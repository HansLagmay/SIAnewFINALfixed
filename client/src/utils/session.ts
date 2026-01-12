import type { User } from '../types';

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export const setSession = (user: User, token: string): void => {
  const session: Session = {
    user,
    token,
    expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
  };
  localStorage.setItem('session', JSON.stringify(session));
};

export const getSession = (): Session | null => {
  const sessionStr = localStorage.getItem('session');
  if (!sessionStr) return null;
  
  try {
    const session: Session = JSON.parse(sessionStr);
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    clearSession();
    return null;
  }
};

export const clearSession = (): void => {
  localStorage.removeItem('session');
  // Also clear old user data if it exists
  localStorage.removeItem('user');
};

export const isSessionValid = (): boolean => {
  return getSession() !== null;
};

export const getToken = (): string | null => {
  const session = getSession();
  return session ? session.token : null;
};

export const getUser = (): Session['user'] | null => {
  const session = getSession();
  return session ? session.user : null;
};
