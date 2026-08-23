# Landing especial "Equipos seminuevos" — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el index de la landing especial de equipos seminuevos, fiel al prototipo `mobile-baldecash.html` de Haru.

**Architecture:** Patrón NVIDIA — contenido estático centralizado en un archivo `data/`, `footerData` recibido por props desde `LandingPageClient` (sin fetch propio), footer compartido. Detección por `landingId` en el index y en el preview. El catálogo y el detalle son los genéricos existentes, sin modificación.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (sin `tailwind.config`, todo en `globals.css`) · Jest + Testing Library · `next/font/google` (Baloo 2)

**Spec:** `docs/superpowers/specs/2026-08-23-landing-seminuevos-design.md`

## Global Constraints

- **Repo:** `C:\Users\tecnico\Documents\projects\baldecash\baldecash`. Rama: `feat/landing-seminuevos`.
- **Tests:** Jest, no Vitest. `npm test`. Los tests van en `__tests__/` junto al código.
- **Dev server:** `npm run dev` → puerto **3001**. URL local: `http://localhost:3001/prototipos/0.6/{slug}`.
- **Landing id provisional:** `999`. Cuando llegue el real se cambia **solo** en `utils/landingIds.ts`.
- **Slug de trabajo en local:** `seminuevos`.
- **Assets a S3**, nunca a `public/`. Base: `https://baldecash.s3.amazonaws.com/landings/seminuevos`.
- **Fuente:** Baloo 2, pesos 400/500/600/700/800.
- **Tokens de color** (del `:root` de Haru): `--azul #4654CD` · `--azul2 #5a63e0` · `--aqua #03DBD0` · `--navy #151744` · `--lavanda #EEF0FC` · `--borde #E8E8EE` · `--tenue #8A8A99` · sombra `0 8px 24px rgba(21,23,68,.07)`.
- **Copy:** en español, sin mexicanismos. Sin emojis en la UI — iconos SVG.
- **Mobile-first.** Sin diseño de escritorio propio: columnas centradas por `max-width`.
- **No se toca** pricing, catálogo, detalle, `/solicitar`, ni se agregan endpoints.
- **Prohibido `npm run build`** salvo pedido explícito.

---

## Estructura de archivos

### Se crean

```
src/app/prototipos/0.6/components/product-landing/seminuevos/
├── SeminuevosLanding.tsx            orquestador delgado; único que sabe qué viene de BD
├── data/seminuevosData.ts           todo el contenido estático + URLs de S3
├── SeminuevosHero.tsx               hero + slot de banner + 4 laptops SVG de fallback
├── SeminuevosInspector.tsx          matriz 8 piezas × 3 grados (la pieza más grande)
├── SeminuevosProceso.tsx            3 pasos + banner de aprobación + CTA
├── SeminuevosAbout.tsx              texto + foto (slot) + SBS + 4 redes
├── SeminuevosFaq.tsx                datos de BD, acordeón de Haru
├── SeminuevosWhatsapp.tsx           botón flotante
├── MediaSlot.tsx                    img/video/placeholder según extensión
├── icons/SeminuevosIcons.tsx        SVG del prototipo como componentes
└── __tests__/                       tests por unidad
```

### Se modifican

| Archivo | Cambio |
|---|---|
| `utils/landingIds.ts` | + `SEMINUEVOS: 999` |
| `[[...slug]]/LandingPageClient.tsx` | + rama tras la de NVIDIA (~línea 484) |
| `preview/[[...id]]/PreviewPageClient.tsx` | + rama tras la de MacBook Neo (~línea 400) |
| `components/hero/Navbar.tsx` | + prop opcional `landingId` + CTA "Ver catálogo" |

### Orden de tareas

Cada tarea deja algo verificable en pantalla. Las secciones (3-7) son independientes entre sí:
se pueden hacer en cualquier orden o en paralelo una vez cerrada la Tarea 2.

| # | Tarea | Depende de |
|---|---|---|
| 1 | Andamiaje: id, ramas, landing mínima | — |
| 2 | Fundaciones: tokens, fuente, `MediaSlot`, iconos | 1 |
| 3 | Hero | 2 |
| 4 | Inspector | 2 |
| 5 | Proceso | 2 |
| 6 | Sobre nosotros | 2 |
| 7 | FAQ | 2 |
| 8 | Footer + WhatsApp | 3-7 |
| 9 | Navbar: montaje + CTA "Ver catálogo" | 1 |
| 10 | Verificación end-to-end | 1-9 |

> **Nota sobre el header:** el Navbar del index lo monta `HeroSection`, por el que esta
> landing **no pasa**. Hasta la Task 9 la landing se ve **sin header** — es lo esperado,
> no un defecto. La Task 9 lo monta en el orquestador (mismo criterio que NVIDIA, que
> tiene su propio `<header>` inline).

---

## Task 1: Andamiaje — id, ramas de detección y landing mínima

Objetivo: que `/{slug}` renderice un componente propio en vez del `HeroSection` genérico.

**Files:**
- Modify: `src/app/prototipos/0.6/utils/landingIds.ts`
- Modify: `src/app/prototipos/0.6/[[...slug]]/LandingPageClient.tsx` (tras la rama NVIDIA, ~484)
- Modify: `src/app/prototipos/0.6/preview/[[...id]]/PreviewPageClient.tsx` (tras la rama MacBook Neo, ~400)
- Create: `src/app/prototipos/0.6/components/product-landing/seminuevos/SeminuevosLanding.tsx`
- Test: `src/app/prototipos/0.6/utils/__tests__/landingIds.seminuevos.test.ts`

**Interfaces:**
- Produces: `LANDING_IDS.SEMINUEVOS` (number) · `SeminuevosLanding` con props
  `{ footerData?: FooterData | null; landing?: string; previewBannerOffset?: number; promoBannerData?: PromoBannerData | null; faqData?: FaqData | null }`

- [ ] **Step 1: Escribir el test que falla**

`src/app/prototipos/0.6/utils/__tests__/landingIds.seminuevos.test.ts`:

```ts
import { LANDING_IDS } from '../landingIds';

describe('LANDING_IDS.SEMINUEVOS', () => {
  it('está definido y es un número', () => {
    expect(typeof LANDING_IDS.SEMINUEVOS).toBe('number');
  });

  it('no colisiona con los ids de las otras landings especiales', () => {
    const ids = Object.values(LANDING_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- landingIds.seminuevos`
Expected: FAIL — `Property 'SEMINUEVOS' does not exist on type`.

- [ ] **Step 3: Agregar la constante**

En `utils/landingIds.ts`, dentro de `LANDING_IDS`, tras `NVIDIA: 168,`:

```ts
  /**
   * Landing de equipos seminuevos. ID PROVISIONAL — reemplazar por el real
   * cuando lo asigne el admin. Es el único lugar donde vive este número.
   */
  SEMINUEVOS: 999,
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- landingIds.seminuevos`
Expected: PASS, 2 tests.

- [ ] **Step 5: Crear la landing mínima**

`components/product-landing/seminuevos/SeminuevosLanding.tsx`:

