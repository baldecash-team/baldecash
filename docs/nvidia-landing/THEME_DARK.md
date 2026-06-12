# Landing NVIDIA — Tema oscuro + botones verdes en las páginas de flujo

Guía para que las páginas de **catálogo, detalle de producto, solicitar, formulario,
complementos y confirmación** adopten el **tema oscuro con botones verdes** de la
landing NVIDIA, **manteniendo uniformidad** con su HOME.

> **Idea central (importante):** NO duplicamos componentes. Usamos **los MISMOS**
> `CatalogoClient`, `ProductDetailClient`, `SolicitarClient`, etc., y les pasamos
> un **flag de tema** que decide si se pintan claro (normal) u oscuro (nvidia).
> Esto es **distinto** a `zona-gamer`, que sí tiene componentes aparte
> (`GamerCatalogoClient`, `GamerProductDetailClient`, `GamerSolicitarClient`).
> Repetir ese patrón sería triplicar el mantenimiento — no lo hacemos.

---

## 0. TL;DR — el plan en 3 frases

1. **Botones verdes**: ya casi gratis. Todos los botones de flujo usan
   `bg-[var(--color-primary)]`; basta con que para `nvidia` esa variable valga
   `#76B900`.
2. **Fondo oscuro**: hay que migrar los colores claros que hoy están
   **escritos a mano** (`bg-white`, `text-gray-800`, …) a **tokens** que cambian
   según el tema.
3. **El switch es por slug**: una lista `DARK_LANDINGS = ['nvidia']` decide qué
   landings van en oscuro. Nada de backend, nada de IDs.

> **Dimensión y trampa a tener en cuenta:** los botones verdes son minutos; el
> fondo oscuro es lo laborioso (~1.967 colores claros en ~90 archivos — inventario
> en §6.1). Y hay una trampa: los **modales/drawers** se montan fuera del layout
> y saldrían **blancos** si no se aplica §5.5. Léelas antes de estimar.

---

## 0.1. Impacto en otras landings (home, liderman, convenios, …)

**El contrato es: cero cambios visuales en cualquier landing que no sea
`nvidia`.** Estamos editando componentes COMPARTIDOS (el mismo `CatalogoClient`
lo usan todas), así que esta garantía no es automática: se sostiene sobre tres
mecanismos. Si los tres se respetan, ninguna otra landing cambia.

| Mecanismo | Qué garantiza |
|---|---|
| **Switch opt-in por slug** — solo `nvidia` está en `DARK_LANDINGS`. | Cualquier otro slug devuelve `false` en `isDarkLanding()`: no se pone `data-theme`, no se activa nada. El tema oscuro es **opt-in**, no por defecto. |
| **Tokens encerrados en `[data-theme="nvidia"]`** (§5.1). | Sin ese atributo (= todas las demás landings) esas variables **ni existen**. No hay forma de que "se filtren". |
| **Fallback con el color claro actual** (§5.3). | `bg-[var(--surface,#fff)]`: en home no hay `[data-theme]`, el navegador toma `#fff` → se ve **idéntico a hoy**. |

### Las 3 maneras de romper esto (y cómo evitarlas)

> Estas son las únicas formas en que el trabajo podría afectar a otra landing.
> Las tres están cubiertas en la doc; se listan acá para tenerlas en el radar.

1. **Token sin fallback.** Escribir `bg-[var(--surface)]` (sin `,#fff`). En home
   esa variable no existe → fondo transparente/roto. → **Regla de oro de §5.3:
   siempre fallback con el valor claro original.**
2. **No limpiar `data-theme` al salir de nvidia.** Como es SPA, navegar de
   `nvidia` → `home` sin quitar el atributo del `<html>` deja a home oscuro. →
   **Cubierto por el `else { removeAttribute(...) }` de §5.5.**
3. **Override de `--color-primary` no condicional.** Pintar el verde `#76B900`
   sin el `if (isDarkLanding(landing))` lo aplicaría a todas. → **El override va
   dentro del `if` (§4).**

