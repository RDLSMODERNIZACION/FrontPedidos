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

/** Heurística simple para detectar módulo "adquisición" */
function isAdquisicion(mp: any): boolean {
  if (!mp || typeof mp !== "object") return false;
  if ("proposito" in mp || "modo_adquisicion" in mp) return true;
  if (Array.isArray(mp.items)) return true;
  return false;
}

/** Render de la sección Adquisición */
function AdquisicionSection({ modulo }: { modulo: any }) {
  const proposito = (modulo?.proposito ?? "")?.toString().trim() || null;
  const modo = (modulo?.modo_adquisicion ?? "")?.toString().trim() || null;

  const rawItems: any[] = Array.isArray(modulo?.items) ? modulo.items : [];
  const items = rawItems
    .map((it, idx) => ({
      idx,
      descripcion: (it?.descripcion ?? "")?.toString().trim(),
      cantidad: it?.cantidad ?? "",
      unidad: (it?.unidad ?? "")?.toString().trim(),
    }))
    .filter(it => it.descripcion || it.cantidad || it.unidad)
    .sort((a, b) => {
      const ad = (a.descripcion || "").toLowerCase();
      const bd = (b.descripcion || "").toLowerCase();
      if (ad && bd) return ad.localeCompare(bd);
      if (ad) return -1;
      if (bd) return 1;
      return a.idx - b.idx;
    });

  const hasHeader = !!(proposito || modo);

  return (
    <section className="grid gap-3 rounded-2xl border border-[#2b3550] p-4">
      <div className="text-xs uppercase text-[#9aa3b2]">MÓDULO · ADQUISICIÓN</div>

      {hasHeader && (
        <div className="grid gap-2">
          {proposito && <Row label="Propósito" value={proposito} />}
          {modo && <Row label="Modo de adquisición" value={modo} />}
        </div>
      )}

      <div className="mt-1">
        <div className="text-xs uppercase text-[#9aa3b2] mb-2">Ítems</div>

        {items.length === 0 ? (
          <div className="text-sm text-[#9aa3b2]">Sin ítems de adquisición.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#2b3550]">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1524] text-[#c6d0e1]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Descripción</th>
                  <th className="px-3 py-2 text-left font-semibold">Cantidad</th>
                  <th className="px-3 py-2 text-left font-semibold">Unidad</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-[#2b3550]">
                    <td className="px-3 py-2 align-top break-words">{it.descripcion || "—"}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap">{String(it.cantidad ?? "") || "—"}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap">{it.unidad || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
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
  const modulo = (detalle as any)?.modulo_payload;
  const esAdquisicion = isAdquisicion(modulo);

  return (
    // 👇 min-h-0 para permitir que el contenedor scrolleable calcule bien alturas
    <div className="card grid gap-4 min-h-0">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Detalle</h4>
        <div className="text-xs text-[#9aa3b2]">
          {loading ? "Cargando…" : ""}{error ? <span className="text-red-400"> · {error}</span> : null}
        </div>
      </div>

      {/* 👇 Contenedor scrolleable: min-h-0 + altura dinámica + padding inferior */}
      <div className="grid gap-4 min-h-0 overflow-y-auto pr-1 pb-4 max-h-[calc(100dvh-220px)]">
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

        {esAdquisicion ? (
          <AdquisicionSection modulo={modulo} />
        ) : (
          detalle?.modulo_payload && <PayloadKV title="MÓDULO" payload={detalle.modulo_payload} />
        )}
      </div>
    </div>
  );
}
