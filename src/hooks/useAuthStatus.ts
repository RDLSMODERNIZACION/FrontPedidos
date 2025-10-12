// src/hooks/useAuthStatus.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadAuth, clearAuth } from "@/lib/auth";

/** Emite un evento local opcional para refrescar encabezados tras login/logout */
export function emitAuthChange(isAuthenticated?: boolean) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: { isAuthenticated } }));
  }
}

export function useAuthStatus() {
  const { auth, signout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [lsToken, setLsToken] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const readStorage = () => {
    const a = loadAuth();
    setLsToken(a?.token ?? null);
  };

  useEffect(() => {
    setMounted(true);
    readStorage();
  }, []);

  useEffect(() => {
    const refresh = () => { readStorage(); setTick(t => t + 1); };
    const onStorage = () => refresh();
    const onAuthChanged = () => refresh();
    const onFocus = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", onAuthChanged as EventListener);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", onAuthChanged as EventListener);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const isAuthenticated = useMemo(() => {
    if (!mounted) return false;
    // si el contexto ya tiene auth => true; si no, usamos lo persistido
    return Boolean(auth?.token || lsToken);
  }, [mounted, auth?.token, lsToken, tick]);

  const logout = async () => {
    try {
      await signout();
    } finally {
      try { clearAuth(); } catch {}
      setLsToken(null);
      emitAuthChange(false);
      setTick(t => t + 1);
    }
  };

  return { ready: mounted, isAuthenticated, logout };
}
