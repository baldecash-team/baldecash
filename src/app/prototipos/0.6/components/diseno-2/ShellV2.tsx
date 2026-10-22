'use client';

/**
 * El marco de Diseño 2 de la solicitud (BAL-4959, rediseño de Brenda).
 *
 * Reemplaza a `WizardLayout` (y con él a `WizardProgress`, `MotivationalCard`,
 * `SelectedProductBar` y `MobileStickyCta`) cuando la landing está en Diseño 2.
 * Recibe LO MISMO que `WizardLayout` —paso actual, handlers de atrás,
 * continuar y enviar, estado de envío— y no decide nada del flujo: validar,
 * guardar el borrador, el envío anticipado, los guards y la navegación siguen
 * en `StepClient` / `usePasoDelWizard`, tal cual.
 *
 * Escritorio: progreso arriba; título y tarjeta con borde de color a la
 * izquierda; "Tu solicitud" fijo a la derecha; abajo "‹ Atrás", "Continuar →"
 * y el aviso de confidencialidad.
 *
 * Celular: cabecera fija con el equipo desplegable y "Paso X de N"; la acción
 * principal fija abajo a todo lo ancho; "Atrás" como enlace. Quien monta el
 * shell pone `BarraInferiorV2Spacer` al final de la página (después del footer).
 *
 * Lo que agrega sobre el contenido del paso: la guía de campos
 * (`useGuiaDeCampos`) y los errores al salir del campo (`useErroresAlSalir`).
 * El contenido se pinta con `children(camposTocados)` para que el paso le
 * pase esos campos a `DynamicWizardStep`.
 */

import React, { useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, ChevronLeft, Lock } from 'lucide-react';

import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { isNvidiaLanding } from '@/app/prototipos/0.6/utils/theme';
import { useWizardConfig } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext';
import { useWizard } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { isStepDynamicallyCompleted } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/WizardProgress';
import { getStepSlug, type WizardStep } from '@/app/prototipos/0.6/services/wizardApi';
import { formatCuotaDeLanding } from '@/app/prototipos/0.6/utils/formatCuota';
import type { PromoBannerData } from '@/app/prototipos/0.6/types/hero';

import { ProgresoV2, type PasoDelProgreso } from './ProgresoV2';
import { PanelSolicitudV2, CabeceraSolicitudV2, ALTO_CABECERA_MOVIL } from './PanelSolicitudV2';
import { BarraInferiorV2 } from './BarraInferiorV2';
import { useGuiaDeCampos } from './useGuiaDeCampos';
import { useErroresAlSalir } from './useErroresAlSalir';

interface NavbarProps {
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  customerPortalUrl?: string;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  activeSections?: string[];
}

export interface ShellV2Props {
  /** Slug del paso actual (lo mismo que `currentStep` de `WizardLayout`). */
  currentStep: string;
  /** El paso actual, para la guía de campos y los errores al salir. */
  step: WizardStep | null;
  title: string;
  description?: string;
  /** El cuerpo del paso. Recibe los campos tocados para `DynamicWizardStep`. */
  children: (camposTocados: ReadonlySet<string>) => React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  /** Sin esto el progreso no deja volver (contrato firmado). */
  onStepClick?: (slug: string) => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  /** El contenido trae sus propios botones (contrato). */
  sinNavegacion?: boolean;
  /** Plazo e inicial fijos: ver `SelectedProductBar`. */
  condicionesFijas?: boolean;
  /** Se está creando la solicitud de verdad. */
  isSubmitting?: boolean;
  /** Solo navega (complementos): el botón espera sin decir "Enviando". */
  isBusy?: boolean;
  canProceed?: boolean;
  submitMessage?: string;
  navbarProps?: NavbarProps;
  /** Sin tarjeta blanca alrededor (resumen apagado y sin campos). */
  sinTarjeta?: boolean;
  /** Celebración entre pasos en curso: se esconde la barra fija. */
  ocultarBarraInferior?: boolean;
}

