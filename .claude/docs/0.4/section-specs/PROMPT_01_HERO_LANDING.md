# Prompt #1: Hero Section / Landing - BaldeCash Web 4.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | A |
| **Preguntas totales** | 21 |
| **Iteraciones T (10 versiones)** | 13 |
| **Iteraciones F (1 version)** | 8 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto del Proyecto

### 1.1 Descripcion General
BaldeCash es una fintech peruana que proporciona financiamiento de laptops y equipos electronicos exclusivamente para estudiantes universitarios sin acceso a sistemas bancarios tradicionales. La empresa cuenta con convenios con 32 instituciones educativas y ha financiado mas de 10,000 laptops.

### 1.2 Publico Objetivo
- Estudiantes universitarios peruanos (18-28 anos)
- Sin historial crediticio bancario
- Segmentos socioeconomicos B y C
- 80% trabaja de manera informal o en servicios
- 64% accede desde dispositivos moviles
- Conectividad variable (3G/4G intermitente)

### 1.3 Insights UX/UI del Researcher
- **Mobile-First obligatorio**: 64% del e-commerce en Peru es movil
- **Alta ansiedad crediticia**: Primera experiencia con financiamiento
- **Benchmark LATAM**: Kueski, Nubank, Addi como referencia
- **Cuota prominente**: Estudiantes piensan en cuotas, no precio total
- **KPI objetivo**: Tasa de completitud del ~4% actual a >70%

---

## 2. Stack Tecnologico

```json
{
  "framework": "Next.js 14+ (App Router)",
  "language": "TypeScript",
  "ui_library": "@nextui-org/react v2.6.11",
  "icons": "lucide-react v0.556.0",
  "styling": "Tailwind CSS v4",
  "animations": "framer-motion v12.23.25"
}
```

---

## 3. Guia de Marca

### 3.1 Colores
```css
/* Color Primario - OBLIGATORIO */
--brand-primary: #4654CD;
--brand-accent: #03DBD0;

/* Estados */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Neutros */
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;
```

### 3.2 Tipografias
```css
/* Titulos y headings */
font-family: 'Baloo 2', cursive;
font-weight: 600-700;

/* Cuerpo de texto y UI */
font-family: 'Asap', sans-serif;
font-weight: 400-600;
```

### 3.3 Restricciones de Diseno

| Restriccion | Implementacion |
|-------------|----------------|
| NO emojis | Usar `lucide-react` para iconos SVG minimalistas |
| NO gradientes agresivos | Colores solidos o gradientes muy sutiles |
| Imagenes externas | Usar `<img>` nativo, NO NextUI Image para URLs CDN |

---

## 4. Estructura de Archivos a Generar (10 versiones)

```
src/app/prototipos/0.4/hero/
├── page.tsx                              # Redirecciona a hero-preview
├── hero-preview/
│   └── page.tsx                          # Pagina con settings modal + preview
├── hero-v1/ ... hero-v10/
│   └── page.tsx                          # Demo version X standalone
├── components/
│   └── hero/
│       ├── HeroSection.tsx               # Componente wrapper principal
│       ├── HeroSettingsModal.tsx         # Modal de seleccion (10 opciones)
│       ├── banner/
│       │   ├── HeroBannerV1.tsx          # Foto Producto
│       │   ├── HeroBannerV2.tsx          # Foto Lifestyle
│       │   ├── HeroBannerV3.tsx          # Ilustracion Flat
│       │   ├── HeroBannerV4.tsx          # Abstracto Flotante
│       │   ├── HeroBannerV5.tsx          # Split 50/50
│       │   ├── HeroBannerV6.tsx          # Centrado Hero
│       │   ├── HeroBannerV7.tsx          # Asimetrico Bold
│       │   ├── HeroBannerV8.tsx          # Data-Driven
│       │   ├── HeroBannerV9.tsx          # Storytelling
│       │   └── HeroBannerV10.tsx         # Interactivo
│       ├── social-proof/
│       │   └── SocialProofV1-V10.tsx
│       ├── navigation/
│       │   └── NavbarV1-V10.tsx
│       ├── cta/
│       │   └── HeroCtaV1-V10.tsx
│       └── footer/
│           └── FooterV1-V10.tsx
├── types/
│   └── hero.ts
└── data/
    └── mockHeroData.ts
```

