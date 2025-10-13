// src/components/RequireAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadAuth } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const authCtx = useAuth() as any;
  // Unificación segura: admite {auth:{token}} o {token}
  const ctxToken: string | undefined = (authCtx?.auth?.token ?? authCtx?.token ?? undefined) as
    | string
    | undefined;

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [lsAuth, setLsAuth] = useState(loadAuth());

  // Marcamos montado en cliente
  useEffect(() => { setMounted(true); }, []);

  // Sincroniza con cambios de storage / evento custom
  useEffect(() => {
    const refresh = () => setLsAuth(loadAuth());
    window.addEventListener("storage", refresh);
    window.addEventListener("auth:changed", refresh as EventListener);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("auth:changed", refresh as EventListener);
    };
  }, []);

  // Redirección si no hay sesión
  useEffect(() => {
    if (!mounted) return;
    const hasSession = Boolean(ctxToken || lsAuth?.token);
    if (!hasSession) router.replace("/login");
  }, [mounted, ctxToken, lsAuth?.token, router]);

  const hasSession = Boolean(ctxToken || lsAuth?.token);
  if (!mounted || !hasSession) return null; // evita parpadeo

  return <>{children}</>;
}
