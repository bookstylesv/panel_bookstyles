import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authLib from '@/lib/auth';
import type { SCSession } from '@/lib/auth';

interface AuthContextValue {
  session:  SCSession | null;
  login:    (username: string, password: string) => boolean;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SCSession | null>(() => authLib.getSession());

  const login = useCallback((username: string, password: string): boolean => {
    const ok = authLib.login(username, password);
    if (ok) setSession(authLib.getSession());
    return ok;
  }, []);

  const logout = useCallback(() => {
    authLib.logout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
