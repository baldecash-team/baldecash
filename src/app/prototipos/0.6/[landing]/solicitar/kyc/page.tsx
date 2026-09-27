import type { Metadata } from 'next';
import KycClient from './kycClient';

// BAL-4188 (Task 10): ver la nota en `../page.tsx`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KycPage() {
  return <KycClient />;
}
