# Form Builder - Documentación de Seeders y Estructura de BD

**Versión:** 1.0
**Fecha:** 2025-02-23
**Autor:** Claude Code

---

## 1. Resumen Ejecutivo

Este documento describe la estructura completa del sistema Form Builder de BaldeCash, incluyendo:
- Tablas de base de datos
- Seeders del backend (webservice2)
- Mapeo de campos entre frontend 0.5 y backend 0.6
- Configuración del formulario para Landing Home (ID: 1)

---

## 2. Arquitectura del Sistema

### 2.1 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (webservice2)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │  Seeders    │───▶│  Database   │───▶│  API REST   │                    │
│   │  (Python)   │    │  (MySQL)    │    │  (FastAPI)  │                    │
│   └─────────────┘    └─────────────┘    └──────┬──────┘                    │
│                                                 │                           │
└─────────────────────────────────────────────────┼───────────────────────────┘
                                                  │
                                                  │ GET /api/v1/public/landing/{slug}/wizard
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (webpage3.0)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │ wizardApi   │───▶│  Context    │───▶│ Components  │                    │
│   │  (fetch)    │    │  (React)    │    │  (NextUI)   │                    │
│   └─────────────┘    └─────────────┘    └─────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Diferencias 0.5 vs 0.6

| Aspecto | 0.5 | 0.6 |
|---------|-----|-----|
| **Configuración** | Hardcodeada en frontend | Dinámica desde API |
| **Códigos de campos** | Español (ej: `nombres`) | Inglés (ej: `first_name`) |
| **Ubicación datos** | `wizardSteps.ts` | Base de datos MySQL |
| **Personalización** | Requiere deploy | Admin panel (futuro) |

---

## 3. Estructura de Base de Datos

### 3.1 Diagrama Entidad-Relación

```
┌──────────────────┐
│    form_step     │ (Catálogo maestro de pasos)
├──────────────────┤
│ id               │
│ code             │ "personal_data", "academic_data", etc.
│ name             │
│ step_type        │ ENUM
│ default_order    │
│ motivational_*   │ Contenido motivacional
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐      ┌──────────────────┐
│ form_field_group │      │    form_field    │ (Catálogo maestro de campos)
├──────────────────┤      ├──────────────────┤
│ id               │      │ id               │
│ form_step_id  ───┼──────│ form_step_id     │
│ code             │  ┌───│ field_group_id   │
│ title            │  │   │ code             │ "first_name", "email", etc.
└──────────────────┘  │   │ label            │
                      │   │ field_type       │ ENUM
                      │   │ options_static   │ JSON
                      │   │ is_required      │
                      │   │ maps_to_table    │
                      │   │ maps_to_column   │
                      │   └────────┬─────────┘
                      │            │
         ┌────────────┘            │ 1:N
         │                         ▼
         │            ┌──────────────────────┐
         │            │ form_field_option    │
         │            ├──────────────────────┤
         │            │ id                   │
         │            │ field_id             │
         │            │ value                │
         │            │ label                │
         │            │ visibility_conditions│ JSON
         │            └──────────────────────┘
         │
         │            ┌──────────────────────┐
         │            │ form_field_validation│
         │            ├──────────────────────┤
         │            │ id                   │
         │            │ field_id             │
         │            │ validation_type      │ ENUM
         │            │ error_message        │
         │            └──────────────────────┘
         │
         │            ┌──────────────────────┐
         │            │ form_field_dependency│
         │            ├──────────────────────┤
         │            │ id                   │
         │            │ field_id             │
         │            │ depends_on_field_id  │
         │            │ operator             │ ENUM
         │            │ value                │
         │            │ action               │ "show", "hide", etc.
         │            └──────────────────────┘
         │
         ▼
┌──────────────────┐
│     landing      │
├──────────────────┤
│ id               │
│ code             │ "LAND_HOME"
│ slug             │ "home"
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│   landing_step   │ (Pasos habilitados por landing)
├──────────────────┤
│ id               │
│ landing_id       │
│ step_id          │───────▶ form_step.id
│ is_enabled       │
│ is_required      │
│ display_order    │
│ custom_title     │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│  landing_field   │ (Campos configurados por landing)
├──────────────────┤
│ id               │
│ landing_step_id  │
│ field_id         │───────▶ form_field.id
│ is_visible       │
│ is_required      │
│ display_order    │
│ custom_label     │
└──────────────────┘
```

### 3.2 Enums Disponibles

