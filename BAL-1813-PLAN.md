# BAL-1813 — Zona Gamer: Unificación de componentes con Home

## Problema

Zona Gamer tiene componentes cliente clonados de Home. Cualquier feature nueva en Home debe replicarse manualmente — y sistemáticamente se olvida.

## Objetivo final

Un único conjunto de componentes generales parametrizados con `theme="gamer"`. Zona Gamer no tiene clones — usa los mismos componentes de Home con estética gaming. Cualquier feature nueva en Home llega a Zona Gamer automáticamente.

---

## Estado actual por página

| Página | Archivo cliente | Estado |
|---|---|---|
| `/zona-gamer` (index) | `ZonaGamerLanding.tsx` | No es clon, no se toca |
| `/[landing]/catalogo` | `CatalogoClient.tsx` | ✅ Unificado — delega a `GamerCatalogoContent` |
| `/[landing]/producto` | `GamerProductDetailClient.tsx` | ⚠️ Clon activo — arquitectura distinta, ticket futuro |
| `/[landing]/solicitar` | `SolicitarClient.tsx` | ✅ Unificado — delega a `GamerSolicitarContent` |
| `/[landing]/solicitar/[step]` | `StepClient.tsx` | ✅ Ya bifurcado con `isGamerLanding()` |
| `/[landing]/solicitar/complementos` | `complementosClient.tsx` | ✅ Ya bifurcado con `isGamerLanding()` |
| `/[landing]/solicitar/confirmacion` | `confirmacionClient.tsx` | ✅ Ya bifurcado con `isGamerLanding()` |
| `/[landing]/legal` | `LegalPageLayout.tsx` | ⚠️ Bifurcado pero usa `landingId === LANDING_IDS.ZONA_GAMER` |
| `/[landing]/legal/libro-reclamaciones` | `LibroReclamacionesClient.tsx` | ⚠️ Bifurcado pero usa `landingId === LANDING_IDS.ZONA_GAMER` |
| `/[landing]/proximamente` | `ProximamenteClient.tsx` | ⚠️ Bifurcado pero usa `landingId === LANDING_IDS.ZONA_GAMER` |

---

## Componentes gamer activos (no del index)

| Componente | Símil general | Estado |
|---|---|---|
| `GamerNavbar` | `Navbar` | Clon — pendiente parametrizar |
| `GamerFooter` | `Footer` | Clon — pendiente parametrizar |
| `GamerNewsletter` | Newsletter general | Clon — pendiente parametrizar |
| `GamerProductCard` | ProductCard estándar | Clon — pendiente parametrizar |
| `GamerStepSuccess` | `StepSuccessMessage` | Clon — pendiente parametrizar |
| `GamerSidebar` | Sidebar Home | Orden/subconjunto distinto — se mantiene como slot |
| `GamerActiveFilters` | Filtros activos Home | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerCardSkeleton` | Skeleton Home | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerCatalogHeader` | Header catálogo | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerCompareModal` | CompareModal Home | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerHelpButton` | HelpButton Home | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerPromoBanner` | PromoBanner Home | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerSortDropdown` | SortDropdown Home | Dentro de `GamerCatalogoContent` — pendiente |
| `GamerAccessoryDetailModal` | Sin símil — exclusivo gamer | Se mantiene siempre |

---

## Por qué la solución actual NO es completamente escalable

Lo hecho hasta ahora (Iteraciones 1 y 2) unifica los **puntos de entrada** pero no los **contenidos**. El diagrama real es:

```
CatalogoClient
├── isGamerLanding → GamerCatalogoContent  ← clon de 2,880 líneas, paralelo
└── else → CatalogoContent                 ← contenido Home

SolicitarClient
├── isGamerLanding → GamerSolicitarContent ← clon de 1,397 líneas, paralelo
└── else → WizardPreviewContent            ← contenido Home
```

**Consecuencia:** feature nueva en `CatalogoContent` o `WizardPreviewContent` sigue sin llegar a Zona Gamer.

**Causa raíz:** `GamerNavbar`, `GamerFooter`, `GamerProductCard`, etc. son clones independientes. Para fusionar los contenidos, primero hay que parametrizar los componentes generales.

---

## Iteración 1 — Catálogo ✅ DONE (mergeado a main 2026-06-23)

- `isGamerLanding()` agregado en `utils/theme.ts`
- `CatalogoClient` detecta `isGamerLanding` y delega a `GamerCatalogoContent`
- `page.tsx` catálogo limpio — un solo `<CatalogoClient />`
- `GamerCatalogoContent` exportada desde `GamerCatalogoClient.tsx`

## Iteración 2 — Solicitar ✅ DONE (mergeado a main 2026-06-24)

- `SolicitarClient` detecta `isGamerLanding` y delega a `GamerSolicitarContent`
- `page.tsx` solicitar limpio — un solo `<SolicitarClient />`
- `GamerSolicitarContent` exportada desde `GamerSolicitarClient.tsx`
- Checks `isGamer` migrados a `isGamerLanding()` en StepClient, complementosClient, confirmacionClient

---

## Iteración 3 — Parametrizar componentes generales (BAL-1814)

### Objetivo
Que los componentes generales acepten `theme="gamer"` y renderizen con estética gaming. Una vez hecho, los contenidos clonados (`GamerCatalogoContent`, `GamerSolicitarContent`) se pueden fusionar con los generales.

### Orden por impacto y riesgo (de menor a mayor)

