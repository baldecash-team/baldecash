/**
 * Logo BaldeCash en SVG (mejora #9), servido desde S3 como imagen vectorial nítida.
 * `white` usa la variante blanca (para fondos azules); por defecto, el original (azul + celeste).
 */
interface BaldeCashLogoProps {
  className?: string;
  alt?: string;
  /** Usa la versión blanca (sobre fondos azules). */
  white?: boolean;
}

export const BALDECASH_LOGO_SVG_URL = 'https://baldecash.s3.amazonaws.com/company/logo.svg';
export const BALDECASH_LOGO_WHITE_SVG_URL = 'https://baldecash.s3.amazonaws.com/company/logo-white.svg';

export function BaldeCashLogo({ className = 'h-7 w-auto', alt = 'BaldeCash', white }: BaldeCashLogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={white ? BALDECASH_LOGO_WHITE_SVG_URL : BALDECASH_LOGO_SVG_URL} alt={alt} className={className} />;
}
