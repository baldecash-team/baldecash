# Migración de Elementos Hardcodeados a Base de Datos

## Landing Home v0.6

**Fecha:** 2026-02-18
**Estado:** En progreso

---

## Resumen de Progreso

| Estado | Cantidad |
|--------|----------|
| Completado | 9 |
| Pendiente (Mover a DB) | 0 |
| Descartado (Dejar hardcode) | 2 |
| Pendiente (Dejar hardcode) | 6 |
| **Total** | **17** |

---

## Elementos por Estado

### ✅ COMPLETADOS

| # | Elemento | Archivo | Línea | Notas |
|---|----------|---------|-------|-------|
| 1 | Badge "NUEVO" en navbar | `Navbar.tsx` | 195, 319 | Ahora usa `item.badge_text` y `item.badge_color` desde DB |
| 6 | Título CTA Section | `HeroSection.tsx` | 144 | Ahora usa `ctaData.sectionTitle` desde DB |
| 7 | Subtítulo CTA Section | `HeroSection.tsx` | 151 | Ahora usa `ctaData.sectionSubtitle` desde DB |
| 4 | "Desde" / "/mes" | `HeroBanner.tsx` | 88, 90 | Ya implementado |
| 14 | Default minQuota (49) | `landingApi.ts` | 301 | Fallback eliminado |
| 15 | Default CTA text/href | `landingApi.ts` | 304-305 | Fallbacks eliminados |
| 8 | Quiz Config | `HeroSection.tsx` | 84-90 | Ahora usa valores del API (`layoutVersion`, `mobileLayoutVersion`) |
| 3 | Imagen Fallback Hero | `HeroBanner.tsx` | 16 | Fallback eliminado, imagen viene de DB |
| 12 | WhatsApp URL Fallback | `HeroCta.tsx` | 23 | Fallback eliminado, URL viene de DB |

---

### 🔴 PENDIENTE - MOVER A DB

*No hay elementos pendientes*

#### #6 - Título CTA Section [COMPLETED]
- **Archivo:** `components/hero/HeroSection.tsx`
- **Línea:** 144
- **Valor actual:** `"¿Listo para tu nuevo"`
- **Campo DB sugerido:** `cta.section_title` o `cta.title_template`
- **Backend:** `home_components.py` → componente CTA → `content_config`
- **Prioridad:** Alta

#### #7 - Subtítulo CTA Section [COMPLETED]
- **Archivo:** `components/hero/HeroSection.tsx`
- **Línea:** 151
- **Valor actual:** `"Solicita tu laptop en minutos. 100% digital."`
- **Campo DB sugerido:** `cta.section_subtitle`
- **Backend:** `home_components.py` → componente CTA → `content_config`
- **Prioridad:** Alta

#### #4 - Textos "Desde" / "/mes"
- **Archivo:** `components/hero/HeroBanner.tsx`
- **Líneas:** 88, 90
- **Valor actual:** `"Desde"` y `"/mes"`
- **Campo DB sugerido:** `hero.price_prefix`, `hero.price_suffix`
- **Backend:** `home_components.py` → componente HERO → `content_config`
- **Prioridad:** Alta (importante para i18n)

#### #8 - Quiz Config
- **Archivo:** `components/hero/HeroSection.tsx`
- **Líneas:** 85-89
- **Valores actuales:**
  ```tsx
  layoutVersion: isMobile ? 4 : 5
  questionCount: 7
  questionStyle: 1
  resultsVersion: 1
  focusVersion: 1
  ```
- **Campo DB sugerido:** `landing.quiz_config` o `cta.quiz_config`
- **Backend:** Nuevo campo en landing o en CTA component
- **Prioridad:** Media (útil para A/B testing)

#### #3 - Imagen Fallback Hero [COMPLETED]
- **Archivo:** `components/hero/HeroBanner.tsx`
- **Línea:** 16
- **Valor anterior:** `"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"`
- **Acción:** Fallback eliminado. La imagen ya venía de DB (`bannerImages[0].url`), se removió el fallback para detectar errores.

#### #12 - Fallback WhatsApp URL [COMPLETED]
- **Archivo:** `components/hero/HeroCta.tsx`
- **Línea:** 23
- **Valor anterior:** `"https://wa.link/osgxjf"`
- **Acción:** Fallback eliminado. El URL ya viene de DB (`data?.buttons.whatsapp.url`).

#### #13 - Mensajes Newsletter [DESCARTADO]
- **Archivo:** `components/hero/Footer.tsx`
- **Líneas:** 107, 112, 256
- **Decisión:** Mantener hardcodeado. El usuario decidió que no es importante gestionarlo desde la base de datos.

#### #14 y #15 - Defaults en landingApi.ts
- **Archivo:** `services/landingApi.ts`
- **Líneas:** 299, 302-303
- **Valores actuales:**
  - `minQuota: 49`
  - `text: 'Solicitar ahora'`
  - `href: '#solicitar'`
