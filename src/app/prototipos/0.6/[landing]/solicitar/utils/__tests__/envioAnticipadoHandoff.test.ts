/// <reference types="jest" />
/**
 * El traspaso de la solicitud creada a mitad del wizard.
 *
 * Lo que se protege: que un handoff incompleto no se lea como bueno. La
 * pantalla siguiente decide con esto si ya hay solicitud; creerlo cuando no hay
 * código la deja pidiendo un contrato de nadie.
 */
import {
  clearEnvioAnticipadoHandoff,
  readEnvioAnticipadoHandoff,
  saveEnvioAnticipadoHandoff,
} from '../envioAnticipadoHandoff';

beforeEach(() => sessionStorage.clear());

it('guarda y devuelve lo que la pantalla siguiente necesita', () => {
  saveEnvioAnticipadoHandoff('renueva-tu-equipo-1', {
    applicationCode: 'APP-2026-00023',
    resumeToken: 'tok',
    documentNumber: '76826846',
  });

  expect(readEnvioAnticipadoHandoff('renueva-tu-equipo-1')).toEqual({
    applicationCode: 'APP-2026-00023',
    resumeToken: 'tok',
    documentNumber: '76826846',
  });
});

it('sin nada guardado no hay handoff', () => {
  expect(readEnvioAnticipadoHandoff('renueva-tu-equipo-1')).toBeNull();
});

it('es por landing: el de una no contamina a la otra', () => {
  saveEnvioAnticipadoHandoff('a', { applicationCode: 'APP-1' });

  expect(readEnvioAnticipadoHandoff('b')).toBeNull();
});

it('sin código no vale, aunque traiga token', () => {
  sessionStorage.setItem(
    'baldecash-x-envio-anticipado',
    JSON.stringify({ resumeToken: 'tok' }),
  );

  expect(readEnvioAnticipadoHandoff('x')).toBeNull();
});

it('un JSON roto no rompe la pantalla', () => {
  sessionStorage.setItem('baldecash-x-envio-anticipado', '{no es json');

  expect(readEnvioAnticipadoHandoff('x')).toBeNull();
});

it('se puede limpiar', () => {
  saveEnvioAnticipadoHandoff('a', { applicationCode: 'APP-1' });
  clearEnvioAnticipadoHandoff('a');

  expect(readEnvioAnticipadoHandoff('a')).toBeNull();
});

describe('atado a la sesion que lo creo', () => {
  it('la sesion de otra solicitud lo descarta', () => {
    // Sin esto el wizard cree que ya envio, pasa de largo el submit y muestra
    // el contrato de la solicitud vieja. Paso probando en local.
    saveEnvioAnticipadoHandoff('a', { applicationCode: 'APP-1', sessionUuid: 's1' });

    expect(readEnvioAnticipadoHandoff('a', 's2')).toBeNull();
  });

  it('la misma sesion lo conserva', () => {
    saveEnvioAnticipadoHandoff('a', { applicationCode: 'APP-1', sessionUuid: 's1' });

    expect(readEnvioAnticipadoHandoff('a', 's1')?.applicationCode).toBe('APP-1');
  });

  it('un handoff sin sesion anotada es viejo', () => {
    saveEnvioAnticipadoHandoff('a', { applicationCode: 'APP-1' });

    expect(readEnvioAnticipadoHandoff('a', 's1')).toBeNull();
  });

  it('sin sesion todavia resuelta no se descarta nada', () => {
    // Primer render: la sesion aun no existe. Descartar ahi haria parpadear la
    // pantalla del contrato justo despues de enviar.
    saveEnvioAnticipadoHandoff('a', { applicationCode: 'APP-1', sessionUuid: 's1' });

    expect(readEnvioAnticipadoHandoff('a', null)?.applicationCode).toBe('APP-1');
  });
});
