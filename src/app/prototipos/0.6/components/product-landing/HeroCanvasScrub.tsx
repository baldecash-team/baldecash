'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { ASSETS, BC } from './lib/constants';

const STAGGER = {
  eyebrow: 0,
  headline: 100,
  price: 200,
  limited: 300,
  cta: 400,
  replay: 500,
};

const FADE_OUT_MS = 300;

interface HeroProps {
  tier: string;
  onVideoEnd?: () => void;
  onVideoReplay?: () => void;
}

export default function HeroCanvasScrub({ tier, onVideoEnd, onVideoReplay }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // mounted: gate para no renderizar el <video> antes de saber si es mobile
  const [mounted, setMounted] = useState(false);

  // Detect mobile en cliente + marcar como mounted
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setMounted(true);
    if (mobile) {
      setVideoEnded(true);
      onVideoEnd?.();
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const skipVideo = tier === 'base' || isMobile;
  // Solo renderizar el <video> después de montar (evita flash en mobile)
  const shouldRenderVideo = mounted && !skipVideo;

  useEffect(() => {
    if (!shouldRenderVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => { setVideoEnded(true); onVideoEnd?.(); };

    video.addEventListener('ended', handleEnded);

    video.play().catch(() => {
      setVideoEnded(true);
      onVideoEnd?.();
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [shouldRenderVideo]);

  const handleReplay = useCallback(() => {
    const video = videoRef.current;
    if (!video || isReplaying) return;

    onVideoReplay?.();
    setIsReplaying(true);

    setTimeout(() => {
      setVideoEnded(false);
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsReplaying(false);
    }, FADE_OUT_MS);
  }, [onVideoReplay, isReplaying]);

  const showContent = (videoEnded || skipVideo) && !isReplaying;

  const staggerStyle = (delayMs: number): React.CSSProperties => ({
    opacity: showContent ? 1 : 0,
    transform: showContent ? 'translateY(0)' : 'translateY(16px)',
    transition: showContent
      ? `opacity 0.5s ease ${delayMs}ms, transform 0.5s ease ${delayMs}ms`
      : `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`,
  });

  const handleFinanciar = () => {
    const el = document.getElementById('financing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative h-screen bg-black overflow-hidden">
      {/* Poster: siempre visible hasta saber en cliente (evita flash del video en mobile) */}
      {(skipVideo || !mounted) && (
        <img
          src={isMobile ? ASSETS.hero.posterMobile : ASSETS.hero.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Video for desktop enhanced tier — solo se monta después de saber que no es mobile */}
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="metadata"
          poster={ASSETS.hero.poster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        >
          <source src={ASSETS.hero.video} type="video/mp4" />
        </video>
      )}

      {/* Mobile scrim — improves text legibility over busy poster */}
      {isMobile && (
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 100%)',
          }}
        />
      )}

      {/* Content overlay — left side, hardcoded */}
      <div className="absolute inset-0 z-[3] flex items-center">
        <div className="w-full mx-auto px-5 sm:px-8 md:px-14 lg:px-44">
          <div className="flex justify-start">
            <div className="w-full max-w-[520px] flex flex-col gap-3 sm:gap-4">
              {/* Eyebrow */}
              <p
                className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.2em] m-0"
                style={{ color: BC.primary, ...staggerStyle(STAGGER.eyebrow) }}
              >
                Exclusivo
              </p>

              {/* Headline */}
              <h1
                className="text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-semibold tracking-[-0.015em] leading-[1.05] m-0"
                style={{ fontFamily: "'Baloo 2', sans-serif", color: isMobile ? '#f5f5f7' : '#1d1d1f', ...staggerStyle(STAGGER.headline) }}
              >
                MacBook Neo{isMobile ? <br /> : ' '}llegó a BaldeCash
              </h1>

              {/* Price */}
              <p
                className="text-[17px] sm:text-xl md:text-2xl m-0"
                style={{ color: isMobile ? '#f5f5f7' : '#6e6e73', ...staggerStyle(STAGGER.price) }}
              >
                Desde{' '}
                <span className="font-bold text-xl sm:text-2xl md:text-[40px]" style={{ color: isMobile ? '#03DBD0' : BC.primary }}>
                  S/199
                </span>
                <span style={{ color: isMobile ? '#f5f5f7' : '#6e6e73' }}>/mes</span>
              </p>

              {/* Limited time */}
              <p
                className="text-xs md:text-[15px] m-0"
                style={{ color: isMobile ? 'rgba(245,245,247,0.8)' : '#86868b', ...staggerStyle(STAGGER.limited) }}
              >
                Precio de lanzamiento por tiempo limitado
              </p>

              {/* CTA */}
              <div className="mt-1 sm:mt-2" style={staggerStyle(STAGGER.cta)}>
                <button
                  onClick={handleFinanciar}
                  className="inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-[15px] font-semibold text-white border-none cursor-pointer rounded-xl transition-opacity hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: BC.primary }}
                >
                  Lo quiero
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — replay */}
      <div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-[3]"
        style={{
          ...staggerStyle(STAGGER.replay),
          pointerEvents: showContent ? 'auto' : 'none',
        }}
      >
        {!skipVideo && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReplay(); }}
            className="flex items-center justify-center bg-transparent border-none cursor-pointer"
            style={{ padding: 0 }}
          >
            <span
              className="flex items-center justify-center rounded-full transition-colors hover:bg-black/15"
              style={{
                width: 56,
                height: 56,
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Play className="w-5 h-5 text-[#1d1d1f]/50 fill-[#1d1d1f]/50" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
