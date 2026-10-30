/**
 * Tests for useSubmitApplication hook
 * Tests the submit application logic
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubmitApplication } from '../useSubmitApplication';
import { calcularPrellenado, marcadoresDeBloqueo } from '../useLeadPrefill';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { readDemoApplication } from '../../utils/demoApplication';
import { saveConsentStorage } from '../../utils/consentStorage';
import { guardarVistaDePrueba } from '@/app/prototipos/0.6/utils/vistaDePrueba';
import type { LeadPrefill } from '@/app/prototipos/0.6/services/leadPrefillApi';
import type { WizardStep } from '../../../../services/wizardApi';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockParams = { landing: 'test-landing' };

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useParams: () => mockParams,
}));

// El handoff del envio anticipado: lo que habilita la pantalla del contrato.
const mockSaveEnvioAnticipadoHandoff = jest.fn();
jest.mock('../../utils/envioAnticipadoHandoff', () => ({
  ...jest.requireActual('../../utils/envioAnticipadoHandoff'),
  saveEnvioAnticipadoHandoff: (...args: unknown[]) =>
    mockSaveEnvioAnticipadoHandoff(...args),
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
const mockClearCouponAfterSubmit = jest.fn();

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
    getTotalMonthlyPayment: () => 267,
    clearProduct: mockClearProduct,
    clearCartProducts: mockClearCartProducts,
    clearAccessories: mockClearAccessories,
    clearInsurance: mockClearInsurance,
    clearCoupon: mockClearCoupon,
    clearCouponAfterSubmit: mockClearCouponAfterSubmit,
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

// Config del wizard: trae el form_id (y su form_version_id) que el backend le sirvió a esta sesión.
let mockWizardConfig: { form_id?: number; form_version_id?: number | null } | null = null;
jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: mockWizardConfig }),
}));

// Mock useAnalytics (returns no-ops by default)
const mockAnalyticsTrack = jest.fn();
const mockTrackSummarySubmit = jest.fn();
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () =>
    new Proxy(
      { track: mockAnalyticsTrack, trackSummarySubmit: mockTrackSummarySubmit },
      { get: (target, prop) => (target as Record<string, unknown>)[prop as string] ?? jest.fn() }
    ),
}));

// Mock useFieldTracking (resetFormStartTracking)
jest.mock('../useFieldTracking', () => ({
  resetFormStartTracking: jest.fn(),
}));

// Sentry: las excepciones del código tienen que llegar con su pila.
const mockCaptureException = jest.fn();
jest.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: jest.fn(),
}));

// «Probar en la web»: el aviso del envío simulado.
const mockAvisarEnvioSimulado = jest.fn(async () => undefined);
jest.mock('../../../../services/linkDePruebaApi', () => ({
  avisarEnvioSimulado: (...args: unknown[]) => mockAvisarEnvioSimulado(...(args as [])),
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

  describe('mensajes de error por codigo', () => {
    // El backend manda `error` sin tildes (viaja por varios sistemas) y a
    // veces con un texto que solo dice que paso, no que hacer. El hook los
    // reescribe por `error_code`.

    it('UNIT_OUT_OF_STOCK: dice que el equipo se agoto y que vuelva al catalogo', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'UNIT_OUT_OF_STOCK',
        error: 'Alguien acaba de tomar la ultima unidad de este equipo.',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      let ok: boolean = true;
      await act(async () => {
        ok = await result.current.submit();
      });

      expect(ok).toBe(false);
      const msg = onToast.mock.calls[0][0] as string;
      expect(msg).toContain('última unidad de ese modelo');
      expect(msg).toContain('catálogo');
      // No se cuela el texto crudo del API.
      expect(msg).not.toContain('Alguien acaba de tomar la ultima unidad');
      expect(result.current.error).toBe(msg);
    });

    it('OUT_OF_STOCK (stock por conteo) conserva el mensaje del API', async () => {
      // Ese codigo lo emite `stock_ws2_managed`, que esta vivo en landings que
      // no son reacondicionados: copia-home, renueva-tu-equipo, family-farms,
      // remate-ucv. El texto de unidades unicas no les corresponde y no puede
      // volver a colarseles.
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'OUT_OF_STOCK',
        error: 'Sin stock disponible para este equipo',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      await act(async () => {
        await result.current.submit();
      });

      const msg = onToast.mock.calls[0][0] as string;
      expect(msg).toBe('Sin stock disponible para este equipo');
      expect(msg).not.toContain('última unidad de ese modelo');
    });

    it('UNIT_OUT_OF_STOCK va al MODAL, no al toast', async () => {
      // El toast dura 4 segundos y `StepClient` no renderiza el `error` del
      // hook: seria la unica superficie del mensaje. Y este mensaje pide una
      // accion —volver al catalogo— justo cuando el envio fallo.
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'UNIT_OUT_OF_STOCK',
        error: 'Alguien acaba de tomar la ultima unidad de este equipo.',
      });

      const onToast = jest.fn();
      const onUnidadTomada = jest.fn();
      const { result } = renderHook(() =>
        useSubmitApplication({ onToast, onUnidadTomada }));

      await act(async () => {
        await result.current.submit();
      });

      expect(onUnidadTomada).toHaveBeenCalledTimes(1);
      expect(onUnidadTomada.mock.calls[0][0]).toContain('catálogo');
      // Nunca los dos: dos avisos del mismo hecho se leen como dos problemas.
      expect(onToast).not.toHaveBeenCalled();
      // BAL-5207: el evento dice que la persona vio el modal.
      expect(mockAnalyticsTrack).toHaveBeenCalledWith('form_submit_error', {
        error_code: 'UNIT_OUT_OF_STOCK',
        stage: 'api_response',
        surface: 'modal',
      });
    });

    it('OUT_OF_STOCK sigue yendo al toast aunque haya modal', async () => {
      // El aislamiento, del lado del front: el stock por conteo esta vivo en
      // una decena de landings ajenas y su aviso no cambia.
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'OUT_OF_STOCK',
        error: 'Sin stock disponible para este equipo',
      });

      const onToast = jest.fn();
      const onUnidadTomada = jest.fn();
      const { result } = renderHook(() =>
        useSubmitApplication({ onToast, onUnidadTomada }));

      await act(async () => {
        await result.current.submit();
      });

      expect(onUnidadTomada).not.toHaveBeenCalled();
      expect(onToast).toHaveBeenCalledTimes(1);
      // `surface` es solo del aviso «equipo ya tomado».
      expect(mockAnalyticsTrack).toHaveBeenCalledWith('form_submit_error', {
        error_code: 'OUT_OF_STOCK',
        stage: 'api_response',
      });
    });

    it.each([
      ['SPECIAL_LINK_DNI_MISMATCH', 'Este link es personal y no corresponde a tu DNI.'],
      ['SPECIAL_LINK_INVALID', 'Tu link especial venció o ya se usó. Pídele uno nuevo a tu asesora.'],
    ])('%s va al aviso fijo, no al toast', async (code, texto) => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: code,
        error: 'texto sin tildes del backend',
      });

      const onToast = jest.fn();
      const onLinkEspecialRechazado = jest.fn();
      const onUnidadTomada = jest.fn();
      const { result } = renderHook(() =>
        useSubmitApplication({ onToast, onUnidadTomada, onLinkEspecialRechazado }));

      await act(async () => {
        await result.current.submit();
      });

      expect(onLinkEspecialRechazado).toHaveBeenCalledWith(texto);
      expect(onToast).not.toHaveBeenCalled();
      expect(onUnidadTomada).not.toHaveBeenCalled();
    });

    it('sin aviso fijo, SPECIAL_LINK_DNI_MISMATCH cae al toast de siempre', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'SPECIAL_LINK_DNI_MISMATCH',
        error: 'x',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      await act(async () => {
        await result.current.submit();
      });

      expect(onToast).toHaveBeenCalledWith('Este link es personal y no corresponde a tu DNI.', 'error');
    });

    it('sin modal, UNIT_OUT_OF_STOCK cae al toast de siempre', async () => {
      // Un caller que no maneje el canal nuevo no puede quedarse sin aviso.
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'UNIT_OUT_OF_STOCK',
        error: 'Alguien acaba de tomar la ultima unidad de este equipo.',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      await act(async () => {
        await result.current.submit();
      });

      expect(onToast).toHaveBeenCalledTimes(1);
      expect(onToast.mock.calls[0][0]).toContain('catálogo');
      // BAL-5207: el evento dice que la persona vio el toast.
      expect(mockAnalyticsTrack).toHaveBeenCalledWith('form_submit_error', {
        error_code: 'UNIT_OUT_OF_STOCK',
        stage: 'api_response',
        surface: 'toast',
      });
    });

    it('COUPON_USER_LIMIT_REACHED: pide quitar el cupon', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'COUPON_USER_LIMIT_REACHED',
        error: 'Ya has utilizado este cupón el máximo de veces permitido',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));
      await act(async () => {
        await result.current.submit();
      });

      const msg = onToast.mock.calls[0][0] as string;
      expect(msg).toContain('Quítalo');
      expect(result.current.error).toBe(msg);
    });

    it('APPLICATION_CAP_REACHED: mensaje humano con tildes, no el texto crudo de ws2 (BAL-4969)', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'APPLICATION_CAP_REACHED',
        error: 'Por ahora no estamos recibiendo mas solicitudes en esta campana.',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));
      await act(async () => {
        await result.current.submit();
      });

      const msg = onToast.mock.calls[0][0] as string;
      expect(msg).toContain('no estamos recibiendo más solicitudes');
      expect(msg).toContain('campaña');
    });

    it.each([
      ['SPECIAL_LINK_DNI_MISMATCH', 'Este link es personal y no corresponde a tu DNI.'],
      ['SPECIAL_LINK_INVALID', 'Tu link especial venció o ya se usó. Pídele uno nuevo a tu asesora.'],
    ])('%s: mensaje del link especial con tildes', async (code, esperado) => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: code,
        error: 'Tu link especial vencio o ya se uso.',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));
      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.error).toBe(esperado);
    });

    it('un codigo desconocido cae al mensaje del API', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'ALGO_NUEVO',
        error: 'Mensaje del backend',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));
      await act(async () => {
        await result.current.submit();
      });

      expect(onToast).toHaveBeenCalledWith('Mensaje del backend', 'error');
    });

    it('sin codigo ni mensaje cae al texto generico', async () => {
      mockSubmitApplication.mockResolvedValueOnce({ success: false });

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

  describe('solicitud que nace rechazada', () => {
    // ws2 puede cerrar la solicitud dentro del propio submit (lista negra, y
    // los filtros duros que corren ahi mismo). Ahi no hay contrato que emitir
    // ni KYC que completar: mandarla a esas pantallas la deja esperando un
    // documento que nunca llega y rebotando sola a la confirmacion.

    it('con KYC prendido va a la confirmacion, no al KYC', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_code: 'APP-RECHAZADA',
        kyc_resume_token: 'tok-123',
        status: 'rejected',
      });

      const { result } = renderHook(() => useSubmitApplication({}));

      await act(async () => {
        await result.current.submit({ kycEnabled: true });
      });

      expect(mockPush).toHaveBeenCalledWith(
        routes.solicitarConfirmacion('test-landing', 'APP-RECHAZADA')
      );
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('/prototipos/0.6/kyc/')
      );
    });

    it('en envio anticipado no deja handoff y se va a la confirmacion', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_code: 'APP-RECHAZADA',
        kyc_resume_token: 'tok-123',
        status: 'rejected',
      });

      const { result } = renderHook(() => useSubmitApplication({}));

      let ok: boolean = true;
      await act(async () => {
        ok = await result.current.submit({
          kycEnabled: true,
          stayInWizard: true,
          conContrato: true,
        });
      });

      // `false` es lo que frena al wizard: quien llamo no empuja el paso del
      // contrato porque esta pantalla ya navego.
      expect(ok).toBe(false);
      expect(mockSaveEnvioAnticipadoHandoff).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith(
        routes.solicitarConfirmacion('test-landing', 'APP-RECHAZADA')
      );
    });

    it('la que sigue viva deja el handoff y sigue en el wizard', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_code: 'APP-VIVA',
        kyc_resume_token: 'tok-456',
        status: 'pending',
      });

      const { result } = renderHook(() => useSubmitApplication({}));

      let ok: boolean = false;
      await act(async () => {
        ok = await result.current.submit({
          kycEnabled: true,
          stayInWizard: true,
          conContrato: true,
        });
      });

      expect(ok).toBe(true);
      expect(mockSaveEnvioAnticipadoHandoff).toHaveBeenCalledWith(
        'test-landing',
        expect.objectContaining({ applicationCode: 'APP-VIVA' })
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });
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
      // Tras enviar se borra SIEMPRE, tambien el cupon que llego por link.
      expect(mockClearCouponAfterSubmit).toHaveBeenCalled();
      expect(mockClearCoupon).not.toHaveBeenCalled();

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

    // BAL-3994: el front representaba "mensual" como AUSENCIA del campo, asi que
    // JSON.stringify borraba la clave y el backend la rellenaba con "mensual" a
    // ciegas. Con un producto sin celda de pricing mensual eso hacia nacer la
    // solicitud con TEA 0, inicial 0 o la cuota de otra frecuencia
    // (L-130507, L-128954, L-128199, L-127830).
    describe('payment_frequency', () => {
      const mutable = mockSelectedProduct as { paymentFrequency?: string };
      afterEach(() => { delete mutable.paymentFrequency; });

      it('el payload siempre lleva payment_frequency, incluso cuando el usuario eligio mensual', async () => {
        // mockSelectedProduct no trae paymentFrequency: ese ES el caso "mensual"
        // tal como lo dejaba el carrito antes del fix.
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-F1' });

        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });

        const payload = mockSubmitApplication.mock.calls[0][0] as {
          product_data: { payment_frequency?: string; products?: { payment_frequency?: string }[] };
        };
        expect(payload.product_data.payment_frequency).toBe('mensual');
        expect(payload.product_data.products?.[0].payment_frequency).toBe('mensual');

        // Y la clave sobrevive al JSON: undefined desaparecia aqui.
        const serializado = JSON.parse(JSON.stringify(payload)) as {
          product_data: Record<string, unknown> & { products: Record<string, unknown>[] };
        };
        expect('payment_frequency' in serializado.product_data).toBe(true);
        expect('payment_frequency' in serializado.product_data.products[0]).toBe(true);
      });

      it('respeta la frecuencia sub-mensual que eligio el usuario', async () => {
        mutable.paymentFrequency = 'quincenal';
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-F2' });

        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });

        const payload = mockSubmitApplication.mock.calls[0][0] as {
          product_data: { payment_frequency?: string; products?: { payment_frequency?: string }[] };
        };
        expect(payload.product_data.payment_frequency).toBe('quincenal');
        expect(payload.product_data.products?.[0].payment_frequency).toBe('quincenal');
      });
    });

    // Link especial (BAL-5191): el equipo no visible viaja con su pase.
    describe('special_link_token', () => {
      const mutable = mockSelectedProduct as { specialLinkToken?: string };
      const KEY = 'baldecash-test-landing-special-link';
      afterEach(() => { delete mutable.specialLinkToken; sessionStorage.clear(); });

      it('sin pase la clave no viaja (payload de siempre)', async () => {
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-S0' });
        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });
        const payload = mockSubmitApplication.mock.calls[0][0] as { product_data: Record<string, unknown> };
        expect('special_link_token' in payload.product_data).toBe(false);
      });

      it('con pase manda el token y lo borra al enviar bien', async () => {
        mutable.specialLinkToken = 'tok-123';
        sessionStorage.setItem(KEY, 'tok-123');
        mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-S1' });
        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });
        const payload = mockSubmitApplication.mock.calls[0][0] as { product_data: { special_link_token?: string } };
        expect(payload.product_data.special_link_token).toBe('tok-123');
        expect(sessionStorage.getItem(KEY)).toBeNull();
      });

      it('si el envío falla, el token se queda para reintentar', async () => {
        mutable.specialLinkToken = 'tok-123';
        sessionStorage.setItem(KEY, 'tok-123');
        mockSubmitApplication.mockResolvedValueOnce({ success: false, error_code: 'ALGO' });
        const { result } = renderHook(() => useSubmitApplication());
        await act(async () => { await result.current.submit(); });
        expect(sessionStorage.getItem(KEY)).toBe('tok-123');
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

    it('una excepción del código NO se pinta como "Error de conexión" y va a Sentry', async () => {
      const boom = new TypeError("Cannot read properties of undefined (reading 'id')");
      mockSubmitApplication.mockRejectedValueOnce(boom);

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      let success: boolean = true;
      await act(async () => {
        success = await result.current.submit();
      });

      expect(success).toBe(false);
      const msg = onToast.mock.calls[0][0] as string;
      expect(msg).not.toContain('conexión');
      expect(msg).toContain('problema inesperado');
      expect(mockCaptureException).toHaveBeenCalledWith(
        boom,
        expect.objectContaining({ tags: expect.objectContaining({ despues_del_envio: 'no' }) })
      );
    });

    // BAL-4969, prod 23-10-2026: ws2 aceptó el envío y algo del código
    // reventó después. La solicitud existe: mostrar un error invita a
    // reenviar y duplicarla.
    it('si el envío ya salió bien y algo revienta después, NO hay error: va a la confirmación', async () => {
      mockSubmitApplication.mockResolvedValueOnce({
        success: true,
        application_id: 130342,
        application_code: 'APP-2026-99839761',
        public_token: 'tok-1',
      });
      const boom = new Error('localStorage lleno');
      mockMarcarSesionConvertida.mockImplementationOnce(() => { throw boom; });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      let success: boolean = false;
      await act(async () => {
        success = await result.current.submit({ otpEnabled: true });
      });

      expect(success).toBe(true);
      expect(onToast).not.toHaveBeenCalledWith(expect.anything(), 'error');
      expect(result.current.error).toBeNull();
      expect(mockPush).toHaveBeenCalledWith(
        routes.solicitarConfirmacion('test-landing', 'APP-2026-99839761', false, 'tok-1')
      );
      expect(mockCaptureException).toHaveBeenCalledWith(
        boom,
        expect.objectContaining({ tags: expect.objectContaining({ despues_del_envio: 'si' }) })
      );
    });

    it('envío sin confirmar: el reintento inmediato NO sale (duplicaría la solicitud)', async () => {
      localStorage.clear();
      mockSubmitApplication.mockResolvedValueOnce({
        success: false,
        error_code: 'ENVIO_SIN_CONFIRMAR',
        error: 'No pudimos confirmar si tu solicitud llegó.',
      });

      const onToast = jest.fn();
      const { result } = renderHook(() => useSubmitApplication({ onToast }));

      await act(async () => {
        await result.current.submit();
      });
      expect(mockSubmitApplication).toHaveBeenCalledTimes(1);
      expect(onToast.mock.calls[0][0]).not.toContain('Error de conexión');

      let segundo: boolean = true;
      await act(async () => {
        segundo = await result.current.submit();
      });
      expect(segundo).toBe(false);
      expect(mockSubmitApplication).toHaveBeenCalledTimes(1);
      expect(onToast.mock.calls[1][0]).toContain('no la envíes de nuevo');
      localStorage.clear();
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
   * BAL-4353. El archivo viaja como `file__{código del campo}` y el backend busca
   * el campo por ese código para saber qué tipo de documento es. El código se
   * cortaba en el primer guion bajo (`minor_enrollment_certificate` → `minor`):
   * el backend no encontraba el campo y guardaba la constancia de matrícula como
   * «Documento General» (260 documentos en prod entre jul y sep de 2026).
   */
  describe('código del campo de los archivos', () => {
    const data = mockFormData as Record<string, { value: unknown; error: null }>;
    const adjunto = (nombre: string) => ({
      id: nombre,
      file: new File(['x'], nombre, { type: 'application/pdf' }),
    });

    afterEach(() => {
      delete data.minor_enrollment_certificate;
      delete data.dni_front;
      delete data.dni_back;
      delete data.constancia;
    });

    it('envía el código completo cuando lleva guiones bajos', async () => {
      const archivo = adjunto('constancia.pdf');
      data.minor_enrollment_certificate = { value: [archivo], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-F1' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          files: [{ fieldCode: 'minor_enrollment_certificate', file: archivo.file }],
        })
      );
    });

    it('dos campos con el mismo inicio no se confunden', async () => {
      const frente = adjunto('frente.jpg');
      const reverso = adjunto('reverso.jpg');
      data.dni_front = { value: [frente], error: null };
      data.dni_back = { value: [reverso], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-F2' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          files: [
            { fieldCode: 'dni_front', file: frente.file },
            { fieldCode: 'dni_back', file: reverso.file },
          ],
        })
      );
    });

    it('un código sin guion bajo viaja igual que antes', async () => {
      const archivo = adjunto('constancia.pdf');
      data.constancia = { value: [archivo], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-F3' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          files: [{ fieldCode: 'constancia', file: archivo.file }],
        })
      );
    });

    it('el archivo no se cuela como dato del formulario', async () => {
      data.minor_enrollment_certificate = { value: [adjunto('constancia.pdf')], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-F4' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      const payload = mockSubmitApplication.mock.calls.at(-1)?.[0] as { form_data: Record<string, unknown> };
      expect(payload.form_data).not.toHaveProperty('minor_enrollment_certificate');
    });
  });

  /**
   * BAL-4354. `CheckboxField` en modo múltiple guarda el valor como
   * `string[]` con las opciones marcadas (ver `CheckboxField.tsx`,
   * `handleMultipleChange`). `mapFormData` trataba TODA lista como lista de
   * archivos: recorría el array buscando objetos `File` y, si no encontraba
   * ninguno, descartaba el campo entero — la casilla múltiple nunca llegaba
   * al backend aunque el Resumen la mostrara marcada.
   */
  describe('casilla de selección múltiple (BAL-4354)', () => {
    const data = mockFormData as Record<string, { value: unknown; error: null } | undefined>;
    const adjunto = (nombre: string) => ({
      id: nombre,
      file: new File(['x'], nombre, { type: 'application/pdf' }),
    });

    afterEach(() => {
      delete data.intereses;
      delete data.beneficios;
      delete data.minor_enrollment_certificate;
    });

    it('envía las opciones marcadas como lista de textos', async () => {
      data.intereses = { value: ['deportes', 'tecnologia'], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-C1' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          form_data: expect.objectContaining({
            intereses: ['deportes', 'tecnologia'],
          }),
        })
      );
    });

    it('una sola opción marcada también viaja como lista (no como string suelto)', async () => {
      data.intereses = { value: ['deportes'], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-C2' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      const payload = mockSubmitApplication.mock.calls.at(-1)?.[0] as { form_data: Record<string, unknown> };
      expect(payload.form_data.intereses).toEqual(['deportes']);
    });

    it('ninguna opción marcada (array vacío) no manda la llave', async () => {
      data.intereses = { value: [], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-C3' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      const payload = mockSubmitApplication.mock.calls.at(-1)?.[0] as { form_data: Record<string, unknown> };
      expect(payload.form_data).not.toHaveProperty('intereses');
    });

    it('conviven una casilla múltiple y un archivo en el mismo submit', async () => {
      const archivo = adjunto('constancia.pdf');
      data.intereses = { value: ['deportes', 'tecnologia'], error: null };
      data.minor_enrollment_certificate = { value: [archivo], error: null };
      mockSubmitApplication.mockResolvedValue({ success: true, public_token: 'APP-C4' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          form_data: expect.objectContaining({ intereses: ['deportes', 'tecnologia'] }),
          files: [{ fieldCode: 'minor_enrollment_certificate', file: archivo.file }],
        })
      );
      const payload = mockSubmitApplication.mock.calls.at(-1)?.[0] as { form_data: Record<string, unknown> };
      expect(payload.form_data).not.toHaveProperty('minor_enrollment_certificate');
    });
  });

  /**
   * JuicyScore se dio de baja: aunque quede un `session_id` viejo en el
   * sessionStorage de una pestaña abierta, el submit no lo manda.
   */
  it('no manda juicyscore_session_id aunque quede uno guardado', async () => {
    mockParams.landing = 'test-landing';
    sessionStorage.setItem('baldecash-test-landing-juicy-session', 'w.20260813-abc.A_GS');
    mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-J1' });

    const { result } = renderHook(() => useSubmitApplication());
    await act(async () => {
      await result.current.submit();
    });

    const payload = mockSubmitApplication.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('juicyscore_session_id');
    sessionStorage.clear();
  });

  /**
   * `wizard_form_id`: el formulario que el backend le sirvió a esta sesión
   * (varios formularios por landing, repartidos por peso). Viaja en el submit
   * para que la solicitud quede ligada a ESE formulario aunque el reparto
   * cambie mientras la persona lo está llenando.
   */
  describe('wizard_form_id', () => {
    afterEach(() => {
      mockWizardConfig = null;
    });

    it('adjunta el form_id de la config del wizard cuando existe', async () => {
      mockWizardConfig = { form_id: 42 };
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-F1' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({ wizard_form_id: 42 })
      );
    });

    it('omite el campo cuando la config no trae form_id', async () => {
      mockWizardConfig = {};
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-F2' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      const payload = mockSubmitApplication.mock.calls[0][0] as {
        wizard_form_id?: number;
      };
      expect(payload.wizard_form_id).toBeUndefined();
    });
  });

  /**
   * `wizard_form_version_id`: versión del MISMO formulario que viaja en
   * `wizard_form_id`, para que el backend sepa qué versión del wizard vio la
   * persona. Debe salir de la misma config que `form_id`, así que siempre
   * describen la misma respuesta.
   */
  describe('wizard_form_version_id', () => {
    afterEach(() => {
      mockWizardConfig = null;
    });

    it('adjunta el form_version_id de la config del wizard cuando existe', async () => {
      mockWizardConfig = { form_id: 42, form_version_id: 7 };
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-F3' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      expect(mockSubmitApplication).toHaveBeenCalledWith(
        expect.objectContaining({ wizard_form_id: 42, wizard_form_version_id: 7 })
      );
    });

    it('omite el campo cuando la config no trae form_version_id', async () => {
      mockWizardConfig = { form_id: 42 };
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-F4' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      const payload = mockSubmitApplication.mock.calls[0][0] as {
        wizard_form_version_id?: number | null;
      };
      expect(payload.wizard_form_version_id).toBeUndefined();
    });

    it('omite el campo cuando la config trae form_version_id null', async () => {
      mockWizardConfig = { form_id: 42, form_version_id: null };
      mockSubmitApplication.mockResolvedValueOnce({ success: true, public_token: 'APP-F5' });

      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => {
        await result.current.submit();
      });

      const payload = mockSubmitApplication.mock.calls[0][0] as {
        wizard_form_version_id?: number | null;
      };
      expect(payload.wizard_form_version_id ?? undefined).toBeUndefined();
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
      // Tras enviar se borra SIEMPRE, tambien el cupon que llego por link.
      expect(mockClearCouponAfterSubmit).toHaveBeenCalled();
      expect(mockClearCoupon).not.toHaveBeenCalled();
    });
  });

  /**
   * «Probar en la web» (BAL-5367): una landing real abierta con el link de
   * prueba del panel. El envío se simula como en la demo, también el
   * anticipado, y se avisa a ws2 para la bitácora.
   */
  describe('vista de prueba', () => {
    beforeEach(() => {
      sessionStorage.clear();
      guardarVistaDePrueba({ slug: 'test-landing', token: 'tok-prueba', venceEn: Date.now() + 3600_000, sembrar: false });
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('no crea la solicitud: simula y registra el envío', async () => {
      const { result } = renderHook(() => useSubmitApplication());
      let ok = false;
      await act(async () => { ok = await result.current.submit(); });
      expect(ok).toBe(true);
      expect(mockSubmitApplication).not.toHaveBeenCalled();
      expect(mockAvisarEnvioSimulado).toHaveBeenCalledWith('tok-prueba');
      const target = mockPush.mock.calls[0][0] as string;
      const code = new URL(target, 'https://x').searchParams.get('code');
      expect(code).toMatch(/^SOL-DEMO-/);
      expect(readDemoApplication('test-landing', code)).not.toBeNull();
    });

    it('el envío anticipado también se simula y termina en la confirmación', async () => {
      const { result } = renderHook(() => useSubmitApplication());
      let ok = true;
      await act(async () => { ok = await result.current.submit({ stayInWizard: true, conContrato: true }); });
      expect(ok).toBe(false);
      expect(mockSubmitApplication).not.toHaveBeenCalled();
      expect(mockSaveEnvioAnticipadoHandoff).not.toHaveBeenCalled();
      expect(mockReplace.mock.calls[0][0]).toContain('/confirmacion');
    });

    it('vencida, el envío vuelve a ser real', async () => {
      guardarVistaDePrueba({ slug: 'test-landing', token: 'tok-prueba', venceEn: Date.now() - 1, sembrar: false });
      mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-1' });
      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => { await result.current.submit(); });
      expect(mockSubmitApplication).toHaveBeenCalled();
      expect(mockAvisarEnvioSimulado).not.toHaveBeenCalled();
    });

    it('de otra landing no aplica', async () => {
      guardarVistaDePrueba({ slug: 'otra', token: 'tok-prueba', venceEn: Date.now() + 3600_000, sembrar: false });
      mockSubmitApplication.mockResolvedValueOnce({ success: true, application_code: 'APP-2' });
      const { result } = renderHook(() => useSubmitApplication());
      await act(async () => { await result.current.submit(); });
      expect(mockSubmitApplication).toHaveBeenCalled();
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

/**
 * BAL-5007: el submit lleva las casillas de consentimiento en la raíz del
 * payload (`consents`), leídas de `consentStorage` ANTES de limpiarlo. ws2
 * guarda una fila en `application_consent` por cada una en `true`.
 *
 * Diseño 1 (intro de /solicitar) y Diseño 2 (modal "Lo quiero") escriben las
 * MISMAS claves; el envío no distingue el diseño, lee las claves. Por eso cada
 * caso se prueba con las claves tal como las deja cada diseño.
 */
describe('consentimiento en el payload (BAL-5007)', () => {
  const L = mockParams.landing;
  const KEY_TERMS = `baldecash-${L}-wizard-acceptTerms`;
  const KEY_PRIVACY = `baldecash-${L}-wizard-acceptPrivacy`;
  const KEY_PROMOS = `baldecash-${L}-wizard-acceptPromos`;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockSubmitApplication.mockResolvedValue({ success: true, application_code: 'APP-1' });
  });

  async function enviar(opciones?: Parameters<typeof useSubmitApplication>[0]) {
    const { result } = renderHook(() => useSubmitApplication(opciones));
    await act(async () => {
      await result.current.submit();
    });
    return mockSubmitApplication.mock.calls[0][0] as { consents?: unknown };
  }

  it('Diseño 1: las tres casillas marcadas en la intro viajan en true', async () => {
    // La intro de /solicitar guarda cada casilla por su lado al marcarla.
    localStorage.setItem(KEY_TERMS, 'true');
    localStorage.setItem(KEY_PRIVACY, 'true');
    localStorage.setItem(KEY_PROMOS, 'true');

    const payload = await enviar();

    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: true });
  });

  it('Diseño 2: el modal "Lo quiero" deja términos y privacidad, sin promos', async () => {
    // Su casilla única acepta términos Y privacidad; promos va aparte.
    localStorage.setItem(KEY_TERMS, 'true');
    localStorage.setItem(KEY_PRIVACY, 'true');
    localStorage.setItem(KEY_PROMOS, 'false');

    const payload = await enviar();

    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: false });
  });

  it('promos en false se manda false, no se omite ni se vuelve true', async () => {
    localStorage.setItem(KEY_TERMS, 'true');
    localStorage.setItem(KEY_PRIVACY, 'true');
    localStorage.setItem(KEY_PROMOS, 'false');

    const payload = await enviar();

    expect(payload.consents).toHaveProperty('promos', false);
  });

  it('con el storage vacío no inventa un true: el bloque no viaja', async () => {
    const payload = await enviar();

    expect(payload.consents).toBeUndefined();
  });

  it('una casilla sin dato, con otras que sí lo tienen, va en false', async () => {
    localStorage.setItem(KEY_TERMS, 'true');

    const payload = await enviar();

    expect(payload.consents).toEqual({ terms: true, privacy: false, promos: false });
  });

  it('se lee ANTES de limpiar el storage', async () => {
    localStorage.setItem(KEY_TERMS, 'true');
    localStorage.setItem(KEY_PRIVACY, 'true');
    localStorage.setItem(KEY_PROMOS, 'true');
    // Lo que había en el storage en el instante exacto del POST.
    let enElPost: (string | null)[] = [];
    mockSubmitApplication.mockImplementationOnce(async () => {
      enElPost = [KEY_TERMS, KEY_PRIVACY, KEY_PROMOS].map((k) => localStorage.getItem(k));
      return { success: true, application_code: 'APP-1' };
    });

    const payload = await enviar();

    expect(enElPost).toEqual(['true', 'true', 'true']);
    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: true });
    // Y el envío exitoso sí lo limpió después (BAL-2657).
    expect(localStorage.getItem(KEY_TERMS)).toBeNull();
    expect(localStorage.getItem(KEY_PRIVACY)).toBeNull();
    expect(localStorage.getItem(KEY_PROMOS)).toBeNull();
  });

  it('storage vacío y casillas marcadas en pantalla (renueva-*): manda lo de la pantalla', async () => {
    const payload = await enviar({
      consentimientoEnPantalla: { terms: true, privacy: true, promos: false },
    });

    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: false });
  });

  it('si hay storage, manda el storage y la pantalla solo cubre lo que falta', async () => {
    localStorage.setItem(KEY_TERMS, 'true');
    localStorage.setItem(KEY_PRIVACY, 'true');

    const payload = await enviar({
      consentimientoEnPantalla: { terms: false, privacy: false, promos: true },
    });

    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: true });
  });

  it('envío anticipado (stayInWizard) también lleva el bloque', async () => {
    localStorage.setItem(KEY_TERMS, 'true');
    localStorage.setItem(KEY_PRIVACY, 'true');
    localStorage.setItem(KEY_PROMOS, 'false');

    const { result } = renderHook(() => useSubmitApplication());
    await act(async () => {
      await result.current.submit({ stayInWizard: true });
    });

    expect(mockSubmitApplication.mock.calls[0][0].consents).toEqual({
      terms: true, privacy: true, promos: false,
    });
    // Sigue en el wizard: no limpia, las pantallas que faltan lo necesitan.
    expect(localStorage.getItem(KEY_TERMS)).toBe('true');
  });
});

