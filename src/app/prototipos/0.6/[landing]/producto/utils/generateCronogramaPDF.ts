/**
 * Generador de PDF para Cronograma de Pagos
 * Usa jsPDF para crear un documento PDF con la tabla de amortización
 */

import { jsPDF } from 'jspdf';
import { BALDECASH_LOGO_BASE64 } from './baldecashLogo';

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
  term: number;
  monthlyQuota: number;
  totalPayment: number;
  amortizationSchedule: AmortizationRow[];
  financialData: FinancialData;
  generatedDate: Date;
}

/**
 * Formatea un número como moneda peruana (redondeado, sin decimales)
 */
const formatMoney = (amount: number): string => {
  return `S/${Math.round(amount).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

/**
 * Formatea una fecha en español
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Genera y descarga el PDF del cronograma de pagos
 */
export const generateCronogramaPDF = (data: CronogramaPDFData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Colores
  const primaryColor: [number, number, number] = [61, 71, 176]; // #3D47B0
  const textColor: [number, number, number] = [23, 23, 23];
  const grayColor: [number, number, number] = [115, 115, 115];
  const lightGray: [number, number, number] = [245, 245, 245];

  // ===== HEADER (fondo blanco con línea azul inferior) =====
  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Línea azul inferior como acento
  doc.setFillColor(...primaryColor);
  doc.rect(0, 38, pageWidth, 3, 'F');

  // Logo BaldeCash (lado derecho, proporción original 3.55:1)
  try {
    const logoWidth = 60;
    const logoHeight = 17;
    const logoX = pageWidth - logoWidth - margin;
    const logoY = 10;
    doc.addImage(BALDECASH_LOGO_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch {
    // Si falla la carga del logo, continuar sin él
  }

  // Título en azul
  doc.setTextColor(...primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CRONOGRAMA DE PAGOS', margin, 20);

  // Fecha en gris
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${formatDate(data.generatedDate)}`, margin, 30);

  y = 49;

  // ===== DATOS DEL PRODUCTO =====
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Producto', margin, y);
  y += 6;

  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F');
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Producto:', margin + 5, y);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.productBrand} ${data.productName}`, margin + 35, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Precio:', margin + 5, y);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMoney(data.productPrice), margin + 35, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Plazo:', pageWidth / 2, y);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.term} meses`, pageWidth / 2 + 25, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Cuota:', margin + 5, y);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatMoney(data.monthlyQuota)}/mes`, margin + 35, y);

  y += 22;

  // ===== TASAS E INFORMACION FINANCIERA =====
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informacion Financiera', margin, y);
  y += 6;

  const colWidth = (pageWidth - margin * 2) / 3;

  // TEA
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, colWidth - 5, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('TEA', margin + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.financialData.tea}%`, margin + 5, y + 18);

  // TCEA
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin + colWidth, y, colWidth - 5, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('TCEA', margin + colWidth + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.financialData.tcea}%`, margin + colWidth + 5, y + 18);

  // Total
  doc.setFillColor(236, 253, 245); // green-50
  doc.roundedRect(margin + colWidth * 2, y, colWidth - 5, 25, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Total a Pagar', margin + colWidth * 2 + 5, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74); // green-600
  doc.setFont('helvetica', 'bold');
  doc.text(formatMoney(data.totalPayment), margin + colWidth * 2 + 5, y + 18);

  y += 38;

  // ===== TABLA DE AMORTIZACION =====
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de Amortizacion', margin, y);
  y += 6;

  // Header de tabla
  const tableHeaders = ['Cuota', 'Fecha', 'Capital', 'Interes', 'Monto', 'Saldo'];
  const colWidths = [20, 45, 30, 30, 30, 30];
  const headerHeight = 12;
  let x = margin;

  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, pageWidth - margin * 2, headerHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  tableHeaders.forEach((header, i) => {
    // Centrar verticalmente usando baseline middle
    doc.text(header, x + 3, y + 8);
    x += colWidths[i];
  });

  y += headerHeight + 2;

  // Filas de la tabla
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const pageHeight = doc.internal.pageSize.getHeight();
  const rowHeight = 7;

  data.amortizationSchedule.forEach((row, index) => {
    // Nueva página si estamos cerca del final (dejar 25 para footer)
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 20;

      // Repetir header en nueva página
      x = margin;
      doc.setFillColor(...primaryColor);
      doc.rect(margin, y, pageWidth - margin * 2, headerHeight, 'F');
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
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y - 2, pageWidth - margin * 2, 7, 'F');
    }

    x = margin;
    doc.setTextColor(...textColor);

    // Numero de cuota
    doc.text(String(row.month), x + 2, y + 3);
    x += colWidths[0];

    // Fecha
    doc.text(row.date, x + 2, y + 3);
    x += colWidths[1];

    // Capital
    doc.text(formatMoney(row.capital), x + 2, y + 3);
    x += colWidths[2];

    // Interes
    doc.setTextColor(...grayColor);
    doc.text(formatMoney(row.interest), x + 2, y + 3);
    x += colWidths[3];

    // Monto (cuota)
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(row.quota), x + 2, y + 3);
    doc.setFont('helvetica', 'normal');
    x += colWidths[4];

    // Saldo
    doc.setTextColor(...grayColor);
    doc.text(formatMoney(row.balance), x + 2, y + 3);

    y += 7;
  });

  // ===== FOOTER =====
  y += 10;
  if (y > pageHeight - 25) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(
    'Esta informacion es referencial. Las tasas y condiciones finales seran confirmadas al momento de la aprobacion.',
    margin,
    y
  );
  y += 5;
  doc.text('BaldeCash - Financiamiento para estudiantes | www.baldecash.com', margin, y);

  // Descargar
  const fileName = `cronograma-${data.productBrand.toLowerCase()}-${data.term}meses.pdf`;
  doc.save(fileName);
};

export default generateCronogramaPDF;
