/**
 * Types para Pantalla de Aprobación - BaldeCash v0.4
 * PROMPT_15: Pantalla de Aprobación / Éxito
 */

export type Version = 1 | 2 | 3 | 4 | 5 | 6;

export interface ApprovalConfig {
  // F.1 - Elementos de celebración
  celebrationVersion: Version;

  // F.2 - Intensidad del confetti
  confettiVersion: Version;

  // F.3 - Sonido de celebración
  soundVersion: Version;

  // F.7 - Resumen del producto
  summaryVersion: Version;

  // F.9 - Tiempo estimado
  nextStepsVersion: Version;

  // F.12 - Compartir en redes
  shareVersion: Version;

  // F.13 - Referidos
  referralVersion: Version;
}

export const defaultApprovalConfig: ApprovalConfig = {
  celebrationVersion: 1,
  confettiVersion: 1,
  soundVersion: 2,
  summaryVersion: 1,
  nextStepsVersion: 1,
  shareVersion: 1,
  referralVersion: 2,
};

export interface ApprovalData {
  applicationId: string;
  userName: string;
  product: {
    name: string;
    brand: string;
    price: number;
    thumbnail?: string;
    imageUrl?: string;
  };
  creditDetails: {
    monthlyPayment: number;
    installments: number;
    interestRate: number;
    totalAmount: number;
  };
  estimatedDelivery: {
    minDays: number;
    maxDays: number;
  };
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
  firstPaymentDate?: string;
}

export interface NextStep {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  status?: 'completed' | 'current' | 'pending';
  timeEstimate?: string;
}

// Descripciones de versiones para el SettingsModal
export const celebrationVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Confetti + Ilustración', description: 'Confetti animado con persona feliz' },
  2: { name: 'Lifestyle', description: 'Ilustración grande de estudiante con laptop' },
  3: { name: 'Checkmark animado', description: 'Checkmark gigante con iconos flat' },
  4: { name: 'Fintech', description: 'Partículas flotantes + gradiente animado' },
  5: { name: 'Split', description: 'Confetti izquierda + mensaje derecha' },
  6: { name: 'Explosión', description: 'Confetti máximo + texto + icono' },
};

export const confettiVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Exuberante', description: 'Lluvia completa 3-5 segundos' },
  2: { name: 'Elegante', description: 'Burst corto 1-2 segundos' },
  3: { name: 'Sin confetti', description: 'Solo ilustración flat animada' },
  4: { name: 'Partículas flotantes', description: 'Estilo fintech suave' },
  5: { name: 'Lateral', description: 'Confetti en un solo lado' },
  6: { name: 'Máximo', description: 'Toda la pantalla con colores de marca' },
};

export const soundVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Activo por defecto', description: 'Sonido con opción de silenciar' },
  2: { name: 'Silencioso', description: 'Sin sonido por defecto' },
  3: { name: 'Bajo demanda', description: 'Sonido solo si el usuario lo activa' },
  4: { name: 'Ding sutil', description: 'Sonido corto estilo fintech' },
  5: { name: 'Adaptativo', description: 'Desktop con sonido, mobile silencioso' },
  6: { name: 'Fanfarria', description: 'Música de celebración completa' },
};

export const summaryVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Card completa', description: 'Producto + imagen + cuota + plazo' },
  2: { name: 'Texto elegante', description: 'Sin imagen, datos esenciales' },
  3: { name: 'Ilustración flat', description: 'Card con ilustración estilizada' },
  4: { name: 'Mini card animada', description: 'Se expande al hover (fintech)' },
  5: { name: 'Split layout', description: 'Imagen izquierda + specs derecha' },
  6: { name: 'Hero card', description: 'Producto gigante prominente' },
};

export const nextStepsVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Rango claro', description: 'Confirmación en 24-48 horas' },
  2: { name: 'Casual', description: 'Te contactaremos hoy o mañana' },
  3: { name: 'Con ilustración', description: 'Reloj flat con tiempo estimado' },
  4: { name: 'Countdown', description: 'Contador animado estilo fintech' },
  5: { name: 'Split info', description: 'Tiempo + qué hacer mientras tanto' },
  6: { name: 'Prominente', description: 'Tiempo gigante: 48h máximo' },
};

export const shareVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Prominente', description: 'Botones de redes grandes y visibles' },
  2: { name: 'Sutil', description: 'Link "Compartir mi logro" con modal' },
  3: { name: 'Iconos flat', description: 'Botones con iconos de cada red' },
  4: { name: 'Animados', description: 'Se expanden al hover (fintech)' },
  5: { name: 'Split', description: 'Compartir izquierda + referir derecha' },
  6: { name: 'Grande', description: 'Sección de compartir prominente' },
};

export const referralVersionLabels: Record<Version, { name: string; description: string }> = {
  1: { name: 'Prominente', description: 'Invita amigos y gana S/50 con CTA' },
  2: { name: 'Sutil', description: 'Link pequeño no intrusivo' },
  3: { name: 'Ilustración', description: 'Card con grupo de amigos flat' },
  4: { name: 'Banner animado', description: 'Aparece después de celebración' },
  5: { name: 'Panel lateral', description: 'Referidos en sidebar' },
  6: { name: 'CTA gigante', description: 'Acción principal destacada' },
};
