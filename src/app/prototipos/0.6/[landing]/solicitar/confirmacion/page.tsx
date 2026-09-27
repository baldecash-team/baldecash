/**
 * Server Component Wrapper
 */

import Client from './confirmacionClient';

export default function Page() {
  return <Client />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
