"use client";

import React from "react";

export default function BudgetVsCredit({ total, used }: { total?: number; used?: number }) {
  const t = total ?? 120_000_000;
  const u = used ?? 74_500_000;
  const pct = Math.min(100, Math.round((u / t) * 100));
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Ejecución vs. crédito disponible</h4>
      <div className="text-2xl font-semibold">${(u/1e6).toFixed(1)}M <span className="text-sm text-[#9aa3b2]">/ ${(t/1e6).toFixed(1)}M</span></div>
      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-[#9aa3b2]">{pct}% ejecutado</div>
    </section>
  );
}