/**
 * Rediseño completo (Diseño 2 + BAL-5007): en Diseño 2 no hay intro con
 * casillas; lo único que deja el consentimiento es el modal "Lo quiero", que
 * escribe con `saveConsentStorage`. Aquí se usa ESA función real (no claves
 * escritas a mano) para probar que lo que guarda el modal es lo que lee el
 * submit: si alguna de las dos cambia de claves, este test se rompe.
 */
describe('Diseño 2: lo que guarda el modal "Lo quiero" llega al submit (BAL-5007)', () => {
  const L = mockParams.landing;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockSubmitApplication.mockResolvedValue({ success: true, application_code: 'APP-1' });
  });

  async function enviar() {
    const { result } = renderHook(() => useSubmitApplication());
    await act(async () => {
      await result.current.submit();
    });
    return mockSubmitApplication.mock.calls[0][0] as { consents?: unknown };
  }

  it('modal sin promos: términos y privacidad en true, promos en false', async () => {
    // Lo mismo que hace LoQuieroModal al continuar.
    saveConsentStorage(L, { acceptTerms: true, acceptPrivacy: true, acceptPromos: false });

    const payload = await enviar();

    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: false });
  });

  it('modal con promos marcado: las tres en true', async () => {
    saveConsentStorage(L, { acceptTerms: true, acceptPrivacy: true, acceptPromos: true });

    const payload = await enviar();

    expect(payload.consents).toEqual({ terms: true, privacy: true, promos: true });
  });
});

