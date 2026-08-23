/**
 * El texto del badge de condición lo manda la BD (BAL-3204).
 *
 * Antes `conditionDisplayLabel` forzaba "Semi nuevo" para cualquier
 * reacondicionado y descartaba el label del facet, así que editar
 * `product_condition_catalog` no cambiaba nada en la web.
 */
import { conditionDisplayLabel, REFURBISHED_DISPLAY_LABEL } from '../condition';

describe('conditionDisplayLabel — el facet manda', () => {
  it('usa el texto del facet para reacondicionados', () => {
    expect(conditionDisplayLabel('reacondicionada', 'Reacondicionado')).toBe('Reacondicionado');
  });

  it('respeta cualquier texto que venga de la base', () => {
    expect(conditionDisplayLabel('reacondicionada', 'Segunda mano')).toBe('Segunda mano');
  });

  it('cae al respaldo cuando el facet no trae label', () => {
    // El respaldo dice lo mismo que la BD en producción, para que la card no
    // cambie de texto al llegar el facet (BAL-3228).
    expect(conditionDisplayLabel('reacondicionada')).toBe(REFURBISHED_DISPLAY_LABEL);
    expect(conditionDisplayLabel('reacondicionada', null)).toBe('Reacondicionado');
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

// El override por campaña (`conditionDisplayLabelFor`) se quitó: forzaba
// "Reacondicionado" en Family Farms, que es exactamente lo que ya dice la BD,
// y su único efecto posible era ignorar en silencio lo que se editara desde
// Pricing → Etiquetas (BAL-3228). Ahora todas las landings leen el mismo facet.
