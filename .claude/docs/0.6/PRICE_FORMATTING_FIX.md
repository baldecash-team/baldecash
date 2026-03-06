# Corrección de Consistencia de Precios v0.6

> **Fecha:** 2026-03-06
> **Estado:** ✅ IMPLEMENTADO (v2 - con regla "a favor del usuario")
> **Autor:** Claude Code

---

## 1. Problema Original

**Reporte del usuario:** La página de confirmación (`/solicitar/confirmacion/?code=APP-2026-00031`) mostraba **S/179/mes** cuando el catálogo mostraba **S/146/mes** para el mismo producto.

**Diferencia:** S/33/mes (22% más alto)

---

## 2. Análisis de Causa Raíz

### 2.1 Problema en Backend (CORREGIDO)

| Causa | Detalle |
|-------|---------|
| `initial_payment: 0` hardcodeado | Backend ignoraba el % de inicial seleccionado |
| No usaba PricingService | Calculaba con valores del frontend sin validar |
| Accesorios sin precio DB | Usaba precios enviados por frontend |

**Solución implementada en `form_service.py`:**
- Importar y usar `PricingService.calculate_installment()`
- Leer `initial_percent` del request y calcular `initial_payment`
- Buscar precios de accesorios en la base de datos
- Calcular prima de seguros desde `InsurancePlanPriceRange`

### 2.2 Problemas en Frontend (PENDIENTES)

Se identificaron **4 inconsistencias** de formateo/redondeo que causan diferencias visuales entre componentes.

---

## 3. Inventario de Archivos de Formateo

### 3.1 Archivos CORRECTOS (19 componentes)

Usan `formatMoneyNoDecimals` con locale `en-US` + `Math.round()`:

```
catalogo/utils/formatMoney.ts          → Define formatMoneyNoDecimals (en-US)
solicitar/utils/formatMoney.ts         → Copia idéntica
producto/utils/formatMoney.ts          → Copia idéntica

catalogo/cards/ProductCard.tsx         → ✅ importa formatMoneyNoDecimals
catalogo/CartDrawer.tsx                → ✅ importa formatMoneyNoDecimals
catalogo/CartBar.tsx                   → ✅ importa formatMoneyNoDecimals
catalogo/CartSelectionModal.tsx        → ✅ importa formatMoneyNoDecimals
catalogo/wishlist/WishlistDrawer.tsx   → ✅ importa formatMoneyNoDecimals
catalogo/comparator/DesignStyleA.tsx   → ✅ usa formatMoney (en-US)
catalogo/comparator/DesignStyleB.tsx   → ✅ usa formatMoney (en-US)
catalogo/comparator/DesignStyleC.tsx   → ✅ usa formatMoney (en-US)
producto/pricing/PricingCalculator.tsx → ✅ importa formatMoneyNoDecimals
producto/similar/SimilarProducts.tsx   → ✅ importa formatMoneyNoDecimals
producto/cronograma/Cronograma.tsx     → ✅ importa formatMoneyNoDecimals
solicitar/upsell/AccessoryCard.tsx     → ✅ importa formatMoneyNoDecimals
solicitar/upsell/PlanComparison.tsx    → ✅ importa formatMoneyNoDecimals
solicitar/complementosClient.tsx       → ✅ importa formatMoneyNoDecimals
```

### 3.2 Archivos con INCONSISTENCIAS (4 archivos)

| # | Archivo | Línea | Problema Actual | Formato Resultante |
|---|---------|-------|-----------------|-------------------|
| 1 | `catalogo/types/catalog.ts` | 83 | `Math.floor()` | S/145 (debería ser 146) |
| 2 | `producto/utils/generateCronogramaPDF.ts` | 46-47 | locale `es-PE` | S/3.204 (punto como separador) |
| 3 | `confirmacion/.../ProductSummary.tsx` | 23 | Función local + `es-PE` | S/ 3.204 (con espacio + punto) |
| 4 | `solicitar/.../SelectedProductBar.tsx` | 37-44 | `Intl.NumberFormat` + `es-PE` | S/ 3,204 (currency style) |

