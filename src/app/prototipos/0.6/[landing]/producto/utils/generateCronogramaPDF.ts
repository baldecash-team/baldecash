/**
 * Generador de PDF para Cronograma de Pagos
 * Usa utilidades compartidas de ./pdf/
 */

import { jsPDF } from 'jspdf';
import {
  PDF_COLORS,
  PDF_LAYOUT,
  LEGAL_TEXTS,
  formatMoney,
  drawHeader,
  drawCard,
  drawPageBackground,
  addFootersToAllPages,
  addWatermarksToAllPages,
  loadImageAsBase64,
  loadQRCodeAsBase64,
  registerAsapFont,
} from './pdf';

// Tipos para los datos del cronograma
interface AmortizationRow {
  month: number;
  date: string;
  capital: number;
  interest: number;
  quota: number;
  balance: number;
}

interface FinancialData {
  tea: number;
  tcea: number;
  comisionDesembolso: number;
  seguroDesgravamen: number;
  seguroMultiriesgo: number;
  gastoNotarial: number;
}

interface CronogramaPDFData {
  productName: string;
  productBrand: string;
  productPrice: number;
  productUrl?: string;
  term: number;
  monthlyQuota: number;
  totalPayment: number;
  amortizationSchedule: AmortizationRow[];
  financialData: FinancialData;
  generatedDate: Date;
  // Cuota inicial (opcional)
  initialAmount?: number;
  initialPercent?: number;
  /** Optional primary color override (RGB tuple). Defaults to BaldeCash blue. */
  primaryColor?: readonly [number, number, number];
  /** Optional primary light color override. Derived from primaryColor if omitted. */
  primaryLightColor?: readonly [number, number, number];
  /** Optional logo URL (public path). Loaded as base64 and used in header. */
  logoUrl?: string;
  /** Logo display width in mm. Defaults to 50. */
  logoWidth?: number;
  /** Logo display height in mm. Defaults to 14. */
  logoHeight?: number;
  /** Dark mode: renders PDF on black background with light text (gamer-dark). */
  darkMode?: boolean;
}

/**
 * Genera y descarga el PDF del cronograma de pagos
 */
