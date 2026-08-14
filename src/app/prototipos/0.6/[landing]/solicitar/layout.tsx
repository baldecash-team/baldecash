'use client';

/**
 * Wizard Preview Layout
 * Wraps wizard pages with providers:
 * - ProductProvider: manages selected product state
 * - WizardConfigProvider: fetches form config from API
 * - WizardProvider: manages form state and persistence
 *
 * SessionProvider + EventTrackerProvider live in the parent [landing] layout
 * and auto-initialize the session on mount, so tracking already exists
 * before the user reaches the wizard.
 *
 * JuicyScorePixel monta acá (y no en el layout de [landing]) porque el pixel
 * antifraude debe recolectar sobre la página donde el usuario tipea, no sobre
 * el catálogo. Es no-op mientras no haya token configurado.
 */

import { useParams } from 'next/navigation';
import { WizardProvider } from './context/WizardContext';
import { WizardConfigProvider } from './context/WizardConfigContext';
import { ProductProvider } from './context/ProductContext';
import { JuicyScorePixel } from '../../components/tracking/JuicyScorePixel';

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <ProductProvider key={landing} landingSlug={landing}>
      <WizardConfigProvider slug={landing}>
        <WizardProvider landingSlug={landing}>
          <JuicyScorePixel />
          {children}
        </WizardProvider>
      </WizardConfigProvider>
    </ProductProvider>
  );
}
