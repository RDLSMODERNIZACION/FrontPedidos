// src/components/ApprovalActions.tsx
"use client";

type Props = {
  canAct: boolean;
  loading?: boolean;
  onApprove: () => Promise<void> | void;
  onReview: () => Promise<void> | void;
};

export default function ApprovalActions({ canAct, loading, onApprove, onReview }: Props) {
  if (!canAct) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="btn"
        disabled={!!loading}
        onClick={() => void onApprove()}
        aria-label="Aprobar el pedido"
      >
        {loading ? "Aprobando…" : "Aprobar"}
      </button>
      <button
        className="btn-ghost"
        disabled={!!loading}
        onClick={() => void onReview()}
        aria-label="Marcar en revisión"
      >
        {loading ? "Enviando…" : "En revisión"}
      </button>
    </div>
  );
}