export const generateCronogramaPDF = async (data: CronogramaPDFData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_LAYOUT.margin;
  const contentWidth = pageWidth - margin * 2;

  // Theme & color resolution
  const PRIMARY_DEFAULT = PDF_COLORS.primary;
  const PRIMARY_LIGHT_DEFAULT = PDF_COLORS.primaryLight;
  const TEXT_LIGHT = PDF_COLORS.text;
  const TEXT_MUTED_LIGHT = PDF_COLORS.textMuted;
  const BORDER_LIGHT = PDF_COLORS.border;
  const PAGE_BG_LIGHT = PDF_COLORS.pageBg;
  const CARD_BG_LIGHT = PDF_COLORS.cardBg;
  const SUCCESS_DEFAULT = PDF_COLORS.success;
  const SUCCESS_BG_DEFAULT = PDF_COLORS.successBg;
  const isDark = !!data.darkMode;
  const primary = data.primaryColor ?? PRIMARY_DEFAULT;
  const primaryLight = data.primaryLightColor ?? (data.primaryColor
    ? (isDark
        ? [
            Math.round(primary[0] * 0.15),
            Math.round(primary[1] * 0.15),
            Math.round(primary[2] * 0.15),
          ] as const
        : [
            Math.round(primary[0] + (255 - primary[0]) * 0.92),
            Math.round(primary[1] + (255 - primary[1]) * 0.92),
            Math.round(primary[2] + (255 - primary[2]) * 0.92),
          ] as const)
    : PRIMARY_LIGHT_DEFAULT);
  const text: readonly [number, number, number] = isDark ? [240, 240, 240] : TEXT_LIGHT;
  const textMuted: readonly [number, number, number] = isDark ? [160, 160, 160] : TEXT_MUTED_LIGHT;
  const border: readonly [number, number, number] = isDark ? [42, 42, 42] : BORDER_LIGHT;
  const pageBg: readonly [number, number, number] = isDark ? [14, 14, 14] : PAGE_BG_LIGHT;
  const cardBg: readonly [number, number, number] = isDark ? [26, 26, 26] : CARD_BG_LIGHT;
  // "Total a Pagar" — usa primary en gamer, success (verde) por defecto
  const accentColor: readonly [number, number, number] = data.primaryColor ? primary : SUCCESS_DEFAULT;
  const accentBg: readonly [number, number, number] = data.primaryColor ? primaryLight : SUCCESS_BG_DEFAULT;
  // Header button text color (text sobre fondo primary): negro en dark (cyan), blanco en light
  const onPrimary: readonly [number, number, number] = isDark ? [10, 10, 10] : [255, 255, 255];

  // Registrar fuente Asap (misma que usa la web)
  registerAsapFont(doc);

  // Cargar QR code si hay URL del producto
  let qrBase64: string | null = null;
  if (data.productUrl) {
    qrBase64 = await loadQRCodeAsBase64(data.productUrl, 80);
  }

  // Load custom logo if provided
  let logoBase64: string | undefined;
  if (data.logoUrl) {
    try {
      logoBase64 = await loadImageAsBase64(data.logoUrl) ?? undefined;
    } catch {
      logoBase64 = undefined;
    }
  }

  // Fondo de página
  drawPageBackground(doc, { darkMode: isDark });

  // Header estandarizado
  let y = drawHeader(doc, 'Cronograma de Pagos', 'Detalle de financiamiento', {
    showDate: true,
    date: data.generatedDate,
    primaryColor: data.primaryColor,
    logoBase64,
    logoWidth: data.logoWidth,
    logoHeight: data.logoHeight,
    darkMode: isDark,
  });

  // ===== DATOS DEL PRODUCTO =====
  doc.setTextColor(...text);
  doc.setFontSize(14);
  doc.setFont('Asap', 'bold');
  doc.text('Datos del Producto', margin, y);
  y += 6;

  drawCard(doc, margin, y, contentWidth, 30, { shadow: false, darkMode: isDark });
  y += 8;

  doc.setFontSize(11);
  doc.setFont('Asap', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Producto:', margin + 5, y);
  doc.setTextColor(...text);
  doc.setFont('Asap', 'bold');
  doc.text(`${data.productBrand} ${data.productName}`, margin + 35, y);
  y += 8;

  doc.setFont('Asap', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Precio:', margin + 5, y);
  doc.setTextColor(...text);
  doc.setFont('Asap', 'bold');
  doc.text(formatMoney(data.productPrice), margin + 35, y);

  doc.setFont('Asap', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Plazo:', pageWidth / 2, y);
  doc.setTextColor(...text);
  doc.setFont('Asap', 'bold');
  doc.text(`${data.term} meses`, pageWidth / 2 + 25, y);
  y += 8;

  doc.setFont('Asap', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Cuota:', margin + 5, y);
  doc.setTextColor(...primary);
  doc.setFont('Asap', 'bold');
  doc.text(`${formatMoney(data.monthlyQuota)}/mes`, margin + 35, y);

  // Cuota inicial (si aplica)
  if (data.initialAmount && data.initialPercent) {
    doc.setFont('Asap', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(`Inicial (${data.initialPercent}%):`, pageWidth / 2, y);
    doc.setTextColor(...text);
    doc.setFont('Asap', 'bold');
    doc.text(formatMoney(data.initialAmount), pageWidth / 2 + 35, y);
  }

  y += 22;

  // ===== TASAS E INFORMACIÓN FINANCIERA =====
  doc.setTextColor(...text);
  doc.setFontSize(14);
  doc.setFont('Asap', 'bold');
  doc.text('Información Financiera', margin, y);
  y += 6;

  const colWidth = (contentWidth) / 3;

  // TEA
  drawCard(doc, margin, y, colWidth - 5, 25, { shadow: false, darkMode: isDark });
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  doc.text('TEA', margin + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...text);
  doc.setFont('Asap', 'bold');
  doc.text(`${data.financialData.tea}%`, margin + 5, y + 18);

  // TCEA
  drawCard(doc, margin + colWidth, y, colWidth - 5, 25, { shadow: false, darkMode: isDark });
  doc.setFontSize(9);
  doc.setFont('Asap', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('TCEA', margin + colWidth + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...text);
  doc.setFont('Asap', 'bold');
  doc.text(`${data.financialData.tcea}%`, margin + colWidth + 5, y + 18);

  // Total
  drawCard(doc, margin + colWidth * 2, y, colWidth - 5, 25, {
    shadow: false,
    darkMode: isDark,
    fillColor: accentBg as [number, number, number],
  });
  doc.setFontSize(9);
  doc.setFont('Asap', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Total a Pagar', margin + colWidth * 2 + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...accentColor);
  doc.setFont('Asap', 'bold');
  doc.text(formatMoney(data.totalPayment), margin + colWidth * 2 + 5, y + 18);

  y += 38;

  // ===== TABLA DE AMORTIZACIÓN =====
  doc.setTextColor(...text);
  doc.setFontSize(14);
  doc.setFont('Asap', 'bold');
  doc.text('Tabla de Amortización', margin, y);
  y += 6;

  // Header de tabla
  const tableHeaders = ['Cuota', 'Fecha', 'Capital', 'Interés', 'Monto', 'Saldo'];
  const colWidths = [20, 45, 30, 30, 30, 30];
  const headerHeight = 12;
  let x = margin;

  doc.setFillColor(...primary);
  doc.rect(margin, y, contentWidth, headerHeight, 'F');
  doc.setTextColor(...onPrimary);
  doc.setFontSize(9);
  doc.setFont('Asap', 'bold');

  tableHeaders.forEach((header, i) => {
    doc.text(header, x + 3, y + 8);
    x += colWidths[i];
  });

  y += headerHeight + 2;

  // Filas de la tabla
  doc.setFont('Asap', 'normal');
  doc.setFontSize(8);

  const rowHeight = 7;

  data.amortizationSchedule.forEach((row, index) => {
    // Nueva página si estamos cerca del final
    if (y > pageHeight - PDF_LAYOUT.footerHeight - 10) {
      doc.addPage();
      drawPageBackground(doc, { darkMode: isDark });
      y = margin;

      // Repetir header en nueva página
      x = margin;
      doc.setFillColor(...primary);
      doc.rect(margin, y, contentWidth, headerHeight, 'F');
      doc.setTextColor(...onPrimary);
      doc.setFontSize(9);
      doc.setFont('Asap', 'bold');

      tableHeaders.forEach((header, i) => {
        doc.text(header, x + 3, y + 8);
        x += colWidths[i];
      });

      y += headerHeight + 2;
      doc.setFont('Asap', 'normal');
      doc.setFontSize(8);
    }

    // Alternar color de fondo (zebra)
    if (index % 2 === 0) {
      // Dark: use slightly lighter than pageBg; Light: use pageBg (slightly off-white)
      doc.setFillColor(...(isDark ? cardBg : pageBg));
      doc.rect(margin, y - 2, contentWidth, rowHeight, 'F');
    }

    x = margin;
    doc.setTextColor(...text);

    // Número de cuota
    doc.text(String(row.month), x + 2, y + 3);
    x += colWidths[0];

    // Fecha
    doc.text(row.date, x + 2, y + 3);
    x += colWidths[1];

    // Capital
    doc.text(formatMoney(row.capital), x + 2, y + 3);
    x += colWidths[2];

    // Interés
    doc.setTextColor(...textMuted);
    doc.text(formatMoney(row.interest), x + 2, y + 3);
    x += colWidths[3];

    // Monto (cuota)
    doc.setTextColor(...text);
    doc.setFont('Asap', 'bold');
    doc.text(formatMoney(row.quota), x + 2, y + 3);
    doc.setFont('Asap', 'normal');
    x += colWidths[4];

    // Saldo
    doc.setTextColor(...textMuted);
    doc.text(formatMoney(row.balance), x + 2, y + 3);

    y += rowHeight;
  });

  // ===== WATERMARK Y FOOTER =====
  addWatermarksToAllPages(doc, LEGAL_TEXTS.watermark);
  addFootersToAllPages(doc, LEGAL_TEXTS.cronograma, qrBase64, { darkMode: isDark });

  // Descargar
  const fileName = `cronograma-${data.productBrand.toLowerCase().replace(/\s+/g, '-')}-${data.term}meses.pdf`;
  doc.save(fileName);
};

export default generateCronogramaPDF;
