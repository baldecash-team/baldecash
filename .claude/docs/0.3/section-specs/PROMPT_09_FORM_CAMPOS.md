# Prompt #9: Formulario - Componentes de Campos - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.1 |
| **Preguntas totales** | 30 |
| **Iteraciones T (3 versiones)** | 11 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

Los componentes de campos de formulario son los building blocks de todo el wizard. Deben ser accesibles, claros y proporcionar feedback inmediato.

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/solicitud/
├── components/
│   └── fields/
│       ├── inputs/
│       │   ├── TextInputV1.tsx           # Bordes completos
│       │   ├── TextInputV2.tsx           # Línea inferior
│       │   └── TextInputV3.tsx           # Filled (fondo)
│       ├── labels/
│       │   ├── FieldLabelV1.tsx          # Label arriba
│       │   ├── FieldLabelV2.tsx          # Label flotante
│       │   └── FieldLabelV3.tsx          # Solo placeholder
│       ├── selects/
│       │   ├── SelectDropdown.tsx
│       │   ├── SearchableSelect.tsx
│       │   └── DependentSelect.tsx
│       ├── checkboxes/
│       │   ├── CheckboxV1.tsx            # Estándar
│       │   ├── CheckboxV2.tsx            # Custom branded
│       │   └── RadioGroupV1.tsx
│       ├── upload/
│       │   ├── FileUploadV1.tsx          # Drag & drop
│       │   ├── FileUploadV2.tsx          # Botón simple
│       │   └── FilePreview.tsx
│       ├── validation/
│       │   ├── FieldError.tsx
│       │   ├── FieldSuccess.tsx
│       │   └── ValidationSummary.tsx
│       └── help/
│           ├── FieldTooltip.tsx
│           ├── ContextualHelp.tsx
│           └── DocumentExample.tsx
├── types/
│   └── fields.ts
└── FIELDS_README.md
```

---

## 3. Preguntas del Segmento C.1

### 3.1 Labels y Placeholders (3 preguntas)

#### C1.1 [ITERAR - 3 versiones] - PREFERIDO: V1

**¿Los campos deben tener label arriba, label flotante, o solo placeholder?**
- **V1**: Label arriba (siempre visible) **[PREFERIDO]**
- **V2**: Label flotante (moderno, ahorra espacio)
- **V3**: Solo placeholder (minimalista, menos accesible)

> **Decision:** V1 preferido - Label siempre visible mejora accesibilidad y claridad.

#### C1.2 [DEFINIDO]
**¿El placeholder debe ser ejemplo de formato o instrucción?**
→ Ejemplo de formato: "Ej: 12345678"

#### C1.3 [DEFINIDO]
**¿Campos obligatorios deben marcarse con asterisco o indicar 'Opcional'?**
→ Indicar "Opcional" en los no obligatorios (más positivo)

---

### 3.2 Campos de Texto (4 preguntas)

#### C1.4 [ITERAR - 3 versiones] - PREFERIDO: V3 o V1 (mas iteraciones)

**¿Los inputs deben tener bordes, solo línea inferior, o ser campos filled?**
- **V1**: Bordes completos (clásico) **[ALTERNATIVA]**
- **V2**: Línea inferior (Material Design)
- **V3**: Fondo filled sin bordes (moderno) **[PREFERIDO]**

> **Decision:** V3 preferido (filled) o V1 (bordes). Se requieren mas iteraciones para decidir.

#### C1.5 [DEFINIDO]
**¿El campo activo (focus) debe tener color de marca o estándar?**
→ Color primario #4247d2

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
→ Custom con #4247d2

#### C1.13 [ITERAR - 3 versiones] - PREFERIDO: V3 (condicional)

**¿Opciones mutuamente excluyentes deben ser radios, segmented, o cards?**
- **V1**: Radio buttons tradicionales
- **V2**: Segmented control (tabs)
- **V3**: Cards clickeables **[PREFERIDO si opciones <= 6]**

> **Decision:** V3 preferido SOLO si las opciones son 6 o menos. Para mas opciones usar V1 o V2.

#### C1.14 [DEFINIDO]
**¿El área clickeable debe ser solo el checkbox o toda la fila?**
→ Toda la fila/label

---

### 3.5 Upload de Archivos (5 preguntas)

#### C1.15 [ITERAR - 3 versiones] - PREFERIDO: V3

**¿El área de upload debe ser drag & drop, botón, o ambos?**
- **V1**: Drag & drop prominente + botón
- **V2**: Solo botón (más simple)
- **V3**: Área drag & drop que también es botón **[PREFERIDO]**

> **Decision:** V3 preferido - Combina ambas funcionalidades en una sola area interactiva.

#### C1.16 [ITERAR - 3 versiones] - REQUIERE CORRECCION

**¿Debe mostrarse preview del archivo subido?**
- **V1**: Thumbnail de imagen/PDF
- **V2**: Solo nombre + tamaño + X
- **V3**: Preview en modal al click

> **ALERTA:** Este componente no esta funcionando correctamente. Requiere revision y correccion de la implementacion.

#### C1.17 [ITERAR - 3 versiones] - REQUIERE CORRECCION

**¿Debe haber barra de progreso durante la subida?**
- **V1**: Barra horizontal con porcentaje
- **V2**: Spinner con porcentaje
- **V3**: Sin barra (solo estado subiendo/completado)

> **ALERTA:** Este componente no esta funcionando correctamente. Requiere revision y correccion de la implementacion.

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

#### C1.21 [ITERAR - 3 versiones] - PREFERIDO: V1

**¿Validar todo al hacer clic en Continuar?**
- **V1**: Sí, mostrar todos los errores arriba **[PREFERIDO]**
- **V2**: Scroll al primer error
- **V3**: Shake en campos con error

> **Decision:** V1 preferido - Mostrar todos los errores permite corregir todo de una vez.

#### C1.22 [DEFINIDO]
**¿Campos válidos deben mostrar checkmark verde?**
→ Sí, feedback positivo sutil

---

### 3.7 Validación - Errores (4 preguntas)

#### C1.23 [ITERAR - 3 versiones] - PREFERIDO: V1

**¿El mensaje de error debe estar debajo del campo, tooltip, o resumen?**
- **V1**: Debajo del campo (inline) **[PREFERIDO]**
- **V2**: Tooltip al hover/focus
- **V3**: Resumen arriba + inline

> **Decision:** V1 preferido - Error inline debajo del campo es mas claro y directo.

#### C1.24 [ITERAR - 3 versiones] - PREFERIDO: V1

**¿El campo con error debe tener borde rojo, fondo rojo suave, o solo mensaje?**
- **V1**: Borde rojo **[PREFERIDO]**
- **V2**: Borde rojo + fondo rojo suave
- **V3**: Solo mensaje rojo (menos agresivo)

> **Decision:** V1 preferido - Borde rojo es suficiente para indicar error sin ser demasiado agresivo.

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

#### C1.28 [ITERAR - 3 versiones] - PREFERIDO: V1

**¿La ayuda debe ser tooltip hover, click, o texto visible?**
- **V1**: Tooltip al hover (desktop) / click (móvil) **[PREFERIDO]**
- **V2**: Texto siempre visible debajo
- **V3**: Expandible con link "¿Necesitas ayuda?"

> **Decision:** V1 preferido - Tooltip al hover/click es menos intrusivo y no ocupa espacio.

#### C1.29 [ITERAR - 3 versiones] - PREFERIDO: V2

**¿Debe haber ejemplos visuales de documentos aceptados?**
- **V1**: Imagen de ejemplo en tooltip
- **V2**: Gallery de ejemplos en modal **[PREFERIDO]**
- **V3**: Inline pequeño al lado del upload

> **Decision:** V2 preferido - Gallery en modal permite mostrar ejemplos mas grandes y detallados.

#### C1.30 [DEFINIDO]
**¿Debe haber video tutorial para campos complejos?**
→ No para MVP, considerar para fase 2

---

## 4. Tipos TypeScript

```typescript
// types/fields.ts

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
 * TextInputV1 - Con bordes completos
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
          <button className="ml-1 text-neutral-400 hover:text-[#4247d2]">
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
              ${isFocused && !error ? 'border-[#4247d2]' : ''}
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

