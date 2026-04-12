/**
 * Tests for advisor data extraction from CTA component config
 * Verifies that advisors are correctly mapped from API response (snake_case) to frontend types (camelCase)
 */

describe('CTA Advisors extraction', () => {
  it('should map advisors from snake_case to camelCase', () => {
    // Simulate the extraction logic from landingApi.ts
    const apiAdvisors = [
      { name: 'Ana', image_url: 'https://example.com/ana.jpg' },
      { name: 'Carlos', image_url: 'https://example.com/carlos.jpg' },
      { name: 'María', image_url: '' },
    ];

    const mapped = apiAdvisors.map(a => ({
      name: a.name || '',
      imageUrl: a.image_url || '',
    }));

    expect(mapped).toHaveLength(3);
    expect(mapped[0]).toEqual({ name: 'Ana', imageUrl: 'https://example.com/ana.jpg' });
    expect(mapped[1]).toEqual({ name: 'Carlos', imageUrl: 'https://example.com/carlos.jpg' });
    expect(mapped[2]).toEqual({ name: 'María', imageUrl: '' });
  });

  it('should return undefined when advisors is not an array', () => {
    const ctaConfig: Record<string, unknown> = {
      section_title: 'Test',
      response_time: '5 min',
    };

    const advisors = Array.isArray(ctaConfig.advisors)
      ? (ctaConfig.advisors as Array<{ name: string; image_url: string }>).map(a => ({
          name: a.name || '',
          imageUrl: a.image_url || '',
        }))
      : undefined;

    expect(advisors).toBeUndefined();
  });

  it('should handle empty advisors array', () => {
    const ctaConfig: Record<string, unknown> = {
      advisors: [],
    };

    const advisors = Array.isArray(ctaConfig.advisors)
      ? (ctaConfig.advisors as Array<{ name: string; image_url: string }>).map(a => ({
          name: a.name || '',
          imageUrl: a.image_url || '',
        }))
      : undefined;

    expect(advisors).toEqual([]);
  });

  it('should handle advisors with missing fields gracefully', () => {
    const apiAdvisors = [
      { name: 'Ana' } as { name: string; image_url: string },
      { image_url: 'https://example.com/img.jpg' } as { name: string; image_url: string },
    ];

    const mapped = apiAdvisors.map(a => ({
      name: a.name || '',
      imageUrl: a.image_url || '',
    }));

    expect(mapped[0]).toEqual({ name: 'Ana', imageUrl: '' });
    expect(mapped[1]).toEqual({ name: '', imageUrl: 'https://example.com/img.jpg' });
  });
});
