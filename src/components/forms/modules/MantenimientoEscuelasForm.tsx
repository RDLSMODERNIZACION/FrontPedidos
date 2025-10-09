'use client';
import { useFormContext } from "react-hook-form";
import { DateField, NumberField, TextField } from "../controls";

export default function MantenimientoEscuelasForm() {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField name="escuela" label="Escuela" register={register} error={errors.escuela as any} required />
      <TextField name="proveedor" label="Proveedor" register={register} error={errors.proveedor as any} required />
      <TextField name="descripcion" label="Descripción" register={register} error={errors.descripcion as any} required />
      <DateField name="fecha" label="Fecha" register={register} error={errors.fecha as any} required />
      <NumberField name="costo_estimado" label="Costo estimado (ARS)" register={register} error={errors.costo_estimado as any} required />
    </div>
  );
}
