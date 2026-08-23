/**
 * Contenido estático de la landing de equipos seminuevos.
 * Mismo patrón que data/nvidiaData.ts: todo el copy y las URLs en un solo lugar.
 *
 * Los assets viven en S3, nunca en public/ (servir desde public/ ya dejó una
 * landing sin logo en producción, BAL-2598).
 */

export const SEMINUEVOS_ASSETS = 'https://baldecash.s3.amazonaws.com/landings/seminuevos';

export type Grado = 'A' | 'B' | 'C';

export const GRADOS: readonly Grado[] = ['A', 'B', 'C'] as const;

export const PIEZAS = [
  'Carcasa', 'Mousepad', 'Pantalla', 'Teclado',
  'Entradas', 'Cámara', 'Bisagras', 'Batería',
] as const;

/** Slug del archivo en S3: "Cámara" → "camara". */
export function piezaSlug(pieza: string): string {
  return pieza
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
}

/** Ej. ".../inspector/pantalla-b.webp" */
export function inspectorAssetUrl(pieza: string, grado: Grado): string {
  return `${SEMINUEVOS_ASSETS}/inspector/${piezaSlug(pieza)}-${grado.toLowerCase()}.webp`;
}

export const hero = {
  eyebrow: 'Exclusivo',
  title: 'Equipos seminuevos en cuotas sin intereses',
  subtitle: 'Elige el modelo y fináncialo en BaldeCash.',
  ctaLabel: 'Ver catálogo',
  /** Banner de Haru. Mientras sea null se pintan las laptops SVG del prototipo. */
  bannerUrl: null as string | null,
};

export const quees = {
  title: '¿Qué es un equipo seminuevo?',
  /** Se pinta en --azul dentro del título. */
  titleAccent: 'seminuevo?',
  subtitle:
    'Es un equipo de segunda mano que ha sido revisado y probado para volver a estar listo para ti.',
};

export const proceso = {
  title: '¿Cómo es el proceso?',
  titleAccent: 'proceso?',
  pasos: [
    { icon: 'lupa', titulo: 'Explora el catálogo', subtitulo: 'Encuentra el modelo que más te guste' },
    { icon: 'etiqueta', titulo: 'Selecciona el modelo ideal', subtitulo: 'Elige el grado y cuota que más se te acomode' },
    { icon: 'documento', titulo: 'Completa tus datos', subtitulo: 'Llena un formulario de 2 minutos' },
  ],
  bannerAprobacion: {
    lead: 'Cuando tu solicitud se apruebe, accederás a ',
    strong: 'videos de cada unidad disponible',
    tail: ' y podrás elegir exactamente cuál quieres recibir.',
  },
  ctaLabel: 'Ver catálogo',
};

export const about = {
  title: 'Sobre nosotros',
  titleAccent: 'nosotros',
  parrafo:
    'BaldeCash ofrece financiamiento a estudiantes universitarios para acceder a equipos tecnológicos claves para su crecimiento académico y personal.',
  /** Foto del equipo. Slot: mientras sea null, placeholder. */
  fotoEquipoUrl: null as string | null,
  sbsLabel: 'Registrados en:',
  sbsText: 'SBS · Superintendencia de Banca, Seguros y AFP',
  redes: [
    { red: 'instagram' as const, href: 'https://instagram.com/baldecash', handle: '@baldecash' },
    { red: 'facebook' as const, href: 'https://facebook.com/baldecash', handle: '@baldecash' },
    { red: 'tiktok' as const, href: 'https://tiktok.com/@baldecash_2026', handle: '@baldecash_2026' },
    { red: 'whatsapp' as const, href: 'https://wa.me/51958823053', handle: '958823053' },
  ],
};

export const faq = { title: 'Preguntas frecuentes' };

export const whatsapp = {
  href: 'https://wa.me/51958823053',
  ariaLabel: 'Escríbenos por WhatsApp',
};
