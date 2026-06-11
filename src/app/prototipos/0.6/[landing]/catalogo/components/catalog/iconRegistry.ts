/**
 * iconRegistry.ts - Centralized icon mappings for catalog filters
 *
 * Single source of truth for all icon mappings used in:
 * - TechnicalFiltersStyled.tsx
 * - UsageFilter.tsx
 * - QuickUsageCards.tsx
 *
 * Keys must match the backend UsageCode enum values exactly:
 * estudios, gaming, diseno, oficina, programacion
 */

import {
  GraduationCap,
  Gamepad2,
  Palette,
  Briefcase,
  Code,
  Package,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';

// ============================================
// USAGE ICONS
// Keys match backend UsageCode enum (products.py)
// ============================================
export const usageIconMap: Record<string, LucideIcon> = {
  estudios: GraduationCap,
  gaming: Gamepad2,
  diseno: Palette,
  oficina: Briefcase,
  programacion: Code,
};

// Default icon when usage code is not found
export const defaultUsageIcon: LucideIcon = Briefcase;

// ============================================
// USAGE LABELS (for QuickUsageCards)
// ============================================
export const usageLabels: Record<string, string> = {
  estudios: 'Para estudiar',
  gaming: 'Para jugar',
  diseno: 'Para crear',
  oficina: 'Para trabajar',
  programacion: 'Programación',
};

export const usageDescriptions: Record<string, string> = {
  estudios: 'Clases online, investigación y proyectos',
  gaming: 'Juegos, streaming y multimedia',
  diseno: 'Diseño gráfico, video y fotografía',
  oficina: 'Excel, reuniones y multitarea',
  programacion: 'Desarrollo de software y coding',
};

// ============================================
// CONDITION ICONS
// ============================================
export const conditionIconMap: Record<string, LucideIcon> = {
  nuevo: Package,
  reacondicionado: CheckCircle2,
};

export const defaultConditionIcon: LucideIcon = Package;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the icon component for a usage code
 */
export const getUsageIcon = (usageCode: string): LucideIcon => {
  return usageIconMap[usageCode] || defaultUsageIcon;
};

/**
 * Get the icon component for a condition code
 */
export const getConditionIcon = (conditionCode: string): LucideIcon => {
  return conditionIconMap[conditionCode] || defaultConditionIcon;
};

/**
 * Get usage label for display
 */
export const getUsageLabel = (usageCode: string): string => {
  return usageLabels[usageCode] || usageCode;
};

/**
 * Get usage description for display
 */
export const getUsageDescription = (usageCode: string): string => {
  return usageDescriptions[usageCode] || '';
};
