# Hero de convenio: flags de overlay, imagen-CTA y contenido — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que `ConvenioHero` respete los tres switches que el admin ya expone (`hideOverlay`, `imageIsCta`, `hideContent`), extrayendo la lógica compartida para que otros heroes la reusen.

**Architecture:** Dos componentes nuevos en `components/hero/common/` — `HeroOverlay` (gradiente condicional) y `HeroImageCta` (wrapper clickeable con teclado y accesibilidad). `ConvenioHero` los consume y agrega el guard de `hideContent`. `LeadHeroBanner`, que hoy implementa esta lógica inline, migra a las mismas piezas sin cambio visual.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Tailwind, **jest** + React Testing Library.

**Ticket:** BAL-2782
**Spec:** `docs/superpowers/specs/2026-08-04-hero-convenio-flags-design.md`

## Global Constraints

- **El runner de tests es `jest`, NO vitest.** El repo tiene `jest.config.js` y `"test": "jest"` en `package.json`. Comando: `npx jest <ruta>`.
- **No se toca ws2 ni admin2.** El backend ya entrega los flags y los switches ya existen en el admin. Este ticket es solo frontend.
- **Sin migraciones ni cambios de BD.**
- **No-regresión estricta:** sin flags configurados, los heroes deben verse **exactamente igual que hoy**. 60 landings activas tienen hero y ninguna usa estos flags.
- **No unificar los gradientes.** `LeadHeroBanner` usa `via-black/65` y `ConvenioHero` usa `via-black/70`. Se parametrizan, no se igualan.
- **No tocar `HeroBanner.tsx`** (el hero de landings normales). Está fuera de alcance: no recibe `heroContent` sino props sueltas.
- UI y textos en español; nombres de código en inglés.
- Rama de trabajo: `feature/bal-2782-hero-convenio-flags` (ya creada desde `origin/main`).

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `components/hero/common/HeroOverlay.tsx` | El gradiente oscuro condicional. Dos variantes de intensidad. |
| `components/hero/common/HeroImageCta.tsx` | Wrapper que hace clickeable a su contenido, con teclado y ARIA. |
| `components/hero/convenio/ConvenioHero.tsx` | Consume ambas piezas + guard de `hideContent`. |
| `components/lead/LeadHeroBanner.tsx` | Migra su lógica inline a las piezas compartidas. |
| `components/hero/convenio/__tests__/ConvenioHero.test.tsx` | Tests de los tres flags. |

Los dos componentes nuevos van en `hero/common/`, donde ya vive `UnderlinedText.tsx`. Son piezas de presentación puras: sin estado, sin llamadas a API, sin acceso a contexto.

---

### Task 1: HeroOverlay

El gradiente condicional, aislado. Es la pieza más simple y no depende de nada.

**Files:**
- Create: `src/app/prototipos/0.6/components/hero/common/HeroOverlay.tsx`
- Test: `src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx`

