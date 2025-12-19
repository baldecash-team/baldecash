# Prompt #16: Pantalla de Rechazo - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | G |
| **Preguntas totales** | 19 |
| **Iteraciones T (10 versiones)** | 13 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

La pantalla de rechazo es crítica porque el 81% de los aplicantes actualmente son rechazados. Una buena experiencia de rechazo puede:
- Retener al usuario para futuras oportunidades
- Ofrecer alternativas viables
- Mantener la confianza en la marca

### Insights UX/UI
- **Empatía primero**: El usuario invirtió tiempo y esperanza
- **Alternativas concretas**: No dejarlo sin opciones
- **Sin culpar**: Nunca hacer sentir mal al usuario
- **Retención**: Capturar email para futuro

---

## 2. Estructura de Archivos (10 versiones)

```
src/app/prototipos/0.4/resultado/
├── rechazado/
│   └── page.tsx
├── rechazado-preview/
│   └── page.tsx
├── components/
│   └── rejection/
│       ├── RejectionScreen.tsx
│       ├── RejectionSettingsModal.tsx
│       ├── visual/
│       │   └── RejectionVisualV[1-10].tsx
│       ├── illustration/
│       │   └── IllustrationTypeV[1-10].tsx
│       ├── branding/
│       │   └── BrandingLevelV[1-10].tsx
│       ├── message/
│       │   └── MessagePersonalizationV[1-10].tsx
│       ├── explanation/
│       │   ├── ExplanationDetailV[1-10].tsx
│       │   └── ExplanationFramingV[1-10].tsx
│       ├── alternatives/
│       │   ├── AlternativesLayoutV[1-10].tsx
│       │   ├── ProductAlternativesV[1-10].tsx
│       │   ├── DownPaymentCalculatorV[1-10].tsx
│       │   └── CosignerOption.tsx
│       ├── retention/
│       │   ├── EmailCaptureV[1-10].tsx
│       │   ├── RetryTimelineV[1-10].tsx
│       │   └── EducationalContent.tsx
│       └── support/
│           ├── AdvisorCTAV[1-10].tsx
│           ├── AdvisorMessageV[1-10].tsx
│           └── ContactOptions.tsx
├── types/
│   └── rejection.ts
└── REJECTION_README.md
```

---

## 3. Preguntas del Segmento G

### 3.1 Tono Visual (3 preguntas)

#### G.1 [ITERAR - 10 versiones]
**¿La página de rechazo debe usar colores neutros o cálidos?**
- **V1**: Neutros fríos: grises suaves, sin color de marca prominente
- **V2**: Cálidos acogedores: beige, crema, sensación de calidez
- **V3**: Colores de marca suavizados: primario al 10% de opacidad
- **V4**: Neutros con acentos sutiles de color (fintech minimalista)
- **V5**: Split: sección neutra arriba + alternativas con color abajo
- **V6**: Colores muy suaves, casi blancos, máxima calma
- **V7**: Neutros con elementos bold de color en CTAs importantes
- **V8**: Escala de grises con datos y métricas resaltados
- **V9**: Paleta cálida narrativa: colores de "nuevo comienzo"
- **V10**: Colores adaptativos según tipo de rechazo

#### G.2 [ITERAR - 10 versiones]
**¿Debe haber ilustración? ¿De qué tipo?**
- **V1**: Persona pensativa/reflexiva mirando hacia adelante
- **V2**: Camino con bifurcación: "hay otras opciones"
- **V3**: Sin ilustración, solo iconografía minimalista flat
- **V4**: Shapes abstractos flotantes, estilo fintech
- **V5**: Ilustración pequeña lateral, no central
- **V6**: Ilustración grande de impacto emocional
- **V7**: Ilustración con tamaño variable según severidad
- **V8**: Gráficos abstractos y datos visuales
- **V9**: Escena narrativa: estudiante con puertas/opciones
- **V10**: Ilustración interactiva que revela alternativas

#### G.3 [ITERAR - 10 versiones]
**¿El diseño debe ser minimalista o mantener elementos de marca?**
- **V1**: Minimalista extremo: menos elementos en momento difícil
- **V2**: Branding completo: logo, colores, footer normal
- **V3**: Branding reducido: solo logo pequeño en header
- **V4**: Minimalista con toques sutiles de marca (fintech)
- **V5**: Split: header con marca + contenido minimalista
- **V6**: Minimalista con un solo elemento de marca destacado
- **V7**: Branding adaptativo según el tipo de rechazo
- **V8**: Marca presente pero muy sutil, datos prominentes
- **V9**: Marca como parte de la narrativa de apoyo
- **V10**: Usuario elige nivel de branding (personalizable)

