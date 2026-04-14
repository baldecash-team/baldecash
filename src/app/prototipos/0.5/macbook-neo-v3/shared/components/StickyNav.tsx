'use client';

import { useEffect, useState } from 'react';

const navLinks = [
  { label: 'Resumen', href: '#highlights' },
  { label: 'Especificaciones', href: '#specs' },
  { label: 'Comparar', href: '#compare' },
];

export function StickyNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.05);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: 44,
        backdropFilter: visible ? 'saturate(180%) blur(20px)' : 'none',
        backgroundColor: visible ? 'rgba(255,255,255,0.72)' : 'transparent',
        borderBottom: visible ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="mx-auto flex h-full max-w-[980px] items-center justify-between px-4">
        <span
          className="text-[14px] font-semibold tracking-tight"
          style={{ color: '#1d1d1f' }}
        >
          MacBook Neo
        </span>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="cursor-pointer text-[12px] transition-colors hover:text-[#1d1d1f]"
              style={{ color: '#6e6e73' }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#financing"
            className="cursor-pointer rounded-full px-4 py-1 text-[12px] font-medium text-white transition-transform hover:scale-105"
            style={{ backgroundColor: '#0066CC' }}
          >
            Comprar
          </a>
        </div>

        <a
          href="#financing"
          className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-medium text-white md:hidden"
          style={{ backgroundColor: '#0066CC' }}
        >
          Comprar
        </a>
      </div>
    </nav>
  );
}
