import type { Metadata } from 'next';
import MultiasistenciaPage from './MultiasistenciaPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baldecash.com';

export const metadata: Metadata = {
  title: 'Multiasistencia | BaldeCash',
  description:
    'Asistencia médica, legal y tecnológica para el titular de tu crédito y hasta 3 personas más, 24/7/365. Beneficio opcional gestionado por Impulsa365 S.A.C. (A365). Conoce coberturas, límites y cómo activarla.',
  keywords: [
    'multiasistencia BaldeCash',
    'asistencia médica estudiantes',
    'asistencia legal telefónica',
    'soporte técnico laptop',
    'Impulsa365 A365',
    'telemedicina 24 horas Perú',
  ],
  alternates: {
    canonical: `${SITE_URL}/multiasistencia`,
  },
  openGraph: {
    title: 'Multiasistencia BaldeCash | Médica, legal y tecnológica 24/7',
    description:
      'Cubre al titular del crédito y hasta 3 personas más con asistencia médica, legal y tecnológica las 24 horas, los 365 días del año.',
    url: `${SITE_URL}/multiasistencia`,
    type: 'website',
  },
};

export default function Page() {
  return <MultiasistenciaPage />;
}
