'use client';

/**
 * Todo lo que necesita un paso regular del formulario para funcionar, fuera de
 * la página que lo monta.
 *
 * Existe para que el mismo paso se pueda montar en dos lugares: la página
 * `/solicitar/[stepSlug]` de siempre y —en las landings de segundo
 * financiamiento, que tienen un solo paso— embebido en la intro, debajo de
 * accesorios.
 *
 * Es una extracción: el código salió tal cual de `StepClient.tsx` y no cambia
 * comportamiento. Lo que protege el test de caracterización
 * (`StepClient.pasoRegular.test.tsx`) es el arranque del contrato: en renueva-*
 * la solicitud se crea al cerrar el paso 1 (envío anticipado) y de ahí sale el
 * contrato.
 *
 * El archivo es `.tsx` y no `.ts` porque `overlays` es JSX.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import { StepSuccessMessage } from '../celebration/StepSuccessMessage';
import { SubmitOverlay } from '../submit/SubmitOverlay';

import { useWizard, FILE_PENDING_REUPLOAD } from '../../../context/WizardContext';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import { useSessionOptional } from '../../../context/SessionContext';
import { useEventTrackerOptional } from '../../../context/EventTrackerContext';
import { useSubmitApplication, type SubmitStage } from '../../../hooks/useSubmitApplication';
import {
  readEnvioAnticipadoHandoff,
  type EnvioAnticipadoHandoff,
} from '../../../utils/envioAnticipadoHandoff';
import { WizardStepId } from '../../../types/solicitar';
import {
  WizardStep,
  WizardMotivational,
  validateStep as validateStepFields,
  evaluateFieldVisibility,
} from '../../../../../services/wizardApi';

import type { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { useToast, ModalAviso } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { getVipName, getVipToken } from '@/app/prototipos/0.6/components/hero/DniModal';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';

export interface PasoDelWizardControles {
  /** El paso que se está mostrando. `null` mientras la config no resolvió. */
  step: WizardStep | null;
  /** Valida, marca el paso y dispara el envío. Es `onNext`, `onSubmit` y `onPrimary`. */
  handleNext: () => void;
  /** Vuelve al paso anterior, o a la intro si es el primero. */
  handleBack: () => void;
  /** Salta a un paso por su slug. */
  handleStepClick: (stepId: WizardStepId) => void;
  /** Este paso es el que cierra el formulario (envío anticipado o último sin complementos). */
  esElQueEnvia: boolean;
  /** Se está creando la solicitud de verdad. */
  isSubmitting: boolean;
  /** Etapa del envío, para el overlay. */
  submitStage: SubmitStage;
  /** Mensaje de progreso del envío. */
  submitMessage: string;
  /** Falso cuando la whitelist bloqueó el documento. */
  canProceed: boolean;
  /** Mostrar errores de campo (tras el primer intento). */
  showErrors: boolean;
  /** Corriendo la celebración entre pasos: el CTA fijo se esconde. */
  celebrando: boolean;
  /** Contenido motivacional resuelto (saludo por nombre si hay prefill). */
  motivational: WizardMotivational | null;
  /** Nombre para el saludo del layout. */
  firstName: string;
  /**
   * El envío de ESTE hook terminó bien.
   *
   * Lo consume el host para su redirección de "no hay producto seleccionado":
   * el submit limpia el carrito, y sin este flag la pantalla se leería como si
   * la persona hubiera entrado sin elegir equipo y la mandaría de vuelta.
   */
  submitSucceeded: boolean;
  /** Overlays y modales del paso: celebración, envío y "unidad tomada". */
  overlays: React.ReactNode;
}

