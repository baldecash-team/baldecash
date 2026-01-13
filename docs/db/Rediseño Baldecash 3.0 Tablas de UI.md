# Sistema BaldeCash - Tablas UI/Flujo del Cliente

**Versión:** 2.0 | **Fecha:** Diciembre 2025 | **Tipo:** Estructura Frontend

---

## 1. Resumen

Este documento contiene las **tablas que afectan directamente la interfaz de usuario** y el flujo del cliente en el sitio web. Estas tablas son consultadas en tiempo real durante la navegación del usuario.

### 1.1 Módulos Incluidos

| Módulo | Tablas | Descripción |
|--------|--------|-------------|
| Core (parcial) | 4 | Instituciones, convenios, carreras |
| Products | 15 | Catálogo completo de productos |
| Landing Configuration | 11 | Configuración de landings |
| Form Builder | 8 | Formularios dinámicos |
| Catalog & Filters | 4 | Filtros y ordenamiento |
| **Total** | **42** | Tablas que renderizan UI |

### 1.2 Características Críticas

- **Latencia**: Estas tablas deben responder en < 100ms
- **Cache**: Altamente cacheables (productos, landings, forms)
- **Índices**: Optimizados para SELECT frecuentes
- **Joins**: Múltiples joins en queries de catálogo

---

## 2. Módulo Core (Parcial)

Entidades base que se muestran en el frontend.

### 2.1 institution

```sql
CREATE TABLE `institution` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `short_name` VARCHAR(50),
  `type` ENUM('universidad', 'instituto', 'colegio', 'empresa') NOT NULL,
  `logo_url` VARCHAR(500),
  `website` VARCHAR(300),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_institution_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 institution_campus

```sql
CREATE TABLE `institution_campus` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(300),
  `district` VARCHAR(100),
  `city` VARCHAR(100),
  `department` VARCHAR(100),
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),
  `is_main` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campus_institution` (`institution_id`),
  CONSTRAINT `fk_campus_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 career

```sql
CREATE TABLE `career` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(20),
  `name` VARCHAR(200) NOT NULL,
  `faculty` VARCHAR(200),
  `duration_semesters` TINYINT UNSIGNED,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_career_institution` (`institution_id`),
  CONSTRAINT `fk_career_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.4 agreement

```sql
CREATE TABLE `agreement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `agreement_type` ENUM('convenio_marco', 'convenio_especifico', 'alianza', 'descuento_planilla') NOT NULL,
  `discount_percentage` DECIMAL(5,2),
  `special_rate` DECIMAL(5,2),
  `max_amount` DECIMAL(10,2),
  `min_amount` DECIMAL(10,2),
  `requires_validation` TINYINT(1) DEFAULT 1,
  `valid_from` DATE NOT NULL,
  `valid_until` DATE,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agreement_code` (`code`),
  KEY `idx_agreement_institution` (`institution_id`),
  CONSTRAINT `fk_agreement_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Módulo Products (15 tablas)

Catálogo completo de productos mostrados al usuario.

### 3.1 category

```sql
CREATE TABLE `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(50),
  `image_url` VARCHAR(500),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`code`),
  UNIQUE KEY `uk_category_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 brand

