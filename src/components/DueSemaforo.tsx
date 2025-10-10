"use client";

import React from "react";

export type DueSemaforoProps = {
  due3?: number;
  due7?: number;
  due14?: number;
};

export default function DueSemaforo({ due3 = 3, due7 = 7, due14 = 12 }: DueSemaforoProps) {
  const Pill = ({ label, value, tone }: { label: string; value: number; tone: "red" | "yellow" | "green" }) => {
    const color = tone === "red" ? "bg-red-500/20 border-red-400/50" : tone === "yellow" ? "bg-yellow-500/20 border-yellow-400/50" : "bg-emerald-500/20 border-emerald-400/50";
    const dot = tone === "red" ? "bg-red-400" : tone === "yellow" ? "bg-yellow-400" : "bg-emerald-400";
    return (
      <div className={`rounded-xl border ${color} p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
    );
  };

  return (
    <section aria-label="Semáforo de vencimientos" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Pill label="Vence en 3 días" value={due3} tone="red" />
      <Pill label="Vence en 7 días" value={due7} tone="yellow" />
      <Pill label="Vence en 14 días" value={due14} tone="green" />
    </section>
  );
}
