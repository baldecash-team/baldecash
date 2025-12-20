# Prompt #4: Detalle de Producto - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 24 |
| **Versiones por componente** | 6 |
| **Preguntas DEFINIDO** | 12 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El detalle de producto es la página donde el usuario toma la decisión final antes de iniciar la solicitud. Debe mostrar toda la información relevante de forma clara, organizada y persuasiva, sin abrumar.

### Insights UX/UI
- **Página completa** (no modal): permite más espacio para información
- **Galería con zoom**: esencial para laptops
- **Cronograma interactivo**: cambiar plazo y ver cuota en tiempo real
- **Productos similares**: cross-sell y comparación
- **Transparencia**: mostrar limitaciones de forma honesta pero positiva

---

## 2. Stack Tecnológico

```json
{
  "framework": "Next.js 14+",
  "ui_library": "@nextui-org/react v2.6.11",
  "icons": "lucide-react",
  "styling": "Tailwind CSS v4"
}
```

---

## 3. Estructura de Archivos (6 versiones)

```
src/app/prototipos/0.4/producto/
├── page.tsx                              # Redirect a preview
├── [slug]/
│   └── page.tsx                          # Detalle dinámico
├── detail-preview/
│   └── page.tsx                          # Preview con modal de configuracion
├── components/
│   └── detail/
│       ├── ProductDetail.tsx             # Wrapper principal
│       ├── DetailSettingsModal.tsx       # Modal configuración (10 selectores)
│       ├── gallery/
│       │   └── ProductGalleryV[1-6].tsx  # 6 versiones de galería
│       ├── tabs/
│       │   └── DetailTabsV[1-6].tsx      # 6 versiones de tabs
│       ├── specs/
│       │   └── SpecsDisplayV[1-6].tsx    # 6 versiones de specs
│       ├── pricing/
│       │   ├── PricingCalculatorV[1-6].tsx
│       │   ├── PaymentSchedule.tsx
│       │   └── PriceComparison.tsx
│       ├── similar/
│       │   └── SimilarProductsV[1-6].tsx
│       ├── honesty/
│       │   └── ProductLimitationsV[1-6].tsx
│       └── certifications/
│           └── CertificationsV[1-6].tsx
├── types/
│   └── detail.ts
└── DETAIL_README.md
```

---

## 4. Preguntas del Segmento B - Detalle

### 4.1 Layout (5 preguntas)

#### B.66 [DEFINIDO]
**¿El detalle debe abrirse en modal, página nueva, o expandir la card?**
→ **Página nueva** para ver todo el detalle del producto

#### B.67 [ITERAR - 6 versiones]
**¿Qué tabs/secciones debe tener el detalle?**
- **V1**: Tabs horizontales clásicos (Specs | Descripción | Cronograma | Reviews) - Foto Producto
- **V2**: Acordeón colapsable (todo visible, expandible) - Foto Lifestyle
- **V3**: Scroll continuo con navegación sticky lateral - Ilustración Flat
- **V4**: Tabs con iconos animados y transiciones suaves, badges de cantidad - Fintech/Data
- **V5**: Layout split: info izquierda, tabs derecha, tabs verticales - Bold/Impact
- **V6**: Tabs con preview on hover, contenido interactivo - Interactivo

#### B.68 [ITERAR - 6 versiones]
**¿Debe haber galería de fotos con zoom?**
- **V1**: Thumbnails laterales + zoom en modal lightbox - Foto Producto
- **V2**: Thumbnails inferiores + zoom inline (hover) - Foto Lifestyle
- **V3**: Carousel swipeable + pinch-to-zoom (mobile-first) - Ilustración Flat
- **V4**: Galería con preview flotante + stats overlay (vistas, favoritos) - Fintech/Data
- **V5**: Hero fullscreen + masonry grid asimétrica + galería overlay - Bold/Impact
- **V6**: Visor 360° interactivo + hotspots clickeables + captions - Interactivo

#### B.69 [ITERAR - 6 versiones]
**¿El cronograma de pagos debe ser interactivo?**
- **V1**: Slider de plazo + tabla de cuotas tradicional - Foto Producto
- **V2**: Botones de plazo (6/12/18/24) + calendario visual - Foto Lifestyle
- **V3**: Input libre + cálculo instantáneo minimalista - Ilustración Flat
- **V4**: Cards flotantes por plazo con animación + gráficos amortización - Fintech/Data
- **V5**: Timeline visual con cuotas asimétricas, cronograma prominente - Bold/Impact
- **V6**: Calculadora gamificada con progreso visual, slider interactivo - Interactivo

