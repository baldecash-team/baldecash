# PROMPT 02 - Catálogo v0.5

> Sección con configuración mayormente fija, basada en la versión de presentación de v0.4.
> Solo el **selector de color** tiene 2 versiones iterables.

---

## Configuración Base (FIJA)

Estos valores son fijos y no se iteran. Provienen de la URL de presentación v0.4:

```
/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=2&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1&pricingoptions=false
```

| Componente | Valor | Versión | Descripción |
|------------|-------|---------|-------------|
| Layout | `layout=4` | V4 | Quick Cards + Sidebar |
| Filtro de Marca | `brand=3` | V3 | Grid de Logos |
| Card | `card=6` | V6 | Centrado Impacto |
| Filtros Técnicos | `techfilters=3` | V3 | Cards con Iconos |
| Columnas Desktop | `cols=4` | 4 | 4 columnas en desktop |
| Skeleton | `skeleton=2` | V2 | Progress Bar |
| Duración Loading | `duration=default` | Default | 800ms |
| Load More | `loadmore=3` | V3 | Gradient CTA |
| Galería | `gallery=2` | V2 | Thumbnails |
| Tamaño Galería | `gallerysize=3` | V3 | Expanded |
| Tags | `tags=1` | V1 | Chips Apilados |
| Opciones de Precio | `pricingoptions=false` | Off | Sin selector de plazo/inicial |

---

## Componente Iterable: Selector de Color [ITERAR - 2 versiones]

El único componente con versiones en v0.5 es el **selector de color** dentro de cada card de producto.

### V1 - Dots (Círculos Compactos)

```
┌─────────────────────────────────┐
│  [Imagen del Producto]          │
│                                 │
│  ● ● ● ● ○                      │  ← Dots pequeños (8-12px)
│                                 │
│  MacBook Air M2                 │
│  S/89/mes                       │
└─────────────────────────────────┘
```

**Características:**
- Círculos pequeños (8-12px diámetro)
- Hover: muestra tooltip con nombre del color
- Seleccionado: borde o escala ligeramente mayor
- Máximo visible: 5 dots + "+N" si hay más
- Click: cambia imagen del producto al color seleccionado

**Implementación:**
```tsx
<div className="flex items-center gap-1.5">
  {colors.slice(0, 5).map((color) => (
    <button
      key={color.id}
      className={`
        w-3 h-3 rounded-full border transition-transform
        ${selected === color.id
          ? 'border-[#4654CD] scale-125'
          : 'border-neutral-300 hover:scale-110'}
      `}
      style={{ backgroundColor: color.hex }}
      title={color.name}
      onClick={() => onColorSelect(color.id)}
    />
  ))}
  {colors.length > 5 && (
    <span className="text-xs text-neutral-500">+{colors.length - 5}</span>
  )}
</div>
```

### V2 - Swatches (Muestras Grandes)

```
┌─────────────────────────────────┐
│  [Imagen del Producto]          │
│                                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐           │  ← Swatches (24-32px)
│  │  │ │  │ │  │ │  │           │
│  └──┘ └──┘ └──┘ └──┘           │
│                                 │
│  MacBook Air M2 - Space Gray    │  ← Muestra nombre del color
│  S/89/mes                       │
└─────────────────────────────────┘
```

**Características:**
- Cuadrados o rectángulos redondeados (24-32px)
- Muestra nombre del color seleccionado debajo o al lado
- Seleccionado: borde prominente + checkmark interno
- Todos visibles (scroll horizontal si necesario)
- Click: cambia imagen y muestra nombre

**Implementación:**
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2 overflow-x-auto">
    {colors.map((color) => (
      <button
        key={color.id}
        className={`
          w-7 h-7 rounded-md border-2 transition-all flex-shrink-0
          flex items-center justify-center
          ${selected === color.id
            ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
            : 'border-neutral-200 hover:border-neutral-400'}
        `}
        style={{ backgroundColor: color.hex }}
        onClick={() => onColorSelect(color.id)}
      >
        {selected === color.id && (
          <Check className="w-4 h-4 text-white drop-shadow" />
        )}
      </button>
    ))}
  </div>
  <p className="text-xs text-neutral-600">{selectedColor.name}</p>
