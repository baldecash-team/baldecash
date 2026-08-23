# Landing especial "Equipos seminuevos" — Diseño

**Fecha:** 2026-08-23
**Diseño de origen:** `mobile-baldecash.html` (Haru), Google Drive
**Repos involucrados:** `baldecash` (implementación), `admin2` (gestión de FAQ/footer/navbar), `ws2` (endpoints ya existentes)

---

## 1. Objetivo

Implementar el **index** de una nueva landing especial de equipos seminuevos, fiel al prototipo de Haru,
siguiendo el patrón de landings hardcodeadas que ya existe en el repo (NVIDIA, MacBook Neo, Zona Gamer).

## 2. Alcance

### Dentro

- El **index** de la landing (`/{slug}`): hero, inspector "¿Qué es un equipo seminuevo?", proceso,
  sobre nosotros, FAQ, footer y botón flotante de WhatsApp.
- El botón "Ver catálogo" en el header genérico, condicionado por landing id.
- La rama de detección en el index **y en el preview del admin**.

### Fuera

- **Catálogo y detalle de producto**: se usan los genéricos que ya existen, sin modificación.
- **Pricing**: no se calcula ni se muestra ninguna cuota en esta landing.
- **Grados A/B/C como dato**: son contenido visual únicamente. No filtran productos, no cambian precios,
  no viajan al flujo de solicitud.
- **Endpoints nuevos**: ninguno. La landing consume `/hero` (que ya trae las FAQ y el footer) y nada más.

## 3. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Alcance | Solo el index; catálogo y detalle son los genéricos |
| Grados A/B/C | Contenido visual (inspector + FAQ). Sin impacto en datos |
| Header | Navbar genérico + condicional por landing id que agrega el CTA "Ver catálogo" |
| CTA en subpáginas | Solo en el home; oculto en catálogo y detalle |
| Footer | `components/hero/Footer.tsx` compartido, sin cambios |
| Suscripción | La que ya trae el Footer (`POST /newsletter/subscribe`), gestionable desde admin2 |
| FAQ | Datos de BD (`landing_faq`), diseño de acordeón del prototipo |
| Desktop | Igual que el prototipo: columna centrada por `max-width`, sin diseño propio |
| Landing id | Constante provisional en `utils/landingIds.ts`, se cambia un número cuando llegue el real |
| Hero | Slot para el banner de Haru, con las 4 laptops SVG del prototipo como fallback |
| Inspector | Componente completo con 24 slots a S3 + placeholder |
| Sobre nosotros | Textos, SBS y redes en código; foto del equipo como slot |
| WhatsApp | Botón flotante fiel al prototipo |

---

## 4. Arquitectura

### 4.1 Patrón elegido

De los tres precedentes del repo, se copia **NVIDIA**: contenido estático centralizado en un archivo
`data/`, `footerData` recibido por props (sin fetch propio), footer compartido.

| Patrón | Ejemplo | Por qué no |
|---|---|---|
| Variante de página | `copia-home` | Solo cambia catálogo/detalle; acá el home es distinto |
| **Landing especial con data file** | **NVIDIA** | **Elegido** |
| Landing autónoma con fetch propio | Zona Gamer | Duplica fetches que `LandingPageClient` ya hizo |

### 4.2 Puntos de integración

1. **`src/app/prototipos/0.6/utils/landingIds.ts`**

   ```ts
   export const LANDING_IDS = {
     MACBOOK_NEO: 150,
     ZONA_GAMER: 136,
     NVIDIA: 168,
     SEMINUEVOS: 999, // provisional — reemplazar por el id real
   } as const;
   ```

2. **`src/app/prototipos/0.6/[[...slug]]/LandingPageClient.tsx`** (~línea 471, junto a la rama NVIDIA)

   Rama nueva: si `heroData?.landingId === LANDING_IDS.SEMINUEVOS`, renderiza `<SeminuevosLanding>`
   con `footerData`, `landing`, `previewBannerOffset` y `promoBannerData`, dentro del wrapper que
   publica `--color-primary` / `--color-secondary`.

3. **`src/app/prototipos/0.6/preview/[[...id]]/PreviewPageClient.tsx`** (~línea 385)

   La rama equivalente. **Hoy este archivo solo contempla MacBook Neo**, y por eso NVIDIA y Zona Gamer
   se ven como landing genérica en el preview del admin. Se agrega desde el arranque para que la
   landing sea revisable por Haru y por negocio antes de publicar.

