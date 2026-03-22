import type { Metadata } from "next";
import { Asap, Baloo_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export const metadata: Metadata = {
  title: "BaldeCash - Prototipos UI/UX",
  description: "Prototipos de diseño para financiamiento estudiantil",
  icons: {
    icon: "https://baldecash.s3.amazonaws.com/company/favicon-32x32.png",
    apple: "https://baldecash.s3.amazonaws.com/company/apple-touch-icon.png",
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
      </head>
      <body
        className={`${asap.variable} ${baloo2.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-asap), sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
