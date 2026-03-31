"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  startTransition,
} from "react";

export type PanelSession = {
  username: string;
  expiresAt: string;
};

type LoginPayload = {
  username: string;
  password: string;
};

type AuthContextValue = {
  session: PanelSession | null;
  isAuthenticated: boolean;
  isPending: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "No se pudo completar la solicitud");
  }

  return payload;
}

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: PanelSession | null;
}) {
  const [session, setSession] = useState<PanelSession | null>(initialSession);
  const [isPending, setIsPending] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isPending,
      async login(payload) {
        setIsPending(true);
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await parseJson<{ data: { session: PanelSession } }>(response);
          startTransition(() => setSession(data.data.session));
        } finally {
          setIsPending(false);
        }
      },
      async logout() {
        setIsPending(true);
        try {
          const response = await fetch("/api/auth/logout", { method: "POST" });
          await parseJson<{ data: { success: boolean } }>(response);
          startTransition(() => setSession(null));
        } finally {
          setIsPending(false);
        }
      },
      async refresh() {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await parseJson<{ data: { session: PanelSession | null } }>(response);
        startTransition(() => setSession(data.data.session));
      },
    }),
    [isPending, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
