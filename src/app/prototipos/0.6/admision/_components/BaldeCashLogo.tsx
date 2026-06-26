/**
 * Logo BaldeCash en SVG (mejora #9): servido desde S3 como imagen vectorial nítida.
 * Escala con `className` (controla la altura). Se usa en OTP y validación de video.
 */
interface BaldeCashLogoProps {
  className?: string;
  alt?: string;
}

// Versión monocromática en el azul de la web (#4654CD): nítida y sin tonos claros
// que se laven contra fondos claros.
export const BALDECASH_LOGO_SVG_URL = 'https://baldecash.s3.amazonaws.com/company/logo-blue.svg';

export function BaldeCashLogo({ className = 'h-7 w-auto', alt = 'BaldeCash' }: BaldeCashLogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={BALDECASH_LOGO_SVG_URL} alt={alt} className={className} />;
}
