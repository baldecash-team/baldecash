# BaldeCash Prototipos 0.4 - Especificaciones

## Resumen

La versión 0.4 implementa un sistema de componentes modulares con 6 versiones visuales para cada elemento principal. Cada módulo permite comparar y seleccionar la mejor versión de UI/UX.

## Arquitectura

```
src/app/prototipos/0.4/
├── hero/                    # Landing page principal
├── convenio/                # Landing pages de convenios institucionales
├── catalogo/                # Catálogo de productos
├── producto/                # Detalle de producto
├── comparador/              # Comparador de productos
├── quiz/                    # Quiz de selección de producto
├── wizard-solicitud/        # Formulario de solicitud (wizard)
├── upsell/                  # Flujo de upsell (seguros, accesorios)
├── resultado/               # Pantallas de resultado (aprobado/rechazado)
└── SPECS.md                 # Este archivo
```

## Módulos

### 1. Hero Landing (`/hero`)
Landing page principal con hero banner, social proof y CTAs.

**Componentes con 6 versiones:**
- `HeroBannerV1-V6` - Banner principal
- `NavbarV1-V6` - Barra de navegación
- `SocialProofV1-V6` - Prueba social
- `HeroCtaV1-V6` - Call to actions → **Navegan a Catálogo**
- `FooterV1-V6` - Pie de página
- `HowItWorksV1-V6` - Sección "Cómo funciona"
- `FaqSectionV1-V6` - Preguntas frecuentes

**Rutas:**
- `/prototipos/0.4/hero` - Preview con selector de versiones
- `/prototipos/0.4/hero/hero-v1` - Solo versión 1
- `/prototipos/0.4/hero/hero-v2` - Solo versión 2
- etc.

### 2. Convenio (`/convenio`)
Landings personalizadas para convenios institucionales.

**Componentes con 6 versiones:**
- `ConvenioHeroV1-V6` - Hero de convenio
- `ConvenioNavbarV1-V6` - Navbar de convenio
- `ConvenioBenefitsV1-V6` - Beneficios
- `ConvenioTestimonialsV1-V6` - Testimonios
- `ConvenioFaqV1-V6` - FAQ de convenio
- `ConvenioCtaV1-V6` - CTAs de convenio
- `ConvenioFooterV1-V6` - Footer de convenio

### 3. Catálogo (`/catalogo`)
Catálogo de productos con filtros y cards.

**Componentes con 6 versiones:**
- `CatalogLayoutV1-V6` - Layout del catálogo
- `ProductCardV1-V6` - Card de producto
- `BrandFilterV1-V6` - Filtro por marca
- `EmptyIllustrationV1-V6` - Estado vacío
- `EmptyActionsV1-V6` - Acciones estado vacío

### 4. Producto (`/producto`)
Detalle de producto con specs, galería y cronograma.

**Componentes con 6 versiones:**
- `ProductGalleryV1-V6` - Galería de imágenes
- `ProductInfoHeaderV1-V6` - Header con info
- `SpecsDisplayV1-V6` - Especificaciones
- `PricingCalculatorV1-V6` - Calculadora de precios
- `CronogramaV1-V6` - Cronograma de pagos
- `DetailTabsV1-V6` - Tabs de detalle
- `SimilarProductsV1-V6` - Productos similares
- `CertificationsV1-V6` - Certificaciones
- `ProductLimitationsV1-V6` - Limitaciones (honestidad)

### 5. Comparador (`/comparador`)
Comparador de productos lado a lado.

**Componentes con 6 versiones:**
- `ComparatorLayoutV1-V6` - Layout del comparador
- `ComparisonTableV1-V6` - Tabla de comparación

### 6. Quiz (`/quiz`)
Quiz interactivo para selección de producto.

**Componentes con 6 versiones:**
- `QuizLayoutV1-V6` - Layout del quiz
- `QuizQuestionV1-V6` - Preguntas
- `QuizResultsV1-V6` - Resultados

### 7. Wizard Solicitud (`/wizard-solicitud`)
Formulario de solicitud de financiamiento.

**Componentes con 6 versiones:**

#### Layouts:
- `WizardLayoutV1` - Fullscreen sin distracciones (estilo 0.3)
  - Header minimalista con logo
  - Estimador de tiempo restante
  - Progress component configurable
  - Animaciones de transición

- `WizardLayoutV2` - Header con branding (estilo 0.3)
  - Header púrpura con branding
  - Progress bar integrada
  - Botón de retroceso
  - Contador de pasos

