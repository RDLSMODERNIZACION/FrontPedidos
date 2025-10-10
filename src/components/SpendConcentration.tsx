"use client";

import React from "react";

type Row = { supplier: string; amount: number };

export default function SpendConcentration({ rows }: { rows?: Row[] }) {
  const data = rows ?? [
    { supplier: "ACME S.A.", amount: 18_000_000 },
    { supplier: "Patagonia Obras", amount: 12_500_000 },
    { supplier: "HidroSur", amount: 9_100_000 },
    { supplier: "AquaPlus", amount: 7_300_000 },
    { supplier: "TecnoRincón", amount: 6_800_000 },
  ];
  const max = data[0].amount || 1;
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Concentración de gasto (Top proveedores)</h4>
      <ul className="space-y-2">
        {data.map((r) => (
          <li key={r.supplier} className="text-sm flex items-center gap-3">
            <div className="w-40 shrink-0">{r.supplier}</div>
            <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400" style={{ width: `${Math.min(100, (r.amount / max) * 100)}%` }} />
            </div>
            <div className="w-20 text-right">${Math.round(r.amount/1e6)}M</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