#### B.70 [ITERAR - 6 versiones]
**¿Debe mostrarse 'Productos similares'?**
- **V1**: Carousel horizontal (4 productos, arrows) - Foto Producto
- **V2**: Grid 3 columnas debajo del detalle - Foto Lifestyle
- **V3**: Panel lateral flotante "Compara con..." - Ilustración Flat
- **V4**: Cards flotantes con hover preview + tabla comparativa con scores - Fintech/Data
- **V5**: Productos como collage visual + modal comparación lado a lado - Bold/Impact
- **V6**: Quiz interactivo "¿Es este el indicado?" + testimonios - Interactivo

---

### 4.2 Specs (4 preguntas)

#### B.71 [ITERAR - 6 versiones]
**¿Cómo organizar las specs por categorías?**
- **V1**: Tabla con headers de sección (Procesador, Memoria, Pantalla...) - Foto Producto
- **V2**: Cards individuales por categoría con iconos - Foto Lifestyle
- **V3**: Lista colapsable tipo acordeón - Ilustración Flat
- **V4**: Grid de chips flotantes por categoría - Fintech/Data
- **V5**: Split: categorías izq, specs der (50/50) - Bold/Impact
- **V6**: Filtro interactivo por categoría - Interactivo

#### B.72 [ITERAR - 6 versiones]
**¿Las specs como tabla, lista, o cards?**
- **V1**: Tabla 2 columnas clásica (Spec | Valor) - Foto Producto
- **V2**: Cards grid con icono + label + valor - Foto Lifestyle
- **V3**: Lista con iconos inline minimalista - Ilustración Flat
- **V4**: Chips flotantes con valores - Fintech/Data
- **V5**: Tabla dividida en 2 columnas de contenido - Bold/Impact
- **V6**: Tabla con toggles de detalle expandible - Interactivo

#### B.73 [ITERAR - 6 versiones]
**¿Mostrar todos los campos de specs o solo relevantes?**
- **V1**: Todos los campos organizados (50+) - Foto Producto
- **V2**: Top 15 + "Ver todas las especificaciones" - Foto Lifestyle
- **V3**: Agrupados por relevancia (Esencial / Avanzado / Técnico) - Ilustración Flat
- **V4**: Specs destacados flotantes + resto colapsado - Fintech/Data
- **V5**: Esenciales izq, avanzados der - Bold/Impact
- **V6**: Filtros para ver specs por nivel técnico - Interactivo

#### B.74 [ITERAR - 6 versiones]
**¿Los campos técnicos deben tener tooltips?**
- **V1**: Icono (?) con tooltip al hover - Foto Producto
- **V2**: Link "¿Qué significa?" abre modal - Foto Lifestyle
- **V3**: Texto explicativo siempre visible debajo - Ilustración Flat
- **V4**: Tooltip flotante con animación suave - Fintech/Data
- **V5**: Panel de ayuda lateral fijo - Bold/Impact
- **V6**: Chat inline "Pregúntame sobre esta spec" - Interactivo

---

### 4.3 Puertos (2 preguntas)

#### B.75 [DEFINIDO]
**¿Diagrama visual de puertos disponibles?**
→ Ilustración mostrando ubicación de puertos (izq/der/posterior)

#### B.76 [DEFINIDO]
**¿Listar puertos con iconos representativos?**
→ Sí, iconos de USB-C, HDMI, SD, Ethernet, etc.

---

### 4.4 Honestidad (2 preguntas)

#### B.77 [ITERAR - 6 versiones]
**¿Mostrar puntos_debiles (limitaciones honestas)?**
- **V1**: Sección "Considera que..." con lista visible - Foto Producto
- **V2**: Collapsible "Ver limitaciones" (menos prominente) - Foto Lifestyle
- **V3**: Tooltips en specs afectados (ej: "RAM no expandible") - Ilustración Flat
- **V4**: Badge flotante "Info importante" - Fintech/Data
- **V5**: Panel lateral fijo con consideraciones - Bold/Impact
- **V6**: Checklist interactivo "¿Es para ti?" - Interactivo

#### B.78 [DEFINIDO]
**¿Cómo presentar limitaciones sin sonar negativo?**
→ Framing positivo: "Optimizado para..." en vez de "No tiene..."

---

### 4.5 Comparables (2 preguntas)

