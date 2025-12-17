# Prompt #1: Hero Section / Landing - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | A |
| **Preguntas totales** | 18 |
| **Iteraciones T (3 versiones)** | 10 |
| **Iteraciones F (1 versión)** | 8 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto del Proyecto

### 1.1 Descripción General
BaldeCash es una fintech peruana que proporciona financiamiento de laptops y equipos electrónicos exclusivamente para estudiantes universitarios sin acceso a sistemas bancarios tradicionales. La empresa cuenta con convenios con 32 instituciones educativas y ha financiado más de 10,000 laptops.

### 1.2 Público Objetivo
- Estudiantes universitarios peruanos (18-28 años)
- Sin historial crediticio bancario
- Segmentos socioeconómicos B y C
- 80% trabaja de manera informal o en servicios
- 64% accede desde dispositivos móviles
- Conectividad variable (3G/4G intermitente)

### 1.3 Insights UX/UI del Researcher
- **Mobile-First obligatorio**: 64% del e-commerce en Perú es móvil
- **Alta ansiedad crediticia**: Primera experiencia con financiamiento
- **Benchmark LATAM**: Kueski, Nubank, Addi como referencia
- **Cuota prominente**: Estudiantes piensan en cuotas, no precio total
- **KPI objetivo**: Tasa de completitud del ~4% actual a >70%

---

## 2. Stack Tecnológico

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

## 3. Guía de Marca

### 3.1 Colores
```css
/* Color Primario - OBLIGATORIO */
--brand-primary: #4247d2;
--brand-primary-light: #6366f1;
--brand-primary-dark: #3730a3;
--brand-primary-50: #eef2ff;
--brand-primary-100: #e0e7ff;

/* Estados */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Neutros */
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-200: #E5E5E5;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;
```

### 3.2 Tipografías
```css
/* Títulos y headings */
font-family: 'Baloo 2', cursive;
font-weight: 600-700;

/* Cuerpo de texto y UI */
font-family: 'Asap', sans-serif;
font-weight: 400-600;
```

### 3.3 Restricciones de Diseño

| Restricción | Implementación |
|-------------|----------------|
| NO emojis | Usar `lucide-react` para iconos SVG minimalistas |
| NO gradientes | Colores sólidos únicamente: `bg-[#4247d2]` |
| Imágenes de prueba | Unsplash: `https://unsplash.com/s/photos/laptop-student` |

---

## 4. Estructura de Archivos a Generar

```
src/app/prototipos/0.2/hero/
├── page.tsx                              # Redirecciona a hero-preview
├── hero-preview/
│   └── page.tsx                          # Página con settings modal + preview
├── hero-v1/
│   └── page.tsx                          # Demo versión 1 standalone
├── hero-v2/
│   └── page.tsx                          # Demo versión 2 standalone
├── hero-v3/
│   └── page.tsx                          # Demo versión 3 standalone
├── components/
│   └── hero/
│       ├── HeroSection.tsx               # Componente wrapper principal
│       ├── HeroSettingsButton.tsx        # Botón flotante de configuración
│       ├── HeroSettingsModal.tsx         # Modal de selección de versiones
│       ├── brand/
│       │   ├── BrandIdentityV1.tsx       # Logo + tagline centrado
│       │   ├── BrandIdentityV2.tsx       # Logo lateral + mensaje
│       │   └── BrandIdentityV3.tsx       # Logo minimalista
│       ├── profile/
│       │   ├── ProfileIdentificationV1.tsx  # Modal centrado
│       │   ├── ProfileIdentificationV2.tsx  # Cards integradas
│       │   ├── ProfileIdentificationV3.tsx  # Banner sticky
│       │   └── ProfileIdentificationV4.tsx  # Sin sección (sin fricción)
│       ├── institutional/
│       │   ├── InstitutionalBannerV1.tsx    # Banner horizontal
│       │   ├── InstitutionalBannerV2.tsx    # Chip flotante
│       │   ├── InstitutionalBannerV3.tsx    # Sección dedicada
│       │   └── InstitutionalBannerV4.tsx    # Sin sección
│       ├── social-proof/
│       │   ├── SocialProofV1.tsx            # Logos en movimiento
│       │   ├── SocialProofV2.tsx            # Todos los logos visibles
│       │   └── SocialProofV3.tsx            # Contador + logos destacados
│       ├── navigation/
│       │   ├── NavbarV1.tsx                 # Navbar clásico
│       │   ├── NavbarV2.tsx                 # Navbar con mega menu
│       │   └── NavbarV3.tsx                 # Navbar minimalista
│       └── cta/
│           ├── HeroCtaV1.tsx                # Acción directa
│           ├── HeroCtaV2.tsx                # Enfoque en precio
│           └── HeroCtaV3.tsx                # Capacidad de crédito
├── types/
│   └── hero.ts                           # Tipos TypeScript del módulo
├── data/
│   └── mockHeroData.ts                   # Datos de prueba
└── HERO_README.md                        # Documentación del módulo
```

