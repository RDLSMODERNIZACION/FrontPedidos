// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, loadAuth, saveAuth, type AuthState } from "@/lib/auth";

type Ctx = {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (data: { token: string; user?: any | null; expiresAt?: number | null }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://backpedidos-gby7.onrender.com";

async function fetchProfile(token: string): Promise<any | null> {
  try {
    const r = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = await r.json().catch(() => null);
    // Soportá distintos formatos (user plano, dentro de {user}, o claims):
    const user = data?.user ?? data ?? null;
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // Hidratar desde localStorage y cargar perfil si hay token
  useEffect(() => {
    const loaded = loadAuth();
    if (loaded?.token) {
      setToken(loaded.token);
      setUser(loaded.user ?? null);
      // si no hay user en storage, intentá traerlo del backend
      if (!loaded.user) {
        void (async () => {
          const u = await fetchProfile(loaded.token!);
          if (u) {
            setUser(u);
            saveAuth({ token: loaded.token!, user: u, expiresAt: null });
          }
        })();
      }
    }
  }, []);

  const isAuthenticated = !!token;

  const login: Ctx["login"] = async ({ token, user = null, expiresAt = null }) => {
    // guardá token primero
    saveAuth({ token, user, expiresAt });
    setToken(token);
    setUser(user);

    // intentá completar perfil si no vino en el login
    if (!user) {
      const u = await fetchProfile(token);
      if (u) {
        setUser(u);
        saveAuth({ token, user: u, expiresAt });
      }
    }

    window.dispatchEvent(new CustomEvent("auth:changed", { detail: { isAuthenticated: true } }));
  };

  const refreshProfile = async () => {
    if (!token) return;
    const u = await fetchProfile(token);
    if (u) {
      setUser(u);
      saveAuth({ token, user: u, expiresAt: null });
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: { isAuthenticated: true } }));
    }
  };

  const logout: Ctx["logout"] = async () => {
    clearAuth();
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: { isAuthenticated: false } }));
  };

  const value = useMemo<Ctx>(
    () => ({ isAuthenticated, token, user, login, logout, refreshProfile }),
    [isAuthenticated, token, user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