**3a — `StepSuccessMessage` con `theme` (BAL-1815)**
- Agregar prop `theme?: 'gamer'` a `StepSuccessMessage`
- Cuando `theme="gamer"`: colores neon, fuente Orbitron, animación gamer
- En `StepClient.tsx`: reemplazar bifurcación `GamerStepSuccess` / `StepSuccessMessage` por `<StepSuccessMessage theme={isGamer ? 'gamer' : undefined} />`
- **Pendiente eliminar:** `GamerStepSuccess.tsx` — cuando haya 100% confianza

**3b — `Navbar` y `Footer` con `theme` (BAL-1816)**
- Agregar prop `theme?: 'gamer'` a `Navbar` y `Footer`
- Cuando `theme="gamer"`: fondo oscuro `#0e0e0e`, tipografía Rajdhani, colores neon, toggle dark/light
- Reemplazar `GamerNavbar`/`GamerFooter` en: `GamerCatalogoContent`, `GamerSolicitarContent`, `GamerProductDetailClient`, `LegalPageLayout`, `LibroReclamacionesClient`, `ProximamenteClient`, `StepClient`, `complementosClient`, `confirmacionClient`
- **Pendiente eliminar:** `GamerNavbar.tsx`, `GamerFooter.tsx` — cuando haya 100% confianza

**3c — `ProductCard` con `theme` (BAL-1817)**
- Agregar prop `theme?: 'gamer'` al componente de tarjeta de producto
- Cuando `theme="gamer"`: bordes neon, fondo oscuro, tipografía gaming, badges con paleta gamer
- Reemplazar `GamerProductCard` en `GamerCatalogoContent`
- **Pendiente eliminar:** `GamerProductCard.tsx` — cuando haya 100% confianza

**3d — Migrar checks `landingId` a `isGamerLanding()` en páginas restantes (BAL-1818)**
- `LegalPageLayout.tsx`: `landingId === LANDING_IDS.ZONA_GAMER` → `isGamerLanding(landing)`
- `LibroReclamacionesClient.tsx`: ídem
- `ProximamenteClient.tsx`: ídem
- Bajo riesgo, solo limpieza de consistencia

**3e — Fusionar `GamerCatalogoContent` → `CatalogoContent` (BAL-1819)**
- Prerequisito: 3b y 3c completados
- Un único `CatalogoContent` con bifurcaciones de presentación usando componentes parametrizados
- Sidebar: `isGamer ? <GamerSidebar> : <HomeSidebar>` (GamerSidebar se mantiene como slot)
- **Pendiente eliminar:** `GamerCatalogoClient.tsx` completo — cuando haya 100% confianza

**3f — Fusionar `GamerSolicitarContent` → `WizardPreviewContent` (BAL-1820)**
- Prerequisito: 3b completado
- Un único `WizardPreviewContent` con bifurcaciones de presentación
- Zonas complejas (mobile bar, cupón, accesorios) se bifurcan con `isGamer`
- **Pendiente eliminar:** `GamerSolicitarClient.tsx` completo — cuando haya 100% confianza

---

## Iteración 4 — Detalle de producto (ticket futuro)

`GamerProductDetailClient` (3,098 líneas) reimplementa todo inline — galería con zoom, lightbox, cronograma con amortización francesa, AccessoriesCarousel, SideNav flotante, PortsSection, FinanciamientoModal, PDF ficha técnica, analytics granular, tema dark/light.

No usa `<ProductDetail>` de Home. La unificación requiere refactorizar `<ProductDetail>` para aceptar tema + slots — varias semanas, riesgo alto.

**Decisión:** NO tocar hasta tener Iteración 3 completa y probada. Ticket separado a crear en su momento.

---

## Invariantes a preservar siempre

1. `localStorage key` `baldecash-zona-gamer-theme` — no cambiar verbatim
2. `LANDING_IDS.ZONA_GAMER = 136` en `utils/landingIds.ts` — no tocar
3. `gamerTheme(isDark)` tokens — mantener desde `gamerTheme.ts`
4. `GamerSidebar.tsx` — no fusionar con sidebar de Home; orden y subconjunto de filtros son distintos; se pasa siempre como slot
5. `GamerAccessoryDetailModal` — exclusivo gamer, sin símil en Home, se mantiene siempre
6. `GamerStepSuccess`, `GamerNavbar`, `GamerFooter`, `GamerProductCard` — NO eliminar hasta tener 100% confianza en los componentes parametrizados

---

## Pendientes de limpieza (cuando haya 100% confianza)

- Eliminar función raíz `GamerCatalogoClient` de `GamerCatalogoClient.tsx` (el archivo sigue por `GamerCatalogoContent`)
- Eliminar función raíz `GamerSolicitarClient` de `GamerSolicitarClient.tsx` (el archivo sigue por `GamerSolicitarContent`)
- Renombrar `GamerCatalogoClient.tsx` → `GamerCatalogoContent.tsx`
- Renombrar `GamerSolicitarClient.tsx` → `GamerSolicitarContent.tsx`
- Eliminar `GamerStepSuccess.tsx` (tras BAL-1815)
- Eliminar `GamerNavbar.tsx`, `GamerFooter.tsx` (tras BAL-1816)
- Eliminar `GamerProductCard.tsx` (tras BAL-1817)
- Eliminar `GamerCatalogoClient.tsx` completo (tras BAL-1819)
- Eliminar `GamerSolicitarClient.tsx` completo (tras BAL-1820)
