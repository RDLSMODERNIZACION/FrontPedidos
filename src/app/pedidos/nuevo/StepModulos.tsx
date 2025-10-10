// src/app/pedidos/nuevo/StepModulos.tsx
'use client';
import React from "react";
import { FormProvider } from "react-hook-form";
import ServiciosForm from "@/components/forms/modules/ServiciosForm";
import AlquilerForm from "@/components/forms/modules/AlquilerForm";
import AdquisicionForm from "@/components/forms/modules/AdquisicionForm";
import ReparacionForm from "@/components/forms/modules/ReparacionForm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MODULOS_NORMALES, ModNormal, ModStage } from "./constants";
import { Card } from "./UI";

export default function StepModulos(props: {
  moduloActivo: ModNormal | null;
  modStage: ModStage;
  subchoice: string | null;
  openModule: (m: ModNormal) => void;
  advanceFromIntro: () => void;
  advanceFromChoose: () => void;
  setModStage: (s: ModStage) => void;
  setSubchoice: (s: string | null) => void;
  serviciosForm: any;
  alquilerForm: any;
  adquisicionForm: any;
  repForm: any;
  onBack: () => void;
  onSavedNext: () => void;
}) {
  const {
    moduloActivo, modStage, subchoice, openModule, advanceFromIntro, advanceFromChoose, setModStage, setSubchoice,
    serviciosForm, alquilerForm, adquisicionForm, repForm, onBack, onSavedNext
  } = props;

  return (
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
                <button className="btn-ghost" onClick={() => openModule(null as any)}>Cerrar</button>
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
                  <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSavedNext(); }}>
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
                  <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSavedNext(); }}>
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
                  <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSavedNext(); }}>
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
                  <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSavedNext(); }}>
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
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft className="inline mr-1" size={16} /> Volver
        </button>
      </div>
    </div>
  );
}
