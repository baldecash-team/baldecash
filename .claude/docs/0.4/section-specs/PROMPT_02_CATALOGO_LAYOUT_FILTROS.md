# Prompt #2: Catálogo - Layout y Filtros - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 36 |
| **Iteraciones T (6 versiones)** | 4 |
| **Iteraciones F (1 versión)** | 32 |
| **Prioridad** | Alta - MVP Core |
| **Productos de prueba** | 39 laptops |

---

## 1. Contexto del Proyecto

### 1.1 Descripción General
BaldeCash es una fintech peruana que proporciona financiamiento de laptops y equipos electrónicos exclusivamente para estudiantes universitarios sin acceso a sistemas bancarios tradicionales. El catálogo es el core del e-commerce donde los estudiantes exploran y seleccionan productos.

### 1.2 Público Objetivo
- Estudiantes universitarios peruanos (18-28 años)
- Sin historial crediticio bancario
- 64% accede desde dispositivos móviles
- Usuario NO técnico: necesita explicaciones simples de specs
- Conectividad variable (3G/4G intermitente)

### 1.3 Insights UX/UI del Researcher
- **Mobile-First obligatorio**: Filtros en drawer para móvil
- **Cuota prominente**: Filtrar por cuota mensual, no solo precio total
- **Explicaciones contextuales**: Tooltips para specs técnicas (RAM, SSD, etc.)
- **Filtros visibles**: Expandidos por defecto, con conteo de productos
- **Performance**: Latencia < 100ms en filtros

---

## 2. Stack Tecnológico

```json
{
  "framework": "Next.js 14+ (App Router)",
  "language": "TypeScript",
  "ui_library": "@nextui-org/react v2.6.11",
  "icons": "lucide-react v0.556.0",
  "styling": "Tailwind CSS v4",
  "animations": "framer-motion v12.23.25"
}
```

---

## 3. Guía de Marca

### 3.1 Colores
```css
--brand-primary: #4247d2;
--brand-primary-light: #6366f1;
--brand-primary-dark: #3730a3;
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-700: #404040;
--neutral-800: #262626;
```

### 3.2 Tipografías
```css
font-family: 'Baloo 2', cursive; /* Títulos */
font-family: 'Asap', sans-serif; /* Cuerpo */
```

### 3.3 Restricciones
- NO emojis → usar `lucide-react`
- NO gradientes → colores sólidos
- Imágenes de prueba → Unsplash

---

## 4. Estructura de Archivos a Generar (6 versiones)

```
src/app/prototipos/0.4/catalogo/
├── page.tsx                              # Redirecciona a catalog-preview
├── catalog-preview/
│   └── page.tsx                          # Preview con modal de configuracion
├── components/
│   └── catalog/
│       ├── CatalogLayout.tsx             # Wrapper principal
│       ├── CatalogSettingsModal.tsx      # Modal de configuración (6 opciones)
│       ├── layout/
│       │   ├── CatalogLayoutV1.tsx       # Sidebar Clásico
│       │   ├── CatalogLayoutV2.tsx       # Filtros Horizontales
│       │   ├── CatalogLayoutV3.tsx       # Mobile-First Drawer
│       │   ├── CatalogLayoutV4.tsx       # Split View Abstracto
│       │   ├── CatalogLayoutV5.tsx       # Split 50/50 Preview
│       │   └── CatalogLayoutV6.tsx       # Centrado Sticky
│       ├── filters/
│       │   ├── FilterSection.tsx         # Wrapper de sección
│       │   ├── FilterChips.tsx           # Chips de filtros aplicados
│       │   ├── FilterDrawer.tsx          # Drawer móvil
│       │   ├── brand/
│       │   │   ├── BrandFilterV1.tsx     # Solo texto
│       │   │   ├── BrandFilterV2.tsx     # Logo + texto
│       │   │   ├── BrandFilterV3.tsx     # Grid de logos
│       │   │   ├── BrandFilterV4.tsx     # Carousel
│       │   │   ├── BrandFilterV5.tsx     # Dropdown
│       │   │   └── BrandFilterV6.tsx     # Chips
│       │   ├── PriceRangeFilter.tsx      # Slider precio total
│       │   ├── QuotaRangeFilter.tsx      # Slider cuota mensual
│       │   ├── UsageFilter.tsx           # Uso recomendado
│       │   ├── TechnicalFilters.tsx      # RAM, SSD, Pantalla, etc.
│       │   ├── CommercialFilters.tsx     # Stock, Condición, Gama
│       │   └── FilterTooltip.tsx         # Explicación de specs
│       └── sorting/
│           └── SortDropdown.tsx          # Ordenamiento
├── types/
│   └── catalog.ts                        # Tipos TypeScript
├── data/
│   └── mockCatalogData.ts                # Datos de prueba
└── CATALOG_README.md                     # Documentación
```

