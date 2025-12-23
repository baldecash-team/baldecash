# Convenciones Globales - BaldeCash v0.4

> Reglas que aplican a **TODOS** los módulos en `src/app/prototipos/0.4/`
> Estas convenciones son cargadas automáticamente por el comando `/iterar`

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
grep -rE "Catalogo|Configuracion|Basica|mas |rapido|diseno|programacion" src/app/prototipos/0.4/
```

---

## 2. Componentes Compartidos de UI

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
  <TokenCounter sectionId="PROMPT_{NUMBER}" version="0.4" />
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
    onPress={() => router.push('/prototipos/0.4')}
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
| Back (←) | bottom-right | Visible | Navega a `/prototipos/0.4` |
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
  // Versiones de componentes (siempre 1-6 para iterables)
  componentVersion: 1 | 2 | 3 | 4 | 5 | 6;

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
src/app/prototipos/0.4/{seccion}/
├── {seccion}-preview/
│   └── page.tsx                    # Preview con configurador
├── components/
│   └── {seccion}/
│       ├── {Component}V1.tsx       # Versión 1
│       ├── {Component}V2.tsx       # Versión 2
│       ├── {Component}V3.tsx       # ... hasta V6
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

### 6.1 Estructura Obligatoria

Todos los `SettingsModal` en v0.4 deben usar `RadioGroup` con `Radio`, **NO** `Select` dropdown.

```tsx
import { RadioGroup, Radio } from '@nextui-org/react';

// Estructura de cada sección
<div className="mb-6 pt-4 border-t border-neutral-200">
  <div className="flex items-center gap-2 mb-3">
    <IconComponent className="w-4 h-4 text-[#4654CD]" />
    <h3 className="font-semibold text-neutral-800">Nombre de la Opción</h3>
  </div>
  <RadioGroup
    value={config.optionVersion.toString()}
    onValueChange={(val) => updateConfig('optionVersion', parseInt(val))}
    classNames={{ wrapper: 'gap-2' }}
  >
    {[1, 2, 3, 4, 5, 6].map((version) => (
      <Radio
        key={version}
        value={version.toString()}
        classNames={{
          base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
            ${config.optionVersion === version
              ? 'border-[#4654CD] bg-[#4654CD]/5'
              : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`,
          wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
          labelWrapper: 'ml-2',
          label: 'text-sm',
          description: 'text-xs text-neutral-500',
        }}
        description={versionLabels[version].description}
      >
        V{version} - {versionLabels[version].name}
      </Radio>
    ))}
  </RadioGroup>
</div>
```

### 6.2 Elementos del Radio

| Elemento | Contenido |
|----------|-----------|
| Label | `V{n} - {nombre}` |
| Description | Descripción breve de la versión |
| Estado seleccionado | `border-[#4654CD] bg-[#4654CD]/5` |
| Estado hover | `hover:border-[#4654CD]/50` |

### 6.3 Separadores entre Secciones

```tsx
// Primera sección: sin border-top
<div className="mb-6">

// Secciones intermedias: con border-top
<div className="mb-6 pt-4 border-t border-neutral-200">

// Última sección: sin mb-6
<div className="pt-4 border-t border-neutral-200">
```

### 6.4 Títulos Sin Códigos Internos

```tsx
// ❌ Incorrecto: códigos visibles
<h3>Layout del Comparador (B.95)</h3>

// ✅ Correcto: códigos solo en comentarios
{/* Layout Version (B.95) */}
<h3>Layout del Comparador</h3>
```

### 6.5 Modal Base Config

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

## 8. Performance Patterns

### 8.1 Memoización

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

### 8.2 Evitar Loading en Primer Render

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

### 8.3 Lazy Loading de Imágenes

```tsx
<img
  src={imageUrl}
  alt={description}
  loading="lazy"
  className="w-full h-auto object-contain"
/>
```

---

## 9. Comentarios en Código

### 9.1 Documentación de Componentes

```typescript
/**
 * ComponentV1 - Nombre Descriptivo
 * Descripción breve del patrón/variante
 * Referencia: Sitios que usan este patrón (Amazon, Apple, etc.)
 */
export const ComponentV1: React.FC<Props> = ({ ... }) => {
```

### 9.2 Secciones de Código

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

## 10. Patrón de Configuración A/B

### 10.1 Implementación Real, No Solo Estado

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

### 10.2 Versiones Exclusivas, No Combinadas

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

### 10.3 Eliminar Opciones Sin Valor

Si una opción de configuración no produce cambios visibles diferenciables:
1. **Primero**: Intentar implementarla correctamente
2. **Si no aporta valor**: Eliminarla del config, modal, y URL params

```typescript
// Antes: 8 opciones (una no funcionaba)
selectionVersion: 1 | 2 | 3 | 4 | 5 | 6; // ❌ eliminada

// Después: 7 opciones funcionales
// Menos opciones = menos complejidad = mejor UX de testing
```

### 10.4 Props Opcionales con Defaults

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

### 10.5 Versiones con Mismos Datos Necesitan Diferenciadores Visuales

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

### 10.6 No Eliminar Funcionalidad Sin Entender Contexto A/B

Antes de eliminar código que parece innecesario, verificar si es parte del sistema A/B:

```typescript
// ❌ Error: Eliminar porque "el usuario pidió quitar +S/135"
{renderPriceDiff(index)} // eliminado

// ✅ Correcto: Entender que es necesario para versiones de precio
// El usuario quería quitar un valor específico, no la funcionalidad
// Las 6 versiones de "Diferencia de Precio" dependen de esto
```

---

## 11. Checklist de Validación

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

## 11. Versionado de Documento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-20 | Versión inicial extraída de LEARNINGS_CATALOGO |
| 1.1 | 2025-12-20 | Agregado: tildes en identificadores internos (values, keys) |
| 1.2 | 2025-12-21 | Agregado: Settings Modal Pattern (sección 6) |

---

*Este documento es cargado automáticamente por `/iterar` y aplica a todas las secciones.*
