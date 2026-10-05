/**
 * En qué pantalla del wizard se crea la solicitud.
 *
 * Lo que se protege: que la lectura sea fail-safe. Sin el bloque —o con
 * cualquier cosa que no sea un `true` explícito— no hay envío anticipado y el
 * wizard se comporta como siempre. Prenderlo por accidente crearía solicitudes
 * reales a mitad del formulario.
 */

import {
  getEnvioAnticipadoStep,
  type SolicitarFlowConfig,
} from '../landingApi';

const cfg = (envio?: unknown): SolicitarFlowConfig => ({
  sections: [
    { type: 'wizard_steps', enabled: true, order: 1, envio_anticipado: envio } as never,
    { type: 'kyc', enabled: true, order: 2 },
  ],
});

describe('getEnvioAnticipadoStep', () => {
  it('sin el bloque no hay envío anticipado', () => {
    expect(getEnvioAnticipadoStep(cfg())).toBeNull();
    expect(getEnvioAnticipadoStep({ sections: [] })).toBeNull();
  });

  it('apagado tampoco, aunque tenga paso', () => {
    expect(getEnvioAnticipadoStep(cfg({ enabled: false, step: 2 }))).toBeNull();
  });

  it('sólo un true explícito lo prende', () => {
    for (const valor of ['si', 1, 'true', null]) {
      expect(getEnvioAnticipadoStep(cfg({ enabled: valor, step: 2 }))).toBeNull();
    }
  });

  it('prendido devuelve la pantalla configurada', () => {
    expect(getEnvioAnticipadoStep(cfg({ enabled: true, step: 2 }))).toBe(2);
  });

  it('sin paso, o con un paso inválido, cae en la primera pantalla', () => {
    expect(getEnvioAnticipadoStep(cfg({ enabled: true }))).toBe(1);
    for (const basura of [0, -1, 1.5, '2', null]) {
      expect(getEnvioAnticipadoStep(cfg({ enabled: true, step: basura }))).toBe(1);
    }
  });

  it('el wizard apagado no existe, así que no hay envío', () => {
    // `wizard_steps` no se puede apagar por API, pero una config vieja o rota
    // no puede terminar creando solicitudes a mitad de un wizard que no corre.
    const config: SolicitarFlowConfig = {
      sections: [
        { type: 'wizard_steps', enabled: false, order: 1, envio_anticipado: { enabled: true, step: 1 } } as never,
      ],
    };

    expect(getEnvioAnticipadoStep(config)).toBeNull();
  });
});
