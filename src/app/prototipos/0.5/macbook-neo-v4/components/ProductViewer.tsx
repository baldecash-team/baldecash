'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { productViewerData } from '../data/v4Data';
import { ASSETS } from '../lib/constants';
import type { MacbookNeoColor } from '../types/v4Types';

// Map item IDs to available images
const ITEM_IMAGES: Record<string, string> = {
  colors: ASSETS.colors.silver, // changes with color selection
  durable: ASSETS.productViews.hero,
  display: ASSETS.productViews.display,
  keyboard: ASSETS.productViews.keyboard,
  touchid: ASSETS.colors.silver,
  camera: ASSETS.productViews.display,
  audio: ASSETS.productViews.keyboard,
  connectivity: ASSETS.productViews.hero,
};

const COLOR_HEX: Record<MacbookNeoColor, string> = {
  silver: '#e3e4e5',
  blush: '#f4c3b5',
  citrus: '#e8d44d',
  indigo: '#4b50b5',
};

export function ProductViewer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeColor, setActiveColor] = useState<MacbookNeoColor>('silver');

  const activeItem = productViewerData.items[activeIndex];

  // Get current image based on active item
  const getCurrentImage = useCallback(() => {
    if (activeItem.id === 'colors') {
      return ASSETS.colors[activeColor];
    }
    return ITEM_IMAGES[activeItem.id] || ASSETS.productViews.hero;
  }, [activeItem.id, activeColor]);

  const goNext = useCallback(
    () => setActiveIndex((i) => (i + 1) % productViewerData.items.length),
    [],
  );
  const goPrev = useCallback(
    () =>
      setActiveIndex(
        (i) => (i - 1 + productViewerData.items.length) % productViewerData.items.length,
      ),
    [],
  );

  return (
    <section id="product-viewer" style={{ backgroundColor: '#fff', color: '#1d1d1f', overflow: 'hidden' }}>
      {/* Section header */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '80px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.003em', lineHeight: 1.08, margin: 0 }}>
            {productViewerData.headline}
          </h2>
          <a
            href="#"
            style={{ fontSize: 14, color: '#0071e3', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            View in your space
            <span style={{ marginLeft: 4 }}>&#x203A;</span>
          </a>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 80px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 0,
          }}
          className="product-viewer-layout"
        >
          {/* Left column: Media display */}
          <div
            className="product-viewer-media"
            style={{
              flex: '0 0 62%',
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#fafafa',
              minHeight: 480,
            }}
          >
            <Image
              key={getCurrentImage()}
              src={getCurrentImage()}
              alt={activeItem.title}
              fill
              className="product-viewer-img"
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 734px) 100vw, 60vw"
              priority
            />
          </div>

          {/* Right column: Controls list */}
          <div
            className="product-viewer-controls"
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {productViewerData.items.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <li
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #d2d2d7',
                      ...(index === 0 ? { borderTop: '1px solid #d2d2d7' } : {}),
                    }}
                  >
                    <button
                      onClick={() => setActiveIndex(index)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: isActive ? '14px 16px 0 16px' : '14px 16px',
                        background: isActive ? '#f5f5f7' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {/* Plus icon */}
                      {!isActive && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          style={{ flexShrink: 0 }}
                        >
                          <circle cx="12" cy="12" r="11.3" stroke="#86868b" strokeWidth="0.8" />
                          <path
                            d="M16 11H13V8a1 1 0 00-2 0v3H8a1 1 0 000 2h3v3a1 1 0 002 0v-3h3a1 1 0 000-2z"
                            fill="#86868b"
                          />
                        </svg>
                      )}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? '#1d1d1f' : '#86868b',
                        }}
                      >
                        {item.label}
                      </span>
                    </button>

                    {/* Expanded content */}
                    {isActive && (
                      <div
                        style={{
                          padding: '8px 16px 16px 16px',
                          backgroundColor: '#f5f5f7',
                          animation: 'pvFadeIn 0.3s ease',
                        }}
                      >
                        <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, color: '#1d1d1f' }}>
                          <strong>{item.title}</strong>{' '}
                          {item.description}
                        </p>

                        {/* Color swatches */}
                        {item.type === 'color-selector' && (
                          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                            {productViewerData.colors.map((color) => (
                              <button
                                key={color.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveColor(color.id);
                                }}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: COLOR_HEX[color.id],
                                  border: activeColor === color.id
                                    ? '2px solid #0071e3'
                                    : '2px solid transparent',
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'border-color 0.2s',
                                  outline: activeColor === color.id
                                    ? '2px solid transparent'
                                    : 'none',
                                  outlineOffset: 2,
                                }}
                                aria-label={color.label}
                              />
                            ))}
                          </div>
                        )}

                        {/* Prev/Next paddle nav */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goPrev();
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: '#e8e8ed',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              transition: 'background-color 0.2s',
                            }}
                            aria-label="Previous"
                          >
                            <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
                              <path
                                d="m20 25c-.384 0-.768-.147-1.061-.44l-5.5-5.5a1.5 1.5 0 010-2.12l5.5-5.5a1.5 1.5 0 012.121 2.12L16.622 18l4.438 4.44a1.5 1.5 0 01-1.06 2.56z"
                                fill="#1d1d1f"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goNext();
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: '#e8e8ed',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              transition: 'background-color 0.2s',
                            }}
                            aria-label="Next"
                          >
                            <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
                              <path
                                d="m22.56 16.94-5.508-5.5a1.5 1.5 0 00-2.112 2.125L19.384 18l-4.444 4.438a1.5 1.5 0 002.112 2.12l5.508-5.5A1.5 1.5 0 0022.56 16.94z"
                                fill="#1d1d1f"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Responsive + animation styles */}
      <style jsx>{`
        @keyframes pvFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .product-viewer-img {
          transition: opacity 0.4s ease;
        }
        @media (max-width: 734px) {
          .product-viewer-layout {
            flex-direction: column !important;
          }
          .product-viewer-media {
            flex: none !important;
            width: 100% !important;
            min-height: 320px !important;
            aspect-ratio: 4 / 3;
          }
          .product-viewer-controls {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
