# Prompt v5 — Revisión de feature parity gamer vs normal

> **Uso**: Pegar este prompt a Claude cuando se necesite revisar feature parity
> entre una página gamer (`GamerXxxClient.tsx`) y su equivalente normal
> (`XxxClient.tsx` o `ProductDetail.tsx`, etc.).
>
> **Objetivo**: Detectar todos los bugs de paridad en UNA sola pasada, no en 5.
>
> **Cambios v4→v5**: añadido PROCESO DISCIPLINADO obligatorio (el prompt v4 fallaba
> no por falta de greps sino por ejecución por fases). Nuevo ángulo "handlers
> mobile/desktop divergentes" (en solicitar el bottom bar mobile no emitía eventos
> que el desktop sí). Nuevo ángulo "subcomponentes cross-zone" (GamerFooter sin
> footerData del layout). Formalizado el concepto "ángulos NO revisados" como
> campo obligatorio del reporte, no opcional.

---

```
Necesito una revisión EXHAUSTIVA de feature parity entre la página gamer y su equivalente normal, hecha EN UNA SOLA PASADA. Si después de aplicar este prompt encuentras otro hallazgo en una segunda revisión, eso es señal de que el prompt o la ejecución fallaron — no un "hallazgo válido que salió después".

=============================================================
PROCESO DISCIPLINADO (CRÍTICO — LEER PRIMERO)
=============================================================

Las pasadas previas fallaron no porque el prompt faltara greps, sino porque
el revisor ejecutaba greps "conforme iba leyendo" y reportaba antes de
completar el checklist. Esta sección existe para forzar el orden correcto.

EJECUTA EN ESTE ORDEN ESTRICTO, SIN SALTARTE PASOS:

FASE 1 — Lectura base (ANTES de cualquier grep de dimensión)
  1. `wc -l` en ambos archivos.
  2. Leer normal COMPLETO (suele ser más pequeño porque delega a componentes).
  3. Leer gamer en chunks grandes (600-800 líneas) SIN saltarse ninguna sección.
  4. Inventariar sub-componentes del normal (greps `import.*from.*components/`).
  5. Leer cada sub-componente normal que el padre importa — al menos signatures
     y su uso de analytics/context.

FASE 2 — Ejecutar TODOS los greps de las 8 dimensiones (sin reportar aún)
  - Ejecutar TODOS los greps de D1 a D8, aunque los resultados de las primeras
    dimensiones sugieran que las siguientes no tienen bugs.
  - ANOTA cada grep ejecutado en una lista mental (para el self-check al final).
  - Si un grep devuelve 0 resultados en el gamer pero >0 en el normal, ESO ES
    SEÑAL de divergencia — investigar.

FASE 3 — Construir lista de hallazgos
  - Solo AHORA empezar a redactar hallazgos.
  - Cruzar referencias: si el gamer emite 3 tipos de analytics y el normal 5,
    los 2 faltantes son hallazgos.
  - Alinear visualmente shape del CartItem/handlers: pegar mental el constructor
    del normal al lado del gamer.

FASE 4 — Self-check ANTES de reportar
  Responder en tu cabeza:
    a) ¿Ejecuté los ~60 greps del checklist (8 dimensiones × 6-10 greps)?
       Si contaste menos de 50, no ejecutaste todos.
    b) ¿Leí TODOS los sub-componentes del normal, no solo los que estaban
       "en la misma carpeta"? (ej: `SelectedProductBar`, `CouponInput`,
       `AccessoriesSection`, `InsuranceSection`.)
    c) ¿Verifiqué que el gamer cubra los eventos de analytics que emite el
       normal en mobile Y desktop? (Un gap común: el desktop emite eventos
       y el mobile bottom bar no.)
    d) ¿Hay algún handler mobile que reimplementa lógica del desktop y olvida
       analytics / callsites / edge cases?
    e) ¿Verifiqué los CALLSITES (usos) de cada handler, no solo la declaración?

  Si alguna es "no", COMPLETAR antes de reportar.

FASE 5 — Reportar
  - Formato abajo.
  - El campo "Ángulos NO revisados" es OBLIGATORIO, no opcional. Si no hay
    ninguno, escribe "Ninguno" — pero piénsalo bien, casi siempre hay alguno
    (browser testing, verificación runtime, etc.).

REGLA DE HONESTIDAD:
  Si después de aplicar este prompt el user pide "otra revisión" y aparecen
  hallazgos nuevos, la respuesta correcta es:
  "Me salté el grep X en la pasada anterior — no es un hallazgo nuevo, es
   un ángulo no cubierto por ejecución defectuosa."
  NO presentarlo como "hallazgo que apareció después".

=============================================================
CONTRATO CONMIGO
=============================================================

Antes de reportar hallazgos, tienes que haber ejecutado EL CHECKLIST COMPLETO
abajo. No puedes reportar "hallazgo X" si no ejecutaste el grep que lo hubiera
detectado. Si un grep no se ejecutó, ese ángulo NO está revisado, y lo declaras
explícitamente como "no revisado" en el reporte.

Esto significa:
- No hay "pasadas múltiples". Hay UNA pasada con todos los greps ejecutados.
- Si un bug aparece en una segunda pasada, la honestidad es admitir que el grep
  correspondiente no se ejecutó la primera vez, no presentarlo como "hallazgo nuevo".
- Prefiero ver 40 resultados de greps aunque 30 sean ruido, a que reportes 5 y
  queden 5 más escondidos.

=============================================================
CONTEXTO DE BUGS YA ENCONTRADOS
=============================================================

- Persistencia: escribir directo a localStorage (getStorageKey, getCartProductsKey,
  getAccessoriesKey), nunca con setters del context — cada página tiene su propio Provider.
- Cart viejo: al seleccionar un producto nuevo en single-product, limpiar cart
  + accesorios del localStorage.
- PaymentPlans: transformar a CartPaymentPlan[] antes de persistir. Usar termMonths
  para months (semanal/quincenal).
- Specs, term, paymentFrequency, variantId/colorHex/colorName: deben propagarse
  en TODOS los handlers (handleAddToCart, handleSolicitar single/multi, handleCartContinue,
  handleToggleWishlist).
- initialAmount: usar el valor exacto del option del backend (lowestOption.initialAmount),
  no calcularlo a mano.
- variantId prioriza product.variantId del backend, fallback a selectedColorId.
- Límite de cuota: getMaxMonthlyQuota(settings), no hardcoded.
- Brand filter: requiere brandMapping slug→id + brand_ids en el API.
- findProductOrSibling: helper para resolver productIds que son variantes de color.
- Compare list: guardar IDs + fetchProductsByIds, no objetos.
- Keys de React: landingProductId ?? id.
- Scroll lock centralizado (un solo effect) para evitar colisiones entre overlays.
- safe-area-inset-bottom en TODOS los FABs/sheets bottom.
- 100svh/dvh en overlays fullscreen (iOS URL bar bug).
- Touch targets 44x44 en mobile.
- inputMode/enterKeyHint/type="search" en inputs mobile.
- useScrollToTop al mount.
- router.replace/push con { scroll: false } al cambiar query.
- useDeferredValue para search en lugar de raw state.
- Request ID monotónico para fetches en inputs (race condition).
- Refs para cleanup de setTimeout al unmount.
- Escape handler global para overlays con precedencia.
- useEffect defaults debe usar ref para NO pisar selección del user al cambiar data.
- Re-fetch de datos dependientes (accesorios) cuando cambia el selectedTerm.
- previewKey + paymentFrequency en fetch de datos secundarios.
- landingConfig + showPlatformCommission como feature flag.
- Color sibling navigation preserva ?term&initial en query params.
- Reset de state local (selectedImage, etc.) cuando cambia product.id.
- TEA/TCEA priority: option > plan > null.
- Botón "Actualizar carrito" cuando configChanged vs item en carrito.
- useAnalytics + trackPricingTermChange/InitialChange/ColorSelect/LoadMore/CartContinue.
- useEventTrackerOptional + tracker?.track product_view/product_click/product_hover/compare_*.
- Cleanup de AbortController o requestId en fetches con posibilidad de race.
- Keys de array con ID estable, no `key={idx}`.

Cubrir estos bugs conocidos es el PISO, no el techo. La revisión debe encontrar
CUALQUIER OTRA cosa además de esta lista.

=============================================================
REGLAS DE EJECUCIÓN
=============================================================

1. Leer ambos archivos (normal + gamer) ANTES de hacer greps. Para archivos
   >1000 líneas, leer el normal completo primero (suele ser más pequeño porque
   delega a componentes), y el gamer en chunks grandes. No saltarse ninguna
   sección por apuro.

2. Ejecutar TODOS los greps de las 6 dimensiones abajo. Si un grep devuelve 0
   resultados en uno de los dos archivos pero sí en el otro, ESO ES SEÑAL de
   divergencia — investigar.

3. Leer los componentes hijos del normal. Si el normal delega a `<PricingCalculator>`,
   `<Cronograma>`, `<ProductGallery>`, etc., LEER AL MENOS sus signatures y cómo
   el padre los configura. El gamer reimplementa eso inline, así que hay que comparar
   props del componente normal vs estado inline del gamer.

4. Revisar los sub-componentes gamer (funciones como SimilarProductsSection,
   AccessoriesCarousel, CronogramaSection, SideNav, etc.) CONTRA sus equivalentes
   normales. Esos sub-componentes son donde se esconden más bugs.

5. Revisar los CALLSITES de cada handler, no solo la declaración. Un handler
   puede estar correcto pero invocado con args incorrectos.

6. Para cada hallazgo que reportes, indicar:
   - Archivo:línea del gamer.
   - Archivo:línea del normal (el patrón "correcto").
   - Qué grep lo detectó.
   - Si NO hay un grep que lo detecte, explicar cómo lo encontraste (probablemente
     lectura visual — aceptable, pero debería agregarse un grep para futuras pasadas).

7. Cuando termines, al final del reporte, declarar EXPLÍCITAMENTE los ángulos
   NO revisados, si los hay. Ejemplo: "No leí GamerOnboardingTour (no aparece
   en el detalle por ahora)". Esto evita la falsa sensación de completitud.

=============================================================
DIMENSIÓN 1 — DATOS Y PERSISTENCIA
=============================================================

Greps a ejecutar SIEMPRE:
  - localStorage\.|getStorageKey|getCartProductsKey|getAccessoriesKey|getCompareKey
  - paymentPlans|cartPaymentPlans|CartPaymentPlan|paymentFrequency|paymentFrequencies
  - variantId|colorName|colorHex|selectedColorId|colorSiblings
  - term:|months:|termMonths|selectedTerm|selectedTermMonths
  - initialPercent|initialAmount|selectedInitialPercent|lowestOption
  - handleAddToCart|handleSolicitar|handleCartContinue|handleToggleWishlist|handleUpdateCart
  - getMaxMonthlyQuota|MAX_MONTHLY|isOverLimit|isOverQuotaLimit
  - brandMapping|brand_ids|isReadyToFetchProducts
  - findProductOrSibling|\.colors\?|product\.colorSiblings
  - compareList|compareProducts|fetchProductsByIds.*compare
  - landingConfig|fetchLandingConfig|show_platform_commission

Comparar línea por línea:
- Signature de cada handler (¿acepta los mismos params opcionales?).
- Qué campos construye el CartItem/WishlistItem/SelectedProduct. TODOS los campos
  que el normal pasa deben estar en el gamer, en el mismo orden preferiblemente.
- Cleanup de localStorage en cada handler.
- ¿Hay cast `as TermMonths` con `selectedTerm` o `selectedTermMonths`? Debe ser
  el normalizado.
- ¿`initialAmount` sale de `lowestOption.initialAmount` o se calcula a mano?
- ¿`paymentPlans` se pasa como `paymentPlans` crudo o como `cartPaymentPlans`
  transformado?

=============================================================
DIMENSIÓN 2 — MOBILE
=============================================================

Greps a ejecutar SIEMPRE:
  - md:hidden|lg:hidden|sm:hidden|useIsMobile|isMobile
  - safe-area-inset|100vh|100svh|100dvh
  - inputMode|enterKeyHint|autoComplete|type="search"|type="tel"|type="email"
  - onPointerDown|onTouchStart|onTouchEnd|touch-action|touchStartX
  - body\.style\.position|body\.style\.overflow|scrollYRef|isAnyOverlayOpen
  - width: 28|width: 32|width: 36|width: 40  (touch target audit)
  - height: 28|height: 32|height: 36  (touch target audit — la altura también cuenta)
  - fontSize: 14|fontSize: 15  (iOS auto-zoom en inputs con <16px)
  - z-\[|zIndex:
  - animate|transition|transform|will-change

Componentes a inventariar:
- Bottom sheets, drawers, FABs, lightbox, modales.
- ¿Cada uno tiene scroll lock?
- ¿Scroll lock se restaura al cerrar (save/restore scrollY)?
- ¿Hay colisiones posibles si dos overlays abiertos al mismo tiempo?
  (Ej: si el user abre un modal mientras un bottom sheet está expandido.)
- ¿Los botones de cierre son ≥ 44x44? (En gamer el mínimo efectivo es 40.)
- ¿Los dropdowns son ≥ 40 de altura, no 28-32?
- ¿100vh se usa en lugar de 100svh?
- ¿Los inputs tienen inputMode/enterKeyHint?
- ¿Los inputs usan fontSize ≥ 16 para evitar auto-zoom iOS?
- ¿Los carruseles manejan swipe nativo?
- ¿Los spacers de bottom bar suman safe-area-inset-bottom?
  (No solo `height: 80`, sino `calc(80px + env(safe-area-inset-bottom))`.)

=============================================================
DIMENSIÓN 3 — CORRECTNESS & A11Y
=============================================================

Greps a ejecutar SIEMPRE:
  - key=\{|key=\{i\}|key=\{idx\}|landingProductId
  - aria-label|aria-pressed|aria-current|aria-selected|aria-expanded|aria-hidden|role=
  - tabIndex|onKeyDown
  - Escape|e\.key === 'Escape'
  - useRef|useCallback|useMemo  (para detectar deps arrays)
  - useProduct|useContext
  - `\?\.` (optional chaining) en props pasadas a hijos (puede romper memoización)
  - useState con tipos complejos (¿se inicializa con valor correcto?)

Verificaciones:
- Keys de lists: `landingProductId ?? id` para productos, `id` estable para otros.
- Botones solo-ícono: `aria-label` obligatorio.
- Chips activos (plazo, inicial, color, frecuencia): `aria-pressed`/`aria-current`.
- Modales/overlays: Escape handler + focus trap (al menos Escape).
- `useCallback`/`useMemo` deps arrays: ¿falta alguna?, ¿hay alguna de más?
- Side-effects "fantasma" como `useProduct()` sin uso — deben eliminarse.
- Estado stale al cambiar producto: ¿`selectedImage`, `selectedColorId`, etc.
  se resetean con `product.id`?
- `useEffect` de defaults (term/initial): ¿usa ref para no pisar al user?

=============================================================
DIMENSIÓN 4 — ROUTING
=============================================================

Greps a ejecutar SIEMPRE:
  - router\.(push|replace)|scroll: false
  - useScrollToTop|window\.scrollTo
  - searchParams|parseFiltersFromParams|buildParamsFromFilters
  - \?term|\?initial|query.*params
  - redirect\(|notFound\(
  - previewBannerOffset|previewKey

Verificaciones:
- `router.push/replace` actualiza query sin `scroll: false` → scroll jump.
- `useScrollToTop` al mount (si aplica).
- Query params leídos al mount Y persistidos al cambiar state.
- Back button preserva state (filtros, pricing).
- Sibling navigation preserva `?term&initial`.
- Link vs window.location (debe ser siempre router client).
- Redirects condicionales (has_catalog, etc.).

=============================================================
DIMENSIÓN 5 — PERFORMANCE & MEMORY
=============================================================

Greps a ejecutar SIEMPRE:
  - addEventListener|removeEventListener
  - setTimeout|clearTimeout|setInterval|clearInterval
  - AbortController|signal|cancelled
  - IntersectionObserver|ResizeObserver|MutationObserver
  - useDeferredValue|useTransition
  - useRef.*Timer|TimerRef|DebounceRef
  - z-\[9|zIndex: 9  (z-index demasiado alto)

Verificaciones:
- Cada addEventListener tiene removeEventListener en cleanup.
- Cada setTimeout/setInterval tiene clearTimeout/clearInterval.
- Fetches en useEffect con posibilidad de race: ¿tienen cancelled flag o requestId?
- useDeferredValue para estados que disparan fetches costosos.
- Refs para cleanup de timers que persisten tras unmount.
- Observers tienen disconnect() en cleanup.
- z-index dentro del sistema (90-300), no 9999.

=============================================================
DIMENSIÓN 6 — ERRORES Y EDGE CASES
=============================================================

Greps a ejecutar SIEMPRE:
  - try \{|catch|\.catch\(
  - console\.(warn|error|log)
  - unavailable|isAvailable|isDisabled
  - empty state|empty-state|length === 0
  - productsError|hasError|setError
  - previewKey|isPreviewingLanding

Verificaciones:
- localStorage operations en try/catch.
- Fetches con .catch que loggea (no silent).
- `null`/`undefined`/`[]` handled en cada data shape.
- Unavailable IDs propagados a drawers.
- Empty states con mensaje útil, no tabla vacía.
- Preview mode respetado en todos los fetches.
- Rotation device / viewport changes no rompen overlays abiertos.

=============================================================
DIMENSIÓN 7 — ANALYTICS Y TELEMETRÍA (CRÍTICA — la que más se escapa)
=============================================================

Esta dimensión ha sido la causa de 3+ pasadas redundantes. Ejecutar TODA la
sub-checklist, no solo los greps superficiales.

PASO 7A — Listar TODO lo que el normal trackea
-----------------------------------------------

1. Abrir `src/app/prototipos/0.6/analytics/useAnalytics.ts` y listar TODOS
   los métodos `trackX` expuestos por el hook (greps `^  trackX` o `export`).
2. En el archivo normal de la página (y sus sub-componentes: `SimilarProducts.tsx`,
   `Cronograma.tsx`, `PricingCalculator.tsx`, `ProductGallery.tsx`, etc.) grepear:
   - `analytics\.track`
   - `tracker\?\.track|tracker\.track`
3. Construir UNA LISTA de "eventos que el normal emite" con el archivo:línea
   donde se emiten y los args que pasa.

PASO 7B — Verificar que el gamer emite CADA UNO
-----------------------------------------------

Para cada evento de la lista anterior, grepear en el gamer:
  - `analytics\.<trackX>`
  - Payload: ¿mismos campos?

Si un evento del normal no aparece en el gamer, ES BUG. Reportar con severidad
MEDIO mínimo.

PASO 7C — Trigger points que típicamente se escapan
---------------------------------------------------

Cuando listes eventos a revisar, mirar EXPLÍCITAMENTE estos triggers en ambos
archivos. Son los que más se han escapado en pasadas anteriores:

- `onClick` que navega a otra página (producto similar, sibling, breadcrumb)
  → ¿emite `trackClick` del tipo correspondiente?
- `onClick` que abre un modal (detalle accesorio, detalle financiamiento,
  lightbox galería) → ¿emite `trackView` / `trackModalOpen`?
- Botones de descarga (PDF ficha técnica, PDF cronograma) → ¿emite
  `trackDownload`?
- Agregar/quitar del carrito DESDE el modal de similares o similar carousel
  → `trackSimilarProductAddToCart` (no el genérico `cart_add`).
- Agregar/quitar accesorios si hay carousel de accesorios →
  `trackAccessoryAdd/Remove/View`.
- Cambiar término de pago, cuota inicial, frecuencia → `trackPricing*Change`.
- Seleccionar color → `trackColorSelect` (con flag `navigates_to_sibling`).
- Cambio de sección en sidebar de navegación → `trackSectionChange` si existe.
- Compartir / imprimir / exportar → eventos correspondientes.

PASO 7C-bis — Parity mobile vs desktop (CRÍTICO)
------------------------------------------------

En solicitar (pasada 5) se encontró que el bottom bar mobile del gamer NO
emitía `trackPricingTermChange` ni `trackPricingInitialChange`, aunque el
dropdown desktop sí lo hacía. Esto fue porque el gamer reimplementó la UI
mobile inline mientras el normal delega al componente `SelectedProductBar`
que sí los emite.

Para CADA evento de analytics que emite el normal (vía componente compartido
o inline), verificar:
- ¿El gamer lo emite en la UI desktop?
- ¿El gamer lo emite en la UI mobile (bottom bar, sheet, drawer)?
- Si la UI gamer tiene dos superficies (desktop card + mobile bottom bar) y
  ambas permiten cambiar el mismo valor (plazo, inicial), AMBAS deben emitir.

Grep específico: buscar la misma acción (ej. `updateAllProductsToTerm`) y
verificar que CADA callsite tenga su `analytics.track*` antes.

PASO 7D — Lista de eventos conocidos al revisar (actualizar a medida)
---------------------------------------------------------------------

Esta lista crece con cada pasada. Si el hook `useAnalytics` tiene un método
que no está aquí, AGREGARLO después de esta pasada.

- product_view (via tracker, no analytics)
- product_click, product_hover, compare_add/remove/open (via tracker)
- wishlist_add, wishlist_remove (via hook useCatalogSharedState internamente)
- cart_add, cart_remove (via hook useCatalogSharedState internamente)
- cart_continue
- trackPricingTermChange, trackPricingInitialChange, trackPricingFrequencyChange
- trackColorSelect (incluye navigates_to_sibling)
- trackCronogramaDownload (cuando se descarga cronograma PDF)
- trackSpecSheetDownload (cuando se descarga ficha técnica PDF)
- trackSimilarProductClick (al navegar a un producto similar)
- trackSimilarProductAddToCart (al agregar similar al carrito)
- trackAccessoryAdd, trackAccessoryRemove
- trackAccessoryView (al abrir modal de detalle de accesorio)
- trackSearchClear, trackLoadMore, trackFilterChange, trackSortChange
- trackFilterClearAll, trackFilterClearSingle
- trackCartDrawer, trackViewModeChange
- trackSearchSuggestionClick
- trackSectionChange (si existe — verificar en el hook)

PASO 7E — Auto-verificación
---------------------------

Antes de reportar la dimensión D7 como "OK":

1. ¿Listé TODOS los métodos del hook `useAnalytics`?
2. ¿Grepé `analytics.track` en el archivo gamer + sus sub-componentes?
3. ¿Comparé conteo de eventos normal vs gamer? (ej: "normal emite 12, gamer 9
   → faltan 3").
4. ¿Revisé cada trigger point del PASO 7C explícitamente?

Si algún "no", REVISAR antes de reportar.

=============================================================
DIMENSIÓN 8 — SUB-COMPONENTES INTERNOS Y CROSS-ZONE
=============================================================

**Parte A — Sub-componentes internos del gamer**
Para archivos gamer con sub-componentes definidos en el mismo archivo
(ej: AccessoriesCarousel, SimilarProductsSection, CronogramaSection, SideNav,
FinanciamientoModal, SpecCard):

- Leer cada uno COMPLETO.
- Comparar contra el componente equivalente del normal (ej: Cronograma.tsx,
  SimilarProducts.tsx, PricingCalculator.tsx).
- Verificar: deps arrays, cleanup, prop drilling, scroll lock local, escape handler,
  payloads de tracking, touch targets.
- En particular: ¿los sub-componentes reciben todos los callbacks y props que
  el componente normal recibe?

**Parte B — Sub-componentes cross-zone (Gamer{Footer,Navbar,Newsletter,etc.})**
Los componentes compartidos de zona-gamer (`GamerNavbar`, `GamerFooter`, etc.)
suelen aceptar props que el gamer page NO les pasa. Verificar:

- Leer la signature del componente `Gamer*` que usa el page (`grep "export function
  Gamer"` en el archivo del componente).
