// src/components/RequireAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadAuth } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [lsAuth, setLsAuth] = useState(loadAuth());

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const refresh = () => setLsAuth(loadAuth());
    window.addEventListener("storage", refresh);
    window.addEventListener("auth:changed", refresh as EventListener);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("auth:changed", refresh as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const hasSession = Boolean(auth?.token || lsAuth?.token);
    if (!hasSession) router.replace("/login");
  }, [mounted, auth?.token, lsAuth?.token, router]);

  const hasSession = Boolean(auth?.token || lsAuth?.token);
  if (!mounted || !hasSession) return null; // sin parpadeo

  return <>{children}</>;
}
