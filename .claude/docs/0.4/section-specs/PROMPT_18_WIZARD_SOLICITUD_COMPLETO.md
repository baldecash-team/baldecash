# Prompt #18: Wizard + Solicitud Completo - BaldeCash Web 4.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | WIZARD_SOLICITUD |
| **Incluye** | PROMPT_08 a PROMPT_13 + PROMPT_SOLICITUD |
| **Versiones por componente** | 6 |
| **Prioridad** | Alta - MVP Core |
| **Comando** | `/iterar 18 0.4` |

---

## 1. Descripcion

Este prompt es un **meta-prompt** que combina todo el flujo de solicitud en una sola iteracion:

1. **Paso 1: Datos Personales** - DNI, nombres, contacto (inicia directamente aqui)
2. **Paso 2: Datos Academicos** - Institucion, carrera, ciclo
3. **Paso 3: Datos Economicos** - Ingresos, empleo
4. **Paso 4: Resumen** - Confirmacion final

> **Nota:** La vista de intro fue removida. El wizard inicia directamente con Datos Personales.

**Objetivo:** Generar el flujo completo de solicitud como un solo componente integrado, similar a `/prototipos/0.3/solicitud/` pero con 6 versiones iterables.

---

## 2. Prompts Incluidos

| Prompt | Seccion | Decisiones Aplicadas |
|--------|---------|----------------------|
| PROMPT_08 | Wizard Estructura | C.x (estructura general) |
| PROMPT_09 | Campos/Componentes | C1.x (ver decisiones abajo) |
| PROMPT_10 | Datos Personales | Campos especificos |
| PROMPT_11 | Datos Academicos | Campos especificos |
| PROMPT_12 | Datos Economicos | Campos especificos |
| PROMPT_13 | Resumen | Confirmacion |

> **Nota:** PROMPT_SOLICITUD (Vista Intro) fue removido del flujo.

---

## 3. Decisiones Finales Aplicadas

### 3.1 Wizard - Campos (C1.x) - 6 versiones cada uno

| ID | Componente | Preferido | Implementacion |
|----|------------|-----------|----------------|
| C1.1 | Labels | **UNIFIED** | Integrado en InputFieldUnified |
| C1.4 | Inputs | **UNIFIED** | InputFieldUnified con 6 versiones |
| C1.13 | Opciones | **V3** | Cards grid SOLO si <= 6 opciones |
| C1.15 | Upload | **V3** | Area drag & drop combinado con boton |
| C1.16 | Preview | **V1** | Thumbnail simple (6 versiones disponibles) |
| C1.17 | Progreso | **V1** | Barra horizontal (6 versiones disponibles) |
| C1.21 | Validacion | **V1** | Mostrar todos los errores arriba |
| C1.23 | Errores | **V1** | Debajo del campo inline |
| C1.24 | Estilo error | **V1** | Borde rojo |
| C1.28 | Ayuda | **V1** | Tooltip hover/click |
| C1.29 | Ejemplos docs | **V2** | Gallery en modal |

### 3.2 InputFieldUnified - Versiones

| Version | Estilo | Descripcion |
|---------|--------|-------------|
| V1 | Label arriba clasico | Label siempre visible arriba del input |
| V2 | Material Design | Label flotante animado (sube al enfocar) |
| V3 | Label lateral izquierdo | Label a la izquierda, input a la derecha |
| V4 | Label lateral con badge | Label izquierdo + badge requerido/opcional |
| V5 | Label lateral compacto | Label inline compacto |
| V6 | Label grande hero | Label grande, input prominente |

---

## 4. Estructura de Archivos

