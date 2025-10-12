// src/app/pedidos/nuevo/StepFinalizar.tsx
'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FinalTinyIcon } from "./UI";
import { API_BASE, authHeaders } from "@/lib/api";

export default function StepFinalizar({
  createdResult,
  sendError,
}: {
  createdResult: any;
  sendError: string | null;
}) {
  const router = useRouter();
  const pedidoId: number | undefined =
    createdResult?.pedido_id ?? createdResult?.id;

  // Estado de auto-adjuntar el presupuesto seleccionado en StepResumenEnviar
  const [autoMsg, setAutoMsg] = useState<string | null>(null);
  const [autoErr, setAutoErr] = useState<string | null>(null);
  const triedRef = useRef(false);

  // Sube automáticamente el PDF pendiente (si lo hay) cuando ya tenemos pedido_id
  useEffect(() => {
    if (!pedidoId || triedRef.current) return;

    const f: File | null | undefined =
      typeof window !== "undefined" ? (window as any).__pending_budget_file : null;

    if (!f) return; // nada pendiente para subir
    triedRef.current = true;

    (async () => {
      try {
        setAutoErr(null);
        setAutoMsg("Adjuntando presupuesto…");

        const fd = new FormData();
        fd.append("tipo_doc", "presupuesto_1"); // clave esperada por el backend
        fd.append("archivo", f, f.name);

        const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/archivos`, {
          method: "POST",
          headers: { ...authHeaders() }, // Authorization si hay token en storage
          body: fd, // NO setear Content-Type
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Error ${res.status}${t ? " — " + t : ""}`);
        }

        // limpiar buffer temporal
        (window as any).__pending_budget_file = null;
        setAutoMsg("Presupuesto adjuntado correctamente.");
      } catch (e: any) {
        setAutoMsg(null);
        setAutoErr(e?.message ?? "No se pudo adjuntar el presupuesto.");
      }
    })();
  }, [pedidoId]);

  return (
    <div className="grid gap-4">
      <section className="card grid place-items-center gap-3 text-center py-10">
        <FinalTinyIcon />
        <h3 className="text-lg font-semibold">
          {sendError ? "Se completó la operación, pero con advertencias" : "¡Se realizó correctamente!"}
        </h3>
        <p className="text-sm text-[#9aa3b2] max-w-prose">
          {sendError
            ? "El temporizador finalizó, pero el backend reportó un error. Podés volver a intentarlo o revisar el detalle."
            : "Tu pedido fue procesado. Podés ver el listado y seguimiento en la sección Pedidos."}
        </p>

        {pedidoId && (
          <div className="text-xs text-[#cfd6e6]">
            ID del pedido: <span className="font-mono">{pedidoId}</span>
          </div>
        )}

        {/* Estado del adjunto automático (si había un PDF pendiente) */}
        {(autoMsg || autoErr) && (
          <div
            className={`rounded-xl px-3 py-2 text-sm mt-2 ${
              autoErr
                ? "border border-amber-600 bg-amber-900/30 text-amber-200"
                : "border border-emerald-700 bg-emerald-900/20 text-emerald-200"
            }`}
          >
            {autoErr ?? autoMsg}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button className="btn" onClick={() => router.push("/pedidos")}>
            Ir a pedidos
          </button>
          <button className="btn-ghost" onClick={() => router.refresh()}>
            Actualizar
          </button>
        </div>

        {!!sendError && (
          <details className="mt-3 text-left w-full max-w-xl">
            <summary className="cursor-pointer text-xs text-[#9aa3b2]">Detalle del error</summary>
            <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto mt-2">
{sendError}
            </pre>
          </details>
        )}
      </section>
    </div>
  );
}
