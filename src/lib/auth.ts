/**
 * auth.ts — Autenticación del panel Speeddan Control.
 * Login simple contra credenciales en variables de entorno (panel interno privado).
 * Sesión almacenada en sessionStorage, expira en 8 horas.
 */

export interface SCSession {
  username: string;
  loggedAt: number;
  expiresAt: number;
}

const SESSION_KEY = 'sc_session';

export function login(username: string, password: string): boolean {
  const validUser = import.meta.env.VITE_ADMIN_USER;
  const validPass = import.meta.env.VITE_ADMIN_PASS;
  if (username === validUser && password === validPass) {
    const session: SCSession = {
      username,
      loggedAt:  Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
}

export function getSession(): SCSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: SCSession = JSON.parse(raw);
    if (Date.now() > s.expiresAt) { logout(); return null; }
    return s;
  } catch { return null; }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
