# Apple-Style Scroll Animations — Skill para Claude Code
## Patrones GSAP + Lenis para landing pages premium

---

## Cuándo usar este skill
Cuando se pida crear landing pages con animaciones scroll-driven,
parallax, video scrubbing, o cualquier interacción al nivel de Apple.com.
Aplica a cualquier producto dentro de BaldeCash Web 3.0.

## Dependencias requeridas

```bash
npm install gsap @studio-freight/lenis
```

## Setup obligatorio

Todo componente que use animaciones debe:
1. Ser `'use client'`
2. Registrar ScrollTrigger: `gsap.registerPlugin(ScrollTrigger)`
3. Usar `gsap.context()` para cleanup automático
4. Respetar `prefers-reduced-motion`

```tsx
'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respetar prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // animaciones aquí
    }, containerRef);

    return () => ctx.revert(); // cleanup automático
  }, []);

  return <div ref={containerRef}>...</div>;
}
```

## Recetas de animación

### 1. Scroll-Driven (scrub)
El scroll CONTROLA la animación. No es un trigger, es un vínculo directo.
```tsx
// El progreso de la animación = posición del scroll
gsap.to(element, {
  opacity: 0,
  y: -50,
  scrollTrigger: {
    trigger: container,
    start: 'top top',      // cuándo empieza (elemento top = viewport top)
    end: '40% top',         // cuándo termina
    scrub: true,            // ← CLAVE: vincula al scroll
    // scrub: 0.5,          // alternativa: con smoothing de 0.5s
  },
});
```

### 2. Sticky + Pin
La sección se "pega" mientras contenido interno se transforma.
```tsx
gsap.to(innerContent, {
  x: -totalWidth,           // o cualquier transformación
  ease: 'none',
  scrollTrigger: {
    trigger: container,
    start: 'top top',
    end: () => `+=${totalWidth}`,
    scrub: 1,
    pin: true,               // ← pega el container
    anticipatePin: 1,         // ← previene salto visual
  },
});
```

### 3. Reveal on Scroll (trigger, no scrub)
Elemento aparece UNA VEZ al entrar en viewport.
```tsx
gsap.from(elements, {
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: 'power2.out',
  stagger: 0.06,             // delay entre elementos
  scrollTrigger: {
    trigger: section,
    start: 'top 85%',        // empieza cuando el top del section está al 85% del viewport
    toggleActions: 'play none none none',  // play al entrar, no reverse
  },
});
```

### 4. Parallax
Imagen se mueve más lento que el scroll.
```tsx
gsap.to(image, {
  yPercent: -12,             // negativo = se mueve más lento
  ease: 'none',
  scrollTrigger: {
    trigger: container,
    start: 'top bottom',     // desde que el container entra por abajo
    end: 'bottom top',       // hasta que sale por arriba
    scrub: true,
  },
});
```

### 5. Video Scrubbing
El scroll controla el currentTime del video.
```tsx
const video = videoRef.current;
video.pause(); // el scroll controla, no autoplay

ScrollTrigger.create({
  trigger: container,
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    if (video.duration) {
      video.currentTime = self.progress * video.duration;
    }
  },
});
```
Importante:
- Video debe tener: `muted playsInline preload="auto"`
- Container height: 300vh mínimo (más scroll = más control fino)
- Video sticky en 100vh dentro del container

### 6. Canvas Scrubbing (secuencia de frames)
Dibujar frame N en canvas según posición del scroll.
```tsx
// Pre-cargar frames
const frames: HTMLImageElement[] = await Promise.all(
  frameUrls.map(url => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  })
);

const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');
canvas.width = frames[0].width;
canvas.height = frames[0].height;

ScrollTrigger.create({
  trigger: container,
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    const i = Math.min(
      Math.floor(self.progress * (frames.length - 1)),
      frames.length - 1
    );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[i], 0, 0);
  },
});
```

### 7. Kinetic Typography (texto palabra por palabra)
```tsx
// Envolver cada palabra en un span
const words = title.split(' ').map((word, i) => (
  <span key={i} className="reveal-word inline-block">{word}&nbsp;</span>
));

// Animar con stagger
gsap.from('.reveal-word', {
  opacity: 0,
  y: 20,
  stagger: 0.04,
  duration: 0.6,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: titleContainer,
    start: 'top 80%',
    toggleActions: 'play none none none',
  },
});
```

### 8. Lenis Smooth Scroll
```tsx
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Sincronizar con GSAP
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## Presets de easing

```typescript
// Apple usa easings sutiles, nunca bouncy
const EASINGS = {
  // Para reveals (entrada de elementos)
  reveal: 'power2.out',        // desacelera al final, natural
  
  // Para scrub (vinculado al scroll)
  scrub: 'none',               // linear, el scroll ES el control
  
  // Para sliders/carruseles
  slide: 'power3.out',         // rápido al inicio, suave al final
  
  // Para micro-interactions (hover, click)
  micro: 'power1.inOut',       // suave ambos lados, 200ms
  
  // Para scale reveals
  scaleReveal: 'power2.out',   // 1s, de 0.92/0.95 a 1
  
  // NUNCA usar para Apple-style:
  // 'bounce', 'elastic', 'back' (demasiado playful)
};
```

## Timing reference

```typescript
const TIMING = {
  revealDuration: 0.8,        // reveal genérico
  scaleDuration: 1.0,         // scale reveal (más largo)
  staggerDelay: 0.06,         // entre elementos de un grid
  wordStagger: 0.04,          // entre palabras (kinetic type)
  crossfadeDuration: 0.6,     // entre imágenes/tabs
  hoverDuration: 0.2,         // micro-interactions
  navTransition: 0.4,         // nav appear/disappear
};
```

## Colores Apple

```css
/* Modo claro */
--apple-text: #1d1d1f;
--apple-text-secondary: #6e6e73;
--apple-link: #0066CC;
--apple-bg: #fbfbfd;
--apple-bg-card: #f5f5f7;
--apple-border: rgba(0,0,0,0.06);

/* Modo oscuro (secciones dark) */
--apple-text-dark: #f5f5f7;
--apple-text-dark-secondary: #86868b;
--apple-link-dark: #2997FF;
--apple-bg-dark: #000000;

/* BaldeCash accent */
--bc-primary: #4247d2;
--bc-primary-hover: #363bc2;
--bc-success: #22c55e;
```

## Tipografía Apple

```css
font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;

/* Hero title */
font-size: clamp(3rem, 10vw, 5.5rem);
font-weight: 700;
letter-spacing: -0.045em;
line-height: 1.02;

/* Section title */
font-size: clamp(2rem, 5vw, 3.2rem);
font-weight: 700;
letter-spacing: -0.025em;
line-height: 1.08;

/* Eyebrow */
font-size: 0.85rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;

/* Body */
font-size: clamp(0.95rem, 2vw, 1.15rem);
letter-spacing: -0.01em;
line-height: 1.55;
```

## Anti-patterns (NO hacer)

- NO usar ease 'bounce' o 'elastic' — Apple nunca hace bounce
- NO animar antes de que el elemento sea visible — siempre start: 'top 85%' mínimo
- NO usar stagger > 0.1s — se siente lento
- NO hacer parallax > yPercent: -15 — se ve agresivo
- NO usar scrub sin contenedor alto (mín 150vh para scrub)
- NO olvidar prefers-reduced-motion
- NO mezclar Lenis con scroll-behavior: smooth (conflicto)
- NO usar position: fixed dentro de elementos con ScrollTrigger pin
