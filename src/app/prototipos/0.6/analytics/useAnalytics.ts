'use client';

/**
 * useAnalytics - Wrapper tipado sobre EventTrackerContext.
 *
 * Objetivo: un único punto de entrada para emitir eventos de la app con
 * payload consistente (snake_case, nombres estables) y helpers por dominio.
 *
 * Diseño:
 * - No re-emite eventos: delega en `tracker.track` del contexto.
 * - Helpers silenciosos si el provider no está montado (SSR/preview).
 * - Debounce explícito para interacciones ruidosas (hover, sliders).
 */

import { useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import type { EventType } from '@/app/prototipos/0.6/services/eventsApi';

type Primitive = string | number | boolean | null | undefined;
type Props = Record<string, Primitive | Primitive[]>;

export type FilterCode =
  | 'brand'
  | 'gama'
  | 'ram'
  | 'storage'
  | 'usage'
  | 'tags'
  | 'condition'
  | 'device_types'
  | 'display_size'
  | 'gpu_type'
  | 'stock'
  | 'price_range'
  | 'quota_range';

/** Debounce util scoped a este hook (no crea timers sueltos entre renders). */
function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay]
  );
}

export interface UseAnalyticsReturn {
  /** Escape hatch: emitir un evento arbitrario con shape crudo. */
  track: (eventType: EventType, properties?: Props, elementId?: string) => void;

  // Filtros
  trackFilterToggle: (args: {
    filter_code: FilterCode;
    value: string | number | boolean;
    active: boolean;
    section?: string;
  }) => void;
  trackFilterRangeChange: (args: {
    filter_code: FilterCode;
    min: number;
    max: number;
    is_full_range: boolean;
  }) => void;
  trackFilterClearSingle: (args: { filter_code: FilterCode; value?: string | number }) => void;
  trackFilterClearAll: (args?: { source?: string }) => void;
  trackFilterSectionToggle: (args: { filter_code: FilterCode; expanded: boolean }) => void;

  // Sort + paginado + vista
  trackSortChange: (args: { from: string; to: string }) => void;
  trackLoadMore: (args: { visible_count: number; total_count: number; page?: number }) => void;
  trackViewModeChange: (args: { from: string; to: string }) => void;

  // Search
  trackSearchFocus: (args?: { location?: string }) => void;
  trackSearchSubmit: (args: { query_length: number; has_results?: boolean; location?: string }) => void;
  trackSearchClear: (args?: { location?: string }) => void;
  trackSearchSuggestionClick: (args: { original: string; suggested: string }) => void;
  trackSearchDrawer: (args: { open: boolean }) => void;

  // Banners
  trackBannerClick: (args: { banner_id?: string; location: string; href?: string; variant?: string }) => void;
  trackBannerHover: (args: { banner_id?: string; location: string; variant?: string }) => void;

  // Detalle de producto
  trackCronogramaDownload: (args: { product_id: string; term: number; initial_percent: number }) => void;
  trackCronogramaModal: (args: { open: boolean; product_id: string }) => void;
  trackCronogramaExpand: (args: { product_id: string; expanded: boolean; term: number }) => void;
  trackGalleryImageChange: (args: {
    product_id: string;
    index: number;
    total: number;
    method: 'thumb' | 'arrow' | 'keyboard' | 'swipe' | 'auto';
  }) => void;
  trackGalleryLightbox: (args: { open: boolean; product_id: string; index?: number }) => void;
  trackGalleryZoom: (args: { product_id: string; direction: 'in' | 'out'; level?: number }) => void;
  trackColorSelect: (args: {
    product_id: string;
    color_id: string;
    color_name?: string;
    navigates_to_sibling: boolean;
  }) => void;
  trackDetailTabClick: (args: { product_id: string; section: string }) => void;
  trackSimilarProductClick: (args: { source_product_id: string; target_product_id: string; position: number }) => void;
  trackSimilarProductAddToCart: (args: { source_product_id: string; target_product_id: string }) => void;
  trackSpecSheetDownload: (args: { product_id: string; format?: string }) => void;
  trackPricingTermChange: (args: { product_id: string; from: number; to: number }) => void;
  trackPricingInitialChange: (args: { product_id: string; from: number; to: number }) => void;

