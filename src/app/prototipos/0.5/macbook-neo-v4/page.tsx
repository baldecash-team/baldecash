import type { Metadata } from 'next';
import MacBookNeoV4 from './components/MacBookNeoV4';

export const metadata: Metadata = {
  title: 'MacBook Neo — Apple',
  description: 'The magic of Mac at a surprising price. Starting from $999.',
};

export default function MacBookNeoV4Page() {
  return <MacBookNeoV4 />;
}
