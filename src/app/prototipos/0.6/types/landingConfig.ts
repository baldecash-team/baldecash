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
  /**
   * Muestra el logo de la institución del convenio en header y footer.
   *
   * El default es `true`: una landing sin el ingrediente `agreement-logo-off`
   * renderiza igual que antes de que este flag existiera. Existe para los
   * convenios que no quieren su marca en la landing (BAL-2970).
   */
  show_agreement_logo: boolean;
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
  /**
   * Permite cambiar el plazo desde la tarjeta de producto de /solicitar.
   *
   * El default es `true`: una landing sin el ingrediente `term-selector-off`
   * renderiza igual que antes de que este flag existiera.
   *
   * Existe para el producto de matrícula, donde el plazo se elige en la
   * calculadora y la cuota ya se calculó contra el simulador: volver a cambiarlo
   * en /solicitar dejaría la cuota mostrada y la seleccionada en desacuerdo.
   */
  can_change_term: boolean;

  /**
   * Si la imagen del producto se muestra en el recorrido de solicitud.
   *
   * El default es `true`: una landing sin el ingrediente `product-image-off`
   * se ve igual que antes de que este flag existiera.
   *
   * Existe para el producto de matrícula, donde lo que se financia no es un
   * equipo sino una inscripción: la imagen no aporta información y confunde.
   */
  show_product_image: boolean;
  /**
   * Muestra el ingreso de cupón de descuento en /solicitar.
   *
   * El default es `true`, por el mismo motivo que el anterior. Se apaga con el
   * ingrediente `coupon-off` en las landings que no se activan con promotor en
   * campo, donde nadie le dicta un código al solicitante.
   */
  has_coupon: boolean;
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
 * Configuracion de la calculadora de efectivo (namespace `calculadora`).
 *
 * La landing lo emite SIEMPRE, con `enabled: false` cuando no aplica, asi que
 * el componente nunca tiene que distinguir ausencia de apagado.
 *
 * Nada de esto se decide en el navegador: producto, variante, rango del monto,
 * plazos, tasa y comision son datos del backend. Los plazos ademas se derivan
 * de las celdas de precio, de modo que no puede ofrecerse una combinacion sin
 * celda —esa caeria a la regla global y registraria la solicitud con otra tasa.
 */
export interface CalculadoraAmountRange {
  min: number;
  max: number;
  /**
   * Salto del monto. El backend valida que el monto sea multiplo exacto del
   * salto, asi que un salto mayor a 1 rechaza cualquier importe con decimales.
   */
  step: number;
}

/** Un concepto del desglose de la comision periodica, para el texto legal. */
export interface CalculadoraCommissionConcept {
  concept: string;
  amount: number;
}

export interface CalculadoraConfig {
  /** Producto riel sobre el que se registra la solicitud. */
  productId: number;
  /**
   * Variante del producto. Obligatoria: omitirla deja la solicitud con una tasa
   * en el backend nuevo y otra distinta en el legado, para el mismo prestamo.
   */
  variantId: number;
  amount: CalculadoraAmountRange;
  /** Plazos ofrecidos, derivados de las celdas de precio y ordenados. */
  terms: number[];
  commissionBreakdown: CalculadoraCommissionConcept[];
  /** Interes moratorio en soles por dia de atraso. */
  dailyLateFee: number;
}

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

/** Los plazos salen de `planes`, que el backend deriva de las celdas de precio. */
function readCalculadoraTerms(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const terms = raw
    .map((plan) => toPositiveInt((plan as Record<string, unknown> | null)?.plazo))
    .filter((plazo): plazo is number => plazo !== null);
  return Array.from(new Set(terms)).sort((a, b) => a - b);
}

function readCalculadoraAmountRange(raw: unknown): CalculadoraAmountRange | null {
  if (!raw || typeof raw !== 'object') return null;
  const { min, max, step } = raw as Record<string, unknown>;

  const maximo = typeof max === 'number' ? max : Number(max);
  if (!Number.isFinite(maximo) || maximo <= 0) return null;

  const minimo = typeof min === 'number' ? min : Number(min);
  const salto = typeof step === 'number' ? step : Number(step);

  return {
    min: Number.isFinite(minimo) && minimo > 0 ? minimo : 0,
    max: maximo,
    // Un salto invalido cae en 1, que no rechaza nada: la validacion firme la
    // hace el backend, y un default alto aca bloquearia importes con centimos.
    step: Number.isFinite(salto) && salto > 0 ? salto : 1,
  };
}

function readCalculadoraCommissionBreakdown(raw: unknown): CalculadoraCommissionConcept[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const fila = item as Record<string, unknown> | null;
      const concept = typeof fila?.concepto === 'string' ? fila.concepto.trim() : '';
      const amount = typeof fila?.monto === 'number' ? fila.monto : Number(fila?.monto);
      return concept && Number.isFinite(amount) ? { concept, amount } : null;
    })
    .filter((item): item is CalculadoraCommissionConcept => item !== null);
}

/**
 * Extrae el namespace `calculadora` de un LandingConfig resuelto.
 *
 * Devuelve null —y con eso apaga la calculadora— ante cualquier configuracion
 * con la que no se podria completar una solicitud: apagada, ausente, sin
 * producto, sin variante, sin plazos, o con un rango de monto imposible.
 * Mostrar un control que despues no puede entregar una cuota es peor que no
 * mostrarlo.
 *
 * La clave del producto es `efectivo_product_id`. `product_id` no existe en la
 * respuesta, y leerla devolveria indefinido.
 */
export function getCalculadora(config: LandingConfig): CalculadoraConfig | null {
  const raw = (config as Record<string, unknown>)['calculadora'] as
    | Record<string, unknown>
    | undefined;
  if (!raw || raw.enabled !== true) return null;

  const productId = toPositiveInt(raw.efectivo_product_id);
  const variantId = toPositiveInt(raw.variant_id);
  if (productId === null || variantId === null) return null;

  const terms = readCalculadoraTerms(raw.planes);
  if (terms.length === 0) return null;

  const amount = readCalculadoraAmountRange(raw.monto);
  if (amount === null) return null;

  return {
    productId,
    variantId,
    amount,
    terms,
    commissionBreakdown: readCalculadoraCommissionBreakdown(raw.comision_desglose),
    dailyLateFee:
      typeof raw.mora_diaria === 'number' && raw.mora_diaria > 0 ? raw.mora_diaria : 0,
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
    show_agreement_logo: true,
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
    can_change_term: true,
    show_product_image: true,
    has_coupon: true,
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
