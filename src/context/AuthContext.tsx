import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { api, setStoredToken } from '../lib/api';
import { getLandingUrl } from '../lib/runtimeConfig';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'turnow_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const session = await api.login(email, password);
      const authUser: User = {
        id: session.userId,
        email: session.email,
        name: session.fullName,
        role: session.role,
        tenantId: session.tenantId || undefined,
      };
      setUser(authUser);
      setStoredToken(session.accessToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setStoredToken(null);

    getLandingUrl()
      .then(url => {
        window.location.href = url;
      })
      .catch(() => {
        window.location.href = 'https://www.shiftya.online';
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
