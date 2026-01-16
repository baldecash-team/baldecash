# Convenciones Globales - BaldeCash v0.5

> Reglas que aplican a **TODOS** los módulos en `src/app/prototipos/0.5/`
> Estas convenciones son cargadas automáticamente por el comando `/iterar`

---

## ⚠️ CONSULTA OBLIGATORIA ANTES DE IMPLEMENTAR

**IMPORTANTE:** Antes de implementar cualquiera de estos patrones, el asistente DEBE leer la sección correspondiente de este documento:

| Cuando se pida... | Consultar sección |
|-------------------|-------------------|
| **Loading / Preload / Spinner** en botones | **8.6** Botones con Estado de Carga |
| **Input / TextField** | **8.7.2** TextInput - Estructura Estándar |
| **Textarea** | **8.7.3** TextArea - Estructura Estándar |
| **Select / Dropdown** | **8.7.4** SelectInput - Estructura Estándar |
| **File Upload / Drag & Drop** | **8.7.5** FileUpload - Estructura Estándar |
| **Fecha / DatePicker** | **8.7.5.1** DateInput - Calendario Popup |
| **Validación de formularios** | **8.7.8** Validación de Estados |
| **Selector con 2-3 opciones** | **8.2** SegmentedControl |
| **Selector con 4-5 opciones** | **8.3** RadioGroup |
| **Selector con 6+ opciones** | **8.4** SelectInput con buscador |
| **Modal de configuración** | **6** Settings Modal Pattern |
| **Botón Settings / Tuerca** | **6.4.1** Botón Settings (border-radius 14px) |
| **Formato de dinero/precios** | **7** Formato de Moneda |
| **FeedbackButton** | **12.8** Feedback en Modo Clean |
| **mode=clean** | **12.2** Modo Clean |
| **Fondos, efectos glow, cards destacadas** | **9.3.1** Prohibición de Gradientes |
| **Cursor, hover, elementos clickeables** | **9.3.2** Cursor Pointer - Elementos Clickeables |
| **Sombras, bordes, estilos de cards** | **9.3.3** Card Styling Standards |
| **Colores, estilos visuales** | **9** Colores y Estilos |
| **Toast / Notificaciones / Mensajes** | **9.5** Toast Notifications |
| **Filtros con conteo de resultados** | **16** Filtros con Conteo |
| **Validación de campos en wizard** | **8.7.11** Validación de Campos en Wizard |
| **localStorage / persistencia de estado** | **18** localStorage Persistence Pattern |
| **Grid de cards / catálogo** | **19** Responsive Card Grid Pattern |
| **Popup / Modal / Drawer en Mobile** | **20** Mobile Bottom Sheet Pattern |
| **Tooltip / Ayuda contextual** | **21** FieldTooltip Component |

> Esta tabla existe para evitar implementaciones incorrectas. El asistente debe leer la sección completa antes de escribir código.

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
    base: 'bg-white my-8 rounded-[14px]',
    wrapper: 'items-center justify-center py-8 min-h-full',
    backdrop: 'bg-black/50',
    header: 'border-b border-neutral-200 bg-white py-4 pr-12 rounded-t-[14px]',
    body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
    footer: 'border-t border-neutral-200 bg-white rounded-b-[14px]',
    closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
  }}
>
```

### 6.4.1 Botón Settings (Tuerca)

El botón flotante que abre el modal de configuración debe usar `borderRadius: 14px`:

```tsx
<Button
  isIconOnly
  className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
  style={{ borderRadius: '14px' }}
  onPress={() => setIsSettingsOpen(true)}
>
  <Settings className="w-5 h-5" />
</Button>
```

**Estándar de border-radius 14px:**

| Elemento | Implementación |
|----------|----------------|
| Botón Settings | `style={{ borderRadius: '14px' }}` |
| Modal base | `base: '... rounded-[14px]'` |
| Modal header | `header: '... rounded-t-[14px]'` |
| Modal footer | `footer: '... rounded-b-[14px]'` |
| Botón Comparar | `style={{ borderRadius: '14px' }}` |

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
        V{version} - {versionLabels.component[version].name}
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

## 7. Formato de Moneda

### 7.1 Utilidad Centralizada

**SIEMPRE** usar la función `formatMoney()` para mostrar montos de dinero. Nunca usar `.toFixed()` o valores sin formato.

**Ubicación:** `src/app/prototipos/0.5/utils/formatMoney.ts`

```typescript
// Importar desde la utilidad central
import { formatMoney } from '../../utils/formatMoney';  // ajustar ruta según profundidad
```

### 7.2 Formato Estándar

| Valor Original | Formato Correcto | Formato Incorrecto |
|----------------|------------------|-------------------|
| `3204` | `3,204` | `3204` o `3,204.00` |
| `3204.5` | `3,204.50` | `3204.5` |
| `180` | `180` | `180.00` |
| `1500.99` | `1,500.99` | `1500.99` |

**Regla:** Mostrar decimales solo si el número tiene decimales significativos (no `.00`).

### 7.3 Implementación

```typescript
// formatMoney.ts
export const formatMoney = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

// Para casos que siempre requieren sin decimales (ej: contadores)
export const formatMoneyNoDecimals = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
```

### 7.4 Uso en Componentes

```tsx
// ✅ Correcto
import { formatMoney } from '../../../../utils/formatMoney';

<span>S/{formatMoney(product.price)}</span>
<span>S/{formatMoney(quota)}/mes</span>
<span>Total: S/{formatMoney(totalAmount)}</span>

