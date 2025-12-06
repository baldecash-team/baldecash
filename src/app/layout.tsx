import type { Metadata } from "next";
import { Asap } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const asap = Asap({
  variable: "--font-asap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BaldeCash - Prototipos UI/UX",
  description: "Prototipos de diseño para financiamiento estudiantil",
  icons: {
    icon: "/baldecash/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${asap.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-asap), sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
