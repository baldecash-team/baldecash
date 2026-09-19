# Formulario embebido en `renueva-*`

**Fecha:** 2026-09-18
**Rama:** `feat/renueva-formulario-embebido`
**Base:** `main` @ `796a2c13`

---

## 1. Problema

Las landings de segundo financiamiento (`renueva-*`) tienen **un solo paso real**
de formulario. Verificado contra `api.baldecash.com/api/v1/public/landing/{slug}/wizard`
para `renueva-tu-equipo-1`, `-2`, `-3` y `-1-a`:

| order | code | url_slug | summary | campos |
|-------|------|----------|---------|--------|
| 0 | `datos_personales_pruebav2` | `datos-personales` | no | 10 |
| 1 | `summary_resumen_1a` | `resumen` | sí | 0 |

Aun así el usuario atraviesa dos pantallas antes de escribir nada: la intro
(`/[landing]/solicitar`), que hoy es una página de bienvenida con tarjetas
informativas, y recién después el formulario (`/[landing]/solicitar/datos-personales`).

Para un flujo de un solo paso esa intro es puro peaje. Se quiere una única
pantalla: accesorios arriba (plegado) y el formulario abajo.

## 2. Alcance

**Aplica solo a `renueva-*`.** El gate es `isSecondFinancingLanding(slug)` de
`src/app/prototipos/0.6/utils/theme.ts` (`/renueva-/i`), que ya es el predicado
canónico de estas landings.

Landings alcanzadas hoy (tabla `landing` en prod, activas): `renueva-tu-laptop` (148),
`renueva-tu-equipo` (151), `renueva-tu-equipo-1` (178), `-2` (179), `-3` (180),
`renueva-tu-equipo-1-a` (191) y `test-renueva-tu-equipo-1` (240).

Ninguna otra landing cambia de comportamiento. Toda rama nueva queda detrás del gate.

### Fuera de alcance — explícito

- **El flujo del contrato no se toca.** Ocurre *después* de la página 1 y debe
  seguir idéntico.
- El paso resumen sigue siendo página aparte (`/solicitar/resumen`).
- `/complementos` (seguros) y el sub-flujo KYC no cambian.
- `/[landing]/solicitar/datos-personales` **sigue existiendo y funcionando**:
  hay deep links y el "Atrás" del resumen cae ahí.

## 3. Estado actual

### Config de flujo (`/public/landing/renueva-tu-equipo-1/solicitar-config`)

```
accessories       order 1  enabled
wizard_steps      order 2  enabled   envio_anticipado: { step: 1, enabled: true }
insurance         order 3  enabled
otp_verification  order 4  disabled
kyc               order 5  enabled   steps: contract(1, enabled), resto disabled
                                     firma.enabled: true
```

Consecuencias que condicionan el diseño:

1. `accessories.order < wizard_steps.order` ⇒ accesorios ya se pinta **inline en
   la intro** vía `sectionsBeforeWizard` (`useSolicitarFlow`), no en `/complementos`.
2. `envio_anticipado.step = 1` ⇒ **la solicitud se crea al cerrar el paso 1**,
   no al final. `enviaEnEstePaso` es `true` en `datos-personales`.
3. `kyc.contract` habilitado ⇒ el submit va con `conContrato: true` y
   `stayInWizard: true`, y de ahí sale el contrato.

### Orden actual de la intro (`solicitarClient.tsx`, 945 líneas)

```
Navbar
Producto seleccionado (+ accesorios/seguros elegidos + cuota total)
Info Cards           ← :708   (~1 minuto / 2 pasos / 100% Seguro)
Requirements         ← :731   ("Lo que necesitarás")
Secciones pre-wizard ← :762   (AccessoriesSection)
Términos y Condiciones
Cupón (condicional)
Banner de no disponibles
[ Comenzar Solicitud ] → router.push(/solicitar/datos-personales)
SelectedProductBar (fixed bottom-0, solo móvil)
```

`handleStart` valida, en este orden, con `scrollToSection` a la sección culpable:
no disponibles → cuota excedida → unificación de plazos → términos y privacidad →
cupón obligatorio → existencia de `firstStep`.

### El paso (`[stepSlug]/StepClient.tsx`, 1855 líneas)

