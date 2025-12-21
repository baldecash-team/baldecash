# Prompt #4: Detalle de Producto - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Versiones por componente** | 6 |
| **Prioridad** | Alta - MVP Core |
| **Basado en** | Feedback de 0.3 |

---

## 1. Preferencias Confirmadas (desde 0.3)

Estas son las versiones preferidas que se convierten en **V1** para 0.4:

| Componente | V preferida 0.3 | Notas |
|------------|-----------------|-------|
| **Galería** | V2 (Thumbnails inferiores) | Zoom hover inline |
| **Layout/Tabs** | V3 (Scroll continuo + nav sticky) | Revisar comportamiento mobile |
| **Limitaciones** | V2 (Collapsible) | Menos prominente, expandible |
| **Similar Products** | V3 (Panel comparación) | Enfoque en variación de cuota |
| **Specs** | V3 (Acordeón) | Corregir spacing entre subelementos |
| **Pricing** | V1 + V3 híbrido | Sin precio, solo cuota |

---

## 2. Nuevo Componente: ProductInfoHeader

### Descripción
Componente configurable para mostrar la información básica del producto:
- Badges (Windows, batería, stock)
- Marca
- Nombre del producto
- Rating y reviews
- Descripción corta

### Versiones (6)

#### V1 - Layout Actual (Badges + Info vertical)
```
[Con Windows 11 Home] [Hasta 6 horas] [15 disponibles]
Lenovo
Laptop Lenovo 15.6" para estudios - Ryzen 5
★★★★☆ 4.5 (128 opiniones)
Laptop ideal para estudios universitarios con Ryzen 5, 8GB RAM...
```

#### V2 - Layout Compacto (Mobile-optimized)
```
Lenovo • 15 disponibles
Laptop Lenovo 15.6" para estudios - Ryzen 5
[Windows 11] [6h batería]
★★★★☆ 4.5 (128)
```

#### V3 - Layout con Chips Flotantes
```
                        [Windows 11 Home ✓]
Lenovo                  [Hasta 6 horas ⚡]
Laptop Lenovo 15.6"...  [15 disponibles 📦]
★★★★☆ 4.5 (128 opiniones)
```

#### V4 - Layout Hero (Nombre prominente)
```
LENOVO
━━━━━━━━━━━━━━━━━━━━━━━━
Laptop 15.6" para estudios
Ryzen 5 • 8GB RAM • 256GB SSD
━━━━━━━━━━━━━━━━━━━━━━━━
★★★★☆ 4.5 (128) | Windows 11 | 6h batería | 15 disp.
```

#### V5 - Layout Split (Info izquierda, badges derecha)
```
Lenovo                          | [Windows 11 Home]
Laptop 15.6" para estudios      | [Hasta 6 horas]
★★★★☆ 4.5 (128 opiniones)      | [15 disponibles]
```

#### V6 - Layout Interactivo (Badges expandibles)
```
Lenovo • Laptop 15.6" para estudios - Ryzen 5
★★★★☆ 4.5 (128 opiniones)
[+ Ver especificaciones rápidas] → expande badges
```

---

## 3. Cambios en Pricing Calculator

### Cambios Obligatorios (todas las versiones):
1. **NO mostrar precio del equipo** - Solo enfocarse en la cuota
2. **Mostrar cuota tachada** cuando hay descuento aplicado
3. **Permitir elegir cuota inicial** (inicial 0%, 10%, 20%, 30%)
4. **Quitar monto total pagado** - No mostrar "Total: S/X,XXX"
5. **Quitar sección "Financiamiento"** - No mostrar costo de financiamiento

### Estructura Nueva:

```tsx
// ❌ PROHIBIDO (versión anterior)
<div>
  <p>Precio: S/2,499</p>
  <p>Cuota: S/89/mes</p>
  <p>Total: S/4,272</p>
  <p>Financiamiento: S/573</p>
</div>

// ✅ CORRECTO (versión 0.4)
<div>
  <p className="line-through text-neutral-400">S/99/mes</p>
  <p className="text-4xl font-bold text-[#4654CD]">S/89/mes</p>
  <p className="text-sm text-neutral-500">x 36 meses</p>

  <div>
    <label>Cuota inicial (opcional)</label>
    <select>0% | 10% | 20% | 30%</select>
  </div>
</div>
```

---

## 4. Cambios en Similar Products

