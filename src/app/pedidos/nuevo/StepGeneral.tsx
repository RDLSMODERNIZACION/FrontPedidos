// src/app/pedidos/nuevo/StepGeneral.tsx
'use client';
import React from "react";
import { FormProvider } from "react-hook-form";
import GeneralPedidoForm from "@/components/forms/modules/GeneralForm";
import { ArrowRight } from "lucide-react";

export default function StepGeneral({ generalForm, auth, onNext, previewMode }: {
  generalForm: any;
  auth: any;
  onNext: () => void;
  previewMode: boolean;
}) {
  return (
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
          if (!ok && !previewMode) return;
          onNext();
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
  );
}
