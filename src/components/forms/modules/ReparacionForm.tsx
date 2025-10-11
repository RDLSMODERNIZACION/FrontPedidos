// src/components/forms/modules/ReparacionForm.tsx
'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { listUnidades, type Unidad } from "@/lib/catalog";

type Props = { lockedChoice?: "maquinaria" | "otros" };

export default function ReparacionForm({ lockedChoice }: Props) {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext();
  const tipo = (lockedChoice ?? (watch("tipo_reparacion") as "maquinaria" | "otros" | undefined)) ?? "maquinaria";

  // items dinámicos (NO autoinicializar acá; lo hacemos en defaultValues del useForm)
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items") as Array<{ unidad_nro?: number; detalle?: string }> | undefined;

  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listUnidades();
        if (alive) setUnidades(data);
      } catch (e) {
        console.error("No se pudieron cargar unidades", e);
        if (alive) setUnidades([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const labelUnidad = (u: Unidad) => {
    const parts = [
      u.unidad_nro != null ? `UNIDAD ${u.unidad_nro}` : null,
      u.dominio ?? "S/D",
      u.marca ?? "",
      u.modelo ?? "",
    ].filter(Boolean);
    return parts.join(" — ");
  };

  const fieldCls = (hasErr: boolean) =>
    `bg-panel2 border rounded-xl px-3 py-2 ${hasErr ? "border-red-500" : "border-[#27314a]"}`;

  return (
    <div className="grid gap-4">
      {!lockedChoice && (
        <div className="grid gap-2 text-[#9aa3b2]">
          <span>Tipo de reparación</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="maquinaria" {...register("tipo_reparacion")} defaultChecked />
              <span>Maquinaria</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="otros" {...register("tipo_reparacion")} />
              <span>Otros</span>
            </label>
          </div>
        </div>
      )}

      {tipo === "maquinaria" ? (
        <div className="grid gap-3">
          <div className="text-[#9aa3b2]">Unidades a reparar (podés agregar varias)</div>

          {fields.map((f, idx) => {
            const errPath = (errors as any)?.items?.[idx];
            const unidad_nro = (items?.[idx]?.unidad_nro ?? undefined) as number | undefined;

            return (
              <div key={f.id} className="grid gap-2 p-3 rounded-xl border border-[#27314a]">
                <label className="grid gap-1 text-[#9aa3b2]">
                  <span>Unidad</span>
                  <select
                    {...register(`items.${idx}.unidad_nro` as const, { valueAsNumber: true })}
                    className={fieldCls(!!errPath?.unidad_nro)}
                    value={unidad_nro ?? ""}
                    onChange={(e) => setValue(`items.${idx}.unidad_nro` as const, e.target.value ? Number(e.target.value) : undefined, { shouldValidate: true })}
                    title={
                      unidad_nro != null
                        ? (unidades.find(u => u.unidad_nro === unidad_nro) ? labelUnidad(unidades.find(u => u.unidad_nro === unidad_nro)!) : "Unidad seleccionada")
                        : "Seleccionar unidad"
                    }
                  >
                    <option value="">(Sin seleccionar)</option>
                    {loading ? (
                      <option value="" disabled>Cargando…</option>
                    ) : (
                      unidades.map(u => (
                        <option key={`${u.unidad_nro}-${u.dominio}-${u.id}`} value={u.unidad_nro ?? ""}>
                          {u.unidad_nro != null ? `UNIDAD ${u.unidad_nro}` : "S/N"} — {u.dominio ?? "S/D"}
                        </option>
                      ))
                    )}
                  </select>
                  {errPath?.unidad_nro && <small className="text-red-400">{String(errPath?.unidad_nro?.message)}</small>}
                </label>

                <label className="grid gap-1 text-[#9aa3b2]">
                  <span>Detalle de la reparación</span>
                  <textarea
                    rows={3}
                    {...register(`items.${idx}.detalle` as const)}
                    className={fieldCls(!!errPath?.detalle)}
                    placeholder="Describí la falla, repuestos, tareas, etc."
                  />
                  {errPath?.detalle && <small className="text-red-400">{String(errPath?.detalle?.message)}</small>}
                </label>

                <div className="flex justify-end">
                  <button type="button" className="btn-ghost" onClick={() => remove(idx)} disabled={fields.length <= 1}>
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}

          <div>
            <button type="button" className="btn" onClick={() => append({ unidad_nro: undefined, detalle: "" })}>
              + Agregar otra unidad
            </button>
          </div>

          {(errors as any)?.items && (
            <div className="text-amber-300 text-sm">
              {String((errors as any)?.items?.message ?? "Completá al menos una unidad o el detalle")}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Qué reparar?</span>
            <input
              {...register("que_reparar")}
              className={fieldCls(!!(errors as any)?.que_reparar)}
              placeholder="Equipo o elemento a reparar"
            />
            {(errors as any)?.que_reparar && <small className="text-red-400">{String((errors as any)?.que_reparar?.message)}</small>}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Detalle de la reparación</span>
            <textarea
              rows={3}
              {...register("detalle_reparacion")}
              className={fieldCls(!!(errors as any)?.detalle_reparacion)}
              placeholder="Describí la reparación"
            />
            {(errors as any)?.detalle_reparacion && <small className="text-red-400">{String((errors as any)?.detalle_reparacion?.message)}</small>}
          </label>
        </div>
      )}
    </div>
  );
}
