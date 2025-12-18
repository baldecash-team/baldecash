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

## Select y Dropdowns (NextUI)

### SIEMPRE estilizar el popover y los items del Select

Los Select de NextUI requieren estilos explícitos para el dropdown desplegado, hover states y item seleccionado:

```tsx
// ❌ PROHIBIDO - Select sin estilos de dropdown
<Select
  selectedKeys={[value]}
  onChange={handleChange}
  classNames={{
    trigger: 'h-10 bg-white border border-neutral-200',
  }}
>
  <SelectItem key="opt1">Opción 1</SelectItem>
</Select>

// ✅ CORRECTO - Select con estilos completos y fondo blanco garantizado
<Select
  aria-label="Label accesible"
  selectedKeys={[value]}
  onChange={handleChange}
  classNames={{
    base: 'min-w-[200px]',
    trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
    value: 'text-sm text-neutral-700',
    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
    listbox: 'p-1 bg-white',
    listboxWrapper: 'max-h-[300px] bg-white',
  }}
  popoverProps={{
    classNames: {
      base: 'bg-white',
      content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
    },
  }}
>
  <SelectItem
    key="opt1"
    classNames={{
      base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
        text-neutral-700
        data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
        data-[selected=false]:data-[hover=true]:text-[#4654CD]
        data-[selected=true]:bg-[#4654CD]
        data-[selected=true]:text-white`,
    }}
  >
    Opción 1
  </SelectItem>
