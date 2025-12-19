# BaldeCash Web 3.0 - Especificaciones por Sección

Documentación de las 285 decisiones UX/UI organizadas en 16 prompts.

## Cómo Usar

Cuando se genere una sección, leer el PROMPT correspondiente y:
- `[T]` = Generar 3 versiones (V1, V2, V3)
- `[F]` = Generar 1 versión única

## Índice de Secciones

### MVP Core (Prioridad Alta)

| # | Archivo | Sección | Preguntas | Iteraciones [T] |
|---|---------|---------|-----------|-----------------|
| 1 | `PROMPT_01_HERO_LANDING.md` | Hero / Landing | 18 | 10 |
| 2 | `PROMPT_02_CATALOGO_LAYOUT_FILTROS.md` | Catálogo - Layout y Filtros | 36 | 4 |
| 3 | `PROMPT_03_CATALOGO_CARDS.md` | Catálogo - Product Cards | 29 | 16 |
| 4 | `PROMPT_04_DETALLE_PRODUCTO.md` | Detalle de Producto | 24 | - |
| 8 | `PROMPT_08_FORM_ESTRUCTURA.md` | Wizard - Estructura | 22 | 15 |
| 9 | `PROMPT_09_FORM_CAMPOS.md` | Wizard - Componentes | 30 | - |
| 10 | `PROMPT_10_FORM_DATOS_PERSONALES.md` | Wizard - Datos Personales | 13 | - |
| 11 | `PROMPT_11_FORM_DATOS_ACADEMICOS.md` | Wizard - Datos Académicos | 14 | - |
| 12 | `PROMPT_12_FORM_DATOS_ECONOMICOS.md` | Wizard - Datos Económicos | 15 | - |
| 13 | `PROMPT_13_FORM_RESUMEN.md` | Wizard - Resumen | 20 | - |
| 15 | `PROMPT_15_APROBACION.md` | Pantalla Aprobación | 13 | - |
| 16 | `PROMPT_16_RECHAZO.md` | Pantalla Rechazo | 19 | - |

### Features Secundarios (Prioridad Media/Baja)

| # | Archivo | Sección | Preguntas |
|---|---------|---------|-----------|
| 5 | `PROMPT_05_COMPARADOR.md` | Comparador | 8 |
| 6 | `PROMPT_06_QUIZ_AYUDA.md` | Quiz "¿No te decides?" | 5 |
| 7 | `PROMPT_07_ESTADO_VACIO.md` | Estado Vacío | 2 |
| 14 | `PROMPT_14_UPSELL.md` | Upsell - Accesorios y Seguros | 16 |

## Guía de Trabajo

Ver `GUIA_TRABAJO_CLAUDE_TERMINAL.md` para:
- Workflow paso a paso
- Comandos de Claude Terminal
- Checklist de calidad
- Estructura de carpetas esperada

## Componentes Compartidos

Ver `COMPONENT_CUSTOM_SWITCH.md` para documentacion del componente Switch custom.

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| `CustomSwitch` | `_shared/components/CustomSwitch.tsx` | Switch compatible con Tailwind v4 (reemplazo de NextUI Switch) |

**Nota:** NextUI v2 no es compatible con Tailwind CSS v4. Usar `CustomSwitch` en lugar de `Switch` de NextUI.

## Skills Relacionados

Antes de generar cualquier sección, invocar:
- `brandbook` → Colores (#4654CD), tipografía (Baloo 2, Asap), restricciones
- `frontend` → Stack (Next.js, NextUI), patrones, decisiones UX

## Estructura de Archivos por Sección

```
src/app/prototipos/0.X/[seccion]/
├── page.tsx                    # Redirect a preview
├── [seccion]-preview/
│   └── page.tsx                # Preview con Settings Modal
├── [seccion]-v1/
│   └── page.tsx                # Versión 1 standalone
├── [seccion]-v2/
│   └── page.tsx                # Versión 2 standalone
├── [seccion]-v3/
│   └── page.tsx                # Versión 3 standalone
├── components/
│   └── [seccion]/
│       ├── [Seccion]SettingsModal.tsx
│       └── [componente]/
│           ├── [Componente]V1.tsx
│           ├── [Componente]V2.tsx
│           └── [Componente]V3.tsx
├── types/
│   └── [seccion].ts
└── data/
    └── mock[Seccion]Data.ts
```
