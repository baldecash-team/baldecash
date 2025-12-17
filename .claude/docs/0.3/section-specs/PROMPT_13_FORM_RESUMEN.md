# Prompt #13: Formulario - Resumen y Confirmación - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.5 |
| **Preguntas totales** | 20 |
| **Iteraciones T (3 versiones)** | 10 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El paso de resumen es el último antes de enviar la solicitud. El usuario revisa todos sus datos, ve el cronograma de pagos y puede aplicar cupones de descuento.

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/solicitud/
├── steps/
│   └── resumen/
│       ├── SummaryStep.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── SummaryLayoutV1.tsx     # Scroll único
│       │   │   ├── SummaryLayoutV2.tsx     # Secciones colapsables
│       │   │   └── SummaryLayoutV3.tsx     # Tabs
│       │   ├── sections/
│       │   │   ├── ProductSummary.tsx
│       │   │   ├── PersonalDataSummary.tsx
│       │   │   ├── PaymentSchedule.tsx
│       │   │   ├── DeliveryInfo.tsx
│       │   │   └── SectionEditButton.tsx
│       │   ├── schedule/
│       │   │   ├── ScheduleTableV1.tsx     # Tabla
│       │   │   ├── ScheduleTimelineV2.tsx  # Timeline
│       │   │   └── ScheduleListV3.tsx      # Lista
│       │   ├── coupon/
│       │   │   ├── CouponInput.tsx
│       │   │   └── CouponFeedback.tsx
│       │   └── submit/
│       │       ├── SubmitButtonV1.tsx
│       │       ├── SubmitButtonV2.tsx
│       │       └── SubmitButtonV3.tsx
└── SUMMARY_README.md
```

---

## 3. Preguntas del Segmento C.5

### 3.1 Layout del Resumen (3 preguntas)

#### C5.1 [ITERAR - 3 versiones]
**¿El resumen debe ser scroll único o secciones colapsables?**
- **V1**: Scroll único (todo visible)
- **V2**: Acordeón colapsable por sección
- **V3**: Tabs (Personal | Producto | Pagos)

#### C5.2 [ITERAR - 3 versiones]
**¿El producto debe mostrarse con imagen grande o thumbnail?**
- **V1**: Imagen grande (50% del ancho)
- **V2**: Thumbnail pequeño + specs
- **V3**: Card compacta con hover para detalle

#### C5.3 [ITERAR - 3 versiones]
**¿Los datos del usuario deben mostrarse completos o resumidos?**
- **V1**: Completos (todos los campos)
- **V2**: Resumidos (solo esenciales)
- **V3**: Colapsables (resumen + "Ver más")

---

### 3.2 Edición desde Resumen (2 preguntas)

#### C5.4 [ITERAR - 3 versiones]
**¿Cada sección debe tener botón de 'Editar'?**
- **V1**: Botón "Editar" visible siempre
- **V2**: Icono de lápiz al hover
- **V3**: Link "Modificar" debajo de cada sección

#### C5.5 [DEFINIDO]
**¿Al editar, debe volver al resumen automáticamente?**
→ Sí, después de guardar cambios

---

### 3.3 Cronograma (3 preguntas)

#### C5.6 [ITERAR - 3 versiones]
**¿El cronograma debe mostrarse como tabla, timeline, o lista?**
- **V1**: Tabla con columnas (Cuota | Fecha | Monto)
- **V2**: Timeline visual vertical
- **V3**: Lista simple con fechas

#### C5.7 [ITERAR - 3 versiones]
**¿Debe destacarse el primer y último pago?**
- **V1**: Badge "Primera cuota" y "Última cuota"
- **V2**: Color diferente
- **V3**: Icono especial

#### C5.8 [ITERAR - 3 versiones]
**¿Debe poder exportarse/descargarse el cronograma?**
- **V1**: Botón "Descargar PDF"
- **V2**: Botón "Enviar a mi correo"
- **V3**: Ambos

---

### 3.4 Cupón (3 preguntas)

#### C5.9 [DEFINIDO]
**¿El campo de cupón debe estar visible o colapsado?**
→ Colapsado por defecto con "¿Tienes un cupón?"

#### C5.10 [DEFINIDO]
**¿Qué feedback dar cuando el cupón es válido?**
→ Checkmark verde + "Cupón aplicado: -S/50" + nuevo total

#### C5.11 [DEFINIDO]
**¿Qué feedback dar cuando el cupón es inválido?**
→ X roja + "Este cupón no es válido o ya expiró"

---

### 3.5 Envío (2 preguntas)

#### C5.12 [DEFINIDO]
**¿Debe mostrarse mapa con la ubicación de entrega?**
→ Mapa pequeño de confirmación

#### C5.13 [ITERAR - 3 versiones]
**¿Debe indicarse fecha estimada de entrega?**
- **V1**: Rango de fechas "Entre 15 y 20 de enero"
- **V2**: Días hábiles "5-7 días hábiles"
- **V3**: Ambos

---

### 3.6 Botón Final (2 preguntas)

#### C5.14 [ITERAR - 3 versiones]
**¿El texto del botón final debe ser?**
- **V1**: "Enviar solicitud"
- **V2**: "Confirmar y solicitar"
- **V3**: "Solicitar mi laptop"

#### C5.15 [DEFINIDO]
**¿Debe haber confirmación adicional antes de enviar?**
→ No, el resumen ya es la confirmación

---

### 3.7 Resumen Producto (5 preguntas)

#### C5.16 [DEFINIDO]
**¿El resumen debe mostrar key_features?**
→ Sí, top 3 features

#### C5.17 [DEFINIDO]
**¿Mostrar specs principales en el resumen?**
→ Sí: CPU, RAM, SSD, Pantalla

#### C5.18 [DEFINIDO]
**¿Mostrar nombre completo o abreviado?**
→ Nombre completo

#### C5.19 [DEFINIDO]
**¿Indicar si incluye Windows o FreeDOS?**
→ Sí, prominente

#### C5.20 [ITERAR - 3 versiones]
**¿Mostrar garantía incluida?**
- **V1**: Badge "12 meses de garantía"
- **V2**: Texto en specs
- **V3**: Tooltip con detalles

---

## 4. Tipos TypeScript

```typescript
// types/summary.ts

