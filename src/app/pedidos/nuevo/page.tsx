// src/app/pedidos/nuevo/page.tsx
'use client';

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  baseSchema,
  generalSchema,
  obrasSchema,
  mantenimientodeescuelasSchema,
  serviciosSchema,
  alquilerSchema,
  adquisicionSchema,
  reparacionSchema,
  type CreatePedidoInput,
} from "@/lib/schemas";
import { createPedido } from "@/lib/createPedido";

// Mantener estas rutas según tu proyecto
import GeneralPedidoForm from "@/components/forms/modules/GeneralForm";
import ObrasForm from "@/components/forms/modules/ObrasForm";
import MantenimientoEscuelasForm from "@/components/forms/modules/MantenimientoEscuelasForm";
import ServiciosForm from "@/components/forms/modules/ServiciosForm";
import AlquilerForm from "@/components/forms/modules/AlquilerForm";
import AdquisicionForm from "@/components/forms/modules/AdquisicionForm";
import ReparacionForm from "@/components/forms/modules/ReparacionForm";

/* =========================================================================
 * Config
 * ========================================================================= */
const PREVIEW_MODE = true; // true => Enviar muestra JSON en el Paso 4. false => envía al backend.

const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
] as const;

const ESPECIALES_POR_SECRETARIA: Record<string, Array<"obras" | "mantenimientodeescuelas">> = {
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS": ["obras"],
  "SECRETARÍA DE DESARROLLO HUMANO": ["mantenimientodeescuelas"],
};

// Módulos normales
type ModNormal = "servicios" | "alquiler" | "adquisicion" | "reparacion";
const MODULOS_NORMALES: Array<{ id: ModNormal; title: string; hint: string }> = [
  { id: "servicios",   title: "Servicios",   hint: "Mantenimiento o Profesionales" },
  { id: "alquiler",    title: "Alquiler",    hint: "Edificio / Maquinaria / Otros" },
  { id: "adquisicion", title: "Adquisición", hint: "Ítems a comprar (uno o muchos)" },
  { id: "reparacion",  title: "Reparación",  hint: "Maquinaria u otros" },
];

const MODULE_INTROS: Record<
  ModNormal,
  { intro: string; options?: Array<{ id: string; title: string; desc: string }> }
> = {
  servicios: {
    intro: "Cargá pedidos de servicios municipales. Elegí si es mantenimiento o profesionales.",
    options: [
      { id: "mantenimiento", title: "Mantenimiento",  desc: "Tareas de mantenimiento preventivo/correctivo." },
      { id: "profesionales", title: "Profesionales",  desc: "Ej.: arquitecto, electricista, etc." },
    ],
  },
  alquiler: {
    intro: "Pedí alquiler de bienes/servicios. Elegí la categoría adecuada.",
    options: [
      { id: "edificio",   title: "Edificio",   desc: "Alquiler de inmuebles o espacios." },
      { id: "maquinaria", title: "Maquinaria", desc: "Equipos y maquinaria (con o sin chofer/combustible)." },
      { id: "otros",      title: "Otros",      desc: "Cualquier otro elemento/servicio de alquiler." },
    ],
  },
  adquisicion: {
    intro: "Registrá ítems a comprar con descripción, cantidad y unidad. Elegí si será uno o muchos.",
    options: [
      { id: "uno",    title: "Uno",    desc: "Un único ítem (sin agregar/eliminar filas)." },
      { id: "muchos", title: "Muchos", desc: "Lista de ítems con agregar/eliminar." },
    ],
  },
  reparacion: {
    intro: "Solicitud de reparación. Elegí si es maquinaria conocida u otro elemento.",
    options: [
      { id: "maquinaria", title: "Maquinaria", desc: "Reparación de unidades de maquinaria." },
      { id: "otros",      title: "Otros",      desc: "Reparación de otros equipos/elementos." },
    ],
  },
};

/* =========================================================================
 * UI helpers
 * ========================================================================= */
