# Prompt #5: Comparador de Productos - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 8 |
| **Iteraciones T (10 versiones)** | 8 |
| **Prioridad** | Media - Fase 2 |

---

## 1. Contexto

El comparador permite a los usuarios evaluar múltiples productos lado a lado, facilitando la decisión de compra. Es especialmente útil para usuarios que han preseleccionado 2-3 opciones.

### Insights UX/UI
- **Máximo 3-4 productos**: Más de 4 se vuelve difícil de visualizar
- **Destacar diferencias**: Resaltar dónde los productos difieren
- **Precio/cuota prominente**: Factor decisivo más importante
- **Mobile-responsive**: Swipeable en móvil

---

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/comparador/
├── page.tsx                              # Redirect a preview
├── comparator-preview/
│   └── page.tsx                          # Preview con Settings Modal
├── comparator-v1/page.tsx                # V1: Foto Producto
├── comparator-v2/page.tsx                # V2: Foto Lifestyle
├── comparator-v3/page.tsx                # V3: Ilustración Flat
├── comparator-v4/page.tsx                # V4: Abstracto Flotante
├── comparator-v5/page.tsx                # V5: Split 50/50
├── comparator-v6/page.tsx                # V6: Centrado Hero
├── comparator-v7/page.tsx                # V7: Asimétrico Bold
├── comparator-v8/page.tsx                # V8: Data-Driven
├── comparator-v9/page.tsx                # V9: Storytelling
├── comparator-v10/page.tsx               # V10: Interactivo
├── components/
│   └── comparator/
│       ├── ProductComparator.tsx
│       ├── ComparatorSettingsModal.tsx   # Modal con 8 selectores (1-10)
│       ├── layout/
│       │   └── ComparatorLayoutV[1-10].tsx
│       ├── table/
│       │   └── ComparisonTableV[1-10].tsx
│       ├── highlights/
│       │   └── DifferenceHighlightV[1-10].tsx
│       ├── selection/
│       │   └── ProductSelectorV[1-10].tsx
│       └── actions/
│           └── CompareActions.tsx
├── types/
│   └── comparator.ts
└── COMPARATOR_README.md
```

---

## 3. Preguntas del Segmento B - Comparador

### Pregunta B.90 [ITERAR - 10 versiones]
**¿Debe haber funcionalidad de comparar productos lado a lado?**
- **V1**: Checkbox en cards del catálogo (e-commerce clásico)
- **V2**: Botón "Comparar" en página de detalle (intencional)
- **V3**: Ambos accesos + floating bar minimalista (flat)
- **V4**: Icono flotante con contador animado (fintech)
- **V5**: Panel lateral fijo con productos seleccionados (split)
- **V6**: Modal centralizado para iniciar comparación (impacto)
- **V7**: Drag & drop de cards a zona de comparación (bold)
- **V8**: Auto-sugerencia "Compara con..." con % match (data)
- **V9**: "Otros compararon estos..." con stories (storytelling)
- **V10**: Wizard interactivo de comparación paso a paso (interactivo)

### Pregunta B.91 [ITERAR - 10 versiones]
**¿Cuántos productos permitir comparar? (2, 3, 4)**
- **V1**: Máximo 2 productos (simple, muy mobile-friendly)
- **V2**: Máximo 3 productos (balance ideal)
- **V3**: Máximo 4 productos (power users, ilustración)
- **V4**: 2-3 con transiciones fluidas (fintech)
- **V5**: 2 en móvil, 4 en desktop (split responsive)
- **V6**: Solo 2, enfoque en decisión final (impacto)
- **V7**: Variable con layout adaptativo (asimétrico)
- **V8**: Ilimitado con scroll + favoritos (data-driven)
- **V9**: 3 como "protagonista vs alternativas" (storytelling)
- **V10**: Dinámico según selección del usuario (interactivo)

### Pregunta B.92 [ITERAR - 10 versiones]
**¿Qué campos incluir en la tabla comparativa?**
- **V1**: Solo specs principales (CPU, RAM, SSD, Pantalla, Precio)
- **V2**: Specs + key features + cuotas por plazo
- **V3**: Todos los campos con toggle "Mostrar diferencias"
- **V4**: Campos con animaciones de revelado (fintech)
- **V5**: Specs izquierda, features derecha (split)
- **V6**: Solo 5 campos clave, muy prominentes (impacto)
- **V7**: Categorías colapsables con pesos visuales (bold)
- **V8**: Campos con scores/ratings comparativos (data)
- **V9**: Campos como "Lo que importa para ti" (storytelling)
- **V10**: Usuario elige qué campos comparar (interactivo)

### Pregunta B.93 [ITERAR - 10 versiones]
**¿Cómo visualizar 'mejor/peor' entre productos?**
- **V1**: Verde = mejor, Rojo = peor (semántico clásico)
- **V2**: Iconos ✓/✗ o crown para el mejor
- **V3**: Barras proporcionales (más largo = mejor)
- **V4**: Gradientes sutiles + badges flotantes (fintech)
- **V5**: Columna ganadora resaltada completa (split)
- **V6**: Producto ganador centrado y destacado (impacto)
- **V7**: Tamaños de texto variables según valor (bold)
- **V8**: Scores numéricos + ranking (data-driven)
- **V9**: "El favorito de estudiantes como tú" (storytelling)
- **V10**: Selector de criterios para determinar ganador (interactivo)

### Pregunta B.94 [ITERAR - 10 versiones]
**¿Mostrar diferencia de precio y cuota entre productos?**
- **V1**: "+S/200" o "-S/50" relativo al más barato
- **V2**: Diferencia en cuota "+S/15/mes" prominente
- **V3**: Ambos con cálculo de ahorro total anual
- **V4**: Badge flotante con diferencia animada (fintech)
- **V5**: Panel de precios lado a lado (split)
- **V6**: Diferencia gigante centrada (impacto)
- **V7**: Diferencias en posiciones variadas (asimétrico)
- **V8**: Gráfico de ahorro acumulado (data)
- **V9**: "Con X ahorras para..." (storytelling)
- **V10**: Calculadora de diferencia interactiva (interactivo)

### Pregunta B.95 [ITERAR - 10 versiones]
**¿El comparador debe ser modal, página nueva, o panel lateral?**
- **V1**: Modal fullscreen con overlay oscuro
- **V2**: Página dedicada /comparador
- **V3**: Panel lateral sticky (no pierde contexto)
- **V4**: Modal con animaciones fluidas (fintech)
- **V5**: Split: catálogo izq + comparador der (50/50)
- **V6**: Página fullscreen inmersiva (impacto)
- **V7**: Drawer que empuja contenido (asimétrico)
- **V8**: Dashboard con métricas de comparación (data)
- **V9**: Experiencia tipo "story" swipeable (storytelling)
- **V10**: Modo toggle que transforma la vista (interactivo)

### Pregunta B.96 [ITERAR - 10 versiones]
**¿Resaltar automáticamente las diferencias?**
- **V1**: Highlight amarillo en celdas diferentes
- **V2**: Toggle "Solo mostrar diferencias"
- **V3**: Animación pulsante al detectar diferencia
- **V4**: Diferencias con glow sutil (fintech)
- **V5**: Columna de diferencias separada (split)
- **V6**: Solo diferencias visibles, resto oculto (impacto)
- **V7**: Diferencias con tamaños exagerados (bold)
- **V8**: % de diferencia numérico por campo (data)
- **V9**: "Aquí es donde más difieren" con explicación (story)
- **V10**: Filtro interactivo de nivel de diferencia (interactivo)

### Pregunta B.97 [ITERAR - 10 versiones]
**¿Permitir agregar al comparador desde card o solo detalle?**
- **V1**: Solo desde cards (checkbox siempre visible)
- **V2**: Solo desde detalle (más intencional)
- **V3**: Ambos (máxima flexibilidad)
- **V4**: Cards + detalle con animación unificada (fintech)
- **V5**: Card para añadir, detalle para confirmar (split flow)
- **V6**: CTA prominente en ambos lugares (impacto)
- **V7**: Gestos diferentes por ubicación (asimétrico UX)
- **V8**: Auto-sugerencia basada en navegación (data)
- **V9**: "Guarda para comparar después" (storytelling)
- **V10**: Drag anywhere + zona de drop (interactivo)

---

## 4. Tipos TypeScript

```typescript
// types/comparator.ts

