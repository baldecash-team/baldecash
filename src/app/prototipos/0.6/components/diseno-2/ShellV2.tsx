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

import React, { useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, Lock } from 'lucide-react';

import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { isNvidiaLanding } from '@/app/prototipos/0.6/utils/theme';
import { useWizardConfig, pasosConPrimerResumen } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext';
import { useWizard } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { isStepDynamicallyCompleted } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/WizardProgress';
import { getStepSlug, type WizardStep } from '@/app/prototipos/0.6/services/wizardApi';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import type { PromoBannerData } from '@/app/prototipos/0.6/types/hero';

import { TARJETA_V2, TARJETA_V2_ESTILO } from './campos/estilosV2';
import { ProgresoV2, etiquetaDelPaso, type PasoDelProgreso } from './ProgresoV2';
import { PanelSolicitudV2, CabeceraSolicitudV2, ALTO_CABECERA_MOVIL, useDatosDelPanel } from './PanelSolicitudV2';
import { BarraInferiorV2 } from './BarraInferiorV2';
import { useGuiaDeCampos } from './useGuiaDeCampos';
import { useErroresAlSalir } from './useErroresAlSalir';
import { leerOrigenDiseno2 } from './origenDiseno2';

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
  /** Línea corta sobre el título (Paso 4: "¡Último paso, {Nombre}!"). */
  antetitulo?: string | null;
  /**
   * Repaso de los datos (Paso 4, BAL-4966): va en "Ver detalle" del panel
   * "Tu solicitud" (escritorio) y de la cabecera desplegable (celular).
   */
  detalle?: React.ReactNode;
  /** Texto del botón en el paso que envía ("Enviar con 2 protecciones"). */
  textoEnviar?: string;
  /**
   * Solo celular: otra acción para la barra fija (Paso 4 en dos vistas: la
   * vista 1 dice "Continuar" aunque el paso sea el que envía).
   */
  accionMovil?: { texto: string; onPrimary: () => void } | null;
  /** Solo celular: el enlace de abajo hace otra cosa ("‹ Volver" a la vista 1). */
  atrasMovil?: { texto: string; onClick: () => void } | null;
}

/**
 * Los pasos del formulario en el orden de la navegación: regulares y después
 * SOLO el primer resumen — la misma cuenta de Diseño 1 (`pasosConPrimerResumen`),
 * para que N ("paso X de N") no crezca con cada resumen extra que tenga la landing.
 */
export function pasosDelProgreso(steps: WizardStep[]): PasoDelProgreso[] {
  return pasosConPrimerResumen(steps).map((s) => ({ slug: getStepSlug(s), nombre: etiquetaDelPaso(s) }));
}