### Cómo se verifica que no se rompió nada

El paso 4 de §8 ("Regresión en claro") es exactamente esto: tras tematizar cada
página, navegar a `home` (y a una landing de convenio cualquiera) y confirmar que
**se ven idénticas a antes**. Es la prueba de que el contrato se cumple. Hacerla
página por página, no solo al final.

---

## 1. Por qué NO se hace como zona-gamer

`zona-gamer` decide su look duplicando el componente entero:

```tsx
// catalogo/page.tsx
if (landing === 'zona-gamer') return <GamerCatalogoClient />;   // componente aparte
return <CatalogoClient />;

// producto/[...slug]/page.tsx
if (landing === 'zona-gamer') return <GamerProductDetailClient />;
return <ProductDetailClient />;

// solicitar/page.tsx
if (landing === 'zona-gamer') return <GamerSolicitarClient />;
return <SolicitarClient />;
```

Eso significa **dos copias de cada página** (la normal y la gamer) que hay que
mantener en paralelo. **Para NVIDIA NO hacemos esto.** Mantenemos un solo
componente por página y lo volvemos "consciente del tema".

---

## 2. Paleta oficial NVIDIA (de dónde salen los colores)

Los colores son **exactamente** los de la landing NVIDIA, definidos en
`src/app/prototipos/0.6/components/product-landing/NvidiaLanding.tsx` (bloque CSS,
tokens scopeados a `.nvidia-landing`). No inventes colores nuevos: usa estos.

| Rol | Token NVIDIA | Valor | Uso |
|---|---|---|---|
| **Verde primario** | `--green` | `#76B900` | Botón principal (CTA) |
| Verde brillante | `--green-glow` | `#8FE000` | Hover, texto/acento verde, gradientes |
| Acento secundario | `--turquoise` | `#00D9CB` | Eyebrows, detalles, gradiente con el verde |
| Marca BaldeCash | `--indigo` | `#3C3DC5` | Marca (poco uso en flujo) |
| **Fondo página** | `--bg` | `#06060A` | Fondo general (casi negro) |
| Fondo alterno | `--bg-2` | `#0B0B12` | Secciones alternas |
| **Superficie / card** | `--panel` | `#0F0F18` | Cards, paneles |
| Superficie elevada | `--panel-2` | `#14141F` | Cards sobre cards, inputs |
| **Borde** | `--line` | `rgba(255,255,255,.08)` | Bordes sutiles |
| Borde fuerte | `--line-2` | `rgba(255,255,255,.14)` | Bordes en hover/foco |
| **Texto** | `--white` | `#FFFFFF` | Texto principal |
| Texto secundario | `--muted` | `#9AA0AE` | Descripciones, labels |
| Texto terciario | `--muted-2` | `#6B7080` | Notas, captions |

**Botón verde** (referencia de `NvidiaLanding.tsx`, clase `.btn-green`):
- fondo `#76B900`, texto blanco, radio pill (`999px`)
- hover: sube 2px + glow `box-shadow: 0 14px 40px -8px rgba(118,185,0,.6)`

**Botón outline verde** (`.btn-outline`): transparente, borde y texto verde,
hover con fondo `rgba(118,185,0,.12)`.

---

## 3. Cómo se decide el tema (por SLUG)

Una sola lista de slugs. Para activar el oscuro en otra landing en el futuro,
solo agregas su slug aquí — nada más.

```ts
// src/app/prototipos/0.6/utils/theme.ts  (NUEVO)

/** Landings que se renderizan con tema oscuro en sus páginas de flujo. */
export const DARK_LANDINGS = ['nvidia'];

export function isDarkLanding(slug: string): boolean {
  return DARK_LANDINGS.includes(slug);
}
```

