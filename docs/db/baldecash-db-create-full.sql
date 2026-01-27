-- =====================================================
-- BaldeCash Database - Complete CREATE Script
-- Version: 3.1
-- Engine: MySQL 8.0+ / InnoDB
-- Charset: utf8mb4_unicode_ci
-- =====================================================

-- Nomenclatura:
-- - Nombres en inglés, snake_case, singular
-- - FKs: {tabla_referenciada}_id
-- - Booleanos: is_, has_, can_
-- - Timestamps: _at
-- - Fechas: _date
-- - Montos: _amount
-- - Tasas: _rate
-- - Porcentajes: _percent

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

-- TEA por convenio + plazo (los convenios determinan la TEA)
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

SET FOREIGN_KEY_CHECKS = 1;
-- =====================================================
-- BaldeCash Database - Part 2
-- Form Builder, Catalog, Event Tracking, Person, Leads, Loan, Stock, Notifications
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

-- =====================================================
-- PERSON MODULE
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

-- =====================================================
-- EVENT TRACKING MODULE (Session must be created before Application)
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

-- =====================================================
-- APPLICATION MODULE
-- =====================================================

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

-- Add FK from session to application (circular)
ALTER TABLE `session` ADD CONSTRAINT `fk_session_application`
  FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE SET NULL;

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

SET FOREIGN_KEY_CHECKS = 1;
-- =====================================================
-- BaldeCash Database - Part 3
-- Event Tracking Events, Leads, Loan, Stock, Notifications, Coupons, Initial Data
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- EVENT TRACKING - Events Tables
-- =====================================================

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

-- =====================================================
-- NOTIFICATIONS MODULE (needed before lead_recovery_campaign)
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

-- =====================================================
-- INITIAL DATA
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

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
