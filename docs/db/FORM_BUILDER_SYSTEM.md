# Sistema de Flujos Dinamicos - Form Builder

Este documento describe la arquitectura completa del sistema de formularios dinamicos, plantillas, versionado y staging para landings.

---

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Plantillas (Templates)](#plantillas-templates)
3. [Crear Nueva Landing](#crear-nueva-landing)
4. [Actualizar Landing Existente](#actualizar-landing-existente)
5. [Sistema de Versionado y Staging](#sistema-de-versionado-y-staging)
6. [Historial de Cambios (Changelog)](#historial-de-cambios-changelog)
7. [Tracking de Versiones en Solicitudes](#tracking-de-versiones-en-solicitudes)
8. [Referencia de Endpoints](#referencia-de-endpoints)
9. [Ejemplos de Flujos](#ejemplos-de-flujos)
10. [Credenciales y URLs de Prueba](#credenciales-y-urls-de-prueba)

---

## Arquitectura General

El sistema tiene 4 capas principales:

```
+-----------------------------------------------------------------------------+
|                            PLANTILLAS (Templates)                           |
+-----------------------------------------------------------------------------+
|  LandingTemplate                                                            |
|  +-- code: "normal", "express", "completo"                                  |
|  +-- default_config: {primary_color, hero_title, ...}                       |
|  +-- default_steps: {steps: [...], fields: [...]}                           |
|  +-- default_components: {home_components}                                  |
|  +-- default_filters: {filters}                                             |
|  +-- default_features: {chat, faq, simulator, ...}                          |
|  +-- is_system: true/false (protegida o no)                                 |
+-----------------------------------------------------------------------------+
                                    |
                                    v (al crear landing)
+-----------------------------------------------------------------------------+
|                         CATALOGO MAESTRO                                    |
+-----------------------------------------------------------------------------+
|  FormStep (Pasos reutilizables)     FormField (Campos maestros)             |
|  +-- step_identity (system)          +-- document_type                      |
|  +-- step_contact (system)           +-- document_number                    |
|  +-- step_academic (system)          +-- email                              |
|  +-- step_work (system)              +-- phone                              |
|  +-- step_upsell (system/UPSELL)     +-- institution_name                   |
|  +-- step_confirmation (system)      +-- ... (21 campos)                    |
|  +-- step_upn_quick (custom)                                                |
+-----------------------------------------------------------------------------+
                                    |
                                    v (asociacion por landing)
+-----------------------------------------------------------------------------+
|                     CONFIGURACION POR LANDING                               |
+-----------------------------------------------------------------------------+
|  LandingStep (enlaza paso a landing)                                        |
|  +-- landing_id: 1                                                          |
|  +-- step_id: 1 (step_identity)                                             |
|  +-- display_order: 0  <---- DEFINE EL ORDEN                                |
|  +-- is_enabled: true                                                       |
|  +-- is_required: true                                                      |
|  +-- custom_title: "Tus Datos"                                              |
|                                                                             |
|  LandingField (asigna campo a paso de landing)                              |
|  +-- landing_step_id: 1                                                     |
|  +-- field_id: 1 (document_type)                                            |
|  +-- display_order: 0                                                       |
|  +-- is_visible: true                                                       |
|  +-- is_required: true                                                      |
|  +-- is_prefilled: false                                                    |
|  +-- custom_label: "Tipo de Documento"                                      |
+-----------------------------------------------------------------------------+
                                    |
                                    v (al publicar version)
+-----------------------------------------------------------------------------+
|                  VERSIONADO Y STAGING                                       |
+-----------------------------------------------------------------------------+
|  LandingVersion (snapshots de configuracion)                                |
|  +-- version_number: 1, 2, 3...                                             |
|  +-- status: DRAFT -> PENDING -> APPROVED -> PUBLISHED                      |
|  +-- form_config_snapshot: JSON (config completa al publicar)               |
|  +-- published_at: timestamp                                                |
|                                                                             |
|  LandingChangeLog (historial de cambios automatico)                         |
|  +-- change_type: STEP_ADDED, FIELD_UPDATED, etc.                           |
|  +-- entity_type: landing_step, landing_field                               |
|  +-- old_value / new_value: JSON                                            |
|  +-- changed_by / changed_at                                                |
+-----------------------------------------------------------------------------+
```

---

## Plantillas (Templates)

Las plantillas definen configuraciones predeterminadas que se aplican al crear o actualizar landings.

### Que Contiene una Plantilla

| Campo | Descripcion | Ejemplo |
|-------|-------------|---------|
| `code` | Identificador unico | "normal", "express" |
| `name` | Nombre visible | "Flujo Normal" |
| `default_config` | Configuracion visual | `{"primary_color": "#2563EB"}` |
| `default_steps` | Pasos y campos del formulario | Ver estructura abajo |
| `default_components` | Componentes del home | `{"hero": {...}}` |
| `default_filters` | Filtros de productos | `[{filter_config}]` |
| `default_features` | Features habilitadas | `{"chat": true, "faq": true}` |
| `is_system` | Si es plantilla del sistema | `true` = no se puede eliminar |

### Estructura de default_steps

```json
{
  "steps": [
    {
      "step_code": "step_identity",
      "display_order": 0,
      "is_enabled": true,
      "is_required": true,
      "custom_title": "Identificacion",
      "fields": [
        {
          "field_code": "document_type",
          "display_order": 0,
          "is_visible": true,
          "is_required": true,
          "custom_label": "Tipo de Documento",
          "custom_placeholder": "Selecciona...",
          "custom_help_text": "DNI para peruanos"
        },
        {
          "field_code": "document_number",
          "display_order": 1,
          "is_visible": true,
          "is_required": true
        }
      ]
    },
    {
      "step_code": "step_contact",
      "display_order": 1,
      "fields": [...]
    }
  ]
}
```

### Endpoints de Plantillas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/landing-templates` | Lista todas las plantillas |
| GET | `/api/v1/landing-templates/{id}` | Detalle de plantilla |
| GET | `/api/v1/landing-templates/code/{code}` | Plantilla por codigo |
| POST | `/api/v1/landing-templates` | Crear nueva plantilla |
| PUT | `/api/v1/landing-templates/{id}` | Actualizar plantilla |
| DELETE | `/api/v1/landing-templates/{id}` | Eliminar plantilla (soft) |
| POST | `/api/v1/landing-templates/{id}/duplicate` | Duplicar plantilla |
| GET | `/api/v1/landing-templates/{id}/landings` | Landings usando esta plantilla |

---

## Crear Nueva Landing

### Paso a Paso Completo

#### 1. Obtener Plantillas Disponibles

```http
GET /api/v1/landing-templates?is_active=true
Authorization: Bearer {token}
```

Response:
```json
{
  "items": [
    {
      "id": 1,
      "code": "normal",
      "name": "Flujo Normal",
      "description": "Formulario de 4 pasos estandar",
      "landings_count": 5,
      "is_system": true
    },
    {
      "id": 2,
      "code": "express",
      "name": "Flujo Express",
      "description": "Formulario rapido de 1 paso",
      "landings_count": 2
    }
  ],
  "total": 2
}
```

#### 2. Ver Detalle de Plantilla (Opcional)

```http
GET /api/v1/landing-templates/1
Authorization: Bearer {token}
```

Response con `default_steps`, `default_config`, etc.

#### 3. Crear Landing con Plantilla

```http
POST /api/v1/landings
Authorization: Bearer {token}
Content-Type: application/json

{
  "slug": "nueva-landing-senati",
  "name": "Landing SENATI 2025",
  "institution_id": 1,
  "agreement_id": 1,
  "template_id": 1,
  "apply_template_defaults": true
}
```

Response:
```json
{
  "id": 10,
  "slug": "nueva-landing-senati",
  "name": "Landing SENATI 2025",
  "template_id": 1,
  "created_from_template_id": 1,
  "status": "draft",
  "created_at": "2025-12-27T10:00:00Z"
}
```

**Que sucede internamente:**
1. Se crea el registro `Landing`
2. Se copia `template.default_config` -> campos visuales de landing
3. Se crea `LandingStep` para cada paso en `template.default_steps`
4. Se crea `LandingField` para cada campo en cada paso
5. Se crean `HomeComponent` desde `template.default_components`
6. Se crean `LandingFilter` desde `template.default_filters`
7. Se crean `LandingFeature` desde `template.default_features`

#### 4. Verificar Configuracion Creada

```http
GET /api/v1/landings/10/config
Authorization: Bearer {token}
```

Response con toda la configuracion del formulario.

#### 5. (Opcional) Personalizar Configuracion

Ahora puedes ajustar la configuracion heredada de la plantilla:

```http
# Cambiar orden de un paso
PUT /api/v1/landings/10/steps/1
{"display_order": 2, "custom_title": "Datos Personales SENATI"}

# Hacer un campo opcional
PUT /api/v1/landings/10/steps/1/fields/5
{"is_required": false}

# Agregar campo adicional
POST /api/v1/landings/10/steps/1/fields
{"field_id": 15, "is_required": true}
```

#### 6. Crear Version y Publicar

```http
# Crear version (snapshot)
POST /api/v1/landings/10/versions
{"name": "Version Inicial", "notes": "Configuracion base desde plantilla normal"}

# Publicar
POST /api/v1/landings/10/versions/1/publish
```

---

## Actualizar Landing Existente

### Opcion 1: Cambiar Plantilla Completa

Si quieres REEMPLAZAR toda la configuracion de una landing existente con una nueva plantilla:

```http
POST /api/v1/landings/10/apply-template
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_id": 2,
  "apply_config": true,
  "apply_steps": true,
  "apply_components": true,
  "apply_filters": true,
  "apply_features": true
}
```

Response:
```json
{
  "template_id": 2,
  "template_code": "express",
  "template_name": "Flujo Express",
  "applied_sections": ["config", "steps", "components", "filters", "features"],
  "steps_created": 1,
  "fields_created": 7
}
```

**IMPORTANTE**: Esto reemplaza la configuracion existente. Los pasos y campos anteriores se eliminan.

### Opcion 2: Aplicar Solo Algunas Secciones

```http
POST /api/v1/landings/10/apply-template
{
  "template_id": 3,
  "apply_config": true,
  "apply_steps": false,
  "apply_components": false,
  "apply_filters": false,
  "apply_features": false
}
```

Esto solo actualiza los colores/hero/visual, sin tocar los pasos del formulario.

### Opcion 3: Editar Manualmente (Sin Cambiar Plantilla)

#### 3.1 Agregar un Nuevo Paso

```http
POST /api/v1/landings/10/steps
Authorization: Bearer {token}
Content-Type: application/json

{
  "step_id": 5,
  "is_enabled": true,
  "is_required": true,
  "display_order": 3,
  "custom_title": "Referencias Personales"
}
```

#### 3.2 Reordenar Pasos

```http
PUT /api/v1/landings/10/steps/reorder
{
  "step_order": [1, 3, 2, 4]
}
```

#### 3.3 Modificar Configuracion de un Paso

```http
PUT /api/v1/landings/10/steps/3
{
  "is_required": false,
  "is_skippable": true,
  "custom_title": "Informacion Laboral (Opcional)"
}
```

#### 3.4 Remover un Paso

```http
DELETE /api/v1/landings/10/steps/5
```

#### 3.5 Agregar Campo a un Paso

```http
POST /api/v1/landings/10/steps/1/fields
{
  "field_id": 12,
  "is_visible": true,
  "is_required": true,
  "display_order": 5,
  "custom_label": "Numero de Celular",
  "custom_placeholder": "999 999 999"
}
```

#### 3.6 Modificar Campo Existente

```http
PUT /api/v1/landings/10/steps/1/fields/3
{
  "is_required": true,
  "is_visible": true,
  "custom_label": "Correo Electronico Institucional",
  "custom_help_text": "Usa tu correo @senati.pe"
}
```

#### 3.7 Reordenar Campos dentro de un Paso

```http
PUT /api/v1/landings/10/steps/1/fields/reorder
{
  "field_order": [1, 3, 2, 4, 5]
}
```

#### 3.8 Remover Campo de un Paso

```http
DELETE /api/v1/landings/10/steps/1/fields/7
```

### Opcion 4: Ver Campos Disponibles para Agregar

```http
GET /api/v1/landings/10/available-fields
```

Retorna campos del catalogo que aun no estan asignados a ningun paso de esta landing.

---

## Sistema de Versionado y Staging

### Flujo de Trabajo

```
┌──────────────────────────────────────────────────────────────────┐
│                      ADMIN WORKSPACE                              │
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │ Edit Steps  │ -> │  Preview    │ -> │  Create     │           │
│  │ Edit Fields │    │  (Admin)    │    │  Version    │           │
│  └─────────────┘    └─────────────┘    └─────────────┘           │
│         │                                     │                   │
│         v                                     v                   │
│  ┌──────────────────────────────────────────────────┐            │
│  │               CHANGELOG (Automatico)              │            │
│  │   - STEP_ADDED, FIELD_UPDATED, etc.              │            │
│  │   - old_value, new_value, changed_by             │            │
│  └──────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
                                │
                                v
        ┌───────────────────────────────────────────────┐
        │              VERSION WORKFLOW                  │
        │                                                │
        │   DRAFT -> PENDING_REVIEW -> APPROVED          │
        │              │                   │             │
        │              v                   v             │
        │           REJECTED           PUBLISHED         │
        └───────────────────────────────────────────────┘
                                                │
                                                v
┌──────────────────────────────────────────────────────────────────┐
│                       PUBLIC ENDPOINT                             │
│                                                                   │
│  GET /public/landing/{slug}/form                                 │
│  Lee de: landing.current_version.form_config_snapshot (JSON)     │
│  NO lee de tablas LandingStep/LandingField directamente          │
└──────────────────────────────────────────────────────────────────┘
```

### Estados de Version

```python
class VersionStatus(str, enum.Enum):
    DRAFT = "draft"              # Borrador, editable
    PENDING_REVIEW = "pending"   # Enviado a revision
    APPROVED = "approved"        # Aprobado, listo para publicar
    PUBLISHED = "published"      # Activo en produccion
    REJECTED = "rejected"        # Rechazado, requiere cambios
```

### Separacion Admin vs Publico

| Endpoint | Lee de... | Uso |
|----------|-----------|-----|
| `GET /api/v1/landings/{id}/config` | Tablas LandingStep/LandingField | Admin preview |
| `GET /public/landing/{slug}/form` | LandingVersion.form_config_snapshot | Visitantes |

**IMPORTANTE**: Los cambios del admin NO afectan al publico hasta publicar nueva version.

### Endpoints de Versionado

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/landings/{id}/versions` | Lista todas las versiones |
| POST | `/api/v1/landings/{id}/versions` | Crear nueva version (snapshot) |
| GET | `/api/v1/landings/{id}/versions/{ver}` | Detalle de version |
| POST | `/api/v1/landings/{id}/versions/{ver}/submit` | Enviar a revision |
| POST | `/api/v1/landings/{id}/versions/{ver}/review` | Aprobar/Rechazar |
| POST | `/api/v1/landings/{id}/versions/{ver}/publish` | Publicar version |
| GET | `/api/v1/landings/{id}/versions/{ver}/stats` | Estadisticas por version |

### Flujo Completo de Publicacion

```bash
# 1. Admin hace cambios (se guardan en tablas)
PUT /api/v1/landings/1/steps/3/fields/5
{"is_required": true}

# 2. Admin verifica cambios (preview)
GET /api/v1/landings/1/config

# 3. Crear nueva version (captura snapshot)
POST /api/v1/landings/1/versions
{"name": "v2.0 - Campo email requerido", "notes": "Se hizo obligatorio el email"}

# 4. (Opcional) Enviar a revision
POST /api/v1/landings/1/versions/2/submit

# 5. (Opcional) Aprobar/Rechazar
POST /api/v1/landings/1/versions/2/review
{"approved": true, "notes": "Aprobado por gerencia"}

# 6. Publicar
POST /api/v1/landings/1/versions/2/publish

# 7. El publico ahora ve la nueva version
GET /public/landing/default/form
# Retorna el snapshot de version 2
```

### Consultar Estado de Staging

Para saber si una landing tiene cambios pendientes y que acciones estan disponibles:

```http
GET /api/v1/landings/1/staging-status
```

**Response:**
```json
{
  "landing_id": 1,
  "landing_status": "staging",
  "is_staging": true,
  "has_published_version": true,
  "has_staging_version": true,
  "current_version": {
    "id": 5,
    "version_number": 2,
    "name": "Version Inicial",
    "status": "published"
  },
  "staging_version": {
    "id": 6,
    "version_number": 3,
    "status": "pending_review"
  },
  "available_actions": ["approve", "reject", "discard"]
}
```

**available_actions** puede incluir:
- `submit`: La version esta en DRAFT, puede enviarse a revision
- `approve`/`reject`: La version esta en PENDING_REVIEW
- `publish`: La version esta APPROVED
- `discard`: Siempre disponible si hay version publicada

### Descartar Cambios (Rollback)

Si decides cancelar todos los cambios pendientes y volver a la ultima version publicada:

```http
POST /api/v1/landings/1/discard-staging
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "landing_id": 1,
  "restored_from_version": {
    "id": 5,
    "version_number": 2,
    "name": "Version Inicial"
  },
  "steps_restored": 4,
  "fields_restored": 12,
  "landing_status": "published",
  "message": "Staging discarded. Restored 4 steps and 12 fields from version 2."
}
```

**Que hace discard-staging:**
1. Elimina todos los LandingSteps y LandingFields actuales
2. Los recrea desde el snapshot de la version publicada
3. Marca la version staging como REJECTED
4. Cambia el status del landing de STAGING a PUBLISHED
5. Limpia staging_version_id

**IMPORTANTE**: Esta accion es irreversible. Todos los cambios no publicados se pierden.

---

## Historial de Cambios (Changelog)

Cada cambio a pasos o campos se registra automaticamente.

### Tipos de Cambio

```python
class ChangeType(str, enum.Enum):
    LANDING_CREATED = "landing_created"
    LANDING_UPDATED = "landing_updated"
    STEP_ADDED = "step_added"
    STEP_REMOVED = "step_removed"
    STEP_UPDATED = "step_updated"
    FIELD_ADDED = "field_added"
    FIELD_REMOVED = "field_removed"
    FIELD_UPDATED = "field_updated"
    VERSION_CREATED = "version_created"
    VERSION_PUBLISHED = "version_published"
    VERSION_APPROVED = "version_approved"
    VERSION_REJECTED = "version_rejected"
```

### Registro Automatico

Cuando haces:
```http
PUT /api/v1/landings/1/steps/3/fields/5
{"is_required": true, "custom_label": "Email Corporativo"}
```

Se crea automaticamente:
```json
{
  "id": 123,
  "landing_id": 1,
  "change_type": "FIELD_UPDATED",
  "entity_type": "landing_field",
  "entity_id": 5,
  "entity_name": "email",
  "old_value": {
    "is_required": false,
    "custom_label": "Email"
  },
  "new_value": {
    "is_required": true,
    "custom_label": "Email Corporativo"
  },
  "changed_fields": ["is_required", "custom_label"],
  "changed_by": 1,
  "changed_by_name": "Admin User",
  "changed_at": "2025-12-27T10:30:00Z"
}
```

### Consultar Historial

```http
GET /api/v1/landings/1/history?limit=50&change_type=FIELD_UPDATED
```

---

## Tracking de Versiones en Solicitudes

Las solicitudes (Application) y leads capturan la version activa al momento de crearse.

### Modelos

```python
class Application:
    landing_id = ...           # Landing de origen
    landing_version_id = ...   # Version activa cuando se creo la solicitud

class Lead:
    landing_id = ...           # Landing de origen
    landing_version_id = ...   # Version activa cuando se capturo el lead
```

### Estadisticas por Version

```http
GET /api/v1/landings/1/versions/2/stats
```

Response:
```json
{
  "version_id": 2,
  "version_number": 2,
  "version_name": "v2.0 - Flujo optimizado",
  "status": "published",
  "stats": {
    "applications_count": 150,
    "leads_count": 45,
    "total_submissions": 195
  },
  "timeline": {
    "created_at": "2025-12-20T10:00:00Z",
    "published_at": "2025-12-21T09:00:00Z"
  }
}
```

### Casos de Uso

1. **Analisis de conversion por version**
   - Version 1: 100 visitas, 20 solicitudes = 20% conversion
   - Version 2: 100 visitas, 35 solicitudes = 35% conversion

2. **A/B Testing**
   - Publicar version A, medir durante 1 semana
   - Publicar version B, medir durante 1 semana
   - Comparar metricas

3. **Rollback informado**
   - Si version 3 tiene peor conversion, saber exactamente cuantas solicitudes afecto

---

## Referencia de Endpoints

### Catalogo de Pasos (FormStep)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/form-steps` | Lista todos los pasos disponibles |
| GET | `/api/v1/form-steps/{id}` | Detalle de un paso |
| POST | `/api/v1/form-steps` | Crear nuevo paso base |
| PUT | `/api/v1/form-steps/{id}` | Actualizar paso |
| DELETE | `/api/v1/form-steps/{id}` | Desactivar paso (soft delete) |
| GET | `/api/v1/form-steps/{id}/fields` | Campos agrupados del paso |

### Catalogo de Campos (FormField)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/form-fields` | Lista todos los campos disponibles |
| GET | `/api/v1/form-fields/{id}` | Detalle de un campo |
| POST | `/api/v1/form-fields` | Crear nuevo campo base |
| PUT | `/api/v1/form-fields/{id}` | Actualizar campo |
| DELETE | `/api/v1/form-fields/{id}` | Desactivar campo (soft delete) |

### Plantillas (LandingTemplate)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/landing-templates` | Lista plantillas |
| GET | `/api/v1/landing-templates/{id}` | Detalle de plantilla |
| GET | `/api/v1/landing-templates/code/{code}` | Plantilla por codigo |
| POST | `/api/v1/landing-templates` | Crear plantilla |
| PUT | `/api/v1/landing-templates/{id}` | Actualizar plantilla |
| DELETE | `/api/v1/landing-templates/{id}` | Eliminar plantilla |
| POST | `/api/v1/landing-templates/{id}/duplicate` | Duplicar plantilla |

### Landings - CRUD Basico

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/landings` | Lista landings |
| GET | `/api/v1/landings/{id}` | Detalle basico |
| GET | `/api/v1/landings/{id}/full` | Detalle completo |
| POST | `/api/v1/landings` | Crear landing |
| PUT | `/api/v1/landings/{id}` | Actualizar landing |
| DELETE | `/api/v1/landings/{id}` | Eliminar landing |
| POST | `/api/v1/landings/{id}/apply-template` | Aplicar plantilla |

### Landings - Configuracion de Formulario

| Metodo | Endpoint | Descripcion | Changelog |
|--------|----------|-------------|-----------|
| GET | `/api/v1/landings/{id}/config` | Config actual (preview admin) | - |
| GET | `/api/v1/landings/{id}/steps` | Lista pasos del landing | - |
| POST | `/api/v1/landings/{id}/steps` | Agregar paso | Si |
| PUT | `/api/v1/landings/{id}/steps/{step_id}` | Actualizar paso | Si |
| DELETE | `/api/v1/landings/{id}/steps/{step_id}` | Remover paso | Si |
| PUT | `/api/v1/landings/{id}/steps/reorder` | Reordenar pasos | Si |
| GET | `/api/v1/landings/{id}/steps/{step_id}/fields` | Lista campos del paso | - |
| POST | `/api/v1/landings/{id}/steps/{step_id}/fields` | Agregar campo | Si |
| PUT | `/api/v1/landings/{id}/steps/{step_id}/fields/{field_id}` | Actualizar campo | Si |
| DELETE | `/api/v1/landings/{id}/steps/{step_id}/fields/{field_id}` | Remover campo | Si |
| PUT | `/api/v1/landings/{id}/steps/{step_id}/fields/reorder` | Reordenar campos | Si |
| GET | `/api/v1/landings/{id}/available-fields` | Campos disponibles | - |

### Landings - Versionado y Staging

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/landings/{id}/versions` | Lista versiones |
| POST | `/api/v1/landings/{id}/versions` | Crear version |
| GET | `/api/v1/landings/{id}/versions/{ver}` | Detalle version |
| POST | `/api/v1/landings/{id}/versions/{ver}/submit` | Enviar a revision |
| POST | `/api/v1/landings/{id}/versions/{ver}/review` | Aprobar/Rechazar |
| POST | `/api/v1/landings/{id}/versions/{ver}/publish` | Publicar |
| GET | `/api/v1/landings/{id}/versions/{ver}/stats` | Stats por version |
| GET | `/api/v1/landings/{id}/history` | Historial de cambios |

### API Publica (Sin autenticacion)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/public/landing/{slug}` | Info publica del landing |
| GET | `/public/landing/{slug}/form` | Config formulario (version publicada) |
| GET | `/public/landing/{slug}/features` | Features habilitadas |

---

## Ejemplos de Flujos

### Ejemplo 1: Crear Landing Nuevo para Cliente

```bash
# 1. Ver plantillas disponibles
GET /api/v1/landing-templates

# 2. Crear landing con plantilla "normal"
POST /api/v1/landings
{
  "slug": "cliente-xyz",
  "name": "Landing Cliente XYZ",
  "institution_id": 5,
  "agreement_id": 3,
  "template_id": 1,
  "apply_template_defaults": true
}

# 3. Personalizar (agregar paso de referencias)
POST /api/v1/landings/15/steps
{"step_id": 6, "display_order": 3}

# 4. Agregar campos al paso
POST /api/v1/landings/15/steps/6/fields
{"field_id": 18, "is_required": true}
POST /api/v1/landings/15/steps/6/fields
{"field_id": 19, "is_required": true}

# 5. Verificar preview
GET /api/v1/landings/15/config

# 6. Crear y publicar version
POST /api/v1/landings/15/versions
{"name": "v1.0 - Lanzamiento"}
POST /api/v1/landings/15/versions/1/publish

# 7. Compartir URL publica
# https://app.ejemplo.com/cliente-xyz
```

### Ejemplo 2: Actualizar Landing Existente

```bash
# 1. Ver configuracion actual
GET /api/v1/landings/15/config

# 2. Hacer campo email obligatorio
PUT /api/v1/landings/15/steps/2/fields/5
{"is_required": true}

# 3. Agregar nuevo campo de telefono alternativo
POST /api/v1/landings/15/steps/2/fields
{
  "field_id": 10,
  "is_required": false,
  "custom_label": "Telefono Alternativo"
}

# 4. Verificar preview
GET /api/v1/landings/15/config

# 5. Ver historial de cambios recientes
GET /api/v1/landings/15/history?limit=10

# 6. Crear nueva version
POST /api/v1/landings/15/versions
{
  "name": "v1.1 - Email obligatorio",
  "notes": "Se hizo email obligatorio y se agrego telefono alternativo"
}

# 7. Publicar cuando este listo
POST /api/v1/landings/15/versions/2/publish
```

### Ejemplo 3: Cambio Rapido de Plantilla

```bash
# Cambiar de flujo normal (4 pasos) a express (1 paso)
POST /api/v1/landings/15/apply-template
{
  "template_id": 2,
  "apply_config": true,
  "apply_steps": true,
  "apply_components": false,
  "apply_filters": false,
  "apply_features": false
}

# Crear version con el nuevo flujo
POST /api/v1/landings/15/versions
{"name": "v2.0 - Cambio a flujo express"}

# Publicar
POST /api/v1/landings/15/versions/3/publish
```

---

## Conceptos Clave

### StepType (Tipo de Paso)

| Valor | Descripcion | Uso |
|-------|-------------|-----|
| `form` | Paso normal con campos | Captura de datos |
| `upsell` | Muestra accesorios/seguros | Ventas cruzadas |
| `confirmation` | Resumen y confirmacion | Cierre del flujo |

### is_system (Paso del Sistema)

| Valor | Descripcion |
|-------|-------------|
| `true` | Paso protegido, no se puede eliminar |
| `false` | Paso custom, se puede eliminar |

### category (Categoria de Paso)

| Categoria | Pasos |
|-----------|-------|
| `identity` | step_identity |
| `contact` | step_contact |
| `location` | step_location |
| `academic` | step_academic |
| `work` | step_work |
| `references` | step_references |
| `documents` | step_documents |
| `special` | step_upsell, step_confirmation |
| `custom` | Pasos creados por admin |

---

## Respuesta de Form Config

### Estructura Completa

```json
{
  "landing_id": 1,
  "current_version": {
    "id": 5,
    "version_number": 3,
    "name": "Flujo Reducido v2",
    "status": "published",
    "published_at": "2025-01-15T10:30:00Z"
  },
  "total_steps": 4,
  "total_fields": 18,
  "steps": [
    {
      "id": 1,
      "code": "step_identity",
      "name": "Identificacion",
      "title": "Tus Datos",
      "description": null,
      "icon": "id-card",
      "display_order": 0,
      "is_required": true,
      "is_skippable": false,
      "step_type": "form",
      "fields_count": 8,
      "fields": [
        {
          "id": 1,
          "code": "document_type",
          "name": "Tipo de Documento",
          "label": "Tipo de Documento",
          "field_type": "select",
          "placeholder": "Selecciona tu tipo de documento",
          "help_text": "Selecciona DNI si eres peruano",
          "is_required": true,
          "is_visible": true,
          "is_readonly": false,
          "display_order": 0,
          "width": "half",
          "options": [
            {"value": "dni", "label": "DNI"},
            {"value": "ce", "label": "Carnet de Extranjeria"},
            {"value": "passport", "label": "Pasaporte"}
          ],
          "validations": [
            {"rule_type": "required", "error_message": "Campo obligatorio"}
          ]
        }
      ]
    },
    {
      "id": 4,
      "code": "step_upsell",
      "name": "Productos Adicionales",
      "title": "Agrega Accesorios",
      "step_type": "upsell",
      "is_required": false,
      "is_skippable": true,
      "fields": [],
      "upsell_data": {
        "accessories": [...],
        "insurances": [...]
      }
    }
  ],
  "dependencies": [
    {
      "field_id": 5,
      "depends_on_field_id": 4,
      "depends_on_field_code": "has_children",
      "operator": "equals",
      "value": "true",
      "action": "show"
    }
  ]
}
```

---

## Notas Importantes

1. **Cambios no afectan produccion**: Los cambios del admin solo son visibles en preview hasta publicar

2. **Una landing, una config**: Cambiar config en Landing 1 no afecta Landing 2

3. **Snapshots inmutables**: Una vez publicada, la version queda como snapshot historico

4. **Changelog automatico**: Cada cambio se registra con old_value, new_value, usuario y timestamp

5. **Version tracking**: Las solicitudes y leads capturan la version para analytics

6. **Plantillas son punto de partida**: Cambiar una plantilla NO afecta landings ya creados

---

## Credenciales y URLs de Prueba

### Credenciales

| Email | Password | Rol |
|-------|----------|-----|
| admin@baldecash.com | admin123 | ADMIN |

### URLs de Prueba

```bash
# Plantillas
GET /api/v1/landing-templates
GET /api/v1/landing-templates/1

# Catalogo de pasos
GET /api/v1/form-steps
GET /api/v1/form-steps/1/fields

# Configuracion de landings (admin)
GET /api/v1/landings/1/full
GET /api/v1/landings/1/config
GET /api/v1/landings/1/steps
GET /api/v1/landings/1/history

# Config de formulario publico (version publicada)
GET /public/landing/default/form
GET /public/landing/upn-completo/form

# Versiones
GET /api/v1/landings/1/versions
GET /api/v1/landings/1/versions/1/stats
```

---

## Flujos de Ejemplo del Seeder

El seeder crea 3 landings de ejemplo:

### 1. `default` - Flujo Clasico (4 pasos)

```
step_identity (form) --> step_academic (form) --> step_work (form) --> step_upsell (upsell)
     |                        |                        |
     v                        v                        v
  8 campos               9 campos                 4 campos
```

### 2. `upn-completo` - Flujo Extenso (7 pasos)

```
step_identity --> step_contact --> step_academic --> step_work --> step_upsell --> step_references --> step_confirmation
```

### 3. `upn-express` - Lead Capture (1 paso custom)

```
step_upn_quick (form - custom)
         |
         v
    7 campos mixtos
```
