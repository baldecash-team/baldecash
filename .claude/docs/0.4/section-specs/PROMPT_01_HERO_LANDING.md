# Prompt #1: Hero Section / Landing - BaldeCash Web 4.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | A |
| **Versiones por componente** | 6 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto del Proyecto

### 1.1 Descripcion General
BaldeCash es una fintech peruana que proporciona financiamiento de **equipos tecnologicos** (laptops, tablets, celulares) exclusivamente para estudiantes universitarios sin acceso a sistemas bancarios tradicionales.

### 1.2 Terminologia OBLIGATORIA
| Antes | Ahora |
|-------|-------|
| "Laptops" | **"Equipos"** (porque ofrecemos laptops, tablets y celulares) |
| "Productos" | **"Equipos"** |
| "Solicitar" | **"Mi Cuenta"** |
| "FAQ" | **"Tienes dudas?"** |

---

## 2. Stack Tecnologico

```json
{
  "framework": "Next.js 14+ (App Router)",
  "ui_library": "@nextui-org/react v2.6.11",
  "icons": "lucide-react",
  "styling": "Tailwind CSS v4",
  "animations": "framer-motion"
}
```

---

## 3. Estructura de Archivos (6 versiones)

```
src/app/prototipos/0.4/hero/
├── page.tsx                    # Redirect a hero-preview
├── hero-preview/page.tsx       # Preview con settings modal
├── hero-v1/ ... hero-v6/       # Versiones standalone
├── components/hero/
│   ├── HeroSection.tsx
│   ├── HeroSettingsModal.tsx
│   ├── navbar/NavbarV1-V6.tsx
│   ├── banner/HeroBannerV1-V6.tsx
│   ├── social-proof/SocialProofV1-V6.tsx
│   ├── cta/HeroCtaV1-V6.tsx
│   ├── footer/FooterV1-V6.tsx
│   ├── how-it-works/HowItWorksV1-V6.tsx    # NUEVO
│   └── faq/FaqSectionV1-V6.tsx              # NUEVO
├── types/hero.ts
└── data/mockHeroData.ts
```

---

## 4. Componente: Navbar [6 versiones]

### Elementos OBLIGATORIOS en todas las versiones

| Elemento | Especificacion |
|----------|----------------|
| Logo | BaldeCash izquierda |
| Catalogo | Link/Dropdown (antes "Laptops") |
| Tienes dudas? | Link (antes "FAQ") |
| **Zona Estudiantes** | Boton destacado `bg-[#4654CD]` |
| Mi Cuenta | Boton secundario (antes "Solicitar") |
| **Lupa busqueda** | Abre overlay flotante de busqueda |

### Search Overlay (Buscador Flotante)

```tsx
// Al click en lupa, abre overlay
<div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6">
    {/* Input SIN outline al focus, con borde de color */}
    <Input
      autoFocus
      placeholder="Buscar equipos..."
      startContent={<Search className="w-5 h-5 text-neutral-400" />}
      classNames={{
        inputWrapper: 'rounded-xl border-2 border-[#4654CD] focus-within:ring-0 focus-within:outline-none',
      }}
    />

    {/* Recientes */}
    <div className="mt-6">
      <p className="text-sm text-neutral-500 font-semibold mb-3">Recientes</p>
      <div className="flex gap-2 flex-wrap">
        <Chip variant="flat">Lenovo IdeaPad</Chip>
        <Chip variant="flat">MacBook Air</Chip>
      </div>
    </div>

    {/* Recomendados */}
    <div className="mt-6">
      <p className="text-sm text-neutral-500 font-semibold mb-3">Recomendados</p>
      <div className="flex gap-2 flex-wrap">
        <Chip className="bg-[#4654CD]/10 text-[#4654CD]">HP Pavilion - Mas vendido</Chip>
        <Chip className="bg-[#03DBD0]/10 text-[#03DBD0]">ASUS VivoBook</Chip>
      </div>
    </div>
  </div>
</div>
```

