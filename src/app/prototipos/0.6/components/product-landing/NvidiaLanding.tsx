'use client';

import { lazy, Suspense, useState, useEffect, useRef, useMemo, useCallback, type ReactNode, type CSSProperties } from 'react';
import { changeTab } from './nvidia/viewTransition';
import { useLenis } from './shared/hooks/useLenis';
import { useDeviceCapabilities } from './shared/hooks/useDeviceCapabilities';
import { Footer } from '../hero/Footer';
import type { FooterData, PromoBannerData } from '../../types/hero';
import {
  NVIDIA_ASSETS,
  heroData, quienesSomos, queEsData, gpuChipUrl,
  CAREERS, estrellaData, beneficiosData, navLinks,
} from './data/nvidiaData';

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap';

// ---- Lazy below-fold dynamic section (catálogo desde API) ----
const NvidiaCatalogSection = lazy(() => import('./nvidia/NvidiaCatalogSection'));

// ---- LazySection (mismo patrón que MacBook Neo) ----
function LazySection({ children, fallbackHeight = 400 }: { children: ReactNode; fallbackHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref}>
      {visible
        ? <Suspense fallback={<div style={{ height: fallbackHeight }} />}>{children}</Suspense>
        : <div style={{ height: fallbackHeight }} />}
    </div>
  );
}

interface NvidiaLandingProps {
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
}

// Reveal al hacer scroll: los elementos .reveal aparecen (fade + subir) al
// entrar en pantalla. Replica el ScrollTrigger del prototipo. Un MutationObserver
// engancha también los bloques que montan tarde (LazySection).
function useScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.nvidia-landing');
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    const scan = () => root.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}