---

## 5. Componente Principal: Hero Banner [ITERAR - 10 versiones]

### Pregunta A.1: Que elemento debe dominar el hero?

**10 Versiones Detalladas:**

---

### V1: Foto Producto (E-commerce Clasico)

**Concepto**: Laptop sobre fondo blanco/neutro, estilo catalogo profesional

**Elementos visuales**:
- Fondo: `bg-neutral-50` o `bg-white`
- Imagen: Laptop en angulo 3/4, iluminacion de estudio, sin sombras duras
- Texto: A la izquierda del producto
- Badge precio: Chip solido `bg-[#4654CD]` con "Desde S/49/mes"

**Layout**:
```
[  TEXTO    |    LAPTOP    ]
[  Titulo   |   (imagen)   ]
[  CTA      |              ]
```

**Codigo clave**:
```tsx
<div className="grid md:grid-cols-2 gap-8 items-center min-h-[60vh] bg-neutral-50">
  <div className="space-y-6 p-8">
    <h1 className="font-['Baloo_2'] text-4xl md:text-5xl font-bold text-neutral-800">
      Tu laptop para estudiar
    </h1>
    <Chip className="bg-[#4654CD] text-white text-lg px-4 py-2">
      Desde S/49/mes
    </Chip>
    <Button size="lg" className="bg-[#4654CD]">Ver laptops</Button>
  </div>
  <div className="relative">
    <img src="/laptop-product.png" className="w-full max-w-lg mx-auto" />
  </div>
</div>
```

**Referencia**: Amazon, Best Buy, Mercado Libre

---

### V2: Foto Lifestyle (Aspiracional)

**Concepto**: Estudiante real usando laptop en ambiente universitario

**Elementos visuales**:
- Fondo: Imagen fullwidth de estudiante en biblioteca/cafe
- Overlay: Gradiente oscuro desde la izquierda `bg-gradient-to-r from-black/70`
- Texto: Blanco sobre el overlay, alineado izquierda
- Trust badges: Iconos blancos con fondo semi-transparente

**Layout**:
```
[IMAGEN FULLWIDTH CON ESTUDIANTE]
[  Overlay oscuro izquierda    ]
[  Titulo blanco               ]
[  Subtitulo                   ]
[  CTA                         ]
```

**Codigo clave**:
```tsx
<div className="relative min-h-[70vh]">
  <img src="/student-library.jpg" className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
  <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
    <h1 className="text-white text-5xl font-bold max-w-xl">
      Empieza tu carrera con la herramienta correcta
    </h1>
    <p className="text-white/80 text-xl mt-4">Financiamiento sin historial crediticio</p>
  </div>
</div>
```

**Referencia**: Apple Education, Samsung, universidades

---

### V3: Ilustracion Flat (Corporativo Moderno)

**Concepto**: Vectores estilizados, personajes ilustrados, estilo Notion/Linear

**Elementos visuales**:
- Fondo: Color solido claro `bg-[#EEF2FF]` (primary-50)
- Ilustracion: Personaje vectorial estudiante con laptop, estilo flat
- Paleta limitada: Primario + 2 acentos
- Lineas limpias, sin sombras

**Layout**:
```
[  TEXTO           |  ILUSTRACION  ]
[  Titulo          |  (vector)     ]
[  Bullets         |               ]
[  CTA             |               ]
```

