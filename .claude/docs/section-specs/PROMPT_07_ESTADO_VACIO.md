# Prompt #7: Estado Vacío - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 2 |
| **Iteraciones T (3 versiones)** | 0 |
| **Prioridad** | Baja - Edge Case |

---

## 1. Contexto

El estado vacío aparece cuando los filtros aplicados no devuelven resultados. Es una oportunidad para retener al usuario en lugar de dejarlo sin opciones.

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/catalogo/
├── components/
│   └── empty/
│       ├── EmptyState.tsx
│       ├── SuggestionsPanel.tsx
│       └── FilterReset.tsx
```

---

## 3. Preguntas del Segmento B - Estado Vacío

### B.103 [DEFINIDO]
**¿Qué mostrar si los filtros no devuelven resultados?**
→ Ilustración amigable + mensaje empático + sugerencias

### B.104 [DEFINIDO]
**¿Debe sugerirse automáticamente ampliar filtros?**
→ Sí, botones para: Limpiar filtros, Ampliar rango de precio, Ver productos cercanos

---

## 4. Implementación

```typescript
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { SearchX, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface EmptyStateProps {
  appliedFilters: AppliedFilter[];
  onClearFilters: () => void;
  onExpandPriceRange: () => void;
  suggestedProducts?: Product[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  appliedFilters,
  onClearFilters,
  onExpandPriceRange,
  suggestedProducts,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Ilustración */}
      <div className="w-32 h-32 mb-6 text-neutral-300">
        <SearchX className="w-full h-full" />
      </div>
      
      {/* Mensaje */}
      <h3 className="text-xl font-bold text-neutral-800 mb-2">
        No encontramos laptops con estos filtros
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md">
        Prueba ajustando tus filtros o explora otras opciones que podrían interesarte
      </p>
      
      {/* Sugerencias */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Button
          variant="bordered"
          className="border-[#4247d2] text-[#4247d2]"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onClearFilters}
        >
          Limpiar todos los filtros
        </Button>
        <Button
          variant="bordered"
          startContent={<SlidersHorizontal className="w-4 h-4" />}
          onPress={onExpandPriceRange}
        >
          Ampliar rango de precio
        </Button>
      </div>
      
      {/* Productos cercanos */}
      {suggestedProducts && suggestedProducts.length > 0 && (
        <div className="w-full max-w-4xl">
          <h4 className="text-lg font-semibold mb-4">Productos que podrían interesarte</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedProducts.slice(0, 3).map((product) => (
              <ProductCardMini key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Checklist de Entregables

- [ ] `EmptyState.tsx`
- [ ] `SuggestionsPanel.tsx`
- [ ] `FilterReset.tsx`
- [ ] Integración con CatalogLayout

---

## 6. Notas

1. **Tono empático**: No culpar al usuario
2. **Acciones claras**: Botones para resolver el problema
3. **Productos cercanos**: Mostrar alternativas relevantes
4. **Sin emojis**: Solo ilustraciones con Lucide icons
