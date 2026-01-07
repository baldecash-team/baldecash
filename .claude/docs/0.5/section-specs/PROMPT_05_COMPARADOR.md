# Prompt #5: Comparador de Productos - BaldeCash v0.5

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B |
| **Versiones por componente** | 2 (V1-V2) |
| **Prioridad** | Media - Fase 2 |

---

## 1. Contexto

El comparador permite a los usuarios evaluar múltiples productos lado a lado, facilitando la decisión de compra. Es especialmente útil para usuarios que han preseleccionado 2-3 opciones.

### Insights UX/UI
- **Máximo 3 productos**: Balance ideal entre información y usabilidad
- **Destacar diferencias**: Resaltar dónde los productos difieren
- **Cuota prominente**: Factor decisivo más importante (no precio total)
- **Mobile-responsive**: Diseño que funciona en móvil

---

## 2. Estructura de Archivos (v0.5)

```
src/app/prototipos/0.5/comparador/
├── page.tsx                              # Redirect a preview
├── comparator-preview/
│   └── page.tsx                          # Preview con modal de configuración
├── components/
│   └── comparator/
│       ├── ComparatorV1.tsx              # Modal Fullscreen
│       ├── ComparatorV2.tsx              # Panel Inline Expandible
│       ├── ComparatorSettingsModal.tsx   # Modal con 4 selectores (V1-V2)
│       ├── ProductSelector.tsx           # Grid de selección + Floating Bar
│       └── index.ts                      # Barrel exports
├── types/
│   └── comparator.ts                     # Tipos TypeScript
└── data/
    └── mockComparatorData.ts             # Datos de prueba
```

---

## 3. Configuración v0.5 (5 opciones)

### layoutVersion (V1-V2)
| Versión | Nombre | Descripción |
|---------|--------|-------------|
| V1 | Modal Fullscreen | Modal inmersivo con overlay oscuro |
| V2 | Panel Inline | Panel expandible sin perder contexto |

### designStyle (V1-V3) - EXCEPCIÓN DOCUMENTADA
> **Nota:** Esta es una excepción a la convención V1-V2. El estilo de diseño tiene 3 versiones debido a los diferentes enfoques visuales necesarios.

| Versión | Nombre | Descripción |
|---------|--------|-------------|
| V1 | Columnas Fijas | Productos como headers sticky, tabla vertical de specs |
| V2 | Cards Lado a Lado | Cada producto en su propia card con specs internos |
| V3 | Hero del Ganador | Mejor opción destacada arriba, tabla resumida abajo |

### highlightVersion
| Versión | Nombre | Descripción |
|---------|--------|-------------|
| V1 | Semántico Clásico | Verde = mejor, Rojo = peor con iconos |
| V2 | Barras Proporcionales | Barras visuales indicando valores |

### fieldsVersion
| Versión | Nombre | Descripción |
|---------|--------|-------------|
| V1 | Specs Principales | CPU, RAM, SSD, Pantalla, Cuota (5 campos) |
| V2 | Completo | Todos los campos con toggle diferencias |

### priceDiffVersion
| Versión | Nombre | Descripción |
|---------|--------|-------------|
| V1 | Diferencia Relativa | +S/XX relativo al más económico |
| V2 | Ahorro Anual | Cálculo de ahorro total anual |

---

## 4. Tipos TypeScript

```typescript
// types/comparator.ts

export interface ComparatorConfig {
  layoutVersion: 1 | 2;
  designStyle: 1 | 2 | 3;  // EXCEPCIÓN: 3 versiones
  highlightVersion: 1 | 2;
  fieldsVersion: 1 | 2;
  priceDiffVersion: 1 | 2;
  defaultTerm: TermMonths;
  defaultInitial: InitialPaymentPercent;
}

export const defaultComparatorConfig: ComparatorConfig = {
  layoutVersion: 1,
  designStyle: 1,
  highlightVersion: 1,
  fieldsVersion: 1,
  priceDiffVersion: 1,
  defaultTerm: 24,
  defaultInitial: 10,
};

export const MAX_COMPARE_PRODUCTS = 3;
```

---

## 5. Componentes Principales

### ComparatorV1 (Modal Fullscreen)
- Modal que cubre toda la pantalla
- Header con contador de productos
- Mini cards de productos horizontales
- Tabla de comparación con specs filtradas
- Footer con acciones (Limpiar, Cerrar, Ver mejor opción)
- Animación de "Mejor opción" con badge verde