```tsx
'use client';

import { Footer } from '../../hero/Footer';
import type { FooterData, PromoBannerData } from '../../../types/hero';
import type { FaqData } from '../../../types/hero';

export interface SeminuevosLandingProps {
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
  faqData?: FaqData | null;
}

export default function SeminuevosLanding({
  footerData,
  landing = 'seminuevos',
}: SeminuevosLandingProps) {
  return (
    <div className="seminuevos-landing min-h-screen">
      <main>
        <p data-testid="seminuevos-placeholder">Landing seminuevos</p>
      </main>
      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Agregar la rama en el index**

En `[[...slug]]/LandingPageClient.tsx`, inmediatamente **después** del bloque `if (heroData?.landingId === LANDING_IDS.NVIDIA) { ... }`:

```tsx
  // Landing de equipos seminuevos — patrón NVIDIA: HOME especializado, detección por landingId.
  if (heroData?.landingId === LANDING_IDS.SEMINUEVOS) {
    return (
      <div
        style={{
          '--color-primary': heroData?.primaryColor || '#4654CD',
          '--color-secondary': heroData?.secondaryColor || '#03DBD0',
        } as React.CSSProperties}
      >
        {showPreviewBanner && <PreviewBanner landingSlug={slug} />}
        <SeminuevosLanding
          footerData={mergedFooterData}
          landing={slug}
          previewBannerOffset={showPreviewBanner ? previewBannerHeight : 0}
          promoBannerData={heroData?.promoBannerData}
          faqData={mergedFaq}
        />
      </div>
    );
  }
```

Y el import junto a los demás componentes de landing:

```tsx
import SeminuevosLanding from '../components/product-landing/seminuevos/SeminuevosLanding';
```

> **`mergedFaq`, no `heroData.faqData`.** El archivo ya calcula un `mergedFaq`
> (`LandingPageClient.tsx:233-251`) que aplica los overrides del preview sobre las FAQ
> de BD. Pasar el campo crudo haría que el preview del admin no reflejara los cambios
> sin guardar. La variable ya existe en scope; los demás call sites la usan (líneas 426, 521).

- [ ] **Step 7: Agregar la rama en el preview**

En `preview/[[...id]]/PreviewPageClient.tsx`, después del bloque `if (isProductLanding) { ... }`:

```tsx
  // Landing de equipos seminuevos.
  if (heroData.landingId === LANDING_IDS.SEMINUEVOS) {
    return (
      <div
        style={{
          '--color-primary': heroData.primaryColor || '#4654CD',
          '--color-secondary': heroData.secondaryColor || '#03DBD0',
        } as React.CSSProperties}
      >
        <PreviewBanner landingSlug={landingSlug} landingId={heroData.landingId} />
        <SeminuevosLanding
          footerData={mergedFooterData}
          landing={landingSlug}
          previewBannerOffset={24}
          promoBannerData={heroData.promoBannerData}
          faqData={mergedFaq}
        />
      </div>
    );
  }
```

Más el mismo import. Acá `mergedFaq` ya existe en `PreviewPageClient.tsx:237` — y usarlo
importa todavía más que en el index, porque el preview es justamente donde se editan las
FAQ sin guardar.

> Este archivo hoy **solo** contempla MacBook Neo; por eso NVIDIA y Zona Gamer se ven
> genéricas en el preview del admin. Agregarlo acá desde el arranque es intencional.

- [ ] **Step 8: Verificar en el navegador**

Run: `npm run dev`
Abrir `http://localhost:3001/prototipos/0.6/seminuevos`.

Expected: se ve "Landing seminuevos" y el footer.

Si la landing **no existe en la BD local**, `heroData` es `null` y cae en `NotFoundContent`.
En ese caso, para desbloquear el desarrollo, forzar temporalmente la condición a `true`
y **revertirlo antes del commit**. Anotar el hecho al reportar la tarea.

- [ ] **Step 9: Commit**

```bash
git add src/app/prototipos/0.6/utils/landingIds.ts \
        src/app/prototipos/0.6/utils/__tests__/landingIds.seminuevos.test.ts \
        src/app/prototipos/0.6/[[...slug]]/LandingPageClient.tsx \
        "src/app/prototipos/0.6/preview/[[...id]]/PreviewPageClient.tsx" \
        src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): andamiaje de la landing especial

Agrega LANDING_IDS.SEMINUEVOS (id provisional 999) y las ramas de
detección en el index y en el preview del admin."
```

---

## Task 2: Fundaciones — tokens, fuente, MediaSlot e iconos

Objetivo: la base compartida por todas las secciones.

**Files:**
- Create: `.../seminuevos/data/seminuevosData.ts`
- Create: `.../seminuevos/MediaSlot.tsx`
- Create: `.../seminuevos/icons/SeminuevosIcons.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/MediaSlot.test.tsx`

**Interfaces:**
- Consumes: `SeminuevosLanding` (Task 1)
- Produces:
  - `SEMINUEVOS_ASSETS: string` — base de S3
  - `MediaSlot` con props `{ src?: string | null; alt: string; className?: string; aspectRatio?: string }`
  - `inspectorAssetUrl(pieza: string, grado: Grado): string`
  - `type Grado = 'A' | 'B' | 'C'`
  - `PIEZAS: readonly string[]` (8 items)
  - Iconos: `IconLupa`, `IconEtiqueta`, `IconDocumento`, `IconVideo`, `IconEscudo`, `IconChevron`, `IconWhatsapp`, `IconInstagram`, `IconFacebook`, `IconTiktok`

- [ ] **Step 1: Escribir el test que falla**

`.../seminuevos/__tests__/MediaSlot.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MediaSlot } from '../MediaSlot';

describe('MediaSlot', () => {
  it('muestra el placeholder cuando no hay src', () => {
    render(<MediaSlot alt="Carcasa Grado A" />);
    expect(screen.getByTestId('media-slot-placeholder')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renderiza una imagen cuando el src es .webp', () => {
    render(<MediaSlot src="https://s3/x/carcasa-a.webp" alt="Carcasa Grado A" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://s3/x/carcasa-a.webp');
    expect(img).toHaveAttribute('alt', 'Carcasa Grado A');
  });

  it('renderiza un video cuando el src es .mp4', () => {
    const { container } = render(<MediaSlot src="https://s3/x/carcasa-a.mp4" alt="Carcasa" />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('muted');
  });

  it('vuelve al placeholder si la imagen falla al cargar', () => {
    render(<MediaSlot src="https://s3/x/roto.webp" alt="Rota" />);
    screen.getByRole('img').dispatchEvent(new Event('error'));
    expect(screen.getByTestId('media-slot-placeholder')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- MediaSlot`
Expected: FAIL — `Cannot find module '../MediaSlot'`.

- [ ] **Step 3: Implementar MediaSlot**

`.../seminuevos/MediaSlot.tsx`:

```tsx
'use client';

import { useState } from 'react';

const VIDEO_EXT = /\.(mp4|webm)(\?.*)?$/i;

export interface MediaSlotProps {
  /** URL en S3. Si falta o falla, se muestra el placeholder. */
  src?: string | null;
  alt: string;
  className?: string;
  /** Ej. '16/10'. Por defecto lo define el contenedor. */
  aspectRatio?: string;
}

/**
 * Slot de media para los assets que entrega Haru. Mientras el archivo no exista
 * en S3, muestra el placeholder con el gradiente del prototipo. Cuando el asset
 * se sube, la landing lo toma sin tocar código.
 */
export function MediaSlot({ src, alt, className = '', aspectRatio }: MediaSlotProps) {
  const [failed, setFailed] = useState(false);
  const style = aspectRatio ? { aspectRatio } : undefined;

  if (!src || failed) {
    return (
      <div
        data-testid="media-slot-placeholder"
        role="img"
        aria-label={alt}
        className={`rounded-[14px] bg-[linear-gradient(160deg,#f7f7fb,#ececf4)] ${className}`}
        style={style}
      />
    );
  }

  if (VIDEO_EXT.test(src)) {
    return (
      <video
        src={src}
        aria-label={alt}
        muted
        loop
        playsInline
        autoPlay
        onError={() => setFailed(true)}
        className={`rounded-[14px] object-cover w-full ${className}`}
        style={style}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- assets de S3 con nombres dinámicos
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-[14px] object-cover w-full ${className}`}
      style={style}
    />
  );
}
```

> Si el test del `<video muted>` falla: React no siempre refleja `muted` como
> atributo del DOM. En ese caso, cambiar el assert a
> `expect(video).toHaveProperty('muted', true)`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- MediaSlot`
Expected: PASS, 4 tests.

- [ ] **Step 5: Crear el archivo de datos**

`.../seminuevos/data/seminuevosData.ts`:

```ts
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
```

- [ ] **Step 6: Crear los iconos**

**Convención del repo** (`CLAUDE.md`): los iconos salen de `lucide-react`, que ya es
dependencia. Los del prototipo tienen equivalente casi 1:1 — el trazo de Haru es
evidentemente estilo Lucide (`stroke-width` 1.8, `stroke-linecap: round`).

`.../seminuevos/icons/SeminuevosIcons.tsx` re-exporta los de Lucide con el nombre del
dominio, y solo dibuja a mano los de marcas, que Lucide no incluye:

```tsx
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
```

- [ ] **Step 7: Aplicar fuente y tokens en el orquestador**

Reemplazar `SeminuevosLanding.tsx` por:

```tsx
'use client';

import { Baloo_2 } from 'next/font/google';
import { Footer } from '../../hero/Footer';
import type { FooterData, PromoBannerData, FaqData } from '../../../types/hero';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-baloo',
});

export interface SeminuevosLandingProps {
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
  faqData?: FaqData | null;
}

export default function SeminuevosLanding({
  footerData,
  landing = 'seminuevos',
}: SeminuevosLandingProps) {
  return (
    <div className={`${baloo.variable} seminuevos-landing min-h-screen antialiased`}>
      <style>{`
        .seminuevos-landing{
          --azul:#4654CD; --azul2:#5a63e0; --aqua:#03DBD0; --navy:#151744;
          --lavanda:#EEF0FC; --borde:#E8E8EE; --tenue:#8A8A99;
          --sombra:0 8px 24px rgba(21,23,68,.07);
          font-family: var(--font-baloo), system-ui, sans-serif;
          color: var(--navy);
          background: #fff;
        }
        .seminuevos-landing button,
        .seminuevos-landing input { font-family: inherit; }
      `}</style>

      <main>
        <p data-testid="seminuevos-placeholder">Landing seminuevos</p>
      </main>

      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>
    </div>
  );
}
```

> El scoping por `.seminuevos-landing` (patrón de Zona Gamer) evita que la fuente
> y los tokens se filtren al resto del sitio.

- [ ] **Step 8: Correr toda la suite**

Run: `npm test -- seminuevos`
Expected: PASS. Verificar en `http://localhost:3001/prototipos/0.6/seminuevos` que el texto se ve en Baloo 2.

- [ ] **Step 9: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): fundaciones — tokens, Baloo 2, MediaSlot e iconos"
```

---

## Task 3: Hero

**Files:**
- Create: `.../seminuevos/SeminuevosHero.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/SeminuevosHero.test.tsx`

**Interfaces:**
- Consumes: `hero` y `MediaSlot` (Task 2)
- Produces: `SeminuevosHero` con props `{ catalogUrl: string }`

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import { SeminuevosHero } from '../SeminuevosHero';

describe('SeminuevosHero', () => {
  it('muestra el copy del prototipo', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByText('Exclusivo')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Equipos seminuevos en cuotas sin intereses/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Elige el modelo y fináncialo en BaldeCash.')).toBeInTheDocument();
  });

  it('el CTA apunta al catálogo de la landing', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByRole('link', { name: /Ver catálogo/i }))
      .toHaveAttribute('href', '/seminuevos/catalogo');
  });

  it('pinta las laptops SVG cuando no hay banner', () => {
    const { container } = render(<SeminuevosHero catalogUrl="/x" />);
    expect(container.querySelectorAll('[data-testid="hero-laptop"]')).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- SeminuevosHero`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar el hero**

```tsx
'use client';

import { MediaSlot } from './MediaSlot';
import { hero } from './data/seminuevosData';

/** Las 4 laptops decorativas del prototipo: color, posición y rotación. */
const LAPTOPS = [
  { fill: '#d9dbe2', className: 'w-[150px] top-[8%] left-1/2 -translate-x-1/2 rotate-[-3deg]' },
  { fill: '#e6c3cc', className: 'w-[120px] top-[26%] right-[4%] rotate-[8deg]' },
  { fill: '#d9d987', className: 'w-[120px] bottom-[24%] left-[3%] rotate-[-8deg]' },
  { fill: '#6b6fce', className: 'w-[130px] bottom-[6%] left-1/2 -translate-x-1/2 rotate-[4deg]' },
];

function LaptopShape({ fill, className }: { fill: string; className: string }) {
  return (
    <svg
      data-testid="hero-laptop"
      viewBox="0 0 120 84"
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
      style={{ filter: 'drop-shadow(0 16px 22px rgba(20,25,60,.18))' }}
    >
      <rect x="14" y="6" width="92" height="58" rx="6" fill={fill} />
      <circle cx="60" cy="35" r="8" fill="#ffffff" opacity=".35" />
      <rect x="4" y="66" width="112" height="9" rx="4.5" fill={fill} opacity=".85" />
    </svg>
  );
}

export function SeminuevosHero({ catalogUrl }: { catalogUrl: string }) {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-center px-[22px] py-[18px] text-center"
      style={{
        background: 'linear-gradient(180deg,#fdfdff,#e9ebf3)',
        // El prototipo restaba 65px (su header). Acá se resta la altura real que
        // publica el Navbar, que varía si hay banner promocional.
        minHeight: 'calc(100svh - var(--header-total-height, 6.5rem))',
      }}
    >
      {hero.bannerUrl ? (
        <MediaSlot
          src={hero.bannerUrl}
          alt="Equipos seminuevos BaldeCash"
          className="absolute inset-0 h-full !rounded-none"
        />
      ) : (
        LAPTOPS.map((l, i) => <LaptopShape key={i} {...l} />)
      )}

      <div
        className="relative z-[2] w-full max-w-[600px] mx-auto py-10"
        style={{
          background:
            'radial-gradient(ellipse at center,rgba(255,255,255,.85) 55%,rgba(255,255,255,0))',
        }}
      >
        <p
          className="text-[13px] font-semibold uppercase tracking-[2px] mb-2"
          style={{ color: 'var(--aqua)' }}
        >
          {hero.eyebrow}
        </p>

        <h1
          className="font-extrabold leading-[1.06] tracking-[-1px]"
          style={{ fontSize: 'clamp(30px,8vw,50px)' }}
        >
          {hero.title}
        </h1>

        <p
          className="mt-3 font-medium"
          style={{ fontSize: 'clamp(16px,4.4vw,20px)', color: '#5b5c6b' }}
        >
          {hero.subtitle}
        </p>

        <a
          href={catalogUrl}
          className="inline-flex items-center gap-2 mt-7 rounded-[30px] px-6 py-3 text-white font-semibold text-[15px]"
          style={{
            background: 'linear-gradient(135deg,#5a63e0,#03DBD0)',
            boxShadow: '0 10px 24px rgba(90,99,224,.35)',
          }}
        >
          {hero.ctaLabel}
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- SeminuevosHero`
Expected: PASS, 3 tests.

