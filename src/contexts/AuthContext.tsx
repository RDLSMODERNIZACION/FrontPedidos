'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  saveAuth,
  loadAuth,
  clearAuth,
  type AuthState as StoreAuthState,
} from '@/lib/auth';

type Ctx = {
  auth: StoreAuthState | null;
  signin: (username: string, password: string) => Promise<void>;
  signout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

// Helpers de entorno
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const LOGIN_PATH = process.env.NEXT_PUBLIC_LOGIN_PATH || "/auth/login";
const DEFAULT_SECRETARIA =
  process.env.NEXT_PUBLIC_DEFAULT_SECRETARIA || "SECRETARÍA DE ECONOMÍA";
const FAKE_LOGIN =
  process.env.NEXT_PUBLIC_FAKE_LOGIN === "true" || !API_BASE; // fallback si no hay backend

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoreAuthState | null>(null);

  // Cargar sesión previa
  useEffect(() => {
    const s = loadAuth();
    if (s) setAuth(s);
  }, []);

  async function signin(username: string, password: string) {
    // ---------- Fallback local (como te funcionaba antes) ----------
    if (FAKE_LOGIN) {
      const normalized: StoreAuthState = {
        token: `local-${Date.now()}`,
        user: {
          username,
          secretaria: DEFAULT_SECRETARIA,   // <- configurable por env
          // secretaria_id opcional si luego la necesitás
        },
      };
      saveAuth(normalized);
      setAuth(normalized);
      return;
    }

    // ---------- Login contra backend real ----------
    const url = `${API_BASE}${LOGIN_PATH}`; // ej: https://backend/onrender.com/auth/login
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      // Si tu backend requiere credenciales/cookies, agrega: credentials: 'include'
    });

    if (!res.ok) {
      let msg = 'Credenciales inválidas';
      try { msg = (await res.json()).detail ?? msg; } catch {}
      throw new Error(msg);
    }

    // Adapta este shape a lo que devuelva tu backend
    const data = await res.json() as {
      token: string;
      user: { username: string; secretaria?: string | null; secretaria_id?: number | null };
    };

    const normalized: StoreAuthState = {
      token: data.token,
      user: {
        username: data.user.username,
        secretaria: data.user.secretaria ?? DEFAULT_SECRETARIA,
        secretaria_id: data.user.secretaria_id ?? undefined,
      },
    };

    saveAuth(normalized);
    setAuth(normalized);
  }

  function signout() {
    clearAuth();
    setAuth(null);
  }

  return (
    <AuthCtx.Provider value={{ auth, signin, signout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
