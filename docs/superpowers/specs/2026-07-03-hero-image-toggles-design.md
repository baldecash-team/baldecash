# Hero de landing: toggles "sin overlay / imagen como CTA / sin contenido"

**Fecha:** 2026-07-03
**Autor:** Leonardo Medina (con Claude)
**Estado:** Aprobado (diseño) — pendiente plan de implementación

## Problema

Ciertas landings necesitan un hero que sea **solo una imagen**: sin la capa
oscura (overlay), sin textos/botón, y con la imagen entera actuando como CTA
(al hacer click lleva al destino del CTA). Hoy nada de esto es configurable:

- El overlay oscuro está **hardcodeado** en el render
  (`baldecash/src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx:135`,
  `bg-gradient-to-r from-black/85 via-black/65 to-black/20`), siempre presente.
- El CTA es **siempre un botón** (texto + url); la imagen es solo `background`,
  sin `onClick`/`href`.
- En el editor de admin2, título/subtítulo/CTA son **obligatorios**; si faltan,
  la landing se degrada automáticamente a `draft`.

## Requisitos

1. **3 toggles independientes** configurables desde el editor de landing (admin2):
   - `hide_overlay` — oculta el overlay oscuro.
   - `image_is_cta` — la imagen del hero se vuelve clickeable y dispara el
     mismo destino que el CTA actual de la landing (`hero_cta_url` / `onCtaClick`).
   - `hide_content` — oculta el bloque de contenido del hero (badge, headline,
     subheadline, precio "Desde S/…", botón CTA, trust signals) **y** el marquee
     "Marcas disponibles".
2. **Compatibilidad hacia atrás total (requisito duro):** ninguna landing
   existente debe cambiar de comportamiento. Los 3 flags nacen desactivados;
   su **ausencia = comportamiento actual**.
3. **Sin migración de BD y sin seeder de datos.**

## Decisión de almacenamiento

Los flags se guardan en el JSON `config` del componente hero
(`HomeComponent.config`, `ws2/app/db/models/landing.py:1048` → `Column(JSON, nullable=True)`),
el mismo lugar donde hoy viven `min_quota`, `badge_text`, `trust_signals`.

Consecuencia: **columna schemaless → no hay migración; las filas existentes no
tienen las claves → la API las devuelve ausentes → el render interpreta
ausente/undefined como el estado actual.** Cero cambios en datos. No se requiere
seeder.

Alternativa descartada: columnas nuevas en la tabla `Landing`
(ej. `banner_hide_overlay`) → requeriría migración Alembic. La ruta JSON la evita.

## Contrato de datos

En `content_config` del componente hero (snake_case, todos opcionales, default `false`):

```jsonc
{
  // ...campos actuales (min_quota, badge_text, trust_signals, ...)
  "hide_overlay": false,
  "image_is_cta": false,
  "hide_content": false
}
```

- Ausente ó `false` → comportamiento actual.
- `true` → aplica el efecto correspondiente.

## Cambios por repo

### 1. ws2 (backend / API) — probablemente sin cambios de lógica

`_build_hero_response()` ya reenvía **todo** el `config` del hero como
`content_config` salvo la clave `style`
(`ws2/app/api/routers/public/landing.py`, builder de `content_config`). Los 3
flags nuevos viajan automáticamente.

- **A verificar en implementación:** que el schema `LandingHeroResponse` /
  `ComponentItem` (`ws2/app/schemas/public.py:58-68,129-145`) no filtre claves
  desconocidas (Pydantic con `content_config: dict` libre → pasa). Si el schema
  tipa `content_config` como dict abierto, no requiere cambio. Solo se tipan los
  campos si se quiere documentarlos.
- **Sin migración, sin seeder.**

### 2. admin2 (editor de landing)

- **Tipos** (`admin2/src/types/landing.ts`, interface `HeroConfig` ~153-158):
  agregar `hide_overlay?: boolean`, `image_is_cta?: boolean`,
  `hide_content?: boolean`.