---

### 3.2 Mensaje Principal (3 preguntas)

#### G.4 [DEFINIDO]
**¿Qué palabra usar para el rechazo?**
→ Evitar "rechazado". Usar: "En este momento no podemos aprobar tu solicitud"

#### G.5 [ITERAR - 10 versiones]
**¿Debe personalizarse con nombre?**
- **V1**: Sí prominente: "María, en este momento..."
- **V2**: No: mantener genérico, menos personal en momento negativo
- **V3**: Nombre sutil: solo en el saludo inicial, no en el mensaje
- **V4**: Nombre solo si mejora el tono, decisión por contexto
- **V5**: Nombre en mensaje pero no en título principal
- **V6**: Nombre grande y prominente para conexión personal
- **V7**: Nombre con énfasis variable según relación con usuario
- **V8**: Nombre + datos: "María, basado en tu perfil..."
- **V9**: Nombre como parte de narrativa: "María, tu camino..."
- **V10**: Usuario decide si quiere ver su nombre o no

#### G.6 [DEFINIDO]
**¿Debe agradecerse el tiempo invertido?**
→ Sí: "Gracias por tu interés en BaldeCash"

---

### 3.3 Explicación (3 preguntas)

#### G.7 [DEFINIDO]
**¿Debe darse razón del rechazo o solo el resultado?**
→ Razón general sin detalles específicos (por regulación)

#### G.8 [ITERAR - 10 versiones]
**¿Qué nivel de detalle en la explicación?**
- **V1**: General vago: "No cumples con los requisitos actuales"
- **V2**: Categoría: "Relacionado con tu historial crediticio"
- **V3**: Accionable: "Qué puedes hacer para mejorar" con lista
- **V4**: Técnico pero amigable: explicación con tooltips
- **V5**: Split: razón breve + expandible para más detalle
- **V6**: Explicación prominente y clara, sin esconder nada
- **V7**: Detalle variable según categoría de rechazo
- **V8**: Explicación con estadísticas: "X% en tu situación..."
- **V9**: Narrativa: "Entendemos que esto no es lo que esperabas..."
- **V10**: Explicación interactiva: FAQ expandible personalizado

#### G.9 [ITERAR - 10 versiones]
**¿Enmarcarse como 'qué puedes mejorar' vs 'por qué no calificaste'?**
- **V1**: 100% positivo: "Qué puedes hacer para el futuro"
- **V2**: Neutral balanceado: explicación sin juicio ni optimismo
- **V3**: Directo honesto: razones claras sin adornar
- **V4**: Positivo pero realista: oportunidades con contexto
- **V5**: Split: razón breve + acciones positivas debajo
- **V6**: Enfoque en acción: qué hacer ahora prominente
- **V7**: Tono adaptativo según tipo de rechazo
- **V8**: Data-driven: "Usuarios como tú mejoran en X meses"
- **V9**: Story: "Muchos estudiantes empezaron donde tú estás"
- **V10**: Interactivo: quiz para descubrir qué mejorar

---

### 3.4 Alternativas Visuales (4 preguntas)

#### G.10 [ITERAR - 10 versiones]
**¿Las alternativas deben ser cards clickeables o lista?**
- **V1**: Cards grandes con iconos prominentes y CTA
- **V2**: Lista elegante con bullets y links sutiles
- **V3**: Accordion expandible por cada alternativa
- **V4**: Cards con animación de hover atractiva (fintech)
- **V5**: Split: alternativas principales en cards + resto en lista
- **V6**: Cards gigantes, una alternativa por sección
- **V7**: Cards con tamaño variable según relevancia
- **V8**: Lista con indicadores de % de éxito por alternativa
- **V9**: Cards como "capítulos" de una historia de opciones
- **V10**: Carrusel interactivo de alternativas

