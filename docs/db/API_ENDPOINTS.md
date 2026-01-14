# API Endpoints - BaldeCash Admin

## Resumen Ejecutivo

Este documento describe todos los endpoints disponibles en la API de BaldeCash Admin, organizados por dominio funcional y casos de uso.

**Base URL:** `/api/v1`

---

## 1. Autenticacion (`/auth`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login con OAuth2 form-data | No |
| POST | `/auth/signin` | Login con JSON body | No |
| POST | `/auth/signup` | Registro de usuario | No |
| POST | `/auth/signout` | Logout (client-side) | No |
| POST | `/auth/refresh` | Refrescar token JWT | Si |
| POST | `/auth/forgot-password` | Solicitar reset de password | No |

### Casos de Uso

1. **Login de usuario admin**: Usuario ingresa credenciales, recibe JWT token para acceder al panel.
2. **Registro de nuevos usuarios**: Crear cuenta con rol VIEWER por defecto.
3. **Recuperacion de password**: Enviar email de reset (placeholder).

---

## 2. Usuarios (`/users`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Listar usuarios (paginado) | Admin |
| GET | `/users/me` | Obtener perfil actual | Si |
| GET | `/users/{id}` | Obtener usuario por ID | Admin |
| POST | `/users` | Crear usuario | Admin |
| PUT | `/users/{id}` | Actualizar usuario | Admin |
| DELETE | `/users/{id}` | Desactivar usuario (soft delete) | Admin |

### Casos de Uso

1. **Gestion de usuarios del sistema**: CRUD completo para administrar cuentas.
2. **Asignacion de roles**: ADMIN, EDITOR, VIEWER.
3. **Ver perfil propio**: Cualquier usuario autenticado.

---

## 3. Instituciones (`/institutions`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/institutions` | Listar instituciones | No |
| GET | `/institutions/{id}` | Obtener institucion | No |
| POST | `/institutions` | Crear institucion | Si |
| PUT | `/institutions/{id}` | Actualizar institucion | Si |
| DELETE | `/institutions/{id}` | Desactivar institucion | Si |
| GET | `/institutions/{id}/campuses` | Listar sedes | No |
| POST | `/institutions/{id}/campuses` | Crear sede | Si |
| PUT | `/institutions/campuses/{id}` | Actualizar sede | Si |
| DELETE | `/institutions/campuses/{id}` | Desactivar sede | Si |

### Casos de Uso

1. **Registro de instituciones educativas**: Universidades, institutos, colegios.
2. **Gestion de sedes/campus**: Ubicaciones geograficas de la institucion.
3. **Tipos de gestion**: Publica, privada.

---

## 4. Convenios (`/agreements`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/agreements` | Listar convenios | No |
| GET | `/agreements/{id}` | Obtener convenio | No |
| POST | `/agreements` | Crear convenio | Si |
| PUT | `/agreements/{id}` | Actualizar convenio | Si |
| DELETE | `/agreements/{id}` | Desactivar convenio | Si |

### Casos de Uso

1. **Crear convenios con instituciones**: Descuentos especiales, tasas preferenciales.
2. **Vigencia de convenios**: Fechas de inicio y fin.
3. **Tipos de convenio**: Exclusivo, abierto, promocional.

---

## 5. Productos (`/products`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Listar productos | No |
| GET | `/products/{id}` | Detalle de producto | No |
| GET | `/products/slug/{slug}` | Producto por slug | No |
| GET | `/products/compare` | Comparar productos | No |
| POST | `/products` | Crear producto | Si |
| PUT | `/products/{id}` | Actualizar producto | Si |
| DELETE | `/products/{id}` | Desactivar producto | Si |
| GET | `/products/{id}/images` | Listar imagenes | No |
| POST | `/products/{id}/images` | Agregar imagen | Si |
| GET | `/products/{id}/pricing` | Listar opciones de precio | No |
| POST | `/products/{id}/pricing` | Agregar opcion de precio | Si |
| POST | `/products/{id}/specs` | Agregar especificacion | Si |

### Casos de Uso

1. **Catalogo de productos**: Laptops, tablets, celulares.
2. **Gestion de precios por plazo**: Cuotas a 12, 18, 24 meses.
3. **Especificaciones tecnicas**: RAM, procesador, almacenamiento.
4. **Comparador de productos**: Hasta 4 productos lado a lado.

---

## 6. Marcas (`/brands`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/brands` | Listar marcas | No |
| GET | `/brands/{id}` | Obtener marca | No |
| POST | `/brands` | Crear marca | Si |
| PUT | `/brands/{id}` | Actualizar marca | Si |
| DELETE | `/brands/{id}` | Desactivar marca | Si |

### Casos de Uso

1. **Catalogo de marcas**: HP, Lenovo, Dell, Apple, etc.
2. **Logos y assets de marca**.

---

