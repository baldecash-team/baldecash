'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Image from 'next/image';

import { StickyNav } from '../../shared/components/StickyNav';
import { ScrollProgress } from '../../shared/components/ScrollProgress';
import { FinancingCTA } from '../../shared/components/FinancingCTA';
import { useDeviceCapabilities } from '../../shared/hooks/useDeviceCapabilities';
import {
  heroData,
  colorOptions,
  highlightTabs,
  performanceSlides,
  displayStats,
  macosFeatures,
  continuityItems,
  privacyItems,
} from '../../shared/data/macbookNeoData';

const IMG = 'https://baldecash.s3.amazonaws.com/images/macbook-neo';

export function LiteLanding() {
  const { tier } = useDeviceCapabilities();

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
        color: '#1d1d1f',
      }}
    >
      <StickyNav />
      <ScrollProgress />

      <HeroSection tier={tier} />
      <HighlightsSection />
      <DesignSection tier={tier} />
      <ColorSection />
      <ProductGridSection />
      <PerformanceSection />
      <LifestyleSection />
      <DisplaySection tier={tier} />
      <LiteGridSection id="macos" eyebrow="macOS" title="Hecho para hacerte más productivo." items={macosFeatures} cols={4} />
      <LiteGridSection id="continuity" eyebrow="Continuidad" title="Tus dispositivos Apple, mejor juntos." items={continuityItems} cols={3} bg="#fff" />
      <LiteGridSection id="privacy" eyebrow="Privacidad y Seguridad" title="Tu privacidad está protegida de serie." items={privacyItems} cols={4} />
      <FinancingCTA />
      <Footer />
    </div>
  );
}

/* ─── CSS Reveal wrapper (no GSAP) ─── */
function CSSReveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { tier } = useDeviceCapabilities();
  const isBase = tier === 'base';

  useEffect(() => {
    const el = ref.current;
    if (!el || isBase) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isBase]);

  if (isBase) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── CSS StaggeredFadeIn (no GSAP, matches Apple pattern) ─── */
function CSSStaggeredFadeIn({
  children,
  staggerDelay = 0.08,
  className = '',
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { tier } = useDeviceCapabilities();
  const isBase = tier === 'base';

  useEffect(() => {
    const el = ref.current;
    if (!el || isBase) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isBase]);

  useEffect(() => {
    if (!visible || !ref.current || isBase) return;
    const children = ref.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      child.style.transition = `opacity 0.5s ease-out ${i * staggerDelay}s, transform 0.5s ease-out ${i * staggerDelay}s`;
      // Trigger reflow then animate
      requestAnimationFrame(() => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      });
    }
  }, [visible, staggerDelay, isBase]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ─── HERO — Imagen estática ─── */
function HeroSection({ tier }: { tier: string }) {
  const isBase = tier === 'base';

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      <Image
        src={`${IMG}/hero_endframe_2x.jpg`}
        alt={heroData.headline}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="relative z-10 text-center" style={isBase ? undefined : { animation: 'fadeIn 0.8s ease-out' }}>
        <h1 className="text-[clamp(3rem,10vw,5.5rem)] font-bold tracking-[-0.045em]" style={{ color: '#f5f5f7' }}>
          {heroData.headline}
        </h1>
        <p className="mt-2 text-[clamp(1.3rem,4vw,2rem)] font-semibold tracking-[-0.02em]" style={{ color: '#86868b' }}>
          {heroData.tagline}
        </p>
      </div>
      {!isBase && <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>}
    </section>
  );
}

/* ─── HIGHLIGHTS — CSS tabs ─── */
function HighlightsSection() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % highlightTabs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tab = highlightTabs[activeTab];

  return (
    <section id="highlights" className="py-20" style={{ backgroundColor: '#fbfbfd' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <CSSReveal className="mb-12 text-center">
          <p className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]" style={{ color: '#6e6e73' }}>Destacados</p>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]" style={{ color: '#1d1d1f' }}>
            Descubre lo que lo hace especial.
          </h2>
        </CSSReveal>

        <div className="mb-8 flex justify-center gap-6">
          {highlightTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(i)}
              className="cursor-pointer border-b-2 pb-2 text-sm font-medium transition-colors"
              style={{ borderColor: i === activeTab ? '#1d1d1f' : 'transparent', color: i === activeTab ? '#1d1d1f' : '#6e6e73' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <CSSReveal>
          <div className="relative mx-auto aspect-[16/10] max-w-[800px] overflow-hidden rounded-2xl">
            {highlightTabs.map((t, i) => (
              <div key={t.id} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: i === activeTab ? 1 : 0 }}>
                <Image src={t.imagePath} alt={t.title} fill className="object-cover" sizes="800px" priority={i === 0} />
              </div>
            ))}
          </div>
        </CSSReveal>

        <CSSReveal delay={0.15}>
          <div className="mt-8 text-center">
            {tab.badge && (
              <span className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}>
                {tab.badge}
              </span>
            )}
            <h3 className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{tab.title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: '#6e6e73' }}>{tab.description}</p>
          </div>
        </CSSReveal>
      </div>
    </section>
  );
}

