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
- **SIEMPRE** agregar `innerWrapper: 'pr-8'` y `selectorIcon: 'right-3'` para evitar overlap del icono con el texto
- Usar `popoverProps` para control adicional del dropdown

### Evitar overlap del icono con el texto:
```tsx
<Select
  selectorIcon={<ArrowUpDown className="w-4 h-4 text-neutral-400" />}
  classNames={{
    value: 'text-sm text-neutral-700 pr-2',
    selectorIcon: 'right-3 pointer-events-none',
    innerWrapper: 'pr-8',
    // ... otros estilos
  }}
>
```

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

### IMPORTANTE: Select controlado con valor visible (renderValue)

Cuando el Select no muestra el valor seleccionado (aparece en blanco), es porque NextUI requiere configuración especial para Select controlado:

```tsx
// ❌ PROHIBIDO - Select controlado sin renderValue (valor no se muestra)
<Select
  selectedKeys={[value.toString()]}
  onChange={(e) => setValue(e.target.value)}
>
  <SelectItem key="1">Opción 1</SelectItem>
</Select>

// ✅ CORRECTO - Select controlado con renderValue y textValue
<Select
  selectedKeys={new Set([value.toString()])}  // Usar Set, no array
  onSelectionChange={(keys) => {              // Usar onSelectionChange, no onChange
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      setValue(selectedKey as string);
    }
  }}
  renderValue={(items) => {                   // Renderizar valor visible
    return items.map((item) => (
      <span key={item.key} className="text-sm text-neutral-700">
        {item.textValue}
      </span>
    ));
  }}
  classNames={{
    // ... estilos completos
  }}
>
  <SelectItem
    key="1"
    textValue="Opción 1"  // OBLIGATORIO para que renderValue funcione
  >
    Opción 1
  </SelectItem>
</Select>
```

### Claves para Select controlado que muestre el valor:

| Propiedad | Uso | Nota |
|-----------|-----|------|
| `selectedKeys` | `new Set([value])` | Usar Set, NO array |
| `onSelectionChange` | Callback con keys | NO usar onChange |
| `renderValue` | Renderiza el valor visible | Accede a `item.textValue` |
| `SelectItem.textValue` | Texto plano del item | OBLIGATORIO para renderValue |

### Reglas para Select controlado:
- **SIEMPRE** usar `selectedKeys={new Set([value])}` (Set, no array)
- **SIEMPRE** usar `onSelectionChange` en lugar de `onChange`
- **SIEMPRE** agregar `renderValue` si el valor no se muestra
- **SIEMPRE** agregar `textValue` a cada SelectItem
- El `textValue` debe ser texto plano (sin JSX) que coincida con el contenido visible

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
// ❌ PROHIBIDO - Switch invisible (solo borde curvo visible)
<Switch
  size="sm"
  isSelected={value}
  onValueChange={setValue}
  classNames={{
    wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
  }}
/>

// ✅ CORRECTO - Switch con fondo visible en ambos estados y sin solapamiento
<Switch
  size="sm"
  isSelected={value}
  onValueChange={setValue}
  classNames={{
    base: 'cursor-pointer',
    wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
    thumb: 'bg-white shadow-md',
    hiddenInput: 'z-0',
  }}
