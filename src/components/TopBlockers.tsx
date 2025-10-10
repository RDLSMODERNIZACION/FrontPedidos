"use client";

import React from "react";

export default function TopBlockers({ items }: { items?: { label: string; hours: number }[] }) {
  const data = items ?? [
    { label: "Secretaría de Economía", hours: 31 },
    { label: "Mesa de Entradas", hours: 24 },
    { label: "Compras", hours: 21 },
    { label: "Asesoría Legal", hours: 17 },
    { label: "Proveedores", hours: 10 },
  ];
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Top 5 bloqueadores (horas acumuladas)</h4>
      <ul className="space-y-2">
        {data.map((r) => (
          <li key={r.label} className="text-sm flex items-center gap-3">
            <div className="w-40 shrink-0">{r.label}</div>
            <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400" style={{ width: `${Math.min(100, (r.hours / data[0].hours) * 100)}%` }} />
            </div>
            <div className="w-10 text-right">{r.hours}h</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
