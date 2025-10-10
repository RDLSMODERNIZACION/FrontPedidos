"use client";

import React from "react";

type Item = { id: string; title: string; exp?: string; due?: string };

export type PendingInboxProps = {
  readyToSign?: Item[];
  observations?: Item[];
  ocToIssue?: Item[];
};

const Section = ({ title, items }: { title: string; items: Item[] }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
    <h4 className="font-semibold text-sm mb-2">{title}</h4>
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between text-sm">
          <span className="truncate">{it.title}{it.exp ? ` · ${it.exp}` : ""}</span>
          {it.due ? <span className="text-xs text-[#9aa3b2]">{it.due}</span> : null}
        </li>
      ))}
      {items.length === 0 && <li className="text-sm text-[#9aa3b2]">Sin pendientes</li>}
    </ul>
  </div>
);

export default function PendingInbox(props: PendingInboxProps) {
  const ready = props.readyToSign ?? [
    { id: "1", title: "Resolución de servicios", exp: "EXP-2025-0007", due: "hoy" },
    { id: "2", title: "Compra insumos escuela 12", exp: "EXP-2025-0005", due: "mañana" },
  ];
  const obs = props.observations ?? [
    { id: "3", title: "Reparación bomba Planta Este", exp: "EXP-2025-0002", due: "en 3 días" },
  ];
  const oc = props.ocToIssue ?? [
    { id: "4", title: "OC para camiones cisterna", exp: "EXP-2025-0001", due: "en 7 días" },
  ];

  return (
    <section aria-label="Bandeja de pendientes" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Section title="Listo para firmar" items={ready} />
      <Section title="Observaciones por responder" items={obs} />
      <Section title="OC para emitir" items={oc} />
    </section>
  );
}
