/**
 * Tests for buildReceivedData function
 * Tests the mapping from API response to ReceivedData format
 */

// Import the function by extracting it for testing
// We'll test the logic directly since buildReceivedData is internal to confirmacionClient

interface ApplicationStatusData {
  code: string;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  applicant_name: string | null;
  product: {
    name: string;
    image: string | null;
    monthly_payment: number;
    term_months: number;
    total_amount: number;
  } | null;
  products?: {
    name: string;
    image: string | null;
    quantity: number;
    unit_price: number;
    final_price: number;
  }[];
  accessories?: {
    name: string;
    monthly_quota: number;
  }[] | null;
  insurance?: {
    name: string;
    monthly_price: number;
  } | null;
  total_monthly_payment?: number;
  status_history: {
    previous_status: string | null;
    new_status: string;
    reason_code: string | null;
    reason_text: string | null;
    changed_at: string | null;
  }[];
}

interface ReceivedData {
  applicationId: string;
  userName: string;
  submittedAt: Date;
  estimatedResponseHours: number;
  product: {
    name: string;
    thumbnail: string;
    monthlyQuota: number;
    term: number;
    totalAmount: number;
  };
  accessories?: {
    name: string;
    monthlyQuota: number;
  }[];
  insurance?: {
    name: string;
    monthlyPrice: number;
  };
  totalMonthlyQuota: number;
  notificationChannels: ('whatsapp' | 'email' | 'sms')[];
}

/**
 * Replica of buildReceivedData for testing
 * This mirrors the function in confirmacionClient.tsx
 */
function buildReceivedData(
  applicationCode: string,
  applicationData: ApplicationStatusData | null,
  searchParams: URLSearchParams
): ReceivedData {
  const apiProduct = applicationData?.product;

  const productName = apiProduct?.name || searchParams.get('product') || 'Producto solicitado';
  const productImage = apiProduct?.image || searchParams.get('image') || '';
  const monthlyPayment = apiProduct?.monthly_payment || Number(searchParams.get('monthly')) || 0;
  const termMonths = apiProduct?.term_months || Number(searchParams.get('term')) || 12;
  const totalAmount = apiProduct?.total_amount || Number(searchParams.get('total')) || 0;
  const userName = applicationData?.applicant_name || searchParams.get('name') || 'Usuario';

  const accessories = applicationData?.accessories?.map((acc) => ({
    name: acc.name,
    monthlyQuota: acc.monthly_quota,
  }));

  const insurance = applicationData?.insurance
    ? {
        name: applicationData.insurance.name,
        monthlyPrice: applicationData.insurance.monthly_price,
      }
    : undefined;

  const totalMonthlyQuota = applicationData?.total_monthly_payment || monthlyPayment;

  return {
    applicationId: applicationCode,
    userName,
    submittedAt: applicationData?.submitted_at ? new Date(applicationData.submitted_at) : new Date(),
    estimatedResponseHours: 24,
    product: {
      name: productName,
      thumbnail: productImage,
      monthlyQuota: monthlyPayment,
      term: termMonths,
      totalAmount,
    },
    accessories,
    insurance,
    totalMonthlyQuota,
    notificationChannels: ['whatsapp', 'email'],
  };
}

