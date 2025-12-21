# Prompt: Vista de Solicitud - BaldeCash Web 3.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (Solicitud) |
| **Preguntas totales** | 6 |
| **Iteraciones T (3 versiones)** | 5 |
| **Prioridad** | Alta - MVP Core |
| **Integracion** | Se itera JUNTO con PROMPT_08 a PROMPT_13 (Wizard) |

---

## 1. Contexto

La vista de solicitud es la pantalla de introduccion antes del wizard. Debe motivar al usuario a completar el formulario, mostrando beneficios claros y transmitiendo confianza.

### Insights UX/UI
- **Primera impresion**: El usuario debe sentir que el proceso sera rapido y facil
- **Motivacion visual**: Mostrar lo que obtendra (laptop) genera engagement
- **Confianza**: Elementos que transmitan seguridad (logos, testimonios, tiempo estimado)

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.3/solicitud/
├── page.tsx                          # Redirect a intro
├── intro/
│   └── page.tsx                      # Vista de solicitud (antes del wizard)
├── components/
│   └── solicitud/
│       ├── SolicitudIntroContainer.tsx
│       ├── header/
│       │   ├── SolicitudHeaderV1.tsx    # Con titulo centrado
│       │   ├── SolicitudHeaderV2.tsx    # Con producto seleccionado
│       │   └── SolicitudHeaderV3.tsx    # Minimalista
│       ├── hero/
│       │   ├── SolicitudHeroV1.tsx      # Ilustracion motivacional
│       │   ├── SolicitudHeroV2.tsx      # Foto producto + beneficios
│       │   └── SolicitudHeroV3.tsx      # Caricatura Baldi
│       ├── cta/
│       │   ├── SolicitudCtaV1.tsx       # Boton prominente
│       │   ├── SolicitudCtaV2.tsx       # Boton + tiempo estimado
│       │   └── SolicitudCtaV3.tsx       # Card con boton
│       └── trust/
│           ├── TrustBadgesV1.tsx        # Logos de seguridad
│           ├── TrustBadgesV2.tsx        # Testimonios
│           └── TrustBadgesV3.tsx        # Estadisticas
├── types/
│   └── solicitud.ts
└── SOLICITUD_README.md
```

---

## 3. Preguntas del Segmento B - Vista de Solicitud

### B.1 [ITERAR - 3 versiones] - PREFERIDO: V2

**¿El header de solicitud debe mostrar el producto seleccionado o ser generico?**
- **V1**: Header generico "Solicita tu laptop"
- **V2**: Header con producto seleccionado (thumbnail + nombre) **[PREFERIDO]**
- **V3**: Sin header, directo al contenido

> **Decision:** V2 preferido - Mostrar el producto mantiene al usuario enfocado en su objetivo.

---

### B.2 [ITERAR - 3 versiones] - PREFERIDO: V2 (desktop) / V3 (mobile)

**¿Debe mostrarse un titulo de formulario con indicacion de tiempo?**
- **V1**: Solo titulo "Completa tu solicitud"
- **V2**: Titulo + "Ahora" + tiempo estimado "Solo 5 minutos"
- **V3**: Titulo + tiempo estimado (sin "Ahora") **[PREFERIDO MOBILE]**

> **Decision:** V2 preferido en desktop. Para mobile usar V3 (el texto "Ahora" es redundante con el titulo).

---

### B.3 [ITERAR - 3 versiones] - PREFERIDO: V1

**¿Que tipo de mensaje motivacional usar?**
- **V1**: Beneficios del financiamiento (cuotas, sin inicial, rapido) **[PREFERIDO]**
- **V2**: Testimonios de estudiantes
- **V3**: Estadisticas ("95% aprobados en 24h")

> **Decision:** V1 preferido - Los beneficios son mas tangibles para el usuario.

---

### B.4 [DEFINIDO]

**¿Debe mostrarse tiempo estimado para completar?**
→ Si, prominente: "Tiempo estimado: 5 minutos"

---

### B.5 [ITERAR - 3 versiones] - PREFERIDO: V3 (con Baldi)

**¿Que imagen usar como hero visual?**
- **V1**: Ilustracion de estudiante con laptop
- **V2**: Foto real de producto laptop
- **V3**: Caricatura de Baldi (mascota BaldeCash) **[PREFERIDO]**

> **Decision:** V3 preferido - Usar la caricatura de Baldi como imagen hero para mantener identidad de marca.

---

### B.6 [ITERAR - 3 versiones] - PREFERIDO: V3 (Caricatura Baldi)

**¿El CTA debe ir directo o con elementos de confianza?**
- **V1**: Boton directo "Empezar solicitud"
- **V2**: Boton + badges de seguridad
- **V3**: Card con ilustracion Baldi + boton + tiempo **[PREFERIDO]**

> **Decision:** V3 preferido - Card con caricatura de Baldi mantiene la identidad de marca y genera confianza. Esta decision debe reflejarse tambien en la documentacion 0.4.

---

## 4. Tipos TypeScript

```typescript
// types/solicitud.ts

