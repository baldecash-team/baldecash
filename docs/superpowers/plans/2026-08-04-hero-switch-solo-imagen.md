# Portada: switch "solo imagen con link" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un switch en la pestaña Portada que, al apagarse, oculta los textos del banner y deja solo la imagen clickeable con el link del CTA. Para landings institucional y convenio.

**Architecture:** Un campo nuevo `show_hero_content` en la config JSON del hero (ausente = true, comportamiento actual). admin2 reutiliza el bloque "Estilo del hero" que hoy está oculto tras `isLeadLanding`. En el frontend se extraen dos piezas compartidas (`HeroOverlay`, `HeroImageCta`) que los tres heroes consumen, en vez de que cada uno reimplemente la lógica.

**Tech Stack:** admin2 (Next.js 14 + Tailwind, **vitest**), baldecash (Next.js 14 + Tailwind, **jest**). Sin cambios en ws2.

**Ticket:** BAL-2782
**Spec:** `baldecash/docs/superpowers/specs/2026-08-04-hero-convenio-flags-design.md`

## Global Constraints

- **Dos repos, dos runners.** admin2 usa **vitest** (`npx vitest run <ruta>`); baldecash usa **jest** (`npx jest <ruta>`). Confundirlos hace fallar todo por razones equivocadas.
- **`show_hero_content` ausente significa `true`.** Las 60 landings activas no tienen el campo y deben verse exactamente igual que hoy. En código: `!== false`, nunca `=== true`.
- **No se borra información.** Al apagar el switch, los textos siguen guardados en la BD. Solo dejan de mostrarse.
- **No se toca ws2.** El backend ya persiste `home_component.config` como JSON libre.
- **Sin migraciones.**
- **No unificar gradientes.** `ConvenioHero` usa `via-black/70`; `HeroBanner` y `LeadHeroBanner` usan `via-black/65`. Se parametrizan, no se igualan.
- **Los tres toggles sueltos de landings lead no se tocan.** Siguen como están.
- UI y textos en español; nombres de código en inglés.
- Ramas: `feature/bal-2782-hero-convenio-flags` en baldecash (ya creada desde `origin/main`); en admin2 hay que crear una equivalente.

## File Structure

**baldecash (frontend):**

| Archivo | Responsabilidad |
|---|---|
| `components/hero/common/HeroOverlay.tsx` | Gradiente oscuro condicional, con dos intensidades |
| `components/hero/common/HeroImageCta.tsx` | Wrapper clickeable con teclado y ARIA |
| `components/hero/convenio/ConvenioHero.tsx` | Hero de convenio: consume ambas piezas |
| `components/hero/HeroBanner.tsx` | Hero de institucional: idem + recibir el flag |
| `components/lead/LeadHeroBanner.tsx` | Migra su lógica inline a las piezas compartidas |
| `services/landingApi.ts` | Mapea `show_hero_content` → `showHeroContent` |
| `types/hero.ts` | Declara `showHeroContent` en `HeroContent` |

**admin2:**

| Archivo | Responsabilidad |
|---|---|
| `types/landing.ts` | Declara `show_hero_content` en `HeroConfig` |
| `components/landings/sections/heroValidation.ts` | La validación entiende el switch |
| `components/landings/sections/HeroSection.tsx` | El switch + campos condicionales |

---

### Task 1: HeroOverlay (baldecash)

El gradiente condicional aislado. No depende de nada, es el mejor punto de partida.

**Files:**
- Create: `src/app/prototipos/0.6/components/hero/common/HeroOverlay.tsx`
- Test: `src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx`

**Interfaces:**
- Consumes: nada
- Produces: `HeroOverlay({ hidden?: boolean; variant?: 'default' | 'soft' })`. Renderiza `null` si `hidden`; si no, un `div` absoluto con `data-testid="hero-overlay"`. `'default'` → `via-black/70`, `'soft'` → `via-black/65`.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroOverlay } from '../HeroOverlay';