- [ ] **Step 5: Montarlo en el orquestador**

En `SeminuevosLanding.tsx`: importar `SeminuevosHero` y `routes`, y reemplazar el `<p data-testid=...>` por:

```tsx
        <SeminuevosHero catalogUrl={routes.catalogo(landing)} />
```

Import: `import { routes } from '../../../utils/routes';`

> **Verificado:** `catalogo(landing: string, query?: string): string` existe en
> `utils/routes.ts:27` y se exporta dentro del objeto `routes` (línea 194).
> Ya respeta el `BASE_PATH`, así que no hay que anteponerle nada.

- [ ] **Step 6: Verificar en el navegador**

Abrir `http://localhost:3001/prototipos/0.6/seminuevos` en viewport móvil (375px).
Expected: hero a pantalla completa, 4 laptops de colores, texto legible sobre ellas, CTA que navega al catálogo.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): hero con slot de banner y laptops SVG de fallback"
```

---

## Task 4: Inspector "¿Qué es un equipo seminuevo?"

La sección más grande. Matriz de 8 piezas × 3 grados = 24 estados.

**Files:**
- Create: `.../seminuevos/SeminuevosInspector.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/SeminuevosInspector.test.tsx`

**Interfaces:**
- Consumes: `PIEZAS`, `GRADOS`, `Grado`, `inspectorAssetUrl`, `quees` (Task 2); `MediaSlot` (Task 2)
- Produces: `SeminuevosInspector` (sin props)

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeminuevosInspector } from '../SeminuevosInspector';

describe('SeminuevosInspector', () => {
  it('arranca en la primera pieza y grado A', () => {
    render(<SeminuevosInspector />);
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Carcasa · Grado A');
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('1 / 8');
  });

  it('cambia de grado al tocar una pill', async () => {
    render(<SeminuevosInspector />);
    await userEvent.click(screen.getByRole('button', { name: 'Grado B' }));
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Carcasa · Grado B');
  });

  it('cambia de pieza al tocar una tab', async () => {
    render(<SeminuevosInspector />);
    await userEvent.click(screen.getByRole('button', { name: 'Teclado' }));
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Teclado · Grado A');
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('4 / 8');
  });

  it('avanza y retrocede de forma circular', async () => {
    render(<SeminuevosInspector />);
    // Desde la primera, "Anterior" lleva a la última.
    await userEvent.click(screen.getByRole('button', { name: /Anterior/i }));
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('8 / 8');
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Batería · Grado A');
    // Desde la última, "Siguiente" vuelve a la primera.
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('1 / 8');
  });

  it('apunta el asset a la combinación pieza-grado', async () => {
    render(<SeminuevosInspector />);
    await userEvent.click(screen.getByRole('button', { name: 'Grado C' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pantalla' }));
    expect(screen.getByRole('img')).toHaveAttribute(
      'src', expect.stringContaining('pantalla-c.webp')
    );
  });

  it('marca la pieza y el grado activos con aria-pressed', async () => {
    render(<SeminuevosInspector />);
    expect(screen.getByRole('button', { name: 'Grado A' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Grado B' }));
    expect(screen.getByRole('button', { name: 'Grado A' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Grado B' })).toHaveAttribute('aria-pressed', 'true');
  });
});
```

> El test del asset asume que `MediaSlot` renderiza `<img>` porque la URL termina
> en `.webp`. Con el placeholder no habría `role="img"` con `src` — por eso el
> assert busca el atributo.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- SeminuevosInspector`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar el inspector**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { MediaSlot } from './MediaSlot';
import { PIEZAS, GRADOS, inspectorAssetUrl, quees, type Grado } from './data/seminuevosData';

export function SeminuevosInspector() {
  const [grado, setGrado] = useState<Grado>('A');
  const [pieza, setPieza] = useState(0);

  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Centra la tab activa en el strip. El prototipo lo hacía recalculando
  // scrollLeft porque reescribía el DOM entero; con estado de React alcanza esto.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [pieza]);

  const total = PIEZAS.length;
  const prev = () => setPieza((p) => (p - 1 + total) % total);
  const next = () => setPieza((p) => (p + 1) % total);

  const piezaActual = PIEZAS[pieza];
  const titleBase = quees.title.replace(quees.titleAccent, '').trim();

  return (
    <section className="px-[22px] py-12 bg-white">
      <div className="max-w-[720px] mx-auto">
        <h2
          className="font-extrabold text-center"
          style={{ fontSize: 'clamp(24px,6vw,32px)' }}
        >
          {titleBase} <span style={{ color: 'var(--azul)' }}>{quees.titleAccent}</span>
        </h2>

        <p className="mt-3 text-center" style={{ color: '#5b5c6b', fontSize: '15px', lineHeight: 1.6 }}>
          {quees.subtitle}
        </p>

        <div
          className="mt-7 bg-white rounded-[20px] text-left"
          style={{ boxShadow: 'var(--sombra)', border: '1px solid #f0f1f4' }}
        >
          {/* Pills de grado + imagen */}
          <div className="flex items-center gap-3 p-5">
            <div className="flex flex-col gap-2 shrink-0">
              {GRADOS.map((g) => {
                const on = g === grado;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setGrado(g)}
                    className="rounded-[22px] px-4 py-2 text-[13.5px] font-semibold transition-colors"
                    style={{
                      background: on ? 'var(--navy)' : 'var(--lavanda)',
                      color: on ? '#fff' : 'var(--navy)',
                    }}
                  >
                    Grado {g}
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-h-[180px]">
              <MediaSlot
                src={inspectorAssetUrl(piezaActual, grado)}
                alt={`${piezaActual} de un equipo Grado ${grado}`}
                className="h-full min-h-[180px]"
              />
              <span
                data-testid="insp-badge"
                className="absolute left-3 bottom-3 rounded-[20px] px-3 py-1 text-[12px] font-semibold text-white"
                style={{ background: 'rgba(21,23,68,.75)' }}
              >
                {piezaActual} · Grado {grado}
              </span>
            </div>
          </div>

          {/* Tabs de pieza */}
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PIEZAS.map((p, i) => {
              const on = i === pieza;
              return (
                <button
                  key={p}
                  type="button"
                  ref={on ? activeTabRef : undefined}
                  aria-pressed={on}
                  onClick={() => setPieza(i)}
                  className="shrink-0 rounded-[20px] px-3.5 py-2 text-[13px] font-semibold transition-colors"
                  style={{
                    background: on ? 'var(--azul)' : '#f4f5f8',
                    color: on ? '#fff' : '#5b5c6b',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Navegación */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid var(--borde)' }}
          >
            <button type="button" onClick={prev} className="text-[13.5px] font-semibold" style={{ color: 'var(--azul)' }}>
              ‹ Anterior
            </button>
            <span data-testid="insp-counter" className="text-[13px]" style={{ color: 'var(--tenue)' }}>
              {pieza + 1} / {total}
            </span>
            <button type="button" onClick={next} className="text-[13.5px] font-semibold" style={{ color: 'var(--azul)' }}>
              Siguiente ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- SeminuevosInspector`
