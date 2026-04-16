'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { productViewerData } from './data/v5Data';
import { ASSETS } from './lib/constants';
import type { MacbookNeoColor } from './types/v5Types';

/* ─── image map ─── */
const ITEM_IMAGES: Record<string, string> = {
  colors: ASSETS.productViewerHD.colors.silver,
  durable: ASSETS.productViewerHD.durable,
  display: ASSETS.productViewerHD.display,
  keyboard: ASSETS.productViewerHD.keyboard,
  touchid: ASSETS.productViewerHD.touchid,
  camera: ASSETS.productViewerHD.camera,
  audio: ASSETS.productViewerHD.audio,
  connectivity: ASSETS.productViewerHD.connectivity,
};

const COLOR_HEX: Record<MacbookNeoColor, string> = {
  silver: '#e3e4e5',
  blush: '#e8d0d0',
  citrus: '#dddc8c',
  indigo: '#596680',
};

/* ─── spring-like cubic bezier (close to spring(1,100,14,0)) ─── */
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_OUT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const VIEWER_HEIGHT_DESKTOP = 760;
const PILL_HEIGHT = 48;
const EXPANDED_WIDTH = 400;

/* ─── Pill icon (+ circle) ─── */
function PillIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11.3" style={{ stroke: '#1d1d1f', fill: 'none' }} />
      <g transform="translate(7 7)" style={{ stroke: 'none', fill: '#1d1d1f' }}>
        <path d="m9 4h-3v-3c0-0.553-0.447-1-1-1s-1 0.447-1 1v3h-3c-0.553 0-1 0.447-1 1s0.447 1 1 1h3v3c0 0.553 0.447 1 1 1s1-0.447 1-1v-3h3c0.553 0 1-0.447 1-1s-0.447-1-1-1" />
      </g>
    </svg>
  );
}

/* ─── Color selector ─── */
function ColorSelector({ activeColor, onSelect }: { activeColor: MacbookNeoColor; onSelect: (c: MacbookNeoColor) => void }) {
  return (
    <div className="flex gap-3 mt-4 justify-center">
      {productViewerData.colors.map((color) => (
        <button
          key={color.id}
          onClick={(e) => { e.stopPropagation(); onSelect(color.id); }}
          className="w-6 h-6 rounded-full p-0 cursor-pointer border-none"
          style={{
            backgroundColor: COLOR_HEX[color.id],
            outline: activeColor === color.id ? '2px solid #1d1d1f' : '1px solid rgba(0,0,0,0.15)',
            outlineOffset: 2,
            transition: 'outline 0.2s ease',
          }}
          aria-label={color.label}
        />
      ))}
    </div>
  );
}

