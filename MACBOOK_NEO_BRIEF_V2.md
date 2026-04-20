# MacBook Neo Landing V2 — Brief para Claude Code
## BaldeCash Web 3.0 · Rama: feature/BAL-1355

---

## Contexto

Ya existe una v1 de la landing del MacBook Neo en:
```
src/app/prototipos/0.5/macbook-neo/
```

La v2 debe vivir en una carpeta paralela para no romper lo existente y poder comparar ambas versiones. El objetivo de la v2 es alcanzar el nivel de calidad visual y de interacción de apple.com/macbook-neo usando scroll-driven animations profesionales.

## Estructura propuesta para v2

```
src/app/prototipos/0.5/macbook-neo-v2/
├── page.tsx                              ← Server component (ruta /prototipos/0.5/macbook-neo-v2)
├── macbook-neo-v2-preview/
│   └── page.tsx                          ← Preview route
├── components/
│   ├── MacbookNeoV2Landing.tsx           ← Client component principal (orquesta todo)
│   ├── StickyNav.tsx                     ← Nav Apple con backdrop-blur
│   ├── ScrollProgress.tsx                ← Barra progreso de scroll
│   ├── hero/
│   │   └── Hero.tsx                      ← Sticky hero + fade title + zoom image
│   ├── highlights/
│   │   └── HighlightsGallery.tsx         ← Tabs auto-rotate con transiciones
│   ├── design/
│   │   └── DesignSection.tsx             ← "Love at first Mac" (fondo negro)
│   ├── color-selector/
│   │   └── ColorPicker.tsx               ← Selector interactivo 4 colores
│   ├── product-details/
│   │   └── ProductGrid.tsx               ← Grid de fotos (display, keyboard, etc)
│   ├── performance/
│   │   └── PerformanceSlider.tsx          ← Slider con 4 casos de uso
│   ├── lifestyle/
│   │   └── LifestyleSection.tsx           ← Full-width + parallax + battery stats
│   ├── display/
│   │   └── DisplaySection.tsx             ← Dark section + animated counters
│   ├── macos/
│   │   └── MacOSSection.tsx               ← Features macOS
│   ├── continuity/
│   │   └── ContinuitySection.tsx          ← Mac + iPhone features
│   ├── privacy/
│   │   └── PrivacySection.tsx             ← Privacy & Security
│   ├── financing/
│   │   └── FinancingCTA.tsx               ← CTA adaptado a BaldeCash
│   └── shared/
│       ├── RevealOnScroll.tsx             ← Wrapper reutilizable con ScrollTrigger
│       ├── AnimatedCounter.tsx            ← Counter que anima al entrar en viewport
│       └── SectionHeader.tsx              ← Eyebrow + título + descripción
├── hooks/
│   ├── useGSAP.ts                        ← Hook wrapper para GSAP + ScrollTrigger
│   ├── useLenis.ts                       ← Hook para smooth scroll
│   └── useInView.ts                      ← IntersectionObserver hook
├── lib/
│   └── animations.ts                     ← Configs de animación reutilizables
├── data/
│   └── mockMacbookNeoData.ts             ← Reutilizar datos de v1 o copiar
└── types/
    └── macbook-neo.ts                    ← Reutilizar types de v1 o copiar
```

## Dependencias nuevas a instalar

```bash
npm install gsap @studio-freight/lenis
```

- **GSAP + ScrollTrigger**: Scroll-driven animations (la técnica principal de Apple)
- **Lenis**: Smooth scrolling interpolado (scroll "de seda")

Nota: El proyecto ya tiene `framer-motion`. GSAP se usa específicamente para ScrollTrigger (scrub vinculado al scroll), que es lo que framer-motion no hace tan bien.

## Imágenes disponibles

Las imágenes están en dos ubicaciones:
- `public/images/macbook-neo/`
- `assets/macbook-neo/`