**Interfaces:**
- Consumes: nada
- Produces: `HeroOverlay({ hidden?: boolean; variant?: 'default' | 'soft' })`. Renderiza `null` si `hidden`; si no, un `div` absoluto con `data-testid="hero-overlay"`. `variant='default'` → `via-black/70` (el de convenio), `variant='soft'` → `via-black/65` (el de lead).

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

  it('variant soft usa el gradiente de lead (via-black/65)', () => {
    render(<HeroOverlay variant="soft" />);
    expect(screen.getByTestId('hero-overlay').className).toContain('via-black/65');
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
npx jest src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx
```

Esperado: falla porque `../HeroOverlay` no existe.

- [ ] **Step 3: Implementar el componente**

Crear `src/app/prototipos/0.6/components/hero/common/HeroOverlay.tsx`:

```tsx
import React from 'react';

interface HeroOverlayProps {
  /** Si es true no se renderiza nada. Viene del switch "Ocultar overlay oscuro". */
  hidden?: boolean;
  /**
   * Intensidad del gradiente. Los dos heroes venian con valores distintos y se
   * conservan tal cual para no cambiar el aspecto de ninguno:
   *   default -> ConvenioHero (via-black/70)
   *   soft    -> LeadHeroBanner (via-black/65)
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
git add src/app/prototipos/0.6/components/hero/common/HeroOverlay.tsx src/app/prototipos/0.6/components/hero/common/__tests__/HeroOverlay.test.tsx
git commit -m "feat(BAL-2782): HeroOverlay, gradiente condicional compartido"
```

---

### Task 2: HeroImageCta

El wrapper clickeable. La lógica de teclado y ARIA se toma de `LeadHeroBanner.tsx:118-130`, que ya la resolvió.

**Files:**
- Create: `src/app/prototipos/0.6/components/hero/common/HeroImageCta.tsx`
- Test: `src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx`

**Interfaces:**
- Consumes: nada
- Produces: `HeroImageCta({ enabled, href?, label?, onActivate?, className?, children })`. Con `enabled=false` renderiza un `div` simple con `className`. Con `enabled=true` agrega `data-testid="hero-image-cta"`, `role="button"`, `tabIndex={0}`, `aria-label`, `cursor-pointer`, `onClick` y Enter/Espacio.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroImageCta } from '../HeroImageCta';

describe('HeroImageCta', () => {
  it('enabled=false renderiza los children sin rol de boton', () => {
    render(
      <HeroImageCta enabled={false}>
        <span>contenido</span>
      </HeroImageCta>,
    );
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
    render(
      <HeroImageCta enabled onActivate={onActivate}>
        <span>contenido</span>
      </HeroImageCta>,
    );
    const el = screen.getByTestId('hero-image-cta');
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.keyDown(el, { key: ' ' });
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('ignora otras teclas', () => {
    const onActivate = jest.fn();
    render(
      <HeroImageCta enabled onActivate={onActivate}>
        <span>contenido</span>
      </HeroImageCta>,
    );
    fireEvent.keyDown(screen.getByTestId('hero-image-cta'), { key: 'a' });
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('sin onActivate navega al href', () => {
    render(
      <HeroImageCta enabled href="/prototipos/0.6/upn/catalogo">
        <span>contenido</span>
      </HeroImageCta>,
    );
    const el = screen.getByTestId('hero-image-cta');
    expect(el).toHaveAttribute('role', 'button');
    // La navegacion real usa window.location; aca solo se verifica que el
    // elemento quedo activable. El caso con onActivate cubre el disparo.
  });

  it('conserva el className recibido', () => {
    render(
      <HeroImageCta enabled className="absolute inset-0">
        <span>contenido</span>
      </HeroImageCta>,
    );
    expect(screen.getByTestId('hero-image-cta').className).toContain('absolute inset-0');
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
npx jest src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx
```

Esperado: falla porque `../HeroImageCta` no existe.

- [ ] **Step 3: Implementar el componente**

Crear `src/app/prototipos/0.6/components/hero/common/HeroImageCta.tsx`:

```tsx
'use client';

import React from 'react';

interface HeroImageCtaProps {
  /** Viene del switch "Imagen clickeable (CTA)". Con false no se altera nada. */
  enabled: boolean;
  /** Destino cuando no se pasa onActivate. */
  href?: string;
  /** Texto para lectores de pantalla. */
  label?: string;
  /** Handler propio del hero (permite tracking antes de navegar). */
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
git add src/app/prototipos/0.6/components/hero/common/HeroImageCta.tsx src/app/prototipos/0.6/components/hero/common/__tests__/HeroImageCta.test.tsx
git commit -m "feat(BAL-2782): HeroImageCta, wrapper clickeable compartido"
```

---

### Task 3: ConvenioHero respeta los tres flags

El corazón del ticket. Es lo que hace que la landing 139 pueda configurarse.

**Files:**
- Modify: `src/app/prototipos/0.6/components/hero/convenio/ConvenioHero.tsx`
- Test: `src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx` (crear)

**Interfaces:**
- Consumes: `HeroOverlay` (Task 1), `HeroImageCta` (Task 2)
- Produces: nada nuevo — el componente conserva su firma actual

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx`.

`ConvenioHero` usa `window.matchMedia` (línea 43) y `useRouter`, así que ambos se mockean, igual que hace el test de `LeadHeroBanner`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConvenioHero } from '../ConvenioHero';
import type { HeroContent, AgreementData } from '../../../../types/hero';

// jsdom no implementa matchMedia y el componente lo usa para el modo mobile
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
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

beforeEach(() => {
  push.mockClear();
});

describe('ConvenioHero — flags de hero', () => {
  it('sin flags: overlay, contenido y sin imagen clickeable (no-regresion)', () => {
    renderHero();
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
    expect(screen.getByText('Ver equipos disponibles')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('hideOverlay oculta el gradiente y conserva el texto', () => {
    renderHero({ hideOverlay: true });
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
  });

  it('hideContent oculta titulo, subtitulo, badge y boton', () => {
    renderHero({ hideContent: true });
    expect(screen.queryByText('Financia tu equipo ideal')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin historial crediticio')).not.toBeInTheDocument();
    expect(screen.queryByText('Convenio UPN')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver equipos disponibles')).not.toBeInTheDocument();
  });

  it('hideContent no oculta el overlay', () => {
    renderHero({ hideContent: true });
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
  });

  it('imageIsCta hace la imagen clickeable y navega al destino del CTA', () => {
    renderHero({ imageIsCta: true });
    const img = screen.getByTestId('hero-image-cta');
    expect(img).toHaveAttribute('role', 'button');
    fireEvent.click(img);
    expect(push).toHaveBeenCalledWith('/prototipos/0.6/upn/catalogo');
  });

  it('imageIsCta responde a Enter', () => {
    renderHero({ imageIsCta: true });
    fireEvent.keyDown(screen.getByTestId('hero-image-cta'), { key: 'Enter' });
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('los tres flags juntos: solo imagen clickeable, sin overlay ni texto', () => {
    renderHero({ hideOverlay: true, hideContent: true, imageIsCta: true });
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.queryByText('Financia tu equipo ideal')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-image-cta')).toBeInTheDocument();
  });

  it('sin backgroundImage no hay wrapper clickeable aunque imageIsCta este activo', () => {
    renderHero({ imageIsCta: true, backgroundImage: undefined });
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

```bash
npx jest src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx
```

Esperado: pasa el primero (no-regresión) y fallan los demás, porque el componente todavía ignora los flags.

- [ ] **Step 3: Importar las piezas compartidas**

En `ConvenioHero.tsx`, junto a los imports existentes (después del import de `colorContrast`, línea 19):

```tsx
import { HeroOverlay } from '../common/HeroOverlay';
import { HeroImageCta } from '../common/HeroImageCta';
```

- [ ] **Step 4: Envolver la imagen con HeroImageCta**

Reemplazar el bloque de la imagen (líneas 101-118) por:

```tsx
      {/* Background image - next/image with priority for LCP optimization */}
      {heroContent.backgroundImage && (
        <HeroImageCta
          enabled={heroContent.imageIsCta === true && !!ctaUrl && ctaUrl !== '#'}
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

`onActivate={handleCtaClick}` reusa el handler que ya existe (línea 83): dispara el tracking y distingue links externos de internos.

- [ ] **Step 5: Reemplazar el overlay**

Reemplazar la línea 121 completa:

```tsx
      {/* Gradient overlay — stronger on mobile (text overlaps image center) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/20 sm:to-transparent" />
```

por:

```tsx
      {/* Gradient overlay — se oculta con el switch "Ocultar overlay oscuro" */}
      <HeroOverlay hidden={heroContent.hideOverlay} />
```

- [ ] **Step 6: Envolver el contenido con el guard de hideContent**

El bloque de contenido va de la línea 123 (`<div className="relative z-10 ...">`) a la 179 (`</div>` que cierra ese contenedor). Envolverlo:

```tsx
      {!heroContent.hideContent && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-8 sm:py-12">
          {/* ...badge, headline, subheadline, precio, beneficios y CTA sin cambios... */}
        </div>
      )}
```

No se modifica nada del interior: solo se envuelve. La altura del hero la define el `style` del contenedor raíz (línea 97), así que ocultar el contenido no cambia el tamaño.

- [ ] **Step 7: Correr los tests para verificar que pasan**

```bash
npx jest src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx
```

Esperado: 8 passed.

- [ ] **Step 8: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: 0 errores.

- [ ] **Step 9: Commit**

```bash
git add src/app/prototipos/0.6/components/hero/convenio/ConvenioHero.tsx src/app/prototipos/0.6/components/hero/convenio/__tests__/ConvenioHero.test.tsx
git commit -m "feat(BAL-2782): ConvenioHero respeta hideOverlay, imageIsCta y hideContent"
```

---

### Task 4: Migrar LeadHeroBanner a las piezas compartidas

Sin esto quedarían dos implementaciones de lo mismo, que es justo lo que el ticket quiere evitar.

**Files:**
- Modify: `src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx`

**Interfaces:**
- Consumes: `HeroOverlay` y `HeroImageCta` (Tasks 1 y 2)
- Produces: nada nuevo

- [ ] **Step 1: Confirmar el estado verde de partida**

Los tests de este componente ya existen y pasan. Se corren ANTES de tocar nada, para saber de qué punto se parte:

```bash
npx jest src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx
```

Anotar el número de tests que pasan. Ese mismo número debe repetirse al final.

- [ ] **Step 2: Importar las piezas compartidas**

En `LeadHeroBanner.tsx`, junto a los imports existentes:

```tsx
import { HeroOverlay } from '../hero/common/HeroOverlay';
import { HeroImageCta } from '../hero/common/HeroImageCta';
```

- [ ] **Step 3: Reemplazar el overlay**

Reemplazar el bloque de las líneas 152-158:

```tsx
      {/* ── Overlay oscuro — igual que HeroBanner principal ── */}
      {!heroContent?.hideOverlay && (
        <div
          data-testid="hero-overlay"
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent"
        />
      )}
```

por:

```tsx
      {/* ── Overlay oscuro — variant soft conserva el via-black/65 original ── */}
      <HeroOverlay hidden={heroContent?.hideOverlay} variant="soft" />
```

**`variant="soft"` es obligatorio.** Sin él el gradiente cambia de `/65` a `/70` y altera el aspecto del hero en producción.

- [ ] **Step 4: Reemplazar el wrapper clickeable**

El `motion.div` de las líneas 112-130 mezcla la animación de AnimatePresence con los atributos de CTA. Se separan: la animación queda en el `motion.div` y los atributos de CTA pasan a `HeroImageCta` dentro de él.

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

Se conservan `imageIsCta` (línea 101) y `handleImageCta` (línea 102) tal como están.

- [ ] **Step 5: Correr los tests — deben pasar SIN modificarlos**

```bash
npx jest src/app/prototipos/0.6/components/lead/__tests__/LeadHeroBanner.test.tsx
```

Esperado: el mismo número de tests verdes del Step 1.

**Si algún test falla, el refactor cambió comportamiento.** Hay que arreglar el componente, NO el test. Los tests son la definición de lo que no debe cambiar.

- [ ] **Step 6: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: 0 errores.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/components/lead/LeadHeroBanner.tsx
git commit -m "refactor(BAL-2782): LeadHeroBanner usa las piezas de hero compartidas"
```

---

### Task 5: Verificación visual en local con Playwright

Los tests unitarios prueban la lógica; esto prueba lo que ve el usuario.

**Files:**
- Test: `e2e/hero-convenio-flags.spec.ts` (crear)

**Interfaces:**
- Consumes: Tasks 1-4 aplicadas
- Produces: nada

- [ ] **Step 1: Levantar backend y web**

El backend no cambia en este ticket, pero la web necesita apuntar a uno que responda:

```bash
# ws2, en su worktree
uvicorn app.main:app --reload --port 8047
```

Verificar que `baldecash/.env.local` tenga `NEXT_PUBLIC_API_URL=http://localhost:8047/api/v1` y levantar la web en el puerto 3001. Si otro `next dev` tiene tomado el lock (`.next/dev/lock`), hay que bajarlo: el mismo directorio no admite dos instancias.

- [ ] **Step 2: Confirmar que la landing 139 carga**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/prototipos/0.6/upn/
```

Esperado: 200. La landing 139 tiene slug `upn`.

- [ ] **Step 3: Capturar el estado actual (sin flags)**

Crear `e2e/hero-convenio-flags.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const LANDING = 'upn';  // landing 139, Convenio UPN

test('hero de convenio sin flags: overlay y contenido visibles', async ({ page }) => {
  await page.goto(`${BASE}/prototipos/0.6/${LANDING}/`, { waitUntil: 'domcontentloaded' });
  const hero = page.locator('#hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByTestId('hero-overlay')).toBeVisible();
  await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/bal-2782-sin-flags.png', fullPage: false });
});
```

Correr:

```bash
npx playwright test e2e/hero-convenio-flags.spec.ts --reporter=line
```

Esperado: pasa. Este es el control de no-regresión.

- [ ] **Step 4: Activar los flags en la BD local**

En la BD local de baldemotor, sobre el componente hero de la landing 139:

```sql
UPDATE home_component
SET config = JSON_MERGE_PATCH(
      COALESCE(config, JSON_OBJECT()),
      JSON_OBJECT('hide_overlay', true, 'hide_content', true, 'image_is_cta', true)
    ),
    updated_at = NOW()
WHERE landing_id = 139 AND component_code = 'hero';
```

Antes de correrlo, guardar el valor actual para poder restaurarlo:

```sql
SELECT id, config FROM home_component WHERE landing_id = 139 AND component_code = 'hero';
```

- [ ] **Step 5: Verificar el modo "solo imagen"**

Agregar al spec:

```typescript
test('hero de convenio con los tres flags: solo imagen clickeable', async ({ page }) => {
  await page.goto(`${BASE}/prototipos/0.6/${LANDING}/`, { waitUntil: 'domcontentloaded' });
  const hero = page.locator('#hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByTestId('hero-overlay')).toHaveCount(0);
  await expect(hero.getByRole('heading', { level: 1 })).toHaveCount(0);
  await expect(hero.getByTestId('hero-image-cta')).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/bal-2782-solo-imagen.png', fullPage: false });
});

test('la imagen del hero navega al destino del CTA', async ({ page }) => {
  await page.goto(`${BASE}/prototipos/0.6/${LANDING}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('#hero').getByTestId('hero-image-cta').click();
  await page.waitForURL(/\/catalogo/, { timeout: 20000 });
});
```

Correr los tres:

```bash
npx playwright test e2e/hero-convenio-flags.spec.ts --reporter=line
```

Los tres tests dependen del estado de la BD, así que **no pueden pasar todos a la
vez**: el primero asume flags apagados y los otros dos, encendidos.

Resolverlo con `describe` separados y una nota al inicio del archivo:

```typescript
/**
 * ESTADO DE BD REQUERIDO — estos tests leen la configuracion real de la
 * landing 139, asi que cada bloque asume un estado distinto:
 *
 *   'sin flags'  -> config del hero sin hide_overlay/hide_content/image_is_cta
 *   'con flags'  -> los tres en true
 *
 * Se corren en dos pasadas, cambiando la BD entre una y otra (ver el plan de
 * BAL-2782, Task 5). Por eso el bloque que no corresponde va con test.skip.
 */
```

Con los flags activos, dejar el primer test en `test.skip` y correr los otros
dos. Al restaurar la BD (Step 7), invertir el skip. **Antes de commitear, dejar
el archivo con el estado sin flags activo** — que es el estado real de la BD.

- [ ] **Step 6: Revisar los screenshots**

Abrir los dos archivos en `e2e/screenshots/`. Confirmar:
- Sin flags: imagen con sombra, título, subtítulo y botón
- Con flags: solo la imagen, sin sombra ni texto, sin huecos ni bloques vacíos

- [ ] **Step 7: Restaurar la BD local**

```sql
UPDATE home_component
SET config = JSON_REMOVE(config, '$.hide_overlay', '$.hide_content', '$.image_is_cta'),
    updated_at = NOW()
WHERE landing_id = 139 AND component_code = 'hero';
```

Verificar que quedó como al inicio:

```sql
SELECT config FROM home_component WHERE landing_id = 139 AND component_code = 'hero';
```

- [ ] **Step 8: Commit**

```bash
git add e2e/hero-convenio-flags.spec.ts
git commit -m "test(BAL-2782): e2e de los flags del hero de convenio"
```

---

### Task 6: Preparar el despliegue

**Files:** ninguno

**Interfaces:**
- Consumes: Tasks 1-5 completas
- Produces: rama lista para MR

- [ ] **Step 1: Traer main**

```bash
git fetch origin && git merge origin/main
```

Resolver conflictos si los hay.

- [ ] **Step 2: Correr la batería completa de tests tocados**

```bash
npx jest src/app/prototipos/0.6/components/hero/common src/app/prototipos/0.6/components/hero/convenio src/app/prototipos/0.6/components/lead
```

Esperado: todos verdes. Incluye los tests preexistentes de `LeadHeroBanner` y `HeroBanner`.

- [ ] **Step 3: TypeScript limpio**

```bash
npx tsc --noEmit
```

Esperado: 0 errores.

- [ ] **Step 4: Push**

```bash
git push -u origin feature/bal-2782-hero-convenio-flags
```

No crear el MR: lo decide el usuario.

- [ ] **Step 5: Dejar preparado el SQL de producción**

Para activar el modo "solo imagen" en la landing 139:

```sql
UPDATE home_component
SET config = JSON_MERGE_PATCH(
      COALESCE(config, JSON_OBJECT()),
      JSON_OBJECT('hide_overlay', true, 'hide_content', true, 'image_is_cta', true)
    ),
    updated_at = NOW()
WHERE landing_id = 139 AND component_code = 'hero';
```

**No hace falta ejecutarlo en el deploy.** Lo mismo se consigue desde el admin con los tres switches, que es el camino previsto. El SQL queda solo como referencia.

- [ ] **Step 6: Marcar el checklist del ticket**

Marcar en BAL-2782 los items completados.

---

## Notas para quien implemente

**El backend y el admin no se tocan.** Si te encontrás editando ws2 o admin2, algo se entendió mal: los switches ya existen y el API ya entrega los flags. Este ticket es solo frontend.

**El `variant="soft"` de LeadHeroBanner no es opcional.** Sin él, ese hero cambia de gradiente en producción. Es el único punto del refactor que puede alterar algo visible sin que ningún test lo detecte.

**Los tests de LeadHeroBanner no se modifican.** Son la red que prueba que el refactor no cambió comportamiento. Si fallan, se arregla el componente.

**`HeroBanner.tsx` queda intacto.** Es un tercer hero que tampoco respeta los flags, pero recibe props sueltas en vez de `heroContent` y afecta a 31 landings activas. Tiene su propio ticket pendiente.
