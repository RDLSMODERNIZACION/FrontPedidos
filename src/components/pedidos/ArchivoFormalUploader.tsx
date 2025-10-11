// src/components/pedidos/ArchivoFormalUploader.tsx
'use client';
import React, { useEffect, useState } from "react";
import { uploadPedidoFormalPdf, listPedidoArchivos, type PedidoArchivo, fileUrl } from "@/lib/pedidos";
import { Upload, FileText, AlertTriangle } from "lucide-react";

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
  const [archivos, setArchivos] = useState<PedidoArchivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeSubir = estado === "aprobado";

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPedidoArchivos(pedidoId);
      // si sólo querés mostrar el formal_pdf acá:
      setArchivos(data.filter(a => a.kind === "formal_pdf"));
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, [pedidoId]);

  async function handlePick(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Sólo se acepta PDF");
      ev.target.value = "";
      return;
    }
    setError(null);
    setSubiendo(true);
    try {
      await uploadPedidoFormalPdf(pedidoId, f);
      await refresh();
      onUploaded?.();
    } catch (e: any) {
      setError(e?.message ?? "Error al subir PDF");
    } finally {
      setSubiendo(false);
      ev.target.value = "";
    }
  }

  return (
    <div className="grid gap-3">
      {/* Botón / input */}
      <div className="flex items-center gap-2">
        <label className={`btn ${(!puedeSubir || subiendo) ? "opacity-60 pointer-events-none" : ""}`}>
          <Upload size={16} className="mr-1 inline" />
          {subiendo ? "Subiendo..." : "Subir PDF firmado"}
          <input
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
                      <a className="link" href={fileUrl(a.url)} target="_blank" rel="noreferrer">
                        {a.filename || "formal.pdf"}
                      </a>
                    ) : (
                      <span>{a.filename || "formal.pdf"}</span>
                    )}
                    {/* size_bytes puede ser null → render condicional */}
                    {a.size_bytes != null && (
                      <span className="text-[#9aa3b2] ml-2 text-xs">
                        ({formatBytes(a.size_bytes)})
                      </span>
                    )}
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
