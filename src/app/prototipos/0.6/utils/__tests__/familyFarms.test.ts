/**
 * Qué landings son del convenio Family Farms.
 *
 * Es un convenio cerrado —whitelist de DNI, cobro contra planilla, inicial
 * obligatoria— y hay piezas de la pantalla que no aplican ahí: el retiro en
 * oficinas, por ejemplo, no tiene sentido para trabajadores de campo a los que
 * el equipo les llega por el convenio.
 *
 * El riesgo de este helper es el falso positivo: apagar una sección en una
 * landing que sí la necesita. Por eso se prueba tanto lo que entra como lo que
 * NO, incluidos los slugs parecidos.
 */

import { esFamilyFarms } from '../familyFarms';

describe('las tres del convenio', () => {
  it.each([
    'family-farms-baldecash-a',
    'family-farms-baldecash-b',
    'family-farms-baldecash-c',
  ])('%s', (slug) => {
    expect(esFamilyFarms(slug)).toBe(true);
  });

  it('tolera mayúsculas y espacios de una URL mal copiada', () => {
    expect(esFamilyFarms(' Family-Farms-BaldeCash-C ')).toBe(true);
  });
});

describe('el resto del catálogo no se ve afectado', () => {
  it.each(['home', 'renueva-tu-equipo', 'carrion', 'upc', 'certus', 'copia-home'])(
    '%s',
    (slug) => {
      expect(esFamilyFarms(slug)).toBe(false);
    },
  );

  it('la landing router no cuenta: no tiene catálogo propio', () => {
    expect(esFamilyFarms('family-farms-baldecash')).toBe(false);
  });

  it('un slug que solo empieza parecido no cuenta', () => {
    expect(esFamilyFarms('family-farms-otro-convenio')).toBe(false);
  });
});

describe('sin slug', () => {
  it.each([null, undefined, ''])('%p no es Family Farms', (slug) => {
    expect(esFamilyFarms(slug)).toBe(false);
  });
});
