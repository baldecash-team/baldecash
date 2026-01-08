/**
 * Rejection Types - BaldeCash v0.5
 * Tipos para la pantalla de rechazo
 * Versión fija sin configuraciones múltiples
 */

export type RejectionCategory = 'credit' | 'income' | 'documentation' | 'other';

export interface RequestedProduct {
  name: string;
  price: number;
  monthlyQuota: number;
  image?: string;
}

export interface RejectionData {
  applicationId: string;
  userName?: string;
  requestedProduct: RequestedProduct;
  rejectionCategory?: RejectionCategory;
  canRetryIn?: number; // días
  alternatives: RejectionAlternative[];
}

export type AlternativeType = 'lower_product' | 'down_payment' | 'cosigner' | 'wait';

export interface RejectionAlternative {
  id: string;
  type: AlternativeType;
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
  calculator?: DownPaymentCalculator;
}

export interface DownPaymentCalculator {
  productPrice: number;
  minDownPayment: number;
  maxDownPayment: number;
  step: number;
}

export interface AlternativeProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  monthlyQuota: number;
  specs?: string[];
}

// Tips de mejora por categoría
export const improvementTips: Record<RejectionCategory, string[]> = {
  credit: [
    'Paga tus deudas pendientes a tiempo',
    'Evita tener muchas consultas de crédito seguidas',
    'Mantén un buen historial de pagos por al menos 3 meses',
  ],
  income: [
    'Asegúrate de tener comprobantes de ingresos actualizados',
    'Si eres independiente, mantén registros de tus ingresos',
    'Considera opciones con un codeudor que tenga ingresos estables',
  ],
  documentation: [
    'Verifica que todos tus documentos estén vigentes',
    'Asegúrate de que la información sea legible y clara',
    'Revisa que los datos coincidan con tu identificación',
  ],
  other: [
    'Revisa que toda tu información esté actualizada',
    'Considera aplicar por un monto menor',
    'Consulta con un asesor para más opciones',
  ],
};
