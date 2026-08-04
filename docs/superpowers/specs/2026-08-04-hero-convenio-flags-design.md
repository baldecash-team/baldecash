# Hero de convenio: respetar los switches de overlay, imagen-CTA y ocultar contenido

**Fecha:** 2026-08-04
**Ticket:** BAL-2782
**Repos:** baldecash (frontend). ws2 y admin2 no requieren cambios.

## Problema

Para la landing 139 (Convenio UPN) se pide poder apagar el texto del banner y la
capa de sombra negra, y dejar solo la imagen con un link al destino del CTA.

La configuración ya existe en el admin, pero no tiene efecto en esa landing.

## Estado actual

### Los switches ya están construidos

`admin2/src/components/landings/sections/HeroSection.tsx` expone tres toggles:

| Switch | Campo en `config` | Qué hace |
|---|---|---|
| Ocultar overlay oscuro | `hide_overlay` | quita la capa de sombra |
| Imagen clickeable (CTA) | `image_is_cta` | la imagen lleva al destino del CTA |
| Ocultar contenido | `hide_content` | oculta textos, botón, trust signals y marcas |

Los tres juntos producen exactamente lo pedido.

### El dato llega al componente

`src/app/prototipos/0.6/services/landingApi.ts:658-660`:

```ts
hideOverlay: heroConfig.hide_overlay === true,
imageIsCta:  heroConfig.image_is_cta === true,
hideContent: heroConfig.hide_content === true,
```

Los tres están declarados en `HeroContent` (`types/hero.ts:104-106`).

### Solo un hero los respeta

| Componente | Respeta los flags | Lo usan |
|---|---|---|
| `components/lead/LeadHeroBanner.tsx` | **sí**, con tests | landings tipo lead |
| `components/hero/convenio/ConvenioHero.tsx` | **no** | landings de convenio (139 incluida) |
| `components/hero/HeroBanner.tsx` | **no** | landings normales (layout no-convenio) |

Hay entonces **tres** heroes, y dos no respetan los flags. `HeroBanner` queda
fuera del alcance de este ticket por una razón concreta: a diferencia de
`ConvenioHero`, no recibe el objeto `heroContent` sino props sueltas
(`HeroSection.tsx:299-305`), así que los flags ni siquiera le llegan. Habilitarlo
exige cambiar su interfaz y tocar el layout de las landings normales — 31 de las
61 activas —, que no es lo que este ticket pidió.

Las piezas compartidas que se extraen acá dejan ese trabajo listo para cuando se
decida hacerlo: será pasar los flags y consumir los dos componentes.

`ConvenioHero.tsx:121` pinta el gradiente de forma incondicional:

```tsx
<div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/20 sm:to-transparent" />
```

y no lee `hideOverlay`, `imageIsCta` ni `hideContent` en ninguna línea. El
componente recibe `heroContent` completo — el dato está ahí, sin usar.

### Datos de producción

- Los flags viven en `home_component.config` (JSON) del componente con
  `component_code = 'hero'`.
- La landing 139 tiene su fila de hero (id 49) con los tres flags en `NULL`.
- **60 landings activas tienen hero y ninguna usa estos flags.** La
  funcionalidad nunca se activó, así que no hay configuraciones vivas que
  puedan romperse.

## Solución

Dos partes: hacer que `ConvenioHero` respete los flags, y extraer la lógica
compartida para que un hero futuro no tenga que reimplementarla.

### Piezas compartidas

Se crean en `src/app/prototipos/0.6/components/hero/common/`, junto a
`UnderlinedText.tsx` que ya vive ahí.

**`HeroOverlay.tsx`** — el gradiente condicional:

```tsx
interface HeroOverlayProps {
  hidden?: boolean;
  variant?: 'default' | 'soft';
}
```

Renderiza `null` cuando `hidden` es true. Conserva el `data-testid="hero-overlay"`
que ya usan los tests de `LeadHeroBanner`.

**`HeroImageCta.tsx`** — el wrapper clickeable:

```tsx
interface HeroImageCtaProps {
  enabled: boolean;
  href?: string;
  label?: string;
  onActivate?: () => void;
  className?: string;
  children: React.ReactNode;
}
```

Cuando `enabled` es false renderiza los children en un `div` simple. Cuando es
true agrega `role="button"`, `tabIndex={0}`, `aria-label`, `cursor-pointer`,
`onClick` y manejo de Enter/Espacio, más `data-testid="hero-image-cta"`.

