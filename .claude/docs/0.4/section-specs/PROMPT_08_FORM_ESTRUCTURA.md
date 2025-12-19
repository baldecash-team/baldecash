# Prompt #8: Formulario - Estructura del Wizard - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C |
| **Preguntas totales** | 22 |
| **Iteraciones T (10 versiones)** | 15 |
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

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/solicitud/
├── page.tsx                              # Redirect a preview
├── wizard-preview/
│   └── page.tsx                          # Preview con Settings Modal
├── wizard-v1/page.tsx                    # V1: Foto Producto
├── wizard-v2/page.tsx                    # V2: Foto Lifestyle
├── wizard-v3/page.tsx                    # V3: Ilustración Flat
├── wizard-v4/page.tsx                    # V4: Abstracto Flotante
├── wizard-v5/page.tsx                    # V5: Split 50/50
├── wizard-v6/page.tsx                    # V6: Centrado Hero
├── wizard-v7/page.tsx                    # V7: Asimétrico Bold
├── wizard-v8/page.tsx                    # V8: Data-Driven
├── wizard-v9/page.tsx                    # V9: Storytelling
├── wizard-v10/page.tsx                   # V10: Interactivo
├── components/
│   └── wizard/
│       ├── WizardContainer.tsx
│       ├── WizardSettingsModal.tsx       # Modal con 15 selectores (1-10)
│       ├── structure/
│       │   └── WizardLayoutV[1-10].tsx
│       ├── progress/
│       │   └── ProgressIndicatorV[1-10].tsx
│       ├── navigation/
│       │   └── WizardButtonsV[1-10].tsx
│       ├── motivation/
│       │   └── MotivationalMessageV[1-10].tsx
│       ├── celebrations/
│       │   └── StepCelebrationV[1-10].tsx
│       └── layout/
│           └── StepLayoutV[1-10].tsx
├── types/
│   └── wizard.ts
├── data/
│   └── wizardSteps.ts
└── WIZARD_README.md
```

---

## 3. Preguntas del Segmento C - Estructura

### 3.1 Estructura General (4 preguntas)

#### Pregunta C.1 [ITERAR - 10 versiones]
**¿El wizard debe ser de página completa o mantener header/footer?**
- **V1**: Página completa sin distracciones, foco en formulario (e-commerce)
- **V2**: Header minimalista con logo, ambiente lifestyle
- **V3**: Header + footer con ilustraciones flat decorativas
- **V4**: Página completa con shapes flotantes animados (fintech)
- **V5**: Split: sidebar izquierdo con info + form derecho
- **V6**: Fullscreen centrado con máximo impacto visual
- **V7**: Header bold asimétrico con tipografía grande
- **V8**: Header con progress bar + stats de tiempo (data-driven)
- **V9**: Header con "Capítulo X de tu historia" (storytelling)
- **V10**: Header interactivo que cambia según el paso

#### C.2 [DEFINIDO]
**¿Cada paso debe ser una URL diferente o todo en una página?**
→ URLs diferentes para:
- Permitir "Regresar" del navegador
- Guardar progreso
- Analytics por paso

#### Pregunta C.3 [ITERAR - 10 versiones]
**¿El usuario puede navegar libremente entre pasos o solo secuencial?**
- **V1**: Solo secuencial estricto (más controlado)
- **V2**: Secuencial con preview de pasos completados (lifestyle)
- **V3**: Libre hacia atrás con animación flat al navegar
- **V4**: Secuencial con transiciones fluidas (fintech)
- **V5**: Split: timeline clickeable + form secuencial
- **V6**: Secuencial con enfoque máximo en paso actual
- **V7**: Libre completo con navegación bold
- **V8**: Libre con warning de campos incompletos (data)
- **V9**: Navegación como "capítulos" de historia
- **V10**: Dinámico según comportamiento del usuario

#### Pregunta C.4 [ITERAR - 10 versiones]
**¿Debe guardarse el progreso automáticamente?**
- **V1**: Autoguardado cada campo inmediato (clásico)
- **V2**: Autoguardado + notificación visual sutil (lifestyle)
- **V3**: Guardar al completar paso con checkmark animado
- **V4**: Autoguardado con badge flotante "Guardado" (fintech)
- **V5**: Panel lateral con historial de guardados
- **V6**: Autoguardado silencioso, solo feedback en error
- **V7**: Indicador de guardado bold en esquina
- **V8**: Autoguardado + timestamp visible (data-driven)
- **V9**: "Tu progreso está a salvo" narrativo
- **V10**: Control manual con opción de autoguardado

---

### 3.2 Indicador de Progreso (5 preguntas)

#### Pregunta C.5 [ITERAR - 10 versiones]
**¿El indicador debe ser numérico, porcentaje, o visual?**
- **V1**: "Paso 2 de 5" numérico clásico
- **V2**: Círculos con fotos de estudiantes completando (lifestyle)
- **V3**: Iconos flat ilustrados por paso
- **V4**: Barra con % animado + glow (fintech)
- **V5**: Split: número izquierda + barra derecha
- **V6**: Porcentaje gigante centrado con impacto
- **V7**: Números bold con tamaño variable según progreso
- **V8**: Progress bar + tiempo restante + % (data)
- **V9**: "Parte 2 de tu historia" con progress narrativo
- **V10**: Progress ring interactivo con detalles on hover

#### Pregunta C.6 [ITERAR - 10 versiones]
**¿Deben verse los nombres de todos los pasos o solo el actual?**
- **V1**: Todos visibles en barra horizontal simple
- **V2**: Todos con thumbnails/avatares (lifestyle)
- **V3**: Iconos flat de todos los pasos
- **V4**: Dots con tooltip flotante al hover (fintech)
- **V5**: Split: lista completa izquierda + actual derecha
- **V6**: Solo paso actual gigante centrado
- **V7**: Todos con tamaños variables según estado (bold)
- **V8**: Todos + tiempo estimado por paso (data)
- **V9**: Capítulos como índice de libro
- **V10**: Expandible: click para ver/ocultar todos

#### Pregunta C.7 [ITERAR - 10 versiones]
**¿Los pasos completados deben tener checkmark verde?**
- **V1**: Checkmark verde sólido clásico
- **V2**: Checkmark + badge de celebración (lifestyle)
- **V3**: Checkmark flat con animación de entrada
- **V4**: Checkmark con glow y micro-animación (fintech)
- **V5**: Checkmark + preview de datos completados
- **V6**: Checkmark grande con efecto de impacto
- **V7**: Checkmark bold con número tachado
- **V8**: Checkmark + porcentaje de precisión (data)
- **V9**: Estrella dorada como "capítulo completado"
- **V10**: Checkmark interactivo con resumen on click

#### Pregunta C.8 [ITERAR - 10 versiones]
**¿El paso actual debe destacarse con color, tamaño, o animación?**
- **V1**: Color primario #4654CD sólido
- **V2**: Color + foto contextual del paso (lifestyle)
- **V3**: Color + icono flat animado
- **V4**: Color + pulse glow animado (fintech)
- **V5**: Color + panel expandido con detalles
- **V6**: Tamaño gigante + color de alto impacto
- **V7**: Tamaño variable bold + color
- **V8**: Color + stats del paso (campos, tiempo)
- **V9**: "Estás aquí" con spotlight narrativo
- **V10**: Animación de entrada + color + sonido opcional

#### C.9 [DEFINIDO]
**¿Hacer clic en paso completado permite volver a editarlo?**
→ Sí, permite navegar hacia atrás

---

### 3.3 Layout de Pasos (4 preguntas)

#### Pregunta C.10 [ITERAR - 10 versiones]
**¿Los campos deben estar en una columna centrada o usar todo el ancho?**
- **V1**: Columna centrada max-w-md clásica
- **V2**: Columna centrada + contexto visual lateral (lifestyle)
- **V3**: Columna con ilustraciones flat intercaladas
- **V4**: Columna centrada con campos flotantes (fintech)
- **V5**: Split 50/50: campos izquierda + info derecha
- **V6**: Columna super estrecha, máximo foco
- **V7**: Ancho variable según tipo de campo (bold)
- **V8**: Dos columnas optimizadas + métricas (data)
- **V9**: Un campo por "escena" de historia
- **V10**: Layout adaptativo según dispositivo y campo

#### Pregunta C.11 [ITERAR - 10 versiones]
**¿Debe haber panel lateral con resumen/ayuda?**
- **V1**: Sin panel, todo en columna única
- **V2**: Panel con foto del producto seleccionado (lifestyle)
- **V3**: Panel con tips ilustrados flat
- **V4**: Panel flotante con resumen + cuota (fintech)
- **V5**: Panel fijo 30% con sticky summary
- **V6**: Sin panel, información integrada en campos
- **V7**: Panel collapsible bold al costado
- **V8**: Panel con métricas en tiempo real (data)
- **V9**: Panel con "Tu historia hasta ahora"
- **V10**: Panel contextual que cambia según el campo

#### Pregunta C.12 [ITERAR - 10 versiones]
**¿Las ilustraciones motivacionales deben estar a la derecha, arriba, o no?**
- **V1**: Derecha en desktop, arriba en móvil (clásico)
- **V2**: Arriba con foto de estudiante similar (lifestyle)
- **V3**: Integradas como personajes flat animados
- **V4**: Flotantes con shapes abstractos (fintech)
- **V5**: Izquierda fija en split layout
- **V6**: Fondo sutil, no distrae del form
- **V7**: Posición asimétrica variable por paso
- **V8**: Infografías con datos motivacionales
- **V9**: Escenas de historia arriba
- **V10**: Posición dinámica según scroll/interacción

#### Pregunta C.13 [ITERAR - 10 versiones]
**¿En móvil, las ilustraciones deben ocultarse?**
- **V1**: Sí, ocultar para maximizar espacio
- **V2**: Reducir a avatar pequeño (lifestyle)
- **V3**: Mantener como iconos flat pequeños
- **V4**: Convertir en header decorativo (fintech)
- **V5**: Mover arriba como banner compacto
- **V6**: Ocultar completamente, máximo foco
- **V7**: Iconos bold en inline con título
- **V8**: Convertir en progress indicator visual
- **V9**: Mantener como mini-escena arriba
- **V10**: Toggle para mostrar/ocultar

---

### 3.4 Botones de Navegación (4 preguntas)

#### Pregunta C.14 [ITERAR - 10 versiones]
**¿Los botones 'Continuar' y 'Regresar' deben estar fijos abajo o al final?**
- **V1**: Fixed bottom siempre (clásico mobile)
- **V2**: Fixed con preview del siguiente paso (lifestyle)
- **V3**: Al final con iconos flat
- **V4**: Fixed con animación de progreso (fintech)
- **V5**: Split: regresar izquierda fijo, continuar derecha
- **V6**: Fixed bottom con botón gigante centrado
- **V7**: Posición asimétrica bold
- **V8**: Fixed + indicador de campos restantes (data)
- **V9**: "Continúa tu historia" narrativo
- **V10**: Posición dinámica según scroll

#### C.15 [DEFINIDO]
**¿El botón 'Regresar' debe ser texto link o botón secundario?**
→ Texto link o botón ghost (menos prominente que Continuar)

#### Pregunta C.16 [ITERAR - 10 versiones]
**¿Debe haber botón de 'Guardar y continuar después'?**
- **V1**: Sí, visible como link secundario
- **V2**: Icono de guardado con tooltip (lifestyle)
- **V3**: Botón flat con icono ilustrado
- **V4**: Floating pill discreto (fintech)
- **V5**: En panel lateral junto al resumen
- **V6**: No visible, autoguardado silencioso
- **V7**: Texto bold en header
- **V8**: Con timestamp del último guardado (data)
- **V9**: "Guarda tu historia" narrativo
- **V10**: Aparece tras X segundos de inactividad

#### C.17 [DEFINIDO]
**¿El botón 'Continuar' debe estar deshabilitado hasta completar campos?**
→ Sí, deshabilitado con tooltip explicativo

---

### 3.5 Mensajes Motivacionales (3 preguntas)

#### Pregunta C.18 [ITERAR - 10 versiones]
**¿Cada paso debe tener un mensaje de ánimo diferente?**
- **V1**: Sí, mensajes únicos por paso ("¡Ya casi!")
- **V2**: Mensajes + foto de estudiante celebrando (lifestyle)
- **V3**: Mensajes con personaje flat diferente
- **V4**: Mensajes con animación de texto (fintech)
- **V5**: Mensaje en panel lateral
- **V6**: Mensaje gigante centrado antes del form
- **V7**: Mensajes con tipografía bold variable
- **V8**: Mensajes + estadística motivacional (data)
- **V9**: "Capítulo X: [Nombre del paso]" narrativo
- **V10**: Mensajes personalizados según respuestas previas

#### C.19 [DEFINIDO]
**¿El mensaje debe personalizarse con el nombre del usuario?**
→ Sí, si está disponible: "¡Vas muy bien, María!"

#### Pregunta C.20 [ITERAR - 10 versiones]
**¿Debe haber micro-celebraciones al completar cada paso?**
- **V1**: Checkmark animado simple
- **V2**: Confetti + mensaje de celebración (lifestyle)
- **V3**: Personaje flat celebrando animado
- **V4**: Glow + particles sutiles (fintech)
- **V5**: Animación en panel lateral + form
- **V6**: Transición de impacto fullscreen
- **V7**: Número bold con efecto de completado
- **V8**: +X% completado con counter animado (data)
- **V9**: "Capítulo completado" con transición de página
- **V10**: Celebración personalizada según tiempo/precisión

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
  // C.1 - Layout general
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.3 - Navegación
  navigationMode: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.4 - Autoguardado
  autoSaveVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.5 - Indicador de progreso
  progressVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.6 - Visibilidad de pasos
  stepsVisibilityVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.7 - Checkmark de completado
  checkmarkVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.8 - Destacado del paso actual
  currentStepVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.10 - Layout de campos
  fieldsLayoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.11 - Panel lateral
  sidePanelVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.12 - Posición de ilustraciones
  illustrationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.13 - Ilustraciones en móvil
  mobileIllustrationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.14 - Posición de botones
  buttonsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.16 - Botón guardar
  saveButtonVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.18 - Mensajes motivacionales
  motivationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C.20 - Celebraciones
  celebrationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultWizardConfig: WizardConfig = {
  layoutVersion: 1,
  navigationMode: 2,
  autoSaveVersion: 1,
  progressVersion: 1,
  stepsVisibilityVersion: 1,
  checkmarkVersion: 1,
  currentStepVersion: 1,
  fieldsLayoutVersion: 1,
  sidePanelVersion: 1,
  illustrationVersion: 1,
  mobileIllustrationVersion: 1,
  buttonsVersion: 1,
  saveButtonVersion: 1,
  motivationVersion: 1,
  celebrationVersion: 1,
};

export interface WizardStep {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  fields: string[];
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
 * ProgressIndicatorV1 - Steps Numerados (Foto Producto)
 * Estilo e-commerce clásico con números y línea de progreso
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
                ${isCurrent ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20' : ''}
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

## 6. URLs de Acceso

```
/prototipos/0.4/solicitud                    → Redirect a preview
/prototipos/0.4/solicitud/wizard-preview     → Preview con Settings Modal
/prototipos/0.4/solicitud/wizard-v1          → V1: Foto Producto
/prototipos/0.4/solicitud/wizard-v2          → V2: Foto Lifestyle
/prototipos/0.4/solicitud/wizard-v3          → V3: Ilustración Flat
/prototipos/0.4/solicitud/wizard-v4          → V4: Abstracto Flotante
/prototipos/0.4/solicitud/wizard-v5          → V5: Split 50/50
/prototipos/0.4/solicitud/wizard-v6          → V6: Centrado Hero
/prototipos/0.4/solicitud/wizard-v7          → V7: Asimétrico Bold
/prototipos/0.4/solicitud/wizard-v8          → V8: Data-Driven
/prototipos/0.4/solicitud/wizard-v9          → V9: Storytelling
/prototipos/0.4/solicitud/wizard-v10         → V10: Interactivo
```

---

## 7. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/wizard.ts` - WizardConfig con 16 selectores
- [ ] `data/wizardSteps.ts`
- [ ] `WizardContainer.tsx` - Wrapper principal
- [ ] `WizardSettingsModal.tsx` - Modal con 16 selectores (1-10)

