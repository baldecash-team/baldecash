# Prompt #10: Formulario - Datos Personales - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.2 |
| **Preguntas totales** | 13 |
| **Versiones por componente** | 6 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El paso de datos personales es el primero del wizard. Incluye autocompletado con DNI vía RENIEC y captura de información de contacto.

---

## 2. Estructura de Archivos (6 versiones)

```
src/app/prototipos/0.4/solicitud/
├── steps/
│   └── personal/
│       ├── PersonalDataStep.tsx
│       ├── components/
│       │   ├── DniInput.tsx
│       │   ├── autocomplete/
│       │   │   └── DniAutocompleteFeedbackV[1-6].tsx
│       │   ├── animation/
│       │   │   └── DataRevealAnimationV[1-6].tsx
│       │   ├── ContactFields.tsx
│       │   ├── address/
│       │   │   ├── AddressFields.tsx
│       │   │   └── MapConfirmationV[1-6].tsx
│       │   ├── fallback/
│       │   │   └── AddressFallbackV[1-6].tsx
│       │   ├── terms/
│       │   │   └── TermsModalV[1-6].tsx
│       │   └── GooglePlacesInput.tsx
└── PERSONAL_README.md
```

---

## 3. Preguntas del Segmento C.2

### 3.1 DNI y Autocompletado (4 preguntas)

#### C2.1 [ITERAR - 6 versiones]
**¿Cómo animar que se están buscando los datos?**
- **V1**: Skeleton en campos mientras carga, estilo e-commerce tradicional
- **V2**: Spinner circular elegante con mensaje "Buscando tus datos..." (lifestyle)
- **V3**: Ilustración flat animada de un personaje buscando documentos
- **V4**: Progress bar horizontal con pasos "Conectando → Buscando → Verificando" (fintech)
- **V5**: Split: skeleton izquierda + mensaje de estado derecha
- **V6**: Loader grande centrado con animación de pulso (impacto)

#### C2.2 [ITERAR - 6 versiones]
**¿Los datos autocompletados deben aparecer de golpe o animarse?**
- **V1**: Fade in todos los campos juntos, transición suave (producto)
- **V2**: Cascada uno por uno con delay, efecto de revelación (lifestyle)
- **V3**: Aparición con efecto de "máquina de escribir" en texto (flat)
- **V4**: Morphing desde skeleton a datos con transición fluida (fintech)
- **V5**: Split reveal: datos izquierda aparecen, confirmación derecha
- **V6**: Aparición instantánea con "flash" de confirmación (impacto)

#### C2.3 [DEFINIDO]
**¿El usuario puede editar datos autocompletados?**
→ No, son de solo lectura (vienen de RENIEC)

#### C2.4 [DEFINIDO]
**¿Debe mostrarse de dónde vienen los datos?**
→ Sí, texto sutil "Datos obtenidos de RENIEC"

---

### 3.2 Datos de Contacto (3 preguntas)

#### C2.5 [DEFINIDO]
**¿El campo de celular debe validar que empiece con 9?**
→ Sí, validar formato peruano

#### C2.6 [DEFINIDO]
**¿Debe pedirse confirmación del email?**
→ No para MVP (reduce fricción)

#### C2.7 [DEFINIDO]
**¿El WhatsApp debe asumirse igual al celular?**
→ Sí, con checkbox "Mi WhatsApp es otro número"

---

### 3.3 Ubicación (3 preguntas)

#### C2.8 [ITERAR - 6 versiones]
**¿La dirección con Google Places debe mostrar mapa de confirmación?**
- **V1**: Mapa pequeño (200px) debajo del campo con pin (e-commerce)
- **V2**: Mapa en card con foto satelital y contexto (lifestyle)
- **V3**: Mapa estilizado con ilustración flat del pin
- **V4**: Mapa con animación de zoom-in al confirmar (fintech)
- **V5**: Split: mapa izquierda + detalles de dirección derecha
- **V6**: Mapa grande como confirmación prominente (impacto)

