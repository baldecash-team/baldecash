/**
 * Generador de PDF para Ficha Técnica (Spec Sheet)
 * Diseño visual similar a la web: cards en grid 2 columnas
 */

import { jsPDF, GState } from 'jspdf';
import { BALDECASH_LOGO_BASE64 } from './baldecashLogo';

// Tipos para los datos del spec sheet
interface SpecItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SpecCategory {
  category: string;
  icon: string;
  specs: SpecItem[];
}

interface ProductPort {
  name: string;
  count: number;
  position: 'left' | 'right' | 'back';
  icon: string;
}

interface SpecSheetPDFData {
  productName: string;
  productBrand: string;
  productImage?: string;
  specs: SpecCategory[];
  ports?: ProductPort[];
  generatedDate: Date;
}

// Colores del tema (matching web)
const COLORS = {
  primary: { r: 61, g: 71, b: 176 }, // #3D47B0
  primaryLight: { r: 61, g: 71, b: 176, a: 0.1 }, // rgba for backgrounds
  text: { r: 23, g: 23, b: 23 },
  textMuted: { r: 115, g: 115, b: 115 },
  border: { r: 229, g: 229, b: 229 }, // neutral-200
  cardBg: { r: 255, g: 255, b: 255 },
  pageBg: { r: 250, g: 250, b: 250 }, // neutral-50
  highlightBg: { r: 239, g: 240, b: 250 }, // primary/5%
  shadow: { r: 0, g: 0, b: 0, a: 0.08 },
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
 * Convierte una URL de imagen a base64
 */
const loadImageAsBase64 = async (url: string): Promise<string> => {
  console.log('[PDF] Loading image:', url);

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
    console.log('[PDF] Direct fetch failed, trying external proxy...');
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
 * Dibuja una card con sombra simulada y bordes redondeados
 */
const drawCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { shadow?: boolean; radius?: number } = {}
) => {
  const { shadow = true, radius = 4 } = options;

  // Sombra (rectángulo offset gris)
  if (shadow) {
    doc.setFillColor(0, 0, 0);
    doc.setGState(new GState({ opacity: 0.06 }));
    doc.roundedRect(x + 1, y + 1, width, height, radius, radius, 'F');
    doc.setGState(new GState({ opacity: 1 }));
  }

  // Card background
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.roundedRect(x, y, width, height, radius, radius, 'F');

  // Border
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, radius, radius, 'S');
};

/**
 * Calcula la altura necesaria para una categoría
 */
const calculateCategoryHeight = (doc: jsPDF, category: SpecCategory, contentWidth: number): number => {
  const headerHeight = 14;
  const specRowHeight = 6;
  const paddingTop = 4;
  const paddingBottom = 4;
  const maxValueWidth = contentWidth * 0.45;

  let totalHeight = headerHeight + paddingTop;

  category.specs.forEach((spec) => {
    const valueLines = doc.splitTextToSize(spec.value, maxValueWidth);
    const rowHeight = Math.max(specRowHeight, valueLines.length * 4 + 2);
    totalHeight += rowHeight;
  });

  totalHeight += paddingBottom;
  return totalHeight;
};

/**
 * Genera y descarga el PDF de la ficha técnica (diseño tipo web)
 */
