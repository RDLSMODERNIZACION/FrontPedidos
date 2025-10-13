// src/components/pedidos/tabs/EstadoTab.tsx
'use client';

import React from "react";
import type { PedidoEtapas } from "@/lib/api";

type StageDef = {
  key:
    | "enviado_at"
    | "en_revision_at"
    | "aprobado_at"
    | "en_proceso_at"
    | "area_pago_at"
    | "cerrado_at";
  label: string;
};

function fmtDate(d?: string | null) {
  if (!d) return null;
  try {
    const dt = new Date(String(d));
    return isNaN(dt.getTime())
      ? String(d)
      : dt.toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
  } catch {
    return String(d);
  }
}

export default function EstadoTab({
  etapas,
  stages,
}: {
  etapas: PedidoEtapas | null;
  stages: ReadonlyArray<StageDef>;
}) {
  const doneIdx = (() => {
    if (!etapas) return -1;
    let idx = -1;
    stages.forEach((s, i) => {
      const v = (etapas as any)?.[s.key] as string | null | undefined;
      if (v) idx = i;
    });
    return idx;
  })();

  const currentIdx = Math.min(stages.length - 1, Math.max(0, doneIdx + 1));
  const hasAny = !!etapas && stages.some((s) => !!(etapas as any)?.[s.key]);

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-[#2b3550] bg-[#0c1424]/40 p-6">
        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <h4 className="text-base font-semibold leading-6">Estado del trámite</h4>
          <span className="text-xs text-[#9aa3b2] leading-6">
            {hasAny ? (
              <>
                Última etapa completada:&nbsp;
                <b className="text-white">
                  {stages[Math.max(0, doneIdx)]?.label ?? "—"}
                </b>
              </>
            ) : (
              "Sin fechas registradas"
            )}
          </span>
        </div>

        <div className="relative">
          {/* línea vertical */}
          <span
            className="pointer-events-none absolute left-4 top-3 bottom-3 w-px bg-[#2a344f]/80"
            aria-hidden
          />
          {/* más padding general y espacio entre items */}
          <ul className="pl-8 space-y-6 pr-1 max-h-[72vh] overflow-y-auto">
            {stages.map((s, i) => {
              const raw = etapas ? ((etapas as any)?.[s.key] as string | null) : null;
              const date = fmtDate(raw);

              const isDone = !!raw && i <= doneIdx;
              const isCurrent = !isDone && i === currentIdx;

              const dotBase = "absolute left-4 top-2 h-3.5 w-3.5 rounded-full";
              const dotCls = isDone
                ? "bg-emerald-500"
                : isCurrent
                ? "bg-sky-400 ring-4 ring-sky-400/20"
                : "bg-[#1c2436]";

              const labelCls =
                isDone || isCurrent ? "text-white" : "text-[#b6bfcc]";

              return (
                <li key={s.key} className="relative min-h-[2.75rem] pl-10">
                  {/* Punto alineado sobre la línea */}
                  <span className={`${dotBase} ${dotCls}`} aria-hidden />
                  {/* Contenido desplazado a la derecha */}
                  <div className="grid gap-1 leading-relaxed break-words">
                    <div className={`text-sm font-medium ${labelCls}`}>{s.label}</div>
                    {date && (
                      <div className="text-xs text-[#9aa3b2]">{date}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
