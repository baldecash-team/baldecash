---
name: baldecash-web
description: |
  Crear componentes React/NextUI para BaldeCash Web 3.0, plataforma de financiamiento 
  de laptops para estudiantes universitarios en Perú. Usar cuando se pida generar 
  componentes de UI, páginas, formularios, o cualquier interfaz frontend para este 
  proyecto. Incluye brand guidelines obligatorias, 285 decisiones UX/UI predefinidas, 
  y patrones de componentes aprobados. Stack: Next.js 14+, NextUI v2.6.11, Lucide React, 
  Tailwind CSS v4, TypeScript strict mode.
---

# BaldeCash Web 3.0 - Component Generator

Skill para generar componentes frontend consistentes con la marca y decisiones UX/UI del proyecto.

## Contexto del Proyecto

BaldeCash es una fintech peruana que financia laptops para estudiantes universitarios sin acceso a banca tradicional. El 81% de aplicantes son rechazados, por lo que la UX debe ser empática y ofrecer alternativas. El 64% del tráfico es móvil.

### KPIs Objetivo
| Métrica | Target | Benchmark |
|---------|--------|-----------|
| Completitud de solicitud | >70% | Actual ~4%, fintechs LATAM 65-75% |
| Tiempo de aplicación | <3 min | Kueski: 2.5 min, Nubank: 3 min |
| Attach rate seguros | 40-50% | E-commerce electrónicos: 35-45% |
| LCP móvil 3G | <2.5s | Core Web Vitals threshold |

### Flujo de Conversión
```
HOME → CATÁLOGO → PRODUCTO [+accesorios] → SOLICITUD → APROBACIÓN [+seguros] → FIRMA
```

## Brand & Visual Guidelines