- Listar TODAS sus props opcionales.
- Grep en el page gamer: ¿cuáles de esas props se están pasando?
- Si el normal pasa props equivalentes a su propio componente (ej. `<Footer
  data={footerData} />`) y el gamer no pasa `footerData` al `<GamerFooter>`,
  ES BUG (encontrado en solicitar pasada 4).

Grep típico:
  - `<GamerFooter` / `<GamerNavbar` / `<GamerNewsletter` en el page gamer
  - Comparar con interface del componente.

**Parte C — Hooks de layout que el normal consume pero el gamer no**

El normal típicamente hace:
  const { navbarProps, footerData, agreementData, isLoading, hasError } = useLayout();

El gamer a veces hace:
  const { navbarProps, isLoading, hasError } = useLayout();

Los campos `footerData`, `agreementData`, `promoBannerData`, etc. que el gamer
destructura de menos son bugs — significan que el respectivo `Gamer*` no recibe
esos datos del backend (render default / vacío en vez del contenido real).

Grep:
  - `useLayout\(\)` en normal y gamer, comparar destructuring.

=============================================================
DIMENSIÓN 9 — CONSISTENCIA INTERNA DEL GAMER (NUEVA EN V5)
=============================================================

Bugs que aparecieron en solicitar que no caen limpio en D1-D8 pero son
sistemáticos. Revisar EXPLÍCITAMENTE:

**9A — Back buttons y fallback routes**
- ¿El page usa `router.push(fallbackRoute)` o hardcodea `routes.catalogo(landing)`?
- El texto ("Volver al catálogo") vs el destino — si `!hasCatalog`, el texto
  debe ser "Volver al inicio" y el destino debe ser `landingHome(landing)`.
- Grep: `routes\.(catalogo|landingHome)|fallbackRoute|router\.push.*routes`.

**9B — Código muerto (refs/vars destructuradas y no usadas)**
- Refs que se crean con `useRef` y solo se asignan como `ref={x}` sin que
  ningún código lea `.current` → eliminar.
- Variables destructuradas del context con `void foo;` o sin uso → eliminar.
- Ternarios tautológicos (`cond ? 'X' : 'X'`) → simplificar.
- Grep: `useRef<.*>\(null\)`, `void [a-z]+;`, `\? '([^']+)' : '\1'`.

**9C — Dropdowns/popovers sin Escape ni click-outside**
- Cada state `[xxxOpen, setXxxOpen]` que controla un menú debe tener:
  - Escape handler (useEffect con keydown listener).
  - Click-outside handler (useEffect con mousedown listener + data-attribute
    o ref en el contenedor).
- Grep: `[A-Za-z]+Open.*useState` → por cada uno, buscar un useEffect que
  maneje `e.key === 'Escape'` y un handler de click-outside.