---

### V1-V5: Variantes basicas
- V1: Sticky Solido
- V2: Hide on Scroll Down
- V3: Transparente a Solido
- V4: Hamburger Siempre
- V5: Bottom Navigation (Mobile)

### V6: Mega Menu + Badge Notificacion

**Mega Menu con categorias de equipos:**

```tsx
<Dropdown>
  <DropdownTrigger>
    <Button variant="light" className="cursor-pointer">
      Catalogo <ChevronDown className="w-4 h-4" />
    </Button>
  </DropdownTrigger>
  <DropdownMenu className="w-[700px] p-6 bg-white">
    <div className="grid grid-cols-3 gap-6">
      {/* Columna 1: Categorias de EQUIPOS */}
      <div>
        <p className="font-semibold text-neutral-800 mb-4">Equipos</p>
        <div className="space-y-3">
          <DropdownItem><Laptop className="w-4 h-4 mr-2" /> Laptops</DropdownItem>
          <DropdownItem><Tablet className="w-4 h-4 mr-2" /> Tablets</DropdownItem>
          <DropdownItem><Smartphone className="w-4 h-4 mr-2" /> Celulares</DropdownItem>
        </div>
      </div>

      {/* Columna 2: Marcas principales con botones */}
      <div>
        <p className="font-semibold text-neutral-800 mb-4">Marcas</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="flat" size="sm">Lenovo</Button>
          <Button variant="flat" size="sm">HP</Button>
          <Button variant="flat" size="sm">Apple</Button>
          <Button variant="flat" size="sm">ASUS</Button>
        </div>
      </div>

      {/* Columna 3: Equipo destacado con FOTO */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs text-neutral-500 uppercase mb-2">Destacado</p>
        <img src="/laptop-destacado.png" className="w-full h-28 object-contain mb-3" />
        <p className="font-semibold text-sm">HP Pavilion 15</p>
        <p className="text-[#4654CD] font-bold">Desde S/89/mes</p>
      </div>
    </div>
  </DropdownMenu>
</Dropdown>
```

**Badge Notificacion Ofertas (encima del mega menu):**

```tsx
{/* Opcion 1: Badge con numero */}
<div className="relative">
  <Button variant="light">Ofertas</Button>
  <motion.div
    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
    animate={{ scale: [1, 1.15, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    3
  </motion.div>
</div>

{/* Opcion 2: Badge con COUNTDOWN */}
<div className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
  <Clock className="w-4 h-4" />
  <span>Oferta termina en</span>
  <span className="font-mono font-bold">02:45:30</span>
</div>
```

---

## 5. Componente: Hero Banner [6 versiones]

### V1: Foto Producto (E-commerce Clasico)
- Laptop sobre fondo blanco/neutro
- Badge cuota prominente

### V2: Foto Lifestyle (Aspiracional)
- Estudiante usando equipo
- **MOSTRAR cuotas de manera MAS INTERESANTE:**

```tsx
{/* Badge de cuotas DESTACADO - version glassmorphism */}
<motion.div
  className="mt-8 inline-flex flex-col bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  <span className="text-white/60 text-sm uppercase tracking-wide">Cuotas desde</span>
  <div className="flex items-baseline gap-1">
    <span className="text-6xl font-bold text-white">S/49</span>
    <span className="text-white/80 text-2xl">/mes</span>
  </div>
  <span className="text-[#03DBD0] text-sm mt-2">Sin inicial ni aval</span>
</motion.div>
```

### V3: Ilustracion Flat
- Vectores estilizados estilo Notion/Linear

### V4: Abstracto Flotante (Fintech Moderna)
- **Patron SVG vectorizado** de background
- **Laptop con pantalla mostrando clases virtuales/Zoom**
- NOTA: Pedir a Pamela la imagen procesada

