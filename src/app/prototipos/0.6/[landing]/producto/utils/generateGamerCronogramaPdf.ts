/**
 * Genera un PDF de Cronograma de Pagos con estilo gamer oscuro.
 */

import jsPDF from 'jspdf';

type RGB = [number, number, number];
const CYAN: RGB = [0, 255, 213];
const PURPLE: RGB = [99, 102, 241];
const DARK_BG: RGB = [14, 14, 14];
const CARD_BG: RGB = [26, 26, 26];
const SURFACE: RGB = [30, 30, 30];
const WHITE: RGB = [240, 240, 240];
const MUTED: RGB = [112, 112, 112];
const GREEN: RGB = [34, 197, 94];
const TH_BG: RGB = [99, 102, 241];

function fc(d: jsPDF, c: RGB) { d.setFillColor(c[0], c[1], c[2]); }
function tc(d: jsPDF, c: RGB) { d.setTextColor(c[0], c[1], c[2]); }
function dc(d: jsPDF, c: RGB) { d.setDrawColor(c[0], c[1], c[2]); }

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

interface CronogramaRow {
  month: number;
  date: string;
  capital: number;
  interest: number;
  quota: number;
  balance: number;
}

export interface GamerCronogramaData {
  productName: string;
  productBrand: string;
  price: number;
  term: number;
  monthlyQuota: number;
  tea?: number;
  tcea?: number;
}