// ❌ Incorrecto
<span>S/{product.price}</span>
<span>S/{product.price.toFixed(2)}</span>
<span>S/{product.price.toLocaleString()}</span>
```

### 7.5 Ajuste de Ruta de Import

La ruta del import depende de la profundidad del archivo:

| Ubicación del Archivo | Import |
|----------------------|--------|
| `/0.5/seccion/components/` | `../../../utils/formatMoney` |
| `/0.5/seccion/components/subdir/` | `../../../../utils/formatMoney` |
| `/0.5/seccion/components/subdir/deep/` | `../../../../../utils/formatMoney` |

### 7.6 Checklist Formato de Moneda

- [ ] Usar `formatMoney()` para todos los precios y cuotas
- [ ] Import desde `utils/formatMoney.ts` (ruta relativa correcta)
- [ ] Formato: separador de miles (`,`) + decimales solo si son significativos
- [ ] Prefijo `S/` antes del valor formateado
- [ ] No usar `.toFixed()`, `.toLocaleString()` directamente

---

## 8. Componentes de Selección

### 8.1 Regla según Cantidad de Opciones

| Cantidad de Opciones | Componente | Descripción |
|---------------------|------------|-------------|
| 2-3 opciones | `SegmentedControl` | Botones inline tipo tabs/toggle |
| 4-5 opciones | `RadioGroup` | Cards verticales con radio button |
| 6+ opciones | `SelectInput` con buscador | Dropdown searchable |

### 8.2 SegmentedControl (2-3 opciones)

**Ubicación:** `wizard-solicitud/components/wizard-solicitud/fields/SegmentedControl.tsx`

Usado para campos con pocas opciones mutuamente excluyentes (ej: Tipo de Documento, Tipo de Institución).

```tsx
// Estructura visual - SIEMPRE 100% del ancho del contenedor
<div className="flex w-full p-1 rounded-xl bg-neutral-100 border border-neutral-200">
  <button className="flex-1 py-2.5 text-sm font-medium rounded-lg">
    Opción A
  </button>
  <button className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-[#4654CD]/15 text-[#4654CD]">
    Opción B (seleccionada)
  </button>
</div>
```

**Estilos:**
- Contenedor: `flex w-full bg-neutral-100 rounded-xl p-1 border border-neutral-200`
- Botones: `flex-1 py-2.5` (distribuidos equitativamente, ocupan 100% del ancho)
- Opción seleccionada: `bg-[#4654CD]/15 text-[#4654CD] rounded-lg` (fondo tenue, texto primario)
- Opción no seleccionada: `text-neutral-600 hover:text-neutral-800`
- Animación: Framer Motion `layoutId` para transición suave

### 8.3 RadioGroup (4-5 opciones)

**Ubicación:** `wizard-solicitud/components/wizard-solicitud/fields/RadioGroup.tsx`

Usado para campos con más opciones que necesitan descripción. Cards clickeables sin círculo radio.

```tsx
// Estructura visual - Estado seleccionado
<button className="w-full p-4 rounded-xl border-2 bg-[#4654CD]/5 border-[#4654CD]">
  <p className="text-[#4654CD] font-medium">Opción seleccionada</p>
</button>

// Estructura visual - Estado no seleccionado
<button className="w-full p-4 rounded-xl border-2 bg-white border-neutral-200">
  <p className="text-neutral-800 font-medium">Opción no seleccionada</p>
</button>
```

**Estilos:**
- Seleccionado: `bg-[#4654CD]/5 border-[#4654CD]`, texto `text-[#4654CD]`
- No seleccionado: `bg-white border-neutral-200 hover:border-[#4654CD]/50`, texto `text-neutral-800`
- **Sin círculo radio** - la selección se indica solo con borde y fondo

### 8.4 SelectInput con buscador (6+ opciones)

**Ubicación:** `wizard-solicitud/components/wizard-solicitud/fields/SelectInput.tsx`

Usado para listas largas (carreras, universidades, ciudades, etc.).

### 8.5 Checklist Componentes de Selección

- [ ] Contar opciones antes de elegir componente
- [ ] 2-3 opciones → `SegmentedControl`
- [ ] 4-5 opciones → `RadioGroup`
- [ ] 6+ opciones → `SelectInput` con buscador
- [ ] Mantener consistencia en todo el wizard

### 8.6 Botones con Estado de Carga (Loading)

**Regla:** Los botones de NextUI con `isLoading` deben usar un spinner personalizado con `Loader2` de lucide-react para asegurar la animación.

```tsx
import { Loader2 } from 'lucide-react';
import { Button } from '@nextui-org/react';

// ✅ Correcto - Spinner animado
<Button
  isLoading={isSubmitting}
  spinner={<Loader2 className="w-5 h-5 animate-spin" />}
  onPress={handleSubmit}
>
  Enviar Solicitud
</Button>

// ❌ Incorrecto - Sin spinner personalizado (puede no animar)
<Button
  isLoading={isSubmitting}
  onPress={handleSubmit}
>
  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
</Button>
```

**Notas:**
- El texto del botón se mantiene fijo, NextUI lo oculta automáticamente cuando `isLoading={true}`
- No usar texto condicional (`isSubmitting ? 'Cargando...' : 'Enviar'`), el spinner reemplaza el contenido
- Usar `Loader2` de lucide-react con clase `animate-spin` de Tailwind

### 8.7 Estándares de Campos de Formulario

> **Referencia:** Basado en componentes de `wizard-solicitud/components/wizard-solicitud/fields/`

Todos los campos de formulario (inputs, textareas, selects, file uploads) deben seguir estos estándares visuales y de comportamiento.

#### 8.7.1 Colores y Estados

| Estado | Border Color | Background | Icono |
|--------|--------------|------------|-------|
| **Default** | `border-neutral-300` | `bg-white` | - |
| **Focus** | `border-[#4654CD]` | `bg-white` | - |
| **Success** | `border-[#22c55e]` | `bg-white` | `Check` verde |
| **Error** | `border-[#ef4444]` | `bg-white` | `AlertCircle` rojo |
| **Disabled** | `border-neutral-300` | `bg-neutral-50` | - (opacity-50) |

#### 8.7.2 TextInput - Estructura Estándar

```tsx
// Props interface
interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}

// Estructura visual
<div className="space-y-1.5">
  {/* Label */}
  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
    {label}
    {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
    {tooltip && <TooltipIcon />}
  </label>

  {/* Help text (opcional) */}
  {helpText && <p className="text-xs text-neutral-500">{helpText}</p>}

  {/* Input container */}
  <div className={`
    flex items-center gap-2 h-11 px-3
    rounded-lg border-2 transition-all duration-200 bg-white
    ${getBorderColor()}
    ${disabled ? 'opacity-50 bg-neutral-50' : ''}
  `}>
    <input
      className="flex-1 bg-transparent outline-none text-base text-neutral-800 placeholder:text-neutral-400"
      ...
    />
    {/* Status icons - lado derecho */}
    {showSuccess && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
    {showError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
  </div>

  {/* Error message & Character counter */}
  {(error || maxLength) && (
    <div className="flex items-center justify-between gap-2">
      {error ? (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      ) : <span />}
      {maxLength && (
        <p className="text-xs text-neutral-400 flex-shrink-0">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  )}
</div>
```

#### 8.7.3 TextArea - Estructura Estándar

```tsx
// Props interface
interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;  // OBLIGATORIO para textareas
}

// Estructura visual
<div className="space-y-1.5">
  {/* Label */}
  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
    {label}
    {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
  </label>

  {/* Textarea container */}
  <div className={`
    relative rounded-lg border-2 transition-all duration-200 bg-white
    ${getBorderColor()}
    ${disabled ? 'opacity-50 bg-neutral-50' : ''}
  `}>
    <textarea
      rows={rows || 4}
      maxLength={maxLength}
      className="w-full pl-3 pr-10 py-3 bg-transparent outline-none text-base text-neutral-800 placeholder:text-neutral-400 resize-none"
      ...
    />
    {/* Status icons - esquina superior derecha */}
    <div className="absolute top-3 right-3">
      {showSuccess && <Check className="w-5 h-5 text-[#22c55e]" />}
      {showError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
    </div>
  </div>

  {/* Character counter (OBLIGATORIO) & Error message */}
  <div className="flex items-center justify-between gap-2">
    {error ? (
      <p className="text-sm text-[#ef4444] flex items-center gap-1">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error}
      </p>
    ) : <span />}
    <p className="text-xs text-neutral-400 flex-shrink-0">
      {value.length}/{maxLength}
    </p>
  </div>
</div>
```

**Reglas:**
- Los textareas SIEMPRE deben tener `maxLength` definido y mostrar contador de caracteres.
- El textarea debe usar `pl-3 pr-10 py-3` (NO `p-3`) para evitar que el texto se superponga con el ícono de status en la esquina superior derecha.

#### 8.7.4 SelectInput - Estructura Estándar

```tsx
// Props interface
interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;  // default: true para 6+ opciones
}

// Estructura visual del trigger
<div className={`
  w-full h-11 px-3 flex items-center justify-between gap-2
  rounded-lg border-2 transition-all cursor-pointer text-left
  ${getBorderColor()}
`}>
  <span className={selectedOption ? 'text-neutral-800' : 'text-neutral-400'}>
    {selectedOption?.label || placeholder}
  </span>
  <div className="flex items-center gap-1">
    {value && <ClearButton />}
    {showSuccess && <Check className="w-5 h-5 text-[#22c55e]" />}
    {showError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
    <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </div>
</div>

// Dropdown con búsqueda
<div className="absolute z-50 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg">
  {searchable && (
    <div className="p-2 border-b border-neutral-100">
      <div className="flex items-center gap-2 h-9 px-3 bg-neutral-50 rounded-md">
        <Search className="w-4 h-4 text-neutral-400" />
        <input placeholder="Buscar..." ... />
      </div>
    </div>
  )}
  <div className="max-h-60 overflow-y-auto p-1">
    {filteredOptions.map(option => (
      <button className={`
        w-full px-3 py-2 text-left text-sm rounded-md cursor-pointer
        ${selected ? 'bg-[#4654CD] text-white' : 'text-neutral-700 hover:bg-[#4654CD]/10 hover:text-[#4654CD]'}
      `}>
        {option.label}
      </button>
    ))}
  </div>
</div>
```

#### 8.7.5 FileUpload - Estructura Estándar

```tsx
// Props interface
interface FileUploadProps {
  id: string;
  label: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;        // default: '.pdf,.jpg,.jpeg,.png'
  maxFiles?: number;      // default: 1
  maxSize?: number;       // default: 5MB (5 * 1024 * 1024)
  error?: string;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

// Drop zone visual
<div className={`
  relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
  ${isDragging ? 'border-[#4654CD] bg-[#4654CD]/5'
    : showError ? 'border-red-300 bg-red-50'
    : hasFiles ? 'border-green-300 bg-green-50'
    : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400'}
`}>
  <div className="flex flex-col items-center gap-2">
    {showError ? <AlertCircle className="w-8 h-8 text-red-400" />
      : hasFiles ? <CheckCircle2 className="w-8 h-8 text-green-500" />
      : <Upload className="w-8 h-8 text-neutral-400" />}
    <p className="text-sm text-neutral-600">
      {isDragging ? 'Suelta el archivo aquí'
        : hasFiles ? 'Arrastra más archivos o haz clic para agregar'
        : 'Arrastra y suelta o haz clic para seleccionar'}
    </p>
    <p className="text-xs text-neutral-400">
      {accept} • Máx {formatSize(maxSize)}
    </p>
  </div>
</div>

// Lista de archivos subidos
{hasFiles && (
  <div className="space-y-2 mt-2">
    {value.map(file => (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
        {file.preview ? <img ... /> : <FileIcon />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-neutral-500">{formatSize(file.size)}</p>
        </div>
        <RemoveButton />
      </div>
    ))}
  </div>
)}
```

#### 8.7.5.1 DateInput - Calendario Popup

**Ubicación:** `wizard-solicitud/components/wizard-solicitud/fields/DateInput.tsx`

**IMPORTANTE:** Para campos de fecha de nacimiento u otras fechas, usar SIEMPRE `DateInput` en lugar de `TextInput` con `type="date"`.

```tsx
interface DateInputProps {
  id: string;
  label: string;
  value: string;                    // Formato: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;             // Default: 'Selecciona una fecha'
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;               // Default: true
  minAge?: number;                  // Edad mínima requerida (default: 18)
}
```

**Ejemplo de uso:**

```tsx
import { DateInput } from '../../components/wizard-solicitud/fields';

<DateInput
  id="fechaNacimiento"
  label="Fecha de Nacimiento"
  value={(getFieldValue('fechaNacimiento') as string) || ''}
  onChange={(v) => handleFieldChange('fechaNacimiento', v)}
  onBlur={() => handleFieldBlur('fechaNacimiento')}
  error={getFieldError('fechaNacimiento')}
  success={isFieldValid('fechaNacimiento')}
  tooltip={datosPersonalesTooltips.fechaNacimiento}
  required
/>
```

**Características:**
- Calendario popup con Popover de NextUI
- Navegación mes/año con flechas
- Selector rápido de años (1990, 1995, 2000, 2005)
- Restricción de edad mínima configurable (`minAge` prop)
- Fechas futuras o muy recientes deshabilitadas automáticamente
- Formato de display: "DD de mes de YYYY" (ej: "15 de marzo de 2000")
- Mismo estilo visual que otros campos (border-2, iconos de estado, colores)

**❌ NO usar:**
```tsx
// INCORRECTO - No usar TextInput para fechas
<TextInput
  id="fechaNacimiento"
  type="date"
  ...
/>
```

**✅ Usar:**
```tsx
// CORRECTO - Usar DateInput
<DateInput
  id="fechaNacimiento"
  ...
/>
```

#### 8.7.6 Función getBorderColor

Todos los campos usan la misma lógica para determinar el color del borde:

```tsx
const getBorderColor = () => {
  if (showError) return 'border-[#ef4444]';
  if (showSuccess) return 'border-[#22c55e]';
  if (isFocused) return 'border-[#4654CD]';
  return 'border-neutral-300';
};
```

#### 8.7.7 Tooltip Info Pattern

```tsx
interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

// Implementación con NextUI Tooltip
<Tooltip
  content={
    <div className="max-w-xs p-2">
      <p className="font-semibold text-neutral-800">{tooltip.title}</p>
      <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
      {tooltip.recommendation && (
        <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {tooltip.recommendation}
        </p>
      )}
    </div>
  }
  classNames={{ content: 'bg-white shadow-lg border border-neutral-200' }}
>
  <span className="inline-flex">
    <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help" />
  </span>
</Tooltip>
```

#### 8.7.8 Validación de Estados

```tsx
// Estado touched - solo mostrar success/error después de interacción
const [touched, setTouched] = useState(false);

const showError = touched && !!error;
const showSuccess = touched && !error && value.trim().length > 0;

// En onBlur del input
onBlur={() => setTouched(true)}
```

#### 8.7.9 Imports Requeridos

```tsx
import { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Check, AlertCircle, Info, ChevronDown, Search, Upload, X, FileText, Image, CheckCircle2 } from 'lucide-react';
```

#### 8.7.10 Checklist Campos de Formulario

- [ ] **TextInput**: border-2, h-11, iconos dentro del container (lado derecho)
- [ ] **DateInput**: Usar para campos de fecha (NO usar TextInput type="date")
- [ ] **TextArea**: border-2, iconos posición absoluta (top-3 right-3)
- [ ] **TextArea**: SIEMPRE incluir maxLength y contador de caracteres
- [ ] **SelectInput**: Dropdown con búsqueda para 6+ opciones
- [ ] **FileUpload**: Zona drag & drop con estados visuales diferenciados
- [ ] **Todos**: Usar `getBorderColor()` consistentemente
- [ ] **Todos**: Mensaje de error con icono AlertCircle
- [ ] **Todos**: Icono Check verde para success
- [ ] **Todos**: `disabled` usa opacity-50 y bg-neutral-50
- [ ] **Todos**: Estado `touched` para mostrar validación solo después de interacción

#### 8.7.11 Validación de Campos en Wizard

**Campos Requeridos vs Opcionales:**

| Prop | Comportamiento |
|------|----------------|
| `required` (default) | Muestra asterisco, valida en submit |
| `required={false}` | Muestra "(Opcional)", no valida |

**Función validateStep() - Patrón Estándar:**

```tsx
const validateStep = (): boolean => {
  let isValid = true;

  const campo = getFieldValue('campo') as string;
  if (!campo || !campo.trim()) {
    setFieldError('campo', 'Este campo es requerido');
    isValid = false;
  }

  // Validación condicional (campo visible solo cuando otro tiene valor específico)
  if (campoTipo === 'otro') {
    const otroCampo = getFieldValue('otroCampo') as string;
    if (!otroCampo || !otroCampo.trim()) {
      setFieldError('otroCampo', 'Este campo es requerido');
      isValid = false;
    }
  }

  return isValid;
};

const handleNext = () => {
  if (validateStep()) {
    markStepCompleted('step-id');
    setShowCelebration(true);
  }
};
```

**Toggle Behavior en SegmentedControl/RadioGroup:**

Permite deseleccionar haciendo clic en la opción ya seleccionada:

```tsx
onClick={() => {
  if (option.disabled || disabled) return;
  // Toggle: si ya está seleccionado, limpiar
  if (value === option.value) {
    onChange('');
  } else {
    onChange(option.value);
  }
}}
```

---

## 9. Colores y Estilos

### 9.1 Colores de Marca

```css
--brand-primary: #4654CD;      /* Azul principal */
--brand-primary-hover: #3a47b3;
--brand-primary-light: #4654CD/10;  /* Para backgrounds sutiles */
--brand-secondary: #03DBD0;    /* Cyan/Turquesa */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### 9.2 Clases Comunes

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

### 9.3 Restricciones

- **NO emojis** en UI → usar `lucide-react` icons
- **NO gradientes** → colores sólidos (ver 9.3.1)
- **Cursor pointer** → agregar `cursor-pointer` a todos los elementos clickeables (ver 9.3.2)

#### 9.3.1 Prohibición de Gradientes

**REGLA ABSOLUTA:** No usar gradientes en ningún componente. Solo colores sólidos.

```tsx
// ❌ PROHIBIDO - Gradientes
className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0]"
className="bg-gradient-to-br from-[#4654CD]/5 to-white"
className="bg-gradient-to-r from-[#4654CD]/20 via-[#4654CD]/30 to-[#4654CD]/20"

// ✅ CORRECTO - Colores sólidos
className="bg-[#4654CD]"
className="bg-[#4654CD]/5"
className="bg-[#4654CD]/20"
className="bg-white"
```

**Aplica a:**
- Fondos de cards, botones, badges
- Efectos glow/blur (usar color sólido con opacity)
- Bordes y overlays
- Cualquier elemento visual

**Verificación:**
```bash
# Buscar gradientes en el código
grep -rn "gradient" src/app/prototipos/0.5/ --include="*.tsx"
```

Si el resultado no está vacío, hay violaciones que corregir.

#### 9.3.2 Cursor Pointer - Elementos Clickeables

**REGLA:** Todo elemento interactivo/clickeable DEBE tener `cursor-pointer` para indicar visualmente que es clickeable.

**Elementos que SIEMPRE requieren `cursor-pointer`:**

| Elemento | Ejemplo |
|----------|---------|
| Botones custom (`<button>`) | Filtros avanzados, toggles, acciones |
| Iconos de acción | Favoritos, comparar, cerrar, expandir |
| Cards clickeables | Producto seleccionable, opción de lista |
| Links/anchors estilizados | Navegación, breadcrumbs |
| Chips/badges seleccionables | Filtros, tags, opciones |
| Elementos con `onClick` | Cualquier div/span con handler |

```tsx
// ❌ INCORRECTO - Falta cursor-pointer
<button
  onClick={() => setShowAdvanced(!showAdvanced)}
  className="flex items-center gap-2 text-sm hover:text-[#4654CD]"
>
  <ChevronDown />
  Filtros Avanzados
</button>

// ✅ CORRECTO - Con cursor-pointer
<button
  onClick={() => setShowAdvanced(!showAdvanced)}
  className="flex items-center gap-2 text-sm hover:text-[#4654CD] cursor-pointer"
>
  <ChevronDown />
  Filtros Avanzados
</button>
```

**Estados de cursor según contexto:**

| Estado | Clase | Uso |
|--------|-------|-----|
| Clickeable | `cursor-pointer` | Elementos interactivos activos |
| Deshabilitado | `cursor-not-allowed` | Elementos deshabilitados |
| Cargando | `cursor-wait` | Durante operaciones async |
| Default | (ninguna) | Texto, contenido no interactivo |

```tsx
// Ejemplo: Botón con estados
<button
  disabled={isDisabled}
  className={`p-2 rounded-full transition-all ${
    isSelected
      ? 'bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3]'
      : isDisabled
        ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
        : 'bg-white hover:bg-[#4654CD]/10 cursor-pointer'
  }`}
>
  <Icon />
</button>
```

**Nota sobre NextUI:** Los componentes `<Button>` de NextUI ya incluyen `cursor-pointer` por defecto. Esta regla aplica principalmente a elementos `<button>`, `<div>`, `<span>` con handlers onClick personalizados.

#### 9.3.3 Card Styling Standards

**REGLA:** Todas las cards de contenido deben usar el mismo estilo unificado para mantener consistencia visual.

| Propiedad | Valor | Clase Tailwind |
|-----------|-------|----------------|
| Shadow | Sutil | `shadow-sm` |
| Border | Neutral-200 | `border border-neutral-200` |
| Border Radius | 12px | `rounded-xl` |
| Background | Blanco | `bg-white` |
| Padding | 24px | `p-6` |

```tsx
// ✅ CORRECTO - Card de contenido estándar
className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"

// ❌ INCORRECTO - Estilos inconsistentes
className="bg-white rounded-3xl shadow-lg border border-neutral-100 p-8"  // shadow muy prominente
className="bg-white rounded-2xl shadow-md border border-neutral-300 p-4"  // border muy oscuro
```

**Aplica a:**
- Cards de formulario (wizard steps)
- Cards motivacionales (MotivationalCard)
- Cards de información
- Secciones de contenido destacado

**Excepciones permitidas:**
- Cards de producto (pueden tener hover effects adicionales)
- Modales y popovers (usan `shadow-lg`)

### 9.4 Floating UI Elements (Popover, Tooltip, Dropdown)

Estilos estándar para elementos flotantes de NextUI:

| Elemento | Classes estándar |
|----------|------------------|
| `PopoverContent` | `bg-white border border-neutral-200 shadow-lg` |
| `TooltipContent` | `bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg` |
| `DropdownMenu` | `bg-white border border-neutral-200 shadow-lg` |

```tsx
// Popover (ej: TokenCounter)
<PopoverContent className="w-72 bg-white border border-neutral-200 shadow-lg">
  <div className="p-3">...</div>
</PopoverContent>

// Tooltip
<Tooltip
  content="Texto del tooltip"
  classNames={{
    content: "bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg"
  }}
>
  <Button>...</Button>
</Tooltip>

// Dropdown
<DropdownMenu className="bg-white border border-neutral-200 shadow-lg">
  <DropdownItem>...</DropdownItem>
</DropdownMenu>
```

**Importante:** Siempre especificar `bg-white` explícitamente para evitar problemas de transparencia.

### 9.5 Toast Notifications

> **Componente:** `Toast` y `useToast` de `@/app/prototipos/_shared`

**REGLA:** Usar SIEMPRE el componente `Toast` estandarizado. NO crear toasts inline con estilos custom.

#### 9.5.1 Tipos de Toast

| Tipo | Uso | Background | Icono |
|------|-----|------------|-------|
| `success` | Acción completada exitosamente | `bg-neutral-800` | `CheckCircle2` verde |
| `error` | Error en acción | `bg-neutral-800` | `XCircle` rojo |
| `warning` | Advertencia | `bg-neutral-800` | `AlertTriangle` amarillo |
| `info` | Información general | `bg-white` + border | `Info` azul |
| `navigation` | Cambio de componente/sección | `bg-neutral-800` | `Navigation` blanco |
| `version` | Cambio de versión | `bg-[#4654CD]` | `Layers` blanco |

#### 9.5.2 Posición y Duración

| Propiedad | Default | Opciones |
|-----------|---------|----------|
| `position` | `bottom` | `top`, `bottom` |
| `duration` | `3000` (3s) | Cualquier número en ms, `0` para no auto-hide |

- **Bottom:** `bottom-24` (sobre floating buttons)
- **Top:** `top-20` (debajo de navbar)

#### 9.5.3 Uso con Hook (Recomendado)

```tsx
import { Toast, useToast } from '@/app/prototipos/_shared';

function MyComponent() {
  const { toast, showToast, hideToast, isVisible } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      showToast('Acción completada exitosamente', 'success');
    } catch {
      showToast('Error al realizar la acción', 'error');
    }
  };

  return (
    <>
      <Button onPress={handleAction}>Ejecutar</Button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isVisible}
          onClose={hideToast}
        />
      )}
    </>
  );
}
```

#### 9.5.4 Uso Directo (Simple)

```tsx
import { Toast } from '@/app/prototipos/_shared';

function MyComponent() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <Button onPress={() => setShowToast(true)}>Mostrar</Button>

      <Toast
        message="Archivo descargado correctamente"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
        position="bottom"
      />
    </>
  );
}
```

#### 9.5.5 Ejemplos por Caso de Uso

```tsx
// Descarga exitosa
showToast('Archivo PDF descargado correctamente', 'success');

// Error de validación
showToast('Por favor completa todos los campos', 'error');

// Advertencia
showToast('Tu sesión expirará en 5 minutos', 'warning');

// Información
showToast('Presiona Tab para navegar entre componentes', 'info');

// Cambio de navegación (keyboard shortcuts)
showToast('Componente: Filtros de Marca', 'navigation');

// Cambio de versión (keyboard shortcuts)
showToast('Card: V2 - Grid compacto', 'version');
```

#### 9.5.6 Props del Componente

```tsx
interface ToastProps {
  message: string;           // Texto a mostrar
  type?: ToastType;          // default: 'info'
  isVisible: boolean;        // Controla visibilidad
  onClose: () => void;       // Callback al cerrar
  duration?: number;         // ms, default: 3000
  position?: 'top' | 'bottom'; // default: 'bottom'
}

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'navigation' | 'version';
```

#### 9.5.7 Prohibición de Toasts Inline

**REGLA ABSOLUTA:** NUNCA crear toasts/notificaciones con código inline. Siempre usar el componente `Toast`.

```tsx
// ❌ PROHIBIDO - Toast inline con estilos custom
<AnimatePresence>
  {showToast && (
    <motion.div className="fixed bottom-24 left-1/2 ...">
      <Check className="w-4 h-4" />
      <span>Mensaje de éxito</span>
    </motion.div>
  )}
</AnimatePresence>

// ❌ PROHIBIDO - Notificación inline
{isSuccess && (
  <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
    <CheckCircle className="w-4 h-4" />
    <span>¡Acción exitosa!</span>
  </div>
)}

// ✅ CORRECTO - Usar componente Toast
<Toast
  message="¡Acción exitosa!"
  type="success"
  isVisible={isSuccess}
  onClose={() => setIsSuccess(false)}
/>
```

**Verificación:**
```bash
# Buscar toasts inline potenciales
grep -rn "AnimatePresence" src/app/prototipos/0.5/ --include="*.tsx" | grep -i toast
grep -rn "fixed.*bottom.*left-1/2" src/app/prototipos/0.5/ --include="*.tsx"
```

#### 9.5.8 Checklist Toast

- [ ] Usar componente `Toast` de `_shared` (NO inline)
- [ ] Elegir tipo correcto según contexto
- [ ] Posición `bottom` para acciones de usuario
- [ ] Posición `top` para feedback de shortcuts
- [ ] Duración 3s para mensajes normales
- [ ] Mensajes concisos (máx ~50 caracteres)
- [ ] NO usar `AnimatePresence` + `motion.div` para notificaciones
- [ ] NO crear estilos custom para mensajes de feedback

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

### 12.6 Propagación de `mode=clean` en Links Internos

Cuando una página tiene `?mode=clean`, **todos los links internos hijos deben heredar ese query param**.

#### Reglas de Propagación

| Tipo de Link | Hereda `mode=clean` | Ejemplo |
|--------------|---------------------|---------|
| **Links internos** (rutas del prototipo) | ✅ SÍ | `/prototipos/0.5/catalogo/...` |
| **Links externos** (URLs completas) | ❌ NO | `https://zonaclientes.baldecash.com` |
| **Anchors** (scroll en página) | ❌ NO | `#faq`, `#convenios` |

#### Implementación

1. **Pasar `isCleanMode` como prop** desde la página padre a los componentes hijos:

```tsx
// Página padre (preview)
const isCleanMode = searchParams.get('mode') === 'clean';

return <HeroSection isCleanMode={isCleanMode} />;
```

2. **Usar función helper** para construir URLs internas:

```tsx
// Helper function en cada componente
const buildInternalUrl = (basePath: string, isCleanMode: boolean) => {
  return isCleanMode ? `${basePath}?mode=clean` : basePath;
};

// Uso
const catalogUrl = buildInternalUrl('/prototipos/0.5/catalogo/catalog-preview', isCleanMode);
```

3. **Aplicar en todos los links internos:**

```tsx
// Mega menú, footer, CTAs, cards, etc.
<a href={buildInternalUrl('/prototipos/0.5/producto/detail-preview', isCleanMode)}>
  Ver producto
</a>

// Con router
router.push(buildInternalUrl('/prototipos/0.5/wizard-solicitud/wizard-preview', isCleanMode));
```

#### Componentes que Requieren Propagación

- **Navbar**: Logo, mega menú items
- **Footer**: Logo, links de productos
- **HeroBanner**: CTAs principales
- **HeroCta**: Botones de acción
- **ProductCard**: Click en cards
- **EmptyState**: Links a productos relacionados

#### Checklist Propagación mode=clean

- [ ] Página padre pasa `isCleanMode` a componentes hijos
- [ ] Cada componente tiene interface con `isCleanMode?: boolean`
- [ ] Función `buildInternalUrl` definida en cada componente
- [ ] Links internos usan `buildInternalUrl()`
- [ ] Links externos NO usan `buildInternalUrl()` (quedan sin modificar)
- [ ] Anchors (`#section`) NO se modifican

### 12.7 Aislamiento de Versiones en Links

**Regla crítica:** Los archivos dentro de `/prototipos/0.X/` solo deben tener links internos que apunten a `/prototipos/0.X/`.

#### Regla

| Ubicación del archivo | Links deben apuntar a |
|-----------------------|-----------------------|
| `/prototipos/0.5/**/*.tsx` | `/prototipos/0.5/...` |
| `/prototipos/0.4/**/*.tsx` | `/prototipos/0.4/...` |

#### Excepciones Válidas

1. **Imports de componentes reutilizados** (código, no navegación):
   ```tsx
   // ✅ OK - Import de código
   import { HelpQuiz } from '@/app/prototipos/0.4/quiz/components/quiz';
   ```

2. **Links de navegación entre versiones** (intencional):
   ```tsx
   // ✅ OK - Botón "Ver versión anterior"
   <Link href="/prototipos/0.4">Ver versión anterior (0.4)</Link>
   ```

#### Errores Comunes a Evitar

```tsx
// ❌ INCORRECTO - Archivo en 0.5 apuntando a 0.4
const wizardUrl = '/prototipos/0.4/wizard-solicitud/wizard-preview';

// ✅ CORRECTO - Archivo en 0.5 apunta a 0.5
const wizardUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';

// ❌ INCORRECTO - Usar & cuando es el primer query param
const url = `${baseUrl}&mode=clean`;  // & solo para params adicionales

// ✅ CORRECTO - Usar ? para el primer query param
const url = `${baseUrl}?mode=clean`;  // ? inicia los query params
```

#### Patrón Correcto para URLs con Query Params

```tsx
// Cuando la URL base NO tiene query params
const getSimpleUrl = (isCleanMode: boolean) => {
  const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';
  return isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
};

// Cuando la URL base PUEDE tener query params
const getComplexUrl = (isCleanMode: boolean, deviceType?: string) => {
  const baseUrl = '/prototipos/0.5/producto/detail-preview';
  const params = new URLSearchParams();

  if (deviceType && deviceType !== 'laptop') {
    params.set('device', deviceType);
  }
  if (isCleanMode) {
    params.set('mode', 'clean');
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
```

**Regla:** Usar `URLSearchParams` cuando hay múltiples params posibles para evitar errores de `?` vs `&`.

#### Verificación

Ejecutar estos comandos para detectar problemas:

```bash
# 1. Buscar links a 0.4 dentro de archivos 0.5 (excluyendo imports y comentarios)
grep -rn "prototipos/0\.4" src/app/prototipos/0.5/ --include="*.tsx" \
  | grep -v "import " | grep -v "// " | grep -v "* " | grep -v "Ver versión anterior"

# 2. Buscar uso incorrecto de &mode=clean (debería ser ?mode=clean)
grep -rn "&mode=clean" src/app/prototipos/0.5/ --include="*.tsx"
```

#### Checklist Aislamiento de Versiones

- [ ] Todos los `router.push()` apuntan a la misma versión
- [ ] Todas las URLs hardcodeadas usan la versión correcta
- [ ] Los botones de navegación van a rutas de la misma versión
- [ ] Solo el botón "Ver versión anterior" cruza versiones (intencional)

### 12.8 Feedback en Modo Clean

Cuando `mode=clean` está activo, se muestra un **botón de feedback** (💬) en la esquina inferior derecha para recolectar opiniones durante presentaciones.

#### Regla Principal

> **OBLIGATORIO**: Toda página de preview DEBE mostrar el `FeedbackButton` cuando tiene `mode=clean`.
> El botón debe estar envuelto en la condición `{isCleanMode && <FeedbackButton ... />}`.

```tsx
// ✅ Correcto - FeedbackButton solo visible en mode=clean
if (isCleanMode) {
  return (
    <>
      <PageContent />
      <FeedbackButton sectionId="mi-seccion" config={config} />
    </>
  );
}

// ✅ También correcto - usando condicional inline
return (
  <div>
    <PageContent />
    {isCleanMode && (
      <FeedbackButton sectionId="mi-seccion" config={config} />
    )}
  </div>
);

// ❌ Incorrecto - FeedbackButton siempre visible
return (
  <div>
    <PageContent />
    <FeedbackButton sectionId="mi-seccion" config={config} />
  </div>
);
```

#### Verificación de Cumplimiento

```bash
# Buscar páginas con FeedbackButton sin condición isCleanMode
grep -l "FeedbackButton" src/app/prototipos/0.5/**/page.tsx | while read f; do
  if ! grep -q "isCleanMode" "$f"; then
    echo "⚠️  $f - Falta condición isCleanMode"
  fi
done
```

#### Características Principales

| Aspecto | Descripción |
|---------|-------------|
| Librería | `modern-screenshot` (soporta CSS moderno: `lab()`, `oklch()`) |
| Visibilidad | **SOLO visible en `mode=clean`** (obligatorio) |
| Screenshot | Solo viewport visible, excluye overlay via `filter` |
| Campo Responsable | Selector con persistencia en localStorage |
| Textarea | HTML nativo `<textarea>` (mejor control de altura) |
| Overlay | Card blanca con spinner CSS durante captura |

#### Responsables Disponibles

El selector de "Responsable" incluye las siguientes opciones:

```tsx
const RESPONSABLES = [
  'RUBEN MONTENEGRO',
  'CONSUELO MARISCAL',
  'MARCO DEL RIO',
  'LEONARDO MEDINA',
  'EMILIO GONZALES',
] as const;
```

> **IMPORTANTE**: Los nombres en mayúsculas NO llevan tildes (ej: `RUBEN` no `RUBÉN`).

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
                        ├─→ Selector "Responsable" (autocompletado desde localStorage)
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

Modal con screenshot preview, campo autor persistente y textarea nativo:

```tsx
// FeedbackModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { MessageCircle, Send, Check, AlertCircle, User } from 'lucide-react';

const AUTHOR_STORAGE_KEY = 'baldecash-feedback-author';

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
  const [author, setAuthor] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  // Load author from localStorage on mount
  useEffect(() => {
    const savedAuthor = localStorage.getItem(AUTHOR_STORAGE_KEY);
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

  // Save author to localStorage when it changes
  const handleAuthorChange = (value: string) => {
    setAuthor(value);
    localStorage.setItem(AUTHOR_STORAGE_KEY, value);
  };

  const handleSubmit = async () => {
    if (!feedbackText.trim() || !screenshot) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot,
          author: author.trim() || 'Anónimo',
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
  author: string;                  // Nombre del autor (o "Anónimo" si vacío)
  feedbackText: string;            // Texto del usuario
  pageUrl: string;                 // URL completa con params
  sectionId: string;               // Ej: "catalogo", "hero"
  configSnapshot: object;          // Config actual de la sección
  timestamp: string;               // ISO 8601
  userAgent: string;               // Browser/device info
}
```

#### 12.6.7.1 Campo Autor con Persistencia

El campo "Autor" tiene persistencia en localStorage para autocompletado entre páginas:

```tsx
const AUTHOR_STORAGE_KEY = 'baldecash-feedback-author';

// Cargar al montar
useEffect(() => {
  const savedAuthor = localStorage.getItem(AUTHOR_STORAGE_KEY);
  if (savedAuthor) setAuthor(savedAuthor);
}, []);

// Guardar al cambiar
const handleAuthorChange = (value: string) => {
  setAuthor(value);
  localStorage.setItem(AUTHOR_STORAGE_KEY, value);
};
```

| Aspecto | Valor |
|---------|-------|
| Key localStorage | `baldecash-feedback-author` |
| Valor por defecto | `''` (vacío) |
| Fallback en submit | `'Anónimo'` |
| Persistencia | Entre páginas y sesiones |

#### 12.6.8 Checklist FeedbackButton

- [ ] Dependencia `modern-screenshot` instalada
- [ ] FeedbackButton.tsx en `_shared/components/`
- [ ] FeedbackModal.tsx en `_shared/components/`
- [ ] useScreenshot.ts en `_shared/hooks/`
- [ ] Exports en `_shared/index.ts`
- [ ] API endpoint `/api/feedback` creado
- [ ] **FeedbackButton envuelto en condición `isCleanMode`** (obligatorio)
- [ ] Campo "Autor" con persistencia en localStorage
- [ ] Atributo `data-feedback-button` en el contenedor del botón
- [ ] Atributo `data-feedback-overlay` en el overlay
- [ ] Estados de loading/success/error en modal

### 12.9 Función `buildInternalUrl` con Query Params

Cuando un link interno necesita pasar **query params adicionales** (filtros, configuración, etc.), usar la versión extendida de `buildInternalUrl`:

```tsx
// Helper function con soporte para params adicionales
const buildInternalUrl = (basePath: string, isCleanMode: boolean, params?: Record<string, string>) => {
  const searchParams = new URLSearchParams();

  // Agregar params personalizados primero
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  // Siempre preservar mode=clean al final
  if (isCleanMode) {
    searchParams.set('mode', 'clean');
  }

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};
```

#### Ejemplos de Uso

```tsx
// Link a catálogo filtrado por tipo de equipo
const laptopsUrl = buildInternalUrl(catalogBasePath, isCleanMode, { device: 'laptop' });
// → /catalogo/catalog-preview?device=laptop
// → /catalogo/catalog-preview?device=laptop&mode=clean (si isCleanMode)

// Link a catálogo filtrado por tag
const ofertasUrl = buildInternalUrl(catalogBasePath, isCleanMode, { tag: 'oferta' });
// → /catalogo/catalog-preview?tag=oferta

// Múltiples params
const url = buildInternalUrl(catalogBasePath, isCleanMode, { device: 'laptop', tag: 'oferta' });
// → /catalogo/catalog-preview?device=laptop&tag=oferta
```

### 12.10 Query Params para Filtros del Catálogo

El catálogo sincroniza los filtros con la URL para permitir compartir links con filtros aplicados.

#### Params Disponibles

| Param | Descripción | Ejemplo | Valores |
|-------|-------------|---------|---------|
| `device` | Tipo de equipo | `?device=laptop,tablet` | `laptop`, `tablet`, `celular` |
| `brand` | Marcas | `?brand=lenovo,hp` | Nombres de marca |
| `tag` | Tags destacados | `?tag=oferta,mas_vendido` | `oferta`, `mas_vendido`, `recomendado`, `cuota_baja` |
| `usage` | Uso recomendado | `?usage=gaming,estudios` | `estudios`, `gaming`, `diseño`, `oficina`, `programacion` |
| `gama` | Gama/Tier | `?gama=profesional` | `economica`, `estudiante`, `profesional`, `creativa`, `gamer` |
| `ram` | Memoria RAM | `?ram=8,16` | Valores numéricos (GB) |
| `storage` | Almacenamiento | `?storage=256,512` | Valores numéricos (GB) |
| `quota` | Rango de cuota mensual | `?quota=40,100` | `min,max` en soles (default: `25,400`) |
| `sort` | Ordenamiento | `?sort=price_asc` | `recommended`, `price_asc`, `price_desc`, `newest`, `quota_asc`, `popular` |

> **Nota:** El filtro `priceRange` (rango de precio total del producto) fue eliminado. Solo existe `quotaRange` para filtrar por cuota mensual.

#### Múltiples Valores

Usar comas para múltiples valores del mismo filtro:

```
?device=laptop,tablet&tag=oferta,recomendado
```

#### Implementación en `queryFilters.ts`

```tsx
// Lectura de params
const tag = searchParams.get('tag');
if (tag) {
  const validTags: ProductTagType[] = ['mas_vendido', 'recomendado', 'cuota_baja', 'oferta'];
  filters.tags = tag
    .split(',')
    .filter((t) => validTags.includes(t as ProductTagType)) as ProductTagType[];
}

// Escritura de params
if (filters.tags.length > 0) {
  params.set('tag', filters.tags.join(','));
}
```

### 12.11 URLs Limpias (Decodificar Comas)

Por defecto, `URLSearchParams.toString()` codifica las comas como `%2C`, haciendo las URLs menos legibles.

```
❌ ?device=laptop%2Ctablet&tag=oferta%2Cmas_vendido
✅ ?device=laptop,tablet&tag=oferta,mas_vendido
```

#### Solución

Decodificar las comas al generar el query string:

```tsx
// Al actualizar la URL en el catálogo
const queryString = filterParams.toString().replace(/%2C/g, ',');
router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
```

> **Nota:** Las comas son caracteres válidos en URLs y no requieren codificación.

### 12.12 Scroll a Secciones con Offset

Cuando hay un header fijo, los anchor links (`#seccion`) posicionan el contenido debajo del header, tapándolo.

#### Solución: `scroll-mt-{size}`

Agregar la clase `scroll-mt-24` (96px) a las secciones target para compensar el header:

```tsx
// ✅ CORRECTO - Tiene scroll-mt-24
<section id="como-funciona" className="scroll-mt-24">
  <HowItWorks />
</section>

// ❌ INCORRECTO - Sin offset, el header tapa el contenido
<section id="como-funciona">
  <HowItWorks />
</section>
```

#### Secciones que Requieren `scroll-mt-24`

Toda sección con `id` que sea target de un anchor link:

| Sección | ID | Clase |
|---------|-----|-------|
| Cómo funciona | `#como-funciona` | `scroll-mt-24` |
| Convenios | `#convenios` | `scroll-mt-24` |
| FAQ | `#faq` | `scroll-mt-24` |

#### Checklist Scroll a Secciones

- [ ] Sección tiene `id="nombre-seccion"`
- [ ] Sección tiene `className="scroll-mt-24"`
- [ ] Links usan `href="#nombre-seccion"` o `scrollIntoView`

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

## 14. Página Index de Versión

Cada versión (0.4, 0.5, etc.) tiene una página index en `/prototipos/{version}/page.tsx` que sigue esta estructura estándar.

### 14.1 Estructura de Secciones

```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                           │
│  [Badge versión] + Título + Descripción                 │
├─────────────────────────────────────────────────────────┤
│                    MODE DISPLAY                         │
│  Modo Presentación/Configuración (toggle o estático)    │
├─────────────────────────────────────────────────────────┤
│                  PROGRESS OVERVIEW                      │
│  Barra de progreso + contador de secciones              │
├─────────────────────────────────────────────────────────┤
│                   SECTIONS GRID                         │
│  Grid 4 columnas (desktop) / 2 columnas (mobile)        │
│  Cards de secciones con estado                          │
├─────────────────────────────────────────────────────────┤
│              KEYBOARD SHORTCUTS GUIDE                   │
│  Atajos Windows/Linux y macOS                           │
├─────────────────────────────────────────────────────────┤
│                   QUICK ACTIONS                         │
│  [Ver versión anterior] [Volver al Home]                │
└─────────────────────────────────────────────────────────┘
```

### 14.2 Mode Display

El Mode Display permite alternar entre modo normal (con controles de desarrollo) y modo presentación (limpio, con `?mode=clean`).

#### Comportamiento

| Estado Toggle | Links de Secciones | Descripción |
|---------------|-------------------|-------------|
| **OFF** (default) | `/prototipos/0.5/seccion/preview` | Controles de desarrollo visibles |
| **ON** | `/prototipos/0.5/seccion/preview?mode=clean` | Vista limpia sin controles |

#### Implementación con Toggle y localStorage

```tsx
// Constante para localStorage
const STORAGE_KEY = 'baldecash-v05-presentation-mode';

// Estado con persistencia
const [isPresentationMode, setIsPresentationMode] = useState(false);

// Cargar desde localStorage al montar
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    setIsPresentationMode(JSON.parse(saved));
  }
}, []);

// Guardar al cambiar
const handlePresentationModeChange = (value: boolean) => {
  setIsPresentationMode(value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

// Función para obtener path con o sin mode=clean
const getSectionPath = (basePath: string) => {
  return isPresentationMode ? `${basePath}?mode=clean` : basePath;
};
```

#### JSX del Toggle

```tsx
<section className="max-w-4xl mx-auto mb-8">
  <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
          ${isPresentationMode ? 'bg-[#4654CD]' : 'bg-neutral-200'}`}
        >
          <Presentation className={`w-5 h-5 transition-colors
            ${isPresentationMode ? 'text-white' : 'text-neutral-500'}`}
          />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">Modo Presentación</h3>
          <p className="text-sm text-neutral-500">
            {isPresentationMode
              ? 'Activo - Los links abrirán sin controles de desarrollo'
              : 'Inactivo - Los links abrirán con controles de desarrollo'}
          </p>
        </div>
      </div>
      <CustomSwitch
        isSelected={isPresentationMode}
        onValueChange={handlePresentationModeChange}
      />
    </div>
  </div>
</section>
```

#### CustomSwitch Component

```tsx
interface CustomSwitchProps {
  isSelected: boolean;
  onValueChange: (value: boolean) => void;
}

function CustomSwitch({ isSelected, onValueChange }: CustomSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isSelected}
      onClick={() => onValueChange(!isSelected)}
      className="inline-flex items-center cursor-pointer"
    >
      <div className={`
        w-12 h-6 rounded-full relative transition-colors duration-200
        ${isSelected ? 'bg-[#4654CD]' : 'bg-neutral-300'}
      `}>
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md absolute top-1/2"
          initial={false}
          animate={{
            x: isSelected ? 24 : 2,
            y: '-50%',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </div>
    </button>
  );
}
```

#### Uso en Section Cards

```tsx
// En el grid de secciones, usar getSectionPath para los links
<Card
  key={section.id}
  isPressable
  onPress={() => router.push(getSectionPath(section.path))}
  className="bg-white border border-neutral-100 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer h-full"
>
  {cardContent}
</Card>
```

#### Checklist Mode Display

- [ ] `STORAGE_KEY` definido con nombre único por versión
- [ ] Estado `isPresentationMode` con `useState(false)`
- [ ] `useEffect` para cargar desde localStorage
- [ ] `handlePresentationModeChange` guarda en localStorage
- [ ] `getSectionPath` agrega `?mode=clean` cuando activo
- [ ] Icono cambia color según estado (morado activo, gris inactivo)
- [ ] Descripción dinámica explica el comportamiento actual
- [ ] Section cards usan `getSectionPath(section.path)`

### 14.3 Sections Grid

**Grid layout:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
```

**Card de sección:**
```tsx
<CardBody className="p-4 flex flex-col">
  {/* Icon */}
  <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center mb-3`}>
    <IconComponent className={`w-5 h-5 ${status.color}`} />
  </div>

  {/* Content */}
  <h3 className="text-sm font-semibold text-neutral-900 mb-0.5">{section.name}</h3>
  <p className="text-neutral-400 text-xs mb-2">#{section.promptNumber}</p>

  {/* Status */}
  <div className="mt-auto flex items-center gap-1">
    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
    <span className={`text-xs ${status.color}`}>{status.label}</span>
  </div>
</CardBody>
```

**Estados de sección:**
```tsx
const statusStyles = {
  pending: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-200", label: "Pendiente" },
  in_progress: { icon: Rocket, color: "text-[#03DBD0]", bg: "bg-[#03DBD0]/20", label: "En desarrollo" },
  done: { icon: CheckCircle, color: "text-[#4654CD]", bg: "bg-[#4654CD]/20", label: "Completado" },
};
```

**Iconos por sección:**
```tsx
const sectionIcons: Record<string, React.ElementType> = {
  hero: Rocket,
  catalogo: Layers,
  detalle: FileText,
  comparador: GitCompare,
  quiz: HelpCircle,
  estados: SearchX,
  'wizard-solicitud': ClipboardList,
  upsell: ShoppingCart,
  aprobacion: CheckCircle2,
  rechazo: XCircle,
  convenio: Building2,
};
```

### 14.4 Quick Actions

```tsx
<section className="max-w-4xl mx-auto mt-10">
  <div className="flex flex-wrap items-center justify-center gap-3">
    {/* Botón primario: Ver versión anterior */}
    <Link
      href="/prototipos/{version-anterior}"
      className="px-4 py-2 bg-[#4654CD] hover:bg-[#3a47b3] text-white rounded-lg text-sm transition-colors flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Ver versión anterior ({version-anterior})
    </Link>
    {/* Botón secundario: Volver al Home */}
    <Link
      href="/"
      className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#4654CD] border border-neutral-200 rounded-lg text-sm transition-colors"
    >
      Volver al Home
    </Link>
  </div>
</section>
```

### 14.5 Registry de Versiones (`_registry/versions.ts`)

**Estructura de VersionConfig:**
```ts
interface VersionConfig {
  version: string;           // "0.5"
  title: string;             // "Catálogo Iterativo v0.5"
  description: string;       // Descripción corta
  icon: string;              // Nombre de icono Lucide
  color: string;             // Tailwind gradient classes
  badge?: string;            // "En desarrollo", "Listo", "Completada"
  status: 'draft' | 'in_progress' | 'ready' | 'archived';
  sections: SectionStatus[];
  createdAt: string;         // "2026-01-06"
  updatedAt: string;
}

interface SectionStatus {
  id: string;                // "catalogo"
  name: string;              // "Catálogo"
  path: string;              // "/prototipos/0.5/catalogo/catalog-preview"
  status: 'pending' | 'in_progress' | 'done';
  promptNumber: string;      // "02-03"
}
```

**Badges y estados:**
| Status | Badge | Uso |
|--------|-------|-----|
| `draft` | - | Versión en planificación |
| `in_progress` | "En desarrollo" | Versión activa con secciones pendientes |
| `ready` | "Listo" o "Completada" | Todas las secciones done |
| `archived` | - | Versión obsoleta (no mostrar) |

---

## 16. Filtros con Conteo

### 16.1 Regla General

**TODOS los filtros de selección múltiple DEBEN mostrar la cantidad de resultados** junto al label de cada opción.

```tsx
// ✅ CORRECTO - Muestra el count
{opt.label} ({opt.count})

// ❌ INCORRECTO - Sin count
{opt.label}
```

### 16.2 Formato Estándar

El conteo se muestra entre paréntesis inmediatamente después del label:

```tsx
// En Chips
<Chip>
  {opt.label} ({opt.count})
</Chip>

// En Buttons/Cards
<span className="text-xs font-medium">
  {opt.label} ({opt.count})
</span>

// En Checkboxes con label separado
<span className="text-sm flex-1">{opt.label}</span>
<span className="text-xs text-neutral-400">({opt.count})</span>
```

### 16.3 Filtros Afectados

Esta regla aplica a:

| Filtro | Componente | Formato |
|--------|------------|---------|
| Tipo de equipo | Chip/Card | `Laptop (30)` |
| Marca | BrandFilterV6 | `Lenovo (11)` |
| Uso recomendado | Checkbox/Chip | `Gaming (12)` |
| Gama | Chip con color | `Profesional (25)` |
| Condición | Checkbox | `Nuevo (40)` |
| RAM | Checkbox/Chip | `16 GB (18)` |
| Almacenamiento | Checkbox/Chip | `512 GB (22)` |

### 16.4 Prop `showCounts`

Algunos componentes exponen el prop `showCounts` para controlar la visibilidad:

```tsx
interface FilterProps {
  showCounts?: boolean; // default: true
}

// Uso
<UsageFilter
  options={usageOptions}
  selected={filters.usage}
  onChange={handleChange}
  showCounts={config.showFilterCounts}
/>
```

### 16.5 Datos Requeridos

Las opciones de filtro DEBEN incluir el campo `count`:

```tsx
// ✅ CORRECTO
const deviceTypeOptions: FilterOption[] = [
  { value: 'laptop', label: 'Laptop', count: 30 },
  { value: 'tablet', label: 'Tablet', count: 15 },
];

// ❌ INCORRECTO - Falta count
const deviceTypeOptions = [
  { value: 'laptop', label: 'Laptop' },
];
```

### 16.6 Verificación

Antes de dar por terminado un filtro, verificar:

- [ ] Cada opción muestra `(count)` después del label
- [ ] El count refleja la cantidad real de productos disponibles
- [ ] El formato es consistente con otros filtros de la misma página

### 16.7 Agregar Nuevo Filtro al Catálogo (Checklist Completo)

Al agregar un nuevo tipo de filtro al catálogo, seguir estos pasos en orden:

#### 1. Tipos (`types/catalog.ts`)

```tsx
// Agregar al FilterState
export interface FilterState {
  // ... otros campos
  tags: ProductTagType[];  // ← Nuevo campo
}

// Agregar al defaultFilterState
export const defaultFilterState: FilterState = {
  // ... otros campos
  tags: [],  // ← Valor por defecto
};

// Agregar a FilterCounts
export interface FilterCounts {
  // ... otros campos
  tags: Record<string, number>;  // ← Para conteos dinámicos
}
```

#### 2. Query Params (`utils/queryFilters.ts`)

```tsx
// Agregar al SyncedFilterKey
type SyncedFilterKey =
  | 'deviceTypes'
  | 'tags'  // ← Nuevo
  // ...

// Agregar al PARAM_MAP
const PARAM_MAP: Record<string, SyncedFilterKey> = {
  tag: 'tags',  // ← query param → filter key
  // ...
};

// Agregar parsing en parseFiltersFromParams
const tag = searchParams.get('tag');
if (tag) {
  filters.tags = tag.split(',').filter(Boolean) as ProductTagType[];
}

// Agregar building en buildParamsFromFilters
if (filters.tags.length > 0) {
  params.set('tag', filters.tags.join(','));
}
```

#### 3. Mock Data (`data/mockCatalogData.ts`)

```tsx
// Agregar opciones
export const tagOptions: FilterOption[] = [
  { value: 'oferta', label: 'Oferta', count: 0 },
  // ...
];

// Agregar conteo en getFilterCounts
product.tags.forEach((tag) => {
  counts.tags[tag] = (counts.tags[tag] || 0) + 1;
});

// Agregar filtro en getFilteredProducts
if (filters.tags?.length && !filters.tags.some((t) => product.tags.includes(t))) {
  return false;
}
```

#### 4. Componente de Filtro (`components/catalog/filters/`)

Crear componente similar a `CommercialFilters.tsx` o `TagsFilter.tsx`.

#### 5. Layout (`CatalogLayoutV4.tsx`)

**5.1 Imports:**
```tsx
import { TagsFilter } from '../filters/TagsFilter';
import { tagOptions } from '../../../data/mockCatalogData';
```

**5.2 Dynamic Options (useMemo):**
```tsx
const dynamicTagOptions = React.useMemo(() =>
  filterCounts ? applyDynamicCounts(tagOptions, filterCounts.tags) : tagOptions,
  [filterCounts]
);
```

**5.3 Applied Filters (chips arriba del grid):**
```tsx
filters.tags.forEach((tag) => {
  const opt = tagOptions.find((o) => o.value === tag);
  applied.push({
    id: `tag-${tag}`,
    category: 'Destacados',
    label: opt?.label || tag,
    value: tag
  });
});
```

**5.4 Applied Filters Count:**
```tsx
filters.tags.length +
```

**5.5 Handle Remove Filter:**
```tsx
case 'tag':
  updateFilter('tags', filters.tags.filter((t) => t !== value));
  break;
```

**5.6 Handle Clear All:**
```tsx
tags: [],
```

**5.7 Render en Sidebar (Desktop) y Modal (Mobile):**
```tsx
<TagsFilter
  tagOptions={dynamicTagOptions}
  selectedTags={filters.tags}
  onTagsChange={(tags) => updateFilter('tags', tags)}
  showCounts={config.showFilterCounts}
/>
```

#### Checklist Nuevo Filtro

- [ ] Campo agregado a `FilterState`
- [ ] Default agregado a `defaultFilterState`
- [ ] Campo agregado a `FilterCounts`
- [ ] Query param mapeado en `queryFilters.ts`
- [ ] Parsing implementado en `parseFiltersFromParams`
- [ ] Building implementado en `buildParamsFromFilters`
- [ ] Opciones creadas en `mockCatalogData.ts`
- [ ] Conteo agregado en `getFilterCounts`
- [ ] Filtrado agregado en `getFilteredProducts`
- [ ] Componente de filtro creado
- [ ] `dynamicOptions` con useMemo en layout
- [ ] Agregado a `appliedFilters` (chips)
- [ ] Agregado a `appliedFiltersCount`
- [ ] Caso en `handleRemoveFilter`
- [ ] Reset en `handleClearAll`
- [ ] Renderizado en sidebar desktop
- [ ] Renderizado en modal mobile

---

## 18. localStorage Persistence Pattern

### 18.1 Problema de Hidratación

Cuando se usa `useState` con valor inicial y `useEffect` para cargar de localStorage, puede ocurrir que el effect de guardar sobrescriba el valor guardado antes de que el effect de carga se ejecute.

**Problema:**
```tsx
// ❌ INCORRECTO - Race condition
const [value, setValue] = useState('default');

useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved) setValue(saved);
}, []);

