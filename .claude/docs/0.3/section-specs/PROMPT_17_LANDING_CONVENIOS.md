# Prompt #17: Landing de Convenios - BaldeCash Web 3.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C |
| **Versiones por componente** | 3 |
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

---

## 3. Estructura de Archivos

```
src/app/
├── convenio/
│   └── [slug]/
│       └── page.tsx                    # Landing dinamica por convenio
├── prototipos/0.3/convenio/
│   ├── page.tsx                        # Redirect a preview
│   ├── convenio-preview/page.tsx       # Preview con modal de configuracion
│   └── components/convenio/
│       ├── ConvenioLanding.tsx
│       ├── ConvenioSettingsModal.tsx
│       ├── hero/ConvenioHeroV1-V3.tsx
│       ├── benefits/ConvenioBenefitsV1-V3.tsx
│       ├── testimonials/ConvenioTestimonialsV1-V3.tsx
│       ├── faq/ConvenioFaqV1-V3.tsx
│       └── cta/ConvenioCtaV1-V3.tsx
```

---

## 4. Componentes Iterables [T] - 3 versiones

### 4.1 Hero Convenio [T]

| Version | Estilo | Descripcion |
|---------|--------|-------------|
| V1 | Clasico Co-branded | Logos lado a lado, badge de descuento, CTA prominente |
| V2 | Split con Calculadora | Mitad info, mitad calculadora con descuento aplicado |
| V3 | Centrado con Logo Grande | Logos grandes centrados, tipografia oversized |

### 4.2 Benefits Convenio [T]

| Version | Estilo | Descripcion |
|---------|--------|-------------|
| V1 | Grid de Cards | 4 beneficios en grid, iconos grandes |
| V2 | Lista con Checkmarks | Lista vertical con checkmarks verdes |
| V3 | Highlight Central | Un beneficio principal grande, secundarios abajo |

### 4.3 Testimonials Convenio [T]

| Version | Estilo | Descripcion |
|---------|--------|-------------|
| V1 | Cards Grid | 3 testimonios en grid con foto y universidad |
| V2 | Carousel | Slider de testimonios con navegacion |
| V3 | Quote Grande | Un testimonio destacado con foto grande |

### 4.4 FAQ Convenio [T]

| Version | Estilo | Descripcion |
|---------|--------|-------------|
| V1 | Accordion Clasico | Preguntas expandibles una a una |
| V2 | Tabs por Categoria | Tabs: General, Descuentos, Proceso |
| V3 | Grid de Cards | Preguntas en cards sin acordeon |

### 4.5 CTA Convenio [T]

| Version | Estilo | Descripcion |
|---------|--------|-------------|
| V1 | Banner Full Width | Banner con degradado, CTA centrado |
| V2 | Card Flotante | Card con sombra, precio destacado |
| V3 | Sticky Bottom | Barra fija en bottom mobile |

---

## 5. Datos de Convenios

```tsx
// data/convenios.ts
export const convenios: Record<string, ConvenioData> = {
  certus: {
    slug: 'certus',
    nombre: 'CERTUS',
    logo: '/convenios/certus-logo.png',
    colorPrimario: '#E31837',
    descuentoCuota: 10,
    mensajeExclusivo: 'Descuento exclusivo para estudiantes CERTUS',
    activo: true,
  },
  upn: {
    slug: 'upn',
    nombre: 'Universidad Privada del Norte',
    logo: '/convenios/upn-logo.png',
    colorPrimario: '#F7941D',
    descuentoCuota: 8,
    mensajeExclusivo: 'Beneficio especial para alumnos UPN',
    activo: true,
  },
  upc: {
    slug: 'upc',
    nombre: 'Universidad Peruana de Ciencias Aplicadas',
    logo: '/convenios/upc-logo.png',
    colorPrimario: '#003366',
    descuentoCuota: 12,
    mensajeExclusivo: 'Precio especial convenio UPC',
    activo: true,
  },
};
```

---

## 6. Tipos TypeScript

```typescript
// types/convenio.ts

export interface ConvenioData {
  slug: string;
  nombre: string;
  logo: string;
  colorPrimario: string;
  colorSecundario?: string;
  descuentoCuota: number;
  mensajeExclusivo: string;
  dominioEmail?: string;
  activo: boolean;
}

export interface ConvenioConfig {
  heroVersion: 1 | 2 | 3;
  benefitsVersion: 1 | 2 | 3;
  testimonialsVersion: 1 | 2 | 3;
  faqVersion: 1 | 2 | 3;
  ctaVersion: 1 | 2 | 3;
}
```

---

## 7. URLs de Acceso

| Ruta | Descripcion |
|------|-------------|
| `/convenio/[slug]` | Landing publica de convenio |
| `/prototipos/0.3/convenio` | Redirect a preview |
| `/prototipos/0.3/convenio/convenio-preview` | Comparador con settings |

---

## 8. Checklist

- [ ] ConvenioHeroV1-V3 con branding co-branded
- [ ] ConvenioBenefitsV1-V3 con descuentos destacados
- [ ] ConvenioTestimonialsV1-V3 filtrados por universidad
- [ ] ConvenioFaqV1-V3 con preguntas especificas
- [ ] ConvenioCtaV1-V3 con urgencia
- [ ] Hook useConvenio para propagacion de parametros
- [ ] ProductCardConvenio con badge de descuento

---

## 9. Notas Importantes

1. **Identidad visual**: Mantener BaldeCash como marca principal, universidad como co-brand
2. **Propagacion URL**: El parametro `convenio=slug` debe heredarse en todo el flujo
3. **Descuentos**: Mostrar siempre precio original vs precio convenio
4. **Verificacion**: Usar correo institucional para validar estudiante
5. **Testimonios**: Priorizar testimonios de esa universidad especifica
