// src/components/forms/modules/ServiciosForm.tsx
'use client';

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

export default function ServiciosForm() {
  const { register, control, setValue, formState: { errors } } = useFormContext();
  const tipo = useWatch({ control, name: "tipo_servicio" }); // 'mantenimiento' | 'profesionales'

  // Setear default al entrar
  useEffect(() => {
    if (!tipo) setValue("tipo_servicio", "mantenimiento");
  }, [tipo, setValue]);

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold text-blue-500">¿Qué tipo de servicio necesita?</h3>

      {/* Radios */}
      <div className="grid gap-2 text-[#cfd6e6]">
        <label className="flex items-center gap-2">
          <input type="radio" value="mantenimiento" {...register("tipo_servicio")} className="accent-blue-500" />
          <span>Mantenimiento</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="profesionales" {...register("tipo_servicio")} className="accent-blue-500" />
          <span>Profesionales</span>
        </label>
        {(errors as any)?.tipo_servicio && (
          <small className="text-red-400">{String((errors as any).tipo_servicio.message)}</small>
        )}
      </div>

      {/* ===== Bloque: Mantenimiento ===== */}
      {tipo === "mantenimiento" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Detalle de Mantenimiento</h4>
          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Qué necesita mantenimiento?</span>
            <textarea
              rows={4}
              {...register("detalle_mantenimiento")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.detalle_mantenimiento && (
              <small className="text-red-400">{String((errors as any).detalle_mantenimiento.message)}</small>
            )}
          </label>
        </div>
      )}

      {/* ===== Bloque: Profesionales ===== */}
      {tipo === "profesionales" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Detalle de Profesionales</h4>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Tipo de profesional:</span>
            <input
              {...register("tipo_profesional")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.tipo_profesional && (
              <small className="text-red-400">{String((errors as any).tipo_profesional.message)}</small>
            )}
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-[#9aa3b2]">
              <span>Desde:</span>
              <select
                {...register("dia_desde")}
                className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
                defaultValue=""
              >
                <option value="" disabled>-- Día desde --</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {(errors as any)?.dia_desde && (
                <small className="text-red-400">{String((errors as any).dia_desde.message)}</small>
              )}
            </label>

            <label className="grid gap-1 text-[#9aa3b2]">
              <span>Hasta:</span>
              <select
                {...register("dia_hasta")}
                className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
                defaultValue=""
              >
                <option value="" disabled>-- Día hasta --</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {(errors as any)?.dia_hasta && (
                <small className="text-red-400">{String((errors as any).dia_hasta.message)}</small>
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