> **¿Por qué slug y no ID?** Porque las páginas ya trabajan con el slug: viene
> directo de la URL (`params.landing`) y está disponible al instante. El ID
> numérico (`168`) solo aparece después de que el API responde, así que usarlo
> sería más frágil y sin ninguna ventaja. Además, todo el proyecto ya decide por
> slug (ver el `=== 'zona-gamer'` de arriba).

---

## 4. Parte fácil: botones verdes (sin tocar los componentes)

Los botones de **todas** estas páginas ya leen su color de una variable CSS
`--color-primary`, que el contexto inyecta por landing:

- `src/app/prototipos/0.6/[landing]/context/LayoutContext.tsx:242` lee
  `primary_color` del API (default azul `#4654CD`) y lo setea en
  `document.documentElement` como `--color-primary` (línea ~249).
- Los botones usan `bg-[var(--color-primary)]` — p. ej.
  `CatalogoClient.tsx`, `solicitarClient.tsx`, `confirmacionClient.tsx`,
  `WizardProgress.tsx`.

**Por eso, para volver verdes TODOS los botones de nvidia, basta con forzar la
variable a `#76B900`.** Dos formas (elige una):

**Opción 4.A — Override en el front por slug (recomendado, sin backend):**

```tsx
// LayoutContext.tsx — junto a la línea 242
import { isDarkLanding } from '../../utils/theme';

const NVIDIA_GREEN = '#76B900';
const NVIDIA_TURQUOISE = '#00D9CB';

const primaryColor = isDarkLanding(landing)
  ? NVIDIA_GREEN
  : (layoutData?.primary_color || '#4654CD');

const secondaryColor = isDarkLanding(landing)
  ? NVIDIA_TURQUOISE
  : (layoutData?.secondary_color || '#03DBD0');
```

Como `--color-primary` ya alimenta a todos los botones, **no tocas ni un botón**:
quedan verdes solos en nvidia y siguen azules en el resto.

**Opción 4.B — Configurar `primary_color = #76B900` en el admin/BD de la landing
nvidia.** Más "data-driven", pero implica cambio de backend y que esa landing
tenga su registro de color. La 4.A es más simple para empezar.

---

## 5. Parte con más trabajo: el fondo/textos oscuros

Hoy estas páginas tienen los colores claros **escritos a mano** en cada pedacito:
`bg-white`, `bg-gray-50`, `bg-neutral-50`, `text-gray-800`, `text-neutral-900`,
etc. (confirmado en `CatalogoClient.tsx`, `ProductDetailClient.tsx`,
`solicitarClient.tsx`). NO existe hoy soporte de modo oscuro en ellas.

La estrategia es la **misma** que ya usa `--color-primary`: **tokens en CSS
variables** que cambian de valor según el tema, y en los componentes reemplazar
los colores fijos por esos tokens.

### 5.1. Definir los tokens (una sola vez)

En `src/app/globals.css`, agregar un bloque que se active con un atributo
`data-theme="nvidia"`:

```css
/* Tema oscuro NVIDIA — se activa en el wrapper de [landing] cuando el slug es dark */
[data-theme="nvidia"] {
  --surface-bg:       #06060A;  /* fondo de página            */
  --surface:          #0F0F18;  /* cards / paneles            */
  --surface-2:        #14141F;  /* inputs / cards elevadas    */
  --border-soft:      rgba(255,255,255,.08);
  --border-strong:    rgba(255,255,255,.14);
  --text-strong:      #FFFFFF;
  --text:             #E7E9EF;
  --text-muted:       #9AA0AE;
  --text-faint:       #6B7080;
  --accent-green:     #76B900;  /* = --color-primary en nvidia */
  --accent-green-glow:#8FE000;
  --accent-turquoise: #00D9CB;
}
```

> Los nombres (`--surface`, `--text-muted`, …) son nuevos y neutrales a propósito:
> sirven para nvidia hoy y para cualquier landing oscura mañana. En tema claro NO
> se define `data-theme`, así que estos tokens no aplican y todo queda como está.

### 5.2. Activar el atributo en el layout (punto único)

