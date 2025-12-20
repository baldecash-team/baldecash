# Prompt: Vista de Solicitud - BaldeCash Web 4.0

## Informacion del Modulo

| Campo | Valor |
|-------|-------|
| **Segmento** | B (Solicitud) |
| **Preguntas totales** | 6 |
| **Versiones por componente** | 6 |
| **Prioridad** | Alta - MVP Core |
| **Integracion** | Se itera JUNTO con PROMPT_08 a PROMPT_13 (Wizard) |

---

## 1. Contexto

La vista de solicitud es la pantalla de introduccion antes del wizard. Debe motivar al usuario a completar el formulario, mostrando beneficios claros y transmitiendo confianza.

### Insights UX/UI
- **Primera impresion**: El usuario debe sentir que el proceso sera rapido y facil
- **Motivacion visual**: Mostrar lo que obtendra (laptop) genera engagement
- **Confianza**: Elementos que transmitan seguridad (logos, testimonios, tiempo estimado)
- **Identidad de marca**: Usar la caricatura de Baldi como elemento diferenciador

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.4/solicitud/
├── intro/
│   └── page.tsx                      # Vista de solicitud (antes del wizard)
├── components/
│   └── solicitud/
│       ├── SolicitudIntroContainer.tsx
│       ├── header/
│       │   └── SolicitudHeaderV[1-6].tsx
│       ├── hero/
│       │   └── SolicitudHeroV[1-6].tsx
│       ├── cta/
│       │   └── SolicitudCtaV[1-6].tsx
│       └── trust/
│           └── TrustBadgesV[1-6].tsx
├── types/
│   └── solicitud.ts
└── SOLICITUD_README.md
```

---

## 3. Preguntas del Segmento B - Vista de Solicitud

### B.1 [ITERAR - 6 versiones] - PREFERIDO: V2

**¿El header de solicitud debe mostrar el producto seleccionado o ser generico?**
- **V1**: Header generico "Solicita tu laptop" (clasico)
- **V2**: Header con producto seleccionado (thumbnail + nombre) **[PREFERIDO]**
- **V3**: Header con ilustracion flat del producto
- **V4**: Header con datos del producto destacados (fintech)
- **V5**: Split: producto izquierda + titulo derecha
- **V6**: Header minimalista solo texto grande

> **Decision:** V2 preferido - Mostrar el producto mantiene al usuario enfocado en su objetivo.

---

### B.2 [ITERAR - 6 versiones] - PREFERIDO: V2 (desktop) / V3 (mobile)

**¿Debe mostrarse un titulo de formulario con indicacion de tiempo?**
- **V1**: Solo titulo "Completa tu solicitud"
- **V2**: Titulo + "Ahora" + tiempo estimado "Solo 5 minutos"
- **V3**: Titulo + tiempo estimado (sin "Ahora") **[PREFERIDO MOBILE]**
- **V4**: Tiempo como badge flotante prominente (fintech)
- **V5**: Titulo grande + tiempo en subtitle
- **V6**: Solo tiempo gigante centrado

> **Decision:** V2 preferido en desktop. Para mobile usar V3 (el texto "Ahora" es redundante con el titulo).

---

### B.3 [ITERAR - 6 versiones] - PREFERIDO: V1

**¿Que tipo de mensaje motivacional usar?**
- **V1**: Beneficios del financiamiento (cuotas, sin inicial, rapido) **[PREFERIDO]**
- **V2**: Testimonios de estudiantes con fotos
- **V3**: Estadisticas ilustradas flat ("95% aprobados")
- **V4**: Numeros grandes destacados (fintech)
- **V5**: Lista de beneficios en panel lateral
- **V6**: Un solo beneficio gigante centrado

> **Decision:** V1 preferido - Los beneficios son mas tangibles para el usuario.

---

### B.4 [DEFINIDO]

**¿Debe mostrarse tiempo estimado para completar?**
→ Si, prominente: "Tiempo estimado: 5 minutos"

---

### B.5 [ITERAR - 6 versiones] - PREFERIDO: V3 (Baldi)

**¿Que imagen usar como hero visual?**
- **V1**: Foto de producto laptop
- **V2**: Foto lifestyle estudiante con laptop
- **V3**: Caricatura de Baldi (mascota BaldeCash) **[PREFERIDO]**
- **V4**: Ilustracion abstracta con shapes (fintech)
- **V5**: Split: Baldi izquierda + info derecha
- **V6**: Baldi grande centrado con animacion

> **Decision:** V3 preferido - Usar la caricatura de Baldi como imagen hero para mantener identidad de marca.

---

### B.6 [ITERAR - 6 versiones] - PREFERIDO: V3 (Card con Baldi)

**¿El CTA debe ir directo o con elementos de confianza?**
- **V1**: Boton directo "Empezar solicitud"
- **V2**: Boton + badges de seguridad
- **V3**: Card con ilustracion Baldi + boton + tiempo **[PREFERIDO]**
- **V4**: Boton prominente con glow (fintech)
- **V5**: CTA en panel lateral sticky
- **V6**: Boton gigante fullwidth

> **Decision:** V3 preferido - Card con caricatura de Baldi mantiene la identidad de marca y genera confianza.

---

## 4. Tipos TypeScript

```typescript
// types/solicitud.ts

export interface SolicitudIntroConfig {
  // B.1 - Header
  headerVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.2 - Titulo con tiempo
  titleVersion: 1 | 2 | 3 | 4 | 5 | 6;
  titleVersionMobile: 1 | 2 | 3 | 4 | 5 | 6;

