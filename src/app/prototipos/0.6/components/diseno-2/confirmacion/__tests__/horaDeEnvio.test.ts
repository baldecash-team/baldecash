import { horaDeEnvio } from '../horaDeEnvio';

describe('horaDeEnvio', () => {
  it('con fecha real: "Hoy, HH:MM a./p. m."', () => {
    const fecha = new Date('2026-10-22T08:38:00-05:00');
    expect(horaDeEnvio(fecha)).toMatch(/^Hoy, \d{2}:\d{2}/);
  });

  it('sin fecha: solo "Hoy"', () => {
    expect(horaDeEnvio(null)).toBe('Hoy');
    expect(horaDeEnvio(undefined)).toBe('Hoy');
  });

  it('con fecha inválida: cae a "Hoy"', () => {
    expect(horaDeEnvio(new Date('no-es-una-fecha'))).toBe('Hoy');
  });
});
