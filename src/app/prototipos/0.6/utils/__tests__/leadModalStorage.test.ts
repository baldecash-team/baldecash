import {
  saveCouponFromModal,
  saveDocumentFromModal,
  getDocumentFromModal,
  saveLeadModalSubmission,
} from '../leadModalStorage';
import { getWizardFieldKey } from '../../[landing]/solicitar/utils/wizardScopedStorage';

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

/**
 * `saveLeadModalSubmission` es el punto de entrada único que usa el modal al
 * enviar: escribe las CUATRO claves en el mismo paso (BAL-3125 Tarea 4, punto
 * 10). El celular usa `getWizardFieldKey` con code 'phone' — el mismo
 * mecanismo genérico que ya lee `StepClient.tsx` para prellenar cualquier
 * campo del wizard, y el code real confirmado contra la BD (form_field.code
 * = 'phone', mapea a person.phone, es el más usado en landings activas).
 */
describe('saveLeadModalSubmission', () => {
  it('escribe las cuatro claves de una sola vez', () => {
    saveLeadModalSubmission('senati', {
      documentNumber: '12345678',
      phone: '987654321',
      coupon: { code: 'BIENVENIDA10', discount: 10, label: 'Bienvenida 10%' },
    });

    expect(localStorage.getItem('baldecash-dni-senati')).toBe('12345678');
    expect(
      localStorage.getItem(getWizardFieldKey('senati', 'document_number'))
    ).toBe('12345678');
    expect(localStorage.getItem(getWizardFieldKey('senati', 'phone'))).toBe(
      '987654321'
    );
    const cupon = JSON.parse(
      localStorage.getItem('baldecash-senati-solicitar-applied-coupon') as string
    );
    expect(cupon).toEqual({
      code: 'BIENVENIDA10',
      discount: 10,
      label: 'Bienvenida 10%',
      lockedFromUrl: true,
    });
  });

  it('sin cupon, no escribe la clave de cupon aplicado', () => {
    saveLeadModalSubmission('senati', {
      documentNumber: '12345678',
      phone: '987654321',
      coupon: null,
    });

    expect(
      localStorage.getItem('baldecash-senati-solicitar-applied-coupon')
    ).toBeNull();
    // El documento y el celular SIEMPRE se guardan, tenga o no cupon la landing.
    expect(localStorage.getItem('baldecash-dni-senati')).toBe('12345678');
    expect(localStorage.getItem(getWizardFieldKey('senati', 'phone'))).toBe(
      '987654321'
    );
  });

  it('cada landing guarda su propio campo de wizard', () => {
    saveLeadModalSubmission('senati', { documentNumber: '1', phone: '987654321', coupon: null });
    saveLeadModalSubmission('home', { documentNumber: '2', phone: '912345678', coupon: null });

    expect(localStorage.getItem(getWizardFieldKey('senati', 'phone'))).toBe('987654321');
    expect(localStorage.getItem(getWizardFieldKey('home', 'phone'))).toBe('912345678');
  });
});

describe('el celular llega prefillado al wizard', () => {
  it('escribe el celular en la clave que el wizard REALMENTE lee', () => {
    // `wizard-field-{code}` NO es un mecanismo generico de prefill: solo
    // `document_number` lo usa, hardcodeado en DocumentNumberField y
    // kycClient. El formulario restaura sus valores desde
    // `baldecash-wizard-{slug}-data`, con forma {campo: {value}}.
    //
    // Medido en el navegador: con solo la clave wizard-field-phone, el
    // campo Celular quedaba VACIO — sin ningun error.
    saveLeadModalSubmission('senati', {
      documentNumber: '72345678',
      phone: '987654321',
      coupon: null,
    });

    const crudo = localStorage.getItem('baldecash-wizard-senati-data');
    expect(crudo).not.toBeNull();

    const data = JSON.parse(crudo as string);
    expect(data.phone?.value).toBe('987654321');
    expect(data.document_number?.value).toBe('72345678');
  });

  it('no pisa lo que el usuario ya habia cargado en el wizard', () => {
    // Si alguien empezo la solicitud y despues abre el modal, sus datos
    // valen mas que los del modal.
    localStorage.setItem(
      'baldecash-wizard-senati-data',
      JSON.stringify({ first_name: { value: 'Ana' }, phone: { value: '900000000' } })
    );

    saveLeadModalSubmission('senati', {
      documentNumber: '72345678',
      phone: '987654321',
      coupon: null,
    });

    const data = JSON.parse(localStorage.getItem('baldecash-wizard-senati-data') as string);
    expect(data.first_name?.value).toBe('Ana');
    expect(data.phone?.value).toBe('900000000');
  });
});

