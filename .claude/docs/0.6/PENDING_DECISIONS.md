# Decisiones Pendientes - Landing v0.6

Preguntas que requieren confirmacion del equipo antes de implementar.

## Preguntas para el equipo

| # | Pregunta | Estado |
|---|----------|--------|
| 1 | Los testimonios deben poder mostrarse independiente aunque Social Proof este inactivo? | Pendiente |
| 2 | El carousel de instituciones debe ser dinamico por landing o siempre mostrar todas? | Pendiente |
| 3 | Los "Terminos y Condiciones" y "Politicas de Privacidad" deben ser dinamicos por landing o estaticos? | Pendiente |

Ver detalles de cada pregunta mas abajo.

---

## 1. Independencia de Testimonios vs Social Proof

**Fecha:** 2026-01-30

**Contexto:**
Actualmente en la tabla `landing_home_component`, los componentes `social_proof` y `testimonials` son registros separados. Sin embargo, en el frontend los testimonios se renderizan **dentro** del componente `SocialProof`.

**Comportamiento actual:**
| Componente en BD | Efecto en UI |
|------------------|--------------|
| `social_proof` = inactive | Oculta: Convenios + Marquee + Testimonios |
| `testimonials` = inactive | Oculta: Solo la seccion de Testimonios |

**Problema:**
Si se desactiva `social_proof` pero se mantiene `testimonials` activo, los testimonios **no se muestran** porque estan anidados dentro de SocialProof.

**Pregunta para el equipo:**
> Los testimonios deben poder mostrarse de forma independiente aunque Social Proof este inactivo?

**Opciones:**

### Opcion A: Mantener acoplados (actual)
- Testimonios siempre dependen de Social Proof
- Si Social Proof esta inactivo, testimonios no se muestran
- Mas simple de mantener

### Opcion B: Separar componentes
- Testimonios se renderizan independientemente de Social Proof
- Cada componente se controla por separado desde la BD
- Requiere refactorizacion del frontend

**Decision:** _Pendiente_

**Responsable de decidir:** _Por asignar_

---

## 2. Instituciones en Carousel - Dinamico o Global?

**Fecha:** 2026-01-30

**Contexto:**
El carousel de logos de instituciones (marquee en Social Proof) actualmente muestra **todas** las instituciones activas de la tabla `institution` (34 registros), sin importar que landing se este consultando.

**Codigo actual** (`app/api/routers/public/landing.py:104-107`):
```python
institutions = db.query(Institution).filter(
    Institution.is_active == True
).order_by(Institution.name).all()
```

**Problema:**
No hay relacion entre `landing` e `institution`. Todas las landings muestran las mismas 34 instituciones.

**Pregunta para el equipo:**
> El carousel de instituciones debe ser dinamico por landing o siempre mostrar todas?

**Opciones:**

### Opcion A: Tabla pivote `landing_institution`
- Permite asignar instituciones especificas a cada landing
- Ej: Landing "senati" → solo SENATI
- Ej: Landing "home" → todas las instituciones
- Requiere: crear tabla, seeder, UI en admin

### Opcion B: Usar `content_config.institutions` como override
- Si el componente `social_proof` tiene instituciones en `content_config` → usar esas
- Si no tiene → fallback a todas las de tabla `institution`
- No requiere nueva tabla, pero menos flexible

### Opcion C: Mantener comportamiento actual
- Todas las landings muestran las mismas 34 instituciones
- Mas simple, menos mantenimiento

**Decision:** _Pendiente_

**Responsable de decidir:** _Por asignar_

---

## 3. Terminos y Politicas - Dinamico o Estatico?

**Fecha:** 2026-02-03

**Contexto:**
Las paginas legales "Terminos y Condiciones" y "Politicas de Privacidad" actualmente son rutas estaticas (`/legal/terminos-y-condiciones`, `/legal/politica-privacidad`). El contenido es el mismo para todas las landings.

**Comportamiento actual:**
- Una sola pagina de terminos para todo el sitio
- Una sola pagina de politicas de privacidad para todo el sitio
- Los enlaces en el footer/CTA apuntan a estas paginas estaticas

**Problema potencial:**
Diferentes landings podrian requerir terminos o politicas distintas segun:
- El convenio/institucion asociada
- El tipo de producto (celulares vs laptops)
- Requisitos legales especificos por canal

**Pregunta para el equipo:**
> Los "Terminos y Condiciones" y "Politicas de Privacidad" deben ser dinamicos por landing o estaticos?

**Opciones:**

### Opcion A: Mantener estatico (actual)
- Una sola version de terminos y politicas para todo el sitio
- Mas simple de mantener
- Menos trabajo legal
- URLs: `/legal/terminos-y-condiciones`, `/legal/politica-privacidad`

### Opcion B: Dinamico por landing
- Cada landing puede tener sus propios terminos y politicas
- Requiere: campo en tabla `landing` o relacion con `legal_document`
- URLs: `/[landing]/legal/terminos`, `/[landing]/legal/privacidad`
- Mas complejo pero mas flexible

### Opcion C: Hibrido - Estatico con override opcional
- Por defecto usa los terminos/politicas globales
- Si la landing tiene documentos especificos configurados, usa esos
- Balance entre simplicidad y flexibilidad

**Decision:** _Pendiente_

**Responsable de decidir:** _Por asignar_

---
