# Tipos de Campos del Wizard - Guía para TI

> Documentación de los tipos de campo soportados en el wizard de solicitud.
> **Audiencia:** Equipo de TI que agrega campos al banco desde Admin.

---

## Arquitectura del Sistema

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     ADMIN       │      │      API        │      │   WEBPAGE 3.0   │
│   (admin2/)     │─────▶│   /wizard       │─────▶│  DynamicField   │
│                 │      │                 │      │                 │
│ - Crear campos  │      │ - Sirve config  │      │ - Renderiza UI  │
│ - Configurar    │      │ - JSON dinámico │      │ - Valida        │
│ - Ordenar       │      │                 │      │ - Guarda        │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Flujo:**
1. TI crea/configura campo en Admin (banco de campos)
2. API sirve la configuración como JSON
3. Frontend renderiza automáticamente según `field_type`

---

## Tipos de Campo Soportados

### Entrada de Texto

| field_type | Descripción | Cuándo Usar | Ejemplo |
|------------|-------------|-------------|---------|
| `text` | Texto libre | Nombres, direcciones, referencias | Nombres, Dirección |
| `email` | Email con validación | Correos electrónicos | Correo Electrónico |
| `phone` | Teléfono (9 dígitos) | Celulares peruanos | Celular |
| `document_number` | DNI/CE/Pasaporte | Documentos de identidad | Número de Documento |
| `textarea` | Texto largo multilínea | Comentarios, descripciones | Comentarios Adicionales |

### Numéricos

| field_type | Descripción | Cuándo Usar | Ejemplo |
|------------|-------------|-------------|---------|
| `number` | Número entero/decimal | Cantidades, edades | Años de experiencia |
| `currency` | Monto con prefijo S/ | Ingresos, montos | Ingreso Mensual |

### Fecha

| field_type | Descripción | Cuándo Usar | Ejemplo |
|------------|-------------|-------------|---------|
| `date` | Selector de fecha | Fechas de nacimiento, ingreso | Fecha de Nacimiento |

### Selección

| field_type | Descripción | Cuándo Usar | Ejemplo |
|------------|-------------|-------------|---------|
| `radio` | Opciones exclusivas | 2-5 opciones fijas | Sexo, Tipo Documento |
| `select` | Dropdown | 6+ opciones, o datos de API | Departamento, Ciclo |
| `autocomplete` | Búsqueda con lazy load | Datasets grandes (1000+) | Institución, Carrera |
| `checkbox` | Casilla(s) de verificación | Aceptaciones, múltiple selección | Términos y Condiciones |

### Archivos

| field_type | Descripción | Cuándo Usar | Ejemplo |
|------------|-------------|-------------|---------|
| `file` | Subida de archivos | Documentos, constancias | Constancia de Estudios |

---

## Comportamiento Automático

### Radio: Renderizado Inteligente por Cantidad

El tipo `radio` se renderiza diferente según la cantidad de opciones:

| Opciones | Componente | Visual |
|----------|------------|--------|
| 2-3 | SegmentedControl | Botones horizontales |
| 4-5 | RadioGroup | Cards verticales |
| 6+ | SelectInput | Dropdown |

**Ejemplo:** Si configuras un campo `radio` con 3 opciones, se mostrará como botones horizontales automáticamente.

### Select vs Autocomplete

| Característica | `select` | `autocomplete` |
|----------------|----------|----------------|
| Carga de opciones | Al abrir dropdown | Al escribir (lazy) |
| Búsqueda | Local (filtro) | Remota (API) |
| Ideal para | <500 opciones | >500 opciones |
| Ejemplo | Departamentos (25) | Instituciones (41,747) |
| Persistencia | Solo value | Value + Label |

**Nota sobre persistencia:** Los campos `autocomplete` guardan también el **label** en localStorage. Esto permite mostrar el valor seleccionado después de un refresh, incluso cuando las opciones no están cargadas (lazy search).

---

## Configuración de Campos

### Propiedades Principales

| Propiedad | Descripción | Ejemplo |
|-----------|-------------|---------|
| `code` | Identificador único | `first_name`, `phone` |
| `label` | Texto visible | "Nombres", "Celular" |
| `field_type` | Tipo de campo (ver tabla arriba) | `text`, `select` |
| `is_required` | Campo obligatorio | `true` / `false` |
| `placeholder` | Texto de ayuda en input | "Ingresa tu nombre" |

### Propiedades de Validación

| Propiedad | Aplica a | Descripción |
|-----------|----------|-------------|
| `min_length` | text, textarea | Mínimo de caracteres |
| `max_length` | text, textarea | Máximo de caracteres |
| `min_value` | number, currency | Valor mínimo |
| `max_value` | number, currency | Valor máximo |
| `pattern` | text | Regex de validación |

### Propiedades de Opciones

| Propiedad | Uso |
|-----------|-----|
| `options_static` | JSON con opciones fijas `[{value, label}]` |
| `options_source` | Endpoint de API (`geo-units/departments`) |
| `cascade_from` | Campo padre para cascading (`department`) |
| `cascade_param` | Parámetro de filtro (`parent_id`) |
| `min_search_length` | Caracteres mínimos para lazy search (`3`) |

