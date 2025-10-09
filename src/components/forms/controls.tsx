'use client';
import { FieldError, UseFormRegister } from "react-hook-form";

type Base = {
  name: string;
  label: string;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
};

export function TextField(
  { name, label, register, error, placeholder, required = false, type = "text" }:
  Base & { register: UseFormRegister<any>; type?: string }
) {
  return (
    <label className="grid gap-1 text-[#9aa3b2]">
      <span>{label}{required && " *"}</span>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
      />
      {error && <small className="text-red-400">{String(error.message)}</small>}
    </label>
  );
}

export function NumberField(p: any) { return <TextField {...p} type="number" />; }
export function DateField(p: any) { return <TextField {...p} type="date" />; }

export function SelectField(
  { name, label, register, error, children, required = false }:
  Base & { register: UseFormRegister<any>; children: React.ReactNode }
) {
  return (
    <label className="grid gap-1 text-[#9aa3b2]">
      <span>{label}{required && " *"}</span>
      <select {...register(name)} className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2">
        {children}
      </select>
      {error && <small className="text-red-400">{String(error.message)}</small>}
    </label>
  );
}