export interface ComparatorConfig {
  // B.90 - Funcionalidad de comparación
  accessVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.91 - Cantidad de productos
  maxProductsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.92 - Campos de comparación
  fieldsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.93 - Visualización mejor/peor
  highlightVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.94 - Diferencia de precio
  priceDiffVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.95 - Layout del comparador
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.96 - Resaltado de diferencias
  differenceHighlightVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.97 - Puntos de acceso
  selectionVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultComparatorConfig: ComparatorConfig = {
  accessVersion: 1,
  maxProductsVersion: 2,
  fieldsVersion: 1,
  highlightVersion: 1,
  priceDiffVersion: 1,
  layoutVersion: 1,
  differenceHighlightVersion: 1,
  selectionVersion: 1,
};

export interface ComparisonProduct {
  id: string;
  name: string;
  thumbnail: string;
  brand: string;
  price: number;
  lowestQuota: number;
  specs: Record<string, ComparableSpec>;
}

export interface ComparableSpec {
  label: string;
  value: string | number;
  unit?: string;
  rawValue: number;
  category: string;
  higherIsBetter: boolean;
}

export interface SpecComparison {
  specKey: string;
  label: string;
  values: (string | number)[];
  winner?: number;
  isDifferent: boolean;
}

export interface ComparisonState {
  products: ComparisonProduct[];
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
}
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Card, Button, Chip } from '@nextui-org/react';
import { Trophy, X, ArrowRight } from 'lucide-react';

