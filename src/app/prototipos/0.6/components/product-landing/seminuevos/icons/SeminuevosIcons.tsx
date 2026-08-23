import { Search, Tag, FileText, Video, ShieldCheck, ChevronDown } from 'lucide-react';

// Iconos de UI: los de Lucide, renombrados al dominio de la landing.
export const IconLupa = Search;
export const IconEtiqueta = Tag;
export const IconDocumento = FileText;
export const IconVideo = Video;
export const IconEscudo = ShieldCheck;
export const IconChevron = ChevronDown;

// Iconos de marca: Lucide quitó los de redes sociales, así que van a mano.
interface IconProps { className?: string; }

export function IconWhatsapp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2zm5.8 14.2c-.2.7-1.2 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1a12 12 0 01-6.6-5.8c-.5-.9-.8-1.8-.8-2.6 0-.9.4-1.6.9-2 .2-.2.4-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2 0 .4-.1.6l-.4.5c-.1.2-.3.3-.1.6a8 8 0 003.8 3.3c.3.1.5.1.6-.1l.7-.8c.2-.2.3-.2.6-.1l1.9.9c.3.1.4.2.5.3v1z" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M14 9V7c0-.8.2-1 1-1h2V3h-3c-2.5 0-4 1.5-4 4v2H8v3h2v9h4v-9h2.5l.5-3h-3z" />
    </svg>
  );
}

export function IconTiktok({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16 3c.4 2 1.7 3.4 3.8 3.6v3c-1.4.1-2.7-.3-3.8-1v6.2a5.9 5.9 0 11-5.9-5.9c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 101.9 2.7V3H16z" />
    </svg>
  );
}
