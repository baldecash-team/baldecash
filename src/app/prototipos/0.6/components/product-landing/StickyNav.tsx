'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { navLinks } from './data/v5Data';
import { BC } from './lib/constants';

interface StickyNavV5Props {
  videoEnded: boolean;
}

const LOGO_WHITE = 'https://baldecash.s3.amazonaws.com/company/logo.svg';

export default function StickyNav({ videoEnded }: StickyNavV5Props) {
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
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: videoEnded && !scrolledPastHero ? 1 : 0,
          transition: 'opacity 0.6s ease',
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
            style={{ height: 36, objectFit: 'contain' }}
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
          height: 48,
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
            padding: '0 24px',
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
              style={{ height: 20, objectFit: 'contain' }}
            />
          </button>

          {/* Center: Section links */}
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
                    fontSize: 12,
                    fontWeight: isActive ? 500 : 400,
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

          {/* Right: CTA */}
          <button
            onClick={() => handleNavClick('financing')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 500,
              color: '#f5f5f7',
              backgroundColor: 'transparent',
              borderRadius: 6,
              padding: '5px 16px',
              border: '1.5px solid rgba(245, 245, 247, 0.5)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s ease, color 0.2s ease',
              lineHeight: '18px',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 245, 247, 0.1)'; e.currentTarget.style.borderColor = '#f5f5f7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245, 245, 247, 0.5)'; }}
          >
            Solicitar
          </button>
        </div>

        <style>{`
          @media (max-width: 1068px) {
            .v5-nav-links {
              display: none !important;
            }
          }
        `}</style>
      </nav>
    </>
  );
}
