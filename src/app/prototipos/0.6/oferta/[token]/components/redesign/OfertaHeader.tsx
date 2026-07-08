/**
 * OfertaHeader — header del flujo de oferta rediseñado (BAL-2184).
 *
 * Usa el LOGO REAL de BaldeCash (imagen oficial), el mismo que ya usaba el
 * flujo de oferta (detalle: `Navbar logoOnly logoUrl={BRAND_LOGO_URL}`).
 * NO el logo recreado en Baloo 2 del mock — decisión de Emilio: conservar el
 * logo anterior.
 *
 * Puramente presentacional: sin lógica, sin fetch, sin props.
 */

// Logo oficial de BaldeCash (S3), idéntico al que usa OfertaDetalleClient.
const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

export function OfertaHeader() {
  return (
    <header className="flex h-14 flex-none items-center justify-center border-b border-[#F1F2F7]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BRAND_LOGO_URL} alt="BaldeCash" className="h-8 object-contain" />
    </header>
  );
}
