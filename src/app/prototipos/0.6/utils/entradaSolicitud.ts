/**
 * La ÚNICA entrada a la solicitud desde las puertas laterales (BAL-4969,
 * casuísticas): comparador, "Retomar financiamiento", calculadora, copia-home
 * y quiz. La card del catálogo y la ficha abren el modal "Lo quiero" ellas
 * mismas.
 *
 * Todas van a `/solicitar`. Ahí se decide el diseño: Diseño 1 muestra su
 * intro de siempre; Diseño 2 abre el modal "Lo quiero" (términos, accesorios y
 * cupón) y de ahí pasa al Paso 1. Antes de ir se guarda la página de origen,
 * para que cerrar el modal devuelva a la persona a donde estaba.
 */

import { routes } from './routes';
import { guardarEntradaALaSolicitud } from '../components/diseno-2/origenDiseno2';

interface NavegaA {
  push: (url: string) => void;
}

export function irALaSolicitud(router: NavegaA, landing: string): void {
  guardarEntradaALaSolicitud(landing);
  router.push(routes.solicitar(landing));
}

export default irALaSolicitud;
