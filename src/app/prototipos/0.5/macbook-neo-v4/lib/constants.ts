const IMG = '/images/macbook-neo';
const IMG_V3 = '/images/macbook-neo-v3';
const VID = '/videos/macbook-neo';

export const ASSETS = {
  logos: {
    white: `${IMG_V3}/logos/macbook-neo-logo-white.svg`,
    black: `${IMG_V3}/logos/macbook-neo-logo-black.svg`,
  },
  hero: {
    poster: `${IMG_V3}/hero-poster.jpg`,
    fallback: `${IMG}/hero_endframe_2x.jpg`,
    video: `${VID}/hero.mp4`,
    videoWebm: `${VID}/hero.webm`,
  },
  design: `${IMG}/design_endframe_2x.png`,
  display: `${IMG}/dca_display_2x.png`,
  lifestyle: `${IMG}/performance_lifestyle_2x.jpg`,
  colors: {
    silver: `${IMG}/pv_colors_silver_2x.jpg`,
    blush: `${IMG}/pv_colors_blush_2x.jpg`,
    citrus: `${IMG}/pv_colors_citrus_2x.jpg`,
    indigo: `${IMG}/pv_colors_indigo_2x.jpg`,
  },
  highlights: {
    colors: `${IMG}/highlights_colors_2x.jpg`,
    battery: `${IMG}/highlights_battery_2x.jpg`,
    display: `${IMG}/highlights_display_2x.jpg`,
  },
  performance: [
    `${IMG}/performance_hero_1_2x.jpg`,
    `${IMG}/performance_hero_2_2x.jpg`,
    `${IMG}/performance_hero_3_2x.jpg`,
    `${IMG}/performance_hero_4_2x.jpg`,
  ],
  productViews: {
    display: `${IMG}/pv_display_2x.jpg`,
    keyboard: `${IMG}/pv_keyboard_2x.jpg`,
    hero: `${IMG}/pv_hero_2x.jpg`,
  },
  pdpFeatureVideo: `${VID}/pdp-feature.mp4`,
} as const;

export function generateFrameUrls(folder: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(4, '0');
    return `${IMG_V3}/sequences/${folder}/frame_${num}.webp`;
  });
}

export function getPdpImageUrl(color: string, position: number): string {
  return `${IMG_V3}/pdp/${color}_position_${position}.webp`;
}

// Apple's exact breakpoints
export const BREAKPOINTS = {
  xsmall: 480,
  small: 734,
  medium: 1068,
  large: 1440,
  xlarge: 1441,
} as const;

// Apple's animation timing patterns
export const TIMING = {
  revealDuration: 0.8,
  scaleDuration: 1.0,
  staggerDelay: 0.06,
  wordStagger: 0.04,
  crossfadeDuration: 0.7,
  hoverDuration: 0.2,
  navTransition: 0.4,
  galleryAutoAdvance: 5000,
  mediaCardAutoAdvance: 6000,
  springStiffness: 200,
  springDamping: 20,
  pvBackgroundTransition: 250,
  motionDelayMedium: 80,
  motionDelayShort: 40,
  motionDurationLong: 320,
} as const;

// Apple's exact color system
export const COLORS = {
  // Light mode
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  textTertiary: '#86868b',
  link: '#0066CC',
  bgLight: '#ffffff',
  bgCard: '#f5f5f7',
  bgDark: '#000000',
  // Dark mode
  textDark: '#f5f5f7',
  linkDark: '#2997FF',
  // Product colors
  pvIntro: '#e8e8ed',
  pvIntroDark: '#2a2a2d',
  // Buttons
  buttonPrimary: '#0071e3',
  buttonDark: '#1d1d1f',
  // Badge
  badgeNew: 'rgba(245,99,0,0.1)',
  badgeNewText: 'rgb(182,68,0)',
  // BaldeCash
  bcPrimary: '#4247d2',
  bcPrimaryHover: '#363bc2',
  // Progress
  progressStart: '#2997FF',
  progressEnd: '#5AC8FA',
} as const;
