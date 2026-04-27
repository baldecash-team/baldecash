import { diffAndEmitFilterChanges } from '../catalogFilterDiff';
import type { UseAnalyticsReturn } from '../useAnalytics';
import type { FilterState } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

const makeAnalytics = () => {
  const fns: Record<string, jest.Mock> = {
    track: jest.fn(),
    trackFilterToggle: jest.fn(),
    trackFilterRangeChange: jest.fn(),
    trackFilterClearSingle: jest.fn(),
    trackFilterClearAll: jest.fn(),
    trackFilterSectionToggle: jest.fn(),
  };
  return new Proxy(fns, {
    get: (target, prop: string) => {
      if (!target[prop]) target[prop] = jest.fn();
      return target[prop];
    },
  }) as unknown as UseAnalyticsReturn & Record<string, jest.Mock>;
};

const baseFilter: FilterState = {
  deviceTypes: [],
  brands: [],
  usage: [],
  ram: [],
  storage: [],
  storageType: [],
  processorBrand: [],
  processorModel: [],
  gpuType: [],
  displaySize: [],
  displayType: [],
  resolution: [],
  refreshRate: [],
  condition: [],
  stock: [],
  gama: [],
  tags: [],
  touchScreen: null,
  ramExpandable: null,
  backlitKeyboard: null,
  numericKeypad: null,
  fingerprint: null,
  hasWindows: null,
  hasThunderbolt: null,
  hasEthernet: null,
  hasSDCard: null,
  hasHDMI: null,
  minUSBPorts: null,
  quotaRange: [0, 1000] as [number, number],
  quotaFrequency: 'monthly' as const,
};

const apiQuotaFullRange: [number, number] = [0, 1000];

describe('diffAndEmitFilterChanges', () => {
  it('emits nothing when filters are identical', () => {
    const analytics = makeAnalytics();
    diffAndEmitFilterChanges(baseFilter, { ...baseFilter }, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).not.toHaveBeenCalled();
    expect(analytics.trackFilterRangeChange).not.toHaveBeenCalled();
  });

  it('emits filter_toggle when a brand is added', () => {
    const analytics = makeAnalytics();
    const next: FilterState = { ...baseFilter, brands: ['Lenovo'] };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'brand',
      value: 'Lenovo',
      active: true,
    });
  });

  it('emits filter_toggle when a brand is removed', () => {
    const analytics = makeAnalytics();
    const prev: FilterState = { ...baseFilter, brands: ['Lenovo', 'HP'] };
    const next: FilterState = { ...baseFilter, brands: ['Lenovo'] };
    diffAndEmitFilterChanges(prev, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'brand',
      value: 'HP',
      active: false,
    });
  });

  it('emits filter_toggle for boolean tri-state changes', () => {
    const analytics = makeAnalytics();
    const next: FilterState = { ...baseFilter, touchScreen: true };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'display_size',
      value: 'true',
      active: true,
    });
  });

  it('emits filter_toggle with active=false when bool goes back to null', () => {
    const analytics = makeAnalytics();
    const prev: FilterState = { ...baseFilter, fingerprint: true };
    const next: FilterState = { ...baseFilter, fingerprint: null };
    diffAndEmitFilterChanges(prev, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'tags',
      value: 'any',
      active: false,
    });
  });

  it('emits filter_toggle for minUSBPorts change', () => {
    const analytics = makeAnalytics();
    const next: FilterState = { ...baseFilter, minUSBPorts: 3 };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'tags',
      value: 3,
      active: true,
    });
  });

  it('emits filter_range_change for quota range', () => {
    const analytics = makeAnalytics();
    const next: FilterState = { ...baseFilter, quotaRange: [100, 500] as [number, number] };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterRangeChange).toHaveBeenCalledWith({
      filter_code: 'quota_range',
      min: 100,
      max: 500,
      is_full_range: false,
    });
  });

  it('sets is_full_range=true when range covers API full range', () => {
    const analytics = makeAnalytics();
    const prev: FilterState = { ...baseFilter, quotaRange: [100, 500] as [number, number] };
    const next: FilterState = { ...baseFilter, quotaRange: [0, 1000] as [number, number] };
    diffAndEmitFilterChanges(prev, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterRangeChange).toHaveBeenCalledWith({
      filter_code: 'quota_range',
      min: 0,
      max: 1000,
      is_full_range: true,
    });
  });

  it('emits filter_toggle for quotaFrequency change', () => {
    const analytics = makeAnalytics();
    const next: FilterState = { ...baseFilter, quotaFrequency: 'biweekly' as const };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'quota_range',
      value: 'biweekly',
      active: true,
    });
  });

  it('emits multiple events for multiple simultaneous changes', () => {
    const analytics = makeAnalytics();
    const next: FilterState = {
      ...baseFilter,
      brands: ['Lenovo'],
      ram: [16],
      touchScreen: true,
    };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledTimes(3);
  });
});