4. **`src/app/prototipos/0.6/components/hero/Navbar.tsx`**

   Prop opcional `landingId` + condicional que agrega el CTA "Ver catálogo". Detalle en §6.

### 4.3 Archivos nuevos

```
src/app/prototipos/0.6/components/product-landing/seminuevos/
├── SeminuevosLanding.tsx          orquestador (patrón ZonaGamerLanding: delgado)
├── data/seminuevosData.ts         todo el contenido estático + URLs de S3
├── SeminuevosHero.tsx
├── SeminuevosInspector.tsx        la pieza más grande (§5.2)
├── SeminuevosProceso.tsx
├── SeminuevosAbout.tsx
├── SeminuevosFaq.tsx              datos de BD, diseño de Haru
├── SeminuevosWhatsapp.tsx
└── icons/                         los SVG procedurales del prototipo, como componentes
```

Cada componente es una sección independiente: recibe sus datos por props desde el orquestador y no
conoce a sus hermanos. El orquestador es el único que sabe qué viene de BD y qué de `seminuevosData.ts`.

---

## 5. Las secciones

Orden de render en `SeminuevosLanding`:

| # | Sección | Datos | Assets de Haru |
|---|---|---|---|
| 1 | Hero | `seminuevosData` | Banner (slot) + 4 laptops SVG de fallback |
| 2 | Inspector | `seminuevosData` | **24 slots** (8 piezas × 3 grados) |
| 3 | Proceso | `seminuevosData` | Iconos SVG portados |
| 4 | Sobre nosotros | `seminuevosData` | Foto del equipo (slot) |
| 5 | FAQ | **BD** (`heroData.faqData`) | — |
| 6 | Footer + suscripción | **BD** (`footerData`) | — |
| 7 | WhatsApp flotante | Config de empresa | — |

Las secciones 3 a 6 van envueltas en `LazySection` (`IntersectionObserver` con `rootMargin: '200px'`),
igual que NVIDIA y MacBook Neo.

### 5.1 Hero

Copy verbatim del prototipo:

- Eyebrow: **"Exclusivo"** (aqua, uppercase, `letter-spacing: 2px`)
- H1: **"Equipos seminuevos en cuotas sin intereses"** (`clamp(30px, 8vw, 50px)`, weight 800)
- Subtítulo: **"Elige el modelo y fináncialo en BaldeCash."**
- CTA: **"Ver catálogo"** → `/{slug}/catalogo`

Fondo `linear-gradient(180deg, #fdfdff, #e9ebf3)`, `min-height: calc(100svh - 65px)`.

**Slot de banner:** si `seminuevosData.hero.bannerUrl` está definido, se pinta esa imagen. Si no, se
pintan las 4 laptops SVG del prototipo (`.lap1` gris `#d9dbe2` rotada -3°, `.lap2` rosa `#e6c3cc` a 8°,
`.lap3` amarilla `#d9d987` a -8°, `.lap4` azul `#6b6fce` a 4°) con la máscara radial blanca que
garantiza la legibilidad del texto encima.

Esto permite trabajar y revisar la landing sin esperar assets.

### 5.2 Inspector — "¿Qué es un equipo seminuevo?"

La pieza más grande y la que más assets requiere.

- H2: **"¿Qué es un equipo seminuevo?"** (con "seminuevo?" en `--azul`)
- Subtítulo: **"Es un equipo de segunda mano que ha sido revisado y probado para volver a estar listo para ti."**

**Matriz de dos ejes: 8 piezas × 3 grados = 24 estados.**

```
Piezas: Carcasa · Mousepad · Pantalla · Teclado · Entradas · Cámara · Bisagras · Batería
Grados: A · B · C
```

Anatomía de la tarjeta (blanca, `border-radius: 20px`, sombra estándar):

```
┌─ insp-card ─────────────────────────────────────────┐
│ ┌ pills de grado ─┐  ┌ imagen de la pieza ─────────┐│
│ │ ○ Grado A  [on] │  │  <img> del slot             ││
│ │ ○ Grado B       │  │  badge: "Pantalla · Grado B"││
│ │ ○ Grado C       │  └─────────────────────────────┘│
├─ tabs de pieza (scroll horizontal, 8 pills) ────────┤
├─ ‹ Anterior        3 / 8        Siguiente ›  ───────┤
└──────────────────────────────────────────────────────┘
```

