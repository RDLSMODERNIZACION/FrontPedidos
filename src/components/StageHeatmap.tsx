"use client";

import React from "react";

type Cell = { stage: string; value: number };

export default function StageHeatmap({ data }: { data?: Cell[] }) {
  const stages = ["Creación", "Revisión", "Firma(s)", "OC", "Cierre"];
  const d = data ?? stages.map((s, i) => ({ stage: s, value: (i + 1) * 12 }));
  const max = d.reduce((m, c) => Math.max(m, c.value), 1);
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Heatmap de etapas (tiempo acumulado)</h4>
      <div className="grid grid-cols-5 gap-2">
        {d.map((c) => {
          const intensity = Math.max(0.15, c.value / max); // 0..1
          return (
            <div key={c.stage} className="rounded-lg p-3 text-center" style={{ background: `rgba(16,185,129,${intensity})` }}>
              <div className="text-xs font-medium">{c.stage}</div>
              <div className="text-xs text-[#0b1320]">{c.value} h</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
