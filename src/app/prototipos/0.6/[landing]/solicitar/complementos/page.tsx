import ComplementosClient from './complementosClient';

export default function ComplementosPage() {
  return <ComplementosClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
