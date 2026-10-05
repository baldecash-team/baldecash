import { checkInstitutionalEmail } from '../institutionalDomains';

describe('checkInstitutionalEmail', () => {
  it('detecta dominios institucionales exactos', () => {
    expect(checkInstitutionalEmail('alumno@upn.pe')).toMatchObject({
      isInstitutional: true,
      institutionCode: 'UPN',
      domain: 'upn.pe',
    });
    expect(checkInstitutionalEmail('foo@upc.edu.pe').institutionCode).toBe('UPC');
    expect(checkInstitutionalEmail('foo@pucp.edu.pe').institutionCode).toBe('PUCP');
    expect(checkInstitutionalEmail('foo@ucvvirtual.edu.pe').institutionCode).toBe('UCV');
    expect(checkInstitutionalEmail('foo@senati.pe').institutionCode).toBe('SENATI');
  });

  it('soporta múltiples dominios por institución (UP)', () => {
    expect(checkInstitutionalEmail('a@up.edu.pe').institutionCode).toBe('UP');
    expect(checkInstitutionalEmail('a@alum.up.edu.pe').institutionCode).toBe('UP');
  });

  it('reconoce subdominios de un dominio conocido', () => {
    expect(checkInstitutionalEmail('a@alumnos.upn.pe')).toMatchObject({
      isInstitutional: true,
      institutionCode: 'UPN',
    });
  });

  it('es case-insensitive y hace trim', () => {
    expect(checkInstitutionalEmail('  Alumno@UPN.PE  ').isInstitutional).toBe(true);
  });

  it('marca no-institucional un dominio desconocido pero válido', () => {
    expect(checkInstitutionalEmail('user@gmail.com')).toMatchObject({
      isInstitutional: false,
      institutionCode: null,
      domain: 'gmail.com',
    });
  });

  it('marca inválido un correo con forma incorrecta', () => {
    expect(checkInstitutionalEmail('no-es-email')).toMatchObject({
      isInstitutional: false,
      institutionCode: null,
      domain: null,
    });
    expect(checkInstitutionalEmail('')).toMatchObject({
      isInstitutional: false,
      domain: null,
    });
  });
});
