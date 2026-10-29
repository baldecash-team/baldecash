/**
 * BAL-5274: día de pago y distrito que el envío deja en la pestaña para la
 * tarjeta de la confirmación (el `/status` público no los trae).
 */
import { datosDelFormulario, guardarDatosDelEnvio, leerDatosDelEnvio, textoDeEntrega } from '../datosDelEnvioV2';

describe('datosDelEnvioV2', () => {
  beforeEach(() => sessionStorage.clear());

  it('saca el día de pago y la etiqueta del distrito del formData del wizard', () => {
    expect(
      datosDelFormulario({
        payment_day: { value: '18', label: 'Día 18 de cada mes' },
        district: { value: '1483', label: 'Miraflores' },
      }),
    ).toEqual({ paymentDay: 18, distrito: 'Miraflores' });
    expect(datosDelFormulario({ payment_day: { value: ['3'] } })).toEqual({ paymentDay: 3, distrito: null });
    expect(datosDelFormulario({ payment_day: { value: '' }, district: { value: '1' } })).toEqual({
      paymentDay: null,
      distrito: null,
    });
  });

  it('guarda y lee atado al código de la solicitud y a la landing', () => {
    guardarDatosDelEnvio('home', 'APP-1', { paymentDay: 3, distrito: 'Miraflores' });
    expect(leerDatosDelEnvio('home', 'APP-1')).toEqual({ paymentDay: 3, distrito: 'Miraflores' });
    expect(leerDatosDelEnvio('home', 'APP-2')).toBeNull();
    expect(leerDatosDelEnvio('ucv', 'APP-1')).toBeNull();
    expect(leerDatosDelEnvio('home', null)).toBeNull();
  });

  it('sin datos no guarda nada', () => {
    guardarDatosDelEnvio('home', 'APP-1', { paymentDay: null, distrito: null });
    expect(sessionStorage.length).toBe(0);
  });

  it('«En tu casa · {distrito}»; sin distrito no hay texto', () => {
    expect(textoDeEntrega('Miraflores')).toBe('En tu casa · Miraflores');
    expect(textoDeEntrega('')).toBeNull();
    expect(textoDeEntrega(null)).toBeNull();
  });
});
