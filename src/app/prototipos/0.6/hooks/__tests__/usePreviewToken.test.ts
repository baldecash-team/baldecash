import { renderHook } from '@testing-library/react';
// jest: describe/it/expect/beforeEach son globales; jest.mock para los mocks
import { usePreviewToken } from '../usePreviewToken';

// El hook lee la URL: se simula con la API de Next que usa el proyecto.
// Este mock pisa al de jest.setup.js, que devuelve un get() mockeado y no
// permite armar una query string completa por caso.
const mockSearchParams = jest.fn(() => new URLSearchParams(''));
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams(),
}));

jest.mock('../../context/PreviewContext', () => ({
  usePreview: () => ({
    isPreviewingLanding: () => false,
    previewKey: null,
  }),
}));

describe('usePreviewToken', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockSearchParams.mockReturnValue(new URLSearchParams(''));
  });

  it('sin token en la URL devuelve null', () => {
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBeNull();
  });

  it('toma el token de la URL', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBe('ABC123');
  });

  it('el token sobrevive a navegar sin el parametro', () => {
    // Es el punto del hook: el usuario entra con ?preview_key=, clickea un
    // producto y vuelve; sin persistir, el segundo render pierde el preview.
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    renderHook(() => usePreviewToken('home'));

    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBe('ABC123');
  });

  it('el token de una landing no se usa en otra', () => {
    // Sin esto, previsualizar home dejaria precios simulados en ucv.
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    renderHook(() => usePreviewToken('home'));

    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    const { result } = renderHook(() => usePreviewToken('ucv'));
    expect(result.current).toBeNull();
  });

  it('un token guardado hace mas de una hora ya no vale', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    renderHook(() => usePreviewToken('home'));

    const guardado = JSON.parse(sessionStorage.getItem('baldecash-preview-pricing')!);
    guardado.activatedAt = Date.now() - 61 * 60 * 1000;
    sessionStorage.setItem('baldecash-preview-pricing', JSON.stringify(guardado));

    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBeNull();
  });
});
