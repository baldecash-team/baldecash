const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baldecash.com';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'BaldeCash',
  alternateName: 'Balde K S.A.C.',
  url: SITE_URL,
  logo: 'https://baldecash.s3.amazonaws.com/company/logo.png',
  description: 'Financiamiento de laptops y tablets para estudiantes universitarios en Perú. Cuotas desde S/99/mes, sin inicial, aprobación en 24h.',
  areaServed: {
    '@type': 'Country',
    name: 'Perú',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PE',
  },
  sameAs: [
    'https://www.facebook.com/baldecash',
    'https://www.instagram.com/baldecash',
    'https://www.tiktok.com/@baldecash',
  ],
  serviceType: 'Financiamiento estudiantil de tecnología',
  audience: {
    '@type': 'Audience',
    audienceType: 'Estudiantes universitarios',
  },
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
