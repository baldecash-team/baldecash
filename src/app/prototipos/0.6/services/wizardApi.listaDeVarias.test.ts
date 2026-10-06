/**
 * BAL-4354 — condiciones sobre una lista donde el cliente marcó varias:
 * «entre lo que marcó está X» (operador `in`, `equals` o `contains`) se mira
 * contra cada marcada, no contra el texto «deportes,tecnologia».
 */
import { evaluateFieldVisibility, filterFieldOptions, WizardField } from './wizardApi';

const hijo = (operator: string, value: string | string[] | null): WizardField =>
  ({
    id: 2,
    code: 'deporte_favorito',
    label: '¿Qué deporte?',
    type: 'text',
    options: [],
    dependency_groups: [
      { action: 'show', logic: 'and', conditions: [{ depends_on_field: 'intereses', operator, value }] },
    ],
  }) as unknown as WizardField;

const marcó = (...v: string[]) => ({ intereses: v });

describe('condiciones sobre una lista de varias', () => {
  it('«marcó alguna de» (in) mira cada marcada', () => {
    expect(evaluateFieldVisibility(hijo('in', ['deportes']), marcó('tecnologia', 'deportes'))).toBe(true);
    expect(evaluateFieldVisibility(hijo('in', ['deportes', 'arte']), marcó('musica'))).toBe(false);
  });

  it('«no marcó ninguna de» (not_in)', () => {
    expect(evaluateFieldVisibility(hijo('not_in', ['deportes']), marcó('musica'))).toBe(true);
    expect(evaluateFieldVisibility(hijo('not_in', ['deportes']), marcó('musica', 'deportes'))).toBe(false);
  });

  it('«entre lo que marcó está» con equals / contains no confunde subtextos', () => {
    expect(evaluateFieldVisibility(hijo('equals', 'deportes'), marcó('tecnologia', 'deportes'))).toBe(true);
    expect(evaluateFieldVisibility(hijo('contains', 'arte'), marcó('artesania'))).toBe(false);
    expect(evaluateFieldVisibility(hijo('not_equals', 'deportes'), marcó('arte'))).toBe(true);
  });

  it('vacío / no vacío con una lista', () => {
    expect(evaluateFieldVisibility(hijo('is_empty', null), marcó())).toBe(true);
    expect(evaluateFieldVisibility(hijo('is_not_empty', null), marcó('arte'))).toBe(true);
    expect(evaluateFieldVisibility(hijo('is_not_empty', null), marcó())).toBe(false);
  });

  it('una respuesta suelta (texto) se evalúa como siempre', () => {
    expect(evaluateFieldVisibility(hijo('equals', 'deportes'), { intereses: 'deportes' })).toBe(true);
    expect(evaluateFieldVisibility(hijo('in', ['deportes']), { intereses: 'arte' })).toBe(false);
  });
});

describe('«mostrar esta opción solo si…» con un padre de varias', () => {
  it('la opción se ve si el valor esperado está entre las marcadas', () => {
    const campo = {
      options: [
        { value: 'futbol', label: 'Fútbol', visibility_conditions: { intereses: 'deportes' } },
        { value: 'otro', label: 'Otro' },
      ],
    } as unknown as WizardField;
    expect(filterFieldOptions(campo, marcó('tecnologia', 'deportes')).map((o) => o.value)).toEqual(['futbol', 'otro']);
    expect(filterFieldOptions(campo, marcó('arte')).map((o) => o.value)).toEqual(['otro']);
  });
});