export default function ProductViewer() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<MacbookNeoColor>('silver');
  const [introPlayed, setIntroPlayed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef<number | null>(null);
  const [transitionDir, setTransitionDir] = useState<'in' | 'out-next' | 'out-prev' | null>(null);

  const items = productViewerData.items;
  const isExpanded = expandedIndex !== null;
  const activeItem = expandedIndex !== null ? items[expandedIndex] : null;

  /* ─── Scroll-triggered intro ─── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !introPlayed) {
          setIsVisible(true);
          setIntroPlayed(true);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [introPlayed]);

  /* ─── Get current image ─── */
  const getCurrentImage = useCallback(() => {
    if (!activeItem) return ASSETS.productViewerHD.colors.silver;
    if (activeItem.id === 'colors') return ASSETS.productViewerHD.colors[activeColor];
    return ITEM_IMAGES[activeItem.id] || ASSETS.productViewerHD.durable;
  }, [activeItem, activeColor]);

  /* ─── Expand an item ─── */
  const expandItem = useCallback((index: number) => {
    if (expandedIndex === index) return;
    const prev = expandedIndex;
    prevIndexRef.current = prev;

    if (prev !== null && prev < index) {
      setTransitionDir('out-next');
    } else if (prev !== null && prev > index) {
      setTransitionDir('out-prev');
    } else {
      setTransitionDir('in');
    }

    setExpandedIndex(index);
    setTimeout(() => setTransitionDir(null), 500);
  }, [expandedIndex]);

  /* ─── Navigate ─── */
  const goNext = useCallback(() => {
    if (expandedIndex !== null && expandedIndex < items.length - 1) expandItem(expandedIndex + 1);
  }, [expandedIndex, items.length, expandItem]);

  const goPrev = useCallback(() => {
    if (expandedIndex !== null && expandedIndex > 0) expandItem(expandedIndex - 1);
  }, [expandedIndex, expandItem]);

  /* ─── Close ─── */
  const close = useCallback(() => {
    prevIndexRef.current = expandedIndex;
    setTransitionDir(null);
    setExpandedIndex(null);
  }, [expandedIndex]);

  return (
    <section className="bg-white text-[#1d1d1f]" ref={sectionRef}>
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Headline */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <h2
            className="text-[27px] sm:text-[40px] md:text-[61px] lg:text-[82px] font-semibold tracking-[-0.015em] leading-[1.05] m-0"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {productViewerData.headline}
          </h2>
        </div>

        {/* ─── Main viewer container (image only on mobile) ─── */}
        <div
          className="relative w-full overflow-hidden pv-viewer-container"
          style={{
            borderRadius: 20,
            backgroundColor: '#f5f5f7',
            height: VIEWER_HEIGHT_DESKTOP,
            maxWidth: 1440,
            margin: '0 auto',
          }}
        >
          {/* ── Background hero image ── */}
          <div className="absolute inset-0 z-[1]">
            <Image
              src={ASSETS.productViewerHD.colors.silver}
              alt="MacBook Neo"
              fill
              className="object-contain"
              sizes="(max-width: 980px) 100vw, 980px"
              loading="lazy"
            />
          </div>

          {/* ── Tour media images ── */}
          <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
            {items.map((item, index) => {
              const isCurrent = expandedIndex === index;
              const wasPrev = prevIndexRef.current === index;

              let imgSrc: string;
              if (item.id === 'colors') {
                imgSrc = ASSETS.productViewerHD.colors[activeColor];
              } else {
                imgSrc = ITEM_IMAGES[item.id] || ASSETS.productViewerHD.durable;
              }

              let animStyle: React.CSSProperties = {
                position: 'absolute',
                inset: 0,
                opacity: 0,
                transform: 'scale(0.833) translateX(250px)',
                transition: 'none',
                pointerEvents: 'none',
                display: 'grid',
                placeItems: 'center',
              };

              if (isCurrent) {
                animStyle = {
                  ...animStyle,
                  opacity: 1,
                  transform: 'scale(1) translateX(0)',
                  transition: `opacity 0.4s ${EASE_OUT} 0.15s, transform 0.45s ${EASE_OUT} 0.1s`,
                  zIndex: 2,
                };
              } else if (wasPrev && isExpanded) {
                const exitDir = transitionDir === 'out-prev' ? 250 : -200;
                animStyle = {
                  ...animStyle,
                  opacity: 0,
                  transform: `scale(0.833) translateX(${exitDir}px)`,
                  transition: `opacity 0.3s ease-in, transform 0.35s ease-in`,
                  zIndex: 1,
                };
              } else if (wasPrev && !isExpanded) {
                animStyle = {
                  ...animStyle,
                  opacity: 0,
                  transform: 'scale(1.2)',
                  transition: `opacity 0.25s ease-in, transform 0.3s ease-in`,
                  zIndex: 1,
                };
              }

              return (
                <div key={`tour-${item.id}`} style={animStyle}>
                  <div className="relative w-full h-full">
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 980px) 100vw, 980px"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Close button ── */}
          <button
            onClick={close}
            className="absolute top-5 right-5 z-[20] w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer pv-desktop-only"
            style={{
              backgroundColor: 'rgba(232, 232, 237, 0.7)',
              backdropFilter: 'blur(10px)',
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'scale(1)' : 'scale(0.5)',
              transition: `opacity 0.3s ease, transform 0.3s ${SPRING}`,
              pointerEvents: isExpanded ? 'auto' : 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(210, 210, 215, 0.9)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(232, 232, 237, 0.7)')}
          >
            <X className="w-4 h-4 text-[#1d1d1f]" />
          </button>

          {/* ── Paddle nav (desktop only) ── */}
          <div
            className="absolute z-[15] flex gap-2 pv-desktop-only"
            style={{
              top: '50%',
              right: 20,
              flexDirection: 'column',
              transform: isExpanded ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0)',
              opacity: isExpanded ? 1 : 0,
              transition: isExpanded
                ? `transform 0.4s ${SPRING} 0.1s, opacity 0.3s ease 0.1s`
                : `transform 0.25s ease, opacity 0.2s ease`,
              pointerEvents: isExpanded ? 'auto' : 'none',
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={expandedIndex === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-default"
              style={{ backgroundColor: 'rgba(232, 232, 237, 0.7)', backdropFilter: 'blur(10px)', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(210, 210, 215, 0.9)'; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(232, 232, 237, 0.7)')}
            >
              <ChevronLeft className="w-5 h-5 text-[#1d1d1f]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={expandedIndex === items.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-default"
              style={{ backgroundColor: 'rgba(232, 232, 237, 0.7)', backdropFilter: 'blur(10px)', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(210, 210, 215, 0.9)'; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(232, 232, 237, 0.7)')}
            >
              <ChevronRight className="w-5 h-5 text-[#1d1d1f]" />
            </button>
          </div>

          {/* ── Desktop controls overlay (pills inside viewer) ── */}
          <div
            className="absolute z-[10] pv-desktop-only"
            style={{
              bottom: 40,
              left: 40,
              right: 40,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              alignItems: 'flex-end',
            }}
          >
            {items.map((item, index) => {
              const isItemExpanded = expandedIndex === index;
              const introDelay = 0.6 + index * 0.05;

              return (
                <div
                  key={item.id}
                  className="pv-control-item"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(35px) scale(0.5)',
                    transition: `opacity 0.4s ease ${introDelay}s, transform 0.8s ${SPRING} ${introDelay}s`,
                    width: isItemExpanded ? EXPANDED_WIDTH : 'auto',
                    maxWidth: isItemExpanded ? EXPANDED_WIDTH : 'none',
                    overflow: 'hidden',
                    borderRadius: 18,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 18,
                      backgroundColor: `rgba(${isItemExpanded ? '255,255,255' : '232,232,237'}, ${isItemExpanded ? 0.85 : 0.7})`,
                      backdropFilter: 'saturate(180%) blur(20px)',
                      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                      transition: 'background-color 0.25s linear',
                    }}
                  />

                  {!isItemExpanded && (
                    <button
                      onClick={() => expandItem(index)}
                      className="relative flex items-center gap-2 border-none cursor-pointer w-full"
                      style={{ padding: '10px 14px', background: 'none', height: PILL_HEIGHT }}
                    >
                      <PillIcon />
                      <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#1d1d1f', letterSpacing: '-0.016em' }}>
                        {item.label}
                      </span>
                    </button>
                  )}

                  {isItemExpanded && (
                    <div className="relative" style={{ width: EXPANDED_WIDTH, animation: 'pvContentFadeIn 0.42s ease-out' }}>
                      <div style={{ padding: 20 }}>
                        <p className="text-xs leading-relaxed m-0 text-[#1d1d1f]">
                          <strong className="block mb-1" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.016em' }}>
                            {item.title}
                          </strong>
                          {item.description}
                        </p>
                        {item.type === 'color-selector' && (
                          <ColorSelector activeColor={activeColor} onSelect={setActiveColor} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Mobile controls (below the image) ─── */}
        <div className="pv-mobile-only mt-4">
          {/* Scrollable pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-3"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {items.map((item, index) => {
              const isItemExpanded = expandedIndex === index;
              return (
                <button
                  key={`mob-${item.id}`}
                  onClick={() => {
                    if (isItemExpanded) {
                      close();
                    } else {
                      expandItem(index);
                    }
                  }}
                  className="flex items-center gap-1.5 border-none cursor-pointer flex-shrink-0 rounded-full active:scale-[0.96]"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: isItemExpanded ? '#1d1d1f' : '#f0f0f0',
                    color: isItemExpanded ? '#f5f5f7' : '#1d1d1f',
                    fontSize: 11,
                    fontWeight: 500,
                    transition: 'background-color 0.25s ease, color 0.25s ease',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Expanded content card (below pills) */}
          {activeItem && expandedIndex !== null && (
            <div
              className="rounded-2xl mt-2 overflow-hidden"
              style={{
                backgroundColor: '#f5f5f7',
                animation: 'pvContentFadeIn 0.35s ease-out',
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs leading-relaxed m-0 text-[#1d1d1f] flex-1">
                    <strong className="block mb-1" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.016em' }}>
                      {activeItem.title}
                    </strong>
                    {activeItem.description}
                  </p>
                  <button
                    onClick={close}
                    className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                  >
                    <X className="w-3.5 h-3.5 text-[#1d1d1f]" />
                  </button>
                </div>
                {activeItem.type === 'color-selector' && (
                  <ColorSelector activeColor={activeColor} onSelect={setActiveColor} />
                )}
                {/* Mobile nav */}
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <button
                    onClick={goPrev}
                    disabled={expandedIndex === 0}
                    className="flex items-center gap-1 text-xs font-medium border-none cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-default"
                    style={{ color: '#1d1d1f' }}
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  <span className="text-[10px] text-[#86868b]">{expandedIndex + 1} / {items.length}</span>
                  <button
                    onClick={goNext}
                    disabled={expandedIndex === items.length - 1}
                    className="flex items-center gap-1 text-xs font-medium border-none cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-default"
                    style={{ color: '#1d1d1f' }}
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes pvContentFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pv-control-item {
          will-change: transform, opacity, width;
        }
        .pv-control-item:hover {
          transform: translateY(-2px) !important;
        }
        .pv-mobile-only {
          display: none;
        }
        .pv-mobile-only::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 768px) {
          #product-viewer .pv-viewer-container {
            height: 280px !important;
            border-radius: 16px !important;
          }
          .pv-desktop-only {
            display: none !important;
          }
          .pv-mobile-only {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}
