# 404 / Not Found v0.6 - Documentación Técnica

## Descripción

Página de error 404 con diseño limpio, animaciones y branding BaldeCash. Se muestra cuando se accede a rutas que no existen o cuando una landing no está disponible.

---

## Estructura de Archivos

```
prototipos/0.6/
├── [[...slug]]/
│   └── not-found.tsx         # 404 para landing inválido
│
├── [landing]/
│   └── not-found.tsx         # 404 para rutas dentro de landing
│
└── components/
    └── NotFoundContent.tsx   # Componente reutilizable
```

---

## NotFoundContent

**Archivo:** `components/NotFoundContent.tsx`

Componente principal de la página 404.

```typescript
interface NotFoundContentProps {
  /** URL personalizada para el botón "Ir al inicio" */
  homeUrl?: string;  // Default: '/prototipos/0.6/home'
}

export const NotFoundContent: React.FC<NotFoundContentProps> = ({
  homeUrl = '/prototipos/0.6/home'
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white flex flex-col">
      {/* Background decorative elements */}
      {/* Main content */}
      {/* Action buttons */}
    </div>
  );
};
```

---

## Características

### Diseño

- Sin navbar ni footer (diseño limpio)
- Fondo con gradiente sutil
- Número 404 grande y animado
- Ícono de búsqueda central con pulse
- Botones de acción
- Elementos decorativos flotantes

### Colores Dinámicos

Usa CSS variables para adaptarse a la landing:

```typescript
style={{
  color: 'var(--color-primary, #4654CD)',
  backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)',
}}
```

### Animaciones

Implementadas con Framer Motion:

```typescript
// Float animation para el 404
const floatAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Pulse para el ícono central
const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};

// Stagger para elementos del contenido
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Entrada de elementos
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Entrada del número 404
const numberVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.175, 0.885, 0.32, 1.275], // Back ease
    },
  },
};
```

### Background Animado

```typescript
{/* Blob primario */}
<motion.div
  className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
  animate={{
    x: [0, 30, 0],
    y: [0, -20, 0],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>

{/* Blob secundario */}
<motion.div
  className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
  style={{ backgroundColor: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)' }}
  animate={{
    x: [0, -40, 0],
    y: [0, 30, 0],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
  }}
/>
```

---

## Estructura Visual

```
┌─────────────────────────────────────────┐
│                                         │
│           (blob animado)                │
│                                         │
│         ┌─────────────────┐             │
│         │    4  🔍  4     │  (flotante) │
│         └─────────────────┘             │
│                                         │
│        "Página no disponible"           │
│                                         │
│   "La página que buscas no existe       │
│    o ya no está activa."                │
│                                         │
│   [🏠 Ir al inicio] [← Volver atrás]   │
│                                         │
│         ─────────────────               │
│                                         │
│        ¿El problema persiste?           │
│        [🔄 Recargar página]             │
│                                         │
│           (blob animado)                │
│                                         │
└─────────────────────────────────────────┘
```

---

## Botones de Acción

### Ir al inicio

```typescript
<Button
  size="lg"
  className="text-white font-semibold px-8"
  style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
  startContent={<Home className="w-5 h-5" />}
  onPress={() => router.push(homeUrl)}
>
  Ir al inicio
</Button>
```

### Volver atrás

```typescript
<Button
  size="lg"
  variant="bordered"
  className="font-semibold px-8"
  style={{
    borderColor: 'var(--color-primary, #4654CD)',
    color: 'var(--color-primary, #4654CD)',
  }}
  startContent={<ArrowLeft className="w-5 h-5" />}
  onPress={() => router.back()}
>
  Volver atrás
</Button>
```

### Recargar página

```typescript
<Button
  size="sm"
  variant="light"
  className="text-neutral-500"
  startContent={<RefreshCw className="w-4 h-4" />}
  onPress={() => window.location.reload()}
>
  Recargar página
</Button>
```

---

## Uso

### En not-found.tsx

```typescript
// [[...slug]]/not-found.tsx
import { NotFoundContent } from '../components/NotFoundContent';

export default function NotFound() {
  return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
}
```

```typescript
// [landing]/not-found.tsx
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';

export default function NotFound() {
  return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
}
```

### Como fallback cuando API devuelve error

```typescript
// En cualquier página que use useLayout()
function PageContent() {
  const { navbarProps, hasError } = useLayout();

  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return <ActualContent />;
}
```

### Con URL personalizada

```typescript
// Para una landing específica
<NotFoundContent homeUrl="/prototipos/0.6/laptops-estudiantes" />

// Para la raíz de prototipos
<NotFoundContent homeUrl="/prototipos/0.6" />
```

---

## Cuándo se Muestra

1. **Ruta inexistente:** `/prototipos/0.6/ruta-que-no-existe`

2. **Landing no encontrada:** API devuelve 404 para el slug

3. **Landing pausada/archivada:** API devuelve error

4. **Subruta inválida:** `/prototipos/0.6/home/algo/invalido`

5. **Error de carga:** Cuando `useLayout()` falla

---

## Dependencias

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
```

---

## Cómo Extender

### Agregar Link de Soporte

```typescript
<motion.div className="mt-10 pt-8 border-t">
  <p className="text-sm text-neutral-400 mb-4">
    ¿Necesitas ayuda?
  </p>
  <div className="flex gap-3 justify-center">
    <Button
      size="sm"
      variant="light"
      startContent={<RefreshCw className="w-4 h-4" />}
      onPress={() => window.location.reload()}
    >
      Recargar
    </Button>
    <Button
      size="sm"
      variant="light"
      as="a"
      href="mailto:soporte@baldecash.com"
      startContent={<Mail className="w-4 h-4" />}
    >
      Contactar soporte
    </Button>
  </div>
</motion.div>
```

### Agregar Búsqueda

```typescript
<motion.div variants={itemVariants} className="mt-6">
  <p className="text-sm text-neutral-500 mb-2">
    ¿Buscabas algo específico?
  </p>
  <div className="flex gap-2 max-w-xs mx-auto">
    <Input
      placeholder="Buscar..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <Button onPress={() => router.push(`/catalogo?search=${searchQuery}`)}>
      Buscar
    </Button>
  </div>
</motion.div>
```

### Personalizar por Tipo de Error

```typescript
interface NotFoundContentProps {
  homeUrl?: string;
  errorType?: 'not_found' | 'paused' | 'archived' | 'error';
}

const errorMessages = {
  not_found: {
    title: 'Página no disponible',
    description: 'La página que buscas no existe o ya no está activa.',
  },
  paused: {
    title: 'Landing en pausa',
    description: 'Esta landing está temporalmente deshabilitada.',
  },
  archived: {
    title: 'Landing archivada',
    description: 'Esta landing ya no está disponible.',
  },
  error: {
    title: 'Error de carga',
    description: 'Hubo un problema al cargar la página. Intenta de nuevo.',
  },
};
```
