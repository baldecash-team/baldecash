/**
 * ApplicationStatusData — forma de la respuesta de
 * `GET /public/application/{code}/status` tal como la consume /confirmacion.
 *
 * Vive en su propio módulo (y no dentro de `confirmacionClient`) porque las
 * landings demo construyen este mismo objeto en el cliente, sin backend.
 * Ver `../../utils/demoApplication`.
 */
export interface ApplicationStatusData {
  code: string;
  /**
   * El numero con el que el cliente identifica su solicitud.
   *
   * Lo arma el backend: el id del sistema de creditos cuando este contesto, y
   * el `code` (`APP-2026-00029`) cuando no. Es el mismo numero por el que va a
   * preguntar el asesor, asi que tiene que ser el que se le muestra aca.
   *
   * Opcional: una confirmacion abierta antes de este cambio no lo trae, y ahi
   * se cae al `code`, que es lo que se mostraba hasta ahora.
   */
  reference?: string | null;
  status: string;
  submitted_at: string | null;
  evaluated_at?: string | null;
  approved_at?: string | null;
  applicant_name?: string | null;

  // Products array (multiple products support)
  products?: Array<{
    name: string;
    brand?: string | null;
    image: string | null;
    quantity: number;
    unit_price: number;
    final_price: number;
    monthly_quota: number;
    specs?: {
      processor?: string;
      ram?: string;
      storage?: string;
    } | null;
    // v0.6.1: Variant/color info
    variant?: {
      id: number;
      color_name: string;
      color_hex: string;
    } | null;
    // v0.6.1: Per-product initial payment
    initial_payment_percent?: number;
    initial_payment?: number;
  }>;

  /** Número real de cuotas en la frecuencia natural (preferido sobre `term_months`). */
  term?: number;
  /** @deprecated Usar `term` + `payment_frequency`. */
  term_months?: number;
  payment_frequency?: string;

  // v0.6.1: Initial payment info for data coherence
  initial_payment_percent?: number;
  initial_payment?: number;

  accessories?: Array<{
    name: string;
    monthly_quota: number;
  }> | null;

  insurance?: {
    name: string;
    monthly_price: number;
  } | null;

  insurances?: Array<{
    name: string;
    monthly_price: number;
  }> | null;

  coupon?: {
    code: string;
    discount_amount: number;
  } | null;

  total_monthly_payment?: number;

  status_history: Array<{
    previous_status: string | null;
    new_status: string;
    reason_code: string | null;
    reason_text: string | null;
    changed_at: string | null;
  }>;
}
