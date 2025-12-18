// Mock Approval Data - BaldeCash v0.3
// Generated from PROMPT_15_APROBACION.md

import { ApprovalData } from '../types/approval';

export const mockApprovalData: ApprovalData = {
  applicationId: 'BC-2024-78543',
  userName: 'Maria',
  product: {
    name: 'HP Victus 15 Gaming Laptop',
    thumbnail: '/products/laptops/hp-victus.png',
    monthlyQuota: 145,
    term: 24,
    totalAmount: 3499,
  },
  accessories: [
    { name: 'Mouse inalambrico Logitech', monthlyQuota: 4 },
    { name: 'Funda protectora 15.6"', monthlyQuota: 3 },
  ],
  insurance: {
    name: 'Proteccion Total',
    monthlyPrice: 29,
  },
  estimatedDelivery: {
    minDays: 3,
    maxDays: 5,
  },
  notificationChannels: ['whatsapp', 'email'],
  totalMonthlyQuota: 181,
};
