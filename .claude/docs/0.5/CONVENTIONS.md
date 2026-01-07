# Convenciones Globales - BaldeCash v0.5

> Reglas que aplican a **TODOS** los módulos en `src/app/prototipos/0.5/`
> Estas convenciones son cargadas automáticamente por el comando `/iterar`

---

## 0. Versiones por Componente

**v0.5 usa 2 versiones (V1-V2)** en lugar de las 6 de v0.4.

| Versión | Enfoque |
|---------|---------|
| **V1** | Versión base / conservadora |
| **V2** | Versión alternativa / experimental |

Esto permite iteración más rápida y enfocada en refinamiento.

---

## 1. Ortografía - Español Latino

### Regla General
**Siempre** usar caracteres con tilde en español. Revisar especialmente: títulos, labels, tooltips, comentarios de código.

### Palabras Frecuentes

| Incorrecto | Correcto |
|------------|----------|
| Catalogo | Catálogo |
| Configuracion | Configuración |
| Basica | Básica |
| mas | más |
| rapido | rápido |
| diseno | diseño |
| programacion | programación |
| Ultimas | Últimas |
| automaticamente | automáticamente |
| geometricos | geométricos |
| Clasico | Clásico |
| movil | móvil |
| Boton | Botón |
| informacion | información |
| numero | número |
| telefono | teléfono |
| direccion | dirección |
| economico | económico |
| academico | académico |
| resolucion | resolución |
| estandar | estándar |
| Util | Útil |
| angulos | ángulos |
| vision | visión |
| economica | económica |
| relacion | relación |
| Cual | Cuál |
| Que (interrogativo) | Qué |
| categorias | categorías |

### Aplica a Identificadores Internos

Las tildes también aplican a `value`, keys de objetos y tipos TypeScript, no solo a textos visibles:

```typescript
// ✅ Correcto - consistente
{ value: 'diseño', label: 'Diseño' }
{ value: 'programación', label: 'Programación' }

// ❌ Incorrecto - inconsistente
{ value: 'diseno', label: 'Diseño' }
{ value: 'programacion', label: 'Programación' }
```

TypeScript permite tildes en strings. Mantener consistencia entre valores internos y labels evita bugs de matching.

### Verificación
```bash
# Buscar palabras sin tildes comunes
grep -rE "Catalogo|Configuracion|Basica|mas |rapido|diseno|programacion" src/app/prototipos/0.5/
```

---

## 2. Componentes Compartidos de UI

### 2.0 Elementos Obligatorios en Páginas de Preview

**TODAS** las páginas de preview en v0.5 deben incluir estos 8 elementos:

| # | Elemento | Ubicación | Descripción |
|---|----------|-----------|-------------|
| 1 | **TokenCounter** | bottom-right | Contador de tokens (naranja) |
| 2 | **Settings Button** | bottom-right | Abre modal de configuración (azul) |
| 3 | **Code Button** | bottom-right | Toggle del config badge (blanco, `<>`) |
| 4 | **Back Button** | bottom-right | Regresa al índice (blanco, `←`) |
| 5 | **ShortcutToast** | floating | Feedback de keyboard shortcuts |
| 6 | **ShortcutHelpBadge** | floating | Muestra componente activo |
| 7 | **SettingsModal** | modal | Modal de configuración |
| 8 | **ConfigBadge** | bottom-left | Info de configuración actual |

#### Comportamiento con `mode=clean`

Cuando la URL tiene `?mode=clean`, **TODOS** estos elementos se ocultan mediante return temprano:

```tsx
const isCleanMode = searchParams.get('mode') === 'clean';

// Return temprano: solo contenido principal
if (isCleanMode) {
  return <SectionContent config={config} />;
}

// Modo normal: contenido + todos los controles
return (
  <div className="relative">
    <SectionContent config={config} />
    <ShortcutToast />
    <ShortcutHelpBadge />
    <FloatingActionButtons />  {/* TokenCounter, Settings, Code, Back */}
    <SettingsModal />
    <ConfigBadge />
  </div>
);
```

### 2.1 Floating Controls Pattern

Todas las páginas de preview deben incluir controles flotantes consistentes:

```
┌─────────────────────────────────────────┐
│                                         │
│                            [TokenCounter]│
│                            [⚙️ Settings] │
│  [Config Badge]            [<> Code]    │
│  (info actual)             [← Back]     │
└─────────────────────────────────────────┘
  bottom-left                 bottom-right
```

### 2.2 Implementación Estándar

```tsx
// Imports necesarios
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';

// Estado
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [showConfigBadge, setShowConfigBadge] = useState(false); // Default: oculto

// JSX - Floating Action Buttons (bottom-right)
<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
  <TokenCounter sectionId="PROMPT_{NUMBER}" version="0.5" />
  <Button
    isIconOnly
    radius="md"
    className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
    onPress={() => setIsSettingsOpen(true)}
  >
    <Settings className="w-5 h-5" />
  </Button>
  <Button
    isIconOnly
    radius="md"
    className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
    onPress={() => setShowConfigBadge(!showConfigBadge)}
  >
    <Code className="w-5 h-5 text-neutral-600" />
  </Button>
  <Button
    isIconOnly
    radius="md"
    className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
    onPress={() => router.push('/prototipos/0.5')}
  >
    <ArrowLeft className="w-5 h-5 text-neutral-600" />
  </Button>
</div>

// JSX - Config Badge (bottom-left, condicional)
{showConfigBadge && (
  <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
    <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
    <p className="text-xs font-mono text-neutral-700">
      {/* Contenido específico de cada sección */}
    </p>
  </div>
)}
```

### 2.3 Comportamiento de Controles

