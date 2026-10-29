import {
  TEXTO_INCLUIDO_EN_COMBO,
  comboItemsDesdeCatalogo,
  comboItemsDesdeDetalle,
  etiquetaDeTipoDeSeguro,
  idsQueNoSeVendenConElCombo,
  segurosDelComboDesdeApi,
  segurosIncluidosDelProducto,
  segurosParaElPlazo,
  separarIncluidos,
  textoIncluyeDelCombo,
  type SeguroDelCombo,
} from '../comboIncluidos';

const SR12: SeguroDelCombo = { planId: '15', name: 'Robo 12M', durationMonths: 12, insuranceType: 'seguro_robo' };
const SR24: SeguroDelCombo = { planId: '16', name: 'Robo 24M', durationMonths: 24, insuranceType: 'seguro_robo' };
const GE24: SeguroDelCombo = { planId: '14', name: 'Garantía 24M', durationMonths: 24, insuranceType: 'garantia_extendida' };

describe('comboIncluidos', () => {
  it('el texto es el del brandbook', () => {
    expect(TEXTO_INCLUIDO_EN_COMBO).toBe('Incluido en tu combo');
  });

  it('segurosDelComboDesdeApi lee insurances[] y cae a insurance', () => {
    expect(segurosDelComboDesdeApi({
      insurances: [{ plan_id: 16, name: 'Robo 24M', duration_months: 24, insurance_type: 'seguro_robo' }],
    })).toEqual([SR24]);
    expect(segurosDelComboDesdeApi({ insurance: { plan_id: 15, name: 'Robo 12M' } }))
      .toEqual([{ planId: '15', name: 'Robo 12M', durationMonths: null, insuranceType: null }]);
    expect(segurosDelComboDesdeApi(null)).toEqual([]);
    expect(segurosDelComboDesdeApi({ insurances: [{ name: 'sin id' }] })).toEqual([]);
  });

  it('segurosParaElPlazo: versión del plazo por tipo; tipo de una versión siempre', () => {
    expect(segurosParaElPlazo([SR12, SR24, GE24], 24)).toEqual([SR24, GE24]);
    expect(segurosParaElPlazo([SR12, SR24, GE24], 12)).toEqual([SR12, GE24]);
    expect(segurosParaElPlazo([SR12, SR24, GE24], 36)).toEqual([GE24]);
    expect(segurosParaElPlazo([SR12, SR24, GE24], null)).toEqual([SR12, SR24, GE24]);
    // Dos planes del mismo tipo con la MISMA vigencia: una sola vigencia, van los dos.
    const SR12b: SeguroDelCombo = { ...SR12, planId: '17' };
    expect(segurosParaElPlazo([SR12, SR12b], 24)).toEqual([SR12, SR12b]);
  });

  it('etiquetaDeTipoDeSeguro', () => {
    expect(etiquetaDeTipoDeSeguro('seguro_robo', 'x')).toBe('Seguro contra robo');
    expect(etiquetaDeTipoDeSeguro('garantia_extendida', 'x')).toBe('Garantía extendida');
    expect(etiquetaDeTipoDeSeguro('multiasistencia', 'x')).toBe('Multiasistencia');
    expect(etiquetaDeTipoDeSeguro(null, 'Plan raro')).toBe('Plan raro');
  });

  it('textoIncluyeDelCombo: accesorios + un rótulo por tipo; sin seguros, null', () => {
    expect(textoIncluyeDelCombo([{ name: 'Mochila Nova' }], [SR12, SR24, GE24]))
      .toBe('Incluye Mochila Nova · Seguro contra robo · Garantía extendida');
    expect(textoIncluyeDelCombo([{ name: 'Mochila Nova' }], [])).toBeNull();
    expect(textoIncluyeDelCombo(undefined, undefined)).toBeNull();
  });

  it('comboItemsDesdeDetalle y comboItemsDesdeCatalogo', () => {
    expect(comboItemsDesdeDetalle({
      id: 52, code: 'C', name: 'C', displayName: 'C', description: '', accessories: [],
      insurances: [{ planId: 16, name: 'Robo 24M', price: 0, durationMonths: 24, insuranceType: 'seguro_robo' }],
    })).toEqual({ insurances: [SR24] });
    expect(comboItemsDesdeDetalle(undefined)).toBeUndefined();
    expect(comboItemsDesdeDetalle({ id: 1, code: 'C', name: 'C', displayName: 'C', description: '', accessories: [] }))
      .toBeUndefined();
    expect(comboItemsDesdeCatalogo({ comboInsurances: [GE24] })).toEqual({ insurances: [GE24] });
    expect(comboItemsDesdeCatalogo({})).toBeUndefined();
  });

  it('segurosIncluidosDelProducto usa el plazo del producto', () => {
    expect(segurosIncluidosDelProducto({ comboItems: { insurances: [SR12, SR24, GE24] }, months: 12 }))
      .toEqual([SR12, GE24]);
    expect(segurosIncluidosDelProducto(null)).toEqual([]);
  });

  it('separarIncluidos', () => {
    const a = { id: '16', includedInCombo: true };
    const b = { id: '23', includedInCombo: false };
    const c: { id: string; includedInCombo?: boolean } = { id: '24' };
    expect(separarIncluidos([a, b, c])).toEqual({ incluidos: [a], ofrecidos: [b, c] });
  });

  it('idsQueNoSeVendenConElCombo: el mismo plan o uno de su tipo', () => {
    const elegidos = [
      { id: '16', insuranceType: 'seguro_robo' },
      { id: '99', insuranceType: 'seguro_robo' },
      { id: '23', insuranceType: 'multiasistencia' },
    ];
    expect(idsQueNoSeVendenConElCombo(elegidos, [{ id: '16', insuranceType: 'seguro_robo' }])).toEqual(['16', '99']);
    expect(idsQueNoSeVendenConElCombo(elegidos, [])).toEqual([]);
  });
});
