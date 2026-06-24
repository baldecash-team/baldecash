# BAL-1813 — Zona Gamer: Unificación de componentes con Home

## Problema

Zona Gamer tiene 3 archivos cliente completamente clonados de Home:

| Cliente clonado | Original |
|---|---|
| `GamerCatalogoClient.tsx` (2,880 líneas) | `CatalogoClient.tsx` (2,434 líneas) |
| `GamerProductDetailClient.tsx` (~1,500 líneas) | `ProductDetailClient.tsx` |
| `GamerSolicitarClient.tsx` (~900 líneas) | `SolicitarClient.tsx` |

**Consecuencia directa:** cualquier nueva funcionalidad en Home (lógica, componentes, analytics, integración backend) hay que replicarla manualmente a Zona Gamer — y sistemáticamente se olvida.

---

## Análisis técnico: qué es diferente en Zona Gamer

### Lo que SÓLO cambia en Zona Gamer (diseño puro)
- Navbar/Footer (`GamerNavbar`, `GamerFooter`)
- Colores y tipografías (neonCyan `#00ffd5`, neonPurple `#6366f1`, fondo `#0e0e0e`, fuentes Rajdhani/Orbitron/Bebas)
- localStorage key para dark mode: `baldecash-zona-gamer-theme` (no es `baldecash-theme`)
- Tokens de tema via `gamerTheme(isDark)` desde `components/gamer/gamerTheme.ts`
- Tarjetas de producto con estética gaming
- SecondaryNav con tipografía distinta
- EmptyState con texto "gaming"
- CompareModal con colores gamer

### Lo que es ESTRUCTURALMENTE diferente (requiere slot/bifurcación)
- **Sidebar / filtros**: orden y subconjunto distintos
  - Home: 15+ specs (ram, storage, storage_type, processor_brand, processor, gpu, screen_size, screen_type, screen_resolution, touch_screen, refresh_rate, backlit_keyboard, numeric_keypad, fingerprint_sensor, windows_included, thunderbolt_port, ethernet_port, hdmi_port, sd_card_slot, usb_ports, ram_expandable)
  - Gamer: 5 specs (ram, storage, gpu, processor, screen_size)
  - Home sidebar: Tipo equipo → Marca → Cuota → advanced drawer (TechnicalFiltersStyled)
  - Gamer sidebar: GPU → CPU → RAM → Almacenamiento → Pantalla → Cuota → Destacados → Marca → Uso → Condición
  - El componente `GamerSidebar.tsx` ya existe y está correcto — se pasa como slot

### Lo que Zona Gamer tiene que Home NO tiene (lógica exclusiva Gamer)
- **Sección de accesorios en detalle**: `AccessoriesCarousel`, `getLandingAccessories()`, estado `accessories[]`, nav item `#accesorios`, localStorage `baldecash-{landing}-solicitar-selected-accessories`
  - Al unificar `ProductDetailClient`, esta lógica entra al cliente unificado bajo `{isGamer && <AccessoriesCarousel />}`
  - **No es solo diseño** — es una llamada API adicional y estado propio

### Lo que Zona Gamer NO tiene (features de Home que se perdieron)
- `RefurbishedWarningModal`
- `campaignCoupon` / `VipCountdownBanner`
- `OnboardingWelcomeModal`
- `viewMode` (favorites/all toggle)
- `CouponCampaignBanner`
- `QuickUsageCards`
- Brand filter versioning (V1-V6)

---

## Patrón a seguir: NVIDIA

En `utils/theme.ts` ya existe el precedente exacto:

```ts
export const DARK_LANDINGS = ['nvidia'];
export function isDarkLanding(slug: string): boolean { ... }
export function isNvidiaLanding(slug: string): boolean { return slug === 'nvidia'; }
```

El mismo patrón se aplica para Zona Gamer con `isGamerLanding(slug)`.

---

## Solución

### Principio central
Un único cliente unificado que recibe presentación por parámetro `theme="gamer"` o detectado via `isGamerLanding(slug)`. La lógica, hooks, API calls, analytics y todo comportamiento son compartidos. Solo el JSX de presentación bifurca.

### Lo que NO cambia
- `page.tsx` de cada ruta mantiene el `if (landing === 'zona-gamer')` — solo el destino cambia al cliente unificado
- `GamerSidebar.tsx` se mantiene como componente separado, se pasa como slot
- `CatalogLayoutV4.tsx` se mantiene para Home (estructuralmente incompatible)
- `gamerTheme.ts` se mantiene como fuente de tokens

---

## Iteración 1: Catálogo + Detalle

### Archivos afectados

