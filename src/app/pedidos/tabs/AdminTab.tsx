// src/components/pedidos/tabs/AdminTab.tsx
'use client';

import React from "react";
import { type BackendPedido } from "@/lib/api";
import { canModerate } from "@/lib/roles";
import Badge from "@/components/Badge";

export default function AdminTab({
  pedido,
  user,
  loading,
  // presupuesto
  onApproveBudget,
  onObserveBudget,
  canApproveBudget,
  // formal_pdf
  onApproveFormal,
  onObserveFormal,
  canApproveFormal,
  // expediente_1
  onApproveExp1,
  onObserveExp1,
  canApproveExp1,
  // expediente_2
  onApproveExp2,
  onObserveExp2,
  canApproveExp2,
}: {
  pedido: BackendPedido;
  user?: any;
  loading: boolean;
  // presupuesto
  onApproveBudget: () => void | Promise<void>;
  onObserveBudget: () => void | Promise<void>;
  canApproveBudget: boolean;
  // formal_pdf
  onApproveFormal: () => void | Promise<void>;
  onObserveFormal: () => void | Promise<void>;
  canApproveFormal: boolean;
  // expediente_1
  onApproveExp1: () => void | Promise<void>;
  onObserveExp1: () => void | Promise<void>;
  canApproveExp1: boolean;
  // expediente_2
  onApproveExp2: () => void | Promise<void>;
  onObserveExp2: () => void | Promise<void>;
  canApproveExp2: boolean;
}) {
  // ===== Null-safety para estado =====
  const est: string = pedido?.estado ?? "en_revision";

  const fmtEstado = (estado?: string | null) =>
    estado && estado.trim() ? estado.replace(/_/g, " ") : "—";

  const toneByEstado = (estado?: string | null): "ok" | "bad" | "warn" => {
    switch (estado) {
      case "aprobado":
      case "cerrado":
        return "ok";
      case "rechazado":
        return "bad";
      default:
        return "warn";
    }
  };

  // Permisos/condiciones
  const canAct =
    !!pedido &&
    canModerate(user, pedido) &&
    !["rechazado", "cerrado"].includes(est);

  const isEnviado  = est === "enviado";
  const isRevision = est === "en_revision";
  const isAprobado = est === "aprobado";
  const isProceso  = est === "en_proceso";
  const isAreaPago = est === "area_pago";

  return (
    <section className="card grid gap-4">
      {/* Estado actual */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Acciones de Admin</h4>
        <Badge tone={toneByEstado(est)}>
          {fmtEstado(est)}
        </Badge>
      </div>

      {/* Guías */}
      {(isEnviado || isRevision) && (
        <div className="rounded-xl border border-[#2b3550] p-3 text-sm text-[#cfd6e6]">
          Al <b>aprobar presupuesto</b>, el pedido pasa a <b>aprobado</b>. Luego subí y aprobá el
          <b> formal_pdf</b> para avanzar a <b>en proceso</b>.
        </div>
      )}
      {isAprobado && (
        <div className="rounded-xl border border-[#2b3550] p-3 text-sm text-[#cfd6e6]">
          Subí y <b>aprobá</b> el <b>formal_pdf</b> para avanzar a <b>en proceso</b>.
        </div>
      )}
      {isProceso && (
        <div className="rounded-xl border border-[#2b3550] p-3 text-sm text-[#cfd6e6]">
          Subí y <b>aprobá</b> el <b>expediente_1</b> para avanzar a <b>Área de pago</b>.
        </div>
      )}
      {isAreaPago && (
        <div className="rounded-xl border border-[#2b3550] p-3 text-sm text-[#cfd6e6]">
          Subí y <b>aprobá</b> el <b>expediente_2</b> para <b>cerrar</b> el trámite.
        </div>
      )}

      {/* Presupuesto */}
      <div className="rounded-xl border border-[#2b3550] p-4 grid gap-3">
        <div className="text-sm font-medium">Presupuesto</div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn"
            onClick={onApproveBudget}
            disabled={!canAct || loading || !canApproveBudget || !(isEnviado || isRevision)}
            title="Aprobar presupuesto (enviado → aprobado)"
          >
            {loading ? "Procesando…" : "Aprobar presupuesto"}
          </button>
          <button
            className="btn-ghost"
            onClick={onObserveBudget}
            disabled={!canAct || loading || !canApproveBudget}
            title="Observar presupuesto"
          >
            {loading ? "Procesando…" : "Observar presupuesto"}
          </button>
        </div>
        {!canApproveBudget && (
          <div className="text-xs text-[#9aa3b2]">No hay presupuesto para aprobar/observar.</div>
        )}
      </div>

      {/* formal_pdf */}
      <div className="rounded-xl border border-[#2b3550] p-4 grid gap-3">
        <div className="text-sm font-medium">Formal PDF</div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn"
            onClick={onApproveFormal}
            disabled={!canAct || loading || !canApproveFormal}
            title="Aprobar formal_pdf (aprobado → en_proceso)"
          >
            {loading ? "Procesando…" : "Aprobar formal_pdf"}
          </button>
          <button
            className="btn-ghost"
            onClick={onObserveFormal}
            disabled={!canAct || loading || !canApproveFormal}
            title="Observar formal_pdf"
          >
            {loading ? "Procesando…" : "Observar formal_pdf"}
          </button>
        </div>
        {!canApproveFormal && (
          <div className="text-xs text-[#9aa3b2]">No hay formal_pdf para aprobar/observar.</div>
        )}
      </div>

      {/* expediente_1 */}
      <div className="rounded-xl border border-[#2b3550] p-4 grid gap-3">
        <div className="text-sm font-medium">Expediente 1</div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn"
            onClick={onApproveExp1}
            disabled={!canAct || loading || !canApproveExp1 || !isProceso}
            title="Aprobar expediente_1 (en_proceso → Área de pago)"
          >
            {loading ? "Procesando…" : "Aprobar expediente_1"}
          </button>
          <button
            className="btn-ghost"
            onClick={onObserveExp1}
            disabled={!canAct || loading || !canApproveExp1}
            title="Observar expediente_1"
          >
            {loading ? "Procesando…" : "Observar expediente_1"}
          </button>
        </div>
        {!canApproveExp1 && (
          <div className="text-xs text-[#9aa3b2]">No hay expediente_1 para aprobar/observar.</div>
        )}
      </div>

      {/* expediente_2 */}
      <div className="rounded-2xl border border-[#2b3550] p-4 grid gap-3">
        <div className="text-sm font-medium">Expediente 2</div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn"
            onClick={onApproveExp2}
            disabled={!canAct || loading || !canApproveExp2 || !isAreaPago}
            title="Aprobar expediente_2 (Área de pago → Cerrado)"
          >
            {loading ? "Procesando…" : "Aprobar expediente_2"}
          </button>
          <button
            className="btn-ghost"
            onClick={onObserveExp2}
            disabled={!canAct || loading || !canApproveExp2}
            title="Observar expediente_2"
          >
            {loading ? "Procesando…" : "Observar expediente_2"}
          </button>
        </div>
        {!canApproveExp2 && (
          <div className="text-xs text-[#9aa3b2]">No hay expediente_2 para aprobar/observar.</div>
        )}
      </div>
    </section>
  );
}
