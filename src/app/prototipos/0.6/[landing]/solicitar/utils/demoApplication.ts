/**
 * demoApplication — modo demo del flujo de solicitud.
 *
 * Una landing "demo" es un clon de una landing real (mismo UI, mismos pasos,
 * mismo catálogo) cuyo único cambio es el final del wizard: **no crea una
 * solicitud en ws2**. En vez de hacer POST a `/public/application`, el submit
 * arma en el cliente la misma estructura que devuelve
 * `GET /public/application/{code}/status`, la guarda en `sessionStorage` y
 * navega a `/confirmacion?code=…`, que la lee de ahí en lugar de llamar a la API.
 *
 * Sirve para demos comerciales: el vendedor recorre el flujo completo delante
 * del cliente sin ensuciar la base con solicitudes de mentira.
 *
 * La convención es el slug: cualquier landing terminada en `-demo`
 * (ej. `cibertec-express-demo`) entra en este modo. No hace falta tocar ws2
 * más allá de duplicar la landing.
 *
 * OJO: el modo demo solo intercepta la creación de la solicitud. El resto del
 * flujo (sesión del wizard, eventos de tracking, validación de DNI, cupones)
 * sigue hablando con el backend igual que la landing original — que es
 * justamente lo que hace que la demo se vea real.
 */

import type { ApplicationStatusData } from '../confirmacion/types/applicationStatus';

/** Sufijo de slug que activa el modo demo. */
export const DEMO_LANDING_SUFFIX = '-demo';

/**
 * Latencia simulada del "submit" para que la pantalla de progreso
 * ("Procesando solicitud...") se vea igual que en la landing real.
 */
export const DEMO_SUBMIT_DELAY_MS = 1200;

/** true si la landing corre en modo demo (no crea solicitudes reales). */
export function isDemoLanding(landing: string | null | undefined): boolean {
  return typeof landing === 'string' && landing.endsWith(DEMO_LANDING_SUFFIX);
}

/**
 * Código de solicitud falso. Mantiene la forma del real
 * (`SOL-{año}-{8 hex}`, ver ws2 `generate_application_code`) pero con `DEMO`
 * en lugar del año: se ve natural en pantalla y nunca puede colisionar con
 * una solicitud de verdad si alguien lo busca en el admin.
 */
export function generateDemoApplicationCode(): string {
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += Math.floor(Math.random() * 16).toString(16).toUpperCase();
  }
  return `SOL-DEMO-${random}`;
}

function key(landing: string): string {
  return `baldecash-${landing}-demo-application`;
}

export function saveDemoApplication(landing: string, data: ApplicationStatusData): void {
  try {
    sessionStorage.setItem(key(landing), JSON.stringify(data));
  } catch {
    // sessionStorage no disponible (SSR/modo privado) — /confirmacion cae al
    // resumen genérico en vez de romper.
  }
}

/**
 * Lee la solicitud demo guardada por el submit. Si se pasa `code`, solo
 * devuelve la solicitud cuando coincide (evita mostrar el resumen de una demo
 * anterior cuando alguien entra con un `?code=` distinto).
 */
