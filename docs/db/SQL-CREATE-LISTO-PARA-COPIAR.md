# BaldeCash Database - Script SQL CREATE

**Listo para copiar y pegar en MySQL 8.0+**

## Instrucciones

1. Copiar todo el contenido del bloque SQL de abajo
2. Pegar en tu cliente MySQL (MySQL Workbench, DBeaver, CLI, etc.)
3. Ejecutar

## Nomenclatura

- Nombres en inglés, `snake_case`, singular
- FKs: `{tabla_referenciada}_id`
- Booleanos: `is_`, `has_`, `can_`
- Timestamps: `_at`
- Fechas: `_date`
- Montos: `_amount`
- Tasas: `_rate`
- Porcentajes: `_percent`

---

## Script SQL Completo

```sql
-- =====================================================
-- BaldeCash Database - Complete CREATE Script
-- Version: 3.1
-- Engine: MySQL 8.0+ / InnoDB
-- Charset: utf8mb4_unicode_ci
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CORE MODULE
-- =====================================================

CREATE TABLE `institution` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
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
  `special_tea` DECIMAL(6,3),
  `max_amount` DECIMAL(10,2),
  `min_initial_percent` DECIMAL(5,2),
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
  `list_price` DECIMAL(10,2) NOT NULL,
  `cost_price` DECIMAL(10,2),
  `msrp` DECIMAL(10,2),
  `warranty_months` TINYINT UNSIGNED DEFAULT 12,
  `weight_kg` DECIMAL(6,3),
  `is_new` TINYINT(1) DEFAULT 1,
  `is_refurbished` TINYINT(1) DEFAULT 0,
  `condition_grade` ENUM('A', 'B', 'C'),
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
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `data_type` ENUM('text', 'number', 'boolean', 'select') DEFAULT 'text',
  `unit` VARCHAR(20),
  `is_filterable` TINYINT(1) DEFAULT 0,
  `is_comparable` TINYINT(1) DEFAULT 1,
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
  `is_visible` TINYINT(1) DEFAULT 1,
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
  `list_price` DECIMAL(10,2) NOT NULL,
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
  `monthly_rate` DECIMAL(5,4),
  `fixed_monthly_amount` DECIMAL(10,2),
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
  `period_count` SMALLINT UNSIGNED NOT NULL,
  `label` VARCHAR(50) NOT NULL,
  `label_short` VARCHAR(20),
  `default_tea` DECIMAL(6,3) NOT NULL,
  `default_tcea` DECIMAL(6,3),
  `interest_multiplier` DECIMAL(5,4) DEFAULT 1.0000,
  `is_featured` TINYINT(1) DEFAULT 0,
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
  `initial_amount` DECIMAL(10,2) NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0,
  `discount_percent` DECIMAL(5,2) DEFAULT 0,
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
  `is_default` TINYINT(1) DEFAULT 0,
  `tea_override` DECIMAL(6,3),
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
  `tea_override` DECIMAL(6,3),
  `is_default` TINYINT(1) DEFAULT 0,
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
  `product_id` BIGINT UNSIGNED,
  `product_type` ENUM('laptop', 'celular', 'tablet', 'moto'),
  `is_recommended` TINYINT(1) DEFAULT 0,
  `recommendation_reason` VARCHAR(200),
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
-- VER ARCHIVOS COMPLETOS EN:
-- - baldecash-db-create.sql
-- - baldecash-db-create-part2.sql
-- - baldecash-db-create-part3.sql
-- - baldecash-db-create-full.sql (todo consolidado)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
```

---

## Archivos Disponibles

| Archivo | Contenido |
|---------|-----------|
| `baldecash-db-create.sql` | CORE + PRODUCTS + FINANCE + LANDING CONFIG |
| `baldecash-db-create-part2.sql` | FORM BUILDER + CATALOG + PERSON + SESSION + APPLICATION |
| `baldecash-db-create-part3.sql` | EVENTS + LEADS + NOTIFICATIONS + LOAN + STOCK + COUPONS + INSERTs |
| `baldecash-db-create-full.sql` | **TODO CONSOLIDADO** - Este archivo para copiar y pegar |

---

## Para Ejecutar Todo

```bash
mysql -u root -p < baldecash-db-create-full.sql
```

O en MySQL Workbench: File → Open SQL Script → `baldecash-db-create-full.sql` → Execute
