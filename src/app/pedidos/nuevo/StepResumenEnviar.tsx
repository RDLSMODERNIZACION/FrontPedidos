// src/app/pedidos/nuevo/StepResumenEnviar.tsx
'use client';
import React from "react";
import { CheckCircle2, AlertTriangle, FileText, Calendar, DollarSign } from "lucide-react";
import { KV, Pill, Section, ProgressBar } from "./UI";
import { fmtMoney, fmtDate } from "@/lib/utils";

export default function StepResumenEnviar(props: {
  summary: any;
  obrasForm: any;
  showJson: boolean;
  setShowJson: (f: (s: boolean) => boolean) => void;
  sending: boolean;
  canSend: boolean;
  progress: number;
  handleEnviar: () => void;
  onBackGeneral: () => void;
  onBackAmbito: () => void;
  onBackModulo: () => void;
  sendError: string | null;
}) {
  const {
    summary, obrasForm, showJson, setShowJson, sending, canSend, progress, handleEnviar,
    onBackGeneral, onBackAmbito, onBackModulo, sendError
  } = props;

  const g = summary?.generales ?? {};
  const amb = summary?.ambitoIncluido ?? "ninguno";
  const modSel = summary?.modulo_seleccionado ?? "-";
  const draft = summary?.modulo_draft ?? {};
  const obraFormVals = (obrasForm.getValues?.() as any) || {};
  const anexoObraOk = amb === "obra" ? Boolean(obraFormVals?.anexo1_pdf?.[0]) : true;

  const itemsAdq = draft?.payload?.items ?? [];
  const hasItemsAdq = Array.isArray(itemsAdq) && itemsAdq.length > 0;

  return (
    <div className="grid gap-4">
      {/* Encabezado + chips */}
      <section className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Resumen final</h3>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setShowJson(!showJson)} disabled={sending}>
              {showJson ? "Ocultar JSON" : "Ver JSON"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Pill><strong>Secretaría:</strong>&nbsp;{g.secretaria ?? "—"}</Pill>
          <Pill><strong>Ámbito:</strong>&nbsp;{amb}</Pill>
          <Pill><strong>Módulo:</strong>&nbsp;{modSel}</Pill>
          {amb === "obra" && (
            <Pill tone={anexoObraOk ? "ok" : "warn"}>
              {anexoObraOk ? (
                <> <CheckCircle2 size={14} className="inline mr-1" /> Anexo 1 </>
              ) : (
                <> <AlertTriangle size={14} className="inline mr-1" /> Anexo 1 pendiente </>
              )}
            </Pill>
          )}
          {modSel === "adquisicion" && (
            <Pill tone={hasItemsAdq ? "ok" : "warn"}>
              {hasItemsAdq ? `${itemsAdq.length} ítem(s)` : "Sin ítems"}
            </Pill>
          )}
        </div>
      </section>

      {/* Dos columnas: Generales + Ambito / Módulo */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Generales */}
        <Section
          title="Generales"
          right={
            <button className="btn-ghost" onClick={onBackGeneral} title="Editar generales" disabled={sending}>
              Editar
            </button>
          }
        >
          <KV label="Fecha del pedido" value={<><Calendar size={14} className="inline mr-1" /> {fmtDate(g.fecha_pedido)}</>} />
          <KV label="Desde / Hasta" value={`${fmtDate(g.fecha_desde)} · ${fmtDate(g.fecha_hasta)}`} />
          <KV label="Presupuesto est." value={<><DollarSign size={14} className="inline mr-1" /> {fmtMoney(g.presupuesto_estimado)}</>} />
          <KV label="Observaciones" value={g.observaciones || <span className="text-[#9aa3b2]">—</span>} />
        </Section>

        {/* Ámbito */}
        <Section
          title="Ámbito"
          right={
            <button className="btn-ghost" onClick={onBackAmbito} title="Editar ámbito" disabled={sending}>
              Editar
            </button>
          }
        >
          {amb === "ninguno" && <div className="text-sm text-[#9aa3b2]">Sin datos adicionales.</div>}
          {amb === "mantenimientodeescuelas" && (
            <>
              <KV label="Tipo" value="Mantenimiento de Escuelas" />
              <KV label="Escuela" value={summary?.especiales?.mantenimientodeescuelas?.escuela ?? "—"} />
            </>
          )}
          {amb === "obra" && (
            <>
              <KV label="Tipo" value="Obra" />
              <KV label="Nombre de la obra" value={summary?.especiales?.obra?.obra_nombre ?? "—"} />
              <KV
                label="Anexo 1 (PDF)"
                value={
                  anexoObraOk
                    ? <span className="text-emerald-300 flex items-center gap-1"><CheckCircle2 size={14}/> OK</span>
                    : <span className="text-amber-300 flex items-center gap-1"><AlertTriangle size={14}/> Pendiente</span>
                }
              />
            </>
          )}
        </Section>

        {/* Módulo */}
        <Section
          title={`Módulo: ${modSel}`}
          right={
            <button className="btn-ghost" onClick={onBackModulo} title="Editar módulo" disabled={sending}>
              Editar
            </button>
          }
        >
          {modSel === "servicios" && (
            <>
              <KV label="Tipo de servicio" value={draft?.payload?.tipo_servicio} />
              {draft?.payload?.tipo_servicio === "mantenimiento" && (
                <KV label="Detalle" value={draft?.payload?.detalle_mantenimiento || "—"} />
              )}
              {draft?.payload?.tipo_servicio === "profesionales" && (
                <>
                  <KV label="Tipo profesional" value={draft?.payload?.tipo_profesional || "—"} />
                  <KV label="Días" value={`${draft?.payload?.dia_desde ?? "—"} · ${draft?.payload?.dia_hasta ?? "—"}`} />
                </>
              )}
            </>
          )}

          {modSel === "alquiler" && (
            <>
              <KV label="Categoría" value={draft?.payload?.categoria} />
              {draft?.payload?.categoria === "edificio" && (
                <>
                  <KV label="Uso" value={draft?.payload?.uso_edificio || "—"} />
                  <KV label="Ubicación" value={draft?.payload?.ubicacion_edificio || "—"} />
                </>
              )}
              {draft?.payload?.categoria === "maquinaria" && (
                <>
                  <KV label="Uso" value={draft?.payload?.uso_maquinaria || "—"} />
                  <KV label="Tipo" value={draft?.payload?.tipo_maquinaria || "—"} />
                  <KV label="Combustible / Chofer" value={`${draft?.payload?.requiere_combustible ? "Sí" : "No"} · ${draft?.payload?.requiere_chofer ? "Sí" : "No"}`} />
                  <KV label="Cronograma" value={`${draft?.payload?.cronograma_desde ?? "—"} · ${draft?.payload?.cronograma_hasta ?? "—"}`} />
                  <KV label="Horas por día" value={draft?.payload?.horas_por_dia ?? "—"} />
                </>
              )}
              {draft?.payload?.categoria === "otros" && (
                <>
                  <KV label="Qué alquilar" value={draft?.payload?.que_alquilar || "—"} />
                  <KV label="Detalle de uso" value={draft?.payload?.detalle_uso || "—"} />
                </>
              )}
            </>
          )}

          {modSel === "adquisicion" && (
            <>
              <KV label="Propósito" value={draft?.payload?.proposito || "—"} />
              <KV label="Modo" value={draft?.payload?.modo_adquisicion || "—"} />
              <div className="mt-1 rounded-xl border border-[#2b3550] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="text-[#9aa3b2] bg-white/5">
                    <tr>
                      <th className="text-left px-3 py-2">Descripción</th>
                      <th className="text-right px-3 py-2">Cantidad</th>
                      <th className="text-left px-3 py-2">Unidad</th>
                      <th className="text-right px-3 py-2">Precio unit.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2132]">
                    {hasItemsAdq ? itemsAdq.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{it.descripcion}</td>
                        <td className="px-3 py-2 text-right">{it.cantidad ?? 1}</td>
                        <td className="px-3 py-2">{it.unidad ?? "—"}</td>
                        <td className="px-3 py-2 text-right">{it.precio_unitario != null ? fmtMoney(it.precio_unitario) : "—"}</td>
                      </tr>
                    )) : (
                      <tr><td className="px-3 py-3 text-[#9aa3b2]" colSpan={4}>Sin ítems cargados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {modSel === "reparacion" && (
            <>
              <KV label="Tipo reparación" value={draft?.payload?.tipo_reparacion} />
              {draft?.payload?.tipo_reparacion === "maquinaria" ? (
                <>
                  <KV label="Unidad a reparar" value={draft?.payload?.unidad_reparar || "—"} />
                  <KV label="Detalle" value={draft?.payload?.detalle_reparacion || "—"} />
                </>
              ) : (
                <>
                  <KV label="Qué reparar" value={draft?.payload?.que_reparar || "—"} />
                  <KV label="Detalle" value={draft?.payload?.detalle_reparacion || "—"} />
                </>
              )}
            </>
          )}
        </Section>
      </div>

      {/* JSON alternativo (NO se fuerza al enviar) */}
      {showJson && !sending && (
        <section className="card">
          <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary ?? {}, null, 2)}
          </pre>
        </section>
      )}

      {/* Barra de acciones sticky */}
      <div className="sticky bottom-3 z-20">
        <div className="card flex flex-col sm:flex-row items-center gap-3 justify-between">
          {!sending ? (
            <>
              <div className="text-sm text-[#9aa3b2] flex items-center gap-2">
                <FileText size={16} />
                {canSend ? "Listo para enviar" : "Faltan completar requisitos antes de enviar"}
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={onBackModulo}>
                  Volver a Módulos
                </button>
                <button className="btn" disabled={!canSend} onClick={handleEnviar}>
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-3 items-center">
              <ProgressBar percent={progress} label="Enviando pedido…" />
              <div className="text-xs text-[#9aa3b2] shrink-0">{progress}%</div>
            </div>
          )}
        </div>
      </div>

      {!!sendError && (
        <div className="rounded-2xl border border-amber-600 bg-amber-900/30 p-3 text-amber-200">
          Hubo un problema al enviar al backend: {sendError}
        </div>
      )}
    </div>
  );
}
