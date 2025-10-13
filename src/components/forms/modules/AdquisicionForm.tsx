// src/components/forms/modules/AdquisicionForm.tsx
'use client';

import React, { useEffect, useRef } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

type Item = {
  descripcion: string;
  cantidad: number;
  unidad?: string;
  observaciones?: string;
};

type AdqChoice = "uno" | "muchos";

type Props = {
  /** Si viene, fija el modo de adquisición y evita cambios externos */
  lockedChoice?: AdqChoice;
};

export default function AdquisicionForm({ lockedChoice }: Props) {
  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  // ========= Modo de adquisición =========
  const modoActual: string | undefined = watch("modo_adquisicion");

  // Fijamos el modo si viene bloqueado; si no hay valor aún, por defecto "uno"
  useEffect(() => {
    if (lockedChoice) {
      setValue("modo_adquisicion", lockedChoice, { shouldValidate: true, shouldDirty: true });
    } else if (!modoActual) {
      setValue("modo_adquisicion", "uno", { shouldValidate: false });
    }
  }, [lockedChoice]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========= Ítems (detalle) =========
  const newRow = (): Item => ({ descripcion: "", cantidad: 1, unidad: "", observaciones: "" });

  // Guard para StrictMode (evita doble append en dev)
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Si el schema/form ya inicializa items, NO agregamos nada.
    // Sólo agregamos una fila si está vacío.
    if (!Array.isArray(fields) || fields.length === 0) {
      append(newRow(), { shouldFocus: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    append(newRow(), { shouldFocus: true });
  }

  function removeRowSafe(idx: number) {
    if (fields.length <= 1) {
      // Si queda una sola, mejor la "resetear" en lugar de eliminarla
      replace([newRow()]);
    } else {
      remove(idx);
    }
  }

  const fieldCls = (hasErr: boolean) =>
    `w-full bg-panel2 border rounded-xl px-3 py-2 ${hasErr ? "border-red-500" : "border-[#27314a]"}`;

  return (
    <section className="grid gap-3">
      {/* Info del modo (opcional) */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#8fd672]">Detalle de ítems</h3>
        <div className="text-xs text-[#9aa3b2]">
          Modo: <b>{(lockedChoice ?? modoActual ?? "uno").toString()}</b>
        </div>
      </div>

      <div className="rounded-2xl border border-[#27314a] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-[#cbd5e1]">
            <tr>
              <th className="px-3 py-2 w-[40%]">Descripción</th>
              <th className="px-3 py-2 w-[12%]">Cantidad</th>
              <th className="px-3 py-2 w-[18%]">Unidad</th>
              <th className="px-3 py-2">Observaciones</th>
              <th className="px-3 py-2 w-[1%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2132]">
            {fields.map((f, idx) => {
              const eRow: any = (errors?.items as any)?.[idx] ?? {};
              return (
                <tr key={f.id}>
                  <td className="px-3 py-2 align-top">
                    <input
                      {...register(`items.${idx}.descripcion` as const, { required: "Requerido" })}
                      className={fieldCls(!!eRow?.descripcion)}
                      placeholder="Ej: Materiales eléctricos"
                    />
                    {eRow?.descripcion && (
                      <small className="text-red-400">{String(eRow.descripcion.message)}</small>
                    )}
                  </td>

                  <td className="px-3 py-2 align-top">
                    <input
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min={1}
                      {...register(`items.${idx}.cantidad` as const, {
                        valueAsNumber: true,
                        validate: (v) => Number(v) > 0 || "Debe ser > 0",
                      })}
                      className={fieldCls(!!eRow?.cantidad)}
                    />
                    {eRow?.cantidad && (
                      <small className="text-red-400">{String(eRow.cantidad.message)}</small>
                    )}
                  </td>

                  <td className="px-3 py-2 align-top">
                    <input
                      {...register(`items.${idx}.unidad` as const)}
                      className={fieldCls(false)}
                      placeholder="Ej: un, caja, m, kg…"
                    />
                  </td>

                  <td className="px-3 py-2 align-top">
                    <input
                      {...register(`items.${idx}.observaciones` as const)}
                      className={fieldCls(false)}
                      placeholder="Observaciones…"
                    />
                  </td>

                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => removeRowSafe(idx)}
                      title="Quitar fila"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="btn-ghost" onClick={addRow}>
          + Agregar ítem
        </button>
        <span className="text-xs text-[#9aa3b2]">
          Debe haber al menos un ítem. Usá “Quitar” para eliminar filas.
        </span>
      </div>

      {/* Hidden para garantizar que RHF tenga el valor en el submit */}
      <input type="hidden" {...register("modo_adquisicion")} />
    </section>
  );
}
