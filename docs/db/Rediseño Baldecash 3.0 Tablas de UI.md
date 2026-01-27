# Sistema BaldeCash - Tablas UI/Flujo del Cliente

**Versión:** 3.0 | **Fecha:** Enero 2026 | **Tipo:** Estructura Frontend v0.5

---

## 1. Resumen

Este documento contiene las **tablas que afectan directamente la interfaz de usuario** y el flujo del cliente en el sitio web. Estas tablas son consultadas en tiempo real durante la navegación del usuario.

### 1.1 Módulos Incluidos

| Módulo | Tablas | Descripción |
|--------|--------|-------------|
| Core (parcial) | 4 | Instituciones, convenios, carreras |
| Products | 21 | Catálogo completo + colores, uso, gama |
| Landing Configuration | 18 | Configuración de landings + contenido |
| Form Builder | 9 | Formularios dinámicos + tooltips |
| Catalog & Filters | 6 | Filtros, ordenamiento, comparador |
| Quiz | 5 | Sistema de quiz configurable |
| Result Pages | 4 | Páginas de resultado (aprobación/rechazo) |
| Finance | 2 | Plazos y opciones de inicial |
| **Total** | **69** | Tablas que renderizan UI |

### 1.2 Características Críticas

- **Latencia**: Estas tablas deben responder en < 100ms
- **Cache**: Altamente cacheables (productos, landings, forms)
- **Índices**: Optimizados para SELECT frecuentes
- **Joins**: Múltiples joins en queries de catálogo

---

## 2. Módulo Core (4 tablas)

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

## 3. Módulo Products (21 tablas)

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

### 3.3 gama_tier (NUEVO v3.0)

Niveles de gama de productos.

```sql
CREATE TABLE `gama_tier` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL COMMENT 'economica, estudiante, profesional, creativa, gamer',
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(200),
  `price_range_min` DECIMAL(10,2),
  `price_range_max` DECIMAL(10,2),
  `badge_color` VARCHAR(7) COMMENT 'Color del badge',
  `badge_icon` VARCHAR(50),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gama_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO `gama_tier` (`code`, `name`, `price_range_min`, `price_range_max`, `display_order`) VALUES
('economica', 'Económica', 1000, 2000, 1),
('estudiante', 'Estudiante', 2000, 3500, 2),
('profesional', 'Profesional', 3500, 5500, 3),
('creativa', 'Creativa', 5000, 8000, 4),
('gamer', 'Gamer', 4000, 10000, 5);
```