**Comportamiento:**

- Click en pill de grado o en tab de pieza → cambia la imagen y el badge.
- Anterior/Siguiente → navegación **circular** sobre las 8 piezas.
- Tras cada cambio, el strip de tabs **auto-centra la tab activa**. En React se resuelve con un
  `useEffect` + `scrollIntoView({ inline: 'center', block: 'nearest' })`. El prototipo lo hacía
  recalculando `scrollLeft` porque reescribía el DOM entero en cada click; con estado de React el
  scroll no se pierde y el centrado es una sola línea.

**Convención de assets en S3:**

```
https://baldecash.s3.amazonaws.com/landings/seminuevos/inspector/{pieza}-{grado}.webp
ej. carcasa-a.webp, pantalla-b.webp, teclado-c.webp
```

Mientras un archivo no exista, se muestra un placeholder con el gradiente
`linear-gradient(160deg, #f7f7fb, #ececf4)` del prototipo. Cuando Haru entregue los 24 archivos,
**se suben a S3 y no se toca código**.

Si Haru entrega video en lugar de imagen para alguna pieza, el slot acepta ambos: la extensión del
archivo en `seminuevosData` determina si se renderiza `<img>` o `<video muted loop playsInline>`.

### 5.3 Proceso — "¿Cómo es el proceso?"

Tres tarjetas en fila (icono 48×48 sobre `--lavanda` + título + subtítulo):

| Icono | Título | Subtítulo |
|---|---|---|
| Lupa | "Explora el catálogo" | "Encuentra el modelo que más te guste" |
| Etiqueta | "Selecciona el modelo ideal" | "Elige el grado y cuota que más se te acomode" |
| Documento | "Completa tus datos" | "Llena un formulario de 2 minutos" |

Debajo, el banner de aprobación (fondo `linear-gradient(160deg, #e6f9f8, #eef0fc)`, borde `#cdeef0`):

> "Cuando tu solicitud se apruebe, accederás a **videos de cada unidad disponible** y podrás elegir
> exactamente cuál quieres recibir."

Cierra con el CTA "Ver catálogo" (gradiente `#5a63e0 → #03DBD0`, `border-radius: 30px`).

### 5.4 Sobre nosotros

- H2: **"Sobre nosotros"**
- Párrafo: "BaldeCash ofrece financiamiento a estudiantes universitarios para acceder a equipos
  tecnológicos claves para su crecimiento académico y personal."
- **Foto del equipo:** slot (`aspect-ratio: 16/10`, `border-radius: 18px`). Placeholder: el gradiente
  `linear-gradient(150deg, #3a44b8, #6a5fe0)` con las siluetas del prototipo.
- Sello SBS: "Registrados en: SBS · Superintendencia de Banca, Seguros y AFP"
- Cuatro redes (en `seminuevosData`, con `target="_blank" rel="noopener"`):
  Instagram `@baldecash` · Facebook `@baldecash` · TikTok `@baldecash_2026` · WhatsApp `958823053`

### 5.5 FAQ

**Datos de BD, diseño de Haru.** Las preguntas salen de `heroData.faqData` (tabla `landing_faq`,
gestionable desde admin2) y se pintan con el acordeón del prototipo:

- `<h2>Preguntas frecuentes</h2>`
- Acordeón **no exclusivo**: pueden quedar varios abiertos a la vez.
- Chevron que rota 180° al abrir.
- Transición de altura: se usa `grid-template-rows: 0fr → 1fr` en vez del `max-height: 0 → 420px` del
  prototipo, que **corta el contenido** cuando una respuesta es más larga que el máximo. Dos de las
  cinco respuestas del prototipo están cerca de ese límite, y las de BD son de largo libre.

Si `faqData` viene vacío o nulo, la sección no se renderiza.

**Nota de configuración:** en el flujo genérico, la sección FAQ solo se activa si además existe un item
de navbar apuntando a `faq` (`landingApi.ts:592-612`). Como acá la leemos directo de `heroData.faqData`,
ese gate no aplica — pero conviene saberlo al configurar la landing en admin2.

**Contenido de referencia** (las 5 preguntas del prototipo, para cargar en BD): elegir el equipo que se
recibirá · si las fotos del catálogo corresponden · si dos equipos del mismo grado difieren · recojo
presencial · garantía. El PDF de políticas, hoy embebido como data URI en el prototipo, debe subirse a
S3 y referenciarse por URL en la respuesta correspondiente.

