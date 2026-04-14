'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLenis } from '../../shared/hooks/useLenis';
import { useDeviceCapabilities } from '../../shared/hooks/useDeviceCapabilities';
import { useLazyFrames } from '../../shared/hooks/useLazyFrames';
import { StickyNav } from '../../shared/components/StickyNav';
import { ScrollProgress } from '../../shared/components/ScrollProgress';
import { RevealOnScroll } from '../../shared/components/RevealOnScroll';
import { StaggeredFadeIn } from '../../shared/components/StaggeredFadeIn';
import { TextOverMedia } from '../../shared/components/TextOverMedia';
import { AnimatedCounter } from '../../shared/components/AnimatedCounter';
import { SectionHeader } from '../../shared/components/SectionHeader';
import { CanvasScrubber } from '../../shared/components/CanvasScrubber';
import { ColorPicker } from '../../shared/components/ColorPicker';
import { FinancingCTA } from '../../shared/components/FinancingCTA';
import { variants } from '../../shared/lib/variants';
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

gsap.registerPlugin(ScrollTrigger);

const config = variants.premium;
const IMG = '/images/macbook-neo';

export function PremiumLanding() {
  useLenis();
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

      {/* 1. HERO — Lazy Canvas Scrub + TextOverMedia */}
      <HeroSection tier={tier} />

      {/* 2. HIGHLIGHTS — Tabs con auto-rotate */}
      <HighlightsSection />

      {/* 3. DESIGN — Dark reveal with StaggeredFadeIn */}
      <DesignSection tier={tier} />

      {/* 4. PRODUCT VIEWER — Canvas scrubbing */}
      <ProductViewerSection />

      {/* 5. PRODUCT GRID — StaggeredFadeIn */}
      <ProductGridSection />

      {/* 6. PERFORMANCE — Slider */}
      <PerformanceSection />

      {/* 7. LIFESTYLE — TextOverMedia pattern */}
      <LifestyleSection tier={tier} />

      {/* 8. DISPLAY — Dark + counters with StaggeredFadeIn */}
      <DisplaySection />

      {/* 9–11. Grid sections with StaggeredFadeIn */}
      <GridSection
        id="macos"
        eyebrow="macOS"
        title="Hecho para hacerte<br>más productivo."
        items={macosFeatures}
        cols={4}
      />
      <GridSection
        id="continuity"
        eyebrow="Continuidad"
        title="Tus dispositivos Apple,<br>mejor juntos."
        items={continuityItems}
        cols={3}
        bg="#fff"
      />
      <GridSection
        id="privacy"
        eyebrow="Privacidad y Seguridad"
        title="Tu privacidad está<br>protegida de serie."
        items={privacyItems}
        cols={4}
      />

      {/* 12. FINANCING CTA */}
      <FinancingCTA />

      {/* 13. FOOTER */}
      <Footer />
    </div>
  );
}

/* ─── HERO — Lazy Frames + TextOverMedia ─── */
const HERO_PRIORITY_INDICES = [0, 1, 2];