export function readDemoApplication(
  landing: string,
  code?: string | null
): ApplicationStatusData | null {
  try {
    const raw = sessionStorage.getItem(key(landing));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ApplicationStatusData;
    if (typeof parsed?.code !== 'string') return null;
    if (code && parsed.code !== code) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDemoApplication(landing: string): void {
  try {
    sessionStorage.removeItem(key(landing));
  } catch {
    // no-op
  }
}

/** Producto tal como lo guarda el wizard (subconjunto de `SelectedProduct`). */
interface DemoProductInput {
  name: string;
  brand?: string;
  price: number;
  monthlyPayment: number;
  months: number;
  term?: number;
  image?: string;
  initialPercent?: number;
  initialAmount?: number;
  paymentFrequency?: string;
  specs?: { processor?: string; ram?: string; storage?: string };
  variantId?: string;
  colorName?: string;
  colorHex?: string;
}

interface DemoAccessoryInput {
  name: string;
  monthlyQuota: number;
}

interface DemoInsuranceInput {
  name: string;
  monthlyPrice: number;
}

interface DemoCouponInput {
  code: string;
}

export interface BuildDemoApplicationInput {
  code: string;
  products: DemoProductInput[];
  accessories?: DemoAccessoryInput[];
  insurances?: DemoInsuranceInput[];
  coupon?: DemoCouponInput | null;
  /** Descuento mensual ya resuelto (fijo o porcentual) del cupón aplicado. */
  discountAmount?: number;
  /** Cuota mensual total ya con descuento — la misma que muestra el resumen. */
  totalMonthlyPayment: number;
  /** form_data mapeado del wizard, para sacar el nombre del solicitante. */
  formData?: Record<string, string | number | boolean>;
  /** Momento del "envío". Inyectable para tests. */
  submittedAt?: Date;
}

/** Claves del form que, solas o combinadas, forman el nombre del solicitante. */
const FIRST_NAME_KEYS = ['first_name', 'nombres', 'nombre', 'names'];
const LAST_NAME_KEYS = ['last_name', 'apellidos', 'apellido', 'apellido_paterno', 'last_names'];
const FULL_NAME_KEYS = ['full_name', 'nombre_completo', 'nombres_completos'];

function pick(
  formData: Record<string, string | number | boolean>,
  keys: string[]
): string | null {
  for (const k of keys) {
    const v = formData[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

/**
 * Nombre a mostrar en el resumen. En la landing real lo devuelve el backend
 * (`applicant_name`); acá se reconstruye del formulario que la persona acaba
 * de llenar, así la demo muestra su nombre real y no un placeholder.
 */
export function extractApplicantName(
  formData: Record<string, string | number | boolean> | undefined
): string | null {
  if (!formData) return null;
  const full = pick(formData, FULL_NAME_KEYS);
  if (full) return full;
  const first = pick(formData, FIRST_NAME_KEYS);
  const last = pick(formData, LAST_NAME_KEYS);
  const joined = [first, last].filter(Boolean).join(' ').trim();
  return joined || null;
}

/**
 * Arma la respuesta de estado que /confirmacion espera, a partir de lo que la
 * persona seleccionó y llenó en el wizard. Todo sale del estado local: no hay
 * ninguna llamada al backend.
 */
export function buildDemoApplication(
  input: BuildDemoApplicationInput
): ApplicationStatusData {
  const {
    code,
    products,
    accessories = [],
    insurances = [],
    coupon,
    discountAmount = 0,
    totalMonthlyPayment,
    formData,
    submittedAt = new Date(),
  } = input;

  const primary = products[0];
  const submittedAtIso = submittedAt.toISOString();

  const insuranceList = insurances.map((ins) => ({
    name: ins.name,
    monthly_price: ins.monthlyPrice,
  }));

  return {
    code,
    status: 'pending',
    submitted_at: submittedAtIso,
    applicant_name: extractApplicantName(formData),

    products: products.map((p) => ({
      name: p.name,
      brand: p.brand ?? null,
      image: p.image ?? null,
      quantity: 1,
      unit_price: p.price,
      final_price: p.price,
      monthly_quota: p.monthlyPayment,
      specs: p.specs ?? null,
      variant:
        p.variantId && p.colorName
          ? {
              id: parseInt(p.variantId, 10),
              color_name: p.colorName,
              color_hex: p.colorHex ?? '#000000',
            }
          : null,
      initial_payment_percent: p.initialPercent ?? 0,
      initial_payment: p.initialAmount ?? 0,
    })),

    // `term` va en la frecuencia natural del producto; /confirmacion deriva los
    // meses con `displayMonths(term, payment_frequency)`.
    term: primary?.term ?? primary?.months,
    payment_frequency: primary?.paymentFrequency,
    initial_payment_percent: primary?.initialPercent ?? 0,
    initial_payment: primary?.initialAmount ?? 0,

    accessories: accessories.map((acc) => ({
      name: acc.name,
      monthly_quota: acc.monthlyQuota,
    })),

    insurance: insuranceList[0] ?? null,
    insurances: insuranceList,

    coupon: coupon ? { code: coupon.code, discount_amount: discountAmount } : null,

    total_monthly_payment: totalMonthlyPayment,

    status_history: [
      {
        previous_status: null,
        new_status: 'pending',
        reason_code: null,
        reason_text: null,
        changed_at: submittedAtIso,
      },
    ],
  };
}
