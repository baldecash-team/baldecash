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

## Reglas Criticas de UI

### NUNCA fondos transparentes en elementos fijos
```tsx
// ❌ PROHIBIDO - Navbar transparente
<nav className="bg-transparent">

// ❌ PROHIBIDO - Modal sin backdrop solido
<Modal>
  <ModalContent>

// ✅ CORRECTO - Navbar siempre con fondo solido
<nav className="bg-white shadow-sm">
<nav className="bg-[#4654CD]">

// ✅ CORRECTO - Modal con backdrop y fondo explicito
<Modal backdrop="blur" classNames={{ backdrop: 'bg-black/50' }}>
  <ModalContent className="bg-white">
```

### Navbars: SIEMPRE fondo solido
- `bg-white` o `bg-[#4654CD]` - nunca `bg-transparent`
- Si cambia al scroll, cambiar entre dos colores solidos
- Mobile menu siempre `bg-white`

### Modals: SIEMPRE backdrop + fondo explicito + centrado simetrico
```tsx
// ❌ PROHIBIDO - scrollBehavior="inside" causa problemas de centrado
<Modal
  scrollBehavior="inside"
  classNames={{
    base: 'max-h-[90vh]',
  }}
>

// ✅ CORRECTO - scrollBehavior="outside" + placement="center" + padding simetrico
<Modal
  backdrop="blur"
  scrollBehavior="outside"
  placement="center"
  classNames={{
    base: 'bg-white my-8',
    wrapper: 'items-center justify-center py-8 min-h-full',
    backdrop: 'bg-black/50',
    body: 'bg-white max-h-[60vh] overflow-y-auto',
    closeButton: 'cursor-pointer',
  }}
>
  <ModalContent className="bg-white">
```

### Claves para centrado simetrico en modales:
- `scrollBehavior="outside"` - Evita problemas de posicionamiento
- `placement="center"` - Posicionamiento centrado
- `base: 'my-8'` - Margen vertical en el modal
- `wrapper: 'py-8 min-h-full'` - Padding simetrico en todos los breakpoints
- `closeButton: 'cursor-pointer'` - El boton X de NextUI NO tiene cursor por defecto
- **NUNCA** usar `scrollBehavior="inside"` con modales que requieren centrado

## Tipografia con Contraste Extremo

Usar extremos de peso y tamano para crear jerarquia clara:

### Pesos de fuente
```tsx
// ❌ EVITAR - Contraste debil
font-normal vs font-medium  // 400 vs 500
font-medium vs font-semibold // 500 vs 600

// ✅ PREFERIR - Contraste extremo
font-light vs font-black    // 300 vs 900
font-normal vs font-bold    // 400 vs 700
text-xs vs text-4xl         // Saltos de 3x minimo
```

### Tamanos de texto
```tsx
// ❌ EVITAR - Saltos pequenos
text-sm → text-base → text-lg  // 1.2x cada salto

// ✅ PREFERIR - Saltos dramaticos
text-xs → text-xl → text-5xl   // 3x+ entre niveles
```

### Ejemplo de jerarquia
```tsx
<h1 className="text-5xl font-black">Titulo Principal</h1>
<p className="text-base font-normal text-neutral-600">Descripcion</p>
<span className="text-xs font-light text-neutral-400">Detalle menor</span>
```

## Elementos Clickeables

### OBLIGATORIO: cursor-pointer en TODO elemento clickeable

Todo elemento con `onClick`, `onPress`, o que sea interactivo DEBE tener `cursor-pointer`:

```tsx
// ❌ PROHIBIDO - Sin cursor-pointer
<button onClick={handleClick} className="p-2 hover:bg-neutral-100">

// ✅ CORRECTO - Con cursor-pointer
<button onClick={handleClick} className="p-2 hover:bg-neutral-100 cursor-pointer">

// ❌ PROHIBIDO - Div clickeable sin cursor
<div onClick={handleClick} className="p-4 rounded-lg">

// ✅ CORRECTO - Div clickeable con cursor
<div onClick={handleClick} className="p-4 rounded-lg cursor-pointer">
```

