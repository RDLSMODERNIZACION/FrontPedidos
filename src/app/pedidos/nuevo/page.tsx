// src/app/pedidos/nuevo/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, CheckCircle2, Calendar, DollarSign, AlertTriangle, FileText } from "lucide-react";
import {
  baseSchema,
  generalSchema,
  obrasSchema,
  mantenimientodeescuelasSchema,
  serviciosSchema,
  alquilerSchema,
  adquisicionSchema,
  reparacionSchema,
} from "@/lib/schemas";

import { createPedidoFull, uploadAnexoObra } from "@/lib/pedidos";

import GeneralPedidoForm from "@/components/forms/modules/GeneralForm";
import ObrasForm from "@/components/forms/modules/ObrasForm";
import MantenimientoEscuelasForm from "@/components/forms/modules/MantenimientoEscuelasForm";
import ServiciosForm from "@/components/forms/modules/ServiciosForm";
import AlquilerForm from "@/components/forms/modules/AlquilerForm";
import AdquisicionForm from "@/components/forms/modules/AdquisicionForm";
import ReparacionForm from "@/components/forms/modules/ReparacionForm";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { cap, fmtMoney, fmtDate } from "@/lib/utils";

/* =========================================================================
 * Config
 * ========================================================================= */
const PREVIEW_MODE = false; // conectado al backend

type ModNormal = "servicios" | "alquiler" | "adquisicion" | "reparacion";
const MODULOS_NORMALES: Array<{ id: ModNormal; title: string; hint: string }> = [
  { id: "servicios",   title: "Servicios",   hint: "Mantenimiento o Profesionales" },
  { id: "alquiler",    title: "Alquiler",    hint: "Edificio / Maquinaria / Otros" },
  { id: "adquisicion", title: "Adquisición", hint: "Ítems a comprar (uno o muchos)" },
  { id: "reparacion",  title: "Reparación",  hint: "Maquinaria u otros" },
];

type Ambito = "ninguno" | "mantenimientodeescuelas" | "obra";
const AMBITOS: Array<{ id: Ambito; title: string; hint: string }> = [
  { id: "mantenimientodeescuelas", title: "Mantenimiento de Escuelas", hint: "Pide 'Escuela'" },
  { id: "obra",                    title: "Obra",                      hint: "Nombre + Anexo 1 (PDF)" },
  { id: "ninguno",                 title: "Ninguno",                   hint: "Sin ambiente especial" },
];

const AMBITO_INTRO: Record<Ambito, { intro: string; bullets?: string[] }> = {
  mantenimientodeescuelas: { intro: "Ambiente de Mantenimiento de Escuelas.", bullets: ["Escuela (dato único para pruebas)"] },
  obra: { intro: "Ambiente de Obra.", bullets: ["Nombre de la obra", "Anexo 1 (PDF) obligatorio"] },
  ninguno: { intro: "Sin ambiente especial. Podés continuar.", bullets: [] },
};

/* =========================================================================
 * UI helpers
 * ========================================================================= */
