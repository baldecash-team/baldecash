# Prompt #11: Formulario - Datos Académicos - BaldeCash Web 4.0

## Información del Módulo

| Campo | Valor |
|-------|-------|
| **Segmento** | C.3 |
| **Preguntas totales** | 14 |
| **Iteraciones T (10 versiones)** | 0 |
| **Prioridad** | Alta - MVP Core |

---

## 1. Contexto

El paso de datos académicos captura información sobre la institución educativa, carrera y ciclo del estudiante. Incluye buscador de instituciones con convenios y upload de documentos de sustento.

---

## 2. Estructura de Archivos

```
src/app/prototipos/0.4/solicitud/
├── steps/
│   └── academico/
│       ├── AcademicDataStep.tsx
│       ├── components/
│       │   ├── InstitutionSearch.tsx
│       │   ├── CareerSelect.tsx
│       │   ├── CycleInput.tsx
│       │   ├── StudentCodeInput.tsx
│       │   ├── TuitionFields.tsx
│       │   ├── ScholarshipFields.tsx
│       │   └── AcademicDocUpload.tsx
└── ACADEMIC_README.md
```

---

## 3. Preguntas del Segmento C.3 (Todas DEFINIDO)

### 3.1 Búsqueda de Institución

#### C3.1 [DEFINIDO]
**¿El buscador debe mostrar sugerencias después de cuántos caracteres?**
→ Después de 2 caracteres

#### C3.2 [DEFINIDO]
**¿Las sugerencias deben mostrar logo de la institución?**
→ Sí, logo pequeño + nombre + tipo (Universidad/Instituto)

#### C3.3 [DEFINIDO]
**¿Qué mostrar si no hay resultados?**
→ "No encontramos tu institución. Verifica el nombre o contáctanos."

#### C3.4 [DEFINIDO]
**¿Instituciones con convenio deben destacarse?**
→ Sí, badge "Convenio" verde junto al nombre

---

### 3.2 Carrera y Ciclo

#### C3.5 [DEFINIDO]
**¿Carreras deben agruparse por facultad/área?**
→ Sí, agrupadas por facultad cuando la institución tenga muchas

#### C3.6 [DEFINIDO]
**¿El ciclo debe validarse contra duración de la carrera?**
→ Sí, máximo según la carrera seleccionada

#### C3.7 [DEFINIDO]
**¿Debe explicarse qué es 'Ciclo'?**
→ Tooltip: "También conocido como semestre o período"

---

### 3.3 Código de Alumno

#### C3.8 [DEFINIDO]
**¿Debe mostrarse dónde encontrar el código de alumno?**
→ Sí, imagen de ejemplo por institución

#### C3.9 [DEFINIDO]
**¿Si no tiene código a mano, puede continuar después?**
→ Marcarlo como opcional con nota: "Puedes agregarlo después"

---

### 3.4 Pensión y Becas

#### C3.10 [DEFINIDO]
**¿El campo de pensión debe tener rangos o monto exacto?**
→ Rangos predefinidos: "Hasta S/500", "S/500-S/1000", etc.

#### C3.11 [DEFINIDO]
**¿Si es becado, los campos adicionales deben aparecer?**
→ Sí, campos condicionales para tipo de beca y patrocinador

---

### 3.5 Sustento de Estudios

#### C3.12 [DEFINIDO]
**¿Debe haber ejemplos visuales de documentos aceptados?**
→ Sí, galería con ejemplos de boleta, constancia, ficha

#### C3.13 [DEFINIDO]
**¿Debe indicarse el tamaño máximo de archivo?**
→ Sí, prominente: "Máximo 5MB, formatos PDF, JPG, PNG"

#### C3.14 [DEFINIDO]
**¿Si el archivo es rechazado, cómo comunicarlo?**
→ Mensaje amigable: "El archivo es muy grande. Intenta comprimirlo o tomar una foto más pequeña."

---

## 4. Campos del Paso