**Codigo clave**:
```tsx
<div className="grid md:grid-cols-2 gap-8 items-center min-h-[60vh] bg-[#EEF2FF]">
  <div className="space-y-6 p-8">
    <h1 className="font-['Baloo_2'] text-4xl font-bold text-[#4654CD]">
      Financiamiento estudiantil
    </h1>
    <ul className="space-y-3">
      <li className="flex items-center gap-2">
        <Check className="text-[#03DBD0]" /> Sin historial crediticio
      </li>
    </ul>
  </div>
  <div>
    <img src="/illustration-student.svg" className="w-full max-w-md mx-auto" />
  </div>
</div>
```

**Referencia**: Notion, Linear, Stripe

---

### V4: Abstracto Flotante (Fintech Moderna)

**Concepto**: Shapes geometricos, elementos 3D sutiles, precio flotante, micro-animaciones

**Elementos visuales**:
- Fondo: Primario solido `bg-[#4654CD]`
- Elementos flotantes: 3-5 circulos/blobs en tonos claros con blur
- Badge precio: Card blanca flotante con sombra grande, posicion top-right
- Laptop: Flotando con sombra difusa
- Animaciones: Parallax suave en elementos, float en laptop

**Layout**:
```
[      SHAPES FLOTANTES          ]
[  Titulo      |  LAPTOP         ]
[  blanco      |  flotante       ]
[  CTA         |     [S/49]      ]
```

**Codigo clave**:
```tsx
<div className="relative min-h-[70vh] bg-[#4654CD] overflow-hidden">
  {/* Floating shapes */}
  <motion.div
    className="absolute top-20 right-20 w-40 h-40 rounded-full bg-white/10 blur-xl"
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 4, repeat: Infinity }}
  />
  <motion.div
    className="absolute bottom-40 left-10 w-60 h-60 rounded-full bg-[#03DBD0]/20 blur-2xl"
  />

  {/* Price badge floating */}
  <motion.div
    className="absolute top-32 right-16 bg-white rounded-2xl shadow-2xl p-6 z-20"
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 3, repeat: Infinity }}
  >
    <p className="text-neutral-500 text-sm">Desde</p>
    <p className="text-4xl font-bold text-[#4654CD]">S/49<span className="text-lg">/mes</span></p>
  </motion.div>

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-white">
    <h1 className="text-5xl font-bold">Tu laptop para estudiar</h1>
  </div>

  {/* Floating laptop */}
  <motion.img
    src="/laptop-floating.png"
    className="absolute right-20 bottom-0 w-96 drop-shadow-2xl"
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 5, repeat: Infinity }}
  />
</div>
```

**Referencia**: Nubank, Revolut, N26

---

### V5: Split 50/50 (Equilibrado)

**Concepto**: Pantalla dividida verticalmente, texto izquierda + visual derecha

**Elementos visuales**:
- Izquierda: Fondo blanco, contenido alineado
- Derecha: Fondo primario o imagen
- Division clara, sin overlap
- Trust signals debajo del CTA

**Layout**:
```
[  BLANCO      |  PRIMARIO     ]
[  Titulo      |  Imagen/      ]
[  Subtitulo   |  Ilustracion  ]
[  CTA + trust |               ]
```

**Codigo clave**:
```tsx
<div className="grid md:grid-cols-2 min-h-[70vh]">
  <div className="flex flex-col justify-center p-12 bg-white">
    <h1 className="text-4xl font-bold text-neutral-800">Tu laptop para estudiar</h1>
    <p className="text-neutral-600 mt-4">Financiamiento sin historial crediticio</p>
    <Button className="mt-8 bg-[#4654CD] w-fit">Ver laptops</Button>
    <div className="flex gap-4 mt-6">
      <Chip variant="flat"><Shield /> SBS</Chip>
      <Chip variant="flat"><Clock /> 24h</Chip>
    </div>
  </div>
  <div className="bg-[#4654CD] flex items-center justify-center">
    <img src="/laptop.png" className="w-4/5" />
  </div>
</div>
```

**Referencia**: Webflow, Framer, Linear

---