export interface SolicitudIntroConfig {
  // B.1 - Header
  headerVersion: 1 | 2 | 3;

  // B.2 - Titulo con tiempo
  titleVersion: 1 | 2 | 3;
  titleVersionMobile: 1 | 2 | 3; // Para mobile usar diferente

  // B.3 - Mensaje motivacional
  messageVersion: 1 | 2 | 3;

  // B.5 - Hero visual
  heroVersion: 1 | 2 | 3;

  // B.6 - CTA
  ctaVersion: 1 | 2 | 3;

  // Producto seleccionado
  selectedProduct?: {
    id: string;
    name: string;
    thumbnail: string;
    monthlyQuota: number;
  };
}

export interface SolicitudIntroData {
  estimatedMinutes: number;
  benefits: string[];
  trustBadges: TrustBadge[];
}

export interface TrustBadge {
  icon: string;
  text: string;
  subtext?: string;
}
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Clock, Shield, CheckCircle } from 'lucide-react';

/**
 * SolicitudHeroV3 - Con Caricatura de Baldi [PREFERIDO]
 */

export const SolicitudHeroV3: React.FC<{ config: SolicitudIntroConfig }> = ({ config }) => {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Caricatura de Baldi */}
      <div className="w-48 h-48 relative">
        <img
          src="/images/baldi-mascot.svg"
          alt="Baldi - Mascota BaldeCash"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Titulo */}
      <h1 className="text-2xl md:text-3xl font-bold text-center">
        ¡Ya casi tienes tu laptop!
      </h1>

      {/* Tiempo estimado */}
      <div className="flex items-center gap-2 text-neutral-600">
        <Clock className="w-5 h-5" />
        <span>Solo 5 minutos</span>
      </div>

      {/* Beneficios */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          <span>Sin inicial</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          <span>Cuotas fijas</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          <span>Respuesta en 24h</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        color="primary"
        className="bg-[#4247d2] font-bold text-lg px-12 py-6"
      >
        Empezar solicitud
      </Button>

      {/* Trust badge */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Shield className="w-4 h-4" />
        <span>Tus datos estan protegidos</span>
      </div>
    </div>
  );
};
```

---

## 6. Checklist de Entregables

- [ ] `SolicitudIntroContainer.tsx`
- [ ] `SolicitudHeaderV1.tsx`, `V2.tsx` [PREFERIDO], `V3.tsx`
- [ ] `SolicitudHeroV3.tsx` [PREFERIDO - con Baldi]
- [ ] `SolicitudCtaV3.tsx` [PREFERIDO - con Baldi]
- [ ] `TrustBadgesV1.tsx`
- [ ] `types/solicitud.ts`
- [ ] Imagen/SVG de caricatura Baldi
- [ ] `SOLICITUD_README.md`

---

## 7. Decisiones Finales

| Componente | Version Preferida | Notas |
|------------|-------------------|-------|
| B.1 Header | V2 | Con producto seleccionado |
| B.2 Titulo | V2 (desktop) / V3 (mobile) | Sin "Ahora" en mobile |
| B.3 Mensaje | V1 | Beneficios del financiamiento |
| B.5 Hero | V3 | Caricatura de Baldi |
| B.6 CTA | V3 | Card con Baldi + boton |

---

## 8. Notas Importantes

1. **Integracion con Wizard**: Esta vista se itera JUNTO con PROMPT_08 a PROMPT_13
2. **Mascota Baldi**: Usar caricatura consistente con branding
3. **Mobile-first**: Adaptar titulo (quitar "Ahora" redundante)
4. **Tiempo estimado**: Siempre visible y prominente
5. **Sin emojis**: Solo Lucide icons