### Cambios Obligatorios:
1. **Enfocarse en variación de cuota**: Mostrar "+S/15/mes" o "-S/10/mes" en vez de precio
2. **Quitar precio del equipo** - Solo mostrar cuota mensual
3. **Mejor uso del espacio en blanco en desktop**

### Ejemplo:

```tsx
// ❌ PROHIBIDO
<p>Precio: S/2,199</p>
<p>Cuota: S/79/mes</p>

// ✅ CORRECTO
<p className="text-[#22c55e] font-bold">-S/10/mes</p>
<p className="text-neutral-600">S/79/mes vs S/89/mes actual</p>
```

---

## 5. Cambios en Specs (Acordeón)

### Cambios Obligatorios:
1. **Corregir spacing** entre subelementos del acordeón
2. **Padding consistente** en items expandidos

```tsx
// Espaciado correcto
<AccordionItem>
  <div className="space-y-2 py-2">  // Era space-y-3 py-3 (muy espaciado)
    {specs.map(spec => (
      <div className="flex justify-between py-1.5">  // Era py-2
        <span>{spec.label}</span>
        <span>{spec.value}</span>
      </div>
    ))}
  </div>
</AccordionItem>
```

---

## 6. Estructura de Archivos (0.4)

```
src/app/prototipos/0.4/producto/
├── page.tsx                              # Redirect a preview
├── detail-preview/
│   └── page.tsx                          # Preview con Settings Modal
├── components/
│   └── detail/
│       ├── ProductDetail.tsx             # Wrapper principal
│       ├── DetailSettingsModal.tsx       # Modal configuración
│       ├── info/
│       │   ├── ProductInfoHeaderV1.tsx   # NUEVO - 6 versiones
│       │   ├── ProductInfoHeaderV2.tsx
│       │   ├── ProductInfoHeaderV3.tsx
│       │   ├── ProductInfoHeaderV4.tsx
│       │   ├── ProductInfoHeaderV5.tsx
│       │   ├── ProductInfoHeaderV6.tsx
│       │   └── index.ts
│       ├── gallery/
│       │   └── ProductGalleryV[1-6].tsx  # V1 = thumbnails inferiores
│       ├── tabs/
│       │   └── DetailTabsV[1-6].tsx      # V1 = scroll continuo
│       ├── specs/
│       │   └── SpecsDisplayV[1-6].tsx    # V1 = acordeón con spacing corregido
│       ├── pricing/
│       │   └── PricingCalculatorV[1-6].tsx # Sin precio, solo cuota
│       ├── similar/
│       │   └── SimilarProductsV[1-6].tsx # Enfoque en variación cuota
│       ├── honesty/
│       │   └── ProductLimitationsV[1-6].tsx # V1 = collapsible
│       └── certifications/
│           └── CertificationsV[1-6].tsx
├── types/
│   └── detail.ts
└── data/
    └── mockDetailData.ts
```

---

## 7. Tipos TypeScript

