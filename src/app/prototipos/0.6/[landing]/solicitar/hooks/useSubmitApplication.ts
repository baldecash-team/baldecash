'use client';

/**
 * useSubmitApplication - Hook for submitting the application
 * Extracts submit logic to be reusable from both segurosClient and StepClient
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProduct } from '../context/ProductContext';
import { useWizard } from '../context/WizardContext';
import { useSession } from '../context/SessionContext';
import {
  submitApplication,
  type SubmitApplicationRequest,
  type UploadedFileData,
} from '../../../services/applicationApi';
import { resetFormStartTracking } from './useFieldTracking';
interface UseSubmitApplicationOptions {
  /**
   * Callback for showing toast notifications
   */
  onToast?: (message: string, type: 'success' | 'error') => void;
}

interface SubmitOptions {
  /**
   * Selected insurance ID (null if no insurance selected or insurance disabled)
   */
  insuranceId?: string | null;
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
  slow: 'Esto está tardando más de lo esperado. Por favor espera...',
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [error, setError] = useState<string | null>(null);
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
    appliedCoupon,
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
        mapped[key] = fieldState.value;
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
      const { insuranceId = null } = submitOptions;

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

      // Iniciar timeout para mensaje "slow" después de 15 segundos
      slowTimeoutRef.current = setTimeout(() => {
        setSubmitStage('slow');
      }, 15000);

      try {
        // Map form data and extract files from wizard context
        const { data: mappedFormData, files: uploadFiles } = mapFormData();

        // Cambiar a estado "uploading" si hay archivos, sino directo a "processing"
        if (uploadFiles.length > 0) {
          setSubmitStage('uploading');
        } else {
          setSubmitStage('processing');
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
          term_months: primaryProduct.months,
          initial_percent: primaryProduct.initialPercent ?? 0, // Send selection, backend calculates amounts
          // Frontend-calculated values as hints (backend will recalculate)
          unit_price: primaryProduct.price,
          // Multiple products array
          products: allProducts.map((p) => ({
            product_id: parseInt(p.id, 10),
            variant_id: p.variantId ? parseInt(p.variantId, 10) : undefined,
            quantity: 1,
            unit_price: p.price,
            monthly_price: p.monthlyPayment,  // Cuota mensual con intereses
            initial_percent: p.initialPercent ?? 0,
          })),
          // Map accessories (backend calculates monthly quotas)
          accessories: selectedAccessories.map((acc) => ({
            accessory_id: parseInt(acc.id, 10),
          })),
          // Add insurance if selected
          ...(insuranceId && {
            insurance_id: parseInt(insuranceId, 10),
          }),
        };

        // Cambiar a "processing" antes de enviar (si estábamos en uploading)
        setSubmitStage('processing');

        // Submit application (with files if any)
        const result = await submitApplication({
          session_uuid: sessionUuid,
          form_data: mappedFormData,
          product_data: productData,
          coupon_code: appliedCoupon?.code,
          files: uploadFiles.length > 0 ? uploadFiles : undefined,
        });

        if (result.success && result.public_token) {
          // Limpiar timeout de "slow"
          if (slowTimeoutRef.current) {
            clearTimeout(slowTimeoutRef.current);
            slowTimeoutRef.current = null;
          }
          setSubmitStage('success');

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
          }

          // Show success toast
          onToast?.('Solicitud enviada correctamente', 'success');

          // Redirect to confirmation page with public token (UUID - secure)
          succeeded = true;
          router.push(
            `/prototipos/0.6/${landing}/solicitar/confirmacion?code=${result.public_token}`
          );

          return true;
        } else {
          // Show error
          setSubmitStage('error');
          const msg = result.error || 'Error al enviar la solicitud. Por favor intenta nuevamente.';
          setError(msg);
          onToast?.(msg, 'error');
          return false;
        }
      } catch (err) {
        console.error('Error submitting application:', err);
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
      appliedCoupon,
      mapFormData,
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
  };
}