---

## 5. Preguntas del Excel - Segmento B (Layout y Filtros)

### 5.1 Layout General (4 preguntas)

#### Pregunta B.1 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Layout general |
| **Pregunta** | ¿El catálogo debe ser grid (2-3 columnas) o lista (1 producto por fila)? |
| **Contexto** | Grid muestra más productos; lista permite más detalle por producto. |
| **Respuesta** | No tenemos una idea clara, pero considerando que tendremos el doble de productos |

**6 Versiones Detalladas:**

---

### V1: Layout Sidebar Clásico (E-commerce Tradicional)

**Concepto**: Sidebar fijo izquierdo 280px con filtros, grid de productos a la derecha

**Elementos visuales**:
- Sidebar: `w-[280px] bg-white border-r`
- Grid: 3 columnas desktop, 2 tablet, 1 móvil
- Header con breadcrumbs y contador de resultados
- Filtros expandidos por defecto

**Layout**:
```
[SIDEBAR 280px  |  HEADER + SORT              ]
[  Filtros      |  [Card][Card][Card]         ]
[  expandidos   |  [Card][Card][Card]         ]
[               |  [Pagination]               ]
```

**Referencia**: Amazon, Mercado Libre, Falabella

---

### V2: Filtros Horizontales Colapsables

**Concepto**: Filtros en fila horizontal arriba del grid, colapsables

**Elementos visuales**:
- Barra de filtros: `flex gap-2` con dropdowns
- Chips de filtros aplicados debajo
- Grid ocupa todo el ancho
- Más productos visibles por pantalla

**Layout**:
```
[HEADER + SORT                                ]
[[Marca v] [Precio v] [RAM v] [Más filtros]]  ]
[Chips aplicados: Lenovo × | 8GB+ ×           ]
[  [Card]  [Card]  [Card]  [Card]             ]
[  [Card]  [Card]  [Card]  [Card]             ]
```

**Referencia**: Apple Store, Nike, Zara

---

### V3: Mobile-First Drawer

**Concepto**: Botón flotante que abre drawer de filtros, mismo UX en desktop y móvil

**Elementos visuales**:
- FAB: `fixed bottom-6 right-6` con icono Filter
- Drawer: `w-full md:w-[400px]` desde la derecha
- Grid sin sidebar, máximo aprovechamiento

**Layout**:
```
[HEADER + SORT                                ]
[  [Card]  [Card]  [Card]  [Card]             ]
[  [Card]  [Card]  [Card]  [Card]             ]
                                    [FAB 🔧]
```

**Referencia**: Airbnb, Booking, apps móviles

---

### V4: Split View Abstracto

**Concepto**: Vista dividida con filtros flotantes sobre fondo con shapes geométricos

**Elementos visuales**:
- Fondo: Shapes sutiles en tonos primarios `bg-[#4654CD]/5`
- Panel de filtros: Card flotante con sombra
- Transiciones suaves entre estados

**Layout**:
```
[    SHAPES BACKGROUND SUBTLE                 ]
[  [Filtros Card]  |  GRID                    ]
[  [flotante]      |  [Card][Card][Card]      ]
```

**Referencia**: Nubank, Revolut (secciones de productos)

---

### V5: Split 50/50 con Preview

**Concepto**: Mitad filtros/preview, mitad resultados

**Elementos visuales**:
- Izquierda: Filtros + preview del producto seleccionado
- Derecha: Lista/Grid de productos
- Hover en producto muestra preview izquierdo