export interface SummaryConfig {
  layoutVersion: 1 | 2 | 3;
  productImageSize: 'large' | 'thumbnail' | 'compact';
  dataDisplayVersion: 1 | 2 | 3;
  editButtonVersion: 1 | 2 | 3;
  scheduleVersion: 1 | 2 | 3;
  deliveryDateVersion: 1 | 2 | 3;
  submitButtonVersion: 1 | 2 | 3;
  warrantyDisplayVersion: 1 | 2 | 3;
}

export interface SummarySection {
  id: string;
  title: string;
  icon: string;
  data: Record<string, any>;
  isEditable: boolean;
  editPath: string;
}

export interface CouponState {
  code: string;
  isValid: boolean | null;
  discount: number;
  message: string;
  isLoading: boolean;
}

export interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  minDate: string;
  maxDate: string;
}
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Button, Divider } from '@nextui-org/react';
import { Edit2, Package, User, CreditCard, MapPin } from 'lucide-react';

/**
 * SummaryLayoutV1 - Scroll Único
 */

export const SummaryLayoutV1: React.FC<{ data: SummaryData }> = ({ data }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8">
        Revisa tu solicitud
      </h2>

      {/* Producto */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#4247d2]" />
            <h3 className="font-semibold">Producto seleccionado</h3>
          </div>
          <Button size="sm" variant="light" startContent={<Edit2 className="w-4 h-4" />}>
            Cambiar
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-row gap-6">
          <img src={data.product.thumbnail} className="w-32 h-32 object-cover rounded" />
          <div>
            <h4 className="font-bold">{data.product.name}</h4>
            <p className="text-sm text-neutral-600">{data.product.specs}</p>
            <p className="text-2xl font-bold text-[#4247d2] mt-2">
              S/{data.product.monthlyQuota}/mes
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Datos Personales */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#4247d2]" />
            <h3 className="font-semibold">Tus datos</h3>
          </div>
          <Button size="sm" variant="light" startContent={<Edit2 className="w-4 h-4" />}>
            Editar
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-neutral-500">Nombre</dt>
              <dd className="font-medium">{data.personal.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">DNI</dt>
              <dd className="font-medium">{data.personal.dni}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Celular</dt>
              <dd className="font-medium">{data.personal.phone}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Email</dt>
              <dd className="font-medium">{data.personal.email}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {/* Cronograma */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#4247d2]" />
          <h3 className="font-semibold">Cronograma de pagos</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          {/* Tabla de pagos */}
        </CardBody>
      </Card>

      {/* Entrega */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#4247d2]" />
            <h3 className="font-semibold">Entrega</h3>
          </div>
          <Button size="sm" variant="light" startContent={<Edit2 className="w-4 h-4" />}>
            Editar
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>{data.delivery.address}</p>
          <p className="text-sm text-neutral-500 mt-2">
            Entrega estimada: 5-7 días hábiles
          </p>
        </CardBody>
      </Card>

      {/* Botón enviar */}
      <Button
        size="lg"
        color="primary"
        className="w-full bg-[#4247d2] font-bold text-lg py-6"
      >
        Enviar solicitud
      </Button>
    </div>
  );
};
```

---

## 6. Checklist de Entregables

- [ ] `SummaryStep.tsx`
- [ ] `SummaryLayoutV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `ProductSummary.tsx`
- [ ] `PersonalDataSummary.tsx`
- [ ] `PaymentSchedule.tsx` (3 versiones)
- [ ] `DeliveryInfo.tsx`
- [ ] `SectionEditButton.tsx`
- [ ] `CouponInput.tsx` con validación
- [ ] `CouponFeedback.tsx`
- [ ] `SubmitButtonV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `SUMMARY_README.md`

---

## 7. Notas

1. **Edición fácil**: Cada sección con botón editar
2. **Cronograma claro**: Primer y último pago destacados
3. **Cupón colapsado**: No distrae si no tiene código
4. **Sin confirmación extra**: El resumen es la confirmación
5. **Sin emojis**: Solo Lucide icons
