# Prompt #6: Quiz de Ayuda "¿No te decides?" - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 5 |
| **Iteraciones T (3 versiones)** | 4 |
| **Prioridad** | Baja - Fase 2 |

---

## 1. Contexto

El quiz de ayuda es una herramienta para usuarios indecisos que no saben qué laptop elegir. A través de preguntas simples sobre uso y preferencias, recomienda el producto más adecuado.

### Insights UX/UI
- **3-5 preguntas máximo**: Más aburre, menos no personaliza
- **Visual e iconográfico**: Más engaging que solo texto
- **Resultado inmediato**: Top 3 productos recomendados
- **Enfoque en uso, no specs**: Estudiantes no conocen specs

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/quiz/
├── page.tsx
├── quiz-preview/
│   └── page.tsx
├── components/
│   └── quiz/
│       ├── HelpQuiz.tsx
│       ├── QuizSettingsModal.tsx
│       ├── layout/
│       │   ├── QuizLayoutV1.tsx          # Modal overlay
│       │   ├── QuizLayoutV2.tsx          # Widget lateral
│       │   └── QuizLayoutV3.tsx          # Página dedicada
│       ├── questions/
│       │   ├── QuizQuestionV1.tsx        # Cards con iconos
│       │   ├── QuizQuestionV2.tsx        # Botones grandes
│       │   └── QuizQuestionV3.tsx        # Slider/scale
│       ├── progress/
│       │   └── QuizProgress.tsx
│       └── results/
│           ├── QuizResultsV1.tsx         # 1 producto destacado
│           ├── QuizResultsV2.tsx         # Top 3 productos
│           └── QuizResultsV3.tsx         # Categoría + productos
├── types/
│   └── quiz.ts
└── QUIZ_README.md
```

---

## 3. Preguntas del Segmento B - Quiz

### B.98 [ITERAR - 3 versiones]
**¿El quiz debe ser modal, página separada, o widget lateral?**
- **V1**: Modal overlay centrado (foco total)
- **V2**: Widget lateral colapsable (siempre accesible)
- **V3**: Página dedicada /quiz (más espacio)

### B.99 [ITERAR - 3 versiones]
**¿Cuántas preguntas debe tener el quiz?**
- **V1**: 3 preguntas (ultra rápido)
- **V2**: 5 preguntas (balance ideal)
- **V3**: 7 preguntas (más precisión)

### B.100 [DEFINIDO]
**¿Las preguntas deben ser con iconos/imágenes o solo texto?**
→ Con iconos ilustrativos para cada opción

### B.101 [ITERAR - 3 versiones]
**¿El resultado debe ser 1 producto, top 3, o categoría?**
- **V1**: 1 producto "Perfecto para ti" destacado
- **V2**: Top 3 productos ordenados por match
- **V3**: Categoría recomendada + productos filtrados

### B.102 [ITERAR - 3 versiones]
**¿El quiz debe preguntar por uso o por specs técnicas?**
- **V1**: Solo por uso ("¿Para qué la usarás?")
- **V2**: Solo por preferencias ("¿Qué valoras más?")
- **V3**: Híbrido: uso + presupuesto + preferencia

---

## 4. Tipos TypeScript

```typescript
// types/quiz.ts

export interface QuizConfig {
  layoutVersion: 1 | 2 | 3;
  questionCount: 3 | 5 | 7;
  questionStyle: 1 | 2 | 3;
  resultsVersion: 1 | 2 | 3;
  focusVersion: 1 | 2 | 3;
}

export interface QuizQuestion {
  id: string;
  question: string;
  helpText?: string;
  options: QuizOption[];
  type: 'single' | 'multiple' | 'scale';
}

export interface QuizOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
  weight: Record<string, number>; // Pesos para cada categoría
}

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface QuizResult {
  matchScore: number;
  product: Product;
  reasons: string[];
}