Ese manejo de teclado y accesibilidad ya está resuelto en `LeadHeroBanner.tsx:118-130`;
se mueve tal cual, no se reinventa.

### La diferencia de gradiente

Los dos heroes usan gradientes casi iguales pero no idénticos:

| Componente | Gradiente |
|---|---|
| `LeadHeroBanner` | `from-black/85 via-black/65 to-black/20 sm:to-transparent` |
| `ConvenioHero` | `from-black/85 via-black/70 to-black/20 sm:to-transparent` |

**Decisión:** `HeroOverlay` acepta un prop `variant`. `'default'` reproduce el
gradiente de convenio (`via-black/70`) y `'soft'` el de lead (`via-black/65`).
Cada hero pasa el que ya usaba.

No se unifica el valor: un cambio visual en dos heroes en producción no es parte
de lo que este ticket pidió, y la diferencia es deliberada o histórica pero no
nuestra para resolver acá.

### Cambios en `ConvenioHero`

1. **Overlay** — reemplazar la línea 121 por `<HeroOverlay hidden={heroContent.hideOverlay} />`.

2. **Imagen clickeable** — envolver el `<Image>` en `<HeroImageCta>`, usando el
   `ctaUrl` ya calculado en la línea 63 y reusando `handleCtaClick` (línea 83),
   que ya distingue links externos de internos y dispara el tracking.

3. **Ocultar contenido** — envolver el bloque de contenido (badge, headline,
   subheadline, precio, trust signals y botón, líneas 123-179) en
   `{!heroContent.hideContent && ( ... )}`.

Con `hideContent` activo el contenedor exterior se mantiene: la altura del hero
la define el `style` de la línea 97, no el contenido, así que la imagen conserva
su tamaño.

### Migración de `LeadHeroBanner`

Se reemplazan su overlay y su wrapper por las piezas compartidas, pasando
`variant="soft"`. Sin cambio visual ni de comportamiento — sus tests existentes
son la red que lo verifica.

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `components/hero/common/HeroOverlay.tsx` | crear |
| `components/hero/common/HeroImageCta.tsx` | crear |
| `components/hero/convenio/ConvenioHero.tsx` | consumir ambas piezas + `hideContent` |
| `components/lead/LeadHeroBanner.tsx` | migrar a las piezas compartidas |
| `components/hero/convenio/__tests__/ConvenioHero.test.tsx` | crear |

Sin cambios en ws2 ni admin2. Sin migración.

## Testing

### Unitarios de `ConvenioHero`

| Caso | Espera |
|---|---|
| sin flags | overlay presente, contenido presente, imagen no clickeable |
| `hideOverlay: true` | sin `data-testid="hero-overlay"` |
| `hideContent: true` | sin headline, sin subheadline, sin botón de CTA |
| `imageIsCta: true` | existe `data-testid="hero-image-cta"`, click navega |
| `imageIsCta: true` + Enter/Espacio | dispara la navegación |
| `imageIsCta: true` sin href válido | **no** hace la imagen clickeable |
| los tres flags juntos | solo imagen clickeable, sin overlay ni texto |

El primer caso es el de no-regresión: cubre las 60 landings que hoy tienen el
hero sin configurar.

### Regresión de `LeadHeroBanner`

Sus tests existentes (`components/lead/__tests__/LeadHeroBanner.test.tsx`) deben
seguir pasando sin modificarse. Si hay que tocarlos, el refactor cambió
comportamiento y eso es un error.

```bash
npx vitest run src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx
npx vitest run src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx
```

### Verificación visual

Sobre la landing 139 en local, con Playwright:

1. Estado actual (flags en NULL) → hero idéntico a hoy
2. `hide_overlay` → sin sombra, texto sobre la imagen cruda
3. Los tres flags → solo imagen, clickeable, sin texto
4. Click en la imagen → navega al destino del CTA

## Fuera de alcance

- Unificar el gradiente entre ambos heroes (queda parametrizado)
- Agregar switches nuevos al admin: los tres existentes alcanzan
- **`HeroBanner.tsx`** — el hero de las landings normales. No recibe
  `heroContent` sino props sueltas, así que habilitarlo exige cambiar su
  interfaz y afecta a 31 landings activas. Las piezas compartidas de este ticket
  lo dejan preparado para un ticket propio.
- Configurar landings distintas de la 139
