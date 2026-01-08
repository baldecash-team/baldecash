/**
 * Mock Rejection Data - BaldeCash v0.5
 * Datos de prueba para la pantalla de rechazo
 */

import { RejectionData, AlternativeProduct } from '../types/rejection';

export const mockRejectionData: RejectionData = {
  applicationId: 'BC-2024-78543',
  userName: 'María',
  requestedProduct: {
    name: 'MacBook Air 13" M3',
    price: 5499,
    monthlyQuota: 458,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1708367688034',
  },
  rejectionCategory: 'credit',
  canRetryIn: 90,
  alternatives: [
    {
      id: 'lower',
      type: 'lower_product',
      title: 'Opciones más accesibles',
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
      calculator: {
        productPrice: 5499,
        minDownPayment: 500,
        maxDownPayment: 3000,
        step: 100,
      },
    },
    {
      id: 'cosigner',
      type: 'cosigner',
      title: 'Aplicar con un codeudor',
      description: 'Un familiar puede respaldar tu solicitud',
      icon: 'Users',
      action: { label: 'Más información', href: '/codeudor' },
    },
    {
      id: 'wait',
      type: 'wait',
      title: 'Intentar más adelante',
      description: 'Puedes volver a aplicar en 90 días',
      icon: 'Calendar',
    },
  ],
};

export const mockAlternativeProducts: AlternativeProduct[] = [
  {
    id: 'alt-1',
    name: 'MacBook Air 13" M2',
    brand: 'Apple',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1653084303665',
    price: 4499,
    monthlyQuota: 375,
    specs: ['Apple M2', '8GB RAM', '256GB SSD'],
  },
  {
    id: 'alt-2',
    name: 'MacBook Air 13" M1',
    brand: 'Apple',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1633027804000',
    price: 3499,
    monthlyQuota: 292,
    specs: ['Apple M1', '8GB RAM', '256GB SSD'],
  },
  {
    id: 'alt-3',
    name: 'iPad Pro 11"',
    brand: 'Apple',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-11-select-wifi-spacegray-202210?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1664411207213',
    price: 2999,
    monthlyQuota: 250,
    specs: ['Apple M2', '8GB RAM', '128GB'],
  },
];
