# Prompt #14: Upsell - Accesorios y Seguros - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmentos** | D (Accesorios) + E (Seguros) |
| **Preguntas totales** | 16 |
| **Iteraciones T (3 versiones)** | 13 |
| **Prioridad** | Media - Revenue Adicional |

---

## 1. Contexto

El upsell se presenta en dos momentos según el researcher:
1. **Accesorios**: En página de producto (antes de solicitar)
2. **Seguros**: Post-aprobación (antes de firma final)

### Insights UX/UI
- No parecer venta agresiva
- Mostrar impacto en cuota claramente
- Fácil agregar y quitar
- Seguros como "protección", no como gasto

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/upsell/
├── page.tsx
├── upsell-preview/
│   └── page.tsx
├── components/
│   └── upsell/
│       ├── accessories/
│       │   ├── AccessoriesSection.tsx
│       │   ├── AccessoryCardV1.tsx       # Cards uniformes
│       │   ├── AccessoryCardV2.tsx       # Cards con imagen
│       │   └── AccessoryCardV3.tsx       # Lista compacta
│       ├── insurance/
│       │   ├── InsuranceSection.tsx
│       │   ├── InsurancePlanV1.tsx       # Cards comparativas
│       │   ├── InsurancePlanV2.tsx       # Tabla comparativa
│       │   └── InsurancePlanV3.tsx       # Slider de planes
│       ├── pricing/
│       │   ├── DynamicTotal.tsx
│       │   ├── PriceBreakdown.tsx
│       │   └── QuotaImpact.tsx
│       └── modals/
│           ├── SkipInsuranceModal.tsx
│           └── CoverageDetailModal.tsx
├── types/
│   └── upsell.ts
└── UPSELL_README.md
```

---

## 3. Preguntas Segmento D - Accesorios

### D.1 [ITERAR - 3 versiones]
**¿Cómo introducir la sección de accesorios sin que parezca venta agresiva?**
- **V1**: "Complementa tu laptop" (sutil)
- **V2**: "Accesorios recomendados" (directo)
- **V3**: "Los estudiantes también llevan..." (social proof)

### D.2 [DEFINIDO]
**¿Debe explicarse que los accesorios son opcionales?**
→ Sí, texto claro: "Todos los accesorios son opcionales"

### D.3 [ITERAR - 3 versiones]
**¿Las cards de accesorios deben tener tamaño uniforme o variable?**
- **V1**: Tamaño uniforme (grid limpio)
- **V2**: Tamaño según precio/relevancia
- **V3**: Carrusel horizontal

### D.4 [ITERAR - 3 versiones]
**¿Debe haber límite visual de cuántos accesorios agregar?**
- **V1**: Sin límite visual
- **V2**: "Máximo 3 accesorios" visible
- **V3**: Warning cuando total sube mucho

### D.5 [ITERAR - 3 versiones]
**¿Cómo indicar visualmente que un accesorio fue agregado?**
- **V1**: Checkmark verde + borde color
- **V2**: Badge "Agregado" sobre la card
- **V3**: Cambio de botón "Agregar" → "Quitar"

### D.6 [ITERAR - 3 versiones]
**¿Debe ser fácil quitar un accesorio?**
- **V1**: Botón X en la card
- **V2**: Toggle on/off
- **V3**: Click para deseleccionar

### D.7 [DEFINIDO]
**¿El total debe actualizarse en tiempo real?**
→ Sí, con animación sutil

### D.8 [ITERAR - 3 versiones]
**¿Debe mostrarse el desglose (laptop + accesorios)?**
- **V1**: Desglose siempre visible
- **V2**: Desglose en tooltip/hover
- **V3**: Solo total con "Ver desglose"

---

## 4. Preguntas Segmento E - Seguros

### E.1 [ITERAR - 3 versiones]
**¿Los seguros deben presentarse como 'protección' o 'tranquilidad'?**
- **V1**: "Protege tu laptop" (funcional)
- **V2**: "Tranquilidad total" (emocional)
- **V3**: "Seguro contra accidentes" (directo)

### E.2 [ITERAR - 3 versiones]
**¿Debe usarse iconografía de protección?**
- **V1**: Escudo
- **V2**: Paraguas
- **V3**: Candado

### E.3 [ITERAR - 3 versiones]
**¿Cómo comparar múltiples planes de seguro?**
- **V1**: Cards lado a lado
- **V2**: Tabla comparativa
- **V3**: Slider de menor a mayor cobertura

### E.4 [ITERAR - 3 versiones]
**¿Debe destacarse el plan recomendado?**
- **V1**: Badge "Recomendado"
- **V2**: Card más grande
- **V3**: Preseleccionado

### E.5 [ITERAR - 3 versiones]
**¿Cómo mostrar qué cubre y qué NO cubre?**
- **V1**: Lista con checks verdes y X rojas
- **V2**: Tabs "Cubre" / "No cubre"
- **V3**: Iconos con hover para detalles

### E.6 [DEFINIDO]
**¿Debe haber ejemplos de situaciones cubiertas?**
→ Sí: "Si se te cae la laptop..." con ilustración

### E.7 [ITERAR - 3 versiones]
**¿Si decide no agregar seguro, el modal debe ser persuasivo o neutral?**
- **V1**: Persuasivo: "¿Estás seguro? Sin seguro..."
- **V2**: Neutral: "Entendido, continuar sin seguro"
- **V3**: Una última oferta: "Última oportunidad..."

### E.8 [ITERAR - 3 versiones]
**¿Los botones del modal deben ser simétricos o destacar una opción?**
- **V1**: Simétricos (ambos iguales)
- **V2**: "Agregar seguro" destacado
- **V3**: "Continuar sin seguro" como link

---

## 5. Tipos TypeScript

```typescript
// types/upsell.ts

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyQuota: number;
  image: string;
  category: 'proteccion' | 'audio' | 'almacenamiento' | 'conectividad';
  isRecommended: boolean;
  compatibleWith: string[]; // IDs de productos
}

