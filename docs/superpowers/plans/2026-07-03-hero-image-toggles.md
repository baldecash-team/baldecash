# Hero image toggles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que ciertas landings tengan un hero "solo imagen" mediante 3 toggles independientes (sin overlay, imagen como CTA, sin contenido), configurables desde admin2 y respetados por el render, sin romper ninguna landing existente.

**Architecture:** Los 3 flags se guardan en el JSON `content_config` del componente hero (columna schemaless, sin migración). admin2 agrega switches que persisten esos flags; el render (`baldecash/prototipos/0.6`) los mapea a camelCase y ramifica; ws2 ya los reenvía tal cual (solo se agrega un test de regresión del contrato).

**Tech Stack:** baldecash = Next.js 14 + jest + @testing-library/react. admin2 = Next.js 16 + NextUI + vitest + @testing-library/react. ws2 = FastAPI + pytest.

## Global Constraints

- **Compatibilidad hacia atrás (duro):** ausencia de flag ó `false` = comportamiento actual. Ninguna landing existente cambia.
- **Sin migración de BD y sin seeder.** Los flags viven en `HomeComponent.config` (JSON).
- **Nombres:** storage/API + admin2 usan snake_case (`hide_overlay`, `image_is_cta`, `hide_content`); el render (baldecash) usa camelCase (`hideOverlay`, `imageIsCta`, `hideContent`).
- **UI admin2:** español latino con tildes, iconos lucide-react (NO emojis), componentes NextUI.
- Cada repo se commitea en su propia rama de feature. baldecash: `feat/hero-image-toggles` (ya creada, con el spec).

---

### Task 1: baldecash — mapear flags en `transformLandingData` + tipo `HeroContent`

**Files:**
- Modify: `src/app/prototipos/0.6/types/hero.ts` (interface `HeroContent`, ~línea 87-104)
- Modify: `src/app/prototipos/0.6/services/landingApi.ts` (objeto `heroContent` dentro de `transformLandingData`, ~línea 632-656)
- Test: `src/app/prototipos/0.6/services/__tests__/landingApi.heroFlags.test.ts` (nuevo)

**Interfaces:**
- Produces: `HeroContent.hideOverlay?: boolean`, `HeroContent.imageIsCta?: boolean`, `HeroContent.hideContent?: boolean` — consumidos por Task 2.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/services/__tests__/landingApi.heroFlags.test.ts`:

```ts
import { transformLandingData } from '../landingApi';
import type { LandingHeroResponse } from '../../types/hero';

function baseResponse(heroContentConfig: Record<string, unknown>): LandingHeroResponse {
  return {
    landing: {
      hero_title: 'Título',
      hero_subtitle: 'Sub',
      hero_cta_text: 'Ir',
      hero_cta_url: 'https://x.com',
      hero_cta_url_params: '',
      banner_images: [{ url: 'https://s3/desktop.webp' }],
    },
    components: [
      { component_code: 'hero', is_visible: true, content_config: heroContentConfig },
    ],
  } as unknown as LandingHeroResponse;
}

