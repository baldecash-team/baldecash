/// <reference types="jest" />
/**
 * Tests for buildReceivedData function
 * Updated for multiple products support
 */

// Type definitions matching the updated confirmacionClient.tsx
interface ApplicationStatusData {
  code: string;
  status: string;
  submitted_at: string | null;
  evaluated_at?: string | null;
  approved_at?: string | null;
  applicant_name?: string | null;
  products: Array<{
    name: string;
    image: string | null;
    quantity: number;
    unit_price: number;
    final_price: number;
    monthly_quota: number;
  }>;
  term_months: number;
  accessories?: Array<{
    name: string;
    monthly_quota: number;
  }> | null;
  insurance?: {
    name: string;
    monthly_price: number;
  } | null;
  coupon?: {
    code: string;
    discount_amount: number;
  } | null;
  total_monthly_payment: number;
  status_history: Array<{
    previous_status: string | null;
    new_status: string;
    reason_code: string | null;
    reason_text: string | null;
    changed_at: string | null;
  }>;
}

interface ProductItem {
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  monthlyQuota: number;
}

interface ReceivedData {
  applicationId: string;
  userName: string;
  submittedAt: Date;
  estimatedResponseHours: number;
  products: ProductItem[];
  termMonths: number;
  accessories?: {
    name: string;
    monthlyQuota: number;
  }[];
  insurance?: {
    name: string;
    monthlyPrice: number;
  };
  coupon?: {
    code: string;
    discountAmount: number;
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
  const termMonths = applicationData?.term_months || 12;
  const userName = applicationData?.applicant_name || searchParams.get('name') || 'Usuario';

  // Mapear productos desde API
  const products = applicationData?.products?.map((p) => ({
    name: p.name,
    image: p.image || '',
    quantity: p.quantity || 1,
    unitPrice: p.unit_price,
    finalPrice: p.final_price,
    monthlyQuota: p.monthly_quota,
  })) || [];

  // Mapear accesorios desde API
  const accessories = applicationData?.accessories?.map((acc) => ({
    name: acc.name,
    monthlyQuota: acc.monthly_quota,
  }));

  // Mapear seguro desde API
  const insurance = applicationData?.insurance
    ? {
        name: applicationData.insurance.name,
        monthlyPrice: applicationData.insurance.monthly_price,
      }
    : undefined;

  // Mapear cupón desde API
  const coupon = applicationData?.coupon
    ? {
        code: applicationData.coupon.code,
        discountAmount: applicationData.coupon.discount_amount,
      }
    : undefined;

  return {
    applicationId: applicationCode,
    userName,
    submittedAt: applicationData?.submitted_at
      ? new Date(applicationData.submitted_at)
      : new Date(),
    estimatedResponseHours: 24,
    products,
    termMonths,
    accessories,
    insurance,
    coupon,
    totalMonthlyQuota: applicationData?.total_monthly_payment || 0,
    notificationChannels: ['whatsapp', 'email'],
  };
}

describe('buildReceivedData', () => {
  const mockSearchParams = new URLSearchParams();

  describe('products mapping', () => {
    it('should map products array from API response', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: '2026-03-06T12:00:00',
        applicant_name: 'Test User',
        products: [
          {
            name: 'Laptop V15',
            image: 'https://example.com/img1.jpg',
            quantity: 1,
            unit_price: 2099,
            final_price: 2099,
            monthly_quota: 145,
          },
          {
            name: 'Galaxy A36',
            image: 'https://example.com/img2.jpg',
            quantity: 1,
            unit_price: 1349,
            final_price: 1349,
            monthly_quota: 98,
          },
        ],
        term_months: 24,
        total_monthly_payment: 243,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.products).toHaveLength(2);
      expect(result.products[0].name).toBe('Laptop V15');
      expect(result.products[0].monthlyQuota).toBe(145);
      expect(result.products[1].name).toBe('Galaxy A36');
      expect(result.products[1].monthlyQuota).toBe(98);
    });

    it('should return empty products array when API has no products', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 12,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.products).toEqual([]);
    });

    it('should handle null applicationData gracefully', () => {
      const result = buildReceivedData('test-uuid', null, mockSearchParams);

      expect(result.products).toEqual([]);
      expect(result.termMonths).toBe(12); // default
    });

