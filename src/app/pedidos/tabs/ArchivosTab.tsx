// src/components/pedidos/tabs/ArchivosTab.tsx
'use client';

import React, { useMemo, useRef, useState } from "react";
import type { PedidoArchivo } from "@/lib/api";
import { fileUrl, uploadArchivo } from "@/lib/archivos";
import { ReviewBadge } from "./common";

export default function ArchivosTab({
  pedidoId,
  estado,
  files,
  loading,
  onRefresh,
  token,
}: {
  pedidoId: number;
  estado: string;
  files: PedidoArchivo[];
  loading: boolean;
  onRefresh: () => void;
  token?: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingKind, setPendingKind] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const hasFormal = useMemo(() => files.some(f => f.kind === "formal_pdf"), [files]);
  const hasExp1   = useMemo(() => files.some(f => f.kind === "expediente_1"), [files]);
  const hasExp2   = useMemo(() => files.some(f => f.kind === "expediente_2"), [files]);

  function pickFile(kind: string) {
    if (uploading) return;
    setPendingKind(kind);
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    const kind = pendingKind;
    e.target.value = "";
    if (!file || !kind) return;

    try {
      setUploading(true);
      await uploadArchivo(pedidoId, kind as any, file, token || undefined);
      onRefresh();
    } catch (err: any) {
      const msg = String(err?.message || "");
      const isMixed =
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        String(process.env.NEXT_PUBLIC_API_BASE || "").startsWith("http://");
      alert(
        isMixed
          ? "No se pudo subir (Mixed Content). Configurá NEXT_PUBLIC_API_BASE con HTTPS."
          : (msg || "Error subiendo archivo")
      );
      console.error("uploadArchivo error:", err);
    } finally {
      setPendingKind(null);
      setUploading(false);
    }
  }

  const anyBusy = loading || uploading;

  return (
    <section className="card grid gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Archivos</h4>
        <button className="btn-ghost" onClick={onRefresh} disabled={anyBusy}>
          {anyBusy ? "Procesando…" : "Refrescar"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {estado === "aprobado" && !hasFormal && (
        <div className="rounded-2xl border border-[#2b3550] p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <b>PDF formal (firmado)</b>
            <div className="text-[#9aa3b2] text-xs">
              Subí el PDF formal para continuar el trámite hacia <b>en proceso</b>.
            </div>
          </div>
          <button className="btn" onClick={() => pickFile("formal_pdf")} disabled={anyBusy}>
            {uploading && pendingKind === "formal_pdf" ? "Subiendo…" : "Subir formal_pdf"}
          </button>
        </div>
      )}

      {estado === "en_proceso" && !hasExp1 && (
        <div className="rounded-2xl border border-[#2b3550] p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <b>Expediente 1</b>
            <div className="text-[#9aa3b2] text-xs">
              Subí el <b>expediente_1</b> para avanzar a <b>Área de pago</b> cuando se apruebe.
            </div>
          </div>
          <button className="btn" onClick={() => pickFile("expediente_1")} disabled={anyBusy}>
            {uploading && pendingKind === "expediente_1" ? "Subiendo…" : "Subir expediente_1"}
          </button>
        </div>
      )}

      {estado === "area_pago" && !hasExp2 && (
        <div className="rounded-2xl border border-[#2b3550] p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <b>Expediente 2</b>
            <div className="text-[#9aa3b2] text-xs">
              Subí el <b>expediente_2</b> para finalizar el trámite (pasará a <b>cerrado</b> al aprobarse).
            </div>
          </div>
          <button className="btn" onClick={() => pickFile("expediente_2")} disabled={anyBusy}>
            {uploading && pendingKind === "expediente_2" ? "Subiendo…" : "Subir expediente_2"}
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-[#2b3550] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[#9aa3b2] bg-white/5">
            <tr>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Fecha</th>
              <th className="text-left px-3 py-2">Revisión</th>
              <th className="text-left px-3 py-2">Observación</th>
              <th className="text-right px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2132]">
            {files.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-[#9aa3b2]" colSpan={5}>
                  Sin archivos.
                </td>
              </tr>
            ) : (
              files.map((a) => {
                const fecha = a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : "—";
                const puedeResubir = a.review_status === "observado";
                return (
                  <tr key={a.id}>
                    <td className="px-3 py-2">
                      <a className="link" href={fileUrl(a.url, a.id)} target="_blank" rel="noreferrer">
                        {a.filename}
                      </a>
                    </td>
                    <td className="px-3 py-2">{fecha}</td>
                    <td className="px-3 py-2">
                      {a.review_status ? (
                        <ReviewBadge st={a.review_status} />
                      ) : (
                        <span className="text-[#9aa3b2]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {a.review_notes ? (
                        <span className="text-[#cfd6e6]">{a.review_notes}</span>
                      ) : (
                        <span className="text-[#9aa3b2]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {puedeResubir ? (
                        <button
                          className="btn-ghost"
                          onClick={() => pickFile(a.kind)}
                          disabled={anyBusy}
                          title="Re-subir nueva versión"
                        >
                          {uploading && pendingKind === a.kind ? "Subiendo…" : "Re-subir"}
                        </button>
                      ) : (
                        <span className="text-[#9aa3b2]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
