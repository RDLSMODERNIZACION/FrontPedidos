// src/components/forms/modules/ServiciosForm.tsx
'use client';

import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
type Choice = "otros" | "profesionales";

export default function ServiciosForm({ lockedChoice }: { lockedChoice?: Choice }) {
  const { register, control, setValue, formState: { errors } } = useFormContext();
  const tipoWatch = useWatch({ control, name: "tipo_servicio" }) as Choice | undefined;

  // Fijar default / bloquear elección si viene desde el paso "Elegir"
  useEffect(() => {
    if (lockedChoice) {
      if (tipoWatch !== lockedChoice) {
        setValue("tipo_servicio", lockedChoice, { shouldValidate: true, shouldDirty: true });
      }
    } else if (!tipoWatch) {
      setValue("tipo_servicio", "otros", { shouldValidate: true });
    }
  }, [lockedChoice, tipoWatch, setValue]);

  // Elección efectiva
  const choice: Choice = (lockedChoice ?? tipoWatch ?? "otros");

  // Limpiar campos al cambiar de tipo para evitar “restos”
  const prevRef = useRef<Choice | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (prev && prev !== choice) {
      if (prev === "otros") {
        // vas a profesionales → limpiá campos de “otros”
        setValue("servicio_requerido", "");
        setValue("destino_servicio", "");
      }
      if (prev === "profesionales") {
        // vas a “otros” → limpiá campos de profesionales
        setValue("tipo_profesional", "");
        setValue("dia_desde", "");
        setValue("dia_hasta", "");
      }
    }
    prevRef.current = choice;
  }, [choice, setValue]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-blue-500">¿Qué tipo de servicio necesita?</h3>
        {lockedChoice && (
          <span className="badge"><span className="dot ok" />Seleccionado: {lockedChoice}</span>
        )}
      </div>

      {/* Radios sólo si NO viene bloqueado */}
      {!lockedChoice && (
        <div className="grid gap-2 text-[#cfd6e6]">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="otros"
              {...register("tipo_servicio")}
              className="accent-blue-500"
            />
            <span>Otros</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="profesionales"
              {...register("tipo_servicio")}
              className="accent-blue-500"
            />
            <span>Profesionales</span>
          </label>
          {(errors as any)?.tipo_servicio && (
            <small className="text-red-400">{String((errors as any).tipo_servicio.message)}</small>
          )}
        </div>
      )}

      {/* ===== Otros ===== */}
      {choice === "otros" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Detalle del servicio</h4>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Qué servicio requiere?</span>
            <input
              {...register("servicio_requerido")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Ej.: Traslado de equipos / Desinfección / Sonido y luces / etc."
            />
            {(errors as any)?.servicio_requerido && (
              <small className="text-red-400">
                {String((errors as any).servicio_requerido.message)}
              </small>
            )}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Destino del servicio</span>
            <input
              {...register("destino_servicio")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Ej.: Secretaría / Evento / Obra / Sede / Dirección / Escuela"
            />
            {(errors as any)?.destino_servicio && (
              <small className="text-red-400">
                {String((errors as any).destino_servicio.message)}
              </small>
            )}
          </label>
        </div>
      )}

      {/* ===== Profesionales ===== */}
      {choice === "profesionales" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Detalle de Profesionales</h4>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Tipo de profesional:</span>
            <input
              {...register("tipo_profesional")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Ej.: Electricista, Plomero, Abogado, Técnico"
            />
            {(errors as any)?.tipo_profesional && (
              <small className="text-red-400">
                {String((errors as any).tipo_profesional.message)}
              </small>
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
