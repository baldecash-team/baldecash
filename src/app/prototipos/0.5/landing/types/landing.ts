// Landing Types - BaldeCash v0.5

// ============================================
// Banner de Captación - Versiones iterables
// ============================================

// Layout del banner (estructura visual)
export type LayoutVersion = 1 | 2 | 3 | 4 | 5 | 6;

// Contenido/mensaje del banner
export type BannerVersion = 1 | 2 | 3;

export interface LandingConfig {
  layoutVersion: LayoutVersion;
  bannerVersion: BannerVersion;
}

export const defaultLandingConfig: LandingConfig = {
  layoutVersion: 1,
  bannerVersion: 1,
};

// Labels para layouts
export const layoutVersionLabels: Record<LayoutVersion, { name: string; description: string }> = {
  1: {
    name: 'Split Clásico',
    description: 'Imagen izquierda (55%) + Formulario derecha (45%)',
  },
  2: {
    name: 'Split Invertido',
    description: 'Formulario izquierda + Imagen derecha',
  },
  3: {
    name: 'Hero Centrado',
    description: 'Imagen full-width con contenido centrado',
  },
  4: {
    name: 'Card Flotante',
    description: 'Imagen full-width con formulario flotante lateral',
  },
  5: {
    name: 'Minimalista',
    description: 'Sin imagen, fondo gradiente, formulario destacado',
  },
  6: {
    name: 'Video Hero',
    description: 'Video de fondo con formulario overlay',
  },
};

// Labels para contenido/mensaje
export const bannerVersionLabels: Record<BannerVersion, { name: string; description: string }> = {
  1: {
    name: 'Cuota mínima',
    description: 'Destaca "Desde S/XX al mes"',
  },
  2: {
    name: 'Sin inicial',
    description: 'Destaca "0% inicial"',
  },
  3: {
    name: 'Regalo incluido',
    description: 'Destaca accesorio gratis',
  },
};

// ============================================
// Campaign Data
// ============================================

export interface CampaignData {
  id: string;
  slug: string;
  nombre: string;
  titulo: string;
  subtitulo: string;
  colorPrimario: string;
  colorSecundario: string;
  bannerTexto: string;
  activo: boolean;
}

export interface LandingBenefit {
  id: string;
  icon: string;
  texto: string;
}

export interface LandingProduct {
  id: string;
  nombre: string;
  imagen: string;
  cuotaMensual: number;
  precioTotal: number;
  destacado?: boolean;
}

export interface Region {
  id: string;
  nombre: string;
  provincias: Provincia[];
}

export interface Provincia {
  id: string;
  nombre: string;
}

export interface InstitucionEducativa {
  id: string;
  nombre: string;
  tipo: 'universidad' | 'instituto' | 'colegio' | 'otro';
}

export interface LeadFormData {
  correo: string;
  whatsapp: string;
  dni: string;
  regionId: string;
  provinciaId: string;
  institucionId: string;
  aceptaTerminos: boolean;
  aceptaPromociones: boolean;
}