  // Comparador + Drawers
  trackCompareClear: () => void;
  trackCompareClose: () => void;
  trackCompareBestShown: (args: { product_id: string; product_count: number }) => void;
  trackCompareBestAddToCart: (args: { product_id: string }) => void;
  trackWishlistDrawer: (args: { open: boolean; item_count: number }) => void;
  trackWishlistMoveToCart: (args: { product_id: string }) => void;
  trackCartDrawer: (args: { open: boolean; item_count: number }) => void;
  trackCartContinue: (args: { item_count: number; total_monthly_quota?: number }) => void;
  trackCartUpdate: (args: { product_id: string; months?: number; initial_percent?: number }) => void;

  // Quiz / Tour / Webchat
  trackQuizStart: (args: { context?: string; question_count?: number }) => void;
  trackQuizAnswer: (args: { question_id: string | number; option_id?: string | number; step: number; total: number }) => void;
  trackQuizFinish: (args: { context?: string; result_count?: number; duration_ms?: number }) => void;
  trackQuizAbandon: (args: { context?: string; step: number; total: number }) => void;
  trackQuizResultClick: (args: { product_id: string; position: number }) => void;
  trackTourStart: (args: { step_count: number; style?: string }) => void;
  trackTourStepView: (args: { step: number; step_id?: string; total: number }) => void;
  trackTourFinish: (args: { total: number; duration_ms?: number }) => void;
  trackTourSkip: (args: { step: number; total: number }) => void;
  trackWelcomeModal: (args: { shown: boolean; action?: 'dismiss' | 'start_tour' | 'take_quiz' }) => void;
  trackWebchatDrawer: (args: { open: boolean; source?: string }) => void;

  // Solicitar wizard: accesorios / seguros / resumen
  trackAccessoryAdd: (args: {
    accessory_id: string;
    accessory_name: string;
    price?: number | null;
    source_product_id?: string | null;
  }) => void;
  trackAccessoryRemove: (args: { accessory_id: string; source_product_id?: string | null }) => void;
  trackAccessoryView: (args: { accessory_id: string; accessory_name: string }) => void;
  trackInsuranceToggle: (args: {
    insurance_id: string;
    insurance_name: string;
    active: boolean;
    monthly_price?: number | null;
  }) => void;
  trackInsuranceViewTerms: (args: { insurance_id: string }) => void;
  trackSummaryEditClick: (args: { section: string }) => void;
  trackSummarySubmit: (args: {
    product_count: number;
    accessory_count: number;
    insurance_selected: boolean;
    total_monthly?: number | null;
  }) => void;

  // Landing / Home
  trackHeroCtaClick: (args: { landing_slug: string; cta_id?: string | null; variant?: string | null }) => void;
  trackSectionCtaClick: (args: { section_name: string; cta_id?: string | null; href?: string | null }) => void;
  trackPromoCardClick: (args: {
    promo_id?: string | null;
    title?: string | null;
    href?: string | null;
  }) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const tracker = useEventTrackerOptional();
  const params = useParams();
  const landing = (params?.landing as string) || 'home';

  const track = useCallback(
    (eventType: EventType, properties?: Props, elementId?: string) => {
      if (!tracker) return;
      tracker.track(eventType, { landing, ...(properties || {}) }, elementId);
    },
    [tracker, landing]
  );

  // Filtros
  const trackFilterToggle = useCallback<UseAnalyticsReturn['trackFilterToggle']>(
    ({ filter_code, value, active, section = 'catalog' }) => {
      track('filter_toggle', { filter_code, value, active, section });
    },
    [track]
  );

  // Slider/range: debounce para no saturar el buffer mientras el usuario arrastra.
  const debouncedRangeChange = useDebouncedCallback(
    (...args: unknown[]) => {
      const payload = args[0] as Parameters<UseAnalyticsReturn['trackFilterRangeChange']>[0];
      track('filter_range_change', { ...payload });
    },
    400
  );
  const trackFilterRangeChange = useCallback<UseAnalyticsReturn['trackFilterRangeChange']>(
    (args) => debouncedRangeChange(args),
    [debouncedRangeChange]
  );

  const trackFilterClearSingle = useCallback<UseAnalyticsReturn['trackFilterClearSingle']>(
    ({ filter_code, value }) => {
      track('filter_clear_single', { filter_code, value: value ?? null });
    },
    [track]
  );

