import type {
  HeroData,
  HighlightCard,
  DesignData,
  ProductViewerItem,
  ProductViewerData,
  PerformanceChapter,
  PerformanceData,
  DCAChapter,
  AIFeature,
  MacOSFeature,
  ContinuityTab,
  NewToMacFeature,
  SecurityFeature,
  IncentiveCard,
  ValueCard,
  NavLink,
  FinancingPlan,
} from '../types/v4Types';
import { ASSETS } from '../lib/constants';

// ============================================================
// S1: Welcome / Hero
// ============================================================
export const heroData: HeroData = {
  headline: 'MacBook Neo',
  tagline: 'Hello, Neo.',
  price: 'From $999',
  ctaPrimary: { label: 'Buy', href: '#contrast' },
  ctaSecondary: { label: 'Learn more', href: '#highlights' },
  poster: ASSETS.hero.poster,
  frameCount: 180,
  framePathPattern: '/images/macbook-neo-v3/sequences/hero/frame_{NNNN}.webp',
};

// ============================================================
// S2: Highlights - MediaCardGallery with 7 cards
// ============================================================
export const highlightCards: HighlightCard[] = [
  {
    id: 'design',
    label: 'Design',
    caption: 'Silver, Blush, Citrus, and Indigo. Four stunning colors. One durable design.',
    image: ASSETS.highlights.colors,
  },
  {
    id: 'battery',
    label: 'Battery',
    caption: 'Fast for all your everyday tasks. And up to 16 hours of battery life to go, go, go.',
    image: ASSETS.highlights.battery,
  },
  {
    id: 'display',
    label: 'Display',
    caption: '13-inch Liquid Retina display. Exceptionally vibrant and bright. One billion colors. Open up and say wow.',
    image: ASSETS.highlights.display,
  },
  {
    id: 'apple-intelligence',
    label: 'Apple Intelligence',
    caption: 'A powerful platform for AI. With Apple Intelligence built right in. Smarter than smart.',
    image: ASSETS.performance[0],
  },
  {
    id: 'continuity',
    label: 'Continuity',
    caption: 'Magically pairs with your iPhone to unlock even more features.',
    image: ASSETS.performance[1],
  },
  {
    id: 'macos',
    label: 'macOS',
    caption: 'macOS. Easy to use. Runs all your go-to apps. Puts the fun in functional.',
    image: ASSETS.performance[2],
    theme: 'dark',
  },
  {
    id: 'security',
    label: 'Security',
    caption: 'Free software updates. Built-in privacy, security, and antivirus protection. Complete peace of mind.',
    image: ASSETS.performance[3],
  },
];

// ============================================================
// S3: Design - TextOverMedia
// ============================================================
export const designData: DesignData = {
  headline: 'Love at first Mac.',
  videoEndframe: ASSETS.design,
};

// ============================================================
// S4: Product Viewer - 8-item interactive tour
// ============================================================
export const productViewerData: ProductViewerData = {
  headline: 'Take a closer look.',
  items: [
    {
      id: 'colors',
      label: 'Colors',
      title: 'Colors.',
      description: 'The most colorful MacBook lineup ever. Choose from four stunning colors with color-coordinated keyboards.',
      type: 'color-selector',
      mediaId: 'colornav-gallery',
    },
    {
      id: 'durable',
      label: 'Durable design',
      title: 'Durable design.',
      description: 'MacBook Neo is made with a durable recycled aluminum enclosure that helps it reach 60 percent recycled content by weight, the most ever in any Apple product.',
      type: 'image',
      mediaId: 'product-viewer-item2',
    },
    {
      id: 'display',
      label: 'Display',
      title: 'Display.',
      description: 'With outstanding resolution and 500 nits of brightness, the 13-inch Liquid Retina display brings photos, websites, and videos to life with refreshing clarity and vivid colors.',
      type: 'image',
      mediaId: 'product-viewer-item3',
    },
    {
      id: 'keyboard',
      label: 'Keyboard and trackpad',
      title: 'Keyboard and trackpad.',
      description: 'The Magic Keyboard delivers a precise and comfortable typing experience. And the large Multi-Touch trackpad lets you tap, pinch, swipe, and click anywhere.',
      type: 'video',
      mediaId: 'product-viewer-item4',
    },
    {
      id: 'touchid',
      label: 'Touch ID',
      title: 'Touch ID.',
      description: 'The model with Touch ID lets you easily unlock your MacBook Neo, sign in to websites and apps, and download apps with the touch of your finger.',
      type: 'image',
      mediaId: 'product-viewer-item5',
    },
    {
      id: 'camera',
      label: 'Camera',
      title: 'Camera.',
      description: 'The 1080p FaceTime HD camera gives you a clear and crisp appearance on video calls.',
      type: 'image',
      mediaId: 'product-viewer-item6',
    },
    {
      id: 'audio',
      label: 'Audio',
      title: 'Audio.',
      description: 'Dual side-firing speakers deliver immersive stereo sound. And a three-mic array brings exceptional voice clarity on calls.',
      type: 'video',
      mediaId: 'product-viewer-item7',
    },
    {
      id: 'connectivity',
      label: 'Connectivity',
      title: 'Connectivity.',
      description: 'USB-C charging and accessories. Blazing-fast Wi-Fi 6E. Bluetooth 5.3. And a MagSafe charging cable that magnetically attaches and easily releases.',
      type: 'image',
      mediaId: 'product-viewer-item8',
    },
  ],
  colors: [
    { id: 'silver', label: 'Silver' },
    { id: 'blush', label: 'Blush' },
    { id: 'citrus', label: 'Citrus' },
    { id: 'indigo', label: 'Indigo' },
  ],
};

