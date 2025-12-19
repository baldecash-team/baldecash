# Prompt #6: Quiz de Ayuda "¿No te decides?" - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (parcial) |
| **Preguntas totales** | 5 |
| **Iteraciones T (10 versiones)** | 4 |
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

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/quiz/
├── page.tsx                              # Redirect a preview
├── quiz-preview/
│   └── page.tsx                          # Preview con Settings Modal
├── quiz-v1/page.tsx                      # V1: Foto Producto
├── quiz-v2/page.tsx                      # V2: Foto Lifestyle
├── quiz-v3/page.tsx                      # V3: Ilustración Flat
├── quiz-v4/page.tsx                      # V4: Abstracto Flotante
├── quiz-v5/page.tsx                      # V5: Split 50/50
├── quiz-v6/page.tsx                      # V6: Centrado Hero
├── quiz-v7/page.tsx                      # V7: Asimétrico Bold
├── quiz-v8/page.tsx                      # V8: Data-Driven
├── quiz-v9/page.tsx                      # V9: Storytelling
├── quiz-v10/page.tsx                     # V10: Interactivo
├── components/
│   └── quiz/
│       ├── HelpQuiz.tsx
│       ├── QuizSettingsModal.tsx         # Modal con 4 selectores (1-10)
│       ├── layout/
│       │   └── QuizLayoutV[1-10].tsx
│       ├── questions/
│       │   └── QuizQuestionV[1-10].tsx
│       ├── progress/
│       │   └── QuizProgressV[1-10].tsx
│       └── results/
│           └── QuizResultsV[1-10].tsx
├── types/
│   └── quiz.ts
└── QUIZ_README.md
```

---

## 3. Preguntas del Segmento B - Quiz

### Pregunta B.98 [ITERAR - 10 versiones]
**¿El quiz debe ser modal, página separada, o widget lateral?**
- **V1**: Modal overlay centrado clásico (foco total, producto hero)
- **V2**: Widget lateral colapsable con preview de producto (lifestyle)
- **V3**: Página dedicada con ilustraciones flat animadas
- **V4**: Modal con shapes flotantes y animaciones fintech
- **V5**: Split screen: preguntas izquierda + preview derecha
- **V6**: Fullscreen immersivo centrado con transiciones suaves
- **V7**: Drawer asimétrico que empuja contenido con tipografía bold
- **V8**: Dashboard con progreso numérico y estadísticas de match
- **V9**: Experiencia story-like swipeable estilo Instagram
- **V10**: Wizard conversacional interactivo tipo chatbot

### Pregunta B.99 [ITERAR - 10 versiones]
**¿Cuántas preguntas debe tener el quiz?**
- **V1**: 3 preguntas ultra rápidas con respuestas producto-céntricas
- **V2**: 4 preguntas con contexto lifestyle (uso + ambiente)
- **V3**: 5 preguntas con ilustraciones flat por pregunta
- **V4**: 3 preguntas con animaciones de transición fintech
- **V5**: 4 preguntas split: uso izquierda + preferencias derecha
- **V6**: 3 preguntas grandes centradas de alto impacto
- **V7**: 5 preguntas con tipografía variable bold
- **V8**: 7 preguntas con barra de progreso y % de precisión
- **V9**: 4 preguntas como "capítulos" de historia
- **V10**: Dinámico: 3-7 según respuestas previas (branching)

### B.100 [DEFINIDO]
**¿Las preguntas deben ser con iconos/imágenes o solo texto?**
→ Con iconos ilustrativos para cada opción

### Pregunta B.101 [ITERAR - 10 versiones]
**¿El resultado debe ser 1 producto, top 3, o categoría?**
- **V1**: 1 producto "Perfecto para ti" con foto hero destacada
- **V2**: 1 producto con foto lifestyle en contexto de uso
- **V3**: Top 3 productos con ilustraciones flat comparativas
- **V4**: 1 producto con badge flotante de match % (fintech)
- **V5**: Split: producto principal + 2 alternativas laterales
- **V6**: 1 producto gigante centrado con impacto visual máximo
- **V7**: Top 3 con tamaños variables según match (asimétrico)
- **V8**: Ranking numérico detallado con scores por criterio
- **V9**: "La historia de tu match perfecto" con producto como protagonista
- **V10**: Resultados dinámicos con filtros para explorar más

### Pregunta B.102 [ITERAR - 10 versiones]
**¿El quiz debe preguntar por uso o por specs técnicas?**
- **V1**: Solo uso básico ("¿Para qué la usarás?") - enfoque simple
- **V2**: Uso + contexto ("¿Dónde estudias/trabajas?") - lifestyle
- **V3**: Preferencias ilustradas ("¿Qué valoras más?") - flat icons
- **V4**: Uso con micro-animaciones de retroalimentación (fintech)
- **V5**: Split: uso directo vs. preferencias indirectas
- **V6**: 1 pregunta clave de alto impacto + derivadas
- **V7**: Preferencias con opciones bold visualmente destacadas
- **V8**: Híbrido: uso + presupuesto + preferencias con scores
- **V9**: Preguntas como "¿Cuál es tu historia?" (storytelling)
- **V10**: Conversacional adaptativo según respuestas previas

---

## 4. Tipos TypeScript

```typescript
// types/quiz.ts

