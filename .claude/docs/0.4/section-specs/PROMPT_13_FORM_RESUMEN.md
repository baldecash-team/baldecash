# Prompt #13: Formulario - Resumen y Confirmación - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.5 |
| **Preguntas totales** | 20 |
| **Iteraciones T (10 versiones)** | 10 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El paso de resumen es el último antes de enviar la solicitud. El usuario revisa todos sus datos, ve el cronograma de pagos y puede aplicar cupones de descuento.

---

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/solicitud/
├── steps/
│   └── resumen/
│       ├── SummaryStep.tsx
│       ├── SummarySettingsModal.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   └── SummaryLayoutV[1-10].tsx
│       │   ├── product/
│       │   │   └── ProductDisplayV[1-10].tsx
│       │   ├── data/
│       │   │   └── DataDisplayV[1-10].tsx
│       │   ├── edit/
│       │   │   └── EditButtonV[1-10].tsx
│       │   ├── schedule/
│       │   │   ├── PaymentScheduleV[1-10].tsx
│       │   │   └── HighlightV[1-10].tsx
│       │   ├── export/
│       │   │   └── ScheduleExportV[1-10].tsx
│       │   ├── delivery/
│       │   │   └── DeliveryDateV[1-10].tsx
│       │   ├── submit/
│       │   │   └── SubmitButtonV[1-10].tsx
│       │   ├── warranty/
│       │   │   └── WarrantyDisplayV[1-10].tsx
│       │   ├── coupon/
│       │   │   ├── CouponInput.tsx
│       │   │   └── CouponFeedback.tsx
│       │   └── sections/
│       │       ├── PersonalDataSummary.tsx
│       │       └── DeliveryInfo.tsx
└── SUMMARY_README.md
```

---

## 3. Preguntas del Segmento C.5

### 3.1 Layout del Resumen (3 preguntas)

#### C5.1 [ITERAR - 10 versiones]
**¿El resumen debe ser scroll único o secciones colapsables?**
- **V1**: Scroll único con cards secuenciales estilo e-commerce (todo visible)
- **V2**: Acordeón colapsable por sección con transiciones elegantes (lifestyle)
- **V3**: Tabs con ilustraciones flat (Personal | Producto | Pagos)
- **V4**: Cards con animación de reveal al scroll, estilo fintech
- **V5**: Split layout: resumen compacto izquierda + detalle derecha
- **V6**: Hero card por sección con máximo impacto visual
- **V7**: Layout asimétrico bold con secciones de tamaño variable
- **V8**: Dashboard con métricas y estadísticas del resumen (data-driven)
- **V9**: Storytelling: "Tu viaje hacia tu laptop" con progreso narrativo
- **V10**: Interactivo: secciones que se expanden al hover/click con preview

#### C5.2 [ITERAR - 10 versiones]
**¿El producto debe mostrarse con imagen grande o thumbnail?**
- **V1**: Imagen grande 50% del ancho, specs como lista (e-commerce)
- **V2**: Imagen lifestyle con producto en contexto de uso (aspiracional)
- **V3**: Ilustración flat del producto con specs estilizadas
- **V4**: Thumbnail flotante con specs animadas al hover (fintech)
- **V5**: Split: imagen izquierda 40% + specs detalladas derecha 60%
- **V6**: Imagen hero gigante con specs overlay (máximo impacto)
- **V7**: Card con imagen asimétrica y specs con tamaños bold
- **V8**: Mini imagen + specs prominentes con comparación vs promedio
- **V9**: Imagen con "Historia del producto" - por qué es ideal para ti
- **V10**: Galería interactiva con zoom y specs on-demand

#### C5.3 [ITERAR - 10 versiones]
**¿Los datos del usuario deben mostrarse completos o resumidos?**
- **V1**: Grid completo con todos los campos visibles (e-commerce)
- **V2**: Resumen elegante de campos esenciales con estilo minimalista
- **V3**: Cards con iconos flat por categoría de datos
- **V4**: Lista animada que revela campos uno por uno (fintech)
- **V5**: Split: datos críticos prominentes + secundarios en panel
- **V6**: Datos clave gigantes centrados con detalles en texto pequeño
- **V7**: Layout asimétrico: datos importantes con tamaño bold
- **V8**: Dashboard de datos con indicadores de completitud
- **V9**: Datos como perfil de usuario "Así te conocemos"
- **V10**: Expandible: resumen inicial + "Ver todos mis datos" interactivo

---

### 3.2 Edición desde Resumen (2 preguntas)

#### C5.4 [ITERAR - 10 versiones]
**¿Cada sección debe tener botón de 'Editar'?**
- **V1**: Botón "Editar" visible siempre a la derecha de cada sección
- **V2**: Icono de lápiz elegante que aparece solo al hover
- **V3**: Link "Modificar" con icono flat debajo de cada sección
- **V4**: Botón flotante animado que pulsa sutilmente (fintech)
- **V5**: Split: botón editar fijo en columna lateral derecha
- **V6**: Botón "Editar" grande centrado debajo de cada sección
- **V7**: Botones de tamaño variable según frecuencia de edición (bold)
- **V8**: Botón con indicador "Editado X veces" o "Sin cambios"
- **V9**: Link conversacional "¿Algo no está bien? Corrige aquí"
- **V10**: Hover sobre cualquier dato permite edición inline

#### C5.5 [DEFINIDO]
**¿Al editar, debe volver al resumen automáticamente?**
→ Sí, después de guardar cambios

---

### 3.3 Cronograma (3 preguntas)

#### C5.6 [ITERAR - 10 versiones]
**¿El cronograma debe mostrarse como tabla, timeline, o lista?**
- **V1**: Tabla clásica con columnas (Cuota | Fecha | Monto | Estado)
- **V2**: Timeline vertical elegante con puntos conectados (lifestyle)
- **V3**: Lista con iconos flat de calendario por cada cuota
- **V4**: Timeline horizontal animado con scroll suave (fintech)
- **V5**: Split: timeline visual izquierda + detalles en tabla derecha
- **V6**: Cards gigantes por cada cuota con fechas prominentes
- **V7**: Timeline con tamaños variables según importancia del pago
- **V8**: Gráfico de barras con montos y fechas (data visualization)
- **V9**: Calendario narrativo "En enero pagarás..." mes a mes
- **V10**: Timeline interactivo con slider para simular escenarios

#### C5.7 [ITERAR - 10 versiones]
**¿Debe destacarse el primer y último pago?**
- **V1**: Badge "Primera cuota" verde y "Última cuota" dorado
- **V2**: Color diferente: primero en verde success, último en primario
- **V3**: Iconos flat: cohete para inicio, bandera para fin
- **V4**: Animación de pulso en primera cuota, glow en última (fintech)
- **V5**: Split: primera y última en panel destacado lateral
- **V6**: Cards prominentes solo para primera y última cuota
- **V7**: Tamaño extra bold para primera y última fila/item
- **V8**: Métricas: "Primera: 15 Ene" + "Última: 15 Dic" + countdown
- **V9**: Mensajes: "Tu primer paso: Cuota 1" ... "La meta: Cuota 12"
- **V10**: Interactivo: click para ver detalle de cuota especial

#### C5.8 [ITERAR - 10 versiones]
**¿Debe poder exportarse/descargarse el cronograma?**
- **V1**: Botón "Descargar PDF" simple con icono de documento
- **V2**: Botón elegante "Enviar a mi correo" (lifestyle, menos fricción)
- **V3**: Ambas opciones con iconos flat lado a lado
- **V4**: Floating action button animado con opciones de export (fintech)
- **V5**: Split: preview del PDF izquierda + botones derecha
- **V6**: CTA grande centrado "Guarda tu cronograma"
- **V7**: Opciones con tamaño según popularidad (PDF grande, email pequeño)
- **V8**: Export con opciones: PDF, Excel, Google Calendar, iCal
- **V9**: "Llévate tu plan de pagos" con opciones narrativas
- **V10**: Modal interactivo para personalizar qué exportar

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

#### C5.13 [ITERAR - 10 versiones]
**¿Debe indicarse fecha estimada de entrega?**
- **V1**: Rango de fechas específicas "Entre 15 y 20 de enero"
- **V2**: Días hábiles con estilo elegante "5-7 días hábiles"
- **V3**: Ambos con ilustración flat de calendario
- **V4**: Countdown animado hasta fecha más temprana posible (fintech)
- **V5**: Split: calendario visual izquierda + rango en texto derecha
- **V6**: Fecha estimada gigante prominente centrada
- **V7**: Rango con énfasis bold en fecha más probable
- **V8**: Predicción con % de confianza "90% antes del 18 de enero"
- **V9**: Narrativo "Tu laptop llegará a casa entre el 15 y 20"
- **V10**: Selector interactivo de preferencia de fecha de entrega

---

### 3.6 Botón Final (2 preguntas)

#### C5.14 [ITERAR - 10 versiones]
**¿El texto del botón final debe ser?**
- **V1**: "Enviar solicitud" - clásico y claro (e-commerce)
- **V2**: "Confirmar y solicitar" - elegante y completo (lifestyle)
- **V3**: "Solicitar mi laptop" - personal y con ilustración
- **V4**: "Enviar" con animación de cohete al hover (fintech)
- **V5**: "Confirmar datos y enviar" - explícito y split
- **V6**: "¡Solicitar ahora!" - llamativo y con impacto
- **V7**: "Enviar solicitud" con tamaño y peso bold prominente
- **V8**: "Enviar solicitud" + indicador "Paso final" (data)
- **V9**: "¡Estoy listo/a! Enviar mi solicitud" - storytelling
- **V10**: Botón que cambia de "Revisar" a "Enviar" según scroll

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

#### C5.20 [ITERAR - 10 versiones]
**¿Mostrar garantía incluida?**
- **V1**: Badge pequeño "12 meses de garantía" junto al producto
- **V2**: Texto elegante en specs con icono de escudo
- **V3**: Ilustración flat de escudo con número de meses
- **V4**: Badge animado con hover para detalles (fintech)
- **V5**: Split: garantía en panel lateral con términos
- **V6**: Badge grande prominente centrado debajo del producto
- **V7**: Garantía con tamaño bold variable según duración
- **V8**: "12 meses garantía" + comparación "Promedio: 6 meses"
- **V9**: "Protegido por 12 meses" con mensaje de confianza
- **V10**: Tooltip interactivo con detalles de cobertura de garantía

---

## 4. Tipos TypeScript

```typescript
// types/summary.ts

