import type { Metadata } from "next";
import { Asap, Baloo_2 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { JsonLd } from "./JsonLd";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const asap = Asap({
  variable: "--font-asap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baldecash.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Financiamiento de laptops y tablets para estudiantes en Perú | BaldeCash',
    template: '%s | BaldeCash',
  },
  description: 'Financia tu laptop o tablet para la universidad con cuotas desde S/99/mes. Sin inicial, aprobación en 24h y entrega a domicilio. BaldeCash, financiamiento estudiantil en Perú.',
  keywords: [
    'financiamiento laptops',
    'laptops para estudiantes',
    'crédito laptops Perú',
    'financiamiento estudiantil',
    'laptops a cuotas',
    'tablets para universitarios',
    'BaldeCash',
    'laptop universitaria Perú',
    'financiamiento tecnología estudiantes',
  ],
  authors: [{ name: 'BaldeCash' }],
  creator: 'BaldeCash',
  publisher: 'BaldeCash',
  icons: {
    icon: [
      { url: 'https://baldecash.s3.amazonaws.com/company/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://baldecash.s3.amazonaws.com/company/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: 'https://baldecash.s3.amazonaws.com/company/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: SITE_URL,
    siteName: 'BaldeCash',
    title: 'Financiamiento de laptops y tablets para estudiantes en Perú | BaldeCash',
    description: 'Financia tu laptop o tablet para la universidad con cuotas desde S/99/mes. Sin inicial, aprobación en 24h y entrega a domicilio.',
    images: [
      {
        url: 'https://baldecash.s3.amazonaws.com/company/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BaldeCash - Financiamiento de laptops para estudiantes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financiamiento de laptops y tablets para estudiantes | BaldeCash',
    description: 'Financia tu laptop o tablet para la universidad con cuotas desde S/99/mes. Sin inicial, aprobación en 24h.',
    images: ['https://baldecash.s3.amazonaws.com/company/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${asap.variable} ${baloo2.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-asap), sans-serif" }}
      >
        <JsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
