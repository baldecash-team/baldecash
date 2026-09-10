/**
 * Quien tiene que confirmar el aviso "equipo semi nuevo" antes de solicitar.
 *
 * El riesgo de este cambio no es que falte el modal donde lo sacamos: es que
 * se caiga donde SÍ hace falta. En cualquier otra landing el aviso es lo único
 * que le dice a la persona que el equipo puede tener señales de uso, y
 * confirmarlo queda como constancia. Por eso el grueso del test es sobre las
 * landings que NO cambian.
 */
import { pideConfirmacionSemiNuevo } from '../condition';

const REACOND = 'reacondicionados';

describe('en reacondicionados no se interrumpe', () => {
  it('no pide confirmar aunque el equipo sea reacondicionado', () => {
    expect(pideConfirmacionSemiNuevo(REACOND, 'reacondicionada')).toBe(false);
    expect(pideConfirmacionSemiNuevo(REACOND, 'refurbished')).toBe(false);
  });
});

describe('el resto de las landings no cambia', () => {
  // No pretende ser exhaustiva: las más transitadas, las dos que comparten el
  // diseño de seminuevos (copia-home, renueva-*) y las de campaña.
  const landings = [
    'home', 'copia-home', 'renueva-tu-equipo-1', 'renueva-tu-equipo-2',
    'family-farms-baldecash-a', 'remate-ucv', 'zona-gamer', 'upn', '', null,
  ];

  it.each(landings)('%s sigue pidiendo confirmar', (landing) => {
    expect(pideConfirmacionSemiNuevo(landing, 'reacondicionada')).toBe(true);
  });

  it('un slug que EMPIEZA como el nuestro no hereda la excepción', () => {
    // Se decide por slug exacto: `reacondicionados-2` es otra landing.
    expect(pideConfirmacionSemiNuevo('reacondicionados-2', 'reacondicionada')).toBe(true);
  });
});

describe('un equipo nuevo nunca pide confirmar', () => {
  it.each(['nueva', 'nuevo', 'new', '', null, undefined])('%s', (cond) => {
    expect(pideConfirmacionSemiNuevo('home', cond)).toBe(false);
    expect(pideConfirmacionSemiNuevo(REACOND, cond)).toBe(false);
  });
});
