// src/app/pedidos/nuevo/useWizard.ts
'use client';

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
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
import { API_BASE, authHeaders } from "@/lib/api";
import { uploadArchivo } from "@/lib/archivos";
import type { Ambito, ModNormal, ModStage, Step } from "./constants";
import { PREVIEW_MODE, DELAY_MS } from "./constants";

/**
 * Hook principal del wizard de "Nuevo Pedido".
 * Arma SIEMPRE el payload v2 que espera el backend (y compat legacy).
 */
export function useWizard() {
  // Unificación de contexto de auth (soporta {auth:{user,token}} o {user,token})
  const ctx = useAuth() as any;
  const auth = ctx?.auth ?? ctx;

  const [step, setStep] = useState<Step>(1);

  // ===== Paso 1 — General =====
  const today = new Date().toISOString().slice(0, 10);
  const generalForm = useForm({
    resolver: zodResolver(generalSchema.merge(baseSchema)),
    defaultValues: {
      modulo: "general",
      fecha_pedido: today,
      fecha_desde: today,
      fecha_hasta: today,
      presupuesto_estimado: 0,
      observaciones: "",
    } as any,
    mode: "onChange",
  });

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

  // ===== Paso 2 — Ámbitos =====
  const [ambitoSelected, setAmbitoSelected] = useState<Ambito | null>(null);
  const [ambitoIncluido, setAmbitoIncluido] = useState<Ambito | null>(null);

  const obrasForm = useForm({
    resolver: zodResolver(obrasSchema),
    defaultValues: { modulo: "obras" } as any,
    mode: "onChange",
  });
  const escForm = useForm({
    resolver: zodResolver(mantenimientodeescuelasSchema),
    defaultValues: { modulo: "mantenimientodeescuelas" } as any,
    mode: "onChange",
  });

  // ===== Paso 3 — Módulos =====
  const [moduloActivo, setModuloActivo] = useState<ModNormal | null>(null);
  const [modStage, setModStage] = useState<ModStage>("intro");
  const [subchoice, setSubchoice] = useState<string | null>(null);

  const serviciosForm = useForm({
    resolver: zodResolver(serviciosSchema.merge(baseSchema)),
    defaultValues: { modulo: "servicios" } as any,
    mode: "onChange",
  });
  const alquilerForm = useForm({
    resolver: zodResolver(alquilerSchema.merge(baseSchema)),
    defaultValues: { modulo: "alquiler" } as any,
    mode: "onChange",
  });
  const adquisicionForm = useForm({
    resolver: zodResolver(adquisicionSchema.merge(baseSchema)),
    defaultValues: { modulo: "adquisicion", modo_adquisicion: "uno" } as any,
    mode: "onChange",
  });
  const repForm = useForm({
    resolver: zodResolver(reparacionSchema.merge(baseSchema)),
    defaultValues: {
      modulo: "reparacion",
      tipo_reparacion: "maquinaria",
      items: [{ unidad_nro: undefined, detalle: "" }],
    } as any,
    mode: "onChange",
  });

  // ===== Helpers UI =====
  function handleSelectAmbito(a: Ambito) {
    setAmbitoSelected(a);
    if (a === "ninguno") includeAmbito("ninguno");
  }
  function includeAmbito(a: Ambito) {
    setAmbitoIncluido(a);
  }
  function clearAmbito() {
    setAmbitoIncluido(null);
  }
  function openModule(m: ModNormal) {
    setModuloActivo(m);
    setModStage("intro");
    setSubchoice(null);
  }
  function advanceFromIntro() {
    if (moduloActivo) setModStage("choose");
  }
  function advanceFromChoose() {
    if (!moduloActivo) return;
    if (moduloActivo === "servicios" && subchoice)
      serviciosForm.setValue("tipo_servicio", subchoice as any, { shouldValidate: true });
    if (moduloActivo === "alquiler" && subchoice)
      alquilerForm.setValue("categoria", subchoice as any, { shouldValidate: true });
    if (moduloActivo === "reparacion" && subchoice)
      repForm.setValue("tipo_reparacion", subchoice as any, { shouldValidate: true });
    if (moduloActivo === "adquisicion" && subchoice)
      adquisicionForm.setValue("modo_adquisicion", subchoice as any, { shouldValidate: true });
    setModStage("form");
  }

  // ===== Draft del módulo (v2: { modulo, payload }) =====
  function buildModuleDraft(mod: ModNormal) {
    if (mod === "servicios") {
      const v = serviciosForm.getValues() as any;
      if (v.tipo_servicio === "profesionales") {
        return {
          modulo: "servicios",
          payload: {
            tipo_profesional: v.tipo_profesional ?? null,
            dia_desde: v.dia_desde ?? null,
            dia_hasta: v.dia_hasta ?? null,
          },
        };
      }
      return {
        modulo: "servicios",
        payload: {
          servicio_requerido: v.servicio_requerido ?? "",
          destino_servicio: v.destino_servicio ?? null,
        },
      };
    }

    if (mod === "alquiler") {
      const v = alquilerForm.getValues() as any;
      if (v.categoria === "maquinaria") {
        return {
          modulo: "alquiler",
          payload: {
            categoria: "maquinaria",
            uso_maquinaria: v.uso_maquinaria ?? null,
            tipo_maquinaria: v.tipo_maquinaria ?? null,
            requiere_combustible: !!v.requiere_combustible,
            requiere_chofer: !!v.requiere_chofer,
            cronograma_desde: v.cronograma_desde ?? null,
            cronograma_hasta: v.cronograma_hasta ?? null,
            horas_por_dia: Number(v.horas_por_dia ?? 0),
          },
        };
      }
      if (v.categoria === "edificio") {
        return {
          modulo: "alquiler",
          payload: {
            categoria: "edificio",
            uso_edificio: v.uso_edificio ?? null,
            ubicacion_edificio: v.ubicacion_edificio ?? null,
          },
        };
      }
      return {
        modulo: "alquiler",
        payload: {
          categoria: "otros",
          que_alquilar: v.que_alquilar ?? null,
          detalle_uso: v.detalle_uso ?? null,
        },
      };
    }

    if (mod === "adquisicion") {
      const v = adquisicionForm.getValues() as any;
      return {
        modulo: "adquisicion",
        payload: {
          proposito: v.proposito ?? null,
          modo_adquisicion: v.modo_adquisicion ?? "uno",
          items: (v.items || []).map((it: any) => ({
            descripcion: it.descripcion,
            cantidad: Number(it.cantidad ?? 1),
            unidad: it.unidad ?? null,
            precio_unitario: it.precio_unitario != null ? Number(it.precio_unitario) : null,
          })),
        },
      };
    }

    // reparacion
    const v = repForm.getValues() as any;
    if (v.tipo_reparacion === "maquinaria") {
      const items = Array.isArray(v.items) ? v.items : [];
      const picks = items
        .map((it: any) => (it?.unidad_nro != null ? `UNIDAD ${it.unidad_nro}` : null))
        .filter(Boolean);
      const dets = items
        .map((it: any) => (it?.detalle ? String(it.detalle).trim() : ""))
        .filter((s: string) => s.length > 0);

      return {
        modulo: "reparacion",
        payload: {
          tipo_reparacion: "maquinaria",
          unidad_reparar: picks.length ? picks.join(", ") : null,
          detalle_reparacion: dets.length ? dets.join(" | ") : null,
          items,
        },
      };
    }
    return {
      modulo: "reparacion",
      payload: {
        tipo_reparacion: "otros",
        que_reparar: v.que_reparar ?? null,
        detalle_reparacion: v.detalle_reparacion ?? null,
      },
    };
  }

  // ===== Compat: duplicar claves planas que el backend actual espera
  function normalizeAmbitoCompat(payload: any) {
    const out = { ...payload, especiales: { ...(payload?.especiales ?? {}) } };

    if (payload?.ambitoIncluido === "mantenimientodeescuelas") {
      const esc =
        payload?.ambito?.payload?.escuela ??
        payload?.especiales?.mantenimientodeescuelas?.escuela ??
        payload?.especiales?.escuela;
      if (esc) out.especiales.escuela = esc; // clave plana legacy
    }

    if (payload?.ambitoIncluido === "obra") {
      const obraNombre =
        payload?.ambito?.payload?.obra_nombre ??
        payload?.especiales?.obra?.obra_nombre ??
        payload?.especiales?.obra_nombre;
      if (obraNombre) out.especiales.obra_nombre = obraNombre; // clave plana legacy
    }

    return out;
  }

  // ===== Payload final v2 =====
  function buildFullPayload(): any {
    const g = generalForm.getValues();

    const hoy = new Date().toISOString().slice(0, 10);
    const generales = {
      secretaria: auth?.user?.secretaria ?? g.secretaria,
      estado: g.estado ?? "enviado",
      fecha_pedido: g.fecha_pedido ?? hoy,
      fecha_desde: g.fecha_desde || null,
      fecha_hasta: g.fecha_hasta || null,
      presupuesto_estimado: g.presupuesto_estimado ?? null,
      observaciones: g.observaciones ?? null,
      created_by_username: auth?.user?.username ?? undefined,
    };

    const tipoUi: "ninguno" | "obra" | "mantenimientodeescuelas" =
      (ambitoIncluido ?? "ninguno") as any;

    let ambito: { tipo: string; payload: Record<string, any> } | null = null;
    const especiales: Record<string, any> = {};

    if (tipoUi === "mantenimientodeescuelas") {
      const v = escForm.getValues() as any;
      const escuela = (v?.escuela ?? "").trim();
      if (escuela) {
        ambito = { tipo: "mantenimientodeescuelas", payload: { escuela } };
        especiales.mantenimientodeescuelas = { escuela }; // anidado
        especiales.escuela = escuela;                     // plana
      }
    } else if (tipoUi === "obra") {
      const v = obrasForm.getValues() as any;
      const obra_nombre = (v?.obra_nombre ?? "").trim();
      if (obra_nombre) {
        ambito = { tipo: "obra", payload: { obra_nombre } };
        especiales.obra = { obra_nombre };                // anidado
        especiales.obra_nombre = obra_nombre;             // plana
      }
    }

    const draft = moduloActivo ? buildModuleDraft(moduloActivo) : null;

    return {
      generales,
      ambitoIncluido: tipoUi,
      ambito,
      especiales,
      modulo_seleccionado: moduloActivo,
      modulo_draft: draft,
    };
  }

  // ===== Resumen / Envío =====
  const [summary, setSummary] = useState<any | null>(null);
  const [showJson, setShowJson] = useState(false);

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backendDone, setBackendDone] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  useEffect(() => {
    if (!sending) return;
    setProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / DELAY_MS) * 100));
      setProgress(pct);
      if (elapsed >= DELAY_MS) {
        clearInterval(id);
        setSending(false);
        setProgress(100);
        setStep(5); // Finalizar
      }
    }, 120);
    return () => clearInterval(id);
  }, [sending]);

  // -------- Paso 3: Guardar y seguir ----------
  async function guardarModuloYPasarAResumen() {
    if (!moduloActivo) return;

    const okGen = await generalForm.trigger();
    if (!okGen && !PREVIEW_MODE) return;

    const tipoUi: Ambito | null = ambitoIncluido;
    if (tipoUi === "mantenimientodeescuelas") {
      const ok = await escForm.trigger();
      if (!ok && !PREVIEW_MODE) return;
    }
    if (tipoUi === "obra") {
      const ok = await obrasForm.trigger();
      if (!ok && !PREVIEW_MODE) return;
    }

    const s = buildFullPayload();
    setSummary(s);
    setShowJson(false);
    setStep(4);
  }

  async function handleEnviar() {
    // ⚠️ SIEMPRE reconstruimos snapshot desde formularios (no confiamos en `summary`)
    let payload = buildFullPayload();
    payload = normalizeAmbitoCompat(payload);

    if (!payload?.modulo_seleccionado || !payload?.modulo_draft) return;

    if (PREVIEW_MODE) {
      setShowJson(false);
      setSendError(null);
      setBackendDone(true);
      setCreatedResult({ simulated: true });
      setSending(true);
      return;
    }

    setSendError(null);
    setBackendDone(false);
    setCreatedResult(null);
    setSending(true);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/pedidos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...authHeaders(auth?.token),
          },
          cache: "no-store",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
        const created = await res.json();

        if (payload.ambitoIncluido === "obra") {
          const fList = (obrasForm.getValues() as any)?.anexo1_pdf as FileList | undefined;
          const file = fList?.[0];
          if (file) {
            await uploadArchivo(created.pedido_id, "anexo1_obra", file);
          }
        }

        setCreatedResult(created);
        setBackendDone(true);
      } catch (e: any) {
        setSendError(e?.message ?? "Error al enviar");
        setBackendDone(true);
      }
    })();
  }

  return {
    // stepper
    step, setStep,
    // auth
    auth,
    // forms
    generalForm, obrasForm, escForm, serviciosForm, alquilerForm, adquisicionForm, repForm,
    // ámbitos
    ambitoSelected, ambitoIncluido, handleSelectAmbito, includeAmbito, clearAmbito,
    // módulos
    moduloActivo, modStage, subchoice, openModule, advanceFromIntro, advanceFromChoose, setModStage, setSubchoice,
    // resumen / envío
    summary, setSummary, showJson, setShowJson,
    sending, setSending, progress, backendDone, sendError, createdResult,
    // acciones
    guardarModuloYPasarAResumen, handleEnviar,
  };
}
