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

## 6. Colores y Estilos

### 6.1 Colores de Marca

```css
--brand-primary: #4654CD;      /* Azul principal */
--brand-primary-hover: #3a47b3;
--brand-primary-light: #4654CD/10;  /* Para backgrounds sutiles */
--brand-secondary: #03DBD0;    /* Cyan/Turquesa */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### 6.2 Clases Comunes

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

### 6.3 Restricciones

- **NO emojis** en UI → usar `lucide-react` icons
- **NO gradientes** → colores sólidos
- **Cursor pointer** → agregar `cursor-pointer` a todos los elementos clickeables

---

## 7. Performance Patterns

### 7.1 Memoización

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

### 7.2 Evitar Loading en Primer Render

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

### 7.3 Lazy Loading de Imágenes

```tsx
<img
  src={imageUrl}
  alt={description}
  loading="lazy"
  className="w-full h-auto object-contain"
/>
```

---

## 8. Comentarios en Código

### 8.1 Documentación de Componentes

```typescript
/**
 * ComponentV1 - Nombre Descriptivo
 * Descripción breve del patrón/variante
 * Referencia: Sitios que usan este patrón (Amazon, Apple, etc.)
 */
export const ComponentV1: React.FC<Props> = ({ ... }) => {
```

### 8.2 Secciones de Código

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

## 9. Checklist de Validación

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

## 10. Versionado de Documento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-20 | Versión inicial extraída de LEARNINGS_CATALOGO |
| 1.1 | 2025-12-20 | Agregado: tildes en identificadores internos (values, keys) |

---

*Este documento es cargado automáticamente por `/iterar` y aplica a todas las secciones.*
