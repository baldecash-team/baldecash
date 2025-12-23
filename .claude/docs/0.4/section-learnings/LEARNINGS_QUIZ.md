# Aprendizajes Específicos - Quiz v0.4

> Lecciones aprendidas específicas del módulo de Quiz.
> Para reglas globales, ver `../CONVENTIONS.md`

---

## 1. Query Params del Quiz

### URL Base
```
/prototipos/0.4/quiz
```

### Parámetros Disponibles

| Param | Valores | Default | Descripción |
|-------|---------|---------|-------------|
| `layout` | 1-6 | 1 | Versión del layout |
| `questions` | 3, 5, 7 | 7 | Cantidad de preguntas |
| `style` | 1-6 | 1 | Estilo de preguntas |
| `results` | 1-6 | 1 | Versión de resultados |
| `focus` | 1-3 | 1 | Enfoque del quiz |

### Ejemplo Completo
```
/prototipos/0.4/quiz?layout=5&questions=7&style=1&results=1&focus=1
```

### Implementación

```typescript
const searchParams = useSearchParams();

const [config, setConfig] = useState<QuizConfig>(() => {
  const layout = parseInt(searchParams.get('layout') || '1');
  const questions = parseInt(searchParams.get('questions') || '7');
  // ...

  return {
    layoutVersion: (layout >= 1 && layout <= 6 ? layout : 1) as 1 | 2 | 3 | 4 | 5 | 6,
    questionCount: ([3, 5, 7].includes(questions) ? questions : 7) as 3 | 5 | 7,
    // ...
  };
});

// Actualizar URL cuando cambia config
const updateConfig = useCallback((newConfig: QuizConfig) => {
  setConfig(newConfig);
  const params = new URLSearchParams();
  params.set('layout', newConfig.layoutVersion.toString());
  params.set('questions', newConfig.questionCount.toString());
  // ...
  router.replace(`?${params.toString()}`, { scroll: false });
}, [router]);
```

---

## 2. Versiones de Layout

| Versión | Nombre | Descripción | Uso Recomendado |
|---------|--------|-------------|-----------------|
| V1 | Modal Full Screen | Modal centrado, full screen en mobile | PREFERIDO desktop |
| V2 | Widget Lateral | Panel lateral colapsable | Siempre accesible |
| V3 | Página Dedicada | Página completa /quiz | Más espacio |
| V4 | Bottom Sheet | Deslizable desde abajo | **PREFERIDO mobile** |
| V5 | Modal Limpio | Sin barra de progreso | **PREFERIDO desktop** |
| V6 | Chat Conversacional | Estilo asistente virtual | Experimental |

### Layout V5 - Modal Limpio

Modificado para remover la barra de pasos (wizard steps):

```typescript
// QuizLayoutV5.tsx - Sin barra de progreso
<ModalHeader className="flex flex-col bg-gradient-to-b from-[#4654CD]/5 to-white border-b border-neutral-100 py-6 px-6">
  <div className="flex items-center justify-between">
    {/* Solo header con título, sin wizard steps */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#4654CD] flex items-center justify-center">
        <HelpCircle className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-neutral-800">Asistente de Compra</h2>
        <p className="text-sm text-neutral-500">Responde algunas preguntas</p>
      </div>
    </div>
    <Button isIconOnly variant="light" onPress={onClose}>
      <X className="w-5 h-5" />
    </Button>
  </div>
</ModalHeader>
```

---

## 3. Config Responsivo (Mobile vs Desktop)

### Patrón

```typescript
import { useIsMobile } from '@/app/prototipos/_shared';

const isMobile = useIsMobile();

const quizConfig = {
  layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
  // V4 = Bottom Sheet (mobile)
  // V5 = Modal Limpio (desktop)
  questionCount: 7 as const,
  questionStyle: 1 as const,
  resultsVersion: 1 as const,
  focusVersion: 1 as const,
};
```

### Razón
- **Mobile (V4)**: Bottom sheet es patrón nativo, mejor UX táctil
- **Desktop (V5)**: Modal centrado aprovecha el espacio

---

## 4. Integración en Otras Páginas

### Catálogo

```typescript
import { HelpQuiz } from '../../quiz/components/quiz';

// Estado
const [isQuizOpen, setIsQuizOpen] = useState(false);
const isMobile = useIsMobile();

const quizConfig = {
  layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
  // ...
};

// FAB
<Button onPress={() => setIsQuizOpen(true)}>
  <HelpCircle />
  ¿Necesitas ayuda?
</Button>

// Modal
<HelpQuiz
  config={quizConfig}
  isOpen={isQuizOpen}
  onClose={() => setIsQuizOpen(false)}
  onComplete={(results) => {
    console.log('Quiz completed:', results);
    setIsQuizOpen(false);
  }}
/>
```

---

## 5. Versiones de Enfoque (Focus)

| Versión | Nombre | Preguntas Sobre |
|---------|--------|-----------------|
| V1 | Solo por Uso | "¿Para qué la usarás?" - PREFERIDO |
| V2 | Solo Preferencias | "¿Qué valoras más?" |
| V3 | Híbrido | Uso + presupuesto + preferencia |

### Nota
`focusVersion` solo tiene 3 versiones (no 6):

```typescript
if (configKey === 'focusVersion' && version > 3) {
  showToast(`${componentLabels[componentId]} solo tiene 3 versiones`, 'info');
  return;
}
```

---

## 6. Referencias

- **Spec**: `../section-specs/PROMPT_06_QUIZ_AYUDA.md`
- **Código**: `src/app/prototipos/0.4/quiz/`
- **Preview**: `http://localhost:3000/prototipos/0.4/quiz`
- **Componentes**: `src/app/prototipos/0.4/quiz/components/quiz/`

---

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-23 | Versión inicial - Query params, layouts, config responsivo |