Expected: PASS, 6 tests.

Si falla por `scrollIntoView` (jsdom no lo implementa), agregar al inicio del archivo de test:

```ts
beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });
```

- [ ] **Step 5: Montarlo en el orquestador**

Tras `<SeminuevosHero ... />`:

```tsx
        <SeminuevosInspector />
```

- [ ] **Step 6: Verificar en el navegador**

En viewport móvil: recorrer las 8 piezas con Siguiente y confirmar que la tab activa
siempre queda centrada, que el badge acompaña, y que en los extremos la navegación es circular.
Los 24 slots muestran placeholder (los assets aún no existen) — es lo esperado.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): inspector de piezas por grado (8x3) con slots a S3"
```

---

## Task 5: Proceso

**Files:**
- Create: `.../seminuevos/SeminuevosProceso.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/SeminuevosProceso.test.tsx`

**Interfaces:**
- Consumes: `proceso` (Task 2); iconos `IconLupa`, `IconEtiqueta`, `IconDocumento`, `IconVideo` (Task 2)
- Produces: `SeminuevosProceso` con props `{ catalogUrl: string }`

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import { SeminuevosProceso } from '../SeminuevosProceso';

describe('SeminuevosProceso', () => {
  it('muestra los 3 pasos con su copy', () => {
    render(<SeminuevosProceso catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByText('Explora el catálogo')).toBeInTheDocument();
    expect(screen.getByText('Encuentra el modelo que más te guste')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el modelo ideal')).toBeInTheDocument();
    expect(screen.getByText('Elige el grado y cuota que más se te acomode')).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos')).toBeInTheDocument();
    expect(screen.getByText('Llena un formulario de 2 minutos')).toBeInTheDocument();
  });

  it('muestra el banner de aprobación con el texto destacado', () => {
    render(<SeminuevosProceso catalogUrl="/x" />);
    expect(screen.getByText('videos de cada unidad disponible')).toBeInTheDocument();
  });

  it('el CTA apunta al catálogo', () => {
    render(<SeminuevosProceso catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByRole('link', { name: /Ver catálogo/i }))
      .toHaveAttribute('href', '/seminuevos/catalogo');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- SeminuevosProceso`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

```tsx
'use client';

import { proceso } from './data/seminuevosData';
import { IconLupa, IconEtiqueta, IconDocumento, IconVideo } from './icons/SeminuevosIcons';

const ICONS = { lupa: IconLupa, etiqueta: IconEtiqueta, documento: IconDocumento } as const;

export function SeminuevosProceso({ catalogUrl }: { catalogUrl: string }) {
  const titleBase = proceso.title.replace(proceso.titleAccent, '').trim();
  const { lead, strong, tail } = proceso.bannerAprobacion;

  return (
    <section className="px-[22px] py-12" style={{ background: '#fff' }}>
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-extrabold text-center" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>
          {titleBase} <span style={{ color: 'var(--azul)' }}>{proceso.titleAccent}</span>
        </h2>

        <div className="mt-7 flex flex-col gap-3">
          {proceso.pasos.map((paso) => {
            const Icon = ICONS[paso.icon as keyof typeof ICONS];
            return (
              <div
                key={paso.titulo}
                className="flex items-center gap-3.5 bg-white rounded-[16px] p-4"
                style={{ boxShadow: 'var(--sombra)', border: '1px solid #f0f1f4' }}
              >
                <div
                  className="shrink-0 w-12 h-12 rounded-[13px] grid place-items-center"
                  style={{ background: 'var(--lavanda)', color: 'var(--azul)' }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[16px]">{paso.titulo}</p>
                  <p className="text-[13.5px] mt-0.5" style={{ color: '#5b5c6b' }}>
                    {paso.subtitulo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-5 flex items-start gap-3.5 rounded-[16px] p-4"
          style={{ background: 'linear-gradient(160deg,#e6f9f8,#eef0fc)', border: '1px solid #cdeef0' }}
        >
          <div
            className="shrink-0 w-11 h-11 rounded-[12px] grid place-items-center bg-white"
            style={{ color: 'var(--azul)' }}
          >
            <IconVideo className="w-5 h-5" />
          </div>
          <p className="text-[14px]" style={{ color: '#3a3c52', lineHeight: 1.55 }}>
            {lead}<strong className="font-bold">{strong}</strong>{tail}
          </p>
        </div>

        <div className="mt-7 text-center">
          <a
            href={catalogUrl}
            className="inline-block rounded-[30px] px-7 py-3 text-white font-semibold text-[15px]"
            style={{
              background: 'linear-gradient(135deg,#5a63e0,#03DBD0)',
              boxShadow: '0 10px 24px rgba(90,99,224,.35)',
            }}
          >
            {proceso.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- SeminuevosProceso`
Expected: PASS, 3 tests.

- [ ] **Step 5: Montarlo en el orquestador**

```tsx
        <SeminuevosProceso catalogUrl={routes.catalogo(landing)} />
```

- [ ] **Step 6: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): sección de proceso con banner de aprobación"
```

---

## Task 6: Sobre nosotros

**Files:**
- Create: `.../seminuevos/SeminuevosAbout.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/SeminuevosAbout.test.tsx`

**Interfaces:**
- Consumes: `about` (Task 2); `MediaSlot` (Task 2); iconos de redes + `IconEscudo` (Task 2)
- Produces: `SeminuevosAbout` (sin props)

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import { SeminuevosAbout } from '../SeminuevosAbout';

describe('SeminuevosAbout', () => {
  it('muestra el título y el párrafo', () => {
    render(<SeminuevosAbout />);
    expect(screen.getByRole('heading', { name: /Sobre nosotros/i })).toBeInTheDocument();
    expect(screen.getByText(/financiamiento a estudiantes universitarios/i)).toBeInTheDocument();
  });

  it('muestra el placeholder de la foto del equipo mientras no haya asset', () => {
    render(<SeminuevosAbout />);
    expect(screen.getByTestId('media-slot-placeholder')).toBeInTheDocument();
  });

  it('muestra el sello SBS', () => {
    render(<SeminuevosAbout />);
    expect(screen.getByText(/Superintendencia de Banca, Seguros y AFP/i)).toBeInTheDocument();
  });

  it('muestra las 4 redes, con target y rel seguros', () => {
    render(<SeminuevosAbout />);
    const links = screen.getAllByTestId('about-social');
    expect(links).toHaveLength(4);
    links.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
    expect(screen.getByText('@baldecash_2026')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- SeminuevosAbout`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

