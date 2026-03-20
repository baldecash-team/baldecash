/**
 * Empty State Preview v0.6 - Server Component Wrapper
 */

import EmptyPreviewClient from './EmptyPreviewClient';

export default function EmptyStatePreviewPage() {
  return <EmptyPreviewClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
