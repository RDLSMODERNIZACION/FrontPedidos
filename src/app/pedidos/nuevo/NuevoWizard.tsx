// src/app/pedidos/nuevo/NuevoWizard.tsx
'use client';

import React, { useEffect, useMemo } from "react";
import RequireAuth from "@/components/RequireAuth";
import { Stepper } from "./UI";
import StepGeneral from "./StepGeneral";
import StepAmbitos from "./StepAmbitos";
import StepModulos from "./StepModulos";
import StepResumenEnviar from "./StepResumenEnviar";
import StepFinalizar from "./StepFinalizar";
import { useWizard } from "./useWizard";
import { PREVIEW_MODE } from "./constants";

type Props = { secretariaDefault?: string };

export default function NuevoPedidoWizard({ secretariaDefault }: Props) {
  const W = useWizard();

  // toma de user si no viene por prop
  const secretaria = useMemo(() => {
    const fromUser =
      (W.auth as any)?.user?.secretaria ??
      (W.auth as any)?.user?.department ??
      (W.auth as any)?.user?.departamento ??
      null;
    return secretariaDefault ?? fromUser ?? null;
  }, [W.auth, secretariaDefault]);

  // inyectar al form "general" si falta
  useEffect(() => {
    if (!W?.generalForm?.getValues || !W?.generalForm?.setValue) return;
    const current = W.generalForm.getValues("secretaria");
    if (secretaria && (!current || String(current).trim() === "")) {
      W.generalForm.setValue("secretaria", secretaria, { shouldDirty: false, shouldTouch: false });
    }
  }, [secretaria, W.generalForm]);

  const canSend = useMemo(() => {
    const draft = W.summary?.modulo_draft ?? {};
    const itemsAdq = draft?.payload?.items ?? [];
    const hasItemsAdq = Array.isArray(itemsAdq) && itemsAdq.length > 0;
    const amb = W.summary?.ambitoIncluido ?? "ninguno";
    const anexoObraOk = amb === "obra"
      ? Boolean((W.obrasForm.getValues?.() as any)?.anexo1_pdf?.[0])
      : true;

    return (
      !!W.summary?.modulo_seleccionado &&
      (amb !== "obra" || anexoObraOk) &&
      (W.summary?.modulo_seleccionado !== "adquisicion" || hasItemsAdq)
    );
  }, [W.summary, W.obrasForm]);

  return (
    <RequireAuth>
      <div className="grid gap-4">
        <Stepper step={W.step} />

        {W.step === 1 && (
          <StepGeneral
            generalForm={W.generalForm}
            auth={W.auth}
            previewMode={PREVIEW_MODE}
            onNext={() => W.setStep(2)}
            // 👇 pasar default explícito al Step
            secretariaDefault={secretaria ?? undefined}
          />
        )}

        {W.step === 2 && (
          <StepAmbitos
            ambitoSelected={W.ambitoSelected}
            ambitoIncluido={W.ambitoIncluido}
            handleSelectAmbito={W.handleSelectAmbito}
            includeAmbito={W.includeAmbito}
            clearAmbito={W.clearAmbito}
            obrasForm={W.obrasForm}
            escForm={W.escForm}
            onBack={() => W.setStep(1)}
            onNext={() => W.setStep(3)}
          />
        )}

        {W.step === 3 && (
          <StepModulos
            moduloActivo={W.moduloActivo}
            modStage={W.modStage}
            subchoice={W.subchoice}
            openModule={W.openModule}
            advanceFromIntro={W.advanceFromIntro}
            advanceFromChoose={W.advanceFromChoose}
            setModStage={W.setModStage}
            setSubchoice={W.setSubchoice}
            serviciosForm={W.serviciosForm}
            alquilerForm={W.alquilerForm}
            adquisicionForm={W.adquisicionForm}
            repForm={W.repForm}
            onBack={() => W.setStep(2)}
            onSavedNext={() => W.guardarModuloYPasarAResumen()}
          />
        )}

        {W.step === 4 && (
          <StepResumenEnviar
            summary={W.summary}
            obrasForm={W.obrasForm}
            showJson={W.showJson}
            setShowJson={W.setShowJson}
            sending={W.sending}
            canSend={canSend}
            progress={W.progress}
            handleEnviar={W.handleEnviar}
            onBackGeneral={() => W.setStep(1)}
            onBackAmbito={() => W.setStep(2)}
            onBackModulo={() => W.setStep(3)}
            sendError={W.sendError}
          />
        )}

        {W.step === 5 && (
          <StepFinalizar createdResult={W.createdResult} sendError={W.sendError} />
        )}
      </div>
    </RequireAuth>
  );
}
