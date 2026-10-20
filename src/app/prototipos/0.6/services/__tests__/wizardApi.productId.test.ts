import { getWizardConfig } from '../wizardApi';

describe('getWizardConfig · product_id del reparto parejo', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ steps: [] }) });
  beforeEach(() => { fetchMock.mockClear(); (global as any).fetch = fetchMock; });

  it('manda product_id cuando hay equipo elegido', async () => {
    await getWizardConfig('home', null, 'uuid-1', { productId: 518 });
    expect(String(fetchMock.mock.calls[0][0])).toContain('product_id=518');
  });

  it('no manda product_id sin equipo', async () => {
    await getWizardConfig('home', null, 'uuid-1');
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('product_id');
  });

  it('no manda product_id en vista previa', async () => {
    await getWizardConfig('home', 'llave', 'uuid-1', { productId: 518 });
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('product_id');
  });
});
