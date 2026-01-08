/**
 * Approval Types - BaldeCash v0.5
 * Tipos para la pantalla de aprobación
 */

export interface ApprovalData {
  applicationId: string;
  userName: string;
  product: {
    name: string;
    thumbnail: string;
    monthlyQuota: number;
    term: number;
    totalAmount: number;
  };
  accessories?: Array<{
    name: string;
    monthlyQuota: number;
  }>;
  insurance?: {
    name: string;
    monthlyPrice: number;
  };
  estimatedDelivery: {
    minDays: number;
    maxDays: number;
  };
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
  totalMonthlyQuota: number;
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'pending';
  estimatedTime?: string;
}

export const defaultNextSteps: NextStep[] = [
  {
    id: '1',
    title: 'Solicitud enviada',
    description: 'Tu información está siendo procesada',
    icon: 'Send',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Verificación',
    description: 'Validamos tus datos',
    icon: 'Search',
    status: 'current',
    estimatedTime: '24-48 horas',
  },
  {
    id: '3',
    title: 'Firma de contrato',
    description: 'Te enviaremos el contrato digital',
    icon: 'FileSignature',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Entrega',
    description: 'Recibe tu laptop en casa',
    icon: 'Package',
    status: 'pending',
  },
];
