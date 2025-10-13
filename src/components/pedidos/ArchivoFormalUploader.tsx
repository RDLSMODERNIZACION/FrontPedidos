// src/components/pedidos/ArchivoFormalUploader.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { PedidoArchivo } from "@/lib/api";
import { listArchivos, uploadArchivo, fileUrl } from "@/lib/archivos";

type Props = {
  pedidoId: number;
  estado: string;                 // "aprobado" | "en_revision" | "enviado" | ...
  onUploaded?: () => void;        // refrescar el detalle externo si querés
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export default function ArchivoFormalUploader({ pedidoId, estado, onUploaded }: Props) {
  // Unificación segura de auth/context
  const authCtx = useAuth() as any;
  const token: string | undefined = (authCtx?.token ?? authCtx?.auth?.token ?? undefined) as
    | string
    | undefined;

  const [archivos, setArchivos] = useState<PedidoArchivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const puedeSubir = estado === "aprobado";

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listArchivos(pedidoId, token);
      // mostrar sólo formal_pdf
      setArchivos(data.filter(a => a.kind === "formal_pdf"));
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, [pedidoId]);

  const latestFormal = useMemo(() => {
    const arr = archivos.slice().sort((a, b) => {
      const ta = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
      const tb = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
      return tb - ta || b.id - a.id;
    });
    return arr[0];
  }, [archivos]);

  async function handlePick(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Sólo se acepta PDF");
      return;
    }
    setError(null);
    setSubiendo(true);
    try {
      await uploadArchivo(pedidoId, "formal_pdf", f, token);
      await refresh();
      onUploaded?.();
    } catch (e: any) {
      const msg = String(e?.message || "Error al subir PDF");
      const isMixed =
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        String(process.env.NEXT_PUBLIC_API_BASE || "").startsWith("http://");
      setError(isMixed ? "No se pudo subir (Mixed Content). Configurá NEXT_PUBLIC_API_BASE con HTTPS." : msg);
    } finally {
      setSubiendo(false);
    }
  }

  const statusBadge = (a?: PedidoArchivo) => {
    if (!a) return <span className="text-[#9aa3b2] text-sm">Sin archivo</span>;
    if (a.review_status === "aprobado") {
      return (
        <span className="text-emerald-300 text-sm flex items-center gap-1">
          <CheckCircle2 size={14} /> Aprobado
        </span>
      );
    }
    if (a.review_status === "observado") {
      return (
        <span className="text-amber-300 text-sm flex items-center gap-1">
          <AlertTriangle size={14} /> Observado
        </span>
      );
    }
    return <span className="text-[#9aa3b2] text-sm">Pendiente de revisión</span>;
  };

  return (
    <div className="grid gap-3">
      {/* Botón / input */}
      <div className="flex items-center gap-2">
        <label className={`btn ${(!puedeSubir || subiendo) ? "opacity-60 pointer-events-none" : ""}`}>
          <Upload size={16} className="mr-1 inline" />
          {subiendo ? "Subiendo..." : "Subir PDF firmado"}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={!puedeSubir || subiendo}
            onChange={handlePick}
          />
        </label>
        {!puedeSubir && (
          <span className="text-xs text-[#9aa3b2] flex items-center gap-1">
            <AlertTriangle size={14}/> Disponible cuando el pedido esté <b>aprobado</b>.
          </span>
        )}
      </div>

      {/* Lista / estado */}
      <div className="rounded-2xl border border-[#2b3550] p-3">
        {loading ? (
          <div className="text-sm text-[#9aa3b2]">Cargando…</div>
        ) : archivos.length === 0 ? (
          <div className="text-sm text-[#9aa3b2]">No hay archivos formales subidos.</div>
        ) : (
          <ul className="grid gap-2">
            {archivos.map(a => (
              <li key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <div className="text-sm">
                    {a.url ? (
                      <a className="link" href={fileUrl(a.url, a.id)} target="_blank" rel="noreferrer">
                        {a.filename || "formal.pdf"}
                      </a>
                    ) : (
                      <span>{a.filename || "formal.pdf"}</span>
                    )}
                    {a.size_bytes != null && (
                      <span className="text-[#9aa3b2] ml-2 text-xs">
                        ({formatBytes(a.size_bytes)})
                      </span>
                    )}
                    <div className="mt-1">{statusBadge(a)}</div>
                  </div>
                </div>
                <div className="text-xs text-[#9aa3b2]">
                  {a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!!error && (
        <div className="rounded-2xl border border-amber-600 bg-amber-900/30 p-2 text-amber-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
