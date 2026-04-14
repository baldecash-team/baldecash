import type {
  MacbookNeoColorOption,
  HighlightTab,
  SpecItem,
  FinancingPlan,
  HowItWorksStep,
  PerformanceSlide,
  DisplayStat,
  MacOSFeature,
  ContinuityItem,
  PrivacyItem,
} from '../types/macbook-neo';

const IMG = '/images/macbook-neo';

export const heroData = {
  headline: 'MacBook Neo',
  tagline: 'Hello, Neo.',
  subheadline: 'Tu primera MacBook. Más cerca de lo que crees.',
  cuotaDesde: 159,
  heroImage: `${IMG}/hero_endframe_2x.jpg`,
};

export const colorOptions: MacbookNeoColorOption[] = [
  { id: 'silver', label: 'Plata', hex: '#E3E4E5', imagePath: `${IMG}/pv_colors_silver_2x.jpg` },
  { id: 'blush', label: 'Rubor', hex: '#F4C2C2', imagePath: `${IMG}/pv_colors_blush_2x.jpg` },
  { id: 'citrus', label: 'Cítrico', hex: '#D4E157', imagePath: `${IMG}/pv_colors_citrus_2x.jpg` },
  { id: 'indigo', label: 'Índigo', hex: '#5C6BC0', imagePath: `${IMG}/pv_colors_indigo_2x.jpg` },
];

export const highlightTabs: HighlightTab[] = [
  {
    id: 'colors',
    label: 'Colores',
    imagePath: `${IMG}/highlights_colors_2x.jpg`,
    title: 'Cuatro colores increíbles',
    description: 'Diseño de aluminio resistente en plata, rubor, cítrico e índigo.',
    badge: '4 colores',
  },
  {
    id: 'battery',
    label: 'Batería',
    imagePath: `${IMG}/highlights_battery_2x.jpg`,
    title: 'Batería para todo el día',
    description: 'Hasta 16 horas de batería para que no te quedes sin energía en clases.',
    badge: 'Hasta 16 horas',
  },
  {
    id: 'display',
    label: 'Pantalla',
    imagePath: `${IMG}/highlights_display_2x.jpg`,
    title: 'Pantalla Liquid Retina',
    description: 'Pantalla de 13 pulgadas con más de 3.6 millones de píxeles y 500 nits de brillo.',
    badge: '13" Liquid Retina',
  },
];

export const performanceSlides: PerformanceSlide[] = [
  {
    id: 'productivity',
    imagePath: `${IMG}/performance_hero_1_2x.jpg`,
    title: 'Productividad diaria',
    description: 'Correos, videollamadas, navegación y organización. Domina tu día a día.',
  },
  {
    id: 'studies',
    imagePath: `${IMG}/performance_hero_2_2x.jpg`,
    title: 'Conquista tus cursos',
    description: 'Exámenes finales, resúmenes con IA y presentaciones impecables.',
  },
  {
    id: 'work',
    imagePath: `${IMG}/performance_hero_3_2x.jpg`,
    title: 'Haz del trabajo un juego',
    description: 'Hojas de cálculo, gestión de proyectos, trabajo pesado resuelto.',
  },
  {
    id: 'gaming',
    imagePath: `${IMG}/performance_hero_4_2x.jpg`,
    title: 'Diversión sin límites',
    description: 'Gráficos impresionantes para películas, series y juegos.',
  },
];

export const displayStats: DisplayStat[] = [
  { id: 'size', value: 13, suffix: '"', label: 'Liquid Retina' },
  { id: 'pixels', value: 3.6, suffix: 'M', label: 'de píxeles' },
  { id: 'nits', value: 500, suffix: '', label: 'nits de brillo' },
  { id: 'colors', value: 1, suffix: 'B', label: 'de colores' },
];

export const specItems: SpecItem[] = [
  { id: 'chip', icon: 'Cpu', label: 'Chip', value: 'A18 Pro', description: 'Rendimiento rápido y eficiente' },
  { id: 'memory', icon: 'MemoryStick', label: 'Memoria', value: '8 GB', description: 'Memoria unificada' },
  { id: 'storage', icon: 'HardDrive', label: 'Almacenamiento', value: '256 GB SSD', description: 'Almacenamiento rápido' },
  { id: 'display', icon: 'Monitor', label: 'Pantalla', value: '13" Liquid Retina', description: '500 nits, 1000M colores' },
  { id: 'battery', icon: 'BatteryFull', label: 'Batería', value: 'Hasta 16 horas', description: 'La mejor de su clase' },
  { id: 'ports', icon: 'Usb', label: 'Puertos', value: '2x USB-C + 3.5mm', description: 'Carga y conectividad' },
];

