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
