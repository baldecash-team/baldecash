# Prompt #5: Comparador de Productos - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 8 |
| **Iteraciones T (3 versiones)** | 8 |
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

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/comparador/
├── page.tsx
├── comparator-preview/
│   └── page.tsx
├── components/
│   └── comparator/
│       ├── ProductComparator.tsx
│       ├── ComparatorSettingsModal.tsx
│       ├── layout/
│       │   ├── ComparatorLayoutV1.tsx      # Modal fullscreen
│       │   ├── ComparatorLayoutV2.tsx      # Página dedicada
│       │   └── ComparatorLayoutV3.tsx      # Panel lateral sticky
│       ├── table/
│       │   ├── ComparisonTableV1.tsx       # Tabla tradicional
│       │   ├── ComparisonTableV2.tsx       # Cards side-by-side
│       │   └── ComparisonTableV3.tsx       # Scroll horizontal
│       ├── highlights/
│       │   ├── DifferenceHighlightV1.tsx   # Colores verde/rojo
│       │   ├── DifferenceHighlightV2.tsx   # Iconos winner/loser
│       │   └── DifferenceHighlightV3.tsx   # Barras comparativas
│       ├── selection/
│       │   ├── ProductSelectorV1.tsx       # Desde cards
│       │   ├── ProductSelectorV2.tsx       # Desde detalle
│       │   └── ProductSelectorV3.tsx       # Búsqueda/dropdown
│       └── actions/
│           └── CompareActions.tsx
├── types/
│   └── comparator.ts
└── COMPARATOR_README.md
```

---

## 3. Preguntas del Segmento B - Comparador

### Pregunta B.90 [ITERAR - 3 versiones]
**¿Debe haber funcionalidad de comparar productos lado a lado?**
- **V1**: Sí, acceso desde checkbox en cards
- **V2**: Sí, acceso desde botón en detalle de producto
- **V3**: Sí, ambos accesos + floating bar de comparación

### Pregunta B.91 [ITERAR - 3 versiones]
**¿Cuántos productos permitir comparar? (2, 3, 4)**
- **V1**: Máximo 2 (simple, mobile-friendly)
- **V2**: Máximo 3 (balance ideal)
- **V3**: Máximo 4 (power users)

### Pregunta B.92 [ITERAR - 3 versiones]
**¿Qué campos incluir en la tabla comparativa?**
- **V1**: Solo specs principales (CPU, RAM, SSD, Pantalla, Precio)
- **V2**: Specs principales + key features + cuotas
- **V3**: Todos los campos con toggle "Mostrar diferencias"

### Pregunta B.93 [ITERAR - 3 versiones]
**¿Cómo visualizar 'mejor/peor' entre productos?**
- **V1**: Verde = mejor, Rojo = peor (semántico)
- **V2**: Iconos ✓/✗ o crown para el mejor
- **V3**: Barras proporcionales (más largo = mejor)

### Pregunta B.94 [ITERAR - 3 versiones]
**¿Mostrar diferencia de precio y cuota entre productos?**
- **V1**: "+S/200" o "-S/50" relativo al más barato
- **V2**: Diferencia en cuota "+S/15/mes"
- **V3**: Ambos con cálculo de ahorro total

### Pregunta B.95 [ITERAR - 3 versiones]
**¿El comparador debe ser modal, página nueva, o panel lateral?**
- **V1**: Modal fullscreen con overlay
- **V2**: Página dedicada /comparador
- **V3**: Panel lateral sticky (no pierde contexto)

### Pregunta B.96 [ITERAR - 3 versiones]
**¿Resaltar automáticamente las diferencias?**
- **V1**: Highlight amarillo en celdas diferentes
- **V2**: Toggle "Solo mostrar diferencias"
- **V3**: Animación al detectar diferencia

### Pregunta B.97 [ITERAR - 3 versiones]
**¿Permitir agregar al comparador desde card o solo detalle?**
- **V1**: Solo desde cards (checkbox visible)
- **V2**: Solo desde detalle (más intencional)
- **V3**: Ambos (máxima flexibilidad)

---

## 4. Tipos TypeScript

```typescript
// types/comparator.ts

export interface ComparatorConfig {
  layoutVersion: 1 | 2 | 3;
  maxProducts: 2 | 3 | 4;
  fieldsVersion: 1 | 2 | 3;
  highlightVersion: 1 | 2 | 3;
  priceDiffVersion: 1 | 2 | 3;
  selectionVersion: 1 | 2 | 3;
  differenceHighlight: 1 | 2 | 3;
}

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
  rawValue: number; // Para comparación numérica
  category: string;
  higherIsBetter: boolean;
}

export interface SpecComparison {
  specKey: string;
  label: string;
  values: (string | number)[];
  winner?: number; // Index del mejor producto
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
                <p className="text-xl font-bold text-[#4247d2]">S/{product.lowestQuota}/mes</p>
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

- [ ] `types/comparator.ts`
- [ ] `ProductComparator.tsx`
- [ ] `ComparatorSettingsModal.tsx`
- [ ] `ComparatorLayoutV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `ComparisonTableV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `DifferenceHighlightV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `ProductSelectorV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `CompareActions.tsx`
- [ ] Floating bar de comparación
- [ ] `COMPARATOR_README.md`

---

## 7. Notas Importantes

1. **Máximo 3 productos**: Balance ideal entre información y usabilidad
2. **Precio/cuota prominente**: Factor decisivo #1
3. **Mobile swipeable**: Scroll horizontal en dispositivos pequeños
4. **Persistencia**: Guardar selección en localStorage
5. **Sin gradientes**: Colores sólidos
6. **Sin emojis**: Solo Lucide icons
