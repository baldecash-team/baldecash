/**
 * Tests for useSubmitApplication hook
 * Tests the submit application logic
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubmitApplication } from '../useSubmitApplication';
import { calcularPrellenado, marcadoresDeBloqueo } from '../useLeadPrefill';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { readDemoApplication } from '../../utils/demoApplication';
import type { LeadPrefill } from '@/app/prototipos/0.6/services/leadPrefillApi';
import type { WizardStep } from '../../../../services/wizardApi';

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
  { id: '1', name: 'Accessory 1', price: 50, monthlyQuota: 5 },
];

const mockAppliedCoupon = {
  code: 'TEST10',
  discount: 10,
  label: 'Descuento de prueba',
  couponType: 'fixed' as const,
  quotasAffected: undefined,
};

const mockFormData = {
  nombres: { value: 'John', error: null },
  apellido_paterno: { value: 'Doe', error: null },
  email: { value: 'john@example.com', error: null },
};

const mockSessionUuid = 'test-session-uuid';

const mockMarcarSesionConvertida = jest.fn();
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
    selectedInsurances: [mockSelectedInsurance],
    appliedCoupon: mockAppliedCoupon,
    getDiscountAmount: () => 10, // Fixed coupon: returns discount value directly
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
    marcarSesionConvertida: mockMarcarSesionConvertida,
  }),
}));

// Mock useAnalytics (returns no-ops by default)
const mockAnalyticsTrack = jest.fn();
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () =>
    new Proxy(
      { track: mockAnalyticsTrack },
      { get: (target, prop) => (target as Record<string, unknown>)[prop as string] ?? jest.fn() }
    ),
}));

// Mock useFieldTracking (resetFormStartTracking)
jest.mock('../useFieldTracking', () => ({
  resetFormStartTracking: jest.fn(),
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
      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          session_uuid: mockSessionUuid,
          form_data: {
            nombres: 'John',
            apellido_paterno: 'Doe',
            email: 'john@example.com',
          },
          product_data: expect.objectContaining({
            product_id: 1,
            term: 12,
            term_months: 12,
            unit_price: 1000,
            products: expect.arrayContaining([
              expect.objectContaining({
                product_id: 1,
                quantity: 1,
                unit_price: 1000,
              }),
            ]),
          }),
          coupon_code: 'TEST10',
        })
      );

      // Should clear all state. La sesión de tracking se MARCA, no se borra:
      // la confirmación tiene que emitir `application_submitted` sobre la misma
      // fila que ws2 acaba de atar a la solicitud.
      expect(mockMarcarSesionConvertida).toHaveBeenCalled();
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
        routes.solicitarConfirmacion('test-landing', 'APP-123')
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
            accessories: [{ accessory_id: 1 }],
          }),
        })
      );
    });

    // El catalogo lista el producto suelto y cada uno de sus combos como cards
    // distintas, pero todas comparten product_id. Si el submit no manda cual se
    // eligio, el backend solo puede deducirlo del precio — y un combo de regalo
    // (mismo precio que el pelado) queda indistinguible y se pierde.
    describe('combo_id', () => {
      const mutable = mockSelectedProduct as { comboId?: number };
      afterEach(() => { delete mutable.comboId; });

      it('envia combo_id: null cuando se compro el producto suelto', async () => {
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-1' });

        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });

        const payload = mockSubmitApplication.mock.calls[0][0] as {
          product_data: { combo_id?: number | null; products?: { combo_id?: number | null }[] };
        };
        // null explicito, no undefined: el backend distingue "eligio el pelado"
        // de "este front no lo manda".
        expect(payload.product_data.combo_id).toBeNull();
        expect(payload.product_data.products?.[0].combo_id).toBeNull();
      });

      it('envia el combo_id de la card cuando se compro un combo', async () => {
        mutable.comboId = 49;
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-2' });

        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });

        const payload = mockSubmitApplication.mock.calls[0][0] as {
          product_data: { combo_id?: number | null; products?: { combo_id?: number | null }[] };
        };
        expect(payload.product_data.combo_id).toBe(49);
        expect(payload.product_data.products?.[0].combo_id).toBe(49);
      });

      // Red de seguridad: `comboId` se copia a mano en cada punto de entrada al
      // wizard (catalogo, comparador, copia-home, detalle) y es facil que uno
      // nuevo se olvide. El slug siempre viaja y lleva el sufijo `-combo-{id}`.
      it('deduce el combo del slug cuando comboId no viajo', async () => {
        const slugged = mockSelectedProduct as { slug?: string };
        const originalSlug = slugged.slug;
        slugged.slug = 'lenovo-v15-g4-iru-lpleba0000767-combo-37';
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-3' });

        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });

        const payload = mockSubmitApplication.mock.calls[0][0] as {
          product_data: { combo_id?: number | null; products?: { combo_id?: number | null }[] };
        };
        expect(payload.product_data.combo_id).toBe(37);
        expect(payload.product_data.products?.[0].combo_id).toBe(37);
        slugged.slug = originalSlug;
      });
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
      expect(mockMarcarSesionConvertida).not.toHaveBeenCalled();
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

  describe('email normalization', () => {
    const original = mockFormData.email.value;
    afterEach(() => {
      mockFormData.email.value = original;
    });

    /**
     * Prod 2026-08-07: `mailto:cgonzalesas@isise.edu.pe` llegó al backend y Mailgun
     * rechazó el OTP con 400. El input ya limpia lo que se teclea; esto cubre el
     * valor que nunca pasa por ahí (prefill por DNI, restaurado de localStorage).
     */
    it('cleans the email field before sending it to the API', async () => {
      mockFormData.email.value = '  MAILTO:CGonzalesAS@isise.edu.pe ';
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-1' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          form_data: expect.objectContaining({ email: 'cgonzalesas@isise.edu.pe' }),
        })
      );
    });

    it('leaves an unusable value untouched instead of sending an empty string', async () => {
      mockFormData.email.value = 'mailto:';
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-2' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          form_data: expect.objectContaining({ email: 'mailto:' }),
        })
      );
    });
  });

  /**
   * JuicyScore (antifraude). El `session_id` lo emite el pixel y lo deja en
   * sessionStorage; el submit solo lo adjunta. Nada de esto puede impedir que la
   * solicitud se envíe: sin pixel, el campo simplemente no viaja.
   */
  describe('JuicyScore session_id', () => {
    const LANDING = 'test-landing';
    const STORAGE_KEY = `baldecash-${LANDING}-juicy-session`;

    beforeEach(() => {
      mockParams.landing = LANDING;
      sessionStorage.clear();
    });

    afterEach(() => {
      sessionStorage.clear();
    });

    it('adjunta el session_id del pixel cuando existe', async () => {
      sessionStorage.setItem(STORAGE_KEY, 'w.20260813-abc.A_GS');
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-J1' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({ juicyscore_session_id: 'w.20260813-abc.A_GS' })
      );
    });

    it('omite el campo cuando el pixel no llegó a emitir sesión', async () => {
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-J2' });

      const { result } = renderHook(() => useSubmitApplication());
      let success = false;
      await act(async () => {
        success = await result.current.submit();
      });

      expect(success).toBe(true);
      const payload = mockSubmitApplication.mock.calls[0][0] as {
        juicyscore_session_id?: string;
      };
      expect(payload.juicyscore_session_id).toBeUndefined();
    });
  });

  /**
   * Landings demo (`*-demo`): mismo wizard, misma pantalla de confirmación,
   * pero sin crear la solicitud en ws2.
   */
  describe('landing demo', () => {
    const DEMO_LANDING = 'cibertec-express-demo';

    beforeEach(() => {
      mockParams.landing = DEMO_LANDING;
      sessionStorage.clear();
    });

    afterEach(() => {
      mockParams.landing = 'test-landing';
    });

    it('never posts the application to the API', async () => {
      const { result } = renderHook(() => useSubmitApplication());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.submit();
      });

      expect(success).toBe(true);
      expect(mockSubmitApplication).not.toHaveBeenCalled();
    });

    it('redirects to the confirmation with a demo code', async () => {
      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      await act(async () => {
        await result.current.submit();
      });

      expect(mockPush).toHaveBeenCalledTimes(1);
      const target = mockPush.mock.calls[0][0] as string;
      const code = new URL(target, 'https://x').searchParams.get('code');
      expect(code).toMatch(/^SOL-DEMO-[0-9A-F]{8}$/);
      expect(target).toBe(routes.solicitarConfirmacion(DEMO_LANDING, code!));
      expect(onToast).toHaveBeenCalledWith('Solicitud enviada correctamente', 'success');
    });

    it('leaves the application detail in sessionStorage for /confirmacion', async () => {
      const { result } = renderHook(() => useSubmitApplication());

      await act(async () => {
        await result.current.submit();
      });

      const code = new URL(mockPush.mock.calls[0][0] as string, 'https://x')
        .searchParams.get('code');
      const stored = readDemoApplication(DEMO_LANDING, code);

      expect(stored).not.toBeNull();
      expect(stored!.status).toBe('pending');
      expect(stored!.applicant_name).toBe('John Doe');
      expect(stored!.products).toEqual([
        expect.objectContaining({ name: 'Test Product', unit_price: 1000 }),
      ]);
      expect(stored!.accessories).toEqual([{ name: 'Accessory 1', monthly_quota: 5 }]);
      expect(stored!.insurances).toEqual([{ name: 'Protección', monthly_price: 45 }]);
      expect(stored!.coupon).toEqual({ code: 'TEST10', discount_amount: 10 });
      expect(stored!.total_monthly_payment).toBe(90);
    });

    it('resets the wizard so the next demo starts clean', async () => {
      const { result } = renderHook(() => useSubmitApplication());

      await act(async () => {
        await result.current.submit();
      });

      expect(mockMarcarSesionConvertida).toHaveBeenCalled();
      expect(mockResetForm).toHaveBeenCalled();
      expect(mockClearProduct).toHaveBeenCalled();
      expect(mockClearAccessories).toHaveBeenCalled();
      expect(mockClearInsurance).toHaveBeenCalled();
      expect(mockClearCoupon).toHaveBeenCalled();
    });
  });
});

