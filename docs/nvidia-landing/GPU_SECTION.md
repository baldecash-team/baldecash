# Landing NVIDIA — Sección "La laptop ideal para cada GeForce RTX"

Sección dinámica que muestra laptops agrupadas por modelo de GPU con tabs para filtrar.

---

## Endpoint

```
GET /api/v1/public/landing/zona-gamer/products?limit=200
```

- **Por ahora apunta a zona-gamer** — 27 productos con GPU NVIDIA RTX
- Cuando los productos estén cargados en la landing nvidia, cambiar `zona-gamer` → `nvidia`
- Por defecto pagina a 12 — siempre pasar `limit=200` para traer todo de una sola llamada
- `has_more: false` con `limit=200` — no hay que paginar

**Campos disponibles en la respuesta:**
- `specs.gpu` → string del modelo GPU (ej: `"NVIDIA GeForce™ RTX 3050"`)
- `specs.ram` → número en GB
- `specs.storage` → número en GB
- `specs.storage_type` → string (ej: `"SSD"`)
- `pricing.hook.monthly_price` → cuota mensual
- `thumbnail_url` → imagen del producto
- `display_name` → nombre completo con specs

---

## Utilidad de parsing — ya existe

`utils/nvidiaGpu.ts` tiene `parseNvidiaModel()` listo para usar:

```typescript
import { parseNvidiaModel } from '@/app/prototipos/0.6/utils/nvidiaGpu';

parseNvidiaModel("NVIDIA GeForce™ RTX 3050")
// → { family: 'RTX', model: '3050' }

parseNvidiaModel("NVIDIA GeForce RTX 4070 Ti")
// → { family: 'RTX', model: '4070 Ti' }
```

---

## Lógica de agrupación en frontend

```typescript
import { parseNvidiaModel } from '@/app/prototipos/0.6/utils/nvidiaGpu';

interface GpuGroup {
  key: string;          // 'RTX 3050'
  family: string;       // 'RTX'
  model: string;        // '3050'
  series: string;       // 'Serie 30'
  productCount: number;
  minQuota: number;
  products: CatalogProduct[];
}

// Agrupar una sola vez tras la llamada
const groups = products.reduce((acc, product) => {
  const gpu = product.specs?.gpu;
  if (!gpu) return acc;
  const parsed = parseNvidiaModel(gpu);
  if (!parsed) return acc;
  const key = `${parsed.family} ${parsed.model}`;
  if (!acc[key]) acc[key] = {
    key,
    family: parsed.family,
    model: parsed.model,
    series: `Serie ${parsed.model.slice(0, 2)}0`, // '3050' → 'Serie 30'
    productCount: 0,
    minQuota: Infinity,
    products: [],
  };
  acc[key].products.push(product);
  acc[key].productCount++;
  const quota = product.pricing?.hook?.monthly_price;
  if (quota) acc[key].minQuota = Math.min(acc[key].minQuota, quota);
  return acc;
}, {} as Record<string, GpuGroup>);

// Ordenar por modelo (3050 < 4050 < 4060 < 5060)
const sortedGroups = Object.values(groups).sort((a, b) =>
  parseInt(a.model) - parseInt(b.model)
);
```

---

## Imágenes de los chips GPU

No existen en el proyecto. Silvana debe conseguirlas y subirlas a:

```
https://baldecash.s3.amazonaws.com/nvidia/chips/rtx-3050.png
https://baldecash.s3.amazonaws.com/nvidia/chips/rtx-4050.png
https://baldecash.s3.amazonaws.com/nvidia/chips/rtx-4060.png
https://baldecash.s3.amazonaws.com/nvidia/chips/rtx-4070.png
https://baldecash.s3.amazonaws.com/nvidia/chips/rtx-5050.png
https://baldecash.s3.amazonaws.com/nvidia/chips/rtx-5060.png
```

O como assets estáticos en `public/images/nvidia/chips/`.

---

## Skeleton loader mientras carga

La sección debe mostrar un skeleton mientras se hace el fetch para evitar layout shift:

```typescript
{isLoading ? (
  <GpuSectionSkeleton />  // placeholder con misma altura
) : (
  <GpuSection groups={sortedGroups} />
)}
```