/** Los pasos del formulario en el orden de la navegación: regulares y después resumen. */
export function pasosDelProgreso(steps: WizardStep[]): PasoDelProgreso[] {
  const regulares = steps.filter((s) => !s.is_summary_step);
  const resumen = steps.filter((s) => s.is_summary_step);
  return [...regulares, ...resumen].map((s) => ({ slug: getStepSlug(s), nombre: s.name || s.title }));
}

const ESTILOS_V2 = `
  .campo-v2[data-guia="brillo"] { animation: brilloCampoV2 1.6s ease-out; }
  [data-continuar-v2][data-guia="brillo"] { animation: brilloCtaV2 1.6s ease-out; }
  @keyframes brilloCampoV2 {
    0% { box-shadow: 0 0 0 0 rgba(70, 84, 205, 0); background-color: rgba(70, 84, 205, 0); }
    25% { box-shadow: 0 0 0 6px rgba(70, 84, 205, 0.18); background-color: rgba(70, 84, 205, 0.05); }
    100% { box-shadow: 0 0 0 0 rgba(70, 84, 205, 0); background-color: rgba(70, 84, 205, 0); }
  }
  @keyframes brilloCtaV2 {
    0% { box-shadow: 0 0 0 0 rgba(70, 84, 205, 0.5); }
    40% { box-shadow: 0 0 0 10px rgba(70, 84, 205, 0.15); }
    100% { box-shadow: 0 0 0 0 rgba(70, 84, 205, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .campo-v2[data-guia="brillo"], [data-continuar-v2][data-guia="brillo"] {
      animation: none; box-shadow: 0 0 0 4px rgba(70, 84, 205, 0.25);
    }
  }
`;

