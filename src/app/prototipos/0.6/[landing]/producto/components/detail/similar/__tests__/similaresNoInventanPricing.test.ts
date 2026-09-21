/**
 * BAL-4027 (cola) — el carrusel "También te puede interesar" no puede inventar
 * el pricing del equipo que la persona elige.
 *
 * `SimilarProduct` es el payload de `similar_products` del detalle: trae
 * `monthly_quota` (el HOOK de la card) y nada más. No trae precio, ni plazo, ni
 * inicial, ni frecuencia de pago. Aun así `handleAddToCart` armaba un
 * `SelectedProduct` completo a partir de ese único número:
 *
 *     const estimatedPrice = Math.floor(product.monthlyQuota * 24);
 *     { price: estimatedPrice, months: 24, initialPercent: 0, initialAmount: 0 }
 *     // y sin `paymentFrequency`
 *
 * lo escribía en localStorage y saltaba a /solicitar. Con eso:
 *
 * - En un equipo que sólo se vende semanal/quincenal (celulares), el hook es la
 *   cuota SEMANAL: precio = cuota x 24 queda en la mitad del real (iPhone 17:
 *   2.040 contra 4.463) y se pierde la inicial del 25% (S/1.120). Es la forma
 *   exacta con la que nació L-130507.
 * - En un equipo mensual rompe al revés: cuota x 24 SUPERA al precio (HP
 *   15-fc0287la: 239 x 24 = 5.736 contra 3.200) y el submit se queda con el
 *   número inflado, porque acepta el `unit_price` del payload cuando es mayor
 *   que el del catálogo.
 *
 * No hay forma de derivar esos datos en este componente: no están en el
 * payload. Así que la card manda a la ficha del equipo, que es donde el
 * catálogo publica los planes reales y la persona elige el suyo. Desde ahí el
 * carrito se arma por las rutas que BAL-4027 ya cerró.
 *
 * Se mide sobre la fuente, igual que `frecuenciaSiempreExplicita.test.ts`: lo
 * que sostiene la garantía es que el componente NO tenga de dónde inventar, y
 * renderizar el carrusel entero mediría los mocks de NextUI, no el fix.
 */

import fs from 'fs';
import path from 'path';

const ARCHIVO = path.join(__dirname, '..', 'SimilarProducts.tsx');
const fuente = fs.readFileSync(ARCHIVO, 'utf8');

/**
 * Líneas de CÓDIGO: se descartan las de comentario. El comentario que explica
 * el bug cita la fórmula vieja, y sin esto el test se dispararía contra su
 * propia documentación en vez de contra el código.
 */
const lineasDeCodigo = fuente
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => !l.startsWith('*') && !l.startsWith('//') && !l.startsWith('/*'));

describe('SimilarProducts no inventa el pricing del equipo', () => {
  it('no deriva un precio de la cuota', () => {
    // `monthlyQuota * 24`, `monthly_quota*24`, etc. La cuota es un hook; no es
    // un precio dividido, y multiplicarla por un plazo supuesto no lo recupera.
    const derivaciones = lineasDeCodigo.filter((l) => /monthlyQuota\s*\*/.test(l));

    expect(derivaciones).toEqual([]);
  });

  it('no arma un item del carrito con plazo, inicial ni frecuencia supuestos', () => {
    // Un `SelectedProduct` construido acá es, por definición, inventado: el
    // payload de similares no tiene con qué llenarlo.
    expect(fuente).not.toContain('const selectedProduct: SelectedProduct');
    expect(fuente).not.toMatch(/^\s*months:\s*24,/m);
    expect(fuente).not.toMatch(/^\s*initialPercent:\s*0,/m);
  });

  it('no escribe el carrito en localStorage', () => {
    // Escribir el item y saltar a /solicitar es lo que saltea la elección del
    // plan. La ficha es la que tiene los planes publicados.
    const escrituras = lineasDeCodigo.filter((l) => l.includes('localStorage.setItem'));

    expect(escrituras).toEqual([]);
  });

  it('manda a la ficha del equipo, no directo al formulario', () => {
    // `routes.solicitar` desde acá es el salto que se lleva puesta la elección
    // del plan: llega al wizard con lo que este componente haya supuesto.
    expect(fuente).not.toContain('routes.solicitar(');
    expect(fuente).toContain('routes.producto(');
  });
});
