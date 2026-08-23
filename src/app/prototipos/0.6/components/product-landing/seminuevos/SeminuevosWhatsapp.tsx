'use client';

import { whatsapp } from './data/seminuevosData';
import { IconWhatsapp } from './icons/SeminuevosIcons';

export interface SeminuevosWhatsappProps {
  /**
   * URL del botón, tal como la configura el admin en el componente `cta` de
   * la landing (config.buttons.whatsapp.url). Si no llega (landing sin ese
   * componente configurado, o falla la carga), cae al número fijo de
   * data/seminuevosData.ts para que el botón nunca quede roto.
   */
  href?: string;
}

export function SeminuevosWhatsapp({ href }: SeminuevosWhatsappProps) {
  return (
    <a
      href={href || whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={whatsapp.ariaLabel}
      className="fixed right-[18px] bottom-[18px] z-50 w-14 h-14 rounded-full grid place-items-center text-white cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2"
      style={{ background: '#25D366', boxShadow: '0 8px 22px rgba(37,211,102,.5)' }}
    >
      <IconWhatsapp className="w-7 h-7" />
    </a>
  );
}
