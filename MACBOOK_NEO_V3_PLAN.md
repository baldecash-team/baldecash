# MacBook Neo Landing V3 — Base compartida + 3 variantes
## BaldeCash Web 3.0 · webpage3.0 · Rama: feature/BAL-1355

---

## Arquitectura general

```
src/app/prototipos/0.5/macbook-neo-v3/
├── shared/                          ← BASE COMPARTIDA (se escribe 1 vez)
│   ├── components/
│   │   ├── StickyNav.tsx
│   │   ├── ScrollProgress.tsx
│   │   ├── RevealOnScroll.tsx
│   │   ├── AnimatedCounter.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── VideoScroller.tsx
│   │   ├── CanvasScrubber.tsx
│   │   ├── ColorPicker.tsx
│   │   └── FinancingCTA.tsx        ← CTA BaldeCash (igual en todas)
│   ├── hooks/
│   │   ├── useGSAP.ts
│   │   ├── useLenis.ts
│   │   ├── useVideoScroll.ts
│   │   ├── useCanvasScrub.ts
│   │   └── useInView.ts
│   ├── lib/
│   │   ├── animations.ts          ← Presets de easing/timing
│   │   └── variants.ts            ← Config por variante (assets, flags)
│   ├── types/
│   │   └── macbook-neo.ts
│   └── data/
│       └── macbookNeoData.ts
│
├── premium/                         ← VARIANTE A: Premium
│   ├── page.tsx                     ← /prototipos/0.5/macbook-neo-v3/premium
│   └── components/
│       └── PremiumLanding.tsx
│
├── balanced/                        ← VARIANTE B: Balanced
│   ├── page.tsx                     ← /prototipos/0.5/macbook-neo-v3/balanced
│   └── components/
│       └── BalancedLanding.tsx
│
├── lite/                            ← VARIANTE C: Lite
│   ├── page.tsx                     ← /prototipos/0.5/macbook-neo-v3/lite
│   └── components/
│       └── LiteLanding.tsx
│
└── page.tsx                         ← Index con links a las 3 variantes
```

## Comparación de variantes

| Aspecto | Premium | Balanced | Lite |
|---------|---------|----------|------|
| **Target** | WiFi universidad, desktop | Conexión media, tablet/desktop | Datos móviles, mobile |
| **Hero** | Video scrubbing (scroll=video) | Video autoplay corto + fallback img | Imagen estática con zoom CSS |
| **Scroll** | Lenis smooth + GSAP scrub | Lenis smooth + GSAP scrub | CSS scroll-behavior + IntersectionObserver |
| **Parallax** | GSAP yPercent en múltiples secciones | GSAP parallax solo en lifestyle | CSS transform simple |
| **Galleries** | Video por tab + crossfade | Imágenes con crossfade | Imágenes con fade simple |
| **Product viewer** | Canvas scrubbing 360° (si hay frames) | Color picker con crossfade | Color picker simple |
| **Animations** | ScrollTrigger scrub + stagger + kinetic type | ScrollTrigger toggleActions + stagger | CSS @keyframes + IntersectionObserver |
| **Assets peso** | ~150-200 MB (videos) | ~30-50 MB (1 video + imágenes) | ~5-10 MB (solo imágenes WebP) |
| **Peso página** | ~8-15 MB initial load | ~3-5 MB initial load | ~800KB-1.5 MB initial load |

---

# FASE 1: Exploración de assets

## Prompt Claude Code — Fase 1