```sql
CREATE TABLE `brand` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `logo_url` VARCHAR(500),
  `website` VARCHAR(300),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_brand_code` (`code`),
  UNIQUE KEY `uk_brand_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 product

```sql
CREATE TABLE `product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL,
  `short_description` VARCHAR(500),
  `description` TEXT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `brand_id` BIGINT UNSIGNED NOT NULL,
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio') NOT NULL,
  `condition` ENUM('nuevo', 'reacondicionado', 'open_box') DEFAULT 'nuevo',
  `list_price` DECIMAL(10,2) NOT NULL,
  `sale_price` DECIMAL(10,2),
  `cost_price` DECIMAL(10,2),
  `stock_quantity` INT DEFAULT 0,
  `min_stock_alert` INT DEFAULT 5,
  `warranty_months` TINYINT UNSIGNED DEFAULT 12,
  `weight_kg` DECIMAL(6,2),
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_new` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_sku` (`sku`),
  UNIQUE KEY `uk_product_slug` (`slug`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_brand` (`brand_id`),
  KEY `idx_product_type` (`product_type`),
  KEY `idx_product_active_featured` (`is_active`, `is_featured`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.4 spec_definition (Modelo EAV)

```sql
CREATE TABLE `spec_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: ram_gb, cilindrada, tipo_moto, gama',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `data_type` ENUM('string', 'number', 'boolean') NOT NULL,
  `unit` VARCHAR(20),
  `icon` VARCHAR(50),
  `is_filterable` TINYINT(1) DEFAULT 0,
  `is_comparable` TINYINT(1) DEFAULT 0,
  `is_highlight` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `group_code` VARCHAR(50),
  `group_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spec_code` (`code`),
  KEY `idx_spec_filterable` (`is_filterable`, `is_active`),
  KEY `idx_spec_group` (`group_code`, `group_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.5 spec_product_type

```sql
CREATE TABLE `spec_product_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `spec_definition_id` BIGINT UNSIGNED NOT NULL,
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spec_type` (`spec_definition_id`, `product_type`),
  KEY `idx_type_spec` (`product_type`, `spec_definition_id`),
  CONSTRAINT `fk_spt_spec` FOREIGN KEY (`spec_definition_id`) REFERENCES `spec_definition` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.6 product_spec_value

```sql
CREATE TABLE `product_spec_value` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `spec_definition_id` BIGINT UNSIGNED NOT NULL,
  `value_string` VARCHAR(500),
  `value_number` DECIMAL(15,4),
  `value_boolean` TINYINT(1),
  `display_value` VARCHAR(100) COMMENT 'Valor formateado para mostrar',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_spec` (`product_id`, `spec_definition_id`),
  KEY `idx_spec_value_number` (`spec_definition_id`, `value_number`),
  KEY `idx_spec_value_string` (`spec_definition_id`, `value_string`(100)),
  CONSTRAINT `fk_psv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_psv_spec` FOREIGN KEY (`spec_definition_id`) REFERENCES `spec_definition` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.7 tag

```sql
CREATE TABLE `tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `tag_type` ENUM('categoria', 'marca', 'promocion', 'campana', 'temporal', 'caracteristica') NOT NULL,
  `color` VARCHAR(7),
  `icon` VARCHAR(50),
  `display_order` INT DEFAULT 0,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_from` DATE,
  `valid_until` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_code` (`code`),
  KEY `idx_tag_type` (`tag_type`, `is_active`),
  KEY `idx_tag_validity` (`valid_from`, `valid_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.8 product_tag

```sql
CREATE TABLE `product_tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_tag` (`product_id`, `tag_id`),
  KEY `idx_tag_product` (`tag_id`, `product_id`),
  CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.9 product_image

```sql
CREATE TABLE `product_image` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(200),
  `image_type` ENUM('main', 'gallery', 'thumbnail', '360', 'video_thumbnail') DEFAULT 'gallery',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_image_product` (`product_id`, `display_order`),
  CONSTRAINT `fk_image_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.10 product_pricing

```sql
CREATE TABLE `product_pricing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `term_months` TINYINT UNSIGNED NOT NULL,
  `monthly_payment` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `tea` DECIMAL(6,3) NOT NULL,
  `tcea` DECIMAL(6,3),
  `down_payment` DECIMAL(10,2) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_from` DATE,
  `valid_until` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_term` (`product_id`, `term_months`),
  KEY `idx_pricing_active` (`is_active`, `product_id`),
  CONSTRAINT `fk_pricing_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.11 accessory

```sql
CREATE TABLE `accessory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `category` ENUM('auriculares', 'mouse', 'teclado', 'mochila', 'soporte', 'cargador', 'protector', 'hub', 'otro') NOT NULL,
  `monthly_price_addon` DECIMAL(8,2) NOT NULL,
  `is_recommended` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accessory_product` (`product_id`),
  KEY `idx_accessory_category` (`category`),
  CONSTRAINT `fk_accessory_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.12 accessory_product_type

```sql
CREATE TABLE `accessory_product_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accessory_type` (`accessory_id`, `product_type`),
  KEY `idx_type_accessory` (`product_type`, `accessory_id`),
  CONSTRAINT `fk_apt_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.13 insurance

```sql
CREATE TABLE `insurance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `coverage_months` TINYINT UNSIGNED NOT NULL,
  `monthly_price` DECIMAL(8,2) NOT NULL,
  `coverage_details` JSON COMMENT 'Detalles de cobertura (display only)',
  `provider` VARCHAR(100),
  `is_mandatory_refurbished` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_insurance_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.14 combo

```sql
CREATE TABLE `combo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `discount_type` ENUM('percentage', 'fixed_amount', 'fixed_price') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_items` TINYINT UNSIGNED DEFAULT 1,
  `max_items` TINYINT UNSIGNED,
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_from` DATE,
  `valid_until` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_combo_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.15 combo_item

```sql
CREATE TABLE `combo_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `combo_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `item_type` ENUM('main', 'accessory', 'insurance') NOT NULL,
  `is_required` TINYINT(1) DEFAULT 0,
  `quantity` TINYINT UNSIGNED DEFAULT 1,
  `individual_discount` DECIMAL(10,2),
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_combo_item` (`combo_id`, `product_id`),
  CONSTRAINT `fk_combo_item_combo` FOREIGN KEY (`combo_id`) REFERENCES `combo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_combo_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Módulo Landing Configuration (11 tablas)

Configuración dinámica de landings.

### 4.1 landing_template

```sql
CREATE TABLE `landing_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `template_type` ENUM('convenio', 'publico', 'campana', 'preaprobado', 'referido') NOT NULL,
  `default_theme` JSON,
  `default_seo` JSON,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 landing

```sql
CREATE TABLE `landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED,
  `code` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `institution_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,
  `hero_config` JSON,
  `theme_overrides` JSON,
  `feature_flags` JSON,
  `analytics_config` JSON,
  `meta_title` VARCHAR(200),
  `meta_description` VARCHAR(500),
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_from` DATE,
  `valid_until` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_code` (`code`),
  UNIQUE KEY `uk_landing_slug` (`slug`),
  KEY `idx_landing_template` (`template_id`),
  KEY `idx_landing_institution` (`institution_id`),
  KEY `idx_landing_active` (`is_active`, `valid_from`, `valid_until`),
  CONSTRAINT `fk_landing_template` FOREIGN KEY (`template_id`) REFERENCES `landing_template` (`id`),
  CONSTRAINT `fk_landing_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_landing_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.3-4.11 (Tablas restantes del módulo)

Ver documento principal `entregable_rediseno_estructura.md` para las definiciones completas de:
- `landing_inheritance`
- `feature_definition`
- `landing_feature`
- `landing_promotion`
- `landing_product`
- `landing_accessory`
- `landing_insurance`
- `promotion`
- `landing_product_promotion`

---

## 5. Módulo Form Builder (8 tablas)

Formularios dinámicos configurables.

### 5.1 form_step

```sql
CREATE TABLE `form_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(50),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_step_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.2-5.8 (Tablas restantes del módulo)

Ver documento principal para:
- `form_field`
- `form_field_group`
- `landing_step`
- `landing_field`
- `field_validation`
- `field_option`
- `field_dependency`

---

## 6. Módulo Catalog & Filters (4 tablas)

Sistema de filtros dinámicos.

### 6.1 filter_definition

```sql
CREATE TABLE `filter_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `filter_type` ENUM('checkbox', 'radio', 'range', 'select', 'search') NOT NULL,
  `source_type` ENUM('spec', 'brand', 'category', 'price', 'custom') NOT NULL,
  `source_spec_id` BIGINT UNSIGNED,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filter_code` (`code`),
  CONSTRAINT `fk_filter_spec` FOREIGN KEY (`source_spec_id`) REFERENCES `spec_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.2-6.4 (Tablas restantes)

- `filter_value`
- `landing_filter`
- `sort_option`

---

## 7. Queries Frecuentes de UI

### 7.1 Listado de productos con filtros

```sql
SELECT
  p.id, p.sku, p.name, p.slug, p.short_description,
  p.list_price, p.sale_price, p.condition,
  b.name AS brand_name, b.logo_url AS brand_logo,
  c.name AS category_name,
  pi.url AS main_image,
  MIN(pp.monthly_payment) AS min_monthly,
  GROUP_CONCAT(DISTINCT t.code) AS tags
FROM product p
JOIN brand b ON b.id = p.brand_id
JOIN category c ON c.id = p.category_id
LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.image_type = 'main'
LEFT JOIN product_pricing pp ON pp.product_id = p.id AND pp.is_active = 1
LEFT JOIN product_tag pt ON pt.product_id = p.id
LEFT JOIN tag t ON t.id = pt.tag_id AND t.is_active = 1
WHERE p.is_active = 1
  AND p.product_type = 'laptop'
GROUP BY p.id
ORDER BY p.is_featured DESC, p.created_at DESC
LIMIT 20;
```

### 7.2 Detalle de producto con specs

```sql
SELECT
  p.*,
  b.name AS brand_name,
  JSON_OBJECTAGG(sd.code, psv.display_value) AS specs
FROM product p
JOIN brand b ON b.id = p.brand_id
LEFT JOIN product_spec_value psv ON psv.product_id = p.id
LEFT JOIN spec_definition sd ON sd.id = psv.spec_definition_id AND sd.is_active = 1
WHERE p.slug = 'hp-pavilion-15-eg3001'
GROUP BY p.id;
```

### 7.3 Landing con productos

```sql
SELECT
  l.*,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'product_id', lp.product_id,
      'custom_price', lp.custom_price,
      'display_order', lp.display_order
    )
  ) AS products
FROM landing l
LEFT JOIN landing_product lp ON lp.landing_id = l.id AND lp.is_active = 1
WHERE l.slug = 'senati'
  AND l.is_active = 1
GROUP BY l.id;
```

---

## 8. Índices Recomendados para UI

```sql
-- Búsqueda de productos
CREATE INDEX idx_product_search ON product(name(100), is_active);
CREATE INDEX idx_product_price_range ON product(list_price, is_active);

-- Filtros por specs
CREATE INDEX idx_spec_filter ON product_spec_value(spec_definition_id, value_number);
CREATE INDEX idx_spec_filter_string ON product_spec_value(spec_definition_id, value_string(50));

-- Landing lookup
CREATE INDEX idx_landing_lookup ON landing(slug, is_active);

-- Tags activos
CREATE INDEX idx_tag_active ON tag(is_active, tag_type, valid_from, valid_until);
```

---

## 9. Consideraciones de Cache

| Entidad | TTL Recomendado | Invalidación |
|---------|-----------------|--------------|
| Products | 5 min | Al actualizar producto |
| Landing config | 15 min | Al guardar en admin |
| Form fields | 30 min | Al modificar formulario |
| Filters | 10 min | Al cambiar catálogo |
| Tags | 5 min | Al crear/editar tag |

---

**Documento generado automáticamente** | **Total: 42 tablas UI**