export default function NvidiaLanding({ footerData, landing = 'nvidia', previewBannerOffset = 0 }: NvidiaLandingProps) {
  useLenis();
  useScrollReveal();
  const { tier } = useDeviceCapabilities();
  const [scrolled, setScrolled] = useState(false);
  const [expGpu, setExpGpu] = useState<(typeof queEsData.cards)[number] | null>(null);

  // Google Fonts (guard de duplicados)
  useEffect(() => {
    const id = 'nvidia-google-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS;
    document.head.appendChild(link);
  }, []);

  // Al montar: si llega un hash (link del NvidiaNavbar desde una subruta) hacemos
  // scroll a esa sección; si no, scroll al top. Las secciones son lazy, así que se
  // reintenta unas veces hasta que el elemento exista.
  useEffect(() => {
    if (window.location.pathname.includes('/preview/')) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const id = window.location.hash.slice(1);
    if (id && id !== 'top') {
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
        if (tries++ < 40) setTimeout(tick, 80); // ~3.2s máx (espera secciones lazy)
      };
      tick();
    } else {
      window.scrollTo(0, 0);
      if (window.location.hash) history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Nav scrolled state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
    <div className="nvidia-landing" style={{ paddingTop: previewBannerOffset }}>
      <link rel="preconnect" href="https://baldecash.s3.amazonaws.com" />
      <link rel="dns-prefetch" href="https://baldecash.s3.amazonaws.com" />
      <style>{CSS}</style>

      {/* ===== Navbar ===== */}
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#top" className="lockup" onClick={(e) => { e.preventDefault(); scrollTo('top'); }}>
            <img className="lockup-logo" src={quienesSomos.partnerLogo} alt="BaldeCash × NVIDIA" />
          </a>
          <nav className="nav-links">
            {navLinks.map((l) => (
              <button key={l.sectionId} type="button" onClick={() => scrollTo(l.sectionId)}>{l.label}</button>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== S1: Hero ===== */}
      <section className="mac" id="top">
        <div className="mac-sticky">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1>Tu carrera tiene <span className="grad-text">grandes planes,</span> tu laptop también</h1>
              <p>{heroData.description} <span className="green-text">{heroData.descriptionGreen}</span> {heroData.descriptionPost}</p>
              <div className="mac-cta">
                <button className="btn btn-green" type="button" onClick={() => scrollTo(heroData.cta.scrollTo)}>
                  {heroData.cta.label}
                  <span className="ic"><Arrow /></span>
                </button>
                <button className="btn btn-outline" type="button" onClick={() => scrollTo('catalogo')}>
                  Ver catálogo
                </button>
              </div>
            </div>
            <div className="hero-media">
              {/* El video del hero SIEMPRE se muestra (igual que el prototipo).
                  En tier 'base' no auto-reproduce para ahorrar batería, pero el
                  video sigue visible al lado derecho del texto. */}
              <div className="pitch-video">
                <video autoPlay={tier === 'enhanced'} muted loop playsInline preload="auto">
                  <source src={heroData.video} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== S2: Quiénes somos ===== */}
      <LazySection fallbackHeight={500}>
        <section className="section" id="baldecash">
          <div className="wrap">
            <div className="bc-grid">
              <div className="bc-copy reveal">
                <span className="eyebrow">{quienesSomos.eyebrow}</span>
                <h2>Financiamos el equipo que <span className="grad-text">necesitas para tu carrera</span></h2>
                <p>{quienesSomos.description}</p>
                <div className="bc-points">
                  {quienesSomos.points.map((p, i) => (
                    <div className="bc-pt" key={p.title}>
                      <span className="bc-ic">{BC_ICONS[i]}</span>
                      <span className="bc-txt"><b>{p.title}</b><span>{p.detail}</span></span>
                    </div>
                  ))}
                </div>
                <span className="bc-partner-label">{quienesSomos.partnerLabel}</span>
                <img className="bc-partner" src={quienesSomos.partnerLogo} alt="BaldeCash × NVIDIA, partner oficial" />
              </div>
              <div className="bc-media reveal">
                <img src={quienesSomos.media} alt="Baldi de BaldeCash con una laptop GeForce RTX" loading="lazy" />
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== S3: Selector de software por carrera ===== */}
      <LazySection fallbackHeight={500}>
        <SoftwareSelector onOpenGpu={(model) => { const c = queEsData.cards.find((card) => card.model === model); if (c) setExpGpu(c); }} />
      </LazySection>

      {/* ===== S4: Rendimiento ===== */}
      <LazySection fallbackHeight={500}>
        <PerformanceChart />
      </LazySection>

      {/* ===== S5: Equipo estrella ===== */}
      <LazySection fallbackHeight={400}>
        <section className="section star-sec" id="estrella">
          <div className="wrap">
            <div className="star">
              <div className="star-copy reveal">
                <span className="eyebrow">{estrellaData.eyebrow}</span>
                <h2>HP Victus <span className="grad-text">{estrellaData.highlight}</span></h2>
                <p className="star-lead">Equipada con la nueva <span className="green-text">GeForce RTX 5050</span>, además de 24 GB de RAM y 1 TB SSD. Lista para diseñar, simular, editar, programar y mucho más, a una cuota accesible.</p>
                <div className="star-specs">
                  {estrellaData.specs.map((s) => (
                    <span className="star-chip" key={s.value}><b>{s.value}</b><small>{s.note}</small></span>
                  ))}
                </div>
                <div className="star-foot">
                  <div className="star-price">
                    <span className="lbl">{estrellaData.priceLabel}</span>
                    <span className="q">{estrellaData.price}<span className="per"> /mes</span></span>
                  </div>
                  <a className="btn btn-green" href={estrellaData.cta.url} target="_blank" rel="noopener">
                    {estrellaData.cta.label}
                    <span className="ic"><Arrow /></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== S6: Catálogo por GPU (dinámico, API) ===== */}
      <LazySection fallbackHeight={600}>
        <NvidiaCatalogSection />
      </LazySection>

      {/* ===== S7: Conoce cada GeForce RTX ===== */}
      <LazySection fallbackHeight={600}>
        <section className="nv-sec" id="que-es">
          <div className="nv-wrap">
            <div className="nv-head nv-center reveal">
              <span className="nv-eyebrow">{queEsData.eyebrow}</span>
              <h2>Conoce cada <span className="nv-grad">GeForce RTX</span></h2>
              <p>{queEsData.description}</p>
            </div>
            {/* Segundo video (tarjetas GPU) — se reproduce UNA sola vez (sin loop) al llegar a la sección */}
            <div className="nv-explainer reveal">
              <video muted playsInline autoPlay preload="auto">
                <source src={queEsData.video} type="video/mp4" />
              </video>
            </div>
            <div className="qcards reveal">
              {queEsData.cards.map((c) => (
                <button className="qcard" type="button" key={c.model} onClick={() => setExpGpu(c)}>
                  <span className="qcard-img"><img src={gpuChipUrl(c.model)} alt={c.name} loading="lazy" /></span>
                  <span className="qcard-body">
                    <span className="qcard-name">{c.name}</span>
                    <span className="qcard-row">
                      <span className="qcard-desc">{c.desc}</span>
                      <span className="qcard-cta">Ver más</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== S8: Beneficios ===== */}
      <LazySection fallbackHeight={500}>
        <section className="section" id="beneficios">
          <div className="wrap">
            <div className="section-head reveal" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', maxWidth: 960 }}>
              <span className="eyebrow">{beneficiosData.eyebrow}</span>
              <h2>Funciones y <span className="grad-text">beneficios adicionales</span></h2>
              <p style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: 820 }}>{beneficiosData.description}</p>
            </div>
            <div className="bn-grid reveal">
              {beneficiosData.cards.map((c) => (
                <div className="bn-card" key={c.title}>
                  <div className="bn-visual"><img src={c.img} alt={c.title} loading="lazy" /></div>
                  <div className="bn-body"><h3>{c.title}</h3><p>{renderBold(c.desc)}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== Popup explicativo de GPU (al presionar una tarjeta) ===== */}
      {expGpu && <ExpPopup card={expGpu} onClose={() => setExpGpu(null)} />}
    </div>

      {/* ===== Footer (genérico) — FUERA de .nvidia-landing: el reset universal
          (.nvidia-landing *{margin:0;padding:0}) borraba el padding/margin de
          Tailwind y rompía el layout del footer. ===== */}
      <div id="footer">
        <Footer data={footerData} landing={landing} logoOverride={quienesSomos.partnerLogo} />
      </div>
    </>
  );
}

// ============================================================
// Popup "Qué es esta tarjeta" (#que-es → expPop)
// ============================================================
function ExpPopup({ card, onClose }: { card: (typeof queEsData.cards)[number]; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  // Anima la salida (fade-out difuminado) antes de desmontar.
  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [requestClose]);

  return (
    <div className={`lp-pop exp open${closing ? ' closing' : ''}`} aria-hidden="false">
      <div className="lp-backdrop" onClick={requestClose} />
      <div className="lp-card" role="dialog" aria-modal="true" aria-label="Qué es esta tarjeta">
        <button className="sl-pop-close" type="button" aria-label="Cerrar" onClick={requestClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="lp-grid">
          <div className="lp-visual">
            <div className="sl-gpubig"><img src={gpuChipUrl(card.model)} alt="Tarjeta gráfica" /></div>
          </div>
          <div className="lp-side">
            <div className="sl-gpuhead exp-head">
              <span className="sl-serie">{card.serie}</span>
              <span className="sl-gpuname">{card.name}</span>
            </div>
            <span className="lp-list-label">Detalle</span>
            <p className="exp-desc">{card.info}</p>
            <div className="exp-specs">
              {card.specs.map((s) => <span className="exp-chip" key={s}>{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// S4: Selector de software por carrera (#selector)
// ============================================================
const SEL_GAP = 14;
const SEL_EASE = 'cubic-bezier(.23,1,.32,1)';
const SEL_SIZE_T = `left .55s ${SEL_EASE},top .55s ${SEL_EASE},width .55s ${SEL_EASE},height .55s ${SEL_EASE}`;
const serieOf = (card: string) => `Serie ${(card.replace(/[^0-9]/g, '')[0] || '')}0`;
const initials = (n: string) => {
  const w = n.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/);
  return (w.length > 1 ? w[0][0] + w[1][0] : n.replace(/[^A-Za-z]/g, '').slice(0, 2)).toUpperCase();
};

function SoftwareSelector({ onOpenGpu }: { onOpenGpu: (model: string) => void }) {
  const [careerId, setCareerId] = useState(CAREERS[0].id);
  const [active, setActive] = useState<number | null>(null);
  const career = useMemo(() => CAREERS.find((c) => c.id === careerId) ?? CAREERS[0], [careerId]);
  const apps = career.apps;
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Medir el mosaico (para el layout absoluto de los tiles)
  useEffect(() => {
    const el = mosaicRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Al cambiar de carrera, colapsar el tile abierto
  useEffect(() => { setActive(null); }, [careerId]);

  const tileStyle = (i: number): CSSProperties => {
    const { w: W, h: H } = dims;
    if (W === 0) return { opacity: 0 };
    const cw = (W - SEL_GAP) / 2;
    const ch = (H - SEL_GAP) / 2;
    const c = i % 2;
    const r = Math.floor(i / 2);
    const gridPos = { left: c * (cw + SEL_GAP), top: r * (ch + SEL_GAP), width: cw, height: ch };
    if (active != null) {
      // Abierto: el activo crece a pantalla completa; los otros desaparecen AL INSTANTE
      // (opacity 0s) para que la grande nunca se abra encima de ellos.
      return i === active
        ? { left: 0, top: 0, width: W, height: H, opacity: 1, zIndex: 5, transition: `${SEL_SIZE_T},box-shadow .3s` }
        : { ...gridPos, opacity: 0, pointerEvents: 'none', transition: 'opacity 0s' };
    }
    // Colapsado / cerrando: todos vuelven a su celda. La opacidad entra con delay .4s,
    // así el que estaba abierto (ya en opacity 1) no parpadea y los otros 3 reaparecen
    // recién cuando la grande terminó de encoger (igual que el prototipo con GSAP).
    return { ...gridPos, opacity: 1, transition: `${SEL_SIZE_T},opacity .3s .4s ${SEL_EASE},box-shadow .3s` };
  };

  const toggle = (i: number) => setActive((cur) => (cur === i ? null : i));

  return (
    <section className="section" id="selector">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>Tarjetas gráficas GeForce RTX <span className="grad-text">según tu carrera</span></h2>
          <p>Cada software rinde mejor con la tarjeta adecuada. Mira qué GeForce RTX es la ideal para ti.</p>
        </div>
        <div className="sl reveal">
          <div className="sl-tabs" role="tablist" aria-label="Elige tu carrera">
            {CAREERS.map((c) => (
              <button key={c.id} type="button" className={`sl-tab${c.id === careerId ? ' on' : ''}`} onClick={() => changeTab(() => setCareerId(c.id))}>
                {c.label}
                {c.id === careerId && <span className="sl-underline" style={{ viewTransitionName: 'sl-ul-selector' } as CSSProperties} />}
              </button>
            ))}
          </div>
          <div className="sl-mosaic" ref={mosaicRef} role="tablist" aria-label="Elige tu software">
            {apps.map((s, i) => {
              const isOn = i === active;
              return (
                <div
                  key={s.name}
                  className={`sl-tile${isOn ? ' expanded' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOn}
                  style={tileStyle(i)}
                  onClick={(e) => { if ((e.target as HTMLElement).closest('.sl-tile-x')) return; toggle(i); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); }
                    else if (e.key === 'Escape') setActive(null);
                  }}
                >
                  {s.img
                    ? <span className="sl-tile-bg" style={{ backgroundImage: `url('${s.img}')`, backgroundPosition: s.imgPos || undefined }} />
                    : <span className="sl-tile-bg ph"><span className="ini">{initials(s.name)}</span></span>}
                  <span className="sl-tile-scrim" />
                  <span className="sl-tile-cap"><b>{s.name}</b><span className="sl-tile-sub">{s.gain}</span></span>
                  <div className="sl-tile-detail">
                    <span className="sl-pop-eyebrow">{s.name} · {career.label}</span>
                    <h3 className="sl-gain">{s.gain}</h3>
                    <p className="sl-why">{renderRtx(s.why, onOpenGpu)}</p>
                    <p className="sl-card-name">{serieOf(s.card)} · recomendada</p>
                    {s.similar && s.similar.length > 0 && (
                      <div className="sl-similar">
                        <span className="sl-similar-label">Misma función</span>
                        {s.similar.map((p) => <span className="sl-similar-chip" key={p}>{p}</span>)}
                      </div>
                    )}
                  </div>
                  <button className="sl-tile-x" type="button" aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); setActive(null); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// S5: Rendimiento — barras Con RTX vs Sin GPU (#performance)
// ============================================================
function PerformanceChart() {
  const [careerId, setCareerId] = useState(CAREERS[0].id);
  const [grow, setGrow] = useState(false);
  const seenRef = useRef(false);
  const rowsRef = useRef<HTMLDivElement>(null);

  const career = useMemo(() => CAREERS.find((c) => c.id === careerId) ?? CAREERS[0], [careerId]);
  const items = career.apps;
  const max = useMemo(() => Math.max(...items.map((a) => a.x)), [items]);

  // Primer fill: las barras crecen de 0 a su valor al entrar en pantalla
  useEffect(() => {
    const el = rowsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { seenRef.current = true; setGrow(true); io.disconnect(); } }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Re-fill al cambiar de carrera: resetea a 0 (sin transición) y vuelve a crecer
  useEffect(() => {
    if (!seenRef.current) return;
    setGrow(false);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setGrow(true)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [careerId]);

  return (
    <section className="section" id="performance">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Rendimiento</span>
          <h2>La diferencia que hace una <span className="grad-text">GeForce RTX</span></h2>
          <p>Cada carrera usa la tarjeta gráfica de forma distinta. Elige la tuya y mira la diferencia de rendimiento frente a una laptop <strong>sin tarjeta gráfica dedicada</strong>.</p>
        </div>
        <div className="sl-tabs" role="tablist" aria-label="Rendimiento por carrera">
          {CAREERS.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={c.id === careerId}
              className={`sl-tab${c.id === careerId ? ' on' : ''}`} onClick={() => changeTab(() => setCareerId(c.id))}>
              {c.label}
              {c.id === careerId && <span className="sl-underline" style={{ viewTransitionName: 'sl-ul-perf' } as CSSProperties} />}
            </button>
          ))}
        </div>
        <div className="vchart reveal">
          <div className="vlegend">
            <span><i className="vdot on" />Con GeForce RTX</span>
            <span><i className="vdot off" />{career.baseline}</span>
          </div>
          <div className="vrows" ref={rowsRef}>
            {items.map((a, i) => {
              const offH = Math.round((1 / max) * 100);
              const onH = Math.round((a.x / max) * 100);
              const delay = `${0.05 + i * 0.05}s`;
              return (
                <div className="vgroup" key={i}>
                  <div className="vbar-track">
                    <div className="vbar off" style={{ height: grow ? `${offH}%` : 0, transition: grow ? undefined : 'none', transitionDelay: grow ? delay : '0s' }}><span className="vval">1×</span></div>
                    <div className="vbar on" style={{ height: grow ? `${onH}%` : 0, transition: grow ? undefined : 'none', transitionDelay: grow ? delay : '0s' }}><span className="vval">{a.x}×</span></div>
                  </div>
                  <span className="vname">{a.name}<small>{a.sub} · <span className="vcard">{a.card}</span></small></span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="perf-note">* Aceleración aproximada "hasta N×" de cada software con la GeForce RTX indicada frente a una laptop sin tarjeta gráfica dedicada (en Arquitectura, frente a otras tarjetas gráficas); varía según el equipo, el software y el proyecto. Fuentes: Puget Systems, Blender Open Data, NVIDIA, Adobe, MathWorks, Chaos, Epic.</p>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Íconos de los 3 puntos de "Quiénes somos" (cuotas, sin historial, tarjeta RTX)
const BC_ICONS = [
  <svg key="cuotas" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /></svg>,
  <svg key="historial" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 3v5c0 4.8-3.4 8-8 10-4.6-2-8-5.2-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  <svg key="tarjeta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></svg>,
];

// Centros de los ojos de Baldi como fracción de la imagen (ajustar si hace falta).

// Envuelve las menciones "GeForce RTX XXXX" en un span clickeable (abre el popup
// de esa tarjeta) con subrayado animado al hover.
function renderRtx(text: string, onOpenGpu?: (model: string) => void): ReactNode[] {
  return text.split(/(GeForce RTX \d{4})/g).filter(Boolean).map((part, i) => {
    if (!/^GeForce RTX \d{4}$/.test(part)) return <span key={i}>{part}</span>;
    const model = part.match(/\d{4}/)?.[0];
    return (
      <span
        key={i}
        className="rtx-mention"
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); if (model && onOpenGpu) onOpenGpu(model); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (model && onOpenGpu) onOpenGpu(model); } }}
      >
        {part}
      </span>
    );
  });
}

// Renderiza una descripción con segmentos en **negrita** (mini-markdown)
function renderBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}


// ============================================================
// CSS (scoped a .nvidia-landing) — v1, refinar fidelidad luego
// ============================================================
const CSS = `
/* ===== TOKENS + BASE (portado del prototipo) ===== */
.nvidia-landing{--indigo:#3C3DC5;--indigo-2:#5a5bf0;--turquoise:#00D9CB;--green:#76B900;--green-glow:#8fe000;
  --bg:#06060A;--bg-2:#0b0b12;--panel:#0f0f18;--panel-2:#14141f;--line:rgba(255,255,255,.08);--line-2:rgba(255,255,255,.14);
  --white:#fff;--muted:#9aa0ae;--muted-2:#6b7080;--maxw:1240px;--ease-out:cubic-bezier(.23,1,.32,1);
  /* aliases usados por las secciones aún en v1 */
  --surface:var(--panel);--border:var(--line);--text:var(--white);
  background:var(--bg);color:var(--white);font-family:"Baloo 2",system-ui,sans-serif;font-weight:400;line-height:1.55;min-height:100vh;-webkit-font-smoothing:antialiased;}
.nvidia-landing *{margin:0;padding:0;box-sizing:border-box;}
.nvidia-landing img{display:block;max-width:100%;}
.nvidia-landing a{color:inherit;text-decoration:none;}
.nvidia-landing section{position:relative;z-index:2;}
.nvidia-landing :is(h1,h2,h3,h4){font-family:"Baloo 2",sans-serif;line-height:1.04;letter-spacing:-.02em;font-weight:600;}
.nvidia-landing ::selection{background:var(--green);color:#0a0a0a;}
.nvidia-landing .wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px;}
.nvidia-landing .eyebrow{font-family:"Baloo 2";font-size:.78rem;letter-spacing:.32em;text-transform:uppercase;color:var(--turquoise);font-weight:600;display:inline-flex;align-items:center;gap:10px;}
.nvidia-landing .grad-text{background:linear-gradient(95deg,var(--turquoise) 0%,var(--green-glow) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.nvidia-landing .green-text{color:var(--green-glow);font-weight:600;}
/* buttons (pill + icono en círculo) */
.nvidia-landing .btn{display:inline-flex;align-items:center;gap:10px;font-family:"Baloo 2";font-weight:600;font-size:.95rem;padding:15px 26px;border-radius:999px;cursor:pointer;border:1px solid transparent;transition:transform .18s var(--ease-out),box-shadow .25s var(--ease-out),background .2s var(--ease-out);white-space:nowrap;}
.nvidia-landing .btn-green{background:var(--green);color:#fff;box-shadow:0 0 0 0 rgba(118,185,0,.5);}
.nvidia-landing .btn-green:hover{transform:translateY(-2px);box-shadow:0 14px 40px -8px rgba(118,185,0,.6);}
.nvidia-landing .btn:active{transform:scale(.97);}
.nvidia-landing .btn .ic{width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-left:6px;margin-right:-14px;transition:transform .35s var(--ease-out),background .3s var(--ease-out);}
.nvidia-landing .btn .ic svg{width:15px;height:15px;}
.nvidia-landing .btn-green .ic{background:rgba(0,0,0,.18);}
.nvidia-landing .btn:hover .ic{transform:translate(3px,-1px);}
/* ===== NAV ===== */
.nvidia-landing .nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:center;transition:background .4s,border-color .4s,padding .4s;border-bottom:1px solid transparent;padding:18px 0;}
.nvidia-landing .nav::before{content:"";position:absolute;left:0;right:0;top:0;height:150px;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.22) 50%,transparent 100%);}
.nvidia-landing .nav.scrolled{background:rgba(7,7,12,.72);backdrop-filter:blur(18px) saturate(160%);border-bottom-color:var(--line);padding:12px 0;}
.nvidia-landing .nav-inner{position:relative;width:100%;max-width:var(--maxw);padding:0 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;}
.nvidia-landing .lockup-logo{height:32px;width:auto;object-fit:contain;display:block;}
.nvidia-landing .nav-links{display:flex;gap:18px;align-items:center;position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;}
.nvidia-landing .nav-links button{background:none;border:0;font-family:"Baloo 2";font-size:.9rem;color:var(--muted);font-weight:500;transition:color .25s;cursor:pointer;white-space:nowrap;}
.nvidia-landing .nav-links button:hover{color:#fff;}
@media(max-width:1100px){.nvidia-landing .nav-links{display:none;}}
/* ===== HERO (#top .mac) ===== */
.nvidia-landing .mac{position:relative;z-index:2;background:linear-gradient(100deg,rgba(6,6,10,.92) 0%,rgba(6,6,10,.6) 48%,rgba(6,6,10,.2) 100%),url('${NVIDIA_ASSETS}/backgrounds/fondo-header.png') right center/cover no-repeat,var(--bg);}
.nvidia-landing .mac-sticky{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:94px 20px 46px;overflow:hidden;}
.nvidia-landing .hero-grid{display:grid;grid-template-columns:.92fr 1.28fr;gap:clamp(28px,4vw,56px);align-items:center;width:100%;}
.nvidia-landing .hero-copy{text-align:left;max-width:960px;}
.nvidia-landing .hero-copy h1{font-size:clamp(2rem,4.6vw,3.5rem);margin-top:14px;line-height:1.05;letter-spacing:-.01em;font-weight:700;}
.nvidia-landing .hero-copy p{color:var(--muted);font-size:clamp(1rem,1.5vw,1.18rem);margin-top:18px;max-width:50ch;font-weight:400;text-align:justify;}
.nvidia-landing .hero-copy .mac-cta{justify-content:flex-start;align-items:flex-start;margin-top:26px;display:flex;flex-direction:column;gap:12px;}
.nvidia-landing .btn-outline{background:transparent;color:var(--green-glow);border:1px solid var(--green);}
.nvidia-landing .btn-outline:hover{color:var(--green-glow);border-color:var(--green-glow);background:rgba(118,185,0,.12);transform:translateY(-2px);box-shadow:0 14px 40px -8px rgba(118,185,0,.55);}
.nvidia-landing .hero-media{position:relative;}
.nvidia-landing .hero-media .pitch-video{position:relative;line-height:0;width:100%;margin:0;overflow:hidden;-webkit-mask:linear-gradient(to right,transparent 0,#000 14%,#000 88%,transparent 100%),linear-gradient(to bottom,transparent 0,#000 12%,#000 91%,transparent 100%);-webkit-mask-composite:source-in;mask-composite:intersect;}
.nvidia-landing .hero-media .pitch-video video{width:108.7%;height:auto;display:block;}
.nvidia-landing .hero-media-fallback{aspect-ratio:16/10;background:radial-gradient(circle at 60% 40%,rgba(0,217,203,.25),transparent 70%),#111;border-radius:14px;}
@media(max-width:860px){.nvidia-landing .hero-grid{grid-template-columns:1fr;gap:28px;text-align:center;}.nvidia-landing .hero-copy{text-align:center;}.nvidia-landing .hero-copy .mac-cta{justify-content:center;align-items:center;}}

/* ===== Section shell (portado) ===== */
.nvidia-landing .section{padding:clamp(56px,7vw,80px) 0;}
.nvidia-landing .section-head{max-width:760px;margin-bottom:clamp(32px,4vw,44px);}
.nvidia-landing .section-head h2{font-size:clamp(2rem,4.4vw,3.4rem);margin:18px 0 0;}
.nvidia-landing .section-head p{color:var(--muted);font-size:1.12rem;margin-top:20px;font-weight:400;max-width:620px;}
/* ===== Reveal al hacer scroll (replica ScrollTrigger) ===== */
.nvidia-landing .reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease-out),transform .9s var(--ease-out);}
.nvidia-landing .reveal.in{opacity:1;transform:none;}
@media(prefers-reduced-motion:reduce){.nvidia-landing .reveal{opacity:1;transform:none;transition:none;}}
/* ===== Quiénes somos (#baldecash) ===== */
.nvidia-landing .bc-grid{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:clamp(24px,3.5vw,44px);align-items:center;}
.nvidia-landing .bc-copy{text-align:left;}
.nvidia-landing .bc-copy .eyebrow{justify-content:flex-start;}
.nvidia-landing .bc-copy h2{font-size:clamp(2rem,4vw,3rem);margin-top:14px;line-height:1.04;}
.nvidia-landing .bc-copy p{color:var(--muted);font-weight:400;font-size:clamp(1rem,1.4vw,1.12rem);line-height:1.6;margin-top:16px;text-align:justify;}
.nvidia-landing .bc-points{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:18px 16px;margin-top:30px;}
.nvidia-landing .bc-pt{display:flex;align-items:flex-start;gap:11px;}
.nvidia-landing .bc-ic{flex:none;width:42px;height:42px;border-radius:50%;background:rgba(118,185,0,.14);color:var(--green-glow);display:flex;align-items:center;justify-content:center;}
.nvidia-landing .bc-ic svg{width:21px;height:21px;}
.nvidia-landing .bc-txt b{display:block;font-family:"Baloo 2";font-weight:700;font-size:.96rem;color:#fff;line-height:1.2;}
.nvidia-landing .bc-txt span{display:block;font-size:.77rem;color:var(--muted);margin-top:3px;}
.nvidia-landing .bc-partner-label{display:block;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);font-weight:600;margin-top:30px;margin-bottom:9px;}
.nvidia-landing .bc-partner{display:block;height:34px;width:auto;max-width:100%;object-fit:contain;}
.nvidia-landing .bc-media{display:flex;align-items:center;justify-content:flex-end;}
.nvidia-landing .bc-media img{width:100%;max-width:380px;object-fit:contain;filter:drop-shadow(0 30px 50px rgba(0,0,0,.5));}
@media(max-width:860px){.nvidia-landing .bc-grid{grid-template-columns:1fr;gap:28px;}.nvidia-landing .bc-media{order:-1;justify-content:center;}.nvidia-landing .bc-media img{max-width:260px;}}

/* ===== Secciones aún en v1 (se portan en los siguientes pasos) ===== */
.nvidia-landing .nv-wrap{max-width:1180px;margin:0 auto;padding:0 24px;}
.nvidia-landing .nv-sec{padding:88px 0;}
.nvidia-landing .nv-sec h2,.nvidia-landing .nv-head h2{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;line-height:1.1;margin:0 0 14px;}
.nvidia-landing .nv-sec h3{font-size:1.25rem;margin:0 0 6px;}
.nvidia-landing .nv-sec p{color:var(--muted);margin:0 0 16px;}
.nvidia-landing .nv-grad{background:linear-gradient(95deg,var(--turquoise),var(--green-glow));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}
.nvidia-landing .nv-eyebrow{display:inline-block;color:var(--turquoise);font-weight:600;letter-spacing:.32em;text-transform:uppercase;font-size:.78rem;margin-bottom:10px;}
.nvidia-landing .nv-head{max-width:760px;margin-bottom:40px;}
.nvidia-landing .nv-center{margin-left:auto;margin-right:auto;text-align:center;}
/* #que-es: título y subtítulo ligeramente más grandes */
.nvidia-landing #que-es .nv-head h2{font-size:clamp(2rem,4.6vw,3.3rem);}
.nvidia-landing #que-es .nv-head p{font-size:1.18rem;}
.nvidia-landing .nv-btn{display:inline-flex;align-items:center;gap:8px;background:var(--green);color:#0a0a0a;font-weight:600;padding:0 22px;height:46px;border:0;border-radius:999px;cursor:pointer;text-decoration:none;transition:background .2s;}
.nvidia-landing .nv-btn:hover{background:var(--green-glow);}
/* quiénes somos */
.nvidia-landing .nv-bc-grid{display:grid;grid-template-columns:1fr;gap:32px;align-items:center;}
@media(min-width:900px){.nvidia-landing .nv-bc-grid{grid-template-columns:1fr 1fr;}}
.nvidia-landing .nv-bc-points{display:flex;flex-direction:column;gap:12px;margin:18px 0;}
.nvidia-landing .nv-bc-pt{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px;}
.nvidia-landing .nv-bc-pt b{color:var(--text);}.nvidia-landing .nv-bc-pt span{color:var(--muted);font-size:.9rem;}
.nvidia-landing .nv-partner-label{display:block;color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;margin-top:8px;}
.nvidia-landing .nv-partner{height:34px;object-fit:contain;margin-top:8px;}
.nvidia-landing .nv-bc-media img{width:100%;border-radius:18px;display:block;}
/* qcards */
.nvidia-landing .nv-explainer{margin:42px auto 0;width:100%;aspect-ratio:16/7;line-height:0;-webkit-mask:linear-gradient(to right,transparent 0,#000 8%,#000 92%,transparent 100%),linear-gradient(to bottom,transparent 0,#000 9%,#000 91%,transparent 100%);-webkit-mask-composite:source-in;mask-composite:intersect;}
.nvidia-landing .nv-explainer video{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;}
.nvidia-landing .qcards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:18px;}
.nvidia-landing .qcard{appearance:none;border:0;cursor:pointer;text-align:left;width:100%;display:flex;flex-direction:column;background:rgba(255,255,255,.025);border-radius:14px;overflow:hidden;transition:transform .3s var(--ease-out),background .3s;}
.nvidia-landing .qcard:hover{transform:translateY(-4px);background:rgba(255,255,255,.05);}
.nvidia-landing .qcard:focus-visible{outline:2px solid var(--turquoise);outline-offset:2px;}
.nvidia-landing .qcard-img{position:relative;display:flex;align-items:center;justify-content:center;height:150px;padding:18px;}
.nvidia-landing .qcard-img::before{content:"";position:absolute;bottom:9%;left:50%;transform:translateX(-50%);width:58%;height:26%;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.16),transparent 70%);filter:blur(12px);}
.nvidia-landing .qcard-img img{position:relative;max-width:78%;max-height:115px;object-fit:contain;filter:drop-shadow(0 16px 26px rgba(0,0,0,.6));}
.nvidia-landing .qcard-body{display:flex;flex-direction:column;gap:5px;padding:16px 18px 18px;border-top:1px solid var(--line);}
.nvidia-landing .qcard-name{font-family:"Baloo 2";font-weight:700;font-size:1.12rem;color:#fff;line-height:1.1;}
.nvidia-landing .qcard-desc{font-size:.76rem;color:var(--muted-2);}
.nvidia-landing .qcard-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.nvidia-landing .qcard-cta{flex:none;color:var(--muted-2);font-family:"Baloo 2";font-weight:600;font-size:.8rem;white-space:nowrap;transition:color .25s;}
.nvidia-landing .qcard:hover .qcard-cta,.nvidia-landing .qcard:focus-visible .qcard-cta{color:var(--green-glow);}
@media(max-width:760px){.nvidia-landing .qcards{grid-template-columns:repeat(2,1fr);}}
@media(max-width:460px){.nvidia-landing .qcards{grid-template-columns:1fr;}}
/* ===== Popup explicativo de GPU (#que-es) ===== */
.nvidia-landing .lp-pop{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:24px;animation:nvPopFade .25s ease both;}
.nvidia-landing .lp-backdrop{position:absolute;inset:0;background:rgba(4,4,8,.78);backdrop-filter:blur(12px);}
.nvidia-landing .lp-card{position:relative;width:min(1080px,96vw);max-height:92vh;overflow:auto;border-radius:18px;background:linear-gradient(160deg,#0e0e10,#060607);border:1px solid var(--line);box-shadow:0 40px 120px -30px rgba(0,0,0,.85);padding:clamp(26px,4vw,48px);scrollbar-width:thin;scrollbar-color:#2a2a30 transparent;animation:nvPopCard .4s var(--ease-out) both;}
@keyframes nvPopFade{from{opacity:0;}to{opacity:1;}}
@keyframes nvPopCard{from{opacity:0;transform:translateY(22px) scale(.94);}to{opacity:1;transform:none;}}
.nvidia-landing .lp-pop.closing{animation:nvPopFadeOut .26s ease both;}
.nvidia-landing .lp-pop.closing .lp-card{animation:nvPopCardOut .26s var(--ease-out) both;}
@keyframes nvPopFadeOut{from{opacity:1;}to{opacity:0;}}
@keyframes nvPopCardOut{from{opacity:1;transform:none;}to{opacity:0;transform:translateY(14px) scale(.96);}}
@keyframes nvPopImg{from{opacity:0;transform:scale(.82);}to{opacity:1;transform:scale(1);}}
.nvidia-landing .lp-card::-webkit-scrollbar{width:11px;}
.nvidia-landing .lp-card::-webkit-scrollbar-thumb{background:#2a2a30;border-radius:8px;border:3px solid transparent;background-clip:padding-box;}
.nvidia-landing .sl-pop-close{position:absolute;top:16px;right:16px;z-index:3;width:40px;height:40px;border:0;background:none;color:var(--muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color .2s,transform .2s var(--ease-out);}
.nvidia-landing .sl-pop-close:hover{color:#fff;transform:scale(1.12);}
.nvidia-landing .sl-pop-close svg{width:22px;height:22px;}
.nvidia-landing .lp-grid{display:grid;grid-template-columns:.72fr 1.28fr;gap:clamp(24px,4vw,48px);align-items:center;}
.nvidia-landing .lp-visual{text-align:center;}
.nvidia-landing .sl-gpubig{position:relative;width:100%;display:flex;align-items:center;justify-content:center;padding:8px 0;}
.nvidia-landing .sl-gpubig::before{content:"";position:absolute;width:82%;height:82%;border-radius:50%;background:radial-gradient(circle,rgba(118,185,0,.34),transparent 68%);filter:blur(18px);}
.nvidia-landing .sl-gpubig img{position:relative;width:92%;max-width:430px;object-fit:contain;filter:drop-shadow(0 26px 48px rgba(0,0,0,.6));animation:nvPopImg .55s var(--ease-out) .05s both;}
.nvidia-landing .lp-side{display:flex;flex-direction:column;justify-content:center;}
.nvidia-landing .sl-serie{display:block;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);font-weight:600;}
.nvidia-landing .sl-gpuname{display:block;font-family:"Baloo 2";font-weight:700;font-size:1.4rem;letter-spacing:-.01em;}
.nvidia-landing .exp-head{margin-bottom:18px;}
.nvidia-landing .exp-head .sl-gpuname{font-size:1.55rem;margin-top:3px;}
.nvidia-landing .lp-list-label{display:block;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);font-weight:600;margin-bottom:14px;}
.nvidia-landing .exp-desc{color:#e7e9ef;font-weight:400;font-size:1.02rem;line-height:1.65;margin:0;text-align:justify;}
.nvidia-landing .exp-specs{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px;}
.nvidia-landing .exp-chip{font-family:"Baloo 2";font-size:.74rem;font-weight:600;color:#cfd3dd;background:rgba(255,255,255,.05);border-radius:8px;padding:7px 12px;}
@media(max-width:760px){.nvidia-landing .lp-grid{grid-template-columns:1fr;gap:20px;}.nvidia-landing .lp-visual{order:-1;}}
/* ===== Selector de software por carrera (#selector) ===== */
.nvidia-landing #selector .section-head{margin-left:auto;margin-right:auto;text-align:center;}
.nvidia-landing #selector .section-head p{margin-left:auto;margin-right:auto;}
.nvidia-landing .sl{margin-top:42px;}
.nvidia-landing .sl-tabs{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:24px;margin:0 auto 22px;border-bottom:1px solid var(--line);}
/* Subrayado: hijo del tab activo (siempre en su fila, debajo del nombre).
   Se desliza con View Transitions; donde no haya soporte, cambia al instante. */
.nvidia-landing .sl-underline{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--green);border-radius:2px;}
::view-transition-group(sl-ul-selector),::view-transition-group(sl-ul-perf),::view-transition-group(sl-ul-catalog){animation-duration:.38s;animation-timing-function:cubic-bezier(.23,1,.32,1);}
.nvidia-landing .sl-tab{appearance:none;border:0;background:none;color:var(--muted);font-family:"Baloo 2";font-weight:600;font-size:.92rem;padding:0 0 12px;cursor:pointer;position:relative;transition:color .2s;white-space:nowrap;}
.nvidia-landing .sl-tab:hover{color:#fff;}
.nvidia-landing .sl-tab.on{color:#fff;}
.nvidia-landing .sl-tab:focus-visible{outline:2px solid var(--turquoise);outline-offset:3px;border-radius:4px;}
.nvidia-landing .sl-mosaic{position:relative;height:clamp(440px,60vh,560px);margin:0 auto 34px;}
@media(max-width:560px){.nvidia-landing .sl-mosaic{height:clamp(540px,92vh,680px);}}
.nvidia-landing .sl-tile{position:absolute;border-radius:14px;overflow:hidden;cursor:pointer;border:0;padding:0;background:#10101a;color:#fff;font-family:"Baloo 2";text-align:left;outline:none;box-shadow:0 10px 30px -16px rgba(0,0,0,.8);transition:left .55s var(--ease-out),top .55s var(--ease-out),width .55s var(--ease-out),height .55s var(--ease-out),box-shadow .3s;}
.nvidia-landing .sl-tile:hover{box-shadow:0 16px 40px -18px rgba(0,0,0,.9);}
.nvidia-landing .sl-tile-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform .5s var(--ease-out),filter .4s;}
.nvidia-landing .sl-tile-bg.ph{background:linear-gradient(150deg,#16240a,#0b0b13);display:flex;align-items:center;justify-content:center;}
.nvidia-landing .sl-tile-bg.ph .ini{font-family:"Baloo 2";font-size:2.4rem;font-weight:800;color:rgba(255,255,255,.85);letter-spacing:.04em;}
.nvidia-landing .sl-tile:hover .sl-tile-bg{transform:scale(1.06);}
.nvidia-landing .sl-tile-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,12,.9) 0%,rgba(8,8,12,.25) 46%,transparent 70%);}
.nvidia-landing .sl-tile-cap{position:absolute;left:15px;right:15px;bottom:13px;z-index:2;display:flex;flex-direction:column;gap:2px;transition:opacity .25s;}
.nvidia-landing .sl-tile-cap b{font-size:1.06rem;font-weight:700;line-height:1.1;}
.nvidia-landing .sl-tile-sub{font-size:.74rem;color:rgba(255,255,255,.8);font-weight:500;line-height:1.3;opacity:0;max-height:0;transform:translateY(6px);overflow:hidden;transition:opacity .3s var(--ease-out),max-height .35s var(--ease-out),transform .3s var(--ease-out);}
.nvidia-landing .sl-tile:hover .sl-tile-sub,.nvidia-landing .sl-tile:focus-visible .sl-tile-sub{opacity:1;max-height:4.2em;transform:none;}
.nvidia-landing .sl-tile.expanded{z-index:5;cursor:default;}
.nvidia-landing .sl-tile.expanded:hover .sl-tile-bg{transform:none;}
.nvidia-landing .sl-tile.expanded .sl-tile-cap{opacity:0;pointer-events:none;}
.nvidia-landing .sl-tile.expanded .sl-tile-scrim{background:linear-gradient(90deg,rgba(6,6,9,.94) 0%,rgba(6,6,9,.78) 36%,rgba(6,6,9,.28) 66%,transparent 100%);}
.nvidia-landing .sl-tile-detail{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;justify-content:center;padding:clamp(26px,4.5vw,56px);max-width:640px;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;}
.nvidia-landing .sl-tile.expanded .sl-tile-detail{opacity:1;visibility:visible;transition-delay:.18s;}
.nvidia-landing .sl-pop-eyebrow{font-family:"Baloo 2";font-size:.76rem;letter-spacing:.2em;text-transform:uppercase;color:var(--turquoise);font-weight:600;margin-bottom:8px;}
.nvidia-landing .sl-gain{font-family:"Baloo 2";font-weight:700;font-size:clamp(1.6rem,3.2vw,2.5rem);line-height:1.08;letter-spacing:-.02em;margin:0 0 12px;}
.nvidia-landing .sl-why{color:#e7e9ef;max-width:560px;font-size:clamp(.95rem,1.4vw,1.06rem);line-height:1.6;margin:0;}
.nvidia-landing .rtx-mention{position:relative;display:inline-block;font-weight:600;color:#fff;white-space:nowrap;cursor:pointer;}
.nvidia-landing .rtx-mention::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--green);border-radius:2px;transform:scaleX(0);transform-origin:left;transition:transform .28s var(--ease-out);}
.nvidia-landing .rtx-mention:hover::after{transform:scaleX(1);}
.nvidia-landing .sl-similar{margin-top:18px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;}
.nvidia-landing .sl-similar-label{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-2);font-weight:600;margin-right:2px;}
.nvidia-landing .sl-similar-chip{font-family:"Baloo 2";font-size:.78rem;font-weight:500;color:#cfd3dc;background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:999px;padding:5px 12px;}
.nvidia-landing .sl-card-name{font-family:"Baloo 2";font-weight:600;font-size:1rem;color:var(--green-glow);display:inline-flex;align-items:center;gap:9px;margin-top:18px;}
.nvidia-landing .sl-card-name::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);}
.nvidia-landing .sl-tile-x{position:absolute;top:14px;right:14px;z-index:4;width:38px;height:38px;border:0;background:none;color:rgba(255,255,255,.85);cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s,transform .2s;}
.nvidia-landing .sl-tile.expanded .sl-tile-x{opacity:1;visibility:visible;transition-delay:.18s;}
.nvidia-landing .sl-tile-x:hover{transform:scale(1.12);color:#fff;}
.nvidia-landing .sl-tile-x svg{width:20px;height:20px;}
/* ===== Rendimiento (#performance) — gráfico de barras ===== */
.nvidia-landing #performance .section-head{max-width:960px;margin-left:auto;margin-right:auto;text-align:center;}
.nvidia-landing #performance .section-head .eyebrow{justify-content:center;}
.nvidia-landing #performance .section-head p{max-width:820px;margin-left:auto;margin-right:auto;}
.nvidia-landing #performance .sl-tabs{margin:34px auto 22px;width:max-content;max-width:100%;}
.nvidia-landing .vchart{max-width:880px;margin:0 auto;min-height:330px;}
.nvidia-landing .vlegend{display:flex;gap:26px;justify-content:center;margin-bottom:30px;font-size:.84rem;color:var(--muted);}
.nvidia-landing .vlegend i.vdot{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:8px;vertical-align:-1px;}
.nvidia-landing .vlegend i.on{background:linear-gradient(180deg,var(--green-glow),var(--green));}
.nvidia-landing .vlegend i.off{background:rgba(255,255,255,.18);}
.nvidia-landing .vrows{display:flex;justify-content:space-around;align-items:flex-start;gap:18px;}
.nvidia-landing .vgroup{display:flex;flex-direction:column;align-items:center;gap:16px;flex:1;min-width:0;}
.nvidia-landing .vbar-track{display:flex;align-items:flex-end;justify-content:center;gap:12px;height:240px;}
.nvidia-landing .vbar{width:48px;max-width:13vw;height:0;border-radius:8px 8px 0 0;position:relative;transition:height .9s var(--ease-out);}
.nvidia-landing .vbar.on{background:linear-gradient(180deg,var(--green-glow),var(--green));}
.nvidia-landing .vbar.off{background:rgba(255,255,255,.12);}
.nvidia-landing .vbar .vval{position:absolute;top:-24px;left:0;right:0;text-align:center;font-family:"Baloo 2";font-weight:600;font-size:.92rem;color:#fff;}
.nvidia-landing .vname{font-family:"Baloo 2";font-size:.92rem;color:#cfd3dd;font-weight:600;text-align:center;display:flex;flex-direction:column;line-height:1.2;}
.nvidia-landing .vname small{font-size:.72rem;color:var(--muted-2);font-weight:400;margin-top:2px;}
.nvidia-landing .vname .vcard{color:var(--green-glow);font-weight:600;}
.nvidia-landing .perf-note{color:var(--muted-2);font-size:.76rem;margin-top:26px;font-style:italic;}
@media(max-width:760px){.nvidia-landing .vbar-track{height:180px;}.nvidia-landing .vbar{width:30px;}.nvidia-landing .vname{font-size:.8rem;}.nvidia-landing .vchart{min-height:300px;}}
/* tabs */
.nvidia-landing .nv-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:26px;}
.nvidia-landing .nv-tabs button{background:var(--surface);border:1px solid var(--border);color:var(--muted);font-family:inherit;font-weight:600;padding:8px 14px;border-radius:999px;cursor:pointer;transition:all .15s;}
.nvidia-landing .nv-tabs button.active{background:var(--green);border-color:var(--green);color:#fff;}
/* mosaic */
.nvidia-landing .nv-mosaic{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}
.nvidia-landing .nv-app{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;}
.nvidia-landing .nv-app-img{aspect-ratio:16/10;background:#0d0d0d;}
.nvidia-landing .nv-app-img img{width:100%;height:100%;object-fit:cover;display:block;}
.nvidia-landing .nv-app-body{padding:12px 14px;}
.nvidia-landing .nv-app-name{display:block;font-weight:700;}
.nvidia-landing .nv-app-card{display:inline-block;color:var(--green);font-weight:700;font-size:.8rem;margin:2px 0;}
.nvidia-landing .nv-app-gain{display:block;color:var(--muted);font-size:.85rem;}
/* perf */
.nvidia-landing .nv-vchart{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;}
.nvidia-landing .nv-vlegend{display:flex;gap:20px;margin-bottom:16px;color:var(--muted);font-size:.85rem;}
.nvidia-landing .nv-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;}
.nvidia-landing .nv-dot.on{background:var(--green);}.nvidia-landing .nv-dot.off{background:#555;}
.nvidia-landing .nv-vrow{display:grid;grid-template-columns:160px 1fr;gap:14px;align-items:center;padding:10px 0;border-top:1px solid var(--border);}
.nvidia-landing .nv-vrow:first-child{border-top:0;}
.nvidia-landing .nv-vrow-name{font-weight:700;}.nvidia-landing .nv-vrow-name small{display:block;color:var(--green);font-weight:600;}
.nvidia-landing .nv-vbars{display:flex;flex-direction:column;gap:6px;}
.nvidia-landing .nv-vbar{height:26px;border-radius:6px;display:flex;align-items:center;padding:0 10px;font-size:.78rem;color:#fff;white-space:nowrap;overflow:hidden;}
.nvidia-landing .nv-vbar.off{background:#333;color:var(--muted);}
.nvidia-landing .nv-vbar.on{background:linear-gradient(90deg,#4f7a00,var(--green));}
.nvidia-landing .nv-perf-note{font-size:.72rem;color:#666;margin-top:14px;}
/* ===== Equipo estrella (#estrella) — portado ===== */
.nvidia-landing .star-sec{position:relative;overflow:hidden;background:linear-gradient(100deg,rgba(6,6,10,.86) 0%,rgba(6,6,10,.48) 45%,rgba(6,6,10,.1) 100%),url('${NVIDIA_ASSETS}/backgrounds/fondo-estrellas.png') center/cover no-repeat,var(--bg);}
.nvidia-landing .star-sec::before{content:"";display:block;position:absolute;left:0;right:0;top:0;height:160px;z-index:0;pointer-events:none;background:linear-gradient(to bottom,var(--bg),transparent);}
.nvidia-landing .star-sec::after{content:"";position:absolute;left:0;right:0;bottom:0;height:160px;z-index:0;pointer-events:none;background:linear-gradient(to top,var(--bg),transparent);}
.nvidia-landing .star{position:relative;z-index:1;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,5vw,72px);align-items:center;min-height:600px;}
.nvidia-landing .star-copy{display:flex;flex-direction:column;}
.nvidia-landing .star-copy h2{font-size:clamp(2rem,4.4vw,3.3rem);margin-top:14px;line-height:1.02;}
.nvidia-landing .star-lead{color:var(--muted);font-weight:400;font-size:clamp(1rem,1.4vw,1.14rem);line-height:1.6;margin:18px 0 24px;max-width:48ch;}
.nvidia-landing .star-specs{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px;}
.nvidia-landing .star-chip{display:flex;flex-direction:column;gap:1px;padding:11px 16px;border-radius:12px;background:rgba(255,255,255,.04);}
.nvidia-landing .star-chip b{font-family:"Baloo 2";font-weight:700;font-size:1.05rem;line-height:1.1;}
.nvidia-landing .star-chip small{font-size:.7rem;color:var(--muted-2);font-weight:500;}
.nvidia-landing .star-foot{display:flex;flex-direction:column;align-items:flex-start;gap:16px;}
.nvidia-landing .star-price{display:flex;flex-direction:column;}
.nvidia-landing .star-price .lbl{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);}
.nvidia-landing .star-price .q{font-family:"Baloo 2";font-weight:700;font-size:clamp(2.2rem,4vw,3rem);line-height:1;font-variant-numeric:tabular-nums;}
.nvidia-landing .star-price .q .per{font-size:.9rem;color:var(--muted);font-weight:400;}
@media(max-width:900px){.nvidia-landing .star{grid-template-columns:1fr;gap:30px;min-height:auto;}}
/* ===== Beneficios (#beneficios) — portado ===== */
.nvidia-landing .bn-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:8px;}
.nvidia-landing .bn-card{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;}
.nvidia-landing .bn-visual{position:relative;height:148px;overflow:hidden;background:#0a0a0d;}
.nvidia-landing .bn-visual img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.nvidia-landing .bn-body{padding:22px 22px 24px;display:flex;flex-direction:column;gap:8px;flex:1;}
.nvidia-landing .bn-body h3{font-family:"Baloo 2";font-weight:700;font-size:1.12rem;line-height:1.18;}
.nvidia-landing .bn-body p{color:var(--muted);font-weight:400;font-size:.92rem;line-height:1.55;text-align:justify;}
.nvidia-landing .bn-body p strong{color:#eef1f6;font-weight:700;}
@media(max-width:900px){.nvidia-landing .bn-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:560px){.nvidia-landing .bn-grid{grid-template-columns:1fr;}}
/* ===== Footer: sin viñetas en las listas de enlaces (footer va fuera de .nvidia-landing) ===== */
#footer ul{list-style:none;}
#footer li{list-style:none;}
`;