describe('transformLandingData — hero flags', () => {
  it('defaults a false cuando las claves están ausentes', () => {
    const { heroContent } = transformLandingData(baseResponse({}));
    expect(heroContent?.hideOverlay).toBe(false);
    expect(heroContent?.imageIsCta).toBe(false);
    expect(heroContent?.hideContent).toBe(false);
  });

  it('mapea hide_overlay/image_is_cta/hide_content = true a camelCase', () => {
    const { heroContent } = transformLandingData(
      baseResponse({ hide_overlay: true, image_is_cta: true, hide_content: true }),
    );
    expect(heroContent?.hideOverlay).toBe(true);
    expect(heroContent?.imageIsCta).toBe(true);
    expect(heroContent?.hideContent).toBe(true);
  });

  it('trata valores no-booleanos como false (solo true explícito activa)', () => {
    const { heroContent } = transformLandingData(baseResponse({ hide_overlay: 'yes' }));
    expect(heroContent?.hideOverlay).toBe(false);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /d/repos/baldecash && npx jest src/app/prototipos/0.6/services/__tests__/landingApi.heroFlags.test.ts`
Expected: FAIL — `hideOverlay` es `undefined` (propiedad no existe aún).

- [ ] **Step 3: Agregar los campos al tipo `HeroContent`**

En `src/app/prototipos/0.6/types/hero.ts`, dentro de `export interface HeroContent {` (después de `badgeText?: string;` ~línea 103), agregar:

```ts
  hideOverlay?: boolean;
  imageIsCta?: boolean;
  hideContent?: boolean;
```

- [ ] **Step 4: Mapear los flags en `transformLandingData`**

En `src/app/prototipos/0.6/services/landingApi.ts`, dentro del literal `heroContent = { … }`, justo después de `badgeText: (heroConfig.badge_text as string) || undefined,` (~línea 655), agregar:

```ts
      hideOverlay: heroConfig.hide_overlay === true,
      imageIsCta: heroConfig.image_is_cta === true,
      hideContent: heroConfig.hide_content === true,
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `cd /d/repos/baldecash && npx jest src/app/prototipos/0.6/services/__tests__/landingApi.heroFlags.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
cd /d/repos/baldecash
git add src/app/prototipos/0.6/types/hero.ts src/app/prototipos/0.6/services/landingApi.ts src/app/prototipos/0.6/services/__tests__/landingApi.heroFlags.test.ts
git commit -m "feat(hero): mapea flags hideOverlay/imageIsCta/hideContent desde content_config"
```

---

### Task 2: baldecash — render condicional en `LeadHeroBanner.tsx`

**Files:**
- Modify: `src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx` (overlay :135; bloque imagen :104-132; marquees :172-221; bloque contenido :223-304)
- Test: `src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx` (nuevo)

**Interfaces:**
- Consumes: `HeroContent.hideOverlay/imageIsCta/hideContent` (Task 1) y `onCtaClick?: () => void` (prop existente).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadHeroBanner } from '../LeadHeroBanner';
import type { HeroContent } from '../../../types/hero';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ brands: [] }) }),
  ) as unknown as typeof fetch;
});

const baseHero = (over: Partial<HeroContent> = {}): HeroContent => ({
  headline: 'Financia tu laptop',
  subheadline: 'Sub',
  primaryCta: { text: 'Solicitar', href: '#', variant: 'primary' },
  trustSignals: [],
  minQuota: 0,
  quotaSuffix: '/mes',
  ...over,
}) as HeroContent;

const imgs = [{ url: 'https://s3/desktop.webp' }];

