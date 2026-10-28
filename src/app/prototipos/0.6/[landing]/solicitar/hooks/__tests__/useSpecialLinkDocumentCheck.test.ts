import { renderHook, act } from '@testing-library/react';
import { useSpecialLinkDocumentCheck } from '../useSpecialLinkDocumentCheck';

const mockProduct: { current: unknown } = { current: null };
jest.mock('../../context/ProductContext', () => ({
  useProductOptional: () => mockProduct.current,
}));

const mockVerificar = jest.fn();
jest.mock('@/app/prototipos/0.6/utils/specialLinkDni', () => ({
  verificarDniDelLinkEspecial: (...args: unknown[]) => mockVerificar(...args),
}));

const MSG_DNI = 'Este link es personal y no corresponde a tu DNI.';

function conPase(token = 'tok') {
  mockProduct.current = { selectedProduct: { id: '1', specialLinkToken: token }, cartProducts: [] };
  sessionStorage.setItem('baldecash-home-special-link', token);
}

async function avanzar() {
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  sessionStorage.clear();
  mockVerificar.mockReset();
  mockProduct.current = null;
});

afterEach(() => jest.useRealTimers());

describe('useSpecialLinkDocumentCheck', () => {
  it('sin link especial no llama al backend ni da error', async () => {
    mockProduct.current = { selectedProduct: { id: '1' }, cartProducts: [] };
    const { result } = renderHook(() =>
      useSpecialLinkDocumentCheck({ documentNumber: '99999900', landing: 'home' }));
    await avanzar();
    expect(mockVerificar).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('producto con pase pero sin token guardado en la landing: no llama', async () => {
    mockProduct.current = { selectedProduct: { id: '1', specialLinkToken: 'tok' }, cartProducts: [] };
    renderHook(() => useSpecialLinkDocumentCheck({ documentNumber: '99999900', landing: 'home' }));
    await avanzar();
    expect(mockVerificar).not.toHaveBeenCalled();
  });

  it('documento incompleto: no llama', async () => {
    conPase();
    renderHook(() => useSpecialLinkDocumentCheck({ documentNumber: null, landing: 'home' }));
    await avanzar();
    expect(mockVerificar).not.toHaveBeenCalled();
  });

  it('DNI distinto: devuelve el error y llama con token, landing y dni', async () => {
    conPase();
    mockVerificar.mockResolvedValue({ error: MSG_DNI });
    const { result } = renderHook(() =>
      useSpecialLinkDocumentCheck({ documentNumber: '99999900', landing: 'home' }));
    await avanzar();
    expect(mockVerificar).toHaveBeenCalledWith('tok', 'home', '99999900');
    expect(result.current.error).toBe(MSG_DNI);
  });

  it('al cambiar el documento, el error viejo se va en el mismo render', async () => {
    conPase();
    mockVerificar.mockResolvedValueOnce({ error: MSG_DNI });
    const { result, rerender } = renderHook(
      ({ dni }: { dni: string | null }) => useSpecialLinkDocumentCheck({ documentNumber: dni, landing: 'home' }),
      { initialProps: { dni: '99999900' as string | null } },
    );
    await avanzar();
    expect(result.current.error).toBe(MSG_DNI);
    mockVerificar.mockResolvedValueOnce({ error: null });
    rerender({ dni: '0000001' });
    expect(result.current.error).toBeNull();
    rerender({ dni: '00000010' });
    await avanzar();
    expect(result.current.error).toBeNull();
    expect(mockVerificar).toHaveBeenLastCalledWith('tok', 'home', '00000010');
  });

  it('falla de red (null): no bloquea', async () => {
    conPase();
    mockVerificar.mockResolvedValue(null);
    const { result } = renderHook(() =>
      useSpecialLinkDocumentCheck({ documentNumber: '99999900', landing: 'home' }));
    await avanzar();
    expect(result.current.error).toBeNull();
  });
});
