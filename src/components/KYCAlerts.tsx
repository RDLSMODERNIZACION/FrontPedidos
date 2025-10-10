"use client";

import React from "react";

type Row = { supplier: string; doc: string; due: string };

export default function KYCAlerts({ rows }: { rows?: Row[] }) {
  const data = rows ?? [
    { supplier: "ACME S.A.", doc: "Seguro caución", due: "en 5 días" },
    { supplier: "Patagonia Obras", doc: "Cert. AFIP", due: "en 9 días" },
  ];
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Alertas KYC</h4>
      <ul className="space-y-2">
        {data.map((r, i) => (
          <li key={i} className="text-sm flex items-center justify-between">
            <span className="truncate">{r.supplier} · {r.doc}</span>
            <span className="text-xs text-[#9aa3b2]">{r.due}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
