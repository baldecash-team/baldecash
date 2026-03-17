/**
 * Generador de PDF para Ficha Técnica (Spec Sheet)
 * Usa utilidades compartidas de ./pdf/
 */

import { jsPDF, GState } from 'jspdf';
import {
  PDF_COLORS,
  PDF_LAYOUT,
  LEGAL_TEXTS,
  drawHeader,
  drawCard,
  drawPageBackground,
  addFootersToAllPages,
  addWatermarksToAllPages,
  loadImageAsBase64,
  loadQRCodeAsBase64,
  preloadAllIcons,
  registerAsapFont,
  getIconAsBase64,
} from './pdf';
import { COMPANY_INFO } from './pdf/constants';

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
  productUrl?: string;
  specs: SpecCategory[];
  ports?: ProductPort[];
  generatedDate: Date;
}

/**
 * Dibuja un ícono PNG dentro de un cuadrado
 * Usa íconos pre-renderizados de Lucide
 */
const drawCategoryIcon = (
  doc: jsPDF,
  iconBase64: string | undefined,
  x: number,
  y: number,
  size: number
): void => {
  if (!iconBase64) {
    // Fallback: dibujar un cuadrado simple si no hay ícono
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const iconSize = size * 0.4;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.rect(centerX - iconSize / 2, centerY - iconSize / 2, iconSize, iconSize, 'S');
    return;
  }

  // Calcular posición centrada del ícono dentro del cuadrado
  const iconSize = size * 0.6; // Ícono ocupa 60% del cuadrado
  const iconX = x + (size - iconSize) / 2;
  const iconY = y + (size - iconSize) / 2;

  try {
    doc.addImage(iconBase64, 'PNG', iconX, iconY, iconSize, iconSize);
  } catch {
    // Si falla, no dibujar nada (el cuadrado de fondo ya está)
  }
};

/**
 * Calcula la altura necesaria para una categoría
 */
// Constantes compartidas para layout de cards de specs y puertos
const SPEC_CARD_LAYOUT = {
  // Specs cards
  headerPadding: 6,      // Padding horizontal dentro de la card
  iconTopMargin: 5,      // Espacio desde top de card hasta ícono
  iconSize: 10,          // Tamaño del ícono
  lineGap: 3,            // Espacio entre ícono y línea separadora
  specGap: 5,            // Espacio entre línea y primer spec
  specRowHeight: 6,      // Altura mínima de cada fila de spec
  specLineHeight: 4,     // Altura por línea de texto en valores multilinea
  paddingBottom: 2,      // Margen inferior de la card
  valueWidthRatio: 0.45, // Ratio del ancho de card para valores (45%)
  // Puertos section
  portRowHeight: 9,      // Altura de cada fila de puerto
  portIconSize: 4,       // Tamaño del ícono en el puerto
  laptopVisualWidth: 36, // Ancho del visual de laptop
  laptopVisualHeight: 26,// Alto del visual de laptop
  laptopIconSize: 14,    // Tamaño del ícono dentro del visual de laptop
} as const;

const calculateCategoryHeight = (doc: jsPDF, category: SpecCategory, cardWidth: number): number => {
  const { iconTopMargin, iconSize, lineGap, specGap, specRowHeight, specLineHeight, paddingBottom, valueWidthRatio } = SPEC_CARD_LAYOUT;

  // Altura desde top de card hasta primer spec
  const headerToFirstSpec = iconTopMargin + iconSize + lineGap + specGap;
  // IMPORTANTE: usar el mismo cálculo de maxValueWidth que en el dibujo
  const maxValueWidth = cardWidth * valueWidthRatio;

  let totalHeight = headerToFirstSpec;

  category.specs.forEach((spec) => {
    const valueLines = doc.splitTextToSize(spec.value, maxValueWidth);
    const rowHeight = Math.max(specRowHeight, valueLines.length * specLineHeight + 2);
    totalHeight += rowHeight;
  });

  // El último spec no necesita gap para el siguiente (porque no hay siguiente).
  // rowHeight incluye ese gap implícitamente, así que lo restamos.
  // El gap es aproximadamente: specRowHeight - specLineHeight = 6 - 4 = 2
  const lastSpecTrailingGap = specRowHeight - specLineHeight;
  totalHeight -= lastSpecTrailingGap;

  totalHeight += paddingBottom;
  return totalHeight;
};

/**
 * Genera y descarga el PDF de la ficha técnica
 */
