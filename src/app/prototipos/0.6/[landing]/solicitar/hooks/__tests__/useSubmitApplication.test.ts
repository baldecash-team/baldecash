/**
 * Tests for useSubmitApplication hook
 * Tests the submit application logic
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubmitApplication } from '../useSubmitApplication';

// Mock next/navigation
const mockPush = jest.fn();
const mockParams = { landing: 'test-landing' };

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
}));

// Mock contexts with complete implementation
const mockSelectedProduct = {
  id: '1',
  name: 'Test Product',
  price: 1000,
  months: 12,
};

const mockSelectedAccessories = [
  { id: '1', name: 'Accessory 1', price: 50 },
];

const mockAppliedCoupon = { code: 'TEST10', discount: 10 };

const mockFormData = {
  nombres: { value: 'John', error: null },
  apellido_paterno: { value: 'Doe', error: null },
  email: { value: 'john@example.com', error: null },
};

const mockSessionUuid = 'test-session-uuid';

const mockClearSession = jest.fn();
const mockResetForm = jest.fn();
const mockClearProduct = jest.fn();
const mockClearCartProducts = jest.fn();
const mockClearAccessories = jest.fn();
const mockClearInsurance = jest.fn();
const mockClearCoupon = jest.fn();

const mockSelectedInsurance = { id: '1', name: 'Protección', monthlyPrice: 45 };

jest.mock('../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedProduct: mockSelectedProduct,
    cartProducts: [],
    getAllProducts: () => [mockSelectedProduct],
    selectedAccessories: mockSelectedAccessories,
    selectedInsurance: mockSelectedInsurance,
    appliedCoupon: mockAppliedCoupon,
    getDiscountedMonthlyPayment: () => 90,
    getTotalPrice: () => 1080,
    clearProduct: mockClearProduct,
    clearCartProducts: mockClearCartProducts,
    clearAccessories: mockClearAccessories,
    clearInsurance: mockClearInsurance,
    clearCoupon: mockClearCoupon,
  }),
}));

jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: mockFormData,
    resetForm: mockResetForm,
  }),
}));

jest.mock('../../context/SessionContext', () => ({
  useSession: () => ({
    sessionUuid: mockSessionUuid,
    clearSession: mockClearSession,
  }),
}));

// Mock applicationApi
const mockSubmitApplication = jest.fn();
jest.mock('../../../../services/applicationApi', () => ({
  submitApplication: (...args: unknown[]) => mockSubmitApplication(...args),
}));

describe('useSubmitApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful submission', () => {
    it('submits application and redirects on success', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_code: 'APP-123',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      let success: boolean = false;
      await act(async () => {
        success = await result.current.submit();
      });

      expect(success).toBe(true);
      expect(mockSubmitApplication).toHaveBeenCalledWith({
        session_uuid: mockSessionUuid,
        form_data: {
          nombres: 'John',
          apellido_paterno: 'Doe',
          email: 'john@example.com',
        },
        product_data: expect.objectContaining({
          product_id: 1,
          term_months: 12,
          monthly_payment: 90,
          total_amount: 1080,
          unit_price: 1000,
          products: expect.arrayContaining([
            expect.objectContaining({
              product_id: 1,
              quantity: 1,
              unit_price: 1000,
              final_price: 1000,
            }),
          ]),
        }),
        coupon_code: 'TEST10',
      });

      // Should clear all state
      expect(mockClearSession).toHaveBeenCalled();
      expect(mockResetForm).toHaveBeenCalled();
      expect(mockClearProduct).toHaveBeenCalled();
      expect(mockClearCartProducts).toHaveBeenCalled();
      expect(mockClearAccessories).toHaveBeenCalled();
      expect(mockClearInsurance).toHaveBeenCalled();
      expect(mockClearCoupon).toHaveBeenCalled();

      // Should show success toast
      expect(onToast).toHaveBeenCalledWith('Solicitud enviada correctamente', 'success');

      // Should redirect to confirmation page with code only (no product data in URL)
      expect(mockPush).toHaveBeenCalledWith(
        '/prototipos/0.6/test-landing/solicitar/confirmacion?code=APP-123'
      );
    });

    it('includes insurance_id and insurance_premium when provided', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_code: 'APP-456',
      });

      const { result } = renderHook(() => useSubmitApplication());

      await act(async () => {
        await result.current.submit({ insuranceId: '5' });
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          product_data: expect.objectContaining({
            insurance_id: 5,
            insurance_premium: 45, // From mockSelectedInsurance.monthlyPrice
          }),
        })
      );
    });

    it('includes accessories in product_data', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_code: 'APP-789',
      });

      const { result } = renderHook(() => useSubmitApplication());

      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          product_data: expect.objectContaining({
            accessories: [{ accessory_id: 1, price: 50 }],
          }),
        })
      );
    });
  });

  describe('API errors', () => {
    it('handles API error response', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error: 'Error del servidor',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      let success: boolean = true;
      await act(async () => {
        success = await result.current.submit();
      });

      expect(success).toBe(false);
      expect(onToast).toHaveBeenCalledWith('Error del servidor', 'error');
      expect(mockClearSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles network error', async () => {
      mockSubmitApplication.mockRejectedValueOnce(new Error('Network error'));

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      let success: boolean = true;
      await act(async () => {
        success = await result.current.submit();
      });

      expect(success).toBe(false);
      expect(onToast).toHaveBeenCalledWith(
        'Error de conexión. Por favor intenta nuevamente.',
        'error'
      );
    });

    it('shows generic error when API fails without error message', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      await act(async () => {
        await result.current.submit();
      });

      expect(onToast).toHaveBeenCalledWith(
        'Error al enviar la solicitud. Por favor intenta nuevamente.',
        'error'
      );
    });
  });

  describe('hook state', () => {
    it('starts with isSubmitting false and no error', () => {
      const { result } = renderHook(() => useSubmitApplication());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error on API failure', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error: 'Custom error',
      });

      const { result } = renderHook(() => useSubmitApplication());

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.error).toBe('Custom error');
    });

    it('clears error on new submission', async () => {
      mockSubmitApplication
        .mockResolvedValueOnce({ success: false, error: 'First error' })
        .mockResolvedValueOnce({ success: true, application_code: 'APP-100' });

      const { result } = renderHook(() => useSubmitApplication());

      // First submission fails
      await act(async () => {
        await result.current.submit();
      });
      expect(result.current.error).toBe('First error');

      // Second submission succeeds - error should be cleared
      await act(async () => {
        await result.current.submit();
      });
      expect(result.current.error).toBe(null);
    });
  });
});
