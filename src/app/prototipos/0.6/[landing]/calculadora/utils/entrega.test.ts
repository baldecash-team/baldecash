/**
 * Verifica que la calculadora deje sus dos importes donde el formulario los lee.
 *
 * El formulario NO consume las claves propias de la calculadora: restaura su
 * estado desde una sola clave, con la forma `{codigo: {value}}`. Si los importes
 * no quedan ahí, no viajan con la solicitud y quien evalúa no ve el desglose.
 */

import { getStorageKey } from '../../solicitar/context/ProductContext';
import {
  sembrarImportesEnFormulario,
  CLAVE_MONTO_MATRICULA,
  CLAVE_MONTO_PRIMERA_CUOTA,
  entregarASolicitar,
  guardarInstitucion,
  leerDatosMatricula,
  type ParametrosEntrega,
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

/**
 * El objeto de producto que la calculadora deja para /solicitar.
 *
 * El asistente no distingue este recorrido del normal: lee el producto de la
 * misma clave y arma el envio solo. Por eso lo que falte aca no se puede
 * recuperar mas adelante.
 */
describe('entregarASolicitar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function entregar(extra: Partial<ParametrosEntrega> = {}) {
    return entregarASolicitar({
      landing: LANDING,
      productoId: 1585,
      varianteId: 1411,
      productoSlug: 'prestamo-matricula-1186',
      productoNombre: 'Financiamiento de Matrícula',
      montos: { matricula: 800, primeraCuota: 150 },
      plazoMeses: 3,
      cuotaMensual: 373.98,
      institucionId: 7,
      institucionNombre: 'Universidad',
      institucionTipo: 'university',
      ...extra,
    });
  }

  /**
   * Sin variante, la solicitud queda registrada con una tasa en el backend
   * nuevo y otra distinta en el legado: el sincronizador al legado resuelve la
   * variante por defecto, pero el guardado del backend nuevo no.
   */
  it('manda la variante del producto', () => {
    expect(entregar()!.variantId).toBe('1411');
  });

  /**
   * El tipo de efectivo es lo que apaga accesorios y seguros por
   * compatibilidad: un prestamo no lleva perifericos.
   */
  it('marca el producto como de tipo efectivo', () => {
    expect(entregar()!.type).toBe('efectivo');
  });

  it('el precio es la suma de los dos importes, no uno solo', () => {
    expect(entregar()!.price).toBe(950);
  });

  /**
   * Los dos importes estan DENTRO del prestamo: no son un pago adelantado.
   * Mandarlos como inicial haria que el backend financie de menos y recalcule
   * la cuota sobre un monto que la persona nunca vio.
   */
  it('no manda inicial: el total se financia entero', () => {
    const producto = entregar()!;

    expect(producto.initialAmount).toBe(0);
    expect(producto.initialPercent).toBe(0);
  });

  /**
   * Este producto no esta en el catalogo y no tiene planes precalculados.
   * Incluirlos deja al selector de plazo ofreciendo opciones que recalcularian
   * mal la cuota.
   */
  it('no incluye planes de pago', () => {
    expect(entregar()!.paymentPlans).toBeUndefined();
  });

  it('conserva la marca de fuera de catalogo, que protege la cuota', () => {
    expect(entregar()!.outOfCatalog).toBe(true);
  });

  it('guarda el producto bajo la clave que lee el asistente', () => {
    entregar();

    const guardado = JSON.parse(localStorage.getItem(getStorageKey(LANDING))!);
    expect(guardado.variantId).toBe('1411');
    expect(guardado.type).toBe('efectivo');
  });
});

/**
 * La institución elegida en la primera pantalla.
 *
 * Viaja hasta el paso académico del formulario, que la usa para rellenar y
 * bloquear el campo de institución. Si acá se pierde el tipo, ese campo queda
 * editable y la solicitud puede terminar declarando otra institución que la que
 * fijó el precio.
 */
describe('guardarInstitucion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda id, nombre y tipo de la institución elegida', () => {
    guardarInstitucion(LANDING, 409, 'Universidad César Vallejo', 'university');

    const datos = leerDatosMatricula(LANDING)!;
    expect(datos.institucionId).toBe(409);
    expect(datos.institucionNombre).toBe('Universidad César Vallejo');
    expect(datos.institucionTipo).toBe('university');
  });

  it('cambiar de institución no borra lo ya cargado en la calculadora', () => {
    guardarInstitucion(LANDING, 409, 'Universidad César Vallejo', 'university');
    entregarASolicitar({
      landing: LANDING,
      productoId: 1585,
      varianteId: 1411,
      productoSlug: 'prestamo-matricula-1186',
      productoNombre: 'Financiamiento de Matrícula',
      montos: { matricula: 800, primeraCuota: 150 },
      plazoMeses: 3,
      cuotaMensual: 373.98,
      institucionId: 409,
      institucionNombre: 'Universidad César Vallejo',
      institucionTipo: 'university',
    });

    guardarInstitucion(LANDING, 551, 'Senati', 'institute');

    const datos = leerDatosMatricula(LANDING)!;
    expect(datos.institucionTipo).toBe('institute');
    expect(datos.montoMatricula).toBe(800);
    expect(datos.plazoMeses).toBe(3);
  });
});
