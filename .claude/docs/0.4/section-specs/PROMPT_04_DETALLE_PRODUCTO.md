# Prompt #4: Detalle de Producto - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 24 |
| **Iteraciones T (10 versiones)** | 12 |
| **Iteraciones F (1 versión)** | 12 |
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

## 3. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/producto/
├── page.tsx                              # Redirect a preview
├── [slug]/
│   └── page.tsx                          # Detalle dinámico
├── detail-preview/
│   └── page.tsx                          # Preview con Settings Modal (10 opciones)
├── detail-v1/page.tsx                    # V1: Foto Producto
├── detail-v2/page.tsx                    # V2: Foto Lifestyle
├── detail-v3/page.tsx                    # V3: Ilustración Flat
├── detail-v4/page.tsx                    # V4: Abstracto Flotante
├── detail-v5/page.tsx                    # V5: Split 50/50
├── detail-v6/page.tsx                    # V6: Centrado Hero
├── detail-v7/page.tsx                    # V7: Asimétrico Bold
├── detail-v8/page.tsx                    # V8: Data-Driven
├── detail-v9/page.tsx                    # V9: Storytelling
├── detail-v10/page.tsx                   # V10: Interactivo
├── components/
│   └── detail/
│       ├── ProductDetail.tsx             # Wrapper principal
│       ├── DetailSettingsModal.tsx       # Modal configuración (10 selectores)
│       ├── gallery/
│       │   ├── ProductGalleryV1.tsx      # V1: Thumbnails laterales
│       │   ├── ProductGalleryV2.tsx      # V2: Thumbnails inferiores
│       │   ├── ProductGalleryV3.tsx      # V3: Carousel con dots
│       │   ├── ProductGalleryV4.tsx      # V4: Floating preview
│       │   ├── ProductGalleryV5.tsx      # V5: Split con zoom
│       │   ├── ProductGalleryV6.tsx      # V6: Fullscreen hero
│       │   ├── ProductGalleryV7.tsx      # V7: Masonry grid
│       │   ├── ProductGalleryV8.tsx      # V8: Con stats overlay
│       │   ├── ProductGalleryV9.tsx      # V9: Con context story
│       │   └── ProductGalleryV10.tsx     # V10: 360° interactive
│       ├── tabs/
│       │   └── DetailTabsV[1-10].tsx     # 10 versiones de tabs
│       ├── specs/
│       │   └── SpecsDisplayV[1-10].tsx   # 10 versiones de specs
│       ├── pricing/
│       │   ├── PricingCalculatorV[1-10].tsx
│       │   ├── PaymentSchedule.tsx
│       │   └── PriceComparison.tsx
│       ├── similar/
│       │   └── SimilarProductsV[1-10].tsx
│       ├── honesty/
│       │   └── ProductLimitationsV[1-10].tsx
│       └── certifications/
│           └── CertificationsV[1-10].tsx
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

#### B.67 [ITERAR - 10 versiones]
**¿Qué tabs/secciones debe tener el detalle?**
- **V1**: Tabs horizontales clásicos (Specs | Descripción | Cronograma | Reviews)
- **V2**: Acordeón colapsable (todo visible, expandible)
- **V3**: Scroll continuo con navegación sticky lateral (ilustración flat)
- **V4**: Tabs con iconos animados y transiciones suaves (fintech)
- **V5**: Layout split: info izquierda, tabs derecha (50/50)
- **V6**: Una sola página larga, sin tabs (centrado impacto)
- **V7**: Tabs verticales laterales con contenido asimétrico (bold)
- **V8**: Tabs con badges de cantidad (ej: "Reviews (23)") (data-driven)
- **V9**: Secciones como capítulos de historia (storytelling)
- **V10**: Tabs con preview on hover antes de seleccionar (interactivo)

#### B.68 [ITERAR - 10 versiones]
**¿Debe haber galería de fotos con zoom?**
- **V1**: Thumbnails laterales + zoom en modal lightbox
- **V2**: Thumbnails inferiores + zoom inline (hover)
- **V3**: Carousel swipeable + pinch-to-zoom (mobile-first)
- **V4**: Galería con preview flotante sutil (fintech)
- **V5**: Split: imagen grande izq + thumbnails der (50/50)
- **V6**: Hero fullscreen + galería como overlay (impacto)
- **V7**: Masonry grid asimétrica (bold)
- **V8**: Galería con stats overlay (vistas, favoritos) (data)
- **V9**: Galería con captions tipo historia (storytelling)
- **V10**: Visor 360° interactivo + hotspots clickeables (interactivo)

