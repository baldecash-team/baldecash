/**
 * E2E de los topes de uso de cupones (BAL-2629) en la web pública.
 *
 * Escenario montado antes de correr:
 *   WEBTOPE   — tope por equipo = 1, ya agotado sobre el iPad (id 518)
 *   WEBLIBRE  — sin topes, control
 *
 * El foco es el flujo del cliente: qué ve quien ingresa el cupón, no solo
 * qué responde la API.
 */
import { test, expect, request as pwRequest } from '@playwright/test';

const API = 'http://localhost:8032/api/v1';
const WEB = 'http://localhost:3010/prototipos/0.6/home';

const IPAD = 518;      // tope agotado para WEBTOPE
const LAPTOP = 491;    // mismo cupón, otro producto: debe seguir disponible

test.describe('Topes de uso — API que consume la web', () => {
  test('el producto con el tope agotado se rechaza', async () => {
    const api = await pwRequest.newContext();
    const r = await api.post(`${API}/public/coupons/validate`, {
      data: { code: 'WEBTOPE', product_id: IPAD },
    });
    const body = await r.json();

    expect(body.valid, 'el iPad ya consumió el único uso del cupón').toBe(false);
    expect(body.error_message).toContain('límite de usos para este equipo');
    await api.dispose();
  });

  test('otro producto del mismo cupón sigue disponible', async () => {
    // Es la diferencia entre "tope por cada equipo" y "tope global repartido".
    const api = await pwRequest.newContext();
    const r = await api.post(`${API}/public/coupons/validate`, {
      data: { code: 'WEBTOPE', product_id: LAPTOP },
    });
    const body = await r.json();

    expect(body.valid, 'la laptop no consumió nada, debe aceptar').toBe(true);
    await api.dispose();
  });

  test('un cupón sin topes aplica a cualquier producto', async () => {
    // El caso de los 4.105 cupones de producción que no tienen topes.
    const api = await pwRequest.newContext();
    for (const productId of [IPAD, LAPTOP]) {
      const r = await api.post(`${API}/public/coupons/validate`, {
        data: { code: 'WEBLIBRE', product_id: productId },
      });
      const body = await r.json();
      expect(body.valid, `producto ${productId} debe aceptar WEBLIBRE`).toBe(true);
    }
    await api.dispose();
  });

  test('sin producto en el request el tope no se evalúa', async () => {
    // Al validar el código en la web todavía puede no haber producto elegido.
    const api = await pwRequest.newContext();
    const r = await api.post(`${API}/public/coupons/validate`, {
      data: { code: 'WEBTOPE' },
    });
    const body = await r.json();

    expect(body.valid, 'sin producto no hay contra qué contar').toBe(true);
    await api.dispose();
  });
});

/**
 * Las pruebas de navegador sobre el catálogo quedaron fuera: en este entorno
 * local el catálogo no llega a renderizar tarjetas de producto. Verificado que
 * NO es por estos cambios — la rama solo toca CouponInput, y el mismo síntoma
 * aparece sin ella. El endpoint de filtros responde 200 y el CORS es correcto;
 * la petición la aborta el propio frontend.
 *
 * Los cuatro tests de arriba cubren la regla en el endpoint que consume la web,
 * que es donde vive la lógica de los topes.
 */
