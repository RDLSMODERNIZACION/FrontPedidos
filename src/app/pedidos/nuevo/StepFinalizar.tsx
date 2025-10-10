// src/app/pedidos/nuevo/StepFinalizar.tsx
'use client';
import React from "react";
import { useRouter } from "next/navigation";
import { FinalTinyIcon } from "./UI";

export default function StepFinalizar({ createdResult, sendError }: {
  createdResult: any;
  sendError: string | null;
}) {
  const router = useRouter();
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

        {createdResult?.pedido_id && (
          <div className="text-xs text-[#cfd6e6]">
            ID del pedido: <span className="font-mono">{createdResult.pedido_id}</span>
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
