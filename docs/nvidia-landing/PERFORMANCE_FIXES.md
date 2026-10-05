# Landing NVIDIA — Plan de optimización de rendimiento

**Para:** Silvana  
**Fecha:** 2026-06-15  
**Contexto:** Análisis de rendimiento de la landing `/nvidia/` ya implementada. Se identificaron 10 problemas. Este documento tiene todo lo necesario para que tu Claude los aborde punto por punto, con pruebas antes y después de cada cambio.

---

## Resumen ejecutivo

| Severidad | N° | Problema | Impacto estimado |
|-----------|----|---------|-|
| 🔴 Crítico | 2 | Fetch del catálogo en cliente + CSS inline en JS | LCP +800ms, bundle +40KB |
| 🟠 Alto | 4 | Videos sin poster/dimensiones, MutationObserver agresivo, text-shadow animado | CLS 0.15-0.25, jank móvil |
| 🟡 Medio | 4 | Selector anima propiedades costosas, imgs sin dimensiones, scroll sin debounce, Google Fonts desde JS | CLS potencial, scroll jank |

**LCP actual estimado:** ~3-4s en móvil  
**LCP objetivo:** ~1.5-2s

---

## Cómo trabajar en este documento

Comparte este archivo completo con tu Claude. Pídele que implemente **un fix a la vez**, en el orden de la tabla de arriba (críticos primero). Después de cada fix, ejecuta la prueba asociada antes de pasar al siguiente.

**Nunca hacer `npm run build`** — MacBook Air 8GB. Solo `npm run dev`.

---

## Archivos involucrados

| Archivo | Qué contiene |
|---------|-------------|
| `src/app/prototipos/0.6/components/product-landing/NvidiaLanding.tsx` | Componente principal (~900 líneas): hero, nav, secciones S1-S8, CSS inline, hooks |
| `src/app/prototipos/0.6/components/product-landing/nvidia/NvidiaCatalogSection.tsx` | Sección catálogo con fetch en cliente |
| `src/app/prototipos/0.6/components/product-landing/data/nvidiaData.ts` | Datos estáticos y constante `NVIDIA_ASSETS` |

---

## FIX 1 — Videos sin `poster` ni dimensiones (CLS + pantalla negra)

**Archivos:** `NvidiaLanding.tsx:164` y `NvidiaLanding.tsx:257`

### Problema

Ambos videos no tienen imagen de poster ni dimensiones declaradas. Resultado:
- Mientras carga el video aparece una pantalla negra (mala UX).
- Sin `width`/`height`, el navegador no reserva espacio → Cumulative Layout Shift (CLS ≈ 0.1-0.2).
- El hero video usa `preload="auto"` incluso cuando `tier === 'base'` (mobile/batería baja) — descarga el video completo aunque no se reproduzca.

### Código actual

```tsx
// NvidiaLanding.tsx:164 — Hero video
<video autoPlay={tier === 'enhanced'} muted loop playsInline preload="auto">
  <source src={heroData.video} type="video/mp4" />
</video>

// NvidiaLanding.tsx:257 — Video GPU (segunda sección)
<video muted playsInline autoPlay preload="auto">
  <source src={queEsData.video} type="video/mp4" />
</video>
```

### Fix a implementar

```tsx
// NvidiaLanding.tsx:164 — Hero video
<video
  autoPlay={tier === 'enhanced'}
  muted
  loop
  playsInline
  preload={tier === 'enhanced' ? 'auto' : 'metadata'}
  poster={`${NVIDIA_ASSETS}/backgrounds/fondo-header.png`}
  width={1280}
  height={720}
>
  <source src={heroData.video} type="video/mp4" />
</video>

// NvidiaLanding.tsx:257 — Video GPU
<video
  muted
  playsInline
  autoPlay
  preload="metadata"
  poster={`${NVIDIA_ASSETS}/backgrounds/fondo-estrellas.png`}
  width={1280}
  height={720}
>
  <source src={queEsData.video} type="video/mp4" />
</video>
```

> **Nota sobre el poster:** Si `fondo-estrellas.png` no luce bien como poster del segundo video, usar cualquiera de los otros backgrounds de `NVIDIA_ASSETS/backgrounds/`. Lo importante es que no aparezca pantalla negra.

