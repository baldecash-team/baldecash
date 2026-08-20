/**
 * Verifica que la calculadora deje sus dos importes donde el formulario los lee.
 *
 * El formulario NO consume las claves propias de la calculadora: restaura su
 * estado desde una sola clave, con la forma `{codigo: {value}}`. Si los importes
 * no quedan ahí, no viajan con la solicitud y quien evalúa no ve el desglose.
 */

import {
  sembrarImportesEnFormulario,
  CLAVE_MONTO_MATRICULA,
  CLAVE_MONTO_PRIMERA_CUOTA,
} from './entrega';

const LANDING = 'prestamo-matricula';
const CLAVE_FORMULARIO = `baldecash-wizard-${LANDING}-data`;

function leerFormulario(): Record<string, { value?: unknown }> {
  return JSON.parse(localStorage.getItem(CLAVE_FORMULARIO) || '{}');
}

describe('sembrarImportesEnFormulario', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deja los dos importes bajo los codigos que espera el formulario', () => {
    sembrarImportesEnFormulario(LANDING, { matricula: 350.6, primeraCuota: 320.5 });

    const data = leerFormulario();
    expect(data[CLAVE_MONTO_MATRICULA]).toEqual({ value: '350.6' });
    expect(data[CLAVE_MONTO_PRIMERA_CUOTA]).toEqual({ value: '320.5' });
  });

  it('conserva los decimales, que es lo que distingue un importe de otro', () => {
    sembrarImportesEnFormulario(LANDING, { matricula: 1234.56, primeraCuota: 0.5 });

    const data = leerFormulario();
    expect(data[CLAVE_MONTO_MATRICULA].value).toBe('1234.56');
    expect(data[CLAVE_MONTO_PRIMERA_CUOTA].value).toBe('0.5');
  });

  /**
   * El formulario guarda TODO su estado en esa clave. Reemplazar el objeto en
   * vez de fusionarlo borraria lo que la persona ya habia cargado.
   */
  it('no pisa lo que la persona ya habia cargado en el formulario', () => {
    localStorage.setItem(
      CLAVE_FORMULARIO,
      JSON.stringify({
        document_number: { value: '70020010' },
        email: { value: 'alguien@example.com' },
      })
    );

    sembrarImportesEnFormulario(LANDING, { matricula: 500, primeraCuota: 305 });

    const data = leerFormulario();
    expect(data.document_number).toEqual({ value: '70020010' });
    expect(data.email).toEqual({ value: 'alguien@example.com' });
    expect(data[CLAVE_MONTO_MATRICULA].value).toBe('500');
  });

  /**
   * Al reves que el modal de captacion, aca la calculadora SI manda: si la
   * persona vuelve atras y cambia los montos, los nuevos tienen que ganar. Un
   * importe viejo que sobreviva es peor que ninguno, porque viaja como si fuera
   * el elegido.
   */
  it('un importe nuevo reemplaza al anterior', () => {
    sembrarImportesEnFormulario(LANDING, { matricula: 500, primeraCuota: 305 });
    sembrarImportesEnFormulario(LANDING, { matricula: 800, primeraCuota: 150 });

    const data = leerFormulario();
    expect(data[CLAVE_MONTO_MATRICULA].value).toBe('800');
    expect(data[CLAVE_MONTO_PRIMERA_CUOTA].value).toBe('150');
  });

  it('conserva las demas propiedades del campo al reescribir su valor', () => {
    localStorage.setItem(
      CLAVE_FORMULARIO,
      JSON.stringify({ [CLAVE_MONTO_MATRICULA]: { value: '100', touched: true } })
    );

    sembrarImportesEnFormulario(LANDING, { matricula: 250, primeraCuota: 90 });

    expect(leerFormulario()[CLAVE_MONTO_MATRICULA]).toEqual({
      value: '250',
      touched: true,
    });
  });

  it('un contenido corrupto no rompe ni pierde los importes', () => {
    localStorage.setItem(CLAVE_FORMULARIO, '{esto no es json');

    expect(() =>
      sembrarImportesEnFormulario(LANDING, { matricula: 400, primeraCuota: 120 })
    ).not.toThrow();

    expect(leerFormulario()[CLAVE_MONTO_MATRICULA].value).toBe('400');
  });

  it('usa la clave de la landing recibida y no una fija', () => {
    sembrarImportesEnFormulario('otra-landing', { matricula: 10, primeraCuota: 20 });

    expect(localStorage.getItem(CLAVE_FORMULARIO)).toBeNull();
    expect(localStorage.getItem('baldecash-wizard-otra-landing-data')).not.toBeNull();
  });
});
