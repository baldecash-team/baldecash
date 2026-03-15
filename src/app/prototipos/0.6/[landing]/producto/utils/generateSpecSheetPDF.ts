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
 * Dibuja un ícono simplificado dentro de un cuadrado
 * Los íconos son versiones minimalistas dibujadas con líneas y formas
 */
const drawCategoryIcon = (
  doc: jsPDF,
  iconName: string,
  x: number,
  y: number,
  size: number
): void => {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const iconSize = size * 0.5; // Ícono ocupa 50% del cuadrado

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);

  switch (iconName.toLowerCase()) {
    case 'cpu':
      // Chip: cuadrado central con líneas saliendo
      const chipSize = iconSize * 0.6;
      doc.rect(centerX - chipSize / 2, centerY - chipSize / 2, chipSize, chipSize, 'S');
      // Líneas (pines)
      const pinOffset = chipSize / 2 + 1;
      doc.line(centerX - 1.5, centerY - pinOffset, centerX - 1.5, centerY - pinOffset - 1.5);
      doc.line(centerX + 1.5, centerY - pinOffset, centerX + 1.5, centerY - pinOffset - 1.5);
      doc.line(centerX - 1.5, centerY + pinOffset, centerX - 1.5, centerY + pinOffset + 1.5);
      doc.line(centerX + 1.5, centerY + pinOffset, centerX + 1.5, centerY + pinOffset + 1.5);
      break;

    case 'memory':
      // RAM stick: rectángulo horizontal con muescas
      const ramW = iconSize * 0.9;
      const ramH = iconSize * 0.4;
      doc.rect(centerX - ramW / 2, centerY - ramH / 2, ramW, ramH, 'S');
      // Chips internos
      doc.rect(centerX - ramW / 2 + 1, centerY - ramH / 2 + 0.8, 1.5, ramH - 1.6, 'F');
      doc.rect(centerX - 0.75, centerY - ramH / 2 + 0.8, 1.5, ramH - 1.6, 'F');
      doc.rect(centerX + ramW / 2 - 2.5, centerY - ramH / 2 + 0.8, 1.5, ramH - 1.6, 'F');
      break;

    case 'storage':
      // HDD/SSD: rectángulo con círculo interno
      const hddW = iconSize * 0.8;
      const hddH = iconSize * 0.6;
      doc.roundedRect(centerX - hddW / 2, centerY - hddH / 2, hddW, hddH, 0.5, 0.5, 'S');
      doc.circle(centerX, centerY, hddH * 0.25, 'S');
      break;

    case 'monitor':
      // Pantalla con base
      const monW = iconSize * 0.85;
      const monH = iconSize * 0.55;
      doc.rect(centerX - monW / 2, centerY - monH / 2 - 1, monW, monH, 'S');
      // Base
      doc.line(centerX, centerY + monH / 2 - 1, centerX, centerY + monH / 2 + 1);
      doc.line(centerX - 2, centerY + monH / 2 + 1, centerX + 2, centerY + monH / 2 + 1);
      break;

    case 'battery':
      // Batería horizontal
      const batW = iconSize * 0.7;
      const batH = iconSize * 0.4;
      doc.rect(centerX - batW / 2, centerY - batH / 2, batW, batH, 'S');
      // Terminal
      doc.rect(centerX + batW / 2, centerY - batH / 4, 1, batH / 2, 'F');
      // Nivel de carga (75%)
      doc.rect(centerX - batW / 2 + 0.5, centerY - batH / 2 + 0.5, batW * 0.6, batH - 1, 'F');
      break;

    case 'wifi':
      // Arcos de señal WiFi
      doc.circle(centerX, centerY + 2, 0.8, 'F'); // Punto base
      // Arcos (simulados con líneas curvas)
      doc.setLineWidth(0.3);
      const drawArc = (radius: number) => {
        const steps = 8;
        for (let i = 0; i < steps; i++) {
          const angle1 = Math.PI * (1.25 - (i / steps) * 0.5);
          const angle2 = Math.PI * (1.25 - ((i + 1) / steps) * 0.5);
          doc.line(
            centerX + Math.cos(angle1) * radius,
            centerY + 2 + Math.sin(angle1) * radius,
            centerX + Math.cos(angle2) * radius,
            centerY + 2 + Math.sin(angle2) * radius
          );
        }
      };
      drawArc(2);
      drawArc(3.5);
      break;

    case 'scale':
      // Báscula/peso
      const scaleW = iconSize * 0.8;
      doc.roundedRect(centerX - scaleW / 2, centerY - 1, scaleW, iconSize * 0.4, 0.5, 0.5, 'S');
      // Display
      doc.rect(centerX - scaleW / 4, centerY, scaleW / 2, iconSize * 0.15, 'S');
      break;

    case 'camera':
      // Cámara
      const camW = iconSize * 0.75;
      const camH = iconSize * 0.5;
      doc.roundedRect(centerX - camW / 2, centerY - camH / 2, camW, camH, 0.5, 0.5, 'S');
      // Lente
      doc.circle(centerX, centerY, camH * 0.3, 'S');
      // Flash
      doc.rect(centerX + camW / 4, centerY - camH / 2 - 1, camW / 5, 1, 'F');
      break;

    case 'shield':
      // Escudo
      const shieldW = iconSize * 0.6;
      const shieldH = iconSize * 0.75;
      const shieldTop = centerY - shieldH / 2;
      // Dibujar forma de escudo con líneas
      doc.line(centerX - shieldW / 2, shieldTop, centerX + shieldW / 2, shieldTop);
      doc.line(centerX - shieldW / 2, shieldTop, centerX - shieldW / 2, centerY);
      doc.line(centerX + shieldW / 2, shieldTop, centerX + shieldW / 2, centerY);
      doc.line(centerX - shieldW / 2, centerY, centerX, centerY + shieldH / 2);
      doc.line(centerX + shieldW / 2, centerY, centerX, centerY + shieldH / 2);
      break;

    case 'smartphone':
      // Teléfono móvil
      const phoneW = iconSize * 0.45;
      const phoneH = iconSize * 0.75;
      doc.roundedRect(centerX - phoneW / 2, centerY - phoneH / 2, phoneW, phoneH, 0.8, 0.8, 'S');
      // Pantalla
      doc.rect(centerX - phoneW / 2 + 0.5, centerY - phoneH / 2 + 1.5, phoneW - 1, phoneH - 3, 'S');
      // Botón home
      doc.circle(centerX, centerY + phoneH / 2 - 1, 0.6, 'S');
      break;

    case 'fingerprint':
      // Huella dactilar (arcos concéntricos)
      doc.circle(centerX, centerY, iconSize * 0.35, 'S');
      doc.circle(centerX, centerY, iconSize * 0.22, 'S');
      doc.circle(centerX, centerY, iconSize * 0.1, 'F');
      break;

    case 'gauge':
      // Velocímetro/medidor
      const gaugeR = iconSize * 0.35;
      // Semicírculo
      doc.setLineWidth(0.5);
      const gaugeSteps = 12;
      for (let i = 0; i <= gaugeSteps; i++) {
        const angle = Math.PI + (i / gaugeSteps) * Math.PI;
        const x1 = centerX + Math.cos(angle) * gaugeR;
        const y1 = centerY + Math.sin(angle) * gaugeR;
        const x2 = centerX + Math.cos(angle) * (gaugeR - 0.8);
        const y2 = centerY + Math.sin(angle) * (gaugeR - 0.8);
        if (i % 3 === 0) doc.line(x1, y1, x2, y2);
      }
      // Aguja
      doc.line(centerX, centerY, centerX + gaugeR * 0.6, centerY - gaugeR * 0.4);
      doc.circle(centerX, centerY, 0.8, 'F');
      doc.setLineWidth(0.4);
      break;

    case 'zap':
      // Rayo/energía
      const zapW = iconSize * 0.4;
      const zapH = iconSize * 0.7;
      const zapTop = centerY - zapH / 2;
      // Forma de rayo con líneas
      doc.line(centerX + zapW * 0.3, zapTop, centerX - zapW * 0.2, centerY);
      doc.line(centerX - zapW * 0.2, centerY, centerX + zapW * 0.1, centerY);
      doc.line(centerX + zapW * 0.1, centerY, centerX - zapW * 0.3, zapTop + zapH);
      break;

    case 'bluetooth':
      // Símbolo Bluetooth
      const btH = iconSize * 0.6;
      const btW = iconSize * 0.35;
      // Forma de B estilizada
      doc.line(centerX, centerY - btH / 2, centerX, centerY + btH / 2); // Línea vertical
      doc.line(centerX, centerY - btH / 2, centerX + btW, centerY - btH / 6); // Superior derecha
      doc.line(centerX + btW, centerY - btH / 6, centerX - btW / 2, centerY + btH / 6); // Diagonal
      doc.line(centerX - btW / 2, centerY + btH / 6, centerX + btW, centerY + btH / 3); // Diagonal inferior
      doc.line(centerX + btW, centerY + btH / 3, centerX, centerY + btH / 2); // Inferior derecha
      break;

    case 'settings':
      // Engranaje
      const gearR = iconSize * 0.3;
      doc.circle(centerX, centerY, gearR * 0.4, 'S'); // Centro
      // Dientes del engranaje
      const teeth = 6;
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * (gearR - 0.5);
        const y1 = centerY + Math.sin(angle) * (gearR - 0.5);
        const x2 = centerX + Math.cos(angle) * (gearR + 0.8);
        const y2 = centerY + Math.sin(angle) * (gearR + 0.8);
        doc.line(x1, y1, x2, y2);
      }
      break;

    case 'volume-2':
    case 'volume':
      // Altavoz con ondas
      const spkW = iconSize * 0.3;
      const spkH = iconSize * 0.4;
      // Cono del altavoz
      doc.rect(centerX - spkW, centerY - spkH / 4, spkW * 0.4, spkH / 2, 'F');
      doc.line(centerX - spkW + spkW * 0.4, centerY - spkH / 4, centerX, centerY - spkH / 2);
      doc.line(centerX - spkW + spkW * 0.4, centerY + spkH / 4, centerX, centerY + spkH / 2);
      doc.line(centerX, centerY - spkH / 2, centerX, centerY + spkH / 2);
      // Ondas de sonido
      doc.setLineWidth(0.3);
      doc.line(centerX + 1.5, centerY - 1.5, centerX + 2.5, centerY - 2.5);
      doc.line(centerX + 1.5, centerY + 1.5, centerX + 2.5, centerY + 2.5);
      doc.setLineWidth(0.4);
      break;

    case 'keyboard':
      // Teclado
      const kbW = iconSize * 0.8;
      const kbH = iconSize * 0.45;
      doc.roundedRect(centerX - kbW / 2, centerY - kbH / 2, kbW, kbH, 0.5, 0.5, 'S');
      // Teclas (3 filas)
      const keySize = 1;
      const keyGap = 1.8;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          const kx = centerX - kbW / 2 + 1 + col * keyGap;
          const ky = centerY - kbH / 2 + 1 + row * keyGap;
          doc.rect(kx, ky, keySize, keySize, 'F');
        }
      }
      // Barra espaciadora
      doc.rect(centerX - kbW / 4, centerY + kbH / 2 - 2, kbW / 2, 1, 'F');
      break;

    default:
      // Ícono genérico: cuadrado con punto
      doc.rect(centerX - iconSize / 3, centerY - iconSize / 3, iconSize * 0.66, iconSize * 0.66, 'S');
      doc.circle(centerX, centerY, 1, 'F');
      break;
  }
};

