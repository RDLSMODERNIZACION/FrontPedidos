'use client';

import { useFormContext } from "react-hook-form";
import { DateField, NumberField } from "../controls";

export default function GeneralPedidoForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold text-blue-400">Datos del Pedido</h3>

      {/* Primera fila: Fecha de pedido + Rango */}
      <div className="grid gap-3 md:grid-cols-2">
        <DateField
          name="fecha_pedido"
          label="Fecha de Pedido:"
          register={register}
          error={errors.fecha_pedido as any}
          required
        />

        {/* Período de Ejecución / Entrega (dos fechas) */}
        <div className="grid gap-1 text-[#9aa3b2]">
          <span>Período de Ejecución / Entrega:</span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              {...register("fecha_desde")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Desde"
            />
            <input
              type="date"
              {...register("fecha_hasta")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Hasta"
            />
          </div>
          {(errors.fecha_desde || errors.fecha_hasta) && (
            <small className="text-red-400">
              {(errors.fecha_desde?.message as string) || (errors.fecha_hasta?.message as string)}
            </small>
          )}
        </div>
      </div>

      {/* Presupuesto estimado */}
      <NumberField
        name="presupuesto_estimado"
        label="Presupuesto Estimado (ARS):"
        register={register}
        error={errors.presupuesto_estimado as any}
        required
      />

      {/* Observaciones */}
      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Observaciones:</span>
        <textarea
          rows={4}
          {...register("observaciones")}
          placeholder="Escriba aquí cualquier observación adicional..."
          className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
        />
      </label>
    </div>
  );
}
