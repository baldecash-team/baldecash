import { transformLandingData } from '../landingApi';
import type { LandingHeroResponse } from '../landingApi';

function baseResponse(heroContentConfig: Record<string, unknown>): LandingHeroResponse {
  return {
    landing: {
      hero_title: 'Título',
      hero_subtitle: 'Sub',
      hero_cta_text: 'Ir',
      hero_cta_url: 'https://x.com',
      hero_cta_url_params: '',
      banner_images: [{ url: 'https://s3/desktop.webp' }],
    },
    components: [
      { component_code: 'hero', is_visible: true, content_config: heroContentConfig },
    ],
  } as unknown as LandingHeroResponse;
}

describe('transformLandingData — hero flags', () => {
  it('defaults a false cuando las claves están ausentes', () => {
    const { heroContent } = transformLandingData(baseResponse({}));
    expect(heroContent?.hideOverlay).toBe(false);
    expect(heroContent?.imageIsCta).toBe(false);
    expect(heroContent?.hideContent).toBe(false);
  });

  it('mapea hide_overlay/image_is_cta/hide_content = true a camelCase', () => {
    const { heroContent } = transformLandingData(
      baseResponse({ hide_overlay: true, image_is_cta: true, hide_content: true }),
    );
    expect(heroContent?.hideOverlay).toBe(true);
    expect(heroContent?.imageIsCta).toBe(true);
    expect(heroContent?.hideContent).toBe(true);
  });

  it('trata valores no-booleanos como false (solo true explícito activa)', () => {
    const { heroContent } = transformLandingData(baseResponse({ hide_overlay: 'yes' }));
    expect(heroContent?.hideOverlay).toBe(false);
  });
});
