"use client";

// src/components/QuickActions.tsx
import Link from "next/link";

export type Action = {
  title: string;
  description: string;
  href: string;
  cta?: string;
};

export default function QuickActions({ actions }: { actions: Action[] }) {
  const items = Array.isArray(actions) ? actions : [];
  return (
    <section aria-label="Acciones rápidas" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-6">
      <header className="mb-4">
        <h3 className="text-base md:text-lg font-semibold">¿Qué querés hacer?</h3>
      </header>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            onClick={() => {
              try {
                // Hook de métricas (si existe window.analytics)
                // @ts-ignore
                window?.analytics?.track?.("atajo_click", { destino: a.href });
              } catch {}
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm md:text-base font-semibold">{a.title}</h4>
              <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-white/80 group-hover:text-white">
                {a.cta ?? "Abrir"}
              </span>
            </div>
            <p className="mt-1 text-xs md:text-sm text-[#9aa3b2]">{a.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
