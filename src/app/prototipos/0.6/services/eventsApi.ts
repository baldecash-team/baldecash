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
  | 'admission_completed'
  // Phase 15: Video de admisión — eventos granulares por acción del funnel
  | 'video_permission_location_requested'
  | 'video_permission_location_granted'
  | 'video_permission_location_denied'
  | 'video_permission_camera_requested'
  | 'video_permission_camera_granted'
  | 'video_permission_camera_denied'
  | 'video_recording_started'
  | 'video_recording_stopped'
  | 'video_clip_preview_shown'
  | 'video_clip_accepted'
  | 'video_clip_rerecord'
  | 'video_question_shown'
  | 'video_example_opened'
  | 'video_upload_error'
  | 'video_completion_error'
  | 'video_success_shown'
  | 'video_device_unsupported'
  | 'video_session_resumed'
  | 'video_session_started'
  // Phase 16: OTP email verification gate (inline post-submit + link flow)
  // Every emission carries a `source` property: 'inline' (full-screen gate
  // shown after submit in the solicitar flow) vs 'link' (admision link flow),
  // so both funnels can be told apart in analytics.
  | 'otp_screen_shown'
  | 'otp_code_sent'
  | 'otp_code_resent'
  | 'otp_code_submitted'
  | 'otp_verified'
  | 'otp_failed'
  // Phase 17: Oferta condicional (Caso 4 downgrade / Caso 5 upsell) — funnel
  | 'offer_viewed'
  | 'offer_recommended_view'
  | 'offer_catalog_open'
  | 'offer_equipment_select_click'
  | 'offer_success_view'
  // Phase 18: Oferta ESTÁNDAR (F-6B) — aceptar/rechazar por URL del cliente
  | 'offer_standard_accept_click'
  | 'offer_standard_accepted'
  | 'offer_standard_reject_click'
  | 'offer_standard_rejected'
  | 'offer_standard_decision_error'
  // El cliente arma su cuota eligiendo entre los rangos de la oferta.
  | 'offer_standard_term_change'
  | 'offer_standard_initial_change'
  // El cliente marca/desmarca un accesorio o seguro de la oferta.
  | 'offer_standard_addon_toggle'
  // Ver la ficha del equipo en la landing, desde la card de la oferta estándar
  | 'offer_standard_detail_click'
  // Cobertura del funnel de oferta (6 pasos + interacciones) — BAL-2236:
  | 'offer_explore_view'
  | 'offer_equipment_chosen'
  | 'offer_complementos_view'
  | 'offer_confirm_view'
  | 'offer_over_budget'
  | 'offer_expired_view'
  | 'offer_abandoned'
  // BAL-2236 — eventos extra (whatsapp, pricing, errores, comparación, timing):
  | 'offer_whatsapp_click'
  | 'offer_pricing_change'
  | 'offer_accessory_search'
  | 'offer_select_error'
  | 'offer_empty_catalog'
  | 'offer_back_to_index'
  | 'offer_detail_revisit'
  | 'offer_catalog_return'
  | 'offer_time_to_first_action'
  | 'offer_time_to_convert'
  // BAL-2236 — eventos de catálogo de oferta con prefijo (alias de los compartidos):
  | 'offer_filter_toggle'
  | 'offer_filter_clear_single'
  | 'offer_filter_clear_all'
  | 'offer_filter_range_change'
  | 'offer_filter_section_toggle'
  | 'offer_filter_snapshot'
  | 'offer_sort_change'
  | 'offer_catalog_load_more'
  | 'offer_search_focus'
  | 'offer_search_submit'
  | 'offer_search_clear'
  // Phase 19: KYC
  | 'kyc_started'
  | 'kyc_step_complete'
  | 'kyc_step_back'
  | 'kyc_camera_requested'
  | 'kyc_camera_granted'
  | 'kyc_camera_denied'
  // Modal bloqueante con las condiciones de la selfie (sin gorra, sin lentes,
  // buena luz, rostro descubierto), previo a pedir la cámara y repetido en cada
  // reintento. `attempt` numera la apertura dentro del paso.
  | 'kyc_selfie_tips_shown'
  | 'kyc_selfie_tips_ack'
  | 'kyc_selfie_captured'
  | 'kyc_selfie_retake'
  | 'kyc_dni_captured'
  | 'kyc_dni_retake'
  | 'kyc_identity_verify_submit'
  // Lectura del DOCUMENTO (`verify-dni`): si la foto es el DNI del titular.
  // Aparte de `kyc_identity_*`, que solo comparan rostros. Catalogados en ws2
  // (`KYC_EVENT_TYPES`); sin eso el backend los descarta en silencio.
  | 'kyc_document_verified'
  | 'kyc_document_rejected'
  | 'kyc_identity_verified'
  | 'kyc_identity_rejected'
  // Siguio sin haber podido verificarse. Distinto de `kyc_identity_rejected`,
  // donde los rostros no coincidian: aca la verificacion ni siquiera concluyo.
  | 'kyc_identity_skipped'
  // Se le mostro el paso de pago de la inicial (aprobado + cuota 0 impaga).
  | 'kyc_payment_step_shown'
  | 'kyc_contract_view'
  | 'kyc_contract_accepted'
  // Una autorizacion del convenio marcada (`autorizacion` trae su id). Aparte
  // de `kyc_contract_accepted`, que solo mira el check del contrato: son
  // permisos distintos sobre el dinero del trabajador.
  | 'kyc_contract_authorization_accepted'
  // La firma: el Continuar del paso, con la lista de autorizaciones dadas en
  // `autorizaciones`. NO reemplaza al `kyc_step_complete` del wizard —ese sigue
  // midiendo el avance—; este dice QUE se autorizo.
  | 'kyc_contract_signed'
  // El check de documento (verify-dni) fallo y el titular confirmo su DNI
  // tipeandolo: se salta Textract pero compare-faces corre igual.
  | 'kyc_document_check_bypassed'
  | 'kyc_documents_uploaded'
  // Documentos subidos a S3 Y registrados en application_document; distinto
  // de `kyc_documents_uploaded`, que solo mide la seleccion local.
  | 'kyc_documents_saved'
  | 'kyc_document_upload_error'
  | 'kyc_completed'
  // "Continuar en otro momento" — pausa elegida por el cliente + link por WhatsApp.
  // Los emitidos desde /kyc/[token] usan el token como session_id.
  | 'kyc_pause_click'
  | 'kyc_pause_requested'
  | 'kyc_resume_link_sent'
  | 'kyc_resume_link_send_error'
  | 'kyc_resume_link_opened'
  | 'kyc_resume_link_expired'
  | 'kyc_resumed'
  // Phase 20: Vinculación de sesión — se emite UNA sola vez, cuando se crea
  // una sesión nueva. No se emite en recargas ni al recuperar una sesión ya
  // existente desde localStorage. Lleva el uuid en el payload para poder
  // cruzar la sesión con otras fuentes de datos fuera de este backend.
  | 'sesion_vinculada'
  // Control del envío a GA4: se emite en el mismo momento en que se fija el id
  // de sesión como propiedad de usuario en Google. Va al backend propio, que es
  // dominio nuestro y nadie bloquea, así que la comparación entre ambos lados
  // distingue "el evento no se generó" de "se generó pero no llegó a Google".
  | 'ga_link_sent'
  // Franja "Haz sido referido por Marco": la promotora que trajo la visita
  // desde un link de activación. `shown` se emite SOLO cuando la franja
  // efectivamente se renderiza — los casos negativos (sin promotor, código
  // inexistente, promotora inactiva, token que no coincide) no muestran nada y
  // tampoco emiten evento, así que las impresiones son impresiones de verdad.
  // Properties: promoter_code, landing_slug, reason (ok | sin_telefono) y
  // has_whatsapp. Nunca el nombre ni el teléfono: el backend los rechaza.
  | 'referral_banner_shown'
  | 'referral_banner_whatsapp_click'
  | 'referral_banner_dismiss'
  // Phase 21: Elección de la unidad física (`/eleccion-equipo/[token]`).
  // El cliente ya aprobado ve las unidades reales de su modelo —con las fotos
  // y el video que grabó la estación de inspección— y elige la que se lleva.
  // Los emitidos desde esa ruta usan el token del link como `session_id`.
  // NUNCA llevan el serial en `properties`: el backend ni siquiera lo manda,
  // el cliente ve `display_number` ("Unidad 01").
  | 'equipment_selection_link_open'
  | 'equipment_selection_already_chosen'
  // `units: []` — no es un error: el equipo se está preparando y el link
  // sigue sirviendo cuando entren unidades.
  | 'equipment_selection_empty'
  | 'equipment_selection_gallery_open'
  | 'equipment_selection_photo_change'
  | 'equipment_selection_video_play'
  // Click en "Elegir esta unidad". Distinto de `..._confirmed`, que es el
  // desenlace: entre los dos está el 409 de la unidad que otro se llevó.
  | 'equipment_selection_click'
  | 'equipment_selection_confirmed'
  | 'equipment_selection_error'
  | 'equipment_selection_link_expired';

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
