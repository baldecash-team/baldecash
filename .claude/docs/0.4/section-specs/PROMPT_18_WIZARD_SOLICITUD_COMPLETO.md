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

1. **Vista de Solicitud (Intro)** - Pantalla motivacional con Baldi antes del wizard
2. **Wizard Estructura** - Navegacion, progreso, layout
3. **Paso 1: Datos Personales** - DNI, nombres, contacto
4. **Paso 2: Datos Academicos** - Institucion, carrera, ciclo
5. **Paso 3: Datos Economicos** - Ingresos, empleo
6. **Paso 4: Resumen** - Confirmacion final

**Objetivo:** Generar el flujo completo de solicitud como un solo componente integrado, similar a `/prototipos/0.3/solicitud/` pero con 6 versiones iterables.

---

## 2. Prompts Incluidos

| Prompt | Seccion | Decisiones Aplicadas |
|--------|---------|----------------------|
| PROMPT_SOLICITUD | Vista Intro | B.1=V2, B.2=V2/V3, B.3=V1, B.5=V3(Baldi), B.6=V3 |
| PROMPT_08 | Wizard Estructura | C.x (estructura general) |
| PROMPT_09 | Campos/Componentes | C1.x (ver decisiones abajo) |
| PROMPT_10 | Datos Personales | Campos especificos |
| PROMPT_11 | Datos Academicos | Campos especificos |
| PROMPT_12 | Datos Economicos | Campos especificos |
| PROMPT_13 | Resumen | Confirmacion |

---

## 3. Decisiones Finales Aplicadas

### 3.1 Vista de Solicitud (B.x)

| ID | Componente | Version | Implementacion |
|----|------------|---------|----------------|
| B.1 | Header | **V2** | Con producto seleccionado (thumbnail + nombre) |
| B.2 | Titulo | **V2/V3** | V2 desktop ("Ahora..."), V3 mobile (sin "Ahora") |
| B.3 | Mensaje | **V1** | Beneficios del financiamiento |
| B.5 | Hero | **V3** | Caricatura de Baldi como imagen hero |
| B.6 | CTA | **V3** | Card con Baldi + boton + tiempo |

### 3.2 Wizard - Campos (C1.x)

| ID | Componente | Version | Implementacion |
|----|------------|---------|----------------|
| C1.1 | Labels | **V1** | Label arriba (siempre visible) |
| C1.4 | Inputs | **V3 o V1** | Filled (V3) o bordes (V1) - iterar ambos |
| C1.13 | Opciones | **V3** | Cards clickeables SOLO si <= 6 opciones |
| C1.15 | Upload | **V3** | Area drag & drop que es boton |
| C1.16 | Preview | **CORREGIR** | Preview de archivo - NO FUNCIONA |
| C1.17 | Progreso upload | **CORREGIR** | Barra de progreso - NO FUNCIONA |
| C1.21 | Validacion | **V1** | Mostrar todos los errores arriba |
| C1.23 | Errores | **V1** | Debajo del campo inline |
| C1.24 | Estilo error | **V1** | Borde rojo |
| C1.28 | Ayuda | **V1** | Tooltip hover/click |
| C1.29 | Ejemplos docs | **V2** | Gallery en modal |

---

## 4. Estructura de Archivos

