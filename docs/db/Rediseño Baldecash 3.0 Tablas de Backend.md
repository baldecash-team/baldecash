# Sistema BaldeCash - Tablas Backend/Analytics

**Versión:** 2.0 | **Fecha:** Diciembre 2025 | **Tipo:** Estructura Backend

---

## 1. Resumen

Este documento contiene las **tablas de backend** que no se renderizan directamente en el frontend pero son esenciales para tracking, analytics, gestión interna y procesamiento de datos.

### 1.1 Módulos Incluidos

| Módulo | Tablas | Descripción |
|--------|--------|-------------|
| Core (parcial) | 1 | Usuarios internos |
| Event Tracking | 14 | Sesiones y eventos |
| Person & Application | 16 | Solicitudes y personas |
| Leads | 8 | Gestión de leads |
| Marketing | 14 | Campañas y preaprobados |
| Loan | 4 | Préstamos y pagos |
| **Total** | **57** | Tablas backend |

### 1.2 Características

- **Volumen alto**: Tablas de eventos pueden crecer rápidamente
- **Write-heavy**: Muchas inserciones, pocas actualizaciones
- **Analytics**: Optimizadas para agregaciones y reportes
- **Particionamiento**: Candidatas para partición por fecha

---

## 2. Módulo Core (Parcial)

### 2.1 user_account

Usuarios internos del sistema (admin, analistas, vendedores).

