# Changelog - Wizard Solicitud v0.5

> Registro de cambios y mejoras del módulo wizard-solicitud

---

## 2026-01-12 - Mejoras UX y Nuevas Funcionalidades

### 1. Ilustraciones de Baldi

**Archivo:** `components/wizard-solicitud/wizard/MotivationalCard.tsx`

Se reemplazaron las ilustraciones externas de popsy.co por imágenes locales de Baldi:

| Paso | Imagen | Ruta |
|------|--------|------|
| datos-personales | BALDI_IDEA | `/images/baldi/BALDI_IDEA.png` |
| datos-academicos | BALDI_COMPU | `/images/baldi/BALDI_COMPU.png` |
| datos-economicos | BALDI_EJECUTIVO | `/images/baldi/BALDI_EJECUTIVO.png` |
| resumen | BALDI_ALEGRE | `/images/baldi/BALDI_ALEGRE.png` |

---

### 2. WizardProgress Responsivo

**Archivo:** `components/wizard-solicitud/wizard/WizardProgress.tsx`

Se implementó diseño diferenciado para mobile y desktop:

#### Mobile (`lg:hidden`)
```
┌────────────────────────────────────┐
│ [Baldi 56px] Paso 1 de 4           │
│              Datos Personales      │
│              ●───●───○───○         │
└────────────────────────────────────┘
```

- Card compacta con imagen de Baldi
- Texto "Paso X de 4" + título del paso
- Barra de progreso con puntos pequeños

#### Desktop (`hidden lg:flex`)
- Mantiene diseño original con círculos grandes + títulos
- Líneas conectoras entre pasos

---

### 3. Cupón de Descuento

#### 3.1 Componente CouponInput

**Archivo:** `components/wizard-solicitud/coupon/CouponInput.tsx`

Componente con input, validación y animaciones:

| Estado | Descripción |
|--------|-------------|
| `idle` | Input vacío o con texto |
| `validating` | Spinner mientras valida |
| `success` | Confetti + badge verde |
| `error` | Shake + mensaje rojo |

**Cupones válidos (mock):**

| Código | Descuento | Label |
|--------|-----------|-------|
| `PROMO` | S/10/mes | Descuento promocional |
| `BALDI10` | S/10/mes | Descuento Baldi |
| `ESTUDIANTE` | S/15/mes | Descuento estudiante |

**Animaciones:**
- Success: Confetti con sparkles (`framer-motion`)
- Error: Shake del input
- Validating: Spinner en botón

#### 3.2 ProductContext Actualizado

**Archivo:** `context/ProductContext.tsx`

Nuevas propiedades agregadas:

```typescript
interface AppliedCoupon {
  code: string;
  discount: number;
  label: string;
}

// Nuevas funciones en el contexto
appliedCoupon: AppliedCoupon | null;
setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
clearCoupon: () => void;
getDiscountedMonthlyPayment: () => number;
```

**Persistencia:** El cupón se guarda en `localStorage` con key `baldecash-wizard-applied-coupon`.

#### 3.3 SelectedProductBar con Descuento

**Archivo:** `components/wizard-solicitud/product/SelectedProductBar.tsx`

Cuando hay cupón aplicado:
- Precio original tachado
- Precio con descuento en verde
- Badge con código y monto del descuento

---

### 4. Selectores de Preferencias

**Archivo:** `wizard-preview/page.tsx`

Se agregaron dos selectores con `SelectInput` (6+ opciones):

#### 4.1 ¿Cuándo te gustaría pagar tu préstamo?

```typescript
const PAYMENT_TERM_OPTIONS = [
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
  { value: '18', label: '18 meses' },
  { value: '24', label: '24 meses' },
  { value: '36', label: '36 meses (Recomendado)' },
  { value: '48', label: '48 meses' },
];
```

- Valor por defecto: `36`

#### 4.2 ¿Cómo te enteraste de nosotros?

```typescript
const REFERRAL_SOURCE_OPTIONS = [
  { value: 'redes', label: 'Redes sociales (Instagram, TikTok, Facebook)' },
  { value: 'google', label: 'Buscador (Google)' },
  { value: 'amigo', label: 'Amigo o familiar' },
  { value: 'universidad', label: 'Mi universidad o instituto' },
  { value: 'publicidad', label: 'Publicidad online' },
  { value: 'email', label: 'Correo electrónico' },
  { value: 'evento', label: 'Evento o feria' },
  { value: 'otro', label: 'Otro' },
];
```

- Sin valor por defecto

**Ubicación:** Sección "Preferencias de pago" después de "Lo que necesitarás", antes de "Accesorios".

---

## Estructura de Archivos Modificados

```
wizard-solicitud/
├── components/wizard-solicitud/
│   ├── coupon/
│   │   ├── CouponInput.tsx    # NUEVO
│   │   └── index.ts           # NUEVO
│   ├── product/
│   │   └── SelectedProductBar.tsx  # MODIFICADO (descuentos)
│   └── wizard/
│       ├── MotivationalCard.tsx    # MODIFICADO (imágenes Baldi)
│       ├── WizardProgress.tsx      # MODIFICADO (versión mobile)
│       └── index.ts                # MODIFICADO (export MotivationalCard)
├── context/
│   └── ProductContext.tsx     # MODIFICADO (cupones)
└── wizard-preview/
    └── page.tsx               # MODIFICADO (selectores + cupón)
```

---

## Imágenes de Baldi Disponibles

```
/public/images/baldi/
├── BALDI_ALEGRE.png      # Celebrando (resumen)
├── BALDI_COMPU.png       # Con computadora (datos-academicos)
├── BALDI_EJECUTIVO.png   # Profesional (datos-economicos)
├── BALDI_IDEA.png        # Pensando (datos-personales)
├── BALDI_SELFIE.png      # Disponible
├── BALDI_SORPRESA.png    # Disponible
├── BALDI_UNIFORME.png    # Disponible
├── 1682028855786_2.png   # Disponible
└── 4.png                 # Disponible
```

---

## Próximas Iteraciones Sugeridas

1. **Persistir preferencias:** Guardar `paymentTerm` y `referralSource` en `ProductContext`
2. **Actualizar cuota:** Cuando cambie `paymentTerm`, actualizar la cuota mostrada en `SelectedProductBar`
3. **Analytics:** Enviar `referralSource` a sistema de analytics
4. **Más cupones:** Integrar con API real de validación de cupones
5. **Baldi animado:** Agregar animaciones sutiles a las ilustraciones de Baldi

---

## Convenciones Aplicadas

| Regla | Aplicación |
|-------|------------|
| 6+ opciones → SelectInput | Ambos selectores usan `SelectInput` con buscador |
| Imágenes locales | Reemplazadas URLs externas por `/images/baldi/` |
| Mobile-first | WizardProgress tiene diseño específico para mobile |
| Persistencia localStorage | Cupón se guarda y restaura automáticamente |
| Animaciones Framer Motion | CouponInput usa animaciones para feedback |
