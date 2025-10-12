// src/hooks/useUserSecretaria.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://backpedidos-gby7.onrender.com";

function tryDecodeJWT(token?: string | null): any | null {
  try {
    if (!token) return null;
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json ?? null;
  } catch {
    return null;
  }
}

export function useUserSecretaria() {
  const { token, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secretaria, setSecretaria] = useState<string | null>(null);

  // 1) Contexto directo
  useEffect(() => {
    if (user?.secretaria) setSecretaria(user.secretaria);
  }, [user?.secretaria]);

  // 2) JWT (claims) como fallback ultra-rápido
  useEffect(() => {
    if (secretaria) return;
    const claims = tryDecodeJWT(token);
    const claimSec =
      claims?.secretaria ??
      claims?.department ??
      claims?.departamento ??
      null;
    if (typeof claimSec === "string" && claimSec.trim()) setSecretaria(claimSec);
  }, [token, secretaria]);

  // 3) /auth/me si aún no la tenemos
  useEffect(() => {
    if (secretaria || !token) return;
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = r.ok ? await r.json().catch(() => ({})) : {};
        const u = data?.user ?? data ?? {};
        const sec =
          u?.secretaria ??
          u?.department ??
          u?.departamento ??
          null;
        if (!abort && typeof sec === "string" && sec.trim()) {
          setSecretaria(sec);
          // opcional: actualizá el contexto
          await refreshProfile().catch(() => {});
        }
      } catch {/* noop */}
      finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [token, secretaria, refreshProfile]);

  return { secretaria, loading };
}