## 7. Plantillas (`/landing-templates`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/landing-templates` | Listar plantillas | No |
| GET | `/landing-templates/{id}` | Detalle de plantilla | No |
| GET | `/landing-templates/code/{code}` | Plantilla por codigo | No |
| POST | `/landing-templates` | Crear plantilla | Si |
| PUT | `/landing-templates/{id}` | Actualizar plantilla | Si |
| DELETE | `/landing-templates/{id}` | Eliminar plantilla (soft) | Si |
| POST | `/landing-templates/{id}/duplicate` | Duplicar plantilla | Si |
| GET | `/landing-templates/{id}/landings` | Landings usando esta plantilla | No |

### Estructura de una Plantilla

```json
{
  "id": 1,
  "code": "normal",
  "name": "Flujo Normal",
  "description": "Formulario de 4 pasos estandar",
  "is_system": true,
  "is_active": true,
  "landings_count": 5,
  "default_config": {
    "primary_color": "#2563EB",
    "hero_title": "Consigue tu laptop"
  },
  "default_steps": {
    "steps": [
      {
        "step_code": "step_identity",
        "display_order": 0,
        "fields": [
          {"field_code": "document_type", "is_required": true},
          {"field_code": "document_number", "is_required": true}
        ]
      }
    ]
  },
  "default_components": {...},
  "default_filters": {...},
  "default_features": {"chat": true, "faq": true}
}
```

### Casos de Uso

1. **Crear landing desde plantilla**: Al crear landing con template_id, se aplican todos los defaults.
2. **Cambiar plantilla de landing existente**: Endpoint apply-template permite reconfigurar.
3. **Duplicar plantilla**: Crear variaciones de plantillas existentes.

---

## 8. Form Builder (`/form-steps`, `/form-fields`)

### Catalogo de Pasos (FormStep)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/form-steps` | Listar pasos disponibles | No |
| GET | `/form-steps/{id}` | Detalle de paso | No |
| POST | `/form-steps` | Crear paso | Si |
| PUT | `/form-steps/{id}` | Actualizar paso | Si |
| DELETE | `/form-steps/{id}` | Desactivar paso | Si |
| GET | `/form-steps/{id}/fields` | Campos del paso | No |

### Catalogo de Campos (FormField)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/form-fields` | Listar campos disponibles | No |
| GET | `/form-fields/{id}` | Detalle de campo | No |
| POST | `/form-fields` | Crear campo | Si |
| PUT | `/form-fields/{id}` | Actualizar campo | Si |
| DELETE | `/form-fields/{id}` | Desactivar campo | Si |

### Tipos de Paso (StepType)

| Valor | Descripcion |
|-------|-------------|
| `form` | Paso de formulario con campos |
| `upsell` | Paso de ventas cruzadas (accesorios/seguros) |
| `confirmation` | Paso de confirmacion final |

### Categorias de Paso

| Categoria | Descripcion |
|-----------|-------------|
| `identity` | Datos personales |
| `contact` | Informacion de contacto |
| `academic` | Datos academicos |
| `work` | Datos laborales |
| `references` | Referencias personales |
| `special` | Upsell, confirmacion |
| `custom` | Pasos personalizados |

### Casos de Uso

1. **Catalogo reutilizable**: Pasos y campos disponibles para todas las landings.
2. **Crear paso custom**: Para flujos especificos de un cliente.
3. **Definir validaciones**: Cada campo tiene sus reglas de validacion.

---

## 9. Landings (`/landings`)

### Endpoints Principales

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/landings` | Listar landings | No |
| GET | `/landings/{id}` | Detalle de landing | No |
| GET | `/landings/slug/{slug}` | Landing por slug | No |
| POST | `/landings` | Crear landing | Si |
| PUT | `/landings/{id}` | Actualizar landing | Si |
| DELETE | `/landings/{id}` | Desactivar landing | Si |
| GET | `/landings/{id}/config` | Configuracion completa | No |
| GET | `/landings/{id}/full` | Detalle completo (admin) | No |
| POST | `/landings/{id}/apply-template` | Aplicar template | Si |

### Endpoints de Productos

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/landings/{id}/products` | Listar productos | No |
| POST | `/landings/{id}/products` | Agregar producto | Si |
| DELETE | `/landings/{id}/products/{pid}` | Quitar producto | Si |

### Endpoints de Formulario

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/landings/{id}/steps` | Listar pasos | No |
| POST | `/landings/{id}/steps` | Agregar paso | Si |
| PUT | `/landings/{id}/steps/{sid}` | Actualizar paso | Si |
| DELETE | `/landings/{id}/steps/{sid}` | Quitar paso | Si |
| GET | `/landings/{id}/steps/{sid}/fields` | Campos del paso | No |
| POST | `/landings/{id}/steps/{sid}/fields` | Agregar campo | Si |
| PUT | `/landings/{id}/steps/{sid}/fields/reorder` | Reordenar campos | Si |

### Endpoints de Componentes

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/landings/{id}/home-components` | Componentes home | No |
| POST | `/landings/{id}/home-components` | Agregar componente | Si |
| PUT | `/landings/{id}/home-components/{cid}` | Actualizar | Si |
| DELETE | `/landings/{id}/home-components/{cid}` | Quitar | Si |
| PUT | `/landings/{id}/home-components/reorder` | Reordenar | Si |