```sql
CREATE TABLE `user_account` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'analyst', 'sales', 'support', 'viewer') NOT NULL,
  `phone` VARCHAR(20),
  `avatar_url` VARCHAR(500),
  `last_login_at` TIMESTAMP NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`),
  KEY `idx_user_role` (`role`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Módulo Event Tracking (14 tablas)

Sistema de tracking de eventos del usuario.

### 3.1 session

```sql
CREATE TABLE `session` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_uuid` CHAR(36) NOT NULL,
  `landing_id` BIGINT UNSIGNED,
  `fingerprint` VARCHAR(64),
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(500),
  `device_type` ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
  `browser` VARCHAR(50),
  `os` VARCHAR(50),
  `screen_width` SMALLINT UNSIGNED,
  `screen_height` SMALLINT UNSIGNED,
  `language` VARCHAR(10),
  `timezone` VARCHAR(50),
  `referrer_url` VARCHAR(2000),
  `landing_url` VARCHAR(2000),
  `utm_source` VARCHAR(100),
  `utm_medium` VARCHAR(100),
  `utm_campaign` VARCHAR(200),
  `utm_term` VARCHAR(200),
  `utm_content` VARCHAR(200),
  `traffic_source` ENUM('organic_search', 'paid_search', 'organic_social', 'paid_social', 'display', 'retargeting', 'email', 'sms', 'push_notification', 'affiliate', 'referral', 'direct', 'preapproved', 'qr_code', 'offline', 'other') DEFAULT 'direct',
  `gclid` VARCHAR(100),
  `fbclid` VARCHAR(100),
  `preapproved_id` BIGINT UNSIGNED,
  `conversion_status` ENUM('browsing', 'engaged', 'form_started', 'form_partial', 'form_completed', 'approved', 'rejected') DEFAULT 'browsing',
  `application_id` BIGINT UNSIGNED,
  `started_at` TIMESTAMP(3) NOT NULL,
  `ended_at` TIMESTAMP(3) NULL,
  `duration_seconds` INT UNSIGNED,
  `page_views_count` SMALLINT UNSIGNED DEFAULT 0,
  `events_count` INT UNSIGNED DEFAULT 0,
  `is_bot` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_uuid` (`session_uuid`),
  KEY `idx_session_landing` (`landing_id`),
  KEY `idx_session_started` (`started_at`),
  KEY `idx_session_conversion` (`conversion_status`),
  KEY `idx_session_traffic` (`traffic_source`),
  KEY `idx_session_utm` (`utm_source`, `utm_campaign`),
  KEY `idx_session_fingerprint` (`fingerprint`, `started_at`),
  CONSTRAINT `fk_session_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_session_preapproved` FOREIGN KEY (`preapproved_id`) REFERENCES `preapproved_customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 page_view

```sql
CREATE TABLE `page_view` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_url` VARCHAR(2000) NOT NULL,
  `page_title` VARCHAR(500),
  `page_type` ENUM('landing', 'catalog', 'product_detail', 'form_step', 'confirmation', 'error', 'other') DEFAULT 'other',
  `referrer_page_view_id` BIGINT UNSIGNED,
  `entered_at` TIMESTAMP(3) NOT NULL,
  `exited_at` TIMESTAMP(3) NULL,
  `time_on_page_ms` INT UNSIGNED,
  `scroll_depth_percent` TINYINT UNSIGNED,
  `clicks_count` SMALLINT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pv_session` (`session_id`),
  KEY `idx_pv_entered` (`entered_at`),
  KEY `idx_pv_type` (`page_type`),
  CONSTRAINT `fk_pv_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 event_scroll

```sql
CREATE TABLE `event_scroll` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `depth_percent` TINYINT UNSIGNED NOT NULL,
  `depth_pixels` INT UNSIGNED,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_scroll_pv` (`page_view_id`),
  CONSTRAINT `fk_scroll_pv` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.4 event_click

```sql
CREATE TABLE `event_click` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `element_type` ENUM('button', 'link', 'card', 'image', 'tab', 'accordion', 'dropdown', 'checkbox', 'radio', 'other') NOT NULL,
  `element_id` VARCHAR(100),
  `element_class` VARCHAR(200),
  `element_text` VARCHAR(500),
  `element_href` VARCHAR(2000),
  `position_x` SMALLINT UNSIGNED,
  `position_y` SMALLINT UNSIGNED,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_click_pv` (`page_view_id`),
  KEY `idx_click_element` (`element_type`, `element_id`),
  CONSTRAINT `fk_click_pv` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.5-3.14 (Tablas restantes de eventos)

Ver documento principal para:
- `event_hover`
- `event_input`
- `event_filter`
- `event_product`
- `event_modal`
- `event_form`
- `event_navigation`
- `event_error`
- `event_custom`
- `traffic_source_config`

---

## 4. Módulo Person & Application (16 tablas)

Gestión de personas y solicitudes.

### 4.1 person

```sql
CREATE TABLE `person` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_type` ENUM('dni', 'ce', 'pasaporte') NOT NULL,
  `document_number` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `maternal_last_name` VARCHAR(100),
  `birth_date` DATE,
  `gender` ENUM('M', 'F', 'O'),
  `marital_status` ENUM('soltero', 'casado', 'divorciado', 'viudo', 'conviviente'),
  `nationality` VARCHAR(50) DEFAULT 'Peruana',
  `current_equifax_score` SMALLINT,
  `last_equifax_check` TIMESTAMP NULL,
  `risk_category` ENUM('A', 'B', 'C', 'D', 'E'),
  `is_blacklisted` TINYINT(1) DEFAULT 0,
  `blacklist_reason` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_person_document` (`document_type`, `document_number`),
  KEY `idx_person_score` (`current_equifax_score`),
  KEY `idx_person_risk` (`risk_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 application

```sql
CREATE TABLE `application` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_number` VARCHAR(20) NOT NULL,
  `session_id` BIGINT UNSIGNED,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,
  `preapproved_id` BIGINT UNSIGNED,
  `status` ENUM('draft', 'submitted', 'documents_pending', 'under_review', 'approved', 'rejected', 'cancelled', 'expired') DEFAULT 'draft',
  `rejection_reason` VARCHAR(500),
  `total_amount` DECIMAL(10,2),
  `term_months` TINYINT UNSIGNED,
  `monthly_payment` DECIMAL(10,2),
  `tea_applied` DECIMAL(6,3),
  `down_payment` DECIMAL(10,2) DEFAULT 0,
  `submitted_at` TIMESTAMP NULL,
  `approved_at` TIMESTAMP NULL,
  `approved_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_application_number` (`application_number`),
  KEY `idx_app_person` (`person_id`),
  KEY `idx_app_status` (`status`),
  KEY `idx_app_submitted` (`submitted_at`),
  CONSTRAINT `fk_app_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_app_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`),
  CONSTRAINT `fk_app_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_app_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_app_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.3-4.16 (Tablas restantes)

Ver documento principal para:
- `person_contact_history`
- `person_address_history`
- `person_academic_history`
- `person_income_history`
- `person_history`
- `application_product`
- `application_document`
- `application_status_log`
- `document_type`
- `equifax_consultation`
- `equifax_detail`
- `daily_product_catalog_snapshot`
- `session_product_view`

---

## 5. Módulo Leads (8 tablas)

Sistema de gestión de leads abandonados.

### 5.1 lead

```sql
CREATE TABLE `lead` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED,
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `document_type` ENUM('dni', 'ce', 'pasaporte'),
  `document_number` VARCHAR(20),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `partial_form_data` JSON,
  `form_completion_percent` TINYINT UNSIGNED DEFAULT 0,
  `last_step_reached` VARCHAR(50),
  `quality_score` TINYINT UNSIGNED,
  `status` ENUM('new', 'contacted', 'qualified', 'hot', 'warm', 'cold', 'converted', 'lost') DEFAULT 'new',
  `assigned_to` BIGINT UNSIGNED,
  `converted_application_id` BIGINT UNSIGNED,
  `abandoned_at` TIMESTAMP NOT NULL,
  `last_activity_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lead_session` (`session_id`),
  KEY `idx_lead_status` (`status`),
  KEY `idx_lead_score` (`quality_score`),
  KEY `idx_lead_assigned` (`assigned_to`),
  KEY `idx_lead_abandoned` (`abandoned_at`),
  CONSTRAINT `fk_lead_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_lead_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_lead_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_lead_application` FOREIGN KEY (`converted_application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.2 lead_recovery_campaign

```sql
CREATE TABLE `lead_recovery_campaign` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `min_quality_score` TINYINT UNSIGNED,
  `max_quality_score` TINYINT UNSIGNED,
  `min_form_completion` TINYINT UNSIGNED,
  `max_form_completion` TINYINT UNSIGNED,
  `min_abandoned_hours_ago` INT,
  `max_abandoned_hours_ago` INT,
  `channel` ENUM('email', 'sms', 'whatsapp', 'push', 'retargeting') NOT NULL,
  `template_id` VARCHAR(100),
  `message_content` TEXT,
  `send_delay_hours` INT DEFAULT 1,
  `max_sends_per_lead` INT DEFAULT 3,
  `min_hours_between_sends` INT DEFAULT 24,
  `status` ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
  `start_date` DATE,
  `end_date` DATE,
  `leads_targeted` INT DEFAULT 0,
  `messages_sent` INT DEFAULT 0,
  `messages_opened` INT DEFAULT 0,
  `clicks` INT DEFAULT 0,
  `conversions` INT DEFAULT 0,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaign_status` (`status`),
  KEY `idx_campaign_dates` (`start_date`, `end_date`),
  CONSTRAINT `fk_campaign_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.3-5.8 Tablas pivot y adicionales

- `lead_campaign_status` - Estados de lead objetivo (pivot normalizado)
- `lead_campaign_landing` - Landings objetivo (pivot normalizado)
- `lead_campaign_source` - Fuentes de tráfico objetivo (pivot normalizado)
- `lead_score_rule`
- `lead_interaction`
- `lead_campaign_send`

---

## 6. Módulo Marketing (14 tablas)

Campañas y clientes preaprobados.

### 6.1 preapproved_customer

```sql
CREATE TABLE `preapproved_customer` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_type` ENUM('dni', 'ce', 'pasaporte') NOT NULL,
  `document_number` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `source` ENUM('bureau', 'existing_customer', 'partner', 'campaign', 'referral', 'institution') NOT NULL,
  `source_detail` VARCHAR(200),
  `source_file` VARCHAR(300),
  `imported_at` TIMESTAMP,
  `risk_score` DECIMAL(5,2),
  `risk_category` ENUM('A', 'B', 'C', 'D', 'E'),
  `debt_ratio` DECIMAL(5,2),
  `estimated_income` DECIMAL(12,2),
  `max_amount` DECIMAL(10,2) NOT NULL,
  `min_amount` DECIMAL(10,2),
  `suggested_amount` DECIMAL(10,2),
  `max_term_months` INT,
  `min_term_months` INT,
  `special_rate` DECIMAL(5,2),
  `offer_code` VARCHAR(50),
  `agreement_id` BIGINT UNSIGNED,
  `institution_id` BIGINT UNSIGNED,
  `valid_from` DATE NOT NULL,
  `valid_until` DATE NOT NULL,
  `status` ENUM('active', 'contacted', 'interested', 'applied', 'converted', 'declined', 'expired', 'revoked') DEFAULT 'active',
  `landing_visits` INT DEFAULT 0,
  `last_visit_at` TIMESTAMP NULL,
  `session_id` BIGINT UNSIGNED,
  `application_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_preapproved_doc` (`document_type`, `document_number`, `valid_from`),
  UNIQUE KEY `uk_preapproved_offer_code` (`offer_code`),
  KEY `idx_preapproved_status` (`status`),
  KEY `idx_preapproved_validity` (`valid_from`, `valid_until`),
  KEY `idx_preapproved_risk` (`risk_category`),
  CONSTRAINT `fk_preapproved_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_preapproved_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.2-6.14 Tablas adicionales

- `preapproved_product` - Productos permitidos (pivot)
- `preapproved_landing` - Landings permitidos (pivot)
- `preapproved_import`
- `marketing_campaign`
- `campaign_preapproved_status` - Estados objetivo (pivot)
- `campaign_risk_category` - Riesgo objetivo (pivot)
- `campaign_source` - Fuentes objetivo (pivot)
- `campaign_institution` - Instituciones objetivo (pivot)
- `campaign_agreement` - Convenios objetivo (pivot)
- `marketing_campaign_send`
- `traffic_source_config`
- `referral_program`
- `referral`

---

## 7. Módulo Loan (4 tablas)

Gestión de préstamos activos.

### 7.1 loan

```sql
CREATE TABLE `loan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_number` VARCHAR(20) NOT NULL,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `principal_amount` DECIMAL(10,2) NOT NULL,
  `total_interest` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `term_months` TINYINT UNSIGNED NOT NULL,
  `monthly_payment` DECIMAL(10,2) NOT NULL,
  `tea` DECIMAL(6,3) NOT NULL,
  `tcea` DECIMAL(6,3),
  `first_due_date` DATE NOT NULL,
  `last_due_date` DATE NOT NULL,
  `disbursement_date` DATE,
  `status` ENUM('pending_disbursement', 'active', 'current', 'past_due', 'default', 'paid_off', 'written_off', 'refinanced') DEFAULT 'pending_disbursement',
  `days_past_due` INT DEFAULT 0,
  `outstanding_balance` DECIMAL(10,2),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loan_number` (`loan_number`),
  KEY `idx_loan_person` (`person_id`),
  KEY `idx_loan_status` (`status`),
  KEY `idx_loan_past_due` (`days_past_due`),
  CONSTRAINT `fk_loan_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_loan_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.2-7.4 Tablas adicionales

- `loan_schedule` - Cronograma de cuotas
- `loan_payment` - Pagos realizados
- `loan_status_history` - Historial de estados

---

## 8. Particionamiento Recomendado

### 8.1 Tablas candidatas para partición por fecha

```sql
-- session: Particionar por mes de started_at
ALTER TABLE session PARTITION BY RANGE (YEAR(started_at) * 100 + MONTH(started_at)) (
  PARTITION p202501 VALUES LESS THAN (202502),
  PARTITION p202502 VALUES LESS THAN (202503),
  -- ...
  PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- page_view: Particionar por mes
ALTER TABLE page_view PARTITION BY RANGE (YEAR(entered_at) * 100 + MONTH(entered_at)) (
  -- Similar a session
);

-- event_click, event_scroll, etc.: Particionar por mes
```

### 8.2 Retención de datos

| Tabla | Retención | Acción |
|-------|-----------|--------|
| `session` | 24 meses | Archivar a data warehouse |
| `page_view` | 12 meses | Archivar a data warehouse |
| `event_*` | 6 meses | Archivar o eliminar |
| `lead` | 36 meses | Mantener |
| `application` | Indefinido | Mantener |
| `loan` | Indefinido | Mantener |

---

## 9. Queries de Analytics Frecuentes

### 9.1 Conversión por fuente de tráfico

```sql
SELECT
  traffic_source,
  COUNT(*) AS sessions,
  SUM(CASE WHEN conversion_status = 'form_completed' THEN 1 ELSE 0 END) AS conversions,
  ROUND(SUM(CASE WHEN conversion_status = 'form_completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS conversion_rate
FROM session
WHERE started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND is_bot = 0
GROUP BY traffic_source
ORDER BY conversions DESC;
```

### 9.2 Funnel de formulario

```sql
SELECT
  form_step,
  COUNT(*) AS total,
  LAG(COUNT(*)) OVER (ORDER BY step_order) AS previous_step,
  ROUND(COUNT(*) * 100.0 / LAG(COUNT(*)) OVER (ORDER BY step_order), 2) AS step_conversion
FROM event_form ef
JOIN form_step fs ON fs.code = ef.form_step
WHERE ef.event_type = 'step_completed'
  AND ef.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY form_step, step_order
ORDER BY step_order;
```

### 9.3 Leads por calidad

```sql
SELECT
  CASE
    WHEN quality_score >= 80 THEN 'Hot'
    WHEN quality_score >= 50 THEN 'Warm'
    ELSE 'Cold'
  END AS lead_quality,
  COUNT(*) AS total,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted,
  ROUND(AVG(TIMESTAMPDIFF(HOUR, abandoned_at, last_activity_at)), 1) AS avg_response_hours
FROM lead
WHERE abandoned_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY 1
ORDER BY total DESC;
```

---

## 10. Índices para Analytics

```sql
-- Análisis temporal
CREATE INDEX idx_session_daily ON session(DATE(started_at), traffic_source);
CREATE INDEX idx_app_monthly ON application(DATE_FORMAT(submitted_at, '%Y-%m'), status);

-- Funnels
CREATE INDEX idx_event_form_funnel ON event_form(session_id, form_step, event_type);

-- Leads scoring
CREATE INDEX idx_lead_scoring ON lead(quality_score, status, abandoned_at);

-- Campaigns
CREATE INDEX idx_campaign_perf ON marketing_campaign_send(campaign_id, status, sent_at);
```

---

## 11. Consideraciones de Replicación

| Tipo de Query | Base de Datos |
|---------------|---------------|
| Escritura de eventos | Primary |
| Lectura de analytics | Replica |
| Dashboards tiempo real | Replica con delay < 1s |
| Reportes históricos | Data Warehouse |

---

**Documento generado automáticamente** | **Total: 57 tablas Backend**
