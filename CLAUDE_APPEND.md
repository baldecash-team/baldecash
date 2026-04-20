
---

## MacBook Neo V3 — Landing Premium con Video Scrubbing

### Contexto
Landing page especial para promocionar el MacBook Neo dentro de BaldeCash.
3 variantes (Premium, Balanced, Lite) con base compartida.

### Archivos de referencia
- `MACBOOK_NEO_V3_PLAN.md` — Plan completo de 4 fases con prompts
- `SKILL_APPLE_ANIMATIONS.md` — Recetas GSAP, Lenis, video/canvas scrubbing

### Estructura
```
src/app/prototipos/0.5/macbook-neo-v3/
├── shared/           ← Componentes, hooks, lib compartidos
├── premium/          ← Video scrubbing + canvas + full GSAP
├── balanced/         ← 1 video autoplay + imágenes + GSAP
└── lite/             ← Solo imágenes, CSS animations, sin GSAP
```

### Dependencias adicionales
```bash
npm install gsap @studio-freight/lenis
```

### Regla para esta landing
> Las convenciones de CONVENTIONS.md aplican para estructura general,
> pero la tipografía y colores de las secciones Apple usan el sistema
> Apple (-apple-system, colores #1d1d1f/#f5f5f7). La sección CTA de
> BaldeCash al final SÍ usa los colores de marca (#4247d2).
> Leer SKILL_APPLE_ANIMATIONS.md para patrones de animación.
