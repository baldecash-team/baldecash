'use client';

/**
 * Chrome compartido con el resto del sitio: navbar + footer + fondo neutro,
 * con el contenido centrado entre ambos. Mientras el layout carga muestra un
 * spinner sobre el mismo fondo (sin flash blanco).
 *
 * Nació dentro de `kycClient.tsx` y se extrajo a este módulo propio para que
 * otras rutas fuera de `[landing]/solicitar/kyc` —hoy `entrega/[token]`,
 * mismo problema que resolvió `ResumeClient` para `/kyc/[token]`— puedan
 * reusarlo sin arrastrar el orquestador completo del KYC. El comportamiento
 * es idéntico al de siempre: exige un `LayoutProvider` más arriba en el árbol
 * (lee `useLayout()`), igual que `KycClient`.
 */

import { useParams } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { isNvidiaLanding } from '@/app/prototipos/0.6/utils/theme';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

export function KycChrome({ children, landing: landingProp }: { children: React.ReactNode; landing?: string }) {
  const params = useParams();
  const landing = landingProp || (params.landing as string) || 'home';
  const {
    navbarProps,
    footerData,
    agreementData,
    isLoading: isLayoutLoading,
    hasError: hasLayoutError,
  } = useLayout();

  if (isLayoutLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 relative">
        {isNvidiaLanding(landing)
          ? <NvidiaNavbar landing={landing} />
          : <Navbar {...navbarProps} landing={landing} />}
        {/* Spacer — alto dinámico del navbar fijo. */}
        <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

        <main className="flex items-start justify-center px-4 pb-16 pt-2 min-h-[60vh]">
          {children}
        </main>
      </div>
      <Footer data={footerData} landing={landing} agreementData={agreementData} />
    </>
  );
}
