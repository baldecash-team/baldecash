# Prompt #12: Formulario - Datos Económicos - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.4 |
| **Preguntas totales** | 15 |
| **Iteraciones T (10 versiones)** | 4 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El paso de datos económicos captura información sobre la fuente de ingresos del estudiante. Los campos son condicionales según el tipo de ingreso seleccionado.

---

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/solicitud/
├── steps/
│   └── economico/
│       ├── EconomicDataStep.tsx
│       ├── components/
│       │   ├── income/
│       │   │   └── IncomeSourceSelectorV[1-10].tsx
│       │   ├── description/
│       │   │   └── OptionDescriptionV[1-10].tsx
│       │   ├── family/
│       │   │   └── FamilySectionV[1-10].tsx
│       │   ├── verification/
│       │   │   └── VerificationCheckboxV[1-10].tsx
│       │   ├── EmploymentFields.tsx
│       │   ├── BusinessFields.tsx
│       │   ├── FamilyFields.tsx
│       │   └── IncomeAmountInput.tsx
└── ECONOMIC_README.md
```

---

## 3. Preguntas del Segmento C.4

### 3.1 Selección de Fuente (3 preguntas)

#### C4.1 [ITERAR - 10 versiones]
**¿Las opciones de fuente de ingreso deben ser cards grandes con iconos?**
- **V1**: Cards grandes con icono prominente + descripción (e-commerce)
- **V2**: Botones elegantes con iconos minimalistas (lifestyle)
- **V3**: Cards con ilustraciones flat de cada situación laboral
- **V4**: Pills flotantes con iconos y animación de selección (fintech)
- **V5**: Split grid: 2 opciones por fila en desktop, stack en mobile
- **V6**: Cards gigantes una sobre otra con máximo impacto (hero)
- **V7**: Cards con tamaños variables según frecuencia de selección (bold)
- **V8**: Opciones con estadística "65% eligen esta opción" (data)
- **V9**: Cards con mini-historias "Como Juan, que trabaja y estudia..." (story)
- **V10**: Selector interactivo con preview de campos siguientes

#### C4.2 [ITERAR - 10 versiones]
**¿Debe explicarse brevemente cada opción?**
- **V1**: Descripción siempre visible debajo del label (e-commerce)
- **V2**: Descripción en hover con tooltip elegante (lifestyle)
- **V3**: Sin descripción, solo iconos flat autoexplicativos
- **V4**: Descripción que aparece con animación al hover (fintech)
- **V5**: Split: label izquierda + descripción derecha en fila
- **V6**: Descripción grande prominente debajo de cada card (impacto)
- **V7**: Descripción con tamaño variable según necesidad (bold)
- **V8**: Descripción + dato "Tiempo promedio: 2 min" (data)
- **V9**: Descripción como pregunta "¿Trabajas para una empresa?" (story)
- **V10**: Descripción interactiva "¿No sabes cuál elegir? Te ayudamos"

#### C4.3 [DEFINIDO]
**¿Qué icono usar para cada fuente?**
→ Trabajo: Briefcase, Negocio: Store, Familiar: Users, Otros: Wallet

---

### 3.2 Campos Condicionales (2 preguntas)

#### C4.4 [DEFINIDO]
**¿Los campos adicionales deben aparecer con animación?**
→ Sí, slide down + fade in

#### C4.5 [DEFINIDO]
**¿Debe indicarse por qué se piden estos campos?**
→ Texto sutil: "Esta información nos ayuda a evaluar tu solicitud"

---

### 3.3 Datos de Empleo (3 preguntas)

#### C4.6 [DEFINIDO]
**¿El campo de empleador debe tener autocompletado?**
→ No para MVP (texto libre)

#### C4.7 [DEFINIDO]
**¿El sueldo debe pedirse como monto exacto o rango?**
→ Monto aproximado con ayuda: "No te preocupes, puede ser aproximado"

#### C4.8 [DEFINIDO]
**¿Debe explicarse sueldo bruto vs neto?**
→ Tooltip: "El monto que recibes en tu cuenta después de descuentos"

---

### 3.4 Datos de Negocio (2 preguntas)

#### C4.9 [DEFINIDO]
**¿La pregunta '¿Tienes RUC?' debe explicar por qué?**
→ Sí: "Si tienes RUC, podemos verificar tu actividad más rápido"

#### C4.10 [DEFINIDO]
**¿El campo de rubro debe ser texto libre o categorías?**
→ Categorías predefinidas: Comercio, Servicios, Producción, Otros

---

### 3.5 Datos de Familiar (3 preguntas)

#### C4.11 [ITERAR - 10 versiones]
**¿La sección de datos del familiar debe tener diseño diferenciado?**
- **V1**: Card con borde gris diferente al resto (e-commerce)
- **V2**: Sección con fondo suave y título elegante (lifestyle)
- **V3**: Card con ilustración flat de familia
- **V4**: Sección con borde animado al aparecer (fintech)
- **V5**: Split: datos del familiar en panel separado
- **V6**: Sección grande destacada con título prominente (impacto)
- **V7**: Sección con borde de color variable según parentesco (bold)
- **V8**: Sección con indicador "Última sección - 3 campos" (data)
- **V9**: Sección con mensaje "Háblanos de quien te apoya" (story)
- **V10**: Sección interactiva con preview de por qué necesitamos esto

#### C4.12 [DEFINIDO]
**¿Debe explicarse POR QUÉ se necesitan datos del familiar?**
→ Sí: "Esta persona será contactada solo si no podemos comunicarnos contigo"

#### C4.13 [DEFINIDO]
**¿El familiar debe dar consentimiento?**
→ No para MVP (solo referencia)

---

### 3.6 Verificación (2 preguntas)

#### C4.14 [ITERAR - 10 versiones]
**¿El checkbox de verificación laboral debe estar al inicio o al final?**
- **V1**: Al final de la sección de empleo (e-commerce)
- **V2**: Integrado elegantemente con el último campo (lifestyle)
- **V3**: En card separada con ilustración flat de verificación
- **V4**: Flotante sticky al final del formulario (fintech)
- **V5**: Split: checkbox izquierda + explicación derecha
- **V6**: Checkbox grande centrado como confirmación final (impacto)
- **V7**: Checkbox con tamaño adaptativo según importancia (bold)
- **V8**: Checkbox con "El 95% acepta esta verificación" (data)
- **V9**: Checkbox como compromiso "Me comprometo a..." (story)
- **V10**: Checkbox interactivo con modal explicativo al hacer clic

#### C4.15 [DEFINIDO]
**¿Debe explicarse en qué consiste la verificación?**
→ Sí: "Podemos llamar a tu empleador para confirmar tus datos"

---

## 4. Tipos TypeScript

```typescript
// types/economic.ts

