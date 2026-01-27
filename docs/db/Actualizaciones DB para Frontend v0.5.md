# Actualizaciones de Base de Datos para Frontend v0.5

**Versión:** 1.0 | **Fecha:** Enero 2026 | **Autor:** Análisis Frontend v0.5

---

## Resumen de Cambios

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| **Tablas Nuevas** | 18 | Colores, Quiz, Contenido Landing, Resultados |
| **Tablas Modificadas** | 8 | Campos adicionales para soporte completo |
| **Campos Nuevos** | 45+ | En tablas existentes |

---

## 1. SISTEMA DE COLORES DE PRODUCTO

### 1.1 color (NUEVA)

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

### 1.2 product_color (NUEVA)

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

---

## 2. ACTUALIZACIONES A spec_definition

### 2.1 Campos adicionales para tooltips educativos

```sql
ALTER TABLE `spec_definition` ADD COLUMN `tooltip_title` VARCHAR(100) AFTER `icon`;
ALTER TABLE `spec_definition` ADD COLUMN `tooltip_description` TEXT AFTER `tooltip_title`;
ALTER TABLE `spec_definition` ADD COLUMN `tooltip_recommendation` VARCHAR(300) AFTER `tooltip_description`;
ALTER TABLE `spec_definition` ADD COLUMN `min_value` DECIMAL(15,4) AFTER `tooltip_recommendation`;
ALTER TABLE `spec_definition` ADD COLUMN `max_value` DECIMAL(15,4) AFTER `min_value`;
ALTER TABLE `spec_definition` ADD COLUMN `step_value` DECIMAL(15,4) AFTER `max_value`;
ALTER TABLE `spec_definition` ADD COLUMN `filter_display_type` ENUM('chips', 'slider', 'checkbox', 'radio', 'dropdown') DEFAULT 'chips' AFTER `step_value`;

-- Datos de ejemplo
UPDATE `spec_definition` SET
  `tooltip_title` = '¿Qué es la RAM?',
  `tooltip_description` = 'Es la memoria que usa tu equipo para ejecutar programas. Más RAM = más programas abiertos simultáneamente.',
  `tooltip_recommendation` = 'Mínimo 8GB para estudiantes, 16GB para diseño/programación.',
  `min_value` = 4,
  `max_value` = 64,
  `step_value` = 4,
  `filter_display_type` = 'chips'
WHERE `code` = 'ram_gb';
```

### 2.2 spec_definition actualizada completa

```sql
CREATE TABLE `spec_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: ram_gb, ssd_gb, gpu_type',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `data_type` ENUM('string', 'number', 'boolean') NOT NULL,
  `unit` VARCHAR(20) COMMENT 'GB, Hz, pulgadas',
  `icon` VARCHAR(50) COMMENT 'Nombre del icono Lucide',

  -- Tooltips educativos (NUEVO)
  `tooltip_title` VARCHAR(100) COMMENT 'Título del tooltip: ¿Qué es la RAM?',
  `tooltip_description` TEXT COMMENT 'Explicación educativa para usuarios',
  `tooltip_recommendation` VARCHAR(300) COMMENT 'Recomendación según uso',

  -- Configuración de filtro (NUEVO)
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

---

## 3. SISTEMA DE USO RECOMENDADO

### 3.1 usage_type (NUEVA)

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

### 3.2 product_usage (NUEVA)

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

### 3.3 gama_tier (NUEVA)

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

### 3.4 Actualización a tabla product

```sql
ALTER TABLE `product` ADD COLUMN `gama_tier_id` BIGINT UNSIGNED AFTER `warranty_months`;
ALTER TABLE `product` ADD COLUMN `stock_status` ENUM('in_stock', 'low_stock', 'out_of_stock', 'preorder', 'discontinued') DEFAULT 'in_stock' AFTER `min_stock_alert`;
ALTER TABLE `product` ADD COLUMN `delivery_days_min` TINYINT UNSIGNED DEFAULT 3 AFTER `weight_kg`;
ALTER TABLE `product` ADD COLUMN `delivery_days_max` TINYINT UNSIGNED DEFAULT 7 AFTER `delivery_days_min`;

ALTER TABLE `product` ADD CONSTRAINT `fk_product_gama`
  FOREIGN KEY (`gama_tier_id`) REFERENCES `gama_tier` (`id`);
```

---

## 4. SISTEMA DE QUIZ CONFIGURABLE

### 4.1 quiz (NUEVA)

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

### 4.2 quiz_question (NUEVA)

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

### 4.3 quiz_option (NUEVA)

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

### 4.4 quiz_option_filter_mapping (NUEVA)

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

### 4.5 quiz_result_template (NUEVA)

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