```
src/app/prototipos/0.6/utils/theme.ts            ← agregar isGamerLanding()
src/app/prototipos/0.6/[landing]/catalogo/
  page.tsx                                        ← apuntar if-gamer al cliente unificado
  CatalogoClient.tsx                              ← agregar bifurcaciones gamer (~10 puntos)
  GamerCatalogoClient.tsx                         ← ELIMINAR al final de iteración
src/app/prototipos/0.6/[landing]/producto/
  page.tsx                                        ← apuntar if-gamer al cliente unificado
  ProductDetailClient.tsx                         ← agregar bifurcaciones gamer
  GamerProductDetailClient.tsx                    ← ELIMINAR al final de iteración
```

### Paso 1: Agregar `isGamerLanding` en `utils/theme.ts`

```ts
export const GAMER_LANDINGS = ['zona-gamer'];

export function isGamerLanding(slug: string): boolean {
  return GAMER_LANDINGS.includes(slug);
}
```

### Paso 2: Unificar `CatalogoClient.tsx`

El cliente recibe `slug` (ya lo tiene via `useParams`). Se deriva `isGamer = isGamerLanding(slug)`.

**Puntos de bifurcación en JSX (~10 puntos):**

| # | Punto | Home | Gamer |
|---|---|---|---|
| 1 | Navbar | `<Navbar>` | `<GamerNavbar>` |
| 2 | Footer | `<Footer>` | `<GamerFooter>` |
| 3 | Layout/Sidebar | `<CatalogLayoutV4 sidebar={...}>` | inline layout + `<GamerSidebar>` |
| 4 | localStorage key dark mode | `baldecash-theme` | `baldecash-zona-gamer-theme` |
| 5 | Tokens de color CSS vars | sistema NextUI | `gamerTheme(isDark)` inline styles |
| 6 | Tipografías | estándar | Rajdhani/Orbitron/Bebas via `<style>` |
| 7 | API specs solicitados | 21+ specs | 5 specs (ram, storage, gpu, processor, screen_size) |
| 8 | ProductCard | estándar | `<GamerProductCard>` |
| 9 | SecondaryNav | estándar | tipografía gamer |
| 10 | EmptyState / CompareModal | estándar | colores gamer |

**Specs API para catálogo:**
```ts
const catalogSpecs = isGamer
  ? ['ram', 'storage', 'gpu', 'processor', 'screen_size']
  : ['ram', 'storage', 'storage_type', 'processor_brand', /* ...21 specs Home */];
```

**Default expanded sections:**
```ts
const defaultExpanded = isGamer
  ? { gpu: true, procesador: true, ram: true, almacenamiento: true, pantalla: true, cuota: true }
  : { /* valores Home */ };
```

**Layout:**
```tsx
{isGamer ? (
  <div style={{ background: theme.bg, minHeight: '100vh', fontFamily: 'Rajdhani, ...' }}>
    <GamerNavbar />
    <div className="flex">
      <GamerSidebar filters={filters} onUpdate={updateFilter} isDark={isDark} />
      <main>{products.map(p => <GamerProductCard ... />)}</main>
    </div>
    <GamerFooter />
  </div>
) : (
  <CatalogLayoutV4 sidebar={...} {...homeProps} />
)}
```

### Paso 3: Actualizar `page.tsx` de catálogo

```tsx
// ANTES
if (landing === 'zona-gamer') return <GamerCatalogoClient />;
return <CatalogoClient />;

// DESPUÉS
// CatalogoClient detecta isGamer internamente via useParams()
return <CatalogoClient />;
```

O, si se prefiere pasar `theme` explícito:
```tsx
if (landing === 'zona-gamer') return <CatalogoClient theme="gamer" />;
return <CatalogoClient />;
```

**Decisión recomendada:** pasar `theme="gamer"` explícito — más legible que leer params internamente.

### Paso 4: Detalle de producto — decisión de arquitectura

**HALLAZGO CRÍTICO tras análisis profundo:**

`ProductDetailClient` (Home, 537 líneas) es un **cliente delgado** que delega todo el renderizado al componente `<ProductDetail>` importado de `../components/detail/ProductDetail`.

`GamerProductDetailClient` (3,098 líneas) es un **monolito autocontenido** que reimplementa todo inline — galería, specs, cronograma, similares, accesorios, SideNav, modal de financiamiento. No usa `<ProductDetail>`.

