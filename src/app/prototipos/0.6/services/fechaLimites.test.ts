/**
 * BAL-4396 · Fecha mínima y máxima del campo «Fecha».
 *
 * Misma regla que el backend (`app/services/fecha_limites.py`): para el
 * mismo texto ambos tienen que dar el mismo día, o el calendario dejaría
 * elegir algo que el envío rechaza.
 */
import {
  errorDeFecha,
  hoyLima,
  limitesDelCampo,
  mensajeFueraDeRango,
  resolverLimite,
} from './fechaLimites';

const HOY = '2026-10-03';

describe('BAL-4396 · resolverLimite', () => {
  it('relativos en años, meses y días', () => {
    expect(resolverLimite('-18y', HOY)).toBe('2008-10-03');
    expect(resolverLimite('-100y', HOY)).toBe('1926-10-03');
    expect(resolverLimite('+6m', HOY)).toBe('2027-04-03');
    expect(resolverLimite('-30d', HOY)).toBe('2026-09-03');
    expect(resolverLimite('0d', HOY)).toBe(HOY);
    expect(resolverLimite(' -18Y ', HOY)).toBe('2008-10-03');
    expect(resolverLimite('18y', HOY)).toBe('2044-10-03');
  });

  it('29 de febrero y 31 caen al último día del mes', () => {
    expect(resolverLimite('-1y', '2028-02-29')).toBe('2027-02-28');
    expect(resolverLimite('+1m', '2026-01-31')).toBe('2026-02-28');
  });

  it('fija', () => {
    expect(resolverLimite('2000-01-01', HOY)).toBe('2000-01-01');
  });

  it('vacío o roto = sin límite', () => {
    expect(resolverLimite(null, HOY)).toBeNull();
    expect(resolverLimite(undefined, HOY)).toBeNull();
    expect(resolverLimite('', HOY)).toBeNull();
    expect(resolverLimite('hace 18 años', HOY)).toBeNull();
    expect(resolverLimite('2000-02-30', HOY)).toBeNull();
  });
});

describe('BAL-4396 · errorDeFecha', () => {
  it('mayor de 18: el borde entra, un día después no', () => {
    expect(errorDeFecha('2008-10-03', null, '-18y', null, HOY)).toBeNull();
    expect(errorDeFecha('2008-10-04', null, '-18y', null, HOY)).toBe(
      'Elige una fecha hasta el 03/10/2008.'
    );
  });

  it('mínimo y los dos a la vez', () => {
    expect(errorDeFecha('1926-10-02', '-100y', null, null, HOY)).toBe(
      'Elige una fecha desde el 03/10/1926.'
    );
    expect(errorDeFecha('1900-01-01', '-100y', '-18y', null, HOY)).toBe(
      'Elige una fecha entre el 03/10/1926 y el 03/10/2008.'
    );
  });

  it('mensaje propio manda', () => {
    expect(errorDeFecha('2015-01-01', null, '-18y', 'Debes ser mayor de 18 años', HOY)).toBe(
      'Debes ser mayor de 18 años'
    );
  });

  it('sin límites o sin valor no dice nada', () => {
    expect(errorDeFecha('2999-01-01', null, null, null, HOY)).toBeNull();
    expect(errorDeFecha('', null, '-18y', null, HOY)).toBeNull();
  });

  it('mensajeFueraDeRango', () => {
    expect(mensajeFueraDeRango('2000-01-01', null)).toBe('Elige una fecha desde el 01/01/2000.');
  });
});

describe('BAL-4396 · limitesDelCampo', () => {
  it('lee las columnas del wizard y las resuelve', () => {
    expect(
      limitesDelCampo({ date_min: '-100y', date_max: '-18y', date_limit_message: 'x' }, HOY)
    ).toEqual({ min: '1926-10-03', max: '2008-10-03', mensaje: 'x' });
  });

  it('un wizard viejo sin las columnas = sin límites', () => {
    expect(limitesDelCampo({}, HOY)).toEqual({ min: null, max: null, mensaje: null });
  });
});

describe('BAL-4396 · mismos bordes que ws2', () => {
  it('«hoy» es el de Lima aunque en UTC ya sea el día siguiente', () => {
    // 04/10 03:00 UTC = 03/10 22:00 en Lima
    expect(hoyLima(new Date('2026-10-04T03:00:00Z'))).toBe('2026-10-03');
    expect(hoyLima(new Date('2026-10-04T05:00:00Z'))).toBe('2026-10-04');
  });

  it('nacido un 29-feb cumple 18 el 1-mar en año no bisiesto', () => {
    expect(errorDeFecha('2008-02-29', null, '-18y', null, '2026-02-28')).not.toBeNull();
    expect(errorDeFecha('2008-02-29', null, '-18y', null, '2026-03-01')).toBeNull();
  });
});