> **Ver skill `baldecash-brand`** para colores (#4654CD), tipografía (Baloo 2, Asap),
> restricciones visuales y tono de voz.
>
> **Ver `assets/tailwind-config.json`** para configuración de Tailwind con colores de marca.

## Stack Tecnológico

```json
{
  "framework": "Next.js 14+ (App Router)",
  "ui": "@nextui-org/react v2.6.11",
  "icons": "lucide-react",
  "styling": "Tailwind CSS v4",
  "language": "TypeScript (strict mode)",
  "animations": "framer-motion"
}
```

## Workflow de Generación

### Paso 1: Identificar el módulo
Determinar a qué módulo pertenece el componente:
- **A**: Hero/Landing
- **B**: Catálogo (cards, filtros, detalle, comparador)
- **C**: Formularios (wizard, campos, pasos)
- **D-E**: Upsell (accesorios, seguros)
- **F-G**: Resultados (aprobación, rechazo)

### Paso 2: Consultar decisiones UX
Leer `references/ux-decisions.md` para verificar si hay decisiones predefinidas para el componente solicitado. Las marcadas con [T] tienen 3 versiones; las marcadas con [F] tienen una sola implementación.

### Paso 3: Aplicar patrones
Consultar `references/component-patterns.md` para código de referencia y estructura de archivos.

### Paso 4: Design Thinking (antes de codificar)

Antes de escribir código, reflexionar sobre:
- **Propósito**: ¿Qué problema resuelve esta interfaz? ¿Quién la usa?
- **Tono**: BaldeCash = cercano, juvenil, confiable. No corporativo frío.
- **Diferenciación**: ¿Qué hace memorable este componente?
- **Contexto emocional**: El 81% son rechazados - diseñar con empatía.

### Paso 5: Generar con consistencia
- Usar NextUI components como base
- Aplicar colores de marca via className o Tailwind
- Incluir estados: default, hover, focus, disabled, loading, error
- Agregar aria-labels y accesibilidad
- Responsive: mobile → tablet → desktop

## Motion & Animaciones

Usar animaciones con propósito, no decorativas. Priorizar impacto sobre cantidad.

### Principios de Motion
- **Page load**: Una animación bien orquestada con staggered reveals vale más que múltiples micro-interacciones dispersas
- **Stagger delays**: Usar `animation-delay` para crear secuencias coherentes
- **Duración**: 150ms para micro-interacciones, 300ms para transiciones de layout
- **Easing**: Preferir `ease-out` para entradas, `ease-in` para salidas

### Patrones recomendados
```tsx
// Fade in con stagger para listas
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>

// Hover con escala sutil
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>

// Skeleton → Contenido
<AnimatePresence mode="wait">
  {isLoading ? <Skeleton /> : <Content />}
</AnimatePresence>
```

### Momentos de alto impacto
- Carga inicial del catálogo (stagger cards)
- Transiciones entre pasos del wizard
- Celebración de aprobación (confetti sutil)
- Feedback de validación en formularios

## Spatial Composition

### Layouts con personalidad
- **Asimetría controlada**: No todo debe estar centrado
- **Espacio negativo generoso**: Dar respiro a los elementos
- **Elementos que rompen el grid**: Badges, decoraciones sutiles
- **Jerarquía visual clara**: Un elemento dominante por sección

### Anti-patrones a evitar
```
❌ Todo centrado y simétrico
❌ Márgenes mínimos entre elementos
❌ Layouts predecibles tipo "template"
❌ Densidad uniforme en toda la página
```

## Visual Details & Fondos

Crear atmósfera y profundidad, no fondos planos.

### Técnicas permitidas (dentro de marca)
- **Fondos sutiles**: `bg-neutral-50` con patrones geométricos muy sutiles
- **Sombras con propósito**: `shadow-sm` para elevación, no decoración
- **Bordes con color**: `border-primary/20` para conectar con marca
- **Overlays**: Para imágenes de producto, usar gradientes sutiles

### Técnicas prohibidas (ver brandbook)
```
❌ Gradientes de color
❌ Fondos blancos planos sin textura
❌ Sombras excesivas (shadow-lg, shadow-xl)
❌ Efectos glassmorphism
```

## Jerarquía de Información

### Página de Producto
| Elemento | Prioridad | Justificación |
|----------|-----------|---------------|
| Cuota mensual estimada | **ALTA** | Ancla de decisión - "¿puedo pagar esto al mes?" |
| Selector de plazo (slider) | **ALTA** | Permite ajustar cuota (6-12-18-24 meses) |
| Accesorios compatibles | MEDIA | Máx 3 items, con "+S/X/mes" visible |
| Precio total | MEDIA | Visible pero secundario |

### Formulario de Solicitud
**Campos mínimos** (cada campo adicional reduce conversión ~3%):

| Paso | Campos |
|------|--------|
| **Identidad** | Nombre, DNI, Celular, Email |
| **Capacidad** | Ocupación, Ingreso mensual, Referencia personal |
| **Confirmación** | Modal con resumen (no pantalla completa) |

**Trust signals obligatorios:** "Conexión segura", "No compartimos tus datos", "Cifrado 256 bits"

## Principios de Diseño UX

### Cuota Prominente
Los estudiantes piensan en cuotas mensuales, no en precio total.
```tsx
// ✅ Correcto
<p className="text-2xl font-bold text-[#4654CD]">S/89/mes</p>
<p className="text-sm text-neutral-500">Precio total: S/2,499</p>

// ❌ Incorrecto
<p className="text-2xl font-bold">S/2,499</p>
<p className="text-sm">S/89/mes</p>
```

### Ahorro en Monto
Mostrar ahorro en soles, no en porcentaje.
```tsx
// ✅ Correcto
<Chip color="success">Ahorras S/200</Chip>

// ❌ Incorrecto
<Chip color="success">-15%</Chip>
```

### Nombres Descriptivos
Usar nombres que el estudiante entienda.
```tsx
// ✅ Correcto
<h3>Laptop Lenovo 15.6" para estudios</h3>

// ❌ Incorrecto
<h3>Lenovo V15 G4 AMN 82YU00H3LM</h3>
```

### Tooltips Obligatorios
Para specs técnicas que estudiantes no conocen.
```tsx
// RAM, SSD, GPU, Procesador SIEMPRE con tooltip
<TooltipProvider>
  <Tooltip content="La RAM determina cuántas apps puedes tener abiertas. 8GB es suficiente para estudios.">
    <span className="flex items-center gap-1">
      8GB RAM <HelpCircle className="w-4 h-4 text-neutral-400" />
    </span>
  </Tooltip>
</TooltipProvider>
```

## Estructura de Archivos

```
src/app/prototipos/0.2/
├── hero/
│   ├── page.tsx
│   ├── hero-preview/page.tsx
│   ├── components/hero/
│   └── types/hero.ts
├── catalogo/
│   ├── page.tsx
│   ├── catalog-preview/page.tsx
│   ├── components/{layout,filters,cards,sorting}/
│   └── types/{catalog.ts,product.ts}
├── producto/
│   ├── [slug]/page.tsx
│   └── components/detail/
├── solicitud/
│   ├── page.tsx
│   ├── steps/{personal,academico,economico,resumen}/
│   └── components/{wizard,fields}/
└── resultado/
    ├── aprobado/page.tsx
    └── rechazado/page.tsx
```

## Componentes NextUI Preferidos

| Necesidad | Componente NextUI |
|-----------|-------------------|
| Botones | `Button` con `color="primary"` + className para #4654CD |
| Cards | `Card`, `CardHeader`, `CardBody`, `CardFooter` |
| Inputs | `Input` con `classNames` para colores de marca |
| Selects | `Select`, `SelectItem` |
| Checkboxes | `Checkbox` con color personalizado |
| Progress | `Progress` para wizard steps |
| Modals | `Modal`, `ModalContent`, `ModalHeader`, `ModalBody` |
| Tabs | `Tabs`, `Tab` para navegación de secciones |
| Chips | `Chip` para badges y tags |
| Skeleton | `Skeleton` para loading states |

## Ejemplo de Componente

```tsx
'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card className="border border-neutral-200 hover:border-[#4654CD]/50 transition-colors">
      <CardBody className="p-4">
        {/* Badges */}
        <div className="flex gap-2 mb-3">
          {product.hasDiscount && (
            <Chip size="sm" className="bg-[#22c55e] text-white">
              Ahorras S/{product.discount}
            </Chip>
          )}
        </div>

        {/* Image */}
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-40 object-contain mb-4"
        />

        {/* Content */}
        <h3 className="font-semibold text-neutral-800 line-clamp-2 mb-2">
          {product.displayName}
        </h3>

        {/* Price - Cuota prominente */}
        <p className="text-2xl font-bold text-[#4654CD]">
          S/{product.lowestQuota}/mes
        </p>
        <p className="text-sm text-neutral-500">
          Precio total: S/{product.price}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-[#4654CD] text-white font-semibold"
            onPress={onAddToCart}
            startContent={<ShoppingCart className="w-4 h-4" />}
          >
            Lo quiero
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            className="border-neutral-300"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
```

## Referencias Adicionales

- **Decisiones UX/UI completas**: Ver `references/ux-decisions.md`
- **Patrones de componentes**: Ver `references/component-patterns.md`
- **Configuración Tailwind**: Ver `assets/tailwind-config.json`
- **Especificaciones por sección**: Ver `.claude/docs/section-specs/PROMPT_XX_[SECCION].md`

### Prompts de Secciones (en .claude/docs/section-specs/)

| Sección | Archivo | Preguntas |
|---------|---------|-----------|
| Hero/Landing | `PROMPT_01_HERO_LANDING.md` | 18 |
| Catálogo Layout | `PROMPT_02_CATALOGO_LAYOUT_FILTROS.md` | 36 |
| Catálogo Cards | `PROMPT_03_CATALOGO_CARDS.md` | 29 |
| Detalle Producto | `PROMPT_04_DETALLE_PRODUCTO.md` | 24 |
| Wizard Estructura | `PROMPT_08_FORM_ESTRUCTURA.md` | 22 |
| Wizard Campos | `PROMPT_09_FORM_CAMPOS.md` | 30 |
| Aprobación | `PROMPT_15_APROBACION.md` | 13 |
| Rechazo | `PROMPT_16_RECHAZO.md` | 19 |

## Checklist de Calidad

Antes de entregar cualquier componente, verificar:

- [ ] Usa #4654CD como color primario
- [ ] Tipografía: Baloo 2 para headings, Asap para body
- [ ] Sin gradientes ni emojis
- [ ] Icons son de Lucide React
- [ ] Mobile-first responsive
- [ ] Estados: hover, focus, disabled, loading
- [ ] Accesibilidad: aria-labels, focus visible
- [ ] TypeScript types definidos
- [ ] Cuota prominente sobre precio total