### Endpoints de Versionamiento y Staging

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/landings/{id}/versions` | Listar versiones | No |
| GET | `/landings/{id}/versions/{vid}` | Detalle version | No |
| GET | `/landings/{id}/versions/{vid}/stats` | Estadisticas por version | No |
| POST | `/landings/{id}/versions` | Crear version (snapshot) | Si |
| POST | `/landings/{id}/versions/{vid}/submit` | Enviar a revision | Si |
| POST | `/landings/{id}/versions/{vid}/review` | Aprobar/rechazar | Si |
| POST | `/landings/{id}/versions/{vid}/publish` | Publicar version | Si |
| GET | `/landings/{id}/staging-status` | Estado de staging y acciones disponibles | No |
| POST | `/landings/{id}/discard-staging` | Descartar staging y restaurar version publicada | Si |
| GET | `/landings/{id}/history` | Historial de cambios | No |
| GET | `/landings/{id}/stats` | Estadisticas generales | No |

### Workflow de Staging

```
1. Admin edita pasos/campos (cambios inmediatos en tablas, preview disponible)
2. Admin crea version: POST /landings/{id}/versions
   - Se genera snapshot de la config actual
   - Status: DRAFT
3. (Opcional) Enviar a revision: POST /versions/{vid}/submit
   - Status: PENDING_REVIEW
4. (Opcional) Aprobar: POST /versions/{vid}/review
   - Body: {"approved": true, "notes": "OK"}
   - Status: APPROVED
5. Publicar: POST /versions/{vid}/publish
   - Status: PUBLISHED
   - Se actualiza current_version_id del landing
6. Publico ve la nueva version via GET /public/landing/{slug}/form
```

### Descartar Staging (Rollback)

Si quieres cancelar los cambios pendientes y volver a la ultima version publicada:

```http
GET /api/v1/landings/{id}/staging-status
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
    "name": "Version Reducida",
    "status": "published",
    "published_at": "2025-01-15T10:30:00"
  },
  "staging_version": {
    "id": 6,
    "version_number": 3,
    "name": "Version Nueva",
    "status": "pending_review",
    "staging_url": "/preview/abc123..."
  },
  "available_actions": ["approve", "reject", "discard"]
}
```

Para descartar todos los cambios y restaurar:

```http
POST /api/v1/landings/{id}/discard-staging
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
    "name": "Version Reducida"
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

### Crear Version (Snapshot)

```http
POST /api/v1/landings/1/versions
{
  "name": "Version 2 - Nuevo flujo academico",
  "notes": "Se agrego paso de referencias y email requerido"
}

Response:
{
  "id": 5,
  "landing_id": 1,
  "version_number": 2,
  "status": "draft",
  "name": "Version 2 - Nuevo flujo academico",
  "notes": "...",
  "staging_token": "abc123xyz...",
  "staging_url": "/preview/abc123xyz",
  "form_config_snapshot": {...},
  "created_at": "2025-01-15T10:00:00Z"
}
```

### Estadisticas por Version

```http
GET /api/v1/landings/1/versions/5/stats

Response:
{
  "version_id": 5,
  "version_number": 2,
  "version_name": "Version 2 - Nuevo flujo",
  "published_at": "2025-01-15T12:00:00Z",
  "stats": {
    "applications_count": 150,
    "leads_count": 320,
    "conversion_rate": 46.9,
    "avg_completion_time_seconds": 245,
    "by_status": {
      "draft": 10,
      "submitted": 45,
      "approved": 80,
      "rejected": 15
    },
    "by_step_dropoff": [
      {"step": "step_identity", "started": 320, "completed": 290, "dropoff_rate": 9.4},
      {"step": "step_academic", "started": 290, "completed": 250, "dropoff_rate": 13.8},
      {"step": "step_work", "started": 250, "completed": 200, "dropoff_rate": 20.0},
      {"step": "step_upsell", "started": 200, "completed": 150, "dropoff_rate": 25.0}
    ]
  }
}
```

### Historial de Cambios (Changelog)

```http
GET /api/v1/landings/1/history?limit=20&change_type=FIELD_UPDATED

Response:
{
  "items": [
    {
      "id": 123,
      "change_type": "FIELD_UPDATED",
      "entity_type": "landing_field",
      "entity_id": 45,
      "entity_name": "email",
      "old_value": {"is_required": false},
      "new_value": {"is_required": true},
      "changed_fields": ["is_required"],
      "changed_by": 1,
      "changed_by_name": "Admin User",
      "changed_at": "2025-01-15T14:30:00Z"
    }
  ],
  "total": 156
}
```

