# Tarea: Optimización de rendimiento — Landing Zona Gamer

## Contexto

La landing de zona-gamer (`/prototipos/0.6/zona-gamer/`) carga todas las secciones e imágenes de golpe. Necesitamos optimizar el rendimiento sin cambiar el diseño ni la funcionalidad.

## Archivo principal

`src/app/prototipos/0.6/components/zona-gamer/ZonaGamerLanding.tsx`

## Archivos a modificar

Todos están en `src/app/prototipos/0.6/components/zona-gamer/`:

- ZonaGamerLanding.tsx
- GamerHero.tsx
- GamerPacks.tsx
- GamerBrands.tsx
- GamerSeries.tsx
- GamerAccessories.tsx
- GamerGames.tsx (o GamerGamesRanking.tsx)
- GamerStories.tsx
- GamerFooter.tsx

## Cambios requeridos

### 1. Lazy loading de imágenes

En todos los componentes que usen `<Image>` de next/image o `<img>`, agregar `loading="lazy"` **EXCEPTO** en GamerHero (el hero debe cargar inmediato).

Componentes afectados: GamerPacks, GamerBrands, GamerAccessories, GamerFooter.

### 2. Renderizado condicional en vez de display:none

En GamerPacks y GamerAccessories, actualmente se renderizan las dos versiones de cada imagen (dark y light) y se oculta una con `display: 'block'/'none'`. Cambiar a renderizado condicional:

**ANTES:**

```tsx
<Image src={pack.imgDark} style={{ display: isDark ? 'block' : 'none' }} />
<Image src={pack.imgLight} style={{ display: isDark ? 'none' : 'block' }} />
```

**DESPUÉS:**

```tsx
<Image src={isDark ? pack.imgDark : pack.imgLight} />
```

Esto reduce las imágenes cargadas a la mitad.

### 3. Dynamic imports para secciones below-the-fold

En ZonaGamerLanding.tsx, las secciones que NO son visibles al entrar a la página deben cargarse con `dynamic()` de Next.js:

```tsx
import dynamic from 'next/dynamic';

// Estas se cargan inmediato (above the fold)
import { GamerHero } from './GamerHero';
import { GamerPacks } from './GamerPacks';

// Estas se cargan lazy (below the fold)
const GamerBrands = dynamic(() => import('./GamerBrands').then(m => ({ default: m.GamerBrands })), { ssr: false });
const GamerSeries = dynamic(() => import('./GamerSeries').then(m => ({ default: m.GamerSeries })), { ssr: false });
const GamerGames = dynamic(() => import('./GamerGames').then(m => ({ default: m.GamerGamesRanking })), { ssr: false });
const GamerAccessories = dynamic(() => import('./GamerAccessories').then(m => ({ default: m.GamerAccessories })), { ssr: false });
const GamerStories = dynamic(() => import('./GamerStories').then(m => ({ default: m.GamerStories })), { ssr: false });
const GamerFooter = dynamic(() => import('./GamerFooter').then(m => ({ default: m.GamerFooter })), { ssr: false });
```

> **Nota:** Verificar el nombre exacto del export de cada componente (algunos usan `export function`, otros `export default`). Ajustar el `.then()` según corresponda.

### 4. Mover arrays duplicados fuera del render

En GamerBrands.tsx hay algo como:

```tsx
const repeatedBrands = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];
```

Si esto está dentro del componente, moverlo afuera como constante de módulo.

Lo mismo en GamerAccessories.tsx con la duplicación del array de accesorios.

### 5. Mover @keyframes fuera del JSX

En GamerPacks.tsx, buscar cualquier `<style>` con `@keyframes` dentro del return del componente. Moverlo a un `<style>` que esté en ZonaGamerLanding o como constante fuera del componente.

### 6. Carga de fuentes — eliminar duplicados

En ZonaGamerLanding.tsx, verificar si las fuentes de Google se cargan de más de una forma (DOM manipulation con createElement + CSS @import). Mantener solo una.

## Reglas

- **NO** cambiar el diseño visual — todo debe verse exactamente igual
- **NO** cambiar la funcionalidad — animaciones, interacciones, hover effects, todo igual
- Probar en dark mode Y light mode después de cada cambio
- Probar en mobile y desktop
- Si un cambio rompe algo visualmente, revertirlo

## Verificación

Después de los cambios, abrir DevTools > Network y comparar:

- Cantidad de requests de imágenes al cargar la página (debe ser menor)
- Tamaño total transferido (debe ser menor)
- Las imágenes below-the-fold solo deben cargarse al hacer scroll