#### FieldType
```python
TEXT = "text"
NUMBER = "number"
EMAIL = "email"
PHONE = "phone"
PASSWORD = "password"
DATE = "date"
SELECT = "select"
RADIO = "radio"
CHECKBOX = "checkbox"
CHECKBOX_GROUP = "checkbox_group"
TEXTAREA = "textarea"
FILE = "file"
SIGNATURE = "signature"
HIDDEN = "hidden"
CURRENCY = "currency"
DOCUMENT_NUMBER = "document_number"
OTP = "otp"
AUTOCOMPLETE = "autocomplete"
ADDRESS = "address"
SLIDER = "slider"
RATING = "rating"
RANGE = "range"
```

#### FormStepType
```python
PERSONAL_DATA = "personal_data"
CONTACT_DATA = "contact_data"
ADDRESS = "address"
ACADEMIC_DATA = "academic_data"
EMPLOYMENT = "employment"
FINANCIAL = "financial"
PRODUCT_SELECTION = "product_selection"
FINANCING = "financing"
DOCUMENTS = "documents"
REFERENCES = "references"
CONSENT = "consent"
VERIFICATION = "verification"
REVIEW = "review"
CUSTOM = "custom"
```

#### ValidationRule
```python
REQUIRED = "required"
MIN_LENGTH = "min_length"
MAX_LENGTH = "max_length"
MIN_VALUE = "min_value"
MAX_VALUE = "max_value"
PATTERN = "pattern"
EMAIL = "email"
PHONE = "phone"
DNI = "dni"
RUC = "ruc"
GREATER_THAN_FIELD = "greater_than_field"
LESS_THAN_FIELD = "less_than_field"
EQUALS_FIELD = "equals_field"
DATE_FUTURE = "date_future"
DATE_PAST = "date_past"
DATE_AGE_MIN = "date_age_min"
DATE_AGE_MAX = "date_age_max"
FILE_TYPE = "file_type"
FILE_SIZE = "file_size"
CUSTOM = "custom"
```

#### DependencyOperator
```python
EQUALS = "equals"
NOT_EQUALS = "not_equals"
CONTAINS = "contains"
NOT_CONTAINS = "not_contains"
GREATER_THAN = "greater_than"
LESS_THAN = "less_than"
IN = "in"
NOT_IN = "not_in"
IS_EMPTY = "is_empty"
IS_NOT_EMPTY = "is_not_empty"
```

---

## 4. Seeders del Backend

### 4.1 Ubicación de Archivos

```
webservice2/scripts/seeders/
├── form_builder/
│   ├── __init__.py
│   ├── steps.py          # FormStep (pasos del wizard)
│   └── fields.py         # FormField, FormFieldGroup, FormFieldOption,
│                         # FormFieldValidation, FormFieldDependency
├── landing/
│   ├── landings.py       # Landing (incluye LAND_HOME)
│   └── landing_forms.py  # LandingStep, LandingField
└── runner.py             # Orquestador de seeders
```

### 4.2 Orden de Ejecución

Los seeders tienen dependencias que determinan su orden:

```
1. form_steps      (sin dependencias)
2. form_fields     (depende de: form_steps)
3. landings        (sin dependencias de form_builder)
4. landing_forms   (depende de: landings, form_fields)
```

### 4.3 Comandos de Ejecución

```bash
# Ejecutar todos los seeders
docker-compose exec api python -m scripts.seeders.runner

# Ejecutar solo form_builder
docker-compose exec api python -m scripts.seeders.runner --module form_builder

# Ejecutar solo landing
docker-compose exec api python -m scripts.seeders.runner --module landing

# Reset completo (elimina datos y re-seedea)
docker-compose exec api python -m scripts.seeders.runner --reset

# Listar seeders disponibles
docker-compose exec api python -m scripts.seeders.runner --list
```

---

## 5. Configuración del Formulario Landing Home (ID: 1)

### 5.1 Pasos Habilitados

| # | Código | Título | Descripción | Requerido |
|---|--------|--------|-------------|-----------|
| 1 | `personal_data` | Datos Personales | Cuéntanos sobre ti | Sí |
| 2 | `academic_data` | Datos Académicos | Información sobre tus estudios | Sí |
| 3 | `financial` | Datos Económicos | Tu situación laboral e ingresos | Sí |
| 4 | `summary_preferences` | Información Adicional | Preferencias adicionales para tu solicitud | No |

### 5.2 Campos por Paso

#### PASO 1: Datos Personales (`personal_data`)

