'use client';

/**
 * ¿Se ofrece el cupón en esta landing? (BAL-5203)
 *
 * Lo decide la config de la landing (`features.has_coupon`); si la landing
 * pide el cupón como obligatorio, se ofrece igual aunque esa bandera esté
 * apagada. Arranca en `true` mientras la config no llega, como lo hacía el
 * modal "Lo quiero".
 *
 * Una sola regla para el modal "Lo quiero" y el panel "Tu solicitud" de los
 * pasos (Diseño 2): antes vivía copiada dentro del modal.
 */
import { useEffect, useState } from 'react';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';

export function useCuponVisible(landing: string, obligatorio: boolean): boolean {
  const [muestraCupon, setMuestraCupon] = useState(true);
  useEffect(() => {
    let vivo = true;
    fetchLandingConfig(landing).then((cfg) => {
      if (vivo) setMuestraCupon(cfg.features.has_coupon);
    });
    return () => {
      vivo = false;
    };
  }, [landing]);
  return muestraCupon || obligatorio;
}
