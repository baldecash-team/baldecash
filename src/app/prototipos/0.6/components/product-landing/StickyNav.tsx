'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { navLinks } from './data/v5Data';
import { BC } from './lib/constants';

interface StickyNavV5Props {
  videoEnded: boolean;
  landing?: string;
}

const LOGO_WHITE = 'https://baldecash.s3.amazonaws.com/company/logo.svg';

export default function StickyNav({ videoEnded, landing = 'baldecash-macbook-neo' }: StickyNavV5Props) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.85;
      setScrolledPastHero(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observersRef.current.forEach((obs) => obs.disconnect());
    observersRef.current = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    navLinks.forEach((link) => {
      const el = document.getElementById(link.sectionId);
      if (el) observer.observe(el);
    });
    observersRef.current.push(observer);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on section click
  const handleMobileNavClick = useCallback((sectionId: string) => {
    setMobileMenuOpen(false);
    handleNavClick(sectionId);
  }, [handleNavClick]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* ── Initial header: logo only, visible on hero ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          height: 64,
          paddingTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: videoEnded && !scrolledPastHero ? 1 : 0,
          transition: videoEnded ? 'opacity 0.5s ease 0.3s' : 'opacity 0.2s ease',
          pointerEvents: videoEnded && !scrolledPastHero ? 'auto' : 'none',
        }}
      >
        <button
          onClick={scrollToTop}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={BC.logo}
            alt="BaldeCash"
            style={{ height: 44, objectFit: 'contain' }}
          />
        </button>
      </div>

      {/* ── Sticky nav: single bar, appears after scrolling past hero ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: 56,
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          backgroundColor: 'rgba(29, 29, 31, 0.72)',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          opacity: scrolledPastHero ? 1 : 0,
          transform: scrolledPastHero ? 'translateY(0)' : 'translateY(-100%)',
          transition:
            'opacity 0.36s cubic-bezier(0.4, 0, 0.2, 1), transform 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: scrolledPastHero ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: '0 auto',
            padding: '0 16px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Logo */}
          <button
            onClick={scrollToTop}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src={LOGO_WHITE}
              alt="BaldeCash"
              style={{ height: 34, objectFit: 'contain' }}
            />
          </button>

          {/* Center: Section links (desktop only) */}
          <div
            style={{
              display: 'flex',
              gap: 28,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
            className="v5-nav-links"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <button
                  key={link.sectionId}
                  onClick={() => handleNavClick(link.sectionId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#f5f5f7' : 'rgba(245, 245, 247, 0.5)',
                    padding: '4px 0',
                    transition: 'color 0.3s ease',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.005em',
                  }}
                >
                  {link.label}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 1.5,
                      backgroundColor: '#f5f5f7',
                      borderRadius: 1,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: CTA + Mobile hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <a
              href={`/prototipos/0.6/${landing}/solicitar`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 500,
                color: '#f5f5f7',
                backgroundColor: 'transparent',
                borderRadius: 8,
                padding: '6px 16px',
                border: '1.5px solid rgba(245, 245, 247, 0.5)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s ease, color 0.2s ease',
                lineHeight: '18px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 245, 247, 0.1)'; e.currentTarget.style.borderColor = '#f5f5f7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245, 245, 247, 0.5)'; }}
            >
              Solicitar
            </a>

            {/* Hamburger button (mobile only) */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="v5-hamburger"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                display: 'none',
              }}
              aria-label="Menú"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  y={mobileMenuOpen ? 9 : 3}
                  width="20"
                  height="1.5"
                  rx="0.75"
                  fill="#f5f5f7"
                  style={{
                    transition: 'transform 0.3s ease, y 0.3s ease',
                    transformOrigin: 'center',
                    transform: mobileMenuOpen ? 'rotate(45deg)' : 'rotate(0)',
                  }}
                />
                <rect
                  y={mobileMenuOpen ? 9 : 15.5}
                  width="20"
                  height="1.5"
                  rx="0.75"
                  fill="#f5f5f7"
                  style={{
                    transition: 'transform 0.3s ease, y 0.3s ease',
                    transformOrigin: 'center',
                    transform: mobileMenuOpen ? 'rotate(-45deg)' : 'rotate(0)',
                  }}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className="v5-mobile-menu"
          style={{
            maxHeight: mobileMenuOpen ? 400 : 0,
            opacity: mobileMenuOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease, opacity 0.3s ease',
            backgroundColor: 'rgba(29, 29, 31, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          <div style={{ padding: '8px 16px 16px' }}>
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <button
                  key={link.sectionId}
                  onClick={() => handleMobileNavClick(link.sectionId)}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#f5f5f7' : 'rgba(245, 245, 247, 0.6)',
                    padding: '14px 0',
                    textAlign: 'left',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .v5-nav-links {
              display: none !important;
            }
            .v5-hamburger {
              display: flex !important;
            }
          }
          @media (min-width: 769px) {
            .v5-mobile-menu {
              display: none !important;
            }
          }
        `}</style>
      </nav>
    </>
  );
}