---

## 5. Preguntas del Excel - Segmento A

### 5.1 Primera Impresión (4 preguntas)

#### Pregunta A.1 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Primera impresión |
| **Pregunta** | ¿Qué elemento debe dominar el hero? (Imagen de producto, imagen de estudiante, ilustración, solo texto) |
| **Contexto** | El hero es lo primero que ve el usuario. Debe comunicar propuesta de valor en 3 segundos. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones tomando las mejores prácticas UX & UI |

**Versiones a generar:**
- **V1**: Imagen de estudiante con laptop (aspiracional, conexión emocional)
- **V2**: Producto destacado con specs resumidas (enfoque e-commerce)
- **V3**: Ilustración abstracta + mensaje potente (moderno, diferenciador)

#### Pregunta A.2 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Primera impresión |
| **Pregunta** | ¿El mensaje principal debe enfocarse en el producto (laptops) o en el beneficio (financiamiento fácil)? |
| **Contexto** | Producto atrae por features; beneficio conecta con necesidad. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: "La laptop que necesitas, desde S/49/mes" (producto + precio)
- **V2**: "Financiamiento para estudiantes sin historial crediticio" (beneficio)
- **V3**: "Tu equipo para estudiar. Aprobación en 24 horas." (híbrido)

#### Pregunta A.3 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Primera impresión |
| **Pregunta** | ¿Debe mostrarse el rango de precios/cuotas inmediatamente? |
| **Contexto** | Precio temprano filtra usuarios no calificados; ocultarlo genera más leads pero menos calificados. |
| **Respuesta** | Sí, consideramos que debe mostrarse el rango de precios/cuotas inmediatamente |

**Implementación:** Mostrar "Desde S/49/mes" prominentemente en el hero

#### Pregunta A.4 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Primera impresión |
| **Pregunta** | ¿Incluir calculadora de cuota simplificada en el hero? |
| **Contexto** | Engagement inmediato pero puede distraer del CTA principal. |
| **Respuesta** | Sí, consideramos que podría ser una buena idea |

**Implementación:** Mini-calculadora con slider de monto, muestra cuota estimada

---

### 5.2 Segmentación Visual (4 preguntas)

#### Pregunta A.5 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Segmentación visual |
| **Pregunta** | ¿Debe haber una sección de "¿Eres estudiante?" para personalizar la experiencia? |
| **Contexto** | Personalización aumenta conversión pero agrega fricción inicial. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: Modal centrado al entrar (máxima tasa de respuesta, más fricción)
- **V2**: Cards integradas en hero (mantiene flujo visual)
- **V3**: Banner sticky superior dismissible (sutil pero presente)
- **V4**: Sin sección (navegación sin fricción) - versión extra por ser crítica

#### Pregunta A.6 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Segmentación visual |
| **Pregunta** | ¿Cómo mostrar que hay convenios institucionales? (Banner, badge, sección dedicada) |
| **Contexto** | Convenios son diferenciador competitivo de BaldeCash. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: Banner horizontal debajo del hero (máxima visibilidad)
- **V2**: Chip flotante junto al logo de institución (sutil pero presente)
- **V3**: Sección dedicada con beneficios del convenio (más información)

#### Pregunta A.7 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Segmentación visual |
| **Pregunta** | ¿Los logos de instituciones aliadas deben estar en el hero o en sección aparte? |
| **Contexto** | Logos generan confianza pero pueden saturar visualmente. |
| **Respuesta** | Consideramos que los logos de instituciones aliadas deben estar en el hero |

**Implementación:** Carrusel de logos debajo del CTA principal

#### Pregunta A.8 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Segmentación visual |
| **Pregunta** | ¿Mostrar contador de "X estudiantes ya financiados" como social proof? |
| **Contexto** | Social proof aumenta confianza; número debe ser creíble. |
| **Respuesta** | Sí, consideramos que es una buena idea |

**Versiones a generar:**
- **V1**: Logos de instituciones en movimiento continuo (marquee)
- **V2**: Todos los logos visibles en grid estático
- **V3**: Contador grande "5,247+ estudiantes" + logos destacados

---