**9D — Fallback chains del backend**
- Cuando el normal hace `config?.landing?.id ?? config?.landing_id` (fallback
  por si el backend devuelve shape A o shape B), el gamer debe hacer lo mismo.
- Grep los accesos a campos del `useWizardConfig()` / `useLayout()` / `useSolicitarFlow()`
  en ambos archivos y comparar si el gamer usa menos fallbacks que el normal.

**9E — Keys `key={i}` / `key={idx}` / `key={index}`**
- Grep: `key=\{i\}|key=\{idx\}|key=\{index\}`.
- Cambiar a key estable basada en el contenido (ej: `card.slug`, `spec.label`).

=============================================================
PROCESO EXACTO POR PÁGINA
=============================================================

1. `wc -l` en ambos archivos para dimensionar.
2. Leer el normal completo.
3. Leer el gamer en chunks de 600-800 líneas SIN saltarse ninguna sección.
4. Inventariar sub-componentes internos del gamer (grep "^function" o
   "^const [A-Z].*= \(.*\) =>").
5. Leer cada sub-componente normal equivalente (o los que el padre usa).
6. Ejecutar TODOS los greps de las 8 dimensiones, en paralelo cuando sea posible.
7. Comparar callsites de handlers (grep del handler name).
8. Verificar shape del CartItem/WishlistItem/SelectedProduct construido: copiar
   el constructor del normal y el del gamer, alinearlos visualmente.
