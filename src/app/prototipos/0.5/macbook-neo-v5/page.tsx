import type { Metadata } from 'next';
import MacBookNeoV5 from './components/MacBookNeoV5';

export const metadata: Metadata = {
  title: 'MacBook Neo — BaldeCash | Financiamiento para estudiantes',
  description:
    'Tu MacBook Neo desde S/119/mes. Sin inicial, sin tarjeta de crédito. Financiamiento para estudiantes universitarios en Perú.',
};

export default function MacBookNeoV5Page() {
  return <MacBookNeoV5 />;
}
