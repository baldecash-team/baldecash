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
  loadQRCodeAsBase64,
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

  // Cargar QR code si hay URL del producto
  let qrBase64: string | null = null;
  if (data.productUrl) {
    qrBase64 = await loadQRCodeAsBase64(data.productUrl, 80);
  }

  // Fondo de página
  drawPageBackground(doc);

  // Header estandarizado
  let y = drawHeader(doc, 'Cronograma de Pagos', 'Detalle de financiamiento', {
    showDate: true,
    date: data.generatedDate,
  });

  // ===== DATOS DEL PRODUCTO =====
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Producto', margin, y);
  y += 6;

  drawCard(doc, margin, y, contentWidth, 30, { shadow: false });
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('Producto:', margin + 5, y);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.productBrand} ${data.productName}`, margin + 35, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('Precio:', margin + 5, y);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMoney(data.productPrice), margin + 35, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('Plazo:', pageWidth / 2, y);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.term} meses`, pageWidth / 2 + 25, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('Cuota:', margin + 5, y);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatMoney(data.monthlyQuota)}/mes`, margin + 35, y);

  // Cuota inicial (si aplica)
  if (data.initialAmount && data.initialPercent) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(`Inicial (${data.initialPercent}%):`, pageWidth / 2, y);
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(data.initialAmount), pageWidth / 2 + 35, y);
  }

  y += 22;

  // ===== TASAS E INFORMACIÓN FINANCIERA =====
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información Financiera', margin, y);
  y += 6;

  const colWidth = (contentWidth) / 3;

  // TEA
  drawCard(doc, margin, y, colWidth - 5, 25, { shadow: false });
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('TEA', margin + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.financialData.tea}%`, margin + 5, y + 18);

  // TCEA
  drawCard(doc, margin + colWidth, y, colWidth - 5, 25, { shadow: false });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('TCEA', margin + colWidth + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.financialData.tcea}%`, margin + colWidth + 5, y + 18);

  // Total
  drawCard(doc, margin + colWidth * 2, y, colWidth - 5, 25, {
    shadow: false,
    fillColor: PDF_COLORS.successBg,
  });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text('Total a Pagar', margin + colWidth * 2 + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.success);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMoney(data.totalPayment), margin + colWidth * 2 + 5, y + 18);

  y += 38;

  // ===== TABLA DE AMORTIZACIÓN =====
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de Amortización', margin, y);
  y += 6;

  // Header de tabla
  const tableHeaders = ['Cuota', 'Fecha', 'Capital', 'Interés', 'Monto', 'Saldo'];
  const colWidths = [20, 45, 30, 30, 30, 30];
  const headerHeight = 12;
  let x = margin;

  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(margin, y, contentWidth, headerHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  tableHeaders.forEach((header, i) => {
    doc.text(header, x + 3, y + 8);
    x += colWidths[i];
  });

  y += headerHeight + 2;

  // Filas de la tabla
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const rowHeight = 7;

  data.amortizationSchedule.forEach((row, index) => {
    // Nueva página si estamos cerca del final
    if (y > pageHeight - PDF_LAYOUT.footerHeight - 10) {
      doc.addPage();
      drawPageBackground(doc);
      y = margin;

      // Repetir header en nueva página
      x = margin;
      doc.setFillColor(...PDF_COLORS.primary);
      doc.rect(margin, y, contentWidth, headerHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');

      tableHeaders.forEach((header, i) => {
        doc.text(header, x + 3, y + 8);
        x += colWidths[i];
      });

      y += headerHeight + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    // Alternar color de fondo
    if (index % 2 === 0) {
      doc.setFillColor(...PDF_COLORS.pageBg);
      doc.rect(margin, y - 2, contentWidth, rowHeight, 'F');
    }

    x = margin;
    doc.setTextColor(...PDF_COLORS.text);

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
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(formatMoney(row.interest), x + 2, y + 3);
    x += colWidths[3];

    // Monto (cuota)
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(row.quota), x + 2, y + 3);
    doc.setFont('helvetica', 'normal');
    x += colWidths[4];

    // Saldo
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(formatMoney(row.balance), x + 2, y + 3);

    y += rowHeight;
  });

  // ===== WATERMARK Y FOOTER =====
  addWatermarksToAllPages(doc, LEGAL_TEXTS.watermark);
  addFootersToAllPages(doc, LEGAL_TEXTS.cronograma, qrBase64);

  // Descargar
  const fileName = `cronograma-${data.productBrand.toLowerCase().replace(/\s+/g, '-')}-${data.term}meses.pdf`;
  doc.save(fileName);
};

export default generateCronogramaPDF;