#### B.69 [ITERAR - 10 versiones]
**¿El cronograma de pagos debe ser interactivo?**
- **V1**: Slider de plazo + tabla de cuotas tradicional
- **V2**: Botones de plazo (12/18/24/36/48) + calendario visual
- **V3**: Input libre + cálculo instantáneo minimalista
- **V4**: Cards flotantes por plazo con animación (fintech)
- **V5**: Split: calculator izq + schedule der (50/50)
- **V6**: Cronograma grande centrado, plazo prominente (impacto)
- **V7**: Timeline visual con cuotas en posiciones asimétricas (bold)
- **V8**: Dashboard con gráficos de amortización (data-driven)
- **V9**: "Tu historia de pagos": timeline narrativo (storytelling)
- **V10**: Calculadora gamificada con progreso visual (interactivo)

#### B.70 [ITERAR - 10 versiones]
**¿Debe mostrarse 'Productos similares'?**
- **V1**: Carousel horizontal (4 productos, arrows)
- **V2**: Grid 3 columnas debajo del detalle
- **V3**: Panel lateral flotante "Compara con..."
- **V4**: Cards flotantes con hover preview (fintech)
- **V5**: Split: producto actual vs alternativas (50/50)
- **V6**: Modal con comparación lado a lado (impacto)
- **V7**: Productos como collage visual (asimétrico)
- **V8**: Tabla comparativa con scores (data-driven)
- **V9**: "Otros eligieron también..." con testimonios (storytelling)
- **V10**: Quiz interactivo "¿Es este el indicado?" (interactivo)

---

### 4.2 Specs (4 preguntas)

#### B.71 [ITERAR - 10 versiones]
**¿Cómo organizar las specs por categorías?**
- **V1**: Tabla con headers de sección (Procesador, Memoria, Pantalla...)
- **V2**: Cards individuales por categoría con iconos
- **V3**: Lista colapsable tipo acordeón (flat)
- **V4**: Grid de chips flotantes por categoría (fintech)
- **V5**: Split: categorías izq, specs der (50/50)
- **V6**: Una sola lista larga con separadores (centrado)
- **V7**: Categorías como bloques visuales asimétricos (bold)
- **V8**: Specs con ratings/scores por categoría (data-driven)
- **V9**: Specs como timeline de características (storytelling)
- **V10**: Filtro interactivo por categoría (interactivo)

#### B.72 [ITERAR - 10 versiones]
**¿Las specs como tabla, lista, o cards?**
- **V1**: Tabla 2 columnas clásica (Spec | Valor)
- **V2**: Cards grid con icono + label + valor
- **V3**: Lista con iconos inline minimalista
- **V4**: Chips flotantes con valores (fintech)
- **V5**: Tabla dividida en 2 columnas de contenido (split)
- **V6**: Lista centrada con valores prominentes (impacto)
- **V7**: Cards de tamaños variados (asimétrico)
- **V8**: Tabla con barras de comparación visual (data)
- **V9**: Cards con descripciones narrativas (storytelling)
- **V10**: Tabla con toggles de detalle expandible (interactivo)

#### B.73 [ITERAR - 10 versiones]
**¿Mostrar todos los campos de specs o solo relevantes?**
- **V1**: Todos los campos organizados (50+)
- **V2**: Top 15 + "Ver todas las especificaciones"
- **V3**: Agrupados por relevancia (Esencial / Avanzado / Técnico)
- **V4**: Specs destacados flotantes + resto colapsado (fintech)
- **V5**: Esenciales izq, avanzados der (split)
- **V6**: Solo 5 specs gigantes, resto en detalle (impacto)
- **V7**: Specs principales grandes + pequeños (asimétrico)
- **V8**: Ranking de specs por importancia con % (data)
- **V9**: "Lo que necesitas saber" + "Para expertos" (storytelling)
- **V10**: Filtros para ver specs por nivel técnico (interactivo)

