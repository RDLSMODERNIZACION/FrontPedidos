// src/components/ApprovalActions.tsx
"use client";

type Props = {
  /** puede actuar este usuario sobre este pedido (rol + permisos) */
  canAct: boolean;
  /** estado actual del pedido (para bloquear terminales) */
  estadoActual?: string;
  /** spinner general */
  loading?: boolean;
  /** acciones */
  onApprove: () => Promise<void> | void;
  onReview: () => Promise<void> | void;
  onReject?: (motivo?: string | null) => Promise<void> | void;
};

export default function ApprovalActions({
  canAct,
  estadoActual,
  loading,
  onApprove,
  onReview,
  onReject,
}: Props) {
  const terminal =
    estadoActual === "aprobado" || estadoActual === "rechazado";
  const disabled = !!loading || terminal || !canAct;

  if (!canAct && !terminal) return null;

  const handleApprove = async () => {
    if (terminal) return;
    const ok = window.confirm(
      "¿Confirmás APROBAR el pedido?\nEsta acción es definitiva."
    );
    if (!ok) return;
    await onApprove();
  };

  const handleReview = async () => {
    if (terminal) return;
    await onReview();
  };

  const handleReject = async () => {
    if (terminal || !onReject) return;
    const ok = window.confirm(
      "¿Confirmás RECHAZAR el pedido?\nEsta acción es definitiva."
    );
    if (!ok) return;
    let motivo: string | null = null;
    // opcional: pedimos breve motivo (podés quitarlo si no lo usás)
    const ask = window.prompt("Motivo (opcional):");
    if (ask !== null) motivo = ask;
    await onReject(motivo);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`btn ${terminal ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={disabled}
        onClick={() => void handleApprove()}
        aria-label="Aprobar"
        title={terminal ? "Estado final, no se puede modificar" : "Aprobar"}
      >
        {loading ? "Aprobando…" : "Aprobar"}
      </button>

      <button
        className="btn-ghost"
        disabled={!!loading || terminal}
        onClick={() => void handleReview()}
        aria-label="Marcar en revisión"
        title={terminal ? "Estado final, no se puede modificar" : "En revisión"}
      >
        {loading ? "Enviando…" : "En revisión"}
      </button>

      {onReject && (
        <button
          className={`btn-ghost text-red-400 border border-red-500/40 hover:bg-red-500/10 ${
            terminal ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!!loading || terminal}
          onClick={() => void handleReject()}
          aria-label="Rechazar"
          title={terminal ? "Estado final, no se puede modificar" : "Rechazar"}
        >
          {loading ? "Procesando…" : "Rechazar"}
        </button>
      )}
    </div>
  );
}
