'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = [
  { label: 'Resumen', href: '#hero' },
  { label: 'Diseño', href: '#design' },
  { label: 'Rendimiento', href: '#performance' },
  { label: 'Pantalla', href: '#display' },
  { label: 'Precio', href: '#financing' },
];

export function StickyNav() {
  const navRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: '600px top',
        onEnter: () => setVisible(true),
        onLeaveBack: () => setVisible(false),
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const sectionIds = ['hero', 'design', 'performance', 'display', 'financing'];
    const triggers: ScrollTrigger[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      }`}
      style={{
        backdropFilter: 'saturate(180%) blur(20px)',
        backgroundColor: 'rgba(251, 251, 253, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="max-w-[980px] mx-auto px-4 h-12 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1d1d1f]">MacBook Neo</span>
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-xs transition-colors ${
                  isActive ? 'text-[#1d1d1f] font-semibold' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <a
          href="#financing"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#financing')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-[#0066CC] text-white text-xs px-4 py-1.5 rounded-full hover:bg-[#004499] transition-colors"
        >
          Financiar
        </a>
      </div>
    </nav>
  );
}
