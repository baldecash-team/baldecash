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

### Footer (con Generar URL)

**Orden estándar:**
- Izquierda: "Generar URL"
- Derecha: "Restablecer" + "Aplicar"

```tsx
const [copied, setCopied] = useState(false);

const handleGenerateUrl = () => {
  const params = new URLSearchParams();
  params.set('layout', config.layoutVersion.toString());
  params.set('card', config.cardVersion.toString());
  // ... más parámetros según la sección
  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// En el JSX:
<ModalFooter className="bg-white justify-between">
  <Button
    variant="flat"
    startContent={copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
    onPress={handleGenerateUrl}
    className={`cursor-pointer transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
  >
    {copied ? 'Copiado!' : 'Generar URL'}
  </Button>
  <div className="flex gap-2">
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
  </div>
</ModalFooter>
```

### Imports adicionales para Footer

```tsx
import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';
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

---

## 10. Patrón de Floating Action Bar (Comparador)

### Estructura

```tsx
{/* Floating Comparison Bar - aparece cuando hay productos seleccionados */}
{compareList.length > 0 && !isComparatorOpen && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-white rounded-xl shadow-xl border border-neutral-200 px-4 py-3 flex items-center gap-4">
    {/* Icono + Contador */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
        <GitCompare className="w-4 h-4 text-[#4654CD]" />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-800">
          {compareList.length} producto{compareList.length !== 1 ? 's' : ''} seleccionado{compareList.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-neutral-500">
          Máximo 3 productos
        </p>
      </div>
    </div>

    {/* Mini previews */}
    <div className="flex -space-x-2">
      {compareProducts.slice(0, 3).map((product, index) => (
        <div
          key={product.id}
          className="w-10 h-10 rounded-lg bg-neutral-100 border-2 border-white"
          style={{ zIndex: 3 - index }}
        >
          {/* Thumbnail o inicial de marca */}
        </div>
      ))}
    </div>

    {/* Acciones */}
    <div className="flex items-center gap-2">
      <Button variant="flat" onPress={handleClearCompare}>
        Limpiar
      </Button>
      <Button
        className="bg-[#4654CD] text-white"
        onPress={() => setIsComparatorOpen(true)}
        isDisabled={compareList.length < 2}
      >
        Comparar
      </Button>
    </div>
  </div>
)}
```

### Posicionamiento

| Elemento | Posición | z-index |
|----------|----------|---------|
| Floating Bar | `bottom-6 left-1/2 -translate-x-1/2` | 90 |
| Floating Controls | `bottom-6 right-6` | 100 |
| Modal/Comparator | - | 50 |

### Regla de Visibilidad
- **Aparece**: `compareList.length > 0 && !isComparatorOpen`
- **Desaparece**: Cuando se abre el comparador o se limpia la lista

---

## 11. Links de Navegación entre Secciones

### Hero → Catálogo

```typescript
// URL del catálogo con configuración específica
const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=3';

// En HeroBanner (CTA principal)
<Button onPress={() => router.push(catalogUrl)}>
  Ver laptops
</Button>

// En Navbar (link "Laptops" o "Equipos")
<a href={catalogUrl}>Laptops</a>

// En Footer (link "Equipos")
<a href={catalogUrl}>Equipos</a>
```

### Catálogo → Detalle

```typescript
const detailUrl = '/prototipos/0.4/producto/detail-preview/?infoHeader=1&gallery=1&tabs=1&specs=1&pricing=1&cronograma=1&similar=1&limitations=1&certifications=1';

// En ProductCard (botón "Ver detalle")
onViewDetail={() => router.push(detailUrl)}
```

### Consistencia
- Usar `useRouter` y `router.push()` para navegación programática
- Mantener query params completos para preservar configuración

---

## 12. Patrón de Keyboard Shortcuts

### Hook Compartido

Ubicación: `src/app/prototipos/_shared/hooks/useKeyboardShortcuts.ts`