useEffect(() => {
  localStorage.setItem('key', value);  // Se ejecuta con 'default' antes de cargar
}, [value]);
```

### 18.2 Solución con isHydrated Flag

```tsx
// ✅ CORRECTO - Con flag de hidratación
const [value, setValue] = useState('');
const [isHydrated, setIsHydrated] = useState(false);

// Cargar desde localStorage
useEffect(() => {
  try {
    const saved = localStorage.getItem('key');
    if (saved !== null) {
      setValue(saved);  // Incluye valores vacíos ''
    } else {
      setValue('default');  // Solo si nunca se guardó
    }
  } catch {}
  setIsHydrated(true);
}, []);

// Guardar en localStorage (solo después de hidratar)
useEffect(() => {
  if (!isHydrated) return;
  try {
    localStorage.setItem('key', value);
  } catch {}
}, [value, isHydrated]);
```

### 18.3 Puntos Clave

| Aspecto | Detalle |
|---------|---------|
| Estado inicial | Usar `''` vacío, NO el valor default |
| Verificación null | `saved !== null` (no `saved`) para permitir strings vacíos |
| Default value | Solo asignar si `localStorage.getItem()` retorna `null` |
| Flag isHydrated | Previene guardado antes de cargar |
| Dependencias | Incluir `isHydrated` en el array de deps del save effect |

### 18.4 Casos de Uso

- Wizard form fields (acceptTerms, paymentTerm, referralSource)
- Preferencias de usuario
- Filtros persistentes
- Estado de UI (collapsed/expanded)

### 18.5 Checklist localStorage

- [ ] Estado inicial vacío (`''`) para strings
- [ ] Flag `isHydrated` inicializado en `false`
- [ ] Load effect marca `setIsHydrated(true)` al final
- [ ] Save effect verifica `if (!isHydrated) return`
- [ ] Usar `!== null` para detectar valores vacíos guardados
- [ ] Try/catch para manejar errores de storage

---

## 19. Responsive Card Grid Pattern

### 19.1 Regla General

El grid de cards del catálogo usa `auto-fit` con `minmax()` para adaptarse automáticamente a cualquier tamaño de pantalla.

```tsx
// ✅ Correcto - Grid responsive con auto-fit (IMPORTANTE: w-full es obligatorio)
<div className="w-full grid gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,360px))]">
  {children}