### 5.3 Confianza Inicial (4 preguntas)

#### Pregunta A.9 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Confianza inicial |
| **Pregunta** | ¿Qué trust signals mostrar? (SBS, años en el mercado, cantidad de financiamientos) |
| **Contexto** | Estudiantes desconfían de fintechs desconocidas. |
| **Respuesta** | Consideramos que debemos mostrar todos los trust signals relevantes |

**Implementación:** Badge SBS + "Desde 2020" + "10,000+ laptops financiadas"

#### Pregunta A.10 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Confianza inicial |
| **Pregunta** | ¿Incluir mini-testimonios en el hero o dejarlos para sección inferior? |
| **Contexto** | Testimonios en hero son poderosos pero ocupan espacio valioso. |
| **Respuesta** | Consideramos que los mini-testimonios deben estar en una sección inferior |

**Implementación:** Sección de testimonios después del hero, con foto + nombre + institución

#### Pregunta A.11 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Confianza inicial |
| **Pregunta** | ¿Mostrar logos de medios donde apareció BaldeCash? (RPP, Gestión, Forbes) |
| **Contexto** | "As seen in" genera credibilidad externa. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: Logos pequeños en footer del hero
- **V2**: Sección "BaldeCash en los medios" con snippets
- **V3**: No mostrar en hero, solo en página "Conócenos"

#### Pregunta A.12 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Confianza inicial |
| **Pregunta** | ¿Incluir badges de seguridad (SSL, cifrado) visibles? |
| **Contexto** | Genera confianza técnica pero puede parecer excesivo. |
| **Respuesta** | Consideramos que sí, pero de forma sutil |

**Implementación:** Icono de candado + "Conexión segura" junto al botón de solicitud

---

### 5.4 Navegación Inicial (3 preguntas)

#### Pregunta A.13 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Navegación inicial |
| **Pregunta** | ¿El navbar debe ser sticky (fijo) o desaparecer al hacer scroll? |
| **Contexto** | Sticky facilita navegación; desaparecer da más espacio al contenido. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: Sticky siempre visible con fondo sólido
- **V2**: Sticky que se oculta al bajar y aparece al subir
- **V3**: Sticky transparente que se vuelve sólido al hacer scroll

#### Pregunta A.14 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Navegación inicial |
| **Pregunta** | ¿Cuántos items mostrar en el navbar? (Simplificar vs mostrar todo) |
| **Contexto** | Menos items = menos decisiones = más conversión. |
| **Respuesta** | Consideramos que deben ser pocos items principales |

**Implementación:** Máximo 5 items: Inicio, Productos, Ofertas, FAQ, Zona Estudiantes

#### Pregunta A.15 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Navegación inicial |
| **Pregunta** | ¿El botón de "Zona Estudiantes" (login) debe ser prominente o secundario? |
| **Contexto** | Login es para usuarios existentes; nuevos usuarios son el foco. |
| **Respuesta** | Consideramos que debe ser visible pero secundario |

**Implementación:** Botón outline en navbar, no compite con CTA principal

---

### 5.5 Llamada a la Acción (3 preguntas)

#### Pregunta A.16 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Llamada a la acción |
| **Pregunta** | ¿Cuál debe ser el CTA principal? (Ver laptops, Solicitar ahora, Calcular cuota, Conocer requisitos) |
| **Contexto** | El CTA define la acción más importante que queremos que el usuario tome. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: "Ver laptops disponibles" (acción directa al catálogo)
- **V2**: "Desde S/49/mes - Solicitar ahora" (enfoque en precio)
- **V3**: "Descubre tu monto disponible" (pre-calificación sin compromiso)

#### Pregunta A.17 [ITERAR - 3 versiones]
| Campo | Valor |
|-------|-------|
| **Tema** | Llamada a la acción |
| **Pregunta** | ¿Debe haber un CTA secundario? ¿Cuál? |
| **Contexto** | Secundario para usuarios que no están listos para el principal. |
| **Respuesta** | No tenemos una idea clara, pero estamos abiertos a evaluar múltiples opciones |

**Versiones a generar:**
- **V1**: "Conocer requisitos" (informativo)
- **V2**: "¿Cómo funciona?" (educativo)
- **V3**: "Hablar con un asesor" (soporte humano)

#### Pregunta A.18 [DEFINIDO - 1 versión]
| Campo | Valor |
|-------|-------|
| **Tema** | Llamada a la acción |
| **Pregunta** | ¿Los CTAs deben incluir iconos o solo texto? |
| **Contexto** | Iconos refuerzan la acción pero pueden distraer. |
| **Respuesta** | Consideramos que los CTAs deben incluir iconos |

