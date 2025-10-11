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
import { createPedidoFull, uploadAnexo } from "@/lib/pedidos";
import type { Ambito, ModNormal, ModStage, Step } from "./constants";
import { PREVIEW_MODE, DELAY_MS } from "./constants";

/**
 * Hook principal del wizard de "Nuevo Pedido".
 * Expone los forms, estado de pasos y acciones.
 */
export function useWizard() {
  const { auth } = useAuth();

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

  // ⚠️ Los formularios de "Ambientes" NO deben mergear baseSchema
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

  // Los módulos sí pueden mergear baseSchema
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
      // ⬇️ Arranca SIEMPRE con una única fila (evita duplicados en StrictMode)
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
      serviciosForm.setValue("tipo_servicio", subchoice as any, {
        shouldValidate: true,
      });
    if (moduloActivo === "alquiler" && subchoice)
      alquilerForm.setValue("categoria", subchoice as any, {
        shouldValidate: true,
      });
    if (moduloActivo === "reparacion" && subchoice)
      repForm.setValue("tipo_reparacion", subchoice as any, {
        shouldValidate: true,
      });
    if (moduloActivo === "adquisicion" && subchoice)
      adquisicionForm.setValue("modo_adquisicion", subchoice as any, {
        shouldValidate: true,
      });
    setModStage("form");
  }

  function genIdTramite(): string {
    const y = new Date().getFullYear();
    const r = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `EXP-${y}-${r}`;
  }

  function buildModuleDraft(mod: ModNormal) {
    const secretaria = auth?.user?.secretaria ?? "";
    const id_tramite = genIdTramite();

    if (mod === "servicios") {
      const v = serviciosForm.getValues() as any;
      return v.tipo_servicio === "otros"
        ? {
            id_tramite,
            modulo: "servicios",
            secretaria,
            payload: {
              tipo_servicio: "otros",
              servicio_requerido: v.servicio_requerido || "",
              destino_servicio: v.destino_servicio || "",
            },
          }
        : {
            id_tramite,
            modulo: "servicios",
            secretaria,
            payload: {
              tipo_servicio: "profesionales",
              tipo_profesional: v.tipo_profesional || "",
              dia_desde: v.dia_desde || "",
              dia_hasta: v.dia_hasta || "",
            },
          };
    }

    if (mod === "alquiler") {
      const v = alquilerForm.getValues() as any;
      if (v.categoria === "maquinaria") {
        return {
          id_tramite,
          modulo: "alquiler",
          secretaria,
          payload: {
            categoria: "maquinaria",
            uso_maquinaria: v.uso_maquinaria || "",
            tipo_maquinaria: v.tipo_maquinaria || "",
            requiere_combustible: !!v.requiere_combustible,
            requiere_chofer: !!v.requiere_chofer,
            cronograma_desde: v.cronograma_desde || "",
            cronograma_hasta: v.cronograma_hasta || "",
            horas_por_dia: Number(v.horas_por_dia || 0),
          },
        };
      }
      if (v.categoria === "edificio") {
        return {
          id_tramite,
          modulo: "alquiler",
          secretaria,
          payload: {
            categoria: "edificio",
            uso_edificio: v.uso_edificio || "",
            ubicacion_edificio: v.ubicacion_edificio || "",
          },
        };
      }
      return {
        id_tramite,
        modulo: "alquiler",
        secretaria,
        payload: {
          categoria: "otros",
          que_alquilar: v.que_alquilar || "",
          detalle_uso: v.detalle_uso || "",
        },
      };
    }

    if (mod === "adquisicion") {
      const v = adquisicionForm.getValues() as any;
      return {
        id_tramite,
        modulo: "adquisicion",
        secretaria,
        payload: {
          proposito: v.proposito || "",
          modo_adquisicion: v.modo_adquisicion || "uno",
          items: v.items || [],
        },
      };
    }

    // === Reparación (soporta 'items' para maquinarias) ===
    const v = repForm.getValues() as any;
    if (v.tipo_reparacion === "maquinaria") {
      const items = Array.isArray(v.items) ? v.items : [];
      const picks = items
        .map((it: any) =>
          it?.unidad_nro != null ? `UNIDAD ${it.unidad_nro}` : null
        )
        .filter(Boolean);
      const dets = items
        .map((it: any) => (it?.detalle ? String(it.detalle).trim() : ""))
        .filter((s: string) => s.length > 0);

      return {
        id_tramite,
        modulo: "reparacion",
        secretaria,
        payload: {
          tipo_reparacion: "maquinaria",
          unidad_reparar: picks.join(", "),
          detalle_reparacion: dets.join(" | "),
          items,
        },
      };
    }
    // 'otros'
    return {
      id_tramite,
      modulo: "reparacion",
      secretaria,
      payload: {
        tipo_reparacion: "otros",
        que_reparar: v.que_reparar || "",
        detalle_reparacion: v.detalle_reparacion || "",
      },
    };
  }

  function buildFullPayload(): any {
    const g = generalForm.getValues();

    // ÁMBITO
    const tipoUi: "ninguno" | "obra" | "mantenimientodeescuelas" =
      ambitoIncluido ?? "ninguno";

    let ambito: any = { tipo: tipoUi };
    if (tipoUi === "mantenimientodeescuelas") {
      const v = escForm.getValues() as any;
      ambito.escuelas = { escuela: v.escuela };
    } else if (tipoUi === "obra") {
      const v = obrasForm.getValues() as any;
      ambito.obra = { obra_nombre: v.obra_nombre };
    }

    // MÓDULO
    let modulo: any = null;
    if (moduloActivo === "servicios") {
      const v = serviciosForm.getValues() as any;
      modulo = v.tipo_servicio === "otros"
        ? {
            tipo: "servicios",
            tipo_servicio: "otros",
            servicio_requerido: v.servicio_requerido || null,
            destino_servicio: v.destino_servicio || null,
          }
        : {
            tipo: "servicios",
            tipo_servicio: "profesionales",
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

      // Compat: si hay items de 'maquinaria', concateno
      let unidad_reparar = v.unidad_reparar || null;
      let detalle = v.detalle_reparacion || null;

      if (v.tipo_reparacion === "maquinaria" && Array.isArray(v.items)) {
        const picks = v.items
          .map((it: any) =>
            it?.unidad_nro != null ? `UNIDAD ${it.unidad_nro}` : null
          )
          .filter(Boolean);
        const dets = v.items
          .map((it: any) => (it?.detalle ? String(it.detalle).trim() : ""))
          .filter((s: string) => s.length > 0);

        if (picks.length) unidad_reparar = picks.join(", ");
        if (dets.length) detalle = dets.join(" | ");
      }

      modulo = {
        tipo: "reparacion",
        tipo_reparacion: v.tipo_reparacion,
        unidad_reparar: unidad_reparar,
        que_reparar: v.que_reparar || null,
        detalle_reparacion: detalle,
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
      created_by_username: auth?.user?.username ?? undefined,
    };

    return { generales, ambito, modulo };
  }

  // ===== Resumen / Envío =====
  const [summary, setSummary] = useState<any | null>(null);
  const [showJson, setShowJson] = useState(false);

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backendDone, setBackendDone] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  // Temporizador de 10s exactos independiente del backend
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

    generalForm.setValue("modulo", "general", { shouldValidate: false });
    if (auth?.user?.secretaria) {
      generalForm.setValue("secretaria", auth.user.secretaria, { shouldValidate: true });
    }
    const okGen = await generalForm.trigger();
    if (!okGen && !PREVIEW_MODE) return;

    const s = {
      generales: {
        ...generalForm.getValues(),
        secretaria: auth?.user?.secretaria ?? generalForm.getValues("secretaria"),
      },
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
    setStep(4);
  }

  async function handleEnviar() {
    if (!summary || !summary.modulo_seleccionado) return;

    const payload = buildFullPayload();

    if (PREVIEW_MODE) {
      setShowJson(false);
      setSendError(null);
      setBackendDone(true);
      setCreatedResult({ simulated: true });
      setSending(true);
      return;
    }

    // Arranca barra determinística de 10s y envío paralelo
    setSendError(null);
    setBackendDone(false);
    setCreatedResult(null);
    setSending(true);

    (async () => {
      try {
        const created = await createPedidoFull(payload);

        // Si el ámbito es "obra" y subieron el PDF, subirlo (nuevo endpoint + fallback en lib)
        if (ambitoIncluido === "obra") {
          const fList = (obrasForm.getValues() as any)?.anexo1_pdf as FileList | undefined;
          const file = fList?.[0];
          if (file) {
            await uploadAnexo(created.pedido_id, "anexo1_obra", file);
          }
        }

        setCreatedResult(created);
        setBackendDone(true);
      } catch (e: any) {
        console.error("Error al enviar:", e);
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
    // ambientes
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