### ComparatorV2 (Panel Inline)
- Panel fijo en la parte inferior de la pantalla
- Header colapsable con thumbnails de productos
- Grid de product cards al expandir
- Tabla de specs compacta
- Transiciones suaves de apertura/cierre

### ProductSelector
- Grid de productos seleccionables
- Checkbox visual con número de orden
- Límite de 3 productos máximo
- Estados: seleccionado, disponible, deshabilitado

### CompareFloatingBar
- Barra flotante centrada en la parte inferior
- Thumbnails de productos seleccionados
- Contador de productos
- Botones Limpiar y Comparar

---

## 6. Keyboard Shortcuts

| Tecla | Acción |
|-------|--------|
| `Tab` | Navegar entre componentes configurables |
| `Shift+Tab` | Navegar hacia atrás |
| `1-3` | Cambiar versión del componente activo (1-2 o 1-3 según componente) |
| `?` o `K` | Abrir/cerrar Settings Modal |
| `C` | Abrir comparador (si hay 2+ productos) |
| `Escape` | Cerrar modales |

---

## 7. URL Query Params

```
/prototipos/0.5/comparador/comparator-preview?layout=2&design=3&highlight=1&fields=2&pricediff=1
```

| Param | Valores | Default |
|-------|---------|---------|
| `layout` | 1, 2 | 1 |
| `design` | 1, 2, 3 | 1 |
| `highlight` | 1, 2 | 1 |
| `fields` | 1, 2 | 1 |
| `pricediff` | 1, 2 | 1 |
| `mode` | clean | - |

---

## 8. Modo Clean

Con `?mode=clean`:
- Se ocultan todos los controles de UI (TokenCounter, Settings, Code, Back)
- Se muestra el FeedbackButton para recolectar opiniones
- Solo contenido principal + Comparador

---

## 9. Checklist de Entregables

### Tipos y Configuración
- [x] `types/comparator.ts` - Config con 5 opciones (4 V1-V2 + 1 V1-V3)
- [x] `data/mockComparatorData.ts` - Datos de prueba

### Componentes
- [x] `ComparatorV1.tsx` - Modal Fullscreen
- [x] `ComparatorV2.tsx` - Panel Inline
- [x] `ComparatorSettingsModal.tsx` - Modal de configuración (5 selectores)
- [x] `ProductSelector.tsx` - Grid + Floating Bar
- [x] `DesignStyleA.tsx` - Columnas Fijas
- [x] `DesignStyleB.tsx` - Cards Lado a Lado
- [x] `DesignStyleC.tsx` - Hero del Ganador
- [x] `index.ts` - Barrel exports

### Páginas
- [x] `page.tsx` - Redirect a preview
- [x] `comparator-preview/page.tsx` - Preview con configurador

---

## 10. Notas Importantes

1. **Máximo 3 productos**: Balance ideal entre información y usabilidad
2. **Cuota, no precio**: Siempre mostrar cuota mensual como valor principal
3. **"Añadir" no "Agregar"**: Consistencia de verbos en español
4. **Sin gradientes**: Colores sólidos
5. **Sin emojis**: Solo Lucide icons
6. **Cursor pointer**: En todos los elementos clickeables

---

## 11. Diferencias con v0.4

| Aspecto | v0.4 | v0.5 |
|---------|------|------|
| Versiones | 6 por componente | V1-V2 (excepto designStyle V1-V3) |
| Opciones config | 8 (layout, access, max, fields, highlight, priceDiff, diffHighlight, cardSelection) | 5 (layout, design, highlight, fields, priceDiff) |
| Layouts | Modal, Page, Sticky, Fluido, Split, Fullscreen | Modal Fullscreen, Panel Inline |
| Design Styles | Único diseño | 3 estilos: Columnas Fijas, Cards, Hero del Ganador |
| Feedback | No incluido | FeedbackButton en mode=clean |

---

## 12. Referencias

- **Convenciones**: `.claude/docs/0.5/CONVENTIONS.md`
- **v0.4 Implementation**: `src/app/prototipos/0.4/comparador/`
- **Preview URL**: `http://localhost:3000/prototipos/0.5/comparador/comparator-preview`