#### C2.9 [ITERAR - 6 versiones]
**¿Si Google Places no encuentra la dirección, cómo guiar?**
- **V1**: Cambiar a campos manuales automáticamente (e-commerce)
- **V2**: Botón elegante "Ingresar dirección manualmente" (lifestyle)
- **V3**: Modal con ilustración flat explicando opciones
- **V4**: Transición animada a modo manual con guía (fintech)
- **V5**: Split: sugerencias similares izquierda + manual derecha
- **V6**: CTA grande "No encuentras tu dirección? Ingresa aquí" (impacto)

#### C2.10 [DEFINIDO]
**¿Los campos de Departamento/Provincia/Distrito deben ser 3 selects o cascada?**
→ 3 selects dependientes (cascada)

---

### 3.4 Términos (3 preguntas)

#### C2.11 [DEFINIDO]
**¿El texto de T&C debe estar visible completo o como link?**
→ Link a documento

#### C2.12 [DEFINIDO]
**¿Debe haber checkbox separado para T&C y Política de Privacidad?**
→ Un solo checkbox que cubra ambos

#### C2.13 [ITERAR - 6 versiones]
**¿El enlace a T&C debe abrir en modal o nueva pestaña?**
- **V1**: Modal overlay centrado con scroll interno (e-commerce)
- **V2**: Modal elegante con diseño de documento legal (lifestyle)
- **V3**: Modal con ilustraciones flat de puntos clave
- **V4**: Drawer lateral con animación de entrada (fintech)
- **V5**: Split screen: términos izquierda + resumen derecha
- **V6**: Modal fullscreen con tipografía legible (impacto)

---

## 4. Tipos TypeScript

```typescript
// types/personal.ts

export interface PersonalDataConfig {
  // C2.1 - Animación de búsqueda
  searchAnimationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C2.2 - Animación de datos
  dataRevealVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C2.8 - Mapa de confirmación
  mapConfirmationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C2.9 - Fallback de dirección
  addressFallbackVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // C2.13 - Modal de términos
  termsModalVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultPersonalDataConfig: PersonalDataConfig = {
  searchAnimationVersion: 1,
  dataRevealVersion: 2,
  mapConfirmationVersion: 1,
  addressFallbackVersion: 2,
  termsModalVersion: 1,
};

export interface ReniecData {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion?: string;
}
```

---

## 5. Campos del Paso

```typescript
export const personalDataFields: FieldConfig[] = [
  {
    id: 'dni',
    name: 'dni',
    type: 'text',
    label: 'DNI',
    placeholder: 'Ej: 12345678',
    required: true,
    validation: [
      { type: 'required', message: 'Ingresa tu DNI' },
      { type: 'pattern', value: /^\d{8}$/, message: 'El DNI debe tener 8 dígitos' },
    ],
    mask: '########',
  },
  {
    id: 'nombres',
    name: 'nombres',
    type: 'text',
    label: 'Nombres',
    required: true,
    autoComplete: 'given-name',
    // Autocompletado por RENIEC
  },
  {
    id: 'apellidos',
    name: 'apellidos',
    type: 'text',
    label: 'Apellidos',
    required: true,
    autoComplete: 'family-name',
    // Autocompletado por RENIEC
  },
  {
    id: 'fechaNacimiento',
    name: 'fechaNacimiento',
    type: 'date',
    label: 'Fecha de nacimiento',
    required: true,
    // Autocompletado por RENIEC
  },
  {
    id: 'celular',
    name: 'celular',
    type: 'tel',
    label: 'Celular',
    placeholder: 'Ej: 999 999 999',
    required: true,
    validation: [
      { type: 'required', message: 'Ingresa tu número de celular' },
      { type: 'pattern', value: /^9\d{8}$/, message: 'Ingresa un número válido que empiece con 9' },
    ],
    mask: '### ### ###',
  },
  {
    id: 'email',
    name: 'email',
    type: 'email',
    label: 'Correo electrónico',
    placeholder: 'Ej: tucorreo@email.com',
    required: true,
    validation: [
      { type: 'required', message: 'Ingresa tu correo' },
      { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingresa un correo válido' },
    ],
  },
  {
    id: 'direccion',
    name: 'direccion',
    type: 'text',
    label: 'Dirección de entrega',
    placeholder: 'Busca tu dirección...',
    required: true,
    helpText: 'Usaremos Google Maps para encontrar tu dirección exacta',
  },
  {
    id: 'aceptaTerminos',
    name: 'aceptaTerminos',
    type: 'checkbox',
    label: 'Acepto los Términos y Condiciones y la Política de Privacidad',
    required: true,
  },
];
```

