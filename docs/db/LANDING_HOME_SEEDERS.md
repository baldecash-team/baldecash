# Landing Home (ID: 1) - Documentacion Completa de Seeders

**Version:** 1.0
**Fecha:** 2025-02-23
**Autor:** Claude Code

---

## 1. Resumen Ejecutivo

Este documento describe la configuracion completa del **Landing Home (ID: 1)** que replica exactamente el prototipo **v0.5** del frontend. Incluye:

- **Formulario**: 3 pasos con campos + resumen (sin campos)
- **Accesorios**: 6 productos del mock v0.5
- **Seguros**: 3 planes del mock v0.5

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LANDING HOME (ID: 1)                              │
│                              slug: "home"                                   │
│                            code: "LAND_HOME"                                │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────────┐
        │                           │                               │
        ▼                           ▼                               ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│    FORMULARIO     │     │    ACCESORIOS     │     │     SEGUROS       │
│   (LandingStep    │     │ (LandingAccessory)│     │ (LandingInsurance)│
│    LandingField)  │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
        │                           │                               │
        ▼                           ▼                               ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ 3 pasos activos   │     │ 6 productos       │     │ 3 planes          │
│ + resumen (sin    │     │ tipo ACCESORIO    │     │ tipo PROTECTION   │
│   campos)         │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

---

## 3. Formulario - Configuracion v0.5

### 3.1 Pasos Habilitados

| # | Codigo | Titulo | Descripcion | Campos |
|---|--------|--------|-------------|--------|
| 1 | `personal_data` | Datos Personales | Informacion basica para identificarte | 7 |
| 2 | `academic_data` | Datos Academicos | Informacion sobre tus estudios | 5 |
| 3 | `financial` | Datos Economicos | Informacion financiera para evaluar tu solicitud | 4 |
| 4 | `resumen` | Resumen | Revisa tu informacion antes de enviar | 0 |

**Total: 16 campos** (identico al v0.5)

### 3.2 Campos por Paso

#### PASO 1: Datos Personales (7 campos)

| # | Codigo Backend | Codigo 0.5 | Label | Tipo | Requerido |
|---|----------------|------------|-------|------|-----------|
| 1 | `first_name` | `nombres` | Nombres | TEXT | Si |
| 2 | `last_name` | `apellidos` | Apellidos | TEXT | Si |
| 3 | `document_type` | `tipoDocumento` | Tipo de Documento | RADIO | Si |
| 4 | `document_number` | `numeroDocumento` | Numero de Documento | DOCUMENT_NUMBER | Si |
| 5 | `birth_date` | `fechaNacimiento` | Fecha de Nacimiento | DATE | Si |
| 6 | `phone` | `celular` | Celular | PHONE | Si |
| 7 | `email` | `email` | Correo Electronico | EMAIL | Si |

**Opciones de `document_type`:**
- `dni` - DNI
- `ce` - CE
- `pasaporte` - Pasaporte

#### PASO 2: Datos Academicos (5 campos)

| # | Codigo Backend | Codigo 0.5 | Label | Tipo | Requerido |
|---|----------------|------------|-------|------|-----------|
| 1 | `institution_type` | `tipoInstitucion` | Tipo de Institucion | RADIO | Si |
| 2 | `institution` | `institucion` | Institucion Educativa | AUTOCOMPLETE | Si |
| 3 | `career` | `carrera` | Carrera o Especialidad | AUTOCOMPLETE | Si |
| 4 | `semester` | `ciclo` | Ciclo Actual | SELECT | Si |
| 5 | `enrollment_certificate` | `constanciaEstudios` | Constancia de Estudios | FILE | Si |

**Opciones de `institution_type`:**
- `universidad` - Universidad
- `instituto` - Instituto
- `colegio` - Colegio

**Opciones de `semester`:**
- `1` a `10` - Ciclos 1 al 10
- `egresado` - Egresado

#### PASO 3: Datos Economicos (4 campos)