/* ─── DESIGN ─── */
function DesignSection({ tier }: { tier: string }) {
  return (
    <section className="py-24" style={{ backgroundColor: '#000' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <CSSReveal>
          <h2 className="mb-12 text-[clamp(2.5rem,8vw,5rem)] font-bold tracking-[-0.04em]" style={{ color: '#f5f5f7' }}>
            Love at first Mac.
          </h2>
        </CSSReveal>
        <CSSReveal delay={0.2}>
          <div className="relative mx-auto aspect-[16/9] max-w-[900px] overflow-hidden rounded-xl">
            <Image src={`${IMG}/design_endframe_2x.png`} alt="Design" fill className="object-contain" sizes="900px" />
          </div>
        </CSSReveal>
      </div>
    </section>
  );
}

/* ─── COLOR PICKER ─── */
function ColorSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20" style={{ backgroundColor: '#fbfbfd' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <CSSReveal className="mb-12 text-center">
          <p className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]" style={{ color: '#6e6e73' }}>Colores</p>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]" style={{ color: '#1d1d1f' }}>Encuentra tu estilo.</h2>
        </CSSReveal>

        <CSSReveal>
          <div className="flex flex-col items-center gap-8">
            <div className="relative aspect-square w-full max-w-[600px]">
              {colorOptions.map((c, i) => (
                <div key={c.id} className="absolute inset-0 transition-opacity duration-400" style={{ opacity: i === active ? 1 : 0 }}>
                  <Image src={c.imagePath} alt={c.label} fill className="object-contain" sizes="600px" priority={i === 0} />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-3">
                {colorOptions.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setActive(i)}
                    className="cursor-pointer rounded-full transition-transform duration-200"
                    style={{
                      width: 32, height: 32, backgroundColor: c.hex,
                      border: i === active ? '2px solid #1d1d1f' : '2px solid transparent',
                      outline: i === active ? '2px solid #fff' : 'none', outlineOffset: -4,
                      transform: i === active ? 'scale(1.15)' : 'scale(1)',
                    }}
                    aria-label={c.label}
                  />
                ))}
              </div>
              <span className="text-[14px] font-medium" style={{ color: '#6e6e73' }}>{colorOptions[active].label}</span>
            </div>
          </div>
        </CSSReveal>
      </div>
    </section>
  );
}

/* ─── PRODUCT GRID — CSS StaggeredFadeIn ─── */
function ProductGridSection() {
  const cards = [
    { src: `${IMG}/pv_display_2x.jpg`, alt: 'Pantalla', label: 'Liquid Retina' },
    { src: `${IMG}/pv_keyboard_2x.jpg`, alt: 'Teclado', label: 'Teclado Magic' },
    { src: `${IMG}/pv_hero_2x.jpg`, alt: 'MacBook Neo', label: 'Diseño compacto' },
  ];

  return (
    <section className="py-20" style={{ backgroundColor: '#fff' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <CSSReveal className="mb-12 text-center">
          <p className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]" style={{ color: '#6e6e73' }}>Detalles</p>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]" style={{ color: '#1d1d1f' }}>Diseñado para cada detalle.</h2>
        </CSSReveal>

        <CSSStaggeredFadeIn staggerDelay={0.1} className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.alt}
              className="overflow-hidden rounded-2xl"
              style={{ backgroundColor: '#f5f5f7' }}
            >
              <div className="relative aspect-[4/3]">
                <Image src={card.src} alt={card.alt} fill className="object-cover" sizes="(max-width: 734px) 100vw, 33vw" loading="lazy" />
              </div>
              <p className="p-4 text-center text-sm font-medium" style={{ color: '#1d1d1f' }}>{card.label}</p>
            </div>
          ))}
        </CSSStaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── PERFORMANCE ─── */
function PerformanceSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20" style={{ backgroundColor: '#fbfbfd' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <CSSReveal className="mb-12 text-center">
          <p className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]" style={{ color: '#6e6e73' }}>Rendimiento</p>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]" style={{ color: '#1d1d1f' }}>Con el chip A18 Pro, todo vuela.</h2>
        </CSSReveal>

        <CSSReveal>
          <div className="relative mx-auto aspect-[16/9] max-w-[800px] overflow-hidden rounded-2xl">
            {performanceSlides.map((slide, i) => (
              <div key={slide.id} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: i === active ? 1 : 0 }}>
                <Image src={slide.imagePath} alt={slide.title} fill className="object-cover" sizes="800px" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-xl font-bold text-white">{slide.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CSSReveal>

        <div className="mt-6 flex justify-center gap-2">
          {performanceSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="cursor-pointer rounded-full transition-all duration-200"
              style={{ width: i === active ? 24 : 8, height: 8, backgroundColor: i === active ? '#1d1d1f' : '#d1d1d6' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── LIFESTYLE ─── */
function LifestyleSection() {
  return (
    <section className="relative overflow-hidden" style={{ height: '70vh' }}>
      <Image src={`${IMG}/performance_lifestyle_2x.jpg`} alt="Lifestyle" fill className="object-cover" sizes="100vw" loading="lazy" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[980px] px-4">
          <CSSReveal>
            <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-white tracking-[-0.025em]">Batería para<br />todo el día.</p>
            <p className="mt-3 text-lg text-white/80">Hasta 16 horas de autonomía.</p>
          </CSSReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── DISPLAY — CSS counter ─── */
function DisplaySection({ tier }: { tier: string }) {
  const isBase = tier === 'base';

  return (
    <section className="py-24" style={{ backgroundColor: '#000' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <CSSReveal className="mb-12">
          <p className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]" style={{ color: '#86868b' }}>Pantalla</p>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]" style={{ color: '#f5f5f7' }}>
            Brillante en todos los sentidos.
          </h2>
        </CSSReveal>

        <CSSReveal>
          <div className="relative mx-auto aspect-[16/10] max-w-[700px]">
            <Image src={`${IMG}/dca_display_2x.png`} alt="Display" fill className="object-contain" sizes="700px" loading="lazy" />
          </div>
        </CSSReveal>

        <CSSStaggeredFadeIn staggerDelay={0.1} className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {displayStats.map((stat) => (
            <div key={stat.id} className="text-center">
              <CSSCounter end={stat.value} suffix={stat.suffix} className="text-[clamp(2rem,5vw,3rem)] font-bold" isBase={isBase} />
              <p className="mt-1 text-sm" style={{ color: '#86868b' }}>{stat.label}</p>
            </div>
          ))}
        </CSSStaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── CSS Counter (no GSAP) ─── */
function CSSCounter({ end, suffix = '', className = '', isBase = false }: { end: number; suffix?: string; className?: string; isBase?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  const isDecimal = end % 1 !== 0;
  const finalText = (isDecimal ? end.toFixed(1) : String(end)) + suffix;

  const animate = useCallback(() => {
    const el = ref.current;
    if (!el || animated.current) return;
    animated.current = true;

    const duration = 1500;
    const start = performance.now();

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      el!.textContent = (isDecimal ? current.toFixed(1) : String(Math.floor(current))) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [end, suffix, isDecimal]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isBase) {
      el.textContent = finalText;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { animate(); observer.unobserve(el); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, isBase, finalText]);

  return <span ref={ref} className={className} style={{ color: '#f5f5f7' }}>{isBase ? finalText : `0${suffix}`}</span>;
}

/* ─── GENERIC GRID — CSS StaggeredFadeIn ─── */
function LiteGridSection({
  id, eyebrow, title, items, cols = 4, bg = '#fbfbfd',
}: {
  id: string; eyebrow: string; title: string;
  items: { id: string; icon: string; title: string; description: string }[];
  cols?: number; bg?: string;
}) {
  return (
    <section id={id} className="py-20" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-[980px] px-4">
        <CSSReveal className="mb-12 text-center">
          <p className="mb-3 text-[0.85rem] font-medium uppercase tracking-[0.05em]" style={{ color: '#6e6e73' }}>{eyebrow}</p>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]" style={{ color: '#1d1d1f' }}>{title}</h2>
        </CSSReveal>
        <CSSStaggeredFadeIn staggerDelay={0.06} className={`grid gap-4 ${cols === 3 ? 'md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl p-6" style={{ backgroundColor: bg === '#fff' ? '#f5f5f7' : '#fff' }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}>●</div>
              <h4 className="mb-1 text-sm font-semibold" style={{ color: '#1d1d1f' }}>{item.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: '#6e6e73' }}>{item.description}</p>
            </div>
          ))}
        </CSSStaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="py-12" style={{ backgroundColor: '#f5f5f7' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <p className="text-xs" style={{ color: '#6e6e73' }}>MacBook Neo es una landing de demostración para BaldeCash. Las imágenes y especificaciones son referenciales.</p>
        <p className="mt-2 text-xs" style={{ color: '#86868b' }}>© 2026 BaldeCash. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
