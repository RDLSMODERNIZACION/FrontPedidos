// src/components/forms/modules/GeneralForm.tsx
'use client';

import { useFormContext } from "react-hook-form";
import { DateField, NumberField } from "../controls";

export default function GeneralPedidoForm() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const fp = watch("fecha_pedido") as string | undefined;
  const fd = watch("fecha_desde") as string | undefined;

  const cls = (hasErr: boolean) =>
    `bg-panel2 border rounded-xl px-3 py-2 ${hasErr ? "border-red-500" : "border-[#27314a]"}`;

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold text-blue-400">Datos del Pedido</h3>

      {/* Fechas */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1 text-[#9aa3b2]">
          <DateField
            name="fecha_pedido"
            label="Fecha de Pedido:"
            register={register}
            error={errors.fecha_pedido as any}
            required
            max={fd || undefined}
          />
          {errors.fecha_pedido?.message && (
            <small className="text-red-400" role="alert" aria-live="polite">
              {String(errors.fecha_pedido.message)}
            </small>
          )}
        </div>

        <div className="grid gap-1 text-[#9aa3b2]">
          <span>Período de Ejecución / Entrega:</span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              {...register("fecha_desde")}
              className={cls(!!errors.fecha_desde)}
              aria-invalid={!!errors.fecha_desde}
              placeholder="Desde"
              required
              min={fp || undefined}
            />
            <input
              type="date"
              {...register("fecha_hasta")}
              className={cls(!!errors.fecha_hasta)}
              aria-invalid={!!errors.fecha_hasta}
              placeholder="Hasta"
              required
              min={fd || undefined}
            />
          </div>
          {(errors.fecha_desde || errors.fecha_hasta) && (
            <small className="text-red-400" role="alert" aria-live="polite">
              {String(
                (errors.fecha_desde?.message as string) ||
                (errors.fecha_hasta?.message as string)
              )}
            </small>
          )}
        </div>
      </div>

      {/* Presupuesto estimado → obligatorio y > 0 (Zod) */}
      <NumberField
        name="presupuesto_estimado"
        label="Presupuesto Estimado (ARS):"
        register={register}
        error={errors.presupuesto_estimado as any}
        required                      // ⬅️ obligatorio en UI
        // min={0.01} step="0.01"     // ⬅️ descomentá si NumberField propaga props al <input>
      />

      {/* Observaciones (opcional) */}
      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Observaciones:</span>
        <textarea
          rows={4}
          {...register("observaciones")}
          placeholder="Escriba aquí cualquier observación adicional..."
          className={cls(false)}
        />
      </label>
    </div>
  );
}