```typescript
const { currentComponent } = useKeyboardShortcuts({
  // Lista de componentes navegables con Tab
  componentOrder: ['layout', 'card', 'filters', ...],

  // Callback cuando se presiona 1-6
  onVersionChange: (componentId, version) => {
    setConfig(prev => ({ ...prev, [`${componentId}Version`]: version }));
    showToast(`${componentLabels[componentId]}: V${version}`, 'version');
  },

  // Callback cuando se presiona Tab/Shift+Tab
  onNavigate: (componentId) => {
    showToast(`Componente: ${componentLabels[componentId]}`, 'navigation');
  },

  // Callback cuando se presiona ? o K
  onToggleSettings: () => setIsSettingsOpen(prev => !prev),

  // Obtener versión actual de un componente
  getCurrentVersion: (componentId) => config[`${componentId}Version`] || 1,

  // Desactiva shortcuts cuando hay modal abierto
  isModalOpen: isSettingsOpen,
});
```

### Toast UI Estandarizado

```tsx
{/* Toast de shortcuts */}
<AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium ${
        toast.type === 'version'
          ? 'bg-[#4654CD] text-white'
          : toast.type === 'navigation'
          ? 'bg-neutral-800 text-white'
          : 'bg-white text-neutral-800 border border-neutral-200'
      }`}
    >
      {toast.type === 'version' && <Layers className="w-4 h-4" />}
      {toast.type === 'navigation' && <Navigation className="w-4 h-4" />}
      {toast.type === 'info' && <Info className="w-4 h-4" />}
      <span>{toast.message}</span>
    </motion.div>
  )}
