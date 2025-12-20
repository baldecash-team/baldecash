# Prompt #14: Upsell - Accesorios y Seguros - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmentos** | D (Accesorios) + E (Seguros) |
| **Preguntas totales** | 16 |
| **Versiones por componente** | 6 |
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

## 2. Estructura de Archivos (6 versiones)

```
src/app/prototipos/0.4/upsell/
├── page.tsx
├── upsell-preview/
│   └── page.tsx
├── components/
│   └── upsell/
│       ├── UpsellSettingsModal.tsx
│       ├── accessories/
│       │   ├── AccessoriesSection.tsx
│       │   ├── intro/
│       │   │   └── AccessoryIntroV[1-6].tsx
│       │   ├── cards/
│       │   │   └── AccessoryCardV[1-6].tsx
│       │   ├── limit/
│       │   │   └── AccessoryLimitV[1-6].tsx
│       │   ├── selection/
│       │   │   └── SelectionIndicatorV[1-6].tsx
│       │   ├── remove/
│       │   │   └── RemoveButtonV[1-6].tsx
│       │   └── breakdown/
│       │       └── PriceBreakdownV[1-6].tsx
│       ├── insurance/
│       │   ├── InsuranceSection.tsx
│       │   ├── intro/
│       │   │   └── InsuranceIntroV[1-6].tsx
│       │   ├── icon/
│       │   │   └── ProtectionIconV[1-6].tsx
│       │   ├── comparison/
│       │   │   └── PlanComparisonV[1-6].tsx
│       │   ├── recommended/
│       │   │   └── RecommendedBadgeV[1-6].tsx
│       │   ├── coverage/
│       │   │   └── CoverageDisplayV[1-6].tsx
│       │   ├── skip/
│       │   │   └── SkipModalV[1-6].tsx
│       │   └── buttons/
│       │       └── ModalButtonsV[1-6].tsx
│       ├── pricing/
│       │   ├── DynamicTotal.tsx
│       │   └── QuotaImpact.tsx
│       └── modals/
│           └── CoverageDetailModal.tsx
├── types/
│   └── upsell.ts
└── UPSELL_README.md
```

---

## 3. Preguntas Segmento D - Accesorios

### D.1 [ITERAR - 6 versiones]
**¿Cómo introducir la sección de accesorios sin que parezca venta agresiva?**
- **V1**: "Complementa tu laptop" - título sutil con iconos de productos
- **V2**: "Accesorios recomendados" - directo y elegante (lifestyle)
- **V3**: "Los estudiantes también llevan..." con ilustración flat de grupo
- **V4**: "Potencia tu experiencia" con animación de reveal (fintech)
- **V5**: Split: "Accesorios" izquierda + "Opcionales" badge derecha
- **V6**: Hero card grande: "Lleva tu equipo completo" (impacto)

### D.2 [DEFINIDO]
**¿Debe explicarse que los accesorios son opcionales?**
→ Sí, texto claro: "Todos los accesorios son opcionales"

### D.3 [ITERAR - 6 versiones]
**¿Las cards de accesorios deben tener tamaño uniforme o variable?**
- **V1**: Grid uniforme 3 columnas, cards del mismo tamaño (e-commerce)
- **V2**: Cards con imagen lifestyle de tamaño variable según precio
- **V3**: Cards uniformes con ilustraciones flat de cada accesorio
- **V4**: Carrusel horizontal con scroll suave y snap (fintech)
- **V5**: Split: featured accessory grande + resto en grid pequeño
- **V6**: Cards gigantes una por fila con máximo detalle (impacto)

### D.4 [ITERAR - 6 versiones]
**¿Debe haber límite visual de cuántos accesorios agregar?**
- **V1**: Sin límite visual, libertad total de selección
- **V2**: Contador elegante "2 de 3 seleccionados" sutil
- **V3**: Badge "Máximo 3" con ilustración flat
- **V4**: Progress bar animado que se llena con cada selección (fintech)
- **V5**: Split: contador izquierda + warning si excede derecha
- **V6**: Warning gigante prominente cuando total sube mucho

### D.5 [ITERAR - 6 versiones]
**¿Cómo indicar visualmente que un accesorio fue agregado?**
- **V1**: Checkmark verde + borde color primario en la card
- **V2**: Badge elegante "Agregado" flotante sobre la card
- **V3**: Cambio de color con ilustración de check flat
- **V4**: Animación de bounce + glow de confirmación (fintech)
- **V5**: Split: card se mueve a sección "Seleccionados"
- **V6**: Card se expande con efecto de impacto visual