#### G.11 [ITERAR - 10 versiones]
**¿Productos alternativos deben mostrarse con imagen y precio?**
- **V1**: Cards completas: imagen + nombre + precio + cuota
- **V2**: Lista simple: nombre + precio, sin imágenes
- **V3**: Solo mención: "Ver opciones más accesibles" como link
- **V4**: Mini cards con imagen pequeña y precio destacado
- **V5**: Split: un producto featured + lista de otros
- **V6**: Cards hero con productos alternativos prominentes
- **V7**: Tamaño de card según accesibilidad del producto
- **V8**: Productos con comparación: "S/X menos que tu opción"
- **V9**: Productos presentados como "Tu próxima oportunidad"
- **V10**: Selector interactivo: filtrar por presupuesto

#### G.12 [ITERAR - 10 versiones]
**¿Debe haber calculadora de 'con X enganche accedes a Y'?**
- **V1**: Calculadora interactiva prominente con slider
- **V2**: Ejemplos fijos: "Con S/500 inicial accedes a..."
- **V3**: Link a calculadora separada: "Calcula tu opción"
- **V4**: Calculadora animada con resultados en tiempo real
- **V5**: Split: calculadora izquierda + resultados derecha
- **V6**: Calculadora como elemento hero central
- **V7**: Calculadora con complejidad variable según usuario
- **V8**: Calculadora con datos: "El 60% elige S/300 de inicial"
- **V9**: Calculadora narrativa: "¿Cuánto puedes aportar?"
- **V10**: Calculadora gamificada: desbloquea productos

#### G.13 [DEFINIDO]
**¿La opción de codeudor debe explicarse visualmente?**
→ Sí, con ilustración simple de 2 personas

---

### 3.5 Retención (3 preguntas)

#### G.14 [ITERAR - 10 versiones]
**¿Debe capturarse email para futuras oportunidades?**
- **V1**: Campo prominente: "Avísame cuando pueda aplicar"
- **V2**: Checkbox discreto: "Quiero recibir novedades"
- **V3**: No pedir en este momento, muy intrusivo
- **V4**: Input elegante con animación de confirmación
- **V5**: Split: beneficio izquierda + input derecha
- **V6**: CTA grande para suscripción a oportunidades
- **V7**: Urgencia variable según probabilidad de mejora
- **V8**: "X estudiantes esperan como tú. ¿Te unimos?"
- **V9**: "Te acompañamos en tu camino" con suscripción
- **V10**: Opción de SMS, email o WhatsApp para notificación

#### G.15 [DEFINIDO]
**¿Debe ofrecerse contenido educativo?**
→ Sí, link a "Cómo mejorar tu perfil crediticio"

#### G.16 [ITERAR - 10 versiones]
**¿Debe indicarse cuándo puede volver a intentar?**
- **V1**: Fecha específica: "Puedes intentar de nuevo en 90 días"
- **V2**: General vago: "En unos meses podrías aplicar nuevamente"
- **V3**: No mencionar tiempo, puede frustrar
- **V4**: Countdown sutil hasta próxima oportunidad (fintech)
- **V5**: Tiempo + qué hacer mientras: "En 90 días, mientras..."
- **V6**: Tiempo prominente con calendario visual
- **V7**: Tiempo variable según tipo de rechazo
- **V8**: "Promedio de espera: 60 días" con estadísticas
- **V9**: "Tu próximo intento: preparémonos juntos"
- **V10**: Recordatorio automático: "¿Te avisamos en 90 días?"

---

### 3.6 Soporte (3 preguntas)

#### G.17 [ITERAR - 10 versiones]
**¿Debe ofrecerse hablar con un asesor?**
- **V1**: CTA prominente: "Habla con un asesor" con botón grande
- **V2**: Link secundario sutil al final de la página
- **V3**: Solo info de contacto, sin CTA directo
- **V4**: Chat flotante o botón de WhatsApp animado
- **V5**: Split: asesor como opción + autoservicio alternativo
- **V6**: Asesor como solución principal destacada
- **V7**: Asesor con nivel de prominencia según caso
- **V8**: "X usuarios hablaron con asesores hoy"
- **V9**: "Un asesor puede ayudarte a explorar opciones"
- **V10**: Agendar cita con asesor con calendar picker

#### G.18 [DEFINIDO]
**¿El contacto debe ser WhatsApp, llamada, o chat?**
→ WhatsApp primario (preferido por el segmento)

