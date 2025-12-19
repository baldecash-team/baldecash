# Prompt #7: Estado Vacío - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 2 |
| **Iteraciones T (10 versiones)** | 2 |
| **Prioridad** | Baja - Edge Case |

---

## 1. Contexto

El estado vacío aparece cuando los filtros aplicados no devuelven resultados. Es una oportunidad para retener al usuario en lugar de dejarlo sin opciones.

### Insights UX/UI
- **Tono empático**: No culpar al usuario por la búsqueda vacía
- **Acciones claras**: Botones para resolver el problema
- **Productos cercanos**: Mostrar alternativas relevantes
- **Visual amigable**: Ilustración que no genere frustración

---

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/catalogo/
├── components/
│   └── empty/
│       ├── EmptyState.tsx              # Wrapper principal
│       ├── EmptyStateSettingsModal.tsx # Modal con 2 selectores (1-10)
│       ├── illustration/
│       │   └── EmptyIllustrationV[1-10].tsx
│       ├── actions/
│       │   └── EmptyActionsV[1-10].tsx
│       └── suggestions/
│           └── SuggestionsPanelV[1-10].tsx
├── types/
│   └── empty.ts
```

---

## 3. Preguntas del Segmento B - Estado Vacío

### Pregunta B.103 [ITERAR - 10 versiones]
**¿Qué mostrar si los filtros no devuelven resultados?**
- **V1**: Icono SearchX grande + mensaje simple centrado (producto)
- **V2**: Ilustración de estudiante buscando + mensaje empático (lifestyle)
- **V3**: Personaje flat animado buscando con lupa (ilustración)
- **V4**: Shapes abstractos flotantes + mensaje con animación sutil (fintech)
- **V5**: Split: ilustración izquierda + mensaje y acciones derecha
- **V6**: Mensaje gigante centrado "0 resultados" con impacto visual
- **V7**: Tipografía bold asimétrica "Hmm, no encontramos nada..."
- **V8**: Mensaje + estadísticas de filtros aplicados (data-driven)
- **V9**: Mini-historia: "Tu laptop perfecta existe, solo ajusta..." (storytelling)
- **V10**: Asistente interactivo que pregunta cómo ayudar

### Pregunta B.104 [ITERAR - 10 versiones]
**¿Debe sugerirse automáticamente ampliar filtros?**
- **V1**: Botones simples: Limpiar filtros, Ampliar precio (clásico)
- **V2**: Cards con preview de qué cambia al expandir (lifestyle)
- **V3**: Chips ilustrados de sugerencias con iconos flat
- **V4**: Floating pills con animación de hover (fintech)
- **V5**: Panel split: filtros actuales vs. sugeridos
- **V6**: 1 CTA grande "Ver todos los productos" centrado
- **V7**: Opciones con tamaños variables según impacto (bold)
- **V8**: "Si amplías precio +S/50, verás 12 productos más" (data)
- **V9**: "¿Y si pruebas...?" con sugerencias narrativas
- **V10**: Slider interactivo para ajustar filtros en tiempo real

---

## 4. Tipos TypeScript

```typescript
// types/empty.ts

export interface EmptyStateConfig {
  // B.103 - Visualización del estado vacío
  illustrationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.104 - Sugerencias de acción
  actionsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultEmptyStateConfig: EmptyStateConfig = {
  illustrationVersion: 1,
  actionsVersion: 1,
};

export interface AppliedFilter {
  key: string;
  label: string;
  value: string | number | [number, number];
}

export interface EmptyStateProps {
  appliedFilters: AppliedFilter[];
  onClearFilters: () => void;
  onExpandPriceRange: () => void;
  onRemoveFilter: (key: string) => void;
  suggestedProducts?: Product[];
  totalProductsIfExpanded?: number;
}
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { SearchX, RefreshCw, SlidersHorizontal } from 'lucide-react';

/**
 * EmptyStateV1 - Estado Vacío Clásico (Foto Producto)
 * Icono grande centrado con mensaje simple y botones de acción
 */

export const EmptyStateV1: React.FC<EmptyStateProps> = ({
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
          className="border-[#4654CD] text-[#4654CD] cursor-pointer"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onClearFilters}
        >
          Limpiar todos los filtros
        </Button>
        <Button
          variant="bordered"
          className="cursor-pointer"
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

## 6. URLs de Acceso

```
El Estado Vacío es un componente integrado en el Catálogo,
no tiene páginas independientes. Se activa cuando:

/prototipos/0.4/catalogo?filters=... → Sin resultados
```

---

## 7. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/empty.ts` - EmptyStateConfig con 2 selectores
- [ ] `EmptyState.tsx` - Wrapper principal
- [ ] `EmptyStateSettingsModal.tsx` - Modal con 2 selectores (1-10)

### Ilustración (10 versiones)
- [ ] `EmptyIllustrationV1.tsx` a `V10.tsx`

### Acciones (10 versiones)
- [ ] `EmptyActionsV1.tsx` a `V10.tsx`

### Sugerencias (10 versiones)
- [ ] `SuggestionsPanelV1.tsx` a `V10.tsx`

### Integración
- [ ] Integración con CatalogLayout
- [ ] Lógica de detección de estado vacío

---

## 8. Notas Importantes

1. **Tono empático**: No culpar al usuario
2. **Acciones claras**: Botones para resolver el problema
3. **Productos cercanos**: Mostrar alternativas relevantes
4. **Sin emojis**: Solo Lucide icons o ilustraciones vectoriales
5. **Sin gradientes**: Colores sólidos
6. **cursor-pointer**: En todos los botones

