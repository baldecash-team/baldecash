# Prompt #9: Formulario - Componentes de Campos - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.1 |
| **Preguntas totales** | 30 |
| **Iteraciones T (10 versiones)** | 11 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

Los componentes de campos de formulario son los building blocks de todo el wizard. Deben ser accesibles, claros y proporcionar feedback inmediato.

---

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/solicitud/
├── components/
│   └── fields/
│       ├── inputs/
│       │   └── TextInputV[1-10].tsx
│       ├── labels/
│       │   └── FieldLabelV[1-10].tsx
│       ├── selects/
│       │   ├── SelectDropdown.tsx
│       │   ├── SearchableSelect.tsx
│       │   └── DependentSelect.tsx
│       ├── checkboxes/
│       │   ├── OptionSelectorV[1-10].tsx
│       │   └── RadioGroupV1.tsx
│       ├── upload/
│       │   ├── FileUploadV[1-10].tsx
│       │   ├── FilePreviewV[1-10].tsx
│       │   └── UploadProgressV[1-10].tsx
│       ├── validation/
│       │   ├── ValidationFeedbackV[1-10].tsx
│       │   ├── FieldErrorV[1-10].tsx
│       │   └── ValidationSummary.tsx
│       └── help/
│           ├── ContextualHelpV[1-10].tsx
│           ├── DocumentExampleV[1-10].tsx
│           └── FieldTooltip.tsx
├── types/
│   └── fields.ts
└── FIELDS_README.md
```

---

## 3. Preguntas del Segmento C.1

### 3.1 Labels y Placeholders (3 preguntas)

#### C1.1 [ITERAR - 10 versiones]
**¿Los campos deben tener label arriba, label flotante, o solo placeholder?**
- **V1**: Label arriba siempre visible, estilo e-commerce clásico con espaciado generoso
- **V2**: Label flotante moderno que sube al enfocar, estilo Material Design lifestyle
- **V3**: Solo placeholder con ilustración flat sutil al lado del campo
- **V4**: Label arriba con micro-animación de aparición al scroll (fintech)
- **V5**: Split: label izquierda + campo derecha en desktop, arriba en mobile
- **V6**: Label grande centrado arriba del campo con tipografía bold hero
- **V7**: Label con tamaño variable según importancia del campo (asimétrico)
- **V8**: Label con indicador de completitud (badge numérico "2 de 5")
- **V9**: Label como pregunta conversacional "¿Cuál es tu email?"
- **V10**: Label interactivo que cambia al enfocar "Email → Escribe tu email..."

#### C1.2 [DEFINIDO]
**¿El placeholder debe ser ejemplo de formato o instrucción?**
→ Ejemplo de formato: "Ej: 12345678"

#### C1.3 [DEFINIDO]
**¿Campos obligatorios deben marcarse con asterisco o indicar 'Opcional'?**
→ Indicar "Opcional" en los no obligatorios (más positivo)

---

### 3.2 Campos de Texto (4 preguntas)

#### C1.4 [ITERAR - 10 versiones]
**¿Los inputs deben tener bordes, solo línea inferior, o ser campos filled?**
- **V1**: Bordes completos rectangulares estilo e-commerce clásico
- **V2**: Línea inferior estilo Material Design con animación de focus
- **V3**: Fondo filled sin bordes con esquinas suaves (flat)
- **V4**: Bordes con sombra sutil y glow en focus (fintech)
- **V5**: Split: bordered en desktop, filled en mobile para touch
- **V6**: Campo grande centrado con bordes prominentes (hero input)
- **V7**: Bordes asimétricos con grosor variable según estado
- **V8**: Input con badge de validación integrado en el borde derecho
- **V9**: Campo con fondo que cambia según la "historia" del usuario
- **V10**: Input con preview interactivo del formato mientras escribe

#### C1.5 [DEFINIDO]
**¿El campo activo (focus) debe tener color de marca o estándar?**
→ Color primario #4654CD

#### C1.6 [DEFINIDO]
**¿Debe haber contador de caracteres en campos con límite?**
→ Sí, formato "45/100"

#### C1.7 [DEFINIDO]
**¿Los campos numéricos deben tener formato automático?**
→ Sí, "999 999 999" para celular, "S/ 1,500" para montos

---

### 3.3 Selects y Dropdowns (4 preguntas)

#### C1.8 [DEFINIDO]
**¿Los selects deben ser dropdown nativo o componente custom?**
→ Componente custom de NextUI para consistencia

#### C1.9 [DEFINIDO]
**¿Debe haber buscador en selects con muchas opciones?**
→ Sí, para instituciones (100+) y carreras

#### C1.10 [DEFINIDO]
**¿Las opciones del select deben tener iconos o solo texto?**
→ Iconos cuando aporten valor (instituciones con logo)

#### C1.11 [DEFINIDO]
**¿Selects dependientes deben cargar opciones inmediatamente?**
→ Mostrar loading, luego opciones

---

### 3.4 Checkboxes y Radios (3 preguntas)

#### C1.12 [DEFINIDO]
**¿Checkboxes deben ser estándar o custom con colores de marca?**
→ Custom con #4654CD

#### C1.13 [ITERAR - 10 versiones]
**¿Opciones mutuamente excluyentes deben ser radios, segmented, o cards?**
- **V1**: Radio buttons tradicionales con labels grandes (e-commerce)
- **V2**: Segmented control horizontal estilo iOS (lifestyle)
- **V3**: Cards clickeables con ilustraciones flat por opción
- **V4**: Pills flotantes con animación de selección (fintech)
- **V5**: Split horizontal: opción A izquierda, opción B derecha
- **V6**: Botones grandes centrados uno sobre otro (impacto)
- **V7**: Cards con tamaños variables según popularidad de opción (bold)
- **V8**: Opciones con % de usuarios que eligen cada una (data)
- **V9**: Cards con micro-historias "Como María, elige..." (storytelling)
- **V10**: Selector interactivo con preview de resultado al hover

#### C1.14 [DEFINIDO]
**¿El área clickeable debe ser solo el checkbox o toda la fila?**
→ Toda la fila/label

---

### 3.5 Upload de Archivos (5 preguntas)

#### C1.15 [ITERAR - 10 versiones]
**¿El área de upload debe ser drag & drop, botón, o ambos?**
- **V1**: Drag & drop prominente + botón secundario (e-commerce)
- **V2**: Solo botón estilizado con icono de cámara/archivo (lifestyle)
- **V3**: Área ilustrada con personaje flat indicando dónde soltar
- **V4**: Zona con bordes animados que pulsan al hover (fintech)
- **V5**: Split: drag área izquierda + instrucciones derecha
- **V6**: Área grande centrada con CTA prominente (impacto)
- **V7**: Zona asimétrica con esquina destacada para soltar (bold)
- **V8**: Upload con preview de tipos de archivo aceptados (data)
- **V9**: Área con guía paso a paso "1. Toma foto → 2. Sube" (story)
- **V10**: Upload interactivo con cámara integrada en móvil

#### C1.16 [ITERAR - 10 versiones]
**¿Debe mostrarse preview del archivo subido?**
- **V1**: Thumbnail de imagen/PDF con tamaño fijo (producto)
- **V2**: Preview expandido con contexto de uso (lifestyle)
- **V3**: Icono flat del tipo de archivo + nombre truncado
- **V4**: Mini-card flotante con animación de entrada (fintech)
- **V5**: Split: preview izquierda + metadata derecha
- **V6**: Preview grande centrado como confirmación (impacto)
- **V7**: Preview con tamaño variable según importancia (bold)
- **V8**: Preview con análisis automático "Detectamos: DNI" (data)
- **V9**: Preview con mensaje "¡Perfecto! Se ve claro" (story)
- **V10**: Preview interactivo con zoom y rotación

#### C1.17 [ITERAR - 10 versiones]
**¿Debe haber barra de progreso durante la subida?**
- **V1**: Barra horizontal con porcentaje numérico (e-commerce)
- **V2**: Spinner circular elegante sin número (lifestyle)
- **V3**: Barra con ilustración flat que avanza
- **V4**: Círculo de progreso con animación fluida (fintech)
- **V5**: Split: barra + texto de estado al lado
- **V6**: Número grande centrado "75%" (impacto)
- **V7**: Barra con grosor variable que crece al avanzar (bold)
- **V8**: Progreso con velocidad estimada "~3 segundos" (data)
- **V9**: Mensajes secuenciales "Preparando... Subiendo... Listo!" (story)
- **V10**: Progreso interactivo con opción de cancelar visible

#### C1.18 [DEFINIDO]
**¿Qué icono o ilustración usar para el área de upload vacía?**
→ Icono Upload con texto "Arrastra tu archivo aquí"

#### C1.19 [DEFINIDO]
**¿En móvil debe haber opción de 'Tomar foto'?**
→ Sí, botón "Tomar foto" además de "Elegir archivo"

---

### 3.6 Validación - Timing (4 preguntas)

#### C1.20 [DEFINIDO]
**¿Validar en tiempo real o al salir del campo?**
→ Al salir del campo (onBlur) para no interrumpir

#### C1.21 [ITERAR - 10 versiones]
**¿Validar todo al hacer clic en Continuar?**
- **V1**: Mostrar todos los errores en resumen arriba (e-commerce)
- **V2**: Scroll suave al primer error con highlight (lifestyle)
- **V3**: Shake animado en campos con error + iconos flat
- **V4**: Campos con error flotan/destacan con glow (fintech)
- **V5**: Split: errores listados izquierda + formulario derecha
- **V6**: Modal centrado con lista de correcciones (impacto)
- **V7**: Errores con tamaños variables según gravedad (bold)
- **V8**: "3 campos necesitan atención" con lista expandible (data)
- **V9**: "Casi listo, solo falta..." con guía amigable (story)
- **V10**: Navegación interactiva entre errores con arrows

#### C1.22 [DEFINIDO]
**¿Campos válidos deben mostrar checkmark verde?**
→ Sí, feedback positivo sutil

---

### 3.7 Validación - Errores (4 preguntas)

#### C1.23 [ITERAR - 10 versiones]
**¿El mensaje de error debe estar debajo del campo, tooltip, o resumen?**
- **V1**: Inline debajo del campo con icono de alerta (e-commerce)
- **V2**: Tooltip elegante al hover/focus del campo (lifestyle)
- **V3**: Badge flotante con ilustración flat de advertencia
- **V4**: Popover con animación de aparición (fintech)
- **V5**: Split: mensaje inline + indicador en sidebar
- **V6**: Mensaje grande destacado debajo (impacto)
- **V7**: Error con posición variable según espacio disponible (bold)
- **V8**: Error con sugerencia de corrección automática (data)
- **V9**: Error como diálogo amigable "Hmm, esto no parece..." (story)
- **V10**: Error interactivo con botón "Corregir automáticamente"

#### C1.24 [ITERAR - 10 versiones]
**¿El campo con error debe tener borde rojo, fondo rojo suave, o solo mensaje?**
- **V1**: Borde rojo sólido 2px estilo e-commerce
- **V2**: Borde rojo + fondo rojo muy suave (lifestyle)
- **V3**: Solo icono de error flat, sin cambio de color en campo
- **V4**: Glow rojo sutil alrededor del campo (fintech)
- **V5**: Borde rojo izquierdo vertical (indicator bar)
- **V6**: Campo completo con fondo rojo suave prominente (impacto)
- **V7**: Borde con grosor variable según severidad del error (bold)
- **V8**: Indicador numérico "!" con contador de errores (data)
- **V9**: Cambio gradual de color mientras corrige (story)
- **V10**: Campo que vibra sutilmente al detectar error

#### C1.25 [DEFINIDO]
**¿El mensaje de error debe ser técnico o amigable?**
→ Amigable: "Este número no parece correcto"

#### C1.26 [DEFINIDO]
**¿Debe explicarse cómo corregir el error?**
→ Sí: "Ingresa 8 dígitos sin espacios"

---

### 3.8 Ayuda Contextual (4 preguntas)

#### C1.27 [DEFINIDO]
**¿Cada campo debe tener icono de ayuda (?)?**
→ Solo campos que generen dudas comunes

#### C1.28 [ITERAR - 10 versiones]
**¿La ayuda debe ser tooltip hover, click, o texto visible?**
- **V1**: Tooltip al hover (desktop) / tap (móvil) estilo clásico
- **V2**: Panel expandible elegante debajo del campo (lifestyle)
- **V3**: Modal con ilustración flat explicativa
- **V4**: Popover flotante con animación suave (fintech)
- **V5**: Split: texto de ayuda fijo en sidebar derecho
- **V6**: Help text grande siempre visible debajo (impacto)
- **V7**: Ayuda con tamaño adaptativo según complejidad (bold)
- **V8**: Tooltip con estadística "El 90% completa esto en 10 seg" (data)
- **V9**: Ayuda como tip amigable "Pro tip: puedes usar..." (story)
- **V10**: Asistente interactivo que guía paso a paso

#### C1.29 [ITERAR - 10 versiones]
**¿Debe haber ejemplos visuales de documentos aceptados?**
- **V1**: Imagen pequeña de ejemplo en tooltip (e-commerce)
- **V2**: Galería de ejemplos en modal con swipe (lifestyle)
- **V3**: Ilustraciones flat de documentos con checkmarks
- **V4**: Carousel de ejemplos con transiciones fluidas (fintech)
- **V5**: Panel split: ejemplos válidos vs. no válidos
- **V6**: Ejemplo grande destacado como referencia (impacto)
- **V7**: Grid de ejemplos con tamaños según relevancia (bold)
- **V8**: Ejemplos con tasa de aprobación "Este formato: 95% OK" (data)
- **V9**: Guía visual paso a paso "Así se ve un buen documento" (story)
- **V10**: Comparador interactivo "¿Tu documento se ve así?"

#### C1.30 [DEFINIDO]
**¿Debe haber video tutorial para campos complejos?**
→ No para MVP, considerar para fase 2

---

## 4. Tipos TypeScript

```typescript
// types/fields.ts