```
src/app/prototipos/0.4/wizard-solicitud/
├── page.tsx                              # Redirect a preview
├── wizard-preview/
│   └── page.tsx                          # Preview con Settings Modal
├── components/
│   └── wizard-solicitud/
│       ├── WizardSolicitudContainer.tsx  # Container principal (sin intro)
│       ├── WizardSolicitudSettingsModal.tsx
│       │
│       ├── wizard/                       # Estructura Wizard (C.x) - 6 versiones
│       │   ├── WizardLayoutV1.tsx        # Layout clasico vertical
│       │   ├── WizardLayoutV2.tsx        # Layout con sidebar
│       │   ├── WizardLayoutV3.tsx        # Layout minimalista
│       │   ├── WizardLayoutV4.tsx        # Layout fintech/cards
│       │   ├── WizardLayoutV5.tsx        # Layout split
│       │   ├── WizardLayoutV6.tsx        # Layout conversacional
│       │   ├── ProgressIndicatorV1.tsx   # Steps numerados
│       │   ├── ProgressIndicatorV2.tsx   # Barra de progreso
│       │   ├── ProgressIndicatorV3.tsx   # Dots/circles
│       │   ├── ProgressIndicatorV4.tsx   # Porcentaje numerico
│       │   ├── ProgressIndicatorV5.tsx   # Timeline vertical
│       │   ├── ProgressIndicatorV6.tsx   # Chips clickeables
│       │   ├── WizardNavigationV1.tsx    # Botones clasicos
│       │   ├── WizardNavigationV2.tsx    # Botones con iconos
│       │   ├── WizardNavigationV3.tsx    # FAB flotante
│       │   ├── WizardNavigationV4.tsx    # Bottom bar fixed
│       │   ├── WizardNavigationV5.tsx    # Inline con form
│       │   ├── WizardNavigationV6.tsx    # Swipe gestures
│       │   └── index.ts
│       │
│       ├── fields/                       # Componentes de campos (C1.x)
│       │   ├── InputFieldUnified.tsx     # [NUEVO] Label+Input combinados - 6 versiones
│       │   │   # V1: Label arriba clasico
│       │   │   # V2: Material Design (label flotante)
│       │   │   # V3: Label lateral izquierdo
│       │   │   # V4: Label lateral con badge
│       │   │   # V5: Label lateral compacto
│       │   │   # V6: Label grande hero
│       │   ├── InputFieldV1-V6.tsx       # [LEGACY] Inputs separados
│       │   ├── labels/                   # [LEGACY] Labels separados
│       │   ├── LabelV2.tsx               # Label izquierda
│       │   ├── LabelV3.tsx               # Label flotante
│       │   ├── LabelV4.tsx               # Label bold grande
│       │   ├── LabelV5.tsx               # Label con icono
│       │   ├── LabelV6.tsx               # Label minimal
│       │   ├── SelectCardsV1.tsx         # Cards verticales
│       │   ├── SelectCardsV2.tsx         # Cards horizontales
│       │   ├── SelectCardsV3.tsx         # Cards grid [PREFERIDO]
│       │   ├── SelectCardsV4.tsx         # Cards con iconos grandes
│       │   ├── SelectCardsV5.tsx         # Chips inline
│       │   ├── SelectCardsV6.tsx         # Cards expandibles
│       │   ├── UploadFieldV1.tsx         # Boton simple
│       │   ├── UploadFieldV2.tsx         # Dropzone basico
│       │   ├── UploadFieldV3.tsx         # Drag & drop + boton [PREFERIDO]
│       │   ├── UploadFieldV4.tsx         # Card con preview
│       │   ├── UploadFieldV5.tsx         # Camera + gallery
│       │   ├── UploadFieldV6.tsx         # Multi-file grid
│       │   ├── UploadPreviewV1.tsx       # Thumbnail simple
│       │   ├── UploadPreviewV2.tsx       # Thumbnail + nombre
│       │   ├── UploadPreviewV3.tsx       # Preview grande modal
│       │   ├── UploadPreviewV4.tsx       # Card con acciones
│       │   ├── UploadPreviewV5.tsx       # Gallery carousel
│       │   ├── UploadPreviewV6.tsx       # List view detallado
│       │   ├── UploadProgressV1.tsx      # Barra horizontal
│       │   ├── UploadProgressV2.tsx      # Circular spinner
│       │   ├── UploadProgressV3.tsx      # Porcentaje numerico
│       │   ├── UploadProgressV4.tsx      # Skeleton loading
│       │   ├── UploadProgressV5.tsx      # Steps de procesamiento
│       │   ├── UploadProgressV6.tsx      # Minimal dots
│       │   ├── ValidationSummaryV1.tsx   # Lista errores arriba [PREFERIDO]
│       │   ├── ValidationSummaryV2.tsx   # Toast/snackbar
│       │   ├── ValidationSummaryV3.tsx   # Banner dismissible
│       │   ├── ValidationSummaryV4.tsx   # Modal bloqueante
│       │   ├── ValidationSummaryV5.tsx   # Sidebar de errores
│       │   ├── ValidationSummaryV6.tsx   # Inline por seccion
│       │   ├── FieldErrorV1.tsx          # Texto rojo debajo [PREFERIDO]
│       │   ├── FieldErrorV2.tsx          # Tooltip error
│       │   ├── FieldErrorV3.tsx          # Badge lateral
│       │   ├── FieldErrorV4.tsx          # Shake + borde
│       │   ├── FieldErrorV5.tsx          # Icon + texto
│       │   ├── FieldErrorV6.tsx          # Highlight campo
│       │   ├── HelpTooltipV1.tsx         # Tooltip hover [PREFERIDO]
│       │   ├── HelpTooltipV2.tsx         # Popover click
│       │   ├── HelpTooltipV3.tsx         # Texto inline
│       │   ├── HelpTooltipV4.tsx         # Modal ayuda
│       │   ├── HelpTooltipV5.tsx         # Drawer lateral
│       │   ├── HelpTooltipV6.tsx         # Expandible accordion
│       │   ├── DocExamplesModalV1.tsx    # Lista simple
│       │   ├── DocExamplesModalV2.tsx    # Gallery modal [PREFERIDO]
│       │   ├── DocExamplesModalV3.tsx    # Carousel fullscreen
│       │   ├── DocExamplesModalV4.tsx    # Grid con zoom
│       │   ├── DocExamplesModalV5.tsx    # Tabs por tipo
│       │   ├── DocExamplesModalV6.tsx    # Inline expandible
│       │   └── index.ts
│       │
│       ├── steps/                        # Pasos del wizard
│       │   ├── StepContent.tsx           # Renderizador dinamico
│       │   ├── Step1DatosPersonales.tsx
│       │   ├── Step2DatosAcademicos.tsx
│       │   ├── Step3DatosEconomicos.tsx
│       │   └── Step4Resumen.tsx
│       │
│       └── shared/
│           ├── BaldiMascot.tsx           # Componente de Baldi reutilizable
│           └── ProductPreview.tsx
│
├── types/
│   └── wizard-solicitud.ts
├── data/
│   └── wizardSolicitudSteps.ts
└── WIZARD_SOLICITUD_README.md
```