function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const items = [
    { n: 1, label: "General" },
    { n: 2, label: "Especiales" },
    { n: 3, label: "Módulos" },
    { n: 4, label: "Enviar" },
  ] as const;

  return (
    <div className="flex items-center gap-3 mb-3">
      {items.map((it, i) => {
        const active = it.n === step;
        const done = it.n < step;
        return (
          <div key={it.n} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full grid place-items-center border ${
                active ? "bg-brand text-white border-brand"
                : done ? "bg-green-600 text-white border-green-600"
                : "bg-panel text-[#cfd6e6] border-[#2b3550]"}`}
              title={it.label}
            >
              {done ? <CheckCircle2 size={18} /> : it.n}
            </div>
            <div className={`text-sm ${active ? "text-white font-semibold" : "text-[#cfd6e6]"}`}>
              {it.label}
            </div>
            {i < items.length - 1 && <div className="w-10 h-px bg-[#2b3550]" />}
          </div>
        );
      })}
    </div>
  );
}

function ModuleCard({
  title, hint, active, onClick,
}: { title: string; hint: string; active: boolean; onClick: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition ${
        active ? "border-brand bg-[#171d2c]" : "border-[#2b3550] hover:border-brand/60 bg-panel"}`}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm text-[#9aa3b2]">{hint}</div>
    </button>
  );
}

function OptionCard({
  title, desc, active, onClick,
}: { title: string; desc: string; active: boolean; onClick: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition ${
        active ? "border-brand bg-[#171d2c]" : "border-[#2b3550] hover:border-brand/60 bg-panel"}`}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm text-[#9aa3b2]">{desc}</div>
    </button>
  );
}

/* =========================================================================
 * Página
 * ========================================================================= */
export default function NuevoPedidoWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // ===== Paso 1 — General =====
  const today = new Date().toISOString().slice(0, 10);
  const generalForm = useForm({
    resolver: zodResolver(generalSchema.merge(baseSchema)),
    defaultValues: {
      modulo: "general",
      secretaria: "",
      fecha_pedido: today,
      fecha_desde: today,
      fecha_hasta: today,
      presupuesto_estimado: 0,
      observaciones: "",
    } as any,
    mode: "onChange",
  });

  // Aseguramos "modulo=general" para evitar el error de Zod
  useEffect(() => {
    generalForm.setValue("modulo", "general", { shouldValidate: false });
  }, []); // once

  const secretariaSel = generalForm.watch("secretaria") as string;
  const especialesDisponibles = ESPECIALES_POR_SECRETARIA[secretariaSel] ?? [];

  // ===== Paso 2 — Especiales (se cargan aquí, pero NO se envían aún) =====
  const [quiereObras, setQuiereObras] = useState<"si" | "no" | null>(null);
  const [quiereEscuelas, setQuiereEscuelas] = useState<"si" | "no" | null>(null);
  const obrasForm = useForm({
    resolver: zodResolver(obrasSchema.merge(baseSchema)),
    defaultValues: { modulo: "obras", secretaria: "" } as any,
    mode: "onChange",
  });
  const escForm   = useForm({
    resolver: zodResolver(mantenimientodeescuelasSchema.merge(baseSchema)),
    defaultValues: { modulo: "mantenimientodeescuelas", secretaria: "" } as any,
    mode: "onChange",
  });

  // ===== Paso 3 — Módulos normales con mini-wizard =====
  type ModStage = "intro" | "choose" | "form";
  const [moduloActivo, setModuloActivo] = useState<ModNormal | null>(null);
  const [modStage, setModStage] = useState<ModStage>("intro");
  const [subchoice, setSubchoice] = useState<string | null>(null);

  const serviciosForm   = useForm({
    resolver: zodResolver(serviciosSchema.merge(baseSchema)),
    defaultValues: { modulo: "servicios", secretaria: "" } as any,
    mode: "onChange",
  });
  const alquilerForm    = useForm({
    resolver: zodResolver(alquilerSchema.merge(baseSchema)),
    defaultValues: { modulo: "alquiler", secretaria: "" } as any,
    mode: "onChange",
  });
  const adquisicionForm = useForm({
    resolver: zodResolver(adquisicionSchema.merge(baseSchema)),
    defaultValues: { modulo: "adquisicion", modo_adquisicion: "uno", secretaria: "" } as any,
    mode: "onChange",
  });
  const repForm         = useForm({
    resolver: zodResolver(reparacionSchema.merge(baseSchema)),
    defaultValues: { modulo: "reparacion", secretaria: "" } as any,
    mode: "onChange",
  });

  // 🔁 Inyectar 'secretaria' a TODOS los formularios cuando cambia
  useEffect(() => {
    const sec = secretariaSel ?? "";
    [obrasForm, escForm, serviciosForm, alquilerForm, adquisicionForm, repForm].forEach((f) =>
      f.setValue("secretaria", sec, { shouldValidate: false })
    );
  }, [secretariaSel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper para inyección al enviar
  const injectBase = (data: any) => ({
    ...data,
    secretaria: generalForm.getValues("secretaria"),
  });

  // ===== Paso 4 — Resumen / Enviar =====
  const [summary, setSummary] = useState<any | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  function openModule(m: ModNormal) {
    setModuloActivo(m);
    setModStage("intro");
    setSubchoice(null);
  }

  function advanceFromIntro() {
    if (!moduloActivo) return;
    const hasOptions = !!MODULE_INTROS[moduloActivo]?.options?.length;
    setModStage(hasOptions ? "choose" : "form");
  }

  function advanceFromChoose() {
    if (!moduloActivo) return;
    const opts = MODULE_INTROS[moduloActivo]?.options;
    if (opts?.length && !subchoice) return;

    if (moduloActivo === "servicios"   && subchoice) serviciosForm.setValue("tipo_servicio",    subchoice as any, { shouldValidate: true });
    if (moduloActivo === "alquiler"    && subchoice) alquilerForm.setValue("categoria",         subchoice as any, { shouldValidate: true });
    if (moduloActivo === "reparacion"  && subchoice) repForm.setValue("tipo_reparacion",        subchoice as any, { shouldValidate: true });
    if (moduloActivo === "adquisicion" && subchoice) adquisicionForm.setValue("modo_adquisicion", subchoice as any, { shouldValidate: true });

    setModStage("form");
  }

  // ===== Build Drafts =====
  const genIdTramite = () => {
    const y = new Date().getFullYear();
    const r = Math.floor(Math.random()*10000).toString().padStart(4,"0");
    return `EXP-${y}-${r}`;
  };

  function buildModuleDraft(mod: ModNormal) {
    const secretaria = generalForm.getValues("secretaria");
    const id_tramite = genIdTramite();

    if (mod === "servicios") {
      const v = serviciosForm.getValues() as any;
      return {
        id_tramite, modulo: "servicios", secretaria,
        payload: v.tipo_servicio === "mantenimiento"
          ? { tipo_servicio: "mantenimiento", detalle_mantenimiento: v.detalle_mantenimiento || "" }
          : { tipo_servicio: "profesionales", tipo_profesional: v.tipo_profesional || "", dia_desde: v.dia_desde || "", dia_hasta: v.dia_hasta || "" },
      };
    }
    if (mod === "alquiler") {
      const v = alquilerForm.getValues() as any;
      if (v.categoria === "maquinaria") {
        return {
          id_tramite, modulo: "alquiler", secretaria,
          payload: {
            categoria: "maquinaria",
            uso_maquinaria: v.uso_maquinaria || "",
            tipo_maquinaria: v.tipo_maquinaria || "",
            requiere_combustible: !!v.requiere_combustible,
            requiere_chofer: !!v.requiere_chofer,
            cronograma_desde: v.cronograma_desde || "",
            cronograma_hasta: v.cronograma_hasta || "",
            horas_por_dia: Number(v.horas_por_dia || 0),
          }
        };
      }
      if (v.categoria === "edificio") {
        return {
          id_tramite, modulo: "alquiler", secretaria,
          payload: { categoria: "edificio", uso_edificio: v.uso_edificio || "", ubicacion_edificio: v.ubicacion_edificio || "" }
        };
      }
      return {
        id_tramite, modulo: "alquiler", secretaria,
        payload: { categoria: "otros", que_alquilar: v.que_alquilar || "", detalle_uso: v.detalle_uso || "" }
      };
    }
    if (mod === "adquisicion") {
      const v = adquisicionForm.getValues() as any;
      return {
        id_tramite, modulo: "adquisicion", secretaria,
        payload: { proposito: v.proposito || "", modo_adquisicion: v.modo_adquisicion || "uno", items: v.items || [] }
      };
    }
    // reparacion
    const v = repForm.getValues() as any;
    if (v.tipo_reparacion === "maquinaria") {
      return {
        id_tramite, modulo: "reparacion", secretaria,
        payload: { tipo_reparacion: "maquinaria", unidad_reparar: v.unidad_reparar || "", detalle_reparacion: v.detalle_reparacion || "" }
      };
    }
    return {
      id_tramite, modulo: "reparacion", secretaria,
      payload: { tipo_reparacion: "otros", que_reparar: v.que_reparar || "", detalle_reparacion: v.detalle_reparacion || "" }
    };
  }

  function buildSummary(): any {
    const generales = generalForm.getValues();
    const especiales: Record<string, any> = {};
    if (quiereObras === "si") especiales.obras = obrasForm.getValues();
    if (quiereEscuelas === "si") especiales.mantenimientodeescuelas = escForm.getValues();

    const moduloDraft = moduloActivo ? buildModuleDraft(moduloActivo) : null;

    return {
      generales,
      especiales,
      modulo_seleccionado: moduloActivo,
      modulo_draft: moduloDraft,
    };
  }

  // Guardar del módulo → ir a Paso 4 con resumen
  async function guardarModuloYPasarAResumen() {
    if (!moduloActivo) return;

    // 1) Validar General
    generalForm.setValue("modulo", "general", { shouldValidate: false });
    const okGen = await generalForm.trigger();
    if (!okGen) {
      console.warn("Errores de validación (General):", generalForm.formState.errors);
      return;
    }

    // 2) Validar Especiales (si seleccionados)
    let okEsp = true;
    if (quiereObras === "si") {
      obrasForm.setValue("secretaria", generalForm.getValues("secretaria") ?? "", { shouldValidate: false });
      okEsp &&= await obrasForm.trigger();
    }
    if (quiereEscuelas === "si") {
      escForm.setValue("secretaria", generalForm.getValues("secretaria") ?? "", { shouldValidate: false });
      okEsp &&= await escForm.trigger();
    }
    if (!okEsp) {
      console.warn("Errores de validación (Especiales):", {
        obras: obrasForm.formState.errors,
        escuelas: escForm.formState.errors,
      });
      return;
    }

    // 3) Validar Módulo activo
    const fm =
      moduloActivo === "servicios"   ? serviciosForm :
      moduloActivo === "alquiler"    ? alquilerForm :
      moduloActivo === "adquisicion" ? adquisicionForm :
      repForm;

    fm.setValue("secretaria", generalForm.getValues("secretaria") ?? "", { shouldValidate: false });
    const ok = await fm.trigger();
    if (!ok) {
      console.warn("Errores de validación (Módulo):", fm.formState.errors);
      return;
    }

    // 4) Armar resumen y pasar al Paso 4
    const s = buildSummary();
    setSummary(s);
    setShowJson(false);
    setSentOk(false);
    setStep(4);
  }

  async function handleEnviar() {
    if (!summary || !summary.modulo_seleccionado) return;

    if (PREVIEW_MODE) {
      setShowJson(true);
      return;
    }

    try {
      setSending(true);

      // Enviar especiales si existen
      if (quiereObras === "si") {
        await createPedido(injectBase(obrasForm.getValues()) as unknown as CreatePedidoInput);
      }
      if (quiereEscuelas === "si") {
        await createPedido(injectBase(escForm.getValues()) as unknown as CreatePedidoInput);
      }

      // Enviar módulo principal
      const mod = summary.modulo_seleccionado as ModNormal;
      const fm =
        mod === "servicios"   ? serviciosForm :
        mod === "alquiler"    ? alquilerForm :
        mod === "adquisicion" ? adquisicionForm :
        repForm;

      fm.setValue("secretaria", generalForm.getValues("secretaria") ?? "", { shouldValidate: false });
      await createPedido(injectBase(fm.getValues()) as unknown as CreatePedidoInput);

      setSentOk(true);
    } catch (e) {
      console.error("Error al enviar:", e);
      alert("Ocurrió un error al enviar. Revisá la consola para más detalles.");
    } finally {
      setSending(false);
    }
  }

  /* =========================================================================
   * Render
   * ========================================================================= */
  return (
    <div className="grid gap-4">
      <Stepper step={step} />

      {/* PASO 1: General */}
      {step === 1 && (
        <FormProvider {...generalForm}>
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              generalForm.setValue("modulo", "general", { shouldValidate: false });
              const ok = await generalForm.trigger();
              if (!ok) return;
              setStep(2);
            }}
          >
            <section className="card">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-[#9aa3b2]">
                  <span>Secretaría *</span>
                  <select {...generalForm.register("secretaria")} className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2">
                    <option value="">Seleccionar...</option>
                    {SECRETARIAS.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  {generalForm.formState.errors.secretaria && (
                    <small className="text-red-400">{String(generalForm.formState.errors.secretaria.message)}</small>
                  )}
                </label>
              </div>
            </section>

            <section className="card">
              <GeneralPedidoForm />
            </section>

            <div className="flex items-center gap-2">
              <button className="btn" type="submit">
                Guardar General y seguir <ArrowRight className="inline ml-1" size={16} />
              </button>
            </div>
          </form>
        </FormProvider>
      )}

      {/* PASO 2: Especiales (se completan, pero no se envían todavía) */}
      {step === 2 && (
        <div className="grid gap-4">
          {especialesDisponibles.length === 0 ? (
            <div className="card text-[#cfd6e6]">Para la secretaría seleccionada no hay módulos especiales.</div>
          ) : (
            especialesDisponibles.map((m) => (
              <div key={m} className="card grid gap-3">
                <div className="text-base font-semibold">
                  {m === "obras" ? "¿Cargar módulo de Obras?" : "¿Cargar módulo de Mantenimiento de Escuelas?"}
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio" name={`opt-${m}`} className="accent-blue-500"
                      onChange={() => (m === "obras" ? setQuiereObras("si") : setQuiereEscuelas("si"))}
                      checked={(m === "obras" ? quiereObras : quiereEscuelas) === "si"}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio" name={`opt-${m}`} className="accent-blue-500"
                      onChange={() => (m === "obras" ? setQuiereObras("no") : setQuiereEscuelas("no"))}
                      checked={(m === "obras" ? quiereObras : quiereEscuelas) === "no"}
                    />
                    <span>No</span>
                  </label>
                </div>

                {m === "obras" && quiereObras === "si" && (
                  <FormProvider {...obrasForm}>
                    <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                      <ObrasForm />
                      <div className="text-xs text-[#9aa3b2]">
                        * Este módulo se enviará junto con el resumen final (Paso 4).
                      </div>
                    </form>
                  </FormProvider>
                )}

                {m === "mantenimientodeescuelas" && quiereEscuelas === "si" && (
                  <FormProvider {...escForm}>
                    <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                      <MantenimientoEscuelasForm />
                      <div className="text-xs text-[#9aa3b2]">
                        * Este módulo se enviará junto con el resumen final (Paso 4).
                      </div>
                    </form>
                  </FormProvider>
                )}
              </div>
            ))
          )}

          <div className="flex items-center justify-between">
            <button className="btn-ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="inline mr-1" size={16} /> Volver
            </button>
            <button className="btn" onClick={() => setStep(3)}>
              Seguir <ArrowRight className="inline ml-1" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Módulos (Intro → Choose → Form) */}
      {step === 3 && (
        <div className="grid gap-4">
          <section className="grid gap-3">
            <div className="text-base font-semibold">Seleccionar módulo</div>
            <div className="grid gap-3 md:grid-cols-4">
              {MODULOS_NORMALES.map((m) => (
                <ModuleCard
                  key={m.id}
                  title={m.title}
                  hint={m.hint}
                  active={moduloActivo === m.id}
                  onClick={() => openModule(m.id)}
                />
              ))}
            </div>
          </section>

          {moduloActivo && (
            <section className="card grid gap-4">
              {/* Intro */}
              {modStage === "intro" && (
                <div className="grid gap-3">
                  <h4 className="text-base font-semibold">
                    {MODULOS_NORMALES.find(m => m.id === moduloActivo)?.title}
                  </h4>
                  <p className="text-[#cfd6e6]">{MODULE_INTROS[moduloActivo].intro}</p>
                  <div className="flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setModuloActivo(null)}>Cerrar</button>
                    <button className="btn" onClick={advanceFromIntro}>
                      Siguiente <ArrowRight className="inline ml-1" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Choose */}
              {modStage === "choose" && (
                <div className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {(MODULE_INTROS[moduloActivo].options ?? []).map(opt => (
                      <OptionCard
                        key={opt.id}
                        title={opt.title}
                        desc={opt.desc}
                        active={subchoice === opt.id}
                        onClick={() => setSubchoice(opt.id)}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button className="btn-ghost" onClick={() => setModStage("intro")}>
                      <ArrowLeft className="inline mr-1" size={16} /> Volver
                    </button>
                    <button className="btn" onClick={advanceFromChoose} disabled={!subchoice}>
                      Siguiente <ArrowRight className="inline ml-1" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              {modStage === "form" && (
                <>
                  {moduloActivo === "servicios" && (
                    <FormProvider {...serviciosForm}>
                      <form
                        className="grid gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void guardarModuloYPasarAResumen();
                        }}
                      >
                        <ServiciosForm lockedChoice={subchoice as any} />
                        <div className="flex justify-between">
                          <button className="btn-ghost" type="button" onClick={() => setModStage(MODULE_INTROS.servicios.options ? "choose" : "intro")}>
                            <ArrowLeft className="inline mr-1" size={16} /> Volver
                          </button>
                          <button className="btn" type="submit">Guardar y seguir</button>
                        </div>
                      </form>
                    </FormProvider>
                  )}

                  {moduloActivo === "alquiler" && (
                    <FormProvider {...alquilerForm}>
                      <form
                        className="grid gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void guardarModuloYPasarAResumen();
                        }}
                      >
                        <AlquilerForm lockedChoice={subchoice as any} />
                        <div className="flex justify-between">
                          <button className="btn-ghost" type="button" onClick={() => setModStage("choose")}>
                            <ArrowLeft className="inline mr-1" size={16} /> Volver
                          </button>
                          <button className="btn" type="submit">Guardar y seguir</button>
                        </div>
                      </form>
                    </FormProvider>
                  )}

                  {moduloActivo === "adquisicion" && (
                    <FormProvider {...adquisicionForm}>
                      <form
                        className="grid gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void guardarModuloYPasarAResumen();
                        }}
                      >
                        <AdquisicionForm lockedChoice={subchoice as "uno" | "muchos"} />
                        <div className="flex justify-between">
                          <button className="btn-ghost" type="button" onClick={() => setModStage(MODULE_INTROS.adquisicion.options ? "choose" : "intro")}>
                            <ArrowLeft className="inline mr-1" size={16} /> Volver
                          </button>
                          <button className="btn" type="submit">Guardar y seguir</button>
                        </div>
                      </form>
                    </FormProvider>
                  )}

                  {moduloActivo === "reparacion" && (
                    <FormProvider {...repForm}>
                      <form
                        className="grid gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void guardarModuloYPasarAResumen();
                        }}
                      >
                        <ReparacionForm lockedChoice={subchoice as any} />
                        <div className="flex justify-between">
                          <button className="btn-ghost" type="button" onClick={() => setModStage("choose")}>
                            <ArrowLeft className="inline mr-1" size={16} /> Volver
                          </button>
                          <button className="btn" type="submit">Guardar y seguir</button>
                        </div>
                      </form>
                    </FormProvider>
                  )}
                </>
              )}
            </section>
          )}

          <div className="flex items-center justify-start">
            <button className="btn-ghost" onClick={() => setStep(2)}>
              <ArrowLeft className="inline mr-1" size={16} /> Volver
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: Resumen y Enviar */}
      {step === 4 && (
        <section className="card grid gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold">Resumen final</h4>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setShowJson(s => !s)}>
                {showJson ? "Ocultar JSON" : "Ver JSON"}
              </button>
            </div>
          </div>

          {!showJson ? (
            <>
              <div className="grid gap-2">
                <div className="text-sm font-semibold">Generales</div>
                <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary?.generales ?? {}, null, 2)}
                </pre>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold">Especiales seleccionados</div>
                <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary?.especiales ?? {}, null, 2)}
                </pre>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold">
                  Módulo: {summary?.modulo_seleccionado ? MODULOS_NORMALES.find(m => m.id === summary.modulo_seleccionado)?.title : "-"}
                </div>
                <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary?.modulo_draft ?? {}, null, 2)}
                </pre>
              </div>

              <div className="flex justify-between">
                <button className="btn-ghost" onClick={() => setStep(3)}>
                  <ArrowLeft className="inline mr-1" size={16} /> Volver a Módulos
                </button>
                <button
                  className="btn"
                  disabled={sending}
                  onClick={() => void handleEnviar()}
                >
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </div>

              {sentOk && (
                <div className="rounded-2xl border border-emerald-700 bg-emerald-900/30 p-3 text-emerald-200">
                  ¡Pedido enviado correctamente!
                </div>
              )}
            </>
          ) : (
            <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary ?? {}, null, 2)}
            </pre>
          )}
        </section>
      )}
    </div>
  );
}
