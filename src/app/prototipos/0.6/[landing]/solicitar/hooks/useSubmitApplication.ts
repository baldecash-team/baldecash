'use client';

/**
 * useSubmitApplication - Hook for submitting the application
 * Extracts submit logic to be reusable from both segurosClient and StepClient
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useProduct } from '../context/ProductContext';
import { useWizard, FILE_PENDING_REUPLOAD } from '../context/WizardContext';
import { useSession } from '../context/SessionContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import {
  submitApplication,
  type SubmitApplicationRequest,
  type UploadedFileData,
} from '../../../services/applicationApi';
import {
  ERROR_CODE_ENVIO_SIN_CONFIRMAR,
  MENSAJE_ENVIO_SIN_CONFIRMAR,
  MENSAJE_ERROR_INESPERADO,
} from '../../../services/mensajeDelError';
import { resetFormStartTracking } from './useFieldTracking';
import {
  clearConsentStorage,
  readSubmitConsents,
  type PartialSubmitConsents,
} from '../utils/consentStorage';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { saveOtpHandoff } from '../utils/otpHandoff';
import { saveEnvioAnticipadoHandoff } from '../utils/envioAnticipadoHandoff';
import { resolveComboId } from '../utils/comboFromSlug';
import { clearSpecialLink } from '@/app/prototipos/0.6/utils/specialLink';
import {
  isDemoLanding,
  buildDemoApplication,
  generateDemoApplicationCode,
  saveDemoApplication,
  DEMO_SUBMIT_DELAY_MS,
} from '../utils/demoApplication';
import { leerVistaDePrueba } from '@/app/prototipos/0.6/utils/vistaDePrueba';
import { avisarEnvioSimulado } from '../../../services/linkDePruebaApi';
import { normalizeEmail } from '../../../services/emailValidation';
import { termToMonths } from '@/app/prototipos/0.6/utils/plazoEnMeses';
import { datosDelFormulario, guardarDatosDelEnvio } from '@/app/prototipos/0.6/components/diseno-2/confirmacion/datosDelEnvioV2';
import { guardarNombresDelEnvio } from '../utils/nombresDelEnvio';

/**
 * Los codigos de campo que llevan un correo. Se mantiene alineado con
 * `EMAIL_FIELD_CODES` del backend (ws2: app/services/email_verification_service.py),
 * que es quien lo lee para mandar el OTP.
 */
const EMAIL_FIELD_CODES = ['email', 'email_universitario', 'institutional_email', 'correo_institucional', 'correo_estudiantil', 'supporter_email'];

function isEmailFieldCode(code: string): boolean {
  return EMAIL_FIELD_CODES.includes(code) || /(^|_)(email|correo)(_|$)/.test(code);
}

/**
 * Cuánto se frena un reenvío después de un envío sin confirmar. ws2 es
 * idempotente por sesión, pero solo cuando la primera solicitud ya se guardó:
 * un reintento mientras la primera sigue en curso crea otra (130342 y 130343,
 * BAL-4969). Pasado este tiempo, reintentar con la misma sesión devuelve la
 * solicitud existente si llegó.
 */
export const ESPERA_TRAS_ENVIO_SIN_CONFIRMAR_MS = 5 * 60 * 1000;

const claveSinConfirmar = (sessionUuid: string) => `baldecash-envio-sin-confirmar-${sessionUuid}`;

function envioSinConfirmarVigente(sessionUuid: string): boolean {
  try {
    const desde = Number(localStorage.getItem(claveSinConfirmar(sessionUuid)));
    return Number.isFinite(desde) && desde > 0 && Date.now() - desde < ESPERA_TRAS_ENVIO_SIN_CONFIRMAR_MS;
  } catch {
    return false;
  }
}

function marcarEnvioSinConfirmar(sessionUuid: string): void {
  try { localStorage.setItem(claveSinConfirmar(sessionUuid), String(Date.now())); } catch {}
}

interface UseSubmitApplicationOptions {
  /**
   * Callback for showing toast notifications
   */
  onToast?: (message: string, type: 'success' | 'error') => void;
  /**
   * La unidad que se pidió ya está tomada por otra solicitud.
   *
   * Va por un canal aparte del toast a propósito. El toast dura 4 segundos y
   * después no queda nada: `StepClient` no renderiza el `error` de este hook,
   * así que ese mensaje es la ÚNICA superficie donde aparece. Y este mensaje
   * pide una acción —volver al catálogo y elegir otro equipo—, además de
   * llegar justo cuando el envío falló y la persona no sabe si su solicitud
   * entró. Un aviso que se borra solo no sirve para eso.
   *
   * Solo se dispara con `UNIT_OUT_OF_STOCK`, que emite únicamente la guarda de
   * stock por unidad física — o sea, solo en las landings de
   * `catalog_unit_stock.landing_ids`. `OUT_OF_STOCK`, el del stock por conteo
   * que está vivo en una decena de landings ajenas, sigue yendo al toast como
   * siempre.
   */
  onUnidadTomada?: (mensaje: string) => void;
  /**
   * El envío rechazó el link especial (`SPECIAL_LINK_DNI_MISMATCH` o
   * `SPECIAL_LINK_INVALID`). Mismo criterio que `onUnidadTomada`: el mensaje
   * pide una acción (pedir otro link o revisar el DNI) y un toast de 4
   * segundos se borra antes de leerlo. Con el callback, la pantalla lo deja
   * fijo; sin él, cae al toast de siempre.
   */
  onLinkEspecialRechazado?: (mensaje: string) => void;
  /**
   * Las casillas de consentimiento que la pantalla que monta el hook tiene
   * marcadas AHORA, si es que las muestra (la intro de renueva-*, que crea la
   * solicitud desde el paso embebido, BAL-5007).
   *
   * Es respaldo, no fuente: manda lo guardado en `consentStorage`, que es lo
   * que escriben las dos intros y el modal de Diseño 2. Solo cubre la casilla
   * que no tenga nada guardado (storage bloqueado, modo privado).
   */
  consentimientoEnPantalla?: PartialSubmitConsents;
}

