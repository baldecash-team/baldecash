'use client';

/**
 * useSubmitApplication - Hook for submitting the application
 * Extracts submit logic to be reusable from both segurosClient and StepClient
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useProduct } from '../context/ProductContext';
import { useWizard, FILE_PENDING_REUPLOAD } from '../context/WizardContext';
import { useSession } from '../context/SessionContext';
import {
  submitApplication,
  type SubmitApplicationRequest,
  type UploadedFileData,
} from '../../../services/applicationApi';
import { resetFormStartTracking } from './useFieldTracking';
import { clearConsentStorage } from '../utils/consentStorage';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { saveOtpHandoff } from '../utils/otpHandoff';
import {
  isDemoLanding,
  buildDemoApplication,
  generateDemoApplicationCode,
  saveDemoApplication,
  DEMO_SUBMIT_DELAY_MS,
} from '../utils/demoApplication';
import { normalizeEmail } from '../../../services/emailValidation';
import {
  readJuicySessionId,
  markJuicyComplete,
  restartJuicySession,
} from '../../../services/juicyScore';

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
 * Convert raw term (in payment_frequency units) to calendar months.
 * 4 weeks ≈ 1 month, 2 fortnights = 1 month.
 */
function termToMonths(term: number, frequency?: string): number {
  if (frequency === 'semanal') return Math.round(term / 4);
  if (frequency === 'quincenal') return Math.round(term / 2);
  return term; // mensual or unknown → assume already in months
}

interface UseSubmitApplicationOptions {
  /**
   * Callback for showing toast notifications
   */
  onToast?: (message: string, type: 'success' | 'error') => void;
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
}

/**
 * Extrae, best-effort, el número de documento del form ya mapeado para
 * prellenar el gate de OTP. Busca claves conocidas y, como último recurso, un
 * valor de 8 dígitos (formato DNI). No es crítico: si no lo encuentra, el gate
 * pide el DNI manualmente.
 */
