import {
  MacbookNeoColorOption,
  ScrollStory,
  HighlightCard,
  SpecItem,
  FinancingPlan,
} from '../types/macbook-neo';

const IMG_BASE = '/images/macbook-neo';

export const heroData = {
  headline: 'MacBook Neo',
  subheadline: 'Tu primera MacBook. Más cerca de lo que crees.',
  cuotaDesde: 189,
  badge: 'Apple Partner Oficial',
  heroImage: `${IMG_BASE}/hero_endframe_2x.jpg`,
  heroImageAlt: `${IMG_BASE}/hero_static_2x.jpg`,
};

export const scrollStories: ScrollStory[] = [
  {
    id: 'story-productividad',
    color: 'citrus',
    imagePath: `${IMG_BASE}/performance_hero_1_2x.jpg`,
    headline: 'Productividad diaria.',
    headlineColor: '#4CAF50',
    description: 'Responde correos, toma videollamadas, navega por la web y organiza tus horarios.',
    scrollStart: 0,
    scrollEnd: 0.28,
  },
  {
    id: 'story-estudios',
    color: 'blush',
    imagePath: `${IMG_BASE}/performance_hero_2_2x.jpg`,
    headline: 'Conquista tus cursos.',
    headlineColor: '#E91E63',
    description: 'Perfecta para estudiar, resumir apuntes con IA o crear presentaciones.',
    scrollStart: 0.22,
    scrollEnd: 0.53,
  },
  {
    id: 'story-trabajo',
    color: 'indigo',
    imagePath: `${IMG_BASE}/performance_hero_3_2x.jpg`,
    headline: 'Haz del trabajo un juego.',
    headlineColor: '#FF9800',
    description: 'Desde hojas de cálculo hasta gestión de proyectos, MacBook Neo hace el trabajo pesado por ti.',
    scrollStart: 0.47,
    scrollEnd: 0.78,
  },
  {
    id: 'story-entretenimiento',
    color: 'silver',
    imagePath: `${IMG_BASE}/performance_hero_4_2x.jpg`,
    headline: 'Diversión sin límites.',
    headlineColor: '#9C27B0',
    description: 'Gráficos impresionantes y pantalla Liquid Retina vibrante para tus películas, series y juegos.',
    scrollStart: 0.72,
    scrollEnd: 1.0,
  },
];

export const colorOptions: MacbookNeoColorOption[] = [
  { id: 'silver', label: 'Plata', hex: '#E3E4E5', imagePath: `${IMG_BASE}/pv_colors_silver_2x.jpg` },
  { id: 'blush', label: 'Rubor', hex: '#F4C2C2', imagePath: `${IMG_BASE}/pv_colors_blush_2x.jpg` },
  { id: 'citrus', label: 'Cítrico', hex: '#D4E157', imagePath: `${IMG_BASE}/pv_colors_citrus_2x.jpg` },
  { id: 'indigo', label: 'Índigo', hex: '#5C6BC0', imagePath: `${IMG_BASE}/pv_colors_indigo_2x.jpg` },
];

export const highlightCards: HighlightCard[] = [
  {
    id: 'highlight-battery',
    imagePath: `${IMG_BASE}/highlights_battery_2x.jpg`,
    title: 'Batería para todo el día',
    description: 'Hasta 16 horas de batería para que no te quedes sin energía en clases.',
    badge: 'Hasta 16 horas',
  },
  {
    id: 'highlight-display',
    imagePath: `${IMG_BASE}/highlights_display_2x.jpg`,
    title: 'Pantalla Liquid Retina',
    description: 'Pantalla de 13 pulgadas con más de 3.6 millones de píxeles y 500 nits de brillo.',
    badge: '13" Liquid Retina',
  },
  {
    id: 'highlight-colors',
    imagePath: `${IMG_BASE}/highlights_colors_2x.jpg`,
    title: 'Cuatro colores increíbles',
    description: 'Diseño de aluminio resistente en plata, rubor, cítrico e índigo.',
    badge: '4 colores',
  },
];

export const specItems: SpecItem[] = [
  { id: 'spec-chip', icon: 'Cpu', label: 'Chip', value: 'A18 Pro', description: 'Rendimiento rápido y eficiente' },
  { id: 'spec-memory', icon: 'MemoryStick', label: 'Memoria', value: '8 GB', description: 'Memoria unificada' },
  { id: 'spec-storage', icon: 'HardDrive', label: 'Almacenamiento', value: '256 GB SSD', description: 'Almacenamiento rápido' },
  { id: 'spec-display', icon: 'Monitor', label: 'Pantalla', value: '13" Liquid Retina', description: '500 nits, 1000M colores' },
  { id: 'spec-battery', icon: 'BatteryFull', label: 'Batería', value: 'Hasta 16 horas', description: 'La mejor de su clase' },
  { id: 'spec-ports', icon: 'Usb', label: 'Puertos', value: '2x USB-C + 3.5mm', description: 'Carga y conectividad' },
];

export const financingPlans: FinancingPlan[] = [
  { id: 'plan-6', nombre: 'Plan Express', cuotaMensual: 389, plazoMeses: 6, cuotaInicial: 0, precioTotal: 2334 },
  { id: 'plan-12', nombre: 'Plan Estándar', cuotaMensual: 219, plazoMeses: 12, cuotaInicial: 0, precioTotal: 2628, destacado: true },
  { id: 'plan-18', nombre: 'Plan Extendido', cuotaMensual: 159, plazoMeses: 18, cuotaInicial: 0, precioTotal: 2862 },
];

export const productImages = [
  { src: `${IMG_BASE}/pv_hero_2x.jpg`, alt: 'MacBook Neo vista general', label: 'Vista General' },
  { src: `${IMG_BASE}/pv_display_2x.jpg`, alt: 'MacBook Neo pantalla', label: 'Pantalla' },
  { src: `${IMG_BASE}/pv_keyboard_2x.jpg`, alt: 'MacBook Neo teclado', label: 'Teclado' },
];