interface SubmitOptions {
  /**
   * Selected insurance ID (null if no insurance selected or insurance disabled)
   * @deprecated Use insuranceIds for multi-select
   */
  insuranceId?: string | null;
  /**
   * Selected insurance IDs (multi-select support)
   */
  insuranceIds?: string[];
  /**
   * Si la landing tiene la sección `otp_verification` habilitada. Cuando es true
   * y el submit crea la solicitud, NO redirigimos directo a la confirmación:
   * navegamos a la ruta dedicada `…/solicitar/verificacion` (OTP inline) antes del
   * resumen. El flag lo calcula el consumidor con `useSolicitarFlow` (no se lee
   * aquí para no acoplar el hook a `usePreview`).
   */
  otpEnabled?: boolean;
  kycEnabled?: boolean;
  /**
   * Envío anticipado: la solicitud se crea al terminar una pantalla del medio
   * del wizard, no al final. Con esto en `true` el hook NO navega y NO limpia
   * el wizard —la persona sigue adentro y a las pantallas que faltan les hace
   * falta el formulario—; en cambio deja el handoff (código + token) para que
   * la siguiente pueda pedir y mostrar el contrato.
   *
   * Quien lo prende se hace cargo de navegar.
   */
  stayInWizard?: boolean;
  /**
   * La landing muestra el contrato en el flujo (sub-paso `contract`). Viaja al
   * handoff: con contrato emitido las condiciones de la operación quedan
   * congeladas, y quien pinta los selectores no tiene por qué consultar la
   * config para saberlo.
   */
  conContrato?: boolean;
}

/**
 * Estados con los que la solicitud NACE cerrada: ws2 la rechazó o la canceló
 * dentro del mismo submit —hoy, la lista negra y los filtros duros que corren
 * ahí— y ya no hay nada que firmar ni que completar.
 *
 * Es la misma lista que `ESTADOS_SIN_CONTRATO` del backend, que es la que hace
 * que `/kyc/contrato` responda `no_aplica`. Se mira ACÁ, con la respuesta del
 * submit en la mano, para no mandar a la persona a una pantalla de contrato que
 * se va a pintar medio segundo y rebotar sola a la confirmación.
 */
const ESTADOS_SIN_CIERRE = new Set([
  'rejected', 'cancelled', 'expired', 'rechazo_automatico', 'rechazo_modelo',
]);

/** La solicitud quedó cerrada en el propio submit: no hay contrato ni KYC. */
function naceCerrada(status?: string): boolean {
  return ESTADOS_SIN_CIERRE.has((status || '').trim().toLowerCase());
}

/**
 * Extrae, best-effort, el número de documento del form ya mapeado para
 * prellenar el gate de OTP. Busca claves conocidas y, como último recurso, un
 * valor de 8 dígitos (formato DNI). No es crítico: si no lo encuentra, el gate
 * pide el DNI manualmente.
 */
function extractDocumentNumber(
  formData: Record<string, string | number | boolean | string[]>
): string | undefined {
  const preferredKeys = ['document_number', 'numero_documento', 'dni', 'nro_documento'];
  for (const key of preferredKeys) {
    const v = formData[key];
    if (typeof v === 'string' && /^\d{8}$/.test(v)) return v;
  }
  for (const [key, v] of Object.entries(formData)) {
    if (
      typeof v === 'string' &&
      /^\d{8}$/.test(v) &&
      /(document|dni|documento)/i.test(key)
    ) {
      return v;
    }
  }
  return undefined;
}

/**
 * Submission progress stages for user feedback
 */
export type SubmitStage =
  | 'idle'
  | 'validating'      // Validando datos...
  | 'uploading'       // Subiendo archivos...
  | 'processing'      // Procesando solicitud...
  | 'slow'            // Esto está tardando más de lo esperado...
  | 'success'
  | 'error';

export const SUBMIT_STAGE_MESSAGES: Record<SubmitStage, string> = {
  idle: '',
  validating: 'Validando datos...',
  uploading: 'Subiendo archivos...',
  processing: 'Procesando solicitud...',
  slow: 'Un momento, por favor...',
  success: 'Solicitud enviada correctamente',
  error: 'Error al enviar la solicitud',
};

interface UseSubmitApplicationResult {
  /**
   * Submit the application
   */
  submit: (options?: SubmitOptions) => Promise<boolean>;
  /**
   * Whether submission is in progress
   */
  isSubmitting: boolean;
  /**
   * Current submission stage for progress messages
   */
  submitStage: SubmitStage;
  /**
   * Human-readable message for current stage
   */
  submitMessage: string;
  /**
   * Last error message (if any)
   */
  error: string | null;
  /**
   * Whether the submission succeeded (navigating to confirmation)
   */
  submitSucceeded: boolean;
}

