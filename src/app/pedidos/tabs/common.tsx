'use client';

import React from "react";
import { cap } from "@/lib/utils";

/* ==================== Helpers ==================== */
function isEmptyValue(v: any): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") {
    const s = v.trim();
    if (s.length === 0) return true;
    if (s === "—" || s === "-") return true;
    return false;
  }
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

export function fmtDT(d?: string | null) {
  if (!d) return "—";
  try {
    const x = new Date(d);
    return isNaN(x.getTime()) ? String(d) : x.toLocaleString();
  } catch {
    return String(d);
  }
}

export function prettifyKey(k: string) {
  return cap(k.replace(/_/g, " "));
}

export function cellText(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") { try { return JSON.stringify(v); } catch { return String(v); } }
  return String(v);
}

export function pickPayload(x: any): any {
  if (!x) return null;
  if (x && typeof x === "object" && "payload" in x) return (x as any).payload;
  return x;
}

export function toRowsFlat(x: any): any[] {
  const core = pickPayload(x);
  if (!core) return [];
  if (Array.isArray(core)) return core;
  if (Array.isArray(core?.items)) return core.items;
  if (Array.isArray(core?.rows)) return core.rows;
  if (typeof core === "object") return [core];
  return [{ value: core }];
}

/* ==================== Pequeños componentes ==================== */
export function Row({label, value}:{label:string; value: React.ReactNode}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 text-sm">
      <div className="text-[#9aa3b2]">{label}</div>
      <div className="text-white break-words">{value ?? "—"}</div>
    </div>
  );
}

export function ReviewBadge({ st }: { st?: string }) {
  const tone = st === "aprobado" ? "text-emerald-400" : st === "observado" ? "text-red-400" : "text-amber-300";
  return <span className={`text-xs ${tone}`}>{st ?? "pendiente"}</span>;
}

export function KeyVal({label, value}:{label:string; value:string}) {
  return (
    <div className="rounded-xl bg-white/5 border border-[#2b3550] px-3 py-2">
      <div className="text-[10px] uppercase text-[#9aa3b2]">{label}</div>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}

/** Tarjetas clave/valor ocultando null/""/"—"/"-" y objetos/arrays vacíos */
export function PayloadKV({
  title,
  payload,
  hiddenKeys = [],
}: {
  title: string;
  payload: any;
  hiddenKeys?: string[];
}) {
  const rows = toRowsFlat(payload);

  const cards = rows.map((r, idx) => {
    const keys = Object.keys(r ?? {});
    const visibleKeys = keys.filter(k => !hiddenKeys.includes(k) && !isEmptyValue(r[k]));
    if (visibleKeys.length === 0) return null;

    return (
      <div key={r?.id ?? idx} className="rounded-2xl border border-[#2b3550] p-3">
        <div className="grid gap-2">
          {visibleKeys.map((k) => (
            <Row key={k} label={prettifyKey(k)} value={cellText(r[k])} />
          ))}
        </div>
      </div>
    );
  }).filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <section className="grid gap-2">
      <div className="text-xs uppercase text-[#9aa3b2]">{title}</div>
      <div className="grid gap-3">{cards}</div>
    </section>
  );
}
