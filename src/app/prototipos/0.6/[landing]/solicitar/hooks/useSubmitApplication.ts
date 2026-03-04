'use client';

/**
 * useSubmitApplication - Hook for submitting the application
 * Extracts submit logic to be reusable from both segurosClient and StepClient
 */

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProduct } from '../context/ProductContext';
import { useWizard } from '../context/WizardContext';
import { useSession } from '../context/SessionContext';
import { submitApplication, type SubmitApplicationRequest } from '../../../services/applicationApi';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get data from contexts
  const {
    selectedProduct,
    selectedAccessories,
    appliedCoupon,
    getDiscountedMonthlyPayment,
    getTotalPrice,
    clearProduct,
    clearAccessories,
    clearCoupon,
  } = useProduct();

  const { formData, resetForm } = useWizard();
  const { sessionUuid, clearSession } = useSession();

  /**
   * Maps WizardContext formData to the API form_data format
   * Extracts only the value from each FieldState
   */
  const mapFormData = useCallback((): Record<string, string | number | boolean> => {
    const mapped: Record<string, string | number | boolean> = {};

    for (const [key, fieldState] of Object.entries(formData)) {
      if (fieldState?.value !== undefined && fieldState.value !== '') {
        // Handle arrays (like file inputs)
        if (Array.isArray(fieldState.value)) {
          // Skip file arrays for now, or convert to string if needed
          continue;
        }
        mapped[key] = fieldState.value;
      }
    }

    return mapped;
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

      // Validate product is selected
      if (!selectedProduct) {
        const msg = 'No hay producto seleccionado.';
        setError(msg);
        onToast?.(msg, 'error');
        return false;
      }

      setIsSubmitting(true);

      try {
        // Map form data from wizard context
        const mappedFormData = mapFormData();

        // Build product_data for API
        const productData: SubmitApplicationRequest['product_data'] = {
          product_id: parseInt(selectedProduct.id, 10),
          term_months: selectedProduct.months,
          monthly_payment: getDiscountedMonthlyPayment(),
          total_amount: getTotalPrice(),
          unit_price: selectedProduct.price,
          initial_payment: 0, // Can be extended if initial payment feature is added
          // Map accessories
          accessories: selectedAccessories.map((acc) => ({
            accessory_id: parseInt(acc.id, 10),
            price: acc.price,
          })),
          // Add insurance if selected
          ...(insuranceId && { insurance_id: parseInt(insuranceId, 10) }),
        };

        // Submit application
        const result = await submitApplication({
          session_uuid: sessionUuid,
          form_data: mappedFormData,
          product_data: productData,
          coupon_code: appliedCoupon?.code,
        });

        if (result.success && result.application_code) {
          // Clear all wizard state
          clearSession();
          resetForm();
          clearProduct();
          clearAccessories();
          clearCoupon();

          // Show success toast
          onToast?.('Solicitud enviada correctamente', 'success');

          // Redirect to confirmation page with application code
          router.push(
            `/prototipos/0.6/${landing}/solicitar/confirmacion?code=${encodeURIComponent(
              result.application_code
            )}`
          );

          return true;
        } else {
          // Show error
          const msg = result.error || 'Error al enviar la solicitud. Por favor intenta nuevamente.';
          setError(msg);
          onToast?.(msg, 'error');
          return false;
        }
      } catch (err) {
        console.error('Error submitting application:', err);
        const msg = 'Error de conexión. Por favor intenta nuevamente.';
        setError(msg);
        onToast?.(msg, 'error');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      sessionUuid,
      selectedProduct,
      selectedAccessories,
      appliedCoupon,
      mapFormData,
      getDiscountedMonthlyPayment,
      getTotalPrice,
      clearSession,
      resetForm,
      clearProduct,
      clearAccessories,
      clearCoupon,
      router,
      landing,
      onToast,
    ]
  );

  return {
    submit,
    isSubmitting,
    error,
  };
}