```tsx
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
                className="inline-flex items-center gap-2 rounded-[26px] px-3.5 py-2 transition-colors"
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
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- SeminuevosAbout`
Expected: PASS, 4 tests.

- [ ] **Step 5: Montarlo en el orquestador**

```tsx
        <SeminuevosAbout />
```

- [ ] **Step 6: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): sección sobre nosotros con slot de foto y redes"
```

---

## Task 7: FAQ — datos de BD, diseño de Haru

**Files:**
- Create: `.../seminuevos/SeminuevosFaq.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/SeminuevosFaq.test.tsx`

**Interfaces:**
- Consumes: `FaqData` de `types/hero`; `faq` (Task 2); `IconChevron` (Task 2)
- Produces: `SeminuevosFaq` con props `{ data?: FaqData | null }`

> **Tipos verificados** (`types/hero.ts:297-316`):
> `FaqItem` es `{ id: string; question: string; answer: string; category?: string }` —
> **`id` es `string`, no número**. `FaqData` es
> `{ title?, subtitle?, items: FaqItem[], categories?, categoryIcons?, categoryColors? }`.

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeminuevosFaq } from '../SeminuevosFaq';

const data = {
  items: [
    { id: '1', question: '¿Puedo elegir el equipo?', answer: 'Sí, tras la aprobación.', category: 'General' },
    { id: '2', question: '¿Tienen garantía?', answer: 'Depende del grado.', category: 'Garantía' },
  ],
};

describe('SeminuevosFaq', () => {
  it('no renderiza nada si no hay preguntas', () => {
    const { container } = render(<SeminuevosFaq data={{ items: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('no renderiza nada si data es null', () => {
    const { container } = render(<SeminuevosFaq data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lista las preguntas que vienen de BD', () => {
    render(<SeminuevosFaq data={data} />);
    expect(screen.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Puedo elegir el equipo\?/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Tienen garantía\?/ })).toBeInTheDocument();
  });

  it('arranca con todas cerradas y abre al tocar', async () => {
    render(<SeminuevosFaq data={data} />);
    const primera = screen.getByRole('button', { name: /¿Puedo elegir el equipo\?/ });
    expect(primera).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(primera);
    expect(primera).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Sí, tras la aprobación.')).toBeVisible();
  });

  it('permite varias abiertas a la vez (no es acordeón exclusivo)', async () => {
    render(<SeminuevosFaq data={data} />);
    const a = screen.getByRole('button', { name: /¿Puedo elegir el equipo\?/ });
    const b = screen.getByRole('button', { name: /¿Tienen garantía\?/ });
    await userEvent.click(a);
    await userEvent.click(b);
    expect(a).toHaveAttribute('aria-expanded', 'true');
    expect(b).toHaveAttribute('aria-expanded', 'true');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- SeminuevosFaq`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

```tsx
'use client';

import { useState } from 'react';
import type { FaqData } from '../../../types/hero';
import { faq } from './data/seminuevosData';
import { IconChevron } from './icons/SeminuevosIcons';

export function SeminuevosFaq({ data }: { data?: FaqData | null }) {
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  const toggle = (id: string) => {
    setAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="faq" className="px-[22px] py-12" style={{ background: '#fff' }}>
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-extrabold text-center" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>
          {data?.title || faq.title}
        </h2>

        {data?.subtitle && (
          <p className="mt-3 text-center" style={{ color: '#5b5c6b', fontSize: '15px' }}>
            {data.subtitle}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
          {items.map((item) => {
            const open = abiertas.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-[16px] overflow-hidden"
                style={{ boxShadow: 'var(--sombra)', border: '1px solid #f0f1f4' }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between gap-3 text-left p-4"
                >
                  <span className="font-semibold text-[15px]">{item.question}</span>
                  <IconChevron
                    className={`w-5 h-5 shrink-0 transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* grid-template-rows en vez de max-height fijo: el max-height del
                    prototipo corta las respuestas largas, y las de BD son de largo libre. */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-[14px]" style={{ color: '#5b5c6b', lineHeight: 1.6 }}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- SeminuevosFaq`
Expected: PASS, 5 tests.

- [ ] **Step 5: Montarlo en el orquestador**

Pasar el prop y montar tras `<SeminuevosAbout />`:

```tsx
        <SeminuevosFaq data={faqData} />
```

Agregar `faqData` a la desestructuración de props de `SeminuevosLanding`.

- [ ] **Step 6: Verificar en el navegador**

Si la landing local tiene FAQs cargadas, deben aparecer. Si no tiene, la sección no se
renderiza — es el comportamiento correcto. Anotar cuál de los dos casos se observó.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): FAQ con datos de BD y acordeón del prototipo"
```

---

## Task 8: Footer, WhatsApp y carga diferida

**Files:**
- Create: `.../seminuevos/SeminuevosWhatsapp.tsx`
- Modify: `.../seminuevos/SeminuevosLanding.tsx`
- Test: `.../seminuevos/__tests__/SeminuevosLanding.test.tsx`

**Interfaces:**
- Consumes: todas las secciones (Tasks 3-7); `Footer` de `components/hero/Footer`
- Produces: orquestador completo

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import SeminuevosLanding from '../SeminuevosLanding';

jest.mock('../../../hero/Footer', () => ({
  Footer: () => <footer data-testid="footer-compartido" />,
}));

describe('SeminuevosLanding', () => {
  it('renderiza el hero y el footer compartido', () => {
    render(<SeminuevosLanding landing="seminuevos" />);
    expect(
      screen.getByRole('heading', { name: /Equipos seminuevos en cuotas sin intereses/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('footer-compartido')).toBeInTheDocument();
  });

  it('muestra el botón flotante de WhatsApp', () => {
    render(<SeminuevosLanding landing="seminuevos" />);
    const wa = screen.getByRole('link', { name: /WhatsApp/i });
    expect(wa).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(wa).toHaveAttribute('target', '_blank');
  });

  it('no rompe cuando no hay footerData ni faqData', () => {
    expect(() =>
      render(<SeminuevosLanding landing="seminuevos" footerData={null} faqData={null} />)
    ).not.toThrow();
  });
});
```

> Ajustar la ruta del `jest.mock` a la profundidad real del archivo de test.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- SeminuevosLanding`
Expected: FAIL — no existe el botón de WhatsApp.

- [ ] **Step 3: Implementar el botón de WhatsApp**

```tsx
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
```

- [ ] **Step 4: Completar el orquestador**

`SeminuevosLanding.tsx` final:

```tsx
'use client';

