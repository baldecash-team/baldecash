/**
 * BAL-5367: «Probar en la web» llena el formulario con datos de prueba que
 * pasan la misma validación que el «Continuar» del wizard.
 */
import { validateField, type WizardField, type WizardStep } from '../../../../services/wizardApi';
import { armarDatosDePrueba, DNI_DE_PRUEBA } from '../datosDePrueba';

const campo = (over: Partial<WizardField>): WizardField => ({
  id: 1, code: 'x', label: 'X', type: 'text', required: true, readonly: false,
  hidden: false, grid_columns: 12, grid_columns_mobile: 12, options: [],
  validations: [], dependency_groups: [], max_files: null,
  ...over,
} as WizardField);

const paso = (order: number, fields: WizardField[]): WizardStep => ({
  id: order, code: `p${order}`, url_slug: `p${order}`, name: 'P', title: 'P', description: '',
  icon: '', order, required: true, skippable: false, estimated_time_minutes: 1,
  is_summary_step: false, motivational: null, fields,
});

const opciones = (...vals: string[]) => vals.map((v) => ({ value: v, label: v }));
const sinRed = jest.fn(async () => []);
const HOY = new Date('2026-10-30T12:00:00');

const valoresDe = (r: Awaited<ReturnType<typeof armarDatosDePrueba>>) =>
  Object.fromEntries(r.respuestas.map((x) => [x.fieldId, x.value]));

describe('armarDatosDePrueba', () => {
  it('usa el DNI del Balde Bot, nunca el 00000010', async () => {
    const r = await armarDatosDePrueba([paso(1, [
      campo({ code: 'document_type', type: 'radio', options: [{ value: 'ce', label: 'CE' }, { value: 'dni', label: 'DNI' }] }),
      campo({ code: 'document_number', type: 'document_number' }),
    ])], sinRed, HOY);
    expect(valoresDe(r)).toMatchObject({ document_type: 'dni', document_number: DNI_DE_PRUEBA });
    expect(DNI_DE_PRUEBA).toBe('99999901');
    expect(JSON.stringify(r)).not.toContain('00000010');
  });

  it('llena cada tipo con algo que pasa su validación', async () => {
    const campos = [
      campo({ code: 'first_name' }),
      campo({ code: 'apellido_paterno' }),
      campo({ code: 'email', type: 'email', validations: [{ type: 'email', message: 'x' }] }),
      campo({ code: 'phone', type: 'phone', validations: [{ type: 'phone', message: 'x' }] }),
      campo({ code: 'supporter_phone', type: 'phone',
        validations: [{ type: 'phone', message: 'x' }, { type: 'not_equals_field', value: 'phone', message: 'distinto' }] }),
      campo({ code: 'birth_date', type: 'date', validations: [{ type: 'age_greater_than', value: '17', message: 'x' }] }),
      campo({ code: 'monthly_income', type: 'currency', min_value: 3000, max_value: 9000 }),
      campo({ code: 'codigo_alumno', min_length: 8, pattern: '^[0-9]+$' }),
      campo({ code: 'income_type', type: 'radio', options: [{ value: 'otro', label: 'Otro' }, { value: 'dep', label: 'Dependiente' }] }),
      campo({ code: 'intereses', type: 'checkbox', allow_multiple: true, options: opciones('deporte', 'musica') }),
      campo({ code: 'acepta_terminos', type: 'checkbox' }),
      campo({ code: 'correo_u', type: 'email', allowed_email_domains: ['ucv.edu.pe'] }),
    ];
    const r = await armarDatosDePrueba([paso(1, campos)], sinRed, HOY);
    const v = valoresDe(r);
    expect(r.omitidos).toEqual([]);
    expect(v).toMatchObject({
      first_name: 'Balde', apellido_paterno: 'Bot', phone: '912345678', supporter_phone: '987654321',
      birth_date: '1995-01-01', monthly_income: '3000', income_type: 'dep', intereses: ['deporte'],
      acepta_terminos: 'true', correo_u: 'balde.bot@ucv.edu.pe',
    });
    for (const c of campos) {
      expect(validateField(c, v[c.code], v, {}, true).isValid).toBe(true);
    }
  });

  it('respeta la visibilidad y las opciones condicionadas', async () => {
    const r = await armarDatosDePrueba([
      paso(2, [campo({
        code: 'empresa',
        dependency_groups: [{ action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'ocupacion', operator: 'equals', value: 'trabaja' }] }],
      })]),
      paso(1, [campo({ code: 'ocupacion', type: 'radio', options: opciones('estudia', 'trabaja') })]),
    ], sinRed, HOY);
    expect(valoresDe(r)).toEqual({ ocupacion: 'estudia' });
  });

  it('pide a ws2 las listas que cargan de allá, en cascada', async () => {
    const cargar = jest.fn(async (f: WizardField, valores: Record<string, unknown>) => {
      if (f.code === 'department') return [{ value: 15, label: 'Lima' }];
      if (f.code === 'province') return [{ value: valores.department === '15' ? 1501 : 0, label: 'Lima' }];
      return [];
    });
    const r = await armarDatosDePrueba([paso(1, [
      campo({ code: 'department', type: 'select', options_source: 'geo-units/departments' }),
      campo({ code: 'province', type: 'select', options_source: 'geo-units/provinces', cascade_from: 'department', cascade_param: 'parent_id' }),
      campo({ code: 'district', type: 'select', options_source: 'geo-units/districts', cascade_from: 'province', cascade_param: 'parent_id' }),
    ])], cargar, HOY);
    expect(r.respuestas).toEqual([
      { fieldId: 'department', value: '15', label: 'Lima' },
      { fieldId: 'province', value: '1501', label: 'Lima' },
    ]);
    expect(r.omitidos).toEqual(['district']); // sin opciones: se deja para llenar a mano
  });

  it('llena el oculto que una regla muestra (monto del alquiler) y el celular alterno distinto', async () => {
    const r = await armarDatosDePrueba([paso(1, [
      campo({ code: 'phone', type: 'phone' }),
      campo({ code: 'phone_secondary', type: 'phone', required: false }),
      campo({ code: 'housing_type', type: 'select', options: opciones('alquilado_propio', 'propia') }),
      campo({ code: 'rent_amount', type: 'currency', hidden: true, min_value: 0, max_value: 50000,
        dependency_groups: [{ action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'housing_type', operator: 'in', value: ['alquilado_propio'] }] }] }),
    ])], sinRed, HOY);
    expect(valoresDe(r)).toMatchObject({ phone: '912345678', phone_secondary: '987654321', rent_amount: '2500' });
  });

  it('no llena archivos, ocultos ni direcciones con Google', async () => {
    const r = await armarDatosDePrueba([paso(1, [
      campo({ code: 'dni_front', type: 'file' }),
      campo({ code: 'utm', type: 'hidden' }),
      campo({ code: 'direccion_google', type: 'address_autocomplete' }),
    ])], sinRed, HOY);
    expect(r.respuestas).toEqual([]);
  });

  it('una falla de red no tumba el resto', async () => {
    const r = await armarDatosDePrueba([paso(1, [
      campo({ code: 'career', type: 'select', options_source: 'careers' }),
      campo({ code: 'first_name' }),
    ])], jest.fn(async () => { throw new Error('red'); }), HOY);
    expect(valoresDe(r)).toEqual({ first_name: 'Balde' });
    expect(r.omitidos).toEqual(['career']);
  });
});