const ESTILOS_V2 = `
  .campo-v2[data-guia="brillo"] { animation: brilloCampoV2 1.6s ease-out; }
  [data-continuar-v2][data-guia="brillo"] { animation: brilloCtaV2 1.6s ease-out; }
  @keyframes brilloCampoV2 {
    0% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0); background-color: rgba(var(--color-primary-rgb), 0); }
    25% { box-shadow: 0 0 0 6px rgba(var(--color-primary-rgb), 0.18); background-color: rgba(var(--color-primary-rgb), 0.05); }
    100% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0); background-color: rgba(var(--color-primary-rgb), 0); }
  }
  @keyframes brilloCtaV2 {
    0% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.5); }
    40% { box-shadow: 0 0 0 10px rgba(var(--color-primary-rgb), 0.15); }
    100% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .campo-v2[data-guia="brillo"], [data-continuar-v2][data-guia="brillo"] {
      animation: none; box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.25);
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
  isFirstStep = false,
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
  antetitulo,
  detalle,
  textoEnviar,
  accionMovil,
  atrasMovil,
}: ShellV2Props) {
  const params = useParams();
  const landing = (params?.landing as string) || 'home';
  const router = useRouter();
  const { steps } = useWizardConfig();
  const { formData } = useWizard();
  const { getTotalMonthlyPayment, getAllProducts } = useProduct();

  /**
   * Paso 1 de Diseño 2 — decisión del controlador (BAL-4959): "Atrás" no va
   * a `/solicitar` (la pantalla intermedia de Diseño 1, que acá no existe):
   * vuelve a la página de origen del modal "Lo quiero" —catálogo o ficha—,
   * guardada por el modal al continuar, o al catálogo si no hay ninguna
   * guardada (URL directa al paso, u otra pestaña). Solo pisa `onBack` en el
   * primer paso; el resto navega como siempre (`paso.handleBack`).
   */
  const handleBackPrimerPaso = useCallback(() => {
    router.push(leerOrigenDiseno2(landing) || routes.catalogo(landing));
  }, [router, landing]);
  const irAtras = isFirstStep ? handleBackPrimerPaso : onBack;

  const pasos = useMemo(() => pasosDelProgreso(steps), [steps]);
  const indiceActual = pasos.findIndex((p) => p.slug === currentStep);
  // Con secciones, cada una lleva su tarjeta (prototipo de Brenda): el marco
  // no pone la suya alrededor de todas.
  const sinMarco = sinTarjeta || !!step?.groups?.length;
  // "¡Ya casi terminas!" sobre el título del penúltimo paso (prototipo).
  const antetituloDelPaso =
    antetitulo ?? (pasos.length >= 3 && indiceActual === pasos.length - 2 ? '¡Ya casi terminas!' : null);

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

  // Una sola vez para escritorio y celular: los dos están montados a la vez
  // (uno escondido con CSS), y pedirlo dos veces mandaba "1.ª cuota en {mes}"
  // al backend por duplicado en cada paso (BAL-4959, hallazgo de la revisión).
  const datosDelPanel = useDatosDelPanel(condicionesFijas);

  const tarjetaRef = useRef<HTMLDivElement>(null);
  const { camposTocados, onBlur } = useErroresAlSalir(step);
  const { onKeyDown } = useGuiaDeCampos({ contenedorRef: tarjetaRef, step, activa: !sinNavegacion });

  const accionPrincipal = isLastStep ? onSubmit ?? onNext : onNext;
  const ocupado = isSubmitting || isBusy;
  const textoDelEnvio = textoEnviar || 'Enviar solicitud';
  const textoPrincipal = isSubmitting ? submitMessage || 'Enviando…' : isLastStep ? textoDelEnvio : 'Continuar';
  // Celular: el enlace de abajo. En la vista 2 del Paso 4 vuelve a la vista 1.
  const atrasCelular = atrasMovil ?? (irAtras ? { texto: 'Atrás', onClick: irAtras } : null);
  const frecuencia = getAllProducts()[0]?.paymentFrequency;
  const totalTexto = `S/${formatCuotaDeLanding(getTotalMonthlyPayment(), landing)}${sufijoDeFrecuencia(frecuencia)}`;

  return (
    <div className="min-h-screen bg-[#F4F5F8] relative">
      <style>{ESTILOS_V2}</style>

      {/* Escritorio: la navbar de siempre. En celular manda la cabecera del equipo. */}
      <div className="hidden lg:block">
        {isNvidiaLanding(landing) ? <NvidiaNavbar landing={landing} /> : <Navbar {...navbarProps} landing={landing} />}
        <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />
      </div>
      <CabeceraSolicitudV2
        datos={datosDelPanel}
        indiceActual={indiceActual}
        totalPasos={pasos.length}
        landing={landing}
        detalle={detalle}
      />
      <div className="lg:hidden" style={{ height: ALTO_CABECERA_MOVIL }} aria-hidden />

      {/* Mismo contenedor que el Navbar (max-w-7xl + px-4/6/8): el formulario
          arranca a la altura del logo y «Tu solicitud» termina a la altura de
          «Zona Estudiantes». */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-10 lg:pt-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0">
            <div className="hidden lg:block">
              <ProgresoV2 pasos={pasos} indiceActual={indiceActual} completados={completados} onIrAPaso={onStepClick} />
            </div>

            {antetituloDelPaso && (
              <p className="mb-1 font-['Baloo_2',_sans-serif] text-[17px] font-bold leading-tight text-[#0B8A6B]">{antetituloDelPaso}</p>
            )}
            <h1 className="font-['Baloo_2',_sans-serif] text-[28px] lg:text-[34px] font-bold leading-[1.1] text-[#1E2230]">
              {title}
            </h1>
            {description && <p className="mt-1 text-sm lg:text-base text-[#5B6275]">{description}</p>}

            <div
              ref={tarjetaRef}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              // Entrada del paso (adelante o atrás): `bcPop` 0,3 s del prototipo.
              className={sinMarco ? 'mt-4 d2-pop-lento' : `mt-4 d2-pop-lento ${TARJETA_V2}`}
              style={sinMarco ? undefined : TARJETA_V2_ESTILO}
            >
              {children(camposTocados)}
            </div>

            {!sinNavegacion && (
              // `data-zona-acciones-v2`: a dónde cae `goFin` cuando ningún
              // Continuar está visible (celular con el teclado abierto, que
              // esconde la barra fija) en vez del botón de escritorio oculto.
              <div data-zona-acciones-v2>
                {/* Escritorio */}
                <div className="mt-5 hidden lg:flex items-center justify-between">
                  {irAtras ? (
                    <button
                      type="button"
                      onClick={irAtras}
                      disabled={ocupado}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-[15px] font-bold text-[var(--color-primary-text)] cursor-pointer hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
                      className={`inline-flex min-h-[52px] items-center gap-2 rounded-xl px-7 text-base font-bold shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                        ocupado || !canProceed ? 'bg-neutral-300 text-neutral-500 shadow-none cursor-not-allowed' : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-90 cursor-pointer'
                      }`}
                    >
                      {/* La misma regla que la barra fija de celular (`BarraInferiorV2`):
                          la ruedita también con `isBusy` (solo navega, ej. a
                          complementos), no solo mientras se crea la solicitud
                          de verdad (BAL-4959, hallazgo de la revisión). */}
                      {(isSubmitting || isBusy) && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
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
                {atrasCelular && (
                  <div className="mt-3 flex justify-center lg:hidden">
                    <button
                      type="button"
                      onClick={atrasCelular.onClick}
                      disabled={ocupado}
                      className="inline-flex min-h-[44px] items-center gap-1 px-3 text-[15px] font-bold text-[var(--color-primary-text)] cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      {atrasCelular.texto}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky d2-pop-lento" style={{ top: 'calc(var(--header-total-height, 6.5rem) + 1rem)' }}>
              <PanelSolicitudV2 datos={datosDelPanel} detalle={detalle} />
            </div>
          </div>
        </div>
      </div>

      {!sinNavegacion && (
        <BarraInferiorV2
          onPrimary={accionMovil?.onPrimary ?? accionPrincipal}
          texto={accionMovil?.texto ?? (isLastStep ? textoDelEnvio : undefined)}
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