### V6: Centrado Hero (Impacto Maximo)

**Concepto**: Todo centrado, titulo grande, CTA prominente, visual arriba o como fondo

**Elementos visuales**:
- Fondo: Neutro claro o imagen desenfocada
- Titulo: Centrado, muy grande (6xl+)
- Subtitulo: Centrado debajo
- CTA: Centrado, grande
- Visual: Arriba del texto o como fondo sutil

**Layout**:
```
[        IMAGEN PRODUCTO         ]
[                                ]
[      TITULO GRANDE CENTRADO    ]
[         Subtitulo              ]
[           [CTA]                ]
[        trust badges            ]
```

**Codigo clave**:
```tsx
<div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-neutral-50">
  <img src="/laptop-hero.png" className="w-80 mb-8" />
  <h1 className="font-['Baloo_2'] text-5xl md:text-7xl font-bold text-neutral-800">
    Tu laptop para estudiar
  </h1>
  <p className="text-xl text-neutral-600 mt-4 max-w-2xl">
    Financiamiento para estudiantes sin historial crediticio. Aprobacion en 24 horas.
  </p>
  <Button size="lg" className="mt-8 bg-[#4654CD] text-lg px-12">
    Ver laptops desde S/49/mes
  </Button>
</div>
```

**Referencia**: Spotify, Netflix, Apple

---

### V7: Asimetrico Bold (Disruptivo)

**Concepto**: Tipografia oversized, elementos que se salen del grid, overlapping intencional

**Elementos visuales**:
- Titulo: Muy grande, puede cortar en el borde
- Imagen: Parcialmente fuera del contenedor, rotada sutilmente
- Espacios negativos intencionales
- Precio: Badge que hace overlap entre secciones

**Layout**:
```
[TIT                             ]
[ULO      [LAPTOP rotada]        ]
[GRA               sale del      ]
[NDE               contenedor    ]
[         [S/49]                 ]
[  CTA            trust          ]
```

**Codigo clave**:
```tsx
<div className="relative min-h-screen overflow-hidden bg-white">
  <h1 className="font-['Baloo_2'] text-[8rem] md:text-[12rem] font-bold text-neutral-800 leading-none -ml-4">
    TU<br/>LAPTOP
  </h1>
  <div className="absolute right-0 top-20 w-1/2">
    <img
      src="/laptop.png"
      className="w-full transform rotate-6 translate-x-20"
    />
  </div>
  <div className="absolute bottom-20 left-12">
    <Button size="lg" className="bg-[#4654CD]">Ver catalogo</Button>
  </div>
  <div className="absolute bottom-40 right-40 bg-[#03DBD0] text-white p-6 rounded-2xl">
    <p className="text-3xl font-bold">S/49/mes</p>
  </div>
</div>
```

**Referencia**: Airbnb rebrand, Figma, Pitch

---

### V8: Data-Driven (Confianza por Numeros)

**Concepto**: Numeros grandes, contadores animados, estadisticas prominentes

**Elementos visuales**:
- Metricas grandes: "10,000+ laptops", "32 convenios", "24h aprobacion"
- Contadores animados con framer-motion
- Badges de confianza prominentes
- Cuota en formato destacado

**Layout**:
```
[  TITULO                        ]
[  [10,000+] [32]    [24h]       ]
[  laptops   convenios aprobacion]
[                                ]
[  CUOTA GRANDE: S/49/mes        ]
[  CTA                           ]
```