import { Baloo_2 } from 'next/font/google';
import { Footer } from '../../hero/Footer';
import { routes } from '../../../utils/routes';
import type { FooterData, PromoBannerData, FaqData } from '../../../types/hero';
import { SeminuevosHero } from './SeminuevosHero';
import { SeminuevosInspector } from './SeminuevosInspector';
import { SeminuevosProceso } from './SeminuevosProceso';
import { SeminuevosAbout } from './SeminuevosAbout';
import { SeminuevosFaq } from './SeminuevosFaq';
import { SeminuevosWhatsapp } from './SeminuevosWhatsapp';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-baloo',
});

export interface SeminuevosLandingProps {
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
  faqData?: FaqData | null;
}

export default function SeminuevosLanding({
  footerData,
  landing = 'seminuevos',
  faqData,
}: SeminuevosLandingProps) {
  const catalogUrl = routes.catalogo(landing);

  return (
    <div className={`${baloo.variable} seminuevos-landing min-h-screen antialiased`}>
      <style>{`
        .seminuevos-landing{
          --azul:#4654CD; --azul2:#5a63e0; --aqua:#03DBD0; --navy:#151744;
          --lavanda:#EEF0FC; --borde:#E8E8EE; --tenue:#8A8A99;
          --sombra:0 8px 24px rgba(21,23,68,.07);
          font-family: var(--font-baloo), system-ui, sans-serif;
          color: var(--navy);
          background: #fff;
        }
        .seminuevos-landing button,
        .seminuevos-landing input { font-family: inherit; }
      `}</style>

      <main>
        <SeminuevosHero catalogUrl={catalogUrl} />
        <SeminuevosInspector />
        <SeminuevosProceso catalogUrl={catalogUrl} />
        <SeminuevosAbout />
        <SeminuevosFaq data={faqData} />
      </main>

      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>

      <SeminuevosWhatsapp />
    </div>
  );
}
```

> **Sobre `LazySection`:** el spec lo mencionaba para las secciones bajo el fold.
> Con 5 secciones ligeras y sin imágenes pesadas (los slots usan `loading="lazy"`),
> no aporta y complica los tests. Se omite deliberadamente. Si al medir en el
> navegador el scroll se siente pesado, se agrega copiando el patrón de
> `NvidiaLanding.tsx:21-46`.

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm test -- SeminuevosLanding`
Expected: PASS, 3 tests.

- [ ] **Step 6: Correr toda la suite de la landing**

Run: `npm test -- seminuevos`
Expected: PASS — todos los tests de las tareas 2-8.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): orquestador completo con footer compartido y WhatsApp"
```

---

## Task 9: CTA "Ver catálogo" en el Navbar

**Files:**
- Modify: `src/app/prototipos/0.6/components/hero/Navbar.tsx`
- Modify: `src/app/prototipos/0.6/[[...slug]]/LandingPageClient.tsx`
- Modify: `src/app/prototipos/0.6/preview/[[...id]]/PreviewPageClient.tsx`
- Test: `src/app/prototipos/0.6/components/hero/__tests__/Navbar.seminuevosCta.test.tsx`

**Interfaces:**
- Consumes: `LANDING_IDS.SEMINUEVOS` (Task 1)
- Produces: `NavbarProps.landingId?: number`

**Contexto:** hoy `NavbarProps` recibe `landing` (el **slug**) y no conoce el `landingId`.
Se agrega la prop **opcional**, así ningún call site existente se rompe. El CTA aparece
solo donde se pasa la prop — es decir, en el index y en el preview, no en el catálogo ni
en el detalle. Eso implementa "solo en el home" sin lógica de ruta.

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { LANDING_IDS } from '../../../utils/landingIds';

describe('Navbar — CTA de la landing de seminuevos', () => {
  it('no muestra el CTA cuando no se pasa landingId', () => {
    render(<Navbar landing="home" />);
    expect(screen.queryByTestId('navbar-cta-catalogo')).not.toBeInTheDocument();
  });

  it('no muestra el CTA en otras landings especiales', () => {
    render(<Navbar landing="nvidia" landingId={LANDING_IDS.NVIDIA} />);
    expect(screen.queryByTestId('navbar-cta-catalogo')).not.toBeInTheDocument();
  });

  it('muestra el CTA en la landing de seminuevos', () => {
    render(<Navbar landing="seminuevos" landingId={LANDING_IDS.SEMINUEVOS} />);
    const cta = screen.getByTestId('navbar-cta-catalogo');
    expect(cta).toHaveTextContent('Ver catálogo');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/seminuevos/catalogo'));
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- Navbar.seminuevosCta`
Expected: FAIL — no existe `navbar-cta-catalogo`.

Si el render del Navbar explota por falta de contexto (tracker, NextUI), envolverlo con
los mismos providers que use otro test existente del Navbar. Si no hay ninguno, el test
puede acotarse a un helper puro `shouldShowCatalogCta(landingId)` exportado del archivo,
y verificar el render en el navegador (Step 6).

- [ ] **Step 3: Agregar la prop**

En `NavbarProps` (~línea 128, junto a `landing`):

```ts
  /**
   * Landing id para detección de variantes. Opcional a propósito: los call sites
   * que no la pasan renderizan el navbar exactamente como siempre.
   * Solo la pasan el index y el preview — por eso el CTA de catálogo no aparece
   * dentro del catálogo ni del detalle.
   */
  landingId?: number;
```

Y agregarla a la desestructuración de la línea 188, después de `landing = 'home',`:

```ts
  landingId,
```

- [ ] **Step 4: Renderizar el CTA**

Importar en `Navbar.tsx`:

```ts
import { LANDING_IDS } from '../../utils/landingIds';
```

Cerca del cálculo de `navItems`, definir:

```ts
  // CTA "Ver catálogo" de la landing de seminuevos. Solo en el home: las
  // subpáginas no pasan landingId, así que acá queda undefined.
  const showCatalogCta = landingId === LANDING_IDS.SEMINUEVOS;
```

Y en el bloque de acciones de la derecha, **antes** del botón de portal (~línea 545, el
`<div>` que contiene "Zona Estudiantes"):

```tsx
            {showCatalogCta && (
              <a
                data-testid="navbar-cta-catalogo"
                href={routes.catalogo(landing)}
                className="inline-flex items-center rounded-[30px] px-[18px] py-2.5 text-white font-semibold text-[14px] whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#5a63e0,#03DBD0)' }}
                onClick={() => {
                  tracker?.track('cta_click', {
                    cta_name: 'ver_catalogo_seminuevos',
                    location: 'navbar',
                  });
                }}
              >
                Ver catálogo
              </a>
            )}
```