| # | Codigo Backend | Codigo 0.5 | Label | Tipo | Requerido |
|---|----------------|------------|-------|------|-----------|
| 1 | `employment_status` | `situacionLaboral` | Situacion Laboral | RADIO | Si |
| 2 | `monthly_income` | `ingresoMensual` | Ingreso Mensual Aproximado | CURRENCY | Si |
| 3 | `has_guarantor` | `tieneAval` | Cuentas con un aval o codeudor? | RADIO | Si |
| 4 | `comments` | `comentarios` | Comentarios Adicionales | TEXTAREA | No |

**Opciones de `employment_status`:**
- `empleado` - Empleado
- `independiente` - Independiente
- `practicante` - Practicante
- `desempleado` - Sin empleo actual

**Opciones de `has_guarantor`:**
- `si` - Si
- `no` - No

#### PASO 4: Resumen (0 campos)

El paso resumen **no tiene campos**, solo muestra los datos ingresados para revision.

### 3.3 Campos EXCLUIDOS (existen en catalogo pero NO en landing home)

Estos campos existen en el catalogo maestro (`form_field`) pero **NO se muestran** en el landing home para replicar el v0.5:

| Campo | Paso | Razon |
|-------|------|-------|
| `gender` | personal_data | No existe en v0.5 |
| `other_institution` | academic_data | No existe en v0.5 |
| `other_career` | academic_data | No existe en v0.5 |
| `other_semester` | academic_data | No existe en v0.5 |
| `payment_day` | summary_preferences | No existe en v0.5 |
| `referral_source` | summary_preferences | No existe en v0.5 |

### 3.4 Mapeo de Codigos (Frontend 0.5 -> Backend)

```javascript
const FIELD_CODE_MAP = {
  // Datos Personales
  'nombres': 'first_name',
  'apellidos': 'last_name',
  'tipoDocumento': 'document_type',
  'numeroDocumento': 'document_number',
  'fechaNacimiento': 'birth_date',
  'celular': 'phone',
  'email': 'email',

  // Datos Academicos
  'tipoInstitucion': 'institution_type',
  'institucion': 'institution',
  'carrera': 'career',
  'ciclo': 'semester',
  'constanciaEstudios': 'enrollment_certificate',

  // Datos Economicos
  'situacionLaboral': 'employment_status',
  'ingresoMensual': 'monthly_income',
  'tieneAval': 'has_guarantor',
  'comentarios': 'comments',
};
```

---

## 4. Accesorios - Configuracion v0.5

### 4.1 Productos Asociados

| # | SKU | Nombre | Precio | Cuota/mes | Recomendado |
|---|-----|--------|--------|-----------|-------------|
| 1 | ACC-LOGITECH-M170 | Mouse inalambrico Logitech M170 | S/89 | S/4 | **Si** |
| 2 | ACC-FUNDA-156 | Funda protectora 15.6" | S/59 | S/3 | **Si** |
| 3 | ACC-AUDIFONOS-USB | Audifonos con microfono USB | S/79 | S/4 | No |
| 4 | ACC-HUB-USBC-7EN1 | Hub USB-C 7 en 1 | S/129 | S/6 | No |
| 5 | ACC-COOLER-BASE | Base enfriadora con ventiladores | S/69 | S/3 | No |
| 6 | ACC-SSD-500GB | SSD Externo 500GB USB 3.0 | S/189 | S/8 | No |

### 4.2 Modelo LandingAccessory

```python
class LandingAccessory(ActiveBaseModel):
    __tablename__ = "landing_accessory"

    landing_id = Column(Integer, ForeignKey("landing.id"))
    product_id = Column(Integer, ForeignKey("product.id"))
    is_visible = Column(Boolean, default=True)
    is_recommended = Column(Boolean, default=False)  # v4.9
    price_override = Column(DECIMAL(8, 2), nullable=True)
    display_order = Column(Integer, default=0)
```

### 4.3 Especificaciones por Accesorio

**Mouse Logitech M170:**
- Conexion: USB 2.4GHz inalambrico
- Bateria: 12 meses (1 pila AA)
- DPI: 1000
- Botones: 3 (izq, der, scroll)

**Funda protectora 15.6":**
- Tamano: Laptops hasta 15.6"
- Material: Nylon resistente al agua
- Interior: Forro de felpa suave
- Bolsillos: 2 externos + 1 interno

