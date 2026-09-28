/// <reference types="jest" />
/**
 * BAL-4188: la confirmacion (datos del cliente) no se indexa; el formulario si.
 */
import { metadata as confirmacionMetadata } from '../page';
import * as solicitarPage from '../../page';
import robots from '@/app/robots';

describe('noindex solo en la confirmacion (BAL-4188)', () => {
  it('la confirmacion trae noindex,nofollow', () => {
    expect(confirmacionMetadata.robots).toEqual({ index: false, follow: false });
  });

  it('el inicio del formulario no se marca noindex', () => {
    expect((solicitarPage as { metadata?: { robots?: unknown } }).metadata?.robots).toBeUndefined();
  });

  it('robots.txt no bloquea /solicitar/', () => {
    const { rules } = robots();
    const rule = Array.isArray(rules) ? rules[0] : rules;
    const disallow = ([] as string[]).concat(rule.disallow ?? []);
    expect(disallow.some((d) => d.includes('solicitar'))).toBe(false);
  });
});
