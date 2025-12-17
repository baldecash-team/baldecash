# Prompt #8: Formulario - Estructura del Wizard - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C |
| **Preguntas totales** | 22 |
| **Iteraciones T (3 versiones)** | 15 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El wizard de solicitud es el flujo crítico donde el usuario completa su solicitud de financiamiento. Un wizard bien diseñado puede aumentar la tasa de completitud del 4% al 70%+.

### Insights UX/UI del Researcher
- **Paradigma Mobile-First Conversational Wizard**
- **Reducción de carga cognitiva**: Un campo = un pensamiento
- **Progreso visible**: El usuario sabe dónde está y cuánto falta
- **Micro-compromisos**: Cada paso completado genera engagement
- **Benchmark**: Kueski (2-3 pasos), Nubank (onboarding progresivo)

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/solicitud/
├── page.tsx
├── wizard-preview/
│   └── page.tsx
├── components/
│   └── wizard/
│       ├── WizardContainer.tsx
│       ├── WizardSettingsModal.tsx
│       ├── structure/
│       │   ├── WizardLayoutV1.tsx        # Fullscreen con sidebar
│       │   ├── WizardLayoutV2.tsx        # Centrado single column
│       │   └── WizardLayoutV3.tsx        # Card flotante
│       ├── progress/
│       │   ├── ProgressIndicatorV1.tsx   # Steps numerados
│       │   ├── ProgressIndicatorV2.tsx   # Barra de progreso %
│       │   └── ProgressIndicatorV3.tsx   # Dots con labels
│       ├── navigation/
│       │   ├── WizardButtonsV1.tsx       # Fixed bottom
│       │   ├── WizardButtonsV2.tsx       # Inline con form
│       │   └── WizardButtonsV3.tsx       # Floating action
│       ├── motivation/
│       │   ├── MotivationalMessageV1.tsx # Texto + ilustración
│       │   ├── MotivationalMessageV2.tsx # Solo texto animado
│       │   └── MotivationalMessageV3.tsx # Badge de progreso
│       ├── celebrations/
│       │   ├── StepCelebration.tsx       # Micro-celebración
│       │   └── MilestoneAnimation.tsx    # Animación de milestone
│       └── layout/
│           ├── StepLayoutV1.tsx          # Campos centrados
│           ├── StepLayoutV2.tsx          # Campos + sidebar info
│           └── StepLayoutV3.tsx          # Campos + ilustración
├── types/
│   └── wizard.ts
├── data/
│   └── wizardSteps.ts
└── WIZARD_README.md
```

---

## 3. Preguntas del Segmento C - Estructura

### 3.1 Estructura General (4 preguntas)

#### C.1 [ITERAR - 3 versiones]
**¿El wizard debe ser de página completa o mantener header/footer?**
- **V1**: Página completa sin distracciones (máximo foco)
- **V2**: Mantiene header minimalista (branding presente)
- **V3**: Header + progress bar sticky

#### C.2 [DEFINIDO]
**¿Cada paso debe ser una URL diferente o todo en una página?**
→ URLs diferentes para:
- Permitir "Regresar" del navegador
- Guardar progreso
- Analytics por paso

#### C.3 [ITERAR - 3 versiones]
**¿El usuario puede navegar libremente entre pasos o solo secuencial?**
- **V1**: Solo secuencial (más controlado, menos errores)
- **V2**: Libre hacia atrás, secuencial hacia adelante
- **V3**: Completamente libre (power users)

#### C.4 [ITERAR - 3 versiones]
**¿Debe guardarse el progreso automáticamente?**
- **V1**: Autoguardado cada campo (máxima seguridad)
- **V2**: Guardar al completar paso
- **V3**: Botón "Guardar y continuar después"

---

### 3.2 Indicador de Progreso (5 preguntas)

#### C.5 [ITERAR - 3 versiones]
**¿El indicador debe ser numérico, porcentaje, o visual?**
- **V1**: "Paso 2 de 5" (claro y directo)
- **V2**: Barra con porcentaje "60% completado"
- **V3**: Dots/círculos con checkmarks

#### C.6 [ITERAR - 3 versiones]
**¿Deben verse los nombres de todos los pasos o solo el actual?**
- **V1**: Todos visibles en barra horizontal
- **V2**: Solo actual + siguiente
- **V3**: Collapsible: click para ver todos

#### C.7 [ITERAR - 3 versiones]
**¿Los pasos completados deben tener checkmark verde?**
- **V1**: Checkmark verde (confirmación visual)
- **V2**: Cambio de color sutil
- **V3**: Número tachado + icono

#### C.8 [ITERAR - 3 versiones]
**¿El paso actual debe destacarse con color, tamaño, o animación?**
- **V1**: Color primario (#4247d2) sólido
- **V2**: Tamaño más grande + color
- **V3**: Animación pulse sutil

#### C.9 [DEFINIDO]
**¿Hacer clic en paso completado permite volver a editarlo?**
→ Sí, permite navegar hacia atrás

---

### 3.3 Layout de Pasos (4 preguntas)

#### C.10 [ITERAR - 3 versiones]
**¿Los campos deben estar en una columna centrada o usar todo el ancho?**
- **V1**: Columna centrada max-w-md (más enfocado)
- **V2**: Dos columnas en desktop (más eficiente)
- **V3**: Full width con grouping visual

#### C.11 [ITERAR - 3 versiones]
**¿Debe haber panel lateral con resumen/ayuda?**
- **V1**: Sin panel, todo en una columna
- **V2**: Panel derecho con resumen del producto
- **V3**: Panel derecho con tips/ayuda contextual

#### C.12 [ITERAR - 3 versiones]
**¿Las ilustraciones motivacionales deben estar a la derecha, arriba, o no?**
- **V1**: Derecha en desktop, arriba en móvil
- **V2**: Arriba siempre (pequeña)
- **V3**: Sin ilustraciones (minimalista)

#### C.13 [ITERAR - 3 versiones]
**¿En móvil, las ilustraciones deben ocultarse?**
- **V1**: Sí, ocultar para dar espacio
- **V2**: Reducir tamaño significativamente
- **V3**: Mantener pequeñas arriba

---

### 3.4 Botones de Navegación (4 preguntas)

#### C.14 [ITERAR - 3 versiones]
**¿Los botones 'Continuar' y 'Regresar' deben estar fijos abajo o al final?**
- **V1**: Fixed bottom (siempre accesibles)
- **V2**: Al final del formulario (menos intrusivo)
- **V3**: Fixed bottom en móvil, inline en desktop

#### C.15 [DEFINIDO]
**¿El botón 'Regresar' debe ser texto link o botón secundario?**
→ Texto link o botón ghost (menos prominente que Continuar)

#### C.16 [ITERAR - 3 versiones]
**¿Debe haber botón de 'Guardar y continuar después'?**
- **V1**: Sí, visible siempre
- **V2**: En dropdown/menú
- **V3**: Solo después de X segundos de inactividad

#### C.17 [DEFINIDO]
**¿El botón 'Continuar' debe estar deshabilitado hasta completar campos?**
→ Sí, deshabilitado con tooltip explicativo

---

### 3.5 Mensajes Motivacionales (3 preguntas)

#### C.18 [ITERAR - 3 versiones]
**¿Cada paso debe tener un mensaje de ánimo diferente?**
- **V1**: Sí, mensajes únicos por paso ("¡Ya casi!", "¡Último paso!")
- **V2**: Mensaje genérico pero positivo
- **V3**: Sin mensajes (minimalista)

#### C.19 [DEFINIDO]
**¿El mensaje debe personalizarse con el nombre del usuario?**
→ Sí, si está disponible: "¡Vas muy bien, María!"

#### C.20 [ITERAR - 3 versiones]
**¿Debe haber micro-celebraciones al completar cada paso?**
- **V1**: Animación de confetti sutil
- **V2**: Checkmark animado + mensaje
- **V3**: Transición suave sin celebración

---

### 3.6 Tiempo Estimado (2 preguntas)

#### C.21 [DEFINIDO]
**¿Debe mostrarse tiempo estimado para completar?**
→ Sí, "Tiempo estimado: 5 minutos"

#### C.22 [DEFINIDO]
**¿El tiempo debe actualizarse según el progreso real?**
→ Sí, "Aproximadamente 2 minutos restantes"

---

## 4. Tipos TypeScript

```typescript
// types/wizard.ts

