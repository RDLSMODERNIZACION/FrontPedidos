// src/app/pedidos/nuevo/StepAmbitos.tsx
'use client';
import React from "react";
import { FormProvider } from "react-hook-form";
import ObrasForm from "@/components/forms/modules/ObrasForm";
import MantenimientoEscuelasForm from "@/components/forms/modules/MantenimientoEscuelasForm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AMBITOS, AMBITO_INTRO, Ambito } from "./constants";
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

  // Validar mínimamente por valor, sin forzar resolver completo de módulo
  const obraId = Number(obrasForm?.getValues?.("obra_id") ?? 0);
  const escuelaId = Number(escForm?.getValues?.("escuela_id") ?? 0);

  const bloqueoObra =
    ambitoIncluido === "obra" && (!obraId || Number.isNaN(obraId));
  const bloqueoEscuela =
    ambitoIncluido === "mantenimientodeescuelas" && (!escuelaId || Number.isNaN(escuelaId));

  const puedeSeguir =
    (ambitoIncluido || ambitoSelected === "ninguno") &&
    !bloqueoObra &&
    !bloqueoEscuela;

  async function handleNext() {
    // Si quisieras forzar validación de Zod del subform (opcional):
    // if (ambitoIncluido === "obra") {
    //   const ok = await obrasForm.trigger();
    //   if (!ok) return;
    // }
    // if (ambitoIncluido === "mantenimientodeescuelas") {
    //   const ok = await escForm.trigger();
    //   if (!ok) return;
    // }
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
                <button className="btn" onClick={() => includeAmbito(ambitoSelected!)}>Incluir</button>
              </div>
            </>
          )}
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
            !ambitoIncluido && ambitoSelected !== "ninguno"
              ? "Incluí un ambiente o elegí 'Ninguno'"
              : bloqueoObra
                ? "Seleccioná una obra para continuar"
                : bloqueoEscuela
                  ? "Seleccioná una escuela para continuar"
                  : ""
          }
        >
          Seguir <ArrowRight className="inline ml-1" size={16} />
        </button>
      </div>
    </div>
  );
}