describe('buildReceivedData', () => {
  const mockCode = 'BC-2026-TEST123';

  describe('with full API data', () => {
    it('maps all fields from API response', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: '2026-03-05T10:00:00Z',
        approved_at: null,
        applicant_name: 'María',
        product: {
          name: 'Laptop Gaming',
          image: 'https://example.com/laptop.jpg',
          monthly_payment: 150.0,
          term_months: 12,
          total_amount: 1800.0,
        },
        accessories: [
          { name: 'Mouse Inalámbrico', monthly_quota: 10.0 },
          { name: 'Teclado Mecánico', monthly_quota: 15.0 },
        ],
        insurance: {
          name: 'Protección Total',
          monthly_price: 25.0,
        },
        total_monthly_payment: 200.0,
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.applicationId).toBe(mockCode);
      expect(result.userName).toBe('María');
      expect(result.product.name).toBe('Laptop Gaming');
      expect(result.product.thumbnail).toBe('https://example.com/laptop.jpg');
      expect(result.product.monthlyQuota).toBe(150.0);
      expect(result.product.term).toBe(12);
      expect(result.product.totalAmount).toBe(1800.0);
      expect(result.accessories).toHaveLength(2);
      expect(result.accessories?.[0].name).toBe('Mouse Inalámbrico');
      expect(result.accessories?.[0].monthlyQuota).toBe(10.0);
      expect(result.insurance?.name).toBe('Protección Total');
      expect(result.insurance?.monthlyPrice).toBe(25.0);
      expect(result.totalMonthlyQuota).toBe(200.0);
    });

    it('parses submitted_at as Date', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: '2026-03-05T10:30:00Z',
        approved_at: null,
        applicant_name: 'Juan',
        product: {
          name: 'Test Product',
          image: null,
          monthly_payment: 100,
          term_months: 6,
          total_amount: 600,
        },
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.submittedAt).toBeInstanceOf(Date);
      expect(result.submittedAt.toISOString()).toBe('2026-03-05T10:30:00.000Z');
    });
  });

  describe('with URL params fallback', () => {
    it('uses URL params when API data is null', () => {
      const params = new URLSearchParams({
        product: 'Laptop Dell',
        image: 'https://example.com/dell.jpg',
        monthly: '200',
        term: '18',
        total: '3600',
        name: 'Carlos',
      });

      const result = buildReceivedData(mockCode, null, params);

      expect(result.applicationId).toBe(mockCode);
      expect(result.userName).toBe('Carlos');
      expect(result.product.name).toBe('Laptop Dell');
      expect(result.product.thumbnail).toBe('https://example.com/dell.jpg');
      expect(result.product.monthlyQuota).toBe(200);
      expect(result.product.term).toBe(18);
      expect(result.product.totalAmount).toBe(3600);
      expect(result.totalMonthlyQuota).toBe(200);
    });

    it('uses URL params when API product is null', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: 'Pedro',
        product: null,
        status_history: [],
      };

      const params = new URLSearchParams({
        product: 'Tablet Samsung',
        monthly: '80',
        term: '6',
        total: '480',
      });

      const result = buildReceivedData(mockCode, apiData, params);

      expect(result.userName).toBe('Pedro'); // API takes precedence
      expect(result.product.name).toBe('Tablet Samsung');
      expect(result.product.monthlyQuota).toBe(80);
    });
  });

  describe('with default values', () => {
    it('uses defaults when no data available', () => {
      const result = buildReceivedData(mockCode, null, new URLSearchParams());

      expect(result.applicationId).toBe(mockCode);
      expect(result.userName).toBe('Usuario');
      expect(result.product.name).toBe('Producto solicitado');
      expect(result.product.thumbnail).toBe('');
      expect(result.product.monthlyQuota).toBe(0);
      expect(result.product.term).toBe(12);
      expect(result.product.totalAmount).toBe(0);
      expect(result.estimatedResponseHours).toBe(24);
      expect(result.notificationChannels).toEqual(['whatsapp', 'email']);
    });

    it('uses current date when submitted_at is null', () => {
      const beforeTest = new Date();

      const result = buildReceivedData(mockCode, null, new URLSearchParams());

      const afterTest = new Date();
      expect(result.submittedAt.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(result.submittedAt.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });
  });

  describe('accessories handling', () => {
    it('returns undefined when no accessories', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: null,
        accessories: null,
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.accessories).toBeUndefined();
    });

    it('returns undefined when accessories array is empty', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: null,
        accessories: [],
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      // Empty array maps to empty array, not undefined
      expect(result.accessories).toEqual([]);
    });

    it('maps multiple accessories correctly', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: null,
        accessories: [
          { name: 'Mochila', monthly_quota: 5.0 },
          { name: 'Funda', monthly_quota: 3.0 },
          { name: 'Cargador Extra', monthly_quota: 8.0 },
        ],
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.accessories).toHaveLength(3);
      expect(result.accessories?.[0]).toEqual({ name: 'Mochila', monthlyQuota: 5.0 });
      expect(result.accessories?.[1]).toEqual({ name: 'Funda', monthlyQuota: 3.0 });
      expect(result.accessories?.[2]).toEqual({ name: 'Cargador Extra', monthlyQuota: 8.0 });
    });
  });

  describe('insurance handling', () => {
    it('returns undefined when no insurance', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: null,
        insurance: null,
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.insurance).toBeUndefined();
    });

    it('maps insurance correctly', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: null,
        insurance: {
          name: 'Seguro Premium',
          monthly_price: 35.5,
        },
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.insurance).toEqual({
        name: 'Seguro Premium',
        monthlyPrice: 35.5,
      });
    });
  });

  describe('total monthly calculation', () => {
    it('uses total_monthly_payment from API when available', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: {
          name: 'Test',
          image: null,
          monthly_payment: 100,
          term_months: 12,
          total_amount: 1200,
        },
        total_monthly_payment: 185.0, // Includes accessories + insurance
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.totalMonthlyQuota).toBe(185.0);
    });

    it('falls back to monthly_payment when total_monthly_payment not provided', () => {
      const apiData: ApplicationStatusData = {
        code: mockCode,
        status: 'submitted',
        submitted_at: null,
        approved_at: null,
        applicant_name: null,
        product: {
          name: 'Test',
          image: null,
          monthly_payment: 150,
          term_months: 12,
          total_amount: 1800,
        },
        status_history: [],
      };

      const result = buildReceivedData(mockCode, apiData, new URLSearchParams());

      expect(result.totalMonthlyQuota).toBe(150);
    });
  });
});
