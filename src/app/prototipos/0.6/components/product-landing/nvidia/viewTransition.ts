import { flushSync } from 'react-dom';

/**
 * Cambia de tab animando el subrayado (.sl-underline) con View Transitions.
 * El subrayado vive dentro del tab activo, así que su posición siempre es
 * correcta; al cambiar de tab el navegador interpola entre ambas posiciones.
 * Donde no haya soporte, el cambio es instantáneo (pero bien ubicado).
 */
export function changeTab(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}