### Layout (10 versiones)
- [ ] `WizardLayoutV1.tsx` a `V10.tsx`

### Progress (10 versiones)
- [ ] `ProgressIndicatorV1.tsx` a `V10.tsx`

### Navigation (10 versiones)
- [ ] `WizardButtonsV1.tsx` a `V10.tsx`

### Motivation (10 versiones)
- [ ] `MotivationalMessageV1.tsx` a `V10.tsx`

### Step Layout (10 versiones)
- [ ] `StepLayoutV1.tsx` a `V10.tsx`

### Celebrations (10 versiones)
- [ ] `StepCelebrationV1.tsx` a `V10.tsx`

### Páginas
- [ ] `page.tsx` - Redirect a preview
- [ ] `wizard-preview/page.tsx` - Preview con Settings Modal
- [ ] `wizard-v1/page.tsx` a `wizard-v10/page.tsx`

### Documentación
- [ ] `WIZARD_README.md`

---

## 8. Notas Importantes

1. **URLs por paso**: /solicitud/paso-1, /solicitud/paso-2, etc.
2. **Autoguardado**: localStorage o API según disponibilidad
3. **Validación progresiva**: Validar al salir del campo
4. **Mobile-First**: Botones fixed bottom en móvil
5. **Accesibilidad**: Focus management entre pasos
6. **Sin gradientes**: Colores sólidos
7. **Sin emojis**: Solo Lucide icons