**Codigo clave**:
```tsx
<div className="min-h-[70vh] bg-white py-20">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-4xl font-bold text-center mb-12">
      Financiamiento estudiantil en Peru
    </h1>
    <div className="grid grid-cols-3 gap-8 mb-12">
      <div className="text-center">
        <motion.p
          className="text-6xl font-bold text-[#4654CD]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          10,000+
        </motion.p>
        <p className="text-neutral-600">laptops financiadas</p>
      </div>
      <div className="text-center">
        <p className="text-6xl font-bold text-[#03DBD0]">32</p>
        <p className="text-neutral-600">convenios educativos</p>
      </div>
      <div className="text-center">
        <p className="text-6xl font-bold text-[#22c55e]">24h</p>
        <p className="text-neutral-600">tiempo de aprobacion</p>
      </div>
    </div>
    <div className="text-center">
      <p className="text-2xl text-neutral-500">Cuotas desde</p>
      <p className="text-7xl font-bold text-[#4654CD]">S/49<span className="text-3xl">/mes</span></p>
    </div>
  </div>
</div>
```

**Referencia**: Fintech dashboards, Stripe metrics

---

### V9: Storytelling (Narrativa Emocional)

**Concepto**: Timeline del journey estudiantil, testimonios integrados, copy emocional

**Elementos visuales**:
- Historia en pasos: "Elige -> Solicita -> Recibe -> Estudia"
- Testimonio destacado con foto
- Copy emocional y personal
- Progresion visual de izquierda a derecha

**Layout**:
```
[  "De estudiante sin laptop     ]
[   a profesional exitoso"       ]
[                                ]
[  [1]---[2]---[3]---[4]         ]
[  Elige Solicita Recibe Estudia ]
[                                ]
[  "Testimonio de Maria..."      ]
[  CTA                           ]
```

**Codigo clave**:
```tsx
<div className="min-h-[80vh] bg-neutral-50 py-20">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-4xl font-bold text-center mb-4">
      De estudiante sin laptop a profesional exitoso
    </h1>
    <p className="text-xl text-neutral-600 text-center mb-12">
      Tu historia empieza aqui
    </p>

    {/* Timeline */}
    <div className="flex justify-between items-center mb-16 relative">
      <div className="absolute top-6 left-0 right-0 h-1 bg-neutral-200" />
      {['Elige tu laptop', 'Solicita en 5 min', 'Aprobacion 24h', 'Empieza a estudiar'].map((step, i) => (
        <div key={i} className="relative z-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#4654CD] text-white flex items-center justify-center mx-auto">
            {i + 1}
          </div>
          <p className="mt-2 text-sm">{step}</p>
        </div>
      ))}
    </div>

    {/* Testimonial */}
    <Card className="max-w-2xl mx-auto p-6">
      <div className="flex gap-4">
        <img src="/maria.jpg" className="w-16 h-16 rounded-full" />
        <div>
          <p className="italic">"Gracias a BaldeCash pude terminar mi tesis a tiempo"</p>
          <p className="font-semibold mt-2">Maria Garcia - UPN</p>
        </div>
      </div>
    </Card>
  </div>
</div>
```

**Referencia**: Duolingo, Headspace, Calm

---

### V10: Interactivo (Engagement Inmediato)

**Concepto**: Calculadora de cuotas inline, sliders interactivos, resultado en tiempo real

**Elementos visuales**:
- Calculadora prominente en el hero
- Slider de monto con feedback visual
- Selector de plazo
- Resultado de cuota actualizado en tiempo real
- CTA contextual basado en calculo

**Layout**:
```
[  TITULO                        ]
[  Subtitulo                     ]
[                                ]
[  [=== SLIDER MONTO ===] S/2500 ]
[  [ 12 | 18 | 24 | 36 ] meses   ]
[                                ]
[  Tu cuota seria:               ]
[  [  S/119/mes  ]               ]
[                                ]
[  [Solicitar ahora]             ]
```