/**
 * ComparisonTableV1 - Tabla Tradicional
 */

export const ComparisonTableV1: React.FC<{ products: ComparisonProduct[] }> = ({ products }) => {
  const specs = ['processor', 'ram', 'storage', 'display', 'gpu', 'battery'];

  const getWinner = (specKey: string): number | null => {
    // Lógica para determinar el mejor valor
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-4 text-left bg-neutral-100">Característica</th>
            {products.map((product, idx) => (
              <th key={product.id} className="p-4 text-center bg-neutral-100">
                <img src={product.thumbnail} className="w-20 h-20 mx-auto object-cover" />
                <p className="font-semibold mt-2">{product.name}</p>
                <p className="text-xl font-bold text-[#4654CD]">S/{product.lowestQuota}/mes</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specs.map((spec) => {
            const winner = getWinner(spec);
            return (
              <tr key={spec} className="border-b">
                <td className="p-4 font-medium">{spec}</td>
                {products.map((product, idx) => (
                  <td
                    key={product.id}
                    className={`p-4 text-center ${winner === idx ? 'bg-[#22c55e]/10' : ''}`}
                  >
                    {product.specs[spec]?.value}
                    {winner === idx && <Trophy className="w-4 h-4 inline ml-2 text-[#22c55e]" />}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 6. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/comparator.ts` - ComparatorConfig con 8 selectores
- [ ] `ProductComparator.tsx` - Wrapper principal
- [ ] `ComparatorSettingsModal.tsx` - Modal con 8 selectores (1-10)

### Layout (10 versiones)
- [ ] `ComparatorLayoutV1.tsx` a `V10.tsx`

### Tabla de Comparación (10 versiones)
- [ ] `ComparisonTableV1.tsx` a `V10.tsx`

### Highlights (10 versiones)
- [ ] `DifferenceHighlightV1.tsx` a `V10.tsx`

### Selección de Productos (10 versiones)
- [ ] `ProductSelectorV1.tsx` a `V10.tsx`

### Acciones
- [ ] `CompareActions.tsx`
- [ ] Floating bar de comparación

### Páginas
- [ ] `page.tsx` - Redirect a preview
- [ ] `comparator-preview/page.tsx` - Preview con Settings Modal
- [ ] `comparator-v1/page.tsx` a `comparator-v10/page.tsx`

### Documentación
- [ ] `COMPARATOR_README.md`

---

## 7. Notas Importantes

1. **Máximo 3 productos**: Balance ideal entre información y usabilidad
2. **Precio/cuota prominente**: Factor decisivo #1
3. **Mobile swipeable**: Scroll horizontal en dispositivos pequeños
4. **Persistencia**: Guardar selección en localStorage
5. **Sin gradientes**: Colores sólidos
6. **Sin emojis**: Solo Lucide icons
