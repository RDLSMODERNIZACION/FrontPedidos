'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { signin } = useAuth();
  const router = useRouter();

  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setL] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      setL(true);
      await signin(username, password); // 👈 firma correcta
      router.push('/pedidos');
    } catch (e: any) {
      setErr(e?.message ?? 'Error de login');
    } finally {
      setL(false);
    }
  }

  return (
    <main className="min-h-[85vh] grid place-items-center">
      <section className="w-full max-w-md">
        {/* Encabezado */}
        <div className="mb-4 text-center">
          <div className="text-xs tracking-widest text-[#9aa3b2] uppercase">
            Municipalidad de Rincón de los Sauces
          </div>
          <h1 className="text-2xl font-semibold mt-1">Contrataciones · Ingreso</h1>
        </div>

        {/* Card */}
        <div className="card p-6 md:p-7">
          <form className="grid gap-4" onSubmit={onSubmit}>
            {/* Usuario */}
            <label className="grid gap-1 text-sm">
              <span className="text-[#9aa3b2]">Usuario</span>
              <div className="flex items-center gap-2 bg-panel2 border border-[#27314a] rounded-xl px-3">
                <User size={16} className="text-[#9aa3b2]" />
                <input
                  className="w-full bg-transparent py-2 outline-none"
                  value={username}
                  onChange={(e) => setU(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </label>

            {/* Contraseña */}
            <label className="grid gap-1 text-sm">
              <span className="text-[#9aa3b2]">Contraseña</span>
              <div className="flex items-center gap-2 bg-panel2 border border-[#27314a] rounded-xl px-3">
                <Lock size={16} className="text-[#9aa3b2]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full bg-transparent py-2 outline-none"
                  value={password}
                  onChange={(e) => setP(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="p-1 text-[#9aa3b2] hover:text-white transition"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {/* Extras */}
            <div className="flex items-center justify-between text-xs text-[#9aa3b2]">
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="accent-emerald-500" />
                Recordarme
              </label>
              <a className="hover:underline cursor-pointer">¿Olvidaste tu contraseña?</a>
            </div>

            {/* Error */}
            {err && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-3 py-2">
                {err}
              </div>
            )}

            {/* Botón */}
            <button className="btn mt-2 w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading ? 'Ingresando…' : <>Ingresar <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        {/* Pie minimal */}
        <div className="mt-3 text-center text-xs text-[#9aa3b2]">
          Secretaría de Tecnología e Innovación · Dirac Energía
        </div>
      </section>
    </main>
  );
}
