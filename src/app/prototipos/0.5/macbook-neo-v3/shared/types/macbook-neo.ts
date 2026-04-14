// Types for MacBook Neo V3 Landing — BaldeCash v0.5

export type MacbookNeoColor = 'citrus' | 'blush' | 'indigo' | 'silver';

export interface MacbookNeoColorOption {
  id: MacbookNeoColor;
  label: string;
  hex: string;
  imagePath: string;
}

export interface HighlightTab {
  id: string;
  label: string;
  imagePath: string;
  videoSrc?: string;
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

export interface PerformanceSlide {
  id: string;
  imagePath: string;
  videoSrc?: string;
  title: string;
  description: string;
}

export interface DisplayStat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export interface MacOSFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ContinuityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PrivacyItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}