**Layout**:
```
[FILTROS + PREVIEW  |  GRID RESULTADOS        ]
[  [Filtros]        |  [Card][Card]           ]
[  [Preview Card]   |  [Card][Card]           ]
[  del hover        |  [Card][Card]           ]
```

**Referencia**: Notion database views, Figma asset panels

---

### V6: Centrado con Filtros Sticky

**Concepto**: Grid centrado, filtros como barra sticky superior

**Elementos visuales**:
- Barra sticky: `sticky top-16` con filtros inline
- Grid centrado: `max-w-6xl mx-auto`
- Scroll suave con filtros siempre visibles

**Layout**:
```
[=== STICKY FILTER BAR ====================== ]
[                                             ]
[        [Card]  [Card]  [Card]               ]
[        [Card]  [Card]  [Card]               ]
[        [Card]  [Card]  [Card]               ]
```

**Referencia**: Spotify Browse, Netflix categorías

---

---

#### Pregunta B.2 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Layout general |
| **Pregunta** | ¿Cuántos productos deben verse sin hacer scroll en desktop? ¿Y en móvil? |
| **Contexto** | Balance entre overview y detalle visible. |
| **Respuesta** | No tenemos una idea clara, mejores prácticas UX & UI |

**Versiones a generar:**
- **V1**: 6 productos (2×3), cards medianas con specs
- **V2**: 8 productos (2×4), cards compactas
- **V3**: 9 productos (3×3), cards muy compactas
- **V4**: 4 productos (2×2), cards grandes con más detalle
- **V5**: 6 productos split (3 izquierda, preview derecha)
- **V6**: 12 productos (3×4), cards minimalistas

#### Pregunta B.3 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Layout general |
| **Pregunta** | ¿Los filtros deben estar en sidebar izquierdo, arriba del catálogo, o en modal/drawer? |
| **Contexto** | Sidebar es estándar desktop; drawer es mejor para móvil. |
| **Respuesta** | No tenemos una idea clara, mejores prácticas UX & UI |

**Versiones a generar:**
- **V1**: Sidebar fijo izquierdo 280px
- **V2**: Filtros horizontales colapsables
- **V3**: Drawer desde la derecha (FAB)
- **V4**: Panel flotante con shapes decorativos
- **V5**: Split 50/50 filtros + preview
- **V6**: Barra sticky superior

#### Pregunta B.4 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Layout general |
| **Pregunta** | ¿Debe haber una vista de 'mapa de precios' o solo lista tradicional? |
| **Contexto** | Visualización alternativa para comparar rangos de precio. |
| **Respuesta** | No es prioritario, lista tradicional |

**Implementación:** Solo vista de grid tradicional para MVP

---

### 5.2 Filtros - Diseño (4 preguntas)

#### Pregunta B.5 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Diseño |
| **Pregunta** | ¿Los filtros deben estar expandidos por defecto o colapsados? |
| **Contexto** | Expandidos son visibles pero ocupan espacio. |
| **Respuesta** | Consideramos que deben estar abiertos (visibles) |

**Implementación:** Filtros principales expandidos, secundarios colapsados

#### Pregunta B.6 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Diseño |
| **Pregunta** | ¿Debe mostrarse cuántos productos hay en cada opción de filtro? (Ej: 'HP (12)') |
| **Contexto** | Ayuda a saber si vale la pena filtrar. |
| **Respuesta** | Sí, consideramos que debe aparecer la cantidad |

**Implementación:** Mostrar conteo `HP (12)` junto a cada opción

#### Pregunta B.7 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Diseño |
| **Pregunta** | ¿Los filtros aplicados deben mostrarse como 'chips' removibles arriba del catálogo? |
| **Contexto** | Permite ver y quitar filtros fácilmente. |
| **Respuesta** | No tenemos idea clara, mejores prácticas UX & UI |

**Implementación:** Chips removibles debajo del ordenamiento

#### Pregunta B.8 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Diseño |
| **Pregunta** | ¿Debe haber un botón de 'Limpiar filtros' siempre visible? |
| **Contexto** | Facilita empezar de nuevo si se filtró demasiado. |
| **Respuesta** | Sí, es importante para el usuario |

