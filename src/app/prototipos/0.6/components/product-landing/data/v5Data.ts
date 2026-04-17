import type {
  V5HeroData,
  V5HighlightCard,
  V5DesignData,
  V5FinancingPlan,
  V5PerformanceData,
  V5DCAChapter,
  V5ProductViewerData,
  V5Testimonial,
  V5NavLink,
  V5Benefit,
  V5Institucion,
} from '../types/v5Types';
import { ASSETS } from '../lib/constants';

// ============================================================
// S1: Hero
// ============================================================
export const heroData: V5HeroData = {
  eyebrow: 'MacBook Neo',
  headline: 'Tu próxima Mac te espera',
  ctaPrimary: { label: 'Solicitar financiamiento', scrollTo: 'lead-form' },
  ctaSecondary: { label: 'Desde S/119/mes', scrollTo: 'financing' },
  poster: ASSETS.hero.poster,
  frameCount: 180,
};

// ============================================================
// S2: Benefits Bar
// ============================================================
export const benefits: V5Benefit[] = [
  { id: 'shipping', icon: 'Truck', texto: 'Envío gratis' },
  { id: 'warranty', icon: 'Shield', texto: 'Garantía 12 meses' },
  { id: 'no-initial', icon: 'CreditCard', texto: 'Sin inicial' },
  { id: 'dni', icon: 'IdCard', texto: 'Evaluación con DNI' },
];

// ============================================================
// S3: Highlights - MediaCardGallery (5 cards)
// ============================================================
export const highlightCards: V5HighlightCard[] = [
  {
    id: 'design',
    label: 'Diseño',
    caption: 'Silver, Blush, Citrus e Indigo. Cuatro colores increíbles.',
    image: ASSETS.highlights.colors,
  },
  {
    id: 'battery',
    label: 'Batería',
    caption: 'Rápida para todas tus tareas. Hasta 16 horas de batería.',
    image: ASSETS.highlights.battery,
    theme: 'dark',
  },
  {
    id: 'display',
    label: 'Pantalla',
    caption: 'Pantalla Liquid Retina de 13". Mil millones de colores.',
    image: ASSETS.highlights.display,
  },
];

// ============================================================
// S4: Design - TextOverMedia
// ============================================================
export const designData: V5DesignData = {
  headline: 'Cuatro colores.\nUno para ti',
  description:
    'Silver, Blush, Citrus e Indigo. Elige el que refleja tu estilo y financialo con BaldeCash.',
  ctaLabel: 'Conoce los planes',
  ctaScrollTo: 'financing',
  image: ASSETS.design,
};

