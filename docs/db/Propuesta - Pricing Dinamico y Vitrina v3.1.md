# Propuesta: Pricing Dinámico y Vitrina de Productos v3.1

**Versión:** 3.1 | **Fecha:** Enero 2026 | **Tipo:** Eliminación de Precálculo + Visibilidad Granular

---

## 1. Problema Actual

### 1.1 Explosión Combinatoria (Tabla CPP)

```
Situación actual:
  50 productos × 5 plazos × 12 iniciales × 1 TEA = 3,000 registros

Escalado a 200 productos:
  200 productos × 5 plazos × 15 iniciales × 3 TEA_variantes = 45,000+ registros

Con plazos semanales:
  200 productos × 20 plazos × 15 iniciales × 3 TEA = 180,000+ registros
```

**Problemas:**
- Mantenimiento costoso (regenerar todo al cambiar precio o TEA)
- Sin control granular por landing
- Ocultar producto = regenerar toda la tabla
- Sin historial de precios/visibilidad

### 1.2 Lo que necesitan

1. **Cálculo dinámico** - No precalcular, usar fórmula en tiempo real
2. **Visibilidad granular** - Control por landing + fechas + condiciones especiales
3. **Tracking histórico** - Saber qué productos/precios había en qué fecha
4. **Escalabilidad** - Soportar 200+ productos sin explosión de registros

---

## 2. Solución Propuesta: Cálculo Dinámico

### 2.1 Principio

```
ANTES:  cuota = SELECT monthly_payment FROM cpp WHERE product_id=? AND term=? AND initial=?
        → 1 millón de registros precalculados

DESPUÉS: cuota = f(list_price, tea, term_months, initial_amount)
        → Cálculo en backend con ~500 registros de configuración
```

### 2.2 Fórmula de Cuota Mensual

```javascript
// Fórmula estándar de cuota fija (sistema francés)
function calculateMonthlyPayment(listPrice, initialAmount, teaAnnual, termMonths) {
  const principal = listPrice - initialAmount;

  // TEA mensual equivalente
  const monthlyRate = Math.pow(1 + teaAnnual / 100, 1/12) - 1;

  // Cuota mensual (PMT)
  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths))
                  / (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.ceil(payment); // Redondear hacia arriba
}

// TCEA incluye costos adicionales (seguro, comisiones)
function calculateTcea(monthlyPayment, termMonths, principal, additionalCosts) {
  const totalPaid = (monthlyPayment * termMonths) + additionalCosts;
  const tcea = Math.pow(totalPaid / principal, 12 / termMonths) - 1;
  return tcea * 100; // Como porcentaje
}
```

### 2.3 Ejemplo de Cálculo

```
Producto: Lenovo LOQ
├── list_price: S/ 3,499
├── initial_amount: S/ 200
├── tea_annual: 42.5%
├── term_months: 12

Principal = 3,499 - 200 = 3,299
Monthly Rate = (1 + 0.425)^(1/12) - 1 = 0.0299 (2.99% mensual)
Cuota = (3,299 × 0.0299 × 1.0299^12) / (1.0299^12 - 1) = S/ 319
```

### 2.4 Jerarquía de TEA (Prioridad)

**Los convenios determinan la TEA.** El sistema busca la TEA en el siguiente orden:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PRIORIDAD DE TEA (de mayor a menor)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  1. landing_product_visibility.tea_override                             │
│     → TEA específica para este producto en esta landing                 │
│     → Ejemplo: Producto X en landing SENATI tiene TEA especial          │
│                                                                         │
│  2. agreement_term_rate.tea (via landing.agreement_id)                  │
│     → TEA del convenio por plazo                                        │
│     → Ejemplo: Convenio SENATI tiene TEA 35% para 12 meses              │
│                                                                         │
│  3. product_term_availability.tea_override                              │
│     → TEA específica del producto para este plazo                       │
│     → Ejemplo: Producto premium tiene TEA especial                      │
│                                                                         │
│  4. financing_term.default_tea                                          │
│     → TEA por defecto del plazo (última opción)                         │
│     → Ejemplo: 12 meses = 42.5% TEA por defecto                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pseudocódigo:**

```javascript
function getTea(landingId, productId, termId) {
  // 1. Override específico landing+producto
  const lpv = getLandingProductVisibility(landingId, productId);
  if (lpv?.tea_override) return lpv.tea_override;

  // 2. TEA del convenio por plazo (CONVENIOS DETERMINAN LA TEA)
  const landing = getLanding(landingId);
  if (landing.agreement_id) {
    const agreementRate = getAgreementTermRate(landing.agreement_id, termId);
    if (agreementRate?.tea) return agreementRate.tea;
  }

  // 3. Override específico producto+plazo
  const pta = getProductTermAvailability(productId, termId);
  if (pta?.tea_override) return pta.tea_override;

  // 4. TEA por defecto del plazo
  const term = getFinancingTerm(termId);
  return term.default_tea;
}
```

**Ejemplo de configuración por convenio:**

| Convenio | Plazo | TEA |
|----------|-------|-----|
| SENATI | 6 meses | 32% |
| SENATI | 12 meses | 35% |
| SENATI | 24 meses | 38% |
| UPN | 6 meses | 35% |
| UPN | 12 meses | 38% |
| UPN | 24 meses | 40% |
| (Sin convenio) | 6 meses | 38% |
| (Sin convenio) | 12 meses | 42.5% |
| (Sin convenio) | 24 meses | 48% |

---

## 3. Nuevas Tablas Propuestas

### 3.0 agreement_term_rate (NUEVO - Convenios determinan TEA)

Los convenios determinan la TEA por plazo. Esta tabla reemplaza el campo `special_tea` que estaba en `agreement`.

