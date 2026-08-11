/**
 * Landing Config types.
 *
 * Mirrors the shape returned by GET /public/landing/{slug}/config,
 * where values come already cast (bool/int/float/string/JSON) and
 * grouped by namespace (the first segment of the key before the dot).
 */

export interface LandingConfigLayout {
  /** Whether the landing exposes a product catalog. */
  has_catalog: boolean;
}

export interface FloatingCtaConfig {
  title: string;
  subtitle: string;
  icon: string;
  expanded_title: string;
  expanded_description: string;
  cta_text: string;
  url: string;
}

export type DniCaptureMode = 'modal' | 'inline';

export interface LandingConfigFeatures {
  /** Whether to show the DNI modal on landing load. */
  has_dni_modal: boolean;
  /** Whether the DNI modal is required (user cannot skip). */
  dni_required: boolean;
  /** Whether to show the "Comisión de plataformas digitales" row in cronograma. */
  show_platform_commission: boolean;
  /** ISO date for VIP countdown end (e.g. "2026-04-25T05:00:00.000Z"). Empty string = no countdown. */
  vip_countdown: string;
  /** Whether to validate DNI against a whitelist before accepting. */
  has_dni_whitelist: boolean;
  /** How the DNI is captured: 'modal' (popup) or 'inline' (embedded in overlay). */
  dni_capture_mode: DniCaptureMode;
  /** Floating CTA button config. null = no button. */
  floating_cta: FloatingCtaConfig | null;
  /** Overlay variant slug. Empty = default VIP overlay. */
  overlay_variant: string;
  /** ISO date deadline for overlay access. Empty = no deadline. */
  overlay_deadline: string;
}

/**
 * Resolved landing configuration, grouped by namespace.
 * Namespaces are intentionally open to allow extensibility via seeding
 * without frontend changes — unknown namespaces are typed as `unknown`.
 */
export interface LandingConfig {
  layout: LandingConfigLayout;
  features: LandingConfigFeatures;
  [namespace: string]: Record<string, unknown> | LandingConfigLayout | LandingConfigFeatures;
}

/**
 * Pago diferido a nivel landing (namespace `deferred_payment`).
 * Viene de `landing.extra_data.deferred_payment` y lo expone el endpoint
 * /public/landing/{slug}/config. Cuando `enabled` es true, el primer pago se
 * corre `deferred_months` meses hacia adelante.
 */
export interface DeferredPaymentConfig {
  /** Si el pago diferido está activo para esta landing. */
  enabled: boolean;
  /** Cantidad de meses que se adelanta/corre el primer pago. */
  deferred_months: number;
  /** Etiqueta de campaña (ej. "paga-en-septiembre"). Informativa. */
  source?: string;
}

/**
 * Extrae de forma segura el namespace `deferred_payment` de un LandingConfig
 * resuelto. Devuelve null cuando está ausente o no está habilitado.
 */
export function getDeferredPayment(config: LandingConfig): DeferredPaymentConfig | null {
  const raw = (config as Record<string, unknown>)['deferred_payment'] as
    | Partial<DeferredPaymentConfig>
    | undefined;
  if (!raw || raw.enabled !== true) return null;
  return {
    enabled: true,
    deferred_months:
      typeof raw.deferred_months === 'number' && raw.deferred_months > 0
        ? raw.deferred_months
        : 0,
    source: typeof raw.source === 'string' ? raw.source : undefined,
  };
}

/**
 * Fecha fija de arranque de cobro de la campaña (namespace `first_payment`).
 *
 * Viene de `landing.extra_data.first_payment` y la expone el endpoint
 * /public/landing/{slug}/config. Existe para convenios que cobran contra
 * planilla: todos empiezan a pagar el mismo día sin importar cuándo
 * solicitaron, así que la fecha NO se deriva de la aprobación.
 */
export interface FirstPaymentConfig {
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** Etiqueta de campaña (ej. "family-farms-2026-08"). Informativa. */
  source?: string;
}

/**
 * Extrae el namespace `first_payment` como Date local, o null si la landing no
 * lo configuró.
 *
 * Se parsea a mano en vez de `new Date(iso)`: ese constructor interpreta
 * `YYYY-MM-DD` como UTC y en Lima (-5) el cronograma arrancaría un día antes.
 */
export function getFirstPaymentDate(config: LandingConfig): Date | null {
  const raw = (config as Record<string, unknown>)['first_payment'] as
    | Partial<FirstPaymentConfig>
    | undefined;
  const iso = typeof raw?.date === 'string' ? raw.date.trim() : '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, anio, mes, dia] = m;
  const d = new Date(Number(anio), Number(mes) - 1, Number(dia));
  // Un 2026-02-31 pasaría el regex pero no es una fecha: el rollover del
  // constructor la convertiría en marzo y el cronograma arrancaría en otro mes.
  return d.getMonth() === Number(mes) - 1 && d.getDate() === Number(dia) ? d : null;
}

/** A single ingredient (key-value) linked to the landing. */
export interface LandingConfigIngredient {
  code: string;
  key: string;
  value: unknown;
}

/** Raw API response for the config endpoint. */
export interface LandingConfigResponse {
  slug: string;
  ingredients: LandingConfigIngredient[];
  config: Partial<LandingConfig> & Record<string, Record<string, unknown>>;
}

/**
 * Logo overrides per overlay variant.
 *
 * Los assets viven en S3, nunca en `public/`: servirlos desde ahí ya dejó el
 * overlay de Family Farms sin logo en producción una vez (BAL-2598).
 */
export const OVERLAY_VARIANT_LOGOS: Record<string, string> = {
  cade: 'https://baldecash.s3.amazonaws.com/company/logo-cade-2026.webp',
  // El mismo logo combinado que muestra FamilyFarmOverlayGate al entrar.
  familyfarm: 'https://baldecash.s3.amazonaws.com/company/logo-family-farms.webp',
};

/** Default config used when the API is unreachable or returns null/empty. */
export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  layout: {
    has_catalog: true,
  },
  features: {
    has_dni_modal: false,
    dni_required: false,
    show_platform_commission: false,
    vip_countdown: '',
    has_dni_whitelist: false,
    dni_capture_mode: 'modal',
    floating_cta: null,
    overlay_variant: '',
    overlay_deadline: '',
  },
};

/**
 * Cupo de solicitudes de la campaña (namespace `application_cap`).
 *
 * Lo expone `/public/landing/{slug}/config` solo en las landings que declaran
 * un tope. Family Farms abre el convenio del cosechador con cupo acotado: se
 * admiten las primeras N solicitudes y después deja de recibir.
 *
 * El backend informa únicamente si está abierta; cuántas van y cuántas faltan
 * es información de negocio que el público no necesita.
 */
export interface ApplicationCapConfig {
  abierto: boolean;
}

/**
 * ¿La campaña sigue recibiendo solicitudes?
 *
 * El default manda: ante la ausencia del bloque, un dato mal formado o una
 * respuesta que no llegó, la campaña está ABIERTA. Cerrar una landing por un
 * dato que falta sería peor que el problema que esto resuelve, y el envío
 * igual valida el cupo del lado del servidor: acá solo se avisa antes.
 */
export function campanaAbierta(config: LandingConfig | null | undefined): boolean {
  const raw = (config as Record<string, unknown> | null | undefined)?.['application_cap'];
  if (!raw || typeof raw !== 'object') return true;
  const abierto = (raw as Partial<ApplicationCapConfig>).abierto;
  return typeof abierto === 'boolean' ? abierto : true;
}
