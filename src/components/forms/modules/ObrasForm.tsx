// src/components/forms/modules/ObrasForm.tsx
'use client';

import { useFormContext } from "react-hook-form";
import { TextField } from "../controls";

export default function ObrasForm() {
  const { register, formState: { errors }, watch } = useFormContext();
  const files = watch("anexo1_pdf") as FileList | undefined;
  const fileName = files?.[0]?.name;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Solo pedimos el nombre de la obra */}
      <TextField
        name="obra_nombre"
        label="Nombre de la obra"
        placeholder="Ej.: Tanque 1000 m³ - Planta Este"
        register={register}
        error={errors.obra_nombre as any}
        required
      />

      {/* Anexo 1 (PDF) obligatorio */}
      <div className="md:col-span-2">
        <label className="grid gap-1 text-[#cfd6e6]">
          <span>Anexo 1 (PDF) *</span>
          <input
            type="file"
            accept="application/pdf"
            className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#20283b] file:text-[#cfd6e6]"
            {...register("anexo1_pdf", {
              validate: {
                required: (v: FileList) =>
                  (v && v.length > 0) || "Subí el Anexo 1 (PDF).",
                type: (v: FileList) =>
                  !v?.[0] || v[0].type === "application/pdf" || "El archivo debe ser PDF.",
                size: (v: FileList) =>
                  !v?.[0] || v[0].size <= 10 * 1024 * 1024 || "Máximo 10 MB.",
              },
            })}
          />
          <small className="text-[#9aa3b2]">
            {fileName ? `Seleccionado: ${fileName}` : "Formato permitido: PDF (hasta 10 MB)."}
          </small>
          {errors.anexo1_pdf && (
            <small className="text-red-400">
              {(errors.anexo1_pdf as any).message ?? "Archivo inválido"}
            </small>
          )}
        </label>
      </div>
    </div>
  );
}
