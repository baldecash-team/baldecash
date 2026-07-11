import { renderHook } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

const mockTrack = jest.fn();
jest.mock(
  '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext',
  () => ({ useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }) })
);

let mockParams: Record<string, unknown> = {};
jest.mock('next/navigation', () => ({ useParams: () => mockParams }));

describe('useAnalytics alias offer_', () => {
  beforeEach(() => { mockTrack.mockClear(); });

  it('en contexto de oferta (params.token) aliasea filter_toggle → offer_filter_toggle', () => {
    mockParams = { token: 'tok_abc' };
    const { result } = renderHook(() => useAnalytics());
    result.current.trackFilterToggle({ filter_code: 'brand', filter_value: 'hp', active: true });
    expect(mockTrack).toHaveBeenCalledWith('offer_filter_toggle', expect.any(Object), undefined);
  });

  it('fuera de oferta (sin token) conserva filter_toggle', () => {
    mockParams = { landing: 'home' };
    const { result } = renderHook(() => useAnalytics());
    result.current.trackFilterToggle({ filter_code: 'brand', filter_value: 'hp', active: true });
    expect(mockTrack).toHaveBeenCalledWith('filter_toggle', expect.any(Object), undefined);
  });

  it('un evento de funnel propio (offer_viewed) NO se re-aliasea en oferta', () => {
    mockParams = { token: 'tok_abc' };
    const { result } = renderHook(() => useAnalytics());
    result.current.track('offer_viewed', { offer_case: 'downgrade' });
    expect(mockTrack).toHaveBeenCalledWith('offer_viewed', expect.any(Object), undefined);
  });
});