### Tipos de Cambio Registrados

| Tipo | Descripcion |
|------|-------------|
| `LANDING_CREATED` | Landing creado |
| `LANDING_UPDATED` | Landing actualizado |
| `STEP_ADDED` | Paso agregado al landing |
| `STEP_UPDATED` | Configuracion de paso modificada |
| `STEP_REMOVED` | Paso removido del landing |
| `FIELD_ADDED` | Campo agregado a paso |
| `FIELD_UPDATED` | Configuracion de campo modificada |
| `FIELD_REMOVED` | Campo removido de paso |
| `VERSION_PUBLISHED` | Version publicada |
| `VERSION_APPROVED` | Version aprobada |
| `VERSION_REJECTED` | Version rechazada |

### Casos de Uso

1. **Crear landing personalizada**: Para cada institucion/convenio.
2. **Configurar formulario**: Pasos y campos del proceso de solicitud.
3. **Gestion de productos**: Que productos se muestran en cada landing.
4. **Workflow de publicacion**: Draft -> Staging -> Review -> Published.
5. **Componentes de homepage**: Hero, productos destacados, testimonios, FAQ.
6. **Upsells**: Accesorios y seguros por landing.

---

## 10. Leads (`/leads`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/leads` | Listar leads | Si |
| GET | `/leads/{id}` | Detalle de lead | Si |
| POST | `/leads` | Crear lead | No |
| PUT | `/leads/{id}` | Actualizar lead | Si |
| POST | `/leads/{id}/recalculate-score` | Recalcular score | Si |
| GET | `/leads/score-rules` | Listar reglas | Si |
| POST | `/leads/score-rules` | Crear regla | Si |
| GET | `/leads/{id}/interactions` | Interacciones | Si |
| POST | `/leads/{id}/interactions` | Agregar interaccion | Si |

### Tracking de Version

Cada lead captura automaticamente la version de landing activa:

```json
{
  "id": 123,
  "landing_id": 1,
  "landing_version_id": 5,
  "person_data": {...},
  "score": 45
}
```

Esto permite analizar:
- Tasa de captura por version de landing
- Efectividad de cambios en el formulario
- A/B testing entre versiones

### Casos de Uso

1. **Captura de leads**: Visitantes que inician el formulario.
2. **Lead scoring**: Puntaje automatico basado en reglas.
3. **Seguimiento de interacciones**: Llamadas, emails, notas.
4. **Conversion de lead a solicitud**.
5. **Analytics por version**: Comparar metricas entre versiones de landing.

---

## 11. Solicitudes (`/applications`)

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/applications` | Listar solicitudes | Si |
| GET | `/applications/{id}` | Detalle solicitud | Si |
| GET | `/applications/code/{code}` | Por codigo | No |
| POST | `/applications` | Crear solicitud | No |
| PUT | `/applications/{id}` | Actualizar | Si |
| POST | `/applications/{id}/submit` | Enviar a revision | No |
| GET | `/applications/{id}/products` | Productos | Si |
| POST | `/applications/{id}/products` | Agregar producto | No |
| GET | `/applications/{id}/status-logs` | Historial estados | Si |

### Tracking de Version

Cada solicitud captura la version de landing activa al momento de crearse:

```json
{
  "id": 789,
  "code": "BC-2025-A1B2C3D4",
  "landing_id": 1,
  "landing_version_id": 5,
  "status": "submitted",
  "total_amount": 2154.00
}
```

Esto permite:
- Ver cuantas solicitudes llegaron por cada version
- Comparar tasa de conversion entre versiones
- Identificar si una version nueva afecta negativamente las conversiones

### Estados de Solicitud

```
draft -> submitted -> in_review -> approved/rejected -> disbursed
```

### Casos de Uso

1. **Proceso de solicitud completo**: Desde formulario hasta desembolso.
2. **Evaluacion crediticia**: Aprobar o rechazar.
3. **Tracking de estado**: El cliente puede consultar por codigo.
4. **Historial de cambios de estado**.
5. **Analytics por version**: Medir impacto de cambios en el flujo.

---

## 12. Endpoints Publicos (`/public`)

### Landing

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/public/landing/{slug}` | Config completa de landing |
| GET | `/public/landing/{slug}/form` | Configuracion del formulario |
| GET | `/public/landing/{slug}/features` | Features habilitadas |

### Catalogo

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/public/landing/{slug}/products` | Productos de la landing |
| GET | `/public/landing/{slug}/products/{id}` | Detalle de producto |
| GET | `/public/landing/{slug}/filters` | Filtros disponibles |

### Simulador

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/public/simulate` | Simulacion completa con cronograma |
| POST | `/public/quick-simulate` | Simulacion rapida |
| GET | `/public/installment-options` | Opciones de cuotas |
| GET | `/public/landing/{slug}/products/{id}/installments` | Cuotas para producto |