/>
```

### Configuración estándar de Switch:

| Propiedad | Clase | Propósito |
|-----------|-------|-----------|
| `base` | `cursor-pointer` | Cursor de mano al interactuar |
| `wrapper` (off) | `bg-neutral-300` | Fondo gris visible cuando está apagado |
| `wrapper` (on) | `group-data-[selected=true]:bg-[#4654CD]` | Color primario cuando está encendido |
| `thumb` | `bg-white shadow-md` | Bolita del switch visible con sombra |
| `hiddenInput` | `z-0` | **CRÍTICO**: Evita que el input oculto solape otros elementos |

### Reglas para Switch:
- **SIEMPRE** incluir `hiddenInput: 'z-0'` para evitar solapamiento con otros elementos
- **SIEMPRE** incluir `base: 'cursor-pointer'` para feedback visual
- **SIEMPRE** incluir `bg-neutral-300` en el wrapper para estado off visible
- **SIEMPRE** estilizar el thumb con `bg-white shadow-md` para contraste
- **SIEMPRE** usar color primario `#4654CD` para estado on
- **NUNCA** usar `color="primary"` sin estilos de wrapper (el fondo off puede ser invisible)
- **NUNCA** envolver en `<label>` - usar `<div>` para evitar conflictos con hiddenInput

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

## Sliders en Filtros (NextUI)

### SIEMPRE usar estilos sutiles para sliders de filtro

Los sliders de precio/cuota en filtros NO deben ser prominentes visualmente. Deben integrarse con el resto del UI sin llamar demasiado la atención:

```tsx
// ❌ PROHIBIDO - Slider muy prominente con colores brillantes
<Slider
  label="Cuota"
  classNames={{
    filler: 'bg-[#03DBD0]',          // Aqua brillante muy llamativo
    thumb: 'bg-[#03DBD0] border-[#03DBD0]',  // Thumb del mismo color
    label: 'text-sm font-medium',
    value: 'text-sm',
  }}
/>
<div className="text-sm">
  <span className="text-[#02C3BA] font-bold">S/49/mes</span>  // Muy llamativo
</div>

// ✅ CORRECTO - Slider sutil e integrado
<Slider
  label="Cuota"
  size="sm"
  classNames={{
    base: 'max-w-full',
    filler: 'bg-[#4654CD]/70',           // Primario semi-transparente
    thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-sm',  // Thumb blanco con borde
    track: 'bg-neutral-200 h-1',         // Track delgado
    label: 'text-xs font-medium text-neutral-600',   // Label pequeño
    value: 'text-xs text-neutral-500',
  }}
/>
<div className="flex justify-between text-xs">
  <span className="text-neutral-700 font-medium">S/49/mes</span>  // Sutil
  <span className="text-neutral-300">-</span>
  <span className="text-neutral-700 font-medium">S/199/mes</span>
</div>
```

### Configuración estándar de Slider en filtros:

| Propiedad | Clase | Propósito |
|-----------|-------|-----------|
| `size` | `"sm"` | Slider más compacto |
| `filler` | `bg-[#4654CD]/70` | Color primario semi-transparente |
| `thumb` | `bg-white border-2 border-[#4654CD] w-4 h-4 shadow-sm` | Thumb blanco con borde |
| `track` | `bg-neutral-200 h-1` | Track delgado y sutil |
| `label` | `text-xs font-medium text-neutral-600` | Label pequeño |
| `value` | `text-xs text-neutral-500` | Valores en gris |

### Reglas para Sliders en filtros:
- **SIEMPRE** usar `size="sm"` para compacidad
- **SIEMPRE** usar colores neutros para valores mostrados (`text-neutral-700`)
- **SIEMPRE** usar thumb blanco con borde en lugar de thumb sólido de color
- **NUNCA** usar colores brillantes como aqua `#03DBD0` en filtros
- **NUNCA** usar `font-bold` en valores del slider (usar `font-medium` máximo)
- Track delgado con `h-1` para menor prominencia

## Settings Modals Uniformes (Patrón Estándar)

### SIEMPRE seguir el patrón de HeroSettingsModal para modales de configuración

Todos los modales de settings deben ser uniformes en estructura, tamaño, y comportamiento:

```tsx
// ✅ CORRECTO - Estructura uniforme para Settings Modals
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="2xl"                           // Tamaño estándar para settings
  scrollBehavior="outside"             // NUNCA usar "inside"
  backdrop="blur"
  placement="center"
  classNames={{
    base: 'bg-white my-8',
    wrapper: 'items-center justify-center py-8 min-h-full',
    backdrop: 'bg-black/50',
    header: 'border-b border-neutral-200 bg-white py-4 pr-12',  // pr-12 para no colisionar con X
    body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
    footer: 'border-t border-neutral-200 bg-white',
    closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
  }}
>
  <ModalContent>
    {/* Header con icono y título */}
    <ModalHeader className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
        <Settings className="w-4 h-4 text-[#4654CD]" />
      </div>
      <span className="text-lg font-semibold text-neutral-800">Título del Modal</span>
    </ModalHeader>

    {/* Body con descripción + opciones */}
    <ModalBody className="py-6 bg-white">
      <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
        Descripción introductoria del modal.
      </p>
      {/* VersionSelector components aquí */}
    </ModalBody>

    {/* Footer con botones */}
    <ModalFooter className="bg-white">
      <Button
        variant="light"
        startContent={<RotateCcw className="w-4 h-4" />}
        onPress={handleReset}
        className="cursor-pointer"
      >
        Restablecer
      </Button>
      <Button className="bg-[#4654CD] text-white cursor-pointer" onPress={onClose}>
        Aplicar
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Estructura del Header:

| Elemento | Clase | Especificación |
|----------|-------|----------------|
| Contenedor icono | `w-8 h-8 rounded-lg bg-[#4654CD]/10` | 32x32px con fondo primario suave |
| Icono | `w-4 h-4 text-[#4654CD]` | 16x16px en color primario |
| Título | `text-lg font-semibold text-neutral-800` | 18px, semibold, gris oscuro |

### Estructura del Footer:

| Botón | Variante | Clase |
|-------|----------|-------|
| Restablecer | `variant="light"` | Con icono RotateCcw + `cursor-pointer` |
| Aplicar/Cerrar | Primario | `bg-[#4654CD] text-white cursor-pointer` |

### Reglas para Settings Modals:
- **SIEMPRE** usar `size="2xl"` para modales de configuración
- **SIEMPRE** usar `scrollBehavior="outside"` (nunca "inside")
- **SIEMPRE** incluir `cursor-pointer` en TODOS los botones (incluyendo closeButton)
- **SIEMPRE** usar `pr-12` en header para evitar colisión con botón X
- **SIEMPRE** usar `scrollbar-hide` en body para scrollbar limpio
- **SIEMPRE** estructura: Header con icono → Body con descripción + opciones → Footer con Restablecer + Aplicar
- **SIEMPRE** icono del header en contenedor 8x8 con fondo `bg-[#4654CD]/10`
- **NUNCA** usar tamaños diferentes entre modales de settings del mismo proyecto

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

## Section Status Tracking (Single Source of Truth)

### NUNCA duplicar el tracking de status de secciones

El status de secciones (habilitado/deshabilitado, pendiente/completado) debe tener UNA SOLA fuente de verdad:

```
✅ ÚNICA FUENTE DE VERDAD
src/app/prototipos/_registry/versions.ts
  → status: 'pending' | 'in_progress' | 'done'
  → Controla navegación UI y progreso

❌ NO USAR para status
public/prototipos/X.X/config.json
  → Solo versiones de componentes A/B
  → NUNCA incluir "enabled: true/false"
```

### Archivos y sus responsabilidades:

| Archivo | Propósito | Datos |
|---------|-----------|-------|
| `_registry/versions.ts` | Navegación, progreso, status | `sections[].status` |
| `public/X.X/config.json` | Configuración A/B de componentes | `components[].version` |

### Ejemplo correcto de config.json:

```json
{
  "sections": {
    "hero": {
      "lastUpdated": "2024-12-17",
      "components": {
        "brandIdentity": { "version": 1, "notes": "..." },
        "navbar": { "version": 2, "notes": "..." }
      }
    }
  }
}
```

### Reglas:
- **NUNCA** agregar `enabled: true/false` en config.json
- **SIEMPRE** usar `versions.ts` para status de secciones
- **SIEMPRE** actualizar `versions.ts` cuando una sección pasa a `done`
- El status determina si la card es clickeable en el índice de prototipos
- config.json solo almacena qué versión de cada componente usar

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

## Floating Action Buttons (FAB)

### SIEMPRE incluir hover background en botones flotantes

Los botones flotantes de preview (configuración, ver código) deben tener feedback visual claro al hover:

```tsx
// ❌ PROHIBIDO - Sin hover background visible
<Button
  isIconOnly
  className="bg-[#4654CD] text-white shadow-lg"
  onPress={onClick}
>
  <Settings className="w-5 h-5" />
</Button>

// ✅ CORRECTO - Con hover background y transiciones
// Botón primario (configuración)
<Button
  isIconOnly
  className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
  onPress={onClick}
>
  <Settings className="w-5 h-5" />
</Button>

// Botón secundario (ver código)
<Button
  isIconOnly
  className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
  onPress={onClick}
>
  <Code className="w-5 h-5 text-neutral-600" />
</Button>
```

### Configuración estándar de FABs:

| Tipo | Background | Hover | Transición |
|------|------------|-------|------------|
| **Primario** | `bg-[#4654CD]` | `hover:bg-[#3a47b3]` | `transition-colors` |
| **Secundario** | `bg-white border border-neutral-200` | `hover:bg-neutral-100` | `transition-colors` |

### Reglas para Floating Action Buttons:
- **SIEMPRE** incluir `cursor-pointer` en todos los FABs
- **SIEMPRE** usar `hover:bg-[#3a47b3]` para botones primarios (tono más oscuro de #4654CD)
- **SIEMPRE** usar `hover:bg-neutral-100` para botones secundarios/blancos
- **SIEMPRE** incluir `transition-colors` o `transition-all` para animación suave
- **SIEMPRE** usar `shadow-lg` para elevación visual
- Agrupar FABs verticalmente con `gap-2` en el contenedor
- Posicionar con `fixed bottom-6 right-6 z-50`

## Section Landing Pages (Auto-Redirect Pattern)

### SIEMPRE redirigir landing pages de sección al preview

Las landing pages de cada sección (hero, catalogo, rechazo, etc.) NO deben mostrar una lista de versiones para elegir. Deben redirigir automáticamente al preview configurable:

```tsx
// ❌ PROHIBIDO - Landing page con lista de versiones
export default function RechazoPage() {
  const versions = [
    { id: 'preview', href: '/rechazo/rechazado-preview' },
    { id: 'v1', href: '/rechazo/rechazado-v1' },
    // ...
  ];

  return (
    <div>
      <h1>Versiones Disponibles</h1>
      {versions.map((v) => <Card key={v.id}>{v.name}</Card>)}
    </div>
  );
}

// ✅ CORRECTO - Auto-redirect al preview configurable
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RechazoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prototipos/0.3/rechazo/rechazado-preview');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Redirigiendo a Rechazo Preview...</p>
      </div>
    </div>
  );
}
```

### Patrón de Loading Spinner:

```tsx
// Spinner estándar con colores de marca
<div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
<p className="text-neutral-500">Redirigiendo a [Sección] Preview...</p>
```

### Reglas para landing pages de sección:
- **SIEMPRE** redirigir a `[seccion]-preview` usando `router.replace()`
- **SIEMPRE** usar `'use client'` para el componente
- **SIEMPRE** mostrar spinner de carga con mensaje descriptivo
- **SIEMPRE** usar `bg-neutral-50` como fondo del loading state
- **NUNCA** mostrar lista de versiones en la landing page
- El usuario accede a versiones específicas (v1, v2, v3) directamente vía URL o desde el preview configurable

## Fixed Navbar con Hero de Color (Evitar White Space)

### SIEMPRE aplicar fondo del hero al main cuando navbar y hero comparten color

Cuando un navbar fijo y un hero tienen el mismo color de fondo (ej: ambos `bg-[#4654CD]`), el padding-top del main crea un gap blanco visible:

```tsx
// ❌ PROHIBIDO - pt-16 crea gap blanco entre navbar y hero de mismo color
<nav className="fixed top-0 bg-[#4654CD] h-16">...</nav>
<main className="pt-16">
  <div className="bg-[#4654CD]">Hero content</div>  {/* Gap blanco visible! */}
</main>

// ✅ CORRECTO - Aplicar fondo del hero al main cuando versión V3
<nav className="fixed top-0 bg-[#4654CD] h-16">...</nav>
<main className={`pt-16 ${config.brandIdentityVersion === 3 ? 'bg-[#4654CD]' : ''}`}>
  <div className="bg-[#4654CD]">Hero content</div>  {/* Sin gap visible */}
</main>
```

### Implementación en HeroSection wrapper:

```tsx
// HeroSection.tsx
export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  return (
    <div className="min-h-screen">
      {renderNavbar()}  {/* Fixed navbar */}

      {/* Main content con fondo condicional para evitar white space */}
      <main className={`pt-16 ${
        config.brandIdentityVersion === 3 ? 'bg-[#4654CD]' : ''
      }`}>
        {renderBrandIdentity()}
        {/* Resto del contenido */}
      </main>

      {renderFooter()}
    </div>
  );
};
```

### Diagnóstico del problema:
| Elemento | Valor | Resultado |
|----------|-------|-----------|
| Navbar fixed | `h-16` (64px) | Navbar ocupa 64px desde top |
| Main padding | `pt-16` (64px) | Contenido empieza debajo del navbar |
| BrandIdentity V3 | `bg-[#4654CD]` | Mismo color que navbar |
| Gap visible | 64px de `pt-16` | Fondo blanco/transparente del main |

### Reglas para navbar + hero del mismo color:
- **SIEMPRE** aplicar `bg-[color]` al `<main>` cuando navbar y hero comparten color
- **SIEMPRE** hacer la clase condicional basada en la versión del componente
- **SIEMPRE** verificar visualmente con scroll hacia arriba/abajo
- El pt-16 se mantiene para el espaciado, pero el fondo del main lo oculta
- Este patrón aplica a cualquier combinación donde navbar y primera sección comparten fondo

## Logos de Convenios (Fuente Centralizada)

### SIEMPRE usar conveniosLogos.ts para logos de instituciones

Los logos de universidades, institutos y socios están centralizados en un único archivo:

```tsx
// Importar logos de convenios
import {
  conveniosLogos,        // 35 instituciones educativas
  membresiaLogos,        // 2 socios (ASBANC, Fintech Perú)
  allPartnerLogos,       // Todos combinados (37 total)
  getUniversidades,      // Helper: solo universidades
  getInstitutos,         // Helper: solo institutos
  getSocios,             // Helper: solo membresías
  getLogoByShortName,    // Buscar por nombre corto
  conveniosStats,        // Estadísticas { total: 37, ... }
} from '@/app/prototipos/_shared/data/conveniosLogos';
```

### Estructura de cada logo:

```tsx
interface ConvenioLogo {
  id: number;           // ID único (1-37)
  name: string;         // Nombre completo de la institución
  shortName: string;    // Nombre corto (ej: "UPC", "SENATI")
  url: string;          // URL del CDN de Webflow
  type: 'instituto' | 'universidad' | 'socio';
}
```

### Ejemplo de uso en Hero Section:

```tsx
import { conveniosLogos } from '@/app/prototipos/_shared/data/conveniosLogos';

// Mostrar primeros 10 logos en carrusel
const LogoCarousel = () => (
  <div className="flex gap-8 overflow-x-auto">
    {conveniosLogos.slice(0, 10).map((logo) => (
      <img
        key={logo.id}
        src={logo.url}
        alt={logo.name}
        className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    ))}
  </div>
);
```

### Ejemplo de uso con filtros:

```tsx
import { getUniversidades, getInstitutos } from '@/app/prototipos/_shared/data/conveniosLogos';

// Solo universidades (20 logos)
const universidades = getUniversidades();

// Solo institutos (15 logos)
const institutos = getInstitutos();
```

### Reglas para logos de convenios:
- **SIEMPRE** importar desde `conveniosLogos.ts` (nunca hardcodear URLs)
- **SIEMPRE** incluir `onError` handler para fallback
- **SIEMPRE** usar `loading="lazy"` para performance
- **SIEMPRE** usar `grayscale` por defecto en carruseles (hover para color)
- **NUNCA** duplicar la lista de logos en otros archivos
- Los logos están en CDN de Webflow (no requieren next.config para dominios)

### Ejemplo de Marquee/Slider infinito:

```tsx
import { conveniosLogos, conveniosStats } from '@/app/prototipos/_shared/data/conveniosLogos';

const LogoMarquee = () => {
  // Duplicar para efecto infinito
  const allLogos = [...conveniosLogos, ...conveniosLogos];

  return (
    <div className="relative overflow-hidden">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

      <motion.div
        className="flex gap-12 items-center"
        animate={{ x: [0, -100 * conveniosLogos.length] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {allLogos.map((logo, index) => (
          <div key={`${logo.id}-${index}`} className="flex-shrink-0 h-12 w-32 grayscale hover:grayscale-0 transition-all">
            {/* IMPORTANTE: Usar <img> nativo, NO NextUI Image para URLs externas */}
            <img
              src={logo.url}
              alt={logo.name}
              className="max-h-10 max-w-28 object-contain"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
```

**IMPORTANTE**: Usar `<img>` nativo en lugar de NextUI `<Image>` para URLs de CDN externos. NextUI Image con `removeWrapper` no funciona correctamente en builds con `output: "export"`.

### Estadísticas disponibles:

| Tipo | Cantidad |
|------|----------|
| Universidades | 20 |
| Institutos | 15 |
| Socios/Membresías | 2 |
| **Total** | **37** |

## Tooltips con Background Sólido (NextUI)

### SIEMPRE agregar classNames al Tooltip para fondo visible

Los Tooltips de NextUI pueden tener fondo transparente por defecto. Siempre especificar fondo blanco:

```tsx
// ❌ PROHIBIDO - Tooltip con fondo transparente
<Tooltip
  content={
    <div className="p-2">
      <p className="font-semibold">{item.name}</p>
      <p className="text-xs text-neutral-400">{item.description}</p>
    </div>
  }
>

// ✅ CORRECTO - Tooltip con fondo sólido y sombra
<Tooltip
  content={
    <div className="p-2 max-w-xs">
      <p className="font-semibold text-neutral-800">{item.name}</p>
      <p className="text-xs text-neutral-500">{item.description}</p>
    </div>
  }
  classNames={{
    content: 'bg-white shadow-lg border border-neutral-200',
  }}
>
```

### Reglas para Tooltips:
- **SIEMPRE** incluir `classNames={{ content: 'bg-white shadow-lg border border-neutral-200' }}`
- **SIEMPRE** usar textos oscuros (`text-neutral-800`, `text-neutral-500`) para legibilidad
- **SIEMPRE** incluir padding (`p-2`) y max-width para contenido largo
- **NUNCA** dejar el Tooltip sin classNames de fondo

## Indicadores de Navegación en Carruseles

### SIEMPRE agregar indicadores visuales en carruseles de cards

Los carruseles horizontales de accesorios, productos similares, etc. DEBEN tener indicadores claros de navegación:

```tsx
// ✅ CORRECTO - Carrusel con dots de paginación e instrucciones
<div className="flex flex-col items-center gap-2 mt-4">
  {/* Pagination dots clickeables */}
  <div className="flex gap-2">
    {items.map((_, index) => (
      <button
        key={index}
        onClick={() => scrollToIndex(index)}
        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
          currentIndex === index
            ? 'bg-[#4654CD]'
            : 'bg-neutral-200 hover:bg-neutral-300'
        }`}
      />
    ))}
  </div>
  {/* Instrucción de navegación */}
  <span className="text-xs text-neutral-400 flex items-center gap-2">
    <ChevronLeft className="w-3 h-3" />
    <span>Desliza o usa las flechas para ver mas</span>
    <ChevronRight className="w-3 h-3" />
  </span>