```tsx
<div className="relative min-h-[70vh] bg-[#4654CD] overflow-hidden">
  {/* Patron SVG vectorizado */}
  <svg className="absolute inset-0 w-full h-full opacity-10">
    <defs>
      <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>

  {/* Laptop con pantalla de Zoom/clase virtual */}
  <motion.img
    src="/laptop-zoom-clase.png"  /* Pedir a Pamela */
    alt="Laptop mostrando clase virtual"
    className="absolute right-20 bottom-0 w-[500px] drop-shadow-2xl"
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 4, repeat: Infinity }}
  />
</div>
```

### V5: Centrado Hero (Impacto Maximo)
- **SWAP**: Imagen de laptop por laptop con fondo transparente
- Todo centrado, titulo grande

```tsx
{/* Laptop con fondo TRANSPARENTE */}
<motion.img
  src="/laptop-transparent-bg.png"
  alt="Laptop"
  className="w-72 md:w-96 mb-8 drop-shadow-xl"
/>
```

### V6: Storytelling (Narrativa Emocional)
- **Timeline MAS LLAMATIVO** con iconos grandes, colores, animaciones

```tsx
{/* Timeline LLAMATIVO */}
<div className="relative mb-16">
  {/* Linea de progreso con gradiente */}
  <motion.div
    className="absolute top-12 left-[10%] right-[10%] h-2 bg-gradient-to-r from-[#4654CD] via-[#03DBD0] to-[#22c55e] rounded-full"
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    transition={{ duration: 1.5 }}
  />

  <div className="flex justify-between relative z-10">
    {[
      { icon: Search, title: 'Elige tu equipo', color: '#4654CD' },
      { icon: FileText, title: 'Solicita en 5 min', color: '#5B68D8' },
      { icon: Clock, title: 'Aprobacion 24h', color: '#03DBD0' },
      { icon: GraduationCap, title: 'Empieza a estudiar', color: '#22c55e' },
    ].map((step, i) => (
      <motion.div key={i} className="text-center flex-1" initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}>
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg" style={{ backgroundColor: step.color }}>
          <step.icon className="w-8 h-8 text-white" />
        </div>
        <p className="font-semibold mt-4">{step.title}</p>
      </motion.div>
    ))}
  </div>
</div>
```

### Interactivo (Calculadora) - Considerar como alternativa

**Especificaciones EXACTAS:**
- Plazos: **SOLO 6, 12, 18, 24 meses**
- Limites: **S/500 a S/6,000**
- **QUITAR tasa y total** - solo mostrar cuota mensual
- Background: **Foto fullscreen O elemento minimalista SVG**

```tsx
const [monto, setMonto] = useState(2500);
const [plazo, setPlazo] = useState(18);
const cuota = Math.round(monto / plazo * 1.12);

<div className="relative min-h-[80vh]">
  {/* Opcion A: Foto fullscreen */}
  <img src="/student-bg.jpg" className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-[#4654CD]/85" />

  {/* Opcion B: SVG minimalista */}
  {/* <div className="absolute inset-0 bg-[#4654CD]">
    <svg>...</svg>
  </div> */}

  <div className="relative z-10 max-w-2xl mx-auto px-4 py-20 text-white text-center">
    <h1 className="text-4xl font-bold mb-12">Calcula tu cuota</h1>

    <div className="bg-white/10 backdrop-blur rounded-3xl p-8">
      {/* Slider: S/500 a S/6,000 */}
      <Slider value={monto} minValue={500} maxValue={6000} step={100} />
      <p className="text-4xl font-bold my-4">S/{monto.toLocaleString()}</p>

      {/* Plazos: SOLO 6, 12, 18, 24 */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[6, 12, 18, 24].map(p => (
          <Button key={p} variant={plazo === p ? "solid" : "bordered"} onPress={() => setPlazo(p)}>
            {p} meses
          </Button>
        ))}
      </div>

      {/* Resultado: SOLO cuota, SIN tasa NI total */}
      <div className="border-t border-white/20 pt-6">
        <p className="text-white/60">Tu cuota mensual</p>
        <p className="text-6xl font-bold">S/{cuota}<span className="text-2xl">/mes</span></p>
      </div>
    </div>
  </div>
</div>
```