describe('LeadHeroBanner — flags de hero', () => {
  it('por defecto muestra overlay y contenido', () => {
    render(<LeadHeroBanner heroContent={baseHero()} bannerImages={imgs} landing="x" />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu laptop')).toBeInTheDocument();
  });

  it('hideOverlay oculta el overlay', () => {
    render(<LeadHeroBanner heroContent={baseHero({ hideOverlay: true })} bannerImages={imgs} landing="x" />);
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
  });

  it('hideContent oculta el headline', () => {
    render(<LeadHeroBanner heroContent={baseHero({ hideContent: true })} bannerImages={imgs} landing="x" />);
    expect(screen.queryByText('Financia tu laptop')).not.toBeInTheDocument();
  });

  it('imageIsCta hace la imagen clickeable y dispara onCtaClick', () => {
    const onCtaClick = jest.fn();
    render(
      <LeadHeroBanner
        heroContent={baseHero({ imageIsCta: true, hideContent: true })}
        bannerImages={imgs}
        landing="x"
        onCtaClick={onCtaClick}
      />,
    );
    fireEvent.click(screen.getByTestId('hero-image-cta'));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /d/repos/baldecash && npx jest src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx`
Expected: FAIL — `hero-overlay` testid no existe y `hero-image-cta` no existe.

- [ ] **Step 3: Overlay condicional + testid**

En `LeadHeroBanner.tsx` reemplazar la línea 135:

```tsx
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent" />
```

por:

```tsx
      {!heroContent?.hideOverlay && (
        <div
          data-testid="hero-overlay"
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent"
        />
      )}
```

- [ ] **Step 4: Imagen como CTA (wrapper clickeable)**

En `LeadHeroBanner.tsx`, dentro del bloque de imagen de fondo, envolver el `<motion.div key={currentIndex} …>` (líneas 106-127) para que sea clickeable cuando `imageIsCta` esté activo y exista destino. Definir el handler y wrapper justo antes del `return` (después de `const imgSrc = …`, ~línea 95):

```tsx
  const ctaHref = heroContent?.primaryCta?.href;
  const imageIsCta = heroContent?.imageIsCta === true && (!!onCtaClick || (!!ctaHref && ctaHref !== '#'));
  const handleImageCta = () => {
    if (onCtaClick) { onCtaClick(); return; }
    if (ctaHref && ctaHref !== '#') { window.location.href = ctaHref; }
  };
```

Y modificar el `<motion.div>` de la imagen (línea 106) para agregar, **solo cuando `imageIsCta`**, los props de accesibilidad y click. Reemplazar la apertura del `motion.div` (líneas 106-113) por:

```tsx
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 ${imageIsCta ? 'cursor-pointer' : ''}`}
            {...(imageIsCta
              ? {
                  'data-testid': 'hero-image-cta',
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': heroContent?.primaryCta?.text || 'Ver más',
                  onClick: handleImageCta,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageCta(); }
                  },
                }
              : {})}
          >
```

Nota: cuando `imageIsCta` es false, no se agrega `data-testid` ni handlers (comportamiento actual intacto).

- [ ] **Step 5: Ocultar contenido y marquees con `hideContent`**

En `LeadHeroBanner.tsx`:
- Marquee desktop (línea 173): cambiar `{logos.length > 0 && (` por `{!heroContent?.hideContent && logos.length > 0 && (`.
- Marquee mobile (línea 193): cambiar `{logos.length > 0 && (` por `{!heroContent?.hideContent && logos.length > 0 && (`.
- Bloque de texto hero (línea 223, el `<div className={\`relative z-10 h-full flex items-center …\`}>`): envolverlo en `{!heroContent?.hideContent && ( … )}`. Es decir, cambiar la apertura de la línea 223 por:

```tsx
      {!heroContent?.hideContent && (
      <div className={`relative z-10 h-full flex items-center py-8 sm:py-12 overflow-hidden ${contained ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full' : 'px-6 lg:px-10'}`}>
```

y cerrar el `)}` extra tras el `</div>` de cierre de ese bloque (la línea 304 `</div>` que cierra el contenedor de texto): agregar `)}` inmediatamente después.

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `cd /d/repos/baldecash && npx jest src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Correr los tests del hero existentes (regresión)**

Run: `cd /d/repos/baldecash && npx jest src/app/prototipos/0.6/components/hero src/app/prototipos/0.6/services/__tests__/landingApi`
Expected: PASS (sin regresiones).

- [ ] **Step 8: Commit**

```bash
cd /d/repos/baldecash
git add src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx
git commit -m "feat(hero): render respeta hideOverlay/imageIsCta/hideContent en LeadHeroBanner"
```

---

### Task 3: admin2 — tipos + switches + validación relajada

**Files:**
- Modify: `admin2/src/types/landing.ts` (interface `HeroConfig`, ~línea 153-158)
- Modify: `admin2/src/components/landings/sections/HeroSection.tsx` (DEFAULT_HERO_CONFIG :27-30; init/sync config :98-106 y :174-181; helper de validación nuevo + uso en handleSaveSection :353-364; UI switches en el form)
- Test: `admin2/src/components/landings/sections/__tests__/heroValidation.test.ts` (nuevo, vitest)

**Interfaces:**
- Consumes: nada de tasks anteriores (repo distinto; comparte solo el contrato JSON snake_case).
- Produces: `getHeroMissingFields(landing, config)` — helper puro exportado, testeado aquí.

- [ ] **Step 1: Agregar flags a `HeroConfig`**

En `admin2/src/types/landing.ts`, en `export interface HeroConfig {` agregar tras `trust_signals: TrustSignal[];`:

```ts
  hide_overlay?: boolean;
  image_is_cta?: boolean;
  hide_content?: boolean;
```

- [ ] **Step 2: Extraer helper puro de validación + test que falla**

Crear `admin2/src/components/landings/sections/heroValidation.ts`:

```ts
import type { HeroConfig } from "@/types/landing";

export interface HeroValidationLanding {
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_cta_text?: string | null;
  hero_cta_url?: string | null;
}

/**
 * Devuelve los campos obligatorios faltantes del hero según los toggles.
 * - hide_content ON: título/subtítulo/CTA dejan de ser obligatorios.
 * - image_is_cta ON: el enlace del CTA (hero_cta_url) pasa a ser obligatorio.
 */
export function getHeroMissingFields(
  landing: HeroValidationLanding,
  config: Pick<HeroConfig, "hide_content" | "image_is_cta">,
): string[] {
  const missing: string[] = [];
  if (!config.hide_content) {
    if (!landing.hero_title?.trim()) missing.push("Título Principal");
    if (!landing.hero_subtitle?.trim()) missing.push("Subtítulo");
    if (!landing.hero_cta_text?.trim()) missing.push("Texto del CTA");
  }
  if (config.image_is_cta && !landing.hero_cta_url?.trim()) {
    missing.push("Enlace del CTA");
  }
  return missing;
}
```

Crear `admin2/src/components/landings/sections/__tests__/heroValidation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getHeroMissingFields } from "../heroValidation";

describe("getHeroMissingFields", () => {
  it("exige título/subtítulo/CTA en hero estándar", () => {
    expect(getHeroMissingFields({}, {})).toEqual([
      "Título Principal", "Subtítulo", "Texto del CTA",
    ]);
  });

  it("no exige textos cuando hide_content está ON", () => {
    expect(getHeroMissingFields({}, { hide_content: true })).toEqual([]);
  });

  it("exige el enlace del CTA cuando image_is_cta está ON", () => {
    expect(getHeroMissingFields({ hero_title: "T", hero_subtitle: "S", hero_cta_text: "Ir" }, { image_is_cta: true }))
      .toEqual(["Enlace del CTA"]);
  });

  it("hide_content + image_is_cta: solo exige enlace del CTA", () => {
    expect(getHeroMissingFields({}, { hide_content: true, image_is_cta: true }))
      .toEqual(["Enlace del CTA"]);
  });
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run: `cd /d/repos/admin2 && npx vitest run src/components/landings/sections/__tests__/heroValidation.test.ts`
Expected: FAIL — `heroValidation` no existe todavía (falla la primera vez si se corre antes de crear el archivo del Step 2; si ya existe, el test pasa). Si al crear el helper pasa directo, continuar.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /d/repos/admin2 && npx vitest run src/components/landings/sections/__tests__/heroValidation.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Usar el helper en `handleSaveSection` y default config**

En `HeroSection.tsx`:

a) Agregar el import al inicio (junto a los demás imports):
```ts
import { getHeroMissingFields } from "./heroValidation";
```

b) En `DEFAULT_HERO_CONFIG` (líneas 27-30, dentro del objeto) agregar:
```ts
  hide_overlay: false,
  image_is_cta: false,
  hide_content: false,
```

c) En la init de `config` (líneas 102-105) agregar dentro del objeto retornado:
```ts
      hide_overlay: (cc.hide_overlay ?? DEFAULT_HERO_CONFIG.hide_overlay) as boolean,
      image_is_cta: (cc.image_is_cta ?? DEFAULT_HERO_CONFIG.image_is_cta) as boolean,
      hide_content: (cc.hide_content ?? DEFAULT_HERO_CONFIG.hide_content) as boolean,
```

d) En el `useEffect` de re-sync (líneas 177-180) agregar las mismas 3 líneas dentro del `setConfig({ … })`.

e) Reemplazar las líneas 354-357 (cálculo manual de `missingFields`):
```ts
      const missingFields: string[] = [];
      if (!landing.hero_title?.trim()) missingFields.push("Título Principal");
      if (!landing.hero_subtitle?.trim()) missingFields.push("Subtítulo");
      if (!landing.hero_cta_text?.trim()) missingFields.push("Texto del CTA");
```
por:
```ts
      const missingFields = getHeroMissingFields(landing, config);
```

(El resto de `handleSaveSection` no cambia: `updateComponent(landingId, component.id, config, 'hero')` ya persiste los 3 flags dentro de `content_config`.)

- [ ] **Step 6: Agregar los 3 switches al formulario**

En `HeroSection.tsx`, agregar al inicio del archivo el import de `Switch` de NextUI si no está (verificar imports existentes; NextUI se importa como `@nextui-org/react` o `@heroui/react` según el repo — usar el mismo paquete que ya usan otros componentes del archivo). Insertar una subsección nueva dentro del form (por ejemplo, después del bloque del CTA / antes de trust signals, dentro del `<div className="flex-1 xl:w-3/5 p-6 space-y-6">`):

```tsx
        {/* Estilo del hero */}
        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Estilo del hero</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">Ocultar overlay oscuro</p>
              <p className="text-xs text-gray-500">Muestra la imagen sin la capa oscura encima.</p>
            </div>
            <Switch
              isSelected={config.hide_overlay ?? false}
              onValueChange={(v) => setConfig((prev) => ({ ...prev, hide_overlay: v }))}
              aria-label="Ocultar overlay oscuro"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">Imagen clickeable (CTA)</p>
              <p className="text-xs text-gray-500">La imagen del hero lleva al destino del CTA de la landing.</p>
            </div>
            <Switch
              isSelected={config.image_is_cta ?? false}
              onValueChange={(v) => setConfig((prev) => ({ ...prev, image_is_cta: v }))}
              aria-label="Imagen clickeable"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">Ocultar contenido</p>
              <p className="text-xs text-gray-500">Oculta textos, botón, trust signals y marcas. Solo imagen.</p>
            </div>
            <Switch
              isSelected={config.hide_content ?? false}
              onValueChange={(v) => setConfig((prev) => ({ ...prev, hide_content: v }))}
              aria-label="Ocultar contenido"
            />
          </div>
        </div>
```

- [ ] **Step 7: Verificar compilación/lint y tests del módulo landings**

Run: `cd /d/repos/admin2 && npx vitest run src/components/landings && npx tsc --noEmit`
Expected: PASS (tests) y sin errores de tipos en los archivos tocados.

- [ ] **Step 8: Commit**

```bash
cd /d/repos/admin2
git checkout -b feat/hero-image-toggles
git add src/types/landing.ts src/components/landings/sections/HeroSection.tsx src/components/landings/sections/heroValidation.ts src/components/landings/sections/__tests__/heroValidation.test.ts
git commit -m "feat(landings): toggles de hero (sin overlay / imagen CTA / sin contenido) en el editor"
```

---

### Task 4: ws2 — test de regresión del contrato content_config (sin cambio de producción)

**Files:**
- Test: `ws2/tests/api/routers/public/test_landing_hero_flags.py` (nuevo)
- (Sin cambios de producción: `content_config: Optional[dict]` y el builder `{k: v … if k != "style"}` en `app/api/routers/public/landing.py:843` ya reenvían claves arbitrarias.)

**Interfaces:**
- Consumes: el endpoint público que devuelve los componentes con `content_config` (el mismo que consume `transformLandingData` en baldecash).

- [ ] **Step 1: Escribir el test de regresión (patrón de `test_landing_hero_lead.py`)**

Abrir `ws2/tests/api/routers/public/test_landing_hero_lead.py` para copiar el patrón de fixtures (creación de landing + HomeComponent 'hero' con `config`, y llamada al endpoint público vía el `TestClient`). Crear `ws2/tests/api/routers/public/test_landing_hero_flags.py` con un test que:
  1. Crea una landing con un `HomeComponent` tipo hero cuyo `config` incluye `{"hide_overlay": True, "image_is_cta": True, "hide_content": True, "min_quota": 49}`.
  2. Llama al endpoint público que devuelve los componentes (el que usa el frontend).
  3. Asserta que el `content_config` del componente hero en la respuesta contiene `hide_overlay is True`, `image_is_cta is True`, `hide_content is True` (y que `style` sigue excluido).

Estructura (ajustar nombres de fixtures/helpers a los reales del archivo de referencia):

```python
def test_hero_flags_passthrough_en_content_config(client, db_session, make_landing_with_hero):
    # make_landing_with_hero: helper existente o inline según el patrón del repo
    landing = make_landing_with_hero(
        hero_config={
            "hide_overlay": True,
            "image_is_cta": True,
            "hide_content": True,
            "min_quota": 49,
            "style": {"bg": "#fff"},  # debe quedar EXCLUIDO del content_config
        },
    )
    resp = client.get(f"/api/v1/public/landing/{landing.slug}/layout")
    assert resp.status_code == 200
    hero = next(c for c in resp.json()["components"] if c["component_code"] == "hero")
    cc = hero["content_config"]
    assert cc["hide_overlay"] is True
    assert cc["image_is_cta"] is True
    assert cc["hide_content"] is True
    assert "style" not in cc
```

Nota: si el archivo de referencia usa otro endpoint (p. ej. `/hero` en vez de `/layout`) o fixtures con otros nombres, replicar exactamente ese estilo. El objetivo del test es fijar el contrato: los flags arbitrarios sobreviven el passthrough.

- [ ] **Step 2: Correr el test y verificar que pasa (verde de entrada = contrato ya cumplido)**

Run: `cd /d/repos/ws2 && python -m pytest tests/api/routers/public/test_landing_hero_flags.py -v`
Expected: PASS. Si FALLA porque el endpoint filtra las claves, entonces sí hay cambio de producción: ajustar el builder de `content_config` para no filtrar (solo excluir `style`) — pero según `landing.py:843` ya es así, por lo que debería pasar.

- [ ] **Step 3: Commit**

```bash
cd /d/repos/ws2
git checkout -b feat/hero-image-toggles
git add tests/api/routers/public/test_landing_hero_flags.py
git commit -m "test(landing): fija contrato de passthrough de flags de hero en content_config"
```

---

## Self-Review

**Spec coverage:**
- (a) sin overlay → Task 1 (map) + Task 2 (render) + Task 3 (switch). ✓
- (b) imagen como CTA → Task 1 + Task 2 (wrapper clickeable → onCtaClick/hero_cta_url) + Task 3 (switch + validación exige url). ✓
- (c) hero sin contenido → Task 1 + Task 2 (oculta texto + marquees) + Task 3 (switch + relaja validación). ✓
- Compatibilidad hacia atrás → defaults `false` en map (Task 1), render (Task 2), init config (Task 3); test de "ausente→false" (Task 1). ✓
- Sin migración/seeder → Task 4 fija el passthrough JSON; ningún task agrega columnas ni seeders. ✓

**Placeholder scan:** Task 4 depende de nombres de fixtures del archivo de referencia (se indica leerlo y replicar). Es la única parte no 100% literal por vivir en otro repo con fixtures propias; se acota con endpoint, asserts y patrón concretos. Resto: código literal.

**Type consistency:** snake_case (`hide_overlay`/`image_is_cta`/`hide_content`) en storage/admin2/ws2; camelCase (`hideOverlay`/`imageIsCta`/`hideContent`) en baldecash. `getHeroMissingFields` con la misma firma en helper y test. `transformLandingData` es el símbolo real exportado (`landingApi.ts:493`). ✓
