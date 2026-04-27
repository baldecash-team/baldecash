import { diffAndEmitFilterChanges } from '../catalogFilterDiff';
import type { FilterState } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

const makeAnalytics = () => ({
  track: jest.fn(),
  trackFilterToggle: jest.fn(),
  trackFilterRangeChange: jest.fn(),
  trackFilterClearSingle: jest.fn(),
  trackFilterClearAll: jest.fn(),
  trackFilterSectionToggle: jest.fn(),
  trackSortChange: jest.fn(),
  trackLoadMore: jest.fn(),
  trackViewModeChange: jest.fn(),
  trackSearchFocus: jest.fn(),
  trackSearchSubmit: jest.fn(),
  trackSearchClear: jest.fn(),
  trackSearchSuggestionClick: jest.fn(),
  trackSearchDrawerOpen: jest.fn(),
  trackSearchDrawerClose: jest.fn(),
  trackBannerClick: jest.fn(),
  trackBannerHover: jest.fn(),
  trackProductView: jest.fn(),
  trackProductClick: jest.fn(),
  trackProductHover: jest.fn(),
  trackCartAdd: jest.fn(),
  trackCartRemove: jest.fn(),
  trackCartClear: jest.fn(),
  trackWishlistAdd: jest.fn(),
  trackWishlistRemove: jest.fn(),
  trackWishlistClear: jest.fn(),
  trackCompareAdd: jest.fn(),
  trackCompareRemove: jest.fn(),
  trackCompareOpen: jest.fn(),
  trackNavClick: jest.fn(),
  trackNavHover: jest.fn(),
  trackCronogramaDownload: jest.fn(),
  trackCronogramaModalOpen: jest.fn(),
  trackCronogramaModalClose: jest.fn(),
  trackCronogramaExpand: jest.fn(),
  trackGalleryImageChange: jest.fn(),
  trackGalleryLightboxOpen: jest.fn(),
  trackGalleryLightboxClose: jest.fn(),
  trackGalleryZoom: jest.fn(),
  trackColorSelect: jest.fn(),
  trackDetailTabClick: jest.fn(),
  trackSimilarProductClick: jest.fn(),
  trackSimilarProductAddToCart: jest.fn(),
  trackSpecSheetDownload: jest.fn(),
  trackPricingTermChange: jest.fn(),
  trackPricingInitialChange: jest.fn(),
  trackPricingFrequencyChange: jest.fn(),
  trackProductCtaClick: jest.fn(),
  trackCompareClear: jest.fn(),
  trackCompareClose: jest.fn(),
  trackCompareBestShown: jest.fn(),
  trackCompareBestAddToCart: jest.fn(),
  trackWishlistDrawerOpen: jest.fn(),
  trackWishlistDrawerClose: jest.fn(),
  trackWishlistMoveToCart: jest.fn(),
  trackCartDrawerOpen: jest.fn(),
  trackCartDrawerClose: jest.fn(),
  trackCartContinue: jest.fn(),
  trackCartUpdate: jest.fn(),
  trackQuizStart: jest.fn(),
  trackQuizAnswer: jest.fn(),
  trackQuizFinish: jest.fn(),
  trackQuizAbandon: jest.fn(),
  trackQuizResultClick: jest.fn(),
  trackTourStart: jest.fn(),
  trackTourStepView: jest.fn(),
  trackTourFinish: jest.fn(),
  trackTourSkip: jest.fn(),
  trackWelcomeModalShown: jest.fn(),
  trackWelcomeModalDismiss: jest.fn(),
  trackWebchatOpen: jest.fn(),
  trackWebchatClose: jest.fn(),
  trackAccessoryAdd: jest.fn(),
  trackAccessoryRemove: jest.fn(),
  trackAccessoryView: jest.fn(),
  trackAccessoryImpression: jest.fn(),
  trackInsuranceToggle: jest.fn(),
  trackInsuranceViewTerms: jest.fn(),
  trackSummaryEditClick: jest.fn(),
  trackSummarySubmit: jest.fn(),
  trackHeroCtaClick: jest.fn(),
  trackSectionCtaClick: jest.fn(),
  trackSectionView: jest.fn(),
  trackPromoCardClick: jest.fn(),
  trackTestimonialView: jest.fn(),
  trackFaqToggle: jest.fn(),
});

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
  quotaRange: [0, 1000],
  quotaFrequency: 'monthly',
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
    const next = { ...baseFilter, brands: ['Lenovo'] };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'brand',
      value: 'Lenovo',
      active: true,
    });
  });

  it('emits filter_toggle when a brand is removed', () => {
    const analytics = makeAnalytics();
    const prev = { ...baseFilter, brands: ['Lenovo', 'HP'] };
    const next = { ...baseFilter, brands: ['Lenovo'] };
    diffAndEmitFilterChanges(prev, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'brand',
      value: 'HP',
      active: false,
    });
  });

  it('emits filter_toggle for boolean tri-state changes', () => {
    const analytics = makeAnalytics();
    const next = { ...baseFilter, touchScreen: true };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'display_size',
      value: 'true',
      active: true,
    });
  });

  it('emits filter_toggle with active=false when bool goes back to null', () => {
    const analytics = makeAnalytics();
    const prev = { ...baseFilter, fingerprint: true };
    const next = { ...baseFilter, fingerprint: null };
    diffAndEmitFilterChanges(prev, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'tags',
      value: 'any',
      active: false,
    });
  });

  it('emits filter_toggle for minUSBPorts change', () => {
    const analytics = makeAnalytics();
    const next = { ...baseFilter, minUSBPorts: 3 };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'tags',
      value: 3,
      active: true,
    });
  });

  it('emits filter_range_change for quota range', () => {
    const analytics = makeAnalytics();
    const next = { ...baseFilter, quotaRange: [100, 500] as [number, number] };
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
    const prev = { ...baseFilter, quotaRange: [100, 500] as [number, number] };
    const next = { ...baseFilter, quotaRange: [0, 1000] as [number, number] };
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
    const next = { ...baseFilter, quotaFrequency: 'biweekly' };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledWith({
      filter_code: 'quota_range',
      value: 'biweekly',
      active: true,
    });
  });

  it('emits multiple events for multiple simultaneous changes', () => {
    const analytics = makeAnalytics();
    const next = {
      ...baseFilter,
      brands: ['Lenovo'],
      ram: ['16GB'],
      touchScreen: true,
    };
    diffAndEmitFilterChanges(baseFilter, next, analytics, apiQuotaFullRange);
    expect(analytics.trackFilterToggle).toHaveBeenCalledTimes(3);
  });
});