#### B.79 [ITERAR - 6 versiones]
**¿Mostrar productos comparables de la competencia?**
- **V1**: Solo productos BaldeCash similares - Foto Producto
- **V2**: Mención texto "Similar a Dell XPS" sin link - Foto Lifestyle
- **V3**: Comparativa con productos externos (más transparente) - Ilustración Flat
- **V4**: Badge flotante "Equivalente a..." - Fintech/Data
- **V5**: Panel lateral con alternativas internas/externas - Bold/Impact
- **V6**: Selector interactivo de comparación - Interactivo

#### B.80 [ITERAR - 6 versiones]
**¿Comparables de BaldeCash o mencionar competencia?**
- **V1**: Solo BaldeCash (enfoque interno) - Foto Producto
- **V2**: BaldeCash + referencia a equivalentes del mercado - Foto Lifestyle
- **V3**: Tabla comparativa con competidores externos - Ilustración Flat
- **V4**: Cards BaldeCash + badges "como [marca]" - Fintech/Data
- **V5**: Split: nuestros productos vs mercado (50/50) - Bold/Impact
- **V6**: Quiz "¿Qué buscas?" con resultados - Interactivo

---

### 4.6 Marketing (2 preguntas)

#### B.81 [DEFINIDO]
**¿Mostrar descripcion_larga completa o resumida?**
→ Resumida con "Ver más" para expandir

#### B.82 [DEFINIDO]
**¿Los key_features deben tener iconos asociados?**
→ Sí, iconos ilustrativos para cada feature

---

### 4.7 Imágenes (2 preguntas)

#### B.83 [ITERAR - 6 versiones]
**¿Cuántas imágenes mostrar en la galería?**
- **V1**: Todas las disponibles (scroll horizontal) - Foto Producto
- **V2**: 5 principales + "Ver más fotos" - Foto Lifestyle
- **V3**: Hero grande + thumbnails bajo demanda - Ilustración Flat
- **V4**: 3 flotantes + galería en modal - Fintech/Data
- **V5**: Split: 2 principales + resto lateral (50/50) - Bold/Impact
- **V6**: Galería interactiva con zoom por áreas - Interactivo

#### B.84 [ITERAR - 6 versiones]
**¿La imagen hero más grande que las de galería?**
- **V1**: Hero 60% ancho, thumbnails pequeños lateral - Foto Producto
- **V2**: Hero 50/50 con info lado derecho - Foto Lifestyle
- **V3**: Hero fullwidth, thumbnails overlay inferior - Ilustración Flat
- **V4**: Hero con sombra flotante, thumbnails dots - Fintech/Data
- **V5**: Hero izq 50% + info + thumbs der - Bold/Impact
- **V6**: Hero con hotspots + thumbs como selector - Interactivo

---

### 4.8 Software (2 preguntas)

#### B.85 [DEFINIDO]
**¿Mostrar software preinstalado?**
→ Sí, en sección "Software incluido" con iconos

#### B.86 [DEFINIDO]
**¿Indicar claramente si incluye Windows o FreeDOS?**
→ Prominente: badge "Con Windows 11" o "Sin sistema operativo"

---

### 4.9 Batería (2 preguntas)

#### B.87 [DEFINIDO]
**¿Mostrar duración estimada de batería?**
→ Prominente: "Hasta 8 horas de uso"

#### B.88 [DEFINIDO]
**¿Indicar carga rápida y watts?**
→ Sí, "Carga rápida 65W (50% en 30 min)"

---

### 4.10 Certificaciones (1 pregunta)

#### B.89 [ITERAR - 6 versiones]
**¿Mostrar certificaciones con logos o solo texto?**
- **V1**: Solo logos pequeños (Energy Star, EPEAT, MIL-STD) - Foto Producto
- **V2**: Logos + nombre + tooltip con descripción - Foto Lifestyle
- **V3**: Cards expandibles con detalle de certificación - Ilustración Flat
- **V4**: Logos flotantes con hover info - Fintech/Data
- **V5**: Panel lateral con certificaciones - Bold/Impact
- **V6**: Certificaciones interactivas expandibles - Interactivo

---

## 5. Tipos TypeScript

