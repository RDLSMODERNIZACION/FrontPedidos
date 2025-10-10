// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signin } = useAuth();
  const router = useRouter();

  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [loading, setL] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      setL(true);
      // ✅ firma corregida: (username, password)
      await signin(username, password);
      router.push('/pedidos');
    } catch (e: any) {
      setErr(e?.message ?? 'Error de login');
    } finally {
      setL(false);
    }
  }

  return (
    <main className="container my-10 max-w-md">
      <section className="card">
        <h1 className="text-xl font-semibold mb-4">Ingresar</h1>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="text-[#9aa3b2]">Usuario</span>
            <input
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              value={username}
              onChange={(e) => setU(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-[#9aa3b2]">Contraseña</span>
            <input
              type="password"
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              value={password}
              onChange={(e) => setP(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {err && <div className="text-red-400 text-sm">{err}</div>}

          <button className="btn mt-2" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}
