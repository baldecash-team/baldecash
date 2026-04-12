// Types for MacBook Neo Landing - BaldeCash v0.5

export type MacbookNeoColor = 'citrus' | 'blush' | 'indigo' | 'silver';

export interface MacbookNeoColorOption {
  id: MacbookNeoColor;
  label: string;           // Spanish: "Cítrico", "Rubor", "Índigo", "Plata"
  hex: string;             // Actual CSS color for the dot selector
  imagePath: string;       // /images/macbook-neo/pv_colors_{color}_2x.jpg
}

export interface ScrollStory {
  id: string;
  color: MacbookNeoColor;
  imagePath: string;
  headline: string;        // Short colored headline
  headlineColor: string;   // Hex color for the headline text
  description: string;     // Longer description paragraph
  scrollStart: number;     // 0-1 range where story begins
  scrollEnd: number;       // 0-1 range where story ends
}

export interface HighlightCard {
  id: string;
  imagePath: string;
  title: string;
  description: string;
  badge?: string;
}

export interface SpecItem {
  id: string;
  icon: string;            // lucide-react icon name
  label: string;
  value: string;
  description?: string;
}

export interface FinancingPlan {
  id: string;
  nombre: string;
  cuotaMensual: number;
  plazoMeses: number;
  cuotaInicial: number;
  precioTotal: number;
  destacado?: boolean;
}

export interface HowItWorksStep {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  icon: string;
}

// Settings config
export type ScrollSpeedVersion = 1 | 2;

export interface MacbookNeoConfig {
  selectedColor: MacbookNeoColor;
  scrollSpeed: ScrollSpeedVersion;
}

export const defaultMacbookNeoConfig: MacbookNeoConfig = {
  selectedColor: 'citrus',
  scrollSpeed: 1,
};

export const scrollSpeedLabels: Record<ScrollSpeedVersion, { name: string; description: string }> = {
  1: { name: 'Normal', description: 'Velocidad estándar de scroll storytelling' },
  2: { name: 'Lento', description: 'Más tiempo por historia (500vh)' },
};

export const colorLabels: Record<MacbookNeoColor, { name: string; description: string }> = {
  citrus: { name: 'Cítrico', description: 'Amarillo vibrante' },
  blush: { name: 'Rubor', description: 'Rosa suave' },
  indigo: { name: 'Índigo', description: 'Azul profundo' },
  silver: { name: 'Plata', description: 'Plateado clásico' },
};