function extractDocumentNumber(
  formData: Record<string, string | number | boolean>
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
  const { onToast } = options;

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
    clearProduct,
    clearCartProducts,
    clearAccessories,
    clearInsurance,
    clearCoupon,
  } = useProduct();

  const { formData, resetForm } = useWizard();
  const { sessionUuid, clearSession } = useSession();

  /**
   * Maps WizardContext formData to the API form_data format
   * Extracts only the value from each FieldState
   * Also extracts files from file fields
   */
  const mapFormData = useCallback((): {
    data: Record<string, string | number | boolean>;
    files: UploadedFileData[];
  } => {
    const mapped: Record<string, string | number | boolean> = {};
    const files: UploadedFileData[] = [];

    for (const [key, fieldState] of Object.entries(formData)) {
      // Skip internal fields (prefixed with _) — they control UI state only
      if (key.startsWith('_')) continue;
      // Skip file reupload markers (file was lost on refresh, not a real value)
      if (fieldState?.value === FILE_PENDING_REUPLOAD) continue;
      if (fieldState?.value !== undefined && fieldState.value !== '') {
        // Handle file arrays
        if (Array.isArray(fieldState.value)) {
          // Check if this is a file array (UploadedFile objects from FileUpload component)
          for (const item of fieldState.value) {
            if (item && typeof item === 'object' && 'file' in item && item.file instanceof File) {
              // Extract field code from the key (remove any suffix like _123456)
              const fieldCode = key.includes('_') ? key.split('_')[0] : key;
              files.push({
                fieldCode,
                file: item.file,
              });
            }
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
      const { insuranceId = null, insuranceIds, otpEnabled = false, kycEnabled = false } = submitOptions;

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

      // Validate at least one product is selected
      if (allProducts.length === 0) {
        const msg = 'No hay producto seleccionado.';
        setError(msg);
        onToast?.(msg, 'error');
        return false;
      }

      let succeeded = false;
      setIsSubmitting(true);
      setSubmitStage('validating');

      // Emit summary_submit right at the start of the submission flow.
      // Incluye totales calculables desde los datos ya disponibles.
      try {
        const totalMonthly = allProducts.reduce((sum, p) => sum + (p.monthlyPayment || 0), 0);
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
        if (isDemoLanding(landing)) {
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

          analytics.track('form_submit_success', {
            product_count: allProducts.length,
            accessory_count: selectedAccessories.length,
            demo: true,
          });

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
            clearSession();
            resetFormStartTracking();
            resetForm();
            clearProduct();
            clearCartProducts();
            clearAccessories();
            clearInsurance();
            clearCoupon();
            clearConsentStorage(landing);
            try { localStorage.removeItem(`baldecash-${landing}-cart`); } catch {}
          }

          onToast?.('Solicitud enviada correctamente', 'success');
          succeeded = true;

          // Ni OTP ni KYC: ambos necesitan un `application_id` real en ws2.
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
          payment_frequency: primaryProduct.paymentFrequency,
          // Multiple products array
          products: allProducts.map((p) => ({
            product_id: parseInt(p.id, 10),
            variant_id: p.variantId ? parseInt(p.variantId, 10) : undefined,
            quantity: 1,
            unit_price: p.price,
            monthly_price: p.monthlyPayment,  // Cuota mensual con intereses
            term: p.term ?? p.months,
            term_months: termToMonths(p.term ?? p.months, p.paymentFrequency),
            initial_percent: p.initialPercent ?? 0,
            initial_amount: p.initialAmount ?? 0,
            payment_frequency: p.paymentFrequency,
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
        };

        // Cambiar a "processing" antes de enviar (si estábamos en uploading)
        setSubmitStage('processing');

        // JuicyScore: marcar el formulario como completado (equivale al
        // `completeButton` de su config) y adjuntar el session_id del pixel para
        // que el backend pueda hacer el GetScore. Todo esto es no-op si la
        // integración no está configurada.
        markJuicyComplete();
        const juicySessionId = readJuicySessionId(landing);

        // Submit application (with files if any)
        const result = await submitApplication({
          session_uuid: sessionUuid,
          form_data: mappedFormData,
          product_data: productData,
          coupon_code: appliedCoupon?.code,
          juicyscore_session_id: juicySessionId ?? undefined,
          files: uploadFiles.length > 0 ? uploadFiles : undefined,
        });

        if (result.success) {
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

          // Capturar el DNI ANTES de limpiar el form, para prellenar el gate de OTP.
          const capturedDocumentNumber = extractDocumentNumber(mappedFormData);

          // Clear all wizard state (skip if keepData param is set for testing)
          if (!keepData) {
            clearSession();
            resetFormStartTracking();
            resetForm();
            clearProduct();
            clearCartProducts();
            clearAccessories();
            clearInsurance();
            clearCoupon();
            // Consent checkboxes. Nothing used to clear these, so the next
            // person to use the device opened the form with the terms already
            // marked as accepted by someone else (BAL-2657).
            clearConsentStorage(landing);
            // Clear catalog cart (lives in separate layer)
            try { localStorage.removeItem(`baldecash-${landing}-cart`); } catch {}
            // El pixel de JuicyScore no se recarga con el reset del wizard (no hay
            // navegación dura): sin esto, una segunda solicitud en la misma pestaña
            // viajaría con el session_id de la primera.
            void restartJuicySession(landing);
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
          if (kycEnabled) {
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
              routes.solicitarConfirmacion(landing, result.application_code)
            );
          }

          return true;
        } else {
          // Show error
          analytics.track('form_submit_error', {
            error_code: result.error_code ?? 'unknown',
            stage: 'api_response',
          });
          setSubmitStage('error');
          const msg = result.error_code === 'PRODUCT_DISABLED'
            ? 'Uno o más productos de tu solicitud ya no están disponibles. Por favor vuelve atrás y revisa tu selección.'
            : (result.error || 'Error al enviar la solicitud. Por favor intenta nuevamente.');
          setError(msg);
          onToast?.(msg, 'error');
          return false;
        }
      } catch (err) {
        console.error('Error submitting application:', err);
        analytics.track('form_submit_error', {
          error_code: 'network_error',
          stage: 'connection',
        });
        setSubmitStage('error');
        const msg = 'Error de conexión. Por favor intenta nuevamente.';
        setError(msg);
        onToast?.(msg, 'error');
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
        if (!succeeded) {
          setIsSubmitting(false);
          setTimeout(() => setSubmitStage('idle'), 100);
        }
      }
    },
    [
      sessionUuid,
      getAllProducts,
      selectedAccessories,
      selectedInsurance,
      selectedInsurances,
      appliedCoupon,
      mapFormData,
      getDiscountAmount,
      getDiscountedMonthlyPayment,
      getTotalPrice,
      clearSession,
      resetForm,
      clearProduct,
      clearCartProducts,
      clearAccessories,
      clearInsurance,
      clearCoupon,
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