### Formulario

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/public/form/check-person` | Verificar si persona existe |
| POST | `/public/form/save-step` | Guardar paso parcial |
| POST | `/public/form/submit` | Enviar solicitud completa |
| GET | `/public/form/application/{code}/status` | Estado de solicitud |
| GET | `/public/form/validate/document/{doc}` | Validar documento |
| GET | `/public/form/validate/email/{email}` | Validar email |
| GET | `/public/form/validate/phone/{phone}` | Validar telefono |

### Casos de Uso

1. **Frontend consume configuracion**: Landing obtiene colores, logo, productos.
2. **Catalogo con filtros**: Productos por marca, precio, tipo.
3. **Simulador de credito**: Calcular cuotas y TEA/TCEA.
4. **Proceso de solicitud**: Formulario multi-paso con guardado parcial.
5. **Consulta de estado**: Cliente verifica estado de su solicitud.

---

## 13. Otros Endpoints

### Categorias (`/categories`)
- CRUD de categorias de productos.

### Accesorios (`/accessories`)
- CRUD de accesorios (fundas, cargadores, etc.)

### Seguros (`/insurances`)
- CRUD de opciones de seguro.

### Especificaciones (`/specs`)
- Definiciones de specs (RAM, procesador, etc.)

### Tags (`/tags`)
- Etiquetas para productos.

### Promociones (`/promotions`)
- Gestion de promociones y descuentos.

### Upload (`/upload`)
- Subida de archivos/imagenes.

### Preaprobados (`/preapproved`)
- Clientes con credito preaprobado.

---

## Autenticacion

Todos los endpoints marcados con **Auth: Si** requieren:

```
Authorization: Bearer <jwt_token>
```

Roles:
- **ADMIN**: Acceso total
- **EDITOR**: CRUD de contenido
- **VIEWER**: Solo lectura

---

## Paginacion

Endpoints que devuelven listas soportan:

```
?page=1&page_size=20
```

Respuesta:
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

---

## Filtros Comunes

- `search`: Busqueda por texto
- `is_active`: Filtrar por estado activo
- `status`: Filtrar por estado especifico

---

## Credenciales de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@baldecash.com | admin123 | ADMIN |

*Creadas por `seed_landings.py`*

---

# Customer Journey Completo

## Flujo End-to-End: Desde Visita hasta Desembolso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ DESCUBRE │───>│ EXPLORA  │───>│ SIMULA   │───>│ SOLICITA │───>│APRUEBA ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│
│       │              │               │               │               │      │
│       v              v               v               v               v      │
│   Landing        Catalogo        Simulador       Formulario      Evaluacion │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Descubrimiento (Landing)

### Escenario
> Juan es estudiante de SENATI y recibe un link: `baldecash.com/senati`

### Flujo de APIs

```
1. Frontend carga la landing
   GET /public/landing/senati

   Response:
   {
     "id": 1,
     "slug": "senati",
     "name": "BaldeCash SENATI",
     "institution": { "name": "SENATI", "logo_url": "..." },
     "agreement": {
       "discount_percentage": 10,
       "special_tea": 42.5
     },
     "primary_color": "#003366",
     "hero_title": "Laptops para estudiantes SENATI",
     "hero_image_url": "...",
     "features": { "simulator": true, "chat": true }
   }

2. Frontend obtiene componentes del home
   GET /public/landing/senati/features

   Response:
   {
     "features": {
       "hero": { "enabled": true, "version": "v2" },
       "featured_products": { "enabled": true },
       "benefits": { "enabled": true },
       "testimonials": { "enabled": false }
     }
   }
```

### Tracking (Backend)
```
POST /public/tracking/session
{
  "landing_id": 1,
  "utm_source": "email",
  "utm_campaign": "senati-2025"
}

Response:
{
  "session_uuid": "abc-123-xyz-789"
}
```

---

## Fase 2: Exploracion (Catalogo)

### Escenario
> Juan navega el catalogo buscando una laptop para sus clases

### Flujo de APIs

```
1. Cargar filtros disponibles
   GET /public/landing/senati/filters

   Response:
   {
     "brands": [
       { "id": 1, "name": "HP", "slug": "hp" },
       { "id": 2, "name": "Lenovo", "slug": "lenovo" }
     ],
     "price_range": { "min": 1200, "max": 4500 },
     "types": ["laptop", "tablet"],
     "sort_options": [
       { "value": "display_order", "label": "Recomendados" },
       { "value": "price_asc", "label": "Menor precio" }
     ]
   }

2. Listar productos
   GET /public/landing/senati/products?sort_by=price_asc&min_price=1500&max_price=2500

   Response:
   {
     "items": [
       {
         "id": 45,
         "name": "HP 250 G9",
         "slug": "hp-250-g9",
         "brand": "HP",
         "list_price": 2199,
         "cash_price": 1979,  // Con descuento SENATI
         "monthly_payment": 189,  // Cuota referencial 12 meses
         "main_image": "https://...",
         "is_featured": true
       },
       ...
     ],
     "total": 8,
     "page": 1
   }