  const trackFilterClearAll = useCallback<UseAnalyticsReturn['trackFilterClearAll']>(
    (args) => {
      track('filter_clear_all', { source: args?.source ?? 'unknown' });
    },
    [track]
  );

  const trackFilterSectionToggle = useCallback<UseAnalyticsReturn['trackFilterSectionToggle']>(
    ({ filter_code, expanded }) => {
      track('filter_section_toggle', { filter_code, expanded });
    },
    [track]
  );

  // Sort + paginado
  const trackSortChange = useCallback<UseAnalyticsReturn['trackSortChange']>(
    ({ from, to }) => {
      if (from === to) return;
      track('sort_change', { from, to });
    },
    [track]
  );

  const trackLoadMore = useCallback<UseAnalyticsReturn['trackLoadMore']>(
    ({ visible_count, total_count, page }) => {
      track('catalog_load_more', { visible_count, total_count, page: page ?? null });
    },
    [track]
  );

  const trackViewModeChange = useCallback<UseAnalyticsReturn['trackViewModeChange']>(
    ({ from, to }) => {
      if (from === to) return;
      track('view_mode_change', { from, to });
    },
    [track]
  );

  // Search
  const trackSearchFocus = useCallback<UseAnalyticsReturn['trackSearchFocus']>(
    (args) => {
      track('search_focus', { location: args?.location ?? 'navbar' });
    },
    [track]
  );

  const trackSearchSubmit = useCallback<UseAnalyticsReturn['trackSearchSubmit']>(
    ({ query_length, has_results, location = 'navbar' }) => {
      track('search_submit', {
        query_length,
        has_results: has_results ?? null,
        location,
      });
    },
    [track]
  );

  const trackSearchClear = useCallback<UseAnalyticsReturn['trackSearchClear']>(
    (args) => {
      track('search_clear', { location: args?.location ?? 'navbar' });
    },
    [track]
  );

  const trackSearchSuggestionClick = useCallback<UseAnalyticsReturn['trackSearchSuggestionClick']>(
    ({ original, suggested }) => {
      track('search_suggestion_click', { original, suggested });
    },
    [track]
  );

  const trackSearchDrawer = useCallback<UseAnalyticsReturn['trackSearchDrawer']>(
    ({ open }) => {
      track(open ? 'search_drawer_open' : 'search_drawer_close', {});
    },
    [track]
  );

  // Banners
  const trackBannerClick = useCallback<UseAnalyticsReturn['trackBannerClick']>(
    ({ banner_id, location, href, variant }) => {
      track('banner_click', {
        banner_id: banner_id ?? null,
        location,
        href: href ?? null,
        variant: variant ?? null,
      });
    },
    [track]
  );

  // Hover con debounce para evitar ráfagas cuando el usuario pasa el mouse rápido.
  const debouncedBannerHover = useDebouncedCallback(
    (...args: unknown[]) => {
      const payload = args[0] as Parameters<UseAnalyticsReturn['trackBannerHover']>[0];
      track('banner_hover', {
        banner_id: payload.banner_id ?? null,
        location: payload.location,
        variant: payload.variant ?? null,
      });
    },
    500
  );
  const trackBannerHover = useCallback<UseAnalyticsReturn['trackBannerHover']>(
    (args) => debouncedBannerHover(args),
    [debouncedBannerHover]
  );

  // ============================================================================
  // Detalle de producto
  // ============================================================================
  const trackCronogramaDownload = useCallback<UseAnalyticsReturn['trackCronogramaDownload']>(
    (args) => track('cronograma_download', { ...args }),
    [track]
  );
  const trackCronogramaModal = useCallback<UseAnalyticsReturn['trackCronogramaModal']>(
    ({ open, product_id }) =>
      track(open ? 'cronograma_modal_open' : 'cronograma_modal_close', { product_id }),
    [track]
  );
  const trackCronogramaExpand = useCallback<UseAnalyticsReturn['trackCronogramaExpand']>(
    (args) => track('cronograma_expand', { ...args }),
    [track]
  );

  const trackGalleryImageChange = useCallback<UseAnalyticsReturn['trackGalleryImageChange']>(
    (args) => track('gallery_image_change', { ...args }),
    [track]
  );
  const trackGalleryLightbox = useCallback<UseAnalyticsReturn['trackGalleryLightbox']>(
    ({ open, product_id, index }) =>
      track(open ? 'gallery_lightbox_open' : 'gallery_lightbox_close', {
        product_id,
        index: index ?? null,
      }),
    [track]
  );
  const trackGalleryZoom = useCallback<UseAnalyticsReturn['trackGalleryZoom']>(
    ({ product_id, direction, level }) =>
      track('gallery_zoom', { product_id, direction, level: level ?? null }),
    [track]
  );

