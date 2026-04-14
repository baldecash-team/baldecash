export type VariantType = 'premium' | 'balanced' | 'lite';

export interface VariantConfig {
  name: string;
  description: string;
  useLenis: boolean;
  useVideoHero: boolean;
  useCanvasScrub: boolean;
  useVideoBackgrounds: boolean;
  useGSAPScrub: boolean;
  useGSAPToggle: boolean;
  useParallax: boolean;
  parallaxIntensity: number;
  staggerDelay: number;
  revealDuration: number;
  revealEase: string;
  heroHeight: string;
  assets: {
    heroVideo?: string;
    heroVideoWebm?: string;
    heroPoster?: string;
    heroImage: string;
    heroFrames?: string[];
    pdpFeatureVideo?: string;
    sequenceFrames?: string[];
  };
}

const IMG_BASE = '/images/macbook-neo';
const IMG_V3 = '/images/macbook-neo-v3';
const VID_BASE = '/videos/macbook-neo';

function generateFrameUrls(folder: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(4, '0');
    return `${IMG_V3}/sequences/${folder}/frame_${num}.webp`;
  });
}

export const variants: Record<VariantType, VariantConfig> = {
  premium: {
    name: 'Premium',
    description: 'Video scrubbing + canvas 360° + GSAP completo',
    useLenis: true,
    useVideoHero: true,
    useCanvasScrub: true,
    useVideoBackgrounds: true,
    useGSAPScrub: true,
    useGSAPToggle: true,
    useParallax: true,
    parallaxIntensity: -12,
    staggerDelay: 0.06,
    revealDuration: 0.85,
    revealEase: 'power2.out',
    heroHeight: '500vh',
    assets: {
      heroVideo: `${VID_BASE}/hero.mp4`,
      heroVideoWebm: `${VID_BASE}/hero.webm`,
      heroPoster: `${IMG_V3}/hero-poster.jpg`,
      heroImage: `${IMG_BASE}/hero_endframe_2x.jpg`,
      heroFrames: generateFrameUrls('hero', 180),
      pdpFeatureVideo: `${VID_BASE}/pdp-feature.mp4`,
      sequenceFrames: generateFrameUrls('product-animation', 90),
    },
  },
  balanced: {
    name: 'Balanced',
    description: 'Video autoplay + imágenes + GSAP',
    useLenis: true,
    useVideoHero: false,
    useCanvasScrub: false,
    useVideoBackgrounds: false,
    useGSAPScrub: true,
    useGSAPToggle: true,
    useParallax: true,
    parallaxIntensity: -8,
    staggerDelay: 0.06,
    revealDuration: 0.8,
    revealEase: 'power2.out',
    heroHeight: '150vh',
    assets: {
      heroVideo: `${VID_BASE}/hero.mp4`,
      heroPoster: `${IMG_V3}/hero-poster.jpg`,
      heroImage: `${IMG_BASE}/hero_endframe_2x.jpg`,
    },
  },
  lite: {
    name: 'Lite',
    description: 'Solo imágenes + CSS animations',
    useLenis: false,
    useVideoHero: false,
    useCanvasScrub: false,
    useVideoBackgrounds: false,
    useGSAPScrub: false,
    useGSAPToggle: false,
    useParallax: false,
    parallaxIntensity: 0,
    staggerDelay: 0,
    revealDuration: 0.6,
    revealEase: 'ease-out',
    heroHeight: '100vh',
    assets: {
      heroImage: `${IMG_BASE}/hero_endframe_2x.jpg`,
    },
  },
};