describe('HeroOverlay', () => {
  it('por defecto renderiza el overlay', () => {
    render(<HeroOverlay />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
  });

  it('hidden=true no renderiza nada', () => {
    render(<HeroOverlay hidden />);
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
  });

  it('hidden=false renderiza el overlay', () => {
    render(<HeroOverlay hidden={false} />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
  });

  it('variant default usa el gradiente de convenio (via-black/70)', () => {
    render(<HeroOverlay />);
    expect(screen.getByTestId('hero-overlay').className).toContain('via-black/70');
  });

  it('variant soft usa el gradiente de lead/institucional (via-black/65)', () => {
    render(<HeroOverlay variant="soft" />);
    expect(screen.getByTestId('hero-overlay').className).toContain('via-black/65');
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
cd baldecash && npx jest src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx
```

Esperado: falla, `../HeroOverlay` no existe.

- [ ] **Step 3: Implementar**

Crear `src/app/prototipos/0.6/components/hero/common/HeroOverlay.tsx`:

```tsx
import React from 'react';

interface HeroOverlayProps {
  /** Si es true no se renderiza nada. */
  hidden?: boolean;
  /**
   * Intensidad del gradiente. Los heroes venian con valores distintos y se
   * conservan para no cambiar el aspecto de ninguno:
   *   default -> ConvenioHero (via-black/70)
   *   soft    -> HeroBanner y LeadHeroBanner (via-black/65)
   */
  variant?: 'default' | 'soft';
}

const GRADIENTS: Record<'default' | 'soft', string> = {
  default: 'bg-gradient-to-r from-black/85 via-black/70 to-black/20 sm:to-transparent',
  soft: 'bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent',
};

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ hidden, variant = 'default' }) => {
  if (hidden) return null;
  return <div data-testid="hero-overlay" className={`absolute inset-0 ${GRADIENTS[variant]}`} />;
};

export default HeroOverlay;
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

```bash
npx jest src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx
```

Esperado: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/components/hero/common/
git commit -m "feat(BAL-2782): HeroOverlay, gradiente condicional compartido"
```

---

### Task 2: HeroImageCta (baldecash)

El wrapper clickeable. La lógica de teclado y ARIA se toma de `LeadHeroBanner.tsx:118-130`, que ya la resolvió — no se reinventa.

**Files:**
- Create: `src/app/prototipos/0.6/components/hero/common/HeroImageCta.tsx`
- Test: `src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx`

**Interfaces:**
- Consumes: nada
- Produces: `HeroImageCta({ enabled, href?, label?, onActivate?, className?, children })`. Con `enabled=false` renderiza un `div` simple con `className`. Con `true` agrega `data-testid="hero-image-cta"`, `role="button"`, `tabIndex={0}`, `aria-label`, `cursor-pointer`, `onClick` y Enter/Espacio.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroImageCta } from '../HeroImageCta';

describe('HeroImageCta', () => {
  it('enabled=false renderiza los children sin rol de boton', () => {
    render(<HeroImageCta enabled={false}><span>contenido</span></HeroImageCta>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('enabled=true expone rol de boton y dispara onActivate al click', () => {
    const onActivate = jest.fn();
    render(
      <HeroImageCta enabled onActivate={onActivate} label="Ver equipos">
        <span>contenido</span>
      </HeroImageCta>,
    );
    const el = screen.getByTestId('hero-image-cta');
    expect(el).toHaveAttribute('role', 'button');
    expect(el).toHaveAttribute('aria-label', 'Ver equipos');
    fireEvent.click(el);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('responde a Enter y Espacio', () => {
    const onActivate = jest.fn();
    render(<HeroImageCta enabled onActivate={onActivate}><span>c</span></HeroImageCta>);
    const el = screen.getByTestId('hero-image-cta');
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.keyDown(el, { key: ' ' });
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('ignora otras teclas', () => {
    const onActivate = jest.fn();
    render(<HeroImageCta enabled onActivate={onActivate}><span>c</span></HeroImageCta>);
    fireEvent.keyDown(screen.getByTestId('hero-image-cta'), { key: 'a' });
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('conserva el className recibido y agrega cursor-pointer', () => {
    render(<HeroImageCta enabled className="absolute inset-0"><span>c</span></HeroImageCta>);
    const cls = screen.getByTestId('hero-image-cta').className;
    expect(cls).toContain('absolute inset-0');
    expect(cls).toContain('cursor-pointer');
  });

  it('sin onActivate ni href no rompe al activarse', () => {
    render(<HeroImageCta enabled><span>c</span></HeroImageCta>);
    expect(() => fireEvent.click(screen.getByTestId('hero-image-cta'))).not.toThrow();
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
npx jest src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx
```

- [ ] **Step 3: Implementar**

Crear `src/app/prototipos/0.6/components/hero/common/HeroImageCta.tsx`:

```tsx
'use client';

import React from 'react';

interface HeroImageCtaProps {
  /** Cuando es false no se altera nada: los children se renderizan tal cual. */
  enabled: boolean;
  /** Destino cuando no se pasa onActivate. */
  href?: string;
  /** Texto para lectores de pantalla. */
  label?: string;
  /** Handler propio del hero — permite trackear antes de navegar. */
  onActivate?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const HeroImageCta: React.FC<HeroImageCtaProps> = ({
  enabled,
  href,
  label,
  onActivate,
  className = '',
  children,
}) => {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const activate = () => {
    if (onActivate) {
      onActivate();
      return;
    }
    if (href && href !== '#') {
      window.location.href = href;
    }
  };

  return (
    <div
      data-testid="hero-image-cta"
      role="button"
      tabIndex={0}
      aria-label={label || 'Ver más'}
      className={`${className} cursor-pointer`.trim()}
      onClick={activate}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
    >
      {children}
    </div>
  );
};

export default HeroImageCta;
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

```bash
npx jest src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx
```

Esperado: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/components/hero/common/
git commit -m "feat(BAL-2782): HeroImageCta, wrapper clickeable compartido"
```

---

### Task 3: El campo llega al frontend (baldecash)

Sin esto los heroes no tienen qué leer. Es una línea de mapeo más el tipo.

**Files:**
- Modify: `src/app/prototipos/0.6/types/hero.ts`
- Modify: `src/app/prototipos/0.6/services/landingApi.ts`

**Interfaces:**
- Consumes: nada
- Produces: `HeroContent.showHeroContent?: boolean`, poblado desde `heroConfig.show_hero_content`. **Ausente o `true` → `true`.**

- [ ] **Step 1: Declarar el campo en el tipo**

En `src/app/prototipos/0.6/types/hero.ts`, junto a los flags existentes (líneas 104-106):

```ts
  hideOverlay?: boolean;
  imageIsCta?: boolean;
  hideContent?: boolean;
  /**
   * Switch "Mostrar textos sobre la imagen" del admin (BAL-2782).
   * Ausente o true = banner completo. false = solo imagen clickeable.
   * Aplica a landings institucional y convenio.
   */
  showHeroContent?: boolean;
```

- [ ] **Step 2: Mapear el campo**

En `src/app/prototipos/0.6/services/landingApi.ts`, junto a las líneas 658-660:

```ts
      hideOverlay: heroConfig.hide_overlay === true,
      imageIsCta: heroConfig.image_is_cta === true,
      hideContent: heroConfig.hide_content === true,
      // `!== false` a proposito: la ausencia del campo significa "mostrar",
      // que es como estan hoy las 60 landings activas.
      showHeroContent: heroConfig.show_hero_content !== false,
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add src/app/prototipos/0.6/types/hero.ts src/app/prototipos/0.6/services/landingApi.ts
git commit -m "feat(BAL-2782): mapear show_hero_content a heroContent"
```

---

### Task 4: ConvenioHero respeta el switch (baldecash)

El hero de las 29 landings de convenio, incluida la 139 que originó el pedido.

**Files:**
- Modify: `src/app/prototipos/0.6/components/hero/convenio/ConvenioHero.tsx`
- Test: `src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx` (crear)

**Interfaces:**
- Consumes: `HeroOverlay`, `HeroImageCta` (Tasks 1-2), `showHeroContent` (Task 3)
- Produces: nada nuevo — conserva su firma

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx`.

`ConvenioHero` usa `window.matchMedia` (línea 43) y `useRouter`, así que ambos se mockean — mismo patrón que el test de `LeadHeroBanner`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConvenioHero } from '../ConvenioHero';
import type { HeroContent, AgreementData } from '../../../../types/hero';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: (...args: unknown[]) => push(...args) }),
}));

const baseHero = (over: Partial<HeroContent> = {}): HeroContent => ({
  headline: 'Financia tu equipo ideal',
  subheadline: 'Sin historial crediticio',
  badgeText: 'Convenio UPN',
  primaryCta: { text: 'Ver equipos disponibles', href: 'catalogo', variant: 'primary' },
  trustSignals: [],
  minQuota: 0,
  quotaSuffix: '/mes',
  backgroundImage: 'https://s3/hero.webp',
  ...over,
}) as HeroContent;

const agreement = { id: 1 } as AgreementData;

const renderHero = (over: Partial<HeroContent> = {}) =>
  render(<ConvenioHero heroContent={baseHero(over)} agreementData={agreement} landing="upn" />);

beforeEach(() => push.mockClear());

describe('ConvenioHero — switch de contenido', () => {
  it('sin el campo: overlay, textos y sin imagen clickeable (no-regresion)', () => {
    renderHero();
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
    expect(screen.getByText('Ver equipos disponibles')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('showHeroContent=true se comporta igual que sin el campo', () => {
    renderHero({ showHeroContent: true });
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
  });

  it('showHeroContent=false: sin overlay, sin textos, imagen clickeable', () => {
    renderHero({ showHeroContent: false });
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.queryByText('Financia tu equipo ideal')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin historial crediticio')).not.toBeInTheDocument();
    expect(screen.queryByText('Convenio UPN')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver equipos disponibles')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-image-cta')).toBeInTheDocument();
  });

  it('con el switch apagado, click en la imagen navega al destino del CTA', () => {
    renderHero({ showHeroContent: false });
    fireEvent.click(screen.getByTestId('hero-image-cta'));
    expect(push).toHaveBeenCalledWith('/prototipos/0.6/upn/catalogo');
  });

  it('con el switch apagado responde a Enter', () => {
    renderHero({ showHeroContent: false });
    fireEvent.keyDown(screen.getByTestId('hero-image-cta'), { key: 'Enter' });
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('sin imagen de fondo no hay wrapper clickeable', () => {
    renderHero({ showHeroContent: false, backgroundImage: undefined });
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('los flags sueltos siguen funcionando de forma independiente', () => {
    renderHero({ hideOverlay: true });
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
npx jest src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx
```

Esperado: pasan los dos primeros (comportamiento actual) y fallan los demás.

- [ ] **Step 3: Importar las piezas y derivar el modo**

En `ConvenioHero.tsx`, después del import de `colorContrast` (línea 19):

```tsx
import { HeroOverlay } from '../common/HeroOverlay';
import { HeroImageCta } from '../common/HeroImageCta';
```

Y después de `const ctaUrl = ...` (línea 63):

```tsx
  // Modo "solo imagen" (BAL-2782): el switch del admin apaga textos y overlay,
  // y la imagen toma el destino del CTA. Los flags sueltos siguen valiendo por
  // separado para quien los use.
  const soloImagen = heroContent.showHeroContent === false;
  const mostrarContenido = !soloImagen && !heroContent.hideContent;
  const ocultarOverlay = soloImagen || heroContent.hideOverlay === true;
  const imagenClickeable =
    (soloImagen || heroContent.imageIsCta === true) && !!ctaUrl && ctaUrl !== '#';
```

- [ ] **Step 4: Envolver la imagen**

Reemplazar el bloque de las líneas 101-118 por:

```tsx
      {/* Background image - next/image with priority for LCP optimization */}
      {heroContent.backgroundImage && (
        <HeroImageCta
          enabled={imagenClickeable}
          label={heroContent.primaryCta?.text}
          onActivate={handleCtaClick}
          className="absolute inset-0"
        >
          <Image
            src={heroContent.backgroundImage}
            alt="Campus universitario"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: `${posX}% ${posY}%`,
              transform: zoomVal !== 1 ? `scale(${zoomVal})` : undefined,
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = '0';
            }}
          />
        </HeroImageCta>
      )}
```

`onActivate={handleCtaClick}` reusa el handler existente (línea 83): dispara el tracking y distingue links externos de internos.

- [ ] **Step 5: Reemplazar el overlay**

Reemplazar la línea 121:

```tsx
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/20 sm:to-transparent" />
```

por:

```tsx
      <HeroOverlay hidden={ocultarOverlay} />
```

- [ ] **Step 6: Envolver el contenido**

El bloque de contenido va de la línea 123 (`<div className="relative z-10 ...">`) a la 179 (su `</div>` de cierre). Envolverlo sin tocar su interior:

```tsx
      {mostrarContenido && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-8 sm:py-12">
          {/* ...badge, headline, subheadline, precio, beneficios y CTA sin cambios... */}
        </div>
      )}
```

La altura del hero la fija el `style` del contenedor raíz (línea 97), así que ocultar el contenido no la cambia.

- [ ] **Step 7: Correr los tests**

```bash
npx jest src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx
npx tsc --noEmit
```

Esperado: 7 passed, 0 errores de TS.

- [ ] **Step 8: Commit**

```bash
git add src/app/prototipos/0.6/components/hero/convenio/
git commit -m "feat(BAL-2782): ConvenioHero respeta el switch de contenido"
```

---

### Task 5: HeroBanner respeta el switch (baldecash)

El hero de las 22 landings institucionales. A diferencia de `ConvenioHero`, **no recibe `heroContent`**: toma props sueltas, así que primero hay que hacerle llegar el dato.

**Files:**
- Modify: `src/app/prototipos/0.6/components/hero/HeroBanner.tsx`
- Modify: `src/app/prototipos/0.6/components/hero/HeroSection.tsx` (pasar las props nuevas)
- Test: `src/app/prototipos/0.6/components/hero/__tests__/HeroBanner.test.tsx` (ya existe: agregar casos)

**Interfaces:**
- Consumes: `HeroOverlay`, `HeroImageCta` (Tasks 1-2)
- Produces: `HeroBannerProps` acepta `showHeroContent?`, `hideOverlay?` e `imageIsCta?`. **No hace falta `ctaHref`:** el componente ya recibe `primaryCta` (`types/hero.ts:132`), que trae el destino.

- [ ] **Step 1: Declarar las props nuevas en el tipo**

En `src/app/prototipos/0.6/types/hero.ts`, dentro de `HeroBannerProps` (línea 119), junto a `landing`:

```ts
  /** Landing slug for dynamic URL building */
  landing?: string;
  /**
   * BAL-2782: false = solo imagen clickeable, sin textos ni overlay.
   * Ausente o true = comportamiento actual.
   */
  showHeroContent?: boolean;
  hideOverlay?: boolean;
  imageIsCta?: boolean;
```

- [ ] **Step 2: Escribir los tests que fallan**

Agregar al final de `src/app/prototipos/0.6/components/hero/__tests__/HeroBanner.test.tsx`. Ese archivo ya mockea `next/image`, `EventTrackerContext` y `matchMedia` al inicio, así que los casos nuevos los heredan:

```tsx
describe('HeroBanner — switch de contenido (BAL-2782)', () => {
  const baseProps = {
    headline: 'Financia tu laptop',
    subheadline: 'En cuotas comodas',
    minQuota: 0,
    imageSrc: 'https://s3/hero.webp',
    primaryCta: { text: 'Ver equipos', href: 'catalogo', variant: 'primary' as const },
    landing: 'mi-landing',
  };

  it('sin el campo: overlay y textos visibles (no-regresion)', () => {
    render(<HeroBanner {...baseProps} />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu laptop')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('showHeroContent=true se comporta igual que sin el campo', () => {
    render(<HeroBanner {...baseProps} showHeroContent />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu laptop')).toBeInTheDocument();
  });

  it('showHeroContent=false: sin overlay, sin textos, imagen clickeable', () => {
    render(<HeroBanner {...baseProps} showHeroContent={false} />);
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.queryByText('Financia tu laptop')).not.toBeInTheDocument();
    expect(screen.queryByText('En cuotas comodas')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-image-cta')).toBeInTheDocument();
  });

  it('showHeroContent=false sin primaryCta no hace la imagen clickeable', () => {
    render(<HeroBanner {...baseProps} primaryCta={undefined} showHeroContent={false} />);
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('hideOverlay funciona de forma independiente al switch', () => {
    render(<HeroBanner {...baseProps} hideOverlay />);
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Financia tu laptop')).toBeInTheDocument();
  });
});
```

Correr y ver que fallan los que dependen de las props nuevas:

```bash
npx jest src/app/prototipos/0.6/components/hero/__tests__/HeroBanner.test.tsx
```

- [ ] **Step 3: Derivar el modo en el componente**

En `HeroBanner.tsx`, agregar las props a la desestructuración (después de `landing = 'home'`, línea 35):

```tsx
  showHeroContent,
  hideOverlay,
  imageIsCta,
```

Y derivar el modo después de los hooks, igual que en `ConvenioHero`. El destino
sale de `primaryCta`, que el componente ya recibe:

```tsx
  // BAL-2782: el switch del admin apaga textos y overlay, y la imagen toma el
  // destino del CTA. Los flags sueltos siguen valiendo por separado.
  const ctaHref = primaryCta?.href;
  const soloImagen = showHeroContent === false;
  const mostrarContenido = !soloImagen;
  const ocultarOverlay = soloImagen || hideOverlay === true;
  const imagenClickeable =
    (soloImagen || imageIsCta === true) && !!ctaHref && ctaHref !== '#';
```

- [ ] **Step 4: Aplicar las piezas compartidas**

Importar `HeroOverlay` y `HeroImageCta` desde `./common/`. Reemplazar el overlay
(era la línea 195) por `<HeroOverlay hidden={ocultarOverlay} variant="soft" />`.

**`variant="soft"` es obligatorio:** este hero usa `via-black/65` y sin el prop
cambiaría a `/70`, alterando su aspecto en 22 landings vivas.

Envolver la imagen de fondo en `<HeroImageCta enabled={imagenClickeable} ...>`,
pasando como `onActivate` el mismo handler que ya usa el botón del CTA — así se
conserva el tracking y el manejo de links externos. El bloque de contenido va
dentro de `{mostrarContenido && ( ... )}`.

- [ ] **Step 5: Pasar las props desde HeroSection**

En `HeroSection.tsx:299`, agregar a la invocación de `<HeroBanner ...>`:

```tsx
                  showHeroContent={heroContent.showHeroContent}
                  hideOverlay={heroContent.hideOverlay}
                  imageIsCta={heroContent.imageIsCta}
```

`primaryCta` ya se le pasa, así que el destino del link no necesita prop nueva.

- [ ] **Step 6: Correr los tests**

```bash
npx jest src/app/prototipos/0.6/components/hero/__tests__/HeroBanner.test.tsx
npx tsc --noEmit
```

Esperado: los tests preexistentes de ese archivo siguen verdes, más los nuevos.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/components/hero/HeroBanner.tsx src/app/prototipos/0.6/components/hero/HeroSection.tsx src/app/prototipos/0.6/components/hero/__tests__/HeroBanner.test.tsx
git commit -m "feat(BAL-2782): HeroBanner respeta el switch de contenido"
```

---

### Task 6: Migrar LeadHeroBanner (baldecash)

Sin esto quedan tres implementaciones de lo mismo, que es el problema que este ticket viene a cerrar.

**Files:**
- Modify: `src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx`

**Interfaces:**
- Consumes: `HeroOverlay`, `HeroImageCta`
- Produces: nada nuevo

- [ ] **Step 1: Confirmar el verde de partida**

```bash
npx jest src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx
```

Anotar cuántos tests pasan. Ese número debe repetirse al final.

- [ ] **Step 2: Importar las piezas**

```tsx
import { HeroOverlay } from '../hero/common/HeroOverlay';
import { HeroImageCta } from '../hero/common/HeroImageCta';
```

- [ ] **Step 3: Reemplazar el overlay**

Las líneas 152-158:

```tsx
      {!heroContent?.hideOverlay && (
        <div
          data-testid="hero-overlay"
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent"
        />
      )}
```

por:

```tsx
      {/* variant soft conserva el via-black/65 original de este hero */}
      <HeroOverlay hidden={heroContent?.hideOverlay} variant="soft" />
```

- [ ] **Step 4: Reemplazar el wrapper clickeable**

El `motion.div` (líneas 112-130) mezcla la animación de AnimatePresence con los atributos de CTA. Se separan: la animación queda en el `motion.div`, los atributos pasan a `HeroImageCta` dentro:

```tsx
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <HeroImageCta
              enabled={imageIsCta}
              label={heroContent?.primaryCta?.text}
              onActivate={handleImageCta}
              className="absolute inset-0"
            >
              <Image
                src={imgSrc}
                alt={currentImage?.alt || heroContent?.headline || 'Banner BaldeCash'}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 70vw"
                className="object-cover"
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                  transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                  transformOrigin: 'center center',
                }}
              />
            </HeroImageCta>
          </motion.div>
```

`imageIsCta` (línea 101) y `handleImageCta` (línea 102) se conservan como están.

- [ ] **Step 5: Los tests deben pasar SIN modificarlos**

```bash
npx jest src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx
npx tsc --noEmit
```

Esperado: el mismo número del Step 1.

**Si algún test falla, el refactor cambió comportamiento: se arregla el
componente, NO el test.**

- [ ] **Step 6: Commit**

```bash
git add src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx
git commit -m "refactor(BAL-2782): LeadHeroBanner usa las piezas de hero compartidas"
```

---

### Task 7: El switch en admin2

La parte que ve el usuario. Repo distinto, runner distinto.

**Files:**
- Modify: `src/types/landing.ts`
- Modify: `src/components/landings/sections/heroValidation.ts`
- Modify: `src/components/landings/sections/HeroSection.tsx`
- Test: `src/components/landings/sections/__tests__/heroValidation.test.ts` (ya existe: agregar casos)

**Interfaces:**
- Consumes: nada de las tasks anteriores (repo distinto)
- Produces: escribe `show_hero_content` en `home_component.config` del hero

- [ ] **Step 1: Crear la rama**

```bash
cd admin2
git fetch origin && git checkout -b feature/bal-2782-hero-switch-solo-imagen origin/main
```

- [ ] **Step 2: Declarar el campo en el tipo**

En `src/types/landing.ts`, junto a los flags existentes (líneas 160-162):

```ts
  hide_overlay?: boolean;
  image_is_cta?: boolean;
  hide_content?: boolean;
  /**
   * Switch "Mostrar textos sobre la imagen" (BAL-2782).
   * Ausente o true = banner completo. false = solo imagen clickeable.
   * Solo se expone en landings institucional y convenio.
   */
  show_hero_content?: boolean;
```

- [ ] **Step 3: Escribir los tests de validación que fallan**

`getHeroMissingFields` ya contempla `hide_content` e `image_is_cta`. Debe entender también el switch nuevo: con `show_hero_content === false`, los textos dejan de ser obligatorios y la URL del CTA pasa a serlo.

Agregar a `src/components/landings/sections/__tests__/heroValidation.test.ts`:

```ts
describe('getHeroMissingFields — switch de contenido (BAL-2782)', () => {
  it('show_hero_content=false no exige titulo, subtitulo ni texto de CTA', () => {
    const missing = getHeroMissingFields(
      { hero_title: '', hero_subtitle: '', hero_cta_text: '', hero_cta_url: 'catalogo' },
      { show_hero_content: false },
    );
    expect(missing).toEqual([]);
  });

  it('show_hero_content=false exige el enlace del CTA', () => {
    const missing = getHeroMissingFields(
      { hero_title: '', hero_subtitle: '', hero_cta_text: '', hero_cta_url: '' },
      { show_hero_content: false },
    );
    expect(missing).toContain('Enlace del CTA');
  });

  it('show_hero_content ausente mantiene los campos obligatorios', () => {
    const missing = getHeroMissingFields(
      { hero_title: '', hero_subtitle: '', hero_cta_text: '', hero_cta_url: '' },
      {},
    );
    expect(missing).toContain('Título Principal');
    expect(missing).toContain('Subtítulo');
  });

  it('show_hero_content=true mantiene los campos obligatorios', () => {
    const missing = getHeroMissingFields(
      { hero_title: '', hero_subtitle: '', hero_cta_text: '', hero_cta_url: '' },
      { show_hero_content: true },
    );
    expect(missing).toContain('Título Principal');
  });
});
```

Correr y ver que fallan:

```bash
npx vitest run src/components/landings/sections/__tests__/heroValidation.test.ts
```

- [ ] **Step 4: Actualizar la validación**

En `heroValidation.ts`, extender el tipo del parámetro `config` y la lógica:

```ts
export function getHeroMissingFields(
  landing: HeroValidationLanding,
  config: Pick<HeroConfig, "hide_content" | "image_is_cta" | "show_hero_content">,
): string[] {
  const missing: string[] = [];
  // El switch de BAL-2782 y el toggle hide_content producen el mismo efecto
  // sobre la obligatoriedad: sin textos visibles, no hay nada que exigir.
  const sinContenido = config.show_hero_content === false || config.hide_content === true;
  if (!sinContenido) {
    if (!landing.hero_title?.trim()) missing.push("Título Principal");
    if (!landing.hero_subtitle?.trim()) missing.push("Subtítulo");
    if (!landing.hero_cta_text?.trim()) missing.push("Texto del CTA");
  }
  // Con el switch apagado la imagen es el unico camino de salida: el enlace
  // pasa a ser obligatorio, igual que con image_is_cta.
  if ((config.image_is_cta || config.show_hero_content === false) && !landing.hero_cta_url?.trim()) {
    missing.push("Enlace del CTA");
  }
  return missing;
}
```

Actualizar también la docstring de la función para mencionar el switch.

- [ ] **Step 5: Correr los tests de validación**

```bash
npx vitest run src/components/landings/sections/__tests__/heroValidation.test.ts
```

Esperado: los preexistentes siguen verdes, más los 4 nuevos.

- [ ] **Step 6: Habilitar la sección para institucional y convenio**

En `HeroSection.tsx`, junto a `isLeadLanding` (línea 103):

```tsx
  const isLeadLanding = landing.landing_type === 'lead';
  // BAL-2782: el switch de contenido se ofrece a institucional y convenio.
  const soportaSwitchContenido =
    landing.landing_type === 'institutional' || landing.landing_type === 'convenio';
  const mostrarTextosHero = config.show_hero_content !== false;
```

Cambiar la condición de la sección "Estilo del hero" (línea 654):

```tsx
      {(isLeadLanding || soportaSwitchContenido) && (
```

Y actualizar el comentario de las líneas 651-653, que hoy explica por qué estaba
limitada a lead — esa razón deja de ser cierta.

- [ ] **Step 7: Agregar el switch dentro de la sección**

Dentro de "Estilo del hero", antes de los tres toggles existentes:

```tsx
            {soportaSwitchContenido && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">Mostrar textos sobre la imagen</p>
                  <p className="text-xs text-gray-500">
                    {mostrarTextosHero
                      ? 'La portada muestra título, subtítulo y botón sobre la imagen.'
                      : 'Solo se muestra la imagen, y al hacer clic lleva al enlace configurado abajo.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarTextosHero}
                    onChange={(e) => {
                      setConfig((prev) => ({ ...prev, show_hero_content: e.target.checked }));
                      onDirtyChange?.(true);
                    }}
                    className="sr-only peer"
                    aria-label="Mostrar textos sobre la imagen"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                </label>
              </div>
            )}
```

Los tres toggles existentes se envuelven en `{isLeadLanding && ( ... )}` para que
institucional y convenio vean **solo** el switch nuevo.

- [ ] **Step 8: Ocultar los campos de texto con el switch apagado**

En la sección "Contenido Principal" (línea ~395), envolver los campos Título,
Subtítulo, Badge, Cuota y Texto del CTA en `{mostrarTextosHero && ( ... )}`.

**URL del CTA NO se oculta.** Cuando `mostrarTextosHero` es false, cambiar su
etiqueta:

```tsx
{mostrarTextosHero ? 'URL del CTA' : 'Link de la imagen'}
```

y su texto de ayuda, para que se entienda que es el destino al hacer clic.

**No borrar valores.** El `onLandingChange` de esos campos no debe dispararse al
ocultarlos: los textos siguen en la BD y reaparecen si se prende el switch.

- [ ] **Step 9: Verificar TypeScript y correr los tests de la sección**

```bash
npx tsc --noEmit
npx vitest run src/components/landings/sections/__tests__/
```

Esperado: 0 errores, todos verdes.

- [ ] **Step 10: Commit**

```bash
git add src/types/landing.ts src/components/landings/sections/
git commit -m "feat(BAL-2782): switch de contenido del hero para institucional y convenio"
```

---

### Task 8: Verificación end-to-end en local

Los tests prueban las piezas; esto prueba que el circuito completo funciona: admin guarda → API entrega → web refleja.

**Files:** ninguno (verificación manual asistida)

**Interfaces:**
- Consumes: Tasks 1-7 aplicadas
- Produces: evidencia visual

- [ ] **Step 1: Levantar el entorno**

Tres piezas: ws2 (sin cambios en este ticket, pero necesario), admin2 y la web.

```bash
# ws2
uvicorn app.main:app --reload --port 8047
```

Verificar que `baldecash/.env.local` apunte a ese puerto y levantar la web. Si el
lock de `.next/dev` está tomado por otra instancia, bajarla primero: el mismo
directorio no admite dos `next dev`.

Levantar admin2 y confirmar contra qué backend apunta.

- [ ] **Step 2: Estado de partida — landing 139 (convenio)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/prototipos/0.6/upn/
```

Esperado: 200. Capturar el hero con Playwright: debe verse con imagen, sombra,
título, subtítulo y botón — idéntico a hoy.

- [ ] **Step 3: Apagar el switch desde el admin**

En admin2, abrir la landing 139 → pestaña **Portada** → sección "Estilo del hero"
→ apagar *"Mostrar textos sobre la imagen"* → guardar.

Verificar en la BD local que se guardó, y que **los textos siguen ahí**:

```sql
SELECT JSON_EXTRACT(config,'$.show_hero_content') AS switch
FROM home_component WHERE landing_id=139 AND component_code='hero';

SELECT hero_title, hero_subtitle, hero_cta_text, hero_cta_url
FROM landing WHERE id=139;
```

Esperado: `switch = false`, y los cuatro campos de texto **con sus valores
originales**. Ese es el requisito de "no perder la info".

- [ ] **Step 4: Verificar la web**

Recargar la landing. Debe verse **solo la imagen**, sin sombra ni textos. Hacer
clic: debe navegar al destino de `hero_cta_url`.

Capturar screenshot.

- [ ] **Step 5: Prender el switch de nuevo**

Desde el admin, volver a encenderlo y guardar. La landing debe volver a verse
como al inicio, **con los textos intactos**. Ese es el caso que prueba que no se
perdió nada.

- [ ] **Step 6: Repetir con una landing institucional**

Elegir una landing `landing_type='institutional'` sin `agreement_id` (usa
`HeroBanner`) y repetir los pasos 3 a 5. Es el segundo hero y hay que verlo
funcionar, no asumirlo.

- [ ] **Step 7: Verificar que una landing lead no cambió**

Abrir una landing `landing_type='lead'` en el admin: debe seguir mostrando los
**tres toggles de siempre** y ningún switch nuevo. En la web, sin cambios.

- [ ] **Step 8: Restaurar la BD local**

Dejar las landings tocadas como estaban:

```sql
UPDATE home_component
SET config = JSON_REMOVE(config, '$.show_hero_content'), updated_at = NOW()
WHERE component_code='hero' AND landing_id IN (139, <id_institucional>);
```

Verificar que quedó limpio.

---

### Task 9: Preparar el despliegue

**Files:** ninguno

**Interfaces:**
- Consumes: Tasks 1-8 completas
- Produces: dos ramas listas para MR

- [ ] **Step 1: Traer main en ambos repos**

```bash
cd baldecash && git fetch origin && git merge origin/main
cd ../admin2 && git fetch origin && git merge origin/main
```

- [ ] **Step 2: Batería completa en baldecash**

```bash
cd baldecash
npx jest src/app/prototipos/0.6/components/hero src/app/prototipos/0.6/components/lead
npx tsc --noEmit
```

- [ ] **Step 3: Batería completa en admin2**

```bash
cd admin2
npx vitest run src/components/landings/
npx tsc --noEmit
```

- [ ] **Step 4: Push de ambas ramas**

```bash
cd baldecash && git push -u origin feature/bal-2782-hero-convenio-flags
cd ../admin2 && git push -u origin feature/bal-2782-hero-switch-solo-imagen
```

No crear los MRs: lo decide el usuario.

- [ ] **Step 5: Marcar el checklist del ticket**

Actualizar BAL-2782 con lo completado.

---

## Notas para quien implemente

**`show_hero_content` ausente significa mostrar.** Siempre `!== false`, nunca
`=== true`. Las 60 landings activas no tienen el campo y no deben cambiar de
aspecto. Si alguna cambia, ese es el error.

**El `variant="soft"` no es opcional** en `HeroBanner` ni en `LeadHeroBanner`.
Sin él, el gradiente pasa de `/65` a `/70` y altera el aspecto de 29 landings
vivas. Ningún test lo detecta: los tests verifican que el overlay exista, no su
tono.

**Los tests de `LeadHeroBanner` no se modifican.** Son la red que prueba que el
refactor no cambió comportamiento.

**No borrar los textos al apagar el switch.** El requisito explícito es que la
información se conserve. Ocultar campos en la UI no debe disparar ningún
`onLandingChange` que los vacíe.

**Son dos repos con runners distintos:** baldecash usa `jest`, admin2 usa
`vitest`. Correr el equivocado da errores que no tienen que ver con el código.
