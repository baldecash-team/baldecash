/**
 * Received Types - BaldeCash v0.6
 * Tipos para la pantalla de solicitud recibida
 * Adapted from v0.5
 */

export interface ReceivedData {
  applicationId: string;
  userName: string;
  submittedAt: Date;
  estimatedResponseHours: number;
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
  coupon?: {
    code: string;
    discountAmount: number;
  };
  totalMonthlyQuota: number;
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