describe('E2E BAL-4969: doble clic y cuota del evento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dos llamadas seguidas (doble clic) mandan UN solo POST /submit', async () => {
    let resolver: (v: unknown) => void = () => {};
    mockSubmitApplication.mockImplementationOnce(() => new Promise((r) => { resolver = r; }));
    const { result } = renderHook(() => useSubmitApplication({}));

    let segunda: boolean | undefined;
    await act(async () => {
      void result.current.submit();
      segunda = await result.current.submit();
    });
    expect(segunda).toBe(false);
    expect(mockSubmitApplication).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolver({ success: false, error: 'x' });
    });
  });

  it('tras un envío fallido se puede volver a intentar', async () => {
    mockSubmitApplication.mockResolvedValue({ success: false, error: 'x' });
    const { result } = renderHook(() => useSubmitApplication({}));
    await act(async () => { await result.current.submit(); });
    await act(async () => { await result.current.submit(); });
    expect(mockSubmitApplication).toHaveBeenCalledTimes(2);
    mockSubmitApplication.mockReset();
  });

  it('summary_submit manda la cuota con extras (equipo + accesorios + seguros)', async () => {
    mockSubmitApplication.mockResolvedValueOnce({ success: false, error: 'x' });
    const { result } = renderHook(() => useSubmitApplication({}));
    await act(async () => { await result.current.submit(); });
    expect(mockTrackSummarySubmit).toHaveBeenCalledWith(expect.objectContaining({ total_monthly: 267 }));
  });
});