```typescript
// types/detail.ts

export interface ProductDetailConfig {
  // B.67 - Tabs/secciones
  tabsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.68 - Galería de fotos
  galleryVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.69 - Cronograma de pagos
  pricingVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.70 - Productos similares
  similarProductsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.71 - Organización de specs
  specsOrganizationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.72 - Display de specs
  specsDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.73 - Cantidad de specs
  specsAmountVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.74 - Tooltips técnicos
  tooltipsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.77 - Limitaciones
  limitationsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.79/B.80 - Comparables
  comparablesVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.83 - Cantidad de imágenes
  imagesAmountVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.84 - Tamaño de imagen hero
  heroSizeVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.89 - Certificaciones
  certificationsVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultProductDetailConfig: ProductDetailConfig = {
  tabsVersion: 1,
  galleryVersion: 1,
  pricingVersion: 1,
  similarProductsVersion: 1,
  specsOrganizationVersion: 1,
  specsDisplayVersion: 1,
  specsAmountVersion: 1,
  tooltipsVersion: 1,
  limitationsVersion: 1,
  comparablesVersion: 1,
  imagesAmountVersion: 1,
  heroSizeVersion: 1,
  certificationsVersion: 1,
};

export interface ProductDetailTabs {
  id: string;
  label: string;
  icon: string;
  content: React.ReactNode;
}

export interface PaymentScheduleRow {
  cuotaNumber: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
  lowestQuota: number;
  matchScore: number; // 0-100%
  differentiators: string[];
}

export interface ProductLimitation {
  category: string;
  description: string;
  severity: 'info' | 'warning';
  alternative?: string;
}

export interface Certification {
  code: string;
  name: string;
  logo: string;
  description: string;
  learnMoreUrl?: string;
}
```

---

## 6. Componente de Referencia

```typescript
'use client';

import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import { Cpu, Monitor, Battery, HardDrive } from 'lucide-react';

/**
 * DetailTabsV1 - Tabs Horizontales
 *
 * Características:
 * - Tabs tradicionales arriba del contenido
 * - Transición suave entre secciones
 * - Ideal para: navegación clara entre categorías
 */

export const DetailTabsV1: React.FC<{ product: Product }> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('specs');

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(key as string)}
      classNames={{
        tabList: 'bg-neutral-100 p-1 rounded-lg',
        tab: 'px-6 py-2',
        tabContent: 'text-neutral-600 group-data-[selected=true]:text-[#4247d2]',
      }}
    >
      <Tab key="specs" title="Especificaciones">
        <Card className="mt-4">
          <CardBody>
            {/* Contenido de specs */}
          </CardBody>
        </Card>
      </Tab>
      <Tab key="description" title="Descripción">
        <Card className="mt-4">
          <CardBody>
            {/* Contenido de descripción */}
          </CardBody>
        </Card>
      </Tab>
      <Tab key="schedule" title="Cronograma">
        <Card className="mt-4">
          <CardBody>
            {/* Cronograma de pagos */}
          </CardBody>
        </Card>
      </Tab>
    </Tabs>
  );
};
```

---

## 7. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/detail.ts` - ProductDetailConfig con 13 selectores de versión (1-6)
- [ ] `ProductDetail.tsx` - Wrapper principal
- [ ] `DetailSettingsModal.tsx` - Modal con 13 selectores (1-6)

### Galería (6 versiones)
- [ ] `ProductGalleryV1.tsx` a `ProductGalleryV6.tsx`

### Tabs/Secciones (6 versiones)
- [ ] `DetailTabsV1.tsx` a `DetailTabsV6.tsx`

### Specs (6 versiones)
- [ ] `SpecsDisplayV1.tsx` a `V6.tsx`

### Pricing (6 versiones)
- [ ] `PricingCalculatorV1.tsx` a `V6.tsx`
- [ ] `PaymentSchedule.tsx` (compartido)

### Productos Similares (6 versiones)
- [ ] `SimilarProductsV1.tsx` a `V6.tsx`

### Honestidad/Limitaciones (6 versiones)
- [ ] `ProductLimitationsV1.tsx` a `V6.tsx`

### Certificaciones (6 versiones)
- [ ] `CertificationsV1.tsx` a `V6.tsx`

### Páginas
- [ ] `page.tsx` - Redirect a preview
- [ ] `detail-preview/page.tsx` - Preview con Settings Modal
- [ ] `detail-v1/page.tsx` a `detail-v6/page.tsx` - 6 páginas standalone
- [ ] `[slug]/page.tsx` - Detalle dinámico

### Documentación
- [ ] `DETAIL_README.md`

---

## 8. Notas Importantes

1. **Cronograma interactivo**: Cambiar plazo actualiza cuota en tiempo real
2. **Zoom obligatorio**: Galería debe permitir ver detalles del producto
3. **Transparencia**: Mostrar limitaciones genera confianza
4. **Cross-sell**: Productos similares aumentan engagement
5. **Mobile-First**: Galería swipeable, tabs como acordeón
6. **Sin gradientes**: Colores sólidos
7. **Sin emojis**: Solo Lucide icons