export interface EconomicDataConfig {
  // C4.1 - Selector de fuente
  incomeSelectorVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C4.2 - Descripción de opciones
  optionDescriptionVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C4.11 - Sección familiar
  familySectionVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C4.14 - Checkbox verificación
  verificationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultEconomicDataConfig: EconomicDataConfig = {
  incomeSelectorVersion: 1,
  optionDescriptionVersion: 1,
  familySectionVersion: 1,
  verificationVersion: 1,
};

export type IncomeSource = 'empleo' | 'negocio' | 'familiar' | 'otro';
```

---

## 5. Campos por Fuente de Ingreso

```typescript
export const incomeSourceOptions = [
  {
    value: 'empleo',
    label: 'Trabajo dependiente',
    description: 'Tienes un empleador que te paga un sueldo',
    icon: 'Briefcase',
  },
  {
    value: 'negocio',
    label: 'Negocio propio',
    description: 'Tienes un emprendimiento o trabajas de forma independiente',
    icon: 'Store',
  },
  {
    value: 'familiar',
    label: 'Apoyo familiar',
    description: 'Un familiar te apoya económicamente',
    icon: 'Users',
  },
  {
    value: 'otro',
    label: 'Otros ingresos',
    description: 'Rentas, pensiones u otros',
    icon: 'Wallet',
  },
];

export const employmentFields: FieldConfig[] = [
  { id: 'nombreEmpresa', label: 'Nombre de la empresa', required: true },
  { id: 'cargo', label: 'Tu cargo o puesto', required: true },
  { id: 'fechaIngreso', label: 'Fecha de ingreso', type: 'date', required: true },
  { id: 'sueldoNeto', label: 'Sueldo mensual (neto)', type: 'number', required: true, helpText: 'El monto que recibes en tu cuenta' },
  { id: 'telefonoEmpresa', label: 'Teléfono de la empresa', type: 'tel' },
];

export const businessFields: FieldConfig[] = [
  { id: 'tieneRuc', label: '¿Tienes RUC?', type: 'checkbox' },
  { id: 'ruc', label: 'Número de RUC', dependsOn: 'tieneRuc' },
  { id: 'rubroNegocio', label: 'Rubro del negocio', type: 'select', options: ['Comercio', 'Servicios', 'Producción', 'Otros'] },
  { id: 'ingresoMensual', label: 'Ingreso mensual aproximado', type: 'number' },
  { id: 'antiguedad', label: 'Tiempo del negocio', type: 'select', options: ['Menos de 6 meses', '6 meses - 1 año', '1 - 2 años', 'Más de 2 años'] },
];

export const familyFields: FieldConfig[] = [
  { id: 'parentesco', label: 'Parentesco', type: 'select', options: ['Padre', 'Madre', 'Hermano/a', 'Tío/a', 'Abuelo/a', 'Otro'] },
  { id: 'nombreFamiliar', label: 'Nombre completo del familiar', required: true },
  { id: 'celularFamiliar', label: 'Celular del familiar', type: 'tel', required: true },
  { id: 'ocupacionFamiliar', label: 'Ocupación del familiar' },
];
```

---

## 6. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Card, CardBody, RadioGroup, Radio } from '@nextui-org/react';
import { Briefcase, Store, Users, Wallet } from 'lucide-react';

const iconMap = {
  Briefcase: Briefcase,
  Store: Store,
  Users: Users,
  Wallet: Wallet,
};

/**
 * IncomeSourceSelectorV1 - Cards Grandes (E-commerce)
 * Cards prominentes con icono grande y descripción visible
 */

export const IncomeSourceSelectorV1: React.FC<{
  value: IncomeSource;
  onChange: (value: IncomeSource) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">¿Cuál es tu principal fuente de ingresos?</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incomeSourceOptions.map((option) => {
          const Icon = iconMap[option.icon];
          const isSelected = value === option.value;

          return (
            <Card
              key={option.value}
              isPressable
              onPress={() => onChange(option.value)}
              className={`transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
                  : 'border border-neutral-200 hover:border-[#4654CD]/50'
              }`}
            >
              <CardBody className="flex flex-row items-start gap-4 p-4">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-[#4654CD] text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm text-neutral-500">{option.description}</p>
                </div>
                <Radio
                  value={option.value}
                  isSelected={isSelected}
                  className="mt-1"
                />
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 7. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/economic.ts` - EconomicDataConfig con 4 selectores (1-10)
- [ ] `EconomicDataSettingsModal.tsx` - Modal con 4 selectores

