"use client";

import React from "react";

export default function SLAProgress({ items }: { items?: { stage: string; elapsed: number; sla: number }[] }) {
  const data = items ?? [
    { stage: "Revisión", elapsed: 28, sla: 24 },
    { stage: "Firma(s)", elapsed: 16, sla: 36 },
    { stage: "OC", elapsed: 12, sla: 24 },
  ];
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Tiempo a la fecha vs. SLA</h4>
      <ul className="space-y-3">
        {data.map((r) => {
          const pct = Math.min(100, (r.elapsed / r.sla) * 100);
          return (
            <li key={r.stage}>
              <div className="flex justify-between text-xs mb-1">
                <span>{r.stage}</span>
                <span>{r.elapsed}h / SLA {r.sla}h</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${pct >= 100 ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
