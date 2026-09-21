/**
 * BAL-4027 (cola de BAL-3994) — las 5 rutas que arman un item del carrito
 * mandan la frecuencia SIEMPRE, tambien cuando es 'mensual'.
 *
 * El front representaba "mensual" como AUSENCIA del campo: `JSON.stringify`
 * borra la clave cuando vale `undefined`, y el backend la rellenaba con
 * `payment_frequency or "mensual"`. Si el producto no tiene celda de pricing
 * mensual, la solicitud nace con TEA 0, inicial 0 o la cuota de otra
 * frecuencia (L-130507, L-128954, L-128199, L-127830).
 *
 * El PR #428 cerro el catalogo, el comparador V1, la card y el hero, y dejo
 * ademas un `?? 'mensual'` en `useSubmitApplication`. Pero eso es una RED, no
 * un arreglo: si alguien toca ese punto de paso, el agujero se reabre en las
 * 5 rutas de aca a la vez. Por eso cada una lleva su propio default.
 *
 * Estos sitios son literales de objeto incrustados en componentes de pagina
 * (un `setSelectedProduct` dentro de un `useCallback`, un `.map()` sobre el
 * carrito antes de escribir localStorage). Renderizar cada pantalla entera
 * para alcanzarlos pediria mockear medio catalogo y mediria los mocks, no el
 * fix. Lo que sostiene la garantia es el default en la fuente, asi que es lo
 * que se mide: si alguien lo saca, estos tests se ponen rojos.
 *
 * La segunda mitad si ejercita el sintoma de verdad: que la clave sobreviva a
 * `JSON.parse(JSON.stringify(...))`, que es exactamente donde desaparecia.
 */

import fs from 'fs';
import path from 'path';

const BASE = path.join(__dirname, '..');

const leer = (rel: string) => fs.readFileSync(path.join(BASE, rel), 'utf8');

/**
 * Cada ruta con la expresion que tiene que estar en la fuente. La clave es la
 * ruta al archivo; el valor, la linea exacta del item del carrito.
 */
const RUTAS: {
  nombre: string;
  archivo: string;
  esperado: string[];
  /**
   * Lineas que a proposito NO llevan `?? 'mensual'`. Hay dos motivos, y son
   * distintos:
   *
   * 1. El tipo ya garantiza un string. Un default ahi seria codigo muerto.
   * 2. La linea NO arma el item del carrito: copia la frecuencia de un PLAN
   *    del catalogo (`cartPaymentPlans`). Ahi un default no seria inocuo,
   *    seria daniño: estamparia 'mensual' sobre los planes de un equipo que
   *    se vende semanal o quincenal, y `completarFrecuenciaPersistida`
   *    despues derivaria del objeto esa 'mensual' inventada — justo el bug
   *    que BAL-4029 cerro. Si el catalogo no la manda, se deja ausente a
   *    proposito para que actue el guard del backend.
   */
  exentos?: string[];
}[] = [
  {
    nombre: 'ComparatorV2 (elegir del comparador)',
    archivo: '[landing]/catalogo/components/comparator/ComparatorV2.tsx',
    esperado: ["paymentFrequency: product.paymentFrequency ?? 'mensual',"],
  },
  {
    nombre: 'GamerProductDetailClient (carrito, wishlist, solicitar y editar item)',
    archivo: '[landing]/producto/GamerProductDetailClient.tsx',
    esperado: [
      "paymentFrequency: item.paymentFrequency ?? 'mensual',",
      "paymentFrequency: data?.paymentFrequencies?.[0] ?? 'mensual',",
    ],
    // `cartPaymentPlans`: motivo 2. Es la frecuencia del PLAN, no la del item.
    exentos: ['paymentFrequency: plan.paymentFrequency,'],
  },
  {
    nombre: 'ProductDetailClient (continuar con el carrito)',
    archivo: '[landing]/producto/[...slug]/ProductDetailClient.tsx',
    esperado: ["paymentFrequency: cartItem.paymentFrequency ?? 'mensual',"],
  },
  {
    nombre: 'ProductDetail (solicitar directo)',
    archivo: '[landing]/producto/components/detail/ProductDetail.tsx',
    esperado: [
      // Solo el sitio del `?.`: ahi `pricingSelection` puede ser null y la
      // clave se iria del JSON. El de `handleAddToCart` NO lleva default
      // --`PricingSelection.paymentFrequency` es `string` requerido y el guard
      // ya descarto el null-- y lo cubre `exentos` mas abajo.
      "paymentFrequency: pricingSelection?.paymentFrequency ?? 'mensual',",
    ],
    exentos: [
      // Motivo 1: el tipo ya garantiza el string.
      'paymentFrequency: pricingSelection.paymentFrequency,',
      // Motivo 2: `cartPaymentPlans`, la frecuencia del PLAN.
      'paymentFrequency: plan.paymentFrequency,',
    ],
  },
  {
    nombre: 'HelpQuiz (elegir del quiz)',
    archivo: 'quiz/components/quiz/HelpQuiz.tsx',
    esperado: ["paymentFrequency: product.paymentFrequency ?? 'mensual',"],
  },
];

describe('BAL-4027: las 5 rutas al carrito mandan la frecuencia explicita', () => {
  describe.each(RUTAS)('$nombre', ({ archivo, esperado, exentos = [] }) => {
    it('pone el default en cada sitio que arma el item', () => {
      const fuente = leer(archivo);

      for (const linea of esperado) {
        expect(fuente).toContain(linea);
      }

      // Un exento que ya no existe es un exento que dejo de proteger nada:
      // si alguien renombra la linea, el filtro de abajo la dejaria pasar en
      // silencio.
      for (const linea of exentos) {
        expect(fuente).toContain(linea);
      }
    });

    it('no deja ningun paymentFrequency sin default en el item del carrito', () => {
      const fuente = leer(archivo);

      // Un `paymentFrequency: <algo>,` que NO termine en un default es
      // justamente la forma que tenia el bug. Se miran solo las lineas que
      // arman una propiedad del item, no las que leen el campo.
      const sinDefault = fuente
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => /^paymentFrequency: .+,$/.test(l))
        .filter((l) => !l.includes("'mensual'"))
        .filter((l) => !exentos.includes(l));

      expect(sinDefault).toEqual([]);
    });
  });

  // El sintoma exacto: con `undefined` la clave DESAPARECE del body y el
  // backend la inventa. Comparar contra 'mensual' no alcanza --el valor final
  // coincide igual--; hay que probar que el campo LLEGA.
  describe('la clave sobrevive a JSON.stringify', () => {
    it('con el fix (?? mensual) la clave viaja', () => {
      const paymentFrequency: string | undefined = undefined;

      const item = { id: '1566', paymentFrequency: paymentFrequency ?? 'mensual' };
      const serializado = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;

      expect('paymentFrequency' in serializado).toBe(true);
      expect(serializado.paymentFrequency).toBe('mensual');
    });

    it('sin el fix la clave se borra: eso es lo que rompia', () => {
      const paymentFrequency: string | undefined = undefined;

      const item = { id: '1566', paymentFrequency };
      const serializado = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;

      expect('paymentFrequency' in serializado).toBe(false);
    });

    it('una frecuencia sub-mensual elegida no se pisa con mensual', () => {
      const paymentFrequency: string | undefined = 'semanal';

      const item = { paymentFrequency: paymentFrequency ?? 'mensual' };

      expect(JSON.parse(JSON.stringify(item)).paymentFrequency).toBe('semanal');
    });
  });
});