```
src/app/prototipos/0.4/wizard-solicitud/
├── page.tsx                              # Redirect a preview
├── wizard-preview/
│   └── page.tsx                          # Preview con Settings Modal
├── components/
│   └── wizard-solicitud/
│       ├── WizardSolicitudContainer.tsx  # Container principal
│       ├── WizardSolicitudSettingsModal.tsx
│       │
│       ├── intro/                        # Vista de Solicitud (B.x)
│       │   ├── SolicitudIntroV[1-6].tsx
│       │   ├── BaldiHeroV[1-6].tsx       # Con caricatura Baldi
│       │   └── SolicitudCtaV[1-6].tsx
│       │
│       ├── wizard/                       # Estructura Wizard (C.x)
│       │   ├── WizardLayoutV[1-6].tsx
│       │   ├── ProgressIndicatorV[1-6].tsx
│       │   └── WizardNavigationV[1-6].tsx
│       │
│       ├── fields/                       # Componentes de campos (C1.x)
│       │   ├── InputFieldV[1-6].tsx      # C1.4
│       │   ├── LabelV[1-6].tsx           # C1.1
│       │   ├── SelectCardsV[1-6].tsx     # C1.13
│       │   ├── UploadFieldV[1-6].tsx     # C1.15
│       │   ├── UploadPreviewV[1-6].tsx   # C1.16 [CORREGIR]
│       │   ├── UploadProgressV[1-6].tsx  # C1.17 [CORREGIR]
│       │   ├── ValidationSummaryV[1-6].tsx # C1.21
│       │   ├── FieldErrorV[1-6].tsx      # C1.23, C1.24
│       │   ├── HelpTooltipV[1-6].tsx     # C1.28
│       │   └── DocExamplesModalV[1-6].tsx # C1.29
│       │
│       ├── steps/                        # Pasos del wizard
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

### Componentes Intro (B.x)
- [ ] `SolicitudIntroV[1-6].tsx`
- [ ] `BaldiHeroV3.tsx` **[PRIORITARIO - con caricatura]**
- [ ] `SolicitudCtaV3.tsx` **[PRIORITARIO - card con Baldi]**

### Componentes Wizard (C.x)
- [ ] `WizardLayoutV[1-6].tsx`
- [ ] `ProgressIndicatorV[1-6].tsx`
- [ ] `WizardNavigationV[1-6].tsx`

### Componentes Campos (C1.x)
- [ ] `LabelV1.tsx` **[Label arriba]**
- [ ] `InputFieldV1.tsx` y `V3.tsx` **[Bordes y Filled]**
- [ ] `SelectCardsV3.tsx` **[Cards para <= 6 opciones]**
- [ ] `UploadFieldV3.tsx` **[Drag & drop + boton]**
- [ ] `UploadPreviewV[1-6].tsx` **[CORREGIR - no funciona]**
- [ ] `UploadProgressV[1-6].tsx` **[CORREGIR - no funciona]**
- [ ] `ValidationSummaryV1.tsx` **[Errores arriba]**
- [ ] `FieldErrorV1.tsx` **[Inline + borde rojo]**
- [ ] `HelpTooltipV1.tsx` **[Tooltip hover/click]**
- [ ] `DocExamplesModalV2.tsx` **[Gallery modal]**

### Pasos
- [ ] `Step1DatosPersonales.tsx`
- [ ] `Step2DatosAcademicos.tsx`
- [ ] `Step3DatosEconomicos.tsx`
- [ ] `Step4Resumen.tsx`

### Container y Config
- [ ] `WizardSolicitudContainer.tsx`
- [ ] `WizardSolicitudSettingsModal.tsx`
- [ ] `types/wizard-solicitud.ts`
- [ ] `data/wizardSolicitudSteps.ts`

### Assets
- [ ] `baldi-wave.svg`
- [ ] `baldi-celebrate.svg`
- [ ] `baldi-thinking.svg`
- [ ] `baldi-thumbsup.svg`

### Documentacion
- [ ] `WIZARD_SOLICITUD_README.md`

---

## 11. Bugs a Corregir

### C1.16 - Preview de archivo
**Estado:** NO FUNCIONA
**Problema:** El preview del archivo subido no se muestra correctamente
**Accion:** Revisar componente UploadPreview y corregir renderizado

### C1.17 - Barra de progreso de upload
**Estado:** NO FUNCIONA
**Problema:** La barra de progreso no actualiza durante la subida
**Accion:** Revisar logica de progreso y conexion con estado de upload

---

## 12. Notas Importantes

1. **Comando de iteracion:** `/iterar 18 0.4`
2. **Flujo integrado:** Intro + Wizard en un solo componente
3. **Baldi es central:** Usar caricatura en hero y celebraciones
4. **Mobile-first:** Titulo sin "Ahora" en mobile (B.2)
5. **Cards condicionales:** Solo si <= 6 opciones (C1.13)
6. **Sin gradientes:** Colores solidos
7. **Sin emojis:** Solo Lucide icons
8. **Corregir bugs:** C1.16 y C1.17 antes de iterar