export interface FieldsConfig {
  // C1.1 - Labels
  labelVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.4 - Inputs
  inputVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.13 - Opciones excluyentes
  optionSelectorVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.15 - Upload área
  uploadAreaVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.16 - Preview
  previewVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.17 - Progreso
  progressVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.21 - Validación submit
  submitValidationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.23 - Posición error
  errorPositionVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.24 - Estilo error
  errorStyleVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.28 - Ayuda contextual
  helpVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // C1.29 - Ejemplos documentos
  docExamplesVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultFieldsConfig: FieldsConfig = {
  labelVersion: 1,
  inputVersion: 1,
  optionSelectorVersion: 1,
  uploadAreaVersion: 1,
  previewVersion: 1,
  progressVersion: 1,
  submitValidationVersion: 2,
  errorPositionVersion: 1,
  errorStyleVersion: 2,
  helpVersion: 1,
  docExamplesVersion: 1,
};

export interface FieldConfig {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'file' | 'date';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation: ValidationRule[];
  mask?: string;
  autoComplete?: string;
  dependsOn?: string;
  options?: FieldOption[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FieldOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface FieldState {
  value: any;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * TextInputV1 - Con bordes completos (E-commerce Clásico)
 * Estilo tradicional con bordes rectangulares y estados claros
 */

interface TextInputV1Props {
  id: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export const TextInputV1: React.FC<TextInputV1Props> = ({
  id,
  label,
  placeholder,
  helpText,
  required = false,
  error,
  isValid,
  value,
  onChange,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 ml-1">(Opcional)</span>}
        {helpText && (
          <button className="ml-1 text-neutral-400 hover:text-[#4654CD] cursor-pointer">
            <HelpCircle className="w-4 h-4 inline" />
          </button>
        )}
      </label>

      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          classNames={{
            input: 'text-base',
            inputWrapper: `
              border-2 transition-colors
              ${error ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
              ${isValid && !error ? 'border-[#22c55e]' : ''}
              ${isFocused && !error ? 'border-[#4654CD]' : ''}
              ${!isFocused && !error && !isValid ? 'border-neutral-300' : ''}
            `,
          }}
          endContent={
            <>
              {isValid && !error && <Check className="w-5 h-5 text-[#22c55e]" />}
              {error && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            </>
          }
        />
      </div>

      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};
```

---

## 6. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/fields.ts` - FieldsConfig con 11 selectores (1-10)
- [ ] `FieldsSettingsModal.tsx` - Modal con 11 selectores

### Inputs (10 versiones)
- [ ] `TextInputV1.tsx` a `V10.tsx`

### Labels (10 versiones)
- [ ] `FieldLabelV1.tsx` a `V10.tsx`

### Selects
- [ ] `SelectDropdown.tsx`
- [ ] `SearchableSelect.tsx`
- [ ] `DependentSelect.tsx`

### Opciones (10 versiones)
- [ ] `OptionSelectorV1.tsx` a `V10.tsx`
- [ ] `RadioGroupV1.tsx`

### Upload (10 versiones cada uno)
- [ ] `FileUploadV1.tsx` a `V10.tsx`
- [ ] `FilePreviewV1.tsx` a `V10.tsx`
- [ ] `UploadProgressV1.tsx` a `V10.tsx`

### Validación (10 versiones cada uno)
- [ ] `ValidationFeedbackV1.tsx` a `V10.tsx`
- [ ] `FieldErrorV1.tsx` a `V10.tsx`
- [ ] `ValidationSummary.tsx`

### Ayuda (10 versiones cada uno)
- [ ] `ContextualHelpV1.tsx` a `V10.tsx`
- [ ] `DocumentExampleV1.tsx` a `V10.tsx`
- [ ] `FieldTooltip.tsx`

### Documentación
- [ ] `FIELDS_README.md`

---

## 7. Notas Importantes

1. **Feedback inmediato**: Validar onBlur, mostrar checkmark en válido
2. **Mensajes amigables**: "Este número no parece correcto" vs "Formato inválido"
3. **Accesibilidad**: Labels asociados, aria-describedby para errores
4. **Mobile-First**: Teclado numérico para números, email keyboard para emails
5. **Sin gradientes**: Colores sólidos
6. **Sin emojis**: Solo Lucide icons
7. **cursor-pointer**: En todos los elementos clickeables