function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const items = [
    { n: 1, label: "General" },
    { n: 2, label: "Ambientes" },
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

function Card({
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

/* chips / kv / section */
function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 text-sm">
      <div className="text-[#9aa3b2]">{label}</div>
      <div className="text-white">{value ?? "—"}</div>
    </div>
  );
}
function Pill({ tone = "neutral", children }: { tone?: "ok" | "warn" | "neutral"; children: React.ReactNode }) {
  const tones = {
    ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    warn: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    neutral: "border-[#2e3751] bg-[#1f2636] text-[#dfe5f7]",
  } as const;
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}
function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-semibold">{title}</h4>
        {right}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

/* =========================================================================
 * Página
 * ========================================================================= */
export default function NuevoPedidoWizard() {
  const { auth } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // ===== Paso 1 — General =====
  const today = new Date().toISOString().slice(0, 10);
  const generalForm = useForm({
    resolver: zodResolver(generalSchema.merge(baseSchema)),
    defaultValues: {
      modulo: "general",
      // secretaria ya no se pide en UI: se inyecta desde el login
      fecha_pedido: today,
      fecha_desde: today,
      fecha_hasta: today,
      presupuesto_estimado: 0,
      observaciones: "",
    } as any,
    mode: "onChange",
  });

  // Inyectar secretaría desde la sesión
  useEffect(() => {
    if (auth?.user?.secretaria) {
      generalForm.setValue("secretaria", auth.user.secretaria, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  useEffect(() => {
    generalForm.setValue("modulo", "general", { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Paso 2 — Ambientes =====
  const [ambitoSelected, setAmbitoSelected] = useState<Ambito | null>(null);
  const [ambitoIncluido, setAmbitoIncluido] = useState<Ambito | null>(null);

  const obrasForm = useForm({
    resolver: zodResolver(obrasSchema.merge(baseSchema)),
    defaultValues: { modulo: "obras" } as any,
    mode: "onChange",
  });
  const escForm   = useForm({
    resolver: zodResolver(mantenimientodeescuelasSchema.merge(baseSchema)),
    defaultValues: { modulo: "mantenimientodeescuelas" } as any,
    mode: "onChange",
  });

  // ===== Paso 3 — Módulos =====
  type ModStage = "intro" | "choose" | "form";
  const [moduloActivo, setModuloActivo] = useState<ModNormal | null>(null);
  const [modStage, setModStage] = useState<ModStage>("intro");
  const [subchoice, setSubchoice] = useState<string | null>(null);

  const serviciosForm   = useForm({ resolver: zodResolver(serviciosSchema.merge(baseSchema)),   defaultValues: { modulo: "servicios" } as any, mode: "onChange" });
  const alquilerForm    = useForm({ resolver: zodResolver(alquilerSchema.merge(baseSchema)),    defaultValues: { modulo: "alquiler" } as any, mode: "onChange" });
  const adquisicionForm = useForm({ resolver: zodResolver(adquisicionSchema.merge(baseSchema)), defaultValues: { modulo: "adquisicion", modo_adquisicion: "uno" } as any, mode: "onChange" });
  const repForm         = useForm({ resolver: zodResolver(reparacionSchema.merge(baseSchema)),  defaultValues: { modulo: "reparacion" } as any, mode: "onChange" });

  // ===== Helpers =====
  function handleSelectAmbito(a: Ambito) {
    setAmbitoSelected(a);
    if (a === "ninguno") includeAmbito("ninguno");
  }
  function includeAmbito(a: Ambito) { setAmbitoIncluido(a); }
  function clearAmbito() { setAmbitoIncluido(null); }

  function openModule(m: ModNormal) { setModuloActivo(m); setModStage("intro"); setSubchoice(null); }
  function advanceFromIntro() { if (moduloActivo) setModStage("choose"); }
  function advanceFromChoose() {
    if (!moduloActivo) return;
    if (moduloActivo === "servicios"   && subchoice) serviciosForm.setValue("tipo_servicio",    subchoice as any, { shouldValidate: true });
    if (moduloActivo === "alquiler"    && subchoice) alquilerForm.setValue("categoria",         subchoice as any, { shouldValidate: true });
    if (moduloActivo === "reparacion"  && subchoice) repForm.setValue("tipo_reparacion",        subchoice as any, { shouldValidate: true });
    if (moduloActivo === "adquisicion" && subchoice) adquisicionForm.setValue("modo_adquisicion", subchoice as any, { shouldValidate: true });
    setModStage("form");
  }

  const genIdTramite = () => {
    const y = new Date().getFullYear();
    const r = Math.floor(Math.random()*10000).toString().padStart(4,"0");
    return `EXP-${y}-${r}`;
  };

  function buildModuleDraft(mod: ModNormal) {
    const secretaria = auth?.user?.secretaria ?? "";
    const id_tramite = genIdTramite();
    if (mod === "servicios") {
      const v = serviciosForm.getValues() as any;
      return { id_tramite, modulo: "servicios", secretaria,
        payload: v.tipo_servicio === "mantenimiento"
          ? { tipo_servicio: "mantenimiento", detalle_mantenimiento: v.detalle_mantenimiento || "" }
          : { tipo_servicio: "profesionales", tipo_profesional: v.tipo_profesional || "", dia_desde: v.dia_desde || "", dia_hasta: v.dia_hasta || "" } };
    }
    if (mod === "alquiler") {
      const v = alquilerForm.getValues() as any;
      if (v.categoria === "maquinaria") {
        return { id_tramite, modulo: "alquiler", secretaria,
          payload: { categoria: "maquinaria", uso_maquinaria: v.uso_maquinaria || "", tipo_maquinaria: v.tipo_maquinaria || "",
            requiere_combustible: !!v.requiere_combustible, requiere_chofer: !!v.requiere_chofer,
            cronograma_desde: v.cronograma_desde || "", cronograma_hasta: v.cronograma_hasta || "", horas_por_dia: Number(v.horas_por_dia || 0) } };
      }
      if (v.categoria === "edificio") {
        return { id_tramite, modulo: "alquiler", secretaria,
          payload: { categoria: "edificio", uso_edificio: v.uso_edificio || "", ubicacion_edificio: v.ubicacion_edificio || "" } };
      }
      return { id_tramite, modulo: "alquiler", secretaria,
        payload: { categoria: "otros", que_alquilar: v.que_alquilar || "", detalle_uso: v.detalle_uso || "" } };
    }
    if (mod === "adquisicion") {
      const v = adquisicionForm.getValues() as any;
      return { id_tramite, modulo: "adquisicion", secretaria,
        payload: { proposito: v.proposito || "", modo_adquisicion: v.modo_adquisicion || "uno", items: v.items || [] } };
    }
    const v = repForm.getValues() as any;
    if (v.tipo_reparacion === "maquinaria") {
      return { id_tramite, modulo: "reparacion", secretaria,
        payload: { tipo_reparacion: "maquinaria", unidad_reparar: v.unidad_reparar || "", detalle_reparacion: v.detalle_reparacion || "" } };
    }
    return { id_tramite, modulo: "reparacion", secretaria,
      payload: { tipo_reparacion: "otros", que_reparar: v.que_reparar || "", detalle_reparacion: v.detalle_reparacion || "" } };
  }

  // --- mapeo de ámbito UI -> enum DB (por si lo necesitás a futuro) ---
  function mapAmbitoToDb(a: Ambito | null): "general" | "obra" | "mant_escuela" {
    if (a === "obra") return "obra";
    if (a === "mantenimientodeescuelas") return "mant_escuela";
    return "general"; // 'ninguno'
  }

  function buildFullPayload(): any {
    const g = generalForm.getValues();

    // Enviar el valor de UI tal cual espera FastAPI
    const tipoUi: "ninguno" | "obra" | "mantenimientodeescuelas" =
      ambitoIncluido ?? "ninguno";

    // Ámbito
    let ambito: any = { tipo: tipoUi };
    if (tipoUi === "mantenimientodeescuelas") {
      const v = escForm.getValues() as any;
      ambito.escuelas = { escuela: v.escuela };
    } else if (tipoUi === "obra") {
      const v = obrasForm.getValues() as any;
      ambito.obra = { obra_nombre: v.obra_nombre };
    }

    // Módulo
    let modulo: any = null;
    if (moduloActivo === "servicios") {
      const v = serviciosForm.getValues() as any;
      modulo = {
        tipo: "servicios",
        tipo_servicio: v.tipo_servicio,
        detalle_mantenimiento: v.detalle_mantenimiento || null,
        tipo_profesional: v.tipo_profesional || null,
        dia_desde: v.dia_desde || null,
        dia_hasta: v.dia_hasta || null,
      };
    } else if (moduloActivo === "alquiler") {
      const v = alquilerForm.getValues() as any;
      modulo = {
        tipo: "alquiler",
        categoria: v.categoria,
        uso_edificio: v.uso_edificio || null,
        ubicacion_edificio: v.ubicacion_edificio || null,
        uso_maquinaria: v.uso_maquinaria || null,
        tipo_maquinaria: v.tipo_maquinaria || null,
        requiere_combustible: !!v.requiere_combustible,
        requiere_chofer: !!v.requiere_chofer,
        cronograma_desde: v.cronograma_desde || null,
        cronograma_hasta: v.cronograma_hasta || null,
        horas_por_dia: v.horas_por_dia ? Number(v.horas_por_dia) : null,
        que_alquilar: v.que_alquilar || null,
        detalle_uso: v.detalle_uso || null,
      };
    } else if (moduloActivo === "adquisicion") {
      const v = adquisicionForm.getValues() as any;
      modulo = {
        tipo: "adquisicion",
        proposito: v.proposito || null,
        modo_adquisicion: v.modo_adquisicion || "uno",
        items: (v.items || []).map((it: any) => ({
          descripcion: it.descripcion,
          cantidad: it.cantidad ?? 1,
          unidad: it.unidad || null,
          precio_unitario: it.precio_unitario ?? null,
        })),
      };
    } else if (moduloActivo === "reparacion") {
      const v = repForm.getValues() as any;
      modulo = {
        tipo: "reparacion",
        tipo_reparacion: v.tipo_reparacion,
        unidad_reparar: v.unidad_reparar || null,
        que_reparar: v.que_reparar || null,
        detalle_reparacion: v.detalle_reparacion || null,
      };
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const generales = {
      secretaria: auth?.user?.secretaria ?? g.secretaria,
      estado: g.estado ?? "enviado",
      fecha_pedido: g.fecha_pedido ?? hoy,
      fecha_desde: g.fecha_desde || null,
      fecha_hasta: g.fecha_hasta || null,
      presupuesto_estimado: g.presupuesto_estimado || null,
      observaciones: g.observaciones || null,
      created_by_username: auth?.user.username ?? undefined,
    };

    return { generales, ambito, modulo };
  }

  // ====== State del resumen ======
  const [summary, setSummary] = useState<any | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  // -------- Paso 3: Guardar y seguir ----------
  async function guardarModuloYPasarAResumen() {
    if (!moduloActivo) return;

    generalForm.setValue("modulo", "general", { shouldValidate: false });
    if (auth?.user?.secretaria) {
      generalForm.setValue("secretaria", auth.user.secretaria, { shouldValidate: true });
    }
    const okGen = await generalForm.trigger();
    if (!okGen && !PREVIEW_MODE) return;

    const s = {
      generales: { ...generalForm.getValues(), secretaria: auth?.user?.secretaria ?? generalForm.getValues("secretaria") },
      especiales: {
        ...(ambitoIncluido === "obra" ? { obra: obrasForm.getValues() } : {}),
        ...(ambitoIncluido === "mantenimientodeescuelas" ? { mantenimientodeescuelas: escForm.getValues() } : {}),
      },
      modulo_seleccionado: moduloActivo,
      modulo_draft: buildModuleDraft(moduloActivo),
      ambitoIncluido,
    };

    setSummary(s);
    setShowJson(false);
    setSentOk(false);
    setStep(4);
  }

  async function handleEnviar() {
    if (!summary || !summary.modulo_seleccionado) return;

    const payload = buildFullPayload();

    if (PREVIEW_MODE) {
      setShowJson(true);
      setSummary((s: any) => ({ ...s, payload }));
      return;
    }

    try {
      setSending(true);

      const created = await createPedidoFull(payload);

      if (ambitoIncluido === "obra") {
        const fList = (obrasForm.getValues() as any)?.anexo1_pdf as FileList | undefined;
        const file = fList?.[0];
        if (file) await uploadAnexoObra(created.pedido_id, file);
      }

      setSentOk(true);
      setShowJson(true);
      setSummary((s: any) => ({ ...s, created, payload }));
    } catch (e: any) {
      console.error("Error al enviar:", e);
      alert(e?.message ?? "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  /* =========================================================================
   * Render
   * ========================================================================= */
  return (
    <RequireAuth>
      <div className="grid gap-4">
        <Stepper step={step} />

        {/* PASO 1: General (sin pedir secretaría) */}
        {step === 1 && (
          <FormProvider {...generalForm}>
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                generalForm.setValue("modulo", "general", { shouldValidate: false });
                if (auth?.user?.secretaria) {
                  generalForm.setValue("secretaria", auth.user.secretaria, { shouldValidate: true });
                }
                const ok = await generalForm.trigger();
                if (!ok && !PREVIEW_MODE) return;
                setStep(2);
              }}
            >
              <section className="card">
                <div className="text-sm text-[#9aa3b2]">
                  Secretaría: <strong>{auth?.user?.secretaria ?? "—"}</strong>
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

        {/* PASO 2: Ambientes */}
        {step === 2 && (
          <div className="grid gap-4">
            <section className="grid gap-3">
              <div className="text-base font-semibold">Seleccionar ambiente</div>
              <div className="grid gap-3 md:grid-cols-3">
                {AMBITOS.map((a) => (
                  <Card
                    key={a.id}
                    title={a.title}
                    hint={a.hint}
                    active={ambitoSelected === a.id}
                    onClick={() => handleSelectAmbito(a.id)}
                  />
                ))}
              </div>
            </section>

            {ambitoSelected && (
              <section className="card grid gap-3">
                <div className="text-base font-semibold">
                  {AMBITOS.find(x => x.id === ambitoSelected)?.title}
                </div>

                {(ambitoIncluido === ambitoSelected || ambitoSelected === "ninguno") ? (
                  <>
                    {ambitoSelected === "mantenimientodeescuelas" && (
                      <FormProvider {...escForm}>
                        <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                          <MantenimientoEscuelasForm />
                        </form>
                      </FormProvider>
                    )}
                    {ambitoSelected === "obra" && (
                      <FormProvider {...obrasForm}>
                        <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                          <ObrasForm />
                        </form>
                      </FormProvider>
                    )}
                    {ambitoSelected === "ninguno" && (
                      <div className="text-[#9aa3b2]">Sin datos adicionales. Podés continuar.</div>
                    )}
                    <div className="flex gap-2 justify-end">
                      {ambitoSelected !== "ninguno" && (
                        <button className="btn-ghost" onClick={clearAmbito}>Quitar</button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[#cfd6e6]">{AMBITO_INTRO[ambitoSelected].intro}</p>
                    {!!AMBITO_INTRO[ambitoSelected].bullets?.length && (
                      <ul className="list-disc pl-5 text-[#9aa3b2]">
                        {AMBITO_INTRO[ambitoSelected].bullets!.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    )}
                    <div className="flex gap-2 justify-end">
                      {/* Aquí TypeScript ya sabe que NO es "ninguno", así que no ponemos condición */}
                      <button className="btn" onClick={() => includeAmbito(ambitoSelected!)}>Incluir</button>
                    </div>
                  </>
                )}
              </section>
            )}

            <div className="flex items-center justify-between">
              <button className="btn-ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="inline mr-1" size={16} /> Volver
              </button>
              <button
                className="btn"
                onClick={() => setStep(3)}
                disabled={!(ambitoIncluido || ambitoSelected === "ninguno")}
                title={!(ambitoIncluido || ambitoSelected === "ninguno") ? "Incluí un ambiente o elegí 'Ninguno'" : ""}
              >
                Seguir <ArrowRight className="inline ml-1" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Módulos */}
        {step === 3 && (
          <div className="grid gap-4">
            <section className="grid gap-3">
              <div className="text-base font-semibold">Seleccionar módulo</div>
              <div className="grid gap-3 md:grid-cols-4">
                {MODULOS_NORMALES.map((m) => (
                  <Card
                    key={m.id}
                    title={m.title}
                    hint={m.hint}
                    active={moduloActivo === m.id}
                    onClick={() => (openModule(m.id))}
                  />
                ))}
              </div>
            </section>

            {moduloActivo && (
              <section className="card grid gap-4">
                {modStage === "intro" && (
                  <div className="grid gap-3">
                    <h4 className="text-base font-semibold">
                      {MODULOS_NORMALES.find(m => m.id === moduloActivo)?.title}
                    </h4>
                    <p className="text-[#cfd6e6]">
                      {({
                        servicios: "Cargá servicios: mantenimiento o profesionales.",
                        alquiler: "Pedí alquiler: edificio, maquinaria u otros.",
                        adquisicion: "Cargá ítems a comprar.",
                        reparacion: "Solicitud de reparación de equipos/unidades."
                      } as Record<ModNormal,string>)[moduloActivo]}
                    </p>
                    <div className="flex justify-end gap-2">
                      <button className="btn-ghost" onClick={() => setModuloActivo(null)}>Cerrar</button>
                      <button className="btn" onClick={advanceFromIntro}>
                        Siguiente <ArrowRight className="inline ml-1" size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {modStage === "choose" && (
                  <div className="grid gap-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {(
                        {
                          servicios: [
                            { id: "mantenimiento", title: "Mantenimiento", desc: "Preventivo/Correctivo" },
                            { id: "profesionales", title: "Profesionales", desc: "Arquitecto, electricista, etc." },
                          ],
                          alquiler: [
                            { id: "edificio", title: "Edificio", desc: "Inmuebles / espacios" },
                            { id: "maquinaria", title: "Maquinaria", desc: "Equipos con/sin chofer" },
                            { id: "otros", title: "Otros", desc: "Resto de alquileres" },
                          ],
                          adquisicion: [
                            { id: "uno", title: "Uno", desc: "Un solo ítem" },
                            { id: "muchos", title: "Muchos", desc: "Lista de ítems" },
                          ],
                          reparacion: [
                            { id: "maquinaria", title: "Maquinaria", desc: "Unidades conocidas" },
                            { id: "otros", title: "Otros", desc: "Otros elementos" },
                          ],
                        } as Record<ModNormal, Array<{id:string;title:string;desc:string}>>
                      )[moduloActivo].map(opt => (
                        <Card
                          key={opt.id}
                          title={opt.title}
                          hint={opt.desc}
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

                {modStage === "form" && (
                  <>
                    {moduloActivo === "servicios" && (
                      <FormProvider {...serviciosForm}>
                        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void guardarModuloYPasarAResumen(); }}>
                          <ServiciosForm lockedChoice={subchoice as any} />
                          <div className="flex justify-between">
                            <button className="btn-ghost" type="button" onClick={() => setModStage("choose")}>
                              <ArrowLeft className="inline mr-1" size={16} /> Volver
                            </button>
                            <button className="btn" type="submit">Guardar y seguir</button>
                          </div>
                        </form>
                      </FormProvider>
                    )}
                    {moduloActivo === "alquiler" && (
                      <FormProvider {...alquilerForm}>
                        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void guardarModuloYPasarAResumen(); }}>
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
                        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void guardarModuloYPasarAResumen(); }}>
                          <AdquisicionForm lockedChoice={subchoice as "uno" | "muchos"} />
                          <div className="flex justify-between">
                            <button className="btn-ghost" type="button" onClick={() => setModStage("choose")}>
                              <ArrowLeft className="inline mr-1" size={16} /> Volver
                            </button>
                            <button className="btn" type="submit">Guardar y seguir</button>
                          </div>
                        </form>
                      </FormProvider>
                    )}
                    {moduloActivo === "reparacion" && (
                      <FormProvider {...repForm}>
                        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void guardarModuloYPasarAResumen(); }}>
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

        {/* PASO 4: Resumen / Enviar */}
        {step === 4 && (() => {
          // ===== Resumen y validaciones =====
          const g = summary?.generales ?? {};
          const amb = summary?.ambitoIncluido ?? "ninguno";
          const modSel = summary?.modulo_seleccionado ?? "-";
          const draft = summary?.modulo_draft ?? {};
          const obraFormVals = (obrasForm.getValues?.() as any) || {};
          const anexoObraOk = amb === "obra" ? Boolean(obraFormVals?.anexo1_pdf?.[0]) : true;

          const itemsAdq = draft?.payload?.items ?? [];
          const hasItemsAdq = Array.isArray(itemsAdq) && itemsAdq.length > 0;

          const canSend =
            (!!modSel) &&
            (amb !== "obra" || anexoObraOk) &&
            (modSel !== "adquisicion" || hasItemsAdq);

          return (
            <div className="grid gap-4">
              {/* Encabezado + chips */}
              <section className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Resumen final</h3>
                  <div className="flex gap-2">
                    <button className="btn-ghost" onClick={() => setShowJson((s) => !s)}>
                      {showJson ? "Ocultar JSON" : "Ver JSON"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Pill><strong>Secretaría:</strong>&nbsp;{g.secretaria ?? "—"}</Pill>
                  <Pill><strong>Ámbito:</strong>&nbsp;{amb}</Pill>
                  <Pill><strong>Módulo:</strong>&nbsp;{modSel}</Pill>
                  {amb === "obra" && (
                    <Pill tone={anexoObraOk ? "ok" : "warn"}>
                      {anexoObraOk ? (
                        <> <CheckCircle2 size={14} className="inline mr-1" /> Anexo 1 </>
                      ) : (
                        <> <AlertTriangle size={14} className="inline mr-1" /> Anexo 1 pendiente </>
                      )}
                    </Pill>
                  )}
                  {modSel === "adquisicion" && (
                    <Pill tone={hasItemsAdq ? "ok" : "warn"}>
                      {hasItemsAdq ? `${itemsAdq.length} ítem(s)` : "Sin ítems"}
                    </Pill>
                  )}
                </div>
              </section>

              {/* Dos columnas: Generales + Ambito / Módulo */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Generales */}
                <Section
                  title="Generales"
                  right={
                    <button className="btn-ghost" onClick={() => setStep(1)} title="Editar generales">
                      Editar
                    </button>
                  }
                >
                  <KV label="Fecha del pedido" value={<><Calendar size={14} className="inline mr-1" /> {fmtDate(g.fecha_pedido)}</>} />
                  <KV label="Desde / Hasta" value={`${fmtDate(g.fecha_desde)} · ${fmtDate(g.fecha_hasta)}`} />
                  <KV label="Presupuesto est." value={<><DollarSign size={14} className="inline mr-1" /> {fmtMoney(g.presupuesto_estimado)}</>} />
                  <KV label="Observaciones" value={g.observaciones || <span className="text-[#9aa3b2]">—</span>} />
                </Section>

                {/* Ámbito */}
                <Section
                  title="Ámbito"
                  right={
                    <button className="btn-ghost" onClick={() => setStep(2)} title="Editar ámbito">
                      Editar
                    </button>
                  }
                >
                  {amb === "ninguno" && <div className="text-sm text-[#9aa3b2]">Sin datos adicionales.</div>}
                  {amb === "mantenimientodeescuelas" && (
                    <>
                      <KV label="Tipo" value="Mantenimiento de Escuelas" />
                      <KV label="Escuela" value={summary?.especiales?.mantenimientodeescuelas?.escuela ?? "—"} />
                    </>
                  )}
                  {amb === "obra" && (
                    <>
                      <KV label="Tipo" value="Obra" />
                      <KV label="Nombre de la obra" value={summary?.especiales?.obra?.obra_nombre ?? "—"} />
                      <KV
                        label="Anexo 1 (PDF)"
                        value={
                          anexoObraOk
                            ? <span className="text-emerald-300 flex items-center gap-1"><CheckCircle2 size={14}/> OK</span>
                            : <span className="text-amber-300 flex items-center gap-1"><AlertTriangle size={14}/> Pendiente</span>
                        }
                      />
                    </>
                  )}
                </Section>

                {/* Módulo */}
                <Section
                  title={`Módulo: ${modSel}`}
                  right={
                    <button className="btn-ghost" onClick={() => setStep(3)} title="Editar módulo">
                      Editar
                    </button>
                  }
                >
                  {modSel === "servicios" && (
                    <>
                      <KV label="Tipo de servicio" value={draft?.payload?.tipo_servicio} />
                      {draft?.payload?.tipo_servicio === "mantenimiento" && (
                        <KV label="Detalle" value={draft?.payload?.detalle_mantenimiento || "—"} />
                      )}
                      {draft?.payload?.tipo_servicio === "profesionales" && (
                        <>
                          <KV label="Tipo profesional" value={draft?.payload?.tipo_profesional || "—"} />
                          <KV label="Días" value={`${draft?.payload?.dia_desde ?? "—"} · ${draft?.payload?.dia_hasta ?? "—"}`} />
                        </>
                      )}
                    </>
                  )}

                  {modSel === "alquiler" && (
                    <>
                      <KV label="Categoría" value={draft?.payload?.categoria} />
                      {draft?.payload?.categoria === "edificio" && (
                        <>
                          <KV label="Uso" value={draft?.payload?.uso_edificio || "—"} />
                          <KV label="Ubicación" value={draft?.payload?.ubicacion_edificio || "—"} />
                        </>
                      )}
                      {draft?.payload?.categoria === "maquinaria" && (
                        <>
                          <KV label="Uso" value={draft?.payload?.uso_maquinaria || "—"} />
                          <KV label="Tipo" value={draft?.payload?.tipo_maquinaria || "—"} />
                          <KV label="Combustible / Chofer" value={`${draft?.payload?.requiere_combustible ? "Sí" : "No"} · ${draft?.payload?.requiere_chofer ? "Sí" : "No"}`} />
                          <KV label="Cronograma" value={`${draft?.payload?.cronograma_desde ?? "—"} · ${draft?.payload?.cronograma_hasta ?? "—"}`} />
                          <KV label="Horas por día" value={draft?.payload?.horas_por_dia ?? "—"} />
                        </>
                      )}
                      {draft?.payload?.categoria === "otros" && (
                        <>
                          <KV label="Qué alquilar" value={draft?.payload?.que_alquilar || "—"} />
                          <KV label="Detalle de uso" value={draft?.payload?.detalle_uso || "—"} />
                        </>
                      )}
                    </>
                  )}

                  {modSel === "adquisicion" && (
                    <>
                      <KV label="Propósito" value={draft?.payload?.proposito || "—"} />
                      <KV label="Modo" value={draft?.payload?.modo_adquisicion || "—"} />
                      <div className="mt-1 rounded-xl border border-[#2b3550] overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="text-[#9aa3b2] bg-white/5">
                            <tr>
                              <th className="text-left px-3 py-2">Descripción</th>
                              <th className="text-right px-3 py-2">Cantidad</th>
                              <th className="text-left px-3 py-2">Unidad</th>
                              <th className="text-right px-3 py-2">Precio unit.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1b2132]">
                            {hasItemsAdq ? itemsAdq.map((it: any, i: number) => (
                              <tr key={i}>
                                <td className="px-3 py-2">{it.descripcion}</td>
                                <td className="px-3 py-2 text-right">{it.cantidad ?? 1}</td>
                                <td className="px-3 py-2">{it.unidad ?? "—"}</td>
                                <td className="px-3 py-2 text-right">{it.precio_unitario != null ? fmtMoney(it.precio_unitario) : "—"}</td>
                              </tr>
                            )) : (
                              <tr><td className="px-3 py-3 text-[#9aa3b2]" colSpan={4}>Sin ítems cargados.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {modSel === "reparacion" && (
                    <>
                      <KV label="Tipo reparación" value={draft?.payload?.tipo_reparacion} />
                      {draft?.payload?.tipo_reparacion === "maquinaria" ? (
                        <>
                          <KV label="Unidad a reparar" value={draft?.payload?.unidad_reparar || "—"} />
                          <KV label="Detalle" value={draft?.payload?.detalle_reparacion || "—"} />
                        </>
                      ) : (
                        <>
                          <KV label="Qué reparar" value={draft?.payload?.que_reparar || "—"} />
                          <KV label="Detalle" value={draft?.payload?.detalle_reparacion || "—"} />
                        </>
                      )}
                    </>
                  )}
                </Section>
              </div>

              {/* JSON alternativo */}
              {showJson && (
                <section className="card">
                  <pre className="text-xs bg-[#0b1020] p-3 rounded-2xl overflow-auto">
{JSON.stringify(summary ?? {}, null, 2)}
                  </pre>
                </section>
              )}

              {/* Barra de acciones sticky */}
              <div className="sticky bottom-3 z-20">
                <div className="card flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="text-sm text-[#9aa3b2] flex items-center gap-2">
                    <FileText size={16} />
                    {canSend ? "Listo para enviar" : "Faltan completar requisitos antes de enviar"}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost" onClick={() => setStep(3)}>
                      Volver a Módulos
                    </button>
                    <button className="btn" disabled={!canSend || sending} onClick={() => void handleEnviar()}>
                      {sending ? "Enviando…" : "Enviar"}
                    </button>
                  </div>
                </div>
              </div>

              {sentOk && (
                <div className="rounded-2xl border border-emerald-700 bg-emerald-900/30 p-3 text-emerald-200">
                  ¡Pedido enviado correctamente!
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </RequireAuth>
  );
}
