import {
  isPersonNameField,
  isValidPersonName,
  sanitizeNameInput,
} from './nameValidation';

/**
 * BAL-3634. Los valores de los casos negativos son los que están hoy en
 * `person.first_name` en producción — no son inventados.
 */

describe('sanitizeNameInput', () => {
  it('borra el celular que se tecleó en el campo de nombres', () => {
    // Persona 131363: quedó registrada como "981971607 Guerra Azabache".
    expect(sanitizeNameInput('981971607')).toBe('');
  });

  it('borra los dígitos pero conserva las letras', () => {
    // Persona 128868: código de alumno "U26293402".
    expect(sanitizeNameInput('U26293402')).toBe('U');
    // Persona 118345: "CELIA EMPERATRIZ 06/07/1956".
    expect(sanitizeNameInput('CELIA EMPERATRIZ 06/07/1956')).toBe('CELIA EMPERATRIZ ');
  });

  it('borra la arroba y los puntos de un email', () => {
    // Persona 131310.
    expect(sanitizeNameInput('mpiocanto@gmail.com')).toBe('mpiocantogmailcom');
  });

  it('deja intacto un nombre con tilde o ñ', () => {
    expect(sanitizeNameInput('José')).toBe('José');
    expect(sanitizeNameInput('Begoña')).toBe('Begoña');
    expect(sanitizeNameInput('María José')).toBe('María José');
  });

  it('deja intacto apóstrofo, guión y partículas', () => {
    expect(sanitizeNameInput("D'Angelo")).toBe("D'Angelo");
    expect(sanitizeNameInput('Maria-Jose')).toBe('Maria-Jose');
    expect(sanitizeNameInput('de la Cruz')).toBe('de la Cruz');
  });

  it('no pelea con el nombre a medio escribir', () => {
    // No hace trim ni colapsa espacios: "Maria " va camino a "Maria Jose".
    expect(sanitizeNameInput('Maria ')).toBe('Maria ');
  });

  it('tolera vacío', () => {
    expect(sanitizeNameInput('')).toBe('');
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
