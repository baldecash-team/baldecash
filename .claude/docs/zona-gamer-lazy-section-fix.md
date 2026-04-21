# Fix: Reemplazar dynamic() con LazySection (IntersectionObserver)

## Problema

`dynamic({ ssr: false })` saca el componente del bundle JS inicial pero **NO** espera al viewport para montarlo. En cuanto el cliente hidrata, descarga el chunk y monta el componente en el DOM — todas las imágenes (incluidas las de `background-image` CSS como en GamerSeries) se descargan inmediatamente aunque estén fuera de pantalla.

## Solución

Un componente `LazySection` con IntersectionObserver que solo monte sus children cuando el contenedor esté cerca del viewport. Esto reemplaza `dynamic()` para las secciones below-the-fold.

## Paso 1 — Crear LazySection

Crear `src/app/prototipos/0.6/components/zona-gamer/LazySection.tsx`:

```tsx
'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Distancia antes del viewport para pre-cargar (default: 200px) */
  rootMargin?: string;
  /** Altura mínima del placeholder para evitar layout shift */
  minHeight?: number;
}

export function LazySection({ children, rootMargin = '200px', minHeight = 100 }: LazySectionProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
}
```

## Paso 2 — Actualizar ZonaGamerLanding.tsx

1. **Quita** todos los `dynamic()` imports de las secciones below-the-fold
2. **Vuelve** a usar imports normales para todos los componentes
3. **Envuelve** las secciones below-the-fold con `<LazySection>`

```tsx
import { LazySection } from './LazySection';

// Imports normales — ya no usar dynamic()
import { GamerHero } from './GamerHero';
import { GamerPacks } from './GamerPacks';
import { GamerBrands } from './GamerBrands';
// ... todos los demás con import normal

// En el JSX:
<GamerHero ... />
<GamerPacks ... />

<LazySection minHeight={400}>
  <GamerBrands ... />
</LazySection>

<LazySection minHeight={500}>
  <GamerSeries ... />
</LazySection>

<LazySection minHeight={400}>
  <GamerGamesRanking ... />
</LazySection>

<LazySection minHeight={300}>
  <GamerAccessories ... />
</LazySection>

<LazySection minHeight={400}>
  <GamerStories ... />
</LazySection>

<LazySection minHeight={300}>
  <GamerFooter ... />
</LazySection>
```

## Por qué funciona

- El componente **no se monta en el DOM** hasta que el usuario scrollee cerca (200px antes del viewport)
- Si el componente no está en el DOM, el navegador no descarga ni sus imágenes `<Image>` ni sus `background-image` CSS
- Resuelve el problema de GamerSeries (background-image) que `dynamic()` no podía resolver
- `rootMargin: '200px'` pre-carga un poco antes de que sea visible para que no haya flash

## Valores de minHeight

Son aproximados para evitar layout shift (saltos al scrollear). Si ves saltos, ajústalos:

| Sección | minHeight sugerido |
|---------|-------------------|
| GamerBrands | 400 |
| GamerSeries | 500 |
| GamerGamesRanking | 400 |
| GamerAccessories | 300 |
| GamerStories | 400 |
| GamerFooter | 300 |

## Reglas

- **NO** cambiar el diseño visual — todo debe verse exactamente igual
- **NO** cambiar la funcionalidad — animaciones, interacciones, hover effects, todo igual
- Probar en dark mode Y light mode después de cada cambio
- Probar en mobile y desktop
- Si un cambio rompe algo visualmente, revertirlo

## Verificación

Después de los cambios, abrir DevTools > Network:

1. Recargar la página con cache deshabilitado
2. Filtrar por "Img" en Network
3. Verificar que las imágenes de GamerSeries (rog-strix.png, tuf-gaming.png, etc.) **NO** aparezcan al cargar
4. Scrollear hacia abajo — las imágenes deben aparecer en Network solo cuando la sección esté por entrar al viewport
