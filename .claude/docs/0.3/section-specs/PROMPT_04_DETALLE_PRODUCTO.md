# Prompt #4: Detalle de Producto - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 24 |
| **Iteraciones T (3 versiones)** | 12 |
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

## 3. Estructura de Archivos

```
src/app/prototipos/0.2/producto/
├── page.tsx
├── [slug]/
│   └── page.tsx                          # Detalle dinámico
├── detail-preview/
│   └── page.tsx                          # Preview con settings
├── components/
│   └── detail/
│       ├── ProductDetail.tsx             # Wrapper principal
│       ├── DetailSettingsModal.tsx       # Modal configuración
│       ├── gallery/
│       │   ├── ProductGalleryV1.tsx      # Thumbnails laterales
│       │   ├── ProductGalleryV2.tsx      # Thumbnails inferiores
│       │   └── ProductGalleryV3.tsx      # Carousel con dots
│       ├── tabs/
│       │   ├── DetailTabsV1.tsx          # Tabs horizontales
│       │   ├── DetailTabsV2.tsx          # Acordeón colapsable
│       │   └── DetailTabsV3.tsx          # Scroll sections
│       ├── specs/
│       │   ├── SpecsTableV1.tsx          # Tabla tradicional
│       │   ├── SpecsCardsV2.tsx          # Cards por categoría
│       │   └── SpecsListV3.tsx           # Lista con iconos
│       ├── pricing/
│       │   ├── PricingCalculator.tsx     # Calculadora interactiva
│       │   ├── PaymentSchedule.tsx       # Cronograma de pagos
│       │   └── PriceComparison.tsx       # Comparación con/sin descuento
│       ├── similar/
│       │   ├── SimilarProductsV1.tsx     # Carousel
│       │   ├── SimilarProductsV2.tsx     # Grid 3 columnas
│       │   └── SimilarProductsV3.tsx     # Lista compacta
│       ├── honesty/
│       │   ├── ProductLimitationsV1.tsx  # Lista "Considera que..."
│       │   ├── ProductLimitationsV2.tsx  # Collapsible section
│       │   └── ProductLimitationsV3.tsx  # Tooltip en specs
│       └── certifications/
│           ├── CertificationsV1.tsx      # Solo logos
│           ├── CertificationsV2.tsx      # Logos + texto
│           └── CertificationsV3.tsx      # Cards expandibles
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

#### B.67 [ITERAR - 3 versiones]
**¿Qué tabs/secciones debe tener el detalle?**
- **V1**: Tabs horizontales (Specs | Descripción | Cronograma | Reviews)
- **V2**: Acordeón colapsable (todo visible, expandible)
- **V3**: Scroll continuo con navegación sticky lateral

#### B.68 [ITERAR - 3 versiones]
**¿Debe haber galería de fotos con zoom?**
- **V1**: Thumbnails laterales + zoom en modal
- **V2**: Thumbnails inferiores + zoom inline (hover)
- **V3**: Carousel swipeable + pinch-to-zoom (mobile-first)

#### B.69 [ITERAR - 3 versiones]
**¿El cronograma de pagos debe ser interactivo?**
- **V1**: Slider de plazo + tabla de cuotas
- **V2**: Botones de plazo (12/18/24/36/48) + calendario visual
- **V3**: Input libre + cálculo instantáneo

#### B.70 [ITERAR - 3 versiones]
**¿Debe mostrarse 'Productos similares'?**
- **V1**: Carousel horizontal (4 productos)
- **V2**: Grid 3 columnas debajo del detalle
- **V3**: Panel lateral "Compara con..."

---

### 4.2 Specs (4 preguntas)

#### B.71 [ITERAR - 3 versiones]
**¿Cómo organizar las specs por categorías?**
- **V1**: Tabla con headers de sección (Procesador, Memoria, Pantalla...)
- **V2**: Cards individuales por categoría con iconos
- **V3**: Lista colapsable tipo acordeón

#### B.72 [ITERAR - 3 versiones]
**¿Las specs como tabla, lista, o cards?**
- **V1**: Tabla 2 columnas (Spec | Valor)
- **V2**: Cards grid con icono + label + valor
- **V3**: Lista con iconos inline

#### B.73 [ITERAR - 3 versiones]
**¿Mostrar todos los campos de specs o solo relevantes?**
- **V1**: Todos los campos organizados (50+)
- **V2**: Top 15 + "Ver todas las especificaciones"
- **V3**: Agrupados por relevancia (Esencial / Avanzado / Técnico)

#### B.74 [ITERAR - 3 versiones]
**¿Los campos técnicos deben tener tooltips?**
- **V1**: Icono (?) con tooltip al hover
- **V2**: Link "¿Qué significa?" abre modal
- **V3**: Texto explicativo siempre visible debajo

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

#### B.77 [ITERAR - 3 versiones]
**¿Mostrar puntos_debiles (limitaciones honestas)?**
- **V1**: Sección "Considera que..." con lista
- **V2**: Collapsible "Ver limitaciones" (menos prominente)
- **V3**: Tooltips en specs afectados (ej: "RAM no expandible")

#### B.78 [DEFINIDO]
**¿Cómo presentar limitaciones sin sonar negativo?**
→ Framing positivo: "Optimizado para..." en vez de "No tiene..."

---

### 4.5 Comparables (2 preguntas)

#### B.79 [ITERAR - 3 versiones]
**¿Mostrar productos comparables de la competencia?**
- **V1**: Solo productos BaldeCash similares
- **V2**: Mención texto "Similar a Dell XPS" sin link
- **V3**: Comparativa con productos externos (más transparente)

#### B.80 [ITERAR - 3 versiones]
**¿Comparables de BaldeCash o mencionar competencia?**
- **V1**: Solo BaldeCash (enfoque interno)
- **V2**: BaldeCash + referencia a equivalentes del mercado
- **V3**: Tabla comparativa con competidores

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

#### B.83 [ITERAR - 3 versiones]
**¿Cuántas imágenes mostrar en la galería?**
- **V1**: Todas las disponibles (scroll horizontal)
- **V2**: 5 principales + "Ver más fotos"
- **V3**: Hero grande + thumbnails bajo demanda

#### B.84 [ITERAR - 3 versiones]
**¿La imagen hero más grande que las de galería?**
- **V1**: Hero 60% ancho, thumbnails pequeños
- **V2**: Hero 50/50 con info
- **V3**: Hero fullwidth, thumbnails overlay

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

#### B.89 [ITERAR - 3 versiones]
**¿Mostrar certificaciones con logos o solo texto?**
- **V1**: Solo logos pequeños (Energy Star, EPEAT, MIL-STD)
- **V2**: Logos + nombre + tooltip con descripción
- **V3**: Cards expandibles con detalle de certificación

---

## 5. Tipos TypeScript

```typescript
// types/detail.ts

export interface ProductDetailConfig {
  tabsVersion: 1 | 2 | 3;
  galleryVersion: 1 | 2 | 3;
  specsDisplayVersion: 1 | 2 | 3;
  specsOrganizationVersion: 1 | 2 | 3;
  tooltipsVersion: 1 | 2 | 3;
  limitationsVersion: 1 | 2 | 3;
  comparablesVersion: 1 | 2 | 3;
  similarProductsVersion: 1 | 2 | 3;
  certificationsVersion: 1 | 2 | 3;
}

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

- [ ] `types/detail.ts`
- [ ] `ProductDetail.tsx` - Wrapper principal
- [ ] `DetailSettingsModal.tsx`
- [ ] `ProductGalleryV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `DetailTabsV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `SpecsTableV1.tsx`, `SpecsCardsV2.tsx`, `SpecsListV3.tsx`
- [ ] `PricingCalculator.tsx`
- [ ] `PaymentSchedule.tsx`
- [ ] `SimilarProductsV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `ProductLimitationsV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `CertificationsV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] Páginas de preview y standalone
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
