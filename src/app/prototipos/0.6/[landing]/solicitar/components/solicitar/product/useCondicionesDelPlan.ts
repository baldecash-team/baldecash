'use client';

/**
 * Cambiar el plazo o la inicial de lo que la persona eligió.
 *
 * Salió tal cual de `SelectedProductBar` para que el panel "Tu solicitud" de
 * Diseño 2 (`diseno-2/PanelSolicitudV2`) use EXACTAMENTE la misma regla: el
 * evento de analytics antes de mutar, la cuota que sale de los planes del
 * backend (el contexto la busca en `paymentPlans`, acá no se calcula nada) y
 * el candado de las condiciones fijas.
 *
 * `congelada`: o la landing firma por aceptación (el contrato se emite con
 * estos números y el hash los sella) o la solicitud ya se creó. En los dos
 * casos el plazo y la inicial no se tocan.
 */

import { useParams } from 'next/navigation';
import { useProduct } from '../../../context/ProductContext';
import { useSolicitudCongelada } from '../../../hooks/useSolicitudCongelada';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { etiquetasDePlazo, ordenarTerms } from './etiquetaDePlazo';

export function useCondicionesDelPlan(condicionesFijas: boolean) {
  const { getAllProducts, updateProductInitial, getAvailableTerms, updateAllProductsToTerm } = useProduct();
  const params = useParams();
  const landingSlug = (params?.landing as string) || '';
  const analytics = useAnalytics();

  const yaEnviada = useSolicitudCongelada(landingSlug);
  const congelada = condicionesFijas || yaEnviada;

  const handleTermChange = (term: number) => {
    const primary = getAllProducts()[0];
    const from = primary?.term ?? primary?.months ?? 0;
    if (primary && from !== term) {
      analytics.trackPricingTermChange({
        product_id: primary.id,
        from,
        to: term,
        context: 'solicitar',
        frequency: primary.paymentFrequency,
      });
    }
    updateAllProductsToTerm(term);
  };

  const handleInitialChange = (productId: string, fromPercent: number, toPercent: number) => {
    if (fromPercent !== toPercent) {
      analytics.trackPricingInitialChange({
        product_id: productId,
        from: fromPercent,
        to: toPercent,
        context: 'solicitar',
      });
    }
    updateProductInitial(productId, toPercent);
  };

  // Con la inicial fraccionada el `term` son las cuotas, no el plazo que la
  // persona vive: el rotulo lo traduce y ordena por plazo total.
  const mainProduct = getAllProducts()[0];
  const planesDelPrincipal = mainProduct?.paymentPlans ?? [];
  const termLabels = etiquetasDePlazo(planesDelPrincipal, mainProduct?.paymentFrequency);
  const termOptions = ordenarTerms(planesDelPrincipal, getAvailableTerms());

  return { congelada, handleTermChange, handleInitialChange, termLabels, termOptions, landingSlug };
}