export const financingPlans: FinancingPlan[] = [
  { id: 'plan-6', nombre: 'Plan Express', cuotaMensual: 389, plazoMeses: 6, cuotaInicial: 0, precioTotal: 2334 },
  { id: 'plan-12', nombre: 'Plan Estándar', cuotaMensual: 219, plazoMeses: 12, cuotaInicial: 0, precioTotal: 2628, destacado: true },
  { id: 'plan-18', nombre: 'Plan Extendido', cuotaMensual: 159, plazoMeses: 18, cuotaInicial: 0, precioTotal: 2862 },
];

export const howItWorksSteps: HowItWorksStep[] = [
  { id: 'step-1', numero: 1, titulo: 'Elige tu MacBook', descripcion: 'Selecciona el color y plan de financiamiento que mejor se adapte a ti.', icon: 'Laptop' },
  { id: 'step-2', numero: 2, titulo: 'Completa tu solicitud', descripcion: 'Llena el formulario con tus datos. No necesitas historial crediticio.', icon: 'FileText' },
  { id: 'step-3', numero: 3, titulo: 'Aprobación en 24 horas', descripcion: 'Evaluamos tu solicitud y te notificamos por WhatsApp.', icon: 'CheckCircle' },
  { id: 'step-4', numero: 4, titulo: 'Recibe en tu campus', descripcion: 'Entregamos tu MacBook Neo directamente en tu universidad.', icon: 'Package' },
];

export const macosFeatures: MacOSFeature[] = [
  { id: 'macos-1', icon: 'Sparkles', title: 'Apple Intelligence', description: 'Herramientas de IA integradas para escribir, resumir y crear.' },
  { id: 'macos-2', icon: 'Layout', title: 'Multitarea fluida', description: 'Stage Manager y Split View para trabajar con varias apps a la vez.' },
  { id: 'macos-3', icon: 'Shield', title: 'Seguridad integrada', description: 'macOS protege tus datos con cifrado de disco y autenticación biométrica.' },
  { id: 'macos-4', icon: 'Zap', title: 'Rendimiento optimizado', description: 'macOS aprovecha al máximo el chip A18 Pro con eficiencia energética.' },
];

export const continuityItems: ContinuityItem[] = [
  { id: 'cont-1', icon: 'Smartphone', title: 'iPhone + Mac', description: 'Copia y pega entre dispositivos, comparte tu pantalla y más.' },
  { id: 'cont-2', icon: 'Wifi', title: 'AirDrop', description: 'Comparte archivos al instante con cualquier dispositivo Apple cercano.' },
  { id: 'cont-3', icon: 'MessageCircle', title: 'iMessage', description: 'Envía y recibe mensajes desde tu Mac como si fuera tu iPhone.' },
  { id: 'cont-4', icon: 'Camera', title: 'Cámara de Continuidad', description: 'Usa la cámara de tu iPhone como webcam de alta calidad.' },
  { id: 'cont-5', icon: 'Headphones', title: 'AirPods', description: 'Conexión instantánea con cambio automático entre dispositivos.' },
  { id: 'cont-6', icon: 'Watch', title: 'Apple Watch', description: 'Desbloquea tu Mac automáticamente cuando te acercas.' },
];

export const privacyItems: PrivacyItem[] = [
  { id: 'priv-1', icon: 'Lock', title: 'FileVault', description: 'Cifrado completo de disco para proteger todos tus datos.' },
  { id: 'priv-2', icon: 'Fingerprint', title: 'Touch ID', description: 'Desbloquea tu Mac y autoriza compras con tu huella digital.' },
  { id: 'priv-3', icon: 'Eye', title: 'Privacidad Safari', description: 'Bloqueo de rastreadores y navegación privada inteligente.' },
  { id: 'priv-4', icon: 'ShieldCheck', title: 'Gatekeeper', description: 'Solo ejecuta apps verificadas y confiables en tu Mac.' },
];