#### B.74 [ITERAR - 10 versiones]
**¿Los campos técnicos deben tener tooltips?**
- **V1**: Icono (?) con tooltip al hover
- **V2**: Link "¿Qué significa?" abre modal
- **V3**: Texto explicativo siempre visible debajo
- **V4**: Tooltip flotante con animación suave (fintech)
- **V5**: Panel de ayuda lateral fijo (split)
- **V6**: Modal centralizado con explicación completa (impacto)
- **V7**: Popover asimétrico con ilustración (bold)
- **V8**: Tooltip con comparativa vs promedio (data)
- **V9**: "En palabras simples..." con analogías (storytelling)
- **V10**: Chat inline "Pregúntame sobre esta spec" (interactivo)

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

#### B.77 [ITERAR - 10 versiones]
**¿Mostrar puntos_debiles (limitaciones honestas)?**
- **V1**: Sección "Considera que..." con lista visible
- **V2**: Collapsible "Ver limitaciones" (menos prominente)
- **V3**: Tooltips en specs afectados (ej: "RAM no expandible")
- **V4**: Badge flotante "Info importante" (fintech discreto)
- **V5**: Panel lateral fijo con consideraciones (split)
- **V6**: Modal "Antes de decidir..." (impacto honesto)
- **V7**: Notas asimétricas junto a specs relevantes (bold)
- **V8**: Tabla comparativa "vs alternativas" (data)
- **V9**: "Lo que otros usuarios comentan..." (storytelling)
- **V10**: Checklist interactivo "¿Es para ti?" (interactivo)

#### B.78 [DEFINIDO]
**¿Cómo presentar limitaciones sin sonar negativo?**
→ Framing positivo: "Optimizado para..." en vez de "No tiene..."

---

### 4.5 Comparables (2 preguntas)

#### B.79 [ITERAR - 10 versiones]
**¿Mostrar productos comparables de la competencia?**
- **V1**: Solo productos BaldeCash similares
- **V2**: Mención texto "Similar a Dell XPS" sin link
- **V3**: Comparativa con productos externos (más transparente)
- **V4**: Badge flotante "Equivalente a..." (fintech)
- **V5**: Panel lateral con alternativas internas/externas (split)
- **V6**: Modal de comparación detallada (impacto)
- **V7**: Collage visual de alternativas (asimétrico)
- **V8**: Tabla con specs vs competencia (data-driven)
- **V9**: "Si buscas un [Dell XPS]..." con storytelling
- **V10**: Selector interactivo de comparación (interactivo)

#### B.80 [ITERAR - 10 versiones]
**¿Comparables de BaldeCash o mencionar competencia?**
- **V1**: Solo BaldeCash (enfoque interno)
- **V2**: BaldeCash + referencia a equivalentes del mercado
- **V3**: Tabla comparativa con competidores externos
- **V4**: Cards BaldeCash + badges "como [marca]" (fintech)
- **V5**: Split: nuestros productos vs mercado (50/50)
- **V6**: Solo mejores de BaldeCash destacados (impacto)
- **V7**: Mix visual productos + referencias (asimétrico)
- **V8**: Benchmark vs top 5 del mercado (data)
- **V9**: "Por qué elegimos este modelo..." (storytelling)
- **V10**: Quiz "¿Qué buscas?" con resultados (interactivo)

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

#### B.83 [ITERAR - 10 versiones]
**¿Cuántas imágenes mostrar en la galería?**
- **V1**: Todas las disponibles (scroll horizontal)
- **V2**: 5 principales + "Ver más fotos"
- **V3**: Hero grande + thumbnails bajo demanda
- **V4**: 3 flotantes + galería en modal (fintech)
- **V5**: Split: 2 principales + resto lateral (50/50)
- **V6**: Solo 1 hero gigante (máximo impacto)
- **V7**: Masonry con cantidades variables (asimétrico)
- **V8**: Grid con contador "12 fotos" (data)
- **V9**: "Conoce tu laptop" - revelado progresivo (storytelling)
- **V10**: Galería interactiva con zoom por áreas (interactivo)

