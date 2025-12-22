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

### Configuración (7 opciones A/B)

| Config | Nombre | Opciones |
|--------|--------|----------|
| layoutVersion | Layout del Comparador | Modal, Page, Sticky, Fluido, Split, Fullscreen |
| accessVersion | Acceso al Comparador | Checkbox, FAB, Tray, Header, Inline, Modal |
| maxProductsVersion | Cantidad de Productos | 2, 3, 4, 5, 6, Ilimitado |
| fieldsVersion | Campos de Comparación | Técnico, Beneficios, Mixto, Fintech, Resumido, Completo |
| highlightVersion | Visualización Mejor/Peor | Verde/Rojo, Solo mejor, Badges, Gradiente, Iconos, Ninguno |
| priceDiffVersion | Diferencia de Precio | Texto, Porcentaje, Barra, Mínimo, Ahorro, Oculto |
| differenceHighlightVersion | Resaltado Diferencias | Punto Amarillo, Etiqueta "Diferente", Badge "≠", Fondo Gradiente, Subrayado Animado, Icono Comparación |

> **Nota**: `selectionVersion` fue eliminado por no aportar valor significativo al testing A/B.

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

## 7. Consistencia de Verbos en Español

### Regla
Usar **"añadir"** en lugar de **"agregar"** en toda la UI del comparador.

### Incorrecto
```tsx
// ❌ "Agregar" - no usar
<span>+ Agregar</span>
<h3>Agrega otro equipo</h3>
```

### Correcto
```tsx
// ✅ "Añadir" - siempre
<span>+ Añadir</span>
<h3>Añade otro equipo</h3>
```

### Archivos Corregidos
- `CompareActions.tsx`: "Agregar" → "Añadir"
- `ComparatorLayoutV3.tsx`: "Agrega" → "Añade"

---

## 8. Patrón A/B: Implementación Real

> **Ver también**: CONVENTIONS.md sección 10 para el patrón completo.

### Resumen
Cada versión de configuración A/B debe tener implementación real, no solo estado almacenado.

```typescript
// ❌ Incorrecto: Solo almacena versión sin uso
const config = { fieldsVersion: 3 };
// ...código que no usa fieldsVersion

// ✅ Correcto: Versión tiene efecto real
const getFieldsForVersion = () => {
  switch (config.fieldsVersion) {
    case 1: return ['processor', 'ram', 'storage'];
    case 2: return ['processor', 'ram', 'storage', 'gpu'];
    // ...cada versión con comportamiento distinto
  }
};
```

---

## 9. Resaltado de Diferencias - Variedad Visual

### Principio
Cada versión de "Resaltado de Diferencias" debe usar un **mecanismo visual distinto** para ser claramente diferenciable.

### Implementación Actual (6 versiones)

| Ver | Nombre | Mecanismo | Código |
|-----|--------|-----------|--------|
| V1 | Punto Amarillo | Punto pequeño junto al label | `<span className="w-2 h-2 rounded-full bg-amber-400" />` |
| V2 | Etiqueta "Diferente" | Chip con texto | `<span className="... text-[#4654CD] bg-[#4654CD]/10">Diferente</span>` |
| V3 | Badge "≠" | Badge con símbolo | `<span className="... text-[#4654CD]">≠</span>` |
| V4 | Fondo Gradiente | Gradiente en fila | `bg-gradient-to-r from-amber-100/60 to-transparent` |
| V5 | Subrayado Animado | Borde inferior pulsante | `border-b-2 border-amber-400 animate-pulse` |
| V6 | Icono Comparación | Icono lucide | `<ArrowLeftRight className="w-4 h-4 text-amber-500" />` |

### Lección Aprendida
- V2 y V3 usan color brand (`#4654CD`) para consistencia
- V1, V4, V5, V6 usan amber para indicar "diferencia/advertencia"

---

## 10. DisplayName Simplificado

### Problema
Los nombres de productos incluían información redundante que alargaba innecesariamente el texto.

### Antes
```typescript
displayName: `Laptop ${brand.name} ${displaySize}" para ${usages[i % usages.length][0]}`
// Resultado: "Laptop Lenovo 17.3" para estudios"
```

### Después
```typescript
displayName: `Laptop ${brand.name} ${displaySize}"`
// Resultado: "Laptop Lenovo 17.3""
```

### Razón
- El uso ("estudios", "gaming", etc.) ya está en otros campos del producto
- Nombres más cortos = mejor UX en cards y tablas de comparación

---

## 11. Próximos Pasos Sugeridos

### Para el Comparador
- [ ] Implementar persistencia de comparación (localStorage)
- [ ] Añadir export a PDF de comparación
- [ ] Integrar comparador desde catálogo (checkbox en ProductCard)
- [ ] Animaciones de entrada/salida con framer-motion

### Métricas a Implementar
- Productos más comparados
- Combinaciones frecuentes
- Tiempo promedio en comparador
- Conversión: comparador → solicitud

---

## 12. Referencias

- **Spec**: `.claude/docs/0.4/section-specs/PROMPT_05_COMPARADOR.md`
- **Código**: `src/app/prototipos/0.4/comparador/`
- **Preview**: `http://localhost:3000/prototipos/0.4/comparador`
- **Convenciones A/B**: `../CONVENTIONS.md` sección 10

---

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-12-21 | Versión inicial |
| 1.1 | 2025-12-21 | Eliminado selectionVersion, agregadas secciones 7-8 (verbos español, patrón A/B) |
| 1.2 | 2025-12-21 | Nuevas versiones de Resaltado de Diferencias: Punto, Etiqueta, Badge, Gradiente, Subrayado, Icono |
| 1.3 | 2025-12-22 | V2/V3 color brand, displayName simplificado, secciones 9-10 |
