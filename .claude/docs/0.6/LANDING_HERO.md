# Landing / Hero v0.6 - Documentación Técnica

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Componentes Principales](#componentes-principales)
4. [Rutas y Navegación](#rutas-y-navegación)
5. [Preview Mode](#preview-mode)
6. [API y Servicios](#api-y-servicios)
7. [Tipos e Interfaces](#tipos-e-interfaces)
8. [Cómo Extender](#cómo-extender)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     LandingPageClient.tsx                    │
│                    (Orquestador Principal)                   │
├─────────────────────────────────────────────────────────────┤
│  Data Fetching              │  State                        │
│  ├─ fetchHeroData()         │  ├─ heroData: HeroData        │
│  └─ usePreviewListener()    │  ├─ isLoading                 │
│                             │  └─ isPreviewMode             │
├─────────────────────────────────────────────────────────────┤
│                       HeroSection.tsx                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Navbar    │ │ PromoBanner │ │       HeroBanner        ││
│  │   (V6)      │ │             │ │   (Lifestyle Aspir.)    ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │SocialProof  │ │ HowItWorks  │ │         HeroCta         ││
│  │  (Marquee)  │ │(Con Requis.)│ │   (WhatsApp Directo)    ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────────────────────┐ ┌─────────────────────────┐│
│  │        FaqSection           │ │         Footer          ││
│  │    (Acordeón + Iconos)      │ │   (Newsletter + Cols)   ││
│  └─────────────────────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      landingApi.ts                           │
│  GET /public/landing/{slug}/hero                             │
│  → transformLandingData() → HeroData                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos

```
prototipos/0.6/
├── [[...slug]]/
│   ├── page.tsx              # Route handler (catch-all)
│   ├── LandingPageClient.tsx # Componente principal client
│   └── not-found.tsx         # 404 para rutas inválidas
│
├── components/hero/
│   ├── index.ts              # Barrel exports
│   ├── HeroSection.tsx       # Orquestador de secciones
│   ├── Navbar.tsx            # Navegación principal (V6)
│   ├── HeroBanner.tsx        # Banner hero (V2)
│   ├── HeroCta.tsx           # Botones CTA (V4)
│   ├── SocialProof.tsx       # Logos + Testimonios (V1)
│   ├── HowItWorks.tsx        # Pasos + Requisitos (V5)
│   ├── FaqSection.tsx        # Acordeón FAQ (V2)
│   ├── Footer.tsx            # Pie de página (V2)
│   ├── ProductSummaryCard.tsx
│   └── common/
│       └── UnderlinedText.tsx
│
├── services/
│   └── landingApi.ts         # API client + transformaciones
│
├── hooks/
│   └── usePreviewListener.ts # Preview mode desde admin
│
└── types/
    └── hero.ts               # Tipos del módulo Hero
```

---

## Componentes Principales

### LandingPageClient

**Archivo:** `[[...slug]]/LandingPageClient.tsx`

Componente principal que orquesta la carga de datos y el preview mode.

```typescript
interface LandingPageClientProps {
  slug: string;
}

// Estados principales
const [heroData, setHeroData] = useState<HeroData | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [isPageLoading, setIsPageLoading] = useState(true);
const { previewData, isPreviewMode } = usePreviewListener();

// Preview mode from query param
const isPreviewParam = searchParams.get('preview') === 'true';
```

**Features:**
- Fetch de datos desde API con `fetchHeroData(slug)`
- Soporte para preview mode (postMessage desde admin)
- Merge de datos API + preview en tiempo real
- CSS variables dinámicas para colores de landing
- Preloader con 500ms de delay mínimo

**Merge de datos con preview:**
```typescript
const mergedHeroContent = useMemo((): HeroContent | null => {
  if (!heroData?.heroContent) return null;
  if (!previewData?.hero) return heroData.heroContent;

  return {
    ...heroData.heroContent,
    headline: preview.title ?? heroData.heroContent.headline,
    subheadline: preview.subtitle ?? heroData.heroContent.subheadline,
    // ... más campos
  };
}, [heroData?.heroContent, previewData?.hero]);
```

### HeroSection

**Archivo:** `components/hero/HeroSection.tsx`

Wrapper que renderiza todas las secciones del landing.

```typescript
interface HeroSectionProps {
  // Data desde API
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  promoBannerData: PromoBannerData | null;

  // Navbar
  navbarItems?: NavbarItemData[];
  megamenuItems?: MegaMenuItemData[];

  // Otros
  testimonials?: Testimonial[];
  testimonialsTitle?: string;
  activeSections?: string[];
  hasCta?: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
}
```

**Versiones fijas en v0.6:**
- Navbar: V6 (Banner Promocional)
- HeroBanner: V2 (Lifestyle Aspiracional)
- SocialProof: V1 (Marquee + Testimonios)
- HowItWorks: V5 (Con Requisitos)
- CTA: V4 (WhatsApp Directo)
- FAQ: V2 (Acordeón con Iconos)
- Footer: V2 (Newsletter + Columnas)

**Secciones Condicionales:**
```typescript
// Solo renderiza si existe data Y está en activeSections
{socialProof && activeSections.includes('convenios') && (
  <section id="convenios">
    <SocialProof data={socialProof} />
  </section>
)}

{howItWorksData && activeSections.includes('como-funciona') && (
  <section id="como-funciona">
    <HowItWorks data={howItWorksData} />
  </section>
)}

{faqData && activeSections.includes('faq') && (
  <section id="faq">
    <FaqSection data={faqData} />
  </section>
)}
```

### Navbar

**Archivo:** `components/hero/Navbar.tsx`

Navegación principal con promo banner y megamenu.

**Features:**
- Promo banner dismissible
- Links dinámicos desde API
- Megamenu para productos
- Logo dinámico por landing
- Link a portal de clientes

### Footer

**Archivo:** `components/hero/Footer.tsx`

Pie de página con columnas, newsletter y datos de empresa.

**Features:**
- Columnas dinámicas de links
- Newsletter opcional
- Redes sociales
- Datos de empresa (company_info)
- Texto SBS

---

## Rutas y Navegación

### Rutas Soportadas

| Ruta | Slug | Descripción |
|------|------|-------------|
| `/prototipos/0.6/` | `home` | Landing principal (default) |
| `/prototipos/0.6/home` | `home` | Alias de la principal |
| `/prototipos/0.6/laptops-estudiantes` | `laptops-estudiantes` | Landing institucional |
| `/prototipos/0.6/celulares-2026` | `celulares-2026` | Landing de celulares |
| `/prototipos/0.6/motos-lima` | `motos-lima` | Landing de motos |

### generateStaticParams

```typescript
export async function generateStaticParams() {
  // Intenta obtener slugs desde API
  const response = await fetch(`${apiUrl}/public/landing/list/slugs`);
  const data = await response.json();

  // Combina con fallbacks
  const slugs = [...new Set([...fallbackSlugs, ...data.slugs])];

  return [
    { slug: [] }, // Ruta raíz
    ...slugs.map((s) => ({ slug: [s] })),
  ];
}
```

### generateMetadata

```typescript
export async function generateMetadata({ params }: PageProps) {
  const slug = params.slug?.[0] || 'home';
  const meta = await getLandingMeta(slug);

  return {
    title: meta?.meta_title || `BaldeCash - ${slug}`,
    description: meta?.meta_description || 'Financiamiento...',
  };
}
```

---

## Preview Mode

El landing soporta preview en tiempo real desde el admin.

### Activación

1. **Via URL:** `?preview=true`
2. **Via postMessage:** El admin envía actualizaciones en tiempo real

### usePreviewListener

```typescript
// hooks/usePreviewListener.ts
const { previewData, isPreviewMode } = usePreviewListener();

// Escucha postMessage desde el admin
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'PREVIEW_UPDATE') {
      setPreviewData(event.data.payload);
      setIsPreviewMode(true);
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Preview Banner

```typescript
{showPreviewBanner && (
  <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-xs text-center py-1">
    Modo Preview - Los cambios se muestran en tiempo real
  </div>
)}
```

### Datos que soportan preview

- `hero` → headline, subheadline, ctaText, backgroundUrl, minQuota, badgeText, trustSignals
- `socialProof` → headline, badgeText, subtext, studentCount, institutions
- `howItWorks` → headline, subtitle, steps
- `faq` → headline, subtitle, items
- `cta` → headline, subtitle
- `navbar` → links
- `footer` → description, copyright, columns

---

## API y Servicios

### landingApi.ts

**Archivo:** `services/landingApi.ts`

#### Endpoints

| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getLandingMeta` | `/public/landing/{slug}` | Solo meta SEO |
| `getLandingBySlug` | `/public/landing/{slug}` | Datos básicos |
| `getLandingHeroData` | `/public/landing/{slug}/hero` | Datos completos |
| `getLandingLayout` | `/public/landing/{slug}/layout` | Solo navbar/footer |

#### fetchHeroData

```typescript
async function fetchHeroData(slug: string, preview?: boolean): Promise<{
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  promoBannerData: PromoBannerData | null;
  navbarItems: NavbarItemData[];
  megamenuItems: MegaMenuItemData[];
  testimonials: Testimonial[];
  activeSections: string[];
  hasCta: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  footerData: FooterData | null;
  primaryColor: string;
  secondaryColor: string;
} | null>
```

#### transformLandingData

Transforma la respuesta de API al formato esperado por los componentes:

```typescript
function transformLandingData(data: LandingHeroResponse) {
  const components = data.components || [];

  // Extrae componentes por código
  const heroComponent = components.find(c => c.component_code === 'hero');
  const socialProofComponent = components.find(c => c.component_code === 'social_proof');
  const howItWorksComponent = components.find(c => c.component_code === 'how_it_works');
  const faqComponent = components.find(c => c.component_code === 'faq');

  // Determina secciones activas
  const activeSections = [];
  if (socialProofComponent && navbarIncludes('convenios')) {
    activeSections.push('convenios');
  }

  return {
    heroContent: transformHero(heroComponent),
    socialProof: transformSocialProof(socialProofComponent),
    // ...
  };
}
```

---

## Tipos e Interfaces

### HeroContent

```typescript
interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCta: CtaConfig;
  secondaryCta?: CtaConfig;
  minQuota: number;
  trustSignals: TrustSignal[];
  backgroundImage?: string;
  badgeText?: string;
}
```

### SocialProofData

```typescript
interface SocialProofData {
  title?: string;
  subtitle?: string;
  chipText?: string;
  titleTemplate?: string;
  highlightWord?: string;
  testimonialsSubtitle?: string;
  studentCount: number;
  institutionCount: number;
  yearsInMarket: number;
  institutions: Institution[];
  mediaLogos: MediaLogo[];
}
```

### HowItWorksData

```typescript
interface HowItWorksData {
  title?: string;
  subtitle?: string;
  stepLabel?: string;
  stepsTitle?: string;
  requirementsTitle?: string;
  steps: HowItWorksStep[];
  requirements: Requirement[];
  availableTerms: number[];
}
```

### FaqData

```typescript
interface FaqData {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
  categories?: string[];
  categoryIcons?: Record<string, string>;
  categoryColors?: Record<string, string>;
}
```

### NavbarItemData

```typescript
interface NavbarItemData {
  label: string;
  href: string;
  section: string | null;
  has_megamenu?: boolean;
  badge_text?: string | null;
  badge_color?: string | null;
  megamenu_items?: MegaMenuItemData[];
  is_visible?: boolean;
}
```

### FooterData

```typescript
interface FooterData {
  tagline?: string;
  columns?: FooterNavSection[];
  newsletter?: FooterNewsletter;
  sbs_text?: string;
  copyright_text?: string;
  social_links?: { platform: string; url: string }[];
  company?: CompanyData;
}
```

---

## Cómo Extender

### Agregar Nueva Sección Hero

1. **Crear componente** (`components/hero/NuevaSeccion.tsx`)

2. **Agregar tipo** (`types/hero.ts`):
```typescript
interface NuevaSeccionData {
  title: string;
  items: NuevaSeccionItem[];
}
```

3. **Agregar transformación** (`services/landingApi.ts`):
```typescript
const nuevaSeccionComponent = components.find(c => c.component_code === 'nueva_seccion');

let nuevaSeccionData: NuevaSeccionData | null = null;
if (nuevaSeccionComponent) {
  nuevaSeccionData = {
    title: config.title,
    items: config.items,
  };
}
```

4. **Agregar a HeroSection.tsx**:
```typescript
{nuevaSeccionData && activeSections.includes('nueva-seccion') && (
  <section id="nueva-seccion" className="scroll-mt-24">
    <NuevaSeccion data={nuevaSeccionData} />
  </section>
)}
```

### Agregar Nuevo Campo a Preview

1. **Actualizar usePreviewListener** para manejar el nuevo campo

2. **Agregar merge en LandingPageClient**:
```typescript
const mergedNuevaSeccion = useMemo(() => {
  if (!previewData?.nuevaSeccion) return heroData.nuevaSeccion;
  return { ...heroData.nuevaSeccion, ...previewData.nuevaSeccion };
}, [heroData, previewData]);
```

3. **Pasar a HeroSection**:
```typescript
<HeroSection
  nuevaSeccionData={mergedNuevaSeccion}
  // ...
/>
```