### Prueba

1. `npm run dev` → navegar a `http://localhost:3000/prototipos/0.6/nvidia/`
2. Verificar que el hero carga con imagen de fondo (no negro) mientras el video carga.
3. Abrir DevTools → Network → filtrar "video" → confirmar que en pantalla móvil simulada (Chrome DevTools, throttling "Slow 4G") el hero video NO descarga completo antes de reproducir.
4. En DevTools → Performance → Lighthouse (mobile) → verificar que CLS bajó del valor anterior.

---

## FIX 2 — `MutationObserver` con `subtree: true` agresivo

**Archivo:** `NvidiaLanding.tsx:64-66`

### Problema

`useScrollReveal` usa un `MutationObserver` para detectar cuando nuevas secciones lazy se montan y agregarlas al `IntersectionObserver`. El problema está en `subtree: true`: observa **todo el árbol** de `.nvidia-landing`. Cada vez que se monta una sección lazy (o cualquier re-render interno), el observer dispara y vuelve a llamar `scan()` sobre todos los elementos `.reveal` de la página. Con 8 secciones lazy y sus renders internos, esto genera decenas de llamadas redundantes y causa jank perceptible mientras el usuario hace scroll.

### Código actual

```tsx
// NvidiaLanding.tsx:62-67
function useScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.nvidia-landing');
    if (!root) return;
    // ...
    const scan = () => root.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });  // ← el problema
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}
```

### Fix a implementar

Dos cambios:
1. Quitar `subtree: true` — así solo reacciona a hijos directos de `.nvidia-landing` (las secciones de primer nivel), no a re-renders internos.
2. Agregar `debounce` simple con `requestAnimationFrame` para colapsar llamadas múltiples en el mismo frame.

```tsx
// NvidiaLanding.tsx — reemplazar useScrollReveal completo
function useScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.nvidia-landing');
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    let rafId = 0;
    const scan = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() =>
        root.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
      );
    };
    scan();
    // Solo childList sin subtree: detecta montaje de <section> pero no re-renders
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true });
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(rafId); };
  }, []);
}
```

### Prueba

1. `npm run dev` → abrir `http://localhost:3000/prototipos/0.6/nvidia/`
2. DevTools → Performance → Grabar 5 segundos de scroll suave desde el top.
3. Verificar que NO aparecen bloques rojos de "Recalculate Style" o "Layout" agrupados en ráfagas (eso indicaba los MutationObserver múltiples).
4. Verificar que las animaciones `.reveal` siguen funcionando — cada sección debe aparecer con fade+slide al entrar en viewport.

---

## FIX 3 — Animación `text-shadow` en loop infinito

**Archivo:** `NvidiaLanding.tsx` dentro del bloque `const CSS = \`...\`` (buscar `gtTabGlow`)

### Problema

El tab "RTX 5050 ★" (marcado como `gt-hot`) tiene una animación CSS `gtTabGlow` que anima `text-shadow` en bucle infinito (`animation: gtTabGlow 1.5s ease-in-out infinite`). `text-shadow` es una propiedad que **no puede ser acelerada por GPU** — el navegador tiene que recalcular el compositing en cada frame. En mobile esto causa que la sección del catálogo corra a ~30fps en vez de 60fps.

### Código actual (dentro del CSS inline)

Buscar en `NvidiaLanding.tsx` (dentro del string `CSS`) la regla:
```css
@keyframes gtTabGlow {
  /* anima text-shadow */
}
.nvidia-landing .gt-hot { animation: gtTabGlow 1.5s ease-in-out infinite; }
```

### Fix a implementar

Reemplazar la animación de `text-shadow` por una animación de `filter: drop-shadow()` (GPU-accelerated) con `@media (prefers-reduced-motion: no-preference)`:

```css
/* Dentro del string CSS, reemplazar el bloque de .gt-hot y @keyframes gtTabGlow */

@keyframes gtTabGlow {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(143,224,0,.0)); }
  50%       { filter: drop-shadow(0 0 6px rgba(143,224,0,.7)); }
}

.nvidia-landing .gt-hot {
  color: var(--green-glow);
}

@media (prefers-reduced-motion: no-preference) {
  .nvidia-landing .gt-hot { animation: gtTabGlow 1.5s ease-in-out infinite; }
}
```