function HeroSection({ tier }: { tier: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  const heroFrames = config.assets.heroFrames!;
  const isBase = tier === 'base';

  const {
    canvasRef,
    drawFrame,
    getNearestLoadedFrame,
    ensureFramesAround,
    priorityLoaded,
    progress,
  } = useLazyFrames(heroFrames, {
    chunkSize: 30,
    priorityIndices: HERO_PRIORITY_INDICES,
  });

  // ScrollTrigger for canvas + title fade
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !priorityLoaded || isBase) return;

    const totalFrames = heroFrames.length;

    const ctx = gsap.context(() => {
      // Canvas scrub with lazy loading
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const targetIndex = Math.min(
            Math.floor(self.progress * totalFrames),
            totalFrames - 1,
          );
          // Ensure frames around current position are loaded
          ensureFramesAround(targetIndex);
          // Draw nearest available frame
          const frameIndex = getNearestLoadedFrame(targetIndex);
          drawFrame(frameIndex);
        },
      });

      // Title fade out
      gsap.to(titleRef.current, {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '10% top',
          scrub: true,
        },
      });
      gsap.to(taglineRef.current, {
        opacity: 0,
        y: -30,
        scrollTrigger: {
          trigger: container,
          start: '3% top',
          end: '12% top',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [priorityLoaded, heroFrames, isBase, drawFrame, getNearestLoadedFrame, ensureFramesAround]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: isBase ? 'auto' : config.heroHeight }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-black">
        {/* Loading state with progress */}
        {!priorityLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black">
            <Image
              src={config.assets.heroPoster || config.assets.heroImage}
              alt={heroData.headline}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Loading progress bar */}
            <div className="absolute bottom-8 left-1/2 z-30 w-48 -translate-x-1/2">
              <div className="h-[2px] overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/70 transition-all duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover"
          style={{
            opacity: priorityLoaded ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        />

        {/* Title overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div ref={titleRef} className="text-center">
            <h1
              className="text-[clamp(3rem,10vw,5.5rem)] font-bold tracking-[-0.045em]"
              style={{ color: '#f5f5f7' }}
            >
              {heroData.headline}
            </h1>
          </div>
          <div ref={taglineRef} className="mt-2 text-center">
            <p
              className="text-[clamp(1.3rem,4vw,2rem)] font-semibold tracking-[-0.02em]"
              style={{ color: '#86868b' }}
            >
              {heroData.tagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HIGHLIGHTS ─── */
function HighlightsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % highlightTabs.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  useEffect(() => {
    if (!progressRef.current) return;
    progressRef.current.style.transition = 'none';
    progressRef.current.style.width = '0%';
    requestAnimationFrame(() => {
      if (!progressRef.current) return;
      progressRef.current.style.transition = 'width 5s linear';
      progressRef.current.style.width = '100%';
    });
  }, [activeTab]);

  const tab = highlightTabs[activeTab];

  return (
    <section
      id="highlights"
      className="py-20"
      style={{ backgroundColor: '#fbfbfd' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader
          eyebrow="Destacados"
          title="Descubre lo que lo hace<br>especial."
          center
        />

        <div className="mb-6 flex justify-center gap-6">
          {highlightTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(i)}
              className="cursor-pointer border-b-2 pb-2 text-sm font-medium transition-colors"
              style={{
                borderColor: i === activeTab ? '#1d1d1f' : 'transparent',
                color: i === activeTab ? '#1d1d1f' : '#6e6e73',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mb-4 h-[2px] max-w-[300px] overflow-hidden rounded-full bg-neutral-200">
          <div
            ref={progressRef}
            className="h-full rounded-full"
            style={{ backgroundColor: '#1d1d1f', width: '0%' }}
          />
        </div>

        <RevealOnScroll>
          <div className="relative mx-auto aspect-[16/10] max-w-[800px] overflow-hidden rounded-2xl">
            {highlightTabs.map((t, i) => (
              <div
                key={t.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === activeTab ? 1 : 0 }}
              >
                <Image
                  src={t.imagePath}
                  alt={t.title}
                  fill
                  className="object-cover"
                  sizes="800px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div className="mt-8 text-center">
            {tab.badge && (
              <span
                className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
              >
                {tab.badge}
              </span>
            )}
            <h3
              className="text-xl font-bold"
              style={{ color: '#1d1d1f' }}
            >
              {tab.title}
            </h3>
            <p
              className="mx-auto mt-2 max-w-md text-sm leading-relaxed"
              style={{ color: '#6e6e73' }}
            >
              {tab.description}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── DESIGN — StaggeredFadeIn word reveal ─── */
function DesignSection({ tier }: { tier: string }) {
  return (
    <section className="py-24" style={{ backgroundColor: '#000' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <StaggeredFadeIn
          staggerDelay={0.04}
          duration={0.6}
          y={20}
          start="top 80%"
          className="mb-12 flex flex-wrap justify-center"
        >
          {'Love at first Mac.'.split(' ').map((word, i) => (
            <span
              key={i}
              className="mr-[0.3em] inline-block text-[clamp(2.5rem,8vw,5rem)] font-bold tracking-[-0.04em]"
              style={{ color: '#f5f5f7' }}
            >
              {word}
            </span>
          ))}
        </StaggeredFadeIn>

        <RevealOnScroll delay={0.3}>
          <div className="relative mx-auto aspect-[16/9] max-w-[900px] overflow-hidden rounded-xl">
            <Image
              src={`${IMG}/design_endframe_2x.png`}
              alt="MacBook Neo design"
              fill
              className="object-contain"
              sizes="900px"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── PRODUCT VIEWER — Canvas Scrubbing ─── */
function ProductViewerSection() {
  if (config.assets.sequenceFrames && config.assets.sequenceFrames.length > 0) {
    return (
      <section style={{ backgroundColor: '#fbfbfd' }}>
        <div className="mx-auto max-w-[980px] px-4 pt-20">
          <SectionHeader
            eyebrow="Producto"
            title="Míralo desde<br>todos los ángulos."
            center
          />
        </div>
        <CanvasScrubber frameUrls={config.assets.sequenceFrames} height="400vh" />
      </section>
    );
  }

  return (
    <section className="py-20" style={{ backgroundColor: '#fbfbfd' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader
          eyebrow="Colores"
          title="Encuentra tu estilo."
          center
        />
        <RevealOnScroll>
          <ColorPicker
            colors={colorOptions.map((c) => ({
              name: c.label,
              hex: c.hex,
              imageSrc: c.imagePath,
            }))}
          />
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── PRODUCT GRID — StaggeredFadeIn ─── */
function ProductGridSection() {
  const cards = [
    { src: `${IMG}/pv_display_2x.jpg`, alt: 'Pantalla', label: 'Liquid Retina' },
    { src: `${IMG}/pv_keyboard_2x.jpg`, alt: 'Teclado', label: 'Teclado Magic' },
    { src: `${IMG}/pv_hero_2x.jpg`, alt: 'MacBook Neo', label: 'Diseño compacto' },
  ];

  return (
    <section className="py-20" style={{ backgroundColor: '#fff' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader
          eyebrow="Detalles"
          title="Diseñado para<br>cada detalle."
          center
        />
        <StaggeredFadeIn staggerDelay={0.1} className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.alt}
              className="group cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: '#f5f5f7' }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 734px) 100vw, 33vw"
                />
              </div>
              <p
                className="p-4 text-center text-sm font-medium"
                style={{ color: '#1d1d1f' }}
              >
                {card.label}
              </p>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── PERFORMANCE — Slider ─── */
function PerformanceSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20" style={{ backgroundColor: '#fbfbfd' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader
          eyebrow="Rendimiento"
          title="Con el chip A18 Pro,<br>todo vuela."
          center
        />

        <RevealOnScroll>
          <div className="relative mx-auto aspect-[16/9] max-w-[800px] overflow-hidden rounded-2xl">
            {performanceSlides.map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === active ? 1 : 0 }}
              >
                <Image
                  src={slide.imagePath}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="800px"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-xl font-bold text-white">{slide.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <div className="mt-6 flex justify-center gap-2">
          {performanceSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="cursor-pointer rounded-full transition-all duration-200"
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                backgroundColor: i === active ? '#1d1d1f' : '#d1d1d6',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── LIFESTYLE — TextOverMedia pattern ─── */
function LifestyleSection({ tier }: { tier: string }) {
  return (
    <TextOverMedia
      height="300vh"
      scrimColor="rgba(0,0,0,0.6)"
      align="left"
      media={
        <Image
          src={`${IMG}/performance_lifestyle_2x.jpg`}
          alt="MacBook Neo lifestyle"
          fill
          className="object-cover"
          sizes="100vw"
        />
      }
    >
      <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-white tracking-[-0.025em]">
        Batería para<br />todo el día.
      </p>
      <p className="mt-3 text-lg text-white/80">
        Hasta 16 horas de autonomía.
      </p>
    </TextOverMedia>
  );
}

/* ─── DISPLAY — Dark + Counters with StaggeredFadeIn ─── */
function DisplaySection() {
  return (
    <section className="py-24" style={{ backgroundColor: '#000' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <SectionHeader
          eyebrow="Pantalla"
          title="Brillante en<br>todos los sentidos."
          dark
          center
        />

        <RevealOnScroll>
          <div className="relative mx-auto aspect-[16/10] max-w-[700px]">
            <Image
              src={`${IMG}/dca_display_2x.png`}
              alt="MacBook Neo display"
              fill
              className="object-contain"
              sizes="700px"
            />
          </div>
        </RevealOnScroll>

        <StaggeredFadeIn staggerDelay={0.12} className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {displayStats.map((stat) => (
            <div key={stat.id} className="text-center">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                className="text-[clamp(2rem,5vw,3rem)] font-bold"
                style={{ color: '#f5f5f7' }}
                separator={stat.value >= 1000}
              />
              <p className="mt-1 text-sm" style={{ color: '#86868b' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── GENERIC GRID SECTION — StaggeredFadeIn ─── */
function GridSection({
  id,
  eyebrow,
  title,
  items,
  cols = 4,
  bg = '#fbfbfd',
}: {
  id: string;
  eyebrow: string;
  title: string;
  items: { id: string; icon: string; title: string; description: string }[];
  cols?: number;
  bg?: string;
}) {
  return (
    <section id={id} className="py-20" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader eyebrow={eyebrow} title={title} center />
        <StaggeredFadeIn
          staggerDelay={0.06}
          className={`grid gap-4 ${cols === 3 ? 'md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-6"
              style={{ backgroundColor: bg === '#fff' ? '#f5f5f7' : '#fff' }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
              >
                ●
              </div>
              <h4
                className="mb-1 text-sm font-semibold"
                style={{ color: '#1d1d1f' }}
              >
                {item.title}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: '#6e6e73' }}>
                {item.description}
              </p>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="py-12" style={{ backgroundColor: '#f5f5f7' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <p className="text-xs" style={{ color: '#6e6e73' }}>
          MacBook Neo es una landing de demostración para BaldeCash.
          Las imágenes y especificaciones son referenciales.
        </p>
        <p className="mt-2 text-xs" style={{ color: '#86868b' }}>
          © 2026 BaldeCash. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
