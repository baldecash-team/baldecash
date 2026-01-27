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