3. Ver detalle de producto
   GET /public/landing/senati/products/45

   Response:
   {
     "id": 45,
     "name": "HP 250 G9",
     "description": "Laptop ideal para estudiantes...",
     "list_price": 2199,
     "cash_price": 1979,
     "images": [
       { "url": "...", "is_main": true },
       { "url": "...", "alt": "Vista lateral" }
     ],
     "specs": [
       { "name": "Procesador", "value": "Intel Core i5-1235U" },
       { "name": "RAM", "value": "8GB DDR4" },
       { "name": "Almacenamiento", "value": "512GB SSD" },
       { "name": "Pantalla", "value": "15.6\" FHD" }
     ],
     "accessories": [
       { "id": 1, "name": "Mouse inalambrico", "price": 49 },
       { "id": 2, "name": "Mochila HP", "price": 89 }
     ],
     "insurances": [
       { "id": 1, "name": "Garantia extendida 1 año", "price": 99 }
     ]
   }
```

### Tracking
```
POST /public/tracking/event
{
  "session_uuid": "abc-123-xyz-789",
  "event_type": "product_view",
  "product_id": 45
}
```

---

## Fase 3: Simulacion (Calculadora)

### Escenario
> Juan quiere saber cuanto pagaria mensualmente

### Flujo de APIs

```
1. Obtener opciones de cuotas para el producto
   GET /public/landing/senati/products/45/installments?initial_payment=200

   Response:
   {
     "product_id": 45,
     "product_name": "HP 250 G9",
     "list_price": 2199,
     "cash_price": 1979,
     "discount_percent": 10,
     "initial_payment": 200,
     "financed_amount": 1581.10,
     "installments": [
       { "term": 6, "monthly_payment": 289, "total": 1734, "tea": 42.5, "tcea": 48.2 },
       { "term": 12, "monthly_payment": 156, "total": 1872, "tea": 42.5, "tcea": 49.1 },
       { "term": 18, "monthly_payment": 112, "total": 2016, "tea": 42.5, "tcea": 50.3 },
       { "term": 24, "monthly_payment": 89, "total": 2136, "tea": 42.5, "tcea": 51.2 }
     ]
   }

2. Simulacion completa con accesorios
   POST /public/simulate?landing_slug=senati
   {
     "product_price": 1979,
     "term_months": 12,
     "initial_payment": 200,
     "accessories_ids": [1, 2],
     "insurance_id": 1
   }

   Response:
   {
     "product_price": 1979,
     "accessories_total": 138,
     "insurance_total": 99,
     "initial_payment": 200,
     "financed_amount": 1816.10,
     "term_months": 12,
     "monthly_payment": 179.50,
     "total_amount": 2154.00,
     "total_interest": 337.90,
     "tea": 42.5,
     "tcea": 49.1,
     "first_due_date": "2025-02-15",
     "discount_applied": 219.90,
     "schedule": [
       { "number": 1, "due_date": "2025-02-15", "principal": 135.20, "interest": 44.30, "total": 179.50, "remaining": 1680.90 },
       { "number": 2, "due_date": "2025-03-15", "principal": 138.50, "interest": 41.00, "total": 179.50, "remaining": 1542.40 },
       ...
     ]
   }
```

### Tracking
```
POST /public/tracking/event
{
  "session_uuid": "abc-123-xyz-789",
  "event_type": "simulation",
  "data": { "product_id": 45, "term": 12, "monthly_payment": 179.50 }
}
```

---

## Fase 4: Solicitud (Formulario)

### Escenario
> Juan decide solicitar el credito y llena el formulario

### Flujo de APIs

```
1. Obtener configuracion del formulario
   GET /public/landing/senati/form

   Response:
   {
     "total_steps": 4,
     "total_fields": 18,
     "steps": [
       {
         "code": "datos-personales",
         "name": "Datos Personales",
         "description": "Informacion basica",
         "display_order": 1,
         "fields": [
           { "code": "document_type", "name": "Tipo de documento", "type": "select", "required": true },
           { "code": "document_number", "name": "Numero de documento", "type": "text", "required": true },
           { "code": "nombres", "name": "Nombres", "type": "text", "required": true },
           { "code": "apellido_paterno", "name": "Apellido paterno", "type": "text", "required": true },
           { "code": "email", "name": "Correo electronico", "type": "email", "required": true },
           { "code": "celular", "name": "Celular", "type": "phone", "required": true }
         ]
       },
       {
         "code": "centro-estudios",
         "name": "Centro de Estudios",
         "display_order": 2,
         "fields": [
           { "code": "carrera", "name": "Carrera", "type": "text", "required": true },
           { "code": "ciclo", "name": "Ciclo", "type": "select", "required": true },
           { "code": "codigo_estudiante", "name": "Codigo de estudiante", "type": "text", "required": true }
         ]
       },
       {
         "code": "datos-laborales",
         "name": "Datos Laborales",
         "display_order": 3,
         "fields": [
           { "code": "situacion_laboral", "name": "Situacion laboral", "type": "select", "required": true },
           { "code": "ingreso_mensual", "name": "Ingreso mensual", "type": "number", "required": false }
         ]
       },
       {
         "code": "referencias",
         "name": "Referencias",
         "display_order": 4,
         "fields": [
           { "code": "referencia_nombre", "name": "Nombre de referencia", "type": "text", "required": true },
           { "code": "referencia_telefono", "name": "Telefono de referencia", "type": "phone", "required": true }
         ]
       }
     ]
   }

