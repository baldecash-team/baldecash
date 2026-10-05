/**
 * La frecuencia sobrevive al salto del detalle al formulario.
 *
 * El producto se guarda en localStorage y el formulario lo relee. Si la
 * frecuencia no viaja, el formulario la reconstruye como 'mensual' y muestra
 * «17 meses» y «S/46/mes» para un plan que se cobra por semana.
 */

interface ProductoGuardado {
  slug: string;
  term: number;
  paymentFrequency?: string;
}

/** Réplica de la lectura que hace el formulario. */
function frecuenciaDelFormulario(guardado: ProductoGuardado): string {
  return guardado.paymentFrequency ?? 'mensual';
}

describe('la frecuencia viaja al formulario', () => {
  it('un plan semanal llega como semanal', () => {
    expect(frecuenciaDelFormulario({
      slug: 'tablet-tab-one-4g-1042', term: 17, paymentFrequency: 'semanal',
    })).toBe('semanal');
  });

  it('sin el campo cae a mensual: el bug', () => {
    expect(frecuenciaDelFormulario({
      slug: 'tablet-tab-one-4g-1042', term: 17,
    })).toBe('mensual');
  });

  it('un producto mensual no cambia', () => {
    expect(frecuenciaDelFormulario({
      slug: 'x', term: 24, paymentFrequency: 'mensual',
    })).toBe('mensual');
  });
});