</AnimatePresence>
```

### Estilos por Tipo de Toast

| Tipo | Background | Icono | Mensaje | Uso |
|------|------------|-------|---------|-----|
| `navigation` | `bg-neutral-800` (negro) | `Navigation` (cursor) | `"Componente: {nombre}"` | Tab/Shift+Tab |
| `version` | `bg-[#4654CD]` (primario) | `Layers` | `"{nombre}: V{n}"` | Teclas 1-6 |
| `info` | `bg-white border` | `Info` | mensaje libre | Ayuda, errores |

### Badge de Ayuda

```tsx
{/* Shortcut Help Badge - SIEMPRE en top-20 right-6 */}
<div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
    <Keyboard className="w-3.5 h-3.5" />
    <span>Press ? for help</span>
  </div>
  <div className="text-xs font-medium text-[#4654CD]">
    Activo: {componentLabels[currentComponent] || currentComponent}
  </div>
</div>
```

### Estado Requerido

```typescript
const [toast, setToast] = useState<{
  message: string;
  type: 'version' | 'navigation' | 'info'
} | null>(null);

const showToast = useCallback((
  message: string,
  type: 'version' | 'navigation' | 'info' = 'info'
) => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 2000);
}, []);

const componentLabels: Record<string, string> = {
  layout: 'Layout',
  card: 'Card',
  // ... nombres legibles en español
};
```

### Manejo de Versiones Limitadas

Algunos componentes tienen menos de 6 versiones. Validar antes de aplicar:

```typescript
onVersionChange: (componentId, version) => {
  // focusVersion solo tiene 1-3
  if (configKey === 'focusVersion' && version > 3) {
    showToast(`${componentLabels[componentId]} solo tiene 3 versiones`, 'info');
    return;
  }
  // Aplicar cambio normalmente...
}
```

### Imports Necesarios

```typescript
// Iconos para toast
import { Layers, Keyboard, Navigation, Info } from 'lucide-react';

// Animaciones
import { AnimatePresence, motion } from 'framer-motion';

// Hook compartido
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';
```

### Atajos de Teclado Disponibles

| Tecla | Acción |
|-------|--------|
| `1-6` | Cambiar versión del componente activo |
| `Tab` | Siguiente componente |
| `Shift + Tab` | Componente anterior |
| `?` o `K` | Abrir/cerrar configuración |
| `Escape` | Cerrar modal |

### Checklist de Implementación

Al agregar shortcuts a una página preview:

- [ ] Importar `useKeyboardShortcuts` de `@/app/prototipos/_shared`
- [ ] Importar iconos: `Layers`, `Keyboard`, `Navigation`, `Info`
- [ ] Importar `AnimatePresence`, `motion` de framer-motion
- [ ] Agregar estado `toast` con tipo union
- [ ] Crear función `showToast` con setTimeout 2000ms
- [ ] Definir `componentLabels` con nombres en español
- [ ] Configurar hook con `onVersionChange` y `onNavigate`
- [ ] Agregar Toast UI animado con estilos por tipo
- [ ] Agregar Badge de ayuda en `top-20 right-6`
- [ ] Validar versiones limitadas (si aplica)

### Páginas con Shortcuts Implementados

| Página | Componentes navegables |
|--------|----------------------|
| hero | title, subtitle, cta, howItWorks, benefits, testimonials, faq, footer |
| catalogo | layout, brandFilter, card, technicalFilters, skeleton, loadMore, imageGallery, gallerySize, tagDisplay |
| comparador | layout, access, maxProducts, fields, highlight, priceDiff, diffHighlight, cardSelection |
| quiz | layout, questionStyle, results, focus |
| empty-preview | illustration, actions |
| aprobado-preview | celebration, confetti, sound, summary, nextSteps, share, referral |
| rechazado | visual, illustration, branding, message, explanationDetail, ... |
| upsell | accessoryIntro, accessoryCard, insuranceIntro, planComparison |
| wizard-solicitud | layout, progress, field, validation, error, summary |
| producto/detail | gallery, infoHeader, pricing, certifications, tabs, specs, cronograma, similarProducts, limitations |
| convenio | navbar, hero, benefits, testimonials, faq, cta, footer |

---

## 13. Hook `useIsMobile` - Detección Responsiva

### Ubicación
`src/app/prototipos/_shared/hooks/useIsMobile.ts`

### Uso

```typescript
import { useIsMobile } from '@/app/prototipos/_shared';

const MyComponent = () => {
  const isMobile = useIsMobile(); // true si < 768px

  return isMobile ? <MobileVersion /> : <DesktopVersion />;
};
```

### Implementación

```typescript
'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Tailwind md

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false); // Default: desktop (SSR)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkIsMobile(); // Check on mount
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
```

### Cuándo Usar

| Situación | Solución |
|-----------|----------|
| Solo estilos diferentes | CSS media queries / Tailwind responsive |
| Versión diferente de componente | `useIsMobile` hook |
| Lógica condicional por dispositivo | `useIsMobile` hook |

### Consideraciones SSR

- Default a `false` (desktop) en el servidor
- Se actualiza en cliente después del mount
- Evita hydration mismatch

---

## 14. Patrón de Config Responsivo por Versión

### Problema
Algunas veces necesitas mostrar diferentes versiones de un componente según el dispositivo, no solo cambiar estilos CSS.

### Solución

```typescript
const isMobile = useIsMobile();

// Quiz: V4 (bottom sheet) mobile, V5 (modal) desktop
const quizConfig = {
  layoutVersion: isMobile ? 4 : 5,
  // ... resto igual
};

<HelpQuiz config={quizConfig} />
```

### Ejemplos de Uso

| Componente | Mobile | Desktop | Razón |
|------------|--------|---------|-------|
| Quiz Layout | V4 (Bottom Sheet) | V5 (Modal) | UX nativa en mobile |
| Settings | Drawer | Modal | Espacio disponible |
| Filtros | Drawer | Sidebar | Navegación táctil |

### Anti-patrón

```typescript
// ❌ INCORRECTO: Renderizar ambos y ocultar con CSS
<div className="hidden md:block">
  <DesktopQuiz />
</div>
<div className="md:hidden">
  <MobileQuiz />
</div>

// ✅ CORRECTO: Un solo componente con config dinámico
const config = { layoutVersion: isMobile ? 4 : 5 };
<Quiz config={config} />
```

---

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-22 | Versión inicial - Patrones estandarizados |
| 1.1 | 2025-12-22 | Anti-patrón: Version Badges Redundantes |
| 1.2 | 2025-12-22 | Anti-patrón: VersionNav en páginas preview |
| 1.3 | 2025-12-22 | Reglas ortográficas en español (UI) |
| 1.4 | 2025-12-22 | Agregado: Floating Action Bar, Links entre secciones |
| 1.5 | 2025-12-23 | Agregado: Patrón de Keyboard Shortcuts estandarizado |
| 1.6 | 2025-12-23 | Agregado: Hook useIsMobile, Config responsivo por versión |