**Audifonos USB:**
- Conexion: USB-A plug & play
- Microfono: Omnidireccional con cancelacion
- Frecuencia: 20Hz - 20kHz
- Cable: 1.8m con control de volumen

**Hub USB-C 7 en 1:**
- Entrada: USB-C (Thunderbolt 3)
- HDMI: 4K @ 30Hz
- USB-A: 2x USB 3.0 (5Gbps)
- Tarjetas: SD + MicroSD

**Base enfriadora:**
- Ventiladores: 2x 140mm LED azul
- Ruido: < 21 dB
- Compatible: Laptops 12" - 17"
- Angulos: 5 posiciones ajustables

**SSD Externo 500GB:**
- Capacidad: 500GB
- Interfaz: USB 3.0
- Lectura: Hasta 400 MB/s
- Escritura: Hasta 380 MB/s

---

## 5. Seguros - Configuracion v0.5

### 5.1 Planes Asociados

| # | Codigo | Nombre | Precio/mes | Precio/ano | Recomendado |
|---|--------|--------|------------|------------|-------------|
| 1 | HOME-BASICO-12 | Proteccion Basica | S/15 | S/180 | No |
| 2 | HOME-TOTAL-12 | Proteccion Total | S/29 | S/348 | **Si** |
| 3 | HOME-PREMIUM-12 | Proteccion Premium | S/45 | S/540 | No |

### 5.2 Coberturas por Plan

#### Plan Basico (S/15/mes)

| Cobertura | Descripcion | Monto Maximo |
|-----------|-------------|--------------|
| Robo con violencia | Cobertura si te roban el equipo con amenaza o agresion | S/3,000 |

**Exclusiones:**
- Danos por liquidos
- Danos accidentales (caidas, golpes)
- Perdida o extravio
- Danos por mal uso

#### Plan Total (S/29/mes) - RECOMENDADO

| Cobertura | Descripcion | Monto Maximo |
|-----------|-------------|--------------|
| Robo | Cobertura completa por robo | S/4,000 |
| Danos accidentales | Caidas, golpes, pantalla rota | S/3,500 |
| Danos por liquidos | Derrames de agua, cafe, etc. | S/3,500 |

**Exclusiones:**
- Perdida o extravio
- Dano intencional
- Desgaste normal

#### Plan Premium (S/45/mes)

| Cobertura | Descripcion | Monto Maximo |
|-----------|-------------|--------------|
| Robo completo | Robo, danos accidentales, liquidos | S/5,000 |
| Danos accidentales | Caidas, golpes, pantalla rota | S/5,000 |
| Danos por liquidos | Derrames de agua, cafe, etc. | S/5,000 |
| Perdida | Extravio del equipo | S/4,000 |
| Extension de garantia | +12 meses de garantia del fabricante | - |

**Exclusiones:**
- Dano intencional
- Uso comercial no declarado

### 5.3 Modelo LandingInsurance

```python
class LandingInsurance(ActiveBaseModel):
    __tablename__ = "landing_insurance"

    landing_id = Column(Integer, ForeignKey("landing.id"))
    plan_id = Column(Integer, ForeignKey("insurance_plan.id"))
    is_visible = Column(Boolean, default=True)
    is_mandatory = Column(Boolean, default=False)
    price_override = Column(DECIMAL(8, 2), nullable=True)
    display_order = Column(Integer, default=0)
```

---

## 6. Seeders - Archivos y Orden de Ejecucion

### 6.1 Archivos Involucrados

| Archivo | Descripcion |
|---------|-------------|
| `form_builder/steps.py` | Catalogo maestro de pasos |
| `form_builder/fields.py` | Catalogo maestro de campos |
| `landing/landings.py` | Landing home (LAND_HOME) |
| `landing/landing_forms.py` | Pasos y campos habilitados para home |
| `landing/landing_accessories_home.py` | 6 accesorios del v0.5 |
| `landing/landing_insurances_home.py` | 3 planes de seguro del v0.5 |

### 6.2 Orden de Ejecucion

```bash
# 1. Crear catalogo maestro
docker-compose exec api python -m scripts.seeders.runner --module form_builder

# 2. Crear landing y configuracion
docker-compose exec api python -m scripts.seeders.runner --module landing

# 3. Crear seguros
docker-compose exec api python -m scripts.seeders.runner --module insurance
```

