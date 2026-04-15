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

  // Detect mobile on mount (no video on <768px)
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) {
      setVideoEnded(true);
      onVideoEnd?.();
    }
  }, []);

  const skipVideo = tier === 'base' || isMobile;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || skipVideo) return;

    const handleEnded = () => { setVideoEnded(true); onVideoEnd?.(); };

    video.addEventListener('ended', handleEnded);

    video.play().catch(() => {
      setVideoEnded(true);
      onVideoEnd?.();
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [tier, skipVideo]);

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
      {/* Poster for mobile / base tier */}
      {skipVideo && (
        <img
          src={isMobile ? ASSETS.hero.posterMobile : ASSETS.hero.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Video for desktop enhanced tier */}
      {!skipVideo && (
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

      {/* Content overlay — left side, hardcoded */}
      <div className="absolute inset-0 z-[3] flex items-center">
        <div className="w-full mx-auto px-5 sm:px-8 md:px-14 lg:px-44">
          <div className="flex justify-start">
            <div className="w-full max-w-[520px] flex flex-col gap-3 sm:gap-4">
              {/* Eyebrow */}
              <p
                className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-[0.2em] m-0"
                style={{ color: BC.primary, ...staggerStyle(STAGGER.eyebrow) }}
              >
                Exclusivo
              </p>

              {/* Headline */}
              <h1
                className="text-3xl sm:text-4xl md:text-6xl lg:text-[80px] font-bold leading-[1.05] m-0"
                style={{ fontFamily: "'Baloo 2', sans-serif", color: isMobile ? '#f5f5f7' : '#1d1d1f', ...staggerStyle(STAGGER.headline) }}
              >
                MacBook Neo llegó a BaldeCash.
              </h1>

              {/* Price */}
              <p
                className="text-xl sm:text-2xl md:text-3xl m-0"
                style={{ color: isMobile ? '#f5f5f7' : '#6e6e73', ...staggerStyle(STAGGER.price) }}
              >
                Desde{' '}
                <span className="font-bold text-2xl sm:text-3xl md:text-5xl" style={{ color: isMobile ? '#03DBD0' : BC.primary }}>
                  S/199
                </span>
                <span style={{ color: isMobile ? '#f5f5f7' : '#6e6e73' }}>/mes</span>
              </p>

              {/* Limited time */}
              <p
                className="text-sm md:text-lg m-0"
                style={{ color: isMobile ? 'rgba(245,245,247,0.8)' : '#86868b', ...staggerStyle(STAGGER.limited) }}
              >
                Precio de lanzamiento por tiempo limitado
              </p>

              {/* CTA */}
              <div className="mt-1 sm:mt-2" style={staggerStyle(STAGGER.cta)}>
                <button
                  onClick={handleFinanciar}
                  className="inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white border-none cursor-pointer rounded-xl transition-opacity hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: BC.primary }}
                >
                  Financiar ahora
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
