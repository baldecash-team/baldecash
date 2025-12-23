/**
 * Mock Data para Pantalla de Aprobación - BaldeCash v0.4
 * PROMPT_15: Datos de prueba
 */

import type { ApprovalData, NextStep } from '../types/approval';

export const mockApprovalData: ApprovalData = {
  applicationId: 'BC-2024-78452',
  userName: 'María',
  product: {
    name: 'Lenovo IdeaPad 3 15.6" AMD Ryzen 5',
    brand: 'Lenovo',
    price: 2999,
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop',
  },
  creditDetails: {
    monthlyPayment: 149,
    installments: 24,
    interestRate: 18.5,
    totalAmount: 3576,
  },
  estimatedDelivery: {
    minDays: 1,
    maxDays: 2,
  },
  notificationChannels: ['whatsapp', 'email'],
  firstPaymentDate: '2025-01-22',
};

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
    timeEstimate: '24-48 horas',
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
    description: 'Recibe tu equipo en casa',
    icon: 'Package',
    status: 'pending',
  },
];

export const socialShareLinks = {
  whatsapp: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  facebook: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  linkedin: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
};

export const referralMessage = '¡Acabo de conseguir mi laptop con BaldeCash! Financia tu equipo sin tarjeta de crédito. Usa mi código y obtén un descuento.';

export const shareMessage = '¡Mi solicitud de financiamiento fue aprobada con BaldeCash! Pronto tendré mi nueva laptop para estudiar.';
