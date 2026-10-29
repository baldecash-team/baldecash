/// <reference types="jest" />
/**
 * BAL-5285 — textos del familiar según el vínculo (`supporter_relationship`).
 * Los `value` son los reales de la BD (form_field_option del campo 26):
 * `padre`, `madre`, `hermano`, `abuelo`.
 */
import {
  campoSegunVinculo,
  pasoSegunVinculo,
  textoSegunVinculo,
  vinculoDe,
} from '../textoSegunVinculo';
import { validateField, type WizardField } from '../../services/wizardApi';

function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1,
    code: 'x',
    label: 'X',
    type: 'text',
    placeholder: null,
    help_text: null,
    required: true,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    options: [],
    validations: [],
    dependency_groups: [],
    max_files: null,
    ...overrides,
  } as WizardField;
}

describe('textoSegunVinculo', () => {
  const T = 'Celular {de_tu_familiar} · ¿Cómo recibe {tu_familiar} sus ingresos?';
  it.each([
    ['madre', 'Celular de tu mamá · ¿Cómo recibe tu mamá sus ingresos?'],
    ['padre', 'Celular de tu papá · ¿Cómo recibe tu papá sus ingresos?'],
    ['hermano', 'Celular de tu hermano(a) · ¿Cómo recibe tu hermano(a) sus ingresos?'],
    ['abuelo', 'Celular de tu abuelo(a) · ¿Cómo recibe tu abuelo(a) sus ingresos?'],
    ['', 'Celular de tu familiar · ¿Cómo recibe tu familiar sus ingresos?'],
    ['tio', 'Celular de tu familiar · ¿Cómo recibe tu familiar sus ingresos?'],
    [undefined, 'Celular de tu familiar · ¿Cómo recibe tu familiar sus ingresos?'],
  ])('vínculo %p', (vinculo, esperado) => {
    expect(textoSegunVinculo(T, vinculo as string | undefined)).toBe(esperado);
  });

  it('tolera mayúsculas y espacios en el valor', () => {
    expect(textoSegunVinculo('{tu_familiar}', ' Madre ')).toBe('tu mamá');
  });

  it('reemplaza todas las apariciones', () => {
    expect(textoSegunVinculo('{tu_familiar} y {tu_familiar}', 'padre')).toBe('tu papá y tu papá');
  });

  it('un texto sin marcas sale idéntico (y null/undefined/vacío igual)', () => {
    expect(textoSegunVinculo('Celular del familiar', 'madre')).toBe('Celular del familiar');
    expect(textoSegunVinculo('Llaves {otra}', 'madre')).toBe('Llaves {otra}');
    expect(textoSegunVinculo(null, 'madre')).toBeNull();
    expect(textoSegunVinculo(undefined, 'madre')).toBeUndefined();
    expect(textoSegunVinculo('', 'madre')).toBe('');
  });

  it('vinculoDe lee supporter_relationship', () => {
    expect(vinculoDe({ supporter_relationship: 'madre' })).toBe('madre');
    expect(vinculoDe({})).toBe('');
    expect(vinculoDe(undefined)).toBe('');
  });
});

