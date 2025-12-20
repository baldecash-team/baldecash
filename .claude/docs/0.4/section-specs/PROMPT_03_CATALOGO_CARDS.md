# Prompt #3: Catálogo - Product Cards - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 29 |
| **Iteraciones T (6 versiones)** | 16 |
| **Iteraciones F (1 versión)** | 13 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto del Proyecto

### 1.1 Descripción General
Las Product Cards son el elemento más importante del catálogo. Cada card debe comunicar rápidamente el valor del producto y motivar al usuario a ver más detalles o iniciar el proceso de financiamiento.

### 1.2 Público Objetivo
- Estudiantes universitarios peruanos (18-28 años)
- Usuario NO técnico: preferir beneficios sobre specs
- 64% accede desde dispositivos móviles
- Alta ansiedad crediticia: cuota prominente genera confianza
- Decisión basada en: precio/cuota > marca > specs

### 1.3 Insights UX/UI del Researcher
- **Cuota prominente**: Estudiantes piensan en cuotas, no precio total
- **Ahorro en monto, no porcentaje**: "Ahorra S/200" > "-15%"
- **Nombre descriptivo**: "Laptop Lenovo 15.6"" > "V15 G4 AMN"
- **3-5 key features**: No saturar con información
- **Badges dinámicos**: Nuevo, Oferta, Popular, Stock limitado

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
--success: #22c55e;      /* GPU dedicada, RAM expandible */
--warning: #f59e0b;      /* Stock limitado */
--error: #ef4444;        /* Descuento, Oferta */
--info: #3b82f6;         /* Nuevo */
--neutral-50: #FAFAFA;
--neutral-700: #404040;
--neutral-800: #262626;
```

### 3.2 Restricciones
- NO emojis → usar `lucide-react`
- NO gradientes → colores sólidos
- Imágenes de prueba → Unsplash laptops

---

## 4. Estructura de Archivos a Generar (6 versiones)

```
src/app/prototipos/0.4/catalogo/
├── components/
│   └── cards/
│       ├── ProductCard.tsx               # Wrapper con versión configurable
│       ├── ProductCardV1.tsx             # V1: Foto Producto (specs técnicas)
│       ├── ProductCardV2.tsx             # V2: Foto Lifestyle (beneficios)
│       ├── ProductCardV3.tsx             # V3: Ilustración Flat (híbrido)
│       ├── ProductCardV4.tsx             # V4: Abstracto Flotante (fintech)
│       ├── ProductCardV5.tsx             # V5: Split 50/50 (equilibrado)
│       ├── ProductCardV6.tsx             # V6: Centrado (impacto máximo)
│       ├── ProductCardV7.tsx             # V7: Asimétrico Bold (disruptivo)
│       ├── ProductCardV8.tsx             # V8: Data-Driven (stats)
│       ├── ProductCardV9.tsx             # V9: Storytelling (narrativa)
│       ├── ProductCardV10.tsx            # V10: Interactivo (calculadora)
│       ├── CardImage.tsx                 # Imagen con badges
│       ├── CardBadges.tsx                # Sistema de badges
│       ├── CardSpecs.tsx                 # Specs técnicas
│       ├── CardBenefits.tsx              # Beneficios/uso
│       ├── CardPricing.tsx               # Precio y cuota
│       ├── CardActions.tsx               # Botones de acción
│       ├── CardHoverContent.tsx          # Contenido en hover
│       ├── CardSkeleton.tsx              # Estado loading
│       ├── badges/
│       │   ├── DiscountBadge.tsx         # -S/200
│       │   ├── StockBadge.tsx            # Stock limitado
│       │   ├── NewBadge.tsx              # Nuevo
│       │   ├── PopularBadge.tsx          # Popular
│       │   ├── ConditionBadge.tsx        # Nuevo/Reacondicionado
│       │   └── FeatureBadge.tsx          # GPU, RAM expandible, etc.
│       └── interactions/
│           ├── FavoriteButton.tsx        # Guardar favorito
│           ├── CompareCheckbox.tsx       # Agregar a comparador
│           └── QuickViewButton.tsx       # Vista rápida
├── types/
│   └── product.ts                        # Tipos de producto
├── data/
│   └── mockProducts.ts                   # Productos de prueba
└── CARDS_README.md
```

---

## 5. Preguntas del Excel - Segmento B (Cards)

### 5.1 Cards - Información (5 preguntas)

#### Pregunta B.37 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Información |
| **Pregunta** | ¿La card debe mostrar specs técnicas o beneficios/uso recomendado? |
| **Contexto** | Specs para técnicos; beneficios para usuarios generales. |
| **Respuesta** | Información relevante para usuario estudiante (no experto), mejores prácticas UX & UI |

**6 Versiones Detalladas:**

---

### V1: Foto Producto - Enfoque Técnico

**Concepto**: Card estilo catálogo con specs técnicas prominentes

**Elementos visuales**:
- Imagen: Laptop sobre fondo blanco/neutral
- Specs: CPU, RAM, SSD, Pantalla con iconos Lucide
- Badge precio: Chip solido `bg-[#4654CD]`
- Layout vertical clásico

**Código clave**:
```tsx
<Card className="hover:shadow-lg">
  <img src={product.thumbnail} className="w-full h-48 object-contain bg-neutral-50" />
  <div className="p-4 space-y-2">
    {/* Specs con iconos */}
    <div className="flex items-center gap-2">
      <Cpu className="w-4 h-4 text-[#4654CD]" />
      <span>{specs.processor.shortName}</span>
    </div>
    {/* Cuota prominente */}
    <p className="text-2xl font-bold text-[#4654CD]">S/{quota}/mes</p>
  </div>
</Card>
```

**Referencia**: Amazon, Best Buy

---

### V2: Foto Lifestyle - Enfoque Beneficios

**Concepto**: Card aspiracional con beneficios comprensibles

**Elementos visuales**:
- Imagen: Estudiante usando laptop (contexto)
- Beneficios: "Ideal para estudios", "8h batería", "Ligera"
- Sin specs técnicas visibles
- Tono emocional

**Referencia**: Apple Store, Samsung

---

### V3: Ilustración Flat - Híbrido

**Concepto**: Card corporativa moderna, balance specs/beneficios

**Elementos visuales**:
- Fondo: Color sutil `bg-[#EEF2FF]`
- 2 specs + 2 beneficios
- Iconos flat, líneas limpias
- Chips de uso recomendado

**Referencia**: Notion, Stripe

---

### V4: Abstracto Flotante - Fintech

**Concepto**: Card con elementos flotantes y micro-animaciones

**Elementos visuales**:
- Shapes geométricos sutiles
- Precio en badge flotante con sombra
- Hover: elementos se elevan
- Estilo premium/moderno

**Referencia**: Nubank, Revolut

---

### V5: Split 50/50 - Horizontal

**Concepto**: Card horizontal, imagen izquierda, info derecha

**Elementos visuales**:
- Layout `grid-cols-2`
- Imagen ocupa 50%
- Info estructurada a la derecha
- Para grids con menos columnas

**Referencia**: Webflow, Framer

---

### V6: Centrado - Impacto Máximo

**Concepto**: Todo centrado, cuota gigante, CTA prominente

**Elementos visuales**:
- Imagen centrada arriba
- Nombre centrado
- Cuota muy grande `text-4xl`
- CTA full-width

**Referencia**: Spotify, Apple

---

#### Pregunta B.38 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Información |
| **Pregunta** | ¿Cuántas specs mostrar en la card? |
| **Contexto** | Actualmente: Procesador, RAM, SSD, Pantalla, GPU. |
| **Respuesta** | Solo las principales para no "bombardear" de información visual |

**Implementación:** Máximo 4 specs: Procesador, RAM, SSD, Pantalla. GPU solo si es dedicada.

#### Pregunta B.39 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Información |
| **Pregunta** | ¿El nombre del producto debe ser técnico o descriptivo? |
| **Contexto** | Técnico: 'V15 G4 AMN'. Descriptivo: 'Laptop Lenovo 15.6"'. |
| **Respuesta** | Descriptivo porque es para usuario estudiante (no experto) |

**Implementación:** "Laptop [Marca] [Tamaño]"" - [Procesador corto]"

#### Pregunta B.40 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Información |
| **Pregunta** | ¿Debe mostrarse el precio regular tachado siempre o solo cuando hay descuento real? |
| **Contexto** | Tachado permanente pierde credibilidad. |
| **Respuesta** | Solo cuando hay descuento real. Mostrar monto de ahorro, no porcentaje. |

**Implementación:** Precio tachado + "Ahorras S/200" solo si hay descuento real

#### Pregunta B.41 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Información |
| **Pregunta** | ¿La cuota debe destacarse más que el precio total o viceversa? |
| **Contexto** | La cuota es más relevante para el segmento. |
| **Respuesta** | Mejores prácticas UX & UI, comunicación de cara al usuario |

**Implementación:** Cuota grande y prominente, precio total pequeño debajo

---

### 5.2 Cards - Nomenclatura (2 preguntas)

#### Pregunta B.42 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Nomenclatura |
| **Pregunta** | ¿Usar nombre_corto del procesador o nombre_completo? |
| **Contexto** | nombre_corto: 'i5-12'. nombre_completo: 'Intel Core i5-12450H'. |
| **Respuesta** | Considerando usuario estudiante (no experto), mejores prácticas |

**Implementación:** Nombre corto en card: "Intel i5" o "Ryzen 5". Completo en detalle.

#### Pregunta B.43 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Nomenclatura |
| **Pregunta** | ¿Mostrar familia del producto prominentemente? |
| **Contexto** | La familia ayuda a reconocer la línea: 'IdeaPad Slim 3'. |
| **Respuesta** | Considerando usuario estudiante (no experto), mejores prácticas |

**Implementación:** Familia en subtítulo pequeño debajo del nombre

---

### 5.3 Cards - Key Features (1 pregunta)

#### Pregunta B.44 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Key features |
| **Pregunta** | ¿Mostrar los key_features (3-5 bullets) en la card o solo en detalle? |
| **Contexto** | key_features son los highlights de marketing del producto. |
| **Respuesta** | Mostrar 3-5 key features en la card, el resto en detalle (página separada) |

**Versiones a generar:**
- **V1**: 3 features como texto pequeño debajo de specs (lista simple)
- **V2**: 3 features como chips/tags coloridos (horizontal)
- **V3**: Features visibles solo en hover state (overlay)
- **V4**: Features como iconos con tooltip (compacto)
- **V5**: Features en acordeón expandible (interactivo)
- **V6**: Features destacados con checkmarks verdes (confianza)

---

### 5.4 Cards - Descripción (1 pregunta)

#### Pregunta B.45 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Descripción |
| **Pregunta** | ¿Usar descripcion_corta como preview en hover o siempre visible? |
| **Contexto** | 1-2 oraciones que resumen el producto. |
| **Respuesta** | Mostrar descripción corta en hover |

**Implementación:** Descripción aparece en hover overlay

---

### 5.5 Cards - Uso Recomendado (1 pregunta)

#### Pregunta B.46 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Uso recomendado |
| **Pregunta** | ¿Mostrar uso_recomendado como tags en la card? |
| **Contexto** | Array de casos de uso ideales: Estudio, Gaming, Oficina. |
| **Respuesta** | Mostrar uso_recomendado como tags para usuario estudiante (no experto) |

**Implementación:** Chips pequeños: "Estudios", "Oficina" con iconos

---

### 5.6 Cards - Target (1 pregunta)

#### Pregunta B.47 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Target |
| **Pregunta** | ¿Mostrar target_audience ('Ideal para estudiantes') en la card? |
| **Contexto** | Ayuda al usuario a identificarse con el producto. |
| **Respuesta** | No es necesario porque todo usuario final son estudiantes |

**Versiones a generar:**
- **V1**: No mostrar (todos son estudiantes)
- **V2**: Mostrar solo cuando es específico: "Ideal para ingeniería"
- **V3**: Mostrar siempre como sello de confianza
- **V4**: Mostrar como badge con icono de carrera
- **V5**: Mostrar como chip seleccionable (filtro inline)
- **V6**: Mostrar en hover como tooltip

---

### 5.7 Cards - Badges (10 preguntas)

#### Pregunta B.48 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Badges |
| **Pregunta** | ¿Los badges deben estar en esquina, arriba, o como ribbon? |
| **Contexto** | Posición afecta visibilidad y estética. |
| **Respuesta** | Diseño distintivo y llamativo, mejores prácticas UX & UI |

**Versiones a generar:**
- **V1**: Esquina superior derecha (overlay sobre imagen)
- **V2**: Fila arriba de la imagen (fuera de la imagen)
- **V3**: Ribbon diagonal (estilo e-commerce clásico)
- **V4**: Badge flotante con animación (fintech)
- **V5**: Esquina superior izquierda (split layout)
- **V6**: Badge centrado sobre imagen (impacto máximo)
- **V7**: Badge que sale del borde (asimétrico)
- **V8**: Badge con número/contador animado (data-driven)
- **V9**: Badge como etiqueta de timeline (storytelling)
- **V10**: Badge interactivo expandible (más info on click)

#### Pregunta B.49 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Badges |
| **Pregunta** | ¿Qué colores usar para cada tipo de badge? |
| **Contexto** | Colores consistentes crean lenguaje visual. |
| **Respuesta** | Mejores prácticas UX & UI |

**Versiones a generar:**
- **V1**: Colores semánticos (rojo=oferta, azul=nuevo, amarillo=stock)
- **V2**: Escala de grises con accent color primario
- **V3**: Colores pastel suaves (menos agresivo)
- **V4**: Monocromático con variaciones del primario
- **V5**: Bicolor (primario + acento aqua)
- **V6**: Gradientes sutiles (misma familia de color)
- **V7**: Negro con iconos coloridos
- **V8**: Colores por categoría de información
- **V9**: Colores emocionales (verde=confianza, azul=nuevo)
- **V10**: Colores dinámicos según urgencia

#### Pregunta B.50-B.57 [DEFINIDO - 1 versión cada uno]
| Badge | Mostrar | Color | Icono |
|-------|---------|-------|-------|
| WiFi 6 / WiFi 6E | Solo si es 6E | `#3b82f6` | Wifi |
| RAM expandible | Sí, diferenciador | `#22c55e` | MemoryStick |
| GPU dedicada | Sí, para gamers | `#22c55e` | Gpu |
| Teclado retroiluminado | No en card, solo detalle | - | - |
| Pantalla táctil | Sí si aplica | `#3b82f6` | TouchpadOff |
| Lector de huella | No en card, solo detalle | - | - |
| Certificaciones (MIL-STD) | No en card, solo detalle | - | - |
| Nueva vs Reacondicionada | Sí, prominente | Verde/Naranja | Package |
| Gama | No como badge, sí como filtro | - | - |

---

### 5.8 Cards - Stock (2 preguntas)

#### Pregunta B.58 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Stock |
| **Pregunta** | ¿Cómo mostrar tipo_stock? |
| **Contexto** | Disponible/Limitado/Bajo pedido. |
| **Respuesta** | Va a depender del usuario |

**Implementación:** 
- Disponible: Sin badge (estado normal)
- Limitado: Badge amarillo "Últimas unidades"
- Bajo pedido: Badge gris "Por encargo (5-7 días)"

#### Pregunta B.59 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Stock |
| **Pregunta** | ¿Badge de 'Últimas unidades' genera urgencia real o desconfianza? |
| **Contexto** | Escasez puede motivar o frustrar. |
| **Respuesta** | Mejores prácticas UX & UI, usuario estudiante (no experto) |

**Versiones a generar:**
- **V1**: Badge prominente amarillo "¡Últimas 3 unidades!" con icono alerta
- **V2**: Texto sutil "Stock limitado" sin número específico
- **V3**: Barra de stock visual sin texto (progress bar)
- **V4**: Badge flotante animado con pulso (urgencia fintech)
- **V5**: Icono + número pequeño en esquina (minimalista)
- **V6**: Banner full-width en parte superior de card (impacto máximo)
- **V7**: Badge que sale del borde con rotación (asimétrico)
- **V8**: Contador animado "Solo quedan X" (data-driven)
- **V9**: Testimonio "María acaba de comprar el último" (storytelling)
- **V10**: Badge interactivo "Notifícame" cuando agotado

---

### 5.9 Cards - Interacción (4 preguntas)

#### Pregunta B.60 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Interacción |
| **Pregunta** | ¿El selector de plazo en la card es útil o agrega ruido? |
| **Contexto** | Permite comparar pero complica cada card. |
| **Respuesta** | Tendremos frecuencia semanal/quincenal/mensual |

**Implementación:** Mostrar cuota mensual por defecto, cambiar en detalle

#### Pregunta B.61 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Interacción |
| **Pregunta** | ¿Debe haber botón de 'Favoritos' o 'Guardar'? |
| **Contexto** | Útil para comparar después pero requiere cuenta/sesión. |
| **Respuesta** | Sí, estaría bien agregar ese botón |

**Versiones a generar:**
- **V1**: Icono corazón esquina superior derecha (siempre visible, sobre imagen)
- **V2**: Icono corazón visible solo en hover con fade-in
- **V3**: Botón "Guardar" con texto al lado del CTA principal
- **V4**: Icono flotante con animación de pulso (estilo fintech)
- **V5**: Icono en esquina inferior de imagen (split layout)
- **V6**: Bookmark centrado sobre imagen con overlay (impacto)
- **V7**: Icono que sale del borde de la card (asimétrico)
- **V8**: Botón con contador de favoritos "❤️ 23" (data-driven)
- **V9**: "María también lo guardó" con avatar pequeño (storytelling)
- **V10**: Toggle interactivo con tooltip explicativo

#### Pregunta B.62 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Interacción |
| **Pregunta** | ¿El hover debe mostrar información adicional o mantener card estática? |
| **Contexto** | Hover puede revelar más; estático es más predecible. |
| **Respuesta** | Mejores prácticas UX & UI, usuario estudiante (no experto) |

**Versiones a generar:**
- **V1**: Hover muestra descripción corta + botón "Vista rápida"
- **V2**: Hover muestra specs adicionales + key features en overlay
- **V3**: Card estática, solo scale sutil y shadow en hover
- **V4**: Hover con overlay gradiente y CTA flotante (fintech)
- **V5**: Hover muestra imagen secundaria (cambio de ángulo)
- **V6**: Hover expande card verticalmente mostrando más info (impacto)
- **V7**: Hover con elementos que se desplazan/revelan (asimétrico bold)
- **V8**: Hover muestra stats/ratings/reviews resumidos (data-driven)
- **V9**: Hover con micro-testimonial "Lo compré hace 2 meses" (storytelling)
- **V10**: Hover activa mini-calculadora de cuotas inline (interactivo)

#### Pregunta B.63 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Interacción |
| **Pregunta** | ¿Debe haber botón de 'Comparar'? |
| **Contexto** | Comparación lado a lado ayuda a decidir. |
| **Respuesta** | Mejores prácticas UX & UI, usuario estudiante (no experto) |

**Implementación:** Checkbox sutil "Comparar" visible en hover

---

### 5.10 Cards - Visual (2 preguntas)

#### Pregunta B.64 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Visual |
| **Pregunta** | ¿Las imágenes deben ser sobre fondo blanco o en contexto de uso? |
| **Contexto** | Fondo blanco es limpio; contexto es más aspiracional. |
| **Respuesta** | Mejores prácticas UX & UI, usuario estudiante (no experto) |

**Versiones a generar:**
- **V1**: Fondo blanco puro, producto aislado (estilo e-commerce)
- **V2**: Fondo neutral con sombra suave (lifestyle sutil)
- **V3**: Ilustración flat vectorial del producto (ilustración)
- **V4**: Fondo con shapes geométricos sutiles (fintech abstracto)
- **V5**: Imagen dividida: producto izq, contexto der (split)
- **V6**: Imagen full-bleed sin bordes, impacto visual (centrado)
- **V7**: Imagen rotada/inclinada con espacios negativos (asimétrico)
- **V8**: Fondo con patrón de marca sutil (data-driven consistencia)
- **V9**: Imagen en contexto real: estudiante en biblioteca (storytelling)
- **V10**: Imagen interactiva: rotate on hover 3D sutil (interactivo)

#### Pregunta B.65 [ITERAR - 6 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Cards - Visual |
| **Pregunta** | ¿Debe haber múltiples fotos por producto en la card o solo una? |
| **Contexto** | Una es limpio; múltiples dan más información. |
| **Respuesta** | Tendremos múltiples fotos/ángulos por cada producto |

**Versiones a generar:**
- **V1**: Una imagen, galería completa en hover overlay
- **V2**: Dots indicadores, auto-rotate cada 3s
- **V3**: Mini thumbnails horizontales debajo de imagen
- **V4**: Imagen principal + floating preview sutil (fintech)
- **V5**: Split: imagen principal izq + 2 thumbnails der (split)
- **V6**: Imagen única grande, sin distracciones (impacto)
- **V7**: Thumbnails verticales a un lado (asimétrico)
- **V8**: Contador "4 fotos" con quick gallery on click (data)
- **V9**: Carrusel tipo Instagram con deslizar (storytelling)
- **V10**: Selector interactivo: frontal/lateral/teclado (interactivo)

---

## 6. Tipos TypeScript

```typescript
// types/product.ts

export interface Product {
  id: string;
  sku: string;
  name: string;
  displayName: string;
  slug: string;
  shortDescription: string;
  description: string;
  brand: string;
  brandLogo?: string;
  family?: string;
  category: 'laptop' | 'tablet' | 'celular' | 'accesorio';
  condition: 'nuevo' | 'reacondicionado' | 'open_box';
  
  // Precios
  listPrice: number;
  salePrice?: number;
  discount?: number;
  
  // Cuotas
  quotas: QuotaOption[];
  
  // Stock
  stockStatus: 'available' | 'limited' | 'on_demand' | 'out_of_stock';
  stockQuantity?: number;
  
  // Imágenes
  thumbnail: string;
  images: ProductImage[];
  
  // Specs
  specs: ProductSpecs;
  
  // Marketing
  keyFeatures: string[];
  usageRecommended: UsageType[];
  targetAudience?: string;
  
  // Badges/Tags
  isNew: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  tags: ProductTag[];
  
  // Metadata
  gama: 'entry' | 'media' | 'alta' | 'premium';
  warranty: number; // meses
  createdAt: string;
}

export interface QuotaOption {
  term: number; // 12, 18, 24, 36, 48
  frequency: 'weekly' | 'biweekly' | 'monthly';
  amount: number;
  totalAmount: number;
  rate: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  type: 'main' | 'gallery' | 'context';
  order: number;
}

export interface ProductSpecs {
  processor: {
    brand: 'intel' | 'amd' | 'apple';
    model: string;
    shortName: string;
    fullName: string;
    cores: number;
    threads: number;
    baseSpeed: number;
    maxSpeed: number;
    generation?: string;
  };
  ram: {
    size: number;
    type: 'DDR4' | 'DDR5' | 'LPDDR4' | 'LPDDR5';
    speed: number;
    expandable: boolean;
    maxSize?: number;
    slots?: number;
  };
  storage: {
    size: number;
    type: 'SSD' | 'HDD' | 'eMMC';
    interface?: 'NVMe' | 'SATA' | 'PCIe';
  };
  display: {
    size: number;
    resolution: string;
    resolutionName: 'HD' | 'FHD' | 'QHD' | '4K';
    panelType: 'IPS' | 'TN' | 'OLED' | 'VA';
    refreshRate: number;
    touchScreen: boolean;
    brightness?: number;
  };
  gpu: {
    type: 'integrated' | 'dedicated';
    brand?: string;
    model?: string;
    vram?: number;
  };
  battery?: {
    capacity: number;
    duration: number;
    fastCharge: boolean;
    fastChargeWatts?: number;
  };
  connectivity: {
    wifi: string;
    bluetooth: string;
    ethernet: boolean;
  };
  ports: {
    usba: number;
    usbc: number;
    thunderbolt: boolean;
    hdmi: boolean;
    sdCard: boolean;
    headphone: boolean;
  };
  keyboard: {
    backlit: boolean;
    numpad: boolean;
    layout: string;
  };
  security: {
    fingerprint: boolean;
    webcam: boolean;
    webcamPrivacy?: boolean;
  };
  os: {
    name: string;
    version?: string;
  };
  physical: {
    weight: number;
    dimensions: string;
    color: string;
  };
}

export interface ProductTag {
  id: string;
  code: string;
  label: string;
  type: 'promo' | 'feature' | 'status';
  color?: string;
  icon?: string;
}

export type UsageType = 
  | 'estudios' 
  | 'gaming' 
  | 'diseno' 
  | 'oficina' 
  | 'programacion';

export interface ProductCardConfig {
  // Version principal de la card (B.37)
  cardVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Key features display (B.44)
  keyFeaturesVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Target audience display (B.47)
  targetVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Badge position (B.48)
  badgePositionVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Badge colors (B.49)
  badgeColorVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Stock urgency display (B.59)
  stockDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Favorite button (B.61)
  favoriteButtonVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Hover behavior (B.62)
  hoverBehaviorVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Image background style (B.64)
  imageStyleVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Multiple images display (B.65)
  multipleImagesVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultProductCardConfig: ProductCardConfig = {
  cardVersion: 1,
  keyFeaturesVersion: 1,
  targetVersion: 1,
  badgePositionVersion: 1,
  badgeColorVersion: 1,
  stockDisplayVersion: 1,
  favoriteButtonVersion: 1,
  hoverBehaviorVersion: 1,
  imageStyleVersion: 1,
  multipleImagesVersion: 1,
};
```

---

## 7. Datos de Prueba

```typescript
// data/mockProducts.ts

import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'LNV-IP3-I5-8-256',
    name: 'IdeaPad Slim 3 15IAH8',
    displayName: 'Laptop Lenovo 15.6" - Intel i5',
    slug: 'lenovo-ideapad-slim-3-15iah8',
    shortDescription: 'Laptop ideal para estudiantes universitarios. Potente, ligera y con batería para todo el día.',
    brand: 'Lenovo',
    family: 'IdeaPad Slim 3',
    category: 'laptop',
    condition: 'nuevo',
    listPrice: 2499,
    salePrice: 2299,
    discount: 200,
    quotas: [
      { term: 12, frequency: 'monthly', amount: 215, totalAmount: 2580, rate: 0.012 },
      { term: 18, frequency: 'monthly', amount: 152, totalAmount: 2736, rate: 0.012 },
      { term: 24, frequency: 'monthly', amount: 119, totalAmount: 2856, rate: 0.012 },
      { term: 36, frequency: 'monthly', amount: 85, totalAmount: 3060, rate: 0.012 },
      { term: 48, frequency: 'monthly', amount: 68, totalAmount: 3264, rate: 0.012 },
    ],
    stockStatus: 'available',
    stockQuantity: 15,
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', alt: 'Lenovo IdeaPad frontal', type: 'main', order: 1 },
      { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', alt: 'Lenovo IdeaPad lateral', type: 'gallery', order: 2 },
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'Lenovo IdeaPad teclado', type: 'gallery', order: 3 },
    ],
    specs: {
      processor: {
        brand: 'intel',
        model: 'Core i5-12450H',
        shortName: 'i5-12',
        fullName: 'Intel Core i5-12450H (8 núcleos, hasta 4.4GHz)',
        cores: 8,
        threads: 12,
        baseSpeed: 2.0,
        maxSpeed: 4.4,
        generation: '12th Gen',
      },
      ram: {
        size: 8,
        type: 'DDR4',
        speed: 3200,
        expandable: true,
        maxSize: 16,
        slots: 2,
      },
      storage: {
        size: 256,
        type: 'SSD',
        interface: 'NVMe',
      },
      display: {
        size: 15.6,
        resolution: '1920x1080',
        resolutionName: 'FHD',
        panelType: 'IPS',
        refreshRate: 60,
        touchScreen: false,
        brightness: 300,
      },
      gpu: {
        type: 'integrated',
        brand: 'Intel',
        model: 'UHD Graphics',
      },
      battery: {
        capacity: 45,
        duration: 8,
        fastCharge: true,
        fastChargeWatts: 65,
      },
      connectivity: {
        wifi: 'Wi-Fi 6',
        bluetooth: '5.1',
        ethernet: false,
      },
      ports: {
        usba: 2,
        usbc: 1,
        thunderbolt: false,
        hdmi: true,
        sdCard: true,
        headphone: true,
      },
      keyboard: {
        backlit: false,
        numpad: true,
        layout: 'Español Latinoamérica',
      },
      security: {
        fingerprint: false,
        webcam: true,
        webcamPrivacy: true,
      },
      os: {
        name: 'Windows 11 Home',
        version: '22H2',
      },
      physical: {
        weight: 1.63,
        dimensions: '359.3 x 235.8 x 17.9 mm',
        color: 'Arctic Grey',
      },
    },
    keyFeatures: [
      'Procesador Intel Core i5 de 12va generación',
      'Pantalla FHD antirreflejos',
      'Hasta 8 horas de batería',
      'Carga rápida 65W',
      'RAM expandible hasta 16GB',
    ],
    usageRecommended: ['estudios', 'oficina'],
    targetAudience: 'Estudiantes universitarios',
    isNew: false,
    isFeatured: true,
    isPopular: true,
    tags: [
      { id: '1', code: 'oferta', label: 'Oferta', type: 'promo', color: '#ef4444' },
      { id: '2', code: 'popular', label: 'Popular', type: 'status', color: '#f59e0b' },
    ],
    gama: 'media',
    warranty: 12,
    createdAt: '2024-01-15',
  },
  // ... más productos de prueba
];

// Producto gaming
export const mockProductGaming: Product = {
  id: '2',
  sku: 'ASUS-TUF-R7-16-512',
  name: 'TUF Gaming A15',
  displayName: 'Laptop ASUS Gaming 15.6" - Ryzen 7',
  slug: 'asus-tuf-gaming-a15',
  shortDescription: 'Potencia para gaming y diseño. GPU dedicada RTX 3050 y pantalla 144Hz.',
  brand: 'ASUS',
  family: 'TUF Gaming',
  category: 'laptop',
  condition: 'nuevo',
  listPrice: 4299,
  quotas: [
    { term: 12, frequency: 'monthly', amount: 401, totalAmount: 4812, rate: 0.012 },
    { term: 24, frequency: 'monthly', amount: 221, totalAmount: 5304, rate: 0.012 },
    { term: 48, frequency: 'monthly', amount: 126, totalAmount: 6048, rate: 0.012 },
  ],
  stockStatus: 'limited',
  stockQuantity: 3,
  thumbnail: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400',
  images: [
    { url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800', alt: 'ASUS TUF Gaming', type: 'main', order: 1 },
  ],
  specs: {
    processor: {
      brand: 'amd',
      model: 'Ryzen 7 6800H',
      shortName: 'R7-6800H',
      fullName: 'AMD Ryzen 7 6800H (8 núcleos, hasta 4.7GHz)',
      cores: 8,
      threads: 16,
      baseSpeed: 3.2,
      maxSpeed: 4.7,
    },
    ram: {
      size: 16,
      type: 'DDR5',
      speed: 4800,
      expandable: true,
      maxSize: 32,
      slots: 2,
    },
    storage: {
      size: 512,
      type: 'SSD',
      interface: 'NVMe',
    },
    display: {
      size: 15.6,
      resolution: '1920x1080',
      resolutionName: 'FHD',
      panelType: 'IPS',
      refreshRate: 144,
      touchScreen: false,
    },
    gpu: {
      type: 'dedicated',
      brand: 'NVIDIA',
      model: 'RTX 3050',
      vram: 4,
    },
    battery: {
      capacity: 90,
      duration: 6,
      fastCharge: true,
      fastChargeWatts: 180,
    },
    connectivity: {
      wifi: 'Wi-Fi 6',
      bluetooth: '5.2',
      ethernet: true,
    },
    ports: {
      usba: 3,
      usbc: 1,
      thunderbolt: false,
      hdmi: true,
      sdCard: false,
      headphone: true,
    },
    keyboard: {
      backlit: true,
      numpad: true,
      layout: 'Español Latinoamérica',
    },
    security: {
      fingerprint: false,
      webcam: true,
    },
    os: {
      name: 'Windows 11 Home',
    },
    physical: {
      weight: 2.2,
      dimensions: '354.9 x 251.9 x 22.8 mm',
      color: 'Graphite Black',
    },
  },
  keyFeatures: [
    'GPU NVIDIA RTX 3050 4GB',
    'Pantalla 144Hz para gaming fluido',
    'Teclado retroiluminado RGB',
    'Sistema de enfriamiento mejorado',
    'Puerto Ethernet para gaming online',
  ],
  usageRecommended: ['gaming', 'diseno', 'programacion'],
  isNew: true,
  isFeatured: true,
  isPopular: false,
  tags: [
    { id: '3', code: 'nuevo', label: 'Nuevo', type: 'status', color: '#3b82f6' },
    { id: '4', code: 'gpu-dedicada', label: 'GPU Dedicada', type: 'feature', color: '#22c55e' },
  ],
  gama: 'alta',
  warranty: 12,
  createdAt: '2024-06-01',
};
```

---

## 8. Componente de Referencia - ProductCardV1

```typescript
'use client';

import React from 'react';
import { Cpu, MemoryStick, HardDrive, Monitor, Heart } from 'lucide-react';
import { Card, CardBody, CardFooter, Button, Chip } from '@nextui-org/react';
import { Product } from '../types/product';

/**
 * ProductCardV1 - Enfoque Técnico
 *
 * Características:
 * - Muestra specs técnicas prominentemente (CPU, RAM, SSD, Pantalla)
 * - GPU dedicada como badge verde si aplica
 * - Ideal para: usuarios que saben qué buscan
 * - Trade-off: puede abrumar a usuarios no técnicos
 */

interface ProductCardV1Props {
  product: Product;
  onViewDetails?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export const ProductCardV1: React.FC<ProductCardV1Props> = ({
  product,
  onViewDetails,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const lowestQuota = product.quotas.reduce((min, q) => 
    q.amount < min.amount ? q : min
  );

  return (
    <Card className="w-full hover:shadow-lg transition-shadow group">
      <CardBody className="p-0">
        {/* Imagen con badges */}
        <div className="relative w-full h-48 bg-neutral-100">
          <img
            src={product.thumbnail}
            alt={product.displayName}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          
          {/* Badges esquina superior */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.discount && (
              <Chip size="sm" className="bg-[#ef4444] text-white font-semibold">
                -S/{product.discount}
              </Chip>
            )}
            {product.isNew && (
              <Chip size="sm" className="bg-[#3b82f6] text-white font-semibold">
                Nuevo
              </Chip>
            )}
          </div>
          
          {product.stockStatus === 'limited' && (
            <Chip
              size="sm"
              className="absolute top-2 left-2 bg-[#f59e0b] text-white font-semibold"
            >
              Stock limitado
            </Chip>
          )}
          
          {/* Botón favorito (visible en hover) */}
          <button
            onClick={() => onToggleFavorite?.(product.id)}
            className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : 'text-neutral-600'}`} 
            />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Marca y familia */}
          <p className="text-xs text-neutral-500 mb-1">
            {product.brand} {product.family && `· ${product.family}`}
          </p>
          
          {/* Título */}
          <h3 className="font-bold text-base text-neutral-800 mb-3 line-clamp-2 min-h-[48px]">
            {product.displayName}
          </h3>

          {/* Specs técnicas */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Cpu className="w-4 h-4 text-[#4247d2]" />
              <span>{product.specs.processor.shortName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <MemoryStick className="w-4 h-4 text-[#4247d2]" />
              <span>
                {product.specs.ram.size}GB {product.specs.ram.type}
                {product.specs.ram.expandable && (
                  <span className="text-[#22c55e] text-xs ml-1">(expandible)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <HardDrive className="w-4 h-4 text-[#4247d2]" />
              <span>{product.specs.storage.size}GB {product.specs.storage.type}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Monitor className="w-4 h-4 text-[#4247d2]" />
              <span>{product.specs.display.size}" {product.specs.display.resolutionName}</span>
            </div>
          </div>

          {/* GPU dedicada badge */}
          {product.specs.gpu.type === 'dedicated' && (
            <Chip
              size="sm"
              variant="flat"
              className="bg-[#22c55e]/10 text-[#22c55e] font-medium"
            >
              {product.specs.gpu.brand} {product.specs.gpu.model}
            </Chip>
          )}
          
          {/* Uso recomendado */}
          <div className="flex flex-wrap gap-1 mt-3">
            {product.usageRecommended.slice(0, 2).map((usage) => (
              <Chip key={usage} size="sm" variant="flat" className="text-xs">
                {usage.charAt(0).toUpperCase() + usage.slice(1)}
              </Chip>
            ))}
          </div>
        </div>
      </CardBody>

      <CardFooter className="flex flex-col items-stretch gap-3 p-4 pt-0">
        {/* Precio */}
        <div>
          {product.salePrice && product.listPrice > product.salePrice && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-500 line-through">
                S/{product.listPrice.toLocaleString()}
              </p>
              <Chip size="sm" className="bg-[#ef4444]/10 text-[#ef4444] text-xs">
                Ahorras S/{product.discount}
              </Chip>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[#4247d2]">
              S/{lowestQuota.amount}
            </p>
            <p className="text-sm text-neutral-600">/mes</p>
          </div>
          <p className="text-xs text-neutral-500">
            Precio total: S/{(product.salePrice || product.listPrice).toLocaleString()}
          </p>
        </div>

        {/* Botón */}
        <Button
          color="primary"
          className="w-full bg-[#4247d2] font-semibold"
          onPress={() => onViewDetails?.(product.id)}
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  );
};
```

---

## 9. URLs de Acceso

| Ruta | Descripción |
|------|-------------|
| `/prototipos/0.4/catalogo` | Redirect a preview |
| `/prototipos/0.4/catalogo/catalog-preview` | Preview configurable con Settings Modal |
| `/prototipos/0.4/catalogo/catalog-v1` | V1: Foto Producto (specs técnicas) |
| `/prototipos/0.4/catalogo/catalog-v2` | V2: Foto Lifestyle (beneficios) |
| `/prototipos/0.4/catalogo/catalog-v3` | V3: Ilustración Flat (híbrido) |
| `/prototipos/0.4/catalogo/catalog-v4` | V4: Abstracto Flotante (fintech) |
| `/prototipos/0.4/catalogo/catalog-v5` | V5: Split 50/50 (equilibrado) |
| `/prototipos/0.4/catalogo/catalog-v6` | V6: Centrado (impacto máximo) |
| `/prototipos/0.4/catalogo/catalog-v7` | V7: Asimétrico Bold (disruptivo) |
| `/prototipos/0.4/catalogo/catalog-v8` | V8: Data-Driven (stats) |
| `/prototipos/0.4/catalogo/catalog-v9` | V9: Storytelling (narrativa) |
| `/prototipos/0.4/catalogo/catalog-v10` | V10: Interactivo (calculadora) |

---

## 10. Checklist de Entregables

### Tipos y Datos
- [ ] `types/product.ts` - Tipos completos de producto + ProductCardConfig
- [ ] `data/mockProducts.ts` - 6-12 productos de prueba variados

### Card Principal (6 versiones)
- [ ] `ProductCard.tsx` - Wrapper con versión configurable (1-10)
- [ ] `ProductCardV1.tsx` - Foto Producto (specs técnicas)
- [ ] `ProductCardV2.tsx` - Foto Lifestyle (beneficios)
- [ ] `ProductCardV3.tsx` - Ilustración Flat (híbrido)
- [ ] `ProductCardV4.tsx` - Abstracto Flotante (fintech)
- [ ] `ProductCardV5.tsx` - Split 50/50 (horizontal)
- [ ] `ProductCardV6.tsx` - Centrado (impacto máximo)
- [ ] `ProductCardV7.tsx` - Asimétrico Bold (disruptivo)
- [ ] `ProductCardV8.tsx` - Data-Driven (stats)
- [ ] `ProductCardV9.tsx` - Storytelling (narrativa)
- [ ] `ProductCardV10.tsx` - Interactivo (calculadora)

### Componentes Compartidos
- [ ] `CardImage.tsx` - Imagen con badges (6 versiones de estilo)
- [ ] `CardBadges.tsx` - Sistema de badges (6 versiones posición + 10 colores)
- [ ] `CardSpecs.tsx` - Specs técnicas con iconos
- [ ] `CardBenefits.tsx` - Beneficios/uso
- [ ] `CardPricing.tsx` - Precio y cuota prominente
- [ ] `CardActions.tsx` - Botones ver detalles, favorito
- [ ] `CardHoverContent.tsx` - Contenido hover (6 versiones)
- [ ] `CardSkeleton.tsx` - Loading state

### Badges Individuales
- [ ] `DiscountBadge.tsx` - -S/200
- [ ] `StockBadge.tsx` - Stock limitado (6 versiones)
- [ ] `NewBadge.tsx` - Nuevo
- [ ] `PopularBadge.tsx` - Popular
- [ ] `ConditionBadge.tsx` - Nuevo/Reacondicionado
- [ ] `FeatureBadge.tsx` - GPU, RAM expandible

### Interacciones
- [ ] `FavoriteButton.tsx` - 6 versiones de favorito
- [ ] `CompareCheckbox.tsx` - Agregar a comparador
- [ ] `QuickViewButton.tsx` - Vista rápida

### Páginas
- [ ] `page.tsx` - Redirect a preview
- [ ] `catalog-preview/page.tsx` - Preview con Settings Modal
- [ ] `catalog-v1/page.tsx` a `catalog-v10/page.tsx` - 10 páginas standalone

### Documentación
- [ ] `CARDS_README.md` - Documentación del módulo
- [ ] `CardSettingsModal.tsx` - Modal con 10 selectores de versión

---

## 11. Notas Importantes

1. **Cuota prominente**: Siempre más grande que precio total
2. **Ahorro en monto**: "Ahorras S/200" no "-15%"
3. **Nombre descriptivo**: "Laptop Lenovo 15.6"" no "V15 G4 AMN"
4. **Máximo 4 specs**: CPU, RAM, SSD, Pantalla. GPU solo si dedicada.
5. **Mobile-First**: Card debe verse bien en 375px
6. **Sin gradientes**: Fondos sólidos
7. **Sin emojis**: Solo Lucide icons
8. **Imágenes Unsplash**: Para prototipos