</div>

// ❌ Incorrecto - Sin w-full (el grid no calcula el ancho correctamente)
<div className="grid gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,360px))]">
  {children}
</div>

// ❌ Incorrecto - Columnas fijas por breakpoint
<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {children}
</div>
```

### 19.2 Comportamiento por Dispositivo

| Dispositivo | Ancho viewport | Columnas | Ancho por card |
|-------------|----------------|----------|----------------|
| Mobile pequeño | 320px | 1 | ~288px |
| Mobile | 375px | 1 | ~343px |
| Mobile grande | 428px | 1 | ~360px (max) |
| Tablet portrait | 768px | 2 | ~360px |
| Tablet landscape | 1024px | 3 | ~320px |
| Desktop | 1280px | 3-4 | ~280-360px |
| Desktop grande | 1536px | 4 | ~352px |
| 4K/Ultrawide | 1920px+ | 5+ | ~360px |

### 19.3 Parámetros de Diseño

- **Mínimo:** 280px (cards nunca más pequeñas)
- **Máximo:** 360px (cards nunca más grandes)
- **Gap:** 24px (`gap-6`)
- **Mobile forzado:** `grid-cols-1` para <640px

### 19.4 Archivos Afectados

Todos los layouts de catálogo en v0.5:
- `CatalogLayoutV1.tsx`
- `CatalogLayoutV2.tsx`
- `CatalogLayoutV3.tsx`
- `CatalogLayoutV4.tsx`
- `CatalogLayoutV5.tsx`
- `CatalogLayoutV6.tsx`

### 19.5 Ventajas

1. **Automático:** No requiere breakpoints manuales
2. **Fluido:** Cards se redistribuyen suavemente
3. **Consistente:** Mismo ancho de card en todos los dispositivos
4. **Futuro-proof:** Funciona con cualquier tamaño de pantalla nuevo

---

## 20. Mobile Bottom Sheet Pattern

### 20.1 Cuándo Usar

Este patrón aplica a **TODOS** los popups, modals, drawers y overlays que aparecen en mobile dentro de v0.5:

- Filtros del catálogo
- Carrito de compras
- Lista de deseos (wishlist)
- Búsqueda
- Quiz/Cuestionarios
- Comparador
- Detalle de productos/accesorios
- Selección de productos (cart modal)

### 20.2 Estructura Base

```tsx
'use client';

