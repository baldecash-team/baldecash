'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLazyFrames } from '../../macbook-neo-v3/shared/hooks/useLazyFrames';
import { heroData } from '../data/v4Data';
import { generateFrameUrls, COLORS } from '../lib/constants';

const HERO_FRAME_URLS = generateFrameUrls('hero', 180);
const PRIORITY_INDICES = [0, 1, 2];

interface HeroCanvasScrubProps {
  tier: string;
}

export function HeroCanvasScrub({ tier }: HeroCanvasScrubProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLHeadingElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);

  const {
    canvasRef,
    drawFrame,
    getNearestLoadedFrame,
    ensureFramesAround,
    priorityLoaded,
    progress,
    totalFrames,
  } = useLazyFrames(HERO_FRAME_URLS, {
    chunkSize: 30,
    priorityIndices: PRIORITY_INDICES,
  });

  // GSAP ScrollTrigger for canvas scrub and fade-outs
  useEffect(() => {
    if (tier === 'base' || !priorityLoaded) return;

    let gsapModule: typeof import('gsap') | null = null;
    let scrollTriggerModule: typeof import('gsap/ScrollTrigger') | null = null;
    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | null = null;

    async function init() {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      gsapModule = gsapMod;
      scrollTriggerModule = stMod;

      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;

      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      ctx = gsap.context(() => {
        const container = containerRef.current!;

        // Canvas scrub — scrub through frames based on scroll
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            const frameIndex = Math.min(
              Math.floor(self.progress * (totalFrames - 1)),
              totalFrames - 1
            );
            const nearest = getNearestLoadedFrame(frameIndex);
            drawFrame(nearest);
            ensureFramesAround(frameIndex);
          },
        });

        // Eyebrow fade out: 2-12% scroll (first to fade)
        if (eyebrowRef.current) {
          gsap.fromTo(
            eyebrowRef.current,
            { opacity: 1 },
            {
              opacity: 0,
              scrollTrigger: {
                trigger: container,
                start: '2% top',
                end: '12% top',
                scrub: true,
              },
            }
          );
        }

        // Headline fade out: 3-10% scroll
        if (headlineRef.current) {
          gsap.fromTo(
            headlineRef.current,
            { opacity: 1 },
            {
              opacity: 0,
              scrollTrigger: {
                trigger: container,
                start: '3% top',
                end: '10% top',
                scrub: true,
              },
            }
          );
        }

        // CTA group fade out: 5-14% scroll (last to fade)
        if (ctaGroupRef.current) {
          gsap.fromTo(
            ctaGroupRef.current,
            { opacity: 1 },
            {
              opacity: 0,
              scrollTrigger: {
                trigger: container,
                start: '5% top',
                end: '14% top',
                scrub: true,
              },
            }
          );
        }
      }, containerRef);
    }

    init();

    return () => {
      ctx?.revert();
    };
  }, [tier, priorityLoaded, totalFrames, drawFrame, getNearestLoadedFrame, ensureFramesAround]);

  // Base tier: static fallback
  if (tier === 'base') {
    return (
      <section id="welcome" className="relative bg-black">
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
          <Image
            src={heroData.poster}
            alt="MacBook Neo"
            fill
            priority
            className="object-cover"
          />
          <div className="relative z-[2] text-center flex flex-col items-center px-5">
            {/* Eyebrow */}
            <h1 className="text-[28px] font-semibold text-white tracking-[0.007em] m-0">
              {heroData.headline}
            </h1>

            {/* Headline */}
            <p className="text-[48px] sm:text-[64px] md:text-[80px] font-bold text-white leading-[1.05] tracking-[-0.015em] m-0 mt-1">
              {heroData.tagline}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-5 mt-4">
              <a
                href={heroData.ctaPrimary.href}
                className="inline-flex items-center rounded-full px-6 py-2 text-sm font-normal text-white no-underline hover:opacity-90 transition-opacity"
                style={{ backgroundColor: COLORS.buttonPrimary }}
              >
                {heroData.ctaPrimary.label}
              </a>
              <a
                href={heroData.ctaSecondary.href}
                className="inline-flex items-center text-sm font-normal no-underline hover:underline"
                style={{ color: COLORS.linkDark }}
              >
                {heroData.ctaSecondary.label}
                <span className="ml-1">&rsaquo;</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="welcome" ref={containerRef} className="relative" style={{ height: '600vh' }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover' }}
        />

        {/* Loading state: poster + progress bar */}
        {!priorityLoaded && (
          <div className="absolute inset-0 z-[5]">
            <Image
              src={heroData.poster}
              alt="MacBook Neo"
              fill
              priority
              className="object-cover"
            />
            <div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[3px] rounded-sm overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <div
                className="h-full rounded-sm transition-[width] duration-300 ease-out"
                style={{
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${COLORS.progressStart}, ${COLORS.progressEnd})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Text overlay — Apple viewport-content pattern */}
        <div className="relative z-[3] text-center flex flex-col items-center max-w-[980px] mx-auto px-5 pointer-events-auto">
          {/* Eyebrow */}
          <h1
            ref={eyebrowRef}
            className="text-[28px] font-semibold text-white tracking-[0.007em] m-0"
          >
            {heroData.headline}
          </h1>

          {/* Headline */}
          <p
            ref={headlineRef}
            className="text-[48px] sm:text-[64px] md:text-[80px] font-bold text-white leading-[1.05] tracking-[-0.015em] m-0 mt-1"
          >
            {heroData.tagline}
          </p>

          {/* CTAs */}
          <div ref={ctaGroupRef} className="flex items-center gap-5 mt-4">
            <a
              href={heroData.ctaPrimary.href}
              className="inline-flex items-center rounded-full px-6 py-2 text-sm font-normal text-white no-underline hover:opacity-90 transition-opacity"
              style={{ backgroundColor: COLORS.buttonPrimary }}
            >
              {heroData.ctaPrimary.label}
            </a>
            <a
              href={heroData.ctaSecondary.href}
              className="inline-flex items-center text-sm font-normal no-underline hover:underline"
              style={{ color: COLORS.linkDark }}
            >
              {heroData.ctaSecondary.label}
              <span className="ml-1">&rsaquo;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