// ============================================================
// S5: Performance
// ============================================================
export const performanceData: PerformanceData = {
  eyebrow: 'Performance',
  headline: 'The muscle for your hustle.',
  description: 'The A18 Pro chip helps you run your go-to apps, fly through everyday tasks, tap into your creativity, and play action-packed games. So whatever your day brings, you can move at the speed of inspiration.',
  chapters: [
    {
      id: 'productivity',
      title: 'Everyday productivity',
      description: 'Email, video calls, browsing, and scheduling — MacBook Neo handles it all with ease.',
      image: ASSETS.performance[0],
    },
    {
      id: 'courses',
      title: 'Conquer your courses',
      description: 'From research papers to presentations, MacBook Neo is the ultimate study companion.',
      image: ASSETS.performance[1],
      reversed: true,
    },
    {
      id: 'work',
      title: 'Make work feel like play',
      description: 'Spreadsheets, payroll, project management — tackle your to-do list with lightning speed.',
      image: ASSETS.performance[2],
    },
    {
      id: 'gaming',
      title: 'Amusement perks',
      description: 'Incredible graphics and the Liquid Retina display bring your favorite games to life.',
      image: ASSETS.performance[3],
      reversed: true,
    },
  ],
  batteryLabel: 'Up to',
  batteryValue: '16 hours battery life on a single charge',
};

// ============================================================
// S6: Display, Camera, and Audio
// ============================================================
export const dcaChapters: DCAChapter[] = [
  {
    id: 'display',
    title: 'Liquid Retina display',
    description: '13" Liquid Retina display with support for 1 billion colors.',
    image: ASSETS.display,
    stats: [
      { value: '3.6M', label: 'pixels for incredible resolution' },
      { value: '500', label: 'nits of brightness' },
    ],
  },
  {
    id: 'camera',
    title: 'FaceTime HD Camera',
    description: 'The 1080p FaceTime HD camera delivers vibrant video so you always look your best.',
    image: ASSETS.productViews.display,
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'A dual-mic array with beamforming technology. Dual side-firing speakers deliver immersive sound.',
    image: ASSETS.productViews.keyboard,
  },
];

// ============================================================
// S7: Apple Intelligence
// ============================================================
export const aiFeatures: AIFeature[] = [
  {
    id: 'writing-tools',
    title: 'Writing Tools',
    description: 'Proofread your text and rewrite different versions until the tone and wording are just right.',
    image: ASSETS.performance[0],
  },
  {
    id: 'genmoji',
    title: 'Genmoji',
    description: 'Express yourself with delightful, custom-made emoji.',
    image: ASSETS.performance[1],
  },
  {
    id: 'cleanup',
    title: 'Clean Up',
    description: 'Perfect your photos by quickly removing distractions.',
    image: ASSETS.performance[2],
  },
];

// ============================================================
// S8: macOS
// ============================================================
export const macOSFeatures: MacOSFeature[] = [
  {
    id: 'multitasking',
    title: 'Easy. Does it all.',
    description: 'macOS feels simple and intuitive — quickly access your apps and files, neatly tile multiple windows side by side.',
    image: ASSETS.performance[0],
    wide: true,
    hasVideo: true,
  },
  {
    id: 'apps',
    title: 'Built-in Apple apps',
    description: 'Browse the web with Safari. Create gorgeous presentations in Keynote.',
    image: ASSETS.performance[1],
  },
  {
    id: 'favorites',
    title: 'Use your go-to apps',
    description: 'From Microsoft 365 Copilot to Zoom, the apps you know and love run wonderfully on Mac.',
    image: ASSETS.performance[2],
    wide: true,
  },
];

