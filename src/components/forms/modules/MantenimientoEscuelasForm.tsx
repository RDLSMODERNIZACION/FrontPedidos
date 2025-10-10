// src/components/forms/modules/MantenimientoEscuelasForm.tsx
'use client';

import { useFormContext } from "react-hook-form";
import { TextField } from "../controls";

export default function MantenimientoEscuelasForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField
        name="escuela"
        label="Escuela"
        placeholder="Ej.: Escuela N° 42"
        register={register}
        error={errors.escuela as any}
        required
      />
    </div>
  );
}