export interface SummaryConfig {
  // C5.1 - Layout del resumen
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.2 - Visualización del producto
  productDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.3 - Visualización de datos
  dataDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.4 - Botón de editar
  editButtonVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.6 - Cronograma de pagos
  scheduleVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.7 - Destacado de primer/último pago
  highlightVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.8 - Exportación del cronograma
  exportVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.13 - Fecha de entrega
  deliveryDateVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.14 - Botón de envío
  submitButtonVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C5.20 - Visualización de garantía
  warrantyDisplayVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultSummaryConfig: SummaryConfig = {
  layoutVersion: 1,
  productDisplayVersion: 1,
  dataDisplayVersion: 1,
  editButtonVersion: 1,
  scheduleVersion: 1,
  highlightVersion: 1,
  exportVersion: 1,
  deliveryDateVersion: 1,
  submitButtonVersion: 1,
  warrantyDisplayVersion: 1,
};

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
 * SummaryLayoutV1 - Scroll Único (E-commerce)
 * Todo el resumen visible en scroll continuo con cards secuenciales
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
            <Package className="w-5 h-5 text-[#4654CD]" />
            <h3 className="font-semibold">Producto seleccionado</h3>
          </div>
          <Button size="sm" variant="light" startContent={<Edit2 className="w-4 h-4" />} className="cursor-pointer">
            Cambiar
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-row gap-6">
          <img src={data.product.thumbnail} className="w-32 h-32 object-cover rounded" />
          <div>
            <h4 className="font-bold">{data.product.name}</h4>
            <p className="text-sm text-neutral-600">{data.product.specs}</p>
            <p className="text-2xl font-bold text-[#4654CD] mt-2">
              S/{data.product.monthlyQuota}/mes
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Datos Personales */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#4654CD]" />
            <h3 className="font-semibold">Tus datos</h3>
          </div>
          <Button size="sm" variant="light" startContent={<Edit2 className="w-4 h-4" />} className="cursor-pointer">
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
          <CreditCard className="w-5 h-5 text-[#4654CD]" />
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
            <MapPin className="w-5 h-5 text-[#4654CD]" />
            <h3 className="font-semibold">Entrega</h3>
          </div>
          <Button size="sm" variant="light" startContent={<Edit2 className="w-4 h-4" />} className="cursor-pointer">
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
        className="w-full bg-[#4654CD] font-bold text-lg py-6 cursor-pointer"
      >
        Enviar solicitud
      </Button>
    </div>
  );
};
```

---

## 6. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/summary.ts` - SummaryConfig con 10 selectores (1-10)
- [ ] `SummarySettingsModal.tsx` - Modal con 10 selectores