### Paso Principal
- [ ] `EconomicDataStep.tsx`

### Selector de Fuente (10 versiones)
- [ ] `IncomeSourceSelectorV1.tsx` a `V10.tsx`

### Descripción de Opciones (10 versiones)
- [ ] `OptionDescriptionV1.tsx` a `V10.tsx`

### Campos Condicionales
- [ ] `EmploymentFields.tsx`
- [ ] `BusinessFields.tsx`
- [ ] `FamilyFields.tsx`
- [ ] `IncomeAmountInput.tsx` con formato moneda

### Sección Familiar (10 versiones)
- [ ] `FamilySectionV1.tsx` a `V10.tsx`

### Verificación (10 versiones)
- [ ] `VerificationCheckboxV1.tsx` a `V10.tsx`

### Documentación
- [ ] `ECONOMIC_README.md`

---

## 8. Notas Importantes

1. **Campos condicionales**: Slide down suave al seleccionar fuente
2. **Montos aproximados**: "No te preocupes, puede ser aproximado"
3. **Verificación**: Explicar claramente qué implica
4. **Familiar**: Explicar que es solo contacto de referencia
5. **Sin emojis**: Solo Lucide icons
6. **Sin gradientes**: Colores sólidos
7. **cursor-pointer**: En todos los elementos clickeables