#### G.19 [ITERAR - 10 versiones]
**¿Debe indicarse que el asesor podría ayudar?**
- **V1**: Optimista: "Un asesor puede revisar opciones contigo"
- **V2**: Neutral: "¿Tienes preguntas? Estamos aquí"
- **V3**: Realista: "No podemos garantizar, pero podemos ayudar"
- **V4**: Promesa específica: "Te ayudamos a entender tu caso"
- **V5**: Split: qué puede hacer el asesor + qué no
- **V6**: Mensaje de esperanza prominente
- **V7**: Expectativa ajustada según tipo de rechazo
- **V8**: "El 40% de usuarios que hablan con asesor..."
- **V9**: "Conversemos sobre tu futuro financiero"
- **V10**: Sin crear falsas expectativas, enfoque en información

---

## 4. Tipos TypeScript

```typescript
// types/rejection.ts

export interface RejectionConfig {
  // G.1 - Colores y tono visual
  visualVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.2 - Tipo de ilustración
  illustrationVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.3 - Nivel de branding
  brandingVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.5 - Personalización del mensaje
  messageVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.8 - Detalle de explicación
  explanationDetailVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.9 - Framing de explicación
  explanationFramingVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.10 - Layout de alternativas
  alternativesLayoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.11 - Productos alternativos
  productAlternativesVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.12 - Calculadora de enganche
  calculatorVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.14 - Captura de email
  emailCaptureVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.16 - Tiempo de reintento
  retryTimelineVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.17 - CTA de asesor
  advisorCTAVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // G.19 - Mensaje del asesor
  advisorMessageVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export const defaultRejectionConfig: RejectionConfig = {
  visualVersion: 3,
  illustrationVersion: 1,
  brandingVersion: 3,
  messageVersion: 1,
  explanationDetailVersion: 3,
  explanationFramingVersion: 1,
  alternativesLayoutVersion: 1,
  productAlternativesVersion: 1,
  calculatorVersion: 2,
  emailCaptureVersion: 1,
  retryTimelineVersion: 1,
  advisorCTAVersion: 1,
  advisorMessageVersion: 1,
};

export interface RejectionData {
  applicationId: string;
  userName?: string;
  requestedProduct: {
    name: string;
    price: number;
    monthlyQuota: number;
  };
  rejectionCategory?: 'credit' | 'income' | 'documentation' | 'other';
  canRetryIn?: number; // días
  alternatives: RejectionAlternative[];
}

export interface RejectionAlternative {
  id: string;
  type: 'lower_product' | 'down_payment' | 'cosigner' | 'wait';
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
  calculator?: DownPaymentCalculator;
}

export interface DownPaymentCalculator {
  productPrice: number;
  minDownPayment: number;
  maxDownPayment: number;
  calculateQuota: (downPayment: number) => number;
}

export const defaultAlternatives: RejectionAlternative[] = [
  {
    id: 'lower',
    type: 'lower_product',
    title: 'Opciones más accesibles',
    description: 'Tenemos laptops con cuotas desde S/49/mes',
    icon: 'Laptop',
    action: { label: 'Ver opciones', href: '/catalogo?price=low' },
  },
  {
    id: 'down',
    type: 'down_payment',
    title: 'Pagar una inicial',
    description: 'Con una cuota inicial, reduces el monto a financiar',
    icon: 'Wallet',
  },
  {
    id: 'cosigner',
    type: 'cosigner',
    title: 'Aplicar con un codeudor',
    description: 'Un familiar puede respaldar tu solicitud',
    icon: 'Users',
    action: { label: 'Más información', href: '/codeudor' },
  },
  {
    id: 'wait',
    type: 'wait',
    title: 'Intentar más adelante',
    description: 'Puedes volver a aplicar en 90 días',
    icon: 'Calendar',
  },
];
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Input } from '@nextui-org/react';
import {
  AlertCircle, Laptop, Wallet, Users, Calendar,
  MessageCircle, Mail, ArrowRight
} from 'lucide-react';

/**
 * RejectionScreen - Pantalla de Rechazo Empática
 * Enfoque en alternativas y retención sin culpar al usuario
 */

export const RejectionScreen: React.FC<{ data: RejectionData }> = ({ data }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Icono */}
        <div className="w-20 h-20 mx-auto mb-6 bg-neutral-200 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-neutral-500" />
        </div>

        {/* Mensaje principal */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
            {data.userName ? `${data.userName}, en` : 'En'} este momento no podemos aprobar tu solicitud
          </h1>
          <p className="text-neutral-600">
            Gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud,
            hay otras opciones que podrían funcionarte.
          </p>
        </div>

        {/* Alternativas */}
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-lg">¿Qué puedes hacer?</h2>

          {defaultAlternatives.map((alt) => {
            const icons: Record<string, React.ReactNode> = {
              Laptop: <Laptop className="w-6 h-6" />,
              Wallet: <Wallet className="w-6 h-6" />,
              Users: <Users className="w-6 h-6" />,
              Calendar: <Calendar className="w-6 h-6" />,
            };

            return (
              <Card key={alt.id} isPressable={!!alt.action} className="cursor-pointer">
                <CardBody className="flex flex-row items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-[#4654CD]/10 rounded-lg flex items-center justify-center text-[#4654CD]">
                    {icons[alt.icon]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{alt.title}</h3>
                    <p className="text-sm text-neutral-600">{alt.description}</p>
                  </div>
                  {alt.action && (
                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Retención - Email */}
        <Card className="mb-8 bg-[#4654CD]/5 border-[#4654CD]/20">
          <CardBody className="p-6">
            <h3 className="font-semibold mb-2">¿Quieres que te avisemos?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Te notificaremos cuando tengas nuevas oportunidades de financiamiento.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-neutral-400" />}
              />
              <Button color="primary" className="bg-[#4654CD] cursor-pointer">
                Avisarme
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Retry info */}
        {data.canRetryIn && (
          <p className="text-center text-sm text-neutral-500 mb-8">
            Podrás volver a aplicar en {data.canRetryIn} días
          </p>
        )}

        {/* Soporte */}
        <div className="text-center">
          <p className="text-neutral-600 mb-4">
            ¿Tienes preguntas? Un asesor puede ayudarte a explorar opciones.
          </p>
          <Button
            variant="bordered"
            startContent={<MessageCircle className="w-4 h-4" />}
            className="border-[#4654CD] text-[#4654CD] cursor-pointer"
          >
            Hablar con un asesor
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/rejection.ts` - RejectionConfig con 13 selectores (1-10)
- [ ] `RejectionSettingsModal.tsx` - Modal con 13 selectores