```sql
CREATE TABLE `agreement_term_rate` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agreement_id` BIGINT UNSIGNED NOT NULL,
  `financing_term_id` BIGINT UNSIGNED NOT NULL,
  `tea` DECIMAL(6,3) NOT NULL COMMENT 'TEA para este convenio+plazo',
  `tcea` DECIMAL(6,3) COMMENT 'TCEA informativo',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo por defecto para este convenio',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agreement_term` (`agreement_id`, `financing_term_id`),
  KEY `idx_atr_term` (`financing_term_id`),

  CONSTRAINT `fk_atr_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_atr_term` FOREIGN KEY (`financing_term_id`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ejemplo: TEAs para convenio SENATI (agreement_id = 1)
INSERT INTO `agreement_term_rate` (`agreement_id`, `financing_term_id`, `tea`, `is_default`) VALUES
(1, 1, 32.000, 0),   -- SENATI: 6 meses = 32% TEA
(1, 3, 35.000, 1),   -- SENATI: 12 meses = 35% TEA (default)
(1, 5, 38.000, 0);   -- SENATI: 24 meses = 38% TEA

-- Ejemplo: TEAs para convenio UPN (agreement_id = 2)
INSERT INTO `agreement_term_rate` (`agreement_id`, `financing_term_id`, `tea`, `is_default`) VALUES
(2, 1, 35.000, 0),   -- UPN: 6 meses = 35% TEA
(2, 3, 38.000, 1),   -- UPN: 12 meses = 38% TEA (default)
(2, 5, 40.000, 0);   -- UPN: 24 meses = 40% TEA
```

**Ubicación en Admin:** Admin → Convenios → [Convenio] → Tasas por Plazo

### 3.1 product_initial_option

Opciones de inicial disponibles por producto.

```sql
CREATE TABLE `product_initial_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `initial_amount` DECIMAL(10,2) NOT NULL COMMENT 'Monto fijo: 0, 100, 200, 500, 1200',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Opción mostrada por defecto',
  `discount_percent` DECIMAL(5,2) DEFAULT 0 COMMENT 'Descuento adicional por dar inicial',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_initial` (`product_id`, `initial_amount`),
  KEY `idx_pio_active` (`product_id`, `is_active`, `display_order`),

  CONSTRAINT `fk_pio_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ejemplo de datos
INSERT INTO `product_initial_option` (`product_id`, `initial_amount`, `is_default`, `display_order`) VALUES
(1, 0, 0, 1),      -- Lenovo LOQ: Sin inicial
(1, 100, 0, 2),   -- Lenovo LOQ: S/100
(1, 200, 1, 3),   -- Lenovo LOQ: S/200 (default)
(1, 500, 0, 4),   -- Lenovo LOQ: S/500
(1, 1200, 0, 5);  -- Lenovo LOQ: S/1200
```

### 3.2 financing_term (actualizada)

Plazos de financiamiento con soporte para mensuales y semanales.

```sql
CREATE TABLE `financing_term` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_type` ENUM('monthly', 'weekly') NOT NULL DEFAULT 'monthly',
  `period_count` SMALLINT UNSIGNED NOT NULL COMMENT 'Cantidad: 12 meses, 52 semanas',
  `label` VARCHAR(50) NOT NULL COMMENT '12 meses, 1 año, 52 semanas',
  `label_short` VARCHAR(20) COMMENT '12m, 1a, 52s',
  `default_tea` DECIMAL(6,3) NOT NULL COMMENT 'TEA por defecto para este plazo',
  `default_tcea` DECIMAL(6,3),
  `interest_multiplier` DECIMAL(5,4) DEFAULT 1.0000 COMMENT 'Factor sobre precio base',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Mostrar destacado en UI',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_term_period` (`period_type`, `period_count`),
  KEY `idx_term_active` (`is_active`, `period_type`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos: Plazos mensuales
INSERT INTO `financing_term` (`period_type`, `period_count`, `label`, `label_short`, `default_tea`, `is_featured`, `display_order`) VALUES
('monthly', 6, '6 meses', '6m', 38.000, 0, 1),
('monthly', 9, '9 meses', '9m', 40.000, 0, 2),
('monthly', 12, '12 meses', '12m', 42.500, 1, 3),
('monthly', 18, '18 meses', '18m', 45.000, 0, 4),
('monthly', 24, '24 meses', '24m', 48.000, 1, 5),
('monthly', 36, '36 meses', '36m', 52.000, 0, 6);

-- Datos: Plazos semanales
INSERT INTO `financing_term` (`period_type`, `period_count`, `label`, `label_short`, `default_tea`, `display_order`) VALUES
('weekly', 26, '26 semanas', '26s', 38.000, 10),
('weekly', 52, '52 semanas', '52s', 42.500, 11),
('weekly', 78, '78 semanas', '78s', 45.000, 12);
```

### 3.3 product_term_availability

Qué plazos están disponibles por producto (no todos los productos tienen todos los plazos).

```sql
CREATE TABLE `product_term_availability` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `financing_term_id` BIGINT UNSIGNED NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo mostrado por defecto para este producto',
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial para este producto+plazo (NULL = usar default)',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_term` (`product_id`, `financing_term_id`),
  KEY `idx_pta_active` (`product_id`, `is_active`),

  CONSTRAINT `fk_pta_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pta_term` FOREIGN KEY (`financing_term_id`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Visibilidad Granular por Landing

### 4.1 landing_product_visibility

Control granular de qué productos se muestran en qué landing, con fechas y condiciones especiales.

```sql
CREATE TABLE `landing_product_visibility` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,

  -- Visibilidad
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Destacado en esta landing',
  `display_order` INT DEFAULT 0,

  -- Vigencia (NULL = sin límite)
  `visible_from` DATETIME COMMENT 'Visible desde esta fecha',
  `visible_until` DATETIME COMMENT 'Visible hasta esta fecha',

  -- Override de condiciones financieras (NULL = usar default del producto/convenio)
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial para este landing',
  `min_initial_amount_override` DECIMAL(10,2) COMMENT 'Inicial mínimo override',
  `max_initial_amount_override` DECIMAL(10,2) COMMENT 'Inicial máximo override',

  -- Override de plazos disponibles (NULL = usar todos del producto)
  `allowed_term_ids` JSON COMMENT 'Array de financing_term_id permitidos, ej: [1,3,5]',
  `default_term_id_override` BIGINT UNSIGNED COMMENT 'Plazo por defecto en esta landing',

  -- Display promocional
  `promo_tag` VARCHAR(50) COMMENT 'Badge: OFERTA, NUEVO, -20%, EXCLUSIVO',
  `promo_badge_color` CHAR(7) DEFAULT '#ff4444',
  `promo_message` VARCHAR(200) COMMENT 'Mensaje promocional en card',

  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_product` (`landing_id`, `product_id`),
  KEY `idx_lpv_visible` (`landing_id`, `is_visible`),
  KEY `idx_lpv_dates` (`visible_from`, `visible_until`),
  KEY `idx_lpv_featured` (`landing_id`, `is_featured`, `display_order`),

  CONSTRAINT `fk_lpv_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lpv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lpv_default_term` FOREIGN KEY (`default_term_id_override`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 Ejemplos de Uso

```sql
-- Caso 1: "Lenovo LOQ visible en SENATI del 1-15 Enero con cuota especial"
INSERT INTO landing_product_visibility
  (landing_id, product_id, is_visible, visible_from, visible_until, tea_override, promo_tag)
VALUES
  (5, 1, 1, '2026-01-01 00:00:00', '2026-01-15 23:59:59', 35.000, 'OFERTA ENERO');

-- Caso 2: "HP Victus visible en UPN todo Enero pero con 0% inicial obligatorio"
INSERT INTO landing_product_visibility
  (landing_id, product_id, is_visible, visible_from, visible_until, min_initial_amount_override, max_initial_amount_override, promo_tag)
VALUES
  (3, 2, 1, '2026-01-01 00:00:00', '2026-01-31 23:59:59', 0, 0, 'SIN INICIAL');

-- Caso 3: "MacBook solo con plazos de 12 y 24 meses en landing general"
INSERT INTO landing_product_visibility
  (landing_id, product_id, is_visible, allowed_term_ids, default_term_id_override)
VALUES
  (1, 10, 1, '[3, 5]', 3);  -- Solo 12m y 24m, default 12m
```

### 4.3 Query para Obtener Catálogo de una Landing

```sql
-- Productos visibles en SENATI (landing_id=5) HOY
SELECT
    p.id,
    p.sku,
    p.name,
    p.list_price,
    b.name AS brand_name,
    lpv.is_featured,
    lpv.promo_tag,
    lpv.promo_badge_color,
    -- TEA efectiva (override > convenio > default)
    COALESCE(lpv.tea_override, ag.special_tea, ft.default_tea) AS effective_tea,
    lpv.display_order
FROM product p
JOIN brand b ON b.id = p.brand_id
JOIN landing_product_visibility lpv ON lpv.product_id = p.id
JOIN landing l ON l.id = lpv.landing_id
LEFT JOIN agreement ag ON ag.id = l.agreement_id
JOIN financing_term ft ON ft.id = (
    SELECT pta.financing_term_id
    FROM product_term_availability pta
    WHERE pta.product_id = p.id AND pta.is_default = 1
    LIMIT 1
)
WHERE lpv.landing_id = 5
  AND lpv.is_visible = 1
  AND lpv.deleted_at IS NULL
  AND p.is_active = 1
  AND (lpv.visible_from IS NULL OR lpv.visible_from <= NOW())
  AND (lpv.visible_until IS NULL OR lpv.visible_until >= NOW())
ORDER BY lpv.is_featured DESC, lpv.display_order ASC;
```

---

## 5. Tracking Histórico para Analytics

### 5.1 product_catalog_snapshot

Snapshot diario del catálogo para análisis de conversión por precio/producto.

```sql
CREATE TABLE `product_catalog_snapshot` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `snapshot_date` DATE NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,

  -- Estado en ese momento
  `was_visible` TINYINT(1) NOT NULL,
  `was_featured` TINYINT(1) NOT NULL,
  `display_order` INT,

  -- Precios en ese momento
  `list_price` DECIMAL(10,2) NOT NULL,
  `tea_applied` DECIMAL(6,3) NOT NULL,

  -- Ejemplo de cuota (para referencia rápida)
  `sample_term_months` TINYINT UNSIGNED DEFAULT 12,
  `sample_initial_amount` DECIMAL(10,2) DEFAULT 0,
  `sample_monthly_payment` DECIMAL(10,2),

  -- Promoción activa
  `promo_tag` VARCHAR(50),

  -- Metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_snapshot` (`snapshot_date`, `landing_id`, `product_id`),
  KEY `idx_snapshot_date` (`snapshot_date`),
  KEY `idx_snapshot_product` (`product_id`, `snapshot_date`),
  KEY `idx_snapshot_landing` (`landing_id`, `snapshot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.2 Job de Snapshot Diario

```sql
-- Ejecutar cada día a las 00:05
INSERT INTO product_catalog_snapshot
  (snapshot_date, landing_id, product_id, was_visible, was_featured, display_order,
   list_price, tea_applied, sample_term_months, sample_initial_amount,
   sample_monthly_payment, promo_tag)
SELECT
    CURDATE(),
    lpv.landing_id,
    p.id,
    lpv.is_visible,
    lpv.is_featured,
    lpv.display_order,
    p.list_price,
    COALESCE(lpv.tea_override, ag.special_tea, 42.5) AS tea_applied,
    12,  -- Plazo de ejemplo
    0,   -- Inicial de ejemplo
    -- Cálculo simplificado de cuota para 12 meses sin inicial
    CEIL(p.list_price * 1.12 / 12),
    lpv.promo_tag
FROM product p
JOIN landing_product_visibility lpv ON lpv.product_id = p.id
JOIN landing l ON l.id = lpv.landing_id
LEFT JOIN agreement ag ON ag.id = l.agreement_id
WHERE p.is_active = 1
  AND lpv.deleted_at IS NULL
  AND (lpv.visible_from IS NULL OR lpv.visible_from <= NOW())
  AND (lpv.visible_until IS NULL OR lpv.visible_until >= NOW());
```

### 5.3 Query de Análisis de Conversión

```sql
-- ¿Qué precio tenía el producto cuando el cliente aplicó?
SELECT
    a.id AS application_id,
    a.created_at AS application_date,
    p.name AS product_name,
    pcs.list_price AS price_at_application,
    pcs.tea_applied AS tea_at_application,
    pcs.sample_monthly_payment AS approx_payment_shown,
    pcs.promo_tag AS promo_active
FROM application a
JOIN application_product ap ON ap.application_id = a.id
JOIN product p ON p.id = ap.product_id
LEFT JOIN product_catalog_snapshot pcs ON (
    pcs.product_id = ap.product_id
    AND pcs.landing_id = a.landing_id
    AND pcs.snapshot_date = DATE(a.created_at)
)
WHERE a.landing_id = 5
  AND a.created_at BETWEEN '2026-01-01' AND '2026-01-31';

-- Conversión por rango de precio
SELECT
    CASE
        WHEN pcs.list_price < 2000 THEN 'Bajo (<2000)'
        WHEN pcs.list_price < 3500 THEN 'Medio (2000-3500)'
        ELSE 'Alto (>3500)'
    END AS price_tier,
    COUNT(DISTINCT s.id) AS sessions,
    COUNT(DISTINCT l.id) AS leads,
    COUNT(DISTINCT a.id) AS applications,
    ROUND(COUNT(DISTINCT a.id) * 100.0 / NULLIF(COUNT(DISTINCT l.id), 0), 2) AS lead_to_app_rate
FROM session s
JOIN page_view pv ON pv.session_id = s.id AND pv.step_code = 'catalogo'
JOIN event_product ep ON ep.session_id = s.id AND ep.action = 'view_detail'
JOIN product_catalog_snapshot pcs ON (
    pcs.product_id = ep.product_id
    AND pcs.landing_id = s.landing_id
    AND pcs.snapshot_date = DATE(s.created_at)
)
LEFT JOIN lead l ON l.session_id = s.id
LEFT JOIN application a ON a.session_id = s.id
WHERE s.landing_id = 5
  AND s.created_at BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY price_tier
ORDER BY price_tier;
```

---

## 6. Tablas a Eliminar/Deprecar

### 6.1 Tablas que se reemplazan

| Tabla Actual | Reemplazada Por | Motivo |
|--------------|-----------------|--------|
| `cpp` (categoría_producto_préstamo) | Cálculo dinámico | Elimina 1M de registros |
| `product_pricing` (precalculada) | `product_initial_option` + fórmula | Solo opciones de inicial |
| `landing_product` (con precios) | `landing_product_visibility` | Sin precios, solo visibilidad |

### 6.2 Migración Propuesta

```sql
-- Fase 1: Crear nuevas tablas
CREATE TABLE product_initial_option ...
CREATE TABLE product_term_availability ...
CREATE TABLE landing_product_visibility ...
CREATE TABLE product_catalog_snapshot ...

-- Fase 2: Migrar datos de landing_product a landing_product_visibility
INSERT INTO landing_product_visibility
  (landing_id, product_id, is_visible, is_featured, display_order,
   tea_override, promo_tag, created_at)
SELECT
    lp.landing_id,
    lp.product_id,
    lp.is_visible,
    lp.is_featured,
    lp.display_order,
    CASE WHEN lp.tea != ft.default_tea THEN lp.tea ELSE NULL END,
    lp.promo_tag,
    lp.created_at
FROM landing_product lp
LEFT JOIN financing_term ft ON ft.period_count = lp.term_months AND ft.period_type = 'monthly';

-- Fase 3: Migrar opciones de inicial de CPP
INSERT INTO product_initial_option (product_id, initial_amount, is_default, display_order)
SELECT DISTINCT
    product_id,
    initial_payment,
    CASE WHEN initial_payment = 0 THEN 1 ELSE 0 END,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY initial_payment)
FROM cpp
WHERE is_active = 1;

-- Fase 4: Deprecar tablas viejas (renombrar, no eliminar aún)
RENAME TABLE cpp TO _deprecated_cpp;
RENAME TABLE product_pricing TO _deprecated_product_pricing;

-- Fase 5: Después de validar en producción (30 días)
DROP TABLE _deprecated_cpp;
DROP TABLE _deprecated_product_pricing;
```

---

## 7. API de Cálculo de Cuotas

### 7.1 Endpoint Propuesto

```
GET /api/v2/products/{productId}/financing-options
?landing_id=5
&initial_amount=200
```

### 7.2 Response

```json
{
  "product": {
    "id": 1,
    "sku": "LOQ-15IRX9",
    "name": "Lenovo LOQ 15IRX9",
    "list_price": 3499.00
  },
  "selected_initial": 200.00,
  "available_initials": [0, 100, 200, 500, 1200],
  "financing_options": [
    {
      "term_id": 1,
      "period_type": "monthly",
      "period_count": 6,
      "label": "6 meses",
      "monthly_payment": 599.00,
      "total_amount": 3794.00,
      "tea": 42.50,
      "tcea": 48.20,
      "is_featured": false
    },
    {
      "term_id": 3,
      "period_type": "monthly",
      "period_count": 12,
      "label": "12 meses",
      "monthly_payment": 319.00,
      "total_amount": 4028.00,
      "tea": 42.50,
      "tcea": 48.20,
      "is_featured": true,
      "is_default": true
    },
    {
      "term_id": 5,
      "period_type": "monthly",
      "period_count": 24,
      "label": "24 meses",
      "monthly_payment": 179.00,
      "total_amount": 4496.00,
      "tea": 48.00,
      "tcea": 54.30,
      "is_featured": true
    }
  ],
  "promo": {
    "tag": "OFERTA ENERO",
    "message": "TEA especial por tiempo limitado",
    "valid_until": "2026-01-31"
  }
}
```

---

## 8. Resumen de Cambios

### 8.1 Nuevas Tablas

| Tabla | Registros Estimados | Propósito |
|-------|---------------------|-----------|
| `product_initial_option` | ~1,000 (200 prod × 5 iniciales) | Opciones de inicial por producto |
| `product_term_availability` | ~1,200 (200 prod × 6 plazos) | Plazos disponibles por producto |
| `landing_product_visibility` | ~2,000 (10 landings × 200 prod) | Visibilidad granular |
| `product_catalog_snapshot` | ~60,000/año (2000 × 30 días) | Historial para analytics |

**Total: ~65,000 registros vs 1,000,000+ actuales**

### 8.2 Tablas Modificadas

| Tabla | Cambio |
|-------|--------|
| `financing_term` | Agregar `period_type` para semanales |
| `product` | Confirmar que `list_price` es el precio de venta |

### 8.3 Tablas Deprecadas

| Tabla | Estado |
|-------|--------|
| `cpp` | Deprecar → Eliminar |
| `product_pricing` | Deprecar → Eliminar |
| `landing_product` | Reemplazar por `landing_product_visibility` |

---

## 9. Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Registros** | ~1,000,000 | ~65,000 |
| **Cambiar precio** | Regenerar CPP completa | UPDATE 1 fila en product |
| **Ocultar producto** | Regenerar + republicar | UPDATE is_visible = 0 |
| **Control por landing** | No disponible | ✓ Granular con fechas |
| **Historial de precios** | No disponible | ✓ Snapshot diario |
| **Agregar nuevo plazo** | INSERT millones de registros | INSERT 1 fila en financing_term |
| **Tiempo de deploy** | Minutos (regenerar) | Segundos |

---

## 10. Tablas Faltantes para Ecommerce/Plataforma

### 10.1 Inventario y Stock

```sql
-- Stock por producto y ubicación
CREATE TABLE `product_stock` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `location_id` BIGINT UNSIGNED COMMENT 'NULL = stock general',
  `quantity_available` INT NOT NULL DEFAULT 0,
  `quantity_reserved` INT NOT NULL DEFAULT 0 COMMENT 'Reservados por solicitudes aprobadas',
  `quantity_in_transit` INT NOT NULL DEFAULT 0,
  `reorder_point` INT DEFAULT 5 COMMENT 'Alerta cuando llegue a este nivel',
  `last_recount_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stock_product_location` (`product_id`, `location_id`),
  KEY `idx_stock_low` (`product_id`, `quantity_available`),

  CONSTRAINT `fk_ps_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_ps_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movimientos de stock (auditoría)
CREATE TABLE `stock_movement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `location_id` BIGINT UNSIGNED,
  `movement_type` ENUM('purchase', 'sale', 'reserve', 'release', 'transfer', 'adjustment', 'return') NOT NULL,
  `quantity` INT NOT NULL COMMENT 'Positivo = entrada, Negativo = salida',
  `quantity_before` INT NOT NULL,
  `quantity_after` INT NOT NULL,
  `reference_type` VARCHAR(50) COMMENT 'application, loan, purchase_order',
  `reference_id` BIGINT UNSIGNED COMMENT 'ID de la entidad relacionada',
  `notes` VARCHAR(500),
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_sm_product` (`product_id`, `created_at`),
  KEY `idx_sm_type` (`movement_type`, `created_at`),
  KEY `idx_sm_reference` (`reference_type`, `reference_id`),

  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_sm_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`),
  CONSTRAINT `fk_sm_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.2 Reservas de Producto

```sql
-- Reservas cuando una solicitud es aprobada
CREATE TABLE `product_reservation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `status` ENUM('pending', 'confirmed', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
  `reserved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP COMMENT 'Cuándo expira la reserva si no se cumple',
  `fulfilled_at` TIMESTAMP COMMENT 'Cuándo se entregó el producto',
  `cancelled_at` TIMESTAMP,
  `cancellation_reason` VARCHAR(300),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pr_product` (`product_id`, `status`),
  KEY `idx_pr_application` (`application_id`),
  KEY `idx_pr_expires` (`status`, `expires_at`),

  CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_pr_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.3 Sistema de Notificaciones

```sql
-- Templates de notificaciones
CREATE TABLE `notification_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'application_approved, payment_reminder, etc.',
  `name` VARCHAR(150) NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push', 'in_app') NOT NULL,
  `subject` VARCHAR(200) COMMENT 'Para email',
  `body_template` TEXT NOT NULL COMMENT 'Template con variables {{nombre}}, {{monto}}',
  `variables` JSON COMMENT 'Lista de variables disponibles',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code_channel` (`code`, `channel`),
  KEY `idx_template_channel` (`channel`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notificaciones enviadas
CREATE TABLE `notification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push', 'in_app') NOT NULL,
  `recipient` VARCHAR(254) NOT NULL COMMENT 'Email, teléfono, device_token',
  `subject` VARCHAR(200),
  `body` TEXT NOT NULL COMMENT 'Contenido renderizado',
  `status` ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'bounced') DEFAULT 'pending',
  `sent_at` TIMESTAMP,
  `delivered_at` TIMESTAMP,
  `read_at` TIMESTAMP,
  `failed_at` TIMESTAMP,
  `failure_reason` VARCHAR(500),
  `external_id` VARCHAR(100) COMMENT 'ID del proveedor (SendGrid, Twilio)',
  `metadata` JSON COMMENT 'Datos adicionales del envío',
  `reference_type` VARCHAR(50) COMMENT 'application, loan, lead',
  `reference_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_notif_person` (`person_id`, `channel`, `created_at`),
  KEY `idx_notif_status` (`status`, `channel`),
  KEY `idx_notif_reference` (`reference_type`, `reference_id`),
  KEY `idx_notif_external` (`external_id`),

  CONSTRAINT `fk_notif_template` FOREIGN KEY (`template_id`) REFERENCES `notification_template` (`id`),
  CONSTRAINT `fk_notif_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preferencias de notificación por persona
CREATE TABLE `notification_preference` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT 'marketing, transactional, reminders',
  `is_enabled` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pref_person_channel_cat` (`person_id`, `channel`, `category`),

  CONSTRAINT `fk_np_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.4 Sistema de Componentes Dinámicos (Mejorado)

El sistema actual de `home_component` se puede extender para manejar componentes en cualquier página.

```sql
-- Definición de tipos de componentes disponibles
CREATE TABLE `component_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'hero, carousel, featured_products, testimonials, faq, cta, banner',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `category` ENUM('hero', 'content', 'products', 'social_proof', 'forms', 'navigation', 'footer') NOT NULL,
  `allowed_pages` JSON COMMENT '["home", "catalog", "form", "result"] - dónde puede usarse',
  `config_schema` JSON COMMENT 'JSON Schema de la configuración esperada',
  `default_config` JSON,
  `preview_image_url` VARCHAR(500),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_component_code` (`code`),
  KEY `idx_component_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Componentes por landing y página (extiende home_component)
CREATE TABLE `landing_component` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_id` BIGINT UNSIGNED COMMENT 'NULL = producción',
  `component_definition_id` BIGINT UNSIGNED NOT NULL,
  `page_code` VARCHAR(50) NOT NULL COMMENT 'home, catalog, form_step_1, result_success',

  -- Configuración
  `config` JSON NOT NULL COMMENT 'Configuración específica de esta instancia',
  `is_visible` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,

  -- Targeting (mostrar solo a ciertos usuarios)
  `target_device` ENUM('all', 'mobile', 'desktop') DEFAULT 'all',
  `target_new_visitor` TINYINT(1) COMMENT 'NULL=todos, 1=nuevos, 0=recurrentes',

  -- A/B Testing
  `variant` CHAR(1) COMMENT 'A, B, C para A/B testing',
  `traffic_percent` TINYINT UNSIGNED DEFAULT 100 COMMENT '% de tráfico que ve este componente',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  KEY `idx_lc_landing_page` (`landing_id`, `page_code`, `display_order`),
  KEY `idx_lc_version` (`version_id`),

  CONSTRAINT `fk_lc_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lc_version` FOREIGN KEY (`version_id`) REFERENCES `landing_version` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lc_definition` FOREIGN KEY (`component_definition_id`) REFERENCES `component_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de tipos de componentes
INSERT INTO `component_definition` (`code`, `name`, `category`, `allowed_pages`) VALUES
('hero_v1', 'Hero Principal v1', 'hero', '["home"]'),
('hero_v2', 'Hero con Video v2', 'hero', '["home"]'),
('hero_minimal', 'Hero Minimalista', 'hero', '["home", "catalog"]'),
('carousel_products', 'Carrusel de Productos', 'products', '["home", "catalog"]'),
('featured_grid', 'Grid de Destacados', 'products', '["home", "catalog"]'),
('testimonials_slider', 'Testimonios Slider', 'social_proof', '["home", "form"]'),
('testimonials_grid', 'Testimonios Grid', 'social_proof', '["home"]'),
('institution_logos', 'Logos de Instituciones', 'social_proof', '["home"]'),
('faq_accordion', 'FAQ Acordeón', 'content', '["home", "catalog", "form"]'),
('how_it_works', 'Cómo Funciona', 'content', '["home"]'),
('cta_banner', 'Banner CTA', 'content', '["home", "catalog", "result"]'),
('comparison_table', 'Tabla Comparativa', 'products', '["catalog"]'),
('filters_sidebar', 'Filtros Lateral', 'navigation', '["catalog"]'),
('whatsapp_float', 'Botón WhatsApp Flotante', 'navigation', '["home", "catalog", "form"]');
```

### 10.5 Sistema de Cupones/Códigos Promocionales

```sql
-- Cupones de descuento
CREATE TABLE `coupon` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL COMMENT 'BALDE20, SENATI10',
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,

  -- Tipo de descuento
  `discount_type` ENUM('percent', 'fixed_amount', 'free_accessory', 'special_tea') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL COMMENT '20 para 20%, 100 para S/100',

  -- Restricciones
  `min_product_price` DECIMAL(10,2) COMMENT 'Precio mínimo del producto',
  `max_discount_amount` DECIMAL(10,2) COMMENT 'Tope de descuento',
  `allowed_product_ids` JSON COMMENT 'NULL = todos los productos',
  `allowed_landing_ids` JSON COMMENT 'NULL = todas las landings',
  `allowed_agreement_ids` JSON COMMENT 'NULL = todos los convenios',

  -- Límites de uso
  `max_total_uses` INT UNSIGNED COMMENT 'NULL = ilimitado',
  `max_uses_per_person` INT UNSIGNED DEFAULT 1,
  `current_uses` INT UNSIGNED DEFAULT 0,

  -- Vigencia
  `valid_from` DATETIME NOT NULL,
  `valid_until` DATETIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,

  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupon_code` (`code`),
  KEY `idx_coupon_active` (`is_active`, `valid_from`, `valid_until`),

  CONSTRAINT `fk_coupon_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uso de cupones
CREATE TABLE `coupon_usage` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coupon_id` BIGINT UNSIGNED NOT NULL,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `application_id` BIGINT UNSIGNED,
  `discount_applied` DECIMAL(10,2) NOT NULL,
  `used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_cu_coupon` (`coupon_id`),
  KEY `idx_cu_person` (`person_id`),

  CONSTRAINT `fk_cu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`),
  CONSTRAINT `fk_cu_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`),
  CONSTRAINT `fk_cu_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.6 Wishlist / Productos Guardados

```sql
-- Productos guardados por usuario/sesión
CREATE TABLE `saved_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED COMMENT 'NULL si es sesión anónima',
  `session_id` BIGINT UNSIGNED COMMENT 'Para usuarios no registrados',
  `product_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED COMMENT 'Landing donde lo guardó',

  -- Snapshot de condiciones al guardar
  `saved_list_price` DECIMAL(10,2),
  `saved_term_months` TINYINT UNSIGNED,
  `saved_initial_amount` DECIMAL(10,2),
  `saved_monthly_payment` DECIMAL(10,2),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_saved_person_product` (`person_id`, `product_id`),
  KEY `idx_saved_session` (`session_id`),
  KEY `idx_saved_product` (`product_id`),

  CONSTRAINT `fk_sp_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 11. Sistema de Periféricos/Accesorios con Temporalidad

### 11.1 Problema

Los periféricos (mouse, teclado, mochila, audífonos) tienen las siguientes características:

1. **Precio independiente** - Cada periférico tiene su propio precio
2. **Temporalidad por plazo** - Un mouse puede estar disponible para 6, 12, 24 meses pero no para 18
3. **Filtrado dinámico** - Cuando el usuario elige laptop con 12 cuotas, solo mostrar periféricos con 12 meses disponible
4. **Cuota adicional** - La cuota del periférico se suma a la cuota de la laptop
5. **Compatibilidad** - No todos los periféricos aplican a todos los productos

### 11.2 Flujo del Usuario

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE SELECCIÓN LAPTOP + PERIFÉRICOS                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. Usuario selecciona LAPTOP                                                   │
│     └── Lenovo LOQ (S/ 3,499)                                                   │
│                                                                                 │
│  2. Usuario selecciona PLAZO                                                    │
│     └── 12 meses → cuota laptop: S/ 319                                         │
│                                                                                 │
│  3. Sistema FILTRA periféricos disponibles para 12 meses                        │
│     ┌─────────────────────────────────────────────────────────────────────┐     │
│     │ Periféricos compatibles con Lenovo LOQ + 12 meses:                  │     │
│     │                                                                     │     │
│     │ ☑ Mouse Logitech G502     → +S/ 15/mes (disponible 6,12,24)        │     │
│     │ ☑ Mochila HP 15.6"        → +S/ 8/mes  (disponible 12,24)          │     │
│     │ ☑ Audífonos HyperX Cloud  → +S/ 12/mes (disponible 12,18,24)       │     │
│     │ ☐ Teclado Mecánico        → NO DISPONIBLE para 12 meses            │     │
│     └─────────────────────────────────────────────────────────────────────┘     │
│                                                                                 │
│  4. Usuario selecciona periféricos                                              │
│     └── Mouse Logitech + Mochila HP                                             │
│                                                                                 │
│  5. Sistema calcula CUOTA TOTAL                                                 │
│     ├── Cuota laptop:  S/ 319                                                   │
│     ├── Cuota mouse:   S/  15                                                   │
│     ├── Cuota mochila: S/   8                                                   │
│     └── TOTAL:         S/ 342/mes × 12 cuotas                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Modelo de Datos

#### 11.3.1 accessory (ya existe, se modifica)

```sql
-- Periféricos base (modificar tabla existente)
ALTER TABLE `accessory` ADD COLUMN `list_price` DECIMAL(10,2) NOT NULL AFTER `category`;
ALTER TABLE `accessory` ADD COLUMN `sku` VARCHAR(50) AFTER `id`;
ALTER TABLE `accessory` ADD COLUMN `name` VARCHAR(150) NOT NULL AFTER `sku`;
ALTER TABLE `accessory` ADD COLUMN `short_name` VARCHAR(50) AFTER `name`;
ALTER TABLE `accessory` ADD COLUMN `description` TEXT AFTER `short_name`;
ALTER TABLE `accessory` ADD COLUMN `image_url` VARCHAR(500) AFTER `description`;
ALTER TABLE `accessory` ADD COLUMN `brand_id` BIGINT UNSIGNED AFTER `image_url`;

-- Agregar índice y FK
ALTER TABLE `accessory` ADD UNIQUE KEY `uk_accessory_sku` (`sku`);
ALTER TABLE `accessory` ADD CONSTRAINT `fk_accessory_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`);

-- Quitar columna de precio mensual fijo (ahora se calcula)
ALTER TABLE `accessory` DROP COLUMN `monthly_price_addon`;
```

**Estructura final de `accessory`:**

```sql
CREATE TABLE `accessory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `short_name` VARCHAR(50),
  `description` TEXT,
  `image_url` VARCHAR(500),
  `brand_id` BIGINT UNSIGNED,
  `category` ENUM('mouse', 'keyboard', 'headset', 'backpack', 'stand', 'charger', 'protector', 'hub', 'webcam', 'microphone', 'other') NOT NULL,
  `list_price` DECIMAL(10,2) NOT NULL COMMENT 'Precio de venta del periférico',
  `is_recommended` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accessory_sku` (`sku`),
  KEY `idx_accessory_category` (`category`, `is_active`),
  KEY `idx_accessory_brand` (`brand_id`),

  CONSTRAINT `fk_accessory_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 11.3.2 accessory_term_availability (NUEVA)

Qué plazos están disponibles para cada periférico.

```sql
CREATE TABLE `accessory_term_availability` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `financing_term_id` BIGINT UNSIGNED NOT NULL,
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial para este periférico+plazo (NULL = usar default del plazo)',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo por defecto para mostrar',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accessory_term` (`accessory_id`, `financing_term_id`),
  KEY `idx_ata_active` (`accessory_id`, `is_active`),
  KEY `idx_ata_term` (`financing_term_id`),

  CONSTRAINT `fk_ata_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ata_term` FOREIGN KEY (`financing_term_id`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ejemplo de datos
-- Mouse Logitech disponible en 6, 12, 24 meses
INSERT INTO `accessory_term_availability` (`accessory_id`, `financing_term_id`, `is_default`) VALUES
(1, 1, 0),  -- Mouse Logitech + 6 meses
(1, 3, 1),  -- Mouse Logitech + 12 meses (default)
(1, 5, 0);  -- Mouse Logitech + 24 meses

-- Mochila HP disponible solo en 12, 24 meses
INSERT INTO `accessory_term_availability` (`accessory_id`, `financing_term_id`, `is_default`) VALUES
(2, 3, 1),  -- Mochila HP + 12 meses (default)
(2, 5, 0);  -- Mochila HP + 24 meses
```

#### 11.3.3 accessory_product_compatibility (NUEVA)

Define qué periféricos son compatibles con qué productos (más granular que por tipo).

```sql
CREATE TABLE `accessory_product_compatibility` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED COMMENT 'NULL = compatible con todos los productos del tipo',
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto') COMMENT 'Tipo de producto si product_id es NULL',
  `is_recommended` TINYINT(1) DEFAULT 0 COMMENT 'Recomendado para este producto específico',
  `recommendation_reason` VARCHAR(200) COMMENT 'Ej: "Perfecto para gaming"',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  -- Un periférico puede ser compatible por tipo O por producto específico
  UNIQUE KEY `uk_accessory_product` (`accessory_id`, `product_id`),
  KEY `idx_apc_product` (`product_id`),
  KEY `idx_apc_type` (`product_type`, `is_active`),

  CONSTRAINT `fk_apc_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apc_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ejemplo: Mouse gaming recomendado específicamente para laptops gaming
INSERT INTO `accessory_product_compatibility`
  (`accessory_id`, `product_id`, `is_recommended`, `recommendation_reason`) VALUES
(1, 15, 1, 'Mouse gaming ideal para tu Lenovo LOQ'),  -- Mouse Logitech + Lenovo LOQ
(1, 16, 1, 'Precisión perfecta para gaming');         -- Mouse Logitech + HP Victus

-- Ejemplo: Mochila compatible con todas las laptops
INSERT INTO `accessory_product_compatibility`
  (`accessory_id`, `product_type`, `is_recommended`) VALUES
(2, 'laptop', 0);  -- Mochila HP compatible con todas las laptops
```

#### 11.3.4 landing_accessory_visibility (NUEVA)

Control de qué periféricos se muestran en qué landing (similar a landing_product_visibility).

```sql
CREATE TABLE `landing_accessory_visibility` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `accessory_id` BIGINT UNSIGNED NOT NULL,

  -- Visibilidad
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,

  -- Vigencia
  `visible_from` DATETIME,
  `visible_until` DATETIME,

  -- Override de precio (para promociones por landing)
  `price_override` DECIMAL(10,2) COMMENT 'Precio especial en esta landing',
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial en esta landing',

  -- Promoción
  `promo_tag` VARCHAR(50) COMMENT 'GRATIS, -20%, COMBO',
  `promo_badge_color` CHAR(7),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_accessory` (`landing_id`, `accessory_id`),
  KEY `idx_lav_visible` (`landing_id`, `is_visible`),
  KEY `idx_lav_dates` (`visible_from`, `visible_until`),

  CONSTRAINT `fk_lav_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lav_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.4 Lógica de Cálculo

#### 11.4.1 Fórmula de Cuota de Periférico

```javascript
// Misma fórmula que para productos
function calculateAccessoryPayment(accessoryPrice, teaAnnual, termMonths) {
  // Los periféricos no tienen inicial (siempre se financian completos)
  const monthlyRate = Math.pow(1 + teaAnnual / 100, 1/12) - 1;

  if (monthlyRate === 0) {
    return accessoryPrice / termMonths;
  }

  const payment = (accessoryPrice * monthlyRate * Math.pow(1 + monthlyRate, termMonths))
                  / (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.ceil(payment);
}

// Ejemplo: Mouse S/180, TEA 42.5%, 12 meses
// Cuota = S/15/mes
```

#### 11.4.2 Cálculo de Cuota Total

```javascript
function calculateTotalPayment(product, accessories, termMonths, initialAmount, tea) {
  // 1. Cuota del producto principal
  const productPayment = calculateMonthlyPayment(
    product.listPrice,
    initialAmount,
    tea,
    termMonths
  );

  // 2. Cuota de cada periférico
  let accessoriesPayment = 0;
  for (const accessory of accessories) {
    accessoriesPayment += calculateAccessoryPayment(
      accessory.listPrice,
      accessory.teaOverride || tea, // Usar TEA del periférico si tiene override
      termMonths
    );
  }

  // 3. Total
  return {
    productPayment,
    accessoriesPayment,
    totalPayment: productPayment + accessoriesPayment,
    totalAmount: (productPayment + accessoriesPayment) * termMonths + initialAmount
  };
}
```

### 11.5 Queries de Ejemplo

#### 11.5.1 Obtener periféricos disponibles para un producto + plazo

```sql
-- Periféricos compatibles con Lenovo LOQ (product_id=15) para 12 meses (financing_term_id=3)
-- En landing SENATI (landing_id=5)
SELECT
    a.id,
    a.sku,
    a.name,
    a.category,
    a.image_url,
    -- Precio efectivo (override > base)
    COALESCE(lav.price_override, a.list_price) AS effective_price,
    -- TEA efectiva (landing override > term override > default)
    COALESCE(lav.tea_override, ata.tea_override, ft.default_tea) AS effective_tea,
    -- Cuota calculada (aproximación, el cálculo exacto se hace en backend)
    CEIL(COALESCE(lav.price_override, a.list_price) * 1.12 / 12) AS approx_monthly_payment,
    apc.is_recommended,
    apc.recommendation_reason,
    lav.promo_tag,
    lav.promo_badge_color
FROM accessory a
-- Verificar disponibilidad del plazo
JOIN accessory_term_availability ata ON ata.accessory_id = a.id
    AND ata.financing_term_id = 3  -- 12 meses
    AND ata.is_active = 1
JOIN financing_term ft ON ft.id = ata.financing_term_id
-- Verificar compatibilidad con el producto
JOIN accessory_product_compatibility apc ON apc.accessory_id = a.id
    AND (apc.product_id = 15 OR (apc.product_id IS NULL AND apc.product_type = 'laptop'))
    AND apc.is_active = 1
-- Verificar visibilidad en el landing
LEFT JOIN landing_accessory_visibility lav ON lav.accessory_id = a.id
    AND lav.landing_id = 5
    AND lav.is_visible = 1
    AND lav.deleted_at IS NULL
    AND (lav.visible_from IS NULL OR lav.visible_from <= NOW())
    AND (lav.visible_until IS NULL OR lav.visible_until >= NOW())
WHERE a.is_active = 1
  -- Si no hay registro en landing_accessory_visibility, mostrar por defecto
  -- Si hay registro, respetar is_visible
  AND (lav.id IS NULL OR lav.is_visible = 1)
ORDER BY apc.is_recommended DESC, COALESCE(lav.display_order, apc.display_order, a.display_order);
```

#### 11.5.2 Verificar si un periférico está disponible para el plazo seleccionado

```sql
-- ¿El Mouse Logitech (accessory_id=1) está disponible para 18 meses (financing_term_id=4)?
SELECT EXISTS(
    SELECT 1 FROM accessory_term_availability
    WHERE accessory_id = 1
      AND financing_term_id = 4
      AND is_active = 1
) AS is_available;
-- Resultado: 0 (NO disponible para 18 meses)
```

#### 11.5.3 Obtener todos los plazos disponibles para un periférico

```sql
SELECT
    ft.period_type,
    ft.period_count,
    ft.label,
    COALESCE(ata.tea_override, ft.default_tea) AS tea,
    ata.is_default
FROM accessory_term_availability ata
JOIN financing_term ft ON ft.id = ata.financing_term_id
WHERE ata.accessory_id = 1  -- Mouse Logitech
  AND ata.is_active = 1
  AND ft.is_active = 1
ORDER BY ft.display_order;

-- Resultado:
-- | period_type | period_count | label    | tea   | is_default |
-- |-------------|--------------|----------|-------|------------|
-- | monthly     | 6            | 6 meses  | 42.50 | 0          |
-- | monthly     | 12           | 12 meses | 42.50 | 1          |
-- | monthly     | 24           | 24 meses | 48.00 | 0          |
```

### 11.6 API de Periféricos

#### 11.6.1 Endpoint: Obtener Periféricos Compatibles

```
GET /api/v2/products/{productId}/accessories
?landing_id=5
&term_id=3
```

**Response:**

```json
{
  "product": {
    "id": 15,
    "name": "Lenovo LOQ 15IRX9"
  },
  "selected_term": {
    "id": 3,
    "label": "12 meses",
    "period_count": 12
  },
  "accessories": [
    {
      "id": 1,
      "sku": "LOG-G502",
      "name": "Mouse Logitech G502 HERO",
      "category": "mouse",
      "image_url": "/images/accessories/logitech-g502.jpg",
      "list_price": 180.00,
      "effective_price": 180.00,
      "monthly_payment": 15.00,
      "tea": 42.50,
      "is_recommended": true,
      "recommendation_reason": "Mouse gaming ideal para tu Lenovo LOQ",
      "promo": null
    },
    {
      "id": 2,
      "sku": "HP-BACKPACK-156",
      "name": "Mochila HP 15.6\"",
      "category": "backpack",
      "image_url": "/images/accessories/hp-backpack.jpg",
      "list_price": 89.00,
      "effective_price": 89.00,
      "monthly_payment": 8.00,
      "tea": 42.50,
      "is_recommended": false,
      "recommendation_reason": null,
      "promo": null
    },
    {
      "id": 3,
      "sku": "HYPERX-CLOUD-II",
      "name": "Audífonos HyperX Cloud II",
      "category": "headset",
      "image_url": "/images/accessories/hyperx-cloud.jpg",
      "list_price": 299.00,
      "effective_price": 249.00,
      "monthly_payment": 21.00,
      "tea": 42.50,
      "is_recommended": true,
      "recommendation_reason": "Audio inmersivo para gaming",
      "promo": {
        "tag": "-17%",
        "badge_color": "#ff4444"
      }
    }
  ],
  "unavailable_for_term": [
    {
      "id": 4,
      "name": "Teclado Mecánico Redragon",
      "reason": "No disponible para 12 meses",
      "available_terms": ["6 meses", "24 meses"]
    }
  ]
}
```

#### 11.6.2 Endpoint: Calcular Cuota Total

```
POST /api/v2/financing/calculate
```

**Request:**

```json
{
  "product_id": 15,
  "landing_id": 5,
  "term_id": 3,
  "initial_amount": 200,
  "accessory_ids": [1, 2]
}
```

**Response:**

```json
{
  "product": {
    "id": 15,
    "name": "Lenovo LOQ 15IRX9",
    "list_price": 3499.00,
    "initial_amount": 200.00,
    "financed_amount": 3299.00,
    "monthly_payment": 319.00,
    "tea": 42.50,
    "tcea": 48.20
  },
  "accessories": [
    {
      "id": 1,
      "name": "Mouse Logitech G502 HERO",
      "list_price": 180.00,
      "monthly_payment": 15.00
    },
    {
      "id": 2,
      "name": "Mochila HP 15.6\"",
      "list_price": 89.00,
      "monthly_payment": 8.00
    }
  ],
  "summary": {
    "term_months": 12,
    "initial_payment": 200.00,
    "product_monthly": 319.00,
    "accessories_monthly": 23.00,
    "total_monthly": 342.00,
    "total_amount": 4304.00,
    "breakdown": {
      "product_total": 3828.00,
      "accessories_total": 276.00,
      "initial": 200.00
    }
  }
}
```

### 11.7 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MODELO DE DATOS - PERIFÉRICOS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐         ┌──────────────────────────┐                          │
│  │   product    │         │       accessory          │                          │
│  │              │         │                          │                          │
│  │ id           │         │ id                       │                          │
│  │ sku          │         │ sku                      │                          │
│  │ name         │         │ name                     │                          │
│  │ list_price   │         │ list_price               │                          │
│  │ type         │◄────────│ category                 │                          │
│  └──────┬───────┘         └────────┬─────────────────┘                          │
│         │                          │                                            │
│         │                          │                                            │
│         ▼                          ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐                   │
│  │           accessory_product_compatibility                 │                   │
│  │                                                          │                   │
│  │  accessory_id ──────────────────────────────────────────►│                   │
│  │  product_id (nullable) ─────────────────────────────────►│                   │
│  │  product_type (si product_id es NULL)                    │                   │
│  │  is_recommended                                          │                   │
│  │  recommendation_reason                                   │                   │
│  └──────────────────────────────────────────────────────────┘                   │
│                                                                                 │
│         ┌──────────────────┐                                                    │
│         │  financing_term  │                                                    │
│         │                  │                                                    │
│         │ id               │                                                    │
│         │ period_type      │                                                    │
│         │ period_count     │                                                    │
│         │ default_tea      │                                                    │
│         └────────┬─────────┘                                                    │
│                  │                                                              │
│                  ▼                                                              │
│  ┌──────────────────────────────────────────────────────────┐                   │
│  │           accessory_term_availability                     │                   │
│  │                                                          │                   │
│  │  accessory_id ──────────────────────────────────────────►│                   │
│  │  financing_term_id ─────────────────────────────────────►│                   │
│  │  tea_override (opcional)                                 │                   │
│  │  is_default                                              │                   │
│  └──────────────────────────────────────────────────────────┘                   │
│                                                                                 │
│         ┌──────────────────┐                                                    │
│         │     landing      │                                                    │
│         │                  │                                                    │
│         │ id               │                                                    │
│         │ slug             │                                                    │
│         └────────┬─────────┘                                                    │
│                  │                                                              │
│                  ▼                                                              │
│  ┌──────────────────────────────────────────────────────────┐                   │
│  │           landing_accessory_visibility                    │                   │
│  │                                                          │                   │
│  │  landing_id ────────────────────────────────────────────►│                   │
│  │  accessory_id ──────────────────────────────────────────►│                   │
│  │  is_visible                                              │                   │
│  │  visible_from / visible_until                            │                   │
│  │  price_override                                          │                   │
│  │  tea_override                                            │                   │
│  │  promo_tag                                               │                   │
│  └──────────────────────────────────────────────────────────┘                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 11.8 Resumen de Tablas de Periféricos

| Tabla | Propósito | Registros Est. |
|-------|-----------|----------------|
| `accessory` (modificada) | Periféricos base con precio | ~50 |
| `accessory_term_availability` | Plazos disponibles por periférico | ~200 |
| `accessory_product_compatibility` | Compatibilidad producto-periférico | ~500 |
| `landing_accessory_visibility` | Visibilidad por landing | ~300 |

**Total: ~1,050 registros vs precálculo de todas las combinaciones**

---

## 12. Resumen de Todas las Tablas Propuestas

### 12.1 Para Pricing Dinámico (Sección 3)

| Tabla | Propósito | Registros Est. |
|-------|-----------|----------------|
| `product_initial_option` | Opciones de inicial por producto | ~1,000 |
| `financing_term` (mod) | Plazos mensuales y semanales | ~15 |
| `product_term_availability` | Plazos disponibles por producto | ~1,200 |

### 12.2 Para Visibilidad Granular (Sección 4)

| Tabla | Propósito | Registros Est. |
|-------|-----------|----------------|
| `landing_product_visibility` | Control granular por landing | ~2,000 |

### 12.3 Para Tracking Histórico (Sección 5)

| Tabla | Propósito | Registros Est. |
|-------|-----------|----------------|
| `product_catalog_snapshot` | Historial diario para analytics | ~60,000/año |

### 12.4 Para Ecommerce/Plataforma (Sección 10)

| Tabla | Propósito | Registros Est. |
|-------|-----------|----------------|
| `product_stock` | Stock por producto y ubicación | ~500 |
| `stock_movement` | Auditoría de movimientos | ~10,000/año |
| `product_reservation` | Reservas de productos aprobados | ~5,000/año |
| `notification_template` | Templates de notificaciones | ~50 |
| `notification` | Notificaciones enviadas | ~100,000/año |
| `notification_preference` | Preferencias por persona | ~10,000 |
| `component_definition` | Tipos de componentes UI | ~30 |
| `landing_component` | Componentes por landing+página | ~1,000 |
| `coupon` | Cupones de descuento | ~100 |
| `coupon_usage` | Uso de cupones | ~5,000/año |
| `saved_product` | Wishlist | ~20,000/año |

### 12.5 Para Periféricos con Temporalidad (Sección 11)

| Tabla | Propósito | Registros Est. |
|-------|-----------|----------------|
| `accessory` (modificada) | Periféricos base con precio y SKU | ~50 |
| `accessory_term_availability` | Plazos disponibles por periférico | ~200 |
| `accessory_product_compatibility` | Compatibilidad producto-periférico | ~500 |
| `landing_accessory_visibility` | Visibilidad por landing con fechas | ~300 |

### 12.6 Totales

| Categoría | Tablas Nuevas | Tablas Modificadas | Registros Est. |
|-----------|---------------|-------------------|----------------|
| Pricing Dinámico | 2 | 1 | ~2,215 |
| Visibilidad Granular | 1 | 0 | ~2,000 |
| Tracking Histórico | 1 | 0 | ~60,000/año |
| Ecommerce/Plataforma | 11 | 0 | ~152,000/año |
| Periféricos | 3 | 1 | ~1,050 |
| **TOTAL** | **18** | **2** | **~217,000** |

**Comparación con sistema actual:**

| Métrica | Antes (CPP) | Después |
|---------|-------------|---------|
| Registros de pricing | ~1,000,000+ | ~5,000 |
| Tiempo para cambiar precio | Minutos (regenerar) | Segundos (1 UPDATE) |
| Control por landing | No | Sí, con fechas |
| Periféricos por plazo | Precalculado | Dinámico + filtrado |
| Tracking histórico | No | Sí, snapshot diario |

---

## 13. Storytelling Completo por Módulo

### 13.1 ADMIN: Crear una Nueva Landing para UPN

**Contexto:**
El equipo comercial de BaldeCash acaba de cerrar un convenio con la Universidad Privada del Norte (UPN). Laura, la Product Manager, necesita crear una landing personalizada para esta institución.

---

**PASO 1: Crear la Landing Base**

Laura accede al panel de administración y crea una nueva landing:

```
→ INSERT INTO landing:
  - code: "upn-2026"
  - slug: "upn"
  - name: "Landing UPN 2026"
  - template_id: 2 (template "convenio-universidad")
  - agreement_id: 15 (convenio UPN recién creado)
  - institution_id: 8 (UPN)
  - status: "draft"
  - primary_color: "#00205B" (azul UPN)
  - secondary_color: "#FFB81C" (dorado UPN)

→ INSERT INTO landing_version:
  - landing_id: (nuevo)
  - version_number: 1
  - status: "draft"
  - staging_token: "abc123xyz" (generado automático)
  - name: "Versión inicial UPN"
```

Laura puede previsualizar en: `baldecash.pe/staging/abc123xyz`

---

**PASO 2: Configurar el Hero y Componentes**

Laura personaliza los componentes de la landing:

```
→ INSERT INTO landing_component (varios):

  -- Hero personalizado
  - landing_id: (UPN)
  - component_definition_id: 1 (hero_v1)
  - page_code: "home"
  - config: {
      "headline": "Tu laptop para triunfar en UPN",
      "subheadline": "Financiamiento exclusivo para estudiantes UPN",
      "hero_image": "/images/hero-upn.jpg",
      "cta_primary": "Ver laptops",
      "cta_secondary": "¿Cómo funciona?"
    }
  - display_order: 1

  -- Logos de instituciones (social proof)
  - component_definition_id: 8 (institution_logos)
  - config: { "show_upn_featured": true }
  - display_order: 2

  -- Productos destacados
  - component_definition_id: 5 (featured_grid)
  - config: { "max_products": 6, "show_promo_badge": true }
  - display_order: 3

  -- FAQ específico
  - component_definition_id: 9 (faq_accordion)
  - config: { "category_filter": "convenio-upn" }
  - display_order: 4
```

---

**PASO 3: Configurar Features de la Landing**

Laura habilita/deshabilita features específicos:

```
→ INSERT INTO landing_feature (varios):

  -- Habilitar simulador
  - landing_id: (UPN)
  - feature_id: 7 (show_simulator)
  - is_enabled: 1
  - config_style: "full"

  -- Habilitar chat (WhatsApp)
  - feature_id: 4 (enable_chat)
  - is_enabled: 1
  - config_url: "https://wa.me/51987654321?text=Hola,%20soy%20de%20UPN"

  -- Deshabilitar comparador (no aplica para convenios)
  - feature_id: 3 (show_compare)
  - is_enabled: 0

  -- Habilitar testimonios de estudiantes UPN
  - feature_id: 6 (show_testimonials)
  - is_enabled: 1
  - config_limit: 4
```

---

**PASO 4: Enviar a Revisión y Publicar**

Laura termina la configuración y envía a revisión:

```
→ UPDATE landing_version:
  - status: "pending_review"
  - submitted_at: NOW()
  - submitted_by: user_account.id (Laura)

→ INSERT INTO landing_change_log:
  - landing_id: (UPN)
  - version_id: 1
  - change_type: "update"
  - entity_type: "version"
  - entity_name: "Envío a revisión"
  - changed_by: (Laura)
```

El supervisor Pedro revisa y aprueba:

```
→ UPDATE landing_version:
  - status: "approved"
  - reviewed_at: NOW()
  - reviewed_by: user_account.id (Pedro)
  - review_notes: "Aprobado. Colores correctos, contenido ok."
```

Laura publica la landing:

```
→ UPDATE landing_version:
  - status: "published"
  - published_at: NOW()
  - published_by: user_account.id (Laura)

→ UPDATE landing:
  - current_version_id: 1
  - status: "published"

→ INSERT INTO landing_change_log:
  - change_type: "publish"
  - entity_type: "landing"
  - entity_name: "Publicación versión 1"
```

**La landing está disponible en:** `baldecash.pe/upn`

---

### 13.1.5 ADMIN: Configurar TEA por Convenio (agreement_term_rate)

**Contexto:**
Antes de publicar la landing UPN, Laura necesita configurar las tasas de interés (TEA) que aplicarán para los estudiantes de UPN. Los convenios determinan la TEA, y cada convenio puede tener diferentes tasas según el plazo de financiamiento.

---

**PASO 1: Revisar Plazos Disponibles**

Laura consulta los plazos de financiamiento activos en el sistema:

```sql
-- Plazos activos con sus TEAs por defecto
SELECT id, code, name, months, default_tea
FROM financing_term
WHERE is_active = 1
ORDER BY months;

-- Resultado:
-- | id | code    | name      | months | default_tea |
-- |----|---------|-----------|--------|-------------|
-- | 1  | 6M      | 6 meses   | 6      | 45.000      |
-- | 2  | 9M      | 9 meses   | 9      | 43.000      |
-- | 3  | 12M     | 12 meses  | 12     | 42.500      |
-- | 4  | 18M     | 18 meses  | 18     | 40.000      |
-- | 5  | 24M     | 24 meses  | 24     | 38.000      |
```

---

**PASO 2: Configurar TEA para Convenio UPN**

Laura accede a Admin → Convenios → UPN → Tasas por Plazo y configura:

```
→ INSERT INTO agreement_term_rate (varios):

  -- 6 meses: TEA 35% (menor que el 45% default)
  - agreement_id: 15 (convenio UPN)
  - financing_term_id: 1 (6 meses)
  - tea: 35.000
  - tcea: 38.500
  - is_default: 0
  - is_active: 1

  -- 9 meses: TEA 36%
  - agreement_id: 15
  - financing_term_id: 2 (9 meses)
  - tea: 36.000
  - tcea: 39.800
  - is_default: 0
  - is_active: 1

  -- 12 meses: TEA 38% (PLAZO POR DEFECTO)
  - agreement_id: 15
  - financing_term_id: 3 (12 meses)
  - tea: 38.000
  - tcea: 42.200
  - is_default: 1  ← Este es el plazo que se muestra primero
  - is_active: 1

  -- 18 meses: TEA 39%
  - agreement_id: 15
  - financing_term_id: 4 (18 meses)
  - tea: 39.000
  - tcea: 43.500
  - is_default: 0
  - is_active: 1

  -- 24 meses: TEA 40% (el más largo)
  - agreement_id: 15
  - financing_term_id: 5 (24 meses)
  - tea: 40.000
  - tcea: 45.000
  - is_default: 0
  - is_active: 1
```

---

**PASO 3: Comparar con Otros Convenios**

Laura verifica que las tasas de UPN sean competitivas:

```sql
-- Comparativa de TEA por convenio y plazo
SELECT
    a.name AS convenio,
    ft.months,
    atr.tea AS tea_convenio,
    ft.default_tea AS tea_default,
    (ft.default_tea - atr.tea) AS ahorro
FROM agreement_term_rate atr
JOIN agreement a ON a.id = atr.agreement_id
JOIN financing_term ft ON ft.id = atr.financing_term_id
WHERE a.id IN (15, 14) -- UPN y SENATI
  AND atr.is_active = 1
ORDER BY a.name, ft.months;

-- Resultado:
-- | convenio | months | tea_convenio | tea_default | ahorro |
-- |----------|--------|--------------|-------------|--------|
-- | SENATI   | 6      | 32.000       | 45.000      | 13.00  |
-- | SENATI   | 12     | 35.000       | 42.500      | 7.50   |
-- | SENATI   | 24     | 38.000       | 38.000      | 0.00   |
-- | UPN      | 6      | 35.000       | 45.000      | 10.00  |
-- | UPN      | 12     | 38.000       | 42.500      | 4.50   |
-- | UPN      | 24     | 40.000       | 38.000      | -2.00  |
```

Laura nota que SENATI tiene mejores tasas. Esto es intencional: SENATI es un convenio más antiguo con mejores condiciones negociadas.

---

**PASO 4: Verificar Jerarquía de TEA**

El sistema usa esta TEA automáticamente cuando un usuario accede a `baldecash.pe/upn`:

```javascript
// Pseudocódigo del backend al calcular cuotas
function getTea(landingId, productId, termId) {
  // 1. ¿Hay TEA override específico para este producto en esta landing?
  const lpv = getLandingProductVisibility(landingId, productId);
  if (lpv?.tea_override) return lpv.tea_override;

  // 2. ¿La landing tiene convenio? → Usar TEA del convenio
  const landing = getLanding(landingId); // landing UPN
  if (landing.agreement_id) {
    const agreementRate = getAgreementTermRate(landing.agreement_id, termId);
    if (agreementRate?.tea) return agreementRate.tea; // ← 38% para 12 meses UPN
  }

  // 3. ¿El producto tiene TEA especial para este plazo?
  const pta = getProductTermAvailability(productId, termId);
  if (pta?.tea_override) return pta.tea_override;

  // 4. TEA por defecto del plazo
  const term = getFinancingTerm(termId);
  return term.default_tea;
}
```

---

**Resultado Final:**

Cuando un estudiante de UPN ve la Lenovo LOQ a 12 meses:

```
Sin convenio: cuota = S/ 319/mes (TEA 42.5%)
Con convenio UPN: cuota = S/ 299/mes (TEA 38.0%)
                  ↳ Ahorro: S/ 20/mes = S/ 240 en total
```

---

### 13.2 ADMIN: Configurar la Vitrina de Productos

**Contexto:**
Es Enero 2026 y hay una promoción especial de verano. Diego, el encargado de catálogo, necesita configurar qué productos se muestran en cada landing con precios especiales.

---

**PASO 1: Revisar Productos Disponibles**

Diego consulta el catálogo actual:

```sql
-- Productos activos con stock disponible
SELECT
    p.id, p.sku, p.name, p.list_price,
    ps.quantity_available,
    COUNT(DISTINCT pta.financing_term_id) AS plazos_disponibles
FROM product p
JOIN product_stock ps ON ps.product_id = p.id
JOIN product_term_availability pta ON pta.product_id = p.id AND pta.is_active = 1
WHERE p.is_active = 1
  AND ps.quantity_available > 0
GROUP BY p.id
ORDER BY p.list_price;

-- Resultado:
-- | id | sku        | name                    | list_price | stock | plazos |
-- |----|------------|-------------------------|------------|-------|--------|
-- | 1  | LOQ-15IRX9 | Lenovo LOQ 15IRX9       | 3499.00    | 25    | 5      |
-- | 2  | HP-VIC16   | HP Victus 16            | 3299.00    | 18    | 5      |
-- | 3  | ACER-NIT5  | Acer Nitro 5            | 2799.00    | 32    | 5      |
-- | 4  | ASUS-TUF   | ASUS TUF Gaming F15     | 3899.00    | 12    | 4      |
```

---

**PASO 2: Configurar Visibilidad para Landing SENATI**

Diego configura qué productos se ven en SENATI con promociones de verano:

```
→ INSERT INTO landing_product_visibility (varios):

  -- Lenovo LOQ: Visible todo enero con TEA especial
  - landing_id: 5 (SENATI)
  - product_id: 1 (Lenovo LOQ)
  - is_visible: 1
  - is_featured: 1 (destacado)
  - display_order: 1
  - visible_from: "2026-01-01 00:00:00"
  - visible_until: "2026-01-31 23:59:59"
  - tea_override: 38.000 (TEA promocional, normalmente 42.5%)
  - promo_tag: "VERANO 2026"
  - promo_badge_color: "#22c55e"

  -- HP Victus: Visible con inicial cero obligatorio
  - product_id: 2 (HP Victus)
  - is_visible: 1
  - is_featured: 1
  - display_order: 2
  - visible_from: "2026-01-01 00:00:00"
  - visible_until: "2026-01-31 23:59:59"
  - min_initial_amount_override: 0
  - max_initial_amount_override: 0
  - promo_tag: "0% INICIAL"
  - promo_badge_color: "#4654CD"

  -- Acer Nitro: Visible solo primeros 15 días
  - product_id: 3 (Acer Nitro)
  - is_visible: 1
  - is_featured: 0
  - display_order: 3
  - visible_from: "2026-01-01 00:00:00"
  - visible_until: "2026-01-15 23:59:59"
  - promo_tag: "OFERTA FLASH"
  - promo_badge_color: "#ff4444"

  -- ASUS TUF: Oculto en SENATI (solo para UPN)
  - product_id: 4 (ASUS TUF)
  - is_visible: 0
```

---

**PASO 3: Configurar Opciones de Inicial por Producto**

Diego configura las opciones de inicial para Lenovo LOQ:

```
→ INSERT INTO product_initial_option:

  -- Sin inicial
  - product_id: 1 (Lenovo LOQ)
  - initial_amount: 0
  - is_default: 0
  - display_order: 1

  -- S/100 inicial
  - initial_amount: 100
  - is_default: 0
  - display_order: 2

  -- S/200 inicial (default)
  - initial_amount: 200
  - is_default: 1
  - display_order: 3

  -- S/500 inicial (descuento 2%)
  - initial_amount: 500
  - discount_percent: 2.00
  - is_default: 0
  - display_order: 4

  -- S/1000 inicial (descuento 5%)
  - initial_amount: 1000
  - discount_percent: 5.00
  - is_default: 0
  - display_order: 5
```

---

**PASO 4: Crear Snapshot para Analytics**

El sistema automáticamente guarda el estado del catálogo cada día:

```
→ Job diario INSERT INTO product_catalog_snapshot:

  - snapshot_date: "2026-01-01"
  - landing_id: 5 (SENATI)
  - product_id: 1 (Lenovo LOQ)
  - was_visible: 1
  - was_featured: 1
  - list_price: 3499.00
  - tea_applied: 38.000
  - sample_term_months: 12
  - sample_initial_amount: 200
  - sample_monthly_payment: 299
  - promo_tag: "VERANO 2026"

  -- (repite para cada producto visible en cada landing)
```

---

**PASO 5: Verificar Resultado**

Diego verifica cómo se ve el catálogo en SENATI:

```sql
-- Query que ejecuta el frontend
SELECT
    p.id, p.sku, p.name, p.list_price, b.name AS brand,
    lpv.is_featured, lpv.promo_tag, lpv.promo_badge_color,
    COALESCE(lpv.tea_override, 42.5) AS tea,
    -- Cuota calculada para 12 meses con inicial default
    CEIL((p.list_price - COALESCE(pio.initial_amount, 0)) * 1.12 / 12) AS monthly_payment
FROM product p
JOIN brand b ON b.id = p.brand_id
JOIN landing_product_visibility lpv ON lpv.product_id = p.id
LEFT JOIN product_initial_option pio ON pio.product_id = p.id AND pio.is_default = 1
WHERE lpv.landing_id = 5
  AND lpv.is_visible = 1
  AND NOW() BETWEEN lpv.visible_from AND lpv.visible_until
ORDER BY lpv.is_featured DESC, lpv.display_order;

-- Resultado para el 5 de enero:
-- | sku        | name            | price   | featured | promo_tag    | tea   | monthly |
-- |------------|-----------------|---------|----------|--------------|-------|---------|
-- | LOQ-15IRX9 | Lenovo LOQ      | 3499.00 | 1        | VERANO 2026  | 38.00 | 299     |
-- | HP-VIC16   | HP Victus 16    | 3299.00 | 1        | 0% INICIAL   | 42.50 | 308     |
-- | ACER-NIT5  | Acer Nitro 5    | 2799.00 | 0        | OFERTA FLASH | 42.50 | 261     |
```

---

### 13.3 ADMIN: Crear un Formulario Dinámico

**Contexto:**
BaldeCash está lanzando un nuevo flujo para colegios. Ana, la UX Designer, necesita crear un formulario específico con campos diferentes al flujo universitario.

---

**PASO 1: Definir los Pasos del Formulario**

Ana crea la estructura del formulario:

```
→ INSERT INTO form_step (nuevos pasos para colegios):

  -- Paso 1: Datos del Apoderado
  - code: "datos-apoderado"
  - name: "Datos del Apoderado"
  - description: "Información del padre/madre que solicita"
  - icon: "Users"
  - display_order: 1

  -- Paso 2: Datos del Estudiante
  - code: "datos-estudiante-colegio"
  - name: "Datos del Estudiante"
  - description: "Información del alumno"
  - icon: "GraduationCap"
  - display_order: 2

  -- Paso 3: Selección de Equipo
  - code: "seleccion-equipo"
  - name: "Elige tu Laptop"
  - description: "Selecciona el equipo y accesorios"
  - icon: "Laptop"
  - display_order: 3

  -- Paso 4: Confirmación
  - code: "confirmacion-colegio"
  - name: "Confirmar Solicitud"
  - description: "Revisa y envía"
  - icon: "CheckCircle"
  - display_order: 4
```

---

**PASO 2: Crear Campos del Formulario**

Ana define los campos maestros que usará:

```
→ INSERT INTO form_field (campos nuevos):

  -- Campo: Parentesco
  - code: "parentesco"
  - name: "Parentesco con el estudiante"
  - field_type: "select"
  - placeholder: "Selecciona tu relación"
  - is_required: 1
  - tooltip_text: "Indica tu relación con el alumno"

  -- Campo: Grado del estudiante
  - code: "grado-escolar"
  - name: "Grado que cursa"
  - field_type: "select"
  - placeholder: "Selecciona el grado"
  - is_required: 1

  -- Campo: Nombre del colegio
  - code: "nombre-colegio"
  - name: "Nombre del Colegio"
  - field_type: "text"
  - placeholder: "Ej: Colegio Santa María"
  - is_required: 1
  - autocomplete: "organization"
```

---

**PASO 3: Definir Opciones para Campos Select**

Ana crea las opciones para los campos:

```
→ INSERT INTO field_option:

  -- Opciones para Parentesco
  - field_id: (parentesco)
  - value: "padre"
  - label: "Padre"
  - display_order: 1

  - value: "madre"
  - label: "Madre"
  - display_order: 2

  - value: "tutor"
  - label: "Tutor Legal"
  - display_order: 3

  -- Opciones para Grado Escolar
  - field_id: (grado-escolar)
  - value: "1-primaria"
  - label: "1° Primaria"
  - display_order: 1
  -- ... (todos los grados)
  - value: "5-secundaria"
  - label: "5° Secundaria"
  - display_order: 11
```

---

**PASO 4: Configurar Validaciones**

Ana define las validaciones por campo:

```
→ INSERT INTO field_validation:

  -- DNI del apoderado: 8 dígitos
  - field_id: (documento-numero)
  - validation_type: "pattern"
  - validation_value: "^[0-9]{8}$"
  - error_message: "El DNI debe tener 8 dígitos"
  - display_order: 1

  -- Edad del estudiante: entre 6 y 17 años
  - field_id: (fecha-nacimiento-estudiante)
  - validation_type: "age_range"
  - validation_value: '{"min": 6, "max": 17}'
  - error_message: "El estudiante debe tener entre 6 y 17 años"

  -- Celular: formato peruano
  - field_id: (celular)
  - validation_type: "pattern"
  - validation_value: "^9[0-9]{8}$"
  - error_message: "Ingresa un celular válido (9 dígitos)"
```

---

**PASO 5: Crear Dependencias entre Campos**

Ana configura campos que aparecen condicionalmente:

```
→ INSERT INTO field_dependency:

  -- Mostrar "Documento de tutor" solo si parentesco = tutor
  - dependent_field_id: (documento-tutor)
  - depends_on_field_id: (parentesco)
  - condition_type: "equals"
  - condition_value: "tutor"
  - action: "show"

  -- Mostrar "Autorización legal" solo si parentesco = tutor
  - dependent_field_id: (documento-autorizacion)
  - depends_on_field_id: (parentesco)
  - condition_type: "equals"
  - condition_value: "tutor"
  - action: "require"
```

---

**PASO 6: Vincular Pasos y Campos a la Landing de Colegios**

Ana asigna los pasos y campos a la landing:

```
→ INSERT INTO landing_step:

  -- Paso 1 activo
  - landing_id: 10 (landing colegios)
  - form_step_id: (datos-apoderado)
  - is_enabled: 1
  - display_order: 1
  - estimated_time_seconds: 120

  -- Paso 2 activo
  - form_step_id: (datos-estudiante-colegio)
  - is_enabled: 1
  - display_order: 2
  - estimated_time_seconds: 90

  -- ... (todos los pasos)

→ INSERT INTO landing_field (campos por paso):

  -- Campos del paso 1
  - landing_step_id: (datos-apoderado)
  - form_field_id: (parentesco)
  - is_visible: 1
  - is_required: 1
  - display_order: 1

  - form_field_id: (documento-numero)
  - is_visible: 1
  - is_required: 1
  - display_order: 2
  - prefix: "DNI"

  -- ... (todos los campos)
```

---

**PASO 7: Probar el Formulario**

Ana genera una URL de staging para probar:

```
→ INSERT INTO landing_version:
  - landing_id: 10
  - status: "staging"
  - staging_token: "test-colegios-123"

URL de prueba: baldecash.pe/staging/test-colegios-123/solicitud
```

Ana navega por cada paso verificando:
- Los campos aparecen en el orden correcto ✓
- Las validaciones funcionan ✓
- Las dependencias muestran/ocultan campos ✓
- Los tooltips se muestran ✓

---

### 13.4 ADMIN: Configurar Periféricos con Temporalidad

**Contexto:**
Marcos, el encargado de accesorios, necesita configurar los periféricos para el lanzamiento de verano. Algunos periféricos solo estarán disponibles para ciertos plazos.

---

**PASO 1: Crear Nuevos Periféricos**

Marcos agrega un nuevo mouse gaming:

```
→ INSERT INTO accessory:
  - sku: "LOG-G502-HERO"
  - name: "Mouse Logitech G502 HERO"
  - short_name: "G502 HERO"
  - description: "Mouse gaming con sensor HERO 25K, 11 botones programables"
  - image_url: "/images/accessories/g502-hero.jpg"
  - brand_id: 5 (Logitech)
  - category: "mouse"
  - list_price: 189.00
  - is_recommended: 1
  - display_order: 1
```

---

**PASO 2: Configurar Plazos Disponibles**

Marcos define para qué plazos estará disponible el mouse:

```
→ INSERT INTO accessory_term_availability:

  -- Disponible para 6 meses
  - accessory_id: (G502)
  - financing_term_id: 1 (6 meses)
  - is_default: 0
  - is_active: 1

  -- Disponible para 12 meses (default)
  - financing_term_id: 3 (12 meses)
  - is_default: 1
  - is_active: 1

  -- Disponible para 24 meses
  - financing_term_id: 5 (24 meses)
  - is_default: 0
  - is_active: 1

  -- NO disponible para 18 meses (margen muy bajo)
  -- (simplemente no insertar registro)
```

El mouse tendrá cuotas de:
- 6 meses: S/ 35/mes
- 12 meses: S/ 18/mes
- 24 meses: S/ 10/mes

---

**PASO 3: Configurar Compatibilidad con Productos**

Marcos define qué laptops son compatibles:

```
→ INSERT INTO accessory_product_compatibility:

  -- Recomendado para laptops gaming específicas
  - accessory_id: (G502)
  - product_id: 1 (Lenovo LOQ)
  - is_recommended: 1
  - recommendation_reason: "Mouse gaming ideal para tu Lenovo LOQ"
  - display_order: 1

  - product_id: 2 (HP Victus)
  - is_recommended: 1
  - recommendation_reason: "Precisión perfecta para gaming"
  - display_order: 1

  - product_id: 4 (ASUS TUF)
  - is_recommended: 1
  - recommendation_reason: "El complemento perfecto para tu TUF"
  - display_order: 1

  -- Compatible con TODAS las laptops (no solo gaming)
  - accessory_id: (G502)
  - product_id: NULL
  - product_type: "laptop"
  - is_recommended: 0
  - display_order: 10
```

---

**PASO 4: Configurar Visibilidad por Landing**

Marcos configura promociones especiales por landing:

```
→ INSERT INTO landing_accessory_visibility:

  -- En SENATI: Mouse con descuento
  - landing_id: 5 (SENATI)
  - accessory_id: (G502)
  - is_visible: 1
  - is_featured: 1
  - display_order: 1
  - visible_from: "2026-01-01 00:00:00"
  - visible_until: "2026-01-31 23:59:59"
  - price_override: 159.00  -- Precio especial (normalmente 189)
  - promo_tag: "-16%"
  - promo_badge_color: "#ff4444"

  -- En UPN: Mouse precio normal, sin promoción
  - landing_id: 8 (UPN)
  - accessory_id: (G502)
  - is_visible: 1
  - is_featured: 0
  - display_order: 3
  -- Sin price_override = usa list_price normal

  -- En landing general: Oculto (solo para convenios)
  - landing_id: 1 (general)
  - accessory_id: (G502)
  - is_visible: 0
```

---

**PASO 5: Verificar Filtrado por Plazo**

Marcos verifica que el filtrado funciona correctamente:

```sql
-- Estudiante elige Lenovo LOQ con 18 meses en SENATI
-- ¿El mouse G502 debe aparecer?

SELECT a.name, a.list_price, ata.financing_term_id
FROM accessory a
JOIN accessory_term_availability ata ON ata.accessory_id = a.id
WHERE a.sku = 'LOG-G502-HERO'
  AND ata.financing_term_id = 4  -- 18 meses
  AND ata.is_active = 1;

-- Resultado: 0 filas
-- El mouse NO aparece porque no tiene 18 meses disponible ✓

-- Si elige 12 meses:
SELECT a.name, COALESCE(lav.price_override, a.list_price) AS price
FROM accessory a
JOIN accessory_term_availability ata ON ata.accessory_id = a.id AND ata.financing_term_id = 3
JOIN landing_accessory_visibility lav ON lav.accessory_id = a.id AND lav.landing_id = 5
WHERE a.sku = 'LOG-G502-HERO';

-- Resultado: G502 HERO, S/ 159 (con precio promocional) ✓
```

---

### 13.5 USUARIO: El Viaje Completo de Carlos (Actualizado)

**Contexto:**
Carlos es estudiante de 3er ciclo de Ingeniería de Sistemas en SENATI Arequipa. Necesita una laptop para sus cursos de programación. Es Enero 2026 y hay promociones de verano.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONTEXTO TÉCNICO: El Mismo Producto en Múltiples Landings                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  La Lenovo LOQ que Carlos verá está configurada en 4 landings diferentes:       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ LANDING         │ TEA     │ PROMO           │ VISIBLE HASTA       │      │   │
│  │─────────────────│─────────│─────────────────│─────────────────────│      │   │
│  │ Main (público)  │ 42.5%   │ ninguna         │ siempre             │      │   │
│  │ SENATI ← Carlos │ 38.0%   │ "VERANO 2026"   │ 31 enero 2026       │      │   │
│  │ UPN             │ 38.0%*  │ ninguna         │ siempre             │      │   │
│  │ TECSUP          │ (oculto)│ -               │ -                   │      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  * UPN usa TEA del convenio (agreement_term_rate), no tiene tea_override        │
│                                                                                 │
│  CUOTA MENSUAL (12 meses, S/200 inicial) según landing:                         │
│  - Main: S/ 319/mes (TEA 42.5%)                                                 │
│  - SENATI: S/ 299/mes (TEA 38.0%) ← Carlos paga S/20 menos por ser SENATI       │
│  - UPN: S/ 299/mes (TEA 38.0%)                                                  │
│                                                                                 │
│  Esto es posible gracias a landing_product_visibility + agreement_term_rate     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**DÍA 1 - 10:30 AM: Descubrimiento**

Carlos ve un post en el grupo de WhatsApp de su carrera:
> "🎓 Laptops para estudiantes SENATI - Desde S/199/mes 🔥 baldecash.pe/senati"

Hace clic en el link desde su celular.

```
→ INSERT INTO session:
  - uuid: "ses-carlos-001"
  - landing_id: 5 (SENATI)
  - landing_version_id: 12 (versión actual publicada)
  - traffic_source: "organic_social"
  - utm_source: "whatsapp"
  - utm_medium: "organic"
  - referrer_domain: "wa.me"
  - device_type: "mobile"
  - os: "Android 14"
  - browser: "Chrome Mobile 120"
  - screen_width: 412
  - screen_height: 915
  - ip_address: "181.65.xxx.xxx"
  - geo_city: "Arequipa"
  - geo_region: "Arequipa"
```

El sistema carga la landing de SENATI:

```
→ SELECT FROM landing WHERE slug = 'senati':
  - template_id: 2 (convenio-instituto)
  - agreement_id: 7 (convenio SENATI activo)
  - primary_color: "#E31837" (rojo SENATI)
  - status: "published"
  - current_version_id: 12

→ SELECT FROM landing_component WHERE landing_id = 5 AND version_id IS NULL:
  - Hero con headline "Tu laptop para dominar la tecnología"
  - Grid de productos destacados (3 laptops con promo)
  - Testimonios de estudiantes SENATI
  - FAQ específico de convenio
```

Carlos hace scroll por el home:

```
→ INSERT INTO page_view:
  - session_id: (Carlos)
  - path: "/"
  - step_code: "home"
  - time_on_page_ms: NULL (aún navegando)

→ INSERT INTO event_scroll (múltiples):
  - scroll_percent: 25, timestamp: +5s
  - scroll_percent: 50, timestamp: +12s
  - scroll_percent: 75, timestamp: +20s
```

Ve la sección de laptops destacadas con promociones:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TÉCNICO: ¿Cómo se generó esta vista del catálogo?                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. Backend recibe: GET /api/catalog?landing_id=5 (SENATI)                      │
│                                                                                 │
│  2. Obtiene TEA del convenio SENATI para plazo default (12 meses):              │
│     → SELECT tea FROM agreement_term_rate                                       │
│       WHERE agreement_id = 7 AND is_default = 1                                 │
│     → Resultado: tea = 35.0% (TEA SENATI 12 meses)                              │
│                                                                                 │
│  3. Pero el Lenovo LOQ tiene tea_override en landing_product_visibility:        │
│     → SELECT tea_override FROM landing_product_visibility                       │
│       WHERE landing_id = 5 AND product_id = 1                                   │
│     → Resultado: tea_override = 38.0% (PROMO VERANO, mayor prioridad)           │
│                                                                                 │
│  4. Calcula cuota de referencia (12 meses, inicial default S/200):              │
│     → calculateMonthlyPayment(3499, 200, 38.0, 12) = S/299/mes                  │
│                                                                                 │
│  5. Total queries: 3 queries, tiempo: ~15ms, cache hit: Redis 5min              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

→ Response del endpoint /api/catalog:

  | Lenovo LOQ     | S/3,499 | S/299/mes | "VERANO 2026" | TEA: 38% (lpv override) |
  | HP Victus 16   | S/3,299 | S/308/mes | "0% INICIAL"  | TEA: 35% (convenio)     |
  | Acer Nitro 5   | S/2,799 | S/261/mes | "OFERTA FLASH"| TEA: 35% (convenio)     |

  NOTA: Solo se calculó 1 cuota por producto (referencia).
        Las demás opciones se calculan cuando el usuario abre el detalle.
```

Carlos toca la card del Lenovo LOQ:

```
→ INSERT INTO event_product:
  - session_id: (Carlos)
  - product_id: 1 (Lenovo LOQ)
  - action: "view_card"
  - price_shown: 3499.00
  - monthly_shown: 299.00
  - promo_tag_shown: "VERANO 2026"
```

Pero está en clase. Cierra la app.

```
→ UPDATE session:
  - status: "abandoned"
  - max_step_reached: "home"
  - duration_seconds: 45
  - page_views: 1

→ INSERT INTO lead:
  - session_id: (Carlos)
  - landing_id: 5 (SENATI)
  - landing_version_id: 12
  - last_step_code: "home"
  - form_completion_percent: 0
  - quality_score: 15
  - temperature: "cold"
  - traffic_source: "organic_social"
  - interested_product_id: 1 (Lenovo LOQ - basado en event_product)
```

---

**DÍA 1 - 8:00 PM: Retorno y Exploración**

Carlos recuerda el sitio y busca "baldecash senati laptops" en Google.

```
→ INSERT INTO session:
  - uuid: "ses-carlos-002"
  - landing_id: 5
  - traffic_source: "organic_search"
  - utm_source: "google"
  - device_type: "desktop"  -- Ahora en su casa
  - screen_width: 1920

→ Sistema detecta mismo fingerprint:
  - previous_sessions: ["ses-carlos-001"]
  - is_returning_visitor: 1
```

Carlos navega al catálogo:

```
→ INSERT INTO page_view:
  - path: "/catalogo"
  - step_code: "catalogo"

→ INSERT INTO event_filter (múltiples):
  - filter_code: "brand", value: "lenovo"
  - filter_code: "price_max", value: "4000"
  - filter_code: "processor", value: "intel-core-i5"
```

Ve el Lenovo LOQ y hace clic en "Ver detalles":

```
→ INSERT INTO event_product:
  - product_id: 1
  - action: "view_detail"
  - source: "catalog_card"
```

Se abre el modal de detalle del producto:

```
→ INSERT INTO event_modal:
  - modal_name: "product_detail"
  - product_id: 1
  - action: "open"
```

Carlos explora las opciones de financiamiento:

```
→ INSERT INTO event_click:
  - element: "btn-simular"
  - context: '{"product_id": 1}'
```

El simulador muestra opciones calculadas dinámicamente:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TÉCNICO: Cálculo de opciones de financiamiento                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GET /api/products/1/payment-options?landing_id=5                               │
│                                                                                 │
│  PASO 1: Obtener plazos disponibles para este producto                          │
│  ─────────────────────────────────────────────────────                          │
│  → SELECT FROM product_term_availability WHERE product_id = 1 AND is_active = 1 │
│  → Plazos: [6M, 9M, 12M, 18M, 24M]                                               │
│                                                                                 │
│  PASO 2: Obtener opciones de inicial                                            │
│  ────────────────────────────────────                                           │
│  → SELECT FROM product_initial_option WHERE product_id = 1 ORDER BY display_order│
│  → Iniciales: [S/0, S/100, S/200*, S/500, S/1000]  (* = default)                │
│                                                                                 │
│  PASO 3: Obtener TEA por plazo (aplicando JERARQUÍA)                            │
│  ────────────────────────────────────────────────────                           │
│                                                                                 │
│  Para cada plazo, ejecuta getTea(landingId=5, productId=1, termId):             │
│                                                                                 │
│  │ Plazo │ Paso 1: lpv.tea_override │ Paso 2: agreement_term_rate │ TEA Final │ │
│  │───────│─────────────────────────│────────────────────────────│───────────│ │
│  │ 6M    │ 38.0% ✓ (promo verano)  │ (no se evalúa)             │ 38.0%     │ │
│  │ 9M    │ 38.0% ✓ (promo verano)  │ (no se evalúa)             │ 38.0%     │ │
│  │ 12M   │ 38.0% ✓ (promo verano)  │ (no se evalúa)             │ 38.0%     │ │
│  │ 18M   │ 38.0% ✓ (promo verano)  │ (no se evalúa)             │ 38.0%     │ │
│  │ 24M   │ 38.0% ✓ (promo verano)  │ (no se evalúa)             │ 38.0%     │ │
│                                                                                 │
│  NOTA: Como lpv.tea_override = 38% para Lenovo LOQ en SENATI,                   │
│        aplica el mismo TEA para todos los plazos (promo verano).                │
│        Sin el override, cada plazo tendría TEA diferente del convenio.          │
│                                                                                 │
│  PASO 4: Generar matriz de cuotas (5 plazos × 5 iniciales = 25 opciones)        │
│  ────────────────────────────────────────────────────────────────────────       │
│                                                                                 │
│  for (plazo of plazos) {                                                        │
│    for (inicial of iniciales) {                                                 │
│      cuota = calculateMonthlyPayment(3499, inicial, 38.0, plazo.months);        │
│    }                                                                            │
│  }                                                                              │
│                                                                                 │
│  Tiempo total: ~8ms (sin cache) / ~2ms (con cache)                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

→ Backend calcula (NO lee de tabla precalculada):

  calculateMonthlyPayment(3499, 200, 38.0, 6)  = S/ 570/mes
  calculateMonthlyPayment(3499, 200, 38.0, 12) = S/ 299/mes ← default
  calculateMonthlyPayment(3499, 200, 38.0, 24) = S/ 169/mes
  calculateMonthlyPayment(3499, 500, 38.0, 12) = S/ 272/mes

→ Response al frontend:
  {
    "product": {"name": "Lenovo LOQ", "price": 3499},
    "landing": {"name": "SENATI", "agreement": "Convenio SENATI"},
    "tea_source": "landing_product_visibility.tea_override",  // Transparencia
    "tea_note": "TEA promocional Verano 2026",
    "options": [
      {"term": 6,  "initial": 200, "tea": 38.0, "monthly": 570},
      {"term": 12, "initial": 200, "tea": 38.0, "monthly": 299, "is_default": true},
      {"term": 12, "initial": 500, "tea": 38.0, "monthly": 272, "discount": "9%"},
      {"term": 24, "initial": 200, "tea": 38.0, "monthly": 169}
    ],
    "comparison": {
      "without_promo": {"tea": 35.0, "monthly_12m": 289},  // TEA convenio normal
      "savings_monthly": 10,
      "savings_total": 120  // S/10 × 12 meses
    }
  }
```

Carlos elige 12 meses con S/200 inicial. El sistema muestra periféricos:

```
→ GET /api/v2/products/1/accessories?landing_id=5&term_id=3

→ Backend filtra periféricos:
  - Mouse G502: ✓ tiene 12 meses, compatible con LOQ, visible en SENATI
  - Mochila HP: ✓ tiene 12 meses, compatible con laptops, visible en SENATI
  - Teclado Mec: ✗ NO tiene 12 meses disponible

→ Response:
  {
    "accessories": [
      {"name": "Mouse G502", "price": 159, "monthly": 15, "promo": "-16%"},
      {"name": "Mochila HP", "price": 89, "monthly": 8}
    ],
    "unavailable_for_term": [
      {"name": "Teclado Mecánico", "available_terms": ["6m", "24m"]}
    ]
  }
```

Carlos selecciona el mouse. El sistema calcula cuota total:

```
→ POST /api/v2/financing/calculate
  {
    "product_id": 1,
    "term_id": 3,
    "initial_amount": 200,
    "accessory_ids": [1]  // Mouse G502
  }

→ Response:
  {
    "product_monthly": 299,
    "accessories_monthly": 15,
    "total_monthly": 314,
    "total_amount": 3968  // (314 × 12) + 200
  }
```

Carlos hace clic en "Solicitar ahora":

```
→ INSERT INTO event_click:
  - element: "btn-solicitar"
  - context: '{"product_id": 1, "accessories": [1], "term": 12, "initial": 200}'

→ INSERT INTO page_view:
  - path: "/solicitud/datos-personales"
  - step_code: "datos-personales"

→ INSERT INTO event_form:
  - step_code: "datos-personales"
  - action: "start"
```

---

**DÍA 1 - 8:15 PM: Llenando el Formulario**

Carlos comienza a llenar el formulario. El sistema carga la configuración:

```
→ SELECT campos para landing SENATI, paso "datos-personales":

  | Campo            | Tipo   | Required | Prellenado |
  |------------------|--------|----------|------------|
  | tipo_documento   | select | Sí       | "dni"      |
  | documento_numero | text   | Sí       | -          |
  | nombres          | text   | Sí       | -          |
  | apellido_paterno | text   | Sí       | -          |
  | apellido_materno | text   | Sí       | -          |
  | fecha_nacimiento | date   | Sí       | -          |
  | celular          | tel    | Sí       | -          |
  | email            | email  | Sí       | -          |
```

Carlos llena cada campo:

```
→ INSERT INTO event_input (por cada campo):

  - field_code: "documento_numero"
    value_length: 8
    time_to_fill_ms: 1200
    validation_errors: 0
    changes_count: 1

  - field_code: "nombres"
    value_length: 6  // "Carlos"
    time_to_fill_ms: 800
    validation_errors: 0

  - field_code: "email"
    value_length: 24  // "carlos.quispe@gmail.com"
    time_to_fill_ms: 2500
    changes_count: 2  // Corrigió un typo
    validation_errors: 1  // Error temporal mientras escribía
```

Carlos termina el paso 1 y continúa:

```
→ INSERT INTO event_form:
  - step_code: "datos-personales"
  - action: "submit_success"
  - time_on_step_ms: 45000

→ UPDATE lead:
  - email: "carlos.quispe@gmail.com"
  - phone: "954123456"
  - document_number: "71234567"
  - first_name: "Carlos"
  - last_name: "Quispe Mamani"
  - form_completion_percent: 25
  - quality_score: 45
  - temperature: "warm"
```

En el paso 2 (Centro de Estudios), varios campos vienen prellenados:

```
→ SELECT campos para landing SENATI, paso "centro-estudios":

  | Campo          | Prellenado                    |
  |----------------|-------------------------------|
  | institucion    | "SENATI" (bloqueado)          |
  | sede           | "Arequipa" (detectado por IP) |
  | carrera        | (dropdown con carreras SENATI)|
  | ciclo          | (dropdown 1-10)               |
  | codigo_alumno  | (opcional)                    |
```

Carlos selecciona su carrera y ciclo rápidamente:

```
→ INSERT INTO event_input:
  - field_code: "carrera", value: "ing-sistemas"
  - field_code: "ciclo", value: "3"

→ INSERT INTO event_form:
  - step_code: "centro-estudios"
  - action: "submit_success"
  - time_on_step_ms: 15000  // Mucho más rápido por prellenado

→ UPDATE lead:
  - institution_id: 3 (SENATI)
  - career: "Ingeniería de Sistemas"
  - form_completion_percent: 50
  - quality_score: 65
```

Pero Carlos se da cuenta que necesita una foto de su carnet de estudiante.

```
→ INSERT INTO event_form:
  - step_code: "documentos"
  - action: "abandon"
  - abandon_reason: "missing_document"

→ UPDATE session:
  - status: "idle"
  - max_step_reached: "documentos"
  - last_activity_at: NOW()

→ UPDATE lead:
  - last_step_code: "documentos"
  - form_completion_percent: 60
  - quality_score: 70
  - temperature: "hot"
  - priority: "high"
```

---

**DÍA 2 - 9:00 AM: Recuperación Automática**

El sistema ejecuta el job de scoring y recuperación:

```
→ SELECT leads hot con abandono reciente:
  - Carlos: quality_score=70, temperature=hot, abandoned_at=ayer 8:20pm

→ lead_score_rule aplicadas:
  + 15 pts: tiene_email
  + 15 pts: tiene_telefono
  + 10 pts: tiene_documento
  + 10 pts: institucion_con_convenio
  + 15 pts: llegó_paso_documentos
  + 10 pts: tiempo_sitio > 5min
  + 5 pts: seleccionó_producto
  = 80 pts total

→ UPDATE lead:
  - quality_score: 80
  - priority: "urgent"
```

El sistema dispara campaña de recuperación:

```
→ SELECT lead_recovery_campaign activas para leads "hot":
  - campaign: "recovery-hot-24h"
  - channel: "whatsapp"
  - template: "Hola {{nombre}}, tu {{producto}} te espera..."

→ INSERT INTO lead_campaign_send:
  - lead_id: (Carlos)
  - campaign_id: 3
  - channel: "whatsapp"
  - recipient: "51954123456"
  - message_body: "¡Hola Carlos! Tu Lenovo LOQ te espera. Completa tu solicitud y obtén tu laptop con cuotas desde S/314/mes. Continúa aquí: https://baldecash.pe/r/abc123"
  - scheduled_at: NOW() + 1 hora
  - status: "scheduled"

→ (1 hora después) WhatsApp enviado via API Twilio

→ UPDATE lead_campaign_send:
  - status: "delivered"
  - delivered_at: NOW()
```

---

**DÍA 2 - 10:30 AM: Carlos Completa la Solicitud**

Carlos recibe el WhatsApp y hace clic en el link.

```
→ INSERT INTO session:
  - uuid: "ses-carlos-003"
  - landing_id: 5
  - traffic_source: "whatsapp"
  - utm_source: "recovery"
  - utm_campaign: "recovery-hot-24h"
  - recovery_link_id: "abc123"

→ UPDATE lead_campaign_send:
  - status: "clicked"
  - clicked_at: NOW()

→ Sistema restaura datos guardados de Carlos:
  - Formulario muestra paso "documentos" con datos anteriores prellenados
```

Carlos sube su carnet de estudiante:

```
→ INSERT INTO event_input:
  - field_code: "carnet_estudiante"
  - field_type: "file"
  - file_name: "carnet.jpg"
  - file_size_kb: 245

→ INSERT INTO person_document:
  - person_id: (Carlos, creado o encontrado por DNI)
  - document_type_id: 5 (carnet_estudiante)
  - file_url: "s3://baldecash/docs/71234567/carnet_abc123.jpg"
  - status: "pending_review"
  - uploaded_at: NOW()
```

Carlos avanza al paso de confirmación:

```
→ Vista resumen muestra:

  ┌─────────────────────────────────────────────────────────────┐
  │                    RESUMEN DE TU SOLICITUD                  │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  Producto: Lenovo LOQ 15IRX9                                │
  │  Precio: S/ 3,499.00                                        │
  │                                                             │
  │  Accesorio: Mouse Logitech G502 HERO (-16%)                 │
  │  Precio: S/ 159.00                                          │
  │                                                             │
  │  ─────────────────────────────────────────────────────────  │
  │                                                             │
  │  Inicial: S/ 200.00                                         │
  │  Plazo: 12 meses                                            │
  │  Cuota mensual: S/ 314.00                                   │
  │  TEA: 38.00% (Promo SENATI Verano)                          │
  │                                                             │
  │  Total a pagar: S/ 3,968.00                                 │
  │                                                             │
  │  [  ] Acepto los términos y condiciones                     │
  │  [  ] Autorizo consulta en centrales de riesgo              │
  │                                                             │
  │              [ CONFIRMAR SOLICITUD ]                        │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

Carlos acepta y confirma:

```
→ INSERT INTO event_click:
  - element: "btn-confirmar-solicitud"

→ INSERT INTO person (si no existe):
  - document_type: "dni"
  - document_number: "71234567"
  - first_name: "Carlos"
  - last_name: "Quispe Mamani"
  - birth_date: "2003-05-15"
  - email: "carlos.quispe@gmail.com"
  - phone: "954123456"

→ INSERT INTO application:
  - person_id: (Carlos)
  - session_id: "ses-carlos-003"
  - landing_id: 5 (SENATI)
  - landing_version_id: 12
  - agreement_id: 7 (convenio SENATI)
  - status: "submitted"
  - requested_amount: 3658.00  // 3499 + 159
  - initial_amount: 200.00
  - requested_term: 12
  - monthly_payment: 314.00
  - tea: 38.00
  - submission_ip: "181.65.xxx.xxx"
  - submitted_at: NOW()

→ INSERT INTO application_product:
  - application_id: (nueva)
  - product_id: 1 (Lenovo LOQ)
  - product_type: "main"
  - quantity: 1
  - unit_price: 3499.00

  - product_id: (Mouse G502 - como accesorio)
  - product_type: "accessory"
  - quantity: 1
  - unit_price: 159.00

→ INSERT INTO application_status_log:
  - application_id: (nueva)
  - from_status: NULL
  - to_status: "submitted"
  - changed_by: NULL (sistema)
  - notes: "Solicitud enviada por usuario"

→ UPDATE session:
  - status: "converted"
  - application_id: (nueva)
  - conversion_type: "application_submitted"

→ UPDATE lead:
  - status: "converted"
  - converted_at: NOW()
  - application_id: (nueva)
  - form_completion_percent: 100

→ INSERT INTO product_reservation:
  - product_id: 1 (Lenovo LOQ)
  - application_id: (nueva)
  - quantity: 1
  - status: "pending"
  - expires_at: NOW() + 48 horas

→ UPDATE product_stock:
  - quantity_reserved: quantity_reserved + 1

→ INSERT INTO stock_movement:
  - product_id: 1
  - movement_type: "reserve"
  - quantity: -1
  - reference_type: "application"
  - reference_id: (nueva aplicación)

→ INSERT INTO notification:
  - person_id: (Carlos)
  - template_id: 1 (application_submitted)
  - channel: "email"
  - recipient: "carlos.quispe@gmail.com"
  - subject: "¡Recibimos tu solicitud! - BaldeCash"
  - status: "pending"
```

Carlos ve la página de confirmación:

```
→ INSERT INTO page_view:
  - path: "/solicitud/confirmacion"
  - step_code: "confirmacion"

→ Página muestra:

  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │                         🎉 ¡Yeeee!                          │
  │                                                             │
  │        Recibimos tu solicitud correctamente                 │
  │                                                             │
  │   Tu número de solicitud: SOL-2026-00001234                 │
  │                                                             │
  │   📧 Te enviamos un correo de confirmación                  │
  │   📱 Te contactaremos por WhatsApp en máximo 24 horas       │
  │                                                             │
  │   ¿Qué sigue?                                               │
  │   1. Validamos tus documentos                               │
  │   2. Evaluamos tu solicitud                                 │
  │   3. Te contactamos con la respuesta                        │
  │   4. ¡Recibe tu laptop en tu casa!                          │
  │                                                             │
  │   [ Compartir en WhatsApp ]  [ Volver al inicio ]           │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

---

**DÍA 2 - 3:00 PM: Evaluación y Aprobación**

La analista María revisa la solicitud de Carlos:

```
→ UPDATE application:
  - status: "under_review"
  - assigned_to: user_account.id (María)

→ INSERT INTO application_status_log:
  - from_status: "submitted"
  - to_status: "under_review"
  - changed_by: (María)

→ Sistema consulta Equifax automáticamente:
  - person_id: (Carlos)
  - score: 720
  - risk_category: "B"
  - current_debt: 1500.00
  - delinquency_count: 0

→ INSERT INTO person_equifax_history:
  - score: 720
  - risk_category: "B"
  - response_raw: { ... }
```

María valida documentos y aprueba:

```
→ UPDATE person_document:
  - status: "approved"
  - reviewed_by: (María)
  - reviewed_at: NOW()

→ UPDATE application:
  - status: "approved"
  - approved_amount: 3658.00
  - approved_term: 12
  - approved_rate: 38.00
  - final_monthly_payment: 314.00
  - evaluated_by: (María)
  - evaluated_at: NOW()

→ UPDATE product_reservation:
  - status: "confirmed"

→ INSERT INTO notification:
  - template_id: 2 (application_approved)
  - channel: "whatsapp"
  - body: "¡Felicidades Carlos! 🎉 Tu solicitud fue APROBADA..."
```

---

**DÍA 5: Desembolso y Entrega**

Carlos firma contrato digital y se programa entrega:

```
→ UPDATE application:
  - status: "disbursed"
  - contract_signed_at: NOW()
  - disbursement_date: NOW()

→ INSERT INTO loan:
  - application_id: (Carlos)
  - person_id: (Carlos)
  - principal_amount: 3458.00  // 3658 - 200 inicial
  - initial_amount: 200.00
  - total_amount: 3768.00
  - tea: 38.00
  - term_months: 12
  - monthly_payment: 314.00
  - first_due_date: "2026-02-05"
  - status: "active"

→ INSERT INTO loan_schedule (12 cuotas):
  - cuota 1: due_date "2026-02-05", amount 314.00, status "pending"
  - cuota 2: due_date "2026-03-05", amount 314.00, status "pending"
  - ... (10 cuotas más)

→ UPDATE product_reservation:
  - status: "fulfilled"
  - fulfilled_at: NOW()

→ INSERT INTO stock_movement:
  - movement_type: "sale"
  - quantity: -1
  - reference_type: "loan"

→ INSERT INTO notification:
  - template_id: 5 (delivery_scheduled)
  - body: "¡Tu Lenovo LOQ está en camino! Llegará el 7 de enero..."
```

Carlos recibe su laptop y comienza a pagar sus cuotas. ✓

---

### 13.6 Diagrama del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO COMPLETO DEL USUARIO                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  DESCUBRIMIENTO                    EXPLORACIÓN                     SOLICITUD            │
│  ─────────────                     ───────────                     ─────────            │
│                                                                                         │
│  [WhatsApp] ──► [Landing] ──► [Catálogo] ──► [Detalle] ──► [Simulador] ──► [Form]      │
│       │             │             │              │              │            │          │
│       ▼             ▼             ▼              ▼              ▼            ▼          │
│   session       page_view    event_filter  event_product  event_modal   event_form     │
│   (created)     (home)       (brand:hp)    (view_detail)  (simulador)   (start)        │
│                                                                                         │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ABANDONO                          RECUPERACIÓN                    CONVERSIÓN           │
│  ────────                          ────────────                    ──────────           │
│                                                                                         │
│  [Cierra app] ──► [Lead creado] ──► [Scoring] ──► [WhatsApp] ──► [Retorna] ──► [Envía] │
│       │               │                 │             │             │            │      │
│       ▼               ▼                 ▼             ▼             ▼            ▼      │
│   session:         lead:           lead_score    campaign_    session:      application │
│   abandoned        temp:cold       rules         send         converted     created     │
│                    score:25        applied       delivered                              │
│                                    score:80                                             │
│                                                                                         │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                         │
│  EVALUACIÓN                        APROBACIÓN                      DESEMBOLSO           │
│  ──────────                        ──────────                      ──────────           │
│                                                                                         │
│  [Analista] ──► [Equifax] ──► [Validación] ──► [Aprobado] ──► [Contrato] ──► [Entrega] │
│       │             │              │               │              │             │       │
│       ▼             ▼              ▼               ▼              ▼             ▼       │
│   application   equifax_       document:       application:    loan:        stock:      │
│   under_review  history        approved        approved        created      fulfilled   │
│                 created                                                                 │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 13.6.5 TÉCNICO: Visibilidad Multi-Landing, Cuotas en Listado y Performance

#### ¿Cómo se maneja que un producto sea visible para N landings?

**Mecanismo: `landing_product_visibility`**

Un producto puede ser visible en múltiples landings simultáneamente. Cada registro en `landing_product_visibility` define la visibilidad de un producto en UNA landing específica:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PRODUCTO: Lenovo LOQ (product_id: 1)                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  landing_product_visibility registros:                                          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ landing_id: 1 (Main)    │ is_visible: 1 │ is_featured: 1 │ TEA: null    │   │
│  │ visible_from: siempre   │ visible_until: siempre         │ promo: null  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ landing_id: 5 (SENATI)  │ is_visible: 1 │ is_featured: 1 │ TEA: 38%     │   │
│  │ visible_from: 01-ene    │ visible_until: 31-ene          │ promo: VERANO│   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ landing_id: 6 (UPN)     │ is_visible: 1 │ is_featured: 0 │ TEA: null    │   │
│  │ visible_from: siempre   │ visible_until: siempre         │ promo: null  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ landing_id: 7 (TECSUP)  │ is_visible: 0  ← OCULTO EN TECSUP              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Cada landing tiene su propia configuración:**
- Fechas de visibilidad diferentes
- TEA override diferente
- Orden de display diferente
- Promociones diferentes

**Query para administrar:**
```sql
-- Ver en qué landings está visible un producto
SELECT
    l.name AS landing,
    lpv.is_visible,
    lpv.is_featured,
    lpv.visible_from,
    lpv.visible_until,
    lpv.tea_override,
    lpv.promo_tag
FROM landing_product_visibility lpv
JOIN landing l ON l.id = lpv.landing_id
WHERE lpv.product_id = 1  -- Lenovo LOQ
ORDER BY l.name;

-- Ver qué productos están visibles en una landing AHORA
SELECT COUNT(*)
FROM landing_product_visibility
WHERE landing_id = 5
  AND is_visible = 1
  AND NOW() BETWEEN COALESCE(visible_from, '1900-01-01')
                AND COALESCE(visible_until, '2099-12-31');
```

---

#### ¿Cómo se muestran las cuotas al listar los equipos?

**Estrategia: Calcular cuota "de referencia" en backend**

Al listar productos en el catálogo, NO calculamos todas las combinaciones posibles. Mostramos UNA cuota de referencia usando el **plazo por defecto** e **inicial por defecto**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CATÁLOGO - Vista Grid                                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ [IMG]               │  │ [IMG]               │  │ [IMG]               │      │
│  │                     │  │                     │  │                     │      │
│  │ Lenovo LOQ          │  │ HP Victus 16        │  │ Acer Nitro 5        │      │
│  │ S/ 3,499            │  │ S/ 3,299            │  │ S/ 2,799            │      │
│  │                     │  │                     │  │                     │      │
│  │ Desde S/ 299/mes    │  │ Desde S/ 279/mes    │  │ Desde S/ 239/mes    │      │
│  │ └─ 12 cuotas        │  │ └─ 12 cuotas        │  │ └─ 12 cuotas        │      │
│  │                     │  │                     │  │                     │      │
│  │ [Ver detalles]      │  │ [Ver detalles]      │  │ [Ver detalles]      │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**La cuota mostrada es calculada así:**

```javascript
// Backend: GET /api/catalog?landing_id=5
function getCatalogProducts(landingId) {
  // 1. Obtener configuración de la landing
  const landing = getLanding(landingId);

  // 2. Obtener plazo por defecto (para mostrar "Desde X/mes")
  const defaultTerm = landing.agreement_id
    ? getDefaultTermForAgreement(landing.agreement_id)  // agreement_term_rate.is_default = 1
    : getSystemDefaultTerm();                           // financing_term.is_default = 1

  // 3. Query de productos visibles
  const products = db.query(`
    SELECT
        p.id, p.sku, p.name, p.list_price,
        b.name AS brand,
        lpv.is_featured, lpv.promo_tag, lpv.promo_badge_color,
        COALESCE(pio.initial_amount, 0) AS default_initial,
        ? AS term_months,
        ? AS tea
    FROM product p
    JOIN brand b ON b.id = p.brand_id
    JOIN landing_product_visibility lpv ON lpv.product_id = p.id
    LEFT JOIN product_initial_option pio ON pio.product_id = p.id AND pio.is_default = 1
    WHERE lpv.landing_id = ?
      AND lpv.is_visible = 1
      AND NOW() BETWEEN COALESCE(lpv.visible_from, '1900-01-01')
                    AND COALESCE(lpv.visible_until, '2099-12-31')
    ORDER BY lpv.is_featured DESC, lpv.display_order
  `, [defaultTerm.months, defaultTerm.tea, landingId]);

  // 4. Calcular cuota de referencia para cada producto
  return products.map(p => ({
    ...p,
    reference_payment: calculateMonthlyPayment(
      p.list_price,
      p.default_initial,
      p.tea,
      p.term_months
    )
  }));
}
```

**El cálculo detallado ocurre EN EL DETALLE del producto:**

Cuando el usuario hace clic en "Ver detalles", ENTONCES calculamos todas las combinaciones:
- Todos los plazos disponibles
- Todas las opciones de inicial
- Cada combinación con su TEA correspondiente

```javascript
// Backend: GET /api/products/:id/payment-options?landing_id=5
function getPaymentOptions(productId, landingId) {
  const landing = getLanding(landingId);
  const product = getProduct(productId);
  const initials = getProductInitialOptions(productId);
  const terms = getAvailableTerms(productId, landingId);

  // Generar matriz de opciones
  const options = [];
  for (const term of terms) {
    const tea = getTea(landingId, productId, term.id);  // Jerarquía de TEA
    for (const initial of initials) {
      options.push({
        term_months: term.months,
        initial_amount: initial.amount,
        tea: tea,
        monthly_payment: calculateMonthlyPayment(
          product.list_price,
          initial.amount,
          tea,
          term.months
        )
      });
    }
  }
  return options;  // ~25-50 combinaciones (5 plazos × 5-10 iniciales)
}
```

---

#### ¿No volvería lento el endpoint?

**Respuesta corta: NO, porque:**

1. **El cálculo es O(1) por producto** - Una multiplicación/división, ~0.001ms
2. **No hay explosión combinatoria** - Solo calculamos UNA cuota por producto en el listado
3. **Query optimizado** - Índices en `(landing_id, is_visible)` y `(product_id, is_default)`

**Análisis de performance:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  COMPARATIVA: Precálculo vs Cálculo Dinámico                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ANTES (Tabla CPP precalculada):                                                │
│  ─────────────────────────────────                                              │
│  Query: SELECT * FROM cpp WHERE landing=? AND product IN (...)                  │
│  Filas escaneadas: ~3,000 (filtrar de 45,000+)                                  │
│  Tiempo: ~50-100ms                                                              │
│  Problema: Mantenimiento costoso, cache invalidation complejo                   │
│                                                                                 │
│  AHORA (Cálculo dinámico):                                                      │
│  ─────────────────────────────                                                  │
│  Query: SELECT ... FROM product JOIN lpv WHERE landing=? AND is_visible=1       │
│  Filas escaneadas: ~30-50 (solo productos visibles)                             │
│  Cálculo: 30 × 0.001ms = 0.03ms                                                 │
│  Tiempo total: ~10-20ms                                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Estrategias de optimización adicionales:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  OPTIMIZACIÓN POR CAPAS                                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. ÍNDICES EN BD (obligatorio)                                                 │
│     ────────────────────────────                                                │
│     - landing_product_visibility (landing_id, is_visible, visible_from)         │
│     - product_initial_option (product_id, is_default)                           │
│     - agreement_term_rate (agreement_id, is_default)                            │
│                                                                                 │
│  2. CACHE EN BACKEND (recomendado)                                              │
│     ───────────────────────────────                                             │
│     Redis cache por landing:                                                    │
│     - Key: "catalog:landing:{id}:v{version}"                                    │
│     - TTL: 5 minutos                                                            │
│     - Invalidar cuando: landing_product_visibility cambia                       │
│                                                                                 │
│  3. CACHE HTTP (CDN/Vercel)                                                     │
│     ────────────────────────                                                    │
│     - Cache-Control: public, max-age=300, stale-while-revalidate=60             │
│     - Vary: landing-id                                                          │
│     - Purge on: webhook de admin                                                │
│                                                                                 │
│  4. LAZY LOADING EN FRONTEND                                                    │
│     ──────────────────────────                                                  │
│     - Cargar primeros 6 productos inmediato                                     │
│     - Cargar resto on scroll (intersection observer)                            │
│     - Skeleton loaders para UX                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Ejemplo de cache en backend (NestJS/Express):**

```typescript
// Backend: catalog.service.ts
@Injectable()
class CatalogService {
  constructor(private redis: RedisService) {}

  async getCatalog(landingId: number): Promise<CatalogProduct[]> {
    const cacheKey = `catalog:landing:${landingId}`;

    // 1. Intentar cache
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Query + cálculo
    const products = await this.queryVisibleProducts(landingId);
    const catalog = products.map(p => ({
      ...p,
      reference_payment: this.calculatePayment(p)
    }));

    // 3. Guardar en cache (5 min)
    await this.redis.setex(cacheKey, 300, JSON.stringify(catalog));

    return catalog;
  }

  // Invalidar cuando admin cambia visibilidad
  async invalidateCache(landingId: number) {
    await this.redis.del(`catalog:landing:${landingId}`);
  }
}
```

**Benchmark esperado:**

| Escenario | Sin cache | Con cache Redis | Con cache CDN |
|-----------|-----------|-----------------|---------------|
| 30 productos | 15-25ms | 2-5ms | <1ms |
| 50 productos | 25-35ms | 2-5ms | <1ms |
| 100 productos | 40-60ms | 3-6ms | <1ms |

**Conclusión:** El cálculo dinámico es MÁS rápido que el precálculo porque:
- Query más simple (menos JOINs)
- Menos filas a escanear
- Cache más efectivo (invalidación simple)
- Sin explosión combinatoria

---

### 13.7 Referencia Cruzada: Todas las Tablas por Módulo de Administración

Esta tabla muestra DÓNDE se configura cada tabla en el panel de administración y en qué storytelling se menciona.

#### CORE - Configuración Base

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `institution` | Admin → Instituciones | 13.1, 13.5 | Crear/editar instituciones educativas |
| `institution_campus` | Admin → Instituciones → Sedes | 13.5 | Agregar sedes por institución |
| `career` | Admin → Instituciones → Carreras | 13.5 | Configurar carreras disponibles |
| `agreement` | Admin → Convenios | 13.1, 13.2 | Crear convenios con TEA especial, vigencia |
| `user_account` | Admin → Usuarios | 13.1, 13.5 | Gestión de usuarios internos |

#### PRODUCTS - Catálogo de Productos

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `category` | Admin → Productos → Categorías | - | Crear categorías (laptop, celular, etc.) |
| `brand` | Admin → Productos → Marcas | 13.2, 13.4 | Gestionar marcas disponibles |
| `product` | Admin → Productos → Catálogo | 13.2, 13.5 | Crear/editar productos con precios |
| `spec_definition` | Admin → Productos → Especificaciones | - | Definir specs disponibles (RAM, procesador) |
| `spec_product_type` | Admin → Productos → Especificaciones | - | Asociar specs a tipos de producto |
| `product_spec_value` | Admin → Productos → [Producto] → Specs | 13.2 | Valores de specs por producto |
| `tag` | Admin → Productos → Etiquetas | - | Crear tags (gaming, oferta, nuevo) |
| `product_tag` | Admin → Productos → [Producto] → Tags | 13.2 | Asignar tags a productos |
| `product_image` | Admin → Productos → [Producto] → Galería | 13.2 | Subir imágenes del producto |
| `accessory` | Admin → Productos → Accesorios | 13.4 | Gestionar periféricos |
| `accessory_product_type` | Admin → Accesorios → Compatibilidad | 13.4 | Tipos de producto compatibles |
| `insurance` | Admin → Productos → Seguros | - | Configurar seguros opcionales |
| `combo` | Admin → Productos → Combos | - | Crear paquetes producto+accesorios |
| `combo_item` | Admin → Combos → [Combo] → Items | - | Agregar items al combo |

#### LANDING CONFIGURATION - Configuración de Landings

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `landing_template` | Admin → Landings → Templates | 13.1 | Crear templates reutilizables |
| `landing` | Admin → Landings | 13.1, 13.2 | Crear/editar landings |
| `landing_inheritance` | Admin → Landings → [Landing] → Herencia | 13.1 | Configurar herencia de template |
| `feature_definition` | Admin → Landings → Features Disponibles | 13.1 | Catálogo de features |
| `landing_feature` | Admin → Landings → [Landing] → Features | 13.1 | Habilitar/deshabilitar features |
| `landing_promotion` | Admin → Landings → [Landing] → Promociones | 13.2 | Banners promocionales |
| `landing_product` | (Deprecated → usar visibility) | 13.2 | Reemplazado por landing_product_visibility |
| `landing_accessory` | (Deprecated → usar visibility) | 13.4 | Reemplazado por landing_accessory_visibility |
| `landing_insurance` | Admin → Landings → [Landing] → Seguros | - | Seguros disponibles por landing |
| `promotion` | Admin → Marketing → Promociones | 13.2 | Catálogo de promociones |
| `landing_product_promotion` | Admin → Landings → [Landing] → Promos | 13.2 | Vincular promos a productos |
| `home_component` | (Deprecated → usar landing_component) | 13.1 | Reemplazado por landing_component |
| `landing_version` | Admin → Landings → [Landing] → Versiones | 13.1 | Workflow staging/producción |
| `landing_change_log` | Admin → Landings → [Landing] → Historial | 13.1 | Auditoría de cambios |

#### FORM BUILDER - Constructor de Formularios

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `form_step` | Admin → Formularios → Pasos | 13.3 | Crear pasos del formulario |
| `form_field` | Admin → Formularios → Campos | 13.3 | Definir campos maestros |
| `form_field_group` | Admin → Formularios → Grupos | 13.3 | Agrupar campos relacionados |
| `landing_step` | Admin → Landings → [Landing] → Formulario | 13.3 | Pasos habilitados por landing |
| `landing_field` | Admin → Landings → [Landing] → Campos | 13.3 | Campos visibles por landing |
| `field_validation` | Admin → Formularios → [Campo] → Validaciones | 13.3 | Reglas de validación |
| `field_option` | Admin → Formularios → [Campo] → Opciones | 13.3 | Opciones de selects/radios |
| `field_dependency` | Admin → Formularios → [Campo] → Dependencias | 13.3 | Campos condicionales |

#### CATALOG & FILTERS - Filtros del Catálogo

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `filter_definition` | Admin → Catálogo → Filtros | 13.2 | Definir filtros disponibles |
| `filter_value` | Admin → Catálogo → [Filtro] → Valores | 13.2 | Valores del filtro |
| `landing_filter` | Admin → Landings → [Landing] → Filtros | 13.2 | Filtros habilitados por landing |
| `sort_option` | Admin → Catálogo → Ordenamiento | - | Opciones de ordenar por... |

#### EVENT TRACKING - Tracking Automático (No configurable)

| Tabla | Origen | Storytelling | Descripción |
|-------|--------|--------------|-------------|
| `session` | Automático | 13.5 | Se crea al entrar a la landing |
| `page_view` | Automático | 13.5 | Se crea al navegar |
| `event_scroll` | Automático | 13.5 | Tracking de scroll |
| `event_click` | Automático | 13.5 | Tracking de clics |
| `event_hover` | Automático | - | Tracking de hover |
| `event_input` | Automático | 13.5 | Interacción con inputs |
| `event_filter` | Automático | 13.5 | Uso de filtros |
| `event_product` | Automático | 13.5 | Interacción con productos |
| `event_modal` | Automático | 13.5 | Apertura de modales |
| `event_form` | Automático | 13.5 | Progreso del formulario |
| `event_navigation` | Automático | - | Navegación entre páginas |
| `event_error` | Automático | - | Errores de validación |
| `event_custom` | Automático | - | Eventos personalizados |
| `traffic_source_config` | Admin → Marketing → Fuentes | 13.5 | Configurar fuentes de tráfico |

#### PERSON & APPLICATION - Personas y Solicitudes

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `person` | CRM → Personas | 13.5 | Creado al completar datos |
| `person_contact_history` | CRM → [Persona] → Historial Contacto | 13.5 | Historial de emails/teléfonos |
| `person_address_history` | CRM → [Persona] → Historial Direcciones | 13.5 | Historial de direcciones |
| `person_academic_history` | CRM → [Persona] → Historial Académico | 13.5 | Historial de estudios |
| `person_employment_history` | CRM → [Persona] → Historial Laboral | 13.5 | Historial de trabajos |
| `person_financial_history` | CRM → [Persona] → Historial Financiero | 13.5 | Historial de datos financieros |
| `person_equifax_history` | CRM → [Persona] → Consultas Equifax | 13.5 | Historial de consultas |
| `person_reference` | CRM → [Persona] → Referencias | 13.5 | Referencias personales |
| `document_type` | Admin → Documentos → Tipos | 13.5 | Catálogo de tipos de documento |
| `person_document` | CRM → [Persona] → Documentos | 13.5 | Documentos subidos |
| `application` | CRM → Solicitudes | 13.5 | Solicitudes de crédito |
| `application_product` | CRM → [Solicitud] → Productos | 13.5 | Productos de la solicitud |
| `application_document` | CRM → [Solicitud] → Documentos | 13.5 | Documentos requeridos |
| `application_status_log` | CRM → [Solicitud] → Historial | 13.5 | Log de cambios de estado |

#### LEADS - Gestión de Leads

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `lead` | CRM → Leads | 13.5 | Lead generado de sesión abandonada |
| `lead_score_rule` | Admin → Leads → Reglas de Scoring | 13.5 | Configurar scoring |
| `lead_interaction` | CRM → [Lead] → Interacciones | 13.5 | Llamadas, emails, WhatsApp |
| `lead_recovery_campaign` | Marketing → Campañas Recuperación | 13.5 | Crear campañas de recovery |
| `lead_campaign_status` | Marketing → [Campaña] → Estados | 13.5 | Estados objetivo |
| `lead_campaign_landing` | Marketing → [Campaña] → Landings | 13.5 | Landings objetivo |
| `lead_campaign_source` | Marketing → [Campaña] → Fuentes | 13.5 | Fuentes objetivo |
| `lead_campaign_send` | Marketing → [Campaña] → Envíos | 13.5 | Log de envíos |

#### MARKETING - Campañas y Preaprobados

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `preapproved_customer` | Marketing → Preaprobados | - | Clientes preaprobados |
| `preapproved_product` | Marketing → [Preaprobado] → Productos | - | Productos permitidos |
| `preapproved_landing` | Marketing → [Preaprobado] → Landings | - | Landings donde aplica |
| `preapproved_import` | Marketing → Preaprobados → Importar | - | Log de importaciones |
| `marketing_campaign` | Marketing → Campañas | - | Campañas de marketing |
| `campaign_preapproved_status` | Marketing → [Campaña] → Segmentación | - | Filtro por estado |
| `campaign_risk_category` | Marketing → [Campaña] → Segmentación | - | Filtro por riesgo |
| `campaign_source` | Marketing → [Campaña] → Segmentación | - | Filtro por fuente |
| `campaign_institution` | Marketing → [Campaña] → Segmentación | - | Filtro por institución |
| `campaign_agreement` | Marketing → [Campaña] → Segmentación | - | Filtro por convenio |
| `marketing_campaign_send` | Marketing → [Campaña] → Envíos | - | Log de envíos |
| `referral_program` | Marketing → Programas Referidos | - | Configurar programas |
| `referral` | CRM → Referidos | - | Referidos individuales |

#### LOAN - Préstamos

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `loan` | Cobranza → Préstamos | 13.5 | Préstamos activos |
| `loan_schedule` | Cobranza → [Préstamo] → Cronograma | 13.5 | Cuotas del préstamo |
| `loan_payment` | Cobranza → [Préstamo] → Pagos | 13.5 | Pagos realizados |
| `loan_status_history` | Cobranza → [Préstamo] → Historial | 13.5 | Estados del préstamo |

#### ACTIVATION - Activaciones Presenciales

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `activation_promoter` | Activaciones → Promotores | - | Gestionar promotores |
| `activation_period` | Activaciones → Períodos | - | Crear períodos de activación |
| `activation_event` | Activaciones → Eventos | - | Programar eventos |
| `activation_lead` | Activaciones → Leads | - | Leads capturados |
| `activation_result` | Activaciones → [Lead] → Resultado | - | Resultado de cada lead |
| `activation_period_summary` | Activaciones → [Período] → Resumen | - | Dashboard del período |

#### NUEVAS TABLAS PROPUESTAS (Este documento)

| Tabla | Panel Admin | Storytelling | Descripción |
|-------|-------------|--------------|-------------|
| `agreement_term_rate` | Admin → Convenios → [Convenio] → Tasas | 2.4, 13.2 | **TEA por convenio+plazo** |
| `product_initial_option` | Admin → Productos → [Producto] → Iniciales | 13.2 | Opciones de inicial |
| `financing_term` | Admin → Finanzas → Plazos | 13.2, 13.4 | Plazos disponibles |
| `product_term_availability` | Admin → Productos → [Producto] → Plazos | 13.2 | Plazos por producto |
| `landing_product_visibility` | Admin → Landings → [Landing] → Vitrina | 13.2, 13.5 | Visibilidad granular |
| `product_catalog_snapshot` | Automático (Job diario) | 13.2, 13.5 | Snapshot para analytics |
| `product_stock` | Admin → Inventario → Stock | 13.5 | Stock por producto |
| `stock_movement` | Admin → Inventario → Movimientos | 13.5 | Auditoría de stock |
| `product_reservation` | CRM → [Solicitud] → Reserva | 13.5 | Reservas de productos |
| `notification_template` | Admin → Notificaciones → Templates | 13.5 | Templates de mensajes |
| `notification` | CRM → [Persona] → Notificaciones | 13.5 | Mensajes enviados |
| `notification_preference` | CRM → [Persona] → Preferencias | 13.5 | Preferencias de canal |
| `component_definition` | Admin → Landings → Componentes | 13.1 | Tipos de componentes UI |
| `landing_component` | Admin → Landings → [Landing] → Layout | 13.1 | Componentes de la landing |
| `coupon` | Marketing → Cupones | - | Códigos de descuento |
| `coupon_usage` | Marketing → Cupones → Usos | - | Log de uso de cupones |
| `saved_product` | Automático (Usuario) | - | Wishlist del usuario |
| `accessory_term_availability` | Admin → Accesorios → [Accesorio] → Plazos | 13.4 | Plazos por accesorio |
| `accessory_product_compatibility` | Admin → Accesorios → Compatibilidad | 13.4 | Compatibilidad con productos |
| `landing_accessory_visibility` | Admin → Landings → [Landing] → Accesorios | 13.4 | Visibilidad de accesorios |

---

## 14. Script SQL - CREATE de Base de Datos Completa

### 14.1 Instrucciones de Uso

```sql
-- Ejecutar en orden:
-- 1. Primero las tablas base (sin FKs a otras tablas)
-- 2. Luego las tablas con FKs
-- 3. Finalmente los datos iniciales

-- Nomenclatura:
-- - Nombres en inglés, snake_case, singular
-- - FKs: {tabla_referenciada}_id
-- - Booleanos: is_, has_, can_
-- - Timestamps: _at
-- - Fechas: _date
-- - Montos: _amount
-- - Tasas: _rate
-- - Porcentajes: _percent
```

### 14.2 Tablas CORE

```sql
-- =====================================================
-- CORE MODULE
-- =====================================================

CREATE TABLE `institution` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT 'Código interno único',
  `name` VARCHAR(200) NOT NULL,
  `short_name` VARCHAR(50),
  `type` ENUM('university', 'institute', 'school', 'other') NOT NULL,
  `logo_url` VARCHAR(500),
  `website_url` VARCHAR(500),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_institution_code` (`code`),
  KEY `idx_institution_type` (`type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `institution_campus` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(300),
  `city` VARCHAR(100),
  `region` VARCHAR(100),
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),
  `is_main` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_campus_institution` (`institution_id`),
  KEY `idx_campus_city` (`city`),

  CONSTRAINT `fk_campus_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `career` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(30),
  `name` VARCHAR(200) NOT NULL,
  `faculty` VARCHAR(200),
  `duration_semesters` TINYINT UNSIGNED,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_career_institution` (`institution_id`),

  CONSTRAINT `fk_career_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_account` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'analyst', 'sales', 'support', 'viewer') NOT NULL,
  `phone` VARCHAR(20),
  `avatar_url` VARCHAR(500),
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`),
  KEY `idx_user_role` (`role`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `agreement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `type` ENUM('marco', 'especifico', 'temporal') DEFAULT 'marco',
  `max_amount` DECIMAL(10,2) COMMENT 'Monto máximo financiable',
  `min_initial_percent` DECIMAL(5,2) COMMENT 'Porcentaje mínimo de inicial',
  `valid_from` DATE NOT NULL,
  `valid_until` DATE,
  `contact_name` VARCHAR(150),
  `contact_email` VARCHAR(254),
  `contact_phone` VARCHAR(20),
  `notes` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agreement_code` (`code`),
  KEY `idx_agreement_institution` (`institution_id`),
  KEY `idx_agreement_valid` (`is_active`, `valid_from`, `valid_until`),

  CONSTRAINT `fk_agreement_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_agreement_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TEA por convenio + plazo (LOS CONVENIOS DETERMINAN LA TEA)
CREATE TABLE `agreement_term_rate` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agreement_id` BIGINT UNSIGNED NOT NULL,
  `financing_term_id` BIGINT UNSIGNED NOT NULL,
  `tea` DECIMAL(6,3) NOT NULL COMMENT 'TEA para este convenio+plazo',
  `tcea` DECIMAL(6,3) COMMENT 'TCEA informativo',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo por defecto para este convenio',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agreement_term` (`agreement_id`, `financing_term_id`),
  KEY `idx_atr_term` (`financing_term_id`),

  CONSTRAINT `fk_atr_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_atr_term` FOREIGN KEY (`financing_term_id`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.3 Tablas PRODUCTS

```sql
-- =====================================================
-- PRODUCTS MODULE
-- =====================================================

CREATE TABLE `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(50),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`code`),
  UNIQUE KEY `uk_category_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `brand` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `logo_url` VARCHAR(500),
  `website_url` VARCHAR(500),
  `description` TEXT,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_brand_code` (`code`),
  UNIQUE KEY `uk_brand_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `short_name` VARCHAR(80),
  `slug` VARCHAR(100) NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `brand_id` BIGINT UNSIGNED NOT NULL,
  `model` VARCHAR(100),
  `description` TEXT,
  `short_description` VARCHAR(300),
  `list_price` DECIMAL(10,2) NOT NULL COMMENT 'Precio de venta',
  `cost_price` DECIMAL(10,2) COMMENT 'Precio de costo',
  `msrp` DECIMAL(10,2) COMMENT 'Precio sugerido fabricante',
  `warranty_months` TINYINT UNSIGNED DEFAULT 12,
  `weight_kg` DECIMAL(6,3),
  `is_new` TINYINT(1) DEFAULT 1,
  `is_refurbished` TINYINT(1) DEFAULT 0,
  `condition_grade` ENUM('A', 'B', 'C') COMMENT 'Para reacondicionados',
  `meta_title` VARCHAR(70),
  `meta_description` VARCHAR(160),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_sku` (`sku`),
  UNIQUE KEY `uk_product_slug` (`slug`),
  KEY `idx_product_category` (`category_id`, `is_active`),
  KEY `idx_product_brand` (`brand_id`, `is_active`),
  KEY `idx_product_price` (`list_price`),
  KEY `idx_product_active` (`is_active`, `display_order`),

  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spec_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'ram, processor, storage, etc.',
  `name` VARCHAR(100) NOT NULL,
  `data_type` ENUM('text', 'number', 'boolean', 'select') DEFAULT 'text',
  `unit` VARCHAR(20) COMMENT 'GB, GHz, pulgadas',
  `is_filterable` TINYINT(1) DEFAULT 0 COMMENT 'Usar como filtro en catálogo',
  `is_comparable` TINYINT(1) DEFAULT 1 COMMENT 'Mostrar en comparador',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spec_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spec_product_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `spec_definition_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `is_required` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spec_category` (`spec_definition_id`, `category_id`),

  CONSTRAINT `fk_spt_spec` FOREIGN KEY (`spec_definition_id`) REFERENCES `spec_definition` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_spt_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_spec_value` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `spec_definition_id` BIGINT UNSIGNED NOT NULL,
  `value_text` VARCHAR(500),
  `value_number` DECIMAL(12,4),
  `value_boolean` TINYINT(1),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_spec` (`product_id`, `spec_definition_id`),
  KEY `idx_psv_spec` (`spec_definition_id`),

  CONSTRAINT `fk_psv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_psv_spec` FOREIGN KEY (`spec_definition_id`) REFERENCES `spec_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `color` CHAR(7) DEFAULT '#4654CD',
  `is_visible` TINYINT(1) DEFAULT 1 COMMENT 'Mostrar en frontend',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_tag` (`product_id`, `tag_id`),

  CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_image` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(200),
  `is_primary` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pi_product` (`product_id`, `display_order`),

  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `accessory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `short_name` VARCHAR(50),
  `description` TEXT,
  `image_url` VARCHAR(500),
  `brand_id` BIGINT UNSIGNED,
  `category` ENUM('mouse', 'keyboard', 'headset', 'backpack', 'stand', 'charger', 'protector', 'hub', 'webcam', 'microphone', 'other') NOT NULL,
  `list_price` DECIMAL(10,2) NOT NULL COMMENT 'Precio de venta del periférico',
  `is_recommended` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accessory_sku` (`sku`),
  KEY `idx_accessory_category` (`category`, `is_active`),
  KEY `idx_accessory_brand` (`brand_id`),

  CONSTRAINT `fk_accessory_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `accessory_product_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_apt` (`accessory_id`, `category_id`),

  CONSTRAINT `fk_apt_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apt_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `insurance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `coverage_description` TEXT,
  `monthly_rate` DECIMAL(5,4) COMMENT 'Porcentaje mensual sobre monto',
  `fixed_monthly_amount` DECIMAL(10,2) COMMENT 'Monto fijo mensual',
  `provider` VARCHAR(100),
  `terms_url` VARCHAR(500),
  `is_recommended` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_insurance_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `combo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `discount_type` ENUM('percent', 'fixed') DEFAULT 'percent',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `valid_from` DATE,
  `valid_until` DATE,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_combo_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `combo_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `combo_id` BIGINT UNSIGNED NOT NULL,
  `item_type` ENUM('product', 'accessory', 'insurance') NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `quantity` TINYINT UNSIGNED DEFAULT 1,
  `is_required` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_combo_item` (`combo_id`, `item_type`, `item_id`),

  CONSTRAINT `fk_ci_combo` FOREIGN KEY (`combo_id`) REFERENCES `combo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.4 Tablas FINANCE

```sql
-- =====================================================
-- FINANCE MODULE
-- =====================================================

CREATE TABLE `financing_term` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_type` ENUM('monthly', 'weekly') NOT NULL DEFAULT 'monthly',
  `period_count` SMALLINT UNSIGNED NOT NULL COMMENT 'Cantidad: 12 meses, 52 semanas',
  `label` VARCHAR(50) NOT NULL COMMENT '12 meses, 1 año, 52 semanas',
  `label_short` VARCHAR(20) COMMENT '12m, 1a, 52s',
  `default_tea` DECIMAL(6,3) NOT NULL COMMENT 'TEA por defecto para este plazo',
  `default_tcea` DECIMAL(6,3),
  `interest_multiplier` DECIMAL(5,4) DEFAULT 1.0000 COMMENT 'Factor sobre precio base',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Mostrar destacado en UI',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_term_period` (`period_type`, `period_count`),
  KEY `idx_term_active` (`is_active`, `period_type`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_initial_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `initial_amount` DECIMAL(10,2) NOT NULL COMMENT 'Monto fijo: 0, 100, 200, 500, 1200',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Opción mostrada por defecto',
  `discount_percent` DECIMAL(5,2) DEFAULT 0 COMMENT 'Descuento adicional por dar inicial',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_initial` (`product_id`, `initial_amount`),
  KEY `idx_pio_active` (`product_id`, `is_active`, `display_order`),

  CONSTRAINT `fk_pio_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_term_availability` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `financing_term_id` BIGINT UNSIGNED NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo mostrado por defecto para este producto',
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial para este producto+plazo (NULL = usar default)',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_term` (`product_id`, `financing_term_id`),
  KEY `idx_pta_active` (`product_id`, `is_active`),

  CONSTRAINT `fk_pta_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pta_term` FOREIGN KEY (`financing_term_id`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `accessory_term_availability` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `financing_term_id` BIGINT UNSIGNED NOT NULL,
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial para este periférico+plazo (NULL = usar default del plazo)',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo por defecto para mostrar',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accessory_term` (`accessory_id`, `financing_term_id`),
  KEY `idx_ata_active` (`accessory_id`, `is_active`),
  KEY `idx_ata_term` (`financing_term_id`),

  CONSTRAINT `fk_ata_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ata_term` FOREIGN KEY (`financing_term_id`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `accessory_product_compatibility` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED COMMENT 'NULL = compatible con todos los productos del tipo',
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto') COMMENT 'Tipo de producto si product_id es NULL',
  `is_recommended` TINYINT(1) DEFAULT 0 COMMENT 'Recomendado para este producto específico',
  `recommendation_reason` VARCHAR(200) COMMENT 'Ej: "Perfecto para gaming"',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accessory_product` (`accessory_id`, `product_id`),
  KEY `idx_apc_product` (`product_id`),
  KEY `idx_apc_type` (`product_type`, `is_active`),

  CONSTRAINT `fk_apc_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apc_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.5 Tablas LANDING CONFIGURATION

```sql
-- =====================================================
-- LANDING CONFIGURATION MODULE
-- =====================================================

CREATE TABLE `landing_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `type` ENUM('public', 'agreement', 'campaign', 'event') NOT NULL,
  `default_config` JSON,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL COMMENT 'URL path: /senati, /upn',
  `name` VARCHAR(150) NOT NULL,
  `template_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,
  `institution_id` BIGINT UNSIGNED,
  `primary_color` CHAR(7) DEFAULT '#4654CD',
  `secondary_color` CHAR(7) DEFAULT '#03DBD0',
  `logo_override_url` VARCHAR(500),
  `favicon_url` VARCHAR(500),
  `current_version_id` BIGINT UNSIGNED COMMENT 'Versión publicada actual',
  `status` ENUM('draft', 'staging', 'published', 'archived') DEFAULT 'draft',
  `meta_title` VARCHAR(70),
  `meta_description` VARCHAR(160),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_code` (`code`),
  UNIQUE KEY `uk_landing_slug` (`slug`),
  KEY `idx_landing_template` (`template_id`),
  KEY `idx_landing_agreement` (`agreement_id`),
  KEY `idx_landing_status` (`status`, `is_active`),

  CONSTRAINT `fk_landing_template` FOREIGN KEY (`template_id`) REFERENCES `landing_template` (`id`),
  CONSTRAINT `fk_landing_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_landing_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_landing_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_version` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_number` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100),
  `status` ENUM('draft', 'staging', 'pending_review', 'approved', 'published', 'archived') DEFAULT 'draft',
  `staging_token` VARCHAR(50) COMMENT 'Token para URL de staging',
  `config_snapshot` JSON COMMENT 'Snapshot de toda la config al publicar',
  `submitted_at` TIMESTAMP NULL,
  `submitted_by` BIGINT UNSIGNED,
  `reviewed_at` TIMESTAMP NULL,
  `reviewed_by` BIGINT UNSIGNED,
  `review_notes` TEXT,
  `published_at` TIMESTAMP NULL,
  `published_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_version` (`landing_id`, `version_number`),
  KEY `idx_lv_status` (`status`),
  KEY `idx_lv_staging` (`staging_token`),

  CONSTRAINT `fk_lv_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lv_submitted` FOREIGN KEY (`submitted_by`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_lv_reviewed` FOREIGN KEY (`reviewed_by`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_lv_published` FOREIGN KEY (`published_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar FK de landing a landing_version (circular reference)
ALTER TABLE `landing` ADD CONSTRAINT `fk_landing_version`
  FOREIGN KEY (`current_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL;

CREATE TABLE `landing_inheritance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `parent_landing_id` BIGINT UNSIGNED COMMENT 'NULL si hereda de template',
  `inherit_from_template` TINYINT(1) DEFAULT 1,
  `inherit_products` TINYINT(1) DEFAULT 1,
  `inherit_features` TINYINT(1) DEFAULT 1,
  `inherit_forms` TINYINT(1) DEFAULT 1,
  `inherit_components` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_li_landing` (`landing_id`),

  CONSTRAINT `fk_li_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_li_parent` FOREIGN KEY (`parent_landing_id`) REFERENCES `landing` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feature_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `category` ENUM('display', 'interaction', 'marketing', 'support', 'analytics') NOT NULL,
  `config_schema` JSON COMMENT 'JSON Schema de configuración',
  `default_config` JSON,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feature_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_feature` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `feature_definition_id` BIGINT UNSIGNED NOT NULL,
  `is_enabled` TINYINT(1) DEFAULT 1,
  `config` JSON COMMENT 'Configuración específica',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lf_landing_feature` (`landing_id`, `feature_definition_id`),

  CONSTRAINT `fk_lf_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lf_feature` FOREIGN KEY (`feature_definition_id`) REFERENCES `feature_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_product_visibility` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Destacado en esta landing',
  `display_order` INT DEFAULT 0,
  `visible_from` DATETIME COMMENT 'Visible desde esta fecha',
  `visible_until` DATETIME COMMENT 'Visible hasta esta fecha',
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial para este landing',
  `min_initial_amount_override` DECIMAL(10,2) COMMENT 'Inicial mínimo override',
  `max_initial_amount_override` DECIMAL(10,2) COMMENT 'Inicial máximo override',
  `allowed_term_ids` JSON COMMENT 'Array de financing_term_id permitidos',
  `default_term_id_override` BIGINT UNSIGNED COMMENT 'Plazo por defecto en esta landing',
  `promo_tag` VARCHAR(50) COMMENT 'Badge: OFERTA, NUEVO, -20%, EXCLUSIVO',
  `promo_badge_color` CHAR(7) DEFAULT '#ff4444',
  `promo_message` VARCHAR(200) COMMENT 'Mensaje promocional en card',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_product` (`landing_id`, `product_id`),
  KEY `idx_lpv_visible` (`landing_id`, `is_visible`),
  KEY `idx_lpv_dates` (`visible_from`, `visible_until`),
  KEY `idx_lpv_featured` (`landing_id`, `is_featured`, `display_order`),

  CONSTRAINT `fk_lpv_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lpv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lpv_default_term` FOREIGN KEY (`default_term_id_override`) REFERENCES `financing_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_accessory_visibility` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `visible_from` DATETIME,
  `visible_until` DATETIME,
  `price_override` DECIMAL(10,2) COMMENT 'Precio especial en esta landing',
  `tea_override` DECIMAL(6,3) COMMENT 'TEA especial en esta landing',
  `promo_tag` VARCHAR(50) COMMENT 'GRATIS, -20%, COMBO',
  `promo_badge_color` CHAR(7),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_accessory` (`landing_id`, `accessory_id`),
  KEY `idx_lav_visible` (`landing_id`, `is_visible`),
  KEY `idx_lav_dates` (`visible_from`, `visible_until`),

  CONSTRAINT `fk_lav_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lav_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `component_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'hero, carousel, featured_products, testimonials, faq, cta, banner',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `category` ENUM('hero', 'content', 'products', 'social_proof', 'forms', 'navigation', 'footer') NOT NULL,
  `allowed_pages` JSON COMMENT '["home", "catalog", "form", "result"]',
  `config_schema` JSON COMMENT 'JSON Schema de la configuración esperada',
  `default_config` JSON,
  `preview_image_url` VARCHAR(500),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_component_code` (`code`),
  KEY `idx_component_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_component` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_id` BIGINT UNSIGNED COMMENT 'NULL = producción',
  `component_definition_id` BIGINT UNSIGNED NOT NULL,
  `page_code` VARCHAR(50) NOT NULL COMMENT 'home, catalog, form_step_1, result_success',
  `config` JSON NOT NULL COMMENT 'Configuración específica de esta instancia',
  `is_visible` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `target_device` ENUM('all', 'mobile', 'desktop') DEFAULT 'all',
  `target_new_visitor` TINYINT(1) COMMENT 'NULL=todos, 1=nuevos, 0=recurrentes',
  `variant` CHAR(1) COMMENT 'A, B, C para A/B testing',
  `traffic_percent` TINYINT UNSIGNED DEFAULT 100 COMMENT '% de tráfico que ve este componente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,

  PRIMARY KEY (`id`),
  KEY `idx_lc_landing_page` (`landing_id`, `page_code`, `display_order`),
  KEY `idx_lc_version` (`version_id`),

  CONSTRAINT `fk_lc_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lc_version` FOREIGN KEY (`version_id`) REFERENCES `landing_version` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lc_definition` FOREIGN KEY (`component_definition_id`) REFERENCES `component_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_change_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_id` BIGINT UNSIGNED,
  `change_type` ENUM('create', 'update', 'delete', 'publish', 'archive', 'restore') NOT NULL,
  `entity_type` VARCHAR(50) COMMENT 'landing, component, feature, product_visibility',
  `entity_id` BIGINT UNSIGNED,
  `entity_name` VARCHAR(150),
  `old_value` JSON,
  `new_value` JSON,
  `changed_by` BIGINT UNSIGNED NOT NULL,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,

  PRIMARY KEY (`id`),
  KEY `idx_lcl_landing` (`landing_id`, `changed_at`),
  KEY `idx_lcl_user` (`changed_by`, `changed_at`),

  CONSTRAINT `fk_lcl_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lcl_version` FOREIGN KEY (`version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lcl_user` FOREIGN KEY (`changed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `promotion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `type` ENUM('discount_percent', 'discount_fixed', 'tea_special', 'zero_initial', 'free_accessory') NOT NULL,
  `value` DECIMAL(10,2) NOT NULL COMMENT 'Valor según tipo',
  `valid_from` DATETIME NOT NULL,
  `valid_until` DATETIME NOT NULL,
  `terms_html` TEXT,
  `badge_text` VARCHAR(50),
  `badge_color` CHAR(7),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotion_code` (`code`),
  KEY `idx_promo_active` (`is_active`, `valid_from`, `valid_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_promotion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `promotion_id` BIGINT UNSIGNED NOT NULL,
  `display_type` ENUM('modal', 'banner', 'badge', 'toast') DEFAULT 'badge',
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lp_landing_promo` (`landing_id`, `promotion_id`),

  CONSTRAINT `fk_lp_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_promo` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_product_promotion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_product_visibility_id` BIGINT UNSIGNED NOT NULL,
  `promotion_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lpp` (`landing_product_visibility_id`, `promotion_id`),

  CONSTRAINT `fk_lpp_lpv` FOREIGN KEY (`landing_product_visibility_id`) REFERENCES `landing_product_visibility` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lpp_promo` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_insurance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `insurance_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_default` TINYINT(1) DEFAULT 0,
  `price_override` DECIMAL(10,2),
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_insurance` (`landing_id`, `insurance_id`),

  CONSTRAINT `fk_li_landing_ins` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_li_insurance` FOREIGN KEY (`insurance_id`) REFERENCES `insurance` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.6 Tablas FORM BUILDER

```sql
-- =====================================================
-- FORM BUILDER MODULE
-- =====================================================

CREATE TABLE `form_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'datos-personales, datos-academicos',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `icon` VARCHAR(50),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_step_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `form_field` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'dni, email, celular',
  `name` VARCHAR(100) NOT NULL,
  `field_type` ENUM('text', 'email', 'tel', 'number', 'date', 'select', 'radio', 'checkbox', 'textarea', 'file') NOT NULL,
  `placeholder` VARCHAR(200),
  `default_value` VARCHAR(500),
  `is_required` TINYINT(1) DEFAULT 0,
  `autocomplete` VARCHAR(50) COMMENT 'HTML autocomplete attribute',
  `tooltip_text` VARCHAR(300),
  `help_text` VARCHAR(300),
  `max_length` INT UNSIGNED,
  `min_length` INT UNSIGNED,
  `accept` VARCHAR(200) COMMENT 'Para file inputs: .pdf,.jpg',
  `max_files` TINYINT UNSIGNED DEFAULT 1,
  `rows` TINYINT UNSIGNED DEFAULT 4 COMMENT 'Para textareas',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_field_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `form_field_group` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `form_step_id` BIGINT UNSIGNED NOT NULL,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_group_code` (`code`),
  KEY `idx_group_step` (`form_step_id`),

  CONSTRAINT `fk_ffg_step` FOREIGN KEY (`form_step_id`) REFERENCES `form_step` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `form_step_id` BIGINT UNSIGNED NOT NULL,
  `is_enabled` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `estimated_time_seconds` INT UNSIGNED,
  `skip_condition` JSON COMMENT 'Condición para saltar paso',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_step` (`landing_id`, `form_step_id`),

  CONSTRAINT `fk_ls_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ls_step` FOREIGN KEY (`form_step_id`) REFERENCES `form_step` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_field` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_step_id` BIGINT UNSIGNED NOT NULL,
  `form_field_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_required` TINYINT(1),
  `display_order` INT DEFAULT 0,
  `label_override` VARCHAR(200),
  `placeholder_override` VARCHAR(200),
  `prefix` VARCHAR(50),
  `suffix` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_field` (`landing_step_id`, `form_field_id`),

  CONSTRAINT `fk_lf_step` FOREIGN KEY (`landing_step_id`) REFERENCES `landing_step` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lf_field` FOREIGN KEY (`form_field_id`) REFERENCES `form_field` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `field_validation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_field_id` BIGINT UNSIGNED NOT NULL,
  `validation_type` ENUM('required', 'pattern', 'min', 'max', 'minLength', 'maxLength', 'email', 'age_range', 'api') NOT NULL,
  `validation_value` VARCHAR(500) COMMENT 'Regex, número, JSON',
  `error_message` VARCHAR(300) NOT NULL,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_fv_field` (`form_field_id`),

  CONSTRAINT `fk_fv_field` FOREIGN KEY (`form_field_id`) REFERENCES `form_field` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `field_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_field_id` BIGINT UNSIGNED NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `label` VARCHAR(200) NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_field_option` (`form_field_id`, `value`),

  CONSTRAINT `fk_fo_field` FOREIGN KEY (`form_field_id`) REFERENCES `form_field` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `field_dependency` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `dependent_field_id` BIGINT UNSIGNED NOT NULL COMMENT 'Campo que se muestra/oculta',
  `depends_on_field_id` BIGINT UNSIGNED NOT NULL COMMENT 'Campo que controla',
  `condition_type` ENUM('equals', 'not_equals', 'contains', 'not_empty', 'empty') NOT NULL,
  `condition_value` VARCHAR(500),
  `action` ENUM('show', 'hide', 'require', 'unrequire', 'enable', 'disable') NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_fd_dependent` (`dependent_field_id`),
  KEY `idx_fd_depends_on` (`depends_on_field_id`),

  CONSTRAINT `fk_fd_dependent` FOREIGN KEY (`dependent_field_id`) REFERENCES `form_field` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fd_depends_on` FOREIGN KEY (`depends_on_field_id`) REFERENCES `form_field` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.7 Tablas CATALOG & FILTERS

```sql
-- =====================================================
-- CATALOG & FILTERS MODULE
-- =====================================================

CREATE TABLE `filter_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'brand, price_range, processor',
  `name` VARCHAR(100) NOT NULL,
  `filter_type` ENUM('single', 'multiple', 'range', 'boolean') NOT NULL,
  `source_type` ENUM('manual', 'spec', 'tag', 'category', 'brand') NOT NULL,
  `source_spec_code` VARCHAR(50) COMMENT 'Si source_type=spec, código de spec_definition',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filter_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `filter_value` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filter_definition_id` BIGINT UNSIGNED NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `label` VARCHAR(150) NOT NULL,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filter_value` (`filter_definition_id`, `value`),

  CONSTRAINT `fk_fv_filter` FOREIGN KEY (`filter_definition_id`) REFERENCES `filter_definition` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_filter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `filter_definition_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_expanded` TINYINT(1) DEFAULT 0 COMMENT 'Mostrar expandido por defecto',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_filter` (`landing_id`, `filter_definition_id`),

  CONSTRAINT `fk_lf2_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lf2_filter` FOREIGN KEY (`filter_definition_id`) REFERENCES `filter_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sort_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `sort_field` VARCHAR(100) NOT NULL COMMENT 'Campo de ordenamiento',
  `sort_direction` ENUM('asc', 'desc') DEFAULT 'asc',
  `is_default` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sort_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.8 Tablas EVENT TRACKING

```sql
-- =====================================================
-- EVENT TRACKING MODULE
-- =====================================================

CREATE TABLE `session` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `landing_version_id` BIGINT UNSIGNED,
  `person_id` BIGINT UNSIGNED COMMENT 'Si se identificó',
  `fingerprint` VARCHAR(64),
  `traffic_source` ENUM('direct', 'organic_search', 'paid_search', 'organic_social', 'paid_social', 'email', 'referral', 'affiliate', 'whatsapp', 'recovery', 'other') DEFAULT 'direct',
  `utm_source` VARCHAR(100),
  `utm_medium` VARCHAR(100),
  `utm_campaign` VARCHAR(200),
  `utm_term` VARCHAR(200),
  `utm_content` VARCHAR(200),
  `referrer_url` VARCHAR(2000),
  `referrer_domain` VARCHAR(200),
  `device_type` ENUM('mobile', 'tablet', 'desktop') DEFAULT 'desktop',
  `os` VARCHAR(50),
  `browser` VARCHAR(50),
  `browser_version` VARCHAR(20),
  `screen_width` SMALLINT UNSIGNED,
  `screen_height` SMALLINT UNSIGNED,
  `ip_address` VARCHAR(45),
  `geo_country` CHAR(2),
  `geo_region` VARCHAR(100),
  `geo_city` VARCHAR(100),
  `language` VARCHAR(10),
  `status` ENUM('active', 'idle', 'abandoned', 'converted') DEFAULT 'active',
  `max_step_reached` VARCHAR(50),
  `duration_seconds` INT UNSIGNED,
  `page_views` SMALLINT UNSIGNED DEFAULT 0,
  `is_returning_visitor` TINYINT(1) DEFAULT 0,
  `previous_sessions` JSON COMMENT 'IDs de sesiones anteriores del mismo fingerprint',
  `application_id` BIGINT UNSIGNED COMMENT 'Si convirtió',
  `conversion_type` VARCHAR(50),
  `last_activity_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_uuid` (`uuid`),
  KEY `idx_session_landing` (`landing_id`, `created_at`),
  KEY `idx_session_fingerprint` (`fingerprint`),
  KEY `idx_session_status` (`status`, `created_at`),
  KEY `idx_session_traffic` (`traffic_source`, `created_at`),

  CONSTRAINT `fk_session_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_session_version` FOREIGN KEY (`landing_version_id`) REFERENCES `landing_version` (`id`),
  CONSTRAINT `fk_session_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `page_view` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `path` VARCHAR(500) NOT NULL,
  `step_code` VARCHAR(50),
  `referrer_path` VARCHAR(500),
  `time_on_page_ms` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pv_session` (`session_id`, `created_at`),
  KEY `idx_pv_step` (`step_code`, `created_at`),

  CONSTRAINT `fk_pv_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_scroll` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `scroll_percent` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_es_session` (`session_id`),
  KEY `idx_es_page` (`page_view_id`),

  CONSTRAINT `fk_es_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_es_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_click` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED,
  `element` VARCHAR(100) NOT NULL COMMENT 'btn-solicitar, card-product',
  `element_text` VARCHAR(200),
  `context` JSON COMMENT 'Datos adicionales: product_id, step, etc.',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ec_session` (`session_id`, `created_at`),
  KEY `idx_ec_element` (`element`, `created_at`),

  CONSTRAINT `fk_ec_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `action` ENUM('view_card', 'view_detail', 'simulate', 'add_accessory', 'remove_accessory', 'select', 'deselect') NOT NULL,
  `source` VARCHAR(50) COMMENT 'catalog_card, search, recommendation',
  `price_shown` DECIMAL(10,2),
  `monthly_shown` DECIMAL(10,2),
  `term_shown` TINYINT UNSIGNED,
  `promo_tag_shown` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ep_session` (`session_id`, `created_at`),
  KEY `idx_ep_product` (`product_id`, `action`, `created_at`),

  CONSTRAINT `fk_ep_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ep_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_filter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `filter_code` VARCHAR(50) NOT NULL,
  `filter_value` VARCHAR(200),
  `action` ENUM('apply', 'remove', 'clear_all') DEFAULT 'apply',
  `results_count` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ef_session` (`session_id`, `created_at`),
  KEY `idx_ef_filter` (`filter_code`, `created_at`),

  CONSTRAINT `fk_ef_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_input` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `field_code` VARCHAR(50) NOT NULL,
  `field_type` VARCHAR(30),
  `value_length` INT UNSIGNED,
  `time_to_fill_ms` INT UNSIGNED,
  `changes_count` SMALLINT UNSIGNED DEFAULT 1,
  `validation_errors` SMALLINT UNSIGNED DEFAULT 0,
  `file_name` VARCHAR(200),
  `file_size_kb` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ei_session` (`session_id`, `created_at`),
  KEY `idx_ei_field` (`field_code`, `created_at`),

  CONSTRAINT `fk_ei_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_form` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `step_code` VARCHAR(50) NOT NULL,
  `action` ENUM('start', 'submit_success', 'submit_fail', 'abandon', 'back', 'skip') NOT NULL,
  `time_on_step_ms` INT UNSIGNED,
  `validation_errors` JSON,
  `abandon_reason` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_efo_session` (`session_id`, `created_at`),
  KEY `idx_efo_step` (`step_code`, `action`, `created_at`),

  CONSTRAINT `fk_efo_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_modal` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `modal_name` VARCHAR(50) NOT NULL,
  `action` ENUM('open', 'close', 'submit') NOT NULL,
  `product_id` BIGINT UNSIGNED,
  `time_open_ms` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_em_session` (`session_id`, `created_at`),
  KEY `idx_em_modal` (`modal_name`, `created_at`),

  CONSTRAINT `fk_em_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_hover` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `element` VARCHAR(100) NOT NULL,
  `hover_time_ms` INT UNSIGNED,
  `product_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_eh_session` (`session_id`),

  CONSTRAINT `fk_eh_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_navigation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `from_path` VARCHAR(500),
  `to_path` VARCHAR(500) NOT NULL,
  `navigation_type` ENUM('click', 'browser_back', 'browser_forward', 'redirect', 'form_submit') DEFAULT 'click',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_en_session` (`session_id`, `created_at`),

  CONSTRAINT `fk_en_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_error` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `error_type` ENUM('validation', 'api', 'javascript', 'network', 'server') NOT NULL,
  `error_code` VARCHAR(50),
  `error_message` VARCHAR(500),
  `field_code` VARCHAR(50),
  `stack_trace` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_err_session` (`session_id`, `created_at`),
  KEY `idx_err_type` (`error_type`, `created_at`),

  CONSTRAINT `fk_err_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_custom` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `event_name` VARCHAR(100) NOT NULL,
  `event_data` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ecust_session` (`session_id`, `created_at`),
  KEY `idx_ecust_name` (`event_name`, `created_at`),

  CONSTRAINT `fk_ecust_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `traffic_source_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_type` ENUM('direct', 'organic_search', 'paid_search', 'organic_social', 'paid_social', 'email', 'referral', 'affiliate', 'whatsapp', 'recovery', 'other') NOT NULL,
  `match_pattern` VARCHAR(200) COMMENT 'Regex para detectar',
  `utm_source_match` VARCHAR(100),
  `referrer_domain_match` VARCHAR(200),
  `priority` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_tsc_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.9 Tablas PERSON & APPLICATION

```sql
-- =====================================================
-- PERSON & APPLICATION MODULE
-- =====================================================

CREATE TABLE `person` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_type` ENUM('dni', 'ce', 'passport') NOT NULL,
  `document_number` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `second_last_name` VARCHAR(100),
  `birth_date` DATE,
  `gender` ENUM('male', 'female', 'other'),
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `phone_secondary` VARCHAR(20),
  `equifax_score` SMALLINT,
  `equifax_risk_category` CHAR(1),
  `equifax_last_check_at` TIMESTAMP,
  `is_blacklisted` TINYINT(1) DEFAULT 0,
  `blacklist_reason` VARCHAR(300),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_person_document` (`document_type`, `document_number`),
  KEY `idx_person_email` (`email`),
  KEY `idx_person_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_contact_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `phone_secondary` VARCHAR(20),
  `source` VARCHAR(50) COMMENT 'application, update, import',
  `valid_from` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pch_person` (`person_id`, `valid_from`),

  CONSTRAINT `fk_pch_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_address_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `address_type` ENUM('home', 'work', 'other') DEFAULT 'home',
  `street_address` VARCHAR(300),
  `district` VARCHAR(100),
  `city` VARCHAR(100),
  `region` VARCHAR(100),
  `postal_code` VARCHAR(10),
  `reference` VARCHAR(300),
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),
  `source` VARCHAR(50),
  `valid_from` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pah_person` (`person_id`, `valid_from`),

  CONSTRAINT `fk_pah_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_academic_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `institution_id` BIGINT UNSIGNED,
  `institution_name` VARCHAR(200),
  `campus_id` BIGINT UNSIGNED,
  `career_id` BIGINT UNSIGNED,
  `career_name` VARCHAR(200),
  `student_code` VARCHAR(50),
  `current_cycle` TINYINT UNSIGNED,
  `enrollment_status` ENUM('enrolled', 'graduated', 'withdrawn', 'suspended'),
  `source` VARCHAR(50),
  `valid_from` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pacad_person` (`person_id`, `valid_from`),
  KEY `idx_pacad_institution` (`institution_id`),

  CONSTRAINT `fk_pacad_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pacad_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_employment_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `employment_status` ENUM('employed', 'self_employed', 'intern', 'unemployed', 'student_only') NOT NULL,
  `company_name` VARCHAR(200),
  `company_ruc` VARCHAR(11),
  `position` VARCHAR(100),
  `monthly_income` DECIMAL(10,2),
  `start_date` DATE,
  `source` VARCHAR(50),
  `valid_from` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pemp_person` (`person_id`, `valid_from`),

  CONSTRAINT `fk_pemp_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_financial_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `has_bank_account` TINYINT(1),
  `bank_name` VARCHAR(100),
  `has_credit_card` TINYINT(1),
  `declared_debts` DECIMAL(10,2),
  `source` VARCHAR(50),
  `valid_from` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pfin_person` (`person_id`, `valid_from`),

  CONSTRAINT `fk_pfin_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_equifax_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `score` SMALLINT,
  `risk_category` CHAR(1),
  `total_debt` DECIMAL(12,2),
  `delinquency_count` SMALLINT,
  `response_raw` JSON,
  `queried_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_peq_person` (`person_id`, `queried_at`),

  CONSTRAINT `fk_peq_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_reference` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `reference_type` ENUM('family', 'personal', 'work') NOT NULL,
  `full_name` VARCHAR(200) NOT NULL,
  `relationship` VARCHAR(50),
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(254),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pref_person` (`person_id`),

  CONSTRAINT `fk_pref_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `document_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `accepted_formats` VARCHAR(200) COMMENT '.pdf,.jpg,.png',
  `max_size_mb` TINYINT UNSIGNED DEFAULT 5,
  `is_required_default` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doctype_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `person_document` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `document_type_id` BIGINT UNSIGNED NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(200),
  `file_size_kb` INT UNSIGNED,
  `mime_type` VARCHAR(100),
  `status` ENUM('pending_review', 'approved', 'rejected', 'expired') DEFAULT 'pending_review',
  `rejection_reason` VARCHAR(300),
  `reviewed_by` BIGINT UNSIGNED,
  `reviewed_at` TIMESTAMP,
  `expires_at` DATE,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pdoc_person` (`person_id`),
  KEY `idx_pdoc_status` (`status`),

  CONSTRAINT `fk_pdoc_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pdoc_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`),
  CONSTRAINT `fk_pdoc_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `application` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_number` VARCHAR(30) NOT NULL COMMENT 'SOL-2026-00001234',
  `person_id` BIGINT UNSIGNED NOT NULL,
  `session_id` BIGINT UNSIGNED,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `landing_version_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,
  `status` ENUM('draft', 'submitted', 'under_review', 'pending_documents', 'approved', 'rejected', 'cancelled', 'expired', 'disbursed') DEFAULT 'draft',
  `requested_amount` DECIMAL(10,2) NOT NULL,
  `initial_amount` DECIMAL(10,2) DEFAULT 0,
  `requested_term` TINYINT UNSIGNED NOT NULL,
  `monthly_payment` DECIMAL(10,2),
  `tea` DECIMAL(6,3),
  `tcea` DECIMAL(6,3),
  `approved_amount` DECIMAL(10,2),
  `approved_term` TINYINT UNSIGNED,
  `approved_rate` DECIMAL(6,3),
  `final_monthly_payment` DECIMAL(10,2),
  `rejection_reason` VARCHAR(500),
  `assigned_to` BIGINT UNSIGNED,
  `evaluated_by` BIGINT UNSIGNED,
  `evaluated_at` TIMESTAMP,
  `submission_ip` VARCHAR(45),
  `submitted_at` TIMESTAMP,
  `contract_signed_at` TIMESTAMP,
  `disbursement_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_application_number` (`application_number`),
  KEY `idx_app_person` (`person_id`),
  KEY `idx_app_landing` (`landing_id`),
  KEY `idx_app_status` (`status`, `created_at`),
  KEY `idx_app_assigned` (`assigned_to`, `status`),

  CONSTRAINT `fk_app_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`),
  CONSTRAINT `fk_app_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_app_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_app_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_app_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_app_evaluated` FOREIGN KEY (`evaluated_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `application_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED,
  `accessory_id` BIGINT UNSIGNED,
  `product_type` ENUM('main', 'accessory', 'insurance') NOT NULL,
  `quantity` TINYINT UNSIGNED DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_ap_application` (`application_id`),

  CONSTRAINT `fk_ap_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ap_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_ap_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `application_document` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `document_type_id` BIGINT UNSIGNED NOT NULL,
  `person_document_id` BIGINT UNSIGNED,
  `is_required` TINYINT(1) DEFAULT 1,
  `status` ENUM('pending', 'uploaded', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_doc` (`application_id`, `document_type_id`),

  CONSTRAINT `fk_ad_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ad_doctype` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`),
  CONSTRAINT `fk_ad_pdoc` FOREIGN KEY (`person_document_id`) REFERENCES `person_document` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `application_status_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `from_status` VARCHAR(30),
  `to_status` VARCHAR(30) NOT NULL,
  `changed_by` BIGINT UNSIGNED,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_asl_application` (`application_id`, `created_at`),

  CONSTRAINT `fk_asl_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asl_user` FOREIGN KEY (`changed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.10 Tablas LEADS, LOAN, STOCK y NOTIFICATIONS

```sql
-- =====================================================
-- LEADS MODULE
-- =====================================================

CREATE TABLE `lead` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `landing_version_id` BIGINT UNSIGNED,
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `document_number` VARCHAR(20),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(200),
  `institution_id` BIGINT UNSIGNED,
  `career` VARCHAR(200),
  `interested_product_id` BIGINT UNSIGNED,
  `interested_amount` DECIMAL(10,2),
  `last_step_code` VARCHAR(50),
  `form_completion_percent` TINYINT UNSIGNED DEFAULT 0,
  `quality_score` SMALLINT DEFAULT 0,
  `temperature` ENUM('cold', 'warm', 'hot') DEFAULT 'cold',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'low',
  `status` ENUM('new', 'contacted', 'nurturing', 'qualified', 'converted', 'disqualified', 'unresponsive') DEFAULT 'new',
  `traffic_source` VARCHAR(50),
  `converted_at` TIMESTAMP,
  `application_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_lead_session` (`session_id`),
  KEY `idx_lead_landing` (`landing_id`),
  KEY `idx_lead_status` (`status`, `temperature`),
  KEY `idx_lead_score` (`quality_score`),
  KEY `idx_lead_email` (`email`),
  KEY `idx_lead_phone` (`phone`),

  CONSTRAINT `fk_lead_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_lead_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_lead_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_score_rule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `condition_type` VARCHAR(50) NOT NULL COMMENT 'has_email, reached_step, time_on_site',
  `condition_value` VARCHAR(200),
  `score_delta` SMALLINT NOT NULL COMMENT 'Positivo o negativo',
  `priority` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lsr_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_interaction` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` BIGINT UNSIGNED NOT NULL,
  `interaction_type` ENUM('call', 'email', 'whatsapp', 'sms', 'meeting', 'note') NOT NULL,
  `direction` ENUM('inbound', 'outbound') DEFAULT 'outbound',
  `subject` VARCHAR(200),
  `content` TEXT,
  `outcome` VARCHAR(100),
  `scheduled_at` TIMESTAMP,
  `completed_at` TIMESTAMP,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_li_lead` (`lead_id`, `created_at`),

  CONSTRAINT `fk_li_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_li_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_recovery_campaign` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
  `template_id` BIGINT UNSIGNED,
  `trigger_delay_hours` INT UNSIGNED COMMENT 'Horas después del abandono',
  `max_sends_per_lead` TINYINT UNSIGNED DEFAULT 3,
  `valid_from` DATE,
  `valid_until` DATE,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lrc_code` (`code`),

  CONSTRAINT `fk_lrc_template` FOREIGN KEY (`template_id`) REFERENCES `notification_template` (`id`),
  CONSTRAINT `fk_lrc_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_campaign_send` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` BIGINT UNSIGNED NOT NULL,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
  `recipient` VARCHAR(254) NOT NULL,
  `message_body` TEXT,
  `status` ENUM('scheduled', 'sent', 'delivered', 'clicked', 'converted', 'failed', 'bounced') DEFAULT 'scheduled',
  `scheduled_at` TIMESTAMP,
  `sent_at` TIMESTAMP,
  `delivered_at` TIMESTAMP,
  `clicked_at` TIMESTAMP,
  `external_id` VARCHAR(100),
  `failure_reason` VARCHAR(300),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_lcs_lead` (`lead_id`),
  KEY `idx_lcs_campaign` (`campaign_id`),
  KEY `idx_lcs_status` (`status`, `scheduled_at`),

  CONSTRAINT `fk_lcs_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lcs_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `lead_recovery_campaign` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LOAN MODULE
-- =====================================================

CREATE TABLE `loan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_number` VARCHAR(30) NOT NULL COMMENT 'PRE-2026-00001234',
  `application_id` BIGINT UNSIGNED NOT NULL,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `principal_amount` DECIMAL(10,2) NOT NULL,
  `initial_amount` DECIMAL(10,2) DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `tea` DECIMAL(6,3) NOT NULL,
  `tcea` DECIMAL(6,3),
  `term_months` TINYINT UNSIGNED NOT NULL,
  `monthly_payment` DECIMAL(10,2) NOT NULL,
  `first_due_date` DATE NOT NULL,
  `status` ENUM('pending_disbursement', 'active', 'late', 'default', 'legal', 'paid_off', 'cancelled') DEFAULT 'pending_disbursement',
  `days_past_due` SMALLINT DEFAULT 0,
  `paid_installments` TINYINT UNSIGNED DEFAULT 0,
  `remaining_balance` DECIMAL(10,2),
  `disbursed_at` TIMESTAMP,
  `paid_off_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loan_number` (`loan_number`),
  KEY `idx_loan_application` (`application_id`),
  KEY `idx_loan_person` (`person_id`),
  KEY `idx_loan_status` (`status`),

  CONSTRAINT `fk_loan_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_loan_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loan_schedule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id` BIGINT UNSIGNED NOT NULL,
  `installment_number` TINYINT UNSIGNED NOT NULL,
  `due_date` DATE NOT NULL,
  `principal_amount` DECIMAL(10,2) NOT NULL,
  `interest_amount` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `paid_amount` DECIMAL(10,2) DEFAULT 0,
  `status` ENUM('pending', 'partial', 'paid', 'late', 'default') DEFAULT 'pending',
  `paid_date` DATE,
  `days_late` SMALLINT DEFAULT 0,
  `late_fee` DECIMAL(10,2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loan_installment` (`loan_id`, `installment_number`),
  KEY `idx_ls_due` (`due_date`, `status`),

  CONSTRAINT `fk_ls_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loan_payment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id` BIGINT UNSIGNED NOT NULL,
  `loan_schedule_id` BIGINT UNSIGNED,
  `payment_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('transfer', 'cash', 'card', 'yape', 'plin', 'agent', 'other') NOT NULL,
  `payment_reference` VARCHAR(100),
  `payment_date` DATE NOT NULL,
  `bank_name` VARCHAR(100),
  `receipt_url` VARCHAR(500),
  `notes` TEXT,
  `recorded_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_lp_loan` (`loan_id`, `payment_date`),

  CONSTRAINT `fk_lp_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`),
  CONSTRAINT `fk_lp_schedule` FOREIGN KEY (`loan_schedule_id`) REFERENCES `loan_schedule` (`id`),
  CONSTRAINT `fk_lp_user` FOREIGN KEY (`recorded_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loan_status_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id` BIGINT UNSIGNED NOT NULL,
  `from_status` VARCHAR(30),
  `to_status` VARCHAR(30) NOT NULL,
  `days_past_due` SMALLINT,
  `changed_by` BIGINT UNSIGNED,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_lsh_loan` (`loan_id`, `created_at`),

  CONSTRAINT `fk_lsh_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lsh_user` FOREIGN KEY (`changed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- STOCK & INVENTORY MODULE
-- =====================================================

CREATE TABLE `location` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('warehouse', 'office', 'partner', 'virtual') NOT NULL,
  `address` VARCHAR(300),
  `city` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_location_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_stock` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `location_id` BIGINT UNSIGNED COMMENT 'NULL = stock general',
  `quantity_available` INT NOT NULL DEFAULT 0,
  `quantity_reserved` INT NOT NULL DEFAULT 0 COMMENT 'Reservados por solicitudes aprobadas',
  `quantity_in_transit` INT NOT NULL DEFAULT 0,
  `reorder_point` INT DEFAULT 5 COMMENT 'Alerta cuando llegue a este nivel',
  `last_recount_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stock_product_location` (`product_id`, `location_id`),
  KEY `idx_stock_low` (`product_id`, `quantity_available`),

  CONSTRAINT `fk_ps_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_ps_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stock_movement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `location_id` BIGINT UNSIGNED,
  `movement_type` ENUM('purchase', 'sale', 'reserve', 'release', 'transfer', 'adjustment', 'return') NOT NULL,
  `quantity` INT NOT NULL COMMENT 'Positivo = entrada, Negativo = salida',
  `quantity_before` INT NOT NULL,
  `quantity_after` INT NOT NULL,
  `reference_type` VARCHAR(50) COMMENT 'application, loan, purchase_order',
  `reference_id` BIGINT UNSIGNED COMMENT 'ID de la entidad relacionada',
  `notes` VARCHAR(500),
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_sm_product` (`product_id`, `created_at`),
  KEY `idx_sm_type` (`movement_type`, `created_at`),
  KEY `idx_sm_reference` (`reference_type`, `reference_id`),

  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_sm_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`),
  CONSTRAINT `fk_sm_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_reservation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `status` ENUM('pending', 'confirmed', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
  `reserved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP COMMENT 'Cuándo expira la reserva si no se cumple',
  `fulfilled_at` TIMESTAMP COMMENT 'Cuándo se entregó el producto',
  `cancelled_at` TIMESTAMP,
  `cancellation_reason` VARCHAR(300),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pr_product` (`product_id`, `status`),
  KEY `idx_pr_application` (`application_id`),
  KEY `idx_pr_expires` (`status`, `expires_at`),

  CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_pr_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_catalog_snapshot` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `snapshot_date` DATE NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `was_visible` TINYINT(1) NOT NULL,
  `was_featured` TINYINT(1) NOT NULL,
  `display_order` INT,
  `list_price` DECIMAL(10,2) NOT NULL,
  `tea_applied` DECIMAL(6,3) NOT NULL,
  `sample_term_months` TINYINT UNSIGNED DEFAULT 12,
  `sample_initial_amount` DECIMAL(10,2) DEFAULT 0,
  `sample_monthly_payment` DECIMAL(10,2),
  `promo_tag` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_snapshot` (`snapshot_date`, `landing_id`, `product_id`),
  KEY `idx_snapshot_date` (`snapshot_date`),
  KEY `idx_snapshot_product` (`product_id`, `snapshot_date`),
  KEY `idx_snapshot_landing` (`landing_id`, `snapshot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NOTIFICATIONS MODULE
-- =====================================================

CREATE TABLE `notification_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'application_approved, payment_reminder, etc.',
  `name` VARCHAR(150) NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push', 'in_app') NOT NULL,
  `subject` VARCHAR(200) COMMENT 'Para email',
  `body_template` TEXT NOT NULL COMMENT 'Template con variables {{nombre}}, {{monto}}',
  `variables` JSON COMMENT 'Lista de variables disponibles',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code_channel` (`code`, `channel`),
  KEY `idx_template_channel` (`channel`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push', 'in_app') NOT NULL,
  `recipient` VARCHAR(254) NOT NULL COMMENT 'Email, teléfono, device_token',
  `subject` VARCHAR(200),
  `body` TEXT NOT NULL COMMENT 'Contenido renderizado',
  `status` ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'bounced') DEFAULT 'pending',
  `sent_at` TIMESTAMP,
  `delivered_at` TIMESTAMP,
  `read_at` TIMESTAMP,
  `failed_at` TIMESTAMP,
  `failure_reason` VARCHAR(500),
  `external_id` VARCHAR(100) COMMENT 'ID del proveedor (SendGrid, Twilio)',
  `metadata` JSON COMMENT 'Datos adicionales del envío',
  `reference_type` VARCHAR(50) COMMENT 'application, loan, lead',
  `reference_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_notif_person` (`person_id`, `channel`, `created_at`),
  KEY `idx_notif_status` (`status`, `channel`),
  KEY `idx_notif_reference` (`reference_type`, `reference_id`),
  KEY `idx_notif_external` (`external_id`),

  CONSTRAINT `fk_notif_template` FOREIGN KEY (`template_id`) REFERENCES `notification_template` (`id`),
  CONSTRAINT `fk_notif_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification_preference` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT 'marketing, transactional, reminders',
  `is_enabled` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pref_person_channel_cat` (`person_id`, `channel`, `category`),

  CONSTRAINT `fk_np_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COUPONS & WISHLIST
-- =====================================================

CREATE TABLE `coupon` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL COMMENT 'BALDE20, SENATI10',
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `discount_type` ENUM('percent', 'fixed_amount', 'free_accessory', 'special_tea') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL COMMENT '20 para 20%, 100 para S/100',
  `min_product_price` DECIMAL(10,2) COMMENT 'Precio mínimo del producto',
  `max_discount_amount` DECIMAL(10,2) COMMENT 'Tope de descuento',
  `allowed_product_ids` JSON COMMENT 'NULL = todos los productos',
  `allowed_landing_ids` JSON COMMENT 'NULL = todas las landings',
  `allowed_agreement_ids` JSON COMMENT 'NULL = todos los convenios',
  `max_total_uses` INT UNSIGNED COMMENT 'NULL = ilimitado',
  `max_uses_per_person` INT UNSIGNED DEFAULT 1,
  `current_uses` INT UNSIGNED DEFAULT 0,
  `valid_from` DATETIME NOT NULL,
  `valid_until` DATETIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupon_code` (`code`),
  KEY `idx_coupon_active` (`is_active`, `valid_from`, `valid_until`),

  CONSTRAINT `fk_coupon_user` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `coupon_usage` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coupon_id` BIGINT UNSIGNED NOT NULL,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `application_id` BIGINT UNSIGNED,
  `discount_applied` DECIMAL(10,2) NOT NULL,
  `used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_cu_coupon` (`coupon_id`),
  KEY `idx_cu_person` (`person_id`),

  CONSTRAINT `fk_cu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`),
  CONSTRAINT `fk_cu_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`),
  CONSTRAINT `fk_cu_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `saved_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED COMMENT 'NULL si es sesión anónima',
  `session_id` BIGINT UNSIGNED COMMENT 'Para usuarios no registrados',
  `product_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED COMMENT 'Landing donde lo guardó',
  `saved_list_price` DECIMAL(10,2),
  `saved_term_months` TINYINT UNSIGNED,
  `saved_initial_amount` DECIMAL(10,2),
  `saved_monthly_payment` DECIMAL(10,2),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_saved_person_product` (`person_id`, `product_id`),
  KEY `idx_saved_session` (`session_id`),
  KEY `idx_saved_product` (`product_id`),

  CONSTRAINT `fk_sp_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14.11 Datos Iniciales

```sql
-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Plazos de financiamiento
INSERT INTO `financing_term` (`period_type`, `period_count`, `label`, `label_short`, `default_tea`, `is_featured`, `display_order`) VALUES
('monthly', 6, '6 meses', '6m', 38.000, 0, 1),
('monthly', 9, '9 meses', '9m', 40.000, 0, 2),
('monthly', 12, '12 meses', '12m', 42.500, 1, 3),
('monthly', 18, '18 meses', '18m', 45.000, 0, 4),
('monthly', 24, '24 meses', '24m', 48.000, 1, 5),
('monthly', 36, '36 meses', '36m', 52.000, 0, 6);

-- Categorías
INSERT INTO `category` (`code`, `name`, `slug`, `icon`, `display_order`) VALUES
('laptops', 'Laptops', 'laptops', 'Laptop', 1),
('celulares', 'Celulares', 'celulares', 'Smartphone', 2),
('tablets', 'Tablets', 'tablets', 'Tablet', 3),
('motos', 'Motos', 'motos', 'Bike', 4);

-- Marcas
INSERT INTO `brand` (`code`, `name`, `slug`, `display_order`) VALUES
('lenovo', 'Lenovo', 'lenovo', 1),
('hp', 'HP', 'hp', 2),
('dell', 'Dell', 'dell', 3),
('asus', 'ASUS', 'asus', 4),
('acer', 'Acer', 'acer', 5),
('apple', 'Apple', 'apple', 6),
('samsung', 'Samsung', 'samsung', 7),
('logitech', 'Logitech', 'logitech', 10),
('hyperx', 'HyperX', 'hyperx', 11);

-- Tipos de documentos
INSERT INTO `document_type` (`code`, `name`, `is_required_default`, `display_order`) VALUES
('dni_front', 'DNI (Frente)', 1, 1),
('dni_back', 'DNI (Reverso)', 1, 2),
('selfie', 'Selfie con DNI', 1, 3),
('student_card', 'Carnet de Estudiante', 1, 4),
('proof_enrollment', 'Constancia de Matrícula', 0, 5),
('proof_income', 'Comprobante de Ingresos', 0, 6);

-- Tipos de componentes
INSERT INTO `component_definition` (`code`, `name`, `category`, `allowed_pages`) VALUES
('hero_v1', 'Hero Principal v1', 'hero', '["home"]'),
('hero_v2', 'Hero con Video v2', 'hero', '["home"]'),
('carousel_products', 'Carrusel de Productos', 'products', '["home", "catalog"]'),
('featured_grid', 'Grid de Destacados', 'products', '["home", "catalog"]'),
('testimonials_slider', 'Testimonios Slider', 'social_proof', '["home", "form"]'),
('institution_logos', 'Logos de Instituciones', 'social_proof', '["home"]'),
('faq_accordion', 'FAQ Acordeón', 'content', '["home", "catalog", "form"]'),
('how_it_works', 'Cómo Funciona', 'content', '["home"]'),
('whatsapp_float', 'Botón WhatsApp Flotante', 'navigation', '["home", "catalog", "form"]');

-- Reglas de scoring de leads
INSERT INTO `lead_score_rule` (`code`, `name`, `condition_type`, `score_delta`) VALUES
('has_email', 'Tiene email', 'has_email', 15),
('has_phone', 'Tiene teléfono', 'has_phone', 15),
('has_document', 'Tiene documento', 'has_document', 10),
('institution_agreement', 'Institución con convenio', 'institution_has_agreement', 10),
('reached_step_2', 'Llegó al paso 2', 'reached_step', 10),
('reached_step_3', 'Llegó al paso 3', 'reached_step', 15),
('time_on_site_5min', 'Tiempo en sitio > 5 min', 'time_on_site_minutes', 10),
('selected_product', 'Seleccionó producto', 'has_selected_product', 5);
```

---

## 15. Próximos Pasos

1. **Validar fórmula de cálculo** con equipo de finanzas
6. **Deprecar** tablas viejas después de validación
7. **Implementar sistema de componentes** dinámicos
8. **Integrar stock** con flujo de aprobación
9. **Configurar periféricos** con plazos disponibles
10. **Crear endpoint** de periféricos compatibles por producto+plazo

