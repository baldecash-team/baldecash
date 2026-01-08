/**
 * Mock Received Data - BaldeCash v0.5
 * Datos de prueba para la pantalla de solicitud recibida
 */

import { ReceivedData } from '../types/received';

export const mockReceivedData: ReceivedData = {
  applicationId: 'BC-2024-78543',
  userName: 'María',
  submittedAt: new Date(),
  estimatedResponseHours: 24,
  product: {
    name: 'MacBook Air 13" M3',
    thumbnail: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1708367688034',
    monthlyQuota: 458,
    term: 12,
    totalAmount: 5499,
  },
  accessories: [
    { name: 'Mouse inalámbrico Logitech M170', monthlyQuota: 3 },
    { name: 'Funda protectora 13"', monthlyQuota: 4 },
  ],
  insurance: {
    name: 'Protección Total',
    monthlyPrice: 29,
  },
  totalMonthlyQuota: 494,
  notificationChannels: ['whatsapp', 'email'],
};
