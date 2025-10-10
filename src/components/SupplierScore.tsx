"use client";

import React from "react";

type Row = { supplier: string; onTime: number; docsOk: number; issues: number; score: number };

export default function SupplierScore({ rows }: { rows?: Row[] }) {
  const data = rows ?? [
    { supplier: "ACME S.A.", onTime: 97, docsOk: 100, issues: 0, score: 98 },
    { supplier: "Patagonia Obras", onTime: 88, docsOk: 92, issues: 2, score: 90 },
    { supplier: "HidroSur", onTime: 81, docsOk: 85, issues: 3, score: 84 },
  ];
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Score de proveedores</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-[#9aa3b2]">
            <tr>
              <th className="text-left font-medium py-2">Proveedor</th>
              <th className="text-right font-medium py-2">Entregas a tiempo</th>
              <th className="text-right font-medium py-2">Docs vigentes</th>
              <th className="text-right font-medium py-2">Incidencias</th>
              <th className="text-right font-medium py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.map((r) => (
              <tr key={r.supplier}>
                <td className="py-2">{r.supplier}</td>
                <td className="py-2 text-right">{r.onTime}%</td>
                <td className="py-2 text-right">{r.docsOk}%</td>
                <td className="py-2 text-right">{r.issues}</td>
                <td className="py-2 text-right font-semibold">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
