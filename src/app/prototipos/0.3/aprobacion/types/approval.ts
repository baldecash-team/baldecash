// Approval Types - BaldeCash v0.3
// Generated from PROMPT_15_APROBACION.md

export interface ApprovalConfig {
  // F.1: Celebration elements
  celebrationVersion: 1 | 2 | 3;

  // F.2: Confetti intensity
  confettiIntensity: 'exuberant' | 'subtle' | 'none';

  // F.3: Sound settings
  soundMode: 'default_on' | 'off' | 'user_activated';

  // F.7: Summary display
  summaryVersion: 1 | 2 | 3;

  // F.9: Time estimate display
  timeEstimateVersion: 1 | 2 | 3;

  // F.12: Share buttons
  shareVersion: 1 | 2 | 3;

  // F.13: Referral CTA
  referralVersion: 1 | 2 | 3;
}

export const defaultApprovalConfig: ApprovalConfig = {
  celebrationVersion: 1,
  confettiIntensity: 'exuberant',
  soundMode: 'off',
  summaryVersion: 1,
  timeEstimateVersion: 1,
  shareVersion: 1,
  referralVersion: 1,
};

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
    description: 'Tu informacion esta siendo procesada',
    icon: 'Send',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Verificacion',
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
