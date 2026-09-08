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