9. Listar TODOS los hallazgos SIN FILTRAR (incluyendo los menores).
10. Clasificar por dimensión y severidad (bloqueante / medio / bajo / informativo).
11. Reportar, indicando qué grep lo detectó (o "lectura visual" si no hay grep).
12. Al final: listar ángulos NO revisados si los hay.

=============================================================
FORMATO DE REPORTE
=============================================================

# Revisión exhaustiva — [página]

## Archivos analizados
- Normal: [archivo]:[líneas]
- Gamer: [archivo]:[líneas]
- Sub-componentes normales leídos: [lista]
- Sub-componentes gamer leídos: [lista]

## Checklist de dimensiones
- [x/✗] D1 Datos — greps ejecutados: [X/Y]
- [x/✗] D2 Mobile — greps ejecutados: [X/Y]
- [x/✗] D3 Correctness & A11y — greps ejecutados: [X/Y]
- [x/✗] D4 Routing — greps ejecutados: [X/Y]
- [x/✗] D5 Performance — greps ejecutados: [X/Y]
- [x/✗] D6 Errores — greps ejecutados: [X/Y]
- [x/✗] D7 Payload eventos (incl. parity mobile/desktop) — greps ejecutados: [X/Y]
- [x/✗] D8 Sub-componentes (internos + cross-zone + useLayout) — leídos: [X/Y]
- [x/✗] D9 Consistencia interna (back button, dead code, dropdowns, keys, fallbacks)

