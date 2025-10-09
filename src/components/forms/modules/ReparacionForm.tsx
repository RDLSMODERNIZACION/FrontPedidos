'use client';

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const UNIDADES = [
  "Retroexcavadora","Pala cargadora","Camión","Camioneta",
  "Hormigonera","Generador","Compresor","Autoelevador","Otra",
];

type Choice = "maquinaria" | "otros";

export default function ReparacionForm({ lockedChoice }: { lockedChoice?: Choice }) {
  const { register, control, setValue, formState: { errors } } = useFormContext();

  // si viene bloqueado, fijarlo; si no, default a "maquinaria"
  const tipo = useWatch({ control, name: "tipo_reparacion" }) as Choice | undefined;

  useEffect(() => {
    if (lockedChoice) {
      if (tipo !== lockedChoice) {
        setValue("tipo_reparacion", lockedChoice, { shouldValidate: true });
      }
    } else if (!tipo) {
      setValue("tipo_reparacion", "maquinaria", { shouldValidate: true });
    }
  }, [lockedChoice, tipo, setValue]);

  const choice: Choice = (lockedChoice ?? tipo ?? "maquinaria");

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold text-blue-500">¿Qué tipo de reparación desea solicitar?</h3>

      {/* Radios sólo si NO viene lockeado */}
      {!lockedChoice && (
        <div className="grid gap-2 text-[#cfd6e6]">
          <label className="flex items-center gap-2">
            <input type="radio" value="maquinaria" {...register("tipo_reparacion")} className="accent-blue-500" />
            <span>Maquinaria</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="otros" {...register("tipo_reparacion")} className="accent-blue-500" />
            <span>Otros</span>
          </label>
          {(errors as any)?.tipo_reparacion && (
            <small className="text-red-400">{String((errors as any).tipo_reparacion.message)}</small>
          )}
        </div>
      )}

      {/* ===== Maquinaria ===== */}
      {choice === "maquinaria" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Unidad a reparar:</span>
            <select
              {...register("unidad_reparar")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>Seleccione una unidad</option>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {(errors as any)?.unidad_reparar && (
              <small className="text-red-400">{String((errors as any).unidad_reparar.message)}</small>
            )}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Detalle de la reparación</span>
            <textarea
              rows={3}
              {...register("detalle_reparacion")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Describa la reparación necesaria"
            />
            {(errors as any)?.detalle_reparacion && (
              <small className="text-red-400">{String((errors as any).detalle_reparacion.message)}</small>
            )}
          </label>
        </div>
      )}

      {/* ===== Otros ===== */}
      {choice === "otros" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Qué desea reparar?</span>
            <input
              {...register("que_reparar")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Equipo/elemento a reparar"
            />
            {(errors as any)?.que_reparar && (
              <small className="text-red-400">{String((errors as any).que_reparar.message)}</small>
            )}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Detalle de la reparación</span>
            <textarea
              rows={3}
              {...register("detalle_reparacion")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.detalle_reparacion && (
              <small className="text-red-400">{String((errors as any).detalle_reparacion.message)}</small>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