// Preguntas predefinidas
export const quizQuestions: QuizQuestion[] = [
  {
    id: 'usage',
    question: '¿Para qué usarás tu laptop principalmente?',
    options: [
      { id: 'estudios', label: 'Estudios y clases', icon: 'GraduationCap', weight: { ram: 8, gpu: 'integrated' } },
      { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', weight: { ram: 16, gpu: 'dedicated' } },
      { id: 'diseno', label: 'Diseño y edición', icon: 'Palette', weight: { ram: 16, gpu: 'dedicated' } },
      { id: 'oficina', label: 'Trabajo de oficina', icon: 'Briefcase', weight: { ram: 8, gpu: 'integrated' } },
      { id: 'programacion', label: 'Programación', icon: 'Code', weight: { ram: 16, storage: 512 } },
    ],
    type: 'single',
  },
  {
    id: 'budget',
    question: '¿Cuál es tu presupuesto mensual para cuotas?',
    options: [
      { id: 'low', label: 'Hasta S/80', icon: 'Wallet', weight: { maxPrice: 2000 } },
      { id: 'medium', label: 'S/80 - S/150', icon: 'Wallet', weight: { maxPrice: 3500 } },
      { id: 'high', label: 'S/150 - S/250', icon: 'Wallet', weight: { maxPrice: 5000 } },
      { id: 'premium', label: 'Más de S/250', icon: 'Wallet', weight: { maxPrice: 10000 } },
    ],
    type: 'single',
  },
  {
    id: 'priority',
    question: '¿Qué es lo más importante para ti?',
    options: [
      { id: 'portabilidad', label: 'Portabilidad (liviana)', icon: 'Feather', weight: { weight: 1.5 } },
      { id: 'bateria', label: 'Duración de batería', icon: 'Battery', weight: { battery: 8 } },
      { id: 'pantalla', label: 'Pantalla grande', icon: 'Monitor', weight: { display: 15.6 } },
      { id: 'rendimiento', label: 'Máximo rendimiento', icon: 'Zap', weight: { performance: 'high' } },
    ],
    type: 'single',
  },
];
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Progress } from '@nextui-org/react';
import { GraduationCap, Gamepad2, Palette, Briefcase, Code } from 'lucide-react';

export const QuizQuestionV1: React.FC<{ question: QuizQuestion; onAnswer: (optionId: string) => void }> = ({
  question,
  onAnswer,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  
  const iconMap: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className="w-8 h-8" />,
    Gamepad2: <Gamepad2 className="w-8 h-8" />,
    Palette: <Palette className="w-8 h-8" />,
    Briefcase: <Briefcase className="w-8 h-8" />,
    Code: <Code className="w-8 h-8" />,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-neutral-800">
        {question.question}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {question.options.map((option) => (
          <Card
            key={option.id}
            isPressable
            onPress={() => {
              setSelected(option.id);
              onAnswer(option.id);
            }}
            className={`transition-all ${
              selected === option.id 
                ? 'border-2 border-[#4247d2] bg-[#4247d2]/5' 
                : 'border border-neutral-200 hover:border-[#4247d2]/50'
            }`}
          >
            <CardBody className="text-center py-6">
              <div className={`mx-auto mb-3 ${selected === option.id ? 'text-[#4247d2]' : 'text-neutral-600'}`}>
                {iconMap[option.icon]}
              </div>
              <p className="font-semibold">{option.label}</p>
              {option.description && (
                <p className="text-sm text-neutral-500 mt-1">{option.description}</p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

---

## 6. Checklist de Entregables

- [ ] `types/quiz.ts` - Tipos y preguntas predefinidas
- [ ] `HelpQuiz.tsx` - Wrapper principal
- [ ] `QuizSettingsModal.tsx`
- [ ] `QuizLayoutV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `QuizQuestionV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `QuizProgress.tsx`
- [ ] `QuizResultsV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] Botón de acceso "¿No te decides?"
- [ ] `QUIZ_README.md`

---

## 7. Notas Importantes

1. **Enfoque en uso**: Preguntas sobre necesidades, no specs técnicas
2. **Rápido**: 3-5 preguntas máximo
3. **Visual**: Iconos grandes y claros
4. **Resultado inmediato**: Sin esperas ni loading extensos
5. **CTA claro**: "Ver laptop recomendada"
6. **Sin emojis**: Solo Lucide icons

---

## 8. Notas de Implementación

### Grid Dinámico en QuizQuestionV1

El componente `QuizQuestionV1` usa un grid dinámico basado en el número de opciones para evitar que cards queden con anchos inconsistentes:

```tsx
<div
  className={`grid gap-3 md:gap-4 ${
    question.options.length === 2
      ? 'grid-cols-2'
      : question.options.length === 3
        ? 'grid-cols-2 md:grid-cols-3'
        : question.options.length === 4
          ? 'grid-cols-2 md:grid-cols-4'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
  }`}
>
```

**Lógica:**
- **2 opciones**: 2 columnas (1 fila)
- **3 opciones**: 2 columnas móvil, 3 columnas tablet+ (1 fila perfecta)
- **4 opciones**: 2 columnas móvil (2x2), 4 columnas tablet+ (1 fila)
- **5+ opciones**: 2 columnas móvil, 3 tablet, 5 desktop

Esto asegura que todas las cards tengan el mismo ancho dentro de cada fila.