### Elementos que SIEMPRE necesitan cursor-pointer:
- `<button>` con `onClick`
- `<motion.button>` con `onClick`
- `<div>` o `<span>` con `onClick`
- **NextUI `<Button>` con `onPress`** (NO tiene cursor-pointer por defecto)
- **NextUI Modal `closeButton`** (agregar en classNames)
- Cards clickeables (NextUI `isPressable`)
- Links estilizados como botones
- Iconos interactivos

### NextUI Button - SIEMPRE agregar cursor-pointer
```tsx
// ❌ PROHIBIDO - NextUI Button sin cursor-pointer
<Button onPress={handleClick} className="bg-[#4654CD] text-white">
  Zona Estudiantes
</Button>

// ✅ CORRECTO - NextUI Button con cursor-pointer
<Button onPress={handleClick} className="bg-[#4654CD] text-white cursor-pointer">
  Zona Estudiantes
</Button>
```

## Estados de Seleccion

### Elementos seleccionables SIEMPRE con estado visual claro

Todo boton, card, o elemento clickeable que representa una opcion seleccionable DEBE tener:
1. Estado default (no seleccionado)
2. Estado hover
3. **Estado seleccionado con color primario**

```tsx
// ❌ PROHIBIDO - Sin estado seleccionado
<button className={profile.highlight ? 'border-primary' : 'border-neutral-200'}>

// ✅ CORRECTO - Con estado seleccionado dinamico
const [selected, setSelected] = useState<string | null>(null);

<button
  onClick={() => setSelected(id)}
  className={`transition-all ${
    selected === id
      ? 'border-[#4654CD] bg-[#4654CD] text-white'  // Seleccionado
      : 'border-neutral-200 bg-white hover:border-[#4654CD]'  // Default
  }`}
>
```

### Patron para opciones seleccionables
```tsx
const getSelectionStyles = (isSelected: boolean, isRecommended: boolean) => {
  if (isSelected) {
    // SIEMPRE primario cuando seleccionado
    return 'border-[#4654CD] bg-[#4654CD] text-white';
  }
  if (isRecommended) {
    return 'border-[#4654CD] bg-[#4654CD]/5 hover:bg-[#4654CD]/10';
  }
  // Default: hover debe mostrar intencion de seleccion
  return 'border-neutral-200 bg-white hover:border-[#4654CD] hover:bg-[#4654CD]/5';
};
```

### Feedback visual en seleccion
- Cambiar icono a `Check` cuando seleccionado
- Texto cambia a `text-white` sobre fondo primario
- Transiciones suaves con `transition-all` o `transition-colors`

## Titulos Hero con Color de Marca

### NUNCA usar negro puro en titulos principales del hero

Los titulos hero deben usar el color primario para mayor impacto visual:

```tsx
// ❌ PROHIBIDO - Negro puro sin personalidad
<h1 className="text-neutral-900">La laptop que necesitas</h1>
<h1 className="text-black">Financiamiento para estudiantes</h1>

// ✅ CORRECTO - Color primario de marca
<h1 className="text-[#4654CD]">La laptop que necesitas</h1>

// ✅ CORRECTO - Blanco sobre fondo de color (como BrandIdentityV3)
<div className="bg-[#4654CD]">
  <h1 className="text-white">Tu equipo para estudiar</h1>
</div>
```

### Reglas de color para titulos:
- **Hero h1 sobre fondo claro**: Usar `text-[#4654CD]` (primario)
- **Hero h1 sobre fondo primario**: Usar `text-white`
- **Subtitulos/subheadlines**: Usar `text-neutral-600` para contraste
- **NUNCA**: `text-neutral-900`, `text-black`, `text-gray-900` en h1 del hero

## Dividers Visibles (No Usar NextUI Divider)

### NUNCA usar `<Divider>` de NextUI - es invisible por defecto

El componente Divider de NextUI renderiza un `<hr>` con `border-none` y `bg-divider` que puede ser invisible:

