# Landing NVIDIA — Contexto general

## Objetivo

Implementar la landing de producto NVIDIA siguiendo el mismo patrón arquitectónico de **MacBook Neo** — solo el HOME es especializado, las demás rutas (catálogo, producto, solicitar) usan los componentes genéricos del sistema.

---

## Datos de la landing en BD

| Campo | Valor |
|---|---|
| **ID** | `168` |
| **Slug** | `nvidia` |
| **Name** | `NVIDIA` |
| **Code** | `nvidia-b6296865` |
| **URL** | `/prototipos/0.6/nvidia` |

**Presets activos:**
| Preset | Efecto |
|---|---|
| `floating-cta-on` | CTA flotante de Balde-up ya configurado |

> El catálogo está **habilitado** (el preset `catalog-off` fue eliminado). Los links de catálogo/detalle apuntan por ahora a `zona-gamer` — ver [LINKS.md](./LINKS.md).

---

## Patrón a seguir: MacBook Neo

**Leer `MacBookNeoLanding.tsx` completo antes de escribir código.**

### Detección en `LandingPageClient.tsx`

```typescript
// Línea 459 — detección por ID, nunca por slug
const isProductLanding = heroData?.landingId === LANDING_IDS.MACBOOK_NEO;

if (isProductLanding) {
  return (
    <div style={{ '--color-primary': heroData?.primaryColor || '#4654CD', ... }}>
      {showPreviewBanner && <PreviewBanner landingSlug={slug} />}
      <MacBookNeoLanding footerData={mergedFooterData} landing={slug} ... />
      <FloatingCtaButton config={landingConfig.features.floating_cta} />
    </div>
  );
}
```

### IDs centralizados — `utils/landingIds.ts`

```typescript
export const LANDING_IDS = {
  MACBOOK_NEO: 150,
  ZONA_GAMER: 136,
  NVIDIA: 168,  // ← agregar
} as const;
```

### Estructura del componente principal

```typescript
export default function NvidiaLanding({ footerData, landing, previewBannerOffset, promoBannerData }) {
  useLenis();
  const { tier } = useDeviceCapabilities();

  return (
    <div>
      <link rel="preconnect" href="https://baldecash.s3.amazonaws.com" />
      <link rel="dns-prefetch" href="https://baldecash.s3.amazonaws.com" />

      <StickyNav ... />
      <NvidiaHero ... />             {/* visible inmediatamente — NO lazy */}

      <LazySection fallbackHeight={600}>
        <NvidiaGPUSection ... />     {/* below-fold — lazy */}
      </LazySection>
      ...
      <Footer ... />
    </div>
  );
}
```

### Data local — `data/nvidiaData.ts`

Textos, URLs de imágenes, planes, specs → en un archivo TypeScript local. No depende de API para el contenido estático. Ver `data/v5Data.ts` de MacBook Neo como referencia.

---

## Archivos a crear/modificar

### Crear
```
src/app/prototipos/0.6/components/product-landing/
├── NvidiaLanding.tsx
└── data/
    └── nvidiaData.ts
```

### Modificar
```
src/app/prototipos/0.6/utils/landingIds.ts
  → Agregar NVIDIA: 168

src/app/prototipos/0.6/[[...slug]]/LandingPageClient.tsx
  → Importar NvidiaLanding
  → Agregar detección por landingId === LANDING_IDS.NVIDIA
```

### No tocar
Catálogo, producto y solicitar son genéricos — funcionan automáticamente. El catálogo está **habilitado**. Por ahora los botones de catálogo/detalle apuntan a `zona-gamer` (ver [LINKS.md](./LINKS.md)) porque nvidia aún no tiene productos propios.

---

## Props del componente

```typescript
interface NvidiaLandingProps {
  footerData?: FooterData | null;
  landing?: string;                      // slug = 'nvidia'
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
}
```

---

## Rama de trabajo

```bash
git checkout -b feature/nvidia-landing
git push origin feature/nvidia-landing
```

Todo el trabajo va en esta rama. No crear PR ni hacer merge a main.

---

## Stack disponible — no instalar nada nuevo

| Librería | Uso |
|---|---|
| `framer-motion` | Animaciones declarativas |
| `@studio-freight/lenis` | Smooth scroll (via `useLenis`) |
| `gsap` + `ScrollTrigger` | Animaciones scroll-driven |
| `lucide-react` | Íconos (NO emojis en UI) |
| `tailwindcss` | Estilos utility-first |

---

## Referencia rápida de archivos

```
src/app/prototipos/0.6/
├── [[...slug]]/LandingPageClient.tsx          ← MODIFICAR
├── utils/landingIds.ts                         ← MODIFICAR
└── components/product-landing/
    ├── MacBookNeoLanding.tsx                   ← LEER como referencia
    ├── NvidiaLanding.tsx                       ← CREAR
    ├── StickyNav.tsx                           ← reusar si aplica
    ├── data/
    │   ├── v5Data.ts                           ← LEER como referencia
    │   └── nvidiaData.ts                       ← CREAR
    ├── shared/hooks/
    │   ├── useLenis.ts                         ← usar directamente
    │   ├── useDeviceCapabilities.ts            ← usar directamente
    │   └── useReducedMotion.ts                 ← usar directamente
    ├── types/v5Types.ts                        ← LEER para tipos
    └── lib/constants.ts                        ← LEER para URLs S3

components/zona-gamer/LazySection.tsx           ← referencia de LazySection
utils/nvidiaGpu.ts                              ← parseNvidiaModel() ya existe
```

---

## Checklist antes de pushear

- [ ] `NvidiaLanding.tsx` creado
- [ ] `nvidiaData.ts` creado
- [ ] `NVIDIA: 168` en `landingIds.ts`
- [ ] Import y detección en `LandingPageClient.tsx`
- [ ] Hero **no** en LazySection
- [ ] Secciones below-fold en `LazySection`
- [ ] Hero image: `fetchPriority="high"`
- [ ] Imágenes below-fold: `loading="lazy"` + dimensiones
- [ ] Error fallback en todas las imágenes
- [ ] Preconnect a S3
- [ ] `useLenis()` en el root
- [ ] `useDeviceCapabilities()` — sin videos en `tier === 'base'`
- [ ] Scroll listeners con `{ passive: true }`
- [ ] Google Fonts con guard de duplicados
- [ ] Sin errores TypeScript (`npx tsc --noEmit`)
- [ ] Probado en mobile (Chrome DevTools, throttling 3G)
- [ ] Pusheado a `feature/nvidia-landing`
