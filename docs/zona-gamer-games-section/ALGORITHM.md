# Algoritmo de distribución de productos entre juegos

## Objetivo

Repartir los productos del catálogo entre los 5 juegos de forma **balanceada y determinística**:
- Ningún juego se queda sin laptops, ninguno se lleva todas
- Cada juego recibe un mix de gama (potentes + medias + entry)
- Mismo catálogo → misma distribución siempre (no aleatorio)
- Escala con cualquier cantidad de productos (15, 26, 30, 70...)

---

## Reglas

| Regla | Valor | Qué hace |
|---|---|---|
| `MIN_PER_GAME` | 3 | Objetivo de laptops por juego (cuando hay suficientes) |
| `MAX_PER_GAME` | 6 | Tope visible por juego (evita scroll infinito con catálogos grandes) |
| Sin productos | — | Ocultar la sección completa |
| Repetición | Solo si `n < num_juegos` | Una laptop solo se repite si hay menos productos que juegos |

---

## Cómo funciona (en simple)

1. Traer productos del catálogo
2. **Ordenar por potencia** (GPU + RAM, más potente primero)
3. **Repartir en ciclo** (round-robin): producto 1→Valorant, 2→CS2, 3→Dota, 4→Fortnite, 5→FC25, 6→Valorant...
4. Como están ordenados por potencia, cada juego recibe una potente, una media y una entry → **variedad de gama y precio en cada juego**
5. Respetar `MAX_PER_GAME` (6): si un juego llega a 6, se salta
6. Solo repetir productos si hay menos de 5 (cuando no alcanza ni para 1 por juego)

---

## Código (listo para usar)

```typescript
// Nombres de los juegos en orden (deben coincidir con GAMES)
const GAME_NAMES = ['Valorant', 'Counter-Strike 2', 'Dota 2', 'Fortnite', 'FC 25'];

const MIN_PER_GAME = 3;
const MAX_PER_GAME = 6;

interface CatalogProduct {
  slug: string;
  display_name: string;
  thumbnail_url: string;
  specs: { gpu?: string; ram?: number; storage?: number; storage_type?: string };
  pricing: { hook: { monthly_price: number } };
}

/** Extrae el número de modelo RTX para ordenar por potencia (5060 > 5050 > 4050 > 3050) */
function getGpuRank(gpu?: string): number {
  if (!gpu) return 0;
  const m = gpu.match(/RTX\s*(\d{4})/i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Distribuye productos del catálogo entre los juegos.
 * Retorna un Map: nombreJuego -> productos asignados.
 * Retorna null si no hay productos (la sección debe ocultarse).
 */
function distributeProductsToGames(
  products: CatalogProduct[]
): Record<string, CatalogProduct[]> | null {
  const n = products.length;
  const ng = GAME_NAMES.length;

  // Regla: sin productos -> ocultar sección
  if (n === 0) return null;

  // 1. Ordenar por potencia (GPU desc, luego RAM desc, luego precio asc, luego nombre)
  //    El orden determinístico garantiza misma distribución siempre.
  const sorted = [...products].sort((a, b) => {
    const gpuDiff = getGpuRank(b.specs?.gpu) - getGpuRank(a.specs?.gpu);
    if (gpuDiff !== 0) return gpuDiff;
    const ramDiff = (b.specs?.ram || 0) - (a.specs?.ram || 0);
    if (ramDiff !== 0) return ramDiff;
    const priceDiff = (a.pricing?.hook?.monthly_price || 0) - (b.pricing?.hook?.monthly_price || 0);
    if (priceDiff !== 0) return priceDiff;
    return a.slug.localeCompare(b.slug);
  });

  const assigned: Record<string, CatalogProduct[]> = {};
  GAME_NAMES.forEach((g) => { assigned[g] = []; });

  if (n >= ng) {
    // Caso normal: round-robin SIN repetición, respetando MAX_PER_GAME
    let i = 0;
    for (const product of sorted) {
      // Saltar juegos que ya llegaron al máximo
      let attempts = 0;
      while (assigned[GAME_NAMES[i % ng]].length >= MAX_PER_GAME && attempts < ng) {
        i++;
        attempts++;
      }
      if (attempts >= ng) break; // todos al máximo, parar
      assigned[GAME_NAMES[i % ng]].push(product);
      i++;
    }
  } else {
    // Caso extremo: menos productos que juegos -> repetir para no dejar ninguno vacío
    let idx = 0;
    for (let round = 0; round < MIN_PER_GAME; round++) {
      for (const game of GAME_NAMES) {
        assigned[game].push(sorted[idx % n]);
        idx++;
      }
    }
  }

  return assigned;
}

/** Construye el texto de specs desde un producto */
function buildSpecsText(product: CatalogProduct): string {
  const { gpu, ram, storage, storage_type } = product.specs || {};
  const gpuClean = (gpu || '').replace(/NVIDIA GeForce™?\s*/i, '');
  const parts = [gpuClean, ram ? `${ram}GB` : '', storage ? `${storage}GB ${storage_type || 'SSD'}` : ''];
  return parts.filter(Boolean).join(' · ');
}
```

---

## Uso en el componente

```typescript
const [productsByGame, setProductsByGame] = useState<Record<string, CatalogProduct[]> | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetch(`${API_BASE_URL}/public/landing/zona-gamer/products?limit=200`)
    .then((r) => r.json())
    .then((data) => {
      const distributed = distributeProductsToGames(data.items || []);
      setProductsByGame(distributed);
      setIsLoading(false);
    });
}, []);

// Render:
if (isLoading) return <GamesSkeleton />;
if (!productsByGame) return null; // sin productos -> sección oculta

// Para cada juego, leer sus productos:
GAMES.map((game) => {
  const laptops = productsByGame[game.name] || [];
  const minQuota = Math.min(...laptops.map((l) => l.pricing.hook.monthly_price));
  // render del juego con sus laptops...
});
```

---

## Resultado con data real (26 productos hoy)

| Juego | Laptops | Desde |
|---|---|---|
| Valorant | 6 | S/452 |
| Counter-Strike 2 | 5 | S/460 |
| Dota 2 | 5 | S/270 |
| Fortnite | 5 | S/293 |
| FC 25 | 5 | S/322 |

**Distribución: [6, 5, 5, 5, 5]** — diferencia máxima de 1 laptop. Cada juego con mix de gama.

---

## Comportamiento según tamaño del catálogo

| Productos | Distribución | Comportamiento |
|---|---|---|
| 0 | — | Sección oculta |
| 5 | [1,1,1,1,1] | 1 por juego, sin repetir |
| 10 | [2,2,2,2,2] | 2 por juego, sin repetir |
| 15 | [3,3,3,3,3] | 3 por juego (MIN alcanzado) |
| **26 (hoy)** | **[6,5,5,5,5]** | balanceado |
| 30 | [6,6,6,6,6] | tope MAX alcanzado |
| 70 | [6,6,6,6,6] | 40 no se muestran (tope MAX) |

Solo repite productos si hay **menos de 5** (caso casi imposible con el catálogo gamer).

---

## Por qué este enfoque

- **Determinístico:** mismo catálogo → mismo resultado. No usa `Math.random()`. Si se agrega un producto, se redistribuye solo de forma predecible.
- **Variedad de gama:** ordenar por potencia + round-robin reparte potentes/medias/entry entre todos los juegos. Ningún juego queda solo con las caras o solo con las baratas.
- **Escalable:** funciona igual con 15, 26, 30 o 70 productos sin tocar código.
- **Sin productos invisibles:** con el catálogo actual (26), las 26 laptops se muestran exactamente 1 vez.
