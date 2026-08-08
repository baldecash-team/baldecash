import { hidesEquipmentStateBadges } from '../condition';

describe('hidesEquipmentStateBadges', () => {
  // Family Farms encabeza cada tarjeta reacondicionada con el banner
  // "REACONDICIONADO" y abre el grado en el selector A/B/C de la ficha. Repetir
  // ambos en chips sobre la foto es la misma información dicha tres veces.
  it('hides them for familyfarm', () => {
    expect(hidesEquipmentStateBadges('familyfarm')).toBe(true);
  });

  it.each([undefined, null, '', 'cade', 'lockertruck', 'zona-gamer'])(
    'keeps them for "%s"',
    (overlayVariant) => {
      expect(hidesEquipmentStateBadges(overlayVariant)).toBe(false);
    },
  );
});
