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
    if (!username || !password) { setErr('Completá usuario y contraseña'); return; }
    try {
      setL(true);
      await signin({ username, password });
      router.push('/pedidos');
    } catch (e: any) {
      setErr(e?.message ?? 'Error de login');
    } finally {
      setL(false);
    }
  }

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <form onSubmit={onSubmit} className="card w-full max-w-md grid gap-3">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>

        <label className="grid gap-1">
          <span>Usuario</span>
          <input
            className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            value={username}
            onChange={e=>setU(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="grid gap-1">
          <span>Contraseña</span>
          <input
            type="password"
            className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            value={password}
            onChange={e=>setP(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button className="btn mt-2" type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
