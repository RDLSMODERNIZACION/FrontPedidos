"use client";

import React from "react";

export default function SavingsCard({ estimated, awarded, prevPeriod }: { estimated?: number; awarded?: number; prevPeriod?: number }) {
  const est = estimated ?? 85_000_000;
  const awd = awarded ?? 74_500_000;
  const save = Math.max(0, est - awd);
  const prev = prevPeriod ?? 8_200_000;
  const delta = save - prev;
  const sign = delta >= 0 ? "+" : "−";
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Ahorro logrado (estimado vs. adjudicado)</h4>
      <div className="text-2xl font-semibold">${(save/1e6).toFixed(1)}M</div>
      <div className="text-xs text-[#9aa3b2]">vs. período anterior: {sign}${(Math.abs(delta)/1e6).toFixed(1)}M</div>
    </section>
  );
}