/**
 * Calcula la altura necesaria para una categoría
 */
const calculateCategoryHeight = (doc: jsPDF, category: SpecCategory, contentWidth: number): number => {
  const headerHeight = 20; // iconY(5) + iconSize(10) + lineOffset(3) + gap(2)
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
 * Genera y descarga el PDF de la ficha técnica
 */
export const generateSpecSheetPDF = async (data: SpecSheetPDFData): Promise<void> => {
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
    doc.setFont('helvetica', 'normal');
    doc.text(data.productBrand.toUpperCase(), margin + imgSize + 12, y + 15);

    doc.setTextColor(...PDF_COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(data.productName, margin + imgSize + 12, y + 24);
  } else {
    // Sin imagen
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(data.productBrand.toUpperCase(), margin + 8, y + 10);

    doc.setTextColor(...PDF_COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(data.productName, margin + 8, y + 18);
  }

  y += productCardHeight + 10;

  // ===== TÍTULO ESPECIFICACIONES =====
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
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
    const cardHeight = calculateCategoryHeight(doc, category, cardWidth - 16);

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

    // Header de categoría
    const headerPadding = 6;
    const iconSize = 10;
    const iconX = cardX + headerPadding;
    const iconY = finalCardY + 5;

    // Cuadrado con ícono
    doc.setFillColor(...PDF_COLORS.primary);
    doc.roundedRect(iconX, iconY, iconSize, iconSize, 1.5, 1.5, 'F');

    // Dibujar ícono dentro del cuadrado
    drawCategoryIcon(doc, category.icon, iconX, iconY, iconSize);

    // Título de categoría (alineado verticalmente con el centro del ícono)
    const textY = iconY + iconSize / 2 + 1; // Centro vertical del ícono + ajuste baseline
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(category.category, iconX + iconSize + 4, textY);

    // Línea separadora bajo header
    const lineY = iconY + iconSize + 3;
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(cardX + headerPadding, lineY, cardX + cardWidth - headerPadding, lineY);

    // Specs list
    let specY = lineY + 5;
    const labelX = cardX + headerPadding;
    const valueX = cardX + cardWidth - headerPadding;
    const maxValueWidth = cardWidth * 0.45;

    category.specs.forEach((spec) => {
      if (spec.highlight) {
        doc.setFillColor(...PDF_COLORS.primaryLight);
        doc.roundedRect(cardX + 3, specY - 2, cardWidth - 6, 6, 1, 1, 'F');
      }

      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(spec.label, labelX, specY + 2);

      if (spec.highlight) {
        doc.setTextColor(...PDF_COLORS.primary);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
      }

      const valueLines = doc.splitTextToSize(spec.value, maxValueWidth);
      valueLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, valueX, specY + 2 + lineIdx * 4, { align: 'right' });
      });

      const rowHeight = Math.max(6, valueLines.length * 4 + 2);
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
    // Verificar espacio
    if (y + 60 > pageHeight - PDF_LAYOUT.footerHeight - 10) {
      doc.addPage();
      drawPageBackground(doc);
      y = margin;
    }

    // Título
    doc.setTextColor(...PDF_COLORS.text);
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
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('IZQUIERDA', margin + 10, portsContentY);

    let portY = portsContentY + 6;
    leftPorts.forEach((port) => {
      doc.setFillColor(...PDF_COLORS.pageBg);
      doc.roundedRect(margin + 8, portY - 3, colWidthPorts - 10, 7, 1, 1, 'F');
      doc.setTextColor(...PDF_COLORS.text);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(port.name + (port.count > 1 ? ` ×${port.count}` : ''), margin + 12, portY + 1);
      portY += 8;
    });

    // Laptop visual mejorada (centro)
    const laptopX = margin + colWidthPorts + 12;
    const laptopY = portsContentY + 3;
    const laptopW = 36;
    const laptopH = 28;

    // Pantalla (parte superior)
    const screenH = laptopH * 0.7;
    doc.setFillColor(60, 60, 70); // Gris oscuro para pantalla
    doc.roundedRect(laptopX, laptopY, laptopW, screenH, 1.5, 1.5, 'F');

    // Borde de pantalla (marco)
    doc.setFillColor(40, 40, 50);
    doc.roundedRect(laptopX, laptopY, laptopW, screenH, 1.5, 1.5, 'S');

    // Pantalla interior (área de display)
    doc.setFillColor(80, 90, 110); // Azul grisáceo para simular pantalla encendida
    doc.roundedRect(laptopX + 2, laptopY + 2, laptopW - 4, screenH - 4, 0.5, 0.5, 'F');

    // Reflejo sutil en pantalla
    doc.setFillColor(255, 255, 255);
    doc.setGState(new GState({ opacity: 0.1 }));
    doc.roundedRect(laptopX + 3, laptopY + 3, laptopW - 6, screenH * 0.3, 0.5, 0.5, 'F');
    doc.setGState(new GState({ opacity: 1 }));

    // Cámara web (punto en el borde superior)
    doc.setFillColor(30, 30, 35);
    doc.circle(laptopX + laptopW / 2, laptopY + 1.5, 0.6, 'F');

    // Base/Teclado (parte inferior)
    const baseY = laptopY + screenH;
    const baseH = laptopH - screenH;
    doc.setFillColor(180, 180, 185); // Gris claro para base
    doc.roundedRect(laptopX - 1, baseY, laptopW + 2, baseH, 1, 1, 'F');

    // Touchpad
    doc.setFillColor(160, 160, 165);
    doc.roundedRect(laptopX + laptopW / 2 - 5, baseY + 2, 10, 4, 0.5, 0.5, 'F');

    // Indicadores de puertos (barras laterales)
    doc.setFillColor(...PDF_COLORS.primary);
    doc.setGState(new GState({ opacity: 0.5 }));
    // Izquierda
    doc.roundedRect(laptopX - 2.5, laptopY + screenH * 0.3, 2, screenH * 0.4, 0.5, 0.5, 'F');
    // Derecha
    doc.roundedRect(laptopX + laptopW + 0.5, laptopY + screenH * 0.3, 2, screenH * 0.4, 0.5, 0.5, 'F');
    // Trasera (si hay puertos traseros)
    if (backPorts.length > 0) {
      doc.roundedRect(laptopX + laptopW * 0.3, laptopY - 2, laptopW * 0.4, 1.5, 0.5, 0.5, 'F');
    }
    doc.setGState(new GState({ opacity: 1 }));

    // Derecha
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DERECHA', margin + colWidthPorts + 55, portsContentY);

    portY = portsContentY + 6;
    rightPorts.forEach((port) => {
      doc.setFillColor(...PDF_COLORS.pageBg);
      doc.roundedRect(margin + colWidthPorts + 53, portY - 3, colWidthPorts - 10, 7, 1, 1, 'F');
      doc.setTextColor(...PDF_COLORS.text);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(port.name + (port.count > 1 ? ` ×${port.count}` : ''), margin + colWidthPorts + 57, portY + 1);
      portY += 8;
    });

    // Trasera (si hay)
    if (backPorts.length > 0) {
      const backY = portsContentY + 24 + Math.max(leftPorts.length, rightPorts.length) * 8;
      doc.setDrawColor(...PDF_COLORS.border);
      doc.line(margin + 10, backY - 5, margin + contentWidth - 10, backY - 5);

      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('PARTE TRASERA', margin + 10, backY);

      let backX = margin + 10;
      backPorts.forEach((port) => {
        doc.setFillColor(...PDF_COLORS.pageBg);
        const portWidth = doc.getTextWidth(port.name + (port.count > 1 ? ` ×${port.count}` : '')) + 8;
        doc.roundedRect(backX, backY + 3, portWidth, 7, 1, 1, 'F');
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(port.name + (port.count > 1 ? ` ×${port.count}` : ''), backX + 4, backY + 8);
        backX += portWidth + 5;
      });
    }

    // Badges de resumen (alineados verticalmente, centrados)
    const totalPorts = data.ports.reduce((acc, p) => acc + p.count, 0);
    const leftCount = leftPorts.reduce((acc, p) => acc + p.count, 0);
    const rightCount = rightPorts.reduce((acc, p) => acc + p.count, 0);

    const badgeFontSize = 7;
    const badgeHeight = 8;
    const badgeGapV = 3;
    const badgesStartY = y + portsCardHeight - 22;
    const centerX = margin + contentWidth / 2;

    // Cálculo para centrar texto verticalmente en badge
    // En jsPDF Y es baseline. Para centrar: badgeHeight/2 + pequeño ajuste
    const textOffsetY = badgeHeight / 2 + 1.5;

    // Badge 1: Total puertos (azul) - arriba
    const totalText = `${totalPorts} puertos totales`;
    doc.setFontSize(badgeFontSize);
    doc.setFont('helvetica', 'bold');
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
    doc.setFont('helvetica', 'normal');
    const distBadgeWidth = doc.getTextWidth(distText) + 14;
    doc.setFillColor(PDF_COLORS.pageBg[0] - 15, PDF_COLORS.pageBg[1] - 15, PDF_COLORS.pageBg[2] - 15);
    const badge2Y = badgesStartY + badgeHeight + badgeGapV;
    doc.roundedRect(centerX - distBadgeWidth / 2, badge2Y, distBadgeWidth, badgeHeight, 3, 3, 'F');
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(distText, centerX, badge2Y + textOffsetY, { align: 'center' });

    y += portsCardHeight + 10;
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
