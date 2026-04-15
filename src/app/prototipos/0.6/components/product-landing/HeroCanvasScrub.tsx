'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ArrowRight } from 'lucide-react';
import { heroData } from './data/v5Data';
import { ASSETS, BC } from './lib/constants';

interface HeroV5Props {
  tier: string;
  onVideoEnd?: () => void;
  onVideoReplay?: () => void;
}

export default function HeroCanvasScrub({ tier, onVideoEnd, onVideoReplay }: HeroV5Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Autoplay video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video || tier === 'base') return;

    const handleCanPlay = () => setVideoReady(true);
    const handleEnded = () => { setVideoEnded(true); onVideoEnd?.(); };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    // Attempt autoplay
    video.play().catch(() => {
      // If autoplay blocked, show endframe directly
      setVideoEnded(true);
      onVideoEnd?.();
    });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [tier]);

  const handleReplay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // 1. Hide logo, CTAs, replay button immediately
    setVideoEnded(false);
    onVideoReplay?.();
    // 2. Wait 3 seconds, then play video
    setTimeout(() => {
      video.currentTime = 0;
      video.play().catch(() => {});
    }, 3000);
  }, [onVideoReplay]);

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative h-screen bg-black overflow-hidden">
      {/* Video background (enhanced tier) */}
      {tier !== 'base' && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster={ASSETS.hero.poster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: videoEnded ? 0 : 1,
            transition: 'opacity 0.8s ease',
          }}
        >
          <source src={ASSETS.hero.video} type="video/mp4" />
        </video>
      )}

      {/* Endframe — fades in after video ends (or shown immediately on base tier) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: tier === 'base' || videoEnded ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        <Image
          src={ASSETS.hero.endframe}
          alt="MacBook Neo"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* CTA overlay — appears after video ends, positioned below video text */}
      <div
        className="absolute z-[3] left-0 right-0 flex flex-col items-center gap-3"
        style={{
          bottom: '18%',
          opacity: videoEnded || tier === 'base' ? 1 : 0,
          transform: videoEnded || tier === 'base' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
        }}
      >
        <button
          onClick={() => handleScrollTo(heroData.ctaPrimary.scrollTo)}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-all border-none cursor-pointer rounded-lg shadow-sm"
          style={{ backgroundColor: BC.primary }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BC.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BC.primary)}
        >
          {heroData.ctaPrimary.label}
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleScrollTo(heroData.ctaSecondary.scrollTo)}
          className="inline-flex items-center text-sm font-normal hover:underline bg-transparent border-none cursor-pointer"
          style={{ color: BC.secondary }}
        >
          {heroData.ctaSecondary.label}
          <span className="ml-1">&rsaquo;</span>
        </button>
      </div>

      {/* Bottom bar — replay + scroll indicator */}
      <div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-[3]"
        style={{
          opacity: videoEnded || tier === 'base' ? 1 : 0,
          transition: 'opacity 0.6s ease 0.3s',
          pointerEvents: videoEnded || tier === 'base' ? 'auto' : 'none',
        }}
      >
        {tier !== 'base' && (
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
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Play className="w-5 h-5 text-[#1d1d1f]/60 fill-[#1d1d1f]/60" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
