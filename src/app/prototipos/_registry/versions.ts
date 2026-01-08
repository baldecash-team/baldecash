// Registry de versiones de prototipos - Auto-discovery system
// Agregar nuevas versiones aquí para que aparezcan en el home

export interface VersionConfig {
  version: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind gradient classes
  badge?: string;
  status: 'draft' | 'in_progress' | 'ready' | 'archived';
  sections: SectionStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionStatus {
  id: string;
  name: string;
  path: string;
  status: 'pending' | 'in_progress' | 'done';
  promptNumber: string;
}

// Mapeo de secciones del sistema
export const SECTION_MAP: Record<string, { name: string; promptNumber: string }> = {
  hero: { name: 'Hero Landing', promptNumber: '01' },
  catalogo: { name: 'Catálogo', promptNumber: '02-03' },
  detalle: { name: 'Detalle Producto', promptNumber: '04' },
  comparador: { name: 'Comparador', promptNumber: '05' },
  quiz: { name: 'Quiz Ayuda', promptNumber: '06' },
  estados: { name: 'Estados Vacíos', promptNumber: '07' },
  wizard: { name: 'Wizard/Form', promptNumber: '08-13' },
  'wizard-solicitud': { name: 'Wizard Solicitud Completo', promptNumber: '08-13, 18' },
  upsell: { name: 'Upsell', promptNumber: '14' },
  aprobacion: { name: 'Aprobación', promptNumber: '15' },
  rechazo: { name: 'Rechazo', promptNumber: '16' },
  convenio: { name: 'Convenio Landing', promptNumber: '17' },
};

// Registro de todas las versiones
export const VERSION_REGISTRY: VersionConfig[] = [
  {
    version: '0.1',
    title: 'UI Components Comparison',
    description: 'Comparación de NextUI, DaisyUI y Shadcn UI con pros/cons y casos de uso',
    icon: 'Palette',
    color: 'from-violet-500 to-purple-500',
    status: 'ready',
    sections: [],
    createdAt: '2025-12-01',
    updatedAt: '2025-12-10',
  },
  {
    version: '0.2',
    title: 'Hero Section 2.0',
    description: 'Componentes del Hero con múltiples variantes para A/B testing - Mobile-first',
    icon: 'Sparkles',
    color: 'from-indigo-500 to-cyan-500',
    badge: 'Estable',
    status: 'ready',
    sections: [
      { id: 'hero', name: 'Hero Landing', path: '/prototipos/0.2', status: 'done', promptNumber: '01' },
    ],
    createdAt: '2025-12-10',
    updatedAt: '2025-12-15',
  },
  {
    version: '0.3',
    title: 'Landing Completa v0.3',
    description: 'Iteración completa del landing con todas las secciones del flujo de compra',
    icon: 'Layers',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Completada',
    status: 'ready',
    sections: [
      { id: 'hero', name: 'Hero', path: '/prototipos/0.3/hero', status: 'done', promptNumber: '01' },
      { id: 'catalogo', name: 'Catálogo', path: '/prototipos/0.3/catalogo', status: 'done', promptNumber: '02-03' },
      { id: 'detalle', name: 'Detalle', path: '/prototipos/0.3/detalle', status: 'done', promptNumber: '04' },
      { id: 'comparador', name: 'Comparador', path: '/prototipos/0.3/comparador', status: 'done', promptNumber: '05' },
      { id: 'quiz', name: 'Quiz', path: '/prototipos/0.3/quiz', status: 'done', promptNumber: '06' },
      { id: 'estados', name: 'Estados Vacíos', path: '/prototipos/0.3/estados', status: 'done', promptNumber: '07' },
      { id: 'wizard', name: 'Wizard', path: '/prototipos/0.3/wizard', status: 'done', promptNumber: '08-13' },
      { id: 'solicitud', name: 'Solicitud', path: '/prototipos/0.3/solicitud', status: 'done', promptNumber: '08' },
      { id: 'upsell', name: 'Upsell', path: '/prototipos/0.3/upsell', status: 'done', promptNumber: '14' },
      { id: 'aprobacion', name: 'Aprobación', path: '/prototipos/0.3/aprobacion', status: 'done', promptNumber: '15' },
      { id: 'rechazo', name: 'Rechazo', path: '/prototipos/0.3/rechazo', status: 'done', promptNumber: '16' },
    ],
    createdAt: '2025-12-15',
    updatedAt: '2025-12-19',
  },
  {
    version: '0.4',
    title: 'Landing Optimizada v0.4',
    description: 'Refinamiento y optimizaciones de la landing completa con mejoras de UX',
    icon: 'Rocket',
    color: 'from-[#4654CD] to-[#03DBD0]',
    badge: 'Listo',
    status: 'ready',
    sections: [
      { id: 'hero', name: 'Hero', path: '/prototipos/0.4/hero', status: 'done', promptNumber: '01' },
      { id: 'catalogo', name: 'Catálogo', path: '/prototipos/0.4/catalogo', status: 'done', promptNumber: '02-03' },
      { id: 'detalle', name: 'Detalle', path: '/prototipos/0.4/producto/detail-preview', status: 'done', promptNumber: '04' },
      { id: 'comparador', name: 'Comparador', path: '/prototipos/0.4/comparador', status: 'done', promptNumber: '05' },
      { id: 'quiz', name: 'Quiz', path: '/prototipos/0.4/quiz/quiz-preview', status: 'done', promptNumber: '06' },
      { id: 'estados', name: 'Estados Vacíos', path: '/prototipos/0.4/catalogo/empty-preview', status: 'done', promptNumber: '07' },
      { id: 'wizard-solicitud', name: 'Wizard Solicitud', path: '/prototipos/0.4/wizard-solicitud/wizard-preview', status: 'done', promptNumber: '08-13, 18' },
      { id: 'upsell', name: 'Upsell', path: '/prototipos/0.4/upsell', status: 'done', promptNumber: '14' },
      { id: 'aprobacion', name: 'Aprobación', path: '/prototipos/0.4/resultado/aprobado-preview', status: 'done', promptNumber: '15' },
      { id: 'rechazo', name: 'Rechazo', path: '/prototipos/0.4/resultado/rechazado-preview', status: 'done', promptNumber: '16' },
      { id: 'convenio', name: 'Convenio', path: '/prototipos/0.4/convenio', status: 'done', promptNumber: '17' },
    ],
    createdAt: '2025-12-19',
    updatedAt: '2025-12-21',
  },
  {
    version: '0.5',
    title: 'Catálogo Iterativo v0.5',
    description: 'Iteración del catálogo con ColorSelector configurable y sistema de feedback',
    icon: 'Palette',
    color: 'from-[#4654CD] to-[#03DBD0]',
    badge: 'En desarrollo',
    status: 'in_progress',
    sections: [
      { id: 'hero', name: 'Hero', path: '/prototipos/0.5/hero/hero-preview', status: 'done', promptNumber: '01' },
      { id: 'catalogo', name: 'Catálogo', path: '/prototipos/0.5/catalogo/catalog-preview', status: 'done', promptNumber: '02-03' },
      { id: 'detalle', name: 'Detalle', path: '/prototipos/0.5/producto/detail-preview', status: 'done', promptNumber: '04' },
      { id: 'comparador', name: 'Comparador', path: '/prototipos/0.5/comparador/comparator-preview', status: 'done', promptNumber: '05' },
      { id: 'quiz', name: 'Quiz', path: '/prototipos/0.5/quiz/quiz-preview', status: 'pending', promptNumber: '06' },
      { id: 'estados', name: 'Estados Vacíos', path: '/prototipos/0.5/catalogo/empty-preview', status: 'done', promptNumber: '07' },
      { id: 'wizard-solicitud', name: 'Wizard Solicitud', path: '/prototipos/0.5/wizard-solicitud/wizard-preview', status: 'done', promptNumber: '08-13, 18' },
      { id: 'upsell', name: 'Upsell', path: '/prototipos/0.5/upsell/upsell-preview', status: 'done', promptNumber: '14' },
      { id: 'aprobacion', name: 'Aprobación', path: '/prototipos/0.5/aprobacion/aprobado-preview', status: 'done', promptNumber: '15' },
      { id: 'rechazo', name: 'Rechazo', path: '/prototipos/0.5/resultado/rechazado-preview', status: 'pending', promptNumber: '16' },
      { id: 'convenio', name: 'Convenio', path: '/prototipos/0.5/convenio', status: 'pending', promptNumber: '17' },
    ],
    createdAt: '2026-01-06',
    updatedAt: '2026-01-08',
  },
];

// Legacy prototypes (non-versioned)
export const LEGACY_PROTOTYPES = [
  {
    id: 'laptops',
    title: 'E-commerce Laptops',
    description: 'Catálogo con financiamiento, calculadora de cuotas y flujo conversacional',
    href: '/prototipos/laptops',
    icon: 'Laptop',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'fintech',
    title: 'Fintech BaldeCash',
    description: 'Mobile-First Conversational Wizard para financiamiento estudiantil',
    href: '/prototipos/fintech',
    icon: 'Wallet',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Super-App',
    description: 'Panel tipo Nubank/Yape con widgets de crédito y productos destacados',
    href: '/prototipos/dashboard',
    icon: 'LayoutDashboard',
    color: 'from-purple-500 to-pink-500',
  },
];

// Helper functions
export const getVersionByNumber = (version: string): VersionConfig | undefined => {
  return VERSION_REGISTRY.find((v) => v.version === version);
};

export const getActiveVersions = (): VersionConfig[] => {
  return VERSION_REGISTRY.filter((v) => v.status !== 'archived');
};

export const getLatestVersion = (): VersionConfig => {
  return VERSION_REGISTRY[VERSION_REGISTRY.length - 1];
};

export const getAdjacentVersions = (current: string): { prev?: VersionConfig; next?: VersionConfig } => {
  const versions = getActiveVersions();
  const currentIndex = versions.findIndex((v) => v.version === current);

  return {
    prev: currentIndex > 0 ? versions[currentIndex - 1] : undefined,
    next: currentIndex < versions.length - 1 ? versions[currentIndex + 1] : undefined,
  };
};

export const getVersionProgress = (version: VersionConfig): number => {
  if (version.sections.length === 0) return 100;
  const done = version.sections.filter((s) => s.status === 'done').length;
  return Math.round((done / version.sections.length) * 100);
};
