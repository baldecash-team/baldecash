# Prompt #17: Landing de Convenios - BaldeCash Web 4.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C |
| **Versiones por componente** | 6 |
| **Prioridad** | Alta - Conversion |
| **Referencia** | https://beneficios.baldecash.com/certus |

---

## 1. Contexto

### 1.1 Descripcion General
Landing page personalizada para convenios universitarios. Cada universidad tiene una URL unica (ej: `/convenio/certus`, `/convenio/upn`, `/convenio/upc`) que muestra branding co-branded manteniendo la identidad visual de BaldeCash.

### 1.2 Objetivos
- Aumentar conversion de leads provenientes de universidades con convenio
- Mostrar beneficios exclusivos del convenio (descuentos en cuotas)
- Generar confianza con branding conjunto universidad + BaldeCash
- Propagar parametros de convenio a todo el flujo (catalogo, producto, wizard)

### 1.3 Terminologia
- Usar **"equipos"** en lugar de "laptops"
- Usar **"Catalogo"** en lugar de "Laptops" en navegacion
- Usar **"Tienes dudas?"** en lugar de "FAQ"

---

## 2. Sistema de Parametros URL

### 2.1 Estructura de URL

```
/convenio/[slug]?ref=[source]

Ejemplos:
/convenio/certus
/convenio/upn
/convenio/upc?ref=email
/convenio/tecsup?ref=whatsapp
```

### 2.2 Propagacion de Parametros

**El parametro `convenio` se hereda a todo el flujo:**

```tsx
// En catalogo
/catalogo?convenio=certus

// En producto
/producto/hp-pavilion-15?convenio=certus

// En wizard
/solicitud?convenio=certus&producto=hp-pavilion-15
```

### 2.3 Hook de Convenio

```tsx
// hooks/useConvenio.ts
import { useSearchParams } from 'next/navigation';

export interface ConvenioData {
  slug: string;
  nombre: string;
  logo: string;
  colorPrimario: string;
  colorSecundario: string;
  descuentoCuota: number; // porcentaje (ej: 10 = 10%)
  mensajeExclusivo: string;
  activo: boolean;
}

export function useConvenio() {
  const searchParams = useSearchParams();
  const convenioSlug = searchParams.get('convenio');

  const convenioData = convenioSlug ? getConvenioData(convenioSlug) : null;

  // Funcion para agregar parametro a URLs
  const appendConvenioParam = (url: string) => {
    if (!convenioSlug) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}convenio=${convenioSlug}`;
  };

  return {
    isConvenio: !!convenioData,
    convenio: convenioData,
    appendConvenioParam,
  };
}
```

### 2.4 Datos de Convenios

```tsx
// data/convenios.ts
export const convenios: Record<string, ConvenioData> = {
  certus: {
    slug: 'certus',
    nombre: 'CERTUS',
    logo: '/convenios/certus-logo.png',
    colorPrimario: '#E31837', // Rojo CERTUS
    colorSecundario: '#1E3A5F',
    descuentoCuota: 10,
    mensajeExclusivo: 'Descuento exclusivo para estudiantes CERTUS',
    activo: true,
  },
  upn: {
    slug: 'upn',
    nombre: 'Universidad Privada del Norte',
    logo: '/convenios/upn-logo.png',
    colorPrimario: '#F7941D', // Naranja UPN
    colorSecundario: '#231F20',
    descuentoCuota: 8,
    mensajeExclusivo: 'Beneficio especial para alumnos UPN',
    activo: true,
  },
  upc: {
    slug: 'upc',
    nombre: 'Universidad Peruana de Ciencias Aplicadas',
    logo: '/convenios/upc-logo.png',
    colorPrimario: '#003366', // Azul UPC
    colorSecundario: '#FFD700',
    descuentoCuota: 12,
    mensajeExclusivo: 'Precio especial convenio UPC',
    activo: true,
  },
  // ... mas convenios
};
```

---

## 3. Estructura de Archivos

```
src/app/
├── convenio/
│   └── [slug]/
│       └── page.tsx                    # Landing dinamica por convenio
├── prototipos/0.4/convenio/
│   ├── page.tsx                        # Redirect a preview
│   ├── convenio-preview/page.tsx       # Preview con modal de configuracion
│   └── components/convenio/
│       ├── ConvenioLanding.tsx
│       ├── ConvenioSettingsModal.tsx
│       ├── hero/ConvenioHeroV1-V6.tsx
│       ├── benefits/ConvenioBenefitsV1-V6.tsx
│       ├── how-it-works/ConvenioHowItWorksV1-V6.tsx
│       ├── testimonials/ConvenioTestimonialsV1-V6.tsx
│       ├── faq/ConvenioFaqV1-V6.tsx
│       └── cta/ConvenioCtaV1-V6.tsx
```

---

## 4. Componente: Navbar Convenio [6 versiones]

### Especificaciones Globales

**Elementos co-branded obligatorios:**

```tsx
<nav className="sticky top-0 bg-white shadow-sm z-50">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    {/* Logos co-branded */}
    <div className="flex items-center gap-4">
      <img src="/logo-baldecash.png" className="h-8" />
      <span className="text-neutral-300">×</span>
      <img src={convenio.logo} className="h-6" />
    </div>

    {/* Badge de convenio */}
    <Chip
      className="text-white text-xs"
      style={{ backgroundColor: convenio.colorPrimario }}
    >
      Convenio {convenio.nombre}
    </Chip>

    {/* CTA */}
    <Button className="bg-[#4654CD] text-white rounded-xl">
      Ver equipos
    </Button>
  </div>
