# Aprendizajes - Patrones UI v0.4

> Patrones de UI estandarizados para todas las páginas de preview.
> Referencia: CatalogSettingsModal y catalog-preview/page.tsx

---

## 1. Patrón de Settings Modal

### Estructura Base

```typescript
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

### Header con Ícono Badge

```tsx
<ModalHeader className="flex items-center gap-3">
  <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
    <Settings className="w-4 h-4 text-[#4654CD]" />
  </div>
  <span className="text-lg font-semibold text-neutral-800">
    Configuración del [Sección]
  </span>
</ModalHeader>
```

### Descripción Inicial

```tsx
<p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
  Personaliza el diseño seleccionando diferentes versiones de cada componente.
</p>
```

### Sección con Ícono + RadioGroup

```tsx
{/* Primera sección - sin border-t */}
<div className="mb-6">
  <div className="flex items-center gap-2 mb-3">
    <Layout className="w-4 h-4 text-[#4654CD]" />
    <h3 className="font-semibold text-neutral-800">Layout</h3>
  </div>
  <RadioGroup
    value={config.layoutVersion.toString()}
    onValueChange={(val) => onConfigChange({ ...config, layoutVersion: parseInt(val) })}
    classNames={{ wrapper: 'gap-2' }}
  >
    {versionOptions.map((version) => (
      <Radio
        key={version}
        value={version.toString()}
        classNames={{
          base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
            ${config.layoutVersion === version
              ? 'border-[#4654CD] bg-[#4654CD]/5'
              : 'border-neutral-200 hover:border-[#4654CD]/50'
            }`,
          wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
          labelWrapper: 'ml-2',
          label: 'text-sm',
          description: 'text-xs text-neutral-500',
        }}
        description={versionDescriptions.layout[version]}
      >
        Versión {version}
      </Radio>
    ))}
  </RadioGroup>
</div>

{/* Secciones siguientes - con border-t */}
<div className="mb-6 pt-4 border-t border-neutral-200">
  {/* ... mismo patrón */}
</div>
```

### Footer

```tsx
<ModalFooter className="bg-white">
  <Button
    variant="light"
    startContent={<RotateCcw className="w-4 h-4" />}
    onPress={handleReset}
    className="cursor-pointer"
  >
    Restablecer
  </Button>
  <Button
    className="bg-[#4654CD] text-white cursor-pointer"
    onPress={onClose}
  >
    Aplicar
  </Button>
</ModalFooter>
```

---

## 2. Patrón de Floating Controls

### Estructura

```tsx
{/* Floating controls - SIEMPRE en bottom-right */}
<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
  {/* 1. TokenCounter (siempre primero) */}
  <TokenCounter sectionId="PROMPT_XX" version="0.4" />

  {/* 2. Settings - SIEMPRE púrpura */}
  <Button
    isIconOnly
    className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
    onPress={() => setIsSettingsOpen(true)}
    aria-label="Configuración"
  >
    <Settings className="w-5 h-5" />
  </Button>

  {/* 3. Botones específicos de sección (opcional) */}
  {/* Quiz: Play, Wizard: Zap */}

  {/* 4. Code - toggle config badge */}
  <Button
    isIconOnly
    className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
    onPress={() => setShowConfigBadge(!showConfigBadge)}
    aria-label="Mostrar configuración"
  >
    <Code className="w-5 h-5 text-neutral-600" />
  </Button>

  {/* 5. Back - SIEMPRE último */}
  <Button
    isIconOnly
    className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
    onPress={() => router.push('/prototipos/0.4')}
    aria-label="Volver al índice"
  >
    <ArrowLeft className="w-5 h-5 text-neutral-600" />
  </Button>
</div>
```

### Orden de Botones

| Posición | Botón | Color | Acción |
|----------|-------|-------|--------|
| 1 | TokenCounter | - | Muestra tokens |
| 2 | Settings | Púrpura `bg-[#4654CD]` | Abre modal config |
| 3 | [Específico] | Varía | Quiz: Play, Wizard: Zap |
| 4 | Code | Blanco | Toggle config badge |
| 5 | ArrowLeft | Blanco | Vuelve a /prototipos/0.4 |

### Botones Específicos por Sección

| Sección | Botón | Color | Ícono |
|---------|-------|-------|-------|
| Quiz | Play | Blanco | Play |
| Wizard | Zap | Ámbar `bg-amber-500` | Zap |

---

## 3. Patrón de Config Badge

### Estructura

```tsx
{/* Current Config Badge - toggle con botón Code */}
{showConfigBadge && (
  <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
    <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
    <p className="text-xs font-mono text-neutral-700">
      Layout: V{config.layoutVersion} | Card: V{config.cardVersion} | ...
    </p>
  </div>
)}
```

### Estado Requerido

```typescript
const [showConfigBadge, setShowConfigBadge] = useState(false);
```

---

## 4. Anti-patrón: Back Button en Top-Left

### Problema
Antes se usaba un botón de regreso en la esquina superior izquierda.

### Solución
El botón de regreso SIEMPRE va en el grupo de floating controls (bottom-right).

```tsx
// ❌ INCORRECTO
<div className="fixed top-4 left-4 z-50">
  <Button onPress={() => router.push('/prototipos/0.4')}>
    <ArrowLeft />
  </Button>
</div>

// ✅ CORRECTO
// Incluido en el grupo de floating controls (ver patrón #2)
```

---

## 5. Anti-patrón: Version Badges Redundantes

### Problema
Algunas páginas tenían badges de versión flotantes que mostraban la configuración actual de cada componente de forma permanente o semi-permanente.

### Ejemplos eliminados

| Página | Elemento | Posición |
|--------|----------|----------|
| detail-preview | Version badges overlay | top-center |
| convenio/ConvenioLanding | Version badges | top-left |

### Por qué es redundante
- Ya tenemos el **Config Badge** (bottom-left) que se activa con el botón Code
- Muestra exactamente la misma información
- Los badges flotantes ocupan espacio visual innecesario
- Interfieren con el contenido principal

### Solución
Usar únicamente el patrón de Config Badge (toggle con botón Code) para mostrar la configuración actual.

```tsx
// ❌ INCORRECTO - Badges siempre visibles
<div className="fixed top-4 left-1/2 z-50 flex gap-2">
  <span className="bg-[#4654CD] text-white text-xs px-2 py-1 rounded">
    Layout: V{config.layoutVersion}
  </span>
  <span className="bg-[#4654CD] text-white text-xs px-2 py-1 rounded">
    Card: V{config.cardVersion}
  </span>
</div>

// ✅ CORRECTO - Config Badge con toggle (ver patrón #3)
```

---

## 6. Anti-patrón: VersionNav en páginas preview

### Problema
Las páginas de preview incluían el componente `<VersionNav />` que muestra una cabecera de navegación con:
- Logo BaldeCash + badge de versión
- Barra de progreso
- Navegación entre secciones
- Selector de versiones

### Por qué es incorrecto
- Las páginas preview deben ser **limpias y standalone**
- El VersionNav ocupa espacio vertical valioso
- Interfiere con la visualización del componente que se está probando
- No es necesario navegar entre secciones desde una página de preview

### Ejemplos corregidos

| Página | Componente eliminado |
|--------|---------------------|
| empty-preview | `<VersionNav currentVersion="0.4" showSections={true} />` |
| upsell-preview | `<VersionNav currentVersion="0.4" showSections={true} />` |

### Solución

```tsx
// ❌ INCORRECTO
import { VersionNav } from '@/app/prototipos/_shared';

<div className="min-h-screen">
  <VersionNav currentVersion="0.4" showSections={true} />
  {/* contenido */}
</div>

// ✅ CORRECTO
<div className="min-h-screen">
  {/* contenido directamente, sin VersionNav */}
</div>
```

---

## 7. Reglas ortográficas en español (UI)

### Palabras que SIEMPRE llevan tilde

| Incorrecto | Correcto | Contexto |
|------------|----------|----------|
| Version | **Versión** | Labels, títulos, comentarios |
| Pagina | **Página** | Títulos, comentarios |
| Configuracion | **Configuración** | Títulos, labels |
| categoria | **categoría** | Descripciones |
| catalogo | **catálogo** | Descripciones |
| segun | **según** | Comentarios |
| rapido | **rápido** | Adjetivos |
| cambio (pasado) | **cambió** | Verbos en pasado |

### Ejemplos en código

```tsx
// ❌ INCORRECTO
<span>Version {version}</span>
<h1>Pagina de Preview</h1>
// Configuracion del componente

// ✅ CORRECTO
<span>Versión {version}</span>
<h1>Página de Preview</h1>
// Configuración del componente
```

### Checklist de revisión ortográfica

Al crear o modificar archivos con texto en español:

- [ ] Buscar "Version" → cambiar a "Versión"
- [ ] Buscar "Pagina" → cambiar a "Página"
- [ ] Buscar "Configuracion" → cambiar a "Configuración"
- [ ] Buscar "categoria" → cambiar a "categoría"
- [ ] Revisar comentarios en español

---

## 8. Imports Comunes

```typescript
// NextUI
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

// Lucide Icons (por sección)
import {
  Settings,      // Siempre
  RotateCcw,     // Reset en modal
  ArrowLeft,     // Back button
  Code,          // Config badge toggle
  // Íconos por sección...
} from 'lucide-react';

// Router
import { useRouter } from 'next/navigation';
```

---

## 9. Checklist de Implementación

Al crear una nueva página de preview:

- [ ] Settings Modal con patrón RadioGroup
- [ ] Floating controls en bottom-right
- [ ] Settings button púrpura
- [ ] Code button toggle (no copy)
- [ ] Config badge en bottom-left
- [ ] Back button en floating controls (no top-left)
- [ ] NO version badges flotantes (usar Config Badge)
- [ ] NO VersionNav en páginas preview
- [ ] Ortografía correcta (Versión, Página, Configuración)
- [ ] TokenCounter con sectionId correcto
- [ ] aria-labels en todos los botones
- [ ] cursor-pointer en elementos clickeables
- [ ] hover:bg-neutral-100 transition-colors en botones blancos

---

## 10. Referencias

- **Referencia principal**: `src/app/prototipos/0.4/catalogo/catalog-preview/page.tsx`
- **Settings Modal**: `src/app/prototipos/0.4/catalogo/components/catalog/CatalogSettingsModal.tsx`

---

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-22 | Versión inicial - Patrones estandarizados |
| 1.1 | 2025-12-22 | Anti-patrón: Version Badges Redundantes |
| 1.2 | 2025-12-22 | Anti-patrón: VersionNav en páginas preview |
| 1.3 | 2025-12-22 | Reglas ortográficas en español (UI) |