---

## 5. Tipos TypeScript

```typescript
// types/wizard-solicitud.ts

export interface WizardSolicitudConfig {
  // === VISTA SOLICITUD (B.x) ===
  // B.1 - Header
  headerVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.2 - Titulo
  titleVersion: 1 | 2 | 3 | 4 | 5 | 6;
  titleVersionMobile: 1 | 2 | 3 | 4 | 5 | 6;

  // B.3 - Mensaje motivacional
  messageVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.5 - Hero (Baldi)
  heroVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.6 - CTA
  ctaVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // === WIZARD ESTRUCTURA (C.x) ===
  // C.1 - Layout general
  wizardLayoutVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C.5 - Indicador de progreso
  progressVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C.14 - Navegacion
  navigationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // === CAMPOS (C1.x) ===
  // C1.1 - Labels
  labelVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.4 - Inputs
  inputVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.13 - Opciones (cards)
  optionsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.15 - Upload
  uploadVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.16 - Preview [CORREGIR]
  previewVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.17 - Progreso upload [CORREGIR]
  uploadProgressVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.21 - Validacion
  validationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.23 - Errores
  errorVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.28 - Ayuda
  helpVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C1.29 - Ejemplos docs
  docExamplesVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

// Configuracion con decisiones aplicadas
export const defaultWizardSolicitudConfig: WizardSolicitudConfig = {
  // Vista Solicitud
  headerVersion: 2,          // B.1 - Con producto
  titleVersion: 2,           // B.2 - Con "Ahora" (desktop)
  titleVersionMobile: 3,     // B.2 - Sin "Ahora" (mobile)
  messageVersion: 1,         // B.3 - Beneficios
  heroVersion: 3,            // B.5 - Baldi
  ctaVersion: 3,             // B.6 - Card con Baldi

  // Wizard Estructura
  wizardLayoutVersion: 1,
  progressVersion: 1,
  navigationVersion: 1,

  // Campos
  labelVersion: 1,           // C1.1 - Label arriba
  inputVersion: 3,           // C1.4 - Filled (o 1 para bordes)
  optionsVersion: 3,         // C1.13 - Cards (si <= 6 opciones)
  uploadVersion: 3,          // C1.15 - Drag & drop + boton
  previewVersion: 1,         // C1.16 - [CORREGIR]
  uploadProgressVersion: 1,  // C1.17 - [CORREGIR]
  validationVersion: 1,      // C1.21 - Errores arriba
  errorVersion: 1,           // C1.23/24 - Inline + borde rojo
  helpVersion: 1,            // C1.28 - Tooltip
  docExamplesVersion: 2,     // C1.29 - Gallery modal
};

export interface WizardSolicitudStep {
  id: string;
  code: 'intro' | 'personal' | 'academico' | 'economico' | 'resumen';
  name: string;
  shortName: string;
  icon: string;
  estimatedMinutes: number;
  fields: FieldConfig[];
}

export interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'radio' | 'checkbox' | 'upload' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: FieldOption[];
  helpText?: string;
  showDocExamples?: boolean;
}

export interface FieldOption {
  value: string;
  label: string;
  icon?: string;
}
```