El layout de `[landing]` envuelve **todas** las páginas de flujo y ya conoce el
slug. Ahí ponemos el `data-theme`:

```tsx
// src/app/prototipos/0.6/[landing]/layout.tsx  (export default, ~línea 1640)
import { isDarkLanding } from '../utils/theme';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const dark = isDarkLanding(landing);

  return (
    <LayoutProvider>
      <SessionProvider landingSlug={landing}>
        <EventTrackerProvider>
          <Suspense><KeepDataFlag /></Suspense>
          {/* data-theme cubre catálogo, detalle, solicitar, complementos, confirmación */}
          <div data-theme={dark ? 'nvidia' : undefined} className={dark ? 'min-h-screen bg-[var(--surface-bg)]' : undefined}>
            <VipGate landing={landing}>
              {children}
            </VipGate>
          </div>
        </EventTrackerProvider>
      </SessionProvider>
    </LayoutProvider>
  );
}
```

> **OJO — modales y drawers (portales):** los modales de NextUI, los drawers y
> cualquier cosa con `createPortal` se montan **fuera** de este `<div>`, así que
> NO heredan el `data-theme` y quedarían **blancos**. La solución está en §5.5
> (es obligatoria si la página tiene modales — y casi todas los tienen).

### 5.3. Reemplazar colores fijos por tokens (en cada componente)

Patrón de reemplazo. La idea es: donde había un color claro fijo, usar el token.

| Antes (claro fijo) | Después (token) |
|---|---|
| `bg-white` | `bg-[var(--surface)]` |
| `bg-gray-50` / `bg-neutral-50` | `bg-[var(--surface-bg)]` |
| `bg-gray-100` | `bg-[var(--surface-2)]` |
| `border-gray-200` / `border-neutral-200` | `border-[var(--border-soft)]` |
| `text-gray-900` / `text-neutral-900` | `text-[var(--text-strong)]` |
| `text-gray-700` / `text-gray-800` | `text-[var(--text)]` |
| `text-gray-500` / `text-gray-400` | `text-[var(--text-muted)]` |
| botón primario | ya usa `bg-[var(--color-primary)]` → queda verde solo |

> **Truco para no romper el tema claro:** los tokens solo existen bajo
> `[data-theme="nvidia"]`. Para que en claro sigan funcionando, dales un
> **fallback** con el valor claro actual:
> `bg-[var(--surface,#fff)]`, `text-[var(--text,#1f2937)]`, etc.
> Así el mismo código se ve claro en home y oscuro en nvidia, sin `if`.

#### Ejemplo real (copiar/pegar)

Esta es la barra flotante de comparación del catálogo
(`CatalogoClient.tsx`, ~línea 2087). Mezcla colores claros fijos
(`bg-white`, `border-neutral-200`, `text-neutral-800`) **con** partes que
ya usan el token primario (`--color-primary`). Solo hay que cambiar las
**primeras**; las del primario quedan igual (se vuelven verdes solas).

**Antes:**

```tsx
<div className="hidden lg:flex fixed ... z-[90]
  bg-white rounded-2xl shadow-xl border border-neutral-200 ...">
  <span className="... bg-[rgba(var(--color-primary-rgb),0.1)]
    text-[var(--color-primary)]">{count}</span>
  <span className="text-neutral-800">Comparar equipos</span>
</div>
```

**Después:**

```tsx
<div className="hidden lg:flex fixed ... z-[90]
  bg-[var(--surface,#fff)] rounded-2xl shadow-xl
  border border-[var(--border-soft,#e5e7eb)] ...">
  <span className="... bg-[rgba(var(--color-primary-rgb),0.1)]
    text-[var(--color-primary)]">{count}</span>   {/* ← NO se toca */}
  <span className="text-[var(--text,#1f2937)]">Comparar equipos</span>
</div>
```

Qué cambió, una a una:

| Antes | Después | Por qué |
|---|---|---|
| `bg-white` | `bg-[var(--surface,#fff)]` | superficie de la card |
| `border-neutral-200` | `border-[var(--border-soft,#e5e7eb)]` | borde sutil |
| `text-neutral-800` | `text-[var(--text,#1f2937)]` | texto principal |
| `bg-[rgba(var(--color-primary-rgb),0.1)]` | _(igual)_ | ya es token primario → verde solo |
| `text-[var(--color-primary)]` | _(igual)_ | ya es token primario → verde solo |
| `shadow-xl` | _(igual, ver §5.6)_ | la sombra se ve bien en ambos temas |

> El fallback (`,#fff`, `,#e5e7eb`, `,#1f2937`) es **el color claro actual**.
> En `home` no existe `[data-theme]`, así que toma el fallback y se ve idéntico.
> En `nvidia` el token sí está definido (§5.1) y gana el oscuro.

### 5.4. (Opcional) Exponer el tema por contexto para JS

Si algún componente necesita el tema en **JavaScript** (no solo en clases CSS) —
por ejemplo para elegir una imagen distinta o un color inline — el contexto ya
existe y es el lugar natural:

```tsx
// LayoutContext.tsx — agregar al value (interface LayoutContextValue, ~línea 34)
isDark: boolean;

// en el provider:
const isDark = isDarkLanding(landing);
// ...incluir isDark en el objeto value y en sus deps
```

Y se consume con el hook que ya existe:

```tsx
import { useLayout } from '../context/LayoutContext';
const { isDark } = useLayout();
```

### 5.5. Modales y drawers (portales) — **obligatorio si hay modales**

Esta es la parte que más rompe en la práctica, así que va con detalle.

**El problema.** El `data-theme="nvidia"` de §5.2 vive en el `<div>` del layout.
Pero los modales de NextUI, los drawers y cualquier `createPortal` se montan en
`document.body`, **fuera** de ese `<div>`. Resultado: no heredan `data-theme`,
los tokens de §5.1 no aplican, y el modal sale **blanco** sobre la página oscura.
Y casi todas las páginas del flujo tienen modales (galería del detalle, selector
de cuotas, accesorios/seguros en complementos, confirmaciones, etc.).

**La solución.** No depender del `<div>`: definir los tokens oscuros también en
el **`<html>`** (`document.documentElement`), que sí es ancestro de los portales.
Y eso ya sabemos hacerlo: es exactamente como se inyecta hoy `--color-primary`
en `LayoutContext.tsx:249`. Solo agregamos los tokens oscuros al lado.

```tsx
// LayoutContext.tsx — junto a donde ya se hace
// document.documentElement.style.setProperty('--color-primary', primaryColor); (~línea 249)

const root = document.documentElement;
if (isDarkLanding(landing)) {
  root.setAttribute('data-theme', 'nvidia');   // ← en <html>, no solo en el div
} else {
  root.removeAttribute('data-theme');          // ← limpiar al cambiar de landing (SPA)
}
```

Con esto, los tokens de §5.1 (que están definidos bajo `[data-theme="nvidia"]`)
aplican tanto dentro del layout **como** en los portales, porque ambos cuelgan
de `<html>`.

> **Dos formas equivalentes, elegir una y ser consistente:**
> 1. **`data-theme` en `<html>`** (recomendado): un solo atributo, los tokens de
>    §5.1 ya están escritos para `[data-theme="nvidia"]`. Si se usa esta, el
>    `data-theme` del `<div>` de §5.2 sobra (se puede dejar o quitar).
> 2. **`setProperty` token por token en `<html>`**: más verboso (hay que setear
>    cada `--surface`, `--text`, etc. uno por uno), pero idéntico al patrón actual
>    de `--color-primary`. Útil si se quiere todo concentrado en el JS del contexto.
>
> La opción 1 es menos código y reusa lo de §5.1. Es la sugerida.

> **No olvidar el `removeAttribute` al salir.** Como es SPA, si navegas de
> `nvidia` a `home` sin limpiar el atributo, `home` quedaría oscuro. El `else`
> de arriba lo cubre. (Mismo cuidado que ya existe con `--color-primary`.)

