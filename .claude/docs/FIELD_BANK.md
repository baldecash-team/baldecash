# Banco de Campos del Wizard (Form Builder)

> Documentación de los 37 campos disponibles en el banco de campos para el wizard de solicitud.

---

## Resumen por Tipo de Opciones

| Tipo | Cant. | Descripción |
|------|-------|-------------|
| **INPUT** | 18 | Campos de entrada libre (text, email, phone, date, file, etc.) |
| **STATIC_JSON** | 7 | Opciones fijas en `form_field.options_static` (JSON) |
| **FORM_FIELD_OPTION** | 2 | Opciones en tabla `form_field_option` |
| **API** | 2 | Carga opciones de endpoint al montar el componente |
| **CASCADING** | 2 | Carga opciones cuando cambia el valor del campo padre |
| **LAZY_SEARCH** | 2 | Búsqueda con mínimo 3 caracteres (datasets grandes) |
| **CHECKBOX** | 4 | Campos de consentimiento (boolean) |

---

## Flujo de Opciones en Frontend

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CascadingSelectField.tsx                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. STATIC_JSON / FORM_FIELD_OPTION                                     │
│     └─> staticOptions viene de DynamicField (ya procesado)              │
│                                                                          │
│  2. API (options_source, sin cascade_from)                              │
│     └─> useEffect al montar → fetchOptionsFromSource(options_source)    │
│         Ej: department → GET /public/options/geo-units/departments      │
│                                                                          │
│  3. CASCADING (cascade_from + cascade_param + options_source)           │
│     └─> useEffect cuando parentValue cambia                             │
│         → fetchCascadingOptions(options_source, cascade_param, value)   │
│         Ej: province → GET /public/options/geo-units/provinces?parent_id=1 │
│                                                                          │
│  4. LAZY_SEARCH (min_search_length > 0)                                 │
│     └─> onSearch callback con debounce 300ms                            │
│         → fetchOptionsWithSearch(options_source, searchTerm, filter)    │
│         Ej: institution → GET /public/options/study-centers?q=uni       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Campos por Categoría

### GENERAL (20 campos)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 1 | `first_name` | Nombres | text | Input libre |
| 3 | `document_type` | Tipo de Documento | radio | **STATIC_JSON** (3): DNI, CE, Pasaporte |
| 4 | `document_number` | Número de Documento | document_number | Input con máscara según tipo |
| 5 | `gender` | Sexo | radio | **STATIC_JSON** (3): Masculino, Femenino, Otro |
| 6 | `birth_date` | Fecha de Nacimiento | date | DatePicker |
| 7 | `phone` | Celular | phone | Input con máscara 9 dígitos |
| 8 | `email` | Correo Electrónico | email | Input con validación email |
| 9 | `institution_type` | Tipo de Institución | radio | **STATIC_JSON** (4): Universidad, Instituto, CETPRO, Otro |
| 10 | `institution` | Institución Educativa | autocomplete | **LAZY_SEARCH** → `study-centers` (41,747 registros) |
| 11 | `other_institution` | ¿Cuál institución? | text | Input condicional (visible si institution="otro") |
| 12 | `career` | Carrera o Especialidad | autocomplete | **LAZY_SEARCH** → `careers` |
| 13 | `other_career` | ¿Cuál carrera? | text | Input condicional |
| 14 | `semester` | Ciclo Actual | select | **STATIC_JSON** (12): 1er-10mo Ciclo, Egresado, Otro |
| 15 | `other_semester` | ¿Cuál ciclo? | text | Input condicional |
| 16 | `enrollment_certificate` | Constancia de Estudios | file | File upload (PDF, imagen) |
| 17 | `employment_status` | Situación Laboral | radio | **STATIC_JSON** (4): Empleado, Independiente, Desempleado, Estudiante |
| 18 | `monthly_income` | Ingreso Mensual Aproximado | currency | Input con formato S/ y separador miles |
| 19 | `comments` | Comentarios Adicionales | textarea | Texto largo |
| 20 | `payment_day` | ¿Qué día prefieres pagar? | select | **FORM_FIELD_OPTION** (4): 5, 10, 15, 20 |
| 21 | `referral_source` | ¿Cómo te enteraste? | select | **FORM_FIELD_OPTION** (15 opciones) |

### ADDRESS (5 campos)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 26 | `department` | Departamento | select | **API** → `geo-units/departments` (25 deptos) |
| 27 | `province` | Provincia | select | **CASCADING** de `department` → `geo-units/provinces` (195) |
| 28 | `district` | Distrito | select | **CASCADING** de `province` → `geo-units/districts` (1,852) |
| 29 | `address` | Dirección | text | Input libre |
| 30 | `address_reference` | Referencia | text | Input libre |

