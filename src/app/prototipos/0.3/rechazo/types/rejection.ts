// Rejection Types - BaldeCash v0.3
// Generated from PROMPT_16_RECHAZO.md

export interface RejectionConfig {
  // G.1: Visual colors
  visualVersion: 1 | 2 | 3;

  // G.2: Illustration type
  illustrationType: 'person' | 'path' | 'none';

  // G.3: Branding level
  brandingLevel: 'minimal' | 'full' | 'logo_only';

  // G.5: Personalization
  messageVersion: 1 | 2 | 3;

  // G.8-G.9: Explanation detail
  explanationVersion: 1 | 2 | 3;

  // G.10: Alternatives display
  alternativesVersion: 1 | 2 | 3;

  // G.11: Product alternatives display
  productAlternativesVersion: 1 | 2 | 3;

  // G.12: Calculator visibility
  calculatorVersion: 1 | 2 | 3;

  // G.14: Email capture
  retentionVersion: 1 | 2 | 3;

  // G.16: Retry timeline
  retryTimelineVersion: 1 | 2 | 3;

  // G.17 & G.19: Support CTA
  supportVersion: 1 | 2 | 3;
}

export const defaultRejectionConfig: RejectionConfig = {
  visualVersion: 1,
  illustrationType: 'person',
  brandingLevel: 'logo_only',
  messageVersion: 1,
  explanationVersion: 3,
  alternativesVersion: 1,
  productAlternativesVersion: 1,
  calculatorVersion: 1,
  retentionVersion: 1,
  retryTimelineVersion: 1,
  supportVersion: 1,
};

export interface RejectionData {
  applicationId: string;
  userName?: string;
  requestedProduct: {
    name: string;
    price: number;
    monthlyQuota: number;
  };
  rejectionCategory?: 'credit' | 'income' | 'documentation' | 'other';
  canRetryIn?: number; // dias
  alternatives: RejectionAlternative[];
}

export interface RejectionAlternative {
  id: string;
  type: 'lower_product' | 'down_payment' | 'cosigner' | 'wait';
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

export interface AlternativeProduct {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
  monthlyQuota: number;
}

export const defaultAlternatives: RejectionAlternative[] = [
  {
    id: 'lower',
    type: 'lower_product',
    title: 'Opciones mas accesibles',
    description: 'Tenemos laptops con cuotas desde S/49/mes',
    icon: 'Laptop',
    action: { label: 'Ver opciones', href: '/catalogo?price=low' },
  },
  {
    id: 'down',
    type: 'down_payment',
    title: 'Pagar una inicial',
    description: 'Con una cuota inicial, reduces el monto a financiar',
    icon: 'Wallet',
  },
  {
    id: 'cosigner',
    type: 'cosigner',
    title: 'Aplicar con un codeudor',
    description: 'Un familiar puede respaldar tu solicitud',
    icon: 'Users',
    action: { label: 'Mas informacion', href: '/codeudor' },
  },
  {
    id: 'wait',
    type: 'wait',
    title: 'Intentar mas adelante',
    description: 'Puedes volver a aplicar en 90 dias',
    icon: 'Calendar',
  },
];

export const improvementTips = [
  {
    id: 'credit',
    title: 'Mejora tu historial crediticio',
    description: 'Paga tus deudas a tiempo y reduce saldos pendientes',
    icon: 'TrendingUp',
  },
  {
    id: 'income',
    title: 'Aumenta tus ingresos demostrables',
    description: 'Consigue un trabajo formal o muestra ingresos adicionales',
    icon: 'DollarSign',
  },
  {
    id: 'documentation',
    title: 'Prepara mejor documentacion',
    description: 'Asegurate de tener todos los documentos actualizados',
    icon: 'FileText',
  },
];