/**
 * Hook for submitting the application
 * Can be used from segurosClient (with insurance) or StepClient (without insurance)
 */
export function useSubmitApplication(
  options: UseSubmitApplicationOptions = {}
): UseSubmitApplicationResult {
  const { onToast, onUnidadTomada, onLinkEspecialRechazado, consentimientoEnPantalla } = options;
  // En un ref para que `submit` lea lo marcado al momento de enviar, no lo del
  // render en que se armó el callback.
  const consentimientoEnPantallaRef = useRef(consentimientoEnPantalla);
  consentimientoEnPantallaRef.current = consentimientoEnPantalla;

  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const keepData = typeof window !== 'undefined' && sessionStorage.getItem('keepData') === 'true';
  const analytics = useAnalytics();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const slowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Candado contra el doble clic: `isSubmitting` es estado y no cambia hasta
  // el próximo render, así que dos clics seguidos entraban los dos y salían
  // dos POST /submit (E2E BAL-4969, variante C). El ref se cierra en el acto.
  const enVueloRef = useRef(false);

  // Bloqueo de navegación durante el envío
  useEffect(() => {
    if (!isSubmitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Tu solicitud está siendo procesada. ¿Seguro que quieres salir?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (slowTimeoutRef.current) {
        clearTimeout(slowTimeoutRef.current);
      }
    };
  }, []);

  // Get data from contexts
  const {
    selectedProduct,
    cartProducts,
    getAllProducts,
    selectedAccessories,
    selectedInsurance,
    selectedInsurances,
    appliedCoupon,
    getDiscountAmount,
    getDiscountedMonthlyPayment,
    getTotalPrice,
    getTotalMonthlyPayment,
    clearProduct,
    clearCartProducts,
    clearAccessories,
    clearInsurance,
    clearCouponAfterSubmit,
  } = useProduct();

  const { formData, resetForm } = useWizard();
  const { sessionUuid, marcarSesionConvertida } = useSession();
  // Formulario que el backend le sirvió a esta sesión (varios formularios por
  // landing). Viaja en el submit para que la solicitud quede ligada a ese
  // formulario aunque el reparto cambie mientras la persona todavía lo llena.
  const { config: wizardConfig } = useWizardConfig();

  /**
   * Maps WizardContext formData to the API form_data format
   * Extracts only the value from each FieldState
   * Also extracts files from file fields
   */
  const mapFormData = useCallback((): {
    data: Record<string, string | number | boolean | string[]>;
    files: UploadedFileData[];
  } => {
    const mapped: Record<string, string | number | boolean | string[]> = {};
    const files: UploadedFileData[] = [];

    for (const [key, fieldState] of Object.entries(formData)) {
      // Skip internal fields (prefixed with _) — they control UI state only
      if (key.startsWith('_')) continue;
      // Skip file reupload markers (file was lost on refresh, not a real value)
      if (fieldState?.value === FILE_PENDING_REUPLOAD) continue;
      if (fieldState?.value !== undefined && fieldState.value !== '') {
        // Handle arrays: pueden ser archivos (FileUpload) o las opciones
        // marcadas de una casilla de selección múltiple (CheckboxField en modo
        // múltiple, BAL-4354). Antes este bloque solo buscaba archivos y
        // descartaba la lista entera si no encontraba ninguno — así se perdía
        // toda casilla múltiple.
        if (Array.isArray(fieldState.value)) {
          const textValues: string[] = [];
          for (const item of fieldState.value) {
            if (item && typeof item === 'object' && 'file' in item && item.file instanceof File) {
              // La llave de formData ES el código del campo, entero. El backend
              // busca el campo por ese código para saber el tipo de documento:
              // cortarlo en el primer `_` (BAL-4353) mandaba
              // `minor_enrollment_certificate` como `minor` y la constancia
              // quedaba guardada como «Documento General».
              files.push({
                fieldCode: key,
                file: item.file,
              });
            } else if (typeof item === 'string') {
              textValues.push(item);
            }
          }
          // Se manda como lista de textos (JSON array) — no como string
          // separado por comas: ws2 guarda `form_data` tal cual (columna
          // JSON) y una opción con una coma adentro rompería un join. Si el
          // array no tenía texto (estaba vacío o eran solo archivos), no se
          // manda la llave — igual que el resto de este `for`, que omite
          // valores vacíos.
          if (textValues.length > 0) {
            mapped[key] = textValues;
          }
          continue;
        }
        // Los campos de correo se normalizan al salir: el input ya limpia lo que
        // se teclea, pero un valor prellenado (autocompletado por DNI, restaurado
        // de localStorage) nunca pasa por ahí. Prod 2026-08-07: un `mailto:` que
        // llegó así al backend hizo que Mailgun rechazara el OTP con un 400.
        mapped[key] = isEmailFieldCode(key) && typeof fieldState.value === 'string'
          ? (normalizeEmail(fieldState.value) || fieldState.value)
          : fieldState.value;
      }
    }

    return { data: mapped, files };
  }, [formData]);

  /**
   * Submit the application
   * @param submitOptions - Options including optional insuranceId
   * @returns true if successful, false otherwise
   */
  const submit = useCallback(
    async (submitOptions: SubmitOptions = {}): Promise<boolean> => {
      const { insuranceId = null, insuranceIds, otpEnabled = false, kycEnabled = false,
              stayInWizard = false, conContrato = false } = submitOptions;

      if (enVueloRef.current) return false;

      setError(null);

      // Validate session exists
      if (!sessionUuid) {
        const msg = 'Error de sesión. Por favor recarga la página.';
        setError(msg);
        onToast?.(msg, 'error');
        return false;
      }

      // Get all products (cart or single)
      const allProducts = getAllProducts();

      // Un envío anterior de esta sesión quedó sin respuesta y puede seguir
      // creándose en ws2: reenviar ahora duplica la solicitud.
      if (envioSinConfirmarVigente(sessionUuid)) {
        setError(MENSAJE_ENVIO_SIN_CONFIRMAR);
        onToast?.(MENSAJE_ENVIO_SIN_CONFIRMAR, 'error');
        return false;
      }

      // Validate at least one product is selected
      if (allProducts.length === 0) {
        const msg = 'No hay producto seleccionado.';
        setError(msg);
        onToast?.(msg, 'error');
        return false;
      }

      // El consentimiento se lee ACÁ, antes de cualquier `await`: al terminar,
      // el envío exitoso limpia el storage (`clearConsentStorage`) y después
      // ya no queda qué mandar (BAL-5007).
      const consents = readSubmitConsents(landing, consentimientoEnPantallaRef.current);

      let succeeded = false;
      // La respuesta de un envío que ws2 YA aceptó. Si algo del código revienta
      // después, la solicitud existe igual: no se muestra error (invitaría a
      // reenviar y duplicar), se sigue a la confirmación.
      let envioAceptado: { code?: string; token?: string } | null = null;
      enVueloRef.current = true;
      setIsSubmitting(true);
      setSubmitStage('validating');

      // Emit summary_submit right at the start of the submission flow.
      // Incluye totales calculables desde los datos ya disponibles.
      try {
        // La cuota que la persona ve y firma: equipo + accesorios + seguros
        // (antes solo el equipo: 239 donde la cuota era 267, BAL-4969).
        const totalMonthly = getTotalMonthlyPayment();
        analytics.trackSummarySubmit({
          product_count: allProducts.length,
          accessory_count: selectedAccessories.length,
          insurance_selected: (insuranceIds && insuranceIds.length > 0) || !!insuranceId,
          total_monthly: totalMonthly || null,
        });
      } catch {
        // Nunca bloquear el submit por analytics
      }

      // Iniciar timeout para mensaje "slow" después de 15 segundos
      slowTimeoutRef.current = setTimeout(() => {
        setSubmitStage('slow');
      }, 15000);

      try {
        // Map form data and extract files from wizard context
        const { data: mappedFormData, files: uploadFiles } = mapFormData();

        // If income_source was auto-set because applicant is a minor, flag it
        if (formData['_income_source_auto']?.value === 'true') {
          mappedFormData['llenada_manualmente'] = true;
        }

        // Cambiar a estado "uploading" si hay archivos, sino directo a "processing"
        if (uploadFiles.length > 0) {
          setSubmitStage('uploading');
        } else {
          setSubmitStage('processing');
        }

        // Landings demo (slug `*-demo`): el flujo termina acá. Se arma el
        // detalle de la solicitud con lo que la persona seleccionó y llenó, se
        // deja en sessionStorage para /confirmacion y se navega al resumen.
        // No se hace POST a ws2: no existe solicitud real detrás de este código.
        //
        // Lo mismo desde un link de «Probar en la web» (BAL-5367), también en
        // el envío anticipado. Ahí además se avisa a ws2 para la bitácora.
        const vistaDePrueba = leerVistaDePrueba(landing);
        if (isDemoLanding(landing) || vistaDePrueba) {
          setSubmitStage('processing');
          await new Promise((resolve) => setTimeout(resolve, DEMO_SUBMIT_DELAY_MS));

          const demoCode = generateDemoApplicationCode();
          saveDemoApplication(
            landing,
            buildDemoApplication({
              code: demoCode,
              products: allProducts,
              accessories: selectedAccessories,
              insurances: selectedInsurances,
              coupon: appliedCoupon,
              discountAmount: getDiscountAmount(),
              totalMonthlyPayment: getDiscountedMonthlyPayment(),
              formData: mappedFormData,
            })
          );

          if (vistaDePrueba) {
            await avisarEnvioSimulado(vistaDePrueba.token);
          } else {
            analytics.track('form_submit_success', {
              product_count: allProducts.length,
              accessory_count: selectedAccessories.length,
              demo: true,
            });
          }

          if (slowTimeoutRef.current) {
            clearTimeout(slowTimeoutRef.current);
            slowTimeoutRef.current = null;
          }
          setSubmitStage('success');
          setSubmitSucceeded(true);

          // Mismo reset que el flujo real, para que una segunda demo arranque
          // de cero. `saveDemoApplication` ya corrió, así que el resumen
          // sobrevive a la limpieza.
          if (!keepData) {
            // La sesión de tracking NO se suelta acá: la confirmación es la
            // que emite `application_submitted` con el `application_code`, y
            // tiene que caer sobre la misma fila que ws2 acaba de marcar con
            // el `application_id`. Se marca y se renueva al arrancar otra
            // solicitud (`solicitar/layout.tsx`).
            marcarSesionConvertida();
            resetFormStartTracking();
            resetForm();
            clearProduct();
            clearCartProducts();
            clearAccessories();
            clearInsurance();
            clearCouponAfterSubmit();
            clearConsentStorage(landing);
            try { localStorage.removeItem(`baldecash-${landing}-cart`); } catch {}
          }

          onToast?.('Solicitud enviada correctamente', 'success');
          succeeded = true;

          // Ni OTP ni KYC: ambos necesitan un `application_id` real en ws2.
          // Envío anticipado: lo que sigue (contrato, KYC) necesita una
          // solicitud de verdad, así que la prueba termina en la confirmación.
          // `false` = «ya navegué», igual que una solicitud que nace cerrada.
          if (stayInWizard) {
            router.replace(routes.solicitarConfirmacion(landing, demoCode));
            return false;
          }
          router.push(routes.solicitarConfirmacion(landing, demoCode));
          return true;
        }

        // Get first product for backward compatibility fields
        const primaryProduct = allProducts[0];

        // Build product_data for API
        // Backend calculates monthly_payment and initial_amount using PricingService
        const productData: SubmitApplicationRequest['product_data'] = {
          // Primary product - backend calculates pricing
          product_id: parseInt(primaryProduct.id, 10),
          // Variant/Color selection (if user selected a specific color)
          variant_id: primaryProduct.variantId
            ? parseInt(primaryProduct.variantId, 10)
            : undefined,
          // Card elegida: el catalogo lista el producto suelto y cada uno de sus
          // combos como cards distintas, pero todas comparten product_id. Sin
          // esto el backend solo puede deducir el combo del precio, y uno de
          // regalo (mismo precio que el pelado) se pierde en silencio.
          // El `null` es significativo — se manda siempre, no se omite.
          combo_id: resolveComboId(primaryProduct),
          // Raw term in native units of payment_frequency (no conversion)
          term: primaryProduct.term ?? primaryProduct.months,
          // Calendar-month equivalent, derived from term + frequency
          // (do NOT trust `months` — it can fall back to raw term in some flows)
          term_months: termToMonths(
            primaryProduct.term ?? primaryProduct.months,
            primaryProduct.paymentFrequency
          ),
          initial_percent: primaryProduct.initialPercent ?? 0, // Send selection, backend calculates amounts
          initial_amount: primaryProduct.initialAmount ?? 0,
          // En cuantas armadas se cobra la inicial. El backend manda la celda
          // del pricing como fuente autoritativa y solo cae a este valor si la
          // celda no configuro armadas; ademas lo sanea a {2,4}, asi que un 1
          // (el default de todo el catalogo) no cambia nada.
          initial_installments: primaryProduct.initialInstallments ?? 1,
          // Frontend-calculated values as hints (backend will recalculate)
          unit_price: primaryProduct.price,
          // Red de seguridad: si un carrito nuevo se olvida del campo, `undefined`
          // desaparece del JSON y el backend rellena "mensual" a ciegas — con un
          // producto sin pricing mensual eso da TEA 0 o la cuota de otra
          // frecuencia (BAL-3994). El default vive aqui, explicito.
          payment_frequency: primaryProduct.paymentFrequency ?? 'mensual',
          // Multiple products array
          products: allProducts.map((p) => ({
            product_id: parseInt(p.id, 10),
            variant_id: p.variantId ? parseInt(p.variantId, 10) : undefined,
            combo_id: resolveComboId(p),
            quantity: 1,
            unit_price: p.price,
            monthly_price: p.monthlyPayment,  // Cuota mensual con intereses
            term: p.term ?? p.months,
            term_months: termToMonths(p.term ?? p.months, p.paymentFrequency),
            initial_percent: p.initialPercent ?? 0,
            initial_amount: p.initialAmount ?? 0,
            payment_frequency: p.paymentFrequency ?? 'mensual',
          })),
          // Map accessories (backend calculates monthly quotas)
          accessories: selectedAccessories.map((acc) => ({
            accessory_id: parseInt(acc.id, 10),
          })),
          // Add insurance(s) if selected
          ...(insuranceIds && insuranceIds.length > 0
            ? { insurance_ids: insuranceIds.map(id => parseInt(id, 10)) }
            : insuranceId
              ? { insurance_id: parseInt(insuranceId, 10) }
              : {}
          ),
          // Link especial (BAL-5191): sin pase la clave no viaja.
          ...(primaryProduct.specialLinkToken
            ? { special_link_token: primaryProduct.specialLinkToken }
            : {}),
        };

        // Cambiar a "processing" antes de enviar (si estábamos en uploading)
        setSubmitStage('processing');

        // Submit application (with files if any)
        const result = await submitApplication({
          session_uuid: sessionUuid,
          form_data: mappedFormData,
          product_data: productData,
          coupon_code: appliedCoupon?.code,
          wizard_form_id: wizardConfig?.form_id ?? undefined,
          wizard_form_version_id: wizardConfig?.form_version_id ?? undefined,
          // Sin ningún dato va `undefined` y la clave no viaja: ws2 lo avisa
          // a Sentry. Nunca se rellena con `true`.
          consents,
          files: uploadFiles.length > 0 ? uploadFiles : undefined,
        });

        if (result.success) {
          envioAceptado = { code: result.application_code, token: result.public_token };
          analytics.track('form_submit_success', {
            product_count: allProducts.length,
            accessory_count: selectedAccessories.length,
          });
          // Limpiar timeout de "slow"
          if (slowTimeoutRef.current) {
            clearTimeout(slowTimeoutRef.current);
            slowTimeoutRef.current = null;
          }
          setSubmitStage('success');

          setSubmitSucceeded(true);

          // El pase del link especial muere con la solicitud (ws2 lo consume):
          // se suelta siempre, también con `keepData`/`stayInWizard`.
          clearSpecialLink(landing);

          // Capturar el DNI ANTES de limpiar el form, para prellenar el gate de OTP.
          const capturedDocumentNumber = extractDocumentNumber(mappedFormData);

          // Día de pago y distrito para la tarjeta de la confirmación de
          // Diseño 2 (BAL-5274): `/status` no los trae y el form se limpia
          // abajo. Solo se guardan en esta pestaña; el envío no cambia.
          guardarDatosDelEnvio(landing, result.application_code, datosDelFormulario(formData));
          // Nombre de la card de cada equipo (BAL-5407): `/status` trae el
          // `product.name` interno y la confirmación tiene que mostrar el mismo
          // nombre que vio la persona en el catálogo.
          guardarNombresDelEnvio(landing, result.application_code, allProducts);

          // La sesión de tracking NO se suelta acá: la confirmación es la que
          // emite `application_submitted` con el `application_code`, y tiene
          // que caer sobre la misma fila que ws2 acaba de marcar con el
          // `application_id`. Se marca y se renueva al arrancar otra solicitud
          // (`solicitar/layout.tsx`).
          //
          // Se marca SIEMPRE, tambien con `stayInWizard`: la sesión convirtió,
          // creó una solicitud. Si no se marcara, la siguiente solicitud de la
          // pestaña reusaría esta sesión y el submit idempotente de ws2 le
          // devolvería la solicitud vieja —200, sin crear nada y sin avisar a
          // legacy— para siempre. Es lo que pasó probando en local.
          if (!keepData) marcarSesionConvertida();

          // Clear all wizard state (skip if keepData param is set for testing)
          // Con `stayInWizard` tampoco: los pasos que faltan muestran el
          // resumen de lo que la persona acaba de completar, y limpiarlo los
          // dejaría en blanco.
          if (!keepData && !stayInWizard) {
            resetFormStartTracking();
            resetForm();
            clearProduct();
            clearCartProducts();
            clearAccessories();
            clearInsurance();
            clearCouponAfterSubmit();
            // Consent checkboxes. Nothing used to clear these, so the next
            // person to use the device opened the form with the terms already
            // marked as accepted by someone else (BAL-2657).
            clearConsentStorage(landing);
            // Clear catalog cart (lives in separate layer)
            try { localStorage.removeItem(`baldecash-${landing}-cart`); } catch {}
          }

          // Show success toast
          onToast?.('Solicitud enviada correctamente', 'success');

          succeeded = true;

          // El OTP dejó de ser un gate obligatorio: ya NO redirigimos a
          // `…/solicitar/verificacion`. Sin embargo, cuando la landing tiene OTP
          // habilitado y tenemos application_id, seguimos persistiendo el handoff.
          // Ese handoff es la señal que /confirmacion usa para mostrar el CTA
          // opcional ("Validar mi correo") y guarda el DNI (PII) que la pantalla
          // de OTP necesita para prellenar el auto-envío.
          if (otpEnabled && result.application_id) {
            saveOtpHandoff(landing, {
              applicationId: result.application_id,
              code: result.application_code,
              token: result.public_token,
              dni: capturedDocumentNumber,
              verified: false,
            });
          }

          // Mantener `isSubmitting` en true hasta navegar: si lo apagábamos
          // aquí, el loader desaparecía ~1s entre el fin del submit y el
          // router.push (flash antes de KYC). El componente se desmonta al
          // navegar; el `finally` solo resetea el loader en caso de error.

          // Cuando la landing habilita `kyc` (hoy solo copia-home), pasamos por
          // los pasos posteriores de verificación antes del resumen. En el resto
          // de landings (kyc apagado) el comportamiento es el de siempre: directo
          // a confirmación.
          // Rechazada o cancelada en el propio submit: la pantalla del
          // contrato no tiene nada que mostrarle. Se va derecho a "solicitud
          // recibida", que es donde iba a terminar igual.
          const cerrada = naceCerrada(result.status);

          // Envío anticipado: la solicitud ya existe pero el wizard sigue. Se
          // deja el handoff y se devuelve el control a quien llamó, que sabe
          // cuál es la pantalla siguiente. Navegar acá mandaría a la persona
          // fuera del formulario que todavía está llenando.
          if (stayInWizard) {
            if (cerrada) {
              // `replace` y no `push`: volver atrás desde la confirmación no
              // tiene que devolver a un paso del wizard que ya no aplica.
              router.replace(
                routes.solicitarConfirmacion(
                  landing, result.application_code, false, result.public_token
                )
              );
              // `false` NO es "falló el envío" —la solicitud se creó y
              // `submitSucceeded` lo dice—: es "no sigas navegando vos, esta
              // pantalla ya navegó". Sin esto, quien llamó empuja el paso del
              // contrato encima de la confirmación.
              return false;
            }

            // Sin código no hay handoff: la pantalla siguiente no tendría de
            // qué hablar, y un handoff a medias es peor que ninguno porque la
            // haría creer que ya hay solicitud.
            if (result.application_code) {
              saveEnvioAnticipadoHandoff(landing, {
                applicationCode: result.application_code,
                publicToken: result.public_token,
                resumeToken: result.kyc_resume_token || undefined,
                documentNumber: capturedDocumentNumber,
                conContrato,
                sessionUuid,
              });
            }
            return true;
          }

          if (kycEnabled && !cerrada) {
            // Con el token del submit se va a la pagina tokenizada: el KYC lo
            // usa como prueba de titularidad y NO tiene que pedir el DNI. Es el
            // mismo token del link de "continuar despues" (hasheado, con TTL y
            // revocable), a diferencia del `application_code`, que es
            // secuencial y adivinable.
            //
            // Sin token —el mint es best-effort y nunca bloquea el submit— cae
            // a la ruta por codigo de siempre, que pide el DNI.
            router.push(
              result.kyc_resume_token
                ? `/prototipos/0.6/kyc/${result.kyc_resume_token}`
                : routes.solicitarKyc(landing, { code: result.application_code })
            );
          } else {
            router.push(
              routes.solicitarConfirmacion(
                landing, result.application_code, false, result.public_token
              )
            );
          }

          return true;
        } else {
          // La unidad tomada va al modal si el caller lo maneja; si no, cae al
          // toast. El evento dice cuál vio la persona (BAL-5207, `surface`).
          const unidadTomada = result.error_code === 'UNIT_OUT_OF_STOCK';
          const unidadTomadaAlModal = unidadTomada && !!onUnidadTomada;
          analytics.track('form_submit_error', {
            error_code: result.error_code ?? 'unknown',
            stage: 'api_response',
            ...(unidadTomada ? { surface: unidadTomadaAlModal ? 'modal' : 'toast' } : {}),
          });
          setSubmitStage('error');
          // Mensajes por código. Se escriben acá y no se toma el del API
          // porque el backend los manda sin tildes (viajan por varios sistemas
          // que no siempre respetan el encoding) y porque el texto tiene que
          // decir qué hacer, no solo qué pasó.
          const MENSAJES: Record<string, string> = {
            PRODUCT_DISABLED:
              'Uno o más productos de tu solicitud ya no están disponibles. ' +
              'Por favor vuelve atrás y revisa tu selección.',
            // Reacondicionados: cada equipo es una unidad única con su serial,
            // así que dos personas no pueden llevarse la misma laptop.
            //
            // El texto NO dice "otra persona la tomó": el backend responde lo
            // mismo cuando alguien se adelantó y cuando la card ya estaba sin
            // stock en una pestaña vieja. Afirmar la causa equivocada suena a
            // excusa. Lo que importa es qué hacer.
            //
            // El código es UNIT_OUT_OF_STOCK y no OUT_OF_STOCK a propósito.
            // Este mensaje es de reacondicionados y solo de reacondicionados:
            // el stock por unidad física rige únicamente en las landings de
            // `catalog_unit_stock.landing_ids`. `OUT_OF_STOCK` es el otro
            // stock —el de conteo, `stock_ws2_managed`— y está vivo en una
            // decena de landings ajenas (copia-home, renueva-tu-equipo,
            // family-farms, remate-ucv...) que nunca pidieron este texto y a
            // las que hay que dejarles el mensaje que ya tenían.
            // Sin repetir "ya no está disponible": eso lo dice el título del
            // modal. Acá va el porqué y el qué hacer.
            UNIT_OUT_OF_STOCK:
              'Era la última unidad de ese modelo y se agotó mientras ' +
              'completabas la solicitud. Elige otro equipo del catálogo para ' +
              'continuar.',
            // BAL-4029. Los tres códigos de abajo los emiten los guards de
            // pricing del submit, y todos nacen del mismo hecho: el plan de
            // pago que viaja en el carrito no es uno de los que el catálogo
            // ofrece hoy para ese equipo.
            //
            // La causa casi nunca es que el cliente eligiera mal: es un
            // carrito guardado en `localStorage` días atrás, o una frecuencia
            // que negocio apagó en el medio. Por eso el texto no acusa ("tu
            // selección es inválida") sino que explica que el plan cambió y
            // manda a reelegirlo, que es lo único que destraba.
            //
            // No se reusa PRODUCT_DISABLED porque el equipo SÍ está
            // disponible: lo que no está es esa combinación de plan y plazo.
            // Mandar a "revisa tu selección" haría buscar un problema en el
            // producto, que se ve bien.
            PRICING_FREQUENCY_NOT_AVAILABLE:
              'El plan de pago que tenías guardado ya no está disponible para ' +
              'este equipo. Vuelve al catálogo y elige nuevamente tu plan ' +
              'para continuar.',
            // Mensaje aparte del de frecuencia: acá la modalidad sí existe
            // (semanal, quincenal…) y lo que cambió es el número de cuotas.
            // Decirle "tu plan de pago no está disponible" a quien sigue
            // pudiendo pagar semanalmente lo manda a buscar el error donde no
            // está.
            PRICING_TERM_NOT_AVAILABLE:
              'El plazo que tenías guardado ya no está disponible para este ' +
              'equipo. Vuelve al catálogo y elige nuevamente tu plan de pago ' +
              'para continuar.',
            // El submit llegó sin frecuencia y el equipo no se vende en
            // mensual, que es el valor con el que el backend rellena. Para el
            // cliente es el mismo problema y la misma salida que los dos de
            // arriba, así que el texto es el mismo que el de frecuencia: la
            // distinción entre "no llegó" y "llegó algo inválido" es interna.
            PAYMENT_FREQUENCY_MISSING:
              'El plan de pago que tenías guardado ya no está disponible para ' +
              'este equipo. Vuelve al catálogo y elige nuevamente tu plan ' +
              'para continuar.',
            // El límite de usos por DNI solo se revisa al enviar: la
            // validación del resumen no conoce el documento y muestra el
            // cupón como válido. El texto del API dice qué pasó pero no qué
            // hacer, y la única salida es enviar sin el cupón (caso DNI
            // 60477990, 22-09-2026: ~10 envíos rechazados sin explicación).
            // El cupo de la campaña se llenó mientras la persona llenaba
            // (BAL-4969, casuísticas). El texto de ws2 viene sin tildes.
            APPLICATION_CAP_REACHED:
              'Por ahora no estamos recibiendo más solicitudes: se llenaron ' +
              'los cupos de esta campaña. Si ya enviaste la tuya, sigue su ' +
              'curso con normalidad y te vamos a contactar.',
            COUPON_USER_LIMIT_REACHED:
              'Ya usaste este cupón en otra solicitud. Quítalo para enviar ' +
              'esta solicitud.',
            // Link especial (BAL-5191): ws2 los manda sin tildes.
            SPECIAL_LINK_DNI_MISMATCH: 'Este link es personal y no corresponde a tu DNI.',
            SPECIAL_LINK_INVALID:
              'Tu link especial venció o ya se usó. Pídele uno nuevo a tu asesora.',
          };
          const msg =
            (result.error_code ? MENSAJES[result.error_code] : undefined) ||
            // Solo texto: un `error` lista u objeto tumbaba el aviso (BAL-4969).
            (typeof result.error === 'string' ? result.error : undefined) ||
            'Error al enviar la solicitud. Por favor intenta nuevamente.';
          setError(msg);
          if (result.error_code === ERROR_CODE_ENVIO_SIN_CONFIRMAR) marcarEnvioSinConfirmar(sessionUuid);
          // La unidad tomada va al modal si el caller lo maneja; si no, cae al
          // toast, que es el comportamiento de siempre. Nunca los dos: dos
          // avisos del mismo hecho se leen como dos problemas distintos.
          if (unidadTomadaAlModal && onUnidadTomada) {
            onUnidadTomada(msg);
          } else if (
            (result.error_code === 'SPECIAL_LINK_DNI_MISMATCH' ||
              result.error_code === 'SPECIAL_LINK_INVALID') &&
            onLinkEspecialRechazado
          ) {
            onLinkEspecialRechazado(msg);
          } else {
            onToast?.(msg, 'error');
          }
          return false;
        }
      } catch (err) {
        // `submitApplication` no lanza (la red se resuelve adentro): lo que
        // llega acá es una excepción del código de esta pantalla. Antes se
        // pintaba como "Error de conexión" y no quedaba rastro en Sentry.
        console.error('Error submitting application:', err);
        Sentry.captureException(err, {
          tags: {
            modulo: 'solicitud',
            accion: 'submit',
            despues_del_envio: envioAceptado ? 'si' : 'no',
          },
          extra: { landing, session_uuid: sessionUuid },
        });
        if (envioAceptado) {
          // La solicitud ya existe: se llega a la confirmación igual.
          setSubmitStage('success');
          setSubmitSucceeded(true);
          succeeded = true;
          if (stayInWizard) return true;
          router.push(
            routes.solicitarConfirmacion(landing, envioAceptado.code, false, envioAceptado.token)
          );
          return true;
        }
        analytics.track('form_submit_error', {
          error_code: 'client_exception',
          stage: 'client',
        });
        setSubmitStage('error');
        setError(MENSAJE_ERROR_INESPERADO);
        onToast?.(MENSAJE_ERROR_INESPERADO, 'error');
        return false;
      } finally {
        // Limpiar timeout de "slow"
        if (slowTimeoutRef.current) {
          clearTimeout(slowTimeoutRef.current);
          slowTimeoutRef.current = null;
        }
        // Solo resetear si NO fue exitoso — en éxito, el componente se
        // desmonta con router.push() y no necesita limpieza. Esto evita
        // una ventana donde el botón se re-habilita antes del redirect.
        // El candado sigue cerrado tras un éxito que navega (el componente
        // se va); con `stayInWizard` el formulario sigue y se libera.
        if (!succeeded || stayInWizard) enVueloRef.current = false;
        if (!succeeded) {
          setIsSubmitting(false);
          setTimeout(() => setSubmitStage('idle'), 100);
        }
      }
    },
    [
      sessionUuid,
      wizardConfig,
      onUnidadTomada,
      onLinkEspecialRechazado,
      getAllProducts,
      selectedAccessories,
      selectedInsurance,
      selectedInsurances,
      appliedCoupon,
      mapFormData,
      getDiscountAmount,
      getDiscountedMonthlyPayment,
      getTotalPrice,
      getTotalMonthlyPayment,
      marcarSesionConvertida,
      resetForm,
      clearProduct,
      clearCartProducts,
      clearAccessories,
      clearInsurance,
      clearCouponAfterSubmit,
      router,
      landing,
      onToast,
    ]
  );

  return {
    submit,
    isSubmitting,
    submitStage,
    submitMessage: SUBMIT_STAGE_MESSAGES[submitStage],
    error,
    submitSucceeded,
  };
}
