// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { saveAuth, loadAuth, clearAuth } from '@/lib/auth';

type AuthUser = {
  username: string;
  secretaria?: string | null;
  secretaria_id?: number | null;
};

type AuthState = {
  token: string;
  user: AuthUser;
};

type Ctx = {
  auth: AuthState | null;
  signin: (p: { username: string; password: string }) => Promise<void>;
  signout: () => void;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => { setAuth(loadAuth()); }, []);

  async function signin({ username, password }: { username: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json; charset=utf-8' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const t = await res.text().catch(()=>'');
      throw new Error(`Login HTTP ${res.status} ${t}`);
    }
    const data = await res.json() as AuthState;
    // data.user.secretaria y secretaria_id vienen del backend
    saveAuth(data);
    setAuth(data);
  }

  function signout() {
    clearAuth();
    setAuth(null);
  }

  return <AuthCtx.Provider value={{ auth, signin, signout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
