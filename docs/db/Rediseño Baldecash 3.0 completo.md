# Sistema de Landings Dinámicas y Tracking - BaldeCash

**Versión:** 3.0 Rediseño | **Fecha:** Enero 2026 | **Tipo:** Arquitectura Nueva + Frontend v0.5

---

## 1. Introducción

### 1.1 Propósito

Rediseño completo del sistema para:
- Configurar landings 100% dinámicas desde base de datos
- Tracking granular de todas las interacciones de usuario
- Herencia multinivel de configuraciones
- Filtros dinámicos generados desde productos disponibles
- Catálogo de productos normalizado y optimizado
- Formularios completamente configurables sin código

### 1.2 Alcance

**127 tablas** organizadas en 14 módulos:

| Módulo | Tablas | Función |
|--------|--------|---------|
| Core | 5 | Entidades base del negocio |
| Products | 20 | Catálogo, specs EAV, precios, combos, colores, uso, gama (+5 nuevas) |
| Landing Configuration | 14 | Templates, herencia, config dinámica, versionado |
| Landing Content | 9 | Testimonios, FAQs, pasos, requisitos, social proof (+9 nuevas) |
| Form Builder | 9 | Pasos, campos, validaciones, opciones, tooltips (+1 nueva) |
| Catalog & Filters | 6 | Filtros dinámicos, comparador (+2 nuevas) |
| Quiz | 5 | Sistema de quiz configurable (+5 nuevas) |
| Result Pages | 4 | Páginas de resultado configurables (+4 nuevas) |
| Finance | 2 | Plazos y opciones de inicial (+2 nuevas) |
| Event Tracking | 14 | Todas las interacciones + UTM + traffic source |
| Person & Application | 16 | Solicitudes, personas, documentos |
| Leads | 8 | Sesiones abandonadas, scoring, recuperación (+3 pivot) |
| Marketing | 14 | Preaprobados, campañas, referidos (+7 pivot) |
| Loan | 4 | Préstamos, cronogramas, pagos |

### 1.3 Principios de Diseño

1. **Normalización**: Datos atómicos, sin JSON para datos estructurados críticos
2. **Flexibilidad**: Todo configurable sin cambios de código
3. **Performance**: Índices optimizados para queries frecuentes
4. **Trazabilidad**: Tracking completo del journey del usuario
5. **Escalabilidad**: Diseño que soporta crecimiento
6. **Herencia**: Configuraciones reutilizables con override

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BALDECASH PLATFORM v2.0 - REDISEÑO                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              CORE MODULE                                 │   │
│  │  institution │ institution_campus │ career │ agreement │ user_account   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           PRODUCTS MODULE                                │   │
│  │  brand │ product │ spec_definition │ product_spec_value │ tag │         │   │
│  │  product_tag │ product_image │ product_pricing │ accessory │ insurance │ │   │
│  │  combo │ combo_item                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      LANDING CONFIGURATION MODULE                        │   │
│  │  landing_template │ landing │ landing_inheritance │ landing_feature │   │   │
│  │  landing_promotion │ landing_product │ landing_accessory │              │   │
│  │  landing_insurance                                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FORM BUILDER MODULE                              │   │
│  │  form_step │ form_field │ form_field_group │ landing_step │             │   │
│  │  landing_field │ field_validation │ field_option │ field_dependency     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        CATALOG & FILTERS MODULE                          │   │
│  │  filter_definition │ filter_value │ landing_filter │ sort_option        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        EVENT TRACKING MODULE                             │   │
│  │  session │ page_view │ event_scroll │ event_click │ event_hover │       │   │
│  │  event_input │ event_filter │ event_product │ event_modal │             │   │
│  │  event_form │ event_navigation │ event_error │ event_custom             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         APPLICATION MODULE                               │   │
│  │  applicant │ applicant_contact │ applicant_address │ applicant_income │ │   │
│  │  application │ application_product │ application_document │             │   │
│  │  application_status_log                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                            LEADS MODULE                                  │   │
│  │  lead │ lead_score_rule │ lead_interaction │ lead_recovery_campaign │   │   │
│  │  lead_campaign_send                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          MARKETING MODULE                                │   │
│  │  preapproved_customer │ preapproved_import │ marketing_campaign │       │   │
│  │  marketing_campaign_send │ traffic_source_config │ referral_program │   │   │
│  │  referral                                                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.1 Listado de Tablas por Módulo

Resumen de todas las tablas con descripción de una línea.

### CORE (5 tablas)
| Tabla | Descripción |
|-------|-------------|
| `institution` | Instituciones educativas (universidades, institutos, colegios) con convenio |
| `institution_campus` | Sedes/campus de cada institución con ubicación geográfica |
| `career` | Carreras/programas académicos disponibles por institución |
| `agreement` | Convenios comerciales con instituciones (tasas, montos máximos, vigencia) |
| `user_account` | Usuarios internos del sistema (admins, analistas, vendedores) |

### PRODUCTS (15 tablas)
| Tabla | Descripción |
|-------|-------------|
| `category` | Categorías de productos (Laptops, Celulares, Tablets, Motos) |
| `brand` | Marcas de productos (HP, Lenovo, Apple, etc.) |
| `product` | Catálogo maestro de productos disponibles para financiamiento |
| `spec_definition` | Catálogo de especificaciones disponibles (RAM, cilindrada, gama) - Modelo EAV |
| `spec_product_type` | Relación specs-tipos de producto (sin JSON, normalizado) |
| `product_spec_value` | Valores de especificaciones por producto - Modelo EAV escalable |
| `tag` | Etiquetas para agrupar productos (gaming, reacondicionado, apple, promociones) |
| `product_tag` | Relación productos-tags (un producto puede tener múltiples tags) |
| `product_image` | Galería de imágenes por producto |
| `product_pricing` | Precios base por producto y plazo (6, 12, 18, 24 meses) |
| `accessory` | Accesorios complementarios (mouse, mochila, audífonos) |
| `accessory_product_type` | Tipos de producto compatibles con cada accesorio (pivot, normalizado) |
| `insurance` | Seguros opcionales para los productos |
| `combo` | Combos/paquetes que agrupan producto + accesorios con descuento |
| `combo_item` | Items del combo (productos, accesorios incluidos) |

### LANDING CONFIGURATION (14 tablas)
| Tabla | Descripción |
|-------|-------------|
| `landing_template` | Templates base reutilizables para landings (convenio-universidad, público, campaña) |
| `landing` | Configuración específica de cada landing (baldecash.pe/senati, /upn, etc.) |
| `landing_inheritance` | Herencia de configuraciones entre templates y landings |
| `feature_definition` | Catálogo de features disponibles (filtros, chat, FAQ, simulador) |
| `landing_feature` | Features habilitados por landing con configuración específica |
| `landing_promotion` | Modales/banners promocionales por landing |
| `landing_product` | Productos visibles en cada landing con precios específicos |
| `landing_accessory` | Accesorios disponibles por landing con precio override |
| `landing_insurance` | Seguros disponibles por landing con precio override |
| `promotion` | Catálogo de promociones (descuentos, tasas especiales, 0% interés) |
| `landing_product_promotion` | Vincula promociones a productos en landings específicas |
| `home_component` | Componentes configurables del home (hero, carousel, banners) con orden y versión |
| `landing_version` | Versiones/snapshots de configuración con workflow staging → producción |
| `landing_change_log` | Auditoría de todos los cambios realizados a landings |

### FORM BUILDER (8 tablas)
| Tabla | Descripción |
|-------|-------------|
| `form_step` | Pasos del formulario (datos-personales, datos-laborales, referencias) |
| `form_field` | Campos maestros disponibles (dni, email, dirección, ingreso_mensual) |
| `form_field_group` | Agrupaciones lógicas de campos dentro de un paso |
| `landing_step` | Configuración de pasos habilitados por landing |
| `landing_field` | Configuración de campos por landing (visible, requerido, orden) |
| `field_validation` | Reglas de validación por campo (regex, min/max, API externa) |
| `field_option` | Opciones para campos select/radio (departamentos, bancos, estados civiles) |
| `field_dependency` | Dependencias entre campos (mostrar X si Y tiene valor Z) |

### CATALOG & FILTERS (4 tablas)
| Tabla | Descripción |
|-------|-------------|
| `filter_definition` | Definición de filtros disponibles (marca, precio, procesador, RAM) |
| `filter_value` | Valores posibles por filtro (HP, Lenovo, i5, i7, 8GB, 16GB) |
| `landing_filter` | Filtros habilitados por landing con orden y visibilidad |
| `sort_option` | Opciones de ordenamiento (precio menor, más popular, reciente) |

### EVENT TRACKING (14 tablas)
| Tabla | Descripción |
|-------|-------------|
| `session` | Sesión de usuario con UTM, device, fingerprint y estado de conversión |
| `page_view` | Páginas visitadas por sesión con tiempo de permanencia |
| `event_scroll` | Profundidad de scroll alcanzada por página |
| `event_click` | Clics en elementos de la página (botones, links, cards) |
| `event_hover` | Tiempo de hover sobre elementos (interés en productos) |
| `event_input` | Interacción con campos del formulario (tiempo, errores, abandono) |
| `event_filter` | Uso de filtros del catálogo (qué filtros, qué valores) |
| `event_product` | Interacciones con productos (ver card, ver detalle, agregar) |
| `event_modal` | Apertura y cierre de modales (simulador, detalle, requisitos) |
| `event_form` | Progreso del formulario (inicio, avance, abandono, completado) |
| `event_navigation` | Navegación entre páginas/pasos del flujo |
| `event_error` | Errores de validación y sistema durante el flujo |
| `event_custom` | Eventos personalizados para tracking especial |
| `traffic_source_config` | Configuración de fuentes de tráfico reconocidas |

### PERSON & APPLICATION (16 tablas)
| Tabla | Descripción |
|-------|-------------|
| `person` | Persona única identificada por documento (DNI/CE), con score Equifax actual |
| `person_contact_history` | Historial versionado de datos de contacto (email, teléfonos) |
| `person_address_history` | Historial versionado de direcciones |
| `person_academic_history` | Historial versionado de datos académicos (institución, carrera, ciclo) |
| `person_employment_history` | Historial versionado de datos laborales (empresa, ingreso, antigüedad) |
| `person_financial_history` | Historial versionado de datos financieros (bancos, deudas declaradas) |
| `person_equifax_history` | Historial de todas las consultas a Equifax por persona |
| `person_reference` | Referencias personales del solicitante |
| `document_type` | Catálogo de tipos de documentos requeridos (DNI, boleta, recibo) |
| `person_document` | Documentos subidos por la persona con estado de validación |
| `application` | Solicitud de crédito con producto, condiciones y estado |
| `application_product` | Productos adicionales en la solicitud (accesorios, seguros) |
| `application_document` | Documentos requeridos por solicitud específica |
| `application_status_log` | Historial de cambios de estado de la solicitud |
| `daily_product_catalog_snapshot` | Snapshot diario del catálogo para analytics |
| `session_product_view` | Vista materializada de productos vistos por sesión |

### LEADS (8 tablas)
| Tabla | Descripción |
|-------|-------------|
| `lead` | Lead generado de sesión abandonada con datos parciales capturados |
| `lead_score_rule` | Reglas de scoring para priorizar leads (engagement, datos, fuente) |
| `lead_interaction` | Interacciones con leads (llamadas, emails, WhatsApp) |
| `lead_recovery_campaign` | Campañas de recuperación de leads abandonados |
| `lead_campaign_status` | Estados de lead objetivo de la campaña (pivot, normalizado) |
| `lead_campaign_landing` | Landings objetivo de la campaña (pivot, normalizado) |
| `lead_campaign_source` | Fuentes de tráfico objetivo de la campaña (pivot, normalizado) |
| `lead_campaign_send` | Envíos individuales de campañas de recuperación |

### MARKETING (14 tablas)
| Tabla | Descripción |
|-------|-------------|
| `preapproved_customer` | Clientes preaprobados importados de Equifax u otras fuentes |
| `preapproved_product` | Productos permitidos para el preaprobado (pivot, normalizado) |
| `preapproved_landing` | Landings donde puede usar la oferta (pivot, normalizado) |
| `preapproved_import` | Log de importaciones de preaprobados |
| `marketing_campaign` | Campañas de marketing (outreach, retargeting, estacionales) |
| `campaign_preapproved_status` | Estados de preaprobados objetivo (pivot, normalizado) |
| `campaign_risk_category` | Categorías de riesgo objetivo (pivot, normalizado) |
| `campaign_source` | Fuentes de datos objetivo (pivot, normalizado) |
| `campaign_institution` | Instituciones objetivo (pivot, normalizado) |
| `campaign_agreement` | Convenios objetivo (pivot, normalizado) |
| `marketing_campaign_send` | Envíos individuales de campañas de marketing |
| `traffic_source_config` | Configuración de fuentes de tráfico para attribution |
| `referral_program` | Programas de referidos activos |
| `referral` | Referidos individuales con tracking de conversión |

### LOAN - Préstamos (4 tablas)
| Tabla | Descripción |
|-------|-------------|
| `loan` | Préstamo aprobado y desembolsado (monto, tasa, plazo, estado actual) |
| `loan_schedule` | Cronograma de cuotas del préstamo (fecha, monto, estado de pago) |
| `loan_payment` | Pagos realizados (monto, fecha, método, referencia bancaria) |
| `loan_status_history` | Historial de estados del préstamo (vigente → mora → regularizado → pagado) |

### ACTIVATION - Activaciones Presenciales (6 tablas)
| Tabla | Descripción |
|-------|-------------|
| `activation_promoter` | Promotores/vendedores que realizan activaciones presenciales |
| `activation_period` | Períodos de activación (campañas de matrícula, inicio de ciclo) |
| `activation_event` | Eventos de activación con ubicación, fecha y promotor asignado |
| `activation_lead` | Leads capturados en activaciones presenciales con foto documento |
| `activation_result` | Resultado final de cada lead de activación (aprobado/rechazado/desembolsado) |
| `activation_period_summary` | Resumen de métricas por período de activación |

---

## 3. Storytelling: El Viaje Completo del Usuario

### 3.1 Escenario Principal: Carlos, el Estudiante de Provincia

**Contexto:**
Carlos estudia Ingeniería de Sistemas en SENATI Arequipa. Necesita una laptop para sus cursos de programación. Su institución tiene convenio con BaldeCash.

---

**FASE 1: Descubrimiento (Día 1, 10:30 AM)**

Carlos ve un post en el grupo de WhatsApp de su carrera con link a `baldecash.pe/senati`.

```
→ Se crea session:
  - uuid: "abc-123-xyz"
  - traffic_source: organic_social
  - utm_source: whatsapp
  - utm_medium: organic
  - referrer_domain: "wa.me"
  - device_type: mobile
  - os: "Android"
  - browser: "Chrome Mobile"
```

El sistema identifica el landing de SENATI:

```
→ landing detectado por slug "senati"
→ landing.agreement_id → agreement (convenio SENATI)
→ agreement.institution_id → institution (SENATI)
→ Se cargan configs heredadas de landing_template "convenio-instituto"
```

Carlos navega el catálogo en su celular:

```
→ page_view: path "/catalogo", step_code "catalogo"
→ event_scroll: scroll_percent 25%, 50%, 75%
→ event_filter: filter "tipo", value "laptop"
→ event_filter: filter "precio_hasta", value "2500"
→ event_product: product_id 45, action "view_card"
→ event_hover: product_id 45, duration_ms 2800
```

Ve una laptop que le gusta pero está en clase. Cierra la app.

```
→ session actualiza:
  - status: "abandoned"
  - max_step_reached: "catalogo"
  - duration_seconds: 180
  - page_views: 2

→ Sistema detecta abandono, crea lead:
  - last_step_code: "catalogo"
  - form_completion_percent: 0
  - quality_score: 25 (poco engagement)
  - temperature: "cold"
  - traffic_source: "organic_social"
```

---

**FASE 2: Retorno Orgánico (Día 1, 8:00 PM)**

Carlos recuerda el sitio y busca "baldecash senati" en Google.

```
→ Nueva session:
  - traffic_source: organic_search
  - utm_source: google
  - utm_medium: organic
  - referrer_domain: "google.com"
  - device_type: desktop (ahora en su casa)
```

Esta vez explora más a fondo:

```
→ event_product: product_id 45, action "view_detail"
→ event_click: element "btn-simular-cuotas"
→ event_modal:
  - modal_name: "simulador"
  - action: "open"
  - duration_visible_ms: 45000
→ event_click: element "btn-ver-requisitos"
```

Decide iniciar la solicitud:

```
→ page_view: path "/solicitud/datos-personales", step_code "datos-personales"
→ event_form: step "datos-personales", action "start"
```

Llena sus datos personales:

```
→ event_input (por cada campo):
  - field "documento_numero": time_to_fill_ms 1500, changes 1
  - field "nombres": time_to_fill_ms 800, changes 0
  - field "apellido_paterno": time_to_fill_ms 600, changes 0
  - field "email": time_to_fill_ms 2200, changes 2 (corrigió typo)
  - field "celular": time_to_fill_ms 1100, changes 0

→ event_form: step "datos-personales", action "submit_success"
```

Avanza al paso 2 (centro de estudios):

```
→ landing_step para "centro-estudios" tiene:
  - landing_field "institucion" prellenado (SENATI)
  - landing_field "sede" con opciones filtradas por institución

→ event_form: step "centro-estudios", action "start"
→ event_input:
  - field "sede": preselected "Arequipa" (detectado por IP)
  - field "carrera": dropdown con carreras de SENATI
  - field "ciclo": time_to_fill_ms 500
```

Pero se da cuenta que necesita su recibo de luz. Guarda y sale.

```
→ event_form: step "centro-estudios", action "abandon"
→ session:
  - status: "idle"
  - max_step_reached: "centro-estudios"

→ Sistema actualiza lead:
  - email: "carlos.quispe@gmail.com"
  - phone: "954123456"
  - document_number: "71234567"
  - institution_id: (SENATI)
  - form_completion_percent: 35
  - quality_score: 58
  - temperature: "warm"
  - priority: "medium"
```

---

**FASE 3: Recuperación (Día 2, 9:00 AM)**

El sistema ejecuta job de scoring de leads:

```
→ lead_score_rule aplicadas:
  - "tiene_email" +15 puntos
  - "tiene_telefono" +15 puntos
  - "paso_form_step_2" +20 puntos
  - "tiempo_en_sitio > 3min" +10 puntos
  - "desde_convenio" +20 puntos
  - TOTAL: quality_score = 80

→ lead actualiza:
  - quality_score: 80
  - temperature: "hot"
  - priority: "high"
```

Campaña automática de recuperación se activa:

```
→ lead_recovery_campaign "hot-leads-24h" selecciona lead
→ lead_campaign_send creado:
  - channel: "whatsapp"
  - scheduled_at: NOW + 1 hora
  - status: "pending"
```

Carlos recibe WhatsApp: "¡Hola Carlos! Tu laptop Lenovo te espera. Continúa tu solicitud aquí: [link]"

```
→ lead_campaign_send actualiza: status "clicked"
```

Carlos hace clic y completa todo el proceso:

```
→ Nueva session:
  - traffic_source: sms (whatsapp)
  - utm_campaign: "recovery-hot-leads"

→ Sistema reconoce session anterior por fingerprint
→ Formulario restaura datos guardados

→ event_form para cada paso restante: action "complete"
```

Llega al paso final y confirma:

```
→ applicant creado/actualizado con:
  - document_type: "dni"
  - document_number: "71234567"
  - first_name: "Carlos"
  - ...

→ applicant_contact: email, phone
→ applicant_address: dirección de envío
→ applicant_income: datos laborales (si aplica)

→ application creada:
  - applicant_id: (Carlos)
  - session_id: (sesión actual)
  - landing_id: (SENATI)
  - agreement_id: (convenio SENATI)
  - status: "submitted"
  - requested_amount: 2499.00
  - requested_term: 12

→ application_product:
  - product_id: 45 (Laptop Lenovo)
  - quantity: 1
  - unit_price: 2499.00

→ application_status_log:
  - from_status: NULL
  - to_status: "submitted"
  - changed_by: NULL (sistema)
```

Actualización final de métricas:

```
→ session:
  - status: "converted"
  - application_id: (nueva solicitud)

→ lead:
  - status: "converted"
  - converted_at: NOW()

→ lead_interaction creado:
  - type: "status_change"
  - old_lead_status: "new"
  - new_lead_status: "converted"
```

---

**FASE 4: Evaluación y Aprobación (Día 2, 3:00 PM)**

El analista María revisa la solicitud de Carlos:

```
→ application_status_log:
  - from_status: "submitted"
  - to_status: "under_review"
  - changed_by: user_account.id (María)
  - notes: "Iniciando evaluación"
```

Se consulta Equifax para verificar historial crediticio:

```
→ person_equifax_history creado:
  - person_id: (Carlos)
  - query_date: NOW()
  - score: 720
  - risk_category: "B"
  - max_debt: 15000.00
  - current_debt: 2500.00
  - delinquency_count: 0
  - query_type: "full"
  - response_code: "success"

→ person actualiza:
  - equifax_score: 720
  - equifax_risk_category: "B"
  - equifax_last_query: NOW()
```

Evaluación automática aprueba:

```
→ application actualiza:
  - status: "approved"
  - approved_amount: 2499.00
  - approved_term: 12
  - approved_rate: 18.50 (TEA del convenio SENATI)
  - monthly_payment: 234.50
  - evaluated_by: user_account.id (María)
  - evaluated_at: NOW()

→ application_status_log:
  - from_status: "under_review"
  - to_status: "approved"
  - changed_by: user_account.id (María)
  - notes: "Aprobado - Score 720, sin deudas morosas"
```

Se notifica a Carlos:

```
→ Envío WhatsApp/Email: "¡Felicidades Carlos! Tu crédito fue aprobado por S/2,499"
→ application.status: "pending_disbursement"
```

---

**FASE 5: Desembolso y Generación del Préstamo (Día 3, 10:00 AM)**

Carlos firma contrato digital y se procesa el desembolso:

```
→ application actualiza:
  - status: "disbursed"
  - disbursed_at: NOW()
  - contract_signed_at: NOW()

→ application_status_log:
  - from_status: "pending_disbursement"
  - to_status: "disbursed"
  - notes: "Desembolso procesado - Transferencia a proveedor"
```

Se crea el préstamo con su cronograma:

```
→ loan creado:
  - application_id: (solicitud de Carlos)
  - person_id: (Carlos)
  - code: "LOAN-2024-001234"
  - principal_amount: 2499.00
  - interest_rate: 18.50
  - term_months: 12
  - monthly_payment: 234.50
  - first_due_date: "2024-02-15"
  - last_due_date: "2025-01-15"
  - status: "active"
  - disbursed_at: NOW()

→ loan_schedule (12 cuotas generadas):
  | cuota | due_date   | principal | interest | total  | status  |
  |-------|------------|-----------|----------|--------|---------|
  | 1     | 2024-02-15 | 187.50    | 47.00    | 234.50 | pending |
  | 2     | 2024-03-15 | 190.40    | 44.10    | 234.50 | pending |
  | 3     | 2024-04-15 | 193.35    | 41.15    | 234.50 | pending |
  | ...   | ...        | ...       | ...      | ...    | pending |
  | 12    | 2025-01-15 | 230.20    | 4.30     | 234.50 | pending |

→ loan_status_history:
  - from_status: NULL
  - to_status: "active"
  - notes: "Préstamo activado - Desembolso completado"
```

Producto es enviado a Carlos:

```
→ application_product actualiza:
  - shipping_status: "shipped"
  - tracking_code: "OLVA-123456789"
  - shipped_at: NOW()
```

---

**FASE 6: Pago de Primera Cuota (Día 30, 8:00 AM)**

Carlos paga su primera cuota vía Yape:

```
→ loan_payment creado:
  - loan_id: (préstamo de Carlos)
  - schedule_id: (cuota 1)
  - amount: 234.50
  - payment_date: "2024-02-14"
  - payment_method: "yape"
  - reference_number: "YAPE-987654321"
  - status: "confirmed"

→ loan_schedule (cuota 1) actualiza:
  - status: "paid"
  - paid_amount: 234.50
  - paid_at: "2024-02-14"
  - payment_id: (pago creado)

→ loan actualiza:
  - paid_installments: 1
  - remaining_installments: 11
  - total_paid: 234.50
  - next_due_date: "2024-03-15"
  - last_payment_date: "2024-02-14"
```

---

**FASE 7: Mora y Recuperación (Escenario Alternativo)**

Si Carlos no paga la cuota 3:

```
→ loan_schedule (cuota 3) después de fecha de vencimiento:
  - status: "overdue"
  - days_overdue: 5
  - late_fee: 15.00

→ loan actualiza:
  - status: "delinquent"
  - days_past_due: 5
  - current_overdue_amount: 249.50 (cuota + mora)

→ loan_status_history:
  - from_status: "active"
  - to_status: "delinquent"
  - notes: "Cuota 3 vencida - 5 días de atraso"

→ Sistema envía recordatorios automáticos:
  - WhatsApp día 1: "Carlos, tu cuota venció ayer"
  - SMS día 3: "Tienes 3 días de atraso"
  - Llamada día 5: lead_interaction registrado
```

Carlos regulariza su deuda:

```
→ loan_payment:
  - amount: 249.50 (cuota + mora)
  - status: "confirmed"

→ loan_schedule (cuota 3):
  - status: "paid"
  - paid_with_late_fee: 15.00

→ loan:
  - status: "active" (regularizado)
  - days_past_due: 0

→ loan_status_history:
  - from_status: "delinquent"
  - to_status: "active"
  - notes: "Regularizado - Pago cuota 3 + mora"
```

---

### 3.2 Escenario: Usuario Preaprobado

**Contexto:**
Ana fue identificada en una base de bureau de crédito como buen perfil.

```
→ preapproved_import ejecutado:
  - source: "bureau_diciembre_2024"
  - total_rows: 50000
  - imported_count: 45000

→ preapproved_customer creado para Ana:
  - document_number: "45678901"
  - source: "bureau"
  - risk_category: "A"
  - max_amount: 8000
  - special_rate: 18.5 (TEA preferencial)
  - offer_code: "PREAP-ANA-2024"
  - valid_until: "2025-01-31"
```

Marketing lanza campaña:

```
→ marketing_campaign creada:
  - code: "PREAP-DIC24"
  - type: "preapproved_outreach"
  - primary_channel: "email"
  - target_risk_categories: ["A", "B"]
  - utm_source: "email"
  - utm_campaign: "preaprobados-dic24"

→ marketing_campaign_send para Ana:
  - channel: "email"
  - status: "sent"
```

Ana hace clic en el email:

```
→ session:
  - traffic_source: "preapproved"
  - entry_url contiene offer_code

→ Sistema valida offer_code:
  - preapproved_customer encontrado
  - status: "active"
  - valid_until > NOW()
  - ✓ Oferta válida

→ preapproved_customer actualiza:
  - status: "interested"
  - landing_visits: 1
  - last_visit_at: NOW()
  - session_id: (sesión actual)
```

Ana ve landing personalizado:

```
→ Catálogo filtrado a productos hasta max_amount (8000)
→ Simulador muestra TEA especial (18.5%)
→ Campos prellenados desde preapproved_customer
```

Completa en 5 minutos (datos prellenados):

```
→ application creada con:
  - preapproved_id: (Ana)
  - special_conditions: { "rate": 18.5, "preapproved": true }

→ preapproved_customer:
  - status: "converted"
  - application_id: (nueva)

→ marketing_campaign actualiza:
  - conversions++
```

---

### 3.3 Escenario: Programa de Referidos

Pedro, cliente existente, refiere a su amigo Luis.

```
→ referral_program activo: "REFIERE-GANA-50"
  - referrer_reward_type: "cash"
  - referrer_reward_value: 50
  - referee_reward_type: "discount"
  - referee_reward_value: 5% descuento

→ referral creado:
  - referrer_application_id: (Pedro)
  - referrer_code: "PEDRO-ABC123"
  - referee_email: "luis@gmail.com"
  - status: "pending"
```

Luis recibe link, hace clic:

```
→ session:
  - traffic_source: "referral"
  - utm_source: "referral"
  - utm_campaign: "refiere-gana-50"
  - entry_url contiene referrer_code

→ referral actualiza:
  - status: "clicked"
  - clicked_at: NOW()
  - referee_session_id: (sesión Luis)
```

Luis completa solicitud y es aprobado:

```
→ referral actualiza:
  - status: "approved"
  - referee_application_id: (solicitud Luis)
  - referee_reward_amount: 5%
  - converted_at: NOW()

→ Después del desembolso:
  - referral.status: "reward_paid"
  - referral.referrer_reward_paid_at: NOW()
  - Pedro recibe S/50 de recompensa
```

---

### 3.4 Resumen de Tablas por Journey

| Fase | Tablas Involucradas |
|------|---------------------|
| Llegada | session, page_view, landing, agreement, institution |
| Navegación | event_scroll, event_click, event_filter, event_product, landing_product, promotion, landing_product_promotion |
| Formulario | event_form, event_input, landing_step, landing_field, field_validation |
| Abandono | lead, lead_score_rule |
| Recuperación | lead_recovery_campaign, lead_campaign_send, lead_interaction |
| Conversión | person, application, application_product, application_status_log |
| Evaluación | person_equifax_history, application_status_log, user_account |
| Préstamo | loan, loan_schedule, loan_status_history |
| Pagos | loan_payment, loan_schedule |
| Mora | loan_status_history, loan_schedule (late_fee) |
| Preaprobados | preapproved_customer, preapproved_import, marketing_campaign |
| Referidos | referral_program, referral |
| Analytics | Todas las tablas de tracking para reportes |

---

### 3.5 Lógica de Visibilidad: ¿Cómo un Equipo Aparece en SENATI?

La visibilidad de un producto en una landing específica (como SENATI) sigue una cadena de configuración controlada:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│               FLUJO DE VISIBILIDAD DE PRODUCTO EN SENATI                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   1. CATÁLOGO MAESTRO (product)                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  product.id = 45                                                         │   │
│   │  product.name = "Laptop HP 15-ef2126wm"                                 │   │
│   │  product.is_active = 1  ←── Debe estar activo globalmente               │   │
│   │  product.base_price = 2499.00                                           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                          │
│   2. INSTITUCIÓN Y CONVENIO                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  institution.id = 10                                                     │   │
│   │  institution.code = "SENATI"                                            │   │
│   │  institution.is_active = 1                                              │   │
│   │          ↓                                                               │   │
│   │  agreement.id = 5                                                        │   │
│   │  agreement.institution_id = 10  (SENATI)                                │   │
│   │  agreement.is_active = 1                                                │   │
│   │  agreement.valid_from <= HOY <= agreement.valid_until ←── Convenio vigente│   │
│   │  agreement.max_loan_amount = 5000.00  ←── Límite del convenio           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                          │
│   3. LANDING ESPECÍFICO                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  landing.id = 8                                                          │   │
│   │  landing.slug = "senati"  ←── URL: baldecash.pe/senati                  │   │
│   │  landing.agreement_id = 5  ←── Vinculado al convenio                    │   │
│   │  landing.institution_id = 10  ←── Vinculado a la institución            │   │
│   │  landing.is_active = 1                                                  │   │
│   │  landing.status = "published"                                           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                          │
│   4. PRODUCTO ASIGNADO AL LANDING (landing_product) ←── CLAVE                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  landing_product.landing_id = 8  (senati)                               │   │
│   │  landing_product.product_id = 45  (HP 15-ef2126wm)                      │   │
│   │  landing_product.is_visible = 1  ←── VISIBLE EN ESTE LANDING            │   │
│   │  landing_product.is_featured = 1  ←── Aparece destacado                 │   │
│   │  landing_product.display_order = 1  ←── Orden de aparición              │   │
│   │  landing_product.valid_from <= HOY <= landing_product.valid_until       │   │
│   │                                                                          │   │
│   │  -- Precios ESPECÍFICOS para SENATI (pueden diferir del precio base)   │   │
│   │  landing_product.term_months = 12                                       │   │
│   │  landing_product.monthly_payment = 229.00  ←── Cuota SENATI             │   │
│   │  landing_product.tea = 45.50                                            │   │
│   │  landing_product.discount_percentage = 5.00  ←── Descuento convenio     │   │
│   │  landing_product.promo_tag = "CONVENIO"                                 │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Query para obtener productos visibles en SENATI:**

```sql
SELECT
    p.id,
    p.name,
    p.sku,
    b.name AS brand_name,
    lp.monthly_payment,
    lp.term_months,
    lp.tea,
    lp.discount_percentage,
    lp.promo_tag,
    lp.is_featured,
    lp.display_order
FROM landing l
JOIN landing_product lp ON lp.landing_id = l.id
JOIN product p ON p.id = lp.product_id
JOIN brand b ON b.id = p.brand_id
LEFT JOIN agreement ag ON ag.id = l.agreement_id
WHERE l.slug = 'senati'
  AND l.is_active = 1
  AND l.status = 'published'
  AND p.is_active = 1
  AND lp.is_visible = 1
  AND (lp.valid_from IS NULL OR lp.valid_from <= CURDATE())
  AND (lp.valid_until IS NULL OR lp.valid_until >= CURDATE())
  AND (ag.id IS NULL OR (ag.is_active = 1 AND ag.valid_until >= CURDATE()))
ORDER BY lp.is_featured DESC, lp.display_order ASC;
```

**¿Por qué un producto NO aparecería en SENATI?**

| Razón | Campo a verificar |
|-------|-------------------|
| Producto inactivo globalmente | `product.is_active = 0` |
| No asignado al landing | No existe registro en `landing_product` |
| Oculto en el landing | `landing_product.is_visible = 0` |
| Fuera de fecha de vigencia | `landing_product.valid_until < HOY` |
| Convenio vencido | `agreement.valid_until < HOY` |
| Landing no publicado | `landing.status != 'published'` |

---

### 3.6 Vinculación: Solicitud → Producto → Landing → Préstamo

Cuando Carlos completa su solicitud, el sistema registra toda la trazabilidad:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE VINCULACIÓN DE SOLICITUD                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ENTRADA: Carlos selecciona laptop HP y completa formulario                    │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  SESSION (Origen del tráfico)                                            │   │
│   │  session.id = 1234                                                       │   │
│   │  session.landing_id = 8 (senati)                                        │   │
│   │  session.uuid = "abc-123-xyz"                                           │   │
│   │  session.utm_source = "whatsapp"                                        │   │
│   │  session.traffic_source = "organic_social"                              │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  APPLICATION (Solicitud de crédito)                                      │   │
│   │  application.id = 5001                                                   │   │
│   │  application.code = "BC-2025-005001"                                    │   │
│   │                                                                          │   │
│   │  ── VINCULACIÓN AL ORIGEN ──                                            │   │
│   │  application.session_id = 1234  ←── ¿De dónde vino?                     │   │
│   │  application.landing_id = 8     ←── ¿Qué landing usó?                   │   │
│   │                                                                          │   │
│   │  ── VINCULACIÓN A LA PERSONA ──                                         │   │
│   │  application.person_id = 789                                            │   │
│   │  application.contact_version_id = 45   ←── Versión de contacto usada    │   │
│   │  application.address_version_id = 23   ←── Versión de dirección usada   │   │
│   │  application.academic_version_id = 12  ←── Versión académica usada      │   │
│   │  application.employment_version_id = 8 ←── Versión laboral usada        │   │
│   │  application.financial_version_id = 5  ←── Versión financiera usada     │   │
│   │                                                                          │   │
│   │  ── VINCULACIÓN AL PRODUCTO (PRÉSTAMO) ──                               │   │
│   │  application.product_id = 45           ←── ¿Qué producto solicitó?      │   │
│   │  application.term_months = 12          ←── ¿A cuántos meses?            │   │
│   │  application.monthly_payment = 229.00  ←── ¿Cuota acordada?             │   │
│   │  application.total_amount = 2748.00    ←── ¿Monto total del préstamo?   │   │
│   │  application.tea = 45.50               ←── ¿Tasa aplicada?              │   │
│   │  application.tcea = 52.30                                               │   │
│   │  application.initial_payment = 0                                        │   │
│   │  application.discount_applied = 125.00 ←── Descuento convenio SENATI    │   │
│   │                                                                          │   │
│   │  ── SCORING (EQUIFAX) ──                                                │   │
│   │  application.equifax_score_used = 720                                   │   │
│   │  application.score_category = "B"                                       │   │
│   │  application.risk_level = "low"                                         │   │
│   │                                                                          │   │
│   │  ── ATTRIBUTION ──                                                       │   │
│   │  application.source = "organic_social"  ←── Copiado de session          │   │
│   │  application.campaign = "whatsapp_senati_dic2025"                       │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Queries de Trazabilidad Completa:**

```sql
-- 1. ¿De qué landing vino esta solicitud?
SELECT
    a.code AS solicitud,
    l.name AS landing_name,
    l.slug AS landing_url,
    i.name AS institucion,
    ag.code AS convenio
FROM application a
JOIN landing l ON l.id = a.landing_id
LEFT JOIN institution i ON i.id = l.institution_id
LEFT JOIN agreement ag ON ag.id = l.agreement_id
WHERE a.id = 5001;

-- Resultado:
-- | solicitud        | landing_name | landing_url | institucion | convenio     |
-- |------------------|--------------|-------------|-------------|--------------|
-- | BC-2025-005001   | SENATI       | senati      | SENATI      | CONV-SENATI  |
```

```sql
-- 2. ¿Qué producto solicitó y con qué condiciones?
SELECT
    a.code AS solicitud,
    p.name AS producto,
    p.sku,
    b.name AS marca,
    a.term_months AS plazo_meses,
    a.monthly_payment AS cuota_mensual,
    a.total_amount AS monto_total_prestamo,
    a.tea,
    a.tcea,
    a.discount_applied AS descuento_convenio
FROM application a
JOIN product p ON p.id = a.product_id
JOIN brand b ON b.id = p.brand_id
WHERE a.id = 5001;

-- Resultado:
-- | solicitud        | producto            | plazo | cuota  | total   | tea   | descuento |
-- |------------------|---------------------|-------|--------|---------|-------|-----------|
-- | BC-2025-005001   | HP 15-ef2126wm      | 12    | 229.00 | 2748.00 | 45.50 | 125.00    |
```

```sql
-- 3. ¿Cómo llegó el usuario? (Attribution completo)
SELECT
    a.code AS solicitud,
    s.traffic_source,
    s.utm_source,
    s.utm_medium,
    s.utm_campaign,
    s.referrer_domain,
    s.device_type,
    s.created_at AS primera_visita,
    a.submitted_at AS fecha_solicitud
FROM application a
JOIN session s ON s.id = a.session_id
WHERE a.id = 5001;

-- Resultado:
-- | solicitud       | traffic_source | utm_source | device  | referrer    |
-- |-----------------|----------------|------------|---------|-------------|
-- | BC-2025-005001  | organic_social | whatsapp   | mobile  | wa.me       |
```

```sql
-- 4. Historial de datos usados en la solicitud (auditoría)
SELECT
    a.code AS solicitud,
    pc.email,
    pc.phone_primary,
    pa.full_address,
    pa.district,
    pac.institution_name,
    pac.career_name,
    pe.company_name,
    pe.net_income,
    pf.has_active_debts,
    pf.monthly_debt_payment
FROM application a
JOIN person_contact_history pc ON pc.id = a.contact_version_id
JOIN person_address_history pa ON pa.id = a.address_version_id
LEFT JOIN person_academic_history pac ON pac.id = a.academic_version_id
LEFT JOIN person_employment_history pe ON pe.id = a.employment_version_id
LEFT JOIN person_financial_history pf ON pf.id = a.financial_version_id
WHERE a.id = 5001;
```

---

### 3.7 Diagrama de Relaciones: Solicitud Completa

```
                                    ┌──────────────┐
                                    │  institution │
                                    │   (SENATI)   │
                                    └──────┬───────┘
                                           │
                                    ┌──────▼───────┐
                                    │  agreement   │
                                    │ (convenio)   │
                                    └──────┬───────┘
                                           │
┌──────────────┐                    ┌──────▼───────┐                    ┌──────────────┐
│   session    │───────────────────▶│   landing    │◀───────────────────│   product    │
│ (tráfico)    │                    │  (senati)    │   landing_product  │ (HP laptop)  │
└──────┬───────┘                    └──────┬───────┘                    └──────┬───────┘
       │                                   │                                   │
       │                                   │                                   │
       │         ┌─────────────────────────┼─────────────────────────┐         │
       │         │                         │                         │         │
       │         │                  ┌──────▼───────┐                 │         │
       └────────────────────────────▶│ APPLICATION  │◀────────────────────────┘
                 │                  │  (solicitud) │                 │
                 │                  └──────┬───────┘                 │
                 │                         │                         │
                 │         ┌───────────────┼───────────────┐         │
                 │         │               │               │         │
                 │  ┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐  │
                 │  │  person    │  │ *_history  │  │  Equifax   │  │
                 │  │  (Carlos)  │  │ (versiones)│  │  (scoring) │  │
                 │  └────────────┘  └────────────┘  └────────────┘  │
                 │                                                   │
                 └───────────────────────────────────────────────────┘

LEYENDA:
- session: De dónde vino el usuario (UTM, referrer, device)
- landing: Página específica visitada (baldecash.pe/senati)
- landing_product: Productos visibles en ese landing con precios específicos
- product: Producto seleccionado (la laptop)
- application: La solicitud de crédito (el "préstamo")
- person + *_history: Datos del solicitante con versionado
- agreement: Convenio institucional que puede dar descuentos
- Equifax: Scoring crediticio consultado
```

---

## 4. Módulo: Core

### 3.1 institution

Instituciones educativas (universidades, institutos, colegios).

```sql
CREATE TABLE `institution` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único: UPN, SENATI, UCV',
  `name` VARCHAR(200) NOT NULL,
  `short_name` VARCHAR(50),
  `type` ENUM('universidad', 'instituto', 'colegio', 'cetpro', 'idiomas', 'otro') NOT NULL,
  `management` ENUM('publica', 'privada') NOT NULL,
  `is_licensed` TINYINT(1) DEFAULT 0 COMMENT 'Licenciada por SUNEDU',
  `logo_url` VARCHAR(500),
  `website_url` VARCHAR(300),
  `woe_score` DECIMAL(12,10) COMMENT 'Weight of Evidence para scoring',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_institution_code` (`code`),
  KEY `idx_institution_type` (`type`),
  KEY `idx_institution_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 institution_campus

Sedes de instituciones.

```sql
CREATE TABLE `institution_campus` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(30),
  `address` VARCHAR(300),
  `district` VARCHAR(100),
  `province` VARCHAR(100),
  `department` VARCHAR(100),
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),
  `phone` VARCHAR(20),
  `is_main` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campus_institution` (`institution_id`),
  CONSTRAINT `fk_campus_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 career

Carreras profesionales.

```sql
CREATE TABLE `career` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `normalized_name` VARCHAR(200) NOT NULL COMMENT 'Nombre normalizado para matching',
  `field` VARCHAR(100) COMMENT 'Área: Ingeniería, Salud, Negocios',
  `woe_score` DECIMAL(12,10),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_career_normalized` (`normalized_name`),
  KEY `idx_career_field` (`field`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.4 agreement

Convenios con instituciones.

```sql
CREATE TABLE `agreement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `type` ENUM('exclusivo', 'preferente', 'standard') DEFAULT 'standard',
  `discount_percentage` DECIMAL(5,2),
  `special_tea` DECIMAL(5,2) COMMENT 'TEA especial del convenio',
  `min_tea` DECIMAL(5,2),
  `commission_rate` DECIMAL(5,2),
  `valid_from` DATE NOT NULL,
  `valid_until` DATE,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agreement_code` (`code`),
  KEY `idx_agreement_institution` (`institution_id`),
  KEY `idx_agreement_active` (`is_active`, `valid_from`, `valid_until`),
  CONSTRAINT `fk_agreement_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.5 user_account

Usuarios del backoffice (simplificado).

```sql
CREATE TABLE `user_account` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `full_name` VARCHAR(200) NOT NULL,
  `role` ENUM('admin', 'analyst', 'sales', 'support', 'viewer') NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Módulo: Products

### 4.1 brand

Marcas de productos.

```sql
CREATE TABLE `brand` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `logo_url` VARCHAR(500),
  `website_url` VARCHAR(300),
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_brand_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 product

Productos base.

```sql
CREATE TABLE `product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(50) NOT NULL COMMENT 'Código único interno',
  `brand_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `short_name` VARCHAR(100),
  `slug` VARCHAR(200) NOT NULL,
  `type` ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio', 'seguro') NOT NULL,
  `condition` ENUM('nueva', 'reacondicionada', 'open_box') DEFAULT 'nueva',
  `description` TEXT,
  `short_description` VARCHAR(500),

  -- Precios base
  `purchase_price` DECIMAL(10,2) COMMENT 'Precio de compra',
  `list_price` DECIMAL(10,2) NOT NULL COMMENT 'Precio de lista',
  `currency` CHAR(3) DEFAULT 'PEN',

  -- Control
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `available_from` DATE,
  `available_until` DATE,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_sku` (`sku`),
  UNIQUE KEY `uk_product_slug` (`slug`),
  KEY `idx_product_brand` (`brand_id`),
  KEY `idx_product_type` (`type`),
  KEY `idx_product_active` (`is_active`, `available_from`, `available_until`),
  CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`),
  CONSTRAINT `fk_product_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.3 spec_definition

Catálogo de especificaciones disponibles. Modelo EAV (Entity-Attribute-Value) para escalabilidad a cualquier tipo de producto (laptops, motos, celulares, etc.).

```sql
CREATE TABLE `spec_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: ram_gb, cilindrada, tipo_moto, gama',
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre display: Memoria RAM, Cilindrada, Tipo de Moto, Gama',
  `description` VARCHAR(300),
  `data_type` ENUM('string', 'number', 'boolean') NOT NULL,
  `unit` VARCHAR(20) COMMENT 'Unidad: GB, cc, pulgadas, Hz',
  `icon` VARCHAR(50) COMMENT 'Icono para UI',

  -- Configuración de visualización
  `is_filterable` TINYINT(1) DEFAULT 0 COMMENT '¿Aparece como filtro en catálogo?',
  `is_comparable` TINYINT(1) DEFAULT 0 COMMENT '¿Aparece en comparador de productos?',
  `is_highlight` TINYINT(1) DEFAULT 0 COMMENT '¿Se muestra en card del producto?',
  `display_order` INT DEFAULT 0,

  -- Agrupación para UI
  `group_code` VARCHAR(50) COMMENT 'Grupo: procesador, memoria, pantalla, motor, conectividad',
  `group_order` INT DEFAULT 0,

  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spec_code` (`code`),
  KEY `idx_spec_filterable` (`is_filterable`, `display_order`),
  KEY `idx_spec_group` (`group_code`, `group_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.4 spec_product_type

Relación entre especificaciones y tipos de producto (normalizado, sin JSON).

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

**Query para obtener specs de un tipo de producto:**
```sql
-- Specs disponibles para laptops
SELECT sd.*
FROM spec_definition sd
JOIN spec_product_type spt ON spt.spec_definition_id = sd.id
WHERE spt.product_type = 'laptop'
  AND sd.is_active = 1
ORDER BY sd.group_code, sd.group_order;
```

### 4.5 product_spec_value

Valores de especificaciones por producto (tabla pivote del modelo EAV).

```sql
CREATE TABLE `product_spec_value` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `spec_definition_id` BIGINT UNSIGNED NOT NULL,

  -- Solo uno de estos campos tendrá valor según data_type
  `value_string` VARCHAR(255),
  `value_number` DECIMAL(12,4),
  `value_boolean` TINYINT(1),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_spec` (`product_id`, `spec_definition_id`),

  -- Índices para filtros frecuentes
  KEY `idx_spec_string` (`spec_definition_id`, `value_string`),
  KEY `idx_spec_number` (`spec_definition_id`, `value_number`),
  KEY `idx_spec_boolean` (`spec_definition_id`, `value_boolean`),

  CONSTRAINT `fk_psv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_psv_spec` FOREIGN KEY (`spec_definition_id`) REFERENCES `spec_definition` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ventajas del modelo EAV:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MODELO EAV - ESCALABILIDAD                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  spec_definition (catálogo)         product_spec_value (valores)               │
│  ┌─────────────────────────┐        ┌─────────────────────────────────────────┐│
│  │ code: ram_gb            │        │ product_id: 1 (Laptop HP)               ││
│  │ product_types: [laptop] │───────▶│ spec_definition_id: 1 (ram_gb)          ││
│  │ data_type: number       │        │ value_number: 16                        ││
│  │ unit: GB                │        └─────────────────────────────────────────┘│
│  └─────────────────────────┘                                                    │
│                                                                                 │
│  ┌─────────────────────────┐        ┌─────────────────────────────────────────┐│
│  │ code: cilindrada        │        │ product_id: 50 (Moto Honda)             ││
│  │ product_types: [moto]   │───────▶│ spec_definition_id: 20 (cilindrada)     ││
│  │ data_type: number       │        │ value_number: 150                       ││
│  │ unit: cc                │        └─────────────────────────────────────────┘│
│  └─────────────────────────┘                                                    │
│                                                                                 │
│  ┌─────────────────────────┐        ┌─────────────────────────────────────────┐│
│  │ code: gama              │        │ product_id: 1 (Laptop HP)               ││
│  │ product_types: [ALL]    │───────▶│ spec_definition_id: 30 (gama)           ││
│  │ data_type: string       │        │ value_string: "alta"                    ││
│  └─────────────────────────┘        └─────────────────────────────────────────┘│
│                                                                                 │
│  ESCALABLE: Agregar specs para nuevos productos sin cambiar esquema            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Query ejemplo - Obtener specs de un producto:**
```sql
SELECT
    sd.code,
    sd.name,
    sd.unit,
    CASE sd.data_type
        WHEN 'string' THEN psv.value_string
        WHEN 'number' THEN CAST(psv.value_number AS CHAR)
        WHEN 'boolean' THEN IF(psv.value_boolean, 'Sí', 'No')
    END AS value
FROM product_spec_value psv
JOIN spec_definition sd ON sd.id = psv.spec_definition_id
WHERE psv.product_id = 1
ORDER BY sd.group_code, sd.group_order;
```

**Query ejemplo - Filtrar productos por specs:**
```sql
-- Laptops con RAM >= 16GB y SSD >= 512GB
SELECT DISTINCT p.*
FROM product p
JOIN product_spec_value ram ON ram.product_id = p.id
JOIN spec_definition sd_ram ON sd_ram.id = ram.spec_definition_id AND sd_ram.code = 'ram_gb'
JOIN product_spec_value ssd ON ssd.product_id = p.id
JOIN spec_definition sd_ssd ON sd_ssd.id = ssd.spec_definition_id AND sd_ssd.code = 'storage_ssd_gb'
WHERE p.type = 'laptop'
  AND ram.value_number >= 16
  AND ssd.value_number >= 512;
```

### 4.6 tag

Sistema de etiquetas para agrupar productos (reemplaza el sistema de recomendaciones).

```sql
CREATE TABLE `tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: gaming, apple, reacondicionado, oferta_navidad',
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre display: Gaming, Apple, Reacondicionado',
  `description` VARCHAR(300),
  `tag_type` ENUM('categoria', 'marca', 'promocion', 'campana', 'temporal', 'caracteristica') NOT NULL,
  `color` VARCHAR(7) COMMENT 'Color hex para badge: #FF5733',
  `icon` VARCHAR(50) COMMENT 'Icono para UI',
  `display_order` INT DEFAULT 0,
  `is_visible` TINYINT(1) DEFAULT 1 COMMENT '¿Visible en UI para usuarios?',
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_from` DATE COMMENT 'Para tags temporales',
  `valid_until` DATE COMMENT 'Para tags temporales',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_code` (`code`),
  KEY `idx_tag_type` (`tag_type`, `is_active`),
  KEY `idx_tag_visible` (`is_visible`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.7 product_tag

Relación muchos a muchos entre productos y tags.

```sql
CREATE TABLE `product_tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `display_order` INT DEFAULT 0 COMMENT 'Orden del producto dentro del tag',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_tag` (`product_id`, `tag_id`),
  KEY `idx_tag_products` (`tag_id`, `display_order`),

  CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Flujo del sistema de Tags:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SISTEMA DE TAGS - AGRUPACIONES                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Un producto puede tener MÚLTIPLES tags simultáneamente:                        │
│                                                                                 │
│  Laptop Lenovo LOQ ─────┬─► tag: "gaming"         (caracteristica)              │
│                         ├─► tag: "gama_alta"      (caracteristica)              │
│                         ├─► tag: "lenovo"         (marca)                       │
│                         └─► tag: "cyber_2025"     (campana temporal)            │
│                                                                                 │
│  Moto Honda CB190R ─────┬─► tag: "moto_deportiva" (categoria)                   │
│                         ├─► tag: "honda"          (marca)                       │
│                         └─► tag: "reacondicionado"(caracteristica)              │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  QUERIES FLEXIBLES:                                                             │
│                                                                                 │
│  -- Productos gaming:                                                           │
│  SELECT p.* FROM product p                                                      │
│  JOIN product_tag pt ON pt.product_id = p.id                                    │
│  JOIN tag t ON t.id = pt.tag_id                                                 │
│  WHERE t.code = 'gaming';                                                       │
│                                                                                 │
│  -- Productos que sean gaming Y reacondicionados:                               │
│  SELECT p.* FROM product p                                                      │
│  JOIN product_tag pt1 ON pt1.product_id = p.id                                  │
│  JOIN tag t1 ON t1.id = pt1.tag_id AND t1.code = 'gaming'                       │
│  JOIN product_tag pt2 ON pt2.product_id = p.id                                  │
│  JOIN tag t2 ON t2.id = pt2.tag_id AND t2.code = 'reacondicionado';             │
│                                                                                 │
│  -- Productos con cualquiera de estos tags:                                     │
│  SELECT DISTINCT p.* FROM product p                                             │
│  JOIN product_tag pt ON pt.product_id = p.id                                    │
│  JOIN tag t ON t.id = pt.tag_id                                                 │
│  WHERE t.code IN ('gaming', 'apple', 'oferta_navidad');                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.8 product_image

Imágenes del producto.

```sql
CREATE TABLE `product_image` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(200),
  `type` ENUM('main', 'gallery', 'thumbnail', '360', 'video_thumbnail') DEFAULT 'gallery',
  `display_order` INT DEFAULT 0,
  `width` SMALLINT UNSIGNED,
  `height` SMALLINT UNSIGNED,
  `file_size_kb` INT UNSIGNED,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_image_product` (`product_id`, `type`, `display_order`),
  CONSTRAINT `fk_image_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.9 product_pricing

Precios y cuotas por plazo.

```sql
CREATE TABLE `product_pricing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `term_months` TINYINT UNSIGNED NOT NULL COMMENT 'Plazo en meses: 6, 9, 12, 18, 24',
  `monthly_payment` DECIMAL(10,2) NOT NULL COMMENT 'Cuota mensual',
  `initial_payment` DECIMAL(10,2) DEFAULT 0 COMMENT 'Cuota inicial',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT 'Monto total a pagar',
  `tea` DECIMAL(6,3) COMMENT 'Tasa Efectiva Anual',
  `tcea` DECIMAL(6,3) COMMENT 'Tasa de Costo Efectivo Anual',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Plazo mostrado por defecto',
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_from` DATE,
  `valid_until` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pricing_product_term` (`product_id`, `term_months`),
  KEY `idx_pricing_active` (`is_active`, `valid_from`, `valid_until`),
  CONSTRAINT `fk_pricing_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.10 accessory

Accesorios disponibles.

```sql
CREATE TABLE `accessory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK al producto base',
  `category` ENUM('auriculares', 'mouse', 'teclado', 'mochila', 'soporte', 'cargador', 'protector', 'hub', 'otro') NOT NULL,
  `monthly_price_addon` DECIMAL(8,2) NOT NULL COMMENT 'Precio mensual adicional',
  `is_recommended` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accessory_product` (`product_id`),
  KEY `idx_accessory_category` (`category`),
  CONSTRAINT `fk_accessory_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Tipos de producto compatibles con cada accesorio (normalizado)
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

### 4.11 insurance

Seguros disponibles.

```sql
CREATE TABLE `insurance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `coverage_months` TINYINT UNSIGNED NOT NULL,
  `monthly_price` DECIMAL(8,2) NOT NULL,
  `coverage_details` JSON COMMENT 'Detalles de cobertura',
  `provider` VARCHAR(100),
  `is_mandatory_refurbished` TINYINT(1) DEFAULT 0 COMMENT 'Obligatorio para reacondicionados',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_insurance_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.12 combo

Combos de productos.

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

## 5. Módulo: Landing Configuration

### 5.1 landing_template

Templates base para herencia.

```sql
CREATE TABLE `landing_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `is_system` TINYINT(1) DEFAULT 0 COMMENT 'Template del sistema, no editable',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`code`),
  CONSTRAINT `fk_template_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.2 landing

Configuración de landings.

```sql
CREATE TABLE `landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED COMMENT 'Template del que hereda',
  `agreement_id` BIGINT UNSIGNED COMMENT 'Convenio asociado si aplica',
  `institution_id` BIGINT UNSIGNED COMMENT 'Institución asociada si aplica',

  -- Versionamiento y Staging (v3.0)
  `current_version_id` BIGINT UNSIGNED COMMENT 'Versión actualmente publicada en producción',
  `staging_version_id` BIGINT UNSIGNED COMMENT 'Versión en staging/preview',
  `status` ENUM('draft', 'staging', 'published', 'archived') DEFAULT 'draft' COMMENT 'Estado del landing',

  -- Identificación
  `code` VARCHAR(50) NOT NULL COMMENT 'Código interno',
  `slug` VARCHAR(100) NOT NULL COMMENT 'URL: prestamo, ucv-cachimbos',
  `name` VARCHAR(150) NOT NULL,
  `display_name` VARCHAR(200) COMMENT 'Nombre para mostrar al usuario',

  -- SEO
  `meta_title` VARCHAR(200),
  `meta_description` VARCHAR(500),
  `canonical_url` VARCHAR(300),

  -- Branding
  `logo_url` VARCHAR(500),
  `favicon_url` VARCHAR(500),
  `primary_color` CHAR(7) DEFAULT '#00e4d3',
  `secondary_color` CHAR(7) DEFAULT '#fdca56',
  `accent_color` CHAR(7),

  -- Comportamiento del flujo
  `flow_type` ENUM('general', 'interno', 'activacion', 'campana', 'motos', 'colegios') DEFAULT 'general',
  `show_modalidad_step` TINYINT(1) DEFAULT 0,
  `allow_accessories` TINYINT(1) DEFAULT 1,
  `allow_insurance` TINYINT(1) DEFAULT 1,
  `require_aval` TINYINT(1) DEFAULT 0,
  `require_spouse` TINYINT(1) DEFAULT 0,
  `skip_to_gracias_on_interno` TINYINT(1) DEFAULT 0,

  -- Valores por defecto
  `default_institution_id` BIGINT UNSIGNED COMMENT 'Institución prellenada',
  `default_campus_id` BIGINT UNSIGNED COMMENT 'Sede prellenada',
  `default_term_months` TINYINT UNSIGNED DEFAULT 12,

  -- Textos personalizados
  `success_title` VARCHAR(100) DEFAULT '¡Yeeee!',
  `success_message` TEXT,
  `whatsapp_template` TEXT,

  -- URLs de redirección
  `rejection_url` VARCHAR(300),
  `success_url` VARCHAR(300),

  -- Control
  `is_active` TINYINT(1) DEFAULT 1,
  `priority` INT DEFAULT 0,
  `valid_from` DATETIME,
  `valid_until` DATETIME,
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_code` (`code`),
  UNIQUE KEY `uk_landing_slug` (`slug`),
  KEY `idx_landing_template` (`template_id`),
  KEY `idx_landing_agreement` (`agreement_id`),
  KEY `idx_landing_institution` (`institution_id`),
  KEY `idx_landing_active` (`is_active`, `valid_from`, `valid_until`),
  KEY `idx_landing_flow` (`flow_type`),
  KEY `idx_landing_status` (`status`),
  KEY `idx_landing_current_version` (`current_version_id`),
  KEY `idx_landing_staging_version` (`staging_version_id`),

  CONSTRAINT `fk_landing_template` FOREIGN KEY (`template_id`) REFERENCES `landing_template` (`id`),
  CONSTRAINT `fk_landing_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_landing_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_landing_default_institution` FOREIGN KEY (`default_institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_landing_default_campus` FOREIGN KEY (`default_campus_id`) REFERENCES `institution_campus` (`id`),
  CONSTRAINT `fk_landing_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_landing_current_version` FOREIGN KEY (`current_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_landing_staging_version` FOREIGN KEY (`staging_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.3 landing_inheritance

Herencia múltiple de configuraciones.

```sql
CREATE TABLE `landing_inheritance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `parent_template_id` BIGINT UNSIGNED NOT NULL,
  `priority` INT NOT NULL DEFAULT 0 COMMENT 'Mayor = más prioritario (override)',
  `inherit_steps` TINYINT(1) DEFAULT 1,
  `inherit_fields` TINYINT(1) DEFAULT 1,
  `inherit_validations` TINYINT(1) DEFAULT 1,
  `inherit_products` TINYINT(1) DEFAULT 1,
  `inherit_promotions` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_inheritance` (`landing_id`, `parent_template_id`),
  KEY `idx_inheritance_priority` (`landing_id`, `priority` DESC),
  CONSTRAINT `fk_inheritance_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inheritance_template` FOREIGN KEY (`parent_template_id`) REFERENCES `landing_template` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.4 feature_definition

Catálogo de features disponibles (sin JSON).

```sql
CREATE TABLE `feature_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'show_filters, enable_chat, show_faq, show_testimonials',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `category` ENUM('ui', 'form', 'catalog', 'tracking', 'integration', 'other') NOT NULL,

  -- Configuración por defecto (sin JSON)
  `default_enabled` TINYINT(1) DEFAULT 0,
  `default_position` VARCHAR(50) COMMENT 'header, sidebar, footer, modal',
  `default_priority` INT DEFAULT 0,

  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feature_code` (`code`),
  KEY `idx_feature_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.5 landing_feature

Feature flags por landing (sin JSON, normalizado).

```sql
CREATE TABLE `landing_feature` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `feature_id` BIGINT UNSIGNED NOT NULL,

  -- Override de configuración (sin JSON)
  `is_enabled` TINYINT(1) DEFAULT 1,
  `position_override` VARCHAR(50) COMMENT 'Override de posición',
  `priority_override` INT COMMENT 'Override de prioridad',

  -- Configuración específica del feature (columnas separadas)
  `config_url` VARCHAR(500) COMMENT 'URL si el feature lo requiere (chat widget, etc.)',
  `config_api_key` VARCHAR(200) COMMENT 'API key si requiere integración',
  `config_limit` INT COMMENT 'Límite numérico (ej: max testimonials)',
  `config_style` VARCHAR(50) COMMENT 'Estilo visual: minimal, full, compact',

  `valid_from` DATETIME,
  `valid_until` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_feature` (`landing_id`, `feature_id`),
  KEY `idx_landing_feature_enabled` (`landing_id`, `is_enabled`),
  CONSTRAINT `fk_lf_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lf_feature` FOREIGN KEY (`feature_id`) REFERENCES `feature_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Features típicos:**
```sql
INSERT INTO feature_definition (code, name, category, default_enabled) VALUES
('show_filters', 'Mostrar filtros en catálogo', 'catalog', 1),
('show_sort', 'Mostrar ordenamiento', 'catalog', 1),
('show_compare', 'Comparar productos', 'catalog', 0),
('enable_chat', 'Chat de soporte', 'integration', 0),
('show_faq', 'Preguntas frecuentes', 'ui', 1),
('show_testimonials', 'Testimonios de clientes', 'ui', 0),
('show_simulator', 'Simulador de cuotas', 'catalog', 1),
('require_selfie', 'Selfie obligatorio', 'form', 0),
('enable_biometric', 'Validación biométrica', 'integration', 0),
('show_whatsapp_button', 'Botón WhatsApp flotante', 'ui', 1);
```

### 5.6 landing_promotion

Promociones y modales por landing.

```sql
CREATE TABLE `landing_promotion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('modal', 'banner', 'popup', 'toast', 'inline') NOT NULL,
  `placement` ENUM('home', 'catalog', 'form', 'confirmation', 'all') DEFAULT 'catalog',

  -- Trigger
  `trigger_type` ENUM('on_load', 'on_scroll', 'on_exit_intent', 'on_time', 'on_idle', 'on_action') NOT NULL,
  `trigger_value` VARCHAR(100) COMMENT 'scroll_50, seconds_30, click_cta',
  `trigger_delay_ms` INT DEFAULT 0,

  -- Contenido
  `title` VARCHAR(200),
  `subtitle` VARCHAR(300),
  `body_html` TEXT,
  `image_url` VARCHAR(500),
  `cta_text` VARCHAR(100),
  `cta_url` VARCHAR(500),
  `cta_action` VARCHAR(50) COMMENT 'close, redirect, scroll_to',
  `dismiss_text` VARCHAR(100),

  -- Comportamiento
  `show_once_per_session` TINYINT(1) DEFAULT 1,
  `show_max_times` TINYINT UNSIGNED,
  `dismissable` TINYINT(1) DEFAULT 1,
  `backdrop_close` TINYINT(1) DEFAULT 1,

  -- Control
  `is_active` TINYINT(1) DEFAULT 1,
  `priority` INT DEFAULT 0,
  `valid_from` DATETIME,
  `valid_until` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_promotion_landing` (`landing_id`),
  KEY `idx_promotion_active` (`is_active`, `valid_from`, `valid_until`),
  KEY `idx_promotion_placement` (`placement`, `trigger_type`),
  CONSTRAINT `fk_promotion_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.7 landing_product

Productos disponibles por landing con precios específicos.

```sql
CREATE TABLE `landing_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,

  -- Override de precios por landing
  `term_months` TINYINT UNSIGNED NOT NULL,
  `monthly_payment` DECIMAL(10,2) NOT NULL,
  `initial_payment` DECIMAL(10,2) DEFAULT 0,
  `tea` DECIMAL(6,3),
  `tcea` DECIMAL(6,3),

  -- Promociones específicas
  `discount_percentage` DECIMAL(5,2),
  `discount_amount` DECIMAL(10,2),
  `promo_tag` VARCHAR(50) COMMENT 'OFERTA, NUEVO, -20%',

  -- Control
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `valid_from` DATE,
  `valid_until` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_product_term` (`landing_id`, `product_id`, `term_months`),
  KEY `idx_landing_product_visible` (`landing_id`, `is_visible`, `display_order`),
  KEY `idx_landing_product_product` (`product_id`),
  CONSTRAINT `fk_lp_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.8 landing_accessory

Accesorios disponibles por landing.

```sql
CREATE TABLE `landing_accessory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `accessory_id` BIGINT UNSIGNED NOT NULL,
  `monthly_price_override` DECIMAL(8,2) COMMENT 'Override del precio si aplica',
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_recommended` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_accessory` (`landing_id`, `accessory_id`),
  CONSTRAINT `fk_la_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_la_accessory` FOREIGN KEY (`accessory_id`) REFERENCES `accessory` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.9 landing_insurance

Seguros disponibles por landing.

```sql
CREATE TABLE `landing_insurance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `insurance_id` BIGINT UNSIGNED NOT NULL,
  `monthly_price_override` DECIMAL(8,2),
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_mandatory` TINYINT(1) DEFAULT 0,
  `is_preselected` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_insurance` (`landing_id`, `insurance_id`),
  CONSTRAINT `fk_li_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_li_insurance` FOREIGN KEY (`insurance_id`) REFERENCES `insurance` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.10 promotion

Catálogo de promociones reutilizables.

```sql
CREATE TABLE `promotion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT 'Código único: CYBER2024, BLACKFRIDAY',
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,

  -- Tipo de promoción
  `type` ENUM('discount_percent', 'discount_amount', 'special_rate', 'zero_interest', 'free_accessory', 'cashback') NOT NULL,
  `value` DECIMAL(10,2) NOT NULL COMMENT 'Valor según tipo: 20 (20%), 100 (S/100), 0.12 (12% TEA)',

  -- Condiciones
  `min_product_price` DECIMAL(10,2) COMMENT 'Precio mínimo del producto',
  `max_product_price` DECIMAL(10,2) COMMENT 'Precio máximo del producto',
  `min_term_months` TINYINT UNSIGNED COMMENT 'Plazo mínimo para aplicar',
  `max_term_months` TINYINT UNSIGNED COMMENT 'Plazo máximo para aplicar',
  `applies_to_first_purchase` TINYINT(1) DEFAULT 0 COMMENT 'Solo primera compra',

  -- Display
  `badge_text` VARCHAR(30) COMMENT 'Texto del badge: -20%, OFERTA, 0% INT',
  `badge_color` CHAR(7) DEFAULT '#ff4444',
  `banner_image_url` VARCHAR(500),

  -- Vigencia
  `valid_from` DATETIME NOT NULL,
  `valid_until` DATETIME NOT NULL,
  `max_uses` INT UNSIGNED COMMENT 'Usos máximos totales (NULL = ilimitado)',
  `current_uses` INT UNSIGNED DEFAULT 0,

  -- Control
  `is_active` TINYINT(1) DEFAULT 1,
  `is_combinable` TINYINT(1) DEFAULT 0 COMMENT 'Se puede combinar con otras promos',
  `priority` INT DEFAULT 0 COMMENT 'Prioridad si hay múltiples promos',
  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotion_code` (`code`),
  KEY `idx_promotion_active` (`is_active`, `valid_from`, `valid_until`),
  KEY `idx_promotion_type` (`type`),
  CONSTRAINT `fk_promotion_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.11 landing_product_promotion

Vincula promociones a productos en landings específicas.

```sql
CREATE TABLE `landing_product_promotion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_product_id` BIGINT UNSIGNED NOT NULL COMMENT 'Producto en landing específica',
  `promotion_id` BIGINT UNSIGNED NOT NULL,

  -- Override de vigencia (opcional, si difiere de la promoción base)
  `valid_from` DATETIME COMMENT 'Override: fecha inicio en esta landing',
  `valid_until` DATETIME COMMENT 'Override: fecha fin en esta landing',

  -- Override de valor (opcional)
  `value_override` DECIMAL(10,2) COMMENT 'Override: valor específico para esta landing',

  -- Control
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lpp_landing_product_promo` (`landing_product_id`, `promotion_id`),
  KEY `idx_lpp_promotion` (`promotion_id`),
  KEY `idx_lpp_active` (`is_active`),
  CONSTRAINT `fk_lpp_landing_product` FOREIGN KEY (`landing_product_id`) REFERENCES `landing_product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lpp_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Flujo de Promociones:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          SISTEMA DE PROMOCIONES                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  promotion (catálogo)           landing_product_promotion (aplicación)        │
│  ┌─────────────────────┐        ┌─────────────────────────────────────────┐  │
│  │ code: CYBER2024     │        │ landing_product_id: 15 (SENATI-Laptop)  │  │
│  │ type: discount_%    │───────▶│ promotion_id: 1 (CYBER2024)             │  │
│  │ value: 15           │        │ valid_until: 2024-12-25                 │  │
│  │ badge: -15%         │        │                                         │  │
│  └─────────────────────┘        └─────────────────────────────────────────┘  │
│           │                                                                   │
│           │                     ┌─────────────────────────────────────────┐  │
│           └────────────────────▶│ landing_product_id: 28 (UPN-Laptop)     │  │
│                                 │ promotion_id: 1 (CYBER2024)             │  │
│                                 │ value_override: 20 (20% para UPN)       │  │
│                                 └─────────────────────────────────────────┘  │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Consultas útiles:**

```sql
-- Productos con promociones activas en una landing
SELECT
    p.name AS producto,
    pr.badge_text,
    pr.type AS promo_tipo,
    COALESCE(lpp.value_override, pr.value) AS descuento,
    COALESCE(lpp.valid_until, pr.valid_until) AS vigencia
FROM landing_product lp
JOIN product p ON p.id = lp.product_id
JOIN landing_product_promotion lpp ON lpp.landing_product_id = lp.id
JOIN promotion pr ON pr.id = lpp.promotion_id
WHERE lp.landing_id = 5  -- SENATI
  AND lpp.is_active = 1
  AND pr.is_active = 1
  AND NOW() BETWEEN COALESCE(lpp.valid_from, pr.valid_from)
                AND COALESCE(lpp.valid_until, pr.valid_until);

-- ¿Qué promociones tiene la Lenovo LOQ en SENATI?
SELECT pr.code, pr.name, pr.type, pr.value, pr.badge_text
FROM promotion pr
JOIN landing_product_promotion lpp ON lpp.promotion_id = pr.id
JOIN landing_product lp ON lp.id = lpp.landing_product_id
JOIN product p ON p.id = lp.product_id
JOIN landing l ON l.id = lp.landing_id
WHERE p.sku = 'LOQ-15IRX9' AND l.slug = 'senati';
```

### 5.12 home_component

Componentes configurables de la página home de cada landing, con soporte para múltiples versiones en staging.

**Lógica de versionado:**
- `version_id = NULL` → Configuración de **producción** (versión publicada)
- `version_id = X` → Configuración de **staging** para la versión X

Esto permite tener múltiples versiones de home en staging simultáneamente:

```
Landing SENATI:
├── Producción (version_id=NULL): hero v1, carousel v1, featured v2
├── Staging A  (version_id=15):   hero v2, carousel v1, featured v3
└── Staging B  (version_id=16):   hero v3, carousel v2, featured v1
```

```sql
CREATE TABLE `home_component` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_id` BIGINT UNSIGNED NULL COMMENT 'NULL = producción, con valor = staging de esa versión',
  `component_code` VARCHAR(50) NOT NULL COMMENT 'hero, carousel, featured_products, banners, testimonials, faq, cta, etc.',
  `component_name` VARCHAR(100) NOT NULL,
  `component_version` VARCHAR(30) DEFAULT 'v1' COMMENT 'Versión del diseño del componente (v1, v2, v3...)',
  `is_visible` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `config` JSON COMMENT 'Configuración específica del componente (imágenes, textos, colores, etc.)',

  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_home_landing` (`landing_id`),
  KEY `idx_home_version` (`version_id`),
  KEY `idx_home_order` (`landing_id`, `version_id`, `display_order`),
  KEY `idx_home_component` (`component_code`),
  UNIQUE KEY `uk_component_per_version` (`landing_id`, `version_id`, `component_code`),

  CONSTRAINT `fk_home_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_home_version` FOREIGN KEY (`version_id`) REFERENCES `landing_version` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Queries de ejemplo:**

```sql
-- Obtener home de PRODUCCIÓN (para visitantes)
SELECT * FROM home_component
WHERE landing_id = 5 AND version_id IS NULL AND is_active = 1
ORDER BY display_order;

-- Obtener home de STAGING versión 15 (para preview)
SELECT * FROM home_component
WHERE landing_id = 5 AND version_id = 15 AND is_active = 1
ORDER BY display_order;

-- Al PUBLICAR versión 15: copiar staging a producción
-- 1. Eliminar componentes actuales de producción
DELETE FROM home_component WHERE landing_id = 5 AND version_id IS NULL;

-- 2. Copiar staging a producción (version_id → NULL)
INSERT INTO home_component (landing_id, version_id, component_code, component_name,
                            component_version, is_visible, display_order, config)
SELECT landing_id, NULL, component_code, component_name,
       component_version, is_visible, display_order, config
FROM home_component
WHERE landing_id = 5 AND version_id = 15;

-- 3. Opcionalmente limpiar staging después de publicar
DELETE FROM home_component WHERE landing_id = 5 AND version_id = 15;
```

### 5.13 landing_version

Versionado de configuraciones de landing con workflow de staging/producción.

```sql
CREATE TABLE `landing_version` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_number` INT DEFAULT 1,
  `status` ENUM('draft', 'staging', 'pending_review', 'approved', 'published', 'archived') DEFAULT 'draft',

  -- URL de staging para preview
  `staging_token` VARCHAR(64) UNIQUE COMMENT 'Token único para URL de preview',
  `staging_url` VARCHAR(300),

  -- Snapshot de configuración
  `config_snapshot` JSON COMMENT 'Snapshot completo de la configuración de landing',
  `form_config_snapshot` JSON COMMENT 'Snapshot de la configuración del formulario',

  -- Metadata
  `name` VARCHAR(100) COMMENT 'Nombre descriptivo de la versión',
  `notes` TEXT COMMENT 'Notas sobre los cambios en esta versión',

  -- Workflow timestamps
  `submitted_at` TIMESTAMP NULL COMMENT 'Cuándo se envió a revisión',
  `submitted_by` BIGINT UNSIGNED,
  `reviewed_at` TIMESTAMP NULL,
  `reviewed_by` BIGINT UNSIGNED,
  `review_notes` TEXT,
  `published_at` TIMESTAMP NULL,
  `published_by` BIGINT UNSIGNED,

  `created_by` BIGINT UNSIGNED,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_version_landing` (`landing_id`),
  KEY `idx_version_status` (`status`),
  UNIQUE KEY `uk_staging_token` (`staging_token`),
  KEY `idx_version_submitted` (`submitted_by`),
  KEY `idx_version_reviewed` (`reviewed_by`),
  KEY `idx_version_published` (`published_by`),

  CONSTRAINT `fk_version_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_version_submitted` FOREIGN KEY (`submitted_by`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_version_reviewed` FOREIGN KEY (`reviewed_by`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_version_published` FOREIGN KEY (`published_by`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_version_created` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.14 landing_change_log

Auditoría completa de todos los cambios realizados a configuraciones de landing.

```sql
CREATE TABLE `landing_change_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `version_id` BIGINT UNSIGNED COMMENT 'Versión asociada al cambio (si aplica)',

  -- Detalles del cambio
  `change_type` ENUM('create', 'update', 'delete', 'publish', 'unpublish', 'clone', 'inherit', 'restore') NOT NULL,
  `entity_type` VARCHAR(50) COMMENT 'Tipo de entidad modificada: landing, product, step, field, promotion, etc.',
  `entity_id` BIGINT UNSIGNED COMMENT 'ID de la entidad modificada',
  `entity_name` VARCHAR(100) COMMENT 'Nombre descriptivo de la entidad',

  -- Valores
  `old_value` JSON COMMENT 'Valor antes del cambio',
  `new_value` JSON COMMENT 'Valor después del cambio',
  `changed_fields` JSON COMMENT 'Lista de campos modificados',

  -- Quién y cuándo
  `changed_by` BIGINT UNSIGNED NOT NULL,
  `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(500),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_changelog_landing` (`landing_id`),
  KEY `idx_changelog_version` (`version_id`),
  KEY `idx_changelog_type` (`change_type`),
  KEY `idx_changelog_entity` (`entity_type`, `entity_id`),
  KEY `idx_changelog_user` (`changed_by`),
  KEY `idx_changelog_date` (`changed_at`),

  CONSTRAINT `fk_changelog_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_changelog_version` FOREIGN KEY (`version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_changelog_user` FOREIGN KEY (`changed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.15 Flujo de Staging y Publicación

Este diagrama muestra cómo funciona el sistema de versionado para permitir múltiples configuraciones en staging antes de publicar.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE STAGING Y PUBLICACIÓN                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                                                            │
│  │     landing     │──────────────────────────────────────────────────────┐     │
│  │                 │                                                      │     │
│  │ current_version_id ────────┐  (producción)                            │     │
│  │ staging_version_id ────────┼──┐ (preview)                             │     │
│  └─────────────────┘          │  │                                        │     │
│                               │  │                                        │     │
│                               ▼  ▼                                        │     │
│  ┌─────────────────────────────────────────────────────────────────┐     │     │
│  │                      landing_version                             │     │     │
│  │                                                                  │     │     │
│  │  ID=10 │ status=PUBLISHED │ config_snapshot │ form_config_snap  │◄────┘     │
│  │  ID=15 │ status=STAGING   │ config_snapshot │ form_config_snap  │           │
│  │  ID=16 │ status=DRAFT     │ config_snapshot │ form_config_snap  │           │
│  └──────────────────────────────────────────────────────────────────┘           │
│                               │                                                 │
│           ┌───────────────────┴───────────────────┐                             │
│           │                                       │                             │
│           ▼                                       ▼                             │
│  ┌─────────────────────┐              ┌─────────────────────┐                   │
│  │    home_component   │              │   landing_step /    │                   │
│  │                     │              │   landing_field     │                   │
│  │ version_id = NULL   │◄── PROD      │                     │                   │
│  │ version_id = 15     │◄── STAGING   │  (usa snapshots en  │                   │
│  │ version_id = 16     │◄── DRAFT     │   landing_version)  │                   │
│  └─────────────────────┘              └─────────────────────┘                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Estados de una versión (`landing_version.status`):**

| Estado | Descripción |
|--------|-------------|
| `draft` | Borrador, cambios en progreso |
| `pending_review` | Enviado para revisión/aprobación |
| `approved` | Aprobado, listo para publicar |
| `rejected` | Rechazado, requiere correcciones |
| `published` | Publicado, es la versión actual en producción |
| `archived` | Archivado, versión histórica |

**Estados de la landing (`landing.status`):**

| Estado | Descripción |
|--------|-------------|
| `draft` | Landing nueva, nunca publicada |
| `staging` | Tiene cambios en staging pendientes |
| `published` | Publicada y sin cambios pendientes |
| `archived` | Landing desactivada |

**Flujo completo:**

```
1. CREAR VERSIÓN STAGING
   ┌────────────────────────────────────────────────────────────────┐
   │ - Crear landing_version (status=DRAFT)                        │
   │ - Generar staging_token único para URL de preview             │
   │ - Copiar home_components actuales con version_id = nueva ID   │
   │ - landing.staging_version_id = nueva versión                  │
   │ - landing.status = STAGING                                    │
   └────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
2. EDITAR EN STAGING
   ┌────────────────────────────────────────────────────────────────┐
   │ - Modificar home_component WHERE version_id = staging_id      │
   │ - Modificar landing_step/field (se guardan en snapshot)       │
   │ - Preview en: /staging/{staging_token}                        │
   │ - Registrar cambios en landing_change_log                     │
   └────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
3. ENVIAR A REVISIÓN
   ┌────────────────────────────────────────────────────────────────┐
   │ - landing_version.status = PENDING_REVIEW                     │
   │ - landing_version.submitted_at = NOW()                        │
   │ - landing_version.submitted_by = user_id                      │
   │ - Guardar snapshot de form_config en form_config_snapshot     │
   │ - Guardar snapshot de config general en config_snapshot       │
   └────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
4a. APROBAR                           4b. RECHAZAR
   ┌─────────────────────┐               ┌─────────────────────┐
   │ status = APPROVED   │               │ status = REJECTED   │
   │ reviewed_at = NOW() │               │ review_notes = "..."│
   │ reviewed_by = user  │               │ → Volver a paso 2   │
   └─────────────────────┘               └─────────────────────┘
                        │
                        ▼
5. PUBLICAR
   ┌────────────────────────────────────────────────────────────────┐
   │ TRANSACCIÓN:                                                   │
   │ - Archivar versión anterior (status = ARCHIVED)               │
   │ - Publicar nueva versión (status = PUBLISHED)                 │
   │ - landing.current_version_id = staging_version_id             │
   │ - landing.staging_version_id = NULL                           │
   │ - landing.status = PUBLISHED                                  │
   │ - landing.published_at = NOW()                                │
   │                                                               │
   │ Para home_components:                                         │
   │ - DELETE WHERE landing_id = X AND version_id IS NULL          │
   │ - UPDATE SET version_id = NULL WHERE version_id = staging_id  │
   │                                                               │
   │ Registrar en landing_change_log (change_type = VERSION_PUBLISHED)
   └────────────────────────────────────────────────────────────────┘
```

**Ejemplo de datos:**

```sql
-- Landing SENATI con versión publicada y una en staging
INSERT INTO landing (id, slug, status, current_version_id, staging_version_id) VALUES
(5, 'senati', 'staging', 10, 15);

-- Versiones
INSERT INTO landing_version (id, landing_id, version_number, status, staging_token) VALUES
(10, 5, 1, 'published', NULL),           -- Versión en producción
(15, 5, 2, 'pending_review', 'abc123');  -- Versión en staging esperando aprobación

-- Home components de PRODUCCIÓN (version_id = NULL)
INSERT INTO home_component (landing_id, version_id, component_code, component_version, display_order) VALUES
(5, NULL, 'hero', 'v1', 1),
(5, NULL, 'carousel', 'v1', 2),
(5, NULL, 'featured_products', 'v2', 3);

-- Home components de STAGING versión 15 (diferentes versiones de componentes)
INSERT INTO home_component (landing_id, version_id, component_code, component_version, display_order) VALUES
(5, 15, 'hero', 'v2', 1),           -- Hero actualizado a v2
(5, 15, 'carousel', 'v1', 2),       -- Carousel sin cambios
(5, 15, 'featured_products', 'v3', 3),  -- Featured actualizado a v3
(5, 15, 'testimonials', 'v1', 4);   -- Nuevo componente agregado
```

---

## 6. Módulo: Form Builder

### 6.1 form_step

Pasos del formulario.

```sql
CREATE TABLE `form_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `url_path` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50),
  `default_order` TINYINT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_step_code` (`code`),
  UNIQUE KEY `uk_step_url` (`url_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.2 form_field_group

Agrupación visual de campos.

```sql
CREATE TABLE `form_field_group` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `step_id` BIGINT UNSIGNED NOT NULL,
  `default_order` TINYINT UNSIGNED DEFAULT 0,
  `collapsible` TINYINT(1) DEFAULT 0,
  `default_collapsed` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_field_group_code` (`code`),
  KEY `idx_group_step` (`step_id`),
  CONSTRAINT `fk_group_step` FOREIGN KEY (`step_id`) REFERENCES `form_step` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.3 form_field

Catálogo maestro de campos.

```sql
CREATE TABLE `form_field` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(80) NOT NULL COMMENT 'tipo_documento, dni, email, celular',
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,

  -- Ubicación por defecto
  `step_id` BIGINT UNSIGNED NOT NULL,
  `group_id` BIGINT UNSIGNED,

  -- Tipo y comportamiento
  `field_type` ENUM(
    'text', 'number', 'email', 'tel', 'date', 'datetime',
    'select', 'radio', 'checkbox', 'switch',
    'file', 'image', 'autocomplete', 'address',
    'textarea', 'hidden', 'display', 'divider'
  ) NOT NULL,
  `input_mode` VARCHAR(20) COMMENT 'numeric, tel, email, decimal',

  -- Valores por defecto
  `default_label` VARCHAR(200),
  `default_placeholder` VARCHAR(200),
  `default_help_text` VARCHAR(500),
  `default_error_message` VARCHAR(300),

  -- Formato
  `prefix` VARCHAR(20),
  `suffix` VARCHAR(20),
  `mask` VARCHAR(50) COMMENT 'Máscara de input: ###-###-###',

  -- Validaciones por defecto
  `default_min_length` SMALLINT UNSIGNED,
  `default_max_length` SMALLINT UNSIGNED,
  `default_min_value` DECIMAL(15,4),
  `default_max_value` DECIMAL(15,4),
  `default_pattern` VARCHAR(500),

  -- Mapeo a base de datos
  `maps_to_table` VARCHAR(50) DEFAULT 'application',
  `maps_to_column` VARCHAR(100),

  -- Fuente de datos para opciones (select, radio, etc.)
  `data_source_type` ENUM('static', 'api', 'table', 'function') COMMENT 'Origen de opciones',
  `data_source_config` VARCHAR(300) COMMENT 'API URL, nombre de tabla, etc.',

  -- Poblado desde backend (el valor viene de una API externa)
  `backend_populated` TINYINT(1) DEFAULT 0 COMMENT 'Si el campo se llena automáticamente desde backend',
  `backend_api_code` VARCHAR(50) COMMENT 'reniec, sunat, equifax, ubigeo - código de API interna',
  `backend_trigger_field` VARCHAR(80) COMMENT 'Campo que dispara la consulta: dni, ruc, ubigeo_code',
  `backend_response_path` VARCHAR(200) COMMENT 'Path en respuesta JSON: data.person.nombres',

  -- Metadata
  `is_pii` TINYINT(1) DEFAULT 0 COMMENT 'Dato personal sensible',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_field_code` (`code`),
  KEY `idx_field_step` (`step_id`),
  KEY `idx_field_group` (`group_id`),
  KEY `idx_field_type` (`field_type`),
  CONSTRAINT `fk_field_step` FOREIGN KEY (`step_id`) REFERENCES `form_step` (`id`),
  CONSTRAINT `fk_field_group` FOREIGN KEY (`group_id`) REFERENCES `form_field_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.4 landing_step

Configuración de pasos por landing.

```sql
CREATE TABLE `landing_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `step_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_skippable` TINYINT(1) DEFAULT 0,
  `custom_order` TINYINT UNSIGNED COMMENT 'NULL = usar default_order del step',
  `custom_title` VARCHAR(150),
  `custom_subtitle` VARCHAR(300),
  `custom_url_path` VARCHAR(100),
  `skip_condition` JSON COMMENT 'Condición para saltar: {"field": "is_interno", "operator": "eq", "value": true}',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_step` (`landing_id`, `step_id`),
  KEY `idx_landing_step_visible` (`landing_id`, `is_visible`),
  CONSTRAINT `fk_ls_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ls_step` FOREIGN KEY (`step_id`) REFERENCES `form_step` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.5 landing_field

Configuración de campos por landing.

```sql
CREATE TABLE `landing_field` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `field_id` BIGINT UNSIGNED NOT NULL,

  -- Override de ubicación
  `step_id` BIGINT UNSIGNED COMMENT 'Override del step',
  `group_id` BIGINT UNSIGNED COMMENT 'Override del group',

  -- Visibilidad
  `visibility` ENUM('visible', 'hidden', 'conditional') DEFAULT 'visible',
  `visibility_condition` JSON,

  -- Requerimiento
  `requirement` ENUM('required', 'optional', 'conditional', 'readonly') DEFAULT 'required',
  `requirement_condition` JSON,

  -- Display
  `display_order` SMALLINT UNSIGNED DEFAULT 0,
  `width` ENUM('full', 'half', 'third', 'quarter', 'two_thirds') DEFAULT 'full',
  `css_class` VARCHAR(100),

  -- Override de textos
  `custom_label` VARCHAR(200),
  `custom_placeholder` VARCHAR(200),
  `custom_help_text` VARCHAR(500),
  `custom_error_message` VARCHAR(300),

  -- Valores
  `default_value` VARCHAR(500),
  `default_value_source` VARCHAR(200) COMMENT 'landing.default_institution_id, api:/equifax',
  `is_autofilled` TINYINT(1) DEFAULT 0,
  `autofill_source` VARCHAR(100) COMMENT 'equifax, reniec, google_places',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_field` (`landing_id`, `field_id`),
  KEY `idx_lf_step` (`landing_id`, `step_id`, `display_order`),
  KEY `idx_lf_visibility` (`landing_id`, `visibility`),
  CONSTRAINT `fk_lf_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lf_field` FOREIGN KEY (`field_id`) REFERENCES `form_field` (`id`),
  CONSTRAINT `fk_lf_step` FOREIGN KEY (`step_id`) REFERENCES `form_step` (`id`),
  CONSTRAINT `fk_lf_group` FOREIGN KEY (`group_id`) REFERENCES `form_field_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.6 field_validation

Validaciones por campo y landing.

```sql
CREATE TABLE `field_validation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_field_id` BIGINT UNSIGNED NOT NULL,
  `validation_type` ENUM(
    'required', 'min_length', 'max_length', 'min', 'max',
    'pattern', 'email', 'phone', 'dni', 'ruc', 'ce',
    'date_min', 'date_max', 'date_age_min', 'date_age_max',
    'file_types', 'file_size_max', 'file_size_min',
    'matches_field', 'different_from_field',
    'custom_function'
  ) NOT NULL,
  `validation_value` VARCHAR(500),
  `error_message` VARCHAR(300) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `execution_order` TINYINT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_validation_field` (`landing_field_id`, `execution_order`),
  CONSTRAINT `fk_validation_lf` FOREIGN KEY (`landing_field_id`) REFERENCES `landing_field` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.7 field_option

Opciones para campos select/radio.

```sql
CREATE TABLE `field_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_field_id` BIGINT UNSIGNED NOT NULL,
  `value` VARCHAR(200) NOT NULL,
  `label` VARCHAR(300) NOT NULL,
  `description` VARCHAR(500),
  `icon` VARCHAR(50),
  `is_default` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` SMALLINT UNSIGNED DEFAULT 0,
  `visibility_condition` JSON,
  `triggers_fields` JSON COMMENT 'Campos a mostrar/ocultar al seleccionar',
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_option_field` (`landing_field_id`, `display_order`),
  CONSTRAINT `fk_option_lf` FOREIGN KEY (`landing_field_id`) REFERENCES `landing_field` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6.8 field_dependency

Dependencias entre campos (mostrar/ocultar basado en otro campo).

```sql
CREATE TABLE `field_dependency` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_field_id` BIGINT UNSIGNED NOT NULL COMMENT 'Campo afectado',
  `depends_on_field_id` BIGINT UNSIGNED NOT NULL COMMENT 'Campo del que depende',
  `dependency_type` ENUM('show_if', 'hide_if', 'require_if', 'disable_if', 'enable_if') NOT NULL,
  `operator` ENUM('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'empty', 'not_empty') NOT NULL,
  `comparison_value` VARCHAR(500) COMMENT 'Valor a comparar (puede ser JSON array para "in")',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dependency_field` (`landing_field_id`),
  KEY `idx_dependency_depends` (`depends_on_field_id`),
  CONSTRAINT `fk_dependency_field` FOREIGN KEY (`landing_field_id`) REFERENCES `landing_field` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dependency_depends` FOREIGN KEY (`depends_on_field_id`) REFERENCES `landing_field` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. Módulo: Catalog & Filters

### 7.1 filter_definition

Definición de filtros disponibles.

```sql
CREATE TABLE `filter_definition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),
  `filter_type` ENUM('single_select', 'multi_select', 'range', 'checkbox', 'search') NOT NULL,
  `source_table` VARCHAR(50) DEFAULT 'product_spec',
  `source_column` VARCHAR(100) NOT NULL,
  `value_type` ENUM('string', 'number', 'boolean') DEFAULT 'string',
  `icon` VARCHAR(50),
  `display_order` TINYINT UNSIGNED DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filter_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.2 filter_value

Valores de filtros (calculados dinámicamente).

```sql
CREATE TABLE `filter_value` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filter_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED COMMENT 'NULL = global',
  `value` VARCHAR(200) NOT NULL,
  `display_label` VARCHAR(200) NOT NULL,
  `product_count` INT UNSIGNED DEFAULT 0,
  `range_min` DECIMAL(15,2),
  `range_max` DECIMAL(15,2),
  `display_order` SMALLINT UNSIGNED DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `calculated_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filter_value` (`filter_id`, `landing_id`, `value`),
  KEY `idx_fv_landing` (`landing_id`),
  CONSTRAINT `fk_fv_filter` FOREIGN KEY (`filter_id`) REFERENCES `filter_definition` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fv_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.3 landing_filter

Filtros habilitados por landing.

```sql
CREATE TABLE `landing_filter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `filter_id` BIGINT UNSIGNED NOT NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `is_expanded` TINYINT(1) DEFAULT 0 COMMENT 'Expandido por defecto',
  `display_order` TINYINT UNSIGNED,
  `custom_label` VARCHAR(100),
  `max_visible_options` TINYINT UNSIGNED DEFAULT 5 COMMENT 'Opciones antes de "ver más"',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_filter` (`landing_id`, `filter_id`),
  CONSTRAINT `fk_lfilter_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lfilter_filter` FOREIGN KEY (`filter_id`) REFERENCES `filter_definition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.4 sort_option

Opciones de ordenamiento.

```sql
CREATE TABLE `sort_option` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `sort_column` VARCHAR(100) NOT NULL,
  `sort_direction` ENUM('asc', 'desc') DEFAULT 'asc',
  `is_default` TINYINT(1) DEFAULT 0,
  `display_order` TINYINT UNSIGNED DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sort_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8. Módulo: Event Tracking

### 8.1 session

Sesión de usuario.

```sql
CREATE TABLE `session` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `landing_id` BIGINT UNSIGNED,
  `application_id` BIGINT UNSIGNED COMMENT 'Se vincula al crear solicitud',

  -- Vinculación de sesiones (cross-session tracking)
  `visitor_id` VARCHAR(50) COMMENT 'Cookie persistente UUID - agrupa sesiones del mismo navegador',
  `person_id` BIGINT UNSIGNED NULL COMMENT 'Se llena cuando el usuario se identifica (ingresa DNI)',
  `linked_at` TIMESTAMP NULL COMMENT 'Cuándo se vinculó esta sesión a la persona',

  -- Device
  `fingerprint` VARCHAR(64),
  `ip_address` VARCHAR(45),
  `country` CHAR(2),
  `region` VARCHAR(100),
  `city` VARCHAR(100),
  `user_agent` TEXT,
  `device_type` ENUM('desktop', 'tablet', 'mobile') NOT NULL,
  `os` VARCHAR(50),
  `os_version` VARCHAR(20),
  `browser` VARCHAR(50),
  `browser_version` VARCHAR(20),
  `screen_width` SMALLINT UNSIGNED,
  `screen_height` SMALLINT UNSIGNED,
  `viewport_width` SMALLINT UNSIGNED,
  `viewport_height` SMALLINT UNSIGNED,
  `pixel_ratio` DECIMAL(3,2),
  `has_touch` TINYINT(1) DEFAULT 0,
  `language` VARCHAR(10),
  `timezone` VARCHAR(50),

  -- Attribution & UTM
  `utm_source` VARCHAR(100) COMMENT 'google, facebook, email, etc.',
  `utm_medium` VARCHAR(100) COMMENT 'cpc, cpm, organic, referral, etc.',
  `utm_campaign` VARCHAR(200) COMMENT 'Nombre de campaña',
  `utm_term` VARCHAR(200) COMMENT 'Término de búsqueda (keyword)',
  `utm_content` VARCHAR(200) COMMENT 'Variante del anuncio',
  `referrer` VARCHAR(2000),
  `referrer_domain` VARCHAR(255),
  `entry_url` VARCHAR(2000),

  -- Click IDs de plataformas
  `gclid` VARCHAR(100) COMMENT 'Google Click ID',
  `fbclid` VARCHAR(100) COMMENT 'Facebook Click ID',
  `ttclid` VARCHAR(100) COMMENT 'TikTok Click ID',
  `msclkid` VARCHAR(100) COMMENT 'Microsoft/Bing Click ID',

  -- Clasificación de tráfico
  `traffic_source` ENUM(
    'organic_search',     -- Google, Bing sin ads
    'paid_search',        -- Google Ads, Bing Ads
    'organic_social',     -- Posts orgánicos en redes
    'paid_social',        -- Facebook Ads, TikTok Ads, etc.
    'display',            -- Banners, GDN
    'retargeting',        -- Remarketing
    'email',              -- Email marketing
    'sms',                -- Campañas SMS
    'push_notification',  -- Push notifications
    'affiliate',          -- Afiliados
    'referral',           -- Referidos
    'direct',             -- Acceso directo
    'preapproved',        -- Redirección de preaprobados
    'qr_code',            -- Códigos QR
    'offline',            -- Eventos offline
    'other'
  ) DEFAULT 'direct',
  `traffic_source_detail` VARCHAR(200) COMMENT 'Detalle adicional: nombre de afiliado, etc.',
  `attribution_model` ENUM('first_touch', 'last_touch', 'linear') DEFAULT 'last_touch',

  -- Metrics
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL,
  `last_activity_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration_seconds` INT UNSIGNED,
  `page_views` SMALLINT UNSIGNED DEFAULT 0,
  `total_events` INT UNSIGNED DEFAULT 0,
  `max_step_reached` VARCHAR(50),
  `status` ENUM('active', 'idle', 'bounced', 'abandoned', 'converted') DEFAULT 'active',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_uuid` (`uuid`),
  KEY `idx_session_landing` (`landing_id`),
  KEY `idx_session_application` (`application_id`),
  KEY `idx_session_started` (`started_at`),
  KEY `idx_session_status` (`status`),
  KEY `idx_session_utm` (`utm_source`, `utm_medium`, `utm_campaign`),
  KEY `idx_session_traffic_source` (`traffic_source`),
  KEY `idx_session_gclid` (`gclid`),
  KEY `idx_session_visitor` (`visitor_id`),
  KEY `idx_session_person` (`person_id`),

  CONSTRAINT `fk_session_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_session_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_session_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.2 page_view

Vistas de página.

```sql
CREATE TABLE `page_view` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(2000) NOT NULL,
  `path` VARCHAR(500) NOT NULL,
  `title` VARCHAR(500),
  `step_code` VARCHAR(50),
  `referrer_path` VARCHAR(500),
  `entered_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `exited_at` TIMESTAMP(3) NULL,
  `duration_ms` INT UNSIGNED,
  `max_scroll_percent` TINYINT UNSIGNED DEFAULT 0,
  `is_bounce` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_pv_session` (`session_id`),
  KEY `idx_pv_path` (`path`),
  KEY `idx_pv_step` (`step_code`),
  KEY `idx_pv_entered` (`entered_at`),
  CONSTRAINT `fk_pv_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.3 event_scroll

Eventos de scroll.

```sql
CREATE TABLE `event_scroll` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `depth_percent` TINYINT UNSIGNED NOT NULL,
  `depth_pixels` SMALLINT UNSIGNED NOT NULL,
  `direction` ENUM('down', 'up') NOT NULL,
  `viewport_height` SMALLINT UNSIGNED,
  `document_height` MEDIUMINT UNSIGNED,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_scroll_session` (`session_id`),
  KEY `idx_scroll_page` (`page_view_id`),
  KEY `idx_scroll_depth` (`depth_percent`),
  CONSTRAINT `fk_scroll_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scroll_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.4 event_click

Eventos de click.

```sql
CREATE TABLE `event_click` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `element_type` VARCHAR(30) NOT NULL,
  `element_id` VARCHAR(100),
  `element_class` VARCHAR(200),
  `element_text` VARCHAR(300),
  `element_href` VARCHAR(1000),
  `element_name` VARCHAR(100),
  `data_attrs` JSON,
  `x` SMALLINT UNSIGNED,
  `y` SMALLINT UNSIGNED,
  `is_right_click` TINYINT(1) DEFAULT 0,
  `is_double_click` TINYINT(1) DEFAULT 0,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_click_session` (`session_id`),
  KEY `idx_click_page` (`page_view_id`),
  KEY `idx_click_element` (`element_type`, `element_id`),
  KEY `idx_click_timestamp` (`timestamp`),
  CONSTRAINT `fk_click_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_click_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.5 event_hover

Eventos de hover.

```sql
CREATE TABLE `event_hover` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `element_type` VARCHAR(30) NOT NULL,
  `element_id` VARCHAR(100),
  `element_class` VARCHAR(200),
  `product_id` BIGINT UNSIGNED,
  `started_at` TIMESTAMP(3) NOT NULL,
  `ended_at` TIMESTAMP(3),
  `duration_ms` INT UNSIGNED,
  `entered_from` ENUM('top', 'bottom', 'left', 'right'),
  `exited_to` ENUM('top', 'bottom', 'left', 'right', 'click'),
  PRIMARY KEY (`id`),
  KEY `idx_hover_session` (`session_id`),
  KEY `idx_hover_page` (`page_view_id`),
  KEY `idx_hover_product` (`product_id`),
  KEY `idx_hover_duration` (`duration_ms`),
  CONSTRAINT `fk_hover_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hover_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hover_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.6 event_input

Interacciones con inputs.

```sql
CREATE TABLE `event_input` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `field_code` VARCHAR(80) NOT NULL,
  `field_type` VARCHAR(30),
  `action` ENUM('focus', 'blur', 'change', 'input', 'paste', 'autofill', 'clear') NOT NULL,
  `focus_at` TIMESTAMP(3),
  `blur_at` TIMESTAMP(3),
  `time_focused_ms` INT UNSIGNED,
  `keystrokes` SMALLINT UNSIGNED DEFAULT 0,
  `pastes` TINYINT UNSIGNED DEFAULT 0,
  `value_length` SMALLINT UNSIGNED,
  `was_autofilled` TINYINT(1) DEFAULT 0,
  `had_error` TINYINT(1) DEFAULT 0,
  `error_message` VARCHAR(300),
  `corrections` TINYINT UNSIGNED DEFAULT 0,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_input_session` (`session_id`),
  KEY `idx_input_page` (`page_view_id`),
  KEY `idx_input_field` (`field_code`),
  KEY `idx_input_time` (`time_focused_ms`),
  CONSTRAINT `fk_input_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_input_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.7 event_filter

Filtros aplicados.

```sql
CREATE TABLE `event_filter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `filter_code` VARCHAR(50) NOT NULL,
  `action` ENUM('apply', 'remove', 'clear', 'clear_all') NOT NULL,
  `value` VARCHAR(200),
  `values` JSON,
  `range_min` DECIMAL(15,2),
  `range_max` DECIMAL(15,2),
  `results_before` SMALLINT UNSIGNED,
  `results_after` SMALLINT UNSIGNED,
  `filters_snapshot` JSON,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_filter_session` (`session_id`),
  KEY `idx_filter_page` (`page_view_id`),
  KEY `idx_filter_code` (`filter_code`),
  KEY `idx_filter_action` (`action`),
  CONSTRAINT `fk_filter_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_filter_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.8 event_product

Interacciones con productos.

```sql
CREATE TABLE `event_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `action` ENUM(
    'impression', 'view_card', 'hover', 'click_card',
    'open_detail', 'close_detail',
    'open_schedule', 'close_schedule',
    'change_term', 'select', 'deselect',
    'add_accessory', 'remove_accessory',
    'add_insurance', 'remove_insurance'
  ) NOT NULL,
  `term_months` TINYINT UNSIGNED,
  `monthly_payment` DECIMAL(10,2),
  `position` TINYINT UNSIGNED,
  `time_visible_ms` INT UNSIGNED,
  `metadata` JSON,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_session` (`session_id`),
  KEY `idx_product_page` (`page_view_id`),
  KEY `idx_product_product` (`product_id`),
  KEY `idx_product_action` (`action`),
  KEY `idx_product_timestamp` (`timestamp`),
  CONSTRAINT `fk_product_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.9 event_modal

Interacciones con modales.

```sql
CREATE TABLE `event_modal` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `modal_type` VARCHAR(50) NOT NULL,
  `modal_id` VARCHAR(100),
  `promotion_id` BIGINT UNSIGNED,
  `action` ENUM('open', 'close', 'cta_click', 'dismiss', 'scroll') NOT NULL,
  `trigger` VARCHAR(100),
  `time_open_ms` INT UNSIGNED,
  `scroll_percent` TINYINT UNSIGNED,
  `cta_clicked` VARCHAR(100),
  `dismiss_reason` VARCHAR(50),
  `opened_at` TIMESTAMP(3),
  `closed_at` TIMESTAMP(3),
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_modal_session` (`session_id`),
  KEY `idx_modal_page` (`page_view_id`),
  KEY `idx_modal_type` (`modal_type`),
  KEY `idx_modal_action` (`action`),
  CONSTRAINT `fk_modal_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_modal_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_modal_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `landing_promotion` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.10 event_form

Progreso en formulario.

```sql
CREATE TABLE `event_form` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `step_code` VARCHAR(50) NOT NULL,
  `step_order` TINYINT UNSIGNED NOT NULL,
  `action` ENUM('enter', 'exit', 'submit_attempt', 'submit_success', 'submit_error', 'skip', 'validation_error') NOT NULL,
  `entered_at` TIMESTAMP(3),
  `exited_at` TIMESTAMP(3),
  `duration_ms` INT UNSIGNED,
  `fields_filled` TINYINT UNSIGNED,
  `fields_total` TINYINT UNSIGNED,
  `fields_with_errors` TINYINT UNSIGNED,
  `validation_errors` JSON,
  `exit_reason` ENUM('next', 'previous', 'abandon', 'error', 'redirect', 'skip'),
  `completion_percent` TINYINT UNSIGNED,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_form_session` (`session_id`),
  KEY `idx_form_step` (`step_code`),
  KEY `idx_form_action` (`action`),
  CONSTRAINT `fk_form_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.11 event_navigation

Navegación (back, forward).

```sql
CREATE TABLE `event_navigation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED NOT NULL,
  `nav_type` ENUM('back', 'forward', 'reload', 'link', 'form', 'popstate', 'pushstate') NOT NULL,
  `from_url` VARCHAR(1000),
  `to_url` VARCHAR(1000),
  `from_step` VARCHAR(50),
  `to_step` VARCHAR(50),
  `was_prevented` TINYINT(1) DEFAULT 0,
  `user_confirmed` TINYINT(1),
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_nav_session` (`session_id`),
  KEY `idx_nav_page` (`page_view_id`),
  KEY `idx_nav_type` (`nav_type`),
  CONSTRAINT `fk_nav_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_nav_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.12 event_error

Errores.

```sql
CREATE TABLE `event_error` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED,
  `error_type` ENUM('validation', 'api', 'javascript', 'network', 'timeout', 'permission', 'unknown') NOT NULL,
  `error_code` VARCHAR(50),
  `error_message` VARCHAR(1000),
  `error_stack` TEXT,
  `field_code` VARCHAR(80),
  `api_endpoint` VARCHAR(200),
  `api_method` VARCHAR(10),
  `api_status` SMALLINT,
  `context` JSON,
  `is_fatal` TINYINT(1) DEFAULT 0,
  `shown_to_user` TINYINT(1) DEFAULT 1,
  `user_action` VARCHAR(50),
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_error_session` (`session_id`),
  KEY `idx_error_page` (`page_view_id`),
  KEY `idx_error_type` (`error_type`),
  KEY `idx_error_field` (`field_code`),
  KEY `idx_error_timestamp` (`timestamp`),
  CONSTRAINT `fk_error_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_error_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8.13 event_custom

Eventos personalizados.

```sql
CREATE TABLE `event_custom` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `page_view_id` BIGINT UNSIGNED,
  `event_name` VARCHAR(100) NOT NULL,
  `event_category` VARCHAR(50),
  `event_label` VARCHAR(200),
  `event_value` DECIMAL(15,4),
  `properties` JSON,
  `timestamp` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_custom_session` (`session_id`),
  KEY `idx_custom_name` (`event_name`),
  KEY `idx_custom_category` (`event_category`),
  KEY `idx_custom_timestamp` (`timestamp`),
  CONSTRAINT `fk_custom_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_custom_page` FOREIGN KEY (`page_view_id`) REFERENCES `page_view` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.5 Flujo de Pricing: Producto + Accesorios + Seguro

### Cálculo de la Cuota Final

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CÁLCULO DE CUOTA MENSUAL FINAL                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PRODUCTO BASE (landing_product)                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ Laptop Lenovo LOQ en SENATI (18 cuotas)                                  │   │
│  │ • monthly_payment: S/280.00                                              │   │
│  │ • tea: 12%                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                      │
│                                           ▼                                      │
│  ACCESORIOS SELECCIONADOS (landing_accessory)                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ Mouse Logitech: monthly_price_override = S/15.00                         │   │
│  │ Mochila HP: monthly_price_override = S/20.00                             │   │
│  │                                        ─────────                          │   │
│  │ Subtotal accesorios:                   S/35.00                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                      │
│                                           ▼                                      │
│  SEGURO SELECCIONADO (landing_insurance)                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ Seguro Protección Total 12 meses                                         │   │
│  │ monthly_price_override = S/25.00                                         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                      │
│                                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ CUOTA MENSUAL FINAL = S/280 + S/35 + S/25 = S/340.00                     │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Modelo de Datos para Accesorios y Seguros

**1. Producto base tiene un precio mensual por landing:**
```sql
-- landing_product define cuotas base del producto
SELECT monthly_payment FROM landing_product
WHERE landing_id = 5 AND product_id = 10 AND term_months = 18;
-- Resultado: 280.00
```

**2. Accesorios tienen precio adicional por landing:**
```sql
-- Accesorios disponibles en esta landing con su precio mensual
SELECT a.name, la.monthly_price_override
FROM landing_accessory la
JOIN accessory a ON a.id = la.accessory_id
WHERE la.landing_id = 5 AND la.is_visible = 1;
-- Resultado: Mouse S/15, Mochila S/20, Audífonos S/18
```

**3. Seguros tienen precio mensual fijo o por landing:**
```sql
-- Seguros disponibles con precio override por landing
SELECT i.name, COALESCE(li.monthly_price_override, i.monthly_price) AS price
FROM landing_insurance li
JOIN insurance i ON i.id = li.insurance_id
WHERE li.landing_id = 5 AND li.is_visible = 1;
-- Resultado: Seguro Básico S/15, Seguro Total S/25
```

**4. Al crear la solicitud, se guardan los items seleccionados:**
```sql
-- application_item guarda todos los items de la solicitud
INSERT INTO application_item (application_id, item_type, item_id, monthly_price, quantity) VALUES
(1001, 'product', 10, 280.00, 1),      -- Laptop
(1001, 'accessory', 5, 15.00, 1),       -- Mouse
(1001, 'accessory', 8, 20.00, 1),       -- Mochila
(1001, 'insurance', 2, 25.00, 1);       -- Seguro
```

### Flujo Completo del Usuario

```
1. Usuario selecciona producto en catálogo
   └─► landing_product.monthly_payment = S/280

2. Usuario agrega accesorios opcionales
   └─► landing_accessory.monthly_price_override = S/15 + S/20

3. Usuario selecciona seguro (puede ser obligatorio)
   └─► landing_insurance.monthly_price_override = S/25

4. Sistema calcula cuota final en tiempo real
   └─► Total: S/340/mes x 18 cuotas

5. Usuario completa formulario y envía solicitud
   └─► Se crea application con application_item por cada selección

6. Si es aprobado, se crea loan con:
   └─► loan.monthly_payment = S/340 (ya incluye todo)
   └─► loan.total_amount = precio base + accesorios + seguro
```

---

## 8.6 Modelo de Combos

### ¿Cuándo usar Combos vs Selección Individual?

| Escenario | Recomendación |
|-----------|---------------|
| Usuario puede elegir sus accesorios | Selección individual (landing_accessory) |
| Paquete fijo con descuento especial | Combo pre-definido |
| Promoción "Laptop + Mouse + Mochila -15%" | Combo con descuento |
| Cross-sell durante checkout | Selección individual |

### Estructura del Combo

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MODELO DE COMBOS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  combo (definición del paquete)                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ id: 1                                                                     │   │
│  │ code: "BACK-TO-SCHOOL-2024"                                              │   │
│  │ name: "Kit Universitario Completo"                                        │   │
│  │ discount_type: percentage                                                 │   │
│  │ discount_value: 15.00 (15% de descuento)                                 │   │
│  │ valid_until: 2024-03-31                                                   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                      │
│                                           ▼                                      │
│  combo_item (productos incluidos)                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ combo_id │ product_id │ item_type  │ is_required │ quantity              │   │
│  │ 1        │ 10         │ main       │ 1           │ 1      (Laptop LOQ)   │   │
│  │ 1        │ 5          │ accessory  │ 0           │ 1      (Mouse)        │   │
│  │ 1        │ 8          │ accessory  │ 0           │ 1      (Mochila)      │   │
│  │ 1        │ 12         │ accessory  │ 0           │ 1      (Audífonos)    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Cálculo:                                                                        │
│  • Laptop: S/280/mes                                                            │
│  • Mouse: S/15/mes                                                              │
│  • Mochila: S/20/mes                                                            │
│  • Audífonos: S/18/mes                                                          │
│  • Subtotal: S/333/mes                                                          │
│  • Descuento 15%: -S/50/mes                                                     │
│  • TOTAL COMBO: S/283/mes (ahorro vs individual)                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Aplicación de Combos por Landing

```sql
-- Combos activos en una landing específica
SELECT c.*, lc.priority
FROM combo c
JOIN landing_combo lc ON lc.combo_id = c.id
WHERE lc.landing_id = 5
  AND c.is_active = 1
  AND NOW() BETWEEN c.valid_from AND c.valid_until;
```

---

## 8.7 Selección de Institución (Flujo Normal)

Cuando el usuario NO llega por un convenio específico, debe buscar su institución.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE SELECCIÓN DE INSTITUCIÓN                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Usuario llega a baldecash.pe (landing general)                                 │
│         │                                                                        │
│         ▼                                                                        │
│  ┌─────────────────────────────────────────┐                                    │
│  │ Campo: "¿Dónde estudias/trabajas?"      │                                    │
│  │ Tipo: autocomplete                       │                                    │
│  │ API: instituciones                       │                                    │
│  └─────────────────────────────────────────┘                                    │
│         │                                                                        │
│         │ Usuario escribe: "SENA"                                               │
│         ▼                                                                        │
│  ┌─────────────────────────────────────────┐                                    │
│  │ Resultados de API:                       │                                    │
│  │ • SENATI                                 │                                    │
│  │ • SENCICO                                │                                    │
│  └─────────────────────────────────────────┘                                    │
│         │                                                                        │
│         │ Selecciona: SENATI                                                    │
│         ▼                                                                        │
│  ┌─────────────────────────────────────────┐                                    │
│  │ Sistema verifica:                        │                                    │
│  │ ¿SENATI tiene convenio activo?           │                                    │
│  │                                          │                                    │
│  │ SELECT a.* FROM agreement a              │                                    │
│  │ JOIN institution i ON i.id = a.inst_id   │                                    │
│  │ WHERE i.code = 'SENATI'                  │                                    │
│  │   AND a.is_active = 1                    │                                    │
│  │   AND NOW() BETWEEN valid_from/until     │                                    │
│  └─────────────────────────────────────────┘                                    │
│         │                                                                        │
│         ├─► SÍ tiene convenio:                                                  │
│         │     • Aplicar tasas preferenciales del agreement                      │
│         │     • Mostrar productos del convenio                                   │
│         │     • Cargar landing específica si existe                             │
│         │                                                                        │
│         └─► NO tiene convenio:                                                  │
│               • Aplicar tasas estándar                                          │
│               • Mostrar todos los productos públicos                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Tablas Involucradas

```sql
-- 1. Buscar institución por nombre (autocomplete)
SELECT id, name, short_name, type, city
FROM institution
WHERE (name LIKE '%SENA%' OR short_name LIKE '%SENA%')
  AND is_active = 1
ORDER BY name
LIMIT 10;

-- 2. Obtener sedes de la institución seleccionada
SELECT id, name, address, district, city
FROM institution_campus
WHERE institution_id = 5 AND is_active = 1;

-- 3. Verificar si tiene convenio activo
SELECT a.id, a.agreement_type, a.tea_preferencial, a.max_loan_amount
FROM agreement a
WHERE a.institution_id = 5
  AND a.is_active = 1
  AND NOW() BETWEEN a.valid_from AND a.valid_until;

-- 4. Si tiene convenio, obtener landing específica
SELECT l.id, l.slug, l.name
FROM landing l
WHERE l.agreement_id = (SELECT id FROM agreement WHERE institution_id = 5 AND is_active = 1);
```

---

## 9. Módulo: Person & Application (Rediseñado)

Sistema optimizado para evitar duplicidad de personas y mantener histórico de datos.

### 9.1 Conceptos Clave

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE PERSONA Y SOLICITUD                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Usuario llega → Buscar por documento/email/celular                        │
│        │                                                                     │
│        ├─→ SI EXISTE:                                                        │
│        │      • Mostrar datos previos                                       │
│        │      • Opción: "Usar estos datos" o "Actualizar"                   │
│        │      • Si actualiza → Nueva versión de datos                       │
│        │                                                                     │
│        └─→ NO EXISTE:                                                        │
│               • Crear person nueva                                          │
│               • Capturar datos como versión 1                               │
│                                                                              │
│   Al completar solicitud:                                                    │
│        • Application referencia a person.id                                 │
│        • Application guarda IDs de las versiones de datos usadas            │
│        • Si es misma persona, incrementa application_count                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 person

Tabla maestra de personas. Una persona única identificada por documento.

```sql
CREATE TABLE `person` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- Identificación principal (inmutable)
  `document_type` ENUM('dni', 'ce', 'ptp', 'pasaporte') NOT NULL DEFAULT 'dni',
  `document_number` VARCHAR(20) NOT NULL,

  -- Datos básicos (del documento, validados por RENIEC)
  `first_name` VARCHAR(100) NOT NULL,
  `paternal_surname` VARCHAR(100) NOT NULL,
  `maternal_surname` VARCHAR(100),
  `birth_date` DATE,
  `gender` ENUM('M', 'F'),
  `nationality` CHAR(2) DEFAULT 'PE',

  -- Identificadores alternativos para matching
  `primary_email` VARCHAR(254) COMMENT 'Email principal actual',
  `primary_phone` VARCHAR(20) COMMENT 'Celular principal actual',

  -- Fingerprint para detectar misma persona en diferentes sesiones
  `fingerprint_hash` VARCHAR(64) COMMENT 'Browser fingerprint más reciente',

  -- Validaciones externas (Equifax como proveedor principal)
  `reniec_validated` TINYINT(1) DEFAULT 0,
  `reniec_validated_at` TIMESTAMP NULL,
  `equifax_score` SMALLINT UNSIGNED COMMENT 'Score crediticio de Equifax',
  `equifax_consulted_at` TIMESTAMP NULL COMMENT 'Última consulta a Equifax',
  `equifax_report_id` VARCHAR(100) COMMENT 'ID del reporte en Equifax',
  `risk_category` ENUM('A', 'B', 'C', 'D', 'E') COMMENT 'Categoría de riesgo basada en Equifax',

  -- Métricas de la persona
  `total_applications` SMALLINT UNSIGNED DEFAULT 0,
  `approved_applications` SMALLINT UNSIGNED DEFAULT 0,
  `active_credits` TINYINT UNSIGNED DEFAULT 0,
  `total_credit_amount` DECIMAL(12,2) DEFAULT 0,
  `last_application_at` TIMESTAMP NULL,
  `first_application_at` TIMESTAMP NULL,

  -- Estado
  `status` ENUM('active', 'blocked', 'blacklisted') DEFAULT 'active',
  `blocked_reason` VARCHAR(300),
  `blocked_at` TIMESTAMP NULL,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_person_document` (`document_type`, `document_number`),
  KEY `idx_person_email` (`primary_email`),
  KEY `idx_person_phone` (`primary_phone`),
  KEY `idx_person_fingerprint` (`fingerprint_hash`),
  KEY `idx_person_status` (`status`),
  KEY `idx_person_equifax` (`equifax_score`, `risk_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.3 person_contact_history

Histórico de datos de contacto. Cada vez que actualiza email/teléfono, nueva fila.

```sql
CREATE TABLE `person_contact_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,

  `email` VARCHAR(254) NOT NULL,
  `phone_primary` VARCHAR(20) NOT NULL,
  `phone_secondary` VARCHAR(20),
  `phone_landline` VARCHAR(20),
  `is_whatsapp_primary` TINYINT(1) DEFAULT 1,
  `is_whatsapp_secondary` TINYINT(1) DEFAULT 0,

  -- Verificaciones
  `email_verified` TINYINT(1) DEFAULT 0,
  `email_verified_at` TIMESTAMP NULL,
  `phone_verified` TINYINT(1) DEFAULT 0,
  `phone_verified_at` TIMESTAMP NULL,

  -- Metadata de captura
  `captured_from_session_id` BIGINT UNSIGNED,
  `captured_from_application_id` BIGINT UNSIGNED,
  `capture_source` ENUM('form', 'api', 'import', 'manual') DEFAULT 'form',

  `is_current` TINYINT(1) DEFAULT 1 COMMENT 'Solo una versión es current',
  `valid_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP NULL COMMENT 'NULL si es current',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_contact_version` (`person_id`, `version`),
  KEY `idx_contact_person_current` (`person_id`, `is_current`),
  KEY `idx_contact_email` (`email`),
  KEY `idx_contact_phone` (`phone_primary`),
  CONSTRAINT `fk_contact_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.4 person_address_history

Histórico de direcciones.

```sql
CREATE TABLE `person_address_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,

  `address_type` ENUM('home', 'work', 'study', 'other') DEFAULT 'home',
  `full_address` VARCHAR(500) NOT NULL,
  `reference` VARCHAR(300),
  `department` VARCHAR(100) NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `ubigeo` CHAR(6),
  `postal_code` VARCHAR(10),
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),

  `housing_type` ENUM('owned', 'rented', 'family', 'other'),
  `housing_time_months` SMALLINT UNSIGNED COMMENT 'Tiempo en la vivienda',
  `rent_amount` DECIMAL(10,2),

  -- Metadata
  `captured_from_session_id` BIGINT UNSIGNED,
  `capture_source` ENUM('form', 'api', 'google_places', 'manual') DEFAULT 'form',

  `is_current` TINYINT(1) DEFAULT 1,
  `valid_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_address_version` (`person_id`, `address_type`, `version`),
  KEY `idx_address_person_current` (`person_id`, `is_current`),
  KEY `idx_address_district` (`district`),
  CONSTRAINT `fk_address_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.5 person_academic_history

Histórico de datos académicos. Permite cambios de carrera, ciclo, institución.

```sql
CREATE TABLE `person_academic_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,

  `institution_id` BIGINT UNSIGNED NOT NULL,
  `campus_id` BIGINT UNSIGNED,
  `career_id` BIGINT UNSIGNED,
  `career_name_other` VARCHAR(200) COMMENT 'Si carrera no está en catálogo',

  `student_code` VARCHAR(50),
  `current_cycle` TINYINT UNSIGNED,
  `total_cycles` TINYINT UNSIGNED,
  `modality` ENUM('presencial', 'semipresencial', 'virtual') DEFAULT 'presencial',
  `shift` ENUM('manana', 'tarde', 'noche', 'flexible'),

  `enrollment_status` ENUM('enrolled', 'egresado', 'reserva', 'retired') DEFAULT 'enrolled',
  `enrollment_validated` TINYINT(1) DEFAULT 0,
  `enrollment_validated_at` TIMESTAMP NULL,

  `scholarship_type` ENUM('none', 'full', 'partial', 'beca18', 'pronabec', 'other') DEFAULT 'none',
  `scholarship_percentage` TINYINT UNSIGNED,
  `monthly_tuition` DECIMAL(10,2),
  `tuition_payer` ENUM('self', 'parents', 'employer', 'scholarship', 'other') DEFAULT 'self',

  -- Metadata
  `captured_from_session_id` BIGINT UNSIGNED,
  `capture_source` ENUM('form', 'api', 'institution_api', 'manual') DEFAULT 'form',

  `is_current` TINYINT(1) DEFAULT 1,
  `valid_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_academic_version` (`person_id`, `institution_id`, `version`),
  KEY `idx_academic_person_current` (`person_id`, `is_current`),
  KEY `idx_academic_institution` (`institution_id`),
  KEY `idx_academic_student_code` (`student_code`),
  CONSTRAINT `fk_academic_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_academic_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_academic_campus` FOREIGN KEY (`campus_id`) REFERENCES `institution_campus` (`id`),
  CONSTRAINT `fk_academic_career` FOREIGN KEY (`career_id`) REFERENCES `career` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.6 person_employment_history

Histórico de datos laborales/ingresos.

```sql
CREATE TABLE `person_employment_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,

  `employment_status` ENUM(
    'employed_formal',     -- Dependiente formal (planilla)
    'employed_informal',   -- Dependiente informal
    'self_employed',       -- Independiente
    'business_owner',      -- Dueño de negocio
    'student_only',        -- Solo estudiante
    'unemployed',          -- Desempleado
    'retired',             -- Jubilado
    'other'
  ) NOT NULL,

  -- Si es empleado
  `employer_name` VARCHAR(200),
  `employer_ruc` VARCHAR(11),
  `job_title` VARCHAR(150),
  `contract_type` ENUM('indefinido', 'plazo_fijo', 'locacion', 'practicas', 'otros'),
  `start_date` DATE,
  `seniority_months` SMALLINT UNSIGNED,

  -- Ingresos
  `gross_income` DECIMAL(10,2) COMMENT 'Ingreso bruto mensual',
  `net_income` DECIMAL(10,2) COMMENT 'Ingreso neto mensual',
  `other_income` DECIMAL(10,2) DEFAULT 0,
  `other_income_source` VARCHAR(200),
  `income_type` ENUM('4ta', '5ta', 'renta', 'sin_sustento'),
  `income_frequency` ENUM('weekly', 'biweekly', 'monthly') DEFAULT 'monthly',
  `payment_method` ENUM('cash', 'bank_transfer', 'yape_plin', 'check', 'mixed') DEFAULT 'bank_transfer',

  -- Si es independiente/negocio
  `business_name` VARCHAR(200),
  `business_ruc` VARCHAR(11),
  `business_type` VARCHAR(150),
  `business_monthly_revenue` DECIMAL(12,2),
  `business_seniority_months` SMALLINT UNSIGNED,

  -- Si depende de familia
  `dependent_of` ENUM('parents', 'spouse', 'sibling', 'other'),
  `supporter_name` VARCHAR(200),
  `supporter_phone` VARCHAR(20),
  `supporter_relationship` VARCHAR(50),
  `monthly_support_amount` DECIMAL(10,2),

  -- Verificación
  `income_verified` TINYINT(1) DEFAULT 0,
  `income_verified_at` TIMESTAMP NULL,
  `verification_method` VARCHAR(100),

  -- Metadata
  `captured_from_session_id` BIGINT UNSIGNED,
  `capture_source` ENUM('form', 'api', 'sunat_api', 'manual') DEFAULT 'form',

  `is_current` TINYINT(1) DEFAULT 1,
  `valid_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employment_version` (`person_id`, `version`),
  KEY `idx_employment_person_current` (`person_id`, `is_current`),
  KEY `idx_employment_status` (`employment_status`),
  CONSTRAINT `fk_employment_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.7 person_financial_history

Histórico de datos financieros.

```sql
CREATE TABLE `person_financial_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,

  -- Banco principal
  `primary_bank` VARCHAR(50),
  `account_type` ENUM('savings', 'checking', 'cts', 'none') DEFAULT 'savings',
  `account_number_masked` VARCHAR(20) COMMENT 'Solo últimos 4 dígitos',
  `has_debit_card` TINYINT(1),
  `has_credit_card` TINYINT(1),
  `credit_card_bank` VARCHAR(50),

  -- Deudas actuales
  `has_active_debts` TINYINT(1) DEFAULT 0,
  `total_debt_amount` DECIMAL(12,2),
  `monthly_debt_payment` DECIMAL(10,2),
  `debt_institutions` JSON COMMENT '["BCP", "Interbank", "Otros"]',

  -- Historial crediticio declarado
  `has_credit_history` TINYINT(1),
  `previous_credits_count` TINYINT UNSIGNED,
  `had_payment_issues` TINYINT(1) DEFAULT 0,
  `payment_issues_detail` VARCHAR(300),

  -- Metadata
  `captured_from_session_id` BIGINT UNSIGNED,
  `capture_source` ENUM('form', 'api', 'bureau', 'manual') DEFAULT 'form',

  `is_current` TINYINT(1) DEFAULT 1,
  `valid_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_financial_version` (`person_id`, `version`),
  KEY `idx_financial_person_current` (`person_id`, `is_current`),
  CONSTRAINT `fk_financial_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.8 person_equifax_history

Historial de consultas a Equifax por persona. Permite múltiples reportes a lo largo del tiempo.

```sql
CREATE TABLE `person_equifax_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,

  -- Datos de la consulta
  `report_id` VARCHAR(100) NOT NULL COMMENT 'ID único del reporte en Equifax',
  `consultation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `consultation_type` ENUM('scoring', 'full_report', 'basic', 'deuda_total') NOT NULL DEFAULT 'scoring',

  -- Resultado del scoring
  `score` SMALLINT UNSIGNED COMMENT 'Score crediticio (0-999)',
  `score_band` CHAR(1) COMMENT 'A, B, C, D, E',
  `risk_category` ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
  `risk_description` VARCHAR(200),

  -- Datos de deuda (resumen)
  `total_debt_amount` DECIMAL(12,2) COMMENT 'Deuda total reportada',
  `active_credits_count` TINYINT UNSIGNED COMMENT 'Número de créditos activos',
  `overdue_credits_count` TINYINT UNSIGNED COMMENT 'Créditos con atraso',
  `max_days_overdue` SMALLINT UNSIGNED COMMENT 'Máximo días de atraso',
  `monthly_debt_payment` DECIMAL(10,2) COMMENT 'Cuota mensual total estimada',

  -- Entidades financieras
  `entities_reported` JSON COMMENT '["BCP", "Interbank", "Caja Arequipa"]',
  `entities_count` TINYINT UNSIGNED,

  -- Metadata de la consulta
  `raw_response` JSON COMMENT 'Respuesta completa de Equifax (encriptada)',
  `consultation_reason` ENUM('application', 'renewal', 'monitoring', 'preapproval', 'manual') DEFAULT 'application',
  `application_id` BIGINT UNSIGNED COMMENT 'Solicitud que originó la consulta',
  `consulted_by` BIGINT UNSIGNED COMMENT 'Usuario que realizó la consulta',

  -- Control
  `is_current` TINYINT(1) DEFAULT 1 COMMENT 'Consulta más reciente',
  `expires_at` TIMESTAMP NULL COMMENT 'Fecha de expiración del reporte (generalmente 30 días)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equifax_report` (`report_id`),
  KEY `idx_equifax_person_current` (`person_id`, `is_current`),
  KEY `idx_equifax_person_date` (`person_id`, `consultation_date` DESC),
  KEY `idx_equifax_score` (`score`, `score_band`),
  KEY `idx_equifax_application` (`application_id`),
  CONSTRAINT `fk_equifax_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_equifax_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Flujo de consultas Equifax:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    HISTORIAL DE CONSULTAS EQUIFAX POR PERSONA                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   PERSONA: Juan Pérez (person.id = 789)                                         │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Consulta 1: Solicitud inicial (Enero 2025)                             │   │
│   │  person_equifax_history.id = 1                                          │   │
│   │  report_id = "EQX-2025-001234"                                          │   │
│   │  score = 650, score_band = "C"                                          │   │
│   │  application_id = 5001                                                   │   │
│   │  is_current = 0  ←── Ya no es la más reciente                           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Consulta 2: Segunda solicitud (Junio 2025)                             │   │
│   │  person_equifax_history.id = 2                                          │   │
│   │  report_id = "EQX-2025-005678"                                          │   │
│   │  score = 720, score_band = "B"  ←── Mejoró su score                     │   │
│   │  application_id = 5089                                                   │   │
│   │  is_current = 0                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Consulta 3: Tercera solicitud (Diciembre 2025)                         │   │
│   │  person_equifax_history.id = 3                                          │   │
│   │  report_id = "EQX-2025-009012"                                          │   │
│   │  score = 680, score_band = "B"  ←── Bajó un poco                        │   │
│   │  application_id = 5150                                                   │   │
│   │  is_current = 1  ←── CONSULTA MÁS RECIENTE                              │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   person.equifax_score = 680  ←── Siempre refleja el score más reciente        │
│   person.equifax_report_id = "EQX-2025-009012"                                  │
│   person.risk_category = "B"                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Queries útiles:**

```sql
-- Obtener historial completo de Equifax de una persona
SELECT
    peh.consultation_date,
    peh.report_id,
    peh.score,
    peh.score_band,
    peh.total_debt_amount,
    peh.active_credits_count,
    a.code AS application_code,
    peh.is_current
FROM person_equifax_history peh
LEFT JOIN application a ON a.id = peh.application_id
WHERE peh.person_id = 789
ORDER BY peh.consultation_date DESC;

-- Obtener solo la consulta más reciente
SELECT * FROM person_equifax_history
WHERE person_id = 789 AND is_current = 1;

-- Ver evolución del score en el tiempo
SELECT
    DATE_FORMAT(consultation_date, '%Y-%m') AS mes,
    score,
    score_band,
    total_debt_amount
FROM person_equifax_history
WHERE person_id = 789
ORDER BY consultation_date ASC;
```

---

### 9.9 person_reference

Referencias personales (permite múltiples activas).

```sql
CREATE TABLE `person_reference` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,

  `reference_type` ENUM('personal', 'family', 'work', 'academic') NOT NULL,
  `relationship` VARCHAR(50) NOT NULL COMMENT 'padre, hermano, amigo, jefe, etc.',
  `full_name` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `phone_secondary` VARCHAR(20),
  `email` VARCHAR(254),

  -- Verificación
  `contact_verified` TINYINT(1) DEFAULT 0,
  `contact_verified_at` TIMESTAMP NULL,
  `verification_notes` VARCHAR(500),

  `display_order` TINYINT UNSIGNED DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `captured_from_application_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_reference_person` (`person_id`, `is_active`),
  KEY `idx_reference_phone` (`phone`),
  CONSTRAINT `fk_reference_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.9 document_type

Catálogo de tipos de documentos requeridos.

```sql
CREATE TABLE `document_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300),

  `category` ENUM('identity', 'academic', 'employment', 'financial', 'other') NOT NULL,

  -- Validaciones de archivo
  `allowed_mime_types` JSON NOT NULL COMMENT '["image/jpeg", "image/png", "application/pdf"]',
  `max_file_size_mb` TINYINT UNSIGNED DEFAULT 5,
  `min_resolution_px` SMALLINT UNSIGNED COMMENT 'Mínimo ancho para imágenes',

  -- Configuración
  `is_required_default` TINYINT(1) DEFAULT 0,
  `requires_both_sides` TINYINT(1) DEFAULT 0 COMMENT 'Para DNI frente/reverso',
  `max_age_days` SMALLINT UNSIGNED COMMENT 'Máxima antigüedad del documento',
  `requires_validation` TINYINT(1) DEFAULT 1,

  `instructions` TEXT COMMENT 'Instrucciones para el usuario',
  `example_image_url` VARCHAR(500),

  `display_order` TINYINT UNSIGNED DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doctype_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.10 person_document

Documentos de la persona con versionado.

```sql
CREATE TABLE `person_document` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NOT NULL,
  `document_type_id` BIGINT UNSIGNED NOT NULL,
  `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,

  -- Archivo
  `file_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(200) NOT NULL,
  `file_mime_type` VARCHAR(100) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL,
  `file_hash` VARCHAR(64) COMMENT 'SHA256 para detectar duplicados',

  -- Metadata de imagen
  `image_width` SMALLINT UNSIGNED,
  `image_height` SMALLINT UNSIGNED,
  `thumbnail_url` VARCHAR(500),

  -- Validación
  `validation_status` ENUM('pending', 'processing', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  `validation_score` TINYINT UNSIGNED COMMENT 'Score de calidad 0-100',
  `validation_notes` VARCHAR(500),
  `rejection_reason` VARCHAR(300),
  `validated_at` TIMESTAMP NULL,

  -- OCR/Extracción
  `extracted_data` JSON COMMENT 'Datos extraídos por OCR',
  `ocr_confidence` TINYINT UNSIGNED,

  -- Metadata de captura
  `captured_from_session_id` BIGINT UNSIGNED,
  `captured_from_application_id` BIGINT UNSIGNED,
  `capture_device` VARCHAR(100) COMMENT 'mobile, desktop, scanner',

  `is_current` TINYINT(1) DEFAULT 1,
  `expires_at` TIMESTAMP NULL COMMENT 'Si el documento tiene vencimiento',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_person_doc_version` (`person_id`, `document_type_id`, `version`),
  KEY `idx_person_doc_current` (`person_id`, `is_current`),
  KEY `idx_person_doc_status` (`validation_status`),
  KEY `idx_person_doc_hash` (`file_hash`),
  CONSTRAINT `fk_pdoc_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pdoc_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.11 application

Solicitud de crédito. Referencia a persona y versiones de datos usadas.

```sql
CREATE TABLE `application` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único: BC-2025-000001',

  -- Relaciones principales
  `person_id` BIGINT UNSIGNED NOT NULL,
  `session_id` BIGINT UNSIGNED,
  `landing_id` BIGINT UNSIGNED,
  `landing_version_id` BIGINT UNSIGNED COMMENT 'Versión de landing que generó esta solicitud (v3.0)',

  -- Referencias a versiones de datos usadas (para auditoría)
  `contact_version_id` BIGINT UNSIGNED COMMENT 'Versión de contacto usada',
  `address_version_id` BIGINT UNSIGNED COMMENT 'Versión de dirección usada',
  `academic_version_id` BIGINT UNSIGNED COMMENT 'Versión académica usada',
  `employment_version_id` BIGINT UNSIGNED COMMENT 'Versión laboral usada',
  `financial_version_id` BIGINT UNSIGNED COMMENT 'Versión financiera usada',

  -- Producto seleccionado
  `product_id` BIGINT UNSIGNED NOT NULL,
  `term_months` TINYINT UNSIGNED NOT NULL,
  `monthly_payment` DECIMAL(10,2) NOT NULL,
  `initial_payment` DECIMAL(10,2) DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `tea` DECIMAL(6,3),
  `tcea` DECIMAL(6,3),
  `discount_applied` DECIMAL(10,2) DEFAULT 0,
  `coupon_code` VARCHAR(50),

  -- Scoring
  `score_final` SMALLINT UNSIGNED,
  `score_category` CHAR(1),
  `risk_level` ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
  `rci` DECIMAL(8,4),
  `debt_to_income_ratio` DECIMAL(8,4),

  -- Estado
  `status` ENUM(
    'draft', 'submitted', 'reviewing', 'pending_docs',
    'pre_approved', 'approved', 'rejected',
    'signed', 'disbursed', 'delivered', 'active',
    'completed', 'defaulted', 'cancelled'
  ) NOT NULL DEFAULT 'draft',
  `rejection_reason` VARCHAR(300),
  `rejection_code` VARCHAR(50),

  -- Flags
  `is_returning_customer` TINYINT(1) DEFAULT 0 COMMENT 'Ya tenía solicitudes previas',
  `is_preapproved` TINYINT(1) DEFAULT 0,
  `is_express` TINYINT(1) DEFAULT 0,
  `used_previous_data` TINYINT(1) DEFAULT 0 COMMENT 'Usó datos de solicitud anterior',
  `data_updated_fields` JSON COMMENT 'Campos que actualizó vs versión anterior',

  -- Fechas importantes
  `submitted_at` TIMESTAMP NULL,
  `reviewed_at` TIMESTAMP NULL,
  `approved_at` TIMESTAMP NULL,
  `rejected_at` TIMESTAMP NULL,
  `signed_at` TIMESTAMP NULL,
  `disbursed_at` TIMESTAMP NULL,
  `delivered_at` TIMESTAMP NULL,

  -- Attribution
  `source` VARCHAR(100),
  `campaign` VARCHAR(200),
  `referral_code` VARCHAR(50),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_application_code` (`code`),
  KEY `idx_app_person` (`person_id`),
  KEY `idx_app_session` (`session_id`),
  KEY `idx_app_landing` (`landing_id`),
  KEY `idx_app_landing_version` (`landing_version_id`),
  KEY `idx_app_product` (`product_id`),
  KEY `idx_app_status` (`status`),
  KEY `idx_app_created` (`created_at`),
  KEY `idx_app_source` (`source`),

  CONSTRAINT `fk_app_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`),
  CONSTRAINT `fk_app_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_app_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_app_landing_version` FOREIGN KEY (`landing_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_app_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_app_contact_ver` FOREIGN KEY (`contact_version_id`) REFERENCES `person_contact_history` (`id`),
  CONSTRAINT `fk_app_address_ver` FOREIGN KEY (`address_version_id`) REFERENCES `person_address_history` (`id`),
  CONSTRAINT `fk_app_academic_ver` FOREIGN KEY (`academic_version_id`) REFERENCES `person_academic_history` (`id`),
  CONSTRAINT `fk_app_employment_ver` FOREIGN KEY (`employment_version_id`) REFERENCES `person_employment_history` (`id`),
  CONSTRAINT `fk_app_financial_ver` FOREIGN KEY (`financial_version_id`) REFERENCES `person_financial_history` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.12 application_product

Productos en la solicitud (principal + accesorios + seguros).

```sql
CREATE TABLE `application_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `product_type` ENUM('main', 'accessory', 'insurance') NOT NULL,
  `quantity` TINYINT UNSIGNED DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `monthly_price` DECIMAL(10,2) NOT NULL,
  `discount_applied` DECIMAL(10,2) DEFAULT 0,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_product` (`application_id`, `product_id`),
  CONSTRAINT `fk_appprod_app` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appprod_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.13 application_document

Documentos específicos de una solicitud (vincula person_document con application).

```sql
CREATE TABLE `application_document` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `person_document_id` BIGINT UNSIGNED NOT NULL,
  `document_type_id` BIGINT UNSIGNED NOT NULL,

  -- Estado específico para esta solicitud
  `status` ENUM('pending', 'approved', 'rejected', 'reupload_required') DEFAULT 'pending',
  `review_notes` VARCHAR(500),
  `reviewed_at` TIMESTAMP NULL,

  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_doc` (`application_id`, `document_type_id`),
  KEY `idx_app_doc_status` (`application_id`, `status`),
  CONSTRAINT `fk_appdoc_app` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appdoc_pdoc` FOREIGN KEY (`person_document_id`) REFERENCES `person_document` (`id`),
  CONSTRAINT `fk_appdoc_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.14 application_status_log

Historial de cambios de estado.

```sql
CREATE TABLE `application_status_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT UNSIGNED NOT NULL,
  `from_status` VARCHAR(30),
  `to_status` VARCHAR(30) NOT NULL,
  `reason` VARCHAR(500),
  `trigger_type` ENUM('automatic', 'manual', 'system', 'webhook') DEFAULT 'automatic',
  `metadata` JSON,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_log_app` (`application_id`),
  KEY `idx_status_log_changed` (`changed_at`),
  CONSTRAINT `fk_status_log_app` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.15 daily_product_catalog_snapshot

Snapshot diario del catálogo disponible por landing.

```sql
CREATE TABLE `daily_product_catalog_snapshot` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `snapshot_date` DATE NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,

  -- Snapshot del producto ese día
  `product_name` VARCHAR(200) NOT NULL,
  `product_sku` VARCHAR(50),
  `brand_name` VARCHAR(50),
  `product_type` VARCHAR(30),
  `list_price` DECIMAL(10,2),

  -- Pricing disponible ese día
  `available_terms` JSON COMMENT '[6, 9, 12, 18]',
  `min_monthly_payment` DECIMAL(10,2),
  `max_monthly_payment` DECIMAL(10,2),
  `tea_applied` DECIMAL(6,3),
  `discount_applied` DECIMAL(5,2),

  -- Posición/visibilidad
  `is_featured` TINYINT(1) DEFAULT 0,
  `display_order` SMALLINT UNSIGNED,
  `is_in_stock` TINYINT(1) DEFAULT 1,

  -- Métricas del día
  `impressions` INT UNSIGNED DEFAULT 0,
  `clicks` INT UNSIGNED DEFAULT 0,
  `detail_views` INT UNSIGNED DEFAULT 0,
  `add_to_cart` INT UNSIGNED DEFAULT 0,
  `applications_started` INT UNSIGNED DEFAULT 0,
  `applications_completed` INT UNSIGNED DEFAULT 0,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_daily_snapshot` (`snapshot_date`, `landing_id`, `product_id`),
  KEY `idx_snapshot_date` (`snapshot_date`),
  KEY `idx_snapshot_landing` (`landing_id`),
  KEY `idx_snapshot_product` (`product_id`),
  CONSTRAINT `fk_snapshot_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_snapshot_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.16 session_product_view

Productos vistos por sesión (para análisis individual).

```sql
CREATE TABLE `session_product_view` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `view_date` DATE NOT NULL,

  -- Detalle de interacción
  `first_view_at` TIMESTAMP(3) NOT NULL,
  `last_view_at` TIMESTAMP(3) NOT NULL,
  `view_count` SMALLINT UNSIGNED DEFAULT 1,
  `total_time_visible_ms` INT UNSIGNED DEFAULT 0,

  -- Acciones
  `viewed_card` TINYINT(1) DEFAULT 1,
  `viewed_detail` TINYINT(1) DEFAULT 0,
  `opened_simulator` TINYINT(1) DEFAULT 0,
  `added_to_cart` TINYINT(1) DEFAULT 0,
  `selected_term` TINYINT UNSIGNED,

  -- Contexto
  `position_first_seen` SMALLINT UNSIGNED,
  `filters_applied` JSON COMMENT 'Filtros activos cuando lo vio',
  `source_page` VARCHAR(100) COMMENT 'Desde dónde llegó al producto',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_product_date` (`session_id`, `product_id`, `view_date`),
  KEY `idx_spv_date` (`view_date`),
  KEY `idx_spv_product` (`product_id`),
  CONSTRAINT `fk_spv_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_spv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.17 Procedimiento: Actualizar Snapshot Diario

```sql
DELIMITER //

CREATE PROCEDURE `sp_update_daily_product_snapshot`(
  IN p_date DATE
)
BEGIN
  -- Insertar o actualizar snapshot del día
  INSERT INTO daily_product_catalog_snapshot (
    snapshot_date, landing_id, product_id,
    product_name, product_sku, brand_name, product_type, list_price,
    available_terms, min_monthly_payment, max_monthly_payment, tea_applied, discount_applied,
    is_featured, display_order, is_in_stock
  )
  SELECT
    p_date,
    lp.landing_id,
    p.id,
    p.name,
    p.sku,
    b.name,
    p.type,
    p.list_price,
    (SELECT JSON_ARRAYAGG(pp.term_months) FROM product_pricing pp WHERE pp.product_id = p.id AND pp.is_active = 1),
    (SELECT MIN(pp.monthly_payment) FROM product_pricing pp WHERE pp.product_id = p.id AND pp.is_active = 1),
    (SELECT MAX(pp.monthly_payment) FROM product_pricing pp WHERE pp.product_id = p.id AND pp.is_active = 1),
    COALESCE(lp.custom_tea, (SELECT MIN(pp.tea) FROM product_pricing pp WHERE pp.product_id = p.id)),
    COALESCE(lp.discount_percentage, 0),
    lp.is_featured,
    lp.display_order,
    p.is_active
  FROM landing_product lp
  JOIN product p ON p.id = lp.product_id
  JOIN brand b ON b.id = p.brand_id
  WHERE lp.is_active = 1 AND p.is_active = 1
  ON DUPLICATE KEY UPDATE
    list_price = VALUES(list_price),
    min_monthly_payment = VALUES(min_monthly_payment),
    max_monthly_payment = VALUES(max_monthly_payment),
    is_featured = VALUES(is_featured),
    display_order = VALUES(display_order),
    is_in_stock = VALUES(is_in_stock);

  -- Actualizar métricas del día desde tracking
  UPDATE daily_product_catalog_snapshot dps
  SET
    impressions = (
      SELECT COUNT(*) FROM event_product ep
      JOIN session s ON s.id = ep.session_id
      WHERE ep.product_id = dps.product_id
        AND ep.interaction_type = 'view_card'
        AND DATE(ep.created_at) = p_date
        AND s.landing_id = dps.landing_id
    ),
    clicks = (
      SELECT COUNT(*) FROM event_product ep
      JOIN session s ON s.id = ep.session_id
      WHERE ep.product_id = dps.product_id
        AND ep.interaction_type = 'click_card'
        AND DATE(ep.created_at) = p_date
        AND s.landing_id = dps.landing_id
    ),
    detail_views = (
      SELECT COUNT(*) FROM event_product ep
      JOIN session s ON s.id = ep.session_id
      WHERE ep.product_id = dps.product_id
        AND ep.interaction_type IN ('view_detail', 'open_detail')
        AND DATE(ep.created_at) = p_date
        AND s.landing_id = dps.landing_id
    ),
    applications_started = (
      SELECT COUNT(DISTINCT a.id) FROM application a
      WHERE a.product_id = dps.product_id
        AND a.landing_id = dps.landing_id
        AND DATE(a.created_at) = p_date
    ),
    applications_completed = (
      SELECT COUNT(DISTINCT a.id) FROM application a
      WHERE a.product_id = dps.product_id
        AND a.landing_id = dps.landing_id
        AND DATE(a.submitted_at) = p_date
        AND a.status NOT IN ('draft', 'cancelled')
    )
  WHERE dps.snapshot_date = p_date;

END //

DELIMITER ;
```

### 9.18 Evento programado para actualizar snapshots

```sql
-- Ejecutar cada día a medianoche
CREATE EVENT `evt_daily_product_snapshot`
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURDATE()) + INTERVAL 1 DAY)
DO
  CALL sp_update_daily_product_snapshot(CURDATE() - INTERVAL 1 DAY);
```

---

## 10. Módulo: Leads (Sesiones Abandonadas)

Sistema de detección y gestión de leads: usuarios que iniciaron pero no completaron su solicitud.

### 10.1 lead

Lead generado desde sesión abandonada.

```sql
CREATE TABLE `lead` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED,
  `landing_version_id` BIGINT UNSIGNED COMMENT 'Versión de landing que generó este lead (v3.0)',
  `agreement_id` BIGINT UNSIGNED COMMENT 'Convenio si aplica',

  -- Datos capturados (parciales)
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `document_number` VARCHAR(20),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `institution_id` BIGINT UNSIGNED,
  `campus_id` BIGINT UNSIGNED,

  -- Producto de interés
  `product_id` BIGINT UNSIGNED,
  `combo_id` BIGINT UNSIGNED,
  `product_name` VARCHAR(200) COMMENT 'Snapshot del nombre',
  `intended_amount` DECIMAL(10,2),
  `intended_term` INT,

  -- Progreso
  `last_step_code` VARCHAR(50),
  `last_step_order` INT,
  `form_completion_percent` TINYINT UNSIGNED DEFAULT 0,
  `fields_completed` INT DEFAULT 0,
  `fields_total` INT,

  -- Clasificación
  `status` ENUM(
    'new',              -- Recién detectado
    'contacted',        -- Ya se contactó
    'qualified',        -- Interés confirmado
    'nurturing',        -- En nutrición
    'converted',        -- Completó solicitud
    'lost',             -- No interesado
    'invalid'           -- Datos inválidos
  ) DEFAULT 'new',
  `quality_score` TINYINT UNSIGNED COMMENT '0-100',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `temperature` ENUM('cold', 'warm', 'hot') DEFAULT 'warm',

  -- Timing
  `abandoned_at` TIMESTAMP NOT NULL,
  `time_on_site_seconds` INT UNSIGNED,
  `idle_seconds_before_abandon` INT UNSIGNED,

  -- Attribution
  `traffic_source` VARCHAR(50),
  `utm_source` VARCHAR(100),
  `utm_medium` VARCHAR(100),
  `utm_campaign` VARCHAR(200),

  -- Gestión
  `assigned_to` BIGINT UNSIGNED,
  `next_action` VARCHAR(200),
  `next_action_at` TIMESTAMP NULL,
  `notes` TEXT,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lead_session` (`session_id`),
  KEY `idx_lead_landing` (`landing_id`),
  KEY `idx_lead_landing_version` (`landing_version_id`),
  KEY `idx_lead_status` (`status`),
  KEY `idx_lead_priority` (`priority`),
  KEY `idx_lead_email` (`email`),
  KEY `idx_lead_phone` (`phone`),
  KEY `idx_lead_document` (`document_number`),
  KEY `idx_lead_abandoned` (`abandoned_at`),
  KEY `idx_lead_assigned` (`assigned_to`),
  KEY `idx_lead_traffic` (`traffic_source`),

  CONSTRAINT `fk_lead_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_lead_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_lead_landing_version` FOREIGN KEY (`landing_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lead_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_lead_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_lead_campus` FOREIGN KEY (`campus_id`) REFERENCES `institution_campus` (`id`),
  CONSTRAINT `fk_lead_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_lead_combo` FOREIGN KEY (`combo_id`) REFERENCES `combo` (`id`),
  CONSTRAINT `fk_lead_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.2 lead_score_rule

Reglas de scoring para leads.

```sql
CREATE TABLE `lead_score_rule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500),

  -- Condición
  `field` VARCHAR(100) NOT NULL COMMENT 'Campo a evaluar: form_completion_percent, time_on_site, etc.',
  `operator` ENUM('equals', 'not_equals', 'greater_than', 'less_than', 'between', 'contains', 'is_null', 'is_not_null') NOT NULL,
  `value` VARCHAR(500) NOT NULL COMMENT 'Valor o JSON para between',

  -- Resultado
  `score_points` INT NOT NULL COMMENT 'Puntos a sumar/restar',
  `priority_boost` ENUM('none', 'low', 'medium', 'high') DEFAULT 'none',

  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_score_rule_active` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.3 lead_interaction

Interacciones con leads (llamadas, emails, etc.).

```sql
CREATE TABLE `lead_interaction` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,

  `type` ENUM(
    'call_outbound',
    'call_inbound',
    'email_sent',
    'email_received',
    'sms_sent',
    'whatsapp_sent',
    'whatsapp_received',
    'meeting',
    'note',
    'status_change'
  ) NOT NULL,

  `status` ENUM('completed', 'no_answer', 'busy', 'voicemail', 'scheduled', 'cancelled') DEFAULT 'completed',
  `duration_seconds` INT UNSIGNED COMMENT 'Para llamadas',
  `subject` VARCHAR(200),
  `content` TEXT,
  `outcome` VARCHAR(200) COMMENT 'Resultado de la interacción',

  -- Cambio de estado si aplica
  `old_lead_status` VARCHAR(50),
  `new_lead_status` VARCHAR(50),

  `scheduled_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_interaction_lead` (`lead_id`),
  KEY `idx_interaction_user` (`user_id`),
  KEY `idx_interaction_type` (`type`),
  KEY `idx_interaction_created` (`created_at`),

  CONSTRAINT `fk_interaction_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead` (`id`),
  CONSTRAINT `fk_interaction_user` FOREIGN KEY (`user_id`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.4 lead_recovery_campaign

Campañas de recuperación de leads.

```sql
CREATE TABLE `lead_recovery_campaign` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,

  -- Segmentación (sin JSON - normalizado en tablas pivot)
  `min_quality_score` TINYINT UNSIGNED,
  `max_quality_score` TINYINT UNSIGNED,
  `min_form_completion` TINYINT UNSIGNED,
  `max_form_completion` TINYINT UNSIGNED,
  `min_abandoned_hours_ago` INT,
  `max_abandoned_hours_ago` INT,

  -- Canal
  `channel` ENUM('email', 'sms', 'whatsapp', 'push', 'retargeting') NOT NULL,
  `template_id` VARCHAR(100) COMMENT 'ID del template en el canal',
  `message_content` TEXT,

  -- Scheduling
  `send_delay_hours` INT DEFAULT 1 COMMENT 'Horas después del abandono',
  `max_sends_per_lead` INT DEFAULT 3,
  `min_hours_between_sends` INT DEFAULT 24,

  -- Control
  `status` ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
  `start_date` DATE,
  `end_date` DATE,

  -- Métricas
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

-- Tabla pivot: Estados de lead objetivo de la campaña (normalizado)
CREATE TABLE `lead_campaign_status` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `lead_status` ENUM('new', 'contacted', 'qualified', 'hot', 'warm', 'cold', 'converted', 'lost') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_status` (`campaign_id`, `lead_status`),
  KEY `idx_status_campaign` (`lead_status`, `campaign_id`),
  CONSTRAINT `fk_lcs_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `lead_recovery_campaign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Landings objetivo de la campaña (normalizado)
CREATE TABLE `lead_campaign_landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_landing` (`campaign_id`, `landing_id`),
  KEY `idx_landing_campaign` (`landing_id`, `campaign_id`),
  CONSTRAINT `fk_lcl_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `lead_recovery_campaign` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lcl_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Fuentes de tráfico objetivo de la campaña (normalizado)
CREATE TABLE `lead_campaign_source` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `traffic_source` ENUM('organic_search', 'paid_search', 'organic_social', 'paid_social', 'display', 'retargeting', 'email', 'sms', 'push_notification', 'affiliate', 'referral', 'direct', 'preapproved', 'qr_code', 'offline', 'other') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_source` (`campaign_id`, `traffic_source`),
  KEY `idx_source_campaign` (`traffic_source`, `campaign_id`),
  CONSTRAINT `fk_lcso_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `lead_recovery_campaign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10.5 lead_campaign_send

Envíos individuales de campañas.

```sql
CREATE TABLE `lead_campaign_send` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `lead_id` BIGINT UNSIGNED NOT NULL,

  `send_number` TINYINT UNSIGNED DEFAULT 1 COMMENT 'Número de intento',
  `status` ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed') DEFAULT 'pending',

  `scheduled_at` TIMESTAMP NOT NULL,
  `sent_at` TIMESTAMP NULL,
  `delivered_at` TIMESTAMP NULL,
  `opened_at` TIMESTAMP NULL,
  `clicked_at` TIMESTAMP NULL,

  `external_id` VARCHAR(100) COMMENT 'ID del proveedor de mensajería',
  `error_message` VARCHAR(500),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_lead_send` (`campaign_id`, `lead_id`, `send_number`),
  KEY `idx_send_status` (`status`),
  KEY `idx_send_scheduled` (`scheduled_at`),

  CONSTRAINT `fk_send_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `lead_recovery_campaign` (`id`),
  CONSTRAINT `fk_send_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 11. Módulo: Marketing y Preaprobados

Sistema para gestionar usuarios preaprobados y campañas de marketing.

### 11.1 preapproved_customer

Clientes preaprobados para ofertas.

```sql
CREATE TABLE `preapproved_customer` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- Identificación
  `document_type` ENUM('dni', 'ce', 'pasaporte') NOT NULL,
  `document_number` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `email` VARCHAR(254),
  `phone` VARCHAR(20),

  -- Origen de datos
  `source` ENUM(
    'bureau',           -- Centrales de riesgo
    'existing_customer', -- Cliente existente
    'partner',          -- Convenios
    'campaign',         -- Campañas
    'referral',         -- Referidos
    'institution'       -- Base de institución
  ) NOT NULL,
  `source_detail` VARCHAR(200),
  `source_file` VARCHAR(300) COMMENT 'Archivo de carga si aplica',
  `imported_at` TIMESTAMP,

  -- Análisis de riesgo
  `risk_score` DECIMAL(5,2),
  `risk_category` ENUM('A', 'B', 'C', 'D', 'E'),
  `debt_ratio` DECIMAL(5,2),
  `estimated_income` DECIMAL(12,2),

  -- Oferta preaprobada
  `max_amount` DECIMAL(10,2) NOT NULL,
  `min_amount` DECIMAL(10,2),
  `suggested_amount` DECIMAL(10,2),
  `max_term_months` INT,
  `min_term_months` INT,
  `special_rate` DECIMAL(5,2) COMMENT 'TEA especial',
  `offer_code` VARCHAR(50) COMMENT 'Código único de oferta',

  -- Restricciones (sin JSON - normalizado en tablas pivot)
  `agreement_id` BIGINT UNSIGNED,
  `institution_id` BIGINT UNSIGNED,

  -- Vigencia
  `valid_from` DATE NOT NULL,
  `valid_until` DATE NOT NULL,

  -- Estado
  `status` ENUM(
    'active',           -- Disponible
    'contacted',        -- Ya se contactó
    'interested',       -- Mostró interés
    'applied',          -- Inició solicitud
    'converted',        -- Completó solicitud
    'declined',         -- Rechazó oferta
    'expired',          -- Venció
    'revoked'           -- Revocado
  ) DEFAULT 'active',

  -- Tracking
  `landing_visits` INT DEFAULT 0,
  `last_visit_at` TIMESTAMP NULL,
  `session_id` BIGINT UNSIGNED COMMENT 'Última sesión',
  `application_id` BIGINT UNSIGNED,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_preapproved_doc` (`document_type`, `document_number`, `valid_from`),
  UNIQUE KEY `uk_preapproved_offer_code` (`offer_code`),
  KEY `idx_preapproved_status` (`status`),
  KEY `idx_preapproved_email` (`email`),
  KEY `idx_preapproved_phone` (`phone`),
  KEY `idx_preapproved_validity` (`valid_from`, `valid_until`),
  KEY `idx_preapproved_risk` (`risk_category`),
  KEY `idx_preapproved_source` (`source`),

  CONSTRAINT `fk_preapproved_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_preapproved_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_preapproved_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_preapproved_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Productos permitidos para el preaprobado (normalizado)
CREATE TABLE `preapproved_product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `preapproved_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_preapproved_product` (`preapproved_id`, `product_id`),
  KEY `idx_product_preapproved` (`product_id`, `preapproved_id`),
  CONSTRAINT `fk_pp_preapproved` FOREIGN KEY (`preapproved_id`) REFERENCES `preapproved_customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pp_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Landings donde puede usar la oferta el preaprobado (normalizado)
CREATE TABLE `preapproved_landing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `preapproved_id` BIGINT UNSIGNED NOT NULL,
  `landing_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_preapproved_landing` (`preapproved_id`, `landing_id`),
  KEY `idx_landing_preapproved` (`landing_id`, `preapproved_id`),
  CONSTRAINT `fk_pl_preapproved` FOREIGN KEY (`preapproved_id`) REFERENCES `preapproved_customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pl_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.2 preapproved_import

Log de importaciones de preaprobados.

```sql
CREATE TABLE `preapproved_import` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  `source` VARCHAR(100) NOT NULL,
  `filename` VARCHAR(300),
  `file_size_bytes` INT UNSIGNED,
  `file_hash` VARCHAR(64),

  -- Resultado
  `total_rows` INT UNSIGNED,
  `imported_count` INT UNSIGNED DEFAULT 0,
  `updated_count` INT UNSIGNED DEFAULT 0,
  `skipped_count` INT UNSIGNED DEFAULT 0,
  `error_count` INT UNSIGNED DEFAULT 0,
  `errors_detail` JSON,

  -- Vigencia aplicada
  `valid_from` DATE,
  `valid_until` DATE,

  `status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,

  `imported_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_import_status` (`status`),
  KEY `idx_import_source` (`source`),

  CONSTRAINT `fk_import_user` FOREIGN KEY (`imported_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.3 marketing_campaign

Campañas de marketing.

```sql
CREATE TABLE `marketing_campaign` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,

  -- Tipo y objetivo
  `type` ENUM(
    'preapproved_outreach',  -- Contactar preaprobados
    'retargeting',           -- Retargeting
    'seasonal',              -- Campaña Buen Fin, Navidad, etc.
    'product_launch',        -- Lanzamiento de producto
    'referral',              -- Programa de referidos
    'loyalty',               -- Fidelización
    'winback',               -- Recuperación
    'awareness'              -- Awareness
  ) NOT NULL,
  `objective` VARCHAR(500),

  -- Canal principal
  `primary_channel` ENUM('email', 'sms', 'whatsapp', 'push', 'paid_media', 'organic_social', 'offline') NOT NULL,
  `secondary_channels` JSON COMMENT 'Canales adicionales (config, no se filtra)',

  -- Segmentación de preaprobados (sin JSON - normalizado en tablas pivot)
  `target_min_amount` DECIMAL(10,2),
  `target_max_amount` DECIMAL(10,2),

  -- Landing destino
  `landing_id` BIGINT UNSIGNED COMMENT 'Landing específico para la campaña',
  `redirect_url` VARCHAR(2000),
  `utm_source` VARCHAR(100),
  `utm_medium` VARCHAR(100),
  `utm_campaign` VARCHAR(200),
  `utm_content` VARCHAR(200),

  -- Oferta
  `offer_type` ENUM('none', 'discount', 'rate_reduction', 'bonus', 'gift', 'free_shipping') DEFAULT 'none',
  `offer_value` VARCHAR(100),
  `offer_conditions` TEXT,
  `promo_code` VARCHAR(50),

  -- Scheduling
  `start_date` DATE NOT NULL,
  `end_date` DATE,
  `send_schedule` JSON COMMENT 'Horarios de envío',

  -- Budget
  `budget_amount` DECIMAL(12,2),
  `budget_currency` CHAR(3) DEFAULT 'PEN',
  `spent_amount` DECIMAL(12,2) DEFAULT 0,

  -- Status
  `status` ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',

  -- Métricas
  `audience_size` INT UNSIGNED DEFAULT 0,
  `messages_sent` INT UNSIGNED DEFAULT 0,
  `impressions` INT UNSIGNED DEFAULT 0,
  `clicks` INT UNSIGNED DEFAULT 0,
  `landing_visits` INT UNSIGNED DEFAULT 0,
  `applications_started` INT UNSIGNED DEFAULT 0,
  `conversions` INT UNSIGNED DEFAULT 0,
  `revenue_generated` DECIMAL(12,2) DEFAULT 0,

  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_code` (`code`),
  KEY `idx_campaign_status` (`status`),
  KEY `idx_campaign_type` (`type`),
  KEY `idx_campaign_dates` (`start_date`, `end_date`),
  KEY `idx_campaign_landing` (`landing_id`),

  CONSTRAINT `fk_mkt_campaign_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_mkt_campaign_created` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Estados de preaprobados objetivo de la campaña (normalizado)
CREATE TABLE `campaign_preapproved_status` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `preapproved_status` ENUM('active', 'contacted', 'interested', 'applied', 'converted', 'declined', 'expired', 'revoked') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_preapproved_status` (`campaign_id`, `preapproved_status`),
  KEY `idx_status_campaign` (`preapproved_status`, `campaign_id`),
  CONSTRAINT `fk_cps_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Categorías de riesgo objetivo de la campaña (normalizado)
CREATE TABLE `campaign_risk_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `risk_category` ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_risk` (`campaign_id`, `risk_category`),
  KEY `idx_risk_campaign` (`risk_category`, `campaign_id`),
  CONSTRAINT `fk_crc_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Fuentes de datos objetivo de la campaña (normalizado)
CREATE TABLE `campaign_source` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `source` ENUM('bureau', 'existing_customer', 'partner', 'campaign', 'referral', 'institution') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_source` (`campaign_id`, `source`),
  KEY `idx_source_campaign` (`source`, `campaign_id`),
  CONSTRAINT `fk_cs_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaign` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Instituciones objetivo de la campaña (normalizado)
CREATE TABLE `campaign_institution` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_institution` (`campaign_id`, `institution_id`),
  KEY `idx_institution_campaign` (`institution_id`, `campaign_id`),
  CONSTRAINT `fk_ci_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaign` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivot: Convenios objetivo de la campaña (normalizado)
CREATE TABLE `campaign_agreement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `agreement_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_agreement` (`campaign_id`, `agreement_id`),
  KEY `idx_agreement_campaign` (`agreement_id`, `campaign_id`),
  CONSTRAINT `fk_ca_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaign` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ca_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.4 marketing_campaign_send

Envíos de campañas a preaprobados.

```sql
CREATE TABLE `marketing_campaign_send` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` BIGINT UNSIGNED NOT NULL,
  `preapproved_id` BIGINT UNSIGNED NOT NULL,

  `channel` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
  `status` ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed') DEFAULT 'pending',

  `scheduled_at` TIMESTAMP NOT NULL,
  `sent_at` TIMESTAMP NULL,
  `delivered_at` TIMESTAMP NULL,
  `opened_at` TIMESTAMP NULL,
  `clicked_at` TIMESTAMP NULL,

  `external_id` VARCHAR(100),
  `error_message` VARCHAR(500),

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mkt_send` (`campaign_id`, `preapproved_id`, `channel`),
  KEY `idx_mkt_send_status` (`status`),
  KEY `idx_mkt_send_scheduled` (`scheduled_at`),

  CONSTRAINT `fk_mkt_send_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campaign` (`id`),
  CONSTRAINT `fk_mkt_send_preapproved` FOREIGN KEY (`preapproved_id`) REFERENCES `preapproved_customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.5 traffic_source_config

Configuración de fuentes de tráfico y reglas de clasificación.

```sql
CREATE TABLE `traffic_source_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  `traffic_source` ENUM(
    'organic_search', 'paid_search', 'organic_social', 'paid_social',
    'display', 'retargeting', 'email', 'sms', 'push_notification',
    'affiliate', 'referral', 'direct', 'preapproved', 'qr_code', 'offline', 'other'
  ) NOT NULL,

  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500),

  -- Reglas de detección automática
  `detection_rules` JSON COMMENT 'Reglas para clasificar automáticamente',
  /*
  Ejemplo:
  {
    "utm_source_contains": ["google"],
    "utm_medium_equals": ["cpc", "ppc"],
    "referrer_contains": ["google.com/search"],
    "gclid_present": true
  }
  */

  -- Costos
  `default_cpc` DECIMAL(6,2) COMMENT 'CPC promedio',
  `default_cpm` DECIMAL(6,2) COMMENT 'CPM promedio',
  `cost_tracking_enabled` TINYINT(1) DEFAULT 0,

  -- Atribución
  `attribution_weight` DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Peso para atribución',
  `conversion_window_days` INT DEFAULT 30 COMMENT 'Ventana de atribución',

  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_traffic_source` (`traffic_source`),
  KEY `idx_traffic_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.6 referral_program

Programa de referidos.

```sql
CREATE TABLE `referral_program` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,

  -- Recompensas
  `referrer_reward_type` ENUM('cash', 'discount', 'gift', 'points') NOT NULL,
  `referrer_reward_value` DECIMAL(10,2) NOT NULL,
  `referrer_reward_conditions` TEXT,

  `referee_reward_type` ENUM('cash', 'discount', 'gift', 'points'),
  `referee_reward_value` DECIMAL(10,2),
  `referee_reward_conditions` TEXT,

  -- Límites
  `max_referrals_per_user` INT,
  `max_rewards_per_user` DECIMAL(10,2),
  `min_loan_amount_for_reward` DECIMAL(10,2),

  -- Vigencia
  `valid_from` DATE NOT NULL,
  `valid_until` DATE,
  `status` ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',

  -- Landing
  `landing_id` BIGINT UNSIGNED,

  -- Métricas
  `total_referrals` INT UNSIGNED DEFAULT 0,
  `successful_conversions` INT UNSIGNED DEFAULT 0,
  `total_rewards_paid` DECIMAL(12,2) DEFAULT 0,

  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_referral_code` (`code`),
  KEY `idx_referral_status` (`status`),
  KEY `idx_referral_dates` (`valid_from`, `valid_until`),

  CONSTRAINT `fk_referral_landing` FOREIGN KEY (`landing_id`) REFERENCES `landing` (`id`),
  CONSTRAINT `fk_referral_created` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11.7 referral

Referidos individuales.

```sql
CREATE TABLE `referral` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `program_id` BIGINT UNSIGNED NOT NULL,

  -- Referidor
  `referrer_application_id` BIGINT UNSIGNED COMMENT 'Solicitud del que refiere',
  `referrer_code` VARCHAR(20) NOT NULL COMMENT 'Código único del referidor',

  -- Referido
  `referee_email` VARCHAR(254),
  `referee_phone` VARCHAR(20),
  `referee_session_id` BIGINT UNSIGNED,
  `referee_application_id` BIGINT UNSIGNED,

  -- Estado
  `status` ENUM(
    'pending',          -- Invitación enviada
    'clicked',          -- Hizo clic en el link
    'registered',       -- Se registró
    'applied',          -- Inició solicitud
    'approved',         -- Solicitud aprobada
    'disbursed',        -- Desembolsado
    'reward_pending',   -- Recompensa pendiente
    'reward_paid',      -- Recompensa pagada
    'expired',          -- Expiró
    'invalid'           -- Inválido
  ) DEFAULT 'pending',

  -- Recompensas
  `referrer_reward_amount` DECIMAL(10,2),
  `referrer_reward_paid_at` TIMESTAMP NULL,
  `referee_reward_amount` DECIMAL(10,2),
  `referee_reward_applied_at` TIMESTAMP NULL,

  -- Tracking
  `invited_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `clicked_at` TIMESTAMP NULL,
  `converted_at` TIMESTAMP NULL,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_referral_code` (`referrer_code`),
  KEY `idx_referral_program` (`program_id`),
  KEY `idx_referral_referrer` (`referrer_application_id`),
  KEY `idx_referral_status` (`status`),

  CONSTRAINT `fk_referral_program` FOREIGN KEY (`program_id`) REFERENCES `referral_program` (`id`),
  CONSTRAINT `fk_referral_referrer_app` FOREIGN KEY (`referrer_application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_referral_referee_session` FOREIGN KEY (`referee_session_id`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_referral_referee_app` FOREIGN KEY (`referee_application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 12. Módulo: Loan (Préstamos)

Gestión completa del ciclo de vida de préstamos: desde el desembolso hasta el pago completo, incluyendo cronogramas, pagos y manejo de mora.

### 12.1 loan

Préstamo aprobado y desembolsado con toda la información de términos y estado actual.

```sql
CREATE TABLE `loan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL COMMENT 'Código único del préstamo (ej: LN-2024-000123)',
  `application_id` BIGINT UNSIGNED NOT NULL,
  `person_id` BIGINT UNSIGNED NOT NULL,

  -- Términos del préstamo
  `principal_amount` DECIMAL(10,2) NOT NULL COMMENT 'Monto principal financiado',
  `interest_rate` DECIMAL(5,2) NOT NULL COMMENT 'Tasa de interés anual',
  `term_months` INT NOT NULL COMMENT 'Plazo en meses',
  `monthly_payment` DECIMAL(10,2) NOT NULL COMMENT 'Cuota mensual fija',
  `initial_payment` DECIMAL(10,2) DEFAULT 0 COMMENT 'Cuota inicial / enganche',
  `total_payable` DECIMAL(10,2) NOT NULL COMMENT 'Total a pagar (principal + intereses)',

  -- Fechas clave
  `disbursed_at` TIMESTAMP NULL COMMENT 'Fecha/hora de desembolso',
  `first_due_date` DATE NOT NULL COMMENT 'Fecha de primera cuota',
  `last_due_date` DATE NOT NULL COMMENT 'Fecha de última cuota',

  -- Estado actual
  `status` ENUM('active', 'delinquent', 'default', 'paid_off', 'refinanced', 'cancelled') DEFAULT 'active',
  `paid_installments` INT DEFAULT 0 COMMENT 'Cuotas pagadas',
  `remaining_installments` INT COMMENT 'Cuotas pendientes',
  `total_paid` DECIMAL(10,2) DEFAULT 0 COMMENT 'Total pagado hasta la fecha',
  `total_pending` DECIMAL(10,2) COMMENT 'Total pendiente de pago',
  `total_late_fees` DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de moras acumuladas',

  -- Tracking de morosidad
  `days_past_due` INT DEFAULT 0 COMMENT 'Días de atraso actual',
  `current_overdue_amount` DECIMAL(10,2) DEFAULT 0 COMMENT 'Monto vencido actual',
  `max_days_past_due` INT DEFAULT 0 COMMENT 'Máximo días de atraso histórico',

  -- Info de próximo pago
  `last_payment_date` DATE COMMENT 'Fecha del último pago',
  `next_due_date` DATE COMMENT 'Fecha de próxima cuota',
  `next_payment_amount` DECIMAL(10,2) COMMENT 'Monto de próxima cuota (incluye mora si aplica)',

  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loan_code` (`code`),
  KEY `idx_loan_application` (`application_id`),
  KEY `idx_loan_person` (`person_id`),
  KEY `idx_loan_status` (`status`),
  KEY `idx_loan_next_due` (`next_due_date`),
  KEY `idx_loan_delinquency` (`days_past_due`, `status`),

  CONSTRAINT `fk_loan_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_loan_person` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12.2 loan_schedule

Cronograma de cuotas del préstamo con estado de pago por cada cuota.

```sql
CREATE TABLE `loan_schedule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id` BIGINT UNSIGNED NOT NULL,
  `installment_number` INT NOT NULL COMMENT 'Número de cuota (1, 2, 3...)',
  `due_date` DATE NOT NULL COMMENT 'Fecha de vencimiento',

  -- Montos
  `principal_amount` DECIMAL(10,2) NOT NULL COMMENT 'Porción de capital',
  `interest_amount` DECIMAL(10,2) NOT NULL COMMENT 'Porción de interés',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT 'Cuota total',
  `late_fee` DECIMAL(10,2) DEFAULT 0 COMMENT 'Mora aplicada',

  -- Estado de pago
  `status` ENUM('pending', 'paid', 'partial', 'overdue', 'waived') DEFAULT 'pending',
  `paid_amount` DECIMAL(10,2) DEFAULT 0 COMMENT 'Monto pagado',
  `paid_at` TIMESTAMP NULL COMMENT 'Fecha/hora de pago completo',
  `payment_id` BIGINT UNSIGNED COMMENT 'Referencia al pago que cubrió esta cuota',

  -- Morosidad
  `days_overdue` INT DEFAULT 0 COMMENT 'Días de atraso',
  `paid_with_late_fee` DECIMAL(10,2) DEFAULT 0 COMMENT 'Mora pagada',

  -- Saldo
  `outstanding_principal` DECIMAL(10,2) COMMENT 'Capital pendiente después de esta cuota',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_schedule_loan` (`loan_id`),
  KEY `idx_schedule_due` (`due_date`),
  KEY `idx_schedule_status` (`status`),
  KEY `idx_schedule_overdue` (`status`, `due_date`),
  UNIQUE KEY `uk_loan_installment` (`loan_id`, `installment_number`),

  CONSTRAINT `fk_schedule_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedule_payment` FOREIGN KEY (`payment_id`) REFERENCES `loan_payment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12.3 loan_payment

Registro de pagos realizados con método, referencia bancaria y aplicación a cuotas.

```sql
CREATE TABLE `loan_payment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id` BIGINT UNSIGNED NOT NULL,
  `schedule_id` BIGINT UNSIGNED COMMENT 'Cuota específica que cubre (si aplica)',

  -- Detalles del pago
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Monto pagado',
  `payment_date` DATE NOT NULL COMMENT 'Fecha del pago',
  `payment_method` ENUM('cash', 'bank_transfer', 'yape', 'plin', 'credit_card', 'debit_card', 'auto_debit') NOT NULL,
  `reference_number` VARCHAR(100) COMMENT 'Número de operación bancaria',
  `external_id` VARCHAR(100) COMMENT 'ID externo del sistema de pagos',

  -- Estado
  `status` ENUM('pending', 'confirmed', 'rejected', 'reversed') DEFAULT 'pending',
  `confirmed_at` TIMESTAMP NULL,
  `confirmed_by` BIGINT UNSIGNED,

  -- Aplicación del pago
  `principal_applied` DECIMAL(10,2) COMMENT 'Monto aplicado a capital',
  `interest_applied` DECIMAL(10,2) COMMENT 'Monto aplicado a interés',
  `late_fee_applied` DECIMAL(10,2) COMMENT 'Monto aplicado a mora',
  `overpayment` DECIMAL(10,2) DEFAULT 0 COMMENT 'Excedente (adelanto)',

  -- Notas
  `notes` TEXT,
  `receipt_url` VARCHAR(500) COMMENT 'URL del comprobante',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_payment_loan` (`loan_id`),
  KEY `idx_payment_schedule` (`schedule_id`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_payment_status` (`status`),
  KEY `idx_payment_reference` (`reference_number`),
  KEY `idx_payment_method` (`payment_method`),

  CONSTRAINT `fk_payment_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `loan_schedule` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payment_confirmed` FOREIGN KEY (`confirmed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12.4 loan_status_history

Historial de cambios de estado del préstamo para auditoría y análisis.

```sql
CREATE TABLE `loan_status_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id` BIGINT UNSIGNED NOT NULL,
  `from_status` ENUM('active', 'delinquent', 'default', 'paid_off', 'refinanced', 'cancelled'),
  `to_status` ENUM('active', 'delinquent', 'default', 'paid_off', 'refinanced', 'cancelled') NOT NULL,
  `changed_by` BIGINT UNSIGNED COMMENT 'Usuario que realizó el cambio (NULL si automático)',
  `notes` TEXT COMMENT 'Razón del cambio',

  -- Snapshot al momento del cambio
  `days_past_due_at_change` INT COMMENT 'Días de atraso al momento del cambio',
  `overdue_amount_at_change` DECIMAL(10,2) COMMENT 'Monto vencido al momento del cambio',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_history_loan` (`loan_id`),
  KEY `idx_history_status` (`to_status`),
  KEY `idx_history_date` (`created_at`),
  KEY `idx_history_user` (`changed_by`),

  CONSTRAINT `fk_history_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 13. Módulo: Activaciones (Visitas Físicas a Sedes)

Sistema para gestionar y medir el desempeño de activaciones físicas en sedes de instituciones educativas.

### 13.1 activation_promoter

Promotores de campo que realizan activaciones.

```sql
CREATE TABLE `activation_promoter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(254),
  `phone` VARCHAR(20),
  `document_type` ENUM('dni', 'ce') DEFAULT 'dni',
  `document_number` VARCHAR(20),

  -- Asignación
  `region` VARCHAR(100),
  `department` VARCHAR(100),
  `supervisor_id` BIGINT UNSIGNED,

  -- Métricas acumuladas (desnormalizadas para reportes rápidos)
  `total_activations` INT DEFAULT 0,
  `total_leads` INT DEFAULT 0,
  `total_conversions` INT DEFAULT 0,
  `conversion_rate` DECIMAL(5,2),

  -- Estado
  `status` ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
  `hired_at` DATE,
  `terminated_at` DATE,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promoter_code` (`employee_code`),
  KEY `idx_promoter_status` (`status`),
  KEY `idx_promoter_region` (`region`),
  KEY `idx_promoter_supervisor` (`supervisor_id`),

  CONSTRAINT `fk_promoter_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `activation_promoter` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13.2 activation_period

Periodos de medición para comparativas.

```sql
CREATE TABLE `activation_period` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `type` ENUM('week', 'month', 'quarter', 'semester', 'year', 'campaign', 'custom') NOT NULL,

  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,

  -- Metas
  `target_activations` INT,
  `target_leads` INT,
  `target_applications` INT,
  `target_conversions` INT,
  `target_amount` DECIMAL(12,2),

  -- Estado
  `status` ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
  `notes` TEXT,

  -- Periodo anterior para comparativas
  `previous_period_id` BIGINT UNSIGNED,

  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period_code` (`code`),
  KEY `idx_period_dates` (`start_date`, `end_date`),
  KEY `idx_period_type` (`type`),
  KEY `idx_period_status` (`status`),

  CONSTRAINT `fk_period_previous` FOREIGN KEY (`previous_period_id`) REFERENCES `activation_period` (`id`),
  CONSTRAINT `fk_period_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13.3 activation_event

Eventos de activación (visitas físicas).

```sql
CREATE TABLE `activation_event` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,

  -- Ubicación
  `institution_id` BIGINT UNSIGNED,
  `campus_id` BIGINT UNSIGNED,
  `agreement_id` BIGINT UNSIGNED,

  -- Snapshots para histórico
  `institution_name` VARCHAR(200) NOT NULL,
  `campus_name` VARCHAR(200) NOT NULL,
  `campus_address` VARCHAR(300),
  `department` VARCHAR(100),
  `province` VARCHAR(100),
  `district` VARCHAR(100),

  -- Responsables
  `promoter_id` BIGINT UNSIGNED NOT NULL,
  `period_id` BIGINT UNSIGNED,

  -- Programación
  `scheduled_date` DATE NOT NULL,
  `scheduled_start_time` TIME,
  `scheduled_end_time` TIME,

  -- Ejecución real
  `actual_start_at` DATETIME,
  `actual_end_at` DATETIME,
  `duration_minutes` INT,

  -- Tipo
  `event_type` ENUM(
    'stand',
    'classroom_visit',
    'fair',
    'orientation_talk',
    'agreement_signing',
    'agreement_renewal',
    'follow_up',
    'other'
  ) NOT NULL DEFAULT 'stand',
  `description` TEXT,

  -- Estado
  `status` ENUM(
    'draft',
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'rescheduled'
  ) DEFAULT 'draft',
  `cancellation_reason` VARCHAR(500),
  `rescheduled_to_id` BIGINT UNSIGNED,

  -- Recursos
  `has_promotional_material` TINYINT(1) DEFAULT 0,
  `has_devices` TINYINT(1) DEFAULT 0,
  `team_size` TINYINT DEFAULT 1,
  `estimated_cost` DECIMAL(10,2),
  `actual_cost` DECIMAL(10,2),

  -- Evidencia
  `photos` JSON,
  `notes` TEXT,
  `contact_person` VARCHAR(200),
  `contact_phone` VARCHAR(20),

  `created_by` BIGINT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_code` (`code`),
  KEY `idx_event_institution` (`institution_id`),
  KEY `idx_event_campus` (`campus_id`),
  KEY `idx_event_agreement` (`agreement_id`),
  KEY `idx_event_promoter` (`promoter_id`),
  KEY `idx_event_period` (`period_id`),
  KEY `idx_event_date` (`scheduled_date`),
  KEY `idx_event_status` (`status`),
  KEY `idx_event_type` (`event_type`),

  CONSTRAINT `fk_event_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_event_campus` FOREIGN KEY (`campus_id`) REFERENCES `institution_campus` (`id`),
  CONSTRAINT `fk_event_agreement` FOREIGN KEY (`agreement_id`) REFERENCES `agreement` (`id`),
  CONSTRAINT `fk_event_promoter` FOREIGN KEY (`promoter_id`) REFERENCES `activation_promoter` (`id`),
  CONSTRAINT `fk_event_period` FOREIGN KEY (`period_id`) REFERENCES `activation_period` (`id`),
  CONSTRAINT `fk_event_rescheduled` FOREIGN KEY (`rescheduled_to_id`) REFERENCES `activation_event` (`id`),
  CONSTRAINT `fk_event_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13.4 activation_lead

Leads capturados en activaciones.

```sql
CREATE TABLE `activation_lead` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `activation_event_id` BIGINT UNSIGNED NOT NULL,

  -- Referencias a otras tablas si existen
  `lead_id` BIGINT UNSIGNED,
  `application_id` BIGINT UNSIGNED,

  -- Datos capturados
  `document_type` ENUM('dni', 'ce') DEFAULT 'dni',
  `document_number` VARCHAR(20),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `email` VARCHAR(254),
  `phone` VARCHAR(20),

  -- Contexto académico
  `career_name` VARCHAR(200),
  `study_cycle` VARCHAR(20),
  `is_graduating` TINYINT(1) DEFAULT 0,

  -- Interés
  `product_interest` VARCHAR(200),
  `product_id` BIGINT UNSIGNED,
  `budget_min` DECIMAL(10,2),
  `budget_max` DECIMAL(10,2),
  `urgency` ENUM('immediate', 'this_week', 'this_month', 'next_month', 'exploring') DEFAULT 'exploring',
  `has_existing_debt` TINYINT(1),

  -- Calificación del promotor
  `quality_rating` ENUM('hot', 'warm', 'cold') DEFAULT 'warm',
  `follow_up_priority` ENUM('high', 'medium', 'low') DEFAULT 'medium',
  `promoter_notes` TEXT,

  -- Estado del lead
  `status` ENUM(
    'captured',
    'contacted',
    'interested',
    'qualified',
    'application_started',
    'application_submitted',
    'approved',
    'disbursed',
    'lost',
    'invalid'
  ) DEFAULT 'captured',
  `lost_reason` VARCHAR(200),

  -- Timestamps
  `captured_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `first_contact_at` TIMESTAMP NULL,
  `qualified_at` TIMESTAMP NULL,
  `converted_at` TIMESTAMP NULL,

  `captured_by` BIGINT UNSIGNED,

  PRIMARY KEY (`id`),
  KEY `idx_act_lead_event` (`activation_event_id`),
  KEY `idx_act_lead_document` (`document_number`),
  KEY `idx_act_lead_status` (`status`),
  KEY `idx_act_lead_quality` (`quality_rating`),
  KEY `idx_act_lead_captured` (`captured_at`),

  CONSTRAINT `fk_act_lead_event` FOREIGN KEY (`activation_event_id`) REFERENCES `activation_event` (`id`),
  CONSTRAINT `fk_act_lead_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead` (`id`),
  CONSTRAINT `fk_act_lead_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_act_lead_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_act_lead_captured_by` FOREIGN KEY (`captured_by`) REFERENCES `activation_promoter` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13.5 activation_result

Resultados agregados por activación.

```sql
CREATE TABLE `activation_result` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `activation_event_id` BIGINT UNSIGNED NOT NULL,

  -- Métricas de captura
  `total_leads` INT DEFAULT 0,
  `leads_hot` INT DEFAULT 0,
  `leads_warm` INT DEFAULT 0,
  `leads_cold` INT DEFAULT 0,

  -- Métricas de seguimiento
  `leads_contacted` INT DEFAULT 0,
  `leads_interested` INT DEFAULT 0,
  `leads_qualified` INT DEFAULT 0,

  -- Métricas de conversión
  `applications_started` INT DEFAULT 0,
  `applications_submitted` INT DEFAULT 0,
  `applications_approved` INT DEFAULT 0,
  `applications_rejected` INT DEFAULT 0,
  `applications_disbursed` INT DEFAULT 0,

  -- Montos
  `total_amount_requested` DECIMAL(12,2) DEFAULT 0,
  `total_amount_approved` DECIMAL(12,2) DEFAULT 0,
  `total_amount_disbursed` DECIMAL(12,2) DEFAULT 0,
  `avg_ticket` DECIMAL(10,2),

  -- Tasas
  `contact_rate` DECIMAL(5,2),
  `interest_rate` DECIMAL(5,2),
  `qualification_rate` DECIMAL(5,2),
  `application_rate` DECIMAL(5,2),
  `approval_rate` DECIMAL(5,2),
  `conversion_rate` DECIMAL(5,2),

  -- Eficiencia
  `leads_per_hour` DECIMAL(5,2),
  `cost_per_lead` DECIMAL(10,2),
  `cost_per_conversion` DECIMAL(10,2),
  `roi` DECIMAL(10,2),

  `calculated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_result_event` (`activation_event_id`),

  CONSTRAINT `fk_result_event` FOREIGN KEY (`activation_event_id`) REFERENCES `activation_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13.6 activation_period_summary

Resumen por periodo para comparativas.

```sql
CREATE TABLE `activation_period_summary` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_id` BIGINT UNSIGNED NOT NULL,

  -- Dimensiones de agrupación (NULL = total)
  `institution_id` BIGINT UNSIGNED,
  `campus_id` BIGINT UNSIGNED,
  `promoter_id` BIGINT UNSIGNED,
  `department` VARCHAR(100),

  -- Métricas de activaciones
  `total_events` INT DEFAULT 0,
  `events_completed` INT DEFAULT 0,
  `events_cancelled` INT DEFAULT 0,
  `total_hours` DECIMAL(10,2) DEFAULT 0,
  `total_cost` DECIMAL(12,2) DEFAULT 0,

  -- Métricas de leads
  `total_leads` INT DEFAULT 0,
  `leads_contacted` INT DEFAULT 0,
  `leads_qualified` INT DEFAULT 0,

  -- Métricas de conversión
  `total_applications` INT DEFAULT 0,
  `total_approvals` INT DEFAULT 0,
  `total_conversions` INT DEFAULT 0,
  `total_amount_disbursed` DECIMAL(12,2) DEFAULT 0,

  -- Promedios
  `avg_leads_per_event` DECIMAL(5,2),
  `avg_conversions_per_event` DECIMAL(5,2),
  `avg_amount_per_conversion` DECIMAL(10,2),
  `avg_conversion_rate` DECIMAL(5,2),

  -- vs Metas
  `events_vs_target_pct` DECIMAL(5,2),
  `leads_vs_target_pct` DECIMAL(5,2),
  `conversions_vs_target_pct` DECIMAL(5,2),
  `amount_vs_target_pct` DECIMAL(5,2),

  -- vs Periodo anterior
  `events_growth_pct` DECIMAL(5,2),
  `leads_growth_pct` DECIMAL(5,2),
  `conversions_growth_pct` DECIMAL(5,2),
  `amount_growth_pct` DECIMAL(5,2),

  `calculated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_summary` (`period_id`, `institution_id`, `campus_id`, `promoter_id`, `department`),
  KEY `idx_summary_period` (`period_id`),
  KEY `idx_summary_institution` (`institution_id`),
  KEY `idx_summary_campus` (`campus_id`),
  KEY `idx_summary_promoter` (`promoter_id`),

  CONSTRAINT `fk_summary_period` FOREIGN KEY (`period_id`) REFERENCES `activation_period` (`id`),
  CONSTRAINT `fk_summary_institution` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  CONSTRAINT `fk_summary_campus` FOREIGN KEY (`campus_id`) REFERENCES `institution_campus` (`id`),
  CONSTRAINT `fk_summary_promoter` FOREIGN KEY (`promoter_id`) REFERENCES `activation_promoter` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12.7 Queries de Análisis

**Desempeño por sede:**
```sql
SELECT
  i.name as institucion,
  ic.name as sede,
  ic.department,
  COUNT(DISTINCT ae.id) as activaciones,
  SUM(ar.total_leads) as leads,
  SUM(ar.applications_disbursed) as conversiones,
  SUM(ar.total_amount_disbursed) as monto,
  AVG(ar.conversion_rate) as tasa_conversion
FROM activation_event ae
JOIN institution i ON i.id = ae.institution_id
JOIN institution_campus ic ON ic.id = ae.campus_id
LEFT JOIN activation_result ar ON ar.activation_event_id = ae.id
WHERE ae.status = 'completed'
GROUP BY i.id, ic.id
ORDER BY conversiones DESC;
```

**Comparativo por periodos:**
```sql
SELECT
  p.code as periodo,
  p.name,
  ps.total_events as activaciones,
  ps.total_leads as leads,
  ps.total_conversions as conversiones,
  ps.total_amount_disbursed as monto,
  CONCAT(ROUND(ps.events_vs_target_pct, 1), '%') as cumpl_eventos,
  CONCAT(ROUND(ps.conversions_vs_target_pct, 1), '%') as cumpl_conversiones,
  CONCAT(IF(ps.conversions_growth_pct >= 0, '+', ''), ROUND(ps.conversions_growth_pct, 1), '%') as var_conversiones
FROM activation_period p
JOIN activation_period_summary ps ON ps.period_id = p.id
WHERE ps.institution_id IS NULL
  AND ps.campus_id IS NULL
  AND ps.promoter_id IS NULL
  AND ps.department IS NULL
ORDER BY p.start_date DESC;
```

**Ranking de promotores:**
```sql
SELECT
  CONCAT(ap.first_name, ' ', ap.last_name) as promotor,
  ap.region,
  COUNT(ae.id) as activaciones,
  SUM(ar.total_leads) as leads,
  SUM(ar.applications_disbursed) as conversiones,
  SUM(ar.total_amount_disbursed) as monto,
  AVG(ar.conversion_rate) as tasa_conversion
FROM activation_promoter ap
JOIN activation_event ae ON ae.promoter_id = ap.id
LEFT JOIN activation_result ar ON ar.activation_event_id = ae.id
WHERE ae.status = 'completed'
GROUP BY ap.id
ORDER BY conversiones DESC;
```

---

## 13. Resumen de Tablas

| # | Módulo | Tabla | Descripción |
|---|--------|-------|-------------|
| 1 | Core | institution | Instituciones educativas |
| 2 | Core | institution_campus | Sedes |
| 3 | Core | career | Carreras |
| 4 | Core | agreement | Convenios |
| 5 | Core | user_account | Usuarios backoffice |
| 6 | Products | brand | Marcas |
| 7 | Products | product | Productos base |
| 8 | Products | product_spec | Especificaciones técnicas |
| 9 | Products | product_image | Imágenes |
| 10 | Products | product_pricing | Precios por plazo |
| 11 | Products | accessory | Accesorios |
| 12 | Products | insurance | Seguros |
| 13 | Products | combo | Combos |
| 14 | Products | combo_item | Items de combo |
| 15 | Landing | landing_template | Templates base |
| 16 | Landing | landing | Configuración de landings |
| 17 | Landing | landing_inheritance | Herencia |
| 18 | Landing | feature_definition | Catálogo de features |
| 19 | Landing | landing_feature | Feature flags por landing |
| 20 | Landing | landing_promotion | Promociones/modales |
| 21 | Landing | landing_product | Productos por landing |
| 22 | Landing | landing_accessory | Accesorios por landing |
| 23 | Landing | landing_insurance | Seguros por landing |
| 24 | Landing | promotion | Catálogo de promociones |
| 25 | Landing | landing_product_promotion | Promociones por producto/landing |
| 26 | Form | form_step | Pasos del formulario |
| 27 | Form | form_field_group | Grupos de campos |
| 28 | Form | form_field | Catálogo de campos |
| 29 | Form | landing_step | Pasos por landing |
| 30 | Form | landing_field | Campos por landing |
| 31 | Form | field_validation | Validaciones |
| 32 | Form | field_option | Opciones select/radio |
| 33 | Form | field_dependency | Dependencias entre campos |
| 34 | Filters | filter_definition | Definición de filtros |
| 35 | Filters | filter_value | Valores de filtros |
| 36 | Filters | landing_filter | Filtros por landing |
| 37 | Filters | sort_option | Opciones de ordenamiento |
| 38 | Tracking | session | Sesiones |
| 39 | Tracking | page_view | Vistas de página |
| 40 | Tracking | event_scroll | Eventos scroll |
| 41 | Tracking | event_click | Eventos click |
| 42 | Tracking | event_hover | Eventos hover |
| 43 | Tracking | event_input | Eventos input |
| 44 | Tracking | event_filter | Eventos filtro |
| 45 | Tracking | event_product | Eventos producto |
| 46 | Tracking | event_modal | Eventos modal |
| 47 | Tracking | event_form | Eventos formulario |
| 48 | Tracking | event_navigation | Eventos navegación |
| 49 | Tracking | event_error | Eventos error |
| 50 | Tracking | event_custom | Eventos custom |
| 51 | Person/Application | person | Persona única (maestro) |
| 52 | Person/Application | person_contact_history | Histórico contactos |
| 53 | Person/Application | person_address_history | Histórico direcciones |
| 54 | Person/Application | person_academic_history | Histórico académico |
| 55 | Person/Application | person_employment_history | Histórico laboral |
| 56 | Person/Application | person_financial_history | Histórico financiero |
| 57 | Person/Application | person_equifax_history | Historial consultas Equifax |
| 58 | Person/Application | person_reference | Referencias personales |
| 59 | Person/Application | document_type | Catálogo tipos documento |
| 60 | Person/Application | person_document | Documentos con versionado |
| 61 | Person/Application | application | Solicitudes |
| 62 | Person/Application | application_product | Productos de solicitud |
| 63 | Person/Application | application_document | Link doc-solicitud |
| 64 | Person/Application | application_status_log | Historial estados |
| 65 | Person/Application | daily_product_catalog_snapshot | Snapshot diario productos |
| 66 | Person/Application | session_product_view | Productos vistos por sesión |
| 67 | Leads | lead | Leads de sesiones abandonadas |
| 68 | Leads | lead_score_rule | Reglas de scoring de leads |
| 69 | Leads | lead_interaction | Interacciones con leads |
| 70 | Leads | lead_recovery_campaign | Campañas de recuperación |
| 71 | Leads | lead_campaign_send | Envíos de campañas |
| 72 | Marketing | preapproved_customer | Clientes preaprobados |
| 73 | Marketing | preapproved_import | Log de importaciones |
| 74 | Marketing | marketing_campaign | Campañas de marketing |
| 75 | Marketing | marketing_campaign_send | Envíos de campañas |
| 76 | Marketing | traffic_source_config | Configuración de tráfico |
| 77 | Marketing | referral_program | Programas de referidos |
| 78 | Marketing | referral | Referidos individuales |
| 79 | Activaciones | activation_promoter | Promotores de campo |
| 80 | Activaciones | activation_period | Periodos de medición |
| 81 | Activaciones | activation_event | Eventos de activación |
| 82 | Activaciones | activation_lead | Leads de activaciones |
| 83 | Activaciones | activation_result | Resultados por activación |
| 84 | Activaciones | activation_period_summary | Resumen por periodo |

**Total: 84 tablas**

---

## 14. Comparativa: Compatible vs Rediseño

| Aspecto | Compatible | Rediseño |
|---------|------------|----------|
| Tablas nuevas | 44 | 84 |
| Compatibilidad | 100% con existentes | Nueva arquitectura |
| Migración | Incremental | Requiere ETL completo |
| Normalización | Parcial | Completa |
| Persona/Solicitud | Se mantiene (~200 cols) | 15 tablas con versionado de datos |
| Tabla producto | Se mantiene + producto_spec | Normalizada completamente |
| Documentos | Vinculados a solicitud | Sistema propio con versionado y OCR |
| Performance | Buena | Óptima |
| Mantenibilidad | Media | Alta |
| Riesgo | Bajo | Medio-Alto |
| UTM Tracking | Sí - en ld_session | Sí - en session + traffic_source_config |
| Leads | Sí - 5 tablas | Sí - 5 tablas |
| Marketing/Preaprobados | Sí - 7 tablas | Sí - 7 tablas |
| Histórico productos | No | Sí - snapshot diario + vista por sesión |
| Activaciones | Sí - 6 tablas | Sí - 6 tablas |

---

## 15. Referencia Rápida: Estructura de Tablas (Sin Índices)

Versión simplificada de todas las tablas para referencia rápida.

### 14.1 Core

```sql
-- institution: Instituciones educativas
CREATE TABLE institution (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50),
  type ENUM('universidad', 'instituto', 'colegio', 'cetpro', 'idiomas', 'otro') NOT NULL,
  management ENUM('publica', 'privada') NOT NULL,
  is_licensed TINYINT(1) DEFAULT 0,
  logo_url VARCHAR(500),
  woe_score DECIMAL(12,10),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- institution_campus: Sedes
CREATE TABLE institution_campus (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(30),
  address VARCHAR(300),
  district VARCHAR(100),
  province VARCHAR(100),
  department VARCHAR(100),
  is_main TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

-- agreement: Convenios con instituciones
CREATE TABLE agreement (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  type ENUM('exclusivo', 'preferente', 'standard') DEFAULT 'standard',
  discount_percentage DECIMAL(5,2),
  special_tea DECIMAL(5,2),
  commission_rate DECIMAL(5,2),
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active TINYINT(1) DEFAULT 1
);

-- career: Carreras profesionales
CREATE TABLE career (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  normalized_name VARCHAR(200) NOT NULL,
  field VARCHAR(100),
  woe_score DECIMAL(12,10),
  is_active TINYINT(1) DEFAULT 1
);
```

### 14.2 Products

```sql
-- brand: Marcas
CREATE TABLE brand (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

-- product: Productos base
CREATE TABLE product (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  brand_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  type ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio', 'seguro') NOT NULL,
  condition ENUM('nueva', 'reacondicionada', 'open_box') DEFAULT 'nueva',
  description TEXT,
  purchase_price DECIMAL(10,2),
  list_price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'PEN',
  is_active TINYINT(1) DEFAULT 1,
  is_featured TINYINT(1) DEFAULT 0,
  available_from DATE,
  available_until DATE
);

-- spec_definition: Catálogo de especificaciones (Modelo EAV)
CREATE TABLE spec_definition (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(300),
  data_type ENUM('string', 'number', 'boolean') NOT NULL,
  unit VARCHAR(20),
  icon VARCHAR(50),
  is_filterable TINYINT(1) DEFAULT 0,
  is_comparable TINYINT(1) DEFAULT 0,
  is_highlight TINYINT(1) DEFAULT 0,
  display_order INT DEFAULT 0,
  group_code VARCHAR(50),
  group_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

-- spec_product_type: Relación specs-tipos (sin JSON)
CREATE TABLE spec_product_type (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  spec_definition_id BIGINT UNSIGNED NOT NULL,
  product_type ENUM('laptop', 'celular', 'tablet', 'moto', 'accesorio') NOT NULL,
  UNIQUE KEY uk_spec_type (spec_definition_id, product_type)
);

-- product_spec_value: Valores de especificaciones por producto (Modelo EAV)
CREATE TABLE product_spec_value (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  spec_definition_id BIGINT UNSIGNED NOT NULL,
  value_string VARCHAR(255),
  value_number DECIMAL(12,4),
  value_boolean TINYINT(1),
  UNIQUE KEY uk_product_spec (product_id, spec_definition_id)
);

-- tag: Etiquetas para agrupar productos
CREATE TABLE tag (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(300),
  tag_type ENUM('categoria', 'marca', 'promocion', 'campana', 'temporal', 'caracteristica') NOT NULL,
  color VARCHAR(7),
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_visible TINYINT(1) DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  valid_from DATE,
  valid_until DATE
);

-- product_tag: Relación productos-tags
CREATE TABLE product_tag (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  display_order INT DEFAULT 0,
  UNIQUE KEY uk_product_tag (product_id, tag_id)
);

-- product_pricing: Precios por plazo
CREATE TABLE product_pricing (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  term_months INT NOT NULL,
  monthly_payment DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tea DECIMAL(5,2),
  is_active TINYINT(1) DEFAULT 1,
  valid_from DATE,
  valid_until DATE
);

-- combo: Combos de productos
CREATE TABLE combo (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  combo_type ENUM('laptop_accesorios', 'celular_plan', 'moto_casco', 'custom') NOT NULL,
  base_product_id BIGINT UNSIGNED,
  total_list_price DECIMAL(10,2),
  combo_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2),
  is_active TINYINT(1) DEFAULT 1,
  available_from DATE,
  available_until DATE
);
```

### 14.3 Landing Configuration

```sql
-- landing_template: Templates base
CREATE TABLE landing_template (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  layout_type ENUM('standard', 'minimal', 'catalog_focus', 'form_focus', 'promo') DEFAULT 'standard',
  default_theme JSON,
  default_seo JSON,
  is_active TINYINT(1) DEFAULT 1
);

-- landing: Configuración de landings
CREATE TABLE landing (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id BIGINT UNSIGNED,
  agreement_id BIGINT UNSIGNED,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  page_title VARCHAR(200),
  meta_description VARCHAR(500),
  hero_config JSON,
  theme_overrides JSON,
  feature_flags JSON,
  analytics_config JSON,
  status ENUM('draft', 'active', 'paused', 'archived') DEFAULT 'draft',
  valid_from DATETIME,
  valid_until DATETIME
);

-- landing_inheritance: Herencia de configuración
CREATE TABLE landing_inheritance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  child_landing_id BIGINT UNSIGNED NOT NULL,
  parent_landing_id BIGINT UNSIGNED NOT NULL,
  inheritance_type ENUM('full', 'selective') DEFAULT 'selective',
  inherit_theme TINYINT(1) DEFAULT 1,
  inherit_steps TINYINT(1) DEFAULT 1,
  inherit_fields TINYINT(1) DEFAULT 1,
  inherit_products TINYINT(1) DEFAULT 0,
  inherit_pricing TINYINT(1) DEFAULT 0,
  priority INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

-- landing_product: Productos disponibles por landing
CREATE TABLE landing_product (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  landing_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  display_order INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  custom_price DECIMAL(10,2),
  custom_badge VARCHAR(50),
  is_active TINYINT(1) DEFAULT 1
);
```

### 14.4 Form Builder

```sql
-- form_step: Catálogo de pasos
CREATE TABLE form_step (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(50),
  default_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

-- form_field: Catálogo de campos
CREATE TABLE form_field (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  field_type ENUM('text', 'number', 'email', 'phone', 'date', 'select', 'radio', 'checkbox', 'textarea', 'file', 'hidden', 'autocomplete') NOT NULL,
  data_type ENUM('string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'json') DEFAULT 'string',
  default_label VARCHAR(200),
  default_placeholder VARCHAR(200),
  default_help_text VARCHAR(500),
  default_error_message VARCHAR(200),
  applicant_column VARCHAR(100),
  is_pii TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

-- landing_step: Pasos habilitados por landing
CREATE TABLE landing_step (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  landing_id BIGINT UNSIGNED NOT NULL,
  form_step_id BIGINT UNSIGNED NOT NULL,
  step_order INT NOT NULL,
  custom_title VARCHAR(200),
  custom_description VARCHAR(500),
  is_required TINYINT(1) DEFAULT 1,
  is_visible TINYINT(1) DEFAULT 1,
  visibility_conditions JSON,
  is_active TINYINT(1) DEFAULT 1
);

-- landing_field: Campos habilitados por landing/paso
CREATE TABLE landing_field (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  landing_step_id BIGINT UNSIGNED NOT NULL,
  form_field_id BIGINT UNSIGNED NOT NULL,
  field_order INT NOT NULL,
  custom_label VARCHAR(200),
  custom_placeholder VARCHAR(200),
  custom_help_text VARCHAR(500),
  default_value VARCHAR(500),
  is_required TINYINT(1) DEFAULT 0,
  is_visible TINYINT(1) DEFAULT 1,
  is_readonly TINYINT(1) DEFAULT 0,
  is_disabled TINYINT(1) DEFAULT 0,
  visibility_conditions JSON,
  validation_rules JSON
);

-- field_dependency: Dependencias entre campos
CREATE TABLE field_dependency (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  landing_field_id BIGINT UNSIGNED NOT NULL,
  depends_on_field_id BIGINT UNSIGNED NOT NULL,
  condition_type ENUM('equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in_list', 'is_empty', 'is_not_empty') NOT NULL,
  condition_value VARCHAR(500),
  action ENUM('show', 'hide', 'enable', 'disable', 'require', 'unrequire', 'set_value', 'clear_value') NOT NULL,
  action_value VARCHAR(500)
);
```

### 14.5 Event Tracking

```sql
-- session: Sesiones de usuario
CREATE TABLE session (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  landing_id BIGINT UNSIGNED,
  application_id BIGINT UNSIGNED,
  fingerprint VARCHAR(64),
  ip_address VARCHAR(45),
  country CHAR(2),
  city VARCHAR(100),
  device_type ENUM('desktop', 'tablet', 'mobile') NOT NULL,
  os VARCHAR(50),
  browser VARCHAR(50),
  screen_width SMALLINT,
  screen_height SMALLINT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(200),
  utm_term VARCHAR(200),
  utm_content VARCHAR(200),
  gclid VARCHAR(100),
  fbclid VARCHAR(100),
  ttclid VARCHAR(100),
  traffic_source ENUM('organic_search', 'paid_search', 'organic_social', 'paid_social', 'display', 'retargeting', 'email', 'sms', 'push_notification', 'affiliate', 'referral', 'direct', 'preapproved', 'qr_code', 'offline', 'other') DEFAULT 'direct',
  referrer VARCHAR(2000),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  duration_seconds INT,
  page_views SMALLINT DEFAULT 0,
  max_step_reached VARCHAR(50),
  status ENUM('active', 'idle', 'bounced', 'abandoned', 'converted') DEFAULT 'active'
);

-- page_view: Vistas de página
CREATE TABLE page_view (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(2000) NOT NULL,
  path VARCHAR(500) NOT NULL,
  title VARCHAR(500),
  step_code VARCHAR(50),
  entered_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
  exited_at TIMESTAMP(3) NULL,
  duration_ms INT,
  max_scroll_percent TINYINT DEFAULT 0
);

-- event_click: Eventos de click
CREATE TABLE event_click (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_view_id BIGINT UNSIGNED NOT NULL,
  element_type VARCHAR(50),
  element_id VARCHAR(100),
  element_text VARCHAR(500),
  element_href VARCHAR(1000),
  position_x SMALLINT,
  position_y SMALLINT,
  clicked_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- event_form: Progreso de formulario
CREATE TABLE event_form (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  step_code VARCHAR(50) NOT NULL,
  action ENUM('view', 'start', 'field_focus', 'field_blur', 'validation_error', 'submit_attempt', 'submit_success', 'submit_error', 'abandon', 'complete') NOT NULL,
  field_code VARCHAR(50),
  error_message VARCHAR(500),
  time_spent_ms INT,
  occurred_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- event_input: Métricas detalladas de input
CREATE TABLE event_input (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_view_id BIGINT UNSIGNED NOT NULL,
  field_code VARCHAR(50) NOT NULL,
  focus_count INT DEFAULT 0,
  change_count INT DEFAULT 0,
  total_focus_time_ms INT DEFAULT 0,
  time_to_first_input_ms INT,
  time_to_complete_ms INT,
  final_value_length INT,
  had_validation_error TINYINT(1) DEFAULT 0,
  validation_error_count INT DEFAULT 0
);
```

### 14.6 Application

```sql
-- applicant: Solicitantes (datos personales)
CREATE TABLE applicant (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_type ENUM('dni', 'ce', 'pasaporte') NOT NULL,
  document_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  second_last_name VARCHAR(100),
  birth_date DATE,
  gender ENUM('M', 'F', 'O'),
  nationality CHAR(2) DEFAULT 'PE',
  marital_status ENUM('soltero', 'casado', 'conviviente', 'divorciado', 'viudo'),
  education_level ENUM('primaria', 'secundaria', 'tecnico', 'universitario', 'postgrado'),
  is_pep TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (document_type, document_number)
);

-- applicant_contact: Información de contacto
CREATE TABLE applicant_contact (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  applicant_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone_mobile VARCHAR(20) NOT NULL,
  phone_home VARCHAR(20),
  phone_work VARCHAR(20),
  whatsapp VARCHAR(20),
  preferred_contact_method ENUM('email', 'phone', 'whatsapp') DEFAULT 'whatsapp',
  contact_schedule VARCHAR(100),
  is_verified_email TINYINT(1) DEFAULT 0,
  is_verified_phone TINYINT(1) DEFAULT 0
);

-- application: Solicitudes
CREATE TABLE application (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  applicant_id BIGINT UNSIGNED NOT NULL,
  session_id BIGINT UNSIGNED,
  landing_id BIGINT UNSIGNED,
  agreement_id BIGINT UNSIGNED,
  preapproved_id BIGINT UNSIGNED,
  institution_id BIGINT UNSIGNED,
  campus_id BIGINT UNSIGNED,
  career_id BIGINT UNSIGNED,
  study_cycle VARCHAR(20),
  requested_amount DECIMAL(10,2) NOT NULL,
  requested_term INT NOT NULL,
  monthly_payment DECIMAL(10,2),
  tea DECIMAL(5,2),
  status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled', 'expired', 'disbursed') DEFAULT 'draft',
  risk_score DECIMAL(5,2),
  risk_category ENUM('A', 'B', 'C', 'D', 'E'),
  submitted_at TIMESTAMP NULL,
  decided_at TIMESTAMP NULL,
  disbursed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- application_product: Productos de la solicitud
CREATE TABLE application_product (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED,
  combo_id BIGINT UNSIGNED,
  product_type ENUM('main', 'accessory', 'insurance', 'combo') NOT NULL,
  quantity TINYINT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL
);
```

### 14.7 Leads

```sql
-- lead: Leads de sesiones abandonadas
CREATE TABLE lead (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL UNIQUE,
  landing_id BIGINT UNSIGNED,
  agreement_id BIGINT UNSIGNED,
  email VARCHAR(254),
  phone VARCHAR(20),
  document_number VARCHAR(20),
  first_name VARCHAR(100),
  institution_id BIGINT UNSIGNED,
  product_id BIGINT UNSIGNED,
  product_name VARCHAR(200),
  intended_amount DECIMAL(10,2),
  last_step_code VARCHAR(50),
  form_completion_percent TINYINT DEFAULT 0,
  status ENUM('new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost', 'invalid') DEFAULT 'new',
  quality_score TINYINT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  temperature ENUM('cold', 'warm', 'hot') DEFAULT 'warm',
  traffic_source VARCHAR(50),
  utm_source VARCHAR(100),
  utm_campaign VARCHAR(200),
  abandoned_at TIMESTAMP NOT NULL,
  assigned_to BIGINT UNSIGNED,
  next_action_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- lead_score_rule: Reglas de scoring
CREATE TABLE lead_score_rule (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  field VARCHAR(100) NOT NULL,
  operator ENUM('equals', 'not_equals', 'greater_than', 'less_than', 'between', 'contains', 'is_null', 'is_not_null') NOT NULL,
  value VARCHAR(500) NOT NULL,
  score_points INT NOT NULL,
  priority_boost ENUM('none', 'low', 'medium', 'high') DEFAULT 'none',
  is_active TINYINT(1) DEFAULT 1,
  display_order INT DEFAULT 0
);

-- lead_interaction: Interacciones con leads
CREATE TABLE lead_interaction (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('call_outbound', 'call_inbound', 'email_sent', 'sms_sent', 'whatsapp_sent', 'meeting', 'note', 'status_change') NOT NULL,
  status ENUM('completed', 'no_answer', 'busy', 'scheduled', 'cancelled') DEFAULT 'completed',
  duration_seconds INT,
  content TEXT,
  outcome VARCHAR(200),
  old_lead_status VARCHAR(50),
  new_lead_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- lead_recovery_campaign: Campañas de recuperación
CREATE TABLE lead_recovery_campaign (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  target_statuses JSON,
  min_quality_score TINYINT,
  max_quality_score TINYINT,
  channel ENUM('email', 'sms', 'whatsapp', 'push', 'retargeting') NOT NULL,
  send_delay_hours INT DEFAULT 1,
  max_sends_per_lead INT DEFAULT 3,
  status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
  leads_targeted INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14.8 Marketing & Preaprobados

```sql
-- preapproved_customer: Clientes preaprobados
CREATE TABLE preapproved_customer (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_type ENUM('dni', 'ce', 'pasaporte') NOT NULL,
  document_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(254),
  phone VARCHAR(20),
  source ENUM('bureau', 'existing_customer', 'partner', 'campaign', 'referral', 'institution') NOT NULL,
  risk_score DECIMAL(5,2),
  risk_category ENUM('A', 'B', 'C', 'D', 'E'),
  max_amount DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2),
  special_rate DECIMAL(5,2),
  offer_code VARCHAR(50) UNIQUE,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  status ENUM('active', 'contacted', 'interested', 'applied', 'converted', 'declined', 'expired', 'revoked') DEFAULT 'active',
  landing_visits INT DEFAULT 0,
  session_id BIGINT UNSIGNED,
  application_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- marketing_campaign: Campañas de marketing
CREATE TABLE marketing_campaign (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  type ENUM('preapproved_outreach', 'retargeting', 'seasonal', 'product_launch', 'referral', 'loyalty', 'winback', 'awareness') NOT NULL,
  primary_channel ENUM('email', 'sms', 'whatsapp', 'push', 'paid_media', 'organic_social', 'offline') NOT NULL,
  landing_id BIGINT UNSIGNED,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(200),
  start_date DATE NOT NULL,
  end_date DATE,
  budget_amount DECIMAL(12,2),
  status ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
  audience_size INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- referral_program: Programas de referidos
CREATE TABLE referral_program (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  referrer_reward_type ENUM('cash', 'discount', 'gift', 'points') NOT NULL,
  referrer_reward_value DECIMAL(10,2) NOT NULL,
  referee_reward_type ENUM('cash', 'discount', 'gift', 'points'),
  referee_reward_value DECIMAL(10,2),
  max_referrals_per_user INT,
  valid_from DATE NOT NULL,
  valid_until DATE,
  status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
  total_referrals INT DEFAULT 0,
  successful_conversions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- referral: Referidos individuales
CREATE TABLE referral (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_id BIGINT UNSIGNED NOT NULL,
  referrer_application_id BIGINT UNSIGNED,
  referrer_code VARCHAR(20) NOT NULL UNIQUE,
  referee_email VARCHAR(254),
  referee_phone VARCHAR(20),
  referee_session_id BIGINT UNSIGNED,
  referee_application_id BIGINT UNSIGNED,
  status ENUM('pending', 'clicked', 'registered', 'applied', 'approved', 'disbursed', 'reward_pending', 'reward_paid', 'expired', 'invalid') DEFAULT 'pending',
  referrer_reward_amount DECIMAL(10,2),
  referrer_reward_paid_at TIMESTAMP NULL,
  referee_reward_amount DECIMAL(10,2),
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  clicked_at TIMESTAMP NULL,
  converted_at TIMESTAMP NULL
);

-- traffic_source_config: Configuración de fuentes de tráfico
CREATE TABLE traffic_source_config (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  traffic_source ENUM('organic_search', 'paid_search', 'organic_social', 'paid_social', 'display', 'retargeting', 'email', 'sms', 'push_notification', 'affiliate', 'referral', 'direct', 'preapproved', 'qr_code', 'offline', 'other') NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  detection_rules JSON,
  default_cpc DECIMAL(6,2),
  default_cpm DECIMAL(6,2),
  attribution_weight DECIMAL(3,2) DEFAULT 1.00,
  conversion_window_days INT DEFAULT 30,
  is_active TINYINT(1) DEFAULT 1
);
```

---

## 16. Data de Ejemplo (Seeds)

Data de ejemplo para las nuevas tablas del modelo EAV y sistema de tags.

### 16.1 spec_definition (Catálogo de especificaciones)

```sql
-- Sin columna JSON, los tipos de producto van en spec_product_type
INSERT INTO spec_definition (id, code, name, data_type, unit, is_filterable, is_comparable, is_highlight, group_code, group_order, display_order) VALUES
-- Gama (aplica a todos los productos)
(1, 'gama', 'Gama', 'string', NULL, 1, 1, 1, 'general', 1, 1),

-- Procesador
(2, 'processor_brand', 'Marca Procesador', 'string', NULL, 1, 1, 1, 'procesador', 1, 10),
(3, 'processor_family', 'Familia Procesador', 'string', NULL, 1, 1, 1, 'procesador', 2, 11),
(4, 'processor_model', 'Modelo Procesador', 'string', NULL, 0, 1, 0, 'procesador', 3, 12),
(5, 'processor_cores', 'Núcleos', 'number', 'cores', 0, 1, 0, 'procesador', 4, 13),
(6, 'processor_generation', 'Generación', 'number', NULL, 1, 1, 0, 'procesador', 5, 14),

-- Memoria RAM
(7, 'ram_gb', 'Memoria RAM', 'number', 'GB', 1, 1, 1, 'memoria', 1, 20),
(8, 'ram_type', 'Tipo RAM', 'string', NULL, 0, 1, 0, 'memoria', 2, 21),
(9, 'ram_expandable', 'RAM Expandible', 'boolean', NULL, 0, 1, 0, 'memoria', 3, 22),

-- Almacenamiento
(10, 'storage_ssd_gb', 'Disco SSD', 'number', 'GB', 1, 1, 1, 'almacenamiento', 1, 30),
(11, 'storage_hdd_gb', 'Disco HDD', 'number', 'GB', 0, 1, 0, 'almacenamiento', 2, 31),
(12, 'storage_type', 'Tipo Almacenamiento', 'string', NULL, 0, 1, 0, 'almacenamiento', 3, 32),

-- Pantalla
(13, 'screen_size', 'Tamaño Pantalla', 'number', 'pulgadas', 1, 1, 1, 'pantalla', 1, 40),
(14, 'screen_resolution', 'Resolución', 'string', NULL, 0, 1, 0, 'pantalla', 2, 41),
(15, 'screen_type', 'Tipo Panel', 'string', NULL, 0, 1, 0, 'pantalla', 3, 42),
(16, 'screen_refresh_rate', 'Tasa Refresco', 'number', 'Hz', 0, 1, 0, 'pantalla', 4, 43),
(17, 'screen_touch', 'Pantalla Táctil', 'boolean', NULL, 1, 1, 0, 'pantalla', 5, 44),

-- Gráficos
(18, 'graphics_type', 'Tipo Gráficos', 'string', NULL, 1, 1, 1, 'graficos', 1, 50),
(19, 'graphics_brand', 'Marca GPU', 'string', NULL, 1, 1, 0, 'graficos', 2, 51),
(20, 'graphics_model', 'Modelo GPU', 'string', NULL, 0, 1, 0, 'graficos', 3, 52),
(21, 'graphics_vram', 'VRAM', 'number', 'GB', 0, 1, 0, 'graficos', 4, 53),

-- Sistema Operativo
(22, 'os_name', 'Sistema Operativo', 'string', NULL, 1, 1, 0, 'sistema', 1, 60),
(23, 'os_version', 'Versión SO', 'string', NULL, 0, 1, 0, 'sistema', 2, 61),

-- Especificaciones para MOTOS
(24, 'cilindrada', 'Cilindrada', 'number', 'cc', 1, 1, 1, 'motor', 1, 100),
(25, 'tipo_moto', 'Tipo de Moto', 'string', NULL, 1, 1, 1, 'general', 2, 101),
(26, 'tipo_uso', 'Tipo de Uso', 'string', NULL, 1, 1, 1, 'general', 3, 102),
(27, 'potencia_hp', 'Potencia', 'number', 'HP', 0, 1, 1, 'motor', 2, 103),
(28, 'torque', 'Torque', 'number', 'Nm', 0, 1, 0, 'motor', 3, 104),
(29, 'tipo_motor', 'Tipo Motor', 'string', NULL, 0, 1, 0, 'motor', 4, 105),
(30, 'transmision', 'Transmisión', 'string', NULL, 0, 1, 0, 'motor', 5, 106),
(31, 'freno_delantero', 'Freno Delantero', 'string', NULL, 0, 1, 0, 'frenos', 1, 107),
(32, 'freno_trasero', 'Freno Trasero', 'string', NULL, 0, 1, 0, 'frenos', 2, 108),
(33, 'capacidad_tanque', 'Capacidad Tanque', 'number', 'L', 0, 1, 0, 'combustible', 1, 109),
(34, 'rendimiento_km_l', 'Rendimiento', 'number', 'km/L', 0, 1, 1, 'combustible', 2, 110),

-- Especificaciones para CELULARES
(35, 'camara_principal', 'Cámara Principal', 'number', 'MP', 1, 1, 1, 'camara', 1, 200),
(36, 'camara_frontal', 'Cámara Frontal', 'number', 'MP', 0, 1, 0, 'camara', 2, 201),
(37, 'bateria_mah', 'Batería', 'number', 'mAh', 0, 1, 1, 'bateria', 1, 202),
(38, 'carga_rapida', 'Carga Rápida', 'boolean', NULL, 1, 1, 0, 'bateria', 2, 203),
(39, 'sim_type', 'Tipo SIM', 'string', NULL, 0, 1, 0, 'conectividad', 1, 204),
(40, 'tiene_5g', '5G', 'boolean', NULL, 1, 1, 1, 'conectividad', 2, 205);
```

### 16.2 spec_product_type (Relación specs-tipos sin JSON)

```sql
-- gama (id=1) aplica a todos
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(1, 'laptop'), (1, 'celular'), (1, 'tablet'), (1, 'moto');

-- Specs de procesador (2-6) → laptop, tablet
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(2, 'laptop'), (2, 'tablet'),
(3, 'laptop'), (3, 'tablet'),
(4, 'laptop'), (4, 'tablet'),
(5, 'laptop'), (5, 'tablet'),
(6, 'laptop'), (6, 'tablet');

-- Specs de RAM (7-9) → laptop, tablet, celular (solo ram_gb)
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(7, 'laptop'), (7, 'tablet'), (7, 'celular'),
(8, 'laptop'), (8, 'tablet'),
(9, 'laptop');

-- Specs de almacenamiento (10-12) → laptop, tablet
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(10, 'laptop'), (10, 'tablet'),
(11, 'laptop'),
(12, 'laptop'), (12, 'tablet'), (12, 'celular');

-- Specs de pantalla (13-17)
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(13, 'laptop'), (13, 'tablet'), (13, 'celular'),
(14, 'laptop'), (14, 'tablet'), (14, 'celular'),
(15, 'laptop'), (15, 'tablet'), (15, 'celular'),
(16, 'laptop'), (16, 'celular'),
(17, 'laptop');

-- Specs de gráficos (18-21) → solo laptop
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(18, 'laptop'), (19, 'laptop'), (20, 'laptop'), (21, 'laptop');

-- Specs de SO (22-23) → laptop, tablet, celular
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(22, 'laptop'), (22, 'tablet'), (22, 'celular'),
(23, 'laptop'), (23, 'tablet'), (23, 'celular');

-- Specs de MOTO (24-34) → solo moto
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(24, 'moto'), (25, 'moto'), (26, 'moto'), (27, 'moto'), (28, 'moto'),
(29, 'moto'), (30, 'moto'), (31, 'moto'), (32, 'moto'), (33, 'moto'), (34, 'moto');

-- Specs de CELULAR (35-40)
INSERT INTO spec_product_type (spec_definition_id, product_type) VALUES
(35, 'celular'), (36, 'celular'),
(37, 'celular'), (37, 'tablet'),
(38, 'celular'), (38, 'tablet'),
(39, 'celular'), (40, 'celular');
```

### 16.3 product_spec_value (Valores para productos de ejemplo)

```sql
-- Laptop Lenovo LOQ 15 (product_id = 1)
INSERT INTO product_spec_value (product_id, spec_definition_id, value_string, value_number, value_boolean) VALUES
(1, (SELECT id FROM spec_definition WHERE code='gama'), 'alta', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='processor_brand'), 'Intel', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='processor_family'), 'Core i5', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='processor_model'), 'i5-13420H', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='processor_cores'), NULL, 8, NULL),
(1, (SELECT id FROM spec_definition WHERE code='processor_generation'), NULL, 13, NULL),
(1, (SELECT id FROM spec_definition WHERE code='ram_gb'), NULL, 16, NULL),
(1, (SELECT id FROM spec_definition WHERE code='ram_type'), 'DDR5', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='storage_ssd_gb'), NULL, 512, NULL),
(1, (SELECT id FROM spec_definition WHERE code='storage_type'), 'NVMe', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='screen_size'), NULL, 15.6, NULL),
(1, (SELECT id FROM spec_definition WHERE code='screen_resolution'), '1920x1080', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='screen_refresh_rate'), NULL, 144, NULL),
(1, (SELECT id FROM spec_definition WHERE code='graphics_type'), 'dedicada', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='graphics_brand'), 'NVIDIA', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='graphics_model'), 'RTX 3050', NULL, NULL),
(1, (SELECT id FROM spec_definition WHERE code='graphics_vram'), NULL, 6, NULL),
(1, (SELECT id FROM spec_definition WHERE code='os_name'), 'Windows 11', NULL, NULL);

-- Moto Honda CB190R (product_id = 50)
INSERT INTO product_spec_value (product_id, spec_definition_id, value_string, value_number, value_boolean) VALUES
(50, (SELECT id FROM spec_definition WHERE code='gama'), 'intermedia', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='cilindrada'), NULL, 184.4, NULL),
(50, (SELECT id FROM spec_definition WHERE code='tipo_moto'), 'Deportiva', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='tipo_uso'), 'Urbano', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='potencia_hp'), NULL, 16.5, NULL),
(50, (SELECT id FROM spec_definition WHERE code='torque'), NULL, 15.6, NULL),
(50, (SELECT id FROM spec_definition WHERE code='tipo_motor'), 'Monocilíndrico 4T', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='transmision'), '5 velocidades', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='freno_delantero'), 'Disco', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='freno_trasero'), 'Disco', NULL, NULL),
(50, (SELECT id FROM spec_definition WHERE code='capacidad_tanque'), NULL, 12, NULL),
(50, (SELECT id FROM spec_definition WHERE code='rendimiento_km_l'), NULL, 45, NULL);

-- Celular Samsung Galaxy A54 (product_id = 100)
INSERT INTO product_spec_value (product_id, spec_definition_id, value_string, value_number, value_boolean) VALUES
(100, (SELECT id FROM spec_definition WHERE code='gama'), 'intermedia', NULL, NULL),
(100, (SELECT id FROM spec_definition WHERE code='ram_gb'), NULL, 8, NULL),
(100, (SELECT id FROM spec_definition WHERE code='storage_type'), 'UFS 3.1', NULL, NULL),
(100, (SELECT id FROM spec_definition WHERE code='screen_size'), NULL, 6.4, NULL),
(100, (SELECT id FROM spec_definition WHERE code='screen_resolution'), '2340x1080', NULL, NULL),
(100, (SELECT id FROM spec_definition WHERE code='screen_type'), 'Super AMOLED', NULL, NULL),
(100, (SELECT id FROM spec_definition WHERE code='screen_refresh_rate'), NULL, 120, NULL),
(100, (SELECT id FROM spec_definition WHERE code='camara_principal'), NULL, 50, NULL),
(100, (SELECT id FROM spec_definition WHERE code='camara_frontal'), NULL, 32, NULL),
(100, (SELECT id FROM spec_definition WHERE code='bateria_mah'), NULL, 5000, NULL),
(100, (SELECT id FROM spec_definition WHERE code='carga_rapida'), NULL, NULL, 1),
(100, (SELECT id FROM spec_definition WHERE code='tiene_5g'), NULL, NULL, 1),
(100, (SELECT id FROM spec_definition WHERE code='os_name'), 'Android 14', NULL, NULL);
```

### 16.4 tag (Etiquetas de agrupación)

```sql
INSERT INTO tag (code, name, description, tag_type, color, icon, display_order, is_visible, is_active, valid_from, valid_until) VALUES
-- Tags de característica (permanentes)
('gaming', 'Gaming', 'Productos orientados a videojuegos', 'caracteristica', '#FF4500', 'gamepad', 1, 1, 1, NULL, NULL),
('reacondicionado', 'Reacondicionado', 'Productos reacondicionados certificados', 'caracteristica', '#32CD32', 'recycle', 2, 1, 1, NULL, NULL),
('gama_alta', 'Gama Alta', 'Productos premium de alto rendimiento', 'caracteristica', '#FFD700', 'star', 3, 1, 1, NULL, NULL),
('gama_basica', 'Gama Básica', 'Productos accesibles de entrada', 'caracteristica', '#87CEEB', 'entry', 4, 1, 1, NULL, NULL),
('sin_cuota_inicial', 'Sin Cuota Inicial', 'Productos disponibles sin pago inicial', 'caracteristica', '#9370DB', 'no-money', 5, 1, 1, NULL, NULL),
('open_box', 'Open Box', 'Productos con empaque abierto', 'caracteristica', '#FFA500', 'box-open', 6, 1, 1, NULL, NULL),

-- Tags de marca
('apple', 'Apple', 'Productos de la marca Apple', 'marca', '#A2AAAD', 'apple', 10, 1, 1, NULL, NULL),
('lenovo', 'Lenovo', 'Productos de la marca Lenovo', 'marca', '#E2231A', 'lenovo', 11, 1, 1, NULL, NULL),
('hp', 'HP', 'Productos de la marca HP', 'marca', '#0096D6', 'hp', 12, 1, 1, NULL, NULL),
('samsung', 'Samsung', 'Productos de la marca Samsung', 'marca', '#1428A0', 'samsung', 13, 1, 1, NULL, NULL),
('honda', 'Honda', 'Motos de la marca Honda', 'marca', '#CC0000', 'honda', 14, 1, 1, NULL, NULL),

-- Tags de categoría
('laptops', 'Laptops', 'Computadoras portátiles', 'categoria', '#4169E1', 'laptop', 20, 1, 1, NULL, NULL),
('celulares', 'Celulares', 'Teléfonos móviles', 'categoria', '#32CD32', 'mobile', 21, 1, 1, NULL, NULL),
('tablets', 'Tablets', 'Tablets y iPads', 'categoria', '#FF69B4', 'tablet', 22, 1, 1, NULL, NULL),
('motos', 'Motos', 'Motocicletas', 'categoria', '#FF6347', 'motorcycle', 23, 1, 1, NULL, NULL),
('moto_deportiva', 'Motos Deportivas', 'Motocicletas deportivas', 'categoria', '#DC143C', 'racing', 24, 1, 1, NULL, NULL),
('moto_scooter', 'Scooters', 'Scooters y motonetas', 'categoria', '#20B2AA', 'scooter', 25, 1, 1, NULL, NULL),

-- Tags de campaña (temporales)
('cyber_2025', 'CyberDays 2025', 'Ofertas CyberDays 2025', 'campana', '#FF1493', 'bolt', 30, 1, 1, '2025-03-01', '2025-03-07'),
('black_friday_2025', 'Black Friday 2025', 'Ofertas Black Friday', 'campana', '#000000', 'tag', 31, 1, 1, '2025-11-28', '2025-11-30'),
('navidad_2025', 'Navidad 2025', 'Ofertas navideñas', 'campana', '#228B22', 'gift', 32, 1, 1, '2025-12-01', '2025-12-25'),

-- Tags temporales (listas específicas como reacondicionadas_202507)
('reacond_jul_2025', 'Reacondicionadas Julio 2025', 'Lote reacondicionados julio 2025', 'temporal', '#808080', 'list', 40, 0, 1, '2025-07-01', '2025-07-31'),
('reacond_dic_2025', 'Reacondicionadas Diciembre 2025', 'Lote reacondicionados diciembre 2025', 'temporal', '#808080', 'list', 41, 0, 1, '2025-12-01', '2025-12-31'),

-- Tags de promoción
('oferta_especial', 'Oferta Especial', 'Productos en oferta especial', 'promocion', '#FF4500', 'fire', 50, 1, 1, NULL, NULL),
('liquidacion', 'Liquidación', 'Productos en liquidación', 'promocion', '#B22222', 'percent', 51, 1, 1, NULL, NULL),
('nuevo_lanzamiento', 'Nuevo', 'Productos recién lanzados', 'promocion', '#00CED1', 'sparkle', 52, 1, 1, NULL, NULL);
```

### 16.5 product_tag (Asociación productos-tags)

```sql
-- Laptop Lenovo LOQ (product_id = 1) - Gaming, gama alta, Lenovo
INSERT INTO product_tag (product_id, tag_id, display_order) VALUES
(1, (SELECT id FROM tag WHERE code='gaming'), 1),
(1, (SELECT id FROM tag WHERE code='gama_alta'), 1),
(1, (SELECT id FROM tag WHERE code='lenovo'), 1),
(1, (SELECT id FROM tag WHERE code='laptops'), 1),
(1, (SELECT id FROM tag WHERE code='cyber_2025'), 1);

-- Laptop HP reacondicionada (product_id = 2)
INSERT INTO product_tag (product_id, tag_id, display_order) VALUES
(2, (SELECT id FROM tag WHERE code='reacondicionado'), 1),
(2, (SELECT id FROM tag WHERE code='gama_basica'), 1),
(2, (SELECT id FROM tag WHERE code='hp'), 1),
(2, (SELECT id FROM tag WHERE code='laptops'), 1),
(2, (SELECT id FROM tag WHERE code='sin_cuota_inicial'), 1),
(2, (SELECT id FROM tag WHERE code='reacond_dic_2025'), 1);

-- MacBook Air (product_id = 3)
INSERT INTO product_tag (product_id, tag_id, display_order) VALUES
(3, (SELECT id FROM tag WHERE code='apple'), 1),
(3, (SELECT id FROM tag WHERE code='gama_alta'), 1),
(3, (SELECT id FROM tag WHERE code='laptops'), 1),
(3, (SELECT id FROM tag WHERE code='nuevo_lanzamiento'), 1);

-- Moto Honda CB190R (product_id = 50)
INSERT INTO product_tag (product_id, tag_id, display_order) VALUES
(50, (SELECT id FROM tag WHERE code='honda'), 1),
(50, (SELECT id FROM tag WHERE code='motos'), 1),
(50, (SELECT id FROM tag WHERE code='moto_deportiva'), 1),
(50, (SELECT id FROM tag WHERE code='oferta_especial'), 1);

-- Celular Samsung Galaxy A54 (product_id = 100)
INSERT INTO product_tag (product_id, tag_id, display_order) VALUES
(100, (SELECT id FROM tag WHERE code='samsung'), 1),
(100, (SELECT id FROM tag WHERE code='celulares'), 1),
(100, (SELECT id FROM tag WHERE code='cyber_2025'), 1);
```

### 16.6 Queries de ejemplo para filtrar por tags

```sql
-- Obtener todos los productos gaming
SELECT p.*, b.name as marca
FROM product p
JOIN brand b ON b.id = p.brand_id
JOIN product_tag pt ON pt.product_id = p.id
JOIN tag t ON t.id = pt.tag_id
WHERE t.code = 'gaming'
  AND p.is_active = 1
  AND t.is_active = 1;

-- Productos Apple reacondicionados
SELECT p.*
FROM product p
JOIN product_tag pt1 ON pt1.product_id = p.id
JOIN tag t1 ON t1.id = pt1.tag_id AND t1.code = 'apple'
JOIN product_tag pt2 ON pt2.product_id = p.id
JOIN tag t2 ON t2.id = pt2.tag_id AND t2.code = 'reacondicionado'
WHERE p.is_active = 1;

-- Productos en campaña CyberDays activa
SELECT p.*, t.name as campana
FROM product p
JOIN product_tag pt ON pt.product_id = p.id
JOIN tag t ON t.id = pt.tag_id
WHERE t.tag_type = 'campana'
  AND t.is_active = 1
  AND CURDATE() BETWEEN t.valid_from AND t.valid_until;

-- Motos deportivas de Honda
SELECT p.*
FROM product p
JOIN product_tag pt1 ON pt1.product_id = p.id
JOIN tag t1 ON t1.id = pt1.tag_id AND t1.code = 'honda'
JOIN product_tag pt2 ON pt2.product_id = p.id
JOIN tag t2 ON t2.id = pt2.tag_id AND t2.code = 'moto_deportiva'
WHERE p.is_active = 1;

-- Todos los tags de un producto
SELECT t.code, t.name, t.tag_type, t.color
FROM tag t
JOIN product_tag pt ON pt.tag_id = t.id
WHERE pt.product_id = 1
ORDER BY t.display_order;
```

### 16.7 accessory_product_type (Tipos de producto compatibles con accesorios)

```sql
-- Accesorio 1: Mouse inalámbrico (compatible con laptop, tablet)
INSERT INTO accessory_product_type (accessory_id, product_type) VALUES
(1, 'laptop'),
(1, 'tablet');

-- Accesorio 2: Audífonos Bluetooth (compatible con todo)
INSERT INTO accessory_product_type (accessory_id, product_type) VALUES
(2, 'laptop'),
(2, 'celular'),
(2, 'tablet');

-- Accesorio 3: Cargador universal (compatible con laptop, celular, tablet)
INSERT INTO accessory_product_type (accessory_id, product_type) VALUES
(3, 'laptop'),
(3, 'celular'),
(3, 'tablet');

-- Accesorio 4: Casco de moto (solo moto)
INSERT INTO accessory_product_type (accessory_id, product_type) VALUES
(4, 'moto');
```

### 16.8 lead_campaign_* (Tablas pivot de campañas de leads)

```sql
-- Campaña de recuperación de leads 1: Leads abandonados recientes
INSERT INTO lead_campaign_status (campaign_id, lead_status) VALUES
(1, 'new'),
(1, 'contacted');

INSERT INTO lead_campaign_landing (campaign_id, landing_id) VALUES
(1, 1),  -- Landing principal
(1, 2);  -- Landing SENATI

INSERT INTO lead_campaign_source (campaign_id, traffic_source) VALUES
(1, 'organic_search'),
(1, 'paid_search'),
(1, 'direct');

-- Campaña 2: Leads calificados de Facebook
INSERT INTO lead_campaign_status (campaign_id, lead_status) VALUES
(2, 'qualified'),
(2, 'hot');

INSERT INTO lead_campaign_source (campaign_id, traffic_source) VALUES
(2, 'paid_social');
```

### 16.9 preapproved_* (Tablas pivot de preaprobados)

```sql
-- Preaprobado 1: Puede comprar laptops específicas en cualquier landing
INSERT INTO preapproved_product (preapproved_id, product_id) VALUES
(1, 1),  -- HP Pavilion
(1, 5),  -- Lenovo IdeaPad
(1, 10); -- ASUS VivoBook

INSERT INTO preapproved_landing (preapproved_id, landing_id) VALUES
(1, 1),  -- Landing público
(1, 2),  -- Landing SENATI
(1, 3);  -- Landing UPN

-- Preaprobado 2: Sin restricciones (puede comprar cualquier producto en cualquier landing)
-- No se insertan registros, null = todos

-- Preaprobado 3: Solo celulares en landing específico
INSERT INTO preapproved_product (preapproved_id, product_id) VALUES
(3, 50),  -- iPhone 15
(3, 51),  -- Samsung S24
(3, 52);  -- Xiaomi 14

INSERT INTO preapproved_landing (preapproved_id, landing_id) VALUES
(3, 1);  -- Solo landing público
```

### 16.10 campaign_* (Tablas pivot de campañas de marketing)

```sql
-- Campaña marketing 1: Outreach a preaprobados bajo riesgo
INSERT INTO campaign_preapproved_status (campaign_id, preapproved_status) VALUES
(1, 'active'),
(1, 'contacted');

INSERT INTO campaign_risk_category (campaign_id, risk_category) VALUES
(1, 'A'),
(1, 'B');

INSERT INTO campaign_source (campaign_id, source) VALUES
(1, 'bureau'),
(1, 'existing_customer');

INSERT INTO campaign_institution (campaign_id, institution_id) VALUES
(1, 1),  -- Universidad 1
(1, 2);  -- Universidad 2

INSERT INTO campaign_agreement (campaign_id, agreement_id) VALUES
(1, 1);  -- Convenio principal

-- Campaña 2: Retargeting a todos los preaprobados de convenios específicos
INSERT INTO campaign_preapproved_status (campaign_id, preapproved_status) VALUES
(2, 'active'),
(2, 'interested'),
(2, 'contacted');

INSERT INTO campaign_agreement (campaign_id, agreement_id) VALUES
(2, 1),
(2, 2),
(2, 3);
```

### 16.11 Queries de ejemplo para tablas pivot normalizadas

```sql
-- Accesorios compatibles con laptops
SELECT a.*
FROM accessory a
JOIN accessory_product_type apt ON apt.accessory_id = a.id
WHERE apt.product_type = 'laptop'
  AND a.is_active = 1;

-- Leads objetivo de una campaña de recuperación
SELECT l.*
FROM lead l
JOIN lead_campaign_status lcs ON lcs.lead_status = l.status
WHERE lcs.campaign_id = 1
  AND l.landing_id IN (SELECT landing_id FROM lead_campaign_landing WHERE campaign_id = 1);

-- Preaprobados elegibles para una campaña de marketing
SELECT pc.*
FROM preapproved_customer pc
JOIN campaign_preapproved_status cps ON cps.preapproved_status = pc.status
LEFT JOIN campaign_risk_category crc ON crc.risk_category = pc.risk_category
WHERE cps.campaign_id = 1
  AND crc.campaign_id = 1
  AND pc.status = 'active';

-- Productos disponibles para un preaprobado específico
SELECT p.*
FROM product p
WHERE p.id IN (
  SELECT product_id FROM preapproved_product WHERE preapproved_id = 1
)
OR NOT EXISTS (
  SELECT 1 FROM preapproved_product WHERE preapproved_id = 1
)
-- Si no hay restricciones, puede ver todos los productos
```

---

## 17. Diagramas de Base de Datos (dbdiagram.io)

Esta sección contiene los diagramas de todas las tablas en formato compatible con [dbdiagram.io](https://dbdiagram.io/). Proveedor de verificación de identidad: **Equifax**.

```dbml
Table institution {
  id bigint [pk]
  code varchar [unique, not null, note: 'Código único: UPN, SENATI, UCV']
  name varchar [not null]
  short_name varchar
  type enum_institution_type [not null, note: 'universidad, instituto, colegio, cetpro, idiomas, otro']
  management enum_management [not null, note: 'publica, privada']
  is_licensed tinyint [default: 0, note: 'Licenciada por SUNEDU']
  logo_url varchar
  website_url varchar
  woe_score decimal [note: 'Weight of Evidence para scoring']
  is_active tinyint [default: 1]
  created_at timestamp
  updated_at timestamp
}

Table institution_campus {
  id bigint [pk]
  institution_id bigint [not null, ref: > institution.id]
  name varchar [not null]
  code varchar
  address varchar
  district varchar
  province varchar
  department varchar
  latitude decimal
  longitude decimal
  phone varchar
  is_main tinyint [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table career {
  id bigint [pk]
  name varchar [not null]
  normalized_name varchar [not null, note: 'Nombre normalizado para matching']
  field varchar [note: 'Área: Ingeniería, Salud, Negocios']
  woe_score decimal
  is_active tinyint [default: 1]
  created_at timestamp
}

Table agreement {
  id bigint [pk]
  institution_id bigint [not null, ref: > institution.id]
  code varchar [unique, not null]
  name varchar [not null]
  type enum_agreement_type [default: 'standard', note: 'exclusivo, preferente, standard']
  discount_percentage decimal
  special_tea decimal [note: 'TEA especial del convenio']
  min_tea decimal
  commission_rate decimal
  valid_from date [not null]
  valid_until date
  is_active tinyint [default: 1]
  created_at timestamp
  updated_at timestamp
}

Table user_account {
  id bigint [pk]
  email varchar [unique, not null]
  full_name varchar [not null]
  role enum_role [not null, note: 'admin, analyst, sales, support, viewer']
  is_active tinyint [default: 1]
  created_at timestamp
  updated_at timestamp
}
```

```dbml
Table brand {
  id bigint [pk]
  name varchar [not null]
  slug varchar [unique, not null]
  logo_url varchar
  website_url varchar
  display_order int [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table product {
  id bigint [pk]
  sku varchar [unique, not null, note: 'Código único interno']
  brand_id bigint [not null, ref: > brand.id]
  name varchar [not null]
  short_name varchar
  slug varchar [unique, not null]
  type enum_product_type [not null, note: 'laptop, celular, tablet, moto, accesorio, seguro']
  condition enum_condition [default: 'nueva', note: 'nueva, reacondicionada, open_box']
  description text
  short_description varchar
  purchase_price decimal [note: 'Precio de compra']
  list_price decimal [not null, note: 'Precio de lista']
  currency char [default: 'PEN']
  is_active tinyint [default: 1]
  is_featured tinyint [default: 0]
  available_from date
  available_until date
  created_by bigint [ref: > user_account.id]
  created_at timestamp
  updated_at timestamp
}

// Modelo EAV para especificaciones escalables
Table spec_definition {
  id bigint [pk]
  code varchar [unique, not null, note: 'ram_gb, cilindrada, gama']
  name varchar [not null, note: 'Memoria RAM, Cilindrada, Gama']
  description varchar
  data_type enum_data_type [not null, note: 'string, number, boolean']
  unit varchar [note: 'GB, cc, pulgadas']
  icon varchar
  is_filterable tinyint [default: 0]
  is_comparable tinyint [default: 0]
  is_highlight tinyint [default: 0]
  display_order int [default: 0]
  group_code varchar [note: 'procesador, memoria, motor']
  group_order int [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
  updated_at timestamp
}

// Relación specs-tipos de producto (sin JSON)
Table spec_product_type {
  id bigint [pk]
  spec_definition_id bigint [not null, ref: > spec_definition.id]
  product_type enum_product_type [not null, note: 'laptop, celular, tablet, moto, accesorio']
  created_at timestamp

  indexes {
    (spec_definition_id, product_type) [unique]
  }
}

Table product_spec_value {
  id bigint [pk]
  product_id bigint [not null, ref: > product.id]
  spec_definition_id bigint [not null, ref: > spec_definition.id]
  value_string varchar
  value_number decimal
  value_boolean tinyint
  created_at timestamp
  updated_at timestamp

  indexes {
    (product_id, spec_definition_id) [unique]
  }
}

// Sistema de Tags para agrupaciones
Table tag {
  id bigint [pk]
  code varchar [unique, not null, note: 'gaming, apple, reacondicionado']
  name varchar [not null]
  description varchar
  tag_type enum_tag_type [not null, note: 'categoria, marca, promocion, campana, temporal, caracteristica']
  color varchar [note: 'Color hex para badge']
  icon varchar
  display_order int [default: 0]
  is_visible tinyint [default: 1]
  is_active tinyint [default: 1]
  valid_from date [note: 'Para tags temporales']
  valid_until date
  created_at timestamp
  updated_at timestamp
}

Table product_tag {
  id bigint [pk]
  product_id bigint [not null, ref: > product.id]
  tag_id bigint [not null, ref: > tag.id]
  display_order int [default: 0]
  created_at timestamp

  indexes {
    (product_id, tag_id) [unique]
  }
}

Table product_image {
  id bigint [pk]
  product_id bigint [not null, ref: > product.id]
  url varchar [not null]
  alt_text varchar
  type enum_image_type [default: 'gallery', note: 'main, gallery, thumbnail, 360, video_thumbnail']
  display_order int [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table product_pricing {
  id bigint [pk]
  product_id bigint [not null, ref: > product.id]
  term_months tinyint [not null, note: 'Plazo en meses: 6, 9, 12, 18, 24']
  monthly_payment decimal [not null, note: 'Cuota mensual']
  initial_payment decimal [default: 0]
  total_amount decimal [not null]
  tea decimal [note: 'Tasa Efectiva Anual']
  tcea decimal [note: 'Tasa de Costo Efectivo Anual']
  is_default tinyint [default: 0]
  is_active tinyint [default: 1]
  valid_from date
  valid_until date
  created_at timestamp
  updated_at timestamp

  indexes {
    (product_id, term_months) [unique]
  }
}

Table accessory {
  id bigint [pk]
  product_id bigint [not null, ref: > product.id, note: 'FK al producto base']
  category enum_accessory_cat [not null, note: 'auriculares, mouse, teclado, mochila, soporte, cargador, protector, hub, otro']
  monthly_price_addon decimal [not null]
  is_recommended tinyint [default: 0]
  display_order int [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

// Pivot: Tipos de producto compatibles con cada accesorio (normalizado)
Table accessory_product_type {
  id bigint [pk]
  accessory_id bigint [not null, ref: > accessory.id]
  product_type enum_product_type [not null, note: 'laptop, celular, tablet, moto, accesorio']
  created_at timestamp

  indexes {
    (accessory_id, product_type) [unique]
  }
}

Table insurance {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description text
  coverage_months tinyint [not null]
  monthly_price decimal [not null]
  coverage_details json
  provider varchar
  is_mandatory_refurbished tinyint [default: 0]
  display_order int [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table combo {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description text
  discount_type enum_discount [not null, note: 'percentage, fixed_amount, fixed_price']
  discount_value decimal [not null]
  min_items tinyint [default: 1]
  max_items tinyint
  is_active tinyint [default: 1]
  valid_from date
  valid_until date
  created_at timestamp
}

Table combo_item {
  id bigint [pk]
  combo_id bigint [not null, ref: > combo.id]
  product_id bigint [not null, ref: > product.id]
  item_type enum_combo_item [not null, note: 'main, accessory, insurance']
  is_required tinyint [default: 0]
  quantity tinyint [default: 1]
  individual_discount decimal
  display_order int [default: 0]
  created_at timestamp

  indexes {
    (combo_id, product_id) [unique]
  }
}
```

```dbml
Table landing_template {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description text
  is_system tinyint [default: 0, note: 'Template del sistema, no editable']
  is_active tinyint [default: 1]
  created_by bigint [ref: > user_account.id]
  created_at timestamp
  updated_at timestamp
}

Table landing {
  id bigint [pk]
  template_id bigint [ref: > landing_template.id]
  agreement_id bigint [ref: > agreement.id]
  institution_id bigint [ref: > institution.id]
  code varchar [unique, not null]
  slug varchar [unique, not null, note: 'URL: prestamo, ucv-cachimbos']
  name varchar [not null]
  display_name varchar
  meta_title varchar
  meta_description varchar
  logo_url varchar
  favicon_url varchar
  primary_color char [default: '#00e4d3']
  secondary_color char [default: '#fdca56']
  flow_type enum_flow [default: 'general', note: 'general, interno, activacion, campana, motos, colegios']
  show_modalidad_step tinyint [default: 0]
  allow_accessories tinyint [default: 1]
  allow_insurance tinyint [default: 1]
  require_aval tinyint [default: 0]
  default_institution_id bigint [ref: > institution.id]
  default_campus_id bigint [ref: > institution_campus.id]
  default_term_months tinyint [default: 12]
  success_title varchar [default: '¡Yeeee!']
  success_message text
  whatsapp_template text
  rejection_url varchar
  success_url varchar
  is_active tinyint [default: 1]
  priority int [default: 0]
  valid_from datetime
  valid_until datetime
  created_by bigint [ref: > user_account.id]
  created_at timestamp
  updated_at timestamp
}

Table landing_inheritance {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  parent_template_id bigint [not null, ref: > landing_template.id]
  priority int [not null, default: 0, note: 'Mayor = más prioritario (override)']
  inherit_steps tinyint [default: 1]
  inherit_fields tinyint [default: 1]
  inherit_validations tinyint [default: 1]
  inherit_products tinyint [default: 1]
  inherit_promotions tinyint [default: 1]
  created_at timestamp

  indexes {
    (landing_id, parent_template_id) [unique]
  }
}

Table feature_definition {
  id bigint [pk]
  code varchar [unique, not null, note: 'show_filters, enable_chat, show_faq']
  name varchar [not null]
  description varchar
  category enum_feature_cat [not null, note: 'ui, form, catalog, tracking, integration, other']
  default_enabled tinyint [default: 0]
  default_position varchar [note: 'header, sidebar, footer, modal']
  default_priority int [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table landing_feature {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  feature_id bigint [not null, ref: > feature_definition.id]
  is_enabled tinyint [default: 1]
  position_override varchar
  priority_override int
  config_url varchar [note: 'URL para chat widget, etc.']
  config_api_key varchar [note: 'API key si requiere']
  config_limit int [note: 'Límite numérico']
  config_style varchar [note: 'minimal, full, compact']
  valid_from datetime
  valid_until datetime
  created_at timestamp

  indexes {
    (landing_id, feature_id) [unique]
  }
}

Table landing_promotion {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  type enum_promo_type [not null, note: 'modal, banner, popup, toast, inline']
  placement enum_placement [default: 'catalog', note: 'home, catalog, form, confirmation, all']
  trigger_type enum_trigger [not null, note: 'on_load, on_scroll, on_exit_intent, on_time, on_idle, on_action']
  trigger_value varchar
  trigger_delay_ms int [default: 0]
  title varchar
  subtitle varchar
  body_html text
  image_url varchar
  cta_text varchar
  cta_url varchar
  cta_action varchar
  dismiss_text varchar
  show_once_per_session tinyint [default: 1]
  dismissable tinyint [default: 1]
  is_active tinyint [default: 1]
  priority int [default: 0]
  valid_from datetime
  valid_until datetime
  created_at timestamp
  updated_at timestamp
}

Table landing_product {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  product_id bigint [not null, ref: > product.id]
  term_months tinyint [not null]
  monthly_payment decimal [not null]
  initial_payment decimal [default: 0]
  tea decimal
  tcea decimal
  discount_percentage decimal
  discount_amount decimal
  promo_tag varchar [note: 'OFERTA, NUEVO, -20%']
  is_visible tinyint [default: 1]
  is_featured tinyint [default: 0]
  display_order int [default: 0]
  valid_from date
  valid_until date
  created_at timestamp
  updated_at timestamp

  indexes {
    (landing_id, product_id, term_months) [unique]
  }
}

Table landing_accessory {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  accessory_id bigint [not null, ref: > accessory.id]
  monthly_price_override decimal
  is_visible tinyint [default: 1]
  is_recommended tinyint [default: 0]
  display_order int [default: 0]
  created_at timestamp

  indexes {
    (landing_id, accessory_id) [unique]
  }
}

Table landing_insurance {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  insurance_id bigint [not null, ref: > insurance.id]
  monthly_price_override decimal
  is_visible tinyint [default: 1]
  is_mandatory tinyint [default: 0]
  is_preselected tinyint [default: 0]
  display_order int [default: 0]
  created_at timestamp

  indexes {
    (landing_id, insurance_id) [unique]
  }
}

Table promotion {
  id bigint [pk]
  code varchar [unique, not null, note: 'CYBER2024, BLACKFRIDAY']
  name varchar [not null]
  description text

  type enum_promo_type [not null, note: 'discount_percent, discount_amount, special_rate, zero_interest, free_accessory, cashback']
  value decimal [not null, note: 'Valor según tipo: 20 (%), 100 (S/), 0.12 (TEA)']

  min_product_price decimal
  max_product_price decimal
  min_term_months tinyint
  max_term_months tinyint
  applies_to_first_purchase tinyint [default: 0]

  badge_text varchar [note: '-20%, OFERTA, 0% INT']
  badge_color char [default: '#ff4444']
  banner_image_url varchar

  valid_from datetime [not null]
  valid_until datetime [not null]
  max_uses int [note: 'NULL = ilimitado']
  current_uses int [default: 0]

  is_active tinyint [default: 1]
  is_combinable tinyint [default: 0]
  priority int [default: 0]
  created_by bigint [ref: > user_account.id]
  created_at timestamp
  updated_at timestamp

  indexes {
    (is_active, valid_from, valid_until)
  }
}

Table landing_product_promotion {
  id bigint [pk]
  landing_product_id bigint [not null, ref: > landing_product.id]
  promotion_id bigint [not null, ref: > promotion.id]

  valid_from datetime [note: 'Override fecha inicio']
  valid_until datetime [note: 'Override fecha fin']
  value_override decimal [note: 'Override valor para esta landing']

  is_active tinyint [default: 1]
  display_order int [default: 0]
  created_at timestamp

  indexes {
    (landing_product_id, promotion_id) [unique]
  }
}
```

```dbml
Table form_step {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description text
  url_path varchar [unique, not null]
  icon varchar
  default_order tinyint [not null]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table form_field_group {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description varchar
  step_id bigint [not null, ref: > form_step.id]
  default_order tinyint [default: 0]
  collapsible tinyint [default: 0]
  default_collapsed tinyint [default: 0]
  created_at timestamp
}

Table form_field {
  id bigint [pk]
  code varchar [unique, not null, note: 'tipo_documento, dni, email, celular']
  name varchar [not null]
  description text
  step_id bigint [not null, ref: > form_step.id]
  group_id bigint [ref: > form_field_group.id]
  field_type enum_field_type [not null, note: 'text, number, email, tel, date, select, radio, checkbox, file, autocomplete, hidden, textarea, display']
  input_mode varchar [note: 'numeric, tel, email, decimal']
  default_label varchar
  default_placeholder varchar
  default_help_text varchar
  default_error_message varchar
  prefix varchar
  suffix varchar
  mask varchar [note: 'Máscara de input: ###-###-###']
  default_min_length smallint
  default_max_length smallint
  default_pattern varchar [note: 'Regex de validación']
  maps_to_column varchar [note: 'Columna destino en BD']
  maps_to_table varchar [default: 'application']
  data_source_type enum_ds_type [note: 'static, api, table, function - Origen de opciones']
  data_source_config varchar [note: 'API URL, nombre de tabla']
  backend_populated tinyint [default: 0, note: 'Campo llenado automáticamente desde backend']
  backend_api_code varchar [note: 'reniec, sunat, equifax, ubigeo']
  backend_trigger_field varchar [note: 'Campo que dispara consulta: dni, ruc']
  backend_response_path varchar [note: 'Path en JSON: data.person.nombres']
  is_pii tinyint [default: 0, note: 'Dato personal sensible']
  is_active tinyint [default: 1]
  created_at timestamp
  updated_at timestamp
}

Table landing_step {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  step_id bigint [not null, ref: > form_step.id]
  is_visible tinyint [default: 1]
  is_skippable tinyint [default: 0]
  custom_order tinyint
  custom_title varchar
  custom_subtitle varchar
  custom_url_path varchar
  skip_conditions json
  created_at timestamp
  updated_at timestamp

  indexes {
    (landing_id, step_id) [unique]
  }
}

Table landing_field {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  field_id bigint [not null, ref: > form_field.id]
  step_id bigint [ref: > form_step.id]
  group_id bigint [ref: > form_field_group.id]
  visibility enum_visibility [default: 'visible', note: 'visible, hidden, conditional']
  visibility_conditions json
  requirement enum_requirement [default: 'required', note: 'required, optional, conditional']
  requirement_conditions json
  display_order smallint [default: 0]
  custom_label varchar
  custom_placeholder varchar
  custom_help_text varchar
  custom_error_message varchar
  default_value varchar
  default_value_source varchar [note: 'landing.default_institution_id, api:/equifax']
  is_readonly tinyint [default: 0]
  is_autofilled tinyint [default: 0]
  autofill_source varchar [note: 'equifax, reniec, google_places']
  width enum_width [default: 'full', note: 'full, half, third, quarter']
  created_at timestamp
  updated_at timestamp

  indexes {
    (landing_id, field_id) [unique]
  }
}

Table field_validation {
  id bigint [pk]
  landing_field_id bigint [not null, ref: > landing_field.id]
  validation_type enum_validation [not null, note: 'required, min_length, max_length, pattern, email, phone, dni, ruc']
  validation_value varchar
  error_message varchar [not null]
  is_active tinyint [default: 1]
  priority tinyint [default: 0]
  created_at timestamp
}

Table field_option {
  id bigint [pk]
  landing_field_id bigint [not null, ref: > landing_field.id]
  value varchar [not null]
  label varchar [not null]
  description varchar
  is_default tinyint [default: 0]
  is_active tinyint [default: 1]
  display_order smallint [default: 0]
  visibility_conditions json
  triggers_fields json
  created_at timestamp
}

Table field_dependency {
  id bigint [pk]
  landing_field_id bigint [not null, ref: > landing_field.id]
  depends_on_field_id bigint [not null, ref: > form_field.id]
  condition_type enum_condition [not null, note: 'equals, not_equals, contains, in, empty, not_empty']
  condition_value varchar
  action enum_dep_action [not null, note: 'show, hide, enable, disable, require, optional']
  created_at timestamp
}

Table filter_definition {
  id bigint [pk]
  code varchar [unique, not null, note: 'brand, processor, ram, storage, screen_size']
  name varchar [not null]
  description varchar
  filter_type enum_filter_type [not null, note: 'single_select, multi_select, range, boolean']
  source_table varchar [default: 'product_spec']
  source_column varchar [not null]
  display_order tinyint [default: 0]
  icon varchar
  is_active tinyint [default: 1]
  created_at timestamp
}

Table filter_value {
  id bigint [pk]
  filter_id bigint [not null, ref: > filter_definition.id]
  value varchar [not null]
  display_label varchar [not null]
  product_count int [default: 0]
  min_range decimal
  max_range decimal
  display_order smallint [default: 0]
  is_active tinyint [default: 1]
  last_calculated_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (filter_id, value) [unique]
  }
}

Table landing_filter {
  id bigint [pk]
  landing_id bigint [not null, ref: > landing.id]
  filter_id bigint [not null, ref: > filter_definition.id]
  is_visible tinyint [default: 1]
  display_order tinyint
  custom_values json [note: 'Override de valores para este landing']
  created_at timestamp

  indexes {
    (landing_id, filter_id) [unique]
  }
}

Table sort_option {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  sort_field varchar [not null]
  sort_direction enum_sort [default: 'asc', note: 'asc, desc']
  is_default tinyint [default: 0]
  display_order tinyint [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}
```

```dbml
Table session {
  id bigint [pk]
  uuid char [unique, not null, note: 'UUID generado en frontend']
  landing_id bigint [ref: > landing.id]
  application_id bigint [note: 'Se vincula cuando se crea solicitud']
  visitor_id varchar [note: 'Cookie persistente UUID - agrupa sesiones mismo navegador']
  person_id bigint [ref: > person.id, note: 'Se llena cuando usuario se identifica (DNI)']
  linked_at timestamp [note: 'Cuándo se vinculó a la persona']
  fingerprint_hash varchar [note: 'Browser fingerprint']
  ip_address varchar
  country_code char
  city varchar
  user_agent text
  device_type enum_device [not null, note: 'desktop, tablet, mobile']
  os_name varchar
  os_version varchar
  browser_name varchar
  browser_version varchar
  screen_width smallint
  screen_height smallint
  viewport_width smallint
  viewport_height smallint
  touch_support tinyint [default: 0]
  language varchar
  timezone varchar
  utm_source varchar [note: 'google, facebook, email']
  utm_medium varchar [note: 'cpc, cpm, organic, referral']
  utm_campaign varchar
  utm_term varchar
  utm_content varchar
  referrer_url varchar
  referrer_domain varchar
  entry_url varchar
  gclid varchar [note: 'Google Click ID']
  fbclid varchar [note: 'Facebook Click ID']
  ttclid varchar [note: 'TikTok Click ID']
  msclkid varchar [note: 'Microsoft Click ID']
  traffic_source enum_traffic [note: 'organic_search, paid_search, organic_social, paid_social, display, retargeting, email, sms, direct, preapproved, referral']
  status enum_session_status [default: 'active', note: 'active, completed, abandoned, converted']
  max_step_reached varchar
  conversion_status enum_conversion [note: 'none, started, completed, rejected']
  page_views smallint [default: 0]
  total_events int [default: 0]
  duration_seconds int
  started_at timestamp
  last_activity_at timestamp
  ended_at timestamp
  created_at timestamp
}

Table page_view {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_path varchar [not null]
  page_title varchar
  step_code varchar [ref: > form_step.code]
  referrer_path varchar
  time_on_page_ms int
  scroll_depth_percent tinyint
  is_bounce tinyint [default: 0]
  view_sequence smallint
  created_at timestamp
}

Table event_scroll {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  scroll_percent tinyint [not null]
  scroll_direction enum_scroll_dir [note: 'down, up']
  viewport_position int
  created_at timestamp
}

Table event_click {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  element_type varchar [note: 'button, link, card, image']
  element_id varchar
  element_class varchar
  element_text varchar
  element_href varchar
  click_x smallint
  click_y smallint
  is_rage_click tinyint [default: 0]
  product_id bigint [ref: > product.id]
  created_at timestamp
}

Table event_hover {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  element_type varchar
  element_id varchar
  product_id bigint [ref: > product.id]
  duration_ms int [not null]
  created_at timestamp
}

Table event_input {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  field_code varchar [not null, ref: > form_field.code]
  step_code varchar [ref: > form_step.code]
  action enum_input_action [not null, note: 'focus, blur, change, clear, paste, autocomplete']
  time_to_fill_ms int
  corrections_count tinyint [default: 0]
  paste_used tinyint [default: 0]
  autofill_used tinyint [default: 0]
  validation_error varchar
  created_at timestamp
}

Table event_filter {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  filter_code varchar [not null, ref: > filter_definition.code]
  filter_value varchar [not null]
  action enum_filter_action [not null, note: 'apply, remove, clear']
  results_count smallint
  created_at timestamp
}

Table event_product {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  product_id bigint [not null, ref: > product.id]
  action enum_product_action [not null, note: 'view_card, view_detail, compare, add_to_wishlist, select, simulate, request']
  source_page varchar
  position_in_list smallint
  filter_context json
  time_viewing_ms int
  created_at timestamp
}

Table event_modal {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  modal_name varchar [not null, note: 'simulador, comparador, requisitos']
  action enum_modal_action [not null, note: 'open, close, interact, submit']
  trigger_element varchar
  duration_visible_ms int
  interaction_count tinyint [default: 0]
  product_id bigint [ref: > product.id]
  created_at timestamp
}

Table event_form {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  step_code varchar [not null, ref: > form_step.code]
  action enum_form_action [not null, note: 'start, progress, complete, abandon, error, back']
  fields_filled tinyint [default: 0]
  fields_total tinyint
  validation_errors tinyint [default: 0]
  time_on_step_ms int
  previous_step varchar
  created_at timestamp
}

Table event_navigation {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  from_path varchar
  to_path varchar
  navigation_type enum_nav_type [note: 'click, back, forward, refresh, direct, external']
  navigation_trigger varchar
  created_at timestamp
}

Table event_error {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  error_type enum_error_type [note: 'javascript, api, validation, network, timeout']
  error_code varchar
  error_message text
  error_stack text
  component varchar
  is_fatal tinyint [default: 0]
  created_at timestamp
}

Table event_custom {
  id bigint [pk]
  session_id bigint [not null, ref: > session.id]
  page_view_id bigint [ref: > page_view.id]
  event_name varchar [not null]
  event_category varchar
  event_action varchar
  event_label varchar
  event_value decimal
  properties json
  created_at timestamp
}
```

```dbml
Table person {
  id bigint [pk]
  document_type enum_doc_type [not null, default: 'dni', note: 'dni, ce, ptp, pasaporte']
  document_number varchar [not null]
  first_name varchar [not null]
  paternal_surname varchar [not null]
  maternal_surname varchar
  birth_date date
  gender enum_gender [note: 'M, F']
  nationality char [default: 'PE']
  primary_email varchar [note: 'Email principal actual']
  primary_phone varchar [note: 'Celular principal actual']
  fingerprint_hash varchar [note: 'Browser fingerprint']
  reniec_validated tinyint [default: 0]
  reniec_validated_at timestamp
  equifax_score smallint [note: 'Score crediticio de Equifax']
  equifax_consulted_at timestamp [note: 'Última consulta a Equifax']
  equifax_report_id varchar [note: 'ID del reporte en Equifax']
  risk_category enum_risk [note: 'A, B, C, D, E - Basado en Equifax']
  total_applications smallint [default: 0]
  approved_applications smallint [default: 0]
  active_credits tinyint [default: 0]
  total_credit_amount decimal [default: 0]
  last_application_at timestamp
  first_application_at timestamp
  status enum_person_status [default: 'active', note: 'active, blocked, blacklisted']
  blocked_reason varchar
  blocked_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (document_type, document_number) [unique]
    (equifax_score, risk_category) [name: 'idx_person_equifax']
  }
}

Table person_contact_history {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  version smallint [not null, default: 1]
  email varchar [not null]
  phone_primary varchar [not null]
  phone_secondary varchar
  phone_landline varchar
  is_whatsapp_primary tinyint [default: 1]
  is_whatsapp_secondary tinyint [default: 0]
  email_verified tinyint [default: 0]
  email_verified_at timestamp
  phone_verified tinyint [default: 0]
  phone_verified_at timestamp
  captured_from_session_id bigint [ref: > session.id]
  captured_from_application_id bigint
  capture_source enum_capture [default: 'form', note: 'form, api, import, manual']
  is_current tinyint [default: 1]
  valid_from timestamp [not null]
  valid_until timestamp
  created_at timestamp

  indexes {
    (person_id, version) [unique]
  }
}

Table person_address_history {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  version smallint [not null, default: 1]
  address_type enum_address_type [default: 'home', note: 'home, work, study, other']
  full_address varchar [not null]
  reference varchar
  department varchar [not null]
  province varchar [not null]
  district varchar [not null]
  ubigeo char
  postal_code varchar
  latitude decimal
  longitude decimal
  housing_type enum_housing [note: 'owned, rented, family, other']
  housing_time_months smallint
  rent_amount decimal
  captured_from_session_id bigint [ref: > session.id]
  capture_source enum_capture [default: 'form']
  is_current tinyint [default: 1]
  valid_from timestamp [not null]
  valid_until timestamp
  created_at timestamp

  indexes {
    (person_id, address_type, version) [unique]
  }
}

Table person_academic_history {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  version smallint [not null, default: 1]
  institution_id bigint [not null, ref: > institution.id]
  campus_id bigint [ref: > institution_campus.id]
  career_id bigint [ref: > career.id]
  career_name_other varchar
  student_code varchar
  current_cycle tinyint
  total_cycles tinyint
  modality enum_modality [default: 'presencial', note: 'presencial, semipresencial, virtual']
  shift enum_shift [note: 'manana, tarde, noche, flexible']
  enrollment_status enum_enrollment [default: 'enrolled', note: 'enrolled, egresado, reserva, retired']
  enrollment_validated tinyint [default: 0]
  enrollment_validated_at timestamp
  scholarship_type enum_scholarship [default: 'none', note: 'none, full, partial, beca18, pronabec, other']
  scholarship_percentage tinyint
  monthly_tuition decimal
  tuition_payer enum_payer [default: 'self', note: 'self, parents, employer, scholarship, other']
  captured_from_session_id bigint [ref: > session.id]
  capture_source enum_capture [default: 'form']
  is_current tinyint [default: 1]
  valid_from timestamp [not null]
  valid_until timestamp
  created_at timestamp

  indexes {
    (person_id, institution_id, version) [unique]
  }
}

Table person_employment_history {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  version smallint [not null, default: 1]
  employment_status enum_employment [not null, note: 'employed_formal, employed_informal, self_employed, business_owner, student_only, unemployed, retired, other']
  employer_name varchar
  employer_ruc varchar
  job_title varchar
  contract_type enum_contract [note: 'indefinido, plazo_fijo, locacion, practicas, otros']
  start_date date
  seniority_months smallint
  gross_income decimal [note: 'Ingreso bruto mensual']
  net_income decimal [note: 'Ingreso neto mensual']
  other_income decimal [default: 0]
  other_income_source varchar
  income_type enum_income [note: '4ta, 5ta, renta, sin_sustento']
  income_frequency enum_frequency [default: 'monthly', note: 'weekly, biweekly, monthly']
  payment_method enum_payment [default: 'bank_transfer', note: 'cash, bank_transfer, yape_plin, check, mixed']
  business_name varchar
  business_ruc varchar
  business_type varchar
  business_monthly_revenue decimal
  business_seniority_months smallint
  dependent_of enum_dependent [note: 'parents, spouse, sibling, other']
  supporter_name varchar
  supporter_phone varchar
  monthly_support_amount decimal
  income_verified tinyint [default: 0]
  income_verified_at timestamp
  verification_method varchar
  captured_from_session_id bigint [ref: > session.id]
  capture_source enum_capture [default: 'form']
  is_current tinyint [default: 1]
  valid_from timestamp [not null]
  valid_until timestamp
  created_at timestamp

  indexes {
    (person_id, version) [unique]
  }
}

Table person_financial_history {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  version smallint [not null, default: 1]
  primary_bank varchar
  account_type enum_account [default: 'savings', note: 'savings, checking, cts, none']
  account_number_masked varchar [note: 'Solo últimos 4 dígitos']
  has_debit_card tinyint
  has_credit_card tinyint
  credit_card_bank varchar
  has_active_debts tinyint [default: 0]
  total_debt_amount decimal
  monthly_debt_payment decimal
  debt_institutions json [note: '["BCP", "Interbank", "Otros"]']
  has_credit_history tinyint
  previous_credits_count tinyint
  had_payment_issues tinyint [default: 0]
  payment_issues_detail varchar
  captured_from_session_id bigint [ref: > session.id]
  capture_source enum_capture [default: 'form', note: 'form, api, equifax, manual']
  is_current tinyint [default: 1]
  valid_from timestamp [not null]
  valid_until timestamp
  created_at timestamp

  indexes {
    (person_id, version) [unique]
  }
}

Table person_reference {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  reference_type enum_ref_type [not null, note: 'personal, family, work, academic']
  relationship varchar [not null, note: 'padre, hermano, amigo, jefe']
  full_name varchar [not null]
  phone varchar [not null]
  phone_secondary varchar
  email varchar
  contact_verified tinyint [default: 0]
  contact_verified_at timestamp
  verification_notes varchar
  display_order tinyint [default: 1]
  is_active tinyint [default: 1]
  captured_from_application_id bigint
  created_at timestamp
  updated_at timestamp
}

Table document_type {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description varchar
  category enum_doc_category [not null, note: 'identity, academic, employment, financial, other']
  allowed_mime_types json [not null, note: '["image/jpeg", "image/png", "application/pdf"]']
  max_file_size_mb tinyint [default: 5]
  min_resolution_px smallint
  is_required_default tinyint [default: 0]
  requires_both_sides tinyint [default: 0]
  max_age_days smallint
  requires_validation tinyint [default: 1]
  instructions text
  example_image_url varchar
  display_order tinyint [default: 0]
  is_active tinyint [default: 1]
  created_at timestamp
}

Table person_document {
  id bigint [pk]
  person_id bigint [not null, ref: > person.id]
  document_type_id bigint [not null, ref: > document_type.id]
  version smallint [not null, default: 1]
  file_url varchar [not null]
  file_name varchar [not null]
  file_mime_type varchar [not null]
  file_size_bytes int [not null]
  file_hash varchar [note: 'SHA256 para detectar duplicados']
  image_width smallint
  image_height smallint
  thumbnail_url varchar
  validation_status enum_validation_status [default: 'pending', note: 'pending, processing, approved, rejected, expired']
  validation_score tinyint [note: 'Score de calidad 0-100']
  validation_notes varchar
  rejection_reason varchar
  validated_at timestamp
  extracted_data json [note: 'Datos extraídos por OCR']
  ocr_confidence tinyint
  captured_from_session_id bigint [ref: > session.id]
  captured_from_application_id bigint
  capture_device varchar [note: 'mobile, desktop, scanner']
  is_current tinyint [default: 1]
  expires_at timestamp
  uploaded_at timestamp
  created_at timestamp

  indexes {
    (person_id, document_type_id, version) [unique]
  }
}

Table application {
  id bigint [pk]
  code varchar [unique, not null, note: 'BC-2025-000001']
  person_id bigint [not null, ref: > person.id]
  session_id bigint [ref: > session.id]
  landing_id bigint [ref: > landing.id]
  contact_version_id bigint [ref: > person_contact_history.id]
  address_version_id bigint [ref: > person_address_history.id]
  academic_version_id bigint [ref: > person_academic_history.id]
  employment_version_id bigint [ref: > person_employment_history.id]
  financial_version_id bigint [ref: > person_financial_history.id]
  product_id bigint [not null, ref: > product.id]
  term_months tinyint [not null]
  monthly_payment decimal [not null]
  initial_payment decimal [default: 0]
  total_amount decimal [not null]
  tea decimal
  tcea decimal
  discount_applied decimal [default: 0]
  coupon_code varchar
  score_final smallint [note: 'Score final calculado']
  score_category char [note: 'A, B, C, D, E']
  equifax_score_used smallint [note: 'Score de Equifax usado']
  risk_level enum_risk_level [note: 'very_low, low, medium, high, very_high']
  rci decimal [note: 'Ratio de carga de deuda']
  debt_to_income_ratio decimal
  status enum_app_status [not null, default: 'draft', note: 'draft, submitted, reviewing, pending_docs, pre_approved, approved, rejected, signed, disbursed, delivered, active, completed, defaulted, cancelled']
  rejection_reason varchar
  rejection_code varchar
  is_returning_customer tinyint [default: 0]
  is_preapproved tinyint [default: 0]
  is_express tinyint [default: 0]
  used_previous_data tinyint [default: 0]
  data_updated_fields json
  submitted_at timestamp
  reviewed_at timestamp
  approved_at timestamp
  rejected_at timestamp
  signed_at timestamp
  disbursed_at timestamp
  delivered_at timestamp
  source varchar
  campaign varchar
  referral_code varchar
  created_at timestamp
  updated_at timestamp
}

Table application_product {
  id bigint [pk]
  application_id bigint [not null, ref: > application.id]
  product_id bigint [not null, ref: > product.id]
  product_type enum_app_product [not null, note: 'main, accessory, insurance']
  quantity tinyint [default: 1]
  unit_price decimal [not null]
  monthly_price decimal [not null]
  discount_applied decimal [default: 0]
  added_at timestamp

  indexes {
    (application_id, product_id) [unique]
  }
}

Table application_document {
  id bigint [pk]
  application_id bigint [not null, ref: > application.id]
  person_document_id bigint [not null, ref: > person_document.id]
  document_type_id bigint [not null, ref: > document_type.id]
  status enum_app_doc_status [default: 'pending', note: 'pending, approved, rejected, reupload_required']
  review_notes varchar
  reviewed_at timestamp
  submitted_at timestamp

  indexes {
    (application_id, document_type_id) [unique]
  }
}

Table application_status_log {
  id bigint [pk]
  application_id bigint [not null, ref: > application.id]
  from_status varchar
  to_status varchar [not null]
  reason varchar
  trigger_type enum_trigger_type [default: 'automatic', note: 'automatic, manual, system, webhook, equifax']
  metadata json
  changed_at timestamp
}
```

```dbml
Table lead {
  id bigint [pk]
  session_id bigint [ref: > session.id]
  landing_id bigint [ref: > landing.id]
  person_id bigint [ref: > person.id]
  email varchar
  phone varchar
  document_type varchar
  document_number varchar
  first_name varchar
  last_step_code varchar
  form_completion_percent tinyint [default: 0]
  quality_score tinyint [note: '0-100 basado en engagement']
  temperature enum_temp [note: 'cold, warm, hot']
  priority enum_priority [note: 'low, medium, high, urgent']
  status enum_lead_status [default: 'new', note: 'new, contacted, interested, qualified, converted, lost']
  traffic_source varchar
  utm_source varchar
  utm_campaign varchar
  device_type varchar
  contacted_count tinyint [default: 0]
  last_contacted_at timestamp
  converted_at timestamp
  created_at timestamp
  updated_at timestamp
}

Table lead_score_rule {
  id bigint [pk]
  name varchar [not null]
  description text
  rule_type enum_rule_type [not null, note: 'page_view, scroll_depth, time_on_site, form_progress, product_view, filter_use, click, return_visit']
  condition_field varchar
  condition_operator enum_operator [note: 'equals, gt, lt, gte, lte, contains, in']
  condition_value varchar
  score_delta int [not null]
  max_applications int
  is_active tinyint [default: 1]
  priority tinyint [default: 0]
  created_at timestamp
}

Table lead_interaction {
  id bigint [pk]
  lead_id bigint [not null, ref: > lead.id]
  interaction_type enum_interaction [not null, note: 'email_sent, sms_sent, whatsapp_sent, call_made, call_received, email_opened, link_clicked']
  channel varchar
  campaign_id bigint
  content_preview varchar
  status enum_interaction_status [note: 'sent, delivered, opened, clicked, bounced, failed']
  notes text
  old_lead_status varchar
  new_lead_status varchar
  created_by bigint [ref: > user_account.id]
  created_at timestamp
}

Table lead_recovery_campaign {
  id bigint [pk]
  name varchar [not null]
  description text
  min_quality_score tinyint
  max_quality_score tinyint
  min_form_completion tinyint
  max_form_completion tinyint
  min_abandoned_hours_ago int
  max_abandoned_hours_ago int
  channel enum_channel [not null, note: 'email, sms, whatsapp, push, retargeting']
  template_id varchar
  message_content text
  send_delay_hours int [default: 1]
  max_sends_per_lead int [default: 3]
  min_hours_between_sends int [default: 24]
  status enum_campaign_status [default: 'draft', note: 'draft, active, paused, completed']
  start_date date
  end_date date
  leads_targeted int [default: 0]
  messages_sent int [default: 0]
  messages_opened int [default: 0]
  clicks int [default: 0]
  conversions int [default: 0]
  created_by bigint [ref: > user_account.id]
  created_at timestamp
  updated_at timestamp
}

// Pivot: Estados de lead objetivo de la campaña (normalizado)
Table lead_campaign_status {
  id bigint [pk]
  campaign_id bigint [not null, ref: > lead_recovery_campaign.id]
  lead_status enum_lead_status [not null, note: 'new, contacted, qualified, hot, warm, cold, converted, lost']
  created_at timestamp

  indexes {
    (campaign_id, lead_status) [unique]
  }
}

// Pivot: Landings objetivo de la campaña (normalizado)
Table lead_campaign_landing {
  id bigint [pk]
  campaign_id bigint [not null, ref: > lead_recovery_campaign.id]
  landing_id bigint [not null, ref: > landing.id]
  created_at timestamp

  indexes {
    (campaign_id, landing_id) [unique]
  }
}

// Pivot: Fuentes de tráfico objetivo de la campaña (normalizado)
Table lead_campaign_source {
  id bigint [pk]
  campaign_id bigint [not null, ref: > lead_recovery_campaign.id]
  traffic_source enum_traffic_source [not null]
  created_at timestamp

  indexes {
    (campaign_id, traffic_source) [unique]
  }
}

Table lead_campaign_send {
  id bigint [pk]
  campaign_id bigint [not null, ref: > lead_recovery_campaign.id]
  lead_id bigint [not null, ref: > lead.id]
  channel varchar [not null]
  status enum_send_status [default: 'pending', note: 'pending, sent, delivered, opened, clicked, converted, failed, bounced']
  scheduled_at timestamp
  sent_at timestamp
  delivered_at timestamp
  opened_at timestamp
  clicked_at timestamp
  converted_at timestamp
  error_message varchar
  created_at timestamp
}
```

```dbml
Table preapproved_customer {
  id bigint [pk]
  document_type enum_doc_type [not null]
  document_number varchar [not null]
  first_name varchar
  last_name varchar
  email varchar
  phone varchar
  source enum_preapproved_source [not null, note: 'bureau, existing_customer, partner, campaign, referral, institution']
  source_detail varchar
  source_file varchar
  imported_at timestamp
  risk_score decimal
  risk_category enum_risk [note: 'A, B, C, D, E']
  debt_ratio decimal
  estimated_income decimal
  max_amount decimal [not null]
  min_amount decimal
  suggested_amount decimal
  max_term_months int
  min_term_months int
  special_rate decimal
  offer_code varchar [unique]
  agreement_id bigint [ref: > agreement.id]
  institution_id bigint [ref: > institution.id]
  valid_from date [not null]
  valid_until date [not null]
  status enum_preapproved_status [default: 'active', note: 'active, contacted, interested, applied, converted, declined, expired, revoked']
  landing_visits int [default: 0]
  last_visit_at timestamp
  session_id bigint [ref: > session.id]
  application_id bigint [ref: > application.id]
  created_at timestamp
  updated_at timestamp

  indexes {
    (document_type, document_number, valid_from) [unique]
  }
}

// Pivot: Productos permitidos para el preaprobado (normalizado)
Table preapproved_product {
  id bigint [pk]
  preapproved_id bigint [not null, ref: > preapproved_customer.id]
  product_id bigint [not null, ref: > product.id]
  created_at timestamp

  indexes {
    (preapproved_id, product_id) [unique]
  }
}

// Pivot: Landings donde puede usar la oferta (normalizado)
Table preapproved_landing {
  id bigint [pk]
  preapproved_id bigint [not null, ref: > preapproved_customer.id]
  landing_id bigint [not null, ref: > landing.id]
  created_at timestamp

  indexes {
    (preapproved_id, landing_id) [unique]
  }
}

Table preapproved_import {
  id bigint [pk]
  file_name varchar [not null]
  source enum_import_source [not null, note: 'equifax, manual, institution']
  import_date date [not null]
  records_total int [not null]
  records_imported int [default: 0]
  records_skipped int [default: 0]
  records_error int [default: 0]
  status enum_import_status [default: 'pending', note: 'pending, processing, completed, failed']
  error_log json
  imported_by bigint [ref: > user_account.id]
  completed_at timestamp
  created_at timestamp
}

Table marketing_campaign {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  description text
  type enum_mkt_campaign_type [not null, note: 'preapproved_outreach, retargeting, seasonal, product_launch, referral, loyalty, winback, awareness']
  objective varchar
  primary_channel enum_channel [not null, note: 'email, sms, whatsapp, push, paid_media, organic_social, offline']
  secondary_channels json [note: 'Canales adicionales (config, no se filtra)']
  target_min_amount decimal
  target_max_amount decimal
  landing_id bigint [ref: > landing.id]
  redirect_url varchar
  utm_source varchar
  utm_medium varchar
  utm_campaign varchar
  utm_content varchar
  offer_type enum_offer [default: 'none', note: 'none, discount, rate_reduction, bonus, gift, free_shipping']
  offer_value varchar
  offer_conditions text
  promo_code varchar
  start_date date [not null]
  end_date date
  send_schedule json [note: 'Horarios de envío (config)']
  budget_amount decimal
  budget_currency varchar [default: 'PEN']
  spent_amount decimal [default: 0]
  status enum_mkt_status [default: 'draft', note: 'draft, scheduled, active, paused, completed, cancelled']
  audience_size int [default: 0]
  messages_sent int [default: 0]
  impressions int [default: 0]
  clicks int [default: 0]
  landing_visits int [default: 0]
  applications_started int [default: 0]
  conversions int [default: 0]
  revenue_generated decimal [default: 0]
  created_by bigint [ref: > user_account.id]
  created_at timestamp
  updated_at timestamp
}

// Pivot: Estados de preaprobados objetivo de la campaña (normalizado)
Table campaign_preapproved_status {
  id bigint [pk]
  campaign_id bigint [not null, ref: > marketing_campaign.id]
  preapproved_status enum_preapproved_status [not null, note: 'active, contacted, interested, applied, converted, declined, expired, revoked']
  created_at timestamp

  indexes {
    (campaign_id, preapproved_status) [unique]
  }
}

// Pivot: Categorías de riesgo objetivo de la campaña (normalizado)
Table campaign_risk_category {
  id bigint [pk]
  campaign_id bigint [not null, ref: > marketing_campaign.id]
  risk_category enum_risk [not null, note: 'A, B, C, D, E']
  created_at timestamp

  indexes {
    (campaign_id, risk_category) [unique]
  }
}

// Pivot: Fuentes de datos objetivo de la campaña (normalizado)
Table campaign_source {
  id bigint [pk]
  campaign_id bigint [not null, ref: > marketing_campaign.id]
  source enum_preapproved_source [not null, note: 'bureau, existing_customer, partner, campaign, referral, institution']
  created_at timestamp

  indexes {
    (campaign_id, source) [unique]
  }
}

// Pivot: Instituciones objetivo de la campaña (normalizado)
Table campaign_institution {
  id bigint [pk]
  campaign_id bigint [not null, ref: > marketing_campaign.id]
  institution_id bigint [not null, ref: > institution.id]
  created_at timestamp

  indexes {
    (campaign_id, institution_id) [unique]
  }
}

// Pivot: Convenios objetivo de la campaña (normalizado)
Table campaign_agreement {
  id bigint [pk]
  campaign_id bigint [not null, ref: > marketing_campaign.id]
  agreement_id bigint [not null, ref: > agreement.id]
  created_at timestamp

  indexes {
    (campaign_id, agreement_id) [unique]
  }
}

Table marketing_campaign_send {
  id bigint [pk]
  campaign_id bigint [not null, ref: > marketing_campaign.id]
  recipient_type enum_recipient [not null, note: 'lead, preapproved, customer']
  recipient_id bigint [not null]
  channel varchar [not null]
  status enum_send_status [default: 'pending']
  sent_at timestamp
  delivered_at timestamp
  opened_at timestamp
  clicked_at timestamp
  converted_at timestamp
  created_at timestamp
}

Table traffic_source_config {
  id bigint [pk]
  traffic_source enum_traffic [unique, not null]
  name varchar [not null]
  detection_rules json
  default_cpc decimal
  default_cpm decimal
  attribution_weight decimal [default: 1.00]
  conversion_window_days int [default: 30]
  is_active tinyint [default: 1]
}

Table referral_program {
  id bigint [pk]
  code varchar [unique, not null]
  name varchar [not null]
  referrer_reward_type enum_reward [not null, note: 'cash, discount, gift, points']
  referrer_reward_value decimal [not null]
  referee_reward_type enum_reward
  referee_reward_value decimal
  max_referrals_per_user int
  valid_from date [not null]
  valid_until date
  status enum_program_status [default: 'draft', note: 'draft, active, paused, completed']
  total_referrals int [default: 0]
  successful_conversions int [default: 0]
  created_at timestamp
}

Table referral {
  id bigint [pk]
  program_id bigint [not null, ref: > referral_program.id]
  referrer_application_id bigint [ref: > application.id]
  referrer_code varchar [unique, not null]
  referee_email varchar
  referee_phone varchar
  referee_session_id bigint [ref: > session.id]
  referee_application_id bigint [ref: > application.id]
  status enum_referral_status [default: 'pending', note: 'pending, clicked, registered, applied, approved, disbursed, reward_pending, reward_paid, expired, invalid']
  referrer_reward_amount decimal
  referrer_reward_paid_at timestamp
  referee_reward_amount decimal
  invited_at timestamp
  clicked_at timestamp
  converted_at timestamp
}
```

### 17.10 Diagrama de Relaciones Completo

```dbml
// CORE
// institution -< institution_campus (1:N)
// institution -< agreement (1:N)
// institution -< person_academic_history (1:N)

// PRODUCTS
// brand -< product (1:N)
// product -< product_spec (1:1)
// product -< product_image (1:N)
// product -< product_pricing (1:N)
// product -< accessory (1:N)
// product -< combo_item (1:N)
// product -< landing_product (1:N)
// product -< event_click (1:N)
// product -< event_hover (1:N)
// product -< event_product (1:N)
// product -< event_modal (1:N)
// combo -< combo_item (1:N)

// LANDING CONFIGURATION
// landing_template -< landing (1:N)
// landing_template -< landing_inheritance (1:N)
// landing -< landing_inheritance (1:N)
// landing -< landing_feature (1:N)
// landing -< landing_promotion (1:N)
// landing -< landing_product (1:N)
// landing -< landing_accessory (1:N)
// landing -< landing_insurance (1:N)
// landing -< landing_step (1:N)
// landing -< landing_field (1:N)
// landing -< landing_filter (1:N)
// landing -< session (1:N)
// landing -< lead (1:N)
// landing -< application (1:N)

// FORM BUILDER
// form_step -< form_field_group (1:N)
// form_step -< form_field (1:N)
// form_step -< landing_step (1:N)
// form_field -< landing_field (1:N)
// form_field -< event_input (1:N)
// landing_field -< field_validation (1:N)
// landing_field -< field_option (1:N)
// landing_field -< field_dependency (1:N)

// CATALOG & FILTERS
// filter_definition -< filter_value (1:N)
// filter_definition -< landing_filter (1:N)
// filter_definition -< event_filter (1:N)

// EVENT TRACKING
// session -< page_view (1:N)
// session -< event_scroll (1:N)
// session -< event_click (1:N)
// session -< event_hover (1:N)
// session -< event_input (1:N)
// session -< event_filter (1:N)
// session -< event_product (1:N)
// session -< event_modal (1:N)
// session -< event_form (1:N)
// session -< event_navigation (1:N)
// session -< event_error (1:N)
// session -< event_custom (1:N)
// session -< lead (1:1)
// session -< application (1:N)

// PERSON & APPLICATION (Equifax)
// person -< session (1:N) - vinculación cross-session cuando usuario se identifica
// person -< person_contact_history (1:N)
// person -< person_address_history (1:N)
// person -< person_academic_history (1:N)
// person -< person_employment_history (1:N)
// person -< person_financial_history (1:N)
// person -< person_reference (1:N)
// person -< person_document (1:N)
// person -< application (1:N)
// person -< lead (1:1)
// document_type -< person_document (1:N)
// document_type -< application_document (1:N)
// application -< application_product (1:N)
// application -< application_document (1:N)
// application -< application_status_log (1:N)

// LEADS
// lead -< lead_interaction (1:N)
// lead -< lead_campaign_send (1:N)
// lead_recovery_campaign -< lead_campaign_send (1:N)

// MARKETING
// preapproved_import -< preapproved_customer (1:N)
// marketing_campaign -< marketing_campaign_send (1:N)
// referral_program -< referral (1:N)
// application -< referral (1:N via referrer_application_id)
// application -< preapproved_customer (1:1 via converted_application_id)
```

---

## 18. CHANGELOG - Actualización v3.0 (Frontend v0.5)

**Fecha:** Enero 2026 | **Motivo:** Soporte completo para Frontend v0.5

Esta sección documenta todas las actualizaciones realizadas para soportar el frontend v0.5, incluyendo nuevas tablas, campos adicionales y datos semilla.

### 18.1 Resumen de Cambios

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| **Tablas Nuevas** | 28 | Colores, Quiz, Contenido Landing, Resultados, Finanzas |
| **Tablas Modificadas** | 5 | Campos adicionales para soporte completo |
| **Campos Nuevos** | ~70 | En tablas existentes |

---

### 18.2 NUEVAS TABLAS - Sistema de Colores

#### 18.2.1 color

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

#### 18.2.2 product_color

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

### 18.3 NUEVAS TABLAS - Sistema de Uso y Gama

#### 18.3.1 usage_type

Tipos de uso recomendado para productos.

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

#### 18.3.2 product_usage

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

#### 18.3.3 gama_tier

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

---

### 18.4 NUEVAS TABLAS - Sistema de Quiz

#### 18.4.1 quiz

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

#### 18.4.2 quiz_question

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

#### 18.4.3 quiz_option

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

#### 18.4.4 quiz_option_filter_mapping

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

#### 18.4.5 quiz_result_template

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

### 18.5 NUEVAS TABLAS - Contenido de Landing

#### 18.5.1 landing_nav_item

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

#### 18.5.2 landing_testimonial

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

#### 18.5.3 landing_faq

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

#### 18.5.4 landing_how_it_works_step

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

#### 18.5.5 landing_requirement

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

#### 18.5.6 landing_trust_signal

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

#### 18.5.7 landing_social_proof

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

#### 18.5.8 media_mention

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

#### 18.5.9 landing_footer_link

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

### 18.6 NUEVAS TABLAS - Páginas de Resultado

#### 18.6.1 result_page_config

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

#### 18.6.2 result_next_step

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

#### 18.6.3 rejection_reason

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
 'Basándonos en la información proporcionada, el monto mensual supera el 30% de tus ingresos declarados.',
 'Considera un equipo de menor valor o aumenta tu inicial para reducir la cuota mensual.', 30),
('no_student_status', 'No es estudiante activo', 'Verificación de estudios',
 'No pudimos verificar tu condición de estudiante activo. Este programa está diseñado exclusivamente para estudiantes.',
 'Asegúrate de tener tu constancia de estudios actualizada del ciclo actual.', 15),
('document_issues', 'Problemas con documentos', 'Documentación incompleta',
 'Algunos documentos no pudieron ser verificados correctamente.',
 'Revisa que tu DNI esté vigente y tu constancia de estudios sea del ciclo actual.', 7);
```

#### 18.6.4 rejection_educational_content

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

### 18.7 NUEVAS TABLAS - Comparador

#### 18.7.1 comparator_config

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

#### 18.7.2 comparator_spec

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

### 18.8 NUEVAS TABLAS - Financiamiento

#### 18.8.1 financing_term

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

#### 18.8.2 down_payment_option

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

### 18.9 NUEVAS TABLAS - Form Builder

#### 18.9.1 field_tooltip

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

---

### 18.10 TABLAS MODIFICADAS

#### 18.10.1 Modificaciones a `spec_definition`

```sql
ALTER TABLE `spec_definition` ADD COLUMN `tooltip_title` VARCHAR(100) AFTER `icon`;
ALTER TABLE `spec_definition` ADD COLUMN `tooltip_description` TEXT AFTER `tooltip_title`;
ALTER TABLE `spec_definition` ADD COLUMN `tooltip_recommendation` VARCHAR(300) AFTER `tooltip_description`;
ALTER TABLE `spec_definition` ADD COLUMN `min_value` DECIMAL(15,4) AFTER `tooltip_recommendation`;
ALTER TABLE `spec_definition` ADD COLUMN `max_value` DECIMAL(15,4) AFTER `min_value`;
ALTER TABLE `spec_definition` ADD COLUMN `step_value` DECIMAL(15,4) AFTER `max_value`;
ALTER TABLE `spec_definition` ADD COLUMN `filter_display_type` ENUM('chips', 'slider', 'checkbox', 'radio', 'dropdown') DEFAULT 'chips' AFTER `step_value`;
```

#### 18.10.2 Modificaciones a `product`

```sql
ALTER TABLE `product` ADD COLUMN `gama_tier_id` BIGINT UNSIGNED AFTER `warranty_months`;
ALTER TABLE `product` ADD COLUMN `stock_status` ENUM('in_stock', 'low_stock', 'out_of_stock', 'preorder', 'discontinued') DEFAULT 'in_stock' AFTER `min_stock_alert`;
ALTER TABLE `product` ADD COLUMN `delivery_days_min` TINYINT UNSIGNED DEFAULT 3 AFTER `weight_kg`;
ALTER TABLE `product` ADD COLUMN `delivery_days_max` TINYINT UNSIGNED DEFAULT 7 AFTER `delivery_days_min`;

ALTER TABLE `product` ADD CONSTRAINT `fk_product_gama`
  FOREIGN KEY (`gama_tier_id`) REFERENCES `gama_tier` (`id`);
```

#### 18.10.3 Modificaciones a `form_field`

```sql
ALTER TABLE `form_field` ADD COLUMN `tooltip_text` VARCHAR(300) AFTER `help_text`;
ALTER TABLE `form_field` ADD COLUMN `info_modal_title` VARCHAR(100) AFTER `tooltip_text`;
ALTER TABLE `form_field` ADD COLUMN `info_modal_content` TEXT AFTER `info_modal_title`;
ALTER TABLE `form_field` ADD COLUMN `autocomplete` VARCHAR(50) AFTER `info_modal_content`;
ALTER TABLE `form_field` ADD COLUMN `input_mode` VARCHAR(20) AFTER `autocomplete`;
ALTER TABLE `form_field` ADD COLUMN `prefix` VARCHAR(20) AFTER `input_mode`;
ALTER TABLE `form_field` ADD COLUMN `suffix` VARCHAR(20) AFTER `prefix`;
ALTER TABLE `form_field` ADD COLUMN `mask` VARCHAR(50) AFTER `suffix`;
```

#### 18.10.4 Modificaciones a `landing`

```sql
-- Hero Configuration
ALTER TABLE `landing` ADD COLUMN `hero_headline` VARCHAR(200) AFTER `hero_config`;
ALTER TABLE `landing` ADD COLUMN `hero_subheadline` VARCHAR(300) AFTER `hero_headline`;
ALTER TABLE `landing` ADD COLUMN `hero_image_url` VARCHAR(500) AFTER `hero_subheadline`;
ALTER TABLE `landing` ADD COLUMN `hero_image_position` ENUM('left', 'right', 'center', 'background') DEFAULT 'right' AFTER `hero_image_url`;
ALTER TABLE `landing` ADD COLUMN `hero_cta_text` VARCHAR(50) AFTER `hero_image_position`;
ALTER TABLE `landing` ADD COLUMN `hero_cta_url` VARCHAR(300) AFTER `hero_cta_text`;
ALTER TABLE `landing` ADD COLUMN `hero_secondary_cta_text` VARCHAR(50) AFTER `hero_cta_url`;
ALTER TABLE `landing` ADD COLUMN `hero_secondary_cta_url` VARCHAR(300) AFTER `hero_secondary_cta_text`;

-- Theme Configuration
ALTER TABLE `landing` ADD COLUMN `primary_color` VARCHAR(7) DEFAULT '#4654CD' AFTER `theme_overrides`;
ALTER TABLE `landing` ADD COLUMN `secondary_color` VARCHAR(7) DEFAULT '#03DBD0' AFTER `primary_color`;
ALTER TABLE `landing` ADD COLUMN `accent_color` VARCHAR(7) AFTER `secondary_color`;
ALTER TABLE `landing` ADD COLUMN `min_monthly_quota` DECIMAL(10,2) AFTER `accent_color`;

-- Navbar Configuration
ALTER TABLE `landing` ADD COLUMN `navbar_style` ENUM('transparent', 'solid', 'gradient') DEFAULT 'transparent' AFTER `min_monthly_quota`;
ALTER TABLE `landing` ADD COLUMN `show_promo_banner` TINYINT(1) DEFAULT 0 AFTER `navbar_style`;
ALTER TABLE `landing` ADD COLUMN `promo_banner_text` VARCHAR(200) AFTER `show_promo_banner`;
ALTER TABLE `landing` ADD COLUMN `promo_banner_url` VARCHAR(300) AFTER `promo_banner_text`;

-- WhatsApp Configuration
ALTER TABLE `landing` ADD COLUMN `whatsapp_number` VARCHAR(20) AFTER `promo_banner_url`;
ALTER TABLE `landing` ADD COLUMN `whatsapp_message` VARCHAR(300) AFTER `whatsapp_number`;
ALTER TABLE `landing` ADD COLUMN `show_whatsapp_float` TINYINT(1) DEFAULT 1 AFTER `whatsapp_message`;
```

#### 18.10.5 Modificaciones a `filter_definition`

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

---

### 18.11 Nuevas Relaciones (DBML)

```dbml
// PRODUCTS - Nuevas relaciones v3.0
// product -< product_color (1:N)
// color -< product_color (1:N)
// product -< product_usage (1:N)
// usage_type -< product_usage (1:N)
// gama_tier -< product (1:N)

// QUIZ
// landing -< quiz (1:N)
// quiz -< quiz_question (1:N)
// quiz_question -< quiz_option (1:N)
// quiz_option -< quiz_option_filter_mapping (1:N)
// quiz -< quiz_result_template (1:N)

// LANDING CONTENT
// landing -< landing_nav_item (1:N)
// landing -< landing_testimonial (1:N)
// landing -< landing_faq (1:N)
// landing -< landing_how_it_works_step (1:N)
// landing -< landing_requirement (1:N)
// landing -< landing_trust_signal (1:N)
// landing -< landing_social_proof (1:1)
// landing -< landing_footer_link (1:N)

// RESULT PAGES
// landing -< result_page_config (1:N)
// result_page_config -< result_next_step (1:N)
// rejection_reason -< rejection_educational_content (1:N)

// COMPARATOR
// landing -< comparator_config (1:1)
// comparator_config -< comparator_spec (1:N)
// spec_definition -< comparator_spec (1:N)

// FORM BUILDER
// form_field -< field_tooltip (1:N)
// landing -< field_tooltip (1:N)
```

---

### 18.12 Campos para Tracking de Versiones (API_ENDPOINTS.md)

Campos agregados para soportar el tracking de qué versión de landing generó cada lead y solicitud, permitiendo A/B testing y análisis de conversión por versión.

#### 18.12.1 Modificaciones a `landing`

```sql
-- Campos de versionamiento y staging
ALTER TABLE `landing` ADD COLUMN `current_version_id` BIGINT UNSIGNED COMMENT 'Versión actualmente publicada en producción' AFTER `institution_id`;
ALTER TABLE `landing` ADD COLUMN `staging_version_id` BIGINT UNSIGNED COMMENT 'Versión en staging/preview' AFTER `current_version_id`;
ALTER TABLE `landing` ADD COLUMN `status` ENUM('draft', 'staging', 'published', 'archived') DEFAULT 'draft' COMMENT 'Estado del landing' AFTER `staging_version_id`;

-- Índices
ALTER TABLE `landing` ADD KEY `idx_landing_status` (`status`);
ALTER TABLE `landing` ADD KEY `idx_landing_current_version` (`current_version_id`);
ALTER TABLE `landing` ADD KEY `idx_landing_staging_version` (`staging_version_id`);

-- Foreign keys (referencia circular, se crea después de landing_version)
ALTER TABLE `landing` ADD CONSTRAINT `fk_landing_current_version` FOREIGN KEY (`current_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL;
ALTER TABLE `landing` ADD CONSTRAINT `fk_landing_staging_version` FOREIGN KEY (`staging_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL;
```

#### 18.12.2 Modificaciones a `lead`

```sql
-- Campo para tracking de versión
ALTER TABLE `lead` ADD COLUMN `landing_version_id` BIGINT UNSIGNED COMMENT 'Versión de landing que generó este lead' AFTER `landing_id`;

-- Índice
ALTER TABLE `lead` ADD KEY `idx_lead_landing_version` (`landing_version_id`);

-- Foreign key
ALTER TABLE `lead` ADD CONSTRAINT `fk_lead_landing_version` FOREIGN KEY (`landing_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL;
```

#### 18.12.3 Modificaciones a `application`

```sql
-- Campo para tracking de versión
ALTER TABLE `application` ADD COLUMN `landing_version_id` BIGINT UNSIGNED COMMENT 'Versión de landing que generó esta solicitud' AFTER `landing_id`;

-- Índice
ALTER TABLE `application` ADD KEY `idx_app_landing_version` (`landing_version_id`);

-- Foreign key
ALTER TABLE `application` ADD CONSTRAINT `fk_app_landing_version` FOREIGN KEY (`landing_version_id`) REFERENCES `landing_version` (`id`) ON DELETE SET NULL;
```

#### 18.12.4 Queries de Análisis por Versión

```sql
-- Leads por versión de landing
SELECT
  lv.id AS version_id,
  lv.version_number,
  lv.name AS version_name,
  lv.status AS version_status,
  COUNT(l.id) AS total_leads,
  SUM(CASE WHEN l.status = 'converted' THEN 1 ELSE 0 END) AS converted_leads,
  ROUND(SUM(CASE WHEN l.status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(l.id), 2) AS conversion_rate
FROM landing_version lv
LEFT JOIN lead l ON l.landing_version_id = lv.id
WHERE lv.landing_id = ?
GROUP BY lv.id, lv.version_number, lv.name, lv.status
ORDER BY lv.version_number DESC;

-- Solicitudes por versión de landing
SELECT
  lv.id AS version_id,
  lv.version_number,
  lv.name AS version_name,
  COUNT(a.id) AS total_applications,
  SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved,
  SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
  SUM(CASE WHEN a.status = 'disbursed' THEN 1 ELSE 0 END) AS disbursed,
  ROUND(SUM(CASE WHEN a.status IN ('approved', 'disbursed') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0), 2) AS approval_rate
FROM landing_version lv
LEFT JOIN application a ON a.landing_version_id = lv.id
WHERE lv.landing_id = ?
GROUP BY lv.id, lv.version_number, lv.name
ORDER BY lv.version_number DESC;

-- Comparación de conversión entre versiones (A/B testing)
SELECT
  lv.version_number,
  lv.name,
  lv.published_at,
  COUNT(DISTINCT l.id) AS leads,
  COUNT(DISTINCT a.id) AS applications,
  ROUND(COUNT(DISTINCT a.id) * 100.0 / NULLIF(COUNT(DISTINCT l.id), 0), 2) AS lead_to_app_rate
FROM landing_version lv
LEFT JOIN lead l ON l.landing_version_id = lv.id
LEFT JOIN application a ON a.landing_version_id = lv.id
WHERE lv.landing_id = ?
  AND lv.status = 'published'
GROUP BY lv.id, lv.version_number, lv.name, lv.published_at
ORDER BY lv.published_at DESC;
```

---

### 18.13 Resumen Final de Cambios v3.0

| Categoría | v2.0 | v3.0 | Diferencia |
|-----------|------|------|------------|
| **Total Tablas** | 99 | 127 | +28 |
| **Módulos** | 10 | 14 | +4 |
| **Tablas Products** | 15 | 20 | +5 |
| **Tablas Landing** | 14 | 23 | +9 |
| **Tablas Form** | 8 | 9 | +1 |
| **Tablas Filters** | 4 | 6 | +2 |
| **Campos Nuevos** | - | ~75 | +75 |

**Nuevos Módulos:**
1. **Quiz** (5 tablas) - Sistema de quiz configurable con mapeo a filtros
2. **Result Pages** (4 tablas) - Configuración de páginas de resultado
3. **Finance** (2 tablas) - Plazos y opciones de inicial
4. **Landing Content** (9 tablas) - Contenido dinámico de landing

**Campos de Tracking Agregados (API_ENDPOINTS.md):**
- `landing.current_version_id` - Versión publicada
- `landing.staging_version_id` - Versión en preview
- `landing.status` - Estado del landing
- `lead.landing_version_id` - Tracking de versión en leads
- `application.landing_version_id` - Tracking de versión en solicitudes

**Documentación relacionada:**
- Ver `Actualizaciones DB para Frontend v0.5.md` para detalles adicionales
- Ver `Rediseño Baldecash 3.0 Tablas de UI.md` para tablas UI-específicas
- Ver `API_ENDPOINTS.md` para endpoints de versionamiento

---

*BaldeCash Platform v3.0 Rediseño - Enero 2026*
