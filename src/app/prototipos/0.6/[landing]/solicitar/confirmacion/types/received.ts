/**
 * Received Types - BaldeCash v0.6.1
 * Tipos para la pantalla de solicitud recibida
 * Updated: Support for multiple products, variant info, initial payment
 */

export interface ProductSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
}

/** v0.6.1: Variant/color info for data coherence */
export interface VariantInfo {
  id: number;
  colorName: string;
  colorHex: string;
}

export interface ProductItem {
  name: string;
  brand?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  monthlyQuota: number;
  specs?: ProductSpecs;
  /** v0.6.1: Selected color/variant */
  variant?: VariantInfo;
  /** v0.6.1: Per-product initial payment */
  initialPaymentPercent?: number;
  initialPayment?: number;
}

export interface AccessoryItem {
  name: string;
  monthlyQuota: number;
}

export interface InsuranceData {
  name: string;
  monthlyPrice: number;
}

export interface CouponData {
  code: string;
  discountAmount: number;
}

export interface ReceivedData {
  applicationId: string;
  userName: string;
  submittedAt: Date;
  estimatedResponseHours: number;

  // Productos (múltiples)
  products: ProductItem[];
  termMonths: number;

  /** v0.6.1: Initial payment info for data coherence */
  initialPaymentPercent?: number;
  initialPayment?: number;

  // Accesorios
  accessories?: AccessoryItem[];

  // Seguro(s)
  insurance?: InsuranceData;
  insurances?: InsuranceData[];

  // Cupón
  coupon?: CouponData;

  // Total
  totalMonthlyQuota: number;

  // Canales de notificación
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
}

export interface StatusStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

export const defaultStatusSteps: StatusStep[] = [
  {
    id: '1',
    title: 'Solicitud enviada',
    description: 'Recibimos tu información',
    icon: 'Send',
    status: 'completed',
  },
  {
    id: '2',
    title: 'En revisión',
    description: 'Estamos evaluando tu solicitud',
    icon: 'Search',
    status: 'current',
  },
  {
    id: '3',
    title: 'Respuesta',
    description: 'Te notificaremos el resultado',
    icon: 'Bell',
    status: 'pending',
  },
];
