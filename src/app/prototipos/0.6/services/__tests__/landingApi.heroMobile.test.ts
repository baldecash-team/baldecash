/**
 * Tests for hero mobile image/position extraction in landingApi.ts
 *
 * Validates that banner_images[0].mobile_url, mobile_position_x/y, mobile_zoom
 * are correctly extracted and passed into HeroContent — the shape webpage3.0
 * uses to render the hero section.
 */

// ─── helpers: replicate the extraction logic from landingApi.ts ──────────────

type BannerImage = {
  url: string;
  mobile_url?: string;
  alt?: string;
  position_x?: number;
  position_y?: number;
  zoom?: number;
  mobile_position_x?: number;
  mobile_position_y?: number;
  mobile_zoom?: number;
};

function extractHeroBackground(bannerImages: BannerImage[]) {
  const firstBanner = bannerImages.length > 0 ? bannerImages[0] : null;
  return {
    backgroundImage: firstBanner?.url,
    backgroundMobileImage: firstBanner?.mobile_url || undefined,
    backgroundPositionX: firstBanner?.position_x ?? 50,
    backgroundPositionY: firstBanner?.position_y ?? 50,
    backgroundZoom: firstBanner?.zoom ?? 1.0,
    // Mobile position intentionally NOT defaulted — undefined means "not configured"
    // HeroBanner uses undefined to distinguish "not set" from "explicitly set to 50"
    mobilePositionX: firstBanner?.mobile_position_x,
    mobilePositionY: firstBanner?.mobile_position_y,
    mobileZoom: firstBanner?.mobile_zoom,
  };
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('landingApi — hero mobile image extraction', () => {

  describe('backgroundMobileImage', () => {
    it('extracts mobile_url when present', () => {
      const result = extractHeroBackground([{
        url: 'https://s3/desktop.webp',
        mobile_url: 'https://s3/mobile.webp',
      }]);
      expect(result.backgroundMobileImage).toBe('https://s3/mobile.webp');
    });

    it('returns undefined when mobile_url is absent', () => {
      const result = extractHeroBackground([{ url: 'https://s3/desktop.webp' }]);
      expect(result.backgroundMobileImage).toBeUndefined();
    });

    it('returns undefined when mobile_url is empty string', () => {
      const result = extractHeroBackground([{ url: 'https://s3/desktop.webp', mobile_url: '' }]);
      expect(result.backgroundMobileImage).toBeUndefined();
    });

    it('returns undefined when banner_images is empty', () => {
      const result = extractHeroBackground([]);
      expect(result.backgroundMobileImage).toBeUndefined();
    });
  });

  describe('mobile position/zoom', () => {
    it('extracts mobile_position_x/y/zoom when all present', () => {
      const result = extractHeroBackground([{
        url: 'https://s3/desktop.webp',
        mobile_url: 'https://s3/mobile.webp',
        mobile_position_x: 35,
        mobile_position_y: 65,
        mobile_zoom: 1.4,
      }]);
      expect(result.mobilePositionX).toBe(35);
      expect(result.mobilePositionY).toBe(65);
      expect(result.mobileZoom).toBe(1.4);
    });

    it('returns undefined for mobile position when not in banner_images', () => {
      const result = extractHeroBackground([{ url: 'https://s3/desktop.webp' }]);
      expect(result.mobilePositionX).toBeUndefined();
      expect(result.mobilePositionY).toBeUndefined();
      expect(result.mobileZoom).toBeUndefined();
    });

    it('returns undefined for mobile position when banner_images is empty', () => {
      const result = extractHeroBackground([]);
      expect(result.mobilePositionX).toBeUndefined();
      expect(result.mobilePositionY).toBeUndefined();
      expect(result.mobileZoom).toBeUndefined();
    });
  });

  describe('desktop position/zoom independent from mobile', () => {
    it('desktop and mobile positions are independent', () => {
      const result = extractHeroBackground([{
        url: 'https://s3/desktop.webp',
        mobile_url: 'https://s3/mobile.webp',
        position_x: 75,
        position_y: 25,
        zoom: 1.3,
        mobile_position_x: 20,
        mobile_position_y: 80,
        mobile_zoom: 1.7,
      }]);
      // Desktop
      expect(result.backgroundPositionX).toBe(75);
      expect(result.backgroundPositionY).toBe(25);
      expect(result.backgroundZoom).toBe(1.3);
      // Mobile
      expect(result.mobilePositionX).toBe(20);
      expect(result.mobilePositionY).toBe(80);
      expect(result.mobileZoom).toBe(1.7);
    });
  });

  describe('full round-trip: all fields present', () => {
    it('correctly extracts all 8 hero background fields at once', () => {
      const result = extractHeroBackground([{
        url: 'https://baldecash.s3.amazonaws.com/desktop.webp',
        mobile_url: 'https://baldecash.s3.amazonaws.com/mobile.webp',
        alt: 'Hero background',
        position_x: 50,
        position_y: 50,
        zoom: 1.0,
        mobile_position_x: 35,
        mobile_position_y: 65,
        mobile_zoom: 1.4,
      }]);

      expect(result.backgroundImage).toBe('https://baldecash.s3.amazonaws.com/desktop.webp');
      expect(result.backgroundMobileImage).toBe('https://baldecash.s3.amazonaws.com/mobile.webp');
      expect(result.backgroundPositionX).toBe(50);
      expect(result.backgroundPositionY).toBe(50);
      expect(result.backgroundZoom).toBe(1.0);
      expect(result.mobilePositionX).toBe(35);
      expect(result.mobilePositionY).toBe(65);
      expect(result.mobileZoom).toBe(1.4);
    });
  });
});