</nav>
```

### V1-V6: Variantes
- V1: Logos lado a lado + badge
- V2: Logo BaldeCash con acento de color universidad
- V3: Navbar con banner de descuento flotante
- V4: Navbar minimalista con CTA prominente
- V5: Navbar con countdown de oferta
- V6: Navbar con barra de progreso de cupos

---

## 5. Componente: Hero Convenio [6 versiones]

### V1: Hero Clasico Co-branded

```tsx
<div className="relative min-h-[70vh] bg-gradient-to-br from-[#4654CD] to-[#3730a3]">
  {/* Acento de color universidad */}
  <div
    className="absolute top-0 right-0 w-1/3 h-full opacity-20"
    style={{ backgroundColor: convenio.colorPrimario }}
  />

  <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
    <div className="text-white">
      {/* Badge convenio */}
      <Chip className="mb-4 bg-white/20 text-white">
        Exclusivo para estudiantes {convenio.nombre}
      </Chip>

      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Tu equipo para clases virtuales
      </h1>
      <p className="text-xl text-white/80 mb-6">
        Financiamiento hasta 24 meses con {convenio.descuentoCuota}% de descuento en tu cuota
      </p>

      {/* Badge de ahorro */}
      <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl px-6 py-4 mb-8">
        <div>
          <p className="text-white/60 text-sm">Cuota desde</p>
          <p className="text-4xl font-bold">S/44<span className="text-lg">/mes</span></p>
        </div>
        <div className="border-l border-white/20 pl-4">
          <p className="text-[#03DBD0] text-sm font-semibold">Ahorras S/5/mes</p>
          <p className="text-white/60 text-xs">vs precio regular</p>
        </div>
      </div>

      <Button size="lg" className="bg-white text-[#4654CD] font-bold rounded-xl">
        Ver equipos disponibles
      </Button>
    </div>

    {/* Visual */}
    <div className="relative">
      <img src="/laptop-estudiante.png" className="w-full" />
      {/* Logo universidad flotante */}
      <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4">
        <img src={convenio.logo} className="h-12" />
      </div>
    </div>
  </div>
</div>
```

### V2: Hero con Video/Foto de Campus

```tsx
<div className="relative min-h-[80vh]">
  {/* Foto del campus de la universidad */}
  <img src={`/convenios/${convenio.slug}-campus.jpg`} className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

  <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
    {/* Contenido similar a V1 */}
  </div>
