import {
  isDemoLanding,
  generateDemoApplicationCode,
  buildDemoApplication,
  extractApplicantName,
  saveDemoApplication,
  readDemoApplication,
  clearDemoApplication,
} from '../demoApplication';

describe('isDemoLanding', () => {
  it('marks landings whose slug ends in -demo', () => {
    expect(isDemoLanding('cibertec-express-demo')).toBe(true);
  });

  it('leaves the real landing alone', () => {
    expect(isDemoLanding('cibertec-express')).toBe(false);
  });

  it('does not match -demo in the middle of the slug', () => {
    expect(isDemoLanding('demoseguros-121')).toBe(false);
  });

  it('tolerates a missing landing', () => {
    expect(isDemoLanding(undefined)).toBe(false);
    expect(isDemoLanding(null)).toBe(false);
  });
});

describe('generateDemoApplicationCode', () => {
  it('keeps the shape of a real code but can never collide with one', () => {
    const code = generateDemoApplicationCode();
    expect(code).toMatch(/^SOL-DEMO-[0-9A-F]{8}$/);
  });

  it('is different on every call', () => {
    const codes = new Set(Array.from({ length: 50 }, generateDemoApplicationCode));
    expect(codes.size).toBeGreaterThan(45);
  });
});

describe('extractApplicantName', () => {
  it('joins first and last name', () => {
    expect(
      extractApplicantName({ nombres: 'Ana', apellido_paterno: 'Quispe' })
    ).toBe('Ana Quispe');
  });

  it('prefers an explicit full name', () => {
    expect(
      extractApplicantName({ nombre_completo: 'Ana Quispe Rojas', nombres: 'Ana' })
    ).toBe('Ana Quispe Rojas');
  });

  it('returns null when the form has no name', () => {
    expect(extractApplicantName({ email: 'a@b.com' })).toBe(null);
    expect(extractApplicantName(undefined)).toBe(null);
  });
});

describe('buildDemoApplication', () => {
  const product = {
    name: 'Laptop Lenovo V15',
    brand: 'Lenovo',
    price: 2400,
    monthlyPayment: 220,
    months: 12,
    term: 48,
    paymentFrequency: 'semanal',
    image: 'https://cdn/laptop.webp',
    initialPercent: 10,
    initialAmount: 240,
    specs: { processor: 'i5', ram: '8GB', storage: '512GB' },
    variantId: '77',
    colorName: 'Gris',
    colorHex: '#888888',
  };

  const submittedAt = new Date('2026-08-10T15:00:00.000Z');

  function build(overrides = {}) {
    return buildDemoApplication({
      code: 'SOL-DEMO-ABCD1234',
      products: [product],
      accessories: [{ name: 'Mochila', monthlyQuota: 15 }],
      insurances: [{ name: 'Protección Total', monthlyPrice: 30 }],
      coupon: { code: 'AMIGO10' },
      discountAmount: 10,
      totalMonthlyPayment: 255,
      formData: { nombres: 'Ana', apellido_paterno: 'Quispe' },
      submittedAt,
      ...overrides,
    });
  }

  it('produces a pending application dated at submit time', () => {
    const app = build();
    expect(app.code).toBe('SOL-DEMO-ABCD1234');
    expect(app.status).toBe('pending');
    expect(app.submitted_at).toBe(submittedAt.toISOString());
    expect(app.applicant_name).toBe('Ana Quispe');
    expect(app.status_history).toEqual([
      {
        previous_status: null,
        new_status: 'pending',
        reason_code: null,
        reason_text: null,
        changed_at: submittedAt.toISOString(),
      },
    ]);
  });

  it('maps the selected product the way the status endpoint would', () => {
    const app = build();
    expect(app.products).toEqual([
      {
        name: 'Laptop Lenovo V15',
        brand: 'Lenovo',
        image: 'https://cdn/laptop.webp',
        quantity: 1,
        unit_price: 2400,
        final_price: 2400,
        monthly_quota: 220,
        specs: { processor: 'i5', ram: '8GB', storage: '512GB' },
        variant: { id: 77, color_name: 'Gris', color_hex: '#888888' },
        initial_payment_percent: 10,
        initial_payment: 240,
      },
    ]);
  });

  /**
   * /confirmacion deriva los meses con `displayMonths(term, payment_frequency)`.
   * Si mandáramos el plazo ya convertido a meses, un plan semanal de 48 cuotas
   * se mostraría como 48 meses.
   */
  it('keeps the term in its native frequency', () => {
    const app = build();
    expect(app.term).toBe(48);
    expect(app.payment_frequency).toBe('semanal');
  });

  it('carries add-ons, coupon and the discounted total', () => {
    const app = build();
    expect(app.accessories).toEqual([{ name: 'Mochila', monthly_quota: 15 }]);
    expect(app.insurances).toEqual([{ name: 'Protección Total', monthly_price: 30 }]);
    expect(app.insurance).toEqual({ name: 'Protección Total', monthly_price: 30 });
    expect(app.coupon).toEqual({ code: 'AMIGO10', discount_amount: 10 });
    expect(app.total_monthly_payment).toBe(255);
  });

  it('leaves optional blocks empty when nothing was added', () => {
    const app = build({ accessories: [], insurances: [], coupon: null, discountAmount: 0 });
    expect(app.accessories).toEqual([]);
    expect(app.insurances).toEqual([]);
    expect(app.insurance).toBe(null);
    expect(app.coupon).toBe(null);
  });

  it('falls back to months when the product has no raw term', () => {
    const { term: _term, paymentFrequency: _freq, ...monthly } = product;
    const app = build({ products: [monthly] });
    expect(app.term).toBe(12);
    expect(app.payment_frequency).toBeUndefined();
  });
});

describe('demo application storage', () => {
  const landing = 'cibertec-express-demo';
  const app = buildDemoApplication({
    code: 'SOL-DEMO-11112222',
    products: [{ name: 'Laptop', price: 1000, monthlyPayment: 100, months: 12 }],
    totalMonthlyPayment: 100,
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips the application through sessionStorage', () => {
    saveDemoApplication(landing, app);
    expect(readDemoApplication(landing)).toEqual(app);
  });

  it('only returns the application when the code matches', () => {
    saveDemoApplication(landing, app);
    expect(readDemoApplication(landing, 'SOL-DEMO-11112222')).toEqual(app);
    expect(readDemoApplication(landing, 'SOL-DEMO-99998888')).toBe(null);
  });

  it('returns null when there is nothing stored', () => {
    expect(readDemoApplication(landing)).toBe(null);
  });

  it('returns null on corrupted storage instead of throwing', () => {
    sessionStorage.setItem(`baldecash-${landing}-demo-application`, 'no-json');
    expect(readDemoApplication(landing)).toBe(null);
  });

  it('clears the stored application', () => {
    saveDemoApplication(landing, app);
    clearDemoApplication(landing);
    expect(readDemoApplication(landing)).toBe(null);
  });
});