```typescript
export const academicDataFields: FieldConfig[] = [
  {
    id: 'institucion',
    name: 'institucion',
    type: 'select',
    label: 'Institución educativa',
    placeholder: 'Busca tu universidad o instituto...',
    required: true,
    helpText: 'Escribe al menos 2 letras para buscar',
  },
  {
    id: 'tieneConvenio',
    name: 'tieneConvenio',
    type: 'hidden',
    // Se llena automáticamente según institución
  },
  {
    id: 'carrera',
    name: 'carrera',
    type: 'select',
    label: 'Carrera o programa',
    placeholder: 'Selecciona tu carrera',
    required: true,
    dependsOn: 'institucion',
  },
  {
    id: 'ciclo',
    name: 'ciclo',
    type: 'number',
    label: 'Ciclo actual',
    placeholder: 'Ej: 5',
    required: true,
    helpText: 'También conocido como semestre o período',
    validation: [
      { type: 'min', value: 1, message: 'El ciclo debe ser al menos 1' },
      { type: 'max', value: 12, message: 'El ciclo no puede ser mayor a 12' },
    ],
  },
  {
    id: 'codigoAlumno',
    name: 'codigoAlumno',
    type: 'text',
    label: 'Código de alumno',
    placeholder: 'Ej: U202012345',
    required: false,
    helpText: 'Opcional - puedes agregarlo después',
  },
  {
    id: 'tipoPension',
    name: 'tipoPension',
    type: 'select',
    label: 'Rango de pensión mensual',
    required: true,
    options: [
      { value: 'hasta500', label: 'Hasta S/500' },
      { value: '500-1000', label: 'S/500 - S/1,000' },
      { value: '1000-1500', label: 'S/1,000 - S/1,500' },
      { value: '1500-2000', label: 'S/1,500 - S/2,000' },
      { value: 'mas2000', label: 'Más de S/2,000' },
      { value: 'becado', label: 'Soy becado' },
      { value: 'publica', label: 'Universidad pública (gratuita)' },
    ],
  },
  {
    id: 'tipoBeca',
    name: 'tipoBeca',
    type: 'select',
    label: 'Tipo de beca',
    dependsOn: 'tipoPension',
    dependsOnValue: 'becado',
    options: [
      { value: 'pronabec', label: 'PRONABEC / Beca 18' },
      { value: 'institucional', label: 'Beca institucional' },
      { value: 'externa', label: 'Beca externa / patrocinador' },
    ],
  },
  {
    id: 'documentoEstudios',
    name: 'documentoEstudios',
    type: 'file',
    label: 'Documento de sustento de estudios',
    required: true,
    helpText: 'Boleta de matrícula, constancia o ficha de matrícula',
    validation: [
      { type: 'fileSize', value: 5 * 1024 * 1024, message: 'El archivo no debe superar 5MB' },
      { type: 'fileType', value: ['pdf', 'jpg', 'jpeg', 'png'], message: 'Formatos aceptados: PDF, JPG, PNG' },
    ],
  },
];
```

---

## 5. Componente de Referencia

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Input, Listbox, ListboxItem, Chip } from '@nextui-org/react';
import { Search, GraduationCap, Building, Award } from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: 'universidad' | 'instituto';
  logo?: string;
  hasAgreement: boolean;
}

export const InstitutionSearch: React.FC<{
  value: string;
  onChange: (institution: Institution) => void;
}> = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Institution[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      searchInstitutions(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchInstitutions = async (q: string) => {
    setIsSearching(true);
    // Simular búsqueda
    await new Promise(r => setTimeout(r, 300));

    const mockResults: Institution[] = [
      { id: '1', name: 'Universidad Privada del Norte', shortName: 'UPN', type: 'universidad', hasAgreement: true },
      { id: '2', name: 'Universidad Peruana de Ciencias Aplicadas', shortName: 'UPC', type: 'universidad', hasAgreement: true },
      { id: '3', name: 'Instituto SENATI', shortName: 'SENATI', type: 'instituto', hasAgreement: true },
    ].filter(i => i.name.toLowerCase().includes(q.toLowerCase()));

    setResults(mockResults);
    setIsSearching(false);
  };

  return (
    <div className="space-y-2">
      <Input
        label="Institución educativa"
        placeholder="Busca tu universidad o instituto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        startContent={<Search className="w-4 h-4 text-neutral-400" />}
      />

      {results.length > 0 && (
        <Listbox
          aria-label="Resultados de búsqueda"
          className="border rounded-lg max-h-60 overflow-auto"
        >
          {results.map((inst) => (
            <ListboxItem
              key={inst.id}
              onClick={() => onChange(inst)}
              className="cursor-pointer"
              startContent={
                inst.logo ? (
                  <img src={inst.logo} className="w-8 h-8 object-contain" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-neutral-400" />
                )
              }
              endContent={
                inst.hasAgreement && (
                  <Chip size="sm" color="success" variant="flat">Convenio</Chip>
                )
              }
            >
              <div>
                <p className="font-medium">{inst.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{inst.type}</p>
              </div>
            </ListboxItem>
          ))}
        </Listbox>
      )}

      {query.length >= 2 && results.length === 0 && !isSearching && (
        <p className="text-sm text-neutral-500">
          No encontramos tu institución. Verifica el nombre o contáctanos.
        </p>
      )}
    </div>
  );
};
```

---

## 6. Checklist de Entregables

- [ ] `AcademicDataStep.tsx`
- [ ] `InstitutionSearch.tsx` con destacado de convenios
- [ ] `CareerSelect.tsx` con agrupación por facultad
- [ ] `CycleInput.tsx` con validación
- [ ] `StudentCodeInput.tsx` con ejemplos visuales
- [ ] `TuitionFields.tsx` con rangos
- [ ] `ScholarshipFields.tsx` condicionales
- [ ] `AcademicDocUpload.tsx` con ejemplos
- [ ] Mock data de instituciones
- [ ] `ACADEMIC_README.md`

---

## 7. Notas Importantes

1. **Convenios**: Destacar instituciones aliadas con badge
2. **Buscador**: Mínimo 2 caracteres, mostrar logo
3. **Documentos**: Ejemplos visuales de cada tipo
4. **Opcional**: Código de alumno puede completarse después
5. **Sin emojis**: Solo Lucide icons
6. **Sin gradientes**: Colores sólidos
7. **cursor-pointer**: En elementos clickeables
