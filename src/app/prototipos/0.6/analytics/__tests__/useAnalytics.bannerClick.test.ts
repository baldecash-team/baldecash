import { renderHook } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

const mockTrack = jest.fn();
const mockFlush = jest.fn();
jest.mock(
  '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext',
  () => ({ useEventTrackerOptional: () => ({ track: mockTrack, flush: mockFlush }) })
);

jest.mock('next/navigation', () => ({ useParams: () => ({ landing: 'home' }) }));

/**
 * El clic del banner ya se guardaba en `user_event` como `banner_click`, pero
 * llegaba con `banner_id`, `variant` y `href` en null: se sabía que alguien
 * tocó un banner, no cuál ni de qué tipo.
 *
 * El nombre del evento NO cambia a propósito: el backend descarta en silencio
 * -con 200 OK- cualquier event_type fuera de su catálogo, así que un
 * `banner_click_v2` parecería funcionar y no guardaría nada.
 */
describe('banner_click lleva los datos que lo hacen medible', () => {
  beforeEach(() => {
    mockTrack.mockClear();
    mockFlush.mockClear();
  });

  it('manda el tipo de banner, que es lo que separa la tira de la imagen', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackBannerClick({
      location: 'catalog_top',
      banner_id: '1387',
      variant: 'tira_remate',
      href: '@reacondicionados/catalogo',
    });

    expect(mockTrack).toHaveBeenCalledWith(
      'banner_click',
      expect.objectContaining({
        variant: 'tira_remate',
        banner_id: '1387',
        href: '@reacondicionados/catalogo',
        location: 'catalog_top',
      }),
      undefined
    );
  });

  it('distingue el tipo imagen', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackBannerClick({
      location: 'catalog_top',
      banner_id: '478',
      variant: 'imagen',
      href: 'catalogo?condition=reacondicionado',
    });

    const [, props] = mockTrack.mock.calls[0];
    expect(props.variant).toBe('imagen');
  });

  // Lo que llegaba antes del fix: el evento existía pero no servía para nada.
  it('sin los datos, los campos viajan en null (regresión)', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackBannerClick({ location: 'catalog_top' });

    const [, props] = mockTrack.mock.calls[0];
    expect(props.variant).toBeNull();
    expect(props.banner_id).toBeNull();
    expect(props.href).toBeNull();
  });

  it('el hover también distingue el tipo', async () => {
    jest.useFakeTimers();
    try {
      const { result } = renderHook(() => useAnalytics());
      result.current.trackBannerHover({
        location: 'catalog_top',
        banner_id: '1387',
        variant: 'tira_remate',
      });

      // El hover tiene debounce de 500ms: antes de eso no se emite nada.
      expect(mockTrack).not.toHaveBeenCalled();
      jest.advanceTimersByTime(600);

      expect(mockTrack).toHaveBeenCalledWith(
        'banner_hover',
        expect.objectContaining({ variant: 'tira_remate', banner_id: '1387' }),
        undefined
      );
    } finally {
      jest.useRealTimers();
    }
  });

  // El banner navega fuera en la misma pestaña: si el evento espera el
  // intervalo de 5s, la página se va antes y el clic no llega nunca.
  it('expone flush para no perder el clic al navegar', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.flush();
    expect(mockFlush).toHaveBeenCalled();
  });
});