**Implementación:** Botón "Limpiar todo" visible cuando hay filtros activos

---

### 5.3 Filtros - Contenido (5 preguntas)

#### Pregunta B.9 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Contenido |
| **Pregunta** | ¿Los filtros de specs técnicas deben tener explicación? (Ej: info icon junto a 'RAM') |
| **Contexto** | Usuarios no técnicos no saben qué es RAM o SSD. |
| **Respuesta** | Sí, porque el público objetivo no necesariamente conoce estos términos |

**Implementación:** Icono `Info` con tooltip explicativo en cada spec técnica

#### Pregunta B.10 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Contenido |
| **Pregunta** | ¿Debe haber un filtro de 'Uso recomendado'? (Estudios, Gaming, Diseño, Oficina) |
| **Contexto** | Traduce specs a beneficios comprensibles. |
| **Respuesta** | Sí, consideramos que es importante |

**Implementación:** Filtro con iconos: Estudios, Gaming, Diseño, Oficina, Programación

#### Pregunta B.11 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Contenido |
| **Pregunta** | ¿El filtro de precio debe ser por cuota mensual o precio total? ¿O ambos? |
| **Contexto** | Estudiantes piensan en cuotas; precio total es más transparente. |
| **Respuesta** | Ambos, además tendremos frecuencia semanal/quincenal/mensual |

**Implementación:** Dos sliders: Cuota (S/40 - S/400) y Precio Total (S/1,000 - S/5,000)

#### Pregunta B.12 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Contenido |
| **Pregunta** | ¿Debe haber un filtro de 'Disponibilidad inmediata' vs 'Por encargo'? |
| **Contexto** | Si aplica al inventario de BaldeCash. |
| **Respuesta** | Sí, va a depender del usuario |

**Implementación:** Toggle o checkbox "Solo disponibles ahora"

#### Pregunta B.13 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - Contenido |
| **Pregunta** | ¿El filtro de marca debe mostrar logos o solo nombres? |
| **Contexto** | Logos son más reconocibles visualmente. |
| **Respuesta** | No tenemos idea clara, mejores prácticas UX & UI |

**6 Versiones Detalladas:**

- **V1 - Solo Texto**: Checkboxes con nombre de marca + conteo "(12)"
- **V2 - Logo + Texto**: Logo pequeño 24px + nombre + checkbox
- **V3 - Grid de Logos**: Grid 3×2 de logos clickeables, sin texto
- **V4 - Carousel de Logos**: Scroll horizontal de logos, selección múltiple
- **V5 - Dropdown con Logos**: Select con logos en opciones
- **V6 - Chips Seleccionables**: Chips con logo + nombre, toggle on/off

---

### 5.4 Filtros Técnicos - RAM (3 preguntas)

#### Pregunta B.14 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - RAM |
| **Pregunta** | ¿Debe haber filtro de 'RAM expandible' para usuarios que quieren upgrade futuro? |
| **Contexto** | Diferenciador importante para usuarios técnicos. |
| **Respuesta** | Sí, va a depender del usuario |

**Implementación:** Checkbox "RAM expandible" con tooltip explicativo

#### Pregunta B.15 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - RAM |
| **Pregunta** | ¿Cómo comunicar 'RAM soldada' sin que suene negativo? |
| **Contexto** | Algunas laptops tienen RAM soldada (no expandible). |
| **Respuesta** | Manejar tema de comunicación, mejores prácticas UX & UI |

**Implementación:** Mostrar como "RAM fija" o "Memoria optimizada de fábrica"

#### Pregunta B.16 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Filtros - RAM |
| **Pregunta** | ¿El filtro de RAM debe mostrar 'Hasta X GB máximo' además de capacidad actual? |
| **Contexto** | Campo max_gb indica el máximo soportado. |
| **Respuesta** | Manejar comunicación de cara al usuario |

**Implementación:** Mostrar "8GB (expandible a 16GB)" cuando aplique

---

### 5.5 Filtros Técnicos - Pantalla (4 preguntas)