</div>
```

---

## Comparación de Versiones

| Aspecto | V1 - Dots | V2 - Swatches |
|---------|-----------|---------------|
| Tamaño | 8-12px | 24-32px |
| Forma | Círculos | Rectángulos redondeados |
| Nombre color | Tooltip (hover) | Texto visible |
| Indicador selección | Escala + borde | Checkmark + ring |
| Overflow | "+N" contador | Scroll horizontal |
| Espacio vertical | Mínimo | Mayor |
| Referencia | Apple Store | Nike, Uniqlo |

---

## Configuración del Catálogo v0.5

```typescript
// types/catalog.ts

export type ColorSelectorVersion = 1 | 2;

export interface CatalogConfig {
  // Configuración fija (no iterable)
  layoutVersion: 4;
  brandFilterVersion: 3;
  cardVersion: 6;
  technicalFiltersVersion: 3;
  columnsDesktop: 4;
  skeletonVersion: 2;
  loadingDuration: 'default';
  loadMoreVersion: 3;
  imageGalleryVersion: 2;
  gallerySizeVersion: 3;
  tagDisplayVersion: 1;
  showPricingOptions: false;

  // Configuración iterable
  colorSelectorVersion: ColorSelectorVersion;
}

export const defaultCatalogConfig: CatalogConfig = {
  // Fijos
  layoutVersion: 4,
  brandFilterVersion: 3,
  cardVersion: 6,
  technicalFiltersVersion: 3,
  columnsDesktop: 4,
  skeletonVersion: 2,
  loadingDuration: 'default',
  loadMoreVersion: 3,
  imageGalleryVersion: 2,
  gallerySizeVersion: 3,
  tagDisplayVersion: 1,
  showPricingOptions: false,

  // Iterable - default V1
  colorSelectorVersion: 1,
};

export const colorSelectorVersionLabels = {
  1: { name: 'Dots', description: 'Círculos compactos con tooltip' },
  2: { name: 'Swatches', description: 'Muestras grandes con nombre visible' },
};
```

---

## SettingsModal Simplificado

El modal solo tiene UNA opción configurable:

```tsx
<Modal ...>
  <ModalHeader>
    <Settings /> Configuración del Catálogo
  </ModalHeader>

  <ModalBody>
    <p className="text-sm text-neutral-600 mb-4 pb-4 border-b">
      Selecciona cómo mostrar las opciones de color en las cards.
    </p>

    {/* Selector de Color - única opción iterable */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-[#4654CD]" />
        <h3 className="font-semibold">Selector de Color</h3>
      </div>
      <RadioGroup
        value={config.colorSelectorVersion.toString()}
        onValueChange={(val) => onConfigChange({
          ...config,
          colorSelectorVersion: parseInt(val) as 1 | 2
        })}
      >
        {[1, 2].map((version) => (
          <Radio key={version} value={version.toString()} ...>
            V{version} - {colorSelectorVersionLabels[version].name}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  </ModalBody>

  <ModalFooter>
    <Button>Generar URL</Button>
    <Button>Restablecer</Button>
  </ModalFooter>
</Modal>
```

---

## URL Query Params

```
/prototipos/0.5/catalogo/catalog-preview?color=1&mode=clean
```

| Param | Valores | Default |
|-------|---------|---------|
| `color` | `1`, `2` | `1` |
| `mode` | `clean` | - |

Todos los demás valores son fijos y no aparecen en la URL.

---

## Checklist

- [ ] Configuración base fija aplicada
- [ ] ColorSelectorV1 (Dots) implementado
- [ ] ColorSelectorV2 (Swatches) implementado
- [ ] SettingsModal con única opción
- [ ] Query param `color` funcional
- [ ] `mode=clean` oculta controles
- [ ] Responsive: mobile, tablet, desktop