```
CONTEXTO:
Repo webpage3.0, rama feature/BAL-1355.
Carpeta de assets Apple: /Users/emiliogonzales/Downloads/MacBook_Neo (~49.5 GB)

TAREA:
Explora /Users/emiliogonzales/Downloads/MacBook_Neo y genera un inventario 
completo. Necesito decidir qué assets usar para 3 variantes de landing page.

1. VIDEOS — Para cada video encontrado:
   - Path relativo
   - Formato (mp4, mov, webm, m3u8)
   - Resolución y duración (usa ffprobe: ffprobe -v quiet -print_format json -show_streams -show_format "archivo")
   - Tamaño del archivo
   - Descripción breve de qué muestra (si el nombre lo indica)
   - Clasifica como: HERO / PRODUCT_ROTATION / FEATURE_DEMO / TRANSITION / AMBIENT

2. SECUENCIAS DE FRAMES — Busca carpetas con archivos numerados:
   - Path de la carpeta
   - Cantidad de frames
   - Resolución de un frame
   - Peso total de la secuencia
   - Clasifica como: HERO_SEQUENCE / PRODUCT_360 / TRANSITION

3. IMÁGENES — Agrupa por carpeta/sección:
   - Cantidad por carpeta
   - Resoluciones disponibles (1x, 2x, 3x)
   - Formatos (jpg, png, webp)
   - Identifica las que ya tenemos en public/images/macbook-neo/

4. OTROS — Fonts, SVGs, Lottie JSONs, etc.

5. RECOMENDACIÓN — Basado en lo que encontraste, sugiere:
   - Qué video(s) usar para el hero scroll-driven
   - Qué secuencia de frames usar para product viewer 360°
   - Qué videos usar como backgrounds
   - Qué assets son redundantes o demasiado pesados para web
   - Total estimado de assets a copiar por variante

Formato de salida: tabla markdown agrupada por tipo.
NO copies nada aún. Solo el inventario.
```

---

# FASE 2: Preparar assets para web

## Prompt Claude Code — Fase 2

```
CONTEXTO:
Repo webpage3.0, rama feature/BAL-1355.
Assets en: /Users/emiliogonzales/Downloads/MacBook_Neo
[AQUÍ PEGA TU DECISIÓN DE QUÉ ASSETS USAR basada en el inventario de Fase 1]

TAREA:
Prepara los assets seleccionados para web. Crea las carpetas de destino y 
optimiza cada archivo.

PASO 1 — Crear carpetas:
```bash
mkdir -p public/videos/macbook-neo
mkdir -p public/images/macbook-neo-v3/sequences
```

PASO 2 — Videos (copiar + optimizar):
Para cada video seleccionado:
```bash
# Convertir a MP4 web-optimizado (H.264, max 1080p)
ffmpeg -i "[input]" \
  -c:v libx264 -crf 23 -preset medium \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "public/videos/macbook-neo/[output].mp4"

# También generar WebM para browsers que lo soporten
ffmpeg -i "[input]" \
  -c:v libvpx-vp9 -crf 30 -b:v 2M \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  "public/videos/macbook-neo/[output].webm"

# Generar poster image (primer frame)
ffmpeg -i "[input]" -vframes 1 -q:v 2 \
  "public/images/macbook-neo-v3/[output]-poster.jpg"