#### Pregunta B.17-B.20 [DEFINIDO - 1 versión cada uno]
| Filtro | Implementación |
|--------|----------------|
| Tipo de panel (IPS/TN/OLED) | Checkbox con tooltip explicativo |
| Refresh rate (60Hz/120Hz/144Hz) | Solo mostrar para Gaming, tooltip |
| Pantalla táctil | Checkbox "Touch" |
| Resolución | Nombres comerciales: HD, FHD, QHD |

---

### 5.6 Filtros Técnicos - Conectividad (2 preguntas)

#### Pregunta B.21-B.22 [DEFINIDO - 1 versión cada uno]
| Filtro | Implementación |
|--------|----------------|
| Versión WiFi | Simplificar: "WiFi 6 o superior" |
| Puerto Ethernet | Checkbox "Con puerto de red" |

---

### 5.7 Filtros Técnicos - Puertos (3 preguntas)

#### Pregunta B.23-B.25 [DEFINIDO - 1 versión cada uno]
| Filtro | Implementación |
|--------|----------------|
| Thunderbolt | Checkbox "Thunderbolt" (usuarios avanzados) |
| Lector SD / HDMI | Checkboxes separados |
| Cantidad USB | "Mínimo X puertos USB" (slider) |

---

### 5.8 Filtros Técnicos - Otros (6 preguntas)

#### Pregunta B.26-B.31 [DEFINIDO - 1 versión cada uno]
| Filtro | Implementación |
|--------|----------------|
| Teclado retroiluminado | Checkbox con icono |
| Teclado numérico | Checkbox (útil para contabilidad) |
| Lector de huella | Checkbox "Seguridad biométrica" |
| Windows vs FreeDOS | "Con Windows" / "Sin sistema operativo" |
| GPU dedicada vs integrada | "Con tarjeta de video dedicada" |
| Gama | "Básica", "Recomendada", "Avanzada", "Premium" |

---

### 5.9 Filtros Comerciales (2 preguntas)

#### Pregunta B.32-B.33 [DEFINIDO - 1 versión cada uno]
| Filtro | Implementación |
|--------|----------------|
| Nueva vs Reacondicionada | Chips seleccionables |
| Stock disponible | Toggle "Disponible ahora" |

---

### 5.10 Ordenamiento (3 preguntas)

#### Pregunta B.34 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Ordenamiento |
| **Pregunta** | ¿Qué opciones de ordenamiento ofrecer? |
| **Respuesta** | Múltiples opciones, mejores prácticas UX & UI |

**Implementación:** Dropdown con opciones:
- Recomendados (default)
- Precio: Menor a mayor
- Precio: Mayor a menor
- Cuota: Menor a mayor
- Más nuevos
- Más populares

#### Pregunta B.35 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Ordenamiento |
| **Pregunta** | ¿'Recomendado' debe ser el orden por defecto? |
| **Respuesta** | Sí, mejores prácticas UX & UI |

**Implementación:** "Recomendados" por defecto (is_featured + margen + stock)

#### Pregunta B.36 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Ordenamiento |
| **Pregunta** | ¿Debe poder ordenarse de menor a mayor Y de mayor a menor precio? |
| **Respuesta** | Sí, va a depender del usuario |

**Implementación:** Ambas direcciones disponibles

---

## 6. Tipos TypeScript

