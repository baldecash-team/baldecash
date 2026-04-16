'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import { navLinks } from './data/v5Data';
import { BC } from './lib/constants';

interface StickyNavV5Props {
  videoEnded: boolean;
  landing?: string;
}

const LOGO_WHITE = 'https://baldecash.s3.amazonaws.com/company/logo.svg';
const LOGO_DARK = 'https://baldecash.s3.amazonaws.com/company/logo.png';

export default function StickyNav({ videoEnded, landing = 'baldecash-macbook-neo' }: StickyNavV5Props) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.85;
      setScrolledPastHero(window.scrollY > threshold);
    };
    const handleResizeMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    handleResizeMobile();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResizeMobile);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResizeMobile);
    };
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
    if (!el) return;
    const mobile = window.innerWidth < 768;
    const offset = mobile ? 72 : 68;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleMobileNavClick = useCallback((sectionId: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => handleNavClick(sectionId), 200);
  }, [handleNavClick]);

  // ═══════════════════════════════════════════════════════════
  // MOBILE: Navbar blanco estilo home (siempre visible)
  // ═══════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        {/* Backdrop tap-outside-to-close */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/30"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <nav
          className="fixed left-0 right-0 z-50 bg-white shadow-sm transition-all duration-200"
          style={{ top: 0 }}
        >
          <div className="px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button
                onClick={scrollToTop}
                className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
              >
                <img src={LOGO_DARK} alt="BaldeCash" className="h-8 object-contain" />
              </button>

              {/* Hamburger */}
              <button
                className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer border-0 bg-transparent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menú"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-neutral-600" />
                ) : (
                  <Menu className="w-6 h-6 text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="bg-white border-t border-neutral-100 overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className="px-4 py-4 space-y-1"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
                    closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                  }}
                >
                  {navLinks.map((link) => (
                    <motion.button
                      key={link.sectionId}
                      onClick={() => handleMobileNavClick(link.sectionId)}
                      className="block w-full text-left py-3 text-neutral-600 font-medium bg-transparent border-0 cursor-pointer"
                      style={{ transition: 'color 0.2s ease' }}
                      variants={{
                        open: { opacity: 1, y: 0 },
                        closed: { opacity: 0, y: -8 },
                      }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      {link.label}
                    </motion.button>
                  ))}
                  <motion.div
                    className="pt-4 border-t border-neutral-100"
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: -8 },
                    }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        document.getElementById('financing')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center justify-center gap-2 w-full font-medium rounded-lg py-3 px-4 transition-colors cursor-pointer"
                      style={{
                        border: `2px solid ${BC.primary}`,
                        color: BC.primary,
                        backgroundColor: 'transparent',
                      }}
                    >
                      <User className="w-4 h-4" />
                      Solicitar
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DESKTOP: Nav original (oscuro + blur, aparece al scrollear)
  // ═══════════════════════════════════════════════════════════
  return (
    <>
      {/* Initial header: logo centrado sobre hero */}
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
          <img src={BC.logo} alt="BaldeCash" style={{ height: 44, objectFit: 'contain' }} />
        </button>
      </div>

      {/* Sticky nav desktop */}
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
          {/* Logo */}
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
            <img src={LOGO_WHITE} alt="BaldeCash" style={{ height: 34, objectFit: 'contain' }} />
          </button>

          {/* Section links */}
          <div
            style={{
              display: 'flex',
              gap: 28,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
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
                    fontSize: 13,
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

          {/* CTA Solicitar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => document.getElementById('financing')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 247, 0.1)';
                e.currentTarget.style.borderColor = '#f5f5f7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(245, 245, 247, 0.5)';
              }}
            >
              Solicitar
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