  const trackColorSelect = useCallback<UseAnalyticsReturn['trackColorSelect']>(
    (args) => track('color_select', { ...args, color_name: args.color_name ?? null }),
    [track]
  );

  const trackDetailTabClick = useCallback<UseAnalyticsReturn['trackDetailTabClick']>(
    (args) => track('detail_tab_click', { ...args }),
    [track]
  );

  const trackSimilarProductClick = useCallback<UseAnalyticsReturn['trackSimilarProductClick']>(
    (args) => track('similar_product_click', { ...args }),
    [track]
  );
  const trackSimilarProductAddToCart = useCallback<UseAnalyticsReturn['trackSimilarProductAddToCart']>(
    (args) => track('similar_product_add_to_cart', { ...args }),
    [track]
  );

  const trackSpecSheetDownload = useCallback<UseAnalyticsReturn['trackSpecSheetDownload']>(
    ({ product_id, format }) =>
      track('spec_sheet_download', { product_id, format: format ?? 'pdf' }),
    [track]
  );

  const trackPricingTermChange = useCallback<UseAnalyticsReturn['trackPricingTermChange']>(
    (args) => {
      if (args.from === args.to) return;
      track('pricing_term_change', { ...args });
    },
    [track]
  );
  const trackPricingInitialChange = useCallback<UseAnalyticsReturn['trackPricingInitialChange']>(
    (args) => {
      if (args.from === args.to) return;
      track('pricing_initial_change', { ...args });
    },
    [track]
  );

  // ============================================================================
  // Comparador / Drawers
  // ============================================================================
  const trackCompareClear = useCallback<UseAnalyticsReturn['trackCompareClear']>(
    () => track('compare_clear', {}),
    [track]
  );
  const trackCompareClose = useCallback<UseAnalyticsReturn['trackCompareClose']>(
    () => track('compare_close', {}),
    [track]
  );
  const trackCompareBestShown = useCallback<UseAnalyticsReturn['trackCompareBestShown']>(
    (args) => track('compare_best_shown', { ...args }),
    [track]
  );
  const trackCompareBestAddToCart = useCallback<UseAnalyticsReturn['trackCompareBestAddToCart']>(
    (args) => track('compare_best_add_to_cart', { ...args }),
    [track]
  );

  const trackWishlistDrawer = useCallback<UseAnalyticsReturn['trackWishlistDrawer']>(
    ({ open, item_count }) =>
      track(open ? 'wishlist_drawer_open' : 'wishlist_drawer_close', { item_count }),
    [track]
  );
  const trackWishlistMoveToCart = useCallback<UseAnalyticsReturn['trackWishlistMoveToCart']>(
    (args) => track('wishlist_move_to_cart', { ...args }),
    [track]
  );
  const trackCartDrawer = useCallback<UseAnalyticsReturn['trackCartDrawer']>(
    ({ open, item_count }) =>
      track(open ? 'cart_drawer_open' : 'cart_drawer_close', { item_count }),
    [track]
  );
  const trackCartContinue = useCallback<UseAnalyticsReturn['trackCartContinue']>(
    ({ item_count, total_monthly_quota }) =>
      track('cart_continue', {
        item_count,
        total_monthly_quota: total_monthly_quota ?? null,
      }),
    [track]
  );
  const trackCartUpdate = useCallback<UseAnalyticsReturn['trackCartUpdate']>(
    (args) => track('cart_update', {
      product_id: args.product_id,
      months: args.months ?? null,
      initial_percent: args.initial_percent ?? null,
    }),
    [track]
  );