  // B.3 - Mensaje motivacional
  messageVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.5 - Hero visual
  heroVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.6 - CTA
  ctaVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Producto seleccionado
  selectedProduct?: {
    id: string;
    name: string;
    thumbnail: string;
    monthlyQuota: number;
  };
}

export const defaultSolicitudConfig: SolicitudIntroConfig = {
  headerVersion: 2,       // Con producto seleccionado
  titleVersion: 2,        // Titulo + "Ahora" + tiempo
  titleVersionMobile: 3,  // Sin "Ahora" en mobile
  messageVersion: 1,      // Beneficios
  heroVersion: 3,         // Caricatura Baldi
  ctaVersion: 3,          // Card con Baldi
};

export interface TrustBadge {
  icon: string;
  text: string;
  subtext?: string;
}
```

---

## 5. Componente de Referencia - SolicitudHeroV3 (PREFERIDO)

```typescript
'use client';

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Clock, Shield, CheckCircle } from 'lucide-react';

/**
 * SolicitudHeroV3 - Con Caricatura de Baldi [PREFERIDO]
 *
 * Usa la mascota Baldi para mantener identidad de marca
 * y generar conexion emocional con el usuario
 */

export const SolicitudHeroV3: React.FC<{ config: SolicitudIntroConfig }> = ({ config }) => {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      {/* Caricatura de Baldi */}
      <div className="w-48 h-48 md:w-64 md:h-64 relative">
        <img
          src="/images/baldi-mascot.svg"
          alt="Baldi - Mascota BaldeCash"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>

      {/* Titulo */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-neutral-900">
        ¡Ya casi tienes tu laptop!
      </h1>

      {/* Tiempo estimado */}
      <div className="flex items-center gap-2 text-neutral-600 bg-neutral-100 px-4 py-2 rounded-full">
        <Clock className="w-5 h-5 text-[#4654CD]" />
        <span className="font-medium">Solo 5 minutos</span>
      </div>

      {/* Beneficios */}
      <div className="flex flex-wrap justify-center gap-4 text-sm max-w-md">
        <div className="flex items-center gap-2 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          <span className="text-neutral-700">Sin inicial</span>
        </div>
        <div className="flex items-center gap-2 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          <span className="text-neutral-700">Cuotas fijas</span>
        </div>
        <div className="flex items-center gap-2 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          <span className="text-neutral-700">Respuesta en 24h</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        color="primary"
        className="bg-[#4654CD] hover:bg-[#3A47B8] font-bold text-lg px-12 py-6 shadow-lg"
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

### Componentes Hero (6 versiones)
- [ ] `SolicitudHeroV1.tsx` - Foto producto
- [ ] `SolicitudHeroV2.tsx` - Foto lifestyle
- [ ] `SolicitudHeroV3.tsx` - Caricatura Baldi **[PREFERIDO]**
- [ ] `SolicitudHeroV4.tsx` - Shapes abstractos
- [ ] `SolicitudHeroV5.tsx` - Split layout
- [ ] `SolicitudHeroV6.tsx` - Baldi gigante centrado

### Componentes CTA (6 versiones)
- [ ] `SolicitudCtaV1.tsx` - Boton directo
- [ ] `SolicitudCtaV2.tsx` - Boton + badges
- [ ] `SolicitudCtaV3.tsx` - Card con Baldi **[PREFERIDO]**
- [ ] `SolicitudCtaV4.tsx` - Boton glow fintech
- [ ] `SolicitudCtaV5.tsx` - Panel lateral
- [ ] `SolicitudCtaV6.tsx` - Fullwidth

### Otros
- [ ] `SolicitudIntroContainer.tsx`
- [ ] `SolicitudSettingsModal.tsx`
- [ ] `types/solicitud.ts`
- [ ] Imagen/SVG de caricatura Baldi (requerido)
- [ ] `SOLICITUD_README.md`

---

## 7. Decisiones Finales

| Componente | Version | Notas |
|------------|---------|-------|
| B.1 Header | **V2** | Con producto seleccionado |
| B.2 Titulo | **V2** (desktop) / **V3** (mobile) | Sin "Ahora" en mobile |
| B.3 Mensaje | **V1** | Beneficios del financiamiento |
| B.5 Hero | **V3** | Caricatura de Baldi |
| B.6 CTA | **V3** | Card con Baldi + boton |

---

## 8. Asset Requerido: Caricatura Baldi

**Ubicacion:** `/public/images/baldi-mascot.svg`

**Especificaciones:**
- Formato: SVG (preferido) o PNG transparente
- Tamano minimo: 512x512px
- Estilo: Caricatura amigable, estilo flat o semi-flat
- Colores: Usar paleta de marca (#4654CD, #03DBD0)
- Variantes necesarias:
  - Baldi saludando (hero)
  - Baldi celebrando (confirmacion)
  - Baldi pensando (loading)

---

## 9. Notas Importantes

1. **Integracion con Wizard**: Esta vista se itera JUNTO con PROMPT_08 a PROMPT_13
2. **Mascota Baldi**: Usar caricatura consistente con branding en todas las versiones V3
3. **Mobile-first**: Adaptar titulo (quitar "Ahora" redundante)
4. **Tiempo estimado**: Siempre visible y prominente
5. **Sin emojis**: Solo Lucide icons
6. **Sin gradientes**: Colores solidos
