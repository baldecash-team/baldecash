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
import {
  submitApplication,
  type SubmitApplicationRequest,
  type UploadedFileData,
} from '../../../services/applicationApi';

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

      setIsSubmitting(true);

      try {
        // Map form data and extract files from wizard context
        const { data: mappedFormData, files: uploadFiles } = mapFormData();

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

        // Submit application (with files if any)
        const result = await submitApplication({
          session_uuid: sessionUuid,
          form_data: mappedFormData,
          product_data: productData,
          coupon_code: appliedCoupon?.code,
          files: uploadFiles.length > 0 ? uploadFiles : undefined,
        });

        if (result.success && result.public_token) {
          // Clear all wizard state
          clearSession();
          resetForm();
          clearProduct();
          clearCartProducts();
          clearAccessories();
          clearInsurance();
          clearCoupon();

          // Show success toast
          onToast?.('Solicitud enviada correctamente', 'success');

          // Redirect to confirmation page with public token (UUID - secure)
          router.push(
            `/prototipos/0.6/${landing}/solicitar/confirmacion?code=${result.public_token}`
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
    error,
  };
}
