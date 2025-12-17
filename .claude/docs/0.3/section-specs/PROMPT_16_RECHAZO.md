# Prompt #16: Pantalla de Rechazo - BaldeCash Web 3.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | G |
| **Preguntas totales** | 19 |
| **Iteraciones T (3 versiones)** | 13 |
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

## 2. Estructura de Archivos

```
src/app/prototipos/0.2/resultado/
├── rechazado/
│   └── page.tsx
├── rechazado-preview/
│   └── page.tsx
├── components/
│   └── rejection/
│       ├── RejectionScreen.tsx
│       ├── RejectionSettingsModal.tsx
│       ├── visual/
│       │   ├── RejectionVisualV1.tsx     # Colores neutros
│       │   ├── RejectionVisualV2.tsx     # Colores cálidos
│       │   └── RejectionVisualV3.tsx     # Minimalista
│       ├── message/
│       │   ├── RejectionMessageV1.tsx    # Personalizado
│       │   └── RejectionMessageV2.tsx    # General
│       ├── explanation/
│       │   ├── ExplanationV1.tsx         # General
│       │   ├── ExplanationV2.tsx         # Específico
│       │   └── ExplanationV3.tsx         # "Qué puedes mejorar"
│       ├── alternatives/
│       │   ├── AlternativesV1.tsx        # Cards clickeables
│       │   ├── AlternativesV2.tsx        # Lista de opciones
│       │   ├── AlternativeProducts.tsx
│       │   ├── DownPaymentCalculator.tsx
│       │   └── CosignerOption.tsx
│       ├── retention/
│       │   ├── EmailCapture.tsx
│       │   ├── RetryTimeline.tsx
│       │   └── EducationalContent.tsx
│       └── support/
│           ├── AdvisorCTA.tsx
│           └── ContactOptions.tsx
├── types/
│   └── rejection.ts
└── REJECTION_README.md
```

---

## 3. Preguntas del Segmento G

### 3.1 Tono Visual (3 preguntas)

#### G.1 [ITERAR - 3 versiones]
**¿La página de rechazo debe usar colores neutros o cálidos?**
- **V1**: Neutros (grises, sin color de marca prominente)
- **V2**: Cálidos (beige, crema, acogedores)
- **V3**: Mantener colores de marca pero suavizados

#### G.2 [ITERAR - 3 versiones]
**¿Debe haber ilustración? ¿De qué tipo?**
- **V1**: Persona pensativa/reflexiva
- **V2**: Camino con bifurcación (hay otras opciones)
- **V3**: Sin ilustración, solo iconografía

#### G.3 [ITERAR - 3 versiones]
**¿El diseño debe ser minimalista o mantener elementos de marca?**
- **V1**: Minimalista (menos es más en momento difícil)
- **V2**: Mantener branding completo
- **V3**: Branding reducido (solo logo)

---

### 3.2 Mensaje Principal (3 preguntas)

#### G.4 [DEFINIDO]
**¿Qué palabra usar para el rechazo?**
→ Evitar "rechazado". Usar: "En este momento no podemos aprobar tu solicitud"

#### G.5 [ITERAR - 3 versiones]
**¿Debe personalizarse con nombre?**
- **V1**: Sí: "María, en este momento..."
- **V2**: No: mantener genérico
- **V3**: Solo si mejora el tono

#### G.6 [DEFINIDO]
**¿Debe agradecerse el tiempo invertido?**
→ Sí: "Gracias por tu interés en BaldeCash"

---

### 3.3 Explicación (3 preguntas)

#### G.7 [DEFINIDO]
**¿Debe darse razón del rechazo o solo el resultado?**
→ Razón general sin detalles específicos (por regulación)

#### G.8 [ITERAR - 3 versiones]
**¿Qué nivel de detalle en la explicación?**
- **V1**: General: "No cumples con los requisitos actuales"
- **V2**: Categoría: "Relacionado con tu historial crediticio"
- **V3**: Accionable: "Qué puedes hacer para mejorar"

#### G.9 [ITERAR - 3 versiones]
**¿Enmarcarse como 'qué puedes mejorar' vs 'por qué no calificaste'?**
- **V1**: Positivo: "Qué puedes hacer"
- **V2**: Neutral: explicación sin juicio
- **V3**: Directo: razones claras