### 5.6. Casos borde a no olvidar

La tabla de §5.3 cubre el 90%, pero estos detalles aparecen y conviene tenerlos
presentes:

- **Colores inline (`style={{ ... }}`).** Algunos componentes pintan con
  `style={{ background: '#fff', color: '#1f2937' }}` en vez de clases Tailwind.
  Ahí el reemplazo es: `style={{ background: 'var(--surface, #fff)' }}`. Hay que
  buscarlos aparte del grep de clases (ver inventario en §6: la columna "inline").
- **Sombras (`shadow-md`, `shadow-xl`, `shadow-lg`).** En claro las sombras grises
  se ven bien; en oscuro a veces se pierden o se ven sucias. Dos opciones:
  (a) dejarlas (suelen verse aceptables) o (b) suavizar/recolorear con un token
  `--shadow` (ej. una sombra más tenue o con tinte verde). Decidir por página al
  validar; no bloquea.
- **Estados `hover` / `focus` / `disabled`.** Un `hover:bg-gray-100` también es un
  color claro fijo y hay que tokenizarlo (`hover:bg-[var(--surface-2,#f3f4f6)]`).
  Lo mismo con `focus:ring-*` y los `disabled:bg-*`. No se ven hasta que
  interactúas, así que es fácil olvidarlos: revisar al validar cada formulario.
- **`placeholder` y bordes de inputs.** `placeholder-gray-400`,
  `border-gray-300` en los campos del wizard de `solicitar`. Tokenizar igual.
- **Iconos lucide con color heredado.** Si un ícono toma `currentColor`, se
  arregla solo al cambiar el `text-*` del contenedor. Si tiene color fijo
  (`text-gray-400` propio), tokenizarlo.

---

## 6. Qué páginas/componentes tematizar (alcance real)

Estos son **los mismos** componentes de siempre (no copias). Hay que recorrerlos
reemplazando colores claros por tokens. Orden recomendado (validar cada uno antes
de pasar al siguiente):

| Fase | Página | Archivos principales |
|---|---|---|
| 1 | **Catálogo** | `[landing]/catalogo/CatalogoClient.tsx` (+ sus cards/filtros) |
| 2 | **Detalle** | `[landing]/producto/[...slug]/ProductDetailClient.tsx` + `producto/components/detail/**` (galería, specs, pricing, cronograma, tabs, similares, etc.) |
| 3 | **Solicitar / formulario** | `solicitar/solicitarClient.tsx`, `solicitar/[stepSlug]/StepClient.tsx`, `components/solicitar/wizard/**` (`WizardLayout`, `WizardProgress`, `DynamicWizardStep`), `components/solicitar/fields/**` (`TextInput`, `SelectInput`, `DateInput`, `RadioGroup`, `FileUpload`, …) |
| 4 | **Complementos** | `solicitar/complementos/complementosClient.tsx`, `components/solicitar/sections/AccessoriesSection.tsx`, `InsuranceSection.tsx`, `components/upsell/**` (cards de accesorios/seguros y sus modales) |
| 5 | **Confirmación** | `solicitar/confirmacion/confirmacionClient.tsx` |

> Es bastante superficie (cada campo de formulario, cada card y cada modal tiene
> sus colores). Por eso conviene fase por fase, no todo de golpe.

### 6.1. Inventario real (para dimensionar)

Estos números salen de grepear los colores claros fijos (`bg-white`,
`text-gray-*`/`text-neutral-*`, `border-gray-*`/`border-neutral-*`, etc.) en el
código actual. Sirven para estimar, no son exactos al 100% (algún match puede
ser falso positivo), pero dan la magnitud.

**Por archivo (los más pesados):**