  // ============================================================================
  // Quiz / Tour
  // ============================================================================
  const trackQuizStart = useCallback<UseAnalyticsReturn['trackQuizStart']>(
    (args) => track('quiz_start', {
      context: args.context ?? 'catalog',
      question_count: args.question_count ?? null,
    }),
    [track]
  );
  const trackQuizAnswer = useCallback<UseAnalyticsReturn['trackQuizAnswer']>(
    (args) => track('quiz_answer', {
      question_id: args.question_id,
      option_id: args.option_id ?? null,
      step: args.step,
      total: args.total,
    }),
    [track]
  );
  const trackQuizFinish = useCallback<UseAnalyticsReturn['trackQuizFinish']>(
    (args) => track('quiz_finish', {
      context: args.context ?? 'catalog',
      result_count: args.result_count ?? null,
      duration_ms: args.duration_ms ?? null,
    }),
    [track]
  );
  const trackQuizAbandon = useCallback<UseAnalyticsReturn['trackQuizAbandon']>(
    (args) => track('quiz_abandon', {
      context: args.context ?? 'catalog',
      step: args.step,
      total: args.total,
    }),
    [track]
  );
  const trackQuizResultClick = useCallback<UseAnalyticsReturn['trackQuizResultClick']>(
    (args) => track('quiz_result_click', { ...args }),
    [track]
  );

  const trackTourStart = useCallback<UseAnalyticsReturn['trackTourStart']>(
    (args) => track('tour_start', { step_count: args.step_count, style: args.style ?? null }),
    [track]
  );
  const trackTourStepView = useCallback<UseAnalyticsReturn['trackTourStepView']>(
    (args) => track('tour_step_view', {
      step: args.step,
      step_id: args.step_id ?? null,
      total: args.total,
    }),
    [track]
  );
  const trackTourFinish = useCallback<UseAnalyticsReturn['trackTourFinish']>(
    (args) => track('tour_finish', {
      total: args.total,
      duration_ms: args.duration_ms ?? null,
    }),
    [track]
  );
  const trackTourSkip = useCallback<UseAnalyticsReturn['trackTourSkip']>(
    (args) => track('tour_skip', { ...args }),
    [track]
  );
  const trackWelcomeModal = useCallback<UseAnalyticsReturn['trackWelcomeModal']>(
    ({ shown, action }) =>
      track(shown ? 'welcome_modal_shown' : 'welcome_modal_dismiss', {
        action: action ?? null,
      }),
    [track]
  );
  const trackWebchatDrawer = useCallback<UseAnalyticsReturn['trackWebchatDrawer']>(
    ({ open, source }) =>
      track(open ? 'webchat_open' : 'webchat_close', { source: source ?? null }),
    [track]
  );

  // ============================================================================
  // Solicitar wizard: accesorios / seguros / resumen
  // ============================================================================
  const trackAccessoryAdd = useCallback<UseAnalyticsReturn['trackAccessoryAdd']>(
    (args) =>
      track('accessory_add', {
        ...args,
        price: args.price ?? null,
        source_product_id: args.source_product_id ?? null,
      }),
    [track]
  );
  const trackAccessoryRemove = useCallback<UseAnalyticsReturn['trackAccessoryRemove']>(
    (args) =>
      track('accessory_remove', {
        ...args,
        source_product_id: args.source_product_id ?? null,
      }),
    [track]
  );
  const trackAccessoryView = useCallback<UseAnalyticsReturn['trackAccessoryView']>(
    (args) => track('accessory_view', { ...args }),
    [track]
  );
  const trackInsuranceToggle = useCallback<UseAnalyticsReturn['trackInsuranceToggle']>(
    (args) =>
      track('insurance_toggle', {
        ...args,
        monthly_price: args.monthly_price ?? null,
      }),
    [track]
  );
  const trackInsuranceViewTerms = useCallback<UseAnalyticsReturn['trackInsuranceViewTerms']>(
    (args) => track('insurance_view_terms', { ...args }),
    [track]
  );
  const trackSummaryEditClick = useCallback<UseAnalyticsReturn['trackSummaryEditClick']>(
    (args) => track('summary_edit_click', { ...args }),
    [track]
  );
  const trackSummarySubmit = useCallback<UseAnalyticsReturn['trackSummarySubmit']>(
    (args) =>
      track('summary_submit', {
        ...args,
        total_monthly: args.total_monthly ?? null,
      }),
    [track]
  );

