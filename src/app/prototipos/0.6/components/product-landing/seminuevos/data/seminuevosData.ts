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

// Solo las piezas de las que Haru entregó fotos de los tres grados. Una pieza
// sin su imagen en S3 no se degrada a nada útil: el <img> falla y MediaSlot
// pinta el placeholder gris, así que la tab queda vacía (BAL-3317).
export const PIEZAS = ['Carcasa', 'Pantalla', 'Teclado'] as const;

/** Slug del archivo en S3: "Cámara" → "camara". */
export function piezaSlug(pieza: string): string {
  return pieza
    .toLowerCase()
    .normalize('NFD')
    // Escapes, no los caracteres combinantes literales: son invisibles en el
    // fuente y frágiles ante cambios de encoding.
    .replace(/[\u0300-\u036f]/g, '')
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
  /**
   * Banner de Haru. Mientras sea null se pintan las laptops SVG del prototipo.
   *
   * Son dos archivos, no uno: el de móvil es vertical (900x1599) y el de
   * desktop apaisado (1536x1024). Servir uno solo en ambos deja franjas o
   * recorta el equipo, así que el hero elige por viewport (BAL-3317).
   */
  bannerUrl: `${SEMINUEVOS_ASSETS}/hero/hero-desktop-ad500b09.webp` as string | null,
  // El hash del nombre sale del contenido: al reemplazar la pieza cambia la URL
  // y nadie se queda con la anterior en cache.
  bannerUrlMobile: `${SEMINUEVOS_ASSETS}/hero/hero-mobile-00451355.webp` as string | null,
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
    { icon: 'etiqueta', titulo: 'Selecciona el modelo ideal', subtitulo: 'Elige el grado y cuota que más te convenga' },
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
  fotoEquipoUrl: `${SEMINUEVOS_ASSETS}/about/equipo.webp` as string | null,
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

/**
 * Items del menú de navegación, hardcodeados a pedido del dueño de producto
 * (no se gestionan desde el admin como el resto de landings). Cada uno
 * apunta al id de una sección de esta misma página — ver SeminuevosLanding,
 * que intercepta el click y hace scroll suave.
 */
export const navItems = [
  { label: '¿Qué es?', sectionId: 'que-es' },
  { label: 'Proceso', sectionId: 'proceso' },
  { label: 'Nosotros', sectionId: 'nosotros' },
  { label: 'Preguntas', sectionId: 'faq' },
] as const;

export const whatsapp = {
  href: 'https://wa.me/51958823053',
  ariaLabel: 'Escríbenos por WhatsApp',
};
