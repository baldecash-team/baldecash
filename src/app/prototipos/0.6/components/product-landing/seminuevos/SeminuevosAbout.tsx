'use client';

import { MediaSlot } from './MediaSlot';
import { about } from './data/seminuevosData';
import {
  IconEscudo, IconInstagram, IconFacebook, IconTiktok, IconWhatsapp,
} from './icons/SeminuevosIcons';

const RED_ICONS = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  tiktok: IconTiktok,
  whatsapp: IconWhatsapp,
} as const;

const RED_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
} as const;

export function SeminuevosAbout() {
  const titleBase = about.title.replace(about.titleAccent, '').trim();

  return (
    <section className="px-[22px] py-12" style={{ background: '#fff' }}>
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-extrabold text-center" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>
          {titleBase} <span style={{ color: 'var(--azul)' }}>{about.titleAccent}</span>
        </h2>

        <p className="mt-3 text-center" style={{ color: '#5b5c6b', fontSize: '15px', lineHeight: 1.6 }}>
          {about.parrafo}
        </p>

        <div className="mt-6 max-w-[520px] mx-auto">
          <MediaSlot
            src={about.fotoEquipoUrl}
            alt="Equipo de BaldeCash"
            aspectRatio="16/10"
            className="!rounded-[18px]"
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-[13px]" style={{ color: 'var(--tenue)' }}>{about.sbsLabel}</span>
          <span
            className="inline-flex items-center gap-2 rounded-[12px] px-3 py-2"
            style={{ background: 'var(--lavanda)', color: 'var(--navy)' }}
          >
            <IconEscudo className="w-4 h-4" />
            <span className="text-[12.5px] font-semibold">{about.sbsText}</span>
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {about.redes.map((r) => {
            const Icon = RED_ICONS[r.red];
            return (
              <a
                key={r.red}
                data-testid="about-social"
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${RED_LABELS[r.red]}: ${r.handle}`}
                className="inline-flex items-center gap-2 min-h-11 rounded-[26px] px-3.5 py-2 cursor-pointer transition-colors hover:bg-[#e8e9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2"
                style={{ background: '#f4f5f8', color: 'var(--navy)' }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[13px] font-semibold">{r.handle}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
