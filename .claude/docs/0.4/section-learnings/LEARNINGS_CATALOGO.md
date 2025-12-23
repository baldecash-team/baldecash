# Aprendizajes Específicos - Catálogo v0.4

> Lecciones aprendidas específicas del módulo de Catálogo.
> Para reglas globales, ver `../CONVENTIONS.md`

---

## 1. Paginación por Filas (No por Items)

### Problema
Paginar por items fijos (ej: 12 productos) causa grids incompletos cuando el número de columnas cambia.

### Solución Implementada

```typescript
const INITIAL_ROWS = 4;      // Filas iniciales visibles
const ROWS_PER_LOAD = 2;     // Filas por cada "Cargar más"

const columnsCount = config.productsPerRow.desktop; // 3, 4, o 5
const visibleProductsCount = visibleRows * columnsCount;
const visibleProducts = filteredProducts.slice(0, visibleProductsCount);
const hasMoreProducts = visibleProductsCount < filteredProducts.length;
```

### Beneficio
El grid siempre se ve completo independientemente del número de columnas seleccionado.

---

## 2. Estados de Carga con Skeleton Configurables

### Versiones Implementadas

| Versión | Nombre | Técnica |
|---------|--------|---------|
| V1 | Glow Gradient | CSS gradient animado con colores de marca (#4654CD) |
| V2 | Shimmer Sweep | Barrido horizontal con pseudo-elemento |
| V3 | Wave Stagger | Framer Motion con delay escalonado por índice |

### Código de Referencia - Wave Stagger (V3)

```tsx
<motion.div
  initial={{ opacity: 0.5, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.6,
    delay: index * 0.1,  // Escalonado por índice
    repeat: Infinity,
    repeatType: 'reverse',
  }}
/>
```

### Duraciones Configurables

```typescript
export type LoadingDuration = 'default' | '30s' | '60s';

export const loadingDurationMs: Record<LoadingDuration, number> = {
  default: 800,   // Producción
  '30s': 30000,   // Testing de animaciones
  '60s': 60000,   // Debugging/demos
};
```

### Uso
- **800ms**: Producción real
- **30s/60s**: Testing para validar que animaciones no cansan al usuario

---

## 3. Botón "Cargar Más" - 3 Versiones

### Versiones Implementadas

| Versión | Nombre | Descripción |
|---------|--------|-------------|
| V1 | Minimal Line | Línea sutil con texto centrado |
| V2 | Progress Bar | Barra de progreso visual mostrando % cargado |
| V3 | Gradient CTA | Botón prominente con animación hover |

### Props del Componente

```typescript
interface LoadMoreButtonProps {
  version: 1 | 2 | 3;
  remainingProducts: number;
  totalProducts: number;
  visibleProducts: number;
  onLoadMore: () => void;
}
```

---

## 4. Filtros Técnicos con Tooltips Educativos

### Contexto del Usuario
- Estudiantes universitarios (18-28 años)
- Sin conocimiento técnico de hardware
- Necesitan explicaciones simples

### Patrón de Tooltip Prescriptivo

```typescript
// ✅ Correcto: Prescriptivo (recomienda)
filterTooltips.ram = {
  title: '¿Qué es la RAM?',
  description: 'Más RAM = más programas abiertos simultáneamente.',
  recommendation: 'Mínimo 8GB para estudiantes, 16GB para diseño/programación.',
};

// ❌ Incorrecto: Solo descriptivo
filterTooltips.ram = {
  title: '¿Qué es la RAM?',
  description: 'La RAM es memoria volátil de acceso aleatorio.',
  // Sin recomendación = usuario no sabe qué elegir
};
```

### Tooltips Implementados

| Spec | Recomendación |
|------|---------------|
| RAM | Mínimo 8GB estudiantes, 16GB diseño/programación |
| SSD | Mínimo 256GB, ideal 512GB |
| GPU | Dedicada solo para diseño 3D o gaming |
| Procesador | i5/Ryzen 5 uso general, i7/Ryzen 7 trabajo pesado |
| Pantalla | IPS uso general, OLED diseño/entretenimiento |
| Resolución | FHD estándar recomendado |

---

## 5. Tipos Específicos para Filtros

### Tipos Union Definidos

```typescript
export type Resolution = 'hd' | 'fhd' | 'qhd' | '4k';
export type DisplayType = 'ips' | 'tn' | 'oled' | 'va';
export type ProcessorBrand = 'intel' | 'amd' | 'apple';
export type GamaTier = 'entry' | 'media' | 'alta' | 'premium';
export type StorageType = 'ssd' | 'hdd' | 'emmc';
export type GpuType = 'integrated' | 'dedicated';
export type ProductCondition = 'nuevo' | 'reacondicionado' | 'open_box';
export type StockStatus = 'available' | 'limited' | 'on_demand' | 'out_of_stock';
```

### Uso en FilterState

```typescript
export interface FilterState {
  brands: string[];
  priceRange: [number, number];
  quotaRange: [number, number];
  resolution: Resolution[];      // ✅ Tipo específico
  displayType: DisplayType[];    // ✅ Tipo específico
  processorBrand: ProcessorBrand[];
  // ...
}
```

---

## 6. Arquitectura de Layout Versionado

### Patrón de Switch de Versiones

```typescript
// CatalogLayout.tsx - Wrapper principal
export const CatalogLayout: React.FC<CatalogLayoutProps> = (props) => {
  switch (props.config.layoutVersion) {
    case 1: return <CatalogLayoutV1 {...props} />;
    case 2: return <CatalogLayoutV2 {...props} />;
    case 3: return <CatalogLayoutV3 {...props} />;
    case 4: return <CatalogLayoutV4 {...props} />;
    case 5: return <CatalogLayoutV5 {...props} />;
    case 6: return <CatalogLayoutV6 {...props} />;
    default: return <CatalogLayoutV1 {...props} />;
  }
};
```

### Versiones de Layout

| Versión | Nombre | Referencia |
|---------|--------|------------|
| V1 | Sidebar Clásico | Amazon, Mercado Libre |
| V2 | Filtros Horizontales | Apple Store, Nike |
| V3 | Mobile-First Drawer | Airbnb, Booking |
| V4 | Split View Abstracto | Nubank, Revolut |
| V5 | Split 50/50 Preview | Notion, Figma |
| V6 | Centrado Sticky | Spotify, Netflix |

---

## 7. Mock Data - Distribución Realista

### Por Marca (39 productos)

| Marca | Cantidad |
|-------|----------|
| Lenovo | 9 |
| HP | 8 |
| ASUS | 7 |
| Acer | 6 |
| Dell | 5 |
| MSI | 4 |

### Por Gama

| Gama | Cantidad | Precio | Cuota/mes |
|------|----------|--------|-----------|
| Entry | 10 | S/1,200 - S/2,000 | S/50-90 |
| Media | 13 | S/2,000 - S/3,500 | S/90-150 |
| Alta | 10 | S/3,500 - S/5,500 | S/150-250 |
| Premium | 6 | S/5,500 - S/8,000 | S/250-400 |

### Edge Cases Cubiertos
- Combinaciones de filtros que dan 0 resultados
- Marca con pocos productos (MSI: 4)
- Productos con/sin descuento
- Diferentes estados de stock

---

## 8. Configuración Completa del Catálogo

```typescript
export interface CatalogLayoutConfig {
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6;
  brandFilterVersion: 1 | 2 | 3 | 4 | 5 | 6;
  skeletonVersion: 1 | 2 | 3;
  loadMoreVersion: 1 | 2 | 3;
  loadingDuration: 'default' | '30s' | '60s';
  productsPerRow: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4 | 5;
  };
  showFilterCounts: boolean;
  showTooltips: boolean;
}

export const defaultCatalogConfig: CatalogLayoutConfig = {
  layoutVersion: 1,
  brandFilterVersion: 1,
  skeletonVersion: 1,
  loadMoreVersion: 1,
  loadingDuration: 'default',
  productsPerRow: { mobile: 1, tablet: 2, desktop: 3 },
  showFilterCounts: true,
  showTooltips: true,
};
```

---

## 9. Próximos Pasos Sugeridos

### Para el Catálogo
- [ ] Server-side filtering para catálogos grandes
- [ ] Infinite scroll como alternativa a "Cargar más"
- [ ] Filtros guardados/favoritos por usuario
- [ ] Comparador de productos desde el catálogo

### Métricas a Implementar
- Versión de layout más usada
- Tiempo promedio con filtros activos
- Conversión por versión de botón "Cargar más"

---

## 10. Filtros Booleanos: `null` vs `false`

### Problema
Al limpiar filtros con `handleClearAll`, los filtros booleanos se reseteaban a `false`, causando que el catálogo mostrara "No encontramos equipos".

### Causa Raíz
```typescript
// ❌ Incorrecto: false = filtrar por productos SIN esa característica
touchScreen: false,  // Busca laptops SIN touchscreen (muy pocos resultados)

// ✅ Correcto: null = no aplicar filtro (mostrar todos)
touchScreen: null,   // No filtra por touchscreen
```

### Semántica de Valores

| Valor | Significado | Productos Mostrados |
|-------|-------------|---------------------|
| `null` | No filtrar | Todos |
| `true` | Con característica | Solo los que tienen |
| `false` | Sin característica | Solo los que NO tienen |

### Solución Implementada

```typescript
const handleClearAll = () => {
  onFiltersChange({
    ...filters,
    brands: [],           // Arrays vacíos
    usage: [],
    // ...
    touchScreen: null,    // ✅ Booleans a null
    backlitKeyboard: null,
    fingerprint: null,
    hasWindows: null,
    // ...
    priceRange: [1000, 8000],  // Rangos a defaults
    quotaRange: [40, 400],
  });
};
```

---

## 11. Conteos Dinámicos de Filtros

### Problema
Los conteos de filtros estaban hardcodeados, mostrando números incorrectos después de filtrar.

### Solución Implementada

```typescript
// mockCatalogData.ts
export function getFilterCounts(products: CatalogProduct[]) {
  return {
    brands: countBy(products, p => p.brand),
    ram: countBy(products, p => p.specs.ram.size),
    storage: countBy(products, p => p.specs.storage.size),
    // ... todos los filtros
  };
}

export function applyDynamicCounts(
  options: FilterOption[],
  counts: Record<string, number>
): FilterOption[] {
  return options.map(opt => ({
    ...opt,
    count: counts[opt.value] || 0,
  }));
}
```

### Uso en Layouts

```typescript
// Calcular conteos dinámicos
const dynamicBrandOptions = React.useMemo(() =>
  filterCounts ? applyDynamicCounts(brandOptions, filterCounts.brands) : brandOptions,
  [filterCounts]
);
```

---

## 12. URL Query Params - Omitir Defaults

### Problema
La URL mostraba parámetros innecesarios cuando tenían valores por defecto:
```
?layout=1&brand=1&pricingmode=interactive&term=24&initial=10
```

### Solución
Solo incluir parámetros cuando difieren del valor por defecto:

```typescript
// ❌ Antes: Siempre incluir
params.set('pricingmode', config.pricingMode);
params.set('term', config.defaultTerm.toString());
params.set('initial', config.defaultInitial.toString());

// ✅ Después: Solo si difiere del default
if (config.pricingMode !== 'interactive') {
  params.set('pricingmode', config.pricingMode);
}
if (config.defaultTerm !== 24) {
  params.set('term', config.defaultTerm.toString());
}
if (config.defaultInitial !== 10) {
  params.set('initial', config.defaultInitial.toString());
}
```

### Beneficio
URLs más limpias y compartibles:
```
?layout=4&brand=3&card=6  // Sin defaults innecesarios
```

---

## 13. Anti-patrón: Componentes Definidos Dentro de Funciones

### Problema
Las secciones de filtros se colapsaban automáticamente al seleccionar una opción.

### Causa Raíz
Componentes definidos DENTRO de la función padre:

```typescript
// ❌ INCORRECTO: Componente definido dentro
const TechnicalFiltersV2 = () => {
  // Este componente se RE-CREA en cada render del padre
  const ChipFilter = ({ options, selected, onToggle }) => (
    <div>{/* ... */}</div>
  );

  return (
    <FilterSection title="RAM">
      <ChipFilter options={ramOptions} />  {/* Se desmonta/monta */}
    </FilterSection>
  );
};
```

### Por Qué Falla
1. Cada render del padre crea una NUEVA función `ChipFilter`
2. React compara referencias: `ChipFilter !== ChipFilter` (nueva referencia)
3. React desmonta el componente anterior y monta uno nuevo
4. `FilterSection` pierde su estado interno (`isExpanded`)

### Solución

```typescript
// ✅ CORRECTO: Componente definido FUERA
const ChipFilterContent: React.FC<ChipFilterProps> = ({ options, selected, onToggle }) => (
  <div>{/* ... */}</div>
);

const TechnicalFiltersV2 = () => {
  return (
    <FilterSection title="RAM">
      <ChipFilterContent options={ramOptions} />  {/* Referencia estable */}
    </FilterSection>
  );
};
```

### Regla General
> **Nunca definir componentes dentro de otros componentes.**
> Siempre extraerlos al nivel del módulo o a archivos separados.

---

## 14. Referencias

- **Spec**: `../section-specs/PROMPT_02_CATALOGO_LAYOUT_FILTROS.md`
- **Código**: `src/app/prototipos/0.4/catalogo/`
- **Preview**: `http://localhost:3000/prototipos/0.4/catalogo/catalog-preview`

---

---

## 15. Integración del Comparador en Catálogo

### Configuración Usada

```typescript
const comparatorConfig: ComparatorConfig = {
  layoutVersion: 3,        // Panel Sticky
  accessVersion: 1,        // Checkbox en Cards
  maxProductsVersion: 4,   // Config (pero limitamos a 3)
  fieldsVersion: 2,        // Specs + Features
  highlightVersion: 1,     // Semántico clásico
  priceDiffVersion: 4,     // Badge Animado
  differenceHighlightVersion: 5, // Subrayado Animado
  cardSelectionVersion: 3, // Glow + Ribbon
};

const MAX_COMPARE_PRODUCTS = 3; // Máximo 3 en catálogo
```

### Estado de Comparación

```typescript
const [compareList, setCompareList] = useState<string[]>([]);
const [isComparatorOpen, setIsComparatorOpen] = useState(false);

const handleToggleCompare = useCallback((productId: string) => {
  setCompareList(prev => {
    if (prev.includes(productId)) {
      return prev.filter(id => id !== productId);
    }
    if (prev.length >= MAX_COMPARE_PRODUCTS) {
      return prev; // No agregar si está al máximo
    }
    return [...prev, productId];
  });
}, []);
```

### Props para ProductCard

```typescript
// En ProductCard
onCompare={() => handleToggleCompare(product.id)}
isCompareSelected={compareList.includes(product.id)}
compareDisabled={compareList.length >= MAX_COMPARE_PRODUCTS}
```

### Floating Comparison Bar

- **Posición**: `fixed bottom-6 left-1/2 -translate-x-1/2`
- **Muestra**: Contador + mini previews + botones
- **Aparece**: Cuando `compareList.length > 0 && !isComparatorOpen`

---

## 16. Montos vs Porcentajes en Inicial

### Problema
Los usuarios no entienden "10%" - prefieren ver "S/200".

### Solución

```typescript
// ❌ INCORRECTO: Mostrar porcentaje
{initialOptions.map((initial) => (
  <button>{initialLabels[initial]}</button>  // "10%", "20%"
))}

// ✅ CORRECTO: Calcular y mostrar monto
{initialOptions.map((initial) => {
  const amount = Math.round(product.price * (initial / 100));
  const label = initial === 0 ? 'Sin inicial' : `S/${amount}`;
  return <button>{label}</button>;  // "S/200", "S/400"
})}
```

### Aplicar en Todas las Versiones
- ProductCardV1 a V6: Actualizar selector de inicial
- El cálculo usa `product.price` del producto actual

---

## 17. Botón Comparar en ProductCard

### Ubicación
Al lado del botón de favoritos (Heart), en el overlay de la imagen.

### Estados Visuales

| Estado | Clases |
|--------|--------|
| Normal | `bg-white/80 hover:bg-[#4654CD]/10 cursor-pointer` |
| Seleccionado | `bg-[#4654CD] text-white` |
| Deshabilitado | `bg-white/50 text-neutral-300 cursor-not-allowed` |

### Icono
`GitCompare` de lucide-react

### Tooltip
```typescript
title={
  compareDisabled && !isCompareSelected
    ? 'Máximo 3 productos'
    : isCompareSelected
      ? 'Quitar de comparación'
      : 'Agregar a comparación'
}
```

---

## 18. Integración del Quiz en Catálogo

### Puntos de Entrada

| Elemento | Ubicación | Trigger |
|----------|-----------|---------|
| FAB | `fixed bottom-6 left-6` | Siempre visible |
| CTA Empty State | Después de productos relacionados | Solo cuando 0 resultados |

### FAB del Quiz

```tsx
{/* Quiz FAB - Bottom Left */}
<div className="fixed bottom-6 left-6 z-[100]">
  <Button
    className="bg-[#4654CD] text-white shadow-lg gap-2 px-4"
    onPress={() => setIsQuizOpen(true)}
  >
    <HelpCircle className="w-5 h-5" />
    <span className="hidden sm:inline">¿Necesitas ayuda?</span>
  </Button>
</div>
```

### CTA en Empty State

```tsx
{/* Quiz CTA en Empty State */}
<section className="mt-8 px-4">
  <div className="bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-2xl p-6 border border-[#4654CD]/20">
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#4654CD] flex items-center justify-center">
        <HelpCircle className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">
          ¿No encuentras lo que buscas?
        </h3>
        <p className="text-sm text-neutral-600">
          Nuestro asistente te ayuda a encontrar la laptop perfecta en menos de 2 minutos
        </p>
      </div>
      <Button onPress={() => setIsQuizOpen(true)}>
        Iniciar asistente
      </Button>
    </div>
  </div>
</section>
```

### Config Responsivo del Quiz

```typescript
const isMobile = useIsMobile();

const quizConfig = {
  layoutVersion: (isMobile ? 4 : 5) as 4 | 5, // V4 bottom-sheet, V5 modal
  questionCount: 7 as const,
  questionStyle: 1 as const,
  resultsVersion: 1 as const,
  focusVersion: 1 as const,
};
```

### Posicionamiento de Elementos

| Elemento | Posición | z-index |
|----------|----------|---------|
| Quiz FAB | `bottom-6 left-6` | 100 |
| Config Badge | `bottom-20 left-6` | 100 |
| Floating Controls | `bottom-6 right-6` | 100 |
| Comparison Bar | `bottom-6 left-1/2` | 90 |

### Balance Visual

```
┌─────────────────────────────────────┐
│                                     │
│         [Catálogo Grid]             │
│                                     │
│ [Quiz FAB]              [Controls]  │
│ bottom-left             bottom-right│
└─────────────────────────────────────┘
```

---

## 19. Toggle `showPricingOptions`

### Propósito
Permite ocultar los selectores de plazo e inicial en las ProductCards. Útil para simplificar la UI cuando no se requiere interacción de precio.

### Configuración

```typescript
// En CatalogLayoutConfig
showPricingOptions: boolean; // default: true

// En ProductCardProps
showPricingOptions?: boolean;
```

### Query Param

```typescript
// Lectura
const showPricingOptions = searchParams.get('pricingoptions') !== 'false';

// Escritura (solo cuando difiere del default)
if (!config.showPricingOptions) {
  params.set('pricingoptions', 'false');
}
```

### Uso en ProductCards

```tsx
{pricingMode === 'interactive' && showPricingOptions && (
  <div className="space-y-2">
    {/* Selectores de plazo e inicial */}
  </div>
)}
```

---

## 20. ProductCardV6 con Specs Detalladas

### Cambio
La versión 6 ahora muestra specs con iconos (estilo V1) en lugar de la línea compacta.

### Antes
```
AMD · 16GB · 512GB · 14"
```

### Después
```
[Cpu icon] AMD Ryzen 5 5600H
[RAM icon] 16GB DDR4 (expandible)
[HDD icon] 512GB SSD
[Monitor icon] 14" FHD
```

### Ubicación
Las specs están **encima** del bloque "Cuota mensual" y centradas para mantener consistencia con el diseño centrado de V6.

---

## 21. Configuración Preferida del Catálogo (Index 0.4)

### URL Completa
```
/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1&pricingoptions=false
```

### Desglose

| Parámetro | Valor | Nombre |
|-----------|-------|--------|
| layout | 4 | Quick Cards + Sidebar |
| brand | 3 | Grid de Logos |
| card | 6 | Centrado Impacto |
| techfilters | 3 | Cards con Iconos |
| cols | 3 | 3 columnas |
| skeleton | 3 | Wave Stagger |
| duration | default | 800ms |
| loadmore | 3 | Gradient CTA |
| gallery | 2 | Thumbnails |
| gallerysize | 3 | Expanded |
| tags | 1 | Chips Apilados |
| pricingoptions | false | Ocultos |

---

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-20 | Versión inicial |
| 1.1 | 2025-12-20 | Refactorizado - reglas globales movidas a CONVENTIONS.md |
| 1.2 | 2025-12-21 | Agregado: null vs false, conteos dinámicos, URL params, anti-patrón componentes |
| 1.3 | 2025-12-22 | Agregado: Integración comparador, montos vs %, botón comparar en cards |
| 1.4 | 2025-12-23 | Agregado: Integración del Quiz (FAB + Empty State + Config responsivo) |
| 1.5 | 2025-12-23 | Agregado: showPricingOptions toggle, ProductCardV6 specs detalladas, config preferida |