| Archivo | Sección en v2 |
|---------|---------------|
| hero_endframe_2x.jpg | Hero (laptop en mano, principal) |
| hero_static_2x.jpg | Hero alternativo / full-width break |
| highlights_colors_2x.jpg | Highlights tab: Colors |
| highlights_battery_2x.jpg | Highlights tab: Battery |
| highlights_display_2x.jpg | Highlights tab: Display |
| design_endframe_2x.png | Design section (4 laptops, fondo negro) |
| performance_hero_1_2x.jpg | Performance: Productividad |
| performance_hero_2_2x.jpg | Performance: Estudios |
| performance_hero_3_2x.jpg | Performance: Trabajo |
| performance_hero_4_2x.jpg | Performance: Gaming |
| performance_lifestyle_2x.jpg | Lifestyle full-width |
| dca_display_2x.png | Display section |
| pv_hero_2x.jpg | Product details: hero |
| pv_display_2x.jpg | Product details: display |
| pv_keyboard_2x.jpg | Product details: keyboard |
| pv_colors_silver_2x.jpg | Color picker: Silver |
| pv_colors_blush_2x.jpg | Color picker: Blush |
| pv_colors_citrus_2x.jpg | Color picker: Citrus |
| pv_colors_indigo_2x.jpg | Color picker: Indigo |

## Las 6 técnicas Apple a implementar

### 1. Scroll-Driven Animations (GSAP ScrollTrigger)
La animación está controlada por la posición del scroll, no por tiempo.
```tsx
'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// El parámetro clave es scrub: true
// Esto vincula el progreso de la animación al scroll
gsap.to(titleRef.current, {
  opacity: 0,
  y: -50,
  scrollTrigger: {
    trigger: heroRef.current,
    start: 'top top',       // cuándo empieza
    end: '40% top',         // cuándo termina
    scrub: true,            // ← ESTO es lo que hace la magia Apple
  },
});
```

### 2. Sticky Scrolling con Pin (Galería horizontal)
Una sección se "pega" mientras el contenido dentro se mueve horizontalmente.
```tsx
gsap.to(trackRef.current, {
  x: -totalScrollWidth,
  ease: 'none',
  scrollTrigger: {
    trigger: containerRef.current,
    start: 'top top',
    end: () => `+=${totalScrollWidth}`,
    scrub: 1,
    pin: true,              // ← Pega la sección
    anticipatePin: 1,
  },
});
```

### 3. Smooth Scrolling (Lenis)
Reemplaza el scroll nativo del navegador con uno interpolado.
```tsx
'use client';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Integrar Lenis con GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
}
```

### 4. Reveal on Scroll con Stagger
Elementos que aparecen con delay escalonado entre ellos.
```tsx
gsap.from('.reveal-item', {
  opacity: 0,
  y: 40,
  stagger: 0.08,           // ← delay entre cada elemento
  duration: 0.8,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.section',
    start: 'top 80%',
    toggleActions: 'play none none none',
  },
});
```

### 5. Parallax en Imágenes
Imágenes que se mueven más lento que el scroll.
```tsx
gsap.to('.parallax-img', {
  yPercent: -15,
  ease: 'none',
  scrollTrigger: {
    trigger: '.parallax-container',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});
```

### 6. Animated Counters
Números que cuentan al entrar en viewport.
```tsx
// Componente reutilizable
function AnimatedCounter({ end, suffix }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: end,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.floor(this.targets()[0].val).toLocaleString() + (suffix || '');
          },
        });
      },
      once: true,
    });
  }, [end, suffix]);
  
  return <span ref={ref}>0{suffix}</span>;
}
```

## Especificaciones de diseño

### Tipografía
```css
/* Apple usa SF Pro (no pública). Alternativa: */
font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;

/* Headings hero */
font-size: clamp(3rem, 10vw, 5.5rem);
font-weight: 700;
letter-spacing: -0.045em;

/* Subtítulos */
font-size: clamp(1.3rem, 4vw, 2rem);
font-weight: 600;
letter-spacing: -0.02em;

/* Body */
font-size: clamp(0.95rem, 2vw, 1.15rem);
font-weight: 400;
line-height: 1.55;
letter-spacing: -0.01em;
```

### Colores Apple
```css
/* Textos */
--apple-text: #1d1d1f;
--apple-text-secondary: #6e6e73;
--apple-text-dark-primary: #f5f5f7;
--apple-text-dark-secondary: #86868b;

/* Links */
--apple-link: #0066CC;
--apple-link-dark: #2997FF;

/* Fondos */
--apple-bg: #fbfbfd;
--apple-bg-card: #f5f5f7;
--apple-bg-dark: #000000;

/* Bordes */
--apple-border: rgba(0,0,0,0.06);
```

### Colores BaldeCash (para sección CTA/Financing)
```css
--bc-primary: #4247d2;
--bc-primary-hover: #363bc2;
--bc-success: #22c55e;
```

## Secciones con specs de animación

