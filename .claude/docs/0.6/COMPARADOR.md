# Comparador v0.6 - Documentación Técnica

## Índice

1. [Resumen](#resumen)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Algoritmo "Ver Mejor Opción"](#algoritmo-ver-mejor-opción)
4. [Specs Comparados](#specs-comparados)
5. [Funciones Clave](#funciones-clave)
6. [Diferencia de Precio](#diferencia-de-precio)
7. [Configuración](#configuración)
8. [Cambios respecto a v0.5](#cambios-respecto-a-v05)

---

## Resumen

El comparador permite evaluar hasta 3 productos lado a lado. La funcionalidad "Ver mejor opción" determina el **mejor equipo técnicamente**, priorizando capacidad, procesador, gráficos y otras specs técnicas. El precio **no** participa en el scoring — solo entra como desempate.

---

## Estructura de Archivos

```
src/app/prototipos/0.6/[landing]/catalogo/
├── types/
│   └── comparator.ts          # Tipos, config, helpers, algoritmo de scoring
├── components/
│   └── comparator/
│       ├── ComparatorV1.tsx    # Modal Fullscreen
│       ├── ComparatorV2.tsx    # Panel Inline
│       └── ...
```

---

## Algoritmo "Ver Mejor Opción"

### Principio

> **"Mejor opción" = mejor equipo técnicamente.** El precio solo desempata.

### Flujo

1. **`compareSpecs(products)`** genera un array de `ComparableSpec[]` con los valores de cada spec para cada producto.
2. Para cada spec, **`findWinner(rawValues, higherIsBetter)`** determina el ganador:
   - Si `higherIsBetter === true`: gana el valor **más alto**.
   - Si `higherIsBetter === false`: gana el valor **más bajo** (ej: peso).
   - Si hay **empate** (2+ productos con el mismo mejor valor): `winner = undefined` (no se cuenta).
3. **`countProductWins(specs, productIndex)`** cuenta las victorias **técnicas** de cada producto:
   - Solo cuenta specs donde `isDifferent === true` (hay diferencia real entre productos).
   - Solo cuenta specs donde `winner === productIndex`.
   - **Excluye `category === 'price'`** (precio y cuota mensual no cuentan como victoria técnica).
4. El producto con más victorias técnicas es la "mejor opción".
5. **Desempate:** Si dos productos tienen el mismo número de victorias técnicas, gana el de **menor cuota mensual** (`getDisplayQuota`).

### Ejemplo

| Spec | Producto A | Producto B | Ganador |
|------|-----------|-----------|---------|
| Procesador (i7 vs i5) | 7 | 5 | A |
| RAM (16GB vs 16GB) | 16 | 16 | Empate |
| Almacenamiento (512 vs 256) | 512 | 256 | A |
| Pantalla (15.6" vs 14") | 15.6 | 14 | A |
| Resolución (FHD vs FHD) | 2 | 2 | Empate |
| GPU (dedicada vs integrada) | 2 | 1 | A |
| Peso (2.1kg vs 1.6kg) | 2.1 | 1.6 | B |
| Batería (8hrs vs 10hrs) | 8 | 10 | B |
| Precio (S/3,499 vs S/2,899) | — | — | **No cuenta** |
| Cuota (S/216 vs S/109) | — | — | **No cuenta** |

**Resultado:** A = 4 victorias, B = 2 victorias → **Producto A es mejor opción.**

---

## Specs Comparados

### Specs Técnicos (participan en scoring)

| Key | Label | Categoría | higherIsBetter | Cómo se evalúa |
|-----|-------|-----------|----------------|-----------------|
| `processor` | Procesador | performance | true | Tier map: M4=11, M3 Pro=10, i9/Ryzen9/M3=9, M2=8, i7/Ryzen7=7, M1=6, i5/Ryzen5=5, i3/Ryzen3=3, otro=1 |
| `ram` | Memoria RAM | performance | true | `specs.ram.size` en GB |
| `gpu` | Gráficos | performance | true | dedicated + vram/100 (ej: RTX 4060 8GB = 2.08), integrated = 1, sin GPU = 0 |
| `storage` | Almacenamiento | storage | true | `specs.storage.size` en GB |
| `displaySize` | Tamaño Pantalla | display | true | `specs.display.size` en pulgadas |
| `resolution` | Resolución | display | true | 4k=4, qhd=3, fhd=2, hd=1 |
| `weight` | Peso | features | false | `specs.dimensions.weight` en kg (menor es mejor) |
| `battery` | Batería | features | true | Horas de vida parseadas de `specs.battery.life` |

### Specs de Precio (NO participan en scoring)

| Key | Label | Categoría | higherIsBetter | Nota |
|-----|-------|-----------|----------------|------|
| `price` | Precio | price | false | Solo informativo, no cuenta como victoria |
| `quota` | Cuota Mensual | price | false | Calculada con `getDisplayQuota()` — solo desempata |

---

## Arquitectura: Sistema Declarativo de Specs

El comparador usa un sistema declarativo donde cada spec se define como un objeto `SpecDefinition`:

```typescript
interface SpecDefinition {
  key: string;
  label: string;
  category: SpecCategory;
  unit?: string;
  higherIsBetter: boolean;
  extract: (p: ComparisonProduct) => number;  // Extrae valor numérico para ranking
  format: (p: ComparisonProduct) => string;   // Formato de display (ej: "16GB")
}
```

**Para agregar un nuevo spec**, solo hay que agregar un objeto al array `specDefinitions`. No se toca `compareSpecs`, `buildSpec`, ni `findWinner`.

Los rankings ordinales (procesador, resolución) usan tier maps configurables:
- `PROCESSOR_TIERS` — mapea strings como 'i7', 'ryzen 5', 'm3 pro' a scores numéricos
- `RESOLUTION_TIERS` — mapea 'fhd', 'qhd', '4k' a scores

Para GPUs, el score es continuo: `dedicated = 2 + vram/100`, lo que permite diferenciar RTX 4060 8GB (2.08) de GTX 1650 4GB (2.04).

---

## Funciones Clave

Todas en `types/comparator.ts`:

### `compareSpecs(products: ComparisonProduct[]): ComparableSpec[]`
Itera sobre `specDefinitions` y llama `buildSpec()` para cada una. Requiere mínimo 2 productos.

### `buildSpec(products, def): ComparableSpec`
Función genérica que construye un `ComparableSpec` a partir de cualquier `SpecDefinition`:
- Llama `def.extract()` para obtener `rawValues` numéricos.
- Llama `def.format()` para obtener `values` de display.
- Determina `winner` via `findWinner()`.
- Calcula `isDifferent` comparando valores normalizados.

### `findWinner(rawValues: number[], higherIsBetter: boolean): number | undefined`
- Encuentra el mejor valor según `higherIsBetter`.
- Si hay empate (2+ productos con el mejor valor), retorna `undefined`.
- Si hay un solo ganador, retorna su índice.

### `countProductWins(specs: ComparableSpec[], productIndex: number): number`
- Filtra specs con `isDifferent === true` y `winner === productIndex`.
- **Excluye `spec.category !== 'price'`** — esta es la regla clave de v0.6.
- Retorna el conteo de victorias técnicas.

### `getDisplayQuota(product: CatalogProduct): number`
- Retorna `product.quotaMonthly` (calculado por el backend con amortización francesa).
- Se usa para desempate y para display en el comparador.

### `calculatePriceDifference(products)`
- Calcula diferencias absolutas de precio y cuota respecto al más económico.
- Calcula ahorro anual: `(maxQuota - minQuota) * 12`.

---

## Diferencia de Precio

Dos versiones configurables (`priceDiffVersion`):

| Versión | Nombre | Lógica |
|---------|--------|--------|
| V1 | Diferencia Relativa | `+S/XX` relativo al producto más económico |
| V2 | Ahorro Anual | `(maxQuota - minQuota) * 12` |

---

## Configuración

```typescript
interface ComparatorConfig {
  layoutVersion: 1 | 2;      // Modal Fullscreen | Panel Inline
  designStyle: 1 | 2 | 3;    // Columnas Fijas | Cards | Hero del Ganador
  highlightVersion: 1 | 2;   // Semántico Clásico | Barras Proporcionales
  fieldsVersion: 1 | 2;      // Specs Principales | Completo
  priceDiffVersion: 1 | 2;   // Diferencia Relativa | Ahorro Anual
  defaultTerm: TermMonths;
  defaultInitial: InitialPaymentPercent;
}
```

Máximo de productos: **3** (`MAX_COMPARE_PRODUCTS`).

---

## Cambios respecto a v0.5

| Aspecto | v0.5 | v0.6 |
|---------|------|------|
| Arquitectura | `compareSpecs()` monolítica (~170 líneas, copiar/pegar por spec) | **Sistema declarativo** con `specDefinitions[]` + `buildSpec()` genérico |
| Scoring "Ver mejor opción" | Contaba todas las victorias incluyendo precio/cuota | **Excluye categoría `price`** del conteo — solo specs técnicos |
| Procesadores | Solo Intel/AMD (i3-i9, Ryzen 3-9) | **+ Apple Silicon** (M1=6, M2=8, M3=9, M3 Pro=10, M4=11) |
| GPU | Binario: dedicated=2, integrated=1 | **Continuo**: dedicated + vram/100, diferencia GPUs por VRAM |
| Resolución | Solo fhd, qhd, 4k | **+ hd** (tier completo) |
| Desempate | No documentado | **Menor cuota mensual** gana si empate en victorias técnicas |
| Cuota mensual | Fórmula aproximada en filtros | **Amortización francesa exacta** calculada por backend |
| Agregar nuevo spec | Copiar ~15 líneas de código repetitivo | Agregar 1 objeto a `specDefinitions[]` |

---

## Categorías de Specs

```typescript
const specCategories = {
  performance: { label: 'Rendimiento', specs: ['processor', 'ram', 'gpu'] },
  display:     { label: 'Pantalla',    specs: ['displaySize', 'resolution', 'displayType', 'refreshRate'] },
  storage:     { label: 'Almacenamiento', specs: ['storage', 'storageType'] },
  connectivity:{ label: 'Conectividad', specs: ['wifi', 'bluetooth', 'ports'] },
  features:    { label: 'Características', specs: ['keyboard', 'security', 'battery', 'weight'] },
  price:       { label: 'Precio',       specs: ['price', 'quota', 'discount'] },  // NO cuenta en scoring
};
```
