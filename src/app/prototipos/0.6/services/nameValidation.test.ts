import {
  hasNonNameChars,
  isPersonNameField,
  isValidPersonName,
  personNameFieldError,
} from './nameValidation';

/**
 * BAL-3634. Los valores de los casos negativos son los que están hoy en
 * `person.first_name` en producción — no son inventados.
 */

describe('personNameFieldError (BAL-4465)', () => {
  // Los casos de prod del 16-abr al 1-sep-2026: el buró no trajo los datos y
  // el cliente escribió su correo o un número en el nombre.
  it.each([
    ['first_name', 'drufastovillalobos@gmail.com', 'Escribe solo tu nombre, sin correo ni números'],
    ['first_name', '916848556', 'Escribe solo tu nombre, sin correo ni números'],
    ['maternal_surname', 'mpiocanto@gmail.com', 'Escribe solo tu apellido materno, sin correo ni números'],
    ['supporter_full_name', 'rosa@gmail.com', 'Escribe solo el nombre de tu familiar, sin correo ni números'],
    ['minor_full_name', '74125896', 'Escribe solo el nombre del estudiante, sin correo ni números'],
    ['guardian_first_name', 'Ana#', 'Escribe solo el nombre del apoderado, sin correo ni números'],
    ['paternal_surname', 'PEREZ_', 'Escribe solo tu apellido paterno, sin correo ni números'],
  ])('%s = %p -> mensaje del campo', (code, value, mensaje) => {
    expect(personNameFieldError(code, value)).toBe(mensaje);
  });

  it.each([
    ['first_name', 'José'],
    ['first_name', 'Brenda del Pilar'],
    ['paternal_surname', 'Ucañay'],
    ['maternal_surname', "D'Angelo"],
    ['maternal_surname', 'D’Angelo'],
    ['last_name', 'García-Pérez'],
    ['supporter_full_name', 'Vda. de Ríos'],
    ['minor_full_name', 'Müller'],
  ])('%s = %p pasa', (code, value) => {
    expect(personNameFieldError(code, value)).toBeNull();
  });

  it('vacío no es asunto de esta regla (lo decide `required`)', () => {
    expect(personNameFieldError('first_name', '')).toBeNull();
    expect(personNameFieldError('first_name', '   ')).toBeNull();
    expect(personNameFieldError('first_name', undefined)).toBeNull();
  });

  it('no toca campos que no son nombres', () => {
    expect(personNameFieldError('company_name', 'Tienda 24 S.A.C.')).toBeNull();
    expect(personNameFieldError('scholarship_name', 'Beca 18')).toBeNull();
  });
});

describe('hasNonNameChars', () => {
  it('marca arroba, dígitos y signos', () => {
    expect(hasNonNameChars('juan@gmail.com')).toBe(true);
    expect(hasNonNameChars('Juan 2')).toBe(true);
    expect(hasNonNameChars('Juan_')).toBe(true);
  });

  it('no marca el nombre a medio escribir', () => {
    expect(hasNonNameChars('Maria ')).toBe(false);
    expect(hasNonNameChars('')).toBe(false);
    expect(hasNonNameChars('Ñaña')).toBe(false);
  });
});

describe('isValidPersonName', () => {
  it.each([
    ['981971607', 'un celular (persona 131363)'],
    ['904920512', 'otro celular (persona 130633)'],
    ['61510977', 'su propio DNI (persona 130680)'],
    ['mpiocanto@gmail.com', 'un email (persona 131310)'],
    ['U23225335@utp.edu.pe', 'un email institucional (persona 123318)'],
    ['U26293402', 'un código de alumno (persona 128868)'],
    ['CELIA EMPERATRIZ 06/07/1956', 'nombre + fecha (persona 118345)'],
    ['-', 'el único caso que el guard viejo sí atajaba'],
    ['--', 'solo símbolos'],
    ['ab', 'menos de 3 caracteres'],
    ['', 'vacío'],
  ])('rechaza %p — %s', (value) => {
    expect(isValidPersonName(value)).toBe(false);
  });

  it.each([
    'Juan',
    'Jesus',
    'José',
    'Ñaña',
    'Begoña',
    'María José',
    "D'Angelo",
    'Maria-Jose',
    'de la Cruz',
    'Guerra Azabache',
  ])('acepta %p', (value) => {
    expect(isValidPersonName(value)).toBe(true);
  });

  it('tolera null y undefined', () => {
    expect(isValidPersonName(null)).toBe(false);
    expect(isValidPersonName(undefined)).toBe(false);
  });
});

describe('isPersonNameField', () => {
  it.each([
    'first_name',
    'nombres',
    'paternal_surname',
    'apellido_paterno',
    'maternal_surname',
    'last_name',
    'supporter_full_name',
    'minor_full_name',
    'guardian_first_name',
  ])('reconoce %p como campo de nombre', (code) => {
    expect(isPersonNameField(code)).toBe(true);
  });

  it.each([
    // Estos son `type: 'text'` en `form_field` y llevan números con todo
    // derecho. Si el filtro los tocara, rompería campos que hoy funcionan.
    'company_name',
    'employer_name',
    'scholarship_name',
    'address',
    'document_number',
  ])('NO toca %p', (code) => {
    expect(isPersonNameField(code)).toBe(false);
  });
});
