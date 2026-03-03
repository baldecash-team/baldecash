# Detalle de Producto v0.6 - Documentación Técnica

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Componentes Principales](#componentes-principales)
4. [API y Transformación de Datos](#api-y-transformación-de-datos)
5. [Tipos e Interfaces](#tipos-e-interfaces)
6. [Configuración y Variantes](#configuración-y-variantes)
7. [Sistema de Pagos Precalculados](#sistema-de-pagos-precalculados)
8. [Formato de Moneda y Redondeos](#formato-de-moneda-y-redondeos)
9. [Política de Datos: Solo API](#política-de-datos-solo-api-sin-mock-fallback)
10. [Sistema de Imágenes y Colores](#sistema-de-imágenes-y-colores)
11. [Parámetros URL](#parámetros-url)
12. [Flujos de Datos](#flujos-de-datos)
13. [Cómo Extender](#cómo-extender)

---

## Arquitectura General

El detalle de producto v0.6 sigue una arquitectura de 2 columnas con sticky positioning y datos precalculados desde el backend:

```
┌─────────────────────────────────────────────────────────────┐
│                   ProductDetailClient.tsx                    │
│                    (Orquestador Principal)                   │
├─────────────────────────────────────────────────────────────┤
│  Data Fetching            │  State                          │
│  ├─ fetchProductDetail()  │  ├─ apiData: ProductDetailResult│
│  └─ useLayout() (shared)  │  ├─ config: DetalleConfig       │
│                           │  └─ selectedColorId             │
├─────────────────────────────────────────────────────────────┤
│                      Layout 2 Columnas                       │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐│
│  │   Columna Izquierda │  │      Columna Derecha (Sticky)   ││
│  │  ┌───────────────┐  │  │  ┌─────────────────────────────┐││
│  │  │ProductGallery │  │  │  │    PricingCalculator        │││
│  │  │ + ColorSelect │  │  │  │  (precalculated options)    │││
│  │  │ + Brand/Rating│  │  │  └─────────────────────────────┘││
│  │  └───────────────┘  │  │  ┌─────────────────────────────┐││
│  └─────────────────────┘  │  │    CTAs + Certifications    │││
│                           │  └─────────────────────────────┘││
│                           └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Secciones Full Width                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐ │
│  │DetailTabs │ │SpecsDisp. │ │PortsDisp. │ │  Cronograma  │ │
│  └───────────┘ └───────────┘ └───────────┘ └──────────────┘ │
│  ┌────────────────────────┐ ┌──────────────────────────────┐│
│  │   SimilarProducts      │ │    ProductLimitations        ││
│  │   (carousel)           │ │                              ││
│  └────────────────────────┘ └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    productDetailApi.ts                       │
│  GET /products/{slug}/detail                                 │
│  → Transforms snake_case API to camelCase frontend types     │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos

```
[landing]/producto/
├── [...]slug/
│   ├── page.tsx                   # Route handler SSR (catch-all)
│   └── ProductDetailClient.tsx    # Componente principal client
│
├── components/
│   └── detail/
│       ├── index.ts               # Barrel exports (13 componentes)
│       ├── ProductDetail.tsx      # Wrapper con layout 2 columnas
│       ├── DetalleSettingsModal.tsx
│       │
│       ├── gallery/
│       │   └── ProductGallery.tsx # Galería con zoom + info producto
│       │
│       ├── color-selector/
│       │   └── ColorSelector.tsx  # Swatches con check
│       │
│       ├── info/
│       │   └── ProductInfoHeader.tsx
│       │
│       ├── pricing/
│       │   └── PricingCalculator.tsx # Cards por plazo (precalculated)
│       │
│       ├── cronograma/
│       │   └── Cronograma.tsx     # 3 versiones (Simple, Detallado, Cards)
│       │
│       ├── specs/
│       │   └── SpecsDisplay.tsx   # Grid de cards por categoría
│       │
│       ├── tabs/
│       │   └── DetailTabs.tsx     # Descripción, Features, Software
│       │
│       ├── ports/
│       │   └── PortsDisplay.tsx   # Solo para laptops
│       │
│       ├── similar/
│       │   └── SimilarProducts.tsx # Carousel con cards estilo catálogo
│       │
│       ├── honesty/
│       │   └── ProductLimitations.tsx # Sección de transparencia
│       │
│       └── certifications/
│           └── Certifications.tsx # Badges de certificaciones
│
├── api/
│   └── productDetailApi.ts        # Fetch + transformación API→Frontend
│
├── types/
│   └── detail.ts                  # Todos los tipos del módulo
│
├── utils/
│   └── formatMoney.ts             # Formato de moneda S/
│
└── data/
    └── mockDetailData.ts          # Datos mock por deviceType
```

---

## Componentes Principales

### ProductDetailClient

**Archivo:** `[...slug]/ProductDetailClient.tsx`

Componente principal que orquesta la carga de datos y renderiza el layout.

```typescript
// Estados principales
const [apiData, setApiData] = useState<ProductDetailResult | null>(null);
const [apiError, setApiError] = useState<string | null>(null);
const [isApiLoading, setIsApiLoading] = useState(true);
const [config, setConfig] = useState<DetalleConfig>(defaultDetalleConfig);

// Flujo de carga
useEffect(() => {
  async function loadProductData() {
    const data = await fetchProductDetail(slug);
    if (data) {
      setApiData(data);
    }
    // Si no hay datos, usa mock como fallback
  }
  loadProductData();
}, [slug]);
```

### ProductDetail

**Archivo:** `components/detail/ProductDetail.tsx`

Wrapper que maneja el layout de 2 columnas y distribuye datos a subcomponentes.

```typescript
interface ProductDetailProps {
  // Data props (from API)
  product?: ProductDetailType;
  paymentPlans?: PaymentPlan[];
  similarProducts?: SimilarProduct[];
  limitations?: ProductLimitation[];
  certifications?: Certification[];

  // Config props
  deviceType?: DeviceType;
  cronogramaVersion?: CronogramaVersion;
  onAddToCart?: () => void;
  isInCart?: boolean;
}
```

### ProductGallery

**Archivo:** `components/detail/gallery/ProductGallery.tsx`

Card unificada que incluye galería de imágenes con zoom hover, info del producto y selector de color.

```typescript
interface ExtendedProductGalleryProps {
  images: ProductImage[];
  productName: string;
  // Product info
  brand?: string;
  rating?: number;
  reviewCount?: number;
  displayName?: string;
  // Color selector
  colors?: Array<{ id: string; name: string; hex: string }>;
  selectedColorId?: string;
  onColorSelect?: (colorId: string) => void;
}

// Features:
// - Zoom on hover (2x scale con transform-origin dinámico)
// - Thumbnails clickeables
// - Contador de imagen (1/5)
// - Etiqueta "Imagen referencial"
// - Brand badge + Rating + Reviews
// - ColorSelector integrado
```

### PricingCalculator

**Archivo:** `components/detail/pricing/PricingCalculator.tsx`

Cards por plazo con opciones de pago inicial precalculadas desde el backend.

```typescript
interface PricingCalculatorProps {
  paymentPlans: PaymentPlan[];  // Planes con opciones precalculadas
  defaultTerm?: number;
  productPrice?: number;
}

// Estados
const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
const [selectedInitialPercent, setSelectedInitialPercent] = useState<InitialPaymentPercentage>(0);

// Las cuotas vienen precalculadas para cada combinación:
// - 5 plazos: 12, 18, 24, 30, 36 meses
// - 4 % de inicial: 0%, 10%, 20%, 30%
// = 20 combinaciones precalculadas por producto
```

### Cronograma

**Archivo:** `components/detail/cronograma/Cronograma.tsx`

Muestra el cronograma de pagos en 3 versiones seleccionables.

```typescript
interface CronogramaProps {
  paymentPlans: PaymentPlan[];
  term?: number;
  startDate?: Date;
  version?: CronogramaVersion;  // 1 | 2 | 3
}

// Versiones:
// V1 (Simple): Tabla básica con cuota, fecha y monto
// V2 (Detallado): Incluye capital, interés y saldo restante
// V3 (Cards): Vista en tarjetas compactas
```

### SpecsDisplay

**Archivo:** `components/detail/specs/SpecsDisplay.tsx`

Grid de cards por categoría de especificaciones.

```typescript
interface SpecsProps {
  specs: ProductSpec[];
}

// Cada categoría tiene:
// - Icono dinámico (iconMap)
// - Título traducido (backend envía GROUP_NAMES)
// - Lista de specs con label/value
// - Tooltips opcionales
// - Highlight para specs destacados
```

### SimilarProducts

**Archivo:** `components/detail/similar/SimilarProducts.tsx`

Carousel horizontal con cards estilo catálogo.

```typescript
interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;       // Para comparación de precios
  isCleanMode?: boolean;
}

// Features:
// - Scroll horizontal con botones nav
// - Cards con galería de imágenes
// - Selector de colores por producto
// - Badge de match score (%)
// - Badge de diferencia de precio (+/- vs actual)
// - Tags diferenciadores
// - CTAs: Detalle / Lo quiero
```

### ProductLimitations

**Archivo:** `components/detail/honesty/ProductLimitations.tsx`

Sección de transparencia que muestra limitaciones del producto.

```typescript
interface ProductLimitationsProps {
  limitations: ProductLimitation[];
}

// Cada limitación incluye:
// - category: "Rendimiento", "Conectividad", etc.
// - description: Explicación de la limitación
// - severity: 'info' | 'warning'
// - alternative?: Solución o alternativa
// - icon: Icono de la categoría
```

---

## API y Transformación de Datos

### productDetailApi.ts

**Archivo:** `api/productDetailApi.ts`

#### Endpoint Principal

```typescript
async function fetchProductDetail(slug: string): Promise<ProductDetailResult | null>
```

**Request:**
```
GET /api/v1/products/{slug}/detail
```

**Response (API):**
```json
{
  "product": {
    "id": "32",
    "slug": "hp-pavilion-15-ryzen5",
    "name": "HP Pavilion 15",
    "display_name": "HP Pavilion 15 Ryzen 5",
    "brand": "HP",
    "category": "laptop",
    "price": "4957.00",
    "original_price": "5500.00",
    "discount": "10",
    "lowest_quota": "238.32",
    "original_quota": "264.80",
    "images": [...],
    "colors": [...],
    "specs": [
      {
        "category": "Rendimiento",
        "icon": "Cpu",
        "specs": [
          { "label": "Procesador", "value": "AMD Ryzen 5", "highlight": true }
        ]
      }
    ],
    "ports": [...],
    "software": [...],
    "features": [...],
    "badges": [...],
    "battery_life": "8 horas",
    "has_os": true,
    "os_name": "Windows 11",
    "warranty": "1 año",
    "stock": 15,
    "rating": 4.5,
    "review_count": 128
  },
  "payment_plans": [
    {
      "term": 12,
      "options": [
        { "initial_percent": 0, "initial_amount": "0.00", "monthly_quota": "495.70", "original_quota": "550.78" },
        { "initial_percent": 10, "initial_amount": "495.70", "monthly_quota": "446.13", "original_quota": null },
        { "initial_percent": 20, "initial_amount": "991.40", "monthly_quota": "396.56", "original_quota": null },
        { "initial_percent": 30, "initial_amount": "1487.10", "monthly_quota": "346.99", "original_quota": null }
      ]
    },
    // ... 4 plazos más (18, 24, 30, 36)
  ],
  "similar_products": [...],
  "limitations": [...],
  "certifications": [...]
}
```

#### Funciones de Transformación

El API client transforma snake_case a camelCase:

```typescript
// API → Frontend
function transformPaymentPlan(apiPlan: ApiPaymentPlan): PaymentPlan {
  return {
    term: apiPlan.term,
    options: apiPlan.options.map((opt): InitialPaymentOption => ({
      initialPercent: opt.initial_percent as InitialPaymentPercentage,
      initialAmount: parseFloat(opt.initial_amount),
      monthlyQuota: parseFloat(opt.monthly_quota),
      originalQuota: opt.original_quota ? parseFloat(opt.original_quota) : undefined,
    })),
  };
}

function transformProductData(apiProduct: ApiProductData): ProductDetail {
  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    displayName: apiProduct.display_name,
    price: parseFloat(apiProduct.price),
    originalPrice: apiProduct.original_price ? parseFloat(apiProduct.original_price) : undefined,
    // ... resto de transformaciones
  };
}
```

#### Resultado Final

```typescript
interface ProductDetailResult {
  product: ProductDetail;
  paymentPlans: PaymentPlan[];
  similarProducts: SimilarProduct[];
  limitations: ProductLimitation[];
  certifications: Certification[];
}
```

---

## Tipos e Interfaces

### ProductDetail

```typescript
interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  brand: string;
  category: string;

  // Precios
  price: number;
  originalPrice?: number;
  discount?: number;
  lowestQuota: number;
  originalQuota?: number;

  // Media
  images: ProductImage[];
  colors: ProductColor[];

  // Contenido
  description: string;
  shortDescription: string;
  specs: ProductSpec[];
  ports: ProductPort[];
  software: ProductSoftware[];
  features: ProductFeature[];
  badges: ProductBadge[];

  // Info adicional
  batteryLife: string;
  fastCharge?: string;
  hasOS: boolean;
  osName?: string;
  warranty: string;
  stock: number;
  rating: number;
  reviewCount: number;
}
```

### PaymentPlan (Sistema Precalculado)

```typescript
// Porcentajes de pago inicial permitidos
type InitialPaymentPercentage = 0 | 10 | 20 | 30;

// Opción de pago inicial precalculada
interface InitialPaymentOption {
  initialPercent: InitialPaymentPercentage;
  initialAmount: number;
  monthlyQuota: number;
  originalQuota?: number;  // Si hay descuento
}

// Plan de pago con todas las opciones
interface PaymentPlan {
  term: number;  // 12, 18, 24, 30, 36
  options: InitialPaymentOption[];  // 4 opciones por plazo
}
```

### ProductSpec

```typescript
interface ProductSpec {
  category: string;  // "Rendimiento", "Memoria", etc. (traducido)
  icon: string;      // "Cpu", "MemoryStick", etc.
  specs: SpecItem[];
}

interface SpecItem {
  label: string;
  value: string;     // Ya formateado (ej: "16 GB", no "16.0000")
  tooltip?: string;
  highlight?: boolean;
}
```

### SimilarProduct

```typescript
interface SimilarProduct {
  id: string;
  name: string;
  brand: string;
  thumbnail: string;
  images?: string[];
  colors?: SimilarProductColor[];
  monthlyQuota: number;
  quotaDifference: number;  // vs producto actual
  matchScore: number;       // % de similitud
  differentiators: string[];
  slug: string;
  specs?: {
    processor: string;
    ram: string;
    storage: string;
    display: string;
  };
}
```

### DetalleConfig

```typescript
type DeviceType = 'laptop' | 'tablet' | 'celular';
type CronogramaVersion = 1 | 2 | 3;

interface DetalleConfig {
  deviceType: DeviceType;
  cronogramaVersion: CronogramaVersion;
}

const defaultDetalleConfig: DetalleConfig = {
  deviceType: 'laptop',
  cronogramaVersion: 2,
};
```

---

## Configuración y Variantes

### Variantes Fijas

| Componente | Descripción |
|------------|-------------|
| ProductGallery | Card unificada con zoom, info y color selector |
| PricingCalculator | Cards por plazo con opciones precalculadas |
| SpecsDisplay | Grid 2 columnas de cards por categoría |
| PortsDisplay | Visualización de puertos (solo laptops) |
| SimilarProducts | Carousel horizontal con cards estilo catálogo |

### Variantes Iterables

| Componente | Valores | Descripción |
|------------|---------|-------------|
| Cronograma | `1 \| 2 \| 3` | Simple, Detallado, Cards |
| DeviceType | `laptop \| tablet \| celular` | Afecta mock data y PortsDisplay |

### Cronograma Versions

```typescript
const cronogramaVersionLabels: Record<CronogramaVersion, { name: string; description: string }> = {
  1: {
    name: 'Simple',
    description: 'Tabla básica con cuota, fecha y monto',
  },
  2: {
    name: 'Detallado',
    description: 'Incluye capital, interés y saldo restante',
  },
  3: {
    name: 'Cards',
    description: 'Vista en tarjetas compactas',
  },
};
```

---

## Sistema de Pagos Precalculados

### Arquitectura

El sistema de cálculo de cuotas usa datos **precalculados en el backend** para evitar cálculos en frontend y garantizar consistencia.

```
┌─────────────────────────────────────────────────────┐
│                    BACKEND                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  Cálculo Amortización Francesa                 │  │
│  │  ─────────────────────────────────────────── │  │
│  │  Para cada producto, genera:                  │  │
│  │  5 plazos × 4 % inicial = 20 combinaciones   │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  payment_plans: [                              │  │
│  │    { term: 12, options: [0%, 10%, 20%, 30%] }, │  │
│  │    { term: 18, options: [...] },               │  │
│  │    { term: 24, options: [...] },               │  │
│  │    { term: 30, options: [...] },               │  │
│  │    { term: 36, options: [...] },               │  │
│  │  ]                                             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  PricingCalculator                             │  │
│  │  ─────────────────────────────────────────── │  │
│  │  1. Usuario selecciona % inicial              │  │
│  │  2. Usuario selecciona plazo                  │  │
│  │  3. Busca en paymentPlans la opción           │  │
│  │  4. Muestra cuota precalculada                │  │
│  │                                                │  │
│  │  NO HAY CÁLCULO EN FRONTEND                   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Fórmula Backend (Amortización Francesa)

```python
def calculate_quota(price: Decimal, term: int, initial_percent: int, monthly_rate: Decimal) -> Decimal:
    """
    Calcula cuota mensual usando amortización francesa.

    Args:
        price: Precio del producto
        term: Número de meses
        initial_percent: Porcentaje de inicial (0, 10, 20, 30)
        monthly_rate: Tasa mensual (ej: 0.04 = 4%)
    """
    initial_amount = price * (initial_percent / 100)
    financed_amount = price - initial_amount

    # Fórmula cuota fija: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    r = monthly_rate
    n = term
    quota = financed_amount * (r * (1 + r) ** n) / ((1 + r) ** n - 1)

    return quota.quantize(Decimal('0.01'))
```

### Uso en Frontend

```typescript
// PricingCalculator.tsx

// Obtener opción seleccionada (sin cálculo)
const getOptionForTerm = (term: number): InitialPaymentOption | null => {
  const plan = paymentPlans.find(p => p.term === term);
  if (!plan?.options) return null;
  return plan.options.find(opt => opt.initialPercent === selectedInitialPercent) || plan.options[0];
};

// Renderizar cuota
<p className="text-xl font-bold">
  S/{formatMoney(option.monthlyQuota)}
</p>
```

### Dependencias de Seeders (Backend)

Los datos de productos se generan mediante seeders en el backend. El orden de ejecución es **crítico**:

1. **MassiveCatalogSeeder necesita el landing "home"** para asociar productos
2. **FinancingTermsSeeder debe ejecutarse DESPUÉS** de todos los productos

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDEN CORRECTO DE SEEDERS (webservice2/scripts/seeders/)       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ══════════════════ MÓDULO: products ═══════════════════════    │
│                                                                  │
│  1. BrandsSeeder          → Marcas                              │
│  2. CategoriesSeeder      → Categorías                          │
│  3. SpecsSeeder           → Definiciones de specs               │
│  4. LabelsSeeder          → Etiquetas                           │
│  5. ProductsSeeder        → Productos base (IDs 1-30)           │
│  6. VariantsSeeder        → Variantes de productos base         │
│  7. ProductImagesSeeder   → Imágenes de productos base          │
│  8. CombosSeeder          → Combos (solo productos específicos) │
│                                                                  │
│  ══════════════════ MÓDULO: landing ════════════════════════    │
│                                                                  │
│  9. LandingTemplatesSeeder → Templates de landing               │
│ 10. LandingsSeeder         → Landing "home" (DEBE existir)      │
│                                                                  │
│  ─────── MassiveCatalogSeeder NECESITA landing "home" ──────    │
│                                                                  │
│ 11. MassiveCatalogSeeder   → 118 productos MASS-* + asociación  │
│                               a landing "home" via LandingProduct│
│                                                                  │
│  ─────────── DESPUÉS de MassiveCatalogSeeder ───────────────    │
│                                                                  │
│ 12. AccessoriesSeeder      → Compatibilidad accesorios (ALL)    │
│ 13. FillSpecsSeeder        → Specs para productos sin ellos     │
│ 14. FillLabelsSeeder       → Labels para productos sin ellos    │
│ 15. FillGamasSeeder        → Gamas para productos sin ellas     │
│ 16. FillUsagesSeeder       → Usos para productos sin ellos      │
│ 17. ProductSoftwareSeeder  → Software (productos base)          │
│ 18. ProductFeatureSeeder   → Features (productos base)          │
│ 19. ProductLimitationSeeder→ Limitaciones (productos base)      │
│ 20. ProductRelationSeeder  → Relaciones (productos base)        │
│ 21. ProductDetailFieldsSeeder                                   │
│ 22. ProductPortSeeder                                           │
│ 23. ProductCertificationSeeder                                  │
│ 24. MassiveDetailSeeder    → Software, features, limitaciones   │
│                              para MASS-*                        │
│ 25. FinancingTermsSeeder   → Planes de pago para TODOS          │
│                                                                  │
│  ─────────── Resto de seeders de landing ───────────────────    │
│                                                                  │
│ 26. LandingProductsSeeder  → Asociaciones adicionales           │
│ 27. LandingFeaturesSeeder  → Features por landing               │
│ ... etc                                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Dependencias Críticas

| Dependencia | Si no se cumple | Error visible |
|-------------|-----------------|---------------|
| `LandingsSeeder` → `MassiveCatalogSeeder` | Productos MASS-* no asociados a landing | Catálogo vacío (0 productos) |
| `MassiveCatalogSeeder` → `FinancingTermsSeeder` | MASS-* sin planes de pago | S/0/mes en calculadora |

#### Seeders Críticos para payment_plans

| Seeder | Crea | Afecta a |
|--------|------|----------|
| `FinancingTerm` | Plazos (3,6,12,18,24,36,48 meses) | Todos los productos |
| `ProductTermAvailability` | Qué plazos tiene cada producto | Cada producto |
| `ProductInitialOption` | Opciones de % inicial | Cada producto |

**IMPORTANTE:**
- Si `LandingsSeeder` no se ejecuta ANTES de `MassiveCatalogSeeder`, el catálogo estará **vacío** (productos no asociados al landing "home")
- Si `FinancingTermsSeeder` se ejecuta ANTES de `MassiveCatalogSeeder`, los productos MASS-* mostrarán **S/0/mes**

#### Comando para Regenerar Datos

```bash
# Reset completo (DROP + CREATE + SEED)
docker-compose exec api python -m scripts.seeders.runner --reset

# Solo módulo products (fresh = clear + seed)
docker-compose exec api python -m scripts.seeders.runner --module products --fresh
```

---

## Formato de Moneda y Redondeos

### Funciones Disponibles

**Archivo:** `utils/formatMoney.ts`

```typescript
// Con decimales (solo si el número tiene decimales significativos)
// 3204 → "3,204", 180.50 → "180.50", 2484.99 → "2,484.99"
export const formatMoney = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

// Sin decimales (redondeado)
// 3204.99 → "3,205", 180.50 → "181"
export const formatMoneyNoDecimals = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
```

### Uso por Componente

| Componente | Función | Ejemplo |
|------------|---------|---------|
| **PricingCalculator** | `formatMoney` | S/238.32 (precisión en cuotas) |
| **SimilarProducts** | `formatMoneyNoDecimals` | S/238 (simplicidad visual) |
| **Cronograma** | `formatMoney` | S/238.32 (detalle financiero) |

### Reglas de Redondeo

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUOTA PRINCIPAL                               │
│  PricingCalculator: Usa formatMoney (con decimales)             │
│  → El usuario ve el monto exacto que pagará                     │
│  → Ejemplo: S/238.32/mes                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                TAMBIÉN TE PUEDE INTERESAR                        │
│  SimilarProducts: Usa formatMoneyNoDecimals (sin decimales)     │
│  → Comparación rápida entre productos                           │
│  → Ejemplo: S/238/mes, +S/56, vs S/133/mes actual               │
└─────────────────────────────────────────────────────────────────┘
```

### Justificación

- **PricingCalculator**: Muestra el monto **exacto** porque es el valor que el cliente pagará. Precisión es importante para transparencia financiera.

- **SimilarProducts**: Muestra montos **redondeados** porque es una comparación visual rápida. Los decimales añaden ruido visual innecesario cuando el objetivo es comparar magnitudes.

---

## Política de Datos: Solo API (Sin Mock Fallback)

### Principio

Tanto el **catálogo** como el **detalle de producto** v0.6 **NO usan datos mock como fallback**. Todos los datos deben venir de la API. Si hay un error o no hay datos, se muestra un mensaje de error claro.

### Justificación

1. **Detectar errores temprano**: Si los seeders no funcionan correctamente, el error debe ser visible inmediatamente
2. **Datos consistentes**: No mezclar datos mock con datos reales que podrían tener estructuras diferentes
3. **Debugging más fácil**: Saber exactamente de dónde vienen los datos

### Comportamiento - Catálogo

```
┌─────────────────────────────────────────────────────────────────┐
│                FLUJO DE CARGA - CATÁLOGO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CatalogoClient monta                                        │
│     └─> useCatalogProducts({ landingSlug })                     │
│         └─> fetchCatalogData(landingSlug, { limit, offset })    │
│                                                                  │
│  2. API responde:                                               │
│     ├─> 200 + productos → Renderiza grid de productos          │
│     ├─> 200 + vacío     → Muestra página de error              │
│     └─> Error           → Muestra página de error con mensaje  │
│                                                                  │
│  3. Página de error incluye:                                    │
│     ├─> Icono de error (AlertCircle)                           │
│     ├─> Mensaje: "Catálogo no disponible"                      │
│     └─> Botón: "Volver al inicio"                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Comportamiento - Detalle de Producto

```
┌─────────────────────────────────────────────────────────────────┐
│                FLUJO DE CARGA - DETALLE PRODUCTO                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ProductDetailClient monta                                   │
│     └─> fetchProductDetail(slug)                                │
│                                                                  │
│  2. API responde:                                               │
│     ├─> 200 + datos → Renderiza ProductDetail                   │
│     ├─> 404 / null  → Muestra página de error                  │
│     └─> Error       → Muestra página de error con mensaje      │
│                                                                  │
│  3. Página de error incluye:                                    │
│     ├─> Icono de error (AlertCircle)                           │
│     ├─> Mensaje: "Producto no disponible"                       │
│     ├─> Slug del producto solicitado                           │
│     └─> Botón: "Ver catálogo de productos"                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Archivos Relevantes

| Archivo | Responsabilidad |
|---------|-----------------|
| `CatalogoClient.tsx` | Catálogo: manejo de errores, renderizado condicional |
| `useCatalogProducts.ts` | Hook: fetch de API sin fallback a mock |
| `ProductDetailClient.tsx` | Detalle: fetch de API, manejo de errores |
| `ProductDetail.tsx` | Componente de presentación (requiere datos) |
| `productDetailApi.ts` | Llamada a API y transformación de datos |

### Props Requeridos en ProductDetail

```typescript
interface ProductDetailProps {
  // REQUERIDOS - sin estos no renderiza
  product: ProductDetailType;
  paymentPlans: PaymentPlan[];

  // Opcionales - tienen defaults vacíos
  similarProducts?: SimilarProduct[];
  limitations?: ProductLimitation[];
  certifications?: Certification[];
}
```

### Qué Hacer Si Ves "Producto no disponible"

1. **Verificar que el producto existe en la BD**:
   ```bash
   docker-compose exec api python -c "
   from app.db.database import SessionLocal
   from app.db.models import Product
   db = SessionLocal()
   p = db.query(Product).filter(Product.slug == 'tu-slug-aqui').first()
   print(p.name if p else 'NO EXISTE')
   "
   ```

2. **Verificar que los seeders se ejecutaron correctamente**:
   ```bash
   docker-compose exec api python -m scripts.seeders.runner --list
   ```

3. **Re-ejecutar seeders si es necesario**:
   ```bash
   docker-compose exec api python -m scripts.seeders.runner --reset
   ```

### Productos de Ejemplo Válidos

Después de ejecutar los seeders, estos productos deberían existir:

```
# Productos base (ProductsSeeder)
/prototipos/0.6/home/producto/hp-pavilion-15-ryzen5
/prototipos/0.6/home/producto/thinkpad-x1-carbon-gen11
/prototipos/0.6/home/producto/dell-inspiron-14-i5

# Productos masivos (MassiveCatalogSeeder)
/prototipos/0.6/home/producto/lenovo-laptop-1
/prototipos/0.6/home/producto/hp-laptop-2
/prototipos/0.6/home/producto/samsung-celular-1
```

---

## Sistema de Imágenes y Colores

### Arquitectura de Datos

Las imágenes pertenecen a **VARIANTES**, no al producto directamente:

```
┌─────────────────────────────────────────────────────────────┐
│  Product (1)                                                │
│  └─ ProductVariant (M)         ← Cada variante = un color  │
│     ├─ color: "Plata"                                      │
│     ├─ color_hex: "#C0C0C0"                               │
│     └─ VariantImage (M)        ← Imágenes de esa variante │
│        ├─ url: "https://..."                              │
│        ├─ type: "main" | "gallery" | "thumbnail"          │
│        └─ is_primary: true/false                          │
└─────────────────────────────────────────────────────────────┘
```

### Modelos Backend (webservice2)

**Archivo:** `app/db/models/products.py`

```python
class ProductVariant(ActiveBaseModel):
    product_id: int           # FK a Product
    color: str | None         # "Plata", "Negro", "Azul"
    color_hex: str | None     # "#C0C0C0", "#1a1a1a"
    storage_gb: int | None    # 256, 512
    images: List[VariantImage]  # Relación

class VariantImage(ActiveBaseModel):
    variant_id: int           # FK a ProductVariant
    url: str                  # URL de la imagen
    type: ImageType           # ENUM: main, gallery, thumbnail
    is_primary: bool          # Imagen principal de la variante
```

### Tipos Frontend

**Archivo:** `types/detail.ts`

```typescript
interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'gallery' | 'detail';
}

interface ProductColor {
  id: string;      // "variant-{id}"
  name: string;    // "Plata"
  hex: string;     // "#C0C0C0"
}
```

### Flujo de Datos

```
┌──────────────────────────────────────────────────────────────┐
│  1. API (detail.py)                                          │
│     Itera sobre TODAS las variantes y agrega:                │
│     - images[] ← todas las imágenes de todas las variantes   │
│     - colors[] ← todos los colores de las variantes          │
├──────────────────────────────────────────────────────────────┤
│  2. Frontend (productDetailApi.ts)                           │
│     Transforma snake_case → camelCase                        │
│     Retorna: { images: ProductImage[], colors: ProductColor[] } │
├──────────────────────────────────────────────────────────────┤
│  3. ProductDetail.tsx                                        │
│     const [selectedColorId, setSelectedColorId] = useState() │
│     <ProductGallery images={images} colors={colors}          │
│       selectedColorId={selectedColorId}                      │
│       onColorSelect={setSelectedColorId} />                  │
├──────────────────────────────────────────────────────────────┤
│  4. ProductGallery.tsx                                       │
│     Muestra imagen principal + thumbnails                    │
│     ColorSelector para cambiar color                         │
└──────────────────────────────────────────────────────────────┘
```

### Seeders de Colores

**Archivo:** `scripts/seeders/products/massive_catalog.py`

```python
COLOR_OPTIONS = [
    [{"name": "Plata", "hex": "#C0C0C0"}, {"name": "Negro", "hex": "#1a1a1a"}],
    [{"name": "Azul", "hex": "#4654CD"}, {"name": "Dorado", "hex": "#FFD700"}],
    [{"name": "Blanco", "hex": "#FFFFFF"}, {"name": "Rosa", "hex": "#FFC0CB"}],
]
# Se asignan rotando: product_id % len(COLOR_OPTIONS)
```

### Archivos Clave

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Modelo | `products.py` | `ProductVariant`, `VariantImage` |
| Seeder | `massive_catalog.py` | Crea variantes con colores |
| Seeder | `images.py` | Agrega imágenes a variantes |
| API | `detail.py` | Retorna `images[]` y `colors[]` |
| Transform | `productDetailApi.ts` | snake_case → camelCase |
| Componente | `ProductGallery.tsx` | Galería + ColorSelector |
| Componente | `ColorSelector.tsx` | Swatches de colores |

---

## Parámetros URL

### Configuración

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `device` | DeviceType | `device=laptop` | Tipo de dispositivo (mock data) |
| `cronograma` | 1-3 | `cronograma=2` | Versión del cronograma |
| `mode` | string | `mode=clean` | Modo limpio (sin elementos extra) |

### Ejemplo URL Completa

```
/prototipos/0.6/home/producto/hp-pavilion-15-ryzen5?device=laptop&cronograma=2
```

---

## Flujos de Datos

### Carga Inicial

```
1. page.tsx (SSR)
   └─> Renderiza ProductDetailClient

2. ProductDetailClient monta
   ├─> useLayout() obtiene datos de landing (colores, navbar, footer)
   └─> Inicia fetchProductDetail(slug)

3. fetchProductDetail()
   ├─> GET /products/{slug}/detail
   ├─> Transforma API response → ProductDetailResult
   └─> Retorna { product, paymentPlans, similarProducts, limitations, certifications }

4. Render ProductDetail
   └─> Distribuye datos a subcomponentes

5. Si API falla
   └─> Usa mock data como fallback (getProductByDeviceType)
```

### Selección de Plan de Pago

```
1. Usuario selecciona % inicial (botones)
   └─> setSelectedInitialPercent(10)

2. Usuario selecciona plazo (cards)
   └─> setSelectedTerm(24)

3. getOptionForTerm(24) busca en paymentPlans
   └─> Encuentra { initialPercent: 10, initialAmount: 495.70, monthlyQuota: 446.13 }

4. UI se actualiza con cuota precalculada
   └─> Muestra "S/446.13/mes"
```

### Navegación a Producto Similar

```
1. Usuario click en "Detalle" de SimilarProduct
   └─> handleProductClick(slug)

2. Extrae landing actual de pathname
   └─> /prototipos/0.6/home/producto/... → landing = "home"

3. Navega a nuevo producto
   └─> window.location.href = `/prototipos/0.6/${landing}/producto/${slug}`

4. Nueva página carga
   └─> ProductDetailClient con nuevo slug
```

---

## Cómo Extender

### Agregar Nueva Sección

1. **Crear componente** (`components/detail/nueva-seccion/NuevaSeccion.tsx`)

2. **Exportar en index.ts**:
```typescript
export { NuevaSeccion } from './nueva-seccion/NuevaSeccion';
```

3. **Agregar tipos** si es necesario (`types/detail.ts`)

4. **Agregar datos al API** (backend)

5. **Agregar transformación** (`api/productDetailApi.ts`)

6. **Renderizar en ProductDetail.tsx**:
```typescript
<div id="section-nueva" className="mt-12">
  <NuevaSeccion data={nuevaData} />
</div>
```

### Agregar Nueva Versión de Cronograma

1. **Agregar versión al tipo** (`types/detail.ts`):
```typescript
type CronogramaVersion = 1 | 2 | 3 | 4;

const cronogramaVersionLabels: Record<CronogramaVersion, {...}> = {
  // ... existing
  4: {
    name: 'Timeline',
    description: 'Vista en línea de tiempo interactiva',
  },
};
```

2. **Agregar case en Cronograma.tsx**:
```typescript
const renderVersion4 = () => (
  <div className="...">
    {/* Nueva implementación */}
  </div>
);

// En render
{version === 4 && renderVersion4()}
```

### Agregar Nuevo Porcentaje de Inicial

**Requiere cambios en backend y frontend:**

1. **Backend**: Agregar nuevo porcentaje en generación de payment_plans

2. **Frontend tipos** (`types/detail.ts`):
```typescript
type InitialPaymentPercentage = 0 | 10 | 20 | 30 | 40;
```

3. **Frontend UI** (`PricingCalculator.tsx`): Se ajusta automáticamente ya que lee de `paymentPlans`

### Agregar Badge Nuevo

1. **Agregar tipo de badge** (`types/detail.ts`):
```typescript
interface ProductBadge {
  type: 'os' | 'battery' | 'stock' | 'promo' | 'new' | 'envio-gratis';
  // ...
}
```

2. **Backend**: Agregar lógica para generar el badge

3. **Frontend renderiza automáticamente** según los datos

---

## Convenciones de Nombres de Producto

### Formato Estándar (Compatible con 0.5)

Los nombres de productos deben seguir el mismo formato que el catálogo 0.5:

```
{Tipo} {Marca} {Tamaño}" - {Procesador}
```

**Ejemplos:**
- `"Laptop Lenovo 15.6" - Core i3-1215U"`
- `"Tablet Samsung 11" - Snapdragon 8 Gen 2"`
- `"Celular Samsung 6.4" - Exynos 1380"`

### Campos de Nombre

| Campo | Contenido | Uso |
|-------|-----------|-----|
| `name` | Nombre corto | Badges, vistas compactas |
| `displayName` | Nombre completo | UI principal, galería, cards |

**Backend (detail.py):**
```python
product_data = ProductDetailData(
    name=product.short_name or product.name,     # Nombre corto
    display_name=product.name,                    # Nombre completo
    # ...
)
```

**Frontend usa `displayName`** para mostrar el nombre en:
- ProductGallery (título principal)
- ProductCard (catálogo)
- SimilarProducts (carousel)

### Seeder (massive_catalog.py)

```python
# Laptops
"name": f"Laptop {brand.name} {display_size}\" - {processor}",
"short_name": f"{brand.name} {display_size}\"",

# Celulares
"name": f"Celular {brand.name} {display_size}\" - {processor}",
"short_name": f"{brand.name} {display_size}\"",

# Tablets
"name": f"Tablet {brand.name} {display_size}\" - {processor}",
"short_name": f"{brand.name} {display_size}\"",
```

---

## Sistema de Imágenes por Color

### Arquitectura

Cada color/variante tiene sus propias imágenes:

```
Product
└── Variant (Medianoche)
│   ├── Image 1 (main)
│   ├── Image 2 (gallery)
│   ├── Image 3 (gallery)
│   └── Image 4 (gallery)
└── Variant (Luz Estelar)
    ├── Image 1 (main) ← Diferente URL
    ├── Image 2 (gallery)
    ├── Image 3 (gallery)
    └── Image 4 (gallery)
```

### Filtrado en Frontend

**Archivo:** `ProductGallery.tsx`

```typescript
// Extraer variant_id del selectedColorId (formato "variant-{id}")
const selectedVariantId = useMemo(() => {
  if (!selectedColorId) return null;
  const match = selectedColorId.match(/variant-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}, [selectedColorId]);

// Filtrar imágenes por variante seleccionada
const filteredImages = useMemo(() => {
  if (!selectedVariantId) return images;
  const variantImages = images.filter(img => img.variantId === selectedVariantId);
  return variantImages.length > 0 ? variantImages : images; // Fallback si no hay
}, [images, selectedVariantId]);

// Reset a primera imagen cuando cambia el color
useEffect(() => {
  setSelectedImage(0);
}, [selectedColorId]);
```

### Seeder de Imágenes por Variante

**Archivo:** `massive_catalog.py`

```python
# Cada variante/color recibe imágenes diferentes
for idx, color in enumerate(colors):
    variant = ProductVariant(...)

    # Offset de imágenes por variante (cada color usa URLs diferentes)
    variant_image_offset = idx * 2
    main_image_index = (image_index + variant_image_offset) % image_count

    # Main image
    VariantImage(variant_id=variant.id, url=get_url(main_image_index), ...)

    # Gallery images (3 adicionales)
    for img_idx in range(1, 4):
        gallery_index = (main_image_index + img_idx) % image_count
        VariantImage(variant_id=variant.id, url=get_url(gallery_index), ...)
```

### Verificar Funcionamiento

```bash
# Ver imágenes por color
curl -s "http://localhost:8001/api/v1/products/{slug}/detail" | python3 -c "
import sys, json
from collections import defaultdict
d = json.load(sys.stdin)

by_variant = defaultdict(list)
for img in d['product']['images']:
    by_variant[img.get('variant_id')].append(img['url'])

for vid, urls in by_variant.items():
    print(f'variant_id={vid}: {len(urls)} imágenes')
"
```

---

## Sistema de Iconos de Especificaciones

### Mapeo de Iconos

El API devuelve nombres de iconos en **minúsculas** (`cpu`, `memory`, `storage`).
El frontend mapea estos nombres a componentes de **Lucide React**.

**Archivo:** `SpecsDisplay.tsx`

```typescript
import {
  Cpu, MemoryStick, HardDrive, Monitor, Battery,
  Wifi, Scale, Camera, Shield, Smartphone, Fingerprint, Gauge, Zap,
  HelpCircle
} from 'lucide-react';

// Map API icon names (lowercase) to Lucide components
const iconMap: Record<string, React.ElementType> = {
  // Lowercase keys from API
  cpu: Cpu,
  memory: MemoryStick,
  storage: HardDrive,
  monitor: Monitor,
  battery: Battery,
  wifi: Wifi,
  scale: Scale,
  camera: Camera,
  shield: Shield,
  smartphone: Smartphone,
  fingerprint: Fingerprint,
  gauge: Gauge,
  zap: Zap,
  // Fallback
  HelpCircle,
};

// Uso
const IconComponent = iconMap[specCategory.icon] || HelpCircle;
```

### Agregar Nuevo Icono

1. **Backend**: Asignar `icon` en `SpecDefinition` o `GROUP_NAMES`
2. **Frontend**: Agregar mapeo en `iconMap`

```typescript
// 1. Importar de lucide-react
import { Thermometer } from 'lucide-react';

// 2. Agregar al mapa
const iconMap = {
  // ...existing
  temperature: Thermometer,
};
```

---

## Bugs Conocidos y Soluciones

### Rating 0 muestra "0" en lugar de ocultarse

**Problema:** En JSX, `{rating && ...}` con `rating=0` renderiza "0" porque 0 es falsy.

**Solución:**
```typescript
// ❌ Incorrecto
{rating && <Star />}

// ✅ Correcto
{rating !== undefined && rating > 0 && <Star />}
```

**Archivo afectado:** `ProductGallery.tsx`

### Imágenes no cambian al seleccionar color

**Causa:** Las imágenes no tenían `variant_id` o todas tenían el mismo.

**Solución:**
1. Backend: Incluir `variant_id` en cada imagen
2. Seeder: Crear imágenes para TODAS las variantes, no solo la primera
3. Frontend: Filtrar `images.filter(img => img.variantId === selectedVariantId)`

### Specs muestran icono de interrogación

**Causa:** El `iconMap` tenía keys en PascalCase (`Cpu`) pero el API envía minúsculas (`cpu`).

**Solución:** Agregar mapeo con keys en minúsculas que coincidan con el API.