---

## 6. Componente: Social Proof [6 versiones]

### V1: Marquee Continuo
- **CORREGIR BUG**: Fade truncado en extremos
```tsx
{/* Fix: Gradientes con z-index alto + pointer-events-none */}
<div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
<div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
```

### V2: Grid Estatico
- Mejor uso del blank space

### V3: Contador + Logos

### V4: Carrusel Manual

### V5: Testimonios con Logo
- **Mejor uso del blank space** - no se sienta vacio
- **Mostrar 2+ testimonios a la vez** con texto mas chico
- **Logos universidades**: Resolver contraste en fondo azul

```tsx
{/* Logo universidad con fondo blanco para contraste */}
<div className="bg-white rounded-md px-2 py-1">
  <img src={logo} className="h-4" />
</div>
```

### V6: Video Testimonial Thumbnail
- **NO usar background tan oscuro** - usar `bg-neutral-100`

---

## 7. Componente: CTA Section [6 versiones]

### V1: Boton Simple
- **HACER VARIANTES MAS DIVERSAS:**
```tsx
{/* Con icono */}
<Button><ShoppingBag className="mr-2" /> Explorar equipos</Button>
{/* Con flecha */}
<Button className="group">Ver catalogo <ArrowRight className="ml-2 group-hover:translate-x-1" /></Button>
{/* Con badge */}
<div className="relative"><Button>Ver catalogo</Button><span className="absolute -top-2 -right-2 bg-[#03DBD0] text-xs px-2 rounded-full">+50</span></div>
```

### V2-V6: Otras variantes

### Sticky Bottom (USAR COMO IDEA PARA HERO BANNER)
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden z-50">
  <div className="flex justify-between items-center">
    <div>
      <p className="text-sm text-neutral-500">Cuotas desde</p>
      <p className="text-xl font-bold text-[#4654CD]">S/49/mes</p>
    </div>
    <Button className="bg-[#4654CD]">Ver equipos</Button>
  </div>
</div>
```

---

## 8. Componente: Footer [6 versiones]

### Elementos OBLIGATORIOS en TODOS los footers:
- Libro de Reclamaciones
- Terminos y Condiciones
- Politica de Privacidad

### V1-V2: Basicos

### V3: Con CTA WhatsApp
- **CAMBIO**: Modal pide **TELEFONO** en vez de correo
```tsx
<Input
  type="tel"
  placeholder="999 999 999"
  startContent={<span className="text-neutral-400">+51</span>}
/>
```

### V4: Mega Footer (BASELINE)
- **USAR ESTA VERSION como estructura baseline**
- Muchos links organizados en columnas

### V5-V6: Otras variantes

---

## 9. NUEVOS COMPONENTES

### Como Funciona (HowItWorks)
Seccion que describe el proceso de financiamiento, requisitos, plazos, etc.

```tsx
<section className="py-20">
  <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>

  <div className="grid md:grid-cols-3 gap-8">
    <Card className="p-6 text-center">
      <Search className="w-12 h-12 text-[#4654CD] mx-auto mb-4" />
      <h3 className="font-semibold">1. Elige tu equipo</h3>
      <p className="text-neutral-600 text-sm">Explora laptops, tablets y celulares</p>
    </Card>
    {/* ... mas pasos */}
  </div>

  {/* Requisitos */}
  <div className="mt-16 bg-neutral-50 rounded-2xl p-8">
    <h3 className="font-semibold text-xl mb-6">Requisitos</h3>
    <div className="grid md:grid-cols-4 gap-4">
      <div className="flex items-center gap-3">
        <Check className="w-5 h-5 text-[#22c55e]" /> Ser estudiante universitario
      </div>
      {/* ... mas requisitos */}
    </div>
  </div>

  {/* Plazos disponibles */}
  <div className="mt-12 text-center">
    <p className="text-neutral-600 mb-4">Plazos disponibles</p>
    <div className="flex justify-center gap-4">
      {[6, 12, 18, 24].map(p => (
        <Chip key={p} className="bg-[#4654CD]/10 text-[#4654CD]">{p} meses</Chip>
      ))}
    </div>
  </div>
