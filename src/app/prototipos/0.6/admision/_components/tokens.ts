/**
 * Tokens de marca para el flujo de admisión (port desde automatizacion-admision).
 * Los componentes usan clases Tailwind arbitrarias (p. ej. `text-[#1f2937]`) basadas
 * en estos valores, para no tocar la configuración global de Tailwind.
 */
export const TOKENS = {
  primary: '#4654CD',
  primarySoft: '#ECECFB',
  ink: '#1f2937',
  slate: '#6b7280',
  line: '#e5e7eb',
  red: '#ef4444',
  green: '#16a34a',
  tertiary: '#f59e0b',
} as const;

/** URL del asesor (Blip / WhatsApp). Mejora #7. */
export const BLIP_ADVISOR_URL =
  'https://api.whatsapp.com/send/?phone=51959324808&text&type=phone_number&app_absent=0';