export const generateSpecSheetPDF = async (data: SpecSheetPDFData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_LAYOUT.margin;
  const contentWidth = pageWidth - margin * 2;

  // Registrar fuente Asap (misma que usa la web)
  registerAsapFont(doc);

  // Pre-cargar íconos de Lucide como PNG (mismo set usado en el detalle del producto)
  const iconNames = data.specs.map(s => s.icon);
  const iconCache = await preloadAllIcons(iconNames, 48, '#FFFFFF');

  // Cargar QR code si hay URL del producto
  let qrBase64: string | null = null;
  if (data.productUrl) {
    qrBase64 = await loadQRCodeAsBase64(data.productUrl, 80);
  }

  // Fondo de página
  drawPageBackground(doc);

  // Header estandarizado
  let y = drawHeader(doc, 'Ficha Técnica', 'Especificaciones del producto', {
    showDate: true,
    date: data.generatedDate,
  });

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

    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    doc.setFont('Asap', 'normal');
    doc.text(data.productBrand.toUpperCase(), margin + imgSize + 12, y + 15);

    doc.setTextColor(...PDF_COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('Asap', 'bold');
    doc.text(data.productName, margin + imgSize + 12, y + 24);
  } else {
    // Sin imagen
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    doc.setFont('Asap', 'normal');
    doc.text(data.productBrand.toUpperCase(), margin + 8, y + 10);

    doc.setTextColor(...PDF_COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('Asap', 'bold');
    doc.text(data.productName, margin + 8, y + 18);
  }

  y += productCardHeight + 10;

  // ===== TÍTULO ESPECIFICACIONES =====
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFontSize(14);
  doc.setFont('Asap', 'bold');
  doc.text('Especificaciones Técnicas', margin, y);
  y += 8;

  // ===== MASONRY GRID DE CARDS (2 columnas independientes) =====
  const gap = PDF_LAYOUT.gap;
  const cardWidth = (contentWidth - gap) / 2;

  const categories = data.specs;

  // Masonry: cada columna tiene su propia posición Y
  let leftY = y;
  let rightY = y;
  let currentPage = doc.internal.pages.length;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const cardHeight = calculateCategoryHeight(doc, category, cardWidth);

    // Elegir la columna con menor Y (masonry)
    const useLeftColumn = leftY <= rightY;
    const col = useLeftColumn ? 0 : 1;
    const cardY = useLeftColumn ? leftY : rightY;
    const cardX = margin + col * (cardWidth + gap);

    // Verificar si necesitamos nueva página
    if (cardY + cardHeight > pageHeight - PDF_LAYOUT.footerHeight - 10) {
      doc.addPage();
      drawPageBackground(doc);
      // Reset ambas columnas en nueva página
      leftY = margin;
      rightY = margin;
      currentPage = doc.internal.pages.length;
    }

    // Recalcular cardY después de posible cambio de página
    const finalCardY = useLeftColumn ? leftY : rightY;

    // Dibujar la card
    drawCard(doc, cardX, finalCardY, cardWidth, cardHeight);

    // Header de categoría (usa constantes compartidas)
    const { headerPadding, iconSize, iconTopMargin, lineGap, specGap, specRowHeight, specLineHeight, valueWidthRatio } = SPEC_CARD_LAYOUT;
    const iconX = cardX + headerPadding;
    const iconY = finalCardY + iconTopMargin;

    // Cuadrado con ícono
    doc.setFillColor(...PDF_COLORS.primary);
    doc.roundedRect(iconX, iconY, iconSize, iconSize, 1.5, 1.5, 'F');

    // Dibujar ícono dentro del cuadrado (usa Lucide icons pre-renderizados)
    const iconBase64 = iconCache.get(category.icon);
    drawCategoryIcon(doc, iconBase64, iconX, iconY, iconSize);

    // Título de categoría (alineado verticalmente con el centro del ícono)
    const textY = iconY + iconSize / 2 + 1; // Centro vertical del ícono + ajuste baseline
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    doc.setFont('Asap', 'bold');
    doc.text(category.category, iconX + iconSize + 4, textY);

    // Línea separadora bajo header
    const lineY = iconY + iconSize + lineGap;
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(cardX + headerPadding, lineY, cardX + cardWidth - headerPadding, lineY);

    // Specs list
    let specY = lineY + specGap;
    const labelX = cardX + headerPadding;
    const valueX = cardX + cardWidth - headerPadding;
    const maxValueWidth = cardWidth * valueWidthRatio;

    category.specs.forEach((spec) => {
      if (spec.highlight) {
        doc.setFillColor(...PDF_COLORS.primaryLight);
        doc.roundedRect(cardX + 3, specY - 2, cardWidth - 6, 6, 1, 1, 'F');
      }

      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.setFontSize(7.5);
      doc.setFont('Asap', 'normal');
      doc.text(spec.label, labelX, specY + 2);

      if (spec.highlight) {
        doc.setTextColor(...PDF_COLORS.primary);
        doc.setFont('Asap', 'bold');
      } else {
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('Asap', 'normal');
      }

      const valueLines = doc.splitTextToSize(spec.value, maxValueWidth);
      valueLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, valueX, specY + 2 + lineIdx * specLineHeight, { align: 'right' });
      });

      const rowHeight = Math.max(specRowHeight, valueLines.length * specLineHeight + 2);
      specY += rowHeight;
    });

    // Actualizar solo la columna usada (masonry)
    if (useLeftColumn) {
      leftY = finalCardY + cardHeight + gap;
    } else {
      rightY = finalCardY + cardHeight + gap;
    }
  }

  // Ajustar Y al máximo de ambas columnas
  y = Math.max(leftY, rightY);

  // ===== PUERTOS (si hay) =====
  if (data.ports && data.ports.length > 0) {
    // Usar constantes centralizadas
    const { portRowHeight, portIconSize, laptopVisualWidth, laptopVisualHeight, laptopIconSize, headerPadding, iconSize: headerIconSize } = SPEC_CARD_LAYOUT;

    // Verificar espacio
    if (y + 80 > pageHeight - PDF_LAYOUT.footerHeight - 10) {
      doc.addPage();
      drawPageBackground(doc);
      y = margin;
    }

    // Pre-cargar íconos de puertos (incluyendo laptop y usb para header)
    const portIconNames = [...new Set(data.ports.map(p => p.icon)), 'laptop', 'usb'];
    const portIconCache = await preloadAllIcons(portIconNames, 32, '#3D47B0'); // Color primary

    // Card para puertos
    const leftPorts = data.ports.filter(p => p.position === 'left');
    const rightPorts = data.ports.filter(p => p.position === 'right');
    const backPorts = data.ports.filter(p => p.position === 'back');

    // Calcular altura de la card (header + contenido + badges)
    const headerHeight = 20; // Espacio para header con ícono
    const contentHeight = Math.max(leftPorts.length, rightPorts.length) * portRowHeight + 10;
    const backPortsHeight = backPorts.length > 0 ? 35 : 0; // Más espacio para puertos traseros
    const badgesHeight = 28; // Más espacio para badges de resumen
    const portsCardHeight = headerHeight + contentHeight + backPortsHeight + badgesHeight;

    drawCard(doc, margin, y, contentWidth, portsCardHeight);

    // ===== Header de la card (como en specs cards) =====
    const cardY = y;
    const iconX = margin + headerPadding;
    const iconY = cardY + 5;

    // Cuadrado con ícono USB (header)
    doc.setFillColor(...PDF_COLORS.primary);
    doc.roundedRect(iconX, iconY, headerIconSize, headerIconSize, 1.5, 1.5, 'F');

    // Ícono USB en blanco
    const usbIconWhite = await getIconAsBase64('usb', 48, '#FFFFFF');
    try {
      const iconInnerSize = headerIconSize * 0.6;
      doc.addImage(usbIconWhite, 'PNG', iconX + (headerIconSize - iconInnerSize) / 2, iconY + (headerIconSize - iconInnerSize) / 2, iconInnerSize, iconInnerSize);
    } catch {
      // Continuar sin ícono
    }

    // Título y subtítulo
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    doc.setFont('Asap', 'bold');
    doc.text('Puertos y Conectividad', iconX + headerIconSize + 4, iconY + 4);

    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.setFontSize(7);
    doc.setFont('Asap', 'normal');
    doc.text('Distribución de puertos en el equipo', iconX + headerIconSize + 4, iconY + 9);

    // Línea separadora
    const lineY = iconY + headerIconSize + 3;
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin + headerPadding, lineY, margin + contentWidth - headerPadding, lineY);

    const portsContentY = lineY + 5;
    const colWidthPorts = (contentWidth - laptopVisualWidth - 24) / 2;

    // Función helper para dibujar un puerto con ícono (contenido centrado verticalmente)
    const drawPort = (port: typeof data.ports[0], x: number, pY: number, width: number) => {
      const badgeHeight = 8;
      const badgeTop = pY - 3.5;
      const badgeCenterY = badgeTop + badgeHeight / 2;
      const iconSizeInBadge = 5; // Ícono un poco más grande para mejor visibilidad

      // Fondo del puerto (como bg-neutral-50 en web)
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, badgeTop, width, badgeHeight, 1.5, 1.5, 'FD');

      // Ícono del puerto (centrado verticalmente)
      const iconY = badgeCenterY - iconSizeInBadge / 2;
      const pIconBase64 = portIconCache.get(port.icon);
      if (pIconBase64) {
        try {
          doc.addImage(pIconBase64, 'PNG', x + 2, iconY, iconSizeInBadge, iconSizeInBadge);
        } catch {
          // Si falla, continuar sin ícono
        }
      }

      // Texto del puerto (centrado verticalmente - ajuste para baseline de fuente)
      const textY = badgeCenterY + 1; // +1 compensa el baseline de la fuente
      doc.setTextColor(...PDF_COLORS.text);
      doc.setFontSize(6.5);
      doc.setFont('Asap', 'normal');
      const portText = port.name + (port.count > 1 ? ` ×${port.count}` : '');
      doc.text(portText, x + iconSizeInBadge + 4, textY);
    };

    // Izquierda
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.setFontSize(7);
    doc.setFont('Asap', 'bold');
    doc.text('IZQUIERDA', margin + 10, portsContentY);

    let portY = portsContentY + 7;
    leftPorts.forEach((port) => {
      drawPort(port, margin + 8, portY, colWidthPorts - 4);
      portY += portRowHeight;
    });

    // Laptop visual (centro) - Estilo similar a la web
    const laptopX = margin + colWidthPorts + 12;
    const laptopY = portsContentY + 3;
    const laptopW = laptopVisualWidth;
    const laptopH = laptopVisualHeight;

    // Fondo gris claro (como bg-neutral-100 en web)
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(laptopX, laptopY, laptopW, laptopH, 2, 2, 'F');

    // Borde sutil (como border-neutral-200 en web)
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.3);
    doc.roundedRect(laptopX, laptopY, laptopW, laptopH, 2, 2, 'S');

    // Ícono Laptop centrado (como en web) - usar versión gris
    const laptopIconGray = await getIconAsBase64('laptop', 48, '#a3a3a3'); // neutral-400
    const laptopIconX = laptopX + (laptopW - laptopIconSize) / 2;
    const laptopIconY = laptopY + (laptopH - laptopIconSize) / 2;
    try {
      doc.addImage(laptopIconGray, 'PNG', laptopIconX, laptopIconY, laptopIconSize, laptopIconSize);
    } catch {
      // Fallback: no dibujar nada si falla
    }

    // Indicadores de puertos (barras en los bordes, como en web)
    doc.setFillColor(...PDF_COLORS.primary);
    doc.setGState(new GState({ opacity: 0.3 }));
    doc.roundedRect(laptopX - 1, laptopY + laptopH * 0.3, 1, laptopH * 0.4, 0.5, 0.5, 'F');
    doc.roundedRect(laptopX + laptopW, laptopY + laptopH * 0.3, 1, laptopH * 0.4, 0.5, 0.5, 'F');
    if (backPorts.length > 0) {
      doc.roundedRect(laptopX + laptopW * 0.3, laptopY - 1, laptopW * 0.4, 1, 0.5, 0.5, 'F');
    }
    doc.setGState(new GState({ opacity: 1 }));

    // Derecha
    const rightColX = margin + colWidthPorts + laptopW + 24;
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.setFontSize(7);
    doc.setFont('Asap', 'bold');
    doc.text('DERECHA', rightColX, portsContentY);

    portY = portsContentY + 7;
    rightPorts.forEach((port) => {
      drawPort(port, rightColX - 2, portY, colWidthPorts - 4);
      portY += portRowHeight;
    });

    // Trasera (si hay) - track Y position for badges
    let backPortsEndY = portsContentY + Math.max(leftPorts.length, rightPorts.length) * portRowHeight + 10;

    if (backPorts.length > 0) {
      const backY = portsContentY + 26 + Math.max(leftPorts.length, rightPorts.length) * portRowHeight;
      doc.setDrawColor(...PDF_COLORS.border);
      doc.line(margin + headerPadding, backY - 5, margin + contentWidth - headerPadding, backY - 5);

      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.setFontSize(7);
      doc.setFont('Asap', 'bold');
      doc.text('PARTE TRASERA', margin + headerPadding, backY);

      // Calcular anchos de badges y encontrar el máximo para uniformar
      doc.setFontSize(6.5);
      const portGap = 6;
      const iconSizeInBadge = 5;
      const portWidths = backPorts.map((port) => {
        const portText = port.name + (port.count > 1 ? ` ×${port.count}` : '');
        return doc.getTextWidth(portText) + iconSizeInBadge + 12;
      });

      // Usar ancho uniforme (el máximo) para todos los badges
      const maxPortWidth = Math.max(...portWidths);
      const uniformWidth = maxPortWidth;
      const totalBackWidth = uniformWidth * backPorts.length + (backPorts.length - 1) * portGap;

      // Centrar puertos traseros con ancho uniforme
      let backX = margin + (contentWidth - totalBackWidth) / 2;
      backPorts.forEach((port) => {
        drawPort(port, backX, backY + 6, uniformWidth);
        backX += uniformWidth + portGap;
      });

      // Actualizar posición Y después de puertos traseros
      backPortsEndY = backY + 6 + 10; // backY + badge height + spacing
    }

    // Badges de resumen (alineados verticalmente, centrados)
    const totalPorts = data.ports.reduce((acc, p) => acc + p.count, 0);
    const leftCount = leftPorts.reduce((acc, p) => acc + p.count, 0);
    const rightCount = rightPorts.reduce((acc, p) => acc + p.count, 0);

    const badgeFontSize = 7;
    const badgeHeight = 8;
    const badgeGapV = 3;
    const centerX = margin + contentWidth / 2;

    // Posicionar badges de resumen DESPUÉS de los puertos traseros (con espacio)
    const badgesStartY = backPortsEndY + 5;

    // Cálculo para centrar texto verticalmente en badge
    const textOffsetY = badgeHeight / 2 + 1.5;

    // Badge 1: Total puertos (azul) - arriba
    const totalText = `${totalPorts} puertos totales`;
    doc.setFontSize(badgeFontSize);
    doc.setFont('Asap', 'bold');
    const totalBadgeWidth = doc.getTextWidth(totalText) + 14;
    doc.setFillColor(
      PDF_COLORS.primary[0] + (255 - PDF_COLORS.primary[0]) * 0.85,
      PDF_COLORS.primary[1] + (255 - PDF_COLORS.primary[1]) * 0.85,
      PDF_COLORS.primary[2] + (255 - PDF_COLORS.primary[2]) * 0.85
    );
    doc.roundedRect(centerX - totalBadgeWidth / 2, badgesStartY, totalBadgeWidth, badgeHeight, 3, 3, 'F');
    doc.setTextColor(...PDF_COLORS.primary);
    doc.text(totalText, centerX, badgesStartY + textOffsetY, { align: 'center' });

    // Badge 2: Distribución izquierda/derecha (gris) - abajo
    const distText = `${leftCount} izquierda • ${rightCount} derecha`;
    doc.setFont('Asap', 'normal');
    const distBadgeWidth = doc.getTextWidth(distText) + 14;
    doc.setFillColor(PDF_COLORS.pageBg[0] - 15, PDF_COLORS.pageBg[1] - 15, PDF_COLORS.pageBg[2] - 15);
    const badge2Y = badgesStartY + badgeHeight + badgeGapV;
    doc.roundedRect(centerX - distBadgeWidth / 2, badge2Y, distBadgeWidth, badgeHeight, 3, 3, 'F');
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(distText, centerX, badge2Y + textOffsetY, { align: 'center' });

    // Recalcular altura de card basado en contenido real
    const actualCardEndY = badge2Y + badgeHeight + 5;
    const actualPortsCardHeight = actualCardEndY - y;
    y += actualPortsCardHeight + 10;
  }

  // ===== WATERMARK Y FOOTER =====
  addWatermarksToAllPages(doc, LEGAL_TEXTS.watermark);
  addFootersToAllPages(doc, LEGAL_TEXTS.specSheet, qrBase64);

  // Descargar
  const brandSlug = data.productBrand.toLowerCase().replace(/\s+/g, '-');
  const productSlug = data.productName.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
  const fileName = `ficha-tecnica-${brandSlug}-${productSlug}.pdf`;
  doc.save(fileName);
};

export default generateSpecSheetPDF;
