'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { navLinks } from '../data/v4Data';

export function StickyNavV4() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('welcome');
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Show nav after scrolling past the hero (~100vh)
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.85;
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    observersRef.current.forEach((obs) => obs.disconnect());
    observersRef.current = [];

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-50% 0px -50% 0px',
    });

    navLinks.forEach((link) => {
      const el = document.getElementById(link.sectionId);
      if (el) observer.observe(el);
    });

    observersRef.current.push(observer);

    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 22px',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.12)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'opacity 0.36s cubic-bezier(0.4, 0, 0.2, 1), transform 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Left: Product name — links to top */}
      <button
        onClick={scrollToTop}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 21,
          fontWeight: 600,
          color: '#f5f5f7',
          whiteSpace: 'nowrap',
          padding: 0,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        MacBook Neo
      </button>

      {/* Center: Section links */}
      <div
        style={{
          display: 'flex',
          gap: 26,
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
        className="sticky-nav-links"
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
                fontWeight: 400,
                color: isActive ? '#f5f5f7' : 'rgba(245, 245, 247, 0.5)',
                padding: '4px 0',
                transition: 'color 0.3s ease',
                position: 'relative',
                whiteSpace: 'nowrap',
                letterSpacing: '0.005em',
              }}
            >
              {link.label}
              {/* Active underline indicator */}
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

      {/* Right: Buy CTA — blue pill */}
      <a
        href="#contrast"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 400,
          color: '#fff',
          backgroundColor: '#0071e3',
          borderRadius: 980,
          padding: '4px 15px',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.2s ease',
          lineHeight: '20px',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0077ED')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0071e3')}
      >
        Buy
      </a>

      {/* Responsive: hide center nav links on smaller screens */}
      <style>{`
        @media (max-width: 1068px) {
          .sticky-nav-links {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
