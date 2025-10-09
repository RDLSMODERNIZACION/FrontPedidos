'use client';
import { useFormContext } from "react-hook-form";
import { DateField, NumberField, TextField } from "../controls";

export default function ObrasForm() {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField name="proveedor" label="Proveedor" register={register} error={errors.proveedor as any} required />
      <TextField name="obra_nombre" label="Nombre de la obra" register={register} error={errors.obra_nombre as any} required />
      <DateField name="fecha_inicio" label="Fecha inicio" register={register} error={errors.fecha_inicio as any} required />
      <DateField name="fecha_fin" label="Fecha fin" register={register} error={errors.fecha_fin as any} required />
      <NumberField name="monto_contrato" label="Monto de contrato (ARS)" register={register} error={errors.monto_contrato as any} required />
      <NumberField name="anticipo_pct" label="Anticipo % (opcional)" register={register} error={errors.anticipo_pct as any} />
    </div>
  );
}
