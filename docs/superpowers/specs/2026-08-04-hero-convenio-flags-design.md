# Portada: switch para mostrar el banner como imagen sola con link

**Fecha:** 2026-08-04
**Ticket:** BAL-2782
**Repos:** admin2 (UI) y baldecash (frontend). ws2 no requiere cambios.

## Pedido

En el editor de landing, pestaña **Portada**, un switch que gobierne el formato
del banner:

- **ON (por defecto):** el hero como hoy — título, subtítulo, CTA y overlay
  oscuro sobre la imagen.
- **OFF:** esos campos desaparecen del formulario y queda un campo de link. En la
  web se muestra **solo la imagen**, clickeable, apuntando a ese link (externo o
  una sección).

Al apagar el switch **no se pierde la información ya cargada**: los textos siguen
guardados y vuelven a aparecer si se prende de nuevo. Solo se guarda el flag.

Aplica a landings de tipo **institucional** y **convenio**.

## Estado actual

### Ya existe un bloque parecido, escondido

`admin2/src/components/landings/sections/HeroSection.tsx:651-721` tiene una
sección **"Estilo del hero"** con tres toggles sueltos:

| Toggle | Campo |
|---|---|
| Ocultar overlay oscuro | `hide_overlay` |
| Imagen clickeable (CTA) | `image_is_cta` |
| Ocultar contenido | `hide_content` |

Está envuelta en `{isLeadLanding && ...}` (`landing_type === 'lead'`), con este
comentario:

> *"solo aplica a landings tipo lead, ya que en el sitio público únicamente
> LeadHeroBanner respeta hide_overlay/image_is_cta/hide_content. Los demás tipos
> de landing usan otro hero que ignora estos flags."*

Es decir: el bloque se escondió porque los otros heroes no lo respetan.

### Nadie lo está usando

Verificado en producción (`ip-10-1-4-18` / `baldecash`):

| Tipo | Landings activas con hero | Usan algún flag |
|---|---|---|
| convenio | 29 | 0 |
| institucional | 22 | 0 |
| lead | 7 | **0** |
| **total** | **60** | **0** |

Ni siquiera las 7 landings lead —las únicas donde el bloque es visible— tienen
alguno de los tres flags configurado. Se puede rediseñar sin romper ninguna
configuración existente.

### Los dos tipos pedidos usan heroes distintos

El hero se elige por presencia de convenio (`isConvenio = !!agreementData`,
`HeroSection.tsx:209`), no por `landing_type`:

| Tipo | Activas | `agreement_id` | Hero |
|---|---|---|---|
| convenio | 29 | todas | `components/hero/convenio/ConvenioHero.tsx` |
| institucional | 23 | 22 sin convenio | `components/hero/HeroBanner.tsx` |

**Los dos heroes ignoran los flags.** Para cubrir ambos tipos hay que arreglar
los dos, no uno.

`LeadHeroBanner.tsx` sí los respeta y tiene tests: es la referencia de cómo debe
comportarse.

### El dato ya viaja al frontend

`baldecash/src/app/prototipos/0.6/services/landingApi.ts:658-660` mapea los tres
flags a `heroContent`, y están declarados en `HeroContent`
(`types/hero.ts:104-106`). `ConvenioHero` recibe ese objeto y no lo usa;
`HeroBanner` ni siquiera lo recibe (toma props sueltas, `HeroSection.tsx:299-305`).

## Solución

### El campo nuevo

Un flag propio en la config del hero:

```
show_hero_content: boolean   // ausente o true = comportamiento actual
```

Se guarda en `home_component.config` (JSON) del componente con
`component_code = 'hero'`, junto a los campos que ya viven ahí. **Sin migración.**

Se elige un campo nuevo en lugar de reusar los tres existentes por dos razones:
el estado del switch queda en un solo valor en vez de inferirse de tres, y los
tres sueltos siguen disponibles para landings lead sin que ambas formas de
configurar lo mismo se pisen.

**Ausente = `true`.** Las 60 landings actuales no tienen el campo y deben seguir
viéndose igual.

### El link de la imagen

Se reusa **`hero_cta_url`**, el campo "URL del CTA" que ya existe y ya trae el
selector de link externo o sección. No se agrega campo nuevo y el dato no se
duplica: con el switch en OFF ese mismo valor es el destino de la imagen.

### La UI en admin2

Se reutiliza la sección **"Estilo del hero"** de la pestaña Portada, con tres
cambios:

1. **Cambia su condición de visibilidad.** De `{isLeadLanding && ...}` a
   mostrarse también en `institutional` y `convenio`.

2. **Contenido según el tipo de landing:**

   - **institucional y convenio** → un switch: *"Mostrar textos sobre la imagen"*.
     Encendido por defecto. Al apagarlo, un texto explica que solo se mostrará la
     imagen y que el destino es el de la URL del CTA.
   - **lead** → los tres toggles actuales, sin cambios.

