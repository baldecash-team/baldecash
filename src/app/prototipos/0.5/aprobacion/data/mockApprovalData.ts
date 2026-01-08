/**
 * Mock Approval Data - BaldeCash v0.5
 * Datos de prueba para la pantalla de aprobación
 */

import { ApprovalData } from '../types/approval';

export const mockApprovalData: ApprovalData = {
  applicationId: 'BC-2024-78543',
  userName: 'María',
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
  estimatedDelivery: {
    minDays: 3,
    maxDays: 5,
  },
  notificationChannels: ['whatsapp', 'email'],
  totalMonthlyQuota: 494,
};