</div>
```

### Reglas para carruseles:
- **SIEMPRE** incluir dots de paginación clickeables
- **SIEMPRE** incluir texto descriptivo de cómo navegar
- **SIEMPRE** mostrar flechas de navegación en desktop cuando hay overflow
- Los dots activos usan color primario `bg-[#4654CD]`

## Desglose de Precio (PriceBreakdown)

### SIEMPRE mostrar cuota mensual como valor principal, no el total

En componentes de desglose de precio, el valor prominente debe ser la **cuota mensual**, no el total:

```tsx
// ❌ PROHIBIDO - Mostrar total como valor principal
<div>
  <p className="text-sm text-neutral-500">Total</p>
  <p className="font-bold text-lg text-[#4654CD]">
    S/{totalPrice.toLocaleString()}
  </p>
</div>

// ✅ CORRECTO - Mostrar cuota mensual como valor principal
<div>
  <p className="text-sm text-neutral-500">Cuota mensual</p>
  <p className="font-bold text-lg text-[#4654CD]">
    S/{totalMonthlyQuota}<span className="text-sm font-normal text-neutral-500">/mes</span>
  </p>
</div>
```

### Reglas para desglose de precio:
- **SIEMPRE** mostrar cuota mensual prominente con `/mes` sufijo
- **SIEMPRE** usar `truncate` o `title` para textos largos de items
- **SIEMPRE** usar gradiente sutil en la fila del total (`bg-gradient-to-r from-[#4654CD]/10 to-[#4654CD]/5`)
- El total a pagar va en el desglose expandido, no como valor principal

## Impacto en Cuota (QuotaImpact)

### SIEMPRE destacar el total mensual con gradiente y sombra

El componente de impacto en cuota debe hacer muy visible el total resultante:

```tsx
// ✅ CORRECTO - Total mensual prominente con gradiente
<div className="px-5 py-3 bg-gradient-to-r from-[#4654CD] to-[#5B68D8] rounded-xl shadow-lg shadow-[#4654CD]/30 border-2 border-white/20">
  <p className="text-[10px] text-white/90 uppercase tracking-wider font-medium">Total mensual</p>
  <p className="font-bold text-2xl text-white font-['Baloo_2'] leading-tight">
    S/{totalQuota}<span className="text-sm font-normal opacity-80">/mes</span>
  </p>
</div>
```

### Reglas para QuotaImpact:
- **SIEMPRE** usar gradiente de primario a tono más claro
- **SIEMPRE** incluir sombra con color (`shadow-[#4654CD]/30`)
- **SIEMPRE** usar tipografía grande y bold para el monto
- El total debe destacar visualmente de los items individuales

## Punto y Coma en Español

### NUNCA remover ni reemplazar el uso de punto y coma (;)

En español, el punto y coma (;) tiene usos específicos y válidos que deben respetarse:

```tsx
// ✅ CORRECTO - Mantener punto y coma cuando corresponde
<p className="text-sm text-neutral-600">
  Incluye: cargador original; funda protectora; mouse inalámbrico.
</p>

// ❌ PROHIBIDO - Reemplazar ; por comas o puntos incorrectamente
<p className="text-sm text-neutral-600">
  Incluye: cargador original, funda protectora, mouse inalámbrico.  // Pierde énfasis
</p>
```

### Uso correcto del punto y coma en español:
- **Para separar elementos complejos** en una enumeración
- **Para unir oraciones relacionadas** que podrían ir separadas por punto
- **Antes de conectores** (sin embargo; no obstante; por lo tanto)
- **NUNCA** reemplazar automáticamente por comas - respetar el estilo del autor

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
- [ ] **Switch: wrapper con `bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]` + thumb `bg-white shadow-md`**
- [ ] **Checkbox con before:border-2, transiciones y icon: 'text-white transition-opacity'**
- [ ] **Sliders en filtros: size="sm", thumb blanco con borde, colores sutiles**
- [ ] **Settings Modals: size="2xl", scrollBehavior="outside", cursor-pointer en TODOS los botones**
- [ ] **Imágenes externas (logos, marcas) con fallback a texto usando onError + useState**
- [ ] **FABs con hover background: primarios `hover:bg-[#3a47b3]`, secundarios `hover:bg-neutral-100`**
- [ ] **Section status en `versions.ts` únicamente (NUNCA `enabled` en config.json)**
- [ ] **Landing pages de sección redirigen automáticamente a [seccion]-preview**
- [ ] **Navbar fijo + hero del mismo color: aplicar bg-[color] al main para evitar white space**
- [ ] **Logos de convenios importados desde conveniosLogos.ts (nunca hardcodear URLs)**
- [ ] **Tooltips con classNames={{ content: 'bg-white shadow-lg border border-neutral-200' }}**
- [ ] **Carruseles con dots de paginación e instrucciones de navegación**
- [ ] **Desglose de precio muestra cuota mensual prominente, no total**
- [ ] **QuotaImpact con gradiente y sombra para destacar el total**
- [ ] **Punto y coma (;) en español respetado, nunca reemplazado automáticamente**
- [ ] **Switch: hiddenInput con z-0 para evitar solapamiento con otros elementos**
- [ ] **Select: innerWrapper con pr-8 y selectorIcon con right-3 para evitar overlap con texto**
- [ ] **Slider: thumb con bg-white, border-2 border-[#4654CD], shadow-lg, cursor-pointer**
- [ ] **Grids de cards: motion.div con h-full + Card con h-full para alturas uniformes**
- [ ] **Botones en estados vacíos con cursor-pointer explícito**