```

PASO 3 — Secuencias de frames (si aplica):
```bash
# Optimizar cada frame a WebP, max 1280px wide
for f in [carpeta_secuencia]/*.{jpg,png}; do
  ffmpeg -i "$f" -vf "scale='min(1280,iw)':-1" -quality 80 \
    "public/images/macbook-neo-v3/sequences/[nombre]/$(basename "${f%.*}").webp"
done
```

PASO 4 — Imágenes nuevas (las que no tenemos ya):
```bash
# Las que ya están en public/images/macbook-neo/ se reutilizan
# Solo copiar y optimizar las nuevas
# Generar WebP para cada imagen importante
```

PASO 5 — Verificar:
Lista todos los assets copiados con su peso.
Calcula el total por tipo (videos, secuencias, imágenes).
Confirma que el total está dentro del presupuesto:
- Premium: máx 200 MB
- Balanced: máx 50 MB  
- Lite: máx 10 MB
```

---

# FASE 3: Construir la base compartida

## Prompt Claude Code — Fase 3

```
CONTEXTO:
Repo webpage3.0, rama feature/BAL-1355.
Assets ya optimizados en public/videos/macbook-neo/ y public/images/macbook-neo-v3/.
Imágenes existentes en public/images/macbook-neo/.

TAREA:
Construir la BASE COMPARTIDA para las 3 variantes de la landing MacBook Neo.
Todo va en: src/app/prototipos/0.5/macbook-neo-v3/shared/

DEPENDENCIAS:
```bash
npm install gsap @studio-freight/lenis
```

PASO 1 — HOOKS (shared/hooks/):

1a. useGSAP.ts:
- Registra ScrollTrigger
- Devuelve gsap y ScrollTrigger
- Cleanup automático con gsap.context

1b. useLenis.ts:
- Inicializa Lenis con: duration 1.2, smoothWheel true
- Integra con GSAP: lenis.on('scroll', ScrollTrigger.update)
- gsap.ticker.add para sync
- Cleanup en unmount (lenis.destroy)

1c. useVideoScroll.ts:
- Recibe: videoSrc string
- Devuelve: videoRef, containerRef
- ScrollTrigger con scrub:true
- onUpdate: video.currentTime = progress * duration
- Container height configurable (default 300vh)

1d. useCanvasScrub.ts:
- Recibe: frameUrls string[], containerHeight string
- Pre-carga todos los frames
- ScrollTrigger con scrub:true
- onUpdate: dibuja frame[Math.floor(progress * totalFrames)]
- Devuelve: canvasRef, containerRef, loaded boolean

1e. useInView.ts:
- IntersectionObserver simple
- Devuelve: ref, isInView boolean
- threshold configurable (default 0.1)

PASO 2 — COMPONENTES SHARED (shared/components/):

2a. StickyNav.tsx:
- Fixed top, h-11, backdrop-blur-xl bg-white/72
- "MacBook Neo" a la izquierda
- Links: Overview, Tech Specs, Compare + "Buy" en azul
- Transiciona de transparent a visible después de 5vh scroll
- Mobile: solo logo + Buy

2b. ScrollProgress.tsx:
- Fixed debajo del nav, h-[1.5px]
- Gradiente: #2997FF → #5AC8FA
- width = scroll progress %
- Desaparece al llegar al footer (opacity 0 cuando progress > 0.95)

2c. RevealOnScroll.tsx:
- Wrapper genérico
- Props: delay, duration, y, ease, stagger (para hijos), className
- Usa GSAP ScrollTrigger con toggleActions: 'play none none none'
- start: 'top 85%'
- Default: opacity 0→1, y 40→0, duration 0.8, ease 'power2.out'

2d. AnimatedCounter.tsx:
- Props: end number, suffix string, duration number, separator boolean
- ScrollTrigger once:true, start: 'top 85%'
- gsap.to con onUpdate que actualiza textContent
- ease: 'power2.out'
- Separator de miles si separator=true

2e. SectionHeader.tsx:
- Props: eyebrow?, title (string con HTML), description?, dark?, center?
- Eyebrow: 0.85rem, uppercase, tracking 0.05em, color según dark
- Title: clamp(2rem,5vw,3rem), weight 700, tracking -0.025em
  Usa dangerouslySetInnerHTML para soportar <br>
- Description: clamp(0.95rem,2vw,1.15rem), max-w-560, lineHeight 1.55
- Cada parte envuelta en RevealOnScroll con delay escalonado

2f. VideoScroller.tsx:
- Props: src string, webmSrc? string, poster? string, height? string
- Usa useVideoScroll
- Container con height configurable (default 300vh)
- Video sticky en 100vh, centrado
- Poster image mientras carga
- <source> con MP4 y WebM

2g. CanvasScrubber.tsx:
- Props: frameUrls string[], height? string
- Usa useCanvasScrub
- Canvas responsive (width 100%, max-width configurable)
- Loading state mientras pre-carga frames

2h. ColorPicker.tsx:
- Props: colors array de { name, hex, imageSrc }
- Dots con color real, activo tiene border + scale
- Crossfade entre imágenes (opacity transition 500ms)
- Nombre del color debajo

2i. FinancingCTA.tsx (BALDECASH — igual en todas las variantes):
- Fondo #000
- "Desde" text-[clamp(3rem,8vw,5.5rem)] text-[#f5f5f7]
- Monto "S/XXX" en text-[#4247d2] (color BaldeCash)
- "/mes" mismo tamaño
- Subtítulo "Tu MacBook Neo financiada. Sin historial crediticio." text-[#86868b]
- Botón primario: "Solicitar financiamiento" bg-[#4247d2] rounded-full px-8 py-3
  Hover: bg-[#363bc2] scale-[1.02] transition-all duration-200
- Link: "Ver plan de cuotas ›" text-[#2997FF]
- RevealOnScroll en cada elemento

PASO 3 — CONFIG DE VARIANTES (shared/lib/variants.ts):

```typescript
export type VariantType = 'premium' | 'balanced' | 'lite';

export interface VariantConfig {
  name: string;
  description: string;
  useLenis: boolean;
  useVideoHero: boolean;
  useCanvasScrub: boolean;
  useVideoBackgrounds: boolean;
  useGSAPScrub: boolean;          // scrub:true vinculado al scroll
  useGSAPToggle: boolean;         // toggleActions (play on enter)
  useParallax: boolean;
  parallaxIntensity: number;      // yPercent
  staggerDelay: number;
  revealDuration: number;
  revealEase: string;
  heroHeight: string;             // vh del container sticky
  assets: {
    heroVideo?: string;
    heroVideoWebm?: string;
    heroPoster?: string;
    heroImage: string;
    sequenceFrames?: string[];
    // ... resto de imágenes
  };
}

export const variants: Record<VariantType, VariantConfig> = {
  premium: {
    name: 'Premium',
    description: 'Video scrubbing + canvas + full GSAP',
    useLenis: true,
    useVideoHero: true,
    useCanvasScrub: true,
    useVideoBackgrounds: true,
    useGSAPScrub: true,
    useGSAPToggle: true,
    useParallax: true,
    parallaxIntensity: -12,
    staggerDelay: 0.06,
    revealDuration: 0.85,
    revealEase: 'power2.out',
    heroHeight: '300vh',
    assets: {
      heroVideo: '/videos/macbook-neo/hero.mp4',
      heroVideoWebm: '/videos/macbook-neo/hero.webm',
      heroPoster: '/images/macbook-neo-v3/hero-poster.jpg',
      heroImage: '/images/macbook-neo/hero_endframe_2x.jpg',
    },
  },
  balanced: {
    name: 'Balanced',
    description: 'Autoplay video + imágenes + GSAP',
    useLenis: true,
    useVideoHero: false,     // autoplay, no scrub
    useCanvasScrub: false,
    useVideoBackgrounds: false,
    useGSAPScrub: true,
    useGSAPToggle: true,
    useParallax: true,
    parallaxIntensity: -8,
    staggerDelay: 0.06,
    revealDuration: 0.8,
    revealEase: 'power2.out',
    heroHeight: '150vh',
    assets: {
      heroVideo: '/videos/macbook-neo/hero.mp4',
      heroPoster: '/images/macbook-neo-v3/hero-poster.jpg',
      heroImage: '/images/macbook-neo/hero_endframe_2x.jpg',
    },
  },
  lite: {
    name: 'Lite',
    description: 'Solo imágenes + CSS animations',
    useLenis: false,
    useVideoHero: false,
    useCanvasScrub: false,
    useVideoBackgrounds: false,
    useGSAPScrub: false,
    useGSAPToggle: false,
    useParallax: false,
    parallaxIntensity: 0,
    staggerDelay: 0,
    revealDuration: 0.6,
    revealEase: 'ease-out',
    heroHeight: '100vh',
    assets: {
      heroImage: '/images/macbook-neo/hero_endframe_2x.jpg',
    },
  },
};
```

PASO 4 — ANIMATIONS CONFIG (shared/lib/animations.ts):
Presets reutilizables:
```typescript
export const presets = {
  revealUp: { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' },
  revealScale: { opacity: 0, scale: 0.95, duration: 1, ease: 'power2.out' },
  fadeOut: { opacity: 0, y: -50, ease: 'none' },
  parallax: (intensity: number) => ({ yPercent: intensity, ease: 'none' }),
  stagger: (delay: number) => ({ stagger: delay }),
  spring: { ease: 'back.out(1.4)', duration: 0.7 },
};

export const triggers = {
  scrub: { scrub: true },
  once: { toggleActions: 'play none none none', once: true },
  heroFade: { start: '10% top', end: '40% top', scrub: true },
  revealStart: { start: 'top 85%' },
};
```

PASO 5 — INDEX PAGE (page.tsx):
Página que muestra las 3 variantes con links:
- Título "MacBook Neo — Landing Variants"
- 3 cards: Premium, Balanced, Lite
- Cada card: nombre, descripción, peso estimado, link
- Rutas: /premium, /balanced, /lite
```

---

# FASE 4: Construir las 3 variantes

## Prompt Claude Code — Fase 4

```
CONTEXTO:
Repo webpage3.0, rama feature/BAL-1355.
La base compartida ya está en: src/app/prototipos/0.5/macbook-neo-v3/shared/
Assets en: public/videos/macbook-neo/ y public/images/macbook-neo-v3/

TAREA:
Construir las 3 variantes. Cada una importa componentes de ../shared/ 
y los compone de manera diferente.

═══════════════════════════════════════
VARIANTE A: PREMIUM (premium/)
═══════════════════════════════════════

Ruta: /prototipos/0.5/macbook-neo-v3/premium

Secciones en orden:

1. HERO — VideoScroller
   - Usa useVideoScroll con el video hero
   - Container 300vh, video sticky en 100vh
   - Título "MacBook Neo" + "Hello, Neo." se superponen al video
   - Título fade-out con ScrollTrigger scrub al scrollear
   - Subtítulo fade-out 5vh después del título

2. HIGHLIGHTS — Video tabs
   - 3 tabs: Colors, Performance, Display
   - Si hay videos por feature, cada tab reproduce un video corto (autoplay, loop)
   - Si no hay videos, crossfade entre imágenes
   - Auto-rotate 5s, pausa en hover
   - Barra de progreso visual debajo de los tabs

3. DESIGN — Video reveal
   - Fondo #000
   - Si hay video de los 4 laptops, autoplay+loop
   - Si no, imagen con reveal scale(0.92→1) + opacity
   - Título "Love at first Mac." con reveal palabra por palabra
   - Stagger 0.04s entre palabras

4. PRODUCT VIEWER — Canvas scrubbing
   - Si hay secuencia de frames 360°, usar CanvasScrubber
   - Container 400vh, canvas sticky en 100vh
   - El scroll rota el producto completo
   - Si no hay secuencia, usar ColorPicker con crossfade

5. PRODUCT GRID
   - 3 cards: display, keyboard, hero product view
   - Stagger reveal
   - Hover: translate-y -2px + shadow

6. PERFORMANCE — Slider con video
   - 4 slides con dots
   - Si hay videos por caso de uso, video autoplay en cada slide
   - Si no, imágenes con overlay gradient + texto

7. LIFESTYLE — Video background + parallax
   - Si hay video lifestyle, usar como background (autoplay, loop, muted)
   - Si no, imagen con parallax yPercent: -12
   - Overlay gradient con stats

8. DISPLAY — Dark + counters
   - Fondo #000
   - AnimatedCounters: 13", 3.6M, 500, 1B
   - Imagen display centrada

9. macOS — Grid 4 cards con stagger
10. CONTINUITY — Grid 6 items con stagger
11. PRIVACY — Grid 4 items con stagger
12. FINANCING CTA — FinancingCTA de shared (BaldeCash)
13. FOOTER

═══════════════════════════════════════
VARIANTE B: BALANCED (balanced/)
═══════════════════════════════════════

Ruta: /prototipos/0.5/macbook-neo-v3/balanced

Diferencias con Premium:

1. HERO — Video autoplay (NO scrubbing)
   - Video corto (5-8 seg) en autoplay+loop+muted
   - Fallback a imagen hero si video no carga
   - Container 150vh (no 300vh)
   - Título con fade ScrollTrigger scrub (igual que premium)

2. HIGHLIGHTS — Solo imágenes
   - Crossfade entre imágenes, sin video

3. DESIGN — Solo imagen
   - Reveal con scale + opacity, sin video

4. PRODUCT VIEWER — ColorPicker (sin canvas)
   - Crossfade entre las 4 imágenes de color

5. PERFORMANCE — Slider solo imágenes

6. LIFESTYLE — Imagen con parallax yPercent: -8 (más sutil)

7. Todo lo demás: igual que premium pero sin video backgrounds

═══════════════════════════════════════
VARIANTE C: LITE (lite/)
═══════════════════════════════════════

Ruta: /prototipos/0.5/macbook-neo-v3/lite

Diferencias fundamentales:

- SIN Lenis (scroll nativo del browser)
- SIN GSAP ScrollTrigger
- Animaciones con CSS @keyframes + IntersectionObserver (useInView)
- SIN video de ningún tipo
- Solo imágenes WebP optimizadas
- SIN parallax

1. HERO — Imagen estática
   - hero_endframe como next/image con priority
   - Título con CSS animation fadeIn al cargar
   - Container 100vh (no sticky)

2. HIGHLIGHTS — Tabs con CSS transitions
   - Imágenes con opacity transition (no GSAP)
   - Auto-rotate con setInterval

3. DESIGN — Imagen con CSS animation
   - Reveal con CSS: @keyframes fadeInUp

4. COLOR PICKER — Simple
   - Crossfade CSS (opacity transition 400ms)

5. PERFORMANCE — Slider CSS
   - translateX con CSS transition

6. LIFESTYLE — Imagen estática (sin parallax)
   - Overlay gradient con texto

7. COUNTERS — CSS counter con IntersectionObserver
   - requestAnimationFrame para animar el conteo

8. Grids (macOS, Continuity, Privacy):
   - CSS: animation fadeInUp con animation-delay escalonado
   - Trigger: IntersectionObserver vía useInView

9. FINANCING CTA — Mismo componente de shared

MOBILE EXTRA para Lite:
- Todas las imágenes con loading="lazy" excepto hero
- Imágenes en formato WebP con fallback JPG
- font-display: swap para evitar FOUT
- Total page weight objetivo: < 1.5 MB

═══════════════════════════════════════

Para CADA variante:
- page.tsx como server component que importa el Landing client component
- Landing component con 'use client'
- Importa Lenis solo si la config lo requiere (useLenis: true)
- Importa GSAP solo si la config lo requiere (useGSAPScrub/Toggle: true)
- Esto asegura tree-shaking: Lite no incluye GSAP ni Lenis en el bundle

Las rutas finales:
- /prototipos/0.5/macbook-neo-v3           → Index con links
- /prototipos/0.5/macbook-neo-v3/premium   → Variante Premium
- /prototipos/0.5/macbook-neo-v3/balanced  → Variante Balanced
- /prototipos/0.5/macbook-neo-v3/lite      → Variante Lite

Tipografía global: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif
Todos los componentes TypeScript strict.
prefers-reduced-motion: respetado en las 3 variantes.
```

---

## Resumen de ejecución

```
Claude Code Fase 1 → Explorar 49.5 GB, inventario de assets
        ↓
Tú decides qué assets usar
        ↓
Claude Code Fase 2 → Copiar + optimizar assets para web
        ↓
Claude Code Fase 3 → Construir base compartida (hooks, components, config)
        ↓
Claude Code Fase 4 → Construir 3 variantes que importan de shared/
        ↓
Revisas las 3 en localhost
        ↓
Iteras con feedback por variante
```

## Tips para iterar después

Usa este formato de feedback para Claude Code:

```
Revisé las 3 variantes en localhost. Feedback:

PREMIUM:
- [qué ajustar]

BALANCED:
- [qué ajustar]

LITE:
- [qué ajustar]

GENERAL (aplica a todas):
- [qué ajustar]
```
