// src/components/ApprovalActions.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reviewArchivo, type ReviewDecision } from "@/lib/api";

type DocTipo = "formal_pdf" | "expediente_1" | "expediente_2";

type Props = {
  /** puede actuar este usuario sobre este pedido (rol + permisos) */
  canAct: boolean;

  /** estado actual del pedido (para bloquear terminales por pedido) */
  estadoActual?: string; // 'borrador'|'enviado'|'en_revision'|'aprobado'|'en_proceso'|'area_pago'|'cerrado'|'rechazado'

  /** estado de revisión del archivo (para bloquear terminales por archivo) */
  reviewStatus?: "pendiente" | "aprobado" | "observado";

  /** spinner general externo */
  loading?: boolean;

  /** callbacks (usados SOLO si no se provee docType/IDs) */
  onApprove?: () => Promise<void> | void;
  onReview?: () => Promise<void> | void;
  onReject?: (motivo?: string | null) => Promise<void> | void;

  /** ---- MODO ARCHIVO (persistencia automática) ---- */
  pedidoId?: number;
  archivoId?: number;
  docType?: DocTipo; // si viene, el componente llama reviewArchivo() y persiste en DB

  /** post-acción (re-fetch etapas/archivos) */
  onAfter?: () => void;
};

export default function ApprovalActions({
  canAct,
  estadoActual,
  reviewStatus,
  loading,
  onApprove,
  onReview,
  onReject,
  pedidoId,
  archivoId,
  docType,
  onAfter,
}: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  // Estados terminales:
  const terminalPedido =
    estadoActual === "cerrado" || estadoActual === "rechazado";
  const terminalArchivo =
    reviewStatus === "aprobado" || reviewStatus === "observado";
  const terminal = terminalPedido || terminalArchivo;

  const disabled = !!loading || busy || terminal || !canAct;

  // Helpers de UI
  const isArchivoMode = !!(pedidoId && archivoId && docType);
  const labelApprove = isArchivoMode ? "Aprobar" : "Aprobar";
  const labelMiddle = isArchivoMode ? "Observar" : "En revisión";
  const titleApprove = terminal
    ? "Estado final, no se puede modificar"
    : isArchivoMode
    ? `Aprobar ${docType.replace("_", " ")}`
    : "Aprobar";
  const titleMiddle = terminal
    ? "Estado final, no se puede modificar"
    : isArchivoMode
    ? `Marcar ${docType.replace("_", " ")} como observado`
    : "Marcar en revisión";

  const reviewerName =
    (user as any)?.nombre ?? (user as any)?.username ?? (user as any)?.email ?? "ui";

  const doReviewArchivo = async (review_status: "aprobado" | "observado") => {
    if (!pedidoId || !archivoId || !docType) return;
    const payload: ReviewDecision = {
      review_status,
      tipo_doc: docType,
      reviewer: reviewerName,
    };
    await reviewArchivo(pedidoId, archivoId, payload, (user as any)?.token);
  };

  const handleApprove = async () => {
    if (terminal) return;
    const ok = window.confirm(
      isArchivoMode
        ? `¿Confirmás APROBAR ${docType?.replace("_", " ").toUpperCase()}?\nEsta acción es definitiva.`
        : "¿Confirmás APROBAR el pedido?\nEsta acción es definitiva."
    );
    if (!ok) return;

    setBusy(true);
    try {
      if (isArchivoMode) {
        await doReviewArchivo("aprobado"); // ⬅️ persiste en DB (expediente_1 => área de pago)
      } else {
        if (!onApprove) return;
        await onApprove();
      }
      onAfter?.();
    } catch (e) {
      console.error(e);
      alert(`No se pudo aprobar: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleMiddle = async () => {
    if (terminal) return;

    setBusy(true);
    try {
      if (isArchivoMode) {
        // En modo archivo, el botón del medio es "Observar"
        const ok = window.confirm(
          `¿Confirmás marcar ${docType?.replace(
            "_",
            " "
          )} como OBSERVADO?\nEl solicitante verá la observación.`
        );
        if (!ok) return;
        await doReviewArchivo("observado");
      } else {
        // Modo pedido conserva tu "En revisión"
        if (!onReview) return;
        await onReview();
      }
      onAfter?.();
    } catch (e) {
      console.error(e);
      alert(
        isArchivoMode
          ? `No se pudo observar: ${(e as Error).message}`
          : `No se pudo marcar en revisión: ${(e as Error).message}`
      );
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (terminal || !onReject) return;
    const ok = window.confirm(
      "¿Confirmás RECHAZAR el pedido?\nEsta acción es definitiva."
    );
    if (!ok) return;
    let motivo: string | null = null;
    const ask = window.prompt("Motivo (opcional):");
    if (ask !== null) motivo = ask;

    setBusy(true);
    try {
      await onReject(motivo);
      onAfter?.();
    } catch (e) {
      console.error(e);
      alert(`No se pudo rechazar: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  // Si no puede actuar y no es terminal, oculto por completo
  if (!canAct && !terminal) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`btn ${terminal ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={disabled}
        onClick={() => void handleApprove()}
        aria-label="Aprobar"
        title={titleApprove}
      >
        {busy || loading ? "Procesando…" : labelApprove}
      </button>

      <button
        className="btn-ghost"
        disabled={!!loading || busy || terminal || !canAct}
        onClick={() => void handleMiddle()}
        aria-label={labelMiddle}
        title={titleMiddle}
      >
        {busy || loading ? "Procesando…" : labelMiddle}
      </button>

      {/* En modo archivo, esconder "Rechazar" (usamos Observar);
          En modo pedido, mostrarlo si existe onReject */}
      {!isArchivoMode && onReject && (
        <button
          className={`btn-ghost text-red-400 border border-red-500/40 hover:bg-red-500/10 ${
            terminal ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!!loading || busy || terminal || !canAct}
          onClick={() => void handleReject()}
          aria-label="Rechazar"
          title={terminal ? "Estado final, no se puede modificar" : "Rechazar"}
        >
          {busy || loading ? "Procesando…" : "Rechazar"}
        </button>
      )}
    </div>
  );
}
