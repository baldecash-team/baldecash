/**
 * PDF Utilities - Funciones compartidas para generación de PDFs
 */

import { jsPDF, GState } from 'jspdf';
import { PDF_COLORS, PDF_LAYOUT, COMPANY_INFO, RGBColor } from './constants';
import { BALDECASH_LOGO_BASE64 } from '../baldecashLogo';

/**
 * Formatea una fecha en español (Perú)
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatea un número como moneda peruana (sin decimales)
 */
export const formatMoney = (amount: number): string => {
  return `S/${Math.floor(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Convierte una URL de imagen a base64
 */
export const loadImageAsBase64 = async (url: string): Promise<string> => {
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Intento 1: Fetch directo
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return blobToBase64(blob);
    }
  } catch {
    // Direct fetch failed, try external proxy
  }

  // Intento 2: Proxy externo
  const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }

  const blob = await response.blob();
  return blobToBase64(blob);
};

/**
 * Genera URL de QR Code usando API externa
 */
export const getQRCodeUrl = (data: string, size: number = 80): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&margin=0`;
};

/**
 * Carga un QR code como base64
 */
export const loadQRCodeAsBase64 = async (data: string, size: number = 80): Promise<string | null> => {
  try {
    const qrUrl = getQRCodeUrl(data, size);
    return await loadImageAsBase64(qrUrl);
  } catch {
    return null;
  }
};

/**
 * Dibuja el header estandarizado del PDF
 */
export const drawHeader = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  options: {
    showDate?: boolean;
    date?: Date;
    primaryColor?: readonly [number, number, number];
    /** Optional base64 logo override. Use when the page has a non-default brand logo. */
    logoBase64?: string;
    /** Logo display width in mm. Defaults to 50. */
    logoWidth?: number;
    /** Logo display height in mm. Defaults to 14. */
    logoHeight?: number;
    /** Dark mode: inverts bg/text for gamer-dark PDFs. */
    darkMode?: boolean;
  } = {}
): number => {
  const { showDate = true, date = new Date(), primaryColor, logoBase64, logoWidth = 50, logoHeight = 14, darkMode = false } = options;
  const primary = primaryColor ?? PDF_COLORS.primary;
  const headerBg: readonly [number, number, number] = darkMode ? [14, 14, 14] : PDF_COLORS.white;
  const mutedText: readonly [number, number, number] = darkMode ? [160, 160, 160] : PDF_COLORS.textMuted;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_LAYOUT.margin;
  let y = 12;

  // Fondo del header (blanco en light, negro en dark)
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, PDF_LAYOUT.headerHeight, 'F');

  // Línea de acento inferior
  doc.setFillColor(...primary);
  doc.rect(0, PDF_LAYOUT.headerHeight, pageWidth, 2, 'F');

  // Logo (derecha) — usa override si se provee, sino el default
  try {
    const logoSrc = logoBase64 || BALDECASH_LOGO_BASE64;
    const logoX = pageWidth - logoWidth - margin;
    doc.addImage(logoSrc, 'PNG', logoX, y, logoWidth, logoHeight);
  } catch {
    // Si falla el logo, mostrar texto
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont('Asap', 'bold');
    doc.text(COMPANY_INFO.name, pageWidth - margin, y + 10, { align: 'right' });
  }

  // Título
  doc.setTextColor(...primary);
  doc.setFontSize(18);
  doc.setFont('Asap', 'bold');
  doc.text(title, margin, y + 8);

  // Subtítulo / Fecha
  doc.setTextColor(...mutedText);
  doc.setFontSize(9);
  doc.setFont('Asap', 'normal');

  if (showDate) {
    doc.text(`${subtitle} • ${formatDate(date)}`, margin, y + 16);
  } else {
    doc.text(subtitle, margin, y + 16);
  }

  return PDF_LAYOUT.headerHeight + 8; // Retorna Y después del header
};

/**
 * Dibuja el footer estandarizado del PDF
 */