### Paso Principal
- [ ] `SummaryStep.tsx`

### Layout (10 versiones)
- [ ] `SummaryLayoutV1.tsx` a `V10.tsx`

### Producto (10 versiones)
- [ ] `ProductDisplayV1.tsx` a `V10.tsx`

### Datos (10 versiones)
- [ ] `DataDisplayV1.tsx` a `V10.tsx`

### Edición (10 versiones)
- [ ] `EditButtonV1.tsx` a `V10.tsx`

### Cronograma (10 versiones x 3)
- [ ] `PaymentScheduleV1.tsx` a `V10.tsx`
- [ ] `HighlightV1.tsx` a `V10.tsx`
- [ ] `ScheduleExportV1.tsx` a `V10.tsx`

### Entrega (10 versiones)
- [ ] `DeliveryDateV1.tsx` a `V10.tsx`

### Envío (10 versiones)
- [ ] `SubmitButtonV1.tsx` a `V10.tsx`

### Garantía (10 versiones)
- [ ] `WarrantyDisplayV1.tsx` a `V10.tsx`

### Cupón
- [ ] `CouponInput.tsx` con validación
- [ ] `CouponFeedback.tsx`

### Documentación
- [ ] `SUMMARY_README.md`

---

## 7. Notas Importantes

1. **Edición fácil**: Cada sección con botón editar
2. **Cronograma claro**: Primer y último pago destacados
3. **Cupón colapsado**: No distrae si no tiene código
4. **Sin confirmación extra**: El resumen es la confirmación
5. **Sin emojis**: Solo Lucide icons
6. **Sin gradientes**: Colores sólidos
7. **cursor-pointer**: En todos los elementos clickeables
