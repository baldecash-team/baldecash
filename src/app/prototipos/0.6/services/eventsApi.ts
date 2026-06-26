/**
 * Events API Service - BaldeCash v0.6
 *
 * Sends behavioral events in batches to POST /api/v1/public/events/batch
 * Privacy-first: NEVER captures field values, passwords, PII, etc.
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

// ============================================================================
// TYPES
// ============================================================================

/** Phase 1 (MVP) event types */
export type EventType =
  | 'session_start'
  | 'page_enter'
  | 'page_exit'
  | 'form_start'
  | 'form_abandon'
  | 'input_focus'
  | 'input_blur'
  | 'scroll_depth'
  | 'tab_hidden'
  | 'tab_visible'
  // Phase 2: E-commerce & interaction events
  | 'cta_click'
  | 'outbound_click'
  | 'product_view'
  | 'product_click'
  | 'product_hover'
  | 'cart_add'
  | 'cart_remove'
  | 'cart_clear'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'wishlist_clear'
  | 'compare_add'
  | 'compare_remove'
  | 'compare_open'
  | 'nav_click'
  | 'nav_hover'
  // Phase 3: Catalog filters / sort / paginado / search / banner
  | 'filter_toggle'
  | 'filter_clear_single'
  | 'filter_clear_all'
  | 'filter_range_change'
  | 'filter_section_toggle'
  | 'filter_snapshot'
  | 'sort_change'
  | 'catalog_load_more'
  | 'search_focus'
  | 'search_submit'
  | 'search_clear'
  | 'search_suggestion_click'
  | 'search_drawer_open'
  | 'search_drawer_close'
  | 'banner_click'
  | 'banner_hover'
  | 'view_mode_change'
  // Phase 4: Product detail interactions
  | 'cronograma_download'
  | 'cronograma_modal_open'
  | 'cronograma_modal_close'
  | 'cronograma_expand'
  | 'gallery_image_change'
  | 'gallery_lightbox_open'
  | 'gallery_lightbox_close'
  | 'gallery_zoom'
  | 'color_select'
  | 'detail_tab_click'
  | 'similar_product_click'
  | 'similar_product_add_to_cart'
  | 'spec_sheet_download'
  | 'pricing_term_change'
  | 'pricing_initial_change'
  | 'pricing_frequency_change'
  | 'product_cta_click'
  // Phase 5: Comparator / wishlist / cart drawers
  | 'compare_clear'
  | 'compare_close'
  | 'compare_best_shown'
  | 'compare_best_add_to_cart'
  | 'wishlist_drawer_open'
  | 'wishlist_drawer_close'
  | 'wishlist_move_to_cart'
  | 'cart_drawer_open'
  | 'cart_drawer_close'
  | 'cart_continue'
  | 'cart_update'
  // Phase 6: Quiz / Tour / Onboarding
  | 'quiz_start'
  | 'quiz_answer'
  | 'quiz_finish'
  | 'quiz_abandon'
  | 'quiz_result_click'
  | 'tour_start'
  | 'tour_step_view'
  | 'tour_finish'
  | 'tour_skip'
  | 'welcome_modal_shown'
  | 'welcome_modal_dismiss'
  | 'webchat_open'
  | 'webchat_close'
  // Phase 7: Solicitar wizard (accesorios / seguros / resumen)
  | 'accessory_add'
  | 'accessory_remove'
  | 'accessory_view'
  | 'accessory_impression'
  | 'insurance_toggle'
  | 'insurance_view_terms'
  | 'summary_edit_click'
  | 'summary_submit'
  | 'form_step_complete'
  | 'form_step_back'
  | 'form_step_validation_error'
  | 'form_submit_success'
  | 'form_submit_error'
  | 'coupon_applied'
  | 'coupon_error'
  | 'coupon_removed'
  | 'accessory_filter'
  | 'accessory_search'
  | 'accessory_pagination'
  | 'file_selected'
  | 'file_removed'
  | 'file_upload_error'
  | 'complementos_back'
  | 'cart_state'
  // Phase 8: Home / Landing sections
  | 'hero_cta_click'
  | 'section_cta_click'
  | 'section_view'
  | 'promo_card_click'
  | 'testimonial_view'
  | 'faq_toggle'
  // Phase 9: MacBook Neo product landing
  | 'video_replay'
  | 'gallery_dot_click'
  | 'gallery_pause_toggle'
  | 'mobile_menu_toggle'
  | 'plan_color_select'
  | 'plan_cta_click'
  | 'viewer_feature_expand'
  | 'viewer_feature_close'
  | 'viewer_color_select'
  // Phase 10: VIP / DNI landing events
  | 'dni_submit'
  | 'dni_validated'
  | 'dni_rejected'
  | 'dni_retry'
  | 'dni_skip'
  | 'vip_start_click'
  | 'error'
  // Phase 11: Confirmation page
  | 'application_submitted'
  | 'confirmation_cta_click'
  // Phase 12: Lead landing
  | 'lead_form_start'
  | 'lead_form_field_complete'
  | 'lead_form_submit'
  | 'lead_form_success'
  | 'lead_form_error'
  | 'lead_products_filter'
  | 'lead_products_scroll'
  | 'lead_banner_slide_change'
  // Phase 13: A/B testing
  | 'accessory_variant_assigned'
  // Phase 14: Admisión (OTP correo + autoservicio de video) — eventos por link/etapa
  | 'admission_link_open'
  | 'admission_stage_enter'
  | 'admission_stage_exit'
  | 'admission_completed';

/** Properties that are BLOCKED for privacy reasons — dni permitido para tracking VIP overlay */
const BLOCKED_PROPERTIES = new Set([
  'value',
  'field_value',
  'input_value',
  'text_value',
  'password',
  'email_value',
  'phone_value',
  'nombre',
  'name_value',
  'document_number',
]);

export interface TrackingEvent {
  event_type: EventType;
  client_ts: number;
  page_url: string;
  element_id?: string | null;
  properties?: Record<string, unknown>;
}

export interface BatchEventRequest {
  session_id: string;
  events: TrackingEvent[];
}

export interface BatchEventResponse {
  accepted: number;
  rejected: number;
}

// ============================================================================
// PRIVACY VALIDATION
// ============================================================================

/**
 * Strips any blocked properties from the event properties object.
 * This is a client-side safety net - the server also validates.
 */
export function sanitizeProperties(
  properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!properties) return undefined;

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(properties)) {
    if (!BLOCKED_PROPERTIES.has(key)) {
      sanitized[key] = val;
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

// ============================================================================
// API CALL
// ============================================================================

/**
 * Send a batch of events to the backend.
 * Fire-and-forget: errors are logged but never thrown to the UI.
 */
export async function sendEventsBatch(
  sessionId: string,
  events: TrackingEvent[]
): Promise<BatchEventResponse | null> {
  if (!sessionId || events.length === 0) return null;

  // Sanitize all event properties before sending
  const sanitizedEvents = events.map((evt) => ({
    ...evt,
    properties: sanitizeProperties(evt.properties),
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/public/events/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        events: sanitizedEvents,
      }),
    });

    if (!response.ok) {
      console.warn('[Events] Batch rejected:', response.status);
      return null;
    }

    return (await response.json()) as BatchEventResponse;
  } catch (error) {
    // Never throw - tracking failures must not break the user flow
    console.warn('[Events] Failed to send batch:', error);
    return null;
  }
}