// ============================================================
// S5: Financing Plans
// ============================================================
export const financingPlans: V5FinancingPlan[] = [
  {
    id: 'esencial',
    nombre: 'Esencial',
    subtitulo: 'Pack entrada',
    descripcion: 'MacBook Neo 256GB',
    cuotaMensual: 199,
    plazoMeses: 24,
    cuotaInicial: 0,
    icono: 'Zap',
    imagen: 'https://baldecash.s3.amazonaws.com/images/macbook-neo/plan-esencial.jpeg',
    items: [
      'Chip Apple A18 Pro · 6-core CPU',
      '256GB SSD · 16GB memoria unificada',
      'Pantalla Liquid Retina 13" · 500 nits',
      'Hasta 16 horas de batería',
      'Envío gratis a todo el Perú',
    ],
    ahorroText: '',
    colorAccent: '#B8B8B8',
    productUrl: 'https://demo.baldecash.com/baldecash-macbook-neo/producto/laptop-macbook-neo-indigo-lpappr0001350/',
    colorOptions: [
      { id: 'silver', label: 'Silver', hex: '#E3E3E3', productUrl: '/baldecash-macbook-neo/producto/laptop-macbook-neo-indigo-lpappr0001350/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-silver-sola.jpg' },
      { id: 'blush', label: 'Blush', hex: '#F2A7B0', productUrl: '/baldecash-macbook-neo/producto/laptop-macbook-neo-blush-lpappr0001353/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-blush-sola.jpg' },
      { id: 'indigo', label: 'Indigo', hex: '#4B5EAA', productUrl: '/baldecash-macbook-neo/producto/macbook-neo-indigo-256/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-indigo-sola.jpg' },
    ],
  },
  {
    id: 'avanzado',
    nombre: 'Avanzado',
    subtitulo: 'Pack media-alta',
    descripcion: 'MacBook Neo 512GB',
    cuotaMensual: 249,
    plazoMeses: 24,
    cuotaInicial: 0,
    icono: 'Star',
    imagen: 'https://baldecash.s3.amazonaws.com/images/macbook-neo/plan-avanzado.jpeg',
    items: [
      'Chip Apple A18 Pro · 6-core CPU + 5-core GPU',
      '512GB SSD · 16GB memoria unificada',
      'Touch ID · Apple Intelligence',
      'Cámara FaceTime HD 1080p',
      'Envío gratis a todo el Perú',
    ],
    ahorroText: '',
    colorAccent: '#4654CD',
    destacado: true,
    productUrl: 'https://demo.baldecash.com/baldecash-macbook-neo/producto/laptop-macbook-neo-lpappr0001351/',
    colorOptions: [
      { id: 'silver', label: 'Silver', hex: '#E3E3E3', productUrl: '/baldecash-macbook-neo/producto/laptop-macbook-neo-lpappr0001351/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-silver-touchid.jpg' },
    ],
  },
  {
    id: 'premium',
    nombre: 'Combo Apple',
    subtitulo: 'Pack premium',
    descripcion: 'MacBook Neo 256GB + AirPods',
    cuotaMensual: 279,
    plazoMeses: 24,
    cuotaInicial: 0,
    icono: 'Crown',
    imagen: 'https://baldecash.s3.amazonaws.com/images/macbook-neo/plan-premium.jpeg',
    items: [
      'Chip Apple A18 Pro · Máximo rendimiento',
      '256GB SSD · 24GB memoria unificada',
      'Audio espacial Dolby Atmos',
      'AirPods 4 incluidos',
      'Envío prioritario gratis',
    ],
    ahorroText: '',
    colorAccent: '#D4AF37',
    productUrl: 'https://demo.baldecash.com/baldecash-macbook-neo/producto/laptop-macbook-neo-silver-combo-lpappr0001367/',
    colorOptions: [
      { id: 'silver', label: 'Silver', hex: '#E3E3E3', productUrl: '/baldecash-macbook-neo/producto/laptop-macbook-neo-silver-combo-lpappr0001367/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-silver-combo.jpg' },
      { id: 'blush', label: 'Blush', hex: '#F2A7B0', productUrl: '/baldecash-macbook-neo/producto/laptop-macbook-neo-blush-512/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-blush-combo.jpg' },
      { id: 'indigo', label: 'Indigo', hex: '#4B5EAA', productUrl: '/baldecash-macbook-neo/producto/laptop-macbook-neo-indigo-512/', image: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-indigo-combo.jpg' },
    ],
  },
];

// ============================================================
// S6: Performance
// ============================================================
export const performanceData: V5PerformanceData = {
  eyebrow: 'Potencia',
  headline: 'La potencia para tu día a día',
  description:
    'Videollamadas, trabajos de investigación, presentaciones y tus juegos favoritos. MacBook Neo lo maneja todo sin despeinarse.',
  chapters: [
    {
      id: 'productivity',
      title: 'Productividad diaria',
      description:
        'Correo, videollamadas, navegación y agenda: MacBook Neo lo maneja todo con facilidad.',
      image: ASSETS.performance[0],
    },
    {
      id: 'courses',
      title: 'Conquista tus cursos',
      description:
        'Desde trabajos de investigación hasta presentaciones, MacBook Neo es tu compañero de estudio ideal.',
      image: ASSETS.performance[1],
    },
    {
      id: 'gaming',
      title: 'Diversión asegurada',
      description:
        'Gráficos increíbles y la pantalla Liquid Retina dan vida a tus juegos favoritos.',
      image: ASSETS.performance[2],
    },
  ],
  batteryLabel: 'Hasta',
  batteryValue: '16 horas de batería con una sola carga',
};

// ============================================================
// S7: Display, Camera, Audio
// ============================================================
export const dcaChapters: V5DCAChapter[] = [
  {
    id: 'display',
    title: 'Pantalla Liquid Retina',
    description:
      'Pantalla Liquid Retina de 13" con soporte para mil millones de colores. Todo se ve espectacular.',
    image: ASSETS.display,
    stats: [
      { value: '3.6M', label: 'píxeles de resolución' },
      { value: '500', label: 'nits de brillo' },
    ],
  },
  {
    id: 'camera',
    title: 'Cámara FaceTime HD',
    description:
      'La cámara FaceTime HD de 1080p te hace lucir genial en tus videollamadas y clases virtuales.',
    image: ASSETS.productViewerHD.camera,
    stats: [
      { value: '1080', label: 'p Full HD' },
    ],
  },
  {
    id: 'audio',
    title: 'Audio inmersivo',
    description:
      'Micrófonos duales con tecnología de formación de haz. Altavoces laterales con sonido envolvente.',
    image: ASSETS.productViewerHD.audio,
  },
];

// ============================================================
// S8: Product Viewer
// ============================================================
export const productViewerData: V5ProductViewerData = {
  headline: 'Mira de cerca',
  items: [
    {
      id: 'colors',
      label: 'Colores',
      title: 'Colores.',
      description:
        'La línea MacBook más colorida de la historia. Elige entre cuatro colores increíbles con teclados a juego.',
      type: 'color-selector',
      mediaId: 'colornav-gallery',
    },
    {
      id: 'durable',
      label: 'Diseño resistente',
      title: 'Diseño resistente.',
      description:
        'MacBook Neo está hecha con aluminio reciclado, alcanzando un 60% de contenido reciclado por peso.',
      type: 'image',
      mediaId: 'product-viewer-item2',
    },
    {
      id: 'display',
      label: 'Pantalla',
      title: 'Pantalla.',
      description:
        'Con resolución excepcional y 500 nits de brillo, la pantalla Liquid Retina de 13" da vida a fotos, sitios web y videos.',
      type: 'image',
      mediaId: 'product-viewer-item3',
    },
    {
      id: 'keyboard',
      label: 'Teclado',
      title: 'Teclado y trackpad.',
      description:
        'El Magic Keyboard ofrece una experiencia de escritura precisa y cómoda. Y el trackpad Multi-Touch te permite tocar, pellizcar y deslizar.',
      type: 'video',
      mediaId: 'product-viewer-item4',
    },
    {
      id: 'touchid',
      label: 'Touch ID',
      title: 'Touch ID.',
      description:
        'Touch ID te permite desbloquear tu MacBook Neo, iniciar sesión y descargar apps con la huella de tu dedo.',
      type: 'image',
      mediaId: 'product-viewer-item5',
    },
    {
      id: 'camera',
      label: 'Cámara',
      title: 'Cámara.',
      description:
        'La cámara FaceTime HD de 1080p te da una apariencia clara y nítida en videollamadas.',
      type: 'image',
      mediaId: 'product-viewer-item6',
    },
    {
      id: 'audio',
      label: 'Audio',
      title: 'Audio.',
      description:
        'Los altavoces laterales duales ofrecen sonido estéreo inmersivo. Y tres micrófonos con claridad excepcional en llamadas.',
      type: 'video',
      mediaId: 'product-viewer-item7',
    },
    {
      id: 'connectivity',
      label: 'Conectividad',
      title: 'Conectividad.',
      description:
        'Carga y accesorios USB-C. Wi-Fi 6E ultrarrápido. Bluetooth 5.3. Y cable MagSafe que se conecta magnéticamente.',
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
// S9: Social Proof
// ============================================================
export const testimonials: V5Testimonial[] = [
  {
    id: 't1',
    nombre: 'María Fernanda R.',
    universidad: 'UPC',
    quote:
      'Pedí mi MacBook Neo con BaldeCash y en 24 horas ya estaba aprobada. Las cuotas son súper accesibles y la laptop es increíble para mis clases de diseño.',
  },
  {
    id: 't2',
    nombre: 'Carlos A.',
    universidad: 'UPN',
    quote:
      'Nunca pensé que podría tener una Mac siendo estudiante. Gracias a BaldeCash, ahora la tengo en 12 cuotas sin inicial. La batería me dura todo el día.',
  },
  {
    id: 't3',
    nombre: 'Lucía M.',
    universidad: 'PUCP',
    quote:
      'El proceso fue súper fácil, solo necesité mi DNI. Ahora uso mi MacBook Neo para todos mis trabajos de la universidad. ¡La recomiendo al 100%!',
  },
  {
    id: 't4',
    nombre: 'Diego P.',
    universidad: 'UNI',
    quote:
      'Investigué varias opciones de financiamiento y BaldeCash fue la mejor. Sin historial crediticio, sin tarjeta de crédito. Mi MacBook Neo es una máquina.',
  },
];

// ============================================================
// S10: Lead Form Institutions
// ============================================================
export const instituciones: V5Institucion[] = [
  { id: 'upn', nombre: 'Universidad Privada del Norte (UPN)' },
  { id: 'upc', nombre: 'Universidad Peruana de Ciencias Aplicadas (UPC)' },
  { id: 'usil', nombre: 'Universidad San Ignacio de Loyola (USIL)' },
  { id: 'utp', nombre: 'Universidad Tecnológica del Perú (UTP)' },
  { id: 'continental', nombre: 'Universidad Continental' },
  { id: 'ucv', nombre: 'Universidad César Vallejo (UCV)' },
  { id: 'unmsm', nombre: 'Universidad Nacional Mayor de San Marcos' },
  { id: 'uni', nombre: 'Universidad Nacional de Ingeniería (UNI)' },
  { id: 'pucp', nombre: 'Pontificia Universidad Católica del Perú (PUCP)' },
  { id: 'ulima', nombre: 'Universidad de Lima' },
  { id: 'up', nombre: 'Universidad del Pacífico' },
  { id: 'unsa', nombre: 'Universidad Nacional de San Agustín (UNSA)' },
  { id: 'untels', nombre: 'Universidad Nacional Tecnológica de Lima Sur' },
  { id: 'unfv', nombre: 'Universidad Nacional Federico Villarreal' },
  { id: 'unac', nombre: 'Universidad Nacional del Callao' },
  { id: 'certus', nombre: 'Instituto CERTUS' },
  { id: 'tecsup', nombre: 'TECSUP' },
  { id: 'senati', nombre: 'SENATI' },
  { id: 'cibertec', nombre: 'Instituto CIBERTEC' },
  { id: 'isil', nombre: 'Instituto ISIL' },
  { id: 'toulouse', nombre: 'Instituto Toulouse Lautrec' },
  { id: 'idat', nombre: 'Instituto IDAT' },
  { id: 'sencico', nombre: 'SENCICO' },
  { id: 'aduni', nombre: 'Academia ADUNI' },
  { id: 'pamer', nombre: 'Pamer Academias' },
  { id: 'trilce', nombre: 'Trilce' },
  { id: 'innova-schools', nombre: 'Innova Schools' },
  { id: 'saco-oliveros', nombre: 'Saco Oliveros' },
  { id: 'pitagoras', nombre: 'Pitágoras' },
  { id: 'san-marcos-pre', nombre: 'Centro Pre San Marcos' },
  { id: 'colegio-otro', nombre: 'Colegio / Academia' },
  { id: 'otro', nombre: 'Otra institución' },
];

// ============================================================
// Nav links
// ============================================================
export const navLinks: V5NavLink[] = [
  { label: 'Planes', sectionId: 'financing' },
  { label: 'Rendimiento', sectionId: 'performance' },
  { label: 'Producto', sectionId: 'product-viewer' },
  // { label: 'Testimonios', sectionId: 'social-proof' },
];