> `filter: drop-shadow()` usa la GPU (igual que `transform`/`opacity`) — no fuerza layout recalculation.  
> La condición `prefers-reduced-motion: no-preference` hace que la animación no corra si el usuario tiene activado "reducir movimiento" en su sistema.

### Prueba

1. `npm run dev` → navegar a la sección del catálogo en `/nvidia/`
2. Verificar visualmente que el tab "RTX 5050 ★" sigue brillando (el efecto se ve igual).
3. DevTools → Rendering → activar "Paint flashing" — el tab NO debe mostrar flashes verdes en cada frame (eso indicaría repintado en CPU). Con la corrección no debería haber flashes en el tab.

---

## FIX 4 — Selector de software: anima `left/top/width/height` (layout thrashing)

**Archivo:** `NvidiaLanding.tsx:365`

### Problema

El mosaico de software (4 tiles) usa una animación que cambia `left`, `top`, `width`, `height` — cuatro propiedades que fuerzan al navegador a recalcular el layout en cada frame (layout thrashing). Esto ocurre cada vez que el usuario expande/colapsa un tile.

```tsx
// NvidiaLanding.tsx:365
const SEL_SIZE_T = `left .55s ${SEL_EASE},top .55s ${SEL_EASE},width .55s ${SEL_EASE},height .55s ${SEL_EASE}`;
```

### Fix a implementar

La solución es usar `transform: translate() scale()` en lugar de `left/top/width/height`. Esto requiere cambiar la lógica de `tileStyle` para que trabaje con transforms en vez de posición absoluta:

```tsx
// NvidiaLanding.tsx — reemplazar SEL_SIZE_T y tileStyle()

const SEL_SIZE_T = `transform .55s ${SEL_EASE}, opacity .3s`;

const tileStyle = (i: number): CSSProperties => {
  const { w: W, h: H } = dims;
  if (W === 0) return { opacity: 0 };
  const cw = (W - SEL_GAP) / 2;
  const ch = (H - SEL_GAP) / 2;
  const c = i % 2;
  const r = Math.floor(i / 2);

  // Base: posición grid (absoluta, fija — no se anima)
  const baseLeft = c * (cw + SEL_GAP);
  const baseTop = r * (ch + SEL_GAP);

  if (active != null) {
    if (i === active) {
      // El tile activo se transforma para llenar el contenedor
      const scaleX = W / cw;
      const scaleY = H / ch;
      const tx = -baseLeft;
      const ty = -baseTop;
      return {
        left: baseLeft, top: baseTop, width: cw, height: ch,
        opacity: 1, zIndex: 5,
        transform: `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`,
        transformOrigin: '0 0',
        transition: `transform .55s ${SEL_EASE}, box-shadow .3s`,
      };
    }
    return {
      left: baseLeft, top: baseTop, width: cw, height: ch,
      opacity: 0, pointerEvents: 'none',
      transform: 'none',
      transition: 'opacity 0s',
    };
  }
  // Colapsado
  return {
    left: baseLeft, top: baseTop, width: cw, height: ch,
    opacity: 1,
    transform: 'none',
    transition: `transform .55s ${SEL_EASE}, opacity .3s .4s ${SEL_EASE}, box-shadow .3s`,
  };
};
```

> **Nota:** Este es el fix de mayor riesgo visual. Si el scale distorsiona el contenido del tile expandido, ajustar el enfoque: mantener `position: absolute` con las coords fijas y solo animar con `transform: translate()` para el movimiento (sin scale). Validar visualmente antes de commitear.

### Prueba

1. `npm run dev` → navegar a la sección "Tarjetas gráficas según tu carrera".
2. Hacer click en cada tile — verificar que la expansión se ve igual que antes (tile llena el mosaico).
3. DevTools → Performance → Grabar mientras se expande/colapsa un tile. Verificar que NO aparecen bloques amarillos de "Layout" en el timeline (esos eran el layout thrashing). Solo debe haber "Composite Layers".

---

## FIX 5 — Imágenes sin dimensiones (`width`/`height`)

**Archivo:** `NvidiaLanding.tsx:191, 264, 292`

### Problema

