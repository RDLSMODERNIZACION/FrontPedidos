'use client';

import React from "react";
import { PayloadKV, Row } from "./common";
import type { PedidoInfo } from "@/lib/api";

function notEmpty(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}
function fmtDate(d?: string | null) {
  if (!notEmpty(d)) return null;
  try {
    const dt = new Date(String(d));
    return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString();
  } catch { return String(d); }
}
function fmtMoney(v: number | string | null | undefined) {
  if (!notEmpty(v) && v !== 0) return null;
  const n = typeof v === "string" ? Number(v) : v;
  if (!isFinite(Number(n))) return String(v ?? "");
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(n));
  } catch { return `$ ${n}`; }
}

export default function InfoTab({
  detalle,
  loading,
  error,
}: {
  detalle: PedidoInfo | null;
  loading: boolean;
  error: string | null;
}) {
  const genRows: Array<{ label: string; value: string | null }> = [
    { label: "Número", value: detalle?.numero ?? null },
    { label: "Fecha pedido", value: fmtDate(detalle?.fecha_pedido) },
    { label: "Fecha desde", value: fmtDate(detalle?.fecha_desde) },
    { label: "Fecha hasta", value: fmtDate(detalle?.fecha_hasta) },
    { label: "Presupuesto estimado", value: fmtMoney(detalle?.presupuesto_estimado) },
    { label: "Observaciones", value: (detalle?.observaciones ?? "")?.trim() || null },
  ].filter(r => notEmpty(r.value));

  const HIDDEN_AMBITO_KEYS = ["created_at","updated_at","createdAt","updatedAt","created","updated"];

  return (
    <div className="card grid gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Detalle</h4>
        <div className="text-xs text-[#9aa3b2]">
          {loading ? "Cargando…" : ""}{error ? <span className="text-red-400"> · {error}</span> : null}
        </div>
      </div>

      <div className="grid gap-4 max-h-[72vh] overflow-y-auto pr-1 overscroll-contain">
        {genRows.length > 0 && (
          <section className="grid gap-3 rounded-2xl border border-[#2b3550] p-4">
            <div className="text-xs uppercase text-[#9aa3b2]">Generales</div>
            <div className="grid gap-2">
              {genRows.map((r, i) => <Row key={i} label={r.label} value={r.value!} />)}
            </div>
          </section>
        )}

        {detalle?.ambito_payload && (
          <PayloadKV title="ÁMBITO" payload={detalle.ambito_payload} hiddenKeys={HIDDEN_AMBITO_KEYS} />
        )}

        {detalle?.modulo_payload && (
          <PayloadKV title="MÓDULO" payload={detalle.modulo_payload} />
        )}
      </div>
    </div>
  );
}
