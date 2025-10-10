// src/app/pedidos/nuevo/UI.tsx
'use client';
import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Step } from "./constants";

export function Stepper({ step }: { step: Step }) {
  const items = [
    { n: 1 as const, label: "General" },
    { n: 2 as const, label: "Ambientes" },
    { n: 3 as const, label: "Módulos" },
    { n: 4 as const, label: "Enviar" },
    { n: 5 as const, label: "Finalizar" },
  ];

  return (
    <div className="flex items-center gap-3 mb-3">
      {items.map((it, i) => {
        const active = it.n === step;
        const done = it.n < step;
        return (
          <div key={it.n} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full grid place-items-center border ${
                active ? "bg-brand text-white border-brand"
                : done ? "bg-green-600 text-white border-green-600"
                : "bg-panel text-[#cfd6e6] border-[#2b3550]"}`}
              title={it.label}
            >
              {done ? <CheckCircle2 size={18} /> : it.n}
            </div>
            <div className={`text-sm ${active ? "text-white font-semibold" : "text-[#cfd6e6]"}`}>
              {it.label}
            </div>
            {i < items.length - 1 && <div className="w-10 h-px bg-[#2b3550]" />}
          </div>
        );
      })}
    </div>
  );
}

export function Card({
  title, hint, active, onClick,
}: { title: string; hint: string; active: boolean; onClick: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition ${
        active ? "border-brand bg-[#171d2c]" : "border-[#2b3550] hover:border-brand/60 bg-panel"}`}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm text-[#9aa3b2]">{hint}</div>
    </button>
  );
}

export function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 text-sm">
      <div className="text-[#9aa3b2]">{label}</div>
      <div className="text-white">{value ?? "—"}</div>
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "ok" | "warn" | "neutral"; children: React.ReactNode }) {
  const tones = {
    ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    warn: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    neutral: "border-[#2e3751] bg-[#1f2636] text-[#dfe5f7]",
  } as const;
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-semibold">{title}</h4>
        {right}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div className="w-full">
      {!!label && <div className="text-xs text-[#9aa3b2] mb-1">{label}</div>}
      <div className="w-full h-3 bg-[#131a27] border border-[#2b3550] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-[width] duration-150 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export function FinalTinyIcon() {
  const [imgOk, setImgOk] = useState(true);
  return imgOk ? (
    <img
      src="/ok-mini.png"
      alt="ok"
      width={64}
      height={64}
      className="rounded-lg"
      onError={() => setImgOk(false)}
    />
  ) : (
    <svg width="64" height="64" viewBox="0 0 24 24" className="text-emerald-400">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