### 5.6 Footer y suscripción

`components/hero/Footer.tsx` **sin modificación**, con `data={footerData}` y `landing={slug}`.

Ya trae dentro:

- La franja de suscripción por WhatsApp (`POST {API}/newsletter/subscribe`, body `{ phone, landing_slug }`,
  validación `/^9\d{8}$/`).
- Se apaga desde el componente `footer` de la landing en BD (`newsletter.enabled`), como pediste.
- Columnas, tagline, SBS, copyright, redes, teléfono, dirección y libro de reclamaciones.

### 5.7 WhatsApp flotante

Botón verde `#25D366`, 56×56, `position: fixed; right: 18px; bottom: 18px`, sombra
`0 8px 22px rgba(37, 211, 102, .5)`. El número sale de la config de empresa que ya usa el footer.

---

## 6. Header

**Un solo componente: el Navbar genérico**, con el cambio más chico posible.

### 6.1 La prop `landingId`

Hoy `NavbarProps` recibe `landing` (el **slug**) pero **no conoce el `landingId`** — no aparece en
ninguna parte del archivo. Como el condicional debe ser por id (los slugs son editables en admin2), se
agrega una prop **opcional**:

```ts
/** Landing id para detección de variantes. Opcional: los call sites que no la
 *  pasen renderizan el navbar exactamente como siempre. */
landingId?: number;
```

Es aditiva: al ser opcional, ningún call site existente se rompe. Los que sí la pasan son los que ya
tienen el dato a mano:

| Call site | De dónde saca el id |
|---|---|
| `[[...slug]]/LandingPageClient.tsx` (index) | `heroData.landingId` |
| `preview/[[...id]]/PreviewPageClient.tsx` | el id de la URL |

El catálogo, el detalle y `/solicitar` **no** necesitan pasarla: el CTA va solo en el home, así que
ahí la prop queda `undefined` y el navbar se comporta como siempre.

### 6.2 El CTA

Se agrega un CTA "Ver catálogo" que aparece **solo** cuando:

1. `landingId === LANDING_IDS.SEMINUEVOS`, **y**
2. estamos en el index de la landing — lo cual se cumple solo, porque las subpáginas no pasan la prop.

Estilo: gradiente `linear-gradient(135deg, #5a63e0, #03DBD0)`, `border-radius: 30px`,
`padding: 10px 18px`, weight 600, 14px. Destino: `/{slug}/catalogo`.

Todo lo demás del Navbar queda **intacto**: items de BD, mega-menú, buscador, carrito, banner
promocional y la publicación de `--header-total-height` / `--promo-banner-height`.

**Por qué así y no un header propio:** el catálogo y el detalle genéricos —que sí vamos a usar— ya
montan este Navbar, así que heredan el header sin trabajo extra. Un header propio obligaría a duplicar
785 líneas o a mantener dos headers distintos en la misma landing. Y al ser un archivo compartido por
todas las landings, cuanto menos condicional se le agregue, menor el riesgo de regresión.

---

## 7. Estilos

### 7.1 Tokens (del `:root` de Haru)

```css
--azul: #4654CD;      /* primario: CTAs, precios, acentos */
--azul2: #5a63e0;     /* hover, gradientes */
--aqua: #03DBD0;      /* secundario: eyebrow, badges */
--navy: #151744;      /* texto base */
--lavanda: #EEF0FC;   /* fondos suaves de chips e iconos */
--borde: #E8E8EE;
--tenue: #8A8A99;     /* texto secundario */
--sombra: 0 8px 24px rgba(21, 23, 68, .07);
```

Se descartan `--hero1/2/3` (del hero v1, muerto) y `--negro` (sin uso).

Colores frecuentes fuera del `:root`, que conviene tokenizar: `#5b5c6b` (texto de párrafo, ~40 usos),
`#3a3c52`, `#f0f1f4`, `#9a9aa8`, `#25D366`, `#04413e`.

### 7.2 Tipografía

**Baloo 2**, pesos 400/500/600/700/800, vía `next/font/google`. Ya la usa NVIDIA, así que el patrón
existe en el repo.

La escala del prototipo usa medios puntos con frecuencia (`13.5px`, `14.5px`, `12.5px`, `11.5px`) —
se aplican como valores arbitrarios de Tailwind donde correspondan.

