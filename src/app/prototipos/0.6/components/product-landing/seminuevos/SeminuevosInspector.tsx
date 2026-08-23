'use client';

import { useEffect, useRef, useState } from 'react';
import { MediaSlot } from './MediaSlot';
import { PIEZAS, GRADOS, inspectorAssetUrl, quees, type Grado } from './data/seminuevosData';

export function SeminuevosInspector() {
  const [grado, setGrado] = useState<Grado>('A');
  const [pieza, setPieza] = useState(0);

  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Centra la tab activa DENTRO del strip horizontal, sin tocar el scroll de
  // la página. scrollIntoView({ block: 'nearest' }) buscaba el ancestro con
  // overflow vertical más cercano; como el strip solo tiene overflow-x, ese
  // ancestro terminaba siendo el documento y la página entera saltaba ~400px
  // al montar (el <h1> del hero quedaba tapado por el navbar). Se calcula el
  // scrollLeft a mano para mover únicamente el contenedor de las tabs.
  useEffect(() => {
    const strip = tabsRef.current;
    const tab = activeTabRef.current;
    if (!strip || !tab) return;
    const target =
      tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [pieza]);

  const total = PIEZAS.length;
  const prev = () => setPieza((p) => (p - 1 + total) % total);
  const next = () => setPieza((p) => (p + 1) % total);

  const piezaActual = PIEZAS[pieza];
  const titleBase = quees.title.replace(quees.titleAccent, '').trim();

  return (
    <section className="px-[22px] py-12 bg-white">
      <div className="max-w-[720px] mx-auto">
        <h2
          className="font-extrabold text-center"
          style={{ fontSize: 'clamp(24px,6vw,32px)' }}
        >
          {titleBase} <span style={{ color: 'var(--azul)' }}>{quees.titleAccent}</span>
        </h2>

        <p className="mt-3 text-center" style={{ color: '#5b5c6b', fontSize: '15px', lineHeight: 1.6 }}>
          {quees.subtitle}
        </p>

        <div
          className="mt-7 bg-white rounded-[20px] text-left"
          style={{ boxShadow: 'var(--sombra)', border: '1px solid #f0f1f4' }}
        >
          {/* Pills de grado + imagen */}
          <div className="flex items-center gap-3 p-5">
            <div className="flex flex-col gap-2 shrink-0">
              {GRADOS.map((g) => {
                const on = g === grado;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setGrado(g)}
                    className={`min-h-11 rounded-[22px] px-4 text-[13.5px] font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2 ${
                      on ? 'hover:brightness-110' : 'hover:bg-[#e3e6fa]'
                    }`}
                    style={{
                      background: on ? 'var(--navy)' : 'var(--lavanda)',
                      color: on ? '#fff' : 'var(--navy)',
                    }}
                  >
                    Grado {g}
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-h-[180px]">
              <MediaSlot
                src={inspectorAssetUrl(piezaActual, grado)}
                alt={`${piezaActual} de un equipo Grado ${grado}`}
                className="h-full min-h-[180px]"
              />
              <span
                data-testid="insp-badge"
                className="absolute left-3 bottom-3 rounded-[20px] px-3 py-1 text-[12px] font-semibold text-white"
                style={{ background: 'rgba(21,23,68,.75)' }}
              >
                {piezaActual} · Grado {grado}
              </span>
            </div>
          </div>

          {/* Tabs de pieza */}
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PIEZAS.map((p, i) => {
              const on = i === pieza;
              return (
                <button
                  key={p}
                  type="button"
                  ref={on ? activeTabRef : undefined}
                  aria-pressed={on}
                  onClick={() => setPieza(i)}
                  className={`shrink-0 min-h-11 flex items-center rounded-[20px] px-3.5 text-[13px] font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2 ${
                    on ? 'hover:brightness-110' : 'hover:bg-[#e8e9ee]'
                  }`}
                  style={{
                    background: on ? 'var(--azul)' : '#f4f5f8',
                    color: on ? '#fff' : '#5b5c6b',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Navegación */}
          <div
            className="flex items-center justify-between px-2 py-1"
            style={{ borderTop: '1px solid var(--borde)' }}
          >
            <button
              type="button"
              onClick={prev}
              className="min-h-11 px-3 rounded-[10px] text-[13.5px] font-semibold cursor-pointer transition-colors hover:bg-[var(--lavanda)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2"
              style={{ color: 'var(--azul)' }}
            >
              ‹ Anterior
            </button>
            <span data-testid="insp-counter" className="text-[13px]" style={{ color: 'var(--tenue)' }}>
              {pieza + 1} / {total}
            </span>
            <button
              type="button"
              onClick={next}
              className="min-h-11 px-3 rounded-[10px] text-[13.5px] font-semibold cursor-pointer transition-colors hover:bg-[var(--lavanda)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2"
              style={{ color: 'var(--azul)' }}
            >
              Siguiente ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
