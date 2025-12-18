// Mock Rejection Data - BaldeCash v0.3
// Generated from PROMPT_16_RECHAZO.md

import { RejectionData, AlternativeProduct, defaultAlternatives } from '../types/rejection';

export const mockRejectionData: RejectionData = {
  applicationId: 'BC-2024-78544',
  userName: 'Maria',
  requestedProduct: {
    name: 'HP Victus 15 Gaming Laptop',
    price: 3499,
    monthlyQuota: 145,
  },
  rejectionCategory: 'credit',
  canRetryIn: 90,
  alternatives: defaultAlternatives,
};

export const alternativeProducts: AlternativeProduct[] = [
  {
    id: 'acer-aspire-1',
    name: 'Acer Aspire 3',
    thumbnail: '/products/laptops/acer-aspire.png',
    price: 1299,
    monthlyQuota: 54,
  },
  {
    id: 'lenovo-ideapad-1',
    name: 'Lenovo IdeaPad 1',
    thumbnail: '/products/laptops/lenovo-ideapad.png',
    price: 1199,
    monthlyQuota: 49,
  },
  {
    id: 'hp-14-1',
    name: 'HP 14 Essential',
    thumbnail: '/products/laptops/hp-14.png',
    price: 1499,
    monthlyQuota: 62,
  },
];

// Calculator helper
export const calculateQuotaWithDownPayment = (
  productPrice: number,
  downPayment: number,
  term: number = 24
): number => {
  const amountToFinance = productPrice - downPayment;
  const interestRate = 0.025; // 2.5% monthly
  const quota = (amountToFinance * interestRate * Math.pow(1 + interestRate, term)) /
    (Math.pow(1 + interestRate, term) - 1);
  return Math.round(quota);
};
