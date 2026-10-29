/**
 * BAL-5255: qué campos se validan al salir y qué error dan (el de «Continuar»).
 */
import { errorAlSalir, estaVacio, seValidaAlSalir } from '../validarAlSalir';
import { validateField, type WizardField } from '../../../../services/wizardApi';

const campo = (over: Partial<WizardField>): WizardField =>
  ({ label: 'x', required: true, options: [], validations: [], dependency_groups: [], max_files: 1, ...over }) as WizardField;

const CELULAR = campo({
  code: 'supporter_phone',
  type: 'phone',
  min_length: 9,
  max_length: 9,
  validations: [{ type: 'not_equals_field', value: 'phone', message: 'Es el mismo celular del solicitante' }],
} as Partial<WizardField>);
const CORREO = campo({
  code: 'supporter_email',
  type: 'email',
  validations: [{ type: 'not_equals_field', value: 'email', message: 'Es tu mismo correo' }],
} as Partial<WizardField>);

describe('seValidaAlSalir', () => {
  it('sí: los que se comparan contra el solicitante (not_equals_field)', () => {
    expect(seValidaAlSalir(CELULAR)).toBe(true);
    expect(seValidaAlSalir(CORREO)).toBe(true);
  });
  it('no: el resto', () => {
    expect(seValidaAlSalir(campo({ code: 'phone', type: 'phone' }))).toBe(false);
    expect(seValidaAlSalir({ validations: undefined as unknown as [] })).toBe(false);
  });
});

describe('estaVacio', () => {
  it.each([[''], ['   '], [undefined], [null], [[]]])('%p es vacío', (v) => expect(estaVacio(v as string)).toBe(true));
  it('con texto no', () => expect(estaVacio('9')).toBe(false));
});

describe('errorAlSalir', () => {
  const valores = { phone: '987654321', email: 'yo@correo.pe' };

  it('vacío: no avisa (el «obligatorio» espera al Continuar)', () => {
    expect(errorAlSalir(CELULAR, '', valores)).toBeNull();
    expect(errorAlSalir(CELULAR, '  ', valores)).toBeNull();
  });

  it('faltan dígitos: el mismo mensaje que Continuar', () => {
    const esperado = validateField(CELULAR, '98765', valores, undefined, true).error;
    expect(esperado).toBe('Mínimo 9 caracteres');
    expect(errorAlSalir(CELULAR, '98765', valores)).toBe(esperado);
  });

  it('igual al del solicitante: el mensaje de not_equals_field', () => {
    expect(errorAlSalir(CELULAR, '987654321', valores)).toBe('Es el mismo celular del solicitante');
    expect(errorAlSalir(CORREO, 'yo@correo.pe', valores)).toBe('Es tu mismo correo');
  });

  it('correo mal escrito: el mismo mensaje que Continuar', () => {
    expect(errorAlSalir(CORREO, 'mama@', valores)).toBe(validateField(CORREO, 'mama@', valores, undefined, true).error);
  });

  it('válido: null', () => {
    expect(errorAlSalir(CELULAR, '912345678', valores)).toBeNull();
    expect(errorAlSalir(CORREO, 'mama@correo.pe', valores)).toBeNull();
  });
});