export interface WizardConfig {
  layoutVersion: 1 | 2 | 3;
  progressVersion: 1 | 2 | 3;
  navigationVersion: 1 | 2 | 3;
  stepLayoutVersion: 1 | 2 | 3;
  motivationVersion: 1 | 2 | 3;
  celebrationVersion: 1 | 2 | 3;
  allowFreeNavigation: boolean;
  autoSave: boolean;
  showTimeEstimate: boolean;
}

export interface WizardStep {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  fields: string[]; // IDs de campos en este paso
  validationRules: ValidationRule[];
  motivationalMessage?: string;
}

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, any>;
  startedAt: Date;
  lastSavedAt?: Date;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface WizardNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  canSubmit: boolean;
  nextStep?: WizardStep;
  prevStep?: WizardStep;
}

// Pasos predefinidos
export const wizardSteps: WizardStep[] = [
  {
    id: '1',
    code: 'personal',
    name: 'Datos Personales',
    shortName: 'Personal',
    description: 'Información básica para identificarte',
    icon: 'User',
    estimatedMinutes: 2,
    fields: ['dni', 'nombres', 'apellidos', 'fechaNacimiento', 'celular', 'email'],
    validationRules: [],
    motivationalMessage: '¡Empecemos! Solo necesitamos conocerte un poco.',
  },
  {
    id: '2',
    code: 'academico',
    name: 'Datos Académicos',
    shortName: 'Estudios',
    description: 'Información sobre tu institución',
    icon: 'GraduationCap',
    estimatedMinutes: 2,
    fields: ['institucion', 'carrera', 'ciclo', 'codigoAlumno'],
    validationRules: [],
    motivationalMessage: '¡Excelente! Cuéntanos sobre tus estudios.',
  },
  {
    id: '3',
    code: 'economico',
    name: 'Datos Económicos',
    shortName: 'Ingresos',
    description: 'Información sobre tus ingresos',
    icon: 'Wallet',
    estimatedMinutes: 3,
    fields: ['fuenteIngreso', 'montoIngreso', 'empleador'],
    validationRules: [],
    motivationalMessage: '¡Ya casi! Solo falta un poco más.',
  },
  {
    id: '4',
    code: 'resumen',
    name: 'Confirmar Solicitud',
    shortName: 'Confirmar',
    description: 'Revisa y confirma tu solicitud',
    icon: 'CheckCircle',
    estimatedMinutes: 1,
    fields: [],
    validationRules: [],
    motivationalMessage: '¡Último paso! Revisa que todo esté correcto.',
  },
];
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Check } from 'lucide-react';

