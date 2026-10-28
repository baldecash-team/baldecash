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
 * izquierda; "Tu solicitud" fijo a la derecha; abajo "‹ Atrás" (botón
 * secundario), "Continuar →" y el aviso de confidencialidad.
 *
 * Celular: cabecera fija con el equipo desplegable y "Paso X de N"; "Atrás" y
 * "Continuar" en línea bajo la tarjeta, en la misma fila (prototipo). Solo el
 * Paso 4 (`pasoResumen`) lleva la barra fija de abajo con la cuota total, y
 * quien lo monta pone `BarraInferiorV2Spacer` al final de la página.
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

import { TARJETA_V2, TARJETA_V2_ESTILO, BOTON_ATRAS_V2 } from './campos/estilosV2';
import { ProgresoV2, etiquetaDelPaso, type PasoDelProgreso } from './ProgresoV2';
import { PanelSolicitudV2, CabeceraSolicitudV2, ALTO_CABECERA_MOVIL, useDatosDelPanel, textoDelDiaDePago } from './PanelSolicitudV2';
import { BarraInferiorV2 } from './BarraInferiorV2';
import { useGuiaDeCampos } from './useGuiaDeCampos';
import { useErroresAlSalir } from './useErroresAlSalir';
import { leerOrigenDiseno2 } from './origenDiseno2';
import { hayEnvioADomicilio, pidenDiaDePago } from './textosQueAplicanV2';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

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
  /** Solo celular: el Atrás de la barra hace otra cosa ("‹ Volver" a la vista 1). */
  atrasMovil?: { texto: string; onClick: () => void } | null;
  /**
   * Paso resumen (Paso 4): en celular la acción va en la barra fija de abajo
   * con Atrás, la cuota total y Enviar (prototipo); sin candado de
   * confidencialidad. Los demás pasos llevan Atrás y Continuar en línea.
   */
  pasoResumen?: boolean;
  /**
   * La landing pide el cupón para continuar (`isCouponRequired`): el
   * "¿Tienes un cupón?" del panel de escritorio lo dice (BAL-5203).
   */
  cuponObligatorio?: boolean;
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
  pasoResumen = false,
  cuponObligatorio = false,
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
  // La fila de botones bajo la tarjeta (escritorio y celular).
  const atrasDeLaFila = irAtras ? { texto: 'Atrás', onClick: irAtras } : null;
  const accionDeLaFila = accionPrincipal ? { texto: textoPrincipal, onPrimary: accionPrincipal } : null;
  // Celular del Paso 4: el Atrás de la barra fija. En la vista 2 vuelve a la vista 1.
  const atrasCelular = atrasMovil ?? atrasDeLaFila;
  const barraFijaMovil = pasoResumen;
  // Candado de confidencialidad (prototipo): bajo el título si el paso no
  // trae descripción (Pasos 2 y 3); si la trae, bajo los botones (Paso 1).
  const candado: 'arriba' | 'abajo' | null = pasoResumen || sinNavegacion ? null : description ? 'abajo' : 'arriba';
  const frecuencia = getAllProducts()[0]?.paymentFrequency;
  // Textos que no aplican a todas las landings (BAL-4969, casuísticas):
  // "Envío gratis" solo si hay envío; "Día de pago" solo si se pide.
  const { overlayVariant } = useLayout();
  const conEnvio = hayEnvioADomicilio({ pasos: steps, overlayVariant, tipoDeProducto: getAllProducts()[0]?.type });
  const conDiaDePago = steps.length === 0 || pidenDiaDePago(steps);
  const totalTexto = `S/${formatCuotaDeLanding(getTotalMonthlyPayment(), landing)}${sufijoDeFrecuencia(frecuencia)}`;

  return (
    <div className="min-h-screen bg-[var(--d2-fondo)] relative">
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
              <p className="mb-1 font-['Baloo_2',_sans-serif] text-[17px] font-bold leading-tight text-[var(--d2-ok-acento)]">{antetituloDelPaso}</p>
            )}
            <h1 className="font-['Baloo_2',_sans-serif] text-[28px] lg:text-[34px] font-bold leading-[1.1] text-[var(--d2-texto)]">
              {title}
            </h1>
            {description && <p className="mt-1 text-sm lg:text-base text-[var(--d2-texto-suave)]">{description}</p>}
            {candado === 'arriba' && (
              <p className="mt-1 flex items-center gap-2 text-sm lg:text-base text-[var(--d2-texto-suave)]">
                <Lock className="h-4 w-4 shrink-0 text-[var(--d2-ok-acento)]" aria-hidden />
                <span>
                  Tu información es confidencial<span className="hidden lg:inline"> y la usamos para evaluar tu solicitud</span>.
                </span>
              </p>
            )}

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
              // Continuar está visible.
              <div data-zona-acciones-v2>
                {/* Atrás (botón secundario) y Continuar en la misma fila, en
                    escritorio y en celular (prototipo de Brenda + pedido de
                    Emilio, BAL-4959). En celular van en línea bajo la tarjeta;
                    solo el paso con `barraFijaMovil` (Paso 4) usa la barra fija. */}
                <div className={`mt-5 flex items-center gap-3 lg:justify-between ${barraFijaMovil ? 'hidden lg:flex' : ''}`}>
                  {atrasDeLaFila ? (
                    <button
                      type="button"
                      data-atras-v2
                      onClick={atrasDeLaFila.onClick}
                      disabled={ocupado}
                      className={`${BOTON_ATRAS_V2} px-4 lg:px-5`}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden />
                      {atrasDeLaFila.texto}
                    </button>
                  ) : <span className="hidden lg:block" />}
                  {accionDeLaFila && (
                    <button
                      type="button"
                      data-continuar-v2
                      onClick={accionDeLaFila.onPrimary}
                      disabled={ocupado || !canProceed}
                      className={`inline-flex min-h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-bold shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 lg:flex-none lg:px-7 ${
                        ocupado || !canProceed ? 'bg-[var(--d2-boton-apagado)] text-[var(--d2-boton-apagado-texto)] shadow-none cursor-not-allowed' : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-90 cursor-pointer'
                      }`}
                    >
                      {/* La ruedita también con `isBusy` (solo navega, ej. a
                          complementos), no solo mientras se crea la solicitud. */}
                      {(isSubmitting || isBusy) && <span className="h-5 w-5 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
                      <span className="truncate">{accionDeLaFila.texto}</span>
                      {!isSubmitting && <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />}
                    </button>
                  )}
                </div>

                {/* Candado: en el paso con descripción va bajo los botones
                    (Paso 1 del prototipo); sin descripción va bajo el título
                    (Pasos 2 y 3). El resumen no lo lleva. */}
                {candado === 'abajo' && (
                  <p className="mt-4 flex items-center gap-2 text-[13px] text-[var(--d2-texto-suave)]">
                    <Lock className="h-4 w-4 shrink-0 text-[var(--d2-ok-acento)]" aria-hidden />
                    <span>
                      Tu información es confidencial<span className="hidden lg:inline"> y la usamos para evaluar tu solicitud</span>.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            {/* Con «Ver detalle» o «Cambiar plazo» abiertos el panel crece más
                que la pantalla: va fijo, así que se desplaza dentro de su caja
                (un solo scroll; antes el detalle quedaba cortado sin poder bajar). */}
            <div
              className="sticky d2-pop-lento overflow-y-auto overscroll-contain rounded-2xl [scrollbar-width:thin]"
              style={{
                top: 'calc(var(--header-total-height, 6.5rem) + 1rem)',
                maxHeight: 'calc(100vh - var(--header-total-height, 6.5rem) - 2rem)',
              }}
            >
              <PanelSolicitudV2
                datos={datosDelPanel}
                detalle={detalle}
                conEnvio={conEnvio}
                cuponObligatorio={cuponObligatorio}
                // El paso que envía lleva su "Enviar" también en el panel (prototipo).
                envio={
                  isLastStep && accionPrincipal && !sinNavegacion
                    ? {
                        texto: textoPrincipal,
                        onEnviar: accionPrincipal,
                        deshabilitado: ocupado || !canProceed,
                        ocupado,
                        diaDePago: textoDelDiaDePago(formData.payment_day?.value),
                        conDiaDePago,
                      }
                    : null
                }
              />
            </div>
          </div>
        </div>
      </div>

      {!sinNavegacion && barraFijaMovil && (
        <BarraInferiorV2
          atras={atrasCelular}
          onPrimary={accionMovil?.onPrimary ?? accionPrincipal}
          // En la barra de celular el envío dice siempre «Enviar solicitud»
          // (prototipo, `ctaLabelM`): «Enviar con 2 protecciones» no entra
          // junto al monto en 360 px. Las protecciones se ven en la lista.
          texto={accionMovil?.texto ?? (isLastStep ? 'Enviar solicitud' : undefined)}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          isBusy={isBusy}
          submitMessage={submitMessage}
          canProceed={canProceed}
          oculto={ocultarBarraInferior}
          total={totalTexto}
          leyendaTotal={datosDelPanel.mesPrimeraCuota ? `Desde ${datosDelPanel.mesPrimeraCuota}` : undefined}
        />
      )}
    </div>
  );
}

export default ShellV2;
