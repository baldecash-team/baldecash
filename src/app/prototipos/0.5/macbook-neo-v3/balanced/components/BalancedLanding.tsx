'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLenis } from '../../shared/hooks/useLenis';
import { useDeviceCapabilities } from '../../shared/hooks/useDeviceCapabilities';
import { StickyNav } from '../../shared/components/StickyNav';
import { ScrollProgress } from '../../shared/components/ScrollProgress';
import { RevealOnScroll } from '../../shared/components/RevealOnScroll';
import { StaggeredFadeIn } from '../../shared/components/StaggeredFadeIn';
import { TextOverMedia } from '../../shared/components/TextOverMedia';
import { AnimatedCounter } from '../../shared/components/AnimatedCounter';
import { SectionHeader } from '../../shared/components/SectionHeader';
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

const config = variants.balanced;
const IMG = '/images/macbook-neo';

export function BalancedLanding() {
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

      <HeroSection tier={tier} />
      <HighlightsSection />
      <DesignSection />
      <ColorSection />
      <ProductGridSection />
      <PerformanceSection />
      <LifestyleSection />
      <DisplaySection />
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
      <FinancingCTA />
      <Footer />
    </div>
  );
}

/* ─── HERO — Video autoplay (NO scrubbing) ─── */
function HeroSection({ tier }: { tier: string }) {
  const titleRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const isBase = tier === 'base';

  useEffect(() => {
    if (isBase) return;

    const ctx = gsap.context(() => {
      gsap.to(titleRef.current, {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [isBase]);

  // Pause video when in base tier to save resources
  useEffect(() => {
    if (isBase && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isBase]);

  return (
    <section className="relative overflow-hidden" style={{ height: config.heroHeight }}>
      <div className="sticky top-0 h-screen">
        {config.assets.heroVideo && !videoError && !isBase ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={config.assets.heroPoster}
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={config.assets.heroVideo} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={config.assets.heroImage}
            alt={heroData.headline}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div ref={titleRef} className="text-center">
            <h1
              className="text-[clamp(3rem,10vw,5.5rem)] font-bold tracking-[-0.045em]"
              style={{ color: '#f5f5f7' }}
            >
              {heroData.headline}
            </h1>
            <p
              className="mt-2 text-[clamp(1.3rem,4vw,2rem)] font-semibold tracking-[-0.02em]"
              style={{ color: '#86868b' }}
            >
              {heroData.tagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── HIGHLIGHTS ─── */
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
        <SectionHeader eyebrow="Destacados" title="Descubre lo que lo hace<br>especial." center />

        <div className="mb-8 flex justify-center gap-6">
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
            <h3 className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{tab.title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: '#6e6e73' }}>
              {tab.description}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── DESIGN — StaggeredFadeIn ─── */
function DesignSection() {
  return (
    <section className="py-24" style={{ backgroundColor: '#000' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <SectionHeader
          eyebrow="Diseño"
          title="Love at first Mac."
          dark
          center
        />
        <RevealOnScroll>
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

/* ─── COLOR PICKER ─── */
function ColorSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#fbfbfd' }}>
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader eyebrow="Colores" title="Encuentra tu estilo." center />
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
        <SectionHeader eyebrow="Detalles" title="Diseñado para<br>cada detalle." center />
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
              <p className="p-4 text-center text-sm font-medium" style={{ color: '#1d1d1f' }}>
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
        <SectionHeader eyebrow="Rendimiento" title="Con el chip A18 Pro,<br>todo vuela." center />
        <RevealOnScroll>
          <div className="relative mx-auto aspect-[16/9] max-w-[800px] overflow-hidden rounded-2xl">
            {performanceSlides.map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === active ? 1 : 0 }}
              >
                <Image src={slide.imagePath} alt={slide.title} fill className="object-cover" sizes="800px" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
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
              style={{ width: i === active ? 24 : 8, height: 8, backgroundColor: i === active ? '#1d1d1f' : '#d1d1d6' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── LIFESTYLE — TextOverMedia ─── */
function LifestyleSection() {
  return (
    <TextOverMedia
      height="250vh"
      scrimColor="rgba(0,0,0,0.6)"
      align="left"
      media={
        <Image
          src={`${IMG}/performance_lifestyle_2x.jpg`}
          alt="Lifestyle"
          fill
          className="object-cover"
          sizes="100vw"
        />
      }
    >
      <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-white tracking-[-0.025em]">
        Batería para<br />todo el día.
      </p>
      <p className="mt-3 text-lg text-white/80">Hasta 16 horas de autonomía.</p>
    </TextOverMedia>
  );
}

/* ─── DISPLAY ─── */
function DisplaySection() {
  return (
    <section className="py-24" style={{ backgroundColor: '#000' }}>
      <div className="mx-auto max-w-[980px] px-4 text-center">
        <SectionHeader eyebrow="Pantalla" title="Brillante en<br>todos los sentidos." dark center />
        <RevealOnScroll>
          <div className="relative mx-auto aspect-[16/10] max-w-[700px]">
            <Image src={`${IMG}/dca_display_2x.png`} alt="Display" fill className="object-contain" sizes="700px" />
          </div>
        </RevealOnScroll>
        <StaggeredFadeIn staggerDelay={0.12} className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {displayStats.map((stat) => (
            <div key={stat.id} className="text-center">
              <AnimatedCounter end={stat.value} suffix={stat.suffix} className="text-[clamp(2rem,5vw,3rem)] font-bold" style={{ color: '#f5f5f7' }} separator={stat.value >= 1000} />
              <p className="mt-1 text-sm" style={{ color: '#86868b' }}>{stat.label}</p>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
}

/* ─── GENERIC GRID — StaggeredFadeIn ─── */
function GridSection({
  id, eyebrow, title, items, cols = 4, bg = '#fbfbfd',
}: {
  id: string; eyebrow: string; title: string;
  items: { id: string; icon: string; title: string; description: string }[];
  cols?: number; bg?: string;
}) {
  return (
    <section id={id} className="py-20" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-[980px] px-4">
        <SectionHeader eyebrow={eyebrow} title={title} center />
        <StaggeredFadeIn staggerDelay={0.06} className={`grid gap-4 ${cols === 3 ? 'md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl p-6" style={{ backgroundColor: bg === '#fff' ? '#f5f5f7' : '#fff' }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}>●</div>
              <h4 className="mb-1 text-sm font-semibold" style={{ color: '#1d1d1f' }}>{item.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: '#6e6e73' }}>{item.description}</p>
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
        <p className="text-xs" style={{ color: '#6e6e73' }}>MacBook Neo es una landing de demostración para BaldeCash. Las imágenes y especificaciones son referenciales.</p>
        <p className="mt-2 text-xs" style={{ color: '#86868b' }}>© 2026 BaldeCash. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
