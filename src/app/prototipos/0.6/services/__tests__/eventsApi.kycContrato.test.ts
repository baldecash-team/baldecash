/// <reference types="jest" />
/**
 * Los tipos son un union de TypeScript, así que un tipo que no está no
 * compila. El test fija que estos cinco existan: el backend los descarta en
 * silencio si no están en su catálogo, y este es el lado que los emite.
 */
import type { EventType } from '../eventsApi';

it('los eventos del contrato del KYC son tipos válidos', () => {
  const tipos: EventType[] = [
    'kyc_contract_generation_requested',
    'kyc_contract_ready',
    'kyc_contract_generation_failed',
    'kyc_contract_outdated',
    'kyc_contract_opened_external',
  ];
  expect(tipos).toHaveLength(5);
});