export interface InsurancePlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  coverage: CoverageItem[];
  exclusions: string[];
  isRecommended: boolean;
  tier: 'basic' | 'standard' | 'premium';
}

export interface CoverageItem {
  name: string;
  description: string;
  icon: string;
  maxAmount?: number;
}

export interface UpsellState {
  selectedAccessories: string[];
  selectedInsurance: string | null;
  totalProductPrice: number;
  totalAccessoriesPrice: number;
  totalInsurancePrice: number;
  grandTotal: number;
  monthlyQuota: number;
}

export const mockAccessories: Accessory[] = [
  {
    id: 'mouse-1',
    name: 'Mouse inalámbrico Logitech',
    description: 'Mouse ergonómico con 12 meses de batería',
    price: 89,
    monthlyQuota: 4,
    image: '/accessories/mouse.jpg',
    category: 'conectividad',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'funda-1',
    name: 'Funda protectora 15.6"',
    description: 'Protección contra golpes y agua',
    price: 59,
    monthlyQuota: 3,
    image: '/accessories/funda.jpg',
    category: 'proteccion',
    isRecommended: true,
    compatibleWith: ['all'],
  },
  {
    id: 'audifonos-1',
    name: 'Audífonos con micrófono',
    description: 'Ideal para clases virtuales',
    price: 79,
    monthlyQuota: 4,
    image: '/accessories/audifonos.jpg',
    category: 'audio',
    isRecommended: false,
    compatibleWith: ['all'],
  },
];

export const mockInsurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Protección Básica',
    monthlyPrice: 15,
    yearlyPrice: 180,
    tier: 'basic',
    isRecommended: false,
    coverage: [
      { name: 'Robo', description: 'Cobertura por robo con violencia', icon: 'Shield' },
    ],
    exclusions: ['Daños por líquidos', 'Daños accidentales', 'Pérdida'],
  },
  {
    id: 'standard',
    name: 'Protección Total',
    monthlyPrice: 29,
    yearlyPrice: 348,
    tier: 'standard',
    isRecommended: true,
    coverage: [
      { name: 'Robo', description: 'Cobertura por robo', icon: 'Shield' },
      { name: 'Daños accidentales', description: 'Caídas, golpes', icon: 'AlertTriangle' },
      { name: 'Daños por líquidos', description: 'Derrames', icon: 'Droplet' },
    ],
    exclusions: ['Pérdida', 'Daño intencional'],
  },
  {
    id: 'premium',
    name: 'Protección Premium',
    monthlyPrice: 45,
    yearlyPrice: 540,
    tier: 'premium',
    isRecommended: false,
    coverage: [
      { name: 'Todo lo de Total', description: 'Robo, daños, líquidos', icon: 'Shield' },
      { name: 'Pérdida', description: 'Extravío del equipo', icon: 'Search' },
      { name: 'Extensión de garantía', description: '+12 meses', icon: 'Clock' },
    ],
    exclusions: ['Daño intencional'],
  },
];
```

---

## 6. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { Check, Plus, X, Shield } from 'lucide-react';

/**
 * AccessoryCardV1 - Cards Uniformes
 */

export const AccessoryCardV1: React.FC<{
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ accessory, isSelected, onToggle }) => {
  return (
    <Card
      className={`transition-all ${
        isSelected 
          ? 'border-2 border-[#22c55e] bg-[#22c55e]/5' 
          : 'border border-neutral-200'
      }`}
    >
      <CardBody className="p-4">
        <div className="flex gap-4">
          <img 
            src={accessory.image} 
            alt={accessory.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold">{accessory.name}</h4>
              {accessory.isRecommended && (
                <Chip size="sm" color="primary" variant="flat">Popular</Chip>
              )}
            </div>
            <p className="text-sm text-neutral-600 mt-1">{accessory.description}</p>
            <p className="font-bold text-[#4247d2] mt-2">
              +S/{accessory.monthlyQuota}/mes
            </p>
          </div>
        </div>
        
        <Button
          className={`w-full mt-4 ${
            isSelected 
              ? 'bg-[#22c55e] text-white' 
              : 'bg-neutral-100'
          }`}
          startContent={isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          onPress={onToggle}
        >
          {isSelected ? 'Agregado' : 'Agregar'}
        </Button>
      </CardBody>
    </Card>
  );
};
```

---

## 7. Checklist de Entregables

### Accesorios
- [ ] `AccessoriesSection.tsx`
- [ ] `AccessoryCardV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `DynamicTotal.tsx` con animación
- [ ] `PriceBreakdown.tsx`

### Seguros
- [ ] `InsuranceSection.tsx`
- [ ] `InsurancePlanV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `CoverageDetailModal.tsx`
- [ ] `SkipInsuranceModal.tsx`

### Compartido
- [ ] `types/upsell.ts`
- [ ] Mock data de accesorios y seguros
- [ ] `UPSELL_README.md`

---

## 8. Notas

1. **No agresivo**: "Opcional" siempre visible
2. **Impacto en cuota**: "+S/X/mes" claro
3. **Fácil quitar**: Un click para deseleccionar
4. **Seguros como protección**: Enfoque emocional positivo
5. **Sin emojis**: Solo Lucide icons
