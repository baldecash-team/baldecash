'use client';

/**
 * Tira de thumbnails del grado (sección "condición") con ancho FIJO = ancho de
 * la imagen principal (148px). Con ≤3 fotos se muestra inline (calzan justo).
 * Con ≥4 fotos se vuelve un slider paginado (viewport fijo + flechas ‹ › y dots
 * debajo), para que la columna izquierda NO se ensanche y no empuje la columna
 * de "Características".
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const THUMB = 44;
const GAP = 8;
const PER_PAGE = 3; // 3*44 + 2*8 = 148px = ancho de la imagen principal
const VIEWPORT = PER_PAGE * THUMB + (PER_PAGE - 1) * GAP; // 148
const PAGE_SHIFT = PER_PAGE * (THUMB + GAP); // 156

interface Props {
  images: string[];
  selected: number;
  onSelect: (i: number) => void;
  grade: string;
}

function Thumb({ url, active, onClick, alt }: { url: string; active: boolean; onClick: () => void; alt: string }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: THUMB, height: THUMB, flex: 'none', borderRadius: 9,
        border: active ? '2px solid #4654cd' : '1.5px solid #e8e8ee',
        background: '#fff', display: 'grid', placeItems: 'center',
        overflow: 'hidden', cursor: 'pointer', padding: 4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
  );
}

export default function GradeThumbStrip({ images, selected, onSelect, grade }: Props) {
  const [page, setPage] = useState(0);
  if (images.length <= 1) return null;

  // ≤3 fotos: inline, sin slider (comportamiento previo, calza en 148px).
  if (images.length <= PER_PAGE) {
    return (
      <div style={{ display: 'flex', gap: GAP, marginTop: 10 }}>
        {images.map((url, i) => (
          <Thumb key={i} url={url} active={i === selected} onClick={() => onSelect(i)} alt={`Grado ${grade} ${i + 1}`} />
        ))}
      </div>
    );
  }

  // ≥4 fotos: slider paginado con ancho fijo.
  const pages = Math.ceil(images.length / PER_PAGE);
  const clamped = Math.min(page, pages - 1);
  const go = (p: number) => setPage(Math.max(0, Math.min(pages - 1, p)));

  return (
    <div style={{ marginTop: 10, width: VIEWPORT }}>
      <div style={{ width: VIEWPORT, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex', gap: GAP,
            transform: `translateX(-${clamped * PAGE_SHIFT}px)`,
            transition: 'transform 0.25s ease',
          }}
        >
          {images.map((url, i) => (
            <Thumb key={i} url={url} active={i === selected} onClick={() => onSelect(i)} alt={`Grado ${grade} ${i + 1}`} />
          ))}
        </div>
      </div>
      {/* Controles: ‹ dots › debajo, sin cambiar el ancho de la columna. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}>
        <button
          type="button" aria-label="Fotos anteriores" onClick={() => go(clamped - 1)} disabled={clamped === 0}
          style={{
            width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #e8e8ee', background: '#fff',
            display: 'grid', placeItems: 'center', cursor: clamped === 0 ? 'default' : 'pointer',
            opacity: clamped === 0 ? 0.4 : 1, padding: 0,
          }}
        >
          <ChevronLeft size={14} color="#4654cd" />
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: pages }).map((_, p) => (
            <span
              key={p} onClick={() => go(p)}
              style={{
                width: p === clamped ? 16 : 6, height: 6, borderRadius: 3,
                background: p === clamped ? '#4654cd' : '#d6d6e0',
                cursor: 'pointer', transition: 'width 0.2s ease, background 0.2s ease',
              }}
            />
          ))}
        </div>
        <button
          type="button" aria-label="Fotos siguientes" onClick={() => go(clamped + 1)} disabled={clamped === pages - 1}
          style={{
            width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #e8e8ee', background: '#fff',
            display: 'grid', placeItems: 'center', cursor: clamped === pages - 1 ? 'default' : 'pointer',
            opacity: clamped === pages - 1 ? 0.4 : 1, padding: 0,
          }}
        >
          <ChevronRight size={14} color="#4654cd" />
        </button>
      </div>
    </div>
  );
}
