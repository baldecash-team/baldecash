export type MacbookNeoColor = 'citrus' | 'blush' | 'indigo' | 'silver';

export interface MacbookNeoColorOption {
  id: MacbookNeoColor;
  label: string;
  hex: string;
  imagePath: string;
}

export interface ScrollStory {
  id: string;
  color: MacbookNeoColor;
  imagePath: string;
  headline: string;
  headlineColor: string;
  description: string;
  scrollStart: number;
  scrollEnd: number;
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
  icon: string;
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