### 6.3 Comandos Utiles

```bash
# Ejecutar todos los seeders
docker-compose exec api python -m scripts.seeders.runner

# Reset completo (elimina y re-crea)
docker-compose exec api python -m scripts.seeders.runner --reset

# Listar seeders disponibles
docker-compose exec api python -m scripts.seeders.runner --list
```

---

## 7. API Endpoints

### 7.1 Obtener Configuracion del Wizard

```
GET /api/v1/public/landing/{slug}/wizard
```

**Ejemplo:**
```
GET /api/v1/public/landing/home/wizard
```

**Response:**
```json
{
  "steps": [
    {
      "code": "personal_data",
      "name": "Datos Personales",
      "description": "Informacion basica para identificarte",
      "display_order": 1,
      "is_required": true,
      "fields": [
        {
          "code": "first_name",
          "label": "Nombres",
          "field_type": "text",
          "is_required": true,
          "display_order": 1
        }
        // ... mas campos
      ]
    }
    // ... mas pasos
  ]
}
```

### 7.2 Obtener Accesorios

```
GET /api/v1/public/landing/{slug}/accessories
```

### 7.3 Obtener Seguros

```
GET /api/v1/public/landing/{slug}/insurances
```

---

## 8. Historial de Cambios

### v1.0 (2025-02-23)

**Cambios iniciales:**

1. **Modelo `LandingAccessory`** - Agregado campo `is_recommended`:
   - Archivo: `/app/db/models/landing.py`
   - Linea: 584

2. **Seeder `landing_accessories_home.py`** - Guardar `is_recommended`:
   - Archivo: `/scripts/seeders/landing/landing_accessories_home.py`
   - Linea: 327

3. **Seeder `landing_forms.py`** - Excluir campos no-v0.5:
   - Archivo: `/scripts/seeders/landing/landing_forms.py`
   - Campos excluidos: `gender`, `other_institution`, `other_career`, `other_semester`, `payment_day`, `referral_source`

4. **Seeder `fields.py`** - Agregado campo `has_guarantor`:
   - Archivo: `/scripts/seeders/form_builder/fields.py`
   - Linea: 389

5. **Nuevo seeder `landing_insurances_home.py`**:
   - Archivo: `/scripts/seeders/landing/landing_insurances_home.py`
   - 3 planes de seguro del mock v0.5

---

## 9. Migracion de Base de Datos

Para aplicar el nuevo campo `is_recommended` en `LandingAccessory`:

```bash
# Generar migracion
docker-compose exec api alembic revision --autogenerate -m "add_is_recommended_to_landing_accessory"

# Aplicar migracion
docker-compose exec api alembic upgrade head
```

---

## 10. Verificacion

Para verificar que todo esta configurado correctamente:

```bash
# 1. Verificar landing home existe
docker-compose exec api python -c "
from app.db.database import SessionLocal
from app.db.models.landing import Landing
db = SessionLocal()
home = db.query(Landing).filter(Landing.slug == 'home').first()
print(f'Landing Home: {home.name if home else \"NO EXISTE\"}')"

# 2. Verificar accesorios asociados
docker-compose exec api python -c "
from app.db.database import SessionLocal
from app.db.models.landing import Landing, LandingAccessory
db = SessionLocal()
home = db.query(Landing).filter(Landing.slug == 'home').first()
accs = db.query(LandingAccessory).filter(LandingAccessory.landing_id == home.id).all()
print(f'Accesorios: {len(accs)}')"

# 3. Verificar seguros asociados
docker-compose exec api python -c "
from app.db.database import SessionLocal
from app.db.models.landing import Landing, LandingInsurance
db = SessionLocal()
home = db.query(Landing).filter(Landing.slug == 'home').first()
ins = db.query(LandingInsurance).filter(LandingInsurance.landing_id == home.id).all()
print(f'Seguros: {len(ins)}')"
```

---

## 11. Contacto

Para dudas o modificaciones a esta documentacion, contactar al equipo de desarrollo de BaldeCash.
