// src/app/pedidos/nuevo/StepResumenEnviar.tsx
'use client';
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, FileText, Calendar, DollarSign } from "lucide-react";
import { KV, Pill, Section, ProgressBar } from "./UI";
import { fmtMoney, fmtDate } from "@/lib/utils";

type Props = {
  summary: any;
  obrasForm: any;
  showJson: boolean;
  setShowJson: Dispatch<SetStateAction<boolean>>;
  sending: boolean;
  canSend: boolean;
  progress: number;
  handleEnviar: () => void;
  onBackGeneral: () => void;
  onBackAmbito: () => void;
  onBackModulo: () => void;
  sendError: string | null;
};

export default function StepResumenEnviar({
  summary, obrasForm, showJson, setShowJson, sending, canSend, progress, handleEnviar,
  onBackGeneral, onBackAmbito, onBackModulo, sendError
}: Props) {
  const g = summary?.generales ?? {};
  const amb = summary?.ambitoIncluido ?? "ninguno";
  const modSel = summary?.modulo_seleccionado ?? "-";
  const draft = summary?.modulo_draft ?? {};
  const obraFormVals = (obrasForm.getValues?.() as any) || {};
  const anexoObraOk = amb === "obra" ? Boolean(obraFormVals?.anexo1_pdf?.[0]) : true;

  const itemsAdq = draft?.payload?.items ?? [];
  const hasItemsAdq = Array.isArray(itemsAdq) && itemsAdq.length > 0;

  // Fallbacks robustos para ámbito
  const escuelaValue =
    summary?.ambito?.payload?.escuela ??
    summary?.especiales?.mantenimientodeescuelas?.escuela ??
    summary?.especiales?.escuela ??
    "—";

  const obraNombre =
    summary?.ambito?.payload?.obra_nombre ??
    summary?.especiales?.obra?.obra_nombre ??
    summary?.especiales?.obra_nombre ??
    "—";

  // Requisitos faltantes para tooltip
  const requisitosFaltantes = useMemo(() => {
    const faltan: string[] = [];
    if (amb === "obra" && !anexoObraOk) faltan.push("Adjuntar Anexo 1 (PDF) para Obra");
    if (modSel === "adquisicion" && !hasItemsAdq) faltan.push("Cargar al menos un ítem de Adquisición");
    return faltan;
  }, [amb, anexoObraOk, modSel, hasItemsAdq]);

  const enviarDisabledTitle =
    !canSend && requisitosFaltantes.length
      ? `Faltan: ${requisitosFaltantes.join(" · ")}`
      : !canSend
        ? "Faltan completar requisitos antes de enviar"
        : "";

  // ── Presupuesto único (selección local + validación antes de enviar)
  const [p1, setP1] = useState<File | null>(null);
  const [budgetErr, setBudgetErr] = useState<string | null>(null);

  function onEnviarConValidacion() {
    if (!p1) {
      setBudgetErr("Adjuntá el presupuesto (PDF) antes de enviar.");
      document.getElementById("card-presupuesto")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBudgetErr(null);
    handleEnviar();
  }

  return (
    <div className="grid gap-4">
      {/* Encabezado + chips */}
      <section className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Resumen final</h3>
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              onClick={() => setShowJson(s => !s)}
              disabled={sending}
              aria-pressed={showJson}
              aria-label={showJson ? "Ocultar JSON" : "Ver JSON"}
              title={showJson ? "Ocultar JSON" : "Ver JSON"}
            >
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
              {anexoObraOk ? (<><CheckCircle2 size={14} className="inline mr-1" /> Anexo 1</>)
                           : (<><AlertTriangle size={14} className="inline mr-1" /> Anexo 1 pendiente</>)}
            </Pill>
          )}
          {modSel === "adquisicion" && (
            <Pill tone={hasItemsAdq ? "ok" : "warn"}>
              {hasItemsAdq ? `${itemsAdq.length} ítem(s)` : "Sin ítems"}
            </Pill>
          )}
        </div>
      </section>

      {/* Dos columnas: Generales + Ámbito (fila 1) y Módulo + Presupuesto (fila 2) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Generales */}
        <Section
          title="Generales"
          right={<button className="btn-ghost" onClick={onBackGeneral} title="Editar generales" disabled={sending}>Editar</button>}
        >
          <KV label="Fecha del pedido" value={<><Calendar size={14} className="inline mr-1" /> {fmtDate(g.fecha_pedido)}</>} />
          <KV label="Desde / Hasta" value={`${fmtDate(g.fecha_desde)} · ${fmtDate(g.fecha_hasta)}`} />
          <KV label="Presupuesto est." value={<><DollarSign size={14} className="inline mr-1" /> {fmtMoney(g.presupuesto_estimado)}</>} />
          <KV label="Observaciones" value={g.observaciones || <span className="text-[#9aa3b2]">—</span>} />
        </Section>

        {/* Ámbito */}
        <Section
          title="Ámbito"
          right={<button className="btn-ghost" onClick={onBackAmbito} title="Editar ámbito" disabled={sending}>Editar</button>}
        >
          {amb === "ninguno" && <div className="text-sm text-[#9aa3b2]">Sin datos adicionales.</div>}

          {amb === "mantenimientodeescuelas" && (
            <>
              <KV label="Tipo" value="Mantenimiento de Escuelas" />
              <KV label="Escuela" value={escuelaValue} />
            </>
          )}

          {amb === "obra" && (
            <>
              <KV label="Tipo" value="Obra" />
              <KV label="Nombre de la obra" value={obraNombre} />
              <KV
                label="Anexo 1 (PDF)"
                value={anexoObraOk
                  ? <span className="text-emerald-300 flex items-center gap-1"><CheckCircle2 size={14}/> OK</span>
                  : <span className="text-amber-300 flex items-center gap-1"><AlertTriangle size={14}/> Pendiente</span>}
              />
            </>
          )}
        </Section>

        {/* Módulo */}
        <Section
          title={`Módulo: ${modSel}`}
          right={<button className="btn-ghost" onClick={onBackModulo} title="Editar módulo" disabled={sending}>Editar</button>}
        >
          {modSel === "servicios" && (
            <>
              {/* Si existe tipo_servicio (legacy), lo mostramos */}
              {draft?.payload?.tipo_servicio && (
                <KV label="Tipo de servicio" value={draft.payload.tipo_servicio} />
              )}
              {/* Nuevo esquema: servicio_requerido / destino_servicio */}
              {draft?.payload?.servicio_requerido && (
                <>
                  <KV label="Servicio requerido" value={draft.payload.servicio_requerido} />
                  <KV label="Destino" value={draft.payload.destino_servicio || "—"} />
                </>
              )}
              {/* Profesionales */}
              {draft?.payload?.tipo_profesional && (
                <>
                  <KV label="Tipo profesional" value={draft.payload.tipo_profesional || "—"} />
                  <KV label="Días" value={`${draft.payload.dia_desde ?? "—"} · ${draft.payload.dia_hasta ?? "—"}`} />
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

        {/* 👉 Presupuesto al costado derecho del módulo */}
        <section id="card-presupuesto" className="card grid gap-3 p-4 h-fit">
          <h4 className="text-base font-semibold">Adjuntar presupuesto (PDF)</h4>

          <label className="grid gap-1">
            <span className="text-sm text-[#9aa3b2]">
              Presupuesto <b className="text-rose-300">*</b>
            </span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="rounded-xl border border-[#27314a] bg-black/30 px-3 py-2"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setP1(f);
                // Guarda temporalmente para que StepFinalizar lo suba con el pedido_id
                if (typeof window !== "undefined") {
                  (window as any).__pending_budget_file = f;
                }
              }}
              disabled={sending}
            />
            {p1 && <small className="text-[#9aa3b2]">Seleccionado: {p1.name}</small>}
          </label>

          {budgetErr && (
            <div className="rounded-xl border border-amber-600 bg-amber-900/30 p-2 text-amber-200 text-sm">
              {budgetErr}
            </div>
          )}
        </section>
      </div>

      {/* JSON alternativo (opcional) */}
      {showJson && !sending && (
        <section className="card">
          <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary ?? {}, null, 2)}
          </pre>
        </section>
      )}

      {/* Barra de acciones sticky */}
      <div className="sticky bottom-3 z-20" aria-busy={sending}>
        <div className="card flex flex-col sm:flex-row items-center gap-3 justify-between">
          {!sending ? (
            <>
              <div className="text-sm text-[#9aa3b2] flex items-center gap-2">
                <FileText size={16} />
                {canSend ? "Listo para enviar" : "Faltan completar requisitos antes de enviar"}
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={onBackModulo} disabled={sending}>
                  Volver a Módulos
                </button>
                <button
                  className="btn"
                  disabled={!canSend || sending}
                  onClick={onEnviarConValidacion}
                  title={enviarDisabledTitle}
                >
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