Un único componente cubre paso regular, paso resumen y contrato. El paso regular
renderiza `<WizardLayout><DynamicWizardStep/></WizardLayout>`.

`WizardLayout` (182 líneas) es **chrome de página completa**: `min-h-screen`,
Navbar, `WizardProgress`, `SelectedProductBar`, `MotivationalCard` en columna
derecha. **No es embebible.**

`handleNext` → whitelist → `validateStep` → tracking → `markStepCompleted` →
`enviarYSeguir`, que llama a `submitApplication({ insuranceId: null, otpEnabled,
kycEnabled, stayInWizard, conContrato })` y navega al `nextStep`.

## 4. Diseño

### 4.1 Extraer el paso a un componente compartido

**El corte va por el cuerpo del paso y su máquina de estados, no por el chrome.**

Nuevos archivos en `components/solicitar/wizard/`:

- `usePasoDelWizard.ts` — el estado y los handlers.
- `PasoDelWizard.tsx` — el render del cuerpo (`DynamicWizardStep` + overlays).

**Se mueve desde `StepClient`:** `formValues`, `validateStep`, `handleNext`,
`enviarYSeguir`, el cableado de `useSubmitApplication`, `showCelebration` /
`StepSuccessMessage`, `showRefurbAcceptance` / `RefurbishedAcceptanceModal`,
`modalUnidadTomada`, `SubmitOverlay`, y el tracking de
`form_step_complete` / `form_step_validation_error`.

**Se queda en `StepClient`:** `WizardLayout`, Navbar/Footer, los redirects de
guardia, el paso resumen (`isSummaryStep`) y `ContratoEnWizard`.

API propuesta:

```ts
const paso = usePasoDelWizard({ stepSlug });
// → { step, handleNext, canProceed, isSubmitting, submitMessage, overlays, ... }
```

Tras la extracción `StepClient` renderiza
`<WizardLayout {...}><PasoDelWizard paso={paso}/></WizardLayout>` y **se comporta
igual que hoy**.

> **Por qué esto protege el contrato.** El submit queda en un único lugar. La
> intro no llama a `submitApplication` por su cuenta ni recalcula `conContrato`
> o `stayInWizard`: consume el mismo hook. Duplicar ese render habría dejado dos
> copias de la lógica de envío anticipado, y una de ellas se iba a desincronizar.

Los contextos no estorban: `ProductProvider`, `WizardConfigProvider` y
`WizardProvider` viven en `solicitar/layout.tsx`, o sea que envuelven **tanto la
intro como `[stepSlug]`**. No hace falta montar providers nuevos ni re-fetchear
la config del wizard.

### 4.2 La intro embebe el paso

En `solicitarClient.tsx`, con `esRenueva`:

```
Navbar
Producto seleccionado
▶ Accesorios (colapsable, cerrado)
── Formulario (paso único, 10 campos) ──
Términos y Condiciones
Cupón (condicional)
Banner de no disponibles
[ Continuar ]  ← fijo abajo en móvil
```

- Desaparece el botón **"Comenzar Solicitud"**.
- La acción es una sola, en dos tramos: **primero** las validaciones que la intro
  ya tiene (no disponibles → cuota → plazos → términos/privacidad → cupón, cada
  una con su `scrollToSection`); **si pasan**, el `handleNext` del paso
  (whitelist → campos → submit).
- Al enviar, el camino es el de siempre: `/solicitar/resumen`.

Sin `esRenueva`, `solicitarClient` no cambia en nada.

### 4.3 Accesorios colapsable

`AccessoriesSection` gana `colapsable?: boolean` (default `false`). Solo la intro
de `renueva-*` lo enciende; `/complementos` y el resto siguen expandidos.

- Arranca **cerrado**.
- **El loader queda visible con el bloque cerrado:** mientras `isLoading`, la
  cabecera del colapsable muestra el spinner en lugar del contador de
  seleccionados. El bloque no se abre solo al terminar de cargar.
- La cabecera cerrada muestra, cuando ya cargó, cuántos accesorios hay
  seleccionados, para que plegado no se lea como vacío.
- `setIsLoadingAccessories` sigue alimentando al padre igual que hoy: el CTA se
  deshabilita mientras carguen.

