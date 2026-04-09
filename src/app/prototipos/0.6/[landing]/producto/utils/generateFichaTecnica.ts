/**
 * Genera un PDF de Ficha Técnica para un producto.
 * Usa jsPDF para crear un documento estilizado con specs, imagen y puertos.
 */

import jsPDF from 'jspdf';

interface SpecItem { label: string; value: string; highlight?: boolean }
interface SpecCategory { category: string; specs: SpecItem[] }
interface PortInfo { name: string; position: string; count?: number }

interface FichaTecnicaData {
  productName: string;
  brand: string;
  imageUrl?: string;
  specs: SpecCategory[];
  ports: PortInfo[];
  price?: number;
  lowestQuota?: number;
}

// Colors as [r,g,b]
type RGB = [number, number, number];
const CYAN: RGB = [0, 255, 213];
const PURPLE: RGB = [99, 102, 241];
const DARK_BG: RGB = [14, 14, 14];
const CARD_BG: RGB = [26, 26, 26];
const SURFACE_BG: RGB = [30, 30, 30];
const WHITE: RGB = [240, 240, 240];
const MUTED: RGB = [112, 112, 112];
const DIVIDER: RGB = [50, 50, 50];
const FOOTER_LINE: RGB = [40, 40, 40];

// Helpers to avoid spread issues with jsPDF
function fc(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function tc(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]); }
function dc(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }

export async function generateFichaTecnica(data: FichaTecnicaData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 16;
  const contentW = W - margin * 2;
  let y = 0;

  // ── Background ──
  fc(doc, DARK_BG);
  doc.rect(0, 0, W, 297, 'F');

  // ── Header ──
  y = 12;
  // Gradient line
  fc(doc, PURPLE);
  doc.rect(0, 0, W, 3, 'F');
  fc(doc, CYAN);
  doc.rect(W / 2, 0, W / 2, 3, 'F');

  // Title
  y = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  tc(doc, WHITE);
  doc.text('FICHA TÉCNICA', margin, y);

  // Brand + date
  y += 8;
  doc.setFontSize(10);
  tc(doc, MUTED);
  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`BaldeCash • Zona Gamer • ${today}`, margin, y);

  // Accent line
  y += 4;
  dc(doc, CYAN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 40, y);

  // ── Product card ──
  y += 8;
  const productCardH = 40;
  fc(doc, CARD_BG);
  roundedRect(doc, margin, y, contentW, productCardH, 4);

  // Product name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  tc(doc, CYAN);
  doc.text(data.productName, margin + 8, y + 14);

  // Brand badge
  doc.setFontSize(10);
  tc(doc, MUTED);
  doc.text(data.brand.toUpperCase(), margin + 8, y + 22);

  // Price info
  if (data.lowestQuota) {
    doc.setFontSize(9);
    tc(doc, MUTED);
    doc.text('Cuota desde', margin + 8, y + 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    tc(doc, CYAN);
    doc.text(`S/${Math.round(data.lowestQuota)}/mes`, margin + 8, y + 37);
  }

  if (data.price) {
    doc.setFontSize(9);
    tc(doc, MUTED);
    doc.text(`Precio: S/${data.price.toLocaleString('es-PE')}`, contentW - 10, y + 37, { align: 'right' });
  }

  y += productCardH + 8;

  // ── Specs Section ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  tc(doc, WHITE);
  doc.text('ESPECIFICACIONES', margin, y);
  y += 2;

  // Accent line
  dc(doc, CYAN);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 30, y);
  y += 6;

  // Spec cards in 2-column grid
  const colW = (contentW - 6) / 2;
  let col = 0;
  let rowY = y;
  let maxRowH = 0;

  for (const spec of data.specs) {
    const cardH = 10 + spec.specs.length * 7 + 4;

    // Check page break
    if (rowY + cardH > 280) {
      addPage(doc);
      rowY = 16;
      col = 0;
      maxRowH = 0;
    }

    const x = margin + col * (colW + 6);

    // Card background
    fc(doc, SURFACE_BG);
    roundedRect(doc, x, rowY, colW, cardH, 3);

    // Category title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    tc(doc, CYAN);
    doc.text(spec.category.toUpperCase(), x + 6, rowY + 7);

    // Divider
    dc(doc, DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(x + 6, rowY + 10, x + colW - 6, rowY + 10);

    // Spec rows
    let specY = rowY + 16;
    for (const item of spec.specs) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      tc(doc, MUTED);
      doc.text(item.label, x + 6, specY);

      doc.setFont('helvetica', 'bold');
      tc(doc, item.highlight ? CYAN : WHITE);
      const val = doc.splitTextToSize(item.value, colW - 50);
      doc.text(val[0] || item.value, x + colW - 6, specY, { align: 'right' });
      specY += 7;
    }

    if (cardH > maxRowH) maxRowH = cardH;

    col++;
    if (col >= 2) {
      col = 0;
      rowY += maxRowH + 4;
      maxRowH = 0;
    }
  }

  // If last row had only 1 card
  if (col !== 0) {
    rowY += maxRowH + 4;
  }
  y = rowY;

  // ── Ports Section ──
  if (data.ports.length > 0) {
    if (y + 50 > 280) {
      addPage(doc);
      y = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    tc(doc, WHITE);
    doc.text('PUERTOS Y CONECTIVIDAD', margin, y);
    y += 2;
    dc(doc, CYAN);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + 30, y);
    y += 6;

    const leftPorts = data.ports.filter((p) => p.position === 'left');
    const rightPorts = data.ports.filter((p) => p.position === 'right');
    const portCardH = Math.max(leftPorts.length, rightPorts.length) * 9 + 16;

    fc(doc, SURFACE_BG);
    roundedRect(doc, margin, y, contentW, portCardH, 3);

    // Left label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    tc(doc, MUTED);
    doc.text('IZQUIERDA', margin + 8, y + 8);

    // Right label
    doc.text('DERECHA', margin + contentW - 8, y + 8, { align: 'right' });

    // Left ports
    let py = y + 15;
    doc.setFontSize(8);
    for (const port of leftPorts) {
      tc(doc, CYAN);
      doc.text('\u25CF', margin + 8, py);
      tc(doc, WHITE);
      doc.setFont('helvetica', 'normal');
      doc.text(`${port.name}${port.count && port.count > 1 ? ` \u00D7${port.count}` : ''}`, margin + 14, py);
      py += 9;
    }

    // Right ports
    py = y + 15;
    for (const port of rightPorts) {
      tc(doc, CYAN);
      doc.text('\u25CF', margin + contentW - 50, py);
      tc(doc, WHITE);
      doc.setFont('helvetica', 'normal');
      doc.text(`${port.name}${port.count && port.count > 1 ? ` \u00D7${port.count}` : ''}`, margin + contentW - 44, py);
      py += 9;
    }

    y += portCardH + 4;
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer line
    dc(doc, FOOTER_LINE);
    doc.setLineWidth(0.3);
    doc.line(margin, 287, W - margin, 287);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    tc(doc, MUTED);
    doc.text('BaldeCash - Zona Gamer \u2022 Las especificaciones pueden variar seg\u00FAn disponibilidad', margin, 292);
    doc.text(`P\u00E1gina ${i} de ${pageCount}`, W - margin, 292, { align: 'right' });
  }

  // ── Save ──
  const slug = data.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  doc.save(`ficha-tecnica-${data.brand.toLowerCase()}-${slug}.pdf`);
}

function roundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number) {
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function addPage(doc: jsPDF) {
  doc.addPage();
  fc(doc, DARK_BG);
  doc.rect(0, 0, 210, 297, 'F');
}
