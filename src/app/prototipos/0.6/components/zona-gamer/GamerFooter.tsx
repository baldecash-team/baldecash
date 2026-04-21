'use client';

import Image from 'next/image';
import { Facebook, Instagram } from 'lucide-react';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

interface GamerFooterProps {
  theme: 'dark' | 'light';
}

const LANDING = 'zona-gamer';

const FOOTER_COLS = [
  {
    title: 'Productos',
    links: [
      { label: 'Equipos', href: routes.catalogo(LANDING) },
      { label: 'Accesorios', href: '#accessories' },
      { label: 'Seguros', href: routes.proximamente(LANDING) + '?seccion=seguros' },
      { label: 'Promociones', href: routes.proximamente(LANDING) + '?seccion=promociones' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: routes.proximamente(LANDING) + '?seccion=nosotros' },
      { label: 'Convenios', href: routes.proximamente(LANDING) + '?seccion=convenios' },
      { label: 'Trabaja con nosotros', href: routes.proximamente(LANDING) + '?seccion=trabaja' },
      { label: 'Blog', href: routes.proximamente(LANDING) + '?seccion=blog' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Centro de ayuda', href: routes.proximamente(LANDING) + '?seccion=ayuda' },
      { label: 'FAQ', href: routes.proximamente(LANDING) + '?seccion=faq' },
      { label: 'Estado de solicitud', href: routes.proximamente(LANDING) + '?seccion=estado' },
      { label: 'Contacto', href: routes.proximamente(LANDING) + '?seccion=contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: routes.legal(LANDING, 'terminos-y-condiciones') },
      { label: 'Política de privacidad', href: routes.legal(LANDING, 'politica-de-privacidad') },
      { label: 'Libro de reclamaciones', href: routes.legal(LANDING, 'libro-reclamaciones') },
    ],
  },
];

const SOCIALS = [
  { icon: Facebook, href: 'https://www.facebook.com/baldecash', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/baldecash/', label: 'Instagram' },
];

// TikTok icon (not in lucide-react)
function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.5V7.12a4.83 4.83 0 01-1-.43z" />
    </svg>
  );
}

export function GamerFooter({ theme }: GamerFooterProps) {
  const isDark = theme === 'dark';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const bgDark = isDark ? '#141414' : '#eaeaea';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgSurface = isDark ? '#1e1e1e' : '#f5f5f5';
  const textSecondary = isDark ? '#a0a0a0' : '#555';
  const textMuted = isDark ? '#707070' : '#888';
  const gradient = `linear-gradient(135deg, ${neonPurple}, ${neonCyan})`;

  return (
    <footer className="relative" style={{ background: bgDark, borderTop: `1px solid ${border}`, padding: '0 clamp(16px, 4vw, 24px)' }}>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-30" style={{ background: gradient }} />

      <div className="max-w-[1280px] mx-auto pt-12">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Image
              src={`${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`}
              alt="BaldeCash"
              width={130}
              height={28}
              loading="lazy"
              className="object-contain mb-4"
              style={{ height: 32, width: 'auto' }}
            />
            <p className="text-[13px] mb-4" style={{ color: textMuted }}>
              Financiamiento para estudiantes
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[40px] h-[40px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center no-underline transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    style={{
                      background: bgSurface,
                      border: `1px solid ${border}`,
                      color: textSecondary,
                    }}
                    title={s.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
              <a
                href="https://www.tiktok.com/@baldecash"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[40px] h-[40px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center no-underline transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                style={{
                  background: bgSurface,
                  border: `1px solid ${border}`,
                  color: textSecondary,
                }}
                title="TikTok"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4
                className="text-[11px] font-bold uppercase tracking-[2px] mb-4"
                style={{ fontFamily: "'Share Tech Mono', monospace", color: neonCyan }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] no-underline transition-colors hover:text-[#00ffd5]"
                      style={{ color: textSecondary }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="flex items-center justify-between gap-4 flex-col sm:flex-row py-5"
          style={{ borderTop: `1px solid ${border}` }}
        >
          <p className="text-xs" style={{ color: textMuted }}>
            &copy; 2026 Balde K S.A.C. Todos los derechos reservados.
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(85,85,119,0.6)' }}>
            Empresa supervisada por la SBS
          </p>
        </div>
      </div>
    </footer>
  );
}