**Implementación:** CTA primario con icono de laptop/flecha, secundario con icono de documento/info

---

## 6. Tipos TypeScript

```typescript
// types/hero.ts

export interface HeroConfig {
  brandIdentityVersion: 1 | 2 | 3;
  profileIdentificationVersion: 1 | 2 | 3 | 4;
  institutionalBannerVersion: 1 | 2 | 3 | 4;
  socialProofVersion: 1 | 2 | 3;
  navbarVersion: 1 | 2 | 3;
  ctaVersion: 1 | 2 | 3;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  shortName: string;
  logo: string;
  hasAgreement: boolean;
  agreementType?: 'convenio_marco' | 'convenio_especifico' | 'alianza';
  specialConditions?: string;
}

export interface SocialProofData {
  studentCount: number;
  institutionCount: number;
  yearsInMarket: number;
  institutions: Institution[];
  mediaLogos: MediaLogo[];
}

export interface MediaLogo {
  name: string;
  logo: string;
  url?: string;
}

export interface TrustSignal {
  icon: React.ReactNode;
  text: string;
  tooltip?: string;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCta: CtaConfig;
  secondaryCta?: CtaConfig;
  minQuota: number;
  trustSignals: TrustSignal[];
}

export interface CtaConfig {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface QuotaCalculatorConfig {
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  terms: number[]; // [12, 18, 24, 36, 48]
  monthlyRate: number;
}
```

---

## 7. Datos de Prueba (Mock Data)

```typescript
// data/mockHeroData.ts

import { SocialProofData, HeroContent, QuotaCalculatorConfig } from '../types/hero';

export const mockSocialProof: SocialProofData = {
  studentCount: 5247,
  institutionCount: 32,
  yearsInMarket: 5,
  institutions: [
    { id: '1', code: 'UPN', name: 'Universidad Privada del Norte', shortName: 'UPN', logo: '/logos/upn.png', hasAgreement: true, agreementType: 'convenio_marco' },
    { id: '2', code: 'UPC', name: 'Universidad Peruana de Ciencias Aplicadas', shortName: 'UPC', logo: '/logos/upc.png', hasAgreement: true, agreementType: 'convenio_marco' },
    { id: '3', code: 'USIL', name: 'Universidad San Ignacio de Loyola', shortName: 'USIL', logo: '/logos/usil.png', hasAgreement: true, agreementType: 'alianza' },
    { id: '4', code: 'UCAL', name: 'Universidad de Ciencias y Artes de América Latina', shortName: 'UCAL', logo: '/logos/ucal.png', hasAgreement: true },
    { id: '5', code: 'SENATI', name: 'Servicio Nacional de Adiestramiento', shortName: 'SENATI', logo: '/logos/senati.png', hasAgreement: true },
    { id: '6', code: 'CIBERTEC', name: 'Instituto Cibertec', shortName: 'CIBERTEC', logo: '/logos/cibertec.png', hasAgreement: true },
    { id: '7', code: 'CERTUS', name: 'Instituto Certus', shortName: 'CERTUS', logo: '/logos/certus.png', hasAgreement: true },
    { id: '8', code: 'TECSUP', name: 'Instituto Tecsup', shortName: 'TECSUP', logo: '/logos/tecsup.png', hasAgreement: true },
  ],
  mediaLogos: [
    { name: 'RPP', logo: '/media/rpp.png', url: 'https://rpp.pe/...' },
    { name: 'Gestión', logo: '/media/gestion.png', url: 'https://gestion.pe/...' },
    { name: 'Forbes Perú', logo: '/media/forbes.png', url: 'https://forbes.pe/...' },
    { name: 'El Comercio', logo: '/media/elcomercio.png', url: 'https://elcomercio.pe/...' },
  ],
};

export const mockHeroContent: HeroContent = {
  headline: 'Tu laptop para estudiar',
  subheadline: 'Financiamiento para estudiantes sin historial crediticio',
  primaryCta: {
    text: 'Ver laptops disponibles',
    href: '/prototipos/0.2/catalogo',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'Conocer requisitos',
    href: '#requisitos',
    variant: 'outline',
  },
  minQuota: 49,
  trustSignals: [
    { icon: 'Shield', text: 'Registrados en SBS' },
    { icon: 'Clock', text: 'Aprobación en 24h' },
    { icon: 'CreditCard', text: 'Sin historial crediticio' },
  ],
};

export const mockQuotaCalculator: QuotaCalculatorConfig = {
  minAmount: 1000,
  maxAmount: 5000,
  defaultAmount: 2500,
  terms: [12, 18, 24, 36, 48],
  monthlyRate: 0.012, // 1.2% mensual
};
```

