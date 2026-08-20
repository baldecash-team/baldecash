/**
 * El texto del badge de condición lo manda la BD (BAL-3204).
 *
 * Antes `conditionDisplayLabel` forzaba "Semi nuevo" para cualquier
 * reacondicionado y descartaba el label del facet, así que editar
 * `product_condition_catalog` no cambiaba nada en la web.
 */
import { conditionDisplayLabel, conditionDisplayLabelFor, REFURBISHED_DISPLAY_LABEL } from '../condition';

describe('conditionDisplayLabel — el facet manda', () => {
  it('usa el texto del facet para reacondicionados', () => {
    expect(conditionDisplayLabel('reacondicionada', 'Reacondicionado')).toBe('Reacondicionado');
  });

  it('respeta cualquier texto que venga de la base', () => {
    expect(conditionDisplayLabel('reacondicionada', 'Segunda mano')).toBe('Segunda mano');
  });

  it('cae al respaldo cuando el facet no trae label', () => {
    expect(conditionDisplayLabel('reacondicionada')).toBe(REFURBISHED_DISPLAY_LABEL);
    expect(conditionDisplayLabel('reacondicionada', null)).toBe('Semi nuevo');
  });

  it('sigue usando el facet para las demás condiciones', () => {
    expect(conditionDisplayLabel('open_box', 'Open Box')).toBe('Open Box');
  });

  it('deriva del código cuando no hay facet ni es reacondicionado', () => {
    expect(conditionDisplayLabel('open_box')).toBe('Open box');
  });

  it('devuelve vacío sin condición', () => {
    expect(conditionDisplayLabel(null)).toBe('');
  });
});

describe('conditionDisplayLabelFor — la campaña le gana a la base', () => {
  it('Family Farms mantiene su etiqueta aunque la base diga otra cosa', () => {
    expect(conditionDisplayLabelFor('familyfarm', 'reacondicionada', 'Semi nuevo')).toBe('Reacondicionado');
  });

  it('sin variante de campaña manda el facet', () => {
    expect(conditionDisplayLabelFor(null, 'reacondicionada', 'Reacondicionado')).toBe('Reacondicionado');
  });

  it('una variante que no redefine nada deja pasar el facet', () => {
    expect(conditionDisplayLabelFor('otracampana', 'reacondicionada', 'Segunda mano')).toBe('Segunda mano');
  });
});