**Codigo clave**:
```tsx
const [monto, setMonto] = useState(2500);
const [plazo, setPlazo] = useState(24);
const cuota = Math.round(monto / plazo * 1.15);

<div className="min-h-[80vh] bg-[#4654CD] text-white py-20">
  <div className="max-w-2xl mx-auto px-4 text-center">
    <h1 className="text-4xl font-bold mb-4">Calcula tu cuota</h1>
    <p className="text-white/80 mb-12">Descubre cuanto pagarias al mes</p>

    <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
      <label className="block text-left mb-2">Monto a financiar</label>
      <Slider
        value={monto}
        onChange={setMonto}
        minValue={1000}
        maxValue={5000}
        className="mb-4"
      />
      <p className="text-3xl font-bold mb-8">S/{monto.toLocaleString()}</p>

      <label className="block text-left mb-2">Plazo</label>
      <div className="flex gap-2 mb-8">
        {[12, 18, 24, 36].map(p => (
          <Button
            key={p}
            variant={plazo === p ? "solid" : "bordered"}
            onPress={() => setPlazo(p)}
          >
            {p} meses
          </Button>
        ))}
      </div>

      <div className="border-t border-white/20 pt-6">
        <p className="text-white/60">Tu cuota seria</p>
        <p className="text-5xl font-bold">S/{cuota}/mes</p>
      </div>
    </div>

    <Button size="lg" className="mt-8 bg-white text-[#4654CD]">
      Solicitar S/{monto.toLocaleString()}
    </Button>
  </div>
</div>
```

**Referencia**: Stripe Pricing, calculadoras fintech, Kayak

---

## 6. Componente: Social Proof [ITERAR - 10 versiones]

### V1: Marquee Continuo
- Logos en movimiento horizontal infinito
- Fondo neutro, logos en escala de grises
- Hover: logo a color

### V2: Grid Estatico
- Todos los logos visibles en grid 4x4
- Cards con hover effect
- Badge "Convenio" en cada uno

### V3: Contador + Logos
- Numero grande "32+ convenios"
- 6-8 logos destacados debajo
- Animacion de contador

### V4: Carrusel Manual
- Flechas para navegar
- 4 logos visibles a la vez
- Indicadores de pagina

### V5: Testimonios con Logo
- Testimonio de estudiante
- Logo de su universidad al lado
- Rotacion automatica

### V6: Mapa de Peru
- Mapa con puntos por region
- Hover muestra instituciones
- Visual geografico

### V7: Timeline de Convenios
- "2020: Primera alianza"
- Linea temporal visual
- Crecimiento demostrado

### V8: Stats Cards
- 3 cards grandes
- Convenios, Estudiantes, Anos
- Iconos animados

### V9: Video Testimonial
- Thumbnail de video
- Play button overlay
- Quote debajo

### V10: Filtrable por Tipo
- Tabs: Universidades | Institutos | Todos
- Grid que filtra en tiempo real

---

## 7. Componente: Navbar [ITERAR - 10 versiones]

### V1: Sticky Solido
- Siempre visible, fondo blanco
- Shadow sutil

### V2: Hide on Scroll Down
- Se oculta al bajar
- Reaparece al subir

### V3: Transparente a Solido
- Transparente en top
- Se vuelve solido al scroll

### V4: Hamburger Siempre
- Menu hamburger en todas las pantallas
- Fullscreen overlay

### V5: Bottom Navigation (Mobile)
- Navbar inferior en mobile
- Estilo app nativa

### V6: Con Mega Menu
- Dropdown grande en hover
- Categorias de productos

### V7: Con Search Prominente
- Barra de busqueda visible
- Estilo e-commerce

### V8: Minimalista
- Solo logo y CTA
- Sin items de navegacion

### V9: Con Notificacion
- Badge de ofertas
- Animacion de atencion

### V10: Con Progreso
- Barra de progreso del funnel
- Muestra paso actual

---

## 8. Componente: CTA Section [ITERAR - 10 versiones]

### V1: Boton Simple
- "Ver laptops disponibles"
- Estilo primario solido

### V2: Precio en Boton
- "Desde S/49/mes - Ver laptops"
- Precio integrado

### V3: Dual CTA
- Primario + Secundario
- "Ver laptops" + "Como funciona"

### V4: Con Urgencia
- "Oferta termina en 2:45:30"
- Countdown timer

