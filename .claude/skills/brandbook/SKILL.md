---
name: baldecash-brand
description: |
  Guía de identidad visual BaldeCash: colores (#4654CD), tipografía (Baloo 2, Asap),
  logo, restricciones visuales, tono de voz. Usar SIEMPRE que se genere cualquier UI,
  componente, página, email, o elemento visual para BaldeCash.
---

# Brand Book
## Guía de Identidad de Marca 2025

![BaldeCash Logo](logo-placeholder)

---

## Contenido

1. **Sobre BaldeCash** - Nuestra historia y propósito
2. **Logo y Variantes** - Uso correcto de nuestra marca
3. **Paleta de Colores** - Colores que nos definen
4. **Tipografía** - Nuestras fuentes oficiales
5. **Tono de Voz** - Cómo nos comunicamos
6. **Elementos Visuales** - Patrones, íconos y fotografía
7. **Aplicaciones** - Ejemplos de uso

---

## 01 Sobre BaldeCash

### Nuestra Historia

BaldeCash nació en 2020, en plena pandemia, con una misión clara: democratizar el acceso a tecnología para los estudiantes peruanos de educación superior. Entendimos que una laptop no es un lujo, sino una herramienta esencial para el éxito académico y profesional.

### Misión

Mejorar la educación y empleabilidad de los jóvenes estudiantes del Perú, impulsando la inclusión al sistema financiero a través de la generación de oportunidades, la innovación y el desarrollo tecnológico.

### Visión

Ser el aliado financiero preferido de los estudiantes latinoamericanos, brindando acceso a herramientas tecnológicas que potencien su desarrollo académico y profesional.

### Nuestros Valores

- **Inclusión:** Creemos que todo estudiante merece acceso a tecnología.
- **Innovación:** Usamos la tecnología para simplificar las finanzas.
- **Cercanía:** Hablamos el idioma de los estudiantes.
- **Compromiso:** Nos importa el éxito de cada cliente.

### Tagline

> "Financiamiento para estudiantes"

---

## 02 Logo y Variantes

### Logo Principal (Horizontal)

Versión preferida para la mayoría de aplicaciones.

**URL del logo oficial:**
```
https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png
```

**Uso en código:**
```tsx
// Logo horizontal
<img
  src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
  alt="BaldeCash"
  className="h-8 object-contain"
/>

// Con NextUI Image
import { Image } from '@nextui-org/react';
<Image
  src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
  alt="BaldeCash"
  className="h-8 object-contain"
  removeWrapper
/>
```

### Isotipo

Para espacios reducidos, íconos de app, y redes sociales.

| Fondo claro | Fondo oscuro | Versión outline |
|-------------|--------------|-----------------|
| Isotipo sobre fondo blanco | Isotipo sobre fondo azul | Logo completo con borde |

### Zona de Seguridad

- Mantener un espacio libre alrededor del logo equivalente al ancho del isotipo.
- No colocar texto u otros elementos gráficos dentro de esta zona.
- Tamaño mínimo del logo horizontal: **100px** de ancho.
- Tamaño mínimo del isotipo: **32px** de ancho.

### Uso Incorrecto del Logo

Para mantener la integridad de nuestra marca, evita lo siguiente:

| ❌ No estirar | Mantener las proporciones originales |
|---------------|--------------------------------------|
| ❌ No rotar | El logo siempre debe estar horizontal |
| ❌ No cambiar colores | Usar solo las versiones aprobadas |
| ❌ No agregar efectos | Sin sombras, gradientes o brillos |
| ❌ No recortar | Mostrar siempre el logo completo |
| ❌ No usar sobre fondos que dificulten lectura | Asegurar suficiente contraste |

---

## 03 Paleta de Colores

### Colores Principales

Estos colores definen nuestra identidad y deben usarse consistentemente.

| Color | Hex | RGB |
|-------|-----|-----|
| **Principal** | `#4654CD` | 70, 84, 205 |
| **Acento** | `#03DBD0` | 3, 219, 208 |
| **Texto** | `#232323` | 35, 35, 35 |

### Paleta Extendida - Azules

| Nombre | Hex |
|--------|-----|
| Blue 100 | `#D6DCED` |
| Blue 200 | `#98A9DF` |
| Blue 300 | `#6873D7` |
| Blue 400 | `#474FD5` |
| Blue 500 | `#31359C` |
| Blue 600 | `#212469` |
| Blue 700 | `#151744` |

### Paleta Extendida - Aquas

| Nombre | Hex |
|--------|-----|
| Aqua 100 | `#BEF7F3` |
| Aqua 200 | `#BEF7F3` |
| Aqua 300 | `#80F1E8` |
| Aqua 400 | `#00E4D3` |
| Aqua 500 | `#02C3BA` |
| Aqua 600 | `#00A29B` |
| Aqua 700 | `#00A29B` |

### Uso de Colores

- **Principal:** Para fondos y textos destacados.
- **Acento:** Para CTAs y elementos interactivos.

---

## 04 Tipografía

### Baloo 2 - Títulos Principales

**Fuente:** Google Fonts · [fonts.google.com/specimen/Baloo+2](https://fonts.google.com/specimen/Baloo+2)

```
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz 0123456789
```

**Uso:** Headlines, títulos de sección, elementos destacados. Transmite calidez y cercanía.

### Asap - Cuerpo de Texto

**Fuente:** Google Fonts · [fonts.google.com/specimen/Asap](https://fonts.google.com/specimen/Asap)

```
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz 0123456789
```

**Pesos disponibles:** Regular · Medium · SemiBold · Bold

**Uso:** Párrafos, botones, navegación, etiquetas. Legible y versátil.

### Escala Tipográfica

| Nivel | Tamaño | Peso |
|-------|--------|------|
| H1 - Display | 48px | Bold |
| H2 - Título | 32px | Bold |
| H3 - Subtítulo | 24px | SemiBold |
| Body - Texto | 16px | Regular |
| Caption - Etiquetas | 12px | Medium |

---

## 05 Tono de Voz

Nuestra comunicación refleja quiénes somos: un aliado cercano para los estudiantes.

### Cercano

Hablamos como un amigo que entiende tus retos.

- ✅ *"¡Hola! ¿Listo para tu nueva laptop?"*
- ❌ *"Estimado usuario, solicite su crédito."*

### Motivador

Inspiramos a nuestros usuarios a alcanzar sus metas.

- ✅ *"¡Tú puedes! Cada cuota te acerca a tus sueños."*
- ❌ *"Realice sus pagos puntualmente."*

### Transparente

Explicamos todo de forma clara, sin letra pequeña.

- ✅ *"Tu cuota mensual será de S/150, sin costos ocultos."*
- ❌ *"Consulte términos y condiciones."*

### Juvenil

Usamos un lenguaje fresco y actual.

- ✅ *"Dale click y empieza tu aventura tech."*
- ❌ *"Proceda a completar el formulario."*

### Mensajes según Perfil Crediticio

Comunicar el límite como *oportunidad*, no como restricción:

| Perfil | Mensaje | Tono |
|--------|---------|------|
| Pre-aprobado alto | "Tienes acceso a todos nuestros equipos" | Celebratorio |
| Pre-aprobado bajo | "Empieza con estos equipos y aumenta tu límite" | Aspiracional |
| Rechazado | "Por ahora no, pero hay opciones" + alternativas | Empático |

### Formato de Transparencia Financiera

Siempre mostrar desglose completo, sin sorpresas:

```
Tu cuota: S/89/mes × 48 meses

Precio del equipo: S/3,699 | Financiamiento: S/573 | Total: S/4,272
Tasa: 1.2% mensual | CAT: 14.4% anual | Sin cargos ocultos
```

---

## 05.5 Restricciones Visuales (OBLIGATORIAS)

### Prohibido
- ❌ NO gradientes (solo colores sólidos)
- ❌ NO emojis en UI (usar iconos Lucide)
- ❌ NO Inter, Roboto, Arial, system fonts
- ❌ NO púrpura genérico (#8b5cf6, #a855f7)
- ❌ NO fondos blancos planos sin profundidad
- ❌ NO sombras excesivas (máximo shadow-md)
- ❌ NO bordes redondeados mayores a 16px (excepto pills/avatars)

### Obligatorio
- ✅ Mobile-first en todo diseño
- ✅ Focus states visibles (accesibilidad WCAG 2.1 AA)
- ✅ Transiciones suaves: 150ms (micro), 300ms (layout)
- ✅ Contraste mínimo 4.5:1 para texto
- ✅ Touch targets mínimo 44x44px en móvil

---

## 06 Elementos Visuales

### Patrones Sugeridos

Elementos geométricos derivados del isotipo para fondos y texturas.

| Patrón | Uso |
|--------|-----|
| **Billetes dispersos** | Para fondos de hero sections |
| **Grid de baldes** | Para patrones de marca de agua |
| **Ondas aqua** | Para separadores y transiciones |

### Iconografía Recomendada

**Estilo:** Line icons con bordes redondeados. Grosor: 2px.

**Librería sugerida:** Phosphor Icons o Lucide Icons

- **Finanzas:** wallet, credit-card, piggy-bank, chart-line
- **Educación:** graduation-cap, book, laptop, certificate
- **Acciones:** check-circle, arrow-right, download, calendar
- **Comunicación:** chat, phone, mail, whatsapp

### Estilo Fotográfico

- **Protagonistas:** Estudiantes reales, diversos, auténticos
- **Contextos:** Universidades, bibliotecas, espacios de coworking, cafés
- **Mood:** Optimista, aspiracional pero alcanzable
- **Iluminación:** Natural, cálida, luminosa
- **Edición:** Tonos ligeramente saturados hacia azules y aquas
- **Evitar:** Poses artificiales, stock genérico, filtros excesivos

---

## 07 Aplicaciones

Ejemplos de cómo aplicar los elementos de marca en diferentes medios.

### Digital

- **Website:** Logo horizontal en header, isotipo para favicon
- **App móvil:** Isotipo como ícono de app, colores principales en UI
- **Email marketing:** Logo en header, botones con color acento
- **Redes sociales:** Isotipo para perfil, color principal para fondos

### Impreso

- **Tarjetas de presentación:** Logo horizontal al frente, isotipo al reverso
- **Flyers y posters:** Isotipo grande, headlines en Baloo
- **Merchandising:** Isotipo en productos pequeños, logo completo en grandes
- **Roll-ups y banners:** Logo horizontal prominente, gradientes de marca

### Ejemplo: Post de Instagram

```
┌─────────────────────────────┐
│                             │
│      ¡Tu laptop            │
│       te espera!           │
│                             │
│   Financia en 24 cuotas    │
│                             │
└─────────────────────────────┘
```

- **Fondo:** Color principal
- **Elementos:** Billetes en aqua
- **Tipografía:** Baloo para headline
- **CTA claro y visible**
- **Mantener aire visual**

---

## Contacto

**Web:** [www.baldecash.com](https://www.baldecash.com)

**Email:** contacto@baldecash.com

> *"Financiamiento para estudiantes"*

---

© 2025 Balde K S.A.C. Todos los derechos reservados.