Tres grupos de imágenes below-fold no tienen `width` y `height` declarados. El navegador no puede reservar el espacio antes de cargar la imagen → CLS al cargar.

```tsx
// NvidiaLanding.tsx:191 — Imagen de Baldi
<img src={quienesSomos.media} alt="..." loading="lazy" />

// NvidiaLanding.tsx:264 — Chips GPU (en el loop)
<img src={gpuChipUrl(c.model)} alt={c.name} loading="lazy" />

// NvidiaLanding.tsx:292 — Cards de beneficios (en el loop)
<img src={c.img} alt={c.title} loading="lazy" />
```

### Fix a implementar

Agregar dimensiones explícitas basadas en los tamaños reales de los assets S3:

```tsx
// NvidiaLanding.tsx:191 — Imagen de Baldi (máx 380px según el CSS)
<img
  src={quienesSomos.media}
  alt="Baldi de BaldeCash con una laptop GeForce RTX"
  loading="lazy"
  width={380}
  height={380}
/>

// NvidiaLanding.tsx:264 — Chips GPU (imágenes cuadradas ~200px)
<img
  src={gpuChipUrl(c.model)}
  alt={c.name}
  loading="lazy"
  width={200}
  height={200}
/>

// NvidiaLanding.tsx:292 — Cards de beneficios (img decorativa, ~64px)
<img
  src={c.img}
  alt={c.title}
  loading="lazy"
  width={64}
  height={64}
/>
```

> Si los tamaños exactos son distintos, ajustar. Lo importante es el **aspect ratio** correcto para que el navegador pueda reservar espacio. Usar las dimensiones reales de los archivos en S3 si se pueden verificar.

### Prueba

1. `npm run dev` → navegar a `/nvidia/`
2. DevTools → Network → desactivar caché (checkbox "Disable cache").
3. Recargar y observar la sección "Quiénes somos" y la sección de chips GPU. Con el fix, el layout **no debe saltar** al cargar las imágenes — el espacio ya estaba reservado.
4. Ejecutar Lighthouse móvil → verificar que CLS bajó.

---

## FIX 6 — Scroll listener sin debounce

**Archivo:** `NvidiaLanding.tsx:109-114`

### Problema

El listener de scroll para detectar si el navbar está "scrolled" llama `setScrolled()` en cada evento de scroll. En desktop esto es ~60 veces/segundo; en móvil puede ser más. Aunque usa `{ passive: true }` (correcto), cada llamada a `setScrolled()` puede triggear un re-render si el valor cambia mientras el usuario scrollea lentamente alrededor del umbral de 60px.

