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
