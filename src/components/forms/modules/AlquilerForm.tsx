// src/components/forms/modules/AlquilerForm.tsx
'use client';

import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type Choice = "edificio" | "maquinaria" | "otros";

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const TIPOS_MAQUINARIA = [
  "Retroexcavadora","Pala cargadora","Camión","Camioneta",
  "Hormigonera","Generador","Compresor","Autoelevador","Otro",
];

export default function AlquilerForm({ lockedChoice }: { lockedChoice?: Choice }) {
  const { register, setValue, control, formState: { errors } } = useFormContext();

  // valor actual en el form
  const catWatch = useWatch({ control, name: "categoria" }) as Choice | undefined;

  // Seteo inicial / bloqueo por elección previa
  useEffect(() => {
    if (lockedChoice) {
      if (catWatch !== lockedChoice) {
        setValue("categoria", lockedChoice, { shouldValidate: true, shouldDirty: true });
      }
    } else if (!catWatch) {
      setValue("categoria", "edificio", { shouldValidate: true });
    }
  }, [lockedChoice, catWatch, setValue]);

  // Categoría efectiva (bloqueada o elegida)
  const categoria: Choice = (lockedChoice ?? catWatch ?? "edificio");

  // Limpiar campos al cambiar de categoría para evitar datos huérfanos
  const prevRef = useRef<Choice | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (prev && prev !== categoria) {
      if (prev === "edificio") {
        setValue("uso_edificio", "");
        setValue("ubicacion_edificio", "");
      }
      if (prev === "maquinaria") {
        setValue("uso_maquinaria", "");
        setValue("tipo_maquinaria", "");
        setValue("requiere_combustible", false);
        setValue("requiere_chofer", false);
        setValue("cronograma_desde", "");
        setValue("cronograma_hasta", "");
        setValue("horas_por_dia", undefined);
      }
      if (prev === "otros") {
        setValue("que_alquilar", "");
        setValue("detalle_uso", "");
      }
    }
    prevRef.current = categoria;
  }, [categoria, setValue]);

  return (
    <div className="grid gap-4">
      {/* Título */}
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-blue-500">¿Qué desea alquilar?</h3>
        {lockedChoice && (
          <span className="badge"><span className="dot ok" />Seleccionado: {lockedChoice}</span>
        )}
      </div>

      {/* Radios (solo si NO viene bloqueado) */}
      {!lockedChoice && (
        <fieldset className="grid gap-2 text-[#cfd6e6]">
          <label className="flex items-center gap-2">
            <input type="radio" value="edificio" {...register("categoria")} className="accent-blue-500" />
            <span>Edificio</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="maquinaria" {...register("categoria")} className="accent-blue-500" />
            <span>Maquinaria</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="otros" {...register("categoria")} className="accent-blue-500" />
            <span>Otros</span>
          </label>
          {(errors as any)?.categoria && (
            <small className="text-red-400">{String((errors as any).categoria.message)}</small>
          )}
        </fieldset>
      )}

      {/* ===== Edificio ===== */}
      {categoria === "edificio" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Datos del Edificio</h4>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Para qué se va a usar el edificio?</span>
            <textarea
              rows={4}
              {...register("uso_edificio")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.uso_edificio && (
              <small className="text-red-400">{String((errors as any).uso_edificio.message)}</small>
            )}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Ubicación del edificio:</span>
            <input
              {...register("ubicacion_edificio")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.ubicacion_edificio && (
              <small className="text-red-400">{String((errors as any).ubicacion_edificio.message)}</small>
            )}
          </label>
        </div>
      )}

      {/* ===== Maquinaria ===== */}
      {categoria === "maquinaria" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Datos de la Maquinaria</h4>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Para qué se va a usar la maquinaria?</span>
            <textarea
              rows={4}
              {...register("uso_maquinaria")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.uso_maquinaria && (
              <small className="text-red-400">{String((errors as any).uso_maquinaria.message)}</small>
            )}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Tipo de maquinaria:</span>
            <select
              {...register("tipo_maquinaria")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>Seleccione tipo de maquinaria...</option>
              {TIPOS_MAQUINARIA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(errors as any)?.tipo_maquinaria && (
              <small className="text-red-400">{String((errors as any).tipo_maquinaria.message)}</small>
            )}
          </label>

          <div className="grid gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("requiere_combustible")} className="accent-blue-500" />
              <span>¿Requiere combustible?</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("requiere_chofer")} className="accent-blue-500" />
              <span>¿Requiere chofer?</span>
            </label>
          </div>

          <div className="card">
            <h5 className="text-base font-semibold text-blue-500 mb-2">Cronograma semanal de uso</h5>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-1 text-[#9aa3b2]">
                <span>Desde</span>
                <select
                  {...register("cronograma_desde")}
                  className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar día...</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {(errors as any)?.cronograma_desde && (
                  <small className="text-red-400">{String((errors as any).cronograma_desde.message)}</small>
                )}
              </label>

              <label className="grid gap-1 text-[#9aa3b2]">
                <span>Hasta</span>
                <select
                  {...register("cronograma_hasta")}
                  className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar día...</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {(errors as any)?.cronograma_hasta && (
                  <small className="text-red-400">{String((errors as any).cronograma_hasta.message)}</small>
                )}
              </label>

              <label className="grid gap-1 text-[#9aa3b2]">
                <span>Horas por día</span>
                <input
                  type="number"
                  step="any"
                  placeholder="Ej: 4"
                  {...register("horas_por_dia", { valueAsNumber: true })}
                  className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
                />
                {(errors as any)?.horas_por_dia && (
                  <small className="text-red-400">{String((errors as any).horas_por_dia.message)}</small>
                )}
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ===== Otros ===== */}
      {categoria === "otros" && (
        <div className="grid gap-3">
          <h4 className="text-base font-semibold text-green-600">Otros Elementos</h4>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>¿Qué se desea alquilar?</span>
            <input
              {...register("que_alquilar")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.que_alquilar && (
              <small className="text-red-400">{String((errors as any).que_alquilar.message)}</small>
            )}
          </label>

          <label className="grid gap-1 text-[#9aa3b2]">
            <span>Detalle de uso:</span>
            <textarea
              rows={4}
              {...register("detalle_uso")}
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
            />
            {(errors as any)?.detalle_uso && (
              <small className="text-red-400">{String((errors as any).detalle_uso.message)}</small>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
