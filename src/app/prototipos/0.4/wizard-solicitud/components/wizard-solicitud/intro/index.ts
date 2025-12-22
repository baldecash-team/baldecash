/**
 * Intro Components Index - BaldeCash Web 4.0
 * SolicitudIntroV1 es dinamico y responde a todas las versiones de config
 * Soporta dark mode cuando wizardLayoutVersion es 4
 */

export { SolicitudIntroV1 } from './SolicitudIntroV1';

import { SolicitudIntroV1 } from './SolicitudIntroV1';

// El componente es ahora dinamico - usa config.headerVersion, heroVersion, ctaVersion
// para renderizar las 6 variantes de cada seccion
// Tambien soporta dark mode cuando wizardLayoutVersion es 4
export const getIntroComponent = () => {
  return SolicitudIntroV1;
};
