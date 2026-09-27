/// <reference types="jest" />
/**
 * BAL-4188 Task 10 — que Google no indexe `/solicitar/*`.
 *
 * Medido el 27-sep: la confirmación respondía `index, follow` y `robots.txt`
 * no excluía `/solicitar/`. Hubo 8 entradas con referrer de Google en 30
 * días — un link pensado para llegar por WhatsApp/correo, no por buscador.
 *
 * El layout de `[landing]/solicitar/` es `'use client'`: Next.js no permite
 * exportar `metadata` desde un Client Component, así que el `noindex` va en
 * cada `page.tsx` del subárbol (todos Server Components) — mismo patrón que
 * `prototipos/0.6/kyc/[token]/page.tsx`.
 */
import { metadata as solicitarMetadata } from '../page';
import { metadata as confirmacionMetadata } from '../confirmacion/page';
import { metadata as verificacionMetadata } from '../verificacion/page';
import { metadata as complementosMetadata } from '../complementos/page';
import { metadata as kycMetadata } from '../kyc/page';
import { metadata as stepSlugMetadata } from '../[stepSlug]/page';
import robots from '@/app/robots';

const NOINDEX = { index: false, follow: false };

describe('robots — /solicitar/* no se indexa (BAL-4188)', () => {
  it('solicitar/page.tsx trae noindex,nofollow', () => {
    expect(solicitarMetadata.robots).toEqual(NOINDEX);
  });

  it('solicitar/confirmacion/page.tsx trae noindex,nofollow', () => {
    expect(confirmacionMetadata.robots).toEqual(NOINDEX);
  });

  it('solicitar/verificacion/page.tsx trae noindex,nofollow', () => {
    expect(verificacionMetadata.robots).toEqual(NOINDEX);
  });

  it('solicitar/complementos/page.tsx trae noindex,nofollow', () => {
    expect(complementosMetadata.robots).toEqual(NOINDEX);
  });

  it('solicitar/kyc/page.tsx trae noindex,nofollow', () => {
    expect(kycMetadata.robots).toEqual(NOINDEX);
  });

  it('solicitar/[stepSlug]/page.tsx trae noindex,nofollow', () => {
    expect(stepSlugMetadata.robots).toEqual(NOINDEX);
  });

  it('robots.txt excluye /*/solicitar/', () => {
    const { rules } = robots();
    const rule = Array.isArray(rules) ? rules[0] : rules;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    expect(disallow).toContain('/*/solicitar/');
  });
});