| # | Código Backend | Label | Tipo | Requerido | Grid |
|---|----------------|-------|------|-----------|------|
| 1 | `first_name` | Nombres | TEXT | Sí | 6 |
| 2 | `last_name` | Apellidos | TEXT | Sí | 6 |
| 3 | `document_type` | Tipo de Documento | RADIO | Sí | 12 |
| 4 | `document_number` | Número de Documento | DOCUMENT_NUMBER | Sí | 12 |
| 5 | `gender` | Sexo | RADIO | Sí | 12 |
| 6 | `birth_date` | Fecha de Nacimiento | DATE | Sí | 6 |
| 7 | `phone` | Celular | PHONE | Sí | 6 |
| 8 | `email` | Correo Electrónico | EMAIL | Sí | 6 |

**Opciones de `document_type`:**
- `dni` → DNI
- `ce` → CE
- `pasaporte` → Pasaporte

**Opciones de `gender`:**
- `masculino` → Masculino
- `femenino` → Femenino
- `otro` → Otro

#### PASO 2: Datos Académicos (`academic_data`)

| # | Código Backend | Label | Tipo | Requerido | Visible |
|---|----------------|-------|------|-----------|---------|
| 1 | `institution_type` | Tipo de Institución | RADIO | Sí | Siempre |
| 2 | `institution` | Institución Educativa | AUTOCOMPLETE | Sí | Siempre |
| 3 | `other_institution` | ¿Cuál institución? | TEXT | Sí | Condicional |
| 4 | `career` | Carrera o Especialidad | AUTOCOMPLETE | Sí | Siempre |
| 5 | `other_career` | ¿Cuál carrera? | TEXT | Sí | Condicional |
| 6 | `semester` | Ciclo Actual | SELECT | Sí | Siempre |
| 7 | `other_semester` | ¿Cuál ciclo? | TEXT | Sí | Condicional |
| 8 | `enrollment_certificate` | Constancia de Estudios | FILE | Sí | Siempre |

**Dependencias:**
- `other_institution` → visible cuando `institution` IN ('otra', 'otro')
- `other_career` → visible cuando `career` = 'otra'
- `other_semester` → visible cuando `semester` = 'otro'

**Opciones de `institution_type`:**
- `universidad` → Universidad
- `instituto` → Instituto
- `colegio` → Colegio

#### PASO 3: Datos Económicos (`financial`)

| # | Código Backend | Label | Tipo | Requerido |
|---|----------------|-------|------|-----------|
| 1 | `employment_status` | Situación Laboral | RADIO | Sí |
| 2 | `monthly_income` | Ingreso Mensual Aproximado | CURRENCY | Sí |
| 3 | `has_guarantor` | ¿Cuentas con un aval o codeudor? | RADIO | Sí |
| 4 | `comments` | Comentarios Adicionales | TEXTAREA | No |

**Opciones de `employment_status`:**
- `empleado` → Empleado
- `independiente` → Independiente
- `practicante` → Practicante
- `desempleado` → Sin empleo actual

**Opciones de `has_guarantor`:**
- `si` → Sí
- `no` → No

#### PASO 4: Preferencias Adicionales (`summary_preferences`)

| # | Código Backend | Label | Tipo | Requerido |
|---|----------------|-------|------|-----------|
| 1 | `payment_day` | ¿Qué día del mes prefieres pagar? | SELECT | Sí |
| 2 | `referral_source` | ¿Cómo te enteraste de nosotros? | SELECT | No |

**Opciones de `payment_day`:**
- `3` → Día 3 de cada mes
- `10` → Día 10 de cada mes
- `18` → Día 18 de cada mes
- `25` → Día 25 de cada mes

---

## 6. Mapeo Frontend 0.5 → Backend 0.6

### 6.1 Tabla de Mapeo de Códigos

El archivo `fieldTooltips.ts` del frontend contiene el mapeo para traducir los códigos del backend (inglés) a las claves locales (español):

```typescript
const apiCodeToLocalKey: Record<string, string> = {
  // Datos Personales
  first_name: 'nombres',
  last_name: 'apellidos',
  document_type: 'tipoDocumento',
  document_number: 'numeroDocumento',
  birth_date: 'fechaNacimiento',
  phone: 'celular',
  email: 'email',
  gender: 'sexo',

  // Datos Académicos
  institution_type: 'tipoInstitucion',
  institution: 'institucion',
  career: 'carrera',
  semester: 'ciclo',
  enrollment_certificate: 'constanciaEstudios',
  other_institution: 'otraInstitucion',
  other_career: 'otraCarrera',
  other_semester: 'otroCiclo',

  // Datos Económicos
  employment_status: 'situacionLaboral',
  monthly_income: 'ingresoMensual',
  has_guarantor: 'tieneAval',
  additional_comments: 'comentarios',
};
```