export const drawFooter = (
  doc: jsPDF,
  legalText: string,
  options: {
    pageNumber?: number;
    totalPages?: number;
    qrData?: string;
    qrBase64?: string | null;
    darkMode?: boolean;
  } = {}
): void => {
  const { pageNumber, totalPages, qrBase64, darkMode = false } = options;
  const borderColor: readonly [number, number, number] = darkMode ? [42, 42, 42] : PDF_COLORS.border;
  const mutedText: readonly [number, number, number] = darkMode ? [160, 160, 160] : PDF_COLORS.textMuted;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_LAYOUT.margin;
  const footerY = pageHeight - PDF_LAYOUT.footerHeight;

  // Línea separadora
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // QR Code (si está disponible)
  if (qrBase64) {
    try {
      const qrSize = 18;
      doc.addImage(qrBase64, 'PNG', pageWidth - margin - qrSize, footerY + 3, qrSize, qrSize);
    } catch {
      // Si falla, continuar sin QR
    }
  }

  // Texto legal
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text(legalText, margin, footerY + 6);

  // Info de empresa
  doc.text(`${COMPANY_INFO.name} - ${COMPANY_INFO.tagline} | ${COMPANY_INFO.website}`, margin, footerY + 11);

  // Número de página (derecha)
  if (pageNumber && totalPages) {
    const pageText = `Página ${pageNumber} de ${totalPages}`;
    const textWidth = doc.getTextWidth(pageText);
    const xPos = qrBase64 ? pageWidth - margin - 22 - textWidth : pageWidth - margin - textWidth;
    doc.text(pageText, xPos, footerY + 6);
  }
};

/**
 * Dibuja watermark diagonal "REFERENCIAL"
 */
export const drawWatermark = (
  doc: jsPDF,
  text: string = 'REFERENCIAL'
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();

  // Configurar opacidad baja
  doc.setGState(new GState({ opacity: 0.08 }));
  doc.setTextColor(...PDF_COLORS.watermark);
  doc.setFontSize(60);
  doc.setFont('Asap', 'bold');

  // Rotar y centrar
  const textWidth = doc.getTextWidth(text);
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // Guardar estado, rotar, dibujar, restaurar
  doc.text(text, centerX, centerY, {
    angle: -35,
    align: 'center',
  });

  doc.restoreGraphicsState();
};

/**
 * Dibuja una card con sombra y bordes redondeados
 */
export const drawCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    shadow?: boolean;
    radius?: number;
    fillColor?: RGBColor;
    borderColor?: RGBColor;
    darkMode?: boolean;
  } = {}
): void => {
  const { darkMode = false } = options;
  const {
    shadow = true,
    radius = PDF_LAYOUT.cardRadius,
    fillColor = darkMode ? ([26, 26, 26] as const) : PDF_COLORS.cardBg,
    borderColor = darkMode ? ([42, 42, 42] as const) : PDF_COLORS.border,
  } = options;

  // Sombra (rectángulo offset gris)
  if (shadow) {
    doc.setFillColor(0, 0, 0);
    doc.setGState(new GState({ opacity: 0.06 }));
    doc.roundedRect(x + 1, y + 1, width, height, radius, radius, 'F');
    doc.setGState(new GState({ opacity: 1 }));
  }

  // Card background
  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, width, height, radius, radius, 'F');

  // Border
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, radius, radius, 'S');
};

/**
 * Añade el fondo de página
 */
export const drawPageBackground = (doc: jsPDF, options: { darkMode?: boolean } = {}): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const bg: readonly [number, number, number] = options.darkMode ? [14, 14, 14] : PDF_COLORS.pageBg;
  doc.setFillColor(...bg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
};

/**
 * Cuenta el total de páginas de un documento
 * (Debe llamarse después de que el PDF esté completo)
 */
export const getTotalPages = (doc: jsPDF): number => {
  return doc.internal.pages.length - 1; // pages es 1-indexed en jsPDF
};

/**
 * Agrega footers a todas las páginas
 */
export const addFootersToAllPages = (
  doc: jsPDF,
  legalText: string,
  qrBase64?: string | null,
  options: { darkMode?: boolean } = {}
): void => {
  const totalPages = getTotalPages(doc);

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, legalText, {
      pageNumber: i,
      totalPages,
      qrBase64: qrBase64 || undefined,
      darkMode: options.darkMode,
    });
  }
};

/**
 * Agrega watermarks a todas las páginas
 */
export const addWatermarksToAllPages = (
  doc: jsPDF,
  text: string = 'REFERENCIAL'
): void => {
  const totalPages = getTotalPages(doc);

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawWatermark(doc, text);
  }
};
