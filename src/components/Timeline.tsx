"use client";

// src/components/Timeline.tsx
import React from "react";

/**
 * TimelineStage representa una etapa del proceso.
 * - title: etiqueta visible (ej: "Creación")
 * - subtitle: texto pequeño (ej: "Exp: EXP-2025-0001 · Área: Compras")
 * - whoNow: tooltip: quién lo tiene ahora
 * - whatNext: tooltip: qué falta
 * - date: etiqueta de fecha corta
 */
export type TimelineStage = {
  key: string;
  title: string;
  subtitle?: string;
  whoNow?: string | null;
  whatNext?: string | null;
  date?: string | null;
};

export type TimelineProps = {
  stages: TimelineStage[];
  /** Intervalo entre etapas en autoplay */
  cycleMs?: number;
  /** NUEVO: título visible (compat con page.tsx) */
  title?: string;
  /** Alias opcional por compatibilidad */
  heading?: string;
  /** NUEVO: alias de autoplay (compat con page.tsx) */
  playing?: boolean;
  /** Autoplay tradicional (si no se pasa, usa `playing` o true) */
  autoplay?: boolean;
  /** Clase extra para el contenedor */
  className?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(q.matches);
    on();
    q.addEventListener?.("change", on);
    return () => q.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/**
 * Timeline accesible y responsive.
 * - Horizontal en md+, vertical en móvil.
 * - Autoplay con pausa en hover.
 * - Respeta prefers-reduced-motion.
 */
export default function Timeline({
  stages,
  autoplay,
  playing,
  cycleMs = 5000,
  title,
  heading,
  className,
}: TimelineProps) {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const safeStages = Array.isArray(stages) && stages.length ? stages : [];

  // Compat: `playing` tiene prioridad; luego `autoplay`; por defecto true
  const auto = playing ?? autoplay ?? true;
  const header = title ?? heading ?? "Así avanza un expediente típico";

  React.useEffect(() => {
    if (!auto || reduced || paused || safeStages.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % safeStages.length), cycleMs);
    return () => clearInterval(t);
  }, [auto, reduced, paused, cycleMs, safeStages.length]);

  if (safeStages.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#cfd6e6]">
        No hay datos para el timeline todavía.
      </div>
    );
  }

  return (
    <section
      aria-label={header}
      className={
        "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4 md:p-6 " +
        (className ?? "")
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base md:text-lg font-semibold">{header}</h3>
        <div className="text-xs text-[#9aa3b2]">
          {reduced ? "Animaciones reducidas" : paused ? "Pausado" : auto ? "Reproduciendo" : "Detenido"}
        </div>
      </header>

      {/* Track */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-6">
        {/* Etapas */}
        <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-6">
          {safeStages.map((s, i) => {
            const active = i === idx;
            return (
              <li key={s.key} className="group">
                <div className="flex md:flex-col items-start md:items-center gap-3">
                  {/* Punto */}
                  <div className="relative">
                    <span
                      className={
                        "block h-3 w-3 rounded-full " + (active ? "bg-emerald-400" : "bg-white/30")
                      }
                      title={
                        (s.whoNow ? "Quién lo tiene ahora: " + s.whoNow : "") +
                        (s.whatNext ? " · Qué falta: " + s.whatNext : "")
                      }
                      aria-label={
                        `${s.title}${s.date ? " · " + s.date : ""}` +
                        `${s.whoNow ? " · Quién lo tiene ahora: " + s.whoNow : ""}` +
                        `${s.whatNext ? " · Qué falta: " + s.whatNext : ""}`
                      }
                    />
                    {/* Pulse */}
                    {active && !reduced && (
                      <span className="pointer-events-none absolute inset-0 -m-1 rounded-full border border-emerald-400/50 animate-ping" />
                    )}
                  </div>

                  {/* Texto */}
                  <div className="min-w-0">
                    <div className={"text-sm font-medium " + (active ? "text-white" : "text-white/80")}>
                      {s.title} {s.date ? <span className="text-[#9aa3b2] font-normal">· {s.date}</span> : null}
                    </div>
                    {s.subtitle ? (
                      <div className="text-xs text-[#9aa3b2] mt-0.5">{s.subtitle}</div>
                    ) : null}
                  </div>
                </div>

                {/* Conectores */}
                {i < safeStages.length - 1 && (
                  <div
                    className="md:mx-6 my-3 md:my-4 h-px md:h-12 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-white/10 via-white/25 to-white/10"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Hint */}
      <div className="mt-4 text-xs text-[#9aa3b2]">
        Consejito: pasá el mouse para pausar; en accesibilidad podés desactivar animaciones.
      </div>
    </section>
  );
}