---

### 3.4 Alternativas Visuales (4 preguntas)

#### G.10 [ITERAR - 3 versiones]
**¿Las alternativas deben ser cards clickeables o lista?**
- **V1**: Cards grandes con iconos
- **V2**: Lista con bullets
- **V3**: Accordion expandible

#### G.11 [ITERAR - 3 versiones]
**¿Productos alternativos deben mostrarse con imagen y precio?**
- **V1**: Cards completas con imagen
- **V2**: Lista simple con precio
- **V3**: Solo mención: "Ver opciones más accesibles"

#### G.12 [ITERAR - 3 versiones]
**¿Debe haber calculadora de 'con X enganche accedes a Y'?**
- **V1**: Calculadora interactiva prominente
- **V2**: Ejemplos fijos: "Con S/500 inicial..."
- **V3**: Link a calculadora separada

#### G.13 [DEFINIDO]
**¿La opción de codeudor debe explicarse visualmente?**
→ Sí, con ilustración simple de 2 personas

---

### 3.5 Retención (3 preguntas)

#### G.14 [ITERAR - 3 versiones]
**¿Debe capturarse email para futuras oportunidades?**
- **V1**: Campo prominente: "Avísame cuando pueda aplicar"
- **V2**: Checkbox: "Quiero recibir novedades"
- **V3**: No pedir en este momento

#### G.15 [DEFINIDO]
**¿Debe ofrecerse contenido educativo?**
→ Sí, link a "Cómo mejorar tu perfil crediticio"

#### G.16 [ITERAR - 3 versiones]
**¿Debe indicarse cuándo puede volver a intentar?**
- **V1**: Fecha específica: "Puedes intentar en 90 días"
- **V2**: General: "En unos meses"
- **V3**: No mencionar

---

### 3.6 Soporte (3 preguntas)

#### G.17 [ITERAR - 3 versiones]
**¿Debe ofrecerse hablar con un asesor?**
- **V1**: CTA prominente: "Habla con un asesor"
- **V2**: Link secundario
- **V3**: Solo info de contacto

#### G.18 [DEFINIDO]
**¿El contacto debe ser WhatsApp, llamada, o chat?**
→ WhatsApp primario (preferido por el segmento)

#### G.19 [ITERAR - 3 versiones]
**¿Debe indicarse que el asesor podría ayudar?**
- **V1**: Sí: "Un asesor puede revisar opciones contigo"
- **V2**: Neutral: "¿Tienes preguntas?"
- **V3**: No crear falsas expectativas

---

## 4. Tipos TypeScript

```typescript
// types/rejection.ts

export interface RejectionConfig {
  visualVersion: 1 | 2 | 3;
  illustrationType: 'person' | 'path' | 'none';
  messageVersion: 1 | 2;
  explanationVersion: 1 | 2 | 3;
  alternativesVersion: 1 | 2 | 3;
  showCalculator: boolean;
  retentionVersion: 1 | 2 | 3;
  supportVersion: 1 | 2 | 3;
}

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
              <Card key={alt.id} isPressable={!!alt.action}>
                <CardBody className="flex flex-row items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-[#4247d2]/10 rounded-lg flex items-center justify-center text-[#4247d2]">
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
        <Card className="mb-8 bg-[#4247d2]/5 border-[#4247d2]/20">
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
              <Button color="primary" className="bg-[#4247d2]">
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
            className="border-[#4247d2] text-[#4247d2]"
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

- [ ] `RejectionScreen.tsx`
- [ ] `RejectionSettingsModal.tsx`
- [ ] `RejectionVisualV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `RejectionMessageV1.tsx`, `V2.tsx`
- [ ] `ExplanationV1.tsx`, `V2.tsx`, `V3.tsx`
- [ ] `AlternativesV1.tsx`, `V2.tsx`
- [ ] `AlternativeProducts.tsx`
- [ ] `DownPaymentCalculator.tsx`
- [ ] `CosignerOption.tsx`
- [ ] `EmailCapture.tsx`
- [ ] `RetryTimeline.tsx`
- [ ] `AdvisorCTA.tsx`
- [ ] `types/rejection.ts`
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