</section>
```

### Preguntas Frecuentes (FaqSection)
- Mostrar FAQs principales
- **Link a subpagina completa** de preguntas frecuentes

```tsx
<section className="py-20 bg-neutral-50">
  <h2 className="text-3xl font-bold text-center mb-12">Preguntas frecuentes</h2>

  <Accordion>
    <AccordionItem title="Necesito historial crediticio?">No, evaluamos tu perfil como estudiante.</AccordionItem>
    <AccordionItem title="Cuanto tarda la aprobacion?">24 horas habiles.</AccordionItem>
    {/* ... mas preguntas */}
  </Accordion>

  {/* Link a pagina completa */}
  <div className="text-center mt-8">
    <Button variant="light" as="a" href="/faq" endContent={<ArrowRight />}>
      Ver todas las preguntas
    </Button>
  </div>
</section>
```

### Nosotros (Subpagina)
- Ruta: `/nosotros`
- Historia y equipo de BaldeCash
- Usar como referencia:
  1. Contenido del timeline de convenios (Social Proof V7)
  2. Contenido de **baldecash.com/sobre-nosotros**

---

## 10. Tipos TypeScript

```typescript
export interface HeroConfig {
  navbarVersion: 1 | 2 | 3 | 4 | 5 | 6;
  heroBannerVersion: 1 | 2 | 3 | 4 | 5 | 6;
  socialProofVersion: 1 | 2 | 3 | 4 | 5 | 6;
  ctaVersion: 1 | 2 | 3 | 4 | 5 | 6;
  footerVersion: 1 | 2 | 3 | 4 | 5 | 6;
  howItWorksVersion: 1 | 2 | 3 | 4 | 5 | 6;
  faqVersion: 1 | 2 | 3 | 4 | 5 | 6;
}
```

---

## 11. URLs de Acceso

| Ruta | Descripcion |
|------|-------------|
| `/prototipos/0.4/hero` | Redirect a preview |
| `/prototipos/0.4/hero/hero-preview` | Comparador con settings |
| `/prototipos/0.4/hero/hero-v1` ... `hero-v6` | Versiones standalone |
| `/nosotros` | Pagina Sobre Nosotros (NUEVO) |
| `/faq` | Pagina completa FAQs (NUEVO) |

---

## 12. Checklist

- [ ] NavbarV1-V6 con mega menu y search overlay
- [ ] HeroBannerV1-V6 con especificaciones detalladas
- [ ] SocialProofV1-V6 con fixes
- [ ] HeroCtaV1-V6 con variantes diversas
- [ ] FooterV1-V6 con links legales obligatorios
- [ ] HowItWorksV1-V6 (NUEVO)
- [ ] FaqSectionV1-V6 (NUEVO)
- [ ] /nosotros page (NUEVO)
- [ ] /faq page (NUEVO)

---

## 13. Notas Importantes

1. **Terminologia**: "equipos" en lugar de "laptops/productos"
2. **Navbar**: "Catalogo" (no "Laptops"), "Tienes dudas?" (no "FAQ")
3. **Search**: Sin outline al focus, solo borde de color
4. **Footer**: SIEMPRE libro de reclamaciones, TyC, privacidad
5. **WhatsApp modal**: Pedir TELEFONO, no correo
6. **Calculadora**: Plazos 6/12/18/24, montos S/500-S/6,000, SIN tasa ni total
7. **Botones**: Siempre `rounded-xl` o `rounded-lg`