### 7.3 Scoping

Clase raíz `.seminuevos-landing`, como hace Zona Gamer, para que la fuente y los estilos no se filtren
al resto del sitio.

### 7.4 Responsive

Mobile-first fiel al prototipo. La adaptación a pantallas grandes se hace por `max-width` + `margin: 0 auto`
+ `clamp()`, no por breakpoints:

| Contenedor | max-width |
|---|---|
| Hero | 600px |
| Inspector, proceso, sobre nosotros | 720px |
| Header (heredado del Navbar) | — |

No se inventa un layout de escritorio. Si más adelante Haru entrega uno, se agrega.

### 7.5 Accesibilidad

Se conserva lo que el prototipo ya contempla: `prefers-reduced-motion`, `aria-label` en botones de
icono, y `100svh` en vez de `100vh` (importante en móvil con la barra del navegador).

---

## 8. Lo que NO se porta

El HTML de Haru acumula **tres generaciones de diseño superpuestas**: aproximadamente el **60% del CSS
es código muerto**, estilos de secciones que ya no existen en el DOM.

Se implementa **solo el DOM vivo**. Concretamente se descartan:

- El hero v1 completo (`.hero`, `.bubble`, `.devices`, animaciones `fl1/fl2/fl3`, `bob`).
- Las secciones `.como`, `.carousel`, `.grados-sec`, `.garantia-sec`, `.qbc`, `.conoce`, `.convenios`,
  `.valueprop`, `.cat-trust`.
- Referencias rotas del prototipo: `#gradeCard`, `#gradePills`, `#carousel`, `#que-es`, `#vList`, `#vGrid`.
- Todo lo de catálogo y detalle, por estar fuera de alcance.

Los datos JS muertos (`GRADO_SPECS`, `CONDICION`, `INCLUYE`, `GRADOS_HOME`, `GRADO_TABLA`) tampoco se
portan. Se dejan documentados acá por si negocio los quiere más adelante: son funcionalidad diseñada y
completa, no descartada por error.

---

## 9. Pendientes de negocio (no bloquean el desarrollo)

1. **Garantía por grado:** la FAQ del prototipo dice A=6, B=6, C=2 meses; los datos del mismo archivo
   dicen 8/6/3. Como la FAQ ahora viene de BD, se resuelve cargando el texto correcto — pero alguien
   tiene que decidir cuál es.
2. **"Cuotas sin intereses"** en el hero. El prototipo calculaba con TEA 15%. Con el pricing fuera de
   alcance no nos afecta técnicamente, pero es copy que conviene validar antes de publicar.
3. **Assets de Haru:** 24 imágenes/videos del inspector, el banner del hero y la foto del equipo.
   La landing es funcional y revisable sin ellos.

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El landing id real cambia | Un único número en `landingIds.ts` |
| Los assets de Haru se demoran | Slots con placeholder; la landing funciona sin ellos |
| Tocar `Navbar.tsx` rompe otras landings | La prop `landingId` es opcional y el condicional aditivo: sin esa prop el navbar renderiza exactamente como hoy. Se verifica contra las demás landings (§11) |
| Respuestas de FAQ largas se cortan | `grid-template-rows` en vez de `max-height` fijo |
| Assets servidos desde `public/` | Regla del repo: van a S3. Servir desde `public/` ya dejó una landing sin logo en producción (BAL-2598) |
| La landing no se ve en el preview del admin | Se agrega la rama en `PreviewPageClient.tsx` desde el arranque |

---

## 11. Verificación

- La landing renderiza en `/{slug}` con el id provisional configurado en local.
- Las 6 secciones aparecen en orden y el footer trae la franja de suscripción.
- El inspector recorre las 8 piezas y los 3 grados, con la tab activa siempre centrada y la navegación
  circular en ambos extremos.
- El CTA "Ver catálogo" aparece en el index y **no** en el catálogo ni en el detalle.
- El catálogo y el detalle genéricos siguen funcionando igual que antes en esta y en las demás landings.
- El header de las otras landings (home, NVIDIA, Zona Gamer, un convenio) no cambia.
- La FAQ refleja lo que hay en BD, y desaparece si no hay preguntas cargadas.
- La landing se ve correctamente en el preview del admin.
- Se revisa en viewport móvil como criterio principal, y se confirma que en escritorio queda centrada
  sin romperse.