- [ ] `types/fields.ts`
- [ ] `TextInputV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `FieldLabelV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `SelectDropdown.tsx`
- [ ] `SearchableSelect.tsx`
- [ ] `DependentSelect.tsx`
- [ ] `CheckboxV1.tsx`, `V2.tsx`
- [ ] `RadioGroupV1.tsx`
- [ ] `FileUploadV1.tsx`, `V2.tsx`
- [ ] `FilePreview.tsx`
- [ ] `FieldError.tsx`
- [ ] `FieldSuccess.tsx`
- [ ] `ValidationSummary.tsx`
- [ ] `FieldTooltip.tsx`
- [ ] `ContextualHelp.tsx`
- [ ] `FIELDS_README.md`

---

## 7. Notas Importantes

1. **Feedback inmediato**: Validar onBlur, mostrar checkmark en válido
2. **Mensajes amigables**: "Este número no parece correcto" vs "Formato inválido"
3. **Accesibilidad**: Labels asociados, aria-describedby para errores
4. **Mobile-First**: Teclado numérico para números, email keyboard para emails
5. **Sin gradientes**: Colores sólidos
6. **Sin emojis**: Solo Lucide icons

---

## 8. Resumen de Decisiones Finales

| Componente | Version | Notas |
|------------|---------|-------|
| C1.1 Labels | **V1** | Label arriba (siempre visible) |
| C1.4 Inputs | **V3 o V1** | Filled o bordes - requiere mas iteraciones |
| C1.13 Opciones | **V3** | Cards clickeables SOLO si <= 6 opciones |
| C1.15 Upload | **V3** | Area drag & drop que es boton |
| C1.16 Preview | **CORREGIR** | No funciona - requiere revision |
| C1.17 Progreso | **CORREGIR** | No funciona - requiere revision |
| C1.21 Validacion | **V1** | Mostrar todos los errores arriba |
| C1.23 Errores | **V1** | Debajo del campo inline |
| C1.24 Estilo error | **V1** | Borde rojo |
| C1.28 Ayuda | **V1** | Tooltip hover/click |
| C1.29 Ejemplos docs | **V2** | Gallery en modal |

---

## 9. Tareas Pendientes

- [ ] **URGENTE:** Corregir C1.16 (preview de archivo) - no esta funcionando
- [ ] **URGENTE:** Corregir C1.17 (barra de progreso upload) - no esta funcionando
- [ ] Generar mas iteraciones para C1.4 (decidir entre V1 bordes o V3 filled)