### 4.4 Quitar las tarjetas informativas

`{!esRenueva && ...}` sobre los dos bloques de `solicitarClient.tsx`:

- **`:708` Info Cards** — `~1 minuto` / `2 pasos` / `100% Seguro`.
- **`:731` Requirements** — `Lo que necesitarás`.

En `renueva-*` no aportan: el número de pasos que anuncian es justo el que este
cambio elimina de la pantalla.

### 4.5 Scroll al formulario al abrir

Hoy la intro llama `useScrollToTop()`. Con `esRenueva`, en su lugar hace scroll
al ancla del formulario **una vez montado el paso**, descontando
`--header-total-height` con el mismo cálculo que ya usa `scrollToSection`
(`getHeaderOffset`).

Esperar al montaje es necesario: scrollear antes de que `DynamicWizardStep`
pinte los 10 campos deja la posición mal calculada.

### 4.6 CTA fijo en móvil, **debajo** de la barra de producto

Hoy `SelectedProductBar` es `fixed bottom-0 z-40` (72 px) y `MobileStickyCta` se
apila **encima**. En `renueva-*` se invierte: el CTA va al borde inferior y la
barra de producto queda arriba de él.

```
│  ...formulario...          │
├────────────────────────────┤
│ [img] Laptop HP  S/239/mes │  ← SelectedProductBar (levantada)
├────────────────────────────┤
│      [ Continuar → ]       │  ← CTA pegado a bottom-0
└────────────────────────────┘
```

Requiere:

- prop `debajoDeLaBarra` en `MobileStickyCta` → `bottom-0`;
- prop de offset inferior en `SelectedProductBar` → se levanta el alto del CTA;
- el spacer de fondo reserva **barra + CTA**;
- se conservan los tres desmontajes actuales del CTA: drawer del producto
  expandido (`isProductBarExpanded`), teclado virtual
  (`useTecladoVirtualAbierto`) y celebración (`oculto`).

Solo con el gate encendido. El resto del flujo (pasos, resumen, complementos)
conserva el orden actual — CTA encima, barra debajo.

## 5. Riesgos

1. **La extracción (4.1) es lo peligroso.** `StepClient` tiene 1855 líneas y
   contiene el envío anticipado y el arranque del contrato. **Hoy no tiene tests
   a nivel de página**: de los 65 tests bajo `solicitar/`, ninguno monta el paso
   regular. Mitigación: escribir primero un test de caracterización de
   `handleNext` / `enviarYSeguir` (que verifique los flags del submit), y recién
   entonces mover código. La extracción debe ser un **movimiento puro**, sin
   cambios de comportamiento, en un commit propio.
2. **Doble acción en móvil.** Con el CTA fijo hay que asegurarse de que no se
   pinte además una navegación en flujo (en el wizard eso lo resuelve
   `ctaFijoEnMovil` de `WizardLayout`, que aquí no aplica porque la intro no usa
   `WizardLayout`).
3. **Orden de validaciones.** Si el formulario valida antes que los términos, el
   usuario ve errores de campos cuando lo que falta es un checkbox más abajo. El
   orden de 4.2 es deliberado.
4. **La suite del front está roja en `main`.** No sirve "toda la suite verde"
   como criterio; se corren los tests afectados por nombre.

## 6. Tests

- Caracterización de `handleNext`/`enviarYSeguir` **antes** de extraer: verifica
  que el submit sale con `conContrato`, `stayInWizard`, `kycEnabled`, `otpEnabled`
  y que navega al `nextStep`. Debe pasar igual antes y después del movimiento.
- Los tests existentes que tocan el wizard siguen verdes (`MobileStickyCta`,
  `ContratoEnWizard`, `WizardNavigation`, `solicitarClient.startButton`).
- Intro de `renueva-*`: monta el formulario; **no** monta las tarjetas info ni
  "Lo que necesitarás".
- Intro de una landing no-`renueva`: conserva "Comenzar Solicitud", las tarjetas
  y el orden actual.
- Colapsable: arranca cerrado; con `isLoading` muestra el loader en la cabecera.
- Móvil `renueva-*`: el CTA queda por debajo de la barra de producto; en una
  landing no-`renueva` el orden no cambia.