</Select>
```

### Claves para estilar Select de NextUI:

| Propiedad | Uso | Ejemplo |
|-----------|-----|---------|
| `trigger` | Botón que abre el dropdown | `hover:border-[#4654CD]/50 cursor-pointer` |
| `popoverContent` | Contenedor del dropdown | `bg-white border shadow-lg rounded-lg` |
| `listbox` | Lista de opciones | `p-1` (padding interno) |
| `SelectItem.base` | Cada opción individual | Ver data attributes abajo |

### Data attributes para estados de SelectItem:
- `data-[hover=true]` - Hover sobre el item
- `data-[selected=true]` - Item actualmente seleccionado
- `data-[selected=false]:data-[hover=true]` - Hover SOLO cuando NO está seleccionado (evita hover en item activo)
- `data-[selectable=true]:focus` - Focus del item

### Reglas para Select:
- **SIEMPRE** incluir `aria-label` si no hay label visible
- **SIEMPRE** usar `cursor-pointer` en trigger e items
- **SIEMPRE** usar `data-[selected=false]:data-[hover=true]:` para hover (NO aplica cuando seleccionado)
- **SIEMPRE** estilizar selected con fondo primario sólido
- Usar `popoverProps` para control adicional del dropdown

### IMPORTANTE: Fondo blanco en dropdowns

NextUI Select puede mostrar fondo transparente por defecto. Para garantizar fondo blanco, aplicar `bg-white` en MÚLTIPLES lugares:

```tsx
classNames={{
  popoverContent: 'bg-white ...',  // 1. Contenedor del popover
  listbox: 'bg-white ...',          // 2. Lista de opciones
  listboxWrapper: 'bg-white ...',   // 3. Wrapper de la lista
}}
popoverProps={{
  classNames: {
    base: 'bg-white',               // 4. Base del popover
    content: 'bg-white ...',        // 5. Contenido del popover
  },
}}
```

**NO es suficiente** aplicar `bg-white` solo en `popoverContent` - debe aplicarse en todos los niveles para garantizar que el fondo sea visible.

## Badges y Chips (NextUI)

### SIEMPRE usar radius="sm" y padding explícito en Chips

Los Chips de NextUI tienen forma de "pill" (muy redondeados) por defecto. Para BaldeCash usar badges rectangulares con bordes sutilmente redondeados:

```tsx
// ❌ PROHIBIDO - Chip con forma de pill (default)
<Chip size="sm" className="bg-[#4654CD] text-white text-xs">
  Nuevo
</Chip>

// ✅ CORRECTO - Chip rectangular con padding consistente
<Chip
  size="sm"
  radius="sm"
  classNames={{
    base: 'bg-[#4654CD] px-2.5 py-1 h-auto',
    content: 'text-white text-xs font-medium',
  }}
>
  Nuevo
</Chip>
```

### Configuración estándar de badges:

| Tipo | Base classNames | Content classNames |
|------|-----------------|-------------------|
| **Badge primario** | `bg-[#4654CD] px-2.5 py-1 h-auto` | `text-white text-xs font-medium` |
| **Badge éxito** | `bg-[#22c55e] px-2.5 py-1 h-auto` | `text-white text-xs font-medium` |
| **Badge gama** | `bg-[color] px-2 py-0.5 h-auto` | `text-xs font-medium` |
| **Badge warning** | `bg-amber-100 px-2 py-0.5 h-auto` | `text-amber-700 text-xs font-medium` |

### Reglas para badges:
- **SIEMPRE** usar `radius="sm"` (nunca default pill)
- **SIEMPRE** usar `classNames` en lugar de `className` para control granular
- **h-auto** para que el padding controle la altura
- **font-medium** para mejor legibilidad
- Separación entre badges: `gap-1.5` en el contenedor

## Imágenes Externas (Unsplash, CDN, etc.)

### NUNCA usar NextUI Image con removeWrapper para URLs externas

El componente `<Image>` de NextUI con `removeWrapper` no funciona correctamente con URLs externas (Unsplash, CDNs) en builds con `output: "export"`:

```tsx
// ❌ PROHIBIDO - No carga imágenes externas en static export
import { Image } from '@nextui-org/react';
<Image
  src="https://images.unsplash.com/photo-xxx"
  alt="Laptop"
  className="w-full h-full object-contain"
  removeWrapper
/>

// ✅ CORRECTO - Usar <img> nativo con lazy loading y error handling
<img
  src="https://images.unsplash.com/photo-xxx"
  alt="Laptop"
  className="w-full h-full object-contain"
  loading="lazy"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    // Mostrar fallback (icono o placeholder)
  }}
/>
```

### Configuración requerida en next.config.ts

Para proyectos con `output: "export"`, asegurar esta configuración:

```typescript
// next.config.ts
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,  // OBLIGATORIO para static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Agregar otros dominios según necesidad
    ],
  },
};
```

### Reglas para imágenes:
- **Static export (`output: "export"`)**: Siempre usar `<img>` nativo, no NextUI Image
- **Server-side rendering**: Puede usar Next.js `<Image>` o NextUI Image
- **Error handling**: Siempre incluir `onError` para mostrar fallback
- **Lazy loading**: Usar `loading="lazy"` para performance
- **Alt text**: Siempre descriptivo para accesibilidad

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

## Switch y Toggles (NextUI)

### SIEMPRE estilizar fondo del Switch para que sea visible

El Switch de NextUI puede ser invisible por defecto si no tiene estilos de fondo explícitos:

```tsx
// ❌ PROHIBIDO - Switch sin color="primary" ni estilos de wrapper
<Switch
  size="sm"
  isSelected={value}
  onValueChange={setValue}
/>

// ✅ CORRECTO - Switch con color="primary" y wrapper con color de marca
<Switch
  size="sm"
  isSelected={value}
  onValueChange={setValue}
  color="primary"
  classNames={{
    wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
  }}
/>
```

### Configuración estándar de Switch:

| Propiedad | Valor | Propósito |
|-----------|-------|-----------|
| `color` | `"primary"` | Activa estilos nativos de NextUI (fondo gris off, animaciones, thumb) |
| `wrapper` (on) | `group-data-[selected=true]:bg-[#4654CD]` | Sobrescribe color ON con color de marca |

### Reglas para Switch:
- **SIEMPRE** usar `color="primary"` para que NextUI maneje fondo off, animaciones y movimiento del thumb
- **SIEMPRE** sobrescribir solo el color ON con `wrapper: 'group-data-[selected=true]:bg-[#4654CD]'`
- **NUNCA** agregar estilos al `thumb` (interfiere con animaciones nativas de NextUI)
- **NUNCA** agregar `bg-neutral-300` manualmente (NextUI lo maneja con `color="primary"`)
- Envolver en `<label>` con texto descriptivo para accesibilidad

## Checkbox (NextUI)

### SIEMPRE estilizar borde y fondo del Checkbox para visibilidad

El Checkbox de NextUI necesita estilos explícitos para que el borde sea visible:

```tsx
// ❌ PROHIBIDO - Checkbox con borde fino/invisible
<Checkbox
  isSelected={value}
  onValueChange={setValue}
  classNames={{
    base: 'cursor-pointer',
    wrapper: 'before:border-neutral-300 after:bg-[#4654CD]',
  }}
/>

// ✅ CORRECTO - Checkbox con borde visible, color primario y animaciones
<Checkbox
  isSelected={value}
  onValueChange={setValue}
  classNames={{
    base: 'cursor-pointer',
    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
    icon: 'text-white transition-opacity',
  }}
/>
```

### Configuración estándar de Checkbox:

| Propiedad | Clase | Propósito |
|-----------|-------|-----------|
| `base` | `cursor-pointer` | Cursor de mano al hover |
| `wrapper` (border) | `before:border-2 before:border-neutral-300` | Borde grueso visible |
| `wrapper` (selected) | `after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD]` | Color primario al seleccionar |
| `wrapper` (animación) | `before:transition-colors after:transition-all` | Animación suave on/off |
| `icon` | `text-white transition-opacity` | Checkmark blanco con fade |

### Reglas para Checkbox:
- **SIEMPRE** usar `before:border-2` para borde visible (no `before:border` simple)
- **SIEMPRE** incluir `icon: 'text-white transition-opacity'` para checkmark animado
- **SIEMPRE** incluir `before:transition-colors after:transition-all` para animaciones
- **SIEMPRE** usar color primario `#4654CD` para estado seleccionado
- Envolver en `<label>` para mejor área de click y accesibilidad

## Imágenes con Fallback (Logos, Marcas, CDN externos)

### SIEMPRE manejar errores de carga en imágenes externas

Las URLs de Wikipedia, CDNs externos, o cualquier imagen remota pueden fallar por CORS, hotlinking bloqueado, o 404. Siempre implementar fallback:

```tsx
// ❌ PROHIBIDO - Sin manejo de error (imagen invisible si falla)
{option.logo && (
  <img src={option.logo} alt={option.label} className="w-12 h-8" />
)}

// ❌ PROHIBIDO - NextUI Image sin fallback
import { Image } from '@nextui-org/react';
<Image src={option.logo} alt={option.label} removeWrapper />

// ✅ CORRECTO - Componente con estado de error y fallback a texto
const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    // Fallback: mostrar nombre de marca
    return (
      <span className="text-sm font-semibold text-neutral-700 text-center leading-tight">
        {label}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="max-w-full max-h-full object-contain"
      onError={() => setHasError(true)}
    />
  );
};
```

### Patrón para filtros de marca (BrandFilter):

```tsx
// Componente contenedor siempre renderiza, con fallback interno
<div className="w-12 h-8 flex items-center justify-center mb-1">
  <BrandLogo logo={option.logo} label={option.label} />
</div>
```

### Reglas para imágenes con fallback:
- **SIEMPRE** usar `useState` para trackear errores de carga
- **SIEMPRE** incluir `onError={() => setHasError(true)}` en la imagen
- **SIEMPRE** proporcionar fallback visual (texto, icono, placeholder)
- **SIEMPRE** renderizar el contenedor incluso si la imagen falla
- **NUNCA** usar condicional que oculte el espacio si la imagen falla
- Usar `<img>` nativo en lugar de NextUI `<Image>` para mejor control de errores

### URLs problemáticas comunes:
| Dominio | Problema | Solución |
|---------|----------|----------|
| Wikipedia SVG | CORS / Hotlinking | Fallback a texto o usar CDN propio |
| Unsplash | Puede fallar en export | `<img>` nativo con lazy loading |
| URLs dinámicas | 404 frecuentes | Siempre implementar onError |

## Component Versioning Pattern (A/B Testing)

### SIEMPRE usar wrapper pattern para componentes con múltiples versiones

Cuando un componente tiene 3 versiones (V1, V2, V3), usar un wrapper que selecciona la versión según config:

```tsx
// ❌ PROHIBIDO - Condicionales en el componente principal
export const ProductCard: React.FC<Props> = ({ product, version }) => {
  if (version === 1) return <div>V1 implementation...</div>;
  if (version === 2) return <div>V2 implementation...</div>;
  // Código largo y difícil de mantener
};

// ✅ CORRECTO - Wrapper que delega a componentes específicos
// ProductCard.tsx (wrapper)
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardVersion = 1,
  ...props
}) => {
  switch (cardVersion) {
    case 1: return <ProductCardV1 product={product} {...props} />;
    case 2: return <ProductCardV2 product={product} {...props} />;
    case 3: return <ProductCardV3 product={product} {...props} />;
    default: return <ProductCardV1 product={product} {...props} />;
  }
};
```

### Estructura de archivos para versiones:

```
components/catalog/
├── ProductCard.tsx           # Wrapper selector
├── ProductCardSkeleton.tsx   # Shared skeleton
└── cards/
    ├── index.ts              # Exports de versiones
    ├── ProductCardV1.tsx     # Enfoque Técnico (specs)
    ├── ProductCardV2.tsx     # Enfoque Beneficios (uso)
    └── ProductCardV3.tsx     # Enfoque Híbrido (equilibrado)
```

### Tipos en CatalogConfig:

```tsx
export interface CatalogConfig {
  layoutVersion: 1 | 2 | 3;
  brandFilterVersion: 1 | 2 | 3;
  cardVersion: 1 | 2 | 3;  // Agregar nueva versión aquí
}

export const versionDescriptions = {
  layout: {
    1: 'Sidebar 280px izquierdo',
    2: 'Filtros horizontales',
    3: 'Drawer mobile-first',
  },
  card: {
    1: 'Enfoque Técnico: CPU, RAM, SSD con iconos',
    2: 'Enfoque Beneficios: Ideal para estudios, gaming',
    3: 'Enfoque Híbrido: 2 specs + 2 beneficios',
  },
} as const;
```

### Reglas para versiones:
- **SIEMPRE** mantener props consistentes entre versiones (misma interfaz)
- **SIEMPRE** incluir `cardVersion` en `CatalogConfig` type cuando agregas nueva versión
- **SIEMPRE** actualizar `defaultCatalogConfig` con valor default
- **SIEMPRE** agregar selector en `CatalogSettingsModal` para poder probar versiones
- **SIEMPRE** actualizar páginas standalone (catalog-v1, v2, v3) con nueva prop

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
- [ ] **Imágenes externas con `<img>` nativo (no NextUI Image en static export)**
- [ ] **Badges/Chips con radius="sm" y classNames (nunca pill default)**
- [ ] **Select: hover con `data-[selected=false]:data-[hover=true]:` (NO aplica hover cuando seleccionado)**
- [ ] **Switch: usar color="primary" + wrapper con group-data-[selected=true]:bg-[#4654CD] (NO estilos en thumb)**
- [ ] **Checkbox con before:border-2, transiciones y icon: 'text-white transition-opacity'**
- [ ] **Imágenes externas (logos, marcas) con fallback a texto usando onError + useState**
