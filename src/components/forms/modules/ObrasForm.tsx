// src/components/forms/modules/ObrasForm.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { listObras, createObra, type ObraCat } from "@/lib/catalog";

export default function ObrasForm() {
  const { register, setValue, formState: { errors }, watch } = useFormContext();

  // 📌 RHF: aseguramos que el campo programático "anexo1_pdf" esté registrado
  useEffect(() => {
    register("anexo1_pdf");
  }, [register]);

  const [obras, setObras] = useState<ObraCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const obra_id = watch("obra_id") as number | undefined;

  // === cargar catálogo ===
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listObras();
        if (alive) {
          const sorted = [...data].sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));
          setObras(sorted);
        }
      } catch (e) {
        console.error("No se pudieron cargar obras", e);
        if (alive) setObras([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const selectedNombre = useMemo(() => {
    const id = Number(obra_id);
    if (!id) return "";
    return obras.find(o => o.id === id)?.nombre ?? "";
  }, [obra_id, obras]);

  // === compat backend: nombre textual para el payload ===
  useEffect(() => {
    setValue("obra_nombre", selectedNombre, { shouldValidate: true });
  }, [selectedNombre, setValue]);

  async function handleCreateClick() {
    setSavedMsg(null);
    setErrorMsg(null);
    const nombre = newNombre.trim();
    if (!nombre) return;
    try {
      const created = await createObra({ nombre, activa: true });
      setObras(prev => {
        const exists = prev.some(p => p.id === created.id);
        const next = exists ? prev : [...prev, created];
        return next.sort((a,b)=> (a.nombre || "").localeCompare(b.nombre || ""));
      });
      setValue("obra_id", created.id, { shouldValidate: true });
      setValue("obra_nombre", created.nombre, { shouldValidate: true });
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

  // === Anexo 1 (PDF) ===
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileWarn, setFileWarn] = useState<string | null>(null);

  const onPickPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileWarn(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setValue("anexo1_pdf", undefined, { shouldValidate: true });
      setFileName(null);
      return;
    }
    const f = files[0];
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileWarn("Sólo se admite PDF");
      // limpiar input y valor en RHF
      if (fileInputRef.current) fileInputRef.current.value = "";
      setValue("anexo1_pdf", undefined, { shouldValidate: true });
      setFileName(null);
      return;
    }
    // guardar en RHF como FileList
    setValue("anexo1_pdf", files as any, { shouldValidate: true });
    setFileName(f.name);
  };

  const onClearPdf = () => {
    setFileWarn(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setValue("anexo1_pdf", undefined, { shouldValidate: true });
  };

  const fieldCls = (hasErr: boolean) =>
    `bg-panel2 border rounded-xl px-3 py-2 ${hasErr ? "border-red-500" : "border-[#27314a]"}`;

  return (
    <div className="grid gap-3">
      {/* Combo de obras */}
      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Obra / Lugar</span>
        <select
          {...register("obra_id", { valueAsNumber: true })}
          className={fieldCls(!!errors.obra_id)}
          value={obra_id ?? ""}
          onChange={(e) =>
            setValue("obra_id", e.target.value ? Number(e.target.value) : undefined, {
              shouldValidate: true,
            })
          }
          required
          disabled={addMode}
        >
          <option value="">Seleccionar...</option>
          {loading ? (
            <option value="" disabled>
              Cargando...
            </option>
          ) : (
            obras.map((o) => (
              <option key={o.id ?? o.nombre} value={o.id ?? ""}>
                {o.nombre}{o.ubicacion ? ` — ${o.ubicacion}` : ""}
              </option>
            ))
          )}
        </select>
        {/* Campo oculto para compat (el backend actual espera 'obra_nombre') */}
        <input type="hidden" {...register("obra_nombre")} value={selectedNombre} readOnly />
        {errors.obra_id && (
          <small className="text-red-400">{String((errors.obra_id as any).message)}</small>
        )}
      </label>

      {/* Alta inline */}
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
            <span className="text-[#9aa3b2]">Nueva obra</span>
            <input
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              className="bg-panel border border-[#27314a] rounded-xl px-3 py-2"
              placeholder="Nombre"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={handleCreateClick}>
              Guardar
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setAddMode(false);
                setNewNombre("");
                setErrorMsg(null);
              }}
            >
              Cancelar
            </button>
            {savedMsg && <span className="text-emerald-400 text-sm ml-auto">{savedMsg}</span>}
            {errorMsg && <span className="text-amber-300 text-sm ml-auto">{errorMsg}</span>}
          </div>
        </div>
      )}

      {/* Anexo 1 (PDF) — layout con aire y nombre con wrap */}
      <div className="grid gap-1 text-[#9aa3b2]">
        <span>
          Anexo 1 (PDF) — <span className="text-[#cfd6e6]">obligatorio al enviar</span>
        </span>

        <div className="rounded-xl border border-[#27314a] bg-[#0d1220] p-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* Botón seleccionar */}
            <label className="btn w-max">
              Seleccionar archivo
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={onPickPdf}
              />
            </label>

            {/* Nombre del archivo con wrap y espacio flexible */}
            <div
              className="text-sm text-[#cfd6e6] md:flex-1 min-w-0 whitespace-normal break-words"
              title={fileName ?? "Ningún archivo seleccionado"}
            >
              {fileName ? (
                <>Seleccionado: <b>{fileName}</b></>
              ) : (
                "Ningún archivo seleccionado"
              )}
            </div>

            {/* Quitar a la derecha en desktop / abajo en mobile */}
            {fileName && (
              <button type="button" className="btn-ghost md:self-auto self-end" onClick={onClearPdf}>
                Quitar
              </button>
            )}
          </div>

          {fileWarn && <small className="block mt-2 text-amber-300">{fileWarn}</small>}
        </div>
      </div>
    </div>
  );
}
