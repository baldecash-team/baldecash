/**
 * El cupón de la URL se valida CON la landing.
 *
 * Bug real (Home, 9-oct-2026): el hook validaba en cuanto hidrataba el
 * ProductContext, antes de que el layout cargara. `landingId` era null, la
 * validación salía sin `landing_id`, el backend respondía «Este cupón solo es
 * válido en ciertas landings» y el cupón pendiente se borraba. Así fallaban
 * por la URL BALDEFINDE, CLASES, REGALO y MOCHILA, todos válidos en Home.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useCampaignCoupon } from '../useCampaignCoupon';
import { validateCoupon } from '@/app/prototipos/0.6/utils/couponApi';

const mockUseLayout = jest.fn();
const mockSetAppliedCoupon = jest.fn();
let mockAppliedCoupon: unknown = null;

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => mockUseLayout(),
}));
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  useProduct: () => ({
    appliedCoupon: mockAppliedCoupon,
    setAppliedCoupon: mockSetAppliedCoupon,
    isHydrated: true,
  }),
}));
jest.mock('@/app/prototipos/0.6/utils/couponApi', () => ({
  validateCoupon: jest.fn(),
}));

const mockValidate = validateCoupon as jest.MockedFunction<typeof validateCoupon>;

const PENDIENTE = 'baldecash-home-pending-coupon';
const CUPON_OK = {
  ok: true as const,
  coupon: { code: 'CLASES', discount: 40, label: '40% de descuento en 1 cuotas', couponType: 'percent_quotas' as const, quotasAffected: 1 },
};

const layout = (landingId: number | null, isLoading: boolean) => ({ landingId, isLoading });

beforeEach(() => {
  localStorage.clear();
  mockAppliedCoupon = null;
  mockSetAppliedCoupon.mockReset();
  mockValidate.mockReset();
  mockUseLayout.mockReset();
});

describe('useCampaignCoupon — espera a la landing', () => {
  it('con el layout cargando NO valida y conserva el cupón pendiente', async () => {
    localStorage.setItem(PENDIENTE, 'CLASES');
    mockUseLayout.mockReturnValue(layout(null, true));

    renderHook(() => useCampaignCoupon('home'));
    // Deja correr los efectos: si fuera a validar, ya lo habría hecho.
    await Promise.resolve();

    expect(mockValidate).not.toHaveBeenCalled();
    expect(localStorage.getItem(PENDIENTE)).toBe('CLASES');
  });

  it('con el layout cargado valida CON landing_id, aplica el cupón y limpia el pendiente', async () => {
    localStorage.setItem(PENDIENTE, 'CLASES');
    mockUseLayout.mockReturnValue(layout(1, false));
    mockValidate.mockResolvedValue(CUPON_OK);

    renderHook(() => useCampaignCoupon('home'));

    await waitFor(() => expect(mockSetAppliedCoupon).toHaveBeenCalledTimes(1));
    expect(mockValidate).toHaveBeenCalledTimes(1);
    expect(mockValidate).toHaveBeenCalledWith({ code: 'CLASES', landingId: 1 });
    expect(mockSetAppliedCoupon).toHaveBeenCalledWith({ ...CUPON_OK.coupon, lockedFromUrl: true });
    expect(localStorage.getItem(PENDIENTE)).toBeNull();
  });

  it('pasa de cargando a cargado y valida UNA sola vez, ya con la landing', async () => {
    localStorage.setItem(PENDIENTE, 'CLASES');
    mockUseLayout.mockReturnValue(layout(null, true));
    mockValidate.mockResolvedValue(CUPON_OK);

    const { rerender } = renderHook(() => useCampaignCoupon('home'));
    await Promise.resolve();
    expect(mockValidate).not.toHaveBeenCalled();

    mockUseLayout.mockReturnValue(layout(1, false));
    rerender();

    await waitFor(() => expect(mockSetAppliedCoupon).toHaveBeenCalledTimes(1));
    expect(mockValidate).toHaveBeenCalledTimes(1);
    expect(mockValidate).toHaveBeenCalledWith({ code: 'CLASES', landingId: 1 });
  });

  // Entrada por la landing (`/home/?cupon=CLASES`) y después el catálogo SIN
  // el parámetro: el catálogo limpia el pendiente de localStorage en cuanto
  // hidrata. Si eso pasa mientras el hook espera al layout, igual tiene que
  // validar el cupón que ya había leído (visto en producción el 9-oct-2026).
  it('si el pendiente se borra mientras espera al layout, igual valida el que ya leyó', async () => {
    localStorage.setItem(PENDIENTE, 'CLASES');
    mockUseLayout.mockReturnValue(layout(null, true));
    mockValidate.mockResolvedValue(CUPON_OK);

    const { rerender } = renderHook(() => useCampaignCoupon('home'));
    await Promise.resolve();
    expect(mockValidate).not.toHaveBeenCalled();

    // Lo que hace CatalogoClient cuando la URL no trae cupón.
    localStorage.removeItem(PENDIENTE);

    mockUseLayout.mockReturnValue(layout(1, false));
    rerender();

    await waitFor(() => expect(mockSetAppliedCoupon).toHaveBeenCalledTimes(1));
    expect(mockValidate).toHaveBeenCalledTimes(1);
    expect(mockValidate).toHaveBeenCalledWith({ code: 'CLASES', landingId: 1 });
  });

  it('si el layout terminó SIN landing (falló la carga) valida sin landing, como antes', async () => {
    localStorage.setItem(PENDIENTE, 'JACK3834');
    mockUseLayout.mockReturnValue(layout(null, false));
    mockValidate.mockResolvedValue({ ...CUPON_OK, coupon: { ...CUPON_OK.coupon, code: 'JACK3834' } });

    renderHook(() => useCampaignCoupon('home'));

    await waitFor(() => expect(mockValidate).toHaveBeenCalledTimes(1));
    expect(mockValidate).toHaveBeenCalledWith({ code: 'JACK3834', landingId: undefined });
  });

  it('si el backend rechaza el cupón con la landing, marca el fallo y limpia el pendiente', async () => {
    localStorage.setItem(PENDIENTE, 'NOEXISTE999');
    mockUseLayout.mockReturnValue(layout(1, false));
    mockValidate.mockResolvedValue({ ok: false, error: 'Cupón no válido o no existe' });

    const { result } = renderHook(() => useCampaignCoupon('home'));

    await waitFor(() => expect(result.current.validationFailed).toBe(true));
    expect(mockSetAppliedCoupon).not.toHaveBeenCalled();
    expect(result.current.couponCode).toBeNull();
    expect(localStorage.getItem(PENDIENTE)).toBeNull();
  });

  it('sin cupón pendiente no valida nada', async () => {
    mockUseLayout.mockReturnValue(layout(1, false));

    renderHook(() => useCampaignCoupon('home'));
    await Promise.resolve();

    expect(mockValidate).not.toHaveBeenCalled();
  });
});