---

## 6. Flujo de Pantallas

```
┌─────────────────────────────────────────────────────────────┐
│                    WIZARD SOLICITUD                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  INTRO (B.x)                                         │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │     [Baldi Hero V3]                           │  │    │
│  │  │                                               │  │    │
│  │  │     "¡Ya casi tienes tu laptop!"              │  │    │
│  │  │     Solo 5 minutos                            │  │    │
│  │  │                                               │  │    │
│  │  │     [Empezar solicitud]                       │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PASO 1: Datos Personales                            │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  [1]──[2]──[3]──[4]  Progreso                 │  │    │
│  │  │                                               │  │    │
│  │  │  DNI: [________]  ← C1.1 Label arriba         │  │    │
│  │  │  Nombres: [________]  ← C1.4 Filled/Bordes    │  │    │
│  │  │  Apellidos: [________]                        │  │    │
│  │  │  Email: [________]                            │  │    │
│  │  │                                               │  │    │
│  │  │  [Regresar]          [Continuar]              │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PASO 2: Datos Academicos                            │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  Institucion: [Cards V3 si <= 6]              │  │    │
│  │  │  ┌────┐ ┌────┐ ┌────┐                         │  │    │
│  │  │  │UPC │ │PUCP│ │UNI │  ← C1.13 Cards          │  │    │
│  │  │  └────┘ └────┘ └────┘                         │  │    │
│  │  │                                               │  │    │
│  │  │  Carrera: [________]                          │  │    │
│  │  │  Ciclo: [________]                            │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PASO 3: Datos Economicos                            │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  Fuente de ingresos: [Cards]                  │  │    │
│  │  │  Monto: [________]                            │  │    │
│  │  │                                               │  │    │
│  │  │  Comprobante: ← C1.15 Drag & drop             │  │    │
│  │  │  ┌─────────────────────────────────┐          │  │    │
│  │  │  │  Arrastra tu archivo aqui      │          │  │    │
│  │  │  │  o haz clic para seleccionar   │          │  │    │
│  │  │  └─────────────────────────────────┘          │  │    │
│  │  │  [Ver ejemplos] ← C1.29 Gallery modal         │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PASO 4: Resumen                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  Revisa tu solicitud                          │  │    │
│  │  │                                               │  │    │
│  │  │  Datos Personales: [Editar]                   │  │    │
│  │  │  Juan Perez - 12345678                        │  │    │
│  │  │                                               │  │    │
│  │  │  Producto: HP Laptop 15"                      │  │    │
│  │  │  Cuota: S/149/mes x 12 meses                  │  │    │
│  │  │                                               │  │    │
│  │  │  [Enviar solicitud]                           │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Componente Principal

```typescript
'use client';

