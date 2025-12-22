/brandbook /frontend

# Iteración de Sección

**Parámetros:** `$ARGUMENTS` = `{PROMPT_NUMBER} {VERSION}`

Ejemplo: `/iterar 01 0.4` o `/iterar 02 0.4`

---

## Flujo de Ejecución

```
/iterar {PROMPT_NUMBER} {VERSION}
    │
    ├─1→ Lee CONVENTIONS.md (reglas GLOBALES - siempre)
    │
    ├─2→ Lee section-specs/PROMPT_{NUMBER}_*.md (SPEC de la sección)
    │
    ├─3→ Lee section-learnings/LEARNINGS_{SECCION}.md (si existe)
    │
    ├─4→ Aplica skills: brandbook + frontend
    │
    └─5→ Genera código aplicando las 3 capas
```

---

## Instrucciones

### Paso 1: Cargar Convenciones Globales (OBLIGATORIO)

Lee `.claude/docs/{VERSION}/CONVENTIONS.md` y aplica:
- Reglas ortográficas (tildes en español)
- Componentes compartidos (Floating Controls Pattern)
- TypeScript patterns (tipos union, Suspense)
- Estilos y colores de marca

### Paso 2: Cargar Spec de la Sección

Lee `.claude/docs/{VERSION}/section-specs/PROMPT_{PROMPT_NUMBER}_*.md`

### Paso 3: Cargar Aprendizajes Específicos (si existen)

Busca `.claude/docs/{VERSION}/section-learnings/LEARNINGS_{SECCION}.md`
- Si existe: aplica patrones específicos de esa sección
- Si no existe: continúa solo con convenciones globales

### Paso 4: Generar Componentes

Usa los skills brandbook y frontend (ya cargados arriba)

Genera componentes según marcadores en el PROMPT:
- **[ITERAR - 6 versiones]** = 6 versiones (V1, V2, V3, V4, V5, V6)
- **[DEFINIDO]** = 1 versión fija aplicada a todas las variantes

### Paso 5: Guardar y Configurar

1. Guarda en `src/app/prototipos/{VERSION}/{seccion}/`
2. Actualiza `public/prototipos/{VERSION}/config.json`
3. Crea `{Seccion}SettingsModal.tsx` para la sección
4. Incluye Floating Controls Pattern en page.tsx (ver sección abajo)

---

## Mapeo de PROMPTs

| # | Sección | Carpeta | Learnings |
|---|---------|---------|-----------|
| 01 | Hero Landing | hero/ | LEARNINGS_HERO.md |
| 02 | Catálogo Layout | catalogo/ | LEARNINGS_CATALOGO.md ✓ |
| 03 | Catálogo Cards | catalogo/ | LEARNINGS_CATALOGO.md ✓ |
| 04 | Detalle Producto | detalle/ | LEARNINGS_DETALLE.md |
| 05 | Comparador | comparador/ | LEARNINGS_COMPARADOR.md |
| 06 | Quiz Ayuda | quiz/ | LEARNINGS_QUIZ.md |
| 07 | Estado Vacío | estados/ | LEARNINGS_ESTADOS.md |
| 08-13 | Wizard/Form | wizard/ | LEARNINGS_WIZARD.md |
| 14 | Upsell | resultados/ | LEARNINGS_RESULTADOS.md |
| 15 | Aprobación | resultados/ | LEARNINGS_RESULTADOS.md |
| 16 | Rechazo | resultados/ | LEARNINGS_RESULTADOS.md |

✓ = Archivo de learnings ya existe

---

## Estructura de Archivos de Documentación

```
.claude/docs/{VERSION}/
├── CONVENTIONS.md                    # 🌐 Reglas GLOBALES (siempre se carga)
├── section-specs/
│   ├── PROMPT_01_HERO_LANDING.md
│   ├── PROMPT_02_CATALOGO_LAYOUT.md
│   └── ...
└── section-learnings/                # 📦 Específicos por sección
    ├── LEARNINGS_HERO.md
    ├── LEARNINGS_CATALOGO.md         # ✓ Ya existe
    └── ...
```

---

## Estructura de Salida

```
src/app/prototipos/{VERSION}/{seccion}/
├── {seccion}-preview/
│   └── page.tsx                      # Preview con Floating Controls
├── components/
│   └── {seccion}/
│       ├── {ComponenteV1}.tsx
│       ├── {ComponenteV2}.tsx
│       ├── {ComponenteV3}.tsx
│       ├── {ComponenteV4}.tsx
│       ├── {ComponenteV5}.tsx
│       ├── {ComponenteV6}.tsx
│       ├── {Seccion}SettingsModal.tsx
│       └── index.ts                  # Barrel exports
├── types/{seccion}.ts
├── data/mock{Seccion}Data.ts
└── page.tsx                          # Redirect a preview
```

---

## Floating Controls Pattern (OBLIGATORIO)

Cada página de preview DEBE incluir los controles flotantes según CONVENTIONS.md:

### Implementación en page.tsx:

```tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Settings, Code, ArrowLeft } from 'lucide-react';
import { TokenCounter } from '@/components/ui/TokenCounter';

// Estados
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [showConfigBadge, setShowConfigBadge] = useState(false); // Default: OCULTO

// JSX - Floating Action Buttons (bottom-right)
<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
  <TokenCounter sectionId="PROMPT_{NUMBER}" version="{VERSION}" />
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
    onPress={() => router.push('/prototipos/{VERSION}')}
  >
    <ArrowLeft className="w-5 h-5 text-neutral-600" />
  </Button>
</div>

// JSX - Config Badge (bottom-left, condicional)
{showConfigBadge && (
  <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
    <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
    <p className="text-xs font-mono text-neutral-700">
      {/* Info específica de la sección */}
    </p>
  </div>
)}
```

