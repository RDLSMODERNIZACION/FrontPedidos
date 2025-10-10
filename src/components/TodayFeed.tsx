"use client";

import React from "react";

type FeedItem = { id: string; when: string; who: string; what: string; exp?: string };

export default function TodayFeed({ items }: { items?: FeedItem[] }) {
  const data = items ?? [
    { id: "a", when: "09:12", who: "Mesa de Entradas", what: "Derivó a firmas", exp: "EXP-2025-0008" },
    { id: "b", when: "10:03", who: "Secretaría Economía", what: "Aprobó presupuesto", exp: "EXP-2025-0005" },
    { id: "c", when: "12:41", who: "Compras", what: "Generó OC-1542", exp: "EXP-2025-0003" },
  ];

  return (
    <section aria-label="Lo que cambió hoy" className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-2">Lo que cambió hoy</h4>
      <ul className="divide-y divide-white/10">
        {data.map((it) => (
          <li key={it.id} className="py-2 text-sm flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-white/90">{it.what}{it.exp ? ` · ${it.exp}` : ""}</div>
              <div className="text-[#9aa3b2] text-xs">{it.who}</div>
            </div>
            <span className="text-xs text-[#9aa3b2] ml-4">{it.when}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
