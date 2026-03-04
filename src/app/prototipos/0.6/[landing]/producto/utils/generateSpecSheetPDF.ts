/**
 * Generador de PDF para Ficha Técnica (Spec Sheet)
 * Usa jsPDF para crear un documento PDF con las especificaciones del producto
 */

import { jsPDF } from 'jspdf';
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

interface SpecSheetPDFData {
  productName: string;
  productBrand: string;
  productImage?: string;
  specs: SpecCategory[];
  generatedDate: Date;
}

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
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('No se pudo obtener el contexto del canvas'));
      }
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = url;
  });
};

/**
 * Genera y descarga el PDF de la ficha técnica
 */
export const generateSpecSheetPDF = async (data: SpecSheetPDFData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;

  // Colores
  const primaryColor: [number, number, number] = [61, 71, 176]; // #3D47B0
  const textColor: [number, number, number] = [23, 23, 23];
  const grayColor: [number, number, number] = [115, 115, 115];
  const lightGray: [number, number, number] = [245, 245, 245];

  // ===== HEADER =====
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Línea azul inferior como acento
  doc.setFillColor(...primaryColor);
  doc.rect(0, 38, pageWidth, 3, 'F');

  // Logo BaldeCash (lado derecho)
  try {
    const logoWidth = 60;
    const logoHeight = 17;
    const logoX = pageWidth - logoWidth - margin;
    const logoY = 10;
    doc.addImage(BALDECASH_LOGO_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch {
    // Si falla la carga del logo, continuar sin él
  }

  // Título
  doc.setTextColor(...primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FICHA TÉCNICA', margin, 20);

  // Fecha
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${formatDate(data.generatedDate)}`, margin, 30);

  y = 49;

  // ===== DATOS DEL PRODUCTO =====
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Producto', margin, y);
  y += 6;

  // Cargar imagen del producto si está disponible
  let productImageBase64: string | null = null;
  if (data.productImage) {
    try {
      productImageBase64 = await loadImageAsBase64(data.productImage);
    } catch {
      // Si falla la carga de la imagen, continuar sin ella
    }
  }

  const productBoxHeight = productImageBase64 ? 50 : 18;
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, pageWidth - margin * 2, productBoxHeight, 3, 3, 'F');

  if (productImageBase64) {
    // Con imagen: layout horizontal
    const imgSize = 40;
    const imgX = margin + 5;
    const imgY = y + 5;

    try {
      doc.addImage(productImageBase64, 'PNG', imgX, imgY, imgSize, imgSize);
    } catch {
      // Si falla agregar la imagen, continuar sin ella
    }

    // Nombre del producto al lado de la imagen
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.productBrand} ${data.productName}`, margin + imgSize + 15, y + 28);

    y += productBoxHeight + 8;
  } else {
    // Sin imagen: solo texto
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.productBrand} ${data.productName}`, margin + 5, y);
    y += 18;
  }

  // ===== ESPECIFICACIONES =====
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Especificaciones Técnicas', margin, y);
  y += 8;

  const contentWidth = pageWidth - margin * 2;
  const colWidth = contentWidth / 2;
  const rowHeight = 8;
  const categoryHeaderHeight = 10;
  const categoryPadding = 4;

  // Iterar por categorías
  data.specs.forEach((category, catIndex) => {
    // Verificar si necesitamos nueva página
    const estimatedHeight = categoryHeaderHeight + (category.specs.length * rowHeight) + 15;
    if (y + estimatedHeight > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }

    // Header de categoría
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, y, contentWidth, categoryHeaderHeight, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(category.category.toUpperCase(), margin + 5, y + 7);

    y += categoryHeaderHeight + 2;

    // Specs de esta categoría
    category.specs.forEach((spec, specIndex) => {
      // Verificar si necesitamos nueva página
      if (y + rowHeight > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      // Alternar color de fondo
      if (specIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 1, contentWidth, rowHeight, 'F');
      }

      // Label
      doc.setTextColor(...grayColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(spec.label, margin + 5, y + 5);

      // Value
      doc.setTextColor(spec.highlight ? primaryColor[0] : textColor[0], spec.highlight ? primaryColor[1] : textColor[1], spec.highlight ? primaryColor[2] : textColor[2]);
      doc.setFont('helvetica', spec.highlight ? 'bold' : 'normal');

      // Truncar valor si es muy largo
      let displayValue = spec.value;
      const maxValueWidth = colWidth - 10;
      while (doc.getTextWidth(displayValue) > maxValueWidth && displayValue.length > 3) {
        displayValue = displayValue.slice(0, -4) + '...';
      }

      doc.text(displayValue, margin + colWidth, y + 5);

      y += rowHeight;
    });

    y += categoryPadding;
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
    'Las especificaciones pueden variar según el modelo y configuración.',
    margin,
    y
  );
  y += 5;
  doc.text('BaldeCash - Financiamiento para estudiantes | www.baldecash.com', margin, y);

  // Descargar
  const brandSlug = data.productBrand.toLowerCase().replace(/\s+/g, '-');
  const productSlug = data.productName.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
  const fileName = `ficha-tecnica-${brandSlug}-${productSlug}.pdf`;
  doc.save(fileName);
};

export default generateSpecSheetPDF;
