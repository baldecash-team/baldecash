import type { Metadata } from 'next';
import ComplementosClient from './complementosClient';

// BAL-4188 (Task 10): ver la nota en `../page.tsx`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ComplementosPage() {
  return <ComplementosClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
