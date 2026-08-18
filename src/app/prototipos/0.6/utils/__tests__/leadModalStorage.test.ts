import {
  saveCouponFromModal,
  saveDocumentFromModal,
  getDocumentFromModal,
} from '../leadModalStorage';

/**
 * El cupon se escribe en la MISMA clave que lee ProductContext
 * (`baldecash-${landing}-solicitar-applied-coupon`, ProductContext.tsx:29),
 * con el mismo tipo AppliedCoupon. Si la clave o la forma cambian, el cupon
 * no llega al formulario y el usuario pierde su descuento en silencio.
 */

beforeEach(() => localStorage.clear());

describe('leadModalStorage', () => {
  it('escribe el cupon en la clave que lee el formulario', () => {
    saveCouponFromModal('senati', {
      code: 'BIENVENIDA10',
      discount: 10,
      label: 'Bienvenida 10%',
      couponType: 'percent_quotas',
      quotasAffected: 3,
    });

    const crudo = localStorage.getItem('baldecash-senati-solicitar-applied-coupon');
    expect(crudo).not.toBeNull();
    expect(JSON.parse(crudo as string)).toEqual({
      code: 'BIENVENIDA10',
      discount: 10,
      label: 'Bienvenida 10%',
      couponType: 'percent_quotas',
      quotasAffected: 3,
      lockedFromUrl: true,
    });
  });

  it('marca el cupon como no removible', () => {
    // lockedFromUrl es el flag que el formulario ya respeta para que el
    // usuario no lo quite ni se pierda al cambiar de producto.
    saveCouponFromModal('senati', { code: 'X', discount: 5, label: 'X' });

    const c = JSON.parse(localStorage.getItem('baldecash-senati-solicitar-applied-coupon') as string);
    expect(c.lockedFromUrl).toBe(true);
  });

  it('guarda el documento en la clave que YA lee el formulario', () => {
    // DocumentNumberField lee `baldecash-dni-{slug}` y con eso autocompleta y
    // bloquea el campo (BAL-1806). Si la clave cambia, el autoseteo no ocurre.
    saveDocumentFromModal('senati', '12345678');

    expect(localStorage.getItem('baldecash-dni-senati')).toBe('12345678');
  });

  it('guarda el numero pelado, no un JSON', () => {
    // El formulario espera el numero directo. Un JSON ahi rompe el autoseteo
    // sin dar error: el campo quedaria con `{"documentNumber":"..."}` dentro.
    saveDocumentFromModal('senati', '12345678');

    expect(getDocumentFromModal('senati')).toBe('12345678');
  });

  it('devuelve null si no hay documento guardado', () => {
    expect(getDocumentFromModal('senati')).toBeNull();
  });

  it('cada landing guarda lo suyo', () => {
    saveDocumentFromModal('senati', '11111111');
    saveDocumentFromModal('home', '22222222');

    expect(getDocumentFromModal('senati')).toBe('11111111');
    expect(getDocumentFromModal('home')).toBe('22222222');
  });
});
