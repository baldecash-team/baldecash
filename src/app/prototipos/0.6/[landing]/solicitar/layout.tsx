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

import { useEffect } from 'react';

import { clearEnvioAnticipadoHandoff } from './utils/envioAnticipadoHandoff';
import { useParams, usePathname } from 'next/navigation';
import { useSessionOptional } from './context/SessionContext';
import { debeRenovarSesionAlEntrar } from './utils/renovacionDeSesion';
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
  const pathname = usePathname();
  const landing = (params.landing as string) || 'home';
  // Opcional y no `useSession()`: este layout se monta bajo el de [landing],
  // que sí trae el provider, pero un throw acá tumbaría el wizard entero por
  // una renovación de sesión — lo último que debería poder romper el formulario.
  const sesion = useSessionOptional();

  /**
   * Arrancar una solicitud nueva sobre una sesión que ya envió una: renovarla.
   *
   * Este layout envuelve todo `/solicitar` —formulario, confirmación, KYC—, así
   * que NO se desmonta al pasar del envío a la confirmación: ese tramo es la
   * misma visita y tiene que quedar en la misma fila de `session`. Sólo se
   * vuelve a montar cuando la persona salió del subárbol (al catálogo, a la
   * landing) y volvió a entrar, que es exactamente "otra solicitud".
   *
   * Sin sesión convertida es un no-op, o sea: en la primera solicitud de la
   * pestaña no hace nada.
   *
   * Reabrir la confirmación NO cuenta como entrar: ver `debeRenovarSesionAlEntrar`.
   */
  useEffect(() => {
    if (!debeRenovarSesionAlEntrar(pathname)) return;
    const renovada = sesion?.renovarSesionSiConvertida();

    // Solicitud nueva ⇒ el handoff del envío anticipado de la anterior no puede
    // sobrevivir. Si sobreviviera, la pantalla del contrato mostraría el
    // contrato de la solicitud VIEJA y —peor— el guard de "ya enviada" haría
    // que esta segunda solicitud no se creara nunca.
    //
    // Se ata a que la sesión se haya renovado de verdad, no a entrar al
    // subárbol: entrar y salir a mitad del flujo no es empezar de nuevo.
    if (renovada) clearEnvioAnticipadoHandoff(landing);
    // Sólo al montar: el objetivo es la ENTRADA al subárbol, no cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