| Control | Posición | Default | Acción |
|---------|----------|---------|--------|
| TokenCounter | bottom-right | Visible | Muestra uso de tokens |
| Settings (⚙️) | bottom-right | Visible | Abre modal de configuración |
| Code (`<>`) | bottom-right | Visible | Toggle del config badge |
| Back (←) | bottom-right | Visible | Navega a `/prototipos/0.5` |
| Config Badge | bottom-left | **Oculto** | Muestra configuración actual |

---

## 3. TypeScript Patterns

### 3.1 Tipos Union para Enums

**Siempre** definir tipos union específicos para opciones finitas:

```typescript
// ✅ Correcto
export type Resolution = 'hd' | 'fhd' | 'qhd' | '4k';
export type DisplayType = 'ips' | 'tn' | 'oled' | 'va';
export type GamaTier = 'entry' | 'media' | 'alta' | 'premium';

// ❌ Incorrecto
resolution: string[];  // Muy genérico, permite valores inválidos
```

### 3.2 Configuración de Versiones

Patrón estándar para componentes con múltiples versiones:

```typescript
export interface SectionConfig {
  // Versiones de componentes (1-2 para v0.5)
  componentVersion: 1 | 2;

  // Opciones de configuración
  optionA: boolean;
  optionB: 'value1' | 'value2' | 'value3';
}

export const defaultSectionConfig: SectionConfig = {
  componentVersion: 1,
  optionA: true,
  optionB: 'value1',
};
```

### 3.3 Props de Componentes Versionados

```typescript
export interface ComponentProps {
  // Props comunes a todas las versiones
  data: DataType;
  onChange: (value: DataType) => void;
  config: SectionConfig;
}

// Cada versión recibe las mismas props
export const ComponentV1: React.FC<ComponentProps> = ({ data, onChange, config }) => { ... };
export const ComponentV2: React.FC<ComponentProps> = ({ data, onChange, config }) => { ... };
```

---

## 4. Next.js App Router Patterns

### 4.1 Suspense para useSearchParams

**Obligatorio** cuando se usa `useSearchParams()`:

```typescript
// page.tsx
export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}

// Componente interno con useSearchParams
function PreviewContent() {
  const searchParams = useSearchParams();
  // ...resto del componente
}
```

### 4.2 Estructura de Página de Preview

```typescript
'use client';

import React, { useState, Suspense } from 'react';
import { Spinner } from '@nextui-org/react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SectionPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SectionPreviewContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" color="primary" />
    </div>
  );
}

function SectionPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados
  const [config, setConfig] = useState<SectionConfig>(() => {
    // Inicializar desde URL params si existen
    return defaultSectionConfig;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Contenido principal */}

      {/* Floating Controls */}

      {/* Config Badge */}

      {/* Settings Modal */}
    </div>
  );
}
```

---

## 5. Estructura de Archivos por Sección

### 5.1 Estructura Estándar

```
src/app/prototipos/0.5/{seccion}/
├── {seccion}-preview/
│   └── page.tsx                    # Preview con configurador
├── components/
│   └── {seccion}/
│       ├── {Component}V1.tsx       # Versión 1
│       ├── {Component}V2.tsx       # Versión 2
│       ├── {Seccion}SettingsModal.tsx
│       └── index.ts                # Barrel exports
├── types/
│   └── {seccion}.ts                # Tipos TypeScript
├── data/
│   └── mock{Seccion}Data.ts        # Datos de prueba
└── page.tsx                        # Redirect a preview
```

### 5.2 Barrel Exports (index.ts)

```typescript
// components/{seccion}/index.ts
export { ComponentV1 } from './ComponentV1';
export { ComponentV2 } from './ComponentV2';
// ...
export { SectionSettingsModal } from './SectionSettingsModal';
```

---

## 6. Settings Modal Pattern

> **Referencia:** Basado en `HeroSettingsModal` de v0.4

### 6.1 Estructura General

```
┌─────────────────────────────────────────────────────┐
│ [⚙️]  Configuración del {Sección}              [✕] │  ← Header
├─────────────────────────────────────────────────────┤
│ Personaliza el diseño seleccionando diferentes     │  ← Descripción
│ versiones de cada componente.                       │
├─────────────────────────────────────────────────────┤
│ [📍] Componente A                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ○  Versión 1                                    │ │  ← Radio card
│ │    Descripción de la versión 1                  │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ●  Versión 2                      [seleccionado]│ │  ← Borde azul
│ │    Descripción de la versión 2                  │ │
│ └─────────────────────────────────────────────────┘ │
│ ─────────────────────────────────────────────────── │  ← Separador
│ [📍] Componente B                                   │
│ ...                                                 │
├─────────────────────────────────────────────────────┤
│ [🔗 Generar URL]                    [↺ Restablecer]│  ← Footer (SIN Aplicar)
└─────────────────────────────────────────────────────┘
```

### 6.2 Imports Requeridos

```tsx
import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { Settings, RotateCcw, Link2, Check } from 'lucide-react';
// + iconos específicos de cada sección
```

### 6.3 Props Interface

```tsx
interface SectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SectionConfig;
  onConfigChange: (config: SectionConfig) => void;
}
```

### 6.4 Modal Config

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="2xl"
  scrollBehavior="outside"
  backdrop="blur"
  placement="center"
  classNames={{
    base: 'bg-white my-8',
    wrapper: 'items-center justify-center py-8 min-h-full',
    backdrop: 'bg-black/50',
    header: 'border-b border-neutral-200 bg-white py-4 pr-12',
    body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
    footer: 'border-t border-neutral-200 bg-white',
    closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
  }}
>
```

### 6.5 Header

```tsx
<ModalHeader className="flex items-center gap-3">
  <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
    <Settings className="w-4 h-4 text-[#4654CD]" />
  </div>
  <span className="text-lg font-semibold text-neutral-800">
    Configuración del {Sección}
  </span>