export function generateGamerCronogramaPdf(data: GamerCronogramaData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const m = 16;
  const cW = W - m * 2;

  // Build amortization rows
  const tasaMensual = 0.049;
  const comision = Math.round(data.monthlyQuota * 0.09);
  let saldo = data.price;
  const now = new Date();
  const rows: CronogramaRow[] = [];

  for (let i = 1; i <= data.term; i++) {
    const interes = Math.round(saldo * tasaMensual);
    const capital = Math.round(data.monthlyQuota - interes - comision);
    saldo = Math.max(0, saldo - capital);
    const mesIdx = (now.getMonth() + i) % 12;
    const anio = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
    rows.push({ month: i, date: `${MONTHS[mesIdx]} de ${anio}`, capital, interest: interes, quota: Math.round(data.monthlyQuota), balance: saldo });
  }

  const totalPagar = rows.length * Math.round(data.monthlyQuota);

  function drawBg() {
    fc(doc, DARK_BG);
    doc.rect(0, 0, W, 297, 'F');
  }
  drawBg();

  let y = 0;

  // ── Header gradient line ──
  fc(doc, PURPLE);
  doc.rect(0, 0, W, 3, 'F');
  fc(doc, CYAN);
  doc.rect(W / 2, 0, W / 2, 3, 'F');

  // ── Title ──
  y = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  tc(doc, WHITE);
  doc.text('Cronograma de Pagos', m, y);

  y += 8;
  doc.setFontSize(10);
  tc(doc, MUTED);
  const today = now.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Detalle de financiamiento \u2022 ${today}`, m, y);

  y += 4;
  dc(doc, CYAN);
  doc.setLineWidth(0.5);
  doc.line(m, y, m + 40, y);

  // ── Product info card ──
  y += 8;
  fc(doc, CARD_BG);
  doc.roundedRect(m, y, cW, 28, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  tc(doc, CYAN);
  doc.text(data.productName, m + 8, y + 10);

  doc.setFontSize(9);
  tc(doc, MUTED);
  doc.text(`${data.productBrand} \u2022 Precio: S/${data.price.toLocaleString('es-PE')} \u2022 ${data.term} meses \u2022 Cuota: S/${Math.round(data.monthlyQuota)}/mes`, m + 8, y + 19);

  y += 34;

  // ── Financial info cards ──
  const cardW = (cW - 8) / 3;
  const cards = [
    { label: 'TEA', value: `${data.tea || 59.4}%`, highlight: false },
    { label: 'TCEA', value: `${data.tcea || 91.96}%`, highlight: false },
    { label: 'Total a Pagar', value: `S/${totalPagar.toLocaleString('es-PE')}`, highlight: true },
  ];

  cards.forEach((card, i) => {
    const x = m + i * (cardW + 4);
    fc(doc, card.highlight ? [10, 40, 20] as RGB : SURFACE);
    doc.roundedRect(x, y, cardW, 18, 3, 3, 'F');
    doc.setFontSize(7);
    tc(doc, MUTED);
    doc.text(card.label, x + 6, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    tc(doc, card.highlight ? GREEN : WHITE);
    doc.text(card.value, x + 6, y + 15);
    doc.setFont('helvetica', 'normal');
  });

  y += 24;

  // ── Table title ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  tc(doc, WHITE);
  doc.text('Tabla de Amortizaci\u00F3n', m, y);
  y += 6;

  // ── Table ──
  const cols = [
    { label: 'Cuota', w: 18 },
    { label: 'Fecha', w: 40 },
    { label: 'Capital', w: 28 },
    { label: 'Inter\u00E9s', w: 28 },
    { label: 'Monto', w: 28 },
    { label: 'Saldo', w: 36 },
  ];
  const rowH = 7;

  function drawTableHeader(startY: number) {
    fc(doc, TH_BG);
    doc.roundedRect(m, startY, cW, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    tc(doc, [255, 255, 255] as RGB);
    let cx = m + 4;
    for (const col of cols) {
      const isRight = col.label !== 'Cuota' && col.label !== 'Fecha';
      if (isRight) {
        doc.text(col.label, cx + col.w - 4, startY + 5.5, { align: 'right' });
      } else {
        doc.text(col.label, cx, startY + 5.5);
      }
      cx += col.w;
    }
    return startY + 10;
  }

  y = drawTableHeader(y);

  for (const row of rows) {
    if (y + rowH > 282) {
      drawPageFooter(doc, m, W);
      doc.addPage();
      drawBg();
      y = 12;
      y = drawTableHeader(y);
    }

    // Alternate row bg
    if (row.month % 2 === 0) {
      fc(doc, SURFACE);
      doc.rect(m, y - 1, cW, rowH, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    let cx = m + 4;

    // Cuota number
    tc(doc, row.month === data.term ? GREEN : CYAN);
    doc.setFont('helvetica', 'bold');
    doc.text(String(row.month), cx, y + 4);
    cx += cols[0].w;

    // Fecha
    tc(doc, MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(row.date, cx, y + 4);
    cx += cols[1].w;

    // Capital
    tc(doc, WHITE);
    doc.text(`S/${row.capital}`, cx + cols[2].w - 4, y + 4, { align: 'right' });
    cx += cols[2].w;

    // Interés
    tc(doc, MUTED);
    doc.text(`S/${row.interest}`, cx + cols[3].w - 4, y + 4, { align: 'right' });
    cx += cols[3].w;

    // Monto
    tc(doc, WHITE);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/${row.quota}`, cx + cols[4].w - 4, y + 4, { align: 'right' });
    cx += cols[4].w;

    // Saldo
    tc(doc, MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(`S/${row.balance.toLocaleString('es-PE')}`, cx + cols[5].w - 4, y + 4, { align: 'right' });

    y += rowH;
  }

  // Footer on last page
  drawPageFooter(doc, m, W);

  // ── Save ──
  const slug = data.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  doc.save(`cronograma-${slug}-${data.term}meses.pdf`);
}

function drawPageFooter(doc: jsPDF, m: number, W: number) {
  dc(doc, [40, 40, 40] as RGB);
  doc.setLineWidth(0.3);
  doc.line(m, 287, W - m, 287);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  tc(doc, MUTED);
  doc.text('REFERENCIAL \u2022 BaldeCash - Zona Gamer \u2022 Las condiciones finales se confirman al momento de la aprobaci\u00F3n', m, 292);

  const pageCount = doc.getNumberOfPages();
  const currentPage = doc.getCurrentPageInfo().pageNumber;
  tc(doc, [80, 80, 80] as RGB);
  doc.text(`P\u00E1gina ${currentPage} de ${pageCount}`, W - m, 292, { align: 'right' });
}