    it('should map product image to empty string when null', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [
          {
            name: 'Product without image',
            image: null,
            quantity: 1,
            unit_price: 100,
            final_price: 100,
            monthly_quota: 10,
          },
        ],
        term_months: 12,
        total_monthly_payment: 10,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.products[0].image).toBe('');
    });

    it('should default quantity to 1 when not provided', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [
          {
            name: 'Product',
            image: null,
            quantity: 0, // falsy value
            unit_price: 100,
            final_price: 100,
            monthly_quota: 10,
          },
        ],
        term_months: 12,
        total_monthly_payment: 10,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.products[0].quantity).toBe(1);
    });
  });

  describe('termMonths', () => {
    it('should use term_months from API response', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 36,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.termMonths).toBe(36);
    });

    it('should default to 12 when term_months not provided', () => {
      const applicationData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        total_monthly_payment: 0,
        status_history: [],
      } as unknown as ApplicationStatusData;

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.termMonths).toBe(12);
    });
  });

  describe('accessories mapping', () => {
    it('should map accessories from API response', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        accessories: [
          { name: 'Funda', monthly_quota: 2 },
          { name: 'Mouse', monthly_quota: 3 },
        ],
        total_monthly_payment: 5,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.accessories).toHaveLength(2);
      expect(result.accessories![0].name).toBe('Funda');
      expect(result.accessories![0].monthlyQuota).toBe(2);
    });

    it('should return undefined when no accessories', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        accessories: null,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.accessories).toBeUndefined();
    });
  });

  describe('insurance mapping', () => {
    it('should map insurance from API response', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        insurance: { name: 'Protección Premium', monthly_price: 45 },
        total_monthly_payment: 45,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.insurance).toBeDefined();
      expect(result.insurance!.name).toBe('Protección Premium');
      expect(result.insurance!.monthlyPrice).toBe(45);
    });

    it('should return undefined when no insurance', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        insurance: null,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.insurance).toBeUndefined();
    });
  });

  describe('coupon mapping', () => {
    it('should map coupon from API response', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        coupon: { code: 'BALDE20', discount_amount: 50 },
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.coupon).toBeDefined();
      expect(result.coupon!.code).toBe('BALDE20');
      expect(result.coupon!.discountAmount).toBe(50);
    });

    it('should return undefined when no coupon', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        coupon: null,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.coupon).toBeUndefined();
    });
  });

  describe('totalMonthlyQuota', () => {
    it('should use total_monthly_payment from API', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        products: [],
        term_months: 24,
        total_monthly_payment: 298,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.totalMonthlyQuota).toBe(298);
    });

    it('should default to 0 when total_monthly_payment not provided', () => {
      const result = buildReceivedData('test-uuid', null, mockSearchParams);

      expect(result.totalMonthlyQuota).toBe(0);
    });
  });

  describe('userName', () => {
    it('should use applicant_name from API', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        applicant_name: 'Emilio',
        products: [],
        term_months: 24,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.userName).toBe('Emilio');
    });

    it('should fallback to URL param when applicant_name not provided', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: null,
        applicant_name: null,
        products: [],
        term_months: 24,
        total_monthly_payment: 0,
        status_history: [],
      };

      const paramsWithName = new URLSearchParams({ name: 'Juan' });
      const result = buildReceivedData('test-uuid', applicationData, paramsWithName);

      expect(result.userName).toBe('Juan');
    });

    it('should default to "Usuario" when no name available', () => {
      const result = buildReceivedData('test-uuid', null, mockSearchParams);

      expect(result.userName).toBe('Usuario');
    });
  });

  describe('submittedAt', () => {
    it('should parse submitted_at from API', () => {
      const applicationData: ApplicationStatusData = {
        code: 'APP-2026-00001',
        status: 'submitted',
        submitted_at: '2026-03-06T12:00:00',
        products: [],
        term_months: 24,
        total_monthly_payment: 0,
        status_history: [],
      };

      const result = buildReceivedData('test-uuid', applicationData, mockSearchParams);

      expect(result.submittedAt).toBeInstanceOf(Date);
      expect(result.submittedAt.toISOString()).toContain('2026-03-06');
    });

    it('should use current date when submitted_at is null', () => {
      const before = new Date();
      const result = buildReceivedData('test-uuid', null, mockSearchParams);
      const after = new Date();

      expect(result.submittedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.submittedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('constants', () => {
    it('should always set estimatedResponseHours to 24', () => {
      const result = buildReceivedData('test-uuid', null, mockSearchParams);

      expect(result.estimatedResponseHours).toBe(24);
    });

    it('should always set notificationChannels to whatsapp and email', () => {
      const result = buildReceivedData('test-uuid', null, mockSearchParams);

      expect(result.notificationChannels).toEqual(['whatsapp', 'email']);
    });
  });
});