  // ============================================================================
  // Landing / Home sections
  // ============================================================================
  const trackHeroCtaClick = useCallback<UseAnalyticsReturn['trackHeroCtaClick']>(
    (args) =>
      track('hero_cta_click', {
        landing_slug: args.landing_slug,
        cta_id: args.cta_id ?? null,
        variant: args.variant ?? null,
      }),
    [track]
  );
  const trackSectionCtaClick = useCallback<UseAnalyticsReturn['trackSectionCtaClick']>(
    (args) =>
      track('section_cta_click', {
        section_name: args.section_name,
        cta_id: args.cta_id ?? null,
        href: args.href ?? null,
      }),
    [track]
  );
  const trackPromoCardClick = useCallback<UseAnalyticsReturn['trackPromoCardClick']>(
    (args) =>
      track('promo_card_click', {
        promo_id: args.promo_id ?? null,
        title: args.title ?? null,
        href: args.href ?? null,
      }),
    [track]
  );

  return useMemo(
    () => ({
      track,
      // Filtros
      trackFilterToggle,
      trackFilterRangeChange,
      trackFilterClearSingle,
      trackFilterClearAll,
      trackFilterSectionToggle,
      // Sort / paginado / vista
      trackSortChange,
      trackLoadMore,
      trackViewModeChange,
      // Search
      trackSearchFocus,
      trackSearchSubmit,
      trackSearchClear,
      trackSearchSuggestionClick,
      trackSearchDrawer,
      // Banners
      trackBannerClick,
      trackBannerHover,
      // Detalle
      trackCronogramaDownload,
      trackCronogramaModal,
      trackCronogramaExpand,
      trackGalleryImageChange,
      trackGalleryLightbox,
      trackGalleryZoom,
      trackColorSelect,
      trackDetailTabClick,
      trackSimilarProductClick,
      trackSimilarProductAddToCart,
      trackSpecSheetDownload,
      trackPricingTermChange,
      trackPricingInitialChange,
      // Comparador / Drawers
      trackCompareClear,
      trackCompareClose,
      trackCompareBestShown,
      trackCompareBestAddToCart,
      trackWishlistDrawer,
      trackWishlistMoveToCart,
      trackCartDrawer,
      trackCartContinue,
      trackCartUpdate,
      // Quiz / Tour
      trackQuizStart,
      trackQuizAnswer,
      trackQuizFinish,
      trackQuizAbandon,
      trackQuizResultClick,
      trackTourStart,
      trackTourStepView,
      trackTourFinish,
      trackTourSkip,
      trackWelcomeModal,
      trackWebchatDrawer,
      // Solicitar wizard
      trackAccessoryAdd,
      trackAccessoryRemove,
      trackAccessoryView,
      trackInsuranceToggle,
      trackInsuranceViewTerms,
      trackSummaryEditClick,
      trackSummarySubmit,
      // Landing / Home
      trackHeroCtaClick,
      trackSectionCtaClick,
      trackPromoCardClick,
    }),
    [
      track,
      trackFilterToggle,
      trackFilterRangeChange,
      trackFilterClearSingle,
      trackFilterClearAll,
      trackFilterSectionToggle,
      trackSortChange,
      trackLoadMore,
      trackViewModeChange,
      trackSearchFocus,
      trackSearchSubmit,
      trackSearchClear,
      trackSearchSuggestionClick,
      trackSearchDrawer,
      trackBannerClick,
      trackBannerHover,
      trackCronogramaDownload,
      trackCronogramaModal,
      trackCronogramaExpand,
      trackGalleryImageChange,
      trackGalleryLightbox,
      trackGalleryZoom,
      trackColorSelect,
      trackDetailTabClick,
      trackSimilarProductClick,
      trackSimilarProductAddToCart,
      trackSpecSheetDownload,
      trackPricingTermChange,
      trackPricingInitialChange,
      trackCompareClear,
      trackCompareClose,
      trackCompareBestShown,
      trackCompareBestAddToCart,
      trackWishlistDrawer,
      trackWishlistMoveToCart,
      trackCartDrawer,
      trackCartContinue,
      trackCartUpdate,
      trackQuizStart,
      trackQuizAnswer,
      trackQuizFinish,
      trackQuizAbandon,
      trackQuizResultClick,
      trackTourStart,
      trackTourStepView,
      trackTourFinish,
      trackTourSkip,
      trackWelcomeModal,
      trackWebchatDrawer,
      trackAccessoryAdd,
      trackAccessoryRemove,
      trackAccessoryView,
      trackInsuranceToggle,
      trackInsuranceViewTerms,
      trackSummaryEditClick,
      trackSummarySubmit,
      trackHeroCtaClick,
      trackSectionCtaClick,
      trackPromoCardClick,
    ]
  );
}