/**
 * ProgressIndicatorV1 - Steps Numerados
 */

interface ProgressIndicatorV1Props {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
}

export const ProgressIndicatorV1: React.FC<ProgressIndicatorV1Props> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = currentStep === index;
        const isClickable = isCompleted || index < currentStep;

        return (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
                ${isCurrent ? 'bg-[#4247d2] text-white ring-4 ring-[#4247d2]/20' : ''}
                ${!isCompleted && !isCurrent ? 'bg-neutral-200 text-neutral-500' : ''}
                ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              `}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div
                  className={`h-full rounded transition-all ${
                    completedSteps.includes(index) ? 'bg-[#22c55e]' : 'bg-neutral-200'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
```

---

## 6. Checklist de Entregables

- [ ] `types/wizard.ts`
- [ ] `data/wizardSteps.ts`
- [ ] `WizardContainer.tsx`
- [ ] `WizardSettingsModal.tsx`
- [ ] `WizardLayoutV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `ProgressIndicatorV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `WizardButtonsV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `MotivationalMessageV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `StepLayoutV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `StepCelebration.tsx`
- [ ] Lógica de autoguardado
- [ ] `WIZARD_README.md`

---

## 7. Notas Importantes

1. **URLs por paso**: /solicitud/paso-1, /solicitud/paso-2, etc.
2. **Autoguardado**: localStorage o API según disponibilidad
3. **Validación progresiva**: Validar al salir del campo
4. **Mobile-First**: Botones fixed bottom en móvil
5. **Accesibilidad**: Focus management entre pasos
6. **Sin gradientes**: Colores sólidos
7. **Sin emojis**: Solo Lucide icons