### 6.2 Ubicación del Mapeo

```
webpage3.0/src/app/prototipos/0.6/[landing]/solicitar/data/fieldTooltips.ts
```

---

## 7. API Endpoint

### 7.1 Obtener Configuración del Wizard

**Endpoint:** `GET /api/v1/public/landing/{slug}/wizard`

**Ejemplo:** `GET /api/v1/public/landing/home/wizard`

**Response:**
```json
{
  "steps": [
    {
      "code": "personal_data",
      "name": "Datos Personales",
      "description": "Cuéntanos sobre ti",
      "step_type": "personal_data",
      "display_order": 1,
      "is_required": true,
      "icon": "user",
      "motivational": {
        "title": "Recuerda que es importante digitar tu",
        "highlight": "número de DNI",
        "title_end": "correctamente",
        "subtitle": "Revisa 2 veces que tus datos estén en orden.",
        "illustration": "/images/baldi/BALDI_IDEA.png"
      },
      "fields": [
        {
          "code": "first_name",
          "label": "Nombres",
          "field_type": "text",
          "display_order": 1,
          "is_required": true,
          "grid_columns": 6,
          "placeholder": "Ej: Juan Carlos",
          "validations": [...],
          "options": null
        },
        // ... más campos
      ]
    },
    // ... más pasos
  ]
}
```

---

## 8. Historial de Cambios

### v1.0 (2025-02-23)

**Cambios en `fields.py`:**

1. **Agregado campo `has_guarantor`** en paso `financial`:
   ```python
   {
       "code": "has_guarantor",
       "label": "¿Cuentas con un aval o codeudor?",
       "field_type": FieldType.RADIO,
       "display_order": 3,
       "is_required": True,
       "options_static": [
           {"value": "si", "label": "Sí"},
           {"value": "no", "label": "No"},
       ],
       "help_text": "Un aval es una persona que respalda tu crédito",
   }
   ```

2. **Ajustado `display_order` de `comments`:**
   - Antes: `display_order: 3`
   - Después: `display_order: 4`

**Motivo:** Replicar el formulario 0.5 al 100% en el backend 0.6 para el Landing Home (ID: 1).

---

## 9. Archivos Relacionados

### Backend (webservice2)
| Archivo | Descripción |
|---------|-------------|
| `app/db/models/form_builder.py` | Modelos SQLAlchemy |
| `app/schemas/form_builder.py` | Schemas Pydantic |
| `app/services/form_service.py` | Lógica de negocio |
| `app/api/routers/public/form.py` | Endpoints públicos |
| `scripts/seeders/form_builder/steps.py` | Seeder de pasos |
| `scripts/seeders/form_builder/fields.py` | Seeder de campos |
| `scripts/seeders/landing/landing_forms.py` | Seeder de config por landing |

### Frontend (webpage3.0)
| Archivo | Descripción |
|---------|-------------|
| `src/app/prototipos/0.5/wizard-solicitud/data/wizardSteps.ts` | Config hardcodeada 0.5 |
| `src/app/prototipos/0.6/[landing]/solicitar/data/wizardSteps.ts` | Estructura base 0.6 |
| `src/app/prototipos/0.6/[landing]/solicitar/data/fieldTooltips.ts` | Mapeo de códigos y tooltips |
| `src/app/prototipos/0.6/services/wizardApi.ts` | Cliente API |
| `src/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext.tsx` | Context React |

---

## 10. Notas Importantes

1. **Re-ejecutar seeders después de cambios:**
   ```bash
   docker-compose exec api python -m scripts.seeders.runner --module form_builder
   docker-compose exec api python -m scripts.seeders.runner --module landing
   ```

2. **El seeder usa `get_or_create`:** No duplica registros si ya existen (busca por `code`).

3. **Cambios en campos existentes:** Si un campo ya existe, el seeder NO lo actualiza. Para forzar actualización:
   ```bash
   docker-compose exec api python -m scripts.seeders.runner --reset --module form_builder
   ```
   ⚠️ **CUIDADO:** `--reset` elimina TODOS los datos del módulo.

4. **El paso `summary_preferences` tiene `is_summary_step: True`:** Esto significa que se muestra en la página de resumen, no en la barra de progreso del wizard.

---

## 11. Contacto

Para dudas o modificaciones a esta documentación, contactar al equipo de desarrollo de BaldeCash.
