'use client';

import { useEffect, useRef, useState } from 'react';
import { ZoomSlot } from './ZoomSlot';
import { InspectorLightbox } from './InspectorLightbox';
import { PIEZAS, GRADOS, inspectorAssetUrl, quees, type Grado } from './data/seminuevosData';

export function SeminuevosInspector() {
  const [grado, setGrado] = useState<Grado>('A');
  const [pieza, setPieza] = useState(0);
  const [visor, setVisor] = useState(false);

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

  // Si las tabs no entran en el ancho disponible, la barra de scroll oculta no
  // delata que la lista sigue. Se difumina el borde del lado con contenido
  // fuera de vista; si el strip entra completo, no se difumina ningún lado.
  // Se mide en runtime, así que con las 3 piezas actuales se apaga solo y
  // vuelve a activarse si se agregan más (BAL-3317).
  const [desborde, setDesborde] = useState({ izq: false, der: false });

  useEffect(() => {
    const strip = tabsRef.current;
    if (!strip) return;

    const medir = () => {
      const { scrollLeft, scrollWidth, clientWidth } = strip;
      setDesborde({
        izq: scrollLeft > 1,
        der: scrollLeft + clientWidth < scrollWidth - 1,
      });
    };

    medir();
    strip.addEventListener('scroll', medir, { passive: true });
    // El ancho disponible cambia al rotar el teléfono o redimensionar.
    const ro = new ResizeObserver(medir);
    ro.observe(strip);
    return () => {
      strip.removeEventListener('scroll', medir);
      ro.disconnect();
    };
  }, []);

  // Cuánto hay que correr las tabs a la derecha para que su centro coincida con
  // el de la imagen. Desde sm es el ancho de la columna de pills más el gap;
  // en móvil las pills van arriba y no hay nada que compensar, así que 0.
  const pillsRef = useRef<HTMLDivElement>(null);
  const [sangria, setSangria] = useState(0);

  useEffect(() => {
    const pills = pillsRef.current;
    if (!pills) return;

    const medir = () => {
      // En móvil las pills quedan APILADAS sobre la imagen (flex-col), y ahí su
      // ancho no desplaza nada. Se detecta por la posición real y no por un
      // breakpoint escrito a mano, que se desincronizaría del `sm:` del layout.
      const enColumna = pills.getBoundingClientRect().bottom
        <= (pills.nextElementSibling?.getBoundingClientRect().top ?? 0);
      if (enColumna) return setSangria(0);
      const gap = parseFloat(getComputedStyle(pills.parentElement!).columnGap) || 0;
      setSangria(pills.getBoundingClientRect().width + gap);
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(pills);
    if (pills.parentElement) ro.observe(pills.parentElement);
    return () => ro.disconnect();
  }, []);

  const total = PIEZAS.length;

  // Cambiar de pieza vuelve SIEMPRE al grado A, por pedido de producto: cada
  // pieza se lee de mejor a peor, y arrastrar el grado anterior dejaba al
  // visitante viendo un grado C de entrada sin haberlo elegido para esa pieza.
  const irA = (i: number) => {
    setPieza(i);
    setGrado('A');
  };
  const prev = () => irA((pieza - 1 + total) % total);
  const next = () => irA((pieza + 1) % total);

  // Máscara: transparente en el borde con contenido oculto, opaco si no hay nada más.
  const bordeIzq = desborde.izq ? 'transparent 0, black 24px' : 'black 0';
  const bordeDer = desborde.der ? 'black calc(100% - 24px), transparent 100%' : 'black 100%';
  const mascara = `linear-gradient(to right, ${bordeIzq}, ${bordeDer})`;

  const piezaActual = PIEZAS[pieza];
  const titleBase = quees.title.replace(quees.titleAccent, '').trim();

  return (
    <section
      id="que-es"
      className="px-[22px] py-12 bg-white"
      style={{ scrollMarginTop: 'var(--header-total-height, 6.5rem)' }}
    >
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
          {/* Pills de grado + imagen.
              Mobile: pills en fila horizontal, arriba de la imagen (a pedido
              del dueño de producto, para no quitarle ancho a la img principal).
              Desde sm: layout original en columna, al costado. */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-5">
            <div ref={pillsRef} className="flex flex-row sm:flex-col gap-2 shrink-0">
              {GRADOS.map((g) => {
                const on = g === grado;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setGrado(g)}
                    className={`min-h-11 flex-1 sm:flex-initial rounded-[22px] px-4 text-[13.5px] font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2 ${
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
              <ZoomSlot
                src={inspectorAssetUrl(piezaActual, grado)}
                alt={`${piezaActual} de un equipo Grado ${grado}`}
                className="h-full min-h-[180px]"
                onAmpliar={() => setVisor(true)}
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

          {/* Tabs de pieza.
              Centradas sobre la IMAGEN, no sobre la tarjeta: desde sm las pills
              de grado ocupan una columna a la izquierda, así que sin compensar
              su ancho las tabs quedan corridas respecto del centro de la foto.
              El desplazamiento se MIDE (no se escribe a mano) porque depende
              del texto de los grados y de la tipografía; en móvil las pills van
              arriba y la compensación es 0.
              justify-center solo actúa cuando las tabs entran completas: si
              vuelven a desbordar, el navegador lo ignora y manda el scroll. */}
          <div
            ref={tabsRef}
            className="flex gap-2 justify-center overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage: mascara,
              WebkitMaskImage: mascara,
              paddingLeft: `calc(1.25rem + ${sangria}px)`,
            }}
          >
            {PIEZAS.map((p, i) => {
              const on = i === pieza;
              return (
                <button
                  key={p}
                  type="button"
                  ref={on ? activeTabRef : undefined}
                  aria-pressed={on}
                  onClick={() => irA(i)}
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

      {/* El grado se comparte con el visor: cambiarlo ahí adentro deja la
          tarjeta en la misma calidad al cerrar, que es lo que uno espera. */}
      <InspectorLightbox
        abierto={visor}
        pieza={piezaActual}
        grado={grado}
        onGrado={setGrado}
        onClose={() => setVisor(false)}
      />
    </section>
  );
}