---

## Checklist de Validación (de CONVENTIONS.md)

Antes de finalizar, verificar:

### Ortografía
- [ ] Títulos con tildes correctas (Catálogo, Configuración, etc.)
- [ ] Labels y placeholders revisados
- [ ] Tooltips y descripciones
- [ ] Comentarios de código en español

### UI Consistency
- [ ] Floating controls implementados (4 botones)
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

---

## Actualización del Token Counter

Al finalizar la ejecución de `/iterar`, actualizar:
`public/prototipos/{VERSION}/token-usage.json`

```json
{
  "iterations": [
    {
      "promptNumber": "01",
      "section": "hero",
      "timestamp": "2024-12-19T12:00:00.000Z",
      "estimatedTokens": {
        "input": 15000,
        "output": 25000,
        "total": 40000
      },
      "filesGenerated": 24,
      "componentsCreated": ["NavbarV1-V6", "HeroBannerV1-V6", "..."],
      "conventionsApplied": true,
      "learningsApplied": "LEARNINGS_HERO.md"
    }
  ],
  "totalTokensUsed": 40000
}
```

---

## Reporte Final (OBLIGATORIO)

Al terminar cada iteración, mostrar resumen:

```
═══════════════════════════════════════════════════════════════════
  ITERACIÓN COMPLETADA - PROMPT_{NUMBER} v{VERSION}
═══════════════════════════════════════════════════════════════════

  📋 DOCUMENTOS CARGADOS:
  ├─ CONVENTIONS.md ✓
  ├─ PROMPT_{NUMBER}_*.md ✓
  └─ LEARNINGS_{SECCION}.md {✓ o "No existe"}

  📁 ARCHIVOS:
  ├─ Sección: {nombre_seccion}
  ├─ Archivos generados: {count}
  └─ Componentes creados: {lista}

  ✅ VALIDACIONES:
  ├─ Ortografía: ✓
  ├─ Floating Controls: ✓
  ├─ TypeScript: ✓
  └─ Next.js Patterns: ✓

  📊 TOKENS ESTIMADOS:
  ├─ Input:  ~{input_tokens} tokens
  ├─ Output: ~{output_tokens} tokens
  └─ Total:  ~{total_tokens} tokens

  📄 Archivo actualizado: public/prototipos/{VERSION}/token-usage.json
═══════════════════════════════════════════════════════════════════
```

## SettingsModal (OBLIGATORIO)

El modal de configuración DEBE seguir el patrón de HeroSettingsModal:

```tsx
import { Settings, RotateCcw } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from '@nextui-org/react';

// Estructura del modal:
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
  <ModalContent>
    <ModalHeader className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
        <Settings className="w-4 h-4 text-[#4654CD]" />
      </div>
      <span className="text-lg font-semibold text-neutral-800">Configurar {Sección}</span>
    </ModalHeader>
    {/* Usar Select para versiones, NO RadioGroup */}
  </ModalContent>
</Modal>
```

### Reglas del SettingsModal:
- **USAR Select** en lugar de RadioGroup (más compacto)
- **Icono en header** con fondo bg-[#4654CD]/10
- **cursor-pointer** en todos los botones
- **scrollbar-hide** en el body
- **Sin bordes internos** en el contenido

## Keyboard Shortcuts (OBLIGATORIO)

Implementar shortcuts en TODAS las páginas de preview:

```tsx
import { useKeyboardShortcuts } from '@/app/prototipos/_shared';

// En el componente:
useKeyboardShortcuts({
  componentOrder: ['navbar', 'hero', 'socialProof', 'howItWorks', 'cta', 'faq', 'footer'],
  onVersionChange: (componentId, version) => {
    setConfig(prev => ({ ...prev, [`${componentId}Version`]: version }));
  },
  onToggleSettings: () => setIsSettingsOpen(prev => !prev),
  getCurrentVersion: (componentId) => config[`${componentId}Version`] || 1,
  isModalOpen: isSettingsOpen,
});
```

### Atajos disponibles:
- `1-6`: Cambiar versión del componente actual
- `Tab`: Siguiente componente
- `Shift+Tab`: Componente anterior  
- `?` o `K`: Abrir/cerrar modal
- `Escape`: Cerrar modal

## Focus States (CRÍTICO)

**NUNCA** mostrar borde negro en focus de inputs. El CSS global ya está configurado, pero verificar que:

1. NO hay `outline-ring/50` en base styles
2. Inputs NextUI tienen `data-[focus-visible=true]:ring-0`
3. Border cambia a primario en focus: `data-[focus=true]:border-[#4654CD]`

```tsx
// ✅ CORRECTO - Input sin borde negro en focus
<Input
  classNames={{
    inputWrapper: `
      border border-neutral-200 bg-white
      data-[focus=true]:border-[#4654CD]
      data-[focus-visible=true]:ring-0
      data-[focus-visible=true]:ring-offset-0
    `,
  }}
/>
```

## VersionNav (OBLIGATORIO)

Incluir VersionNav en todas las páginas de preview para navegación entre versiones:

```tsx
import { VersionNav } from '@/app/prototipos/_shared';

// En el componente de preview:
<VersionNav currentVersion="{VERSION}" showSections={true} />
```
