import { searchProductSuggestions, termInFrequency } from '../catalogApi';

/**
 * El desplegable del buscador tiene que mostrar la MISMA informacion que la
 * card del catalogo. Dos defectos que arreglan estos tests (BAL-2998):
 *
 *  1. La inicial no se mapeaba. El backend manda `hook.initial_percent` y
 *     `hook.initial_amount`, y el mapeo los descartaba: el usuario veia
 *     "S/172/mes x 12 meses" sin enterarse de que habia S/210 de inicial.
 *
 *  2. El plazo no se convertia a la frecuencia de pago. La card divide por 4
 *     en semanal (ProductCard.tsx:316-319), asi que decia 6 donde el buscador
 *     decia 24.
 */

function mockFetch(items: unknown[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items }),
  }) as unknown as typeof fetch;
}

const CON_INICIAL = {
  id: 1,
  name: 'iPad 11',
  slug: 'ipad-11',
  pricing: {
    final_price: 2100,
    available_terms: [6, 12, 18, 24, 36],
    hook: { monthly_price: 172, term_months: 12, initial_percent: 10, initial_amount: 210 },
  },
};

const SIN_INICIAL = {
  id: 2,
  name: 'iPad 10ma',
  slug: 'ipad-10',
  pricing: {
    final_price: 1500,
    available_terms: [6, 12, 18, 24],
    hook: { monthly_price: 82, term_months: 24, initial_percent: 0, initial_amount: 0 },
  },
};

describe('searchProductSuggestions — inicial del hook', () => {
  it('mapea el monto y el porcentaje de la inicial', async () => {
    mockFetch([CON_INICIAL]);
    const [s] = await searchProductSuggestions('copia-home', 'ipad');
    expect(s.hookInitialAmount).toBe(210);
    expect(s.hookInitialPercent).toBe(10);
  });

  // Igual que la card (catalogApi.ts:711-712): 0 se normaliza a undefined para
  // que el render distinga "sin inicial" de "no vino el dato".
  it('deja undefined cuando la inicial es 0', async () => {
    mockFetch([SIN_INICIAL]);
    const [s] = await searchProductSuggestions('copia-home', 'ipad');
    expect(s.hookInitialAmount).toBeUndefined();
    expect(s.hookInitialPercent).toBeUndefined();
  });

  it('no rompe si el hook no trae los campos', async () => {
    mockFetch([
      { id: 3, name: 'X', slug: 'x', pricing: { final_price: 100, hook: { monthly_price: 10 } } },
    ]);
    const [s] = await searchProductSuggestions('home', 'xx');
    expect(s.hookInitialAmount).toBeUndefined();
    expect(s.quotaMonthly).toBe(10);
  });

  // Regresion de BAL-2983: el plazo del hook se sigue prefiriendo al maximo.
  it('conserva hookTermMonths (BAL-2983)', async () => {
    mockFetch([CON_INICIAL]);
    const [s] = await searchProductSuggestions('copia-home', 'ipad');
    expect(s.hookTermMonths).toBe(12);
    expect(s.maxTermMonths).toBe(36);
  });

  // `/products` manda initial_percent pero NO initial_amount — verificado
  // contra produccion. Sin derivarlo, el desplegable decia "sin inicial" en un
  // producto que la card mostraba con "inicial S/210".
  // La inicial se redondea al MULTIPLO DE 10 hacia arriba, no al entero mas
  // cercano — misma formula que `calculateQuotaWithInitial` (catalog.ts:120).
  // Los dos casos salen de produccion.
  it.each([
    ['iPad 11 (copia-home)', 2099, 10, 210], // 209.9 -> 210
    ['Galaxy A57 (family-farms-b)', 2100, 25, 530], // 525 -> 530
  ])('deriva el monto en %s', async (_caso, final_price, initial_percent, esperado) => {
    mockFetch([
      {
        id: 5,
        name: 'Producto',
        slug: 'p',
        pricing: {
          final_price,
          available_terms: [12],
          hook: { monthly_price: 172, term_months: 12, initial_percent },
        },
      },
    ]);
    const [s] = await searchProductSuggestions('copia-home', 'prod');
    expect(s.hookInitialAmount).toBe(esperado);
  });

  it('no inventa monto si el porcentaje es 0', async () => {
    mockFetch([
      {
        id: 6,
        name: 'X',
        slug: 'x',
        pricing: { final_price: 2100, hook: { monthly_price: 82, initial_percent: 0 } },
      },
    ]);
    const [s] = await searchProductSuggestions('home', 'xx');
    expect(s.hookInitialAmount).toBeUndefined();
  });

  it('mapea la frecuencia de pago', async () => {
    mockFetch([
      {
        id: 4,
        name: 'Galaxy A57',
        slug: 'a57',
        pricing: {
          final_price: 2120,
          available_terms: [24],
          hook: { monthly_price: 71, term_months: 24, initial_percent: 25, payment_frequency: 'semanal' },
        },
      },
    ]);
    const [s] = await searchProductSuggestions('family-farms-baldecash-b', 'gala');
    expect(s.paymentFrequency).toBe('semanal');
  });
});

/**
 * La card convierte el plazo a la frecuencia nativa (ProductCard.tsx:316-319).
 * El buscador mostraba siempre los meses y por eso decia 24 donde la card
 * decia 6 en las landings de pago semanal.
 */
describe('termInFrequency', () => {
  it('divide por 4 en semanal', () => {
    expect(termInFrequency(24, 'semanal')).toBe(6);
  });

  it('divide por 2 en quincenal', () => {
    expect(termInFrequency(24, 'quincenal')).toBe(12);
  });

  it('deja el plazo tal cual en mensual', () => {
    expect(termInFrequency(24, 'mensual')).toBe(24);
  });

  it('sin frecuencia se comporta como mensual', () => {
    expect(termInFrequency(24, undefined)).toBe(24);
  });

  // Redondea igual que la card (Math.round), no floor.
  it('redondea como la card', () => {
    expect(termInFrequency(18, 'semanal')).toBe(5); // 4.5 -> 5
  });
});

/**
 * El desplegable lista CADA color/variante de la familia por separado
 * (MacBook Neo Silver y MacBook Neo Indigo como dos opciones). La grilla del
 * catalogo agrupa por familia; las sugerencias le piden al backend que no
 * agrupe con `group_families=false` (BAL-4509).
 */
describe('searchProductSuggestions — cada color por separado', () => {
  it('pide al backend que no agrupe por familia', async () => {
    mockFetch([]);
    await searchProductSuggestions('home', 'neo');
    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0] as string, 'http://x');
    expect(url.pathname).toContain('/public/landing/home/products');
    expect(url.searchParams.get('q')).toBe('neo');
    expect(url.searchParams.get('group_families')).toBe('false');
  });

  it('devuelve una sugerencia por cada color que manda el backend', async () => {
    mockFetch([
      { id: 1309, name: 'MacBook Neo Silver', slug: 'neo-silver-combo-191', pricing: null },
      { id: 1321, name: 'MacBook Neo Indigo', slug: 'neo-indigo-combo-189', pricing: null },
    ]);
    const res = await searchProductSuggestions('home', 'neo');
    expect(res.map((s) => s.slug)).toEqual(['neo-silver-combo-191', 'neo-indigo-combo-189']);
  });
});