- `WizardLayoutV3-V6` - Otras variantes

#### Campos:
- `InputFieldV1-V6` - Campos de texto
- `DatePickerFieldV1-V6` - Selectores de fecha
  - **V2**: Calendario inline con label flotante V6 (borde animado, sin icono)
  - **V6**: Slider de edad + selección de mes/día
- `SelectCardsV1-V6` - Selección con cards
- `UploadFieldV1-V6` - Subida de archivos

#### Progress:
- `ProgressIndicatorV1-V6` - Indicador de progreso

#### Navegación:
- `WizardNavigationV1-V6` - Botones de navegación

### 8. Upsell (`/upsell`)
Flujo de upsell de seguros y accesorios.

**Componentes con 6 versiones:**

#### Seguros:
- `InsuranceIntroV1-V6` - Intro de seguro
- `CoverageDisplayV1-V6` - Display de cobertura
- `PlanComparisonV1-V6` - Comparación de planes
- `SkipModalV1-V6` - Modal de "saltar"

#### Accesorios:
- `AccessoryCardV1-V6` - Card de accesorio
- `AccessoryIntroV1-V6` - Intro de accesorios
- `PriceBreakdownV1-V6` - Desglose de precios
- `SelectionIndicatorV1-V6` - Indicador de selección

### 9. Resultado (`/resultado`)
Pantallas de resultado de solicitud.

**Componentes con 6 versiones:**

#### Aprobado:
- `CelebrationV1-V6` - Animación de celebración
- `ConfettiV1-V6` - Confetti
- `ApprovedSummaryV1-V6` - Resumen aprobado
- `NextStepsV1-V6` - Próximos pasos
- `ShareButtonsV1-V6` - Compartir
- `ReferralCTAV1-V6` - CTA de referidos

#### Rechazado:
- `RejectionVisualV1-V6` - Visual de rechazo
- `ExplanationFramingV1-V6` - Explicación
- `AlternativesLayoutV1-V6` - Alternativas
- `ProductAlternativesV1-V6` - Productos alternativos
- `EmailCaptureV1-V6` - Captura de email
- `AdvisorCTAV1-V6` - CTA de asesor

## Colores de Marca

```css
--brand-primary: #4654CD;     /* Azul BaldeCash */
--brand-secondary: #03DBD0;   /* Aqua/Turquesa */
--success: #22c55e;           /* Verde éxito */
--warning: #f59e0b;           /* Ámbar advertencia */
--error: #ef4444;             /* Rojo error */
```

## Tipografías

- **Baloo 2** - Headings y títulos
- **Asap** - Cuerpo de texto y UI

## Navegación Principal

Los botones de CTA del Hero landing ahora navegan directamente al Catálogo:
- Todos los `HeroCtaV1-V6` → `/prototipos/0.4/catalogo`

## Flujo de Usuario

```
1. Hero Landing (/hero)
   └── Ver productos → Catálogo

2. Catálogo (/catalogo)
   └── Seleccionar producto → Detalle

3. Detalle Producto (/producto)
   └── Solicitar → Wizard

4. Wizard Solicitud (/wizard-solicitud)
   └── Completar → Upsell

5. Upsell (/upsell)
   └── Continuar → Resultado

6. Resultado (/resultado)
   └── Aprobado/Rechazado
```

## Uso

### Desarrollo Local
```bash
npm run dev
# Navegar a: http://localhost:3000/prototipos/0.4
```

### Seleccionar Versiones
Cada módulo tiene una página de preview con selectores para cambiar entre las 6 versiones de cada componente en tiempo real.

### Implementar en Producción
```typescript
import { HeroSection } from "@/app/prototipos/0.4/hero/components/hero";

<HeroSection
  config={{
    heroBannerVersion: 1,
    navbarVersion: 2,
    ctaVersion: 3,
    socialProofVersion: 1,
    footerVersion: 1,
    howItWorksVersion: 2,
    faqVersion: 1,
  }}
/>
```

## Changelog

### 0.4.1 (2025-12-23)
- **DatePickerFieldV2**: Label estilo V6 con borde animado, sin icono
- **WizardLayoutV1/V2**: Actualizados con estilos de 0.3 (time estimate, progress, animaciones)
- **HeroCtaV1-V6**: Todos navegan a Catálogo con texto "Ver productos"
- **Documentación**: Agregado SPECS.md

---

**Versión**: 0.4.1
**Última actualización**: 2025-12-23
**Generado por**: Claude Code
