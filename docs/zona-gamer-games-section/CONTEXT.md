# Sección de Juegos — Contexto

## Componente

`src/app/prototipos/0.6/components/zona-gamer/GamerGamesRanking.tsx` (~440 líneas)

Renderiza un ranking vertical de los 5 juegos más populares. Cada fila: rank, ícono, nombre, género, barra de % animada. Al hacer clic en un juego → modal con las laptops recomendadas para ese juego. Al hacer clic en una laptop → navega a su detalle de producto.

Está montado en `ZonaGamerLanding.tsx` dentro de un `<LazySection>`.

---

## Estado actual: todo hardcoded

Tres constantes dentro del archivo:

### `GAMES` (líneas 63-104) — se mantiene PARCIALMENTE
Cada juego tiene metadata + un array `laptops` hardcodeado:
```typescript
const GAMES = [
  {
    name: 'Valorant', genre: 'FPS Táctico', pct: 35, bar: 92, color: '#ff2d55', iconIdx: 0,
    laptops: [  // ← ESTO se reemplaza por productos del catálogo
      { n: 'HP Victus 15 fb3013la', s: 'Ryzen 7 · 16GB · 144Hz', p: 'S/383/mes', slug: '...', img: '...' },
      // ...
    ],
  },
  // ... 4 juegos más
];
```

### `LAPTOP_IMG` (líneas 44-61) — se ELIMINA
Mapa hardcodeado de slug → URL de imagen. Ya no se necesita, las imágenes vienen del catálogo.

### `GAME_ICONS` (líneas 22-39) — se mantiene
SVGs inline de los íconos de cada juego.

---

## Qué cambia y qué se mantiene

| Elemento | Acción |
|---|---|
| `GAMES` — metadata (name, genre, pct, bar, color, iconIdx) | ✅ Se mantiene hardcoded |
| `GAMES` — array `laptops` de cada juego | 🔄 Se reemplaza por productos del catálogo |
| `LAPTOP_IMG` | ❌ Se elimina |
| `GAME_ICONS` | ✅ Se mantiene |
| Render del ranking (filas, barras, modal) | ✅ Se mantiene |
| Navegación a detalle de producto | ✅ Se mantiene (usa `slug` del producto real) |

---

## Endpoint

```
GET /api/v1/public/landing/zona-gamer/products?limit=200
```

Trae los ~26 productos en una sola llamada (`has_more: false`). Por defecto pagina a 12 — siempre pasar `limit=200`.

**Campos por producto:**
- `slug` → para navegar al detalle
- `display_name` → nombre a mostrar
- `thumbnail_url` → imagen
- `specs.gpu`, `specs.ram`, `specs.storage`, `specs.storage_type` → para el texto de specs
- `pricing.hook.monthly_price` → cuota mensual

---

## Cómo armar el texto de specs (campo `s`)

Hoy es editorial hardcoded ("sobra para Valorant"). Con productos reales, construirlo desde specs:
```typescript
const specsText = `${gpu} · ${ram}GB · ${storage}GB ${storageType}`;
// ej: "RTX 5060 · 16GB · 512GB SSD"
```

---

## Flujo nuevo

```
1. useEffect → fetch /public/landing/zona-gamer/products?limit=200
2. distributeProductsToGames(products) → asigna productos a cada juego (ver ALGORITHM.md)
3. Render: cada juego muestra sus productos asignados
4. Skeleton loader mientras carga (evita layout shift)
5. Si 0 productos → ocultar la sección completa
```

---

## En tiempo real

Como los datos vienen del catálogo:
- Si se agrega/quita un producto → la sección se actualiza sola
- Si cambia una cuota → se refleja al recargar
- Sin hardcodear precios ni laptops

---

## Cuando exista la landing NVIDIA

Cambiar el slug del endpoint de `zona-gamer` a `nvidia` cuando tenga productos cargados. Una sola línea.
