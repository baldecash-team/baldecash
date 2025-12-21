# Aprendizajes Específicos - Comparador v0.4

> Lecciones aprendidas específicas del módulo de Comparador.
> Para reglas globales, ver `../CONVENTIONS.md`

---

## 1. Settings Modal: RadioGroup, No Select

### Problema
El `ComparatorSettingsModal` se creó inicialmente usando `Select` dropdowns, pero el patrón establecido en v0.4 usa `RadioGroup` con `Radio`.

### Patrón Incorrecto (Select)
```tsx
// ❌ Incorrecto: Select dropdown
<Select
  selectedKeys={new Set([value.toString()])}
  onSelectionChange={(keys) => onChange(parseInt(keys[0]))}
>
  {options.map((opt) => (
    <SelectItem key={opt.value}>{opt.label}</SelectItem>
  ))}
</Select>
```

### Patrón Correcto (RadioGroup)
```tsx
// ✅ Correcto: RadioGroup con Radio
<RadioGroup
  value={config.layoutVersion.toString()}
  onValueChange={(val) => updateConfig('layoutVersion', parseInt(val))}
  classNames={{ wrapper: 'gap-2' }}
>
  {[1, 2, 3, 4, 5, 6].map((version) => (
    <Radio
      key={version}
      value={version.toString()}
      classNames={{
        base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
          ${config.layoutVersion === version
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : 'border-neutral-200 hover:border-[#4654CD]/50'
          }`,
        wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
        labelWrapper: 'ml-2',
        label: 'text-sm',
        description: 'text-xs text-neutral-500',
      }}
      description={versionLabels[version].description}
    >
      V{version} - {versionLabels[version].name}
    </Radio>
  ))}
</RadioGroup>
```

### Por Qué RadioGroup es Mejor
1. **Visibilidad**: Todas las opciones visibles sin click extra
2. **Descripción**: Cada opción muestra su descripción inline
3. **Feedback visual**: Selección destacada con borde y fondo
4. **Consistencia**: Mismo patrón en todos los módulos v0.4

---

## 2. Códigos Internos No Van en UI

### Problema
Se incluyeron códigos de referencia interna (B.90, B.91, etc.) en los títulos visibles del modal.

### Incorrecto
```tsx
// ❌ Códigos visibles al usuario
<h3>Layout del Comparador (B.95)</h3>
<h3>Acceso al Comparador (B.90)</h3>
```

### Correcto
```tsx
// ✅ Sin códigos - solo en comentarios
{/* Layout Version (B.95) */}
<h3>Layout del Comparador</h3>

{/* Access Version (B.90) */}
<h3>Acceso al Comparador</h3>
```

### Regla
- **Códigos B.XX, PROMPT_XX**: Solo en comentarios de código y documentación
- **UI visible**: Títulos limpios y descriptivos

---

## 3. Revisar Módulos Hermanos Antes de Crear

### Problema
Se creó el `ComparatorSettingsModal` sin revisar primero el `CatalogSettingsModal`, resultando en inconsistencia de patrones.

### Checklist Antes de Crear un Módulo Nuevo

```markdown
- [ ] Revisar módulo hermano más reciente (ej: catálogo → comparador)
- [ ] Identificar patrones de UI establecidos:
  - Settings Modal structure
  - Floating controls
  - Config badge format
  - Keyboard shortcuts