export interface QuizConfig {
  // B.98 - Layout del quiz
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.99 - Cantidad de preguntas
  questionCountVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.101 - Visualización de resultados
  resultsVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // B.102 - Enfoque de preguntas
  focusVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultQuizConfig: QuizConfig = {
  layoutVersion: 1,
  questionCountVersion: 2,
  resultsVersion: 2,
  focusVersion: 1,
};

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
  weight: Record<string, number | string>;
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

/**
 * QuizQuestionV1 - Cards con Iconos (Foto Producto)
 * Estilo e-commerce clásico con iconos grandes y respuestas claras
 */

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
            className={`transition-all cursor-pointer ${
              selected === option.id
                ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
                : 'border border-neutral-200 hover:border-[#4654CD]/50'
            }`}
          >
            <CardBody className="text-center py-6">
              <div className={`mx-auto mb-3 ${selected === option.id ? 'text-[#4654CD]' : 'text-neutral-600'}`}>
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

## 6. URLs de Acceso

```
/prototipos/0.4/quiz                    → Redirect a preview
/prototipos/0.4/quiz/quiz-preview       → Preview con Settings Modal
/prototipos/0.4/quiz/quiz-v1            → V1: Foto Producto
/prototipos/0.4/quiz/quiz-v2            → V2: Foto Lifestyle
/prototipos/0.4/quiz/quiz-v3            → V3: Ilustración Flat
/prototipos/0.4/quiz/quiz-v4            → V4: Abstracto Flotante
/prototipos/0.4/quiz/quiz-v5            → V5: Split 50/50
/prototipos/0.4/quiz/quiz-v6            → V6: Centrado Hero
/prototipos/0.4/quiz/quiz-v7            → V7: Asimétrico Bold
/prototipos/0.4/quiz/quiz-v8            → V8: Data-Driven
/prototipos/0.4/quiz/quiz-v9            → V9: Storytelling
/prototipos/0.4/quiz/quiz-v10           → V10: Interactivo
```

---

## 7. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/quiz.ts` - QuizConfig con 4 selectores
- [ ] `HelpQuiz.tsx` - Wrapper principal
- [ ] `QuizSettingsModal.tsx` - Modal con 4 selectores (1-10)

### Layout (10 versiones)
- [ ] `QuizLayoutV1.tsx` a `V10.tsx`

### Preguntas (10 versiones)
- [ ] `QuizQuestionV1.tsx` a `V10.tsx`

### Progreso (10 versiones)
- [ ] `QuizProgressV1.tsx` a `V10.tsx`

### Resultados (10 versiones)
- [ ] `QuizResultsV1.tsx` a `V10.tsx`

### Páginas
- [ ] `page.tsx` - Redirect a preview
- [ ] `quiz-preview/page.tsx` - Preview con Settings Modal
- [ ] `quiz-v1/page.tsx` a `quiz-v10/page.tsx`

### Documentación
- [ ] `QUIZ_README.md`

---

## 8. Notas Importantes

1. **Enfoque en uso**: Preguntas sobre necesidades, no specs técnicas
2. **Rápido**: 3-5 preguntas máximo (excepto V8 y V10)
3. **Visual**: Iconos grandes y claros
4. **Resultado inmediato**: Sin esperas ni loading extensos
5. **CTA claro**: "Ver laptop recomendada"
6. **Sin emojis**: Solo Lucide icons
7. **Sin gradientes**: Colores sólidos