2. Verificar si el DNI ya existe (prefill)
   POST /public/form/check-person
   {
     "document_type": "dni",
     "document_number": "71234567"
   }

   Response (nuevo):
   {
     "exists": false,
     "is_preapproved": false,
     "prefill_data": null
   }

   Response (existente):
   {
     "exists": true,
     "is_preapproved": true,
     "preapproved_amount": 3000,
     "prefill_data": {
       "nombres": "Juan Carlos",
       "apellido_paterno": "Quispe",
       "email": "juan@gmail.com"
     }
   }

3. Validar campos en tiempo real
   GET /public/form/validate/document/71234567?document_type=dni
   Response: { "is_valid": true, "message": "Valido" }

   GET /public/form/validate/email/juan@gmail.com
   Response: { "is_valid": true, "message": "Email valido" }

   GET /public/form/validate/phone/987654321
   Response: { "is_valid": true, "type": "mobile", "message": "Numero valido" }

4. Guardar progreso por paso (auto-save)
   POST /public/form/save-step
   {
     "session_uuid": "abc-123-xyz-789",
     "step_code": "datos-personales",
     "data": {
       "document_type": "dni",
       "document_number": "71234567",
       "nombres": "Juan Carlos",
       "apellido_paterno": "Quispe",
       "apellido_materno": "Rodriguez",
       "email": "juan@gmail.com",
       "celular": "987654321"
     }
   }

   Response:
   {
     "success": true,
     "lead_id": 123,
     "lead_score": 45,
     "next_step": "centro-estudios"
   }

5. Enviar solicitud completa
   POST /public/form/submit
   {
     "session_uuid": "abc-123-xyz-789",
     "form_data": {
       "document_type": "dni",
       "document_number": "71234567",
       "nombres": "Juan Carlos",
       "apellido_paterno": "Quispe",
       "apellido_materno": "Rodriguez",
       "email": "juan@gmail.com",
       "celular": "987654321",
       "carrera": "Computacion",
       "ciclo": "4",
       "codigo_estudiante": "2023-12345",
       "situacion_laboral": "practicante",
       "ingreso_mensual": 1200,
       "referencia_nombre": "Maria Quispe",
       "referencia_telefono": "912345678"
     },
     "product_data": {
       "product_id": 45,
       "term_months": 12,
       "initial_payment": 200,
       "monthly_payment": 179.50,
       "total_amount": 2154.00,
       "tea": 42.5,
       "tcea": 49.1,
       "accessories": [1, 2],
       "insurance_id": 1
     }
   }

   Response:
   {
     "success": true,
     "application_code": "BC-2025-A1B2C3D4",
     "person_id": 456,
     "application_id": 789,
     "message": "Solicitud enviada exitosamente",
     "next_steps": [
       "Revisaremos tu solicitud en 24-48 horas",
       "Te contactaremos al numero 987654321",
       "Puedes consultar el estado con el codigo BC-2025-A1B2C3D4"
     ]
   }
```

### Lead Score Update
```
Durante el proceso, el score del lead se actualiza:

Paso 1 (datos-personales): Score = 25
  - DNI valido: +10
  - Email valido: +10
  - Celular valido: +5

Paso 2 (centro-estudios): Score = 45
  - Codigo estudiante: +15
  - Convenio SENATI: +5

Paso 3 (datos-laborales): Score = 65
  - Tiene ingresos: +15
  - Ingreso > 1000: +5

Paso 4 (referencias): Score = 75
  - Referencia completa: +10
```

---

## Fase 5: Evaluacion y Aprobacion

### Escenario
> El equipo de creditos evalua la solicitud de Juan

### Flujo Backend (Admin Panel)

```
1. Listar solicitudes pendientes
   GET /applications?status=submitted

   Response:
   {
     "items": [
       {
         "id": 789,
         "code": "BC-2025-A1B2C3D4",
         "status": "submitted",
         "person": { "full_name": "Juan Carlos Quispe Rodriguez" },
         "total_amount": 2154.00,
         "submitted_at": "2025-01-15T10:30:00Z"
       }
     ]
   }