### Pantalla Principal
- [ ] `RejectionScreen.tsx`

### Visual (10 versiones cada uno)
- [ ] `RejectionVisualV1.tsx` a `V10.tsx`
- [ ] `IllustrationTypeV1.tsx` a `V10.tsx`
- [ ] `BrandingLevelV1.tsx` a `V10.tsx`

### Mensaje (10 versiones)
- [ ] `MessagePersonalizationV1.tsx` a `V10.tsx`

### Explicación (10 versiones cada uno)
- [ ] `ExplanationDetailV1.tsx` a `V10.tsx`
- [ ] `ExplanationFramingV1.tsx` a `V10.tsx`

### Alternativas (10 versiones cada uno)
- [ ] `AlternativesLayoutV1.tsx` a `V10.tsx`
- [ ] `ProductAlternativesV1.tsx` a `V10.tsx`
- [ ] `DownPaymentCalculatorV1.tsx` a `V10.tsx`
- [ ] `CosignerOption.tsx`

### Retención (10 versiones cada uno)
- [ ] `EmailCaptureV1.tsx` a `V10.tsx`
- [ ] `RetryTimelineV1.tsx` a `V10.tsx`
- [ ] `EducationalContent.tsx`

### Soporte (10 versiones cada uno)
- [ ] `AdvisorCTAV1.tsx` a `V10.tsx`
- [ ] `AdvisorMessageV1.tsx` a `V10.tsx`
- [ ] `ContactOptions.tsx`

### Documentación
- [ ] `REJECTION_README.md`

---

## 7. Notas Importantes

1. **Nunca usar "rechazado"**: "En este momento no podemos aprobar..."
2. **Empatía primero**: Agradecer el tiempo invertido
3. **Alternativas concretas**: No dejar al usuario sin opciones
4. **Sin culpar**: El problema es "la situación", no "el usuario"
5. **Retención**: Capturar email para futuras oportunidades
6. **Asesor humano**: Ofrecer contacto directo
7. **Sin emojis**: Solo Lucide icons
8. **Sin gradientes**: Usar opacidades (`bg-[#4654CD]/10`)
9. **cursor-pointer**: En todos los elementos clickeables
