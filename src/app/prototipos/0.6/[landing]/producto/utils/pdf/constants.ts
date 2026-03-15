/**
 * PDF Constants - Colores, márgenes y configuración compartida
 * Usado por generateSpecSheetPDF y generateCronogramaPDF
 */

// Colores del tema BaldeCash (formato RGB para jsPDF)
export const PDF_COLORS = {
  // Primario
  primary: [61, 71, 176] as const,        // #3D47B0
  primaryLight: [239, 240, 250] as const, // primary/5%

  // Texto
  text: [23, 23, 23] as const,            // neutral-900
  textMuted: [115, 115, 115] as const,    // neutral-500
  textLight: [163, 163, 163] as const,    // neutral-400

  // Fondos
  white: [255, 255, 255] as const,
  pageBg: [250, 250, 250] as const,       // neutral-50
  cardBg: [255, 255, 255] as const,
  lightGray: [245, 245, 245] as const,    // neutral-100

  // Bordes
  border: [229, 229, 229] as const,       // neutral-200
  borderLight: [243, 243, 243] as const,  // neutral-100

  // Estados
  success: [22, 163, 74] as const,        // green-600
  successBg: [236, 253, 245] as const,    // green-50

  // Watermark
  watermark: [200, 200, 200] as const,    // gray for watermark
} as const;

// Tipo helper para los colores
export type RGBColor = readonly [number, number, number];

// Márgenes y dimensiones
export const PDF_LAYOUT = {
  margin: 15,
  headerHeight: 35,
  footerHeight: 25,
  lineHeight: 5,
  cardRadius: 4,
  cardPadding: 8,
  gap: 8,
} as const;

// Fuentes
export const PDF_FONTS = {
  title: { size: 18, style: 'bold' as const },
  subtitle: { size: 14, style: 'bold' as const },
  body: { size: 10, style: 'normal' as const },
  small: { size: 8, style: 'normal' as const },
  tiny: { size: 7, style: 'normal' as const },
} as const;

// Información de la empresa
export const COMPANY_INFO = {
  name: 'BaldeCash',
  tagline: 'Financiamiento para estudiantes',
  website: 'www.baldecash.com',
  fullUrl: 'https://www.baldecash.com',
} as const;

// Textos legales
export const LEGAL_TEXTS = {
  specSheet: 'Las especificaciones pueden variar según el modelo y configuración.',
  cronograma: 'Esta información es referencial. Las tasas y condiciones finales serán confirmadas al momento de la aprobación.',
  watermark: 'REFERENCIAL',
} as const;