/**
 * Lo que el link corto del socio prellena tiene que terminar en el submit.
 *
 * Es la unica parte de la cadena que ningun otro test cubre: `calcularPrellenado`
 * prueba que los campos se calculan bien, pero no que sobrevivan al mapeo de
 * `form_data` — y ahi es donde se caerian sin que nadie se entere, porque los
 * marcadores de bloqueo viajan en el mismo formData y SI tienen que quedarse
 * afuera. Se usan las funciones reales del prellenado, no un formData escrito a
 * mano: si mañana `institution` pasara a llamarse `_institution`, este test lo
 * ve.
 */
describe('lead de socio (A365): institucion y sede llegan al submit', () => {
  const LEAD: LeadPrefill = {
    document_type: 'dni',
    document_number: '70123456',
    first_name: 'Ana',
    last_name: 'Quispe',
    phone: '999888777',
    email: 'ana@ejemplo.com',
    institution_id: 812,
    institution_name: 'Universidad Privada del Norte',
    institution_type: 'university',
    sede_id: 45,
    sede_name: 'UCV Norte',
  };

  const PASOS = [
    { fields: [{ code: 'institution_type' }, { code: 'institution' }, { code: 'sede' }] },
  ] as unknown as WizardStep[];

  /** El caso real de A365: su landing no declara `sede` ni `institution`. */
  const PASOS_SIN_CAMPOS = [
    { fields: [{ code: 'document_number' }, { code: 'email' }] },
  ] as unknown as WizardStep[];

  const originales = Object.keys(mockFormData);

  afterEach(() => {
    for (const key of Object.keys(mockFormData)) {
      if (!originales.includes(key)) delete (mockFormData as Record<string, unknown>)[key];
    }
  });

  const prellenarComoElHook = (pasos: WizardStep[] = PASOS) => {
    const updates = calcularPrellenado(LEAD, pasos, () => '');
    for (const u of [...updates, ...marcadoresDeBloqueo(updates)]) {
      (mockFormData as Record<string, unknown>)[u.fieldId] = { value: u.value, error: null };
    }
  };

  it('manda institution y sede con el id del catalogo, no el nombre', async () => {
    mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-A365' });
    prellenarComoElHook();

    const { result } = renderHook(() => useSubmitApplication());
    await act(async () => {
      await result.current.submit();
    });

    expect(mockSubmitApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        form_data: expect.objectContaining({
          institution: '812',
          institution_type: 'university',
          sede: '45',
        }),
      })
    );
  });

  it('llegan al submit aunque la landing no tenga los campos', async () => {
    // El caso de A365: su formulario no declara `sede`. Este es el test que
    // vale — el de arriba pasaria igual si el prellenado solo funcionara en
    // landings que ya tienen los campos, que es justo lo que NO sirve aca.
    mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-A365' });
    prellenarComoElHook(PASOS_SIN_CAMPOS);

    const { result } = renderHook(() => useSubmitApplication());
    await act(async () => {
      await result.current.submit();
    });

    expect(mockSubmitApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        form_data: expect.objectContaining({
          institution: '812',
          institution_type: 'university',
          sede: '45',
        }),
      })
    );
  });

  it('los marcadores de bloqueo NO viajan al backend', async () => {
    mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-A365' });
    prellenarComoElHook();

    const { result } = renderHook(() => useSubmitApplication());
    await act(async () => {
      await result.current.submit();
    });

    const enviado = mockSubmitApplication.mock.calls[0][0].form_data;
    expect(Object.keys(enviado).some(k => k.startsWith('_'))).toBe(false);
  });
});