```tsx
// ❌ PROHIBIDO - Divider invisible que solo agrega espacio
import { Divider } from '@nextui-org/react';
<Divider className="mb-4" />
// Renderiza: <hr class="bg-divider border-none"> (INVISIBLE!)

// ✅ CORRECTO - Usar border de Tailwind directamente
<p className="mb-4 pb-4 border-b border-neutral-200">
  Texto con separador visible
</p>

// ✅ CORRECTO - Div con borde superior
<div className="mt-4 pt-4 border-t border-neutral-200">
  Contenido separado
</div>

// ✅ CORRECTO - HR nativo con estilos visibles
<hr className="border-t border-neutral-200 my-4" />
```

### Reglas para separadores:
- **NUNCA** importar ni usar `Divider` de `@nextui-org/react`
- Usar `border-b border-neutral-200` en el elemento superior
- Usar `border-t border-neutral-200` en el elemento inferior
- Si necesitas un separador independiente, usar `<hr>` con estilos de Tailwind

## Espaciado en Modales y Paneles

### EVITAR espaciado excesivo entre secciones

En modales, sidebars y paneles de configuracion, usar espaciado compacto:

```tsx
// ❌ PROHIBIDO - Espaciado excesivo (mb-6 + my-4 = 40px+)
<p className="mb-6">Descripcion introductoria</p>
<Divider className="my-4" />
<div className="mb-6">Contenido...</div>

// ✅ CORRECTO - Espaciado compacto y consistente
<p className="mb-4">Descripcion introductoria</p>
<Divider className="mb-4" />  {/* Solo margen inferior */}
<div className="mb-4">Contenido...</div>
```

### Reglas de espaciado en modales:
- **Entre texto y divider**: Usar `mb-4` en el texto, `mb-4` en el divider (no `my-4`)
- **Entre secciones repetidas**: Maximo `mb-4` (16px) entre elementos
- **Padding de contenedores**: `p-3` o `p-4`, nunca `p-6` en elementos internos
- **Antes de notas/footers**: `mt-2 mb-4` en dividers separadores

### Escala de espaciado recomendada:
| Contexto | Espaciado | Clase |
|----------|-----------|-------|
| Entre items de lista | 8px | `mb-2` / `gap-2` |
| Entre secciones internas | 16px | `mb-4` / `gap-4` |
| Padding de modal body | 24px | `py-6` |
| Entre grupos mayores | 24px | `mb-6` (solo top-level) |

## Evitar Texto Duplicado

### NUNCA mostrar la misma informacion dos veces en la misma vista

Cada dato debe aparecer UNA sola vez por componente/seccion:

```tsx
// ❌ PROHIBIDO - Precio duplicado
<p className="text-lg">Desde S/49/mes. Sin historial crediticio.</p>
<div className="mt-4">
  <span>Cuotas desde</span>
  <span className="text-2xl font-bold">S/49/mes</span>  // DUPLICADO!
</div>

// ✅ CORRECTO - Informacion complementaria sin duplicar
<p className="text-lg">Sin historial crediticio. Sin aval ni garante.</p>
<div className="mt-4">
  <span>Cuotas desde</span>
  <span className="text-2xl font-bold">S/49/mes</span>  // Unica mencion del precio
</div>
```

### Reglas de no duplicacion:
- **Precio/cuota**: Mostrar en UN lugar prominente (price highlight o headline, no ambos)
- **Beneficios**: Si esta en el subheadline, no repetir en badges
- **CTAs**: Texto de boton no debe repetir lo que dice el headline
- **Trust signals**: Cada senal aparece una sola vez

### Verificacion antes de entregar:
1. Buscar visualmente datos numericos (precios, porcentajes, cantidades)
2. Verificar que cada numero aparece UNA sola vez
3. Buscar frases clave ("desde", "sin historial", beneficios) - no duplicar

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
- [ ] **Navbars con fondo solido (NUNCA transparente)**
- [ ] **Modals con scrollBehavior="outside" para centrado simetrico (nunca "inside")**
- [ ] **Tipografia con contraste extremo (font-light vs font-black)**
- [ ] **Elementos seleccionables con estado selected en color primario**
- [ ] **cursor-pointer en TODOS los elementos clickeables**
- [ ] **Sin texto duplicado (precio, beneficios, datos numericos)**
- [ ] **Espaciado compacto en modales (mb-4 entre secciones, no mb-6)**
- [ ] **Titulos hero en color primario (#4654CD), nunca negro**