- **Editor** (`admin2/src/components/landings/sections/HeroSection.tsx`):
  nueva subsección "Estilo del hero" con 3 switches (lucide-react + NextUI,
  español latino). Se persisten vía `updateComponent` → `content_config`
  (JSON), **no** vía `PUT /landings/{id}/hero`.
- **Validaciones relajadas** (`HeroSection.tsx:350-364,454,472,657`):
  - Si `hide_content` está ON: título/subtítulo/CTA dejan de ser obligatorios
    y la landing **no** se degrada a `draft` por faltar esos campos.
  - Si `image_is_cta` está ON: `hero_cta_url` pasa a ser requerido/sugerido
    (la imagen necesita destino).
- **Sin cambios** en `landings.service.ts` `updateHeroConfig` (ese sigue
  mandando `banner_*`/`hero_*`); los flags van por el update de componente.

### 3. baldecash (render — `prototipos/0.6`)

- **Tipo** (`src/app/prototipos/0.6/types/hero.ts`, interface `HeroContent:87`):
  agregar `hideOverlay?: boolean`, `imageIsCta?: boolean`, `hideContent?: boolean`.
- **Mapeo** (`src/app/prototipos/0.6/services/landingApi.ts:611-655`): leer de
  `heroConfig` (que es `heroComponent.content_config`):
  ```ts
  hideOverlay: heroConfig.hide_overlay === true,
  imageIsCta:  heroConfig.image_is_cta === true,
  hideContent: heroConfig.hide_content === true,
  ```
- **Render** (`LeadHeroBanner.tsx`):
  - Overlay (`:135`): envolver en `{!heroContent?.hideOverlay && ( … )}`.
  - Imagen como CTA: si `imageIsCta`, envolver el bloque de imagen
    (`:104-132`) en un elemento clickeable (`role="button"`/`<a>`) que llame a
    `onCtaClick` (o navegue a `hero_cta_url`), reutilizando la lógica del botón
    actual (`:272-279`). Mantener accesibilidad (aria-label, teclado).
  - Ocultar contenido: si `hideContent`, no renderizar el bloque de texto
    (`:223-304`) ni los marquees de marcas (`:172-221`).
  - Los controles de carrusel (`:137-170`) se mantienen si hay >1 imagen,
    independientes de `hideContent`.

## Interacciones / casos borde

- `image_is_cta` + `hide_content`: caso principal ("solo imagen clickeable").
  El botón CTA no se renderiza (por `hide_content`), pero la imagen sí lleva al
  destino. Funciona porque el click de imagen usa `onCtaClick`/`hero_cta_url`,
  no el botón.
- `image_is_cta` sin `hero_cta_url`: la imagen no tendría destino. admin2 debe
  exigir/sugerir la url; en el render, si no hay destino, la imagen no se
  envuelve en clickeable (fallback seguro).
- `hide_overlay` con `hide_content=false`: textos blancos sobre imagen clara
  podrían quedar ilegibles. Es responsabilidad del editor; no lo bloqueamos
  (son toggles independientes por decisión de producto).
- Carrusel (>1 imagen) con `image_is_cta`: todas las imágenes llevan al mismo
  destino (el CTA de la landing), por la decisión "reusar el CTA de la landing".

## Testing

- **baldecash (render):** tests de `landingApi` (mapeo de los 3 flags desde
  `content_config`, incluyendo ausente→false) siguiendo el patrón de
  `services/__tests__/landingApi.*.test.ts`. Test de render de `LeadHeroBanner`
  para: overlay oculto, contenido oculto, imagen clickeable dispara `onCtaClick`.
- **admin2:** verificar persistencia de los switches y la relajación de
  validaciones (no degradar a draft con `hide_content`).
- **Regresión:** una landing sin los flags (config actual) renderiza idéntica
  (overlay ON, contenido visible, imagen no clickeable).

## Fuera de alcance (YAGNI)

- Overlay con opacidad/gradiente configurable (solo on/off).
- Link por imagen distinto al CTA de la landing.
- Un "modo/variante" único que agrupe los 3 (se eligió toggles independientes).
