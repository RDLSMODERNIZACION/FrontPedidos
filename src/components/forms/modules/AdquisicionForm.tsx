// src/components/forms/modules/AdquisicionForm.tsx
'use client';

import { useEffect, useRef } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

type Modo = "uno" | "muchos";

export default function AdquisicionForm({ lockedChoice }: { lockedChoice?: Modo }) {
  const { control, register, setValue, formState: { errors } } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  // modo_adquisicion en el form
  const modoWatch = useWatch({ control, name: "modo_adquisicion" }) as Modo | undefined;

  // Fijar default / bloquear (si viene desde el paso “Elegir”)
  useEffect(() => {
    if (lockedChoice) {
      if (modoWatch !== lockedChoice) {
        setValue("modo_adquisicion", lockedChoice, { shouldValidate: true, shouldDirty: true });
      }
    } else if (!modoWatch) {
      setValue("modo_adquisicion", "uno", { shouldValidate: false });
    }
  }, [lockedChoice, modoWatch, setValue]);

  // Modo efectivo
  const modo: Modo = (lockedChoice ?? modoWatch ?? "uno");

  // Asegurar al menos una fila
  useEffect(() => {
    if (fields.length === 0) {
      append({ descripcion: "", cantidad: 1, unidad: "", observaciones: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambia a "uno" → mantener exactamente una fila
  const prevRef = useRef<Modo | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (prev && prev !== modo && modo === "uno" && fields.length > 1) {
      replace([{ descripcion: "", cantidad: 1, unidad: "", observaciones: "" }]);
    }
    prevRef.current = modo;
  }, [modo, fields.length, replace]);

  const addRow = () =>
    append({ descripcion: "", cantidad: 1, unidad: "", observaciones: "" });

  const canRemove = (idx: number) => modo === "muchos" && fields.length > 1;

  return (
    <div className="grid gap-4">
      {/* Bloque 1: Qué desea comprar */}
      <div className="grid gap-2">
        <h3 className="text-lg font-semibold text-blue-500">¿Qué desea comprar?</h3>

        {/* Selector Uno / Muchos — SOLO si no viene bloqueado desde el paso “Elegir” */}
        {!lockedChoice && (
          <div className="flex flex-wrap items-center gap-4 text-[#cfd6e6]">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="uno"
                {...register("modo_adquisicion")}
                className="accent-blue-500"
                checked={modo === "uno"}
                onChange={() => {
                  setValue("modo_adquisicion", "uno", { shouldValidate: true, shouldDirty: true });
                  if (fields.length > 1) replace([{ descripcion: "", cantidad: 1, unidad: "", observaciones: "" }]);
                }}
              />
              <span>Uno</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="muchos"
                {...register("modo_adquisicion")}
                className="accent-blue-500"
                checked={modo === "muchos"}
                onChange={() => setValue("modo_adquisicion", "muchos", { shouldValidate: true, shouldDirty: true })}
              />
              <span>Muchos</span>
            </label>
          </div>
        )}

        <label className="grid gap-1 text-[#9aa3b2]">
          <span>¿Para qué va a solicitar esta compra?</span>
          <input
            {...register("proposito")}
            placeholder="Ej: Equipamiento, reparación, etc."
            className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
          />
          {(errors as any)?.proposito && (
            <small className="text-red-400">{String((errors as any).proposito.message)}</small>
          )}
        </label>
      </div>

      {/* Bloque 2: Detalle de Ítems */}
      <div className="grid gap-2">
        <h4 className="text-base font-semibold text-green-600">Detalle de Ítems</h4>

        <div className="border border-[#1b2132] rounded-2xl overflow-hidden">
          <table className="table w-full">
            <thead className="bg-blue-100 text-black">
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Observaciones</th>
                {modo === "muchos" && <th className="text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => (
                <tr key={f.id}>
                  <td>
                    <input
                      {...register(`items.${i}.descripcion` as const)}
                      className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 w-full"
                    />
                    {(errors as any)?.items?.[i]?.descripcion && (
                      <small className="text-red-400">
                        {String((errors as any).items?.[i]?.descripcion?.message)}
                      </small>
                    )}
                  </td>

                  <td>
                    <input
                      type="number"
                      step="any"
                      {...register(`items.${i}.cantidad` as const, { valueAsNumber: true })}
                      className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 w-full"
                    />
                    {(errors as any)?.items?.[i]?.cantidad && (
                      <small className="text-red-400">
                        {String((errors as any).items?.[i]?.cantidad?.message)}
                      </small>
                    )}
                  </td>

                  <td>
                    <input
                      {...register(`items.${i}.unidad` as const)}
                      className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 w-full"
                      placeholder="Ej: un, caja, m, kg…"
                    />
                    {(errors as any)?.items?.[i]?.unidad && (
                      <small className="text-red-400">
                        {String((errors as any).items?.[i]?.unidad?.message)}
                      </small>
                    )}
                  </td>

                  <td>
                    <input
                      {...register(`items.${i}.observaciones` as const)}
                      className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 w-full"
                    />
                  </td>

                  {modo === "muchos" && (
                    <td className="text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-600 text-white disabled:opacity-50"
                        onClick={() => canRemove(i) && remove(i)}
                        disabled={!canRemove(i)}
                        aria-label="Eliminar ítem"
                        title={canRemove(i) ? "Eliminar ítem" : "Debe quedar al menos un ítem"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(errors as any)?.items?.message && (
                <tr>
                  <td colSpan={modo === "muchos" ? 5 : 4}>
                    <small className="text-red-400 px-3">
                      {String((errors as any).items?.message)}
                    </small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botón Agregar sólo en modo "muchos" */}
        {modo === "muchos" && (
          <div className="flex justify-end">
            <button type="button" className="btn inline-flex items-center gap-2" onClick={addRow}>
              <Plus size={16} /> Agregar ítem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
