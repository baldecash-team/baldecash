import { parametrosDeFiltro } from '../filtroDeOpciones';

const valores: Record<string, string> = { institution_type: 'university', institution: '123' };
const ctx = { valorDe: (c: string) => valores[c] };

describe('parametrosDeFiltro (BAL-4384)', () => {
  it('sin filtro no agrega nada', () => {
    expect(parametrosDeFiltro(null, ctx)).toEqual([]);
    expect(parametrosDeFiltro(undefined)).toEqual([]);
    expect(parametrosDeFiltro({}, ctx)).toEqual([]);
  });

  it('wizard de hoy: depends_on sin param viaja como type (campo 43)', () => {
    expect(parametrosDeFiltro({ depends_on: 'institution_type' }, ctx)).toEqual([['type', 'university']]);
  });

  it('depends_on sin valor todavía no agrega nada (como hoy)', () => {
    expect(parametrosDeFiltro({ depends_on: 'institution_type' }, { valorDe: () => undefined })).toEqual([]);
  });

  it('leads de hoy: type e ids unidos por coma, en ese orden', () => {
    expect(parametrosDeFiltro({ type: ['university', 'institute'], ids: [3, 5] })).toEqual([
      ['type', 'university,institute'],
      ['ids', '3,5'],
    ]);
  });

  it('param study_center_id manda el valor del centro', () => {
    expect(parametrosDeFiltro({ depends_on: 'institution', param: 'study_center_id' }, ctx)).toEqual([
      ['study_center_id', '123'],
    ]);
  });

  it('el valor de depends_on gana sobre los tipos fijos cuando los dos van a type', () => {
    expect(parametrosDeFiltro({ depends_on: 'institution_type', type: ['institute'] }, ctx)).toEqual([
      ['type', 'university'],
    ]);
  });

  it('from_agreement manda el convenio solo si la landing tiene uno', () => {
    expect(parametrosDeFiltro({ from_agreement: true }, { agreementId: 7 })).toEqual([['agreement_id', '7']]);
    expect(parametrosDeFiltro({ from_agreement: true }, {})).toEqual([]);
  });

  it('la URL de hoy sale idéntica', () => {
    const p = new URLSearchParams({ search: 'uni' });
    for (const [k, v] of parametrosDeFiltro({ type: ['university', 'institute'], ids: [3] })) p.set(k, v);
    expect(p.toString()).toBe('search=uni&type=university%2Cinstitute&ids=3');
  });
});
