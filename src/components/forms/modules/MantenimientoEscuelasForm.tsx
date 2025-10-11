// src/components/forms/modules/MantenimientoEscuelasForm.tsx
'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { listEscuelas, createEscuela, type Escuela } from "@/lib/catalog";

export default function MantenimientoEscuelasForm() {
  const { register, setValue, formState: { errors }, watch } = useFormContext();

  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const escuela_id = watch("escuela_id") as number | undefined;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listEscuelas();
        if (alive) setEscuelas(data);
      } catch (e) {
        console.error("No se pudieron cargar escuelas", e);
        if (alive) setEscuelas([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const selectedNombre = useMemo(() => {
    const id = Number(escuela_id);
    if (!id) return "";
    return escuelas.find(e => e.id === id)?.nombre ?? "";
  }, [escuela_id, escuelas]);

  // Compat backend: mantener el nombre textual en un campo oculto
  useEffect(() => {
    setValue("escuela", selectedNombre, { shouldValidate: true });
  }, [selectedNombre, setValue]);

  // Guardar NUEVA escuela sin submit del form (evita redirecciones)
  async function handleCreateClick() {
    setSavedMsg(null);
    setErrorMsg(null);
    const nombre = newNombre.trim();
    if (!nombre) return;
    try {
      const created = await createEscuela({ nombre, activa: true });
      setEscuelas(prev => {
        const exists = prev.some(p => p.id === created.id);
        const next = exists ? prev : [...prev, created];
        return next.sort((a,b)=> (a.nombre || "").localeCompare(b.nombre || ""));
      });
      setValue("escuela_id", created.id, { shouldValidate: true });
      setValue("escuela", created.nombre, { shouldValidate: true });
      setAddMode(false);
      setNewNombre("");
      setSavedMsg("Guardado");
      setTimeout(() => setSavedMsg(null), 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("No se pudo guardar. Verificá sesión/permisos o si ya existe.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  }

  const fieldCls = (hasErr: boolean) =>
    `bg-panel2 border rounded-xl px-3 py-2 ${hasErr ? "border-red-500" : "border-[#27314a]"}`;

  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Escuela</span>
        <select
          {...register("escuela_id", { valueAsNumber: true })}
          className={fieldCls(!!errors.escuela_id)}
          value={escuela_id ?? ""}
          onChange={(e) => setValue("escuela_id", e.target.value ? Number(e.target.value) : undefined, { shouldValidate: true })}
          required
          disabled={addMode}
        >
          <option value="">Seleccionar...</option>
          {loading ? (
            <option value="" disabled>Cargando...</option>
          ) : (
            escuelas.map(e => (
              <option key={e.id ?? e.nombre} value={e.id ?? ""}>
                {e.nombre}{e.ubicacion ? ` — ${e.ubicacion}` : ""}
              </option>
            ))
          )}
        </select>
        {/* Campo oculto: nombre textual para compat con backend actual */}
        <input type="hidden" {...register("escuela")} value={selectedNombre} readOnly />
        {errors.escuela_id && (
          <small className="text-red-400">{String(errors.escuela_id.message)}</small>
        )}
      </label>

      {!addMode ? (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost" onClick={() => setAddMode(true)}>
            ¿No está en la lista? Agregar nueva
          </button>
          {savedMsg && <span className="text-emerald-400 text-sm">{savedMsg}</span>}
          {errorMsg && <span className="text-amber-300 text-sm">{errorMsg}</span>}
        </div>
      ) : (
        <div className="grid gap-2 p-3 rounded-xl border border-[#27314a] bg-panel2">
          <div className="grid gap-1">
            <span className="text-[#9aa3b2]">Nueva escuela</span>
            <input
              value={newNombre}
              onChange={(e)=>setNewNombre(e.target.value)}
              className="bg-panel border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Nombre de la escuela"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={handleCreateClick}>Guardar</button>
            <button type="button" className="btn-ghost" onClick={() => { setAddMode(false); setNewNombre(""); setErrorMsg(null); }}>
              Cancelar
            </button>
            {savedMsg && <span className="text-emerald-400 text-sm ml-auto">{savedMsg}</span>}
            {errorMsg && <span className="text-amber-300 text-sm ml-auto">{errorMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