### D.6 [ITERAR - 6 versiones]
**¿Debe ser fácil quitar un accesorio?**
- **V1**: Botón X pequeño en esquina superior derecha de la card
- **V2**: Toggle on/off elegante integrado en la card
- **V3**: Click en cualquier parte de la card para deseleccionar
- **V4**: Swipe gesture en mobile + X animada en desktop (fintech)
- **V5**: Botón "Quitar" visible solo en sección de seleccionados
- **V6**: X grande prominente que aparece al hover

### D.7 [DEFINIDO]
**¿El total debe actualizarse en tiempo real?**
→ Sí, con animación sutil

### D.8 [ITERAR - 6 versiones]
**¿Debe mostrarse el desglose (laptop + accesorios)?**
- **V1**: Desglose siempre visible en card lateral o inferior
- **V2**: Desglose elegante en tooltip/hover sobre el total
- **V3**: Solo total visible + "Ver desglose" con icono flat
- **V4**: Desglose animado que se expande/colapsa (fintech)
- **V5**: Split: desglose completo en columna lateral fija
- **V6**: Desglose prominente centrado debajo de selección

---

## 4. Preguntas Segmento E - Seguros

### E.1 [ITERAR - 6 versiones]
**¿Los seguros deben presentarse como 'protección' o 'tranquilidad'?**
- **V1**: "Protege tu laptop" - funcional y directo (producto)
- **V2**: "Tranquilidad total" - emocional y elegante (lifestyle)
- **V3**: "Seguro contra accidentes" - claro con ilustración flat
- **V4**: "Tu laptop, siempre protegida" con animación (fintech)
- **V5**: Split: "Protección" título + "Para tu tranquilidad" subtítulo
- **V6**: "¡No te arriesgues!" - mensaje de impacto

### E.2 [ITERAR - 6 versiones]
**¿Debe usarse iconografía de protección?**
- **V1**: Escudo clásico con checkmark - símbolo universal
- **V2**: Paraguas elegante - protección sutil y lifestyle
- **V3**: Candado con ilustración flat - seguridad
- **V4**: Escudo animado con efecto de brillo (fintech)
- **V5**: Split: escudo izquierda + beneficios derecha
- **V6**: Escudo gigante como hero element

### E.3 [ITERAR - 6 versiones]
**¿Cómo comparar múltiples planes de seguro?**
- **V1**: Cards lado a lado con features listadas (e-commerce)
- **V2**: Tabla comparativa elegante con checks y X
- **V3**: Slider visual de menor a mayor cobertura (flat)
- **V4**: Cards con animación de hover para ver detalles (fintech)
- **V5**: Split: preview rápido + tabla completa en modal
- **V6**: Cards gigantes apiladas con comparación visual

### E.4 [ITERAR - 6 versiones]
**¿Debe destacarse el plan recomendado?**
- **V1**: Badge "Recomendado" sobre la card del plan
- **V2**: Card más grande con borde elegante destacado
- **V3**: Ilustración flat de estrella o medalla
- **V4**: Animación de pulso sutil en plan recomendado (fintech)
- **V5**: Split: plan recomendado prominente + otros en lista
- **V6**: Plan recomendado como hero card central

### E.5 [ITERAR - 6 versiones]
**¿Cómo mostrar qué cubre y qué NO cubre?**
- **V1**: Lista con checks verdes (cubre) y X rojas (no cubre)
- **V2**: Tabs elegantes "Cubre" / "No cubre" separados
- **V3**: Iconos flat con colores: verde incluido, gris excluido
- **V4**: Lista animada que revela items uno por uno (fintech)
- **V5**: Split: coberturas izquierda + exclusiones derecha
- **V6**: Coberturas prominentes, exclusiones en texto pequeño

### E.6 [DEFINIDO]
**¿Debe haber ejemplos de situaciones cubiertas?**
→ Sí: "Si se te cae la laptop..." con ilustración

### E.7 [ITERAR - 6 versiones]
**¿Si decide no agregar seguro, el modal debe ser persuasivo o neutral?**
- **V1**: Persuasivo suave: "¿Estás seguro? Sin seguro..."
- **V2**: Neutral elegante: "Entendido, continuar sin seguro"
- **V3**: Informativo con ilustración: "Sin seguro significa..."
- **V4**: Última oferta animada: "Última oportunidad..." (fintech)
- **V5**: Split: riesgos izquierda + beneficios de continuar derecha
- **V6**: Modal de impacto: "Tu laptop no estará protegida"