### 3.4 product (ACTUALIZADO v3.0)

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
  `gama_tier_id` BIGINT UNSIGNED COMMENT 'Nivel de gama del producto',
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio') NOT NULL,
  `condition` ENUM('nuevo', 'reacondicionado', 'open_box') DEFAULT 'nuevo',
  `list_price` DECIMAL(10,2) NOT NULL,
  `sale_price` DECIMAL(10,2),
  `cost_price` DECIMAL(10,2),
  `stock_quantity` INT DEFAULT 0,
  `min_stock_alert` INT DEFAULT 5,
  `stock_status` ENUM('in_stock', 'low_stock', 'out_of_stock', 'preorder', 'discontinued') DEFAULT 'in_stock',
  `warranty_months` TINYINT UNSIGNED DEFAULT 12,
  `weight_kg` DECIMAL(6,2),
  `delivery_days_min` TINYINT UNSIGNED DEFAULT 3,
  `delivery_days_max` TINYINT UNSIGNED DEFAULT 7,
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
  KEY `idx_product_gama` (`gama_tier_id`),
  KEY `idx_product_type` (`product_type`),
  KEY `idx_product_stock_status` (`stock_status`, `is_active`),
  KEY `idx_product_active_featured` (`is_active`, `is_featured`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`),
  CONSTRAINT `fk_product_gama` FOREIGN KEY (`gama_tier_id`) REFERENCES `gama_tier` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.5 color (NUEVO v3.0)

Catálogo maestro de colores disponibles.

```sql
CREATE TABLE `color` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL COMMENT 'Identificador único: silver, black, midnight',
  `name` VARCHAR(50) NOT NULL COMMENT 'Nombre display: Plata, Negro, Medianoche',
  `name_en` VARCHAR(50) COMMENT 'Nombre en inglés para SEO',
  `hex_code` VARCHAR(7) NOT NULL COMMENT 'Código hex: #C0C0C0',
  `rgb` VARCHAR(20) COMMENT 'RGB: 192,192,192',
  `color_family` ENUM('neutral', 'warm', 'cool', 'metallic', 'accent') DEFAULT 'neutral',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_color_code` (`code`),
  KEY `idx_color_family` (`color_family`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO `color` (`code`, `name`, `hex_code`, `color_family`) VALUES
('silver', 'Plata', '#C0C0C0', 'metallic'),
('black', 'Negro', '#1a1a1a', 'neutral'),
('white', 'Blanco', '#FFFFFF', 'neutral'),
('gold', 'Dorado', '#FFD700', 'metallic'),
('rose-gold', 'Oro Rosa', '#B76E79', 'metallic'),
('space-gray', 'Gris Espacial', '#4A4A4A', 'neutral'),
('midnight', 'Medianoche', '#191970', 'cool'),
('starlight', 'Luz Estelar', '#F5F5DC', 'warm'),
('blue', 'Azul', '#4654CD', 'cool'),
('green', 'Verde', '#22c55e', 'cool'),
('red', 'Rojo', '#ef4444', 'warm'),
('purple', 'Morado', '#8b5cf6', 'cool');
```

### 3.6 product_color (NUEVO v3.0)

Colores disponibles para cada producto.

```sql
CREATE TABLE `product_color` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `color_id` BIGINT UNSIGNED NOT NULL,
  `sku_suffix` VARCHAR(20) COMMENT 'Sufijo SKU: -SLV, -BLK',
  `price_adjustment` DECIMAL(10,2) DEFAULT 0 COMMENT 'Ajuste de precio por color',
  `stock_quantity` INT DEFAULT 0,
  `image_url` VARCHAR(500) COMMENT 'Imagen del producto en este color',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Color mostrado por defecto',
  `display_order` INT DEFAULT 0,
  `is_available` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_color` (`product_id`, `color_id`),
  KEY `idx_color_product` (`color_id`, `product_id`),
  KEY `idx_product_default` (`product_id`, `is_default`),
  CONSTRAINT `fk_pc_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_color` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.7 usage_type (NUEVO v3.0)

Tipos de uso para productos.

```sql
CREATE TABLE `usage_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL COMMENT 'estudios, gaming, diseño, oficina, programacion',
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(200),
  `icon` VARCHAR(50) NOT NULL COMMENT 'Icono Lucide: GraduationCap, Gamepad2',
  `color` VARCHAR(7) COMMENT 'Color asociado: #4654CD',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usage_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO `usage_type` (`code`, `name`, `icon`, `display_order`) VALUES
('estudios', 'Estudios', 'GraduationCap', 1),
('gaming', 'Gaming', 'Gamepad2', 2),
('diseño', 'Diseño', 'Palette', 3),
('oficina', 'Oficina', 'Briefcase', 4),
('programacion', 'Programación', 'Code', 5);
```

### 3.8 product_usage (NUEVO v3.0)

Relación producto-uso con nivel de compatibilidad.

```sql
CREATE TABLE `product_usage` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `usage_type_id` BIGINT UNSIGNED NOT NULL,
  `compatibility_level` ENUM('ideal', 'good', 'basic', 'not_recommended') NOT NULL DEFAULT 'good',
  `compatibility_score` TINYINT UNSIGNED DEFAULT 80 COMMENT '0-100 score',
  `notes` VARCHAR(200) COMMENT 'Notas específicas de compatibilidad',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_usage` (`product_id`, `usage_type_id`),
  KEY `idx_usage_product` (`usage_type_id`, `compatibility_level`),
  CONSTRAINT `fk_pu_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pu_usage` FOREIGN KEY (`usage_type_id`) REFERENCES `usage_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.9 spec_definition (ACTUALIZADO v3.0)

Modelo EAV con tooltips educativos.

```sql
CREATE TABLE `spec_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: ram_gb, ssd_gb, gpu_type',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `data_type` ENUM('string', 'number', 'boolean') NOT NULL,
  `unit` VARCHAR(20) COMMENT 'GB, Hz, pulgadas',
  `icon` VARCHAR(50) COMMENT 'Nombre del icono Lucide',

  -- Tooltips educativos (v3.0)
  `tooltip_title` VARCHAR(100) COMMENT 'Título del tooltip: ¿Qué es la RAM?',
  `tooltip_description` TEXT COMMENT 'Explicación educativa para usuarios',
  `tooltip_recommendation` VARCHAR(300) COMMENT 'Recomendación según uso',

  -- Configuración de filtro (v3.0)
  `min_value` DECIMAL(15,4) COMMENT 'Valor mínimo para sliders',
  `max_value` DECIMAL(15,4) COMMENT 'Valor máximo para sliders',
  `step_value` DECIMAL(15,4) COMMENT 'Incremento para sliders',
  `filter_display_type` ENUM('chips', 'slider', 'checkbox', 'radio', 'dropdown') DEFAULT 'chips',

  `is_filterable` TINYINT(1) DEFAULT 0,
  `is_comparable` TINYINT(1) DEFAULT 0,
  `is_highlight` TINYINT(1) DEFAULT 0 COMMENT 'Mostrar en card de producto',
  `display_order` INT DEFAULT 0,
  `group_code` VARCHAR(50) COMMENT 'Grupo: performance, display, connectivity',
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

### 3.10 spec_product_type

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

### 3.11 product_spec_value

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

### 3.12 tag

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

### 3.13 product_tag

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

### 3.14 product_image

```sql
CREATE TABLE `product_image` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `color_id` BIGINT UNSIGNED COMMENT 'Imagen específica para un color',
  `url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(200),
  `image_type` ENUM('main', 'gallery', 'thumbnail', '360', 'video_thumbnail') DEFAULT 'gallery',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_image_product` (`product_id`, `display_order`),
  KEY `idx_image_color` (`product_id`, `color_id`),
  CONSTRAINT `fk_image_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_image_color` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.15 product_pricing

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

### 3.16 accessory

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

### 3.17 accessory_product_type

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

### 3.18 insurance

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

### 3.19 combo

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

### 3.20 combo_item

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

## 4. Módulo Landing Configuration (18 tablas)

Configuración dinámica de landings y contenido.

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

### 4.2 landing (ACTUALIZADO v3.0)

```sql
CREATE TABLE `landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED,
  `code` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `institution_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,

  -- Hero Configuration (v3.0)
  `hero_config` JSON COMMENT 'Config completa JSON (legacy)',
  `hero_headline` VARCHAR(200),
  `hero_subheadline` VARCHAR(300),
  `hero_image_url` VARCHAR(500),
  `hero_image_position` ENUM('left', 'right', 'center', 'background') DEFAULT 'right',
  `hero_cta_text` VARCHAR(50),
  `hero_cta_url` VARCHAR(300),
  `hero_secondary_cta_text` VARCHAR(50),
  `hero_secondary_cta_url` VARCHAR(300),

  -- Theme Configuration (v3.0)
  `theme_overrides` JSON,
  `primary_color` VARCHAR(7) DEFAULT '#4654CD',
  `secondary_color` VARCHAR(7) DEFAULT '#03DBD0',
  `accent_color` VARCHAR(7),
  `min_monthly_quota` DECIMAL(10,2) COMMENT 'Cuota mínima para mostrar "Desde S/XX"',

  -- Navbar Configuration (v3.0)
  `navbar_style` ENUM('transparent', 'solid', 'gradient') DEFAULT 'transparent',
  `show_promo_banner` TINYINT(1) DEFAULT 0,
  `promo_banner_text` VARCHAR(200),
  `promo_banner_url` VARCHAR(300),

  -- WhatsApp Configuration (v3.0)
  `whatsapp_number` VARCHAR(20),
  `whatsapp_message` VARCHAR(300),
  `show_whatsapp_float` TINYINT(1) DEFAULT 1,

  -- Features y Analytics
  `feature_flags` JSON,
  `analytics_config` JSON,

  -- SEO
  `meta_title` VARCHAR(200),
  `meta_description` VARCHAR(500),
  `og_image_url` VARCHAR(500),

  -- Status
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

### 4.3 landing_nav_item (NUEVO v3.0)

Items de navegación por landing.

```sql
CREATE TABLE `landing_nav_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `label` VARCHAR(50) NOT NULL,
  `href` VARCHAR(300) NOT NULL,
  `target` ENUM('_self', '_blank') DEFAULT '_self',
  `icon` VARCHAR(50),
  `is_highlighted` TINYINT(1) DEFAULT 0 COMMENT 'Botón destacado',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `show_on_mobile` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nav_landing` (`landing_id`, `display_order`),
  CONSTRAINT `fk_lni_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.4 landing_testimonial (NUEVO v3.0)

Testimonios por landing.

```sql
CREATE TABLE `landing_testimonial` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = testimonios globales',
  `name` VARCHAR(100) NOT NULL,
  `institution_code` VARCHAR(20) COMMENT 'Código de institución',
  `role` VARCHAR(100) COMMENT 'Estudiante de Ingeniería, Egresado',
  `quote` TEXT NOT NULL,
  `avatar_url` VARCHAR(500),
  `rating` TINYINT UNSIGNED DEFAULT 5 COMMENT '1-5 estrellas',
  `product_purchased` VARCHAR(200) COMMENT 'Producto que compró',
  `verified` TINYINT(1) DEFAULT 0 COMMENT 'Testimonio verificado',
  `video_url` VARCHAR(500),
  `display_order` INT DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_testimonial_landing` (`landing_id`, `is_active`, `display_order`),
  KEY `idx_testimonial_featured` (`is_featured`, `is_active`),
  CONSTRAINT `fk_lt_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.5 landing_faq (NUEVO v3.0)

Preguntas frecuentes por landing.

```sql
CREATE TABLE `landing_faq` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = FAQ global',
  `category` VARCHAR(50) NOT NULL COMMENT 'General, Pagos, Envío, Garantía',
  `question` VARCHAR(300) NOT NULL,
  `answer` TEXT NOT NULL,
  `icon` VARCHAR(50),
  `display_order` INT DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Mostrar en sección destacada',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_faq_landing` (`landing_id`, `category`, `display_order`),
  KEY `idx_faq_featured` (`is_featured`, `is_active`),
  CONSTRAINT `fk_lf_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.6 landing_how_it_works_step (NUEVO v3.0)

Pasos de "Cómo Funciona" por landing.

```sql
CREATE TABLE `landing_how_it_works_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = pasos globales',
  `step_number` TINYINT UNSIGNED NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `icon_color` VARCHAR(7),
  `image_url` VARCHAR(500),
  `cta_text` VARCHAR(50),
  `cta_url` VARCHAR(300),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hiw_landing` (`landing_id`, `display_order`),
  CONSTRAINT `fk_hiw_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.7 landing_requirement (NUEVO v3.0)

Requisitos mostrados en landing.

```sql
CREATE TABLE `landing_requirement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = requisitos globales',
  `text` VARCHAR(200) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `tooltip` VARCHAR(300),
  `is_mandatory` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_req_landing` (`landing_id`, `display_order`),
  CONSTRAINT `fk_lr_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.8 landing_trust_signal (NUEVO v3.0)

Señales de confianza (SBS, 24h, etc).

```sql
CREATE TABLE `landing_trust_signal` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = señales globales',
  `text` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `tooltip` VARCHAR(300),
  `url` VARCHAR(300),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trust_landing` (`landing_id`, `display_order`),
  CONSTRAINT `fk_ts_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.9 landing_social_proof (NUEVO v3.0)

Métricas de social proof.

```sql
CREATE TABLE `landing_social_proof` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `student_count` INT UNSIGNED DEFAULT 0 COMMENT 'Estudiantes atendidos',
  `institution_count` INT UNSIGNED DEFAULT 0 COMMENT 'Instituciones aliadas',
  `years_in_market` TINYINT UNSIGNED DEFAULT 0,
  `approval_rate` DECIMAL(5,2) COMMENT 'Porcentaje de aprobación',
  `nps_score` DECIMAL(4,2) COMMENT 'Net Promoter Score',
  `google_rating` DECIMAL(2,1) COMMENT 'Rating de Google',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_social_landing` (`landing_id`),
  CONSTRAINT `fk_sp_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.10 media_mention (NUEVO v3.0)

Menciones en medios.

```sql
CREATE TABLE `media_mention` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'RPP, Gestión, Forbes',
  `logo_url` VARCHAR(500) NOT NULL,
  `article_url` VARCHAR(500),
  `article_title` VARCHAR(200),
  `mention_date` DATE,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.11 landing_footer_link (NUEVO v3.0)

Links del footer por landing.

```sql
CREATE TABLE `landing_footer_link` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = links globales',
  `section` VARCHAR(50) NOT NULL COMMENT 'company, legal, support, social',
  `label` VARCHAR(100) NOT NULL,
  `href` VARCHAR(300) NOT NULL,
  `icon` VARCHAR(50),
  `target` ENUM('_self', '_blank') DEFAULT '_self',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_footer_landing` (`landing_id`, `section`, `display_order`),
  CONSTRAINT `fk_lfl_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.12-4.18 Tablas Adicionales del Módulo

Las siguientes tablas mantienen su estructura original:
- `landing_inheritance`
- `feature_definition`
- `landing_feature`
- `landing_promotion`
- `landing_product`
- `landing_accessory`
- `landing_insurance`

---

## 5. Módulo Form Builder (9 tablas)

Formularios dinámicos configurables.

### 5.1 form_step

```sql
CREATE TABLE `form_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(50),
  `step_type` ENUM('form', 'upsell', 'confirmation') DEFAULT 'form',
  `category` VARCHAR(50) COMMENT 'identity, contact, academic, work, references',
  `is_system` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_step_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.2 form_field (ACTUALIZADO v3.0)

```sql
CREATE TABLE `form_field` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: document_number, email',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `field_type` ENUM('text', 'number', 'email', 'tel', 'date', 'select', 'radio', 'checkbox', 'textarea', 'file', 'hidden', 'segmented') NOT NULL,
  `default_label` VARCHAR(100),
  `default_placeholder` VARCHAR(200),
  `default_help_text` VARCHAR(300),

  -- Tooltips y ayuda (v3.0)
  `tooltip_text` VARCHAR(300) COMMENT 'Tooltip breve al hover',
  `info_modal_title` VARCHAR(100) COMMENT 'Título del modal de info',
  `info_modal_content` TEXT COMMENT 'Contenido detallado del modal',

  -- Configuración de input (v3.0)
  `autocomplete` VARCHAR(50) COMMENT 'given-name, email, tel',
  `input_mode` VARCHAR(20) COMMENT 'numeric, tel, email, decimal',
  `prefix` VARCHAR(20) COMMENT 'S/, +51, $',
  `suffix` VARCHAR(20) COMMENT 'meses, años, %',
  `mask` VARCHAR(50) COMMENT 'Máscara: 999-999-999',

  `data_type` ENUM('string', 'number', 'boolean', 'date', 'file', 'array') DEFAULT 'string',
  `is_system` TINYINT(1) DEFAULT 0 COMMENT 'Campo del sistema, no editable',
  `is_pii` TINYINT(1) DEFAULT 0 COMMENT 'Datos personales sensibles',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_field_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.3 field_tooltip (NUEVO v3.0)

Tooltips personalizados por campo y landing.

```sql
CREATE TABLE `field_tooltip` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `field_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = tooltip global para el campo',
  `tooltip_text` VARCHAR(300),
  `modal_title` VARCHAR(100),
  `modal_content` TEXT,
  `modal_image_url` VARCHAR(500),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_field_tooltip` (`field_id`, `landing_id`),
  CONSTRAINT `fk_ft_field` FOREIGN KEY (`field_id`) REFERENCES `form_field` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ft_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.4-5.9 Tablas Restantes del Módulo

Las siguientes tablas mantienen su estructura original:
- `form_field_group`
- `landing_step`
- `landing_field`
- `field_validation`
- `field_option`
- `field_dependency`

---

## 6. Módulo Catalog & Filters (6 tablas)

Sistema de filtros dinámicos y comparador.

### 6.1 filter_definition (ACTUALIZADO v3.0)

```sql
CREATE TABLE `filter_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre interno',
  `display_name` VARCHAR(100) COMMENT 'Nombre mostrado en UI',

  -- Tooltips educativos (v3.0)
  `tooltip_title` VARCHAR(100),
  `tooltip_description` TEXT,
  `tooltip_recommendation` VARCHAR(300),
  `icon` VARCHAR(50),

  `filter_type` ENUM('checkbox', 'radio', 'range', 'select', 'search', 'chips', 'color') NOT NULL,
  `source_type` ENUM('spec', 'brand', 'category', 'price', 'custom', 'usage', 'gama', 'color', 'condition') NOT NULL,
  `source_spec_id` BIGINT UNSIGNED,

  -- Configuración de display (v3.0)
  `collapsed_by_default` TINYINT(1) DEFAULT 0,
  `show_count` TINYINT(1) DEFAULT 1 COMMENT 'Mostrar conteo de productos',

  -- Configuración de rango (v3.0)
  `min_value` DECIMAL(15,4),
  `max_value` DECIMAL(15,4),
  `step_value` DECIMAL(15,4),

  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filter_code` (`code`),
  CONSTRAINT `fk_filter_spec` FOREIGN KEY (`source_spec_id`) REFERENCES `spec_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.2 filter_value

```sql
CREATE TABLE `filter_value` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filter_definition_id` BIGINT UNSIGNED NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50),
  `color` VARCHAR(7),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_filter_value` (`filter_definition_id`, `display_order`),
  CONSTRAINT `fk_fv_filter` FOREIGN KEY (`filter_definition_id`) REFERENCES `filter_definition` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.3 landing_filter

```sql
CREATE TABLE `landing_filter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `filter_definition_id` BIGINT UNSIGNED NOT NULL,
  `is_enabled` TINYINT(1) DEFAULT 1,
  `is_expanded` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_filter` (`landing_id`, `filter_definition_id`),
  CONSTRAINT `fk_lf_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lf_filter` FOREIGN KEY (`filter_definition_id`) REFERENCES `filter_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.4 sort_option

```sql
CREATE TABLE `sort_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED,
  `code` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `field_name` VARCHAR(100) NOT NULL,
  `direction` ENUM('asc', 'desc') DEFAULT 'asc',
  `is_default` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sort_landing` (`landing_id`, `display_order`),
  CONSTRAINT `fk_so_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.5 comparator_config (NUEVO v3.0)

Configuración del comparador por landing.

```sql
CREATE TABLE `comparator_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = config global',
  `max_products` TINYINT UNSIGNED DEFAULT 4,
  `layout_style` ENUM('modal', 'page', 'drawer') DEFAULT 'modal',
  `highlight_winner` TINYINT(1) DEFAULT 1,
  `highlight_style` ENUM('semantic', 'neutral', 'bold') DEFAULT 'semantic',
  `show_price_diff` TINYINT(1) DEFAULT 1,
  `default_term` TINYINT UNSIGNED DEFAULT 24,
  `default_initial_percent` TINYINT UNSIGNED DEFAULT 10,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comparator_landing` (`landing_id`),
  CONSTRAINT `fk_cc_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.6 comparator_spec (NUEVO v3.0)

Specs a mostrar en comparador por landing.

```sql
CREATE TABLE `comparator_spec` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `comparator_config_id` BIGINT UNSIGNED NOT NULL,
  `spec_definition_id` BIGINT UNSIGNED NOT NULL,
  `display_order` INT DEFAULT 0,
  `is_highlighted` TINYINT(1) DEFAULT 0 COMMENT 'Spec importante a destacar',
  `comparison_type` ENUM('higher_better', 'lower_better', 'equal', 'none') DEFAULT 'none',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comparator_spec` (`comparator_config_id`, `spec_definition_id`),
  CONSTRAINT `fk_cs_config` FOREIGN KEY (`comparator_config_id`) REFERENCES `comparator_config` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cs_spec` FOREIGN KEY (`spec_definition_id`) REFERENCES `spec_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. Módulo Quiz (5 tablas) - NUEVO v3.0

Sistema de quiz configurable para ayudar a usuarios a encontrar productos.

### 7.1 quiz

Definición de quizzes por landing.

```sql
CREATE TABLE `quiz` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = quiz global',
  `quiz_type` ENUM('product_finder', 'needs_assessment', 'eligibility') DEFAULT 'product_finder',
  `intro_title` VARCHAR(200),
  `intro_description` TEXT,
  `intro_image_url` VARCHAR(500),
  `results_title` VARCHAR(200),
  `results_description` TEXT,
  `min_questions` TINYINT UNSIGNED DEFAULT 1,
  `max_questions` TINYINT UNSIGNED DEFAULT 10,
  `show_progress` TINYINT(1) DEFAULT 1,
  `allow_skip` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quiz_code` (`code`),
  KEY `idx_quiz_landing` (`landing_id`),
  CONSTRAINT `fk_quiz_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.2 quiz_question

Preguntas del quiz.

```sql
CREATE TABLE `quiz_question` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quiz_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `question_text` VARCHAR(300) NOT NULL,
  `question_subtext` VARCHAR(200),
  `question_type` ENUM('single_choice', 'multiple_choice', 'scale', 'budget_range') DEFAULT 'single_choice',
  `icon` VARCHAR(50),
  `image_url` VARCHAR(500),
  `display_style` ENUM('pills', 'cards', 'icons', 'images', 'slider') DEFAULT 'pills',
  `display_order` INT NOT NULL,
  `is_required` TINYINT(1) DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quiz_question` (`quiz_id`, `code`),
  KEY `idx_question_order` (`quiz_id`, `display_order`),
  CONSTRAINT `fk_qq_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.3 quiz_option

Opciones de respuesta para cada pregunta.

```sql
CREATE TABLE `quiz_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `description` VARCHAR(200),
  `icon` VARCHAR(50),
  `image_url` VARCHAR(500),
  `display_order` INT NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_option_code` (`question_id`, `code`),
  KEY `idx_option_order` (`question_id`, `display_order`),
  CONSTRAINT `fk_qo_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_question` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.4 quiz_option_filter_mapping

Mapeo de opciones a filtros del catálogo.

```sql
CREATE TABLE `quiz_option_filter_mapping` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `option_id` BIGINT UNSIGNED NOT NULL,
  `filter_type` ENUM('brand', 'category', 'spec', 'usage', 'gama', 'price_range', 'condition') NOT NULL,
  `filter_code` VARCHAR(50) NOT NULL COMMENT 'Código del filtro: ram_gb, brand_apple',
  `filter_value` VARCHAR(100) COMMENT 'Valor específico o rango: 16, [2000,4000]',
  `filter_operator` ENUM('equals', 'gte', 'lte', 'between', 'in', 'contains') DEFAULT 'equals',
  `weight` DECIMAL(5,2) DEFAULT 1.00 COMMENT 'Peso para scoring',
  `is_exclusive` TINYINT(1) DEFAULT 0 COMMENT 'Si excluye otros valores',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mapping_option` (`option_id`),
  KEY `idx_mapping_filter` (`filter_type`, `filter_code`),
  CONSTRAINT `fk_qofm_option` FOREIGN KEY (`option_id`) REFERENCES `quiz_option` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.5 quiz_result_template

Templates de resultados según combinaciones.

```sql
CREATE TABLE `quiz_result_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quiz_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `condition_json` JSON COMMENT 'Condiciones para mostrar este resultado',
  `headline` VARCHAR(200),
  `description` TEXT,
  `recommendation_text` VARCHAR(300),
  `fallback_priority` INT DEFAULT 100 COMMENT 'Menor = más prioritario como fallback',
  `is_default` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_result_code` (`quiz_id`, `code`),
  CONSTRAINT `fk_qrt_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8. Módulo Result Pages (4 tablas) - NUEVO v3.0

Páginas de resultado (aprobación, rechazo, recibido).

### 8.1 result_page_config

Configuración de páginas de resultado por landing.

```sql
CREATE TABLE `result_page_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = config global',
  `result_type` ENUM('approved', 'rejected', 'received', 'pending', 'error') NOT NULL,

  -- Contenido principal
  `headline` VARCHAR(200) NOT NULL,
  `subheadline` VARCHAR(300),
  `message_template` TEXT COMMENT 'Con placeholders: {{nombre}}, {{producto}}',
  `illustration_type` ENUM('celebration', 'document', 'waiting', 'sad', 'custom') DEFAULT 'celebration',
  `illustration_url` VARCHAR(500),

  -- CTAs
  `primary_cta_text` VARCHAR(50),
  `primary_cta_url` VARCHAR(300),
  `secondary_cta_text` VARCHAR(50),
  `secondary_cta_url` VARCHAR(300),

  -- Configuración
  `show_confetti` TINYINT(1) DEFAULT 0,
  `show_share_buttons` TINYINT(1) DEFAULT 0,
  `show_referral_cta` TINYINT(1) DEFAULT 0,
  `show_create_account` TINYINT(1) DEFAULT 0,

  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_result_config` (`landing_id`, `result_type`),
  CONSTRAINT `fk_rpc_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.2 result_next_step

Pasos siguientes para cada tipo de resultado.

```sql
CREATE TABLE `result_next_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `result_config_id` BIGINT UNSIGNED NOT NULL,
  `step_number` TINYINT UNSIGNED NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `icon` VARCHAR(50),
  `estimated_time` VARCHAR(50) COMMENT '24-48 horas, 3-5 días',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_step_config` (`result_config_id`, `display_order`),
  CONSTRAINT `fk_rns_config` FOREIGN KEY (`result_config_id`) REFERENCES `result_page_config` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.3 rejection_reason

Razones de rechazo configurables.

```sql
CREATE TABLE `rejection_reason` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `internal_name` VARCHAR(100) NOT NULL COMMENT 'Nombre interno para admins',
  `display_title` VARCHAR(150) NOT NULL COMMENT 'Título mostrado al usuario',
  `display_message` TEXT NOT NULL COMMENT 'Mensaje empático y constructivo',
  `actionable_tip` VARCHAR(300) COMMENT 'Consejo accionable',
  `retry_days` INT UNSIGNED DEFAULT 30 COMMENT 'Días para reintentar',
  `show_alternatives` TINYINT(1) DEFAULT 1 COMMENT 'Mostrar productos alternativos',
  `show_down_payment_calc` TINYINT(1) DEFAULT 1 COMMENT 'Mostrar calculadora con inicial',
  `alternative_price_factor` DECIMAL(3,2) DEFAULT 0.70 COMMENT 'Factor para buscar alternativas (70%)',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rejection_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO `rejection_reason` (`code`, `internal_name`, `display_title`, `display_message`, `actionable_tip`, `retry_days`) VALUES
('insufficient_income', 'Ingresos insuficientes', 'Tu capacidad de pago actual',
 'Basándonos en la información proporcionada, el monto mensual supera el 30% de tus ingresos declarados, lo cual podría afectar tu economía.',
 'Considera un equipo de menor valor o aumenta tu inicial para reducir la cuota mensual.', 30),
('no_student_status', 'No es estudiante activo', 'Verificación de estudios',
 'No pudimos verificar tu condición de estudiante activo. Este programa está diseñado exclusivamente para estudiantes.',
 'Asegúrate de tener tu constancia de estudios actualizada del ciclo actual.', 15),
('document_issues', 'Problemas con documentos', 'Documentación incompleta',
 'Algunos documentos no pudieron ser verificados correctamente.',
 'Revisa que tu DNI esté vigente y tu constancia de estudios sea del ciclo actual.', 7);
```

### 8.4 rejection_educational_content

Contenido educativo para rechazos.

```sql
CREATE TABLE `rejection_educational_content` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rejection_reason_id` BIGINT UNSIGNED NOT NULL,
  `content_type` ENUM('tip', 'resource', 'video', 'article') DEFAULT 'tip',
  `title` VARCHAR(150) NOT NULL,
  `content` TEXT,
  `icon` VARCHAR(50),
  `url` VARCHAR(500),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_edu_reason` (`rejection_reason_id`, `display_order`),
  CONSTRAINT `fk_rec_reason` FOREIGN KEY (`rejection_reason_id`) REFERENCES `rejection_reason` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 9. Módulo Finance (2 tablas) - NUEVO v3.0

Configuración de plazos y opciones de financiamiento.

### 9.1 financing_term

Plazos disponibles configurables.

```sql
CREATE TABLE `financing_term` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `months` TINYINT UNSIGNED NOT NULL,
  `label` VARCHAR(50) NOT NULL COMMENT '12 meses, 1 año',
  `label_short` VARCHAR(20) COMMENT '12m, 1a',
  `default_tea` DECIMAL(6,3) NOT NULL,
  `default_tcea` DECIMAL(6,3),
  `interest_multiplier` DECIMAL(5,4) DEFAULT 1.0000 COMMENT 'Factor sobre precio base',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Mostrar destacado',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_term_months` (`months`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO `financing_term` (`months`, `label`, `label_short`, `default_tea`, `interest_multiplier`, `is_featured`, `display_order`) VALUES
(6, '6 meses', '6m', 38.000, 1.08, 0, 1),
(12, '12 meses', '12m', 42.500, 1.12, 1, 2),
(18, '18 meses', '18m', 45.000, 1.15, 0, 3),
(24, '24 meses', '24m', 48.000, 1.22, 1, 4),
(36, '36 meses', '36m', 52.000, 1.30, 0, 5);
```

### 9.2 down_payment_option

Opciones de inicial.

```sql
CREATE TABLE `down_payment_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `percentage` TINYINT UNSIGNED NOT NULL,
  `label` VARCHAR(50) NOT NULL COMMENT '10% inicial, Sin inicial',
  `discount_on_total` DECIMAL(5,2) DEFAULT 0 COMMENT 'Descuento adicional por inicial',
  `is_default` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_down_payment` (`percentage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO `down_payment_option` (`percentage`, `label`, `is_default`, `display_order`) VALUES
(0, 'Sin inicial', 0, 1),
(10, '10% inicial', 1, 2),
(15, '15% inicial', 0, 3),
(20, '20% inicial', 0, 4),
(30, '30% inicial', 0, 5);
```

---

## 10. Queries Frecuentes de UI

### 10.1 Listado de productos con filtros y colores

```sql
SELECT
  p.id, p.sku, p.name, p.slug, p.short_description,
  p.list_price, p.sale_price, p.condition, p.stock_status,
  b.name AS brand_name, b.logo_url AS brand_logo,
  c.name AS category_name,
  g.name AS gama_name, g.badge_color AS gama_color,
  pi.url AS main_image,
  MIN(pp.monthly_payment) AS min_monthly,
  GROUP_CONCAT(DISTINCT t.code) AS tags,
  JSON_ARRAYAGG(
    JSON_OBJECT('code', col.code, 'name', col.name, 'hex', col.hex_code)
  ) AS colors
FROM product p
JOIN brand b ON b.id = p.brand_id
JOIN category c ON c.id = p.category_id
LEFT JOIN gama_tier g ON g.id = p.gama_tier_id
LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.image_type = 'main'
LEFT JOIN product_pricing pp ON pp.product_id = p.id AND pp.is_active = 1
LEFT JOIN product_tag pt ON pt.product_id = p.id
LEFT JOIN tag t ON t.id = pt.tag_id AND t.is_active = 1
LEFT JOIN product_color pc ON pc.product_id = p.id AND pc.is_available = 1
LEFT JOIN color col ON col.id = pc.color_id
WHERE p.is_active = 1
  AND p.product_type = 'laptop'
GROUP BY p.id
ORDER BY p.is_featured DESC, p.created_at DESC
LIMIT 20;
```

### 10.2 Detalle de producto con specs y tooltips

```sql
SELECT
  p.*,
  b.name AS brand_name,
  JSON_OBJECTAGG(
    sd.code,
    JSON_OBJECT(
      'value', psv.display_value,
      'tooltip_title', sd.tooltip_title,
      'tooltip_description', sd.tooltip_description,
      'tooltip_recommendation', sd.tooltip_recommendation
    )
  ) AS specs
FROM product p
JOIN brand b ON b.id = p.brand_id
LEFT JOIN product_spec_value psv ON psv.product_id = p.id
LEFT JOIN spec_definition sd ON sd.id = psv.spec_definition_id AND sd.is_active = 1
WHERE p.slug = 'hp-pavilion-15-eg3001'
GROUP BY p.id;
```

### 10.3 Landing con contenido completo

```sql
SELECT
  l.*,
  (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', lt.name, 'quote', lt.quote, 'avatar', lt.avatar_url, 'institution', lt.institution_code, 'rating', lt.rating))
   FROM landing_testimonial lt WHERE lt.landing_id = l.id AND lt.is_active = 1 ORDER BY lt.display_order) AS testimonials,
  (SELECT JSON_ARRAYAGG(JSON_OBJECT('question', lf.question, 'answer', lf.answer, 'category', lf.category))
   FROM landing_faq lf WHERE lf.landing_id = l.id AND lf.is_active = 1 ORDER BY lf.display_order) AS faqs,
  (SELECT JSON_ARRAYAGG(JSON_OBJECT('step', lh.step_number, 'title', lh.title, 'description', lh.description, 'icon', lh.icon))
   FROM landing_how_it_works_step lh WHERE lh.landing_id = l.id AND lh.is_active = 1 ORDER BY lh.display_order) AS how_it_works,
  lsp.student_count, lsp.institution_count, lsp.years_in_market
FROM landing l
LEFT JOIN landing_social_proof lsp ON lsp.landing_id = l.id
WHERE l.slug = 'senati'
  AND l.is_active = 1;
```

### 10.4 Quiz con preguntas y opciones

```sql
SELECT
  q.*,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'code', qq.code,
      'question', qq.question_text,
      'type', qq.question_type,
      'style', qq.display_style,
      'options', (
        SELECT JSON_ARRAYAGG(JSON_OBJECT('code', qo.code, 'label', qo.label, 'icon', qo.icon))
        FROM quiz_option qo WHERE qo.question_id = qq.id AND qo.is_active = 1 ORDER BY qo.display_order
      )
    )
  ) AS questions
FROM quiz q
JOIN quiz_question qq ON qq.quiz_id = q.id AND qq.is_active = 1
WHERE q.code = 'product-finder'
GROUP BY q.id;
```

---

## 11. Índices Recomendados para UI

```sql
-- Búsqueda de productos
CREATE INDEX idx_product_search ON product(name(100), is_active);
CREATE INDEX idx_product_price_range ON product(list_price, is_active);
CREATE INDEX idx_product_gama_active ON product(gama_tier_id, is_active);

-- Filtros por specs
CREATE INDEX idx_spec_filter ON product_spec_value(spec_definition_id, value_number);
CREATE INDEX idx_spec_filter_string ON product_spec_value(spec_definition_id, value_string(50));

-- Colores
CREATE INDEX idx_product_colors ON product_color(product_id, is_available, display_order);

-- Uso de productos
CREATE INDEX idx_product_usage_level ON product_usage(usage_type_id, compatibility_level);

-- Landing lookup
CREATE INDEX idx_landing_lookup ON landing(slug, is_active);

-- Tags activos
CREATE INDEX idx_tag_active ON tag(is_active, tag_type, valid_from, valid_until);

-- Testimonios por landing
CREATE INDEX idx_testimonial_active ON landing_testimonial(landing_id, is_active, is_featured);

-- FAQ por landing
CREATE INDEX idx_faq_category ON landing_faq(landing_id, category, is_active);

-- Quiz activo
CREATE INDEX idx_quiz_active ON quiz(landing_id, is_active);
```

---

## 12. Consideraciones de Cache

| Entidad | TTL Recomendado | Invalidación |
|---------|-----------------|--------------|
| Products | 5 min | Al actualizar producto |
| Product colors | 5 min | Al modificar colores |
| Landing config | 15 min | Al guardar en admin |
| Landing content (FAQs, testimonials) | 30 min | Al modificar contenido |
| Form fields | 30 min | Al modificar formulario |
| Filters | 10 min | Al cambiar catálogo |
| Tags | 5 min | Al crear/editar tag |
| Quiz | 30 min | Al modificar quiz |
| Financing terms | 60 min | Al modificar plazos |
| Result pages | 60 min | Al modificar templates |

---

## 13. Resumen de Tablas por Módulo

| Módulo | Tablas | Nuevas v3.0 |
|--------|--------|-------------|
| Core | 4 | 0 |
| Products | 21 | 6 (color, product_color, usage_type, product_usage, gama_tier, + actualizaciones) |
| Landing Configuration | 18 | 9 (nav_item, testimonial, faq, how_it_works, requirement, trust_signal, social_proof, media_mention, footer_link) |
| Form Builder | 9 | 1 (field_tooltip) |
| Catalog & Filters | 6 | 2 (comparator_config, comparator_spec) |
| Quiz | 5 | 5 (todas nuevas) |
| Result Pages | 4 | 4 (todas nuevas) |
| Finance | 2 | 2 (todas nuevas) |
| **Total** | **69** | **29** |

---

**Documento actualizado:** Enero 2026 | **Versión:** 3.0 | **Total: 69 tablas UI**