#### Diferencias exclusivas de Gamer (no existen en Home):
| Feature | Líneas aprox. | Naturaleza |
|---|---|---|
| `AccessoriesCarousel` + `GamerAccessoryDetailModal` | ~250 | Lógica + API call + estado propio |
| `SideNav` flotante lateral (scroll tracking) | ~90 | UI exclusiva gamer |
| `PortsSection` con diagrama izq/der | ~80 | UI exclusiva gamer |
| `CronogramaSection` con amortización inline + PDF gamer | ~250 | Reimplementación con colores gamer |
| `FinanciamientoModal` con tabla de amortización | ~200 | Reimplementación con colores gamer |
| Galería custom (zoom cursor-guided, grid thumbs diferente) | ~300 | Reimplementación visual completa |
| `GamerNewsletter` antes del footer | ~5 | Componente ya existe |
| `NvidiaBadge` en GPU specs | ~5 | Feature puntual |

#### Diferencias exclusivas de Home (Gamer no las tiene):
- `SearchDrawer` + `WishlistDrawer` móvil
- `CatalogSecondaryNavbar`
- `useLeadGuard`
- `NotFoundContent` componente

#### Opciones para el detalle:

**Opción A (recomendada para BAL-1813): Dejar GamerProductDetailClient, conectar hooks**
- No unificar el rendering — son arquitecturas demasiado distintas
- Asegurar que mejoras en hooks compartidos (`useCatalogSharedState`, `useAnalytics`, `useProduct`) lleguen automáticamente
- El riesgo del problema original (replicar features) aplica principalmente al catálogo, no al detalle: las features nuevas en Home-detalle van a `<ProductDetail>` component, no a `ProductDetailClient`
- Costo: bajo. Riesgo: bajo.

**Opción B (iteración futura): Parametrizar `<ProductDetail>` con tema + slots**
- Agregar `theme`, `sideNav`, `accessories`, `newsletter` como props/slots al componente compartido
- Refactorizar `CronogramaSection` y galería para aceptar tokens de tema
- Costo: alto (~1-2 semanas). Riesgo: medio (puede romper Home).

**Decisión BAL-1813:** Aplicar Opción A. El detalle gamer permanece como está. El win principal está en el catálogo (2,880 vs 2,434 líneas, con features nuevas que llegan constantemente).

### Paso 5: Borrar único archivo clone

Una vez verificado que el cliente unificado funciona en ambos modos:
- Eliminar `GamerCatalogoClient.tsx` ✓
- `GamerProductDetailClient.tsx` — **NO eliminar en esta iteración** (ver decisión arriba)

---

## Iteración 2: Solicitar (ticket separado)

Archivos a unificar:
- `GamerSolicitarClient.tsx` → `SolicitarClient.tsx`
- Sub-páginas del flujo solicitar que tengan bifurcaciones gamer

Nota: `StepClient.tsx` ya tiene `isGamer = (params?.landing as string) === 'zona-gamer'` en L920 — esto se migra a `isGamerLanding()` de `utils/theme.ts`.

---

## Invariantes a preservar (no romper)

1. **localStorage key** `baldecash-zona-gamer-theme` — verbatim, no cambiar
2. **LANDING_IDS.ZONA_GAMER = 136** en `utils/landingIds.ts` — sin tocar
3. **Tokens `gamerTheme(isDark)`** — mantener el objeto, seguir usándolo desde `gamerTheme.ts`
4. **`GamerSidebar.tsx`** — no fusionar con el sidebar de Home; se pasa como slot
5. **`page.tsx` guards** — el `if (landing === 'zona-gamer')` puede simplificarse a pasar `theme="gamer"` como prop, pero el guard de ruta permanece
6. **Features de Home que Gamer no tenía** — tras unificación, Gamer las hereda automáticamente; validar que no rompen visualmente con el tema gamer (especialmente `VipCountdownBanner`, `OnboardingWelcomeModal`)

---

## Resultado esperado

| Antes | Después |
|---|---|
| 3 archivos clonados | 1 cliente por página |
| Feature nueva en Home → hay que replicar manualmente | Feature nueva en Home → Zona Gamer la hereda sola |
| ~7,700 líneas de código duplicado | ~3,000 líneas unificadas (catálogo) + detalle pendiente |
| Bugs divergentes silenciosos | Un solo punto de fallo/mejora |

---

## Orden de implementación

1. `utils/theme.ts` — agregar `isGamerLanding()` (5 min)
2. `CatalogoClient.tsx` — 10 bifurcaciones JSX + specs API (2-3h)
3. Prueba visual: modo Home y modo Gamer en dev server
4. `page.tsx` catálogo — apuntar al cliente unificado
5. Eliminar `GamerCatalogoClient.tsx`
6. `ProductDetailClient.tsx` — bifurcaciones Gamer (2-3h)
7. `page.tsx` detalle — apuntar al cliente unificado
8. Eliminar `GamerProductDetailClient.tsx`
9. Iteración 2 (ticket separado): solicitar flow
