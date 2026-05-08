import type { Metadata } from 'next';
import SegurosPage from './SegurosPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baldecash.com';

export const metadata: Metadata = {
  title: 'Seguros y Garantía Extendida | BaldeCash',
  description:
    'Protege tu equipo financiado con BaldeCash. Seguro contra robo y garantía extendida gestionados por Insurama Broker Perú con pólizas de La Positiva Seguros. Sin deducible, desde S/15/mes.',
  keywords: [
    'seguro contra robo laptop',
    'garantía extendida laptop',
    'seguro laptop universitaria',
    'Insurama Perú',
    'La Positiva seguros',
    'BaldeCash seguros',
  ],
  alternates: {
    canonical: `${SITE_URL}/seguros`,
  },
  openGraph: {
    title: 'Seguros y Garantía Extendida para tu equipo | BaldeCash',
    description:
      'Protege tu equipo financiado contra robo y fallas de fábrica. Cobertura sin deducible y reposición o reparación según corresponda.',
    url: `${SITE_URL}/seguros`,
    type: 'website',
  },
};

export default function Page() {
  return <SegurosPage />;
}