</div>
```

### V3: Hero Split con Calculadora

```tsx
<div className="grid md:grid-cols-2 min-h-[80vh]">
  {/* Izquierda: Info */}
  <div className="bg-[#4654CD] text-white p-12 flex flex-col justify-center">
    {/* Contenido */}
  </div>

  {/* Derecha: Calculadora con descuento aplicado */}
  <div className="bg-neutral-50 p-12 flex items-center justify-center">
    <ConvenioCalculadora convenio={convenio} />
  </div>
</div>
```

### V4: Hero Centrado con Logo Grande

```tsx
<div className="min-h-[80vh] bg-white flex flex-col items-center justify-center text-center px-4">
  {/* Logos co-branded grandes */}
  <div className="flex items-center gap-6 mb-8">
    <img src="/logo-baldecash.png" className="h-16" />
    <span className="text-4xl text-neutral-300">×</span>
    <img src={convenio.logo} className="h-12" />
  </div>

  <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-4">
    Beneficio exclusivo para<br/>
    <span style={{ color: convenio.colorPrimario }}>{convenio.nombre}</span>
  </h1>

  {/* Badge de descuento grande */}
  <div
    className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-white mb-8"
    style={{ backgroundColor: convenio.colorPrimario }}
  >
    <Percent className="w-8 h-8" />
    <span className="text-3xl font-bold">{convenio.descuentoCuota}% OFF</span>
    <span className="text-lg">en tu cuota mensual</span>
  </div>

  <Button size="lg" className="bg-[#4654CD] text-white rounded-xl">
    Ver equipos con descuento
  </Button>
</div>
```

### V5: Hero con Countdown

```tsx
{/* Banner de urgencia */}
<div
  className="py-3 text-white text-center"
  style={{ backgroundColor: convenio.colorPrimario }}
>
  <div className="flex items-center justify-center gap-4">
    <Clock className="w-5 h-5" />
    <span>Oferta exclusiva termina en</span>
    <span className="font-mono font-bold text-xl">02:15:30:45</span>
    <span>dias</span>
  </div>
</div>
```

### V6: Hero con Carrusel de Equipos

```tsx
{/* Carousel de productos destacados con precio convenio */}
<div className="mt-12">
  <Swiper slidesPerView={3} spaceBetween={20}>
    {productosDestacados.map(producto => (
      <SwiperSlide key={producto.id}>
        <ProductCardConvenio producto={producto} convenio={convenio} />
      </SwiperSlide>
    ))}
  </Swiper>
</div>
```

---

## 6. Componente: Benefits Convenio [6 versiones]

### Contenido obligatorio

```tsx
const beneficios = [
  {
    icon: Percent,
    titulo: `${convenio.descuentoCuota}% menos en cada cuota`,
    descripcion: 'Descuento exclusivo por ser estudiante ' + convenio.nombre,
  },
  {
    icon: Clock,
    titulo: 'Aprobacion en 24 horas',
    descripcion: 'Proceso simplificado para estudiantes con convenio',
  },
  {
    icon: Shield,
    titulo: 'Sin historial crediticio',
    descripcion: 'No necesitas historial bancario previo',
  },
  {
    icon: Truck,
    titulo: 'Entrega en tu campus',
    descripcion: 'Recibe tu equipo directamente en ' + convenio.nombre,
  },
];
```

---

## 7. Componente: Testimonios Convenio [6 versiones]

```tsx
{/* Testimonios de estudiantes de ESA universidad */}
const testimoniosConvenio = testimonios.filter(t => t.universidad === convenio.slug);

<div className="py-16 bg-neutral-50">
  <h2 className="text-3xl font-bold text-center mb-12">
    Estudiantes de {convenio.nombre} que ya tienen su equipo
  </h2>

  <div className="grid md:grid-cols-3 gap-6">
    {testimoniosConvenio.map(t => (
      <Card key={t.id} className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <img src={t.foto} className="w-12 h-12 rounded-full" />
          <div>
            <p className="font-semibold">{t.nombre}</p>
            <p className="text-sm text-neutral-500">{t.carrera}</p>
          </div>
          {/* Badge universidad */}
          <div className="ml-auto bg-white rounded-lg p-2 shadow-sm">
            <img src={convenio.logo} className="h-6" />
          </div>
        </div>
        <p className="text-neutral-600 italic">"{t.testimonio}"</p>
      </Card>
    ))}
  </div>