</ModalHeader>
```

### 6.6 Body - Descripción Inicial

```tsx
<ModalBody className="py-6 bg-white">
  <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
    Personaliza el diseño seleccionando diferentes versiones de cada componente.
  </p>

  {/* Secciones de componentes */}
</ModalBody>
```

### 6.7 Body - Sección de Componente

```tsx
{/* Primera sección: sin border-top */}
<div className="mb-6">
  <div className="flex items-center gap-2 mb-3">
    <IconComponent className="w-4 h-4 text-[#4654CD]" />
    <h3 className="font-semibold text-neutral-800">Nombre del Componente</h3>
  </div>
  <RadioGroup
    value={config.componentVersion.toString()}
    onValueChange={(val) => onConfigChange({ ...config, componentVersion: parseInt(val) as 1 | 2 })}
    classNames={{ wrapper: 'gap-2' }}
  >
    {[1, 2].map((version) => (
      <Radio
        key={version}
        value={version.toString()}
        classNames={{
          base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
            ${config.componentVersion === version
              ? 'border-[#4654CD] bg-[#4654CD]/5'
              : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`,
          wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
          labelWrapper: 'ml-2',
          label: 'text-sm',
          description: 'text-xs text-neutral-500',
        }}
        description={versionDescriptions.component[version]}
      >
        Versión {version}
      </Radio>
    ))}
  </RadioGroup>
</div>

{/* Secciones siguientes: con border-top */}
<div className="mb-6 pt-4 border-t border-neutral-200">
  {/* ... mismo patrón */}
</div>

{/* Última sección: sin mb-6 */}
<div className="pt-4 border-t border-neutral-200">
  {/* ... mismo patrón */}
</div>
```

### 6.8 Footer (SIN botón Aplicar)

Los cambios se aplican en tiempo real al seleccionar. No necesita botón "Aplicar".

```tsx
<ModalFooter className="bg-white justify-between">
  <Button
    variant="flat"
    startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
    onPress={handleGenerateUrl}
    className={`cursor-pointer transition-colors ${
      copied
        ? 'bg-green-100 text-green-700'
        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
    }`}
  >
    {copied ? '¡Copiado!' : 'Generar URL'}
  </Button>
  <Button
    variant="light"
    startContent={<RotateCcw className="w-4 h-4" />}
    onPress={handleReset}
    className="cursor-pointer"
  >
    Restablecer
  </Button>
</ModalFooter>
```

### 6.9 Función Generar URL

```tsx
const [copied, setCopied] = useState(false);

const handleGenerateUrl = () => {
  const params = new URLSearchParams();
  params.set('component', config.componentVersion.toString());
  // ... más params según la sección

  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

const handleReset = () => {
  onConfigChange(defaultSectionConfig);
};
```

### 6.10 Resumen de Estados Visuales

| Estado | Classes |
|--------|---------|
| Radio normal | `border-neutral-200 hover:border-[#4654CD]/50` |
| Radio seleccionado | `border-[#4654CD] bg-[#4654CD]/5` |
| Botón Generar URL | `bg-neutral-100 text-neutral-700 hover:bg-neutral-200` |
| Botón Copiado | `bg-green-100 text-green-700` |
| Botón Restablecer | `variant="light"` |

### 6.11 Checklist SettingsModal

- [ ] Header con icono Settings en fondo `bg-[#4654CD]/10`
- [ ] Descripción inicial con `border-b`
- [ ] Secciones con icono + título + RadioGroup
- [ ] Solo 2 versiones por componente (V1, V2)
- [ ] Separadores `border-t` entre secciones
- [ ] Footer con "Generar URL" y "Restablecer"
- [ ] **SIN** botón "Aplicar" (cambios en tiempo real)
- [ ] `cursor-pointer` en todos los elementos clickeables

---

## 7. Colores y Estilos

### 7.1 Colores de Marca

```css
--brand-primary: #4654CD;      /* Azul principal */
--brand-primary-hover: #3a47b3;
--brand-primary-light: #4654CD/10;  /* Para backgrounds sutiles */
--brand-secondary: #03DBD0;    /* Cyan/Turquesa */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### 7.2 Clases Comunes

```tsx
// Botón primario
className="bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3] transition-colors"

// Botón secundario/bordered
className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"

// Card con hover
className="border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all"

// Badge/Chip activo
className="border-[#4654CD] bg-[#4654CD]/5"

// Badge/Chip inactivo
className="border-neutral-200 hover:border-[#4654CD]/50"
```

### 7.3 Restricciones

- **NO emojis** en UI → usar `lucide-react` icons
- **NO gradientes** → colores sólidos
- **Cursor pointer** → agregar `cursor-pointer` a todos los elementos clickeables

---

## 8. Responsive Design

### 8.1 Breakpoints

v0.5 debe ser responsive para **Desktop, Tablet y Mobile** usando Tailwind CSS:

| Dispositivo | Breakpoint | Prefijo Tailwind | Viewport |
|-------------|------------|------------------|----------|
| Mobile | Default | (sin prefijo) | < 640px |
| Tablet | sm / md | `sm:` `md:` | 640px - 1024px |
| Desktop | lg / xl | `lg:` `xl:` | > 1024px |

### 8.2 Enfoque Mobile-First

**SIEMPRE** diseñar mobile-first. Los estilos base son para mobile, luego se agregan modificadores para pantallas más grandes:

```tsx
// ✅ Correcto: Mobile-first
<div className="flex flex-col md:flex-row lg:gap-8">
  <aside className="w-full md:w-64 lg:w-80">
  <main className="flex-1">
</div>

// ❌ Incorrecto: Desktop-first
<div className="flex flex-row md:flex-col">
```

### 8.3 Layouts por Dispositivo

#### Mobile (< 640px)
```tsx
// Stack vertical, full width
<div className="flex flex-col gap-4 px-4">
  <Card className="w-full" />
</div>

// Navegación: hamburger menu
// Cards: 1 columna
// Modales: fullscreen o casi fullscreen
// Touch targets: mínimo 44x44px
```

#### Tablet (640px - 1024px)
```tsx
// Grid 2 columnas, sidebar colapsable
<div className="grid grid-cols-2 md:grid-cols-2 gap-4 px-6">
  <Card />
</div>

// Navegación: puede mostrar items principales
// Cards: 2 columnas
// Modales: centrados con max-width
// Sidebar: colapsable o drawer
```

#### Desktop (> 1024px)
```tsx
// Grid 3-4 columnas, sidebar fijo
<div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8">
  <Card />
</div>

// Navegación: completa visible
// Cards: 3-4 columnas
// Modales: centrados
// Sidebar: fijo visible
```

### 8.4 Componentes Responsive Comunes

#### Grid de Cards
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

#### Sidebar + Content
```tsx
<div className="flex flex-col lg:flex-row min-h-screen">
  {/* Sidebar: oculto en mobile, drawer en tablet, fijo en desktop */}
  <aside className="
    fixed inset-y-0 left-0 z-50 w-64 transform -translate-x-full
    lg:relative lg:translate-x-0 lg:w-72
    transition-transform duration-300
  ">
    {/* Contenido sidebar */}
  </aside>

  {/* Main content */}
  <main className="flex-1 p-4 md:p-6 lg:p-8">
    {/* Contenido principal */}
  </main>
</div>
```

#### Texto Responsive
```tsx
// Títulos
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Subtítulos
<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">

// Body
<p className="text-sm md:text-base">
```

#### Spacing Responsive
```tsx
// Padding de contenedores
className="p-4 md:p-6 lg:p-8"

// Gaps
className="gap-4 md:gap-6 lg:gap-8"

// Margins
className="mb-4 md:mb-6 lg:mb-8"
```

### 8.5 Consideraciones por Dispositivo

| Aspecto | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Touch targets | 44x44px mínimo | 44x44px mínimo | 32x32px ok |
| Navegación | Hamburger | Híbrida | Completa |
| Modales | Fullscreen | Centrado md | Centrado lg |
| Sidebar | Drawer/oculto | Drawer | Fijo |
| Cards por fila | 1 | 2 | 3-4 |
| Font base | 14-16px | 16px | 16px |
| Padding contenedor | 16px | 24px | 32px |

### 8.6 Utilidades Responsive

```tsx
// Mostrar/ocultar por dispositivo
className="hidden md:block"      // Oculto en mobile, visible en tablet+
className="block md:hidden"      // Visible en mobile, oculto en tablet+
className="hidden lg:flex"       // Oculto hasta desktop

// Orden responsive
className="order-2 md:order-1"   // Segundo en mobile, primero en tablet+

// Ancho responsive
className="w-full md:w-1/2 lg:w-1/3"
```

### 8.7 Testing Responsive

Verificar en estos viewports:

| Dispositivo | Ancho | Usar para |
|-------------|-------|-----------|
| iPhone SE | 375px | Mobile pequeño |
| iPhone 14 | 390px | Mobile estándar |
| iPad Mini | 768px | Tablet portrait |
| iPad Pro | 1024px | Tablet landscape |
| Laptop | 1366px | Desktop pequeño |
| Desktop | 1920px | Desktop estándar |

### 8.8 Checklist Responsive

- [ ] Mobile: navegación con hamburger
- [ ] Mobile: cards en 1 columna
- [ ] Mobile: modales fullscreen o casi
- [ ] Mobile: touch targets 44x44px
- [ ] Tablet: cards en 2 columnas
- [ ] Tablet: sidebar colapsable
- [ ] Desktop: cards en 3-4 columnas
- [ ] Desktop: sidebar fijo
- [ ] Textos escalan correctamente
- [ ] Spacing aumenta en pantallas grandes

---

## 9. Performance Patterns

### 9.1 Memoización

```typescript
// Filtrados y cálculos costosos
const filteredData = useMemo(() => {
  return processData(data, filters);
}, [data, filters]);

// Callbacks estables
const handleAction = useCallback(() => {
  // acción
}, [dependencies]);
```

### 9.2 Evitar Loading en Primer Render

```typescript
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return; // No mostrar loading en mount inicial
  }

  setIsLoading(true);
  // ...fetch o proceso
}, [dependencies]);
```

### 9.3 Lazy Loading de Imágenes

```tsx
<img
  src={imageUrl}
  alt={description}
  loading="lazy"
  className="w-full h-auto object-contain"
/>
```

---

## 10. Comentarios en Código

### 10.1 Documentación de Componentes

```typescript
/**
 * ComponentV1 - Nombre Descriptivo
 * Descripción breve del patrón/variante
 * Referencia: Sitios que usan este patrón (Amazon, Apple, etc.)
 */
export const ComponentV1: React.FC<Props> = ({ ... }) => {
```

### 10.2 Secciones de Código

```tsx
{/* Header */}
<header>...</header>

{/* Main Content */}
<main>...</main>

{/* Floating Action Buttons */}
<div className="fixed ...">...</div>

{/* Settings Modal */}
<SettingsModal ... />
```

---

## 11. Patrón de Configuración A/B

### 11.1 Implementación Real, No Solo Estado

Cada opción configurable debe tener implementación funcional en los componentes:

```typescript
// ❌ Incorrecto: Se guarda pero no se usa
const hlVersion = config.highlightVersion; // guardado pero ignorado
return <div>{value}</div>; // siempre igual

// ✅ Correcto: Se usa para cambiar comportamiento
const hlVersion = config.highlightVersion;
switch (hlVersion) {
  case 1: return <div className="bg-green-100">{value} <Trophy /></div>;
  case 2: return <div className="bg-amber-50">{value} <Crown /></div>;
  case 3: return <div><ProgressBar />{value}</div>;
  // ... cada versión es diferente
}
```

### 11.2 Versiones Exclusivas, No Combinadas

Cada versión de estilo debe ser independiente:

```tsx
// ❌ Incorrecto: V3 combina con V1 (checkbox siempre visible)
<Checkbox ... /> {/* siempre */}
{cardVersion === 3 && <Ribbon />} {/* adicional */}

// ✅ Correcto: Cada versión es exclusiva
{cardVersion === 1 && <Checkbox ... />}
{cardVersion === 2 && <Badge ... />}
{cardVersion === 3 && <Ribbon ... />}
```

### 11.3 Eliminar Opciones Sin Valor

Si una opción de configuración no produce cambios visibles diferenciables:
1. **Primero**: Intentar implementarla correctamente
2. **Si no aporta valor**: Eliminarla del config, modal, y URL params

```typescript
// Antes: 8 opciones (una no funcionaba)
selectionVersion: 1 | 2 | 3 | 4 | 5 | 6; // ❌ eliminada

// Después: 7 opciones funcionales
// Menos opciones = menos complejidad = mejor UX de testing
```

### 11.4 Props Opcionales con Defaults

Para evitar duplicación de UI (ej: headers en layout + tabla):

```typescript
interface TableProps {
  showProductHeaders?: boolean; // default true
}

// Layout que ya muestra productos
<ComparisonTable showProductHeaders={false} />

// Layout sin productos propios
<ComparisonTable /> // usa default true
```

### 11.5 Versiones con Mismos Datos Necesitan Diferenciadores Visuales

Si múltiples versiones retornan los mismos datos, necesitan otros diferenciadores:

```typescript
// ❌ Problema: V3, V4, V5 todas retornan null (todos los campos)
case 3: return null; // muestra 10 filas
case 4: return null; // muestra 10 filas - ¿cuál es la diferencia?
case 5: return null; // muestra 10 filas

// ✅ Solución: Añadir diferenciadores visuales
case 3: return null; // todos los campos, layout normal
case 4: return null; // todos los campos + animación fadeIn
case 5: return null; // todos los campos + layout split
```

### 11.6 No Eliminar Funcionalidad Sin Entender Contexto A/B

Antes de eliminar código que parece innecesario, verificar si es parte del sistema A/B:

```typescript
// ❌ Error: Eliminar porque "el usuario pidió quitar +S/135"
{renderPriceDiff(index)} // eliminado

// ✅ Correcto: Entender que es necesario para versiones de precio
// El usuario quería quitar un valor específico, no la funcionalidad
// Las 6 versiones de "Diferencia de Precio" dependen de esto
```

---

## 12. URL Query Params y Modo Clean

### 12.1 Query Params para Configuración

Las páginas de preview sincronizan la configuración con la URL mediante query params:

```
/prototipos/0.5/hero/hero-preview?navbar=2&hero=1&cta=2&mode=clean
```

#### Lectura de Params (al cargar)

```tsx
const searchParams = useSearchParams();

const getInitialConfig = (): SectionConfig => {
  return {
    componentVersion: parseVersion(searchParams.get('component')) || defaultConfig.componentVersion,
    // ... más params
  };
};

const parseVersion = (value: string | null): 1 | 2 | null => {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (num >= 1 && num <= 2) return num as 1 | 2;  // v0.5: solo 1-2
  return null;
};
```

#### Actualización de URL (al cambiar config)

```tsx
useEffect(() => {
  const params = new URLSearchParams();

  // Solo incluir params que difieren de defaults (URL limpia)
  if (config.componentVersion !== defaultConfig.componentVersion) {
    params.set('component', config.componentVersion.toString());
  }

  // Preservar mode=clean si está activo
  if (isCleanMode) {
    params.set('mode', 'clean');
  }

  const queryString = params.toString();
  router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
}, [config, router, isCleanMode]);
```

### 12.2 Modo Clean (`mode=clean`)

El modo clean oculta **TODOS** los 8 elementos obligatorios de UI (ver sección 2.0) para presentaciones limpias.

**Implementación:** Return temprano que solo renderiza el contenido principal:

```tsx
const isCleanMode = searchParams.get('mode') === 'clean';

// Return temprano: SOLO contenido principal
if (isCleanMode) {
  return <SectionContent config={config} />;
}

// Modo normal: contenido + los 8 elementos obligatorios
return (
  <div className="relative">
    <SectionContent config={config} />
    <ShortcutToast />
    <ShortcutHelpBadge />
    {/* Floating Action Buttons */}
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <TokenCounter />
      <SettingsButton />
      <CodeButton />
      <BackButton />
    </div>
    <SettingsModal />
    {showConfigBadge && <ConfigBadge />}
  </div>
);
```

#### Los 8 Elementos y su Comportamiento

| # | Elemento | Normal | Clean |
|---|----------|--------|-------|
| 1 | TokenCounter | ✅ Visible | ❌ Oculto |
| 2 | Settings Button | ✅ Visible | ❌ Oculto |
| 3 | Code Button | ✅ Visible | ❌ Oculto |
| 4 | Back Button | ✅ Visible | ❌ Oculto |
| 5 | ShortcutToast | ✅ Activo | ❌ Oculto |
| 6 | ShortcutHelpBadge | ✅ Visible | ❌ Oculto |
| 7 | SettingsModal | ✅ Accesible | ❌ Deshabilitado |
| 8 | ConfigBadge | ✅ Toggle | ❌ Oculto |
| - | **Contenido principal** | ✅ Visible | ✅ **Visible** |

### 12.3 Convenciones de Nombres de Params

Usar nombres cortos y consistentes:

| Componente | Param | Ejemplo |
|------------|-------|---------|
| Navbar | `navbar` | `?navbar=2` |
| Hero Banner | `hero` | `?hero=1` |
| Layout | `layout` | `?layout=2` |
| Card | `card` | `?card=1` |
| Modo | `mode` | `?mode=clean` |

### 12.4 Preservar Params Especiales

Siempre preservar estos params al actualizar la URL:

```tsx
// Preservar mode=clean
if (isCleanMode) {
  params.set('mode', 'clean');
}

// Otros params especiales futuros
// if (debugMode) params.set('debug', 'true');
```

### 12.5 Checklist Query Params

- [ ] Lee params al inicializar config
- [ ] Actualiza URL al cambiar config
- [ ] Solo incluye params ≠ defaults
- [ ] Preserva `mode=clean`
- [ ] Usa `router.replace` con `{ scroll: false }`
- [ ] Parsea valores con validación (1-2 para v0.5)

### 12.6 Feedback en Modo Clean

Cuando `mode=clean` está activo, se muestra un **botón de feedback** (💬) en la esquina inferior derecha para recolectar opiniones durante presentaciones.

#### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| Librería | `modern-screenshot` (soporta CSS moderno: `lab()`, `oklch()`) |
| Visibilidad | Siempre visible en `mode=clean` (sin opción de ocultar) |
| Screenshot | Solo viewport visible, excluye overlay via `filter` |
| Textarea | HTML nativo `<textarea>` (mejor control de altura) |
| Overlay | Card blanca con spinner CSS durante captura |

#### Flujo de Usuario

```
mode=clean activo
    │
    └─→ Botón 💬 aparece (bottom-right, siempre visible)
            │
            └─→ Click en 💬
                    │
                    ├─→ Overlay "Capturando pantalla" aparece
                    │
                    ├─→ Screenshot del viewport (overlay excluido via filter)
                    │
                    └─→ Modal abre con:
                        ├─→ Preview del screenshot
                        ├─→ Textarea "Tu opinión"
                        └─→ Botones "Cancelar" / "Enviar Feedback"
                                │
                                └─→ POST /api/feedback
```

#### Estructura de Archivos

```
src/app/
├── api/
│   └── feedback/
│       └── route.ts              # API endpoint
│
└── prototipos/
    └── _shared/
        ├── components/
        │   ├── FeedbackButton.tsx    # Botón + overlay + modal
        │   └── FeedbackModal.tsx     # Modal con form
        ├── hooks/
        │   └── useScreenshot.ts      # Hook con modern-screenshot
        └── index.ts                  # Exports
```

#### 12.6.1 FeedbackButton

Botón flotante que aparece SOLO en `mode=clean`:

```tsx
// FeedbackButton.tsx
'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackModal } from './FeedbackModal';
import { useScreenshot } from '../hooks/useScreenshot';

interface FeedbackButtonProps {
  sectionId: string;
  config: Record<string, unknown>;
}

export function FeedbackButton({ sectionId, config }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const { captureScreenshot, isCapturing } = useScreenshot();

  const handleOpenFeedback = async () => {
    const captured = await captureScreenshot();
    if (captured) {
      setScreenshot(captured);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Overlay de captura */}
      {isCapturing && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm
            flex items-center justify-center"
          data-feedback-overlay
        >
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-4 border-[#4654CD] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-neutral-800 text-lg font-semibold">
                Capturando pantalla
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                Esto puede tomar unos segundos...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <div
        className="fixed bottom-6 right-6 z-[100]"
        data-feedback-button
      >
        <Button
          isIconOnly
          radius="full"
          isDisabled={isCapturing}
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3]
            transition-all hover:scale-105 w-12 h-12"
          onPress={handleOpenFeedback}
          aria-label="Enviar feedback"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Modal de feedback */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        screenshot={screenshot}
        sectionId={sectionId}
        pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
        config={config}
      />
    </>
  );
}
```

#### 12.6.2 FeedbackModal

Modal con screenshot preview y textarea nativo:

```tsx
// FeedbackModal.tsx
'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { MessageCircle, Send, Check, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshot: string | null;
  sectionId: string;
  pageUrl: string;
  config: Record<string, unknown>;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function FeedbackModal({
  isOpen,
  onClose,
  screenshot,
  sectionId,
  pageUrl,
  config,
}: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = async () => {
    if (!feedbackText.trim() || !screenshot) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot,
          feedbackText,
          pageUrl,
          sectionId,
          configSnapshot: config,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setFeedbackText('');
          setStatus('idle');
        }, 1500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onClose();
      setFeedbackText('');
      setStatus('idle');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      backdrop="blur"
      placement="center"
      hideCloseButton
      classNames={{
        base: 'bg-white rounded-2xl',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-100 pb-4',
        body: 'py-5',
        footer: 'border-t border-neutral-100 pt-4',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-800">
              Enviar Feedback
            </p>
            <p className="text-xs text-neutral-500 font-normal">
              Tu opinión nos ayuda a mejorar
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Preview del screenshot */}
          {screenshot && (
            <div className="mb-5">
              <p className="text-sm font-medium text-neutral-700 mb-2">
                Captura de pantalla adjunta
              </p>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <img
                  src={screenshot}
                  alt="Captura de pantalla"
                  className="w-full h-44 object-cover object-top"
                />
              </div>
            </div>
          )}

          {/* Textarea nativo para feedback */}
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Tu opinión
            </p>
            <textarea
              placeholder="¿Qué te parece este diseño? ¿Qué mejorarías?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              rows={5}
              className="w-full min-h-[140px] px-4 py-3 text-sm
                border-2 border-neutral-200 bg-neutral-50 rounded-xl
                hover:border-neutral-300
                focus:border-[#4654CD] focus:bg-white focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                placeholder:text-neutral-400
                transition-all resize-none"
            />
          </div>

          {/* Mensaje de error */}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Error al enviar. Intenta de nuevo.</span>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="gap-3">
          <Button
            variant="flat"
            onPress={handleClose}
            isDisabled={status === 'loading'}
            className="cursor-pointer bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            isLoading={status === 'loading'}
            isDisabled={!feedbackText.trim() || status === 'success'}
            startContent={
              status === 'success' ? (
                <Check className="w-4 h-4" />
              ) : status !== 'loading' ? (
                <Send className="w-4 h-4" />
              ) : null
            }
            className={`cursor-pointer font-medium ${
              status === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
            }`}
          >
            {status === 'success' ? '¡Enviado!' : 'Enviar Feedback'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

#### 12.6.3 useScreenshot Hook

Hook usando `modern-screenshot` con manejo especial para elementos sticky.

##### Elementos Sticky (headers)

Los elementos `position: sticky` no se capturan correctamente porque:
1. `transform` en el body crea un nuevo contexto de posicionamiento
2. Los elementos sticky pierden su posición visual en el screenshot

**Solución:** Convertir `sticky` → `fixed` compensando el scroll:
- `top: rect.top + window.scrollY`
- `left: rect.left`
- Body se transforma por `-scrollY`, así que `+scrollY` resulta en posición `0` final

**Importante:** Los elementos `<aside>` (sidebars) se EXCLUYEN del fix porque convertirlos a fixed rompe el layout.

##### Scroll Interno (opt-in)

Para elementos con scroll interno que necesitan capturarse en su posición scrolleada, agregar el atributo `data-scroll-fix`:

```html
<div className="overflow-y-auto max-h-[500px]" data-scroll-fix>
  <!-- contenido scrolleable -->
</div>
```

**Nota:** El fix de scroll interno NO se aplica automáticamente porque puede interferir con otros elementos. Solo se activa con el atributo explícito.

##### Implementación

```tsx
// hooks/useScreenshot.ts
'use client';

import { useState, useCallback } from 'react';
import { domToJpeg } from 'modern-screenshot';

interface StickyElementFix {
  type: 'sticky';
  el: HTMLElement;
  originalPosition: string;
  originalTop: string;
  originalLeft: string;
  originalWidth: string;
}

interface ScrollElementFix {
  type: 'scroll';
  el: HTMLElement;
  wrapper: HTMLElement;
  originalScrollTop: number;
}

type ElementFix = StickyElementFix | ScrollElementFix;

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    setIsCapturing(true);
    const elementsToFix: ElementFix[] = [];

    try {
      // 1. Scroll interno (solo con data-scroll-fix)
      document.querySelectorAll('[data-scroll-fix]').forEach((el) => {
        if (el instanceof HTMLElement && el.scrollTop > 0) {
          const currentScrollTop = el.scrollTop;

          // Wrapper temporal para todos los hijos
          const wrapper = document.createElement('div');
          wrapper.style.transform = `translateY(-${currentScrollTop}px)`;

          while (el.firstChild) {
            wrapper.appendChild(el.firstChild);
          }
          el.appendChild(wrapper);

          elementsToFix.push({
            type: 'scroll',
            el,
            wrapper,
            originalScrollTop: currentScrollTop,
          });

          el.scrollTop = 0;
        }
      });

      // 2. Sticky → Fixed (excepto aside/sidebars)
      document.querySelectorAll('*').forEach((el) => {
        if (el instanceof HTMLElement) {
          const computed = getComputedStyle(el);

          if (computed.position === 'sticky') {
            // Excluir feedback y sidebars
            if (
              el.closest('[data-feedback-button]') ||
              el.closest('[data-feedback-overlay]') ||
              el.tagName.toLowerCase() === 'aside' ||
              el.closest('aside')
            ) {
              return;
            }

            const rect = el.getBoundingClientRect();

            elementsToFix.push({
              type: 'sticky',
              el,
              originalPosition: 'sticky',
              originalTop: el.style.top,
              originalLeft: el.style.left,
              originalWidth: el.style.width,
            });

            el.style.position = 'fixed';
            el.style.top = `${rect.top + window.scrollY}px`;
            el.style.left = `${rect.left}px`;
            el.style.width = `${rect.width}px`;
          }
        }
      });

      // 3. Capturar viewport
      const dataUrl = await domToJpeg(document.body, {
        quality: 0.8,
        scale: 1,
        width: window.innerWidth,
        height: window.innerHeight,
        style: {
          transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`,
        },
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !(
              node.hasAttribute('data-feedback-button') ||
              node.hasAttribute('data-feedback-overlay') ||
              node.closest('[data-feedback-button]') ||
              node.closest('[data-feedback-overlay]')
            );
          }
          return true;
        },
      });

      return dataUrl;
    } catch (error) {
      console.error('Error capturando screenshot:', error);
      return null;
    } finally {
      // Restaurar
      elementsToFix.forEach((fix) => {
        if (fix.type === 'sticky') {
          fix.el.style.position = fix.originalPosition;
          fix.el.style.top = fix.originalTop;
          fix.el.style.left = fix.originalLeft;
          fix.el.style.width = fix.originalWidth;
        } else if (fix.type === 'scroll') {
          while (fix.wrapper.firstChild) {
            fix.el.appendChild(fix.wrapper.firstChild);
          }
          fix.wrapper.remove();
          fix.el.scrollTop = fix.originalScrollTop;
        }
      });
      setIsCapturing(false);
    }
  }, []);

  return { captureScreenshot, isCapturing };
}
```

##### Limitaciones Conocidas

| Escenario | Estado | Solución |
|-----------|--------|----------|
| Sticky headers | ✅ Funciona | Automático |
| Sticky sidebars (`<aside>`) | ⚠️ No se modifica | Se captura en posición natural |
| Scroll interno en sidebar | ⚠️ No se captura | Limitación aceptada |
| Scroll interno con `data-scroll-fix` | ✅ Funciona | Requiere atributo explícito |

**Notas técnicas:**
- `getBoundingClientRect()` devuelve posición relativa al viewport
- Los sidebars sticky se excluyen porque convertirlos a fixed rompe el layout flex
- El scroll interno usa wrapper + transform para simular posición
- Siempre restaurar estilos en `finally` para garantizar ejecución

#### 12.6.4 Integración en Páginas de Preview

Agregar FeedbackButton en el return de `mode=clean`:

```tsx
// En page.tsx de cada sección
import { FeedbackButton } from '@/app/prototipos/_shared';

