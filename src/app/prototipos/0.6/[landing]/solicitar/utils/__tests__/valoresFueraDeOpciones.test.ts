/**
 * BAL-4433: el borrador restaurado no puede conservar opciones que ya no
 * existen (caso 128137: `income_proof_type = "billetera_digital"`).
 */
import type { WizardField, WizardStep } from '../../../../services/wizardApi';
import type { FieldState } from '../../types/solicitar';
import { descartarValoresFueraDeOpciones } from '../valoresFueraDeOpciones';

const campo = (over: Partial<WizardField>): WizardField => ({
  id: 1, code: 'x', label: 'X', type: 'radio', required: false, readonly: false,
  hidden: false, grid_columns: 12, grid_columns_mobile: 12, options: [],
  validations: [], dependency_groups: [], max_files: null,
  ...over,
} as WizardField);

const paso = (fields: WizardField[]): WizardStep => ({
  id: 1, code: 'eco', url_slug: 'eco', name: 'Eco', title: 'Eco', description: '',
  icon: '', order: 1, required: true, skippable: false, estimated_time_minutes: 1,
  is_summary_step: false, motivational: null, fields,
});

const opciones = (...vals: string[]) => vals.map(v => ({ value: v, label: v }));

const steps = [paso([
  campo({ code: 'income_proof_type', options: opciones('boleta_pago', 'recibo_honorarios', 'ninguno') }),
  campo({ code: 'career', type: 'select', options_source: 'careers', options: [] }),
  campo({ code: 'province', type: 'select', cascade_from: 'department', options: opciones('lima') }),
  campo({ code: 'intereses', type: 'checkbox', options: opciones('deporte', 'musica') }),
  campo({ code: 'acepta', type: 'checkbox', options: [] }),
])];

const st = (value: FieldState['value'], label?: string): FieldState => ({ value, touched: true, label });

describe('descartarValoresFueraDeOpciones', () => {
  it('vacía la opción que ya no existe y su etiqueta', () => {
    const data = { income_proof_type: st('billetera_digital', 'Billetera digital') };
    const r = descartarValoresFueraDeOpciones(data, steps);
    expect(r.income_proof_type.value).toBe('');
    expect(r.income_proof_type.label).toBeUndefined();
  });

  it('deja la opción vigente y devuelve el mismo objeto si no cambia nada', () => {
    const data = { income_proof_type: st('boleta_pago', 'Boleta de pago'), nombres: st('Ana') };
    expect(descartarValoresFueraDeOpciones(data, steps)).toBe(data);
  });

  it('no toca campos con opciones de otro lado (options_source / cascada)', () => {
    const data = { career: st('123', 'Derecho'), province: st('150100', 'Lima') };
    expect(descartarValoresFueraDeOpciones(data, steps)).toBe(data);
  });

  it('en la casilla múltiple descarta solo lo que no existe', () => {
    const r = descartarValoresFueraDeOpciones({ intereses: st(['deporte', 'viajes']) }, steps);
    expect(r.intereses.value).toEqual(['deporte']);
  });

  it('no toca la casilla simple ni campos que no están en el formulario', () => {
    const data = { acepta: st('true'), campo_viejo: st('lo-que-sea') };
    expect(descartarValoresFueraDeOpciones(data, steps)).toBe(data);
  });

  it('no toca lo que llena el prellenado del documento (gender «M» del buró)', () => {
    const conPrellenado = [paso([
      campo({ code: 'document_number', type: 'document_number', prefill_config: { prefill_fields: { gender: 'gender' } } }),
      campo({ code: 'gender', type: 'select', options: opciones('male', 'female') }),
    ])];
    const data = { gender: st('M') };
    expect(descartarValoresFueraDeOpciones(data, conPrellenado)).toBe(data);
  });

  it('una opción que existe en cualquiera de los pasos del campo vale', () => {
    const dos = [...steps, paso([campo({ code: 'income_proof_type', options: opciones('yape_plin') })])];
    const data = { income_proof_type: st('yape_plin') };
    expect(descartarValoresFueraDeOpciones(data, dos)).toBe(data);
  });
});
