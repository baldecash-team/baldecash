const S3 = 'https://baldecash.s3.amazonaws.com';
const IMG = `${S3}/images/macbook-neo`;

const VID = `${S3}/videos/macbook-neo`;

export const ASSETS = {
  hero: {
    video: `${VID}/hero-banner-uhd.mp4`,
    poster: `${IMG}/hero-banner-uhd-poster.jpg`,
    posterMobile: `${IMG}/hero-mobile.jpg`,
  },
  design: `${IMG}/design_endframe_2x.png`,
  display: `${IMG}/dca_display_2x.png`,
  colors: {
    silver: `${IMG}/pv_colors_silver_large_2x.jpg`,
    blush: `${IMG}/pv_colors_blush_large_2x.jpg`,
    citrus: `${IMG}/pv_colors_citrus_large_2x.jpg`,
    indigo: `${IMG}/pv_colors_indigo_large_2x.jpg`,
  },
  highlights: {
    colors: `${IMG}/highlights_colors_2x.jpg`,
    battery: `${IMG}/highlights_battery_2x.jpg`,
    display: `${IMG}/highlights_display_2x.jpg`,
  },
  performance: [
    `${IMG}/performance_hero_1_2x.jpg`,
    `${IMG}/performance_hero_2_2x.jpg`,
    `${IMG}/performance_hero_4_2x.jpg`,
  ],
  productViewerHD: {
    colors: {
      silver: `${IMG}/pv_colors_silver_large_2x.jpg`,
      blush: `${IMG}/pv_colors_blush_large_2x.jpg`,
      citrus: `${IMG}/pv_colors_citrus_large_2x.jpg`,
      indigo: `${IMG}/pv_colors_indigo_large_2x.jpg`,
    },
    durable: `${IMG}/pv_durable_large_2x.jpg`,
    display: `${IMG}/pv_display_large_2x.jpg`,
    keyboard: `${IMG}/pv_keyboard_large_2x.jpg`,
    touchid: `${IMG}/pv_touchid_large_2x.jpg`,
    camera: `${IMG}/pv_camera_large_2x.jpg`,
    audio: `${IMG}/pv_audio_large_2x.jpg`,
    connectivity: `${IMG}/pv_connectivity_large_2x.jpg`,
  },
} as const;

// BaldeCash brand
export const BC = {
  primary: '#4654CD',
  primaryHover: '#3a47b8',
  secondary: '#03DBD0',
  secondaryHover: '#02c4ba',
  logo: 'https://baldecash.s3.amazonaws.com/company/logo.png',
} as const;

// Shared design tokens
export const COLORS = {
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  textTertiary: '#86868b',
  bgLight: '#ffffff',
  bgCard: '#f5f5f7',
  bgDark: '#000000',
  textDark: '#f5f5f7',
  border: '#d2d2d7',
  borderDark: '#424245',
} as const;

export const TIMING = {
  revealDuration: 0.8,
  staggerDelay: 0.06,
  galleryAutoAdvance: 5000,
} as const;