import React, { useState } from 'react';
import { WizardSolicitudConfig, defaultWizardSolicitudConfig } from '../types/wizard-solicitud';

// Intro components (B.x)
import { SolicitudIntroV1, SolicitudIntroV2, SolicitudIntroV3 } from './intro';

// Wizard components (C.x)
import { WizardLayoutV1, WizardLayoutV2, WizardLayoutV3 } from './wizard';

// Step components
import { Step1DatosPersonales } from './steps/Step1DatosPersonales';
import { Step2DatosAcademicos } from './steps/Step2DatosAcademicos';
import { Step3DatosEconomicos } from './steps/Step3DatosEconomicos';
import { Step4Resumen } from './steps/Step4Resumen';

interface WizardSolicitudContainerProps {
  config?: Partial<WizardSolicitudConfig>;
  selectedProduct?: {
    id: string;
    name: string;
    thumbnail: string;
    monthlyQuota: number;
  };
}

type WizardPhase = 'intro' | 'wizard';

export const WizardSolicitudContainer: React.FC<WizardSolicitudContainerProps> = ({
  config: customConfig,
  selectedProduct,
}) => {
  const config = { ...defaultWizardSolicitudConfig, ...customConfig };
  const [phase, setPhase] = useState<WizardPhase>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Renderizar fase Intro (B.x)
  if (phase === 'intro') {
    const IntroComponent = getIntroComponent(config.heroVersion);
    return (
      <IntroComponent
        config={config}
        selectedProduct={selectedProduct}
        onStart={() => setPhase('wizard')}
      />
    );
  }

  // Renderizar fase Wizard (C.x)
  const LayoutComponent = getLayoutComponent(config.wizardLayoutVersion);

  return (
    <LayoutComponent config={config}>
      {currentStep === 0 && (
        <Step1DatosPersonales
          config={config}
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(1);
          }}
        />
      )}
      {currentStep === 1 && (
        <Step2DatosAcademicos
          config={config}
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(2);
          }}
          onBack={() => setCurrentStep(0)}
        />
      )}
      {currentStep === 2 && (
        <Step3DatosEconomicos
          config={config}
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(3);
          }}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step4Resumen
          config={config}
          data={formData}
          selectedProduct={selectedProduct}
          onSubmit={() => console.log('Submit:', formData)}
          onBack={() => setCurrentStep(2)}
          onEdit={(step) => setCurrentStep(step)}
        />
      )}
    </LayoutComponent>
  );
};
```

---

## 8. Assets Requeridos

### Caricatura de Baldi

**Ubicacion:** `/public/images/baldi-mascot.svg`

**Variantes necesarias:**
| Variante | Uso | Archivo |
|----------|-----|---------|
| Baldi saludando | Hero intro | `baldi-wave.svg` |
| Baldi celebrando | Confirmacion | `baldi-celebrate.svg` |
| Baldi pensando | Loading | `baldi-thinking.svg` |
| Baldi pulgar arriba | Paso completado | `baldi-thumbsup.svg` |

**Especificaciones:**
- Formato: SVG (preferido)
- Estilo: Caricatura amigable, flat o semi-flat
- Colores: Paleta de marca (#4654CD, #03DBD0, #22c55e)

---

## 9. URLs de Acceso

```
/prototipos/0.4/wizard-solicitud                    → Redirect a preview
/prototipos/0.4/wizard-solicitud/wizard-preview     → Preview con Settings Modal
/prototipos/0.4/wizard-solicitud/wizard-v1          → V1: Foto Producto
/prototipos/0.4/wizard-solicitud/wizard-v2          → V2: Foto Lifestyle
/prototipos/0.4/wizard-solicitud/wizard-v3          → V3: Ilustracion Flat
/prototipos/0.4/wizard-solicitud/wizard-v4          → V4: Fintech/Data
/prototipos/0.4/wizard-solicitud/wizard-v5          → V5: Bold/Impact
/prototipos/0.4/wizard-solicitud/wizard-v6          → V6: Interactivo
```

---

## 10. Checklist de Entregables

### Componentes Intro (B.x) - 6 versiones cada uno
| Componente | V1 | V2 | V3 | V4 | V5 | V6 | Preferido |
|------------|----|----|----|----|----|----|-----------|
| SolicitudIntro | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V3 (Baldi) |

### Componentes Wizard (C.x) - 6 versiones cada uno
| Componente | V1 | V2 | V3 | V4 | V5 | V6 | Preferido |
|------------|----|----|----|----|----|----|-----------|
| WizardLayout | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 |
| ProgressIndicator | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 |
| WizardNavigation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 |

### Componentes Campos (C1.x) - 6 versiones cada uno
| Componente | V1 | V2 | V3 | V4 | V5 | V6 | Preferido |
|------------|----|----|----|----|----|----|-----------|
| InputField | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V3 (Filled) |
| Label | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 (Arriba) |
| SelectCards | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V3 (Grid) |
| UploadField | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V3 (Drag&Drop) |
| UploadPreview | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 |
| UploadProgress | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 |
| ValidationSummary | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 (Arriba) |
| FieldError | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 (Inline) |
| HelpTooltip | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V1 (Hover) |
| DocExamplesModal | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | V2 (Gallery) |

### Resumen de Componentes
| Categoria | Componentes | Versiones | Total Archivos |
|-----------|-------------|-----------|----------------|
| Intro | 1 | 6 | 6 |
| Wizard | 3 | 6 | 18 |
| Fields | 10 | 6 | 60 |
| **Total** | **14** | **6** | **84** |

### Pasos del Wizard
- [ ] `StepContent.tsx` (renderizador dinamico)
- [ ] `Step1DatosPersonales.tsx`
- [ ] `Step2DatosAcademicos.tsx`
- [ ] `Step3DatosEconomicos.tsx`
- [ ] `Step4Resumen.tsx`

### Container y Config
- [ ] `WizardSolicitudContainer.tsx`
- [ ] `WizardSolicitudSettingsModal.tsx`
- [ ] `types/wizard-solicitud.ts`
- [ ] `data/wizardSolicitudSteps.ts`

### Index Files (exports)
- [ ] `intro/index.ts`
- [ ] `wizard/index.ts`
- [ ] `fields/index.ts`

### Assets
- [ ] `baldi-wave.svg`
- [ ] `baldi-celebrate.svg`
- [ ] `baldi-thinking.svg`
- [ ] `baldi-thumbsup.svg`

### Documentacion
- [ ] `WIZARD_SOLICITUD_README.md`

---

## 11. Descripcion de Versiones por Componente

### Headers (B.1) - Implementados en SolicitudIntroV1.tsx
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Ultra minimalista - Solo texto "Solicitud de financiamiento" centrado | Minimal |
| V2 | Producto prominente con fondo gradiente azul, thumbnail + precio | E-commerce |
| V3 | Steps progress con iconos numerados + producto en card | Progress-focused |
| V4 | Dark mode con acento neon, icono Zap, timer | Fintech premium |
| V5 | Split moderno - Logo "B" izquierda, producto derecha en card | Balanceado |
| V6 | Bold gigante centrado - "BaldeCash" con animacion scale | Impactante |

### Heroes (B.5) - Implementados en SolicitudIntroV1.tsx
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Foto del producto simple en card blanca con sombra | E-commerce clasico |
| V2 | Dashboard fintech con metricas animadas (0% inicial, 12 cuotas, 24h) | Data-driven |
| V3 | Baldi mascota con burbuja de chat **[PREFERIDO]** | Identidad de marca |
| V4 | Timeline de proceso dark mode con pasos animados | Process-focused |
| V5 | Card con producto destacado + Baldi como asistente | Informativo |
| V6 | Reward unlocked - Card celebration con confetti animado y producto | Gamificado |

### CTAs (B.6) - Implementados en SolicitudIntroV1.tsx
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Boton simple con icono flecha | Minimal |
| V2 | Boton full-width + badges de confianza horizontales | Trustworthy |
| V3 | Card completa con Baldi, tiempo estimado y beneficios **[PREFERIDO]** | Informativo |
| V4 | Boton gigante con shadow de color y efecto hover scale | Impactante |
| V5 | Fixed bottom sticky bar con gradiente y trust text | Mobile-first |
| V6 | Boton XL fullwidth con animacion de brillo deslizante | Premium |

### WizardLayout (C.x)
| Version | Descripcion | Uso |
|---------|-------------|-----|
| V1 | Layout vertical clasico, progreso arriba | Default |
| V2 | Layout con sidebar de progreso lateral | Desktop |
| V3 | Layout minimalista, sin distracciones | Focus |
| V4 | Layout con cards por seccion | Fintech |
| V5 | Split: progreso izq + form derecha | Wide screens |
| V6 | Layout conversacional (chat-like) | Mobile-first |

### ProgressIndicator (C.x)
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Steps numerados con linea conectora | Clasico |
| V2 | Barra de progreso horizontal | Minimal |
| V3 | Dots/circles clickeables | Moderno |
| V4 | Porcentaje numerico grande | Data-driven |
| V5 | Timeline vertical con descripciones | Detallado |
| V6 | Chips clickeables con iconos | Interactivo |

### WizardNavigation (C.14) - Implementados en wizard/
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Botones clasicos con texto "Atras" / "Siguiente" | Default |
| V2 | Botones con iconos prominentes | Icon-focused |
| V3 | FAB flotante circular con animacion | Minimal |
| V4 | Bottom bar con progress bar animado integrado y trust badge | Fintech moderno |
| V5 | Pills flotantes en esquinas con AnimatePresence | Minimal elegante |
| V6 | Full branded bar gradiente con CTA XL y onda neon animada | Premium impactante |

### InputField (C1.4)
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Bordes clasicos rectangulares | Tradicional |
| V2 | Solo linea inferior (underline) | Material |
| V3 | Fondo filled gris claro **[PREFERIDO]** | Moderno |
| V4 | Floating label animado | Elegante |
| V5 | Estilo card con sombra | Prominente |
| V6 | Inline compacto para formularios densos | Eficiente |

### SelectCards (C1.13)
| Version | Descripcion | Uso |
|---------|-------------|-----|
| V1 | Cards apiladas verticalmente | Listas largas |
| V2 | Cards horizontales en fila | Pocas opciones |
| V3 | Grid responsive 2-3 columnas **[PREFERIDO]** | <= 6 opciones |
| V4 | Cards con iconos grandes prominentes | Visual |
| V5 | Chips inline horizontales | Compacto |
| V6 | Cards expandibles con detalles | Informativo |

### UploadField (C1.15)
| Version | Descripcion | Interaccion |
|---------|-------------|-------------|
| V1 | Boton simple "Seleccionar archivo" | Basico |
| V2 | Dropzone con borde punteado | Desktop |
| V3 | Drag & drop + boton combinado **[PREFERIDO]** | Hibrido |
| V4 | Card con preview integrado | Todo-en-uno |
| V5 | Selector camara + galeria (mobile) | Mobile-first |
| V6 | Grid multi-archivo | Multiples docs |

### UploadPreview (C1.16)
| Version | Descripcion | Visualizacion |
|---------|-------------|---------------|
| V1 | Thumbnail pequeno simple | Compacto |
| V2 | Thumbnail + nombre archivo | Informativo |
| V3 | Preview grande en modal | Detallado |
| V4 | Card con acciones (eliminar, ver) | Interactivo |
| V5 | Gallery carousel deslizable | Multi-archivo |
| V6 | Lista detallada con metadata | Tecnico |

### UploadProgress (C1.17)
| Version | Descripcion | Feedback |
|---------|-------------|----------|
| V1 | Barra horizontal animada | Clasico |
| V2 | Spinner circular | Compacto |
| V3 | Porcentaje numerico grande | Preciso |
| V4 | Skeleton loading del preview | Contextual |
| V5 | Steps: subiendo > procesando > listo | Detallado |
| V6 | Tres dots animados minimal | Sutil |

### ValidationSummary (C1.21)
| Version | Descripcion | Ubicacion |
|---------|-------------|-----------|
| V1 | Lista de errores arriba del form **[PREFERIDO]** | Top |
| V2 | Toast/snackbar temporal | Overlay |
| V3 | Banner dismissible | Top sticky |
| V4 | Modal bloqueante | Obligatorio |
| V5 | Sidebar lateral con errores | Side |
| V6 | Inline colapsado por seccion | Contextual |

### FieldError (C1.23/24)
| Version | Descripcion | Estilo |
|---------|-------------|--------|
| V1 | Texto rojo debajo del campo **[PREFERIDO]** | Clasico |
| V2 | Tooltip de error al hover | Compacto |
| V3 | Badge rojo al lado del label | Visible |
| V4 | Shake animation + borde rojo | Impactante |
| V5 | Icono de error + texto | Iconico |
| V6 | Highlight completo del campo | Prominente |

### HelpTooltip (C1.28)
| Version | Descripcion | Activacion |
|---------|-------------|------------|
| V1 | Tooltip al hover **[PREFERIDO]** | Hover |
| V2 | Popover al click | Click |
| V3 | Texto de ayuda inline siempre visible | Visible |
| V4 | Modal de ayuda completo | Extenso |
| V5 | Drawer lateral con guia | Contextual |
| V6 | Accordion expandible | Progressive |

### DocExamplesModal (C1.29)
| Version | Descripcion | Layout |
|---------|-------------|--------|
| V1 | Lista simple de ejemplos | Basico |
| V2 | Gallery modal con thumbnails **[PREFERIDO]** | Visual |
| V3 | Carousel fullscreen swipeable | Inmersivo |
| V4 | Grid con zoom on click | Interactivo |
| V5 | Tabs organizados por tipo | Categorizado |
| V6 | Inline expandible sin modal | In-place |

---

## 12. Notas Importantes

1. **Comando de iteracion:** `/iterar 18 0.4`
2. **Flujo integrado:** Intro + Wizard en un solo componente
3. **Baldi es central:** Usar caricatura en hero y celebraciones
4. **Mobile-first:** Titulo sin "Ahora" en mobile (B.2)
5. **Cards condicionales:** Solo si <= 6 opciones (C1.13)
6. **Sin gradientes:** Colores solidos
7. **Sin emojis:** Solo Lucide icons
8. **84 componentes total:** 14 componentes x 6 versiones
9. **Decisiones 0.3 aplicadas:** V3 preferido para Baldi, V1 para estructura basica
