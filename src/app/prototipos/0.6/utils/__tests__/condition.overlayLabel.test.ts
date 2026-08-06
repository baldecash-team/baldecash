import {
  conditionDisplayLabel,
  conditionDisplayLabelFor,
  REFURBISHED_DISPLAY_LABEL,
} from '../condition';

describe('conditionDisplayLabelFor', () => {
  // Family Farms es una campaña de equipos reacondicionados y los nombra por su
  // nombre: su material y su diseño dicen "Reacondicionado", no "Semi nuevo".
  describe('familyfarm', () => {
    it.each(['reacondicionada', 'reacondicionado', 'refurbished'])(
      'renames %s to "Reacondicionado"',
      (condition) => {
        expect(conditionDisplayLabelFor('familyfarm', condition, 'Semi nuevo')).toBe('Reacondicionado');
      },
    );

    it('leaves other conditions to the shared label', () => {
      expect(conditionDisplayLabelFor('familyfarm', 'nueva', 'Nuevo')).toBe('Nuevo');
    });
  });

  describe('every other landing', () => {
    it.each([undefined, null, '', 'cade', 'zona-gamer'])(
      'keeps "%s" on the production label',
      (overlayVariant) => {
        expect(conditionDisplayLabelFor(overlayVariant, 'reacondicionada', 'Semi nuevo')).toBe(
          REFURBISHED_DISPLAY_LABEL,
        );
      },
    );

    it('matches conditionDisplayLabel for any input', () => {
      expect(conditionDisplayLabelFor('', 'nueva', 'Nuevo')).toBe(conditionDisplayLabel('nueva', 'Nuevo'));
      expect(conditionDisplayLabelFor('', null)).toBe(conditionDisplayLabel(null));
    });
  });
});