### V5: Pre-calificacion
- "Descubre tu monto"
- Sin compromiso

### V6: WhatsApp Directo
- Boton verde WhatsApp
- "Habla con un asesor"

### V7: Sticky Bottom
- CTA fijo en bottom mobile
- Siempre visible

### V8: Con Social Proof
- "1,247 estudiantes este mes"
- Debajo del boton

### V9: Animado
- Pulse animation
- Llama la atencion

### V10: Contextual
- Cambia segun scroll
- "Ver laptops" -> "Solicitar ahora"

---

## 9. Componente: Footer [ITERAR - 10 versiones]

### V1: Minimalista Oscuro
- Logo centrado, links inline
- Fondo neutral-900

### V2: Columnas Claro
- 3-4 columnas
- Fondo neutral-100

### V3: Con CTA WhatsApp
- WhatsApp prominente
- Fondo primario

### V4: Mega Footer
- Muchos links organizados
- Newsletter signup

### V5: Compacto
- Una sola linea
- Solo esenciales

### V6: Con Mapa
- Google Maps embed
- Ubicacion fisica

### V7: Con App Download
- Badges App Store/Play Store
- QR code

### V8: Con Trust Badges
- SBS, SSL, certificaciones
- Prominentes

### V9: Con FAQ Inline
- Preguntas frecuentes
- Acordeon

### V10: Con Chatbot
- Widget de chat
- "Necesitas ayuda?"

---

## 10. Tipos TypeScript Actualizados

```typescript
// types/hero.ts

export interface HeroConfig {
  heroBannerVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  socialProofVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  navbarVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  ctaVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  footerVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

// ... resto de tipos igual que 0.3
```

---

## 11. URLs de Acceso

| Ruta | Descripcion |
|------|-------------|
| `/prototipos/0.4/hero` | Redirecciona a preview |
| `/prototipos/0.4/hero/hero-preview` | Comparador con settings modal |
| `/prototipos/0.4/hero/hero-v1` | V1: Foto Producto |
| `/prototipos/0.4/hero/hero-v2` | V2: Foto Lifestyle |
| `/prototipos/0.4/hero/hero-v3` | V3: Ilustracion Flat |
| `/prototipos/0.4/hero/hero-v4` | V4: Abstracto Flotante |
| `/prototipos/0.4/hero/hero-v5` | V5: Split 50/50 |
| `/prototipos/0.4/hero/hero-v6` | V6: Centrado Hero |
| `/prototipos/0.4/hero/hero-v7` | V7: Asimetrico Bold |
| `/prototipos/0.4/hero/hero-v8` | V8: Data-Driven |
| `/prototipos/0.4/hero/hero-v9` | V9: Storytelling |
| `/prototipos/0.4/hero/hero-v10` | V10: Interactivo |

---

## 12. Checklist de Entregables

- [ ] `HeroBannerV1.tsx` - V10: 10 versiones
- [ ] `SocialProofV1.tsx` - V10: 10 versiones
- [ ] `NavbarV1.tsx` - V10: 10 versiones
- [ ] `HeroCtaV1.tsx` - V10: 10 versiones
- [ ] `FooterV1.tsx` - V10: 10 versiones
- [ ] `HeroSettingsModal.tsx` con 10 opciones por componente
- [ ] `hero-preview/page.tsx`
- [ ] `hero-v1/page.tsx` hasta `hero-v10/page.tsx`

---

## 13. Notas Importantes

1. **Mobile-First**: Disenar primero para 375px, luego escalar
2. **Performance**: Lazy load de imagenes, optimizar para 3G
3. **Accesibilidad**: Contraste WCAG AA, focus states, aria labels
4. **Animaciones**: Sutiles con framer-motion, respetando `prefers-reduced-motion`
5. **Imagenes externas**: Usar `<img>` nativo, NO NextUI Image para URLs CDN
6. **Sin emojis**: Usar Lucide icons exclusivamente