```typescript
// types/catalog.ts

export type UsageType = 
  | 'estudios' 
  | 'gaming' 
  | 'diseno' 
  | 'oficina' 
  | 'programacion';

export type SortOption = 
  | 'recommended' 
  | 'price_asc' 
  | 'price_desc' 
  | 'quota_asc' 
  | 'newest' 
  | 'popular';

export type QuotaFrequency = 'weekly' | 'biweekly' | 'monthly';

export type ProductCondition = 'nuevo' | 'reacondicionado' | 'open_box';

export type StockStatus = 'available' | 'limited' | 'on_demand' | 'out_of_stock';

export type GamaTier = 'entry' | 'media' | 'alta' | 'premium';

export interface FilterState {
  brands: string[];
  priceRange: [number, number];
  quotaRange: [number, number];
  quotaFrequency: QuotaFrequency;
  usage: UsageType[];
  ram: number[];
  ramExpandable: boolean | null;
  storage: number[];
  storageType: ('ssd' | 'hdd' | 'emmc')[];
  processorBrand: ('intel' | 'amd' | 'apple')[];
  gpuType: ('integrated' | 'dedicated')[];
  displaySize: number[];
  displayType: ('ips' | 'tn' | 'oled' | 'va')[];
  resolution: ('hd' | 'fhd' | 'qhd' | '4k')[];
  touchScreen: boolean | null;
  refreshRate: number[];
  backlitKeyboard: boolean | null;
  numericKeypad: boolean | null;
  fingerprint: boolean | null;
  hasWindows: boolean | null;
  hasThunderbolt: boolean | null;
  hasEthernet: boolean | null;
  hasSDCard: boolean | null;
  condition: ProductCondition[];
  stock: StockStatus[];
  gama: GamaTier[];
}

export interface AppliedFilter {
  id: string;
  category: string;
  label: string;
  value: string | number | boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface FilterSectionProps {
  title: string;
  tooltip?: string;
  expanded?: boolean;
  children: React.ReactNode;
}

export interface CatalogLayoutConfig {
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6;
  brandFilterVersion: 1 | 2 | 3 | 4 | 5 | 6;
  productsPerRow: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface FilterTooltipContent {
  [key: string]: {
    title: string;
    description: string;
    recommendation?: string;
  };
}
```

---

## 7. Datos de Prueba

**Total de productos mock: 39 laptops** con la siguiente distribución:

| Marca | Cantidad |
|-------|----------|
| Lenovo | 9 |
| HP | 8 |
| ASUS | 7 |
| Acer | 6 |
| Dell | 5 |
| MSI | 4 |

| Gama | Cantidad |
|------|----------|
| Entry | 10 |
| Media | 13 |
| Alta | 10 |
| Premium | 6 |

```typescript
// data/mockCatalogData.ts

export const filterTooltips: FilterTooltipContent = {
  ram: {
    title: '¿Qué es la RAM?',
    description: 'Es la memoria que usa tu laptop para ejecutar programas. Más RAM = más programas abiertos simultáneamente.',
    recommendation: 'Mínimo 8GB para estudiantes, 16GB para diseño/programación.',
  },
  ssd: {
    title: '¿Qué es SSD?',
    description: 'Es el disco donde se guardan tus archivos. SSD es más rápido que HDD tradicional.',
    recommendation: 'Mínimo 256GB, ideal 512GB para estudiantes.',
  },
  gpu: {
    title: '¿GPU dedicada o integrada?',
    description: 'GPU dedicada es mejor para gaming y diseño. Integrada es suficiente para estudios y oficina.',
    recommendation: 'Dedicada solo si haces diseño 3D o gaming.',
  },
  processor: {
    title: '¿Intel o AMD?',
    description: 'Ambas marcas son excelentes. AMD suele tener mejor relación precio-rendimiento.',
    recommendation: 'i5/Ryzen 5 para uso general, i7/Ryzen 7 para trabajo pesado.',
  },
};

export const usageOptions: FilterOption[] = [
  { value: 'estudios', label: 'Estudios', count: 45, icon: 'GraduationCap' },
  { value: 'gaming', label: 'Gaming', count: 12, icon: 'Gamepad2' },
  { value: 'diseno', label: 'Diseño', count: 18, icon: 'Palette' },
  { value: 'oficina', label: 'Oficina', count: 38, icon: 'Briefcase' },
  { value: 'programacion', label: 'Programación', count: 22, icon: 'Code' },
];

export const brandOptions: FilterOption[] = [
  { value: 'lenovo', label: 'Lenovo', count: 15 },
  { value: 'hp', label: 'HP', count: 12 },
  { value: 'asus', label: 'ASUS', count: 10 },
  { value: 'acer', label: 'Acer', count: 8 },
  { value: 'dell', label: 'Dell', count: 6 },
  { value: 'msi', label: 'MSI', count: 4 },
];

export const ramOptions: FilterOption[] = [
  { value: '4', label: '4 GB', count: 5 },
  { value: '8', label: '8 GB', count: 25 },
  { value: '16', label: '16 GB', count: 18 },
  { value: '32', label: '32 GB', count: 4 },
];

export const storageOptions: FilterOption[] = [
  { value: '256', label: '256 GB', count: 12 },
  { value: '512', label: '512 GB', count: 28 },
  { value: '1000', label: '1 TB', count: 10 },
];

export const gamaOptions: FilterOption[] = [
  { value: 'entry', label: 'Básica', count: 15 },
  { value: 'media', label: 'Recomendada', count: 22 },
  { value: 'alta', label: 'Avanzada', count: 10 },
  { value: 'premium', label: 'Premium', count: 5 },
];
```