---

## 8. Patrón de Preview con Settings

### 8.1 Botón Flotante de Configuración

```typescript
// components/hero/HeroSettingsButton.tsx
'use client';

import { Settings } from 'lucide-react';

interface HeroSettingsButtonProps {
  onOpen: () => void;
}

export const HeroSettingsButton: React.FC<HeroSettingsButtonProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#4247d2] text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      aria-label="Configurar versiones"
    >
      <Settings className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
};
```

### 8.2 Modal de Configuración

El modal debe mostrar:
- Selectores para cada componente con iteración T
- Botones V1, V2, V3 (V4 donde aplique)
- Descripción de cada versión
- Actualización en tiempo real del preview

---

## 9. Componentes de Referencia (Patrones Existentes)

### 9.1 Estructura de Componente

```typescript
'use client';

import React from 'react';
import { Monitor, CreditCard, Shield } from 'lucide-react';
import { Button, Chip } from '@nextui-org/react';

/**
 * HeroCtaV1 - Acción Directa
 *
 * Características:
 * - CTA principal: "Ver laptops disponibles"
 * - Enfoque en explorar catálogo
 * - Ideal para: usuarios que quieren comparar opciones
 */

interface HeroCtaV1Props {
  primaryCta: CtaConfig;
  secondaryCta?: CtaConfig;
  minQuota: number;
}

export const HeroCtaV1: React.FC<HeroCtaV1Props> = ({
  primaryCta,
  secondaryCta,
  minQuota,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <Button
        size="lg"
        className="bg-[#4247d2] text-white font-semibold px-8"
        endContent={<Monitor className="w-5 h-5" />}
        as="a"
        href={primaryCta.href}
      >
        {primaryCta.text}
      </Button>
      
      {secondaryCta && (
        <Button
          size="lg"
          variant="bordered"
          className="border-[#4247d2] text-[#4247d2] font-semibold px-8"
          as="a"
          href={secondaryCta.href}
        >
          {secondaryCta.text}
        </Button>
      )}
      
      <p className="text-sm text-neutral-500">
        Sin historial crediticio · Aprobación en 24 horas · Desde S/{minQuota}/mes
      </p>
    </div>
  );
};
```

---

## 10. URLs de Acceso

| Ruta | Descripción |
|------|-------------|
| `/prototipos/0.2/hero` | Redirecciona a preview |
| `/prototipos/0.2/hero/hero-preview` | Comparador con settings modal |
| `/prototipos/0.2/hero/hero-v1` | Demo versión 1 standalone |
| `/prototipos/0.2/hero/hero-v2` | Demo versión 2 standalone |
| `/prototipos/0.2/hero/hero-v3` | Demo versión 3 standalone |

---

## 11. Checklist de Entregables

- [ ] `types/hero.ts` - Tipos TypeScript completos
- [ ] `data/mockHeroData.ts` - Datos de prueba
- [ ] `HeroSection.tsx` - Componente wrapper
- [ ] `HeroSettingsButton.tsx` - Botón flotante
- [ ] `HeroSettingsModal.tsx` - Modal de configuración
- [ ] `BrandIdentityV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `ProfileIdentificationV1.tsx`, `V2.tsx`, `V3.tsx`, `V4.tsx`
- [ ] `InstitutionalBannerV1.tsx`, `V2.tsx`, `V3.tsx`, `V4.tsx`
- [ ] `SocialProofV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `NavbarV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `HeroCtaV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `hero-preview/page.tsx`
- [ ] `hero-v1/page.tsx`, `hero-v2/page.tsx`, `hero-v3/page.tsx`
- [ ] `HERO_README.md`

---

## 12. Comando de Ejecución

```bash
# En Claude Terminal, ejecutar:
cd /ruta/a/tu/proyecto

# Leer el prompt y generar componentes
# Claude generará todos los archivos siguiendo la estructura especificada
```

---

## 13. Notas Importantes

1. **Mobile-First**: Diseñar primero para 375px, luego escalar
2. **Performance**: Lazy load de imágenes, optimizar para 3G
3. **Accesibilidad**: Contraste WCAG AA, focus states, aria labels
4. **Animaciones**: Sutiles con framer-motion, respetando `prefers-reduced-motion`
5. **Sin gradientes**: Usar colores sólidos únicamente
6. **Sin emojis**: Usar Lucide icons exclusivamente