### Propiedades de Mapeo (Backend)

| Propiedad | Descripción |
|-----------|-------------|
| `maps_to_table` | Tabla destino (`person`, `person_address_history`) |
| `maps_to_column` | Columna destino (`first_name`, `street_address`) |

---

## Ejemplos de Configuración

### Campo de Texto Simple

```json
{
  "code": "first_name",
  "label": "Nombres",
  "field_type": "text",
  "is_required": true,
  "placeholder": "Ingresa tus nombres",
  "max_length": 100,
  "maps_to_table": "person",
  "maps_to_column": "first_name"
}
```

### Campo Select con Opciones Estáticas

```json
{
  "code": "semester",
  "label": "Ciclo Actual",
  "field_type": "select",
  "is_required": true,
  "options_static": [
    {"value": "1", "label": "1er Ciclo"},
    {"value": "2", "label": "2do Ciclo"},
    {"value": "egresado", "label": "Egresado"}
  ],
  "maps_to_table": "person_academic_history",
  "maps_to_column": "current_cycle"
}
```

### Campo Select con Cascading (Ubicación)

```json
// Departamento (padre)
{
  "code": "department",
  "label": "Departamento",
  "field_type": "select",
  "options_source": "geo-units/departments",
  "maps_to_table": "person_address_history",
  "maps_to_column": "department"
}

// Provincia (hijo de departamento)
{
  "code": "province",
  "label": "Provincia",
  "field_type": "select",
  "options_source": "geo-units/provinces",
  "cascade_from": "department",
  "cascade_param": "parent_id",
  "maps_to_table": "person_address_history",
  "maps_to_column": "province"
}
```

### Campo Autocomplete (Búsqueda Lazy)

```json
{
  "code": "institution",
  "label": "Institución Educativa",
  "field_type": "autocomplete",
  "options_source": "study-centers",
  "min_search_length": 3,
  "placeholder": "Escribe para buscar...",
  "maps_to_table": "person_academic_history",
  "maps_to_column": "institution_id"
}
```

### Campo Checkbox de Consentimiento

```json
{
  "code": "terms_acceptance",
  "label": "Acepto los términos y condiciones",
  "field_type": "checkbox",
  "is_required": true,
  "maps_to_table": "application_consent",
  "maps_to_column": "terms_accepted"
}
```

---

## Endpoints de Opciones Disponibles

| options_source | Descripción | Registros |
|----------------|-------------|-----------|
| `geo-units/departments` | Departamentos de Perú | 25 |
| `geo-units/provinces` | Provincias (requiere `parent_id`) | 195 |
| `geo-units/districts` | Distritos (requiere `parent_id`) | 1,852 |
| `study-centers` | Instituciones educativas | 41,747 |
| `careers` | Carreras profesionales | ~500 |
| `marital-status` | Estados civiles | 5 |

---

## Tablas de Destino (maps_to_table)

| Tabla | Campos Típicos |
|-------|----------------|
| `person` | first_name, paternal_surname, document_number, email, phone |
| `person_contact_history` | phone_secondary |
| `person_address_history` | department, province, district, address |
| `person_academic_history` | institution_id, career_id, student_code, current_cycle |
| `person_employment_history` | company_name, monthly_income, employment_type |
| `application` | payment_day, referral_source, notes |
| `application_consent` | terms_accepted, privacy_accepted, marketing_accepted |
| `application_document` | file_path (para archivos) |

---

## Preguntas Frecuentes

### ¿Puedo crear un tipo de campo nuevo?

No directamente. Los tipos soportados están definidos en el Frontend. Si necesitas un tipo completamente nuevo (ej: firma digital, rating de estrellas), coordina con el equipo de Frontend.

### ¿Qué pasa si uso un tipo no soportado?

El Frontend lo renderizará como un campo de texto simple (`TextInput`). Funcionará, pero sin la UI especializada.

### ¿Cómo agrego un campo condicional?

Usa la tabla `form_field_dependency`:
- `depends_on_field`: código del campo padre
- `operator`: `equals`, `not_equals`, `in`, `is_empty`, etc.
- `value`: valor que activa la condición
- `action`: `show`, `hide`, `require`, `disable`

### ¿Cómo hago que un campo tenga búsqueda?

1. Para datasets pequeños (<500): usa `field_type: select` - la búsqueda es local
2. Para datasets grandes (>500): usa `field_type: autocomplete` con `min_search_length: 3`

---

## Checklist para Agregar un Campo Nuevo

- [ ] Elegir `field_type` apropiado de la lista soportada
- [ ] Definir `code` único (snake_case, sin espacios)
- [ ] Escribir `label` en español con tildes
- [ ] Configurar `is_required` según necesidad
- [ ] Si tiene opciones: configurar `options_static` u `options_source`
- [ ] Si es cascading: configurar `cascade_from` y `cascade_param`
- [ ] **Configurar `maps_to_table` y `maps_to_column`** para que se guarde en BD
- [ ] Agregar validaciones si aplica (`min_length`, `pattern`, etc.)
- [ ] Vincular al step correspondiente via `form_step_field`

---

*Última actualización: Marzo 2026*
