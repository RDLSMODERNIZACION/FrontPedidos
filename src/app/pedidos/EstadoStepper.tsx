// src/components/pedidos/EstadoStepper.tsx
'use client';

import React from "react";

export type Etapas = {
  creado_at?: string | null;
  enviado_at?: string | null;
  en_revision_at?: string | null;
  aprobado_at?: string | null;
  en_proceso_at?: string | null;
  area_pago_at?: string | null;
  cerrado_at?: string | null;
  formal_pdf_at?: string | null;
  expediente_1_at?: string | null;
  expediente_2_at?: string | null;
};

export type StageDef = { key: keyof Etapas; label: string };

function fmtDT(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

function StageDot({ state }: { state: "done" | "current" | "todo" }) {
  const cls =
    state === "done"
      ? "bg-emerald-500"
      : state === "current"
      ? "bg-sky-400 ring-2 ring-sky-400/30"
      : "bg-[#1c2436]";
  return (
    <span className={`absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full ${cls}`} />
  );
}

export default function EstadoStepper({
  stages,
  etapas,
}: {
  stages: StageDef[];
  etapas: Etapas | null;
}) {
  const doneIdx = (() => {
    if (!etapas) return -1;
    let idx = -1;
    stages.forEach((s, i) => { if ((etapas as any)?.[s.key]) idx = i; });
    return idx;
  })();

  const currentLabel = doneIdx >= 0 ? stages[doneIdx].label : null;
  const currentDate  = doneIdx >= 0 ? (etapas as any)?.[stages[doneIdx].key] as string | null : null;

  return (
    <div className="rounded-2xl border border-[#2b3550] p-4">
      <div className="mb-3 flex items-baseline gap-2">
        <h4 className="text-base font-semibold">Estado del trámite</h4>
        <span className="text-xs text-[#9aa3b2]">
          {doneIdx >= 0
            ? <>Etapa actual: <b className="text-white">{currentLabel}</b> · {fmtDT(currentDate)}</>
            : "Aún no enviado"}
        </span>
      </div>

      <div className="max-h-[65vh] overflow-y-auto pr-1">
        <ul className="relative border-l border-[#27314a] pl-9">
          {stages.map((s, i) => {
            const date = etapas ? (etapas as any)?.[s.key] as string | null : null;
            const isCurrent = i === doneIdx && !!date;
            const isDone = i < doneIdx;
            const state: "done" | "current" | "todo" = isCurrent ? "current" : isDone ? "done" : "todo";

            return (
              <li key={s.key} className="relative pb-5 last:pb-0">
                <StageDot state={date ? (isCurrent ? "current" : "done") : state} />
                <div className="ml-2 grid gap-0.5">
                  <div className={`text-sm font-medium ${state === "todo" && !date ? "text-[#9aa3b2]" : "text-white"}`}>
                    {s.label}
                  </div>
                  <div className="text-[11px] text-[#9aa3b2]">{fmtDT(date)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