> Verificar que `routes` y `tracker` ya estén en scope en ese archivo (lo están: el
> botón de portal usa `tracker`). Si el bloque de acciones distingue desktop de mobile,
> repetir el CTA en ambos, como hace el botón de portal (líneas 571 y 773).

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm test -- Navbar.seminuevosCta`
Expected: PASS, 3 tests.

- [ ] **Step 6: Montar el Navbar en `SeminuevosLanding`**

**Dato verificado:** el Navbar del index lo monta **`HeroSection.tsx:253`**, y nuestra rama
de seminuevos **no pasa por `HeroSection`**. Por eso NVIDIA tiene su propio `<header>` inline
(`NvidiaLanding.tsx:155`). Es decir: hasta acá la landing **no tiene header**, y hay que
montarlo en el orquestador.

Los datos del navbar viven en `heroData` y se pasan como props. En `LandingPageClient.tsx`,
la rama de seminuevos debe reenviarlos:

```tsx
        <SeminuevosLanding
          footerData={mergedFooterData}
          landing={slug}
          previewBannerOffset={showPreviewBanner ? previewBannerHeight : 0}
          promoBannerData={heroData?.promoBannerData}
          faqData={mergedFaq}
          navbarItems={mergedNavbarItems}
          megamenuItems={heroData.megamenuItems}
          logoUrl={heroData.logoUrl}
          customerPortalUrl={heroData.customerPortalUrl}
          portalButtonText={heroData.portalButtonText}
          primaryColor={heroData.primaryColor}
        />
```

> `mergedNavbarItems` ya existe (`LandingPageClient.tsx:268-278`): aplica los overrides
> del preview sobre los items de BD. Usarlo, no `heroData.navbarItems` crudo.
> En `PreviewPageClient.tsx` existe el equivalente; usar el mismo criterio.

Ampliar `SeminuevosLandingProps` con esos campos (tipándolos igual que en
`LandingPageClient.tsx:53-62`) y montar el Navbar como primer hijo:

```tsx
      <Navbar
        landing={landing}
        landingId={LANDING_IDS.SEMINUEVOS}
        navbarItems={navbarItems}
        megamenuItems={megamenuItems}
        logoUrl={logoUrl}
        customerPortalUrl={customerPortalUrl}
        portalButtonText={portalButtonText}
        primaryColor={primaryColor}
        promoBannerData={promoBannerData}
        previewBannerOffset={previewBannerOffset}
      />
```

Y el `<main>` debe respetar la altura que el Navbar publica — si no, el hero queda tapado:

```tsx
      <main style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>
```

> Ese `--header-total-height` es el contrato entre navbar y contenido
> (`HeroSection.tsx:257` hace lo mismo). El Navbar lo publica con un `ResizeObserver`.

Actualizar el test de `SeminuevosLanding` (Task 8) para el Navbar recién montado: o se
mockea igual que el Footer, o se le pasan `navbarItems={[]}`. Correr `npm test -- seminuevos`
y confirmar que sigue en verde.

- [ ] **Step 7: Verificar que las otras landings no cambian**

Abrir y comparar contra `main`:
- `http://localhost:3001/prototipos/0.6/home`
- `http://localhost:3001/prototipos/0.6/nvidia`
- `http://localhost:3001/prototipos/0.6/zona-gamer`
- `http://localhost:3001/prototipos/0.6/seminuevos/catalogo`

Expected: ninguna muestra el CTA "Ver catálogo" y su header se ve igual que antes.

- [ ] **Step 8: Commit**

```bash
git add src/app/prototipos/0.6/components/hero/Navbar.tsx \
        src/app/prototipos/0.6/components/hero/__tests__/Navbar.seminuevosCta.test.tsx \
        src/app/prototipos/0.6/[[...slug]]/LandingPageClient.tsx \
        "src/app/prototipos/0.6/preview/[[...id]]/PreviewPageClient.tsx" \
        src/app/prototipos/0.6/components/product-landing/seminuevos/
git commit -m "feat(seminuevos): CTA Ver catálogo en el navbar por landingId

Agrega la prop opcional landingId al Navbar genérico. Solo la pasan el
index y el preview, por lo que el CTA no aparece en catálogo ni detalle."
```

---

## Task 10: Verificación end-to-end

Sin código nuevo. Se mide lo que se construyó y se reporta lo observado, no lo esperado.

- [ ] **Step 1: Suite completa y lint**

```bash
npm test
npm run lint
```

Expected: sin fallos. Si algún test **ajeno** a esta landing falla, verificar contra
`main` si ya fallaba antes de tocar nada, y reportarlo como preexistente.

- [ ] **Step 2: Recorrido móvil (criterio principal)**

`npm run dev`, viewport 375×812 en `http://localhost:3001/prototipos/0.6/seminuevos`:

| # | Qué verificar | Esperado |
|---|---|---|
| 1 | Orden de secciones | hero → inspector → proceso → sobre nosotros → FAQ → footer |
| 2 | Hero | ocupa la pantalla, 4 laptops de colores, texto legible sobre ellas |
| 3 | CTA del hero | navega a `/seminuevos/catalogo` |
| 4 | Inspector: grados | las 3 pills cambian la imagen y el badge |
| 5 | Inspector: piezas | las 8 tabs funcionan; la activa siempre queda centrada |
| 6 | Inspector: circular | desde "1 / 8", Anterior lleva a "8 / 8"; desde "8 / 8", Siguiente vuelve a "1 / 8" |
| 7 | Proceso | 3 tarjetas + banner de aprobación + CTA al catálogo |
| 8 | Sobre nosotros | placeholder de foto, sello SBS, 4 redes que abren en pestaña nueva |
| 9 | FAQ | refleja lo que hay en BD; varias pueden quedar abiertas; una respuesta larga **no se corta** |
| 10 | Footer | aparece con la franja de suscripción por WhatsApp |
| 11 | WhatsApp flotante | abajo a la derecha, abre `wa.me` |
| 12 | Scroll horizontal | **no** existe en ningún punto de la página |

- [ ] **Step 3: Escritorio**

Viewport 1440px. Expected: contenido centrado en columna (600-720px), sin romperse.
No hay diseño de escritorio propio — es lo definido en el spec, no un defecto.

- [ ] **Step 4: No regresión en las demás landings**

Repetir el Step 7 de la Task 9 y confirmar que `home`, `nvidia` y `zona-gamer` se ven
igual que en `main`, y que el catálogo y el detalle genéricos siguen funcionando.

- [ ] **Step 5: Preview del admin**

Abrir `http://localhost:3001/prototipos/0.6/preview/999`.
Expected: se ve la landing de seminuevos, no el `HeroSection` genérico.

- [ ] **Step 6: Reportar**

Escribir un resumen con: qué se verificó y qué se observó (no "todo ok"), qué quedó
pendiente de assets de Haru, y si hubo que forzar alguna condición en local por falta
de la landing en la BD (Task 1, Step 8) — **confirmando que se revirtió**.

---

## Pendientes que no bloquean

1. **Landing id real:** cambiar `999` en `utils/landingIds.ts`. Un solo número, un solo archivo.
2. **Assets de Haru:** 24 del inspector (`{pieza}-{grado}.webp`), banner del hero (`hero.bannerUrl`),
   foto del equipo (`about.fotoEquipoUrl`). Se suben a S3 y aparecen sin tocar código.
3. **Contenido de FAQ:** cargar en admin2 las 5 preguntas del prototipo. El PDF de políticas
   —hoy embebido como data URI— debe subirse a S3 y referenciarse por URL.
4. **Validaciones de negocio:** garantía por grado (la FAQ del prototipo dice 6/6/2 meses, sus
   datos dicen 8/6/3) y el copy "cuotas sin intereses" del hero.