### E.8 [ITERAR - 6 versiones]
**¿Los botones del modal deben ser simétricos o destacar una opción?**
- **V1**: Simétricos, ambos botones del mismo tamaño y estilo
- **V2**: "Agregar seguro" primario destacado, "Sin seguro" secundario
- **V3**: Simétricos con iconos flat diferenciadores
- **V4**: "Agregar" con animación de hover atractiva (fintech)
- **V5**: Split vertical: agregar arriba destacado + sin seguro abajo
- **V6**: "Agregar seguro" gigante, "Sin seguro" como link pequeño

---

## 5. Tipos TypeScript

```typescript
// types/upsell.ts

export interface UpsellConfig {
  // D.1 - Introducción de accesorios
  accessoryIntroVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.3 - Cards de accesorios
  accessoryCardVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.4 - Límite de accesorios
  accessoryLimitVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.5 - Indicador de selección
  selectionIndicatorVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.6 - Botón de quitar
  removeButtonVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // D.8 - Desglose de precios
  priceBreakdownVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.1 - Introducción de seguros
  insuranceIntroVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.2 - Icono de protección
  protectionIconVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.3 - Comparación de planes
  planComparisonVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.4 - Badge de recomendado
  recommendedBadgeVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.5 - Visualización de cobertura
  coverageDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.7 - Modal de skip
  skipModalVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // E.8 - Botones del modal
  modalButtonsVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultUpsellConfig: UpsellConfig = {
  accessoryIntroVersion: 1,
  accessoryCardVersion: 1,
  accessoryLimitVersion: 1,
  selectionIndicatorVersion: 1,
  removeButtonVersion: 1,
  priceBreakdownVersion: 1,
  insuranceIntroVersion: 1,
  protectionIconVersion: 1,
  planComparisonVersion: 1,
  recommendedBadgeVersion: 1,
  coverageDisplayVersion: 1,
  skipModalVersion: 1,
  modalButtonsVersion: 1,
};

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyQuota: number;
  image: string;
  category: 'proteccion' | 'audio' | 'almacenamiento' | 'conectividad';
  isRecommended: boolean;
  compatibleWith: string[];
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
 * AccessoryCardV1 - Cards Uniformes (E-commerce)
 * Grid limpio con cards del mismo tamaño
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
            <p className="font-bold text-[#4654CD] mt-2">
              +S/{accessory.monthlyQuota}/mes
            </p>
          </div>
        </div>

        <Button
          className={`w-full mt-4 cursor-pointer ${
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

### Tipos y Configuración
- [ ] `types/upsell.ts` - UpsellConfig con 13 selectores (1-6)
- [ ] `UpsellSettingsModal.tsx` - Modal con 13 selectores

### Accesorios (6 versiones cada uno)
- [ ] `AccessoriesSection.tsx`
- [ ] `AccessoryIntroV1.tsx` a `V6.tsx`
- [ ] `AccessoryCardV1.tsx` a `V6.tsx`
- [ ] `AccessoryLimitV1.tsx` a `V6.tsx`
- [ ] `SelectionIndicatorV1.tsx` a `V6.tsx`
- [ ] `RemoveButtonV1.tsx` a `V6.tsx`
- [ ] `PriceBreakdownV1.tsx` a `V6.tsx`
- [ ] `DynamicTotal.tsx` con animación

### Seguros (6 versiones cada uno)
- [ ] `InsuranceSection.tsx`
- [ ] `InsuranceIntroV1.tsx` a `V6.tsx`
- [ ] `ProtectionIconV1.tsx` a `V6.tsx`
- [ ] `PlanComparisonV1.tsx` a `V6.tsx`
- [ ] `RecommendedBadgeV1.tsx` a `V6.tsx`
- [ ] `CoverageDisplayV1.tsx` a `V6.tsx`
- [ ] `SkipModalV1.tsx` a `V6.tsx`
- [ ] `ModalButtonsV1.tsx` a `V6.tsx`
- [ ] `CoverageDetailModal.tsx`

### Compartido
- [ ] Mock data de accesorios y seguros
- [ ] `UPSELL_README.md`

---

## 8. Notas Importantes

1. **No agresivo**: "Opcional" siempre visible
2. **Impacto en cuota**: "+S/X/mes" claro
3. **Fácil quitar**: Un click para deseleccionar
4. **Seguros como protección**: Enfoque emocional positivo
5. **Sin emojis**: Solo Lucide icons
6. **Sin gradientes**: Colores sólidos
7. **cursor-pointer**: En todos los elementos clickeables
