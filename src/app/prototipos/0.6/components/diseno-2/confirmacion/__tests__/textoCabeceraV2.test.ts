/**
 * F8 (BAL-4967): con y sin nombre, con y sin celular, y los modos heredados
 * de Diseño 1 (firmada / completado / aprobado) que apagan la línea de tiempo.
 */
import { textoCabeceraV2, nombreOVacio } from '../textoCabeceraV2';

describe('nombreOVacio', () => {
  it('devuelve el nombre si hay uno real', () => {
    expect(nombreOVacio('Brenda')).toBe('Brenda');
  });
  it('devuelve null para el centinela "Usuario" de buildReceivedData', () => {
    expect(nombreOVacio('Usuario')).toBeNull();
  });
  it('devuelve null para vacío', () => {
    expect(nombreOVacio('')).toBeNull();
    expect(nombreOVacio(undefined)).toBeNull();
  });
});

describe('textoCabeceraV2 — caso por defecto', () => {
  it('con nombre: saluda y pide la línea de tiempo', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24 });
    expect(r.titulo).toBe('¡Recibimos tu solicitud, Brenda!');
    expect(r.mostrarLineaDeTiempo).toBe(true);
  });

  it('sin nombre: título sin coma ni nombre', () => {
    const r = textoCabeceraV2({ userName: 'Usuario', estimatedResponseHours: 24 });
    expect(r.titulo).toBe('¡Recibimos tu solicitud!');
  });

  it('sin celular: omite "al +51 …"', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24 });
    expect(r.subtitulo).toBe(
      'Ya la estamos revisando. Te avisamos el resultado por WhatsApp en máximo 24 horas.',
    );
  });

  it('con celular: agrega "al +51 {celular}"', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24, telefono: '987654321' });
    expect(r.subtitulo).toBe(
      'Ya la estamos revisando. Te avisamos el resultado por WhatsApp al +51 987654321 en máximo 24 horas.',
    );
  });

  it('el número no se corta entre líneas: sus espacios son de no separación', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24, telefono: '9XX XXX 999' });
    expect(r.subtitulo).toContain('+51 9XX XXX 999');
  });

  it('nunca inventa el plazo: usa el mismo `estimatedResponseHours` que ya tiene Diseño 1', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 48 });
    expect(r.subtitulo).toContain('en máximo 48 horas');
  });
});

describe('textoCabeceraV2 — modos heredados de Diseño 1 (apagan la línea de tiempo)', () => {
  it('firmada: mismo texto que ReceivedMessage, sin línea de tiempo', () => {
    const r = textoCabeceraV2({
      userName: 'Brenda',
      estimatedResponseHours: 24,
      cierre: { firmada: true, pendiente: { pago_inicial: false, formulario: false } },
    });
    expect(r.titulo).toBe('¡Solicitud firmada, Brenda!');
    expect(r.subtitulo).toContain('Te enviamos por WhatsApp y correo tu copia');
    expect(r.mostrarLineaDeTiempo).toBe(false);
  });

  it('firmada con inicial pendiente: lo dice', () => {
    const r = textoCabeceraV2({
      userName: 'Brenda',
      estimatedResponseHours: 24,
      cierre: { firmada: true, pendiente: { pago_inicial: true, formulario: false } },
    });
    expect(r.subtitulo).toContain('pagues tu cuota inicial');
  });

  it('modoCierreKyc completado: sin línea de tiempo', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24, modoCierreKyc: 'completado' });
    expect(r.titulo).toContain('finalizar todo el proceso');
    expect(r.mostrarLineaDeTiempo).toBe(false);
  });

  it('modoCierreKyc aprobado: sin línea de tiempo', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24, modoCierreKyc: 'aprobado' });
    expect(r.titulo).toBe('¡Solicitud aprobada, Brenda!');
    expect(r.mostrarLineaDeTiempo).toBe(false);
  });

  it('CADE: saluda distinto pero conserva la línea de tiempo (sigue en evaluación)', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', estimatedResponseHours: 24, overlayVariant: 'cade' });
    expect(r.titulo).toContain('CADE');
    expect(r.mostrarLineaDeTiempo).toBe(true);
  });

  it('firmada gana sobre modoCierreKyc (es un hecho, no una deducción)', () => {
    const r = textoCabeceraV2({
      userName: 'Brenda',
      estimatedResponseHours: 24,
      modoCierreKyc: 'aprobado',
      cierre: { firmada: true, pendiente: { pago_inicial: false, formulario: false } },
    });
    expect(r.titulo).toBe('¡Solicitud firmada, Brenda!');
  });
});