// ============================================================
// S9: Continuity - FadeGallery with 6 tabs
// ============================================================
export const continuityTabs: ContinuityTab[] = [
  { id: 'calls', label: 'Calls and Texts', image: ASSETS.performance[0] },
  { id: 'handoff', label: 'Handoff', image: ASSETS.performance[1] },
  { id: 'copypaste', label: 'Copy and Paste', image: ASSETS.performance[2] },
  { id: 'airdrop', label: 'AirDrop', image: ASSETS.performance[3] },
  { id: 'sidecar', label: 'Sidecar', image: ASSETS.performance[0] },
  { id: 'iphone-mirroring', label: 'iPhone Mirroring', image: ASSETS.performance[1] },
];

// ============================================================
// S10: New to Mac
// ============================================================
export const newToMacFeatures: NewToMacFeature[] = [
  {
    id: 'setup',
    title: 'Setup in a snap',
    description: 'Use your iPhone to import files, apps, and more from iCloud with Setup Assistant.',
    image: ASSETS.performance[0],
  },
  {
    id: 'icloud',
    title: 'Access files anywhere',
    description: 'iCloud privately stores your photos, contacts, and documents in one place.',
    image: ASSETS.performance[1],
    wide: true,
  },
  {
    id: 'learn',
    title: 'Learn what\'s next',
    description: 'Tips and tutorials help you discover all the things your Mac can do.',
    image: ASSETS.performance[2],
  },
];

// ============================================================
// S11: Security
// ============================================================
export const securityFeatures: SecurityFeature[] = [
  {
    id: 'lockkey',
    title: 'Lock Key or Touch ID',
    description: 'The MacBook Neo model with Lock Key lets you wake and lock your screen. Or choose Touch ID.',
    image: ASSETS.performance[0],
  },
  {
    id: 'findmy',
    title: 'Protected if lost',
    description: 'The Find My app helps you quickly pinpoint where your MacBook Neo is.',
    image: ASSETS.performance[1],
    wide: true,
  },
  {
    id: 'antivirus',
    title: 'Stays secure',
    description: 'MacBook Neo has free, built-in antivirus protections.',
    image: ASSETS.performance[2],
  },
  {
    id: 'passwords',
    title: 'Remembers your logins',
    description: 'Keep your passwords, passkeys, Wi-Fi info organized and accessible.',
    image: ASSETS.performance[3],
  },
];

// ============================================================
// S12: Incentive ("Why Apple")
// ============================================================
export const incentiveCards: IncentiveCard[] = [
  {
    id: 'acmi',
    headline: 'Pay over time, interest-free.',
    description: 'When you choose to check out at Apple with Apple Card Monthly Installments.',
    image: ASSETS.hero.fallback,
    ctaLabel: 'Learn more',
    ctaHref: '#',
  },
];

// ============================================================
// S14: Environment
// ============================================================
export const environmentData = {
  headline: 'MacBook Neo and the environment.',
  stat: 'Made with 60% recycled material by weight.',
};

// ============================================================
// S15: Values
// ============================================================
export const valuesCards: ValueCard[] = [
  {
    id: 'environment',
    icon: '🌍',
    headline: 'A plan as innovative as our products.',
    description: 'We\'re committed to bringing net emissions to zero across our entire carbon footprint by 2030.',
    link: { label: 'Learn more', href: '#' },
  },
  {
    id: 'privacy',
    icon: '🔒',
    headline: 'Privacy. That\'s Apple.',
    description: 'Privacy is a fundamental human right. Every product and service is designed to help keep your data safe and secure.',
    link: { label: 'Learn more', href: '#' },
  },
  {
    id: 'accessibility',
    icon: '♿',
    headline: 'Innovation that\'s accessible by design.',
    description: 'Our products and services are designed for everyone, with built-in features to help you do what you love, your way.',
    link: { label: 'Learn more', href: '#' },
  },
];

// ============================================================
// Nav links
// ============================================================
export const navLinks: NavLink[] = [
  { label: 'Overview', sectionId: 'welcome' },
  { label: 'Design', sectionId: 'design' },
  { label: 'Product', sectionId: 'product-viewer' },
  { label: 'Performance', sectionId: 'performance' },
  { label: 'Display', sectionId: 'display' },
  { label: 'Intelligence', sectionId: 'apple-intelligence' },
  { label: 'macOS', sectionId: 'macos' },
  { label: 'Continuity', sectionId: 'continuity' },
];

// ============================================================
// BaldeCash-specific: Financing plans
// ============================================================
export const financingPlans: FinancingPlan[] = [
  { id: '6mo', nombre: '6 cuotas', cuotaMensual: 299, plazoMeses: 6, cuotaInicial: 0, precioTotal: 1794 },
  { id: '12mo', nombre: '12 cuotas', cuotaMensual: 159, plazoMeses: 12, cuotaInicial: 0, precioTotal: 1908, destacado: true },
  { id: '18mo', nombre: '18 cuotas', cuotaMensual: 119, plazoMeses: 18, cuotaInicial: 0, precioTotal: 2142 },
];