```tsx
// NvidiaLanding.tsx:109-114
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

### Fix a implementar

Throttle con `requestAnimationFrame`:

```tsx
// NvidiaLanding.tsx — reemplazar el useEffect del scroll
useEffect(() => {
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

### Prueba

1. `npm run dev` → abrir DevTools → Performance.
2. Grabar 3 segundos de scroll.
3. Verificar que `setScrolled` solo aparece en el flame graph **una vez por frame** (60fps = 60 llamadas/seg máx), no más.
4. Verificar que el navbar sigue cambiando de estilo (fondo translúcido) al pasar los 60px.

---

## FIX 7 — Google Fonts desde `useEffect` (bloquea pintura inicial)

**Archivo:** `NvidiaLanding.tsx:79-85`

### Problema

Las fuentes Baloo 2 se cargan desde JavaScript (`useEffect`) en vez del HTML. Esto significa que el navegador no sabe que necesita la fuente hasta que React hidrata el componente (post-JS). Durante ese tiempo, el texto se muestra con la fuente de fallback y luego "salta" a Baloo 2 (Flash of Unstyled Text).

```tsx
// NvidiaLanding.tsx:79-85 — actual (carga tardía)
useEffect(() => {
  const id = 'nvidia-google-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS;
  document.head.appendChild(link);
}, []);
```

### Fix a implementar

Mover el `<link>` de Google Fonts al `return` del componente (antes del `<style>{CSS}</style>`), usando `preconnect` + `<link>` declarativo:

```tsx
// NvidiaLanding.tsx — dentro del return, junto a los preconnects existentes
return (
  <>
    <div className="nvidia-landing" style={{ paddingTop: previewBannerOffset }}>
      {/* Preconnects y fonts — declarativos (no desde useEffect) */}
      <link rel="preconnect" href="https://baldecash.s3.amazonaws.com" />
      <link rel="dns-prefetch" href="https://baldecash.s3.amazonaws.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        id="nvidia-google-fonts"
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap"
      />
      <style>{CSS}</style>
      {/* ... resto del JSX ... */}
```

Y **eliminar** el `useEffect` de Google Fonts (líneas 79-85).

> **Nota sobre duplicados:** Sin el `useEffect`, ya no hay guard de duplicados. En Next.js App Router, React deduplica automáticamente `<link rel="stylesheet">` con el mismo `href` por el mecanismo de deduplicación de React. Si se navega entre páginas (SPA), el link puede aparecer dos veces pero no afecta — el navegador ya tiene la fuente cacheada. Si se necesita el guard, mantenerlo pero con `suppressHydrationWarning` en el link.

### Prueba

1. `npm run dev` → abrir `/nvidia/` con DevTools → Network → tab "Font".
2. Verificar que la fuente Baloo 2 se solicita en los primeros 500ms (junto con el HTML), no después de que JS hidrata.
3. Verificar que el texto del hero aparece directamente con la fuente correcta (sin flash de Arial/system font).

---

## FIX 8 — CSS inline en bundle JS (~3.5KB en el bundle)

**Archivo:** `NvidiaLanding.tsx:607-887+`

### Problema

El bloque `const CSS = \`...\`` tiene ~280 líneas de CSS (~3.5KB minificado) embebido dentro del archivo JavaScript. Esto:
1. Infla el bundle JS (~40KB adicionales en bytes serializados).
2. El CSS se aplica **después** de que JS corre (no en el HTML inicial) → posible FOUC (flash de estilos sin aplicar).
3. No puede ser cacheado separadamente del JS.

### Fix a implementar

Mover el CSS a un archivo `.module.css` separado:

**Crear:** `src/app/prototipos/0.6/components/product-landing/NvidiaLanding.module.css`

Copiar el contenido del bloque `const CSS` al archivo `.module.css`.

**Ajustes al importar:**
- Las clases globales (`.nvidia-landing`, `.reveal`, `.btn-green`) deben ir en un archivo CSS global, no en CSS Modules (que hashea los nombres).
- Alternativa: usar `import styles from './NvidiaLanding.module.css'` para clases específicas del componente, y mover las globales a `globals.css` bajo un scope `.nvidia-landing`.

**Approach más simple (recomendado para empezar):**

```tsx
// NvidiaLanding.tsx — agregar al inicio del archivo
import './NvidiaLanding.css';  // CSS global con scope .nvidia-landing

// Y eliminar: const CSS = `...` y <style>{CSS}</style>
```

Crear `NvidiaLanding.css` junto al componente con el mismo contenido del bloque `CSS`.

> **Importante:** Next.js solo permite importar CSS global desde layouts y pages, no desde componentes cliente arbitrarios. Si el import desde el componente da error, mover el `import` al `layout.tsx` de la landing o a `globals.css`.

### Prueba

1. Verificar que el landing se ve igual antes y después del cambio (sin FOUC, todos los estilos aplicados).
2. Verificar en DevTools → Network que aparece un archivo `.css` separado en el initial load.
3. Lighthouse → verificar que "Eliminate render-blocking resources" ya no menciona el CSS inline.

> **Este es el fix de mayor complejidad arquitectónica. Dejarlo para el final si los demás fixes ya suman una mejora significativa.**

---

## FIX 9 — Catálogo: fetch en cliente (waterfall LCP +800ms)

**Archivo:** `NvidiaCatalogSection.tsx:110-123`

### Problema

El catálogo de hasta 200 laptops se descarga en un `useEffect` del cliente. El waterfall es:
1. HTML llega al browser
2. React JS descarga y corre
3. Hidratación
4. Solo entonces: `useEffect` dispara → fetch al API → render del catálogo

Esto agrega ~800ms-1.5s al tiempo de carga percibido, especialmente en mobile/3G.

```tsx
// NvidiaCatalogSection.tsx:114-123
useEffect(() => {
  let alive = true;
  fetchCatalogData(SOURCE_SLUG, { limit: 200 }).then((data) => {
    if (!alive) return;
    const g = buildGroups(data?.products ?? []);
    setGroups(g);
    setActive(g[0]?.key ?? null);
  });
  return () => { alive = false; };
}, []);
```

### Fix a implementar

Convertir `NvidiaCatalogSection` en un Server Component que pre-fetcha los datos. La sección ya está dentro de un `LazySection` (solo carga cuando el usuario scrollea hasta ella), así que el pre-fetch ocurre en el servidor solo cuando se necesita:

```tsx
// NvidiaCatalogSection.tsx — convertir a Server Component
// 1. Quitar 'use client' del inicio
// 2. Quitar los imports de useState/useEffect
// 3. Convertir a async component

import { fetchCatalogData } from '../../utils/catalogData';

const SOURCE_SLUG = 'nvidia'; // o 'zona-gamer' mientras nvidia no tenga catálogo

export default async function NvidiaCatalogSection() {
  const data = await fetchCatalogData(SOURCE_SLUG, { limit: 200 });
  const groups = buildGroups(data?.products ?? []);

  if (groups.length === 0) {
    return <p>Pronto tendremos laptops disponibles para esta sección.</p>;
  }

  // Pasar los grupos como props al sub-componente cliente (para los tabs interactivos)
  return <NvidiaCatalogClient groups={groups} />;
}
```

Crear `NvidiaCatalogClient.tsx` (nuevo, `'use client'`) que recibe `groups` como props y maneja el estado de `active`:

```tsx
// NvidiaCatalogClient.tsx — NUEVO
'use client';

export function NvidiaCatalogClient({ groups }: { groups: GpuGroup[] }) {
  const [active, setActive] = useState<string | null>(groups[0]?.key ?? null);
  // ... mismo JSX de tabs y grid de productos que ya existe
}
```

> **Nota:** Si `fetchCatalogData` hace un fetch a una API externa (no a la misma DB), verificar que funciona en el contexto de Next.js Server Components (sin `window`, sin hooks). Si usa fetch nativo, funciona directamente. Si usa un hook o contexto de cliente, necesitará refactorizarse primero.

### Prueba

1. `npm run dev` → abrir `/nvidia/`
2. DevTools → Network → filtrar por la URL del API del catálogo (p.ej. `/api/v1/public/landing/nvidia/products`).
3. Verificar que la llamada al API **ya no aparece** en los Network requests del browser — el fetch ocurrió en el servidor.
4. Al llegar a la sección del catálogo (scroll hacia abajo), las tarjetas deben aparecer **inmediatamente** sin spinner de carga.
5. Los tabs de filtro (RTX 3050, 4050, etc.) deben seguir funcionando interactivamente.

> **Este es el fix de mayor impacto en LCP pero también el más estructural.** Implementar después de los fixes 1-3. Si hay dificultades con el Server Component, una alternativa intermedia es usar `next/headers` o Route Handlers para pre-fetchear en el build.

---

## FIX 10 — `background-image` de software tiles sin lazy loading nativo

**Archivo:** `NvidiaLanding.tsx:451`

### Problema

Los tiles del selector de software usan `style={{ backgroundImage: \`url(...)\` }}` para las imágenes de logos. El navegador no puede hacer lazy loading de `background-image` con `loading="lazy"` (ese atributo solo aplica a `<img>`). Resultado: todos los logos de software se descargan aunque el usuario nunca llegue a esa sección.

```tsx
// NvidiaLanding.tsx:451
<span className="sl-tile-bg"
  style={{ backgroundImage: `url('${s.img}')`, backgroundPosition: s.imgPos || undefined }}
/>
```

### Fix a implementar

Reemplazar los `background-image` inline por `<img>` con `loading="lazy"`, posicionado con CSS:

```tsx
// En NvidiaLanding.tsx — dentro del render de cada tile
{s.img
  ? (
    <span className="sl-tile-bg">
      <img
        src={s.img}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="sl-tile-bg-img"
        style={s.imgPos ? { objectPosition: s.imgPos } : undefined}
      />
    </span>
  )
  : <span className="sl-tile-bg ph"><span className="ini">{initials(s.name)}</span></span>
}
```

Y en el CSS inline (dentro del string `CSS`), agregar:
```css
.nvidia-landing .sl-tile-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Prueba

1. `npm run dev` → abrir `/nvidia/`
2. DevTools → Network → recargar sin caché.
3. Desplazarse SIN hacer scroll a la sección de software.
4. Verificar que los logos de software (`images/nvidia/software/*.png`) **NO aparecen en Network** si el usuario no llegó a la sección. Con el fix, solo deben descargarse cuando el tile es visible.

---

## Orden de implementación recomendado

| Prioridad | Fix | Impacto | Riesgo visual |
|-----------|-----|---------|---------------|
| 1 | FIX 1 — Videos con poster + preload adaptativo | Alto (CLS, UX) | Bajo |
| 2 | FIX 2 — MutationObserver sin subtree | Alto (jank) | Bajo |
| 3 | FIX 3 — text-shadow → filter:drop-shadow | Alto (móvil jank) | Bajo |
| 4 | FIX 5 — Imágenes con dimensiones | Medio (CLS) | Nulo |
| 5 | FIX 6 — Scroll debounce con rAF | Medio | Nulo |
| 6 | FIX 7 — Google Fonts declarativo | Medio (FOUT) | Bajo |
| 7 | FIX 10 — background-image → img lazy | Medio (network) | Bajo |
| 8 | FIX 4 — Selector: transform vs left/top | Bajo-Medio | **Medio** (validar) |
| 9 | FIX 9 — Fetch catálogo en servidor | **Crítico** (LCP) | **Alto** (refactor) |
| 10 | FIX 8 — CSS a archivo separado | Medio (bundle) | **Alto** (Next.js) |

> Empezar por 1-7 (todos de bajo riesgo). Los fixes 4, 9 y 10 son más estructurales y deben hacerse con más cuidado y validación.

---

## Baseline antes de empezar (ejecutar primero)

Para poder medir la mejora, tomar estas métricas antes de tocar código:

```bash
# Desde Chrome DevTools (F12):
# 1. Tab "Lighthouse" → Mobile → Generate report
#    Anotar: Performance score, LCP, CLS, TBT

# 2. Tab "Network" → Disable Cache → recargar
#    Anotar: cuántos requests, tamaño total transferido, tiempo hasta DOMContentLoaded

# 3. Tab "Performance" → Record → scroll suave 5s → Stop
#    Anotar: ¿hay frames por debajo de 60fps? ¿dónde?
```

Guardar screenshot del reporte Lighthouse antes de empezar. Comparar después de los fixes 1-7.

---

## Información del sistema y restricciones

- **MacBook Air M3 8GB** — nunca ejecutar `npm run build`, solo `npm run dev`
- **Rama de trabajo:** `feature/nvidia-landing` — todo va en esta rama, sin PR ni merge a main
- **No instalar dependencias nuevas** — usar solo lo que ya existe en el proyecto
- **Stack:** Next.js 14+, React, TypeScript, Tailwind CSS, Framer Motion (disponible pero no necesario para estos fixes)
- **API del catálogo:** `GET https://api.baldecash.com/api/v1/public/landing/nvidia/products?limit=200`

---

## Preguntas frecuentes

**¿Por qué no usar `next/image` en vez de `<img>`?**  
La landing usa CSS scoped a `.nvidia-landing` con `* { margin: 0; padding: 0; box-sizing: border-box }`. `next/image` genera un `<span>` wrapper con estilos inline que el reset de la landing puede interferir. Por consistencia con el resto del componente, seguir con `<img>` + `loading="lazy"` + dimensiones.

**¿Los fixes de videos pueden causar que el hero se vea diferente?**  
El `poster` solo aparece mientras el video carga (fracción de segundo en buena conexión). Si el poster no existe en S3, el browser lo ignora silenciosamente y sigue usando la pantalla negra. Verificar que la URL del poster apunta a un archivo que existe.

**¿El FIX 4 del selector puede romper los tiles?**  
Sí, es el fix de mayor riesgo visual. Si `scale()` distorsiona el contenido expandido (texto y logos dentro del tile), hay un fallback: mantener `left/top/width/height` para el layout pero solo quitar la **transición** de esas propiedades (hacer el cambio instantáneo) y usar `transform: scale()` solo para el efecto de apertura. Eso ya elimina el layout thrashing de las frames intermedias.