export function usePasoDelWizard(opciones: {
  /** Slug del paso a mostrar. */
  stepSlug: string;
  /**
   * El flujo de la landing, YA leído por quien monta el paso.
   *
   * Se inyecta en vez de llamar `useSolicitarFlow` acá: el hook guarda
   * `config`/`isLoading` por instancia y cada una sale a buscar
   * `solicitar-config` de verdad (el `next: { revalidate }` de la petición es
   * una directiva del servidor de Next, inerte en un componente cliente). Dos
   * instancias eran un GET de más por cada montaje de paso.
   *
   * Es requerido a propósito: con un opcional habría que decidir si llamar o no
   * llamar un hook según una condición, y eso React no lo permite. Los dos
   * hosts —`StepClient` y `solicitarClient`— ya tenían el suyo, así que ninguno
   * agrega una lectura.
   */
  flujo: ReturnType<typeof useSolicitarFlow>;
  /** Tema gamer: cambia el theme de la celebración. */
  gamer?: boolean;
}): PasoDelWizardControles {
  const { stepSlug, flujo, gamer } = opciones;

  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // State
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    getStepByUrlSlug,
    getNavigation,
    steps,
  } = useWizardConfig();

  const {
    formData,
    setFieldError,
    markStepCompleted,
    getAllDynamicOptions,
  } = useWizard();

  // El DNI quedo fuera de la whitelist: el boton Continuar se DESHABILITA, no
  // solo rechaza al pulsarlo. Un boton que se ve activo y no hace nada se lee
  // como que la pagina fallo; deshabilitado dice "falta algo" sin ambiguedad.
  // El motivo lo explica el modal de DocumentNumberField.
  const bloqueadoPorWhitelist = formData['_whitelist_blocked']?.value === 'true';

  // Event tracker
  const tracker = useEventTrackerOptional();

  // Get solicitar flow configuration (to check if there are sections after wizard)
  const { shouldShowComplementos, isEnabled, kycEnabled, isKycStepEnabled, envioAnticipadoStep } = flujo;

  // Toast notifications for submit
  const { showToast } = useToast(4000);

  // Submit application hook (used when insurance is disabled)
  // La unidad quedo tomada por otra solicitud. Va en modal y no en toast: el
  // toast dura 4 segundos y `StepClient` no renderiza el `error` del hook, asi
  // que seria la unica superficie del mensaje — y este mensaje pide una accion
  // (volver al catalogo y elegir otro equipo) justo cuando el envio fallo y la
  // persona no sabe si su solicitud entro.
  const [unidadTomada, setUnidadTomada] = useState<string | null>(null);

  const { submit: submitApplication, isSubmitting: isAppSubmitting, submitMessage, submitStage, submitSucceeded } = useSubmitApplication({
    onToast: showToast,
    onUnidadTomada: setUnidadTomada,
  });

  // El z-index del wrapper va explicito y NO se puede sacar. `ModalAviso` es
  // `z-50` y la navbar del wizard tambien: mientras el modal se montaba DESPUES
  // de la pagina, el empate lo ganaba por orden en el DOM. Estos overlays ahora
  // se montan ANTES de `WizardLayout` —para que la celebracion entre pasos
  // conserve su pintado—, asi que sin el wrapper la navbar le quedaria encima
  // justo cuando el envio fallo y la persona no sabe si su solicitud entro.
  // `60` y no mas: es el mismo escalon del banner de promo, que ya estaba por
  // encima del modal y tiene que seguir estandolo.
  const modalUnidadTomada = unidadTomada ? (
    <div className="relative z-[60]">
      <ModalAviso
        titulo="Ese equipo ya no está disponible"
        mensaje={unidadTomada}
        textoBoton="Elegir otro equipo"
        // El boton principal LLEVA al catalogo, no cierra y ya: cerrar deja a la
        // persona en un formulario que no va a poder enviar. `onCerrar` tambien
        // navega porque es lo que corren Escape y el clic en el fondo, y los tres
        // caminos tienen que terminar en el mismo lugar.
        onCerrar={() => router.push(routes.catalogo(landing))}
        tono="error"
      />
    </div>
  ) : null;

  // Get step config from API using URL slug
  const step = getStepByUrlSlug(stepSlug);
  const navigation = step ? getNavigation(step.code) : {
    currentIndex: -1,
    prevStep: null,
    nextStep: null,
    isFirst: true,
    isLast: true
  };

  /**
   * Esta pantalla es la que la landing eligió para crear la solicitud sin
   * esperar al final del wizard (`envio_anticipado` en Flujo de Solicitud).
   *
   * Cuando se dispara, el wizard TERMINA acá: el submit navega a donde ya
   * navegaba —la pantalla del KYC con el contrato si la landing lo tiene, o la
   * confirmación— y las pantallas siguientes, complementos incluidos, no se
   * muestran. Es lo que hace que la persona pueda leer y aceptar su contrato
   * antes de que la solicitud se apruebe.
   *
   * `null` —el default— es el comportamiento de siempre.
   */
  const enviaEnEstePaso =
    envioAnticipadoStep !== null &&
    navigation.currentIndex >= 0 &&
    navigation.currentIndex + 1 === envioAnticipadoStep;

  /**
   * La solicitud que el envío anticipado ya creó, si la hay. Se lee en un
   * efecto y no en el render porque `sessionStorage` no existe en el servidor:
   * leerlo directo rompe la hidratación.
   */
  const [handoff, setHandoff] = useState<EnvioAnticipadoHandoff | null>(null);
  const sesion = useSessionOptional();
  const sessionUuid = sesion?.sessionUuid ?? null;
  useEffect(() => {
    // Con la sesión: un handoff de OTRA sesión es de una solicitud anterior, y
    // tomarlo por bueno hace que el wizard crea que ya envió y pase de largo el
    // submit — la persona llena el formulario, aprieta Enviar y ve el contrato
    // de la solicitud vieja, sin un solo POST. Pasó probando en local.
    //
    // Mientras la sesión todavía no resolvió (`null`) no se descarta nada: es
    // el primer render, no una sesión distinta.
    //
    // La lectura tiene que pasar por estado sí o sí: `sessionStorage` no existe
    // en el servidor y leerlo en el render rompe la hidratación. Es el mismo
    // efecto que ya vivía en `StepClient`, donde la regla no se disparaba.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHandoff(readEnvioAnticipadoHandoff(landing, sessionUuid));
    // `stepSlug` en las dependencias: al pasar de la pantalla que envía a la
    // siguiente el componente no se desmonta, y sin esto el handoff recién
    // guardado no se vería hasta un refresh.
  }, [landing, stepSlug, sessionUuid]);

  /** Ya se envió (envío anticipado): no se puede volver a crear la solicitud. */
  const yaEnviada = handoff !== null;

  /** Ver el pestillo en `handleCelebrationComplete`. */
  const enviandoRef = useRef(false);

  // Build form values for validation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        // Treat file reupload marker as empty (file was lost on refresh)
        if (state.value === FILE_PENDING_REUPLOAD) {
          values[key] = '';
          continue;
        }
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Override motivational when check-person finds data (personalized greeting)
  // For VIP countdown landings, the MotivationalCard handles the "Hola, [Nombre]" greeting,
  // so we skip this override to keep the original BD text.
  const hasVipToken = !!getVipToken(landing);
  const [hasVipCountdown, setHasVipCountdown] = useState(false);
  // `!step` corta la consulta: sin paso resuelto el hook no pinta nada y el
  // motivacional no se usa, así que el GET no tendría a quién servirle. Importa
  // porque la intro monta este hook en TODAS las landings —inerte, con el slug
  // vacío— y ella ya pide `fetchLandingConfig` por su cuenta: sin este guard,
  // cualquier landing con token VIP en localStorage pasaba de 1 a 2 GETs al
  // mismo endpoint. `fetchLandingConfig` no tiene caché de cliente.
  useEffect(() => {
    if (!hasVipToken || !step) return;
    fetchLandingConfig(landing).then(cfg => {
      setHasVipCountdown(!!cfg.features.vip_countdown);
    });
  }, [landing, hasVipToken, step]);
  const isVipLanding = hasVipToken && hasVipCountdown;

  const stepMotivational = useMemo((): WizardMotivational | null => {
    if (!step) return null;
    if (isVipLanding) return step.motivational;

    const prefillStatus = formData['_prefill_status_document_number']?.value as string | undefined;
    if (prefillStatus !== 'found') return step.motivational;

    const hasMainDocumentNumber = step.fields.some(f => f.type === 'document_number' && f.code === 'document_number');
    if (!hasMainDocumentNumber) return step.motivational;

    const firstName = (formData['first_name']?.value as string) || '';
    if (!firstName) return step.motivational;

    const name = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return {
      title: `Hola <span class="highlight">${name}</span>, qué bueno verte por aquí`,
      highlight: step.motivational?.highlight || '',
      title_end: step.motivational?.title_end || '',
      subtitle: 'Ya casi terminamos este paso, sigue adelante.',
      illustration: step.motivational?.illustration || '',
    };
  }, [step, formData, isVipLanding]);

  // Track form_abandon on beforeunload (when user closes/reloads mid-form)
  useEffect(() => {
    if (!step || !tracker) return;

    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const visibleFields = step.fields.filter(f => evaluateFieldVisibility(f, formValues));
      const filledCount = visibleFields.filter(f => {
        const val = formData[f.code]?.value;
        return Array.isArray(val) ? val.length > 0 : !!val;
      }).length;

      tracker.track('form_abandon', {
        form_id: 'onboarding-solicitud',
        last_active_step: step.order + 1,
        fields_completed: filledCount,
        total_fields: visibleFields.length,
        time_in_form_ms: Date.now() - startTime,
      });
      tracker.flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, tracker, formValues, formData]);

  // Validate all fields in the step
  const validateStep = useCallback((): string | null => {
    if (!step) return null;
    return validateStepFields(step, formValues, setFieldError, getAllDynamicOptions());
  }, [step, formValues, setFieldError, getAllDynamicOptions]);

  // Navigation handlers
  const handleNext = () => {
    setSubmitted(true);

    // Bloqueo por whitelist (check-person): si el backend marcó allowed === false,
    // no se permite avanzar. El motivo lo explica el modal de DocumentNumberField.
    if (formData['_whitelist_blocked']?.value === 'true') {
      const wlField = formData['_whitelist_field']?.value as string | undefined;
      if (wlField) {
        document.getElementById(wlField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const firstErrorField = validateStep();
    if (firstErrorField) {
      tracker?.track('form_step_validation_error', {
        step_code: step?.code,
        step_title: step?.title,
        error_field: firstErrorField,
      });
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    tracker?.track('form_step_complete', {
      step_code: step?.code,
      step_title: step?.title,
      next_step: navigation.nextStep?.code ?? 'complementos_or_submit',
    });
    if (step) {
      markStepCompleted(step.url_slug || step.code);
    }

    // El paso que ENVÍA no celebra: la celebración dice "paso 1 de 2" y felicita
    // por avanzar, y lo que está pasando es que se está creando la solicitud.
    // Se va directo al envío, que tiene su propia pantalla ("Creando
    // solicitud…"). Celebrar acá además metía 1,3 s de espera antes de empezar.
    if (enviaEnEstePaso) {
      enviarYSeguir();
      return;
    }

    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    enviarYSeguir();
  };

  /**
   * Crea la solicitud y pasa a la pantalla siguiente, que es la del contrato.
   *
   * Lo llaman los dos caminos —el paso que envía, directo; el que solo avanza,
   * al terminar la celebración— y por eso el pestillo vive acá.
   */
  function enviarYSeguir() {
    if (enviaEnEstePaso && !yaEnviada) {
      // Pestillo: enviar es lo único de esta pantalla que no se puede repetir.
      // `isAppSubmitting` no sirve de guard —es estado y no se ve dentro del
      // mismo tick—, así que va en un ref.
      if (enviandoRef.current) return;
      enviandoRef.current = true;

      // Se crea la solicitud y se sigue en el wizard: la pantalla siguiente es
      // la que muestra el contrato. Sin paso siguiente no hay dónde seguir, y
      // ahí el hook navega como siempre (KYC o confirmación).
      const seguir = navigation.nextStep;
      void submitApplication({
        insuranceId: null,
        otpEnabled: isEnabled('otp_verification'),
        kycEnabled,
        stayInWizard: !!seguir,
        conContrato: isKycStepEnabled('contract'),
      }).then((ok) => {
        if (ok && seguir) {
          router.push(routes.solicitarStep(landing, seguir.url_slug || seguir.code));
        }
      });
      return;
    }

    // Ya enviada: la solicitud existe y volver a mandarla crearía otra. Se
    // sigue navegando; el final del wizard lleva a la confirmación.
    if (enviaEnEstePaso && yaEnviada && navigation.nextStep) {
      const seguir = navigation.nextStep;
      router.push(routes.solicitarStep(landing, seguir.url_slug || seguir.code));
      return;
    }
    if (navigation.nextStep) {
      const nextSlug = navigation.nextStep.url_slug || navigation.nextStep.code;
      router.push(routes.solicitarStep(landing, nextSlug));
    } else if (shouldShowComplementos) {
      // No more wizard steps - go to complementos (dynamic sections after wizard)
      router.push(routes.solicitarComplementos(landing));
    } else {
      // No more steps and no complementos - submit directly
      submitApplication({ insuranceId: null, otpEnabled: isEnabled('otp_verification'), kycEnabled });
    }
  }

  const handleBack = () => {
    tracker?.track('form_step_back', {
      step_code: step?.code,
      prev_step: navigation.prevStep?.code ?? 'preview',
    });
    if (navigation.prevStep) {
      const prevSlug = navigation.prevStep.url_slug || navigation.prevStep.code;
      router.push(routes.solicitarStep(landing, prevSlug));
    } else {
      // First step - go back to preview
      router.push(routes.solicitar(landing));
    }
  };

  const handleStepClick = (stepId: WizardStepId) => {
    router.push(routes.solicitarStep(landing, stepId));
  };

  // Determinar dinámicamente si es el último paso del wizard
  // Solo mostrar "Enviar Solicitud" si no hay más pasos Y no hay complementos
  // El paso que envía muestra el CTA de envío aunque queden pasos detrás.
  const isActuallyLastRegularStep = enviaEnEstePaso || (navigation.isLast && !shouldShowComplementos);

  const overlays = (
    <>
      <AnimatePresence>
        {showCelebration && step && (
          <StepSuccessMessage
            stepName={step.title}
            stepNumber={step.order + 1}
            totalSteps={steps.length}
            onComplete={handleCelebrationComplete}
            theme={gamer ? 'gamer' : undefined}
          />
        )}
      </AnimatePresence>
      <SubmitOverlay isOpen={isAppSubmitting} stage={submitStage} />
      {modalUnidadTomada}
    </>
  );

  return {
    step: step ?? null,
    handleNext,
    handleBack,
    handleStepClick,
    esElQueEnvia: isActuallyLastRegularStep,
    isSubmitting: isAppSubmitting,
    submitStage,
    submitMessage,
    canProceed: !bloqueadoPorWhitelist,
    showErrors: submitted,
    celebrando: showCelebration,
    motivational: stepMotivational,
    firstName: formData['_prefill_status_document_number']?.value === 'found' ? (formData['first_name']?.value as string) || '' : (getVipName(landing)?.firstName || ''),
    submitSucceeded,
    overlays,
  };
}