import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { X, GripHorizontal, IconName } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // ... props específicos
}

export const BottomSheetComponent: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const dragControls = useDragControls();

  // OBLIGATORIO: Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[149]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[150] min-h-[50vh] max-h-[calc(100vh-9rem)] flex flex-col"
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <GripHorizontal className="w-8 h-1.5 text-neutral-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <IconName className="w-4 h-4 text-[#4654CD]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    Título del Sheet
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Subtítulo descriptivo
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {/* Contenido */}
            </div>

            {/* Footer (opcional) */}
            <div className="border-t border-neutral-200 bg-white p-4">
              {/* Botones de acción */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### 20.3 Propiedades Estándar

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `min-h` | `50vh` | Altura mínima consistente |
| `max-h` | `calc(100vh-9rem)` | ~40px gap del header |
| `z-index` backdrop | `z-[149]` | Por encima del Navbar (z-50) y PromoBanner (z-[60]) |
| `z-index` sheet | `z-[150]` | Encima del backdrop |
| `rounded` | `rounded-t-3xl` | Esquinas superiores |
| `bg` backdrop | `bg-black/50` | 50% opacidad |
| `drag threshold` | `100px` | Umbral para cerrar |
| `body overflow` | `hidden` | Bloquear scroll del body |

> **IMPORTANTE - Z-Index:** Los valores `z-[149]` y `z-[150]` son obligatorios para que el backdrop oscurezca TODO el contenido, incluyendo el Navbar fijo. El Navbar usa `z-50` y el PromoBanner usa `z-[60]`, por lo que el backdrop debe estar por encima de ambos.

### 20.4 Bloqueo de Scroll del Body (OBLIGATORIO)

Cuando un bottom sheet está abierto, se DEBE bloquear el scroll del body para evitar scroll dual:

```tsx
// OBLIGATORIO en todo bottom sheet
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

**¿Por qué es necesario?**
- Evita que el usuario haga scroll en el contenido de fondo mientras navega el drawer
- Mejora la experiencia en dispositivos táctiles
- El cleanup en el return asegura que el scroll se restaure al desmontar

### 20.5 Animaciones Obligatorias

**Backdrop:**
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}
```

**Bottom Sheet:**
```tsx
initial={{ y: '100%' }}
animate={{ y: 0 }}
exit={{ y: '100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
```

### 20.6 Tres Puntos de Cierre Obligatorios

Todo bottom sheet DEBE poder cerrarse de estas 3 formas:

1. **Botón X** en header: `onPress={onClose}`
2. **Click en backdrop**: `onClick={onClose}`
3. **Drag hacia abajo**: `onDragEnd` con threshold de 100px

### 20.7 Comportamiento Multi-Popup

Solo puede haber **UN popup abierto a la vez**. Cuando se abre uno nuevo, los demás se cierran automáticamente.

**Implementación en página principal:**

```tsx
// Función helper para cerrar todos los drawers
const closeAllDrawers = useCallback(() => {
  setIsSearchDrawerOpen(false);
  setIsCartDrawerOpen(false);
  setIsWishlistDrawerOpen(false);
  setIsQuizOpen(false);
  setIsComparatorOpen(false);
  setIsFilterDrawerOpen(false);
  // ... otros estados
}, []);

// Uso al abrir cualquier drawer
const handleOpenSearch = () => {
  closeAllDrawers();
  setIsSearchDrawerOpen(true);
};

const handleOpenCart = () => {
  closeAllDrawers();
  setIsCartDrawerOpen(true);
};
// ... etc
```

### 20.8 Patrón Híbrido (Desktop + Mobile)

Para componentes que tienen diferente UI en desktop vs mobile:

```tsx
import { useIsMobile } from '@/hooks/useIsMobile';

export const HybridDrawer: React.FC<Props> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  return <DesktopModal {...props} />;
};
```

### 20.9 Banner Promocional

El banner promocional (PromoBanner) **NO debe ocultarse** cuando se abre un bottom sheet. El `max-h-[calc(100vh-9rem)]` ya considera el espacio necesario.

### 20.10 Checklist de Implementación

- [ ] Import `useEffect` de React
- [ ] Import `useDragControls` de Framer Motion
- [ ] `useEffect` para bloquear scroll del body (ver 20.4)
- [ ] `min-h-[50vh]` en el sheet
- [ ] `max-h-[calc(100vh-9rem)]` en el sheet
- [ ] Backdrop con `onClick={onClose}` y `transition={{ duration: 0.2 }}`
- [ ] Spring animation: `damping: 30, stiffness: 300`
- [ ] Drag handle con `GripHorizontal`
- [ ] Header con icono, título, subtítulo y botón X
- [ ] Body con `flex-1 overflow-y-auto overscroll-contain`
- [ ] `onDragEnd` con threshold de 100px
- [ ] Integrado en `closeAllDrawers()` si aplica

### 20.11 Componentes Estandarizados

| Componente | Archivo | Estado |
|------------|---------|--------|
| SearchDrawer | `catalog/SearchDrawer.tsx` | ✅ |
| CartDrawer | `catalog/CartDrawer.tsx` | ✅ |
| CartSelectionModal | `catalog/CartSelectionModal.tsx` | ✅ |
| WishlistDrawer | `catalog/WishlistDrawer.tsx` | ✅ |
| AccessoryDetailModal | `upsell/AccessoryDetailModal.tsx` | ✅ |
| QuizLayoutV4 | `quiz/layout/QuizLayoutV4.tsx` | ✅ |

---

## 21. FieldTooltip Component

### 21.1 Problema con NextUI Tooltip

**NUNCA usar el Tooltip de NextUI directamente.** Tiene dos problemas críticos:

1. **No funciona en mobile**: React Aria deshabilita eventos hover en touch devices
2. **Error en React 19**: `Accessing element.ref was removed in React 19`

### 21.2 Componente Estándar

Usar siempre `FieldTooltip` ubicado en:
```
src/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/FieldTooltip.tsx
```

**Import:**
```tsx
import { FieldTooltip } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields';
```

### 21.3 Características

| Característica | Descripción |
|----------------|-------------|
| **Desktop** | Hover para mostrar/ocultar |
| **Mobile** | Tap para toggle, tap fuera para cerrar |
| **Posicionamiento** | Dinámico - evita bordes del viewport |
| **Overflow** | Usa Portal (renderiza en `document.body`) - no se recorta por contenedores con `overflow: hidden` |
| **Z-index** | `z-[9999]` para estar siempre visible |

### 21.4 Tipos de Contenido Soportados

```tsx
// 1. String simple
<FieldTooltip content="Texto de ayuda" />

// 2. Objeto estructurado (recomendado para campos de formulario)
<FieldTooltip
  content={{
    title: "Título del tooltip",
    description: "Descripción detallada",
    recommendation: "Recomendación opcional"  // Muestra con icono Info
  }}
/>

// 3. ReactNode custom
<FieldTooltip
  content={
    <div>
      <p>Contenido personalizado</p>
    </div>
  }
/>

// 4. Backwards compatible con prop 'tooltip'
<FieldTooltip tooltip={{ title: "...", description: "..." }} />
```

### 21.5 Icono Personalizado

Por defecto usa el icono `Info`. Se puede personalizar:

```tsx
// Icono custom (ej: HelpCircle para specs técnicas)
<FieldTooltip
  content="Explicación técnica"
  icon={<HelpCircle className="w-4 h-4 text-neutral-400 hover:text-[#4654CD]" />}
/>

// Elemento completo como trigger (ej: badges de certificación)
<FieldTooltip
  content={{ title: "ISO 9001", description: "Certificación de calidad" }}
  icon={
    <div className="px-3 py-1.5 bg-neutral-100 rounded-full">
      <span className="text-xs">ISO</span>
    </div>
  }
/>
```

### 21.6 Uso en Campos de Formulario

Todos los campos del wizard ya incluyen soporte para tooltip:

```tsx
<TextInput
  label="Nombres"
  tooltip={{
    title: "¿Qué debo poner?",
    description: "Ingresa tus nombres tal como aparecen en tu documento.",
    recommendation: "Escribe todos tus nombres completos."
  }}
  // ... otras props
/>
```

### 21.7 Casos de Uso Comunes

| Caso | Implementación |
|------|----------------|
| **Campos de formulario** | Usar prop `tooltip` del componente de campo |
| **Specs técnicas** | `<FieldTooltip content="..." icon={<HelpCircle />} />` |
| **Filtros del catálogo** | `<FieldTooltip content={{ title, description, recommendation }} />` |
| **Badges/Certificaciones** | `<FieldTooltip content={{ title, description }} icon={<Badge />} />` |

### 21.8 Código Prohibido

```tsx
// ❌ NUNCA usar Tooltip de NextUI directamente
import { Tooltip } from '@nextui-org/react';

<Tooltip content="...">
  <span>Trigger</span>
</Tooltip>

// ❌ NUNCA usar trigger="press" (no funciona en mobile)
<Tooltip trigger="press" content="...">

// ✅ SIEMPRE usar FieldTooltip
import { FieldTooltip } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields';

<FieldTooltip content="..." />
```

### 21.9 Checklist de Implementación

- [ ] Importar `FieldTooltip` desde la ruta correcta
- [ ] Usar prop `content` (string, objeto, o ReactNode)
- [ ] Para campos de formulario, usar la prop `tooltip` del componente
- [ ] Para iconos custom, usar prop `icon`
- [ ] NO usar Tooltip de NextUI directamente
- [ ] Verificar funcionamiento en mobile (tap) y desktop (hover)

---

## 17. Versionado de Documento

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
| 1.8 | 2026-01-07 | Sección 7.4: Estilos estándar para Floating UI Elements (Popover, Tooltip, Dropdown) |
| 1.9 | 2026-01-07 | Sección 14: Página Index de Versión (estructura, Mode Display, Sections Grid, Registry) |
| 2.0 | 2026-01-08 | Sección 7: Formato de Moneda (`formatMoney()` centralizado, separador miles, 2 decimales) |
| 2.1 | 2026-01-09 | Sección 8: Componentes de Selección (regla 2-3→Segmented, 4-5→RadioGroup, 6+→Select) |
| 2.2 | 2026-01-09 | Sección 14.2: Mode Display con toggle interactivo, localStorage y función `getSectionPath` |
| 2.3 | 2026-01-09 | Sección 12.6: Propagación de `mode=clean` en links internos (herencia padre→hijo) |
| 2.4 | 2026-01-09 | Sección 12.7: Aislamiento de versiones en links (0.5 solo apunta a 0.5) |
| 2.5 | 2026-01-09 | Sección 12.7: Patrón URLSearchParams para múltiples query params, error `&` vs `?` |
| 2.6 | 2026-01-09 | Sección 12.8: FeedbackButton OBLIGATORIO en `mode=clean`, campo Responsable (selector) con persistencia localStorage |
| 2.7 | 2026-01-09 | Sección 8.7: Estándares de Campos de Formulario (TextInput, TextArea, SelectInput, FileUpload) con estados, colores, iconos, validación y contador de caracteres |
| 2.8 | 2026-01-09 | Tabla "CONSULTA OBLIGATORIA ANTES DE IMPLEMENTAR" al inicio del documento para referencia rápida de secciones |
| 2.9 | 2026-01-09 | Sección 9.3.1: Prohibición de Gradientes expandida con ejemplos, verificación y casos de uso |
| 3.0 | 2026-01-09 | Sección 9.5: Toast Notifications estandarizado con componente `Toast` y hook `useToast` |
| 3.1 | 2026-01-09 | Sección 9.5.7: Prohibición explícita de toasts inline con ejemplos de código prohibido y verificación |
| 3.2 | 2026-01-09 | Sección 16: Filtros con Conteo - estándar para mostrar cantidad de resultados en filtros |
| 3.3 | 2026-01-09 | Sección 12.8: Campo "Responsable" como selector (no input), lista de responsables sin tildes en mayúsculas |
| 3.4 | 2026-01-12 | Secciones 12.9-12.12: `buildInternalUrl` con params, query params filtros catálogo, URLs limpias (decodificar comas), scroll a secciones con offset |
| 3.5 | 2026-01-12 | Sección 16.7: Checklist completo para agregar nuevo filtro al catálogo (17 pasos) |
| 3.6 | 2026-01-12 | Sección 12.10: Eliminado `priceRange`, solo existe `quotaRange` (cuota mensual). Formato URL: `quota=40,100` (coma, no guion). Default: `[25, 400]` |
| 3.7 | 2026-01-12 | Sección 8.2-8.3: SegmentedControl con fondo tenue (`bg-[#4654CD]/15`), RadioGroup sin círculo radio |
| 3.8 | 2026-01-13 | Sección 9.3.3: Card Styling Standards (shadow-sm, border-neutral-200, rounded-xl) |
| 3.9 | 2026-01-13 | Sección 8.7.11: Validación de Campos en Wizard (validateStep, toggle behavior) |
| 4.0 | 2026-01-13 | Sección 18: localStorage Persistence Pattern (isHydrated flag, race condition fix) |
| 4.1 | 2026-01-13 | Sección 19: Responsive Card Grid Pattern (auto-fit, minmax 280-360px, w-full obligatorio) |
| 4.2 | 2026-01-13 | Sección 20: Mobile Bottom Sheet Pattern (estructura, animaciones, 3 puntos de cierre, multi-popup) |
| 4.3 | 2026-01-13 | Sección 6.4.1: Botón Settings y Modal con border-radius 14px estándar |
| 4.4 | 2026-01-13 | Sección 20.4: Bloqueo scroll body (useEffect obligatorio), min-h-[50vh], checklist actualizado |
| 4.5 | 2026-01-15 | Sección 20.3: Z-index estandarizado a `z-[149]` (backdrop) y `z-[150]` (sheet) para cubrir Navbar (z-50) y PromoBanner (z-[60]) |
| 4.6 | 2026-01-15 | Sección 21: FieldTooltip Component - tooltip custom que funciona en mobile (tap) y desktop (hover), usa Portal para evitar overflow clipping, reemplaza Tooltip de NextUI |

---

*Este documento es cargado automáticamente por `/iterar` y aplica a todas las secciones.*