| # | Sección | Fondo | Animación principal | Imagen(es) |
|---|---------|-------|---------------------|------------|
| 1 | Hero | #fbfbfd | Sticky + title fade + image zoom-out (scrub) | hero_endframe_2x.jpg |
| 2 | Highlights | #fbfbfd | Tabs auto-rotate 5s + crossfade | colors, battery, display |
| 3 | Design | #000 | Image scale 0.95→1 + text stagger | design_endframe_2x.png |
| 4 | Color Picker | #fbfbfd | Crossfade entre 4 imágenes | pv_colors_*.jpg |
| 5 | Product Grid | #fbfbfd | Stagger reveal cards | pv_hero, pv_display, keyboard |
| 6 | Performance | #fff | Slider con dots + overlay gradient | performance_hero_1-4 |
| 7 | Lifestyle | full-width | Parallax image + overlay stats | performance_lifestyle |
| 8 | Display | #000 | Animated counters (13", 3.6M, 500, 1B) | dca_display_2x.png |
| 9 | macOS | #fbfbfd | Stagger grid reveal | — |
| 10 | Continuity | #fff | Stagger grid reveal | — |
| 11 | Privacy | #fbfbfd | Stagger grid reveal | — |
| 12 | CTA (BaldeCash) | #000 | Counter "Desde S/XXX/mes" + botones BaldeCash | — |

## CTA adaptado a BaldeCash

La sección final es donde BaldeCash se diferencia de Apple. En vez de "Starting at $999":

```tsx
<section className="bg-black py-20 text-center">
  {/* Precio en cuotas (prominente, estilo Apple) */}
  <p className="text-[clamp(3rem,8vw,5.5rem)] font-bold text-[#f5f5f7]">
    Desde <span className="text-[#4247d2]">S/XXX</span>/mes
  </p>
  <p className="text-[#86868b] mt-3 text-lg">
    Tu MacBook Neo financiada. Sin historial crediticio.
  </p>
  
  {/* Botones BaldeCash */}
  <div className="flex gap-4 justify-center mt-8">
    <a className="bg-[#4247d2] text-white px-8 py-3 rounded-full font-semibold">
      Solicitar financiamiento
    </a>
    <a className="text-[#2997FF]">
      Ver plan de cuotas ›
    </a>
  </div>
</section>
```

## Prompt para Claude Code

```
Lee MACBOOK_NEO_BRIEF.md en la raíz del proyecto.

Crea la landing v2 del MacBook Neo en:
src/app/prototipos/0.5/macbook-neo-v2/

Contexto: Ya existe una v1 en src/app/prototipos/0.5/macbook-neo/ 
que puedes consultar como referencia. La v2 debe ser una mejora 
significativa con animaciones Apple-level.

Pasos:
1. Instala gsap y @studio-freight/lenis
2. Crea la estructura de carpetas según el brief
3. Las imágenes están en public/images/macbook-neo/ y assets/macbook-neo/
4. Reutiliza types y data de v1 donde tenga sentido
5. Implementa las 6 técnicas Apple del brief:
   - GSAP ScrollTrigger con scrub:true para hero y parallax
   - Lenis para smooth scrolling
   - Sticky pin para galería horizontal
   - Reveal con stagger para textos y grids
   - Animated counters para stats
   - Crossfade para color picker
6. La sección CTA final debe usar branding BaldeCash (#4247d2)
7. Mobile-first, todos los componentes 'use client'
8. La ruta debe ser /prototipos/0.5/macbook-neo-v2

Referencia visual: https://www.apple.com/macbook-neo/
```

## Checklist de calidad

- [ ] Lenis smooth scroll funcionando
- [ ] Hero sticky con fade-out del título al scrollear (scrub)
- [ ] Imagen hero con zoom-out parallax (scrub)
- [ ] Highlights con tabs auto-rotate y crossfade
- [ ] Design section con reveal stagger del texto
- [ ] Color picker interactivo (4 colores, crossfade)
- [ ] Product grid con stagger reveal
- [ ] Performance slider con dots de navegación
- [ ] Lifestyle con parallax real en la imagen
- [ ] Display con counters animados
- [ ] macOS/Continuity/Privacy con grids stagger
- [ ] CTA con branding BaldeCash y cuota prominente
- [ ] Nav con backdrop-blur que aparece al scrollear
- [ ] Barra de progreso de scroll
- [ ] Responsive: mobile → tablet → desktop
- [ ] next/image para optimización de imágenes
- [ ] Las 19 imágenes del MacBook Neo utilizadas
- [ ] Ruta accesible en /prototipos/0.5/macbook-neo-v2
