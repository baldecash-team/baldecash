import { alternarSeguro, quitarSeguros } from '../segurosElegidos';
import type { InsurancePlan } from '../../types/upsell';

const plan = (id: string, extra: Partial<InsurancePlan> = {}) => ({ id, name: id, monthlyPrice: 10, ...extra }) as InsurancePlan;

describe('segurosElegidos', () => {
  it('alterna como siempre', () => {
    const a = plan('14');
    expect(alternarSeguro([], a)).toEqual([a]);
    expect(alternarSeguro([a], a)).toEqual([]);
  });

  it('un plan incluido en el combo nunca entra (R7: no suma a la cuota ni al submit)', () => {
    const prev = [plan('23')];
    expect(alternarSeguro(prev, plan('16', { includedInCombo: true }))).toBe(prev);
  });

  it('quitarSeguros saca por id y no cambia la referencia si no hay nada que sacar', () => {
    const prev = [plan('16'), plan('23')];
    expect(quitarSeguros(prev, ['16'])).toEqual([plan('23')]);
    expect(quitarSeguros(prev, ['99'])).toBe(prev);
    expect(quitarSeguros(prev, [])).toBe(prev);
  });
});