3. **Campos condicionales.** Con el switch en OFF, en la sección de contenido del
   hero se ocultan Título, Subtítulo, Badge, Cuota y Texto del CTA. **URL del
   CTA queda visible**, porque pasa a ser el link de la imagen — con su etiqueta
   cambiada a *"Link de la imagen"* para que se entienda.

Los valores ocultos **no se borran ni se envían vacíos**: siguen en la BD tal
como estaban.

### El frontend

Los dos heroes deben respetar el flag. Para no duplicar la lógica —que es
justamente el problema que llevó a esconder el bloque— se extraen dos piezas
compartidas a `components/hero/common/`, donde ya vive `UnderlinedText.tsx`:

**`HeroOverlay.tsx`** — el gradiente condicional. Renderiza `null` cuando está
oculto. Conserva `data-testid="hero-overlay"`, que los tests de `LeadHeroBanner`
ya usan.

**`HeroImageCta.tsx`** — el wrapper clickeable: `role="button"`, `tabIndex`,
`aria-label`, manejo de Enter/Espacio y `data-testid="hero-image-cta"`. Esa
lógica ya está resuelta en `LeadHeroBanner.tsx:118-130` y se mueve tal cual.

Luego:

| Componente | Cambio |
|---|---|
| `ConvenioHero.tsx` | consume ambas piezas + guard de contenido |
| `HeroBanner.tsx` | recibir `heroContent` (hoy toma props sueltas) + lo mismo |
| `LeadHeroBanner.tsx` | migrar a las piezas compartidas, sin cambio visual |

`landingApi.ts` agrega el mapeo del campo nuevo:

```ts
showHeroContent: heroConfig.show_hero_content !== false,
```

Nótese el `!== false`: ausente o `true` dan `true`.

### La diferencia de gradiente

Los heroes usan gradientes casi iguales pero distintos:

| Componente | Gradiente |
|---|---|
| `LeadHeroBanner` y `HeroBanner` | `via-black/65` |
| `ConvenioHero` | `via-black/70` |

`HeroOverlay` acepta `variant`: `'default'` (`/70`) y `'soft'` (`/65`). Cada hero
pasa el que ya usaba. **No se unifican:** cambiar el aspecto de heroes vivos no
es parte de lo pedido.

## Alcance en producción

| Área | Cambio |
|---|---|
| ws2 | **ninguno** |
| admin2 | switch en "Estilo del hero" + campos condicionales |
| baldecash | 2 piezas compartidas + 3 heroes + 1 línea en `landingApi` |
| Migración | ninguna (campo JSON) |
| Landings habilitadas | **51** (29 convenio + 22 institucional sin convenio) |

Ninguna landing cambia de aspecto hasta que alguien apague el switch.

## Testing

### Unitarios en baldecash (jest)

Este repo usa **jest** (`jest.config.js`), no vitest.

`HeroOverlay` y `HeroImageCta` con sus casos propios (oculto/visible, variantes,
click, teclado, accesibilidad).

Para cada hero — `ConvenioHero`, `HeroBanner`, `LeadHeroBanner`:

| Caso | Espera |
|---|---|
| sin el campo (ausente) | overlay y contenido presentes, imagen no clickeable |
| `showHeroContent: true` | igual que el anterior |
| `showHeroContent: false` | sin overlay, sin textos, imagen clickeable |
| `false` + click en la imagen | navega al destino del CTA |
| `false` + Enter | navega |
| `false` sin URL válida | la imagen **no** queda clickeable |

El primer caso es el de no-regresión: cubre las 60 landings actuales.

Los tests existentes de `LeadHeroBanner` deben pasar **sin modificarse**. Si hay
que tocarlos, el refactor cambió comportamiento.

```bash
npx jest src/app/prototipos/0.6/components/hero src/app/prototipos/0.6/components/lead
```

### Unitarios en admin2 (vitest)

admin2 usa **vitest**, no jest.

| Caso | Espera |
|---|---|
| landing convenio | se ve el switch nuevo |
| landing institucional | se ve el switch nuevo |
| landing lead | se ven los tres toggles de siempre |
| switch OFF | Título, Subtítulo y Texto del CTA ocultos |
| switch OFF | URL del CTA visible, etiquetada como link de la imagen |
| apagar y prender | los textos vuelven con su valor original |

El último es el que prueba lo que pediste: que no se pierda la información.

### Verificación visual

Sobre la landing 139 (`upn`, convenio) y una institucional, en local:

1. Estado actual → hero idéntico a hoy
2. Switch OFF → solo imagen, sin sombra ni texto
3. Click en la imagen → navega al destino del CTA
4. Prender de nuevo → los textos vuelven intactos

## Fuera de alcance

- Landings de tipo `campaign`, `preapproved`, `partner`, `internal` y `especial`
- Unificar los gradientes entre heroes (quedan parametrizados)
- Cambiar los tres toggles sueltos de las landings lead
- Configurar landings concretas: eso lo hace negocio desde el admin