- [ ] Copiar estructura base del módulo hermano
- [ ] Adaptar contenido específico del nuevo módulo
```

### Módulos Hermanos en v0.4
| Módulo | Settings Modal | Referencia |
|--------|---------------|------------|
| Catálogo | RadioGroup pattern | `CatalogSettingsModal.tsx` |
| Comparador | RadioGroup pattern | `ComparatorSettingsModal.tsx` |
| Detalle | RadioGroup pattern | `DetailSettingsModal.tsx` |
| Quiz | RadioGroup pattern | `QuizSettingsModal.tsx` |

---

## 4. Estructura del Comparador

### Configuración (8 opciones A/B)

| Config | Nombre | Opciones |
|--------|--------|----------|
| layoutVersion | Layout del Comparador | Modal, Page, Sticky, Fluido, Split, Fullscreen |
| accessVersion | Acceso al Comparador | Checkbox, FAB, Tray, Header, Inline, Modal |
| maxProductsVersion | Cantidad de Productos | 2, 3, 4, 5, 6, Ilimitado |
| fieldsVersion | Campos de Comparación | Técnico, Beneficios, Mixto, Fintech, Resumido, Completo |
| highlightVersion | Visualización Mejor/Peor | Verde/Rojo, Solo mejor, Badges, Gradiente, Iconos, Ninguno |
| priceDiffVersion | Diferencia de Precio | Texto, Porcentaje, Barra, Mínimo, Ahorro, Oculto |
| differenceHighlightVersion | Resaltado Diferencias | Amarillo, Toggle, Pulsing, Glow, Columna, Solo diferencias |
| selectionVersion | Punto de Selección | Checkbox, Pills, Chips, Modal, Inline, Drag |

### Componentes Principales

```
comparador/
├── components/comparator/
│   ├── layout/
│   │   ├── ComparatorLayoutV1.tsx  # Modal Fullscreen
│   │   ├── ComparatorLayoutV2.tsx  # Página dedicada
│   │   ├── ComparatorLayoutV3.tsx  # Panel sticky
│   │   ├── ComparatorLayoutV4.tsx  # Modal fluido fintech
│   │   ├── ComparatorLayoutV5.tsx  # Split 50/50
│   │   └── ComparatorLayoutV6.tsx  # Fullscreen inmersivo
│   ├── table/
│   │   └── ComparisonTableV1-V6.tsx
│   ├── highlights/
│   │   └── DifferenceHighlightV1.tsx  # Contiene V1-V6
│   ├── selection/
│   │   └── ProductSelectorV1.tsx
│   ├── actions/
│   │   └── CompareActions.tsx  # Bar, FAB, Tray
│   ├── ProductComparator.tsx  # Wrapper principal
│   └── ComparatorSettingsModal.tsx
├── types/comparator.ts
├── data/mockComparatorData.ts
├── page.tsx  # Redirect
└── comparator-preview/page.tsx
```

---

## 5. Comparador: Cuota, No Precio

### Contexto BaldeCash
El comparador sigue la regla global: **mostrar cuota mensual, no precio total**.

```typescript
// ✅ Correcto: Cuota mensual
<span className="text-2xl font-bold text-[#4654CD]">
  S/{product.monthlyQuota}/mes
</span>

// ❌ Incorrecto: Precio total
<span>S/{product.price}</span>
```

### Diferencia de Precio entre Productos

```typescript
// Mostrar diferencia de cuota, no de precio
const quotaDiff = productA.monthlyQuota - productB.monthlyQuota;

// V1: Texto simple
<span className="text-green-600">+S/{quotaDiff}/mes</span>

// V2: Porcentaje
<span className="text-green-600">+{percentDiff}%</span>
```

---

## 6. Keyboard Shortcuts del Comparador

### Implementados
| Tecla | Acción |
|-------|--------|
| `S` | Abrir Settings Modal |
| `C` | Abrir Comparador (si hay 2+ productos) |
| `Escape` | Cerrar modales |

### Código de Referencia
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

    switch (e.key) {
      case 's':
      case 'S':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsSettingsOpen(true);
        }
        break;
      case 'Escape':
        setIsSettingsOpen(false);
        setIsComparatorOpen(false);
        break;
      case 'c':
      case 'C':
        if (!e.ctrlKey && !e.metaKey && selectedProducts.length >= 2) {
          setIsComparatorOpen(true);
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedProducts.length]);
```

---

## 7. Próximos Pasos Sugeridos

### Para el Comparador
- [ ] Implementar persistencia de comparación (localStorage)
- [ ] Agregar export a PDF de comparación
- [ ] Integrar comparador desde catálogo (checkbox en ProductCard)
- [ ] Animaciones de entrada/salida con framer-motion

### Métricas a Implementar
- Productos más comparados
- Combinaciones frecuentes
- Tiempo promedio en comparador
- Conversión: comparador → solicitud

---

## 8. Referencias

- **Spec**: `.claude/docs/0.4/section-specs/PROMPT_05_COMPARADOR.md`
- **Código**: `src/app/prototipos/0.4/comparador/`
- **Preview**: `http://localhost:3000/prototipos/0.4/comparador`

---

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-21 | Versión inicial |