2. Ver detalle de solicitud
   GET /applications/789

   Response:
   {
     "id": 789,
     "code": "BC-2025-A1B2C3D4",
     "status": "submitted",
     "person": {
       "document_number": "71234567",
       "full_name": "Juan Carlos Quispe Rodriguez",
       "email": "juan@gmail.com",
       "phone": "987654321"
     },
     "landing": { "name": "SENATI" },
     "products": [
       {
         "product_name": "HP 250 G9",
         "quantity": 1,
         "unit_price": 1979,
         "term_months": 12,
         "monthly_payment": 179.50
       }
     ],
     "total_amount": 2154.00,
     "initial_payment": 200,
     "tea": 42.5,
     "tcea": 49.1,
     "submitted_at": "2025-01-15T10:30:00Z"
   }

3. Aprobar solicitud
   PUT /applications/789
   {
     "status": "approved",
     "evaluation_notes": "Cliente cumple requisitos. Convenio SENATI vigente."
   }

   Response:
   {
     "id": 789,
     "status": "approved",
     "evaluated_by": 1,
     "evaluated_at": "2025-01-15T14:00:00Z"
   }

4. Marcar como desembolsado
   PUT /applications/789
   {
     "status": "disbursed",
     "disbursement_notes": "Producto entregado en sede principal"
   }
```

### Cliente consulta estado

```
GET /public/form/application/BC-2025-A1B2C3D4/status

Response:
{
  "code": "BC-2025-A1B2C3D4",
  "status": "approved",
  "submitted_at": "2025-01-15T10:30:00Z",
  "evaluated_at": "2025-01-15T14:00:00Z",
  "status_history": [
    { "from_status": "submitted", "to_status": "approved", "created_at": "2025-01-15T14:00:00Z" },
    { "from_status": "draft", "to_status": "submitted", "created_at": "2025-01-15T10:30:00Z" },
    { "from_status": null, "to_status": "draft", "created_at": "2025-01-15T10:25:00Z" }
  ]
}
```

---

## Diagrama de Estados de Solicitud

```
                                    ┌──────────────┐
                                    │   REJECTED   │
                                    └──────────────┘
                                           ▲
                                           │ (evaluacion negativa)
                                           │
┌────────┐      ┌───────────┐      ┌───────────────┐      ┌──────────┐      ┌────────────┐
│ DRAFT  │─────>│ SUBMITTED │─────>│  IN_REVIEW    │─────>│ APPROVED │─────>│ DISBURSED  │
└────────┘      └───────────┘      └───────────────┘      └──────────┘      └────────────┘
    │                                                            │
    │                                                            │
    v                                                            v
┌──────────┐                                              ┌────────────┐
│ ABANDONED│                                              │  CANCELLED │
└──────────┘                                              └────────────┘
```

---

## Metricas del Journey

### Conversion Funnel

```
Landing Views:     10,000  (100%)
     │
     v
Product Views:      5,000  (50%)
     │
     v
Simulations:        2,000  (20%)
     │
     v
Form Started:       1,000  (10%)
     │
     v
Form Completed:       400  (4%)
     │
     v
Approved:             300  (3%)
     │
     v
Disbursed:            280  (2.8%)
```

### Endpoints de Analytics (Admin)

```
GET /analytics/funnel?landing_id=1&date_from=2025-01-01&date_to=2025-01-31

Response:
{
  "landing": "SENATI",
  "period": "2025-01",
  "funnel": {
    "sessions": 10000,
    "product_views": 5000,
    "simulations": 2000,
    "leads_created": 1000,
    "applications_submitted": 400,
    "applications_approved": 300,
    "applications_disbursed": 280
  },
  "conversion_rates": {
    "view_to_lead": 10.0,
    "lead_to_application": 40.0,
    "application_to_approved": 75.0,
    "approved_to_disbursed": 93.3
  }
}
```

---

## Notificaciones al Cliente

### Durante el Journey

| Evento | Canal | Mensaje |
|--------|-------|---------|
| Solicitud creada | Email + SMS | "Tu solicitud BC-2025-... fue recibida" |
| En revision | Email | "Estamos evaluando tu solicitud" |
| Aprobada | Email + SMS + WhatsApp | "¡Felicidades! Tu credito fue aprobado" |
| Rechazada | Email | "Lo sentimos, no pudimos aprobar..." |
| Desembolsada | Email + SMS | "Tu producto esta listo para recoger" |

---

## Resumen de APIs por Fase

| Fase | APIs Principales | Total Calls |
|------|------------------|-------------|
| 1. Descubrimiento | `/public/landing/{slug}` | 2-3 |
| 2. Exploracion | `/public/landing/{slug}/products` | 5-10 |
| 3. Simulacion | `/public/simulate`, `/installments` | 3-5 |
| 4. Solicitud | `/public/form/*` | 8-12 |
| 5. Seguimiento | `/public/form/application/{code}/status` | 1-3 |

**Total estimado por conversion exitosa: 20-35 llamadas API**
