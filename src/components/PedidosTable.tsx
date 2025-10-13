// src/components/PedidosTable.tsx
'use client';

import React from "react";
import { type BackendPedido } from "@/lib/api";
import { cap } from "@/lib/utils";

type Props = {
  rows: BackendPedido[];
  onOpen: (row: BackendPedido) => void;
};

function money(v: unknown): string {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string" && !Number.isNaN(Number(v))
      ? Number(v)
      : null;
  if (n === null) return "—";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$ ${n}`;
  }
}

function fmtDT(d?: string | null): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

function estadoPill(estado?: string | null) {
  const e = (estado ?? "").toString();
  const tone =
    e === "aprobado" || e === "cerrado"
      ? "bg-emerald-500"
      : e === "rechazado"
      ? "bg-red-500"
      : "bg-amber-500";
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
      <span className="text-sm">{cap(e.replace("_", " ")) || "—"}</span>
    </span>
  );
}

export default function PedidosTable({ rows, onOpen }: Props) {
  return (
    <div className="rounded-2xl border border-[#2b3550] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-[#9aa3b2] bg-white/5">
          <tr>
            <th className="text-left px-4 py-3">ID Trámite</th>
            {/* 👇 Quitamos Módulo */}
            <th className="text-left px-4 py-3">Secretaría</th>
            {/* 👇 Quitamos Solicitante */}
            <th className="text-left px-4 py-3">Estado</th>
            <th className="text-right px-4 py-3">Total</th>
            <th className="text-left px-4 py-3">Creado</th>
            <th className="text-right px-4 py-3"> </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1b2132]">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-5 text-[#9aa3b2]" colSpan={6}>
                No hay pedidos para mostrar.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const idt = r.id_tramite ?? `#${r.id}`;
              const total = (r as any).total ?? (r as any).presupuesto_estimado ?? null;
              const creado = (r as any).created_at ?? (r as any).creado ?? (r as any).fecha_pedido ?? null;
              return (
                <tr key={r.id} className="hover:bg-white/2">
                  <td className="px-4 py-3 font-medium">{idt}</td>
                  {/* sin módulo */}
                  <td className="px-4 py-3">{r.secretaria ?? "—"}</td>
                  {/* sin solicitante */}
                  <td className="px-4 py-3">{estadoPill(r.estado)}</td>
                  <td className="px-4 py-3 text-right">{money(total)}</td>
                  <td className="px-4 py-3">{fmtDT(creado)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn" onClick={() => onOpen(r)}>Ver</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