</div>
```

---

## 8. Componente: FAQ Convenio [6 versiones]

```tsx
const faqsConvenio = [
  {
    pregunta: '¿Como funciona el descuento por convenio?',
    respuesta: `Por ser estudiante de ${convenio.nombre}, tienes un ${convenio.descuentoCuota}% de descuento automatico en cada cuota mensual. El descuento se aplica automaticamente al verificar tu correo institucional.`,
  },
  {
    pregunta: '¿Como verifico que soy estudiante?',
    respuesta: `Solo necesitas tu correo institucional de ${convenio.nombre} (@${convenio.slug}.edu.pe) o tu carnet de estudiante vigente.`,
  },
  {
    pregunta: '¿Puedo recibir el equipo en el campus?',
    respuesta: `Si, coordinamos entregas en el campus de ${convenio.nombre} en horarios de atencion.`,
  },
  // ... mas FAQs
];
```

---

## 9. Integracion con Catalogo

### 9.1 Product Card con Badge Convenio

```tsx
// components/catalog/ProductCardConvenio.tsx

interface ProductCardConvenioProps {
  producto: Producto;
  convenio: ConvenioData | null;
}

export function ProductCardConvenio({ producto, convenio }: ProductCardConvenioProps) {
  const cuotaOriginal = producto.cuotaMensual;
  const cuotaConvenio = convenio
    ? Math.round(cuotaOriginal * (1 - convenio.descuentoCuota / 100))
    : cuotaOriginal;

  return (
    <Card className="relative overflow-hidden">
      {/* Badge de convenio */}
      {convenio && (
        <div
          className="absolute top-2 left-2 z-10 text-white text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: convenio.colorPrimario }}
        >
          -{convenio.descuentoCuota}% {convenio.nombre}
        </div>
      )}

      <img src={producto.imagen} className="w-full aspect-square object-contain p-4" />

      <CardBody>
        <h3 className="font-semibold">{producto.nombre}</h3>

        {/* Precios */}
        {convenio ? (
          <div className="mt-2">
            <p className="text-neutral-400 line-through text-sm">
              S/{cuotaOriginal}/mes
            </p>
            <p className="text-2xl font-bold text-[#4654CD]">
              S/{cuotaConvenio}/mes
            </p>
            <Chip size="sm" className="bg-[#03DBD0]/10 text-[#03DBD0] mt-1">
              Precio convenio {convenio.nombre}
            </Chip>
          </div>
        ) : (
          <p className="text-2xl font-bold text-[#4654CD] mt-2">
            S/{cuotaOriginal}/mes
          </p>
        )}
      </CardBody>

      <CardFooter>
        <Button
          className="w-full bg-[#4654CD] text-white rounded-xl"
          as="a"
          href={`/producto/${producto.slug}${convenio ? `?convenio=${convenio.slug}` : ''}`}
        >
          Ver equipo
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 9.2 Banner Convenio en Catalogo

```tsx
// Mostrar banner sticky en catalogo cuando hay convenio activo
{convenio && (
  <div
    className="sticky top-16 z-40 py-2 px-4 text-white text-center text-sm"
    style={{ backgroundColor: convenio.colorPrimario }}
  >
    <span className="font-semibold">Convenio {convenio.nombre} activo</span>
    <span className="mx-2">|</span>
    <span>{convenio.descuentoCuota}% de descuento en todas las cuotas</span>
  </div>
)}
```

---

## 10. Integracion con Wizard

### 10.1 Switch de Convenio en Wizard

```tsx
// En el wizard de solicitud, mostrar toggle de convenio
<div className="bg-neutral-50 rounded-xl p-6 mb-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <img src={convenio.logo} className="h-8" />
      <div>
        <p className="font-semibold">Convenio {convenio.nombre}</p>
        <p className="text-sm text-neutral-500">
          {convenio.descuentoCuota}% de descuento en cada cuota
        </p>
      </div>
    </div>

    <Switch
      isSelected={convenioActivo}
      onValueChange={setConvenioActivo}
      classNames={{
        wrapper: convenioActivo ? 'bg-[#4654CD]' : 'bg-neutral-300',
      }}
    />
  </div>

  {convenioActivo && (
    <div className="mt-4 pt-4 border-t border-neutral-200">
      <p className="text-sm text-neutral-600 mb-2">
        Para aplicar el descuento, verifica que eres estudiante:
      </p>
      <Input
        placeholder="correo@certus.edu.pe"
        label="Correo institucional"
        description="Usaremos tu correo de la universidad para verificar"
      />
    </div>
  )}
</div>
```

### 10.2 Resumen de Cuota con Descuento

```tsx
// En el resumen del wizard, mostrar desglose con descuento
<Card className="p-6">
  <h3 className="font-semibold mb-4">Resumen de tu cuota</h3>

  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-neutral-600">Cuota base</span>
      <span className="line-through text-neutral-400">S/{cuotaBase}</span>
    </div>

    <div className="flex justify-between text-[#22c55e]">
      <span>Descuento convenio {convenio.nombre}</span>
      <span>-S/{descuento}</span>
    </div>

    <div className="border-t pt-3 flex justify-between">
      <span className="font-semibold">Tu cuota mensual</span>
      <span className="text-2xl font-bold text-[#4654CD]">S/{cuotaFinal}</span>
    </div>
  </div>

  {/* Badge de ahorro total */}
  <div className="mt-4 bg-[#03DBD0]/10 rounded-xl p-4 text-center">
    <p className="text-sm text-neutral-600">Ahorro total en {plazo} meses</p>
    <p className="text-2xl font-bold text-[#03DBD0]">S/{ahorroTotal}</p>
  </div>
</Card>
```

---

## 11. Tipos TypeScript

```typescript
// types/convenio.ts

export interface ConvenioData {
  slug: string;
  nombre: string;
  nombreCorto: string;
  logo: string;
  logoBanner: string;
  colorPrimario: string;
  colorSecundario: string;
  descuentoCuota: number;
  descuentoInicial: number;
  mensajeExclusivo: string;
  dominioEmail: string; // certus.edu.pe
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
}

export interface ConvenioConfig {
  heroVersion: 1 | 2 | 3 | 4 | 5 | 6;
  benefitsVersion: 1 | 2 | 3 | 4 | 5 | 6;
  testimonialsVersion: 1 | 2 | 3 | 4 | 5 | 6;
  faqVersion: 1 | 2 | 3 | 4 | 5 | 6;
  ctaVersion: 1 | 2 | 3 | 4 | 5 | 6;
}
```

---

## 12. URLs de Acceso

| Ruta | Descripcion |
|------|-------------|
| `/convenio/[slug]` | Landing publica de convenio |
| `/prototipos/0.4/convenio` | Redirect a preview |
| `/prototipos/0.4/convenio/convenio-preview` | Comparador con settings |

---

## 13. Checklist

- [ ] ConvenioHeroV1-V6 con branding co-branded
- [ ] ConvenioBenefitsV1-V6 con descuentos destacados
- [ ] ConvenioTestimonialsV1-V6 filtrados por universidad
- [ ] ConvenioFaqV1-V6 con preguntas especificas
- [ ] ConvenioCtaV1-V6 con urgencia/countdown
- [ ] Hook useConvenio para propagacion de parametros
- [ ] ProductCardConvenio con badge de descuento
- [ ] Banner convenio sticky en catalogo
- [ ] Switch de convenio en wizard
- [ ] Resumen de cuota con descuento aplicado

---

## 14. Notas Importantes

1. **Identidad visual**: Mantener BaldeCash como marca principal, universidad como co-brand
2. **Propagacion URL**: El parametro `convenio=slug` debe heredarse en todo el flujo
3. **Descuentos**: Mostrar siempre precio original vs precio convenio
4. **Verificacion**: Usar correo institucional para validar estudiante
5. **Urgencia**: Considerar countdown o cupos limitados para conversion
6. **Entrega**: Ofrecer entrega en campus como diferenciador
7. **Testimonios**: Priorizar testimonios de esa universidad especifica
