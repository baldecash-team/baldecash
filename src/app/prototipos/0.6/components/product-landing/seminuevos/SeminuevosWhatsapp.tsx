'use client';

import { whatsapp } from './data/seminuevosData';
import { IconWhatsapp } from './icons/SeminuevosIcons';

export function SeminuevosWhatsapp() {
  return (
    <a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={whatsapp.ariaLabel}
      className="fixed right-[18px] bottom-[18px] z-50 w-14 h-14 rounded-full grid place-items-center text-white transition-transform hover:scale-105"
      style={{ background: '#25D366', boxShadow: '0 8px 22px rgba(37,211,102,.5)' }}
    >
      <IconWhatsapp className="w-7 h-7" />
    </a>
  );
}
