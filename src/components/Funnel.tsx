"use client";

import React from "react";

type Stage = { label: string; count: number; amount: number };

export default function Funnel({ items }: { items?: Stage[] }) {
  const data = items ?? [
    { label: "Creados", count: 120, amount: 120_000_000 },
    { label: "Revisión", count: 85, amount: 95_000_000 },
    { label: "Firmas", count: 48, amount: 60_000_000 },
    { label: "OC", count: 30, amount: 40_000_000 },
    { label: "Cerrados", count: 20, amount: 28_000_000 },
  ];
  const max = data[0].count;
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Embudo de contratación</h4>
      <ul className="space-y-2">
        {data.map((s) => (
          <li key={s.label} className="text-sm">
            <div className="flex justify-between text-xs">
              <span>{s.label}</span>
              <span>{s.count} · ${Math.round(s.amount/1e6)}M</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/70" style={{ width: `${Math.max(10, (s.count / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