#### B.84 [ITERAR - 10 versiones]
**¿La imagen hero más grande que las de galería?**
- **V1**: Hero 60% ancho, thumbnails pequeños lateral
- **V2**: Hero 50/50 con info lado derecho
- **V3**: Hero fullwidth, thumbnails overlay inferior
- **V4**: Hero con sombra flotante, thumbnails dots (fintech)
- **V5**: Hero izq 50% + info + thumbs der (split)
- **V6**: Hero 100% viewport, nada más (impacto)
- **V7**: Hero inclinado + thumbs en zigzag (asimétrico)
- **V8**: Hero con stats overlay + thumbs grid (data)
- **V9**: Hero con caption + thumbs como timeline (story)
- **V10**: Hero con hotspots + thumbs como selector (interactivo)

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

#### B.89 [ITERAR - 10 versiones]
**¿Mostrar certificaciones con logos o solo texto?**
- **V1**: Solo logos pequeños (Energy Star, EPEAT, MIL-STD)
- **V2**: Logos + nombre + tooltip con descripción
- **V3**: Cards expandibles con detalle de certificación
- **V4**: Logos flotantes con hover info (fintech)
- **V5**: Panel lateral con certificaciones (split)
- **V6**: Badges prominentes centrados (impacto)
- **V7**: Logos en posiciones asimétricas (bold)
- **V8**: Logos con scores/ratings verificados (data)
- **V9**: "Por qué importa..." con explicaciones (storytelling)
- **V10**: Certificaciones interactivas expandibles (interactivo)

---

## 5. Tipos TypeScript

```typescript
// types/detail.ts

export interface ProductDetailConfig {
  // B.67 - Tabs/secciones
  tabsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.68 - Galería de fotos
  galleryVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.69 - Cronograma de pagos
  pricingVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.70 - Productos similares
  similarProductsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.71 - Organización de specs
  specsOrganizationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.72 - Display de specs
  specsDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.73 - Cantidad de specs
  specsAmountVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.74 - Tooltips técnicos
  tooltipsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.77 - Limitaciones
  limitationsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.79/B.80 - Comparables
  comparablesVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.83 - Cantidad de imágenes
  imagesAmountVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.84 - Tamaño de imagen hero
  heroSizeVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.89 - Certificaciones
  certificationsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
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
- [ ] `types/detail.ts` - ProductDetailConfig con 13 selectores de versión
- [ ] `ProductDetail.tsx` - Wrapper principal
- [ ] `DetailSettingsModal.tsx` - Modal con 13 selectores (1-10)

### Galería (10 versiones)
- [ ] `ProductGalleryV1.tsx` a `ProductGalleryV10.tsx`

### Tabs/Secciones (10 versiones)
- [ ] `DetailTabsV1.tsx` a `DetailTabsV10.tsx`

### Specs (10 versiones x 3 aspectos)
- [ ] `SpecsOrganizationV1.tsx` a `V10.tsx` (B.71)
- [ ] `SpecsDisplayV1.tsx` a `V10.tsx` (B.72)
- [ ] `SpecsAmountV1.tsx` a `V10.tsx` (B.73)
- [ ] `SpecsTooltipsV1.tsx` a `V10.tsx` (B.74)

### Pricing (10 versiones)
- [ ] `PricingCalculatorV1.tsx` a `V10.tsx`
- [ ] `PaymentSchedule.tsx` (compartido)

### Productos Similares (10 versiones)
- [ ] `SimilarProductsV1.tsx` a `V10.tsx`

### Honestidad/Limitaciones (10 versiones)
- [ ] `ProductLimitationsV1.tsx` a `V10.tsx`

### Comparables (10 versiones)
- [ ] `ComparablesV1.tsx` a `V10.tsx`

### Imágenes (10 versiones x 2 aspectos)
- [ ] `ImagesGalleryV1.tsx` a `V10.tsx` (B.83)
- [ ] `HeroImageV1.tsx` a `V10.tsx` (B.84)

### Certificaciones (10 versiones)
- [ ] `CertificationsV1.tsx` a `V10.tsx`

### Páginas
- [ ] `page.tsx` - Redirect a preview
- [ ] `detail-preview/page.tsx` - Preview con Settings Modal
- [ ] `detail-v1/page.tsx` a `detail-v10/page.tsx` - 10 páginas standalone
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
