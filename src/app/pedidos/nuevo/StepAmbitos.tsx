// src/app/pedidos/nuevo/StepAmbitos.tsx
'use client';
import React from "react";
import { FormProvider } from "react-hook-form";
import ObrasForm from "@/components/forms/modules/ObrasForm";
import MantenimientoEscuelasForm from "@/components/forms/modules/MantenimientoEscuelasForm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AMBITOS, Ambito } from "./constants";
import { Card } from "./UI";

export default function StepAmbitos(props: {
  ambitoSelected: Ambito | null;
  ambitoIncluido: Ambito | null;
  handleSelectAmbito: (a: Ambito) => void;
  includeAmbito: (a: Ambito) => void;
  clearAmbito: () => void;
  obrasForm: any;
  escForm: any;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    ambitoSelected, ambitoIncluido, handleSelectAmbito, includeAmbito, clearAmbito,
    obrasForm, escForm, onBack, onNext
  } = props;

  // 🔎 Tomamos los valores REALES que usa el backend
  const obraNombre = String(obrasForm?.getValues?.("obra_nombre") ?? "").trim();
  const escuelaNombre = String(escForm?.getValues?.("escuela") ?? "").trim();

  // Reglas de bloqueo basadas en los campos que realmente envías
  const bloqueoObra =
    ambitoIncluido === "obra" && obraNombre.length === 0;

  const bloqueoEscuela =
    ambitoIncluido === "mantenimientodeescuelas" && escuelaNombre.length === 0;

  const puedeSeguir =
    ambitoIncluido !== null &&
    !(ambitoIncluido === "obra" && bloqueoObra) &&
    !(ambitoIncluido === "mantenimientodeescuelas" && bloqueoEscuela);

  // Al tocar una card, auto-incluimos (evita el paso extra "Incluir")
  function handleCardClick(a: Ambito) {
    handleSelectAmbito(a);
    includeAmbito(a);
  }

  async function handleNext() {
    // Forzamos validación del subform si corresponde
    if (ambitoIncluido === "obra") {
      const ok = await obrasForm.trigger();
      if (!ok) return;
    }
    if (ambitoIncluido === "mantenimientodeescuelas") {
      const ok = await escForm.trigger();
      if (!ok) return;
    }
    onNext();
  }

  return (
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
              onClick={() => handleCardClick(a.id)}
            />
          ))}
        </div>
      </section>

      {ambitoIncluido && (
        <section className="card grid gap-3">
          <div className="text-base font-semibold">
            {AMBITOS.find(x => x.id === ambitoIncluido)?.title}
          </div>

          {ambitoIncluido === "mantenimientodeescuelas" && (
            <FormProvider {...escForm}>
              <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                <MantenimientoEscuelasForm />
                {bloqueoEscuela && (
                  <div className="text-amber-300 text-sm">
                    Ingresá o seleccioná una escuela para continuar.
                  </div>
                )}
              </form>
            </FormProvider>
          )}

          {ambitoIncluido === "obra" && (
            <FormProvider {...obrasForm}>
              <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
                <ObrasForm />
                {bloqueoObra && (
                  <div className="text-amber-300 text-sm">
                    Ingresá o seleccioná el nombre de la obra para continuar.
                  </div>
                )}
              </form>
            </FormProvider>
          )}

          {ambitoIncluido === "ninguno" && (
            <div className="text-[#9aa3b2]">Sin datos adicionales. Podés continuar.</div>
          )}

          <div className="flex gap-2 justify-end">
            {ambitoIncluido !== "ninguno" && (
              <button className="btn-ghost" onClick={clearAmbito}>Quitar</button>
            )}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft className="inline mr-1" size={16} /> Volver
        </button>
        <button
          className="btn"
          onClick={handleNext}
          disabled={!puedeSeguir}
          title={
            !ambitoIncluido
              ? "Elegí un ambiente o seleccioná 'Ninguno'"
              : bloqueoObra
                ? "Falta el nombre de la obra"
                : bloqueoEscuela
                  ? "Falta seleccionar/ingresar la escuela"
                  : ""
          }
        >
          Seguir <ArrowRight className="inline ml-1" size={16} />
        </button>
      </div>
    </div>
  );
}