describe('campoSegunVinculo / pasoSegunVinculo', () => {
  const conMarcas = campo({
    code: 'supporter_phone',
    label: 'Celular {de_tu_familiar}',
    placeholder: 'Celular {de_tu_familiar}',
    help_text: { title: '¿Para qué {de_tu_familiar}?', description: 'Contactamos a {tu_familiar}.', recommendation: 'Avisa a {tu_familiar}.' },
    hint: 'El de {tu_familiar}',
    required_message: 'Escribe el celular {de_tu_familiar}.',
    validations: [
      { type: 'phone', message: 'Debe tener 9 dígitos' },
      { type: 'not_equals_field', value: 'phone', message: 'Ese es tu celular. Escribe el celular {de_tu_familiar}.' },
    ],
  });

  it('resuelve etiqueta, placeholder, ayuda, pista, obligatorio y errores', () => {
    const r = campoSegunVinculo(conMarcas, 'madre');
    expect(r.label).toBe('Celular de tu mamá');
    expect(r.placeholder).toBe('Celular de tu mamá');
    expect(r.help_text).toEqual({ title: '¿Para qué de tu mamá?', description: 'Contactamos a tu mamá.', recommendation: 'Avisa a tu mamá.' });
    expect(r.hint).toBe('El de tu mamá');
    expect(r.required_message).toBe('Escribe el celular de tu mamá.');
    expect(r.validations[0]).toBe(conMarcas.validations[0]);
    expect(r.validations[1].message).toBe('Ese es tu celular. Escribe el celular de tu mamá.');
    // El original no se toca.
    expect(conMarcas.label).toBe('Celular {de_tu_familiar}');
  });

  it('sin marcas devuelve el MISMO objeto (campo y paso)', () => {
    const f = campo({ label: 'Celular del familiar', hint: 'Pista', required_message: 'Falta' });
    expect(campoSegunVinculo(f, 'madre')).toBe(f);
    const paso = { fields: [f] };
    expect(pasoSegunVinculo(paso, 'madre')).toBe(paso);
  });

  it('no crea llaves hint/required_message que no venían', () => {
    const r = campoSegunVinculo(campo({ label: '{tu_familiar}' }), 'padre');
    expect('hint' in r).toBe(false);
    expect('required_message' in r).toBe(false);
  });

  it('pasoSegunVinculo cambia solo los campos con marcas', () => {
    const otro = campo({ code: 'otro', label: 'Otro' });
    const paso = { fields: [otro, conMarcas] };
    const r = pasoSegunVinculo(paso, 'abuelo');
    expect(r).not.toBe(paso);
    expect(r.fields[0]).toBe(otro);
    expect(r.fields[1].label).toBe('Celular de tu abuelo(a)');
  });
});

describe('validateField nombra al familiar según el vínculo', () => {
  const telefono = campo({
    code: 'supporter_phone',
    type: 'phone',
    required_message: 'Escribe el celular {de_tu_familiar}.',
    validations: [{ type: 'not_equals_field', value: 'phone', message: 'Ese es tu celular. Escribe el celular {de_tu_familiar}.' }],
  });
  const dni = campo({
    code: 'supporter_document_number',
    validations: [{ type: 'not_equals_field', value: 'document_number', message: 'Ese es tu DNI. Escribe el DNI {de_tu_familiar}.' }],
  });

  it.each([
    ['madre', 'Ese es tu celular. Escribe el celular de tu mamá.'],
    ['padre', 'Ese es tu celular. Escribe el celular de tu papá.'],
    ['hermano', 'Ese es tu celular. Escribe el celular de tu hermano(a).'],
    ['abuelo', 'Ese es tu celular. Escribe el celular de tu abuelo(a).'],
    ['', 'Ese es tu celular. Escribe el celular de tu familiar.'],
  ])('not_equals_field celular con vínculo %p', (vinculo, esperado) => {
    const valores = { phone: '987654321', supporter_relationship: vinculo };
    expect(validateField(telefono, '987654321', valores, undefined, true).error).toBe(esperado);
  });

  it('not_equals_field del DNI', () => {
    const valores = { document_number: '12345678', supporter_relationship: 'madre' };
    expect(validateField(dni, '12345678', valores, undefined, true).error).toBe('Ese es tu DNI. Escribe el DNI de tu mamá.');
  });

  it('required_message', () => {
    expect(validateField(telefono, '', { supporter_relationship: 'padre' }, undefined, true).error).toBe('Escribe el celular de tu papá.');
  });

  it('mensaje sin marcas sale igual que hoy', () => {
    const viejo = campo({ code: 'supporter_phone', validations: [{ type: 'not_equals_field', value: 'phone', message: 'El número de celular del apoyo familiar no puede ser igual al del solicitante' }] });
    expect(validateField(viejo, '987654321', { phone: '987654321', supporter_relationship: 'madre' }, undefined, true).error)
      .toBe('El número de celular del apoyo familiar no puede ser igual al del solicitante');
    expect(validateField(campo({}), '', {}, undefined, true).error).toBe('Este campo es requerido');
  });
});