---

## 4. Detalle de Cada Inconsistencia

### 4.1 `catalog.ts:83` - Math.floor vs Math.round

**Archivo:** `src/app/prototipos/0.6/[landing]/catalogo/types/catalog.ts`

**Código actual:**
```typescript
export function calculateQuotaForTerm(price: number, term: TermMonths, tea: number = DEFAULT_TEA): number {
  if (price <= 0) return 0;
  const basePayment = frenchPayment(price, tea, term);
  const commission = calculatePeriodicCommission(price, term);
  return Math.floor(basePayment + commission);  // ❌ FLOOR
}
```

**Impacto:**
- Cálculo local: 145.91 → `Math.floor` → **145**
- Backend usa `round()` → **146**
- **Diferencia: S/1/mes**

**Usado en:** Sugerencias de búsqueda, cálculos de `calculateQuotaWithInitial()`

---

### 4.2 `generateCronogramaPDF.ts:46-47` - Locale incorrecto

**Archivo:** `src/app/prototipos/0.6/[landing]/producto/utils/generateCronogramaPDF.ts`

**Código actual:**
```typescript
const formatMoney = (amount: number): string => {
  return `S/${Math.round(amount).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
```

**Impacto:**
- PDF muestra: `S/3.204` (punto como separador de miles)
- Catálogo muestra: `S/3,204` (coma como separador de miles)

---

### 4.3 `ProductSummary.tsx:23` - Función local duplicada

**Archivo:** `src/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received/summary/ProductSummary.tsx`

**Código actual:**
```typescript
/** Format number as price with 2 decimals */
const formatPrice = (n: number): string => n.toFixed(2);

/** Format number as price rounded (no decimals) */
const formatPriceRounded = (n: number): string => Math.round(n).toLocaleString('es-PE');
```

**Impacto:**
- Confirmación muestra: `S/ 3.204`
- Catálogo muestra: `S/3,204`

---

### 4.4 `SelectedProductBar.tsx:37-44` - Intl.NumberFormat con currency

**Archivo:** `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/SelectedProductBar.tsx`

**Código actual:**
```typescript
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
```

**Impacto:**
- Barra muestra: `S/ 3,204` (con espacio después de S/)
- Catálogo muestra: `S/3,204` (sin espacio)

---

## 5. Decisión de Locale

### Opciones Evaluadas

| Opción | Formato | Ejemplo | Pros | Contras |
|--------|---------|---------|------|---------|
| **A: `en-US`** | Coma miles | `S/3,204` | Ya usado en catálogo, consistente con e-commerce internacional | No es el formato oficial peruano |
| **B: `es-PE`** | Punto miles | `S/3.204` | Formato oficial peruano | Requiere cambiar más archivos |

### Decisión: `en-US`

**Razón:** Menor cantidad de cambios requeridos. El catálogo (componente principal) ya usa este formato y funciona correctamente.

---

## 6. Plan de Implementación

### 6.1 Cambio #1: catalog.ts

**Archivo:** `src/app/prototipos/0.6/[landing]/catalogo/types/catalog.ts`
**Línea:** 83

**Antes:**
```typescript
return Math.floor(basePayment + commission);
```

**Después:**
```typescript
return Math.round(basePayment + commission);
```

---

### 6.2 Cambio #2: generateCronogramaPDF.ts

**Archivo:** `src/app/prototipos/0.6/[landing]/producto/utils/generateCronogramaPDF.ts`
**Líneas:** 46-47

**Antes:**
```typescript
const formatMoney = (amount: number): string => {
  return `S/${Math.round(amount).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
```

**Después:**
```typescript
const formatMoney = (amount: number): string => {
  return `S/${Math.round(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
```

---

### 6.3 Cambio #3: ProductSummary.tsx

**Archivo:** `src/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received/summary/ProductSummary.tsx`

**Antes (líneas 19-23):**
```typescript
/** Format number as price with 2 decimals */
const formatPrice = (n: number): string => n.toFixed(2);

/** Format number as price rounded (no decimals) */
const formatPriceRounded = (n: number): string => Math.round(n).toLocaleString('es-PE');
```

**Después:**
```typescript
/** Format number as price rounded (no decimals), consistent with catalog */
const formatPriceRounded = (n: number): string => Math.round(n).toLocaleString('en-US');
```

**Nota:** Se elimina `formatPrice` si no se usa, o se mantiene si es necesario para otros campos.

---

### 6.4 Cambio #4: SelectedProductBar.tsx

**Archivo:** `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/SelectedProductBar.tsx`

**Antes (líneas 37-44):**
```typescript
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
```

**Después:**
```typescript
const formatPrice = (price: number) => {
  return `S/${Math.round(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
```

---

## 7. Resultado Esperado

Después de los cambios, **TODOS** los precios en v0.6 mostrarán:

```
Formato: S/X,XXX (sin espacio, coma como separador de miles, sin decimales)
Método:  Math.floor() + toLocaleString('en-US')  ← A FAVOR DEL USUARIO

Ejemplos:
- 145.91  → S/145  (floor, no round)
- 3204.00 → S/3,204
- 179.49  → S/179  (floor, no round)
- 215.56  → S/215  (floor, no round)
```

---

## 8. Resumen de Archivos a Modificar

| # | Archivo | Ruta Completa |
|---|---------|---------------|
| 1 | catalog.ts | `src/app/prototipos/0.6/[landing]/catalogo/types/catalog.ts` |
| 2 | generateCronogramaPDF.ts | `src/app/prototipos/0.6/[landing]/producto/utils/generateCronogramaPDF.ts` |
| 3 | ProductSummary.tsx | `src/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received/summary/ProductSummary.tsx` |
| 4 | SelectedProductBar.tsx | `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/SelectedProductBar.tsx` |

---

## 9. Testing Post-Implementación

### Checklist de Verificación

- [ ] Catálogo principal muestra precios correctos
- [ ] Carrito (CartDrawer) muestra precios consistentes
- [ ] Favoritos (WishlistDrawer) muestra precios consistentes
- [ ] Detalle de producto (PricingCalculator) muestra precios consistentes
- [ ] Productos similares muestra precios consistentes
- [ ] Comparador muestra precios consistentes
- [ ] Barra de producto seleccionado (SelectedProductBar) muestra precios consistentes
- [ ] Página de complementos muestra precios consistentes
- [ ] Página de confirmación muestra precios consistentes
- [ ] PDF de cronograma muestra precios consistentes
- [ ] Sugerencias de búsqueda muestran precios consistentes

### URLs de Prueba

```
Catálogo:      /prototipos/0.6/home/catalogo
Producto:      /prototipos/0.6/home/producto/[slug]
Solicitar:     /prototipos/0.6/home/solicitar/
Complementos:  /prototipos/0.6/home/solicitar/complementos
Confirmación:  /prototipos/0.6/home/solicitar/confirmacion?code=[CODE]
```

---

## 10. Regla de Negocio: Redondeo "A Favor del Usuario"

**IMPORTANTE:** Los redondeos de cuotas mensuales se hacen siempre **a favor del estudiante/usuario**.

### Ejemplos:
| Valor Calculado | Redondeo Correcto | Método |
|-----------------|-------------------|--------|
| 100.19 | **100** | `Math.floor()` / `math.floor()` |
| 215.56 | **215** | `Math.floor()` / `math.floor()` |
| 145.91 | **145** | `Math.floor()` / `math.floor()` |
| 491.74 | **491** | `Math.floor()` / `math.floor()` |

### Implementación:

**Frontend (`catalog.ts:83`):**
```typescript
return Math.floor(basePayment + commission);  // ✅ Correcto
```

**Backend (`pricing_service.py`):**
```python
monthly_price = math.floor(base_payment + commission)  # ✅ Correcto
```

### NO usar:
- `Math.round()` / `round()` - redondea al más cercano, puede perjudicar al usuario
- `Math.ceil()` / `math.ceil()` - redondea hacia arriba, siempre perjudica al usuario

---

## 11. Archivos Modificados (Lista Completa)

### 11.1 Backend

| Archivo | Cambios |
|---------|---------|
| `webservice2/app/services/pricing_service.py` | 5 ocurrencias: `round()` → `math.floor()` (líneas 189, 259, 612, 703, 718) |

### 11.2 Frontend - Cambios de `Math.round()` → `Math.floor()`

| Archivo | Ocurrencias | Detalles |
|---------|-------------|----------|
| `ProductCard.tsx` | 4 | Cuotas y precios en tarjeta |
| `CartDrawer.tsx` | 2 | Totales del carrito |
| `WishlistDrawer.tsx` | 1 | Precio en favoritos |
| `CartBar.tsx` | 2 | Barra flotante del carrito |
| `CartSelectionModal.tsx` | 1 | Modal de selección |
| `CartLimitModal.tsx` | 5 | Modal de límite de carrito |
| `NavbarActions.tsx` | 2 | Acciones de navbar |
| `PricingCalculator.tsx` | 6 | Calculadora de precios |
| `solicitarClient.tsx` | 3 | Cliente de solicitud |
| `complementosClient.tsx` | 1 | Cliente de complementos |
| `AccessoryCard.tsx` | 1 | Tarjeta de accesorio |
| `AccessoryDetailModal.tsx` | 2 | Modal detalle accesorio |
| `PlanComparison.tsx` | 1 | Comparación de planes |
| `Cronograma.tsx` | 7 | Cronograma de pagos |
| `catalogApi.ts` | 4 | Mapeo de API |
| `catalog.ts` | 1 | `initialAmount` cálculo |
| `ProductDetail.tsx` | 3 | Detalle de producto |
| `useProductDetail.ts` | 2 | Hook de detalle |
| `mockUpsellData.ts` | 1 | Datos mock de upsell |
| `SimilarProducts.tsx` | 1 | Productos similares |

### 11.3 Frontend - Cambios de Locale (`es-PE` / sin locale → `en-US`)

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `generateCronogramaPDF.ts` | 46-47 | `toLocaleString('es-PE')` → `toLocaleString('en-US')` |
| `ProductSummary.tsx` | 23 | `toLocaleString('es-PE')` → `toLocaleString('en-US')` |
| `SelectedProductBar.tsx` | 37-44 | `Intl.NumberFormat('es-PE')` → template con `en-US` |
| `QuizResultsV1.tsx` | 181 | `toLocaleString()` → `toLocaleString('en-US')` |
| `comparator.ts` | 357 | `toLocaleString()` → `toLocaleString('en-US')` |

---

## 12. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-03-06 | Documento creado | Claude Code |
| 2026-03-06 | Backend corregido (form_service.py) | Claude Code |
| 2026-03-06 | Frontend - 4 archivos corregidos (locale) | Claude Code |
| 2026-03-06 | Revertido Math.round→Math.floor en catalog.ts | Claude Code |
| 2026-03-06 | Backend pricing_service.py: round()→math.floor() (5 ocurrencias) | Claude Code |
| 2026-03-06 | Frontend: ~50 ocurrencias Math.round→Math.floor en 19+ archivos | Claude Code |
| 2026-03-06 | Locale fix: QuizResultsV1.tsx y comparator.ts → `en-US` | Claude Code |

---

## 13. Total de Cambios

| Componente | Archivos | Ocurrencias |
|------------|----------|-------------|
| Backend (Python) | 1 | 5 |
| Frontend (TypeScript) | 24 | ~52 |
| **TOTAL** | **25** | **~57** |