- **Acción:** Verificar que siempre vengan del backend, eliminar fallbacks innecesarios
- **Prioridad:** Alta

---

### 🟢 DEJAR HARDCODE - OK

| # | Elemento | Archivo | Línea | Razón |
|---|----------|---------|-------|-------|
| 2 | "Zona Estudiantes" | `Navbar.tsx` | 262, 397 | Texto de marca, rara vez cambia |
| 5 | Alt text "Estudiantes trabajando" | `HeroBanner.tsx` | 48 | SEO básico, puede ser genérico |
| 9 | Fallback "PASO" | `HowItWorks.tsx` | 110 | Ya viene de DB con `stepLabel`, solo es fallback |
| 10 | Default category icons FAQ | `FaqSection.tsx` | 29-36 | Ya viene de DB, solo son fallbacks |
| 11 | Default category colors FAQ | `FaqSection.tsx` | 39-46 | Ya viene de DB, solo son fallbacks |
| 16 | Testimonios por página (2) | `SocialProof.tsx` | 62 | Decisión de UI, no contenido |

---

## Plan de Implementación

### Orden Recomendado

1. **#6 y #7** - CTA section title/subtitle (mismo componente, alto impacto)
2. **#4** - "Desde" / "/mes" (importante para i18n)
3. **#14 y #15** - Verificar que minQuota y CTA siempre vengan de DB
4. **#8** - Quiz config (útil para A/B testing)
5. **#13** - Mensajes newsletter
6. **#3** - Imagen fallback hero
7. **#12** - Verificar WhatsApp URL

### Archivos a Modificar por Tarea

#### Tarea #6 y #7 (CTA titles)
**Backend:**
- `webservice2/scripts/seeders/landing/home_components.py` - Agregar campos al CTA

**Frontend:**
- `webpage3.0/src/app/prototipos/0.6/types/hero.ts` - Agregar tipos
- `webpage3.0/src/app/prototipos/0.6/services/landingApi.ts` - Mapear campos
- `webpage3.0/src/app/prototipos/0.6/components/hero/HeroSection.tsx` - Usar campos

#### Tarea #4 (Desde/mes)
**Backend:**
- `webservice2/scripts/seeders/landing/home_components.py` - Agregar a HERO

**Frontend:**
- `webpage3.0/src/app/prototipos/0.6/types/hero.ts` - Agregar tipos
- `webpage3.0/src/app/prototipos/0.6/services/landingApi.ts` - Mapear campos
- `webpage3.0/src/app/prototipos/0.6/components/hero/HeroBanner.tsx` - Usar campos

#### Tarea #8 (Quiz config)
**Backend:**
- `webservice2/scripts/seeders/landing/home_components.py` - Agregar quiz_config al CTA

**Frontend:**
- `webpage3.0/src/app/prototipos/0.6/types/hero.ts` - Agregar tipos
- `webpage3.0/src/app/prototipos/0.6/services/landingApi.ts` - Mapear campos
- `webpage3.0/src/app/prototipos/0.6/components/hero/HeroSection.tsx` - Usar campos

#### Tarea #13 (Newsletter messages)
**Backend:**
- `webservice2/scripts/seeders/landing/home_components.py` - Agregar messages al newsletter

**Frontend:**
- `webpage3.0/src/app/prototipos/0.6/types/hero.ts` - Agregar tipos
- `webpage3.0/src/app/prototipos/0.6/services/landingApi.ts` - Mapear campos
- `webpage3.0/src/app/prototipos/0.6/components/hero/Footer.tsx` - Usar campos

---

## Comandos Útiles

### Ejecutar seeder después de modificar
```bash
cd /Users/emiliogonzales/Documents/software/working/projects/baldecash/webservice2
docker-compose exec api python -m scripts.seeders.runner --module landing
```

### Actualizar dato específico en DB (ejemplo navbar)
```bash
docker-compose exec api python -c "
from app.db.database import SessionLocal
from app.db.models.landing import LandingHomeComponent, HomeComponentType
from sqlalchemy.orm.attributes import flag_modified

db = SessionLocal()
component = db.query(LandingHomeComponent).filter(
    LandingHomeComponent.component_type == HomeComponentType.NAVBAR
).first()

if component:
    config = component.content_config
    # Modificar config aquí
    component.content_config = config
    flag_modified(component, 'content_config')
    db.commit()
    print('OK')
db.close()
"
```

### Verificar datos del API
```bash
curl -s http://localhost:8001/api/v1/public/landing/home/hero | python3 -m json.tool
```

---

## Notas

- Los colores de marca (`#4654CD`, `#03DBD0`, `#25D366`) se mantienen hardcodeados - son parte del design system
- Los mapas de iconos (lucide-react) se mantienen hardcodeados - son código, no datos
- Los fallbacks para datos opcionales son aceptables, pero los datos principales deben venir siempre de DB