## 5. CONTENIDO DE LANDING CONFIGURABLE

### 5.1 landing_testimonial (NUEVA)

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

### 5.2 landing_faq (NUEVA)

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

### 5.3 landing_how_it_works_step (NUEVA)

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

### 5.4 landing_requirement (NUEVA)

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

### 5.5 landing_trust_signal (NUEVA)

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

### 5.6 landing_social_proof (NUEVA)

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

### 5.7 media_mention (NUEVA)

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

---

## 6. PÁGINAS DE RESULTADO

### 6.1 result_page_config (NUEVA)

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

### 6.2 result_next_step (NUEVA)

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

### 6.3 rejection_reason (NUEVA)

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

### 6.4 rejection_educational_content (NUEVA)

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

## 7. ACTUALIZACIONES AL FORM BUILDER

### 7.1 Campos adicionales para form_field

```sql
ALTER TABLE `form_field` ADD COLUMN `tooltip_text` VARCHAR(300) AFTER `help_text`;
ALTER TABLE `form_field` ADD COLUMN `info_modal_title` VARCHAR(100) AFTER `tooltip_text`;
ALTER TABLE `form_field` ADD COLUMN `info_modal_content` TEXT AFTER `info_modal_title`;
ALTER TABLE `form_field` ADD COLUMN `autocomplete` VARCHAR(50) AFTER `info_modal_content` COMMENT 'HTML autocomplete attribute';
ALTER TABLE `form_field` ADD COLUMN `input_mode` VARCHAR(20) AFTER `autocomplete` COMMENT 'numeric, tel, email, etc.';
ALTER TABLE `form_field` ADD COLUMN `prefix` VARCHAR(20) AFTER `input_mode` COMMENT 'S/, +51';
ALTER TABLE `form_field` ADD COLUMN `suffix` VARCHAR(20) AFTER `prefix` COMMENT 'meses, %';
ALTER TABLE `form_field` ADD COLUMN `mask` VARCHAR(50) AFTER `suffix` COMMENT 'Máscara de input: 999-999-999';
```

### 7.2 form_field actualizada completa

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

  -- Tooltips y ayuda (NUEVO)
  `tooltip_text` VARCHAR(300) COMMENT 'Tooltip breve al hover',
  `info_modal_title` VARCHAR(100) COMMENT 'Título del modal de info',
  `info_modal_content` TEXT COMMENT 'Contenido detallado del modal',

  -- Configuración de input (NUEVO)
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

### 7.3 field_tooltip (NUEVA - Alternativa para tooltips por campo)

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

---

## 8. ACTUALIZACIONES A LANDING

### 8.1 Campos adicionales para landing

```sql
-- Configuración de Hero
ALTER TABLE `landing` ADD COLUMN `hero_headline` VARCHAR(200) AFTER `hero_config`;
ALTER TABLE `landing` ADD COLUMN `hero_subheadline` VARCHAR(300) AFTER `hero_headline`;
ALTER TABLE `landing` ADD COLUMN `hero_image_url` VARCHAR(500) AFTER `hero_subheadline`;
ALTER TABLE `landing` ADD COLUMN `hero_image_position` ENUM('left', 'right', 'center', 'background') DEFAULT 'right' AFTER `hero_image_url`;
ALTER TABLE `landing` ADD COLUMN `hero_cta_text` VARCHAR(50) AFTER `hero_image_position`;
ALTER TABLE `landing` ADD COLUMN `hero_cta_url` VARCHAR(300) AFTER `hero_cta_text`;
ALTER TABLE `landing` ADD COLUMN `hero_secondary_cta_text` VARCHAR(50) AFTER `hero_cta_url`;
ALTER TABLE `landing` ADD COLUMN `hero_secondary_cta_url` VARCHAR(300) AFTER `hero_secondary_cta_text`;

-- Configuración de tema
ALTER TABLE `landing` ADD COLUMN `primary_color` VARCHAR(7) DEFAULT '#4654CD' AFTER `theme_overrides`;
ALTER TABLE `landing` ADD COLUMN `secondary_color` VARCHAR(7) DEFAULT '#03DBD0' AFTER `primary_color`;
ALTER TABLE `landing` ADD COLUMN `accent_color` VARCHAR(7) AFTER `secondary_color`;

-- Configuración de cuota mínima display
ALTER TABLE `landing` ADD COLUMN `min_monthly_quota` DECIMAL(10,2) AFTER `accent_color`;

-- Configuración de navbar
ALTER TABLE `landing` ADD COLUMN `navbar_style` ENUM('transparent', 'solid', 'gradient') DEFAULT 'transparent' AFTER `min_monthly_quota`;
ALTER TABLE `landing` ADD COLUMN `show_promo_banner` TINYINT(1) DEFAULT 0 AFTER `navbar_style`;
ALTER TABLE `landing` ADD COLUMN `promo_banner_text` VARCHAR(200) AFTER `show_promo_banner`;
ALTER TABLE `landing` ADD COLUMN `promo_banner_url` VARCHAR(300) AFTER `promo_banner_text`;

-- Configuración de WhatsApp
ALTER TABLE `landing` ADD COLUMN `whatsapp_number` VARCHAR(20) AFTER `promo_banner_url`;
ALTER TABLE `landing` ADD COLUMN `whatsapp_message` VARCHAR(300) AFTER `whatsapp_number`;
ALTER TABLE `landing` ADD COLUMN `show_whatsapp_float` TINYINT(1) DEFAULT 1 AFTER `whatsapp_message`;
```