---

## 8. Componente de Referencia - FilterSection

```typescript
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';

interface FilterSectionProps {
  title: string;
  tooltip?: {
    title: string;
    description: string;
    recommendation?: string;
  };
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  tooltip,
  defaultExpanded = true,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-800">{title}</h3>
          {tooltip && (
            <Tooltip
              content={
                <div className="max-w-xs p-2">
                  <p className="font-semibold text-sm">{tooltip.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">{tooltip.description}</p>
                  {tooltip.recommendation && (
                    <p className="text-xs text-[#4247d2] mt-2">
                      💡 {tooltip.recommendation}
                    </p>
                  )}
                </div>
              }
            >
              <Info className="w-4 h-4 text-neutral-400 hover:text-[#4247d2] cursor-help" />
            </Tooltip>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};
```

---

## 9. URLs de Acceso

| Ruta | Descripción |
|------|-------------|
| `/prototipos/0.4/catalogo` | Redirecciona a preview |
| `/prototipos/0.4/catalogo/catalog-preview` | Comparador con settings modal (6 opciones) |
| `/prototipos/0.4/catalogo/catalog-v1` | V1: Sidebar Clásico |
| `/prototipos/0.4/catalogo/catalog-v2` | V2: Filtros Horizontales |
| `/prototipos/0.4/catalogo/catalog-v3` | V3: Mobile-First Drawer |
| `/prototipos/0.4/catalogo/catalog-v4` | V4: Split View Abstracto |
| `/prototipos/0.4/catalogo/catalog-v5` | V5: Split 50/50 Preview |
| `/prototipos/0.4/catalogo/catalog-v6` | V6: Centrado Sticky |

---

## 10. Checklist de Entregables

- [ ] `types/catalog.ts` - Tipos completos con 6 versiones
- [ ] `data/mockCatalogData.ts` - Datos y tooltips
- [ ] `CatalogLayout.tsx` - Wrapper principal
- [ ] `CatalogSettingsModal.tsx` - Modal configuración (6 opciones por componente)
- [ ] `CatalogLayoutV1.tsx` a `V6.tsx` - 6 versiones de layout
- [ ] `BrandFilterV1.tsx` a `V6.tsx` - 6 versiones de filtro de marca
- [ ] `FilterSection.tsx` - Sección colapsable
- [ ] `FilterChips.tsx` - Chips removibles
- [ ] `FilterDrawer.tsx` - Drawer móvil
- [ ] `PriceRangeFilter.tsx` - Slider precio
- [ ] `QuotaRangeFilter.tsx` - Slider cuota
- [ ] `UsageFilter.tsx` - Uso recomendado
- [ ] `TechnicalFilters.tsx` - Specs técnicas
- [ ] `CommercialFilters.tsx` - Filtros comerciales
- [ ] `FilterTooltip.tsx` - Tooltips explicativos
- [ ] `SortDropdown.tsx` - Ordenamiento
- [ ] `catalog-preview/page.tsx` con modal de configuracion
- [ ] `CATALOG_README.md`

---

## 11. Notas Importantes

1. **Mobile-First**: Drawer de filtros en < 768px
2. **Tooltips obligatorios**: Para RAM, SSD, GPU, Procesador
3. **Conteo de productos**: Mostrar "(12)" junto a cada opción
4. **Performance**: Filtros deben responder en < 100ms
5. **Accesibilidad**: Focus states, aria-labels, navegación por teclado
6. **Sin gradientes**: Colores sólidos
7. **Sin emojis**: Solo Lucide icons