const isCleanMode = searchParams.get('mode') === 'clean';

if (isCleanMode) {
  return (
    <>
      {renderContent()}
      <FeedbackButton
        sectionId="nombre-seccion"  // ej: "catalogo", "hero"
        config={config as unknown as Record<string, unknown>}
      />
    </>
  );
}
```

#### 12.6.5 API Endpoint

```tsx
// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface FeedbackPayload {
  screenshot: string;
  feedbackText: string;
  pageUrl: string;
  sectionId: string;
  configSnapshot: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    if (!body.screenshot || !body.feedbackText) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // TODO: Conectar a backend real (Supabase, Firebase, webhook, etc.)
    console.log('═══════════════════════════════════════════');
    console.log('📝 FEEDBACK RECIBIDO');
    console.log('═══════════════════════════════════════════');
    console.log('Sección:', body.sectionId);
    console.log('URL:', body.pageUrl);
    console.log('Texto:', body.feedbackText);
    console.log('Timestamp:', body.timestamp);
    console.log('Screenshot size:', Math.round(body.screenshot.length / 1024), 'KB');
    console.log('═══════════════════════════════════════════');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando feedback:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
```

#### 12.6.6 Instalación de Dependencia

```bash
npm install modern-screenshot
```

> **Nota:** Se usa `modern-screenshot` en lugar de `html2canvas` porque soporta funciones de color CSS modernas (`lab()`, `oklch()`, etc.) que usa Tailwind v4.

#### 12.6.7 Datos Enviados a API

```typescript
interface FeedbackEntry {
  screenshot: string;              // Base64 JPEG (calidad 0.8)
  feedbackText: string;            // Texto del usuario
  pageUrl: string;                 // URL completa con params
  sectionId: string;               // Ej: "catalogo", "hero"
  configSnapshot: object;          // Config actual de la sección
  timestamp: string;               // ISO 8601
  userAgent: string;               // Browser/device info
}
```

#### 12.6.8 Checklist FeedbackButton

- [ ] Dependencia `modern-screenshot` instalada
- [ ] FeedbackButton.tsx en `_shared/components/`
- [ ] FeedbackModal.tsx en `_shared/components/`
- [ ] useScreenshot.ts en `_shared/hooks/`
- [ ] Exports en `_shared/index.ts`
- [ ] API endpoint `/api/feedback` creado
- [ ] Integrado en return de `mode=clean` de la sección
- [ ] Atributo `data-feedback-button` en el contenedor del botón
- [ ] Atributo `data-feedback-overlay` en el overlay
- [ ] Estados de loading/success/error en modal

---

## 13. Checklist de Validación

Antes de finalizar cualquier iteración, verificar:

### Ortografía
- [ ] Títulos con tildes correctas
- [ ] Labels y placeholders revisados
- [ ] Tooltips y descripciones
- [ ] Comentarios de código

### UI Consistency
- [ ] Floating controls implementados
- [ ] Config badge funcional (oculto por default)
- [ ] TokenCounter incluido
- [ ] Botón de regreso a índice

### TypeScript
- [ ] Tipos union definidos (no `string[]` genéricos)
- [ ] Props tipadas correctamente
- [ ] Config interface con defaults

### Next.js
- [ ] Suspense boundary si usa useSearchParams
- [ ] 'use client' donde corresponde
- [ ] Router imports de next/navigation

### Performance
- [ ] useMemo para cálculos costosos
- [ ] Lazy loading en imágenes
- [ ] No loading en primer render

---

## 14. Versionado de Documento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-01-06 | Versión inicial basada en v0.4 |
| 1.1 | 2025-01-06 | Reducido a 2 versiones (V1-V2) |
| 1.2 | 2025-01-06 | Patrón SettingsModal detallado (basado en HeroSettingsModal), sin botón Aplicar |
| 1.3 | 2025-01-06 | Sección Responsive Design (mobile-first, breakpoints, layouts) |
| 1.4 | 2025-01-06 | Sección URL Query Params y Modo Clean |
| 1.5 | 2025-01-06 | 8 elementos obligatorios en páginas preview + comportamiento mode=clean |
| 1.6 | 2025-01-06 | FeedbackButton para mode=clean (screenshot + texto → API) |
| 1.7 | 2026-01-06 | useScreenshot: excluir sidebars de sticky fix, scroll interno opt-in con `data-scroll-fix` |

---

*Este documento es cargado automáticamente por `/iterar` y aplica a todas las secciones.*
