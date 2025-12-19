# CustomSwitch - Componente Switch Compatible con Tailwind v4

## Contexto

NextUI v2 (`@nextui-org/react`) **no es compatible con Tailwind CSS v4**. El componente `Switch` de NextUI no renderiza estilos ni animaciones correctamente porque las clases CSS no se generan con Tailwind v4.

**Solucion:** `CustomSwitch` - un componente propio que usa `framer-motion` para animaciones y clases de Tailwind puras.

---

## Ubicacion

```
src/app/prototipos/_shared/components/CustomSwitch.tsx
```

---

## Importacion

```tsx
import { CustomSwitch } from '@/app/prototipos/_shared/components/CustomSwitch';
```

---

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `defaultSelected` | `boolean` | `false` | Valor inicial (uncontrolled) |
| `isSelected` | `boolean` | - | Valor controlado externamente |
| `onValueChange` | `(value: boolean) => void` | - | Callback cuando cambia |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Tamano del switch |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Color cuando activo |
| `isDisabled` | `boolean` | `false` | Deshabilitar interaccion |
| `children` | `ReactNode` | - | Label del switch |
| `aria-label` | `string` | - | Label para accesibilidad |
| `className` | `string` | - | Clases adicionales |

---

## Colores del Brandbook

Los colores estan definidos segun el brandbook de BaldeCash:

```tsx
const colorConfig = {
  primary: 'bg-[#4654CD]',      // Brand primary
  secondary: 'bg-[#03DBD0]',    // Brand secondary/accent
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};
```

---

## Ejemplos de Uso

### 1. Uncontrolled (estado interno)

```tsx
// El switch maneja su propio estado
<CustomSwitch defaultSelected>
  Activar notificaciones
</CustomSwitch>
```

### 2. Controlled (estado externo)

```tsx
const [isActive, setIsActive] = useState(false);

<CustomSwitch
  isSelected={isActive}
  onValueChange={setIsActive}
>
  Modo oscuro
</CustomSwitch>
```

### 3. Sin label (solo aria-label)

```tsx
<CustomSwitch
  defaultSelected
  size="sm"
  color="primary"
  aria-label="Disponible ahora"
/>
```

### 4. Con onValueChange pero sin estado externo

```tsx
<CustomSwitch
  defaultSelected
  onValueChange={(val) => onChange({ availableNow: val })}
>
  Disponible ahora
</CustomSwitch>
```

### 5. Disabled

```tsx
<CustomSwitch isDisabled>
  Opcion deshabilitada
</CustomSwitch>
```

---

## Migracion desde NextUI Switch

### Antes (NextUI - NO FUNCIONA con Tailwind v4)

```tsx
import { Switch } from '@nextui-org/react';

<Switch
  size="sm"
  isSelected={value}
  onValueChange={setValue}
  classNames={{
    wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
    thumb: 'bg-white shadow-md',
  }}
/>
```

### Despues (CustomSwitch)

```tsx
import { CustomSwitch } from '@/app/prototipos/_shared/components/CustomSwitch';

<CustomSwitch
  size="sm"
  color="primary"
  isSelected={value}
  onValueChange={setValue}
>
  Label opcional
</CustomSwitch>
```

---

## Archivos Actualizados

Los siguientes archivos fueron migrados de `Switch` de NextUI a `CustomSwitch`:

1. `src/app/prototipos/0.3/catalogo/components/catalog/filters/CommercialFilters.tsx`
2. `src/app/prototipos/0.3/catalogo/components/catalog/filters/TechnicalFilters.tsx`
3. `src/app/prototipos/0.3/comparador/components/comparator/layout/ComparatorLayoutV1.tsx`
4. `src/app/prototipos/0.3/comparador/components/comparator/layout/ComparatorLayoutV2.tsx`
5. `src/app/prototipos/0.3/comparador/components/comparator/layout/ComparatorLayoutV3.tsx`
6. `src/app/prototipos/0.3/upsell/components/upsell/accessories/AccessoryCardV2.tsx`

---

## Demo

Pagina de demo disponible en:

```
/prototipos/0.3/switch-demo/
```

---

## Notas Tecnicas

- Usa `framer-motion` para animaciones spring suaves
- Soporte completo para accesibilidad (`role="switch"`, `aria-checked`)
- Compatible con Tailwind CSS v4
- No requiere configuracion de plugins adicionales