export function ShellV2({
  currentStep,
  step,
  title,
  description,
  children,
  onBack,
  onNext,
  onSubmit,
  onStepClick,
  isLastStep = false,
  sinNavegacion = false,
  condicionesFijas = false,
  isSubmitting = false,
  isBusy = false,
  canProceed = true,
  submitMessage,
  navbarProps,
  sinTarjeta = false,
  ocultarBarraInferior = false,
}: ShellV2Props) {
  const params = useParams();
  const landing = (params?.landing as string) || 'home';
  const { steps } = useWizardConfig();
  const { formData } = useWizard();
  const { getTotalMonthlyPayment, getAllProducts } = useProduct();

  const pasos = useMemo(() => pasosDelProgreso(steps), [steps]);
  const indiceActual = pasos.findIndex((p) => p.slug === currentStep);

  // Hechos: todos sus obligatorios visibles llenos. La misma cuenta dinámica
  // de `WizardProgress`; el resumen no se marca nunca como hecho.
  const completados = useMemo(() => {
    const valores: Record<string, string | string[]> = {};
    for (const [k, st] of Object.entries(formData)) {
      if (st?.value !== undefined) valores[k] = st.value as string | string[];
    }
    const hechos = new Set<string>();
    for (const s of steps) {
      if (s.is_summary_step) continue;
      if (isStepDynamicallyCompleted(s, valores)) hechos.add(getStepSlug(s));
    }
    return hechos;
  }, [steps, formData]);

  const tarjetaRef = useRef<HTMLDivElement>(null);
  const { camposTocados, onBlur } = useErroresAlSalir(step);
  const { onKeyDown } = useGuiaDeCampos({ contenedorRef: tarjetaRef, step, activa: !sinNavegacion });

  const accionPrincipal = isLastStep ? onSubmit ?? onNext : onNext;
  const ocupado = isSubmitting || isBusy;
  const textoPrincipal = isSubmitting ? submitMessage || 'Enviando…' : isLastStep ? 'Enviar solicitud' : 'Continuar';
  const frecuencia = getAllProducts()[0]?.paymentFrequency;
  const totalTexto = `S/${formatCuotaDeLanding(getTotalMonthlyPayment(), landing)}${frecuencia === 'semanal' ? '/sem' : frecuencia === 'quincenal' ? '/qcn' : '/mes'}`;

  return (
    <div className="min-h-screen bg-[#F4F5F8] relative">
      <style>{ESTILOS_V2}</style>

      {/* Escritorio: la navbar de siempre. En celular manda la cabecera del equipo. */}
      <div className="hidden lg:block">
        {isNvidiaLanding(landing) ? <NvidiaNavbar landing={landing} /> : <Navbar {...navbarProps} landing={landing} />}
        <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />
      </div>
      <CabeceraSolicitudV2
        condicionesFijas={condicionesFijas}
        indiceActual={indiceActual}
        totalPasos={pasos.length}
        landing={landing}
      />
      <div className="lg:hidden" style={{ height: ALTO_CABECERA_MOVIL }} aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 pt-6 pb-10 lg:pt-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0">
            <div className="hidden lg:block">
              <ProgresoV2 pasos={pasos} indiceActual={indiceActual} completados={completados} onIrAPaso={onStepClick} />
            </div>

            <h1 className="font-['Baloo_2',_sans-serif] text-[28px] lg:text-[34px] font-bold leading-[1.1] text-[#1E2230]">
              {title}
            </h1>
            {description && <p className="mt-1 text-sm lg:text-base text-[#5B6275]">{description}</p>}

            <div
              ref={tarjetaRef}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              className={sinTarjeta ? 'mt-4' : 'mt-4 rounded-2xl border border-[#AEB6EE] bg-white p-4 sm:p-7'}
              style={sinTarjeta ? undefined : { boxShadow: 'inset 0 4px 0 0 var(--color-primary)' }}
            >
              {children(camposTocados)}
            </div>

            {!sinNavegacion && (
              <>
                {/* Escritorio */}
                <div className="mt-5 hidden lg:flex items-center justify-between">
                  {onBack ? (
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={ocupado}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-[15px] font-bold text-[var(--color-primary)] cursor-pointer hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Atrás
                    </button>
                  ) : <span />}
                  {accionPrincipal && (
                    <button
                      type="button"
                      data-continuar-v2
                      onClick={accionPrincipal}
                      disabled={ocupado || !canProceed}
                      className={`inline-flex min-h-[52px] items-center gap-2 rounded-xl px-7 text-base font-bold text-white shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                        ocupado || !canProceed ? 'bg-neutral-300 text-neutral-500 shadow-none cursor-not-allowed' : 'bg-[var(--color-primary)] hover:brightness-90 cursor-pointer'
                      }`}
                    >
                      {isSubmitting && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
                      {textoPrincipal}
                      {!isSubmitting && <ArrowRight className="h-5 w-5" aria-hidden />}
                    </button>
                  )}
                </div>

                <p className="mt-4 flex items-center gap-2 text-[13px] text-[#5B6275]">
                  <Lock className="h-4 w-4 shrink-0 text-[#0B8A6B]" aria-hidden />
                  <span>
                    Tu información es confidencial<span className="hidden lg:inline"> y la usamos para evaluar tu solicitud</span>.
                  </span>
                </p>

                {/* Celular: Atrás como enlace; Continuar va en la barra fija */}
                {onBack && (
                  <div className="mt-3 flex justify-center lg:hidden">
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={ocupado}
                      className="inline-flex min-h-[44px] items-center gap-1 px-3 text-[15px] font-bold text-[var(--color-primary)] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Atrás
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky" style={{ top: 'calc(var(--header-total-height, 6.5rem) + 1rem)' }}>
              <PanelSolicitudV2 condicionesFijas={condicionesFijas} />
            </div>
          </div>
        </div>
      </div>

      {!sinNavegacion && (
        <BarraInferiorV2
          onPrimary={accionPrincipal}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          isBusy={isBusy}
          submitMessage={submitMessage}
          canProceed={canProceed}
          oculto={ocultarBarraInferior}
          total={totalTexto}
        />
      )}
    </div>
  );
}

export default ShellV2;