export const generateSpecSheetPDF = async (data: SpecSheetPDFData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Background de página
  doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  let y = 15;

  // ===== HEADER =====
  // Logo BaldeCash (derecha)
  try {
    const logoWidth = 50;
    const logoHeight = 14;
    const logoX = pageWidth - logoWidth - margin;
    doc.addImage(BALDECASH_LOGO_BASE64, 'PNG', logoX, y, logoWidth, logoHeight);
  } catch {
    // Si falla, continuar sin logo
  }

  // Título
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Ficha Técnica', margin, y + 10);

  // Fecha
  doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${formatDate(data.generatedDate)}`, margin, y + 18);

  y += 28;

  // ===== PRODUCTO CARD =====
  let productImageBase64: string | null = null;
  if (data.productImage) {
    try {
      productImageBase64 = await loadImageAsBase64(data.productImage);
    } catch (error) {
      console.error('[PDF] Error cargando imagen:', error);
    }
  }

  const productCardHeight = productImageBase64 ? 45 : 25;
  drawCard(doc, margin, y, contentWidth, productCardHeight);

  if (productImageBase64) {
    // Con imagen
    const imgSize = 35;
    try {
      doc.addImage(productImageBase64, 'PNG', margin + 5, y + 5, imgSize, imgSize);
    } catch {
      // Sin imagen si falla
    }

    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(data.productBrand.toUpperCase(), margin + imgSize + 12, y + 15);

    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(data.productName, margin + imgSize + 12, y + 24);
  } else {
    // Sin imagen
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(data.productBrand.toUpperCase(), margin + 8, y + 10);

    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(data.productName, margin + 8, y + 18);
  }

  y += productCardHeight + 10;

  // ===== TÍTULO ESPECIFICACIONES =====
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Especificaciones Técnicas', margin, y);
  y += 8;

  // ===== GRID DE CARDS (2 columnas) =====
  const gap = 8;
  const cardWidth = (contentWidth - gap) / 2;

  const categories = data.specs;
  let col = 0;
  let rowY = y;
  let maxHeightInRow = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const cardHeight = calculateCategoryHeight(doc, category, cardWidth - 16);

    // Calcular posición X
    const cardX = margin + col * (cardWidth + gap);

    // Verificar si necesitamos nueva página
    if (rowY + cardHeight > pageHeight - 25) {
      doc.addPage();
      doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      rowY = 15;
      maxHeightInRow = 0;
    }

    // Dibujar la card
    drawCard(doc, cardX, rowY, cardWidth, cardHeight);

    // Header de categoría
    const headerY = rowY + 3;
    const headerPadding = 6;

    // Bullet decorativo (cuadrado sólido)
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.roundedRect(cardX + headerPadding + 1, headerY + 2, 6, 6, 1, 1, 'F');

    // Título de categoría
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(category.category, cardX + headerPadding + 13, headerY + 7);

    // Línea separadora bajo header
    const lineY = headerY + 11;
    doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b);
    doc.setLineWidth(0.3);
    doc.line(cardX + headerPadding, lineY, cardX + cardWidth - headerPadding, lineY);

    // Specs list
    let specY = lineY + 5;
    const labelX = cardX + headerPadding;
    const valueX = cardX + cardWidth - headerPadding;
    const maxValueWidth = cardWidth * 0.45;

    category.specs.forEach((spec) => {
      if (spec.highlight) {
        doc.setFillColor(COLORS.highlightBg.r, COLORS.highlightBg.g, COLORS.highlightBg.b);
        doc.roundedRect(cardX + 3, specY - 2, cardWidth - 6, 6, 1, 1, 'F');
      }

      doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(spec.label, labelX, specY + 2);

      if (spec.highlight) {
        doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
        doc.setFont('helvetica', 'normal');
      }

      const valueLines = doc.splitTextToSize(spec.value, maxValueWidth);
      valueLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, valueX, specY + 2 + lineIdx * 4, { align: 'right' });
      });

      const rowHeight = Math.max(6, valueLines.length * 4 + 2);
      specY += rowHeight;
    });

    maxHeightInRow = Math.max(maxHeightInRow, cardHeight);

    col++;
    if (col >= 2) {
      col = 0;
      rowY += maxHeightInRow + gap;
      maxHeightInRow = 0;
    }
  }

  // Ajustar Y después del grid
  if (col !== 0) {
    rowY += maxHeightInRow + gap;
  }
  y = rowY;

  // ===== PUERTOS (si hay) =====
  if (data.ports && data.ports.length > 0) {
    // Verificar espacio
    if (y + 60 > pageHeight - 25) {
      doc.addPage();
      doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      y = 15;
    }

    // Título
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Puertos y Conectividad', margin, y);
    y += 8;

    // Card para puertos
    const leftPorts = data.ports.filter(p => p.position === 'left');
    const rightPorts = data.ports.filter(p => p.position === 'right');
    const backPorts = data.ports.filter(p => p.position === 'back');

    const portsCardHeight = 38 + Math.max(leftPorts.length, rightPorts.length) * 8 + (backPorts.length > 0 ? 28 : 0);
    drawCard(doc, margin, y, contentWidth, portsCardHeight);

    const portsContentY = y + 8;
    const colWidthPorts = (contentWidth - 60) / 2;

    // Izquierda
    doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('IZQUIERDA', margin + 10, portsContentY);

    let portY = portsContentY + 6;
    leftPorts.forEach((port) => {
      doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
      doc.roundedRect(margin + 8, portY - 3, colWidthPorts - 10, 7, 1, 1, 'F');
      doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(port.name + (port.count > 1 ? ` ×${port.count}` : ''), margin + 12, portY + 1);
      portY += 8;
    });

    // Laptop visual (centro)
    const laptopX = margin + colWidthPorts + 15;
    const laptopY = portsContentY + 5;
    doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
    doc.roundedRect(laptopX, laptopY, 30, 20, 2, 2, 'F');
    doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b);
    doc.roundedRect(laptopX, laptopY, 30, 20, 2, 2, 'S');

    // Indicadores de puertos
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setGState(new GState({ opacity: 0.3 }));
    doc.rect(laptopX - 1, laptopY + 6, 2, 8, 'F'); // left
    doc.rect(laptopX + 29, laptopY + 6, 2, 8, 'F'); // right
    doc.setGState(new GState({ opacity: 1 }));

    // Derecha
    doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DERECHA', margin + colWidthPorts + 55, portsContentY);

    portY = portsContentY + 6;
    rightPorts.forEach((port) => {
      doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
      doc.roundedRect(margin + colWidthPorts + 53, portY - 3, colWidthPorts - 10, 7, 1, 1, 'F');
      doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(port.name + (port.count > 1 ? ` ×${port.count}` : ''), margin + colWidthPorts + 57, portY + 1);
      portY += 8;
    });

    // Trasera (si hay)
    if (backPorts.length > 0) {
      const backY = portsContentY + 24 + Math.max(leftPorts.length, rightPorts.length) * 8;
      doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b);
      doc.line(margin + 10, backY - 5, margin + contentWidth - 10, backY - 5);

      doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('PARTE TRASERA', margin + 10, backY);

      let backX = margin + 10;
      backPorts.forEach((port) => {
        doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
        const portWidth = doc.getTextWidth(port.name + (port.count > 1 ? ` ×${port.count}` : '')) + 8;
        doc.roundedRect(backX, backY + 3, portWidth, 7, 1, 1, 'F');
        doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(port.name + (port.count > 1 ? ` ×${port.count}` : ''), backX + 4, backY + 8);
        backX += portWidth + 5;
      });
    }

    // Badges de resumen (como en la web)
    const totalPorts = data.ports.reduce((acc, p) => acc + p.count, 0);
    const leftCount = leftPorts.reduce((acc, p) => acc + p.count, 0);
    const rightCount = rightPorts.reduce((acc, p) => acc + p.count, 0);

    const badgeY = y + portsCardHeight - 14;
    const badgeGap = 4;

    // Badge 1: Total puertos (azul)
    const totalText = `${totalPorts} puertos totales`;
    const totalBadgeWidth = doc.getTextWidth(totalText) + 12;
    doc.setFillColor(
      COLORS.primary.r + (255 - COLORS.primary.r) * 0.9,
      COLORS.primary.g + (255 - COLORS.primary.g) * 0.9,
      COLORS.primary.b + (255 - COLORS.primary.b) * 0.9
    );
    const badge1X = margin + contentWidth / 2 - (totalBadgeWidth + badgeGap) / 2 - 30;
    doc.roundedRect(badge1X, badgeY, totalBadgeWidth, 8, 3, 3, 'F');
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(totalText, badge1X + totalBadgeWidth / 2, badgeY + 5.5, { align: 'center' });

    // Badge 2: Distribución izquierda/derecha (gris)
    const distText = `${leftCount} izquierda • ${rightCount} derecha`;
    const distBadgeWidth = doc.getTextWidth(distText) + 12;
    doc.setFillColor(COLORS.pageBg.r - 10, COLORS.pageBg.g - 10, COLORS.pageBg.b - 10);
    const badge2X = badge1X + totalBadgeWidth + badgeGap;
    doc.roundedRect(badge2X, badgeY, distBadgeWidth, 8, 3, 3, 'F');
    doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(distText, badge2X + distBadgeWidth / 2, badgeY + 5.5, { align: 'center' });

    y += portsCardHeight + 10;
  }

  // ===== FOOTER =====
  if (y + 20 > pageHeight - 15) {
    doc.addPage();
    doc.setFillColor(COLORS.pageBg.r, COLORS.pageBg.g, COLORS.pageBg.b);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    y = 15;
  }

  doc.setFontSize(7);
  doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.text(
    'Las especificaciones pueden variar según el modelo y configuración.',
    margin,
    y + 5
  );
  doc.text('BaldeCash - Financiamiento para estudiantes | www.baldecash.com', margin, y + 10);

  // Descargar
  const brandSlug = data.productBrand.toLowerCase().replace(/\s+/g, '-');
  const productSlug = data.productName.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
  const fileName = `ficha-tecnica-${brandSlug}-${productSlug}.pdf`;
  doc.save(fileName);
};

export default generateSpecSheetPDF;