```typescript
// types/detail.ts

export type DetailVersion = 1 | 2 | 3 | 4 | 5 | 6;

export interface ProductDetailConfig {
  // NUEVO - Info Header
  infoHeaderVersion: DetailVersion;

  // Galería (V1 = thumbnails inferiores)
  galleryVersion: DetailVersion;

  // Tabs/Layout (V1 = scroll continuo)
  tabsVersion: DetailVersion;

  // Specs (V1 = acordeón)
  specsVersion: DetailVersion;

  // Pricing (todas sin precio, solo cuota)
  pricingVersion: DetailVersion;

  // Similar Products (enfoque cuota)
  similarProductsVersion: DetailVersion;

  // Limitaciones (V1 = collapsible)
  limitationsVersion: DetailVersion;

  // Certificaciones
  certificationsVersion: DetailVersion;
}

export const defaultDetailConfig: ProductDetailConfig = {
  infoHeaderVersion: 1,
  galleryVersion: 1,
  tabsVersion: 1,
  specsVersion: 1,
  pricingVersion: 1,
  similarProductsVersion: 1,
  limitationsVersion: 1,
  certificationsVersion: 1,
};

export const versionDescriptions = {
  infoHeader: {
    1: 'Layout actual (badges + info vertical)',
    2: 'Layout compacto (mobile-optimized)',
    3: 'Layout con chips flotantes',
    4: 'Layout hero (nombre prominente)',
    5: 'Layout split (info izq, badges der)',
    6: 'Layout interactivo (badges expandibles)',
  },
  gallery: {
    1: 'Thumbnails inferiores + zoom hover (PREFERIDO)',
    2: 'Thumbnails laterales + zoom modal',
    3: 'Carousel swipeable + pinch-to-zoom',
    4: 'Preview flotante + stats overlay',
    5: 'Hero fullscreen + masonry grid',
    6: 'Visor 360° interactivo + hotspots',
  },
  tabs: {
    1: 'Scroll continuo + nav sticky lateral (PREFERIDO)',
    2: 'Tabs horizontales clásicos',
    3: 'Acordeón colapsable',
    4: 'Tabs con iconos animados',
    5: 'Split layout (info izq, tabs der)',
    6: 'Tabs con preview on hover',
  },
  specs: {
    1: 'Acordeón con spacing corregido (PREFERIDO)',
    2: 'Cards grid por categoría',
    3: 'Tabla 2 columnas clásica',
    4: 'Chips flotantes con valores',
    5: 'Grid filtrable por nivel técnico',
    6: 'Tabla con toggles expandibles',
  },
  pricing: {
    1: 'Tabs de plazo compactos, solo cuota',
    2: 'Slider de plazo, solo cuota',
    3: 'Botones de plazo + cuota inicial',
    4: 'Cards por plazo con animación',
    5: 'Timeline visual de cuotas',
    6: 'Calculadora gamificada con progreso',
  },
  similarProducts: {
    1: 'Panel comparación con variación cuota (PREFERIDO)',
    2: 'Carousel horizontal con cuotas',
    3: 'Grid 3 columnas con delta cuota',
    4: 'Cards flotantes con hover preview',
    5: 'Collage visual + modal comparación',
    6: 'Quiz interactivo "¿Es este el indicado?"',
  },
  limitations: {
    1: 'Collapsible "Ver limitaciones" (PREFERIDO)',
    2: 'Sección visible "Considera que..."',
    3: 'Tooltips en specs afectados',
    4: 'Badge flotante "Info importante"',
    5: 'Panel lateral con consideraciones',
    6: 'Checklist interactivo "¿Es para ti?"',
  },
  certifications: {
    1: 'Logos pequeños inline',
    2: 'Logos + nombre + tooltip',
    3: 'Cards expandibles con detalle',
    4: 'Logos flotantes con hover info',
    5: 'Panel lateral con certificaciones',
    6: 'Certificaciones interactivas expandibles',
  },
};
```

---

## 8. Notas Importantes

1. **V1 siempre es la preferida** - Las otras versiones son variaciones para A/B testing
2. **Sin precio del equipo** - Solo mostrar cuota mensual
3. **Cuota tachada** - Mostrar descuento como cuota anterior tachada
4. **Cuota inicial opcional** - Selector 0%, 10%, 20%, 30%
5. **Variación de cuota** - Similar products muestra "+S/X" o "-S/X" vs producto actual
6. **Mobile-first** - Revisar comportamiento de nav sticky en mobile
7. **Modal de galería centrado** - Ver skill frontend para configuración correcta

---

## 9. Checklist de Entregables

### Componentes Nuevos
- [ ] `ProductInfoHeaderV1.tsx` a `V6.tsx` (6 versiones)

### Componentes Actualizados (de 3 a 6 versiones)
- [ ] `ProductGalleryV1.tsx` a `V6.tsx` - V1 = thumbnails inferiores
- [ ] `DetailTabsV1.tsx` a `V6.tsx` - V1 = scroll continuo
- [ ] `SpecsDisplayV1.tsx` a `V6.tsx` - V1 = acordeón
- [ ] `PricingCalculatorV1.tsx` a `V6.tsx` - SIN precio, solo cuota
- [ ] `SimilarProductsV1.tsx` a `V6.tsx` - Variación de cuota
- [ ] `ProductLimitationsV1.tsx` a `V6.tsx` - V1 = collapsible
- [ ] `CertificationsV1.tsx` a `V6.tsx`

### Infraestructura
- [ ] `types/detail.ts` - Con ProductInfoHeaderVersion
- [ ] `DetailSettingsModal.tsx` - 8 selectores de versión
- [ ] `ProductDetail.tsx` - Wrapper principal
- [ ] `page.tsx` - Preview con TokenCounter

### Documentación
- [ ] Actualizar `config.json`
- [ ] Actualizar `token-usage.json`
