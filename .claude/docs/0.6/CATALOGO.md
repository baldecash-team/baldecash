# Catálogo v0.6 - Documentación Técnica

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Componentes Principales](#componentes-principales)
4. [Hooks](#hooks)
5. [Servicios y API](#servicios-y-api)
6. [Tipos e Interfaces](#tipos-e-interfaces)
7. [Configuración y Variantes](#configuración-y-variantes)
8. [Parámetros URL](#parámetros-url)
9. [Persistencia (localStorage)](#persistencia-localstorage)
10. [Flujos de Datos](#flujos-de-datos)
11. [Sistema de Imágenes por Color (Carousel)](#sistema-de-imágenes-por-color-carousel)
12. [Cómo Extender](#cómo-extender)

---

## Arquitectura General

El catálogo v0.6 sigue una arquitectura basada en componentes con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                     CatalogoClient.tsx                       │
│                    (Orquestador Principal)                   │
├─────────────────────────────────────────────────────────────┤
│  Hooks                    │  State                          │
│  ├─ useCatalogProducts    │  ├─ filters: FilterState        │
│  ├─ useCatalogFilters     │  ├─ sort: SortOption            │
│  ├─ useCatalogSharedState │  ├─ config: CatalogLayoutConfig │
│  └─ useOnboarding         │  └─ UI states (drawers, modals) │
├─────────────────────────────────────────────────────────────┤
│                      Componentes UI                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Navbar    │ │  Filters    │ │     CatalogLayout       ││
│  │  Secondary  │ │   Panel     │ │  ┌─────────────────────┐││
│  └─────────────┘ └─────────────┘ │  │    ProductCard      │││
│  ┌─────────────┐ ┌─────────────┐ │  │    (grid items)     │││
│  │  Drawers    │ │  Modals     │ │  └─────────────────────┘││
│  │ Cart/Wish/  │ │ Compare/    │ └─────────────────────────┘│
│  │ Search/Quiz │ │ Settings    │                            │
│  └─────────────┘ └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      catalogApi.ts                           │
│  GET /catalog/{landing}/products                             │
│  GET /catalog/{landing}/filters                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos

```
[landing]/catalogo/
├── CatalogoClient.tsx              # Componente principal (1593 líneas)
├── page.tsx                        # Route handler SSR
│
├── components/
│   ├── catalog/
│   │   ├── index.ts                # Barrel exports
│   │   │
│   │   ├── cards/
│   │   │   ├── ProductCard.tsx     # Tarjeta de producto
│   │   │   └── index.ts
│   │   │
│   │   ├── color-selector/
│   │   │   └── ColorSelector.tsx   # V1 Dots, V2 Swatches
│   │   │
│   │   ├── filters/
│   │   │   ├── brand/
│   │   │   │   └── BrandFilter.tsx # Filtro de marcas (V1-V3)
│   │   │   ├── CommercialFilters.tsx
│   │   │   ├── FilterChips.tsx     # Pills de filtros activos
│   │   │   ├── FilterSection.tsx   # Wrapper collapsible
│   │   │   ├── PriceRangeFilter.tsx
│   │   │   ├── QuotaRangeFilter.tsx
│   │   │   ├── TagsFilter.tsx
│   │   │   ├── TechnicalFilters.tsx
│   │   │   └── UsageFilter.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── CatalogLayoutV1.tsx # Grid básico
│   │   │   ├── CatalogLayoutV2.tsx # Con sidebar
│   │   │   ├── CatalogLayoutV3.tsx # Masonry
│   │   │   ├── CatalogLayoutV4.tsx # FIJO en v0.6
│   │   │   ├── CatalogLayoutV5.tsx # Horizontal scroll
│   │   │   ├── CatalogLayoutV6.tsx # Cards grandes
│   │   │   └── index.ts
│   │   │
│   │   ├── sorting/
│   │   │   └── SortDropdown.tsx
│   │   │
│   │   ├── CatalogLayout.tsx       # Selector de variante
│   │   ├── CatalogSecondaryNavbar.tsx
│   │   ├── CatalogoSettingsModal.tsx
│   │   ├── FloatingFilterPanel.tsx # Mobile filters
│   │   ├── ImageGallery.tsx
│   │   ├── LoadMoreButton.tsx
│   │   ├── NavbarActions.tsx
│   │   ├── ProductCardSkeleton.tsx
│   │   ├── ProductTags.tsx
│   │   ├── QuickUsageCards.tsx
│   │   ├── QuizReminderPopup.tsx
│   │   ├── ResumeFinancingCard.tsx
│   │   ├── SearchDrawer.tsx
│   │   ├── CartBar.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CartSelectionModal.tsx
│   │
│   ├── comparator/
│   │   ├── ProductComparator.tsx   # Modal principal
│   │   ├── ComparatorSettingsModal.tsx
│   │   ├── ProductSelector.tsx
│   │   ├── ComparatorV1.tsx
│   │   ├── ComparatorV2.tsx
│   │   ├── DesignStyleA.tsx
│   │   ├── DesignStyleB.tsx
│   │   ├── DesignStyleC.tsx
│   │   └── index.ts
│   │
│   ├── empty/
│   │   ├── EmptyState.tsx
│   │   ├── actions/
│   │   ├── illustration/
│   │   └── index.ts
│   │
│   ├── onboarding/
│   │   ├── OnboardingTour.tsx
│   │   ├── OnboardingWelcomeModal.tsx
│   │   └── index.ts
│   │
│   ├── webchat/
│   │   ├── WebchatDrawer.tsx
│   │   └── index.ts
│   │
│   └── wishlist/
│       ├── WishlistDrawer.tsx
│       └── index.ts
│
├── hooks/
│   ├── useCatalogProducts.ts       # Carga productos + paginación
│   ├── useCatalogFilters.ts        # Filtros dinámicos
│   ├── useCatalogSharedState.ts    # Wishlist, Cart, Compare
│   ├── useCatalogKeyboardShortcuts.ts
│   └── useOnboarding.ts
│
├── types/
│   ├── catalog.ts                  # Tipos principales
│   ├── comparator.ts
│   └── empty.ts
│
├── utils/
│   ├── formatMoney.ts
│   └── queryFilters.ts             # URL <-> FilterState
│
└── data/
    └── mockCatalogData.ts          # Datos mock
```

---

## Componentes Principales

### CatalogoClient

**Archivo:** `CatalogoClient.tsx` (1593 líneas)

Componente orquestador que maneja todo el estado y renderiza el catálogo.

```typescript
// Props
interface CatalogoClientProps {
  initialProducts?: CatalogProduct[];
  landingSlug: string;
}

// Estado principal
const [filters, setFilters] = useState<FilterState>(defaultFilters);
const [sort, setSort] = useState<SortOption>('recommended');
const [config, setConfig] = useState<CatalogLayoutConfig>(defaultConfig);

// Estados UI
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [isCartOpen, setIsCartOpen] = useState(false);
const [isWishlistOpen, setIsWishlistOpen] = useState(false);
const [isCompareOpen, setIsCompareOpen] = useState(false);
const [isQuizOpen, setIsQuizOpen] = useState(false);
```

### ProductCard

**Archivo:** `components/catalog/cards/ProductCard.tsx`

Tarjeta individual de producto con galería de imágenes y selector de color.

```typescript
interface ProductCardProps {
  product: CatalogProduct;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  onAddToCompare: (productId: string) => void;
  isInCart: boolean;
  isInWishlist: boolean;
  isInCompare: boolean;
  colorSelectorVersion?: 1 | 2;
}
```

### CatalogLayout

**Archivo:** `components/catalog/CatalogLayout.tsx`

Selector que renderiza la variante de layout correspondiente.

```typescript
interface CatalogLayoutProps {
  products: CatalogProduct[];
  version: 1 | 2 | 3 | 4 | 5 | 6;
  // ... props del ProductCard
}

// En v0.6, version está FIJO en 4
```

### CatalogSecondaryNavbar

**Archivo:** `components/catalog/CatalogSecondaryNavbar.tsx`

Navbar secundario con búsqueda, wishlist y carrito.

```typescript
interface CatalogSecondaryNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchOpen: () => void;
  wishlistCount: number;
  cartCount: number;
  onWishlistClick: () => void;
  onCartClick: () => void;
}
```

---

## Hooks

### useCatalogProducts

**Archivo:** `hooks/useCatalogProducts.ts`

Carga productos desde el API con paginación.

```typescript
function useCatalogProducts(
  landingSlug: string,
  filters: FilterState,
  sort: SortOption,
  options?: { useMock?: boolean }
) {
  return {
    products: CatalogProduct[],
    isLoading: boolean,
    error: Error | null,
    hasMore: boolean,
    loadMore: () => void,
    total: number,
  };
}
```

### useCatalogFilters

**Archivo:** `hooks/useCatalogFilters.ts`

Carga filtros dinámicos con conteos contextuales.

```typescript
function useCatalogFilters(
  landingSlug: string,
  appliedFilters: FilterState
) {
  return {
    filters: CatalogFiltersResponse,
    isLoading: boolean,
    error: Error | null,
  };
}
```

### useCatalogSharedState

**Archivo:** `hooks/useCatalogSharedState.ts`

Gestiona wishlist, carrito y comparador con persistencia en localStorage.

```typescript
function useCatalogSharedState() {
  return {
    // Wishlist
    wishlist: string[],
    addToWishlist: (id: string) => void,
    removeFromWishlist: (id: string) => void,
    isInWishlist: (id: string) => boolean,

    // Cart
    cart: string[],
    addToCart: (id: string) => void,
    removeFromCart: (id: string) => void,
    isInCart: (id: string) => boolean,

    // Compare
    compareList: string[],
    addToCompare: (id: string) => void,
    removeFromCompare: (id: string) => void,
    isInCompare: (id: string) => boolean,
    clearCompare: () => void,
  };
}
```

### useOnboarding

**Archivo:** `hooks/useOnboarding.ts`

Gestiona el tour guiado y modal de bienvenida.

```typescript
function useOnboarding() {
  return {
    showWelcome: boolean,
    showTour: boolean,
    currentStep: number,
    totalSteps: number,
    startTour: () => void,
    nextStep: () => void,
    prevStep: () => void,
    skipTour: () => void,
    completeTour: () => void,
    dismissWelcome: () => void,
  };
}
```

---

## Servicios y API

### catalogApi.ts

**Archivo:** `services/catalogApi.ts`

#### Endpoints

| Función | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| `getCatalogProducts` | GET | `/catalog/{landing}/products` | Lista productos con filtros y paginación |
| `getCatalogFilters` | GET | `/catalog/{landing}/filters` | Obtiene filtros dinámicos |
| `searchProductSuggestions` | GET | `/products/search` | Autocomplete de búsqueda |

#### getCatalogProducts

```typescript
async function getCatalogProducts(
  landingSlug: string,
  options: {
    filters?: FilterState;
    sort?: SortOption;
    limit?: number;
    offset?: number;
  }
): Promise<{
  products: CatalogProduct[];
  total: number;
  hasMore: boolean;
}>
```

**Request:**
```
GET /api/v1/catalog/home/products?
  brands=lenovo,hp&
  ram=8,16&
  sort=price_asc&
  limit=20&
  offset=0
```

**Response:**
```json
{
  "items": [
    {
      "id": 32,
      "slug": "lenovo-laptop-1",
      "name": "Lenovo Laptop i3-1215U",
      "short_name": "Lenovo 15.6\"",
      "brand": { "id": 1, "name": "Lenovo" },
      "list_price": "4957.00",
      "monthly_quota": "238.32",
      "images": [...],
      "colors": [...],
      "tags": [...],
      "specs": {...}
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### getCatalogFilters

```typescript
async function getCatalogFilters(
  landingSlug: string,
  appliedFilters?: Partial<FilterState>
): Promise<CatalogFiltersResponse>
```

**Response:**
```json
{
  "brands": [
    { "id": 1, "name": "Lenovo", "slug": "lenovo", "count": 12 },
    { "id": 2, "name": "HP", "slug": "hp", "count": 8 }
  ],
  "specs": [
    {
      "name": "RAM",
      "data_type": "number",
      "values": [
        { "value": "8", "display": "8 GB", "count": 15 },
        { "value": "16", "display": "16 GB", "count": 10 }
      ]
    }
  ],
  "price_range": { "min": 1500, "max": 8000 },
  "quota_range": { "min": 100, "max": 500 }
}
```

---

## Tipos e Interfaces

### CatalogProduct

```typescript
interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  brand: string;
  brandSlug: string;
  category: string;

  // Precios
  price: number;
  originalPrice?: number;
  quotaMonthly: number;
  originalQuota?: number;
  discount?: number;

  // Media
  images: ProductImage[];
  colors: ProductColor[];

  // Specs resumidas
  processor?: string;
  ram?: string;
  storage?: string;
  screen?: string;

  // Metadata
  tags: ProductTag[];
  rating?: number;
  reviewCount?: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
}
```

### FilterState

```typescript
interface FilterState {
  // Filtros comerciales
  brands: string[];
  priceRange: [number, number];
  quotaRange: [number, number];

  // Filtros técnicos
  ram: number[];
  storage: number[];
  screenSize: number[];
  processor: string[];

  // Filtros de uso
  usage: UsageType[];

  // Búsqueda
  search: string;
}

type UsageType = 'estudios' | 'gaming' | 'diseno' | 'oficina' | 'programacion';
```

### SortOption

```typescript
type SortOption =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'quota_asc'
  | 'newest'
  | 'popular';
```

### CatalogLayoutConfig

```typescript
interface CatalogLayoutConfig {
  layoutVersion: 4;              // FIJO en v0.6
  brandFilterVersion: 3;         // FIJO en v0.6
  cardVersion: 6;                // FIJO en v0.6
  technicalFiltersVersion: 3;    // FIJO en v0.6
  skeletonVersion: 2;            // FIJO en v0.6
  colorSelectorVersion: 1 | 2;   // ÚNICO iterable
}
```

---

## Configuración y Variantes

### Variantes Fijas en v0.6

| Componente | Versión | Descripción |
|------------|---------|-------------|
| Layout | V4 | Grid 3 columnas con sidebar |
| BrandFilter | V3 | Pills con logo y contador |
| ProductCard | V6 | Card con galería y color selector |
| TechnicalFilters | V3 | Styled accordion |
| Skeleton | V2 | Shimmer effect |

### Variantes Iterables

| Componente | Valores | Descripción |
|------------|---------|-------------|
| ColorSelector | `1 \| 2` | V1: Dots pequeños, V2: Swatches con check |

### Cambiar Variante de ColorSelector

```typescript
// En CatalogoClient.tsx o via URL
setConfig(prev => ({
  ...prev,
  colorSelectorVersion: 2
}));

// O via URL
/catalogo?color=2
```

---

## Parámetros URL

### Filtros

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `brands` | string[] | `brands=lenovo,hp` | Filtrar por marcas |
| `ram` | number[] | `ram=8,16` | Filtrar por RAM |
| `storage` | number[] | `storage=256,512` | Filtrar por almacenamiento |
| `priceMin` | number | `priceMin=2000` | Precio mínimo |
| `priceMax` | number | `priceMax=5000` | Precio máximo |
| `quotaMin` | number | `quotaMin=100` | Cuota mínima |
| `quotaMax` | number | `quotaMax=300` | Cuota máxima |
| `usage` | string[] | `usage=gaming,estudios` | Filtrar por uso |
| `search` | string | `search=lenovo` | Búsqueda de texto |

### Ordenamiento

| Parámetro | Valores | Default |
|-----------|---------|---------|
| `sort` | `recommended`, `price_asc`, `price_desc`, `quota_asc`, `newest`, `popular` | `recommended` |

### Configuración

| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `color` | `1 \| 2` | Versión del color selector |

### Onboarding

| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `tourSteps` | `complete` | Marca el tour como completado |
| `tourStyle` | `spotlight` | Estilo del tour |

### Ejemplo URL Completa

```
/prototipos/0.6/home/catalogo?
  brands=lenovo,hp&
  ram=16&
  priceMin=2000&
  priceMax=5000&
  sort=price_asc&
  color=2&
  search=laptop
```

---

## Persistencia (localStorage)

### Keys Utilizadas

| Key | Tipo | Descripción |
|-----|------|-------------|
| `baldecash-wishlist` | `string[]` | IDs de productos en favoritos |
| `baldecash-cart` | `string[]` | IDs de productos en carrito |
| `baldecash-compare` | `string[]` | IDs de productos para comparar |
| `baldecash-onboarding-complete` | `boolean` | Tour completado |
| `baldecash-quiz-reminder-shown` | `boolean` | Quiz reminder mostrado (sesión) |

### Ejemplo de Uso

```typescript
// El hook useCatalogSharedState maneja esto automáticamente
const { wishlist, addToWishlist } = useCatalogSharedState();

// Internamente:
useEffect(() => {
  localStorage.setItem('baldecash-wishlist', JSON.stringify(wishlist));
}, [wishlist]);
```

---

## Flujos de Datos

### Carga Inicial

```
1. page.tsx (SSR)
   └─> Renderiza CatalogoClient con landingSlug

2. CatalogoClient monta
   ├─> useLayout() obtiene datos de landing (colores, config)
   ├─> useCatalogProducts() inicia fetch
   ├─> useCatalogFilters() inicia fetch
   └─> useCatalogSharedState() carga desde localStorage

3. API Responses
   ├─> products → renderiza ProductCards
   └─> filters → renderiza FilterPanel

4. Usuario interactúa
   ├─> Cambia filtro → setFilters() → refetch products
   ├─> Cambia sort → setSort() → refetch products
   └─> Add to cart → addToCart() → actualiza localStorage
```

### Filtrado

```
1. Usuario selecciona filtro (ej: RAM = 16GB)
   └─> setFilters({ ...filters, ram: [16] })

2. useEffect detecta cambio en filters
   └─> Actualiza URL params (queryFilters.ts)

3. useCatalogProducts detecta cambio
   └─> Fetch con nuevos filtros

4. useCatalogFilters detecta cambio
   └─> Fetch filtros actualizados (conteos contextuales)

5. UI se actualiza
   ├─> Nuevo grid de productos
   └─> Filtros con nuevos conteos
```

### Paginación

```
1. Usuario hace scroll / click "Ver más"
   └─> loadMore()

2. useCatalogProducts
   └─> Fetch con offset incrementado

3. Response
   └─> Concatena nuevos productos al array existente

4. UI
   └─> Renderiza productos adicionales
```

---

## Sistema de Imágenes por Color (Carousel)

### Arquitectura

Las imágenes pertenecen a **variantes** (colores), no directamente a productos. Cada variante puede tener múltiples imágenes que se muestran en un carousel.

```
Product
├── Variant (Negro)
│   ├── VariantImage [MAIN] ← Imagen principal
│   ├── VariantImage [GALLERY] ← Vista adicional 1
│   └── VariantImage [GALLERY] ← Vista adicional 2
├── Variant (Blanco)
│   ├── VariantImage [MAIN]
│   ├── VariantImage [GALLERY]
│   └── VariantImage [GALLERY]
└── Variant (Plata)
    └── ...
```

### Backend

#### Modelo de Datos (VariantImage)

```python
# app/db/models/products.py
class ImageType(str, enum.Enum):
    MAIN = "main"           # Imagen principal (1 por variante)
    GALLERY = "gallery"     # Imágenes adicionales (2-3 por variante)
    THUMBNAIL = "thumbnail" # Miniatura (legacy)

class VariantImage(ActiveBaseModel):
    variant_id: int          # FK a ProductVariant
    url: str                 # URL de la imagen
    type: ImageType          # main | gallery | thumbnail
    display_order: int       # Orden en carousel (0 = primero)
    is_primary: bool         # True para MAIN
```

#### Seeder (images.py)

```python
# scripts/seeders/products/images.py
GALLERY_IMAGES = {
    "laptop": [
        "https://cdn.../hp15.png",
        "https://cdn.../dell.jpg",
    ],
    "celular": [...],
    "tablet": [...],
}

# Por cada variante crea:
# 1 MAIN + 2 GALLERY images
```

#### API Response

```python
# app/services/landing_service.py
# Endpoint: GET /api/v1/public/landing/{slug}/products

# Query para obtener imágenes MAIN y GALLERY
variant_images_query = db.query(VariantImage).filter(
    VariantImage.variant_id.in_(variant_ids),
    VariantImage.type.in_([ImageType.MAIN, ImageType.GALLERY]),
    VariantImage.is_active == True
).order_by(
    VariantImage.is_primary.desc(),
    VariantImage.display_order
).all()

# Response por color incluye array de imágenes
{
    "colors": [
        {
            "id": "color-18",
            "name": "Negro",
            "hex": "#1a1a1a",
            "image_url": "https://cdn.../main.jpg",  # Backwards compat
            "images": [                               # Array para carousel
                "https://cdn.../main.jpg",
                "https://cdn.../gallery1.jpg",
                "https://cdn.../gallery2.jpg"
            ]
        }
    ]
}
```

### Frontend

#### Tipos

```typescript
// types/catalog.ts
interface ProductColor {
  id: string;           // "color-{variant_id}"
  name: string;         // "Negro"
  hex: string;          // "#1a1a1a"
  imageUrl?: string;    // Imagen principal (backwards compat)
  images?: string[];    // Array de imágenes para carousel
}

// services/catalogApi.ts
interface ApiProductColor {
  id: string;
  name: string;
  hex: string;
  image_url?: string;
  images?: string[];    // Array de URLs
}
```

#### Mapper (catalogApi.ts)

```typescript
// Mapea API response a frontend types
colors: apiProduct.colors?.map(c => ({
  id: c.id,
  name: c.name,
  hex: c.hex,
  imageUrl: c.image_url,
  images: c.images || (c.image_url ? [c.image_url] : []),
})) || [],
```

#### ProductCard (ProductCard.tsx)

```typescript
// Estado del color seleccionado
const [selectedColorId, setSelectedColorId] = useState<string>(
  product.colors?.[0]?.id || ''
);

// Obtener imágenes del color seleccionado
const getImagesForSelectedColor = (): string[] => {
  if (!selectedColorId || !product.colors) {
    return [product.thumbnail, ...product.images.slice(0, 2)];
  }
  const selectedColor = product.colors.find(c => c.id === selectedColorId);

  // Prioridad: images array > imageUrl > thumbnail
  if (selectedColor?.images && selectedColor.images.length > 0) {
    return selectedColor.images;
  }
  if (selectedColor?.imageUrl) {
    return [selectedColor.imageUrl];
  }
  return [product.thumbnail];
};

const selectedImages = getImagesForSelectedColor();

// Renderiza ImageGallery con imágenes filtradas
<ImageGallery
  images={selectedImages}
  alt={product.displayName}
/>
```

#### ImageGallery (ImageGallery.tsx)

```typescript
// Muestra thumbnails solo si hay 2+ imágenes
export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images.slice(0, 4);

  // Si solo 1 imagen, no mostrar navegación
  if (displayImages.length <= 1) {
    return (
      <img src={displayImages[0]} alt={alt} className="w-full h-52 object-contain" />
    );
  }

  // Carousel con thumbnails
  return (
    <div>
      <img src={displayImages[currentIndex]} alt={alt} className="w-full h-44" />
      <div className="flex gap-1 mt-2 justify-center">
        {displayImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-10 h-10 rounded border-2 ${
              index === currentIndex ? 'border-primary' : 'border-transparent'
            }`}
          >
            <img src={img} alt={`${alt} - ${index + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Flujo Completo

```
1. Usuario carga catálogo
   └─> API retorna productos con colors[].images

2. ProductCard renderiza
   ├─> ColorSelector muestra colores disponibles
   └─> ImageGallery muestra imágenes del primer color

3. Usuario selecciona otro color
   ├─> setSelectedColorId("color-19")
   ├─> getImagesForSelectedColor() retorna nuevo array
   └─> ImageGallery re-renderiza con nuevas imágenes

4. Usuario navega carousel
   └─> Click en thumbnail cambia currentIndex
```

### Agregar Más Imágenes a Variantes

1. **Modificar seeder** (`scripts/seeders/products/images.py`):
```python
GALLERY_IMAGES = {
    "laptop": [
        "url1.jpg",
        "url2.jpg",
        "url3.jpg",  # Agregar más URLs
    ],
}
```

2. **Re-ejecutar seeder**:
```bash
docker-compose exec api python -m scripts.seeders.runner --module products
```

3. **Reiniciar API** (si es necesario):
```bash
docker-compose restart api
```

---

## Cómo Extender

### Agregar Nuevo Filtro

1. **Actualizar tipos** (`types/catalog.ts`):
```typescript
interface FilterState {
  // ... existing
  newFilter: string[];
}
```

2. **Actualizar API** (`services/catalogApi.ts`):
```typescript
// En buildFilterParams()
if (filters.newFilter?.length) {
  params.append('new_filter', filters.newFilter.join(','));
}
```

3. **Crear componente** (`components/catalog/filters/NewFilter.tsx`)

4. **Agregar a FloatingFilterPanel**

5. **Actualizar queryFilters.ts** para URL sync

### Agregar Nueva Variante de Layout

1. **Crear componente** (`components/catalog/layout/CatalogLayoutV7.tsx`)

2. **Exportar en index.ts**

3. **Actualizar selector** (`CatalogLayout.tsx`):
```typescript
case 7:
  return <CatalogLayoutV7 {...props} />;
```

4. **Actualizar tipo** (`types/catalog.ts`):
```typescript
layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7;
```

### Agregar Nuevo Drawer

1. **Crear componente** (`components/catalog/NewDrawer.tsx`)

2. **Agregar estado en CatalogoClient**:
```typescript
const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
```

3. **Agregar trigger en UI** (navbar, botón, etc.)

4. **Renderizar drawer** con AnimatePresence