## Hallazgos (sin filtrar, ordenados por severidad)

### 🔴 Bloqueantes (rompen dato o funcionalidad)
| # | Dim | Descripción | Gamer:línea | Normal:línea | Detectado por |

### 🟡 Medios (UX visible o deuda funcional)
| # | Dim | Descripción | Gamer:línea | Normal:línea | Detectado por |

### 🟢 Bajos (polish, consistencia)
| # | Dim | Descripción | Gamer:línea | Normal:línea | Detectado por |

### ℹ️  Informativos / decisiones intencionales
| # | Descripción | Razón para no arreglar |

## Ángulos NO revisados (honestidad)
- [Lista explícita de cosas que NO cubriste, con razón]

## Plan de corrección propuesto
[Agrupado por dimensión y severidad]

=============================================================
ANTES DE REPORTAR, SELF-CHECK
=============================================================

Antes de enviarme el reporte, responder en TU cabeza (no en el output):

1. ¿Ejecuté TODOS los greps de las 8 dimensiones? Si no, ¿cuáles salté y por qué?
2. ¿Leí todos los sub-componentes del gamer mencionados? ¿Comparé cada uno contra
   su equivalente normal?
3. ¿Verifiqué los CALLSITES de los handlers, no solo las declaraciones?
4. ¿Alineé visualmente el shape del CartItem construido en gamer vs normal,
   campo por campo?