| Archivo | Colores claros | Sombras | Inline `style` |
|---|---|---|---|
| `solicitar/[stepSlug]/StepClient.tsx` | ~61 | 2 | 4 |
| `solicitar/solicitarClient.tsx` | ~67 | 1 | 1 |
| `solicitar/complementos/complementosClient.tsx` | ~56 | 3 | 3 |
| `catalogo/CatalogoClient.tsx` | ~34 | 6 | 4 |
| `solicitar/confirmacion/confirmacionClient.tsx` | ~29 | 7 | 5 |
| `producto/.../ProductDetail*.tsx` | ~19 | 2 | 2 |

**Por subárbol (incluye todos los componentes hijos):**

| Subárbol | Ocurrencias | Archivos |
|---|---|---|
| `catalogo/**` | ~896 | ~43 |
| `solicitar/**` | ~671 | ~29 |
| `producto/**` | ~400 | ~18 |
| **Total aprox.** | **~1.967** | **~90** |

> Lectura honesta: **no es un cambio de un día.** El grueso son los formularios
> (`solicitar` + sus `fields/` y `wizard/`). El catálogo y el detalle también
> pesan por sus muchas cards/modales. Por eso el plan es fase por fase (§7),
> validando en navegador cada una antes de seguir. La parte "botones verdes"
> (§4) sí es de minutos; lo laborioso es pintar superficies.

---

## 7. Plan sugerido por fases

- **Fase 0 — Botones verdes (rápido):** §4. Override de `--color-primary` a
  `#76B900` por slug. Resultado inmediato: todos los CTAs verdes en nvidia.
- **Fase 1 — Infra de tema (una vez):** §3 (`utils/theme.ts`), §5.1 (tokens en
  `globals.css`), §5.2 (`data-theme` en el layout), **§5.5 (`data-theme` también
  en `<html>` para que los modales no salgan blancos — obligatorio)**, §5.4
  (flag `isDark` en contexto si hace falta JS).
- **Fase 2 — Tematizar página por página:** §6, en orden
  catálogo → detalle → solicitar → complementos → confirmación, validando cada
  una en el navegador antes de la siguiente.

---

## 8. Verificación (end-to-end, sin build)

> MacBook Air 8GB: usar `npm run dev`, **no** `npm run build`.

Para cada página, con `npm run dev` y navegando a la ruta de **nvidia**:

1. **Botones**: los CTAs principales se ven **verdes** (`#76B900`), no azules.
2. **Fondo/superficies**: fondo oscuro (`#06060A`), cards `#0F0F18`, bordes
   sutiles, texto legible (blanco/grises claros). Sin "parches" blancos.
3. **Modales/drawers**: abren también en oscuro (no en blanco). Si alguno queda
   claro, es un portal y falta aplicar §5.5 (`data-theme` en `<html>`).
4. **Regresión en claro**: navegar a `home` (o cualquier landing no-dark) y
   confirmar que **sigue claro e idéntico** a como estaba. Los fallbacks de §5.3
   garantizan esto, pero hay que verificarlo.
5. **Flujo completo**: catálogo → detalle → solicitar → formulario →
   complementos → confirmación, todo coherente en oscuro y sin saltos de color.

---

## 9. Resumen

| Tema | Cómo | Esfuerzo |
|---|---|---|
| Botones verdes | `--color-primary = #76B900` por slug (§4) | 🟢 Bajo |
| Switch por landing | `DARK_LANDINGS = ['nvidia']` (§3) | 🟢 Bajo |
| Activar tema | `data-theme="nvidia"` en `[landing]/layout.tsx` (§5.2) | 🟢 Bajo |
| Tokens oscuros | CSS vars en `globals.css` (§5.1) | 🟢 Bajo |
| Modales no-blancos | `data-theme` también en `<html>` (§5.5) | 🟢 Bajo |
| Pintar páginas | reemplazar colores fijos por tokens, página por página (§5.3, §6: ~1.967 ocurrencias / ~90 archivos) | 🔴 Medio-alto |

**Regla de oro:** un solo componente por página, tematizado con tokens.
Nunca duplicar componentes como gamer.