**Nota:** Los campos de ubicación geográfica ahora tienen **buscador habilitado** (searchable=true) para facilitar la selección.

### ACADEMIC (2 campos)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 31 | `study_cycle` | Ciclo/Año de Estudios | select | **STATIC_JSON** (11): 1er-10mo, Egresado |
| 32 | `student_code` | Código de Estudiante | text | Input libre |

### PERSONAL (3 campos)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 22 | `paternal_surname` | Apellido Paterno | text | Input libre |
| 23 | `maternal_surname` | Apellido Materno | text | Input libre |
| 24 | `marital_status` | Estado Civil | select | **API** → `marital-status` |

### CONTACT (1 campo)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 25 | `phone_secondary` | Teléfono Alternativo | phone | Input con máscara 9 dígitos |

### EMPLOYMENT (2 campos)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 33 | `company_name` | Empresa donde Labora | text | Input libre |
| 34 | `work_start_date` | Fecha de Ingreso al Trabajo | date | DatePicker |

### CONSENT (4 campos)

| ID | code | label | field_type | Opciones |
|----|------|-------|------------|----------|
| 35 | `terms_acceptance` | Acepto los términos y condiciones | checkbox | Boolean |
| 36 | `privacy_policy` | Acepto la política de privacidad | checkbox | Boolean |
| 37 | `marketing_consent` | Acepto recibir promociones | checkbox | Boolean |
| 38 | `data_sharing_consent` | Autorizo compartir mis datos | checkbox | Boolean |

---

## Configuración de Campos en BD

### Tabla `form_field`

```sql
-- Campos clave para opciones:
options_source      -- Endpoint de API (ej: "geo-units/departments", "study-centers")
options_static      -- JSON array de opciones fijas [{value, label}, ...]
options_filter      -- Filtro adicional para lazy search (ej: {depends_on: "institution_type"})
cascade_from        -- Código del campo padre (ej: "department")
cascade_param       -- Parámetro para filtrar (ej: "parent_id")
min_search_length   -- Mínimo de caracteres para lazy search (ej: 3)

-- Mapeo a tablas del backend (para normalización en FormService):
maps_to_table       -- Tabla destino (ej: "person", "person_address_history")
maps_to_column      -- Columna destino (ej: "first_name", "street_address")
```

### Tabla `form_field_option`

```sql
-- Opciones normalizadas en tabla separada
field_id            -- FK a form_field
value               -- Valor a guardar
label               -- Texto visible
description         -- Descripción opcional
display_order       -- Orden de visualización
visibility_conditions -- JSON con condiciones de visibilidad
```

---

## Mapeo de Campos al Backend (maps_to_column)

Todos los 37 campos tienen configurado su mapeo para que el backend (`FormService._normalize_form_data`) los procese correctamente.

### Person

| Campo | Columna Backend |
|-------|-----------------|
| `first_name` | `person.first_name` |
| `paternal_surname` | `person.paternal_surname` |
| `maternal_surname` | `person.maternal_surname` |
| `document_type` | `person.document_type` |
| `document_number` | `person.document_number` |
| `birth_date` | `person.birth_date` |
| `gender` | `person.gender` |
| `email` | `person.email` |
| `phone` | `person.phone` |
| `marital_status` | `person.marital_status` |

### Person Contact History

| Campo | Columna Backend |
|-------|-----------------|
| `phone_secondary` | `person_contact_history.phone_home` |

### Person Address History

| Campo | Columna Backend |
|-------|-----------------|
| `department` | `person_address_history.department` |
| `province` | `person_address_history.province` |
| `district` | `person_address_history.district` |
| `address` | `person_address_history.street_address` |
| `address_reference` | `person_address_history.reference` |

### Person Academic History

| Campo | Columna Backend |
|-------|-----------------|
| `institution` | `person_academic_history.institution_id` |
| `institution_type` | `person_academic_history.institution_type` |
| `career` | `person_academic_history.career_id` |
| `semester` | `person_academic_history.current_cycle` |
| `study_cycle` | `person_academic_history.current_cycle` |
| `student_code` | `person_academic_history.student_code` |
| `other_institution` | `person_academic_history.institution_name` |
| `other_career` | `person_academic_history.career_name` |
| `other_semester` | `person_academic_history.cycle_notes` |

### Person Employment History

| Campo | Columna Backend |
|-------|-----------------|
| `company_name` | `person_employment_history.company_name` |
| `monthly_income` | `person_employment_history.monthly_income` |
| `work_start_date` | `person_employment_history.start_date` |
| `employment_status` | `person_employment_history.employment_type` |

### Application

| Campo | Columna Backend |
|-------|-----------------|
| `payment_day` | `application.preferred_payment_day` |
| `referral_source` | `application.referral_source` |
| `comments` | `application.notes` |

