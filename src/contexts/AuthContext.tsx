// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  saveAuth,
  loadAuth,
  clearAuth,
  type AuthState as StoreAuthState,
} from '@/lib/auth';

/**
 * La respuesta de login del backend puede traer secretaria en null o ausente.
 * La normalizamos a string "" para cumplir con StoreAuthState (lib/auth).
 */
type LoginResponse = {
  token: string;
  user: {
    username: string;
    secretaria?: string | null;
    secretaria_id?: number | null;
  };
};

type Ctx = {
  auth: StoreAuthState | null;
  signin: (username: string, password: string) => Promise<void>;
  signout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoreAuthState | null>(null);

  // Cargar sesión almacenada
  useEffect(() => {
    const s = loadAuth();
    if (s) setAuth(s);
  }, []);

  async function signin(username: string, password: string) {
    // TODO: reemplazar por tu endpoint real de login
    // Debe devolver al menos: { token, user: { username, secretaria?, secretaria_id? } }
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      let msg = 'Credenciales inválidas';
      try { msg = (await res.json()).detail ?? msg; } catch {}
      throw new Error(msg);
    }

    const data = (await res.json()) as LoginResponse;

    // 🔧 Normalizamos a la forma estricta del store (lib/auth)
    const normalized: StoreAuthState = {
      token: data.token,
      user: {
        username: data.user.username,
        secretaria: data.user.secretaria ?? '',              // <- string requerido
        secretaria_id: data.user.secretaria_id ?? undefined, // opcional
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