---

## 6. Componente de Referencia

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Input, Spinner, Chip } from '@nextui-org/react';
import { Search, Check, AlertCircle } from 'lucide-react';

interface DniInputProps {
  value: string;
  onChange: (value: string) => void;
  onDataFetched: (data: ReniecData) => void;
}

export const DniInput: React.FC<DniInputProps> = ({ value, onChange, onDataFetched }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [dataFound, setDataFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value.length === 8) {
      searchDni(value);
    }
  }, [value]);

  const searchDni = async (dni: string) => {
    setIsSearching(true);
    setError(null);

    try {
      // Simular llamada a API RENIEC
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockData = {
        nombres: 'MARÍA ELENA',
        apellidos: 'GARCÍA RODRÍGUEZ',
        fechaNacimiento: '1998-05-15',
      };

      onDataFetched(mockData);
      setDataFound(true);
    } catch (err) {
      setError('No pudimos encontrar tus datos. Verifica tu DNI.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        label="DNI"
        placeholder="Ej: 12345678"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
        maxLength={8}
        endContent={
          isSearching ? (
            <Spinner size="sm" color="primary" />
          ) : dataFound ? (
            <Check className="w-5 h-5 text-[#22c55e]" />
          ) : null
        }
        isInvalid={!!error}
        errorMessage={error}
      />

      {dataFound && (
        <Chip size="sm" variant="flat" color="success" startContent={<Check className="w-3 h-3" />}>
          Datos obtenidos de RENIEC
        </Chip>
      )}
    </div>
  );
};
```

---

## 7. Checklist de Entregables

### Tipos y Configuración
- [ ] `types/personal.ts` - PersonalDataConfig con 5 selectores (1-6)
- [ ] `PersonalDataSettingsModal.tsx` - Modal con 5 selectores

### Paso Principal
- [ ] `PersonalDataStep.tsx`

### DNI y Autocompletado (6 versiones cada uno)
- [ ] `DniInput.tsx` con búsqueda RENIEC
- [ ] `DniAutocompleteFeedbackV1.tsx` a `V6.tsx`
- [ ] `DataRevealAnimationV1.tsx` a `V6.tsx`

### Contacto
- [ ] `ContactFields.tsx`

### Dirección (6 versiones cada uno)
- [ ] `AddressFields.tsx` con Google Places
- [ ] `MapConfirmationV1.tsx` a `V6.tsx`
- [ ] `AddressFallbackV1.tsx` a `V6.tsx`
- [ ] `GooglePlacesInput.tsx`
- [ ] Selects cascada Departamento/Provincia/Distrito

### Términos (6 versiones)
- [ ] `TermsModalV1.tsx` a `V6.tsx`

### Documentación
- [ ] `PERSONAL_README.md`

---

## 8. Notas Importantes

1. **RENIEC**: Autocompletar nombres y fecha con DNI
2. **Celular peruano**: Validar formato 9XXXXXXXX
3. **Google Places**: Fallback a campos manuales
4. **T&C**: Modal para no salir del flujo
5. **Sin emojis**: Solo Lucide icons
6. **Sin gradientes**: Colores sólidos
7. **cursor-pointer**: En todos los elementos clickeables