5. Si alguno de los anteriores es "no", ¿lo declaré en "Ángulos NO revisados"?

Si las 5 son "sí", el reporte está completo. Si no, COMPLETAR antes de reportar.

=============================================================
LEARNED HELPLESSNESS DEL REVISOR
=============================================================

Si sigues haciendo esto correctamente y aparecen hallazgos en revisiones
posteriores, eso indica uno de dos problemas:

a) El prompt tiene un ángulo no cubierto → agregarlo al prompt para el futuro.
b) Ejecutaste el prompt mal (saltaste greps por apuro, saltaste lectura de
   sub-componentes, etc.) → ser honesto al respecto en vez de presentarlo como
   "hallazgo válido".

Reconocer (b) es más útil para el user que fingir que (a) siempre es la razón.
```

---

## Notas de uso

- **Cuándo invocar**: al empezar una página nueva del gamer que necesita paridad
  con su equivalente normal.
- **Qué no hacer**: no invocar "revisá esa página de nuevo" en lugar de ejecutar
  este prompt — cada invocación sin este framework tiende a descubrir ángulos
  nuevos en iteraciones sucesivas.
- **Si aparecen hallazgos nuevos en una 2ª pasada**: presumir ejecución defectuosa
  del prompt, no hallazgo legítimo. Revisar qué grep se saltó.

## Historial de bugs que motivaron cada dimensión

- **D1**: persistencia rota (setSelectedProduct del context no persiste porque
  cada página tiene su propio Provider). variantId/colorHex/colorName se perdían.
  initialAmount calculado a mano divergía del backend.
- **D2**: scroll lock ausente en iOS. 100vh roto por URL bar. Touch targets 28-32px.
  Safe-area-inset no respetado en FABs. Inputs con fontSize < 16 causaban auto-zoom.
  Spacers de bottom bar sin safe-area-inset-bottom.
- **D3**: keys por índice. useProduct() side-effect muerto. Escape no cierra
  overlays. Estado stale (selectedImage) al cambiar producto.
- **D4**: router.push sin scroll:false causaba jumps. Query params no leídos al
  mount. useScrollToTop ausente.
- **D5**: setTimeout sin cleanup. Race conditions en fetches. z-index 9999.
- **D6**: localStorage sin try/catch. Errors silent. previewKey no propagado.
- **D7** (añadida tras gap): product_hover no se emitía aunque el hook existía.
  Payloads incompletos. **V5**: UI mobile reimplementada inline no emitía
  analytics que el desktop sí emitía (solicitar bottom bar).
- **D8** (añadida tras gap): sub-componentes gamer (CronogramaSection,
  AccessoriesCarousel) con bugs propios no revisados hasta pasadas 6-9.
  **V5**: componentes cross-zone (GamerFooter) no recibían props del useLayout
  context que el normal sí pasaba (footerData, agreementData).
- **D9** (V5): Back button con texto hardcodeado que contradice `hasCatalog`.
  Refs muertos (termsRef). Variables destructuradas con `void foo;`. Dropdowns
  sin Escape ni click-outside. Fallback chains del backend omitidas
  (`config?.landing?.id ?? config?.landing_id`).

## Historial de pasadas reales en solicitar (referencia)

Pasada 1: 18 fixes (persistencia, scroll lock, touch targets, layout context).
Pasada 2 (post fix accesorios duplicados): 5 fixes (B1 insurance, B2 bottom bar,
  M3 setTimeout cleanup, M4/M5 accessory analytics).
Pasada 3: 5 fixes (M6 landing_id fallback, M7 iOS zoom, M8 overlay collision,
  M9 required badge, L7 touch target del X).
Pasada 4: 4 fixes (M11 footerData al GamerFooter, M12/M13 back button fallback,
  M14 ternario tautológico, L10 spacer safe-area).
Pasada 5 (greps completos): 7 fixes (N1 touch target paginación, N2 dropdown
  mobile, N3 analytics bottom bar, N4 Escape dropdown, N5 keys estables,
  N6 termsRef muerto, L3 setIsProductBarExpanded muerto).

Total: 39 fixes en 5 pasadas. La v5 existe para que la próxima página se cierre
en una sola pasada ejecutando el proceso disciplinado arriba.
