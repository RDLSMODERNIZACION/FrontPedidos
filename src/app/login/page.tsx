// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://backpedidos-gby7.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { ready, isAuthenticated } = useAuthStatus();

  const [id, setId] = useState("");          // ← usuario o email (texto libre)
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Si ya hay sesión, redirigimos
  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/");
      router.refresh();
    }
  }, [ready, isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    if (!id.trim() || !password.trim()) {
      setErr("Completá usuario/email y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        // Mandamos ambos para compatibilidad: el backend toma el que corresponda
        email: id.trim(),
        username: id.trim(),
        password: password,
      };

      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` — ${txt}` : ""}`);
      }

      const data = await res.json().catch(() => ({}));
      const token: string =
        data?.token ?? data?.access_token ?? data?.jwt ?? data?.idToken ?? "";

      if (!token) throw new Error("El backend no devolvió un token.");

      await login({ token, user: data?.user ?? null, expiresAt: null });
      router.replace("/");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Ingresar</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-[#9aa3b2]">Usuario o email</span>
          <input
            name="id"
            type="text"                     // ← ya no es type="email"
            autoComplete="username"
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-violet-500"
            placeholder="usuario o secretaria"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-[#9aa3b2]">Contraseña</span>
          <div className="relative">
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 pr-20 outline-none focus:border-violet-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#9aa3b2] hover:text-white"
              onClick={() => setShowPwd((s) => !s)}
              tabIndex={-1}
            >
              {showPwd ? "Ocultar" : "Ver"}
            </button>
          </div>
        </label>

        {err && (
          <div className="rounded-lg border border-amber-600 bg-amber-900/30 px-3 py-2 text-sm text-amber-200">
            {err}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Ingresando…" : "Ingresar"}
        </button>

       
      </form>
    </div>
  );
}