### Application Consent

| Campo | Columna Backend |
|-------|-----------------|
| `terms_acceptance` | `application_consent.terms_accepted` |
| `privacy_policy` | `application_consent.privacy_accepted` |
| `marketing_consent` | `application_consent.marketing_accepted` |
| `data_sharing_consent` | `application_consent.data_sharing_accepted` |

### Application Document

| Campo | Columna Backend |
|-------|-----------------|
| `enrollment_certificate` | `application_document.file_path` |

---

## Endpoints de Opciones

| options_source | Endpoint Real | Registros |
|----------------|---------------|-----------|
| `geo-units/departments` | `GET /public/options/geo-units/departments` | 25 |
| `geo-units/provinces` | `GET /public/options/geo-units/provinces?parent_id={id}` | 195 |
| `geo-units/districts` | `GET /public/options/geo-units/districts?parent_id={id}` | 1,852 |
| `study-centers` | `GET /public/options/study-centers?q={search}&type={type}` | 41,747 |
| `careers` | `GET /public/options/careers?q={search}&institution_id={id}` | ~500 |
| `marital-status` | `GET /public/options/marital-status` | ~5 |

---

## Componentes Frontend

| Archivo | Responsabilidad |
|---------|-----------------|
| `DynamicField.tsx` | Renderiza el componente correcto según `field_type` |
| `CascadingSelectField.tsx` | Maneja selects con opciones dinámicas (API, cascading, lazy search) |
| `SelectInput.tsx` | UI del select con búsqueda local/remota |
| `wizardApi.ts` | Funciones para fetch de opciones (`fetchOptionsFromSource`, etc.) |

### Lógica de searchable en DynamicField

```typescript
// Selects con options_source o cascade_from tienen búsqueda habilitada
const enableSelectSearch = Boolean(field.options_source || field.cascade_from);

<CascadingSelectField
  field={field}
  staticOptions={selectOptions}
  searchable={enableSelectSearch}  // true para campos dinámicos
/>
```

---

## Campos Condicionales

Algunos campos solo aparecen cuando otro campo tiene cierto valor:

| Campo | Condición de Visibilidad |
|-------|--------------------------|
| `other_institution` | `institution === "otro"` |
| `other_career` | `career === "otro"` |
| `other_semester` | `semester === "otro"` |

La lógica de visibilidad se maneja en `form_field_option.visibility_conditions` o en el frontend con dependencias.

---

---

## Persistencia en LocalStorage

El wizard guarda automáticamente los datos del formulario en localStorage para que el usuario no pierda su progreso al hacer refresh.

### Estructura de Datos

```typescript
// Clave: baldecash-wizard-{landingSlug}-data
// Valor: Record<string, FieldState>

interface FieldState {
  value: string | string[] | File[];  // Valor del campo (ID para selects)
  touched: boolean;                    // Si el usuario interactuó
  error?: string;                      // Error de validación
  label?: string;                      // Label para campos select/autocomplete
}
```

### Campos con Lazy Search (autocomplete)

Para campos como `institution` y `career` que usan lazy search, se guarda también el **label** seleccionado:

```typescript
// Ejemplo de localStorage para "institution"
{
  "institution": {
    "value": "123",                              // ID de la institución
    "label": "Universidad Nacional de Ingeniería", // Label visible
    "touched": true
  }
}
```

**¿Por qué se guarda el label?**

Los campos de lazy search (`min_search_length > 0`) no cargan opciones automáticamente - solo cuando el usuario escribe. Al hacer refresh:

1. El `value` (ID) se restaura desde localStorage
2. Pero las `options` están vacías (no hay búsqueda activa)
3. Sin el `label` guardado, el campo mostraría el placeholder en lugar del valor seleccionado

### Archivos Involucrados

| Archivo | Responsabilidad |
|---------|-----------------|
| `WizardContext.tsx` | Guarda/restaura de localStorage, provee `updateField(id, value, label?)` y `getFieldLabel()` |
| `CascadingSelectField.tsx` | Pasa el label al `updateField` cuando se selecciona |
| `SelectInput.tsx` | Usa `savedLabel` como fallback cuando no hay opciones cargadas |
| `WizardSummary.tsx` | Usa `savedLabel` de formData para mostrar labels en el resumen |

### Exclusiones

- **Archivos (File objects)**: No se guardan en localStorage (no serializables)
- Se filtran automáticamente en `saveToStorage()`

---

## Documentación Relacionada

- **[WIZARD_FIELD_TYPES.md](./WIZARD_FIELD_TYPES.md)** - Guía para TI sobre tipos de campo soportados

---

*Última actualización: Marzo 2026*
