/**
 * El desglose de una fila del cronograma: capital, interés, comisión y monto.
 *
 * La regla que no se puede romper es que **las columnas sumen el monto**. Hoy
 * se consigue truncando cada parte y derivando el capital por resta; con
 * centavos hay que hacer lo mismo pero sin truncar, o la tabla muestra un
 * capital que no cuadra con lo que la persona paga.
 *
 * Y el catálogo sin centavos tiene que quedar byte a byte igual: es la tabla
 * que llevan años viendo todas las landings.
 */
import { desgloseDeFila } from '../desgloseDeFila';
import { construirFilas } from '../filasDelCronograma';

const filas = construirFilas({
  cuotas: 13, montoCuota: 32.2, frecuencia: 'semanal',
  inicio: new Date(2026, 7, 21), armadas: 4, montoInicial: 134,
});
const armada = filas[0];
const cuota = filas[4];

describe('sin centavos: el catálogo no cambia', () => {
  const opciones = { amort: { interest: 5.7, balance: 202.4 }, commissionAmount: 12.3, conCentavos: false };

  it('trunca cada parte, como siempre', () => {
    const d = desgloseDeFila(cuota, opciones);

    expect(d.monto).toBe(32);
    expect(d.interest).toBe(5);
    expect(d.commission).toBe(12);
    expect(d.balance).toBe(202);
  });

  it('el capital se deriva por resta, así las columnas suman', () => {
    const d = desgloseDeFila(cuota, opciones);

    expect(d.capital + d.interest + d.commission).toBe(d.monto);
  });
});

describe('con centavos', () => {
  const opciones = { amort: { interest: 5.7, balance: 202.4 }, commissionAmount: 12.3, conCentavos: true };

  it('no trunca', () => {
    const d = desgloseDeFila(cuota, opciones);

    expect(d.monto).toBeCloseTo(32.2, 2);
    expect(d.interest).toBeCloseTo(5.7, 2);
    expect(d.commission).toBeCloseTo(12.3, 2);
  });

  it('las columnas siguen sumando el monto', () => {
    const d = desgloseDeFila(cuota, opciones);

    expect(d.capital + d.interest + d.commission).toBeCloseTo(d.monto, 2);
  });
});

describe('las armadas', () => {
  it('no amortizan: no tienen desglose que mostrar', () => {
    // Una armada es parte de la inicial. Repartirla en capital e interés sería
    // inventar números que no existen en el préstamo.
    const d = desgloseDeFila(armada, { amort: undefined, commissionAmount: 12.3, conCentavos: true });

    expect(d.esArmada).toBe(true);
    expect(d.interest).toBe(0);
    expect(d.commission).toBe(0);
  });

  it('conservan su monto con centavos', () => {
    const d = desgloseDeFila(armada, { amort: undefined, commissionAmount: null, conCentavos: true });

    expect(d.monto).toBeCloseTo(33.5, 2);
  });
});

describe('bordes', () => {
  it('sin comisión configurada la columna es cero', () => {
    const d = desgloseDeFila(cuota, { amort: { interest: 5, balance: 0 }, commissionAmount: null, conCentavos: true });

    expect(d.commission).toBe(0);
  });

  it('una comisión en cero no se cuenta', () => {
    const d = desgloseDeFila(cuota, { amort: { interest: 5, balance: 0 }, commissionAmount: 0, conCentavos: true });

    expect(d.commission).toBe(0);
  });

  it('sin fila de amortización el interés es cero y el capital es el monto', () => {
    const d = desgloseDeFila(cuota, { amort: undefined, commissionAmount: null, conCentavos: true });

    expect(d.interest).toBe(0);
    expect(d.capital).toBeCloseTo(d.monto, 2);
  });
});
