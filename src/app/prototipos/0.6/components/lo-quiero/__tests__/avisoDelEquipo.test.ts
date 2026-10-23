import { avisosDelEquipo, fechaDeEntrega, textosDelAviso } from '../avisoDelEquipo';

describe('avisoDelEquipo (BAL-4958)', () => {
  it('fecha del prototipo: "20 de noviembre"', () => {
    expect(fechaDeEntrega('2026-11-20')).toBe('20 de noviembre');
    expect(fechaDeEntrega('2026-07-05T00:00:00Z')).toBe('5 de julio');
    expect(fechaDeEntrega(null)).toBe('');
  });

  it('reacondicionado con y sin grado', () => {
    expect(avisosDelEquipo({ condition: 'reacondicionado', grade: 'B' })).toEqual([{ tipo: 'reacondicionado', grado: 'B' }]);
    expect(textosDelAviso({ tipo: 'reacondicionado', grado: null }).titulo).toBe('Equipo reacondicionado');
  });

  it('entrega programada con la fecha real; nuevo sin entrega: sin aviso', () => {
    const entrega = { isDeferred: true, estimatedFrom: '2026-11-20' } as never;
    expect(avisosDelEquipo({ condition: 'nuevo', deferredDelivery: entrega })).toEqual([{ tipo: 'entrega', desde: '20 de noviembre' }]);
    expect(avisosDelEquipo({ condition: 'nuevo' })).toEqual([]);
  });
});