### 8.2 landing actualizada completa

```sql
CREATE TABLE `landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED,
  `code` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `institution_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,

  -- Hero Configuration (NUEVO expandido)
  `hero_config` JSON COMMENT 'Config completa JSON (legacy)',
  `hero_headline` VARCHAR(200),
  `hero_subheadline` VARCHAR(300),
  `hero_image_url` VARCHAR(500),
  `hero_image_position` ENUM('left', 'right', 'center', 'background') DEFAULT 'right',
  `hero_cta_text` VARCHAR(50),
  `hero_cta_url` VARCHAR(300),
  `hero_secondary_cta_text` VARCHAR(50),
  `hero_secondary_cta_url` VARCHAR(300),

  -- Theme Configuration (NUEVO)
  `theme_overrides` JSON,
  `primary_color` VARCHAR(7) DEFAULT '#4654CD',
  `secondary_color` VARCHAR(7) DEFAULT '#03DBD0',
  `accent_color` VARCHAR(7),
  `min_monthly_quota` DECIMAL(10,2) COMMENT 'Cuota mínima para mostrar "Desde S/XX"',

  -- Navbar Configuration (NUEVO)
  `navbar_style` ENUM('transparent', 'solid', 'gradient') DEFAULT 'transparent',
  `show_promo_banner` TINYINT(1) DEFAULT 0,
  `promo_banner_text` VARCHAR(200),
  `promo_banner_url` VARCHAR(300),

  -- WhatsApp Configuration (NUEVO)
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

---

## 9. NAVEGACIÓN Y COMPONENTES

### 9.1 landing_nav_item (NUEVA)

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

### 9.2 landing_footer_link (NUEVA)

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

---

## 10. FILTROS DINÁMICOS

### 10.1 Actualización a filter_definition

```sql
ALTER TABLE `filter_definition` ADD COLUMN `display_name` VARCHAR(100) AFTER `name`;
ALTER TABLE `filter_definition` ADD COLUMN `tooltip_title` VARCHAR(100) AFTER `display_name`;
ALTER TABLE `filter_definition` ADD COLUMN `tooltip_description` TEXT AFTER `tooltip_title`;
ALTER TABLE `filter_definition` ADD COLUMN `tooltip_recommendation` VARCHAR(300) AFTER `tooltip_description`;
ALTER TABLE `filter_definition` ADD COLUMN `icon` VARCHAR(50) AFTER `tooltip_recommendation`;
ALTER TABLE `filter_definition` ADD COLUMN `collapsed_by_default` TINYINT(1) DEFAULT 0 AFTER `icon`;
ALTER TABLE `filter_definition` ADD COLUMN `show_count` TINYINT(1) DEFAULT 1 AFTER `collapsed_by_default`;
ALTER TABLE `filter_definition` ADD COLUMN `min_value` DECIMAL(15,4) AFTER `show_count`;
ALTER TABLE `filter_definition` ADD COLUMN `max_value` DECIMAL(15,4) AFTER `min_value`;
ALTER TABLE `filter_definition` ADD COLUMN `step_value` DECIMAL(15,4) AFTER `max_value`;
```

### 10.2 filter_definition actualizada completa

```sql
CREATE TABLE `filter_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre interno',
  `display_name` VARCHAR(100) COMMENT 'Nombre mostrado en UI',

  -- Tooltips educativos (NUEVO)
  `tooltip_title` VARCHAR(100),
  `tooltip_description` TEXT,
  `tooltip_recommendation` VARCHAR(300),
  `icon` VARCHAR(50),

  `filter_type` ENUM('checkbox', 'radio', 'range', 'select', 'search', 'chips', 'color') NOT NULL,
  `source_type` ENUM('spec', 'brand', 'category', 'price', 'custom', 'usage', 'gama', 'color', 'condition') NOT NULL,
  `source_spec_id` BIGINT UNSIGNED,

  -- Configuración de display (NUEVO)
  `collapsed_by_default` TINYINT(1) DEFAULT 0,
  `show_count` TINYINT(1) DEFAULT 1 COMMENT 'Mostrar conteo de productos',

  -- Configuración de rango (NUEVO)
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

---

## 11. COMPARADOR

### 11.1 comparator_config (NUEVA)

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

### 11.2 comparator_spec (NUEVA)

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

## 12. PLAZOS DE FINANCIAMIENTO

### 12.1 financing_term (NUEVA)

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

### 12.2 down_payment_option (NUEVA)

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

## 13. RESUMEN DE CAMBIOS

### 13.1 Nuevas Tablas (18)

| # | Tabla | Módulo | Propósito |
|---|-------|--------|-----------|
| 1 | `color` | Products | Catálogo de colores |
| 2 | `product_color` | Products | Colores por producto |
| 3 | `usage_type` | Products | Tipos de uso |
| 4 | `product_usage` | Products | Uso por producto |
| 5 | `gama_tier` | Products | Niveles de gama |
| 6 | `quiz` | Quiz | Definición de quizzes |
| 7 | `quiz_question` | Quiz | Preguntas |
| 8 | `quiz_option` | Quiz | Opciones de respuesta |
| 9 | `quiz_option_filter_mapping` | Quiz | Mapeo a filtros |
| 10 | `quiz_result_template` | Quiz | Templates de resultado |
| 11 | `landing_testimonial` | Landing | Testimonios |
| 12 | `landing_faq` | Landing | FAQs |
| 13 | `landing_how_it_works_step` | Landing | Pasos cómo funciona |
| 14 | `landing_requirement` | Landing | Requisitos |
| 15 | `landing_trust_signal` | Landing | Señales de confianza |
| 16 | `landing_social_proof` | Landing | Métricas social proof |
| 17 | `media_mention` | Landing | Menciones en medios |
| 18 | `result_page_config` | Results | Config páginas resultado |
| 19 | `result_next_step` | Results | Pasos siguientes |
| 20 | `rejection_reason` | Results | Razones de rechazo |
| 21 | `rejection_educational_content` | Results | Contenido educativo |
| 22 | `field_tooltip` | Form | Tooltips por campo |
| 23 | `landing_nav_item` | Landing | Items de navegación |
| 24 | `landing_footer_link` | Landing | Links del footer |
| 25 | `comparator_config` | Catalog | Config comparador |
| 26 | `comparator_spec` | Catalog | Specs en comparador |
| 27 | `financing_term` | Finance | Plazos disponibles |
| 28 | `down_payment_option` | Finance | Opciones de inicial |

### 13.2 Tablas Modificadas (5)

| Tabla | Campos Añadidos |
|-------|-----------------|
| `spec_definition` | tooltip_title, tooltip_description, tooltip_recommendation, min_value, max_value, step_value, filter_display_type |
| `product` | gama_tier_id, stock_status, delivery_days_min, delivery_days_max |
| `form_field` | tooltip_text, info_modal_title, info_modal_content, autocomplete, input_mode, prefix, suffix, mask |
| `landing` | hero_headline, hero_subheadline, hero_image_url, hero_image_position, hero_cta_*, primary_color, secondary_color, accent_color, min_monthly_quota, navbar_style, promo_banner_*, whatsapp_* |
| `filter_definition` | display_name, tooltip_*, icon, collapsed_by_default, show_count, min_value, max_value, step_value |

---

## 14. SCRIPT DE MIGRACIÓN COMPLETO

```sql
-- =====================================================
-- MIGRACIÓN: Frontend v0.5 Support
-- Fecha: Enero 2026
-- =====================================================

-- 1. COLORES
SOURCE 01_colors.sql;

-- 2. USO Y GAMA
SOURCE 02_usage_gama.sql;

-- 3. QUIZ
SOURCE 03_quiz.sql;

-- 4. CONTENIDO LANDING
SOURCE 04_landing_content.sql;

-- 5. PÁGINAS RESULTADO
SOURCE 05_result_pages.sql;

-- 6. FORM BUILDER UPDATES
SOURCE 06_form_updates.sql;

-- 7. LANDING UPDATES
SOURCE 07_landing_updates.sql;

-- 8. FILTROS Y COMPARADOR
SOURCE 08_filters_comparator.sql;

-- 9. FINANCIAMIENTO
SOURCE 09_financing.sql;

-- 10. DATOS INICIALES
SOURCE 10_seed_data.sql;
```

---

**Total de cambios:**
- **28 tablas nuevas**
- **5 tablas modificadas**
- **~70 campos nuevos**

Este documento cubre todas las actualizaciones necesarias para soportar el frontend v0.5 completo.
