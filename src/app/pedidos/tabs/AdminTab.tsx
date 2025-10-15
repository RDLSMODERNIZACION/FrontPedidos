'use client';

import React, { useMemo, useState } from "react";
import Badge from "@/components/Badge";
import { canModerate } from "@/lib/roles";
import { type BackendPedido } from "@/lib/api";
import { decidirPedido, type PedidoDecision } from "@/lib/pedidos-acciones";

type Tone = "ok" | "bad" | "warn";
const fmtEstado = (e?: string | null) => (e && e.trim() ? e.replace(/_/g, " ") : "—");
const toneByEstado = (e?: string | null): Tone =>
  e === "aprobado" || e === "cerrado" ? "ok" : e === "rechazado" ? "bad" : "warn";

export default function AdminTab({
  pedido,
  user,
  loading,
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
  onAfterDecision,
}: {
  pedido: BackendPedido;
  user?: any;
  loading: boolean;
  onApproveFormal: () => void | Promise<void>;
  onObserveFormal: () => void | Promise<void>;
  canApproveFormal: boolean;
  onApproveExp1: () => void | Promise<void>;
  onObserveExp1: () => void | Promise<void>;
  canApproveExp1: boolean;
  onApproveExp2: () => void | Promise<void>;
  onObserveExp2: () => void | Promise<void>;
  canApproveExp2: boolean;
  onAfterDecision?: (nuevoEstado: string) => void | Promise<void>;
}) {
  const est = (pedido?.estado ?? "en_revision") as string;
  const tone = toneByEstado(est);

  const canAct =
    !!pedido && canModerate(user, pedido) && !["rechazado", "cerrado"].includes(est);

  const isAprobado = est === "aprobado";
  const isProceso  = est === "en_proceso";
  const isAreaPago = est === "area_pago";

  const [busy, setBusy] = useState<PedidoDecision | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { kind: "observar" | "rechazar" }>(null);
  const [motivo, setMotivo] = useState("");

  async function runDecision(decision: PedidoDecision, notes?: string) {
    try {
      setBusy(decision);
      setErr(null);
      const r = await decidirPedido(
        pedido.id,
        { decision, notes, changed_by: user?.email ?? user?.nombre ?? "ui" }
      );
      await onAfterDecision?.(r.estado);
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo operar el pedido");
    } finally {
      setBusy(null);
      setModal(null);
      setMotivo("");
    }
  }

  const helpText = useMemo(() => {
    if (["enviado", "en_revision", "observado"].includes(est))
      return "Aprobá el pedido para continuar con el circuito documental.";
    if (isAprobado) return "Aprobado ✔. Subí y aprobá el formal_pdf para avanzar a EN PROCESO.";
    if (isProceso)  return "En proceso ⚙️. Aprobá el expediente_1 para pasar a Área de pago.";
    if (isAreaPago) return "Área de pago 💳. Aprobá el expediente_2 para cerrar el trámite.";
    if (est === "rechazado") return "Rechazado.";
    if (est === "cerrado")   return "Cerrado 🏁.";
    return null;
  }, [est, isAprobado, isProceso, isAreaPago]);

  return (
    // 👇 FLEX + min-h-0: el admin tab hereda altura del contenedor y su parte media scrollea
    <section className="card flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Administración del trámite</h4>
        <Badge tone={tone}>{fmtEstado(est)}</Badge>
      </div>

      {/* Barra sticky de decisiones del pedido */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-[#0b1222]/80 backdrop-blur border-b border-[#2b3550] rounded-t-2xl">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm"
            onClick={() => runDecision("aprobar")}
            disabled={!canAct || !!busy || loading || ["aprobado","cerrado","area_pago","en_proceso"].includes(est)}
            title="Aprobar el pedido"
          >
            {busy === "aprobar" ? "Aprobando…" : "Aprobar pedido"}
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm"
            onClick={() => { setModal({ kind: "observar" }); setMotivo(""); }}
            disabled={!canAct || !!busy || loading}
            title="Observar (requiere motivo)"
          >
            Observar
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm"
            onClick={() => { setModal({ kind: "rechazar" }); setMotivo(""); }}
            disabled={!canAct || !!busy || loading}
            title="Rechazar (requiere motivo)"
          >
            Rechazar
          </button>

          {err && <span className="text-xs text-rose-300 ml-2">{err}</span>}
        </div>
        {helpText && <div className="text-xs text-[#9aa3b2] mt-2">{helpText}</div>}
      </div>

      {/* 👇 La parte que scrollea: UNA sola capa con overflow-y-auto */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4">
        {/* Formal PDF */}
        <section className="rounded-xl border border-[#2b3550] p-4 grid gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Formal PDF</div>
            <span className="text-xs text-[#9aa3b2]">aprobado ➜ en proceso</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm"
              onClick={onApproveFormal}
              disabled={loading || !canApproveFormal}
              title="Aprobar formal_pdf (aprobado → en_proceso)"
            >
              {loading ? "Procesando…" : "Aprobar formal_pdf"}
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-transparent border border-[#354166] hover:bg-[#0f1524] disabled:opacity-50 text-white text-sm"
              onClick={onObserveFormal}
              disabled={loading || !canApproveFormal}
              title="Observar formal_pdf"
            >
              Observar formal_pdf
            </button>
          </div>
          {!canApproveFormal && (
            <div className="text-xs text-[#9aa3b2]">No hay formal_pdf para aprobar/observar.</div>
          )}
        </section>

        {/* Expediente 1 */}
        <section className="rounded-xl border border-[#2b3550] p-4 grid gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Expediente 1</div>
            <span className="text-xs text-[#9aa3b2]">en proceso ➜ Área de pago</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm"
              onClick={onApproveExp1}
              disabled={loading || !canApproveExp1 || est !== "en_proceso"}
              title="Aprobar expediente_1 (en_proceso → Área de pago)"
            >
              {loading ? "Procesando…" : "Aprobar expediente_1"}
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-transparent border border-[#354166] hover:bg-[#0f1524] disabled:opacity-50 text-white text-sm"
              onClick={onObserveExp1}
              disabled={loading || !canApproveExp1}
              title="Observar expediente_1"
            >
              Observar expediente_1
            </button>
          </div>
          {!canApproveExp1 && (
            <div className="text-xs text-[#9aa3b2]">No hay expediente_1 para aprobar/observar.</div>
          )}
        </section>

        {/* Expediente 2 */}
        <section className="rounded-xl border border-[#2b3550] p-4 grid gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Expediente 2</div>
            <span className="text-xs text-[#9aa3b2]">Área de pago ➜ Cerrado</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm"
              onClick={onApproveExp2}
              disabled={loading || !canApproveExp2 || est !== "area_pago"}
              title="Aprobar expediente_2 (Área de pago → Cerrado)"
            >
              {loading ? "Procesando…" : "Aprobar expediente_2"}
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-transparent border border-[#354166] hover:bg-[#0f1524] disabled:opacity-50 text-white text-sm"
              onClick={onObserveExp2}
              disabled={loading || !canApproveExp2}
              title="Observar expediente_2"
            >
              Observar expediente_2
            </button>
          </div>
          {!canApproveExp2 && (
            <div className="text-xs text-[#9aa3b2]">No hay expediente_2 para aprobar/observar.</div>
          )}
        </section>
      </div>

      {/* Modal Observar / Rechazar */}
      {modal && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2b3550] bg-[#0b1222] p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <h5 className="text-base font-semibold">
                {modal.kind === "observar" ? "Observar pedido" : "Rechazar pedido"}
              </h5>
              <button
                className="text-[#9aa3b2] hover:text-white"
                onClick={() => { setModal(null); setMotivo(""); }}
                aria-label="Cerrar"
              >✕</button>
            </div>

            <label className="block text-sm">
              <span className="text-[#c6d0e1]">Motivo (requerido)</span>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="mt-1 w-full h-28 rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76] resize-y"
                placeholder="Escribí el motivo…"
              />
            </label>

            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-transparent border border-[#354166] text-white text-sm hover:bg-[#0f1524]"
                onClick={() => { setModal(null); setMotivo(""); }}
              >
                Cancelar
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-white text-sm ${
                  modal.kind === "observar"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
                disabled={!motivo.trim() || !!busy}
                onClick={() => runDecision(modal.kind, motivo.trim())}
              >
                {busy === modal.kind ? "Procesando…" : modal.kind === "observar" ? "Confirmar observación" : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
