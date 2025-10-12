// src/app/pedidos/nuevo/StepGeneral.tsx
'use client';

import React, { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

type Props = {
  generalForm: UseFormReturn<any>;
  auth?: any;
  previewMode?: boolean;
  onNext: () => void;
  secretariaDefault?: string;
};

export default function StepGeneral({
  generalForm,
  auth,
  previewMode,
  onNext,
  secretariaDefault,
}: Props) {
  const {
    register,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = generalForm;

  // ===== Secretaría: form -> prop -> auth
  const secForm = watch("secretaria");
  const secAuth =
    auth?.user?.secretaria ??
    auth?.user?.department ??
    auth?.user?.departamento ??
    null;

  const secretaria = useMemo(
    () => (secForm && String(secForm).trim()) || secretariaDefault || secAuth || "",
    [secForm, secretariaDefault, secAuth]
  );

  useEffect(() => {
    const cur = getValues("secretaria");
    if (secretaria && (!cur || String(cur).trim() === "")) {
      setValue("secretaria", secretaria, { shouldDirty: false, shouldTouch: false });
    }
  }, [secretaria, getValues, setValue]);

  const disabled = !!previewMode || isSubmitting;
  const toTime = (s?: string) => (s ? new Date(s).getTime() : NaN);

  // UX de min en inputs (permite igualdad)
  const fp = watch("fecha_pedido");
  const fd = watch("fecha_desde");

  // ===== VALIDACIÓN MANUAL (permite igualdad en fechas relacionadas)
  async function validateAndNext() {
    clearErrors(["fecha_pedido", "fecha_desde", "fecha_hasta", "presupuesto_estimado"]);

    const v = getValues();
    let ok = true;

    // Requeridos
    if (!v?.fecha_pedido) { setError("fecha_pedido", { type: "manual", message: "Requerida" }); ok = false; }
    if (!v?.fecha_desde)  { setError("fecha_desde",  { type: "manual", message: "Requerida" }); ok = false; }
    if (!v?.fecha_hasta)  { setError("fecha_hasta",  { type: "manual", message: "Requerida" }); ok = false; }

    // Presupuesto > 0
    const num = Number(v?.presupuesto_estimado);
    if (!(num > 0)) {
      setError("presupuesto_estimado", { type: "manual", message: "Debe ser mayor que 0" });
      ok = false;
    }

    // Orden de fechas (>=)
    const tP = toTime(v?.fecha_pedido);
    const tD = toTime(v?.fecha_desde);
    const tH = toTime(v?.fecha_hasta);

    if (!isNaN(tP) && !isNaN(tD) && !(tD >= tP)) {
      setError("fecha_desde", { type: "manual", message: "Debe ser igual o mayor a la fecha de pedido" });
      ok = false;
    }
    if (!isNaN(tD) && !isNaN(tH) && !(tH >= tD)) {
      setError("fecha_hasta", { type: "manual", message: "Debe ser igual o mayor al período de ejecución (desde)" });
      ok = false;
    }

    if (!ok) return;
    onNext();
  }

  return (
    <section className="card grid gap-4">
      {/* Cabecera: Secretaría */}
      <div className="text-sm text-[#9aa3b2]">
        Secretaría: <b>{secretaria || "—"}</b>
      </div>

      {/* Campo oculto para que viaje en el submit */}
      <input type="hidden" {...register("secretaria")} />

      {/* =================== Datos del Pedido =================== */}
      <div className="rounded-2xl border border-[#27314a] bg-[#0d1220] p-4 md:p-5 grid gap-4">
        <h3 className="text-lg font-semibold">Datos del Pedido</h3>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Fecha de Pedido */}
          <label className="grid gap-1">
            <span className="text-sm text-[#9aa3b2]">Fecha de Pedido: *</span>
            <input
              type="date"
              className="rounded-xl border border-[#27314a] bg-black/30 px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
              {...register("fecha_pedido")}
              disabled={disabled}
              aria-invalid={!!errors?.fecha_pedido || undefined}
            />
            {errors?.fecha_pedido && (
              <span className="text-xs text-red-300">
                {String(errors.fecha_pedido.message ?? "Fecha inválida")}
              </span>
            )}
          </label>

          {/* Período de Ejecución / Entrega: desde-hasta */}
          <label className="grid gap-1">
            <span className="text-sm text-[#9aa3b2]">Período de Ejecución / Entrega (desde) *</span>
            <input
              type="date"
              min={fp || undefined} // permite igualdad
              className="rounded-xl border border-[#27314a] bg-black/30 px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
              {...register("fecha_desde")}
              disabled={disabled}
              aria-invalid={!!errors?.fecha_desde || undefined}
            />
            {errors?.fecha_desde && (
              <span className="text-xs text-red-300">
                {String(errors.fecha_desde.message ?? "Fecha inválida")}
              </span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-[#9aa3b2]">Período de Ejecución / Entrega (hasta) *</span>
            <input
              type="date"
              min={fd || fp || undefined} // permite igualdad
              className="rounded-xl border border-[#27314a] bg-black/30 px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
              {...register("fecha_hasta")}
              disabled={disabled}
              aria-invalid={!!errors?.fecha_hasta || undefined}
            />
            {errors?.fecha_hasta && (
              <span className="text-xs text-red-300">
                {String(errors.fecha_hasta.message ?? "Fecha inválida")}
              </span>
            )}
          </label>
        </div>

        {/* Presupuesto estimado */}
        <label className="grid gap-1">
          <span className="text-sm text-[#9aa3b2]">Presupuesto Estimado (ARS): *</span>
          <input
            inputMode="numeric"
            type="number"
            step="1"
            min={1}
            className="rounded-xl border border-[#27314a] bg-black/30 px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
            {...register("presupuesto_estimado")}
            disabled={disabled}
            aria-invalid={!!errors?.presupuesto_estimado || undefined}
          />
          {errors?.presupuesto_estimado && (
            <span className="text-xs text-red-300">
              {String(errors.presupuesto_estimado.message ?? "Monto inválido")}
            </span>
          )}
        </label>

        {/* Observaciones */}
        <label className="grid gap-1">
          <span className="text-sm text-[#9aa3b2]">Observaciones:</span>
          <textarea
            rows={4}
            className="rounded-xl border border-[#27314a] bg-black/30 px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
            placeholder="Escriba aquí cualquier observación adicional..."
            {...register("observaciones")}
            disabled={disabled}
            aria-invalid={!!errors?.observaciones || undefined}
          />
          {errors?.observaciones && (
            <span className="text-xs text-red-300">
              {String(errors.observaciones.message ?? "Observación inválida")}
            </span>
          )}
        </label>
      </div>

      {/* Botón continuar */}
      <div>
        <button
          className="btn"
          type="button"
          onClick={validateAndNext}
          disabled={isSubmitting || !!previewMode}
        >
          Guardar General y seguir →
        </button>
      </div>
    </section>
  );
}
